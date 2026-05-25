/**
 * preview.js - Segunda Fase Futebol (extranet)
 * ES5 obrigatorio
 *
 * Mostra a primeira chave disponivel (mais cedo no bracket).
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
            finished: function() {}
        };
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
        return data || null;
    }

    var previewData = extractParentData();
    var partidas = [];
    var spdSponsor = null;

    if (previewData && previewData.D_FOOTBALL) {
        try { partidas = JSON.parse(previewData.D_FOOTBALL.TEXTO3 || '[]'); } catch (e) { partidas = []; }
    } else if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.D_FOOTBALL) {
        try { partidas = JSON.parse(MOCK_DATA.D_FOOTBALL.TEXTO3 || '[]'); } catch (e2) { partidas = []; }
    }
    if (previewData && previewData.D_SPD) {
        spdSponsor = previewData.D_SPD;
    } else if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.D_SPD) {
        spdSponsor = MOCK_DATA.D_SPD;
    }

    var config = { sponsor: montarSponsorConfig(spdSponsor) };
    aplicarCores(mergeColorsFromSpd(CONFIG, spdSponsor));

    var dadosMap = processarDadosMock(partidas);
    var grupos   = agruparPorFase(dadosMap);
    var ordem    = montarOrdemChaves(grupos);

    if (ordem.length === 0) { return; }
    renderizarChave(ordem[0], dadosMap, config, getPreviewLoader());
}

function playerView() {
    /* window.onload definido em master.js */
}
