const test = require('node:test');
const assert = require('node:assert/strict');
const source = require('../CLIENTES/WEOOH/placar_Flamengo_Vasco/js/channel-source.js');
const state = require('../CLIENTES/WEOOH/placar_Flamengo_Vasco/js/match-state.js');
const teams = { left: { id: 'vasco' }, right: { id: 'flamengo' } };

// Formato real capturado de D_FOOTBALL (jogo 1525938); mandante 391 -> esquerda, visitante 7808 -> direita.
function response(events, status = { short: '1H', elapsed: 34, extra: null }, goals = { home: 1, away: 0 }) {
    return { fixture: { id: 1525938, status }, goals,
        teams: { home: { id: 391 }, away: { id: 7808 } }, events };
}
const card = (detail, team = 7808, elapsed = 31) => ({ time: { elapsed, extra: null }, team: { id: team },
    player: { id: null, name: 'Juan Diaz Quinta' }, type: 'Card', detail });
const goal = (detail = 'Normal Goal', team = 391, elapsed = 10) => ({ time: { elapsed, extra: null }, team: { id: team },
    player: { name: 'X' }, type: 'Goal', detail });
const run = (r, seen = {}, now = 5000) =>
    source.toSnapshot(r, { teams, apiIds: { vasco: 133, flamengo: 127 }, seen, now });

test('real card event becomes a valid snapshot', () => {
    const snapshot = state.normalize(run(response([card('Yellow Card')])), teams);
    assert.equal(snapshot.events[0].type, 'yellow');
    assert.equal(snapshot.events[0].teamId, 'flamengo');
    assert.equal(snapshot.teams.vasco.score, 1);
});

test('maps goal/red, ignores missed penalty and substitutions', () => {
    const events = [goal(), goal('Missed Penalty'), card('Red Card', 391), { type: 'subst', team: { id: 391 }, detail: 'Sub 1' }];
    assert.deepEqual(run(response(events)).events.map(e => e.type), ['goal', 'red']);
});

test('event id and first-seen time are stable across polls', () => {
    const seen = {};
    const first = run(response([card('Yellow Card')]), seen, 1000).events[0];
    const second = run(response([card('Yellow Card')]), seen, 9000).events[0];
    assert.equal(first.id, second.id);
    assert.equal(second.occurredAt, 1000);
});

test('identical repeated events get distinct ids', () => {
    const ids = run(response([goal(), goal()])).events.map(e => e.id);
    assert.notEqual(ids[0], ids[1]);
});

test('VAR cancellation cancels the last goal of that team', () => {
    const var1 = { type: 'Var', detail: 'Goal cancelled', team: { id: 391 }, time: { elapsed: 12 } };
    const events = run(response([goal(), var1])).events;
    assert.equal(events[0].cancelled, true);
});

test('unsupported status is rejected', () => {
    assert.throws(() => run(response([], { short: 'ET', elapsed: 100 })), /Unsupported/);
});

test('clock uses periods.first when present; without it learns the start from elapsed, ignoring the schedule', () => {
    const ids = { vasco: 133, flamengo: 127 };
    const mk = (elapsed, periods) => ({ fixture: { id: 1, timestamp: 1000, periods, date: '2026-10-28T09:00:00-03:00',
        status: { short: '1H', elapsed, extra: null } }, goals: { home: 0, away: 0 },
        teams: { home: { id: 1, name: 'A' }, away: { id: 2, name: 'B' } } });
    const real = source.toSnapshot(mk(34, { first: 5000, second: null }), { teams, apiIds: ids, seen: {}, clock: {}, now: (5000 + 34 * 60 + 17) * 1000 });
    assert.equal(real.minute, 34); assert.equal(real.second, 17);
    assert.equal(real.kickoff, '09:00'); assert.equal(real.teams.vasco.name, 'A');
    // jogo comecou 3 min depois do agendado; a hora agendada nao pode puxar o relogio para a frente
    const clock = {};
    const at = (elapsed, sec) => source.toSnapshot(mk(elapsed, { first: null, second: null }),
        { teams, apiIds: ids, seen: {}, clock, now: (1000 + 180 + sec) * 1000 });
    const shown = [at(9, 540 + 3), at(9, 540 + 40), at(9, 540 + 59), at(10, 600), at(10, 600 + 30)];
    assert.deepEqual(shown.map(x => x.minute + ':' + x.second), ['9:0', '9:37', '9:56', '10:0', '10:30']);
    const times = shown.map(x => x.minute * 60 + x.second);
    for (let i = 1; i < times.length; i++) assert.ok(times[i] >= times[i - 1], 'clock never goes back');
});

test('not started snapshot carries kickoff time', () => {
    const r = { fixture: { id: 1, date: '2026-10-29T20:00:00-03:00', status: { short: 'NS', elapsed: null } },
        goals: { home: null, away: null }, teams: { home: { id: 1, name: 'A' }, away: { id: 2, name: 'B' } } };
    const snapshot = state.normalize(source.toSnapshot(r, { teams, apiIds: { vasco: 133, flamengo: 127 }, seen: {}, now: 5000 }), teams);
    assert.equal(snapshot.kickoff, '20:00'); assert.equal(snapshot.status, 'NS');
});

test('configured match maps by API id (Vasco home) with config names; other matches use API names', () => {
    const ids = { vasco: 133, flamengo: 127 };
    const r = { fixture: { id: 9, date: '2026-10-29T20:00:00-03:00', status: { short: '1H', elapsed: 5 } },
        goals: { home: 1, away: 0 }, teams: { home: { id: 133, name: 'Vasco DA Gama' }, away: { id: 127, name: 'Flamengo' } },
        events: [card('Yellow Card', 127, 4)] };
    const real = source.toSnapshot(r, { teams, apiIds: ids, seen: {}, now: 5000 });
    assert.equal(real.teams.vasco.score, 1);
    assert.equal(real.teams.vasco.name, undefined);
    assert.equal(real.events[0].teamId, 'flamengo');
    r.teams = { home: { id: 127 }, away: { id: 133 } };
    assert.equal(source.toSnapshot(r, { teams, apiIds: ids, seen: {}, now: 5000 }).teams.flamengo.score, 1);
    r.teams = { home: { id: 391, name: 'Isloch' }, away: { id: 7808, name: 'Vitebsk' } };
    assert.equal(source.toSnapshot(r, { teams, apiIds: ids, seen: {}, now: 5000 }).teams.vasco.name, 'ISLOCH');
});
