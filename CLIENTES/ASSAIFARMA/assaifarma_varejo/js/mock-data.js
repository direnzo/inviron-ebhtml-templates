// =============================================================================
// MOCK DE DADOS — assaifarma_varejo (produtos de farmácia)
// Para ativar: descomente a linha no index.html que carrega este script
// MOCK_DATA.enabled = false em produção
// =============================================================================

var MOCK_DATA = {
    enabled: true,
    background: 'img/fundo_assai_farma.png',

    // 14 cenários — um por tipo de condição (TEXT5)
    products: [
        // ── Tipo 1 — Preço simples (sem condição) ──────────────────────────────
        {
            tipo: '1',
            title: 'DIPIRONA SÓDICA 500MG 10 COMPRIMIDOS',
            price1: '4,99', price2: '', price3: '',
            unitPack: '', text7: '',
            img: 'img/produtos/dipirona.jpg'
        },
        // ── Tipo 2 — DE... POR ─────────────────────────────────────────────────
        {
            tipo: '2',
            title: 'PROTETOR SOLAR FPS 60 200ML',
            price1: '39,99', price2: '54,99', price3: '',
            unitPack: '', text7: '',
            img: 'img/produtos/protetor_solar.webp'
        },
        // ── Tipo 3 — Desconto de X ─────────────────────────────────────────────
        {
            tipo: '3',
            title: 'SHAMPOO ANTICASPA 350ML',
            price1: '17,99', price2: '3', price3: '',
            unitPack: '', text7: '',
            img: 'img/produtos/shampoo.webp'
        },
        // ── Tipo 4 — Leve X Pague Y por apenas ────────────────────────────────
        // TEXT2 = pague, TEXT3 = leve (confirmado com dado real do canal)
        {
            tipo: '4',
            title: 'ÁGUA MINERAL 500ML',
            price1: '2,49', price2: '2', price3: '3',
            unitPack: '', text7: '',
            img: 'img/produtos/agua_mineral.webp'
        },
        // ── Tipo 5 — Preço + Preço por embalagem ──────────────────────────────
        // TEXT1 = preço varejo, TEXT2 = preço/un na embalagem, TEXT6 = "UNIDADE"
        {
            tipo: '5',
            title: 'FRALDA GERIÁTRICA G COM 8 UNIDADES',
            price1: '32,99', price2: '4,12', price3: '',
            unitPack: 'UNIDADE', text7: '',
            img: 'img/produtos/fralda_geriatrica.webp'
        },
        // ── Tipo 6 — Preço + Atacado ou Crediffato ────────────────────────────
        // TEXT1 = preço varejo, TEXT2 = preço atacado
        {
            tipo: '6',
            title: 'ÁLCOOL EM GEL 70% 500G',
            price1: '12,99', price2: '9,99', price3: '',
            unitPack: '', text7: '',
            img: 'img/produtos/alcool_gel.webp'
        },
        // ── Tipo 7 — 3 blocos: Varejo + Atacado/Crediffato + Embalagem ─────────
        // TEXT1 = varejo → #price, TEXT3 = atacado → #price2, TEXT2 = embalagem → #price3
        {
            tipo: '7',
            title: 'WHEY PROTEIN CONCENTRADO 900G',
            price1: '129,99', price2: '99,99', price3: '15,49',
            unitPack: 'UNIDADE', text7: '',
            img: 'img/produtos/whey_protein.webp'
        },
        // ── Tipo 8 — Preço + Cliente ClubeFFato ───────────────────────────────
        // TEXT1 = varejo, TEXT2 = preço clube
        {
            tipo: '8',
            title: 'VITAMINA C 1G EFERVESCENTE 10 COMPRIMIDOS',
            price1: '18,99', price2: '14,99', price3: '',
            unitPack: '', text7: '',
            img: 'img/produtos/vitamina_c.webp'
        },
        // ── Tipo 9 — ClubeFFato Leve X Pague Y + Preço Embalagem ──────────────
        // TEXT1 = preço, TEXT2 = pague, TEXT3 = leve, TEXT6 = preço/un embalagem
        {
            tipo: '9',
            title: 'FIO DENTAL 50M',
            price1: '6,99', price2: '2', price3: '3',
            unitPack: '4,90', text7: '',
            img: 'img/produtos/fio_dental.webp'
        },
        // ── Tipo 10 — ClubeFFato desconto % na 2ª unidade ─────────────────────
        // TEXT1 = preço, TEXT2 = % de desconto
        {
            tipo: '10',
            title: 'CREME HIDRATANTE CORPORAL 400ML',
            price1: '24,99', price2: '30', price3: '',
            unitPack: '', text7: '',
            img: 'img/produtos/creme_hidratante.webp'
        },
        // ── Tipo 11 — ClubeFFato % 2ª un + Preço Embalagem ────────────────────
        // TEXT1 = preço, TEXT2 = % desconto, TEXT6 = preço/un embalagem
        {
            tipo: '11',
            title: 'ANTITÉRMICO INFANTIL SUSPENSÃO ORAL 100ML',
            price1: '22,99', price2: '20', price3: '',
            unitPack: '19,49', text7: '',
            img: 'img/produtos/antitermico_infantil.webp'
        },
        // ── Tipo 12 — Preço + X Unidades por Y ────────────────────────────────
        // TEXT1 = preço unit, TEXT2 = qtd unidades, TEXT3 = preço total
        {
            tipo: '12',
            title: 'MÁSCARA DESCARTÁVEL TRIPLA CAMADA',
            price1: '1,49', price2: '10', price3: '12,90',
            unitPack: '', text7: '',
            img: 'img/produtos/mascara_descartavel.webp'
        },
        // ── Tipo 13 — Preço + Parcelamento ────────────────────────────────────
        // TEXT1 = preço à vista, TEXT2 = nº parcelas, TEXT3 = valor parcela, TEXT7 = obs
        {
            tipo: '13',
            title: 'MEDIDOR DE PRESSÃO ARTERIAL DIGITAL DE PULSO',
            price1: '189,90', price2: '6', price3: '31,65',
            unitPack: '', text7: 'Sujeito a análise de crédito',
            img: 'img/produtos/medidor_pressao.webp'
        },
        // ── Tipo 14 — A partir de ──────────────────────────────────────────────
        {
            tipo: '14',
            title: 'PERFUME IMPORTADO LINHA PREMIUM',
            price1: '149,90', price2: '', price3: '',
            unitPack: '', text7: '',
            img: 'img/produtos/perfume_importado.webp'
        }
    ]
};
