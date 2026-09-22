// Mock para desenvolvimento local — formato novo da API pricing-query
// Descomente o script no HTML para ativar: <script src="js/mock-data.js"></script>
// Hierarquia de preços: TakeWin > Promotional > Regular

var MOCK_DATA = {
    enabled: true,
    produto: (function() {
        var produtos = [
            // --- PRODUTO COM IMAGEM: TV ---
            {
                blockPaper: false,
                blockTag: false,
                image: 'img/tv.webp',
                measureValue: 2599.00,
                product: {
                    commercialUnit: 'PCE',
                    department: '10',
                    description: 'Smart TV LED 32" Philco PTV32G7 Roku TV Dolby Audio 2 HDMI 1 USB - Prata',
                    ean: '7891234567890',
                    sapId: '1111111'
                },
                promotional: {
                    blockPaper: false,
                    discountPercent: 69.25,
                    endDate: '2026-05-01T23:59:59-03:00',
                    price: 799.00,
                    startDate: '2026-04-10T00:00:00-03:00'
                },
                regularPrice: 2599.00,
                regularStartAt: '2026-01-01T00:00:00-03:00',
                installment: {
                    endDate: '2026-06-30T23:59:59-03:00',
                    quantity: 10,
                    startDate: '2026-04-10T00:00:00-03:00',
                    value: 79.90
                }
            },

            // --- PRODUTO COM IMAGEM: Água ---
            {
                blockPaper: false,
                blockTag: false,
                image: 'img/aguasaolourenco.webp',
                measureValue: 3.55,
                product: {
                    commercialUnit: 'UN',
                    department: '20',
                    description: 'Água São Lourenço Natural 510ml',
                    ean: '7899876543210',
                    sapId: '2222222'
                },
                promotional: {
                    blockPaper: false,
                    discountPercent: 15.77,
                    endDate: '2026-05-10T23:59:59-03:00',
                    price: 2.99,
                    startDate: '2026-04-15T00:00:00-03:00'
                },
                regularPrice: 3.55,
                regularStartAt: '2026-01-01T00:00:00-03:00'
            },

            // --- CENÁRIO REAL: Dados reais da API (2026-04-15) ---
            {
                blockPaper: false,
                blockTag: false,
                image: '',
                measureValue: 18.99,
                product: {
                    commercialUnit: 'PCE',
                    department: '31',
                    description: 'SHAMPOO PANTENE LISO EXTREMO 350ML',
                    ean: '7896004000855',
                    sapId: '5589127'
                },
                promotional: {
                    blockPaper: false,
                    discountPercent: 15.56,
                    endDate: '2026-04-21T23:59:59-03:00',
                    price: 18.9,
                    startDate: '2026-04-07T00:00:00-03:00'
                },
                regularPrice: 22.49,
                regularStartAt: '2025-11-14T00:00:00-03:00'
            },

            // --- CENÁRIO 1: TakeWin + Promotional + Installment (maior prioridade) ---
            {
                blockPaper: false,
                blockTag: false,
                product: {
                    commercialUnit: 'PCE',
                    department: '31',
                    description: 'CR TRAT DOVE RECONST AMINOACIDO 320G',
                    ean: '7891150105652',
                    sapId: '4330632'
                },
                regularPrice: 19.99,
                regularStartAt: '2025-11-14T00:00:00-03:00',
                promotional: {
                    blockPaper: false,
                    discountPercent: 15.01,
                    endDate: '2026-04-21T23:59:59-03:00',
                    price: 16.99,
                    startDate: '2026-04-07T00:00:00-03:00'
                },
                takeWin: {
                    blockPaper: false,
                    discountValue: 5,
                    endDate: '2026-04-21T23:59:59-03:00',
                    quantity: 2,
                    startDate: '2026-04-07T00:00:00-03:00',
                    totalPriceWithDiscount: 33.98,
                    type: 'BUY_N_GET_DISCOUNT',
                    unitPriceWithDiscount: 16.99
                },
                installment: {
                    endDate: '2026-06-07T23:59:59-03:00',
                    quantity: 3,
                    startDate: '2026-04-07T00:00:00-03:00',
                    value: 5.66
                },
                measureValue: 16.99
            },

            // --- CENÁRIO 2: Promotional sem TakeWin ---
            {
                blockPaper: false,
                blockTag: false,
                product: {
                    commercialUnit: 'UN',
                    department: '31',
                    description: 'SHAMPOO SEDA HIDRATACAO CREME 325ML',
                    ean: '7891037563234',
                    sapId: '1234567'
                },
                regularPrice: 12.99,
                regularStartAt: '2026-01-01T00:00:00-03:00',
                promotional: {
                    blockPaper: false,
                    discountPercent: 23.02,
                    endDate: '2026-04-30T23:59:59-03:00',
                    price: 9.99,
                    startDate: '2026-04-07T00:00:00-03:00'
                }
            },

            // --- CENÁRIO 3: Apenas preço Regular (sem promoção) ---
            {
                blockPaper: false,
                blockTag: false,
                product: {
                    commercialUnit: 'UN',
                    department: '10',
                    description: 'ARROZ BRANCO TIO JOAO 1KG',
                    ean: '7896009301043',
                    sapId: '7654321'
                },
                regularPrice: 8.49,
                regularStartAt: '2026-03-15T00:00:00-03:00'
            },

            // --- CENÁRIO 4: Regular + Installment (sem promo, mas com parcelamento) ---
            {
                blockPaper: false,
                blockTag: false,
                product: {
                    commercialUnit: 'UN',
                    department: '20',
                    description: 'GELADEIRA BRASTEMP FROST FREE 375L INOX',
                    ean: '7891129190261',
                    sapId: '9871234'
                },
                regularPrice: 799.00,
                regularStartAt: '2026-01-10T00:00:00-03:00',
                installment: {
                    endDate: '2026-06-30T23:59:59-03:00',
                    quantity: 6,
                    startDate: '2026-04-01T00:00:00-03:00',
                    value: 133.17
                }
            },

            // --- CENÁRIO 5: TakeWin sem Promotional ---
            {
                blockPaper: false,
                blockTag: false,
                product: {
                    commercialUnit: 'UN',
                    department: '31',
                    description: 'DESODORANTE REXONA COTTON DRY 150ML',
                    ean: '7891150028956',
                    sapId: '5556677'
                },
                regularPrice: 14.49,
                regularStartAt: '2026-02-01T00:00:00-03:00',
                takeWin: {
                    blockPaper: false,
                    discountValue: 4.5,
                    endDate: '2026-04-30T23:59:59-03:00',
                    quantity: 3,
                    startDate: '2026-04-07T00:00:00-03:00',
                    totalPriceWithDiscount: 38.97,
                    type: 'BUY_N_GET_DISCOUNT',
                    unitPriceWithDiscount: 12.99
                }
            }

        ];
        return produtos[Math.floor(Math.random() * produtos.length)];
    }())
};
