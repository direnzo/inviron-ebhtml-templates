/**
 * COMUNICADO v2 - EdgeContents Digital Signage
 * Dataset unico: D_COMUNICADO. Conteudo em TITULO / TEXTO / FOTO; toda a configuracao
 * visual vem consolidada como JSON no campo TEXTO10. ES5 puro.
 * O layout e escolhido pelo que existir: titulo, descricao e/ou foto.
 */

var LOAD_TIMEOUT = 8000;
var MEDIA_TIMEOUT = 8000;

// Campos lidos do canal. TEXTO10 = JSON de configuracao visual (contrato completo no README).
// TEXT10 e aceito como alias.
var CAMPOS = ['TITULO', 'TEXTO', 'FOTO', 'TEXTO10', 'TEXT10'];

var ui = null;
var photoToken = 0;
var currentState = { t: '', d: '', hasPhoto: false, visual: null };
var resizeTimer = null;

function getUi() {
    if (!ui) {
        ui = {
            root: document.getElementById('root'),
            stage: document.getElementById('stage'),
            title: document.getElementById('title'),
            titleWrap: document.getElementById('titlewrap'),
            desc: document.getElementById('desc'),
            descWrap: document.getElementById('descwrap'),
            rule: document.getElementById('rule'),
            textbox: document.getElementById('textbox'),
            inner: document.getElementById('inner'),
            media: document.getElementById('media'),
            photo: document.getElementById('photo'),
            bgimg: document.getElementById('bgimg')
        };
    }
    return ui;
}

// ---------------------------------------------------------------------------
// Leitura e validacao dos campos (qualquer valor invalido cai no padrao do CONFIG)
// ---------------------------------------------------------------------------
function trim(s) { return String(s === undefined || s === null ? '' : s).replace(/^\s+|\s+$/g, ''); }

function fieldValue(data, name) {
    var f = data.value(name);
    return f && f.value ? trim(f.value) : '';
}

function readRecord(data) {
    var rec = {};
    var i;
    for (i = 0; i < CAMPOS.length; i++) { rec[CAMPOS[i]] = fieldValue(data, CAMPOS[i]); }
    return rec;
}

function pBool(v, def) {
    var s = trim(v).toLowerCase();
    if (s === 'true' || s === '1' || s === 's' || s === 'sim' || s === 'on' || s === 'yes') { return true; }
    if (s === 'false' || s === '0' || s === 'n' || s === 'nao' || s === 'não' || s === 'off' || s === 'no') { return false; }
    return def;
}

function pColor(v, def) {
    var s = trim(v);
    if (/^#[0-9a-fA-F]{6}$/.test(s)) { return s.toLowerCase(); }
    if (/^#[0-9a-fA-F]{3}$/.test(s)) { return ('#' + s.charAt(1) + s.charAt(1) + s.charAt(2) + s.charAt(2) + s.charAt(3) + s.charAt(3)).toLowerCase(); }
    return def;
}

function pNum(v, def, min, max) {
    var n = parseFloat(trim(v).replace(',', '.'));
    if (isNaN(n)) { return def; }
    return n < min ? min : (n > max ? max : n);
}

function pBgType(v, def) {
    var s = trim(v).toLowerCase();
    if (s === 'chapado' || s === 'solid' || s === 'solido' || s === 'sólido') { return 'solid'; }
    if (s === 'gradiente' || s === 'gradient') { return 'gradient'; }
    return def;
}

// TEXTO10 -> objeto de configuracao. Aceita string JSON (tambem escapada como &quot;) ou objeto.
// JSON ausente, quebrado ou que nao seja objeto => {} (todos os padroes do CONFIG).
function parseConfig(raw) {
    var s, obj;
    if (raw && typeof raw === 'object') { return raw; }
    s = trim(raw);
    if (!s) { return {}; }
    try {
        obj = JSON.parse(s);
    } catch (e1) {
        try {
            obj = JSON.parse(s.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/[“”]/g, '"'));
        } catch (e2) {
            if (CONFIG.debug && window.console) { console.log('[Comunicado] TEXTO10 com JSON invalido; usando padroes'); }
            return {};
        }
    }
    return (obj && typeof obj === 'object' && !(obj instanceof Array)) ? obj : {};
}

// c = objeto de TEXTO10 com chaves planas (BG_TIPO, TITULO_CAIXA, ...). Chave ausente/invalida => padrao.
function buildVisual(c) {
    var d = CONFIG.visual;
    return {
        bg: {
            type: pBgType(c.BG_TIPO, d.bg.type),
            color: pColor(c.BG_COR, d.bg.color),
            from: pColor(c.BG_COR_DE, d.bg.from),
            to: pColor(c.BG_COR_PARA, d.bg.to),
            angle: pNum(c.BG_ANGULO, d.bg.angle, 0, 360),
            glow: pBool(c.BG_BRILHO, d.bg.glow)
        },
        accent: pColor(c.COR_DESTAQUE, d.accent),
        line: pBool(c.FILETE, d.line),
        title: {
            color: pColor(c.TITULO_COR, d.title.color),
            box: pBool(c.TITULO_CAIXA, d.title.box),
            boxColor: pColor(c.TITULO_CAIXA_COR, d.title.boxColor),
            boxOpacity: pNum(c.TITULO_CAIXA_OPACIDADE, d.title.boxOpacity, 0, 100),
            radius: pNum(c.TITULO_CAIXA_RAIO, d.title.radius, 0, 100)
        },
        desc: {
            color: pColor(c.DESC_COR, d.desc.color),
            box: pBool(c.DESC_CAIXA, d.desc.box),
            boxColor: pColor(c.DESC_CAIXA_COR, d.desc.boxColor),
            boxOpacity: pNum(c.DESC_CAIXA_OPACIDADE, d.desc.boxOpacity, 0, 100),
            radius: pNum(c.DESC_CAIXA_RAIO, d.desc.radius, 0, 100)
        }
    };
}

function buildDuration(c) {
    var t = CONFIG.timing;
    var s = pNum(c.DURACAO, 0, 0, 100000);
    if (s <= 0) { return t.duration; }
    return Math.round((s < t.minSeconds ? t.minSeconds : (s > t.maxSeconds ? t.maxSeconds : s)) * 1000);
}

// ---------------------------------------------------------------------------
// Texto rico (TEXTO vem em HTML do editor da extranet): whitelist em documento inerte
// ---------------------------------------------------------------------------
var TAGS_OK = { P: 1, BR: 1, STRONG: 1, B: 1, EM: 1, I: 1, U: 1, S: 1, SPAN: 1, UL: 1, OL: 1, LI: 1, H1: 1, H2: 1, H3: 1, BLOCKQUOTE: 1, SUB: 1, SUP: 1 };
var TAGS_DROP = { SCRIPT: 1, STYLE: 1, IFRAME: 1, OBJECT: 1, EMBED: 1, LINK: 1, META: 1, FORM: 1, SVG: 1, IMG: 1, VIDEO: 1, AUDIO: 1 };

function cleanNode(node) {
    var kids = [];
    var i, k, el, a;
    for (i = 0; i < node.childNodes.length; i++) { kids.push(node.childNodes[i]); }
    for (i = 0; i < kids.length; i++) {
        k = kids[i];
        if (k.nodeType !== 1) { continue; }
        if (TAGS_DROP[k.nodeName]) { node.removeChild(k); continue; }
        cleanNode(k);
        if (!TAGS_OK[k.nodeName]) {
            while (k.firstChild) { node.insertBefore(k.firstChild, k); }
            node.removeChild(k);
            continue;
        }
        for (a = k.attributes.length - 1; a >= 0; a--) {
            el = k.attributes[a].name;
            if (el !== 'class' && el !== 'style') { k.removeAttribute(el); }
        }
    }
}

function sanitizeHtml(html) {
    var doc = document.implementation.createHTMLDocument('');
    doc.body.innerHTML = html;
    cleanNode(doc.body);
    return doc.body.innerHTML;
}

function plainText(html) {
    return String(html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
}

// ---------------------------------------------------------------------------
// Layout: o modo vem do que existe (titulo / descricao / foto)
// ---------------------------------------------------------------------------
function modeOf(hasT, hasD, hasI) {
    if (hasT && hasD && hasI) { return 'm-all'; }
    if (hasT && hasD) { return 'm-title-desc'; }
    if (hasT && hasI) { return 'm-title-image'; }
    if (hasD && hasI) { return 'm-desc-image'; }
    if (hasT) { return 'm-title'; }
    if (hasD) { return 'm-desc'; }
    if (hasI) { return 'm-image'; }
    return 'm-empty';
}

function updateClasses() {
    var u = getUi();
    var v = currentState.visual;
    var hasT = !!plainText(currentState.t);
    var hasD = !!plainText(currentState.d);
    var c = modeOf(hasT, hasD, currentState.hasPhoto);
    if (v.title.box && hasT) { c += ' tbox'; }
    if (v.desc.box && hasD) { c += ' dbox'; }
    if (!v.bg.glow) { c += ' noglow'; }
    if (!v.line) { c += ' noline'; }
    u.root.className = c;
    u.titleWrap.className = hasT ? '' : 'is-hidden';
    u.descWrap.className = hasD ? '' : 'is-hidden';
    u.rule.className = (hasT && hasD) ? 'rule' : 'rule is-hidden';
}

// reduz o bloco de texto ate caber (busca binaria limitada, 8 medicoes)
function fitText() {
    var u = getUi();
    var cs, avail, lo, hi, k, mid;
    if (!plainText(currentState.t + currentState.d)) { return; }
    cs = window.getComputedStyle(u.textbox);
    avail = u.textbox.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    lo = 0.3; hi = 1;
    u.inner.style.fontSize = '1em';
    if (u.inner.offsetHeight <= avail) { return; }
    for (k = 0; k < 8; k++) {
        mid = (lo + hi) / 2;
        u.inner.style.fontSize = mid + 'em';
        if (u.inner.offsetHeight <= avail) { lo = mid; } else { hi = mid; }
    }
    u.inner.style.fontSize = lo + 'em';
}

// foto sozinha: preenche a tela se a proporcao for parecida; senao inteira sobre fundo desfocado
function fitPhoto() {
    var u = getUi();
    var w = u.photo.naturalWidth;
    var h = u.photo.naturalHeight;
    var diff;
    if (!w || !h) { return; }
    diff = Math.abs((w / h) / (window.innerWidth / window.innerHeight) - 1);
    u.media.className = (u.root.className.indexOf('m-image') === 0 && diff > 0.12) ? 'contain' : '';
}

function loadPhoto(url, cb) {
    var u = getUi();
    var token = ++photoToken;
    var settled = false;
    var watchdog;
    function settle(ok) {
        if (settled || token !== photoToken) { return; }
        settled = true;
        clearTimeout(watchdog);
        u.photo.onload = null;
        u.photo.onerror = null;
        cb(ok);
    }
    if (!url) { cb(false); return; }
    watchdog = setTimeout(function () { settle(false); }, MEDIA_TIMEOUT);
    u.photo.onload = function () { settle(true); };     // handlers SEMPRE antes do src
    u.photo.onerror = function () { settle(false); };
    u.photo.removeAttribute('src');
    u.photo.src = url;
}

// Renderiza um registro ja normalizado. done(temConteudo) roda quando a foto resolveu.
function renderView(view, done) {
    var u = getUi();
    currentState.t = view.t;
    currentState.d = view.d;
    currentState.visual = view.visual;
    u.title.textContent = view.t;
    u.desc.innerHTML = sanitizeHtml(view.d);
    aplicarConfigVisual(view.visual);

    loadPhoto(view.i, function (ok) {
        currentState.hasPhoto = ok;
        if (ok) { u.bgimg.src = view.i; }
        u.textbox.style.display = '';
        updateClasses();
        fitPhoto();
        fitText();
        u.stage.className = 'ready';
        if (done) { done(ok || !!plainText(view.t + view.d)); }
    });
}

function buildView(rec) {
    var cfg = parseConfig(rec.TEXTO10 || rec.TEXT10);
    return { t: trim(rec.TITULO), d: trim(rec.TEXTO), i: trim(rec.FOTO), visual: buildVisual(cfg), duration: buildDuration(cfg) };
}

// Ponto de entrada para teste/preview: renderiza um registro cru (TITULO, TEXTO, FOTO, TEXTO10)
window.comunicadoRender = function (rec) {
    renderView(buildView(rec), null);
};

window.onresize = function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
        if (currentState.visual) { fitPhoto(); fitText(); }
    }, 150);
};

window.onload = function () {
    ebhtml.create2({}, function (loader) {
        var finished = false;
        var loaded = false;
        var loadWatchdog = null;
        var finishTimer = null;

        function log(msg) { if (CONFIG.debug && window.console) { console.log('[Comunicado] ' + msg); } }
        function finish(reason) {
            if (finished) { return; }
            finished = true;
            clearTimeout(loadWatchdog);
            clearTimeout(finishTimer);
            log('finished: ' + reason);
            loader.finished();
        }
        // loaded() SEMPRE antes de finished(): encerrar sem loaded() conta como "play error" no ebclient
        function complete(ms) {
            if (finished || loaded) { return; }
            loaded = true;
            loader.loaded();
            finishTimer = setTimeout(function () { finish('duracao concluida'); }, ms);
            log('loaded, duracao ' + ms + 'ms');
        }
        // Sem dados validos (canal vazio, erro, timeout, excecao): pula quase invisivel.
        // Nada e desenhado (stage oculto); loaded() e finished() em sequencia evitam o "play error".
        function completeEmpty(reason) {
            if (finished || loaded) { return; }
            clearTimeout(loadWatchdog);
            log('sem dados, pulando: ' + reason);
            try { getUi().stage.style.display = 'none'; } catch (e) { }
            loaded = true;
            loader.loaded();
            finishTimer = setTimeout(function () { finish('sem dados: ' + reason); }, CONFIG.empty.delay);
        }

        loader.addData(CONFIG.dataset.name, false);   // nao obrigatorio: dataset vazio chega ao callback de sucesso
        loader.nodataiserror = false;                 // true + obrigatorio faria o ebhtml chamar error() => "play error"
        loader.autoloaded = false;
        loadWatchdog = setTimeout(function () { completeEmpty('timeout do loader'); }, LOAD_TIMEOUT);

        loader.load(function () {
            if (finished || loaded) { return; }
            clearTimeout(loadWatchdog);
            try {
                var data = loader.data(CONFIG.dataset.name);
                var view;
                if (!data) { completeEmpty('dataset vazio'); return; }
                view = buildView(readRecord(data));
                if (!view.t && !plainText(view.d) && !view.i) { completeEmpty('sem conteudo'); return; }
                renderView(view, function (hasContent) {
                    try {
                        if (finished || loaded) { return; }
                        if (!hasContent) { completeEmpty('foto indisponivel e sem texto'); return; }
                        complete(view.duration);
                    } catch (e2) {
                        completeEmpty('excecao no render: ' + (e2 && e2.message ? e2.message : e2));
                    }
                });
            } catch (error) {
                completeEmpty('excecao: ' + (error && error.message ? error.message : error));
            }
        }, function () {
            completeEmpty('falha no load');
        });
    });
};
