// ═══════════════════════════════════════════════════
//  mock-data.js — caminhos_futebol
//  Copa 2026 simulada: R32 completo, R16 em andamento
// ═══════════════════════════════════════════════════
var MOCK_DATA = {
    enabled: true,
    config: {
        duration: 30000,
        sponsor: {
            frase: 'Vivo Fibra',
            logo:  ''
        }
    },
    partidas: [
        // ═══════ 2ª RODADA — ESQUERDA (L 1-8) ═══════
        { FASE:'R32', POSICAO:1,  TIME_CASA:'USA', TIME_VISITANTE:'URU', FLAG_CASA:'https://flagcdn.com/us.svg',     FLAG_VISITANTE:'https://flagcdn.com/uy.svg', GOLS_CASA:'3', GOLS_VISITANTE:'1', STATUS:'FT' },
        { FASE:'R32', POSICAO:2,  TIME_CASA:'MEX', TIME_VISITANTE:'ECU', FLAG_CASA:'https://flagcdn.com/mx.svg',     FLAG_VISITANTE:'https://flagcdn.com/ec.svg', GOLS_CASA:'2', GOLS_VISITANTE:'0', STATUS:'FT' },
        { FASE:'R32', POSICAO:3,  TIME_CASA:'CAN', TIME_VISITANTE:'CHI', FLAG_CASA:'https://flagcdn.com/ca.svg',     FLAG_VISITANTE:'https://flagcdn.com/cl.svg', GOLS_CASA:'1', GOLS_VISITANTE:'0', STATUS:'FT' },
        { FASE:'R32', POSICAO:4,  TIME_CASA:'BRA', TIME_VISITANTE:'COL', FLAG_CASA:'https://flagcdn.com/br.svg',     FLAG_VISITANTE:'https://flagcdn.com/co.svg', GOLS_CASA:'2', GOLS_VISITANTE:'1', STATUS:'FT' },
        { FASE:'R32', POSICAO:5,  TIME_CASA:'ARG', TIME_VISITANTE:'PER', FLAG_CASA:'https://flagcdn.com/ar.svg',     FLAG_VISITANTE:'https://flagcdn.com/pe.svg', GOLS_CASA:'4', GOLS_VISITANTE:'0', STATUS:'FT' },
        { FASE:'R32', POSICAO:6,  TIME_CASA:'ESP', TIME_VISITANTE:'POL', FLAG_CASA:'https://flagcdn.com/es.svg',     FLAG_VISITANTE:'https://flagcdn.com/pl.svg', GOLS_CASA:'3', GOLS_VISITANTE:'0', STATUS:'FT' },
        { FASE:'R32', POSICAO:7,  TIME_CASA:'FRA', TIME_VISITANTE:'TUN', FLAG_CASA:'https://flagcdn.com/fr.svg',     FLAG_VISITANTE:'https://flagcdn.com/tn.svg', GOLS_CASA:'2', GOLS_VISITANTE:'1', STATUS:'FT' },
        { FASE:'R32', POSICAO:8,  TIME_CASA:'POR', TIME_VISITANTE:'TUR', FLAG_CASA:'https://flagcdn.com/pt.svg',     FLAG_VISITANTE:'https://flagcdn.com/tr.svg', GOLS_CASA:'3', GOLS_VISITANTE:'2', STATUS:'FT' },
        // ═══════ 2ª RODADA — DIREITA (R 9-16) ═══════
        { FASE:'R32', POSICAO:9,  TIME_CASA:'ENG', TIME_VISITANTE:'SEN', FLAG_CASA:'https://flagcdn.com/gb-eng.svg', FLAG_VISITANTE:'https://flagcdn.com/sn.svg', GOLS_CASA:'3', GOLS_VISITANTE:'0', STATUS:'FT' },
        { FASE:'R32', POSICAO:10, TIME_CASA:'GER', TIME_VISITANTE:'JPN', FLAG_CASA:'https://flagcdn.com/de.svg',     FLAG_VISITANTE:'https://flagcdn.com/jp.svg', GOLS_CASA:'2', GOLS_VISITANTE:'1', STATUS:'FT' },
        { FASE:'R32', POSICAO:11, TIME_CASA:'NED', TIME_VISITANTE:'KOR', FLAG_CASA:'https://flagcdn.com/nl.svg',     FLAG_VISITANTE:'https://flagcdn.com/kr.svg', GOLS_CASA:'4', GOLS_VISITANTE:'0', STATUS:'FT' },
        { FASE:'R32', POSICAO:12, TIME_CASA:'BEL', TIME_VISITANTE:'AUS', FLAG_CASA:'https://flagcdn.com/be.svg',     FLAG_VISITANTE:'https://flagcdn.com/au.svg', GOLS_CASA:'2', GOLS_VISITANTE:'1', STATUS:'FT' },
        { FASE:'R32', POSICAO:13, TIME_CASA:'ITA', TIME_VISITANTE:'MAR', FLAG_CASA:'https://flagcdn.com/it.svg',     FLAG_VISITANTE:'https://flagcdn.com/ma.svg', GOLS_CASA:'1', GOLS_VISITANTE:'0', STATUS:'FT' },
        { FASE:'R32', POSICAO:14, TIME_CASA:'CRO', TIME_VISITANTE:'VEN', FLAG_CASA:'https://flagcdn.com/hr.svg',     FLAG_VISITANTE:'https://flagcdn.com/ve.svg', GOLS_CASA:'2', GOLS_VISITANTE:'1', STATUS:'FT' },
        { FASE:'R32', POSICAO:15, TIME_CASA:'SUI', TIME_VISITANTE:'NGA', FLAG_CASA:'https://flagcdn.com/ch.svg',     FLAG_VISITANTE:'https://flagcdn.com/ng.svg', GOLS_CASA:'1', GOLS_VISITANTE:'0', STATUS:'FT' },
        { FASE:'R32', POSICAO:16, TIME_CASA:'DEN', TIME_VISITANTE:'CRC', FLAG_CASA:'https://flagcdn.com/dk.svg',     FLAG_VISITANTE:'https://flagcdn.com/cr.svg', GOLS_CASA:'3', GOLS_VISITANTE:'1', STATUS:'FT' },
        // ═══════ OITAVAS — ESQUERDA (L 1-4) ═══════
        { FASE:'R16', POSICAO:1, TIME_CASA:'USA', TIME_VISITANTE:'MEX', FLAG_CASA:'https://flagcdn.com/us.svg', FLAG_VISITANTE:'https://flagcdn.com/mx.svg', GOLS_CASA:'2', GOLS_VISITANTE:'0', STATUS:'FT' },
        { FASE:'R16', POSICAO:2, TIME_CASA:'BRA', TIME_VISITANTE:'CAN', FLAG_CASA:'https://flagcdn.com/br.svg', FLAG_VISITANTE:'https://flagcdn.com/ca.svg', GOLS_CASA:'3', GOLS_VISITANTE:'1', STATUS:'FT' },
        { FASE:'R16', POSICAO:3, TIME_CASA:'ARG', TIME_VISITANTE:'ESP', FLAG_CASA:'https://flagcdn.com/ar.svg', FLAG_VISITANTE:'https://flagcdn.com/es.svg', GOLS_CASA:'',  GOLS_VISITANTE:'',  STATUS:'NS' },
        { FASE:'R16', POSICAO:4, TIME_CASA:'FRA', TIME_VISITANTE:'POR', FLAG_CASA:'https://flagcdn.com/fr.svg', FLAG_VISITANTE:'https://flagcdn.com/pt.svg', GOLS_CASA:'',  GOLS_VISITANTE:'',  STATUS:'NS' },
        // ═══════ OITAVAS — DIREITA (R 5-8) ═══════
        { FASE:'R16', POSICAO:5, TIME_CASA:'ENG', TIME_VISITANTE:'GER', FLAG_CASA:'https://flagcdn.com/gb-eng.svg', FLAG_VISITANTE:'https://flagcdn.com/de.svg', GOLS_CASA:'2', GOLS_VISITANTE:'1', STATUS:'FT' },
        { FASE:'R16', POSICAO:6, TIME_CASA:'NED', TIME_VISITANTE:'BEL', FLAG_CASA:'https://flagcdn.com/nl.svg', FLAG_VISITANTE:'https://flagcdn.com/be.svg', GOLS_CASA:'3', GOLS_VISITANTE:'2', STATUS:'FT' },
        { FASE:'R16', POSICAO:7, TIME_CASA:'ITA', TIME_VISITANTE:'CRO', FLAG_CASA:'https://flagcdn.com/it.svg', FLAG_VISITANTE:'https://flagcdn.com/hr.svg', GOLS_CASA:'',  GOLS_VISITANTE:'',  STATUS:'NS' },
        { FASE:'R16', POSICAO:8, TIME_CASA:'SUI', TIME_VISITANTE:'DEN', FLAG_CASA:'https://flagcdn.com/ch.svg', FLAG_VISITANTE:'https://flagcdn.com/dk.svg', GOLS_CASA:'',  GOLS_VISITANTE:'',  STATUS:'NS' },
        // ═══════ QUARTAS (L 1-2, R 3-4) ═══════
        { FASE:'QF', POSICAO:1, TIME_CASA:'USA', TIME_VISITANTE:'BRA', FLAG_CASA:'https://flagcdn.com/us.svg', FLAG_VISITANTE:'https://flagcdn.com/br.svg', GOLS_CASA:'', GOLS_VISITANTE:'', STATUS:'NS' },
        { FASE:'QF', POSICAO:2, TIME_CASA:'TBD', TIME_VISITANTE:'TBD', FLAG_CASA:'', FLAG_VISITANTE:'', GOLS_CASA:'', GOLS_VISITANTE:'', STATUS:'NS' },
        { FASE:'QF', POSICAO:3, TIME_CASA:'ENG', TIME_VISITANTE:'NED', FLAG_CASA:'https://flagcdn.com/gb-eng.svg', FLAG_VISITANTE:'https://flagcdn.com/nl.svg', GOLS_CASA:'', GOLS_VISITANTE:'', STATUS:'NS' },
        { FASE:'QF', POSICAO:4, TIME_CASA:'TBD', TIME_VISITANTE:'TBD', FLAG_CASA:'', FLAG_VISITANTE:'', GOLS_CASA:'', GOLS_VISITANTE:'', STATUS:'NS' },
        // ═══════ SEMIFINAL ═══════
        { FASE:'SF', POSICAO:1, TIME_CASA:'TBD', TIME_VISITANTE:'TBD', FLAG_CASA:'', FLAG_VISITANTE:'', GOLS_CASA:'', GOLS_VISITANTE:'', STATUS:'NS' },
        { FASE:'SF', POSICAO:2, TIME_CASA:'TBD', TIME_VISITANTE:'TBD', FLAG_CASA:'', FLAG_VISITANTE:'', GOLS_CASA:'', GOLS_VISITANTE:'', STATUS:'NS' },
        // ═══════ FINAL ═══════
        { FASE:'FINAL',  POSICAO:1, TIME_CASA:'TBD', TIME_VISITANTE:'TBD', FLAG_CASA:'', FLAG_VISITANTE:'', GOLS_CASA:'', GOLS_VISITANTE:'', STATUS:'NS' },
        // ═══════ 3º LUGAR ═══════
        { FASE:'BRONZE', POSICAO:1, TIME_CASA:'TBD', TIME_VISITANTE:'TBD', FLAG_CASA:'', FLAG_VISITANTE:'', GOLS_CASA:'', GOLS_VISITANTE:'', STATUS:'NS' }
    ]
};
