/**
 * preview.js - Caminhos Futebol
 * Modo preview (extranet EdgeContents).
 *
 * extranetView() e definida no escopo global e chamada pelo inline script
 * no final do body quando o template esta sendo exibido na extranet.
 *
 * Comportamento:
 *   - Exibe o template no estado pre-jogo usando dados do formulario da extranet
 *   - Nunca chama finished() para manter o template visivel na tela
 *   - Prioridade de dados: frame pai > mock local > EBHTML D_FOOTBALL
 *
 * ES5 obrigatorio (Android 7+ WebKit)
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
    var mockConfig = { duration: 30000, sponsor: null };

    if (previewData && previewData.D_FOOTBALL) {
        try { partidas = JSON.parse(previewData.D_FOOTBALL.TEXTO3 || '[]'); } catch (e) { partidas = []; }
    } else if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.D_FOOTBALL) {
        try { partidas = JSON.parse(MOCK_DATA.D_FOOTBALL.TEXTO3 || '[]'); } catch (e2) { partidas = []; }
    }
    
    // Extrair sponsor do formulario da extranet
    spdSponsor = extractSponsorFromParent(previewData);
    
    // Fallback para mock se nao vier do formulario
    if (!spdSponsor) {
        if (previewData && previewData.D_SPD) {
            spdSponsor = previewData.D_SPD;
        } else if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.D_SPD) {
            spdSponsor = MOCK_DATA.D_SPD;
        }
    }
    
    if (spdSponsor) {
        mockConfig.sponsor = {
            frase: spdSponsor.TEXT1 || obterValorSpd(spdSponsor, 'TEXT1') || '',
            logo:  spdSponsor.IMAGE_LOGO || obterValorSpd(spdSponsor, 'IMAGE_LOGO') || '',
            intro: spdSponsor.FILE_IMAGE1 || obterValorSpd(spdSponsor, 'FILE_IMAGE1') || '',
            FILE_IMAGE1: spdSponsor.FILE_IMAGE1 || obterValorSpd(spdSponsor, 'FILE_IMAGE1') || '',
            introMaxMs: obterDuracaoIntroMs(spdSponsor)
        };
    }

    // Aplicar cores do sponsor (se existirem) ou cores padrao
    var cores = mergeColorsFromSpd(CONFIG, spdSponsor);
    aplicarCores(cores);
    
    var dados = processarDadosMock(partidas);
    iniciarTemplate(dados, mockConfig, getPreviewLoader());
}

function playerView() {
    // Player normal: nada muda
}
