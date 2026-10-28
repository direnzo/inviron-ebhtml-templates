(function (root) {
    'use strict';

    function integer(value, name) {
        if (typeof value !== 'number' || !isFinite(value) || value < 0 || Math.floor(value) !== value) {
            throw new Error('Invalid ' + name);
        }
        return value;
    }

    function normalize(input, teams) {
        if (!input || !input.matchId || !input.updatedAt || !input.teams || !input.events ||
                Object.prototype.toString.call(input.events) !== '[object Array]') {
            throw new Error('Invalid match snapshot');
        }
        var result = {
            matchId: String(input.matchId), updatedAt: integer(input.updatedAt, 'updatedAt'),
            status: String(input.status || ''), minute: integer(input.minute, 'minute'),
            second: input.second === undefined || input.second === null ? null : integer(input.second, 'second'),
            extra: integer(input.extra || 0, 'extra'), teams: {}, events: [],
            kickoff: input.kickoff ? String(input.kickoff) : ''
        };
        if (result.second !== null && result.second > 59) { throw new Error('Invalid second'); }
        if (!/^(NS|1H|HT|2H|FT|SUSP|PST|ABD)$/.test(result.status)) {
            throw new Error('Unknown match status');
        }
        var teamIds = [teams.left.id, teams.right.id];
        var index;
        for (index = 0; index < teamIds.length; index++) {
            var teamId = teamIds[index];
            if (!input.teams[teamId]) { throw new Error('Missing team ' + teamId); }
            result.teams[teamId] = { score: integer(input.teams[teamId].score, 'score'),
                name: input.teams[teamId].name ? String(input.teams[teamId].name) : '' };
        }
        var used = {};
        for (index = 0; index < input.events.length; index++) {
            var event = input.events[index];
            if (!event || !event.id || used['$' + event.id] ||
                    (event.teamId !== teamIds[0] && event.teamId !== teamIds[1]) ||
                    !/^(goal|yellow|red)$/.test(event.type)) {
                throw new Error('Invalid or duplicate event');
            }
            used['$' + event.id] = true;
            result.events.push({
                id: String(event.id), teamId: event.teamId, type: event.type,
                minute: integer(event.minute, 'event minute'),
                extra: integer(event.extra || 0, 'event extra'),
                occurredAt: integer(event.occurredAt, 'event timestamp'),
                cancelled: event.cancelled === true
            });
        }
        result.events.sort(function (first, second) {
            return first.occurredAt - second.occurredAt || first.minute - second.minute ||
                first.extra - second.extra || first.id.localeCompare(second.id);
        });
        return result;
    }

    function createTracker(maxAgeMs) {
        var current = null;
        var seen = {};
        var queue = [];

        function apply(snapshot, now) {
            if (current && snapshot.matchId === current.matchId && snapshot.updatedAt <= current.updatedAt) {
                return false;
            }
            var baseline = !current || current.matchId !== snapshot.matchId;
            if (baseline) { seen = {}; queue = []; }
            var valid = {};
            var index;
            for (index = 0; index < snapshot.events.length; index++) {
                var event = snapshot.events[index];
                var key = '$' + event.id;
                valid[key] = event;
                if (!baseline && !seen[key] && !event.cancelled &&
                        now >= event.occurredAt && now - event.occurredAt <= maxAgeMs) {
                    queue.push(event);
                }
                seen[key] = true;
            }
            var remaining = [];
            for (index = 0; index < queue.length; index++) {
                var updated = valid['$' + queue[index].id];
                if (updated && !updated.cancelled && updated.occurredAt <= now &&
                        now - updated.occurredAt <= maxAgeMs) { remaining.push(updated); }
            }
            queue = remaining;
            current = snapshot;
            return true;
        }

        return {
            apply: apply,
            next: function (now) {
                while (queue.length) {
                    var event = queue.shift();
                    if (now - event.occurredAt <= maxAgeMs) { return event; }
                }
                return null;
            },
            current: function () { return current; },
            pending: function () { return queue.length; }
        };
    }

    function createClock(getSpeed) {
        var current = null;
        var anchorAt = 0;
        var elapsed = 0;
        return {
            sync: function (snapshot) {
                if (!current || current.matchId !== snapshot.matchId || current.status !== snapshot.status ||
                        current.minute !== snapshot.minute || current.extra !== snapshot.extra || snapshot.second !== null) {
                    anchorAt = snapshot.updatedAt;
                    // extra N = N-esimo minuto de acrescimo (45+1 comeca em 45:00)
                    elapsed = (snapshot.minute + Math.max(snapshot.extra - 1, 0)) * 60 + (snapshot.second || 0);
                }
                current = { matchId: snapshot.matchId, status: snapshot.status,
                    minute: snapshot.minute, extra: snapshot.extra };
            },
            text: function (now) {
                if (!current || current.status === 'NS') { return '--:--'; }
                var running = current.status === '1H' || current.status === '2H';
                var seconds = elapsed + (running ? Math.max(0, Math.floor((now - anchorAt) / 1000 * (getSpeed ? getSpeed() : 1))) : 0);
                var limit = current.status === '1H' ? 45 : 90;
                if (current.status === 'HT') { return ''; }
                if (current.extra > 0 || (running && seconds >= limit * 60)) {
                    return limit + '+' + (Math.floor((seconds - limit * 60) / 60) + 1);
                }
                var minutes = Math.floor(seconds / 60);
                return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds % 60 < 10 ? '0' : '') + (seconds % 60);
            }
        };
    }

    root.MatchState = { normalize: normalize, createTracker: createTracker, createClock: createClock };
    if (typeof module !== 'undefined' && module.exports) { module.exports = root.MatchState; }
}(typeof window !== 'undefined' ? window : this));