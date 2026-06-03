/**
 * master.js - Segunda Fase Copa 2026 (1 chave por reload, didatico)
 * ES5 obrigatorio
 *
 * Dados: D_FOOTBALL.TEXTO3 (JSON partidas, igual caminhos_futebol)
 * Tempo: 10s padrao + intro D_SPD.DURACAO (quando houver)
 *
 * Fluxo: cada reload mostra UMA chave (bloco de ate 4 jogos cujos
 * vencedores formam a fase seguinte). Times "à definir" sao exibidos
 * como "Vencedor: A x B" ou "Vencedor do Jogo X (Oitavas)" — sempre
 * referenciando o jogo de origem para facilitar a leitura.
 */

var FASES_ORDEM = ['R32', 'R16', 'QF', 'SF', 'FINAL', 'BRONZE'];
var FASE_LABEL = {
    'R32':    'Segundas de Final',
    'R16':    'Oitavas de Final',
    'QF':     'Quartas de Final',
    'SF':     'Semifinais',
    'FINAL':  'Grande Final',
    'BRONZE': 'Disputa do 3º Lugar'
};
var FASE_CURTA = {
    'R32': 'Seg. Final', 'R16': 'Oitavas', 'QF': 'Quartas',
    'SF':  'Semis',      'FINAL': 'Final', 'BRONZE': '3º Lugar'
};

var LS_KEY_CHAVE = 'segundafase_futebol_chave_idx';

var DURACAO_PADRAO_MS        = 10000;
var DURACAO_IMAGEM_PADRAO_MS = 5000;
var CONTENT_FILES_HOST = window.location.protocol + '//127.0.0.1:13199';

var CONFIG = {
    corDestaque: '#FBBF24',
    corEscura:   '#006400',
    corClara:    '#FFFFFF'
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
                    console.log('[segundafase_futebol] ✅ SVG injetado: ' + src);
                    if (onSuccess) { onSuccess(); }
                } else {
                    console.error('[segundafase_futebol] Arquivo não contém SVG válido: ' + src);
                    if (onError) { onError(); }
                }
            } catch (e) {
                console.error('[segundafase_futebol] Erro ao injetar SVG:', e);
                if (onError) { onError(); }
            }
        } else {
            console.error('[segundafase_futebol] HTTP ' + xhr.status + ' ao carregar SVG: ' + src);
            if (onError) { onError(); }
        }
    };
    
    xhr.onerror = function() {
        console.error('[segundafase_futebol] Erro de rede ao carregar SVG: ' + src);
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
        
        // CAF (4 times)
        'SEN': 'sn', 'MOR': 'ma', 'MAR': 'ma', 'TUN': 'tn', 'NGA': 'ng',
        
        // AFC (2 times)
        'JPN': 'jp', 'KOR': 'kr'
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

var STATUS_LABEL = {
    'TBD':  'À definir',
    'NS':   'À definir',
    '1H':   'Ao vivo',
    'HT':   'Intervalo',
    '2H':   'Ao vivo',
    'ET':   'Prorrogação',
    'BT':   'Intervalo',
    'P':    'Pênaltis',
    'FT':   'Finalizado',
    'AET':  'Finalizado',
    'PEN':  'Finalizado',
    'LIVE': 'Ao vivo'
};

/* ====================================================
   MAPA DE FASES DO CAMPEONATO → PT-BR
   Traduções de fases/rodadas comuns
   ==================================================== */
var FASE_LABEL_TRADUCAO = {
    'group stage':     'Fase de Grupos',
    'round of 32':     '1/32 de Final',
    'round of 16':     'Oitavas de Final',
    'quarter-finals':  'Quartas de Final',
    'semi-finals':     'Semifinais',
    'final':           'Final',
    '3rd place':       'Disputa de 3º Lugar',
    'oitavas de final': 'Oitavas de Final',
    'quartas de final': 'Quartas de Final',
    'semifinais':      'Semifinais',
    'matchday 1':      'Rodada 1',
    'round 1':         'Rodada 1'
};

/**
 * Traduz fase/rodada do campeonato para PT-BR.
 */
function traduzirFase(texto) {
    if (!texto) { return ''; }
    var chave = texto.toLowerCase().trim();
    if (FASE_LABEL_TRADUCAO[chave]) {
        return FASE_LABEL_TRADUCAO[chave];
    }
    var mMatchday = chave.match(/^matchday\s+(\d+)$/);
    if (mMatchday) { return 'Rodada ' + mMatchday[1]; }
    var mRound = chave.match(/^round\s+(\d+)$/);
    if (mRound) { return 'Rodada ' + mRound[1]; }
    return texto;
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
        console.error('[segundafase_futebol] buscarTime: parâmetros inválidos');
        callback(null);
        return;
    }
    
    loader.addData('D_FOOTBALL_TEAMS', false, 'f_titulo=' + teamId);
    
    loader.load(function() {
        var time = loader.data('D_FOOTBALL_TEAMS');
        
        if (!time) {
            console.error('[segundafase_futebol] D_FOOTBALL_TEAMS sem dados para ID=' + teamId);
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
        
        console.log('[segundafase_futebol] Time ID=' + teamId + ': ' + timeData.nome + ' (' + timeData.codigo + ') → SVG: ' + (bandeiras.bandeira ? 'OK' : 'N/A'));
        
        callback(timeData);
    });
}

/**
 * Sanitiza nomes de torneios (remove palavras proibidas).
 */
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
    resultado = resultado.replace(/\s+/g, ' ').trim();
    return resultado;
}

function hexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

function aplicarCores(cfg) {
    var s = document.documentElement.style;
    s.setProperty('--cor-destaque',     cfg.corDestaque);
    s.setProperty('--cor-fundo-painel', hexToRgba(cfg.corEscura, 0.92));
    s.setProperty('--cor-borda',        hexToRgba(cfg.corClara, 0.15));
    s.setProperty('--cor-texto',        cfg.corClara);
}

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

function obterValorSpd(spd, campo) {
    return obterValor(spd, campo);
}

/**
 * Obtém duração máxima da intro (vídeo/imagem do patrocinador).
 * REGRA: Se TEXT2 existir no D_SPD CONFIG=1, usar como tempo de corte do vídeo.
 *        Se TEXT2 não existir ou for vazio, retorna 0 (sem limite - vídeo roda até o fim).
 * @param {Object} spd - Registro D_SPD CONFIG=1 (plano ou EdgeContents)
 * @returns {number} Duração em ms (0 = sem limite)
 */
function obterDuracaoIntroMs(spd) {
    var text2 = obterValorSpd(spd, 'TEXT2');
    var seg = parseInt(text2, 10);
    
    if (seg > 0) {
        console.log('[segundafase_futebol] TEXT2=' + seg + ' seg → cortar vídeo em ' + (seg * 1000) + 'ms');
        return seg * 1000;
    }
    
    console.log('[segundafase_futebol] TEXT2 vazio → vídeo sem corte (roda até ended)');
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

function parsearDatahora(s) {
    if (!s) { return { data: '', hora: '', local: '' }; }
    var partes = String(s).split(/\s*·\s*/);
    return {
        data:  partes[0] || '',
        hora:  partes[1] || '',
        local: partes.slice(2).join(' · ')
    };
}

// ──────────────────────────────────────────────────
//  PROCESSAR DADOS — array de partidas (mock e produção)
// ──────────────────────────────────────────────────
function processarDadosMock(partidas, teamsMap) {
    teamsMap = teamsMap || {};
    var dados = {};
    
    for (var i = 0; i < partidas.length; i++) {
        var p  = partidas[i];
        var fase  = p.CATEGORY  || '';
        var pos   = p.SUBTITULO || '';
        var k     = fase + '_' + pos;
        var dh    = parsearDatahora(p.SUBTITULO2 || '');
        
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
        
        dados[k] = {
            fase:          fase,
            posicao:       parseInt(pos, 10),
            timeCasa:      timeCasa,
            timeVisitante: timeVis,
            flagCasa:      flagCasa,
            flagVisitante: flagVis,
            golsCasa:      p.TEXTO      || '',
            golsVisitante: p.TEXTO2     || '',
            status:        (p.SUBTITULO3 || 'NS').toUpperCase(),
            datahora:      p.SUBTITULO2 || '',
            data:          dh.data,
            hora:          dh.hora,
            local:         dh.local
        };
    }
    return dados;
}

function agruparPorFase(dadosMap) {
    var grupos = {};
    var k;
    for (k in dadosMap) {
        if (!dadosMap.hasOwnProperty(k)) { continue; }
        var p = dadosMap[k];
        var f = p.fase;
        if (!f) { continue; }
        if (!grupos[f]) { grupos[f] = []; }
        grupos[f].push(p);
    }
    for (k in grupos) {
        if (grupos.hasOwnProperty(k)) {
            grupos[k].sort(function(a, b) {
                return (a.posicao || 0) - (b.posicao || 0);
            });
        }
    }
    return grupos;
}

function labelStatus(status) {
    return STATUS_LABEL[status] || status || '';
}

function nomeValido(nome) {
    return !!(nome && nome !== 'TBD' && nome !== '');
}

function ehEncerrado(status) {
    return status === 'FT' || status === 'AET' || status === 'PEN';
}

function ehAoVivo(status) {
    return status === '1H' || status === '2H' || status === 'ET' ||
           status === 'HT' || status === 'BT' || status === 'P'  ||
           status === 'LIVE';
}

function formatarPlacar(partida) {
    var gc = partida.golsCasa;
    var gv = partida.golsVisitante;
    var st = partida.status;
    if (st === 'NS' || st === 'TBD') { return 'X'; }
    if (gc === '' && gv === '')      { return 'X'; }
    return gc + ' – ' + gv;
}

// ------------------------------------------------------------
//  Chaveamento — quem alimenta quem
// ------------------------------------------------------------
var FASE_ANTERIOR = {
    'R16':    'R32',
    'QF':     'R16',
    'SF':     'QF',
    'FINAL':  'SF',
    'BRONZE': 'SF'
};

function feedersDe(fase, posicao) {
    var prev = FASE_ANTERIOR[fase];
    if (!prev) { return null; }
    if (fase === 'FINAL' || fase === 'BRONZE') {
        return [{ fase: 'SF', posicao: 1 }, { fase: 'SF', posicao: 2 }];
    }
    return [
        { fase: prev, posicao: 2 * posicao - 1 },
        { fase: prev, posicao: 2 * posicao }
    ];
}

function buscarPartida(dadosMap, fase, posicao) {
    return dadosMap[fase + '_' + posicao] || null;
}

function expandirGrupoStr(s) {
    if (!s) { return s; }
    var m = String(s).match(/^([123])º([A-Z]+)$/);
    if (!m) { return s; }
    var pos = m[1];
    var grupos = m[2];
    if (grupos.length === 1) {
        return pos + 'º do Grupo ' + grupos;
    }
    return pos + 'º entre Grupos ' + grupos.split('').join('/');
}

function resolverNomeTime(partida, lado, dadosMap) {
    var nomeRaw = (lado === 'casa') ? partida.timeCasa : partida.timeVisitante;
    var flagRaw = (lado === 'casa') ? partida.flagCasa : partida.flagVisitante;

    if (nomeValido(nomeRaw)) {
        var expandido = expandirGrupoStr(nomeRaw);
        var ehPlaceholder = (expandido !== nomeRaw);
        return { nome: expandido, flag: flagRaw, placeholder: ehPlaceholder };
    }

    // BRONZE: perdedores das semifinais
    if (partida.fase === 'BRONZE') {
        var n = (lado === 'casa') ? 1 : 2;
        return { nome: 'Perdedor da ' + (n === 1 ? '1ª' : '2ª') + ' Semifinal', flag: '', placeholder: true };
    }
    // FINAL: vencedores das semifinais
    if (partida.fase === 'FINAL') {
        var nF = (lado === 'casa') ? 1 : 2;
        return { nome: 'Vencedor da ' + (nF === 1 ? '1ª' : '2ª') + ' Semifinal', flag: '', placeholder: true };
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
            return {
                nome: 'Vencedor do Jogo ' + feeder.posicao + ' (' + FASE_CURTA[feeder.fase] + ')',
                flag: '', placeholder: true
            };
        }
    }
    return { nome: 'À definir', flag: '', placeholder: true };
}

// ------------------------------------------------------------
//  Chaves — divisao em blocos de ate 4 confrontos
// ------------------------------------------------------------
function tamanhoChaveDaFase(fase) {
    if (fase === 'R32' || fase === 'R16' || fase === 'QF') { return 4; }
    if (fase === 'SF') { return 2; }
    return 1; /* FINAL, BRONZE */
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
                fase:    fase,
                idx:     k + 1,
                total:   total,
                partidas: partidas.slice(k * tamanho, (k + 1) * tamanho)
            });
        }
    }
    return ordem;
}

function rotuloChave(chave) {
    var nome = (FASE_LABEL[chave.fase] || chave.fase).toUpperCase();
    if (chave.total <= 1) { return nome; }
    return nome + ' · PARTE ' + chave.idx + ' DE ' + chave.total;
}

function destinoChave(chave) {
    var f = chave.fase;
    if (f === 'R32')    { return 'Os vencedores destes jogos avançam para as Oitavas de Final'; }
    if (f === 'R16')    { return 'Os vencedores destes jogos avançam para as Quartas de Final'; }
    if (f === 'QF')     { return 'Os vencedores destes jogos avançam para as Semifinais'; }
    if (f === 'SF')     { return 'Os vencedores vão à Final · Os perdedores disputam o 3º lugar'; }
    if (f === 'FINAL')  { return 'A partida que define o campeão do Mundo 2026'; }
    if (f === 'BRONZE') { return 'A partida que define o 3º colocado do Mundo 2026'; }
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

// ------------------------------------------------------------
//  Render — card e chave
// ------------------------------------------------------------
function preencherCardPartida(card, partida, dadosMap) {
    var dataEl    = card.querySelector('[data-campo="data"]');
    var horaEl    = card.querySelector('[data-campo="hora"]');
    var localEl   = card.querySelector('[data-campo="local"]');
    var statusEl  = card.querySelector('[data-campo="status"]');
    var nomeCasa  = card.querySelector('[data-campo="nomeCasa"]');
    var flagCasa  = card.querySelector('[data-campo="flagCasa"]');
    var placarEl  = card.querySelector('[data-campo="placar"]');
    var nomeVisit = card.querySelector('[data-campo="nomeVisit"]');
    var flagVisit = card.querySelector('[data-campo="flagVisit"]');
    var casaWrap  = card.querySelector('[data-campo="casa"]');
    var visitWrap = card.querySelector('[data-campo="visit"]');

    var resCasa  = resolverNomeTime(partida, 'casa',  dadosMap);
    var resVisit = resolverNomeTime(partida, 'visit', dadosMap);

    if (dataEl)  { dataEl.textContent  = partida.data  || ''; }
    if (horaEl)  { horaEl.textContent  = partida.hora  || ''; }
    if (localEl) {
        localEl.textContent = partida.local || '';
        if (partida.local) { localEl.classList.remove('hidden'); }
        else { localEl.classList.add('hidden'); }
    }

    if (statusEl) {
        var aoVivo = ehAoVivo(partida.status);
        var fim    = ehEncerrado(partida.status);
        statusEl.textContent = labelStatus(partida.status);
        statusEl.className = statusEl.className.replace(/\s*(card-status-live|card-status-end|card-status-pend)/g, '');
        if (aoVivo) { statusEl.className += ' card-status-live'; }
        else if (fim) { statusEl.className += ' card-status-end'; }
        else { statusEl.className += ' card-status-pend'; }
    }

    if (nomeCasa) {
        nomeCasa.textContent = resCasa.nome;
        nomeCasa.title       = resCasa.nome;
        nomeCasa.classList.toggle('tname-indef', !!resCasa.placeholder);
    }
    if (nomeVisit) {
        nomeVisit.textContent = resVisit.nome;
        nomeVisit.title       = resVisit.nome;
        nomeVisit.classList.toggle('tname-indef', !!resVisit.placeholder);
    }
    if (flagCasa) {
        if (resCasa.flag && !resCasa.placeholder) {
            flagCasa.src = resCasa.flag;
            flagCasa.alt = resCasa.nome;
            flagCasa.style.display = '';
        } else {
            flagCasa.style.display = 'none';
        }
    }
    if (flagVisit) {
        if (resVisit.flag && !resVisit.placeholder) {
            flagVisit.src = resVisit.flag;
            flagVisit.alt = resVisit.nome;
            flagVisit.style.display = '';
        } else {
            flagVisit.style.display = 'none';
        }
    }

    if (placarEl) {
        placarEl.textContent = formatarPlacar(partida);
        placarEl.classList.toggle('card-placar-pend', !ehEncerrado(partida.status) && !ehAoVivo(partida.status));
        placarEl.classList.toggle('card-placar-live', ehAoVivo(partida.status));
    }

    if (casaWrap)  { casaWrap.classList.remove('winner', 'loser'); }
    if (visitWrap) { visitWrap.classList.remove('winner', 'loser'); }
    if (ehEncerrado(partida.status)) {
        var gc = parseInt(partida.golsCasa, 10);
        var gv = parseInt(partida.golsVisitante, 10);
        if (!isNaN(gc) && !isNaN(gv)) {
            if (gc > gv) {
                if (casaWrap)  { casaWrap.classList.add('winner'); }
                if (visitWrap) { visitWrap.classList.add('loser'); }
            } else if (gv > gc) {
                if (visitWrap) { visitWrap.classList.add('winner'); }
                if (casaWrap)  { casaWrap.classList.add('loser'); }
            }
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

function aplicarSponsor(config) {
    var sponsor = config && config.sponsor;
    var footerEl = document.getElementById('sponsorFooter');
    if (!footerEl) { return; }
    if (!sponsor || (!sponsor.frase && !sponsor.logo)) {
        footerEl.classList.add('hidden');
        footerEl.classList.remove('flex');
        return;
    }
    footerEl.classList.remove('hidden');
    footerEl.classList.add('flex');
    var fraseEl = document.getElementById('sponsorFrase');
    var logoEl  = document.getElementById('sponsorLogo');
    if (fraseEl) { fraseEl.textContent = sponsor.frase || ''; }
    if (logoEl && sponsor.logo) {
        logoEl.src = sponsor.logo;
        logoEl.classList.remove('hidden');
    } else if (logoEl) {
        logoEl.classList.add('hidden');
    }
}

function renderizarChave(chave, dadosMap, config, loader) {
    aplicarSponsor(config);

    var faseEl    = document.getElementById('headerFase');
    var contEl    = document.getElementById('headerContagem');
    var destinoEl = document.getElementById('chaveDestino');
    var cardsEl   = document.getElementById('chaveCards');
    var main      = document.getElementById('mainContent');

    if (faseEl) {
        faseEl.textContent = FASE_LABEL[chave.fase] || chave.fase;
    }
    if (contEl) {
        contEl.textContent = (chave.total > 1)
            ? ('Parte ' + chave.idx + ' de ' + chave.total)
            : '';
    }
    if (destinoEl) {
        var dst = destinoChave(chave);
        destinoEl.textContent = dst || '';
        if (dst) { destinoEl.classList.remove('hidden'); }
        else     { destinoEl.classList.add('hidden'); }
    }

    if (cardsEl) {
        cardsEl.innerHTML = '';
        cardsEl.className = cardsEl.className.replace(/\s*chave-cards-\d+/g, '')
                                             .replace(/\s*chave-fase-[A-Z0-9]+/g, '');
        cardsEl.classList.add('chave-cards-' + chave.partidas.length);
        cardsEl.classList.add('chave-fase-' + chave.fase);

        for (var i = 0; i < chave.partidas.length; i++) {
            var card = montarCardPartida(chave.partidas[i], i, dadosMap);
            if (card) { cardsEl.appendChild(card); }
        }
    }

    if (main) { main.style.opacity = '1'; }

    console.log('[segundafase_futebol] chave fase=' + chave.fase +
                ' idx=' + chave.idx + '/' + chave.total +
                ' jogos=' + chave.partidas.length);
    setTimeout(function() { loader.finished(); }, DURACAO_PADRAO_MS);
}

function iniciarExibicao(dadosMap, config, loader) {
    var grupos = agruparPorFase(dadosMap);
    var ordem  = montarOrdemChaves(grupos);

    if (ordem.length === 0) {
        console.error('[segundafase_futebol] sem chaves para exibir');
        // ❌ ERRO: NÃO chamar loader.loaded() — apenas finished()
        loader.finished();
        return;
    }
    
    // ✅ EBHTML: Avisar que o template carregou com sucesso IMEDIATAMENTE
    // (ANTES do vídeo de intro, para registrar na playlist)
    loader.loaded();
    console.log('[segundafase_futebol] loader.loaded() chamado — template registrado na playlist');

    var idx   = obterIndiceChaveAtual(ordem.length);
    var chave = ordem[idx];
    avancarIndiceChave(ordem.length);

    var sponsor = config && config.sponsor;
    var introUrl = sponsor && (sponsor.intro || sponsor.FILE_IMAGE1);
    var introMaxMs = (sponsor && sponsor.introMaxMs) ? sponsor.introMaxMs : 0;

    if (introUrl) {
        var introStart = Date.now();
        mostrarIntro(introUrl, function() {
            var introMs = Date.now() - introStart;
            console.log('[segundafase_futebol] intro=' + introMs + 'ms');
            esconderIntro(function() {
                renderizarChave(chave, dadosMap, config, loader);
            });
        }, introMaxMs);
    } else {
        renderizarChave(chave, dadosMap, config, loader);
    }
}

function normalizarUrlMidia(url) {
    if (!url) { return url; }
    url = url.trim();
    if (url.indexOf('file:///') === 0 || url.indexOf('file://') === 0) {
        var partes = url.replace(/\\/g, '/').split('/');
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
    console.log('[segundafase_futebol] intro (' + (isVideo ? 'video' : 'imagem') + ')' + (introMaxMs > 0 ? ' max=' + introMaxMs + 'ms' : ''));
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
            _introTimer = setTimeout(function() { vid.pause(); _onIntroDone(); }, introMaxMs);
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

function playerView() {
    /* noop — entrada via window.onload (preview.js redefine esta funcao) */
}

window.onload = function() {
    // Aplica cores padrão imediatamente (antes de carregar dados)
    aplicarCores(CONFIG);
    
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
        
        var spdSponsor = MOCK_DATA.D_SPD || null;
        var config = { sponsor: montarSponsorConfig(spdSponsor) };
        aplicarCores(mergeColorsFromSpd(CONFIG, spdSponsor));
        iniciarExibicao(processarDadosMock(partidas, teamsMap), config, mockLoader);
    } else {
        ebhtml.create2({}, function(loader) {
            loader.addData('D_FOOTBALL', false);
            loader.addData('D_SPD', false, 'f_config=1');  // Patrocinador (CONFIG=1)
            loader.addData('D_FOOTBALL_TEAMS', false, 'amount=0');  // Todos os times de uma vez
            loader.autoloaded    = false;
            loader.nodataiserror = false;

            loader.load(function() {
                var dfReg = loader.data('D_FOOTBALL');
                if (!dfReg) {
                    console.error('[segundafase_futebol] Sem dados D_FOOTBALL');
                    loader.finished();
                    return;
                }
                var jsonStr = obterValor(dfReg, 'TEXTO3');
                if (!jsonStr) {
                    console.error('[segundafase_futebol] D_FOOTBALL.TEXTO3 vazio');
                    loader.finished();
                    return;
                }
                var partidas;
                try { partidas = JSON.parse(jsonStr); }
                catch (e2) {
                    console.error('[segundafase_futebol] JSON.parse erro:', e2);
                    loader.finished();
                    return;
                }

                // Extrai patrocinador e SPECIALPROJECT dinâmico do D_SPD (CONFIG='1')
                var spdSponsor = loader.data('D_SPD');
                if (spdSponsor) {
                    var specialProjectAtivo = obterValor(spdSponsor, 'SPECIALPROJECT');
                    console.log('[segundafase_futebol] D_SPD patrocinador encontrado (CONFIG=1)');
                    console.log('[segundafase_futebol] SPECIALPROJECT extraído dinamicamente: ' + specialProjectAtivo);
                } else {
                    console.log('[segundafase_futebol] D_SPD patrocinador não encontrado (CONFIG=1)');
                }

                // Buscar todos os times do D_FOOTBALL_TEAMS (loader já carregou com amount=0)
                var teamsMap = {};
                var teamsLista = loader.datalist('D_FOOTBALL_TEAMS');
                if (teamsLista) {
                    for (var i = 0; i < teamsLista.count(); i++) {
                        var time = teamsLista.get(i);
                        var teamId = obterValor(time, 'TITULO');
                        var nome = obterValor(time, 'TEXTO2');
                        var codigo = obterValor(time, 'TEXTO3');
                        var fotoPng = obterValor(time, 'FOTO');
                        
                        if (teamId && nome) {
                            // Mapear para SVG local
                            var bandeiras = obterBandeiraSVG(codigo, fotoPng);
                            
                            teamsMap[teamId] = {
                                nome: nome,
                                codigo: codigo,
                                bandeira: bandeiras.bandeira || bandeiras.bandeiraFallback
                            };
                        }
                    }
                    console.log('[segundafase_futebol] D_FOOTBALL_TEAMS: ' + Object.keys(teamsMap).length + ' times mapeados');
                } else {
                    console.warn('[segundafase_futebol] D_FOOTBALL_TEAMS sem dados');
                }

                var config = { sponsor: montarSponsorConfig(spdSponsor) };
                aplicarCores(mergeColorsFromSpd(CONFIG, spdSponsor));
                iniciarExibicao(processarDadosMock(partidas, teamsMap), config, loader);
            });
        });
    }
};
