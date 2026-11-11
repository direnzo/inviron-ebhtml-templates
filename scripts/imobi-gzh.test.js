'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var fs = require('node:fs');
var path = require('node:path');
var vm = require('node:vm');

var template = path.resolve(__dirname, '../CLIENTES/IMOBI/GZH');

function createHarness(options) {
    options = options || {};
    var now = 0;
    var nextTimer = 0;
    var pending = new Map();
    var elements = {};
    var events = [];
    var success;
    var failure;
    var records = options.records || [];

    function classList() {
        var names = [];
        return {
            add: function(name) { if (names.indexOf(name) === -1) { names.push(name); } },
            remove: function(name) { names = names.filter(function(item) { return item !== name; }); },
            contains: function(name) { return names.indexOf(name) !== -1; },
            toggle: function(name, force) {
                if (force === undefined) { force = !this.contains(name); }
                if (force) { this.add(name); } else { this.remove(name); }
                return force;
            }
        };
    }

    function element(id) {
        if (!elements[id]) {
            elements[id] = {
                id: id,
                style: { setProperty: function() {} },
                classList: classList(),
                textContent: '',
                alt: '',
                clientWidth: 500,
                clientHeight: 240,
                scrollWidth: 0,
                scrollHeight: 0,
                getBoundingClientRect: function() { return { right: 500, bottom: 240 }; },
                removeAttribute: function(name) { if (name === 'src') { this._src = ''; } }
            };
            if (id === 'brandLogo' || id === 'photo0' || id === 'photo1') {
                Object.defineProperty(elements[id], 'src', {
                    get: function() { return this._src || ''; },
                    set: function(value) {
                        assert.equal(typeof this.onload, 'function', 'onload must be set before src');
                        assert.equal(typeof this.onerror, 'function', 'onerror must be set before src');
                        this._src = value;
                        if (options.imageError) { this.onerror(); }
                        else if (!options.imagePending) { this.onload(); }
                    }
                });
            }
        }
        return elements[id];
    }

    function makeItem(fields) {
        return {
            value: function(name) {
                if (options.malformed) { throw new Error('dado malformado'); }
                return { value: fields[name] || '' };
            }
        };
    }

    var list = {
        count: function() { return records.length; },
        get: function(index) { return makeItem(records[index] || {}); }
    };
    var loader = {
        addData: function(name, required, params) {
            assert.equal(name, 'D_GZH');
            assert.equal(required, false);
            assert.equal(params, 'amount=2');
        },
        datalist: function() { return list; },
        load: function(onSuccess, onFailure) { success = onSuccess; failure = onFailure; },
        loaded: function() { events.push(['loaded', now]); },
        finished: function() { events.push(['finished', now]); }
    };
    var document = {
        body: element('body'),
        documentElement: { style: { setProperty: function() {} } },
        getElementById: element,
        createRange: function() {
            return {
                selectNodeContents: function() {},
                getBoundingClientRect: function() { return { width: 0, right: 500, bottom: 240 }; }
            };
        }
    };
    var window = {
        location: { search: options.search || '' },
        innerWidth: options.width || 1536,
        innerHeight: options.height || 768
    };
    var context = vm.createContext({
        window: window,
        document: document,
        navigator: { userAgent: options.userAgent || 'test', deviceMemory: 8, hardwareConcurrency: 8 },
        ebhtml: { create2: function(settings, callback) { callback(loader); } },
        console: {
            log: function(message) {
                if (message === '[Mock] loader.loaded()') { events.push(['loaded', now]); }
                if (message === '[Mock] loader.finished()') { events.push(['finished', now]); }
            },
            warn: function() {}
        },
        setTimeout: function(action, delay) {
            var id = ++nextTimer;
            pending.set(id, { action: action, at: now + delay });
            return id;
        },
        clearTimeout: function(id) { pending.delete(id); }
    });
    vm.runInContext(fs.readFileSync(path.join(template, 'js/config.js'), 'utf8'), context);
    if (options.useMock) {
        vm.runInContext(fs.readFileSync(path.join(template, 'js/mock-data.js'), 'utf8'), context);
        context.ebhtml = window.ebhtml;
        if (options.mockRecords) { context.MOCK_DATA.datasets.D_GZH = options.mockRecords; }
    }
    vm.runInContext(fs.readFileSync(path.join(template, 'js/master.js'), 'utf8'), context);
    window.onload();

    return {
        events: events,
        elements: elements,
        success: function() { success(); },
        failure: function(error) { failure(error); },
        advance: function(target) {
            while (true) {
                var next = Array.from(pending).filter(function(entry) { return entry[1].at <= target; })
                    .sort(function(first, second) { return first[1].at - second[1].at; })[0];
                if (!next) { break; }
                now = next[1].at;
                pending.delete(next[0]);
                next[1].action();
            }
            now = target;
        }
    };
}

var first = {
    TITULO: 'Manchete principal de exemplo para o template de notícias',
    CATEGORY: 'CIDADE',
    FOTO: 'img/placeholder.jpg'
};
var second = {
    TITULO: 'Outra manchete de exemplo para a segunda notícia',
    CATEGORY: 'ESPORTES',
    FOTO: 'img/placeholder.jpg'
};

test('mock real inicializa duas noticias sem canal nos dois formatos explicitos', function() {
    [[1536, 768], [768, 1152]].forEach(function(format) {
        var app = createHarness({ useMock: true, width: format[0], height: format[1] });
        assert.equal(app.elements.title0.textContent, 'Projeto amplia oportunidades para estudantes e jovens profissionais');
        assert.equal(app.elements.title1.textContent, 'Veja as novidades e os destaques do esporte nesta semana');
        assert.equal(app.elements.card1.classList.contains('hidden'), false);
        assert.equal(app.elements.photo0.src, 'img/placeholder.jpg');
        assert.equal(app.elements.photo1.src, 'img/placeholder.jpg');
        assert.equal(app.elements.dynamicContent.classList.contains('is-visible'), true);
        assert.deepEqual(app.events, [['loaded', 0]]);
        app.advance(5000);
        assert.equal(app.elements.dynamicContent.classList.contains('cta-visible'), true);
        app.advance(10000);
        assert.deepEqual(app.events, [['loaded', 0], ['finished', 10000]]);
    });
});

test('mock real com uma noticia nao duplica o card e conclui o ciclo', function() {
    var app = createHarness({ useMock: true, mockRecords: [first] });
    assert.equal(app.elements.title0.textContent, first.TITULO);
    assert.equal(app.elements.title1.textContent, '');
    assert.equal(app.elements.card1.classList.contains('hidden'), true);
    app.advance(10000);
    assert.deepEqual(app.events, [['loaded', 0], ['finished', 10000]]);
});

test('exibe duas noticias e mantem o ciclo de 10s; CTA entra aos 5s', function() {
    var app = createHarness({ records: [first, second] });
    app.success();
    assert.equal(app.elements.title0.textContent, first.TITULO);
    assert.equal(app.elements.title1.textContent, second.TITULO);
    assert.equal(app.elements.card1.classList.contains('hidden'), false);
    assert.deepEqual(app.events, [['loaded', 0]]);
    app.advance(4999);
    assert.equal(app.elements.dynamicContent.classList.contains('cta-visible'), false);
    app.advance(5000);
    assert.equal(app.elements.dynamicContent.classList.contains('cta-visible'), true);
    app.advance(10000);
    assert.deepEqual(app.events, [['loaded', 0], ['finished', 10000]]);
});

test('exibe um registro sem duplicar o card e preserva o texto literal', function() {
    var record = { TITULO: 'Título <sem marcação>', CATEGORY: 'CULTURA', FOTO: '' };
    var app = createHarness({ records: [record] });
    app.success();
    assert.equal(app.elements.title0.textContent, record.TITULO);
    assert.equal(app.elements.title1.textContent, '');
    assert.equal(app.elements.card1.classList.contains('hidden'), true);
    assert.equal(app.elements.category0.textContent, 'CULTURA');
    app.advance(10000);
    assert.deepEqual(app.events, [['loaded', 0], ['finished', 10000]]);
});

test('imagem quebrada nao bloqueia o ciclo de exibição', function() {
    var app = createHarness({ records: [first, second], imageError: true });
    app.success();
    assert.deepEqual(app.events, [['loaded', 0]]);
    app.advance(10000);
    assert.deepEqual(app.events, [['loaded', 0], ['finished', 10000]]);
});

test('watchdog de mídia revela os dados e ignora eventos tardios', function() {
    var app = createHarness({ records: [first], imagePending: true });
    app.success();
    app.advance(8000);
    assert.deepEqual(app.events, [['loaded', 8000]]);
    app.elements.brandLogo.onload();
    app.elements.photo0.onerror();
    app.advance(18000);
    assert.deepEqual(app.events, [['loaded', 8000], ['finished', 18000]]);
});

test('dataset vazio e erro liberam a playlist com loaded antes de finished', function() {
    [createHarness({ records: [] }), createHarness({ records: [first] })].forEach(function(app, index) {
        if (index === 0) { app.success(); } else { app.failure(new Error('rede')); }
        assert.deepEqual(app.events, [['loaded', 0]]);
        app.advance(100);
        assert.deepEqual(app.events, [['loaded', 0], ['finished', 100]]);
    });
});

test('watchdog cobre timeout silencioso e ignora callbacks tardios', function() {
    var app = createHarness({ records: [first] });
    app.advance(8000);
    app.success();
    app.failure();
    app.advance(8100);
    assert.deepEqual(app.events, [['loaded', 8000], ['finished', 8100]]);
    assert.equal(app.elements.title0.textContent, '');
});

test('exceção durante leitura de campo finaliza uma única vez', function() {
    var app = createHarness({ records: [first], malformed: true });
    app.success();
    app.advance(100);
    assert.deepEqual(app.events, [['loaded', 0], ['finished', 100]]);
});

test('editorias encostam nas fotos e deslizam da esquerda por tras delas nos dois formatos', async function() {
    var browser = await require('playwright').chromium.launch({ headless: true });
    try {
        for (var format of [[1536, 768], [768, 1152]]) {
            var page = await browser.newPage({ viewport: { width: format[0], height: format[1] } });
            await page.route('**/*', function(route) {
                var url = new URL(route.request().url());
                if (url.origin !== 'http://localhost:12099' || !url.pathname.startsWith('/FILES/1/')) {
                    return route.abort();
                }
                if (url.pathname === '/FILES/1/index.html') {
                    var html = fs.readFileSync(path.join(template, 'index.html'), 'utf8');
                    return route.fulfill({
                        contentType: 'text/html',
                        body: html.replace('<!-- <script src="js/mock-data.js"></script> -->', '<script src="js/mock-data.js"></script>')
                    });
                }
                return route.fulfill({ path: path.join(template, decodeURIComponent(url.pathname.slice('/FILES/1/'.length))) });
            });
            await page.goto('http://localhost:12099/FILES/1/index.html');
            await page.waitForSelector('#dynamicContent.is-visible');
            var cards = await page.evaluate(async function() {
                await document.fonts.ready;
                function finishAnimations() {
                    document.getAnimations().forEach(function(animation) { animation.finish(); });
                }
                function nextFrame() {
                    return new Promise(function(resolve) { requestAnimationFrame(function() { requestAnimationFrame(resolve); }); });
                }
                finishAnimations();
                var content = document.getElementById('dynamicContent');
                content.classList.remove('is-visible');
                await nextFrame();
                finishAnimations();
                content.classList.add('is-visible');
                await nextFrame();
                document.getAnimations().forEach(function(animation) {
                    if (animation.transitionProperty !== 'transform' || !animation.effect.target.classList.contains('category-pill')) {
                        animation.finish();
                    }
                });
                return [0, 1].map(function(index) {
                    var category = document.getElementById('category' + index);
                    var photo = document.getElementById('photo' + index);
                    var animation = category.getAnimations().find(function(item) { return item.transitionProperty === 'transform'; });
                    var timing = animation.effect.getTiming();
                    animation.pause();
                    function position(progress) {
                        animation.currentTime = timing.delay + timing.duration * progress;
                        return new DOMMatrix(getComputedStyle(category).transform).m41;
                    }
                    var start = position(0);
                    var middle = position(0.5);
                    var photoBox = photo.getBoundingClientRect();
                    var categoryBox = category.getBoundingClientRect();
                    var covering = document.elementFromPoint(photoBox.right - 1, categoryBox.top + categoryBox.height / 2);
                    var end = position(1);
                    var finalBox = category.getBoundingClientRect();
                    return {
                        gap: finalBox.left - photoBox.right,
                        width: finalBox.width,
                        start: start,
                        middle: middle,
                        end: end,
                        covering: covering.id,
                        clip: getComputedStyle(category.parentElement).overflowX
                    };
                });
            });
            cards.forEach(function(card, index) {
                assert.ok(Math.abs(card.gap) < 0.1, 'editoria deve encostar na foto');
                assert.ok(Math.abs(card.start + card.width) < 0.1, 'entrada deve começar totalmente à esquerda');
                assert.ok(card.start < card.middle && card.middle < card.end, 'entrada deve avançar para a direita');
                assert.ok(Math.abs(card.end) < 0.1, 'entrada deve terminar na posição original');
                assert.equal(card.covering, 'photo' + index, 'foto deve ficar à frente da editoria');
                assert.equal(card.clip, 'hidden', 'editoria não deve aparecer do outro lado da foto');
            });
            await page.close();
        }
    } finally {
        await browser.close();
    }
});

test('EBHTML, mock, formatos e contrato do template estão coerentes', function() {
    var script = fs.readFileSync(path.join(template, 'js/master.js'), 'utf8');
    var html = fs.readFileSync(path.join(template, 'index.html'), 'utf8');
    assert.equal(fs.readFileSync(path.join(template, 'js/ebhtml.js'), 'utf8'),
        fs.readFileSync(path.join(__dirname, '../_template-base/js/ebhtml.js'), 'utf8'));
    assert.match(html, /title>IMOBI GZH/);
    assert.doesNotMatch(script, /\b(?:const|let|Promise|fetch)\b|=>/);
});
