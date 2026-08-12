var months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
var dat = new Date();
var timeFinished = 10000; // 10 segundos

var ALL_RATIO_CLASSES = [
    'ratio-portrait',
    'ratio-empena',
    'ratio-landscape',
    'ratio-ultrawide',
    'ratio-superbanner',
    'ratio-footer'
];

window.onload = function () {

    var body = document.querySelector('body');
    var image = new Image();
    var title = document.querySelector('#barra-laranja p');
    var text = document.querySelector('#text p');
    var dataEl = document.querySelector('footer p:nth-child(2)');

    dataEl.innerText = dat.getDate() + ' de ' + months[dat.getMonth()] + ' ' + dat.getFullYear();

    function isLegacyWebkit() {
        if (!window.CSS || !window.CSS.supports) { return true; }
        return !(window.CSS.supports('color', 'rgb(255 255 255 / 1)') &&
                 window.CSS.supports('gap', '1rem'));
    }

    if (isLegacyWebkit()) {
        body.classList.add('legacy-webkit');
    }

    function definirClasseAspectRatio() {
        var ar = window.innerWidth / window.innerHeight;
        if (ar <= (1 / 3)) { return 'ratio-empena'; }
        if (ar <= (3 / 4)) { return 'ratio-portrait'; }
        if (ar >= 15)      { return 'ratio-footer'; }
        if (ar >= 5)       { return 'ratio-superbanner'; }
        if (ar >= 3)       { return 'ratio-ultrawide'; }
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

    aplicarClasseAspectRatio();

    function exibirDados(dados, ldr) {
        title.innerText = dados.titulo ? dados.titulo.toUpperCase() : '';
        text.innerText = dados.texto ? dados.texto.toUpperCase() : '';

        image.src = dados.foto;
        document.querySelector('#image').appendChild(image);

        image.onload = function () {
            body.classList.add('is-ready');
            ldr.loaded();
            setTimeout(function () {
                ldr.finished();
            }, timeFinished);
        };

        image.onerror = function () {
            body.classList.add('is-ready');
            ldr.loaded();
            ldr.finished();
        };
    }

    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        // Modo mock: simula o loader sem backend
        var mockLoader = { loaded: function () {}, finished: function () {} };
        exibirDados(MOCK_DATA.dados, mockLoader);
        return;
    }

    ebhtml.create2({}, function (loader) {

        loader.addData('D_PODER360');
        loader.nodataiserror = false;
        loader.autoloaded = false;

        loader.load(function () {

            var item = loader.data('D_PODER360');

            if (!item) {
                loader.loaded();
                loader.finished();
                return;
            }

            exibirDados({
                titulo: item.value('titulo').value,
                texto:  item.value('texto').value,
                foto:   item.value('foto').value
            }, loader);
        });
    });
};
