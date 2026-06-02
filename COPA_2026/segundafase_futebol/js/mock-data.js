// ═══════════════════════════════════════════════════
//  mock-data.js — segundafase_futebol
//  Cenario: 07/jul/2026 — R32 encerrado + oitavas em andamento.
//  Mesmos dados que caminhos_futebol (mock-sim-oitavas).
//  Formato SUBTITULO2: 'DD/MM · HH:MM · Cidade'  (local opcional)
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
    /* --- D_FOOTBALL_TEAMS: Vazio no mock (times já vêm com nomes) --- */
    D_FOOTBALL_TEAMS: [],
    partidas: [

        // ══════════════════════════════════════════════════
        //  R32 — Segundas de final (28/jun – 03/jul)
        //  4 chaves de 4 jogos. Cada chave leva a 1 quartas.
        //  Chave 1 (1-4)  → QF L1   |  Chave 2 (5-8)  → QF L2
        //  Chave 3 (9-12) → QF R1   |  Chave 4 (13-16) → QF R2
        // ══════════════════════════════════════════════════
        { CATEGORY:'R32', SUBTITULO:'1',  SUBTITULO2:'29/06 · 17:30 · Boston',          TITULO:'Alemanha',        TITULO2:'Marrocos',          FOTO:'https://flagcdn.com/de.svg',     FOTO2:'https://flagcdn.com/ma.svg',     TEXTO:'3', TEXTO2:'1', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'2',  SUBTITULO2:'30/06 · 18:00 · NY/NJ',           TITULO:'França',           TITULO2:'Noruega',           FOTO:'https://flagcdn.com/fr.svg',     FOTO2:'https://flagcdn.com/no.svg',     TEXTO:'2', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'3',  SUBTITULO2:'28/06 · 16:00 · Los Angeles',     TITULO:'Rep. da Coreia',   TITULO2:'Suíça',             FOTO:'https://flagcdn.com/kr.svg',     FOTO2:'https://flagcdn.com/ch.svg',     TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'4',  SUBTITULO2:'29/06 · 22:00 · Atlanta',         TITULO:'Holanda',          TITULO2:'Escócia',           FOTO:'https://flagcdn.com/nl.svg',     FOTO2:'https://flagcdn.com/gb-sct.svg', TEXTO:'2', TEXTO2:'0', SUBTITULO3:'FT' },

        { CATEGORY:'R32', SUBTITULO:'5',  SUBTITULO2:'02/07 · 20:00 · Miami',           TITULO:'Colômbia',         TITULO2:'Croácia',           FOTO:'https://flagcdn.com/co.svg',     FOTO2:'https://flagcdn.com/hr.svg',     TEXTO:'1', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'6',  SUBTITULO2:'02/07 · 16:00 · Dallas',          TITULO:'Espanha',          TITULO2:'Áustria',           FOTO:'https://flagcdn.com/es.svg',     FOTO2:'https://flagcdn.com/at.svg',     TEXTO:'3', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'7',  SUBTITULO2:'01/07 · 22:00 · Filadélfia',      TITULO:'EUA',              TITULO2:'Bósnia e Herz.',    FOTO:'https://flagcdn.com/us.svg',     FOTO2:'https://flagcdn.com/ba.svg',     TEXTO:'2', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'8',  SUBTITULO2:'01/07 · 19:00 · Toronto',         TITULO:'Bélgica',          TITULO2:'Argélia',           FOTO:'https://flagcdn.com/be.svg',     FOTO2:'https://flagcdn.com/dz.svg',     TEXTO:'1', TEXTO2:'0', SUBTITULO3:'FT' },

        { CATEGORY:'R32', SUBTITULO:'9',  SUBTITULO2:'29/06 · 14:00 · Cidade do México', TITULO:'Brasil',          TITULO2:'Japão',             FOTO:'https://flagcdn.com/br.svg',     FOTO2:'https://flagcdn.com/jp.svg',     TEXTO:'3', TEXTO2:'1', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'10', SUBTITULO2:'30/06 · 14:00 · Guadalajara',     TITULO:'Costa do Marfim',  TITULO2:'Senegal',           FOTO:'https://flagcdn.com/ci.svg',     FOTO2:'https://flagcdn.com/sn.svg',     TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'11', SUBTITULO2:'30/06 · 22:00 · Monterrey',       TITULO:'México',           TITULO2:'Arábia Saudita',    FOTO:'https://flagcdn.com/mx.svg',     FOTO2:'https://flagcdn.com/sa.svg',     TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'12', SUBTITULO2:'01/07 · 13:00 · Kansas City',     TITULO:'Inglaterra',       TITULO2:'Uzbequistão',       FOTO:'https://flagcdn.com/gb-eng.svg', FOTO2:'https://flagcdn.com/uz.svg',     TEXTO:'4', TEXTO2:'0', SUBTITULO3:'FT' },

        { CATEGORY:'R32', SUBTITULO:'13', SUBTITULO2:'03/07 · 19:00 · Vancouver',       TITULO:'Argentina',        TITULO2:'Uruguai',           FOTO:'https://flagcdn.com/ar.svg',     FOTO2:'https://flagcdn.com/uy.svg',     TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'14', SUBTITULO2:'03/07 · 15:00 · Seattle',         TITULO:'Turquia',          TITULO2:'Egito',             FOTO:'https://flagcdn.com/tr.svg',     FOTO2:'https://flagcdn.com/eg.svg',     TEXTO:'1', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'15', SUBTITULO2:'02/07 · 13:00 · Toronto',         TITULO:'Canadá',           TITULO2:'Equador',           FOTO:'https://flagcdn.com/ca.svg',     FOTO2:'https://flagcdn.com/ec.svg',     TEXTO:'2', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'16', SUBTITULO2:'03/07 · 13:00 · Houston',         TITULO:'Portugal',         TITULO2:'Austrália',         FOTO:'https://flagcdn.com/pt.svg',     FOTO2:'https://flagcdn.com/au.svg',     TEXTO:'3', TEXTO2:'0', SUBTITULO3:'FT' },

        // ══════════════════════════════════════════════════
        //  R16 — Oitavas (04 – 07/jul)
        //  2 chaves de 4 jogos. Cada chave leva a 1 semifinalista.
        //  Chave 1 (1-4) → SF1 (esq)  |  Chave 2 (5-8) → SF2 (dir)
        // ══════════════════════════════════════════════════
        { CATEGORY:'R16', SUBTITULO:'1', SUBTITULO2:'04/07 · 17:00 · Boston',
          TITULO:'Alemanha',       TITULO2:'França',
          FOTO:'https://flagcdn.com/de.svg', FOTO2:'https://flagcdn.com/fr.svg',
          TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },

        { CATEGORY:'R16', SUBTITULO:'2', SUBTITULO2:'04/07 · 21:00 · Dallas',
          TITULO:'Rep. da Coreia', TITULO2:'Holanda',
          FOTO:'https://flagcdn.com/kr.svg', FOTO2:'https://flagcdn.com/nl.svg',
          TEXTO:'0', TEXTO2:'1', SUBTITULO3:'FT' },

        { CATEGORY:'R16', SUBTITULO:'3', SUBTITULO2:'05/07 · 17:00 · Filadélfia',
          TITULO:'Colômbia',       TITULO2:'Espanha',
          FOTO:'https://flagcdn.com/co.svg', FOTO2:'https://flagcdn.com/es.svg',
          TEXTO:'0', TEXTO2:'2', SUBTITULO3:'FT' },

        { CATEGORY:'R16', SUBTITULO:'4', SUBTITULO2:'06/07 · 17:00 · Los Angeles',
          TITULO:'EUA',            TITULO2:'Bélgica',
          FOTO:'https://flagcdn.com/us.svg', FOTO2:'https://flagcdn.com/be.svg',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        { CATEGORY:'R16', SUBTITULO:'5', SUBTITULO2:'05/07 · 21:00 · NY/NJ',
          TITULO:'Brasil',         TITULO2:'Costa do Marfim',
          FOTO:'https://flagcdn.com/br.svg', FOTO2:'https://flagcdn.com/ci.svg',
          TEXTO:'2', TEXTO2:'0', SUBTITULO3:'FT' },

        { CATEGORY:'R16', SUBTITULO:'6', SUBTITULO2:'06/07 · 17:00 · Miami',
          TITULO:'México',         TITULO2:'Inglaterra',
          FOTO:'https://flagcdn.com/mx.svg', FOTO2:'https://flagcdn.com/gb-eng.svg',
          TEXTO:'1', TEXTO2:'3', SUBTITULO3:'FT' },

        { CATEGORY:'R16', SUBTITULO:'7', SUBTITULO2:'07/07 · 17:00 · Atlanta',
          TITULO:'Argentina',      TITULO2:'Turquia',
          FOTO:'https://flagcdn.com/ar.svg', FOTO2:'https://flagcdn.com/tr.svg',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        { CATEGORY:'R16', SUBTITULO:'8', SUBTITULO2:'07/07 · 21:00 · Houston',
          TITULO:'Canadá',         TITULO2:'Portugal',
          FOTO:'https://flagcdn.com/ca.svg', FOTO2:'https://flagcdn.com/pt.svg',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // ══════════════════════════════════════════════════
        //  QF — Quartas de final (09 – 11/jul)
        //  1 chave de 4 jogos.
        // ══════════════════════════════════════════════════
        { CATEGORY:'QF', SUBTITULO:'1', SUBTITULO2:'09/07 · 17:00 · Kansas City',
          TITULO:'Alemanha',       TITULO2:'Holanda',
          FOTO:'https://flagcdn.com/de.svg', FOTO2:'https://flagcdn.com/nl.svg',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        { CATEGORY:'QF', SUBTITULO:'2', SUBTITULO2:'09/07 · 21:00 · East Rutherford',
          TITULO:'Espanha',        TITULO2:'',
          FOTO:'https://flagcdn.com/es.svg', FOTO2:'',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        { CATEGORY:'QF', SUBTITULO:'3', SUBTITULO2:'10/07 · 17:00 · Los Angeles',
          TITULO:'Brasil',         TITULO2:'Inglaterra',
          FOTO:'https://flagcdn.com/br.svg', FOTO2:'https://flagcdn.com/gb-eng.svg',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        { CATEGORY:'QF', SUBTITULO:'4', SUBTITULO2:'10/07 · 21:00 · Miami',
          TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // ══════════════════════════════════════════════════
        //  SF, FINAL, BRONZE — aguardando definição
        // ══════════════════════════════════════════════════
        { CATEGORY:'SF',     SUBTITULO:'1', SUBTITULO2:'14/07 · 16:00 · Dallas',
          TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'SF',     SUBTITULO:'2', SUBTITULO2:'15/07 · 16:00 · Atlanta',
          TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'FINAL',  SUBTITULO:'1', SUBTITULO2:'19/07 · 16:00 · NY/NJ',
          TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'BRONZE', SUBTITULO:'1', SUBTITULO2:'18/07 · 16:00 · Miami',
          TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' }
    ]
};

// Gera D_FOOTBALL.TEXTO3 espelhando a producao (campo JSON no XML)
MOCK_DATA.D_FOOTBALL = { TEXTO3: JSON.stringify(MOCK_DATA.partidas) };
