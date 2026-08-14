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

/* Ajusta font-size do título por busca binária até caber em 2 linhas */
function fitTitulo() {
    var el      = document.getElementById('comunicadoTitulo');
    var wrapper = document.getElementById('tituloWrapper');
    if (!el || !wrapper || !el.textContent.replace(/\s/g, '')) { return; }

    var MAX = 1.6, MIN = 0.5;
    el.style.fontSize = MAX + 'em';
    if (el.scrollHeight <= wrapper.clientHeight) { return; }

    var lo = MIN, hi = MAX, cur;
    for (var i = 0; i < 10; i++) {
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

    /* Fade out */
    card.style.opacity = '0';

    setTimeout(function () {
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

        /* Fade in */
        card.style.opacity = '1';
    }, 380);
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

function setupVideo(videoUrl) {
    var player      = document.getElementById('videoPlayer');
    var placeholder = document.getElementById('videoPlaceholder');

    if (videoUrl) {
        /* IMPORTANTE: handlers antes do src para evitar race condition em cache */
        player.onerror = function () {
            player.style.display = 'none';
            placeholder.style.display = '';
        };
        player.style.display = '';
        placeholder.style.display = 'none';
        player.src = videoUrl;
        player.play();
    } else {
        player.style.display = 'none';
    }
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

        /* Watchdog: garante finished() mesmo se callbacks nunca dispararem */
        var watchdog = setTimeout(concluir, config.duration + 2000);

        loader.load(
            /* sucesso */
            function () {
                clearTimeout(watchdog);

                /* Ler configuração */
                var cfgData = loader.data(DATASET_CONFIG);
                if (cfgData) {
                    var dur = cfgData.value('DURATION');
                    if (dur && dur.value) {
                        config.duration = parseInt(dur.value, 10) || config.duration;
                    }
                    var cst = cfgData.value('COMUNICADO_SLIDE_TIME');
                    if (cst && cst.value) {
                        config.comunicadoSlideTime = parseInt(cst.value, 10) || config.comunicadoSlideTime;
                    }
                    var nome = cfgData.value('NOME_CONDOMINIO');
                    if (nome && nome.value) {
                        var el = document.getElementById('condoNome');
                        if (el) { el.textContent = nome.value; }
                    }
                    var vu = cfgData.value('VIDEO_URL');
                    setupVideo(vu && vu.value ? vu.value : '');
                } else {
                    setupVideo('');
                }

                /* Ler lista de comunicados */
                var list = loader.datalist(DATASET_COMUNICADOS);
                if (list) {
                    for (var i = 0; i < list.count(); i++) {
                        var item = list.get(i);
                        comunicados.push({
                            editoria: item.value('EDITORIA').value,
                            titulo:   item.value('TITULO').value,
                            texto:    item.value('TEXTO').value
                        });
                    }
                }

                /* Garantia de ao menos um comunicado */
                if (comunicados.length === 0) {
                    comunicados.push({
                        editoria: 'AVISOS',
                        titulo:   'Sem comunicados disponíveis',
                        texto:    'Não há comunicados no momento. Aguarde novas informações da administração.',
                        data:     ''
                    });
                }

                showSlide(0);
                startSlideTimer();

                /* Fade-in do body */
                body.style.opacity = '1';

                concluir();
            },

            /* erro / sem dados */
            function () {
                clearTimeout(watchdog);
                body.style.opacity = '1';
                concluir();
            }
        );
    });
};
