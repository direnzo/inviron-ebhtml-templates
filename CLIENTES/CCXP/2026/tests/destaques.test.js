'use strict';
// Rodar: node --test CLIENTES/CCXP/2026/tests
const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../destaque_dia/js/programacao.js');
const D = require('../destaque_dia/js/destaques.js');

const TZ = -180;
const OPTS = { offsetMin: TZ, fallbackDurationMin: 60, marcador: '1', max: 6 };
const at = (text) => P.parseDateTime(text, TZ);
const NOW = at('2026-12-04 14:40:00');
const TIMING = { intro: 3000, destaque: 6000, outro: 11000 };

function ev(title, start, end, extra) {
    return Object.assign({ category: '23008', titulo: 'Palco Thunder', texto: title, texto2: '1', foto: 'x.jpg', date: start, dtEnd: end }, extra || {});
}
const titulos = (s) => s.destaques.map((e) => e.title);
const tipos = (s) => D.buildSteps(s, TIMING).map((x) => x.type);

test('sem destaque: nada a exibir', () => {
    const s = D.select([], NOW, OPTS);
    assert.deepEqual(D.buildSteps(s, TIMING), []);
    assert.equal(D.totalMs([]), 0);
});

test('um destaque: intro, destaque, outro (20 s)', () => {
    const s = D.select([ev('A', '2026-12-04 15:00:00', '2026-12-04 16:00:00')], NOW, OPTS);
    assert.deepEqual(tipos(s), ['intro', 'destaque', 'outro']);
    assert.equal(D.totalMs(D.buildSteps(s, TIMING)), 20000);
});

test('seis destaques, um por palco, em ordem cronologica', () => {
    const palcos = ['23008', '23009', '23005', '24001', '23010', '23007'];
    const raw = palcos.map((id, i) => ev('P' + i, '2026-12-04 ' + (20 - i) + ':00:00', '2026-12-04 ' + (21 - i) + ':00:00', { category: id }));
    const s = D.select(raw, NOW, OPTS);
    assert.deepEqual(titulos(s), ['P5', 'P4', 'P3', 'P2', 'P1', 'P0']);
    assert.deepEqual(s.destaques.map((e) => e.category), ['23007', '23010', '24001', '23005', '23009', '23008']);
    assert.equal(tipos(s).length, 8);
    assert.equal(D.totalMs(D.buildSteps(s, TIMING)), 3000 + 6 * 6000 + 11000);
});

test('destaque encerrado some; fim exato ja nao vale', () => {
    const raw = [
        ev('PASSADO', '2026-12-04 13:00:00', '2026-12-04 14:00:00'),
        ev('FIM EXATO', '2026-12-04 13:00:00', '2026-12-04 14:40:00'),
        ev('EM ANDAMENTO', '2026-12-04 14:00:00', '2026-12-04 15:00:00')
    ];
    assert.deepEqual(titulos(D.select(raw, NOW, OPTS)), ['EM ANDAMENTO']);
});

test('marcador diferente de 1 nao e destaque', () => {
    const raw = [
        ev('COMUM', '2026-12-04 15:00:00', '2026-12-04 16:00:00', { texto2: '0' }),
        ev('VAZIO', '2026-12-04 15:10:00', '2026-12-04 16:00:00', { texto2: '' }),
        ev('SIM', '2026-12-04 15:20:00', '2026-12-04 16:00:00')
    ];
    const s = D.select(raw, NOW, OPTS);
    assert.deepEqual(titulos(s), ['SIM']);
    assert.equal(s.descartados, 0);
});

test('marcador e configuravel (highlight)', () => {
    const raw = [ev('H', '2026-12-04 15:00:00', '2026-12-04 16:00:00', { texto2: 'true' })];
    assert.equal(D.select(raw, NOW, OPTS).destaques.length, 0);
    assert.equal(D.select(raw, NOW, Object.assign({}, OPTS, { marcador: 'true' })).destaques.length, 1);
});

test('so o dia de hoje: amanha e ontem ficam de fora', () => {
    const raw = [
        ev('AMANHA', '2026-12-05 10:00:00', '2026-12-05 11:00:00'),
        ev('ONTEM', '2026-12-03 10:00:00', '2026-12-03 23:59:00'),
        ev('HOJE', '2026-12-04 18:00:00', '2026-12-04 19:00:00')
    ];
    assert.deepEqual(titulos(D.select(raw, NOW, OPTS)), ['HOJE']);
    assert.deepEqual(D.buildSteps(D.select([raw[0]], NOW, OPTS), TIMING), []);
});

test('fuso -03:00: 23h30 de hoje e 00h10 de amanha na hora local, nao em UTC', () => {
    const now = at('2026-12-04 23:50:00'); // ja e dia 5 em UTC
    const raw = [
        ev('HOJE 23H55', '2026-12-04 23:55:00', '2026-12-05 00:30:00'),
        ev('AMANHA 00H10', '2026-12-05 00:10:00', '2026-12-05 01:00:00')
    ];
    assert.deepEqual(titulos(D.select(raw, now, OPTS)), ['HOJE 23H55']);
});

test('troca de dia: a mesma lista, no dia seguinte, mostra o dia seguinte', () => {
    const raw = [
        ev('D4', '2026-12-04 18:00:00', '2026-12-04 19:00:00'),
        ev('D5', '2026-12-05 18:00:00', '2026-12-05 19:00:00')
    ];
    assert.deepEqual(titulos(D.select(raw, at('2026-12-04 10:00:00'), OPTS)), ['D4']);
    assert.deepEqual(titulos(D.select(raw, at('2026-12-05 10:00:00'), OPTS)), ['D5']);
});

test('hora local da maquina nao altera o resultado (fuso explicito)', () => {
    const raw = [ev('A', '12-04-2026 14:00:00-03:00', '12-04-2026 15:00:00-03:00')];
    assert.deepEqual(titulos(D.select(raw, Date.UTC(2026, 11, 4, 17, 40), OPTS)), ['A']);
});

test('descarta: sem titulo, data invalida e duplicado', () => {
    const raw = [
        ev('', '2026-12-04 15:00:00', '2026-12-04 16:00:00'),
        ev('SEM DATA', 'lixo', '2026-12-04 16:00:00'),
        ev('OK', '2026-12-04 15:00:00', '2026-12-04 16:00:00'),
        ev('ok', '2026-12-04 15:00:00', '2026-12-04 16:00:00')
    ];
    const s = D.select(raw, NOW, OPTS);
    assert.deepEqual(titulos(s), ['OK']);
    assert.equal(s.descartados, 3);
});

test('mesmo titulo em horarios ou palcos diferentes nao e duplicado', () => {
    const raw = [
        ev('PAINEL', '2026-12-04 15:00:00', '2026-12-04 16:00:00'),
        ev('PAINEL', '2026-12-04 17:00:00', '2026-12-04 18:00:00')
    ];
    assert.equal(D.select(raw, NOW, OPTS).destaques.length, 2);
});

test('limite de slides: fica com os primeiros do dia e informa quantos existiam', () => {
    const raw = [];
    for (let h = 15; h < 23; h += 1) { raw.push(ev('H' + h, '2026-12-04 ' + h + ':00:00', '2026-12-04 ' + h + ':30:00')); }
    const s = D.select(raw, NOW, OPTS);
    assert.equal(s.destaques.length, 6);
    assert.equal(s.encontrados, 8);
    assert.equal(titulos(s)[0], 'H15');
    assert.equal(D.select(raw, NOW, Object.assign({}, OPTS, { max: 0 })).destaques.length, 8);
});

test('fim ausente usa a duracao padrao; palco desconhecido segue na lista', () => {
    const s = D.select([ev('A', '2026-12-04 14:00:00', '', { category: '99999' })], NOW, OPTS);
    assert.equal(s.destaques[0].endMs - s.destaques[0].startMs, 60 * 60000);
    assert.equal(s.destaques[0].category, '99999');
});

test('foto ausente nao descarta o destaque', () => {
    const s = D.select([ev('A', '2026-12-04 15:00:00', '2026-12-04 16:00:00', { foto: '' })], NOW, OPTS);
    assert.equal(s.destaques.length, 1);
    assert.equal(s.destaques[0].photo, '');
});

test('estado e substituido a cada chamada (sem acumular)', () => {
    const raw = [ev('A', '2026-12-04 15:00:00', '2026-12-04 16:00:00')];
    D.select(raw, NOW, OPTS);
    assert.equal(D.select(raw, NOW, OPTS).destaques.length, 1);
});
