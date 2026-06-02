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
 *
 * Tempo: com intro (FILE_IMAGE1) = DURACAO (segundos, D_SPD CONFIG=1) + placar 5s;
 *         sem intro = placar 10s. Fallback sem DURACAO: video ate ended / imagem 5s.
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

    // Padrões de fase com número: "Group Stage - N", "Play-offs - N", etc.
    var mGroupStage = chave.match(/^groups?\s+stage\s*[-–]\s*(\d+)$/);
    if (mGroupStage) { return 'Fase de Grupos — Rodada ' + mGroupStage[1]; }

    var mPlayoffs = chave.match(/^play-?offs?\s*[-–]\s*(\d+)$/);
    if (mPlayoffs) { return 'Play-offs — Rodada ' + mPlayoffs[1]; }

    var mQualStage = chave.match(/^qualifying\s+round\s*[-–]\s*(\d+)$/);
    if (mQualStage) { return 'Fase de Qualificação — Rodada ' + mQualStage[1]; }

    // Sem tradução — devolve o original sem alteração
    return texto;
}

/* ====================================================
   SANITIZA NOMES DE TORNEIOS (remove palavras proibidas)
   Substitui termos proibidos por equivalentes permitidos
   ==================================================== */
function sanitizarNomeTorneio(texto) {
    if (!texto) { return ''; }
    
    var textoUpper = texto.toUpperCase();
    
    // Lista de substituições (case-insensitive)
    var substituicoes = [
        { proibido: /COPA DO MUNDO/gi, permitido: 'O MUNDO EM CAMPO' },
        { proibido: /WORLD CUP/gi, permitido: 'O MUNDO EM CAMPO' },
        { proibido: /FIFA 2026/gi, permitido: 'O MUNDO EM CAMPO 2026' },
        { proibido: /FIFA WORLD CUP/gi, permitido: 'O MUNDO EM CAMPO' },
        { proibido: /COPA 2026/gi, permitido: 'O MUNDO EM CAMPO 2026' },
        { proibido: /FIFA/gi, permitido: '' }
    ];
    
    var resultado = texto;
    for (var i = 0; i < substituicoes.length; i++) {
        resultado = resultado.replace(substituicoes[i].proibido, substituicoes[i].permitido);
    }
    
    // Limpar espaços extras
    resultado = resultado.replace(/\s+/g, ' ').trim();
    
    return resultado;
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
/* Tempo de exibicao: sem intro = 10s; com intro = DURACAO (D_SPD) + placar fixo 5s */
var DURACAO_SEM_INTRO_MS     = 10000;
var DURACAO_CONTEUDO_MS      = 5000;
var DURACAO_IMAGEM_PADRAO_MS = 5000;

/**
 * Obtem duracao maxima da intro (video/imagem do patrocinador).
 * REGRA: Se TEXT2 existir no D_SPD CONFIG=1, usar como tempo de corte do video.
 *        Se TEXT2 nao existir ou for vazio, retorna 0 (sem limite - video roda ate o fim).
 * @param {Object} spd - Item D_SPD CONFIG=1
 * @returns {number} Duracao em milissegundos (0 = sem limite)
 */
function obterDuracaoIntroMs(spd) {
    if (!spd) { 
        console.log('[placar_futebol] obterDuracaoIntroMs: sem sponsor, duracao=0');
        return 0; 
    }
    
    // Tentar TEXT2 primeiro (novo padrao - tempo de corte do video)
    var text2 = obterValor(spd, 'TEXT2');
    if (text2 && text2.trim() !== '') {
        var segText2 = parseInt(text2, 10);
        if (segText2 > 0) {
            console.log('[placar_futebol] obterDuracaoIntroMs: TEXT2=' + text2 + ' seg → cortar video em ' + (segText2 * 1000) + 'ms');
            return segText2 * 1000;
        }
    }
    
    // Se TEXT2 nao existir, retornar 0 (sem limite - video roda ate o fim)
    console.log('[placar_futebol] obterDuracaoIntroMs: TEXT2 vazio ou invalido → video sem corte (duracao=0, ate ended)');
    return 0;
}

/* chave localStorage para rotação de partidas (padrão master_2) */
var LS_KEY_PARTIDA = 'placar_futebol_partida_idx';

/* ====================================================
   BUSCA TODOS OS TIMES DO D_FOOTBALL_TEAMS
   Retorna mapa: { teamId: { nome, bandeira, codigo } }
   ==================================================== */
function buscarTodosOsTimesDeUmaVez(callback) {
    var xhr = new XMLHttpRequest();
    var url = '/content/data/D_FOOTBALL_TEAMS?amount=0';
    
    console.log('[placar_futebol] Buscando todos os times do D_FOOTBALL_TEAMS...');
    
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) { return; }
        
        if (xhr.status === 200 || xhr.status === 0) {
            try {
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(xhr.responseText, 'text/xml');
                var items = xmlDoc.getElementsByTagName('ITEM');
                
                var teamsMap = {};
                
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var getTag = function(tagName) {
                        var el = item.getElementsByTagName(tagName)[0];
                        return el ? el.textContent : '';
                    };
                    
                    var teamId = getTag('TITULO');
                    var nome = getTag('TEXTO2');
                    var codigo = getTag('TEXTO3');
                    var bandeira = getTag('FOTO1');
                    
                    if (teamId && nome) {
                        teamsMap[teamId] = {
                            nome: nome,
                            codigo: codigo,
                            bandeira: bandeira
                        };
                    }
                }
                
                console.log('[placar_futebol] D_FOOTBALL_TEAMS: ' + Object.keys(teamsMap).length + ' times mapeados');
                callback(teamsMap);
                
            } catch (e) {
                console.error('[placar_futebol] Erro ao parsear D_FOOTBALL_TEAMS:', e);
                callback({});
            }
        } else {
            console.error('[placar_futebol] Erro HTTP ao buscar D_FOOTBALL_TEAMS:', xhr.status);
            callback({});
        }
    };
    
    xhr.onerror = function() {
        console.error('[placar_futebol] Erro de rede ao buscar D_FOOTBALL_TEAMS');
        callback({});
    };
    
    xhr.send();
}


/* ====================================================
   HELPERS - Extração de valores do D_SPD
   ==================================================== */

/**
 * Extrai valor de campo do D_SPD (suporta mock e EdgeContents)
 * @param {Object} spd - Item do D_SPD
 * @param {string} campo - Nome do campo
 * @returns {string} Valor do campo ou string vazia
 */
function obterValorSpd(spd, campo) {
    if (!spd) { return ''; }
    return spd[campo] || (spd.value && spd.value(campo) && spd.value(campo).value) || '';
}

function obterDuracaoIntroMs(spd) {
    var seg = parseInt(obterValorSpd(spd, 'DURACAO'), 10);
    return (seg > 0) ? seg * 1000 : 0;
}


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
    s.setProperty('--cor-destaque-glow', hexToRgba(cfg.corDestaque, 0.10));
    s.setProperty('--cor-fundo-painel',  hexToRgba(cfg.corEscura,   0.90));
    s.setProperty('--cor-fundo-area',    hexToRgba(cfg.corEscura,   0.40));
    s.setProperty('--cor-borda',         hexToRgba(cfg.corClara,    0.10));
    s.setProperty('--cor-texto',         cfg.corClara);
    s.setProperty('--cor-texto-sec',     hexToRgba(cfg.corClara,    0.50));
    s.setProperty('--cor-texto-ter',     hexToRgba(cfg.corClara,    0.98));
    s.setProperty('--cor-grad-from',     hexToRgba(cfg.corEscura,   0.90));
    s.setProperty('--cor-grad-mid',      hexToRgba(cfg.corEscura,   0.90));
    s.setProperty('--cor-grad-to',       hexToRgba(cfg.corEscura,   0.80));
}

/* --- Mescla cores do D_SPD (COLOR1/COLOR2/COLOR3) com defaults do CONFIG --- */
function mergeColorsFromSpd(defaults, spd) {
    if (!spd) { return defaults; }
    
    // COLOR1 = corDestaque, COLOR2 = corEscura, COLOR3 = corClara
    var cor1 = obterValorSpd(spd, 'COLOR1');
    var cor2 = obterValorSpd(spd, 'COLOR2');
    var cor3 = obterValorSpd(spd, 'COLOR3');
    
    // Adicionar '#' se não tiver
    if (cor1 && cor1.indexOf('#') !== 0) { cor1 = '#' + cor1; }
    if (cor2 && cor2.indexOf('#') !== 0) { cor2 = '#' + cor2; }
    if (cor3 && cor3.indexOf('#') !== 0) { cor3 = '#' + cor3; }
    
    return {
        corDestaque: cor1 || defaults.corDestaque,
        corEscura:   cor2 || defaults.corEscura,
        corClara:    cor3 || defaults.corClara
    };
}


/* ====================================================
   ENTRADA — modo player (produção / mock local)
   Chamada pelo inline script no final do body quando
   NÃO está no modo preview da extranet.
   ==================================================== */
function playerView() {
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        // Loader mock
        var mockLoader = MOCK_DATA.getMockLoader();
        var lista = mockLoader.datalist('D_SPD');
        if (!lista || lista.count() === 0) {
            console.log('[placar_futebol][mock] D_SPD vazio — skip');
            mockLoader.finished();
            return;
        }
        // Separa jogos (TYPE=10) e patrocinador (CONFIG=1)
        var jogos = [];
        var spdSponsor = null;
        for (var i = 0; i < lista.count(); i++) {
            var item = lista.get(i);
            var cfg = obterValor(item, 'CONFIG');
            var tipo = obterValor(item, 'TYPE');
            
            if (cfg === '1') {
                spdSponsor = item;
            } else if (tipo === '10') {
                jogos.push(item);
            }
        }
        if (jogos.length === 0) {
            console.log('[placar_futebol][mock] Nenhum jogo encontrado em D_SPD');
            mockLoader.finished();
            return;
        }
        var idx = 0;
        var spdData = jogos[idx];
        var partidaId = obterValor(spdData, 'TITLE').trim();
        if (!partidaId) {
            console.log('[placar_futebol][mock] TITLE vazio — skip');
            mockLoader.finished();
            return;
        }
        var footballData = mockLoader.data('D_FOOTBALL');
        if (!footballData) {
            console.log('[placar_futebol][mock] D_FOOTBALL sem dados para ID=' + partidaId);
            mockLoader.finished();
            return;
        }
        aplicarCores(mergeColorsFromSpd(CONFIG, spdSponsor));
        // Mock: criar teamsMap vazio (nomes já vêm do mock-data)
        var mockTeamsMap = {};
        processarDados(spdData, spdSponsor, footballData, mockLoader, mockTeamsMap);
        return;
    }

    // EdgeContents real
    ebhtml.create2({}, function(loader) {
        // Carrega TODOS os itens de D_SPD de uma vez (jogos TYPE=10 + patrocinador CONFIG=1)
        // A rotação é feita client-side via localStorage (padrão master_2).
        loader.addData('D_SPD', false, 'amount=0');
        loader.autoloaded = false;
        loader.nodataiserror = false;

        loader.load(function() {

            var lista = loader.datalist('D_SPD');
            if (!lista || lista.count() === 0) {
                console.log('[placar_futebol] D_SPD vazio — skip');
                loader.finished();
                return;
            }

            // Separa jogos (TYPE=10) e patrocinador (CONFIG=1)
            var jogos = [];
            var spdSponsor = null;
            for (var i = 0; i < lista.count(); i++) {
                var item = lista.get(i);
                var cfg = obterValor(item, 'CONFIG');
                var tipo = obterValor(item, 'TYPE');
                
                if (cfg === '1') {
                    spdSponsor = item;
                    console.log('[placar_futebol] Patrocinador encontrado (CONFIG=1)');
                } else if (tipo === '10') {
                    jogos.push(item);
                }
            }

            if (jogos.length === 0) {
                console.log('[placar_futebol] Nenhum jogo (TYPE=10) encontrado em D_SPD');
                loader.finished();
                return;
            }
            
            console.log('[placar_futebol] Encontrados ' + jogos.length + ' jogo(s) TYPE=10');

            // Rotação via localStorage (mesmo padrão do master_2)
            var idx = parseInt(localStorage.getItem(LS_KEY_PARTIDA), 10);
            if (isNaN(idx) || idx >= jogos.length) {
                idx = 0;
            }
            var spdData = jogos[idx];

            // Avança o índice para a próxima exibição
            localStorage.setItem(LS_KEY_PARTIDA, idx + 1);
            console.log('[placar_futebol] localStorage idx=' + idx + '/' + jogos.length);

            var partidaId = obterValor(spdData, 'TITLE').trim();
            console.log('[placar_futebol] D_SPD: TITLE=' + partidaId
                + ' | Times: ' + obterValor(spdData, 'TEXT1') + ' x ' + obterValor(spdData, 'TEXT2'));

            if (!partidaId) {
                console.log('[placar_futebol] TITLE vazio — skip');
                loader.finished();
                return;
            }

            // Segunda fase: buscar D_FOOTBALL_TEAMS (todos os times) e D_FOOTBALL (jogo específico)
            buscarTodosOsTimesDeUmaVez(function(teamsMap) {
                
                // Terceira fase: D_FOOTBALL filtrado pelo ID da partida
                ebhtml.create2({}, function(loader2) {
                    loader2.addData('D_FOOTBALL', false, 'F_TITULO=' + partidaId);
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

                        aplicarCores(mergeColorsFromSpd(CONFIG, spdSponsor));
                        processarDados(spdData, spdSponsor, footballData, loader, teamsMap);
                    });
                });
            });
        });
    });
}

/* ====================================================
   PROCESSA OS DADOS E RENDERIZA
   spdData, spdSponsor, footballData já resolvidos;
   loader (D_SPD) controla a playlist; teamsMap contém nomes PT-BR.
   ==================================================== */
function processarDados(spdData, spdSponsor, footballData, loader, teamsMap) {

    // Parse do JSON do D_FOOTBALL.TEXTO2 para extrair dados da API-Football
    var footballJson = obterValor(footballData, 'TEXTO2');
    var fixtureData = null;
    var homeTeamId = null;
    var awayTeamId = null;
    var homeTeamName = '[Time Casa]';
    var awayTeamName = '[Time Visitante]';
    var homeTeamLogo = '';
    var awayTeamLogo = '';
    var venue = obterValor(footballData, 'SUBTITULO') || '';
    var round = obterValor(footballData, 'SUBTITULO2') || '';
    
    // Variáveis de placar (extraídas do JSON ou fallback do D_SPD)
    var statusFromJson = null;
    var goalsHome = null;
    var goalsAway = null;
    var penaltyHome = null;
    var penaltyAway = null;
    var elapsedTime = null;
    
    if (footballJson) {
        try {
            var parsed = JSON.parse(footballJson);
            if (parsed.response && parsed.response.length > 0) {
                fixtureData = parsed.response[0];
                
                // Extrair IDs dos times
                homeTeamId = fixtureData.teams.home.id;
                awayTeamId = fixtureData.teams.away.id;
                
                // Buscar nomes PT-BR no D_FOOTBALL_TEAMS
                if (teamsMap[homeTeamId]) {
                    homeTeamName = teamsMap[homeTeamId].nome;
                    homeTeamLogo = teamsMap[homeTeamId].bandeira || fixtureData.teams.home.logo;
                } else {
                    console.error('[placar_futebol] ERRO CRITICO: Time ID=' + homeTeamId + ' NAO encontrado no D_FOOTBALL_TEAMS!');
                    homeTeamName = '[Time ' + homeTeamId + ']';
                    homeTeamLogo = fixtureData.teams.home.logo;
                }
                
                if (teamsMap[awayTeamId]) {
                    awayTeamName = teamsMap[awayTeamId].nome;
                    awayTeamLogo = teamsMap[awayTeamId].bandeira || fixtureData.teams.away.logo;
                } else {
                    console.error('[placar_futebol] ERRO CRITICO: Time ID=' + awayTeamId + ' NAO encontrado no D_FOOTBALL_TEAMS!');
                    awayTeamName = '[Time ' + awayTeamId + ']';
                    awayTeamLogo = fixtureData.teams.away.logo;
                }
                
                // Extrair estádio e rodada do JSON (se disponível)
                if (fixtureData.fixture.venue && fixtureData.fixture.venue.name) {
                    venue = fixtureData.fixture.venue.name;
                }
                if (fixtureData.league && fixtureData.league.round) {
                    round = fixtureData.league.round;
                }
                
                // Extrair STATUS do jogo
                if (fixtureData.fixture && fixtureData.fixture.status && fixtureData.fixture.status.short) {
                    statusFromJson = fixtureData.fixture.status.short;
                }
                
                // Extrair PLACAR ATUAL (goals.home / goals.away)
                if (fixtureData.goals) {
                    goalsHome = fixtureData.goals.home;
                    goalsAway = fixtureData.goals.away;
                }
                
                // Extrair PLACAR DE PÊNALTIS (score.penalty)
                // IMPORTANTE: Só mostrar pênaltis quando o jogo estiver ENCERRADO (FT_PEN, AET)
                // Durante status PEN (pênaltis em andamento), os valores ainda estão sendo definidos
                var statusUpper = (statusFromJson || '').toUpperCase();
                var jogoEncerrado = (statusUpper === 'FT' || statusUpper === 'AET' || statusUpper === 'FT_PEN' || 
                                     statusUpper === 'ABD' || statusUpper === 'AWD' || statusUpper === 'WO');
                
                if (fixtureData.score && fixtureData.score.penalty && jogoEncerrado) {
                    penaltyHome = fixtureData.score.penalty.home;
                    penaltyAway = fixtureData.score.penalty.away;
                    console.log('[placar_futebol] Pênaltis finais: ' + penaltyHome + 'x' + penaltyAway);
                }
                
                // Extrair TEMPO DECORRIDO (fixture.status.elapsed)
                if (fixtureData.fixture && fixtureData.fixture.status && fixtureData.fixture.status.elapsed !== null) {
                    elapsedTime = fixtureData.fixture.status.elapsed;
                }
                
                console.log('[placar_futebol] JSON parsed: status=' + statusFromJson 
                    + ' | goals=' + goalsHome + 'x' + goalsAway 
                    + ' | pen=' + penaltyHome + 'x' + penaltyAway
                    + ' | elapsed=' + elapsedTime + 'min');
            }
        } catch (e) {
            console.error('[placar_futebol] Erro ao parsear JSON do D_FOOTBALL.TEXTO2:', e);
        }
    }

    // Status: prioridade JSON > D_SPD > D_FOOTBALL.SUBTITULO3
    var statusFinal = statusFromJson || (spdData ? obterValor(spdData, 'TEXT4') : null) || obterValor(footballData, 'SUBTITULO3');
    var estado = determinarEstado(statusFinal, null);
    var dtFormatada = formatarDataHora(obterValor(footballData, 'DATE'));

    // Nome do torneio: prioridade JSON.league.name > D_FOOTBALL.CATEGORY
    var nomeTorneio = obterValor(footballData, 'CATEGORY');
    if (fixtureData && fixtureData.league && fixtureData.league.name) {
        nomeTorneio = fixtureData.league.name;
    }
    // Sanitizar nome do torneio (remover palavras proibidas)
    nomeTorneio = sanitizarNomeTorneio(nomeTorneio);

    var dados = {
        time1:      homeTeamName,
        time2:      awayTeamName,
        estadio:    venue,
        rodada:     traduzirFase(round),
        torneio:    nomeTorneio,
        hora:       dtFormatada.hora,
        data:       dtFormatada.data,
        foto1:      homeTeamLogo,
        foto2:      awayTeamLogo,
        estado:     estado,
        statusRaw:  statusFinal.toUpperCase().trim(),
        // Gols: prioridade JSON > D_SPD > '0'
        gols1:      goalsHome !== null ? String(goalsHome) : (spdData ? obterValor(spdData, 'TEXT5') : '0'),
        gols2:      goalsAway !== null ? String(goalsAway) : (spdData ? obterValor(spdData, 'TEXT6') : '0'),
        // Pênaltis: prioridade JSON > D_SPD > ''
        pen1:       penaltyHome !== null ? String(penaltyHome) : (spdData ? obterValor(spdData, 'TEXT7') : ''),
        pen2:       penaltyAway !== null ? String(penaltyAway) : (spdData ? obterValor(spdData, 'TEXT8') : ''),
        // Tempo: prioridade JSON > D_SPD > ''
        tempo:      elapsedTime !== null ? String(elapsedTime) : (spdData ? obterValor(spdData, 'TEXT9') : ''),
        tempoExtra: spdData ? obterValor(spdData, 'TEXT10') : '',
        patroFrase:  spdSponsor ? obterValor(spdSponsor, 'TEXT1') : '',
        patroLogo:   spdSponsor ? obterValor(spdSponsor, 'IMAGE_LOGO') : '',
        introMedia:  spdSponsor ? obterValor(spdSponsor, 'FILE_IMAGE1') : '',
        introDuracaoMs: spdSponsor ? obterDuracaoIntroMs(spdSponsor) : 0
    };

    console.log('[placar_futebol] >>> Exibindo: ' + dados.time1 + ' x ' + dados.time2
        + ' | ' + dados.torneio
        + ' | Estado: ' + dados.estado + ' (' + dados.statusRaw + ')'
        + ' | Placar: ' + dados.gols1 + 'x' + dados.gols2);

    renderizarTemplate(dados, loader);
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
function determinarEstado(statusBase, spdData) {
    var status = statusBase;
    if (spdData) {
        var spdStatus = obterValor(spdData, 'TEXT4');
        if (spdStatus) {
            status = spdStatus;
        }
    }
    status = (status || '').toUpperCase().trim();

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
    // Demais: NS, TBD, PST, CANC, etc. → pré-jogo
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
    var WIN_CLASS = 'animate-pulse-win';
    var horaEl = document.querySelector('#hora');
    var dataEl = document.querySelector('#data');
    if (horaEl) { horaEl.classList.add(WIN_CLASS); }
    if (dataEl) { dataEl.classList.add(WIN_CLASS); }
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

    var WIN_CLASS = 'animate-pulse-win';

    if (nomeEl) { nomeEl.classList.add(WIN_CLASS); }
    if (logoEl) { logoEl.classList.add(WIN_CLASS); }
    if (golEl)  { golEl.classList.add(WIN_CLASS);  }
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

    // ✅ EBHTML: Avisar que o template carregou com sucesso IMEDIATAMENTE
    // (antes de qualquer animação ou intro de vídeo)
    loader.loaded();
    console.log('[placar_futebol] loader.loaded() chamado — template registrado na playlist');

    // --- Textos sempre visíveis ---
    document.querySelector('#time1Nome').innerHTML   = dados.time1;
    document.querySelector('#time2Nome').innerHTML   = dados.time2;
    document.querySelector('#torneio').innerHTML       = dados.torneio;
    document.querySelector('#rodada').innerHTML        = dados.rodada;
    document.querySelector('#estadioCentro').innerHTML = dados.estadio;
    document.querySelector('#hora').innerHTML        = dados.hora;
    document.querySelector('#data').innerHTML        = dados.data;

    // --- Lógica de estado ---
    var mostrarPlacar = (dados.estado !== 'pre_jogo');

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
    if (bgVideo && bgVideo.src.indexOf(videoSrc) === -1) {
        bgVideo.src = videoSrc;
        bgVideo.load();
        bgVideo.play();
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

            var placarMs = dados.introMedia ? DURACAO_CONTEUDO_MS : DURACAO_SEM_INTRO_MS;
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
    if (dados.introMedia) {
        introStartTime = Date.now();
        mostrarIntro(dados.introMedia, function() {
            introActualMs = Date.now() - introStartTime;
            introFeita = true;
            verificarPronto();
        }, dados.introDuracaoMs);
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
var CONTENT_FILES_HOST = window.location.protocol + '//127.0.0.1:13199';

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
function mostrarIntro(url, onDone, introMaxMs) {
    var introEl = document.querySelector('#introScreen');
    if (!introEl) { onDone(); return; }

    // Detecta tipo ANTES de normalizar (URL original tem extensão)
    var isVideo = isUrlVideo(url);

    url = normalizarUrlMidia(url);
    console.log('[placar_futebol] intro (' + (isVideo ? 'video' : 'imagem') + '): ' + url + (introMaxMs > 0 ? ' max=' + introMaxMs + 'ms' : ' sem limite'));

    introEl.innerHTML = '';
    introEl.style.opacity = '1';
    introEl.classList.remove('hidden');

    // <main> fica invisível (opacity-0) enquanto a intro toca.
    // revelarPlacar() vai fade-in o <main> após a intro terminar.

    if (isVideo) {
        var vid = document.createElement('video');
        vid.className = 'w-full h-full object-cover';
        vid.setAttribute('playsinline', '');
        vid.muted = true;
        introEl.appendChild(vid);

        // Guard: onDone chamado no máximo uma vez (ended OU timeout)
        var _introDone = false;
        var _introTimer = null;
        function _onIntroDone() {
            if (_introDone) { return; }
            _introDone = true;
            clearTimeout(_introTimer);
            onDone();
        }
        if (introMaxMs > 0) {
            _introTimer = setTimeout(function() {
                console.log('[intro-video] timeout ' + introMaxMs + 'ms — cortando');
                vid.pause();
                _onIntroDone();
            }, introMaxMs);
        }

        vid.addEventListener('loadstart',  function() { console.log('[intro-video] loadstart'); });
        vid.addEventListener('loadeddata', function() { console.log('[intro-video] loadeddata'); });
        vid.addEventListener('canplay',    function() { console.log('[intro-video] canplay'); });
        vid.addEventListener('playing',    function() { console.log('[intro-video] playing'); });
        vid.addEventListener('ended',      function() { console.log('[intro-video] ended'); _onIntroDone(); });
        vid.addEventListener('error',      function(e) {
            var code = vid.error ? vid.error.code : '?';
            console.error('[intro-video] error code=' + code + ' url=' + url);
            _onIntroDone();
        });
        vid.addEventListener('stalled',    function() { console.warn('[intro-video] stalled'); });
        vid.addEventListener('waiting',    function() { console.warn('[intro-video] waiting'); });

        vid.addEventListener('canplay', function onFirstCanPlay() {
            vid.removeEventListener('canplay', onFirstCanPlay);
            var p = vid.play();
            if (p && typeof p.then === 'function') {
                p.then(function() {
                    console.log('[intro-video] play() ok');
                }, function(err) {
                    console.error('[intro-video] play() falhou:', err);
                    _onIntroDone();
                });
            }
        });

        vid.src = url;
        vid.load();
    } else {
        var img = document.createElement('img');
        img.className = 'w-full h-full object-cover';
        var imgMs = introMaxMs > 0 ? introMaxMs : DURACAO_IMAGEM_PADRAO_MS;
        img.onload = function() {
            setTimeout(onDone, imgMs);
        };
        img.onerror = onDone;
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
