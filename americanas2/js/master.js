var ENDPOINT = 'http://localhost:13199/INFO/AMERICANAS_BARCODE';
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

        xhr.onreadystatechange = function() {
            if (xhr.readyState !== 4) return;
            var data = null;
            if (xhr.status === 200) {
                try { data = JSON.parse(xhr.responseText); } catch(e) {}
            }
            if (!data || data.httpStatusCode) {
                mostrarErro(loader);
                return;
            }
            renderizar(data, loader);
        };

        xhr.onerror = function() { mostrarErro(loader); };
        xhr.send();

    });
};

function renderizar(produto, loader) {
    var precoValor = (produto.preco_promoc && String(produto.preco_promoc).trim())
        ? produto.preco_promoc
        : (produto.preco || '');

    document.getElementById('titulo').innerText = produto.descricao || '';
    document.getElementById('preco').innerText = String(precoValor).replace('.', ',');

    document.body.style.opacity = '1';
    loader.loaded();
    setTimeout(function() { loader.finished(); }, DURATION);
}

function mostrarErro(loader) {
    var erro = document.getElementById('erro');
    erro.style.display = 'flex';
    document.body.style.opacity = '1';
    setTimeout(function() { loader.finished(); }, 5000);
}
