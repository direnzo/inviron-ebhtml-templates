/**
 * preview.js - Modo extranet (visualizacao no painel de gerenciamento)
 * ES5 obrigatorio
 */

function extranetView() {
    // No modo preview, exibe o primeiro grupo do mock (se disponivel)
    // ou tenta carregar D_STANDINGS via EBHTML
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled && MOCK_DATA.grupos && MOCK_DATA.grupos.length > 0) {
        var previewLoader = {
            loaded: function() {},
            finished: function() {}
        };
        var duracao = (MOCK_DATA.config && MOCK_DATA.config.duration) || 12000;
        renderizarGrupo(MOCK_DATA.grupos[0], previewLoader, duracao, MOCK_DATA.config);
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
                renderizarGrupo(grupo, previewLoader, 0, null);
            });
        });
    }
}
