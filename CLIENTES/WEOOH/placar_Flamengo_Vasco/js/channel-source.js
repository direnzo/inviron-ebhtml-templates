(function (root) {
    'use strict';

    var STATUS = { TBD: 'NS', NS: 'NS', '1H': '1H', HT: 'HT', '2H': '2H', FT: 'FT', AET: 'FT', PEN: 'FT',
        SUSP: 'SUSP', INT: 'SUSP', PST: 'PST', ABD: 'ABD' };

    // Cronometro: o feed so traz o minuto (elapsed). Segundos vem do inicio real do periodo (periods.first/second);
    // sem ele, de uma ancora aprendida: cada leitura prova que o periodo comecou ha pelo menos elapsed minutos,
    // e o menor valor visto converge para o inicio real (nunca usa o horario agendado, que atrasa).
    function syncClock(snapshot, fixture, now, clock) {
        var live = snapshot.status === '1H' || snapshot.status === '2H';
        if (!live) { return; }
        var nowSec = Math.floor(now / 1000);
        var reported = snapshot.minute + Math.max(snapshot.extra - 1, 0);
        var periods = fixture.periods || {};
        var base = snapshot.status === '1H' ? periods.first : periods.second && periods.second - 45 * 60;
        if (!base && clock) {
            var key = fixture.id + snapshot.status;
            var upper = nowSec - reported * 60;
            // shortcut: 1a leitura no meio do minuto mostra :00 e corrige uma vez no proximo minuto; ate 5s de lag do poll.
            var lower = nowSec - (reported + 1) * 60;
            if (clock.key !== key || upper < clock.lower) { clock.key = key; clock.upper = upper; clock.lower = lower; }
            else { clock.upper = Math.min(clock.upper, upper); clock.lower = Math.max(clock.lower, lower); }
            base = clock.upper;
        }
        if (!base) { return; }
        var seconds = nowSec - base;
        var minute = Math.floor(seconds / 60);
        if (seconds >= 0 && minute >= reported - 1 && minute <= reported + 1) {
            snapshot.minute = minute; snapshot.extra = 0; snapshot.second = seconds % 60;
        }
    }

    // Converte a resposta da API-Football (TEXTO2 de D_FOOTBALL) no contrato de match-state.js.
    // ctx: { teams: CONFIG.teams, apiIds: {internalId: apiTeamId}, seen: {eventKey: firstSeenMs}, clock: {}, now }
    function toSnapshot(response, ctx) {
        var fixture = response && response.fixture;
        if (!fixture || !fixture.status || !response.teams || !response.goals) { throw new Error('Incomplete fixture'); }
        var status = STATUS[fixture.status.short];
        if (!status) { throw new Error('Unsupported status ' + fixture.status.short); }
        var left = ctx.teams.left.id;
        var right = ctx.teams.right.id;
        var homeId = response.teams.home.id;
        var awayId = response.teams.away.id;
        var ids = ctx.apiIds;
        // Jogo configurado (IDs dos dois times batem, em qualquer ordem): mapeia por ID e usa nomes do CONFIG.
        // Qualquer outro jogo: mandante = esquerda, visitante = direita, com os nomes da API.
        var known = (ids[left] === homeId && ids[right] === awayId) || (ids[left] === awayId && ids[right] === homeId);
        var sides = known && ids[left] === awayId ? { home: right, away: left } : { home: left, away: right };
        var byApiId = {};
        var side;
        byApiId[homeId] = sides.home;
        byApiId[awayId] = sides.away;
        var snapshot = {
            matchId: String(fixture.id), updatedAt: ctx.now, status: status,
            minute: fixture.status.elapsed || 0, extra: fixture.status.extra || 0, second: null,
            teams: {}, events: []
        };
        snapshot.teams[sides.home] = { score: response.goals.home || 0 };
        snapshot.teams[sides.away] = { score: response.goals.away || 0 };
        // Jogo fora do configurado (teste): exibe o nome real vindo da API.
        for (side in sides) {
            if (!known) { snapshot.teams[sides[side]].name = String(response.teams[side].name || '').toUpperCase(); }
        }
        snapshot.kickoff = String(fixture.date || '').substr(11, 5); // HH:MM no fuso da API (-03:00)
        syncClock(snapshot, fixture, ctx.now, ctx.clock);

        var list = response.events || [];
        var count = {};
        var lastGoal = {};
        for (var index = 0; index < list.length; index++) {
            var raw = list[index];
            var teamId = raw.team && byApiId[raw.team.id];
            if (!teamId) { continue; }
            var detail = String(raw.detail || '');
            var kind = null;
            if (raw.type === 'Goal' && !/missed/i.test(detail)) { kind = 'goal'; }
            else if (raw.type === 'Card') { kind = /^yellow/i.test(detail) ? 'yellow' : /red|second yellow/i.test(detail) ? 'red' : null; }
            else if (raw.type === 'Var' && /cancel|disallow/i.test(detail) && lastGoal[teamId]) {
                lastGoal[teamId].cancelled = true;
                delete lastGoal[teamId];
                continue;
            }
            if (!kind) { continue; }
            var minute = raw.time && raw.time.elapsed || 0;
            var extra = raw.time && raw.time.extra || 0;
            // A API nao envia id: chave estavel = tipo + time + minuto + jogador + detalhe (+ ordem, se repetir).
            var key = [kind, raw.team.id, minute, extra, raw.player && raw.player.name || '', detail].join('|');
            count[key] = (count[key] || 0) + 1;
            key += '|' + count[key];
            if (!ctx.seen[key]) { ctx.seen[key] = ctx.now; }
            var event = { id: key, teamId: teamId, type: kind, minute: minute, extra: extra,
                occurredAt: ctx.seen[key], cancelled: false };
            snapshot.events.push(event);
            if (kind === 'goal') { lastGoal[teamId] = event; }
        }
        return snapshot;
    }

    function create(loader, config) {
        var seen = {};
        var clock = {};
        var token = 0;

        function load(name, params, callback) {
            var mine = ++token;
            loader.f_data = {};
            loader.addData(name, false, params);
            loader.load(function () {
                if (mine !== token) { return; }
                var data = loader.datalist(name);
                if (data.iserror || !data.count()) { callback(new Error(name + ' empty or failed (' + params + ')')); }
                else { callback(null, data.first()); }
            });
        }

        return function (callback) {
            function fixture(id) {
                load('D_FOOTBALL', 'f_titulo=' + id, function (error, item) {
                    if (error) { callback(error); return; }
                    try {
                        var json = JSON.parse(item.value('TEXTO2').toString());
                        callback(null, toSnapshot(json.response[0], { teams: config.teams,
                            apiIds: config.channel.apiIds, seen: seen, clock: clock, now: Date.now() }));
                    } catch (failure) { callback(failure); }
                });
            }
            if (config.channel.fixtureId) { fixture(config.channel.fixtureId); return; }
            load('D_SPD', 'f_config=0&f_type=10', function (error, item) {
                if (error) { callback(error); return; }
                var id = item.value('TITLE').toString();
                if (!/^\d+$/.test(id)) { callback(new Error('D_SPD TITLE is not a fixture id: ' + id)); return; }
                fixture(id);
            });
        };
    }

    root.ChannelSource = { toSnapshot: toSnapshot, create: create };
    if (typeof module !== 'undefined' && module.exports) { module.exports = root.ChannelSource; }
}(typeof window !== 'undefined' ? window : this));
