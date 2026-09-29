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

var LOAD_TIMEOUT = 8000;
var MEDIA_TIMEOUT = 8000;
var HARDWARE_FRACO = false;

(function() {
    if (window.location.search.indexOf('hwfraco=1') !== -1) { HARDWARE_FRACO = true; return; }
    // Specs reais primeiro: um Android atual (TV box, tablet) pode ser mais forte que o PC de teste.
    if (navigator.deviceMemory && navigator.deviceMemory <= 1) { HARDWARE_FRACO = true; return; }
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) { HARDWARE_FRACO = true; return; }
    // Sem specs expostas (comum em WebView Android antigo, que nao suporta essas APIs) -> assume fraco so nesse caso.
    if (!navigator.deviceMemory && !navigator.hardwareConcurrency && navigator.userAgent.indexOf('Android') !== -1) {
        HARDWARE_FRACO = true;
    }
})();

// Quando o campo nao existe no dataset, o ebhtml.js devolve o placeholder
// literal "[nome_do_campo]" (sempre minusculo, ver EBBrowserDataItem.value)
// em vez de string vazia. Trata como ausente.
function isPlaceholder(value, name) {
    return value.toLowerCase() === '[' + name.toLowerCase() + ']';
}

function fieldValue(data, name) {
    var field = data.value(name);
    var value = field && field.value ? field.value : '';
    if (isPlaceholder(value, name)) { return ''; }
    return value;
}

function pickText(item) {
    var titulo = item ? fieldValue(item, 'TITULO') : '';
    if (titulo) { return titulo; }
    return item ? fieldValue(item, 'TEXTO') : '';
}

function applyCredit(el, value) {
    if (!el) { return; }
    if (value) {
        el.textContent = value;
        el.classList.remove('hidden');
    } else {
        el.classList.add('hidden');
    }
}

// Esconde a pilula de categoria quando o dataset nao traz o campo (evita bolha colorida vazia)
function applyCategory(el, value) {
    if (!el) { return; }
    if (value) {
        el.textContent = value;
        el.classList.remove('hidden');
    } else {
        el.classList.add('hidden');
    }
}

window.onload = function() {
    aplicarConfigVisual();
    var body = document.body;
    var dynamicContent = document.getElementById('dynamicContent');
    var card0 = document.getElementById('card0');
    var card1 = document.getElementById('card1');
    var photo0 = document.getElementById('photo0');
    var photo1 = document.getElementById('photo1');
    var title0 = document.getElementById('title0');
    var title1 = document.getElementById('title1');
    var category0 = document.getElementById('category0');
    var category1 = document.getElementById('category1');
    var credit0 = document.getElementById('credit0');
    var credit1 = document.getElementById('credit1');
    var ctaText = document.getElementById('ctaText');
    if (HARDWARE_FRACO) { body.classList.add('reduced'); }

    ebhtml.create2({}, function(loader) {
        var finished = false;
        var loaded = false;
        var singleItem = false;
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
            if (CONFIG.debug) { console.log('[Base] Finalizado: ' + reason); }
            loader.finished();
        }
        function completeSuccess(reason) {
            if (finished || loaded) { return; }
            clearTimeout(mediaWatchdog);
            if (dynamicContent) {
                dynamicContent.classList.remove('opacity-0');
                dynamicContent.classList.add('transition-opacity', 'duration-500', 'opacity-100');
            }
            loaded = true;
            loader.loaded();
            finishTimer = setTimeout(function() { finish('duracao concluida'); }, CONFIG.timing.duration);
            if (CONFIG.debug) { console.log('[Base] Carregado: ' + reason); }
        }
        var pendingImages = 0;
        function imageDone(reason) {
            pendingImages -= 1;
            if (pendingImages <= 0) { completeSuccess(reason); }
        }
        function bindImage(img, url) {
            if (!url || !img) { imageDone('sem imagem'); return; }
            img.onload = function() { imageDone('imagem carregada'); };
            img.onerror = function() { imageDone('imagem indisponivel'); };
            img.src = url;
        }
        function loadImages(url0, url1) {
            pendingImages = singleItem ? 1 : 2;
            clearTimeout(mediaWatchdog);
            mediaWatchdog = setTimeout(function() { completeSuccess('timeout das imagens'); }, MEDIA_TIMEOUT);
            bindImage(photo0, url0);
            if (!singleItem) { bindImage(photo1, url1); }
        }

        loader.addData(CONFIG.dataset.name, false, CONFIG.dataset.params);
        loader.nodataiserror = false;
        loader.autoloaded = false;
        loadWatchdog = setTimeout(function() { finish('timeout do loader'); }, LOAD_TIMEOUT);
        loader.load(function() {
            clearTimeout(loadWatchdog);
            try {
                var list = loader.datalist(CONFIG.dataset.name);
                var total = list ? list.count() : 0;
                var item0;
                var item1;
                var foto0 = '';
                var foto1 = '';
                if (!list || total === 0) { finish('dataset vazio'); return; }
                item0 = list.get(0);
                singleItem = total < 2;
                // CONFIG.dataset.params pede amount=2; com so 1 item disponivel, mostra so a
                // primeira linha (sem duplicar) e mantem o card0 do mesmo tamanho/posicao de sempre.
                if (card1) { card1.classList.toggle('hidden', singleItem); }
                if (title0) { title0.textContent = pickText(item0); }
                applyCategory(category0, fieldValue(item0, 'CATEGORY'));
                if (credit0) { applyCredit(credit0, fieldValue(item0, 'IMAGECREDIT')); }
                if (ctaText) { ctaText.textContent = fieldValue(item0, 'FOOTER') || CONFIG.footerText; }
                foto0 = fieldValue(item0, 'FOTO');
                if (!singleItem) {
                    item1 = list.get(1);
                    if (title1) { title1.textContent = pickText(item1); }
                    applyCategory(category1, fieldValue(item1, 'CATEGORY'));
                    if (credit1) { applyCredit(credit1, fieldValue(item1, 'IMAGECREDIT')); }
                    foto1 = fieldValue(item1, 'FOTO');
                }
                loadImages(foto0, foto1);
            } catch (error) {
                finish('excecao: ' + (error && error.message ? error.message : error));
            }
        }, function() {
            clearTimeout(loadWatchdog);
            finish('falha no load');
        });
    });
};



