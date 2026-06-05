// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA - Menuboard Lista de Produtos
// ═══════════════════════════════════════════════════════════════════════════
// Dados fictícios que simulam a estrutura EBDATA/EBHTML
// Campos: TITULO, PRICE, PRICE2, TEXTO2 (local), TEXTO6 (data início), TEXTO7 (data fim)

var MOCK_DATA = {
    enabled: true,  // ⚠️ Trocar para false em produção
    
    // Simula D_LOCAL (dados do local/loja)
    local: {
        SITE_CUSTOMERID: 'LOJA001'
    },
    
    // Simula D_MENUBOARD_PRICES (lista de produtos)
    produtos: [
        // ─── Açougue Aves ────────────────────────────────────────
        {
            TITULO: 'Peito de Frango Congelado',
            PRICE: '15.99',
            PRICE2: '12.99',
            TEXTO2: 'LOJA001',
            TEXTO6: '2026-06-01 00:00:00',
            TEXTO7: '2026-06-30 00:00:00'
        },
        {
            TITULO: 'Coxa e Sobrecoxa de Frango',
            PRICE: '12.50',
            PRICE2: '9.90',
            TEXTO2: 'LOJA001',
            TEXTO6: '2026-06-01 00:00:00',
            TEXTO7: '2026-06-30 00:00:00'
        },
        {
            TITULO: 'Asa de Frango Congelada',
            PRICE: '18.90',
            PRICE2: '14.90',
            TEXTO2: 'LOJA001',
            TEXTO6: '2026-06-01 00:00:00',
            TEXTO7: '2026-06-30 00:00:00'
        },
        {
            TITULO: 'File de Peito de Frango',
            PRICE: '22.99',
            PRICE2: '19.99',
            TEXTO2: 'LOJA001',
            TEXTO6: '2026-06-01 00:00:00',
            TEXTO7: '2026-06-30 00:00:00'
        },
        {
            TITULO: 'Frango Inteiro Congelado',
            PRICE: '9.90',
            PRICE2: '7.90',
            TEXTO2: 'LOJA001',
            TEXTO6: '2026-06-01 00:00:00',
            TEXTO7: '2026-06-30 00:00:00'
        },
        {
            TITULO: 'Coração de Frango Limpo',
            PRICE: '16.50',
            PRICE2: '13.90',
            TEXTO2: 'LOJA001',
            TEXTO6: '2026-06-01 00:00:00',
            TEXTO7: '2026-06-30 00:00:00'
        },
        {
            TITULO: 'Moela de Frango Limpa',
            PRICE: '14.90',
            PRICE2: '11.90',
            TEXTO2: 'LOJA001',
            TEXTO6: '2026-06-01 00:00:00',
            TEXTO7: '2026-06-30 00:00:00'
        },
        {
            TITULO: 'Tulipa de Frango Temperada',
            PRICE: '24.90',
            PRICE2: '19.90',
            TEXTO2: 'LOJA001',
            TEXTO6: '2026-06-01 00:00:00',
            TEXTO7: '2026-06-30 00:00:00'
        },
        {
            TITULO: 'Sassami de Frango Congelado',
            PRICE: '29.90',
            PRICE2: '25.90',
            TEXTO2: 'LOJA001',
            TEXTO6: '2026-06-01 00:00:00',
            TEXTO7: '2026-06-30 00:00:00'
        },
        {
            TITULO: 'Coxinha da Asa de Frango',
            PRICE: '21.90',
            PRICE2: '17.90',
            TEXTO2: 'LOJA001',
            TEXTO6: '2026-06-01 00:00:00',
            TEXTO7: '2026-06-30 00:00:00'
        },
        {
            TITULO: 'Drumete de Frango Temperado',
            PRICE: '26.90',
            PRICE2: '22.90',
            TEXTO2: 'LOJA001',
            TEXTO6: '2026-06-01 00:00:00',
            TEXTO7: '2026-06-30 00:00:00'
        },
        {
            TITULO: 'Pé de Frango Limpo Congelado',
            PRICE: '8.90',
            PRICE2: '6.90',
            TEXTO2: 'LOJA001',
            TEXTO6: '2026-06-01 00:00:00',
            TEXTO7: '2026-06-30 00:00:00'
        },
        {
            TITULO: 'Meio da Asa de Frango',
            PRICE: '19.90',
            PRICE2: '15.90',
            TEXTO2: 'LOJA001',
            TEXTO6: '2026-06-01 00:00:00',
            TEXTO7: '2026-06-30 00:00:00'
        },
        {
            TITULO: 'Figado de Frango Limpo',
            PRICE: '11.90',
            PRICE2: '8.90',
            TEXTO2: 'LOJA001',
            TEXTO6: '2026-06-01 00:00:00',
            TEXTO7: '2026-06-30 00:00:00'
        },
        {
            TITULO: 'Espetinho de Frango Natural',
            PRICE: '32.90',
            PRICE2: '27.90',
            TEXTO2: 'LOJA001',
            TEXTO6: '2026-06-01 00:00:00',
            TEXTO7: '2026-06-30 00:00:00'
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
