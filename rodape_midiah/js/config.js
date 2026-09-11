var CONFIG = {
    fraseFixa: 'SEU SUCESSO COMEÇA COM A ESCOLHA CERTA DE MÍDIA',
    telefone: '(19) 92005-0381',
    tempoTotalExibicao: 60000, // 1 minutos. tempo total de exibição em milissegundos
    itemDuracao: 5500, // duração de cada item em milissegundos
    fadeDuracao: 350,   // duração do efeito de transição em milissegundos
    watchdogTempo: 70000,       // tempo de watchdog em milissegundos
    maxIdadeCotacaoMinutos: 180,
    maxIdadeXmlMinutos: 360,
    toleranciaRelogioMinutos: 5,
    // tipoPermitido: 'quote' = bolsas/indices, 'currency' = moedas
    datasets: [
        { nome: 'D_CAMBIO', tipoPermitido: 'quote' },
        { nome: 'D_AWESOMEAPI', tipoPermitido: 'currency' }
    ],
    maxIndicadores: 9,
    quotesPermitidos: [
    ],
    quotesBloqueados: [
        'currency:br:yen',
        'currency:br:peso',
        'currency:br:peso-argentino'
    ],
    nomesCurtos: {
        'currency:br:dolar-comercial': 'Dólar Com.',
        'currency:br:dolar-turismo': 'Dólar Tur.',
        'currency:br:euro': 'Euro',
        'currency:br:libra': 'Libra',
        // 'currency:br:peso-argentino': 'Peso Arg.',
        // 'currency:br:dolar-canadense': 'Dólar Can.',
        // 'currency:br:dolar-australiano': 'Dólar Aus.',
        // 'currency:br:iene': 'Iene',
        // 'currency:br:franco-suico': 'Franco',
        'quote:br:bovespa': 'Bovespa',
        'quote:us:nasdaq': 'Nasdaq',
        'quote:us:dow-jones': 'Dow Jones'
    }
};