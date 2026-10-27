/**
 * CCXP26 - logica pura de Fotos e Autografos (sem DOM, sem EBHTML).
 * Roda no player (window.Fea) e em Node (testes em ../tests).
 * Datas, fuso e formatacao vem de programacao.js (window.Programacao).
 *
 * Regras:
 * - Cada registro e uma SESSAO (artista + modalidade + inicio/termino). So entra sessao que comeca
 *   hoje (dia civil no fuso do evento) e ainda nao terminou (termino > agora).
 * - Artista = TITULO normalizado (sem acento/caixa/espacos extras): sessoes do mesmo artista viram
 *   uma lista de modalidades; artista sem sessao restante sai.
 * - Ordem alfabetica do artista (chave normalizada); sessoes por inicio. Paginas de N artistas.
 * - Modalidade desconhecida nunca descarta: usa o proprio texto como rotulo.
 */
(function (root) {
    'use strict';

    const P = (typeof module !== 'undefined' && module.exports) ? require('./programacao.js') : root.Programacao;

    /** Chave de comparacao: sem acento, minuscula, espacos colapsados. */
    function chave(texto) {
        return String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/\s+/g, ' ').trim().toLowerCase();
    }

    function limpo(texto) {
        return String(texto || '').replace(/\s+/g, ' ').trim();
    }

    /** Mantem o padrao pronto; nos demais casos, formata os instantes calculados. */
    function formatarHorario(texto, inicioMs, fimMs, offsetMin) {
        const valor = limpo(texto);
        if (/^\d{2}h\d{2} - \d{2}h\d{2}$/.test(valor)) { return valor; }
        return P.formatHora(inicioMs, offsetMin) + ' - ' + P.formatHora(fimMs, offsetMin);
    }

    /**
        * raw: { artista, foto, modalidade, data, esgotado, horarioTexto } (strings do dataset).
        * opts: { anoEvento, offsetMin, duracaoPadraoMin, esgotadoValor, modalidades }.
        * horarioTexto aceita H:MM ou HhMM; a exibicao e sempre HHhMM - HHhMM.
        * Retorna a sessao normalizada ou null (sem artista, data ou horario valido).
     */
    function normalizarSessao(raw, opts) {
        const nome = limpo(raw.artista);
        const data = /^([0-3]\d)\/([01]\d)$/.exec(limpo(raw.data));
        const horarios = limpo(raw.horarioTexto).match(/\d{1,2}[:h]\d{2}/gi) || [];
        if (!data || !horarios.length) { return null; }
        const dataISO = opts.anoEvento + '-' + data[2] + '-' + data[1];
        const startMs = P.parseDateTime(dataISO + ' ' + horarios[0].replace(/[hH]/, ':'), opts.offsetMin);
        if (!nome || isNaN(startMs)) { return null; }
        let endMs = horarios.length > 1
            ? P.parseDateTime(dataISO + ' ' + horarios[horarios.length - 1].replace(/[hH]/, ':'), opts.offsetMin)
            : NaN;
        const fimValido = !isNaN(endMs) && endMs > startMs;
        if (!fimValido) { endMs = startMs + (opts.duracaoPadraoMin || 60) * 60000; }
        const modalidade = limpo(raw.modalidade);
        const mapa = opts.modalidades || {};
        const horario = formatarHorario(raw.horarioTexto, startMs, endMs, opts.offsetMin);
        const alvo = String(opts.esgotadoValor != null ? opts.esgotadoValor : 'sim');
        return {
            artista: nome,
            artistaKey: chave(nome),
            foto: limpo(raw.foto),
            modalidade: modalidade,
            modalidadeKey: chave(modalidade),
            rotulo: mapa[chave(modalidade)] || modalidade,
            startMs: startMs,
            endMs: endMs,
            horario: horario,
            esgotado: chave(raw.esgotado) === chave(alvo)
        };
    }

    /**
     * Seleciona e agrupa. opts: normalizarSessao + { maxModalidades (0 = sem limite), limiteGrande }.
     * Retorna { artistas[], sessoes, descartados, excedentes }:
     * - artistas: [{ nome, key, foto, variante, sessoes[] }] em ordem alfabetica;
    * - sessoes: sessoes futuras ou em andamento (antes do limite de modalidades);
     * - descartados: sem artista, inicio invalido ou duplicadas;
     * - excedentes: sessoes ignoradas por passar de maxModalidades.
     */
    function selecionar(rawSessoes, nowMs, opts) {
        const vistas = {};
        const porArtista = {};
        let descartados = 0;
        let sessoes = 0;
        rawSessoes.forEach(function (raw) {
            const s = normalizarSessao(raw, opts);
            if (!s) { descartados += 1; return; }
            const id = s.artistaKey + '|' + s.modalidadeKey + '|' + s.startMs;
            if (vistas[id]) { descartados += 1; return; }
            vistas[id] = true;
            if (s.endMs <= nowMs) { return; }
            sessoes += 1;
            (porArtista[s.artistaKey] = porArtista[s.artistaKey] || []).push(s);
        });

        const max = opts.maxModalidades > 0 ? opts.maxModalidades : Infinity;
        const limiteGrande = opts.limiteGrande != null ? opts.limiteGrande : 3;
        let excedentes = 0;
        const artistas = Object.keys(porArtista).sort().map(function (key) {
            const lista = porArtista[key].sort(function (a, b) {
                return a.startMs - b.startMs || a.endMs - b.endMs || (a.modalidadeKey < b.modalidadeKey ? -1 : 1);
            });
            excedentes += Math.max(0, lista.length - max);
            const visiveis = lista.slice(0, max);
            const comFoto = lista.filter(function (s) { return s.foto; })[0];
            return {
                nome: lista[0].artista,
                key: key,
                foto: comFoto ? comFoto.foto : '',
                variante: visiveis.length <= limiteGrande ? 'grande' : 'compacta',
                sessoes: visiveis
            };
        });
        return { artistas: artistas, sessoes: sessoes, descartados: descartados, excedentes: excedentes };
    }

    /** Divide em paginas de porPagina artistas (a ultima pode ter menos). */
    function paginar(artistas, porPagina) {
        const n = porPagina > 0 ? porPagina : 2;
        const paginas = [];
        for (let i = 0; i < artistas.length; i += n) { paginas.push(artistas.slice(i, i + n)); }
        return paginas;
    }

    /**
     * Sequencia: intro -> 1 step por pagina -> outro. Sem artista: [] (nao exibe).
     * timing: { intro, pagina, outro } em ms.
     */
    function buildSteps(selecao, timing, porPagina) {
        if (!selecao.artistas.length) { return []; }
        const steps = [{ type: 'intro', ms: timing.intro }];
        paginar(selecao.artistas, porPagina).forEach(function (artistas) {
            steps.push({ type: 'pagina', ms: timing.pagina, artistas: artistas });
        });
        steps.push({ type: 'outro', ms: timing.outro });
        return steps;
    }

    function totalMs(steps) {
        return steps.reduce(function (sum, step) { return sum + step.ms; }, 0);
    }

    const api = {
        chave: chave,
        normalizarSessao: normalizarSessao,
        selecionar: selecionar,
        paginar: paginar,
        buildSteps: buildSteps,
        totalMs: totalMs
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    } else {
        root.Fea = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
