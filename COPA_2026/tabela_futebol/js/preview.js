/**
 * preview.js - Modo extranet (visualizacao no painel de gerenciamento)
 * ES5 obrigatorio
 */

function extranetView() {

    // ── Extrai dados do sponsor do formulario da extranet ──────────────────────
    function extractSponsorFromParent() {
        var parentRef = null;
        try { parentRef = window.parent; } catch (e) { parentRef = null; }
        if (!parentRef) { return null; }
        
        var parentData = null;
        try {
            if (typeof parentRef.getTemplatePreviewData === 'function') {
                parentData = parentRef.getTemplatePreviewData();
            } else if (parentRef.templatePreviewData) {
                parentData = parentRef.templatePreviewData;
            } else if (parentRef.TEMPLATE_PREVIEW_DATA) {
                parentData = parentRef.TEMPLATE_PREVIEW_DATA;
            }
        } catch (e) { parentData = null; }
        
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
            console.log('[tabela_futebol][preview] sponsor extraido: COLOR1=' + sponsor.COLOR1 + ' TEXT1=' + sponsor.TEXT1 + ' FILE_IMAGE1=' + (sponsor.FILE_IMAGE1 ? 'sim' : 'nao'));
            return sponsor;
        }
        
        return null;
    }

    // Extrair sponsor do formulario da extranet
    var spdSponsor = extractSponsorFromParent();
    
    // Aplicar cores do sponsor (se existirem) ou cores padrao
    var cores = mergeColorsFromSpd(CONFIG, spdSponsor);
    aplicarCores(cores);

    // No modo preview, exibe o primeiro grupo do mock (se disponivel)
    // ou tenta carregar D_STANDINGS via EBHTML
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled && MOCK_DATA.grupos && MOCK_DATA.grupos.length > 0) {
        var previewLoader = {
            loaded: function() {},
            finished: function() {}
        };
        
        // Mock: tentar extrair sponsor do MOCK_DATA se nao vier do formulario
        if (!spdSponsor && MOCK_DATA.D_SPD) {
            for (var i = 0; i < MOCK_DATA.D_SPD.length; i++) {
                if (MOCK_DATA.D_SPD[i].CONFIG === '1') {
                    spdSponsor = MOCK_DATA.D_SPD[i];
                    break;
                }
            }
        }
        
        var duracao = (MOCK_DATA.config && MOCK_DATA.config.duration) || 12000;
        renderizarGrupo(MOCK_DATA.grupos[0], spdSponsor, previewLoader, duracao);
    } else {
        ebhtml.create2({}, function(loader) {
            loader.addData('D_STANDINGS', false);
            loader.autoloaded = false;
            loader.nodataiserror = false;

            loader.load(function() {
                var previewLoader = {
                    loaded: function() {},
                    finished: function() {}
                };

                if (loader.data('D_STANDINGS') == undefined) {
                    console.warn('[preview] Sem dados D_STANDINGS');
                    return;
                }

                var grupo = extrairGrupo(loader);
                renderizarGrupo(grupo, spdSponsor, previewLoader, 0);
            });
        });
    }
}
