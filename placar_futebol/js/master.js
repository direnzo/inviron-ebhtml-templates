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
    corEscura:   '#000000',  // cor de fundo (painéis, gradientes)
    corClara:    '#FFFFFF'   // cor de texto e bordas
};
/* segundos de exibição da imagem de abertura (vídeo usa duração natural do arquivo) */
var INTRO_DURACAO_IMG = 5;

/* chave localStorage para rotação de partidas (padrão master_2) */
var LS_KEY_PARTIDA = 'placar_futebol_partida_idx';


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
    s.setProperty('--cor-fundo-painel',  hexToRgba(cfg.corEscura,   0.60));
    s.setProperty('--cor-fundo-area',    hexToRgba(cfg.corEscura,   0.40));
    s.setProperty('--cor-borda',         hexToRgba(cfg.corClara,    0.10));
    s.setProperty('--cor-texto',         cfg.corClara);
    s.setProperty('--cor-texto-sec',     hexToRgba(cfg.corClara,    0.50));
    s.setProperty('--cor-texto-ter',     hexToRgba(cfg.corClara,    0.38));
    s.setProperty('--cor-grad-from',     hexToRgba(cfg.corEscura,   0.70));
    s.setProperty('--cor-grad-mid',      hexToRgba(cfg.corEscura,   0.60));
    s.setProperty('--cor-grad-to',       hexToRgba(cfg.corEscura,   0.80));
}


/* ====================================================
   ENTRADA
   ==================================================== */
window.onload = function() {

    aplicarCores(CONFIG);

    ebhtml.create2({}, function(loader) {
        // Carrega TODOS os itens TYPE=10 (jogos + patrocinador) de uma vez.
        // A rotação é feita client-side via localStorage (padrão master_2).
        loader.addData('D_SPD', false, 'amount=0&f_type=10');
        loader.autoloaded = false;
        loader.nodataiserror = false;

        loader.load(function() {

            loader.loaded();


            var lista = loader.datalist('D_SPD');
            if (!lista || lista.count() === 0) {
                console.log('[placar_futebol] D_SPD vazio — skip');
                loader.finished();
                return;
            }

            // Separa jogos (CONFIG=0) e patrocinador (CONFIG=1)
            var jogos = [];
            var spdSponsor = null;
            for (var i = 0; i < lista.count(); i++) {
                var item = lista.get(i);
                if (obterValor(item, 'CONFIG') === '1') {
                    spdSponsor = item;
                } else if (obterValor(item, 'TYPE') === '10') {
                    jogos.push(item);
                }
            }

            if (jogos.length === 0) {
                console.log('[placar_futebol] Nenhum jogo encontrado em D_SPD');
                loader.finished();
                return;
            }

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

            // Segunda fase: D_FOOTBALL filtrado pelo ID da partida
            ebhtml.create2({}, function(loader2) {
                loader2.addData('D_FOOTBALL', false, 'f_texto=' + partidaId);
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

                    processarDados(spdData, spdSponsor, footballData, loader);
                });
            });
        });
    });
};

/* ====================================================
   PROCESSA OS DADOS E RENDERIZA
   spdData, spdSponsor, footballData já resolvidos;
   loader (D_SPD) controla a playlist.
   ==================================================== */
function processarDados(spdData, spdSponsor, footballData, loader) {

    var statusBase = obterValor(footballData, 'SUBTITULO3');
    var estado     = determinarEstado(statusBase, spdData);

    var dtFormatada = formatarDataHora(obterValor(footballData, 'DATE'));

    var dados = {
        time1:      obterValor(footballData, 'TITULO'),
        time2:      obterValor(footballData, 'TITULO2'),
        estadio:    obterValor(footballData, 'SUBTITULO'),
        rodada:     traduzirFase(obterValor(footballData, 'SUBTITULO2')),
        torneio:    obterValor(footballData, 'CATEGORY'),
        hora:       dtFormatada.hora,
        data:       dtFormatada.data,
        foto1:      obterValor(footballData, 'FOTO'),
        foto2:      obterValor(footballData, 'FOTO2'),
        estado:     estado,
        statusRaw:  (spdData ? obterValor(spdData, 'TEXT4') : statusBase).toUpperCase().trim(),
        gols1:      spdData ? obterValor(spdData, 'TEXT5') : '0',
        gols2:      spdData ? obterValor(spdData, 'TEXT6') : '0',
        pen1:       spdData ? obterValor(spdData, 'TEXT7') : '',
        pen2:       spdData ? obterValor(spdData, 'TEXT8') : '',
        tempo:      spdData ? obterValor(spdData, 'TEXT9') : '',
        tempoExtra: spdData ? obterValor(spdData, 'TEXT10') : '',
        patroFrase:  spdSponsor ? obterValor(spdSponsor, 'TEXT1') : '',
        patroLogo:   spdSponsor ? obterValor(spdSponsor, 'IMAGE_LOGO') : '',
        introMedia:  spdSponsor ? obterValor(spdSponsor, 'FILE_IMAGE1') : ''
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
            '<span class="text-white/30 mx-[0.15em]"> x </span>' +
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
        videoSrc = 'img/soccer-background-loop-2026-01-28-04-07-44-utc.mp4';
    } else if (dados.estado === 'ao_vivo') {
        videoSrc = 'img/soccer-background-loop-1-2026-01-28-03-22-41-utc.mp4';
    } else {
        videoSrc = 'img/soccer-background-loop-6-2026-01-28-03-43-08-utc.mp4';
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
            if (gradEl) { gradEl.classList.remove('opacity-0'); gradEl.classList.add('opacity-100'); }

            setTimeout(function() {
                loader.finished();
            }, 10000);
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
        mostrarIntro(dados.introMedia, function() {
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
function mostrarIntro(url, onDone) {
    var introEl = document.querySelector('#introScreen');
    if (!introEl) { onDone(); return; }

    // Detecta tipo ANTES de normalizar (URL original tem extensão)
    var isVideo = isUrlVideo(url);

    url = normalizarUrlMidia(url);
    console.log('[placar_futebol] intro (' + (isVideo ? 'video' : 'imagem') + '): ' + url);

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

        vid.addEventListener('loadstart',  function() { console.log('[intro-video] loadstart'); });
        vid.addEventListener('loadeddata', function() { console.log('[intro-video] loadeddata'); });
        vid.addEventListener('canplay',    function() { console.log('[intro-video] canplay'); });
        vid.addEventListener('playing',    function() { console.log('[intro-video] playing'); });
        vid.addEventListener('ended',      function() { console.log('[intro-video] ended'); onDone(); });
        vid.addEventListener('error',      function(e) {
            var code = vid.error ? vid.error.code : '?';
            console.error('[intro-video] error code=' + code + ' url=' + url);
            onDone();
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
                    onDone();
                });
            }
        });

        vid.src = url;
        vid.load();
    } else {
        var img = document.createElement('img');
        img.className = 'w-full h-full object-cover';
        img.onload = function() {
            setTimeout(onDone, INTRO_DURACAO_IMG * 1000);
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
