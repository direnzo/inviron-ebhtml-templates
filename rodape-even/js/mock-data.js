/**
 * MOCK DATA — Rodapé Digital Signage
 *
 * Para usar em desenvolvimento:
 *   - Descomente <script src="js/mock-data.js"></script> no index.html
 *   - enabled: true ativa o modo mock
 *
 * Para produção: comentar o script no HTML (não é necessário mudar enabled).
 *
 * Estrutura: MOCK_DATA.canais é um objeto onde a chave é o CONFIG.canais[].tipo
 * e o valor é o dado já parseado (mesma estrutura que os módulos esperam após parseEbhtml).
 *
 * Valores baseados nos XMLs reais de exemplo (examples/):
 *   D_CLIMA_CLIMATEMPO_MOMENTO + D_CLIMA, D_CAMBIO, D_UOL,
 *   D_FOOTBALL, D_HOROSCOPO_PERSONARE_CURTO
 */

var MOCK_DATA = {
    enabled: true,

    canais: {

        /* ============================================================
           CLIMA
           Fonte: D_CLIMA_CLIMATEMPO_MOMENTO → temp/icone/desc/umid/vento
                + D_CLIMA (secundário)        → tempMin/tempMax do dia
           ============================================================ */
        clima: {
            temp:        '25',
            tempMin:     '19',
            tempMax:     '27',
            descricao:   'Sol com muitas nuvens',
            umidade:     '53',
            vento:       '5',
            iconeCodigo: '4',
            isNoite:     false
        },

        /* ============================================================
           MERCADO FINANCEIRO
           Fonte: D_CAMBIO — M1—M4 bolsas (apenas var), M5—M7 moedas
           Troca por dataset: 'D_AWESOMEAPI' para só moedas (6 itens)
           Valores numéricos brutos — renderItem formata + seta ▲▼
           ============================================================ */
        financeiro: {
            value: function (campo) {
                var map = {
                    'M1_NOME': { value: 'Dólar Comercial' },
                    'M1_QUOTE': { value: 'currency:br:dolar-comercial' },
                    'M1_VALOR': { value: '5.00' },
                    'M1_VALOR_COMPRA': { value: '4.99' },
                    'M1_VAR': { value: '-0.16' },
                    'M2_NOME': { value: 'Dólar Turismo' },
                    'M2_QUOTE': { value: 'currency:br:dolar-turismo' },
                    'M2_VALOR': { value: '5.18' },
                    'M2_VALOR_COMPRA': { value: '5.17' },
                    'M2_VAR': { value: '-0.32' },
                    'M3_NOME': { value: 'Euro' },
                    'M3_QUOTE': { value: 'currency:br:euro' },
                    'M3_VALOR': { value: '5.88' },
                    'M3_VALOR_COMPRA': { value: '5.87' },
                    'M3_VAR': { value: '0.12' },
                    'M4_NOME': { value: 'Yen' },
                    'M4_QUOTE': { value: 'currency:br:yen' },
                    'M4_VALOR': { value: '0.03' },
                    'M4_VALOR_COMPRA': { value: '0.03' },
                    'M4_VAR': { value: '0' },
                    'M5_NOME': { value: 'Peso' },
                    'M5_QUOTE': { value: 'currency:br:peso' },
                    'M5_VALOR': { value: '0.0036' },
                    'M5_VALOR_COMPRA': { value: '0.0035' },
                    'M5_VAR': { value: '0' },
                    'M6_NOME': { value: 'Libra' },
                    'M6_QUOTE': { value: 'currency:br:libra' },
                    'M6_VALOR': { value: '6.75' },
                    'M6_VALOR_COMPRA': { value: '6.74' },
                    'M6_VAR': { value: '-0.15' }
                };
                return map[campo] || { value: '' };
            },
            count: function () { return 6; },
            get: function (idx) { return this; }
        },

        /* ============================================================
           NOTÍCIAS
           Fonte: D_UOL — TEXTO = manchete, TITULO = editoria/seção
           ============================================================ */
        noticias: [
            {
                titulo:    'Datafolha aponta que 46% dos brasileiros dizem que o Brasil não passará das quartas de final na Copa',
                categoria: 'Futebol',
                descricao: '',
                fonte:     ''
            }
        ],

        /* ============================================================
           MENSAGERIA — sem XML real de exemplo; valores livres
           ============================================================ */
        mensageria: [
            {
                titulo: 'ATENÇÃO',
                texto:  'Reunião de equipe hoje às 15h00 na sala de conferências',
                cor:    '#c0392b'
            },
            {
                titulo: 'LEMBRETE',
                texto:  'Prazo de entrega de relatórios: amanhã até as 18h'
            }
        ],

        /* ============================================================
           PLACAR FUTEBOL
           Fonte: D_FOOTBALL — TITULO/TITULO2 = times, SUBTITULO2 = camp.,
                               SUBTITULO3 = status (ex: FT, HT, "2T 34'")
           Obs: D_FOOTBALL não fornece placar numérico; campos ficam vazios → exibe '-'
           ============================================================ */
        placar: [
            {
                timeCasa:    'Morocco',
                placarCasa:  '',
                placarVisit: '',
                timeVisit:   'Ecuador',
                status:      'FT',
                campeonato:  'Friendly International'
            }
        ],

        /* ============================================================
           HORÓSCOPO
           Fonte: D_HOROSCOPO_PERSONARE_CURTO — TITLE = signo, TEXT = previsão
           ============================================================ */
        horoscopo: [
            {
                signo:   'Sagitário',
                icone:   '♐',
                texto:   'Para Sagitário, o céu indica uma chance de enriquecimento por meio de interações intelectuais. Na área amorosa, reveja planos para melhor lidar com distâncias emocionais',
                periodo: ''
            }
        ]
    }
};

