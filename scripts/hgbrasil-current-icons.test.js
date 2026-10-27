'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var fs = require('node:fs');
var path = require('node:path');
var vm = require('node:vm');

var conditions = {
    storm: 'thunderstorms-rain',
    snow: 'snow',
    rain: 'rain',
    fog: 'fog',
    hail: 'hail',
    cloud: 'cloudy',
    clear_night: 'clear-night',
    cloudly_day: 'partly-cloudy-day',
    cloudly_night: 'partly-cloudy-night',
    clear_day: 'clear-day'
};

function createHarness(template, fields) {
    var nodes = {};
    var timers = [];
    var events = [];
    var time = Date.now();
    function element(id) {
        if (!nodes[id]) {
            nodes[id] = {
                style: { setProperty: function () {} },
                classList: { add: function () {}, remove: function () {}, toggle: function () {} },
                querySelector: function () { return this.svg || null; },
                innerHTML: ''
            };
        }
        return nodes[id];
    }
    var item = { value: function (field) { return { value: fields && fields[field] || '' }; } };
    var loader = {
        addData: function () {},
        load: function (done) { done(); },
        data: function () { return item; },
        loaded: function () { events.push('loaded'); },
        finished: function () { events.push('finished'); }
    };
    var context = vm.createContext({
        console: { log: function () {}, warn: function () {}, error: function () {} },
        window: { location: { search: '' }, innerWidth: 1920, innerHeight: 1080, addEventListener: function () {} },
        navigator: { userAgent: 'test' },
        document: { body: element('body'), getElementById: element, querySelector: element, querySelectorAll: function () { return []; } },
        CONFIG_CLIMA: { duration: 10000, sponsorEnabled: false },
        ebhtml: { create2: function (config, done) { done(loader); } },
        now: function () { return time; },
        setTimeout: function (callback, delay) {
            var timer = { callback: callback, at: time + delay };
            timers.push(timer);
            return timer;
        },
        clearTimeout: function (timer) { if (timer) timer.cancelled = true; }
    });
    vm.runInContext('Date.now = now;', context);
    ['provider-hgbrasil.js', 'master.js'].forEach(function (file) {
        var filename = path.resolve(__dirname, '../GLOBAL', template, 'js', file);
        vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename: filename });
    });
    return {
        context: context,
        nodes: nodes,
        loader: loader,
        events: events,
        flush: function () {
            var iterations = 0;
            while (timers.length) {
                assert.ok(iterations++ < 1000, 'timer loop must terminate');
                timers.sort(function (first, second) { return first.at - second.at; });
                var timer = timers.shift();
                if (!timer.cancelled) {
                    time = timer.at;
                    timer.callback();
                }
            }
        }
    };
}

function weatherRecord(slug) {
    return {
        city: { ds_name_cit: 'Cidade teste' },
        nr_icon_wea: '1',
        mm_textpt_wea: slug,
        nr_value_wea: '20',
        nr_max_wea: '27',
        nr_min_wea: '15',
        ds_textmin_wea: 'Sol',
        nr_humiditymin_wea: '61',
        nr_windavgvelocity_wea: '22'
    };
}

Object.keys(conditions).forEach(function (slug) {
    test('HG Brasil ' + slug + ': previsao independente do header, momento e relogio', function () {
        var record = weatherRecord(slug);
        var fields = {
            DATE1: '2026-10-27', DATE2: '2026-10-28', DATE3: '2026-10-29',
            C1_D1_DATAARRAY: JSON.stringify([record]),
            C1_D2_DATAARRAY: JSON.stringify([Object.assign({}, record, { nr_icon_wea: '4' })]),
            C1_D3_DATAARRAY: JSON.stringify([Object.assign({}, record, { nr_icon_wea: '11' })])
        };
        var forecast = createHarness('previsao_tempo', fields);
        var forecastData;
        forecast.context.aplicarVisibilidadeDescricao = function () {};
        forecast.context.iniciarTemplate = function (data) { forecastData = data; };
        forecast.context.window.onload();
        assert.deepEqual(Array.from(forecastData, function (day) { return day.ICON; }), ['1', '4', '11']);
        assert.deepEqual(Array.from(forecastData, function (day) { return forecast.context.codigoParaMeteocon(day.ICON); }), ['clear-day', 'cloudy', 'overcast-rain']);
        assert.equal(forecastData[0].ICON_ATUAL, slug);
        assert.equal(forecastData[1].ICON_ATUAL, '');
        assert.equal(forecastData[2].ICON_ATUAL, '');
        var injected;
        forecast.context.injetarMeteocon = function (target, icon) { injected = icon; target.svg = {}; };
        var completed = 0;
        forecast.context.aplicarIconeAtualNoBadge(forecastData[0].ICON_ATUAL, '#fff', function () { completed++; });
        assert.equal(injected, conditions[slug]);
        assert.equal(completed, 1);

        var moment = createHarness('tempo_momento', fields);
        var momentData;
        moment.context.applySponsorFooter = function () {};
        moment.context.iniciarTemplate = function (data) { momentData = data; };
        moment.context.window.onload();
        assert.ok(momentData, 'real loader parser must reach render');
        assert.equal(momentData.ICON, slug);
        assert.equal(moment.context.hgBrasilMomentoParaMeteocon(momentData.ICON), conditions[slug]);
        assert.equal(momentData.VIDEO_ICON, moment.context.hgBrasilMomentoParaVideo(slug));
        assert.equal(momentData.DESCRICAO, record.ds_textmin_wea);
        assert.equal(momentData.TEMP_ATUAL, '20');

        var clock = createHarness('hora_certa');
        clock.context.injetarMeteocon = function (target, icon) {
            if (target === clock.nodes.weatherTempIcon) injected = icon;
        };
        clock.context.renderWeather(record);
        assert.equal(injected, conditions[slug]);
        assert.equal(clock.nodes.weatherTemp.textContent, '20\u00b0C');
        assert.equal(clock.nodes.weatherRow.style.display, 'flex');
    });
});

['', 'unknown-condition', undefined].forEach(function (slug) {
    [false, true].forEach(function (weakHardware) {
        test('header fallback e timeout sem bloquear playlist: ' + slug + ', hardware fraco=' + weakHardware, function () {
            var harness = createHarness('previsao_tempo');
            harness.context.HARDWARE_FRACO = weakHardware;
            var injected;
            harness.context.injetarMeteocon = function (target, icon) { injected = icon; };
            harness.context.aplicarIconeAtualNoBadge(slug, '#fff', function () {
                harness.context.sinalizarLoaded(harness.loader);
                harness.loader.finished();
            });
            harness.flush();
            assert.equal(injected, 'not-available');
            assert.deepEqual(harness.events, ['loaded', 'finished']);
            var moment = createHarness('tempo_momento');
            assert.equal(moment.context.hgBrasilMomentoParaMeteocon(slug), 'not-available');
            var clock = createHarness('hora_certa');
            assert.equal(clock.context.horaCertaHgBrasilParaMeteocon(slug), 'not-available');
        });
    });
});

test('HG Brasil preserva video noturno e normalizacao de slug', function () {
    var harness = createHarness('tempo_momento');
    assert.equal(harness.context.hgBrasilMomentoParaVideo('clear_night'), '1n');
    assert.equal(harness.context.hgBrasilMomentoParaVideo('cloudly_night'), '2n');
    assert.equal(harness.context.hgBrasilMomentoParaMeteocon(' RAIN '), 'rain');
});

test('momento usa condicao atual apenas como fallback da descricao', function () {
    var record = weatherRecord('rain');
    delete record.ds_textmin_wea;
    var harness = createHarness('tempo_momento', { C1_D1_DATAARRAY: JSON.stringify([record]) });
    var data;
    harness.context.applySponsorFooter = function () {};
    harness.context.iniciarTemplate = function (parsed) { data = parsed; };
    harness.context.window.onload();
    assert.equal(data.DESCRICAO, 'Chuva');
});

[false, true].forEach(function (enabled) {
    test('hora certa respeita climateEnabled=' + enabled + ' e finaliza uma vez', function () {
        var record = weatherRecord('rain');
        record.dt_upd_wea = String(Math.floor(Date.now() / 1000));
        var harness = createHarness('hora_certa', { C1_D1_DATAARRAY: JSON.stringify([record]) });
        harness.context.CLOCK_CONFIG.climateEnabled = enabled;
        harness.context.startClockFlow = function () {};
        harness.context.applySpdHeader = function () {};
        var injected = [];
        harness.context.injetarMeteocon = function (target, icon) { injected.push(icon); };
        harness.context.initWithEbhtml();
        harness.flush();
        assert.deepEqual(harness.events, ['loaded', 'finished']);
        assert.equal(harness.nodes.weatherRow.style.display, enabled ? 'flex' : 'none');
        assert.equal(injected.indexOf('rain') !== -1, enabled);
    });
});

test('todos os slugs HG Brasil possuem SVG local nos tres templates', function () {
    ['previsao_tempo', 'tempo_momento', 'hora_certa'].forEach(function (template) {
        Object.keys(conditions).forEach(function (slug) {
            var file = path.resolve(__dirname, '../GLOBAL', template, 'img/meteocons/fill', conditions[slug] + '.svg');
            assert.ok(fs.existsSync(file), file);
        });
    });
});