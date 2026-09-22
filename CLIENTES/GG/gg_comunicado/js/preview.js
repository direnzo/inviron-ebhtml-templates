/**
 * @file preview.js
 * Ponto de entrada do modo preview (extranet EdgeContents).
 * A funcao extranetView() e definida no escopo global e chamada pelo inline script do HTML.
 *
 * Prioridade de origem dos dados (em ordem):
 *   1. window.parent.getTemplatePreviewData() / .templatePreviewData / .TEMPLATE_PREVIEW_DATA
 *   2. MOCK_DATA (se ativo)
 *   3. Fallback EBHTML loader (dataset D_COMUNICADO)
 *
 * O loader de preview nunca chama finished() para manter o template
 * visivel na extranet sem avancar a playlist.
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

    // ── Extrai dados do frame pai (extranet) ───────────────────────────────────
    function extractParentData() {
        var parentRef = null;
        var data = null;

        try { parentRef = window.parent; } catch (e) { parentRef = null; }
        if (!parentRef) return null;

        try {
            if (typeof parentRef.getTemplatePreviewData === 'function') {
                data = parentRef.getTemplatePreviewData();
            }
        } catch (e1) { data = null; }

        if (!data) {
            try {
                if (parentRef.templatePreviewData) {
                    data = parentRef.templatePreviewData;
                }
            } catch (e2) { data = null; }
        }

        if (!data) {
            try {
                if (parentRef.TEMPLATE_PREVIEW_DATA) {
                    data = parentRef.TEMPLATE_PREVIEW_DATA;
                }
            } catch (e3) { data = null; }
        }

        return data || null;
    }

    // ── Normaliza campos do CMS para o formato interno do template ─────────────
    // CMS envia: TITULO, TEXTO, TEXTO2, TEXTO3, FOTO, FOTO2, FOTO3, CATEGORY
    // Template usa internamente: TITULO, TEXTO1, TEXTO2, TEXTO3, IMAGEM1, IMAGEM2, IMAGEM3, CATEGORY
    function normalizarDados(data) {
        if (!data) return {};
        return {
            CATEGORY: data.CATEGORY  || data.category  || '',
            TITULO:   data.TITULO    || data.titulo     || '',
            TEXTO1:   data.TEXTO     || data.TEXTO1     || data.texto  || '',
            TEXTO2:   data.TEXTO2    || data.texto2     || '',
            TEXTO3:   data.TEXTO3    || data.texto3     || '',
            IMAGEM1:  data.FOTO      || data.IMAGEM1    || data.foto   || '',
            IMAGEM2:  data.FOTO2     || data.IMAGEM2    || data.foto2  || '',
            IMAGEM3:  data.FOTO3     || data.IMAGEM3    || data.foto3  || ''
        };
    }

    // ── Fallback: carrega via EBHTML normal (sem finished()) ──────────────────
    function startPreviewWithDataset() {
        ebhtml.create2({}, function(loader) {
            loader.addData('D_COMUNICADO', false);
            loader.nodataiserror = false;
            loader.autoloaded    = false;
            loader.load(function() {
                var d = loader.data('D_COMUNICADO');
                if (!d) {
                    loader.finished();
                    return;
                }
                var dados = normalizarDados({
                    CATEGORY: d.value('CATEGORY').value,
                    TITULO:   d.value('TITULO').value,
                    TEXTO:    d.value('TEXTO').value,
                    TEXTO2:   d.value('TEXTO2').value,
                    TEXTO3:   d.value('TEXTO3').value,
                    FOTO:     d.value('FOTO').value,
                    FOTO2:    d.value('FOTO2').value,
                    FOTO3:    d.value('FOTO3').value
                });
                iniciarTemplate(dados, CONFIG, getPreviewLoader(loader));
            });
        });
    }

    // ── Entry point ───────────────────────────────────────────────────────────

    var parentData = extractParentData();
    if (parentData) {
        iniciarTemplate(normalizarDados(parentData), CONFIG, getPreviewLoader(null));
        return;
    }

    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var indice = (typeof MOCK_DATA._forceIndex !== 'undefined')
            ? MOCK_DATA._forceIndex
            : Math.floor(Math.random() * MOCK_DATA.dados.length);
        var item = MOCK_DATA.dados[indice];
        console.log('[Preview/Mock] idx=' + indice + ' category=' + item.CATEGORY);
        iniciarTemplate(item, CONFIG, getPreviewLoader(null));
        return;
    }

    startPreviewWithDataset();
}
