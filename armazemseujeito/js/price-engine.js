/**
 * @file price-engine.js
 * Responsável por toda a lógica de preço do template:
 *   - Leitura segura de campos do dataSource EBHTML
 *   - Formatação numérica brasileira (separadores milhar/decimal)
 *   - Resolução da condição de preço (REGULAR, DEPOR, LEVE3PAGUE2...)
 *   - Clonagem e preenchimento do template HTML correto
 *   - Ajuste proporcional de fontes baseado em proporção áurea (phi ≈ 1.618)
 * @namespace ArmazemSeuJeitoPriceEngine
 */
(function() {
    /**
     * Lê com segurança o valor de um campo em um dataSource EBHTML.
     * Retorna string vazia em caso de falha ou campo ausente.
     * @param {Object} item - dataSource retornado por loader.data() ou MOCK_DATA.wrap().
     * @param {string} key  - Nome do campo (ex: 'TITULO', 'PRICE').
     * @returns {string} Valor do campo ou ''.
     */
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

    /**
     * Converte qualquer valor em string no formato "0,00" (dois decimais).
     * Valores não numéricos são tratados como zero.
     * @param {*} value - Valor bruto (número ou string).
     * @returns {string} Ex: '5,99', '1234,00'.
     */
    function toNumber(value) {
        var num = parseFloat(value);
        if (isNaN(num)) {
            num = 0;
        }
        return num.toFixed(2).replace('.', ',');
    }

    /**
     * Formata um valor monetário separando inteiro e decimal, com separador de milhar.
     * @param {string|number} price - Valor bruto (ex: '1234.5', '1234,50', 1234.5).
     * @returns {{integer: string, decimal: string, full: string}}
     *   integer: parte inteira com ponto de milhar (ex: '1.234')
     *   decimal: centavos com 2 dígitos (ex: '50')
     *   full:    string completa (ex: '1.234,50')
     */
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

    /**
     * Reduz iterativamente o font-size de descriptionDiv até ele caber em containerDiv.
     * Seguro para WebKit legado; não usa ResizeObserver nem Promises (ES5).
     * @param {HTMLElement} descriptionDiv   - Elemento cujo texto deve ser ajustado.
     * @param {HTMLElement} containerDiv     - Contêiner com altura máxima restritiva.
     * @param {number}      [minFontSize=12] - Tamanho mínimo permitido em px.
     */
    function fitDescriptionFont(descriptionDiv, containerDiv, minFontSize) {
        var minSize = minFontSize || 12;
        var fontSize = parseInt(window.getComputedStyle(descriptionDiv).fontSize, 10);
        var maxHeight = parseInt(window.getComputedStyle(containerDiv).maxHeight, 10) || containerDiv.offsetHeight;

        while ((containerDiv.scrollHeight > maxHeight || descriptionDiv.scrollHeight > maxHeight) && fontSize > minSize) {
            fontSize -= 1;
            descriptionDiv.style.fontSize = fontSize + 'px';
        }
    }

    /**
     * Normaliza a string de condição vinda do CMS através da tabela de aliases do config.
     * Converte para maiúsculas e faz trim antes da busca.
     * @param {Object} cfg    - TEMPLATE_CONFIG.
     * @param {string} texto3 - Valor bruto do campo TEXTO3.
     * @returns {string} Condição normalizada (ex: 'DEPOR', 'LEVE3PAGUE2').
     */
    function normalizeCondition(cfg, texto3) {
        var raw = String(texto3 || '').toUpperCase().trim();
        var aliases = cfg.priceConditionAliases || {};
        return aliases[raw] || raw;
    }

    /**
     * Determina a condição de preço a usar para um item do dataset.
     * Fluxo de resolução (ordem de prioridade):
     *   1. Alias direto de TEXTO3 normalizado (se mapeado em cfg.priceTemplates)
     *   2. Regras em cfg.priceConditionRules: whenHasPrice2, whenTextContains, fallback
     * @param {Object} cfg        - TEMPLATE_CONFIG.
     * @param {Object} dataSource - dataSource EBHTML ou mock.
     * @returns {string} Chave de condição (ex: 'REGULAR', 'DEPOR', 'CLUBE').
     */
    function resolvePriceCondition(cfg, dataSource) {
        var fieldMap = cfg.fieldMap || {};
        var texto3Fields = (fieldMap.texto3 && fieldMap.texto3.length) ? fieldMap.texto3 : ['TEXTO3'];
        var price2Fields = (fieldMap.price2 && fieldMap.price2.length) ? fieldMap.price2 : ['PRICE2'];

        var rawText = '';
        var i;
        for (i = 0; i < texto3Fields.length; i++) {
            rawText = getField(dataSource, texto3Fields[i]);
            if (rawText !== '') { break; }
        }

        var price2 = '';
        for (i = 0; i < price2Fields.length; i++) {
            price2 = getField(dataSource, price2Fields[i]);
            if (price2 !== '') { break; }
        }

        var normalized = normalizeCondition(cfg, rawText);
        var rules = cfg.priceConditionRules || [];

        if (normalized && cfg.priceTemplates[normalized]) {
            return normalized;
        }

        for (i = 0; i < rules.length; i++) {
            var rule = rules[i];
            if (!rule) { continue; }

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

    /**
     * Ajusta os tamanhos de fonte das partes do preço usando proporção áurea.
     * Aplica escala por perfil (cfg.layout.priceScale) e reduz iterativamente
     * até que o bloco caiba horizontalmente (máx 60 iterações por linha).
     * Proporções: symbol ≈ 0.62, decimal ≈ 0.39, unit ≈ 0.24 do inteiro (phi-derived).
     * @param {Object}      cfg       - TEMPLATE_CONFIG.
     * @param {string}      profile   - Perfil atual de layout.
     * @param {HTMLElement} container - Elemento #price_display.
     */
    function fitPriceLayout(cfg, profile, container) {
        if (!container) {
            return;
        }

        var rows = container.querySelectorAll('[data-price-layout]');
        var i = 0;

        function findClosestPriceRow(el, fallback) {
            var cursor = el;
            while (cursor && cursor !== fallback) {
                if (cursor.className && String(cursor.className).indexOf('price-row') !== -1) {
                    return cursor;
                }
                cursor = cursor.parentNode;
            }
            return fallback;
        }

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
            var integerCandidates = row.querySelectorAll('[data-price-part="integer"], [data-price-part="price2-integer"]');
            var c;

            for (c = 0; c < integerCandidates.length; c++) {
                var integerEl = integerCandidates[c];
                var part = integerEl.getAttribute('data-price-part');
                var decimalPart = (part === 'price2-integer') ? 'price2-decimal' : 'decimal';
                var line = findClosestPriceRow(integerEl, row);
                var symbolEl = line.querySelector('[data-price-part="symbol"]');
                var decimalEl = line.querySelector('[data-price-part="' + decimalPart + '"]');
                var unitEl = line.querySelector('[data-price-part="unit"]');

                integerEl.style.fontSize = '';
                if (symbolEl) { symbolEl.style.fontSize = ''; }
                if (decimalEl) { decimalEl.style.fontSize = ''; }
                if (unitEl) { unitEl.style.fontSize = ''; }

                var integerSize = parseFloat(window.getComputedStyle(integerEl).fontSize);
                var digits = String(integerEl.innerHTML || '').replace(/\D/g, '').length;
                var minInteger = (profile === 'portrait') ? 20 : 24;
                var guard = 0;
                var scale = getProfileValue(cfg.layout.priceScale, 1);
                var ratios = cfg.layout.priceRatios || { symbol: 0.50, decimal: 0.50, unit: 0.50 };

                // Escala preventiva por número de dígitos: evita que o loop de shrink
                // precise de muitas iterações para valores longos (milhar, centena etc).
                // digits: 1=unid, 2=dezena, 3=centena, 4=milhar, 5=dezMilhar, 6+=centMilhar
                var digitScales = [1.00, 1.00, 1.00, 0.82, 0.64, 0.52, 0.44];
                var digitScale = digitScales[Math.min(digits, digitScales.length - 1)] || 0.40;

                integerSize = integerSize * scale * digitScale;
                integerEl.style.fontSize = Math.round(integerSize) + 'px';
                if (symbolEl) { symbolEl.style.fontSize = Math.round(integerSize * ratios.symbol) + 'px'; }
                if (decimalEl) { decimalEl.style.fontSize = Math.round(integerSize * ratios.decimal) + 'px'; }
                if (unitEl) { unitEl.style.fontSize = Math.round(integerSize * ratios.unit) + 'px'; }

                while (line.scrollWidth > line.clientWidth && integerSize > minInteger && guard < 80) {
                    integerSize -= 1;
                    integerEl.style.fontSize = integerSize + 'px';

                    if (symbolEl) { symbolEl.style.fontSize = Math.round(integerSize * ratios.symbol) + 'px'; }
                    if (decimalEl) { decimalEl.style.fontSize = Math.round(integerSize * ratios.decimal) + 'px'; }
                    if (unitEl) { unitEl.style.fontSize = Math.round(integerSize * ratios.unit) + 'px'; }

                    guard += 1;
                }

                // Stack ocupa altura exata do inteiro.
                // Com unidade: decimal no topo, unidade na base (space-between).
                // Sem unidade: decimal no topo (flex-start).
                var stackEl = line.querySelector('.price-stack');
                if (stackEl) {
                    // stackEl.style.height = Math.round(integerSize) + 'px';
                    var unitContent = unitEl ? String(unitEl.innerHTML || '').trim() : '';
                    stackEl.style.justifyContent = unitContent !== '' ? '' : 'flex-start';
                }

                // Unidade = 40% do tamanho dos centavos (ratio fixo, sem clamp por largura).
            }
        }

        // Clamp vertical: reduz todos os inteiros proporcionalmente até o
        // price-root caber dentro do container (price_display).
        var priceRoot = container.querySelector('[data-price-layout]');
        if (priceRoot && container.clientHeight > 0) {
            var vertGuard = 0;
            while (priceRoot.offsetHeight > container.clientHeight && vertGuard < 80) {
                var allIntegers = priceRoot.querySelectorAll('[data-price-part="integer"], [data-price-part="price2-integer"]');
                var ai;
                var didShrink = false;
                for (ai = 0; ai < allIntegers.length; ai++) {
                    var aIntEl = allIntegers[ai];
                    var aSize = parseFloat(aIntEl.style.fontSize) || parseFloat(window.getComputedStyle(aIntEl).fontSize);
                    if (aSize <= 18) { continue; }
                    var aNewSize = aSize - 1;
                    aIntEl.style.fontSize = aNewSize + 'px';
                    var aPart = aIntEl.getAttribute('data-price-part');
                    var aDecPart = (aPart === 'price2-integer') ? 'price2-decimal' : 'decimal';
                    var aLine = findClosestPriceRow(aIntEl, priceRoot);
                    var aSym = aLine.querySelector('[data-price-part="symbol"]');
                    var aDec = aLine.querySelector('[data-price-part="' + aDecPart + '"]');
                    var aUni = aLine.querySelector('[data-price-part="unit"]');
                    var aRatios = cfg.layout.priceRatios || { symbol: 0.50, decimal: 0.50, unit: 0.50 };
                    if (aSym) { aSym.style.fontSize = Math.round(aNewSize * aRatios.symbol) + 'px'; }
                    if (aDec) { aDec.style.fontSize = Math.round(aNewSize * aRatios.decimal) + 'px'; }
                    if (aUni && String(aUni.innerHTML || '').trim() !== '') {
                        aUni.style.fontSize = Math.round(aNewSize * aRatios.unit) + 'px';
                    }
                    var aStack = aLine.querySelector('.price-stack');
                    if (aStack) { aStack.style.height = Math.round(aNewSize) + 'px'; }
                    didShrink = true;
                }
                if (!didShrink) { break; }
                vertGuard += 1;
            }
        }
    }

    /**
     * Seleciona, clona e preenche o template HTML de preço correto para o item.
     * Sequência de operações:
     *   1. Resolve condição de preço via resolvePriceCondition()
     *   2. Clona o <template id="template_*"> correspondente
     *   3. Preenche slots: symbol, integer, decimal, unit, old-price, data-price-label
     *   4. Aplica classes de cor e animação Tailwind ao root do clone
     *   5. Chama fitPriceLayout() para ajuste proporcional de fontes
     * @param {Object} cfg        - TEMPLATE_CONFIG.
     * @param {Object} dataSource - dataSource EBHTML ou mock.
     * @param {string} profile    - Perfil de layout atual.
     */
    function setupPriceTemplate(cfg, dataSource, profile) {
        var fieldMap = cfg.fieldMap || {};

        function getFirstField(fields) {
            var i, val;
            for (i = 0; i < fields.length; i++) {
                val = getField(dataSource, fields[i]);
                if (val !== '') { return val; }
            }
            return '';
        }

        var priceFields  = (fieldMap.price  && fieldMap.price.length)  ? fieldMap.price  : ['PRICE',  'PRECO'];
        var price2Fields = (fieldMap.price2 && fieldMap.price2.length) ? fieldMap.price2 : ['PRICE2', 'PRECO2'];
        var price3Fields = (fieldMap.price3 && fieldMap.price3.length) ? fieldMap.price3 : ['PRICE3'];
        var price4Fields = (fieldMap.price4 && fieldMap.price4.length) ? fieldMap.price4 : ['PRICE4'];
        var texto4Fields = (fieldMap.texto4 && fieldMap.texto4.length) ? fieldMap.texto4 : ['TEXTO4'];
        var texto8Fields = (fieldMap.texto8 && fieldMap.texto8.length) ? fieldMap.texto8 : ['TEXTO8'];
        var texto9Fields = (fieldMap.texto9 && fieldMap.texto9.length) ? fieldMap.texto9 : ['TEXTO9'];

        var condition = resolvePriceCondition(cfg, dataSource);
        var price   = getFirstField(priceFields);
        var price2  = getFirstField(price2Fields);
        /*eslint-disable no-unused-vars*/
        var price3  = getFirstField(price3Fields); // preço por peso (Regular/Por)
        var price4  = getFirstField(price4Fields); // preço por peso (De/Fidelidade)
        /*eslint-enable no-unused-vars*/
        var unidade = getFirstField(texto4Fields);
        var qty     = getFirstField(texto8Fields);
        var qty2    = getFirstField(texto9Fields); // "pague" em LEVE-X-PAGUE-Y

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

        // Slots qty: TEXTO8 (qtd atacarejo / nº parcelas)
        var qtyEls = clone.querySelectorAll('[data-price-part="qty"]');
        var qi;
        for (qi = 0; qi < qtyEls.length; qi++) {
            qtyEls[qi].innerHTML = qty;
        }

        // Slots price2-integer / price2-decimal: para templates que exibem PRICE2 como hero
        if (price2 !== '') {
            var price2Formatted = formatPrice(price2);
            var p2IntEls = clone.querySelectorAll('[data-price-part="price2-integer"]');
            var p2DecEls = clone.querySelectorAll('[data-price-part="price2-decimal"]');
            var pi2, pd2;
            for (pi2 = 0; pi2 < p2IntEls.length; pi2++) {
                p2IntEls[pi2].innerHTML = price2Formatted.integer;
            }
            for (pd2 = 0; pd2 < p2DecEls.length; pd2++) {
                var p2Span = p2DecEls[pd2].querySelector('span:last-child');
                if (p2Span) {
                    p2Span.innerHTML = price2Formatted.decimal;
                }
            }
        }

        // Slots qty2: TEXTO9 (pague em LEVE-X-PAGUE-Y)
        var qty2Els = clone.querySelectorAll('[data-price-part="qty2"]');
        var q2i;
        for (q2i = 0; q2i < qty2Els.length; q2i++) {
            qty2Els[q2i].innerHTML = qty2;
        }

        // Slot price-original: exibe PRICE (base) — usado no "DE" do template_fidelidade
        var priceOrigEl = clone.querySelector('[data-price-part="price-original"]');
        if (priceOrigEl && price !== '') {
            var priceOrigFormatted = formatPrice(price);
            var poSpan = priceOrigEl.querySelector('span:last-child');
            if (poSpan) {
                poSpan.innerHTML = priceOrigFormatted.full;
            }
        }

        container.appendChild(clone);
        fitPriceLayout(cfg, profile, container);
    }

    /** API pública do price engine. Consumida por runtime-engine.js. */
    window.ArmazemSeuJeitoPriceEngine = {
        getField: getField,
        fitDescriptionFont: fitDescriptionFont,
        setupPriceTemplate: setupPriceTemplate,
        resolvePriceCondition: resolvePriceCondition
    };
})();
