/**
 * armazemseujeito - runtime ES5 (Android 7+)
 */
(function() {
    var APP = {
        config: {
            duration: 15000,
            dataset: 'D_MENUBOARD_PRICES'
        }
    };

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
        var formatted = toNumber(price);
        var parts = formatted.split(',');
        return {
            integerPart: parts[0],
            decimalPart: parts[1] ? ',' + parts[1] : ',00'
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

    function setupPriceTemplate(dataSource) {
        var texto3 = getField(dataSource, 'TEXTO3').toUpperCase();
        var price = getField(dataSource, 'PRICE');
        var price2 = getField(dataSource, 'PRICE2');
        var unidade = getField(dataSource, 'TEXTO4');

        var useDepor = price2 !== '' && texto3 !== 'REGULAR';
        var templateId = useDepor ? 'template_depor' : 'template_regular';
        var template = document.getElementById(templateId);
        var container = document.getElementById('price_display');

        if (!template || !container || !template.content) {
            return;
        }

        container.innerHTML = '';
        var clone = template.content.cloneNode(true);

        if (useDepor) {
            var oldPrice = clone.querySelector('#price2');
            if (oldPrice) {
                oldPrice.innerHTML = 'DE R$ ' + toNumber(price2);
            }
        }

        var priceFormatted = formatPrice(price);
        var priceEl = clone.querySelector('#price');
        var centsEl = clone.querySelector('#cents');
        var unitEl = clone.querySelector('#texto4');

        if (priceEl) {
            priceEl.innerHTML = priceFormatted.integerPart;
        }
        if (centsEl) {
            centsEl.innerHTML = priceFormatted.decimalPart;
        }
        if (unitEl) {
            unitEl.innerHTML = unidade;
        }

        container.appendChild(clone);
    }

    function revealLayout() {
        var body = document.body;
        var content = document.getElementById('fullContent');
        var priceDisplay = document.getElementById('price_display');
        var imgContainer = document.getElementById('img_container');
        var titleContainer = document.getElementById('title_container');

        body.classList.remove('opacity-0');
        body.classList.add('opacity-100');

        if (content) {
            content.classList.remove('opacity-0');
            content.classList.add('opacity-100');
        }

        if (priceDisplay) {
            priceDisplay.classList.remove('scale-[300%]');
            priceDisplay.classList.add('scale-[100%]');
        }

        if (imgContainer) {
            imgContainer.classList.remove('translate-x-full');
        }

        if (titleContainer) {
            titleContainer.classList.remove('-translate-x-full');
            titleContainer.classList.remove('opacity-0');
        }

        var video = document.getElementById('video');
        if (video) {
            try {
                video.play();
            } catch (e) {
                console.log('[armazemseujeito] autoplay bloqueado');
            }
        }
    }

    function applyDataToView(dataSource, loader) {
        var image = document.getElementById('product_img');
        var title = document.getElementById('title');
        var titleContainer = document.getElementById('title_container');
        var legalText = document.getElementById('legal_text');

        if (!image || !title || !titleContainer) {
            loader.finished();
            return;
        }

        title.innerHTML = getField(dataSource, 'TITULO').toUpperCase();
        setupPriceTemplate(dataSource);
        fitDescriptionFont(title, titleContainer, 12);

        if (legalText) {
            legalText.innerHTML = getField(dataSource, 'TEXTO5');
        }

        var imageUrl = getField(dataSource, 'FOTO');
        if (imageUrl === '') {
            loader.finished();
            return;
        }

        image.onload = function() {
            loader.loaded();
            revealLayout();

            setTimeout(function() {
                loader.finished();
            }, APP.config.duration);
        };

        image.onerror = function() {
            loader.finished();
        };

        image.src = imageUrl;
    }

    function getMockSource() {
        if (typeof MOCK_DATA === 'undefined' || !MOCK_DATA.enabled || typeof MOCK_DATA.getData !== 'function') {
            return null;
        }
        return MOCK_DATA.getData();
    }

    function getMockLoader() {
        return {
            loaded: function() {
                console.log('[Mock] Carregado');
            },
            finished: function() {
                console.log('[Mock] Finalizado');
            }
        };
    }

    function startWithLoader(loader) {
        var dataSource = loader.data(APP.config.dataset);
        if (!dataSource) {
            loader.finished();
            return;
        }
        applyDataToView(dataSource, loader);
    }

    function startRuntime() {
        var mockSource = getMockSource();
        if (mockSource) {
            applyDataToView(mockSource, getMockLoader());
            return;
        }

        ebhtml.create2({}, function(loader) {
            loader.addData(APP.config.dataset, false);
            loader.nodataiserror = false;
            loader.autoloaded = false;
            loader.load(function() {
                startWithLoader(loader);
            });
        });
    }

    window.ArmazemSeuJeitoApp = {
        startRuntime: startRuntime,
        applyDataToView: applyDataToView,
        getMockLoader: getMockLoader,
        getField: getField
    };

    window.playerView = function() {
        window.onload = function() {
            startRuntime();
        };
    };
})();