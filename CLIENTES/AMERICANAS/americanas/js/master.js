// ========== CONFIGURAÇÃO ========== PREÇOS
var ENDPOINT = "http://localhost:13199/INFO/AMERICANAS_BARCODE"
// var ENDPOINT = "http://192.168.4.167:14199/produto"
var canLoad = true;

// Verifica se o modo offline está habilitado (definido em mock.js)
var OFFLINE_MODE = typeof OFFLINE_MODE !== 'undefined' ? OFFLINE_MODE : false;

// ========== INICIALIZAÇÃO ==========
window.onload = function () {

    // Debug de tamanho da tela (descomente para ver)
    // capturarTamanhoDoNavegador();

    // Mostra indicador de modo offline (se mock.js estiver carregado)
    if (OFFLINE_MODE && typeof MOCK !== 'undefined') {
        var indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.classList.remove('hidden');
            var productIndexSpan = document.getElementById('product-index');
            if (productIndexSpan) {
                productIndexSpan.innerText = (MOCK_INDEX % MOCK.length) + 1;
            }
        }
    }

    var not = document.getElementById('notfound');
    var notMsg = document.getElementById('notfound img');
    var titulo = document.getElementById('titulo');
    var preco = document.getElementById('preco');
    var precoPortrait = document.getElementById('preco-portrait');
    var moeda = document.getElementById('moeda');
    var moedaPortrait = document.getElementById('moeda-portrait');
    var audio = document.querySelector('#audio');
    //var beep = new Audio('img/beep.wav');
    //var wrong = new Audio('img/wrong.wav');
    // var videobg = document.getElementById('videobg');

    // capturarTamanhoDoNavegador();

    ebhtml.create2({}, function (loader) {

        // ========== MODO OFFLINE ==========
        if (OFFLINE_MODE && typeof MOCK !== 'undefined') {
            console.log('🔴 MODO OFFLINE ATIVO - Usando MOCK');
            loader.log('Modo Offline - Usando dados MOCK');

            // Simula erro se SIMULATE_ERROR estiver true
            if (typeof SIMULATE_ERROR !== 'undefined' && SIMULATE_ERROR && typeof MOCK_ERROR !== 'undefined') {
                console.log('❌ Simulando erro 500...');
                loadError(loader, MOCK_ERROR.httpStatusCode, MOCK_ERROR.message);
                return;
            }

            var mockProduct = MOCK[MOCK_INDEX % MOCK.length];
            var image = document.getElementById('produto');
            var imageWrapper = image ? image.parentNode : null;

            // Insere os textos primeiro
            titulo.innerText = mockProduct.descricao;
            preco.innerText = mockProduct.preco.replace('.', ',');
            if (precoPortrait) precoPortrait.innerText = mockProduct.preco.replace('.', ',');
            if (moeda) moeda.innerText = 'R$';
            if (moedaPortrait) moedaPortrait.innerText = 'R$';

            // Sem imagem no mock: oculta o bloco de imagem (igual ao modo online)
            var mainElement = document.querySelector('main');
            var hasImage = mockProduct.hasOwnProperty('image') && mockProduct.image && String(mockProduct.image).trim() !== '';

            if (!hasImage) {
                if (image) {
                    image.onload = null;
                    image.onerror = null;
                    image.src = '';
                    image.style.display = 'none';
                }
                if (imageWrapper) imageWrapper.style.display = 'none';
                if (mainElement) {
                    var isPortraitMode = window.innerHeight > window.innerWidth;
                    if (isPortraitMode) {
                        mainElement.classList.remove('no-image');
                    } else {
                        mainElement.classList.add('no-image');
                    }
                }
            }

            var isLowPerformance = document.documentElement.classList.contains('no-animations');
            var delay = isLowPerformance ? 50 : 100;

            setTimeout(function () {
                aplicarTextFit();
                showMedia();
                if (mainElement) {
                    mainElement.classList.remove('opacity-0');
                    mainElement.classList.add('opacity-100');
                }
            }, delay);

            loader.loaded();
            setTimeout(function () {
                loader.finished();
                MOCK_INDEX++; // Próximo produto no reload
            }, 10000);

            return; // Não continua para o modo online
        }
        // ========== MODO ONLINE ==========
        console.log('🟢 MODO ONLINE ATIVO - Consultando endpoint');

        var xhr = new XMLHttpRequest();
        xhr.open('GET', ENDPOINT, true);
        //xhr.timeout = 1500;

        var requestHandled = false;

        function handleNetworkFailure(code, message) {
            if (requestHandled) return;
            requestHandled = true;
            loadError(loader, code, message);
        }

        function revealMainContent() {
            showMedia();
            var mainDiv = document.querySelector('main');
            if (mainDiv) {
                mainDiv.classList.remove('opacity-0');
                mainDiv.classList.add('opacity-100');
            }
        }

        xhr.onabort = function () {
            // NS_BINDING_ABORT (Firefox) indicates the request was canceled (reload/navigation).
            // This is not a backend failure and should not show a product-not-found error.
            requestHandled = true;
            revealMainContent();
            console.warn('Requisição cancelada (NS_BINDING_ABORT). Ignorando erro visual.');
        };

        xhr.onerror = function () {
            revealMainContent();
            handleNetworkFailure('NETWORK_ERROR', 'FALHA DE CONEXAO');
        };

        xhr.ontimeout = function () {
            revealMainContent();
            handleNetworkFailure('TIMEOUT', 'TEMPO DE RESPOSTA ESGOTADO');
        };

        xhr.onreadystatechange = function () {
            if (requestHandled) return;

            if (xhr.readyState === 4) { // Verifica se a requisição está completa
                if (xhr.status === 200) {
                    requestHandled = true;
                    // Verifica se a resposta foi bem-sucedida
                    var response = null;
                    try {
                        response = JSON.parse(xhr.responseText);
                    } catch (e) {
                        loadError(loader, 'INVALID_JSON', 'RESPOSTA INVALIDA DO SERVIDOR');
                        revealMainContent();
                        return;
                    }

                    // Verifica se houve erro no servidor (formato: {"errorCode":"500 INTERNAL_SERVER_ERROR","httpStatusCode":500,"message":"..."})
                    if (response.httpStatusCode && response.httpStatusCode !== 200) {
                        loadError(loader, response.httpStatusCode, 'PREÇO NÃO ENCONTRADO');
                        revealMainContent();
                        return;
                    }

                    // Processa dados do produto (formato: {"codSap":"...","descricao":"...","ean":"...","image":"...","loja":"...","preco":"...","preco_promoc":"..."})
                    titulo.innerText = response.descricao || '';
                    var precoBase = '';
                    if (response.preco_promoc != null && String(response.preco_promoc).trim() !== '') {
                        precoBase = String(response.preco_promoc).replace('.', ',');
                    } else {
                        precoBase = String(response.preco || '').replace('.', ',');
                    }

                    preco.innerText = precoBase;
                    if (precoPortrait) precoPortrait.innerText = precoBase;
                    
                    if (moeda) moeda.innerText = 'R$';
                    if (moedaPortrait) moedaPortrait.innerText = 'R$';

                    var image = document.getElementById('produto');
                    var imageWrapper = image ? image.parentNode : null;
                    var imageLoaded = false;

                    function completeImageLoad() {
                        if (imageLoaded) return;
                        imageLoaded = true;

                        var isLowPerformance = document.documentElement.classList.contains('no-animations');
                        var delay = isLowPerformance ? 50 : 100;

                        setTimeout(function () {
                            aplicarTextFit();
                            showMedia();
                            loader.loaded();
                            var mainDiv = document.querySelector('main');
                            if (mainDiv) {
                                mainDiv.classList.remove('opacity-0');
                                mainDiv.classList.add('opacity-100');
                            }
                        }, delay);

                        setTimeout(function () {
                            loader.finished();
                        }, 10000);
                    }

                    // Decide se existe imagem válida no retorno do endpoint e se o elemento existe no DOM
                    var mainElement = document.querySelector('main');
                    var hasImage = image && response.hasOwnProperty('image') && response.image && String(response.image).trim() !== '';

                    if (hasImage) {
                        // Garante que o elemento está visível e aguarda o carregamento
                        if (imageWrapper) imageWrapper.style.display = 'flex';
                        image.style.display = '';
                        if (mainElement) { mainElement.classList.remove('no-image'); }

                        image.onload = null;
                        image.onerror = null;
                        image.onload = completeImageLoad;
                        image.onerror = completeImageLoad;
                        image.src = response.image;
                    } else {
                        // Sem imagem: oculta o elemento e segue o fluxo diretamente
                        if (image) {
                            image.onload = null;
                            image.onerror = null;
                            image.src = '';
                            image.style.display = 'none';
                        }
                        if (imageWrapper) imageWrapper.style.display = 'none';
                        if (mainElement) {
                            // Em portrait, manter o bloco de preço visível para o textFit funcionar.
                            // Em landscape, aplicar layout "no-image" para expandir o conteúdo textual.
                            var isPortraitMode = window.innerHeight > window.innerWidth;
                            if (isPortraitMode) {
                                mainElement.classList.remove('no-image');
                            } else {
                                mainElement.classList.add('no-image');
                            }
                        }
                        completeImageLoad();
                    }
                        

                } else if (xhr.status === 0) {
                    // Request canceled by browser/app lifecycle. Avoid false "PREÇO NÃO ENCONTRADO".
                    requestHandled = true;
                    loadError(loader, xhr.status, 'PREÇO NÃO ENCONTRADO');
                    revealMainContent();
                    console.warn('Requisição cancelada antes da resposta (status 0).');
                } else {
                    requestHandled = true;
                    loadError(loader, xhr.status, 'PREÇO NÃO ENCONTRADO');
                }

            }
        };

        xhr.send();
    });
};

function revealMainContent() {
    var mainDiv = document.querySelector('main');
    if (mainDiv) {
        mainDiv.classList.remove('opacity-0');
        mainDiv.classList.add('opacity-100');
    }
}

function loadError(loader, code, message) {
    
    var msgElement = document.getElementById("msg");
    msgElement.style.display = "flex";
    msgElement.classList.remove("hidden");
    msgElement.innerHTML = '<p class="m-0">' + message + '</p><p class="m-0 mt-4">' + code + '</p>';
    showMedia();
    loader.loaded();
    setTimeout(() => {
        loader.finished();
    }, 5000);

}

function showMedia() {
    var black = document.getElementById('fullscreen-black');
    if (black) {
        black.remove();
    }
}

// ========== TEXTFIT - Ajusta texto para preencher a div ==========
function aplicarTextFit() {
    console.log('🎨 Aplicando textFit...');

    function applyTextFitIfSized(element, options, label, attempts) {
        attempts = attempts || 0;

        if (!element) {
            return false;
        }

        var width = element.clientWidth;
        var height = element.clientHeight;

        if (width > 0 && height > 0) {
            textFit(element, options);
            return true;
        }

        // Em alguns devices/layouts, dimensões estabilizam poucos frames depois.
        if (attempts < 6) {
            setTimeout(function () {
                applyTextFitIfSized(element, options, label, attempts + 1);
            }, 50);
            return false;
        }

        console.warn('⚠️ textFit ignorado para ' + label + ' (sem dimensões estáticas visíveis: ' + width + 'x' + height + ')');
        return false;
    }

    var isLowPerformance = document.documentElement.classList.contains('no-animations');
    if (isLowPerformance) {
        console.log('⚡ Modo ESTÁTICO detectado - elementos já devem estar visíveis');
    }

    // Detecta orientação
    var isPortrait = window.innerHeight > window.innerWidth;
    console.log('📐 Orientação:', isPortrait ? 'PORTRAIT' : 'LANDSCAPE');

    // Detecta se está no modo sem imagem (layout expandido)
    var mainElement = document.querySelector('main');
    var noImage = mainElement && mainElement.classList.contains('no-image');
    console.log('🖼️ Modo sem imagem:', noImage);

    // Ajusta o título (sempre visível)
    var titulo = document.getElementById('titulo');
    if (titulo && titulo.innerText.trim() !== '') {
        console.log('📝 Título conteúdo:', titulo.innerText);
        console.log('📏 Título dimensões:', titulo.offsetWidth + 'x' + titulo.offsetHeight);

        // Sem imagem: força altura maior para o textFit ocupar mais espaço
        if (noImage) {
            titulo.style.height = Math.round(window.innerHeight * 0.42) + 'px';
        }

        applyTextFitIfSized(titulo, {
            alignVert: true,
            alignHoriz: true,
            multiLine: true,
            detectMultiLine: true,
            minFontSize: 20,
            maxFontSize: noImage ? 160 : 80,
            reProcess: true
        }, 'titulo');
        console.log('✅ Título ajustado');
    } else {
        console.warn('⚠️ Título não encontrado ou vazio');
    }

    if (isPortrait) {
        // ===== MODO PORTRAIT =====
        console.log('🔄 Aplicando textFit no modo PORTRAIT');

        var moedaPortrait = document.getElementById('moeda-portrait');
        var precoPortrait = document.getElementById('preco-portrait');

        // Remove hidden e aplica dimensões
        if (moedaPortrait && moedaPortrait.innerText.trim() !== '') {
            moedaPortrait.style.display = 'flex';
            moedaPortrait.style.width = noImage ? '260px' : '180px';
            moedaPortrait.style.height = noImage ? '420px' : '300px';

            applyTextFitIfSized(moedaPortrait, {
                alignVert: true,
                alignHoriz: false,
                multiLine: false,
                minFontSize: 20,
                maxFontSize: noImage ? 220 : 150,
                reProcess: true
            }, 'moeda-portrait');
            console.log('✅ Moeda (portrait) ajustada');
        }

        if (precoPortrait && precoPortrait.innerText.trim() !== '') {
            precoPortrait.style.display = 'flex';
            precoPortrait.style.width = noImage ? '620px' : '400px';
            precoPortrait.style.height = noImage ? '420px' : '300px';

            applyTextFitIfSized(precoPortrait, {
                alignVert: true,
                alignHoriz: false,
                multiLine: false,
                minFontSize: 30,
                maxFontSize: noImage ? 320 : 200,
                reProcess: true
            }, 'preco-portrait');

            // Aplica animação de pulse
            setTimeout(function () {
                var precoSpan = precoPortrait.querySelector('.textFitted');
                if (precoSpan) {
                    precoSpan.classList.add('animate-price-pulse');
                    console.log('✅ Animação de pulse aplicada (portrait)');
                }
            }, 50);

            console.log('✅ Preço (portrait) ajustado');
        }

    } else {
        // ===== MODO LANDSCAPE =====
        console.log('🔄 Aplicando textFit no modo LANDSCAPE');

        var moeda = document.getElementById('moeda');
        var preco = document.getElementById('preco');

        if (moeda && moeda.innerText.trim() !== '') {
            moeda.style.display = 'flex';
            moeda.style.width = noImage ? '210px' : '150px';
            moeda.style.height = noImage ? '320px' : '200px';

            applyTextFitIfSized(moeda, {
                alignVert: true,
                alignHoriz: false,
                multiLine: false,
                minFontSize: 20,
                maxFontSize: noImage ? 220 : 150,
                reProcess: true
            }, 'moeda');
            console.log('✅ Moeda (landscape) ajustada');
        }

        if (preco && preco.innerText.trim() !== '') {
            preco.style.display = 'flex';
            preco.style.width = noImage ? '540px' : '350px';
            preco.style.height = noImage ? '320px' : '200px';

            applyTextFitIfSized(preco, {
                alignVert: true,
                alignHoriz: false,
                multiLine: false,
                minFontSize: 30,
                maxFontSize: noImage ? 320 : 200,
                reProcess: true
            }, 'preco');

            // Aplica animação de pulse
            setTimeout(function () {
                var precoSpan = preco.querySelector('.textFitted');
                if (precoSpan) {
                    precoSpan.classList.add('animate-price-pulse');
                    console.log('✅ Animação de pulse aplicada (landscape)');
                }
            }, 50);

            console.log('✅ Preço (landscape) ajustado');
        }
    }
}
// ================================================================

// Função para capturar o tamanho do navegador e atualizar a div
function capturarTamanhoDoNavegador() {
    // Captura a largura e altura do navegador
    let largura = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    let altura = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    // Detecta orientação
    let orientation = largura > altura ? 'LANDSCAPE (16x9)' : 'PORTRAIT (9x16)';
    let ratio = (largura / altura).toFixed(2);

    // Atualiza o texto da div com o tamanho do navegador
    document.getElementById('size').innerHTML = `${largura} x ${altura}<br>${orientation}<br>Ratio: ${ratio}`;
    document.getElementById('size').style.display = 'block';
    document.getElementById('size').classList.remove('hidden');
}

// Atualiza quando a janela é redimensionada
window.addEventListener('resize', function () {
    if (document.getElementById('size').style.display === 'block') {
        capturarTamanhoDoNavegador();
    }
});

// Chama a função uma vez para exibir o tamanho inicial
//capturarTamanhoDoNavegador();

