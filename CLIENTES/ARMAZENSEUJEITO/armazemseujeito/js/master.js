/**
 * @file master.js
 * Bootstrap do template. Responsabilidades:
 *   - Expor window.ArmazemSeuJeitoApp (contrato usado por preview.js)
 *   - Definir window.playerView() (chamado pelo inline script no HTML)
 *
 * Mantido propositalmente enxuto: toda lógica de runtime está em runtime-engine.js.
 */
(function() {
    /**
     * Retorna a referência ao engine de runtime, se já carregado.
     * @returns {ArmazemSeuJeitoEngine|undefined}
     */
    function resolveEngine() {
        return window.ArmazemSeuJeitoEngine;
    }

    /**
     * Publica window.ArmazemSeuJeitoApp para consumo por preview.js.
     * Contrato mínimo: { startRuntime, applyDataToView }.
     * @param {Object} engine - Referência a window.ArmazemSeuJeitoEngine.
     */
    function exposeApp(engine) {
        window.ArmazemSeuJeitoApp = {
            startRuntime: engine.startRuntime,
            applyDataToView: engine.applyDataToView
        };
    }

    /**
     * Inicializa o template no modo player (WebKit / Android / edge content).
     * Definida no escopo global para ser chamada pelo script inline do HTML.
     * @global
     */
    window.playerView = function() {
        window.onload = function() {
            var engine = resolveEngine();
            if (!engine) {
                console.error('[armazemseujeito] runtime-engine.js nao carregado');
                return;
            }
            exposeApp(engine);
            engine.startRuntime();
        };
    };

    // Exponibiliza app no carregamento imediato (para preview/extranet)
    var engineNow = resolveEngine();
    if (engineNow) {
        exposeApp(engineNow);
    }
})();