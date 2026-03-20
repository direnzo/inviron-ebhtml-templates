/**
 * armazemseujeito - bootstrap ES5
 * Mantem master.js pequeno e delega logica para runtime-engine.js
 */
(function() {
    function resolveEngine() {
        return window.ArmazemSeuJeitoEngine;
    }

    function exposeApp(engine) {
        window.ArmazemSeuJeitoApp = {
            startRuntime: engine.startRuntime,
            applyDataToView: engine.applyDataToView,
            getField: engine.getField,
            applyLayoutConfig: engine.applyLayoutConfig
        };
    }

    window.playerView = function() {
        window.onload = function() {
            var engine = resolveEngine();
            if (!engine) {
                console.error('[armazemseujeito] runtime-engine.js nao carregado');
                return;
            }
            exposeApp(engine);
            engine.applyLayoutConfig();
            engine.startRuntime();
        };
    };

    // Exponibiliza app no carregamento imediato (para preview/extranet)
    var engineNow = resolveEngine();
    if (engineNow) {
        exposeApp(engineNow);
    }
})();