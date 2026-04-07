function renderDica(titleEl, textEl, imageEl, item) {
    titleEl.textContent = item.value('TITULO').value.toUpperCase();
    textEl.textContent  = item.value('TEXTO').value;
    imageEl.src         = item.value('FOTO').value;
}

function renderDicaMock(titleEl, textEl, imageEl, dado) {
    titleEl.textContent = dado.TITULO.toUpperCase();
    textEl.textContent  = dado.TEXTO;
    imageEl.src         = dado.FOTO;
}

function iniciarTemplate(config, imageEl, loader) {
    var body = document.querySelector('body');

    imageEl.onload = function () {
        body.classList.remove('opacity-0');
        body.classList.add('opacity-100');

        loader.loaded();

        setTimeout(function () {
            loader.finished();
        }, config.duration);
    };

    imageEl.onerror = function () {
        console.error('[dicas] Erro ao carregar imagem.');
        loader.finished();
    };
}

window.onload = function () {
    var titleEl = document.querySelector('#titulo p');
    var textEl  = document.querySelector('#texto p');
    var imageEl = document.getElementById('imagem');

    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = {
            loaded:   function () { console.log('[Mock] loaded()'); },
            finished: function () { console.log('[Mock] finished()'); }
        };
        renderDicaMock(titleEl, textEl, imageEl, MOCK_DATA.dados[0]);
        iniciarTemplate(MOCK_DATA.config, imageEl, mockLoader);
        return;
    }

    ebhtml.create2({}, function (loader) {
        loader.addData('D_PERSONARE', false);
        loader.autoloaded = false;
        loader.nodataiserror = false;

        loader.load(function () {
            var item = loader.data('D_PERSONARE');

            if (item == undefined) {
                console.error('[dicas] Sem dados.');
                loader.finished();
                return;
            }

            renderDica(titleEl, textEl, imageEl, item);
            iniciarTemplate({ duration: 10000 }, imageEl, loader);
        });
    });
};