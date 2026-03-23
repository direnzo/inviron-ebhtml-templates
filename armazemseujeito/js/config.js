/**
 * @file config.js
 * Configurações centralizadas do template Armazém Seu Jeito.
 * Tudo que o cliente pode personalizar está aqui — sem precisar abrir HTML ou JS.
 *
 * Estrutura de alto nível:
 *   timing           — duração e delay de animação
 *   dataset          — nome do dataset EBHTML
 *   priceTemplates   — mapeia condição → id do <template> HTML
 *   priceConditionAliases — normaliza strings soltas do CMS para chaves canônicas
 *   priceConditionLabels  — rótulos exibidos nos badges dos templates
 *   priceConditionRules   — regras de fallback quando TEXTO3 for ambíguo
 *   currencySymbol   — símbolo monetário (R$, $, €...)
 *   defaultLegalText — texto legal padrão se TEXTO5 vier vazio
 *   priceAnimations  — classe Tailwind de animação por condição
 *   priceColors      — classe Tailwind de cor por condição
 *   titleFit         — parâmetros do ajuste automático de fonte do título
 *   layout           — perfis de safe area, blocos, escala e proporções
 *
 * @global
 * @type {Object} TEMPLATE_CONFIG
 */
var TEMPLATE_CONFIG = {

    // ─── Temporização ─────────────────────────────────────────────────────────
    timing: {
        duration: 15000,        // Tempo de exibição em ms
        revealDelay: 100,       // Delay entre fade-in e slide (ms)
    },

    // ─── Dataset ──────────────────────────────────────────────────────────────
    dataset: 'D_MENUBOARD_PRICES',

    // ─── Layout de Preço ─────────────────────────────────────────────────────
    // Controla QUAL template HTML usar para cada condição de TEXTO3.
    // Para usar um template customizado, basta alterar o id aqui.
    priceTemplates: {
        'REGULAR':       'template_regular',
        'DEPOR':         'template_depor',
        'DE-POR':        'template_depor',
        'LEVE3PAGUE1':   'template_leve3pague1',
        'LEVE3PAGUE2':   'template_leve3pague2',
        'LEVE2PAGUE1':   'template_leve3pague2',
        'LEVE-X-PAGUE-Y':'template_levexaguey',
        'CLUBE':         'template_clube',
        'FIDELIDADE':    'template_fidelidade',
        'OFERTA':        'template_oferta',
        'COMPRE-GANHE':  'template_oferta',
        'ATACAREJO':     'template_atacarejo',
        'PARC-SEM-J':    'template_parcsemj',
        '_default':      'template_regular'
    },

    // Aliases para normalizar valores vindos do CMS/interface
    // Ex.: "DE POR", "DE/POR", "PROMOCAO" etc.
    priceConditionAliases: {
        'DE-POR': 'DEPOR',
        'DE POR': 'DEPOR',
        'DE/POR': 'DEPOR',
        'PROMOCAO': 'OFERTA',
        'PROMOÇÃO': 'OFERTA',
        'PROMO': 'OFERTA',
        'COMPRE GANHE': 'COMPRE-GANHE',
        'LEVE 3 PAGUE 1': 'LEVE3PAGUE1',
        'L3P1': 'LEVE3PAGUE1',
        'LEVE 3 PAGUE 2': 'LEVE3PAGUE2',
        'L3P2': 'LEVE3PAGUE2',
        'LEVE 2 PAGUE 1': 'LEVE2PAGUE1',
        'LEVE X PAGUE Y': 'LEVE-X-PAGUE-Y',
        'ATAC': 'ATACAREJO',
        'PARC SEM J': 'PARC-SEM-J',
        'PARCELADO': 'PARC-SEM-J',
        'SEM JUROS': 'PARC-SEM-J'
    },

    // Rótulos visuais por condição (usados nos badges dos templates)
    priceConditionLabels: {
        'LEVE3PAGUE1':   'LEVE 3 PAGUE 1',
        'LEVE3PAGUE2':   'LEVE 3 PAGUE 2',
        'LEVE2PAGUE1':   'LEVE 2 PAGUE 1',
        'LEVE-X-PAGUE-Y':'LEVE X PAGUE Y',
        'CLUBE':         'PREÇO CLUBE',
        'FIDELIDADE':    'FIDELIDADE',
        'OFERTA':        'OFERTA IMPERDIVEL',
        'COMPRE-GANHE':  'COMPRE E GANHE',
        'ATACAREJO':     'ATACAREJO',
        'PARC-SEM-J':    'SEM JUROS',
        '_default':      ''
    },

    // Regras de fallback quando TEXTO3 vier vazio ou inconsistente
    // Ordem importa: primeira regra válida vence.
    priceConditionRules: [
        { whenHasPrice2: true,  condition: 'DEPOR' },
        { whenTextContains: 'CLUBE',                        condition: 'CLUBE' },
        { whenTextContains: 'FIDELIDADE',                   condition: 'FIDELIDADE' },
        { whenTextContains: 'ATACAREJO|ATAC',               condition: 'ATACAREJO' },
        { whenTextContains: 'PARC-SEM-J|SEM JUROS|PARCELA', condition: 'PARC-SEM-J' },
        { whenTextContains: 'COMPRE.GANHE|COMPRE E GANHE',  condition: 'COMPRE-GANHE' },
        { whenTextContains: 'LEVE 3 PAGUE 1|LEVE3PAGUE1|L3P1', condition: 'LEVE3PAGUE1' },
        { whenTextContains: 'LEVE 3 PAGUE 2|LEVE3PAGUE2|L3P2', condition: 'LEVE3PAGUE2' },
        { whenTextContains: 'LEVE 2 PAGUE 1|LEVE2PAGUE1',   condition: 'LEVE2PAGUE1' },
        { whenTextContains: 'LEVE.X.PAGUE.Y',               condition: 'LEVE-X-PAGUE-Y' },
        { whenTextContains: 'OFERTA|PROMO',                  condition: 'OFERTA' },
        { fallback: true,       condition: 'REGULAR' }
    ],

    // ─── Mapeamento de Campos do Dataset ────────────────────────────────────────
    // Ajuste aqui se o dataset real usar nomes de campos diferentes.
    // Cada entrada é uma lista de fallback: o primeiro campo não-vazio é usado.
    fieldMap: {
        titulo: ['TITULO', 'TITLE', 'CATEGORY_TITLE'],
        foto:   ['FOTO',  'FOTO1', 'FOTO2', 'FOTO3', 'FOTO4', 'FOTO5', 'SELO1'],
        price:  ['PRICE', 'PRECO'],
        price2: ['PRICE2', 'PRECO2'],
        texto3: ['TEXTO3'],
        texto4: ['TEXTO4'],
        texto5: ['TEXTO5'],
        texto8: ['TEXTO8'],  // qtd itens (ATACAREJO) / nº parcelas (PARC-SEM-J) / leve (LEVE-X-PAGUE-Y)
        texto9: ['TEXTO9']   // pague (LEVE-X-PAGUE-Y)
    },

    // ─── Símbolo de Moeda ─────────────────────────────────────────────────────
    // Altere para '$', '€', etc conforme o cliente
    currencySymbol: 'R$',

    // ─── Texto Legal ──────────────────────────────────────────────────────────
    // Texto padrão se TEXTO5 estiver vazio
    defaultLegalText: '',

    // ─── Animações de Entrada ─────────────────────────────────────────────────
    // Classes Tailwind de animação mapeadas por condição de preço.
    // Troque aqui para mudar o comportamento visual por tipo de oferta.
    priceAnimations: {
        'REGULAR':       'animate-pulseScaleWithDelay',
        'DEPOR':         'animate-pulseScaleWithDelay',
        'LEVE3PAGUE1':   'animate-heartbeat',
        'LEVE3PAGUE2':   'animate-heartbeat',
        'LEVE2PAGUE1':   'animate-heartbeat',
        'LEVE-X-PAGUE-Y':'animate-heartbeat',
        'CLUBE':         'animate-popIn',
        'FIDELIDADE':    'animate-popIn',
        'OFERTA':        'animate-heartbeat',
        'COMPRE-GANHE':  'animate-heartbeat',
        'ATACAREJO':     'animate-pulseScaleWithDelay',
        'PARC-SEM-J':    'animate-pulseScaleWithDelay',
        '_default':      'animate-pulseScaleWithDelay'
    },

    // ─── Cores por Condição ───────────────────────────────────────────────────
    // Classe Tailwind de cor do preço por tipo. Aplicada no container do template.
    priceColors: {
        'REGULAR':       'text-red-600',
        'DEPOR':         'text-red-600',
        'LEVE3PAGUE1':   'text-green-700',
        'LEVE3PAGUE2':   'text-green-600',
        'LEVE2PAGUE1':   'text-green-600',
        'LEVE-X-PAGUE-Y':'text-green-600',
        'CLUBE':         'text-blue-600',
        'FIDELIDADE':    'text-blue-700',
        'OFERTA':        'text-red-700',
        'COMPRE-GANHE':  'text-red-700',
        'ATACAREJO':     'text-orange-600',
        'PARC-SEM-J':    'text-emerald-700',
        '_default':      'text-red-600'
    },

    // ─── Auto-fit de Fonte ────────────────────────────────────────────────────
    titleFit: {
        minFontSize: 10,        // Tamanho mínimo em px
        maxLines: 2,            // Máximo de linhas permitidas no título
    },

    // ─── Phase 2: Layout centralizado por formato ────────────────────────────
    layout: {
        // Topo da area branca (safe area)
        safeAreaTop: {
            default: '30vh',
            portrait: '30vh',
            landscape: '26vh',
            ultrawide: '24vh'
        },

        // Ativa colunas lado a lado por perfil
        sideBySide: {
            default: false,
            portrait: false,
            landscape: true,
            ultrawide: true
        },

        // Percentuais de altura/largura dos blocos dinamicos (legal agora é absolute, sem flexBasis)
        blocks: {
            default:   { image: 45, title: 30, price: 52 },
            portrait:  { image: 45, title: 30, price: 52 },
            landscape: { image: 52, title: 31, price: 53 },
            ultrawide: { image: 50, title: 30, price: 54 }
        },

        titleAlign: {
            default: 'center',
            portrait: 'center',
            landscape: 'center',
            ultrawide: 'center'
        },

        // Escala geral de preco por formato (aplicada no runtime)
        priceScale: {
            default: 1.00,
            portrait: 1.00,
            landscape: 1.12,
            ultrawide: 1.18
        },

        // Razões entre partes do preco
        // symbol: 0.50 = R$ ocupa metade da altura do inteiro, alinhado ao topo
        // decimal: 0.50 = centavos ocupam metade da altura do inteiro
        // unit:    0.15 = unidade ocupa 15% da altura do inteiro
        priceRatios: {
            symbol: 0.50,
            decimal: 0.50,
            unit: 0.15
        }
    }
};
