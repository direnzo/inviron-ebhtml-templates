/**
 * MOCK DATA - Placar Futebol
 *
 * Para usar: descomente <script src="js/mock-data.js"></script> no HTML
 * Para trocar cenário: altere a variável `cenario` abaixo
 * Para produção: comente o <script> do mock-data no HTML
 *
 * Cenários disponíveis:
 *   'pre_jogo'    - NS:   jogo ainda não começou
 *   'ao_vivo_1h'  - 1H:   1º tempo em andamento (67')
 *   'intervalo'   - HT:   intervalo
 *   'ao_vivo_2h'  - 2H:   2º tempo em andamento (78')
 *   'prorrogacao' - ET:   prorrogação em andamento
 *   'encerrado'   - FT:   encerrado no tempo normal
 *   'encerrado_p' - AET:  encerrado na prorrogação
 *   'penalties'   - PEN:  encerrado nos pênaltis
 *   'suspenso'    - SUSP: suspenso pelo árbitro
 *   'adiado'      - PST:  adiado
 *   'cancelado'   - CANC: cancelado
 */


// Troque aqui para testar cada fase do jogo Brasil x Argentina Copa 2026:
// 'pre_jogo_copa2026', 'ao_vivo_copa2026', 'pos_jogo_copa2026'
var cenario = 'pre_jogo_copa2026';

var CENARIOS = {

    pre_jogo_copa2026: {
        D_FOOTBALL: [
            {
                TITULO:     'Brasil',
                TITULO2:    'Argentina',
                SUBTITULO:  'MetLife Stadium',
                SUBTITULO2: 'Final',
                SUBTITULO3: 'NS',
                CATEGORY:   'O Mundo em Campo 2026',
                DATE:       '2026-07-19 18:00:00',
                TEXTO:      'BRARG2026',
                FOTO:       'https://flagcdn.com/256x192/br.png',
                FOTO2:      'https://flagcdn.com/256x192/ar.png'
            }
        ],
        D_SPD: [
            { CONFIG: '0',  TYPE: '10', TITLE: 'BRARG2026', TEXT1: 'Brasil', TEXT2: 'Argentina', TEXT3: '1789802400', TEXT4: '', TEXT5: '', TEXT6: '', TEXT7: '', TEXT8: '', TEXT9: '', TEXT10: '' },
            { CONFIG: '1',  TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logoipsum-418.png' }
        ]
    },

    ao_vivo_copa2026: {
        D_FOOTBALL: [
            {
                TITULO:     'Brasil',
                TITULO2:    'Argentina',
                SUBTITULO:  'MetLife Stadium',
                SUBTITULO2: 'Final',
                SUBTITULO3: '2H',
                CATEGORY:   'O Mundo em Campo 2026',
                DATE:       '2026-07-19 18:00:00',
                TEXTO:      'BRARG2026',
                FOTO:       'https://flagcdn.com/256x192/br.png',
                FOTO2:      'https://flagcdn.com/256x192/ar.png'
            }
        ],
        D_SPD: [
            { CONFIG: '0',  TYPE: '10', TITLE: 'BRARG2026', TEXT1: 'Brasil', TEXT2: 'Argentina', TEXT3: '1789802400', TEXT4: '2H', TEXT5: '2', TEXT6: '1', TEXT7: '', TEXT8: '', TEXT9: '78', TEXT10: '' },
            { CONFIG: '1',  TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logoipsum-418.png' }
        ]
    },

    pos_jogo_copa2026: {
        D_FOOTBALL: [
            {
                TITULO:     'Brasil',
                TITULO2:    'Argentina',
                SUBTITULO:  'MetLife Stadium',
                SUBTITULO2: 'Final',
                SUBTITULO3: 'FT',
                CATEGORY:   'O Mundo em Campo 2026',
                DATE:       '2026-07-19 18:00:00',
                TEXTO:      'BRARG2026',
                FOTO:       'https://flagcdn.com/256x192/br.png',
                FOTO2:      'https://flagcdn.com/256x192/ar.png'
            }
        ],
        D_SPD: [
            { CONFIG: '0',  TYPE: '10', TITLE: 'BRARG2026', TEXT1: 'Brasil', TEXT2: 'Argentina', TEXT3: '1789802400', TEXT4: 'FT', TEXT5: '3', TEXT6: '1', TEXT7: '', TEXT8: '', TEXT9: '90', TEXT10: '' },
            { CONFIG: '1',  TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logoipsum-418.png' }
        ]
    },

    pre_jogo_2: {
        D_FOOTBALL: [
            {
                TITULO:     'Liverpool',
                TITULO2:    'Palmeiras',
                SUBTITULO:  'Anfield',
                SUBTITULO2: 'Final',
                SUBTITULO3: 'NS',
                CATEGORY:   'UEFA Champions League',
                DATE:       '2026-03-21 21:30:00',
                TEXTO:      '9900010',
                FOTO:       'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/200px-Liverpool_FC.svg.png',
                FOTO2:      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Palmeiras_logo.svg/200px-Palmeiras_logo.svg.png'
            }
        ],
        D_SPD: [
            { CONFIG: '0',  TYPE: '10', TITLE: '9900010', TEXT1: 'Liverpool', TEXT2: 'Palmeiras', TEXT3: '1774800000', TEXT4: '', TEXT5: '', TEXT6: '', TEXT7: '', TEXT8: '', TEXT9: '', TEXT10: '' },
            { CONFIG: '1',  TEXT1: 'Esse conteúdo é oferecido por:', IMAGE_LOGO: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/200px-Amazon_logo.svg.png' }
        ]
    },

    pre_jogo_3: {
        D_FOOTBALL: [
            {
                TITULO:     'Real Madrid',
                TITULO2:    'Manchester City',
                SUBTITULO:  'Santiago Bernabéu',
                SUBTITULO2: 'Quarter-Finals',
                SUBTITULO3: 'NS',
                CATEGORY:   'UEFA Champions League',
                DATE:       '2026-03-22 21:00:00',
                TEXTO:      '9900011',
                FOTO:       'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/200px-Real_Madrid_CF.svg.png',
                FOTO2:      'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/200px-Manchester_City_FC_badge.svg.png'
            }
        ],
        D_SPD: [
            { CONFIG: '0',  TYPE: '10', TITLE: '9900011', TEXT1: 'Real Madrid', TEXT2: 'Manchester City', TEXT3: '1774886400', TEXT4: '', TEXT5: '', TEXT6: '', TEXT7: '', TEXT8: '', TEXT9: '', TEXT10: '' },
            { CONFIG: '1',  TEXT1: 'Apoio:', IMAGE_LOGO: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png' }
        ]
    },

    pre_jogo_4: {
        D_FOOTBALL: [
            {
                TITULO:     'Brasil',
                TITULO2:    'Argentina',
                SUBTITULO:  'Arena Corinthians',
                SUBTITULO2: 'League Stage - 5',
                SUBTITULO3: 'TBD',
                CATEGORY:   'Copa América',
                DATE:       '2026-03-25 19:00:00',
                TEXTO:      '9900012',
                FOTO:       'https://flagcdn.com/256x192/br.png',
                FOTO2:      'https://flagcdn.com/256x192/ar.png'
            }
        ],
        D_SPD: [
            { CONFIG: '0',  TYPE: '10', TITLE: '9900012', TEXT1: 'Brasil', TEXT2: 'Argentina', TEXT3: '1775145600', TEXT4: '', TEXT5: '', TEXT6: '', TEXT7: '', TEXT8: '', TEXT9: '', TEXT10: '' },
            { CONFIG: '1',  TEXT1: 'Esse conteúdo é oferecido por:', IMAGE_LOGO: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/200px-Amazon_logo.svg.png' }
        ]
    },

    pre_jogo_5: {
        D_FOOTBALL: [
            {
                TITULO:     'Bayern Munich',
                TITULO2:    'Borussia Dortmund',
                SUBTITULO:  'Allianz Arena',
                SUBTITULO2: 'Matchday 28',
                SUBTITULO3: 'PST',
                CATEGORY:   'Bundesliga',
                DATE:       '2026-03-28 15:30:00',
                TEXTO:      '9900013',
                FOTO:       'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/200px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png',
                FOTO2:      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/200px-Borussia_Dortmund_logo.svg.png'
            }
        ],
        D_SPD: [
            { CONFIG: '0',  TYPE: '10', TITLE: '9900013', TEXT1: 'Bayern Munich', TEXT2: 'Borussia Dortmund', TEXT3: '1775404200', TEXT4: '', TEXT5: '', TEXT6: '', TEXT7: '', TEXT8: '', TEXT9: '', TEXT10: '' },
            { CONFIG: '1',  TEXT1: 'torcendo com você.', IMAGE_LOGO: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/200px-Netflix_2015_logo.svg.png' }
        ]
    },

    ao_vivo_1h: {
        D_FOOTBALL: [
            {
                TITULO:     'Arsenal',
                TITULO2:    'Chelsea',
                SUBTITULO:  'Emirates Stadium',
                SUBTITULO2: '1st Qualifying Round',
                SUBTITULO3: '1H',
                CATEGORY:   'UEFA Champions League',
                DATE:       '2026-03-20 20:00:00',
                TEXTO:      '1383422',
                FOTO:       'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/200px-Arsenal_FC.svg.png',
                FOTO2:      'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/200px-Chelsea_FC.svg.png',
            }
        ],
        D_SPD: [
            { CONFIG: '0',  TYPE: '10', TITLE: '1383422', TEXT1: 'Arsenal', TEXT2: 'Chelsea', TEXT3: '1773769500', TEXT4: '1H',  TEXT5: '1', TEXT6: '0', TEXT7: '', TEXT8: '', TEXT9: '34', TEXT10: '' },
            { CONFIG: '1',  TEXT1: 'Esse conteúdo é trazido por:', IMAGE_LOGO: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/200px-Microsoft_logo_%282012%29.svg.png' }
        ]
    },

    intervalo: {
        D_FOOTBALL: [
            {
                TITULO:     'Arsenal',
                TITULO2:    'Chelsea',
                SUBTITULO:  'Emirates Stadium',
                SUBTITULO2: '1st Qualifying Round',
                SUBTITULO3: 'HT',
                CATEGORY:   'UEFA Champions League',
                DATE:       '2026-03-20 20:00:00',
                TEXTO:      '1383422',
                FOTO:       'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/200px-Arsenal_FC.svg.png',
                FOTO2:      'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/200px-Chelsea_FC.svg.png',
            }
        ],
        D_SPD: [
            { CONFIG: '0',  TYPE: '10', TITLE: '1383422', TEXT1: 'Arsenal', TEXT2: 'Chelsea', TEXT3: '1773769500', TEXT4: 'HT',  TEXT5: '1', TEXT6: '0', TEXT7: '', TEXT8: '', TEXT9: '45', TEXT10: '' },
            { CONFIG: '1',  TEXT1: 'informa os resultados dos jogos.', IMAGE_LOGO: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/200px-Amazon_logo.svg.png' }
        ]
    },

    ao_vivo_2h: {
        D_FOOTBALL: [
            {
                TITULO:     'Arsenal',
                TITULO2:    'Chelsea',
                SUBTITULO:  'Emirates Stadium',
                SUBTITULO2: '1st Qualifying Round',
                SUBTITULO3: '2H',
                CATEGORY:   'UEFA Champions League',
                DATE:       '2026-03-20 20:00:00',
                TEXTO:      '1383422',
                FOTO:       'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/200px-Arsenal_FC.svg.png',
                FOTO2:      'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/200px-Chelsea_FC.svg.png',
            }
        ],
        D_SPD: [
            { CONFIG: '0',  TYPE: '10', TITLE: '1383422', TEXT1: 'Arsenal', TEXT2: 'Chelsea', TEXT3: '1773769500', TEXT4: '2H',  TEXT5: '2', TEXT6: '1', TEXT7: '', TEXT8: '', TEXT9: '78', TEXT10: '' },
            { CONFIG: '1',  TEXT1: 'torcendo com você.', IMAGE_LOGO: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png' }
        ]
    },

    prorrogacao: {
        D_FOOTBALL: [
            {
                TITULO:     'Arsenal',
                TITULO2:    'Chelsea',
                SUBTITULO:  'Emirates Stadium',
                SUBTITULO2: '1st Qualifying Round',
                SUBTITULO3: 'ET',
                CATEGORY:   'UEFA Champions League',
                DATE:       '2026-03-20 20:00:00',
                TEXTO:      '1383422',
                FOTO:       'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/200px-Arsenal_FC.svg.png',
                FOTO2:      'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/200px-Chelsea_FC.svg.png',
            }
        ],
        D_SPD: [
            { CONFIG: '0',  TYPE: '10', TITLE: '1383422', TEXT1: 'Arsenal', TEXT2: 'Chelsea', TEXT3: '1773769500', TEXT4: 'ET',  TEXT5: '2', TEXT6: '2', TEXT7: '', TEXT8: '', TEXT9: '100', TEXT10: '5' },
            { CONFIG: '1',  TEXT1: 'Esse conteúdo é oferecido por:', IMAGE_LOGO: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/200px-Apple_logo_black.svg.png' }
        ]
    },

    encerrado: {
        D_FOOTBALL: [
            {
                TITULO:     'Arsenal',
                TITULO2:    'Chelsea',
                SUBTITULO:  'Emirates Stadium',
                SUBTITULO2: '1st Qualifying Round',
                SUBTITULO3: 'FT',
                CATEGORY:   'UEFA Champions League',
                DATE:       '2026-03-13 17:00:00',
                TEXTO:      '1383422',
                FOTO:       'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/200px-Arsenal_FC.svg.png',
                FOTO2:      'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/200px-Chelsea_FC.svg.png',
            }
        ],
        D_SPD: [
            { CONFIG: '0',  TYPE: '10', TITLE: '1383422', TEXT1: 'Arsenal', TEXT2: 'Chelsea', TEXT3: '1773769500', TEXT4: 'FT',  TEXT5: '2', TEXT6: '1', TEXT7: '', TEXT8: '', TEXT9: '90', TEXT10: '' },
            { CONFIG: '1',  TEXT1: 'informa os resultados dos jogos.', IMAGE_LOGO: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png' }
        ]
    },

    encerrado_p: {
        D_FOOTBALL: [
            {
                TITULO:     'Arsenal',
                TITULO2:    'Chelsea',
                SUBTITULO:  'Emirates Stadium',
                SUBTITULO2: '1st Qualifying Round',
                SUBTITULO3: 'AET',
                CATEGORY:   'UEFA Champions League',
                DATE:       '2026-03-13 17:00:00',
                TEXTO:      '1383422',
                FOTO:       'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/200px-Arsenal_FC.svg.png',
                FOTO2:      'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/200px-Chelsea_FC.svg.png',
            }
        ],
        D_SPD: [
            { CONFIG: '0',  TYPE: '10', TITLE: '1383422', TEXT1: 'Arsenal', TEXT2: 'Chelsea', TEXT3: '1773769500', TEXT4: 'AET', TEXT5: '3', TEXT6: '2', TEXT7: '', TEXT8: '', TEXT9: '120', TEXT10: '' },
            { CONFIG: '1',  TEXT1: 'torcendo com você.', IMAGE_LOGO: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/200px-Netflix_2015_logo.svg.png' }
        ]
    },

    penalties: {
        D_FOOTBALL: [
            {
                TITULO:     'Liverpool',
                TITULO2:    'AC Milan',
                SUBTITULO:  'San Siro',
                SUBTITULO2: 'Quartas de Final',
                SUBTITULO3: 'PEN',
                CATEGORY:   'Copa Intercontinental',
                DATE:       '2026-03-16 21:00:00',
                TEXTO:      '9900001',
                FOTO:       'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/200px-Liverpool_FC.svg.png',
                FOTO2:      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/200px-Logo_of_AC_Milan.svg.png',
            }
        ],
        D_SPD: [
            { CONFIG: '0',  TYPE: '10', TITLE: '9900001', TEXT1: 'Liverpool', TEXT2: 'AC Milan', TEXT3: '1773864000', TEXT4: 'PEN', TEXT5: '0', TEXT6: '0', TEXT7: '4', TEXT8: '3', TEXT9: '120', TEXT10: '' },
            { CONFIG: '1',  TEXT1: 'torcendo com você.', IMAGE_LOGO: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png' }
        ]
    },

    suspenso: {
        D_FOOTBALL: [
            {
                TITULO:     'Arsenal',
                TITULO2:    'Chelsea',
                SUBTITULO:  'Emirates Stadium',
                SUBTITULO2: '1st Qualifying Round',
                SUBTITULO3: 'SUSP',
                CATEGORY:   'UEFA Champions League',
                DATE:       '2026-03-20 20:00:00',
                TEXTO:      '1383422',
                FOTO:       'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/200px-Arsenal_FC.svg.png',
                FOTO2:      'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/200px-Chelsea_FC.svg.png',
            }
        ],
        D_SPD: [
            { CONFIG: '0',  TYPE: '10', TITLE: '1383422', TEXT1: 'Arsenal', TEXT2: 'Chelsea', TEXT3: '1773769500', TEXT4: 'SUSP', TEXT5: '1', TEXT6: '1', TEXT7: '', TEXT8: '', TEXT9: '67', TEXT10: '' },
            { CONFIG: '1',  TEXT1: 'Esse conteúdo é trazido por:', IMAGE_LOGO: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/200px-Amazon_logo.svg.png' }
        ]
    },

    adiado: {
        D_FOOTBALL: [
            {
                TITULO:     'Arsenal',
                TITULO2:    'Chelsea',
                SUBTITULO:  'Emirates Stadium',
                SUBTITULO2: '1st Qualifying Round',
                SUBTITULO3: 'PST',
                CATEGORY:   'UEFA Champions League',
                DATE:       '2026-03-20 20:00:00',
                TEXTO:      '1383422',
                FOTO:       'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/200px-Arsenal_FC.svg.png',
                FOTO2:      'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/200px-Chelsea_FC.svg.png'
            }
        ],
        D_SPD: []
    },

    cancelado: {
        D_FOOTBALL: [
            {
                TITULO:     'Arsenal',
                TITULO2:    'Chelsea',
                SUBTITULO:  'Emirates Stadium',
                SUBTITULO2: '1st Qualifying Round',
                SUBTITULO3: 'CANC',
                CATEGORY:   'UEFA Champions League',
                DATE:       '2026-03-20 20:00:00',
                TEXTO:      '1383422',
                FOTO:       'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/200px-Arsenal_FC.svg.png',
                FOTO2:      'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/200px-Chelsea_FC.svg.png'
            }
        ],
        D_SPD: []
    }

};

var MOCK_DATA = {
    enabled: true,
    cenario: cenario,

    getMockLoader: function() {
        var self = this;
        var datasets = CENARIOS[self.cenario];

        return {
            loaded: function() {
                console.log('[Mock] loaded() - cenario: ' + self.cenario);
            },
            finished: function() {
                console.log('[Mock] finished() - cenario: ' + self.cenario);
            },
            data: function(nome) {
                var lista = datasets[nome] || [];
                return lista.length > 0 ? lista[0] : undefined;
            },
            datalist: function(nome) {
                var lista = datasets[nome] || [];
                return {
                    count: function() { return lista.length; },
                    get: function(i) { return lista[i]; }
                };
            }
        };
    }
};
