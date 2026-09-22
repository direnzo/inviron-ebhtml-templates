/**
 * @file preview.js
 * Ponto de entrada do modo preview (extranet EdgeContents).
 * A função extranetView() é definida no escopo global e chamada pelo inline script do HTML.
 *
 * Prioridade de origem dos dados (em ordem):
 *   1. window.parent.getTemplatePreviewData() / .templatePreviewData / .TEMPLATE_PREVIEW_DATA
 *   2. MOCK_DATA (se ativo)
 *   3. Fallback EBHTML loader (dataset D_MENUBOARD_PRICES)
 *
 * O loader de preview nunca chama finished() para manter o template
 * visível na extranet sem avançar a playlist.
 * @global
 */

/**
 * Inicializa o template no modo preview/extranet.
 * Definida no escopo global para ser chamada pelo inline script do HTML.
 * @global
 */
function extranetView() {
    var DATASET_NAME = 'D_MENUBOARD_PRICES';

    /**
     * Cria um stub de loader que repassa loaded() mas suprime finished().
     * Isso mantém o template visível na extranet sem avançar a playlist.
     * @param {{loaded: Function, finished: Function}|null} realLoader - Loader EBHTML real, ou null.
     * @returns {{loaded: Function, finished: Function}}
     */
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

    /**
     * Normaliza a chave de campo para maiúsculas.
     * @param {string} key
     * @returns {string}
     */
    function normalizeKey(key) {
        return String(key || '').toUpperCase();
    }

    /**
     * Encapsula um objeto plano vindo do frame pai como dataSource EBHTML.
     * Resolve múltiplos aliases de chave para tolerar variações de naming do CMS.
     * @param {Object} data - Dados vindos do frame pai da extranet.
     * @returns {{value: function(string): {value: string}}} dataSource compatível.
     */
    function wrapPlainData(data) {
        var aliases = {
            TITULO: ['TITULO', 'titulo'],
            FOTO: ['FOTO', 'foto'],
            PRICE: ['PRICE', 'price', 'preco'],
            PRICE2: ['PRICE2', 'price2', 'preco2'],
            TEXTO3: ['TEXTO3', 'texto3', 'tipo_preco'],
            TEXTO4: ['TEXTO4', 'texto4', 'unidade'],
            TEXTO5: ['TEXTO5', 'texto5', 'legal_text']
        };

        return {
            value: function(key) {
                var normalized = normalizeKey(key);
                var options = aliases[normalized] || [normalized, normalized.toLowerCase()];
                var i;
                var fieldValue = '';

                for (i = 0; i < options.length; i++) {
                    if (data && data[options[i]] !== undefined && data[options[i]] !== null) {
                        fieldValue = data[options[i]];
                        break;
                    }
                }

                return { value: fieldValue };
            }
        };
    }

    /**
     * Tenta extrair os dados de preview do frame pai da extranet.
     * Tenta três propriedades do parent em ordem: getTemplatePreviewData(),
     * templatePreviewData, TEMPLATE_PREVIEW_DATA.
     * Retorna null se nenhuma for encontrada ou se houver erro cross-origin.
     * @returns {Object|null} dataSource encapsulado, ou null.
     */
    function extractParentData() {
        var parentRef = null;
        var data = null;

        try {
            parentRef = window.parent;
        } catch (e) {
            parentRef = null;
        }

        if (!parentRef) {
            return null;
        }

        try {
            if (typeof parentRef.getTemplatePreviewData === 'function') {
                data = parentRef.getTemplatePreviewData();
            }
        } catch (e1) {
            data = null;
        }

        if (!data) {
            try {
                if (parentRef.templatePreviewData) {
                    data = parentRef.templatePreviewData;
                }
            } catch (e2) {
                data = null;
            }
        }

        if (!data) {
            try {
                if (parentRef.TEMPLATE_PREVIEW_DATA) {
                    data = parentRef.TEMPLATE_PREVIEW_DATA;
                }
            } catch (e3) {
                data = null;
            }
        }

        if (!data) {
            return null;
        }

        return wrapPlainData(data);
    }

    /**
     * Fallback final: inicia um runner EBHTML normal para carregar o dataset no preview.
     * Usado quando não há dados do frame pai e o mock está desativado.
     * @param {{applyDataToView: Function}} app - window.ArmazemSeuJeitoApp.
     */
    function startPreviewWithDataset(app) {
        ebhtml.create2({}, function(loader) {
            loader.addData(DATASET_NAME, false);
            loader.nodataiserror = false;
            loader.autoloaded = false;
            loader.load(function() {
                var dataSource = loader.data(DATASET_NAME);
                if (!dataSource) {
                    loader.finished();
                    return;
                }
                app.applyDataToView(dataSource, getPreviewLoader(loader));
            });
        });
    }

    window.onload = function() {
        var app = window.ArmazemSeuJeitoApp;
        if (!app || typeof app.applyDataToView !== 'function') {
            console.error('[armazemseujeito] Runtime principal nao carregado');
            return;
        }

        var parentDataSource = extractParentData();
        if (parentDataSource) {
            app.applyDataToView(parentDataSource, getPreviewLoader(null));
            return;
        }

        if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled && typeof MOCK_DATA.getData === 'function') {
            app.applyDataToView(MOCK_DATA.getData(), getPreviewLoader(null));
            return;
        }

        startPreviewWithDataset(app);
    };
}