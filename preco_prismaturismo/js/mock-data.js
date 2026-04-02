/**
 * Mock Data - PRECO PRISMATURISMO
 * Altere MOCK_DATA.enabled = false em producao.
 *
 * D_COMBUSTIVEL:
 *   TITULO  : 'Etanol Comum' | 'Gasolina' | 'Gasolina Aditivada' | 'Diesel S10' | 'GNV'
 *   PRECO   : usa ponto decimal, ex: '4.39' | '6.49'
 *   LOCAL   : ID do local (deve bater com D_LOCAL.ID)
 *
 * D_LOCAL:
 *   ID      : identificador do local (tela)
 *
 * D_LOGO (array - suporte a datalist):
 *   LOCAL   : FK para D_LOCAL.ID
 *   FOTO1   : URL da bandeira (distribuidora)
 *   FOTO2   : URL do logo do posto
 */

var MOCK_DATA = {
    enabled: true,  /* Alterar para false em producao */

    datasets: {

        'D_COMBUSTIVEL': {
            value: function(campo) {
                var dados = {
                    'TITULO':    'Etanol Comum',
                    'PRECO':     '4.39',
                    'LOCAL':     '1',
                    'DESCRICAO': 'EC'
                };
                return dados[campo] !== undefined ? { value: dados[campo] } : null;
            }
        },

        'D_LOCAL': {
            value: function(campo) {
                var dados = {
                    'ID':        '1',
                    'SCREEN_ID': '1',
                    'SITE':      'Mock Posto'
                };
                return dados[campo] !== undefined ? { value: dados[campo] } : null;
            }
        },

        /*
         * D_LOGO como array para suportar datalist no mock.
         * Cada entrada representa um local diferente (LOCAL = D_LOCAL.ID).
         * Troque FOTO1/FOTO2 para testar bandeiras:
         *   bandeira-petrobras.png | bandeira-ipiranga.png | bandeira-SHELL.png
         *   logo-posto.png | logo-ale.png | '' (vazio = oculto)
         */
        'D_LOGO': [
            {
                'LOCAL': '1',
                'FOTO':  'img/bandeira-petrobras.png',
                'FOTO1': 'img/bandeira-petrobras.png',
                'FOTO2': 'img/logo-posto.png'
            }
        ]

    }
};
