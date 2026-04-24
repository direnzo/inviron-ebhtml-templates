// ES5 compatível!
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
                                // Animação de máquina de escrever simples para o bloco "saiba mais"
                                if (window.saibaMaisAnimado !== true) {
                                    var saibaMais = document.getElementById('saiba-mais');
                                    var textoSaiba = 'SAIBA MAIS EM IPAONLINE.COM.BR';
                                    if (saibaMais) {
                                        saibaMais.innerHTML = '';
                                        var i = 1;
                                        var digitar = function() {
                                            if (i <= textoSaiba.length) {
                                                saibaMais.innerHTML = textoSaiba.substring(0, i);
                                                i++;
                                                setTimeout(digitar, 90);
                                            } else {
                                                window.saibaMaisAnimado = true;
                                            }
                                        };
                                        setTimeout(digitar, 700); // delay para sincronizar com outras animações
                                    }
                                }
                    // Animação de entrada do fundo azul (escala X)
                    if (window.bgBlueAnimado !== true) {
                        var bgBlue = document.getElementById('bg-blue');
                        if (bgBlue) {
                            setTimeout(function() {
                                bgBlue.className = bgBlue.className
                                    .replace('scale-x-0', 'scale-x-100');
                                window.bgBlueAnimado = true;
                            }, 120);
                        }
                    }
        editoria.innerHTML = dados.EDITORIA ? dados.EDITORIA.toUpperCase() : '';
        headline.innerHTML = dados.TITULO;
        credit.innerHTML = dados.IMAGECREDIT;

        if (dados.LOGO && logo && !isPlaceholderValue(dados.LOGO)) {
            logo.src = dados.LOGO;
        }

        mudaCor(dados.EDITORIA, editoriaWrap);

        aplicarClasseAspectRatio();

        // Aguarda fontes carregarem antes de medir/ajustar o texto.
        // document.fonts.ready nao existe em legacy WebKit — usa setTimeout como fallback.
        var aplicarFit = function() {
            if (headline && headlineWrap) {
                fitTo2Lines(headline, headlineWrap, 14, 56);
            }
            body.classList.add('is-ready');
            // Animação de entrada do bloco de editoria
            if (window.editoriaAnimada !== true) {
                var editoriaRow = document.getElementById('editoria-row');
                if (editoriaRow) {
                    setTimeout(function() {
                        editoriaRow.className = editoriaRow.className
                            .replace('translate-y-full', 'translate-y-0')
                            .replace('opacity-0', 'opacity-100');
                        window.editoriaAnimada = true;
                    }, 100);
                }
            }
            // Animação de entrada do bloco do logo
            if (window.logoAnimado !== true) {
                var logoBlock = document.getElementById('logo-block');
                if (logoBlock) {
                    setTimeout(function() {
                        logoBlock.className = logoBlock.className
                            .replace('translate-y-full', 'translate-y-0')
                            .replace('opacity-0', 'opacity-100');
                        window.logoAnimado = true;
                    }, 200);
                }
            }
            // Animação de entrada do headline (da esquerda para a direita)
            if (window.headlineAnimado !== true) {
                var headlineEl = document.getElementById('headline');
                if (headlineEl) {
                    setTimeout(function() {
                        headlineEl.className = headlineEl.className
                            .replace('translate-x-[-40px]', 'translate-x-0')
                            .replace('opacity-0', 'opacity-100');
                        window.headlineAnimado = true;
                    }, 350);
                }
            }
        };

        if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
            document.fonts.ready.then(function() {
                setTimeout(aplicarFit, 100);
            });
        } else {
            setTimeout(aplicarFit, 400);
        }
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
            // Efeito de escala animada usando Tailwind utilitário
            photo.classList.remove('scale-150');
            photo.classList.add('scale-100');
            
            loader.loaded();
            setTimeout(function () {
                loader.finished();
            }, 15000);
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

        renderizarTemplate(MOCK_DATA.dados);
        carregarImagem(MOCK_DATA.dados.FOTO, mockLoader);
        return;
    }

    ebhtml.create2({}, function (loader) {
        loader.addData('D_JORNAL_IPANEMA');
        loader.nodataiserror = false;
        loader.autoloaded = false;

        loader.load(function () {
            if (loader.data('D_JORNAL_IPANEMA') == undefined) {
                console.error('D_JORNAL_IPANEMA: sem dados');
                loader.finished();
                return;
            }

            var item = loader.data('D_JORNAL_IPANEMA');
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
    var cor = 'rgba(0, 104, 180, 0.9)';
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
            cor = 'rgba(0, 104, 180, 0.9)';
            break;
    }

    el.style.backgroundColor = cor;
}

function fitTo2Lines(textEl, wrapEl, minFontSize, maxFontSize) {
    minFontSize = minFontSize || 14;
    var maxH = wrapEl.offsetHeight;
    var fontSize = parseInt(window.getComputedStyle(textEl).fontSize, 10);

    if (!maxH) { return; }

    if (maxFontSize && fontSize > maxFontSize) {
        fontSize = maxFontSize;
        textEl.style.fontSize = fontSize + 'px';
    }

    while (textEl.scrollHeight > maxH && fontSize > minFontSize) {
        fontSize -= 1;
        textEl.style.fontSize = fontSize + 'px';
    }
}



