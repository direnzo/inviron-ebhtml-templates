const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createCycle, readField, readCompleteText } = require('../GLOBAL/populari_noticias_10s/js/master.js');
const config = require('../GLOBAL/populari_noticias_10s/js/config.js');

test('visual validation profile follows the shared runner schema', () => {
    const { readProfile } = require('./validate-display-formats');
    assert.doesNotThrow(() => readProfile(path.join(__dirname, 'populari-noticias-10s.profile.json')));
});

function fixture(onPhase) {
    let now = 0;
    let nextId = 0;
    const pending = new Map();
    const events = [];
    const clock = {
        now: () => now,
        setTimeout(action, delay) {
            const handle = ++nextId;
            pending.set(handle, { action, at: now + delay });
            return handle;
        },
        clearTimeout: handle => pending.delete(handle)
    };
    const cycle = createCycle({
        loaded: () => events.push(['loaded', now]),
        finished: () => events.push(['finished', now])
    }, config.timing, clock, name => {
        events.push([name, now]);
        if (onPhase) onPhase(name);
    });
    return { cycle, events, advance(target) {
        while (true) {
            const next = [...pending].filter(([, timer]) => timer.at <= target)
                .sort((left, right) => left[1].at - right[1].at)[0];
            if (!next) break;
            now = next[1].at;
            pending.delete(next[0]);
            next[1].action();
        }
        now = target;
    } };
}

test('10 seconds include intro, news and outro; never add 10 seconds after intro', () => {
    const { cycle, events, advance } = fixture();
    cycle.start();
    advance(799);
    assert.deepEqual(events, [['intro', 0], ['loaded', 0]]);
    advance(800);
    assert.deepEqual(events.at(-1), ['news', 800]);
    advance(8800);
    assert.deepEqual(events.at(-1), ['text-out', 8800]);
    advance(9200);
    assert.deepEqual(events.at(-1), ['outro', 9200]);
    advance(9650);
    assert.deepEqual(events.at(-1), ['fade-out', 9650]);
    advance(9999);
    assert.equal(cycle.ended(), false);
    advance(10000);
    assert.deepEqual(events.at(-1), ['finished', 10000]);
    cycle.start();
    cycle.skip();
    advance(30000);
    assert.equal(events.filter(([name]) => name === 'loaded').length, 1);
    assert.equal(events.filter(([name]) => name === 'finished').length, 1);
});

test('empty/error/timeout finalizes once, loaded before finished, with no news', () => {
    const { cycle, events, advance } = fixture();
    cycle.skip();
    cycle.skip();
    cycle.start();
    advance(30000);
    assert.deepEqual(events, [['empty', 0], ['loaded', 0], ['finished', 0]]);
});

test('phase exception releases the playlist and cancels future phases', () => {
    const { cycle, events, advance } = fixture(name => {
        if (name === 'news') throw new Error('render failure');
    });
    cycle.start();
    advance(30000);
    assert.deepEqual(events.slice(-3), [['news', 800], ['empty', 800], ['finished', 800]]);
    assert.equal(events.filter(([name]) => name === 'loaded').length, 1);
});

test('start is idempotent and keeps its original deadline', () => {
    const { cycle, events, advance } = fixture();
    cycle.start();
    advance(4000);
    cycle.start();
    advance(10000);
    assert.deepEqual(events.at(-1), ['finished', 10000]);
});

test('dataset aliases preserve content and missing values stay empty', () => {
    const item = { value: name => ({ value: name === 'IMAGEM' ? '/photo.jpg' : '' }) };
    assert.equal(readField(item, config.dataset.imageFields), '/photo.jpg');
    assert.equal(readField(null, config.dataset.textFields), '');
    assert.equal(readField(item, config.dataset.textFields), '');
});

test('full text takes priority over an upstream excerpt ending in ellipsis', () => {
    const item = { value: name => ({ value: { TEXTO: 'Resumo cortado\u2026', TEXTOCOMPLETO: 'Noticia completa, sem nenhum corte.' }[name] || '' }) };
    assert.equal(readCompleteText(item, config.dataset), 'Noticia completa, sem nenhum corte.');
});

test('official wordmark has a local viewBox and no active or external SVG content', () => {
    const svg = fs.readFileSync(path.join(__dirname, '../GLOBAL/populari_noticias_10s/img/logo-dark.svg'), 'utf8');
    assert.match(svg, /viewBox="0 0 205 41"/);
    assert.doesNotMatch(svg, /<(?:script|foreignObject|image|use)\b|\son\w+\s*=|\b(?:href|xlink:href)\s*=/i);
    const html = fs.readFileSync(path.join(__dirname, '../GLOBAL/populari_noticias_10s/index.html'), 'utf8');
    assert.doesNotMatch(html, /<img[^>]+\.svg/i);
});

for (const value of ['Cortado\u2026', 'Cortado...', 'Cortado. . .', 'Cortado&hellip;', 'Cortado&#8230;', 'Cortado&#x2026;']) {
    test(`preserves upstream ellipsis and displays the full 10s cycle: ${value}`, () => {
        assert.equal(readCompleteText({ value: name => ({ value: name === 'TEXTO' ? value : '' }) }, config.dataset), value);
        const app = runtime({ text: value, cached: true });
        app.success();
        assert.equal(app.window.document.body.className, 'populari-body phase-intro');
        app.advance(30000);
        assert.deepEqual(app.events, [['loaded', 0], ['finished', 10000]]);
        assert.equal(app.elements.texto.textContent, value);
    });
}

test('preserves long complete text and ordinary sentence punctuation', () => {
    const value = 'Frase completa. Outra frase sem corte. '.repeat(30).trim();
    assert.equal(readCompleteText({ value: name => ({ value: name === 'TEXTO' ? value : '' }) }, config.dataset), value);
});

function runtime(options = {}) {
    let now = 0;
    let nextId = 0;
    let success;
    let failure;
    let logoRequest;
    let source = '';
    const pending = new Map();
    const events = [];
    const elements = {};
    for (const id of ['stage', 'foto', 'foto-img', 'texto', 'texto-wrap', 'moldura', 'moldura-base', 'logo', 'brand', 'brand-logo', 'noticia']) {
        elements[id] = {
            style: {}, textContent: '', attributes: {}, complete: !!options.cached,
            naturalWidth: options.cached ? 300 : 0,
            setAttribute(name, value) { this.attributes[name] = value; },
            appendChild(node) { this.child = node; },
            getBoundingClientRect: () => ({ left: 0, top: 0, right: 700, bottom: 200, width: 700, height: 200 })
        };
    }
    Object.defineProperty(elements['foto-img'], 'src', {
        get: () => source,
        set(value) {
            assert.equal(typeof this.onload, 'function');
            assert.equal(typeof this.onerror, 'function');
            source = value;
        }
    });
    const item = options.empty ? null : { value(name) {
        if (options.malformed) throw new Error('invalid data');
        return { value: name === 'TEXTO' ? (options.text === undefined ? 'Noticia <b>literal</b>' : options.text)
            : name === 'FOTO' ? (options.photo === undefined ? '/photo.jpg' : options.photo) : '' };
    } };
    const loader = {
        addData(name, required) {
            assert.equal(name, 'D_POPULARI');
            assert.equal(required, false);
        },
        data: () => item,
        loaded: () => events.push(['loaded', now]),
        finished: () => events.push(['finished', now]),
        load(onSuccess, onFailure) { success = onSuccess; failure = onFailure; }
    };
    const window = {
        CONFIG: config,
        innerWidth: 864, innerHeight: 432,
        console: { warn() {} },
        document: {
            ...(options.fontLoading ? { fonts: { status: 'loading' } } : {}),
            body: { style: {}, className: '' },
            getElementById: id => elements[id],
            importNode: node => ({ ...node, setAttribute() {} }),
            createRange: () => ({ selectNodeContents() {}, getBoundingClientRect: () => ({
                left: 0, top: options.glyphOverflow ? -0.5 : 3, right: 300, bottom: 83, width: 300, height: 80
            }) })
        },
        XMLHttpRequest: class {
            constructor() { logoRequest = this; this.readyState = 0; }
            open(method, url) { assert.equal(url, config.assets.brandLogo); }
            send() {
                if (!options.logoLoading && !options.logoTimeout) this.complete();
            }
            abort() { this.aborted = true; }
            complete() {
                this.readyState = 4;
                this.status = options.logoError ? 500 : 200;
                this.responseXML = { documentElement: { localName: options.logoMalformed ? 'parsererror' : 'svg' } };
                this.onreadystatechange();
            }
        },
        ebhtml: { create2(settings, callback) { callback(loader); } },
        setTimeout(action, delay) {
            const handle = ++nextId;
            pending.set(handle, { action, at: now + delay });
            return handle;
        },
        clearTimeout: handle => pending.delete(handle)
    };
    const context = vm.createContext({ window, Date: class extends Date { constructor() { super(now); } } });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../GLOBAL/populari_noticias_10s/js/master.js'), 'utf8'), context);
    window.onload();
    return { events, elements, window, success: () => success(), failure: () => failure(),
        logoComplete: () => logoRequest.complete(), advance(target) {
        while (true) {
            const next = [...pending].filter(([, timer]) => timer.at <= target)
                .sort((left, right) => left[1].at - right[1].at)[0];
            if (!next) break;
            now = next[1].at;
            pending.delete(next[0]);
            next[1].action();
        }
        now = target;
    } };
}

test('real boot waits for assets, treats markup as literal text and starts 10s at loaded', () => {
    const app = runtime();
    app.success();
    assert.equal(app.elements.texto.textContent, 'Noticia <b>literal</b>');
    assert.equal(app.elements.texto.style.right, '2px');
    assert.equal(app.elements.texto.style.bottom, '2px');
    assert.deepEqual(app.events, []);
    app.advance(1500);
    app.elements['foto-img'].onload();
    assert.deepEqual(app.events, [['loaded', 1500]]);
    app.advance(11499);
    assert.equal(app.events.length, 1);
    app.advance(11500);
    assert.deepEqual(app.events, [['loaded', 1500], ['finished', 11500]]);
    app.elements['foto-img'].onerror();
    app.success();
    assert.equal(app.events.length, 2);
});

for (const options of [{ empty: true }, { malformed: true }, { text: '' }]) {
    test(`real boot releases empty/invalid data once: ${JSON.stringify(options)}`, () => {
        const app = runtime(options);
        app.success();
        app.failure();
        app.advance(30000);
        assert.deepEqual(app.events, [['loaded', 0], ['finished', 0]]);
        assert.equal(app.window.document.body.className, 'populari-body phase-empty');
    });
}

test('data watchdog handles the EBHTML zero-record stall and ignores late success', () => {
    const app = runtime();
    app.advance(config.timing.dataTimeout);
    app.success();
    app.failure();
    app.advance(30000);
    assert.deepEqual(app.events, [['loaded', 8000], ['finished', 8000]]);
    assert.equal(app.elements.texto.textContent, '');
});

test('network error releases playlist without drawing data', () => {
    const app = runtime();
    app.failure();
    app.success();
    app.advance(30000);
    assert.deepEqual(app.events, [['loaded', 0], ['finished', 0]]);
    assert.equal(app.elements.texto.textContent, '');
});

test('font loading completes before fit and before the 10s presentation starts', () => {
    const app = runtime({ cached: true, fontLoading: true });
    app.success();
    app.advance(500);
    assert.deepEqual(app.events, []);
    app.window.document.fonts.status = 'loaded';
    app.advance(550);
    assert.deepEqual(app.events, [['loaded', 550]]);
    app.advance(10550);
    assert.deepEqual(app.events.at(-1), ['finished', 10550]);
});

test('font watchdog selects a stable fallback instead of hanging the playlist', () => {
    const app = runtime({ cached: true, fontLoading: true });
    app.success();
    app.advance(2000);
    assert.deepEqual(app.events, [['loaded', 2000]]);
    assert.equal(app.elements.texto.style.fontFamily, 'Arial, sans-serif');
    app.advance(12000);
    assert.deepEqual(app.events.at(-1), ['finished', 12000]);
});

test('fit rejects fractional glyph overflow even when width and height fit', () => {
    const app = runtime({ cached: true, glyphOverflow: true });
    app.success();
    assert.equal(app.elements['texto-wrap'].attributes['data-fit'], 'failed');
    assert.equal(app.elements.texto.textContent, 'Noticia <b>literal</b>');
});

test('one inline SVG is ready before loaded and is reused for intro and outro', () => {
    const app = runtime({ cached: true, logoLoading: true });
    app.success();
    app.advance(500);
    assert.deepEqual(app.events, []);
    app.logoComplete();
    assert.equal(app.elements['brand-logo'].child.localName, 'svg');
    assert.equal(app.elements['brand-logo'].style.width, '76%');
    assert.deepEqual(app.events, [['loaded', 500]]);
    app.advance(10500);
    assert.deepEqual(app.events.at(-1), ['finished', 10500]);
});

for (const options of [{ logoError: true }, { logoTimeout: true }, { logoMalformed: true }]) {
    test(`SVG failure releases the playlist once: ${JSON.stringify(options)}`, () => {
        const app = runtime({ cached: true, ...options });
        if (options.logoTimeout) {
            app.success();
            app.advance(4000);
        }
        app.logoComplete();
        app.advance(30000);
        const origin = options.logoTimeout ? 4000 : 0;
        assert.deepEqual(app.events, [['loaded', origin], ['finished', origin]]);
        assert.equal(app.elements['brand-logo'].child, undefined);
    });
}

for (const mode of ['cached', 'broken', 'timeout', 'absent']) {
    test(`image ${mode} keeps the complete 10s cycle and ignores late image events`, () => {
        const app = runtime({ cached: mode === 'cached', ...(mode === 'absent' ? { photo: '' } : {}) });
        app.success();
        if (mode === 'broken') app.elements['foto-img'].onerror();
        if (mode === 'timeout') app.advance(6000);
        const origin = mode === 'timeout' ? 6000 : 0;
        assert.deepEqual(app.events, [['loaded', origin]]);
        app.advance(origin + 10000);
        app.elements['foto-img'].onload();
        app.elements['foto-img'].onerror();
        app.advance(30000);
        assert.deepEqual(app.events, [['loaded', origin], ['finished', origin + 10000]]);
        assert.equal(app.elements.foto.attributes['data-image'], mode === 'cached' ? 'ready' : 'fallback');
    });
}

test('layout keeps the small horizontal formats out of portrait media rules', () => {
    const css = fs.readFileSync(path.join(__dirname, '../GLOBAL/populari_noticias_10s/css/master.css'), 'utf8');
    assert.doesNotMatch(css, /max-width\s*:/);
    assert.match(css, /max-aspect-ratio:\s*1\/1/);
    assert.match(css, /max-aspect-ratio:\s*2\/3/);
    assert.doesNotMatch(css, /\b(?:vmin|vmax|vw|vh)\b|\b(?:var|calc|clamp)\(/);
    const script = fs.readFileSync(path.join(__dirname, '../GLOBAL/populari_noticias_10s/js/master.js'), 'utf8');
    assert.doesNotMatch(script, /\b(?:const|let|Promise)\b|=>|\.innerHTML\s*=/);
    assert.equal(fs.readFileSync(path.join(__dirname, '../GLOBAL/populari_noticias_10s/js/ebhtml.js'), 'utf8'),
        fs.readFileSync(path.join(__dirname, '../_template-base/js/ebhtml.js'), 'utf8'));
});