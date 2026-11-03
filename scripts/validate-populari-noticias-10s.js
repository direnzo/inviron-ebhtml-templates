const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const { verifyServed, inspectPage, observePlaylist, checkCycle, loadMatrix, readProfile } = require('./validate-display-formats');

const template = path.resolve(__dirname, '../GLOBAL/populari_noticias_10s');
const url = 'http://localhost:12099/FILES/1/index.html';
const formats = '864x432,1152x576,384x682,768x960,576x1026';
const profile = readProfile(path.join(__dirname, 'populari-noticias-10s.profile.json'));
const longText = 'A prefeitura anunciou novas medidas para melhorar o transporte e o atendimento nos bairros. '
    + 'O projeto inclui obras nas vias, novos horarios de onibus e ampliacao dos servicos de saude. '
    + 'As equipes iniciam os trabalhos nesta semana, e os moradores podem consultar o calendario completo nos canais oficiais. '
    + 'A primeira etapa atende as regioes com maior demanda e tera acompanhamento das comunidades locais.';

function fixture(scenario) {
    window.addEventListener('load', function () {
        const original = window.ebhtml.create2;
        window.ebhtml.create2 = function (settings, callback) {
            return original.call(this, settings, function (loader) {
                if (scenario.record) {
                    const originalAdd = loader.addData;
                    loader.addData = function (name, required, parameters) {
                        return originalAdd.call(this, name, required,
                            (parameters ? parameters + '&' : '') + 'f_id=' + encodeURIComponent(scenario.record));
                    };
                }
                const originalData = loader.data;
                loader.data = function (name) {
                    const item = originalData.call(this, name);
                    if (!item) return item;
                    return { value: function (field) {
                        if (['texto-longo', 'reticencias-na-origem'].includes(scenario.name) &&
                            ['TEXTOCOMPLETO', 'textocompleto', 'TextoCompleto'].includes(field)) return { value: '' };
                        if (scenario.name === 'reticencias-na-origem' && ['TEXTO', 'texto', 'Texto'].includes(field)) {
                            return { value: 'Noticia cortada na origem\u2026' };
                        }
                        if (scenario.name === 'texto-longo' && ['TEXTO', 'texto', 'Texto'].includes(field)) {
                            return { value: scenario.text };
                        }
                        if (scenario.name === 'imagem-quebrada' && ['FOTO', 'foto', 'Foto', 'IMAGEM', 'imagem'].includes(field)) {
                            return { value: '/FILES/1/__populari_broken_image__' };
                        }
                        return item.value(field);
                    } };
                };
                return callback(loader);
            });
        };
    });
}

async function textGeometry(page) {
    return page.evaluate(() => {
        const text = document.getElementById('texto');
        const box = document.getElementById('texto-wrap');
        const range = document.createRange();
        range.selectNodeContents(text);
        const rect = range.getBoundingClientRect();
        const area = box.getBoundingClientRect();
        return {
            fit: box.getAttribute('data-fit'),
            font: parseFloat(getComputedStyle(text).fontSize),
            characters: text.textContent.length,
            inside: rect.left >= area.left && rect.right <= area.right && rect.top >= area.top && rect.bottom <= area.bottom,
            range: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom },
            area: { left: area.left, top: area.top, right: area.right, bottom: area.bottom },
            image: document.getElementById('foto').getAttribute('data-image'),
            ellipsis: /\u2026|\.{3,}|\.\s+\.\s*\./.test(text.textContent)
        };
    });
}

async function waitAge(page, age) {
    await page.waitForFunction(value => {
        const loaded = window.__displayValidation.events.find(event => event.method === 'loaded');
        return loaded && Date.now() - loaded.time >= value;
    }, age, { timeout: 20000, polling: 20 });
}

async function phase(page, age, filename) {
    await waitAge(page, age);
    const sample = await page.evaluate(() => ({
        name: document.body.className,
        age: Date.now() - window.__displayValidation.events.find(event => event.method === 'loaded').time,
        stage: Number(getComputedStyle(document.getElementById('stage')).opacity),
        brand: Number(getComputedStyle(document.getElementById('brand')).opacity),
        news: Number(getComputedStyle(document.getElementById('noticia')).opacity),
        text: Number(getComputedStyle(document.getElementById('texto-wrap')).opacity),
        wordmark: document.querySelectorAll('#brand-logo svg path').length
    }));
    await page.screenshot({ path: filename });
    return sample;
}

async function runCase(browser, format, scenario, output, record) {
    const context = await browser.newContext({ viewport: { width: format.width, height: format.height }, deviceScaleFactor: 1 });
    const result = { format: format.format, scenario, issues: [], phases: [], visualReview: 'pending', runtimeHomologation: 'pending' };
    try {
        result.assets = [await verifyServed(template, url)];
        await context.addInitScript(observePlaylist);
        await context.addInitScript(fixture, { name: scenario, text: longText, record });
        await context.route('**/*', async route => {
            const address = new URL(route.request().url());
            if (!['http://localhost:12099', 'http://127.0.0.1:13199'].includes(address.origin)) {
                result.issues.push('Origem nao autorizada: ' + address.origin);
                return route.abort();
            }
            if (address.pathname === '/favicon.ico') return route.fulfill({ status: 204 });
            if (address.pathname.endsWith('/__populari_broken_image__')) {
                return route.fulfill({ status: 200, contentType: 'text/plain', body: 'invalid image fixture' });
            }
            return route.continue();
        });
        const page = await context.newPage();
        page.on('pageerror', error => result.issues.push(error.message));
        page.on('response', response => {
            if (response.status() >= 400) result.issues.push('HTTP ' + response.status() + ': ' + response.url());
        });
        page.on('requestfailed', request => result.issues.push('Falha de rede: ' + request.url()));
        await page.goto(url, { waitUntil: 'load' });
        if (scenario === 'reload-agressivo') {
            for (const delay of [35, 120, 350]) {
                await page.waitForTimeout(delay);
                await page.reload({ waitUntil: 'domcontentloaded' });
            }
            result.reloads = 3;
        }
        const prefix = path.join(output, format.format + '-' + scenario);
        if (scenario === 'dados-reais') result.phases.push(await phase(page, 400, prefix + '-intro.png'));
        await waitAge(page, 1500);
        const inspection = await page.evaluate(inspectPage, profile);
        result.viewport = inspection.viewport;
        result.issues.push(...inspection.issues.filter(issue => !(scenario === 'imagem-quebrada' && issue.includes('__populari_broken_image__'))));
        for (const asset of inspection.assets.concat([
            new URL('img/logo_populari.png', url).href,
            new URL('img/logo-dark.svg', url).href,
            new URL('css/fonts/PlusJakartaSans-VariableFont_wght.ttf', url).href
        ])) result.assets.push(await verifyServed(template, asset));
        if (inspection.viewport.width !== format.width || inspection.viewport.height !== format.height) result.issues.push('Viewport divergente');
        result.text = await textGeometry(page);
        if (!result.text.inside || result.text.fit !== 'ok') result.issues.push('Texto fora da area segura');
        if (scenario === 'reticencias-na-origem' && await page.locator('#texto').textContent() !== 'Noticia cortada na origem\u2026') {
            result.issues.push('Texto da origem alterado ou omitido');
        }
        if (scenario === 'imagem-quebrada' && result.text.image !== 'fallback') result.issues.push('Fallback da foto nao aplicado');
        if (scenario === 'texto-longo' && await page.locator('#texto').textContent() !== longText) result.issues.push('Texto foi alterado/truncado');
        await page.screenshot({ path: prefix + '-noticia.png' });
        if (scenario === 'dados-reais') {
            result.phases.push(await phase(page, 9000, prefix + '-saida.png'));
            result.phases.push(await phase(page, 9500, prefix + '-outro.png'));
            result.phases.push(await phase(page, 9820, prefix + '-fade.png'));
            const exit = result.phases[1];
            const outro = result.phases[2];
            const fade = result.phases[3];
            if (result.phases.some(sample => sample.wordmark < 1)) result.issues.push('Logo nominal SVG ausente');
            if (exit.name.indexOf('text-out') < 0 || !(exit.text > 0 && exit.text < 1)) result.issues.push('Saida sem fade intermediario');
            if (outro.name.indexOf('outro') < 0 || !(outro.brand > 0 && outro.brand < 1)) result.issues.push('Encerramento sem crossfade');
            if (!(fade.stage > 0 && fade.stage < 1)) result.issues.push('Fade final sem estado intermediario');
        }
        await page.waitForFunction(() => window.__displayValidation.events.some(event => event.method === 'finished'), null, { timeout: 20000 });
        result.playlist = await page.evaluate(() => window.__displayValidation.events);
        result.issues.push(...checkCycle(result.playlist));
        const loaded = result.playlist.find(event => event.method === 'loaded');
        const finished = result.playlist.find(event => event.method === 'finished');
        result.duration = finished && loaded ? finished.time - loaded.time : null;
        if (result.duration < 9995 || result.duration > 10200) result.issues.push('Duracao fora da tolerancia de 10s: ' + result.duration);
        result.status = result.issues.length ? 'failed' : 'passed';
    } catch (error) {
        result.issues.push(error.message);
        result.status = 'blocked';
    } finally { await context.close(); }
    return result;
}

async function main() {
    const output = path.resolve(process.argv[2] || '.validation/populari-10s-' + Date.now());
    if (fs.existsSync(output)) throw new Error('Saida existente; escolher pasta nova.');
    if (!path.relative(template, output).startsWith('..')) throw new Error('Evidencias devem ficar fora do runtime.');
    const matrix = loadMatrix({ formats });
    const reloadOnly = process.argv.includes('--reload-only');
    const ellipsisOnly = process.argv.includes('--ellipsis-only');
    const record = (process.argv.find(argument => argument.startsWith('--record=')) || '').slice('--record='.length);
    await verifyServed(template, url);
    fs.mkdirSync(output, { recursive: true });
    const report = { url, matrix, record: record || null, expected: reloadOnly || ellipsisOnly ? 5 : 15,
        executed: 0, cases: [], visualReview: 'pending', runtimeHomologation: 'pending' };
    const browser = await chromium.launch({ headless: true });
    report.browser = browser.version();
    try {
        for (const format of matrix.formats) {
            for (const scenario of ellipsisOnly ? ['reticencias-na-origem'] : reloadOnly ? ['reload-agressivo'] : ['dados-reais', 'texto-longo', 'imagem-quebrada']) {
                const result = await runCase(browser, format, scenario, output, record);
                report.cases.push(result);
                report.executed++;
                fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
                console.log(result.format, scenario, result.status, result.duration, JSON.stringify(result.issues));
            }
        }
    } finally { await browser.close(); }
    report.automatedPassed = report.cases.filter(result => result.status === 'passed').length;
    report.automatedComplete = report.automatedPassed === report.expected;
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ output, expected: report.expected, executed: report.executed, passed: report.automatedPassed }));
    process.exitCode = report.automatedComplete ? 0 : 1;
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });