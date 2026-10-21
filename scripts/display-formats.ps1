[CmdletBinding()]
param(
    [ValidateSet('Audit', 'Catalog', 'Matrix')][string]$Mode = 'Audit',
    [string[]]$Formats,
    [string]$FormatsJson,
    [string]$Snapshot = '2026-10-20',
    [string]$DataDirectory
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
if (-not $DataDirectory) { $DataDirectory = Join-Path $PSScriptRoot '../docs' }

function ConvertTo-DisplayFormat {
    param([string]$Value)
    if ($Value -notmatch '^\s*([1-9][0-9]*)\s*[xX]\s*([1-9][0-9]*)\s*$') {
        throw "Formato invalido '$Value'. Use largura x altura com inteiros positivos; proporcao nao e resolucao."
    }
    $width = [long]$Matches[1]
    $height = [long]$Matches[2]
    if ($width -gt [int]::MaxValue -or $height -gt [int]::MaxValue) {
        throw "Dimensoes fora do intervalo suportado: '$Value'."
    }
    $divisor = $width
    $remainder = $height
    while ($remainder -ne 0) {
        $next = $divisor % $remainder
        $divisor = $remainder
        $remainder = $next
    }
    $orientation = 'square'
    if ($width -gt $height) { $orientation = 'landscape' }
    if ($width -lt $height) { $orientation = 'portrait' }
    [pscustomobject][ordered]@{
        format = "${width}x${height}"
        width = [int]$width
        height = [int]$height
        ratio = $width / [double]$height
        fraction = ('{0}:{1}' -f ($width / $divisor), ($height / $divisor))
        orientation = $orientation
        pixels = $width * $height
    }
}

function Test-DisplayRatio {
    param([double]$Ratio, [string]$Rounded)
    if ($Rounded -notmatch '^[0-9]+,[0-9]{2}$') { return $false }
    $value = [double]::Parse($Rounded.Replace(',', '.'), [System.Globalization.CultureInfo]::InvariantCulture)
    return [math]::Abs($Ratio - $value) -le 0.0050000001
}

function Read-DisplayCsv {
    param([string]$Path, [string[]]$Headers)
    $rows = @(Import-Csv -LiteralPath $Path -Delimiter ';' -Encoding UTF8)
    if ($rows.Count -eq 0) { throw "CSV vazio: $Path" }
    $actual = @($rows[0].PSObject.Properties.Name)
    if (($actual -join '|') -cne ($Headers -join '|')) {
        throw "Cabecalho inesperado: $Path"
    }
    return ,$rows
}

function Get-DisplayCatalog {
    param([string]$Directory, [string]$Date)
    if ($Date -notmatch '^\d{4}-\d{2}-\d{2}$') { throw 'Snapshot deve usar AAAA-MM-DD.' }
    $definitions = [ordered]@{
        consolidated = @('layouts_formatos_consolidado', @('largura','altura','formato','areas_ativas','qtd_tenants','tenants'))
        tenants = @('layouts_formatos_por_tenant', @('tenant','largura','altura','formato','areas_ativas'))
        bands = @('layouts_faixas_e_pequenos', @('categoria','largura','altura','formato','proporcao_LxA','pixels','areas_ativas','qtd_tenants','tenants'))
        proportions = @('layouts_proporcoes', @('proporcao_LxA','nome','orientacao','areas_ativas','qtd_formatos','qtd_tenants','formatos [fracao exata] (areas)'))
    }
    $tables = @{}
    $sources = @()
    foreach ($name in $definitions.Keys) {
        $fileName = $definitions[$name][0] + '_PRODUCAO_' + $Date + '.csv'
        $path = Join-Path $Directory $fileName
        $tables[$name] = Read-DisplayCsv $path $definitions[$name][1]
        $sources += [pscustomobject]@{ file = $fileName; sha256 = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant(); rows = $tables[$name].Count }
    }
    $diagnostics = New-Object 'System.Collections.Generic.List[object]'
    $catalog = [ordered]@{}
    $tenantRows = @{}
    $tenantKeys = @{}
    $bandKeys = @{}
    $proportionKeys = @{}
    foreach ($name in @('consolidated', 'tenants', 'bands')) {
        $line = 1
        foreach ($row in $tables[$name]) {
            $line++
            try {
                $format = ConvertTo-DisplayFormat $row.formato
                if ($row.largura -cne [string]$format.width -or $row.altura -cne [string]$format.height) { throw 'Dimensoes divergem do campo formato.' }
                if ($row.areas_ativas -notmatch '^[1-9][0-9]*$') { throw 'areas_ativas deve ser inteiro positivo.' }
                if ($name -eq 'tenants') {
                    if ([string]::IsNullOrWhiteSpace($row.tenant)) { throw 'Tenant vazio.' }
                    $key = $row.tenant + '|' + $format.format
                    if ($tenantKeys.ContainsKey($key)) { throw 'Tenant/formato duplicado.' }
                    $tenantKeys[$key] = $true
                    if (-not $tenantRows.ContainsKey($format.format)) { $tenantRows[$format.format] = @() }
                    $tenantRows[$format.format] += $row
                } else {
                    $tenants = @($row.tenants.Split(','))
                    if ($row.qtd_tenants -notmatch '^[1-9][0-9]*$' -or @($tenants | Sort-Object -Unique).Count -ne [int]$row.qtd_tenants) { throw 'qtd_tenants diverge da lista de tenants.' }
                    if ($name -eq 'consolidated') {
                        if ($catalog.Contains($format.format)) { throw 'Resolucao duplicada no consolidado.' }
                        $format | Add-Member -NotePropertyMembers @{ areas = [long]$row.areas_ativas; tenants = $tenants; categories = @() }
                        $catalog[$format.format] = $format
                    } else {
                        if ($bandKeys.ContainsKey($format.format)) { throw 'Resolucao duplicada na tabela de faixas/pequenos.' }
                        $bandKeys[$format.format] = $row
                        if ($row.pixels -cne [string]$format.pixels) { throw 'Pixels divergem de largura x altura.' }
                        if (-not (Test-DisplayRatio $format.ratio $row.proporcao_LxA)) { throw 'Proporcao arredondada inconsistente.' }
                    }
                }
            } catch {
                $diagnostics.Add([pscustomobject]@{ table = $name; line = $line; format = $row.formato; message = $_.Exception.Message })
            }
        }
    }
    foreach ($key in $tenantRows.Keys) {
        if (-not $catalog.Contains($key)) { $diagnostics.Add([pscustomobject]@{ table = 'tenants'; format = $key; message = 'Formato ausente no consolidado.' }) }
    }
    foreach ($key in $catalog.Keys) {
        $item = $catalog[$key]
        $rows = @()
        if ($tenantRows.ContainsKey($key)) { $rows = @($tenantRows[$key]) }
        $sum = ($rows | Measure-Object -Property areas_ativas -Sum).Sum
        $names = @($rows | ForEach-Object { $_.tenant } | Sort-Object -Unique)
        if ($sum -ne $item.areas -or ($names -join ',') -cne (($item.tenants | Sort-Object) -join ',')) {
            $diagnostics.Add([pscustomobject]@{ table = 'consolidated'; format = $key; message = 'Areas ou tenants divergem da tabela por tenant.' })
        }
    }
    foreach ($key in $bandKeys.Keys) {
        $row = $bandKeys[$key]
        if (-not $catalog.Contains($key)) {
            $diagnostics.Add([pscustomobject]@{ table = 'bands'; format = $key; message = 'Formato ausente no consolidado.' })
        } else {
            $item = $catalog[$key]
            $item.categories = @($row.categoria)
            if ([long]$row.areas_ativas -ne $item.areas -or (($row.tenants.Split(',') | Sort-Object) -join ',') -cne (($item.tenants | Sort-Object) -join ',')) {
                $diagnostics.Add([pscustomobject]@{ table = 'bands'; format = $key; message = 'Areas ou tenants divergem do consolidado.' })
            }
        }
    }
    $line = 1
    foreach ($row in $tables.proportions) {
        $line++
        try {
            $members = @([regex]::Matches($row.'formatos [fracao exata] (areas)', '(\d+x\d+) \[([0-9]+:[0-9]+)\] \(([0-9]+)\)'))
            if ($members.Count -eq 0 -or ($members | ForEach-Object { $_.Value }) -join ', ' -cne $row.'formatos [fracao exata] (areas)') { throw 'Lista de formatos malformada.' }
            $sum = 0L
            $names = @()
            foreach ($member in $members) {
                $key = $member.Groups[1].Value
                if ($proportionKeys.ContainsKey($key)) { throw "Formato repetido nas proporcoes: $key" }
                $proportionKeys[$key] = $true
                if (-not $catalog.Contains($key)) { throw "Formato ausente no consolidado: $key" }
                $item = $catalog[$key]
                $orientation = @{ landscape = 'horizontal'; portrait = 'vertical'; square = 'quadrado' }[$item.orientation]
                if (-not (Test-DisplayRatio $item.ratio $row.proporcao_LxA) -or $item.fraction -cne $member.Groups[2].Value -or $item.areas -ne [long]$member.Groups[3].Value -or $orientation -cne $row.orientacao) { throw "Proporcao, fracao, orientacao ou areas inconsistentes: $key" }
                $sum += $item.areas
                $names += $item.tenants
            }
            if ($sum -ne [long]$row.areas_ativas -or $members.Count -ne [int]$row.qtd_formatos -or @($names | Sort-Object -Unique).Count -ne [int]$row.qtd_tenants) { throw 'Totais da familia de proporcoes inconsistentes.' }
        } catch {
            $diagnostics.Add([pscustomobject]@{ table = 'proportions'; line = $line; format = $row.proporcao_LxA; message = $_.Exception.Message })
        }
    }
    foreach ($key in $catalog.Keys) {
        if (-not $proportionKeys.ContainsKey($key)) { $diagnostics.Add([pscustomobject]@{ table = 'proportions'; format = $key; message = 'Formato nao coberto na tabela de proporcoes.' }) }
    }
    [pscustomobject][ordered]@{
        schemaVersion = 1
        snapshot = $Date
        sources = $sources
        formats = @($catalog.Values)
        diagnostics = @($diagnostics.ToArray())
    }
}

function Select-DisplayMatrix {
    param($Catalog, [AllowNull()][AllowEmptyCollection()][object]$RequestedFormats)
    $explicit = $null -ne $RequestedFormats
    if ($explicit -and ($RequestedFormats -isnot [string] -and $RequestedFormats -isnot [array])) { throw 'Formatos devem ser uma resolucao ou array de resolucoes.' }
    $requested = @($RequestedFormats)
    if (-not $explicit) { $requested = @($Catalog.formats | ForEach-Object { $_.format }) }
    if ($requested.Count -eq 0) { throw 'Lista de formatos vazia; nao sera substituida pelo catalogo.' }
    $known = @{}
    foreach ($item in $Catalog.formats) { $known[$item.format] = $true }
    $seen = @{}
    $selected = @()
    foreach ($value in $requested) {
        if ($value -isnot [string]) { throw 'Cada formato deve ser uma string largura x altura.' }
        $item = ConvertTo-DisplayFormat $value
        if ($seen.ContainsKey($item.format)) { continue }
        $seen[$item.format] = $true
        $item | Add-Member -NotePropertyMembers @{ inCatalog = $known.ContainsKey($item.format); status = 'not_run' }
        $selected += $item
    }
    [pscustomobject][ordered]@{
        schemaVersion = 1
        scope = $(if ($explicit) { 'explicit' } else { 'catalog' })
        snapshot = $Catalog.snapshot
        sources = $Catalog.sources
        expected = $selected.Count
        formats = $selected
        diagnostics = $Catalog.diagnostics
    }
}

if ($MyInvocation.InvocationName -ne '.') {
    try {
        if ($PSBoundParameters.ContainsKey('Formats') -and $PSBoundParameters.ContainsKey('FormatsJson')) { throw 'Use Formats ou FormatsJson, nao ambos.' }
        $requested = $null
        if ($PSBoundParameters.ContainsKey('Formats')) { $requested = $Formats }
        if ($PSBoundParameters.ContainsKey('FormatsJson')) {
            if (-not $FormatsJson.Trim().StartsWith('[')) { throw 'FormatsJson deve ser um array JSON.' }
            $requested = ConvertFrom-Json -InputObject $FormatsJson
            if ($null -eq $requested) { $requested = @() }
        }
        $catalog = Get-DisplayCatalog $DataDirectory $Snapshot
        $result = $catalog
        if ($Mode -eq 'Matrix') { $result = Select-DisplayMatrix $catalog $requested }
        if ($Mode -eq 'Audit') {
            $result = [pscustomobject]@{ snapshot = $catalog.snapshot; sources = $catalog.sources; formats = $catalog.formats.Count; areas = ($catalog.formats | Measure-Object -Property areas -Sum).Sum; diagnostics = $catalog.diagnostics }
        }
        $result | ConvertTo-Json -Depth 12
        if ($catalog.diagnostics.Count -gt 0) { exit 1 }
    } catch {
        [Console]::Error.WriteLine($_.Exception.Message)
        exit 2
    }
}