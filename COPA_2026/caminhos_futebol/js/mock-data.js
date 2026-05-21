// ═══════════════════════════════════════════════════
//  mock-data.js — caminhos_futebol
//  Mundial de Futebol 2026 — chaveamento oficial (sorteio 05/12/2025)
//
//  CAMPOS alinhados com o XML D_COPA (D_FOOTBALL.xml):
//  CATEGORY  → fase do torneio  (R32 | R16 | QF | SF | FINAL | BRONZE)
//  SUBTITULO → posição no slot  (1-16 para R32, 1-8 R16, etc.)
//  TITULO    → time da casa
//  TITULO2   → time visitante
//  FOTO      → URL bandeira casa    (ex: https://flagcdn.com/br.svg)
//  FOTO2     → URL bandeira visitante
//  TEXTO     → gols time casa       (vazio se não disputado)
//  TEXTO2    → gols time visitante
//  SUBTITULO3→ status do jogo       (NS | 1H | HT | 2H | ET | P | FT | AET | PEN)
//
//  Grupos confirmados (fonte: FIFA, mai/2026):
//  A: México · África do Sul · República da Coreia · Tchéquia
//  B: Canadá · Bósnia e Herzegovina · Catar · Suíça
//  C: Brasil · Marrocos · Haiti · Escócia
//  D: EUA · Paraguai · Austrália · Turquia
//  E: Alemanha · Curaçau · Costa do Marfim · Equador
//  F: Holanda · Japão · Suécia · Tunísia
//  G: Bélgica · Egito · RI do Irã · Nova Zelândia
//  H: Espanha · Cabo Verde · Arábia Saudita · Uruguai
//  I: França · Senegal · Iraque · Noruega
//  J: Argentina · Argélia · Áustria · Jordânia
//  K: Portugal · RD do Congo · Uzbequistão · Colômbia
//  L: Inglaterra · Croácia · Gana · Panamá
// ═══════════════════════════════════════════════════
var MOCK_DATA = {
    enabled: true,
    config: {
        duration: 10000
    },
    /* --- Simula registro D_SPD (item com CONFIG='1') --- */
    D_SPD: {
        CONFIG:      '1',
        TEXT1:       'Apoio:',
        IMAGE_LOGO:  'img/logo_sponsor.png',
        FILE_IMAGE1: 'img/sponsor.mp4',
        TEXTO7:      '#FBBF24',  // corDestaque
        TEXTO8:      '#006400',  // corEscura
        TEXTO9:      '#FFFFFF'   // corClara
    },
    partidas: [

        // ══════════════════════════════════════════════════
        //  2ª RODADA (28/jun – 3/jul) — LADO ESQUERDO L1-L8
        //  L1+L2 → Oitavas L1 | L3+L4 → Oitavas L2
        //  L5+L6 → Oitavas L3 | L7+L8 → Oitavas L4
        // ══════════════════════════════════════════════════

        // L1 — Partida 74 (29/jun · Houston)
        { CATEGORY:'R32', SUBTITULO:'1',  SUBTITULO2:'29/06 · 17:30', TITULO:'1ºE',  TITULO2:'3ºABCDF', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // L2 — Partida 77 (30/jun · East Rutherford)
        { CATEGORY:'R32', SUBTITULO:'2',  SUBTITULO2:'30/06 · 18:00', TITULO:'1ºI',  TITULO2:'3ºCDFGH', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // L3 — Partida 73 (28/jun · Inglewood)
        { CATEGORY:'R32', SUBTITULO:'3',  SUBTITULO2:'28/06 · 16:00', TITULO:'2ºA',  TITULO2:'2ºB',     FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // L4 — Partida 75 (29/jun · Guadalupe)
        { CATEGORY:'R32', SUBTITULO:'4',  SUBTITULO2:'29/06 · 22:00', TITULO:'1ºF',  TITULO2:'2ºC',     FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // L5 — Partida 83 (2/jul · Inglewood)
        { CATEGORY:'R32', SUBTITULO:'5',  SUBTITULO2:'02/07 · 20:00', TITULO:'2ºK',  TITULO2:'2ºL',     FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // L6 — Partida 84 (2/jul · Inglewood)
        { CATEGORY:'R32', SUBTITULO:'6',  SUBTITULO2:'02/07 · 16:00', TITULO:'1ºH',  TITULO2:'2ºJ',     FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // L7 — Partida 81 (1/jul · Santa Clara)
        { CATEGORY:'R32', SUBTITULO:'7',  SUBTITULO2:'01/07 · 22:00', TITULO:'1ºD',  TITULO2:'3ºBEFIJ', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // L8 — Partida 82 (1/jul · Seattle)
        { CATEGORY:'R32', SUBTITULO:'8',  SUBTITULO2:'01/07 · 19:00', TITULO:'1ºG',  TITULO2:'3ºAEHIJ', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // ══════════════════════════════════════════════════
        //  2ª RODADA — LADO DIREITO R1-R8
        //  R1+R2 → Oitavas R1 | R3+R4 → Oitavas R2
        //  R5+R6 → Oitavas R3 | R7+R8 → Oitavas R4
        // ══════════════════════════════════════════════════

        // R1 — Partida 76 (29/jun · Houston)
        { CATEGORY:'R32', SUBTITULO:'9',  SUBTITULO2:'29/06 · 14:00', TITULO:'1ºC',  TITULO2:'2ºF',     FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // R2 — Partida 78 (30/jun · Arlington)
        { CATEGORY:'R32', SUBTITULO:'10', SUBTITULO2:'30/06 · 14:00', TITULO:'2ºE',  TITULO2:'2ºI',     FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // R3 — Partida 79 (30/jun · Cidade do México)
        { CATEGORY:'R32', SUBTITULO:'11', SUBTITULO2:'30/06 · 22:00', TITULO:'1ºA',  TITULO2:'3ºCEFHI', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // R4 — Partida 80 (1/jul · Atlanta)
        { CATEGORY:'R32', SUBTITULO:'12', SUBTITULO2:'01/07 · 13:00', TITULO:'1ºL',  TITULO2:'3ºEHIJK', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // R5 — Partida 86 (3/jul · Arlington)
        { CATEGORY:'R32', SUBTITULO:'13', SUBTITULO2:'03/07 · 19:00', TITULO:'1ºJ',  TITULO2:'2ºH',     FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // R6 — Partida 88 (3/jul · Vancouver)
        { CATEGORY:'R32', SUBTITULO:'14', SUBTITULO2:'03/07 · 15:00', TITULO:'2ºD',  TITULO2:'2ºG',     FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // R7 — Partida 85 (2/jul · Vancouver)
        { CATEGORY:'R32', SUBTITULO:'15', SUBTITULO2:'02/07 · 13:00', TITULO:'1ºB',  TITULO2:'3ºEFGIJ', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // R8 — Partida 87 (3/jul · Kansas City)
        { CATEGORY:'R32', SUBTITULO:'16', SUBTITULO2:'03/07 · 13:00', TITULO:'1ºK',  TITULO2:'3ºDEIJL', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // ══════════════════════════════════════════════════
        //  OITAVAS DE FINAL (4–7/jul) — preencher após R32
        // ══════════════════════════════════════════════════
        { CATEGORY:'R16', SUBTITULO:'1', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'R16', SUBTITULO:'2', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'R16', SUBTITULO:'3', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'R16', SUBTITULO:'4', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'R16', SUBTITULO:'5', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'R16', SUBTITULO:'6', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'R16', SUBTITULO:'7', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'R16', SUBTITULO:'8', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // ══════════════════════════════════════════════════
        //  QUARTAS DE FINAL (9–11/jul) — preencher após R16
        // ══════════════════════════════════════════════════
        { CATEGORY:'QF', SUBTITULO:'1', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'QF', SUBTITULO:'2', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'QF', SUBTITULO:'3', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'QF', SUBTITULO:'4', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // ══════════════════════════════════════════════════
        //  SEMIFINAL (14–15/jul) — preencher após QF
        // ══════════════════════════════════════════════════
        { CATEGORY:'SF', SUBTITULO:'1', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },
        { CATEGORY:'SF', SUBTITULO:'2', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // ══════════════════════════════════════════════════
        //  FINAL (19/jul · MetLife Stadium, Nova York)
        // ══════════════════════════════════════════════════
        { CATEGORY:'FINAL',  SUBTITULO:'1', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' },

        // ══════════════════════════════════════════════════
        //  3º LUGAR (18/jul · Hard Rock Stadium, Miami)
        // ══════════════════════════════════════════════════
        { CATEGORY:'BRONZE', SUBTITULO:'1', SUBTITULO2:'', TITULO:'', TITULO2:'', FOTO:'', FOTO2:'', TEXTO:'', TEXTO2:'', SUBTITULO3:'NS' }
    ]
};

// Gera D_FOOTBALL.TEXTO3 espelhando a producao (campo JSON no XML)
MOCK_DATA.D_FOOTBALL = { TEXTO3: JSON.stringify(MOCK_DATA.partidas) };

