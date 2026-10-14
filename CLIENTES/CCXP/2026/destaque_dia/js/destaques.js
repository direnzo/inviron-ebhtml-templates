/**
 * CCXP26 - logica pura do Destaque do Dia (sem DOM, sem EBHTML).
 * Roda no player (window.Destaques) e em Node (testes em ../../tests).
 * Datas, fuso e normalizacao vem de programacao.js (window.Programacao).
 *
 * Regras:
 * - Entra so o registro com o marcador de destaque (opts.marcador, padrao TEXTO2 === '1')
 *   que comeca no dia de hoje (dia civil no fuso do evento) e ainda nao terminou.
 * - Todos os palcos juntos: cada destaque traz o proprio palco (ev.category).
 * - Ordem cronologica; duplicados (mesmo titulo + inicio) e registros invalidos sao descartados.
 */
(function (root) {
    'use strict';

    const P = (typeof module !== 'undefined' && module.exports) ? require('./programacao.js') : root.Programacao;

    /**
     * rawEvents: [{ category, titulo, texto, texto2, foto, date, dtEnd, dtUpdate }]
     * opts: { offsetMin, fallbackDurationMin, marcador ('1'), max (0 = sem limite) }
     * Retorna { destaques[], encontrados, descartados }:
     * - destaques: validos de hoje, em ordem, limitados a opts.max;
     * - encontrados: validos de hoje antes do limite;
     * - descartados: invalidos (sem titulo, data ruim) e duplicados.
     */
    function select(rawEvents, nowMs, opts) {
        const marcador = opts.marcador != null ? String(opts.marcador) : '1';
        const today = P.dayKey(nowMs, opts.offsetMin);
        const seen = {};
        const found = [];
        let descartados = 0;
        rawEvents.forEach(function (raw) {
            const ev = P.normalizeEvent(raw, opts);
            if (!ev) {
                if (String(raw.texto2 || '').trim() === marcador) { descartados += 1; }
                return;
            }
            if (ev.highlight !== marcador) { return; } // evento comum da programacao, nao e destaque
            if (seen[ev.key]) { descartados += 1; return; }
            seen[ev.key] = true;
            if (P.dayKey(ev.startMs, opts.offsetMin) !== today || ev.endMs <= nowMs) { return; }
            found.push(ev);
        });
        found.sort(function (a, b) {
            return a.startMs - b.startMs || a.endMs - b.endMs || (a.title < b.title ? -1 : 1);
        });
        const max = opts.max > 0 ? opts.max : found.length;
        return { destaques: found.slice(0, max), encontrados: found.length, descartados: descartados };
    }

    /**
     * Sequencia: intro -> 1 step por destaque -> outro. Sem destaque: [] (nao exibe).
     * timing: { intro, destaque, outro } em ms.
     */
    function buildSteps(selection, timing) {
        if (!selection.destaques.length) { return []; }
        const steps = [{ type: 'intro', ms: timing.intro }];
        selection.destaques.forEach(function (ev) {
            steps.push({ type: 'destaque', ms: timing.destaque, events: [ev] });
        });
        steps.push({ type: 'outro', ms: timing.outro });
        return steps;
    }

    function totalMs(steps) {
        return steps.reduce(function (sum, step) { return sum + step.ms; }, 0);
    }

    const api = { select: select, buildSteps: buildSteps, totalMs: totalMs };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    } else {
        root.Destaques = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
