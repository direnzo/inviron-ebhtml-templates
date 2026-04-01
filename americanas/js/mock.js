// ========== MODO OFFLINE/ONLINE ==========
// true = Usa MOCK (offline) | false = Usa endpoint real (online)
var OFFLINE_MODE = true;
// =========================================

// ========== SIMULAR ERRO? ==========
// true = Simula erro 500 | false = Retorna produtos normais
var SIMULATE_ERROR = false;
// ===================================

// ========== DADOS MOCKUP (Formato Real da API) ==========
var MOCK = [
    {
        codSap: '000001234567',
        descricao: 'Água São Lourenço natural 510ml',
        ean: '7896045000234',
        loja: '123',
        preco: '3.55',
        preco_promoc: '2.99'
    },
    {
        codSap: '000001234568',
        descricao: 'REFRI GUARANA ANTARCTICA 100% NAT 260ML',
        ean: '7894900010015',
        loja: '123',
        preco: '3.49',
        preco_promoc: '2.79'
    },
    {
        codSap: '000001234569',
        descricao: 'Refrigerante Coca-Cola Lata 350ml',
        ean: '7894900530056',
        loja: '123',
        preco: '4.19',
        preco_promoc: '3.49'
    },
    {
        codSap: '000001234570',
        descricao: 'Salgadinho de Batata Galinha Caipira Pringles Tubo 100g',
        ean: '3800020251891',
        loja: '123',
        preco: '16.49',
        preco_promoc: '14.99'
    },
    {
        codSap: '000001234571',
        descricao: 'Leite Condensado Integral Moça Lata 395g',
        ean: '7891000100103',
        loja: '123',
        preco: '8.19',
        preco_promoc: '7.49'
    },
    {
        codSap: '000001234572',
        descricao: 'Amido de Milho Maizena 500G',
        ean: '7892840815912',
        loja: '123',
        preco: '18.29',
        preco_promoc: '16.99'
    },
    {
        codSap: '000001234573',
        descricao: 'Chocolate em Pó NESTLÉ Dois Frades 200g',
        ean: '7891000053706',
        loja: '123',
        preco: '28.99',
        preco_promoc: '25.99'
    },
    {
        codSap: '000001234574',
        descricao: 'Filtro de Papel Original Melitta 103 Caixa 30 Unidades',
        ean: '4006508003006',
        loja: '123',
        preco: '5.19',
        preco_promoc: '4.49'
    },
    {
        codSap: '000001234575',
        descricao: 'Cereal Sucrilhos® Original Kelloggs® 690g',
        ean: '7896004708508',
        loja: '123',
        preco: '30.99',
        preco_promoc: '27.99'
    },
    {
        codSap: '000001234576',
        descricao: 'Chá MATTE LEÃO Natural à Granel 250g',
        ean: '7891098010346',
        loja: '123',
        preco: '14.49',
        preco_promoc: '12.99'
    },
];

// ========== RESPOSTA DE ERRO (Formato Real da API) ==========
var MOCK_ERROR = {
    errorCode: '500 INTERNAL_SERVER_ERROR',
    httpStatusCode: 500,
    message: 'Houve um erro na busca pelo produto'
};

// Índice do produto atual — aleatório a cada reload
var MOCK_INDEX = Math.floor(Math.random() * MOCK.length);

