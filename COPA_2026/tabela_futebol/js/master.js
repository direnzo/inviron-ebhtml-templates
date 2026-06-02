/**
 * master.js - Tabela Copa 2026
 * ES5 obrigatorio - sem const/let/arrow/template-strings/Promise/fetch
 *
 * INTEGRACAO COM DADOS REAIS:
 *   - D_FOOTBALL_STANDINGS (classificacao dos grupos)
 *   - D_SPD (patrocinador CONFIG='1')
 *
 * Tempo de exibicao:
 *   Sem intro (FILE_IMAGE1): conteudo 10s
 *   Com intro: intro conforme D_SPD.DURACAO (segundos); sem DURACAO = video ate ended / imagem 5s
 *   Apos intro: conteudo fixo 5s (total pode ultrapassar 10s)
 */

/* --- Injeta SVG inline via XHR (evita problema de img src em servidor local) --- */
function carregarSvgInline(containerEl, src) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', src, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return;
        if (xhr.status === 200 || xhr.status === 0) {
            var svgEl = containerEl.querySelector('svg');
            if (svgEl) svgEl.parentNode.removeChild(svgEl);
            containerEl.innerHTML = xhr.responseText;
            var svg = containerEl.querySelector('svg');
            if (svg) {
                svg.style.width  = '100%';
                svg.style.height = '100%';
                svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            }
        }
    };
    xhr.send();
    return xhr;
}

/**
 * Carrega bandeira: SVG local (inline) ou URL HTTP (img tag)
 * @param {HTMLElement} containerEl - Container da bandeira
 * @param {string} src - Caminho SVG local ou URL HTTP
 */
function carregarBandeira(containerEl, src) {
    if (!src || !containerEl) return;
    
    // Se for URL HTTP (do D_FOOTBALL_TEAMS), usar <img>
    if (src.indexOf('http://') === 0 || src.indexOf('https://') === 0) {
        containerEl.innerHTML = '';
        var img = document.createElement('img');
        img.src = src;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        containerEl.appendChild(img);
    } 
    // Se for SVG local, usar carregamento inline
    else if (src.indexOf('.svg') > 0) {
        carregarSvgInline(containerEl, src);
    }
    // Fallback: tentar como imagem
    else {
        containerEl.innerHTML = '';
        var imgFallback = document.createElement('img');
        imgFallback.src = src;
        imgFallback.style.width = '100%';
        imgFallback.style.height = '100%';
        imgFallback.style.objectFit = 'contain';
        containerEl.appendChild(imgFallback);
    }
}

var LS_KEY_GRUPO   = 'tabela_futebol_grupo_idx';
var DURACAO_SEM_INTRO_MS     = 10000;
var DURACAO_CONTEUDO_MS      = 5000;
var DURACAO_IMAGEM_PADRAO_MS = 5000;
var CONTENT_FILES_HOST = window.location.protocol + '//127.0.0.1:13199';

function obterValorSpd(spd, campo) {
    if (!spd) { return ''; }
    return spd[campo] || (spd.value && spd.value(campo) && spd.value(campo).value) || '';
}

/**
 * Obtem duracao maxima da intro (video/imagem do patrocinador).
 * REGRA: Se TEXT2 existir no D_SPD CONFIG=1, usar como tempo de corte do video.
 *        Se TEXT2 nao existir ou for vazio, retorna 0 (sem limite - video roda ate o fim).
 * @param {Object} spd - Item D_SPD CONFIG=1
 * @returns {number} Duracao em milissegundos (0 = sem limite)
 */
function obterDuracaoIntroMs(spd) {
    if (!spd) { 
        console.log('[tabela_futebol] obterDuracaoIntroMs: sem sponsor, duracao=0');
        return 0; 
    }
    
    // Tentar TEXT2 primeiro (novo padrao - tempo de corte do video)
    var text2 = obterValorSpd(spd, 'TEXT2');
    if (text2 && text2.trim() !== '') {
        var segText2 = parseInt(text2, 10);
        if (segText2 > 0) {
            console.log('[tabela_futebol] obterDuracaoIntroMs: TEXT2=' + text2 + ' seg → cortar video em ' + (segText2 * 1000) + 'ms');
            return segText2 * 1000;
        }
    }
    
    // Se TEXT2 nao existir, retornar 0 (sem limite - video roda ate o fim)
    console.log('[tabela_futebol] obterDuracaoIntroMs: TEXT2 vazio ou invalido → video sem corte (duracao=0, ate ended)');
    return 0;
}

function temIntroMedia(spd) {
    return !!obterValorSpd(spd, 'FILE_IMAGE1');
}

/* --- Configuracao de cores (sobrescreve CSS vars em :root) --- */
var CONFIG = {
    corDestaque: '#FBBF24',  // cor de destaque (hora, tempo, glow)
    corEscura:   '#006400',  // cor de fundo (painéis, gradientes) verde bem escuro 
    corClara:    '#FFFFFF'   // cor de texto e bordas
};

/* Converte HEX para rgba com opacidade */
function hexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

function aplicarCores(cfg) {
    var s = document.documentElement.style;
    s.setProperty('--cor-destaque',           cfg.corDestaque);
    s.setProperty('--cor-destaque-glow',      hexToRgba(cfg.corDestaque, 0.10));
    s.setProperty('--cor-fundo-painel',       hexToRgba(cfg.corEscura,   0.90));
    s.setProperty('--cor-fundo-area',         hexToRgba(cfg.corDestaque, 0.15));
    s.setProperty('--cor-fundo-classificado', hexToRgba(cfg.corEscura,   0.55));
    s.setProperty('--cor-borda',              hexToRgba(cfg.corClara,    0.10));
    s.setProperty('--cor-texto',              cfg.corClara);
    s.setProperty('--cor-texto-sec',          hexToRgba(cfg.corClara,    0.50));
    s.setProperty('--cor-grad-from',          hexToRgba(cfg.corEscura,   0.90));
    s.setProperty('--cor-grad-mid',           hexToRgba(cfg.corEscura,   0.90));
    s.setProperty('--cor-grad-to',            hexToRgba(cfg.corEscura,   0.80));
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
   TRADUCAO DE FASES DO TORNEIO (Inglês → PT-BR)
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
    'third place':                'Disputa de 3º Lugar'
};

/**
 * Traduz fase/rodada do campeonato para PT-BR.
 * Tenta match exato por chave em minúsculas; se não encontrar, devolve o original.
 * Também expande padrões numéricos dinâmicos como "Group Stage - 2", "Matchday 12".
 */
function traduzirFase(texto) {
    if (!texto) { return ''; }
    var chave = texto.toLowerCase().trim();

    // Lookup direto
    if (FASE_LABEL[chave]) {
        return FASE_LABEL[chave];
    }

    // Padrões dinâmicos: "Group Stage - N", "Matchday N", "Round N"
    var mGroupStage = chave.match(/^groups?\s+stage\s*[-–]\s*(\d+)$/);
    if (mGroupStage) { return 'Fase de Grupos — Rodada ' + mGroupStage[1]; }

    var mMatchday = chave.match(/^matchday\s+(\d+)$/);
    if (mMatchday) { return 'Rodada ' + mMatchday[1]; }

    var mRound = chave.match(/^round\s+(\d+)$/);
    if (mRound) { return 'Rodada ' + mRound[1]; }

    var mQual = chave.match(/^(\d+)(?:st|nd|rd|th)\s+qualifying round$/);
    if (mQual) { return mQual[1] + 'ª Fase de Qualificação'; }

    var mLeague = chave.match(/^league\s+stage\s*[-–]\s*(\d+)$/);
    if (mLeague) { return 'Fase de Liga — Rodada ' + mLeague[1]; }

    var mPlayoffs = chave.match(/^play-?offs?\s*[-–]\s*(\d+)$/);
    if (mPlayoffs) { return 'Play-offs — Rodada ' + mPlayoffs[1]; }

    var mLeg = chave.match(/^(\d+)(?:st|nd|rd|th)\s+leg$/);
    if (mLeg) { return mLeg[1] + 'ª Mão'; }

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

/* ====================================================
   FUNCOES AUXILIARES - INTEGRACAO DADOS REAIS API
   ==================================================== */

/**
 * Mapeia codigo de pais (3 letras) para codigo ISO 3166-1 alpha-2 (2 letras)
 * Ex: "KOR" -> "kr", "BRA" -> "br"
 */
function mapearCodigoPais(code) {
    if (!code) return null;
    
    var mapa = {
        'ARG': 'ar', 'AUT': 'at', 'AUS': 'au', 'AUL': 'au', 'BIH': 'ba', 'BEL': 'be',
        'BRA': 'br', 'CAN': 'ca', 'COD': 'cd', 'SUI': 'ch', 'CIV': 'ci', 'CHI': 'ci',
        'COL': 'co', 'CPV': 'cv', 'CUW': 'cw', 'CZE': 'cz', 'CZR': 'cz', 'GER': 'de',
        'ALG': 'dz', 'DZA': 'dz', 'ECU': 'ec', 'EGY': 'eg', 'ESP': 'es', 'FRA': 'fr',
        'ENG': 'gb-eng', 'SCO': 'gb-sct', 'WAL': 'gb-wls', 'GHA': 'gh', 'CRO': 'hr', 
        'HRV': 'hr', 'HAI': 'ht', 'HTI': 'ht', 'IRQ': 'iq', 'IRA': 'ir', 'IRN': 'ir',
        'JOR': 'jo', 'JPN': 'jp', 'KOR': 'kr', 'PRK': 'kp', 'MAR': 'ma', 'MEX': 'mx',
        'NED': 'nl', 'HOL': 'nl', 'NOR': 'no', 'NZL': 'nz', 'PAN': 'pa', 'POR': 'pt',
        'PAR': 'py', 'QAT': 'qa', 'SAU': 'sa', 'KSA': 'sa', 'SWE': 'se', 'SEN': 'sn',
        'TUN': 'tn', 'TUR': 'tr', 'USA': 'us', 'URU': 'uy', 'UZB': 'uz',
        'RSA': 'za', 'ZAF': 'za', 'SAF': 'za'  // África do Sul - múltiplas variações
    };
    
    var upper = code.toUpperCase();
    return mapa[upper] || code.toLowerCase().substring(0, 2);
}

/**
 * Converte URL de logo da API para caminho de bandeira SVG local
 * Ex: "https://...teams/17.png" + "KOR" -> "img/flags/kr.svg"
 */
function converterLogoParaBandeira(logoUrl, countryCode) {
    if (!countryCode) return logoUrl; // fallback para URL da API
    
    var codigoISO = mapearCodigoPais(countryCode);
    return codigoISO ? 'img/flags/' + codigoISO + '.svg' : logoUrl;
}

/**
 * Normaliza nome do grupo
 * Ex: "Group A" -> "Grupo A", "Ranking of third-placed teams" -> mantém
 */
function normalizarNomeGrupo(groupName) {
    if (!groupName) return 'Grupo ?';
    
    // Se começar com "Group ", traduzir para "Grupo "
    if (groupName.indexOf('Group ') === 0) {
        return groupName.replace('Group ', 'Grupo ');
    }
    
    return groupName;
}

/**
 * Busca TODOS os jogos do canal D_FOOTBALL de uma vez
 * @param {function} callback - callback(jogosArray)
 */
function buscarTodosOsJogos(callback) {
    var xhr = new XMLHttpRequest();
    var url = '/content/data/D_FOOTBALL?amount=0';
    
    console.log('[tabela_futebol] Buscando jogos do D_FOOTBALL...');
    
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) { return; }
        
        if (xhr.status === 200 || xhr.status === 0) {
            try {
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(xhr.responseText, 'text/xml');
                var items = xmlDoc.getElementsByTagName('ITEM');
                
                var jogosArray = [];
                
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var getTag = function(tagName) {
                        var el = item.getElementsByTagName(tagName)[0];
                        return el ? el.textContent : null;
                    };
                    
                    var texto2 = getTag('TEXTO2');
                    if (!texto2) continue;
                    
                    try {
                        var jsonData = JSON.parse(texto2);
                        if (jsonData.response && jsonData.response.length > 0) {
                            var jogo = jsonData.response[0];
                            jogosArray.push({
                                fixtureId: jogo.fixture.id,
                                date: jogo.fixture.date,
                                venue: jogo.fixture.venue ? jogo.fixture.venue.name : null,
                                round: jogo.league.round,
                                homeTeam: {
                                    id: jogo.teams.home.id,
                                    name: jogo.teams.home.name,
                                    logo: jogo.teams.home.logo
                                },
                                awayTeam: {
                                    id: jogo.teams.away.id,
                                    name: jogo.teams.away.name,
                                    logo: jogo.teams.away.logo
                                },
                                goalsHome: jogo.goals.home,
                                goalsAway: jogo.goals.away,
                                status: jogo.fixture.status.short
                            });
                        }
                    } catch (e) {
                        console.warn('[tabela_futebol] Erro ao parsear jogo item ' + i + ':', e);
                    }
                }
                
                console.log('[tabela_futebol] Total de jogos carregados: ' + jogosArray.length);
                callback(jogosArray);
                
            } catch (e) {
                console.error('[tabela_futebol] Erro ao processar D_FOOTBALL:', e);
                callback([]);
            }
        } else {
            console.error('[tabela_futebol] HTTP ' + xhr.status + ' ao buscar D_FOOTBALL');
            callback([]);
        }
    };
    
    xhr.onerror = function() {
        console.error('[tabela_futebol] Erro de rede ao buscar D_FOOTBALL');
        callback([]);
    };
    
    xhr.send();
}

/**
 * Busca TODOS os times do canal D_FOOTBALL_TEAMS de uma vez
 * @param {function} callback - callback(teamsMap) onde teamsMap = {teamId: {nome, bandeira, codigo}}
 */
function buscarTodosOsTimesDeUmaVez(callback) {
    var xhr = new XMLHttpRequest();
    var url = '/content/data/D_FOOTBALL_TEAMS?amount=0';
    
    console.log('[tabela_futebol] Buscando todos os times do D_FOOTBALL_TEAMS...');
    
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
                        return el ? el.textContent : null;
                    };
                    
                    var teamId = getTag('TITULO');
                    var nome = getTag('TEXTO2');
                    var bandeira = getTag('FOTO1');
                    var codigo = getTag('TEXTO3');
                    
                    if (teamId) {
                        teamsMap[teamId] = {
                            nome: nome,
                            bandeira: bandeira,
                            codigo: codigo
                        };
                        console.log('[tabela_futebol] D_FOOTBALL_TEAMS[' + teamId + ']: ' + nome + ' (' + codigo + ') -> ' + (bandeira ? 'OK' : 'SEM BANDEIRA'));
                    }
                }
                
                console.log('[tabela_futebol] Total de times carregados: ' + Object.keys(teamsMap).length);
                callback(teamsMap);
                
            } catch (e) {
                console.error('[tabela_futebol] Erro ao processar D_FOOTBALL_TEAMS:', e);
                callback({});
            }
        } else {
            console.error('[tabela_futebol] HTTP ' + xhr.status + ' ao buscar D_FOOTBALL_TEAMS');
            callback({});
        }
    };
    
    xhr.onerror = function() {
        console.error('[tabela_futebol] Erro de rede ao buscar D_FOOTBALL_TEAMS');
        callback({});
    };
    
    xhr.send();
}

/**
 * Processa dados de D_FOOTBALL_STANDINGS e retorna array de grupos
 * @param {Array} standingsData - Array parseado de TEXTO2 do D_FOOTBALL_STANDINGS
 * @param {Object} teamsMap - Mapa de teams {teamId: {nome, bandeira}} (opcional)
 * @param {Array} jogosArray - Array de jogos do D_FOOTBALL (opcional)
 * @returns {Array} grupos no formato: [{nome, times: [...], jogos: [...]}]
 */
function processarStandingsParaGrupos(standingsData, teamsMap, jogosArray) {
    if (!standingsData || standingsData.length === 0) {
        return [];
    }
    
    teamsMap = teamsMap || {};
    jogosArray = jogosArray || [];
    
    var gruposMap = {}; // {"Group A": {times: [], jogos: []}}
    var teamIdToGroup = {}; // {teamId: "Group A"} para mapear jogos
    
    // Agrupar times por grupo
    for (var i = 0; i < standingsData.length; i++) {
        var item = standingsData[i];
        var nomeGrupo = item.group || 'Grupo Desconhecido';
        
        if (!gruposMap[nomeGrupo]) {
            gruposMap[nomeGrupo] = {
                nome: normalizarNomeGrupo(nomeGrupo),
                times: [],
                jogos: []
            };
        }
        
        var goalsDiff = item.goalsDiff || 0;
        var saldoStr = goalsDiff >= 0 ? '+' + goalsDiff : goalsDiff.toString();
        
        // Buscar dados traduzidos do D_FOOTBALL_TEAMS
        var teamId = item.team.id;
        var teamData = teamsMap[teamId];
        
        // Mapear teamId -> grupo
        teamIdToGroup[teamId] = nomeGrupo;
        
        // REGRA: NUNCA usar nome em inglês - SEMPRE usar D_FOOTBALL_TEAMS
        var nomeTime = '[Time ' + teamId + ']';  // Placeholder se não encontrar
        var bandeira = null;
        
        if (teamData) {
            if (teamData.nome) {
                nomeTime = teamData.nome;
            } else {
                console.error('[tabela_futebol] ERRO CRITICO: Time ID=' + teamId + ' sem TEXTO2 (nome PT-BR) no D_FOOTBALL_TEAMS!');
            }
            
            if (teamData.bandeira) {
                bandeira = teamData.bandeira;
            } else {
                console.warn('[tabela_futebol] Time ID=' + teamId + ' (' + nomeTime + ') sem FOTO1 no D_FOOTBALL_TEAMS - usando fallback SVG');
                bandeira = converterLogoParaBandeira(item.team.logo, item.team.code);
            }
        } else {
            console.error('[tabela_futebol] ERRO CRITICO: Time ID=' + teamId + ' (' + item.team.name + '/' + item.team.code + ') NAO encontrado no D_FOOTBALL_TEAMS! Adicione registro com TITULO=' + teamId);
            bandeira = converterLogoParaBandeira(item.team.logo, item.team.code);
        }
        
        gruposMap[nomeGrupo].times.push({
            posicao:  item.rank,
            teamId:   teamId,
            nome:     nomeTime,
            bandeira: bandeira,
            pts:      (item.points || 0).toString(),
            pj:       (item.all.played || 0).toString(),
            vit:      (item.all.win || 0).toString(),
            emp:      (item.all.draw || 0).toString(),
            der:      (item.all.lose || 0).toString(),
            gm:       (item.all.goals['for'] || 0).toString(),
            gc:       (item.all.goals.against || 0).toString(),
            sg:       saldoStr
        });
    }
    
    // Associar jogos aos grupos
    console.log('[tabela_futebol] Associando ' + jogosArray.length + ' jogos aos grupos...');
    for (var j = 0; j < jogosArray.length; j++) {
        var jogo = jogosArray[j];
        var homeId = jogo.homeTeam.id;
        var awayId = jogo.awayTeam.id;
        
        var grupoHome = teamIdToGroup[homeId];
        var grupoAway = teamIdToGroup[awayId];
        
        // Apenas adiciona se ambos os times estão no mesmo grupo
        if (grupoHome && grupoHome === grupoAway && gruposMap[grupoHome]) {
            // Buscar nomes traduzidos
            var homeNome = teamsMap[homeId] ? teamsMap[homeId].nome : jogo.homeTeam.name;
            var awayNome = teamsMap[awayId] ? teamsMap[awayId].nome : jogo.awayTeam.name;
            var homeBandeira = teamsMap[homeId] ? teamsMap[homeId].bandeira : converterLogoParaBandeira(jogo.homeTeam.logo, null);
            var awayBandeira = teamsMap[awayId] ? teamsMap[awayId].bandeira : converterLogoParaBandeira(jogo.awayTeam.logo, null);
            
            // Formatar data/hora
            var dataFormatada = formatarDataJogo(jogo.date);
            
            gruposMap[grupoHome].jogos.push({
                time1: homeNome,
                time2: awayNome,
                bandeira1: homeBandeira,
                bandeira2: awayBandeira,
                gols1: jogo.goalsHome,
                gols2: jogo.goalsAway,
                data: dataFormatada.data,
                hora: dataFormatada.hora,
                local: jogo.venue,
                ao_vivo: jogo.status === 'LIVE' || jogo.status === '1H' || jogo.status === '2H'
            });
        }
    }
    
    // Converter map para array e ordenar times por posição
    var grupos = [];
    for (var key in gruposMap) {
        var grupo = gruposMap[key];
        
        // Ordenar times por posição (rank)
        grupo.times.sort(function(a, b) {
            return parseInt(a.posicao, 10) - parseInt(b.posicao, 10);
        });
        
        // Ordenar jogos por data
        grupo.jogos.sort(function(a, b) {
            if (!a.data || !b.data) return 0;
            var dataA = parseDataBrasileira(a.data + ' ' + (a.hora || '00:00'));
            var dataB = parseDataBrasileira(b.data + ' ' + (b.hora || '00:00'));
            return dataA - dataB;
        });
        
        console.log('[tabela_futebol] ' + grupo.nome + ': ' + grupo.jogos.length + ' jogos');
        grupos.push(grupo);
    }
    
    // Ordenar grupos por nome (Grupo A, B, C...)
    grupos.sort(function(a, b) {
        if (a.nome < b.nome) return -1;
        if (a.nome > b.nome) return 1;
        return 0;
    });
    
    console.log('[tabela_futebol] Grupos processados: ' + grupos.length);
    console.log('[tabela_futebol] Ordem dos grupos: ' + grupos.map(function(g) { return g.nome; }).join(' → '));
    return grupos;
}

/**
 * Formata data ISO para formato brasileiro
 * @param {string} isoDate - Data ISO (ex: "2026-06-21T19:00:00-03:00")
 * @returns {Object} {data: "21/06", hora: "19:00"}
 */
function formatarDataJogo(isoDate) {
    if (!isoDate) return {data: '', hora: ''};
    
    try {
        var d = new Date(isoDate);
        var dia = d.getDate();
        var mes = d.getMonth() + 1;
        var hora = d.getHours();
        var min = d.getMinutes();
        
        var diaStr = dia < 10 ? '0' + dia : dia.toString();
        var mesStr = mes < 10 ? '0' + mes : mes.toString();
        var horaStr = hora < 10 ? '0' + hora : hora.toString();
        var minStr = min < 10 ? '0' + min : min.toString();
        
        return {
            data: diaStr + '/' + mesStr,
            hora: horaStr + ':' + minStr
        };
    } catch (e) {
        console.warn('[tabela_futebol] Erro ao formatar data:', isoDate, e);
        return {data: '', hora: ''};
    }
}

/**
 * Parse data brasileira para Date object
 * @param {string} dataBr - Data no formato "21/06 19:00"
 * @returns {Date}
 */
function parseDataBrasileira(dataBr) {
    if (!dataBr) return new Date(0);
    
    try {
        var partes = dataBr.split(' ');
        var dataPartes = partes[0].split('/');
        var horaPartes = partes[1] ? partes[1].split(':') : ['0', '0'];
        
        var dia = parseInt(dataPartes[0], 10);
        var mes = parseInt(dataPartes[1], 10) - 1;
        var hora = parseInt(horaPartes[0], 10);
        var min = parseInt(horaPartes[1], 10);
        
        return new Date(2026, mes, dia, hora, min);
    } catch (e) {
        return new Date(0);
    }
}

/**
 * Extrai registro de patrocinador do D_SPD (CONFIG='1')
 * O patrocinador é aplicado GLOBALMENTE em todos os grupos.
 * SPECIALPROJECTS é apenas um ID administrativo, não limita a exibição.
 * @returns {Object|null} Item do patrocinador ou null
 */
function extrairSponsor(loader) {
    var spdLista = loader.datalist('D_SPD');
    if (!spdLista) {
        console.log('[tabela_futebol] D_SPD: sem datalist');
        return null;
    }
    
    // Buscar QUALQUER item CONFIG='1' (patrocinador global)
    for (var i = 0; i < spdLista.count(); i++) {
        var item = spdLista.get(i);
        var cfg = obterValorSpd(item, 'CONFIG');
        if (cfg === '1') {
            var specialProjectId = obterValorSpd(item, 'SPECIALPROJECTS');
            console.log('[tabela_futebol] D_SPD: patrocinador encontrado (SPECIALPROJECTS=' + specialProjectId + ')');
            return item;
        }
    }
    
    console.log('[tabela_futebol] D_SPD: nenhum patrocinador (CONFIG=1) encontrado');
    return null;
}

/* ====================================================
   MODO PLAYER (PRODUCAO / MOCK LOCAL)
   ==================================================== */
function playerView() {
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = {
            loaded:   function() { console.log('[Mock] loaded'); },
            finished: function() { console.log('[Mock] finished'); }
        };

        var todosGruposMock = MOCK_DATA.D_FOOTBALL.TEXTO2.grupos;
        var idx = parseInt(localStorage.getItem(LS_KEY_GRUPO), 10);
        if (isNaN(idx) || idx >= todosGruposMock.length) { idx = 0; }

        var grupo = todosGruposMock[idx];
        localStorage.setItem(LS_KEY_GRUPO, idx + 1);

        // Simular busca D_SPD por CONFIG=1 no mock
        var spdPatrocinador = null;
        var spdProjeto = null;
        if (MOCK_DATA.D_SPD && Array.isArray(MOCK_DATA.D_SPD)) {
            for (var i = 0; i < MOCK_DATA.D_SPD.length; i++) {
                if (MOCK_DATA.D_SPD[i].CONFIG === '1') {
                    spdPatrocinador = MOCK_DATA.D_SPD[i];
                } else if (MOCK_DATA.D_SPD[i].CONFIG === '0') {
                    spdProjeto = MOCK_DATA.D_SPD[i];
                }
            }
        }

        aplicarCores(mergeColorsFromSpd(CONFIG, spdPatrocinador));
        renderizarGrupo(grupo, spdPatrocinador, mockLoader);
        
    } else {
        // PRODUCAO: busca D_FOOTBALL_STANDINGS via XMLHttpRequest (amount=0 para todos os registros)
        ebhtml.create2({}, function(loader) {
            loader.addData('D_SPD', false, 'amount=0'); // Patrocinador (todos os registros)
            loader.autoloaded    = false;
            loader.nodataiserror = false;

            loader.load(function() {
                // Buscar D_FOOTBALL_STANDINGS com amount=0 via XMLHttpRequest
                var xhr = new XMLHttpRequest();
                xhr.open('GET', '/content/data/D_FOOTBALL_STANDINGS?amount=0', true);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState !== 4) { return; }
                    
                    if (xhr.status !== 200 && xhr.status !== 0) {
                        console.error('[tabela_futebol] ERRO: HTTP ' + xhr.status + ' ao buscar D_FOOTBALL_STANDINGS');
                        loader.finished();
                        return;
                    }
                    
                    try {
                        var parser = new DOMParser();
                        var xmlDoc = parser.parseFromString(xhr.responseText, 'text/xml');
                        var items = xmlDoc.getElementsByTagName('ITEM');
                        
                        if (items.length === 0) {
                            console.error('[tabela_futebol] ERRO: Sem dados D_FOOTBALL_STANDINGS');
                            loader.finished();
                            return;
                        }
                        
                        console.log('[tabela_futebol] D_FOOTBALL_STANDINGS retornou ' + items.length + ' ITEMs');
                        
                        // Iterar sobre TODOS os <ITEM> e concatenar os JSON arrays
                        var standingsData = [];
                        for (var i = 0; i < items.length; i++) {
                            var item = items[i];
                            var texto2Tag = item.getElementsByTagName('TEXTO2')[0];
                            var jsonStr = texto2Tag ? texto2Tag.textContent : '[]';
                            
                            try {
                                var itemData = JSON.parse(jsonStr);
                                if (Array.isArray(itemData)) {
                                    // Filtrar "Ranking of third-placed teams" (se necessário)
                                    var itemDataFiltrado = itemData.filter(function(entry) {
                                        return entry.group && entry.group.indexOf('Ranking') === -1;
                                    });
                                    standingsData = standingsData.concat(itemDataFiltrado);
                                }
                            } catch (e) {
                                console.warn('[tabela_futebol] ITEM[' + i + '] JSON parse error:', e);
                            }
                        }
                        
                        console.log('[tabela_futebol] Standings parseados: ' + standingsData.length + ' registros');
                        
                        // Contar grupos para debug
                        var gruposMap = {};
                        for (var j = 0; j < standingsData.length; j++) {
                            var grupo = standingsData[j].group;
                            if (grupo) {
                                gruposMap[grupo] = (gruposMap[grupo] || 0) + 1;
                            }
                        }
                        console.log('[tabela_futebol] Grupos encontrados: ' + Object.keys(gruposMap).length + ' grupos');
                        window.__standingsDebug__ = standingsData;
                        
                        if (standingsData.length === 0) {
                            console.error('[tabela_futebol] ERRO: Nenhum dado após parse');
                            loader.finished();
                            return;
                        }

                        // Buscar dados de TODOS os times do D_FOOTBALL_TEAMS de uma vez
                        buscarTodosOsTimesDeUmaVez(function(teamsMap) {
                            // Buscar dados de TODOS os jogos do D_FOOTBALL
                            buscarTodosOsJogos(function(jogosArray) {
                                // Processar dados para formato de grupos (com jogos)
                                var todosGrupos = processarStandingsParaGrupos(standingsData, teamsMap, jogosArray);

                                if (todosGrupos.length === 0) {
                                    console.error('[tabela_futebol] ERRO: Nenhum grupo criado');
                                    loader.finished();
                                    return;
                                }

                                // Selecionar grupo (rotação via localStorage)
                                var idx = parseInt(localStorage.getItem(LS_KEY_GRUPO), 10);
                                if (isNaN(idx) || idx >= todosGrupos.length) { idx = 0; }
                                var grupo = todosGrupos[idx];
                                console.log('[tabela_futebol] Rotação sequencial: índice atual=' + idx + ' de ' + todosGrupos.length + ' grupos');
                                console.log('[tabela_futebol] Exibindo: ' + grupo.nome + ' | Próximo reload será: ' + (todosGrupos[(idx + 1) % todosGrupos.length].nome));
                                localStorage.setItem(LS_KEY_GRUPO, idx + 1);

                                // Extrair patrocinador
                                var spdSponsor = extrairSponsor(loader);

                                // Renderizar
                                aplicarCores(mergeColorsFromSpd(CONFIG, spdSponsor));
                                renderizarGrupo(grupo, spdSponsor, loader);
                            });
                        });
                        
                    } catch (e) {
                        console.error('[tabela_futebol] ERRO ao processar XML:', e);
                        loader.finished();
                    }
                };
                
                xhr.onerror = function() {
                    console.error('[tabela_futebol] ERRO de rede ao buscar D_FOOTBALL_STANDINGS');
                    loader.finished();
                };
                
                xhr.send();
            });
        });
    }
}

/* --- Renderiza grupo: tabela + jogos + sponsor + playlist --- */
function renderizarGrupo(grupo, spdSponsor, loader, duracao) {

    // ✅ EBHTML: Avisar que o template carregou com sucesso IMEDIATAMENTE
    // (antes de qualquer animação ou intro de vídeo)
    loader.loaded();
    console.log('[tabela_futebol] loader.loaded() chamado — template registrado na playlist');

    aplicarSponsor(spdSponsor);

    document.getElementById('grupoNome').innerHTML = grupo.nome;

    var container = document.getElementById('tabelaLinhas');
    var tmpl = document.getElementById('tmplLinha');
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

        var bandEl = row.querySelector('[data-campo="bandeira"]');
        if (t.bandeira && bandEl) {
            carregarBandeira(bandEl, t.bandeira);
        }

        if (i < 2) { row.classList.add('tabela-linha--classificado'); }
        row.style.animationDelay = ((i + 1) * 0.18) + 's';

        container.appendChild(frag);
    }

    document.getElementById('mainContent').style.opacity = '1';
    renderizarJogos(grupo.jogos || []);

    var introMedia = obterValorSpd(spdSponsor, 'FILE_IMAGE1');
    var introMaxMs = obterDuracaoIntroMs(spdSponsor);

    if (introMedia) {
        var introStartTime = Date.now();
        mostrarIntro(introMedia, function() {
            var introActualMs = Date.now() - introStartTime;
            esconderIntro(function() {
                console.log('[tabela_futebol] intro=' + introActualMs + 'ms conteudo=' + DURACAO_CONTEUDO_MS + 'ms total=' + (introActualMs + DURACAO_CONTEUDO_MS) + 'ms');
                setTimeout(function() {
                    loader.finished();
                }, DURACAO_CONTEUDO_MS);
            });
        }, introMaxMs);
    } else {
        console.log('[tabela_futebol] sem intro conteudo=' + DURACAO_SEM_INTRO_MS + 'ms');
        setTimeout(function() {
            loader.finished();
        }, DURACAO_SEM_INTRO_MS);
    }
}

function renderizarJogos(jogos) {
    var container = document.getElementById('jogosLinhas');
    var tmpl = document.getElementById('tmplJogo');
    container.innerHTML = '';

    if (!jogos || jogos.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:2vmin 0;color:rgba(255,255,255,0.3);font-size:60%">Jogos a confirmar</div>';
        return;
    }

    for (var i = 0; i < jogos.length; i++) {
        var j = jogos[i];
        var frag = tmpl.content.cloneNode(true);
        var row = frag.firstElementChild;

        row.querySelector('[data-campo="time1"]').textContent = j.time1;
        row.querySelector('[data-campo="time2"]').textContent = j.time2;
        row.querySelector('[data-campo="local"]').textContent = j.local || '';

        var b1 = row.querySelector('[data-campo="bandeira1"]');
        var b2 = row.querySelector('[data-campo="bandeira2"]');
        if (j.bandeira1 && b1) { carregarBandeira(b1, j.bandeira1); }
        if (j.bandeira2 && b2) { carregarBandeira(b2, j.bandeira2); }

        // Placar ou horario: se jogo aconteceu mostra gols, senao mostra data+hora
        var placarEl  = row.querySelector('[data-campo="placar"]');
        var horarioEl = row.querySelector('[data-campo="horario"]');
        var aoVivo = j.ao_vivo || jogoEstaAoVivo(j.data, j.hora);
        if (aoVivo) {
            var g1 = (j.gols1 !== null && j.gols2 !== null) ? j.gols1 : 0;
            var g2 = (j.gols1 !== null && j.gols2 !== null) ? j.gols2 : 0;
            placarEl.textContent = g1 + ' x ' + g2;
            horarioEl.innerHTML  = '<span class="ao-vivo-dot"></span><span class="ao-vivo-badge">AO VIVO</span>';
            row.classList.add('jogo-linha--ao-vivo');
        } else if (j.gols1 !== null && j.gols2 !== null) {
            placarEl.textContent  = j.gols1 + ' x ' + j.gols2;
            horarioEl.textContent = j.data || '';
        } else {
            placarEl.textContent  = j.hora || '-';
            horarioEl.textContent = j.data || '';
        }

        row.style.animationDelay = ((i + 1) * 0.12) + 's';
        container.appendChild(frag);
    }
}

/* Detecta se jogo esta acontecendo agora (dentro de 110 min apos inicio) */
function jogoEstaAoVivo(dataJogo, horaJogo) {
    if (!dataJogo || !horaJogo) return false;
    var agora = new Date();
    var partes = dataJogo.split('/');
    var horaParts = horaJogo.split(':');
    if (partes.length < 2 || horaParts.length < 2) return false;
    var dia  = parseInt(partes[0], 10);
    var mes  = parseInt(partes[1], 10) - 1;
    var hora = parseInt(horaParts[0], 10);
    var min  = parseInt(horaParts[1], 10);
    var inicio       = new Date(agora.getFullYear(), mes, dia, hora, min, 0);
    var fimEstimado  = new Date(inicio.getTime() + 110 * 60 * 1000);
    return agora >= inicio && agora <= fimEstimado;
}

function aplicarSponsor(spdSponsor) {
    var footerEl = document.getElementById('sponsorFooter');
    if (!footerEl) { return; }

    var frase = '';
    var logo  = '';
    if (spdSponsor) {
        // Suporta objeto plano (mock) ou item EdgeContents (value())
        frase = (spdSponsor.TEXT1)       || (spdSponsor.value && spdSponsor.value('TEXT1')       && spdSponsor.value('TEXT1').value)       || '';
        logo  = (spdSponsor.IMAGE_LOGO)  || (spdSponsor.value && spdSponsor.value('IMAGE_LOGO')  && spdSponsor.value('IMAGE_LOGO').value)  || '';
    }

    if (frase || logo) {
        footerEl.classList.remove('hidden');
        var fraseEl = document.getElementById('sponsorFrase');
        var logoEl  = document.getElementById('sponsorLogo');
        if (fraseEl) { fraseEl.innerHTML = frase; }
        if (logoEl && logo) {
            logoEl.src = logo;
            logoEl.classList.remove('hidden');
        }
    } else {
        // Garantir que footer fique escondido quando não há sponsor
        footerEl.classList.add('hidden');
    }
}

/* ====================================================
   HELPERS DE INTRO / MEDIA
   ==================================================== */

function normalizarUrlMidia(url) {
    if (!url) { return url; }
    url = url.trim();
    if (url.indexOf('file:///') === 0 || url.indexOf('file://') === 0) {
        var partes     = url.replace(/\\/g, '/').split('/');
        var nomeArquivo = partes[partes.length - 1];
        var mId = nomeArquivo.match(/^f_(\d+)\./);
        if (mId) { return CONTENT_FILES_HOST + '/FILES/' + mId[1]; }
        return CONTENT_FILES_HOST + '/FILES/' + nomeArquivo;
    }
    return url;
}

function isUrlVideo(url) {
    if (!url) { return false; }
    return /\.(mp4|webm|mov|avi|ogv|ogg)(\?.*)?$/i.test(url.trim());
}

function mostrarIntro(url, onDone, introMaxMs) {
    var introEl = document.querySelector('#introScreen');
    if (!introEl) { onDone(); return; }

    var isVideo = isUrlVideo(url);
    url = normalizarUrlMidia(url);
    console.log('[tabela_futebol] intro (' + (isVideo ? 'video' : 'imagem') + '): ' + url + (introMaxMs > 0 ? ' max=' + introMaxMs + 'ms' : ' sem limite'));

    introEl.innerHTML = '';
    introEl.style.opacity = '1';
    introEl.classList.remove('hidden');

    if (isVideo) {
        var vid = document.createElement('video');
        vid.className = 'w-full h-full object-cover';
        vid.setAttribute('playsinline', '');
        vid.muted = true;
        introEl.appendChild(vid);

        var _introDone  = false;
        var _introTimer = null;
        function _onIntroDone() {
            if (_introDone) { return; }
            _introDone = true;
            if (_introTimer) { clearTimeout(_introTimer); }
            onDone();
        }
        if (introMaxMs > 0) {
            _introTimer = setTimeout(function() {
                console.log('[intro-video] timeout ' + introMaxMs + 'ms — cortando');
                vid.pause();
                _onIntroDone();
            }, introMaxMs);
        }

        vid.addEventListener('ended', function() { console.log('[intro-video] ended'); _onIntroDone(); });
        vid.addEventListener('error', function() {
            var code = vid.error ? vid.error.code : '?';
            console.error('[intro-video] error code=' + code);
            _onIntroDone();
        });

        vid.addEventListener('canplay', function onFirstCanPlay() {
            vid.removeEventListener('canplay', onFirstCanPlay);
            var p = vid.play();
            if (p && typeof p.then === 'function') {
                p.then(null, function(err) {
                    console.error('[intro-video] play() falhou:', err);
                    _onIntroDone();
                });
            }
        });

        vid.src = url;
        vid.load();
    } else {
        var imgMs = introMaxMs > 0 ? introMaxMs : DURACAO_IMAGEM_PADRAO_MS;
        var img = document.createElement('img');
        img.className = 'w-full h-full object-cover';
        img.onload  = function() { setTimeout(onDone, imgMs); };
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
