/* ============================================================
   Populari (abertura primeiro) - master.js  VERSAO LEGACY
   Alvo: EBHTMLBuilder 3.0.5 -> Qt 4.8.5 / QtWebKit ~534.34 (2011)
   Dataset: D_POPULARI   |   Campos: TEXTO (texto) | FOTO (url da imagem)

   >>> ABERTURA EM GIF (sem <video>) <<<
   O <video> HTML5 nao funciona neste engine (testado: WebM, H.264 .mp4 e
   .wmv, nenhum toca - tela preta). O QtWebKit anima GIF nativamente, entao
   a abertura e um GIF da vinheta em tela cheia (#intro > img), exibido por
   INTRO_MS antes da noticia. Se o GIF falhar, cai para o .jpg estatico.

   Restricoes (JS): ES5 puro. Sem const/let/arrow/template string/Promise.
   ============================================================ */

var INTRO_MS = 5000;              // tempo da abertura em tela cheia (= duracao do GIF)
var DURATION_MS = 10000;          // tempo da noticia no ar DEPOIS da abertura
var IMAGE_TIMEOUT_MS = 6000;      // watchdog de carregamento da imagem de fundo
var DATA_NAME = 'D_POPULARI';

// Abertura: GIF animado da vinheta, um arquivo por formato.
var INTRO_LANDSCAPE = './img/INTRO_1366X768.gif';
var INTRO_PORTRAIT = './img/INTRO_1080x1920.gif';
// Fallback estatico (ultimo frame) se o GIF nao carregar.
var INTRO_LANDSCAPE_FB = './img/INTRO_FRAME_1366X768.jpg';
var INTRO_PORTRAIT_FB = './img/INTRO_FRAME_1080x1920.jpg';

/* proporcao da tela (sem depender de matchMedia) */
function ehPortrait() {
    var w = window.innerWidth || document.documentElement.clientWidth || 1;
    var h = window.innerHeight || document.documentElement.clientHeight || 1;
    return (w / h) < 1;
}

/* GIF de abertura conforme o formato */
function escolherIntro() {
    return ehPortrait() ? INTRO_PORTRAIT : INTRO_LANDSCAPE;
}

/* .jpg de fallback conforme o formato */
function escolherIntroFallback() {
    return ehPortrait() ? INTRO_PORTRAIT_FB : INTRO_LANDSCAPE_FB;
}

function sanitizeText(text) {
    return ('' + (text || '')).replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
}

/* le um campo do item tentando variacoes de nome (maiusc/minusc) */
function lerCampo(item, nomes) {
    var i, node;
    if (!item) { return ''; }
    for (i = 0; i < nomes.length; i++) {
        try {
            node = item.value(nomes[i]);
        } catch (e) {
            node = null;
        }
        if (node && node.value !== undefined && node.value !== null && ('' + node.value) !== '') {
            return '' + node.value;
        }
    }
    return '';
}

window.onload = function () {

    var body = document.querySelector('body');
    var fotoEl = document.getElementById('foto');
    var fotoImg = document.getElementById('foto-img');
    var introEl = document.getElementById('intro');
    var introImg = document.getElementById('intro-img');
    var textoEl = document.getElementById('texto');

    var originalText = '';

    // pre-carrega o GIF de abertura do formato atual; se falhar, usa o .jpg
    if (introImg) {
        introImg.onerror = function () {
            introImg.onerror = null;
            introImg.src = escolherIntroFallback();
        };
        introImg.src = escolherIntro();
    }

    function render(dados) {
        originalText = sanitizeText(dados.texto);
        textoEl.innerHTML = originalText;
    }

    /* pinta a foto como background-image de #foto (nao ha object-fit) */
    function pintarFoto(url) {
        if (fotoEl && url) {
            fotoEl.style.backgroundImage = 'url("' + url + '")';
        }
    }

    /* log nativo do EBHTML (interface.eblog -> host EdgeContents) + console.
       'loader' e o EBBrowser do runtime; no modo mock nao tem .log(). */
    function ebLog(loader, message) {
        try {
            if (loader && typeof loader.log === 'function') {
                loader.log(message);
                return;
            }
        } catch (e) {}
        if (window.console && console.log) { console.log('[EBLOG] ' + message); }
    }

    /* revela a noticia e a mantem no ar por DURATION_MS.
       Sem CSS transition em jogo (removida de proposito): a troca e um corte
       seco no mesmo frame - abertura some e noticia aparece juntas. */
    function revelarNoticia(loader) {
        ebLog(loader, 'populari_intro_legacy: transicao abertura -> noticia (news-in)');
        if (introEl) {
            introEl.className = '';
            introEl.style.display = 'none';
        }
        body.className = body.className + ' news-in';
        setTimeout(function () {
            loader.finished();
        }, DURATION_MS);
    }

    /* exibe o GIF de abertura em tela cheia por INTRO_MS e entao a noticia */
    function mostrarAbertura(loader) {
        if (introImg && !introImg.src) {
            introImg.src = escolherIntro();
        }
        if (introEl) {
            introEl.style.display = 'block';
            introEl.className = 'is-playing';
        }
        ebLog(loader, 'populari_intro_legacy: abertura (GIF) por ' + INTRO_MS + 'ms');
        setTimeout(function () {
            revelarNoticia(loader);
        }, INTRO_MS);
    }

    function carregarImagem(url, loader) {
        var settled = false;
        var watchdog = null;

        function concluir() {
            if (settled) { return; }
            settled = true;
            if (watchdog) { clearTimeout(watchdog); }
            pintarFoto(url);
            body.className = body.className + ' is-ready';
            loader.loaded();
            mostrarAbertura(loader);
        }

        if (!url || !fotoImg) {
            concluir();
            return;
        }

        fotoImg.onload = concluir;
        fotoImg.onerror = concluir;
        watchdog = setTimeout(concluir, IMAGE_TIMEOUT_MS);
        fotoImg.src = url;
    }

    /* ---- modo mock (desenvolvimento) ---- */
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = {
            loaded: function () { if (window.console) { console.log('[Mock] loaded'); } },
            finished: function () { if (window.console) { console.log('[Mock] finished'); } }
        };
        render(MOCK_DATA.dados);
        carregarImagem(MOCK_DATA.dados.foto, mockLoader);
        return;
    }

    /* ---- runtime EdgeContents ---- */
    ebhtml.create2({}, function (loader) {

        loader.addData(DATA_NAME);
        loader.nodataiserror = false;
        loader.autoloaded = false;

        function liberarSemDados() {
            body.className = body.className + ' is-ready';
            loader.loaded();
            loader.finished();
        }

        loader.load(function () {
            var item = loader.data(DATA_NAME);

            if (!item) {
                liberarSemDados();
                return;
            }

            var dados = {
                texto: lerCampo(item, ['TEXTO', 'texto', 'Texto']),
                foto: lerCampo(item, ['FOTO', 'foto', 'Foto', 'IMAGEM', 'imagem'])
            };

            render(dados);
            carregarImagem(dados.foto, loader);
        }, liberarSemDados);
    });
};
