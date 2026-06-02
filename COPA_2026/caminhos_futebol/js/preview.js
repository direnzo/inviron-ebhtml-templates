/**
 * preview.js - Caminhos Futebol
 * Modo preview (extranet EdgeContents).
 *
 * extranetView() é definida no escopo global e chamada pelo inline script
 * no final do body quando o template está sendo exibido na extranet.
 *
 * Comportamento:
 *   - Exibe o template com dados do formulário da extranet
 *   - Nunca chama finished() para manter o template visível na tela
 *   - Prioridade de dados: frame pai > mock local
 *   - teamsMap vazio: preview não tem D_FOOTBALL_TEAMS (nomes vêm direto do TEXTO3)
 *   - Extrai partidas do D_FOOTBALL.TEXTO3 (JSON stringificado)
 *   - Extrai sponsor do formulário (COLOR1/2/3, TEXT1/2, FILE_IMAGE1, IMAGE_LOGO)
 *
 * ES5 obrigatório (Android 7+ WebKit)
 */

function extranetView() {

    // ── Loader que suprime finished() para manter visivel na extranet ──────────
    function getPreviewLoader(realLoader) {
        return {
            loaded: function() {
                if (realLoader && typeof realLoader.loaded === 'function') {
                    realLoader.loaded();
                }
            },
            finished: function() {
                // Preview nao deve encerrar automaticamente na extranet.
            }
        };
    }

    // ── Extrai dados do sponsor do formulario da extranet ──────────────────────
    function extractSponsorFromParent(parentData) {
        if (!parentData) { return null; }
        
        var sponsor = {};
        var hasData = false;
        
        // Extrair campos do sponsor (CONFIG=1)
        var fields = ['COLOR1', 'COLOR2', 'COLOR3', 'FILE_IMAGE1', 'IMAGE_LOGO', 'TEXT1', 'TEXT2'];
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            if (parentData[field]) {
                sponsor[field] = parentData[field];
                hasData = true;
            }
        }
        
        if (hasData) {
            sponsor.CONFIG = '1';
            console.log('[caminhos_futebol][preview] sponsor extraido: COLOR1=' + sponsor.COLOR1 + ' TEXT1=' + sponsor.TEXT1 + ' FILE_IMAGE1=' + (sponsor.FILE_IMAGE1 ? 'sim' : 'nao'));
            return sponsor;
        }
        
        return null;
    }

    // ── Tenta extrair dados do formulario do frame pai (extranet) ──────────────
    function extractParentData() {
        var parentRef = null;
        var data = null;

        try { parentRef = window.parent; } catch (e) { parentRef = null; }
        if (!parentRef) { return null; }

        try {
            if (typeof parentRef.getTemplatePreviewData === 'function') {
                data = parentRef.getTemplatePreviewData();
            }
        } catch (e1) { data = null; }

        if (!data) {
            try {
                if (parentRef.templatePreviewData) { data = parentRef.templatePreviewData; }
            } catch (e2) { data = null; }
        }

        if (!data) {
            try {
                if (parentRef.TEMPLATE_PREVIEW_DATA) { data = parentRef.TEMPLATE_PREVIEW_DATA; }
            } catch (e3) { data = null; }
        }

        return data || null;
    }

    // ── Dados de preview ──────────────────────────────────────────────────────
    var previewData = extractParentData();
    var partidas = [];
    var spdSponsor = null;
    var teamsMap = {}; // Vazio no preview (D_FOOTBALL_TEAMS não disponível na extranet)
    var mockConfig = { duration: 30000, sponsor: null };

    // 1. Extrair partidas do formulário (TEXTO3 do D_FOOTBALL)
    if (previewData && previewData.D_FOOTBALL && previewData.D_FOOTBALL.TEXTO3) {
        console.log('[caminhos_futebol][preview] usando D_FOOTBALL.TEXTO3 do formulario');
        try { 
            partidas = JSON.parse(previewData.D_FOOTBALL.TEXTO3); 
        } catch (e) { 
            console.error('[preview] Erro ao parsear TEXTO3:', e);
            partidas = []; 
        }
    } else if (previewData && previewData.partidas) {
        // Fallback: aceita partidas direto
        console.log('[caminhos_futebol][preview] usando partidas direto do formulario');
        partidas = previewData.partidas;
    } else if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.D_FOOTBALL && MOCK_DATA.D_FOOTBALL.TEXTO3) {
        console.log('[caminhos_futebol][preview] usando MOCK_DATA.D_FOOTBALL.TEXTO3');
        try { 
            partidas = JSON.parse(MOCK_DATA.D_FOOTBALL.TEXTO3); 
        } catch (e2) { 
            partidas = []; 
        }
    } else if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.partidas) {
        console.log('[caminhos_futebol][preview] usando MOCK_DATA.partidas');
        partidas = MOCK_DATA.partidas;
    }
    
    // 2. Extrair sponsor do formulario da extranet
    spdSponsor = extractSponsorFromParent(previewData);
    
    // Fallback para mock se nao vier do formulario
    if (!spdSponsor) {
        if (previewData && previewData.D_SPD) {
            spdSponsor = previewData.D_SPD;
        } else if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.D_SPD) {
            spdSponsor = MOCK_DATA.D_SPD;
        }
    }
    
    // 3. Montar configuração do sponsor
    if (spdSponsor) {
        mockConfig.sponsor = {
            frase: spdSponsor.TEXT1 || obterValorSpd(spdSponsor, 'TEXT1') || '',
            logo:  spdSponsor.IMAGE_LOGO || obterValorSpd(spdSponsor, 'IMAGE_LOGO') || '',
            intro: spdSponsor.FILE_IMAGE1 || obterValorSpd(spdSponsor, 'FILE_IMAGE1') || '',
            FILE_IMAGE1: spdSponsor.FILE_IMAGE1 || obterValorSpd(spdSponsor, 'FILE_IMAGE1') || '',
            introMaxMs: obterDuracaoIntroMs(spdSponsor)
        };
        console.log('[caminhos_futebol][preview] sponsor configurado: ' + mockConfig.sponsor.frase);
    }

    // 4. Aplicar cores do sponsor (se existirem) ou cores padrao
    var cores = mergeColorsFromSpd(CONFIG, spdSponsor);
    aplicarCores(cores);
    
    // 5. Processar dados com teamsMap vazio (preview não tem D_FOOTBALL_TEAMS)
    console.log('[caminhos_futebol][preview] processando ' + partidas.length + ' partidas');
    var dados = processarDadosMock(partidas, teamsMap);
    iniciarTemplate(dados, mockConfig, getPreviewLoader());
}

function playerView() {
    // Player normal: nada muda
}
