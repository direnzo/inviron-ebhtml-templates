

// Variáveis globais para alternância de modo e cidade
var MODO_NOTICIAS = true; // false = unificado (cotação/dólar/tempo), true = só notícias
var CIDADE = 'Goiania'; // Troque para a cidade desejada

function cidadeComAcento(nome) {
    var mapa = {
        'Goiania': 'Goiânia',
        'Anapolis': 'Anápolis',
        'Ribeirao Preto': 'Ribeirão Preto',
        'Sao Paulo': 'São Paulo',
        'Belo Horizonte': 'Belo Horizonte'
        // Adicione mais cidades conforme necessário
    };
    return mapa[nome] || nome;
}

window.onload = function() {
    ebhtml.create2({}, function(loader) {
        var filtro = '';
        var urlCidade = encodeURIComponent(CIDADE);
        if (MODO_NOTICIAS) {
            // Apenas notícias
            filtro = 'amount=1&f_texto2=' + urlCidade + '&f_category=noticias';
        } else {
            // Unificado: cotação, dólar, tempo
            filtro = 'amount=0&f_texto2=' + urlCidade;
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
            // Se for modo notícias, espera lista
            if (MODO_NOTICIAS) {
                var dados = {
                    CATEGORY: d.value('CATEGORY') ? d.value('CATEGORY').value : '',
                    TITULO:   d.value('TITULO') ? d.value('TITULO').value : '',
                    TEXTO2:   d.value('TEXTO2') ? d.value('TEXTO2').value : '',
                    TEXTO3:   d.value('TEXTO3') ? d.value('TEXTO3').value : ''
                };
                renderNoticias(dados, loader);
            } else {
                // Unificado: buscar todos os blocos
                var cotacao = null, dolar = null, tempo = null;
                var lista = loader.datalist('D_AGROLINK');
                for (var i = 0; i < lista.count(); i++) {
                    var item = lista.get(i);
                    var cat = item.value('CATEGORY') ? item.value('CATEGORY').value.toLowerCase() : '';
                    if (cat === 'cotacoes' && !cotacao) cotacao = item;
                    if (cat === 'dolar' && !dolar) dolar = item;
                    if (cat === 'tempo' && !tempo) tempo = item;
                }
                renderUnificado(cotacao, dolar, tempo, loader);
            }
        });
    });
};

function renderNoticias(dados, loader) {
    var content = document.getElementById('content');
    content.innerHTML = '';
    var tpl = document.querySelector('#noticia-template');
    var node = document.importNode(tpl.content, true);

    // Badge cidade/UF
    var badge = node.getElementById('badge');
    var cidade = (dados.TEXTO2 || (dados.value && dados.value('TEXTO2') && dados.value('TEXTO2').value) || '');
    cidade = cidadeComAcento(cidade);
    var uf = (dados.TEXTO3 || (dados.value && dados.value('TEXTO3') && dados.value('TEXTO3').value) || '');
    badge.innerHTML = cidade + (cidade && uf ? ', ' : '') + uf;

    // Exibe bloco-noticia, esconde bloco-unificado
    var blocoNoticia = node.getElementById('bloco-noticia');
    var blocoUnificado = node.getElementById('bloco-unificado');
    if (blocoNoticia) {
        blocoNoticia.classList.remove('hidden');
        var titulo = node.getElementById('titulo');
        if (titulo) titulo.innerHTML = dados.TITULO || '';
    }
    if (blocoUnificado) blocoUnificado.classList.add('hidden');

    content.appendChild(node);
    document.body.classList.remove('opacity-0');
    document.body.classList.add('opacity-100');
    loader.loaded();

    // Chama loader.finished ao término do vídeo ou, se não houver vídeo, após fallback
    var video = node.querySelector('#video-foto');
    var finishedCalled = false;
    function finishOnce() {
        if (!finishedCalled) {
            finishedCalled = true;
            loader.finished();
        }
    }
    if (video) {
        video.addEventListener('ended', finishOnce);
        video.addEventListener('error', finishOnce);
        setTimeout(finishOnce, 15000);
    } else {
        setTimeout(finishOnce, 10000);
    }
}

function renderUnificado(_cotacao, _dolar, _tempo, loader) {
    var content = document.getElementById('content');
    content.innerHTML = '';
    var lista = loader.datalist('D_AGROLINK');
    var cotacoes = [], tempos = [], dolar = null;
    for (var i = 0; i < lista.count(); i++) {
        var item = lista.get(i);
        var cat = item.value('CATEGORY') ? item.value('CATEGORY').value.toLowerCase() : '';
        if (cat === 'cotacoes') cotacoes.push(item);
        if (cat === 'tempo') tempos.push(item);
        if (cat === 'dolar' && !dolar) dolar = item;
    }

    // Controle de índice para ciclo
    if (typeof window._cotacaoIdx === 'undefined') window._cotacaoIdx = 0;
    if (typeof window._tempoIdx === 'undefined') window._tempoIdx = 0;
    if (window._cotacaoIdx >= cotacoes.length) window._cotacaoIdx = 0;
    if (window._tempoIdx >= tempos.length) window._tempoIdx = 0;

    // Seleciona 1 de cada
    var c = cotacoes.length > 0 ? cotacoes[window._cotacaoIdx] : null;
    var t = tempos.length > 0 ? tempos[window._tempoIdx] : null;
    var d = dolar;

    // Usa o template HTML
    var tpl = document.querySelector('#noticia-template');
    var node = document.importNode(tpl.content, true);

    // Badge cidade/UF
    var badge = node.getElementById('badge');
    cidadeBadge = '';
    if (c && c.value('TEXTO2')) cidadeBadge = cidadeComAcento(c.value('TEXTO2').value);
    else if (t && t.value('TEXTO2')) cidadeBadge = cidadeComAcento(t.value('TEXTO2').value);
    var ufBadge = '';
    if (c && c.value('TEXTO3')) ufBadge = c.value('TEXTO3').value;
    else if (t && t.value('TEXTO3')) ufBadge = t.value('TEXTO3').value;
    badge.innerHTML = cidadeBadge + (cidadeBadge && ufBadge ? ', ' : '') + ufBadge;

    // Bloco Unificado
    var blocoUnificado = node.getElementById('bloco-unificado');
    if (blocoUnificado) {
        blocoUnificado.classList.remove('hidden');
        // Cotação: COTAÇÃO | <TITULO> <br> <TEXTO4> <TEXTO5> | R$ <PRICE>/<TEXTO9>
        var cotacaoStr = '';
        if (c) {
            var titulo = c.value('TITULO') ? c.value('TITULO').value : '';
            var texto4 = c.value('TEXTO4') ? c.value('TEXTO4').value : '';
            var texto5 = c.value('TEXTO5') ? c.value('TEXTO5').value : '';
            var price = c.value('PRICE') ? c.value('PRICE').value : '';
            var texto9 = c.value('TEXTO9') ? c.value('TEXTO9').value : '';
            cotacaoStr = 'COTAÇÃO' + (titulo ? ' | ' + titulo : '') + ((texto4 || texto5) ? ' <br> ' : '') + (texto4 ? texto4 : '') + (texto5 ? (texto4 ? '' : '') + texto5 : '') + (price ? ' | R$ ' + formatarBRL(price) : '') + (texto9 ? '/' + texto9 : '');
        }
        node.getElementById('cotacao').innerHTML = cotacaoStr;

        // Dólar: DOLAR R$ <TEXTO> (ou vazio)
        var dolarStr = '';
        if (d) {
            var textoD = d.value('TEXTO') ? d.value('TEXTO').value : '';
            dolarStr = 'DOLAR' + (textoD ? ' R$ ' + formatarBRL(textoD) : '');
        }
        node.getElementById('dolar').innerHTML = dolarStr;

        // Tempo: CLIMA <CIDADE> | <TEXTO4> A <TEXTO5>C | CHUVA <TEXTO7>%
        var tempoStr = '';
        if (t) {
            var cidadeT = t && t.value('TEXTO2') ? cidadeComAcento(t.value('TEXTO2').value) : '';  
            var texto4T = t.value('TEXTO4') ? t.value('TEXTO4').value : '';
            var texto5T = t.value('TEXTO5') ? t.value('TEXTO5').value : '';
            var texto7T = t.value('TEXTO7') ? t.value('TEXTO7').value : '';
            tempoStr = 'CLIMA' + (cidadeT ? ' ' + cidadeT : '') + (texto4T || texto5T ? ' | ' : '') + (texto4T ? texto4T : '') + (texto5T ? (texto4T ? ' A ' : '') + texto5T + 'C' : '') + (texto7T ? ' |<br>CHUVA ' + texto7T + '%' : '');
        }
        node.getElementById('tempo').innerHTML = tempoStr;
    }

    content.appendChild(node);
    document.body.classList.remove('opacity-0');
    document.body.classList.add('opacity-100');
    loader.loaded();

    // Chama loader.finished ao término do vídeo ou, se não houver vídeo, após fallback
    var video = node.querySelector('#video-foto');
    var finishedCalled = false;
    function finishOnce() {
        if (!finishedCalled) {
            finishedCalled = true;
            loader.finished();
        }
    }
    if (video) {
        video.addEventListener('ended', finishOnce);
        video.addEventListener('error', finishOnce);
        setTimeout(finishOnce, 10000);
    } else {
        setTimeout(finishOnce, 10000);
    }

    // Avança índices para próxima exibição
    window._cotacaoIdx = (window._cotacaoIdx + 1) % (cotacoes.length > 0 ? cotacoes.length : 1);
    window._tempoIdx = (window._tempoIdx + 1) % (tempos.length > 0 ? tempos.length : 1);
    // Não faz loop automático
}

// Formata valor para R$ pt-BR
function formatarBRL(valor) {
    if (!valor) return '';
    var n = parseFloat(valor.toString().replace(',', '.'));
    if (isNaN(n)) return valor;
    return n.toLocaleString('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

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

