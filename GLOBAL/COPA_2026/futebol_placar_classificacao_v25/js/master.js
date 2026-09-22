/**
 * master.js — Ponto de entrada do futebol_placar_classificacao_v25
 * ES5 obrigatorio
 *
 * Gerencia a rotacao entre 3 modos de exibicao:
 *   PLACAR     → jogo ao vivo / resultado
 *   CONFRONTOS → cards didaticos (1 chave por vez)
 *   BRACKET    → chaveamento completo
 */

/* ====================================================
   CONFIG — 3 cores primarias do template
   ==================================================== */
var CONFIG = {
    corDestaque: '#FBBF24',
    corEscura:   '#006400',
    corClara:    '#FFFFFF'
};
var DURACAO_TOTAL = 10000;
var INTRO_MAX_MS  = 5000;

/* ====================================================
   3 MODOS DE EXIBICAO — rotacao a cada reload
   ==================================================== */
var MODOS = [
    { id: 'placar',     nome: 'Jogo ao Vivo / Resultado' },
    { id: 'confrontos', nome: 'Confrontos 2a Fase' },
    { id: 'bracket',    nome: 'Chaveamento Completo' }
];
var LS_KEY_MODO = 'futebol_v25_modo_idx';

function lerModoAtual() {
    var idx = 0;
    try { idx = parseInt(localStorage.getItem(LS_KEY_MODO), 10); } catch (e) {}
    if (isNaN(idx) || idx >= MODOS.length) { idx = 0; }
    return { idx: idx, modo: MODOS[idx] };
}

function avancarModo() {
    var atual = lerModoAtual();
    var proximo = (atual.idx + 1) % MODOS.length;
    try { localStorage.setItem(LS_KEY_MODO, proximo); } catch (e) {}
}

/* ====================================================
   HELPERS GLOBAIS
   ==================================================== */

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
    s.setProperty('--cor-texto-ter',     hexToRgba(cfg.corClara,    0.98));
    s.setProperty('--cor-grad-from',     hexToRgba(cfg.corEscura,   0.90));
    s.setProperty('--cor-grad-mid',      hexToRgba(cfg.corEscura,   0.90));
    s.setProperty('--cor-grad-to',       hexToRgba(cfg.corEscura,   0.80));
}

function mergeColorsFromSpd(defaults, spd) {
    if (!spd) { return defaults; }
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

function obterValorSpd(spd, campo) {
    return obterValor(spd, campo);
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

/**
 * Busca um item numa datalist pelo valor do campo TITULO.
 */
function buscarItemPorTitulo(datalist, titulo) {
    if (!datalist || !titulo) { return null; }
    for (var i = 0; i < datalist.count(); i++) {
        var item = datalist.get(i);
        var t = obterValor(item, 'TITULO').trim();
        if (t === String(titulo).trim()) {
            return item;
        }
    }
    return null;
}

/**
 * Busca sponsor (CONFIG=1) dentro de uma datalist D_SPD.
 */
function buscarSponsor(datalist) {
    if (!datalist) { return null; }
    for (var i = 0; i < datalist.count(); i++) {
        var item = datalist.get(i);
        if (obterValor(item, 'CONFIG') === '1') {
            return item;
        }
    }
    return null;
}

/**
 * Busca sponsor por SPECIALPROJECT dentro de datalist D_SPD.
 */
function buscarSponsorPorSP(datalist, specialProject) {
    if (!datalist || !specialProject) { return null; }
    for (var i = 0; i < datalist.count(); i++) {
        var item = datalist.get(i);
        if (obterValor(item, 'CONFIG') === '1' &&
            obterValor(item, 'SPECIALPROJECT') === specialProject) {
            return item;
        }
    }
    return null;
}

/* ====================================================
   MIDIA — normalizacao de URL, video detection, intro
   ==================================================== */
var CONTENT_FILES_HOST = (window.location.protocol === 'https:' ? 'https:' : 'http:') + '//127.0.0.1:13199';

function normalizarUrlMidia(url) {
    if (!url) { return url; }
    url = url.trim();
    if (url.indexOf('file:///') === 0 || url.indexOf('file://') === 0) {
        var partes = url.replace(/\\/g, '/').split('/');
        var nomeArquivo = partes[partes.length - 1];
        var mId = nomeArquivo.match(/^f_(\d+)\./);
        if (mId) {
            return CONTENT_FILES_HOST + '/FILES/' + mId[1];
        }
        return CONTENT_FILES_HOST + '/FILES/' + nomeArquivo;
    }
    return url;
}

function isUrlVideo(url) {
    if (!url) { return false; }
    return /\.(mp4|webm|mov|avi|ogv|ogg)(\?.*)?$/i.test(url.trim());
}

/* ====================================================
   INTRO — exibe imagem ou video fullscreen
   ==================================================== */
function mostrarIntro(url, maxMs, onDone) {
    var introEl = document.querySelector('#introScreen');
    if (!introEl) { onDone(); return; }

    introEl.style.position = 'fixed';
    introEl.style.top = '0';
    introEl.style.left = '0';
    introEl.style.width = '100%';
    introEl.style.height = '100%';
    introEl.style.zIndex = '999999';
    introEl.style.background = 'black';

    var isVideo = isUrlVideo(url);
    url = normalizarUrlMidia(url);

    if (isVideo) {
        try {
            var tempVid = document.createElement('video');
            var canPlayMp4 = tempVid.canPlayType && tempVid.canPlayType('video/mp4') !== '';
            if (!canPlayMp4) { isVideo = false; }
        } catch (e) { isVideo = false; }
    }

    introEl.innerHTML = '';
    introEl.classList.add('active');
    introEl.classList.remove('hidden');

    var done = false;
    function finish() {
        if (done) return;
        done = true;
        onDone();
    }

    var timer = setTimeout(function() { finish(); }, maxMs);

    if (isVideo) {
        var vid = document.createElement('video');
        vid.className = 'w-full h-full object-cover';
        vid.setAttribute('playsinline', 'true');
        vid.setAttribute('webkit-playsinline', 'true');
        vid.muted = true;
        vid.autoplay = true;
        vid.loop = false;
        vid.preload = 'auto';
        introEl.appendChild(vid);

        function safeFinish(reason) {
            clearTimeout(timer);
            finish();
        }

        vid.addEventListener('ended', function() { safeFinish('ended'); });
        vid.addEventListener('error', function() { safeFinish('error'); });
        vid.addEventListener('abort', function() { safeFinish('abort'); });

        var watchdog = setInterval(function() {
            if (vid.ended) { clearInterval(watchdog); safeFinish('watchdog-ended'); }
        }, 500);

        function tryPlay() {
            try {
                var p = vid.play();
                if (p && typeof p.then === 'function') {
                    p.then(function() {}, function() {});
                }
            } catch (e) {}
        }

        vid.src = url;
        try { vid.load(); } catch (e) {}
        tryPlay();
        setTimeout(tryPlay, 200);
        setTimeout(tryPlay, 800);
    } else {
        var img = document.createElement('img');
        img.className = 'w-full h-full object-cover';
        img.onload = function() { clearTimeout(timer); setTimeout(finish, maxMs); };
        img.onerror = function() { clearTimeout(timer); finish(); };
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

/* ====================================================
   SVG ESCUDO (fallback)
   ==================================================== */
var SVG_ESCUDO = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100%" height="100%">',
    '<path d="M50 8 L90 22 L90 65 Q90 100 50 114 Q10 100 10 65 L10 22 Z"',
    ' fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.25)" stroke-width="2.5"/>',
    '<path d="M50 22 L74 30 L74 62 Q74 85 50 96 Q26 85 26 62 L26 30 Z"',
    ' fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>',
    '</svg>'
].join('');

/* ====================================================
   FALLBACK DE VIDEO
   ==================================================== */
function aplicarFallbackVideo(bgVideoEl) {
    if (!bgVideoEl) return;
    bgVideoEl.style.display = 'none';
    bgVideoEl.classList.remove('opacity-0', 'opacity-100');
    var fallbackImg = document.querySelector('#bgFallback');
    if (!fallbackImg) {
        fallbackImg = document.createElement('img');
        fallbackImg.id = 'bgFallback';
        fallbackImg.src = 'img/bg.png';
        fallbackImg.className = 'absolute inset-0 z-0 w-full h-full object-cover';
        bgVideoEl.parentNode.insertBefore(fallbackImg, bgVideoEl.nextSibling);
    } else {
        fallbackImg.style.display = 'block';
    }
    var gradEl = document.querySelector('#gradientOverlay');
    if (gradEl) { gradEl.style.opacity = '0.80'; }
}

function supportsMp4(videoEl) {
    try {
        return !!(videoEl && videoEl.canPlayType && videoEl.canPlayType('video/mp4') !== '');
    } catch (e) { return false; }
}

/* ====================================================
   ENTRADA — modo player (producao)
   ==================================================== */
var _playerViewExecutando = false;

function playerView() {
    if (_playerViewExecutando) {
        console.log('[v25] playerView ja executando — ignorando');
        return;
    }
    _playerViewExecutando = true;

    aplicarCores(CONFIG);

    // Carga unificada: 1 unico loader com 3 datasets
    ebhtml.create2({}, function(loader) {
        // Carrega D_SPD sem filtro de config para incluir CONFIG=1 (sponsor)
        // O filtro por TYPE e data e feito em iniciarPlacar()
        loader.addData('D_SPD',            false, 'amount=0');
        loader.addData('D_FOOTBALL',       false, 'amount=0');
        loader.addData('D_FOOTBALL_TEAMS', false, 'amount=0');
        loader.autoloaded    = false;
        loader.nodataiserror = false;

        loader.load(function() {
            var atual = lerModoAtual();
            console.log('[v25] Modo: ' + atual.modo.id + ' (' + (atual.idx + 1) + '/' + MODOS.length + ')');

            // Carrega standings via XHR (assincrono, cache global)
            carregarStandingsXHR(function() {
                if (atual.modo.id === 'placar') {
                    iniciarPlacar(loader);
                } else if (atual.modo.id === 'confrontos') {
                    iniciarConfrontos(loader);
                } else if (atual.modo.id === 'bracket') {
                    iniciarBracket(loader);
                }
            });

            avancarModo();
        });
    });
}

// ENTRADA — o inline script no index.html chama playerView()
// Nao sobrescrever window.onload aqui para evitar dupla chamada