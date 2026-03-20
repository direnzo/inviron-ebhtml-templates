/**
 * price-engine.js - formatacao de preco e selecao de templates
 */
(function() {
    function getField(item, key) {
        try {
            if (item && typeof item.value === 'function') {
                var field = item.value(key);
                if (field && field.value !== undefined && field.value !== null) {
                    return String(field.value);
                }
            }
        } catch (e) {
            return '';
        }
        return '';
    }

    function toNumber(value) {
        var num = parseFloat(value);
        if (isNaN(num)) {
            num = 0;
        }
        return num.toFixed(2).replace('.', ',');
    }

    function formatPrice(price) {
        var cleaned = toNumber(price).replace(/[^\d,]/g, '');
        var parts = cleaned.split(',');
        var integerStr = parts[0] || '0';
        var decimalStr = parts[1] || '00';
        var withSeparator = integerStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        while (decimalStr.length < 2) {
            decimalStr = decimalStr + '0';
        }
        decimalStr = decimalStr.substring(0, 2);

        return {
            integer: withSeparator,
            decimal: decimalStr,
            full: withSeparator + ',' + decimalStr
        };
    }

    function fitDescriptionFont(descriptionDiv, containerDiv, minFontSize) {
        var minSize = minFontSize || 12;
        var fontSize = parseInt(window.getComputedStyle(descriptionDiv).fontSize, 10);
        var maxHeight = parseInt(window.getComputedStyle(containerDiv).maxHeight, 10) || containerDiv.offsetHeight;

        while ((containerDiv.scrollHeight > maxHeight || descriptionDiv.scrollHeight > maxHeight) && fontSize > minSize) {
            fontSize -= 1;
            descriptionDiv.style.fontSize = fontSize + 'px';
        }
    }

    function normalizeCondition(cfg, texto3) {
        var raw = String(texto3 || '').toUpperCase().trim();
        var aliases = cfg.priceConditionAliases || {};
        return aliases[raw] || raw;
    }

    function resolvePriceCondition(cfg, dataSource) {
        var rawText = getField(dataSource, 'TEXTO3');
        var normalized = normalizeCondition(cfg, rawText);
        var price2 = getField(dataSource, 'PRICE2');
        var rules = cfg.priceConditionRules || [];
        var i = 0;

        if (normalized && cfg.priceTemplates[normalized]) {
            return normalized;
        }

        for (i = 0; i < rules.length; i++) {
            var rule = rules[i];
            if (!rule) {
                continue;
            }

            if (rule.whenHasPrice2 === true && price2 !== '') {
                return rule.condition;
            }

            if (rule.whenTextContains) {
                var regex = new RegExp(rule.whenTextContains, 'i');
                if (regex.test(rawText || '')) {
                    return rule.condition;
                }
            }

            if (rule.fallback) {
                return rule.condition;
            }
        }

        return 'REGULAR';
    }

    function fitPriceLayout(cfg, profile, container) {
        if (!container) {
            return;
        }

        var rows = container.querySelectorAll('[data-price-layout]');
        var i = 0;

        function getProfileValue(map, fallback) {
            if (!map) {
                return fallback;
            }
            if (map[profile] !== undefined && map[profile] !== null) {
                return map[profile];
            }
            if (map.default !== undefined && map.default !== null) {
                return map.default;
            }
            return fallback;
        }

        for (i = 0; i < rows.length; i++) {
            var row = rows[i];
            var integerEl = row.querySelector('[data-price-part="integer"]');
            var symbolEl = row.querySelector('[data-price-part="symbol"]');
            var decimalEl = row.querySelector('[data-price-part="decimal"]');
            var unitEl = row.querySelector('[data-price-part="unit"]');

            if (!integerEl) {
                continue;
            }

            integerEl.style.fontSize = '';
            if (symbolEl) { symbolEl.style.fontSize = ''; }
            if (decimalEl) { decimalEl.style.fontSize = ''; }
            if (unitEl) { unitEl.style.fontSize = ''; }

            var integerSize = parseFloat(window.getComputedStyle(integerEl).fontSize);
            var minInteger = 34;
            var guard = 0;
            var scale = getProfileValue(cfg.layout.priceScale, 1);
            var ratios = cfg.layout.priceRatios || { symbol: 0.62, decimal: 0.39, unit: 0.24 };

            integerSize = integerSize * scale;
            integerEl.style.fontSize = Math.round(integerSize) + 'px';
            if (symbolEl) { symbolEl.style.fontSize = Math.round(integerSize * ratios.symbol) + 'px'; }
            if (decimalEl) { decimalEl.style.fontSize = Math.round(integerSize * ratios.decimal) + 'px'; }
            if (unitEl) { unitEl.style.fontSize = Math.round(integerSize * ratios.unit) + 'px'; }

            while (row.scrollWidth > row.clientWidth && integerSize > minInteger && guard < 60) {
                integerSize -= 1;
                integerEl.style.fontSize = integerSize + 'px';

                if (symbolEl) { symbolEl.style.fontSize = Math.round(integerSize * ratios.symbol) + 'px'; }
                if (decimalEl) { decimalEl.style.fontSize = Math.round(integerSize * ratios.decimal) + 'px'; }
                if (unitEl) { unitEl.style.fontSize = Math.round(integerSize * ratios.unit) + 'px'; }

                guard += 1;
            }
        }
    }

    function setupPriceTemplate(cfg, dataSource, profile) {
        var condition = resolvePriceCondition(cfg, dataSource);
        var price = getField(dataSource, 'PRICE');
        var price2 = getField(dataSource, 'PRICE2');
        var unidade = getField(dataSource, 'TEXTO4');

        var templateId = (cfg.priceTemplates[condition] || cfg.priceTemplates['_default']);
        var animClass = (cfg.priceAnimations[condition] || cfg.priceAnimations['_default']);
        var colorClass = (cfg.priceColors[condition] || cfg.priceColors['_default']);
        var labelText = ((cfg.priceConditionLabels && cfg.priceConditionLabels[condition]) ||
            (cfg.priceConditionLabels && cfg.priceConditionLabels['_default']) || '');

        var template = document.getElementById(templateId);
        if (!template) {
            template = document.getElementById('template_regular');
        }

        var container = document.getElementById('price_display');
        if (!template || !container || !template.content) {
            return;
        }

        container.innerHTML = '';
        var clone = template.content.cloneNode(true);

        var priceRoot = clone.querySelector('[data-price-layout]');
        if (priceRoot) {
            priceRoot.classList.add(animClass);
            priceRoot.classList.add(colorClass);
        }

        var symbolEl = clone.querySelector('[data-price-part="symbol"]');
        if (symbolEl) {
            symbolEl.innerHTML = cfg.currencySymbol;
        }

        var labelEl = clone.querySelector('[data-price-label]');
        if (labelEl && labelText !== '') {
            labelEl.innerHTML = labelText;
        }

        var useDepor = (price2 !== '' && clone.querySelector('[data-price-part="old-price"]') !== null);
        if (useDepor) {
            var oldPriceEl = clone.querySelector('[data-price-part="old-price"]');
            if (oldPriceEl) {
                var oldPriceFormatted = formatPrice(price2);
                var oldPriceSpan = oldPriceEl.querySelector('span:last-child');
                if (oldPriceSpan) {
                    oldPriceSpan.innerHTML = oldPriceFormatted.full;
                }
            }
        }

        var priceFormatted = formatPrice(price);
        var integerEl = clone.querySelector('[data-price-part="integer"]');
        var decimalEl = clone.querySelector('[data-price-part="decimal"]');
        var unitEl = clone.querySelector('[data-price-part="unit"]');

        if (integerEl) {
            integerEl.innerHTML = priceFormatted.integer;
        }
        if (decimalEl) {
            var decimalSpan = decimalEl.querySelector('span:last-child');
            if (decimalSpan) {
                decimalSpan.innerHTML = priceFormatted.decimal;
            }
        }
        if (unitEl && unidade) {
            unitEl.innerHTML = unidade.toUpperCase();
        }

        container.appendChild(clone);
        fitPriceLayout(cfg, profile, container);
    }

    window.ArmazemSeuJeitoPriceEngine = {
        getField: getField,
        fitDescriptionFont: fitDescriptionFont,
        setupPriceTemplate: setupPriceTemplate,
        resolvePriceCondition: resolvePriceCondition
    };
})();
