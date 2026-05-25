// ═══════════════════════════════════════════════════
//  mock-sim-01jul.js — SIMULAÇÃO: 01/jul/2026 · fim do dia
//
//  10 de 16 partidas da 2ª Rodada concluídas.
//  Brasil CLASSIFICADO! 3x1 Japão (Partida 76 · Houston)
//
//  Para usar: no index.html, troque o script:
//    <script src="js/mock-sim-01jul.js"></script>
//
//  Chaveamento assumido (1º de cada grupo):
//  A:México  B:Canadá   C:Brasil  D:EUA     E:Alemanha F:Holanda
//  G:Bélgica H:Espanha  I:França  J:Argentina K:Portugal L:Inglaterra
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
    IMAGE_LOGO:  'img/logo_sponsor.png',
    FILE_IMAGE1: 'img/sponsor.mp4',
    DURACAO:     '8',
    TEXTO7:      '#FBBF24',  // corDestaque
    TEXTO8:      '#006400',  // corEscura
    TEXTO9:      '#FFFFFF'   // corClara
  },
  partidas: [

        // ══════════════════════════════════════════════════
        //  2ª RODADA — LADO ESQUERDO (L1-L8)
        //  ✅ = concluído  ⏳ = ainda não disputado
        // ══════════════════════════════════════════════════

        // L1 — Partida 74 (29/jun · Houston) ✅
        { CATEGORY:'R32', SUBTITULO:'1',  SUBTITULO2:'29/06 · 17:30',
          TITULO:'Alemanha',        TITULO2:'Marrocos',
          FOTO:'https://flagcdn.com/de.svg',     FOTO2:'https://flagcdn.com/ma.svg',
          TEXTO:'3', TEXTO2:'1', SUBTITULO3:'FT' },

        // L2 — Partida 77 (30/jun · East Rutherford) ✅
        { CATEGORY:'R32', SUBTITULO:'2',  SUBTITULO2:'30/06 · 18:00',
          TITULO:'França',          TITULO2:'Noruega',
          FOTO:'https://flagcdn.com/fr.svg',     FOTO2:'https://flagcdn.com/no.svg',
          TEXTO:'2', TEXTO2:'0', SUBTITULO3:'FT' },

        // L3 — Partida 73 (28/jun · Inglewood) ✅
        { CATEGORY:'R32', SUBTITULO:'3',  SUBTITULO2:'28/06 · 16:00',
          TITULO:'Rep. da Coreia',  TITULO2:'Suíça',
          FOTO:'https://flagcdn.com/kr.svg',     FOTO2:'https://flagcdn.com/ch.svg',
          TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },

        // L4 — Partida 75 (29/jun · Guadalajara) ✅
        { CATEGORY:'R32', SUBTITULO:'4',  SUBTITULO2:'29/06 · 22:00',
          TITULO:'Holanda',         TITULO2:'Escócia',
          FOTO:'https://flagcdn.com/nl.svg',     FOTO2:'https://flagcdn.com/gb-sct.svg',
          TEXTO:'2', TEXTO2:'0', SUBTITULO3:'FT' },

        // L5 — Partida 83 (2/jul · Inglewood) ⏳
        { CATEGORY:'R32', SUBTITULO:'5',  SUBTITULO2:'02/07 · 20:00',
          TITULO:'Colômbia',        TITULO2:'Croácia',
          FOTO:'https://flagcdn.com/co.svg',     FOTO2:'https://flagcdn.com/hr.svg',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // L6 — Partida 84 (2/jul · Inglewood) ⏳
        { CATEGORY:'R32', SUBTITULO:'6',  SUBTITULO2:'02/07 · 16:00',
          TITULO:'Espanha',         TITULO2:'Áustria',
          FOTO:'https://flagcdn.com/es.svg',     FOTO2:'https://flagcdn.com/at.svg',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // L7 — Partida 81 (1/jul · Santa Clara) ✅
        { CATEGORY:'R32', SUBTITULO:'7',  SUBTITULO2:'01/07 · 22:00',
          TITULO:'EUA',             TITULO2:'Bósnia e Herz.',
          FOTO:'https://flagcdn.com/us.svg',     FOTO2:'https://flagcdn.com/ba.svg',
          TEXTO:'2', TEXTO2:'0', SUBTITULO3:'FT' },

        // L8 — Partida 82 (1/jul · Seattle) ✅
        { CATEGORY:'R32', SUBTITULO:'8',  SUBTITULO2:'01/07 · 19:00',
          TITULO:'Bélgica',         TITULO2:'Argélia',
          FOTO:'https://flagcdn.com/be.svg',     FOTO2:'https://flagcdn.com/dz.svg',
          TEXTO:'1', TEXTO2:'0', SUBTITULO3:'FT' },

        // ══════════════════════════════════════════════════
        //  2ª RODADA — LADO DIREITO (R1-R8)
        // ══════════════════════════════════════════════════

        // R1 — Partida 76 (29/jun · Houston) ✅  ⭐ BRASIL!
        { CATEGORY:'R32', SUBTITULO:'9',  SUBTITULO2:'29/06 · 14:00',
          TITULO:'Brasil',          TITULO2:'Japão',
          FOTO:'https://flagcdn.com/br.svg',     FOTO2:'https://flagcdn.com/jp.svg',
          TEXTO:'3', TEXTO2:'1', SUBTITULO3:'FT' },

        // R2 — Partida 78 (30/jun · Arlington) ✅
        { CATEGORY:'R32', SUBTITULO:'10', SUBTITULO2:'30/06 · 14:00',
          TITULO:'Costa do Marfim', TITULO2:'Senegal',
          FOTO:'https://flagcdn.com/ci.svg',     FOTO2:'https://flagcdn.com/sn.svg',
          TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },

        // R3 — Partida 79 (30/jun · Cidade do México) ✅
        { CATEGORY:'R32', SUBTITULO:'11', SUBTITULO2:'30/06 · 22:00',
          TITULO:'México',          TITULO2:'Arábia Saudita',
          FOTO:'https://flagcdn.com/mx.svg',     FOTO2:'https://flagcdn.com/sa.svg',
          TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },

        // R4 — Partida 80 (1/jul · Atlanta) ✅
        { CATEGORY:'R32', SUBTITULO:'12', SUBTITULO2:'01/07 · 13:00',
          TITULO:'Inglaterra',      TITULO2:'Uzbequistão',
          FOTO:'https://flagcdn.com/gb-eng.svg', FOTO2:'https://flagcdn.com/uz.svg',
          TEXTO:'4', TEXTO2:'0', SUBTITULO3:'FT' },

        // R5 — Partida 86 (3/jul · Arlington) ⏳
        { CATEGORY:'R32', SUBTITULO:'13', SUBTITULO2:'03/07 · 19:00',
          TITULO:'Argentina',       TITULO2:'Uruguai',
          FOTO:'https://flagcdn.com/ar.svg',     FOTO2:'https://flagcdn.com/uy.svg',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // R6 — Partida 88 (3/jul · Vancouver) ⏳
        { CATEGORY:'R32', SUBTITULO:'14', SUBTITULO2:'03/07 · 15:00',
          TITULO:'Turquia',         TITULO2:'Egito',
          FOTO:'https://flagcdn.com/tr.svg',     FOTO2:'https://flagcdn.com/eg.svg',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // R7 — Partida 85 (2/jul · Vancouver) ⏳
        { CATEGORY:'R32', SUBTITULO:'15', SUBTITULO2:'02/07 · 13:00',
          TITULO:'Canadá',          TITULO2:'Equador',
          FOTO:'https://flagcdn.com/ca.svg',     FOTO2:'https://flagcdn.com/ec.svg',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // R8 — Partida 87 (3/jul · Kansas City) ⏳
        { CATEGORY:'R32', SUBTITULO:'16', SUBTITULO2:'03/07 · 13:00',
          TITULO:'Portugal',        TITULO2:'Austrália',
          FOTO:'https://flagcdn.com/pt.svg',     FOTO2:'https://flagcdn.com/au.svg',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // ══════════════════════════════════════════════════
        //  OITAVAS DE FINAL (4–7/jul)
        //  ✅ = chaveamento confirmado  ⏳ = aguardando R32
        // ══════════════════════════════════════════════════

        // R16-L1 ✅ — vencedores L1(Alemanha) × L2(França)
        { CATEGORY:'R16', SUBTITULO:'1', SUBTITULO2:'04/07 · 17:00',
          TITULO:'Alemanha',        TITULO2:'França',
          FOTO:'https://flagcdn.com/de.svg', FOTO2:'https://flagcdn.com/fr.svg',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // R16-L2 ✅ — vencedores L3(Rep. da Coreia) × L4(Holanda)
        { CATEGORY:'R16', SUBTITULO:'2', SUBTITULO2:'04/07 · 21:00',
          TITULO:'Rep. da Coreia',  TITULO2:'Holanda',
          FOTO:'https://flagcdn.com/kr.svg', FOTO2:'https://flagcdn.com/nl.svg',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // R16-L3 ⏳ — aguardando L5(02/jul) e L6(02/jul)
        { CATEGORY:'R16', SUBTITULO:'3', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // R16-L4 ✅ — vencedores L7(EUA) × L8(Bélgica)
        { CATEGORY:'R16', SUBTITULO:'4', SUBTITULO2:'05/07 · 17:00',
          TITULO:'EUA',             TITULO2:'Bélgica',
          FOTO:'https://flagcdn.com/us.svg', FOTO2:'https://flagcdn.com/be.svg',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // R16-R1 ✅ — vencedores R1(Brasil) × R2(Costa do Marfim)  ⭐ BRASIL!
        { CATEGORY:'R16', SUBTITULO:'5', SUBTITULO2:'05/07 · 21:00',
          TITULO:'Brasil',          TITULO2:'Costa do Marfim',
          FOTO:'https://flagcdn.com/br.svg', FOTO2:'https://flagcdn.com/ci.svg',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // R16-R2 ✅ — vencedores R3(México) × R4(Inglaterra)
        { CATEGORY:'R16', SUBTITULO:'6', SUBTITULO2:'06/07 · 17:00',
          TITULO:'México',          TITULO2:'Inglaterra',
          FOTO:'https://flagcdn.com/mx.svg', FOTO2:'https://flagcdn.com/gb-eng.svg',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // R16-R3 ⏳ — aguardando R5(03/jul) e R6(03/jul)
        { CATEGORY:'R16', SUBTITULO:'7', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // R16-R4 ⏳ — aguardando R7(02/jul) e R8(03/jul)
        { CATEGORY:'R16', SUBTITULO:'8', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        { CATEGORY:'QF', SUBTITULO:'1', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'QF', SUBTITULO:'2', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'QF', SUBTITULO:'3', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'QF', SUBTITULO:'4', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        { CATEGORY:'SF',     SUBTITULO:'1', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'SF',     SUBTITULO:'2', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'FINAL',  SUBTITULO:'1', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'BRONZE', SUBTITULO:'1', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' }
    ],
    D_FOOTBALL: {
      TEXTO3: "" // será preenchido abaixo
    }
  };
  // Sempre sincroniza TEXTO3 com as partidas
  MOCK_DATA.D_FOOTBALL.TEXTO3 = JSON.stringify(MOCK_DATA.partidas);
