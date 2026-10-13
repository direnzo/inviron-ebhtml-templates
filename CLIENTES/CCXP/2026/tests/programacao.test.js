'use strict';
// Rodar: node --test CLIENTES/CCXP/2026/tests
const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../programacao_palco/js/programacao.js');

const TZ = -180;
const OPTS = { offsetMin: TZ, stageId: '23008', filterClientSide: true, fallbackDurationMin: 60, maxLista: 5 };
const at = (text) => P.parseDateTime(text, TZ);
const NOW = at('2026-12-04 14:40:00');

function ev(title, start, end, extra) {
    return Object.assign({ category: '23008', titulo: 'Palco Thunder', texto: title, texto2: '0', foto: 'x.jpg', date: start, dtEnd: end }, extra || {});
}

test('parseDateTime: formatos, fuso e invalidos', () => {
    assert.equal(at('2026-12-04 17:00:00'), Date.UTC(2026, 11, 4, 20, 0, 0));
    assert.equal(at('2026-12-04 17:00'), Date.UTC(2026, 11, 4, 20, 0, 0));
    assert.equal(at('12-04-2026 17:00:00-03:00'), Date.UTC(2026, 11, 4, 20, 0, 0));
    assert.equal(at('2026-12-04T20:00:00Z'), Date.UTC(2026, 11, 4, 20, 0, 0));
    assert.equal(at('2026-12-04 17:00:00+0000'), Date.UTC(2026, 11, 4, 17, 0, 0));
    assert.ok(isNaN(at('')));
    assert.ok(isNaN(at(null)));
    assert.ok(isNaN(at('2026-13-01 10:00:00')));
    assert.ok(isNaN(at('2026-02-30 10:00:00')));
    assert.ok(isNaN(at('04/12/2026 10:00')));
});

test('formatacao usa o fuso do evento, nao o da maquina', () => {
    const utc = Date.UTC(2026, 11, 4, 12, 30);
    assert.equal(P.formatHora(utc, TZ), '09h30');
    assert.equal(P.formatRelogio(utc, TZ), '9:30');
    assert.equal(P.formatRelogio(Date.UTC(2026, 11, 4, 3, 5), TZ), '0:05');
});

test('atual, proximo e ate 5 depois, em ordem cronologica', () => {
    const raw = [
        ev('F', '2026-12-04 20:00:00', '2026-12-04 21:00:00'),
        ev('B', '2026-12-04 15:00:00', '2026-12-04 16:00:00'),
        ev('ATUAL', '2026-12-04 14:00:00', '2026-12-04 15:00:00'),
        ev('C', '2026-12-04 16:00:00', '2026-12-04 17:00:00'),
        ev('D', '2026-12-04 17:00:00', '2026-12-04 18:00:00'),
        ev('E', '2026-12-04 18:00:00', '2026-12-04 19:00:00'),
        ev('G', '2026-12-04 21:00:00', '2026-12-04 22:00:00'),
        ev('H', '2026-12-04 22:00:00', '2026-12-04 23:00:00')
    ];
    const s = P.select(raw, NOW, OPTS);
    assert.equal(s.atual.title, 'ATUAL');
    assert.equal(s.proximo.title, 'B');
    assert.deepEqual(s.depois.map((e) => e.title), ['C', 'D', 'E', 'F', 'G']);
});

test('painel encerrado sai; fim exato nao e mais atual', () => {
    const raw = [ev('PASSADO', '2026-12-04 13:00:00', '2026-12-04 14:40:00'), ev('PROX', '2026-12-04 15:00:00', '2026-12-04 16:00:00')];
    const s = P.select(raw, NOW, OPTS);
    assert.equal(s.atual, null);
    assert.equal(s.proximo.title, 'PROX');
});

test('sem atual: proximo vira "daqui a pouco" e steps omitem Rolando Agora', () => {
    const s = P.select([ev('A', '2026-12-04 15:00:00', '2026-12-04 16:00:00')], NOW, OPTS);
    const steps = P.buildSteps(s, { intro: 3000, rolando: 6000, daqui: 6000, ainda: 13000, outro: 11000 });
    assert.deepEqual(steps.map((x) => x.type), ['intro', 'daqui', 'outro']);
    assert.equal(P.totalMs(steps), 20000);
});

test('sequencia completa soma 39 s', () => {
    const raw = [
        ev('A', '2026-12-04 14:00:00', '2026-12-04 15:00:00'),
        ev('B', '2026-12-04 15:00:00', '2026-12-04 16:00:00'),
        ev('C', '2026-12-04 16:00:00', '2026-12-04 17:00:00')
    ];
    const steps = P.buildSteps(P.select(raw, NOW, OPTS), { intro: 3000, rolando: 6000, daqui: 6000, ainda: 13000, outro: 11000 });
    assert.deepEqual(steps.map((x) => x.type), ['intro', 'rolando', 'daqui', 'ainda', 'outro']);
    assert.equal(P.totalMs(steps), 39000);
});

test('"ainda hoje" omitido quando so restam 2 painel (atual + proximo)', () => {
    const raw = [ev('A', '2026-12-04 14:00:00', '2026-12-04 15:00:00'), ev('B', '2026-12-04 15:00:00', '2026-12-04 16:00:00')];
    const steps = P.buildSteps(P.select(raw, NOW, OPTS), { intro: 1, rolando: 1, daqui: 1, ainda: 1, outro: 1 });
    assert.deepEqual(steps.map((x) => x.type), ['intro', 'rolando', 'daqui', 'outro']);
});

test('painel de amanha nao entra em "ainda hoje"', () => {
    const raw = [ev('AMANHA', '2026-12-05 10:00:00', '2026-12-05 11:00:00')];
    const s = P.select(raw, NOW, OPTS);
    assert.equal(s.proximo, null);
    assert.equal(s.depois.length, 0); // amanha nunca entra em "ainda hoje"
    assert.equal(s.amanha.length, 1);
});

test('virada de dia: painel em andamento apos meia-noite continua atual', () => {
    const now = at('2026-12-05 00:10:00');
    const s = P.select([ev('MADRUGADA', '2026-12-04 23:30:00', '2026-12-05 01:00:00')], now, OPTS);
    assert.equal(s.atual.title, 'MADRUGADA');
});

test('hora local da maquina nao altera o resultado (fuso explicito)', () => {
    const raw = [ev('A', '12-04-2026 14:00:00-03:00', '12-04-2026 15:00:00-03:00')];
    const s = P.select(raw, Date.UTC(2026, 11, 4, 17, 40), OPTS);
    assert.equal(s.atual.title, 'A');
});

test('descarta: sem titulo, data invalida, outro palco, duplicado', () => {
    const raw = [
        ev('', '2026-12-04 15:00:00', '2026-12-04 16:00:00'),
        ev('SEM DATA', 'lixo', '2026-12-04 16:00:00'),
        ev('OUTRO PALCO', '2026-12-04 15:00:00', '2026-12-04 16:00:00', { category: '23009' }),
        ev('OK', '2026-12-04 15:00:00', '2026-12-04 16:00:00'),
        ev('ok', '2026-12-04 15:00:00', '2026-12-04 16:00:00')
    ];
    const s = P.select(raw, NOW, OPTS);
    assert.equal(s.proximo.title, 'OK');
    assert.equal(s.depois.length, 0);
    assert.equal(s.descartados, 4);
});

test('fim ausente ou invalido usa a duracao padrao', () => {
    const s = P.select([ev('A', '2026-12-04 14:00:00', '')], NOW, OPTS);
    assert.equal(s.atual.endMs - s.atual.startMs, 60 * 60000);
});

test('estado e substituido a cada chamada (sem acumular)', () => {
    const raw = [ev('A', '2026-12-04 15:00:00', '2026-12-04 16:00:00')];
    P.select(raw, NOW, OPTS);
    const s = P.select(raw, NOW, OPTS);
    assert.equal(s.proximo.title, 'A');
    assert.equal(s.depois.length, 0);
});

test('lista vazia: sem steps', () => {
    assert.deepEqual(P.buildSteps(P.select([], NOW, OPTS), { intro: 1, rolando: 1, daqui: 1, ainda: 1, outro: 1 }), []);
});

const TIMING = { intro: 1, rolando: 1, daqui: 1, ainda: 1, amanha: 1, outro: 1 };
const tipos = (s) => P.buildSteps(s, TIMING).map((x) => x.type);

test('amanha e um slide proprio: nao mistura com a lista de hoje', () => {
    const raw = [
        ev('ATUAL', '2026-12-04 14:00:00', '2026-12-04 15:00:00'),
        ev('PROX', '2026-12-04 16:00:00', '2026-12-04 17:00:00'),
        ev('HOJE1', '2026-12-04 18:00:00', '2026-12-04 19:00:00'),
        ev('AMANHA1', '2026-12-05 10:00:00', '2026-12-05 11:00:00'),
        ev('AMANHA2', '2026-12-05 11:00:00', '2026-12-05 12:00:00'),
        ev('AMANHA3', '2026-12-05 12:00:00', '2026-12-05 13:00:00'),
        ev('AMANHA4', '2026-12-05 13:00:00', '2026-12-05 14:00:00'),
        ev('AMANHA5', '2026-12-05 14:00:00', '2026-12-05 15:00:00'),
        ev('AMANHA6', '2026-12-05 15:00:00', '2026-12-05 16:00:00'),
        ev('DEPOIS', '2026-12-06 10:00:00', '2026-12-06 11:00:00')
    ];
    const s = P.select(raw, NOW, OPTS);
    assert.deepEqual(s.depois.map((e) => e.title), ['HOJE1']);
    assert.deepEqual(s.amanha.map((e) => e.title), ['AMANHA1', 'AMANHA2', 'AMANHA3', 'AMANHA4', 'AMANHA5']);
    assert.deepEqual(tipos(s), ['intro', 'rolando', 'daqui', 'ainda', 'amanha', 'outro']);
});

test('lista de hoje cheia (5) e amanha continua em slide separado', () => {
    const raw = [ev('ATUAL', '2026-12-04 14:00:00', '2026-12-04 15:00:00'), ev('PROX', '2026-12-04 15:30:00', '2026-12-04 16:00:00')];
    for (let i = 0; i < 5; i += 1) {
        const h = 16 + i;
        raw.push(ev('H' + i, '2026-12-04 ' + h + ':00:00', '2026-12-04 ' + h + ':50:00'));
    }
    raw.push(ev('AMANHA', '2026-12-05 10:00:00', '2026-12-05 11:00:00'));
    const s = P.select(raw, NOW, OPTS);
    assert.equal(s.depois.length, 5);
    assert.deepEqual(s.amanha.map((e) => e.title), ['AMANHA']);
});

test('sem mais paineis hoje alem do atual: sem "ainda hoje", com slide de amanha', () => {
    const raw = [ev('ATUAL', '2026-12-04 14:00:00', '2026-12-04 15:00:00'), ev('AMANHA1', '2026-12-05 10:00:00', '2026-12-05 11:00:00')];
    const s = P.select(raw, NOW, OPTS);
    assert.equal(s.proximo, null);
    assert.deepEqual(tipos(s), ['intro', 'rolando', 'amanha', 'outro']);
});

test('fim do dia com programacao de amanha: so o slide de amanha', () => {
    const s = P.select([ev('AMANHA', '2026-12-05 10:00:00', '2026-12-05 11:00:00')], NOW, OPTS);
    assert.deepEqual(tipos(s), ['intro', 'amanha', 'outro']);
});

test('sem nada hoje nem amanha: nao exibe', () => {
    const s = P.select([ev('DEPOIS', '2026-12-06 10:00:00', '2026-12-06 11:00:00')], NOW, OPTS);
    assert.deepEqual(P.buildSteps(s, TIMING), []);
});

test('cinco dias: o que ja passou some conforme a hora avanca', () => {
    const raw = [];
    for (let d = 4; d <= 8; d += 1) {
        for (let h = 10; h < 18; h += 1) {
            raw.push(ev('D' + d + 'H' + h, '2026-12-0' + d + ' ' + h + ':00:00', '2026-12-0' + d + ' ' + h + ':50:00'));
        }
    }
    const manha = P.select(raw, at('2026-12-04 10:20:00'), OPTS);
    assert.equal(manha.atual.title, 'D4H10');
    assert.equal(manha.proximo.title, 'D4H11');
    assert.equal(manha.depois.length, 5);
    const fim = P.select(raw, at('2026-12-04 16:30:00'), OPTS);
    assert.equal(fim.atual.title, 'D4H16');
    assert.equal(fim.proximo.title, 'D4H17');
    assert.equal(fim.depois.length, 0);
    assert.deepEqual(fim.amanha.map((e) => e.title), ['D5H10', 'D5H11', 'D5H12', 'D5H13', 'D5H14']);
    const ultimo = P.select(raw, at('2026-12-08 16:30:00'), OPTS);
    assert.equal(ultimo.amanha.length, 0); // ultimo dia: nao ha amanha
    assert.deepEqual(tipos(ultimo), ['intro', 'rolando', 'daqui', 'outro']);
});
