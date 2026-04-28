var MOCK_DATA = {
    enabled: true,
    dados: [
        // NOTÍCIAS
        {
            category: 'noticias',
            TEXTO2: 'Goiania',
            TEXTO3: 'GO',
            TITULO: 'Boi gordo inicia semana com alta nas cotações',
            DATE: '2026-04-27 00:00:00'
        },
        //COTACOES
        {
            category: 'cotacoes',
            TEXTO2: 'Anapolis',
            TEXTO3: 'GO',
            TITULO: 'Soja', //NomeProduto
            TEXTO: 'em Grão', //Classificacao
            TEXTO4: 'Sc', //Embalagem
            TEXTO5: '60', //Quantidade
            TEXTO6: 'Kg', //Unidade
            TEXTO7: 'A vista', //Obs
            TEXTO8: '110.5', //Valor
            DATE: '2026-04-27 00:00:00'

        },
        // DÓLAR
        {
            category: 'dolar', //categoria
            TEXTO2: 'Goiania', // cidade
            TEXTO3: 'GO', // estado
            TITULO: 'Dólar Compra', // descrição completa
            TEXTO: '4,970',
            TEXTO5: '-0,54',
            DATE: '2026-04-27 00:00:00'
        },

        // TEMPO
        {
            category: 'tempo', //categoria
            TEXTO2: 'Goiania', // cidade
            TEXTO3: 'GO', // estado
            TITULO: 'Variação de Nebulosidade', // descrição climatica
            PRICE: 18, //temp minima
            PRICE2: 33, //temp maxima
            TEXTO5: 0, // Chuva Quantidade
            TEXTO6: 0, //ChuvaProbabilidade
            TEXTO7: 31, //Umidade
            TEXTO8: 4, //VentoVelocidade
            TEXTO9: 'Leste', //VentoDirecao
            DATE: '2026-04-27 00:00:00'
        }
    ]
};

// Função para pegar um item aleatório do mock
function getRandomMock() {
    var arr = MOCK_DATA.dados;
    return arr[Math.floor(Math.random() * arr.length)];
}
