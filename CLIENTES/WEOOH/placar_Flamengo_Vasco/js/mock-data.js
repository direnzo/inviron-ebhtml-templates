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

    function read(callback) {
        var scenario = CONFIG.mock.scenario;
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