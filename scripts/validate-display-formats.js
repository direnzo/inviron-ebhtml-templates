'use strict';

var fs = require('node:fs');
var path = require('node:path');
var crypto = require('node:crypto');
var http = require('node:http');
var childProcess = require('node:child_process');
var TEST_URL = 'http://localhost:12099/FILES/1/index.html';

function digest(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
}

function readOptions(args) {
    var options = {};
    var allowed = ['--template', '--profile', '--output', '--formats', '--snapshot'];
    for (var index = 0; index < args.length; index += 2) {
        var name = args[index];
        if (allowed.indexOf(name) === -1 || !args[index + 1] || Object.prototype.hasOwnProperty.call(options, name.slice(2))) {
            throw new Error('Argumento invalido ou repetido: ' + name);
        }
        options[name.slice(2)] = args[index + 1];
    }
    if (!options.template || !options.profile || !options.output) {
        throw new Error('Use --template PASTA --profile PERFIL.json --output PASTA_NOVA [--formats LISTA_OU_ARRAY_JSON] [--snapshot AAAA-MM-DD].');
    }
    return options;
}

function readProfile(file) {
    var profile = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (typeof profile.readySelector !== 'string' || !profile.readySelector.trim() || !Array.isArray(profile.regions) || !profile.regions.length) {
        throw new Error('Perfil requer readySelector e regions nao vazios.');
    }
    for (var index = 0; index < profile.regions.length; index++) {
        var region = profile.regions[index];
        if (typeof region.selector !== 'string' || !region.selector.trim() || typeof region.minFontPx !== 'number' || !Number.isFinite(region.minFontPx) || region.minFontPx <= 0) {
            throw new Error('Cada regiao requer selector e minFontPx positivo definido pelo projeto.');
        }
    }
    if (!Number.isSafeInteger(profile.timeoutMs) || profile.timeoutMs < 100 || profile.timeoutMs > 300000) {
        throw new Error('timeoutMs deve ser inteiro entre 100 e 300000, cobrindo a duracao do template.');
    }
    if (profile.overlapPairs !== undefined && !Array.isArray(profile.overlapPairs)) { throw new Error('overlapPairs deve ser array.'); }
    var pairs = profile.overlapPairs || [];
    for (var pairIndex = 0; pairIndex < pairs.length; pairIndex++) {
        var pair = pairs[pairIndex];
        if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== 'string' || typeof pair[1] !== 'string' || !pair[0] || !pair[1]) {
            throw new Error('Cada par de sobreposicao requer dois seletores.');
        }
    }
    if (profile.scenarios !== undefined && (!Array.isArray(profile.scenarios) || !profile.scenarios.length)) {
        throw new Error('scenarios deve ser um array nao vazio quando declarado.');
    }
    var scenarios = profile.scenarios || [{ name: 'default' }];
    var names = {};
    for (var scenarioIndex = 0; scenarioIndex < scenarios.length; scenarioIndex++) {
        var scenario = scenarios[scenarioIndex];
        if (typeof scenario.name !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(scenario.name) || names[scenario.name]) { throw new Error('Nome de cenario invalido ou duplicado.'); }
        names[scenario.name] = true;
        if (scenario.initScript !== undefined && (typeof scenario.initScript !== 'string' || !scenario.initScript)) { throw new Error('initScript deve apontar para um arquivo local.'); }
    }
    profile.scenarios = scenarios;
    return profile;
}

function parseFormats(value) {
    var formats = value.trim().charAt(0) === '[' ? JSON.parse(value) : value.split(',');
    if (!Array.isArray(formats) || !formats.length) { throw new Error('--formats requer lista ou array JSON nao vazio.'); }
    for (var index = 0; index < formats.length; index++) {
        if (typeof formats[index] !== 'string' || !/^\s*[1-9][0-9]*\s*[xX]\s*[1-9][0-9]*\s*$/.test(formats[index])) {
            throw new Error('Formato invalido; use resolucoes largura x altura, nao proporcoes.');
        }
    }
    return formats;
}

function loadMatrix(options) {
    var script = path.join(__dirname, 'display-formats.ps1');
    var args = ['-NoProfile', '-NonInteractive', '-File', script, '-Mode', 'Matrix'];
    if (options.formats !== undefined) {
        var formats = parseFormats(options.formats);
        args.push('-FormatsJson', JSON.stringify(formats));
    }
    if (options.snapshot) { args.push('-Snapshot', options.snapshot); }
    var result = childProcess.spawnSync('powershell.exe', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, windowsHide: true });
    if (result.error) { throw result.error; }
    if (result.status !== 0) { throw new Error(result.stderr || result.stdout || 'Falha ao auditar catalogo.'); }
    return JSON.parse(result.stdout.replace(/^\uFEFF/, ''));
}

function requestBuffer(url) {
    return new Promise(function (resolve, reject) {
        var request = http.get(url, function (response) {
            var chunks = [];
            if (response.statusCode !== 200) {
                response.resume();
                reject(new Error('HTTP ' + response.statusCode + ': ' + url));
                return;
            }
            response.on('data', function (chunk) { chunks.push(chunk); });
            response.on('end', function () { resolve(Buffer.concat(chunks)); });
            response.on('error', reject);
        });
        request.setTimeout(10000, function () { request.destroy(new Error('Timeout ao acessar ebcliente4.')); });
        request.on('error', reject);
    });
}

function verifyServed(template, url) {
    var address = new URL(url);
    var root = new URL(TEST_URL);
    if (address.origin !== root.origin || address.pathname.indexOf('/FILES/1/') !== 0 || address.search) {
        return Promise.reject(new Error('Asset fora do slot autorizado ou URL com query nao verificavel: ' + url));
    }
    var relative = decodeURIComponent(address.pathname.slice('/FILES/1/'.length));
    var local = path.resolve(template, relative);
    var traversal = path.relative(template, local);
    if (traversal.indexOf('..') === 0 || path.isAbsolute(traversal)) { return Promise.reject(new Error('Asset fora do template: ' + relative)); }
    return requestBuffer(url).then(function (served) {
        var source = fs.readFileSync(local);
        if (!source.equals(served)) { throw new Error('Arquivo servido difere do disco: ' + relative); }
        return { file: relative, sha256: digest(source) };
    });
}

function observePlaylist() {
    window.__displayValidation = { events: [], errors: [], loaders: 0 };
    var library;
    function instrument(loader) {
        if (loader.__displayObserved) { return loader; }
        loader.__displayObserved = true;
        var identifier = ++window.__displayValidation.loaders;
        var methods = ['loaded', 'finished', 'error'];
        for (var index = 0; index < methods.length; index++) {
            (function (method) {
                var original = loader[method];
                if (typeof original !== 'function') { return; }
                loader[method] = function () {
                    window.__displayValidation.events.push({ loader: identifier, method: method, time: Date.now() });
                    return original.apply(this, arguments);
                };
            }(methods[index]));
        }
        return loader;
    }
    Object.defineProperty(window, 'ebhtml', {
        configurable: true,
        get: function () { return library; },
        set: function (value) {
            library = value;
            if (!value || typeof value.create2 !== 'function') { return; }
            var original = value.create2;
            value.create2 = function (config, callback) {
                return original.call(this, config, function (loader) { return callback(instrument(loader)); });
            };
        }
    });
}

function inspectPage(profile) {
    var issues = [];
    function visible(element) {
        for (var parent = element; parent && parent.nodeType === 1; parent = parent.parentElement) {
            var style = window.getComputedStyle(parent);
            if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) { return false; }
        }
        return true;
    }
    for (var index = 0; index < profile.regions.length; index++) {
        var region = profile.regions[index];
        var elements = document.querySelectorAll(region.selector);
        if (!elements.length) { issues.push('Regiao ausente: ' + region.selector); }
        for (var elementIndex = 0; elementIndex < elements.length; elementIndex++) {
            var element = elements[elementIndex];
            var rectangle = element.getBoundingClientRect();
            if (!visible(element) || rectangle.width <= 0 || rectangle.height <= 0) { issues.push('Regiao invisivel: ' + region.selector); }
            if (rectangle.left < -1 || rectangle.top < -1 || rectangle.right > innerWidth + 1 || rectangle.bottom > innerHeight + 1) { issues.push('Regiao fora do viewport: ' + region.selector); }
            if (element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1) { issues.push('Overflow: ' + region.selector); }
            if (parseFloat(window.getComputedStyle(element).fontSize) < region.minFontPx) { issues.push('Fonte abaixo do minimo declarado: ' + region.selector); }
        }
    }
    var pairs = profile.overlapPairs || [];
    for (var pairIndex = 0; pairIndex < pairs.length; pairIndex++) {
        var first = document.querySelectorAll(pairs[pairIndex][0]);
        var second = document.querySelectorAll(pairs[pairIndex][1]);
        if (!first.length || !second.length) { issues.push('Seletor de sobreposicao ausente: ' + pairs[pairIndex].join(', ')); }
        for (var firstIndex = 0; firstIndex < first.length; firstIndex++) {
            for (var secondIndex = 0; secondIndex < second.length; secondIndex++) {
                var firstRect = first[firstIndex].getBoundingClientRect();
                var secondRect = second[secondIndex].getBoundingClientRect();
                if (visible(first[firstIndex]) && visible(second[secondIndex]) && Math.min(firstRect.right, secondRect.right) - Math.max(firstRect.left, secondRect.left) > 1 && Math.min(firstRect.bottom, secondRect.bottom) - Math.max(firstRect.top, secondRect.top) > 1) {
                    issues.push('Sobreposicao indevida: ' + pairs[pairIndex].join(', '));
                }
            }
        }
    }
    var images = document.images;
    for (var imageIndex = 0; imageIndex < images.length; imageIndex++) {
        if (images[imageIndex].currentSrc && (!images[imageIndex].complete || images[imageIndex].naturalWidth === 0)) { issues.push('Imagem nao carregada: ' + images[imageIndex].currentSrc); }
    }
    var assets = [];
    var resources = document.querySelectorAll('script[src],link[rel="stylesheet"][href]');
    for (var resourceIndex = 0; resourceIndex < resources.length; resourceIndex++) { assets.push(resources[resourceIndex].src || resources[resourceIndex].href); }
    return { viewport: { width: innerWidth, height: innerHeight }, issues: issues, assets: assets };
}

function checkCycle(events) {
    var methods = [];
    for (var index = 0; index < events.length; index++) { methods.push(events[index].method); }
    return methods.join(',') === 'loaded,finished' ? [] : ['Playlist deve emitir loaded,finished exatamente uma vez por pagina; observado: ' + methods.join(',')];
}

function runCase(browser, template, profile, scenario, format, output, profileDirectory) {
    var context;
    var page;
    var problems = [];
    var result = { format: format.format, scenario: scenario.name, requestedViewport: { width: format.width, height: format.height }, status: 'blocked', automated: 'blocked', visualReview: 'pending', runtimeHomologation: 'pending', issues: [], assets: [] };
    return browser.newContext({ viewport: result.requestedViewport, deviceScaleFactor: 1, serviceWorkers: 'block' }).then(function (created) {
        context = created;
        return context.route('**/*', function (route) {
            var url = new URL(route.request().url());
            if (url.origin !== new URL(TEST_URL).origin) {
                problems.push('Requisicao externa bloqueada: ' + url.origin);
                return route.abort();
            }
            return route.continue();
        });
    }).then(function () { return context.addInitScript(observePlaylist); }).then(function () {
        if (!scenario.initScript) { return; }
        return context.addInitScript({ path: path.resolve(profileDirectory, scenario.initScript) });
    }).then(function () { return context.newPage(); }).then(function (created) {
        page = created;
        page.on('pageerror', function (error) { problems.push('JavaScript: ' + error.message); });
        page.on('response', function (response) { if (response.status() >= 400) { problems.push('HTTP ' + response.status() + ': ' + response.url()); } });
        page.on('requestfailed', function (request) { problems.push('Requisicao falhou: ' + request.url()); });
        return page.goto(TEST_URL, { waitUntil: 'load', timeout: profile.timeoutMs });
    }).then(function () {
        return page.waitForFunction(function (selector) {
            var element = document.querySelector(selector);
            if (!element) { return false; }
            for (var parent = element; parent && parent.nodeType === 1; parent = parent.parentElement) {
                var style = getComputedStyle(parent);
                if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) { return false; }
            }
            return element.getBoundingClientRect().width > 0 && element.getBoundingClientRect().height > 0;
        }, profile.readySelector, { timeout: profile.timeoutMs });
    }).then(function () {
        return page.waitForFunction(function () {
            if (document.fonts.status !== 'loaded') { return false; }
            for (var index = 0; index < document.images.length; index++) {
                if (document.images[index].currentSrc && !document.images[index].complete) { return false; }
            }
            return true;
        }, null, { timeout: profile.timeoutMs });
    }).then(function () {
        return page.evaluate(inspectPage, profile);
    }).then(function (inspection) {
        result.observedViewport = inspection.viewport;
        result.issues = inspection.issues;
        if (inspection.viewport.width !== format.width || inspection.viewport.height !== format.height) { throw new Error('Player alterou o viewport; dimensao solicitada nao foi testada.'); }
        var chain = Promise.resolve();
        for (var index = 0; index < inspection.assets.length; index++) {
            (function (url) { chain = chain.then(function () { return verifyServed(template, url); }).then(function (asset) { result.assets.push(asset); }); }(inspection.assets[index]));
        }
        return chain;
    }).then(function () {
        result.screenshot = format.format + '-' + scenario.name + '.png';
        return page.screenshot({ path: path.join(output, result.screenshot), animations: 'disabled', timeout: profile.timeoutMs });
    }).then(function () {
        return page.waitForFunction(function () {
            var events = window.__displayValidation.events;
            return events.length && events[events.length - 1].method === 'finished';
        }, null, { timeout: profile.timeoutMs });
    }).then(function () {
        return page.evaluate(function () { return window.__displayValidation.events; });
    }).then(function (events) {
        result.playlist = events;
        result.issues = result.issues.concat(checkCycle(events), problems);
        result.automated = result.issues.length ? 'failed' : 'passed';
        result.status = result.issues.length ? 'failed' : 'blocked';
        if (!result.issues.length) { result.pending = 'Revisao visual e homologacao no runtime alvo ainda obrigatorias.'; }
    }).catch(function (error) {
        result.issues = result.issues.concat(problems, [error.message]);
    }).then(function () {
        if (!context) { return result; }
        return context.close().then(function () { return result; });
    });
}

function run(options) {
    var template = fs.realpathSync(options.template);
    var profileFile = fs.realpathSync(options.profile);
    var profile = readProfile(profileFile);
    var matrix = loadMatrix(options);
    var output = path.resolve(options.output);
    var relative = path.relative(template, output);
    if (!relative || (relative.indexOf('..') !== 0 && !path.isAbsolute(relative))) { throw new Error('Relatorio deve ficar fora da pasta de runtime do template.'); }
    if (fs.existsSync(output)) { throw new Error('Pasta de saida ja existe; escolha outra para preservar evidencias.'); }
    fs.mkdirSync(output, { recursive: true });
    var report = { schemaVersion: 1, url: TEST_URL, template: template, templateIndexSha256: digest(fs.readFileSync(path.join(template, 'index.html'))), profileSha256: digest(fs.readFileSync(profileFile)), matrix: matrix, browser: null, expected: matrix.expected * profile.scenarios.length, executed: 0, cases: [], status: 'blocked', runtimeHomologation: 'pending' };
    var browser;
    return verifyServed(template, TEST_URL).then(function () {
        return require('playwright').chromium.launch({ headless: true });
    }).then(function (created) {
        browser = created;
        report.browser = { engine: 'chromium', version: browser.version() };
        var chain = Promise.resolve();
        for (var index = 0; index < matrix.formats.length; index++) {
            for (var scenarioIndex = 0; scenarioIndex < profile.scenarios.length; scenarioIndex++) {
                (function (format, scenario) {
                    chain = chain.then(function () { return verifyServed(template, TEST_URL); }).then(function () {
                        return runCase(browser, template, profile, scenario, format, output, path.dirname(profileFile));
                    }).then(function (result) {
                        report.cases.push(result);
                        report.executed++;
                        fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
                    });
                }(matrix.formats[index], profile.scenarios[scenarioIndex]));
            }
        }
        return chain;
    }).catch(function (error) { report.blocker = error.message || error.code || String(error); }).then(function () {
        if (!browser) { return; }
        return browser.close();
    }).then(function () {
        var failed = 0;
        var passed = 0;
        for (var index = 0; index < report.cases.length; index++) {
            if (report.cases[index].automated === 'passed') { passed++; }
            if (report.cases[index].automated === 'failed') { failed++; }
        }
        report.automatedPassed = passed;
        report.automatedFailed = failed;
        report.blocked = report.expected - passed - failed;
        if (failed) { report.status = 'failed'; }
        report.automatedComplete = passed === report.expected;
        fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
        return report;
    });
}

module.exports = { readOptions: readOptions, readProfile: readProfile, parseFormats: parseFormats, loadMatrix: loadMatrix, checkCycle: checkCycle, inspectPage: inspectPage, observePlaylist: observePlaylist, verifyServed: verifyServed, runCase: runCase, run: run };
if (require.main === module) {
    try {
        run(readOptions(process.argv.slice(2))).then(function (report) {
            console.log(JSON.stringify({ expected: report.expected, executed: report.executed, automatedPassed: report.automatedPassed, blocked: report.blocked, status: report.status, blocker: report.blocker }, null, 2));
            process.exitCode = report.automatedComplete ? 0 : 1;
        }).catch(function (error) { console.error(error.message); process.exitCode = 2; });
    } catch (error) { console.error(error.message); process.exitCode = 2; }
}