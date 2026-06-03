/**
 * @file mock-data.js
 * Dados de teste para desenvolvimento local do template Andorinha Cartaz
 * 
 * COMO USAR:
 * 1. Descomente a linha no index.html: <script src="js/mock-data.js"></script>
 * 2. Escolha um dos cenários abaixo (descomente na linha 63)
 * 3. Rode: npm run dev
 * 4. Abra: http://localhost:12099/FILES/1/index.html
 */

/**
 * Cenários de teste (baseados nos cartazes reais)
 */
var MOCK_SCENARIOS = {
    
    // ─── REGULAR ──────────────────────────────────────────────────────────────
    // Exemplo: Refrigerante Coca Cola Zero 2L - R$ 11,80
    regular: {
        titulo: 'REFRIGERANTE COCA COLA ZERO 2L',
        price: '11.80',
        price2: '',
        condicao: 'REGULAR',
        unit: '',
        legal: 'OFERTAS VÁLIDAS ENQUANTO DURAREM OS ESTOQUES'
    },
    
    // ─── DE-POR (Creme de Leite) ──────────────────────────────────────────────
    // Exemplo: Creme de Leite Piracanjuba - 2,79 → 2,39
    depor_creme: {
        titulo: 'CREME DE LEITE PIRACANJUBA CX 200G',
        price: '2.39',
        price2: '2.79',  // preço antigo riscado
        condicao: 'DEPOR',
        unit: '',
        legal: 'OFERTA VALIDA DE 15/05/2026 ATÉ 18/05/2026 OU'
    },
    
    // ─── DE-POR (Amaciante) ───────────────────────────────────────────────────
    // Exemplo: Amaciante Comfort - 23,99 → 19,99
    depor_amaciante: {
        titulo: 'AMACIANTE CONCENTRADO COMFORT 1L',
        price: '19.99',
        price2: '23.99',  // preço antigo riscado
        condicao: 'DEPOR',
        unit: '',
        legal: 'OFERTA VALIDA DE 15/05/2026 ATÉ 21/05/2026 OU'
    },
    
    // ─── FIDELIDADE ───────────────────────────────────────────────────────────
    fidelidade: {
        titulo: 'PRODUTO EXEMPLO FIDELIDADE',
        price: '19.99',
        price2: '',
        condicao: 'FIDELIDADE',
        unit: '',
        legal: 'OFERTA VALIDA DE 15/05/2026 ATÉ 21/05/2026 OU'
    },
    
    // ─── A PARTIR DE ──────────────────────────────────────────────────────────
    // Exemplo: Azeite Extra Virgem Andorinha - 35,99 UNIDADE → 26,99 UNIDADE
    apartirde: {
        titulo: 'AZEITE EXTRA VIRGEM ANDORINHA VD 500ML',
        price: '35.99',   // preço unitário
        price2: '26.99',  // preço com condição (2+ unidades ou cartão)
        condicao: 'APARTIRDE',
        unit: 'UNIDADE',
        legal: 'OFERTA VALIDA DE 18/05/2026 ATÉ 21/05/2026 OU'
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// MOCK_DATA: Configuração e seleção de cenário
// ═══════════════════════════════════════════════════════════════════════════

var MOCK_DATA = {
    enabled: true,  // ← Ativar/desativar mock
    
    // ─── CENÁRIO ATIVO (descomente apenas um) ─────────────────────────────────
    produto: MOCK_SCENARIOS.depor_creme          // ✓ Creme de Leite (2,79 → 2,39)
    // produto: MOCK_SCENARIOS.regular,           // Coca Cola Zero 2L
    // produto: MOCK_SCENARIOS.depor_amaciante,   // Amaciante Comfort
    // produto: MOCK_SCENARIOS.fidelidade,        // Produto exemplo
    // produto: MOCK_SCENARIOS.apartirde          // Azeite Andorinha
};


