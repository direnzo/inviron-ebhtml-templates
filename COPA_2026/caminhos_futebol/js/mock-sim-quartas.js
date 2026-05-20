// ═══════════════════════════════════════════════════
//  mock-sim-quartas.js — SIMULAÇÃO: 11/jul/2026 · fim do dia
//
//  Quartas de Final encerradas — Brasil 1×0 Inglaterra ⭐
//  Brasil CLASSIFICADO para a Semifinal!
//
//  Colunas R32 e Oitavas ocultas (todos os slots têm times).
//
//  Para usar: no index.html, troque o script:
//    <script src="js/mock-sim-quartas.js"></script>
// ═══════════════════════════════════════════════════
var MOCK_DATA = {
    enabled: true,
    config: {
        duration: 30000,
        TEXTO7: '#FBBF24',  // corDestaque
        TEXTO8: '#006400',  // corEscura
        TEXTO9: '#FFFFFF',  // corClara
        sponsor: {
            frase: '',
            logo:  './img/logo_patrocinio_02.png'
        }
    },
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
        //  OITAVAS DE FINAL — TODOS ENCERRADOS
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
        //  QUARTAS DE FINAL — TODOS ENCERRADOS
        //  QF-L1: Alemanha × Holanda (R16-L1 × R16-L2)
        //  QF-L2: Espanha × Bélgica  (R16-L3 × R16-L4)
        //  QF-R1: Brasil × Inglaterra (R16-R1 × R16-R2)  ⭐
        //  QF-R2: Argentina × Portugal (R16-R3 × R16-R4)
        // ══════════════════════════════════════════════════

        // QF-L1 ✅ — Alemanha 2×1 Holanda
        { CATEGORY:'QF', SUBTITULO:'1', SUBTITULO2:'09/07 · 17:00',
          TITULO:'Alemanha',   TITULO2:'Holanda',
          FOTO:'https://flagcdn.com/de.svg', FOTO2:'https://flagcdn.com/nl.svg',
          TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },

        // QF-L2 ✅ — Espanha 1×0 Bélgica
        { CATEGORY:'QF', SUBTITULO:'2', SUBTITULO2:'09/07 · 21:00',
          TITULO:'Espanha',    TITULO2:'Bélgica',
          FOTO:'https://flagcdn.com/es.svg', FOTO2:'https://flagcdn.com/be.svg',
          TEXTO:'1', TEXTO2:'0', SUBTITULO3:'FT' },

        // QF-R1 ✅ — BRASIL 1×0 Inglaterra  ⭐ CLASSIFICADO!
        { CATEGORY:'QF', SUBTITULO:'3', SUBTITULO2:'10/07 · 17:00',
          TITULO:'Brasil',     TITULO2:'Inglaterra',
          FOTO:'https://flagcdn.com/br.svg', FOTO2:'https://flagcdn.com/gb-eng.svg',
          TEXTO:'1', TEXTO2:'0', SUBTITULO3:'FT' },

        // QF-R2 ✅ — Argentina 2×1 Portugal
        { CATEGORY:'QF', SUBTITULO:'4', SUBTITULO2:'11/07 · 17:00',
          TITULO:'Argentina',  TITULO2:'Portugal',
          FOTO:'https://flagcdn.com/ar.svg', FOTO2:'https://flagcdn.com/pt.svg',
          TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },

        // ══════════════════════════════════════════════════
        //  SEMIFINAL (14–15/jul)
        //  SF-L: Alemanha × Espanha
        //  SF-R: BRASIL × Argentina  ⭐ Clássico Sul-Americano!
        // ══════════════════════════════════════════════════

        // SF-L ⏳ (14/jul)
        { CATEGORY:'SF', SUBTITULO:'1', SUBTITULO2:'14/07 · 17:00',
          TITULO:'Alemanha',   TITULO2:'Espanha',
          FOTO:'https://flagcdn.com/de.svg', FOTO2:'https://flagcdn.com/es.svg',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // SF-R ⏳ (15/jul) — BRASIL × Argentina  ⭐
        { CATEGORY:'SF', SUBTITULO:'2', SUBTITULO2:'15/07 · 17:00',
          TITULO:'Brasil',     TITULO2:'Argentina',
          FOTO:'https://flagcdn.com/br.svg', FOTO2:'https://flagcdn.com/ar.svg',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // ══════════════════════════════════════════════════
        //  FINAL e BRONZE — aguardando Semis
        // ══════════════════════════════════════════════════
        { CATEGORY:'FINAL',  SUBTITULO:'1', SUBTITULO2:'19/07 · 16:00', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'BRONZE', SUBTITULO:'1', SUBTITULO2:'18/07 · 16:00', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' }
    ]
};
