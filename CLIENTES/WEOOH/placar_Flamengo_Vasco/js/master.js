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
        var clock = MatchState.createClock();
        var lastClockText = '';
        var formatName = window.innerWidth / window.innerHeight >= 15 ? 'strip' : 'full';
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
        var resizeTimer;
        var pollGeneration = 0;
        var lastError = '';
        var scenario = /(?:\?|&)scenario=([a-z-]+)/.exec(window.location.search);
        if (scenario && CONFIG.dataset.mode === 'mock') { CONFIG.mock.scenario = scenario[1]; }
        if (HARDWARE_FRACO) { document.body.className = 'hardware-fraco'; }
        aplicarConfigVisual(formatName);

        function diagnostic(message) {
            lastError = message;
            if (window.console) { window.console.warn('[WEOOH] ' + message); }
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

        function fit(element, maxEm, minEm) {
            var lower = minEm;
            var upper = maxEm;
            element.style.fontSize = maxEm + 'em';
            if (element.scrollWidth <= element.clientWidth + 1 && element.scrollHeight <= element.clientHeight + 1) {
                return;
            }
            for (var iteration = 0; iteration < 8; iteration++) {
                var candidate = (lower + upper) / 2;
                element.style.fontSize = candidate + 'em';
                if (element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1) {
                    upper = candidate;
                } else { lower = candidate; }
            }
            element.style.fontSize = lower + 'em';
        }

        function renderTeam(side, snapshot) {
            var team = CONFIG.teams[side];
            document.getElementById(side + '-name').textContent = team.name;
            document.getElementById(side + '-score').textContent = snapshot.teams[team.id].score;
        }

        function renderClock() {
            var text = clock.text(Date.now());
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
            var labels = { NS: 'PR\u00c9-JOGO', '1H': '1\u00ba TEMPO', HT: 'INTERVALO',
                '2H': '2\u00ba TEMPO', FT: 'ENCERRADO', SUSP: 'SUSPENSO', PST: 'ADIADO', ABD: 'INTERROMPIDO' };
            document.getElementById('match-status').textContent = labels[snapshot.status];
            lastClockText = '';
            renderClock();
            var typography = format.typography;
            if (formatName === 'full') {
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
                if (tracker.apply(snapshot, now)) {
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
                if (!stopped) { pollId = setTimeout(poll, CONFIG.timing.pollMs); }
            }
            dataTimer = setTimeout(function () { done(new Error('Data timeout')); }, CONFIG.timing.dataTimeoutMs);
            try {
                if (CONFIG.dataset.mode === 'mock' && MOCK_DATA.enabled) { MOCK_DATA.read(done); }
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
                var nextFormat = window.innerWidth / window.innerHeight >= 15 ? 'strip' : 'full';
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
        try { poll(); if (!stopped) { loadBase(); } }
        catch (failure) { stop('Startup exception: ' + (failure.message || failure)); }
    }

    window.addEventListener('load', function () {
        ebhtml.create2({}, start);
    });
}());