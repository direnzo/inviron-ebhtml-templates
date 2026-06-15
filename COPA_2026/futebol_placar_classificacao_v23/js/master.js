/**
 * master.js - Placar Futebol
 * ES5 obrigatorio — sem const/let/arrow/template-strings/Promise/fetch
 *
 * Datasets:
 *   D_SPD       (opcional)    — dataset unico com dois tipos de item:
 *                               CONFIG='0' / TYPE='10': dados do jogo ao vivo
 *                                   TITLE = ID da partida (chave de cruzamento)
 *                               CONFIG='1': dados do patrocinador
 *                               Sem item TYPE='10' em D_SPD = nada a exibir
 *
 *   D_FOOTBALL  (obrigatorio) — dados estaticos do jogo:
 *                               nomes, escudos (FOTO/FOTO2), estadio, data,
 *                               torneio (CATEGORY), rodada (SUBTITULO2),
 *                               ID da partida em TEXTO (cruzado com D_SPD.TITLE)
 */

/* ====================================================
   MAPA DE STATUS → LABEL PT-BR
   Fonte: API-Football status codes
   ==================================================== */
var STATUS_LABEL = {
    'TBD':  'A Definir',
    'NS':   'Não Iniciado',
    '1H':   '1º Tempo',
    'HT':   'Intervalo',
    '2H':   '2º Tempo',
    'ET':   'Prorrogação',
    'BT':   'Intervalo (Prorrogação)',
    'P':    'Pênaltis em Andamento',
    'SUSP': 'Suspenso',
    'INT':  'Interrompido',
    'FT':   'Encerrado',
    'AET':  'Encerrado (Prorrogação)',
    'PEN':  'Encerrado (Pênaltis)',
    'PST':  'Adiado',
    'CANC': 'Cancelado',
    'ABD':  'Abandonado',
    'AWD':  'W.O.',
    'WO':   'W.O.',
    'LIVE': 'Ao Vivo'
};

/* ====================================================
   MAPA DE FASES DO CAMPEONATO → PT-BR
   Cobre os valores mais comuns vindos em SUBTITULO2
   ==================================================== */
var FASE_LABEL = {
    // Fases eliminatórias
    'preliminary round':          'Fase Preliminar',
    'preliminary stage':          'Fase Preliminar',
    'qualifying round':           'Fase de Qualificação',
    '1st qualifying round':       '1ª Fase de Qualificação',
    '2nd qualifying round':       '2ª Fase de Qualificação',
    '3rd qualifying round':       '3ª Fase de Qualificação',
    '4th qualifying round':       '4ª Fase de Qualificação',
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
    'round of 32':                '1/32 de Final',
    'round of 16':                'Oitavas de Final',
    'last 16':                    'Oitavas de Final',
    'last 32':                    '1/32 de Final',
    'last 64':                    '1/64 de Final',
    'quarter-finals':             'Quartas de Final',
    'quarter-final':              'Quartas de Final',
    'quarterfinals':              'Quartas de Final',
    'semi-finals':                'Semifinais',
    'semi-final':                 'Semifinal',
    'semifinals':                 'Semifinais',
    'final':                      'Final',
    '3rd place':                  'Disputa de 3º Lugar',
    '3rd place final':            'Disputa de 3º Lugar',
    'third place':                'Disputa de 3º Lugar',
    // Entradas em português (API pode retornar já traduzido, normaliza o case)
    'play-offs':                  'Play-offs',
    'fase de grupos':             'Fase de Grupos',
    'fase preliminar':            'Fase Preliminar',
    'fase de qualificação':       'Fase de Qualificação',
    'fase de liga':               'Fase de Liga',
    '1/128 de final':             '1/128 de Final',
    '1/64 de final':              '1/64 de Final',
    '1/32 de final':              '1/32 de Final',
    '1/16 de final':              '1/16 de Final',
    'oitavas de final':           'Oitavas de Final',
    'quartas de final':           'Quartas de Final',
    'semifinal':                  'Semifinal',
    'semifinais':                 'Semifinais',
    'disputa de 3º lugar':        'Disputa de 3º Lugar',
    'supercopa':                  'Supercopa',
    'temporada regular':          'Temporada Regular',
    'play-off de acesso':         'Play-off de Acesso',
    'play-off de rebaixamento':   'Play-off de Rebaixamento',
    // Rodadas de campeonatos
    'regular season':             'Temporada Regular',
    'championship round':         'Rodada do Campeonato',
    'promotion play-off':         'Play-off de Acesso',
    'relegation play-off':        'Play-off de Rebaixamento',
    'promotion/relegation play-off': 'Play-off Acesso/Rebaixamento',
    'ranking of third-placed teams': 'Ranking de Terceiros Colocados',
    'super cup':                  'Supercopa',
    'supercup':                   'Supercopa',
    '1st leg':                    '1ª Mão',
    '2nd leg':                    '2ª Mão',
    '1st round':                  '1ª Rodada',
    '2nd round':                  '2ª Rodada',
    '3rd round':                  '3ª Rodada',
    '4th round':                  '4ª Rodada',
    '5th round':                  '5ª Rodada',
    'round 1':                    'Rodada 1',
    'round 2':                    'Rodada 2',
    'round 3':                    'Rodada 3',
    'matchday 1':                 'Rodada 1',
    'matchday 2':                 'Rodada 2',
    'matchday 3':                 'Rodada 3',
    'matchday 4':                 'Rodada 4',
    'matchday 5':                 'Rodada 5',
    'matchday 6':                 'Rodada 6',
    'matchday 7':                 'Rodada 7',
    'matchday 8':                 'Rodada 8'
};

/**
 * Traduz fase/rodada do campeonato para PT-BR.
 * Tenta match exato por chave em minúsculas; se não encontrar, devolve o original.
 * Também expande padrões numéricos dinâmicos como "Matchday 12", "Round 15".
 */
function traduzirFase(texto) {
    if (!texto) { return ''; }
    var chave = texto.toLowerCase().trim();

    // Lookup direto
    if (FASE_LABEL[chave]) {
        return FASE_LABEL[chave];
    }

    // Padrões dinâmicos: "Matchday N", "Round N", "Nd/Nd Qualifying Round"
    var mMatchday = chave.match(/^matchday\s+(\d+)$/);
    if (mMatchday) { return 'Rodada ' + mMatchday[1]; }

    var mGroupStage = chave.match(/^group stage\s*[-–]\s*(\d+)$/);
    if (mGroupStage) { return 'Fase de Grupos - Rodada ' + mGroupStage[1]; }

    var mRound = chave.match(/^round\s+(\d+)$/);
    if (mRound) { return 'Rodada ' + mRound[1]; }

    var mQual = chave.match(/^(\d+)(?:st|nd|rd|th)\s+qualifying round$/);
    if (mQual) { return mQual[1] + 'ª Fase de Qualificação'; }

    var mLeague = chave.match(/^league\s+stage\s*[-–]\s*(\d+)$/);
    if (mLeague) { return 'Fase de Liga — Rodada ' + mLeague[1]; }

    var mRegSeason = chave.match(/^regular season\s*[-–\s]\s*(\d+)$/);
    if (mRegSeason) { return 'Temporada Regular — Rodada ' + mRegSeason[1]; }

    var mLeg = chave.match(/^(\d+)(?:st|nd|rd|th)\s+leg$/);
    if (mLeg) { return mLeg[1] + 'ª Mão'; }

    // Sem tradução — devolve o original sem alteração
    return texto;
}
var SVG_ESCUDO = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100%" height="100%">',
    '<path d="M50 8 L90 22 L90 65 Q90 100 50 114 Q10 100 10 65 L10 22 Z"',
    ' fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.25)" stroke-width="2.5"/>',
    '<path d="M50 22 L74 30 L74 62 Q74 85 50 96 Q26 85 26 62 L26 30 Z"',
    ' fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>',
    '</svg>'
].join('');

/* ====================================================
   CONFIG — 3 cores primárias do template
   Altere apenas estes 3 valores HEX para customizar o visual
   ==================================================== */
var CONFIG = {
    corDestaque: '#FBBF24',  // cor de destaque (hora, tempo, glow)
    corEscura:   '#006400',  // cor de fundo (painéis, gradientes) verde bem escuro 
    corClara:    '#FFFFFF'   // cor de texto e bordas
};
/* Duração total do template em ms: intro + placar = sempre 10s */
var DURACAO_TOTAL = 10000;
/* Duração máxima da intro em ms — vídeo cortado se ultrapassar */
var INTRO_MAX_MS  = 5000;

/* chaves localStorage para rotação por SPECIALPROJECT */
var LS_KEY_SP_IDX   = 'placar_futebol_sp_idx';
var LS_KEY_SP_ITEMS = 'placar_futebol_sp_items';


/* Converte HEX para rgba com opacidade */
function hexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

function aplicarCores(cfg) {
    var s = document.documentElement.style;
    s.setProperty('--cor-destaque',      cfg.corDestaque);
    s.setProperty('--cor-destaque-glow', hexToRgba(cfg.corDestaque, 0.70));
    s.setProperty('--cor-fundo-painel',  hexToRgba(cfg.corEscura,   0.90));
    s.setProperty('--cor-fundo-area',    hexToRgba(cfg.corEscura,   0.40));
    s.setProperty('--cor-borda',         hexToRgba(cfg.corClara,    0.10));
    s.setProperty('--cor-texto',         cfg.corClara);
    s.setProperty('--cor-texto-sec',     hexToRgba(cfg.corClara,    0.90));
    s.setProperty('--cor-texto-ter',     hexToRgba(cfg.corClara,    0.98));
    s.setProperty('--cor-grad-from',     hexToRgba(cfg.corEscura,   0.90));
    s.setProperty('--cor-grad-mid',      hexToRgba(cfg.corEscura,   0.90));
    s.setProperty('--cor-grad-to',       hexToRgba(cfg.corEscura,   0.80));
}


/* ====================================================
   ENTRADA — modo player (produção / mock local)
   Chamada pelo inline script no final do body quando
   NÃO está no modo preview da extranet.
   ==================================================== */
function playerView() {
    aplicarCores(CONFIG);

    // EdgeContents real
    ebhtml.create2({}, function(loader) {
        // Carrega TODOS os itens TYPE=10 CONFIG=0 (jogos) de uma vez.
        // A rotação é feita client-side via localStorage por SPECIALPROJECT.
        loader.addData('D_SPD', false, 'amount=0&f_type=10&f_config=0');
        loader.autoloaded = false;
        loader.nodataiserror = false;

        loader.load(function() {

            var lista = loader.datalist('D_SPD');
                console.log(lista);

                if (!lista || lista.count() === 0) {
                    console.log('[placar_futebol] D_SPD vazio — skip');
                    loader.finished();
                    return;
                }

                var itensHoje = [];
                var itensIgnorados = [];

                var hoje = new Date();
                hoje.setHours(0, 0, 0, 0);

                for (var i = 0; i < lista.count(); i++) {
                    var item = lista.get(i);

                    var title = obterValor(item, 'TITLE');

                    // STANDINGS sempre entra
                    if (title === 'STANDINGS') {
                        itensHoje.push(item);
                        continue;
                    }

                    var timestamp = parseInt(obterValor(item, 'TEXT3'), 10);

                    if (!isNaN(timestamp)) {
                        var dataItem = new Date(timestamp * 1000);
                        dataItem.setHours(0, 0, 0, 0);

                        if (dataItem.getTime() === hoje.getTime()) {
                            itensHoje.push(item);
                        } else {
                            itensIgnorados.push(item);
                        }
                    } else {
                        itensIgnorados.push(item);
                    }
                }

                // Se houver itens de hoje, usa eles.
                // Caso contrário, usa os ignorados.
                var itensSelecionados = itensHoje.length > 0
                    ? itensHoje
                    : itensIgnorados;

                // Agrupa itens por SPECIALPROJECT
                var grupos = {};

                for (var i = 0; i < itensSelecionados.length; i++) {
                    var item = itensSelecionados[i];
                    var sp = obterValor(item, 'SPECIALPROJECT') || '_default';

                    if (!grupos[sp]) {
                        grupos[sp] = [];
                    }

                    grupos[sp].push(item);
                }

                console.log('Itens de hoje:', itensHoje.length);
                console.log('Itens ignorados:', itensIgnorados.length);
                console.log('Usando:', itensSelecionados.length);
                console.log('Grupos:', grupos);

            // Array de chaves SP ordenadas para rotação consistente
            var spKeys = Object.keys(grupos).sort();
            if (spKeys.length === 0) {
                console.log('[placar_futebol] Nenhum grupo SPECIALPROJECT encontrado');
                loader.finished();
                return;
            }

            var now = new Date();
            var dDia = now.getDate();
            var dMes = now.getMonth() + 1;
            var dAno = now.getFullYear();
            var hojeDateStr = dAno + '-' + (dMes < 10 ? '0' + dMes : dMes) + '-' + (dDia < 10 ? '0' + dDia : dDia);

            var spDates = {};
            var loadedCount = 0;

            function processarSpKeys() {
                var spToday = [];
                for (var i = 0; i < spKeys.length; i++) {
                    var sp = spKeys[i];
                    var dt = spDates[sp];
                    if (dt && dt.indexOf(hojeDateStr) === 0) {
                        spToday.push(sp);
                    }
                }

                var activeSpKeys = spToday.length > 0 ? spToday : spKeys;

                // Recupera estado de rotação do localStorage (com proteção para Android 7)
                var lsKeySpIdx = spToday.length > 0 ? LS_KEY_SP_IDX + '_today' : LS_KEY_SP_IDX;
                var spIdx = 0;
                try {
                    var storedSpIdx = localStorage.getItem(lsKeySpIdx);
                    spIdx = parseInt(storedSpIdx, 10);
                } catch (e) { spIdx = 0; }
                if (isNaN(spIdx) || spIdx >= activeSpKeys.length) { spIdx = 0; }

                var itemIndices = {};
                try {
                    var storedItems = localStorage.getItem(LS_KEY_SP_ITEMS);
                    itemIndices = JSON.parse(storedItems) || {};
                } catch (e) { itemIndices = {}; }

                // Seleciona o grupo (SPECIALPROJECT) atual
                var spAtual = activeSpKeys[spIdx];
                var itensGrupo = grupos[spAtual];

                // Seleciona o item dentro do grupo
                var itemIdx = 0;
                try {
                    var storedItemIdx = itemIndices[spAtual];
                    itemIdx = parseInt(storedItemIdx, 10);
                } catch (e) { itemIdx = 0; }
                if (isNaN(itemIdx) || itemIdx >= itensGrupo.length) { itemIdx = 0; }

                var spdData = itensGrupo[itemIdx];

                // Avança o índice do item para próxima vez que este SP for chamado
                itemIndices[spAtual] = (itemIdx + 1) % itensGrupo.length;

                // Avança o índice do SP para o próximo grupo
                var proximoSpIdx = (spIdx + 1) % activeSpKeys.length;

                // Salva no localStorage (com proteção)
                try {
                    localStorage.setItem(lsKeySpIdx, proximoSpIdx);
                    localStorage.setItem(LS_KEY_SP_ITEMS, JSON.stringify(itemIndices));
                } catch (e) {
                    console.log('[placar_futebol] localStorage indisponível — rotação não persistida');
                }

                console.log('[placar_futebol] SP=' + spAtual + ' itemIdx=' + itemIdx + '/' + itensGrupo.length
                    + ' | próximo SP idx=' + proximoSpIdx + '/' + activeSpKeys.length + ' | Modo: ' + (spToday.length > 0 ? 'HOJE' : 'TODOS'));

                var partidaId = obterValor(spdData, 'TITLE').trim();
                console.log('[placar_futebol] D_SPD: TITLE=' + partidaId
                    + ' | Times: ' + obterValor(spdData, 'TEXT1') + ' x ' + obterValor(spdData, 'TEXT2'));

                if (!partidaId) {
                    console.log('[placar_futebol] TITLE vazio — skip');
                    loader.finished();
                    return;
                }

                // ══════════════════════════════════════════════════
                // STANDINGS MODE: quando TITLE='STANDINGS', exibe classificação
                // ══════════════════════════════════════════════════
                if (partidaId.toUpperCase() === 'STANDINGS') {
                    console.log('[placar_futebol] Modo STANDINGS detectado');
                    // Busca patrocinador e depois carrega standings
                    ebhtml.create2({}, function(loaderSponsor) {
                        loaderSponsor.addData('D_SPD', false, 'f_config=1&f_specialproject=' + spAtual);
                        loaderSponsor.autoloaded = false;
                        loaderSponsor.nodataiserror = false;

                        loaderSponsor.load(function() {
                            var spdSponsor = null;
                            var sponsorData = loaderSponsor.data('D_SPD');
                            if (sponsorData) { spdSponsor = sponsorData; }
                            iniciarStandings(spdData, spdSponsor, loader);
                        });
                    });
                    return;
                }

                // Segunda fase: busca patrocinador (CONFIG=1) do mesmo SPECIALPROJECT
                ebhtml.create2({}, function(loaderSponsor) {
                    loaderSponsor.addData('D_SPD', false, 'f_config=1&f_specialproject=' + spAtual);
                    loaderSponsor.autoloaded = false;
                    loaderSponsor.nodataiserror = false;

                    loaderSponsor.load(function() {
                        var spdSponsor = null;
                        var sponsorData = loaderSponsor.data('D_SPD');
                        console.log('[placar_futebol] D_SPD config=1 sp=' + spAtual + ' resultado:', sponsorData ? 'encontrado' : 'NULL');
                        if (sponsorData) {
                            spdSponsor = sponsorData;
                        }

                        // Terceira fase: D_FOOTBALL filtrado pelo ID da partida
                        ebhtml.create2({}, function(loader2) {
                            loader2.addData('D_FOOTBALL', false, 'f_titulo=' + partidaId);
                            loader2.autoloaded = false;
                            loader2.nodataiserror = false;

                            loader2.load(function() {
                                var footballData = loader2.data('D_FOOTBALL');

                                if (!footballData) {
                                    console.log('[placar_futebol] D_FOOTBALL sem dados para ID=' + partidaId);
                                    loader.finished();
                                    return;
                                }

                                console.log('[placar_futebol] D_FOOTBALL TEXTO:', obterValor(footballData, 'TEXTO'));

                                // Quarta fase: busca dados dos times em D_FOOTBALL_TEAMS
                                var matchInfo = parseTexto2(obterValor(footballData, 'TEXTO2'));
                                var homeId = matchInfo.homeId;
                                var awayId = matchInfo.awayId;

                                var teamHome = null;
                                var teamAway = null;
                                var teamsLoaded = 0;
                                var teamsExpected = 0;

                                function onTeamLoaded() {
                                    teamsLoaded++;
                                    if (teamsLoaded >= teamsExpected) {
                                        processarDados(spdData, spdSponsor, footballData, teamHome, teamAway, loader);
                                    }
                                }

                                if (homeId) { teamsExpected++; }
                                if (awayId) { teamsExpected++; }
                                if (teamsExpected === 0) {
                                    processarDados(spdData, spdSponsor, footballData, null, null, loader);
                                    return;
                                }

                                if (homeId) {
                                    ebhtml.create2({}, function(loaderHome) {
                                        loaderHome.addData('D_FOOTBALL_TEAMS', false, 'f_titulo=' + homeId);
                                        loaderHome.autoloaded = false;
                                        loaderHome.nodataiserror = false;
                                        loaderHome.load(function() {
                                            teamHome = loaderHome.data('D_FOOTBALL_TEAMS');
                                            onTeamLoaded();
                                        });
                                    });
                                }

                                if (awayId) {
                                    ebhtml.create2({}, function(loaderAway) {
                                        loaderAway.addData('D_FOOTBALL_TEAMS', false, 'f_titulo=' + awayId);
                                        loaderAway.autoloaded = false;
                                        loaderAway.nodataiserror = false;
                                        loaderAway.load(function() {
                                            teamAway = loaderAway.data('D_FOOTBALL_TEAMS');
                                            onTeamLoaded();
                                        });
                                    });
                                }
                            });
                        });
                    });
                });
            }

            for (var i = 0; i < spKeys.length; i++) {
                (function(sp) {
                    var pId = obterValor(grupos[sp][0], 'TITLE').trim();
                    if (pId.toUpperCase() === 'STANDINGS' || !pId) {
                        spDates[sp] = '';
                        loadedCount++;
                        if (loadedCount === spKeys.length) processarSpKeys();
                        return;
                    }

                    ebhtml.create2({}, function(ldr) {
                        ldr.addData('D_FOOTBALL', false, 'f_titulo=' + pId);
                        ldr.autoloaded = false;
                        ldr.nodataiserror = false;
                        ldr.load(function() {
                            var fb = ldr.data('D_FOOTBALL');
                            if (fb) {
                                spDates[sp] = obterValor(fb, 'DATE') || '';
                            } else {
                                spDates[sp] = '';
                            }
                            loadedCount++;
                            if (loadedCount === spKeys.length) processarSpKeys();
                        });
                    });
                })(spKeys[i]);
            }
        });
    });
}

/* ====================================================
   PARSE DO JSON EM TEXTO2 (API-Football response)
   Extrai nomes, escudos, estádio, gols, pênaltis, tempo
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
        console.error('[placar_futebol] Erro ao parsear TEXTO2:', e);
        return result;
    }
}

/* ====================================================
   PROCESSA OS DADOS E RENDERIZA
   spdData, spdSponsor, footballData já resolvidos;
   loader (D_SPD) controla a playlist.
   ==================================================== */
function processarDados(spdData, spdSponsor, footballData, teamHome, teamAway, loader) {

    // Parse do JSON da API-Football em TEXTO2
    var matchInfo = parseTexto2(obterValor(footballData, 'TEXTO2'));
    var statusBase = obterValor(footballData, 'TEXTO5');
    var estado = determinarEstado(statusBase);

    var dtFormatada = formatarDataHora(obterValor(footballData, 'DATE'));

    // Todos os dados ao vivo vêm do D_FOOTBALL (TEXTO2 / TEXTO5)
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

    var teamHomePath = teamHomeExiste
        ? 'img/flags/' + obterValor(teamHome, 'TITULO') + '.png'
        : (homeId ? 'img/flags/' + homeId + '.png' : '');

    var teamAwayPath = teamAwayExiste
        ? 'img/flags/' + obterValor(teamAway, 'TITULO') + '.png'
        : (awayId ? 'img/flags/' + awayId + '.png' : '');

    console.log('[placar_futebol] Verificando logos locais:', teamHomePath, teamAwayPath);

    verificarImagem(teamHomePath, function(existeHome) {

        verificarImagem(teamAwayPath, function(existeAway) {

            // Nomes dos times
            var nomeHome = teamHome
                ? obterValor(teamHome, 'TEXTO2')
                : matchInfo.homeTeam;

            var nomeAway = teamAway
                ? obterValor(teamAway, 'TEXTO2')
                : matchInfo.awayTeam;

            // Prioridade:
            // 1. Logo local
            // 2. D_FOOTBALL_TEAMS.FOTO
            // 3. D_FOOTBALL.FOTO/FOTO2
            // 4. Logo da API em TEXTO2
            var logoHome =
                (existeHome ? teamHomePath : '') ||
                (teamHome && obterValor(teamHome, 'FOTO')) ||
                obterValor(footballData, 'FOTO') ||
                matchInfo.homeLogo;

            var logoAway =
                (existeAway ? teamAwayPath : '') ||
                (teamAway && obterValor(teamAway, 'FOTO')) ||
                obterValor(footballData, 'FOTO2') ||
                matchInfo.awayLogo;

            var dados = {
                time1: nomeHome,
                time2: nomeAway,
                estadio: matchInfo.venue,
                rodada: traduzirFase(obterValor(footballData, 'TEXTO4')),
                torneio: obterValor(footballData, 'CATEGORY') === 'Copa do Mundo'
                    ? 'O Mundo em Campo 2026'
                    : obterValor(footballData, 'CATEGORY'),
                hora: dtFormatada.hora,
                data: dtFormatada.data,
                foto1: logoHome,
                foto2: logoAway,
                estado: estado,
                statusRaw: statusBase.toUpperCase().trim(),
                gols1: gols1,
                gols2: gols2,
                pen1: pen1,
                pen2: pen2,
                tempo: tempo,
                tempoExtra: tempoExtra,
                patroFrase: spdSponsor ? obterValor(spdSponsor, 'TEXT1') : '',
                patroLogo: spdSponsor ? obterValor(spdSponsor, 'IMAGE_LOGO') : '',
                introMedia: spdSponsor ? obterValor(spdSponsor, 'FILE_IMAGE1') : '',
                introMs: spdSponsor && obterValor(spdSponsor, 'TEXT2')
                    ? parseInt(obterValor(spdSponsor, 'TEXT2'), 10) * 1000
                    : INTRO_MAX_MS
            };

            // Cores
            var cor1 = spdSponsor ? obterValor(spdSponsor, 'COLOR1') : '';
            var cor2 = spdSponsor ? obterValor(spdSponsor, 'COLOR2') : '';
            var cor3 = spdSponsor ? obterValor(spdSponsor, 'COLOR3') : '';

            if (cor1 && cor1.charAt(0) !== '#') { cor1 = '#' + cor1; }
            if (cor2 && cor2.charAt(0) !== '#') { cor2 = '#' + cor2; }
            if (cor3 && cor3.charAt(0) !== '#') { cor3 = '#' + cor3; }

            var cfgCores = {
                corDestaque: cor2 || CONFIG.corDestaque,
                corEscura: cor1 || CONFIG.corEscura,
                corClara: cor3 || CONFIG.corClara
            };

            console.log(
                '[placar_futebol] logos:',
                '\nHome:', logoHome,
                '\nAway:', logoAway
            );

            aplicarCores(cfgCores);

            console.log(
                '[placar_futebol] >>> Exibindo: ' +
                dados.time1 + ' x ' + dados.time2 +
                ' | ' + dados.torneio +
                ' | Estado: ' + dados.estado +
                ' (' + dados.statusRaw + ')' +
                ' | Placar: ' + dados.gols1 + 'x' + dados.gols2
            );

            renderizarTemplate(dados, loader);
        });
    });
}

function verificarImagem(url, callback) {
    if (!url) {
        callback(false);
        return;
    }

    var img = new Image();

    img.onload = function() {
        callback(true);
    };

    img.onerror = function() {
        callback(false);
    };

    img.src = url;
}

/* ====================================================
   BUSCA ITEM DE PATROCINADOR EM D_SPD
   CONFIG === '1'
   ==================================================== */
function buscarSpdSponsor(loader) {
    var lista = loader.datalist('D_SPD');
    if (!lista || lista.count() === 0) { return null; }
    for (var i = 0; i < lista.count(); i++) {
        var item = lista.get(i);
        if (obterValor(item, 'CONFIG') === '1') {
            return item;
        }
    }
    return null;
}

/* ====================================================
   DETERMINA O ESTADO VISUAL DO JOGO
   Retorna: 'pre_jogo' | 'ao_vivo' | 'encerrado' | 'penalties'
   ==================================================== */
function determinarEstado(statusBase) {
    var status = (statusBase || '').toUpperCase().trim();

    // Encerrado com pênaltis
    if (status === 'PEN') {
        return 'penalties';
    }
    // Encerrado (tempo normal, prorrogação, abandono)
    if (status === 'FT' || status === 'AET' || status === 'FT_PEN' || status === 'ABD' || status === 'AWD' || status === 'WO') {
        return 'encerrado';
    }
    // Em andamento (todos os estados "in play")
    if (status === '1H' || status === '2H' || status === 'HT' ||
        status === 'ET' || status === 'BT' || status === 'P'  ||
        status === 'SUSP' || status === 'INT' || status === 'LIVE') {
        return 'ao_vivo';
    }

    if (status === 'PST'){
        return 'adiado';
    }

    if (status === 'CANC'){
        return 'cancelado';
    }
    // Demais: NS, TBD, etc. → pré-jogo
    return 'pre_jogo';
}

/* ====================================================
   FORMATA '2025-07-08 12:00:00' -> { hora:'12:00', data:'08/07' }
   ==================================================== */
function formatarDataHora(dateStr) {
    if (!dateStr) {
        return { hora: '--:--', data: '-- / --' };
    }
    var partes = dateStr.trim().split(' ');
    var dp = (partes[0] || '').split('-');   // ['2025','07','08']
    var hp = (partes[1] || '').split(':');   // ['12','00','00']

    var dia = dp[2] || '--';
    var mes = dp[1] || '--';
    var hora  = (hp[0] || '--');
    var min   = (hp[1] || '00');

    return {
        hora: hora + ':' + min,
        data: dia + '/' + mes
    };
}

/* ====================================================
   DESTAQUE PRÉ-JOGO — pulse-win em hora e data
   ==================================================== */
function aplicarDestaquePrejogo() {
    var GLOW_CLASS = 'animate-pulse-glow';
    var horaEl = document.querySelector('#hora');
    var dataEl = document.querySelector('#data');
    if (horaEl) { horaEl.classList.add(GLOW_CLASS); }
    if (dataEl) { dataEl.classList.add(GLOW_CLASS); }
}

/* ====================================================
   DESTAQUE DO VENCEDOR — pulse-win em escudo, nome e gol
   Empate = sem destaque
   ==================================================== */
function aplicarDestaqueVencedor(dados) {
    // Decide quais placares comparar
    var a, b;
    if (dados.estado === 'penalties' && dados.pen1 !== '' && dados.pen2 !== '') {
        a = parseInt(dados.pen1, 10) || 0;
        b = parseInt(dados.pen2, 10) || 0;
    } else {
        a = parseInt(dados.gols1, 10) || 0;
        b = parseInt(dados.gols2, 10) || 0;
    }

    if (a === b) { return; } // empate — nenhum destaque

    var vencedor = (a > b) ? 1 : 2;

    var nomeEl    = document.querySelector(vencedor === 1 ? '#time1Nome'      : '#time2Nome');
    var logoEl    = document.querySelector(vencedor === 1 ? '#logo1Container' : '#logo2Container');
    var golEl     = document.querySelector(vencedor === 1 ? '#gols1Placar'    : '#gols2Placar');

    var WIN_CLASS  = 'animate-pulse-win';
    var GLOW_CLASS = 'animate-pulse-glow';

    if (nomeEl) { nomeEl.classList.add(GLOW_CLASS); }
    if (logoEl) { logoEl.classList.add(WIN_CLASS); }
    if (golEl)  { golEl.classList.add(GLOW_CLASS);  }
}

/* ====================================================
   HELPER: acessa campo em item mock (obj plano) ou EdgeContents
   ==================================================== */
function obterValor(item, campo) {
    if (!item) { return ''; }

    // Mock: objeto JS puro com propriedades diretas
    if (Object.prototype.hasOwnProperty.call(item, campo)) {
        return String(item[campo] !== null ? item[campo] : '').trim();
    }

    // EdgeContents: item.value('CAMPO').value
    if (typeof item.value === 'function') {
        try {
            var v = item.value(campo);
            return v ? String(v.value !== null ? v.value : '').trim() : '';
        } catch (e) {
            return '';
        }
    }

    return '';
}

/* ====================================================
   RENDERIZA O TEMPLATE
   ==================================================== */
function renderizarTemplate(dados, loader) {

    // --- Textos sempre visíveis ---
    document.querySelector('#time1Nome').innerHTML   = dados.time1;
    document.querySelector('#time2Nome').innerHTML   = dados.time2;
    document.querySelector('#torneio').innerHTML       = dados.torneio;
    document.querySelector('#rodada').innerHTML        = dados.rodada;
    document.querySelector('#estadioCentro').innerHTML = dados.estadio;
    document.querySelector('#hora').innerHTML        = dados.hora;
    document.querySelector('#data').innerHTML        = dados.data;

    // --- Lógica de estado ---
    var mostrarPlacar = (dados.estado !== 'pre_jogo' && dados.estado !== 'adiado' && dados.estado !== 'cancelado');

     loader.loaded();


    if (mostrarPlacar) {

        // Ocultar bloco de pré-jogo
        document.querySelector('#preGameInfo').classList.add('hidden');

        // Exibir seção de placar
        var scoreSection = document.querySelector('#scoreSection');
        scoreSection.classList.remove('hidden');

        document.querySelector('#placar').innerHTML =
            '<span id="gols1Placar">' + dados.gols1 + '</span>' +
            '<span class="text-white/30 mx-[0.15em] text-[50%]"> x </span>' +
            '<span id="gols2Placar">' + dados.gols2 + '</span>';
        document.querySelector('#horaSmall').innerHTML = dados.hora + ' · ' + dados.data;

        // Indicador de tempo / status
        var statusLabel = STATUS_LABEL[dados.statusRaw] || dados.statusRaw || '';
        var tempoStr = '';

        if (dados.estado === 'ao_vivo') {
            // Tempo em minutos, se disponível
            if (dados.tempo && dados.tempo !== '0' && dados.tempo !== '') {
                tempoStr = dados.tempo + "'";
                if (dados.tempoExtra && dados.tempoExtra !== '0' && dados.tempoExtra !== '') {
                    tempoStr = tempoStr + ' +' + dados.tempoExtra + "'";
                }
                tempoStr = tempoStr + ' · ' + statusLabel;
            } else {
                tempoStr = statusLabel;
            }
        } else {
            // Encerrado, pênaltis, suspenso, etc.
            tempoStr = statusLabel;
        }

        if (tempoStr) {
            var tempoSection = document.querySelector('#tempoSection');
            tempoSection.classList.remove('hidden');
            document.querySelector('#tempo').innerHTML = tempoStr;
        }

        // Pênaltis
        if (dados.estado === 'penalties' && dados.pen1 !== '' && dados.pen2 !== '') {
            var penSection = document.querySelector('#penaltySection');
            penSection.classList.remove('hidden');
            document.querySelector('#penPlacar').innerHTML =
                '(resultado: ' + dados.pen1 + ' x ' + dados.pen2 + ')';
        }
    }
    else{
        var scoreSection = document.querySelector('#scoreSection');
        scoreSection.classList.remove('hidden');
        var tempoStr = '';
        if (dados.estado == 'adiado' || dados.estado == 'cancelado'){
            tempoStr = STATUS_LABEL[dados.statusRaw]
        
            console.log(tempoStr);
            var tempoSection = document.querySelector('#tempoSection');
            tempoSection.classList.remove('hidden');
            document.querySelector('#tempo').innerHTML = tempoStr;
        }
    }

    // --- Vídeo de fundo conforme estado ---
    var videoSrc;
    if (dados.estado === 'encerrado' || dados.estado === 'penalties') {
        videoSrc = 'img/pos.mp4';
    } else if (dados.estado === 'ao_vivo') {
        videoSrc = 'img/live.mp4';
    } else {
        videoSrc = 'img/pre.mp4';
    }
    var bgVideo = document.querySelector('#bgVideo');
    if (bgVideo) {
        // Verifica suporte a MP4 uma única vez (diagnóstico WebEngine: "não")
        var suportaVideo = false;
        try {
            suportaVideo = bgVideo.canPlayType && bgVideo.canPlayType('video/mp4') !== '';
        } catch (e) {
            suportaVideo = false;
        }

        if (!suportaVideo) {
            // Sempre aplica fallback se não suportar MP4 (pré-jogo, ao vivo, pós-jogo, standings)
            aplicarFallbackVideo(bgVideo);
        } else if (bgVideo.src.indexOf(videoSrc) === -1) {
            // Suporta vídeo: troca src normalmente
            bgVideo.style.display = 'block';
            var fallbackImg = document.querySelector('#bgFallback');
            if (fallbackImg) { fallbackImg.style.display = 'none'; }
            bgVideo.src = videoSrc;
            bgVideo.load();
            bgVideo.play();
        }
    }

    // --- Destaque do vencedor ou do horário (pré-jogo) ---
    if (dados.estado === 'pre_jogo') {
        aplicarDestaquePrejogo();
    } else {
        aplicarDestaqueVencedor(dados);
    }

    // --- Escudos ---
    var logo1          = document.querySelector('#logo1');
    var logo2          = document.querySelector('#logo2');
    var logo1Container = document.querySelector('#logo1Container');
    var logo2Container = document.querySelector('#logo2Container');

    var escudosProntos = false;
    var introFeita     = !dados.introMedia; // sem intro = já concluída
    var introActualMs  = 0;   // tempo real da intro (medido em ms)
    var introStartTime = 0;   // timestamp de início da intro
    var loadedCount    = 0;

    // Revela o placar após intro E escudos estarem prontos
    function revelarPlacar() {
        esconderIntro(function() {

            // Preparar elementos para animação
            var headerEl  = document.querySelector('header');
            var footerEl  = document.querySelector('#sponsorFooter');
            var team1El   = document.querySelector('#team1');
            var team2El   = document.querySelector('#team2');
            var centerEl  = document.querySelector('#centerContent');

            // Aplicar delays escalonados (fill-mode: both → from-state durante delay)
            headerEl.style.animationDelay  = '0s';
            footerEl.style.animationDelay  = '0s';
            team1El.style.animationDelay   = '0.15s';
            team2El.style.animationDelay   = '0.15s';
            centerEl.style.animationDelay  = '0.35s';

            // Adicionar classes de animação
            headerEl.classList.add('animate-slide-in-top');
            if (!footerEl.classList.contains('hidden')) {
                footerEl.classList.add('animate-slide-in-bottom');
            }
            team1El.classList.add('animate-slide-in-left');
            team2El.classList.add('animate-slide-in-right');
            centerEl.classList.add('animate-fade-in');

            // Revelar <main>, bgVideo e gradiente — transição opacity 700ms
            var mainEl = document.querySelector('#mainContent');
            mainEl.classList.remove('opacity-0');
            mainEl.classList.add('opacity-100');

            var bgVideoEl = document.querySelector('#bgVideo');
            if (bgVideoEl) { bgVideoEl.classList.remove('opacity-0'); bgVideoEl.classList.add('opacity-100'); }

            var gradEl = document.querySelector('#gradientOverlay');
            if (gradEl) { gradEl.classList.remove('opacity-0'); gradEl.classList.add('opacity-50'); }

           
            // placar fica visível pelo tempo restante até completar DURACAO_TOTAL
            var placarMs = Math.max(DURACAO_TOTAL - introActualMs, 1000);
            console.log('[placar_futebol] intro=' + introActualMs + 'ms placar=' + placarMs + 'ms total=' + (introActualMs + placarMs) + 'ms');
            setTimeout(function() {
                loader.finished();
            }, placarMs);
        });
    }

    function verificarPronto() {
        if (introFeita && escudosProntos) {
            revelarPlacar();
        }
    }

    function onEscudoPronto() {
        loadedCount++;
        if (loadedCount >= 2) {
            escudosProntos = true;
            verificarPronto();
        }
    }

    function carregarEscudo(imgEl, containerEl, url) {
        if (!url) {
            containerEl.innerHTML = SVG_ESCUDO;
            onEscudoPronto();
            return;
        }
        imgEl.onload = function() {
            onEscudoPronto();
        };
        imgEl.onerror = function() {
            containerEl.innerHTML = SVG_ESCUDO;
            onEscudoPronto();
        };
        imgEl.src = url;
    }

    // --- Intro / abertura (exibida antes do placar) ---
    var introMaxMs = dados.introMs || INTRO_MAX_MS;
    if (dados.introMedia) {
        introStartTime = Date.now();
        mostrarIntro(dados.introMedia, introMaxMs, function() {
            introActualMs = Math.min(Date.now() - introStartTime, introMaxMs);
            introFeita = true;
            verificarPronto();
        });
    }

    // --- Patrocinador ---
    var sponsorFooterEl = document.querySelector('#sponsorFooter');
    if (dados.patroFrase || dados.patroLogo) {
        sponsorFooterEl.classList.remove('hidden');
        document.querySelector('#sponsorFrase').innerHTML = dados.patroFrase || '';
        var sponsorLogoEl = document.querySelector('#sponsorLogo');
        if (dados.patroLogo) {
            sponsorLogoEl.src = dados.patroLogo;
            sponsorLogoEl.classList.remove('hidden');
        } else {
            sponsorLogoEl.classList.add('hidden');
        }
    } else {
        sponsorFooterEl.classList.add('hidden');
    }

    carregarEscudo(logo1, logo1Container, dados.foto1);
    carregarEscudo(logo2, logo2Container, dados.foto2);
}

/* ====================================================
   NORMALIZA URL DE ARQUIVO DO EDGECONTENTS
   O XML retorna caminhos locais no formato:
     file:///C:/edgeContents-DEMO/clientwork/files/f_2457.bin.mp4
   Padrão do nome: f_ID.bin.ext  → extrai o ID numérico
   O servidor HTTP serve esses arquivos em:
     http://127.0.0.1:13199/FILES/ID
   ==================================================== */
var CONTENT_FILES_HOST = (window.location.protocol === 'https:' ? 'https:' : 'http:') + '//127.0.0.1:13199';

function normalizarUrlMidia(url) {
    if (!url) { return url; }
    url = url.trim();

    if (url.indexOf('file:///') === 0 || url.indexOf('file://') === 0) {
        // Extrai o nome do arquivo: "f_2457.bin.mp4"
        var partes = url.replace(/\\/g, '/').split('/');
        var nomeArquivo = partes[partes.length - 1];
        // Extrai ID numérico do padrão f_NNNN.bin.ext
        var mId = nomeArquivo.match(/^f_(\d+)\./);
        if (mId) {
            return CONTENT_FILES_HOST + '/FILES/' + mId[1];
        }
        // Fallback: usa o nome do arquivo como está
        return CONTENT_FILES_HOST + '/FILES/' + nomeArquivo;
    }

    return url;
}

/* Retorna true se a URL original (antes de normalizar) aponta para vídeo */
function isUrlVideo(url) {
    if (!url) { return false; }
    return /\.(mp4|webm|mov|avi|ogv|ogg)(\?.*)?$/i.test(url.trim());
}

/* ====================================================
   INTRO — exibe imagem ou vídeo fullscreen antes do placar
   url: campo FILE_IMAGE1 do item CONFIG=1 do D_SPD
   onDone: callback chamado quando a intro terminar
   ==================================================== */
function mostrarIntro(url, maxMs, onDone) {
    var introEl = document.querySelector('#introScreen');
    if (!introEl) { onDone(); return; }

    introEl.style.position = 'fixed';
    introEl.style.top = '0';
    introEl.style.left = '0';
    introEl.style.width = '100%';
    introEl.style.height = '100%';
    introEl.style.zIndex = '999999';
    introEl.style.background = 'black';

    var isVideo = isUrlVideo(url);
    url = normalizarUrlMidia(url);

    // Verifica suporte real a MP4 (diagnóstico: canPlayType pode retornar vazio mesmo com URL .mp4)
    if (isVideo) {
        try {
            var tempVid = document.createElement('video');
            var canPlayMp4 = tempVid.canPlayType && tempVid.canPlayType('video/mp4') !== '';
            if (!canPlayMp4) {
                isVideo = false; // força fallback para <img> usando a mesma URL (ou imagem estática fornecida pelo patrocinador)
            }
        } catch (e) {
            isVideo = false;
        }
    }

    introEl.innerHTML = '';
    introEl.classList.add('active');
    introEl.classList.remove('hidden');

    // fallback global de segurança
    var done = false;
    function finish() {
        if (done) return;
        done = true;
        onDone();
    }

    var timer = setTimeout(function () {
        console.log('[intro] timeout global');
        finish();
    }, maxMs);

    if (isVideo) {
        var vid = document.createElement('video');

        vid.className = 'w-full h-full object-cover';

        // Compatibilidade máxima (TV/WebView antigo)
        vid.setAttribute('playsinline', 'true');
        vid.setAttribute('webkit-playsinline', 'true');
        vid.muted = true;
        vid.autoplay = true;
        vid.loop = false;

        // importante para alguns WebViews antigos
        vid.preload = 'auto';

        introEl.appendChild(vid);

        function safeFinish(reason) {
            console.log('[intro-video] finish:', reason);
            clearTimeout(timer);
            finish();
        }

        // Eventos mínimos e seguros
        vid.addEventListener('ended', function () {
            safeFinish('ended');
        });

        vid.addEventListener('error', function () {
            safeFinish('error');
        });

        vid.addEventListener('abort', function () {
            safeFinish('abort');
        });

        // fallback para travamento de decode (TVs antigas travam muito aqui)
        var watchdog = setInterval(function () {
            if (vid.ended) {
                clearInterval(watchdog);
                safeFinish('watchdog-ended');
            }
        }, 500);

        // PLAY FORÇADO (sem Promise, sem then/catch)
        function tryPlay() {
            try {
                var p = vid.play();
                // Chrome novo retorna Promise, antigo não
                if (p && typeof p.then === 'function') {
                    p.then(function () {}, function () {
                        // fallback silencioso
                    });
                }
            } catch (e) {
                console.log('[intro-video] play exception');
            }
        }

        vid.src = url;

        // Ordem importante para WebView antigo
        try {
            vid.load();
        } catch (e) {}

        // tentativa imediata + fallback delay (TVs precisam disso)
        tryPlay();

        setTimeout(tryPlay, 200);
        setTimeout(tryPlay, 800);

    } else {
        var img = document.createElement('img');
        img.className = 'w-full h-full object-cover';

        img.onload = function () {
            clearTimeout(timer);
            setTimeout(finish, maxMs);
        };

        img.onerror = function () {
            clearTimeout(timer);
            finish();
        };

        introEl.appendChild(img);
        img.src = url;
    }
}

function esconderIntro(onDone) {
    var introEl = document.querySelector('#introScreen');
    if (!introEl || introEl.classList.contains('hidden')) {
        if (onDone) { onDone(); }
        return;
    }
    introEl.style.opacity = '0';
    setTimeout(function() {
        introEl.classList.add('hidden');
        introEl.innerHTML = '';
        if (onDone) { onDone(); }
    }, 700);
}


/* ════════════════════════════════════════════════════════════════════════
   STANDINGS MODE — Classificação de Grupos
   ════════════════════════════════════════════════════════════════════════ */

var LS_KEY_STANDINGS_GRUPO = 'placar_futebol_standings_grupo_idx';
var STANDINGS_DURACAO_MS = 10000;
var STANDINGS_CONTEUDO_MS = 5000;

/**
 * Ponto de entrada do modo STANDINGS.
 * Carrega D_FOOTBALL_STANDINGS (1 item por vez, plataforma rotaciona),
 * D_FOOTBALL_TEAMS e D_FOOTBALL via XHR para cross-reference.
 */
function iniciarStandings(spdData, spdSponsor, loader) {

    // Aplica cores do sponsor
    var cor1 = spdSponsor ? obterValor(spdSponsor, 'COLOR1') : '';
    var cor2 = spdSponsor ? obterValor(spdSponsor, 'COLOR2') : '';
    var cor3 = spdSponsor ? obterValor(spdSponsor, 'COLOR3') : '';
    if (cor1 && cor1.charAt(0) !== '#') { cor1 = '#' + cor1; }
    if (cor2 && cor2.charAt(0) !== '#') { cor2 = '#' + cor2; }
    if (cor3 && cor3.charAt(0) !== '#') { cor3 = '#' + cor3; }
    var cfgCores = {
        corDestaque: cor2 || CONFIG.corDestaque,
        corEscura:   cor1 || CONFIG.corEscura,
        corClara:    cor3 || CONFIG.corClara
    };
    aplicarCores(cfgCores);

    // 1) Buscar D_FOOTBALL_STANDINGS (plataforma entrega 1 item por vez, rotaciona automaticamente)
    ebhtml.create2({}, function(loaderStandings) {
        // loaderStandings.addData('D_FOOTBALL_STANDINGS', false, 'f_texto3=Ranking of third-placed teams');
        loaderStandings.addData('D_FOOTBALL_STANDINGS', false, 'order=ID&orderkind=A');
        loaderStandings.autoloaded = false;
        loaderStandings.nodataiserror = false;

        loaderStandings.load(function() {
            var standingsItem = loaderStandings.data('D_FOOTBALL_STANDINGS');
            if (!standingsItem) {
                console.error('[standings] D_FOOTBALL_STANDINGS sem dados');
                loader.finished();
                return;
            }

            // Parse do TEXTO2: array JSON com standings de um grupo
            var texto2 = obterValor(standingsItem, 'TEXTO2');
            var standingsData = [];
            try {
                var parsed = JSON.parse(texto2);
                if (Array.isArray(parsed)) {
                    standingsData = parsed;
                }
            } catch (e) {
                console.error('[standings] Erro ao parsear TEXTO2:', e);
            }

            if (standingsData.length === 0) {
                console.error('[standings] Standings vazio após parse');
                loader.finished();
                return;
            }

            var nomeGrupo = standingsData[0].group || '';
            var isRanking = nomeGrupo.indexOf('Ranking') !== -1;
            console.log('[standings] Grupo recebido: ' + nomeGrupo + ' (' + standingsData.length + ' times)' + (isRanking ? ' [sem jogos]' : ''));

            // Fallback: se Grid não é suportado, marca html com no-grid para CSS alternativo
            try {
                var supportsGrid = (function(){
                    var d = document.createElement('div');
                    d.style.display = 'grid';
                    return d.style.display === 'grid';
                })();
                if (!supportsGrid) { document.documentElement.classList.add('no-grid'); }
            } catch(e) { document.documentElement.classList.add('no-grid'); }

            // 2) Buscar todos os times para cross-reference
            standingsXhrGet('/content/data/D_FOOTBALL_TEAMS?amount=0', function(teamsRaw) {
                var teamsMap = standingsParseTeams(teamsRaw);

                // 3) Se for ranking de terceiros, não busca jogos
                if (isRanking) {
                    var grupo = standingsProcessarUmGrupo(standingsData, teamsMap, []);
                    console.log('[standings] Exibindo: ' + grupo.nome);
                    standingsRenderizar(grupo, spdData, spdSponsor, loader);
                    return;
                }

                // 4) Buscar todos os jogos para associar ao grupo
                standingsXhrGet('/content/data/D_FOOTBALL?amount=0', function(gamesRaw) {
                    var jogosArray = standingsParseGames(gamesRaw);

                    var grupo = standingsProcessarUmGrupo(standingsData, teamsMap, jogosArray);
                    console.log('[standings] Exibindo: ' + grupo.nome);
                    standingsRenderizar(grupo, spdData, spdSponsor, loader);
                });
            });
        });
    });
}

/**
 * XHR genérico para buscar e retornar responseText como string.
 * Faz callback(xmlString) ou callback(null) em caso de erro.
 */
function standingsXhrGet(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) { return; }
        if (xhr.status === 200 || xhr.status === 0) {
            callback(xhr.responseText);
        } else {
            console.error('[standings] HTTP ' + xhr.status + ' em ' + url);
            callback(null);
        }
    };
    xhr.onerror = function() {
        console.error('[standings] Erro de rede em ' + url);
        callback(null);
    };
    xhr.send();
}

/**
 * Parseia XML de D_FOOTBALL_TEAMS.
 * Retorna mapa {teamId: {nome, bandeira, codigo}}
 */
function standingsParseTeams(xmlString) {
    var map = {};
    if (!xmlString) { return map; }
    try {
        var parser = new DOMParser();
        var doc = parser.parseFromString(xmlString, 'text/xml');
        var items = doc.getElementsByTagName('ITEM');
        for (var i = 0; i < items.length; i++) {
            var getTag = function(item, tag) {
                var el = item.getElementsByTagName(tag)[0];
                return el ? el.textContent : '';
            };
            var teamId = getTag(items[i], 'TITULO');
            if (teamId) {
                map[teamId] = {
                    nome: getTag(items[i], 'TEXTO2'),
                    bandeira: getTag(items[i], 'FOTO1'),
                    codigo: getTag(items[i], 'TEXTO3')
                };
            }
        }
    } catch (e) {
        console.error('[standings] Erro ao parsear teams XML:', e);
    }
    return map;
}

/**
 * Parseia XML de D_FOOTBALL.
 * Retorna array de jogos com info básica.
 */
function standingsParseGames(xmlString) {
    var jogos = [];
    if (!xmlString) { return jogos; }
    try {
        var parser = new DOMParser();
        var doc = parser.parseFromString(xmlString, 'text/xml');
        var items = doc.getElementsByTagName('ITEM');
        for (var i = 0; i < items.length; i++) {
            var texto2El = items[i].getElementsByTagName('TEXTO2')[0];
            if (!texto2El) { continue; }
            var fotoEl = items[i].getElementsByTagName('FOTO')[0];
            var foto2El = items[i].getElementsByTagName('FOTO2')[0];
            var fotoHome = fotoEl ? fotoEl.textContent : '';
            var fotoAway = foto2El ? foto2El.textContent : '';
            try {
                var jsonData = JSON.parse(texto2El.textContent);
                if (jsonData.response && jsonData.response.length > 0) {
                    var jogo = jsonData.response[0];
                    jogos.push({
                        fixtureId: jogo.fixture.id,
                        date: jogo.fixture.date,
                        venue: jogo.fixture.venue ? jogo.fixture.venue.name : null,
                        round: jogo.league.round,
                        homeTeam: { id: jogo.teams.home.id, name: jogo.teams.home.name, logo: jogo.teams.home.logo },
                        awayTeam: { id: jogo.teams.away.id, name: jogo.teams.away.name, logo: jogo.teams.away.logo },
                        fotoHome: fotoHome,
                        fotoAway: fotoAway,
                        goalsHome: jogo.goals.home,
                        goalsAway: jogo.goals.away,
                        status: jogo.fixture.status.short
                    });
                }
            } catch (e) { /* skip */ }
        }
    } catch (e) {
        console.error('[standings] Erro ao parsear games XML:', e);
    }
    return jogos;
}

/**
 * Processa standings de UM grupo (já parseado) + teams + jogos.
 * Retorna: {nome, times: [...], jogos: [...]}
 */
function standingsProcessarUmGrupo(standingsData, teamsMap, jogosArray) {
    var nomeGrupo = standingsData[0].group || 'Grupo Desconhecido';
    var grupo = { nome: standingsNormalizarGrupo(nomeGrupo), times: [], jogos: [] };
    var teamIdsNoGrupo = {};

    // Monta mapa de bandeiras a partir dos jogos (FOTO/FOTO2 do D_FOOTBALL)
    var footballFotoMap = {};
    for (var k = 0; k < jogosArray.length; k++) {
        var jg = jogosArray[k];
        var hId = String(jg.homeTeam.id);
        var aId = String(jg.awayTeam.id);

        if (jg.fotoHome && !footballFotoMap[hId]) {
            footballFotoMap[hId] = jg.fotoHome;
        }

        if (jg.fotoAway && !footballFotoMap[aId]) {
            footballFotoMap[aId] = jg.fotoAway;
        }
    }

    for (var i = 0; i < standingsData.length; i++) {
        var item = standingsData[i];
        var teamId = String(item.team.id);

        teamIdsNoGrupo[teamId] = true;

        var teamData = teamsMap[teamId];

        var nomeTime =
            (teamData && teamData.nome)
                ? teamData.nome
                : item.team.name;

        // mesma lógica do placar:
        // 1. img/flags/{id}.png
        // 2. D_FOOTBALL_TEAMS.FOTO1
        // 3. D_FOOTBALL.FOTO/FOTO2
        // 4. logo da API
        var bandeira =
            'img/flags/' + teamId + '.png';

        var goalsDiff = item.goalsDiff || 0;
        var saldoStr = goalsDiff >= 0 ? '+' + goalsDiff : String(goalsDiff);

        grupo.times.push({
            teamId: teamId,
            posicao: item.rank,
            nome: nomeTime,
            bandeira: bandeira,
            bandeiraFallback:
                (teamData && teamData.bandeira) ||
                footballFotoMap[teamId] ||
                (item.team.logo || ''),
            pts: String(item.points || 0),
            pj: String(item.all.played || 0),
            vit: String(item.all.win || 0),
            emp: String(item.all.draw || 0),
            der: String(item.all.lose || 0),
            gm: String(item.all.goals['for'] || 0),
            gc: String(item.all.goals.against || 0),
            sg: saldoStr
        });
    }

    // Associar jogos ao grupo (ambos os times no mesmo grupo)
    for (var j = 0; j < jogosArray.length; j++) {
        var jogo = jogosArray[j];

        var homeId = String(jogo.homeTeam.id);
        var awayId = String(jogo.awayTeam.id);

        if (teamIdsNoGrupo[homeId] && teamIdsNoGrupo[awayId]) {

            var homeData = teamsMap[homeId];
            var awayData = teamsMap[awayId];

            var dtJogo = standingsFormatarData(jogo.date);

            var aoVivo =
                jogo.status === 'LIVE' ||
                jogo.status === '1H' ||
                jogo.status === '2H' ||
                jogo.status === 'HT' ||
                jogo.status === 'ET';

            grupo.jogos.push({
                time1: homeData && homeData.nome ? homeData.nome : jogo.homeTeam.name,
                time2: awayData && awayData.nome ? awayData.nome : jogo.awayTeam.name,

                bandeira1: 'img/flags/' + homeId + '.png',
                bandeira1Fallback:
                    (homeData && homeData.bandeira) ||
                    jogo.fotoHome ||
                    jogo.homeTeam.logo,

                bandeira2: 'img/flags/' + awayId + '.png',
                bandeira2Fallback:
                    (awayData && awayData.bandeira) ||
                    jogo.fotoAway ||
                    jogo.awayTeam.logo,

                gols1: jogo.goalsHome,
                gols2: jogo.goalsAway,
                data: dtJogo.data,
                hora: dtJogo.hora,
                local: jogo.venue,
                ao_vivo: aoVivo
            });
        }
    }

    grupo.times.sort(function(a, b) {
        return a.posicao - b.posicao;
    });

    grupo.jogos.sort(function(a, b) {
        var da = (a.data || '') + (a.hora || '');
        var db = (b.data || '') + (b.hora || '');

        return da < db ? -1 : da > db ? 1 : 0;
    });

    return grupo;
}

function standingsNormalizarGrupo(nome) {
    if (!nome) { return 'Grupo ?'; }
    if (nome.toLowerCase().indexOf('ranking of third') !== -1) { return 'Terceiros Colocados'; }
    if (nome.indexOf('Group ') === 0) { return nome.replace('Group ', 'Grupo '); }
    return nome;
}

function standingsFormatarData(isoDate) {
    if (!isoDate) { return { data: '', hora: '' }; }
    try {
        var d = new Date(isoDate);
        var dia = d.getDate();
        var mes = d.getMonth() + 1;
        var h = d.getHours();
        var m = d.getMinutes();
        return {
            data: (dia < 10 ? '0' + dia : dia) + '/' + (mes < 10 ? '0' + mes : mes),
            hora: (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m)
        };
    } catch (e) { return { data: '', hora: '' }; }
}

/**
 * Renderiza o grupo na UI de standings.
 * Oculta #mainContent, exibe #standingsContent.
 */
function standingsRenderizar(grupo, spdData, spdSponsor, loader) {
    // Oculta view de partida, exibe view de standings
    var mainEl = document.querySelector('#mainContent');
    var standingsEl = document.querySelector('#standingsContent');
    if (mainEl) { mainEl.classList.add('hidden'); }
    standingsEl.classList.remove('hidden');

    loader.loaded();

    // Header
    var torneioText = obterValor(spdData, 'TEXT1') || '';
    if (torneioText.toUpperCase().indexOf('COPA DO MUNDO') !== -1) {
        torneioText = 'O MUNDO EM CAMPO 2026';
    }
    var grupoNomeEl = document.querySelector('#standingsGrupoNome');
    var torneioEl = document.querySelector('#standingsTorneio');
    if (torneioEl) { torneioEl.innerHTML = torneioText; }
    if (grupoNomeEl) { grupoNomeEl.innerHTML = grupo.nome; }

    // Se não tem jogos (ex: Ranking of third-placed teams), esconde card de jogos e expande tabela
    var jogosCard = document.querySelector('#standingsJogos');
    var tabelaCard = document.querySelector('#standingsTabela');
    if (!grupo.jogos || grupo.jogos.length === 0) {
        if (jogosCard) { jogosCard.classList.add('hidden'); }
        if (tabelaCard) { tabelaCard.style.flex = '1'; }
    } else {
        if (jogosCard) { jogosCard.classList.remove('hidden'); }
        if (tabelaCard) { tabelaCard.style.flex = ''; }
    }

    // Tabela de classificação
    var container = document.querySelector('#standingsLinhas');
    var tmpl = document.querySelector('#tmplStandingsLinha');
    container.innerHTML = '';

    for (var i = 0; i < grupo.times.length; i++) {
        var t = grupo.times[i];
        var frag = tmpl.content.cloneNode(true);
        var row = frag.firstElementChild;

        row.querySelector('[data-campo="posicao"]').textContent = t.posicao;
        row.querySelector('[data-campo="nome"]').textContent = t.nome;
        row.querySelector('[data-campo="pts"]').textContent = t.pts;
        row.querySelector('[data-campo="pj"]').textContent = t.pj;
        row.querySelector('[data-campo="vit"]').textContent = t.vit;
        row.querySelector('[data-campo="emp"]').textContent = t.emp;
        row.querySelector('[data-campo="der"]').textContent = t.der;
        row.querySelector('[data-campo="gm"]').textContent = t.gm;
        row.querySelector('[data-campo="gc"]').textContent = t.gc;
        row.querySelector('[data-campo="sg"]').textContent = t.sg;

        // Bandeira
        var bandEl = row.querySelector('[data-campo="bandeira"]');
        if (bandEl) {
            standingsCarregarBandeira(
                bandEl,
                t.bandeira,
                t.bandeiraFallback
            );
        }

        // Classificados ganham destaque:
        // Ranking de terceiros: top 8 | Grupos normais: top 2
        var isRankingView = !grupo.jogos || grupo.jogos.length === 0;
        var limiteClassificados = isRankingView ? 8 : 2;
        if (i < limiteClassificados) { row.classList.add('standings-linha--classificado'); }
        row.style.animationDelay = ((i + 1) * 0.18) + 's';

        container.appendChild(frag);
    }

    // Jogos do grupo
    standingsRenderizarJogos(grupo.jogos);

    // Sponsor
    standingsAplicarSponsor(spdSponsor);

    // Intro + timing
    var introMedia = spdSponsor ? obterValor(spdSponsor, 'FILE_IMAGE1') : '';
    var introMaxMs = spdSponsor && obterValor(spdSponsor, 'TEXT2')
        ? parseInt(obterValor(spdSponsor, 'TEXT2'), 10) * 1000
        : INTRO_MAX_MS;

    if (introMedia) {
        var introStartTime = Date.now();
        mostrarIntro(introMedia, introMaxMs, function() {
            var introActualMs = Date.now() - introStartTime;
            esconderIntro(function() {
                standingsEl.classList.remove('opacity-0');
                standingsEl.classList.add('opacity-100');
                var bgVideoEl = document.querySelector('#bgVideo');
                if (bgVideoEl) {
                    if (!supportsMp4(bgVideoEl)) {
                        aplicarFallbackVideo(bgVideoEl);
                    } else {
                        bgVideoEl.classList.remove('opacity-0');
                        bgVideoEl.classList.add('opacity-100');
                    }
                }
                var gradEl = document.querySelector('#gradientOverlay');
                if (gradEl) { gradEl.classList.remove('opacity-0'); gradEl.classList.add('opacity-50'); }

                standingsAutoScroll(container);
                var placarMs = Math.max(DURACAO_TOTAL - introActualMs, STANDINGS_CONTEUDO_MS);
                console.log('[standings] intro=' + introActualMs + 'ms conteudo=' + placarMs + 'ms');
                setTimeout(function() { loader.finished(); }, placarMs);
            });
        });
    } else {
        standingsEl.classList.remove('opacity-0');
        standingsEl.classList.add('opacity-100');
        var bgVideoEl = document.querySelector('#bgVideo');
        if (bgVideoEl) {
            if (!supportsMp4(bgVideoEl)) {
                aplicarFallbackVideo(bgVideoEl);
            } else {
                bgVideoEl.classList.remove('opacity-0');
                bgVideoEl.classList.add('opacity-100');
            }
        }
        var gradEl = document.querySelector('#gradientOverlay');
        if (gradEl) { gradEl.classList.remove('opacity-0'); gradEl.classList.add('opacity-50'); }

        standingsAutoScroll(container);
        console.log('[standings] sem intro — conteudo=' + STANDINGS_DURACAO_MS + 'ms');
        setTimeout(function() { loader.finished(); }, STANDINGS_DURACAO_MS);
    }
}

function standingsRenderizarJogos(jogos) {
    var container = document.querySelector('#standingsJogosLinhas');
    var tmpl = document.querySelector('#tmplStandingsJogo');
    container.innerHTML = '';

    if (!jogos || jogos.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:2vmin 0;color:rgba(255,255,255,0.3);font-size:60%">Jogos a confirmar</div>';
        return;
    }

    for (var i = 0; i < jogos.length; i++) {
        var j = jogos[i];
        var frag = tmpl.content.cloneNode(true);
        var row = frag.firstElementChild;

        var b1 = row.querySelector('[data-campo="bandeira1"]');
        var b2 = row.querySelector('[data-campo="bandeira2"]');
        if (b1) {
            standingsCarregarBandeira(
                b1,
                j.bandeira1,
                j.bandeira1Fallback
            );
        }

        if (b2) {
            standingsCarregarBandeira(
                b2,
                j.bandeira2,
                j.bandeira2Fallback
            );
        }

        var placarEl = row.querySelector('[data-campo="placar"]');
        var horarioEl = row.querySelector('[data-campo="horario"]');
        var localEl = row.querySelector('[data-campo="local"]');

        if (localEl) { localEl.textContent = j.local || ''; }

        if (j.ao_vivo) {
            var g1 = j.gols1 !== null ? j.gols1 : 0;
            var g2 = j.gols2 !== null ? j.gols2 : 0;
            placarEl.textContent = g1 + ' x ' + g2;
            horarioEl.innerHTML = '<span class="standings-ao-vivo-badge">AO VIVO</span>';
            row.classList.add('standings-jogo-linha--ao-vivo');
        } else if (j.gols1 !== null && j.gols2 !== null) {
            placarEl.textContent = j.gols1 + ' x ' + j.gols2;
            horarioEl.textContent = j.data || '';
        } else {
            placarEl.textContent = j.hora || '-';
            horarioEl.textContent = j.data || '';
        }

        row.style.animationDelay = ((i + 1) * 0.12) + 's';
        container.appendChild(frag);
    }
}

function standingsCarregarBandeira(containerEl, src, fallbackSrc) {
    if (!containerEl) { return; }

    containerEl.innerHTML = '';

    var img = document.createElement('img');

    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '3px';

    img.onerror = function() {

        if (fallbackSrc && img.src !== fallbackSrc) {
            img.src = fallbackSrc;
            return;
        }

        containerEl.innerHTML = SVG_ESCUDO;
    };

    img.src = src;

    containerEl.appendChild(img);
}

function standingsAplicarSponsor(spdSponsor) {
    var footerEl = document.querySelector('#standingsSponsorFooter');
    if (!footerEl) { return; }

    var frase = spdSponsor ? obterValor(spdSponsor, 'TEXT1') : '';
    var logo = spdSponsor ? obterValor(spdSponsor, 'IMAGE_LOGO') : '';

    if (frase || logo) {
        footerEl.classList.remove('hidden');
        var fraseEl = document.querySelector('#standingsSponsorFrase');
        var logoEl = document.querySelector('#standingsSponsorLogo');
        if (fraseEl) { fraseEl.innerHTML = frase; }
        if (logoEl && logo) {
            logoEl.src = logo;
            logoEl.classList.remove('hidden');
        }
    } else {
        footerEl.classList.add('hidden');
    }
}

/**
 * Auto-scroll suave se o conteúdo do container excede a área visível.
 * Espera 2s para leitura inicial, depois rola suavemente até o final.
 * Velocidade fixa: ~30px/s para garantir legibilidade em qualquer resolução.
 */
function standingsAutoScroll(container) {
    if (!container) { return; }
    // Aguarda renderização para medir corretamente
    setTimeout(function() {
        var overflow = container.scrollHeight - container.clientHeight;
        if (overflow <= 0) { return; } // tudo visível, sem scroll

        // Duração fixa de 4s para garantir que não passe rápido demais
        var duracaoMs = 4000;
        var inicio = Date.now();

        console.log('[standings] auto-scroll: overflow=' + overflow + 'px duração=' + duracaoMs + 'ms');

        function animar() {
            var elapsed = Date.now() - inicio;
            var progresso = Math.min(elapsed / duracaoMs, 1);
            // Easing: ease-in-out
            var ease = progresso < 0.5
                ? 2 * progresso * progresso
                : 1 - Math.pow(-2 * progresso + 2, 2) / 2;
            container.scrollTop = ease * overflow;
            if (progresso < 1) {
                requestAnimationFrame(animar);
            }
        }

        requestAnimationFrame(animar);
    }, 2000);
}

/* ====================================================
   FALLBACK DE VÍDEO DE FUNDO (usa img/bg.png)
   Usado quando canPlayType('video/mp4') retorna vazio (detectado no diagnóstico WebEngine)
   Esconde o <video> e exibe a imagem estática bg.png como fundo
   ==================================================== */
function aplicarFallbackVideo(bgVideoEl) {
    if (!bgVideoEl) return;

    // Esconde o vídeo
    bgVideoEl.style.display = 'none';
    bgVideoEl.classList.remove('opacity-0', 'opacity-100');

    // Cria ou reutiliza a imagem de fallback
    var fallbackImg = document.querySelector('#bgFallback');
    if (!fallbackImg) {
        fallbackImg = document.createElement('img');
        fallbackImg.id = 'bgFallback';
        fallbackImg.src = 'img/bg.png';
        fallbackImg.className = 'absolute inset-0 z-0 w-full h-full object-cover';
        // Insere logo após o vídeo (mesmo nível)
        bgVideoEl.parentNode.insertBefore(fallbackImg, bgVideoEl.nextSibling);
    } else {
        fallbackImg.style.display = 'block';
    }

    // Reforça o gradiente (torna mais opaco para legibilidade)
    var gradEl = document.querySelector('#gradientOverlay');
    if (gradEl) {
        gradEl.style.opacity = '0.80';
    }

    // Loga no canal do EBBrowser (visível no ebhtmlbuilder)
    if (typeof loader !== 'undefined' && loader.log) {
        loader.log('[video] MP4 não suportado — usando img/bg.png como fallback');
    } else {
        console.log('[video] MP4 não suportado — usando img/bg.png como fallback');
    }
}

/* Verifica suporte a MP4 no elemento de vídeo informado */
function supportsMp4(videoEl) {
    try {
        return !!(videoEl && videoEl.canPlayType && videoEl.canPlayType('video/mp4') !== '');
    } catch (e) { return false; }
}
