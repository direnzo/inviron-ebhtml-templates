var HARDWARE_FRACO = false;
var activeTitleFit = null;
var titleResizeTimer = null;

(function () {
    var query = window.location.search;
    if (query.indexOf('hwfraco=1') !== -1) {
        HARDWARE_FRACO = true;
    } else if (navigator.userAgent.indexOf('Android') !== -1) {
        HARDWARE_FRACO = true;
    } else if (navigator.deviceMemory && navigator.deviceMemory <= 1) {
        HARDWARE_FRACO = true;
    } else if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
        HARDWARE_FRACO = true;
    }
}());

window.addEventListener('resize', function () {
    clearTimeout(titleResizeTimer);
    titleResizeTimer = setTimeout(function () {
        if (activeTitleFit) { activeTitleFit(); }
    }, 150);
}, false);

if (document.fonts && typeof document.fonts.addEventListener === 'function') {
    document.fonts.addEventListener('loadingdone', function () {
        if (activeTitleFit) { activeTitleFit(); }
    }, false);
}

function fieldValue(record, fieldName) {
    var field;
    var value;
    if (record && typeof record.value === 'function') {
        field = record.value(fieldName);
        value = field && typeof field.value !== 'undefined' ? field.value : '';
    } else if (record) {
        value = typeof record[fieldName] !== 'undefined' ? record[fieldName] : record[fieldName.toLowerCase()];
        if (value && typeof value === 'object' && typeof value.value !== 'undefined') {
            value = value.value;
        }
    }
    if (value === undefined || value === null) { value = ''; }
    return String(value).replace(/^\s+|\s+$/g, '');
}

function plainText(value) {
    return String(value)
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/\s+/g, ' ')
        .replace(/^\s+|\s+$/g, '');
}

function ajustarFonte(element, container, logo, minEm, maxEm, safeGapPx) {
    var low = minEm;
    var high = maxEm;
    var middle;
    var attempt;
    var range;
    var lineRects;
    var elementRect;
    var containerRect;
    var logoRect;
    var topLimit;
    var bottomLimit;
    var index;

    function fitsWithRespiro() {
        var lineRect;
        var overlapsLogo;
        if (element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight) { return false; }
        if (!document.createRange) { return element.scrollHeight <= element.clientHeight - safeGapPx; }
        range = document.createRange();
        range.selectNodeContents(element);
        lineRects = range.getClientRects();
        elementRect = element.getBoundingClientRect();
        containerRect = container.getBoundingClientRect();
        logoRect = logo.getBoundingClientRect();
        topLimit = Math.max(elementRect.top, containerRect.top) + safeGapPx;
        bottomLimit = Math.min(elementRect.bottom, containerRect.bottom) - safeGapPx;
        for (index = 0; index < lineRects.length; index += 1) {
            lineRect = lineRects[index];
            if (lineRect.left < elementRect.left - 2 || lineRect.right > elementRect.right + 2
                || lineRect.top < topLimit || lineRect.bottom > bottomLimit) { return false; }
            overlapsLogo = lineRect.left < logoRect.right && lineRect.right > logoRect.left;
            if (overlapsLogo && lineRect.bottom > logoRect.top - safeGapPx
                && lineRect.top < logoRect.bottom + safeGapPx) { return false; }
        }
        return lineRects.length > 0;
    }

    if (!element || !container || !logo || !element.textContent) { return false; }
    element.style.fontSize = minEm + 'em';
    if (!fitsWithRespiro()) { return false; }
    for (attempt = 0; attempt < CONFIG.typography.fitSteps; attempt += 1) {
        middle = (low + high) / 2;
        element.style.fontSize = middle + 'em';
        if (fitsWithRespiro()) {
            low = middle;
        } else {
            high = middle;
        }
    }
    element.style.fontSize = low + 'em';
    return fitsWithRespiro();
}

function renderNews(record, callback) {
    var content = document.getElementById('dynamicContent');
    var photo = document.getElementById('newsPhoto');
    var title = document.getElementById('title');
    var titleBox = document.getElementById('titleBox');
    var logo = document.getElementById('logoWrap');
    var titleText = plainText(fieldValue(record, CONFIG.fields.title)
        || fieldValue(record, CONFIG.fields.fallbackText)
        || fieldValue(record, CONFIG.fields.fallbackFullText));
    var photoUrl = fieldValue(record, CONFIG.fields.photo);
    var settled = false;

    function fitTitle() {
        var currentAspectRatio = window.innerWidth / window.innerHeight;
        var currentTitleMaxEm = currentAspectRatio >= 3
            ? CONFIG.typography.titleMaxEm.ultrawide
            : (currentAspectRatio < 0.75
                ? CONFIG.typography.titleMaxEm.portrait
                : CONFIG.typography.titleMaxEm.landscape);
        var gapVmin = currentAspectRatio >= 3
            ? CONFIG.typography.titleUltrawideGapVmin : CONFIG.typography.titleBottomGapVmin;
        var safeGapPx = Math.max(8, Math.min(window.innerWidth, window.innerHeight) * gapVmin / 100);
        var fitted = ajustarFonte(title, titleBox, logo, CONFIG.typography.titleMinEm, currentTitleMaxEm, safeGapPx);
        title.style.visibility = fitted ? 'visible' : 'hidden';
        if (!fitted) {
            console.warn('[MAELY] titulo excede a area disponivel mesmo no tamanho minimo');
        }
        return fitted;
    }

    activeTitleFit = fitTitle;

    function complete(success, reason) {
        if (settled) { return; }
        settled = true;
        if (success) {
            setTimeout(function () {
                if (!fitTitle()) {
                    activeTitleFit = null;
                    content.style.opacity = '0';
                    if (typeof callback === 'function') { callback(false, 'titulo excede a area disponivel'); }
                    return;
                }
                content.className = content.className.replace(/\s*opacity-0\b/g, '');
                content.style.opacity = '1';
                if (typeof callback === 'function') { callback(true, reason); }
            }, 120);
            return;
        }
        if (activeTitleFit === fitTitle) { activeTitleFit = null; }
        if (typeof callback === 'function') { callback(success, reason); }
    }

    if (!titleText || !photoUrl) {
        complete(false, 'TITULO ou FOTO ausente');
        return;
    }

    title.textContent = titleText;
    photo.onload = function () { complete(true, 'imagem carregada'); };
    photo.onerror = function () { complete(false, 'imagem indisponivel'); };
    photo.src = photoUrl;
    if (photo.complete && photo.naturalWidth > 0) { complete(true, 'imagem em cache'); }
}

window.MAELYNewsApp = { renderNews: renderNews };

window.playerView = function () {
    window.onload = function () {
        aplicarConfigVisual();

        var finished = false;
        var loaded = false;
        var activeLoader = null;
        var finishTimer = null;
        var retryTimer = null;
        var activeAttempt = 0;

        if (HARDWARE_FRACO) {
            document.body.className += ' hardware-fraco';
        }

        function clearTimers() {
            clearTimeout(finishTimer);
            clearTimeout(retryTimer);
        }

        function finish(reason) {
            if (finished) { return; }
            finished = true;
            clearTimers();
            if (CONFIG.debug) { console.log('[MAELY] finished: ' + reason); }
            if (activeLoader) { activeLoader.finished(); }
        }

        function emptyDone(loader, reason) {
            if (finished || loaded) { return; }
            loaded = true;
            if (CONFIG.debug) { console.log('[MAELY] sem noticia: ' + reason); }
            loader.loaded();
            finishTimer = setTimeout(function () {
                finish(reason);
            }, CONFIG.timing.emptyDelay);
        }

        function attemptLoad(attemptNumber) {
            var attemptId;
            var loaderWatchdog;
            var mediaWatchdog;
            var attemptSettled = false;

            if (finished || loaded) { return; }
            attemptId = ++activeAttempt;

            function retryOrRelease(reason, currentLoader) {
                if (attemptSettled || finished || loaded || attemptId !== activeAttempt) { return; }
                attemptSettled = true;
                clearTimeout(loaderWatchdog);
                clearTimeout(mediaWatchdog);
                if (attemptNumber < CONFIG.timing.maxAttempts) {
                    if (CONFIG.debug) { console.log('[MAELY] tentativa ' + attemptNumber + ' falhou: ' + reason); }
                    retryTimer = setTimeout(function () {
                        attemptLoad(attemptNumber + 1);
                    }, CONFIG.timing.retryDelay);
                } else {
                    emptyDone(currentLoader, reason);
                }
            }

            window.ebhtml.create2({}, function (loader) {
                activeLoader = loader;
                var params = 'amount=' + CONFIG.dataset.amount;
                loader.addData(CONFIG.dataset.name, false, params);
                loader.nodataiserror = false;
                loader.autoloaded = false;

                loaderWatchdog = setTimeout(function () {
                    retryOrRelease('timeout do dataset', loader);
                }, CONFIG.timing.loadTimeout);

                loader.load(function () {
                    var record;
                    if (attemptId !== activeAttempt || attemptSettled || finished || loaded) { return; }
                    clearTimeout(loaderWatchdog);
                    try {
                        record = loader.data(CONFIG.dataset.name);
                        if (!record) {
                            retryOrRelease('dataset vazio', loader);
                            return;
                        }
                        mediaWatchdog = setTimeout(function () {
                            retryOrRelease('timeout da imagem', loader);
                        }, CONFIG.timing.mediaTimeout);
                        renderNews(record, function (success, reason) {
                            if (attemptId !== activeAttempt || attemptSettled || finished || loaded) { return; }
                            if (!success) {
                                retryOrRelease(reason, loader);
                                return;
                            }
                            attemptSettled = true;
                            clearTimeout(mediaWatchdog);
                            loaded = true;
                            loader.loaded();
                            finishTimer = setTimeout(function () {
                                finish('duracao concluida');
                            }, CONFIG.timing.duration);
                        });
                    } catch (error) {
                        retryOrRelease('excecao: ' + (error && error.message ? error.message : error), loader);
                    }
                }, function () {
                    retryOrRelease('falha no loader', loader);
                });
            });
        }

        attemptLoad(1);
    };
};