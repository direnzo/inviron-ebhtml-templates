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
        'REGULAR':      'template_regular',
        'DEPOR':        'template_depor',
        'DE-POR':       'template_depor',
        'LEVE3PAGUE1':  'template_leve3pague1',
        'LEVE3PAGUE2':  'template_leve3pague2',
        'LEVE2PAGUE1':  'template_leve3pague2',
        'CLUBE':        'template_clube',
        'OFERTA':       'template_oferta',
        '_default':     'template_regular'
    },

    // Aliases para normalizar valores vindos do CMS/interface
    // Ex.: "DE POR", "DE/POR", "PROMOCAO" etc.
    priceConditionAliases: {
        'DEPOR': 'DEPOR',
        'DE-POR': 'DEPOR',
        'DE POR': 'DEPOR',
        'DE/POR': 'DEPOR',
        'PROMOCAO': 'OFERTA',
        'PROMOÇÃO': 'OFERTA',
        'PROMO': 'OFERTA',
        'OFERTA': 'OFERTA',
        'CLUBE': 'CLUBE',
        'LEVE3PAGUE1': 'LEVE3PAGUE1',
        'LEVE 3 PAGUE 1': 'LEVE3PAGUE1',
        'L3P1': 'LEVE3PAGUE1',
        'LEVE3PAGUE2': 'LEVE3PAGUE2',
        'LEVE 3 PAGUE 2': 'LEVE3PAGUE2',
        'L3P2': 'LEVE3PAGUE2',
        'LEVE2PAGUE1': 'LEVE2PAGUE1',
        'LEVE 2 PAGUE 1': 'LEVE2PAGUE1',
        'REGULAR': 'REGULAR'
    },

    // Rótulos visuais por condição (usados nos badges dos templates)
    priceConditionLabels: {
        'LEVE3PAGUE1': 'LEVE 3 PAGUE 1',
        'LEVE3PAGUE2': 'LEVE 3 PAGUE 2',
        'LEVE2PAGUE1': 'LEVE 2 PAGUE 1',
        'CLUBE': 'PRECO CLUBE',
        'OFERTA': 'OFERTA IMPERDIVEL',
        '_default': ''
    },

    // Regras de fallback quando TEXTO3 vier vazio ou inconsistente
    // Ordem importa: primeira regra válida vence.
    priceConditionRules: [
        { whenHasPrice2: true, condition: 'DEPOR' },
        { whenTextContains: 'CLUBE', condition: 'CLUBE' },
        { whenTextContains: 'LEVE 3 PAGUE 1|LEVE3PAGUE1|L3P1', condition: 'LEVE3PAGUE1' },
        { whenTextContains: 'LEVE 3 PAGUE 2|LEVE3PAGUE2|L3P2', condition: 'LEVE3PAGUE2' },
        { whenTextContains: 'LEVE 2 PAGUE 1|LEVE2PAGUE1', condition: 'LEVE2PAGUE1' },
        { whenTextContains: 'OFERTA|PROMO', condition: 'OFERTA' },
        { fallback: true, condition: 'REGULAR' }
    ],

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
        'REGULAR':      'animate-pulseScaleWithDelay',
        'DEPOR':        'animate-pulseScaleWithDelay',
        'DE-POR':       'animate-pulseScaleWithDelay',
        'LEVE3PAGUE1':  'animate-heartbeat',
        'LEVE3PAGUE2':  'animate-heartbeat',
        'LEVE2PAGUE1':  'animate-heartbeat',
        'CLUBE':        'animate-popIn',
        'OFERTA':       'animate-heartbeat',
        '_default':     'animate-pulseScaleWithDelay'
    },

    // ─── Cores por Condição ───────────────────────────────────────────────────
    // Classe Tailwind de cor do preço por tipo. Aplicada no container do template.
    priceColors: {
        'REGULAR':      'text-red-600',
        'DEPOR':        'text-red-600',
        'DE-POR':       'text-red-600',
        'LEVE3PAGUE1':  'text-green-700',
        'LEVE3PAGUE2':  'text-green-600',
        'LEVE2PAGUE1':  'text-green-600',
        'CLUBE':        'text-blue-600',
        'OFERTA':       'text-red-700',
        '_default':     'text-red-600'
    },

    // ─── Auto-fit de Fonte ────────────────────────────────────────────────────
    titleFit: {
        minFontSize: 10,        // Tamanho mínimo em px
        maxLines: 3,            // Truncar além de N linhas
    },

    // ─── Phase 2: Layout centralizado por formato ────────────────────────────
    layout: {
        // Topo da area branca (safe area)
        safeAreaTop: {
            default: '34vh',
            portrait: '34vh',
            landscape: '30vh',
            ultrawide: '24vh'
        },

        // Ativa colunas lado a lado por perfil
        sideBySide: {
            default: false,
            portrait: false,
            landscape: true,
            ultrawide: true
        },

        // Percentuais de altura/largura dos blocos dinamicos
        blocks: {
            default:   { image: 45, title: 30, price: 52, legal: 18 },
            portrait:  { image: 45, title: 30, price: 52, legal: 18 },
            landscape: { image: 52, title: 31, price: 53, legal: 16 },
            ultrawide: { image: 50, title: 30, price: 54, legal: 16 }
        },

        titleAlign: {
            default: 'center',
            portrait: 'center',
            landscape: 'center',
            ultrawide: 'center'
        },

        legal: {
            opacity: {
                default: 0.70,
                portrait: 0.70,
                landscape: 0.50,
                ultrawide: 0.45
            },
            fontSize: {
                default: '36%',
                portrait: '34%',
                landscape: '28%',
                ultrawide: '24%'
            }
        },

        // Escala geral de preco por formato (aplicada no runtime)
        priceScale: {
            default: 1.00,
            portrait: 1.00,
            landscape: 1.12,
            ultrawide: 1.18
        },

        // Razoes entre partes do preco (base proporcao aurea)
        priceRatios: {
            symbol: 0.62,
            decimal: 0.39,
            unit: 0.24
        }
    }
};
