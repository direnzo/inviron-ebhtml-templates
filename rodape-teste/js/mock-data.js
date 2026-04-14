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
 * e o valor é o dado já parseado (mesma estrutura que os módulos esperam).
 */

var MOCK_DATA = {
    enabled: true,

    canais: {

        /* ============================================================
           CLIMA
           ============================================================ */
        clima: {
            cidade:      'São Paulo',
            estado:      'SP',
            temp:        '25',
            tempMin:     '19',
            tempMax:     '30',
            descricao:   'Parcialmente nublado com chuva à tarde',
            iconeCodigo: '3'
        },

        /* ============================================================
           MERCADO FINANCEIRO — array de indicadores
           ============================================================ */
        financeiro: [
            {
                nome:     'Dólar',
                valor:    'R$ 5,82',
                variacao: '0,35',
                icone:    '$'
            },
            {
                nome:     'Euro',
                valor:    'R$ 6,34',
                variacao: '-0,12',
                icone:    '€'
            },
            {
                nome:     'Bitcoin',
                valor:    'R$ 487.200',
                variacao: '2,15',
                icone:    '₿'
            }
        ],

        /* ============================================================
           NOTÍCIAS — array de itens
           ============================================================ */
        noticias: [
            {
                titulo:    'Ibovespa fecha em alta de 1,2% após dados positivos da inflação',
                categoria: 'ECONOMIA',
                fonte:     'Valor Econômico'
            },
            {
                titulo:    'Seleção Brasileira vence amistoso por 3 a 1 contra Argentina',
                categoria: 'FUTEBOL',
                fonte:     'Globo Esporte'
            },
            {
                titulo:    'Governo anuncia investimento de R$ 10 bilhões em infraestrutura',
                categoria: 'POLÍTICA',
                fonte:     'Folha de SP'
            },
            {
                titulo:    'Apple lança novo iPhone com chip de inteligência artificial',
                categoria: 'TECNOLOGIA',
                fonte:     'Canaltech'
            }
        ],

        /* ============================================================
           MENSAGERIA — array de mensagens
           ============================================================ */
        mensageria: [
            {
                titulo: 'ATENÇÃO',
                texto:  'Reunião de equipe hoje às 15h00 na sala de conferências',
                cor:    '#c0392b'
            },
            {
                titulo: 'LEMBRETE',
                texto:  'Prazo de entrega de relatórios: amanhã até as 18h',
                cor:    '#e67e22'
            }
        ],

        /* ============================================================
           PLACAR FUTEBOL — array de jogos (inativo por padrão no config)
           ============================================================ */
        placar: [
            {
                timeCasa:    'Flamengo',
                placarCasa:  '2',
                placarVisit: '1',
                timeVisit:   'Palmeiras',
                status:      'Ao Vivo',
                campeonato:  'Brasileirão'
            },
            {
                timeCasa:    'São Paulo',
                placarCasa:  '0',
                placarVisit: '0',
                timeVisit:   'Corinthians',
                status:      '2T 34\'',
                campeonato:  'Brasileirão'
            }
        ],

        /* ============================================================
           HORÓSCOPO — array de signos (inativo por padrão no config)
           ============================================================ */
        horoscopo: [
            {
                signo:   'Áries',
                icone:   '♈',
                texto:   'Dia favorável para decisões corajosas. Confie no seu instinto.',
                periodo: 'Hoje'
            },
            {
                signo:   'Touro',
                icone:   '♉',
                texto:   'Momento de estabilidade financeira. Boas notícias chegam.',
                periodo: 'Hoje'
            },
            {
                signo:   'Gêmeos',
                icone:   '♊',
                texto:   'Comunicação em alta. Parcerias trazem resultados positivos.',
                periodo: 'Hoje'
            }
        ]
    }
};

