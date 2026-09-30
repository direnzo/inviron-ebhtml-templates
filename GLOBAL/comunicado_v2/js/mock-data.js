/**
 * Mock de desenvolvimento do canal D_COMUNICADO (EBHTML-compativel).
 * So age quando a URL tem ?mock=N (N = indice do cenario abaixo; ?mock= ou ?mock=0 = primeiro)
 * ou ?lab=1 (laboratorio em mockups/index.html). Sem esses parametros nao faz nada,
 * mesmo se esquecido no pacote. Remover este arquivo do .eh5 de producao.
 *
 * Cada cenario e um registro do canal: TITULO, TEXTO, FOTO (padrao do comunicado antigo)
 * e TEXTO10 = JSON consolidado de configuracao visual (contrato no README).
 * Chave omitida no JSON = padrao do CONFIG (js/config.js).
 *
 * PARA DESATIVAR O MOCK: basta nao usar ?mock= na URL (o player real entrega o canal).
 */

var MOCK_TITULO = 'Manutenção preventiva dos elevadores';
var MOCK_TEXTO = '<p>Os elevadores da <strong>Torre B</strong> passarão por manutenção preventiva no <strong>sábado, dia 04/10</strong>, das 8h às 12h.</p><p>Utilize os demais elevadores ou a escada de emergência. Agradecemos a compreensão.</p>';
var MOCK_TEXTO_CURTO = '<p>Dia 04/10, das 8h às 12h, um dos elevadores estará em manutenção.</p>';
var MOCK_FOTO = 'img/sample.svg';

// Gera o valor de TEXTO10 (JSON em uma unica linha, como a extranet deve gravar)
function cfgJson(obj) { return JSON.stringify(obj); }

// Cenarios do campo TEXTO10 (JSON plano, valores em string como a extranet grava)
var CFG_VERDE = { BG_TIPO: 'gradiente', BG_COR_DE: '#0b3d33', BG_COR_PARA: '#127a5f', BG_ANGULO: '120', COR_DESTAQUE: '#ffd166',
    TITULO_COR: '#0b3d33', TITULO_CAIXA: 'true', TITULO_CAIXA_COR: '#ffd166', TITULO_CAIXA_OPACIDADE: '100', TITULO_CAIXA_RAIO: '33',
    DESC_COR: '#ffffff', DESC_CAIXA: 'true', DESC_CAIXA_COR: '#000000', DESC_CAIXA_OPACIDADE: '30', DESC_CAIXA_RAIO: '33' };

var MOCK_DATA = {
    datasets: {
        'D_COMUNICADO': [
            /* 0  Completo, visual padrao */ { TITULO: MOCK_TITULO, TEXTO: MOCK_TEXTO, FOTO: MOCK_FOTO, TEXTO10: cfgJson({ DURACAO: '15' }) },
            /* 1  So titulo */ { TITULO: MOCK_TITULO, TEXTO10: cfgJson({ DURACAO: '15' }) },
            /* 2  So descricao */ { TEXTO: MOCK_TEXTO_CURTO, TEXTO10: cfgJson({ DURACAO: '15' }) },
            /* 3  So foto */ { FOTO: MOCK_FOTO, TEXTO10: cfgJson({ DURACAO: '15' }) },
            /* 4  Titulo + descricao */ { TITULO: MOCK_TITULO, TEXTO: MOCK_TEXTO, TEXTO10: cfgJson({ DURACAO: '15' }) },
            /* 5  Titulo + foto */ { TITULO: MOCK_TITULO, FOTO: MOCK_FOTO, TEXTO10: cfgJson({ DURACAO: '15' }) },
            /* 6  Descricao + foto */ { TEXTO: MOCK_TEXTO, FOTO: MOCK_FOTO, TEXTO10: cfgJson({ DURACAO: '15' }) },
            /* 7  Laranja -> vinho, sem caixas */
            { TITULO: MOCK_TITULO, TEXTO: MOCK_TEXTO, FOTO: MOCK_FOTO,
              TEXTO10: cfgJson({ BG_TIPO: 'gradiente', BG_COR_DE: '#f58220', BG_COR_PARA: '#7a1f3d', BG_ANGULO: '160', COR_DESTAQUE: '#ffffff' }) },
            /* 8  Verde com caixas (mesmo exemplo enviado pelo dev, com DURACAO 20) */
            { TITULO: MOCK_TITULO, TEXTO: MOCK_TEXTO, FOTO: MOCK_FOTO,
              TEXTO10: '{"BG_TIPO":"gradiente","BG_COR_DE":"#0b3d33","BG_COR_PARA":"#127a5f","BG_ANGULO":"120","BG_BRILHO":"true","COR_DESTAQUE":"#ffd166","FILETE":"true","TITULO_COR":"#0b3d33","TITULO_CAIXA":"true","TITULO_CAIXA_COR":"#ffd166","TITULO_CAIXA_OPACIDADE":"100","TITULO_CAIXA_RAIO":"33","DESC_COR":"#ffffff","DESC_CAIXA":"true","DESC_CAIXA_COR":"#000000","DESC_CAIXA_OPACIDADE":"30","DESC_CAIXA_RAIO":"33","DURACAO":"20"}' },
            /* 9  Roxo, caixas translucidas, cantos bem arredondados */
            { TITULO: MOCK_TITULO, TEXTO: MOCK_TEXTO,
              TEXTO10: cfgJson({ BG_TIPO: 'gradiente', BG_COR_DE: '#2b1055', BG_COR_PARA: '#7597de', BG_ANGULO: '145', COR_DESTAQUE: '#ff8fb1',
                  TITULO_CAIXA: 'true', TITULO_CAIXA_COR: '#ffffff', TITULO_CAIXA_OPACIDADE: '16', TITULO_CAIXA_RAIO: '60',
                  DESC_CAIXA: 'true', DESC_CAIXA_COR: '#ffffff', DESC_CAIXA_OPACIDADE: '12', DESC_CAIXA_RAIO: '60' }) },
            /* 10 Corporativo claro, fundo chapado, caixas retas */
            { TITULO: MOCK_TITULO, TEXTO: MOCK_TEXTO, FOTO: MOCK_FOTO,
              TEXTO10: cfgJson({ BG_TIPO: 'chapado', BG_COR: '#e9eef7', BG_BRILHO: 'false', COR_DESTAQUE: '#0a5cff',
                  TITULO_COR: '#ffffff', TITULO_CAIXA: 'true', TITULO_CAIXA_COR: '#0a2a66', TITULO_CAIXA_OPACIDADE: '100', TITULO_CAIXA_RAIO: '13',
                  DESC_COR: '#1b2438', DESC_CAIXA: 'true', DESC_CAIXA_COR: '#ffffff', DESC_CAIXA_OPACIDADE: '100', DESC_CAIXA_RAIO: '13' }) },
            /* 11 Preto chapado, sem filete */
            { TITULO: MOCK_TITULO, TEXTO: MOCK_TEXTO,
              TEXTO10: cfgJson({ BG_TIPO: 'chapado', BG_COR: '#000000', BG_BRILHO: 'false', FILETE: 'false', DESC_COR: '#d9d9d9' }) },
            /* 12 Texto longo (autofit), sem TEXTO10 */
            { TITULO: 'Comunicado importante sobre a mudança nos horários de funcionamento e utilização dos elevadores do condomínio', TEXTO: MOCK_TEXTO + MOCK_TEXTO + MOCK_TEXTO },
            /* 13 Valores invalidos: cada chave cai no padrao, sem quebrar */
            { TITULO: MOCK_TITULO, TEXTO: MOCK_TEXTO,
              TEXTO10: cfgJson({ BG_TIPO: 'xyz', BG_COR_DE: 'azul', BG_ANGULO: 'abc', COR_DESTAQUE: 'red', FILETE: 'talvez', TITULO_CAIXA: 'sim', TITULO_CAIXA_OPACIDADE: '900', TITULO_CAIXA_RAIO: '-5', DURACAO: '0' }) },
            /* 14 Foto quebrada + titulo: deve cair para so titulo */
            { TITULO: MOCK_TITULO, FOTO: 'img/nao-existe.jpg', TEXTO10: cfgJson({ DURACAO: '10' }) },
            /* 15 HTML malicioso no TEXTO: deve ser neutralizado */
            { TITULO: 'Teste de sanitização', TEXTO: '<p>Texto <strong>ok</strong><script>document.title="XSS"</script><img src=x onerror="document.title=\'XSS\'"><span onclick="alert(1)">link</span></p>' },
            /* 16 TEXTO10 com JSON quebrado: usa todos os padroes */
            { TITULO: MOCK_TITULO, TEXTO: MOCK_TEXTO, TEXTO10: '{ "BG_TIPO": "chapado", ' },
            /* 17 TEXTO10 com aspas escapadas (&quot;): deve ser lido normalmente */
            { TITULO: MOCK_TITULO, TEXTO: MOCK_TEXTO, TEXTO10: '{&quot;BG_TIPO&quot;:&quot;chapado&quot;,&quot;BG_COR&quot;:&quot;#123b2c&quot;,&quot;COR_DESTAQUE&quot;:&quot;#ffd166&quot;}' },
            /* 18 Sem TEXTO10 (canal antigo): visual 100% padrao */
            { TITULO: MOCK_TITULO, TEXTO: MOCK_TEXTO, FOTO: MOCK_FOTO },
            /* 19 So foto retrato: proporcao diferente da tela => foto inteira sobre fundo desfocado */
            { FOTO: 'img/sample-portrait.svg', TEXTO10: cfgJson({ DURACAO: '15' }) },
            /* 20 So foto quadrada (tela cheia, inteira sobre fundo desfocado) */
            { FOTO: 'img/sample-square.svg', TEXTO10: cfgJson({ DURACAO: '15' }) },
            /* 21 Titulo + foto retrato */
            { TITULO: MOCK_TITULO, FOTO: 'img/sample-portrait.svg', TEXTO10: cfgJson({ DURACAO: '15', TITULO_CAIXA: 'true', TITULO_CAIXA_COR: '#000000', TITULO_CAIXA_OPACIDADE: '55', TITULO_CAIXA_RAIO: '50' }) },
            /* 22 Descricao + foto quadrada, tema verde com caixas */
            { TEXTO: MOCK_TEXTO, FOTO: 'img/sample-square.svg', TEXTO10: cfgJson(CFG_VERDE) },
            /* 23 Completo com foto retrato, tema laranja -> vinho */
            { TITULO: MOCK_TITULO, TEXTO: MOCK_TEXTO, FOTO: 'img/sample-portrait.svg',
              TEXTO10: cfgJson({ BG_COR_DE: '#f58220', BG_COR_PARA: '#7a1f3d', BG_ANGULO: '160', COR_DESTAQUE: '#ffffff' }) },
            /* 24 Titulo + foto paisagem, caixa vidro, sem filete */
            { TITULO: MOCK_TITULO, FOTO: MOCK_FOTO,
              TEXTO10: cfgJson({ FILETE: 'false', TITULO_CAIXA: 'true', TITULO_CAIXA_COR: '#ffffff', TITULO_CAIXA_OPACIDADE: '18', TITULO_CAIXA_RAIO: '60' }) }
        ]
    }
};

// ---------------------------------------------------------------------------
// Modo ALEATORIO: ?mock (sem numero) ou ?mock=random sorteia um registro novo a cada F5,
// simulando a chegada de um novo comunicado. ?mock=random&seed=N repete exatamente o mesmo sorteio.
// O registro sorteado e o seed sao impressos no console para reproduzir qualquer falha.
// ---------------------------------------------------------------------------
var MOCK_POOL = {
    titulos: [
        'Aviso', 'Manutenção preventiva dos elevadores', 'Elevador social fora de serviço até quinta-feira',
        'Assembleia geral ordinária de moradores no dia 15 às 19h30 no salão de festas do condomínio',
        'Atenção: mudança nos horários de mudança e entrega de encomendas', 'Bem-vindos ao Bloco A',
        'Dedetização programada: sábado, das 8h às 12h, em todas as áreas comuns e garagens'
    ],
    textos: [
        '<p>Dia 04/10, das 8h às 12h.</p>',
        MOCK_TEXTO_CURTO,
        MOCK_TEXTO,
        '<p><strong>Importante:</strong> a partir de segunda-feira as mudanças só poderão ser realizadas de <strong>segunda a sexta, das 9h às 17h</strong>, mediante agendamento prévio na portaria.</p><ul><li>Reserve o elevador de serviço com 48h de antecedência</li><li>Proteja as paredes e portas</li><li>Deixe o hall livre ao final</li></ul><p>Agradecemos a colaboração de todos.</p>',
        MOCK_TEXTO + MOCK_TEXTO + MOCK_TEXTO,
        '<p class="ql-align-center">Boa semana a todos!</p>'
    ],
    fotos: ['img/sample.svg', 'img/sample-portrait.svg', 'img/sample-square.svg'],
    paletas: [
        ['#0d1b2a', '#1d2f4d'], ['#0b3d33', '#127a5f'], ['#f58220', '#7a1f3d'], ['#2b1055', '#7597de'],
        ['#111111', '#3a3a3a'], ['#e9eef7', '#cfd9ea'], ['#fff4e0', '#ffd9a0'], ['#0a2a66', '#0a5cff'], ['#3d0c02', '#c1440e']
    ],
    destaques: ['#f58220', '#ffd166', '#ff8fb1', '#0a5cff', '#2ec4b6', '#ffffff', '#e63946']
};

function mockRandomRecord(seed) {
    var s = seed;
    function rnd() { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }
    var warm; for (warm = 0; warm < 8; warm++) { rnd(); }  // descorrelaciona seeds proximos
    function pick(a) { return a[Math.floor(rnd() * a.length)]; }
    function chance(p) { return rnd() < p; }
    function int(min, max) { return Math.floor(min + rnd() * (max - min + 1)); }
    function lum(hex) {
        var n = parseInt(hex.substr(1), 16);
        return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    }
    function ink(bg) { return lum(bg) > 0.6 ? '#14213d' : '#ffffff'; }

    var hasT = chance(0.75), hasD = chance(0.75), hasI = chance(0.6);
    if (!hasT && !hasD && !hasI) { hasT = true; }
    var pal = pick(MOCK_POOL.paletas);
    var solid = chance(0.3);
    var base = pal[0];
    var accent = pick(MOCK_POOL.destaques);
    var tBox = chance(0.45), dBox = chance(0.45);
    var tBoxColor = chance(0.5) ? accent : pick(['#ffffff', '#000000', pal[1]]);
    var dBoxColor = pick(['#000000', '#ffffff', pal[1]]);
    var cfg = {
        DURACAO: String(int(8, 20)),
        BG_TIPO: solid ? 'chapado' : 'gradiente',
        BG_COR: pal[0], BG_COR_DE: pal[0], BG_COR_PARA: pal[1],
        BG_ANGULO: String(int(0, 24) * 15),
        BG_BRILHO: chance(0.7) ? 'true' : 'false',
        COR_DESTAQUE: accent,
        FILETE: chance(0.75) ? 'true' : 'false',
        TITULO_COR: ink(tBox ? tBoxColor : base),
        TITULO_CAIXA: tBox ? 'true' : 'false',
        TITULO_CAIXA_COR: tBoxColor,
        TITULO_CAIXA_OPACIDADE: String(int(40, 100)),
        TITULO_CAIXA_RAIO: String(int(0, 100)),
        DESC_COR: dBox ? ink(dBoxColor) : ink(base),
        DESC_CAIXA: dBox ? 'true' : 'false',
        DESC_CAIXA_COR: dBoxColor,
        DESC_CAIXA_OPACIDADE: String(int(15, 70)),
        DESC_CAIXA_RAIO: String(int(0, 100))
    };
    // caixa translucida: o texto precisa contrastar com o FUNDO, nao com a cor da caixa
    if (tBox && parseInt(cfg.TITULO_CAIXA_OPACIDADE, 10) < 70) { cfg.TITULO_COR = ink(base); }
    if (dBox && parseInt(cfg.DESC_CAIXA_OPACIDADE, 10) < 70) { cfg.DESC_COR = ink(base); }
    // 8% dos sorteios trazem um valor invalido: o template deve cair no padrao dessa chave
    if (chance(0.08)) { cfg[pick(['BG_TIPO', 'BG_ANGULO', 'COR_DESTAQUE', 'TITULO_CAIXA_RAIO', 'FILETE'])] = pick(['xyz', '', '-1', '#zzz']); }

    var rec = { TEXTO10: cfgJson(cfg) };
    if (hasT) { rec.TITULO = pick(MOCK_POOL.titulos); }
    if (hasD) { rec.TEXTO = pick(MOCK_POOL.textos); }
    if (hasI) { rec.FOTO = pick(MOCK_POOL.fotos); }
    return rec;
}

(function () {
    var m = /[?&]mock(?:=(\w*))?(?=&|$)/.exec(window.location.search);
    var lab = /[?&]lab=1/.test(window.location.search);
    if (!m && !lab) { return; }
    var list = MOCK_DATA.datasets['D_COMUNICADO'];
    var arg = m && m[1] !== undefined ? m[1] : '';
    var random = m && (arg === '' || arg === 'random' || arg === 'r');
    var record, label, seedMatch, seed;

    if (arg === 'empty') {
        record = null;   // canal vazio: loader.data() devolve undefined
        label = 'canal vazio';
    } else if (random) {
        seedMatch = /[?&]seed=(\d+)/.exec(window.location.search);
        seed = seedMatch ? parseInt(seedMatch[1], 10) : Math.floor(Math.random() * 4294967295);
        record = mockRandomRecord(seed);
        label = 'aleatorio seed=' + seed + ' (repetir: ?mock=random&seed=' + seed + ')';
    } else {
        var index = arg !== '' ? parseInt(arg, 10) : 0;
        record = list[index] || list[0];
        label = 'fixo ' + index;
    }
    var stored = {};

    if (window.console) {
        console.log('[Mock] EBHTML shim ativo, cenario ' + label);
        if (random) { console.log('[Mock] registro: ' + JSON.stringify(record)); }
    }

    function accessor(rec) {
        return {
            value: function (field) { return { value: rec[field] !== undefined && rec[field] !== null ? rec[field] : '' }; }
        };
    }

    window.ebhtml = {
        create2: function (opts, cb) {
            cb({
                nodataiserror: false,
                autoloaded: false,
                addData: function (name) { stored[name] = true; },
                data: function (name) { return stored[name] && record ? accessor(record) : undefined; },
                datalist: function (name) {
                    return { count: function () { return stored[name] && record ? 1 : 0; }, get: function () { return record ? accessor(record) : undefined; } };
                },
                load: function (done) { setTimeout(done, 50); },
                loaded: function () { if (window.console) { console.log('[Mock] loader.loaded()'); } },
                finished: function () { if (window.console) { console.log('[Mock] loader.finished()'); } }
            });
        }
    };

    // Laboratorio (mockups/index.html): recebe o registro por postMessage e re-renderiza
    if (lab) {
        window.addEventListener('message', function (e) {
            var msg = e.data;
            if (msg && msg.type === 'comunicado-lab' && msg.record && window.comunicadoRender) {
                window.comunicadoRender(msg.record);
            }
        });
    }
})();
