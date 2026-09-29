/**
 * Mock para desenvolvimento (EBHTML-compatível)
 * Habilite com `enabled: true` para testes sem EdgeContents
 */

var MOCK_DATA = {
    enabled: true,
    datasets: {
        'D_ATLANTIDA': [
            {
                TITULO: 'As 10 series que estao super em alta nos streamings agora',
                TEXTO: 'Reacher, Lanternas, Silo e Ted Lasso estao entre os titulos mais populares do momento',
                CATEGORY: 'Series & TV',
                FOTO: 'img/placeholder.jpg',
                IMAGECREDIT: '',
                FOOTER: 'ACESSE ATLANTIDA.COM.BR'
            },
            {
                TITULO: 'Morango cravejado e o novo doce queridinho da internet; saiba o que e',
                TEXTO: 'Depois do sucesso do morango do amor, uma nova versao da sobremesa tomou conta das redes sociais',
                CATEGORY: 'Em Alta',
                FOTO: 'img/placeholder.jpg',
                IMAGECREDIT: ''
            },
            {
                TITULO: 'Terceira manchete de exemplo para simular rotacao com 3 noticias',
                TEXTO: 'Item extra apenas para validar a rotacao RANDOM do canal com 3 registros',
                CATEGORY: 'Atlantida',
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
