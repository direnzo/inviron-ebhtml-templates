// var ENDPOINT = 'http://localhost:13199/INFO/AMERICANAS_BARCODE';
var ENDPOINT = 'http://192.168.4.117:13199/INFO/AMERICANAS_BARCODE';
var DURATION = 10000;

window.onload = function() {

    ebhtml.create2({}, function(loader) {

        // MOCK (desenvolvimento local)
        if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
            renderizar(MOCK_DATA.produto, loader);
            return;
        }

        // ONLINE - consulta endpoint
        var xhr = new XMLHttpRequest();
        xhr.open('GET', ENDPOINT, true);

        var requestHandled = false;

        function handleResponse(data) {
            if (requestHandled) return;
            requestHandled = true;
            if (!data || data.httpStatusCode) {
                mostrarErro(loader);
                return;
            }
            renderizar(data, loader);
        }

        xhr.onabort = function() {
            // Cancelamento normal pelo ciclo de vida do Android/browser — não exibe erro
            requestHandled = true;
        };

        xhr.onerror = function() {
            if (requestHandled) return;
            requestHandled = true;
            mostrarErro(loader);
        };

        xhr.ontimeout = function() {
            if (requestHandled) return;
            requestHandled = true;
            mostrarErro(loader);
        };

        xhr.onreadystatechange = function() {
            if (xhr.readyState !== 4 || requestHandled) return;
            if (xhr.status === 0) {
                // Cancelado antes da resposta — não é falha do backend
                requestHandled = true;
                return;
            }
            var data = null;
            if (xhr.status === 200) {
                try { data = JSON.parse(xhr.responseText); } catch(e) {}
            }
            handleResponse(data);
        };

        xhr.send();

    });
};

function formatarPreco(valor) {
    var str = String(valor).trim();
    // Já está em formato pt-BR (tem vírgula) — não altera
    if (str.indexOf(',') !== -1) return str;
    // Separa parte decimal: o último segmento após o último ponto
    var partes = str.split('.');
    var inteiro, centavos;
    if (partes.length === 1) {
        inteiro = partes[0];
        centavos = '00';
    } else {
        centavos = partes[partes.length - 1];
        if (centavos.length === 1) centavos = centavos + '0';
        if (centavos.length > 2) centavos = centavos.substring(0, 2);
        inteiro = partes.slice(0, partes.length - 1).join('');
    }
    // Adiciona pontos de milhar na parte inteira
    var resultado = '';
    var n = inteiro.length;
    for (var i = 0; i < n; i++) {
        if (i > 0 && (n - i) % 3 === 0) resultado += '.';
        resultado += inteiro[i];
    }
    return resultado + ',' + centavos;
}

function ajustarFontePreco(textoPreco) {
    var len = textoPreco.length;
    var isPortrait = window.innerHeight > window.innerWidth;
    var fracao = isPortrait ? 0.80 : 0.50;
    // "POR:" em elemento separado — sempre conta só "R$" (2.5 chars)
    var charsTotal = len + 2.5;
    var vw = (fracao * 100) / (charsTotal * 0.60);
    var maxVw = isPortrait ? 24 : 18;
    var minVw = 4;
    vw = Math.max(minVw, Math.min(maxVw, vw));

    document.getElementById('preco').style.fontSize = vw + 'vw';
    document.getElementById('preco-simbolo').style.fontSize = (vw * 0.38) + 'vw';
    // "POR:" acompanha proporção de "R$"
    var porLabel = document.getElementById('preco-por-label');
    if (porLabel) porLabel.style.fontSize = (vw * 0.20) + 'vw';
}

function renderizar(produto, loader) {
    // Hierarquia de preços: TakeWin > Promotional > Regular
    var hasTakeWin = produto.takeWin != null && produto.takeWin.unitPriceWithDiscount != null;
    var hasPromotional = produto.promotional != null && produto.promotional.price != null;
    var temPromoc = hasTakeWin || hasPromotional;

    var precoFinal;
    if (hasTakeWin) {
        precoFinal = produto.takeWin.unitPriceWithDiscount;
        console.log('[AMERICANAS2] Exibindo preço: TAKEWIN (unitPriceWithDiscount)');
    } else if (hasPromotional) {
        precoFinal = produto.promotional.price;
        console.log('[AMERICANAS2] Exibindo preço: PROMOTIONAL (promotional.price)');
    } else {
        precoFinal = produto.regularPrice;
        console.log('[AMERICANAS2] Exibindo preço: REGULAR (regularPrice)');
    }
    var precoFormatado = formatarPreco(precoFinal);

    document.getElementById('titulo').innerText = (produto.product && produto.product.description) ? produto.product.description : '';
    document.getElementById('preco').innerText = precoFormatado;

    // Bloco DE: visível somente com promoção
    var precoDeBloco = document.getElementById('preco-de');
    var porLabel = document.getElementById('preco-por-label');
    if (temPromoc) {
        document.getElementById('preco-de-valor').innerText = 'R$ ' + formatarPreco(produto.regularPrice);
        precoDeBloco.style.display = 'flex';
        porLabel.style.display = 'block'; // "POR:" preto aparece
    } else {
        precoDeBloco.style.display = 'none';
        porLabel.style.display = 'none';
    }
    // "R$" sempre vermelho — não altera cor

    // Parcelamento (installment)
    var parcBloco = document.getElementById('parcelamento');
    var parcText = document.getElementById('parcelamento-text');
    if (produto.installment && produto.installment.quantity && produto.installment.value) {
        parcText.innerHTML = 'ou ' + produto.installment.quantity + 'X de <span class="font-[800] text-[#ed0030] text-[4vw]">R$ ' + formatarPreco(produto.installment.value) + '</span>';
        parcBloco.style.display = 'flex';
    } else {
        parcBloco.style.display = 'none';
    }

    // TakeWin (leve X por Y)
    var takewinBloco = document.getElementById('takewin');
    var takewinText = document.getElementById('takewin-text');
    if (hasTakeWin && produto.takeWin.quantity && produto.takeWin.totalPriceWithDiscount) {
        takewinText.innerHTML = 'Leve ' + produto.takeWin.quantity + ' por <span class="font-[800] text-[#ed0030] text-[4vw]">R$ ' + formatarPreco(produto.takeWin.totalPriceWithDiscount) + '</span>';
        takewinBloco.style.display = 'flex';
    } else {
        takewinBloco.style.display = 'none';
    }

    ajustarFontePreco(precoFormatado);

    var main = document.getElementById('main-content');
    var imgEl = document.getElementById('produto');

    function revelar() {
        document.body.style.opacity = '1';
        loader.loaded();
        setTimeout(function() { loader.finished(); }, DURATION);
    }

    if (produto.image && String(produto.image).trim() !== '') {
        imgEl.onload  = function() { main.classList.add('has-image'); revelar(); };
        imgEl.onerror = function() { revelar(); }; // falhou: exibe sem imagem
        imgEl.src = produto.image;
    } else {
        revelar();
    }
}

function mostrarErro(loader) {
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('erro').style.display = 'flex';
    document.body.style.opacity = '1';
    setTimeout(function() { loader.finished(); }, 5000);
}
