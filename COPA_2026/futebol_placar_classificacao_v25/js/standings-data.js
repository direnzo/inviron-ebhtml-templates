/**
 * standings-data.js — Bridge dos D_FOOTBALL_STANDINGS
 * ES5 obrigatorio
 *
 * Carrega D_FOOTBALL_STANDINGS via XHR e monta um cache
 * global _STANDINGS_CACHE com { "Group A": [{ rank, teamId, nome, ... }] }
 *
 * Funcoes de consulta:
 *   buscarTimePorGrupoEPosicao('Group A', 1) → { teamId, nome, bandeira }
 *   buscarGrupoPorTeamId('6') → 'Group A'
 *   enriquecerComStandings(dados) → resolve slots "1oA", "3oCEFHI"
 */

var _STANDINGS_CACHE = null;

/**
 * Carrega D_FOOTBALL_STANDINGS via XHR e armazena em _STANDINGS_CACHE.
 * Callback opcional chamado quando terminar (mesmo em erro).
 */
function carregarStandingsXHR(callback) {
    if (_STANDINGS_CACHE) {
        if (callback) { callback(); }
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/content/data/D_FOOTBALL_STANDINGS?amount=0&order=ID&orderkind=A', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) { return; }
        if (xhr.status === 200 || xhr.status === 0) {
            _STANDINGS_CACHE = parsearStandingsXML(xhr.responseText);
        } else {
            console.error('[standings-data] HTTP ' + xhr.status);
            _STANDINGS_CACHE = {};
        }
        if (callback) { callback(); }
    };
    xhr.onerror = function() {
        console.error('[standings-data] Erro de rede');
        _STANDINGS_CACHE = {};
        if (callback) { callback(); }
    };
    xhr.send();
}

/**
 * Parseia XML de D_FOOTBALL_STANDINGS.
 * Retorna { "Group A": [ { rank, teamId, nome, bandeira, codigo }, ... ] }
 */
function parsearStandingsXML(xmlString) {
    var result = {};
    if (!xmlString) { return result; }

    try {
        var parser = new DOMParser();
        var doc = parser.parseFromString(xmlString, 'text/xml');
        var items = doc.getElementsByTagName('ITEM');

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var getTag = function(tag) {
                var el = item.getElementsByTagName(tag)[0];
                return el ? (el.textContent || '').trim() : '';
            };

            var texto2 = getTag('TEXTO2');
            if (!texto2) { continue; }

            try {
                var parsed = JSON.parse(texto2);
                if (!Array.isArray(parsed)) { continue; }

                for (var j = 0; j < parsed.length; j++) {
                    var entry = parsed[j];
                    if (!entry || !entry.group) { continue; }

                    var grupoNome = entry.group;

                    if (!result[grupoNome]) {
                        result[grupoNome] = [];
                    }

                    result[grupoNome].push({
                        rank: entry.rank || 0,
                        teamId: String(entry.team ? entry.team.id : ''),
                        nome: entry.team ? entry.team.name : '',
                        logo: (entry.team && entry.team.logo) ? entry.team.logo : '',
                        points: entry.points || 0,
                        goalsDiff: entry.goalsDiff || 0,
                        played: (entry.all && entry.all.played) || 0
                    });
                }
            } catch (e) {
                console.warn('[standings-data] Erro ao parsear TEXTO2:', e);
            }
        }
    } catch (e) {
        console.error('[standings-data] Erro ao parsear XML:', e);
    }

    // Ordena cada grupo por rank
    for (var g in result) {
        if (result.hasOwnProperty(g)) {
            result[g].sort(function(a, b) { return a.rank - b.rank; });
        }
    }

    console.log('[standings-data] Grupos carregados:', Object.keys(result).length);
    return result;
}

/**
 * Retorna o time na posicao N de um grupo.
 * Ex: buscarTimePorGrupoEPosicao('Group A', 1) → { teamId: '6', nome: 'Brasil', ... }
 */
function buscarTimePorGrupoEPosicao(grupoNome, posicao) {
    if (!_STANDINGS_CACHE) { return null; }
    var times = _STANDINGS_CACHE[grupoNome];
    if (!times) { return null; }
    for (var i = 0; i < times.length; i++) {
        if (times[i].rank === posicao) {
            return times[i];
        }
    }
    return null;
}

/**
 * Retorna o nome do grupo onde um teamId esta.
 * Ex: buscarGrupoPorTeamId('6') → 'Group A' (ou 'Grupo A' se normalizado)
 */
function buscarGrupoPorTeamId(teamId) {
    if (!_STANDINGS_CACHE || !teamId) { return null; }
    var idStr = String(teamId);
    for (var g in _STANDINGS_CACHE) {
        if (_STANDINGS_CACHE.hasOwnProperty(g)) {
            var times = _STANDINGS_CACHE[g];
            for (var i = 0; i < times.length; i++) {
                if (times[i].teamId === idStr) {
                    return g;
                }
            }
        }
    }
    return null;
}

/**
 * Enriquece um objeto de dados de partidas resolvendo strings
 * de grupo como "1oA", "3oCEFHI" usando o cache de standings.
 *
 * @param {Object} dados — { "R32_1": { timeCasa: "1oA", ... }, ... }
 * @returns {Object} mesmo objeto com nomes resolvidos
 */
function enriquecerComStandings(dados) {
    if (!_STANDINGS_CACHE || !dados) { return dados; }

    for (var chave in dados) {
        if (!dados.hasOwnProperty(chave)) { continue; }
        var partida = dados[chave];

        if (partida.timeCasa && !timeNomeValido(partida.timeCasa)) {
            var resolvido = resolverStringGrupo(partida.timeCasa);
            if (resolvido) {
                partida.timeCasa = resolvido.nome;
                partida.flagCasa = resolvido.bandeira || partida.flagCasa;
            }
        }

        if (partida.timeVisitante && !timeNomeValido(partida.timeVisitante)) {
            var resolvido = resolverStringGrupo(partida.timeVisitante);
            if (resolvido) {
                partida.timeVisitante = resolvido.nome;
                partida.flagVisitante = resolvido.bandeira || partida.flagVisitante;
            }
        }
    }

    return dados;
}

/**
 * Verifica se um nome de time e valido (nao e placeholder).
 */
function timeNomeValido(nome) {
    if (!nome) { return false; }
    var n = nome.toUpperCase();
    return !(n === 'TBD' || n === 'A DEFINIR' || n === '' ||
             /^\d+[oOº][A-Z]+$/.test(nome)); // "1oA", "3oCEFHI"
}

/**
 * Resolve string de grupo "1oA" ou "3oCEFHI" para nome real do time.
 *
 * Padroes:
 *   "1oA", "2oB" → posicao 1 do Grupo A, posicao 2 do Grupo B
 *   "3oCEFHI"    → 3o lugar no ranking entre Grupos C,E,F,H,I
 *
 * @param {string} texto — ex: "1oA" ou "3oCEFHI"
 * @returns {Object|null} { nome, bandeira } ou null
 */
function resolverStringGrupo(texto) {
    if (!texto) { return null; }

    var match = texto.match(/^(\d+)[oOº]\s*([A-Z]+)$/);
    if (!match) { return null; }

    var posicao = parseInt(match[1], 10);
    var gruposLetras = match[2]; // "A" ou "CEFHI"

    // Grupo unico: "1oA" → buscar 1o do Group A
    if (gruposLetras.length === 1) {
        var grupoNome = 'Group ' + gruposLetras;
        var time = buscarTimePorGrupoEPosicao(grupoNome, posicao);
        if (time) {
            return { nome: time.nome, bandeira: time.logo };
        }
        // Tenta "Grupo " tambem (pt-br)
        var grupoPt = 'Grupo ' + gruposLetras;
        time = buscarTimePorGrupoEPosicao(grupoPt, posicao);
        if (time) {
            return { nome: time.nome, bandeira: time.logo };
        }
    }

    // Multiplos grupos: "3oCEFHI" → ranking de terceiros
    if (gruposLetras.length > 1) {
        // Procura por "Ranking of third-placed teams"
        var rankingKey = null;
        for (var g in _STANDINGS_CACHE) {
            if (_STANDINGS_CACHE.hasOwnProperty(g)) {
                var gl = g.toLowerCase();
                if (gl.indexOf('ranking') !== -1 || gl.indexOf('terceiro') !== -1) {
                    rankingKey = g;
                    break;
                }
            }
        }
        if (rankingKey) {
            var timesRanking = _STANDINGS_CACHE[rankingKey];
            if (timesRanking && timesRanking.length >= posicao) {
                var t = timesRanking[posicao - 1];
                return { nome: t.nome, bandeira: t.logo };
            }
        }
    }

    return null;
}
