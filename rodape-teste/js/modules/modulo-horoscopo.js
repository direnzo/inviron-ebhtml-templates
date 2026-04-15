/**
 * MÓDULO HORÓSCOPO — Rodapé Digital Signage
 * Dataset: D_HOROSCOPO (datalist)
 * ES5 puro — Android 7+
 *
 * Campos por item: SIGNO, SIGNO_ICONE (emoji, opcional), TEXTO, PERIODO
 *
 * Interface:
 *   ModuloHoroscopo.tipo        = 'horoscopo'
 *   ModuloHoroscopo.label       = 'Horóscopo'
 *   ModuloHoroscopo.render(inner, dados, config, onDone) → cancelFn
 *   ModuloHoroscopo.parseEbhtml(rawData) → dados[]
 */

var ModuloHoroscopo = (function () {

    /* Emojis de signos como fallback se SIGNO_ICONE não vier do backend */
    var EMOJI_SIGNO = {
        'ARIES':       '♈', 'ÁRIES':     '♈',
        'TOURO':       '♉',
        'GEMEOS':      '♊', 'GÊMEOS':    '♊',
        'CANCER':      '♋', 'CÂNCER':    '♋',
        'LEAO':        '♌', 'LEÃO':      '♌',
        'VIRGEM':      '♍',
        'LIBRA':       '♎',
        'ESCORPIAO':   '♏', 'ESCORPIÃO': '♏',
        'SAGITARIO':   '♐', 'SAGITÁRIO': '♐',
        'CAPRICORNIO': '♑', 'CAPRICÓRNIO': '♑',
        'AQUARIO':     '♒', 'AQUÁRIO':   '♒',
        'PEIXES':      '♓'
    };

    function ler(item, campo) {
        if (!item) return '';
        if (typeof item.value === 'function') {
            var v = item.value(campo);
            return (v && typeof v.value !== 'undefined') ? (v.value || '') : '';
        }
        if (typeof item[campo] !== 'undefined') return item[campo] || '';
        return '';
    }

    function emojiSigno(signo) {
        if (!signo) return '';
        var upper = signo.toUpperCase();
        return EMOJI_SIGNO[upper] || '';
    }

    /* --- Extrai lista de signos do datalist EBHTML --- */
    function parseEbhtml(rawData) {
        if (!rawData) return null;

        var lista = [];

        if (typeof rawData.count === 'function' && typeof rawData.get === 'function') {
            for (var i = 0; i < rawData.count(); i++) {
                var item = rawData.get(i);
                // SIGNO (genérico) ou TITLE (D_HOROSCOPO_PERSONARE_CURTO)
                var signo = ler(item, 'SIGNO') || ler(item, 'TITLE');
                if (!signo) continue;

                lista.push({
                    signo:   signo,
                    icone:   ler(item, 'SIGNO_ICONE') || emojiSigno(signo),
                    texto:   ler(item, 'TEXTO') || ler(item, 'TEXT') || ler(item, 'PREVISAO') || '',
                    periodo: ler(item, 'PERIODO') || ''
                });
            }
        } else {
            var signo = ler(rawData, 'SIGNO') || ler(rawData, 'TITLE');
            if (signo) {
                lista.push({
                    signo:   signo,
                    icone:   ler(rawData, 'SIGNO_ICONE') || emojiSigno(signo),
                    texto:   ler(rawData, 'TEXTO') || ler(rawData, 'TEXT') || ler(rawData, 'PREVISAO') || '',
                    periodo: ler(rawData, 'PERIODO') || ''
                });
            }
        }

        return lista.length > 0 ? lista : null;
    }

    /* --- Render de um único signo --- */
    function renderItem(inner, item, config, onDone) {
        var timer = null;

        inner.innerHTML = '';
        inner.style.opacity = '0';

        var wrap = document.createElement('div');
        wrap.className = 'modulo-horo-wrap';

        // Ícone/emoji do signo
        if (item.icone) {
            var iconeEl = document.createElement('span');
            iconeEl.className = 'modulo-horo-icone';
            iconeEl.textContent = item.icone;
            wrap.appendChild(iconeEl);
        }

        // Nome do signo
        var signoEl = document.createElement('span');
        signoEl.className = 'modulo-horo-signo';
        if (config && config.corDestaque) {
            signoEl.style.color = config.corDestaque;
        }
        signoEl.textContent = item.signo;
        wrap.appendChild(signoEl);

        // Separador
        var sepEl = document.createElement('span');
        sepEl.className = 'modulo-sep';
        sepEl.textContent = '—';
        wrap.appendChild(sepEl);

        // Texto da previsão
        if (item.texto) {
            var textoEl = document.createElement('span');
            textoEl.className = 'modulo-horo-texto';
            textoEl.textContent = item.texto;
            wrap.appendChild(textoEl);
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

    /* --- Render: cicla todos os signos --- */
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
        tipo:        'horoscopo',
        label:       'Horóscopo',
        parseEbhtml:  parseEbhtml,
        render:       render
    };

}());
