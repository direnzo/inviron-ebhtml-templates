/**
 * mock-loader-engine.js - adaptador de dados mock para teste sem backend
 */
(function() {
    function createMockLoader() {
        return {
            loaded: function() {
                console.log('[Mock] Carregado');
            },
            finished: function() {
                console.log('[Mock] Finalizado');
            }
        };
    }

    function getMockData() {
        if (typeof MOCK_DATA === 'undefined' || !MOCK_DATA.enabled || typeof MOCK_DATA.getData !== 'function') {
            return null;
        }
        return MOCK_DATA.getData();
    }

    function isEnabled() {
        return typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled === true;
    }

    window.ArmazemSeuJeitoMockLoaderEngine = {
        createMockLoader: createMockLoader,
        getMockData: getMockData,
        isEnabled: isEnabled
    };
})();
