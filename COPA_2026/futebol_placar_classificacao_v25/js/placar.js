/**
 * placar.js — Modo PLACAR
 * ES5 obrigatorio
 *
 * Exibe jogo ao vivo, pre-jogo ou encerrado com:
 *   - Escudos dos times
 *   - Placar / hora / data
 *   - Video de fundo conforme estado
 *   - Intro do patrocinador (FILE_IMAGE1~5 com rotacao)
 *   - Destaque do vencedor ou glow no horario
 *
 * Adaptado do futebol_placar_classificacao_v24 SEM standings.
 * Usa o loader unificado (master.js) com 3 addData.
 */

/* ====================================================
   MAPA DE STATUS → LABEL PT-BR
   ==================================================== */
var STATUS_LABEL = {
    'TBD':  'A Definir',
    'NS':   'Nao Iniciado',
    '1H':   '1o Tempo',
    'HT':   'Intervalo',
    '2H':   '2o Tempo',
    'ET':   'Prorrogacao',
    'BT':   'Intervalo (Prorrogacao)',
    'P':    'Penaltis em Andamento',
    'SUSP': 'Suspenso',
    'INT':  'Interrompido',
    'FT':   'Encerrado',
    'AET':  'Encerrado (Prorrogacao)',
    'PEN':  'Encerrado (Penaltis)',
    'PST':  'Adiado',
    'CANC': 'Cancelado',
    'ABD':  'Abandonado',
    'AWD':  'W.O.',
    'WO':   'W.O.',
    'LIVE': 'Ao Vivo'
};

/* ====================================================
   MAPA DE FASES DO CAMPEONATO → PT-BR
   ==================================================== */
var FASE_LABEL = {
    'preliminary round':          'Fase Preliminar',
    'preliminary stage':          'Fase Preliminar',
    'qualifying round':           'Fase de Qualificacao',
    '1st qualifying round':       '1a Fase de Qualificacao',
    '2nd qualifying round':       '2a Fase de Qualificacao',
    '3rd qualifying round':       '3a Fase de Qualificacao',
    '4th qualifying round':       '4a Fase de Qualificacao',
    'play-off round':             'Play-off',
    'play-offs':                  'Play-offs',
    'play-off':                   'Play-off',
    'group stage':                'Fase de Grupos',
    'groups stage':               'Fase de Grupos',
    'group stage - 1':            'Fase de Grupos - Rodada 1',
    'group stage - 2':            'Fase de Grupos - Rodada 2',
    'group stage - 3':            'Fase de Grupos - Rodada 3',
    'league stage':               'Fase de Liga',
    'round of 128':               '1/128 de Final',
    'round of 64':                '1/64 de Final',
    'round of 32':                'Segunda Fase',
    'round of 16':                'Oitavas de Final',
    'last 16':                    'Oitavas de Final',
    'last 32':                    'Segunda Fase',
    'last 64':                    '1/64 de Final',
    'quarter-finals':             'Quartas de Final',
    'quarter-final':              'Quartas de Final',
    'quarterfinals':              'Quartas de Final',
    'semi-finals':                'Semifinais',
    'semi-final':                 'Semifinal',
    'semifinals':                 'Semifinais',
    'final':                      'Final',
    '3rd place':                  'Disputa de 3o Lugar',
    '3rd place final':            'Disputa de 3o Lugar',
    'third place':                'Disputa de 3o Lugar',
    'fase de grupos':             'Fase de Grupos',
    'fase preliminar':            'Fase Preliminar',
    'fase de qualificacao':       'Fase de Qualificacao',
    'fase de liga':               'Fase de Liga',
    '1/128 de final':             '1/128 de Final',
    '1/64 de final':              '1/64 de Final',
    '1/32 de final':              'Segunda Fase',
    '1/16 de final':              'Oitavas de Final',
    'oitavas de final':           'Oitavas de Final',
    'quartas de final':           'Quartas de Final',
    'semifinal':                  'Semifinal',
    'semifinais':                 'Semifinais',
    'disputa de 3o lugar':        'Disputa de 3o Lugar',
    'regular season':             'Temporada Regular',
    'championship round':         'Rodada do Campeonato',
    'promotion play-off':         'Play-off de Acesso',
    'relegation play-off':        'Play-off de Rebaixamento',
    'matchday 1':                 'Rodada 1',
    'matchday 2':                 'Rodada 2',
    'matchday 3':                 'Rodada 3',
    'matchday 4':                 'Rodada 4',
    'matchday 5':                 'Rodada 5',
    'matchday 6':                 'Rodada 6',
    'matchday 7':                 'Rodada 7',
    'matchday 8':                 'Rodada 8',
    'round 1':                    'Rodada 1',
    'round 2':                    'Rodada 2',
    'round 3':                    'Rodada 3'
};

function traduzirFase(texto) {
    if (!texto) { return ''; }
    var chave = texto.toLowerCase().trim();
    if (FASE_LABEL[chave]) { return FASE_LABEL[chave]; }

    var mMatchday = chave.match(/^matchday\s+(\d+)$/);
    if (mMatchday) { return 'Rodada ' + mMatchday[1]; }

    var mGroupStage = chave.match(/^group stage\s*[-–]\s*(\d+)$/);
    if (mGroupStage) { return 'Fase de Grupos - Rodada ' + mGroupStage[1]; }

    var mRound = chave.match(/^round\s+(\d+)$/);
    if (mRound) { return 'Rodada ' + mRound[1]; }

    var mQual = chave.match(/^(\d+)(?:st|nd|rd|th)\s+qualifying round$/);
    if (mQual) { return mQual[1] + 'a Fase de Qualificacao'; }

    var mLeague = chave.match(/^league\s+stage\s*[-–]\s*(\d+)$/);
    if (mLeague) { return 'Fase de Liga - Rodada ' + mLeague[1]; }

    var mRegSeason = chave.match(/^regular season\s*[-–\s]\s*(\d+)$/);
    if (mRegSeason) { return 'Temporada Regular - Rodada ' + mRegSeason[1]; }

    var mLeg = chave.match(/^(\d+)(?:st|nd|rd|th)\s+leg$/);
    if (mLeg) { return mLeg[1] + 'a Mao'; }

    return texto;
}

/* chaves localStorage para rotacao por SPECIALPROJECT */
var LS_KEY_SP_IDX   = 'placar_futebol_sp_idx';
var LS_KEY_SP_ITEMS = 'placar_futebol_sp_items';

/* ====================================================
   PARSE DO JSON EM TEXTO2 (API-Football response)
   ==================================================== */
function parseTexto2(jsonStr) {
    var result = {
        homeTeam: '', awayTeam: '',
        homeLogo: '', awayLogo: '',
        homeId: null, awayId: null,
        venue: '',
        goalsHome: null, goalsAway: null,
        penHome: null, penAway: null,
        elapsed: null, extra: null
    };
    if (!jsonStr) { return result; }
    try {
        var obj = JSON.parse(jsonStr);
        var resp = obj.response && obj.response[0];
        if (!resp) { return result; }
        if (resp.teams) {
            if (resp.teams.home) {
                result.homeTeam = resp.teams.home.name || '';
                result.homeLogo = resp.teams.home.logo || '';
                result.homeId = resp.teams.home.id || null;
            }
            if (resp.teams.away) {
                result.awayTeam = resp.teams.away.name || '';
                result.awayLogo = resp.teams.away.logo || '';
                result.awayId = resp.teams.away.id || null;
            }
        }
        if (resp.fixture && resp.fixture.venue) {
            result.venue = resp.fixture.venue.name || '';
        }
        if (resp.goals) {
            result.goalsHome = resp.goals.home;
            result.goalsAway = resp.goals.away;
        }
        if (resp.score && resp.score.penalty) {
            result.penHome = resp.score.penalty.home;
            result.penAway = resp.score.penalty.away;
        }
        if (resp.fixture && resp.fixture.status) {
            result.elapsed = resp.fixture.status.elapsed;
            result.extra = resp.fixture.status.extra;
        }
        return result;
    } catch (e) {
        console.error('[placar] Erro ao parsear TEXTO2:', e);
        return result;
    }
}

function obterProximaIntroMedia(spdSponsor, specialProject) {
    if (!spdSponsor) { return ''; }

    var medias = [];
    for (var i = 1; i <= 5; i++) {
        var media = obterValor(spdSponsor, 'FILE_IMAGE' + i);
        if (media && media.trim() !== '') { medias.push(media.trim()); }
    }
    if (medias.length === 0) { return ''; }

    var storageKey = 'placar_futebol_intro_idx_' + specialProject;
    var idx = 0;
    try {
        idx = parseInt(localStorage.getItem(storageKey), 10);
        if (isNaN(idx) || idx >= medias.length) { idx = 0; }
        localStorage.setItem(storageKey, (idx + 1) % medias.length);
    } catch (e) { idx = 0; }

    return medias[idx];
}

/* ====================================================
   DETERMINA O ESTADO VISUAL DO JOGO
   ==================================================== */
function determinarEstado(statusBase) {
    var status = (statusBase || '').toUpperCase().trim();
    if (status === 'PEN') { return 'penalties'; }
    if (status === 'FT' || status === 'AET' || status === 'FT_PEN' || status === 'ABD' || status === 'AWD' || status === 'WO') { return 'encerrado'; }
    if (status === '1H' || status === '2H' || status === 'HT' || status === 'ET' || status === 'BT' || status === 'P' || status === 'SUSP' || status === 'INT' || status === 'LIVE') { return 'ao_vivo'; }
    if (status === 'PST') { return 'adiado'; }
    if (status === 'CANC') { return 'cancelado'; }
    return 'pre_jogo';
}

/* ====================================================
   FORMATA DATA/HORA
   ==================================================== */
function formatarDataHora(dateStr) {
    if (!dateStr) { return { hora: '--:--', data: '-- / --' }; }
    var partes = dateStr.trim().split(' ');
    var dp = (partes[0] || '').split('-');
    var hp = (partes[1] || '').split(':');
    var dia = dp[2] || '--';
    var mes = dp[1] || '--';
    var hora = (hp[0] || '--');
    var min = (hp[1] || '00');
    return { hora: hora + ':' + min, data: dia + '/' + mes };
}

/* ====================================================
   DESTAQUES
   ==================================================== */
function aplicarDestaquePrejogo() {
    var horaEl = document.querySelector('#hora');
    var dataEl = document.querySelector('#data');
    if (horaEl) { horaEl.classList.add('animate-pulse-glow'); }
    if (dataEl) { dataEl.classList.add('animate-pulse-glow'); }
}

function aplicarDestaqueVencedor(dados) {
    var a, b;
    if (dados.estado === 'penalties' && dados.pen1 !== '' && dados.pen2 !== '') {
        a = parseInt(dados.pen1, 10) || 0;
        b = parseInt(dados.pen2, 10) || 0;
    } else {
        a = parseInt(dados.gols1, 10) || 0;
        b = parseInt(dados.gols2, 10) || 0;
    }
    if (a === b) { return; }

    var vencedor = (a > b) ? 1 : 2;
    var nomeEl  = document.querySelector(vencedor === 1 ? '#time1Nome' : '#time2Nome');
    var logoEl  = document.querySelector(vencedor === 1 ? '#logo1Container' : '#logo2Container');
    var golEl   = document.querySelector(vencedor === 1 ? '#gols1Placar' : '#gols2Placar');

    if (nomeEl) { nomeEl.classList.add('animate-pulse-glow'); }
    if (logoEl) { logoEl.classList.add('animate-pulse-win'); }
    if (golEl)  { golEl.classList.add('animate-pulse-glow'); }
}

function verificarImagem(url, callback) {
    if (!url) { callback(false); return; }
    var img = new Image();
    img.onload = function() { callback(true); };
    img.onerror = function() { callback(false); };
    img.src = url;
}

/* ====================================================
   RENDERIZA O TEMPLATE PLACAR
   ==================================================== */
function renderizarTemplate(dados, loader) {
    document.querySelector('#time1Nome').innerHTML   = dados.time1;
    document.querySelector('#time2Nome').innerHTML   = dados.time2;
    document.querySelector('#torneio').innerHTML      = dados.torneio;
    document.querySelector('#rodada').innerHTML       = dados.rodada;
    document.querySelector('#estadioCentro').innerHTML = dados.estadio;
    document.querySelector('#hora').innerHTML          = dados.hora;
    document.querySelector('#data').innerHTML          = dados.data;

    var mostrarPlacar = (dados.estado !== 'pre_jogo' && dados.estado !== 'adiado' && dados.estado !== 'cancelado');
    loader.loaded();

    if (mostrarPlacar) {
        document.querySelector('#preGameInfo').classList.add('hidden');
        var scoreSection = document.querySelector('#scoreSection');
        scoreSection.classList.remove('hidden');

        document.querySelector('#placar').innerHTML =
            '<span id="gols1Placar">' + dados.gols1 + '</span>' +
            '<span class="text-white/30 mx-[0.15em] text-[50%]"> x </span>' +
            '<span id="gols2Placar">' + dados.gols2 + '</span>';
        document.querySelector('#horaSmall').innerHTML = dados.hora + ' . ' + dados.data;

        var statusLabel = STATUS_LABEL[dados.statusRaw] || dados.statusRaw || '';
        var tempoStr = '';

        if (dados.estado === 'ao_vivo') {
            if (dados.tempo && dados.tempo !== '0' && dados.tempo !== '') {
                tempoStr = dados.tempo + "'";
                if (dados.tempoExtra && dados.tempoExtra !== '0' && dados.tempoExtra !== '') {
                    tempoStr = tempoStr + ' +' + dados.tempoExtra + "'";
                }
                tempoStr = tempoStr + ' . ' + statusLabel;
            } else {
                tempoStr = statusLabel;
            }
        } else {
            tempoStr = statusLabel;
        }

        if (tempoStr) {
            var tempoSection = document.querySelector('#tempoSection');
            tempoSection.classList.remove('hidden');
            document.querySelector('#tempo').innerHTML = tempoStr;
        }

        if (dados.estado === 'penalties' && dados.pen1 !== '' && dados.pen2 !== '') {
            var penSection = document.querySelector('#penaltySection');
            penSection.classList.remove('hidden');
            document.querySelector('#penPlacar').innerHTML = '(resultado: ' + dados.pen1 + ' x ' + dados.pen2 + ')';
        }
    } else {
        var scoreSection = document.querySelector('#scoreSection');
        scoreSection.classList.remove('hidden');
        var tempoStr = '';
        if (dados.estado === 'adiado' || dados.estado === 'cancelado') {
            tempoStr = STATUS_LABEL[dados.statusRaw];
            var tempoSection = document.querySelector('#tempoSection');
            tempoSection.classList.remove('hidden');
            document.querySelector('#tempo').innerHTML = tempoStr;
        }
    }

    // Video de fundo
    var videoSrc;
    if (dados.estado === 'encerrado' || dados.estado === 'penalties') { videoSrc = 'img/pos.mp4'; }
    else if (dados.estado === 'ao_vivo') { videoSrc = 'img/live.mp4'; }
    else { videoSrc = 'img/pre.mp4'; }

    var bgVideo = document.querySelector('#bgVideo');
    if (bgVideo) {
        try {
            var suportaVideo = bgVideo.canPlayType && bgVideo.canPlayType('video/mp4') !== '';
            if (!suportaVideo) { aplicarFallbackVideo(bgVideo); }
            else if (bgVideo.src.indexOf(videoSrc) === -1) {
                bgVideo.style.display = 'block';
                var fallbackImg = document.querySelector('#bgFallback');
                if (fallbackImg) { fallbackImg.style.display = 'none'; }
                bgVideo.src = videoSrc;
                bgVideo.load();
                bgVideo.play();
            }
        } catch (e) {}
    }

    if (dados.estado === 'pre_jogo') { aplicarDestaquePrejogo(); }
    else { aplicarDestaqueVencedor(dados); }

    // Escudos
    var logo1          = document.querySelector('#logo1');
    var logo2          = document.querySelector('#logo2');
    var logo1Container = document.querySelector('#logo1Container');
    var logo2Container = document.querySelector('#logo2Container');

    var escudosProntos = false;
    var introFeita     = !dados.introMedia;
    var introActualMs  = 0;
    var introStartTime = 0;
    var loadedCount    = 0;

    function revelarPlacar() {
        esconderIntro(function() {
            var headerEl  = document.querySelector('header');
            var footerEl  = document.querySelector('#sponsorFooterPlacar');
            var team1El   = document.querySelector('#team1');
            var team2El   = document.querySelector('#team2');
            var centerEl  = document.querySelector('#centerContent');

            headerEl.style.animationDelay = '0s';
            footerEl.style.animationDelay = '0s';
            team1El.style.animationDelay  = '0.15s';
            team2El.style.animationDelay  = '0.15s';
            centerEl.style.animationDelay = '0.35s';

            headerEl.classList.add('animate-slide-in-top');
            if (!footerEl.classList.contains('hidden')) { footerEl.classList.add('animate-slide-in-bottom'); }
            team1El.classList.add('animate-slide-in-left');
            team2El.classList.add('animate-slide-in-right');
            centerEl.classList.add('animate-fade-in');

            var mainEl = document.querySelector('#placarView');
            if (!mainEl) { mainEl = document.querySelector('#mainContent'); }
            if (mainEl) { mainEl.classList.remove('opacity-0'); mainEl.classList.add('opacity-100'); }

            var bgVideoEl = document.querySelector('#bgVideo');
            if (bgVideoEl) { bgVideoEl.classList.remove('opacity-0'); bgVideoEl.classList.add('opacity-100'); }

            var gradEl = document.querySelector('#gradientOverlay');
            if (gradEl) { gradEl.classList.remove('opacity-0'); gradEl.classList.add('opacity-50'); }

            var placarMs = Math.max(DURACAO_TOTAL - introActualMs, 1000);
            setTimeout(function() { loader.finished(); _playerViewExecutando = false; }, placarMs);
        });
    }

    function verificarPronto() { if (introFeita && escudosProntos) { revelarPlacar(); } }

    function onEscudoPronto() { loadedCount++; if (loadedCount >= 2) { escudosProntos = true; verificarPronto(); } }

    function carregarEscudo(imgEl, containerEl, url) {
        if (!url) { containerEl.innerHTML = SVG_ESCUDO; onEscudoPronto(); return; }
        imgEl.onload = function() { onEscudoPronto(); };
        imgEl.onerror = function() { containerEl.innerHTML = SVG_ESCUDO; onEscudoPronto(); };
        imgEl.src = url;
    }

    var introMaxMs = dados.introMs || INTRO_MAX_MS;
    if (dados.introMedia) {
        introStartTime = Date.now();
        mostrarIntro(dados.introMedia, introMaxMs, function() {
            introActualMs = Math.min(Date.now() - introStartTime, introMaxMs);
            introFeita = true;
            verificarPronto();
        });
    }

    // Sponsor footer
    var sponsorFooterEl = document.querySelector('#sponsorFooterPlacar');
    if (dados.patroFrase || dados.patroLogo) {
        sponsorFooterEl.classList.remove('hidden');
        document.querySelector('#sponsorFooterPlacar #sponsorFrase').innerHTML = dados.patroFrase || '';
        var sponsorLogoEl = document.querySelector('#sponsorFooterPlacar #sponsorLogo');
        if (dados.patroLogo) { sponsorLogoEl.src = dados.patroLogo; sponsorLogoEl.classList.remove('hidden'); }
        else { sponsorLogoEl.classList.add('hidden'); }
    } else {
        sponsorFooterEl.classList.add('hidden');
    }

    carregarEscudo(logo1, logo1Container, dados.foto1);
    carregarEscudo(logo2, logo2Container, dados.foto2);
}

/* ====================================================
   PROCESSA OS DADOS E RENDERIZA
   Usa dados do loader unificado (master.js)
   ==================================================== */
function processarDados(spdData, spdSponsor, footballData, teamHome, teamAway, loader, spAtual) {
    var matchInfo = parseTexto2(obterValor(footballData, 'TEXTO2'));
    var statusBase = obterValor(footballData, 'TEXTO5');
    var estado = determinarEstado(statusBase);
    var dtFormatada = formatarDataHora(obterValor(footballData, 'DATE'));

    var gols1 = matchInfo.goalsHome !== null ? String(matchInfo.goalsHome) : '0';
    var gols2 = matchInfo.goalsAway !== null ? String(matchInfo.goalsAway) : '0';
    var pen1 = matchInfo.penHome !== null ? String(matchInfo.penHome) : '';
    var pen2 = matchInfo.penAway !== null ? String(matchInfo.penAway) : '';
    var tempo = matchInfo.elapsed !== null ? String(matchInfo.elapsed) : '';
    var tempoExtra = matchInfo.extra !== null ? String(matchInfo.extra) : '';
    var homeId = matchInfo.homeId;
    var awayId = matchInfo.awayId;

    var teamHomeExiste = teamHome && obterValor(teamHome, 'TITULO');
    var teamAwayExiste = teamAway && obterValor(teamAway, 'TITULO');

    var teamHomePath = teamHomeExiste ? 'img/flags/' + obterValor(teamHome, 'TITULO') + '.png' : (homeId ? 'img/flags/' + homeId + '.png' : '');
    var teamAwayPath = teamAwayExiste ? 'img/flags/' + obterValor(teamAway, 'TITULO') + '.png' : (awayId ? 'img/flags/' + awayId + '.png' : '');

    verificarImagem(teamHomePath, function(existeHome) {
        verificarImagem(teamAwayPath, function(existeAway) {
            var nomeHome = teamHome ? obterValor(teamHome, 'TEXTO2') : matchInfo.homeTeam;
            var nomeAway = teamAway ? obterValor(teamAway, 'TEXTO2') : matchInfo.awayTeam;

            var logoHome = (existeHome ? teamHomePath : '') ||
                (teamHome && obterValor(teamHome, 'FOTO')) ||
                obterValor(footballData, 'FOTO') || matchInfo.homeLogo;

            var logoAway = (existeAway ? teamAwayPath : '') ||
                (teamAway && obterValor(teamAway, 'FOTO')) ||
                obterValor(footballData, 'FOTO2') || matchInfo.awayLogo;

            var dados = {
                time1: nomeHome, time2: nomeAway,
                estadio: matchInfo.venue,
                rodada: traduzirFase(obterValor(footballData, 'TEXTO4')),
                torneio: obterValor(footballData, 'CATEGORY') === 'Copa do Mundo' ? 'O Mundo em Campo 2026' : obterValor(footballData, 'CATEGORY'),
                hora: dtFormatada.hora, data: dtFormatada.data,
                foto1: logoHome, foto2: logoAway,
                estado: estado, statusRaw: statusBase.toUpperCase().trim(),
                gols1: gols1, gols2: gols2, pen1: pen1, pen2: pen2,
                tempo: tempo, tempoExtra: tempoExtra,
                patroFrase: spdSponsor ? obterValor(spdSponsor, 'TEXT1') : '',
                patroLogo: spdSponsor ? obterValor(spdSponsor, 'IMAGE_LOGO') : '',
                introMedia: obterProximaIntroMedia(spdSponsor, spAtual),
                introMs: spdSponsor && obterValor(spdSponsor, 'TEXT2') ? parseInt(obterValor(spdSponsor, 'TEXT2'), 10) * 1000 : INTRO_MAX_MS
            };

            var cor1 = spdSponsor ? obterValor(spdSponsor, 'COLOR1') : '';
            var cor2 = spdSponsor ? obterValor(spdSponsor, 'COLOR2') : '';
            var cor3 = spdSponsor ? obterValor(spdSponsor, 'COLOR3') : '';
            if (cor1 && cor1.charAt(0) !== '#') { cor1 = '#' + cor1; }
            if (cor2 && cor2.charAt(0) !== '#') { cor2 = '#' + cor2; }
            if (cor3 && cor3.charAt(0) !== '#') { cor3 = '#' + cor3; }

            var cfgCores = { corDestaque: cor2 || CONFIG.corDestaque, corEscura: cor1 || CONFIG.corEscura, corClara: cor3 || CONFIG.corClara };
            aplicarCores(cfgCores);

            mostrarView('placar');
            renderizarTemplate(dados, loader);
        });
    });
}

/* ====================================================
   INICIAR PLACAR — ponto de entrada chamado pelo master.js
   Recebe o loader unificado com D_SPD, D_FOOTBALL, D_FOOTBALL_TEAMS
   ==================================================== */
function iniciarPlacar(loader) {
    var listaSpd = loader.datalist('D_SPD');
    if (!listaSpd || listaSpd.count() === 0) {
        console.log('[placar] D_SPD vazio — skip');
        mostrarView('placar');
        exibirMensagemAguardando('placar');
        loader.loaded();
        setTimeout(function() { loader.finished(); _playerViewExecutando = false; }, DURACAO_TOTAL);
        return;
    }

    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Agrupa por SPECIALPROJECT
    var gruposBrutos = {};
    for (var i = 0; i < listaSpd.count(); i++) {
        var item = listaSpd.get(i);
        var sp = obterValor(item, 'SPECIALPROJECT') || '_default';
        if (!gruposBrutos[sp]) { gruposBrutos[sp] = []; }
        gruposBrutos[sp].push(item);
    }

    // Filtra por data
    var grupos = {};
    for (var sp in gruposBrutos) {
        var itens = gruposBrutos[sp];
        var itensHoje = [];
        var proximaData = null;

        for (var j = 0; j < itens.length; j++) {
            var item = itens[j];

            // Ignora CONFIG=1 (sponsor) — nao e um jogo
            if (obterValor(item, 'CONFIG') === '1') { continue; }

            var timestamp = parseInt(obterValor(item, 'TEXT3'), 10);
            if (isNaN(timestamp)) { continue; }

            var dataItem = new Date(timestamp * 1000);
            dataItem.setHours(0, 0, 0, 0);

            if (dataItem.getTime() === hoje.getTime()) {
                itensHoje.push(item);
            } else if (dataItem > hoje) {
                if (!proximaData || dataItem < proximaData) { proximaData = new Date(dataItem.getTime()); }
            }
        }

        if (itensHoje.length > 0) {
            grupos[sp] = itensHoje;
        } else if (proximaData) {
            var itensProximaData = [];
            for (var k = 0; k < itens.length; k++) {
                var item2 = itens[k];
                var ts = parseInt(obterValor(item2, 'TEXT3'), 10);
                if (isNaN(ts)) { continue; }
                var dt = new Date(ts * 1000);
                dt.setHours(0, 0, 0, 0);
                if (dt.getTime() === proximaData.getTime()) { itensProximaData.push(item2); }
            }
            grupos[sp] = itensProximaData;
        }
    }

    var spKeys = Object.keys(grupos).sort();
    if (spKeys.length === 0) {
        console.log('[placar] Nenhum grupo SPECIALPROJECT');
        mostrarView('placar');
        exibirMensagemAguardando('placar');
        loader.loaded();
        setTimeout(function() { loader.finished(); _playerViewExecutando = false; }, DURACAO_TOTAL);
        return;
    }

    // Rotacao por SPECIALPROJECT
    var spIdx = 0;
    try { spIdx = parseInt(localStorage.getItem(LS_KEY_SP_IDX), 10); } catch (e) {}
    if (isNaN(spIdx) || spIdx >= spKeys.length) { spIdx = 0; }

    var spAtual = spKeys[spIdx];
    var itensGrupo = grupos[spAtual];

    var proximoSpIdx = (spIdx + 1) % spKeys.length;
    try { localStorage.setItem(LS_KEY_SP_IDX, proximoSpIdx); } catch (e) {}

    // Seleciona item dentro do grupo
    var itemIndices = {};
    try { itemIndices = JSON.parse(localStorage.getItem(LS_KEY_SP_ITEMS)) || {}; } catch (e) {}
    var itemIdx = itemIndices[spAtual] || 0;
    if (itemIdx >= itensGrupo.length) { itemIdx = 0; }

    var spdData = itensGrupo[itemIdx];
    itemIndices[spAtual] = (itemIdx + 1) % itensGrupo.length;
    try { localStorage.setItem(LS_KEY_SP_ITEMS, JSON.stringify(itemIndices)); } catch (e) {}

    var partidaId = obterValor(spdData, 'TITLE').trim();
    console.log('[placar] SP=' + spAtual + ' item=' + (itemIdx + 1) + '/' + itensGrupo.length + ' partida=' + partidaId);

    if (!partidaId) {
        exibirMensagemAguardando('placar');
        loader.loaded();
        setTimeout(function() { loader.finished(); _playerViewExecutando = false; }, DURACAO_TOTAL);
        return;
    }

    // Busca sponsor (CONFIG=1) para esse SP na datalist D_SPD ja carregada
    // Prioridade: mesmo SPECIALPROJECT. Fallback: qualquer CONFIG=1
    var spdSponsor = null;
    var spdLista = loader.datalist('D_SPD');
    if (spdLista) {
        for (var si = 0; si < spdLista.count(); si++) {
            var spItem = spdLista.get(si);
            var cfg = obterValor(spItem, 'CONFIG');
            if (cfg === '1' && obterValor(spItem, 'SPECIALPROJECT') === spAtual) {
                spdSponsor = spItem;
                break;
            }
            // Fallback: primeiro CONFIG=1 que encontrar
            if (cfg === '1' && !spdSponsor) {
                spdSponsor = spItem;
            }
        }
    }
    console.log('[placar] sponsor encontrado:', spdSponsor ? 'SIM (SP=' + obterValor(spdSponsor, 'SPECIALPROJECT') + ')' : 'NAO');

    // Busca D_FOOTBALL pelo TITLE da partida (usando datalist ja carregada)
    var listaFootball = loader.datalist('D_FOOTBALL');
    var footballData = null;
    if (listaFootball) {
        for (var fi = 0; fi < listaFootball.count(); fi++) {
            var fItem = listaFootball.get(fi);
            if (obterValor(fItem, 'TITULO').trim() === partidaId) {
                footballData = fItem;
                break;
            }
        }
    }

    if (!footballData) {
        console.log('[placar] D_FOOTBALL sem dados para ID=' + partidaId);
        exibirMensagemAguardando('placar');
        loader.loaded();
        setTimeout(function() { loader.finished(); _playerViewExecutando = false; }, DURACAO_TOTAL);
        return;
    }

    // Busca times em D_FOOTBALL_TEAMS
    var matchInfo = parseTexto2(obterValor(footballData, 'TEXTO2'));
    var homeId = matchInfo.homeId;
    var awayId = matchInfo.awayId;

    var listaTeams = loader.datalist('D_FOOTBALL_TEAMS');
    var teamHome = null;
    var teamAway = null;

    if (listaTeams) {
        for (var ti = 0; ti < listaTeams.count(); ti++) {
            var tItem = listaTeams.get(ti);
            var tid = obterValor(tItem, 'TITULO').trim();
            if (homeId && tid === String(homeId)) { teamHome = tItem; }
            if (awayId && tid === String(awayId)) { teamAway = tItem; }
        }
    }

    processarDados(spdData, spdSponsor, footballData, teamHome, teamAway, loader, spAtual);
}

/**
 * Exibe mensagem de "aguardando" quando nao ha dados para exibir.
 * Cria overlay temporario em vez de destruir o DOM.
 */
function exibirMensagemAguardando(modo) {
    var msgs = {
        'placar': 'Aguardando partida',
        'confrontos': 'Aguardando definicao dos confrontos',
        'bracket': 'Chaveamento sera definido apos os confrontos'
    };

    var msg = msgs[modo] || 'Aguardando informacoes';

    // Remove overlay existente
    var oldOverlay = document.querySelector('#msgOverlay');
    if (oldOverlay) { oldOverlay.parentNode.removeChild(oldOverlay); }

    // Cria overlay sobre a view ativa
    var views = ['placarView', 'confrontosView', 'bracketView'];
    for (var v = 0; v < views.length; v++) {
        var el = document.querySelector('#' + views[v]);
        if (el && !el.classList.contains('hidden')) {
            var overlay = document.createElement('div');
            overlay.id = 'msgOverlay';
            overlay.className = 'absolute inset-0 z-50 flex items-center justify-center bg-black/60';
            overlay.innerHTML = '<span class="text-[5vmin] text-white/60 font-roboto-regular text-center px-[4vmin]">' + msg + '</span>';
            el.appendChild(overlay);
        }
    }
}

/**
 * Mostra uma view e esconde as outras.
 */
function mostrarView(viewId) {
    var views = ['placarView', 'confrontosView', 'bracketView'];
    for (var i = 0; i < views.length; i++) {
        var el = document.querySelector('#' + views[i]);
        if (el) {
            if (views[i] === viewId || views[i] === viewId + 'View') {
                el.classList.remove('hidden');
                el.classList.add('flex');
            } else {
                el.classList.add('hidden');
                el.classList.remove('flex');
            }
        }
    }

    // Mostra bgVideo e gradientOverlay
    var bgVideo = document.querySelector('#bgVideo');
    if (bgVideo) { bgVideo.style.display = 'block'; }
    var gradEl = document.querySelector('#gradientOverlay');
    if (gradEl) { gradEl.style.display = 'block'; }
}