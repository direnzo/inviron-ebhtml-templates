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
    tipo: 'menuboard_bebidas',
    
    // Simula D_MENUBOARD_PRICES (lista de produtos)
    // Backend já retorna apenas os N itens (via amount= na URL)
    // NÃO precisa de paginação - cada refresh mostra novos produtos
    acougue: [
        // ─── Layout Simples (apenas 1 preço) ─────────────────────
        {
            TITULO: 'SOBRECOXA DE FRANGO RESF BANDEJA KG',
            TEXTO1: '',
            PRICE: '69.00',
            PRICE2: '',
            TEXTO2: 'KG',
            TEXTO3: ''
        },
        {
            TITULO: 'PICANHA BOVINA TRADICIONAL PEDACO KG RESF',
            TEXTO1: '',
            PRICE: '89.90',
            PRICE2: '',
            TEXTO2: 'KG',
            TEXTO3: ''
        },
        {
            TITULO: 'CONTRA FILE BOVINO PORCIONADO KG RESF',
            TEXTO1: '',
            PRICE: '45.90',
            PRICE2: '', 
            TEXTO2: 'KG',
            TEXTO3: ''
        },
        {
            TITULO: 'COSTELA BOVINA JANELA PEDACO KG RESF',
            TEXTO1: '',
            PRICE: '32.90',
            PRICE2: '',
            TEXTO2: 'KG',
            TEXTO3: ''
        },
        {
            TITULO: 'ALCATRA BOVINA PRATA PEDACO KG RESF',
            TEXTO1: '',
            PRICE: '39.90',
            PRICE2: '',
            TEXTO2: 'KG',
            TEXTO3: ''
        },
        {
            TITULO: 'COXAO MOLE BOVINO LIMPO KG RESF',
            TEXTO1: '',
            PRICE: '36.90',
            PRICE2: '',
            TEXTO2: 'KG',
            TEXTO3: ''
        },
        {
            TITULO: 'PATINHO BOVINO EXTRA MOAGEM KG RESF',
            TEXTO1: '',
            PRICE: '34.90',
            PRICE2: '',
            TEXTO2: 'KG',
            TEXTO3: ''
        },
        {
            TITULO: 'COXAO DURO BOVINO EM CUBOS KG RESF',
            TEXTO1: '',
            PRICE: '28.90',
            PRICE2: '',
            TEXTO2: 'KG',
            TEXTO3: ''
        },
        {
            TITULO: 'MUSCULO BOVINO COM OSSO KG RESF',
            TEXTO1: '',
            PRICE: '24.90',
            PRICE2: '',
            TEXTO2: 'KG',
            TEXTO3: ''
        },
        {
            TITULO: 'ACEM BOVINO PRATA PEDACO KG RESF',
            TEXTO1: '',
            PRICE: '26.90',
            PRICE2: '',
            TEXTO2: 'KG',
            TEXTO3: ''
        },
        {
            TITULO: 'FRALDINHA BOVINA CHURRASCO KG RESF',
            TEXTO1: '',
            PRICE: '52.90',
            PRICE2: '',
            TEXTO2: 'KG',
            TEXTO3: ''
        },
        {
            TITULO: 'CUPIM BOVINO TEMPERAR FACIL KG RESF',
            TEXTO1: '',
            PRICE: '48.90',
            PRICE2: '',
            TEXTO2: 'KG',
            TEXTO3: ''
        },
        {
            TITULO: 'LAGARTO BOVINO REDONDO KG RESF',
            TEXTO1: '',
            PRICE: '38.90',
            PRICE2: '',
            TEXTO2: 'KG',
            TEXTO3: ''
        },
        {
            TITULO: 'PALETA BOVINA EM CUBOS KG RESF',
            TEXTO1: '',
            PRICE: '29.90',
            PRICE2: '',
            TEXTO2: 'KG',
            TEXTO3: ''
        },
        {
            TITULO: 'PEITO BOVINO COM GORDURA KG RESF',
            TEXTO1: '',
            PRICE: '27.90',
            PRICE2: '',
            TEXTO2: 'KG',
            TEXTO3: ''
        },
        {
            TITULO: 'FILE MIGNON BOVINO MEDALHAO KG RESF',
            TEXTO1: '',
            PRICE: '79.90',
            PRICE2: '',
            TEXTO2: 'KG',
            TEXTO3: ''
        },
        {
            TITULO: 'BABY BEEF BOVINO CHURRASCO KG RESF',
            TEXTO1: '',
            PRICE: '59.90',
            PRICE2: '',
            TEXTO2: 'KG',
            TEXTO3: ''
        },
        {
            TITULO: 'CARNE MOIDA BOVINA 2A MOAGEM KG RESF',
            TEXTO1: '',
            PRICE: '22.90',
            PRICE2: '',
            TEXTO2: 'KG',
            TEXTO3: ''
        },
        {
            TITULO: 'OSSOBUCO BOVINO FATIADO KG RESF',
            TEXTO1: '',
            PRICE: '35.90',
            PRICE2: '',
            TEXTO2: 'KG',
            TEXTO3: ''
        },
        {
            TITULO: 'MIOLO DE ALCATRA BOVINA KG RESF',
            TEXTO1: '',
            PRICE: '44.90',
            PRICE2: '',
            TEXTO2: 'KG',
            TEXTO3: ''
        }
    ],
    
    // Produtos com preço unitário (UNID.) e preço de caixa calculado via TEXTO5
    menuboard_bebidas: [
        {
            TITULO: 'CERVEJA HEINEKEN PURO MALTE LATA 269ML',
            PRICE: '3.79',
            TEXTO5: '{"informacoesTecnicas":{"TipoEmbalagem":"CX","QuantidadeEmbalagem":12}}'
        },
        {
            TITULO: 'CERVEJA SKOL PILSEN LATA 350ML',
            PRICE: '2.99',
            TEXTO5: '{"informacoesTecnicas":{"TipoEmbalagem":"CX","QuantidadeEmbalagem":12}}'
        },
        {
            TITULO: 'CERVEJA BRAHMA CHOPP GARRAFA 600ML',
            PRICE: '4.99',
            TEXTO5: '{"informacoesTecnicas":{"TipoEmbalagem":"CX","QuantidadeEmbalagem":12}}'
        },
        {
            TITULO: 'CERVEJA ANTARCTICA PILSEN LATA 350ML',
            PRICE: '2.89',
            TEXTO5: '{"informacoesTecnicas":{"TipoEmbalagem":"CX","QuantidadeEmbalagem":12}}'
        },
        {
            TITULO: 'CERVEJA STELLA ARTOIS LONG NECK 330ML',
            PRICE: '4.59',
            TEXTO5: '{"informacoesTecnicas":{"TipoEmbalagem":"CX","QuantidadeEmbalagem":6}}'
        },
        {
            TITULO: 'CERVEJA BUDWEISER PURO MALTE LATA 350ML',
            PRICE: '3.49',
            TEXTO5: '{"informacoesTecnicas":{"TipoEmbalagem":"CX","QuantidadeEmbalagem":12}}'
        },
        {
            TITULO: 'CERVEJA CORONA EXTRA LONG NECK 355ML',
            PRICE: '5.99',
            TEXTO5: '{"informacoesTecnicas":{"TipoEmbalagem":"CX","QuantidadeEmbalagem":6}}'
        },
        {
            TITULO: 'CERVEJA EISENBAHN PILSEN GARRAFA 355ML',
            PRICE: '4.29',
            TEXTO5: '{"informacoesTecnicas":{"TipoEmbalagem":"CX","QuantidadeEmbalagem":12}}'
        },
        {
            TITULO: 'COCA-COLA ORIGINAL REFRIGERANTE LATA 350ML',
            PRICE: '3.19',
            TEXTO5: '{"informacoesTecnicas":{"TipoEmbalagem":"CX","QuantidadeEmbalagem":12}}'
        },
        {
            TITULO: 'COCA-COLA ZERO ACUCAR REFRIGERANTE PET 2L',
            PRICE: '8.99',
            TEXTO5: '{"informacoesTecnicas":{"TipoEmbalagem":"CX","QuantidadeEmbalagem":6}}'
        },
        {
            TITULO: 'GUARANA ANTARCTICA REFRIGERANTE LATA 350ML',
            PRICE: '2.79',
            TEXTO5: '{"informacoesTecnicas":{"TipoEmbalagem":"CX","QuantidadeEmbalagem":12}}'
        },
        {
            TITULO: 'FANTA LARANJA REFRIGERANTE PET 2L',
            PRICE: '7.99',
            TEXTO5: '{"informacoesTecnicas":{"TipoEmbalagem":"CX","QuantidadeEmbalagem":6}}'
        },
        {
            TITULO: 'PEPSI COLA REFRIGERANTE LATA 350ML',
            PRICE: '2.69',
            TEXTO5: '{"informacoesTecnicas":{"TipoEmbalagem":"CX","QuantidadeEmbalagem":12}}'
        },
        {
            TITULO: 'AGUA CRYSTAL SEM GAS GARRAFA 500ML',
            PRICE: '1.99',
            TEXTO5: '{"informacoesTecnicas":{"TipoEmbalagem":"CX","QuantidadeEmbalagem":12}}'
        },
        {
            TITULO: 'AGUA COM GAS PERRIER GARRAFA 330ML',
            PRICE: '4.99',
            TEXTO5: '{"informacoesTecnicas":{"TipoEmbalagem":"CX","QuantidadeEmbalagem":6}}'
        },
        {
            TITULO: 'SUCO DEL VALLE LARANJA CAIXA 1L',
            PRICE: '6.49',
            TEXTO5: '{"informacoesTecnicas":{"TipoEmbalagem":"CX","QuantidadeEmbalagem":6}}'
        },
        {
            TITULO: 'SUCO DEL VALLE UVA CAIXA 1L',
            PRICE: '6.49',
            TEXTO5: '{"informacoesTecnicas":{"TipoEmbalagem":"CX","QuantidadeEmbalagem":6}}'
        },
        {
            TITULO: 'RED BULL ENERGY DRINK LATA 250ML',
            PRICE: '8.99',
            TEXTO5: '{"informacoesTecnicas":{"TipoEmbalagem":"CX","QuantidadeEmbalagem":12}}'
        },
        {
            TITULO: 'MONSTER ENERGY ENERGETICO LATA 473ML',
            PRICE: '9.99',
            TEXTO5: '{"informacoesTecnicas":{"TipoEmbalagem":"CX","QuantidadeEmbalagem":12}}'
        },
        {
            TITULO: 'SPRITE LIMAO REFRIGERANTE PET 2L',
            PRICE: '7.99',
            TEXTO5: '{"informacoesTecnicas":{"TipoEmbalagem":"CX","QuantidadeEmbalagem":6}}'
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
