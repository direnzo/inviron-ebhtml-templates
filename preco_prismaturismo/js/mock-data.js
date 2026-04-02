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
                     * Substitua pelos caminhos reais das imagens.
                     * Deixe a string vazia '' para testar sem logo
                     * (o bloco no header ficara em branco sem erro).
                     *
                     * Exemplos:
                     *   'LOGO_BANDEIRA': 'img/br_petrobras.png'
                     *   'LOGO_BANDEIRA': 'img/ipiranga.png'
                     *   'LOGO_POSTO':    'img/logo_paz.png'
                     */
                    'LOGO_BANDEIRA': 'img/logo_bandeira.png',
                    'LOGO_POSTO':    'img/logo_posto.png'
                };
                return dados[campo] !== undefined ? { value: dados[campo] } : null;
            }
        }

    }
};
