var MOCK_DATA = {
    enabled: window.location.search.indexOf('mock=1') !== -1,
    datasets: {
        D_NOTICIAS_MAELY: [
            {
                ID: '266029',
                CATEGORY: 'painel news',
                TITULO: 'Prefeitura muda rotas no Centro para desafogar Beira-Mar',
                TEXTO: 'Prefeitura muda rotas no Centro para desafogar Beira-Mar',
                TEXTOCOMPLETO: 'Prefeitura muda rotas no Centro para desafogar Beira-Mar',
                FOTO: 'img/mock-foto.png'
            }
        ]
    }
};

(function () {
    if (!MOCK_DATA.enabled) { return; }
    var datasets = {};
    window.ebhtml = {
        create2: function (options, callback) {
            var loader = {
                addData: function (name) {
                    datasets[name] = { list: [] };
                },
                nodataiserror: false,
                autoloaded: false,
                data: function (name) {
                    var dataset = datasets[name];
                    var record = dataset && dataset.list.length ? dataset.list[0] : null;
                    if (!record) { return undefined; }
                    return {
                        value: function (field) {
                            return { value: record[field] != null ? record[field] : '' };
                        }
                    };
                },
                load: function (success) {
                    var key;
                    for (key in MOCK_DATA.datasets) {
                        if (Object.prototype.hasOwnProperty.call(MOCK_DATA.datasets, key) && datasets[key]) {
                            datasets[key].list = MOCK_DATA.datasets[key];
                        }
                    }
                    if (typeof success === 'function') { success(); }
                },
                loaded: function () { console.log('[MAELY mock] loaded()'); },
                finished: function () { console.log('[MAELY mock] finished()'); }
            };
            callback(loader);
        }
    };
}());