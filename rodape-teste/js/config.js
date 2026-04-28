/**
 * RODAPE CONFIG — EdgeContents Digital Signage
 * Arquivo de configuração global do template de rodapé.
 * Edite este arquivo para customizar layout, cores e canais ativos.
 *
 * ES5 puro — compatível com Android 7+ (WebKit legado)
 */

var CONFIG = {

    /* =====================================================
       APARÊNCIA GLOBAL
       ===================================================== */

    // Cor de fundo da barra (hex)
    corFundo: '#1a1a2e',

    // Cor principal do texto (hex)
    corTexto: '#ffffff',

    // Cor de destaque (títulos, labels, valores positivos)
    corDestaque: '#f0c040',

    // Cor do divisor vertical entre colunas (hex ou 'transparent')
    corDivisor: 'rgba(255,255,255,0.2)',

    /* =====================================================
       LOGO
       ===================================================== */

    logoPath: 'img/logo.png',
    logoAlt: 'Logo Cliente',

    // Posição: 'esquerda' | 'direita' | 'oculto'
    logoPosicao: 'esquerda',

    /* =====================================================
       RELÓGIO
       ===================================================== */

    // Posição: 'esquerda' | 'direita' | 'oculto'
    relogioPosicao: 'direita',

    /* =====================================================
       COLUNA DE CONTEÚDO
       ===================================================== */

    // Exibir a coluna de conteúdo (canais)
    conteudoVisivel: true,

    // Duração padrão de cada item em ms (usado se o módulo não definir o próprio)
    itemDuracao: 6000,

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
            dataset: 'D_CAMBIO'
            // Alternativa com só moedas (sem bolsas): dataset: 'D_AWESOMEAPI'
        },
        {
            tipo: 'noticias',
            ativo: true,
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
    ]
};
