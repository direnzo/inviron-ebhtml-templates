/**
 * RODAPE CONFIG — EdgeContents Digital Signage
 * Arquivo de configuração global do template de rodapé.
 * Edite este arquivo para customizar layout, cores e canais ativos.
 *
 * ES5 puro — compatível com Android 7+ (WebKit legado)
 */

/* =====================================================
   METEOCONS (biblioteca de ícones de clima)
   Lido por js/meteocons-helpers.js
   ===================================================== */

var CONFIG_CLIMA = {
    iconStyle: 'monochrome',
    iconColor: '#ca8e2b'
};

var CONFIG = {

    /* =====================================================
       APARÊNCIA GLOBAL
       ===================================================== */

    // Cor de fundo da barra (hex)
    corFundo: '#15181c',

    // Cor principal do texto (hex)
    corTexto: '#ffffff',

    // Cor de destaque (títulos, labels, valores positivos)
    corDestaque: '#ca8e2b',

    // Cor do divisor vertical entre colunas (hex ou 'transparent')
    corDivisor: '#ca8e2b',

    /* =====================================================
       LOGO
       ===================================================== */

    logoPath: 'img/focusLogo.svg',
    logoAlt: 'Logo Cliente',

    // Posição: 'esquerda' | 'direita' | 'oculto'
    logoPosicao: 'direita',

    /* =====================================================
       RELÓGIO
       ===================================================== */

    // Posição: 'esquerda' | 'direita' | 'oculto'
    relogioPosicao: 'esquerda',

    /* =====================================================
       COLUNA DE CONTEÚDO
       ===================================================== */

    // Exibir a coluna de conteúdo (canais)
    conteudoVisivel: true,

    // Tempo total do ciclo completo (ms) até chamar finished().
    // Exemplo: 1 minuto = 60000.
    // Quando > 0, itemDuracao é recalculado automaticamente:
    // itemDuracao = tempoTotalExibicao / totalDeItensDoCiclo
    tempoTotalExibicao: 60000,

    // Duração padrão de cada item em ms (usado se o módulo não definir o próprio)
    // É usado também como fallback quando tempoTotalExibicao <= 0.
    itemDuracao: 8000,

    // Duração da transição fade entre itens (ms)
    fadeDuracao: 400,

    /* =====================================================
       CANAIS — Ordem define a sequência do slideshow
       dataset: nome do dataset EBHTML (D_XXXX)
       ativo: true para incluir no slideshow
       ===================================================== */

    canais: [
        {
            tipo: 'clima',
            ativo: true,
            dataset: 'D_CLIMA_CLIMATEMPO_MOMENTO',
            // D_CLIMA é opcional: fornece min/max do dia como campos flat.
            // Usado como fallback quando D_CLIMA_CLIMATEMPO_MOMENTO não estiver disponível
            // ou para complementar min/max ausentes nos arrays horários.
            datasetSecundario: 'D_CLIMA'
        },
        {
            tipo: 'financeiro',
            ativo: true,
            // Escopo atual: analisar e suportar os dois datasets
            datasets: ['D_CAMBIO', 'D_AWESOMEAPI'],
            // Estratégia: escolhe automaticamente o dataset com data mais recente.
            estrategiaDataset: 'mais-recente',
            // Filtro opcional por quote para controlar quais moedas/índices aparecem.
            // Exemplo atual: somente dólar comercial, dólar turismo e euro.
            quotesPermitidos: [
                'currency:br:dolar-comercial',
                'currency:br:dolar-turismo',
                'currency:br:euro'
            ]
        },
        {
            tipo: 'noticias',
            ativo: false,
            dataset: 'D_UOL'
        },
        // {
        //     tipo: 'mensageria',
        //     ativo: true,
        //     dataset: 'D_MENSAGERIA'
        // },
        {
            tipo: 'placar',
            ativo: false,
            dataset: 'D_FOOTBALL'
        },
        {
            tipo: 'horoscopo',
            ativo: false,
            dataset: 'D_HOROSCOPO_PERSONARE_CURTO'
        }
    ],

    /* =====================================================
       CLIMA (render)
       ===================================================== */

    clima: {
        usarIconesAuxiliares: true,
        iconeUmidade: 'humidity'
    }
};
