/**
 * MÓDULO MENSAGERIA — Rodapé Digital Signage
 * Dataset: D_MENSAGERIA (datalist)
 * ES5 puro — Android 7+
 *
 * Campos por item: TITULO, TEXTO, COR (hex, opcional)
 *
 * Interface:
 *   ModuloMensageria.tipo        = 'mensageria'
 *   ModuloMensageria.label       = 'Aviso'
 *   ModuloMensageria.render(inner, dados, config, onDone) → cancelFn
 *   ModuloMensageria.parseEbhtml(rawData) → dados[]
 */

var ModuloMensageria = (function () {

    function ler(item, campo) {
        if (!item) return '';
        if (typeof item.value === 'function') {
            var v = item.value(campo);
            return (v && typeof v.value !== 'undefined') ? (v.value || '') : '';
        }
        if (typeof item[campo] !== 'undefined') return item[campo] || '';
        return '';
    }

    /* --- Extrai lista de mensagens do datalist EBHTML --- */
    function parseEbhtml(rawData) {
        if (!rawData) return null;

        var lista = [];

        if (typeof rawData.count === 'function' && typeof rawData.get === 'function') {
            for (var i = 0; i < rawData.count(); i++) {
                var item = rawData.get(i);
                var texto = ler(item, 'TEXTO') || ler(item, 'MENSAGEM') || ler(item, 'TITULO') || '';
                if (!texto) continue;
                lista.push({
                    titulo: ler(item, 'TITULO') || '',
                    texto:  texto,
                    cor:    ler(item, 'COR') || ''
                });
            }
        } else {
            var texto = ler(rawData, 'TEXTO') || ler(rawData, 'MENSAGEM') || ler(rawData, 'TITULO');
            if (texto) {
                lista.push({
                    titulo: ler(rawData, 'TITULO') || '',
                    texto:  texto,
                    cor:    ler(rawData, 'COR') || ''
                });
            }
        }

        return lista.length > 0 ? lista : null;
    }

    /* --- Render de uma única mensagem --- */
    function renderItem(inner, item, config, onDone) {
        var timer = null;

        inner.innerHTML = '';
        inner.style.opacity = '0';

        var wrap = document.createElement('div');
        wrap.className = 'modulo-msg-wrap';

        // Cor de fundo somente se vier explícita no dado (campo COR)
        if (item.cor) {
            wrap.style.backgroundColor = item.cor;
            wrap.style.color = corTextoContraste(item.cor);

            // Ícone de aviso (só com destaque)
            var iconeEl = document.createElement('span');
            iconeEl.className = 'modulo-msg-icone';
            iconeEl.textContent = '!';
            wrap.appendChild(iconeEl);
        }

        // Título (se existir)
        if (item.titulo) {
            var tituloEl = document.createElement('span');
            tituloEl.className = 'modulo-msg-titulo';
            tituloEl.textContent = item.titulo;
            wrap.appendChild(tituloEl);

            var sepEl = document.createElement('span');
            sepEl.className = 'modulo-sep';
            sepEl.textContent = '—';
            wrap.appendChild(sepEl);
        }

        // Texto da mensagem
        var textoEl = document.createElement('span');
        textoEl.className = 'modulo-msg-texto';
        textoEl.textContent = item.texto;
        wrap.appendChild(textoEl);

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

    /* --- Luminância para contraste --- */
    function corTextoContraste(hex) {
        if (!hex || hex.charAt(0) !== '#') return '#000000';
        var r, g, b;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else {
            r = parseInt(hex.slice(1, 3), 16);
            g = parseInt(hex.slice(3, 5), 16);
            b = parseInt(hex.slice(5, 7), 16);
        }
        // Fórmula YIQ
        var yiq = (r * 299 + g * 587 + b * 114) / 1000;
        return yiq >= 128 ? '#000000' : '#ffffff';
    }

    /* --- Render: cicla todas as mensagens --- */
    function render(inner, dados, config, onDone) {
        var cancelaItem = null;
        var idx = 0;
        var cancelado = false;
        var fadeDuracao = (config && config.fadeDuracao) || 400;

        function proxItem() {
            if (cancelado) return;
            if (idx >= dados.length) {
                if (onDone) onDone();
                return;
            }
            var item = dados[idx];
            idx++;

            inner.style.transition = 'opacity ' + fadeDuracao + 'ms';
            inner.style.opacity = '0';
            setTimeout(function () {
                if (cancelado) return;
                cancelaItem = renderItem(inner, item, config, proxItem);
            }, fadeDuracao);
        }

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
        tipo:        'mensageria',
        label:       'Aviso',
        parseEbhtml:  parseEbhtml,
        render:       render
    };

}());
