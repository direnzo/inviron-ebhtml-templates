/**
 * @file preview.js
 * Ponto de entrada do modo preview (extranet EdgeContents).
 * A funcao extranetView() e definida no escopo global e chamada pelo inline script do HTML.
 *
 * Prioridade de origem dos dados (em ordem):
 *   1. window.parent.getTemplatePreviewData() / .templatePreviewData / .TEMPLATE_PREVIEW_DATA
 *   2. MOCK_DATA (se ativo)
 *   3. Fallback EBHTML loader (dataset D_CONDOMINIO)
 *
 * O loader de preview nunca chama finished() para manter o template
 * visivel na extranet sem avancar a playlist.
 * ES5 obrigatorio (Android 7+ WebKit)
 */

function extranetView() {
    var DATASET = 'D_CONDOMINIO';

    // ── Cria um datasource EBHTML-fake a partir de objeto plano ──────────────
    function makeDataSource(item) {
        return {
            value: function(field) {
                var val = (item && item[field] !== undefined && item[field] !== null)
                    ? String(item[field])
                    : '';
                return { value: val };
            }
        };
    }

    // ── Cria um datalist EBHTML-fake a partir de array de objetos ────────────
    function makeDataList(items) {
        return {
            count: function() {
                return items ? items.length : 0;
            },
            get: function(i) {
                return makeDataSource(items[i]);
            }
        };
    }

    // ── Loader que suprime finished() e retorna dados mock ────────────────────
    function getPreviewLoader(realLoader, mockItems) {
        var configItem = (mockItems && mockItems.length > 0) ? mockItems[0] : {};
        var listItems = mockItems || [];

        return {
            loaded: function() {
                if (realLoader && typeof realLoader.loaded === 'function') {
                    realLoader.loaded();
                }
            },
            finished: function() {
                // Preview nao deve encerrar automaticamente na extranet.
            },
            data: function(name) {
                return makeDataSource(configItem);
            },
            datalist: function(name) {
                // Pula o primeiro item (indice 0 = config), igual ao master.js
                return makeDataList(listItems.slice(1));
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

    // ── Fallback: carrega via EBHTML normal (sem finished()) ──────────────────
    function startPreviewWithDataset() {
        ebhtml.create2({}, function(loader) {
            loader.addData(DATASET, false, 'amount=0');
            loader.nodataiserror = false;
            loader.autoloaded    = false;
            loader.load(function() {
                var data = loader.data(DATASET);
                if (!data) {
                    loader.finished();
                    return;
                }
                iniciarTemplate(data, CONFIG, getPreviewLoader(loader, null));
            });
        });
    }

    // ── Entry point ───────────────────────────────────────────────────────────

    var parentData = extractParentData();
    if (parentData) {
        iniciarTemplate(
            makeDataSource(parentData),
            CONFIG,
            getPreviewLoader(null, parentData.items || [parentData])
        );
        return;
    }

    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        console.log('[Preview/Mock] Usando MOCK_DATA');
        iniciarTemplate(
            makeDataSource(MOCK_DATA.dados[0]),
            CONFIG,
            getPreviewLoader(null, MOCK_DATA.dados)
        );
        return;
    }

    startPreviewWithDataset();
}
