/**
 * MÓDULO PLACAR FUTEBOL — Rodapé Digital Signage
 * Dataset: D_PLACAR_FUTEBOL (datalist)
 * ES5 puro — Android 7+
 *
 * Campos por item: TIME_CASA, PLACAR_CASA, PLACAR_VISITANTE, TIME_VISITANTE,
 *                  STATUS (ao vivo | encerrado | etc.), CAMPEONATO
 *
 * Interface:
 *   ModuloPlacar.tipo        = 'placar'
 *   ModuloPlacar.label       = 'Placar'
 *   ModuloPlacar.render(inner, dados, config, onDone) → cancelFn
 *   ModuloPlacar.parseEbhtml(rawData) → dados[]
 */

var ModuloPlacar = (function () {

    function ler(item, campo) {
        if (!item) return '';
        if (typeof item.value === 'function') {
            var v = item.value(campo);
            return (v && typeof v.value !== 'undefined') ? (v.value || '') : '';
        }
        if (typeof item[campo] !== 'undefined') return item[campo] || '';
        return '';
    }

    /* --- Extrai lista de jogos do datalist EBHTML --- */
    function parseEbhtml(rawData) {
        if (!rawData) return null;

        var lista = [];

        if (typeof rawData.count === 'function' && typeof rawData.get === 'function') {
            for (var i = 0; i < rawData.count(); i++) {
                var item = rawData.get(i);
                // TIME_CASA (dataset genérico) ou TITULO (D_FOOTBALL)
                var timeCasa = ler(item, 'TIME_CASA') || ler(item, 'TITULO');
                if (!timeCasa) continue;

                lista.push({
                    timeCasa:    timeCasa,
                    placarCasa:  ler(item, 'PLACAR_CASA') || '',
                    placarVisit: ler(item, 'PLACAR_VISITANTE') || '',
                    timeVisit:   ler(item, 'TIME_VISITANTE') || ler(item, 'TITULO2') || '',
                    status:      ler(item, 'STATUS') || ler(item, 'SUBTITULO3') || '',
                    campeonato:  ler(item, 'CAMPEONATO') || ler(item, 'SUBTITULO2') || ler(item, 'CATEGORY') || ''
                });
            }
        } else {
            var timeCasa = ler(rawData, 'TIME_CASA') || ler(rawData, 'TITULO');
            if (timeCasa) {
                lista.push({
                    timeCasa:    timeCasa,
                    placarCasa:  ler(rawData, 'PLACAR_CASA') || '',
                    placarVisit: ler(rawData, 'PLACAR_VISITANTE') || '',
                    timeVisit:   ler(rawData, 'TIME_VISITANTE') || ler(rawData, 'TITULO2') || '',
                    status:      ler(rawData, 'STATUS') || ler(rawData, 'SUBTITULO3') || '',
                    campeonato:  ler(rawData, 'CAMPEONATO') || ler(rawData, 'SUBTITULO2') || ler(rawData, 'CATEGORY') || ''
                });
            }
        }

        return lista.length > 0 ? lista : null;
    }

    /* --- Render de um único jogo --- */
    function renderItem(inner, item, config, onDone) {
        var timer = null;

        inner.innerHTML = '';
        inner.style.opacity = '0';

        var wrap = document.createElement('div');
        wrap.className = 'modulo-placar-wrap';

        // Time casa
        var casaEl = document.createElement('span');
        casaEl.className = 'modulo-placar-time';
        casaEl.textContent = item.timeCasa;
        wrap.appendChild(casaEl);

        // Placar
        var placarEl = document.createElement('span');
        placarEl.className = 'modulo-placar-score';
        var pc = item.placarCasa  !== '' ? item.placarCasa  : '-';
        var pv = item.placarVisit !== '' ? item.placarVisit : '-';
        placarEl.textContent = pc + ' x ' + pv;
        if (config && config.corDestaque) {
            placarEl.style.color = config.corDestaque;
        }
        wrap.appendChild(placarEl);

        // Time visitante
        var visitEl = document.createElement('span');
        visitEl.className = 'modulo-placar-time';
        visitEl.textContent = item.timeVisit;
        wrap.appendChild(visitEl);

        // Status (ao vivo, encerrado etc.)
        if (item.status) {
            var statusEl = document.createElement('span');
            statusEl.className = 'modulo-placar-status';
            statusEl.textContent = item.status;
            wrap.appendChild(statusEl);
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

    /* --- Render: cicla todos os jogos --- */
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
        tipo:        'placar',
        label:       'Placar',
        parseEbhtml:  parseEbhtml,
        render:       render
    };

}());
