/**
 * Mock de dados de desenvolvimento. Usa o EBHTML real: loaded()/finished() vao para o player.
 * MOCK_DATA.enabled = false E remover/comentar o <script> deste arquivo.
 *
 * Parametros de URL:
 *   ?mock=0                    usa o EBHTML real (sem mock)
 * Somente com o mock ativo:
 *   ?cenario=dia               (padrao) 10 artistas, 1 a 5 modalidades, esgotados, 1 encerrado
 *            um|dois|tres|quatro   quantidade de artistas (paginas de 2)
 *            modalidades       1 artista por quantidade de modalidades (1 a 5), 1 por pagina de 2
 *            cinco|tres3       1 artista com 5 modalidades (compacta) / com 3 (grande)
 *            esgotado          todos os horarios esgotados
 *            textos            titulos curtos, longos, extremos, palavra longa e rotulos longos
 *            semFoto|invalido|desconhecida|encerrado|amanha|vazio|erro
 *            muitos            14 artistas (7 paginas)
 *            evento            5 dias de horario real: o que passou some (a noite pode ficar vazio)
 *   ?pular=N                   descarta os N primeiros artistas (ordem alfabetica): ver paginas seguintes
 *   ?rapido=1                  deslize sem espera (entrada 1 ms): capturas de tela deterministicas
 *   ?hora=14:40                hora simulada de hoje (avanca em tempo real)
 *   ?agora=2026-12-04T14:40:00-03:00   data/hora simulada completa
 * window.__calls: loaded()/finished(); window.__textos: ajuste do titulo de cada artista.
 */
const MOCK_DATA = { enabled: !/[?&]mock=0(&|$)/.test(window.location.search) };

(function () {
    if (!MOCK_DATA.enabled) { return; }

    const params = new URLSearchParams(window.location.search);
    const cenario = params.get('cenario') || 'dia';
    if (params.get('rapido')) {
        CONFIG.tempos.entrada = 1;
        CONFIG.tempos.escalonar = 0;
        CONFIG.tempos.escalonarSaida = 0;
    }
    const pular = parseInt(params.get('pular'), 10) || 0;
    const calls = (window.__calls = []);
    const startedAt = Date.now();
    const offsetMin = CONFIG.fuso;
    const MIN = 60000;
    const DIA = 24 * 60 * MIN;

    function inicioDoDia(ms) {
        const w = new Date(ms + offsetMin * MIN);
        return Date.UTC(w.getUTCFullYear(), w.getUTCMonth(), w.getUTCDate()) - offsetMin * MIN;
    }

    // Hora do mock: real por padrao; ?hora / ?agora simulam e avancam em tempo real.
    let baseNow = startedAt;
    const agora = params.get('agora');
    const hora = /^(\d{1,2}):(\d{2})$/.exec(params.get('hora') || '');
    if (agora && !isNaN(Date.parse(agora))) {
        baseNow = Date.parse(agora);
    } else if (hora) {
        baseNow = inicioDoDia(startedAt) + (+hora[1] * 60 + +hora[2]) * MIN;
    }
    MOCK_DATA.now = function () { return baseNow + (Date.now() - startedAt); };

    function pad(n) { return n < 10 ? '0' + n : String(n); }
    function stamp(ms) {
        const d = new Date(ms + offsetMin * MIN);
        return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + ' ' +
            pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':00';
    }

    // Fotos de picsum.photos (uso so de mock), em mock/fotos/p01..p20.jpg.
    const TOTAL_FOTOS = 20;
    function hm(ms) {
        const d = new Date(ms + offsetMin * MIN);
        return pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes());
    }
    /** TEXTO2 como no CMS de 2025: "12:00 às 13:00". */
    function periodoTexto(ini, fim) { return hm(ini) + ' às ' + hm(fim); }

    function foto(n) {
        const i = (n * 7 + 3) % TOTAL_FOTOS + 1;
        return 'mock/fotos/p' + (i < 10 ? '0' + i : i) + '.jpg';
    }

    const MOD = ['Autógrafo', 'Foto individual', 'Foto em dupla', 'Foto em grupo', 'Selfie', 'Meet&Greet'];
    const NOMES = ['Elenco de Senhor dos Anéis', 'Ana Souza',
        'Álvaro Mendes e o elenco de Guardiões da Galáxia',
        'Bruno Carvalho e os criadores de Mundos Fantásticos', 'Émerson Lima',
        'Carla Dias', 'Zeca Pagodinho Jr.', 'Marina Alves', 'Quarteto Fantástico', 'João Pedro', 'Elenco de The Boys',
        'Daniela Rocha', 'Fernanda Costa', 'Gustavo Reis'];
    const LONGOS = ['Elenco de A Guerra dos Tronos: A Casa do Dragão com convidados especiais da produção',
        'Criadores e dubladores de Dragon Ball Super reunidos para o encontro histórico com os fãs brasileiros em 2026'];
    const EXTREMO = 'Encontro histórico reunindo diretores, atores, roteiristas, ilustradores, dubladores e produtores de várias gerações para uma conversa aberta com os fãs';
    const PALAVRA = 'Supercalifragilisticexpialidocious Supercalifragilisticexpialidocious';

    /** Sessao: artista `nome`, modalidade `mod`, comeca `ini` min depois de "agora", dura `dur`. */
    const limiteHoje = inicioDoDia(baseNow) + DIA - 90 * MIN;
    function sessao(nome, mod, ini, dur, extra) {
        const inicio = Math.min(baseNow + ini * MIN, limiteHoje);
        const rec = {
            TITULO: nome, FOTO: foto(nome.length + ini), CATEGORY: mod, TEXTO: '',
            DT_BEGIN: stamp(inicio), DT_END: stamp(inicio + dur * MIN), TEXTO3: '',
            TEXTO2: periodoTexto(inicio, inicio + dur * MIN)
        };
        for (const k in (extra || {})) { rec[k] = extra[k]; }
        return rec;
    }

    /** Artista com n modalidades, a partir de `ini`; os indices em `esgot` ficam esgotados. */
    function artista(nome, n, ini, esgot, extra) {
        const out = [];
        for (let i = 0; i < n; i += 1) {
            const e = Object.assign({}, extra || {});
            if (esgot && esgot.indexOf(i) !== -1) { e.TEXTO3 = 'sim'; }
            out.push(sessao(nome, MOD[i % MOD.length], ini + i * 35, 30, e));
        }
        return out;
    }
    function flat(listas) { return [].concat.apply([], listas); }

    function artistas(qtd, ini) {
        const ns = [3, 5, 2, 4, 1, 5, 3, 2, 4, 3, 5, 1, 3, 2];
        const lista = [];
        for (let i = 0; i < qtd; i += 1) {
            lista.push(artista(NOMES[i % NOMES.length], ns[i % ns.length], (ini || 10) + i * 5, i % 3 === 1 ? [ns[i % ns.length] - 1] : []));
        }
        return flat(lista);
    }

    function eventoCincoDias() {
        const out = [];
        const hoje = inicioDoDia(baseNow);
        for (let d = 0; d < 5; d += 1) {
            for (let a = 0; a < 6; a += 1) {
                for (let m = 0; m < 1 + (a + d) % 4; m += 1) {
                    const ini = hoje + d * DIA + (10 * 60 + a * 90 + m * 30) * MIN;
                    out.push({
                        TITULO: NOMES[(d * 6 + a) % NOMES.length], FOTO: foto(d * 6 + a), CATEGORY: MOD[m % 5],
                        TEXTO: '', DT_BEGIN: stamp(ini), DT_END: stamp(ini + 25 * MIN), TEXTO3: m === 2 ? 'sim' : '',
                        TEXTO2: periodoTexto(ini, ini + 25 * MIN)
                    });
                }
            }
        }
        return out;
    }

    function cenarioRegistros(nome) {
        switch (nome) {
            case 'um': return artistas(1);
            case 'dois': return artistas(2);
            case 'tres': return artistas(3);
            case 'quatro': return artistas(4);
            case 'muitos': return artistas(14);
            case 'modalidades': return flat([1, 2, 3, 4, 5].map(function (n, i) { return artista(NOMES[i + 1], n, 10 + i); }));
            case 'cinco': return artista(NOMES[0], 5, 10, [4]);
            case 'tres3': return artista(NOMES[0], 3, 10, [1]);
            case 'esgotado': return flat([1, 2, 3, 4].map(function (n, i) { return artista(NOMES[i], n, 10 + i, [0, 1, 2, 3]); }));
            case 'textos': return flat([NOMES[0], PALAVRA, 'Ana', LONGOS[0], LONGOS[1], EXTREMO, 'ÁGATA ÉPICA ÍNTIMA ÓPERA ÚNICA AÇÃO']
                .map(function (n, i) { return artista(n, 1 + i % 4, 10 + i); }))
                .concat([sessao('Rotulo Longo', 'Encontro com o elenco e a produção para fotos e autógrafos especiais', 12, 30)]);
            case 'semFoto': return flat([artista('Sem Foto Vazio', 2, 10, [], { FOTO: '' }), artista('Foto Quebrada', 3, 15, [], { FOTO: 'img/nao-existe.jpg' })]);
            case 'invalido': return flat([artista('Data Ruim', 1, 10, [], { DT_BEGIN: 'lixo' }), [sessao('', 'Selfie', 10, 30)], artista('Valido', 2, 15)]);
            case 'desconhecida': return flat([artista('Ana', 1, 10), [sessao('Ana', 'Abraço Coletivo', 50, 30), sessao('Bia', 'Pose Livre', 20, 30)]]);
            case 'encerrado': return flat([artista('Ana', 2, -240), artista('Bia', 1, -200)]);
            case 'amanha': {
                const ini = inicioDoDia(baseNow) + DIA + 10 * 60 * MIN; // sem o limite de hoje
                return [sessao('Ana', 'Selfie', 0, 30, { DT_BEGIN: stamp(ini), DT_END: stamp(ini + 30 * MIN) })];
            }
            case 'vazio': return [];
            case 'erro': return [];
            case 'evento': return eventoCincoDias();
            case 'dia':
            default: return artistas(10).concat(artista('Encerrado Ontem', 2, -300), artista('Zélia Encerrada', 1, -240));
        }
    }

    function wrapItem(rec) {
        return { value: function (field) { return { value: rec[field] != null ? rec[field] : '' }; } };
    }

    const ebhtmlReal = window.ebhtml; // EBHTML real: loaded()/finished() chegam ao player
    window.ebhtml = {
        create2: function (opts, cb) {
            let registros = [];
            const dados = {
                nodataiserror: false,
                autoloaded: false,
                addData: function () {},
                datalist: function () {
                    return {
                        count: function () { return registros.length; },
                        get: function (i) { return wrapItem(registros[i]); }
                    };
                },
                load: function (done, fail) {
                    setTimeout(function () {
                        if (cenario === 'erro') { if (fail) { fail('mock: falha de rede'); } return; }
                        registros = cenarioRegistros(cenario);
                        if (pular > 0) {
                            const ordem = Object.keys(registros.reduce(function (m, r) { m[Fea.chave(r.TITULO)] = 1; return m; }, {})).sort();
                            const fora = ordem.slice(0, pular);
                            registros = registros.filter(function (r) { return fora.indexOf(Fea.chave(r.TITULO)) === -1; });
                        }
                        done();
                    }, 150);
                }
            };
            // Dados do mock; loaded()/finished() sao os do EBHTML real (interface do player) e ficam em __calls.
            function entregar(real) {
                real.nodataiserror = false;
                real.autoloaded = false;
                ['addData', 'datalist', 'data', 'load'].forEach(function (nome) {
                    if (dados[nome]) { real[nome] = dados[nome]; }
                });
                ['loaded', 'finished'].forEach(function (nome) {
                    const original = real[nome].bind(real);
                    real[nome] = function () {
                        calls.push({ t: Date.now(), name: nome });
                        console.log('[Mock] ' + nome + '() real');
                        return original.apply(null, arguments);
                    };
                });
                cb(real);
            }
            if (ebhtmlReal && ebhtmlReal.create2) { ebhtmlReal.create2(opts, entregar); return; }
            entregar({ // sem ebhtml.js: so registra as chamadas
                loaded: function () {}, finished: function () {}
            });
        }
    };
    console.log('[Mock] ativo: cenario=' + cenario + ' agora=' + stamp(baseNow) + (agora || hora ? ' (simulado)' : ' (hora real)'));
})();
