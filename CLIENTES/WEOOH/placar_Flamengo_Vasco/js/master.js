(function () {
    'use strict';
    var HARDWARE_FRACO = /Android/.test(navigator.userAgent) ||
        (navigator.deviceMemory && navigator.deviceMemory <= 1) ||
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) ||
        window.location.search.indexOf('hwfraco=1') !== -1;

    function start(loader) {
        loader.autoloaded = false;
        loader.nodataiserror = false;
        var stage = document.getElementById('stage');
        var overlay = document.getElementById('scoreboard');
        var base = document.getElementById('base-video');
        var alertVideo = document.getElementById('alert-video');
        var tracker = MatchState.createTracker(CONFIG.timing.maxAlertAgeMs);
        // mock 'cycle' acelera o cronometro (CONFIG.mock.speed)
        var clock = MatchState.createClock(function () {
            return CONFIG.dataset.mode === 'mock' && CONFIG.mock.scenario === 'cycle' ? CONFIG.mock.speed : 1;
        });
        var lastClockText = null;
        // proporcao: >=15 faixa, <1 vertical, demais horizontal
        function pickFormat() {
            var ratio = window.innerWidth / window.innerHeight;
            return ratio >= 15 ? 'strip' : ratio < 1 ? 'portrait' : 'full';
        }
        var formatName = pickFormat();
        var format = CONFIG.layout.formats[formatName];
        var loaded = false;
        var stopped = false;
        var baseReady = false;
        var baseLastProgress = Date.now();
        var activeEvent = null;
        var alertStartedAt = 0;
        var alertLastProgress = 0;
        var nextAlertAt = 0;
        var heartbeatId;
        var pollId;
        var dataTimer;
        var displayTimer;
        var resizeTimer;
        var pollGeneration = 0;
        var lastError = '';
        var scenario = /(?:\?|&)scenario=([a-z-]+)/.exec(window.location.search);
        // Teste: ?source=channel&fixture=ID
        var search = window.location.search;
        var fixtureParam = /(?:\?|&)fixture=(\d+)/.exec(search);
        if (/(?:\?|&)source=channel/.test(search)) {
            CONFIG.dataset.mode = 'channel';
            if (fixtureParam) { CONFIG.channel.fixtureId = fixtureParam[1]; }
        }
        if (CONFIG.dataset.mode === 'channel' && typeof ChannelSource !== 'undefined') {
            window.WEOOH_DATA_SOURCE = ChannelSource.create(loader, CONFIG);
        }
        if (scenario && CONFIG.dataset.mode === 'mock') { CONFIG.mock.scenario = scenario[1]; }
        if (HARDWARE_FRACO) { document.body.className = 'hardware-fraco'; }
        aplicarConfigVisual(formatName);

        function diagnostic(message) {
            lastError = message;
            if (window.console) { window.console.warn('[WEOOH] ' + message); }
        }

        var logged = {};
        var lastSummary = '';

        function info(message) {
            if (window.console) { window.console.info('[WEOOH ' + new Date().toTimeString().substr(0, 8) + '] ' + message); }
            try { loader.log('[WEOOH] ' + message); } catch (error) { /* log nunca deve derrubar o player */ }
        }

        // Registra no console mudancas de estado e cada evento (historico na 1a carga, novos depois).
        function logSnapshot(snapshot, first) {
            var ids = [CONFIG.teams.left.id, CONFIG.teams.right.id];
            var summary = snapshot.status + ' ' + snapshot.minute + (snapshot.extra ? '+' + snapshot.extra : '') + "' " +
                (snapshot.teams[ids[0]].name || ids[0]) + ' ' + snapshot.teams[ids[0]].score + 'x' +
                snapshot.teams[ids[1]].score + ' ' + (snapshot.teams[ids[1]].name || ids[1]);
            var shortSummary = summary.replace(/ \d+(\+\d+)?' /, ' ');
            if (shortSummary !== lastSummary) { info('placar: ' + summary); lastSummary = shortSummary; }
            for (var index = 0; index < snapshot.events.length; index++) {
                var event = snapshot.events[index];
                var key = event.id + (event.cancelled ? '|x' : '');
                if (logged[key]) { continue; }
                logged[key] = true;
                info((first ? 'evento (historico, sem alerta): ' : 'EVENTO NOVO: ') + event.type.toUpperCase() + ' ' +
                    event.teamId + " " + event.minute + (event.extra ? '+' + event.extra : '') + "'" +
                    (event.cancelled ? ' [CANCELADO]' : '') + ' id=' + event.id);
            }
        }

        function markLoaded() {
            if (loaded || stopped) { return; }
            loaded = true;
            loader.loaded();
        }

        function stop(reason) {
            if (stopped) { return; }
            diagnostic(reason || 'Stopped');
            clearInterval(heartbeatId);
            clearTimeout(pollId);
            clearTimeout(dataTimer);
            clearTimeout(displayTimer);
            clearTimeout(resizeTimer);
            window.removeEventListener('resize', onResize);
            pollGeneration++;
            overlay.style.opacity = '0';
            alertVideo.style.visibility = 'hidden';
            base.style.visibility = 'hidden';
            base.pause();
            alertVideo.pause();
            if (!loaded) { loaded = true; loader.loaded(); }
            stopped = true;
            setTimeout(function () { loader.finished(); }, 120);
        }

        function play(video, onFailure) {
            try {
                var result = video.play();
                if (result && typeof result.then === 'function') {
                    result.then(function () {}, function () {
                        if (stopped) { return; }
                        video.muted = true;
                        try {
                            var retry = video.play();
                            if (retry && typeof retry.then === 'function') {
                                retry.then(function () {}, onFailure);
                            }
                        } catch (error) { onFailure(); }
                    });
                }
            } catch (error) { onFailure(); }
        }

        // scrollWidth ignora o estouro a esquerda em flex centralizado; mede a largura real do texto.
        function overflows(element) {
            var style = window.getComputedStyle(element);
            var available = element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
            var range = document.createRange();
            range.selectNodeContents(element);
            return range.getBoundingClientRect().width > available ||
                element.scrollHeight > element.clientHeight + 1;
        }

        function fit(element, maxEm, minEm) {
            var lower = minEm;
            var upper = maxEm;
            element.style.fontSize = maxEm + 'em';
            if (!overflows(element)) { return; }
            for (var iteration = 0; iteration < 8; iteration++) {
                var candidate = (lower + upper) / 2;
                element.style.fontSize = candidate + 'em';
                if (overflows(element)) { upper = candidate; } else { lower = candidate; }
            }
            element.style.fontSize = lower + 'em';
        }

        function renderTeam(side, snapshot) {
            var team = CONFIG.teams[side];
            document.getElementById(side + '-name').textContent = snapshot.teams[team.id].name || team.name;
            document.getElementById(side + '-score').textContent = snapshot.teams[team.id].score;
        }

        function renderClock() {
            var current = tracker.current();
            var text = current && current.status === 'NS' && current.kickoff ? current.kickoff : clock.text(Date.now());
            if (text === lastClockText) { return; }
            document.getElementById('match-clock').textContent = text;
            fit(document.getElementById('match-clock'), format.typography.clock, 1.0);
            lastClockText = text;
        }

        function render() {
            var snapshot = tracker.current();
            if (!snapshot || stopped) { return; }
            renderTeam('left', snapshot);
            renderTeam('right', snapshot);
            var labels = { NS: 'IN\u00cdCIO \u00c0S', '1H': '1\u00ba TEMPO', HT: 'INTERVALO',
                '2H': '2\u00ba TEMPO', FT: 'FINALIZADO', SUSP: 'SUSPENSO', PST: 'ADIADO', ABD: 'INTERROMPIDO' };
            document.getElementById('match-status').textContent = labels[snapshot.status];
            lastClockText = null;
            renderClock();
            var typography = format.typography;
            if (formatName !== 'strip') {
                fit(document.getElementById('left-name'), typography.name, 0.7);
                fit(document.getElementById('right-name'), typography.name, 0.7);
                fit(document.getElementById('match-status'), typography.status, 0.55);
            }
            var scores = stage.querySelectorAll('.score');
            for (var scoreIndex = 0; scoreIndex < scores.length; scoreIndex++) {
                fit(scores[scoreIndex], typography.score, 1.4);
            }
        }

        function revealBase() {
            if (stopped || !baseReady || !tracker.current()) { return; }
            overlay.style.opacity = '1';
            markLoaded();
        }

        function finishAlert() {
            if (!activeEvent || stopped) { return; }
            activeEvent = null;
            alertVideo.style.visibility = 'hidden';
            alertVideo.pause();
            alertVideo.removeAttribute('src');
            alertVideo.load();
            nextAlertAt = Date.now() + CONFIG.timing.baseBetweenAlertsMs;
            render();
            revealBase();
        }

        function showAlert(event) {
            activeEvent = event;
            info('ALERTA disparado: ' + event.type.toUpperCase() + ' ' + event.teamId + ' ' + event.minute + "'");
            alertStartedAt = Date.now();
            alertLastProgress = alertStartedAt;
            alertVideo.muted = CONFIG.audio.muted;
            alertVideo.src = CONFIG.mediaPrefix + format.media[event.type][event.teamId];
            alertVideo.load();
            play(alertVideo, finishAlert);
        }

        function receive(error, raw) {
            if (stopped) { return; }
            try {
                if (error || !raw) { throw error || new Error('Empty match snapshot'); }
                var snapshot = MatchState.normalize(raw, CONFIG.teams);
                var now = Date.now();
                if (now - snapshot.updatedAt > CONFIG.timing.maxDataAgeMs || snapshot.updatedAt > now + 5000) {
                    throw new Error('Stale or future match snapshot');
                }
                var firstSnapshot = !tracker.current();
                if (tracker.apply(snapshot, now)) {
                    logSnapshot(snapshot, firstSnapshot);
                    clock.sync(snapshot);
                    render();
                    if (!activeEvent) { revealBase(); }
                    if (activeEvent) {
                        var valid = false;
                        for (var index = 0; index < snapshot.events.length; index++) {
                            if (snapshot.events[index].id === activeEvent.id && !snapshot.events[index].cancelled) { valid = true; }
                        }
                        if (!valid) { finishAlert(); }
                    }
                }
            } catch (failure) {
                diagnostic(failure.message || String(failure));
                if (!tracker.current()) { stop('No valid initial data'); }
            }
        }

        function poll() {
            if (stopped) { return; }
            var generation = ++pollGeneration;
            var settled = false;
            function done(error, snapshot) {
                if (settled || stopped || generation !== pollGeneration) { return; }
                settled = true;
                clearTimeout(dataTimer);
                receive(error, snapshot);
                if (!stopped) { pollId = setTimeout(poll, CONFIG.dataset.mode === 'channel' ? CONFIG.channel.pollMs : CONFIG.timing.pollMs); }
            }
            dataTimer = setTimeout(function () { done(new Error('Data timeout')); }, CONFIG.timing.dataTimeoutMs);
            try {
                if (CONFIG.dataset.mode === 'mock' && typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) { MOCK_DATA.read(done); }
                else if (CONFIG.dataset.mode === 'channel' && typeof window.WEOOH_DATA_SOURCE === 'function') {
                    window.WEOOH_DATA_SOURCE(done);
                } else { done(new Error('Data source not configured; no automatic mock fallback')); }
            } catch (error) { done(error); }
        }

        function loadBase() {
            baseReady = false;
            baseLastProgress = Date.now();
            base.muted = CONFIG.audio.muted;
            base.src = CONFIG.mediaPrefix + format.media.base;
            base.load();
            play(base, function () { if (!stopped) { stop('Base playback rejected'); } });
        }

        function onResize() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                if (stopped) { return; }
                var nextFormat = pickFormat();
                if (nextFormat !== formatName) {
                    finishAlert();
                    overlay.style.opacity = '0';
                    formatName = nextFormat;
                    format = CONFIG.layout.formats[formatName];
                    aplicarConfigVisual(formatName);
                    loadBase();
                } else { aplicarConfigVisual(formatName); }
                render();
            }, 180);
        }

        base.onplaying = function () {
            if (stopped) { return; }
            baseReady = true;
            baseLastProgress = Date.now();
            if (!activeEvent) { revealBase(); }
        };
        base.ontimeupdate = function () { baseLastProgress = Date.now(); };
        base.onerror = function () { if (!stopped) { stop('Base media failed'); } };
        alertVideo.onplaying = function () {
            if (!activeEvent || stopped) { return; }
            alertLastProgress = Date.now();
            alertVideo.style.visibility = 'visible';
            overlay.style.opacity = '0';
        };
        alertVideo.ontimeupdate = function () {
            if (!activeEvent) { return; }
            alertLastProgress = Date.now();
            if (isFinite(alertVideo.duration) && alertVideo.duration > 0 &&
                    alertVideo.currentTime >= alertVideo.duration - 0.08) { finishAlert(); }
        };
        alertVideo.onended = finishAlert;
        alertVideo.onerror = function () { if (activeEvent) { diagnostic('Alert media failed'); finishAlert(); } };

        window.WEOOH_PLAYER = {
            stop: stop,
            state: function () {
                return { format: formatName, loaded: loaded, stopped: stopped, pending: tracker.pending(),
                    activeEvent: activeEvent, snapshot: tracker.current(), lastError: lastError };
            }
        };
        window.addEventListener('resize', onResize);
        // A primeira medicao pode ocorrer antes da fonte Placar carregar; refaz quando estiver pronta.
        if (document.fonts) {
            document.fonts.onloadingdone = function () { if (!stopped) { render(); } };
            if (document.fonts.load) { document.fonts.load('900 1em Placar').then(function () { if (!stopped) { render(); } }, function () {}); }
        }
        heartbeatId = setInterval(function () {
            if (stopped) { return; }
            try {
                var now = Date.now();
                var snapshot = tracker.current();
                if (now - baseLastProgress > (baseReady ? CONFIG.timing.mediaStallMs : CONFIG.timing.mediaTimeoutMs)) {
                    stop('Base media watchdog'); return;
                }
                if (snapshot && now - snapshot.updatedAt > CONFIG.timing.maxDataAgeMs) {
                    stop('Match data expired'); return;
                }
                if (activeEvent && (now - alertStartedAt > CONFIG.timing.mediaTimeoutMs ||
                        now - alertLastProgress > CONFIG.timing.mediaStallMs)) {
                    diagnostic('Alert media watchdog'); finishAlert();
                }
                if (!activeEvent && baseReady && loaded && now >= nextAlertAt) {
                    var event = tracker.next(now);
                    if (event) { showAlert(event); }
                }
                if (snapshot) { renderClock(); }
            } catch (failure) { stop('Runtime exception: ' + (failure.message || failure)); }
        }, 250);
        displayTimer = setTimeout(function () { stop('Display time limit reached'); }, CONFIG.timing.displayMs);
        try { poll(); if (!stopped) { loadBase(); } }
        catch (failure) { stop('Startup exception: ' + (failure.message || failure)); }
    }

    window.addEventListener('load', function () {
        ebhtml.create2({}, start);
    });
}());