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
     * Modo de seleção dos cenários:
     * - 'sequence': percorre todos em ordem (ideal para QA visual)
     * - 'random': escolhe aleatório
     * @type {string}
     */
    mode: 'sequence',
    /**
     * Cursor interno usado no modo sequence.
     * @type {number}
     */
    cursor: 0,
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
            PRICE3: '',
            PRICE4: '',
            TEXTO3: 'REGULAR',
            TEXTO4: 'cada',
            TEXTO8: '',
            TEXTO9: '',
            TEXTO5: 'Ofertas válidas enquanto durarem os estoques'
        },
        {
            TITULO: 'ARROZ BRANCO TIPO 1 5KG',
            FOTO: 'img/produtos/arroz.jpeg',
            PRICE: '24.90',
            PRICE2: '32.90',
            PRICE3: '',
            PRICE4: '',
            TEXTO3: 'DEPOR',
            TEXTO4: 'pacote',
            TEXTO8: '',
            TEXTO9: '',
            TEXTO5: 'Ofertas válidas enquanto durarem os estoques'
        },
        {
            TITULO: 'AZEITE EXTRA VIRGEM 500ML',
            FOTO: 'img/produtos/azeite.webp',
            PRICE: '12.99',
            PRICE2: '',
            PRICE3: '',
            PRICE4: '',
            TEXTO3: 'LEVE3PAGUE2',
            TEXTO4: 'unidade',
            TEXTO8: '',
            TEXTO9: '',
            TEXTO5: 'Ofertas válidas enquanto durarem os estoques'
        },
        {
            TITULO: 'BOMBOM SONHO DE VALSA 20G',
            FOTO: 'img/produtos/bombom_sonhodevalsa.webp',
            PRICE: '1.99',
            PRICE2: '',
            PRICE3: '',
            PRICE4: '',
            TEXTO3: 'L3P1',
            TEXTO4: 'unidade',
            TEXTO8: '',
            TEXTO9: '',
            TEXTO5: 'Leve 3 e pague 1 enquanto durarem os estoques'
        },
        {
            TITULO: 'FILÉ DE FRANGO RESFRIADO',
            FOTO: 'img/produtos/peitofrango.png',
            PRICE: '9.98',
            PRICE2: '',
            PRICE3: '',
            PRICE4: '',
            TEXTO3: 'CLUBE',
            TEXTO4: 'kg',
            TEXTO8: '',
            TEXTO9: '',
            TEXTO5: 'Preço exclusivo para clientes Clube'
        },
        {
            TITULO: 'CERVEJA SPATEN LATA 350ML',
            FOTO: 'img/produtos/cervejaSpaten.png',
            PRICE: '3.49',
            PRICE2: '',
            PRICE3: '',
            PRICE4: '',
            TEXTO3: 'OFERTA',
            TEXTO4: 'unidade',
            TEXTO8: '',
            TEXTO9: '',
            TEXTO5: 'Promoção válida somente hoje'
        },
        {
            TITULO: 'SABAO EM PO CONCENTRADO 1,6KG',
            FOTO: 'img/produtos/sabonete.webp',
            PRICE: '15.99',
            PRICE2: '13.89',
            PRICE3: '',
            PRICE4: '',
            TEXTO3: 'ATACAREJO',
            TEXTO4: 'un',
            TEXTO8: '3',
            TEXTO9: '',
            TEXTO5: 'Preço atacado válido a partir de 3 unidades iguais'
        },
        {
            TITULO: 'SMART TV SAMSUNG UHD 50 POLEGADAS',
            FOTO: 'img/produtos/samsung.webp',
            PRICE: '2599.00',
            PRICE2: '216.58',
            PRICE3: '',
            PRICE4: '',
            TEXTO3: 'PARC-SEM-J',
            TEXTO4: 'un',
            TEXTO8: '12',
            TEXTO9: '',
            TEXTO5: 'Em até 12x sem juros no cartão participante'
        },
        {
            TITULO: 'IOGURTE NESTLE MORANGO BANDEJA COM 6 UNIDADES',
            FOTO: 'img/produtos/iogurte_nestle.jpg',
            PRICE: '8.49',
            PRICE2: '',
            PRICE3: '',
            PRICE4: '',
            TEXTO3: 'LEVE-X-PAGUE-Y',
            TEXTO4: 'cada',
            TEXTO8: '3',
            TEXTO9: '2',
            TEXTO5: 'Leve 3 e pague 2 por unidade enquanto durarem os estoques'
        },
        {
            TITULO: 'PAO ARTESANAL PREMIUM FERMENTACAO NATURAL',
            FOTO: 'img/produtos/pao.webp',
            PRICE: '18.90',
            PRICE2: '14.90',
            PRICE3: '',
            PRICE4: '',
            TEXTO3: 'FIDELIDADE',
            TEXTO4: 'un',
            TEXTO8: '',
            TEXTO9: '',
            TEXTO5: 'Preço fidelidade para clientes cadastrados no programa'
        },
        {
            TITULO: 'CHOCOLAT PREMIUM IMPORT BELGA 100G',
            FOTO: 'img/produtos/chocolat.webp',
            PRICE: '24.90',
            PRICE2: '',
            PRICE3: '',
            PRICE4: '',
            TEXTO3: 'COMPRE_E_GANHE',
            TEXTO4: 'un',
            TEXTO8: '',
            TEXTO9: '',
            TEXTO5: 'Compre este produto e ganhe um brinde especial!'
        },
        {
            TITULO: 'KIT MERCEARIA PREMIUM TRADICIONAL EXTRA GRANDE PARA TESTE DE TITULO LONGO',
            FOTO: 'img/produtos/shopping.webp',
            PRICE: '9999.99',
            PRICE2: '11999.90',
            PRICE3: '',
            PRICE4: '',
            TEXTO3: 'DEPOR',
            TEXTO4: 'kit',
            TEXTO8: '',
            TEXTO9: '',
            TEXTO5: 'Cenário de stress para validação de fontes e overflow visual'
        }
    ],
    /**
     * Retorna um item aleatório da lista encapsulado como dataSource EBHTML.
     * @returns {{value: function(string): {value: string}}} dataSource compatível com loader.data().
     */
    getData: function() {
        var item = this.getRawData();
        return this.wrap(item || {});
    },
    /**
     * Retorna o item cru (objeto plano) respeitando query string e modo atual.
     * @returns {Object}
     */
    getRawData: function() {
        var byQuery = this.getDataFromQuery();
        if (byQuery) {
            return byQuery;
        }

        if (!this.dados || this.dados.length === 0) {
            return {};
        }

        if (this.mode === 'random') {
            return this.dados[Math.floor(Math.random() * this.dados.length)];
        }

        // Persistir cursor entre reloads para ciclagem automática
        var storedCursor = parseInt(localStorage.getItem('_mockCursor') || '0', 10);
        if (isNaN(storedCursor) || storedCursor < 0) { storedCursor = 0; }
        var idx = storedCursor % this.dados.length;
        localStorage.setItem('_mockCursor', (idx + 1) % this.dados.length);
        this.cursor = idx + 1;
        return this.dados[idx];
    },
    /**
     * Retorna true se o modo sequence deve ciclar automaticamente via reload.
     * Desabilitado quando mockIndex ou mockCondition estão fixos na URL.
     * @returns {boolean}
     */
    shouldCycle: function() {
        if (!this.enabled || this.mode !== 'sequence') { return false; }
        var query = window.location.search || '';
        if (query.match(/[?&]mockIndex=\d+/i)) { return false; }
        if (query.match(/[?&]mockCondition=/i)) { return false; }
        return true;
    },
    /**
     * Lê parâmetros da URL para facilitar QA visual.
     * Suporta:
     * - ?mockIndex=0..N
     * - ?mockCondition=REGULAR|DEPOR|...
     * @returns {Object|null}
     */
    getDataFromQuery: function() {
        var query = window.location.search || '';
        var indexMatch = query.match(/[?&]mockIndex=(\d+|random)/i);
        var conditionMatch = query.match(/[?&]mockCondition=([^&]+)/i);
        var idx;
        var condition;
        var i;

        if (!this.dados || this.dados.length === 0) {
            return null;
        }

        if (indexMatch && indexMatch[1] !== undefined) {
            if (indexMatch[1] === 'random') {
                return this.dados[Math.floor(Math.random() * this.dados.length)];
            }
            idx = parseInt(indexMatch[1], 10);
            if (!isNaN(idx) && idx >= 0 && idx < this.dados.length) {
                return this.dados[idx];
            }
        }

        if (conditionMatch && conditionMatch[1]) {
            condition = this.decodeQueryValue(conditionMatch[1]).toUpperCase();
            for (i = 0; i < this.dados.length; i++) {
                if (String(this.dados[i].TEXTO3 || '').toUpperCase() === condition) {
                    return this.dados[i];
                }
            }
        }

        return null;
    },
    /**
     * Decodifica valor de query string sem depender de APIs modernas.
     * @param {string} value
     * @returns {string}
     */
    decodeQueryValue: function(value) {
        try {
            return decodeURIComponent(String(value).replace(/\+/g, ' '));
        } catch (e) {
            return String(value || '');
        }
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
