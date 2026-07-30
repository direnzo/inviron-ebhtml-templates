/**
 * master.js — Hora Certa
 * 3 donuts CSS + ondas Perlin + EBHTML
 * ES5 compatível (Android 7+ WebKit legado)
 */

var CLOCK_CONFIG = {
    displayDuration: 10000, // tempo em ms que o relógio fica visível antes de sumir (0 = sempre visível)
    sponsorEnabled: false, // se true, ativa o suporte a D_SPD (patrocinador) e pré-roll
    climateEnabled: false, // se true, ativa o suporte a D_CLIMA (clima) e ícones Meteocons
    wavesEnabled: true, // se true, mantém as ondas de background ativas independentemente do hardware
    forceReducedMode: false, // se true, força modo de performance reduzida (desliga ondas e fundo animado)
    lowPerformanceTickMs: 250, // intervalo de atualização do relógio em ms quando em modo reduzido (normal = 100ms)
    
    sponsorRandomTest: false, // se true, alterna sponsor true/false a cada load (teste)
    climateRandomTest: false, // se true, ativa teste aleatório de clima (para desenvolvimento sem D_CLIMA)

    colorTheme: 3, // índice da paleta em COLOR_PALETTES (0–9), ou -1 para aleatório a cada load

    /*
    colorTheme: -1,   // aleatório a cada load (comportamento anterior)
    colorTheme: 0,    // Âmbar/floresta
    colorTheme: 1,    // Azul/céu
    colorTheme: 2,    // Roxo
    colorTheme: 3,    // Laranja/dourado
    colorTheme: 4,    // Verde/menta
    colorTheme: 5,    // Azul/petróleo
    colorTheme: 6,    // Vermelho
    colorTheme: 7,    // Dourado/quente
    colorTheme: 8,    // Índigo
    colorTheme: 9,    // Verde/natureza
    */
    
    // 5 cores principais — resto é derivado por opacidade
    colors: {
        neutral: '#d5e0fb',   // base de texto
        background: '#030d1e',  // fundo sólido (fallback)
        primary: '#7aa2f2',    // verde claro (horas)
        secondary: '#5b109d',  // verde escuro (minutos / ondas / gradiente fundo)
        accent: '#c645ec',     // verde vibrante (segundos)

    },
    texts: {
        weekdays: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
        months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    }
};
var tickHandle = null; // handle do setInterval do relógio
var rafHandle = null; // handle do requestAnimationFrame do relógio
var clockStarted = false; // se o relógio já foi iniciado
var randomPaletteApplied = false; // se a paleta de cores aleatória já foi aplicada
var CLIMATE_TEST_STATE_KEY = 'hora_certa_climate_test_last'; // localStorage key para teste aleatório de clima
var SPD_MEDIA_ROTATION_KEY = 'hora_certa_spd_media_idx'; // localStorage key para rotação de mídia do patrocinador
var SPONSOR_TEST_STATE_KEY = 'hora_certa_sponsor_test_last'; // localStorage key para teste aleatório de patrocinador
var performanceChecked = false; // se já foi verificado se o dispositivo é fraco
var performanceReduced = false; // se o modo de performance reduzida está ativo

var COLOR_PALETTES = [
    { text: '#fbf3e6', background: '#201605', primary: '#eccd8f', secondary: '#288b18', accent: '#2edb5d' },
    { text: '#dae9f1', background: '#050e13', primary: '#84c3e7', secondary: '#115e8c', accent: '#2fabf4' },
    { text: '#e9e0f3', background: '#07040c', primary: '#bd94e8', secondary: '#541598', accent: '#933bf1' },
    { text: '#f5efe6', background: '#1a1108', primary: '#f0c987', secondary: '#9a5f16', accent: '#f59e2f' },
    { text: '#e8f6ee', background: '#07150f', primary: '#8fd9b6', secondary: '#0f7a4a', accent: '#2de08a' },
    { text: '#e8f3f8', background: '#071118', primary: '#8ec6df', secondary: '#1d5f84', accent: '#36aef0' },
    { text: '#f2e9e9', background: '#180a0a', primary: '#df9b9b', secondary: '#8a2c2c', accent: '#f05151' },
    { text: '#f4f0e8', background: '#151109', primary: '#dcbf86', secondary: '#7a6329', accent: '#c89a2a' },
    { text: '#ececf6', background: '#0b0b17', primary: '#9da0dd', secondary: '#3e4294', accent: '#636bf5' },
    { text: '#eef4ef', background: '#0a130b', primary: '#a2d8a8', secondary: '#2f7d39', accent: '#54d069' }
];

function loadScriptOnce(src, done) {
    var scripts = document.getElementsByTagName('script');
    var i = 0;
    for (i = 0; i < scripts.length; i++) {
        var current = scripts[i].getAttribute('src') || '';
        if (current === src || current.indexOf('/' + src) !== -1) {
            done();
            return;
        }
    }

    var s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.onload = function() { done(); };
    s.onerror = function() {
        console.log('[Wave] Falha ao carregar ' + src + '. Seguindo sem ondas.');
        done();
    };
    (document.head || document.body || document.documentElement).appendChild(s);
}

function bootstrapWaveDependencies(done) {
    if (!CLOCK_CONFIG.wavesEnabled) {
        done();
        return;
    }

    loadScriptOnce('js/perlin.js', function() {
        loadScriptOnce('js/wave-effect.js', function() {
            done();
        });
    });
}

// Funções utilitárias
function applyRandomPalette() {
    if (randomPaletteApplied) { return; }
    randomPaletteApplied = true;

    if (!COLOR_PALETTES || COLOR_PALETTES.length === 0) { return; }

    var fixedTheme = parseInt(CLOCK_CONFIG.colorTheme, 10);
    var idx;
    if (!isNaN(fixedTheme) && fixedTheme >= 0 && fixedTheme < COLOR_PALETTES.length) {
        idx = fixedTheme;
    } else {
        idx = Math.floor(Math.random() * COLOR_PALETTES.length);
    }
    var palette = COLOR_PALETTES[idx] || COLOR_PALETTES[0];
    if (!palette) { return; }

    CLOCK_CONFIG.colors.neutral = palette.text || CLOCK_CONFIG.colors.neutral;
    CLOCK_CONFIG.colors.background = palette.background || CLOCK_CONFIG.colors.background;
    CLOCK_CONFIG.colors.primary = palette.primary || CLOCK_CONFIG.colors.primary;
    CLOCK_CONFIG.colors.secondary = palette.secondary || CLOCK_CONFIG.colors.secondary;
    CLOCK_CONFIG.colors.accent = palette.accent || CLOCK_CONFIG.colors.accent;
}

function addClassName(el, className) {
    if (!el || !className) { return; }
    var current = el.className || '';
    if ((' ' + current + ' ').indexOf(' ' + className + ' ') !== -1) { return; }
    el.className = (current ? current + ' ' : '') + className;
}

function removeClassName(el, className) {
    if (!el || !className) { return; }
    var current = ' ' + (el.className || '') + ' ';
    var next = current.replace(new RegExp(' ' + className + ' ', 'g'), ' ');
    el.className = next.replace(/^\s+|\s+$/g, '');
}

function detectWeakDevice() {
    var ua = (navigator.userAgent || '').toLowerCase();
    var isAndroid = ua.indexOf('android') !== -1;
    var androidVersion = 999;
    var m = ua.match(/android\s([0-9]+)(?:\.([0-9]+))?/);

    if (m && m[1]) {
        androidVersion = parseInt(m[1], 10);
        if (isNaN(androidVersion)) { androidVersion = 999; }
    }

    var isOldAndroid = isAndroid && androidVersion <= 8;
    var lowCpu = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4;
    var lowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory > 0 && navigator.deviceMemory <= 2;

    return isOldAndroid || lowCpu || lowMemory;
}

function isWeakDevice() {
    if (!performanceChecked) {
        performanceReduced = detectWeakDevice();
        performanceChecked = true;
    }
    return performanceReduced;
}

function applyPerformanceMode() {
    var reduced = CLOCK_CONFIG.forceReducedMode ? true : isWeakDevice();
    var htmlEl = document.documentElement;
    var bodyEl = document.body;
    var waveContainer = document.getElementById('waveContainer');

    if (reduced) {
        addClassName(htmlEl, 'reduced');
        addClassName(bodyEl, 'reduced');

        if (bodyEl) {
            bodyEl.style.animation = 'none';
            bodyEl.style.backgroundImage = 'none';
        }

        if (CLOCK_CONFIG.forceReducedMode) {
            console.log('[Perf] Modo reduzido FORCADO por config: ondas e fundo animado desligados');
        } else {
            console.log('[Perf] Modo reduzido ativado: ondas e fundo animado desligados');
        }
    } else {
        removeClassName(htmlEl, 'reduced');
        removeClassName(bodyEl, 'reduced');
    }

    // Ondas seguem flag dedicada, independente da detecção de hardware.
    if (waveContainer) {
        waveContainer.style.display = CLOCK_CONFIG.wavesEnabled ? 'block' : 'none';
    }

    return reduced;
}

/* Converte #hex em "r, g, b" para usar em rgba() */
function hexToRgb(hex) {
    var h = (hex || '').replace('#', '');
    if (h.length !== 6) { return '255, 255, 255'; }
    var r = parseInt(h.substring(0, 2), 16);
    var g = parseInt(h.substring(2, 4), 16);
    var b = parseInt(h.substring(4, 6), 16);
    return r + ', ' + g + ', ' + b;
}

function normalizeHexColor(value) {
    var raw = (value || '').toString().replace(/\s+/g, '');
    if (!raw) { return ''; }
    if (raw.charAt(0) !== '#') { raw = '#' + raw; }
    if (!/^#[0-9a-fA-F]{6}$/.test(raw)) { return ''; }
    return raw;
}

function getItemFieldValue(item, fieldName) {
    if (!item || !fieldName || typeof item.value !== 'function') { return ''; }

    try {
        var node = item.value(fieldName);
        if (node && typeof node.value !== 'undefined' && node.value !== null) {
            return (node.value + '').trim();
        }
    } catch (e1) {}

    try {
        var nodeLower = item.value(fieldName.toLowerCase());
        if (nodeLower && typeof nodeLower.value !== 'undefined' && nodeLower.value !== null) {
            return (nodeLower.value + '').trim();
        }
    } catch (e2) {}

    return '';
}

function getListCount(list) {
    if (!list) { return 0; }
    if (typeof list.count === 'function') { return list.count(); }
    if (typeof list.length === 'number') { return list.length; }
    return 0;
}

function getListItem(list, index) {
    if (!list) { return null; }
    if (typeof list.get === 'function') { return list.get(index); }
    if (typeof list[index] !== 'undefined') { return list[index]; }
    return null;
}

function findSpdSponsor(loader) {
    if (!loader) { return null; }

    var list = null;
    if (typeof loader.datalist === 'function') {
        list = loader.datalist('D_SPD');
    }

    var count = getListCount(list);
    var i = 0;
    var item = null;
    var cfg = '';

    for (i = 0; i < count; i++) {
        item = getListItem(list, i);
        if (!item) { continue; }

        cfg = getItemFieldValue(item, 'CONFIG');
        if (!cfg) { cfg = getItemFieldValue(item, 'config'); }
        if (cfg === '1') { return item; }
    }

    if (count === 1) {
        item = getListItem(list, 0);
        if (item) {
            cfg = getItemFieldValue(item, 'CONFIG');
            if (!cfg) { cfg = getItemFieldValue(item, 'config'); }
            if (!cfg) { return item; }
        }
    }

    if (typeof loader.data === 'function') {
        item = loader.data('D_SPD');
        if (item) {
            cfg = getItemFieldValue(item, 'CONFIG');
            if (!cfg) { cfg = getItemFieldValue(item, 'config'); }
            if (!cfg || cfg === '1') { return item; }
        }
    }

    return null;
}

function parseSpdPayload(loader) {
    var sponsor = findSpdSponsor(loader);
    if (!sponsor) { return null; }

    var color1 = normalizeHexColor(getItemFieldValue(sponsor, 'COLOR1'));
    var color2 = normalizeHexColor(getItemFieldValue(sponsor, 'COLOR2'));
    var color3 = normalizeHexColor(getItemFieldValue(sponsor, 'COLOR3'));
    var color4 = normalizeHexColor(getItemFieldValue(sponsor, 'COLOR4'));
    var color5 = normalizeHexColor(getItemFieldValue(sponsor, 'COLOR5'));
    var timeoutText = getItemFieldValue(sponsor, 'TEXT2');
    var timeoutSec = parseInt(timeoutText, 10);

    var mediaUrl = '';
    var mediaCandidates = [];
    var mediaFields = ['FILE_IMAGE1', 'FILE_IMAGE2', 'FILE_IMAGE3', 'FILE_IMAGE4', 'FILE_IMAGE5'];
    var i = 0;
    for (i = 0; i < mediaFields.length; i++) {
        var rawMedia = getItemFieldValue(sponsor, mediaFields[i]);
        if (!rawMedia) { continue; }

        var normalizedMedia = normalizeMediaUrl(rawMedia);
        if (!normalizedMedia) { continue; }

        mediaCandidates.push(normalizedMedia);
        if (!mediaUrl) { mediaUrl = normalizedMedia; }
    }

    return {
        text1: getItemFieldValue(sponsor, 'TEXT1'),
        imageLogo: getItemFieldValue(sponsor, 'IMAGE_LOGO'),
        mediaUrl: mediaUrl,
        mediaCandidates: mediaCandidates,
        color1: color1,
        color2: color2,
        color3: color3,
        color4: color4,
        color5: color5,
        timeoutMs: (!isNaN(timeoutSec) && timeoutSec > 0) ? timeoutSec * 1000 : 5000
    };
}

function applySpdColors(spd) {
    if (!spd) { return; }

    if (spd.color1) { CLOCK_CONFIG.colors.neutral = spd.color1; }
    if (spd.color2) { CLOCK_CONFIG.colors.background = spd.color2; }
    if (spd.color3) { CLOCK_CONFIG.colors.primary = spd.color3; }
    if (spd.color4) { CLOCK_CONFIG.colors.secondary = spd.color4; }
    if (spd.color5) { CLOCK_CONFIG.colors.accent = spd.color5; }
}

function applySpdHeader(spd) {
    var header = document.getElementById('spdHeader');
    var logoEl = document.getElementById('spdLogo');
    var textEl = document.getElementById('spdText');

    if (!header || !logoEl || !textEl) { return; }

    var hasLogo = !!(spd && spd.imageLogo);
    var hasText = !!(spd && spd.text1);

    if (!hasLogo && !hasText) {
        header.style.display = 'none';
        logoEl.style.display = 'none';
        logoEl.src = '';
        textEl.style.display = 'none';
        textEl.textContent = '';
        return;
    }

    if (hasLogo) {
        logoEl.src = normalizeMediaUrl(spd.imageLogo);
        logoEl.style.display = 'block';
    } else {
        logoEl.style.display = 'none';
        logoEl.src = '';
    }

    if (hasText) {
        textEl.textContent = spd.text1;
        textEl.style.display = 'block';
    } else {
        textEl.textContent = '';
        textEl.style.display = 'none';
    }

    header.style.display = '-webkit-box';
    header.style.display = '-ms-flexbox';
    header.style.display = 'flex';
}

function normalizeMediaUrl(url) {
    var src = (url || '').toString().trim();
    if (!src) { return ''; }

    if (src.indexOf('file:///') === 0 || src.indexOf('file://') === 0) {
        var normalizedPath = src.replace(/\\/g, '/');
        var parts = normalizedPath.split('/');
        var fileName = parts[parts.length - 1] || '';
        var matchFileId = fileName.match(/^f_(\d+)\./i);

        if (matchFileId && matchFileId[1]) {
            return 'http://127.0.0.1:13199/FILES/' + matchFileId[1];
        }

        if (fileName) {
            return 'http://127.0.0.1:13199/FILES/' + fileName;
        }

        return '';
    }

    return src;
}

function isVideoFile(url) {
    return /\.(mp4|webm|mov|m4v|avi|ogv)(\?|#|$)/i.test((url || '').toString());
}

function isImageFile(url) {
    return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/i.test((url || '').toString());
}

function getSpdMediaList(spd) {
    var list = [];
    var seen = {};
    var i = 0;

    if (spd && spd.mediaCandidates && spd.mediaCandidates.length) {
        for (i = 0; i < spd.mediaCandidates.length; i++) {
            var candidate = normalizeMediaUrl(spd.mediaCandidates[i]);
            if (!candidate || seen[candidate]) { continue; }
            seen[candidate] = true;
            list.push(candidate);
        }
    }

    if (!list.length && spd && spd.mediaUrl) {
        var fallback = normalizeMediaUrl(spd.mediaUrl);
        if (fallback && !seen[fallback]) {
            list.push(fallback);
        }
    }

    return list;
}

function pickSpdMediaByRotation(spd) {
    var list = getSpdMediaList(spd);
    var count = list.length;
    var index = 0;

    if (!count) {
        return { list: [], startIndex: 0, firstUrl: '' };
    }

    try {
        index = parseInt(localStorage.getItem(SPD_MEDIA_ROTATION_KEY), 10);
    } catch (e) {
        index = 0;
    }

    if (isNaN(index) || index < 0) { index = 0; }
    index = index % count;

    try {
        localStorage.setItem(SPD_MEDIA_ROTATION_KEY, (index + 1) % count);
    } catch (e2) {}

    return {
        list: list,
        startIndex: index,
        firstUrl: list[index]
    };
}

function showSpdPreroll(spd, onDone) {
    if (!spd || (!spd.mediaUrl && !(spd.mediaCandidates && spd.mediaCandidates.length))) {
        if (typeof onDone === 'function') { onDone(); }
        return;
    }

    var wrapper = document.getElementById('spdPreroll');
    var imageEl = document.getElementById('spdPrerollImage');
    var videoEl = document.getElementById('spdPrerollVideo');
    if (!wrapper || !imageEl || !videoEl) {
        if (typeof onDone === 'function') { onDone(); }
        return;
    }

    var timeoutMs = spd.timeoutMs || 5000;
    var done = false;
    var timeoutHandle = null;
    var watchdogHandle = null;
    var selection = pickSpdMediaByRotation(spd);
    var mediaList = selection.list || [];
    var currentIndex = typeof selection.startIndex === 'number' ? selection.startIndex : 0;
    var attempts = 0;
    var bodyEl = document.body;

    if (bodyEl) {
        removeClassName(bodyEl, 'template-fade-in');
        addClassName(bodyEl, 'visible');
        bodyEl.style.setProperty('opacity', '1', 'important');
    }

    wrapper.style.position = 'fixed';
    wrapper.style.top = '0';
    wrapper.style.left = '0';
    wrapper.style.right = '0';
    wrapper.style.bottom = '0';
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.zIndex = '999999';
    wrapper.style.background = '#000';

    imageEl.style.width = '100%';
    imageEl.style.height = '100%';
    imageEl.style.objectFit = 'contain';
    imageEl.style.background = '#000';

    videoEl.style.width = '100%';
    videoEl.style.height = '100%';
    videoEl.style.objectFit = 'contain';
    videoEl.style.background = '#000';

    function finish() {
        if (done) { return; }
        done = true;

        if (timeoutHandle) {
            clearTimeout(timeoutHandle);
            timeoutHandle = null;
        }

        if (watchdogHandle) {
            clearInterval(watchdogHandle);
            watchdogHandle = null;
        }

        wrapper.style.display = 'none';

        imageEl.onload = null;
        imageEl.onerror = null;
        imageEl.style.display = 'none';
        imageEl.src = '';

        videoEl.onended = null;
        videoEl.onerror = null;
        videoEl.onabort = null;
        videoEl.onstalled = null;
        videoEl.pause();
        videoEl.style.display = 'none';
        videoEl.removeAttribute('src');

        if (bodyEl) {
            bodyEl.style.removeProperty('opacity');
        }

        if (typeof onDone === 'function') { onDone(); }
    }

    timeoutHandle = setTimeout(finish, timeoutMs);
    wrapper.style.display = '-webkit-box';
    wrapper.style.display = '-ms-flexbox';
    wrapper.style.display = 'flex';

    function showImage(src) {
        videoEl.style.display = 'none';
        videoEl.pause();
        videoEl.removeAttribute('src');
        imageEl.style.display = 'block';
        imageEl.src = src;
        imageEl.onerror = tryNextMedia;
        imageEl.onload = function() {};
    }

    function showVideo(src) {
        videoEl.style.display = 'block';
        videoEl.crossOrigin = 'anonymous';
        videoEl.muted = true;
        videoEl.loop = false;
        videoEl.autoplay = true;
        videoEl.setAttribute('playsinline', 'playsinline');
        videoEl.setAttribute('webkit-playsinline', 'webkit-playsinline');
        videoEl.setAttribute('preload', 'auto');
        videoEl.src = src;
        videoEl.onended = finish;
        videoEl.onerror = function() {
            showImage(src);
        };
        videoEl.onabort = tryNextMedia;
        videoEl.onstalled = function() {
            showImage(src);
        };

        function tryPlay() {
            try {
                var playResult = videoEl.play();
                if (playResult && typeof playResult.catch === 'function') {
                    playResult.catch(function() {});
                }
            } catch (e) {}
        }

        if (watchdogHandle) {
            clearInterval(watchdogHandle);
            watchdogHandle = null;
        }

        watchdogHandle = setInterval(function() {
            if (done) {
                clearInterval(watchdogHandle);
                watchdogHandle = null;
                return;
            }
            if (videoEl.ended) {
                clearInterval(watchdogHandle);
                watchdogHandle = null;
                finish();
            }
        }, 500);

        try {
            videoEl.load();
            tryPlay();
            setTimeout(tryPlay, 200);
            setTimeout(tryPlay, 800);
        } catch (e) {}
    }

    function playCurrentMedia() {
        if (!mediaList.length) {
            finish();
            return;
        }

        var src = mediaList[currentIndex];
        if (!src) {
            tryNextMedia();
            return;
        }

        attempts = attempts + 1;
        var preferImage = isImageFile(src);

        if (preferImage) {
            showImage(src);
        } else {
            showVideo(src);
        }
    }

    function tryNextMedia() {
        if (done) { return; }
        if (!mediaList.length) {
            finish();
            return;
        }
        if (attempts >= mediaList.length) {
            finish();
            return;
        }

        currentIndex = (currentIndex + 1) % mediaList.length;
        playCurrentMedia();
    }

    playCurrentMedia();
}

/* Deriva tudo das cores principais */
function applyTheme() {
    var c = CLOCK_CONFIG.colors || {};
    var primary = c.primary || '#8cdaaf';
    var secondary = c.secondary || '#199851';
    var accent = c.accent || '#10f675';
    var neutral = c.neutral || '#ecefee';
    var background = c.background || '#0b1510';
    var pRgb = hexToRgb(primary);
    var sRgb = hexToRgb(secondary);
    var aRgb = hexToRgb(accent);
    var nRgb = hexToRgb(neutral);
    var bRgb = hexToRgb(background);
    var root = document.documentElement.style;

    root.setProperty('--primary', primary);
    root.setProperty('--secondary', secondary);
    root.setProperty('--accent', accent);
    root.setProperty('--neutral', neutral);
    root.setProperty('--background', background);

    // Texto derivado do neutral
    root.setProperty('--text', 'rgba(' + nRgb + ', 0.92)');
    root.setProperty('--time-text', '#ffffff');
    root.setProperty('--time-glow', 'rgba(' + pRgb + ', 0.35)');

    // Fundo: gradiente radial animado de background -> secondary
    root.setProperty('--bg-from', background);
    root.setProperty('--bg-to', secondary);

    // Anéis: segundos=accent, minutos=secondary, horas=primary
    root.setProperty('--ring-s-color', accent);
    root.setProperty('--ring-m-color', secondary);
    root.setProperty('--ring-h-color', primary);
    root.setProperty('--ring-track', 'rgba(255, 255, 255, 0.08)');
    root.setProperty('--ring-s-glow', 'rgba(' + aRgb + ', 0.4)');
    root.setProperty('--ring-m-glow', 'rgba(' + sRgb + ', 0.3)');
    root.setProperty('--ring-h-glow', 'rgba(' + pRgb + ', 0.35)');

    // Núcleo e overlay derivados do background
    root.setProperty('--core-hi', 'rgba(' + pRgb + ', 0.14)');
    root.setProperty('--core-lo', 'rgba(' + bRgb + ', 0.95)');
    root.setProperty('--overlay-top', 'rgba(' + bRgb + ', 0.2)');
    root.setProperty('--overlay-bottom', 'rgba(' + bRgb + ', 0.6)');
    root.setProperty('--ring-soft-shadow', 'rgba(255, 255, 255, 0.06)');
    root.setProperty('--core-inset-shadow', 'rgba(255, 255, 255, 0.12)');
    root.setProperty('--core-drop-shadow', 'rgba(0, 0, 0, 0.4)');
    root.setProperty('--fallback-ring', 'rgba(255, 255, 255, 0.12)');
}

function padZero(n) {
    return n < 10 ? '0' + n : '' + n;
}

function setRingValue(id, progress) {
    var el = document.getElementById(id);
    if (!el) { return; }

    if (progress < 0) { progress = 0; }
    if (progress > 1) { progress = 1; }

    el.style.setProperty('--value', (progress * 360) + 'deg');
}

function formatDate(now) {
    var t = CLOCK_CONFIG.texts || {};
    var weekdays = t.weekdays || [];
    var months = t.months || [];
    return {
        weekday: weekdays[now.getDay()] || '',
        fullDate: now.getDate() + ' de ' + (months[now.getMonth()] || '') + ' de ' + now.getFullYear()
    };
}

function updateClock() {
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var s = now.getSeconds();
    var ms = isWeakDevice() ? 0 : now.getMilliseconds();

    /* Progresso contínuo com milissegundos — animação linear suave */
    var pS = (s + ms / 1000) / 60;
    var pM = (m + (s + ms / 1000) / 60) / 60;
    var pH = ((h % 12) + m / 60 + (s + ms / 1000) / 3600) / 12;

    var timeEl = document.getElementById('timeDisplay');
    var weekdayEl = document.getElementById('dateWeekday');
    var dayMonthEl = document.getElementById('dateDayMonth');
    var dateFmt = formatDate(now);

    if (timeEl) {
        timeEl.textContent = padZero(h) + ':' + padZero(m);
    }
    if (weekdayEl) {
        weekdayEl.textContent = dateFmt.weekday;
    }
    if (dayMonthEl) {
        dayMonthEl.textContent = dateFmt.fullDate;
    }

    setRingValue('ringS', pS);
    setRingValue('ringM', pM);
    setRingValue('ringH', pH);
}

function clearClockLoop() {
    if (rafHandle) {
        cancelAnimationFrame(rafHandle);
        rafHandle = null;
    }
    if (tickHandle) {
        clearTimeout(tickHandle);
        tickHandle = null;
    }
}

/* Loop adaptativo: forte = requestAnimationFrame, fraco = setTimeout */
function tick() {
    updateClock();
    if (isWeakDevice()) {
        tickHandle = setTimeout(tick, CLOCK_CONFIG.lowPerformanceTickMs || 250);
    } else {
        rafHandle = requestAnimationFrame(tick);
    }
}

function initWaves() {
    if (!CLOCK_CONFIG.wavesEnabled) { return; }
    var container = document.getElementById('waveContainer');
    if (!container || typeof initWaveEffect !== 'function') { return; }
    var c = CLOCK_CONFIG.colors || {};
    initWaveEffect(container, {
        topMargin: 0,
        bottomMargin: 120,
        waveSpacing: 12,
        color: hexToRgb(c.secondary || '#199851'),
        alphaBase: 0.22,
        alphaRange: 0.18,
        amplitudeBase: 60,
        speed: 3500
    });
}

function startClockFlow() {
    if (clockStarted) { return; }
    clockStarted = true;
    applyRandomPalette();
    applyTheme();
    if (!applyPerformanceMode()) {
        initWaves();
        console.log('[Perf] Loop do relógio: requestAnimationFrame');
    } else {
        console.log('[Perf] Loop do relógio: setTimeout ' + (CLOCK_CONFIG.lowPerformanceTickMs || 250) + 'ms');
    }
    clearClockLoop();
    updateClock();
    tick();
    setTimeout(function() {
        document.body.className += ' visible';
    }, 90);
}

function initWithEbhtml() {
    if (typeof ebhtml === 'undefined' || !ebhtml || typeof ebhtml.create2 !== 'function') {
        startClockFlow();
        return;
    }

    ebhtml.create2({}, function(loader) {
        var sponsorEnabled = !!CLOCK_CONFIG.sponsorEnabled;
        var climateEnabled = !!CLOCK_CONFIG.climateEnabled;

        if (CLOCK_CONFIG.sponsorRandomTest) {
            var sponsorRandomChoice = Math.random() >= 0.5;
            var sponsorNextState = sponsorRandomChoice ? '1' : '0';
            var sponsorLastState = '';

            try {
                sponsorLastState = localStorage.getItem(SPONSOR_TEST_STATE_KEY) || '';
            } catch (es0) {
                sponsorLastState = '';
            }

            // Evita repetição contínua no teste: se sorteou igual ao último, inverte.
            if (sponsorLastState === sponsorNextState) {
                sponsorNextState = sponsorNextState === '1' ? '0' : '1';
            }

            try {
                localStorage.setItem(SPONSOR_TEST_STATE_KEY, sponsorNextState);
            } catch (es1) {}

            sponsorEnabled = sponsorNextState === '1';
            console.log('[Sponsor][Teste] sponsorRandomTest ativo -> sponsorEnabled=' + (sponsorEnabled ? 'true' : 'false'));
        }

        if (CLOCK_CONFIG.climateRandomTest) {
            var randomChoice = Math.random() >= 0.5;
            var nextState = randomChoice ? '1' : '0';
            var lastState = '';

            try {
                lastState = localStorage.getItem(CLIMATE_TEST_STATE_KEY) || '';
            } catch (e0) {
                lastState = '';
            }

            // Evita repetição contínua no teste: se sorteou igual ao último, inverte.
            if (lastState === nextState) {
                nextState = nextState === '1' ? '0' : '1';
            }

            try {
                localStorage.setItem(CLIMATE_TEST_STATE_KEY, nextState);
            } catch (e1) {}

            climateEnabled = nextState === '1';
            console.log('[Clima][Teste] climateRandomTest ativo -> climateEnabled=' + (climateEnabled ? 'true' : 'false'));
        }

        loader.nodataiserror = false;
        loader.autoloaded = false;
        if (climateEnabled) {
            loader.addData('D_CLIMA_CLIMATEMPO_MOMENTO', false, '', '');
        }
        if (sponsorEnabled) {
            loader.addData('D_SPD', false, 'f_CONFIG=1', '');
        }

        loader.load(function() {
            var spd = null;

            if (sponsorEnabled) {
                spd = parseSpdPayload(loader);

                if (spd) {
                    applySpdColors(spd);
                    applySpdHeader(spd);
                } else {
                    applySpdHeader(null);
                }
            } else {
                applySpdHeader(null);
            }

            loader.loaded();
            
            function finalizeFlow() {
                startClockFlow();
                if (climateEnabled) {
                    loadWeather(loader);
                } else {
                    hideWeatherUI();
                }

                // Regra A: displayDuration conta apenas o tempo do relógio.
                // O tempo do pré-roll/sponsor não é descontado desse valor.
                var remaining = parseInt(CLOCK_CONFIG.displayDuration, 10);
                if (isNaN(remaining)) { remaining = 10000; }

                // 0 = sempre visível (não finaliza playlist por tempo)
                if (remaining === 0) {
                    return;
                }

                if (remaining < 0) { remaining = 1000; }
                if (remaining > 0 && remaining < 1000) { remaining = 1000; }

                setTimeout(function() {
                    loader.finished();
                }, remaining);
            }

            if (sponsorEnabled) {
                showSpdPreroll(spd, finalizeFlow);
            } else {
                finalizeFlow();
            }
        });
    });
}

function hideWeatherUI() {
    var cityEl = document.getElementById('cityName');
    var rowEl = document.getElementById('weatherRow');
    var footerEl = document.getElementById('climatempoFooter');

    if (cityEl) {
        cityEl.style.display = 'none';
        cityEl.textContent = '';
    }
    if (rowEl) {
        rowEl.style.display = 'none';
    }
    if (footerEl) {
        footerEl.style.display = 'none';
    }
}

/* Carrega dados de clima do canal D_CLIMA_CLIMATEMPO_MOMENTO */
function loadWeather(loader) {
    if (!loader || typeof loader.data !== 'function') { return; }

    /* Tenta buscar os dados diretamente do loader.
       Se não houver dados (canal desativado), item será null. */
    var item = loader.data('D_CLIMA_CLIMATEMPO_MOMENTO');
    if (!item) {
        console.log('[Clima] Canal D_CLIMA_CLIMATEMPO_MOMENTO sem dados — linha de clima oculta');
        return;
    }

    console.log('[Clima] Canal D_CLIMA_CLIMATEMPO_MOMENTO com dados, renderizando...');
    renderWeather(loader, item);
}

function renderWeather(loader, item) {

    /* Valida se o item tem dados reais (não cache vazio) */
    var iconCode = '';
    var temp = '';
    var humidity = '';
    var windVel = '';
    var cidade = '';

    try {
        iconCode = (item.value('C1_TEXTPT').value || '').toString();
        temp = item.value('C1_MAX').value || '';
        humidity = item.value('C1_HUMIDITYMIN').value || '';
        windVel = item.value('C1_WINDAVGVELOCITY').value || '';
        cidade = item.value('C1_CIDADE').value || '';
    } catch (e) {
        return;
    }

    /* Se todos os campos estiverem vazios, o canal não tem dados válidos */
    if (!temp && !humidity && !windVel && !cidade && !iconCode) { return; }

    /* Validação extra: temp deve ser numérico ou vazio */
    if (temp && isNaN(parseInt(temp, 10))) { temp = ''; }
    if (humidity && isNaN(parseInt(humidity, 10))) { humidity = ''; }
    if (windVel && isNaN(parseInt(windVel, 10))) { windVel = ''; }

    /* Se após validação não sobrou nada, não mostra */
    if (!temp && !humidity && !windVel) { return; }

    var row = document.getElementById('weatherRow');
    if (!row) { return; }

    /* Cidade */
    var cidadeEl = document.getElementById('cityName');
    if (cidadeEl && cidade) {
        cidadeEl.textContent = cidade;
        cidadeEl.style.display = 'block';
    }

    /* Cor dos ícones = accent do tema */
    var corIcone = (CLOCK_CONFIG.colors && CLOCK_CONFIG.colors.accent) || '#c645ec';

    /* Temperatura + ícone */
    var tempEl = document.getElementById('weatherTemp');
    if (tempEl) { tempEl.textContent = (temp || '--') + '°C'; }
    var tempIconEl = document.getElementById('weatherTempIcon');
    if (tempIconEl && iconCode && typeof injetarMeteocon === 'function') {
        var nomeIcone = typeof climaToMeteocon === 'function'
            ? climaToMeteocon(iconCode)
            : 'cloudy';
        injetarMeteocon(tempIconEl, nomeIcone, corIcone);
    }

    /* Umidade + ícone */
    var humEl = document.getElementById('weatherHumidity');
    if (humEl) { humEl.textContent = (humidity || '--') + '%'; }
    var humIconEl = document.getElementById('weatherHumidityIcon');
    if (humIconEl && typeof injetarMeteocon === 'function') {
        injetarMeteocon(humIconEl, 'humidity', corIcone);
    }

    /* Vento + ícone */
    var windEl = document.getElementById('weatherWind');
    if (windEl) { windEl.textContent = (windVel || '--') + 'km/h'; }
    var windIconEl = document.getElementById('weatherWindIcon');
    if (windIconEl && typeof injetarMeteocon === 'function') {
        var nomeVento = typeof ventoVelocidadeParaIcone === 'function'
            ? ventoVelocidadeParaIcone(windVel)
            : 'wind';
        injetarMeteocon(windIconEl, nomeVento, corIcone);
    }

    row.style.display = 'flex';

    /* Mostra logo Climatempo no rodapé */
    var footer = document.getElementById('climatempoFooter');
    if (footer) { footer.style.display = 'block'; }
}

window.onload = function() {
    bootstrapWaveDependencies(function() {
        initWithEbhtml();
    });
};
