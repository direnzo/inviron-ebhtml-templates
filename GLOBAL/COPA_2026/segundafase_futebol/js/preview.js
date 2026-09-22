/**
 * preview.js - Segunda Fase Futebol (extranet)
 * ES5 obrigatório
 *
 * Modo preview (extranet EdgeContents).
 * Mostra a primeira chave disponível (mais cedo no bracket).
 * 
 * Comportamento:
 *   - Extrai partidas do D_FOOTBALL.TEXTO3 (JSON stringificado)
 *   - Extrai sponsor: COLOR1/2/3, TEXT1/2, FILE_IMAGE1, IMAGE_LOGO
 *   - teamsMap vazio: preview não acessa D_FOOTBALL_TEAMS
 *   - Nunca chama finished() para manter o template visível na tela
 */

function extranetView() {
    aplicarCores(CONFIG);

    function getPreviewLoader(realLoader) {
        return {
            loaded: function() {
                if (realLoader && typeof realLoader.loaded === 'function') {
                    realLoader.loaded();
                }
            },
            finished: function() {
                // Preview não deve encerrar automaticamente na extranet.
            }
        };
    }

    // ── Extrai dados do sponsor do formulário da extranet ──────────────────────
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
            console.log('[segundafase_futebol][preview] sponsor extraido: COLOR1=' + sponsor.COLOR1 + ' TEXT1=' + sponsor.TEXT1);
            return sponsor;
        }
        
        return null;
    }

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

    var previewData = extractParentData();
    var partidas = [];
    var spdSponsor = null;
    var teamsMap = {}; // Vazio no preview (D_FOOTBALL_TEAMS não disponível na extranet)

    // 1. Extrair partidas do formulário (TEXTO3 do D_FOOTBALL)
    if (previewData && previewData.D_FOOTBALL && previewData.D_FOOTBALL.TEXTO3) {
        console.log('[segundafase_futebol][preview] usando D_FOOTBALL.TEXTO3 do formulario');
        try { 
            partidas = JSON.parse(previewData.D_FOOTBALL.TEXTO3); 
        } catch (e) { 
            console.error('[preview] Erro ao parsear TEXTO3:', e);
            partidas = []; 
        }
    } else if (previewData && previewData.partidas) {
        console.log('[segundafase_futebol][preview] usando partidas direto do formulario');
        partidas = previewData.partidas;
    } else if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.D_FOOTBALL && MOCK_DATA.D_FOOTBALL.TEXTO3) {
        console.log('[segundafase_futebol][preview] usando MOCK_DATA.D_FOOTBALL.TEXTO3');
        try { 
            partidas = JSON.parse(MOCK_DATA.D_FOOTBALL.TEXTO3); 
        } catch (e2) { 
            partidas = []; 
        }
    } else if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.partidas) {
        console.log('[segundafase_futebol][preview] usando MOCK_DATA.partidas');
        partidas = MOCK_DATA.partidas;
    }
    
    // 2. Extrair sponsor do formulário da extranet
    spdSponsor = extractSponsorFromParent(previewData);
    
    // Fallback para mock se não vier do formulário
    if (!spdSponsor) {
        if (previewData && previewData.D_SPD) {
            spdSponsor = previewData.D_SPD;
        } else if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.D_SPD) {
            spdSponsor = MOCK_DATA.D_SPD;
        }
    }

    var config = { sponsor: montarSponsorConfig(spdSponsor) };
    aplicarCores(mergeColorsFromSpd(CONFIG, spdSponsor));

    // 3. Processar dados com teamsMap vazio (preview não tem D_FOOTBALL_TEAMS)
    console.log('[segundafase_futebol][preview] processando ' + partidas.length + ' partidas');
    var dadosMap = processarDadosMock(partidas, teamsMap);
    var grupos   = agruparPorFase(dadosMap);
    var ordem    = montarOrdemChaves(grupos);

    if (ordem.length === 0) { 
        console.error('[segundafase_futebol][preview] sem chaves para exibir');
        return; 
    }
    
    console.log('[segundafase_futebol][preview] exibindo chave: fase=' + ordem[0].fase + ' idx=' + ordem[0].idx);
    renderizarChave(ordem[0], dadosMap, config, getPreviewLoader());
}

// playerView definido em master.js — não sobrescrever
// Apenas a lógica de preview (pré-visualização da extranet EdgeContents) deve entrar aqui
