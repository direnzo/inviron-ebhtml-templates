function extranetView() {
    var DATASET_NAME = 'D_MENUBOARD_PRICES';

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

    function normalizeKey(key) {
        return String(key || '').toUpperCase();
    }

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

        startPreviewWithDataset(app);
    };
}