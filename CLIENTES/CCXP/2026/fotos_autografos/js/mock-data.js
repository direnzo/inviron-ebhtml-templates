/**
 * Mock de desenvolvimento (substitui o EBHTML). Desligar antes do .eh5:
 * MOCK_DATA.enabled = false E remover/comentar o <script> deste arquivo.
 * ESQUELETO (fase 0): cenarios ?cenario=vazio|erro, senao 1 registro; o mock completo entra na fase 3.
 *   ?mock=0  usa o EBHTML real (sem mock)
 * window.__calls: loaded()/finished().
 */
const MOCK_DATA = { enabled: !/[?&]mock=0(&|$)/.test(window.location.search) };

(function () {
    if (!MOCK_DATA.enabled) { return; }

    const cenario = new URLSearchParams(window.location.search).get('cenario') || 'um';
    const calls = (window.__calls = []);

    MOCK_DATA.now = function () { return Date.now(); };

    const registros = cenario === 'vazio' || cenario === 'erro' ? [] : [{
        TITULO: 'Artista Exemplo', FOTO: 'mock/fotos/p01.jpg', CATEGORY: 'Autografo',
        DT_BEGIN: '2026-12-04 14:00:00', DT_END: '2026-12-04 15:00:00', TEXTO3: ''
    }];

    function wrapItem(rec) {
        return { value: function (field) { return { value: rec[field] != null ? rec[field] : '' }; } };
    }

    window.ebhtml = {
        create2: function (opts, cb) {
            const loader = {
                nodataiserror: false,
                autoloaded: false,
                addData: function () {},
                datalist: function () {
                    return {
                        count: function () { return registros.length; },
                        get: function (i) { return wrapItem(registros[i]); }
                    };
                },
                load: function (done, fail) {
                    setTimeout(function () {
                        if (cenario === 'erro') { if (fail) { fail('mock: falha de rede'); } return; }
                        done();
                    }, 150);
                },
                loaded: function () { calls.push({ t: Date.now(), name: 'loaded' }); console.log('[Mock] loaded()'); },
                finished: function () { calls.push({ t: Date.now(), name: 'finished' }); console.log('[Mock] finished()'); }
            };
            cb(loader);
        }
    };
    console.log('[Mock] ativo: cenario=' + cenario);
})();
