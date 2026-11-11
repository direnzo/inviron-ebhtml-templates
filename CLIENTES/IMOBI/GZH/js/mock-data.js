/**
 * Mock para desenvolvimento (EBHTML-compatível)
 * Desabilite com `enabled: false` antes de entregar para produção
 */

var MOCK_DATA = {
    enabled: true,
    datasets: {
        'D_GZH': [
            {
                TITULO: 'Projeto amplia oportunidades para estudantes e jovens profissionais',
                TEXTO: '',
                CATEGORY: 'EDUCAÇÃO',
                FOTO: 'img/placeholder.jpg',
                IMAGECREDIT: '',
                FOOTER: ''
            },
            {
                TITULO: 'Veja as novidades e os destaques do esporte nesta semana',
                TEXTO: '',
                CATEGORY: 'ESPORTES',
                FOTO: 'img/placeholder.jpg',
                IMAGECREDIT: ''
            }
        ]
    }
};

// Shim de EBHTML compatível (apenas quando mock ativado)
(function() {
    if (typeof MOCK_DATA === 'undefined' || !MOCK_DATA.enabled) { return; }

    console.log('[Mock] Ativando EBHTML shim');

    var datasets = {};
    var mockEbhtml = {
        create2: function(opts, cb) {
            var loader = {
                addData: function(name, required) {
                    datasets[name] = { list: [], single: null };
                },
                nodataiserror: false,
                autoloaded: false,
                data: function(name) {
                    var ds = datasets[name];
                    if (!ds) { return undefined; }
                    var rec = ds.single || (ds.list.length > 0 ? ds.list[0] : null);
                    if (!rec) { return undefined; }
                    return {
                        value: function(field) {
                            return { value: rec[field] != null ? rec[field] : '' };
                        }
                    };
                },
                datalist: function(name) {
                    var ds = datasets[name] || { list: [] };
                    return {
                        count: function() { return ds.list.length; },
                        get: function(i) {
                            var rec = ds.list[i] || {};
                            return {
                                value: function(field) {
                                    return { value: rec[field] != null ? rec[field] : '' };
                                }
                            };
                        }
                    };
                },
                load: function(done, fail) {
                    // Injeta dados de MOCK_DATA.datasets
                    if (MOCK_DATA.datasets) {
                        for (var k in MOCK_DATA.datasets) {
                            if (datasets.hasOwnProperty(k)) {
                                var v = MOCK_DATA.datasets[k];
                                if (Object.prototype.toString.call(v) === '[object Array]') {
                                    datasets[k].list = v;
                                } else {
                                    datasets[k].single = v;
                                }
                            }
                        }
                    }
                    if (typeof done === 'function') { done(); }
                },
                loaded: function() { console.log('[Mock] loader.loaded()'); },
                finished: function() { console.log('[Mock] loader.finished()'); }
            };
            cb(loader);
        }
    };

    window.ebhtml = mockEbhtml;
})();
