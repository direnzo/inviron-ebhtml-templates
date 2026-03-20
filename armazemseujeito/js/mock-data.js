var MOCK_DATA = {
    enabled: false,
    dados: [
        {
            TITULO: 'REFRIG GUARANA KUAT PET 2L',
            FOTO: 'img/produtos/guarana_kuat.png',
            PRICE: '5.99',
            PRICE2: '16.99',
            TEXTO3: 'REGULAR',
            TEXTO4: 'cada',
            TEXTO5: 'Ofertas validas enquanto durarem os estoques'
        },
        {
            TITULO: 'ARROZ BRANCO TIPO 1 5KG',
            FOTO: 'img/produtos/arroz.jpeg',
            PRICE: '4.99',
            PRICE2: '6.99',
            TEXTO3: 'OFERTA',
            TEXTO4: 'kg',
            TEXTO5: 'Ofertas validas enquanto durarem os estoques'
        },
        {
            TITULO: 'AZEITE EXTRA VIRGEM 500ML',
            FOTO: 'img/produtos/azeite.webp',
            PRICE: '12.99',
            PRICE2: '18.99',
            TEXTO3: 'DE-POR',
            TEXTO4: 'unidade',
            TEXTO5: 'Ofertas validas enquanto durarem os estoques'
        }
    ],
    getData: function() {
        if (!this.dados || this.dados.length === 0) {
            return this.wrap({});
        }

        var randomIndex = Math.floor(Math.random() * this.dados.length);
        return this.wrap(this.dados[randomIndex]);
    },
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
