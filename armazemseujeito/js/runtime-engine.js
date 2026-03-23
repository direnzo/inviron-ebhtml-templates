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
        var legalTextEl = document.getElementById('legal_text');

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

        if (legalTextEl) {
            setTimeout(function() {
                legalTextEl.classList.remove('opacity-0');
                legalTextEl.classList.add('opacity-50');
            }, 900);
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
        var fieldMap = CFG.fieldMap || {};

        /**
         * Lê o primeiro campo não-vazio de uma lista de fallbacks.
         * @param {Array<string>} fields
         * @returns {string}
         */
        function getFirstField(fields) {
            var i, val;
            for (i = 0; i < fields.length; i++) {
                val = priceEngine.getField(dataSource, fields[i]);
                if (val !== '') { return val; }
            }
            return '';
        }

        var tituloFields = (fieldMap.titulo && fieldMap.titulo.length) ? fieldMap.titulo : ['TITULO'];
        var fotoFields   = (fieldMap.foto   && fieldMap.foto.length)   ? fieldMap.foto   : ['FOTO', 'FOTO1'];
        var texto5Fields = (fieldMap.texto5 && fieldMap.texto5.length) ? fieldMap.texto5 : ['TEXTO5'];

        title.innerHTML = getFirstField(tituloFields).toUpperCase();
        priceEngine.setupPriceTemplate(CFG, dataSource, profile);

        // Limita título a 2 linhas: calcula lineHeight real e seta maxHeight no container.
        // fitDescriptionFont reduz a fonte até caber dentro desse limite.
        var maxLines = CFG.titleFit.maxLines || 2;
        var titleFontSize = parseFloat(window.getComputedStyle(title).fontSize);
        var titleLineHeightRaw = window.getComputedStyle(title).lineHeight;
        var titleLineHeight = parseFloat(titleLineHeightRaw);
        if (isNaN(titleLineHeight) || titleLineHeight <= 0) {
            titleLineHeight = titleFontSize * 1.25; // fallback leading-tight
        }
        titleContainer.style.maxHeight = Math.ceil(titleLineHeight * maxLines) + 'px';

        priceEngine.fitDescriptionFont(title, titleContainer, CFG.titleFit.minFontSize);

        if (legalText) {
            var legal = getFirstField(texto5Fields);
            legalText.innerHTML = legal !== '' ? legal : (CFG.defaultLegalText || '');
        }

        var imageUrl = getFirstField(fotoFields);

        /**
         * Remove o container de imagem do fluxo flex e expande a coluna de info.
         * Chamado quando o produto não tem imagem cadastrada ou quando a URL falha.
         */
        function collapseImageContainer() {
            var imgCont = document.getElementById('img_container');
            var infoCont = document.getElementById('info_column');
            if (imgCont) {
                imgCont.style.display = 'none';
            }
            if (infoCont) {
                infoCont.style.flex = '1 1 100%';
                infoCont.classList.remove('border-t', 'border-l', 'landscape:border-l', 'landscape:border-t-0');
                infoCont.style.borderLeft = 'none';
                infoCont.style.borderTop = 'none';
            }
        }

        // Sem imagem no dataset: colapsa o container e centraliza conteudo
        if (imageUrl === '') {
            collapseImageContainer();
            loader.loaded();
            revealLayout();
            setTimeout(function() { loader.finished(); }, CFG.timing.duration);
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
            collapseImageContainer();
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
                if (typeof MOCK_DATA !== 'undefined' &&
                    typeof MOCK_DATA.shouldCycle === 'function' &&
                    MOCK_DATA.shouldCycle()) {
                    // setTimeout(function() { window.location.reload(); }, 1500);
                }
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
