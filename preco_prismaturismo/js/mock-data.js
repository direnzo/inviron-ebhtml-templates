/**
 * Mock Data - PRECO PRISMATURISMO
 * Altere MOCK_DATA.enabled = false em producao.
 *
 * Para testar diferentes combustiveis, altere:
 *   COMBUSTIVEL : 'GASOLINA' | 'ETANOL' | 'DIESEL' | 'DIESEL S10' | 'GNV'
 *   SUBTIPO     : 'COMUM' | 'ADITIVADA' | 'S10' | '' (vazio)
 *   PRECO       : ex. '5,99' | '4,29' | '6,49'
 *
 * Para testar sem logos, passe strings vazias em LOGO_BANDEIRA / LOGO_POSTO.
 */

var MOCK_DATA = {
    enabled: true,  /* Alterar para false em producao */

    datasets: {

        'D_COMBUSTIVEL': {
            value: function(campo) {
                var dados = {
                    'COMBUSTIVEL': 'GASOLINA',
                    'SUBTIPO':     'COMUM',
                    'PRECO':       '5,99'
                };
                return dados[campo] !== undefined ? { value: dados[campo] } : null;
            }
        },

        'D_LOCAL': {
            value: function(campo) {
                var dados = {
                    /*
                     * Troque os valores abaixo para testar combinacoes:
                     *
                     * LOGO_BANDEIRA:
                     *   'img/bandeira-petrobras.png'
                     *   'img/bandeira-ipiranga.png'
                     *   'img/bandeira-SHELL.png'
                     *   '' (vazio = sem bandeira)
                     *
                     * LOGO_POSTO:
                     *   'img/logo-posto.png'
                     *   'img/logo-ale.png'
                     *   '' (vazio = sem logo de posto)
                     */
                    'LOGO_BANDEIRA': 'img/bandeira-petrobras.png',
                    'LOGO_POSTO':    'img/logo-posto.png'
                };
                return dados[campo] !== undefined ? { value: dados[campo] } : null;
            }
        }

    }
};
