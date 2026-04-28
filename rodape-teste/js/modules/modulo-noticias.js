/**
 * MÓDULO NOTÍCIAS — Rodapé Digital Signage
 * Dataset: D_NOTICIAS (datalist)
 * ES5 puro — Android 7+
 *
 * Campos por item: TITULO, DESCRICAO, CATEGORIA, FONTE
 *
 * Interface:
 *   ModuloNoticias.tipo        = 'noticias'
 *   ModuloNoticias.label       = 'Notícias'
 *   ModuloNoticias.render(inner, dados, config, onDone) → cancelFn
 *   ModuloNoticias.parseEbhtml(rawData) → dados[]
 */

var ModuloNoticias = (function () {

    /* --- Mapa de cores por categoria --- */
    var COR_CATEGORIA = {
        'ESPORTE':        '#1a7a3a',
        'FUTEBOL':        '#1a7a3a',
        'POLITICA':       '#8b0000',
        'POLÍTICA':       '#8b0000',
        'ECONOMIA':       '#0d19ba',
        'TECNOLOGIA':     '#5a6b00',
        'ENTRETENIMENTO': '#8b3a00',
        'MUSICA':         '#7a7a00',
        'MÚSICA':         '#7a7a00',
        'SAUDE':          '#005a8b',
        'SAÚDE':          '#005a8b',
        'CIENCIA':        '#005a3a',
        'CIÊNCIA':        '#005a3a',
        'EDUCACAO':       '#3a005a',
        'EDUCAÇÃO':       '#3a005a'
    };

    var COR_DEFAULT = '#3a3a6a';

    function corCategoria(cat) {
        if (!cat) return COR_DEFAULT;
        var upper = cat.toUpperCase();
        return COR_CATEGORIA[upper] || COR_DEFAULT;
    }

    function ler(item, campo) {
        if (!item) return '';
        if (typeof item.value === 'function') {
            var v = item.value(campo);
            return (v && typeof v.value !== 'undefined') ? (v.value || '') : '';
        }
        if (typeof item[campo] !== 'undefined') return item[campo] || '';
        return '';
    }

    /* --- Extrai lista de notícias do datalist EBHTML --- */
    function parseEbhtml(rawData) {
        if (!rawData) return null;

        var lista = [];

        // Tenta datalist (múltiplos registros)
        if (typeof rawData.count === 'function' && typeof rawData.get === 'function') {
            for (var i = 0; i < rawData.count(); i++) {
                var item = rawData.get(i);
                // TEXTO = manchete real (D_UOL); TITULO = editoria/seção ou headline para outros datasets
                var tituloItem = ler(item, 'TEXTO') || ler(item, 'TITULO') || ler(item, 'HEADLINE') || ler(item, 'MANCHETE');
                if (!tituloItem) continue;
                var categoriaItem = ler(item, 'TITULO') || ler(item, 'CATEGORY') || ler(item, 'CATEGORIA') || ler(item, 'EDITORIA') || '';
                if (categoriaItem === tituloItem) { categoriaItem = ''; }
                lista.push({
                    titulo:    tituloItem,
                    descricao: ler(item, 'DESCRICAO') || ler(item, 'CHAMADA') || '',
                    categoria: categoriaItem,
                    fonte:     ler(item, 'FONTE') || ''
                });
            }
        } else {
            // Item único — TEXTO = manchete (D_UOL), TITULO = editoria/seção
            var titulo = ler(rawData, 'TEXTO') || ler(rawData, 'TITULO') || ler(rawData, 'HEADLINE');
            if (titulo) {
                var categoria = ler(rawData, 'TITULO') || ler(rawData, 'CATEGORY') || ler(rawData, 'CATEGORIA') || '';
                if (categoria === titulo) { categoria = ''; }
                lista.push({
                    titulo:    titulo,
                    descricao: ler(rawData, 'DESCRICAO') || '',
                    categoria: categoria,
                    fonte:     ler(rawData, 'FONTE') || ''
                });
            }
        }

        return lista.length > 0 ? lista : null;
    }

    /* --- Render de uma única notícia --- */
    function renderItem(inner, item, config, onDone) {
        var timer = null;

        inner.innerHTML = '';
        inner.style.opacity = '0';

        var wrap = document.createElement('div');
        wrap.className = 'modulo-noticias-wrap';

        // Label categoria (pill colorido)
        if (item.categoria) {
            var labelEl = document.createElement('span');
            labelEl.className = 'modulo-noticias-categoria';
            labelEl.style.backgroundColor = corCategoria(item.categoria);
            labelEl.style.color = '#ffffff';
            labelEl.textContent = item.categoria;
            wrap.appendChild(labelEl);
        }

        // Título
        var tituloEl = document.createElement('span');
        tituloEl.className = 'modulo-noticias-titulo';
        tituloEl.textContent = item.titulo;
        wrap.appendChild(tituloEl);

        // Fonte removida — não exibida no rodapé
        if (false && item.fonte) {
            var fonteEl = document.createElement('span');
            fonteEl.className = 'modulo-noticias-fonte';
            fonteEl.textContent = item.fonte;
            wrap.appendChild(fonteEl);
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

    /* --- Render: cicla todas as notícias --- */
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

        // Primeiro item sem fade out inicial
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
        tipo:        'noticias',
        label:       'Notícias',
        parseEbhtml:  parseEbhtml,
        render:       render
    };

}());
