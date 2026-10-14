/**
 * CCXP26 - logica pura da programacao por palco (sem DOM, sem EBHTML).
 * Roda no player (window.Programacao) e em Node (testes em ../tests).
 *
 * Regras:
 * - Todo horario vira epoch UTC (ms); comparacoes usam sempre epoch, nunca "HH:MM".
 * - Datas sem fuso sao interpretadas no fuso do evento (opcoes.offsetMin).
 * - "Hoje" e o dia civil do evento no fuso do evento.
 */
(function (root) {
    'use strict';

    const RE_ISO = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?\s*(Z|[+-]\d{2}:?\d{2})?$/;
    const RE_MDY = /^(\d{2})-(\d{2})-(\d{4})[ T](\d{2}):(\d{2})(?::(\d{2}))?\s*(Z|[+-]\d{2}:?\d{2})?$/;

    function pad2(n) {
        return n < 10 ? '0' + n : String(n);
    }

    function parseOffset(text, fallbackMin) {
        if (!text) { return fallbackMin; }
        if (text === 'Z') { return 0; }
        const sign = text.charAt(0) === '-' ? -1 : 1;
        const digits = text.slice(1).replace(':', '');
        return sign * (parseInt(digits.slice(0, 2), 10) * 60 + parseInt(digits.slice(2, 4), 10));
    }

    /**
     * Aceita "YYYY-MM-DD HH:MM[:SS]" e "MM-DD-YYYY HH:MM[:SS]" (formato da API do site),
     * com ou sem fuso (Z, +HH:MM, -HH:MM). Retorna epoch UTC em ms ou NaN.
     */
    function parseDateTime(text, defaultOffsetMin) {
        if (typeof text !== 'string') { return NaN; }
        const value = text.trim();
        let y;
        let mo;
        let d;
        let m = RE_ISO.exec(value);
        let offText;
        if (m) {
            y = +m[1]; mo = +m[2]; d = +m[3];
        } else {
            m = RE_MDY.exec(value);
            if (!m) { return NaN; }
            mo = +m[1]; d = +m[2]; y = +m[3];
        }
        const hh = +m[4];
        const mm = +m[5];
        const ss = m[6] ? +m[6] : 0;
        offText = m[7];
        if (mo < 1 || mo > 12 || d < 1 || d > 31 || hh > 23 || mm > 59 || ss > 59) { return NaN; }
        const utc = Date.UTC(y, mo - 1, d, hh, mm, ss);
        const check = new Date(utc);
        if (check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) { return NaN; }
        return utc - parseOffset(offText, defaultOffsetMin) * 60000;
    }

    /** Relogio de parede no fuso do evento. */
    function wallClock(utcMs, offsetMin) {
        const date = new Date(utcMs + offsetMin * 60000);
        return {
            y: date.getUTCFullYear(),
            m: date.getUTCMonth() + 1,
            d: date.getUTCDate(),
            hh: date.getUTCHours(),
            mm: date.getUTCMinutes()
        };
    }

    function dayKey(utcMs, offsetMin) {
        const w = wallClock(utcMs, offsetMin);
        return w.y * 10000 + w.m * 100 + w.d;
    }

    /** "13h30" (hora com 2 digitos, como a programacao de 2025). */
    function formatHora(utcMs, offsetMin) {
        const w = wallClock(utcMs, offsetMin);
        return pad2(w.hh) + 'h' + pad2(w.mm);
    }

    /** "9:41" (sem zero a esquerda, como o relogio da arte 2026). */
    function formatRelogio(utcMs, offsetMin) {
        const w = wallClock(utcMs, offsetMin);
        return w.hh + ':' + pad2(w.mm);
    }

    /**
     * Converte um registro bruto do dataset em evento normalizado, ou null se inutilizavel.
     * raw: { category, titulo, texto, texto2, foto, date, dtEnd, dtUpdate }
     */
    function normalizeEvent(raw, opts) {
        const offsetMin = opts.offsetMin;
        const title = String(raw.texto || '').replace(/\s+/g, ' ').trim();
        const startMs = parseDateTime(raw.date, offsetMin);
        if (!title || isNaN(startMs)) { return null; }
        let endMs = parseDateTime(raw.dtEnd, offsetMin);
        if (isNaN(endMs) || endMs <= startMs) {
            endMs = startMs + opts.fallbackDurationMin * 60000;
        }
        return {
            key: title.toLowerCase() + '|' + startMs,
            category: String(raw.category || '').trim(),
            stageTitle: String(raw.titulo || '').trim(),
            title: title,
            photo: String(raw.foto || '').trim(),
            highlight: String(raw.texto2 || '').trim(),
            startMs: startMs,
            endMs: endMs
        };
    }

    /**
     * Seleciona o que cada step mostra.
     * opts: { offsetMin, stageId, filterClientSide, fallbackDurationMin, maxLista }
     * Retorna { atual, proximo, depois[], amanha[], descartados }.
     * - depois: ate maxLista paineis de hoje apos o proximo ("Ainda hoje").
     * - amanha: ate maxLista paineis do dia seguinte (slide proprio "Amanha").
     */
    function select(rawEvents, nowMs, opts) {
        const seen = {};
        const events = [];
        let descartados = 0;
        const stageId = String(opts.stageId || '');
        rawEvents.forEach(function (raw) {
            const ev = normalizeEvent(raw, opts);
            if (!ev || seen[ev.key]) { descartados += 1; return; }
            if (opts.filterClientSide && stageId && ev.category && ev.category !== stageId) {
                descartados += 1;
                return;
            }
            seen[ev.key] = true;
            events.push(ev);
        });
        events.sort(function (a, b) {
            return a.startMs - b.startMs || a.endMs - b.endMs || (a.title < b.title ? -1 : 1);
        });

        const today = dayKey(nowMs, opts.offsetMin);
        const alive = events.filter(function (ev) { return ev.endMs > nowMs; });
        const running = alive.filter(function (ev) { return ev.startMs <= nowMs; });
        const future = alive.filter(function (ev) {
            return ev.startMs > nowMs && dayKey(ev.startMs, opts.offsetMin) === today;
        });
        const amanhaKey = dayKey(nowMs + 86400000, opts.offsetMin);
        const amanha = alive.filter(function (ev) {
            return ev.startMs > nowMs && dayKey(ev.startMs, opts.offsetMin) === amanhaKey;
        }).slice(0, opts.maxLista);
        const depois = future.slice(1, 1 + opts.maxLista);
        const lista = depois.map(function (ev) { return Object.assign({}, ev, { dia: 'hoje' }); })
            .concat(amanha.slice(0, opts.maxLista - depois.length)
                .map(function (ev) { return Object.assign({}, ev, { dia: 'amanha' }); }));
        return {
            atual: running.length ? running[0] : null,
            proximo: future.length ? future[0] : null,
            depois: depois,
            amanha: amanha,
            descartados: descartados
        };
    }

    /**
     * Monta a sequencia de steps (sem intro/outro de video quando nao ha conteudo).
     * timing: { intro, rolando, daqui, ainda, outro } em ms.
     */
    function buildSteps(selection, timing) {
        const steps = [];
        if (!selection.atual && !selection.proximo && !selection.depois.length && !selection.amanha.length) { return steps; }
        steps.push({ type: 'intro', ms: timing.intro });
        if (selection.atual) {
            steps.push({ type: 'rolando', ms: timing.rolando, events: [selection.atual] });
        }
        if (selection.proximo) {
            steps.push({ type: 'daqui', ms: timing.daqui, events: [selection.proximo] });
        }
        if (selection.depois.length) {
            steps.push({ type: 'ainda', ms: timing.ainda, events: selection.depois });
        }
        if (selection.amanha.length) {
            steps.push({ type: 'amanha', ms: timing.amanha || timing.ainda, events: selection.amanha });
        }
        steps.push({ type: 'outro', ms: timing.outro });
        return steps;
    }

    function totalMs(steps) {
        return steps.reduce(function (sum, step) { return sum + step.ms; }, 0);
    }

    const api = {
        parseDateTime: parseDateTime,
        wallClock: wallClock,
        dayKey: dayKey,
        formatHora: formatHora,
        formatRelogio: formatRelogio,
        normalizeEvent: normalizeEvent,
        select: select,
        buildSteps: buildSteps,
        totalMs: totalMs
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    } else {
        root.Programacao = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
