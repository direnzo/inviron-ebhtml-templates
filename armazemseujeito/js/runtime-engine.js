/**
 * runtime-engine.js - orquestracao do template
 */
(function() {
    var CFG = (typeof TEMPLATE_CONFIG !== 'undefined') ? TEMPLATE_CONFIG : {
        timing: { duration: 15000, revealDelay: 100 },
        dataset: 'D_MENUBOARD_PRICES',
        titleFit: { minFontSize: 10, maxLines: 3 },
        defaultLegalText: '',
        layout: {
            safeAreaTop: { default: '34vh', portrait: '34vh', landscape: '30vh', ultrawide: '24vh' },
            sideBySide: { default: false, portrait: false, landscape: true, ultrawide: true },
            blocks: {
                default: { image: 45, title: 30, price: 52, legal: 18 },
                portrait: { image: 45, title: 30, price: 52, legal: 18 },
                landscape: { image: 52, title: 31, price: 53, legal: 16 },
                ultrawide: { image: 50, title: 30, price: 54, legal: 16 }
            },
            titleAlign: { default: 'center', portrait: 'center', landscape: 'center', ultrawide: 'center' },
            legal: {
                opacity: { default: 0.7, portrait: 0.7, landscape: 0.5, ultrawide: 0.45 },
                fontSize: { default: '36%', portrait: '34%', landscape: '28%', ultrawide: '24%' }
            },
            priceScale: { default: 1.00, portrait: 1.00, landscape: 1.12, ultrawide: 1.18 },
            priceRatios: { symbol: 0.62, decimal: 0.39, unit: 0.24 }
        }
    };

    function getLayoutEngine() {
        return window.ArmazemSeuJeitoLayoutEngine;
    }

    function getPriceEngine() {
        return window.ArmazemSeuJeitoPriceEngine;
    }

    function applyLayoutConfig() {
        var layoutEngine = getLayoutEngine();
        if (!layoutEngine || typeof layoutEngine.applyLayoutConfig !== 'function') {
            return 'default';
        }
        return layoutEngine.applyLayoutConfig(CFG);
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
            priceDisplay.classList.remove('translate-y-full');
            priceDisplay.classList.add('translate-y-0');
        }

        if (imgContainer) {
            imgContainer.classList.remove('translate-x-full');
            imgContainer.classList.add('translate-x-0');
        }

        if (titleContainer) {
            titleContainer.classList.remove('-translate-x-full', 'opacity-0');
            titleContainer.classList.add('translate-x-0', 'opacity-100');
        }

        var video = document.getElementById('video');
        if (video) {
            try { video.play(); } catch (e) {}
        }
    }

    function applyDataToView(dataSource, loader) {
        var priceEngine = getPriceEngine();
        if (!priceEngine) {
            loader.finished();
            return;
        }

        var image = document.getElementById('product_img');
        var title = document.getElementById('title');
        var titleContainer = document.getElementById('title_container');
        var legalText = document.getElementById('legal_text');

        if (!image || !title || !titleContainer) {
            loader.finished();
            return;
        }

        var profile = applyLayoutConfig();

        title.innerHTML = priceEngine.getField(dataSource, 'TITULO').toUpperCase();
        priceEngine.setupPriceTemplate(CFG, dataSource, profile);
        priceEngine.fitDescriptionFont(title, titleContainer, CFG.titleFit.minFontSize);

        if (legalText) {
            var legal = priceEngine.getField(dataSource, 'TEXTO5');
            legalText.innerHTML = legal !== '' ? legal : (CFG.defaultLegalText || '');
        }

        var imageUrl = priceEngine.getField(dataSource, 'FOTO');
        if (imageUrl === '') {
            loader.finished();
            return;
        }

        image.style.display = 'block';

        image.onload = function() {
            image.style.display = 'block';
            loader.loaded();
            revealLayout();

            setTimeout(function() {
                loader.finished();
            }, CFG.timing.duration);
        };

        image.onerror = function() {
            console.warn('[armazemseujeito] Imagem nao carregou: ' + imageUrl);
            image.style.display = 'none';
            loader.loaded();
            revealLayout();
            setTimeout(function() {
                loader.finished();
            }, CFG.timing.duration);
        };

        image.src = imageUrl;
    }

    function getMockEngine() {
        return window.ArmazemSeuJeitoMockLoaderEngine;
    }

    function startWithLoader(loader) {
        var priceEngine = getPriceEngine();
        if (!priceEngine) {
            loader.finished();
            return;
        }

        var dataSource = loader.data(CFG.dataset);
        if (!dataSource) {
            loader.finished();
            return;
        }
        applyDataToView(dataSource, loader);
    }

    function startRuntime() {
        applyLayoutConfig();

        var mockEngine = getMockEngine();
        if (mockEngine && mockEngine.isEnabled && mockEngine.isEnabled()) {
            var mockSource = mockEngine.getMockData();
            var mockLoader = mockEngine.createMockLoader();
            if (mockSource) {
                applyDataToView(mockSource, mockLoader);
                return;
            }
        }

        ebhtml.create2({}, function(loader) {
            loader.addData(CFG.dataset, false);
            loader.nodataiserror = false;
            loader.autoloaded = false;
            loader.load(function() {
                startWithLoader(loader);
            });
        });
    }

    window.addEventListener('resize', function() {
        applyLayoutConfig();
    });

    window.ArmazemSeuJeitoEngine = {
        startRuntime: startRuntime,
        applyDataToView: applyDataToView,
        getField: function(item, key) {
            var priceEngine = getPriceEngine();
            if (!priceEngine) {
                return '';
            }
            return priceEngine.getField(item, key);
        },
        applyLayoutConfig: applyLayoutConfig
    };
})();
