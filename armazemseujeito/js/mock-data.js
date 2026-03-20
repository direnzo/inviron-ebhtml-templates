/**
 * @file mock-data.js
 * Dados de teste locais para desenvolvimento sem servidor EdgeContents.
 * Para ativar: MOCK_DATA.enabled = true e script incluso no HTML (já está por padrão).
 * Para desativar em produção: comente o <script src="js/mock-data.js"> no index.html.
 */

/** @type {Object} MOCK_DATA */
var MOCK_DATA = {
    /**
     * Habilita o modo mock. false em produção.
     * @type {boolean}
     */
    enabled: true,
    /**
     * Lista de itens de exemplo, cada um simulando um registro do dataset D_MENUBOARD_PRICES.
     * Campos em MAIÚsCULAS seguem a convenção XML do EdgeContents.
     * @type {Array<Object>}
     */
    dados: [
        {
            TITULO: 'REFRIG GUARANA KUAT PET 2L',
            FOTO: 'img/produtos/guarana_kuat.png',
            PRICE: '5.99',
            PRICE2: '',
            TEXTO3: 'REGULAR',
            TEXTO4: 'cada',
            TEXTO5: 'Ofertas válidas enquanto durarem os estoques'
        },
        {
            TITULO: 'ARROZ BRANCO TIPO 1 5KG',
            FOTO: 'img/produtos/arroz.jpeg',
            PRICE: '24.90',
            PRICE2: '32.90',
            TEXTO3: 'DEPOR',
            TEXTO4: 'pacote',
            TEXTO5: 'Ofertas válidas enquanto durarem os estoques'
        },
        {
            TITULO: 'AZEITE EXTRA VIRGEM 500ML',
            FOTO: 'img/produtos/azeite.webp',
            PRICE: '12.99',
            PRICE2: '',
            TEXTO3: 'LEVE3PAGUE2',
            TEXTO4: 'unidade',
            TEXTO5: 'Ofertas válidas enquanto durarem os estoques'
        },
        {
            TITULO: 'BOMBOM SONHO DE VALSA 20G',
            FOTO: 'img/produtos/bombom_sonhodevalsa.webp',
            PRICE: '1.99',
            PRICE2: '',
            TEXTO3: 'L3P1',
            TEXTO4: 'unidade',
            TEXTO5: 'Leve 3 e pague 1 enquanto durarem os estoques'
        },
        {
            TITULO: 'FILÉ DE FRANGO RESFRIADO',
            FOTO: 'img/produtos/peitofrango.png',
            PRICE: '9.98',
            PRICE2: '',
            TEXTO3: 'CLUBE',
            TEXTO4: 'kg',
            TEXTO5: 'Preço exclusivo para clientes Clube'
        },
        {
            TITULO: 'CERVEJA SPATEN LATA 350ML',
            FOTO: 'img/produtos/cervejaSpaten.png',
            PRICE: '3.49',
            PRICE2: '',
            TEXTO3: 'OFERTA',
            TEXTO4: 'unidade',
            TEXTO5: 'Promoção válida somente hoje'
        }
    ],
    /**
     * Retorna um item aleatório da lista encapsulado como dataSource EBHTML.
     * @returns {{value: function(string): {value: string}}} dataSource compatível com loader.data().
     */
    getData: function() {
        if (!this.dados || this.dados.length === 0) {
            return this.wrap({});
        }
        var randomIndex = Math.floor(Math.random() * this.dados.length);
        return this.wrap(this.dados[randomIndex]);
    },
    /**
     * Encapsula um objeto plano como dataSource EBHTML.
     * Permite que o mesmo código de runtime funcione com dados reais e mock sem alterações.
     * @param {Object} item - Objeto com campos em MAIÚsCULAS (ex: {TITULO: 'Arroz', PRICE: '5.99'}).
     * @returns {{value: function(string): {value: string}}} dataSource compatível.
     */
    wrap: function(item) {
        return {
            value: function(key) {
                var normalizedKey = String(key || '').toUpperCase();
                var value = item[normalizedKey];
                if (value === undefined || value === null) {
                    value = '';
                }
                return { value: value };
            }
        };
    }
};
