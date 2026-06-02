// ═══════════════════════════════════════════════════
//  mock-sim-campeao.js — SIMULAÇÃO: 19/jul/2026 · BRASIL CAMPEÃO!
//
//  Todos os jogos encerrados.
//  Brasil 2×1 Alemanha na Final do MetLife Stadium 🏆
//
//  Caminho do Brasil:
//  R32:    Brasil 3×1 Japão
//  Oitavas: Brasil 2×0 Costa do Marfim
//  Quartas: Brasil 1×0 Inglaterra
//  Semi:   Brasil 2×1 Argentina
//  Final:  Brasil 2×1 Alemanha  🏆
//
//  Para usar: no index.html, troque o script:
//    <script src="js/mock-sim-campeao.js"></script>
// ═══════════════════════════════════════════════════
var MOCK_DATA = {
    enabled: true,
    config: {
        duration: 30000
    },
    /* --- Simula registro D_SPD (item com CONFIG='1') --- */
    D_SPD: {
        CONFIG:      '1',
        TEXT1:       'Apoio:',
        TEXT2:       '8',         // duração vídeo/imagem (segundos)
        IMAGE_LOGO:  'img/logo_sponsor.png',
        FILE_IMAGE1: 'img/sponsor.mp4',
        COLOR1:      '#FBBF24',   // corDestaque (amarelo)
        COLOR2:      '#006400',   // corEscura (verde escuro)
        COLOR3:      '#FFFFFF'    // corClara (branco)
    },
    /* --- D_FOOTBALL_TEAMS: Vazio no mock (times já vêm com nomes)
           No ambiente real, será usado para traduzir IDs → PT-BR --- */
    D_FOOTBALL_TEAMS: [],
    partidas: [

        // ══════════════════════════════════════════════════
        //  2ª RODADA — TODOS ENCERRADOS
        // ══════════════════════════════════════════════════
        { CATEGORY:'R32', SUBTITULO:'1',  SUBTITULO2:'29/06 · 17:30', TITULO:'Alemanha',       TITULO2:'Marrocos',       FOTO:'https://flagcdn.com/de.svg',     FOTO2:'https://flagcdn.com/ma.svg',     TEXTO:'3', TEXTO2:'1', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'2',  SUBTITULO2:'30/06 · 18:00', TITULO:'França',          TITULO2:'Noruega',        FOTO:'https://flagcdn.com/fr.svg',     FOTO2:'https://flagcdn.com/no.svg',     TEXTO:'2', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'3',  SUBTITULO2:'28/06 · 16:00', TITULO:'Rep. da Coreia',  TITULO2:'Suíça',          FOTO:'https://flagcdn.com/kr.svg',     FOTO2:'https://flagcdn.com/ch.svg',     TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'4',  SUBTITULO2:'29/06 · 22:00', TITULO:'Holanda',         TITULO2:'Escócia',        FOTO:'https://flagcdn.com/nl.svg',     FOTO2:'https://flagcdn.com/gb-sct.svg', TEXTO:'2', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'5',  SUBTITULO2:'02/07 · 20:00', TITULO:'Colômbia',        TITULO2:'Croácia',        FOTO:'https://flagcdn.com/co.svg',     FOTO2:'https://flagcdn.com/hr.svg',     TEXTO:'1', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'6',  SUBTITULO2:'02/07 · 16:00', TITULO:'Espanha',         TITULO2:'Áustria',        FOTO:'https://flagcdn.com/es.svg',     FOTO2:'https://flagcdn.com/at.svg',     TEXTO:'3', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'7',  SUBTITULO2:'01/07 · 22:00', TITULO:'EUA',             TITULO2:'Bósnia e Herz.', FOTO:'https://flagcdn.com/us.svg',     FOTO2:'https://flagcdn.com/ba.svg',     TEXTO:'2', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'8',  SUBTITULO2:'01/07 · 19:00', TITULO:'Bélgica',         TITULO2:'Argélia',        FOTO:'https://flagcdn.com/be.svg',     FOTO2:'https://flagcdn.com/dz.svg',     TEXTO:'1', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'9',  SUBTITULO2:'29/06 · 14:00', TITULO:'Brasil',          TITULO2:'Japão',          FOTO:'https://flagcdn.com/br.svg',     FOTO2:'https://flagcdn.com/jp.svg',     TEXTO:'3', TEXTO2:'1', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'10', SUBTITULO2:'30/06 · 14:00', TITULO:'Costa do Marfim', TITULO2:'Senegal',        FOTO:'https://flagcdn.com/ci.svg',     FOTO2:'https://flagcdn.com/sn.svg',     TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'11', SUBTITULO2:'30/06 · 22:00', TITULO:'México',          TITULO2:'Arábia Saudita', FOTO:'https://flagcdn.com/mx.svg',     FOTO2:'https://flagcdn.com/sa.svg',     TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'12', SUBTITULO2:'01/07 · 13:00', TITULO:'Inglaterra',      TITULO2:'Uzbequistão',    FOTO:'https://flagcdn.com/gb-eng.svg', FOTO2:'https://flagcdn.com/uz.svg',     TEXTO:'4', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'13', SUBTITULO2:'03/07 · 19:00', TITULO:'Argentina',       TITULO2:'Uruguai',        FOTO:'https://flagcdn.com/ar.svg',     FOTO2:'https://flagcdn.com/uy.svg',     TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'14', SUBTITULO2:'03/07 · 15:00', TITULO:'Turquia',         TITULO2:'Egito',          FOTO:'https://flagcdn.com/tr.svg',     FOTO2:'https://flagcdn.com/eg.svg',     TEXTO:'1', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'15', SUBTITULO2:'02/07 · 13:00', TITULO:'Canadá',          TITULO2:'Equador',        FOTO:'https://flagcdn.com/ca.svg',     FOTO2:'https://flagcdn.com/ec.svg',     TEXTO:'2', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'16', SUBTITULO2:'03/07 · 13:00', TITULO:'Portugal',        TITULO2:'Austrália',      FOTO:'https://flagcdn.com/pt.svg',     FOTO2:'https://flagcdn.com/au.svg',     TEXTO:'3', TEXTO2:'0', SUBTITULO3:'FT' },

        // ══════════════════════════════════════════════════
        //  OITAVAS — TODOS ENCERRADOS
        // ══════════════════════════════════════════════════
        { CATEGORY:'R16', SUBTITULO:'1', SUBTITULO2:'04/07 · 17:00', TITULO:'Alemanha',       TITULO2:'França',          FOTO:'https://flagcdn.com/de.svg',     FOTO2:'https://flagcdn.com/fr.svg',     TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },
        { CATEGORY:'R16', SUBTITULO:'2', SUBTITULO2:'04/07 · 21:00', TITULO:'Rep. da Coreia', TITULO2:'Holanda',         FOTO:'https://flagcdn.com/kr.svg',     FOTO2:'https://flagcdn.com/nl.svg',     TEXTO:'0', TEXTO2:'1', SUBTITULO3:'FT' },
        { CATEGORY:'R16', SUBTITULO:'3', SUBTITULO2:'05/07 · 17:00', TITULO:'Colômbia',       TITULO2:'Espanha',         FOTO:'https://flagcdn.com/co.svg',     FOTO2:'https://flagcdn.com/es.svg',     TEXTO:'0', TEXTO2:'2', SUBTITULO3:'FT' },
        { CATEGORY:'R16', SUBTITULO:'4', SUBTITULO2:'06/07 · 17:00', TITULO:'EUA',            TITULO2:'Bélgica',         FOTO:'https://flagcdn.com/us.svg',     FOTO2:'https://flagcdn.com/be.svg',     TEXTO:'1', TEXTO2:'2', SUBTITULO3:'FT' },
        { CATEGORY:'R16', SUBTITULO:'5', SUBTITULO2:'05/07 · 21:00', TITULO:'Brasil',         TITULO2:'Costa do Marfim', FOTO:'https://flagcdn.com/br.svg',     FOTO2:'https://flagcdn.com/ci.svg',     TEXTO:'2', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R16', SUBTITULO:'6', SUBTITULO2:'06/07 · 17:00', TITULO:'México',         TITULO2:'Inglaterra',      FOTO:'https://flagcdn.com/mx.svg',     FOTO2:'https://flagcdn.com/gb-eng.svg', TEXTO:'1', TEXTO2:'3', SUBTITULO3:'FT' },
        { CATEGORY:'R16', SUBTITULO:'7', SUBTITULO2:'07/07 · 17:00', TITULO:'Argentina',      TITULO2:'Turquia',         FOTO:'https://flagcdn.com/ar.svg',     FOTO2:'https://flagcdn.com/tr.svg',     TEXTO:'3', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R16', SUBTITULO:'8', SUBTITULO2:'07/07 · 21:00', TITULO:'Canadá',         TITULO2:'Portugal',        FOTO:'https://flagcdn.com/ca.svg',     FOTO2:'https://flagcdn.com/pt.svg',     TEXTO:'0', TEXTO2:'2', SUBTITULO3:'FT' },

        // ══════════════════════════════════════════════════
        //  QUARTAS — TODOS ENCERRADOS
        // ══════════════════════════════════════════════════
        { CATEGORY:'QF', SUBTITULO:'1', SUBTITULO2:'09/07 · 17:00', TITULO:'Alemanha',  TITULO2:'Holanda',    FOTO:'https://flagcdn.com/de.svg', FOTO2:'https://flagcdn.com/nl.svg',     TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },
        { CATEGORY:'QF', SUBTITULO:'2', SUBTITULO2:'09/07 · 21:00', TITULO:'Espanha',   TITULO2:'Bélgica',    FOTO:'https://flagcdn.com/es.svg', FOTO2:'https://flagcdn.com/be.svg',     TEXTO:'1', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'QF', SUBTITULO:'3', SUBTITULO2:'10/07 · 17:00', TITULO:'Brasil',    TITULO2:'Inglaterra', FOTO:'https://flagcdn.com/br.svg', FOTO2:'https://flagcdn.com/gb-eng.svg', TEXTO:'1', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'QF', SUBTITULO:'4', SUBTITULO2:'11/07 · 17:00', TITULO:'Argentina', TITULO2:'Portugal',   FOTO:'https://flagcdn.com/ar.svg', FOTO2:'https://flagcdn.com/pt.svg',     TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },

        // ══════════════════════════════════════════════════
        //  SEMIFINAL — TODOS ENCERRADOS
        //  SF-L: Alemanha 1×0 Espanha → Alemanha na Final
        //  SF-R: Brasil 2×1 Argentina → BRASIL NA FINAL! ⭐
        // ══════════════════════════════════════════════════
        { CATEGORY:'SF', SUBTITULO:'1', SUBTITULO2:'14/07 · 17:00',
          TITULO:'Alemanha', TITULO2:'Espanha',
          FOTO:'https://flagcdn.com/de.svg', FOTO2:'https://flagcdn.com/es.svg',
          TEXTO:'1', TEXTO2:'0', SUBTITULO3:'FT' },

        { CATEGORY:'SF', SUBTITULO:'2', SUBTITULO2:'15/07 · 17:00',
          TITULO:'Brasil',   TITULO2:'Argentina',
          FOTO:'https://flagcdn.com/br.svg', FOTO2:'https://flagcdn.com/ar.svg',
          TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },

        // ══════════════════════════════════════════════════
        //  FINAL — BRASIL 2×1 ALEMANHA  🏆 CAMPEÃO!
        //  MetLife Stadium, Nova York · 19/jul
        // ══════════════════════════════════════════════════
        { CATEGORY:'FINAL', SUBTITULO:'1', SUBTITULO2:'19/07 · 16:00',
          TITULO:'Brasil',   TITULO2:'Alemanha',
          FOTO:'https://flagcdn.com/br.svg', FOTO2:'https://flagcdn.com/de.svg',
          TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },

        // ══════════════════════════════════════════════════
        //  3º LUGAR — Argentina 1×0 Espanha
        //  Hard Rock Stadium, Miami · 18/jul
        // ══════════════════════════════════════════════════
        { CATEGORY:'BRONZE', SUBTITULO:'1', SUBTITULO2:'18/07 · 16:00',
          TITULO:'Argentina', TITULO2:'Espanha',
          FOTO:'https://flagcdn.com/ar.svg', FOTO2:'https://flagcdn.com/es.svg',
          TEXTO:'1', TEXTO2:'0', SUBTITULO3:'FT' }
    ]
};

// Gera D_FOOTBALL.TEXTO3 espelhando a producao (campo JSON no XML)
MOCK_DATA.D_FOOTBALL = { TEXTO3: JSON.stringify(MOCK_DATA.partidas) };
