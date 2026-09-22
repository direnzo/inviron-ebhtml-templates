window.onload = function () {
    var DURATION_MS = 30000;
    var IMAGE_LOAD_TIMEOUT_MS = 5000;
    var REVEAL_DELAY_MS = 500;
    var dataName = 'D_POP_SERIES';
    var fallbackImagePath = 'img/fundo.png';
    var overlay = document.getElementById('overlay');
    var imageHolder = document.getElementById('imagem');
    var textNode = document.getElementById('texto');
    var textWrap = document.getElementById('texto-wrap');
    var image = new Image();
    var originalText = '';

    ebhtml.create2({}, function (loader) {
        var settled = false;
        var imageWatchdog = null;

        function revealOverlay(done) {
            if (!overlay) {
                done();
                return;
            }
            overlay.className = '';
            setTimeout(done, REVEAL_DELAY_MS);
        }

        function concludeNow() {
            if (settled) {
                return;
            }
            settled = true;
            if (imageWatchdog) {
                clearTimeout(imageWatchdog);
            }
            loader.loaded();
            setTimeout(function () {
                loader.finished();
            }, DURATION_MS);
        }

        function revealAndConclude() {
            revealOverlay(function () {
                concludeNow();
            });
        }

        function fallbackError() {
            originalText = '';
            fitTextInBar(textWrap, textNode, originalText);
            loadImageAndRender(fallbackImagePath, revealAndConclude);
        }

        function applyTextAndFit(texto) {
            originalText = sanitizeText(texto);
            fitTextInBar(textWrap, textNode, originalText);
        }

        function loadImageAndRender(imageUrl, done) {
            image.onload = function () {
                while (imageHolder.firstChild) {
                    imageHolder.removeChild(imageHolder.firstChild);
                }
                imageHolder.appendChild(image);
                fitTextInBar(textWrap, textNode, originalText);
                done();
            };

            image.onerror = function () {
                done();
            };

            imageWatchdog = setTimeout(function () {
                done();
            }, IMAGE_LOAD_TIMEOUT_MS);

            image.src = imageUrl;
        }

        loader.addData(dataName);
        loader.nodataiserror = false;
        loader.autoloaded = false;
        loader.load(function () {
            var item = loader.data(dataName);
            var texto = '';
            var foto = '';

            if (item && item.value('texto')) {
                texto = item.value('texto').value || '';
            }

            if (item && item.value('foto')) {
                foto = item.value('foto').value || '';
            }

            applyTextAndFit(texto);

            if (!foto) {
                loadImageAndRender(fallbackImagePath, revealAndConclude);
                return;
            }

            loadImageAndRender(foto, revealAndConclude);
        }, fallbackError);

        window.onresize = function () {
            fitTextInBar(textWrap, textNode, originalText);
        };
    });
};

function sanitizeText(text) {
    return (text || '').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
}

var TEXT_PROBE_NODE = null;

function getTextProbeNode() {
    if (TEXT_PROBE_NODE) {
        return TEXT_PROBE_NODE;
    }

    TEXT_PROBE_NODE = document.createElement('div');
    TEXT_PROBE_NODE.id = 'text-fit-probe';
    TEXT_PROBE_NODE.style.position = 'absolute';
    TEXT_PROBE_NODE.style.left = '-10000px';
    TEXT_PROBE_NODE.style.top = '-10000px';
    TEXT_PROBE_NODE.style.visibility = 'hidden';
    TEXT_PROBE_NODE.style.pointerEvents = 'none';
    TEXT_PROBE_NODE.style.whiteSpace = 'normal';
    TEXT_PROBE_NODE.style.wordWrap = 'break-word';
    TEXT_PROBE_NODE.style.overflowWrap = 'break-word';
    TEXT_PROBE_NODE.style.margin = '0';
    TEXT_PROBE_NODE.style.padding = '0';
    TEXT_PROBE_NODE.style.border = '0';
    document.body.appendChild(TEXT_PROBE_NODE);

    return TEXT_PROBE_NODE;
}

function getLineHeightEm(textElement) {
    var style = window.getComputedStyle(textElement);
    var fontPx = parseFloat(style.fontSize) || 16;
    var linePx = parseFloat(style.lineHeight);

    if (!linePx || style.lineHeight === 'normal') {
        return 1.08;
    }

    return linePx / fontPx;
}

function getFitBoundsPx(container) {
    var ratio = (window.innerWidth || 1) / (window.innerHeight || 1);
    var viewportH = window.innerHeight || 1;
    var height = container.clientHeight || 1;
    var width = container.clientWidth || 1;
    var minPx = 1;
    var maxByHeight = height * 0.7;
    var maxByWidth = width * 0.2;
    var maxPx = Math.min(maxByHeight, maxByWidth);

    if (ratio > 1) {
        maxPx = Math.min(maxPx * 0.78, viewportH * 0.055);
    } else {
        maxPx = Math.min(maxPx, viewportH * 0.07);
    }

    if (maxPx < minPx) {
        maxPx = minPx;
    }
    if (maxPx > 720) {
        maxPx = 720;
    }

    return {
        minPx: minPx,
        maxPx: maxPx
    };
}

function getFitPrecisionPx(maxPx) {
    if (maxPx <= 40) {
        return 0.2;
    }
    if (maxPx <= 120) {
        return 0.35;
    }
    return 0.5;
}

function canFitText(container, textElement, text, fontPx, lineHeightEm) {
    var probe = getTextProbeNode();
    var style = window.getComputedStyle(textElement);
    var containerWidth = container.clientWidth;
    var containerHeight = container.clientHeight;

    probe.style.width = containerWidth + 'px';
    probe.style.fontFamily = style.fontFamily;
    probe.style.fontWeight = style.fontWeight;
    probe.style.fontStyle = style.fontStyle;
    probe.style.letterSpacing = style.letterSpacing;
    probe.style.textTransform = style.textTransform;
    probe.style.fontSize = fontPx.toFixed(2) + 'px';
    probe.style.lineHeight = lineHeightEm + 'em';
    probe.innerText = text;

    return probe.scrollHeight <= containerHeight && probe.scrollWidth <= containerWidth;
}

function findBestFittingPx(container, textElement, fullText, maxPx, minPx, lineHeightEm) {
    var low = minPx;
    var high = maxPx;
    var mid = maxPx;
    var best = minPx;
    var precision = getFitPrecisionPx(maxPx);
    var guard = 0;

    if (canFitText(container, textElement, fullText, high, lineHeightEm)) {
        return high;
    }

    if (!canFitText(container, textElement, fullText, low, lineHeightEm)) {
        return low;
    }

    while (low <= high && guard < 80) {
        mid = (low + high) / 2;

        if (!canFitText(container, textElement, fullText, mid, lineHeightEm)) {
            high = mid - precision;
        } else {
            best = mid;
            low = mid + precision;
        }
        guard = guard + 1;
    }

    return best;
}

function fitTextInBar(container, textElement, fullText) {
    var fitBounds;
    var bestPx;
    var lineHeightEm;

    if (!container || !textElement) {
        return;
    }

    textElement.innerText = fullText || '';
    lineHeightEm = getLineHeightEm(textElement);
    textElement.style.lineHeight = lineHeightEm + 'em';

    fitBounds = getFitBoundsPx(container);
    bestPx = findBestFittingPx(container, textElement, fullText || '', fitBounds.maxPx, fitBounds.minPx, lineHeightEm);
    textElement.style.fontSize = bestPx.toFixed(2) + 'px';
}