var DATASET = 'D_PERSONARE';
var DISPLAY_DURATION_MS = 10000;
var LOAD_TIMEOUT_MS = 4000;
var IMAGE_TIMEOUT_MS = 6000;
var HARDWARE_FRACO = false;

(function () {
    if (window.location.search.indexOf('hwfraco=1') !== -1) { HARDWARE_FRACO = true; return; }
    if (navigator.userAgent.indexOf('Android') !== -1) { HARDWARE_FRACO = true; return; }
    if (navigator.deviceMemory && navigator.deviceMemory <= 1) { HARDWARE_FRACO = true; return; }
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) { HARDWARE_FRACO = true; }
}());

function getField(item, fieldName) {
    if (!item || typeof item.value !== 'function') { return ''; }
    try {
        var field = item.value(fieldName);
        return field && typeof field.value !== 'undefined' && field.value !== null ? String(field.value) : '';
    } catch (error) {
        return '';
    }
}

function normalizeItem(item) {
    return {
        title: getField(item, 'TITULO'),
        text: getField(item, 'TEXTO'),
        image: getField(item, 'FOTO')
    };
}

function fitText(element, container, minEm, maxEm) {
    if (!element || !container || !element.textContent) { return; }

    var low = minEm;
    var high = maxEm;
    var best = minEm;
    var attempt;

    for (attempt = 0; attempt < 9; attempt++) {
        var current = (low + high) / 2;
        element.style.fontSize = current + 'em';
        if (element.scrollHeight <= container.clientHeight && element.scrollWidth <= container.clientWidth) {
            best = current;
            low = current;
        } else {
            high = current;
        }
    }

    element.style.fontSize = best.toFixed(3) + 'em';
}

function fitContent() {
    fitText(document.querySelector('#titulo p'), document.getElementById('titulo'), 0.85, 1.65);
    fitText(document.getElementById('texto'), document.getElementById('texto-container'), 0.58, 1.08);
}

function renderContent(data) {
    var titleElement = document.querySelector('#titulo p');
    var textElement = document.getElementById('texto');

    titleElement.textContent = data.title ? data.title.toUpperCase() : '';
    textElement.textContent = data.text || '';
    fitContent();
}

function startTemplate(data, loader, duration) {
    var shell = document.getElementById('conteudo-dinamico');
    var image = document.getElementById('imagem');
    var settled = false;
    var finished = false;
    var imageWatchdog = null;

    function finish() {
        if (finished) { return; }
        finished = true;
        loader.finished();
    }

    function reveal() {
        if (settled) { return; }
        settled = true;
        if (imageWatchdog) { clearTimeout(imageWatchdog); }
        shell.classList.remove('opacity-0');
        shell.classList.add('opacity-100');
        fitContent();
        loader.loaded();
        setTimeout(finish, duration);
    }

    function failImage() {
        if (settled) { return; }
        settled = true;
        if (imageWatchdog) { clearTimeout(imageWatchdog); }
        console.error('[personare_dicas] Imagem indisponivel.');
        finish();
    }

    renderContent(data);

    if (!data.image) {
        failImage();
        return;
    }

    image.onload = reveal;
    image.onerror = failImage;
    imageWatchdog = setTimeout(failImage, IMAGE_TIMEOUT_MS);
    image.src = data.image;
}

function loadRuntime() {
    ebhtml.create2({}, function (loader) {
        var resolved = false;
        var watchdog = null;

        function finishWithError(reason) {
            if (resolved) { return; }
            resolved = true;
            if (watchdog) { clearTimeout(watchdog); }
            console.warn('[personare_dicas] ' + reason + '; liberando o proximo item.');
            loader.finished();
        }

        loader.addData(DATASET, false);
        loader.autoloaded = false;
        loader.nodataiserror = false;
        watchdog = setTimeout(function () { finishWithError('timeout do canal ' + DATASET); }, LOAD_TIMEOUT_MS);

        loader.load(function () {
            if (resolved) { return; }
            if (watchdog) { clearTimeout(watchdog); }

            try {
                var item = loader.data(DATASET);
                if (!item) {
                    finishWithError('canal sem item');
                    return;
                }

                var data = normalizeItem(item);
                if (!data.title || !data.text || !data.image) {
                    finishWithError('campos obrigatorios ausentes');
                    return;
                }

                startTemplate(data, loader, DISPLAY_DURATION_MS);
                resolved = true;
            } catch (error) {
                finishWithError('excecao no processamento: ' + (error && error.message ? error.message : error));
            }
        }, function () {
            finishWithError('falha no loader.load()');
        });
    });
}

window.onload = function () {
    var resizeTimer = null;

    if (HARDWARE_FRACO) {
        document.body.classList.add('hardware-fraco');
    }

    window.onresize = function () {
        if (resizeTimer) { clearTimeout(resizeTimer); }
        resizeTimer = setTimeout(fitContent, 120);
    };

    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = {
            loaded: function () { console.log('[Mock] loaded()'); },
            finished: function () { console.log('[Mock] finished()'); }
        };
        var mockItem = MOCK_DATA.dados[0] || {};
        startTemplate({
            title: mockItem.TITULO || '',
            text: mockItem.TEXTO || '',
            image: mockItem.FOTO || ''
        }, mockLoader, MOCK_DATA.config.duration || DISPLAY_DURATION_MS);
        return;
    }

    loadRuntime();
};