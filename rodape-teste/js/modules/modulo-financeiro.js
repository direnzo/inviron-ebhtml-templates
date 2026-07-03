/**
 * MÓDULO FINANCEIRO — Rodapé Digital Signage
 * Dataset: D_MERCADO_FINANCEIRO
 * ES5 puro — Android 7+
 *
 * Campos esperados: M1_NOME, M1_VALOR, M1_VAR, M1_ATUALIZA, M1_ICONE (emoji)
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
        var num = parseFloat(String(str).replace(',', '.'));
        if (isNaN(num)) return str;
        var dec = (Math.abs(num) > 0 && Math.abs(num) < 0.1) ? 4 : 2;
        return num.toFixed(dec).replace('.', ',');
    }

    function valorCampo(rawData, n, sufixo) {
        return ler(rawData, 'M' + n + '_' + sufixo);
    }

    function primeiroNaoVazio() {
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i] !== '') return arguments[i];
        }
        return '';
    }

    function parseVariacaoNumero(variacao) {
        if (variacao === '' || variacao === null || typeof variacao === 'undefined') return null;
        var parsed = parseFloat(String(variacao).replace(',', '.'));
        return isNaN(parsed) ? null : parsed;
    }

    function formatarValorFinanceiro(item) {
        if (!item || !item.valor) return '';

        var valor = String(item.valor);
        if (/^\s*R\$\s*/.test(valor)) return valor;

        // Moedas em D_CAMBIO / D_AWESOMEAPI são cotadas em BRL.
        if (item.tipo === 'currency') {
            return 'R$ ' + valor;
        }

        return valor;
    }

    function pad2(n) {
        return n < 10 ? '0' + n : String(n);
    }

    function formatarDataHoraPtBr(valor) {
        if (!valor) return '';

        var str = String(valor).replace(/^\s+|\s+$/g, '');
        if (!str) return '';

        // Formato ISO-like comum no XML: yyyy-mm-dd hh:mm:ss
        // Parse manual para evitar deslocamento por timezone do Date().
        var isoDireto = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{1,2})(?::\d{1,2})?)?/);
        if (isoDireto) {
            var anoIso = isoDireto[1];
            var mesIso = pad2(parseInt(isoDireto[2], 10));
            var diaIso = pad2(parseInt(isoDireto[3], 10));
            var hhIso = isoDireto[4] ? pad2(parseInt(isoDireto[4], 10)) : '';
            var mmIso = isoDireto[5] ? pad2(parseInt(isoDireto[5], 10)) : '';
            return hhIso ? (diaIso + '/' + mesIso + '/' + anoIso + ' ' + hhIso + ':' + mmIso) : (diaIso + '/' + mesIso + '/' + anoIso);
        }

        // Já em formato brasileiro: dd/mm/aaaa [hh:mm]
        var br = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:\s+(\d{1,2}):(\d{1,2}))?/);
        if (br) {
            var dia = pad2(parseInt(br[1], 10));
            var mes = pad2(parseInt(br[2], 10));
            var ano = br[3].length === 2 ? ('20' + br[3]) : br[3];
            var hh = br[4] ? pad2(parseInt(br[4], 10)) : '';
            var mm = br[5] ? pad2(parseInt(br[5], 10)) : '';
            return hh ? (dia + '/' + mes + '/' + ano + ' ' + hh + ':' + mm) : (dia + '/' + mes + '/' + ano);
        }

        // ISO ou formatos parseáveis pelo Date
        var isoLike = str.indexOf('T') > -1 ? str : str.replace(' ', 'T');
        var d = new Date(isoLike);
        if (!isNaN(d.getTime())) {
            return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear() +
                ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
        }

        return str;
    }

    function animarEntrada(inner, duracao) {
        inner.style.transition = 'none';
        inner.style.opacity = '0';
        inner.style.transform = 'translateY(115%)';
        setTimeout(function () {
            inner.style.transition = 'transform ' + duracao + 'ms ease, opacity ' + duracao + 'ms ease';
            inner.style.opacity = '1';
            inner.style.transform = 'translateY(0)';
        }, 20);
    }

    function animarSaida(inner, duracao, onFim) {
        inner.style.transition = 'transform ' + duracao + 'ms ease, opacity ' + duracao + 'ms ease';
        inner.style.opacity = '0';
        inner.style.transform = 'translateY(-115%)';
        setTimeout(function () {
            if (onFim) onFim();
        }, duracao);
    }

    function aplicarCorSvgMonocromatico(svg, cor, trocarBranco) {
        if (!svg || !cor) return;

        svg.style.color = cor;

        var els = svg.querySelectorAll('path, circle, rect, ellipse, line, polyline, polygon, g');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            var fill = el.getAttribute('fill');
            if (fill === 'black' || fill === '#000' || fill === '#000000' ||
                (trocarBranco && (fill === 'white' || fill === '#fff' || fill === '#ffffff'))) {
                el.setAttribute('fill', 'currentColor');
            }
            var stroke = el.getAttribute('stroke');
            if (stroke === 'black' || stroke === '#000' || stroke === '#000000' ||
                (trocarBranco && (stroke === 'white' || stroke === '#fff' || stroke === '#ffffff'))) {
                el.setAttribute('stroke', 'currentColor');
            }
        }
    }

    function deveTrocarBrancoNoSvg(src) {
        if (!src) return false;
        var s = String(src).toLowerCase();
        return s.indexOf('dolar.svg') >= 0 ||
               s.indexOf('euro.svg') >= 0 ||
               s.indexOf('b3.svg') >= 0 ||
               s.indexOf('nasdaq.svg') >= 0;
    }

    /* --- Mapa: quote key → caminho do SVG em img/
         Retorna '' quando não há SVG disponível (usa texto como fallback)    --- */
    var SVG_ICON_MAP = {
        'dolar':  'img/dolar.svg',
        'dollar': 'img/dolar.svg',
        'euro':   'img/euro.svg',
        'bovespa': 'img/b3.svg',
        'ibovespa': 'img/b3.svg',
        'ibv': 'img/b3.svg',
        'nasdaq': 'img/nasdaq.svg',
        'nsd': 'img/nasdaq.svg'
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

            var quote = valorCampo(rawData, n, 'QUOTE');

            // D_CAMBIO e D_AWESOMEAPI costumam preencher Mx_VALOR e Mx_VALOR_COMPRA;
            // mantém fallback defensivo para variações de fonte.
            var valor = primeiroNaoVazio(
                valorCampo(rawData, n, 'VALOR'),
                valorCampo(rawData, n, 'VALOR_COMPRA'),
                valorCampo(rawData, n, 'VALOR_VENDA'),
                valorCampo(rawData, n, 'PRICE'),
                valorCampo(rawData, n, 'PRECO')
            );

            var variacao = primeiroNaoVazio(
                valorCampo(rawData, n, 'VAR'),
                valorCampo(rawData, n, 'VARIACAO'),
                valorCampo(rawData, n, 'CHANGE'),
                valorCampo(rawData, n, 'PCT_CHANGE')
            );

            var atualizadoCampo = valorCampo(rawData, n, 'ATUALIZA');

            // Bolsas sem variação útil: omitir
            var varNum = parseVariacaoNumero(variacao);
            var temVariacao = varNum !== null && varNum !== 0;
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
                quote:     quote,
                valor:     valor ? formatarValor(valor) : '',
                variacao:  variacao,
                atualizadoEm: atualizadoCampo,
                iconeSvg:  iconeSvg,   // path para <img> (pode ser '')
                iconeText: iconeTexto  // texto/sigla fallback
            });
        }

        return lista.length > 0 ? lista : null;
    }

    /* --- Injeta SVG inline via XHR (evita problema de naturalWidth=0 em SVGs com em) --- */
    function injetarSvgInline(containerEl, src, cor) {
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
                    aplicarCorSvgMonocromatico(svg, cor, deveTrocarBrancoNoSvg(src));
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
        var cancelado = false;

        inner.innerHTML = '';

        var wrap = document.createElement('div');
        wrap.className = 'modulo-fin-wrap';

        var corIcone = (config && config.corDestaque) ? config.corDestaque : ((config && config.corTexto) ? config.corTexto : '#ffffff');

        // Ícone: SVG inline quando disponível, senão texto/sigla
        if (item.iconeSvg) {
            var iconeEl = document.createElement('span');
            iconeEl.className = 'modulo-fin-icone modulo-fin-icone-svg';
            wrap.appendChild(iconeEl);
            xhr = injetarSvgInline(iconeEl, item.iconeSvg, corIcone);
        } else if (item.iconeText) {
            var iconeEl = document.createElement('span');
            iconeEl.className = 'modulo-fin-icone';
            iconeEl.textContent = item.iconeText;
            iconeEl.style.color = corIcone;
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
            valorEl.textContent = formatarValorFinanceiro(item);
            wrap.appendChild(valorEl);
        }

        // Variação: seta imagem + % colorido
        if (item.variacao !== '' && item.variacao !== undefined) {
            var varNum = parseFloat(String(item.variacao).replace(',', '.'));
            if (!isNaN(varNum) && varNum !== 0) {
                var sinal  = varNum > 0 ? '+' : '';

                // Seta: verde=cima (positivo), amarela=baixo (negativo)
                var setaImg = document.createElement('img');
                setaImg.src = varNum > 0 ? 'img/seta_verde.png' : 'img/seta_amarala.png';
                setaImg.className = 'modulo-fin-seta';
                // setaImg.style.transform = varNum > 0 ? 'none' : 'rotate(180deg)';
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

        // Data/hora de atualização do indicador (Mx_ATUALIZA)
        if (item.atualizadoEm) {
            var textoAtualizado = formatarDataHoraPtBr(item.atualizadoEm);
            if (textoAtualizado) {
                var atualizaBloco = document.createElement('div');
                atualizaBloco.className = 'modulo-fin-atualiza-bloco';

                var atualizaLabel = document.createElement('div');
                atualizaLabel.className = 'modulo-fin-atualiza-label';
                atualizaLabel.textContent = 'última atualização:';
                atualizaBloco.appendChild(atualizaLabel);

                var atualizaData = document.createElement('div');
                atualizaData.className = 'modulo-fin-atualiza-data';
                atualizaData.textContent = textoAtualizado;
                atualizaBloco.appendChild(atualizaData);

                wrap.appendChild(atualizaBloco);
            }
        }

        inner.appendChild(wrap);

        var transDuracao = (config && config.fadeDuracao) || 400;
        animarEntrada(inner, transDuracao);

        var duracao = (config && config.itemDuracao) || 6000;
        timer = setTimeout(function () {
            timer = null;
            if (cancelado) return;
            if (onDone) onDone();
        }, duracao);

        return function cancel() {
            cancelado = true;
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

            var transDuracao = (config && config.fadeDuracao) || 400;
            animarSaida(inner, transDuracao, function () {
                if (cancelado) return;
                cancelaItem = renderItem(inner, item, config, proxItem);
            });
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
