/**
 * Mock de desenvolvimento (substitui o EBHTML). Desligar antes do .eh5:
 * MOCK_DATA.enabled = false E remover/comentar o <script> deste arquivo.
 *
 * Parametros de URL (somente com o mock ativo):
 *   ?cenario=cheio|tres|dois|um|semAtual|vazio|encerrado|amanha|longo|semImagem|invalido|erro
 *   ?palco=23009|blast        troca o palco (id ou slug)
 *   ?agora=2026-12-04T14:40:00-03:00   hora simulada (padrao 14:40 do dia atual)
 * Chamadas ao loader ficam em window.__calls para conferir loaded() antes de finished().
 */
const MOCK_DATA = { enabled: true };

(function () {
    if (!MOCK_DATA.enabled) { return; }

    const params = new URLSearchParams(window.location.search);
    const cenario = params.get('cenario') || 'cheio';
    const palco = params.get('palco');
    const calls = (window.__calls = []);
    const startedAt = Date.now();
    const offsetMin = CONFIG.fuso;

    if (palco) {
        const id = Object.keys(CONFIG.palcos).filter(function (k) {
            return k === palco || CONFIG.palcos[k].slug === palco || CONFIG.palcos[k].arte === palco;
        })[0];
        if (id) { usarPalco(id); }
    }

    // Hora simulada: avanca em tempo real a partir do valor inicial.
    let baseNow;
    const agora = params.get('agora');
    if (agora && !isNaN(Date.parse(agora))) {
        baseNow = Date.parse(agora);
    } else {
        const w = new Date(Date.now() + offsetMin * 60000);
        baseNow = Date.UTC(w.getUTCFullYear(), w.getUTCMonth(), w.getUTCDate(), 14, 40) - offsetMin * 60000;
    }
    MOCK_DATA.now = function () { return baseNow + (Date.now() - startedAt); };

    function pad(n) { return n < 10 ? '0' + n : String(n); }
    function stamp(ms) {
        const d = new Date(ms + offsetMin * 60000);
        return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + ' ' +
            pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':00';
    }
    function photo(n, color) {
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900"><rect width="900" height="900" fill="' +
            color + '"/><text x="450" y="500" font-size="320" text-anchor="middle" fill="#fff" font-family="Arial">' + n + '</text></svg>';
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }
    const MIN = 60000;
    const cores = ['#2563eb', '#16a34a', '#9333ea', '#ea580c', '#0891b2', '#be123c', '#4d7c0f', '#7c3aed', '#0f766e'];
    function ev(n, startMin, durMin, title, extra) {
        const rec = {
            CATEGORY: CONFIG.palco, TITULO: CONFIG.p.nome, TEXTO: title, TEXTO2: '0',
            FOTO: photo(n, cores[n % cores.length]),
            DATE: stamp(baseNow + startMin * MIN), DT_END: stamp(baseNow + (startMin + durMin) * MIN),
            DT_UPDATE: stamp(baseNow)
        };
        for (const k in (extra || {})) { rec[k] = extra[k]; }
        return rec;
    }
    const titulos = [
        'Megapainel dos Colecionáveis com Hasbro, McFarlane Toys e Iron Studios',
        'The Boys: Temporada Final', 'Panini Comics: Novidades 2027', 'Brasil Game Show Talks',
        'Cosplay: Bastidores', 'Maratona Anime', 'Quadrinhos Nacionais', 'Estúdio Mauricio de Sousa',
        'Criadores de Conteúdo'
    ];

    function cenarioRegistros(nome) {
        const atual = ev(0, -20, 40, titulos[0]);
        const futuros = function (qtd) {
            const out = [];
            for (let i = 0; i < qtd; i += 1) { out.push(ev(i + 1, 30 + i * 60, 50, titulos[(i + 1) % titulos.length])); }
            return out;
        };
        switch (nome) {
            case 'cheio': return [atual].concat(futuros(8));
            case 'tres': return [atual].concat(futuros(2));
            case 'dois': return [atual].concat(futuros(1));
            case 'um': return [atual];
            case 'semAtual': return futuros(3);
            case 'vazio': return [];
            case 'encerrado': return [ev(1, -180, 60, titulos[1]), ev(2, -90, 60, titulos[2])];
            case 'amanha': return [ev(1, 24 * 60 + 60, 60, titulos[1])];
            case 'longo': {
                const longo = 'Painel com um título extremamente longo para testar o limite de caracteres e o corte com reticências no final do texto exibido na tela do totem';
                return [ev(0, -20, 40, longo)].concat(futuros(1), [ev(5, 200, 50, longo)]);
            }
            case 'semImagem': return [ev(0, -20, 40, titulos[0], { FOTO: '' }), ev(1, 30, 50, titulos[1], { FOTO: 'img/nao-existe.jpg' })];
            case 'invalido': return [ev(0, -20, 40, titulos[0], { DATE: 'lixo' }), ev(1, 30, 50, '', {}), ev(2, 90, 50, titulos[2])];
            default: return [atual].concat(futuros(8));
        }
    }

    function wrapItem(rec) {
        return { value: function (field) { return { value: rec[field] != null ? rec[field] : '' }; } };
    }

    window.ebhtml = {
        create2: function (opts, cb) {
            let registros = [];
            const loader = {
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
                },
                loaded: function () { calls.push({ t: Date.now(), name: 'loaded' }); console.log('[Mock] loaded()'); },
                finished: function () { calls.push({ t: Date.now(), name: 'finished' }); console.log('[Mock] finished()'); }
            };
            cb(loader);
        }
    };
    console.log('[Mock] ativo: cenario=' + cenario + ' palco=' + CONFIG.palco);
})();
