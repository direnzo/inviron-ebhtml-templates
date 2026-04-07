function iniciarFundo() {
    var fundo = document.getElementById('fundo-img');

    function aplicarPan() {
        var excess = fundo.offsetWidth - window.innerWidth;
        if (excess <= 0) {
            console.warn('[fundo] Imagem nao e mais larga que a tela. Pan ignorado.');
            return;
        }
        console.log('[fundo] Pan: ' + fundo.offsetWidth + 'px img -> excesso ' + excess + 'px');
        fundo.style.webkitTransition = 'transform 25s linear';
        fundo.style.transition = 'transform 25s linear';
        // Pequeno delay para garantir que o estado inicial seja pintado antes de iniciar o pan
        setTimeout(function () {
            fundo.style.webkitTransform = 'translateX(-' + excess + 'px)';
            fundo.style.transform = 'translateX(-' + excess + 'px)';
        }, 50);
    }

    if (fundo.complete && fundo.naturalWidth > 0) {
        aplicarPan();
    } else {
        fundo.onload = aplicarPan;
        fundo.onerror = function () {
            console.warn('[fundo] Imagem nao carregada.');
        };
    }
}

function fitDescriptionFont(descriptionEl, containerEl, minFontSize) {
    minFontSize = minFontSize || 12;
    var fontSize = parseInt(window.getComputedStyle(descriptionEl).fontSize);
    var containerMaxHeight = containerEl.offsetHeight;

    while (
        (containerEl.scrollHeight > containerMaxHeight ||
         descriptionEl.scrollHeight > containerMaxHeight) &&
        fontSize > minFontSize
    ) {
        fontSize -= 1;
        descriptionEl.style.fontSize = fontSize + 'px';
    }
}

function renderSigno(iconeEl, titleEl, textEl, item) {
    var signSlug = item.value('sign').value.substring(3);
    iconeEl.src = 'img/' + signSlug + '.png';
    titleEl.textContent = item.value('title').value.toUpperCase();
    textEl.innerHTML = item.value('text').value;
}

function renderSignoMock(iconeEl, titleEl, textEl, dado) {
    var signSlug = dado.SIGN.substring(3);
    iconeEl.src = 'img/' + signSlug + '.png';
    titleEl.textContent = dado.TITLE.toUpperCase();
    textEl.innerHTML = dado.TEXT;
}

function iniciarTemplate(config, loader) {
    var body = document.querySelector('body');
    body.classList.remove('opacity-0');
    body.classList.add('opacity-100');

    var text1 = document.querySelector('#texto p');
    var text2 = document.querySelector('#texto2 p');
    var textContainer1 = document.querySelector('#texto');
    var textContainer2 = document.querySelector('#texto2');

    fitDescriptionFont(text1, textContainer1, 10);
    fitDescriptionFont(text2, textContainer2, 10);

    loader.loaded();

    setTimeout(function () {
        loader.finished();
    }, config.duration);
}

window.onload = function () {
    iniciarFundo();

    var icone1 = document.getElementById('icone');
    var title1 = document.querySelector('#titulo p');
    var text1 = document.querySelector('#texto p');
    var icone2 = document.getElementById('icone2');
    var title2 = document.querySelector('#titulo2 p');
    var text2 = document.querySelector('#texto2 p');

    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = {
            loaded: function () { console.log('[Mock] loaded()'); },
            finished: function () { console.log('[Mock] finished()'); }
        };
        renderSignoMock(icone1, title1, text1, MOCK_DATA.dados[0]);
        renderSignoMock(icone2, title2, text2, MOCK_DATA.dados[1]);
        iniciarTemplate(MOCK_DATA.config, mockLoader);
        return;
    }

    ebhtml.create2({}, function (loader) {
        loader.addData('D_HOROSCOPO_PERSONARE_CURTO', true, 'amount=2&order=ID&orderkind=a');
        loader.autoloaded = false;
        loader.nodataiserror = false;

        loader.load(function () {
            var lista = loader.datalist('D_HOROSCOPO_PERSONARE_CURTO');

            if (lista == undefined || lista.count() < 2) {
                console.error('[horoscopo] Dados insuficientes: esperado 2 signos, recebido ' + (lista ? lista.count() : 0));
                loader.finished();
                return;
            }

            renderSigno(icone1, title1, text1, lista.get(0));
            renderSigno(icone2, title2, text2, lista.get(1));

            iniciarTemplate({ duration: 15000 }, loader);
        });
    });
};