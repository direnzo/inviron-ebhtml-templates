/**
 * Mock Data para c2r_busdoor - Desenvolvimento Local
 * Simula dados de D_LOCAL e D_OLHOVIVO
 */

var MOCK_DATA = {
    enabled: true,  // Mudar para false em produção
    config: {
        duration: 30000  // 30 segundos
    },
    datasets: {
        // Simula loader.datalist('D_LOCAL')
        D_LOCAL: [
            {
                ID: '304',
                SCREEN: 'Busdoor (Onibus 00.001)',
                SCREEN_CUSTOMERID: '31783',
                SCREEN_ID: '304',
                SITE: 'Santa Brígida',
                SITE_ADDRESS: 'Avenida Domingos de Souza Marques, 450',
                SITE_CITY: 'São Paulo',
                SITE_STATE: 'SP',
                SITE_POSX: '-23.5120295',
                SITE_POSY: '-46.7385251'
            }
        ],
        // Simula loader.datalist('D_OLHOVIVO')
        D_OLHOVIVO: [
            {
                ID: '23724',
                LOCAL: '304',           // Chave para match com D_LOCAL.ID
                TITULO: '31783',        // Chave para match com D_LOCAL.SCREEN_CUSTOMERID
                TEXTO: '8677-10',       // Valor a exibir (número gigante)
                TEXTO1: '8677-10',
                TEXTO2: 'LUZ',
                TEXTO3: '-23.521274',
                TEXTO4: '-46.6304235'
            }
        ]
    },
    // Mock loader object
    getMockLoader: function() {
        var self = this;
        return {
            loaded: function() {
                console.log('[Mock] Template carregado com sucesso');
            },
            finished: function() {
                console.log('[Mock] Template finalizado');
            },
            data: function(datasetName) {
                var lista = self.datasets[datasetName];
                return lista && lista.length > 0 ? lista[0] : undefined;
            },
            datalist: function(datasetName) {
                var lista = self.datasets[datasetName] || [];
                return {
                    count: function() {
                        return lista.length;
                    },
                    get: function(index) {
                        return lista[index];
                    },
                    first: function() {
                        return lista[0];
                    }
                };
            }
        };
    }
};
