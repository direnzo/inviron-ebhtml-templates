const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const template = path.join(root, 'CLIENTES/WEOOH/placar_Flamengo_Vasco');
const output = path.join(root, '.validation/weooh-initial');
const url = 'http://localhost:12099/FILES/1/index.html';
const formats = [{ width: 1920, height: 1080 }, { width: 2048, height: 128 }];
let browser;

before(async () => {
    fs.mkdirSync(output, { recursive: true });
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const request = await browser.newContext();
    try {
        for (const asset of ['index.html', 'js/config.js', 'js/master.js', 'js/match-state.js',
            'js/mock-data.js', 'js/ebhtml.js', 'css/master.css']) {
            const response = await request.request.get(new URL(asset, url).href);
            assert.equal(response.status(), 200, asset);
            assert.deepEqual(await response.body(), fs.readFileSync(path.join(template, asset)),
                'Slot must serve edited file: ' + asset);
        }
    } finally { await request.close(); }
});

after(async () => { if (browser) await browser.close(); });

async function open(size, scenario = 'score', overrides = '') {
    const page = await browser.newPage({ viewport: size });
    const errors = [];
    const lifecycle = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
        if (message.text().indexOf('__weooh:') === 0) lifecycle.push('[' + message.text().slice(8) + ']');
    });
    await page.addInitScript(() => {
        let api;
        Object.defineProperty(window, 'ebhtml', {
            configurable: true,
            get() { return api; },
            set(value) {
                api = value;
                const create = value.create2;
                value.create2 = function (config, callback) {
                    return create.call(value, config, function (loader) {
                        for (const method of ['loaded', 'finished']) {
                            const original = loader[method];
                            loader[method] = function () {
                                console.debug('__weooh:' + method);
                                return original.apply(this, arguments);
                            };
                        }
                        callback(loader);
                    });
                };
            }
        });
    });
    if (overrides) {
        await page.route('**/js/config.js', route => route.fulfill({ contentType: 'text/javascript',
            body: fs.readFileSync(path.join(template, 'js/config.js'), 'utf8') + '\n' + overrides }));
    }
    await page.goto(url + '?scenario=' + scenario);
    await page.waitForFunction(() => window.WEOOH_PLAYER &&
        (WEOOH_PLAYER.state().loaded || WEOOH_PLAYER.state().stopped));
    await page.evaluate(() => document.fonts.ready);
    return { page, errors, lifecycle };
}

test('all configured media exist and canonical EBHTML is unchanged', () => {
    const context = {};
    vm.runInNewContext(fs.readFileSync(path.join(template, 'js/config.js'), 'utf8'), context);
    const config = context.CONFIG;
    let count = 0;
    for (const format of Object.values(config.layout.formats)) {
        const files = [format.media.base, ...Object.values(format.media.goal),
            ...Object.values(format.media.yellow), ...Object.values(format.media.red)];
        for (const file of files) {
            assert.ok(fs.statSync(path.join(template, config.mediaPrefix + file)).size > 0);
            count++;
        }
    }
    assert.equal(count, 14);
    assert.deepEqual(fs.readFileSync(path.join(template, 'js/ebhtml.js')),
        fs.readFileSync(path.join(root, '_template-base/js/ebhtml.js')));
});

for (const size of formats) {
    const label = size.width + 'x' + size.height;
    test(label + ': real video, simplified regions and heavy score font', async () => {
        const { page, errors, lifecycle } = await open(size);
        try {
            const initialState = await page.evaluate(() => WEOOH_PLAYER.state());
            assert.equal(initialState.stopped, false, JSON.stringify(initialState));
            assert.equal(await page.evaluate(() => innerWidth), size.width);
            assert.equal(await page.evaluate(() => innerHeight), size.height);
            assert.ok(await page.evaluate(() => document.querySelector('#base-video').readyState >= 2));
            const firstTime = await page.locator('#base-video').evaluate(video => video.currentTime);
            await page.waitForFunction(time => document.querySelector('#base-video').currentTime > time + 0.2, firstTime);
            await page.screenshot({ path: path.join(output, label + '-score.png') });
            const overflow = await page.evaluate(() => Array.from(document.querySelectorAll('.region, .score'))
                .filter(element => element.getBoundingClientRect().width > 0 && element.getBoundingClientRect().height > 0)
                .filter(element => element.scrollWidth > element.clientWidth + 2 || element.scrollHeight > element.clientHeight + 2)
                .map(element => ({ id: element.id, text: element.textContent })));
            assert.deepEqual(overflow, [], 'No text overflow');
            assert.equal(await page.locator('#left-score').textContent(), '6');
            assert.equal(await page.locator('#right-score').textContent(), '6');
            assert.equal(await page.locator('#left-score').evaluate(element => getComputedStyle(element).fontWeight), '900');
            assert.ok(await page.evaluate(() => document.fonts.check('900 24px Placar')));
            if (size.height === 128) {
                assert.equal(await page.locator('#left-name').isVisible(), false);
                assert.equal(await page.locator('#right-name').isVisible(), false);
                assert.equal(await page.locator('#match-status').isVisible(), false);
                assert.equal(await page.locator('#match-clock').isVisible(), true);
            }
            assert.deepEqual(errors, []);
            assert.deepEqual(lifecycle, ['[loaded]']);
            await page.evaluate(() => WEOOH_PLAYER.stop('test complete'));
            await page.waitForFunction(() => WEOOH_PLAYER.state().stopped);
            await assertEventually(() => assert.deepEqual(lifecycle, ['[loaded]', '[finished]']), page);
        } finally { await page.close(); }
    });

    test(label + ': all six real alert videos play once and return to base', { timeout: 120000 }, async () => {
        const { page, errors, lifecycle } = await open(size, 'demo',
            'CONFIG.mock.stepMs=1800; CONFIG.timing.pollMs=150; CONFIG.timing.maxAlertAgeMs=120000;');
        try {
            await page.waitForFunction(() => WEOOH_PLAYER.state().activeEvent &&
                document.querySelector('#alert-video').style.visibility === 'visible');
            await page.screenshot({ path: path.join(output, label + '-goal-alert.png') });
            await page.waitForFunction(() => {
                window.observedAlerts = window.observedAlerts || [];
                const event = WEOOH_PLAYER.state().activeEvent;
                if (event && document.querySelector('#alert-video').style.visibility === 'visible' &&
                    observedAlerts.indexOf(event.id) < 0) observedAlerts.push(event.id);
                return observedAlerts.length === 6 && !event && !WEOOH_PLAYER.state().pending &&
                    getComputedStyle(document.querySelector('#scoreboard')).opacity === '1';
            }, {}, { timeout: 100000, polling: 50 });
            assert.equal(await page.evaluate(() => WEOOH_PLAYER.state().stopped), false);
            assert.equal(await page.locator('#scoreboard').evaluate(element => getComputedStyle(element).opacity), '1');
            assert.deepEqual(await page.evaluate(() => observedAlerts), [
                'mock-goal-vasco', 'mock-yellow-flamengo', 'mock-goal-flamengo',
                'mock-yellow-vasco', 'mock-red-flamengo', 'mock-red-vasco'
            ]);
            assert.deepEqual(errors, []);
            assert.deepEqual(lifecycle, ['[loaded]']);
        } finally { await page.close(); }
    });

    test(label + ': clock ticks, freezes at interval and fits double-digit scores', async () => {
        const { page, errors } = await open(size, 'score', 'CONFIG.timing.pollMs=200;');
        try {
            const first = await page.locator('#match-clock').textContent();
            assert.match(first, /^\d{2,3}:\d{2}$/);
            await page.waitForFunction(text => document.querySelector('#match-clock').textContent !== text, first);
            await page.evaluate(() => { CONFIG.mock.scenario = 'halftime'; });
            await page.waitForFunction(() => WEOOH_PLAYER.state().snapshot.status === 'HT');
            const updated = await page.evaluate(() => WEOOH_PLAYER.state().snapshot.updatedAt);
            await page.waitForFunction(time => WEOOH_PLAYER.state().snapshot.updatedAt > time + 1200, updated);
            assert.equal(await page.locator('#match-clock').textContent(), '45:00');
            if (size.height === 1080) assert.equal(await page.locator('#match-status').textContent(), 'INTERVALO');
            else assert.equal(await page.locator('#match-status').isVisible(), false);
            await page.screenshot({ path: path.join(output, label + '-interval.png') });
            await page.evaluate(() => { CONFIG.mock.scenario = 'double-digit'; });
            await page.waitForFunction(() => document.querySelector('#left-score').textContent === '12');
            assert.equal(await page.locator('#right-score').textContent(), '10');
            const overflow = await page.evaluate(() => Array.from(document.querySelectorAll('.region, .score'))
                .filter(element => element.getBoundingClientRect().width > 0 && element.getBoundingClientRect().height > 0)
                .filter(element => element.scrollWidth > element.clientWidth + 2 || element.scrollHeight > element.clientHeight + 2)
                .map(element => element.id));
            assert.deepEqual(overflow, []);
            await page.screenshot({ path: path.join(output, label + '-double-digit.png') });
            assert.deepEqual(errors, []);
        } finally { await page.close(); }
    });
}

test('invalid initial data and missing base finish safely once', async () => {
    const cases = [['empty', 'empty', ''], ['invalid', 'invalid', ''], ['stale', 'stale', ''],
        ['network-error', 'network-error', ''],
        ['broken-base', 'score', "CONFIG.layout.formats.full.media.base='missing.mp4';"]];
    for (const [label, scenario, overrides] of cases) {
        const { page, lifecycle, errors } = await open(formats[0], scenario, overrides);
        try {
            assert.equal(await page.evaluate(() => WEOOH_PLAYER.state().stopped), true, label);
            await assertEventually(() => assert.deepEqual(lifecycle, ['[loaded]', '[finished]']), page);
            assert.deepEqual(errors, []);
        } finally { await page.close(); }
    }
});

test('missing alert recovers to base, stale snapshot expires, repeated stop is idempotent', async () => {
    const { page, lifecycle, errors } = await open(formats[0], 'demo',
        "CONFIG.mock.stepMs=1000; CONFIG.timing.pollMs=100; CONFIG.layout.formats.full.media.goal.vasco='missing.mp4';");
    try {
        await page.waitForFunction(() => WEOOH_PLAYER.state().lastError === 'Alert media failed');
        assert.equal(await page.evaluate(() => WEOOH_PLAYER.state().stopped), false);
        await page.evaluate(() => {
            CONFIG.timing.maxDataAgeMs = 100;
            MOCK_DATA.read = function (callback) { callback(new Error('offline')); };
        });
        await page.waitForFunction(() => WEOOH_PLAYER.state().stopped);
        await page.evaluate(() => { WEOOH_PLAYER.stop(); WEOOH_PLAYER.stop(); });
        await assertEventually(() => assert.deepEqual(lifecycle, ['[loaded]', '[finished]']), page);
        assert.deepEqual(errors, []);
    } finally { await page.close(); }
});

test('alert watchdog recovers and base watchdog safely ends the session', async () => {
    const { page, lifecycle, errors } = await open(formats[0], 'demo',
        'CONFIG.mock.stepMs=1000; CONFIG.timing.pollMs=100;');
    try {
        await page.waitForFunction(() => WEOOH_PLAYER.state().activeEvent &&
            document.querySelector('#alert-video').style.visibility === 'visible');
        await page.evaluate(() => {
            CONFIG.timing.mediaStallMs = 1000;
            const video = document.querySelector('#alert-video');
            video.ontimeupdate = null;
            video.pause();
        });
        await page.waitForFunction(() => WEOOH_PLAYER.state().lastError === 'Alert media watchdog');
        assert.equal(await page.evaluate(() => WEOOH_PLAYER.state().stopped), false);
        await page.evaluate(() => document.querySelector('#base-video').pause());
        await page.waitForFunction(() => WEOOH_PLAYER.state().stopped);
        await assertEventually(() => assert.deepEqual(lifecycle, ['[loaded]', '[finished]']), page);
        assert.deepEqual(errors, []);
    } finally { await page.close(); }
});

test('reloads and weak hardware do not replay history or leave a stopped player', async () => {
    const { page, errors } = await open(formats[0], 'score');
    try {
        for (let count = 0; count < 4; count++) {
            await page.reload({ waitUntil: 'domcontentloaded' });
            await page.waitForFunction(() => window.WEOOH_PLAYER && WEOOH_PLAYER.state().loaded);
            assert.equal(await page.evaluate(() => WEOOH_PLAYER.state().stopped), false);
            assert.equal(await page.evaluate(() => WEOOH_PLAYER.state().pending), 0);
        }
        await page.goto(url + '?scenario=score&hwfraco=1');
        await page.waitForFunction(() => window.WEOOH_PLAYER && WEOOH_PLAYER.state().loaded);
        assert.equal(await page.locator('body').evaluate(element => element.className), 'hardware-fraco');
        assert.equal(await page.evaluate(() => WEOOH_PLAYER.state().stopped), false);
        assert.deepEqual(errors, []);
    } finally { await page.close(); }
});

async function assertEventually(check, page) {
    await page.waitForFunction(() => WEOOH_PLAYER.state().stopped);
    await new Promise(resolve => setTimeout(resolve, 200));
    check();
}