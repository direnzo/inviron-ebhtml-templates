/**
 * MÓDULO FINANCEIRO — Rodapé Digital Signage
 * Dataset: D_MERCADO_FINANCEIRO
 * ES5 puro — Android 7+
 *
 * Campos esperados: M1_NOME, M1_VALOR, M1_VAR, M1_ICONE (emoji)
 *                   M2_*, M3_*, ... (até M9)
 *
 * Interface:
 *   ModuloFinanceiro.tipo        = 'financeiro'
 *   ModuloFinanceiro.label       = 'Mercado'
 *   ModuloFinanceiro.render(inner, dados, config, onDone) → cancelFn
 *   ModuloFinanceiro.parseEbhtml(rawData) → dados[]
 */

var ModuloFinanceiro = (function () {

    var MAX_INDICADORES = 9;

    function ler(rawData, campo) {
        if (!rawData) return '';
        if (typeof rawData.value === 'function') {
            var v = rawData.value(campo);
            if (v && typeof v.value !== 'undefined') {
                var val = v.value || '';
                // Filtra placeholder EBHTML: [field_name] quando campo não existe
                if (val.charAt(0) === '[' && val.charAt(val.length - 1) === ']') return '';
                return val;
            }
        }
        return '';
    }

    /* --- Formata valor: 4 casas quando < 0.1 (ex: Yen), senão 2 --- */
    function formatarValor(str) {
        if (!str) return str;
        var num = parseFloat(str);
        if (isNaN(num)) return str;
        var dec = (Math.abs(num) > 0 && Math.abs(num) < 0.1) ? 4 : 2;
        return num.toFixed(dec).replace('.', ',');
    }

    /* --- Mapa: quote key → caminho do SVG em img/
         Retorna '' quando não há SVG disponível (usa texto como fallback)    --- */
    var SVG_ICON_MAP = {
        'dolar':  'img/dolar.svg',
        'dollar': 'img/dolar.svg',
        'euro':   'img/euro.svg'
    };

    function svgPathDeQuote(quote) {
        if (!quote) return '';
        var q = quote.toLowerCase();
        for (var key in SVG_ICON_MAP) {
            if (SVG_ICON_MAP.hasOwnProperty(key) && q.indexOf(key) >= 0) {
                return SVG_ICON_MAP[key];
            }
        }
        return '';
    }

    /* --- Texto fallback: sigla ou símbolo para quando não há SVG --- */
    function textoIcone(quote, nome) {
        var q = (quote || '').toLowerCase();
        if (q.indexOf('libra')   >= 0 || q.indexOf('pound')  >= 0) return '\u00A3'; // £
        if (q.indexOf('yen')     >= 0)                              return '\u00A5'; // ¥
        if (q.indexOf('bitcoin') >= 0)                              return '\u20BF'; // ₿
        if (q.indexOf('peso')    >= 0)                              return 'AR$';
        if (q.indexOf('bovespa') >= 0)                              return 'IBV';
        if (q.indexOf('nasdaq')  >= 0)                              return 'NSD';
        if (q.indexOf('london')  >= 0)                              return 'LSE';
        if (q.indexOf('japan')   >= 0)                              return 'NIK';
        // Fallback via nome normalizado
        var n = (nome || '').toUpperCase()
            .replace(/[\u00D3\u00D2\u00D5\u00D4\u00F3\u00F2\u00F5\u00F4]/g, 'O')
            .replace(/[\u00C7\u00E7]/g, 'C');
        if (n.indexOf('IENE') >= 0 || n.indexOf('YEN') >= 0) return '\u00A5';
        if (n.indexOf('BITCOIN') >= 0)                       return '\u20BF';
        return '';
    }

    /* --- Extrai lista de indicadores do item EBHTML
         Suporta D_CAMBIO (moedas + bolsas) e D_AWESOMEAPI (moedas).
         Bolsas (quote:) sem variação relevante são omitidas.
    --- */
    function parseEbhtml(rawData) {
        if (!rawData) return null;

        var lista = [];
        for (var n = 1; n <= MAX_INDICADORES; n++) {
            var nome = ler(rawData, 'M' + n + '_NOME');
            if (!nome) continue;

            var quote    = ler(rawData, 'M' + n + '_QUOTE');
            var valor    = ler(rawData, 'M' + n + '_VALOR') || ler(rawData, 'M' + n + '_VALOR_COMPRA');
            var variacao = ler(rawData, 'M' + n + '_VAR');

            // Bolsas sem variação útil: omitir
            var varNum = parseFloat(variacao);
            var temVariacao = variacao && !isNaN(varNum) && varNum !== 0;
            if (!valor && !temVariacao) continue;

            // 'quote' = índice/bolsa; 'currency' = câmbio/moeda
            var tipo = (quote && quote.indexOf('quote:') === 0) ? 'quote' : 'currency';

            // Ícone: preferir SVG (img/) > texto/sigla
            var iconeCustom = ler(rawData, 'M' + n + '_ICONE'); // geralmente vazio no EBDATA
            var iconeSvg    = svgPathDeQuote(quote);
            var iconeTexto  = iconeCustom || textoIcone(quote, nome);

            lista.push({
                nome:      nome,
                tipo:      tipo,
                valor:     valor ? formatarValor(valor) : '',
                variacao:  variacao,
                iconeSvg:  iconeSvg,   // path para <img> (pode ser '')
                iconeText: iconeTexto  // texto/sigla fallback
            });
        }

        return lista.length > 0 ? lista : null;
    }

    /* --- Injeta SVG inline via XHR (evita problema de naturalWidth=0 em SVGs com em) --- */
    function injetarSvgInline(containerEl, src) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', src, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;
            if (xhr.status === 200 || xhr.status === 0) {
                var svgEl = containerEl.querySelector('svg');
                if (svgEl) svgEl.parentNode.removeChild(svgEl);
                containerEl.innerHTML = xhr.responseText;
                var svg = containerEl.querySelector('svg');
                if (svg) {
                    svg.style.width  = '100%';
                    svg.style.height = '100%';
                    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                }
            }
        };
        xhr.send();
        return xhr;
    }

    /* --- Render de um único indicador com fade --- */
    function renderItem(inner, item, config, onDone) {
        var timer = null;
        var xhr   = null;

        inner.innerHTML = '';
        inner.style.opacity = '0';

        var wrap = document.createElement('div');
        wrap.className = 'modulo-fin-wrap';

        // Ícone: SVG inline quando disponível, senão texto/sigla
        if (item.iconeSvg) {
            var iconeEl = document.createElement('span');
            iconeEl.className = 'modulo-fin-icone modulo-fin-icone-svg';
            wrap.appendChild(iconeEl);
            xhr = injetarSvgInline(iconeEl, item.iconeSvg);
        } else if (item.iconeText) {
            var iconeEl = document.createElement('span');
            iconeEl.className = 'modulo-fin-icone';
            iconeEl.textContent = item.iconeText;
            wrap.appendChild(iconeEl);
        }

        // Nome
        var nomeEl = document.createElement('span');
        nomeEl.className = 'modulo-fin-nome';
        nomeEl.textContent = item.nome;
        wrap.appendChild(nomeEl);

        // Valor (câmbio/moeda exibe preço; bolsas/índices não têm preço)
        if (item.valor) {
            var valorEl = document.createElement('span');
            valorEl.className = 'modulo-fin-valor';
            valorEl.textContent = item.valor;
            wrap.appendChild(valorEl);
        }

        // Variação: seta imagem + % colorido
        if (item.variacao !== '' && item.variacao !== undefined) {
            var varNum = parseFloat(String(item.variacao).replace(',', '.'));
            if (!isNaN(varNum) && varNum !== 0) {
                var sinal  = varNum > 0 ? '+' : '';

                // Seta: amarela=cima(positivo), verde=baixo(negativo)
                var setaImg = document.createElement('img');
                setaImg.src = varNum > 0 ? 'img/seta_amarala.png' : 'img/seta_verde.png';
                setaImg.className = 'modulo-fin-seta';
                if (varNum < 0) { setaImg.style.transform = 'none'; }
                setaImg.alt = varNum > 0 ? '+' : '-';
                wrap.appendChild(setaImg);

                var varEl = document.createElement('span');
                varEl.className = varNum > 0
                    ? 'modulo-fin-var modulo-fin-var-positivo'
                    : 'modulo-fin-var modulo-fin-var-negativo';
                varEl.textContent = sinal + varNum.toFixed(2).replace('.', ',') + '%';
                wrap.appendChild(varEl);
            }
        }

        inner.appendChild(wrap);

        var fadeDuracao = (config && config.fadeDuracao) || 400;
        setTimeout(function () {
            inner.style.transition = 'opacity ' + fadeDuracao + 'ms';
            inner.style.opacity = '1';
        }, 20);

        var duracao = (config && config.itemDuracao) || 6000;
        timer = setTimeout(function () {
            timer = null;
            if (onDone) onDone();
        }, duracao + fadeDuracao);

        return function cancel() {
            if (timer) { clearTimeout(timer); timer = null; }
            if (xhr)   { xhr.abort();          xhr = null;  }
        };
    }

    /* --- Render: cicla todos os indicadores --- */
    function render(inner, dados, config, onDone) {
        var cancelaItem = null;
        var idx = 0;
        var cancelado = false;

        function proxItem() {
            if (cancelado) return;
            if (idx >= dados.length) {
                if (onDone) onDone();
                return;
            }

            var item = dados[idx];
            idx++;

            // Fade out antes de trocar
            inner.style.transition = 'opacity ' + ((config && config.fadeDuracao) || 400) + 'ms';
            inner.style.opacity = '0';

            setTimeout(function () {
                if (cancelado) return;
                cancelaItem = renderItem(inner, item, config, proxItem);
            }, (config && config.fadeDuracao) || 400);
        }

        // Inicia diretamente (sem fade out inicial)
        cancelaItem = renderItem(inner, dados[0], config, function () {
            idx = 1;
            proxItem();
        });

        return function cancel() {
            cancelado = true;
            if (cancelaItem) { cancelaItem(); cancelaItem = null; }
        };
    }

    return {
        tipo:        'financeiro',
        label:       'Mercado',
        parseEbhtml:  parseEbhtml,
        render:       render
    };

}());
