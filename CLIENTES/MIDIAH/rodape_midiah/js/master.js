(function () {
    var state = {
        loader: null,
        loaded: false,
        finished: false,
        finishTimer: null,
        slideTimer: null,
        watchdogTimer: null,
        items: [],
        currentIndex: -1
    };

    function getConfigValue(name, fallback) {
        if (typeof CONFIG !== 'undefined' && CONFIG && CONFIG[name] !== undefined) {
            return CONFIG[name];
        }
        return fallback;
    }

    function setText(id, text) {
        var element = document.getElementById(id);
        if (element) {
            element.innerHTML = '';
            element.appendChild(document.createTextNode(text || ''));
        }
    }

    function getField(item, name) {
        var field;
        if (!item) {
            return '';
        }
        if (item.value) {
            field = item.value(name);
            if (field && field.value !== undefined && field.value !== null) {
                return String(field.value);
            }
        }
        if (item[name] !== undefined && item[name] !== null) {
            return String(item[name]);
        }
        return '';
    }

    function getDataset(loader, datasetName) {
        if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA && MOCK_DATA.enabled && MOCK_DATA.datasets) {
            return MOCK_DATA.datasets[datasetName] || null;
        }
        return loader.data(datasetName);
    }

    function quoteAllowed(quote) {
        var allowed = getConfigValue('quotesPermitidos', []);
        var blocked = getConfigValue('quotesBloqueados', []);
        var i;
        for (i = 0; i < blocked.length; i++) {
            if (blocked[i] === quote) {
                return false;
            }
        }
        if (!allowed || !allowed.length) {
            return true;
        }
        for (i = 0; i < allowed.length; i++) {
            if (allowed[i] === quote) {
                return true;
            }
        }
        return false;
    }

    function tipoAllowed(quote, tipoPermitido) {
        if (!tipoPermitido) {
            return true;
        }
        return !!quote && quote.indexOf(tipoPermitido + ':') === 0;
    }

    function getShortName(quote, fallback) {
        var names = getConfigValue('nomesCurtos', {});
        if (names && names[quote]) {
            return names[quote];
        }
        return fallback || '';
    }

    function formatNumber(value, decimals) {
        var numberValue;
        if (value === undefined || value === null || value === '') {
            return '';
        }
        numberValue = parseFloat(String(value).replace(',', '.'));
        if (isNaN(numberValue)) {
            return String(value);
        }
        return numberValue.toFixed(decimals).replace('.', ',');
    }

    function formatValue(value) {
        if (value === undefined || value === null || value === '') {
            return '';
        }
        return 'R$ ' + formatNumber(value, 2);
    }

    function formatVariation(value) {
        var numberValue;
        var arrow;
        if (value === undefined || value === null || value === '') {
            return '';
        }
        numberValue = parseFloat(String(value).replace(',', '.'));
        if (isNaN(numberValue)) {
            return String(value);
        }
        if (numberValue > 0) {
            arrow = '\u25B2 ';
        } else if (numberValue < 0) {
            arrow = '\u25BC ';
        } else {
            arrow = '';
        }
        return arrow + formatNumber(Math.abs(numberValue), 2) + '%';
    }

    function getVariationClass(value) {
        var numberValue = parseFloat(String(value || '0').replace(',', '.'));
        if (numberValue > 0) {
            return 'quote-var is-up';
        }
        if (numberValue < 0) {
            return 'quote-var is-down';
        }
        return 'quote-var';
    }

    function parseDateValue(dateValue) {
        var parts;
        var date;
        if (!dateValue) {
            return null;
        }
        parts = String(dateValue).replace('T', ' ').split(/[- :]/);
        if (parts.length < 5) {
            return null;
        }
        date = new Date(
            parseInt(parts[0], 10),
            parseInt(parts[1], 10) - 1,
            parseInt(parts[2], 10),
            parseInt(parts[3], 10),
            parseInt(parts[4], 10),
            parts.length > 5 ? parseInt(parts[5], 10) : 0
        );
        if (isNaN(date.getTime())) {
            return null;
        }
        return date;
    }

    function isFreshTimestamp(dateValue, maxAgeMinutes) {
        var date = parseDateValue(dateValue);
        var ageMinutes;
        var tolerance = getConfigValue('toleranciaRelogioMinutos', 5);
        if (!date) {
            return false;
        }
        ageMinutes = (new Date().getTime() - date.getTime()) / 60000;
        return ageMinutes >= -tolerance && ageMinutes <= maxAgeMinutes;
    }

    function isZeroValue(value) {
        var numberValue;
        if (value === undefined || value === null || value === '') {
            return false;
        }
        numberValue = parseFloat(String(value).replace(',', '.'));
        return !isNaN(numberValue) && numberValue === 0;
    }

    function parseDataset(item, tipoPermitido) {
        var result = [];
        var maxIndicadores = getConfigValue('maxIndicadores', 9);
        var i;
        var prefix;
        var quote;
        var name;
        var rawValue;
        var rawBuyValue;
        var variation;
        var updateTime;
        var xmlUpdateTime = getField(item, 'DT_UPDATE');

        for (i = 1; i <= maxIndicadores; i++) {
            prefix = 'M' + i + '_';
            quote = getField(item, prefix + 'QUOTE');
            name = getField(item, prefix + 'NOME');
            rawValue = getField(item, prefix + 'VALOR');
            rawBuyValue = getField(item, prefix + 'VALOR_COMPRA');
            variation = getField(item, prefix + 'VAR');
            updateTime = getField(item, prefix + 'ATUALIZA');

            if (!quote && !name && !rawValue && !variation) {
                continue;
            }
            if (!tipoAllowed(quote, tipoPermitido)) {
                continue;
            }
            if (quote && !quoteAllowed(quote)) {
                continue;
            }
            if (!isFreshTimestamp(updateTime, getConfigValue('maxIdadeCotacaoMinutos', 180))) {
                continue;
            }
            if (!isFreshTimestamp(xmlUpdateTime, getConfigValue('maxIdadeXmlMinutos', 360))) {
                continue;
            }
            if (isZeroValue(rawValue) || isZeroValue(rawBuyValue)) {
                continue;
            }

            result[result.length] = {
                quote: quote,
                name: getShortName(quote, name),
                value: rawValue || rawBuyValue,
                variation: variation,
                updateTime: updateTime
            };
        }

        return result;
    }

    function collectFinanceItems(loader) {
        var datasetsConfig = getConfigValue('datasets', []);
        var items = [];
        var seen = {};
        var i;
        var parsed;
        var dataset;
        var datasetConfig;
        var j;
        var key;

        for (i = 0; i < datasetsConfig.length; i++) {
            datasetConfig = datasetsConfig[i];
            dataset = getDataset(loader, datasetConfig.nome);
            if (!dataset) {
                continue;
            }
            parsed = parseDataset(dataset, datasetConfig.tipoPermitido);
            for (j = 0; j < parsed.length; j++) {
                key = parsed[j].quote || parsed[j].name;
                if (key && seen[key]) {
                    continue;
                }
                if (key) {
                    seen[key] = true;
                }
                items[items.length] = parsed[j];
            }
        }

        return items;
    }

    function appendText(parent, className, text) {
        var span = document.createElement('span');
        span.className = className;
        span.appendChild(document.createTextNode(text || ''));
        parent.appendChild(span);
    }

    function renderMessage() {
        var container = document.createElement('div');
        container.className = 'message-text';
        container.appendChild(document.createTextNode(getConfigValue('fraseFixa', '')));
        return container;
    }

    function renderFinanceBar(items) {
        var container = document.createElement('div');
        var i;
        var item;
        var variationText;
        var entry;
        var valuesRow;
        container.className = 'finance-bar';
        if (!items || !items.length) {
            return renderMessage();
        }
        for (i = 0; i < items.length; i++) {
            item = items[i];
            variationText = formatVariation(item.variation);
            entry = document.createElement('div');
            entry.className = 'finance-entry';
            if (item.name) {
                appendText(entry, 'finance-name', item.name);
            }
            valuesRow = document.createElement('div');
            valuesRow.className = 'finance-values';
            if (item.value) {
                appendText(valuesRow, 'finance-value', formatValue(item.value));
            }
            if (variationText) {
                appendText(valuesRow, getVariationClass(item.variation).replace('quote-var', 'finance-var'), variationText);
            }
            entry.appendChild(valuesRow);
            container.appendChild(entry);
        }
        return container;
    }

    function buildSlideItems(financeItems) {
        var slides = [];
        if (!financeItems || !financeItems.length) {
            slides[slides.length] = { type: 'message' };
            return slides;
        }
        slides[slides.length] = { type: 'finance', data: financeItems };
        slides[slides.length] = { type: 'message' };
        return slides;
    }

    function markLoaded() {
        if (state.loaded) {
            return;
        }
        state.loaded = true;
        if (state.loader && state.loader.loaded) {
            state.loader.loaded();
        }
    }

    function finishNow() {
        if (state.finished) {
            return;
        }
        state.finished = true;
        markLoaded();
        if (state.slideTimer) {
            clearTimeout(state.slideTimer);
        }
        if (state.finishTimer) {
            clearTimeout(state.finishTimer);
        }
        if (state.watchdogTimer) {
            clearTimeout(state.watchdogTimer);
        }
        if (state.loader && state.loader.finished) {
            state.loader.finished();
        }
    }

    function renderSlide(index) {
        var stage = document.getElementById('ticker-content');
        var slide;
        var node;
        if (!stage || !state.items.length) {
            return;
        }
        slide = state.items[index];
        stage.className = 'ticker-content';

        setTimeout(function () {
            stage.innerHTML = '';
            if (slide.type === 'finance') {
                node = renderFinanceBar(slide.data);
            } else {
                node = renderMessage();
            }
            stage.appendChild(node);
            stage.className = 'ticker-content is-visible';
            markLoaded();
        }, getConfigValue('fadeDuracao', 350));
    }

    function scheduleNextSlide() {
        if (state.finished || !state.items.length) {
            return;
        }
        state.currentIndex += 1;
        if (state.currentIndex >= state.items.length) {
            state.currentIndex = 0;
        }
        renderSlide(state.currentIndex);
        state.slideTimer = setTimeout(scheduleNextSlide, getConfigValue('itemDuracao', 5500));
    }

    function startPresentation(financeItems) {
        var totalTime = getConfigValue('tempoTotalExibicao', 60000);
        setText('phone-text', getConfigValue('telefone', ''));
        state.items = buildSlideItems(financeItems);
        scheduleNextSlide();
        if (totalTime > 0) {
            state.finishTimer = setTimeout(finishNow, totalTime);
        }
    }

    function startLoader() {
        ebhtml.create2({}, function (loader) {
            var datasets = getConfigValue('datasets', []);
            var i;
            state.loader = loader;
            loader.autoloaded = false;
            loader.nodataiserror = false;

            for (i = 0; i < datasets.length; i++) {
                loader.addData(datasets[i].nome, false);
            }

            if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA && MOCK_DATA.enabled) {
                startPresentation(collectFinanceItems(loader));
                return;
            }

            state.watchdogTimer = setTimeout(function () {
                startPresentation([]);
                finishNow();
            }, getConfigValue('watchdogTempo', 70000));

            loader.load(function () {
                try {
                    if (state.watchdogTimer) {
                        clearTimeout(state.watchdogTimer);
                        state.watchdogTimer = null;
                    }
                    startPresentation(collectFinanceItems(loader));
                } catch (error) {
                    startPresentation([]);
                    finishNow();
                }
            }, function () {
                startPresentation([]);
                finishNow();
            });
        });
    }

    window.onload = function () {
        setText('phone-text', getConfigValue('telefone', ''));
        if (typeof ebhtml === 'undefined' || !ebhtml.create2) {
            startPresentation([]);
            return;
        }
        startLoader();
    };
}());