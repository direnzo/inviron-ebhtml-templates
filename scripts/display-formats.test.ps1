$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'display-formats.ps1')

function Assert-Equal {
    param($Actual, $Expected, [string]$Message)
    if ($Actual -cne $Expected) { throw "$Message -- esperado: $Expected; recebido: $Actual" }
}

function Assert-Throws {
    param([scriptblock]$Action, [string]$Message)
    $failed = $false
    try { & $Action | Out-Null } catch { $failed = $true }
    if (-not $failed) { throw $Message }
}

$fixture = [pscustomobject]@{
    snapshot = '2026-10-20'
    sources = @()
    formats = @((ConvertTo-DisplayFormat '1920x1080'), (ConvertTo-DisplayFormat '1x1'), (ConvertTo-DisplayFormat '1080x1920'))
    diagnostics = @()
}
$all = Select-DisplayMatrix $fixture $null
Assert-Equal $all.scope 'catalog' 'Ausencia de lista usa catalogo'
Assert-Equal $all.expected 3 'Catalogo mantem inclusive 1x1'
$single = Select-DisplayMatrix $fixture '1920x1080'
Assert-Equal $single.expected 1 'Formato unico nao expande'
Assert-Equal $single.scope 'explicit' 'Origem explicita'
$multiple = Select-DisplayMatrix $fixture @('1080x1920', '1920x1080', '1080x1920')
Assert-Equal (($multiple.formats | ForEach-Object { $_.format }) -join ',') '1080x1920,1920x1080' 'Array preserva ordem e remove duplicatas'
$new = Select-DisplayMatrix $fixture @('1234x567')
Assert-Equal $new.expected 1 'Formato inedito aceito'
Assert-Equal $new.formats[0].inCatalog $false 'Formato inedito identificado'
Assert-Equal $new.formats[0].status 'not_run' 'Gerar matriz nao aprova formato'
Assert-Equal (ConvertTo-DisplayFormat ' 1920 X 1080 ').fraction '16:9' 'Normalizacao e fracao reduzida'
Assert-Equal (ConvertTo-DisplayFormat '1366x768').fraction '683:384' 'Nao confundir familia aproximada com fracao exata'
Assert-Equal (Test-DisplayRatio (1122 / 400) '2,81') $true 'Empate de arredondamento nao deve gerar falso positivo'
Assert-Equal (Test-DisplayRatio (1122 / 400) '2,70') $false 'Divergencia real de proporcao deve falhar'
$jsonFormats = ConvertFrom-Json -InputObject '["1920x1080","1080x1920"]'
Assert-Equal (Select-DisplayMatrix $fixture $jsonFormats).expected 2 'Array JSON nao deve ser encapsulado em outro array'
Assert-Throws { Select-DisplayMatrix $fixture @() } 'Array vazio deve falhar'
Assert-Throws { Select-DisplayMatrix $fixture @('16:9') } 'Proporcao nao define resolucao'
Assert-Throws { Select-DisplayMatrix $fixture @('0x1080') } 'Zero deve falhar'
Assert-Throws { Select-DisplayMatrix $fixture @('1.5x1080') } 'Dimensao fracionaria deve falhar'
Assert-Throws { Select-DisplayMatrix $fixture @('1920x1080', $null) } 'Item null deve falhar'
Assert-Throws { Select-DisplayMatrix $fixture @('2147483648x1080') } 'Overflow deve falhar'
Assert-Throws { Select-DisplayMatrix $fixture @{ format = '1920x1080' } } 'Objeto arbitrario deve falhar'
$catalog = Get-DisplayCatalog (Join-Path $PSScriptRoot '../docs') '2026-10-20'
if ($catalog.formats.Count -le 0) { throw 'Catalogo real vazio' }
Assert-Equal $catalog.diagnostics.Count 0 'Snapshot real consistente nas quatro tabelas'
Assert-Equal (Select-DisplayMatrix $catalog $null).expected $catalog.formats.Count 'Matriz integral cobre todo consolidado'
Assert-Equal (Select-DisplayMatrix $catalog @('1234x567')).expected 1 'Catalogo real nao amplia lista explicita'
$temporary = Join-Path ([System.IO.Path]::GetTempPath()) ('display-formats-' + [guid]::NewGuid().ToString('N'))
try {
    New-Item -ItemType Directory -Path $temporary | Out-Null
    foreach ($source in $catalog.sources) {
        Copy-Item -LiteralPath (Join-Path $PSScriptRoot ('../docs/' + $source.file)) -Destination $temporary
    }
    $consolidatedPath = Join-Path $temporary 'layouts_formatos_consolidado_PRODUCAO_2026-10-20.csv'
    $changedRows = @(Import-Csv -LiteralPath $consolidatedPath -Delimiter ';' -Encoding UTF8)
    $changedRows[0].areas_ativas = [string]([long]$changedRows[0].areas_ativas + 1)
    $changedRows | Export-Csv -LiteralPath $consolidatedPath -Delimiter ';' -Encoding UTF8 -NoTypeInformation
    $changed = Get-DisplayCatalog $temporary '2026-10-20'
    if ($changed.diagnostics.Count -eq 0) { throw 'Divergencia de totais nao detectada' }
    $changedRows += $changedRows[0]
    $changedRows | Export-Csv -LiteralPath $consolidatedPath -Delimiter ';' -Encoding UTF8 -NoTypeInformation
    $duplicate = Get-DisplayCatalog $temporary '2026-10-20'
    if (@($duplicate.diagnostics | Where-Object { $_.message -eq 'Resolucao duplicada no consolidado.' }).Count -ne 1) { throw 'Duplicata nao detectada' }
} finally {
    if (Test-Path -LiteralPath $temporary) { Remove-Item -LiteralPath $temporary -Recurse }
}
Write-Output ('PASS: contrato de formatos; catalogo real com {0} resolucoes e {1} diagnosticos.' -f $catalog.formats.Count, $catalog.diagnostics.Count)