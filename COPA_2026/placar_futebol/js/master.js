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

/* ====================================================
   SVG INJECTION VIA XHR (compatível com WebKit legado)
   Injeta SVG inline no DOM (evita problema de <img src="*.svg">)
   ==================================================== */
function carregarSvgInline(containerEl, src, onSuccess, onError) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', src, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) { return; }
        
        if (xhr.status === 200 || xhr.status === 0) {
            try {
                // Remover SVG antigo se existir
                var svgEl = containerEl.querySelector('svg');
                if (svgEl) { svgEl.parentNode.removeChild(svgEl); }
                
                // Injetar novo SVG
                containerEl.innerHTML = xhr.responseText;
                var svg = containerEl.querySelector('svg');
                
                if (svg) {
                    svg.style.width = '100%';
                    svg.style.height = '100%';
                    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                    console.log('[placar_futebol] ✅ SVG injetado: ' + src);
                    if (onSuccess) { onSuccess(); }
                } else {
                    console.error('[placar_futebol] Arquivo não contém SVG válido: ' + src);
                    if (onError) { onError(); }
                }
            } catch (e) {
                console.error('[placar_futebol] Erro ao injetar SVG:', e);
                if (onError) { onError(); }
            }
        } else {
            console.error('[placar_futebol] HTTP ' + xhr.status + ' ao carregar SVG: ' + src);
            if (onError) { onError(); }
        }
    };
    
    xhr.onerror = function() {
        console.error('[placar_futebol] Erro de rede ao carregar SVG: ' + src);
        if (onError) { onError(); }
    };
    
    xhr.send();
}

/* ====================================================
   MAPEAMENTO DE BANDEIRAS SVG (Copa 2026 - 48 Times)
   Mapeia códigos de 3 letras (TEXTO3) para arquivos SVG locais
   ==================================================== */
function mapearCodigoParaSVG(code) {
    if (!code) { return null; }
    
    var mapa = {
        // CONCACAF (16 times)
        'USA': 'us',   'MEX': 'mx',   'CAN': 'ca',   'PAN': 'pa',
        
        // CONMEBOL (6 times)
        'ARG': 'ar',   'BRA': 'br',   'URU': 'uy',   'ECU': 'ec',
        'COL': 'co',   'PAR': 'py',
        
        // UEFA (16 times)
        'ENG': 'gb-eng', 'FRA': 'fr',   'ESP': 'es',   'POR': 'pt',
        'GER': 'de',   'NED': 'nl',   'BEL': 'be',   'CRO': 'hr',
        'SCO': 'gb-sct', 'SUI': 'ch',   'AUT': 'at',   'CZE': 'cz',
        'CZR': 'cz',   'SWE': 'se',   'NOR': 'no',   'TUR': 'tr',
        
        // CAF (9 times)
        'MAR': 'ma',   'MOR': 'ma',   'SEN': 'sn',   'TUN': 'tn',
        'EGY': 'eg',   'GHA': 'gh',   'ALG': 'dz',   'DZA': 'dz',
        'SOU': 'za',   'RSA': 'za',   'ZAF': 'za',   'SAF': 'za',
        
        // AFC (8 times)
        'JPN': 'jp',   'KOR': 'kr',   'AUS': 'au',   'IRN': 'ir',
        'IRA': 'ir',   'SAU': 'sa',   'KSA': 'sa',   'QAT': 'qa',
        'IRQ': 'iq',   'JOR': 'jo',   'UZB': 'uz',
        
        // Outros
        'NZL': 'nz',   'HAI': 'ht',   'HTI': 'ht',   'CUW': 'cw',
        'CPV': 'cv',   'CAP': 'cv',   'COD': 'cd',   'BIH': 'ba',
        'CIV': 'ci',   'CHI': 'ci'
    };
    
    var upper = code.toUpperCase();
    var codigo = mapa[upper];
    
    if (!codigo) {
        // Fallback: tenta primeiras 2 letras minúsculas
        codigo = code.toLowerCase().substring(0, 2);
    }
    
    return codigo;
}

/**
 * Obtém caminho da bandeira SVG de alta qualidade
 * @param {string} teamCode - Código de 3 letras do time (ex: "BRA", "MOR")
 * @param {string} fallbackUrl - URL PNG de fallback (opcional)
 * @returns {string} Caminho do SVG local ou fallback
 */
function obterBandeiraSVG(teamCode, fallbackUrl) {
    if (!teamCode) {
        console.warn('[placar_futebol] obterBandeiraSVG: código vazio, usando fallback');
        return fallbackUrl || 'img/flags/br.svg'; // fallback padrão
    }
    
    var codigoSVG = mapearCodigoParaSVG(teamCode);
    
    if (codigoSVG) {
        var caminhoSVG = 'img/flags/' + codigoSVG + '.svg';
        console.log('[placar_futebol] Bandeira SVG: ' + teamCode + ' → ' + caminhoSVG);
        return caminhoSVG;
    }
    
    console.warn('[placar_futebol] ⚠️ Bandeira não mapeada: ' + teamCode + ' (usando fallback)');
    return fallbackUrl || 'img/flags/br.svg';
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
   CONFIGURAÇÃO DO PROJETO ESPECIAL
   ⚠️ ALTERAR CONFORME CLIENTE
   
   IMPORTANTE: Este valor é usado como FILTRO inicial na consulta.
   Após a consulta, o valor real do SPECIALPROJECT é extraído
   do XML retornado e usado para identificar qual projeto está ativo.
   
   Se quiser buscar QUALQUER projeto (sem filtro), use string vazia: ''
   Exemplo: 
     - SPECIAL_PROJECT_ID = '17' → busca apenas projeto com ID 17
     - SPECIAL_PROJECT_ID = ''   → busca qualquer projeto (rotação livre)
   ==================================================== */
var SPECIAL_PROJECT_ID = '17'; // ⚠️ Alterar conforme cliente OU deixar vazio para qualquer

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

/* ====================================================
   HELPER: Busca time individual no D_FOOTBALL_TEAMS
   Usa loader.addData() com filtro f_titulo={teamId}
   Callback: function(timeData) recebe objeto com campos do time
   ==================================================== */
function buscarTime(teamId, loader, callback) {
    /**
     * Consulta D_FOOTBALL_TEAMS com filtro f_titulo={teamId}
     * Filtro: f_titulo={teamId} - busca time específico por ID
     * Campos retornados: FOTO (bandeira), TEXTO2 (nome PT-BR), TEXTO3 (código 3 letras)
     */
    console.log('[placar_futebol] Carregando time: f_titulo=' + teamId);
    
    loader.addData('D_FOOTBALL_TEAMS', false, 'f_titulo=' + teamId);
    loader.load(function() {
        var timeData = loader.data('D_FOOTBALL_TEAMS');
        
        if (!timeData) {
            console.error('[placar_futebol] ERRO: Time ID=' + teamId + ' não encontrado');
            callback(null);
            return;
        }
        
        var teamCode = obterValor(timeData, 'TEXTO3');
        var teamNome = obterValor(timeData, 'TEXTO2');
        var fallbackUrl = obterValor(timeData, 'FOTO');
        
        var timeObj = {
            id: teamId,
            nome: teamNome,
            codigo: teamCode,
            bandeira: obterBandeiraSVG(teamCode, fallbackUrl), // SVG de alta qualidade
            bandeiraFallback: fallbackUrl // URL PNG de fallback (caso SVG não exista)
        };
        
        console.log('[placar_futebol] Time carregado: ' + timeObj.nome + ' (' + timeObj.codigo + ') | Bandeira: ' + timeObj.bandeira + ' | Fallback: ' + (fallbackUrl ? fallbackUrl.substring(0, 40) + '...' : 'nenhum'));
        callback(timeObj);
    });
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
    s.setProperty('--cor-texto-sec',     hexToRgba(cfg.corClara,    0.90));
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
        console.log('[placar_futebol] ========= MODO MOCK ATIVADO =========');
        console.log('[placar_futebol] Cenário: ' + cenario);
        
        // Mock Loader que simula ebhtml API
        var mockLoader = {
            _dataCache: {},
            
            addData: function(channel, autoload, filter) {
                console.log('[mock] addData: ' + channel + ' | filtro: ' + filter);
                // Armazena configuração para consulta posterior
                this._dataCache[channel] = {filter: filter || '', data: null};
            },
            
            load: function(callback) {
                // Simula carregamento assíncrono
                setTimeout(function() {
                    callback();
                }, 10);
            },
            
            data: function(channel, autoload, filter) {
                // Simula consulta de dados
                if (channel === 'D_SPD') {
                    var f = filter || this._dataCache[channel].filter;
                    if (f.indexOf('f_config=1') >= 0) {
                        return MOCK_DATA.spdSponsor;
                    } else if (f.indexOf('f_config=0') >= 0) {
                        return MOCK_DATA.spdData;
                    }
                } else if (channel === 'D_FOOTBALL') {
                    return MOCK_DATA.footballData;
                } else if (channel === 'D_FOOTBALL_TEAMS') {
                    var teamIdMatch = (filter || '').match(/f_titulo=(\d+)/);
                    if (teamIdMatch) {
                        var teamId = teamIdMatch[1];
                        return MOCK_DATA.teams[teamId] || null;
                    }
                }
                return null;
            },
            
            loaded: function() {
                console.log('[mock] loaded()');
            },
            
            finished: function() {
                console.log('[mock] finished()');
            }
        };
        
        // Executar mesmo fluxo do código de produção
        console.log('[placar_futebol] === INÍCIO DO CARREGAMENTO (MOCK) ===');
        
        mockLoader.addData('D_SPD', false, 'f_config=1&f_specialproject=17');
        mockLoader.addData('D_SPD', false, 'f_config=0&f_type=10');
        mockLoader.addData('D_FOOTBALL', false);
        mockLoader.addData('D_FOOTBALL_TEAMS', false);
        
        mockLoader.load(function() {
            var spdSponsor = mockLoader.data('D_SPD', false, 'f_config=1&f_specialproject=17');
            var spdData = mockLoader.data('D_SPD', false, 'f_config=0&f_type=10');
            
            if (!spdData || !spdData.TITLE) {
                console.error('[placar_futebol][mock] D_SPD sem TITLE');
                mockLoader.finished();
                return;
            }
            
            var partidaId = spdData.TITLE.trim();
            console.log('[placar_futebol][mock] D_SPD.TITLE = "' + partidaId + '"');
            
            // Aplicar cores do patrocinador
            aplicarCores(mergeColorsFromSpd(CONFIG, spdSponsor));
            
            // Buscar partida
            if (partidaId.toUpperCase() === 'STANDINGS') {
                console.log('[placar_futebol][mock] STANDINGS não implementado no mock');
                mockLoader.finished();
                return;
            }
            
            console.log('[placar_futebol][mock] FLUXO PARTIDA detectado (ID=' + partidaId + ')');
            carregarPartida(partidaId, spdData, spdSponsor, mockLoader);
        });
        
        return;
    }

    // EdgeContents real
    ebhtml.create2({}, function(loader) {
        /**
         * FLUXO OFICIAL DE CONSULTAS (conforme MAPEAMENTO_CONSULTAS.md):
         * 1. D_SPD (Patrocinador) - f_config=1&f_specialproject=spdataXXX
         * 2. D_SPD (Jogo/Classificação) - f_config=0&f_type=10
         * 3. Decisão condicional baseada em D_SPD.TITLE:
         *    - Se TITLE === "STANDINGS" → D_FOOTBALL_STANDINGS (amount=0)
         *    - Se TITLE === ID numérico → D_FOOTBALL (f_titulo={ID}) + D_FOOTBALL_TEAMS (2x)
         */
        
        console.log('[placar_futebol] === INÍCIO DO CARREGAMENTO ===');
        
        /* ===== CONSULTA 1: D_SPD (Patrocinador) ===== */
        var filtroSponsor = 'f_config=1';
        if (SPECIAL_PROJECT_ID && SPECIAL_PROJECT_ID !== '') {
            filtroSponsor += '&f_specialproject=' + SPECIAL_PROJECT_ID;
            console.log('[placar_futebol] [1/4] Carregando patrocinador: ' + filtroSponsor);
        } else {
            console.log('[placar_futebol] [1/4] Carregando patrocinador: f_config=1 (sem filtro - qualquer projeto)');
        }
        
        loader.addData('D_SPD', false, filtroSponsor);
        loader.autoloaded = false;
        loader.nodataiserror = false;

        loader.load(function() {
            var spdSponsor = loader.data('D_SPD');
            
            // Extrair SPECIALPROJECT do XML retornado (valor dinâmico)
            var specialProjectAtivo = null;
            if (spdSponsor) {
                specialProjectAtivo = obterValor(spdSponsor, 'SPECIALPROJECT');
                console.log('[placar_futebol] ✅ Patrocinador carregado | SPECIALPROJECT=' + specialProjectAtivo);
                console.log('[placar_futebol] Frase: ' + obterValor(spdSponsor, 'TEXT1'));
                console.log('[placar_futebol] Cores: ' + obterValor(spdSponsor, 'COLOR1') + '/' + 
                    obterValor(spdSponsor, 'COLOR2') + '/' + obterValor(spdSponsor, 'COLOR3'));
                console.log('[placar_futebol] Intro: ' + obterValor(spdSponsor, 'FILE_IMAGE1'));
                console.log('[placar_futebol] Logo: ' + obterValor(spdSponsor, 'IMAGE_LOGO'));
                console.log('[placar_futebol] Duração: ' + obterValor(spdSponsor, 'TEXT2') + 's');
                
                // Validar se corresponde ao filtro (se houver filtro)
                if (SPECIAL_PROJECT_ID && SPECIAL_PROJECT_ID !== '' && specialProjectAtivo !== SPECIAL_PROJECT_ID) {
                    console.warn('[placar_futebol] ⚠️ ATENÇÃO: SPECIALPROJECT retornado (' + specialProjectAtivo + 
                        ') difere do filtro configurado (' + SPECIAL_PROJECT_ID + ')');
                }
            } else {
                console.log('[placar_futebol] ❌ Sem patrocinador (CONFIG=1)');
                if (SPECIAL_PROJECT_ID && SPECIAL_PROJECT_ID !== '') {
                    console.warn('[placar_futebol] ⚠️ Filtro configurado: SPECIAL_PROJECT_ID=' + SPECIAL_PROJECT_ID);
                    console.warn('[placar_futebol] ⚠️ Verifique se existe projeto com f_specialproject=' + SPECIAL_PROJECT_ID);
                }
            }
            
            /* ===== CONSULTA 2: D_SPD (Jogo/Classificação) ===== */
            console.log('[placar_futebol] [2/4] Carregando jogo atual: f_config=0&f_type=10');
            loader.addData('D_SPD', false, 'f_config=0&f_type=10');
            
            loader.load(function() {
                var spdData = loader.data('D_SPD');
                
                if (!spdData) {
                    console.log('[placar_futebol] D_SPD sem dados (TYPE=10) — skip');
                    loader.finished();
                    return;
                }
                
                var partidaId = obterValor(spdData, 'TITLE').trim();
                console.log('[placar_futebol] D_SPD.TITLE = "' + partidaId + '"');
                
                if (!partidaId) {
                    console.log('[placar_futebol] TITLE vazio — skip');
                    loader.finished();
                    return;
                }
                
                /* ===== DECISÃO CONDICIONAL: STANDINGS vs PARTIDA ===== */
                if (partidaId.toUpperCase() === 'STANDINGS') {
                    console.log('[placar_futebol] [3/4] FLUXO STANDINGS detectado');
                    carregarStandings(spdData, spdSponsor, loader);
                } else {
                    console.log('[placar_futebol] [3/4] FLUXO PARTIDA detectado (ID=' + partidaId + ')');
                    carregarPartida(partidaId, spdData, spdSponsor, loader);
                }
            });
        });
    });
}

/* ====================================================
   CARREGA DADOS DE PARTIDA (TITLE ≠ "STANDINGS")
   Fluxo: D_FOOTBALL → extrai IDs times → D_FOOTBALL_TEAMS (2x) → processarDados()
   ==================================================== */
function carregarPartida(partidaId, spdData, spdSponsor, loader) {
    /**
     * Consulta D_FOOTBALL com filtro f_titulo={partidaId}
     * Filtro: f_titulo={partidaId} - ID da partida obtido do D_SPD.TITLE
     * Campos: DATE, CATEGORY, TEXTO2 (JSON), TEXTO4 (rodada), TEXTO5 (status)
     */
    console.log('[placar_futebol] Carregando partida: f_titulo=' + partidaId);
    loader.addData('D_FOOTBALL', false, 'f_titulo=' + partidaId);
    
    loader.load(function() {
        var footballData = loader.data('D_FOOTBALL');
        
        if (!footballData) {
            console.log('[placar_futebol] D_FOOTBALL sem dados para ID=' + partidaId);
            loader.finished();
            return;
        }
        
        console.log('[placar_futebol] D_FOOTBALL carregado | Rodada: ' + obterValor(footballData, 'TEXTO4'));
        
        // Extrair IDs dos times do JSON
        var footballJson = obterValor(footballData, 'TEXTO2');
        var homeTeamId = null;
        var awayTeamId = null;
        
        if (footballJson) {
            try {
                var parsed = JSON.parse(footballJson);
                if (parsed.response && parsed.response.length > 0) {
                    homeTeamId = parsed.response[0].teams.home.id;
                    awayTeamId = parsed.response[0].teams.away.id;
                    console.log('[placar_futebol] Times extraídos do JSON: home=' + homeTeamId + ', away=' + awayTeamId);
                }
            } catch (e) {
                console.error('[placar_futebol] Erro ao parsear JSON:', e);
            }
        }
        
        if (!homeTeamId || !awayTeamId) {
            console.error('[placar_futebol] ERRO: IDs dos times não encontrados no JSON');
            loader.finished();
            return;
        }
        
        /* ===== CONSULTA TIMES (sequencial) ===== */
        console.log('[placar_futebol] [4/4] Carregando times...');
        
        buscarTime(homeTeamId, loader, function(timeHome) {
            if (!timeHome) {
                console.error('[placar_futebol] ERRO: Time casa não encontrado (ID=' + homeTeamId + ')');
                loader.finished();
                return;
            }
            
            buscarTime(awayTeamId, loader, function(timeAway) {
                if (!timeAway) {
                    console.error('[placar_futebol] ERRO: Time visitante não encontrado (ID=' + awayTeamId + ')');
                    loader.finished();
                    return;
                }
                
                console.log('[placar_futebol] === DADOS COMPLETOS ===');
                console.log('[placar_futebol] ' + timeHome.nome + ' x ' + timeAway.nome);
                
                aplicarCores(mergeColorsFromSpd(CONFIG, spdSponsor));
                processarDados(spdData, spdSponsor, footballData, loader, timeHome, timeAway);
            });
        });
    });
}

/* ====================================================
   CARREGA DADOS DE CLASSIFICAÇÃO (TITLE = "STANDINGS")
   Fluxo: D_FOOTBALL_STANDINGS → extrai IDs times → D_FOOTBALL_TEAMS (N x) → renderizar
   ==================================================== */
function carregarStandings(spdData, spdSponsor, loader) {
    /**
     * Consulta D_FOOTBALL_STANDINGS com amount=0
     * Filtro: amount=0 - busca todos os grupos (rotação automática pelo loader)
     * Campos: CATEGORY, TEXTO3 (nome grupo), TEXTO2 (JSON array), TITULO (sempre "1")
     */
    console.log('[placar_futebol] Carregando standings: amount=0');
    loader.addData('D_FOOTBALL_STANDINGS', false, 'amount=0');
    
    loader.load(function() {
        var standings = loader.data('D_FOOTBALL_STANDINGS');
        
        if (!standings) {
            console.log('[placar_futebol] D_FOOTBALL_STANDINGS sem dados');
            loader.finished();
            return;
        }
        
        var nomeGrupo = obterValor(standings, 'TEXTO3');
        var liga = obterValor(standings, 'CATEGORY');
        console.log('[placar_futebol] Classificação: ' + nomeGrupo + ' | ' + liga);
        
        // Parse do JSON
        var grupoJson = null;
        try {
            grupoJson = JSON.parse(obterValor(standings, 'TEXTO2'));
        } catch (e) {
            console.error('[placar_futebol] Erro ao parsear JSON do grupo:', e);
            loader.finished();
            return;
        }
        
        if (!grupoJson || grupoJson.length === 0) {
            console.log('[placar_futebol] Grupo vazio');
            loader.finished();
            return;
        }
        
        console.log('[placar_futebol] [4/4] Grupo tem ' + grupoJson.length + ' times');
        console.warn('[placar_futebol] TODO: Implementar renderização de standings');
        console.warn('[placar_futebol] Por enquanto, apenas finaliza o template');
        
        // TODO: Buscar dados de cada time e renderizar tabela
        // Por enquanto, apenas aplica cores e finaliza
        aplicarCores(mergeColorsFromSpd(CONFIG, spdSponsor));
        loader.loaded();
        
        setTimeout(function() {
            loader.finished();
        }, 5000);
    });
}

/* ====================================================
   PROCESSA OS DADOS E RENDERIZA
   spdData, spdSponsor, footballData já resolvidos;
   timeHome, timeAway: objetos com {id, nome, codigo, bandeira}
   loader (D_SPD) controla a playlist
   ==================================================== */
function processarDados(spdData, spdSponsor, footballData, loader, timeHome, timeAway) {

    // Parse do JSON do D_FOOTBALL.TEXTO2 para extrair dados da API-Football
    var footballJson = obterValor(footballData, 'TEXTO2');
    var fixtureData = null;
    
    // Dados dos times já foram buscados (via buscarTime)
    var homeTeamName = timeHome.nome;
    var awayTeamName = timeAway.nome;
    var homeTeamLogo = timeHome.bandeira;
    var awayTeamLogo = timeAway.bandeira;
    var homeTeamFallback = timeHome.bandeiraFallback || '';
    var awayTeamFallback = timeAway.bandeiraFallback || '';
    
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
        foto1Fallback: homeTeamFallback, // PNG fallback para time 1
        foto2Fallback: awayTeamFallback, // PNG fallback para time 2
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
    
    // Log de patrocinador
    if (dados.introMedia || dados.patroLogo || dados.patroFrase) {
        console.log('[placar_futebol] 🎬 PATROCINADOR ATIVO:');
        if (dados.introMedia) {
            console.log('[placar_futebol]   - Intro: ' + dados.introMedia.substring(0, 50) + '...');
            console.log('[placar_futebol]   - Duração intro: ' + dados.introDuracaoMs + 'ms');
        }
        if (dados.patroLogo) {
            console.log('[placar_futebol]   - Logo: ' + dados.patroLogo.substring(0, 50) + '...');
        }
        if (dados.patroFrase) {
            console.log('[placar_futebol]   - Frase: ' + dados.patroFrase);
        }
    } else {
        console.log('[placar_futebol] ⚠️ SEM PATROCINADOR (campos vazios ou spdSponsor null)');
    }

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
    
    console.log('[placar_futebol] === RENDERIZANDO TEMPLATE ===');
    console.log('[placar_futebol] Time 1: ' + dados.time1 + ' | SVG: ' + dados.foto1 + ' | Fallback: ' + (dados.foto1Fallback ? dados.foto1Fallback.substring(0, 40) + '...' : 'nenhum'));
    console.log('[placar_futebol] Time 2: ' + dados.time2 + ' | SVG: ' + dados.foto2 + ' | Fallback: ' + (dados.foto2Fallback ? dados.foto2Fallback.substring(0, 40) + '...' : 'nenhum'));
    
    // ❌ Validar dados ANTES de chamar loader.loaded()
    if (!dados || !dados.time1 || !dados.time2) {
        console.error('[placar_futebol] sem dados para exibir');
        // ❌ ERRO: NÃO chamar loader.loaded() — apenas finished()
        loader.finished();
        return;
    }

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
    var logo1Clip      = document.querySelector('#logo1Clip'); // wrapper interno
    var logo2Clip      = document.querySelector('#logo2Clip'); // wrapper interno

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

    function carregarEscudo(imgEl, wrapperEl, url, fallbackUrl) {
        console.log('[placar_futebol] carregarEscudo: URL=' + url);
        
        if (!url || url === '') {
            console.warn('[placar_futebol] URL vazia, tentando fallback...');
            if (fallbackUrl && fallbackUrl !== '') {
                console.log('[placar_futebol] Usando fallbackUrl: ' + fallbackUrl.substring(0, 50) + '...');
                carregarImagemExterna(imgEl, fallbackUrl);
            } else {
                console.warn('[placar_futebol] Sem fallback, usando SVG_ESCUDO');
                imgEl.style.display = 'none';
                var svgDiv = document.createElement('div');
                svgDiv.innerHTML = SVG_ESCUDO;
                svgDiv.className = 'w-full h-full';
                wrapperEl.appendChild(svgDiv);
                onEscudoPronto();
            }
            return;
        }
        
        // Verificar se é SVG local
        var isSVGLocal = url.indexOf('img/flags/') === 0 && url.indexOf('.svg') > 0;
        
        if (isSVGLocal) {
            console.log('[placar_futebol] SVG local detectado, usando injection: ' + url);
            // Ocultar <img> e usar SVG injection
            imgEl.style.display = 'none';
            
            carregarSvgInline(wrapperEl, url, function() {
                // SVG injetado com sucesso
                onEscudoPronto();
            }, function() {
                // Erro ao injetar SVG - tentar fallback PNG
                if (fallbackUrl && fallbackUrl !== '') {
                    console.log('[placar_futebol] SVG injection falhou, tentando fallback PNG: ' + fallbackUrl.substring(0, 50) + '...');
                    imgEl.style.display = ''; // Mostrar <img> novamente
                    carregarImagemExterna(imgEl, fallbackUrl);
                } else {
                    console.warn('[placar_futebol] Sem fallback PNG, usando SVG_ESCUDO');
                    var svgDiv = document.createElement('div');
                    svgDiv.innerHTML = SVG_ESCUDO;
                    svgDiv.className = 'w-full h-full';
                    wrapperEl.appendChild(svgDiv);
                    onEscudoPronto();
                }
            });
        } else {
            // URL externa (PNG da API) - usar <img>
            console.log('[placar_futebol] URL externa detectada, usando <img>: ' + url.substring(0, 50) + '...');
            carregarImagemExterna(imgEl, url);
        }
    }
    
    function carregarImagemExterna(imgEl, url) {
        imgEl.onload = function() {
            console.log('[placar_futebol] ✅ Imagem externa carregada: ' + url.substring(0, 50) + '...');
            onEscudoPronto();
        };
        imgEl.onerror = function() {
            console.error('[placar_futebol] ❌ Erro ao carregar imagem externa: ' + url.substring(0, 50) + '...');
            console.warn('[placar_futebol] Usando SVG_ESCUDO como último recurso');
            imgEl.style.display = 'none';
            var wrapperEl = imgEl.parentNode;
            var svgDiv = document.createElement('div');
            svgDiv.innerHTML = SVG_ESCUDO;
            svgDiv.className = 'w-full h-full';
            wrapperEl.appendChild(svgDiv);
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

    carregarEscudo(logo1, logo1Clip, dados.foto1, dados.foto1Fallback);
    carregarEscudo(logo2, logo2Clip, dados.foto2, dados.foto2Fallback);
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
