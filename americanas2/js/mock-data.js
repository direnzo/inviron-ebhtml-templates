// Mock para desenvolvimento local
// Descomente o script no HTML para ativar: <script src="js/mock-data.js"></script>

var MOCK_DATA = {
    enabled: true,
    produto: (function() {
        var produtos = [
            // --- COM IMAGEM ---
            { descricao: 'Smart TV LED 32" Philco PTV32G7 Roku TV Dolby Audio 2 HDMI 1 USB - Prata', preco: '2.599.00', preco_promoc: '799.00', image: 'img/tv.webp' },
            { descricao: 'Agua Sao Lourenco Natural 510ml', preco: '3.55', preco_promoc: '2.99', image: 'img/aguasaolourenco.webp' },
            { descricao: 'Refrigerante Guarana Antarctica 260ml', preco: '3.49', preco_promoc: '2.79', image: 'img/natu.webp' },
            { descricao: 'Refrigerante Coca-Cola Lata 350ml', preco: '4.19', preco_promoc: '3.49', image: 'img/coca.webp' },
            { descricao: 'Salgadinho de Batata Pringles Tubo 100g', preco: '16.49', preco_promoc: '14.99', image: 'img/prigles.webp' },
            { descricao: 'Leite Condensado Integral Moca Lata 395g', preco: '8.19', preco_promoc: '7.49', image: 'img/leitemoca.webp' },
            { descricao: 'Amido de Milho Maizena 500g', preco: '18.29', preco_promoc: '16.99', image: 'img/maizena.webp' },
            { descricao: 'Chocolate em Po NESTLE Dois Frades 200g', preco: '28.99', preco_promoc: '25.99', image: 'img/chocolate.webp' },
            { descricao: 'Filtro de Papel Original Melitta 103 Caixa 30un', preco: '5.19', preco_promoc: '4.49', image: 'img/filtro.webp' },
            { descricao: 'Cereal Sucrilhos Original Kelloggs 690g', preco: '30.99', preco_promoc: '27.99', image: 'img/sucrilhos.webp' },
            { descricao: 'Cha MATTE LEAO Natural a Granel 250g', preco: '14.49', preco_promoc: '12.99', image: 'img/cha.webp' },
            { descricao: 'Shampoo Seda Hidratacao Creme 325ml', preco: '12.99', preco_promoc: '9.99', image: 'img/seda.webp' },
            { descricao: 'Detergente Ype Neutro 500ml', preco: '3.99', preco_promoc: '2.89', image: 'img/ype.webp' },
            { descricao: 'Apple iPhone 16 128GB Preto', preco: '4.999.00', preco_promoc: '4.499.00', image: 'img/iphone.webp' },
            { descricao: 'Microondas Electrolux 31L Inox 1400W', preco: '899.00', preco_promoc: '749.90', image: 'img/microondas.webp' },
            // --- SEM IMAGEM ---
            { descricao: 'Nescafe Tradicional Instantaneo 100g', preco: '14.99', preco_promoc: '' },
            { descricao: 'Arroz Branco Tio Joao 1kg', preco: '8.49', preco_promoc: '6.99' },
            { descricao: 'Feijao Carioca Kicaldo 500g', preco: '7.29', preco_promoc: '5.99' },
            { descricao: 'Acucar Cristal Uniao 1kg', preco: '5.49', preco_promoc: '' },
            { descricao: 'Oleo de Soja Liza 900ml', preco: '9.99', preco_promoc: '7.99' },
            { descricao: 'Macarrao Instantaneo Nissin Miojo Frango 85g', preco: '2.29', preco_promoc: '1.89' },
            { descricao: 'Sal Refinado Cisne 1kg', preco: '2.99', preco_promoc: '' },
            { descricao: 'Extrato de Tomate Elefante 130g', preco: '3.49', preco_promoc: '2.79' },
            { descricao: 'Geladeira Brastemp Frost Free 375L Inox', preco: '3.499.00', preco_promoc: '2.999.00' },
            { descricao: 'Notebook Dell Inspiron 15 Intel Core i5 8GB 512GB SSD', preco: '3.199.00', preco_promoc: '2.799.00' },
            { descricao: 'Ar Condicionado Split Inverter Philco 12000 BTUs Frio', preco: '1.899.00', preco_promoc: '1.599.00' }
        ];
        return produtos[Math.floor(Math.random() * produtos.length)];
    }())
};
