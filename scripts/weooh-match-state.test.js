const test = require('node:test');
const assert = require('node:assert/strict');
const state = require('../CLIENTES/WEOOH/placar_Flamengo_Vasco/js/match-state.js');
const teams = { left: { id: 'vasco' }, right: { id: 'flamengo' } };

function snapshot(updatedAt, events = []) {
    return state.normalize({ matchId: 'mock-match', updatedAt, status: '1H', minute: 12,
        teams: { flamengo: { score: 0 }, vasco: { score: 1 } }, events }, teams);
}

function event(id, overrides = {}) {
    return { id, teamId: 'vasco', type: 'goal', minute: 12,
        occurredAt: 1000, ...overrides };
}

test('baseline does not replay history and maps teams by ID', () => {
    const tracker = state.createTracker(60000);
    tracker.apply(snapshot(1000, [event('old')]), 1000);
    assert.equal(tracker.pending(), 0);
    assert.equal(tracker.current().teams.vasco.score, 1);
});

test('queues new events once, in chronological order', () => {
    const tracker = state.createTracker(60000);
    tracker.apply(snapshot(900), 900);
    const next = snapshot(2000, [event('second', { occurredAt: 1500 }), event('first')]);
    assert.equal(tracker.apply(next, 2000), true);
    assert.equal(tracker.apply(next, 2000), false);
    assert.equal(tracker.next(2000).id, 'first');
    assert.equal(tracker.next(2000).id, 'second');
    assert.equal(tracker.next(2000), null);
    tracker.apply(snapshot(3000, next.events), 3000);
    assert.equal(tracker.pending(), 0);
});

test('cancellation removes queued events without creating another goal', () => {
    const tracker = state.createTracker(60000);
    tracker.apply(snapshot(900), 900);
    tracker.apply(snapshot(2000, [event('goal')]), 2000);
    tracker.apply(snapshot(3000, [event('goal', { cancelled: true })]), 3000);
    assert.equal(tracker.next(3000), null);
});

test('equal timestamps keep match minute order instead of lexical event ID order', () => {
    const data = snapshot(2000, [event('10', { minute: 52 }), event('2', { minute: 12 })]);
    assert.deepEqual(data.events.map(item => item.minute), [12, 52]);
});

test('old, future and expired alerts are not shown', () => {
    const tracker = state.createTracker(1000);
    tracker.apply(snapshot(900), 900);
    tracker.apply(snapshot(3000, [event('old'), event('future', { occurredAt: 6000 }),
        event('new', { occurredAt: 3000 })]), 3000);
    assert.equal(tracker.next(5000), null);
});

test('ignores out-of-order snapshots and resets on another match', () => {
    const tracker = state.createTracker(60000);
    tracker.apply(snapshot(2000), 2000);
    assert.equal(tracker.apply(snapshot(1000, [event('stale')]), 2000), false);
    const other = snapshot(3000, [event('history')]);
    other.matchId = 'other';
    tracker.apply(other, 3000);
    assert.equal(tracker.pending(), 0);
});

test('rejects invalid snapshots, scores, duplicate events and foreign teams', () => {
    assert.throws(() => state.normalize(null, teams));
    assert.throws(() => snapshot(1000, [event('same'), event('same')]));
    assert.throws(() => snapshot(1000, [event('foreign', { teamId: 'other' })]));
    assert.throws(() => snapshot(1000, [event('invalid', { minute: -1 })]));
    const invalid = snapshot(1000);
    invalid.teams.vasco.score = '1';
    assert.throws(() => state.normalize(invalid, teams));
});

test('clock advances seconds and carries minutes from the source timestamp', () => {
    const clock = state.createClock();
    const data = snapshot(1000);
    data.second = 59;
    clock.sync(data);
    assert.equal(clock.text(1000), '12:59');
    assert.equal(clock.text(2000), '13:00');
    assert.equal(clock.text(6000), '13:04');
});

test('minute-only polls do not reset seconds; interval and finished freeze time', () => {
    const clock = state.createClock();
    clock.sync(snapshot(1000));
    clock.sync(snapshot(3000));
    assert.equal(clock.text(4000), '12:03');
    const paused = snapshot(5000);
    paused.status = 'HT';
    paused.minute = 45;
    clock.sync(paused);
    assert.equal(clock.text(65000), '45:00');
    paused.status = 'FT';
    paused.minute = 90;
    clock.sync(paused);
    assert.equal(clock.text(95000), '90:00');
});

test('clock handles pregame, added time and rejects invalid seconds without requiring player names', () => {
    const clock = state.createClock();
    assert.equal(clock.text(1000), '--:--');
    const data = snapshot(1000);
    data.status = 'NS';
    clock.sync(data);
    assert.equal(clock.text(5000), '--:--');
    const running = snapshot(1000, [{ id: 'anonymous', teamId: 'vasco', type: 'goal', minute: 12, occurredAt: 1000 }]);
    running.minute = 90;
    running.extra = 3;
    running.second = 5;
    clock.sync(running);
    assert.equal(clock.text(2000), '93:06');
    assert.equal('player' in running.events[0], false);
    running.second = 60;
    assert.throws(() => state.normalize(running, teams));
});