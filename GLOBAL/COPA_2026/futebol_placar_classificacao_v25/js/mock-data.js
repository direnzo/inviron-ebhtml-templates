/**
 * MOCK DATA - Placar Futebol
 * O mundo em campo 2026
 *
 * Para usar: descomente <script src="js/mock-data.js"></script> no HTML
 * Para trocar cen�rio: altere a vari�vel `cenario` abaixo
 * Para produ��o: comente o <script> do mock-data no HTML
 *
 * -- FASE DE GRUPOS -----------------------------------------------
 *   'copa2026_grupo_br_pre'      BRA x SRB | NS       | Grupo G Rodada 1
 *   'copa2026_grupo_br_1h'       BRA x SRB | 1H  23' | 1-0
 *   'copa2026_grupo_br_ht'       BRA x SRB | HT       | Intervalo 2-0
 *   'copa2026_grupo_br_2h'       BRA x SRB | 2H  67' | 3-0
 *   'copa2026_grupo_br_ft'       BRA x SRB | FT       | Encerrado 3-0
 *   'copa2026_grupo_espfra_2h'   ESP x FRA | 2H  78' | 1-1 (empate tenso)
 *   'copa2026_grupo_arur_ft'     ARG x URU | FT       | 2-0 (derby sul-americano)
 *
 * -- OITAVAS DE FINAL ---------------------------------------------
 *   'copa2026_r16_pre'           BRA x MEX | NS       | Oitavas de Final
 *   'copa2026_r16_2h'            BRA x MEX | 2H  72' | 1-0
 *   'copa2026_r16_ft'            BRA x MEX | FT       | 2-1
 *
 * -- QUARTAS DE FINAL ---------------------------------------------
 *   'copa2026_qf_pre'            BRA x ING | NS       | Quartas de Final
 *   'copa2026_qf_et'             BRA x ING | ET 105'+3| 1-1 (prorroga��o)
 *   'copa2026_qf_pen'            BRA x ING | PEN      | 1-1 (pen 5-4)
 *
 * -- SEMIFINAIS ---------------------------------------------------
 *   'copa2026_semi_pre'          ARG x POR | NS       | Semifinal
 *   'copa2026_semi_2h'           ARG x POR | 2H  82' | 2-1
 *   'copa2026_semi_ft'           ARG x POR | FT       | 3-2
 *
 * -- GOLEADA 7x1 -------------------------------------------------
 *   'copa2026_goleada_1h'        BRA x GER | 1H  43' | 4-0 (goleada em curso)
 *   'copa2026_goleada_2h'        BRA x GER | 2H  90'+5| 7-1 (minutos finais)
 *   'copa2026_goleada_ft'        BRA x GER | FT       | 7-1 (encerrado)
 *
 * -- FINAL --------------------------------------------------------
 *   'copa2026_final_pre'         BRA x ARG | NS       | Final
 *   'copa2026_final_1h'          BRA x ARG | 1H  38' | 1-0
 *   'copa2026_final_2h'          BRA x ARG | 2H  82' | 2-1
 *   'copa2026_final_et'          BRA x ARG | ET 109' | 2-2 (prorroga��o)
 *   'copa2026_final_pen'         BRA x ARG | PEN      | 2-2 (pen 4-2)
 *   'copa2026_final_ft'          BRA x ARG | FT       | 3-1
 *
 * -- DISPUTA DE 3� LUGAR ------------------------------------------
 *   'copa2026_terceiro_pre'      FRA x MAR | NS       | Disputa de 3� Lugar
 *   'copa2026_terceiro_ft'       FRA x MAR | FT       | 2-1
 */

// Lista de cen�rios para rotação aleat�ria
var CENARIOS_LISTA = [
    'copa2026_grupo_br_pre',
    'copa2026_grupo_br_1h',
    'copa2026_grupo_br_ht',
    'copa2026_grupo_br_2h',
    'copa2026_grupo_br_ft',
    'copa2026_grupo_espfra_2h',
    'copa2026_grupo_arur_ft',
    'copa2026_r16_pre',
    'copa2026_r16_2h',
    'copa2026_r16_ft',
    'copa2026_qf_pre',
    'copa2026_qf_et',
    'copa2026_qf_pen',
    'copa2026_semi_pre',
    'copa2026_semi_2h',
    'copa2026_semi_ft',
    'copa2026_goleada_1h',
    'copa2026_goleada_2h',
    'copa2026_goleada_ft',
    'copa2026_terceiro_pre',
    'copa2026_terceiro_ft',
    'copa2026_final_pre',
    'copa2026_final_1h',
    'copa2026_final_2h',
    'copa2026_final_et',
    'copa2026_final_pen',
    'copa2026_final_ft'
];

// Para fixar um cen�rio espec�fico: substitua o valor abaixo pelo nome desejado
// Para rotação aleat�ria: deixe como est�
var cenario = CENARIOS_LISTA[Math.floor(Math.random() * CENARIOS_LISTA.length)];

var CENARIOS = {

    /* ================================================================
       FASE DE GRUPOS � BRA x SRB  (Grupo G � Rodada 1)
       Estadio: AT&T Stadium, Arlington TX
       ================================================================ */
    copa2026_grupo_br_pre: {
        D_FOOTBALL: [{
            TITULO:     'Brasil',
            TITULO2:    'Sérvia',
            SUBTITULO:  'AT&T Stadium',
            SUBTITULO2: 'Matchday 1',
            SUBTITULO3: 'NS',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-06-14 15:00:00',
            TEXTO:      'WC26_BRRS_G',
            FOTO:       'https://flagcdn.com/256x192/br.png',
            FOTO2:      'https://flagcdn.com/256x192/rs.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_BRRS_G', TEXT1: 'Brasil', TEXT2: 'Sérvia', TEXT3: '', TEXT4: '',    TEXT5: '',  TEXT6: '',  TEXT7: '', TEXT8: '', TEXT9: '',   TEXT10: '' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    copa2026_grupo_br_1h: {
        D_FOOTBALL: [{
            TITULO:     'Brasil',
            TITULO2:    'Sérvia',
            SUBTITULO:  'AT&T Stadium',
            SUBTITULO2: 'Matchday 1',
            SUBTITULO3: '1H',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-06-14 15:00:00',
            TEXTO:      'WC26_BRRS_G',
            FOTO:       'https://flagcdn.com/256x192/br.png',
            FOTO2:      'https://flagcdn.com/256x192/rs.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_BRRS_G', TEXT1: 'Brasil', TEXT2: 'Sérvia', TEXT3: '', TEXT4: '1H',  TEXT5: '1',  TEXT6: '0',  TEXT7: '', TEXT8: '', TEXT9: '23',  TEXT10: '' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    copa2026_grupo_br_ht: {
        D_FOOTBALL: [{
            TITULO:     'Brasil',
            TITULO2:    'Sérvia',
            SUBTITULO:  'AT&T Stadium',
            SUBTITULO2: 'Matchday 1',
            SUBTITULO3: 'HT',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-06-14 15:00:00',
            TEXTO:      'WC26_BRRS_G',
            FOTO:       'https://flagcdn.com/256x192/br.png',
            FOTO2:      'https://flagcdn.com/256x192/rs.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_BRRS_G', TEXT1: 'Brasil', TEXT2: 'Sérvia', TEXT3: '', TEXT4: 'HT',  TEXT5: '2',  TEXT6: '0',  TEXT7: '', TEXT8: '', TEXT9: '45',  TEXT10: '3' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    copa2026_grupo_br_2h: {
        D_FOOTBALL: [{
            TITULO:     'Brasil',
            TITULO2:    'Sérvia',
            SUBTITULO:  'AT&T Stadium',
            SUBTITULO2: 'Matchday 1',
            SUBTITULO3: '2H',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-06-14 15:00:00',
            TEXTO:      'WC26_BRRS_G',
            FOTO:       'https://flagcdn.com/256x192/br.png',
            FOTO2:      'https://flagcdn.com/256x192/rs.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_BRRS_G', TEXT1: 'Brasil', TEXT2: 'Sérvia', TEXT3: '', TEXT4: '2H',  TEXT5: '3',  TEXT6: '0',  TEXT7: '', TEXT8: '', TEXT9: '67',  TEXT10: '' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    copa2026_grupo_br_ft: {
        D_FOOTBALL: [{
            TITULO:     'Brasil',
            TITULO2:    'Sérvia',
            SUBTITULO:  'AT&T Stadium',
            SUBTITULO2: 'Matchday 1',
            SUBTITULO3: 'FT',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-06-14 15:00:00',
            TEXTO:      'WC26_BRRS_G',
            FOTO:       'https://flagcdn.com/256x192/br.png',
            FOTO2:      'https://flagcdn.com/256x192/rs.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_BRRS_G', TEXT1: 'Brasil', TEXT2: 'Sérvia', TEXT3: '', TEXT4: 'FT',  TEXT5: '3',  TEXT6: '0',  TEXT7: '', TEXT8: '', TEXT9: '90',  TEXT10: '' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    /* ----------------------------------------------------------------
       FASE DE GRUPOS � ESP x FRA  (Grupo D � Rodada 2)
       Estadio: Rose Bowl, Pasadena CA
       ---------------------------------------------------------------- */
    copa2026_grupo_espfra_2h: {
        D_FOOTBALL: [{
            TITULO:     'Espanha',
            TITULO2:    'França',
            SUBTITULO:  'Rose Bowl',
            SUBTITULO2: 'Matchday 2',
            SUBTITULO3: '2H',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-06-21 18:00:00',
            TEXTO:      'WC26_ESFR_G',
            FOTO:       'https://flagcdn.com/256x192/es.png',
            FOTO2:      'https://flagcdn.com/256x192/fr.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_ESFR_G', TEXT1: 'Espanha', TEXT2: 'França', TEXT3: '', TEXT4: '2H',  TEXT5: '1',  TEXT6: '1',  TEXT7: '', TEXT8: '', TEXT9: '78',  TEXT10: '' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    /* ----------------------------------------------------------------
       FASE DE GRUPOS � ARG x URU  (Grupo F � Rodada 3)
       Estadio: Estadio Azteca, Cidade do M�xico
       ---------------------------------------------------------------- */
    copa2026_grupo_arur_ft: {
        D_FOOTBALL: [{
            TITULO:     'Argentina',
            TITULO2:    'Uruguai',
            SUBTITULO:  'Estadio Azteca',
            SUBTITULO2: 'Matchday 3',
            SUBTITULO3: 'FT',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-06-26 20:00:00',
            TEXTO:      'WC26_ARUY_G',
            FOTO:       'https://flagcdn.com/256x192/ar.png',
            FOTO2:      'https://flagcdn.com/256x192/uy.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_ARUY_G', TEXT1: 'Argentina', TEXT2: 'Uruguai', TEXT3: '', TEXT4: 'FT',  TEXT5: '2',  TEXT6: '0',  TEXT7: '', TEXT8: '', TEXT9: '90',  TEXT10: '' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    /* ================================================================
       OITAVAS DE FINAL � BRA x MEX
       Estadio: Levi's Stadium, Santa Clara CA
       ================================================================ */
    copa2026_r16_pre: {
        D_FOOTBALL: [{
            TITULO:     'Brasil',
            TITULO2:    'México',
            SUBTITULO:  "Levi's Stadium",
            SUBTITULO2: 'Round of 16',
            SUBTITULO3: 'NS',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-07-01 17:00:00',
            TEXTO:      'WC26_BRMX_R16',
            FOTO:       'https://flagcdn.com/256x192/br.png',
            FOTO2:      'https://flagcdn.com/256x192/mx.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_BRMX_R16', TEXT1: 'Brasil', TEXT2: 'México', TEXT3: '', TEXT4: '',    TEXT5: '',   TEXT6: '',   TEXT7: '', TEXT8: '', TEXT9: '',    TEXT10: '' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    copa2026_r16_2h: {
        D_FOOTBALL: [{
            TITULO:     'Brasil',
            TITULO2:    'México',
            SUBTITULO:  "Levi's Stadium",
            SUBTITULO2: 'Round of 16',
            SUBTITULO3: '2H',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-07-01 17:00:00',
            TEXTO:      'WC26_BRMX_R16',
            FOTO:       'https://flagcdn.com/256x192/br.png',
            FOTO2:      'https://flagcdn.com/256x192/mx.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_BRMX_R16', TEXT1: 'Brasil', TEXT2: 'México', TEXT3: '', TEXT4: '2H',  TEXT5: '1',  TEXT6: '0',  TEXT7: '', TEXT8: '', TEXT9: '72',  TEXT10: '' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    copa2026_r16_ft: {
        D_FOOTBALL: [{
            TITULO:     'Brasil',
            TITULO2:    'México',
            SUBTITULO:  "Levi's Stadium",
            SUBTITULO2: 'Round of 16',
            SUBTITULO3: 'FT',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-07-01 17:00:00',
            TEXTO:      'WC26_BRMX_R16',
            FOTO:       'https://flagcdn.com/256x192/br.png',
            FOTO2:      'https://flagcdn.com/256x192/mx.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_BRMX_R16', TEXT1: 'Brasil', TEXT2: 'México', TEXT3: '', TEXT4: 'FT',  TEXT5: '2',  TEXT6: '1',  TEXT7: '', TEXT8: '', TEXT9: '90',  TEXT10: '' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    /* ================================================================
       QUARTAS DE FINAL � BRA x ING
       Estadio: MetLife Stadium, East Rutherford NJ
       ================================================================ */
    copa2026_qf_pre: {
        D_FOOTBALL: [{
            TITULO:     'Brasil',
            TITULO2:    'Inglaterra',
            SUBTITULO:  'MetLife Stadium',
            SUBTITULO2: 'Quarter-Finals',
            SUBTITULO3: 'NS',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-07-08 19:00:00',
            TEXTO:      'WC26_BRENG_QF',
            FOTO:       'https://flagcdn.com/256x192/br.png',
            FOTO2:      'https://flagcdn.com/256x192/gb-eng.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_BRENG_QF', TEXT1: 'Brasil', TEXT2: 'Inglaterra', TEXT3: '', TEXT4: '',    TEXT5: '',   TEXT6: '',   TEXT7: '', TEXT8: '', TEXT9: '',    TEXT10: '' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    copa2026_qf_et: {
        D_FOOTBALL: [{
            TITULO:     'Brasil',
            TITULO2:    'Inglaterra',
            SUBTITULO:  'MetLife Stadium',
            SUBTITULO2: 'Quarter-Finals',
            SUBTITULO3: 'ET',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-07-08 19:00:00',
            TEXTO:      'WC26_BRENG_QF',
            FOTO:       'https://flagcdn.com/256x192/br.png',
            FOTO2:      'https://flagcdn.com/256x192/gb-eng.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_BRENG_QF', TEXT1: 'Brasil', TEXT2: 'Inglaterra', TEXT3: '', TEXT4: 'ET',  TEXT5: '1',  TEXT6: '1',  TEXT7: '', TEXT8: '', TEXT9: '105', TEXT10: '3' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    copa2026_qf_pen: {
        D_FOOTBALL: [{
            TITULO:     'Brasil',
            TITULO2:    'Inglaterra',
            SUBTITULO:  'MetLife Stadium',
            SUBTITULO2: 'Quarter-Finals',
            SUBTITULO3: 'PEN',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-07-08 19:00:00',
            TEXTO:      'WC26_BRENG_QF',
            FOTO:       'https://flagcdn.com/256x192/br.png',
            FOTO2:      'https://flagcdn.com/256x192/gb-eng.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_BRENG_QF', TEXT1: 'Brasil', TEXT2: 'Inglaterra', TEXT3: '', TEXT4: 'PEN', TEXT5: '1',  TEXT6: '1',  TEXT7: '5', TEXT8: '4', TEXT9: '120', TEXT10: '' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    /* ================================================================
       SEMIFINAIS � ARG x POR
       Estadio: SoFi Stadium, Los Angeles CA
       ================================================================ */
    copa2026_semi_pre: {
        D_FOOTBALL: [{
            TITULO:     'Argentina',
            TITULO2:    'Portugal',
            SUBTITULO:  'SoFi Stadium',
            SUBTITULO2: 'Semi-Finals',
            SUBTITULO3: 'NS',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-07-14 20:00:00',
            TEXTO:      'WC26_ARPT_SF',
            FOTO:       'https://flagcdn.com/256x192/ar.png',
            FOTO2:      'https://flagcdn.com/256x192/pt.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_ARPT_SF', TEXT1: 'Argentina', TEXT2: 'Portugal', TEXT3: '', TEXT4: '',    TEXT5: '',   TEXT6: '',   TEXT7: '', TEXT8: '', TEXT9: '',    TEXT10: '' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    copa2026_semi_2h: {
        D_FOOTBALL: [{
            TITULO:     'Argentina',
            TITULO2:    'Portugal',
            SUBTITULO:  'SoFi Stadium',
            SUBTITULO2: 'Semi-Finals',
            SUBTITULO3: '2H',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-07-14 20:00:00',
            TEXTO:      'WC26_ARPT_SF',
            FOTO:       'https://flagcdn.com/256x192/ar.png',
            FOTO2:      'https://flagcdn.com/256x192/pt.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_ARPT_SF', TEXT1: 'Argentina', TEXT2: 'Portugal', TEXT3: '', TEXT4: '2H',  TEXT5: '2',  TEXT6: '1',  TEXT7: '', TEXT8: '', TEXT9: '82',  TEXT10: '' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    copa2026_semi_ft: {
        D_FOOTBALL: [{
            TITULO:     'Argentina',
            TITULO2:    'Portugal',
            SUBTITULO:  'SoFi Stadium',
            SUBTITULO2: 'Semi-Finals',
            SUBTITULO3: 'FT',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-07-14 20:00:00',
            TEXTO:      'WC26_ARPT_SF',
            FOTO:       'https://flagcdn.com/256x192/ar.png',
            FOTO2:      'https://flagcdn.com/256x192/pt.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_ARPT_SF', TEXT1: 'Argentina', TEXT2: 'Portugal', TEXT3: '', TEXT4: 'FT',  TEXT5: '3',  TEXT6: '2',  TEXT7: '', TEXT8: '', TEXT9: '90',  TEXT10: '' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    /* ================================================================
       GOLEADA 7x1 � BRA x GER  (Semifinal)
       Estadio: AT&T Stadium, Arlington TX
       ================================================================ */
    copa2026_goleada_1h: {
        D_FOOTBALL: [{
            TITULO:     'Brasil',
            TITULO2:    'Alemanha',
            SUBTITULO:  'AT&T Stadium',
            SUBTITULO2: 'Semi-Finals',
            SUBTITULO3: '1H',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-07-15 19:00:00',
            TEXTO:      'WC26_BRDE_SF',
            FOTO:       'https://flagcdn.com/256x192/br.png',
            FOTO2:      'https://flagcdn.com/256x192/de.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_BRDE_SF', TEXT1: 'Brasil', TEXT2: 'Alemanha', TEXT3: '', TEXT4: '1H',  TEXT5: '4',  TEXT6: '0',  TEXT7: '', TEXT8: '', TEXT9: '43',  TEXT10: '' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    copa2026_goleada_2h: {
        D_FOOTBALL: [{
            TITULO:     'Brasil',
            TITULO2:    'Alemanha',
            SUBTITULO:  'AT&T Stadium',
            SUBTITULO2: 'Semi-Finals',
            SUBTITULO3: '2H',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-07-15 19:00:00',
            TEXTO:      'WC26_BRDE_SF',
            FOTO:       'https://flagcdn.com/256x192/br.png',
            FOTO2:      'https://flagcdn.com/256x192/de.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_BRDE_SF', TEXT1: 'Brasil', TEXT2: 'Alemanha', TEXT3: '', TEXT4: '2H',  TEXT5: '7',  TEXT6: '1',  TEXT7: '', TEXT8: '', TEXT9: '90',  TEXT10: '5' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    copa2026_goleada_ft: {
        D_FOOTBALL: [{
            TITULO:     'Brasil',
            TITULO2:    'Alemanha',
            SUBTITULO:  'AT&T Stadium',
            SUBTITULO2: 'Semi-Finals',
            SUBTITULO3: 'FT',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-07-15 19:00:00',
            TEXTO:      'WC26_BRDE_SF',
            FOTO:       'https://flagcdn.com/256x192/br.png',
            FOTO2:      'https://flagcdn.com/256x192/de.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_BRDE_SF', TEXT1: 'Brasil', TEXT2: 'Alemanha', TEXT3: '', TEXT4: 'FT',  TEXT5: '7',  TEXT6: '1',  TEXT7: '', TEXT8: '', TEXT9: '90',  TEXT10: '' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    /* ================================================================
       DISPUTA DE 3� LUGAR � FRA x MAR
       Estadio: Arrowhead Stadium, Kansas City MO
       ================================================================ */
    copa2026_terceiro_pre: {
        D_FOOTBALL: [{
            TITULO:     'França',
            TITULO2:    'Marrocos',
            SUBTITULO:  'Arrowhead Stadium',
            SUBTITULO2: '3rd Place Final',
            SUBTITULO3: 'NS',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-07-18 16:00:00',
            TEXTO:      'WC26_FRMA_3P',
            FOTO:       'https://flagcdn.com/256x192/fr.png',
            FOTO2:      'https://flagcdn.com/256x192/ma.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_FRMA_3P', TEXT1: 'França', TEXT2: 'Marrocos', TEXT3: '', TEXT4: '',    TEXT5: '',   TEXT6: '',   TEXT7: '', TEXT8: '', TEXT9: '',    TEXT10: '' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    copa2026_terceiro_ft: {
        D_FOOTBALL: [{
            TITULO:     'França',
            TITULO2:    'Marrocos',
            SUBTITULO:  'Arrowhead Stadium',
            SUBTITULO2: '3rd Place Final',
            SUBTITULO3: 'FT',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-07-18 16:00:00',
            TEXTO:      'WC26_FRMA_3P',
            FOTO:       'https://flagcdn.com/256x192/fr.png',
            FOTO2:      'https://flagcdn.com/256x192/ma.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_FRMA_3P', TEXT1: 'França', TEXT2: 'Marrocos', TEXT3: '', TEXT4: 'FT',  TEXT5: '2',  TEXT6: '1',  TEXT7: '', TEXT8: '', TEXT9: '90',  TEXT10: '' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    /* ================================================================
       FINAL � BRA x ARG
       Estadio: MetLife Stadium, East Rutherford NJ
       ================================================================ */
    copa2026_final_pre: {
        D_FOOTBALL: [{
            TITULO:     'Brasil',
            TITULO2:    'Argentina',
            SUBTITULO:  'MetLife Stadium',
            SUBTITULO2: 'Final',
            SUBTITULO3: 'NS',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-07-19 18:00:00',
            TEXTO:      'WC26_BRAR_F',
            FOTO:       'https://flagcdn.com/256x192/br.png',
            FOTO2:      'https://flagcdn.com/256x192/ar.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_BRAR_F', TEXT1: 'Brasil', TEXT2: 'Argentina', TEXT3: '', TEXT4: '',    TEXT5: '',   TEXT6: '',   TEXT7: '', TEXT8: '', TEXT9: '',    TEXT10: '' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    copa2026_final_1h: {
        D_FOOTBALL: [{
            TITULO:     'Brasil',
            TITULO2:    'Argentina',
            SUBTITULO:  'MetLife Stadium',
            SUBTITULO2: 'Final',
            SUBTITULO3: '1H',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-07-19 18:00:00',
            TEXTO:      'WC26_BRAR_F',
            FOTO:       'https://flagcdn.com/256x192/br.png',
            FOTO2:      'https://flagcdn.com/256x192/ar.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_BRAR_F', TEXT1: 'Brasil', TEXT2: 'Argentina', TEXT3: '', TEXT4: '1H',  TEXT5: '1',  TEXT6: '0',  TEXT7: '', TEXT8: '', TEXT9: '38',  TEXT10: '' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    copa2026_final_2h: {
        D_FOOTBALL: [{
            TITULO:     'Brasil',
            TITULO2:    'Argentina',
            SUBTITULO:  'MetLife Stadium',
            SUBTITULO2: 'Final',
            SUBTITULO3: '2H',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-07-19 18:00:00',
            TEXTO:      'WC26_BRAR_F',
            FOTO:       'https://flagcdn.com/256x192/br.png',
            FOTO2:      'https://flagcdn.com/256x192/ar.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_BRAR_F', TEXT1: 'Brasil', TEXT2: 'Argentina', TEXT3: '', TEXT4: '2H',  TEXT5: '2',  TEXT6: '1',  TEXT7: '', TEXT8: '', TEXT9: '82',  TEXT10: '' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    copa2026_final_et: {
        D_FOOTBALL: [{
            TITULO:     'Brasil',
            TITULO2:    'Argentina',
            SUBTITULO:  'MetLife Stadium',
            SUBTITULO2: 'Final',
            SUBTITULO3: 'ET',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-07-19 18:00:00',
            TEXTO:      'WC26_BRAR_F',
            FOTO:       'https://flagcdn.com/256x192/br.png',
            FOTO2:      'https://flagcdn.com/256x192/ar.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_BRAR_F', TEXT1: 'Brasil', TEXT2: 'Argentina', TEXT3: '', TEXT4: 'ET',  TEXT5: '2',  TEXT6: '2',  TEXT7: '', TEXT8: '', TEXT9: '109', TEXT10: '2' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    copa2026_final_pen: {
        D_FOOTBALL: [{
            TITULO:     'Brasil',
            TITULO2:    'Argentina',
            SUBTITULO:  'MetLife Stadium',
            SUBTITULO2: 'Final',
            SUBTITULO3: 'PEN',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-07-19 18:00:00',
            TEXTO:      'WC26_BRAR_F',
            FOTO:       'https://flagcdn.com/256x192/br.png',
            FOTO2:      'https://flagcdn.com/256x192/ar.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_BRAR_F', TEXT1: 'Brasil', TEXT2: 'Argentina', TEXT3: '', TEXT4: 'PEN', TEXT5: '2',  TEXT6: '2',  TEXT7: '4', TEXT8: '2', TEXT9: '120', TEXT10: '' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
    },

    copa2026_final_ft: {
        D_FOOTBALL: [{
            TITULO:     'Brasil',
            TITULO2:    'Argentina',
            SUBTITULO:  'MetLife Stadium',
            SUBTITULO2: 'Final',
            SUBTITULO3: 'FT',
            CATEGORY:   'O mundo em campo 2026',
            DATE:       '2026-07-19 18:00:00',
            TEXTO:      'WC26_BRAR_F',
            FOTO:       'https://flagcdn.com/256x192/br.png',
            FOTO2:      'https://flagcdn.com/256x192/ar.png'
        }],
        D_SPD: [
            { CONFIG: '0', TYPE: '10', TITLE: 'WC26_BRAR_F', TEXT1: 'Brasil', TEXT2: 'Argentina', TEXT3: '', TEXT4: 'FT',  TEXT5: '3',  TEXT6: '1',  TEXT7: '', TEXT8: '', TEXT9: '90',  TEXT10: '' },
            { CONFIG: '1', TEXT1: 'Apoio:', IMAGE_LOGO: 'img/logo_sponsor.png', FILE_IMAGE1: 'img/sponsor.mp4' }
        ]
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
