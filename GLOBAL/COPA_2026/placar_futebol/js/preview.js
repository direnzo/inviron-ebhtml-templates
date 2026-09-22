/**
 * preview.js - Placar Futebol
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
            console.log('[placar_futebol][preview] sponsor extraido: COLOR1=' + sponsor.COLOR1 + ' TEXT1=' + sponsor.TEXT1 + ' FILE_IMAGE1=' + (sponsor.FILE_IMAGE1 ? 'sim' : 'nao'));
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

    // ── Fallback: carrega D_FOOTBALL via EBHTML (sem dados ao vivo) ────────────
    function startPreviewWithDataset() {
        ebhtml.create2({}, function(loader) {
            loader.addData('D_FOOTBALL', false);
            loader.nodataiserror = false;
            loader.autoloaded    = false;
            loader.load(function() {
                var footballData = loader.data('D_FOOTBALL');
                if (!footballData) {
                    loader.finished();
                    return;
                }
                
                // Aplicar cores padrao
                aplicarCores(CONFIG);
                
                // spdData=null: exibe estado pre-jogo (sem placar ao vivo)
                // spdSponsor=null: sem rodape de patrocinador no preview
                // teamsMap vazio
                var teamsMap = {};
                
                processarDados(null, null, footballData, getPreviewLoader(loader), teamsMap);
            });
        });
    }

    // ── Entry point ───────────────────────────────────────────────────────────

    // 1. Dados do formulario da extranet (frame pai)
    var parentData = extractParentData();
    if (parentData) {
        console.log('[placar_futebol][preview] usando dados do frame pai');
        
        // Extrair sponsor do formulario
        var spdSponsor = extractSponsorFromParent(parentData);
        
        // Aplicar cores do sponsor (se existirem)
        var cores = mergeColorsFromSpd(CONFIG, spdSponsor);
        aplicarCores(cores);
        
        // teamsMap vazio no preview (nomes PT-BR nao disponiveis)
        var teamsMap = {};
        
        processarDados(null, spdSponsor, parentData, getPreviewLoader(null), teamsMap);
        return;
    }

    // 2. Mock local (desenvolvimento)
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = MOCK_DATA.getMockLoader();
        var footballData = mockLoader.data('D_FOOTBALL');
        if (!footballData) {
            console.log('[placar_futebol][preview] mock sem D_FOOTBALL');
            return;
        }
        
        // Mock: buscar sponsor do MOCK_DATA
        var spdSponsor = null;
        var lista = mockLoader.datalist('D_SPD');
        if (lista && lista.count() > 0) {
            for (var i = 0; i < lista.count(); i++) {
                var item = lista.get(i);
                if (item.CONFIG === '1') {
                    spdSponsor = item;
                    break;
                }
            }
        }
        
        // Aplicar cores do sponsor (se existirem)
        var cores = mergeColorsFromSpd(CONFIG, spdSponsor);
        aplicarCores(cores);
        
        console.log('[placar_futebol][preview] usando mock D_FOOTBALL — cenario: ' + MOCK_DATA.cenario);
        
        // teamsMap vazio no preview
        var teamsMap = {};
        
        processarDados(null, spdSponsor, footballData, getPreviewLoader(null), teamsMap);
        return;
    }

    // 3. Fallback: EBHTML
    console.log('[placar_futebol][preview] fallback EBHTML D_FOOTBALL');
    startPreviewWithDataset();
}
