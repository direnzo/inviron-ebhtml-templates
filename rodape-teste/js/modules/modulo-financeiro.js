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
            return (v && typeof v.value !== 'undefined') ? (v.value || '') : '';
        }
        return '';
    }

    /* --- Extrai lista de indicadores do item EBHTML --- */
    function parseEbhtml(rawData) {
        if (!rawData) return null;

        var lista = [];
        for (var n = 1; n <= MAX_INDICADORES; n++) {
            var nome  = ler(rawData, 'M' + n + '_NOME');
            var valor = ler(rawData, 'M' + n + '_VALOR');

            if (!nome || !valor) continue;

            var variacao = ler(rawData, 'M' + n + '_VAR');
            var icone    = ler(rawData, 'M' + n + '_ICONE') || '';

            lista.push({
                nome:     nome,
                valor:    valor,
                variacao: variacao,
                icone:    icone
            });
        }

        return lista.length > 0 ? lista : null;
    }

    /* --- Render de um único indicador com fade --- */
    function renderItem(inner, item, config, onDone) {
        var timer = null;

        inner.innerHTML = '';
        inner.style.opacity = '0';

        var wrap = document.createElement('div');
        wrap.className = 'modulo-fin-wrap';

        // Ícone (emoji ou texto curto)
        if (item.icone) {
            var iconeEl = document.createElement('span');
            iconeEl.className = 'modulo-fin-icone';
            iconeEl.textContent = item.icone;
            wrap.appendChild(iconeEl);
        }

        // Nome
        var nomeEl = document.createElement('span');
        nomeEl.className = 'modulo-fin-nome';
        nomeEl.textContent = item.nome;
        wrap.appendChild(nomeEl);

        // Valor
        var valorEl = document.createElement('span');
        valorEl.className = 'modulo-fin-valor';
        valorEl.textContent = item.valor;
        wrap.appendChild(valorEl);

        // Variação
        if (item.variacao !== '' && item.variacao !== undefined) {
            var varNum = parseFloat(String(item.variacao).replace(',', '.'));
            var sinal   = varNum >= 0 ? '+' : '';
            var varEl   = document.createElement('span');

            varEl.className = varNum >= 0
                ? 'modulo-fin-var modulo-fin-var-positivo'
                : 'modulo-fin-var modulo-fin-var-negativo';

            varEl.textContent = sinal + item.variacao + '%';
            wrap.appendChild(varEl);
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
