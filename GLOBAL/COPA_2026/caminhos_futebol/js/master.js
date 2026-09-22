// === CONTROLE DE PERCENTUAIS DE TEMPO (ajuste centralizado) ===
var TEMPO_PCT_ENTRADA = 0.15; // 15% para animar todos os cards e linhas
var TEMPO_PCT_ZOOM    = 0.30; // 30% para o efeito de zoom
var TEMPO_PCT_FOCO    = 0.55; // 55% para exibir o chaveamento ampliado

// ===== ANIMAÇÃO DE ZOOM: roda os 4 cantos em sequência =====
// top left → bottom left → top right → bottom right → top left → ...
function animarZoomOutBracketArea(restanteMs) {
    var area = document.querySelector('.bracket-area');
    if (!area) {
        console.log('[animarZoomOutBracketArea] .bracket-area NÃO encontrada');
        return;
    }

    var ORIGINS = ['top left', 'bottom left', 'top right', 'bottom right'];
    var lsKey = 'bracket_zoom_origin_idx';
    var idx = parseInt(localStorage.getItem(lsKey), 10);
    if (isNaN(idx) || idx < 0 || idx >= ORIGINS.length) { idx = 0; }
    var origin = ORIGINS[idx];
    localStorage.setItem(lsKey, (idx + 1) % ORIGINS.length);

    var zoomDur = Math.max(restanteMs, 200);
    console.log('[animarZoomOutBracketArea] origin=' + origin + ' (' + (idx + 1) + '/4) dur=' + zoomDur + 'ms');

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
// ═══════════════════════════════════════════════════════
//  caminhos_futebol — master.js
//  Copa FIFA 2026 | Bracket Pathways | ES5
// ═══════════════════════════════════════════════════════

// ──────────────────────────────────────────────────
//  MAPEAMENTO: "FASE_POSICAO" → ID do elemento DOM
//
//  Copa 2026 — 48 seleções, fase de grupos 3ª (12 grupos)
//  2ª Rodada (R32): 16 partidas  → 8 no lado esq, 8 no dir
//  Oitavas   (R16):  8 partidas  → 4 no lado esq, 4 no dir
//  Quartas   (QF):   4 partidas  → 2 no lado esq, 2 no dir
//  Semifinal (SF):   2 partidas  → 1 no lado esq, 1 no dir
//  Final    (FINAL): 1 partida   → centro
//  Bronze  (BRONZE): 1 partida   → centro
// ──────────────────────────────────────────────────
var SLOT_MAP = {
    'R32_1':    'm-r32-l1',
    'R32_2':    'm-r32-l2',
    'R32_3':    'm-r32-l3',
    'R32_4':    'm-r32-l4',
    'R32_5':    'm-r32-l5',
    'R32_6':    'm-r32-l6',
    'R32_7':    'm-r32-l7',
    'R32_8':    'm-r32-l8',
    'R32_9':    'm-r32-r1',
    'R32_10':   'm-r32-r2',
    'R32_11':   'm-r32-r3',
    'R32_12':   'm-r32-r4',
    'R32_13':   'm-r32-r5',
    'R32_14':   'm-r32-r6',
    'R32_15':   'm-r32-r7',
    'R32_16':   'm-r32-r8',
    'R16_1':    'm-r16-l1',
    'R16_2':    'm-r16-l2',
    'R16_3':    'm-r16-l3',
    'R16_4':    'm-r16-l4',
    'R16_5':    'm-r16-r1',
    'R16_6':    'm-r16-r2',
    'R16_7':    'm-r16-r3',
    'R16_8':    'm-r16-r4',
    'QF_1':     'm-qf-l1',
    'QF_2':     'm-qf-l2',
    'QF_3':     'm-qf-r1',
    'QF_4':     'm-qf-r2',
    'SF_1':     'm-sf-l',
    'SF_2':     'm-sf-r',
    'FINAL_1':  'm-final',
    'BRONZE_1': 'm-bronze'
};

// Prioridade de fase para localizar a mais avançada
var FASE_PRIORIDADE = {
    'FINAL':  6,
    'BRONZE': 5,
    'SF':     4,
    'QF':     3,
    'R16':    2,
    'R32':    1
};

// Fases em ordem sequencial para lógica de ocultamento
// QF, SF, Final e Bronze NUNCA são ocultadas — sempre visíveis
var FASES_COLS = [
    { fase: 'R32', total: 16, colIds: ['col-r32-l', 'col-r32-r'] },
    { fase: 'R16', total: 8,  colIds: ['col-r16-l', 'col-r16-r'] }
];

// ──────────────────────────────────────────────────
//  CONFIG — 3 cores primarias do template (header/footer)
//  Altere apenas estes 3 valores HEX para customizar o visual
// ──────────────────────────────────────────────────
var CONFIG = {
    corDestaque: '#FBBF24',  // cor de destaque (bordas, destaques)
    corEscura:   '#006400',  // cor de fundo (paineis, gradientes)
    corClara:    '#FFFFFF'   // cor de texto e bordas
};

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
                var svgEl = containerEl.querySelector('svg');
                if (svgEl) { svgEl.parentNode.removeChild(svgEl); }
                containerEl.innerHTML = xhr.responseText;
                var svg = containerEl.querySelector('svg');
                
                if (svg) {
                    svg.style.width = '100%';
                    svg.style.height = '100%';
                    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                    console.log('[caminhos_futebol] ✅ SVG injetado: ' + src);
                    if (onSuccess) { onSuccess(); }
                } else {
                    console.error('[caminhos_futebol] Arquivo não contém SVG válido: ' + src);
                    if (onError) { onError(); }
                }
            } catch (e) {
                console.error('[caminhos_futebol] Erro ao injetar SVG:', e);
                if (onError) { onError(); }
            }
        } else {
            console.error('[caminhos_futebol] HTTP ' + xhr.status + ' ao carregar SVG: ' + src);
            if (onError) { onError(); }
        }
    };
    
    xhr.onerror = function() {
        console.error('[caminhos_futebol] Erro de rede ao carregar SVG: ' + src);
        if (onError) { onError(); }
    };
    
    xhr.send();
}

/* ====================================================
   MAPEAMENTO DE BANDEIRAS SVG (48 times Copa 2026)
   Códigos 3 letras → filename SVG (sem path)
   ==================================================== */
function mapearCodigoParaSVG(code) {
    if (!code) return null;

    var map = {
        // CONCACAF (16 times)
        'USA': 'us', 'MEX': 'mx', 'CAN': 'ca', 'CRC': 'cr',
        'JAM': 'jm', 'PAN': 'pa', 'HON': 'hn', 'SLV': 'sv',
        'TRI': 'tt', 'CUW': 'cw', 'GUA': 'gt', 'HAI': 'ht',
        'NCA': 'ni', 'SUR': 'sr', 'MTQ': 'mq', 'GUY': 'gy',

        // CONMEBOL (10 times)
        'BRA': 'br', 'ARG': 'ar', 'URU': 'uy', 'COL': 'co',
        'CHI': 'cl', 'ECU': 'ec', 'PAR': 'py', 'PER': 'pe',
        'BOL': 'bo', 'VEN': 've',

        // UEFA (16 times)
        'GER': 'de', 'FRA': 'fr', 'ENG': 'gb-eng', 'ESP': 'es',
        'BEL': 'be', 'NED': 'nl', 'HOL': 'nl', 'ITA': 'it', 'POR': 'pt',
        'CRO': 'hr', 'SUI': 'ch', 'DEN': 'dk', 'POL': 'pl',
        'AUT': 'at', 'SWE': 'se', 'UKR': 'ua', 'WAL': 'gb-wls',
        'SCO': 'gb-sct', 'NIR': 'gb-nir',

        // CAF
        'SEN': 'sn', 'MOR': 'ma', 'MAR': 'ma', 'TUN': 'tn', 'NGA': 'ng',
        'RSA': 'za', 'ZAF': 'za', 'CIV': 'ci',  // África do Sul, Costa do Marfim
        'EGY': 'eg', 'CMR': 'cm', 'GHA': 'gh',
        'ALG': 'dz', 'COD': 'cd', 'COG': 'cg',  // Argélia, RD Congo
        'MLI': 'ml', 'SEN': 'sn',

        // AFC
        'JPN': 'jp', 'JAP': 'jp',  // JAP = código alternativo do backend
        'KOR': 'kr', 'IRN': 'ir', 'IRA': 'ir',
        'AUS': 'au', 'SAU': 'sa',  // Arábia Saudita
        'IRQ': 'iq',               // Iraque
        'UZB': 'uz',               // Uzbequistão

        // Outros
        'NZL': 'nz', 'BIH': 'ba', 'NOR': 'no', 'SWI': 'ch'
    };

    return map[code.toUpperCase()] || null;
}

/* ====================================================
   RETORNA BANDEIRA SVG LOCAL + FALLBACK PNG
   ==================================================== */
function obterBandeiraSVG(teamCode, fallbackUrl) {
    var svgCode = mapearCodigoParaSVG(teamCode);
    
    return {
        bandeira: svgCode ? ('img/flags/' + svgCode + '.svg') : null,
        bandeiraFallback: fallbackUrl || null
    };
}

/* ====================================================
   MAPA DE FASES DO CAMPEONATO → PT-BR
   Traduções de fases/rodadas comuns
   ==================================================== */
var FASE_LABEL = {
    // Fases principais em inglês
    'group stage':                'Fase de Grupos',
    'preliminary round':          'Fase Preliminar',
    'qualification round':        'Fase de Qualificação',
    'qualifiers':                 'Eliminatórias',
    'round of 32':                '1/32 de Final',
    '1/32-finals':                '1/32 de Final',
    'round of 16':                'Oitavas de Final',
    '1/16-finals':                'Oitavas de Final',
    'round of 8':                 'Quartas de Final',
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
    // Entradas em português (API pode retornar já traduzido)
    'play-offs':                  'Play-offs',
    'fase de grupos':             'Fase de Grupos',
    'fase preliminar':            'Fase Preliminar',
    'fase de qualificação':       'Fase de Qualificação',
    '1/32 de final':              '1/32 de Final',
    '1/16 de final':              '1/16 de Final',
    'oitavas de final':           'Oitavas de Final',
    'quartas de final':           'Quartas de Final',
    'semifinal':                  'Semifinal',
    'semifinais':                 'Semifinais',
    'disputa de 3º lugar':        'Disputa de 3º Lugar',
    'regular season':             'Temporada Regular',
    'matchday 1':                 'Rodada 1',
    'matchday 2':                 'Rodada 2',
    'matchday 3':                 'Rodada 3',
    'round 1':                    'Rodada 1',
    'round 2':                    'Rodada 2',
    'round 3':                    'Rodada 3'
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

    // Padrões dinâmicos: "Matchday N", "Round N"
    var mMatchday = chave.match(/^matchday\s+(\d+)$/);
    if (mMatchday) { return 'Rodada ' + mMatchday[1]; }

    var mRound = chave.match(/^round\s+(\d+)$/);
    if (mRound) { return 'Rodada ' + mRound[1]; }

    var mQual = chave.match(/^(\d+)(?:st|nd|rd|th)\s+qualifying round$/);
    if (mQual) { return mQual[1] + 'ª Fase de Qualificação'; }

    var mLeague = chave.match(/^league\s+stage\s*[-–]\s*(\d+)$/);
    if (mLeague) { return 'Fase de Liga — Rodada ' + mLeague[1]; }

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
   HELPER: Obter valor de campo (Mock ou EdgeContents)
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
   BUSCAR TIME INDIVIDUAL - D_FOOTBALL_TEAMS
   Consulta com loader.addData() (padrão oficial)
   ==================================================== */
function buscarTime(teamId, loader, callback) {
    if (!teamId || !loader || !callback) {
        console.error('[caminhos_futebol] buscarTime: parâmetros inválidos');
        callback(null);
        return;
    }
    
    loader.addData('D_FOOTBALL_TEAMS', false, 'f_titulo=' + teamId);
    
    loader.load(function() {
        var time = loader.data('D_FOOTBALL_TEAMS');
        
        if (!time) {
            console.error('[caminhos_futebol] D_FOOTBALL_TEAMS sem dados para ID=' + teamId);
            callback(null);
            return;
        }
        
        var timeNome = obterValor(time, 'TEXTO2');  // Nome PT-BR
        var timeCodigo = obterValor(time, 'TEXTO3');  // Código 3 letras
        var fotoPng = obterValor(time, 'FOTO');  // PNG da API (fallback)
        
        // Mapear para SVG local ou usar fallback PNG
        var bandeiras = obterBandeiraSVG(timeCodigo, fotoPng);
        
        var timeData = {
            id: teamId,
            nome: timeNome || ('[Time ' + teamId + ']'),
            codigo: timeCodigo || '???',
            bandeira: bandeiras.bandeira,  // SVG local
            bandeiraFallback: bandeiras.bandeiraFallback  // PNG fallback
        };
        
        console.log('[caminhos_futebol] Time ID=' + teamId + ': ' + timeData.nome + ' (' + timeData.codigo + ') → SVG: ' + (bandeiras.bandeira ? 'OK' : 'N/A'));
        
        callback(timeData);
    });
}

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
}

/* Mescla cores do D_SPD (COLOR1/COLOR2/COLOR3) com defaults do CONFIG
   Suporta objeto plano (mock) ou item EdgeContents (spd.value()) */
function mergeColorsFromSpd(defaults, spd) {
    if (!spd) { return defaults; }
    
    // COLOR1 = corEscura (fundo), COLOR2 = corDestaque (bordas/destaques), COLOR3 = corClara (texto)
    // Mesmo mapeamento do futebol_placar_classificacao_v23
    var cor1 = obterValorSpd(spd, 'COLOR1');
    var cor2 = obterValorSpd(spd, 'COLOR2');
    var cor3 = obterValorSpd(spd, 'COLOR3');

    if (cor1 && cor1.indexOf('#') !== 0) { cor1 = '#' + cor1; }
    if (cor2 && cor2.indexOf('#') !== 0) { cor2 = '#' + cor2; }
    if (cor3 && cor3.indexOf('#') !== 0) { cor3 = '#' + cor3; }

    return {
        corDestaque: cor2 || defaults.corDestaque,
        corEscura:   cor1 || defaults.corEscura,
        corClara:    cor3 || defaults.corClara
    };
}

var DURACAO_SEM_INTRO_MS     = 10000;
var DURACAO_CONTEUDO_MS      = 5000;
var DURACAO_IMAGEM_PADRAO_MS = 5000;

function obterValorSpd(spd, campo) {
    return obterValor(spd, campo);
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
        console.log('[caminhos_futebol] obterDuracaoIntroMs: sem sponsor, duracao=0');
        return 0; 
    }
    
    // Tentar TEXT2 primeiro (novo padrao - tempo de corte do video)
    var text2 = obterValorSpd(spd, 'TEXT2');
    if (text2 && text2.trim() !== '') {
        var segText2 = parseInt(text2, 10);
        if (segText2 > 0) {
            console.log('[caminhos_futebol] obterDuracaoIntroMs: TEXT2=' + text2 + ' seg → cortar video em ' + (segText2 * 1000) + 'ms');
            return segText2 * 1000;
        }
    }
    
    // Se TEXT2 nao existir, retornar 0 (sem limite - video roda ate o fim)
    console.log('[caminhos_futebol] obterDuracaoIntroMs: TEXT2 vazio ou invalido → video sem corte (duracao=0, ate ended)');
    return 0;
}

function montarSponsorConfig(spdSponsor) {
    if (!spdSponsor) { return null; }
    return {
        frase:       obterValorSpd(spdSponsor, 'TEXT1'),
        logo:        obterValorSpd(spdSponsor, 'IMAGE_LOGO'),
        intro:       obterValorSpd(spdSponsor, 'FILE_IMAGE1'),
        FILE_IMAGE1: obterValorSpd(spdSponsor, 'FILE_IMAGE1'),
        introMaxMs:  obterDuracaoIntroMs(spdSponsor)
    };
}

// ──────────────────────────────────────────────────
//  ENTRY POINT
// ──────────────────────────────────────────────────
window.onload = function() {
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = {
            loaded:   function() { console.log('[Mock] loaded'); },
            finished: function() { console.log('[Mock] finished'); }
        };
        
        // Aceita D_FOOTBALL.TEXTO3 (formato real) ou partidas direto (fallback)
        var partidas;
        if (MOCK_DATA.D_FOOTBALL && MOCK_DATA.D_FOOTBALL.TEXTO3) {
            try { 
                partidas = JSON.parse(MOCK_DATA.D_FOOTBALL.TEXTO3); 
            } catch (e) { 
                console.error('[Mock] Erro ao parsear D_FOOTBALL.TEXTO3:', e);
                partidas = []; 
            }
        } else if (MOCK_DATA.partidas) {
            // Fallback: aceita array direto (mais conveniente para testes)
            partidas = MOCK_DATA.partidas;
        } else {
            partidas = [];
        }
        
        // Cria teamsMap do D_FOOTBALL_TEAMS (mock)
        var teamsMap = {};
        if (MOCK_DATA.D_FOOTBALL_TEAMS && MOCK_DATA.D_FOOTBALL_TEAMS.length > 0) {
            for (var i = 0; i < MOCK_DATA.D_FOOTBALL_TEAMS.length; i++) {
                var time = MOCK_DATA.D_FOOTBALL_TEAMS[i];
                if (time.TITULO && time.TEXTO2) {
                    teamsMap[time.TITULO] = {
                        nome: time.TEXTO2,
                        codigo: time.TEXTO3 || '',
                        bandeira: time.FOTO1 || ''
                    };
                }
            }
            console.log('[Mock] D_FOOTBALL_TEAMS: ' + Object.keys(teamsMap).length + ' times mapeados');
        }
        
        var dados = processarDadosMock(partidas, teamsMap);
        var spdSponsor = MOCK_DATA.D_SPD || null;
        var mockConfig = {
            sponsor: montarSponsorConfig(spdSponsor) || (MOCK_DATA.config && MOCK_DATA.config.sponsor) || null
        };
        aplicarCores(mergeColorsFromSpd(CONFIG, spdSponsor));
        iniciarTemplate(dados, mockConfig, mockLoader);
    } else {
        playerView();
    }
};

// ══════════════════════════════════════════════════════════
//  playerView — produção (EdgeContents real)
//
//  Um único ebhtml.create2 com 3 addData simultâneos:
//    D_FOOTBALL      amount=0  → todas as partidas (grupos + eliminatórias)
//    D_FOOTBALL_TEAMS amount=0 → 50 times (nome PT-BR, código, bandeira)
//    D_SPD           f_config=1 → sponsor (cores, intro, logo)
//
//  Dados da API real:
//    D_FOOTBALL:      TITULO=fixtureId, TEXTO2=JSON API-Football,
//                     TEXTO4=round, TEXTO5=status, DATE="YYYY-MM-DD HH:MM:SS"
//    D_FOOTBALL_TEAMS: TITULO=teamId, TEXTO2=nome PT-BR, TEXTO3=código, FOTO=URL bandeira
// ══════════════════════════════════════════════════════════
var _playerViewExecutando = false;

function playerView() {
    // Guard: evita duplo disparo do loader
    if (_playerViewExecutando) {
        console.log('[caminhos_futebol] playerView: guard — ignorando disparo duplo');
        return;
    }
    _playerViewExecutando = true;

    ebhtml.create2({}, function(loader) {
        loader.addData('D_FOOTBALL',       false, 'amount=0');
        loader.addData('D_FOOTBALL_TEAMS', false, 'amount=0');
        loader.addData('D_SPD',            false, 'f_config=1');
        loader.autoloaded    = false;
        loader.nodataiserror = false;

        loader.load(function() {

            // ── 1. Sponsor (D_SPD) ───────────────────────────────────
            var spdSponsor = loader.data('D_SPD');
            if (spdSponsor) {
                console.log('[caminhos_futebol] D_SPD sponsor OK — SP=' + obterValorSpd(spdSponsor, 'SPECIALPROJECT'));
            } else {
                console.log('[caminhos_futebol] D_SPD sem sponsor — continua sem patrocinador');
            }

            // ── 2. D_FOOTBALL → lista de todas as partidas ───────────
            var listaFootball = loader.datalist('D_FOOTBALL');
            if (!listaFootball || listaFootball.count() === 0) {
                console.error('[caminhos_futebol] D_FOOTBALL sem dados');
                loader.finished();
                return;
            }
            console.log('[caminhos_futebol] D_FOOTBALL: ' + listaFootball.count() + ' registros totais');

            // Converter lista EBHTML para array de partidas
            var todasPartidas = [];
            for (var i = 0; i < listaFootball.count(); i++) {
                var item = listaFootball.get(i);
                var partida = parseItemFootball(item);
                if (partida) { todasPartidas.push(partida); }
            }

            // Filtrar apenas fases eliminatórias
            var eliminatorias = [];
            for (var j = 0; j < todasPartidas.length; j++) {
                if (isFaseEliminatoria(todasPartidas[j].round)) {
                    eliminatorias.push(todasPartidas[j]);
                }
            }
            console.log('[caminhos_futebol] Eliminatórias filtradas: ' + eliminatorias.length);

            if (eliminatorias.length === 0) {
                console.error('[caminhos_futebol] Sem partidas eliminatórias — 2ª fase ainda não começou?');
                loader.finished();
                return;
            }

            // Atribuir posições no bracket (ordenado por data)
            var comSlot = atribuirPosicoesBracket(eliminatorias);

            // ── 3. D_FOOTBALL_TEAMS → teamsMap ───────────────────────
            var teamsMap = {};
            var listaTeams = loader.datalist('D_FOOTBALL_TEAMS');
            if (listaTeams) {
                for (var k = 0; k < listaTeams.count(); k++) {
                    var time = listaTeams.get(k);
                    var teamId = time.value('TITULO').value || '';
                    var nome   = time.value('TEXTO2').value || '';
                    var codigo = time.value('TEXTO3').value || '';
                    var foto   = time.value('FOTO').value   || '';
                    if (teamId && nome) {
                        var svgCode = mapearCodigoParaSVG(codigo);
                        // Prioridade: fotoApi (URL absoluta EdgeContents) garante exibição.
                        // SVG local fica como alternativa quando fotoApi estiver vazio.
                        teamsMap[teamId] = {
                            nome:     nome,
                            codigo:   codigo,
                            bandeira: foto || (svgCode ? ('img/flags/' + svgCode + '.svg') : ''),
                            fotoApi:  foto
                        };
                    }
                }
                console.log('[caminhos_futebol] D_FOOTBALL_TEAMS: ' + Object.keys(teamsMap).length + ' times');
            }

            // ── 4. Renderizar ─────────────────────────────────────────
            var runConfig = { sponsor: montarSponsorConfig(spdSponsor) };
            aplicarCores(mergeColorsFromSpd(CONFIG, spdSponsor));
            var dados = processarDadosApi(comSlot, teamsMap);
            iniciarTemplate(dados, runConfig, loader);
        });
    });
}

// ──────────────────────────────────────────────────
//  parseItemFootball — converte item EBHTML (D_FOOTBALL)
//  para objeto interno de partida
// ──────────────────────────────────────────────────
function parseItemFootball(item) {
    if (!item) { return null; }
    var fixtureId = item.value('TITULO').value  || '';
    var round     = item.value('TEXTO4').value  || '';
    var statusRaw = item.value('TEXTO5').value  || 'NS';
    var dateStr   = item.value('DATE').value    || '';
    var texto2    = item.value('TEXTO2').value  || '';

    var homeId = '', awayId = '', homeName = '', awayName = '';
    var homeLogo = '', awayLogo = '';
    var goalsHome = null, goalsAway = null;
    var penHome = null, penAway = null;
    var venue = '', elapsed = null, extra = null;
    var fixtureDate = '';

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
            if (resp.goals) {
                goalsHome = resp.goals.home;
                goalsAway = resp.goals.away;
            }
            if (resp.score && resp.score.penalty) {
                penHome = resp.score.penalty.home;
                penAway = resp.score.penalty.away;
            }
            if (resp.fixture) {
                fixtureDate = resp.fixture.date || '';
                if (resp.fixture.venue) { venue = resp.fixture.venue.name || ''; }
                if (resp.fixture.status) {
                    elapsed = resp.fixture.status.elapsed;
                    extra   = resp.fixture.status.extra;
                }
            }
        }
    } catch (e) {
        console.warn('[caminhos_futebol] parseItemFootball: JSON inválido para fixtureId=' + fixtureId);
    }

    return {
        fixtureId:   fixtureId,
        round:       round,
        statusRaw:   statusRaw,
        dateStr:     dateStr,
        fixtureDate: fixtureDate,
        homeId:      homeId,   awayId:    awayId,
        homeName:    homeName, awayName:  awayName,
        homeLogo:    homeLogo, awayLogo:  awayLogo,
        goalsHome:   goalsHome, goalsAway: goalsAway,
        penHome:     penHome,  penAway:   penAway,
        venue:       venue,
        elapsed:     elapsed,  extra:     extra
    };
}

// ──────────────────────────────────────────────────
//  isFaseEliminatoria — retorna true para rounds eliminatórios
// ──────────────────────────────────────────────────
function isFaseEliminatoria(roundName) {
    if (!roundName) { return false; }
    var r = roundName.toLowerCase();
    return (
        r.indexOf('round of 32') !== -1 ||
        r.indexOf('round of 16') !== -1 ||
        r.indexOf('quarter')     !== -1 ||
        r.indexOf('semi')        !== -1 ||
        r.indexOf('3rd')         !== -1 ||
        r.indexOf('third')       !== -1 ||
        r === 'final'
    );
}

// ──────────────────────────────────────────────────
//  mapearFaseParaCategoria — round → CATEGORY interno
// ──────────────────────────────────────────────────
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

// ══════════════════════════════════════════════════════════
//  MAPEAMENTO AUTOMÁTICO DE SLOTS R32
//
//  Estratégia em 2 camadas (totalmente automático em produção):
//
//  Camada 1 — FIXTURE_SLOT_MAP: fixtureId → slot
//    Lookup direto por fixtureId da API. Confirmados conforme
//    chegam na API. Atualizar quando novos IDs forem confirmados.
//
//  Camada 2 — TEAMS_SLOT_MAP: "homeId|awayId" → slot
//    Fallback automático por combinação de teamIds.
//    Cobre TODOS os 16 jogos R32 baseado nos teamIds já
//    cadastrados no D_FOOTBALL_TEAMS.
//    Funciona mesmo quando o fixtureId ainda não é conhecido.
//
//  Estrutura do bracket (esq→dir, cima→baixo):
//    L1: M74 GER(25)×?          L2: M77 ?×?
//    L3: M73 RSA(1531)×CAN(5529) L4: M75 NED(1118)×MAR(31)
//    L5: M83 ?×?                L6: M84 ?×?
//    L7: M81 USA(2384)×BIH(1113) L8: M82 ?×?
//    R1: M76 BRA(6)×JPN(12)     R2: M78 IVO(1501)×?
//    R3: M79 MEX(16)×?          R4: M80 ENG(10)×?
//    R5: M86 ARG(26)×?          R6: M88 TUR(777)×?
//    R7: M85 CAN(5529)?×?       R8: M87 POR(27)×?
//  (? = classificados dos grupos — definidos pós fase de grupos)
// ══════════════════════════════════════════════════════════

// Camada 1: fixtureId → slot (confirmados na API)
var FIXTURE_SLOT_MAP = {
    '1561329': { CATEGORY: 'R32', SUBTITULO: '3'  },  // M73  RSA×CAN   L3
    '1562344': { CATEGORY: 'R32', SUBTITULO: '9'  },  // M76  BRA×JPN   R1
    '1562345': { CATEGORY: 'R32', SUBTITULO: '4'  },  // M75  NED×MAR   L4
    '1562586': { CATEGORY: 'R32', SUBTITULO: '7'  }   // M81  USA×BIH   L7
};

// Camada 2: "homeId|awayId" → slot (auto-atualização por teamId)
// Qualquer ordem (home|away ou away|home) é verificada.
// Baseado nos teamIds do D_FOOTBALL_TEAMS + estrutura oficial FIFA.
//
// teamIds confirmados no backend:
//   Brasil=6, Japão=12, Holanda=1118, Marrocos=31
//   África do Sul=1531, Canadá=5529, EUA=2384, Bósnia=1113
//   Alemanha=25, França=2, Noruega=1090, Senegal=13
//   Argentina=26, Uruguai=7, Colômbia=8, Portugal=27
//   Espanha=9, Bélgica=1, Inglaterra=10, Croácia=3
//   México=16, Turquia=777, Suíça=15, Austrália=20
//   Costa do Marfim=1501, Escócia=1108, Egito=32, Irã=22
//   Jordânia=1548, Nova Zelândia=4673, Cabo Verde=1533
//   Gana=1504, Uzbequistão=1568, RD Congo=1508, Iraque=1567
//
// Slots conhecidos (um dos times é fixo pelo bracket oficial):
var TEAMS_SLOT_MAP = {
    // M73 L3: África do Sul × Canadá (ambos fixos)
    '1531|5529': { CATEGORY: 'R32', SUBTITULO: '3'  },
    // M74 L1: Alemanha × 3ºABCDF (Alemanha é fixo)
    '25':        { CATEGORY: 'R32', SUBTITULO: '1'  },
    // M75 L4: Holanda × Marrocos (ambos fixos)
    '1118|31':   { CATEGORY: 'R32', SUBTITULO: '4'  },
    // M76 R1: Brasil × Japão (ambos fixos)
    '6|12':      { CATEGORY: 'R32', SUBTITULO: '9'  },
    // M77 L2: 1ºI × 3ºCDFGH — Noruega ou França (1ºI = Grupo I)
    // Grupo I: França(2), Senegal(13), Iraque(1567), Noruega(1090)
    // 1ºI será um desses 4 — mapeado quando o fixtureId chegar
    // M78 R2: Costa do Marfim × 2ºI
    '1501':      { CATEGORY: 'R32', SUBTITULO: '10' },
    // M79 R3: México × 3ºCEFHI
    '16':        { CATEGORY: 'R32', SUBTITULO: '11' },
    // M80 R4: Inglaterra × 3ºEHIJK
    '10':        { CATEGORY: 'R32', SUBTITULO: '12' },
    // M81 L7: EUA × Bósnia (ambos fixos)
    '2384|1113': { CATEGORY: 'R32', SUBTITULO: '7'  },
    // M82 L8: 1ºG × 3ºAEHIJ — Bélgica é favorita do Grupo G
    '1':         { CATEGORY: 'R32', SUBTITULO: '8'  },
    // M83 L5: 2ºK × 2ºL — Portugal é favorito do Grupo K, Inglaterra L
    // Sem time fixo até fase de grupos terminar
    // M84 L6: 1ºH × 2ºJ — Espanha favorita H, Argentina favorita J
    '9|26':      { CATEGORY: 'R32', SUBTITULO: '6'  },
    '9':         { CATEGORY: 'R32', SUBTITULO: '6'  },
    // M85 R7: 1ºB × 3ºEFGIJ — Canadá favorito B
    '5529':      { CATEGORY: 'R32', SUBTITULO: '15' },
    // M86 R5: Argentina × 2ºH
    '26':        { CATEGORY: 'R32', SUBTITULO: '13' },
    // M87 R8: Portugal × 3ºDEIJL
    '27':        { CATEGORY: 'R32', SUBTITULO: '16' },
    // M88 R6: Turquia × 2ºG
    '777':       { CATEGORY: 'R32', SUBTITULO: '14' }
};

// ──────────────────────────────────────────────────
//  buscarSlotPorTeams — Camada 2 de lookup
//  Tenta encontrar slot por combinação de teamIds
//  Verifica "homeId|awayId", "awayId|homeId" e cada ID isolado
//  Retorna slot ou null
// ──────────────────────────────────────────────────
function buscarSlotPorTeams(homeId, awayId) {
    var h = String(homeId || '');
    var a = String(awayId || '');
    // 1. Par exato (ambas ordens)
    if (h && a) {
        if (TEAMS_SLOT_MAP[h + '|' + a]) { return TEAMS_SLOT_MAP[h + '|' + a]; }
        if (TEAMS_SLOT_MAP[a + '|' + h]) { return TEAMS_SLOT_MAP[a + '|' + h]; }
    }
    // 2. Time isolado (quando só um time é conhecido no bracket)
    if (h && TEAMS_SLOT_MAP[h]) { return TEAMS_SLOT_MAP[h]; }
    if (a && TEAMS_SLOT_MAP[a]) { return TEAMS_SLOT_MAP[a]; }
    return null;
}

// ──────────────────────────────────────────────────
//  atribuirPosicoesBracket — 2 camadas + fallback por data
//
//  Camada 1: FIXTURE_SLOT_MAP[fixtureId]
//  Camada 2: TEAMS_SLOT_MAP[homeId|awayId] ou TEAMS_SLOT_MAP[teamId]
//  Fallback:  ordenar por data → próximo slot livre
// ──────────────────────────────────────────────────
function atribuirPosicoesBracket(partidas) {
    var result = [];
    var porFase = {};
    var mapeadas = 0;

    for (var i = 0; i < partidas.length; i++) {
        var p   = partidas[i];
        var cat = mapearFaseParaCategoria(p.round);
        if (!cat) { continue; }

        // Camada 1: fixtureId fixo
        var slot = FIXTURE_SLOT_MAP[String(p.fixtureId)];
        if (slot) {
            p.CATEGORY  = slot.CATEGORY;
            p.SUBTITULO = slot.SUBTITULO;
            result.push(p);
            mapeadas++;
            console.log('[caminhos_futebol] camada1 fixtureId=' + p.fixtureId + ' → ' + p.CATEGORY + '_' + p.SUBTITULO);
            continue;
        }

        // Camada 2: teamIds (só para R32)
        if (cat === 'R32') {
            slot = buscarSlotPorTeams(p.homeId, p.awayId);
            if (slot) {
                p.CATEGORY  = slot.CATEGORY;
                p.SUBTITULO = slot.SUBTITULO;
                result.push(p);
                mapeadas++;
                console.log('[caminhos_futebol] camada2 teams=' + p.homeId + '|' + p.awayId + ' → ' + p.CATEGORY + '_' + p.SUBTITULO);
                continue;
            }
        }

        // Sem mapa → fallback por data
        if (!porFase[cat]) { porFase[cat] = []; }
        porFase[cat].push(p);
    }

    // Fallback: ordenar por data e atribuir próximos slots livres
    var fases = ['R32', 'R16', 'QF', 'SF', 'FINAL', 'BRONZE'];
    var usedR32Slots = {};
    for (var k = 0; k < result.length; k++) {
        if (result[k].CATEGORY === 'R32') { usedR32Slots[result[k].SUBTITULO] = true; }
    }

    for (var f = 0; f < fases.length; f++) {
        var fase  = fases[f];
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
                partida.CATEGORY  = fase;
                partida.SUBTITULO = String(nextSlot);
                usedR32Slots[String(nextSlot)] = true;
                nextSlot++;
                console.log('[caminhos_futebol] fallback-data R32_' + partida.SUBTITULO + ' fixtureId=' + partida.fixtureId);
            } else {
                partida.CATEGORY  = fase;
                partida.SUBTITULO = String(j + 1);
            }
            result.push(partida);
        }
    }

    console.log('[caminhos_futebol] atribuirPosicoesBracket: ' + result.length + ' partidas (' + mapeadas + ' mapeadas, ' + (result.length - mapeadas) + ' fallback)');
    return result;
}

// ──────────────────────────────────────────────────
//  processarDadosApi — converte array da API para
//  o formato interno { "FASE_SLOT": { ...campos } }
//  compatível com renderizarBracket(), preencherLinha()
// ──────────────────────────────────────────────────
function processarDadosApi(partidas, teamsMap) {
    teamsMap = teamsMap || {};
    var dados = {};

    for (var i = 0; i < partidas.length; i++) {
        var p    = partidas[i];
        var fase = p.CATEGORY  || '';
        var pos  = p.SUBTITULO || '';
        if (!fase || !pos) { continue; }

        var chave = fase + '_' + pos;

        // Resolver nome e bandeira via teamsMap
        var timeCasa = '';
        var timeVis  = '';
        var flagCasa = p.homeLogo || '';
        var flagVis  = p.awayLogo || '';

        if (teamsMap[p.homeId]) {
            timeCasa = teamsMap[p.homeId].nome;
            flagCasa = teamsMap[p.homeId].bandeira || teamsMap[p.homeId].fotoApi || flagCasa;
        } else {
            timeCasa = p.homeName || '';
        }

        if (teamsMap[p.awayId]) {
            timeVis = teamsMap[p.awayId].nome;
            flagVis = teamsMap[p.awayId].bandeira || teamsMap[p.awayId].fotoApi || flagVis;
        } else {
            timeVis = p.awayName || '';
        }

        // Formatar data/hora a partir de dateStr "YYYY-MM-DD HH:MM:SS"
        var datahora = '';
        if (p.dateStr) {
            var partes = p.dateStr.split(' ');
            var dp = (partes[0] || '').split('-');
            var hp = (partes[1] || '').split(':');
            var dia = dp[2] || '';
            var mes = dp[1] || '';
            var hora = (hp[0] || '') + ':' + (hp[1] || '00');
            datahora = dia + '/' + mes + ' · ' + hora;
        }

        // Placar: null = não iniciado; 0 = zero gols
        var golsCasa = (p.goalsHome !== null && p.goalsHome !== undefined) ? String(p.goalsHome) : '';
        var golsVis  = (p.goalsAway !== null && p.goalsAway !== undefined) ? String(p.goalsAway) : '';

        dados[chave] = {
            fase:          fase,
            posicao:       parseInt(pos, 10),
            timeCasa:      timeCasa,
            timeVisitante: timeVis,
            flagCasa:      flagCasa,
            flagVisitante: flagVis,
            golsCasa:      golsCasa,
            golsVisitante: golsVis,
            status:        p.statusRaw || 'NS',
            datahora:      datahora,
            // Campos extras (pênaltis, ao vivo)
            penCasa:       (p.penHome !== null && p.penHome !== undefined) ? String(p.penHome) : '',
            penVisitante:  (p.penAway !== null && p.penAway !== undefined) ? String(p.penAway) : '',
            elapsed:       p.elapsed !== null ? String(p.elapsed || '') : '',
            extra:         p.extra   !== null ? String(p.extra   || '') : ''
        };
    }

    console.log('[caminhos_futebol] processarDadosApi: ' + Object.keys(dados).length + ' slots preenchidos');
    return dados;
}

// ──────────────────────────────────────────────────
//  PROCESSAR DADOS — array de partidas (mock e producao)
//  teamsMap: { teamId: { nome, bandeira, codigo } }
// ──────────────────────────────────────────────────
function processarDadosMock(partidas, teamsMap) {
    teamsMap = teamsMap || {};
    var dados = {};
    
    for (var i = 0; i < partidas.length; i++) {
        var p     = partidas[i];
        var fase  = p.CATEGORY  || '';
        var pos   = p.SUBTITULO || '';
        var chave = fase + '_' + pos;
        
        // IDs dos times (podem ser números ou strings)
        var teamIdCasa = p.TITULO || '';
        var teamIdVis  = p.TITULO2 || '';
        
        // Traduzir IDs para nomes PT-BR se disponível no teamsMap
        var timeCasa = teamIdCasa;
        var timeVis  = teamIdVis;
        var flagCasa = p.FOTO || '';
        var flagVis  = p.FOTO2 || '';
        
        // Se teamId é número (string numérica), buscar no teamsMap
        if (teamsMap[teamIdCasa]) {
            timeCasa = teamsMap[teamIdCasa].nome;
            flagCasa = teamsMap[teamIdCasa].bandeira || flagCasa;
        }
        
        if (teamsMap[teamIdVis]) {
            timeVis = teamsMap[teamIdVis].nome;
            flagVis = teamsMap[teamIdVis].bandeira || flagVis;
        }
        
        dados[chave] = {
            fase:          fase,
            posicao:       parseInt(pos, 10),
            timeCasa:      timeCasa,
            timeVisitante: timeVis,
            flagCasa:      flagCasa,
            flagVisitante: flagVis,
            golsCasa:      p.TEXTO      || '',
            golsVisitante: p.TEXTO2     || '',
            status:        p.SUBTITULO3 || 'NS',
            datahora:      p.SUBTITULO2 || ''
        };
    }
    return dados;
}

// ──────────────────────────────────────────────────
//  INICIAR TEMPLATE
// ──────────────────────────────────────────────────

// ===== Helpers para intro de patrocinador (copiado do placar_futebol) =====
function normalizarUrlMidia(url) {
    if (!url) { return url; }
    url = url.trim();
    if (url.indexOf('file:///') === 0 || url.indexOf('file://') === 0) {
        var partes = url.replace(/\\/g, '/').split('/');
        var nomeArquivo = partes[partes.length - 1];
        var mId = nomeArquivo.match(/^f_(\d+)\./);
        if (mId) {
            return window.location.protocol + '//127.0.0.1:13199/FILES/' + mId[1];
        }
        return window.location.protocol + '//127.0.0.1:13199/FILES/' + nomeArquivo;
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
    console.log('[caminhos_futebol] intro (' + (isVideo ? 'video' : 'imagem') + '): ' + url + (introMaxMs > 0 ? ' max=' + introMaxMs + 'ms' : ' sem limite'));
    introEl.innerHTML = '';
    introEl.style.opacity = '1';
    introEl.classList.remove('hidden');
    if (isVideo) {
        var vid = document.createElement('video');
        vid.className = 'w-full h-full object-cover';
        vid.setAttribute('playsinline', '');
        vid.muted = true;
        introEl.appendChild(vid);
        var _introDone = false;
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
        vid.addEventListener('ended', _onIntroDone);
        vid.addEventListener('error', _onIntroDone);
        vid.addEventListener('canplay', function onFirstCanPlay() {
            vid.removeEventListener('canplay', onFirstCanPlay);
            var p = vid.play();
            if (p && typeof p.then === 'function') {
                p.then(function() {}, function() { _onIntroDone(); });
            }
        });
        vid.src = url;
        vid.load();
    } else {
        var imgMs = introMaxMs > 0 ? introMaxMs : DURACAO_IMAGEM_PADRAO_MS;
        var img = document.createElement('img');
        img.className = 'w-full h-full object-cover';
        img.onload = function() { setTimeout(onDone, imgMs); };
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

// ====== INICIAR TEMPLATE — intro via D_SPD.DURACAO + conteudo 5s ou 10s sem intro ======
function iniciarTemplate(dados, config, loader) {
    // ❌ Validar dados ANTES de chamar loader.loaded()
    var chaves = Object.keys(dados);
    if (chaves.length === 0) {
        console.error('[caminhos_futebol] sem dados para exibir');
        // ❌ ERRO: NÃO chamar loader.loaded() — apenas finished()
        loader.finished();
        return;
    }
    
    // ✅ EBHTML: Avisar que o template carregou com sucesso IMEDIATAMENTE
    // (ANTES do vídeo de intro, para registrar na playlist)
    loader.loaded();
    console.log('[caminhos_futebol] loader.loaded() chamado — template registrado na playlist');
    
    var sponsor = config && config.sponsor;
    var introUrl = sponsor && sponsor.intro ? sponsor.intro : (sponsor && sponsor.FILE_IMAGE1 ? sponsor.FILE_IMAGE1 : null);
    if (!introUrl && sponsor && sponsor.logo && sponsor.logo.indexOf('.mp4') !== -1) {
        introUrl = sponsor.logo;
    }
    if (!introUrl && typeof MOCK_DATA !== 'undefined' && MOCK_DATA.D_SPD) {
        introUrl = obterValorSpd(MOCK_DATA.D_SPD, 'FILE_IMAGE1');
    }
    var introMaxMs = (sponsor && sponsor.introMaxMs) ? sponsor.introMaxMs : 0;
    if (!introMaxMs && typeof MOCK_DATA !== 'undefined' && MOCK_DATA.D_SPD) {
        introMaxMs = obterDuracaoIntroMs(MOCK_DATA.D_SPD);
    }
    if (introUrl) {
        var introStart = Date.now();
        mostrarIntro(introUrl, function() {
            var introMs = Date.now() - introStart;
            esconderIntro(function() {
                iniciarTemplateSemIntro(dados, config, loader, introMs);
            });
        }, introMaxMs);
    } else {
        iniciarTemplateSemIntro(dados, config, loader, 0);
    }
}

function iniciarTemplateSemIntro(dados, config, loader, introMs) {
    // DEBUG: Verifica estrutura dos dados recebidos
    var chaves = Object.keys(dados);
    console.log('[DEBUG iniciarTemplateSemIntro] chaves dos dados:', chaves);
    if (chaves.length > 0) {
        console.log('[DEBUG iniciarTemplateSemIntro] exemplo de dado:', chaves[0], dados[chaves[0]]);
    }
    
    renderizarBracket(dados);
    marcarBrasil();
    marcarCampeao(dados);
    ocultarFasesAnteriores(dados);
    atualizarFaseAtual(dados);
    aplicarSponsor(config);

    // Detecta se a fase mais avançada exibida é R32 ou R16
    var faseMaisAlta = null;
    for (var k in dados) {
        if (dados.hasOwnProperty(k)) {
            var f = k.split('_')[0];
            var partida = dados[k];
            // Só considera fases com timeCasa preenchido
            if (partida && partida.timeCasa && partida.timeCasa !== '' && partida.timeCasa !== 'TBD') {
                if (!faseMaisAlta || (FASE_PRIORIDADE[f] && FASE_PRIORIDADE[f] > (FASE_PRIORIDADE[faseMaisAlta]||0))) {
                    faseMaisAlta = f;
                }
            }
        }
    }
    console.log('[iniciarTemplateSemIntro] faseMaisAlta:', faseMaisAlta);
    var restante = (introMs > 0) ? DURACAO_CONTEUDO_MS : DURACAO_SEM_INTRO_MS;
    console.log('[caminhos_futebol] intro=' + (introMs || 0) + 'ms conteudo=' + restante + 'ms total=' + ((introMs || 0) + restante) + 'ms');
    var tempoEntrada = Math.round(restante * TEMPO_PCT_ENTRADA); // 10% entrada
    var tempoZoom    = Math.round(restante * TEMPO_PCT_ZOOM);    // 5% zoom
    var tempoFoco    = Math.max(restante - tempoEntrada - tempoZoom, 0); // 85% foco

    // 1. Animação de entrada dos cards e linhas
    animarEntradaBracket(tempoEntrada);
    destacarPartidaRecente(dados);
    animarCaminhoVencedor(dados);
    setTimeout(function() {
        BracketDraw.init();
        BracketDraw.animarLinhas(0);
    }, Math.round(tempoEntrada * 0.4)); // linhas SVG entram junto, mas um pouco depois dos cards

    // 2. Zoom após entrada — roda os 4 cantos em sequência
    if (faseMaisAlta === 'R32' || faseMaisAlta === 'R16') {
        setTimeout(function() {
            animarZoomOutBracketArea(tempoZoom);
        }, tempoEntrada);
    }

    // 3. Loader termina após todo o tempo
    var wrapper = document.getElementById('main-wrapper');
    if (wrapper) {
        wrapper.style.opacity = '1';
    }
    
    setTimeout(function() {
        _playerViewExecutando = false; // libera para próximo ciclo da playlist
        loader.finished();
    }, restante);
}

// ──────────────────────────────────────────────────
//  DESTAQUE BRASIL
//  Marca qualquer card que contenha "Brasil" (casa ou visitante)
// ──────────────────────────────────────────────────
function marcarBrasil() {
    var cards = document.querySelectorAll('.match-card');
    for (var i = 0; i < cards.length; i++) {
        var linhas = cards[i].querySelectorAll('.team-row');
        for (var j = 0; j < linhas.length; j++) {
            var span = linhas[j].querySelector('.tname');
            if (span && span.textContent.toLowerCase().indexOf('brasil') !== -1) {
                if (cards[i].className.indexOf('match-brasil') === -1) {
                    cards[i].className = cards[i].className + ' match-brasil';
                }
                if (linhas[j].className.indexOf('brasil-row') === -1) {
                    linhas[j].className = linhas[j].className + ' brasil-row';
                }
            }
        }
    }
}

// ──────────────────────────────────────────────────
//  DESTAQUE CAMPEÃO
//  Se a Final tiver resultado, destaca o time vencedor
// ──────────────────────────────────────────────────
function marcarCampeao(dados) {
    var final = dados['FINAL_1'];
    if (!final || !final.golsCasa || !final.golsVisitante) return;

    var gcasa = parseInt(final.golsCasa, 10);
    var gvis  = parseInt(final.golsVisitante, 10);
    if (isNaN(gcasa) || isNaN(gvis) || gcasa === gvis) return;

    var card = document.getElementById('m-final');
    if (!card) return;

    var linhas = card.querySelectorAll('.team-row');
    var linhaVencedor = (gcasa > gvis) ? linhas[0] : linhas[1];

    if (card.className.indexOf('match-campeao') === -1) {
        card.className = card.className + ' match-campeao';
    }
    if (linhaVencedor && linhaVencedor.className.indexOf('campeao-row') === -1) {
        linhaVencedor.className = linhaVencedor.className + ' campeao-row';
    }
}

// ──────────────────────────────────────────────────
//  OCULTAR FASES ANTERIORES
//  Quando uma fase tem todos os times definidos,
//  as colunas das fases anteriores são ocultadas.
//  Ex: se R16 está completo → oculta colunas R32.
// ──────────────────────────────────────────────────
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
    // Encontra a fase mais avançada com TODOS os times definidos
    var latestCompleto = -1;
    for (var i = 0; i < FASES_COLS.length; i++) {
        var f = FASES_COLS[i];
        if (isFaseCompleta(dados, f.fase, f.total)) {
            latestCompleto = i;
        } else {
            break; // Fases são sequenciais
        }
    }

    // Oculta todas as fases ATÉ a mais avançada completa (inclusive)
    for (var k = 0; k <= latestCompleto; k++) {
        var ids = FASES_COLS[k].colIds;
        for (var m = 0; m < ids.length; m++) {
            var col = document.getElementById(ids[m]);
            if (col) col.style.display = 'none';
        }
    }

    // Redesenha conectores SVG se alguma coluna foi ocultada
    if (latestCompleto > 0) {
        BracketDraw.init();
    }
}

// ──────────────────────────────────────────────────
//  PATROCINADOR
// ──────────────────────────────────────────────────
function aplicarSponsor(config) {
    var sponsor = config && config.sponsor;
    if (!sponsor) return;

    var footerEl = document.getElementById('sponsorFooter');
    var fraseEl  = document.getElementById('sponsorFrase');
    var logoEl   = document.getElementById('sponsorLogo');

    if (fraseEl && sponsor.frase) { fraseEl.textContent = sponsor.frase; }
    if (logoEl  && sponsor.logo)  { logoEl.src = sponsor.logo; }

    // Exibe o footer quando houver frase ou logo
    if (footerEl && (sponsor.frase || sponsor.logo)) {
        footerEl.classList.remove('hidden');
        footerEl.classList.add('flex');
    }
}

// ──────────────────────────────────────────────────
//  RENDERIZAR TODOS OS SLOTS
// ──────────────────────────────────────────────────
function renderizarBracket(dados) {
    for (var chave in SLOT_MAP) {
        if (!SLOT_MAP.hasOwnProperty(chave)) continue;
        var slotId  = SLOT_MAP[chave];
        var partida = dados[chave] || null;
        renderizarCard(slotId, partida);
    }
}

// ──────────────────────────────────────────────────
//  RENDERIZAR CARD INDIVIDUAL
// ──────────────────────────────────────────────────
function renderizarCard(slotId, partida) {
    var card = document.getElementById(slotId);
    if (!card) return;

    // Preenche data/hora no .match-slot pai
    var slot = card.parentNode;
    if (slot) {
        var dateEl = slot.querySelector('.match-date');
        if (dateEl) dateEl.textContent = (partida && partida.datahora) ? partida.datahora : '';
    }

    var linhas = card.querySelectorAll('.team-row');
    if (!linhas || linhas.length < 2) return;

    var linhaCasa      = linhas[0];
    var linhaVisitante = linhas[1];

    // Sem dados → exibe "a definir"
    if (!partida || !partida.timeCasa) {
        preencherLinha(linhaCasa,      '', '', '');
        preencherLinha(linhaVisitante, '', '', '');
        return;
    }

    // Preenche time da casa (linha 0)
    preencherLinha(linhaCasa, partida.timeCasa, partida.flagCasa, partida.golsCasa);

    // Preenche visitante (linha 1)
    preencherLinha(linhaVisitante, partida.timeVisitante, partida.flagVisitante, partida.golsVisitante);

    // Aplica destaque de vencedor/perdedor se jogo encerrado
    if (partida.status === 'FT' || partida.status === 'AET' || partida.status === 'PEN') {
        aplicarResultado(card, partida);
    }
}

function preencherLinha(linha, nome, flagUrl, gols) {
    var imgFlag   = linha.querySelector('.flag');
    var spanNome  = linha.querySelector('.tname');
    var spanScore = linha.querySelector('.score');

    // ✅ Aceita qualquer nome que venha dos dados (inclusive "Vencedor de...", "Perdedor de...")
    var nomeValido = nome && nome.length > 0;

    if (imgFlag) {
        if (flagUrl && nomeValido) {
            imgFlag.src          = flagUrl;
            imgFlag.alt          = nome;
            imgFlag.style.display = '';
        } else {
            imgFlag.style.display = 'none';
        }
    }

    if (spanNome) {
        if (nomeValido) {
            spanNome.textContent = nome;
            spanNome.className   = spanNome.className.replace(/\s*tname-indef/g, '');
        } else {
            spanNome.textContent = 'a definir';
            if (spanNome.className.indexOf('tname-indef') === -1) {
                spanNome.className = spanNome.className + ' tname-indef';
            }
        }
    }

    if (spanScore) spanScore.textContent = (gols !== '' && gols !== undefined && gols !== null) ? gols : '';
}

function aplicarResultado(card, partida) {
    var gcasa = parseInt(partida.golsCasa,      10);
    var gvis  = parseInt(partida.golsVisitante, 10);

    var linhas = card.querySelectorAll('.team-row');
    var linhaCasa      = linhas[0];
    var linhaVisitante = linhas[1];

    if (isNaN(gcasa) || isNaN(gvis)) return;

    if (gcasa > gvis) {
        linhaCasa.className      = linhaCasa.className      + ' winner';
        linhaVisitante.className = linhaVisitante.className + ' loser';
    } else if (gvis > gcasa) {
        linhaVisitante.className = linhaVisitante.className + ' winner';
        linhaCasa.className      = linhaCasa.className      + ' loser';
    }
    // Empate sem destaque (aguardando prorrogação/pênaltis)
}

// ──────────────────────────────────────────────────
//  ATUALIZAR LABEL DE FASE ATUAL
// ──────────────────────────────────────────────────
function atualizarFaseAtual(dados) {
    var melhorPrioridade = 0;
    var melhorFase       = '';

    for (var chave in dados) {
        if (!dados.hasOwnProperty(chave)) continue;
        var p = dados[chave];
        var status = p.status;
        // Considera como "fase ativa" se jogo ao vivo ou encerrado
        if (status === 'NS' || status === 'TBD') continue;
        var prio = FASE_PRIORIDADE[p.fase] || 0;
        if (prio > melhorPrioridade) {
            melhorPrioridade = prio;
            melhorFase       = p.fase;
        }
    }

    var labels = {
        'R32':    '2ª Rodada',
        'R16':    'Oitavas de Final',
        'QF':     'Quartas de Final',
        'SF':     'Semifinal',
        'FINAL':  'Grande Final',
        'BRONZE': 'Disputa de 3º Lugar'
    };

    var el = document.getElementById('header-fase');
    if (el && melhorFase) {
        el.textContent = labels[melhorFase] || melhorFase;
    }
}

// ──────────────────────────────────────────────────
//  ANIMAÇÃO: ENTRADA COM STAGGER (fora→dentro)
//  R32 aparece primeiro em pares L+R, Final por último
// ──────────────────────────────────────────────────
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
    var stagger = Math.max(Math.floor(tempoEntrada / STAGGER_ORDER.length), 10); // mínimo 10ms
    animarLabels();
    for (var i = 0; i < STAGGER_ORDER.length; i++) {
        animarCardComDelay(STAGGER_ORDER[i], i * stagger);
    }
    // Linhas SVG: já controladas por iniciarTemplateSemIntro
}

function animarLabelComDelay(el, delay) {
    setTimeout(function() {
        el.style.opacity   = '1';
        el.style.transform = 'scale(1)';
    }, delay);
}

function animarLabels() {
    var labels = document.querySelectorAll('.round-label');
    for (var i = 0; i < labels.length; i++) {
        labels[i].style.opacity    = '0';
        labels[i].style.transition = 'opacity 0.4s ease';
    }
    // Gold e Bronze: efeito de escala extra para destacar
    var especiais = document.querySelectorAll('.round-label--gold, .round-label--bronze');
    for (var k = 0; k < especiais.length; k++) {
        especiais[k].style.transform  = 'scale(0.6)';
        especiais[k].style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
    }
    for (var j = 0; j < labels.length; j++) {
        animarLabelComDelay(labels[j], j * 80);
    }
}

function animarCardComDelay(id, delay) {
    var card = document.getElementById(id);
    if (!card) return;
    card.style.opacity   = '0';
    card.style.transform = 'translateY(-8px)';
    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

    setTimeout(function() {
        card.style.opacity   = '1';
        card.style.transform = 'translateY(0)';
    }, delay);
}

// ──────────────────────────────────────────────────
//  DESTAQUE: PARTIDA MAIS RECENTE COM RESULTADO
// ──────────────────────────────────────────────────
function destacarPartidaRecente(dados) {
    var melhorPrioridade = -1;
    var melhorChave      = '';
    var statusAtivos     = { '1H': 1, 'HT': 1, '2H': 1, 'ET': 1, 'BT': 1, 'P': 1, 'FT': 1, 'AET': 1, 'PEN': 1 };

    for (var chave in dados) {
        if (!dados.hasOwnProperty(chave)) continue;
        var p = dados[chave];
        if (!statusAtivos[p.status]) continue;
        var prio = FASE_PRIORIDADE[p.fase] || 0;
        if (prio > melhorPrioridade) {
            melhorPrioridade = prio;
            melhorChave      = chave;
        }
    }

    if (!melhorChave) return;

    var slotId = SLOT_MAP[melhorChave];
    if (!slotId) return;

    var card = document.getElementById(slotId);
    if (!card) return;

    card.className = card.className + ' match-highlight';
}

// ──────────────────────────────────────────────────
//  CAMINHO DO VENCEDOR (winner-path glow)
// ──────────────────────────────────────────────────
function animarCaminhoVencedor(dados) {
    for (var chave in dados) {
        if (!dados.hasOwnProperty(chave)) continue;
        var p      = dados[chave];
        var status = p.status;

        // Só aplica em jogos encerrados
        if (status !== 'FT' && status !== 'AET' && status !== 'PEN') continue;

        var gcasa = parseInt(p.golsCasa,      10);
        var gvis  = parseInt(p.golsVisitante, 10);
        if (isNaN(gcasa) || isNaN(gvis)) continue;

        // Se há um vencedor claro, realça o card no caminho
        if (gcasa !== gvis) {
            var slotId = SLOT_MAP[chave];
            if (!slotId) continue;
            var card = document.getElementById(slotId);
            if (card) {
                card.className = card.className + ' winner-path';
            }
        }
    }
}
