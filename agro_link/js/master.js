// ─── CONFIGURACAO GLOBAL ──────────────────────────────────────────────────────

var CONFIG = {
    filterCidade:    'Rio Verde' // Para filtro de dados (TEXTO2) 'Goiania','Rio Verde', 'Anapolis'
};

window.onload = function() {
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = {
            loaded: function() { console.log('[Mock] Carregado'); },
            finished: function() { console.log('[Mock] Finalizado'); },
            data: function() { return getRandomMock(); }
        };
        var mockItem = getRandomMock();
        iniciarTemplate(mockItem, {}, mockLoader);
    } else {
        ebhtml.create2({}, function(loader) {
            var filtro = '';
            if (CONFIG.filterCidade) {
                var cidadeUrl = encodeURIComponent(CONFIG.filterCidade);
                filtro = 'order=id&orderkind=A&amount=1' +'&f_TEXTO2=' + cidadeUrl ;
            } else {
                filtro = 'order=id&orderkind=A';
            }
            console.log('[agro_link] Carregando dados com filtro:', filtro);
            loader.addData('D_AGROLINK', false, filtro);
            loader.autoloaded = false;
            loader.nodataiserror = false;
            loader.load(function() {
                var d = loader.data('D_AGROLINK');
                if (!d) {
                    console.error('[agro_link] Sem dados no canal D_AGROLINK');
                    loader.finished();
                    return;
                }
                var dados = {
                    CATEGORY: d.value('CATEGORY') ? d.value('CATEGORY').value : '',
                    TITULO:   d.value('TITULO') ? d.value('TITULO').value : '',
                    TEXTO:    d.value('TEXTO') ? d.value('TEXTO').value : '',
                    TEXTO2:   d.value('TEXTO2') ? d.value('TEXTO2').value : '',
                    TEXTO3:   d.value('TEXTO3') ? d.value('TEXTO3').value : '',
                    TEXTO4:   d.value('TEXTO4') ? d.value('TEXTO4').value : '',
                    TEXTO5:   d.value('TEXTO5') ? d.value('TEXTO5').value : '',
                    TEXTO6:   d.value('TEXTO6') ? d.value('TEXTO6').value : '',
                    TEXTO7:   d.value('TEXTO7') ? d.value('TEXTO7').value : '',
                    TEXTO8:   d.value('TEXTO8') ? d.value('TEXTO8').value : '',
                    PRICE:    d.value('PRICE') ? d.value('PRICE').value : '',
                    PRICE2:   d.value('PRICE2') ? d.value('PRICE2').value : '',
                    FOTO:     d.value('FOTO') ? d.value('FOTO').value : '',
                    FOTO2:    d.value('FOTO2') ? d.value('FOTO2').value : '',
                    FOTO3:    d.value('FOTO3') ? d.value('FOTO3').value : ''
                };
                iniciarTemplate(dados, CONFIG, loader);
            });
        });
    }
};

function iniciarTemplate(dados, config, loader) {
    var content = document.getElementById('content');
    content.innerHTML = '';
    var tpl = document.querySelector('#noticia-template');
    var node = document.importNode(tpl.content, true);

    // Badge cidade/UF


    // Badge cidade/UF
    var badge = node.getElementById('badge');
    var cidade = (dados.TEXTO2 || (dados.value && dados.value('TEXTO2') && dados.value('TEXTO2').value) || '');
    var uf = (dados.TEXTO3 || (dados.value && dados.value('TEXTO3') && dados.value('TEXTO3').value) || '');
    badge.innerHTML = cidade + (cidade && uf ? ', ' : '') + uf;

    // Exibe bloco correto por categoria

    var categoria = (dados.CATEGORY || (dados.value && dados.value('CATEGORY') && dados.value('CATEGORY').value) || '').toLowerCase();
    var blocoNoticia = node.getElementById('bloco-noticia');
    var blocoDolar = node.getElementById('bloco-dolar');
    var blocoTempo = node.getElementById('bloco-tempo');
    var blocoCotacoes = node.getElementById('bloco-cotacoes');
    if (blocoNoticia) blocoNoticia.classList.add('hidden');
    if (blocoDolar) blocoDolar.classList.add('hidden');
    if (blocoTempo) blocoTempo.classList.add('hidden');
    if (blocoCotacoes) blocoCotacoes.classList.add('hidden');

    if (categoria === 'noticias' || categoria === 'noticia') {
        if (blocoNoticia) {
            blocoNoticia.classList.remove('hidden');
            var titulo = node.getElementById('titulo');
            var resumo = node.getElementById('resumo');
            titulo.innerHTML = dados.TITULO || '';
        }
    } else if (categoria === 'dolar') {
        if (blocoDolar) {
            blocoDolar.classList.remove('hidden');
            node.getElementById('titulo-dolar').innerHTML = dados.TITULO || dados.DESCRICAO || '';
            node.getElementById('valor-dolar').innerHTML = 'R$ ' + (dados.TEXTO || dados.VALOR || '0,00');
            var variacao = dados.TEXTO5 || dados.VARIACAO || '0,00';
            var variacaoEl = node.getElementById('variacao-dolar');
            variacaoEl.innerHTML = (variacao.indexOf('-') === 0 ? '' : '+') + variacao + '%';
            variacaoEl.className = 'text-[4vmin] font-bold mb-[1vmin] ' + (variacao.indexOf('-') === 0 ? 'text-red-400' : 'text-green-400');
        }
    } else if (categoria === 'tempo') {
        if (blocoTempo) {
            blocoTempo.classList.remove('hidden');
            node.getElementById('titulo-tempo').innerHTML = dados.TITULO || '';
            node.getElementById('temp-min').innerHTML = (dados.TEXTO4 !== undefined ? dados.TEXTO4 + '°C' : (dados.TEMP_MIN !== undefined ? dados.TEMP_MIN + '°C' : ''));
            node.getElementById('temp-max').innerHTML = (dados.TEXTO5 !== undefined ? dados.TEXTO5 + '°C' : (dados.TEMP_MAX !== undefined ? dados.TEMP_MAX + '°C' : ''));
                // Probabilidade de chuva
                var probChuva = (dados.TEXTO7 !== undefined && dados.TEXTO7 !== null) ? dados.TEXTO7 : '';
                var probChuvaEl = node.getElementById('probchuva');
                if (probChuva !== '' && probChuva !== 0 && probChuva !== '0') {
                    probChuvaEl.innerHTML = 'Probabilidade de Chuva: ' + probChuva + '%';
                    probChuvaEl.style.display = '';
                } else {
                    probChuvaEl.innerHTML = '';
                    probChuvaEl.style.display = 'none';
                }

                // Quantidade de chuva
                var qtdChuva = (dados.TEXTO6 !== undefined && dados.TEXTO6 !== null) ? dados.TEXTO6 : '';
                var qtdChuvaEl = node.getElementById('qtdchuva');
                if (qtdChuva !== '' && qtdChuva !== 0 && qtdChuva !== '0') {
                    qtdChuvaEl.innerHTML = 'Qtd de Chuva: ' + qtdChuva + 'mm';
                    qtdChuvaEl.style.display = '';
                } else {
                    qtdChuvaEl.innerHTML = '';
                    qtdChuvaEl.style.display = 'none';
                }

                // Umidade
                var umidade = (dados.TEXTO8 !== undefined && dados.TEXTO8 !== null) ? dados.TEXTO8 : '';
                var umidadeEl = node.getElementById('umidade');
                if (umidade !== '' && umidade !== 0 && umidade !== '0') {
                    umidadeEl.innerHTML = 'Umidade: ' + umidade + '%';
                    umidadeEl.style.display = '';
                } else {
                    umidadeEl.innerHTML = '';
                    umidadeEl.style.display = 'none';
                }

                // Vento
                var ventoVel = (dados.TEXTO9 !== undefined && dados.TEXTO9 !== null) ? dados.TEXTO9 : '';
                var ventoDir = (dados.TEXTO10 !== undefined && dados.TEXTO10 !== null) ? dados.TEXTO10 : '';
                var ventoEl = node.getElementById('vento');
                if ((ventoVel !== '' && ventoVel !== 0 && ventoVel !== '0') || (ventoDir !== '' && ventoDir !== 0 && ventoDir !== '0')) {
                    ventoEl.innerHTML = 'Vento: ' + ventoVel + ' km/h ' + ventoDir;
                    ventoEl.style.display = '';
                } else {
                    ventoEl.innerHTML = '';
                    ventoEl.style.display = 'none';
                }
        }
    } else if (categoria === 'cotacoes') {
        if (blocoCotacoes) {
            blocoCotacoes.classList.remove('hidden');
            node.getElementById('titulo-cotacoes').innerHTML = dados.TITULO || '';
            // Concatena TEXTO (Classificacao) + TEXTO8 (Embalagem) + TEXTO4 (Quantidade) + TEXTO5 (Unidade)
            var frase = '';
            if (dados.TEXTO) frase += dados.TEXTO + ' ';
            if (dados.TEXTO8) frase += dados.TEXTO8 + ' ';
            if (dados.TEXTO4) frase += dados.TEXTO4 + ' ';
            if (dados.TEXTO5) frase += dados.TEXTO5;
            node.getElementById('classificacao-cotacoes').innerHTML = frase.trim().toUpperCase();
            var valor = dados.PRICE;
            var valorFormatado = '';
            if (valor !== undefined && valor !== null && valor !== '') {
                var num = parseFloat(valor.toString().replace(',', '.'));
                if (!isNaN(num)) {
                    valorFormatado = 'R$ ' + num.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                } else {
                    valorFormatado = valor;
                }
            }
            // Adiciona variação (TEXTO7) ao lado do valor
            var variacao = dados.TEXTO7;
            var variacaoHtml = '';
            if (variacao !== undefined && variacao !== null && variacao !== '' && variacao !== 0 && variacao !== '0') {
                var variacaoNum = parseFloat(variacao.toString().replace(',', '.'));
                if (!isNaN(variacaoNum) && variacaoNum !== 0) {
                    var variacaoClass = '';
                    var variacaoSinal = '';
                    if (variacaoNum < 0) {
                        variacaoClass = 'text-red-500';
                        variacaoSinal = '';
                    } else {
                        variacaoClass = 'text-green-500';
                        variacaoSinal = '+';
                    }
                    variacaoHtml = ' <span class="' + variacaoClass + ' text-[60%] ml-3 font-bold">' + variacaoSinal + variacaoNum.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '%</span>';
                }
            }
            node.getElementById('valor-cotacoes').innerHTML = valorFormatado + variacaoHtml;
            node.getElementById('obs-cotacoes').innerHTML = dados.TEXTO6 || '';
        }
    }



    content.appendChild(node);

    // Fade in
    setTimeout(function() {
        document.body.classList.remove('opacity-0');
        document.body.classList.add('opacity-100');
    }, 100);

    loader.loaded();
    var video = document.getElementById('content').querySelector('video');
    if (video) {
        video.addEventListener('loadedmetadata', function() {
            setTimeout(function() {
                loader.finished();
            }, Math.max(1000, Math.round(video.duration * 1000)));
        });
        // fallback: se loadedmetadata não disparar em 2s, chama finished após 15s
        setTimeout(function() {
            if (!video.duration || isNaN(video.duration)) {
                loader.finished();
            }
        }, 2000);
    } else {
        setTimeout(function() {
            loader.finished();
        }, (config && config.duration) ? config.duration : 15000);
    }
}

