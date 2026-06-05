// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA - Andorinha Menuboard
// ═══════════════════════════════════════════════════════════════════════════
// Dados fictícios que simulam a estrutura EBDATA/EBHTML
// Campos: TITULO (nome produto), TEXTO1 (subtítulo/unidade), PRICE (preço), 
//         PRICE2 (preço secundário), TEXTO3 (label preço 2, ex: "CX/12")

var MOCK_DATA = {
    enabled: true,  // ⚠️ Trocar para false em produção
    
    // Tipo de menuboard: determina qual background usar e layout
    // Opções: 'acougue', 'padaria', 'hortifruti', 'laticinio', 'bebidas', 'mercearia'
    tipo: 'acougue',
    
    // Simula D_MENUBOARD_PRICES (lista de produtos)
    // Backend já retorna apenas os N itens (via amount= na URL)
    // NÃO precisa de paginação - cada refresh mostra novos produtos
    produtos: [
        // ─── Layout Simples (apenas 1 preço) ─────────────────────
        {
            TITULO: 'Maminha da Alcatra',
            TEXTO1: '',
            PRICE: '69.00',
            PRICE2: '',
            TEXTO3: ''
        },
        {
            TITULO: 'Picanha Bovina',
            TEXTO1: '',
            PRICE: '89.90',
            PRICE2: '',
            TEXTO3: ''
        },
        {
            TITULO: 'Contra Filé',
            TEXTO1: '',
            PRICE: '45.90',
            PRICE2: '',
            TEXTO3: ''
        },
        {
            TITULO: 'Costela Bovina',
            TEXTO1: '',
            PRICE: '32.90',
            PRICE2: '',
            TEXTO3: ''
        },
        {
            TITULO: 'Alcatra Bovina',
            TEXTO1: '',
            PRICE: '39.90',
            PRICE2: '',
            TEXTO3: ''
        },
        {
            TITULO: 'Coxão Mole',
            TEXTO1: '',
            PRICE: '36.90',
            PRICE2: '',
            TEXTO3: ''
        },
        {
            TITULO: 'Patinho Bovino',
            TEXTO1: '',
            PRICE: '34.90',
            PRICE2: '',
            TEXTO3: ''
        },
        {
            TITULO: 'Coxão Duro',
            TEXTO1: '',
            PRICE: '28.90',
            PRICE2: '',
            TEXTO3: ''
        },
        {
            TITULO: 'Músculo Bovino',
            TEXTO1: '',
            PRICE: '24.90',
            PRICE2: '',
            TEXTO3: ''
        },
        {
            TITULO: 'Acém Bovino',
            TEXTO1: '',
            PRICE: '26.90',
            PRICE2: '',
            TEXTO3: ''
        },
        {
            TITULO: 'Fraldinha Bovina',
            TEXTO1: '',
            PRICE: '52.90',
            PRICE2: '',
            TEXTO3: ''
        },
        {
            TITULO: 'Cupim Bovino',
            TEXTO1: '',
            PRICE: '48.90',
            PRICE2: '',
            TEXTO3: ''
        },
        {
            TITULO: 'Lagarto Bovino',
            TEXTO1: '',
            PRICE: '38.90',
            PRICE2: '',
            TEXTO3: ''
        },
        {
            TITULO: 'Paleta Bovina',
            TEXTO1: '',
            PRICE: '29.90',
            PRICE2: '',
            TEXTO3: ''
        },
        {
            TITULO: 'Peito Bovino',
            TEXTO1: '',
            PRICE: '27.90',
            PRICE2: '',
            TEXTO3: ''
        },
        {
            TITULO: 'File Mignon',
            TEXTO1: '',
            PRICE: '79.90',
            PRICE2: '',
            TEXTO3: ''
        },
        {
            TITULO: 'Baby Beef',
            TEXTO1: '',
            PRICE: '59.90',
            PRICE2: '',
            TEXTO3: ''
        },
        {
            TITULO: 'Carne Moída',
            TEXTO1: '',
            PRICE: '22.90',
            PRICE2: '',
            TEXTO3: ''
        },
        {
            TITULO: 'Ossobuco Bovino',
            TEXTO1: '',
            PRICE: '35.90',
            PRICE2: '',
            TEXTO3: ''
        },
        {
            TITULO: 'Miolo de Alcatra',
            TEXTO1: '',
            PRICE: '44.90',
            PRICE2: '',
            TEXTO3: ''
        }
    ],
    
    // Exemplo de produtos com 2 preços (bebidas, por exemplo)
    produtosBebidas: [
        {
            TITULO: 'Cerveja Heineken Puro Malte',
            TEXTO1: 'Lata 269ml',
            PRICE: '3.79',
            PRICE2: '45.48',
            TEXTO3: 'CX/12'
        },
        {
            TITULO: 'Cerveja Skol Pilsen',
            TEXTO1: 'Lata 350ml',
            PRICE: '2.99',
            PRICE2: '34.90',
            TEXTO3: 'CX/12'
        },
        {
            TITULO: 'Cerveja Brahma Chopp',
            TEXTO1: 'Garrafa 600ml',
            PRICE: '4.99',
            PRICE2: '58.90',
            TEXTO3: 'CX/12'
        },
        {
            TITULO: 'Cerveja Antarctica Pilsen',
            TEXTO1: 'Lata 350ml',
            PRICE: '2.89',
            PRICE2: '33.90',
            TEXTO3: 'CX/12'
        },
        {
            TITULO: 'Cerveja Stella Artois',
            TEXTO1: 'Long Neck 330ml',
            PRICE: '4.59',
            PRICE2: '53.90',
            TEXTO3: 'CX/12'
        },
        {
            TITULO: 'Cerveja Budweiser',
            TEXTO1: 'Lata 350ml',
            PRICE: '3.49',
            PRICE2: '40.90',
            TEXTO3: 'CX/12'
        },
        {
            TITULO: 'Cerveja Corona Extra',
            TEXTO1: 'Long Neck 355ml',
            PRICE: '5.99',
            PRICE2: '69.90',
            TEXTO3: 'CX/12'
        },
        {
            TITULO: 'Cerveja Eisenbahn Pilsen',
            TEXTO1: 'Garrafa 355ml',
            PRICE: '4.29',
            PRICE2: '50.90',
            TEXTO3: 'CX/12'
        },
        {
            TITULO: 'Coca-Cola Original',
            TEXTO1: 'Lata 350ml',
            PRICE: '3.19',
            PRICE2: '37.90',
            TEXTO3: 'CX/12'
        },
        {
            TITULO: 'Coca-Cola Zero',
            TEXTO1: 'PET 2L',
            PRICE: '8.99',
            PRICE2: '52.90',
            TEXTO3: 'CX/6'
        },
        {
            TITULO: 'Guaraná Antarctica',
            TEXTO1: 'Lata 350ml',
            PRICE: '2.79',
            PRICE2: '32.90',
            TEXTO3: 'CX/12'
        },
        {
            TITULO: 'Fanta Laranja',
            TEXTO1: 'PET 2L',
            PRICE: '7.99',
            PRICE2: '46.90',
            TEXTO3: 'CX/6'
        },
        {
            TITULO: 'Pepsi Cola',
            TEXTO1: 'Lata 350ml',
            PRICE: '2.69',
            PRICE2: '31.90',
            TEXTO3: 'CX/12'
        },
        {
            TITULO: 'Água Crystal',
            TEXTO1: 'Garrafa 500ml',
            PRICE: '1.99',
            PRICE2: '23.90',
            TEXTO3: 'CX/12'
        },
        {
            TITULO: 'Água com Gás Perrier',
            TEXTO1: 'Garrafa 330ml',
            PRICE: '4.99',
            PRICE2: '58.90',
            TEXTO3: 'CX/12'
        },
        {
            TITULO: 'Suco Del Valle Laranja',
            TEXTO1: 'Caixa 1L',
            PRICE: '6.49',
            PRICE2: '38.90',
            TEXTO3: 'CX/6'
        },
        {
            TITULO: 'Suco Del Valle Uva',
            TEXTO1: 'Caixa 1L',
            PRICE: '6.49',
            PRICE2: '38.90',
            TEXTO3: 'CX/6'
        },
        {
            TITULO: 'Red Bull Energy Drink',
            TEXTO1: 'Lata 250ml',
            PRICE: '8.99',
            PRICE2: '106.90',
            TEXTO3: 'CX/12'
        },
        {
            TITULO: 'Monster Energy',
            TEXTO1: 'Lata 473ml',
            PRICE: '9.99',
            PRICE2: '118.90',
            TEXTO3: 'CX/12'
        },
        {
            TITULO: 'Sprite Limão',
            TEXTO1: 'PET 2L',
            PRICE: '7.99',
            PRICE2: '46.90',
            TEXTO3: 'CX/6'
        }
    ]
};

// ═══════════════════════════════════════════════════════════════════════════
// Funções auxiliares para simular a API do EBHTML
// ═══════════════════════════════════════════════════════════════════════════

// Simula o objeto de item retornado pelo EBHTML
function criarItemMock(produtoData) {
    return {
        value: function(campo) {
            return {
                value: produtoData[campo] || ''
            };
        }
    };
}

// Simula o datalist do EBHTML
function criarDatalistMock(produtos) {
    var items = [];
    for (var i = 0; i < produtos.length; i++) {
        items.push(criarItemMock(produtos[i]));
    }
    
    return {
        f_items: items,
        count: function() {
            return items.length;
        },
        get: function(index) {
            return items[index];
        }
    };
}
