'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var fs = require('node:fs');
var path = require('node:path');
var runner = require('./validate-display-formats');
var chromium = require('playwright').chromium;

test('CLI preserva array explicito e rejeita parametros invalidos', function () {
    var options = runner.readOptions(['--template', 'example', '--profile', 'profile.json', '--output', 'out', '--formats', '["1234x567"]']);
    assert.equal(options.formats, '["1234x567"]');
    assert.throws(function () { runner.readOptions(['--url', 'file:///example']); });
    assert.throws(function () { runner.readOptions(['--template', 'example']); });
    assert.throws(function () { runner.readOptions(['--template', 'first', '--template', 'second']); });
});

test('playlist exige exatamente loaded seguido de finished', function () {
    assert.equal(runner.checkCycle([{ method: 'loaded' }, { method: 'finished' }]).length, 0);
    assert.equal(runner.checkCycle([{ method: 'finished' }]).length, 1);
    assert.equal(runner.checkCycle([{ method: 'loaded' }, { method: 'loaded' }, { method: 'finished' }]).length, 1);
    assert.equal(runner.checkCycle([{ method: 'loaded' }, { method: 'error' }, { method: 'finished' }]).length, 1);
});

test('perfil de exemplo e referencias canonicas locais sao validos', function () {
    var profile = runner.readProfile(path.join(__dirname, 'display-formats.profile.example.json'));
    assert.equal(profile.scenarios.length, 1);
    var documents = ['AGENTS.md', 'CLAUDE.md', 'docs/07-formatos-e-validacao.md', '.github/skills/edgecontents-display-formats/SKILL.md'];
    for (var index = 0; index < documents.length; index++) {
        var file = path.resolve(__dirname, '..', documents[index]);
        var text = fs.readFileSync(file, 'utf8');
        var pattern = /\[[^\]]+\]\(([^)#]+)(?:#[^)]*)?\)/g;
        var match;
        while ((match = pattern.exec(text))) {
            assert.equal(fs.existsSync(path.resolve(path.dirname(file), decodeURIComponent(match[1]))), true, documents[index] + ': ' + match[1]);
        }
    }
    var skill = fs.readFileSync(path.resolve(__dirname, '../.github/skills/edgecontents-display-formats/SKILL.md'), 'utf8');
    assert.match(skill, /^---\r?\nname: edgecontents-display-formats\r?\ndescription: "[^"\n]+"\r?\n---/);
});

test('matriz real respeita formatos explicitos e ineditos', function () {
    assert.deepEqual(runner.parseFormats('1920x1080,1080x1920'), ['1920x1080', '1080x1920']);
    assert.deepEqual(runner.parseFormats('["1920x1080","1080x1920"]'), ['1920x1080', '1080x1920']);
    assert.throws(function () { runner.parseFormats('[1920x1080]'); });
    assert.throws(function () { runner.parseFormats('1920x1080,'); });
    var matrix = runner.loadMatrix({ formats: '["1920x1080","1234x567","1920x1080"]' });
    assert.equal(matrix.scope, 'explicit');
    assert.equal(matrix.expected, 2);
    assert.equal(matrix.formats[1].inCatalog, false);
    assert.throws(function () { runner.loadMatrix({ formats: '[]' }); });
    assert.throws(function () { runner.loadMatrix({ formats: '["16:9"]' }); });
});

test('inspecao sintetica detecta cortes, sobreposicao e ciclo sem servidor adicional', function () {
    var browser;
    var page;
    return chromium.launch({ headless: true }).then(function (created) {
        browser = created;
        return browser.newPage({ viewport: { width: 384, height: 192 } });
    }).then(function (created) {
        page = created;
        return page.addInitScript(runner.observePlaylist);
    }).then(function () {
        return page.route('http://localhost:12099/FILES/1/index.html', function (route) {
            return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><head><style>body{margin:0}#title{position:absolute;left:0;top:0;width:100px;height:30px;font-size:16px;overflow:hidden}#price{position:absolute;left:50px;top:0;width:100px;height:30px;font-size:16px}</style></head><body><div id="title">TITULO_MUITO_LONGO_SEM_QUEBRA</div><div id="price">99,90</div><script>window.ebhtml={create2:function(config,callback){callback({loaded:function(){},finished:function(){}})}};ebhtml.create2({},function(loader){loader.loaded();loader.finished();});</script></body></html>' });
        });
    }).then(function () { return page.goto('http://localhost:12099/FILES/1/index.html'); }).then(function () {
        return page.evaluate(runner.inspectPage, { regions: [{ selector: '#title', minFontPx: 18 }, { selector: '#price', minFontPx: 12 }], overlapPairs: [['#title', '#price']] });
    }).then(function (result) {
        assert.deepEqual(result.viewport, { width: 384, height: 192 });
        assert.ok(result.issues.indexOf('Overflow: #title') !== -1);
        assert.ok(result.issues.indexOf('Fonte abaixo do minimo declarado: #title') !== -1);
        assert.ok(result.issues.indexOf('Sobreposicao indevida: #title, #price') !== -1);
        return page.evaluate(function () { return window.__displayValidation.events; });
    }).then(function (events) {
        assert.equal(runner.checkCycle(events).length, 0);
    }).finally(function () { if (browser) { return browser.close(); } });
});