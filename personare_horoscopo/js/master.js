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

    var textEl = document.querySelector('#texto p');
    var textContainer = document.querySelector('#texto');
    fitDescriptionFont(textEl, textContainer, 10);

    loader.loaded();

    setTimeout(function () {
        loader.finished();
    }, config.duration);
}

window.onload = function () {
    var icone = document.getElementById('icone');
    var title = document.querySelector('#titulo p');
    var text  = document.querySelector('#texto p');

    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = {
            loaded:   function () { console.log('[Mock] loaded()'); },
            finished: function () { console.log('[Mock] finished()'); }
        };
        renderSignoMock(icone, title, text, MOCK_DATA.dados[0]);
        iniciarTemplate(MOCK_DATA.config, mockLoader);
        return;
    }

    ebhtml.create2({}, function (loader) {
        loader.addData('D_HOROSCOPO_PERSONARE_CURTO', true, 'amount=1');
        loader.autoloaded = false;
        loader.nodataiserror = false;

        loader.load(function () {
            var lista = loader.datalist('D_HOROSCOPO_PERSONARE_CURTO');

            if (lista == undefined || lista.count() < 1) {
                console.error('[horoscopo] Sem dados.');
                loader.finished();
                return;
            }

            renderSigno(icone, title, text, lista.get(0));
            iniciarTemplate({ duration: 15000 }, loader);
        });
    });
};