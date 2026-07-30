// Variáveis globais para controle de localStorage e dados
var local_storage_id = 'special_project_id_t4';
var local_storage_type = 'product_type_t4';
var local_storage_media = 'media_url_t4';
var special_project = [];
var midias_para_exibir = [];
var prox_projeto;  // <-- Prox_projeto declarado globalmente

// Função principal que inicia o player
function playerView() {
    window.onload = function () {
        ebhtml.create2({}, function (loader) {
            loader.addData('D_SPD', true, 'onlyreceivedfile=0&amount=0&order=SPECIALPROJECT&orderkind=A&f_type=4&ft_file_background=');
            loader.nodataiserror = false;
            loader.autoloaded = false;
            loader.load(function () {
                docLoader = loader;
                docLoader.loaded();

                if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
                    runMock();
                } else {
                    readDataXML();
                }

                setTimeout(function () {
                    docLoader.finished();
                }, 5000);
            });
        });
    };
}
// Função para ler o XML e processar os projetos especiais
function readDataXML() {
    var data1 = docLoader.datalist('D_SPD');
    var qtd_dados = data1.count();
    var y = 0;

    for (var a = 0; a < qtd_dados; a++) {
        if (special_project[y - 1] != data1.get(a).value('SPECIALPROJECT').value) {
            special_project[y] = data1.get(a).value('SPECIALPROJECT').value;
            y++;
        }
    }

    console.log(special_project);

    // Verifica no localStorage qual é o próximo projeto a ser exibido
    if (localStorage.getItem(local_storage_id) >= special_project.length || localStorage.getItem(local_storage_id) == null) {
        localStorage.setItem(local_storage_id, 0);
    }

    prox_projeto = localStorage.getItem(local_storage_id); // <-- Define a variável prox_projeto
    console.log(prox_projeto);

    var midia_fundo = data1.get(prox_projeto).value('FILE_BACKGROUND').value;
    var tipo_midia = midia_fundo.split(':')[0];

    if (tipo_midia === 'http') {
        var image = document.getElementById('image');
        image.src = midia_fundo;
        midia_id = midia_fundo.split('FILES/')[1];
    } else {
        var video = document.getElementById('video');
        midia_id = midia_fundo.split('f_')[1].split('.')[0];
        video.src = "http://localhost:13199/FILES/" + midia_id;
        video.play();
    }

    var pprojeto = parseInt(prox_projeto) + 1;
    localStorage.setItem(local_storage_id, pprojeto);

    ebhtml.create2({}, function (loader2) {
        // loader2.addData('D_SPD', true, 'onlyreceivedfile=0&amount=0&f_specialproject=' + special_project[prox_projeto] + '&ft_title=' + '&f_text10=1');
       loader2.addData('D_SPD', true, 'onlyreceivedfile=0&amount=0&f_specialproject=' + special_project[prox_projeto] + '&ft_title=');

        loader2.nodataiserror = false;
        loader2.autoloaded = false;
        loader2.load(function () {
            docLoader2 = loader2;
            readData2XML();
        });
    });
}
// Função para ler os dados do projeto especial atual
function readData2XML() {
    var data2 = docLoader2.datalist('D_SPD');
    var qtd_itens = data2.count();
    console.log('Total itens: ' + qtd_itens);

    var allProducts = [];
    for (var i = 0; i < qtd_itens; i++) {
        allProducts.push(i);
    }

    console.log('Produtos encontrados: ' + allProducts.length);

    if (localStorage.getItem(local_storage_media + prox_projeto) >= allProducts.length || localStorage.getItem(local_storage_media + prox_projeto) == null) {
        localStorage.setItem(local_storage_media + prox_projeto, 0);
    }

    var prox_midia = localStorage.getItem(local_storage_media + prox_projeto);
    console.log('Exibindo produto index: ' + prox_midia);

    getproduct(allProducts, data2, prox_midia);

    var pmidia = parseInt(prox_midia) + 1;
    localStorage.setItem(local_storage_media + prox_projeto, pmidia);

    ebhtml.create2({}, function (loaderConfig) {
        loaderConfig.addData('D_SPD', true, 'f_specialproject=' + special_project[prox_projeto] + '&ft_image_logo=');
        loaderConfig.nodataiserror = false;
        loaderConfig.autoloaded = false;
        loaderConfig.load(function () {
            readConfig(loaderConfig);
        });
    });
}
// Função para ler e aplicar a configuração do projeto
function readConfig(loaderConfig) {
    var logo = document.getElementById('logo');
    logo.src = loaderConfig.data('D_SPD').value('IMAGE_LOGO').value;

    // var colorFont = loaderConfig.data('D_SPD').value('COLOR1').value;
    // var colorPrice = loaderConfig.data('D_SPD').value('COLOR2').value;

    // document.body.style.color = colorFont;
    // document.getElementById('price').style.color = colorPrice;
}

// Função para buscar e exibir o produto
function getproduct(allProducts, data2, prox_midia) {
    var idx = allProducts[prox_midia];

    console.log('PROX PROJETO: ' + prox_projeto);
    console.log('PROX MIDIA: ' + prox_midia + ' / ' + allProducts.length);

    var fullContent = document.getElementById('fullContent');
    fullContent.classList.remove('opacity-0');
    fullContent.style.opacity = '1';

    var productImg = document.getElementById('product_img_portrait');
    var productImg2 = document.getElementById('product_img_landscape');
    var title = document.getElementById('title');

    var unity = 'un.';
    var currency = 'R$';

    productImg.src = data2.get(idx).value('FILE_IMAGE1').value;
    productImg2.src = data2.get(idx).value('FILE_IMAGE1').value;
    title.innerText = data2.get(idx).value('TITLE').value.toUpperCase();

    price1Value = data2.get(idx).value('TEXT1').value;
    price2Value = data2.get(idx).value('TEXT2').value;
    price3Value = data2.get(idx).value('TEXT3').value;
    unitPack = data2.get(idx).value('TEXT6').value;
    text7Value = data2.get(idx).value('TEXT7').value;

    var aTipo = data2.get(idx).value('TEXT5').value;
    renderCondition(aTipo);
}

// Renderiza a condição de preço clonando o template #cond-{tipo} do HTML
// e preenchendo automaticamente os elementos com [data-fill].
// Para editar o layout de uma condição: edite o <template id="cond-N"> em index.html.
function renderCondition(tipo) {
    var container = document.getElementById('price_container');
    container.innerHTML = '';

    var tpl = document.getElementById('cond-' + tipo);
    if (!tpl) {
        console.warn('[renderCondition] Template não encontrado: cond-' + tipo);
        return;
    }

    var clone = document.importNode(tpl.content, true);
    container.appendChild(clone);

    var fills = container.querySelectorAll('[data-fill]');
    for (var i = 0; i < fills.length; i++) {
        var el = fills[i];
        var fillType = el.getAttribute('data-fill');
        switch (fillType) {
            case 'price1':         applyPrice(price1Value, 'R$', 'un.', el); break;
            case 'price1-no-unit': applyPrice(price1Value, 'R$', '', el); break;
            case 'price2':         applyPrice(price2Value, 'R$', 'un.', el); break;
            case 'price2-pct':     applyPrice(price2Value + '%', '', '', el); break;
            case 'price3':         applyPrice(price3Value, 'R$', 'un.', el); break;
            case 'price3-no-unit': applyPrice(price3Value, 'R$', '', el); break;
            case 'price-unitpack': applyPrice(unitPack, 'R$', 'un.', el); break;
            case 'price2-raw':     el.textContent = price2Value; break;
            case 'price3-raw':     el.textContent = price3Value; break;
            case 'unitpack':       el.textContent = unitPack ? unitPack.toUpperCase() : ''; break;
            case 'text7':          el.textContent = text7Value; break;
            default: console.warn('[renderCondition] data-fill desconhecido: ' + fillType);
        }
    }
}

// Aplica o preço formatado. Aceita ID string ou elemento DOM.
function applyPrice(priceValue, currency, unity, elementOrId) {
    var price = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
    if (!price) {
        console.error('[applyPrice] Elemento não encontrado: ' + elementOrId);
        return;
    }

    price.classList.remove('text-[600%]', 'text-[400%]', 'text-[300%]', 'text-[200%]');

    if (priceValue && priceValue.indexOf(',') !== -1) {
        var parts = priceValue.split(',');
        var integer = parts[0];
        var decimal = parts[1];
        setFontSizeByLength(price, integer.length);
        price.innerHTML = '<span class="text-[50%]">' + currency + '</span>' +
            '<span>' + integer + '</span>' +
            '<span><span>,' + decimal + '</span><span class="text-[50%]">' + unity + '</span></span>';
    } else {
        setFontSizeByLength(price, priceValue ? priceValue.length : 1);
        price.innerHTML = '<span>' + (priceValue || '') + '</span>';
    }
}

// =============================================================================
// MOCK: renderiza produto do mock no lugar dos dados reais (loaded/finished reais)
// =============================================================================
function runMock() {
    var mockKey = 'mock_product_idx_t4';
    var idx = parseInt(localStorage.getItem(mockKey) || '0');
    if (idx >= MOCK_DATA.products.length) { idx = 0; }
    localStorage.setItem(mockKey, idx + 1);

    var prod = MOCK_DATA.products[idx];
    var CONDITION_NAMES = {
        '1':  'Preço simples',
        '2':  'DE... POR',
        '3':  'Desconto de X',
        '4':  'Leve X Pague Y',
        '5':  'Preço + Embalagem',
        '6':  'Preço + Atacado/Crediffato',
        '7':  'Varejo + Atacado + Embalagem',
        '8':  'Preço + Cliente ClubeFFato',
        '9':  'ClubeFFato Leve X Pague Y + Embalagem',
        '10': 'ClubeFFato % desconto 2ª unidade',
        '11': 'ClubeFFato % 2ª un + Embalagem',
        '12': 'Preço + X unidades por Y',
        '13': 'Preço + Parcelamento',
        '14': 'A partir de'
    };
    console.log('[MOCK] ' + (idx + 1) + '/' + MOCK_DATA.products.length +
        ' | Condição ' + prod.tipo + ': ' + (CONDITION_NAMES[prod.tipo] || '?') +
        ' | ' + prod.title);

    // Background
    document.getElementById('image').src = MOCK_DATA.background;

    // Globals usados em renderCondition
    price1Value = prod.price1;
    price2Value = prod.price2;
    price3Value = prod.price3;
    unitPack = prod.unitPack;
    text7Value = prod.text7;

    // Conteúdo
    var fc = document.getElementById('fullContent');
    fc.classList.remove('opacity-0');
    fc.style.opacity = '1';
    document.getElementById('product_img_portrait').src = prod.img;
    document.getElementById('product_img_landscape').src = prod.img;
    document.getElementById('title').innerText = prod.title;

    renderCondition(prod.tipo);
    // reload controlado pelo docLoader.finished() no playerView
}

// Define o tamanho da fonte de acordo com a quantidade de dígitos do preço
function setFontSizeByLength(element, length) {
    if (length <= 3) {
        element.classList.add('text-[335%]');
    }
    else if (length <= 4) {
        element.classList.add('text-[310%]');
    }
    else if (length <= 5) {
        element.classList.add('text-[310%]');
    }

    else if (length <= 6) {
        element.classList.add('text-[300%]');
    }
    else if (length <= 7) {
        element.classList.add('text-[275%]');
    } else {
        element.classList.add('text-[200%]');
    }
}
