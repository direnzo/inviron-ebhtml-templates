var LOAD_TIMEOUT = 8000;
var MEDIA_TIMEOUT = 8000;
var HARDWARE_FRACO = false;

(function() {
    if (window.location.search.indexOf('hwfraco=1') !== -1) { HARDWARE_FRACO = true; return; }
    if (navigator.deviceMemory && navigator.deviceMemory <= 1) { HARDWARE_FRACO = true; return; }
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) { HARDWARE_FRACO = true; return; }
    if (!navigator.deviceMemory && !navigator.hardwareConcurrency && navigator.userAgent.indexOf('Android') !== -1) {
        HARDWARE_FRACO = true;
    }
})();

function isPlaceholder(value, name) {
    return value.toLowerCase() === '[' + name.toLowerCase() + ']';
}

function fieldValue(item, name) {
    var field = item && item.value(name);
    var value = field && field.value ? String(field.value) : '';
    return value && !isPlaceholder(value, name) ? value : '';
}

function fitFont(element, container, minEm, maxEm) {
    var low = minEm;
    var high = maxEm;
    var middle;
    var attempt;
    var range;
    var textRect;
    var boxRect;
    var fits;
    if (!element || !container || !element.textContent) { return; }
    for (attempt = 0; attempt < 8; attempt += 1) {
        middle = (low + high) / 2;
        element.style.fontSize = middle + 'em';
        fits = element.scrollWidth <= container.clientWidth && element.scrollHeight <= container.clientHeight;
        if (fits && document.createRange && element.getBoundingClientRect) {
            range = document.createRange();
            range.selectNodeContents(element);
            textRect = range.getBoundingClientRect();
            boxRect = container.getBoundingClientRect();
            if (textRect.width > 0 && (textRect.right > boxRect.right - 2 || textRect.bottom > boxRect.bottom - 2)) {
                fits = false;
            }
        }
        if (fits) { low = middle; } else { high = middle; }
    }
    element.style.fontSize = low + 'em';
}

function setCategory(element, value) {
    if (!element) { return; }
    if (value) {
        element.textContent = value;
        element.classList.remove('hidden');
    } else {
        element.textContent = '';
        element.classList.add('hidden');
    }
}

window.onload = function() {
    aplicarConfigVisual();
    var body = document.body;
    var dynamicContent = document.getElementById('dynamicContent');
    var brandLogo = document.getElementById('brandLogo');
    var card1 = document.getElementById('card1');
    var photo0 = document.getElementById('photo0');
    var photo1 = document.getElementById('photo1');
    var textWrap0 = document.getElementById('textWrap0');
    var textWrap1 = document.getElementById('textWrap1');
    var title0 = document.getElementById('title0');
    var title1 = document.getElementById('title1');
    var category0 = document.getElementById('category0');
    var category1 = document.getElementById('category1');
    var ctaText = document.getElementById('ctaText');
    var portrait = window.innerHeight / window.innerWidth >= 4 / 3;
    if (HARDWARE_FRACO) { body.classList.add('reduced'); }

    ebhtml.create2({}, function(loader) {
        var finished = false;
        var loaded = false;
        var singleItem = false;
        var pendingImages = 0;
        var loadWatchdog = null;
        var mediaWatchdog = null;
        var finishTimer = null;
        var ctaTimer = null;

        function clearTimers() {
            clearTimeout(loadWatchdog);
            clearTimeout(mediaWatchdog);
            clearTimeout(ctaTimer);
        }

        function finish(reason, delay) {
            if (finished) { return; }
            finished = true;
            clearTimers();
            clearTimeout(finishTimer);
            if (!loaded) {
                loaded = true;
                loader.loaded();
            }
            if (CONFIG.debug && reason) { console.log('[GZH] ' + reason); }
            finishTimer = setTimeout(function() { loader.finished(); }, delay || 0);
        }

        function completeSuccess(reason) {
            if (finished || loaded) { return; }
            clearTimeout(mediaWatchdog);
            fitFont(title0, textWrap0,
                portrait ? CONFIG.layout.titleFit.portraitMinEm : CONFIG.layout.titleFit.horizontalMinEm,
                portrait ? CONFIG.layout.titleFit.portraitMaxEm : CONFIG.layout.titleFit.horizontalMaxEm);
            if (!singleItem) {
                fitFont(title1, textWrap1,
                    portrait ? CONFIG.layout.titleFit.portraitMinEm : CONFIG.layout.titleFit.horizontalMinEm,
                    portrait ? CONFIG.layout.titleFit.portraitMaxEm : CONFIG.layout.titleFit.horizontalMaxEm);
            }
            dynamicContent.classList.remove('opacity-0');
            dynamicContent.classList.add('is-visible');
            loaded = true;
            loader.loaded();
            ctaTimer = setTimeout(function() { dynamicContent.classList.add('cta-visible'); }, CONFIG.timing.ctaDelay);
            finishTimer = setTimeout(function() { finish(reason || 'duração concluída'); }, CONFIG.timing.duration);
        }

        function imageDone() {
            pendingImages -= 1;
            if (pendingImages <= 0) { completeSuccess('mídia pronta'); }
        }

        function bindImage(image, url) {
            var settled = false;
            function settle(success) {
                if (settled) { return; }
                settled = true;
                image.onload = null;
                image.onerror = null;
                if (!success) {
                    image.removeAttribute('src');
                    if (CONFIG.debug) { console.warn('[GZH] Asset indisponível: ' + url); }
                }
                imageDone();
            }
            if (!image) { imageDone(); return; }
            if (!url) { settle(false); return; }
            image.onload = function() { settle(true); };
            image.onerror = function() { settle(false); };
            image.src = url;
        }

        function renderItem(item, photo, title, category) {
            var headline = fieldValue(item, 'TITULO') || fieldValue(item, 'TEXTO');
            var credit = fieldValue(item, 'IMAGECREDIT');
            title.textContent = headline;
            photo.alt = headline + (credit ? ' - Foto: ' + credit : '');
            setCategory(category, fieldValue(item, 'CATEGORY'));
            return fieldValue(item, 'FOTO') || CONFIG.assets.photoFallback;
        }

        function handleLoadError(error) {
            if (error) { console.warn('[GZH] Falha ao carregar D_GZH:', error); }
            finish('falha no carregamento do dataset', CONFIG.timing.emptyFinishDelay);
        }

        try {
            loader.addData(CONFIG.dataset.name, false, CONFIG.dataset.params);
            loader.nodataiserror = false;
            loader.autoloaded = false;
            loadWatchdog = setTimeout(function() {
                console.warn('[GZH] Timeout ao carregar D_GZH');
                finish('timeout do dataset', CONFIG.timing.emptyFinishDelay);
            }, LOAD_TIMEOUT);

            loader.load(function() {
                if (finished) { return; }
                clearTimeout(loadWatchdog);
                try {
                    var list = loader.datalist(CONFIG.dataset.name);
                    var total = list ? list.count() : 0;
                    var urls = [];
                    var item0;
                    var item1;
                    if (total < 1) {
                        finish('dataset vazio', CONFIG.timing.emptyFinishDelay);
                        return;
                    }
                    item0 = list.get(0);
                    singleItem = total < 2;
                    card1.classList.toggle('hidden', singleItem);
                    urls.push(renderItem(item0, photo0, title0, category0));
                    if (!singleItem) {
                        item1 = list.get(1);
                        urls.push(renderItem(item1, photo1, title1, category1));
                    }
                    if (ctaText) {
                        ctaText.textContent = fieldValue(item0, 'FOOTER') || CONFIG.footerText;
                    }
                    pendingImages = urls.length + 1;
                    mediaWatchdog = setTimeout(function() {
                        console.warn('[GZH] Timeout ao carregar imagens; exibindo conteúdo disponível');
                        completeSuccess('timeout das imagens');
                    }, MEDIA_TIMEOUT);
                    bindImage(brandLogo, CONFIG.assets.logo);
                    bindImage(photo0, urls[0]);
                    if (!singleItem) { bindImage(photo1, urls[1]); }
                } catch (error) {
                    console.warn('[GZH] Erro ao interpretar D_GZH:', error);
                    finish('exceção ao renderizar dados', CONFIG.timing.emptyFinishDelay);
                }
            }, handleLoadError);
        } catch (error) {
            console.warn('[GZH] Erro ao iniciar D_GZH:', error);
            finish('erro ao iniciar loader', CONFIG.timing.emptyFinishDelay);
        }
    });
};
