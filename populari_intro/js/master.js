/* ============================================================
   Populari (video primeiro) - master.js  (ES5 / Chromium 78)
   Dataset: D_POPULARI
   Campos:  TEXTO (texto da noticia)  |  FOTO (url da imagem)

   Variante da ordem invertida: o video entra PRIMEIRO (abertura),
   em tela cheia, e so quando ele termina a noticia (foto + texto)
   e revelada e fica no ar por DURATION_MS.
   ============================================================ */

var DURATION_MS = 10000;          // tempo de exibicao da noticia DEPOIS do video
var IMAGE_TIMEOUT_MS = 6000;      // watchdog de carregamento da imagem
var VIDEO_TIMEOUT_MS = 20000;     // watchdog: se 'ended' nunca disparar
var VIDEO_MUTED_FALLBACK = true;  // se o play com som for bloqueado, tenta mudo
var DATA_NAME = 'D_POPULARI';

// Video de abertura: WEBM/VP9, um arquivo por formato.
// VP9 roda em todo build Chromium (inclusive os "puros", sem codec H.264/AAC)
// e o arquivo e bem mais leve que o MP4 equivalente.
var VIDEO_LANDSCAPE = './img/OUTRO_VINHETA_POPULARI_1366X768.webm';
var VIDEO_PORTRAIT = './img/OUTRO_VINHETA_POPULARI_1080x1920.webm';

/* escolhe o arquivo de video conforme a proporcao da tela */
function escolherVinheta() {
    var ar = (window.innerWidth || 1) / (window.innerHeight || 1);
    return ar < 1 ? VIDEO_PORTRAIT : VIDEO_LANDSCAPE;
}

/* atributos que destravam autoplay/inline em WebView legado (Android 7+, Chromium 78) */
function prepararVinhetaEl(video) {
    if (!video) { return; }
    try { video.playsInline = true; } catch (e) {}
    video.setAttribute('playsinline', 'playsinline');
    video.setAttribute('webkit-playsinline', 'webkit-playsinline');
    video.setAttribute('x5-playsinline', 'x5-playsinline');
    video.setAttribute('preload', 'auto');
}

/* forca o elemento a ficar mudo (property + attribute) - unico modo confiavel
   de autoplay em engines com politica de midia */
function silenciarVinheta(video) {
    if (!video) { return; }
    try { video.muted = true; } catch (e) {}
    try { video.defaultMuted = true; } catch (e) {}
    video.setAttribute('muted', 'muted');
    try { video.volume = 0; } catch (e) {}
}

function sanitizeText(text) {
    return ('' + (text || '')).replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
}

/* le um campo do item tentando variacoes de nome (maiusc/minusc) */
function lerCampo(item, nomes) {
    var i, node;
    if (!item) { return ''; }
    for (i = 0; i < nomes.length; i++) {
        try {
            node = item.value(nomes[i]);
        } catch (e) {
            node = null;
        }
        if (node && node.value !== undefined && node.value !== null && ('' + node.value) !== '') {
            return '' + node.value;
        }
    }
    return '';
}

/* reduz a fonte do texto ate caber no bloco (mesma ideia do uol_responsivo_tw) */
function ajustarTexto(textEl, wrapEl, minPx) {
    var maxH, fontSize;
    minPx = minPx || 12;
    if (!textEl || !wrapEl) { return; }
    maxH = wrapEl.clientHeight;
    if (!maxH) { return; }
    fontSize = parseInt(window.getComputedStyle(textEl).fontSize, 10) || 40;
    var guard = 0;
    while (textEl.scrollHeight > maxH && fontSize > minPx && guard < 200) {
        fontSize -= 1;
        textEl.style.fontSize = fontSize + 'px';
        guard++;
    }
}

window.onload = function () {

    var body = document.querySelector('body');
    var fotoImg = document.getElementById('foto-img');
    var textoEl = document.getElementById('texto');
    var textoWrap = document.getElementById('texto-wrap');
    var videoEl = document.getElementById('vinheta');

    var originalText = '';

    // pre-carrega o video do formato atual (arquivo direto de img/) para nao haver corte
    if (videoEl) {
        prepararVinhetaEl(videoEl);
        videoEl.setAttribute('src', escolherVinheta());
        try { videoEl.load(); } catch (e) {}
    }

    function render(dados) {
        originalText = sanitizeText(dados.texto);
        textoEl.innerHTML = originalText;
        ajustarTexto(textoEl, textoWrap, 12);
    }

    /* revela a noticia (foto + texto) e a mantem no ar por DURATION_MS,
       so entao finaliza o item da playlist */
    function revelarNoticia(loader) {
        if (videoEl) { videoEl.className = ''; }
        body.classList.add('news-in');
        ajustarTexto(textoEl, textoWrap, 12);
        setTimeout(function () {
            loader.finished();
        }, DURATION_MS);
    }

    /* toca o video de abertura do formato atual e so entao revela a noticia.
         1. play() com som
         2. se a politica de autoplay bloquear -> play() mudo
         3. watchdog / onerror -> revelarNoticia() garantido, a playlist nao trava */
    function reproduzirVinheta(loader) {
        var done = false;
        var wd = null;
        var src = escolherVinheta();
        var mudoTentado = false;

        function finalizar() {
            if (done) { return; }
            done = true;
            if (wd) { clearTimeout(wd); }
            revelarNoticia(loader);
        }

        function armarWatchdog(ms) {
            if (wd) { clearTimeout(wd); }
            wd = setTimeout(finalizar, ms);
        }

        if (!videoEl) {
            finalizar();
            return;
        }

        prepararVinhetaEl(videoEl);

        videoEl.onended = finalizar;

        // engines legados as vezes nao disparam 'ended': encerra perto do fim
        videoEl.ontimeupdate = function () {
            var d = videoEl.duration;
            if (d && isFinite(d) && d > 0 && videoEl.currentTime >= d - 0.2) {
                finalizar();
            }
        };

        // ajusta o watchdog para a duracao real do video, quando disponivel
        videoEl.onloadedmetadata = function () {
            var d = videoEl.duration;
            if (d && isFinite(d) && d > 0) {
                armarWatchdog((d * 1000) + 2000);
            }
        };

        videoEl.onerror = function () {
            if (VIDEO_MUTED_FALLBACK && !mudoTentado) {
                aoFalharPlay();
                return;
            }
            finalizar();
        };

        function aoFalharPlay() {
            // unico retry: mudo (mesmo arquivo)
            if (VIDEO_MUTED_FALLBACK && !mudoTentado) {
                mudoTentado = true;
                silenciarVinheta(videoEl);
                try { videoEl.load(); } catch (e) {}
                iniciarPlay();
                return;
            }
            finalizar();
        }

        function iniciarPlay() {
            videoEl.setAttribute('autoplay', 'autoplay');
            var p;
            try {
                p = videoEl.play();
            } catch (e) {
                aoFalharPlay();
                return;
            }
            // Chromium moderno devolve Promise; WebView legado devolve undefined
            // (nesse caso o sucesso vem pela reproducao e a falha pelo watchdog/onerror)
            if (p && typeof p.then === 'function') {
                p.then(function () {}, function () { aoFalharPlay(); });
            }
        }

        if (videoEl.getAttribute('src') !== src) {
            videoEl.setAttribute('src', src);
            try { videoEl.load(); } catch (e) {}
        }
        videoEl.className = 'is-playing';
        armarWatchdog(VIDEO_TIMEOUT_MS);
        iniciarPlay();
    }

    function carregarImagem(url, loader) {
        var settled = false;
        var watchdog = null;

        function concluir() {
            if (settled) { return; }
            settled = true;
            if (watchdog) { clearTimeout(watchdog); }
            // corpo visivel (o video de abertura e filho do body e precisa aparecer);
            // a noticia so entra depois, via revelarNoticia()
            body.classList.add('is-ready');
            loader.loaded();
            reproduzirVinheta(loader);
        }

        if (!url || !fotoImg) {
            concluir();
            return;
        }

        fotoImg.onload = concluir;
        fotoImg.onerror = concluir;
        watchdog = setTimeout(concluir, IMAGE_TIMEOUT_MS);
        fotoImg.src = url;
    }

    window.onresize = function () {
        ajustarTexto(textoEl, textoWrap, 12);
        // mantem o video pre-carregado coerente com o formato (antes de tocar)
        if (videoEl && videoEl.className !== 'is-playing' &&
            videoEl.getAttribute('src') !== escolherVinheta()) {
            videoEl.setAttribute('src', escolherVinheta());
            try { videoEl.load(); } catch (e) {}
        }
    };

    /* ---- modo mock (desenvolvimento) ---- */
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = {
            loaded: function () { if (window.console) { console.log('[Mock] loaded'); } },
            finished: function () { if (window.console) { console.log('[Mock] finished'); } }
        };
        render(MOCK_DATA.dados);
        carregarImagem(MOCK_DATA.dados.foto, mockLoader);
        return;
    }

    /* ---- runtime EdgeContents ---- */
    ebhtml.create2({}, function (loader) {

        loader.addData(DATA_NAME);
        loader.nodataiserror = false;
        loader.autoloaded = false;

        function liberarSemDados() {
            body.classList.add('is-ready');
            loader.loaded();
            loader.finished();
        }

        loader.load(function () {
            var item = loader.data(DATA_NAME);

            if (!item) {
                liberarSemDados();
                return;
            }

            var dados = {
                texto: lerCampo(item, ['TEXTO', 'texto', 'Texto']),
                foto: lerCampo(item, ['FOTO', 'foto', 'Foto', 'IMAGEM', 'imagem'])
            };

            render(dados);
            carregarImagem(dados.foto, loader);
        }, liberarSemDados);
    });
};
