window.onload = function () {

    var image          = document.querySelector('#image');
    var image2         = document.querySelector('#image2');
    var title          = document.querySelector('#title');
    var titleContainer = document.querySelector('#titleContainer');
    var description    = document.querySelector('#description');
    var descContainer  = document.querySelector('#descriptionContainer');
    var body           = document.querySelector('body');

    // ── Leitura segura de campo EBHTML ────────────────────────────────────────
    function ler(item, campo) {
        try {
            var node = item.value(campo);
            if (node && node.value !== undefined && node.value !== null) {
                return '' + node.value;
            }
        } catch (e) {}
        return '';
    }

    // ── Cores por categoria (Canaltech) ───────────────────────────────────────
    function mudaCor(categoria) {
        var cat = categoria ? categoria.toUpperCase() : '';
        var cor;
        switch (cat) {
            case 'GAMES':                      cor = '#7c3aed'; break;
            case 'CIÊNCIA':
            case 'CIENCIA':                    cor = '#16a34a'; break;
            case 'SEGURANÇA':
            case 'SEGURANCA':                  cor = '#dc2626'; break;
            case 'IA':
            case 'INTELIGÊNCIA ARTIFICIAL':
            case 'INTELIGENCIA ARTIFICIAL':    cor = '#9333ea'; break;
            case 'HARDWARE':                   cor = '#ea580c'; break;
            case 'INTERNET':                   cor = '#2563eb'; break;
            case 'TECNOLOGIA':
            case 'CELULAR':
            case 'SMARTPHONE':
            case 'SOFTWARE':
            case 'APLICATIVOS':
            default:                           cor = '#0284c7'; break;
        }
        if (titleContainer) {
            titleContainer.style.backgroundColor = cor;
        }
    }

    // ── Ajuste de fonte (UOL pattern) ─────────────────────────────────────────
    function fitDescriptionFont(textEl, wrapEl, minFontSize) {
        minFontSize = minFontSize || 8;
        var maxH = wrapEl.offsetHeight;
        var fontSize;
        if (!maxH) { return; }
        fontSize = parseInt(window.getComputedStyle(textEl).fontSize, 10);
        while (textEl.scrollHeight > maxH && fontSize > minFontSize) {
            fontSize -= 1;
            textEl.style.fontSize = fontSize + 'px';
        }
    }

    // ── Renderiza textos e cores ──────────────────────────────────────────────
    function renderizarTemplate(dados) {
        if (title)       { title.textContent = dados.CATEGORIA ? dados.CATEGORIA.toUpperCase() : ''; }
        if (description) { description.textContent = dados.TITULO; }
        mudaCor(dados.CATEGORIA);
        if (description && descContainer) {
            fitDescriptionFont(description, descContainer, 8);
        }
    }

    // ── Carregamento de imagem ────────────────────────────────────────────────
    function carregarImagem(url, loader) {
        if (!url) {
            loader.finished();
            return;
        }

        var ar = window.innerWidth / window.innerHeight;
        if (ar <= (3 / 4)) {
            image.classList.add('object-right');
        } else {
            image.classList.add('scale-110');
        }

        image.src = url;
        if (image2) { image2.src = url; }

        image.onload = function () {
            body.classList.remove('opacity-0');
            body.classList.add('opacity-100');
            loader.loaded();
            setTimeout(function () {
                loader.finished();
            }, 15000);
        };

        image.onerror = function () {
            console.error('[canaltech] Erro ao carregar imagem.');
            loader.finished();
        };
    }

    // ── MOCK ──────────────────────────────────────────────────────────────────
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = {
            loaded:   function () { console.log('[Mock] loaded'); },
            finished: function () { console.log('[Mock] finished'); }
        };
        renderizarTemplate(MOCK_DATA.dados);
        carregarImagem(MOCK_DATA.dados.FOTO, mockLoader);
        return;
    }

    // ── EBHTML ────────────────────────────────────────────────────────────────
    ebhtml.create2({}, function (loader) {
        loader.addData('D_CANALTECH', false);
        loader.autoloaded = false;
        loader.nodataiserror = false;

        loader.load(function () {
            if (loader.data('D_CANALTECH') == undefined) {
                console.error('[canaltech] sem dados');
                loader.finished();
                return;
            }

            var item = loader.data('D_CANALTECH');
            var dados = {
                FOTO:      ler(item, 'FOTO'),
                CATEGORIA: ler(item, 'category'),
                TITULO:    ler(item, 'titulo')
            };

            renderizarTemplate(dados);
            carregarImagem(dados.FOTO, loader);
        });
    });
};

