var MOCK_DATA = (function () {
    'use strict';
    var startedAt = Date.now();
    var definitions = [
        { id: 'mock-goal-vasco', type: 'goal', teamId: 'vasco', minute: 13 },
        { id: 'mock-yellow-flamengo', type: 'yellow', teamId: 'flamengo', minute: 17 },
        { id: 'mock-goal-flamengo', type: 'goal', teamId: 'flamengo', minute: 24 },
        { id: 'mock-yellow-vasco', type: 'yellow', teamId: 'vasco', minute: 28 },
        { id: 'mock-red-flamengo', type: 'red', teamId: 'flamengo', minute: 36 },
        { id: 'mock-red-vasco', type: 'red', teamId: 'vasco', minute: 40 }
    ];


    // Ciclo completo acelerado: tempos em segundos de jogo (at); 1T 45+3, 2T 90+4
    var cycleEvents = [
        { type: 'goal', teamId: 'vasco', at: 13 * 60 }, { type: 'yellow', teamId: 'flamengo', at: 17 * 60 },
        { type: 'goal', teamId: 'flamengo', at: 24 * 60 }, { type: 'yellow', teamId: 'vasco', at: 28 * 60 },
        { type: 'red', teamId: 'flamengo', at: 36 * 60 }, { type: 'goal', teamId: 'vasco', at: 45 * 60 + 30 },
        { type: 'yellow', teamId: 'vasco', at: 55 * 60 }, { type: 'goal', teamId: 'flamengo', at: 63 * 60 },
        { type: 'red', teamId: 'vasco', at: 78 * 60 }, { type: 'goal', teamId: 'vasco', at: 90 * 60 + 90 }
    ];
    var FIRST_END = 48 * 60;   // 45 + 3 de acrescimo
    var SECOND_START = 45 * 60;
    var SECOND_END = 94 * 60;  // 90 + 4 de acrescimo

    function position(sec, half) {
        var limit = half === 1 ? 45 : 90;
        if (sec >= limit * 60) {
            return { minute: limit, extra: Math.floor((sec - limit * 60) / 60) + 1, second: sec % 60 };
        }
        return { minute: Math.floor(sec / 60), extra: 0, second: sec % 60 };
    }

    function cycle(now) {
        var speed = CONFIG.mock.speed;
        var phase = CONFIG.mock.phaseMs;
        var firstMs = FIRST_END / speed * 1000;
        var halfMs = phase;
        var secondMs = (SECOND_END - SECOND_START) / speed * 1000;
        var total = phase + firstMs + halfMs + secondMs + phase;
        var index = Math.floor((now - startedAt) / total);
        var begin = startedAt + index * total;
        var t = now - begin;
        var snapshot = {
            matchId: 'mock-cycle-' + index, updatedAt: now, status: 'NS', minute: 0, second: 0, extra: 0,
            kickoff: '20:00', teams: { vasco: { score: 0 }, flamengo: { score: 0 } }, events: []
        };
        var sec = 0;
        var half = 1;
        if (t < phase) { return snapshot; }
        if (t < phase + firstMs) {
            snapshot.status = '1H';
            sec = Math.floor((t - phase) * speed / 1000);
        } else if (t < phase + firstMs + halfMs) {
            snapshot.status = 'HT';
            sec = FIRST_END;
        } else if (t < phase + firstMs + halfMs + secondMs) {
            snapshot.status = '2H';
            half = 2;
            sec = SECOND_START + Math.floor((t - phase - firstMs - halfMs) * speed / 1000);
        } else {
            snapshot.status = 'FT';
            half = 2;
            sec = SECOND_END;
        }
        var pos = position(sec, half);
        if (snapshot.status === 'HT') { pos = { minute: 45, extra: 0, second: 0 }; }
        if (snapshot.status === 'FT') { pos = { minute: 90, extra: 0, second: 0 }; }
        snapshot.minute = pos.minute; snapshot.extra = pos.extra; snapshot.second = pos.second;
        for (var i = 0; i < cycleEvents.length; i++) {
            var source = cycleEvents[i];
            var eventHalf = source.at < FIRST_END ? 1 : 2;
            if (eventHalf === half ? source.at > sec : eventHalf > half) { continue; }
            var at = position(source.at, eventHalf);
            var offset = eventHalf === 1 ? phase + source.at / speed * 1000
                : phase + firstMs + halfMs + (source.at - SECOND_START) / speed * 1000;
            snapshot.events.push({ id: 'cycle-' + index + '-' + i, type: source.type, teamId: source.teamId,
                minute: at.minute, extra: at.extra, occurredAt: Math.round(begin + offset), cancelled: false });
            if (source.type === 'goal') { snapshot.teams[source.teamId].score++; }
        }
        return snapshot;
    }

    function read(callback) {
        var scenario = CONFIG.mock.scenario;
        if (scenario === 'cycle') { callback(null, cycle(Date.now())); return; }
        if (scenario === 'empty') { callback(null, null); return; }
        if (scenario === 'invalid') { callback(null, { invalid: true }); return; }
        if (scenario === 'network-error') { callback(new Error('Mock network error')); return; }
        var now = Date.now();
        var step = Math.floor((now - startedAt) / CONFIG.mock.stepMs);
        var count = scenario === 'demo' || scenario === 'cancelled' ? Math.min(step, definitions.length) : 0;
        var snapshot = {
            matchId: 'mock-vasco-flamengo', updatedAt: now, status: '1H',
            minute: 12 + Math.floor((now - startedAt) / 60000),
            second: Math.floor((now - startedAt) / 1000) % 60, extra: 0,
            teams: { vasco: { score: 0 }, flamengo: { score: 0 } }, events: []
        };
        for (var index = 0; index < count; index++) {
            var source = definitions[index];
            var event = {
                id: source.id, type: source.type, teamId: source.teamId,
                minute: source.minute, extra: 0, occurredAt: startedAt + (index + 1) * CONFIG.mock.stepMs,
                cancelled: scenario === 'cancelled' && index === 0 && step >= 2
            };
            snapshot.events.push(event);
            snapshot.minute = event.minute + Math.floor((now - event.occurredAt) / 60000);
            snapshot.second = Math.floor((now - event.occurredAt) / 1000) % 60;
            if (event.type === 'goal' && !event.cancelled) { snapshot.teams[event.teamId].score++; }
        }
        if (scenario === 'pregame') { snapshot.status = 'NS'; snapshot.minute = 0; snapshot.second = 0; }
        if (scenario === 'halftime') { snapshot.status = 'HT'; snapshot.minute = 45; snapshot.second = 0; }
        if (scenario === 'finished') { snapshot.status = 'FT'; snapshot.minute = 90; snapshot.second = 0; }
        if (scenario === 'score' || scenario === 'double-digit') {
            snapshot.status = '2H';
            snapshot.minute = 60;
            for (var goalIndex = 0; goalIndex < 12; goalIndex++) {
                var team = goalIndex % 2 ? 'flamengo' : 'vasco';
                snapshot.events.push({ id: 'historical-' + goalIndex, type: 'goal', teamId: team,
                    minute: goalIndex * 5 + 2, occurredAt: startedAt - 1000, extra: 0 });
                snapshot.teams[team].score++;
            }
        }
        if (scenario === 'double-digit') { snapshot.teams.vasco.score = 12; snapshot.teams.flamengo.score = 10; }
        if (scenario === 'stale') { snapshot.updatedAt = now - CONFIG.timing.maxDataAgeMs - 1000; }
        if (scenario === 'demo' && step >= 7) { snapshot.status = 'HT'; snapshot.minute = 45; snapshot.second = 0; }
        callback(null, snapshot);
    }

    return { enabled: true, read: read };
}());