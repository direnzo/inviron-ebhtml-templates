window.onload = function () {

    var photo = document.querySelector('#photo');
    var photoLeft = document.querySelector('#photo-left-img');
    var photoRight = document.querySelector('#photo-right-img');
    var photoCenter = document.querySelector('#photo-center-img');
    var logo = document.querySelector('#logo');
    var editoria = document.querySelector('#editoria');
    var editoriaWrap = document.querySelector('#editoria-wrap');
    var headline = document.querySelector('#headline');
    var headlineWrap = document.querySelector('.headline-wrap');
    var credit = document.querySelector('#credit');
    var body = document.querySelector('body');

    var duracaoMs = 30000; // 10 segundos

    var ALL_RATIO_CLASSES = [
        'ratio-portrait',
        'ratio-portrait-mild',
        'ratio-square',
        'ratio-landscape',
        'ratio-ultrawide',
        'ratio-superbanner',
        'ratio-footer',
        'ratio-empena'
    ];

    function isLegacyWebkit() {
        if (!window.CSS || !window.CSS.supports) {
            return true;
        }
        return !(window.CSS.supports('color', 'rgb(255 255 255 / 1)') &&
                 window.CSS.supports('gap', '1rem'));
    }

    if (isLegacyWebkit()) {
        body.classList.add('legacy-webkit');
    }

    function definirClasseAspectRatio() {
        var ar = window.innerWidth / window.innerHeight;
        if (ar <= (1 / 3)) {
            return 'ratio-empena';
        }
        if (ar <= (3 / 4)) {
            return 'ratio-portrait';
        }
        if (ar <= 1) {
            return 'ratio-portrait-mild';
        }
        if (ar < 1.05) {
            return 'ratio-square';
        }
        if (ar >= 15) {
            return 'ratio-footer';
        }
        if (ar >= 5) {
            return 'ratio-superbanner';
        }
        if (ar >= 3) {
            return 'ratio-ultrawide';
        }
        return 'ratio-landscape';
    }

    function aplicarClasseAspectRatio() {
        var i;
        var ratioClass = definirClasseAspectRatio();

        for (i = 0; i < ALL_RATIO_CLASSES.length; i++) {
            body.classList.remove(ALL_RATIO_CLASSES[i]);
        }
        body.classList.add(ratioClass);
    }

    function aplicarLayoutConfig(layoutConfig) {
        var key;
        if (!layoutConfig) {
            return;
        }
        for (key in layoutConfig) {
            if (layoutConfig.hasOwnProperty(key)) {
                document.documentElement.style.setProperty('--' + key, layoutConfig[key]);
            }
        }
    }

    function ler(item, campo) {
        var node;
        if (!item || !campo) {
            return '';
        }
        try {
            node = item.value(campo);
            if (node && node.value !== undefined && node.value !== null) {
                return '' + node.value;
            }
        } catch (e) {
            return '';
        }
        return '';
    }

    function lerPrimeiro(item, campos, fallback) {
        var i;
        var v;
        for (i = 0; i < campos.length; i++) {
            v = ler(item, campos[i]);
            if (v !== '' && !isPlaceholderValue(v)) {
                return v;
            }
        }
        return fallback || '';
    }

    function coletarValores(item, campos) {
        var i;
        var v;
        var lista = [];
        for (i = 0; i < campos.length; i++) {
            v = ler(item, campos[i]);
            if (v !== '' && !isPlaceholderValue(v)) {
                lista.push(v);
            }
        }
        return lista;
    }

    function looksLikeSectionLabel(texto) {
        var txt = texto;
        var palavras;
        if (!txt) {
            return false;
        }
        txt = ('' + txt).replace(/^\s+|\s+$/g, '');
        if (txt === '') {
            return false;
        }
        if (txt.length > 38) {
            return false;
        }
        if (/[\.!\?\:]/.test(txt)) {
            return false;
        }
        palavras = txt.split(/\s+/);
        return palavras.length <= 3;
    }

    function resolverTextos(item) {
        var editoriaFields = ['EDITORIA', 'CATEGORIA', 'SECAO', 'CANAL', 'TOPICO', 'TEMA', 'ASSUNTO'];
        var tituloFields = ['TITULO', 'HEADLINE', 'MANCHETE', 'CHAMADA', 'TEXTO', 'DESCRICAO', 'RESUMO', 'SUBTITULO', 'LINHAFINA'];
        var editoria = lerPrimeiro(item, editoriaFields, '');
        var titulos = coletarValores(item, tituloFields);
        var titulo = titulos.length ? titulos[0] : '';
        var i;

        if (editoria === '' && looksLikeSectionLabel(titulo)) {
            editoria = titulo;
            titulo = '';
            for (i = 0; i < titulos.length; i++) {
                if (!looksLikeSectionLabel(titulos[i])) {
                    titulo = titulos[i];
                    break;
                }
            }
        }

        if (titulo === '') {
            titulo = lerPrimeiro(item, ['TEXTO', 'DESCRICAO', 'RESUMO', 'SUBTITULO', 'LINHAFINA'], '');
        }

        if (editoria === '') {
            editoria = 'GERAL';
        }

        return {
            TITULO: titulo,
            EDITORIA: editoria
        };
    }

    function isPlaceholderValue(value) {
        var txt = value;
        if (txt === undefined || txt === null) {
            return false;
        }
        txt = ('' + txt).replace(/^\s+|\s+$/g, '');
        return /^\[[^\]]+\]$/.test(txt);
    }

    function renderizarTemplate(dados) {
        editoria.innerHTML = dados.EDITORIA ? dados.EDITORIA.toUpperCase() : '';
        headline.innerHTML = dados.TITULO;
        credit.innerHTML = dados.IMAGECREDIT;

        if (dados.LOGO && logo && !isPlaceholderValue(dados.LOGO)) {
            logo.src = dados.LOGO;
        }

        mudaCor(dados.EDITORIA, editoriaWrap);

        aplicarClasseAspectRatio();

        if (headline && headlineWrap) {
            fitDescriptionFont(headline, headlineWrap, 8);
        }

        body.classList.add('is-ready');
    }

    function carregarImagem(imageUrl, loader) {
        if (!imageUrl || !photo) {
            loader.finished();
            return;
        }

        photo.src = imageUrl;
        if (photoLeft) {
            photoLeft.src = imageUrl;
        }
        if (photoRight) {
            photoRight.src = imageUrl;
        }
        if (photoCenter) {
            photoCenter.src = imageUrl;
        }

        photo.onload = function () {
            photo.classList.add('zoom');
            loader.loaded();
            setTimeout(function () {
                loader.finished();
            }, duracaoMs);
        };

        photo.onerror = function () {
            console.error('Erro ao carregar imagem: ' + imageUrl);
            loader.finished();
        };
    }

    var resizeTimer = null;
    window.addEventListener('resize', function () {
        if (resizeTimer) {
            clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(function () {
            aplicarClasseAspectRatio();
        }, 120);
    });

    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = {
            loaded: function () { console.log('[Mock] loaded'); },
            finished: function () { console.log('[Mock] finished'); }
        };

        if (MOCK_DATA.config && MOCK_DATA.config.layout) {
            aplicarLayoutConfig(MOCK_DATA.config.layout);
        }
        if (MOCK_DATA.config && MOCK_DATA.config.duracao) {
            duracaoMs = Number(MOCK_DATA.config.duracao);
        }

        renderizarTemplate(MOCK_DATA.dados);
        carregarImagem(MOCK_DATA.dados.FOTO, mockLoader);
        return;
    }

    ebhtml.create2({}, function (loader) {
        loader.addData('D_UOL');
        loader.nodataiserror = false;
        loader.autoloaded = false;

        loader.load(function () {
            if (loader.data('D_UOL') == undefined) {
                console.error('D_UOL: sem dados');
                loader.finished();
                return;
            }

            var item = loader.data('D_UOL');
            var textos = resolverTextos(item);
            var dados = {
                TITULO: textos.TITULO,
                IMAGECREDIT: lerPrimeiro(item, ['IMAGECREDIT', 'CREDITO', 'CREDITO_FOTO'], ''),
                FOTO: lerPrimeiro(item, ['FOTO', 'IMAGEM', 'FOTO1'], ''),
                EDITORIA: textos.EDITORIA,
                LOGO: lerPrimeiro(item, ['LOGO', 'LOGO_URL'], '')
            };

            renderizarTemplate(dados);
            carregarImagem(dados.FOTO, loader);
        });
    });
};

function mudaCor(nomeEditoria, wrapper) {
    var cor = 'rgba(252, 201, 8, 0.85)';
    var el = wrapper || document.querySelector('#editoria-wrap');
    var editoria = nomeEditoria ? nomeEditoria.toUpperCase() : '';

    if (!el) {
        return;
    }

    switch (editoria) {
        case 'ESPORTE':
        case 'FUTEBOL':
            cor = 'rgba(50, 168, 82, 0.85)';
            break;
        case 'POLÍTICA':
        case 'INTERNACIONAL':
            cor = 'rgba(171, 2, 2, 0.85)';
            break;
        case 'ECONOMIA':
            cor = 'rgba(13, 25, 186, 0.85)';
            break;
        case 'EDUCAÇÃO':
            cor = 'rgba(13, 123, 186, 0.85)';
            break;
        case 'TECNOLOGIA':
            cor = 'rgba(172, 186, 13, 0.85)';
            break;
        case 'COTIDIANO':
            cor = 'rgba(154, 13, 186, 0.85)';
            break;
        case 'ENTRETENIMENTO':
        case 'TELEVISÃO':
            cor = 'rgba(186, 74, 13, 0.85)';
            break;
        case 'MÚSICA':
            cor = 'rgba(245, 239, 0, 0.85)';
            break;
        case 'CELEBRIDADES':
            cor = 'rgba(186, 13, 172, 0.85)';
            break;
        default:
            cor = 'rgba(252, 201, 8, 0.85)';
            break;
    }

    el.style.backgroundColor = cor;
}

function fitDescriptionFont(textEl, wrapEl, minFontSize) {
    minFontSize = minFontSize || 8;
    var maxH = wrapEl.offsetHeight;
    var fontSize;

    if (!maxH) {
        return;
    }

    fontSize = parseInt(window.getComputedStyle(textEl).fontSize, 10);

    while (textEl.scrollHeight > maxH && fontSize > minFontSize) {
        fontSize -= 1;
        textEl.style.fontSize = fontSize + 'px';
    }
}
