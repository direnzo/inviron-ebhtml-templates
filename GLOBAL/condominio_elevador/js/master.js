/**
 * condominio_elevador — master.js
 * Template para telas de elevador: vídeo (topo) + comunicados (base).
 *
 * REGRAS: ES5 obrigatório — sem let/const, sem arrow functions,
 *         sem template strings, sem fetch(), sem async/await.
 */

var DATASET_CONFIG      = 'D_CONFIG';
var DATASET_COMUNICADOS = 'D_COMUNICADOS';

var config = {
    duration:             40000,  /* duração total do item na playlist (ms)  */
    comunicadoSlideTime:  10000    /* tempo por comunicado (ms)               */
};

/* Estilos de badge por editoria (chave normalizada: maiúsc. sem acentos) */
var BADGE_STYLES = {
    'SEGURANCA':    { bg: '#2d0707', text: '#fca5a5', border: '#ef4444' },
    'LIMPEZA':      { bg: '#052e16', text: '#86efac', border: '#22c55e' },
    'COMPLIANCE':   { bg: '#0c1a35', text: '#93c5fd', border: '#3b82f6' },
    'MANUTENCAO':   { bg: '#180a3d', text: '#c4b5fd', border: '#8b5cf6' },
    'AVISOS':       { bg: '#2d1b00', text: '#fde68a', border: '#f59e0b' },
    'COMUNICADO':   { bg: '#1a1a2e', text: '#a5b4fc', border: '#6366f1' }
};

var comunicados   = [];
var currentSlide  = 0;
var slideTimer    = null;

/* ──────────────────────────────────────────────────────────────
   Utilitários
   ────────────────────────────────────────────────────────────── */

/* Remove acentos e retorna chave maiúscula limpa */
function normalizeKey(str) {
    var map = {
        'Á':'A','Â':'A','Ã':'A','À':'A',
        'É':'E','Ê':'E','È':'E',
        'Í':'I','Î':'I',
        'Ó':'O','Ô':'O','Õ':'O','Ò':'O',
        'Ú':'U','Û':'U','Ù':'U',
        'Ç':'C'
    };
    var result = '';
    var upper = (str || '').toUpperCase();
    for (var i = 0; i < upper.length; i++) {
        var c = upper[i];
        result += map[c] !== undefined ? map[c] : c;
    }
    return result.replace(/[^A-Z]/g, '');
}

function getBadgeStyle(editoria) {
    var key = normalizeKey(editoria);
    return BADGE_STYLES[key] || { bg: '#1c1c1c', text: '#9ca3af', border: '#374151' };
}

/* Rotação sequencial por localStorage — retorna índice atual e avança */
function getNextIndex(key, total) {
    if (!total || total <= 1) { return 0; }
    var idx = 0;
    try {
        idx = (parseInt(localStorage.getItem(key), 10) || 0) % total;
        localStorage.setItem(key, (idx + 1) % total);
    } catch (e) { /* localStorage indisponível */ }
    return idx;
}

/* Ajusta font-size do título por busca binária até caber em 2 linhas */
function fitTitulo() {
    var el      = document.getElementById('comunicadoTitulo');
    var wrapper = document.getElementById('tituloWrapper');
    if (!el || !wrapper || !el.textContent.replace(/\s/g, '')) { return; }

    var MAX = 1.6, MIN = 0.5;
    el.style.fontSize = MAX + 'em';
    if (el.scrollHeight <= wrapper.clientHeight) { return; }

    var lo = MIN, hi = MAX, cur;
    for (var i = 0; i < 7; i++) {
        cur = (lo + hi) / 2;
        el.style.fontSize = cur + 'em';
        if (el.scrollHeight <= wrapper.clientHeight) { lo = cur; } else { hi = cur; }
    }
    el.style.fontSize = lo + 'em';
}

/* Reinicia a barra de progresso para o tempo do slide atual */
function resetProgressBar() {
    var bar = document.getElementById('progressBar');
    if (!bar) { return; }
    bar.style.transition = 'none';
    bar.style.width = '0%';
    bar.offsetWidth; /* force reflow para reset instantâneo antes da transição */
    bar.style.transition = 'width ' + config.comunicadoSlideTime + 'ms linear';
    bar.style.width = '100%';
}

/* ──────────────────────────────────────────────────────────────
   Controle de slides de comunicados
   ────────────────────────────────────────────────────────────── */

function showSlide(idx) {
    if (!comunicados.length) { return; }
    var item   = comunicados[idx];
    var card   = document.getElementById('comunicadoCard');
    var badge  = document.getElementById('editoriaBadge');
    var titulo = document.getElementById('comunicadoTitulo');
    var texto  = document.getElementById('comunicadoTexto');

    /* Inicia fade out */
    card.style.opacity = '0';

    /* Atualiza conteúdo e roda fitTitulo enquanto card está invisível.
       Reflows da busca binária nunca ficam visíveis ao usuário. */
    var editoria = item.editoria || 'AVISOS';
    var bs       = getBadgeStyle(editoria);

    badge.textContent           = editoria;
    badge.style.backgroundColor = bs.bg;
    badge.style.color           = bs.text;
    badge.style.borderColor     = bs.border;

    titulo.textContent = item.titulo || '';
    texto.textContent  = item.texto  || '';
    fitTitulo();
    resetProgressBar();

    /* Aguarda a transição de saída concluir antes de revelar o novo conteúdo */
    setTimeout(function () {
        card.style.opacity = '1';
    }, 600);
}

function nextSlide() {
    if (!comunicados.length) { return; }
    currentSlide = (currentSlide + 1) % comunicados.length;
    showSlide(currentSlide);
}

function startSlideTimer() {
    if (slideTimer) { clearInterval(slideTimer); }
    slideTimer = setInterval(nextSlide, config.comunicadoSlideTime);
}

/* ──────────────────────────────────────────────────────────────
   Vídeo
   ────────────────────────────────────────────────────────────── */

/*
 * Inicia o vídeo e chama onReady(totalDuration) assim que os metadados
 * estão disponíveis. Handlers são atribuídos ANTES de player.src.
 */
function setupVideo(url, loops, onReady) {
    var player      = document.getElementById('videoPlayer');
    var placeholder = document.getElementById('videoPlaceholder');

    if (!url) {
        player.style.display = 'none';
        onReady(config.duration);
        return;
    }

    /* Handlers ANTES do src — evita race condition em cache (WebKit legado) */
    player.onloadedmetadata = function () {
        var ms = player.duration > 0 ? Math.round(player.duration * 1000) : config.duration;
        onReady(ms * (loops || 1));
    };
    player.onerror = function () {
        player.style.display = 'none';
        placeholder.style.display = '';
        onReady(config.duration);
    };

    placeholder.style.display = 'none';
    player.style.display = '';
    player.src = url;
    player.play();
}

/* ──────────────────────────────────────────────────────────────
   Bootstrap principal (EBHTML)
   ────────────────────────────────────────────────────────────── */

window.onload = function () {
    var body = document.body;

    ebhtml.create2({}, function (loader) {
        loader.addData(DATASET_CONFIG,      false);
        loader.addData(DATASET_COMUNICADOS, false);
        loader.nodataiserror = false;
        loader.autoloaded    = false;

        var settled = false;

        function concluir() {
            if (settled) { return; }
            settled = true;
            loader.loaded();
            setTimeout(function () { loader.finished(); }, config.duration);
        }

        /* Watchdog conservador — cobre falha de rede + video sem metadata */
        var watchdog = setTimeout(concluir, 65000);

        loader.load(
            function () {
                clearTimeout(watchdog);

                /* Ler configuração */
                var cfgData    = loader.data(DATASET_CONFIG);
                var videoList  = [];
                var videoLoops = 1;

                if (cfgData) {
                    var loops = cfgData.value('VIDEO_LOOPS');
                    if (loops && loops.value) { videoLoops = parseInt(loops.value, 10) || 1; }

                    /* Coleta VIDEO1 .. VIDEO9 em ordem */
                    for (var n = 1; n <= 9; n++) {
                        var vf = cfgData.value('VIDEO' + n);
                        if (vf && vf.value) { videoList.push(vf.value); }
                    }

                    var nome = cfgData.value('NOME_CONDOMINIO');
                    if (nome && nome.value) {
                        var el = document.getElementById('condoNome');
                        if (el) { el.textContent = nome.value; }
                    }
                }

                /* Carregar todos os comunicados e selecionar um por rotação */
                var allComunicados = [];
                var list = loader.datalist(DATASET_COMUNICADOS);
                if (list) {
                    for (var i = 0; i < list.count(); i++) {
                        var item = list.get(i);
                        allComunicados.push({
                            editoria: item.value('EDITORIA').value,
                            titulo:   item.value('TITULO').value,
                            texto:    item.value('TEXTO').value
                        });
                    }
                }
                if (allComunicados.length === 0) {
                    allComunicados.push({
                        editoria: 'AVISOS',
                        titulo:   'Sem comunicados disponíveis',
                        texto:    'Não há comunicados no momento. Aguarde novas informações da administração.'
                    });
                }

                /* Rotação independente: vídeo e comunicado */
                var videoIdx = getNextIndex('cond_elev_video_idx', videoList.length);
                var comIdx   = getNextIndex('cond_elev_com_idx',   allComunicados.length);
                comunicados.push(allComunicados[comIdx]);

                /* Watchdog específico para falha de metadata do vídeo */
                var metaWatchdog = setTimeout(function () {
                    body.style.opacity = '1';
                    showSlide(0);
                    concluir();
                }, 8000);

                setupVideo(videoList[videoIdx] || '', videoLoops, function (totalDuration) {
                    clearTimeout(metaWatchdog);

                    /* Duração real do item = duração do vídeo × loops */
                    config.duration             = totalDuration;
                    config.comunicadoSlideTime  = totalDuration;

                    showSlide(0);
                    body.style.opacity = '1';
                    concluir();
                });
            },

            function () {
                clearTimeout(watchdog);
                body.style.opacity = '1';
                concluir();
            }
        );
    });
};
