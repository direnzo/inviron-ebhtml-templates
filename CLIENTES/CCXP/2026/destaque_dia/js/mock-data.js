/**
 * Mock de dados de desenvolvimento. Usa o EBHTML real: loaded()/finished() vao para o player.
 * MOCK_DATA.enabled = false E remover/comentar o <script> deste arquivo.
 *
 * Parametros de URL:
 *   ?mock=0                    usa o EBHTML real (sem mock)
 * Somente com o mock ativo:
 *   ?cenario=hoje              (padrao) 1 destaque por palco (6), 1o em andamento, + eventos comuns
 *            evento            5 dias, horario real: o que passou some (a noite pode ficar vazio)
 *            um|tres|seis|muitos   quantidade de destaques (muitos = 9, acima do limite de 6)
 *            textos            titulos curtos, medios, longos, extremos e com acento
 *            vazio|semMarcado|encerrado|amanha|semImagem|invalido|palcoDesconhecido|erro
 *   ?len=N                     todos os titulos com N caracteres (limite de texto)
 *   ?hora=14:40                hora simulada de hoje (avanca em tempo real)
 *   ?agora=2026-12-04T14:40:00-03:00   data/hora simulada completa
 *   ?palco=23009|blast         todos os destaques do cenario no mesmo palco (id ou slug)
 * Sem ?hora/?agora o relogio do rodape e a selecao usam a hora real.
 * window.__calls: loaded()/finished(); window.__textos: resultado do ajuste de cada descricao.
 */
const MOCK_DATA = { enabled: !/[?&]mock=0(&|$)/.test(window.location.search) };

(function () {
    if (!MOCK_DATA.enabled) { return; }

    const params = new URLSearchParams(window.location.search);
    const cenario = params.get('cenario') || 'hoje';
    const palcoParam = params.get('palco');
    const lenParam = parseInt(params.get('len'), 10);
    const calls = (window.__calls = []);
    const startedAt = Date.now();
    const offsetMin = CONFIG.fuso;
    const MIN = 60000;
    const DIA = 24 * 60 * MIN;
    const IDS = Object.keys(CONFIG.palcos); // 6 palcos, na ordem do config

    const palcoFixo = palcoParam ? IDS.filter(function (k) {
        return k === palcoParam || CONFIG.palcos[k].arte === palcoParam;
    })[0] : null;
    const palcoDoIndice = function (i) { return palcoFixo || IDS[i % IDS.length]; };

    // Inicio do dia (00:00 no fuso do evento) para um instante qualquer.
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

    // Fotos de picsum.photos (930x930, uso so de mock), baixadas em mock/fotos/p01..p20.jpg.
    const TOTAL_FOTOS = 20;
    function photo(n) {
        const i = (n * 7 + 3) % TOTAL_FOTOS + 1; // espalha: eventos vizinhos nao repetem a foto
        return 'mock/fotos/p' + (i < 10 ? '0' + i : i) + '.jpg';
    }

    // ---- titulos de varios tamanhos ----
    const CURTOS = ['Abertura', 'Cosplay', 'Quiz Geek', 'Anime Live', 'DC Studios', 'Fan Meet'];
    const MEDIOS = ['The Boys: Temporada Final', 'Panini Comics: Novidades 2027', 'Brasil Game Show Talks',
        'Estúdio Mauricio de Sousa', 'Criadores de Conteúdo', 'Maratona Anime e Mangá'];
    const LONGOS = ['Megapainel dos Colecionáveis com Hasbro, McFarlane Toys e Iron Studios',
        'Marvel Studios apresenta: o futuro do Universo Cinematográfico com elenco e diretores'];
    const MUITO_LONGOS = [
        'Painel especial de encerramento com os criadores, roteiristas e elenco da franquia para revelar em primeira mão os próximos lançamentos e curiosidades dos bastidores',
        'Warner Bros. Discovery: celebrando cem anos de histórias com os principais nomes do cinema, da televisão e dos quadrinhos, com exibição de cenas inéditas e anúncios exclusivos'];
    const EXTREMOS = ['Encontro histórico reunindo diretores, atores, roteiristas, ilustradores, dubladores e produtores de várias gerações para uma conversa aberta sobre os bastidores da criação de universos, personagens inesquecíveis, desafios das adaptações e os próximos grandes projetos que vão chegar às telas, aos quadrinhos e aos jogos nos próximos anos'];
    const PALAVRA_LONGA = 'Supercalifragilisticexpialidocious: Edição Comemorativa';
    const ACENTOS = 'ÁGATA ÉPICA ÍNTIMA ÓPERA ÚNICA: AÇÃO, EMOÇÃO E CORAÇÃO NO ÂMBITO DAS NAÇÕES ÃÕ';

    // Titulos de referencia: 82-91 caracteres, como o texto de exemplo da arte.
    const TITULOS_PADRAO = [
        'Megapainel dos Colecionáveis com Hasbro, McFarlane Toys e Iron Studios: lançamentos 2027',
        'The Boys: Temporada Final com elenco e criadores falando sobre os bastidores da série',
        'Panini Comics apresenta as novidades de 2027 com os autores e desenhistas convidados',
        'Brasil Game Show Talks: o futuro dos jogos nacionais com estúdios e criadores de conteúdo',
        'Cosplay e Bastidores: como nascem as fantasias premiadas da maior feira de cultura pop',
        'Maratona Anime e Mangá com dubladores, estúdios japoneses e convidados especiais do evento',
        'Quadrinhos Nacionais: roteiristas e ilustradores contam como criam novos universos',
        'Estúdios Mauricio de Sousa celebra seis décadas de histórias com a Turma da Mônica',
        'Marvel Studios e DC Studios: o que vem por aí nos cinemas, nas séries e nos quadrinhos',
        'Criadores de Conteúdo Geek: bastidores, parcerias e o dia a dia de quem vive de cultura pop'
    ];

    function lorem(n) {
        const palavras = ('painel conversa bastidores elenco criadores lançamentos novidades quadrinhos cinema animação ' +
            'jogos música cultura pop convidados especiais anúncios exclusivos história universo personagens').split(' ');
        let s = '';
        for (let i = 0; s.length < n; i += 1) { s += (s ? ' ' : '') + palavras[i % palavras.length]; }
        return s.slice(0, n).trim();
    }
    function tituloVariado(i) { return TITULOS_PADRAO[i % TITULOS_PADRAO.length]; }

    /** Registro do dataset. extra sobrescreve campos (ex.: { TEXTO2: '0' }). */
    function ev(n, inicioMs, durMin, title, extra) {
        const id = palcoDoIndice(n);
        const rec = {
            CATEGORY: id, TITULO: CONFIG.palcos[id].nome,
            TEXTO: isNaN(lenParam) ? title : lorem(lenParam), TEXTO2: '1',
            FOTO: photo(n),
            DATE: stamp(inicioMs), DT_END: stamp(inicioMs + durMin * MIN),
            DT_UPDATE: stamp(baseNow)
        };
        for (const k in (extra || {})) { rec[k] = extra[k]; }
        return rec;
    }
    // Atalho: minutos relativos a "agora", sem passar da meia-noite (senao o destaque nao seria de hoje).
    const limiteHoje = inicioDoDia(baseNow) + DIA - 70 * MIN;
    const rel = function (n, startMin, durMin, title, extra) {
        return ev(n, Math.min(baseNow + startMin * MIN, limiteHoje - (12 - n) * MIN), durMin, title, extra);
    };
    const comum = function (n, startMin, title) { return rel(n, startMin, 40, title, { TEXTO2: '0' }); };

    /** Quantidade de destaques de hoje: o 1o em andamento, os demais de 40 em 40 min; mais 2 eventos comuns. */
    function destaquesHoje(qtd, tituloDe) {
        const out = [];
        for (let i = 0; i < qtd; i += 1) { out.push(rel(i, i === 0 ? -20 : 20 + i * 40, 50, tituloDe(i))); }
        return out.concat([comum(20, 5, tituloVariado(7)), comum(21, 60, tituloVariado(8))]);
    }

    /** 5 dias de evento (hoje + 4): 6 destaques e 6 eventos comuns por dia; a hora real decide o que aparece. */
    function eventoCincoDias() {
        const out = [];
        const hoje = inicioDoDia(baseNow);
        for (let d = 0; d < 5; d += 1) {
            for (let k = 0; k < 12; k += 1) {
                const i = d * 12 + k;
                const destaque = k % 2 === 0;
                out.push(ev(i, hoje + d * DIA + (10 * 60 + k * 50) * MIN, 40, tituloVariado(i), { TEXTO2: destaque ? '1' : '0' }));
            }
        }
        return out;
    }

    function cenarioRegistros(nome) {
        switch (nome) {
            case 'evento': return eventoCincoDias();
            case 'um': return destaquesHoje(1, tituloVariado);
            case 'tres': return destaquesHoje(3, tituloVariado);
            case 'seis': return destaquesHoje(6, tituloVariado);
            case 'muitos': return destaquesHoje(9, tituloVariado);
            case 'vazio': return [];
            case 'semMarcado': return destaquesHoje(4, tituloVariado).map(function (r) { return Object.assign(r, { TEXTO2: '0' }); });
            case 'encerrado': return [rel(1, -180, 60, TITULOS_PADRAO[1]), rel(2, -90, 60, TITULOS_PADRAO[2])];
            case 'amanha': return [ev(1, inicioDoDia(baseNow) + DIA + 10 * 60 * MIN, 60, TITULOS_PADRAO[1])];
            case 'textos': {
                // um por palco: muito longo, palavra longa, curto, medio, longo, extremo; mais acentos no fim
                const t = [MUITO_LONGOS[0], PALAVRA_LONGA, CURTOS[0], MEDIOS[0], LONGOS[0], EXTREMOS[0], ACENTOS];
                return t.map(function (texto, i) { return rel(i, i === 0 ? -20 : 20 + i * 40, 50, texto); });
            }
            case 'semImagem':
                return [rel(0, -20, 40, TITULOS_PADRAO[0], { FOTO: '' }), rel(1, 30, 50, TITULOS_PADRAO[1], { FOTO: 'img/nao-existe.jpg' })];
            case 'invalido':
                return [rel(0, -20, 40, TITULOS_PADRAO[0], { DATE: 'lixo' }), rel(1, 30, 50, '', {}), rel(2, 90, 50, TITULOS_PADRAO[2])];
            case 'palcoDesconhecido':
                return [rel(0, -20, 40, TITULOS_PADRAO[0], { CATEGORY: '99999', TITULO: 'Palco Novo' }), rel(1, 30, 50, TITULOS_PADRAO[1])];
            case 'hoje':
            default: return destaquesHoje(6, tituloVariado);
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
                data: function () { return registros.length ? wrapItem(registros[0]) : undefined; },
                load: function (done, fail) {
                    setTimeout(function () {
                        if (cenario === 'erro') { if (fail) { fail('mock: falha de rede'); } return; }
                        registros = cenarioRegistros(cenario);
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
    console.log('[Mock] ativo: cenario=' + cenario + (palcoFixo ? ' palco=' + palcoFixo : '') +
        ' agora=' + stamp(baseNow) + (agora || hora ? ' (simulado)' : ' (hora real)'));
})();
