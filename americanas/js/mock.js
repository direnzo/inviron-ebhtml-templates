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
        image: 'img/aguasaolourenco.webp',
        loja: '123',
        preco: '3.55',
        preco_promoc: '2.99'
    },
    {
        codSap: '000001234568',
        descricao: 'REFRI GUARANA ANTARCTICA 100% NAT 260ML',
        ean: '7894900010015',
        image: 'img/natu.webp',
        loja: '123',
        preco: '3.49',
        preco_promoc: '2.79'
    },
    {
        codSap: '000001234569',
        descricao: 'Refrigerante Coca-Cola Lata 350ml',
        ean: '7894900530056',
        image: 'img/coca.webp',
        loja: '123',
        preco: '4.19',
        preco_promoc: '3.49'
    },
    {
        codSap: '000001234570',
        descricao: 'Salgadinho de Batata Galinha Caipira Pringles Tubo 100g',
        ean: '3800020251891',
        image: 'img/prigles.webp',
        loja: '123',
        preco: '16.49',
        preco_promoc: '14.99'
    },
    {
        codSap: '000001234571',
        descricao: 'Leite Condensado Integral Moça Lata 395g',
        ean: '7891000100103',
        image: 'img/leitemoca.webp',
        loja: '123',
        preco: '8.19',
        preco_promoc: '7.49'
    },
    {
        codSap: '000001234572',
        descricao: 'Amido de Milho Maizena 500G',
        ean: '7892840815912',
        image: 'img/maizena.webp',
        loja: '123',
        preco: '18.29',
        preco_promoc: '16.99'
    },
    {
        codSap: '000001234573',
        descricao: 'Chocolate em Pó NESTLÉ Dois Frades 200g',
        ean: '7891000053706',
        image: 'img/chocolate.webp',
        loja: '123',
        preco: '28.99',
        preco_promoc: '25.99'
    },
    {
        codSap: '000001234574',
        descricao: 'Filtro de Papel Original Melitta 103 Caixa 30 Unidades',
        ean: '4006508003006',
        image: 'img/filtro.webp',
        loja: '123',
        preco: '5.19',
        preco_promoc: '4.49'
    },
    {
        codSap: '000001234575',
        descricao: 'Cereal Sucrilhos® Original Kelloggs® 690g',
        ean: '7896004708508',
        image: 'img/sucrilhos.webp',
        loja: '123',
        preco: '30.99',
        preco_promoc: '27.99'
    },
    {
        codSap: '000001234576',
        descricao: 'Chá MATTE LEÃO Natural à Granel 250g',
        ean: '7891098010346',
        image: 'img/cha.webp',
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

var MOCK_INDEX = 0; // Índice do produto atual

// ========== FUNÇÕES DE SIMULAÇÃO ==========

// Avança para o próximo produto (com reload)
function simularProximoProduto() {
    console.log('🔄 Simulando próximo produto...');
    MOCK_INDEX++;
    location.reload();
}

// Troca de produto sem reload (animação suave)
function trocarProdutoSemReload() {
    if (!OFFLINE_MODE) return;
    
    MOCK_INDEX++;
    var mockProduct = MOCK[MOCK_INDEX % MOCK.length];
    
    console.log('🔄 Trocando para produto:', mockProduct.title);
    
    // Reseta animações
    var elements = ['#produto', '#titulo', '#moeda', '#preco', '#moeda-portrait', '#preco-portrait'];
    elements.forEach(function(selector) {
        var el = document.querySelector(selector);
        if (el && el.parentElement) {
            el.parentElement.style.opacity = '0';
        }
    });
    
    // Aguarda e atualiza
    setTimeout(function() {
        var image = document.getElementById('produto');
        var titulo = document.getElementById('titulo');
        var preco = document.getElementById('preco');
        var precoPortrait = document.getElementById('preco-portrait');
        var moeda = document.getElementById('moeda');
        var moedaPortrait = document.getElementById('moeda-portrait');
        
        if (image) image.src = mockProduct.image;
        if (titulo) titulo.innerText = mockProduct.descricao;
        if (preco) preco.innerText = mockProduct.preco.replace('.', ',');
        if (precoPortrait) precoPortrait.innerText = mockProduct.preco.replace('.', ',');
        if (moeda) moeda.innerText = 'R$';
        if (moedaPortrait) moedaPortrait.innerText = 'R$';
        
        // Aplica textFit após atualizar
        setTimeout(function() {
            aplicarTextFit();
            console.log('✅ TextFit aplicado após troca de produto');
        }, 200);
        
        // Atualiza indicador
        var productIndexSpan = document.getElementById('product-index');
        if (productIndexSpan) {
            productIndexSpan.innerText = (MOCK_INDEX % MOCK.length) + 1;
        }
        
        // Reaplica animações
        elements.forEach(function(selector) {
            var el = document.querySelector(selector);
            if (el && el.parentElement) {
                el.parentElement.style.animation = 'none';
                setTimeout(function() {
                    el.parentElement.style.animation = '';
                    el.parentElement.style.opacity = '';
                }, 10);
            }
        });
    }, 500);
}

// ========== ATALHOS DE TECLADO ==========

// ESPAÇO: Próximo produto (com reload)
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' && OFFLINE_MODE) {
        event.preventDefault();
        simularProximoProduto();
    }
});

// N: Próximo produto (sem reload)
document.addEventListener('keydown', function(event) {
    if ((event.key === 'n' || event.key === 'N') && OFFLINE_MODE) {
        trocarProdutoSemReload();
    }
});

// R: Resetar para o primeiro produto
document.addEventListener('keydown', function(event) {
    if ((event.key === 'r' || event.key === 'R') && OFFLINE_MODE) {
        console.log('🔄 Resetando para o primeiro produto...');
        MOCK_INDEX = 0;
        location.reload();
    }
});

// E: Simular erro
document.addEventListener('keydown', function(event) {
    if ((event.key === 'e' || event.key === 'E') && OFFLINE_MODE) {
        console.log('❌ Simulando erro 500...');
        SIMULATE_ERROR = true;
        location.reload();
    }
});
