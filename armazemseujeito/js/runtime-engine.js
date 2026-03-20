/**
 * @file runtime-engine.js
 * Orquestrador principal do template. Conecta layout-engine + price-engine
 * ao ciclo de vida do EBHTML (loader) e ao modo mock.
 *
 * Fluxo normal (player):
 *   startRuntime() → applyLayoutConfig() → EBHTML loader → applyDataToView()
 *                 → image.onload → loader.loaded() + revealLayout()
 *                 → setTimeout → loader.finished()
 *
 * Fluxo mock (MOCK_DATA.enabled = true):
 *   startRuntime() → MOCK_DATA.getData() → applyDataToView() → revealLayout()
 *
 * @namespace ArmazemSeuJeitoEngine
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

    /**
     * @returns {ArmazemSeuJeitoLayoutEngine|undefined}
     */
    function getLayoutEngine() {
        return window.ArmazemSeuJeitoLayoutEngine;
    }

    /**
     * @returns {ArmazemSeuJeitoPriceEngine|undefined}
     */
    function getPriceEngine() {
        return window.ArmazemSeuJeitoPriceEngine;
    }

    /**
     * Delega para ArmazemSeuJeitoLayoutEngine.applyLayoutConfig com o CFG atual.
     * @returns {string} Perfil aplicado ou 'default' se o engine não estiver disponível.
     */
    function applyLayoutConfig() {
        var layoutEngine = getLayoutEngine();
        if (!layoutEngine || typeof layoutEngine.applyLayoutConfig !== 'function') {
            return 'default';
        }
        return layoutEngine.applyLayoutConfig(CFG);
    }

    /**
     * Dispara as animações CSS de entrada dos elementos visíveis:
     * body fade-in, safe area fade-in, price slide-up,
     * imagem slide-right, título slide-left + fade-in.
     * Inicia o vídeo de fundo se presente.
     */
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

    /**
     * Popula o DOM com os dados de um item e controla o fluxo do loader.
     * - Lê título, preço, texto legal e URL da imagem do dataSource
     * - Renderiza o template de preço via price engine
     * - Ajusta fonte do título para caber no container
     * - Aguarda carregamento da imagem antes de chamar loader.loaded()
     * - Em erro de imagem: oculta a tag img, mas ainda chama loaded() + revealLayout()
     * @param {Object} dataSource - dataSource EBHTML ou mock.
     * @param {{loaded: Function, finished: Function}} loader - Loader EBHTML ou stub mock.
     */
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

    /**
     * Retorna o dataSource mock se MOCK_DATA estiver ativo e tiver getData(), caso contrário null.
     * @returns {Object|null}
     */
    function getMockSource() {
        if (typeof MOCK_DATA === 'undefined' || !MOCK_DATA.enabled || typeof MOCK_DATA.getData !== 'function') {
            return null;
        }
        return MOCK_DATA.getData();
    }

    /**
     * Cria um stub de loader compatível com a API EBHTML para uso no modo mock.
     * @returns {{loaded: Function, finished: Function}}
     */
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

    /**
     * Extrai o dataSource do loader EBHTML e chama applyDataToView.
     * Encerra com finished() se o dataset não for encontrado.
     * @param {{data: Function, finished: Function, loaded: Function}} loader - Loader EBHTML.
     */
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

    /**
     * Ponto de entrada do player. Chamado por window.playerView() via HTML.
     * Detecta modo mock e despacha para o fluxo correto.
     * Não deve ser chamado em contexto de extranet/preview.
     */
    function startRuntime() {
        applyLayoutConfig();

        var mockSource = getMockSource();
        if (mockSource) {
            applyDataToView(mockSource, getMockLoader());
            return;
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

    /** API pública do runtime. Consumida por master.js e preview.js. */
    window.ArmazemSeuJeitoEngine = {
        startRuntime: startRuntime,
        applyDataToView: applyDataToView
    };
})();
