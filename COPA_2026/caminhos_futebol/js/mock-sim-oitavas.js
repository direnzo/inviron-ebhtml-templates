// ═══════════════════════════════════════════════════
//  mock-sim-oitavas.js — SIMULAÇÃO: 07/jul/2026 · fim do dia
//
//  Oitavas de Final em andamento — 4 de 8 partidas concluídas.
//  Brasil CLASSIFICADO! 2x0 Costa do Marfim → Quartas confirmado!
//
//  Colunas R32 ocultas (todos os 16 slots têm times definidos).
//
//  Para usar: no index.html, troque o script:
//    <script src="js/mock-sim-oitavas.js"></script>
// ═══════════════════════════════════════════════════
var MOCK_DATA = {
    enabled: true,
    config: {
        duration: 30000,
        sponsor: {
            frase: '',
            logo:  './img/logo_patrocinio_02.png'
        }
    },
    partidas: [

        // ══════════════════════════════════════════════════
        //  2ª RODADA — TODOS ENCERRADOS (oculta as colunas)
        // ══════════════════════════════════════════════════
        { CATEGORY:'R32', SUBTITULO:'1',  SUBTITULO2:'29/06 · 17:30', TITULO:'Alemanha',        TITULO2:'Marrocos',          FOTO:'https://flagcdn.com/de.svg',     FOTO2:'https://flagcdn.com/ma.svg',     TEXTO:'3', TEXTO2:'1', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'2',  SUBTITULO2:'30/06 · 18:00', TITULO:'França',           TITULO2:'Noruega',           FOTO:'https://flagcdn.com/fr.svg',     FOTO2:'https://flagcdn.com/no.svg',     TEXTO:'2', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'3',  SUBTITULO2:'28/06 · 16:00', TITULO:'Rep. da Coreia',   TITULO2:'Suíça',             FOTO:'https://flagcdn.com/kr.svg',     FOTO2:'https://flagcdn.com/ch.svg',     TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'4',  SUBTITULO2:'29/06 · 22:00', TITULO:'Holanda',          TITULO2:'Escócia',           FOTO:'https://flagcdn.com/nl.svg',     FOTO2:'https://flagcdn.com/gb-sct.svg', TEXTO:'2', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'5',  SUBTITULO2:'02/07 · 20:00', TITULO:'Colômbia',         TITULO2:'Croácia',           FOTO:'https://flagcdn.com/co.svg',     FOTO2:'https://flagcdn.com/hr.svg',     TEXTO:'1', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'6',  SUBTITULO2:'02/07 · 16:00', TITULO:'Espanha',          TITULO2:'Áustria',           FOTO:'https://flagcdn.com/es.svg',     FOTO2:'https://flagcdn.com/at.svg',     TEXTO:'3', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'7',  SUBTITULO2:'01/07 · 22:00', TITULO:'EUA',              TITULO2:'Bósnia e Herz.',    FOTO:'https://flagcdn.com/us.svg',     FOTO2:'https://flagcdn.com/ba.svg',     TEXTO:'2', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'8',  SUBTITULO2:'01/07 · 19:00', TITULO:'Bélgica',          TITULO2:'Argélia',           FOTO:'https://flagcdn.com/be.svg',     FOTO2:'https://flagcdn.com/dz.svg',     TEXTO:'1', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'9',  SUBTITULO2:'29/06 · 14:00', TITULO:'Brasil',           TITULO2:'Japão',             FOTO:'https://flagcdn.com/br.svg',     FOTO2:'https://flagcdn.com/jp.svg',     TEXTO:'3', TEXTO2:'1', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'10', SUBTITULO2:'30/06 · 14:00', TITULO:'Costa do Marfim',  TITULO2:'Senegal',           FOTO:'https://flagcdn.com/ci.svg',     FOTO2:'https://flagcdn.com/sn.svg',     TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'11', SUBTITULO2:'30/06 · 22:00', TITULO:'México',           TITULO2:'Arábia Saudita',    FOTO:'https://flagcdn.com/mx.svg',     FOTO2:'https://flagcdn.com/sa.svg',     TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'12', SUBTITULO2:'01/07 · 13:00', TITULO:'Inglaterra',       TITULO2:'Uzbequistão',       FOTO:'https://flagcdn.com/gb-eng.svg', FOTO2:'https://flagcdn.com/uz.svg',     TEXTO:'4', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'13', SUBTITULO2:'03/07 · 19:00', TITULO:'Argentina',        TITULO2:'Uruguai',           FOTO:'https://flagcdn.com/ar.svg',     FOTO2:'https://flagcdn.com/uy.svg',     TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'14', SUBTITULO2:'03/07 · 15:00', TITULO:'Turquia',          TITULO2:'Egito',             FOTO:'https://flagcdn.com/tr.svg',     FOTO2:'https://flagcdn.com/eg.svg',     TEXTO:'1', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'15', SUBTITULO2:'02/07 · 13:00', TITULO:'Canadá',           TITULO2:'Equador',           FOTO:'https://flagcdn.com/ca.svg',     FOTO2:'https://flagcdn.com/ec.svg',     TEXTO:'2', TEXTO2:'0', SUBTITULO3:'FT' },
        { CATEGORY:'R32', SUBTITULO:'16', SUBTITULO2:'03/07 · 13:00', TITULO:'Portugal',         TITULO2:'Austrália',         FOTO:'https://flagcdn.com/pt.svg',     FOTO2:'https://flagcdn.com/au.svg',     TEXTO:'3', TEXTO2:'0', SUBTITULO3:'FT' },

        // ══════════════════════════════════════════════════
        //  OITAVAS DE FINAL
        //  ✅ = encerrado  🔴 = ao vivo  ⏳ = aguardando
        //
        //  CHAVE ESQUERDA:
        //  L1(Alemanha) + L2(França)       → R16-L1
        //  L3(Rep.Coreia) + L4(Holanda)    → R16-L2
        //  L5(Colômbia) + L6(Espanha)      → R16-L3
        //  L7(EUA) + L8(Bélgica)           → R16-L4
        //
        //  CHAVE DIREITA:
        //  R1(Brasil) + R2(C.Marfim)       → R16-R1  ⭐ BRASIL!
        //  R3(México) + R4(Inglaterra)     → R16-R2
        //  R5(Argentina) + R6(Turquia)     → R16-R3
        //  R7(Canadá) + R8(Portugal)       → R16-R4
        // ══════════════════════════════════════════════════

        // R16-L1 ✅ (04/jul) — Alemanha 2×1 França
        { CATEGORY:'R16', SUBTITULO:'1', SUBTITULO2:'04/07 · 17:00',
          TITULO:'Alemanha',       TITULO2:'França',
          FOTO:'https://flagcdn.com/de.svg', FOTO2:'https://flagcdn.com/fr.svg',
          TEXTO:'2', TEXTO2:'1', SUBTITULO3:'FT' },

        // R16-L2 ✅ (04/jul) — Holanda 1×0 Rep. da Coreia
        { CATEGORY:'R16', SUBTITULO:'2', SUBTITULO2:'04/07 · 21:00',
          TITULO:'Rep. da Coreia', TITULO2:'Holanda',
          FOTO:'https://flagcdn.com/kr.svg', FOTO2:'https://flagcdn.com/nl.svg',
          TEXTO:'0', TEXTO2:'1', SUBTITULO3:'FT' },

        // R16-L3 ✅ (05/jul) — Espanha 2×0 Colômbia
        { CATEGORY:'R16', SUBTITULO:'3', SUBTITULO2:'05/07 · 17:00',
          TITULO:'Colômbia',       TITULO2:'Espanha',
          FOTO:'https://flagcdn.com/co.svg', FOTO2:'https://flagcdn.com/es.svg',
          TEXTO:'0', TEXTO2:'2', SUBTITULO3:'FT' },

        // R16-L4 ⏳ (06/jul) — ainda não disputado
        { CATEGORY:'R16', SUBTITULO:'4', SUBTITULO2:'06/07 · 17:00',
          TITULO:'EUA',            TITULO2:'Bélgica',
          FOTO:'https://flagcdn.com/us.svg', FOTO2:'https://flagcdn.com/be.svg',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // R16-R1 ✅ (05/jul) — BRASIL 2×0 Costa do Marfim  ⭐
        { CATEGORY:'R16', SUBTITULO:'5', SUBTITULO2:'05/07 · 21:00',
          TITULO:'Brasil',         TITULO2:'Costa do Marfim',
          FOTO:'https://flagcdn.com/br.svg', FOTO2:'https://flagcdn.com/ci.svg',
          TEXTO:'2', TEXTO2:'0', SUBTITULO3:'FT' },

        // R16-R2 ✅ (06/jul) — Inglaterra 3×1 México
        { CATEGORY:'R16', SUBTITULO:'6', SUBTITULO2:'06/07 · 17:00',
          TITULO:'México',         TITULO2:'Inglaterra',
          FOTO:'https://flagcdn.com/mx.svg', FOTO2:'https://flagcdn.com/gb-eng.svg',
          TEXTO:'1', TEXTO2:'3', SUBTITULO3:'FT' },

        // R16-R3 ⏳ (07/jul) — ainda não disputado
        { CATEGORY:'R16', SUBTITULO:'7', SUBTITULO2:'07/07 · 17:00',
          TITULO:'Argentina',      TITULO2:'Turquia',
          FOTO:'https://flagcdn.com/ar.svg', FOTO2:'https://flagcdn.com/tr.svg',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // R16-R4 ⏳ (07/jul) — ainda não disputado
        { CATEGORY:'R16', SUBTITULO:'8', SUBTITULO2:'07/07 · 21:00',
          TITULO:'Canadá',         TITULO2:'Portugal',
          FOTO:'https://flagcdn.com/ca.svg', FOTO2:'https://flagcdn.com/pt.svg',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // ══════════════════════════════════════════════════
        //  QUARTAS DE FINAL (9–11/jul)
        //  QF-L1: Alemanha × Holanda (R16-L1 × R16-L2 ✅)
        //  QF-L2: Espanha × ? (R16-L3 ✅ × R16-L4 ⏳)
        //  QF-R1: BRASIL × Inglaterra (R16-R1 × R16-R2 ✅) ⭐
        //  QF-R2: aguardando R16-R3 e R16-R4
        // ══════════════════════════════════════════════════

        // QF-L1 ✅ — Alemanha × Holanda
        { CATEGORY:'QF', SUBTITULO:'1', SUBTITULO2:'09/07 · 17:00',
          TITULO:'Alemanha',       TITULO2:'Holanda',
          FOTO:'https://flagcdn.com/de.svg', FOTO2:'https://flagcdn.com/nl.svg',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // QF-L2 ⏳ — Espanha × aguardando EUA ou Bélgica
        { CATEGORY:'QF', SUBTITULO:'2', SUBTITULO2:'',
          TITULO:'Espanha',        TITULO2:'',
          FOTO:'https://flagcdn.com/es.svg', FOTO2:'',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // QF-R1 ✅ — BRASIL × Inglaterra  ⭐
        { CATEGORY:'QF', SUBTITULO:'3', SUBTITULO2:'10/07 · 17:00',
          TITULO:'Brasil',         TITULO2:'Inglaterra',
          FOTO:'https://flagcdn.com/br.svg', FOTO2:'https://flagcdn.com/gb-eng.svg',
          TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // QF-R2 ⏳ — aguardando Argentina/Turquia e Canadá/Portugal
        { CATEGORY:'QF', SUBTITULO:'4', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // ══════════════════════════════════════════════════
        //  SEMIFINAL, FINAL, BRONZE — aguardando Quartas
        // ══════════════════════════════════════════════════
        { CATEGORY:'SF',     SUBTITULO:'1', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'SF',     SUBTITULO:'2', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'FINAL',  SUBTITULO:'1', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'BRONZE', SUBTITULO:'1', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' }
    ]
};
