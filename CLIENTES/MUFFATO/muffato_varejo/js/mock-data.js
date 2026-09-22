// =============================================================================
// MOCK DE DADOS — muffato_varejo
// Para ativar: descomente a linha no index.html que carrega este script
// MOCK_DATA.enabled = false em produção
// =============================================================================

var MOCK_DATA = {
    enabled: true,
    background: 'img/1069.jpg',

    // 14 cenários — um por tipo de condição (TEXT5)
    products: [
        // ── Tipo 1 — Preço simples (sem condição) ──────────────────────────────
        {
            tipo: '1',
            title: 'TOMATE KG',
            price1: '2,69', price2: '', price3: '',
            unitPack: '', text7: '',
            img: 'img/produtos/arroz.jpeg'
        },
        // ── Tipo 2 — DE... POR ─────────────────────────────────────────────────
        {
            tipo: '2',
            title: 'AZEITE EXTRA VIRGEM 500ML',
            price1: '19,99', price2: '25,99', price3: '',
            unitPack: '', text7: '',
            img: 'img/produtos/azeite.webp'
        },
        // ── Tipo 3 — Desconto de X ─────────────────────────────────────────────
        {
            tipo: '3',
            title: 'SABONETE LÍQUIDO ERVA DOCE 250ML',
            price1: '8,99', price2: '3', price3: '',
            unitPack: '', text7: '',
            img: 'img/produtos/sabonete.webp'
        },
        // ── Tipo 4 — Leve X Pague Y por apenas ────────────────────────────────
        {
            tipo: '4',
            title: 'GUARANÁ KUAT LATA 350ML',
            price1: '3,99', price2: '3', price3: '2',
            unitPack: '', text7: '',
            img: 'img/produtos/guarana_kuat.png'
        },
        // ── Tipo 5 — Preço + Preço por embalagem ──────────────────────────────
        // TEXT1 = preço varejo, TEXT2 = preço/un na embalagem, TEXT6 = "UNIDADE"
        {
            tipo: '5',
            title: 'PÃO DE FORMA WICKBOLD INTEGRAL 500G',
            price1: '8,99', price2: '3,59', price3: '',
            unitPack: 'UNIDADE', text7: '',
            img: 'img/produtos/pao.webp'
        },
        // ── Tipo 6 — Preço + Atacado ou Crediffato ────────────────────────────
        // TEXT1 = preço varejo, TEXT2 = preço atacado
        {
            tipo: '6',
            title: 'PEITO DE FRANGO RESFRIADO KG',
            price1: '14,99', price2: '12,99', price3: '',
            unitPack: '', text7: '',
            img: 'img/produtos/peitofrango.png'
        },
        // ── Tipo 7 — 3 blocos: Varejo + Atacado/Crediffato + Embalagem ─────────
        // TEXT1 = varejo → #price, TEXT3 = atacado → #price2, TEXT2 = embalagem → #price3
        {
            tipo: '7',
            title: 'BOMBOM SONHO DE VALSA 1KG',
            price1: '42,99', price2: '28,99', price3: '19,99',
            unitPack: 'UNIDADE', text7: '',
            img: 'img/produtos/bombom_sonhodevalsa.webp'
        },
        // ── Tipo 8 — Preço + Cliente ClubeFFato ───────────────────────────────
        // TEXT1 = varejo, TEXT2 = preço clube
        {
            tipo: '8',
            title: 'FARINHA DE TRIGO MARGARIDA 5KG',
            price1: '24,99', price2: '19,99', price3: '',
            unitPack: '', text7: '',
            img: 'img/produtos/arroz.jpeg'
        },
        // ── Tipo 9 — ClubeFFato Leve X Pague Y + Preço Embalagem ──────────────
        // TEXT1 = preço, TEXT2 = leve, TEXT3 = pague, TEXT6 = preço/un embalagem
        {
            tipo: '9',
            title: 'IOGURTE GREGO NESTLÉ TORTA DE LIMÃO 90G',
            price1: '4,99', price2: '3', price3: '2',
            unitPack: '3,50', text7: '',
            img: 'img/produtos/iogurte_nestle.jpg'
        },
        // ── Tipo 10 — ClubeFFato desconto % na 2ª unidade ─────────────────────
        // TEXT1 = preço, TEXT2 = % de desconto
        {
            tipo: '10',
            title: 'IOGURTE DANONE MORANGO 170G',
            price1: '3,99', price2: '30', price3: '',
            unitPack: '', text7: '',
            img: 'img/produtos/iogurte_danone.jpeg'
        },
        // ── Tipo 11 — ClubeFFato % 2ª un + Preço Embalagem ────────────────────
        // TEXT1 = preço, TEXT2 = % desconto, TEXT6 = preço/un embalagem
        {
            tipo: '11',
            title: 'CAIXA DE BOMBOM LACTA 250G',
            price1: '32,99', price2: '20', price3: '',
            unitPack: '28,99', text7: '',
            img: 'img/produtos/bombom_sonhodevalsa.webp'
        },
        // ── Tipo 12 — Preço + X Unidades por Y ────────────────────────────────
        // TEXT1 = preço unit, TEXT2 = qtd unidades, TEXT3 = preço total
        {
            tipo: '12',
            title: 'CERVEJA SPATEN PURO MALTE 330ML',
            price1: '6,99', price2: '6', price3: '35,99',
            unitPack: '', text7: '',
            img: 'img/produtos/cervejaSpaten.png'
        },
        // ── Tipo 13 — Preço + Parcelamento ────────────────────────────────────
        // TEXT1 = preço à vista, TEXT2 = nº parcelas, TEXT3 = valor parcela, TEXT7 = obs
        {
            tipo: '13',
            title: 'AIR FRYER PHILIPS WALITA 4.1L',
            price1: '549,00', price2: '12', price3: '49,99',
            unitPack: '', text7: 'Sujeito a análise de crédito',
            img: 'img/produtos/airfriyer.png'
        },
        // ── Tipo 14 — A partir de ──────────────────────────────────────────────
        {
            tipo: '14',
            title: 'TV SAMSUNG 50" 4K UHD SMART',
            price1: '1.999,00', price2: '', price3: '',
            unitPack: '', text7: '',
            img: 'img/produtos/samsung.webp'
        }
    ]
};
