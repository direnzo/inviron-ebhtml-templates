// Mock para desenvolvimento local
// Descomente o script no HTML para ativar: <script src="js/mock-data.js"></script>

var MOCK_DATA = {
    enabled: true,
    produto: (function() {
        var produtos = [
            { descricao: 'Agua Sao Lourenco natural 510ml', preco: '3.55', preco_promoc: '2.99' },
            { descricao: 'Refrigerante Guarana Antarctica 260ml', preco: '3.49', preco_promoc: '2.79' },
            { descricao: 'Refrigerante Coca-Cola Lata 350ml', preco: '4.19', preco_promoc: '3.49' },
            { descricao: 'Salgadinho de Batata Pringles Tubo 100g', preco: '16.49', preco_promoc: '14.99' },
            { descricao: 'Leite Condensado Integral Moca Lata 395g', preco: '8.19', preco_promoc: '7.49' },
            { descricao: 'Amido de Milho Maizena 500G', preco: '18.29', preco_promoc: '16.99' },
            { descricao: 'Chocolate em Po NESTLE Dois Frades 200g', preco: '28.99', preco_promoc: '25.99' },
            { descricao: 'Filtro de Papel Original Melitta 103 Caixa 30un', preco: '5.19', preco_promoc: '4.49' },
            { descricao: 'Cereal Sucrilhos Original Kelloggs 690g', preco: '30.99', preco_promoc: '27.99' },
            { descricao: 'Cha MATTE LEAO Natural a Granel 250g', preco: '14.49', preco_promoc: '12.99' }
        ];
        return produtos[Math.floor(Math.random() * produtos.length)];
    }())
};
