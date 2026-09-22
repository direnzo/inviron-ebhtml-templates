/**
 * TEMPLATE BASE - EdgeContents Digital Signage
 * 
 * ATENÇÃO: Use apenas JavaScript ES5 (compatibilidade Android 7+)
 * - Não use arrow functions: () => {}
 * - Não use let/const, apenas var
 * - Não use template strings: `texto ${var}`
 * - Use concatenação: 'texto ' + variavel
 * - Evite o uso de bibliotecas externas
 * - Evite o uso excessivo de funções modernas
 * - Evite o uso excessivo de console.log
 */

var DATASET = 'D_INSTITUCIONAL';
var LOAD_TIMEOUT = 8000;
var MEDIA_TIMEOUT = 8000;
var config = { duration: 15000, debug: true };
var HARDWARE_FRACO = false;

(function() {
    if (window.location.search.indexOf('hwfraco=1') !== -1) { HARDWARE_FRACO = true; return; }
    if (navigator.userAgent.indexOf('Android') !== -1) { HARDWARE_FRACO = true; return; }
    if (navigator.deviceMemory && navigator.deviceMemory <= 1) { HARDWARE_FRACO = true; return; }
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) { HARDWARE_FRACO = true; }
})();

function fitFont(el, container, minEm, maxEm) {
    var low = minEm;
    var high = maxEm;
    var attempt;
    var middle;
    if (!el || !container || !el.textContent) { return; }
    for (attempt = 0; attempt < 8; attempt += 1) {
        middle = (low + high) / 2;
        el.style.fontSize = middle + 'em';
        if (el.scrollWidth <= container.clientWidth && el.scrollHeight <= container.clientHeight) { low = middle; }
        else { high = middle; }
    }
    el.style.fontSize = low + 'em';
}

function fieldValue(data, name) {
    var field = data.value(name);
    return field && field.value ? field.value : '';
}

window.onload = function() {
    var body = document.body;
    var dynamicContent = document.getElementById('dynamicContent');
    var image = document.getElementById('image');
    var titleEl = document.getElementById('title');
    var descEl = document.getElementById('description');
    var titleBox = document.getElementById('titleBox');
    var descBox = document.getElementById('descBox');
    var footerText = document.getElementById('footerText');
    if (HARDWARE_FRACO) { body.classList.add('reduced'); }

    ebhtml.create2({}, function(loader) {
        var finished = false;
        var loaded = false;
        var loadWatchdog = null;
        var mediaWatchdog = null;
        var finishTimer = null;

        function clearTimers() {
            clearTimeout(loadWatchdog);
            clearTimeout(mediaWatchdog);
        }
        function finish(reason) {
            if (finished) { return; }
            finished = true;
            clearTimers();
            clearTimeout(finishTimer);
            if (config.debug) { console.log('[Base] Finalizado: ' + reason); }
            loader.finished();
        }
        function completeSuccess(reason) {
            if (finished || loaded) { return; }
            clearTimeout(mediaWatchdog);
            fitFont(titleEl, titleBox, 0.9, 1.8);
            fitFont(descEl, descBox, 0.7, 1);
            if (dynamicContent) {
                dynamicContent.classList.remove('opacity-0');
                dynamicContent.classList.add('transition-opacity', 'duration-500', 'opacity-100');
            }
            loaded = true;
            loader.loaded();
            finishTimer = setTimeout(function() { finish('duracao concluida'); }, config.duration);
            if (config.debug) { console.log('[Base] Carregado: ' + reason); }
        }
        function loadImage(url) {
            if (!url || !image) { completeSuccess('sem imagem'); return; }
            mediaWatchdog = setTimeout(function() { completeSuccess('timeout da imagem'); }, MEDIA_TIMEOUT);
            image.onload = function() { completeSuccess('imagem carregada'); };
            image.onerror = function() { completeSuccess('imagem indisponivel'); };
            image.src = url;
        }

        loader.addData(DATASET, false);
        loader.nodataiserror = false;
        loader.autoloaded = false;
        loadWatchdog = setTimeout(function() { finish('timeout do loader'); }, LOAD_TIMEOUT);
        loader.load(function() {
            clearTimeout(loadWatchdog);
            try {
                var data = loader.data(DATASET);
                var duration;
                if (!data) { finish('dataset vazio'); return; }
                duration = parseInt(fieldValue(data, 'DURATION'), 10);
                if (duration > 0) { config.duration = duration; }
                if (titleEl) { titleEl.textContent = fieldValue(data, 'TITULO'); }
                if (descEl) { descEl.textContent = fieldValue(data, 'TEXTO'); }
                if (footerText) { footerText.textContent = fieldValue(data, 'FOOTER'); }
                if (titleBox && fieldValue(data, 'COR')) { titleBox.style.backgroundColor = fieldValue(data, 'COR'); }
                loadImage(fieldValue(data, 'FOTO'));
            } catch (error) {
                finish('excecao: ' + (error && error.message ? error.message : error));
            }
        }, function() {
            clearTimeout(loadWatchdog);
            finish('falha no load');
        });
    });
};



