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
        legal: 'OFERTA VALIDA DE 15/05/2026 ATÉ 18/05/2026 OU ENQUANTO DURAREM OS ESTOQUES'
    },
    
    // ─── DE-POR (Amaciante) ───────────────────────────────────────────────────
    // Exemplo: Amaciante Comfort - 23,99 → 19,99
    depor_amaciante: {
        titulo: 'AMACIANTE CONCENTRADO COMFORT 1L',
        price: '19.99',
        price2: '23.99',  // preço antigo riscado
        condicao: 'DEPOR',
        unit: '',
        legal: 'OFERTA VALIDA DE 15/05/2026 ATÉ 21/05/2026 OU ENQUANTO DURAREM OS ESTOQUES'
    },
    
    // ─── FIDELIDADE ───────────────────────────────────────────────────────────
    fidelidade: {
        titulo: 'CREME DE LEITE PIRACANJUBA CX 200G',
        price: '2.39', // preço com condição (cartão fidelidade)
        price2: '2.79', // preço antigo riscado (DE 2,79)
        price3: '1.99', // preço sem condição (preço cheio)
        condicao: 'FIDELIDADE',
        unit: '',
        legal: 'OFERTA VALIDA DE 15/05/2026 ATÉ 21/05/2026 OU ENQUANTO DURAREM OS ESTOQUES'
    },
    
    // ─── A PARTIR DE ──────────────────────────────────────────────────────────
    // Exemplo: Azeite Extra Virgem Andorinha - 35,99 UNIDADE → 26,99 UNIDADE (2+ un)
    apartirde: {
        titulo: 'AZEITE EXTRA VIRGEM ANDORINHA VD 500ML',
        price: '35.99',      // preço unitário
        price2: '26.99',     // preço com condição (2+ unidades ou cartão)
        price3: '39.99',  // preço antigo riscado (DE 39,99)
        unidades: '2',       // número de unidades para preço especial
        condicao: 'APARTIRDE',
        unit: 'UNIDADE',
        legal: 'OFERTA VALIDA DE 18/05/2026 ATÉ 21/05/2026 OU ENQUANTO DURAREM OS ESTOQUES'
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// MOCK_DATA: Configuração e seleção de cenário (ROTATIVO)
// ═══════════════════════════════════════════════════════════════════════

// Lista de todos os cenários para rotação
var SCENARIO_LIST = [
    MOCK_SCENARIOS.regular,
    MOCK_SCENARIOS.depor_creme,
    MOCK_SCENARIOS.depor_amaciante,
    MOCK_SCENARIOS.fidelidade,
    MOCK_SCENARIOS.apartirde
];

// Seleciona cenário aleatório a cada refresh
var randomIndex = Math.floor(Math.random() * SCENARIO_LIST.length);

var MOCK_DATA = {
    enabled: true,  // ← Ativar/desativar mock
    produto: SCENARIO_LIST[randomIndex]  // 🔄 Rotação automática a cada refresh
};

console.log('[Mock] Cenário selecionado:', randomIndex, '/', SCENARIO_LIST.length - 1);


