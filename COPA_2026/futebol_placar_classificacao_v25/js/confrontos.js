/**
 * confrontos.js — Modo CONFRONTOS (cards didaticos)
 * ES5 obrigatorio
 *
 * Exibe 1 chave por reload (bloco de ate 4 jogos cujos
 * vencedores formam a fase seguinte).
 *
 * Extraido do segundafase_futebol/master.js
 * Adaptado para usar o loader unificado (master.js)
 */

/* ====================================================
   MAPEAMENTO DE FASES
   ==================================================== */
var FASES_ORDEM = ['R32', 'R16', 'QF', 'SF', 'FINAL', 'BRONZE'];
var FASE_LABEL_CONFR = {
    'R32':    'Segunda Fase',
    'R16':    'Oitavas de Final',
    'QF':     'Quartas de Final',
    'SF':     'Semifinais',
    'FINAL':  'Grande Final',
    'BRONZE': 'Disputa do 3o Lugar'
};
var FASE_CURTA = {
    'R32': 'Segunda Fase', 'R16': 'Oitavas', 'QF': 'Quartas',
    'SF':  'Semis', 'FINAL': 'Final', 'BRONZE': '3o Lugar'
};

var LS_KEY_CHAVE = 'futebol_v25_chave_idx';

var STATUS_LABEL_CONFR = {
    'TBD':  'A definir', 'NS': 'Nao iniciado',
    '1H': 'Ao vivo', 'HT': 'Intervalo', '2H': 'Ao vivo',
    'ET': 'Prorrogacao', 'BT': 'Intervalo',
    'P': 'Penaltis', 'FT': 'Finalizado', 'AET': 'Finalizado',
    'PEN': 'Finalizado', 'LIVE': 'Ao vivo'
};

/* ====================================================
   MAPEAMENTO DE BANDEIRAS SVG (48 times Copa 2026)
   Codigos 3 letras → filename SVG (sem path)
   ==================================================== */
function mapearCodigoParaSVG(code) {
    if (!code) return null;
    var map = {
        'USA': 'us', 'MEX': 'mx', 'CAN': 'ca', 'CRC': 'cr',
        'JAM': 'jm', 'PAN': 'pa', 'HON': 'hn', 'SLV': 'sv',
        'TRI': 'tt', 'CUW': 'cw', 'GUA': 'gt', 'HAI': 'ht',
        'NCA': 'ni', 'SUR': 'sr', 'MTQ': 'mq', 'GUY': 'gy',
        'BRA': 'br', 'ARG': 'ar', 'URU': 'uy', 'COL': 'co',
        'CHI': 'cl', 'ECU': 'ec', 'PAR': 'py', 'PER': 'pe',
        'BOL': 'bo', 'VEN': 've',
        'GER': 'de', 'FRA': 'fr', 'ENG': 'gb-eng', 'ESP': 'es',
        'BEL': 'be', 'NED': 'nl', 'HOL': 'nl', 'ITA': 'it', 'POR': 'pt',
        'CRO': 'hr', 'SUI': 'ch', 'DEN': 'dk', 'POL': 'pl',
        'AUT': 'at', 'SWE': 'se', 'UKR': 'ua', 'WAL': 'gb-wls',
        'SRB': 'rs', 'BIH': 'ba', 'BOS': 'ba', 'NOR': 'no',
        'ROU': 'ro', 'GRE': 'gr', 'TUR': 'tr', 'CZE': 'cz',
        'SVK': 'sk', 'HUN': 'hu', 'SLO': 'si', 'ISR': 'il',
        'SEN': 'sn', 'MOR': 'ma', 'MAR': 'ma', 'TUN': 'tn', 'NGA': 'ng',
        'RSA': 'za', 'SOU': 'za', 'ZAF': 'za', 'CMR': 'cm', 'EGY': 'eg',
        'GUI': 'gn', 'CIV': 'ci', 'GHA': 'gh', 'BFA': 'bf',
        'ALG': 'dz', 'COD': 'cd', 'ZAM': 'zm',
        'JPN': 'jp', 'JAP': 'jp', 'KOR': 'kr', 'AUS': 'au',
        'IRN': 'ir', 'IRQ': 'iq', 'KSA': 'sa', 'QAT': 'qa',
        'UZB': 'uz', 'JOR': 'jo', 'NZL': 'nz'
    };
    return map[code.toUpperCase()] || null;
}

function obterBandeiraSVG(teamCode, fotoUrl) {
    var svgCode = mapearCodigoParaSVG(teamCode);
    var svgPath = svgCode ? ('img/flags/' + svgCode + '.svg') : null;
    if (fotoUrl) { return { bandeira: fotoUrl, bandeiraFallback: svgPath }; }
    return { bandeira: svgPath, bandeiraFallback: null };
}

/* ====================================================
   PARSE ITEM FOOTBALL — converte item EBHTML (D_FOOTBALL)
   para objeto interno de partida
   ==================================================== */
function parseItemFootball(item) {
    if (!item) { return null; }
    var fixtureId = obterValor(item, 'TITULO') || '';
    var round     = obterValor(item, 'TEXTO4') || '';
    var statusRaw = obterValor(item, 'TEXTO5') || 'NS';
    var dateStr   = obterValor(item, 'DATE')   || '';
    var texto2    = obterValor(item, 'TEXTO2') || '';

    var homeId = '', awayId = '', homeName = '', awayName = '';
    var homeLogo = '', awayLogo = '';
    var goalsHome = null, goalsAway = null;
    var penHome = null, penAway = null;
    var venue = '', elapsed = null, extra = null;

    try {
        var obj = JSON.parse(texto2);
        var resp = obj.response && obj.response[0];
        if (resp) {
            if (resp.teams && resp.teams.home) {
                homeId   = String(resp.teams.home.id  || '');
                homeName = resp.teams.home.name  || '';
                homeLogo = resp.teams.home.logo  || '';
            }
            if (resp.teams && resp.teams.away) {
                awayId   = String(resp.teams.away.id  || '');
                awayName = resp.teams.away.name  || '';
                awayLogo = resp.teams.away.logo  || '';
            }
            if (resp.goals) { goalsHome = resp.goals.home; goalsAway = resp.goals.away; }
            if (resp.score && resp.score.penalty) { penHome = resp.score.penalty.home; penAway = resp.score.penalty.away; }
            if (resp.fixture) {
                if (resp.fixture.venue) { venue = resp.fixture.venue.name || ''; }
                if (resp.fixture.status) { elapsed = resp.fixture.status.elapsed; extra = resp.fixture.status.extra; }
            }
        }
    } catch (e) {
        console.warn('[confrontos] parseItemFootball: JSON invalido para fixtureId=' + fixtureId);
    }

    return {
        fixtureId: fixtureId, round: round, statusRaw: statusRaw, dateStr: dateStr,
        homeId: homeId, awayId: awayId, homeName: homeName, awayName: awayName,
        homeLogo: homeLogo, awayLogo: awayLogo,
        goalsHome: goalsHome, goalsAway: goalsAway,
        penHome: penHome, penAway: penAway,
        venue: venue, elapsed: elapsed, extra: extra
    };
}

/* ====================================================
   isFaseEliminatoria — true para rounds eliminatórios
   ==================================================== */
function isFaseEliminatoria(roundName) {
    if (!roundName) { return false; }
    var r = roundName.toLowerCase();
    return (
        r.indexOf('round of 32') !== -1 || r.indexOf('round of 16') !== -1 ||
        r.indexOf('quarter')     !== -1 || r.indexOf('semi') !== -1 ||
        r.indexOf('3rd')         !== -1 || r.indexOf('third') !== -1 ||
        r === 'final'
    );
}

/* ====================================================
   mapearFaseParaCategoria — round → CATEGORY interno
   ==================================================== */
function mapearFaseParaCategoria(roundName) {
    if (!roundName) { return ''; }
    var r = roundName.toLowerCase();
    if (r.indexOf('round of 32') !== -1) { return 'R32'; }
    if (r.indexOf('round of 16') !== -1) { return 'R16'; }
    if (r.indexOf('quarter')     !== -1) { return 'QF'; }
    if (r.indexOf('semi')        !== -1) { return 'SF'; }
    if (r.indexOf('3rd')         !== -1) { return 'BRONZE'; }
    if (r.indexOf('third')       !== -1) { return 'BRONZE'; }
    if (r === 'final')                   { return 'FINAL'; }
    return '';
}

/* ====================================================
   FIXTURE_SLOT_MAP + TEAMS_SLOT_MAP — mapeamento
   (mesmo do caminhos_futebol para posicionamento)
   ==================================================== */
var FIXTURE_SLOT_MAP = {
    '1561329': { CATEGORY: 'R32', SUBTITULO: '3'  },
    '1562344': { CATEGORY: 'R32', SUBTITULO: '9'  },
    '1562345': { CATEGORY: 'R32', SUBTITULO: '4'  },
    '1562586': { CATEGORY: 'R32', SUBTITULO: '7'  }
};

var TEAMS_SLOT_MAP = {
    '1531|5529': { CATEGORY: 'R32', SUBTITULO: '3'  },
    '25':        { CATEGORY: 'R32', SUBTITULO: '1'  },
    '1118|31':   { CATEGORY: 'R32', SUBTITULO: '4'  },
    '6|12':      { CATEGORY: 'R32', SUBTITULO: '9'  },
    '1501':      { CATEGORY: 'R32', SUBTITULO: '10' },
    '16':        { CATEGORY: 'R32', SUBTITULO: '11' },
    '10':        { CATEGORY: 'R32', SUBTITULO: '12' },
    '2384|1113': { CATEGORY: 'R32', SUBTITULO: '7'  },
    '1':         { CATEGORY: 'R32', SUBTITULO: '8'  },
    '9|26':      { CATEGORY: 'R32', SUBTITULO: '6'  },
    '9':         { CATEGORY: 'R32', SUBTITULO: '6'  },
    '5529':      { CATEGORY: 'R32', SUBTITULO: '15' },
    '26':        { CATEGORY: 'R32', SUBTITULO: '13' },
    '27':        { CATEGORY: 'R32', SUBTITULO: '16' },
    '777':       { CATEGORY: 'R32', SUBTITULO: '14' }
};

function buscarSlotPorTeams(homeId, awayId) {
    var h = String(homeId || '');
    var a = String(awayId || '');
    if (h && a) {
        if (TEAMS_SLOT_MAP[h + '|' + a]) { return TEAMS_SLOT_MAP[h + '|' + a]; }
        if (TEAMS_SLOT_MAP[a + '|' + h]) { return TEAMS_SLOT_MAP[a + '|' + h]; }
    }
    if (h && TEAMS_SLOT_MAP[h]) { return TEAMS_SLOT_MAP[h]; }
    if (a && TEAMS_SLOT_MAP[a]) { return TEAMS_SLOT_MAP[a]; }
    return null;
}

/* ====================================================
   atribuirPosicoesBracket — 2 camadas + fallback por data
   ==================================================== */
function atribuirPosicoesBracket(partidas) {
    var result = [];
    var porFase = {};

    for (var i = 0; i < partidas.length; i++) {
        var p   = partidas[i];
        var cat = mapearFaseParaCategoria(p.round);
        if (!cat) { continue; }

        var slot = FIXTURE_SLOT_MAP[String(p.fixtureId)];
        if (slot) {
            p.CATEGORY = slot.CATEGORY;
            p.SUBTITULO = slot.SUBTITULO;
            result.push(p);
            continue;
        }

        if (cat === 'R32') {
            slot = buscarSlotPorTeams(p.homeId, p.awayId);
            if (slot) {
                p.CATEGORY = slot.CATEGORY;
                p.SUBTITULO = slot.SUBTITULO;
                result.push(p);
                continue;
            }
        }

        if (!porFase[cat]) { porFase[cat] = []; }
        porFase[cat].push(p);
    }

    var fases = ['R32', 'R16', 'QF', 'SF', 'FINAL', 'BRONZE'];
    var usedR32Slots = {};
    for (var k = 0; k < result.length; k++) {
        if (result[k].CATEGORY === 'R32') { usedR32Slots[result[k].SUBTITULO] = true; }
    }

    for (var f = 0; f < fases.length; f++) {
        var fase = fases[f];
        var lista = porFase[fase] || [];
        if (lista.length === 0) { continue; }

        lista.sort(function(a, b) {
            var da = a.dateStr || '';
            var db = b.dateStr || '';
            if (da < db) { return -1; }
            if (da > db) { return 1; }
            return parseInt(a.fixtureId || 0, 10) - parseInt(b.fixtureId || 0, 10);
        });

        var nextSlot = 1;
        for (var j = 0; j < lista.length; j++) {
            var partida = lista[j];
            if (fase === 'R32') {
                while (usedR32Slots[String(nextSlot)]) { nextSlot++; }
                partida.CATEGORY = fase;
                partida.SUBTITULO = String(nextSlot);
                usedR32Slots[String(nextSlot)] = true;
                nextSlot++;
            } else {
                partida.CATEGORY = fase;
                partida.SUBTITULO = String(j + 1);
            }
            result.push(partida);
        }
    }

    return result;
}

/* ====================================================
   processarDadosApi — converte array da API para
   formato { "FASE_SLOT": { campos } }
   ==================================================== */
function processarDadosApi(partidas, teamsMap) {
    teamsMap = teamsMap || {};
    var dados = {};

    for (var i = 0; i < partidas.length; i++) {
        var p = partidas[i];
        var fase = p.CATEGORY || '';
        var pos = p.SUBTITULO || '';
        if (!fase || !pos) { continue; }

        var chave = fase + '_' + pos;
        var timeCasa = ''; var timeVis = ''; var flagCasa = p.homeLogo || ''; var flagVis = p.awayLogo || '';

        if (teamsMap[p.homeId]) {
            timeCasa = teamsMap[p.homeId].nome;
            flagCasa = teamsMap[p.homeId].bandeira || teamsMap[p.homeId].fotoApi || flagCasa;
        } else { timeCasa = p.homeName || ''; }

        if (teamsMap[p.awayId]) {
            timeVis = teamsMap[p.awayId].nome;
            flagVis = teamsMap[p.awayId].bandeira || teamsMap[p.awayId].fotoApi || flagVis;
        } else { timeVis = p.awayName || ''; }

        var datahora = ''; var data = ''; var hora = '';
        if (p.dateStr) {
            var partes = p.dateStr.split(' ');
            var dp = (partes[0] || '').split('-');
            var hp = (partes[1] || '').split(':');
            var dia = dp[2] || ''; var mes = dp[1] || '';
            hora = (hp[0] || '') + ':' + (hp[1] || '00');
            datahora = dia + '/' + mes + ' . ' + hora;
            data = dia + '/' + mes;
        }

        var golsCasa = (p.goalsHome !== null && p.goalsHome !== undefined) ? String(p.goalsHome) : '';
        var golsVis = (p.goalsAway !== null && p.goalsAway !== undefined) ? String(p.goalsAway) : '';

        dados[chave] = {
            fase: fase, posicao: parseInt(pos, 10),
            timeCasa: timeCasa, timeVisitante: timeVis,
            flagCasa: flagCasa, flagVisitante: flagVis,
            golsCasa: golsCasa, golsVisitante: golsVis,
            status: p.statusRaw || 'NS',
            datahora: datahora, data: data, hora: hora, local: p.venue || ''
        };
    }

    return dados;
}

function agruparPorFase(dadosMap) {
    var grupos = {};
    for (var k in dadosMap) {
        if (!dadosMap.hasOwnProperty(k)) { continue; }
        var p = dadosMap[k]; var f = p.fase;
        if (!f) { continue; }
        if (!grupos[f]) { grupos[f] = []; }
        grupos[f].push(p);
    }
    for (var gk in grupos) {
        if (grupos.hasOwnProperty(gk)) {
            grupos[gk].sort(function(a, b) { return (a.posicao || 0) - (b.posicao || 0); });
        }
    }
    return grupos;
}

function labelStatus(status) { return STATUS_LABEL_CONFR[status] || status || ''; }
function nomeValido(nome) { return !!(nome && nome !== 'TBD' && nome !== ''); }
function ehEncerrado(status) { return status === 'FT' || status === 'AET' || status === 'PEN'; }
function ehAoVivo(status) { return status === '1H' || status === '2H' || status === 'ET' || status === 'HT' || status === 'BT' || status === 'P' || status === 'LIVE'; }

function formatarPlacar(partida) {
    var gc = partida.golsCasa; var gv = partida.golsVisitante; var st = partida.status;
    if (st === 'NS' || st === 'TBD') { return 'X'; }
    if (gc === '' && gv === '') { return 'X'; }
    return gc + ' - ' + gv;
}

/* ====================================================
   Chaveamento — quem alimenta quem
   ==================================================== */
var FASE_ANTERIOR = { 'R16': 'R32', 'QF': 'R16', 'SF': 'QF', 'FINAL': 'SF', 'BRONZE': 'SF' };

function feedersDe(fase, posicao) {
    var prev = FASE_ANTERIOR[fase];
    if (!prev) { return null; }
    if (fase === 'FINAL' || fase === 'BRONZE') { return [{ fase: 'SF', posicao: 1 }, { fase: 'SF', posicao: 2 }]; }
    return [{ fase: prev, posicao: 2 * posicao - 1 }, { fase: prev, posicao: 2 * posicao }];
}

function buscarPartida(dadosMap, fase, posicao) { return dadosMap[fase + '_' + posicao] || null; }

function expandirGrupoStr(s) {
    if (!s) { return s; }
    var m = String(s).match(/^(\d+)[oOº]\s*([A-Z]+)$/);
    if (!m) { return s; }
    var pos = m[1]; var grupos = m[2];
    if (grupos.length === 1) { return pos + 'o do Grupo ' + grupos; }
    return pos + 'o entre Grupos ' + grupos.split('').join('/');
}

function resolverNomeTime(partida, lado, dadosMap) {
    var nomeRaw = (lado === 'casa') ? partida.timeCasa : partida.timeVisitante;
    var flagRaw = (lado === 'casa') ? partida.flagCasa : partida.flagVisitante;

    if (nomeValido(nomeRaw)) {
        var expandido = expandirGrupoStr(nomeRaw);
        var ehPlaceholder = (expandido !== nomeRaw);
        return { nome: expandido, flag: flagRaw, placeholder: ehPlaceholder };
    }

    // BRONZE
    if (partida.fase === 'BRONZE') {
        var n = (lado === 'casa') ? 1 : 2;
        return { nome: 'Perdedor da ' + (n === 1 ? '1a' : '2a') + ' Semifinal', flag: '', placeholder: true };
    }
    // FINAL
    if (partida.fase === 'FINAL') {
        var nF = (lado === 'casa') ? 1 : 2;
        return { nome: 'Vencedor da ' + (nF === 1 ? '1a' : '2a') + ' Semifinal', flag: '', placeholder: true };
    }

    var fs = feedersDe(partida.fase, partida.posicao);
    if (fs) {
        var idx = (lado === 'casa') ? 0 : 1;
        var feeder = buscarPartida(dadosMap, fs[idx].fase, fs[idx].posicao);
        if (feeder) {
            var a = expandirGrupoStr(feeder.timeCasa);
            var b = expandirGrupoStr(feeder.timeVisitante);
            if (nomeValido(feeder.timeCasa) && nomeValido(feeder.timeVisitante)) {
                return { nome: 'Vencedor do jogo: ' + a + ' X ' + b, flag: '', placeholder: true };
            }
            return { nome: 'Vencedor do Jogo ' + feeder.posicao + ' (' + FASE_CURTA[feeder.fase] + ')', flag: '', placeholder: true };
        }
    }
    return { nome: 'A definir', flag: '', placeholder: true };
}

/* ====================================================
   Chaves — divisao em blocos
   ==================================================== */
function tamanhoChaveDaFase(fase) {
    if (fase === 'R32' || fase === 'R16' || fase === 'QF') { return 4; }
    if (fase === 'SF') { return 2; }
    return 1;
}

function montarOrdemChaves(grupos) {
    var ordem = [];
    for (var i = 0; i < FASES_ORDEM.length; i++) {
        var fase = FASES_ORDEM[i];
        var partidas = grupos[fase] || [];
        if (partidas.length === 0) { continue; }
        var tamanho = tamanhoChaveDaFase(fase);
        var total = Math.ceil(partidas.length / tamanho);
        for (var k = 0; k < total; k++) {
            ordem.push({
                fase: fase, idx: k + 1, total: total,
                partidas: partidas.slice(k * tamanho, (k + 1) * tamanho)
            });
        }
    }
    return ordem;
}

function rotuloChave(chave) {
    var nome = (FASE_LABEL_CONFR[chave.fase] || chave.fase).toUpperCase();
    if (chave.total <= 1) { return nome; }
    return nome + ' . PARTE ' + chave.idx + ' DE ' + chave.total;
}

function destinoChave(chave) {
    var f = chave.fase;
    if (f === 'R32') { return 'Os vencedores destes jogos avancam para as Oitavas de Final'; }
    if (f === 'R16') { return 'Os vencedores destes jogos avancam para as Quartas de Final'; }
    if (f === 'QF') { return 'Os vencedores destes jogos avancam para as Semifinais'; }
    if (f === 'SF') { return 'Os vencedores vao a Final . Os perdedores disputam o 3o lugar'; }
    if (f === 'FINAL') { return 'A partida que define o campeao'; }
    if (f === 'BRONZE') { return 'A partida que define o 3o colocado'; }
    return '';
}

function obterIndiceChaveAtual(totalChaves) {
    var idx = parseInt(localStorage.getItem(LS_KEY_CHAVE), 10);
    if (isNaN(idx) || idx < 0 || idx >= totalChaves) { idx = 0; }
    return idx;
}

function avancarIndiceChave(totalChaves) {
    var idx = obterIndiceChaveAtual(totalChaves);
    localStorage.setItem(LS_KEY_CHAVE, String((idx + 1) % totalChaves));
}

/* ====================================================
   Render — card e chave
   ==================================================== */
function preencherCardPartida(card, partida, dadosMap) {
    var dataEl   = card.querySelector('[data-campo="data"]');
    var horaEl   = card.querySelector('[data-campo="hora"]');
    var localEl  = card.querySelector('[data-campo="local"]');
    var statusEl = card.querySelector('[data-campo="status"]');
    var nomeCasa = card.querySelector('[data-campo="nomeCasa"]');
    var flagCasa = card.querySelector('[data-campo="flagCasa"]');
    var placarEl = card.querySelector('[data-campo="placar"]');
    var nomeVisit = card.querySelector('[data-campo="nomeVisit"]');
    var flagVisit = card.querySelector('[data-campo="flagVisit"]');
    var casaWrap  = card.querySelector('[data-campo="casa"]');
    var visitWrap = card.querySelector('[data-campo="visit"]');

    var resCasa  = resolverNomeTime(partida, 'casa', dadosMap);
    var resVisit = resolverNomeTime(partida, 'visit', dadosMap);

    if (dataEl) { dataEl.textContent = partida.data || ''; }
    if (horaEl) { horaEl.textContent = partida.hora || ''; }
    if (localEl) {
        localEl.textContent = partida.local || '';
        if (partida.local) { localEl.classList.remove('hidden'); }
        else { localEl.classList.add('hidden'); }
    }

    if (statusEl) {
        var aoVivo = ehAoVivo(partida.status);
        var fim = ehEncerrado(partida.status);
        statusEl.textContent = labelStatus(partida.status);
        statusEl.className = statusEl.className.replace(/\s*(card-status-live|card-status-end|card-status-pend)/g, '');
        if (aoVivo) { statusEl.className += ' card-status-live'; }
        else if (fim) { statusEl.className += ' card-status-end'; }
        else { statusEl.className += ' card-status-pend'; }
    }

    if (nomeCasa) {
        nomeCasa.textContent = resCasa.nome;
        nomeCasa.title = resCasa.nome;
        nomeCasa.classList.toggle('tname-indef', !!resCasa.placeholder);
    }
    if (nomeVisit) {
        nomeVisit.textContent = resVisit.nome;
        nomeVisit.title = resVisit.nome;
        nomeVisit.classList.toggle('tname-indef', !!resVisit.placeholder);
    }
    if (flagCasa) {
        if (resCasa.flag && !resCasa.placeholder) { flagCasa.src = resCasa.flag; flagCasa.alt = resCasa.nome; flagCasa.style.display = ''; }
        else { flagCasa.style.display = 'none'; }
    }
    if (flagVisit) {
        if (resVisit.flag && !resVisit.placeholder) { flagVisit.src = resVisit.flag; flagVisit.alt = resVisit.nome; flagVisit.style.display = ''; }
        else { flagVisit.style.display = 'none'; }
    }

    if (placarEl) {
        placarEl.textContent = formatarPlacar(partida);
        placarEl.classList.toggle('card-placar-pend', !ehEncerrado(partida.status) && !ehAoVivo(partida.status));
        placarEl.classList.toggle('card-placar-live', ehAoVivo(partida.status));
    }

    if (casaWrap) { casaWrap.classList.remove('winner', 'loser'); }
    if (visitWrap) { visitWrap.classList.remove('winner', 'loser'); }

    if (ehEncerrado(partida.status)) {
        var gc = parseInt(partida.golsCasa, 10);
        var gv = parseInt(partida.golsVisitante, 10);
        if (!isNaN(gc) && !isNaN(gv)) {
            if (gc > gv) { if (casaWrap) { casaWrap.classList.add('winner'); } if (visitWrap) { visitWrap.classList.add('loser'); } }
            else if (gv > gc) { if (visitWrap) { visitWrap.classList.add('winner'); } if (casaWrap) { casaWrap.classList.add('loser'); } }
        }
    }
}

function montarCardPartida(partida, indexNaTela, dadosMap) {
    var tmpl = document.getElementById('tmplCard');
    if (!tmpl) { return null; }
    var frag = tmpl.content.cloneNode(true);
    var card = frag.firstElementChild;
    card.style.animationDelay = (indexNaTela * 0.06) + 's';
    preencherCardPartida(card, partida, dadosMap);
    return card;
}

function aplicarSponsorConfrontos(config) {
    var sponsor = config && config.sponsor;
    var footerEl = document.querySelector('#sponsorFooterConfrontos');
    if (!footerEl) { return; }
    if (!sponsor || (!sponsor.frase && !sponsor.logo)) {
        footerEl.classList.add('hidden');
        footerEl.classList.remove('flex');
        return;
    }
    footerEl.classList.remove('hidden');
    footerEl.classList.add('flex');
    var fraseEl = footerEl.querySelector('#sponsorFrase');
    var logoEl  = footerEl.querySelector('#sponsorLogo');
    if (fraseEl) { fraseEl.textContent = sponsor.frase || ''; }
    if (logoEl && sponsor.logo) { logoEl.src = sponsor.logo; logoEl.classList.remove('hidden'); }
    else if (logoEl) { logoEl.classList.add('hidden'); }
}

function renderizarChave(chave, dadosMap, config, loader) {
    aplicarSponsorConfrontos(config);

    var faseEl    = document.getElementById('headerFase');
    var contEl    = document.getElementById('headerContagem');
    var destinoEl = document.getElementById('chaveDestino');
    var cardsEl   = document.getElementById('chaveCards');
    var main      = document.getElementById('confrontosView');

    if (faseEl) { faseEl.textContent = FASE_LABEL_CONFR[chave.fase] || chave.fase; }
    if (contEl) { contEl.textContent = (chave.total > 1) ? ('Parte ' + chave.idx + ' de ' + chave.total) : ''; }
    if (destinoEl) {
        var dst = destinoChave(chave);
        destinoEl.textContent = dst || '';
        if (dst) { destinoEl.classList.remove('hidden'); }
        else { destinoEl.classList.add('hidden'); }
    }

    if (cardsEl) {
        cardsEl.innerHTML = '';
        cardsEl.className = cardsEl.className.replace(/\s*chave-cards-\d+/g, '').replace(/\s*chave-fase-[A-Z0-9]+/g, '');
        cardsEl.classList.add('chave-cards-' + chave.partidas.length);
        cardsEl.classList.add('chave-fase-' + chave.fase);

        for (var i = 0; i < chave.partidas.length; i++) {
            var card = montarCardPartida(chave.partidas[i], i, dadosMap);
            if (card) { cardsEl.appendChild(card); }
        }
    }

    if (main) { main.style.opacity = '1'; }

    setTimeout(function() { _playerViewExecutando = false; loader.finished(); }, DURACAO_TOTAL);
}

function iniciarExibicao(dadosMap, config, loader) {
    var grupos = agruparPorFase(dadosMap);
    var ordem  = montarOrdemChaves(grupos);

    if (ordem.length === 0) {
        console.log('[confrontos] sem chaves para exibir');
        _playerViewExecutando = false;
        loader.finished();
        return;
    }

    loader.loaded();

    var idx   = obterIndiceChaveAtual(ordem.length);
    var chave = ordem[idx];
    avancarIndiceChave(ordem.length);

    var sponsor = config && config.sponsor;
    var introUrl = sponsor && (sponsor.intro || sponsor.FILE_IMAGE1);
    var introMaxMs = (sponsor && sponsor.introMaxMs) ? sponsor.introMaxMs : 0;

    if (introUrl) {
        var introMax = introMaxMs || DURACAO_IMAGEM_PADRAO_MS;
        mostrarIntro(introUrl, introMax, function() {
            esconderIntro(function() {
                renderizarChave(chave, dadosMap, config, loader);
            });
        });
    } else {
        renderizarChave(chave, dadosMap, config, loader);
    }
}

function obterDuracaoIntroMs(spd) {
    var text2 = obterValorSpd(spd, 'TEXT2');
    var seg = parseInt(text2, 10);
    if (seg > 0) { return seg * 1000; }
    return 0;
}

function montarSponsorConfig(spdSponsor) {
    if (!spdSponsor) { return null; }
    return {
        frase: obterValorSpd(spdSponsor, 'TEXT1'),
        logo:  obterValorSpd(spdSponsor, 'IMAGE_LOGO'),
        intro: obterValorSpd(spdSponsor, 'FILE_IMAGE1'),
        FILE_IMAGE1: obterValorSpd(spdSponsor, 'FILE_IMAGE1'),
        introMaxMs: obterDuracaoIntroMs(spdSponsor)
    };
}

/* ====================================================
   INICIAR CONFRONTOS — ponto de entrada chamado pelo master.js
   ==================================================== */
function iniciarConfrontos(loader) {
    var listaFootball = loader.datalist('D_FOOTBALL');
    var listaTeams    = loader.datalist('D_FOOTBALL_TEAMS');

    if (!listaFootball || listaFootball.count() === 0) {
        console.log('[confrontos] D_FOOTBALL sem dados');
        mostrarView('confrontos');
        exibirMensagemAguardando('confrontos');
        loader.loaded();
        setTimeout(function() { loader.finished(); _playerViewExecutando = false; }, DURACAO_TOTAL);
        return;
    }

    // Filtra eliminatórias
    var eliminatorias = [];
    for (var i = 0; i < listaFootball.count(); i++) {
        var p = parseItemFootball(listaFootball.get(i));
        if (p && isFaseEliminatoria(p.round)) { eliminatorias.push(p); }
    }

    if (eliminatorias.length === 0) {
        console.log('[confrontos] Sem jogos eliminatórios');
        mostrarView('confrontos');
        exibirMensagemAguardando('confrontos');
        loader.loaded();
        setTimeout(function() { loader.finished(); _playerViewExecutando = false; }, DURACAO_TOTAL);
        return;
    }

    // Atribui posições
    var comSlot = atribuirPosicoesBracket(eliminatorias);

    // Cria teamsMap
    var teamsMap = {};
    if (listaTeams) {
        for (var j = 0; j < listaTeams.count(); j++) {
            var t = listaTeams.get(j);
            var teamId = obterValor(t, 'TITULO');
            var nome   = obterValor(t, 'TEXTO2');
            var codigo = obterValor(t, 'TEXTO3');
            var fotoPng = obterValor(t, 'FOTO');
            if (teamId && nome) {
                var bandeiras = obterBandeiraSVG(codigo, fotoPng);
                teamsMap[teamId] = { nome: nome, codigo: codigo, bandeira: bandeiras.bandeira || bandeiras.bandeiraFallback, fotoApi: fotoPng };
            }
        }
    }

    // Enriquece com standings
    var dados = processarDadosApi(comSlot, teamsMap);
    enriquecerComStandings(dados);

    // Sponsor
    var spdSponsor = buscarSponsor(loader.datalist('D_SPD'));
    var config = { sponsor: montarSponsorConfig(spdSponsor) };
    if (spdSponsor) { aplicarCores(mergeColorsFromSpd(CONFIG, spdSponsor)); }

    mostrarView('confrontos');
    iniciarExibicao(dados, config, loader);
}