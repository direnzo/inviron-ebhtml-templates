/**
 * bracket.js — Modo BRACKET (chaveamento completo)
 * ES5 obrigatorio
 *
 * Exibe o chaveamento completo com todas as fases,
 * linhas SVG conectoras, animacoes de entrada e zoom,
 * destaque do Brasil, campeao, e fases ocultaveis.
 *
 * Extraido do caminhos_futebol/master.js
 * Adaptado para o loader unificado (master.js)
 */

/* ====================================================
   VARIAVEIS DE TEMPO (ajuste centralizado)
   ==================================================== */
var TEMPO_PCT_ENTRADA = 0.15;
var TEMPO_PCT_ZOOM    = 0.30;
var TEMPO_PCT_FOCO    = 0.55;

var DURACAO_SEM_INTRO_MS     = 10000;
var DURACAO_CONTEUDO_MS      = 5000;
var DURACAO_IMAGEM_PADRAO_MS = 5000;

/* ====================================================
   SLOT_MAP — "FASE_POSICAO" → ID do elemento DOM
   ==================================================== */
var SLOT_MAP = {
    'R32_1': 'm-r32-l1', 'R32_2': 'm-r32-l2', 'R32_3': 'm-r32-l3', 'R32_4': 'm-r32-l4',
    'R32_5': 'm-r32-l5', 'R32_6': 'm-r32-l6', 'R32_7': 'm-r32-l7', 'R32_8': 'm-r32-l8',
    'R32_9': 'm-r32-r1', 'R32_10': 'm-r32-r2', 'R32_11': 'm-r32-r3', 'R32_12': 'm-r32-r4',
    'R32_13': 'm-r32-r5', 'R32_14': 'm-r32-r6', 'R32_15': 'm-r32-r7', 'R32_16': 'm-r32-r8',
    'R16_1': 'm-r16-l1', 'R16_2': 'm-r16-l2', 'R16_3': 'm-r16-l3', 'R16_4': 'm-r16-l4',
    'R16_5': 'm-r16-r1', 'R16_6': 'm-r16-r2', 'R16_7': 'm-r16-r3', 'R16_8': 'm-r16-r4',
    'QF_1': 'm-qf-l1', 'QF_2': 'm-qf-l2', 'QF_3': 'm-qf-r1', 'QF_4': 'm-qf-r2',
    'SF_1': 'm-sf-l', 'SF_2': 'm-sf-r',
    'FINAL_1': 'm-final', 'BRONZE_1': 'm-bronze'
};

var FASE_PRIORIDADE = { 'FINAL': 6, 'BRONZE': 5, 'SF': 4, 'QF': 3, 'R16': 2, 'R32': 1 };

var FASES_COLS = [
    { fase: 'R32', total: 16, colIds: ['col-r32-l', 'col-r32-r'] },
    { fase: 'R16', total: 8,  colIds: ['col-r16-l', 'col-r16-r'] }
];

/* ====================================================
   EXTRAIR VENCEDOR — mesma logica do confrontos.js
   ==================================================== */
function extrairVencedor(partida) {
    if (!partida) { return null; }
    if (partida.status !== 'FT' && partida.status !== 'AET' && partida.status !== 'PEN') { return null; }
    var gc = parseInt(partida.golsCasa, 10);
    var gv = parseInt(partida.golsVisitante, 10);
    if (isNaN(gc) || isNaN(gv) || gc === gv) { return null; }
    if (gc > gv) { return { nome: partida.timeCasa, flag: partida.flagCasa }; }
    return { nome: partida.timeVisitante, flag: partida.flagVisitante };
}

/* ====================================================
   FIXTURE_SLOT_MAP + TEAMS_SLOT_MAP (compartilhado)
   ==================================================== */
var FIXTURE_SLOT_MAP_BRACKET = {
    '1561329': { CATEGORY: 'R32', SUBTITULO: '3' },
    '1562344': { CATEGORY: 'R32', SUBTITULO: '9' },
    '1562345': { CATEGORY: 'R32', SUBTITULO: '4' },
    '1562586': { CATEGORY: 'R32', SUBTITULO: '7' }
};

var TEAMS_SLOT_MAP_BRACKET = {
    '1531|5529': { CATEGORY: 'R32', SUBTITULO: '3' },
    '25': { CATEGORY: 'R32', SUBTITULO: '1' },
    '1118|31': { CATEGORY: 'R32', SUBTITULO: '4' },
    '6|12': { CATEGORY: 'R32', SUBTITULO: '9' },
    '1501': { CATEGORY: 'R32', SUBTITULO: '10' },
    '16': { CATEGORY: 'R32', SUBTITULO: '11' },
    '10': { CATEGORY: 'R32', SUBTITULO: '12' },
    '2384|1113': { CATEGORY: 'R32', SUBTITULO: '7' },
    '1': { CATEGORY: 'R32', SUBTITULO: '8' },
    '9|26': { CATEGORY: 'R32', SUBTITULO: '6' },
    '9': { CATEGORY: 'R32', SUBTITULO: '6' },
    '5529': { CATEGORY: 'R32', SUBTITULO: '15' },
    '26': { CATEGORY: 'R32', SUBTITULO: '13' },
    '27': { CATEGORY: 'R32', SUBTITULO: '16' },
    '777': { CATEGORY: 'R32', SUBTITULO: '14' }
};

/* ====================================================
   PROPAGAR VENCEDORES BRACKET — preenche slots vazios
   com vencedores das partidas anteriores
   ==================================================== */

var FASE_PROXIMA = { 'R32': 'R16', 'R16': 'QF', 'QF': 'SF', 'SF': 'FINAL' };

/**
 * Mapa: quantos slots de cada fase alimentam 1 slot da fase seguinte
 * R32 tem 16 slots → cada par (1-2, 3-4...) alimenta 1 slot de R16 (8 total)
 * R16 tem 8 slots  → cada par alimenta 1 slot de QF (4 total)
 * QF tem 4 slots   → QF 1-2 → SF (esquerda), QF 3-4 → SF (direita)
 */
function slotDestinoNoBracket(fase, posicao) {
    if (fase === 'R32') {
        // R32 1-2 → R16 1, 3-4 → R16 2 ... 15-16 → R16 8
        var slotR16 = Math.ceil(posicao / 2);
        // Lado: posicao impar → casa, par → visitante
        var lado = (posicao % 2 === 1) ? 'casa' : 'visitante';
        return { fase: 'R16', posicao: slotR16, lado: lado };
    }
    if (fase === 'R16') {
        var slotQF = Math.ceil(posicao / 2);
        var ladoR16 = (posicao % 2 === 1) ? 'casa' : 'visitante';
        return { fase: 'QF', posicao: slotQF, lado: ladoR16 };
    }
    if (fase === 'QF') {
        // QF 1-2 → SF esquerda (posicao 1), QF 3-4 → SF direita (posicao 2)
        var slotSF = (posicao <= 2) ? 1 : 2;
        var ladoQF = (posicao === 1 || posicao === 3) ? 'casa' : 'visitante';
        return { fase: 'SF', posicao: slotSF, lado: ladoQF };
    }
    if (fase === 'SF') {
        // SF 1 → Final (casa), SF 2 → Final (visitante)
        return { fase: 'FINAL', posicao: 1, lado: (posicao === 1) ? 'casa' : 'visitante' };
    }
    return null;
}

function propagarVencedoresBracket(dados) {
    var fases = ['R32', 'R16', 'QF', 'SF'];
    for (var f = 0; f < fases.length; f++) {
        var fase = fases[f];
        var prox = FASE_PROXIMA[fase];
        if (!prox) { continue; }

        for (var i = 1; i <= 32; i++) {
            var chave = fase + '_' + i;
            var partida = dados[chave];
            if (!partida) { continue; }

            var vencedor = extrairVencedor(partida);
            if (!vencedor) { continue; }

            var destino = slotDestinoNoBracket(fase, i);
            if (!destino) { continue; }

            var chaveDest = destino.fase + '_' + destino.posicao;
            var partidaDest = dados[chaveDest];

            if (partidaDest) {
                // So preenche se o slot estiver vazio / TBD
                var campoTime = (destino.lado === 'casa') ? 'timeCasa' : 'timeVisitante';
                var campoFlag = (destino.lado === 'casa') ? 'flagCasa' : 'flagVisitante';
                var nomeAtual = partidaDest[campoTime];
                if (!nomeAtual || nomeAtual === '' || nomeAtual === 'TBD' || nomeAtual === 'A definir') {
                    partidaDest[campoTime] = vencedor.nome;
                    partidaDest[campoFlag] = vencedor.flag || partidaDest[campoFlag];
                }
            }
        }
    }
}
function animarZoomOutBracketArea(restanteMs) {
    var area = document.querySelector('.bracket-area');
    if (!area) { return; }

    var ORIGINS = ['top left', 'bottom left', 'top right', 'bottom right'];
    var lsKey = 'bracket_zoom_origin_idx';
    var idx = parseInt(localStorage.getItem(lsKey), 10);
    if (isNaN(idx) || idx < 0 || idx >= ORIGINS.length) { idx = 0; }
    var origin = ORIGINS[idx];
    localStorage.setItem(lsKey, (idx + 1) % ORIGINS.length);

    var zoomDur = Math.max(restanteMs, 200);
    area.style.transition = 'none';
    area.style.transformOrigin = origin;
    area.style.transform = 'scale(1)';
    void area.offsetWidth;
    setTimeout(function() {
        area.style.transition = 'transform ' + (zoomDur/1000) + 's cubic-bezier(0.77,0,0.175,1)';
        area.style.transformOrigin = origin;
        area.style.transform = 'scale(2)';
    }, 0);
}

/* ====================================================
   SVG INJECTION VIA XHR
   ==================================================== */
function carregarSvgInline(containerEl, src, onSuccess, onError) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', src, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) { return; }
        if (xhr.status === 200 || xhr.status === 0) {
            try {
                var svgEl = containerEl.querySelector('svg');
                if (svgEl) { svgEl.parentNode.removeChild(svgEl); }
                containerEl.innerHTML = xhr.responseText;
                var svg = containerEl.querySelector('svg');
                if (svg) {
                    svg.style.width = '100%'; svg.style.height = '100%';
                    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                    if (onSuccess) { onSuccess(); }
                } else { if (onError) { onError(); } }
            } catch (e) { if (onError) { onError(); } }
        } else { if (onError) { onError(); } }
    };
    xhr.onerror = function() { if (onError) { onError(); } };
    xhr.send();
}

/* ====================================================
   processarDadosApi — converte array da API
   ==================================================== */
function processarDadosApiBracket(partidas, teamsMap) {
    teamsMap = teamsMap || {};
    var dados = {};

    for (var i = 0; i < partidas.length; i++) {
        var p = partidas[i];
        var fase = p.CATEGORY || '';
        var pos = p.SUBTITULO || '';
        if (!fase || !pos) { continue; }
        var chave = fase + '_' + pos;

        var timeCasa = ''; var timeVis = '';
        var flagCasa = p.homeLogo || ''; var flagVis = p.awayLogo || '';

        if (teamsMap[p.homeId]) { timeCasa = teamsMap[p.homeId].nome; flagCasa = teamsMap[p.homeId].bandeira || teamsMap[p.homeId].fotoApi || flagCasa; }
        else { timeCasa = p.homeName || ''; }
        if (teamsMap[p.awayId]) { timeVis = teamsMap[p.awayId].nome; flagVis = teamsMap[p.awayId].bandeira || teamsMap[p.awayId].fotoApi || flagVis; }
        else { timeVis = p.awayName || ''; }

        var datahora = '';
        if (p.dateStr) {
            var partes = p.dateStr.split(' ');
            var dp = (partes[0] || '').split('-');
            var hp = (partes[1] || '').split(':');
            var dia = dp[2] || ''; var mes = dp[1] || '';
            var hora = (hp[0] || '') + ':' + (hp[1] || '00');
            datahora = dia + '/' + mes + ' . ' + hora;
        }

        var golsCasa = (p.goalsHome !== null && p.goalsHome !== undefined) ? String(p.goalsHome) : '';
        var golsVis  = (p.goalsAway !== null && p.goalsAway !== undefined) ? String(p.goalsAway) : '';

        dados[chave] = {
            fase: fase, posicao: parseInt(pos, 10),
            timeCasa: timeCasa, timeVisitante: timeVis,
            flagCasa: flagCasa, flagVisitante: flagVis,
            golsCasa: golsCasa, golsVisitante: golsVis,
            status: p.statusRaw || 'NS', datahora: datahora,
            penCasa: (p.penHome !== null && p.penHome !== undefined) ? String(p.penHome) : '',
            penVisitante: (p.penAway !== null && p.penAway !== undefined) ? String(p.penAway) : '',
            elapsed: p.elapsed !== null ? String(p.elapsed || '') : '',
            extra: p.extra !== null ? String(p.extra || '') : ''
        };
    }

    return dados;
}

/* ====================================================
   RENDER — preenche cada card do bracket
   ==================================================== */
function preencherLinha(linha, nome, flagUrl, gols) {
    var imgFlag   = linha.querySelector('.flag');
    var spanNome  = linha.querySelector('.tname');
    var spanScore = linha.querySelector('.score');

    var nomeValido = nome && nome.length > 0;

    if (imgFlag) {
        if (flagUrl && nomeValido) { imgFlag.src = flagUrl; imgFlag.alt = nome; imgFlag.style.display = ''; }
        else { imgFlag.style.display = 'none'; }
    }
    if (spanNome) {
        if (nomeValido) {
            spanNome.textContent = nome;
            spanNome.className = spanNome.className.replace(/\s*tname-indef/g, '');
        } else {
            spanNome.textContent = 'a definir';
            if (spanNome.className.indexOf('tname-indef') === -1) { spanNome.className = spanNome.className + ' tname-indef'; }
        }
    }
    if (spanScore) { spanScore.textContent = (gols !== '' && gols !== undefined && gols !== null) ? gols : ''; }
}

function renderizarCard(slotId, partida) {
    var card = document.getElementById(slotId);
    if (!card) { return; }

    var slot = card.parentNode;
    if (slot) {
        var dateEl = slot.querySelector('.match-date');
        if (dateEl) { dateEl.textContent = (partida && partida.datahora) ? partida.datahora : ''; }
    }

    var linhas = card.querySelectorAll('.team-row');
    if (!linhas || linhas.length < 2) { return; }

    var linhaCasa = linhas[0];
    var linhaVisitante = linhas[1];

    if (!partida || !partida.timeCasa) {
        preencherLinha(linhaCasa, '', '', '');
        preencherLinha(linhaVisitante, '', '', '');
        return;
    }

    preencherLinha(linhaCasa, partida.timeCasa, partida.flagCasa, partida.golsCasa);
    preencherLinha(linhaVisitante, partida.timeVisitante, partida.flagVisitante, partida.golsVisitante);

    if (partida.status === 'FT' || partida.status === 'AET' || partida.status === 'PEN') {
        aplicarResultado(card, partida);
    }
}

function aplicarResultado(card, partida) {
    var gcasa = parseInt(partida.golsCasa, 10);
    var gvis  = parseInt(partida.golsVisitante, 10);
    var linhas = card.querySelectorAll('.team-row');
    var linhaCasa = linhas[0];
    var linhaVisitante = linhas[1];
    if (isNaN(gcasa) || isNaN(gvis)) { return; }
    if (gcasa > gvis) { linhaCasa.className = linhaCasa.className + ' winner'; linhaVisitante.className = linhaVisitante.className + ' loser'; }
    else if (gvis > gcasa) { linhaVisitante.className = linhaVisitante.className + ' winner'; linhaCasa.className = linhaCasa.className + ' loser'; }
}

function renderizarBracket(dados) {
    for (var chave in SLOT_MAP) {
        if (!SLOT_MAP.hasOwnProperty(chave)) { continue; }
        var slotId = SLOT_MAP[chave];
        var partida = dados[chave] || null;
        renderizarCard(slotId, partida);
    }
}

/* ====================================================
   DESTAQUE BRASIL
   ==================================================== */
function marcarBrasil() {
    var cards = document.querySelectorAll('.match-card');
    for (var i = 0; i < cards.length; i++) {
        var linhas = cards[i].querySelectorAll('.team-row');
        for (var j = 0; j < linhas.length; j++) {
            var span = linhas[j].querySelector('.tname');
            if (span && span.textContent.toLowerCase().indexOf('brasil') !== -1) {
                if (cards[i].className.indexOf('match-brasil') === -1) { cards[i].className = cards[i].className + ' match-brasil'; }
                if (linhas[j].className.indexOf('brasil-row') === -1) { linhas[j].className = linhas[j].className + ' brasil-row'; }
            }
        }
    }
}

/* ====================================================
   DESTAQUE CAMPEAO
   ==================================================== */
function marcarCampeao(dados) {
    var final = dados['FINAL_1'];
    if (!final || !final.golsCasa || !final.golsVisitante) { return; }
    var gcasa = parseInt(final.golsCasa, 10);
    var gvis  = parseInt(final.golsVisitante, 10);
    if (isNaN(gcasa) || isNaN(gvis) || gcasa === gvis) { return; }

    var card = document.getElementById('m-final');
    if (!card) { return; }
    var linhas = card.querySelectorAll('.team-row');
    var linhaVencedor = (gcasa > gvis) ? linhas[0] : linhas[1];
    if (card.className.indexOf('match-campeao') === -1) { card.className = card.className + ' match-campeao'; }
    if (linhaVencedor && linhaVencedor.className.indexOf('campeao-row') === -1) { linhaVencedor.className = linhaVencedor.className + ' campeao-row'; }
}

/* ====================================================
   OCULTAR FASES ANTERIORES
   ==================================================== */
function isFaseCompleta(dados, fase, total) {
    for (var i = 1; i <= total; i++) {
        var p = dados[fase + '_' + i];
        if (!p) { return false; }
        var s = p.status || '';
        if (s !== 'FT' && s !== 'AET' && s !== 'PEN') { return false; }
    }
    return true;
}

function ocultarFasesAnteriores(dados) {
    var latestCompleto = -1;
    for (var i = 0; i < FASES_COLS.length; i++) {
        var f = FASES_COLS[i];
        if (isFaseCompleta(dados, f.fase, f.total)) { latestCompleto = i; }
        else { break; }
    }
    for (var k = 0; k <= latestCompleto; k++) {
        var ids = FASES_COLS[k].colIds;
        for (var m = 0; m < ids.length; m++) {
            var col = document.getElementById(ids[m]);
            if (col) { col.style.display = 'none'; }
        }
    }
    if (latestCompleto > 0 && typeof BracketDraw !== 'undefined') { BracketDraw.init(); }
}

/* ====================================================
   ATUALIZAR FASE ATUAL
   ==================================================== */
function atualizarFaseAtual(dados) {
    var melhorPrioridade = 0;
    var melhorFase = '';
    for (var chave in dados) {
        if (!dados.hasOwnProperty(chave)) { continue; }
        var p = dados[chave];
        var status = p.status;
        if (status === 'NS' || status === 'TBD') { continue; }
        var prio = FASE_PRIORIDADE[p.fase] || 0;
        if (prio > melhorPrioridade) { melhorPrioridade = prio; melhorFase = p.fase; }
    }
    var labels = { 'R32': 'Segunda Fase', 'R16': 'Oitavas de Final', 'QF': 'Quartas de Final', 'SF': 'Semifinal', 'FINAL': 'Grande Final', 'BRONZE': 'Disputa de 3o Lugar' };
    var el = document.getElementById('header-fase');
    if (el && melhorFase) { el.textContent = labels[melhorFase] || melhorFase; }
}

/* ====================================================
   PATROCINADOR
   ==================================================== */
function aplicarSponsorBracket(config) {
    var sponsor = config && config.sponsor;
    if (!sponsor) { return; }
    var footerEl = document.querySelector('#sponsorFooterBracket');
    var fraseEl  = footerEl ? footerEl.querySelector('#sponsorFrase') : null;
    var logoEl   = footerEl ? footerEl.querySelector('#sponsorLogo') : null;
    if (fraseEl && sponsor.frase) { fraseEl.textContent = sponsor.frase; }
    if (logoEl && sponsor.logo) { logoEl.src = sponsor.logo; }
    if (footerEl && (sponsor.frase || sponsor.logo)) { footerEl.classList.remove('hidden'); footerEl.classList.add('flex'); }
}

/* ====================================================
   ANIMACAO: ENTRADA COM STAGGER
   ==================================================== */
var STAGGER_ORDER = [
    'm-r32-l1', 'm-r32-r1', 'm-r32-l2', 'm-r32-r2',
    'm-r32-l3', 'm-r32-r3', 'm-r32-l4', 'm-r32-r4',
    'm-r32-l5', 'm-r32-r5', 'm-r32-l6', 'm-r32-r6',
    'm-r32-l7', 'm-r32-r7', 'm-r32-l8', 'm-r32-r8',
    'm-r16-l1', 'm-r16-r1', 'm-r16-l2', 'm-r16-r2',
    'm-r16-l3', 'm-r16-r3', 'm-r16-l4', 'm-r16-r4',
    'm-qf-l1',  'm-qf-r1',  'm-qf-l2',  'm-qf-r2',
    'm-sf-l',   'm-sf-r',
    'm-bronze', 'm-final'
];

function animarEntradaBracket(tempoEntrada) {
    tempoEntrada = tempoEntrada || 500;
    var stagger = Math.max(Math.floor(tempoEntrada / STAGGER_ORDER.length), 10);
    animarLabels();
    for (var i = 0; i < STAGGER_ORDER.length; i++) { animarCardComDelay(STAGGER_ORDER[i], i * stagger); }
}

function animarLabels() {
    var labels = document.querySelectorAll('.round-label');
    for (var i = 0; i < labels.length; i++) {
        labels[i].style.opacity = '0';
        labels[i].style.transition = 'opacity 0.4s ease';
    }
    var especiais = document.querySelectorAll('.round-label--gold, .round-label--bronze');
    for (var k = 0; k < especiais.length; k++) {
        especiais[k].style.transform = 'scale(0.6)';
        especiais[k].style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
    }
    for (var j = 0; j < labels.length; j++) { animarCardComDelay(labels[j], j * 80); }
}

function animarCardComDelay(el, delay) {
    if (typeof el === 'string') { el = document.getElementById(el); }
    if (!el) { return; }
    el.style.opacity = '0';
    el.style.transform = 'translateY(-8px)';
    el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    setTimeout(function() {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    }, delay);
}

/* ====================================================
   DESTAQUE: PARTIDA MAIS RECENTE
   ==================================================== */
function destacarPartidaRecente(dados) {
    var melhorPrioridade = -1;
    var melhorChave = '';
    var statusAtivos = { '1H': 1, 'HT': 1, '2H': 1, 'ET': 1, 'BT': 1, 'P': 1, 'FT': 1, 'AET': 1, 'PEN': 1 };
    for (var chave in dados) {
        if (!dados.hasOwnProperty(chave)) { continue; }
        var p = dados[chave];
        if (!statusAtivos[p.status]) { continue; }
        var prio = FASE_PRIORIDADE[p.fase] || 0;
        if (prio > melhorPrioridade) { melhorPrioridade = prio; melhorChave = chave; }
    }
    if (!melhorChave) { return; }
    var slotId = SLOT_MAP[melhorChave];
    if (!slotId) { return; }
    var card = document.getElementById(slotId);
    if (!card) { return; }
    if (card.className.indexOf('match-destaque') === -1) { card.className = card.className + ' match-destaque'; }
}

/* ====================================================
   ANIMAR CAMINHO DO VENCEDOR
   ==================================================== */
function animarCaminhoVencedor(dados) {
    var finalData = dados['FINAL_1'];
    if (!finalData || !finalData.golsCasa || !finalData.golsVisitante) { return; }
    var gcasa = parseInt(finalData.golsCasa, 10);
    var gvis  = parseInt(finalData.golsVisitante, 10);
    if (isNaN(gcasa) || isNaN(gvis) || gcasa === gvis) { return; }

    // Caminho aproximado: Final → SF (lado vencedor) → QF → R16 → R32
    var ladoVencedor = (gcasa > gvis) ? 'l' : 'r';
    var pathMap = {
        'l': ['m-sf-l', 'm-qf-l1', 'm-qf-l2', 'm-r16-l1', 'm-r16-l2', 'm-r16-l3', 'm-r16-l4', 'm-r32-l1', 'm-r32-l2', 'm-r32-l3', 'm-r32-l4', 'm-r32-l5', 'm-r32-l6', 'm-r32-l7', 'm-r32-l8'],
        'r': ['m-sf-r', 'm-qf-r1', 'm-qf-r2', 'm-r16-r1', 'm-r16-r2', 'm-r16-r3', 'm-r16-r4', 'm-r32-r1', 'm-r32-r2', 'm-r32-r3', 'm-r32-r4', 'm-r32-r5', 'm-r32-r6', 'm-r32-r7', 'm-r32-r8']
    };

    var ids = pathMap[ladoVencedor];
    for (var k = 0; k < ids.length; k++) {
        (function(id) {
            setTimeout(function() {
                var card = document.getElementById(id);
                if (card && card.className.indexOf('match-caminho') === -1) { card.className = card.className + ' match-caminho'; }
            }, k * 300);
        })(ids[k]);
    }
}

/* ====================================================
   INICIAR BRACKET — ponto de entrada chamado pelo master.js
   ==================================================== */
function iniciarBracket(loader) {
    var listaFootball = loader.datalist('D_FOOTBALL');
    var listaTeams    = loader.datalist('D_FOOTBALL_TEAMS');

    if (!listaFootball || listaFootball.count() === 0) {
        console.log('[bracket] D_FOOTBALL sem dados');
        mostrarView('bracket');
        exibirMensagemAguardando('bracket');
        loader.loaded();
        setTimeout(function() { loader.finished(); _playerViewExecutando = false; }, DURACAO_TOTAL);
        return;
    }

    // Filtra eliminatórias
    var todasPartidas = [];
    for (var i = 0; i < listaFootball.count(); i++) {
        var item = listaFootball.get(i);
        var partida = parseItemFootball(item);
        if (partida) { todasPartidas.push(partida); }
    }

    var eliminatorias = [];
    for (var j = 0; j < todasPartidas.length; j++) {
        if (isFaseEliminatoria(todasPartidas[j].round)) { eliminatorias.push(todasPartidas[j]); }
    }

    if (eliminatorias.length === 0) {
        console.log('[bracket] Sem jogos eliminatórios');
        mostrarView('bracket');
        exibirMensagemAguardando('bracket');
        loader.loaded();
        setTimeout(function() { loader.finished(); _playerViewExecutando = false; }, DURACAO_TOTAL);
        return;
    }

    // Atribui posições
    var comSlot = atribuirPosicoesBracket(eliminatorias);

    // Cria teamsMap
    var teamsMap = {};
    if (listaTeams) {
        for (var k = 0; k < listaTeams.count(); k++) {
            var t = listaTeams.get(k);
            var teamId = obterValor(t, 'TITULO');
            var nome   = obterValor(t, 'TEXTO2');
            var codigo = obterValor(t, 'TEXTO3');
            var foto   = obterValor(t, 'FOTO');
            if (teamId && nome) {
                var svgCode = mapearCodigoParaSVG(codigo);
                teamsMap[teamId] = { nome: nome, codigo: codigo, bandeira: foto || (svgCode ? ('img/flags/' + svgCode + '.svg') : ''), fotoApi: foto };
            }
        }
    }

    // Sponsor
    var spdSponsor = buscarSponsor(loader.datalist('D_SPD'));
    var runConfig = { sponsor: montarSponsorConfig(spdSponsor) };
    if (spdSponsor) { aplicarCores(mergeColorsFromSpd(CONFIG, spdSponsor)); }

    var dados = processarDadosApiBracket(comSlot, teamsMap);
    enriquecerComStandings(dados);
    propagarVencedoresBracket(dados);

    mostrarView('bracket');
    iniciarTemplateBracket(dados, runConfig, loader);
}

/* ====================================================
   INICIAR TEMPLATE BRACKET — intro + render + animacoes
   ==================================================== */
function iniciarTemplateBracket(dados, config, loader) {
    var chaves = Object.keys(dados);
    if (chaves.length === 0) {
        console.log('[bracket] sem dados para exibir');
        loader.finished();
        return;
    }

    loader.loaded();

    var sponsor = config && config.sponsor;
    var introUrl = sponsor && (sponsor.intro ? sponsor.intro : (sponsor.FILE_IMAGE1 ? sponsor.FILE_IMAGE1 : null));
    var introMaxMs = (sponsor && sponsor.introMaxMs) ? sponsor.introMaxMs : 0;

    if (introUrl) {
        var introStart = Date.now();
        mostrarIntro(introUrl, introMaxMs, function() {
            esconderIntro(function() {
                var introMs = Date.now() - introStart;
                iniciarBracketSemIntro(dados, config, loader, introMs);
            });
        });
    } else {
        iniciarBracketSemIntro(dados, config, loader, 0);
    }
}

function iniciarBracketSemIntro(dados, config, loader, introMs) {
    renderizarBracket(dados);
    marcarBrasil();
    marcarCampeao(dados);
    ocultarFasesAnteriores(dados);
    atualizarFaseAtual(dados);
    aplicarSponsorBracket(config);

    var restante = (introMs > 0) ? DURACAO_CONTEUDO_MS : DURACAO_SEM_INTRO_MS;
    var tempoEntrada = Math.round(restante * TEMPO_PCT_ENTRADA);
    var tempoZoom    = Math.round(restante * TEMPO_PCT_ZOOM);
    var tempoFoco    = Math.max(restante - tempoEntrada - tempoZoom, 0);

    // Detecta se a fase mais avançada é R32 ou R16 para zoom
    var faseMaisAlta = null;
    for (var k in dados) {
        if (dados.hasOwnProperty(k)) {
            var f = k.split('_')[0];
            var partida = dados[k];
            if (partida && partida.timeCasa && partida.timeCasa !== '' && partida.timeCasa !== 'TBD') {
                if (!faseMaisAlta || (FASE_PRIORIDADE[f] && FASE_PRIORIDADE[f] > (FASE_PRIORIDADE[faseMaisAlta] || 0))) { faseMaisAlta = f; }
            }
        }
    }

    animarEntradaBracket(tempoEntrada);
    destacarPartidaRecente(dados);
    animarCaminhoVencedor(dados);

    setTimeout(function() {
        if (typeof BracketDraw !== 'undefined') {
            BracketDraw.init();
            BracketDraw.animarLinhas(0);
        }
    }, Math.round(tempoEntrada * 0.4));

    if (faseMaisAlta === 'R32' || faseMaisAlta === 'R16') {
        setTimeout(function() { animarZoomOutBracketArea(tempoZoom); }, tempoEntrada);
    }

    var wrapper = document.getElementById('main-wrapper');
    if (wrapper) { wrapper.style.opacity = '1'; }

    setTimeout(function() {
        _playerViewExecutando = false;
        loader.finished();
    }, restante);
}