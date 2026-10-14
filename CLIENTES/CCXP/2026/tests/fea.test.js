'use strict';
// Rodar: node --test CLIENTES/CCXP/2026/tests/fea.test.js (Node 22 nao aceita a pasta)
const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../fotos_autografos/js/programacao.js');
const F = require('../fotos_autografos/js/fea.js');

const TZ = -180;
const MODS = { 'autografo': 'Autógrafo', 'foto individual': 'Foto individual', 'selfie': 'Selfie' };
const OPTS = { offsetMin: TZ, duracaoPadraoMin: 60, esgotadoValor: 'sim', modalidades: MODS, maxModalidades: 5, limiteGrande: 3 };
const at = (text) => P.parseDateTime(text, TZ);
const NOW = at('2026-12-04 14:40:00');
const TIMING = { intro: 5000, pagina: 10000, outro: 11000 };

function sessao(artista, modalidade, inicio, fim, extra) {
    return Object.assign({ artista: artista, foto: 'f.jpg', modalidade: modalidade, inicio: inicio, fim: fim, esgotado: '' }, extra || {});
}
const D = '2026-12-04 ';
const nomes = (s) => s.artistas.map((a) => a.nome);
const tipos = (s, n) => F.buildSteps(s, TIMING, n || 2).map((x) => x.type);

test('sem dados: nada a exibir', () => {
    const s = F.selecionar([], NOW, OPTS);
    assert.deepEqual(F.buildSteps(s, TIMING, 2), []);
    assert.equal(F.totalMs([]), 0);
});

test('um artista: intro, 1 pagina, outro (26 s)', () => {
    const s = F.selecionar([sessao('Ana', 'Autografo', D + '15:00:00', D + '16:00:00')], NOW, OPTS);
    assert.deepEqual(tipos(s), ['intro', 'pagina', 'outro']);
    assert.equal(F.totalMs(F.buildSteps(s, TIMING, 2)), 26000);
    assert.equal(F.paginar(s.artistas, 2)[0].length, 1);
});

test('dois artistas cabem em 1 pagina; tres viram 2 (a ultima com 1)', () => {
    const raw = ['Ana', 'Bia', 'Caio'].map((n) => sessao(n, 'Selfie', D + '15:00:00', D + '16:00:00'));
    assert.deepEqual(F.paginar(F.selecionar(raw.slice(0, 2), NOW, OPTS).artistas, 2).map((p) => p.length), [2]);
    const tres = F.selecionar(raw, NOW, OPTS);
    assert.deepEqual(F.paginar(tres.artistas, 2).map((p) => p.length), [2, 1]);
    assert.equal(F.totalMs(F.buildSteps(tres, TIMING, 2)), 5000 + 2 * 10000 + 11000);
});

test('ordem alfabetica sem acento nem caixa', () => {
    const raw = ['Zeca', 'álvaro', 'Émerson', 'bruno', 'ÁGATA', 'Ana'].map((n) => sessao(n, 'Selfie', D + '15:00:00', D + '16:00:00'));
    assert.deepEqual(nomes(F.selecionar(raw, NOW, OPTS)), ['ÁGATA', 'álvaro', 'Ana', 'bruno', 'Émerson', 'Zeca']);
});

test('so sessoes de hoje: ontem e amanha ficam de fora', () => {
    const raw = [
        sessao('Ontem', 'Selfie', '2026-12-03 15:00:00', '2026-12-03 16:00:00'),
        sessao('Amanha', 'Selfie', '2026-12-05 15:00:00', '2026-12-05 16:00:00'),
        sessao('Hoje', 'Selfie', D + '15:00:00', D + '16:00:00')
    ];
    assert.deepEqual(nomes(F.selecionar(raw, NOW, OPTS)), ['Hoje']);
});

test('sessao encerrada some; fim exato ja nao vale', () => {
    const raw = [
        sessao('Ana', 'Selfie', D + '13:00:00', D + '14:00:00'),
        sessao('Bia', 'Selfie', D + '13:00:00', D + '14:40:00'),
        sessao('Caio', 'Selfie', D + '14:00:00', D + '15:00:00')
    ];
    const s = F.selecionar(raw, NOW, OPTS);
    assert.deepEqual(nomes(s), ['Caio']);
    assert.equal(s.sessoes, 1);
});

test('artista sem sessoes restantes sai; as vivas continuam', () => {
    const raw = [
        sessao('Ana', 'Autografo', D + '10:00:00', D + '11:00:00'),
        sessao('Ana', 'Selfie', D + '16:00:00', D + '17:00:00'),
        sessao('Bia', 'Autografo', D + '10:00:00', D + '11:00:00')
    ];
    const s = F.selecionar(raw, NOW, OPTS);
    assert.deepEqual(nomes(s), ['Ana']);
    assert.deepEqual(s.artistas[0].sessoes.map((x) => x.rotulo), ['Selfie']);
});

test('troca de dia: o mesmo conjunto vira outro dia', () => {
    const raw = [sessao('Ana', 'Selfie', '2026-12-05 10:00:00', '2026-12-05 11:00:00')];
    assert.deepEqual(nomes(F.selecionar(raw, NOW, OPTS)), []);
    assert.deepEqual(nomes(F.selecionar(raw, at('2026-12-05 09:00:00'), OPTS)), ['Ana']);
    assert.deepEqual(nomes(F.selecionar(raw, at('2026-12-04 23:59:00'), OPTS)), []);
});

test('fuso: 01:00 UTC de 05/12 ainda e 04/12 em -03:00', () => {
    const raw = [sessao('Ana', 'Selfie', '2026-12-05T01:00:00Z', '2026-12-05T02:00:00Z')];
    assert.deepEqual(nomes(F.selecionar(raw, NOW, OPTS)), ['Ana']);
});

test('agrupa por artista ignorando acento/caixa; variante grande ate 3, compacta de 4 a 5', () => {
    const base = [
        sessao('Maria José', 'Autografo', D + '15:00:00', D + '15:30:00'),
        sessao('MARIA JOSE', 'Foto individual', D + '15:30:00', D + '16:00:00'),
        sessao('maria josé ', 'Selfie', D + '16:00:00', D + '16:30:00')
    ];
    const s3 = F.selecionar(base, NOW, OPTS);
    assert.equal(s3.artistas.length, 1);
    assert.equal(s3.artistas[0].sessoes.length, 3);
    assert.equal(s3.artistas[0].variante, 'grande');
    const quatro = base.concat([sessao('Maria José', 'Foto em dupla', D + '16:30:00', D + '17:00:00')]);
    assert.equal(F.selecionar(quatro, NOW, OPTS).artistas[0].variante, 'compacta');
    const cinco = quatro.concat([sessao('Maria José', 'Foto em grupo', D + '17:00:00', D + '17:30:00')]);
    const s5 = F.selecionar(cinco, NOW, OPTS);
    assert.equal(s5.artistas[0].sessoes.length, 5);
    assert.equal(s5.artistas[0].variante, 'compacta');
});

test('mais de 5 modalidades: ignora o excedente e conta', () => {
    const raw = [];
    for (let i = 0; i < 7; i += 1) { raw.push(sessao('Ana', 'Mod' + i, D + (15 + i % 5) + ':' + (i < 5 ? '00' : '30') + ':00', D + '23:00:00')); }
    const s = F.selecionar(raw, NOW, OPTS);
    assert.equal(s.artistas[0].sessoes.length, 5);
    assert.equal(s.excedentes, 2);
    assert.equal(s.sessoes, 7);
});

test('sessoes do artista em ordem de horario', () => {
    const raw = [
        sessao('Ana', 'Selfie', D + '17:00:00', D + '17:30:00'),
        sessao('Ana', 'Autografo', D + '15:00:00', D + '15:30:00')
    ];
    assert.deepEqual(F.selecionar(raw, NOW, OPTS).artistas[0].sessoes.map((x) => x.rotulo), ['Autógrafo', 'Selfie']);
});

test('horario "11h25 - 12h00"; sem DT_END valido mostra so o inicio', () => {
    const s = F.selecionar([
        sessao('Ana', 'Autografo', D + '15:25:00', D + '16:00:00'),
        sessao('Bia', 'Autografo', D + '15:25:00', ''),
        sessao('Caio', 'Autografo', D + '15:25:00', D + '15:00:00')
    ], NOW, OPTS);
    assert.deepEqual(s.artistas.map((a) => a.sessoes[0].horario), ['15h25 - 16h00', '15h25', '15h25']);
});

test('esgotado: TEXTO3 = sim (sem caixa/espacos); outro valor nao', () => {
    const s = F.selecionar([
        sessao('Ana', 'Autografo', D + '15:00:00', D + '16:00:00', { esgotado: ' SIM ' }),
        sessao('Bia', 'Autografo', D + '15:00:00', D + '16:00:00', { esgotado: 'nao' }),
        sessao('Caio', 'Autografo', D + '15:00:00', D + '16:00:00', { esgotado: '' })
    ], NOW, OPTS);
    assert.deepEqual(s.artistas.map((a) => a.sessoes[0].esgotado), [true, false, false]);
});

test('modalidade desconhecida ou vazia nunca descarta', () => {
    const s = F.selecionar([
        sessao('Ana', 'Abraço Coletivo', D + '15:00:00', D + '16:00:00'),
        sessao('Bia', '', D + '15:00:00', D + '16:00:00')
    ], NOW, OPTS);
    assert.deepEqual(s.artistas.map((a) => a.sessoes[0].rotulo), ['Abraço Coletivo', '']);
    assert.equal(s.descartados, 0);
});

test('registros invalidos e duplicados sao descartados', () => {
    const s = F.selecionar([
        sessao('', 'Selfie', D + '15:00:00', D + '16:00:00'),
        sessao('Ana', 'Selfie', 'lixo', D + '16:00:00'),
        sessao('Ana', 'Selfie', D + '15:00:00', D + '16:00:00'),
        sessao('ana', 'Selfie', D + '15:00:00', D + '16:00:00')
    ], NOW, OPTS);
    assert.equal(s.descartados, 3);
    assert.equal(s.artistas[0].sessoes.length, 1);
});

test('foto: usa a primeira sessao com foto; sem foto fica vazia', () => {
    const s = F.selecionar([
        sessao('Ana', 'Autografo', D + '15:00:00', D + '15:30:00', { foto: '' }),
        sessao('Ana', 'Selfie', D + '16:00:00', D + '16:30:00', { foto: 'a.jpg' }),
        sessao('Bia', 'Selfie', D + '16:00:00', D + '16:30:00', { foto: '' })
    ], NOW, OPTS);
    assert.deepEqual(s.artistas.map((a) => a.foto), ['a.jpg', '']);
});

test('titulo longo nao altera a selecao (corte e do layout)', () => {
    const longo = 'Elenco de O Senhor dos Anéis: A Sociedade do Anel com convidados especiais e muito mais texto '.repeat(3);
    const s = F.selecionar([sessao(longo, 'Selfie', D + '15:00:00', D + '16:00:00')], NOW, OPTS);
    assert.equal(s.artistas[0].nome.startsWith('Elenco'), true);
});
