/**
 * MÓDULO CLIMA — Rodapé Digital Signage
 * ES5 puro — Android 7+
 *
 * Datasets suportados:
 *   D_CLIMA_CLIMATEMPO  — dataset principal (JSON arrays).
 *                         Fornece: temperatura atual, ícone, descrição,
 *                         cidade/UF, e min/max do dia via nr_min_wea / nr_max_wea.
 *
 *   D_CLIMA             — dataset simplificado (campos flat).
 *                         Fornece SOMENTE: C1_D1_MIN, C1_D1_MAX, C1_D1_ICO,
 *                         C1_D1_CIDADE, C1_D1_TEXTPT.
 *                         Usado como:
 *                           a) complemento ao D_CLIMA_CLIMATEMPO (fallback min/max)
 *                           b) fonte standalone quando D_CLIMA_CLIMATEMPO não está ativo
 *
 * Interface:
 *   ModuloClima.tipo        = 'clima'
 *   ModuloClima.label       = 'Clima'
 *   ModuloClima.render(inner, dados, config, onDone) → cancelFn
 *   ModuloClima.parseEbhtml(rawDataClimatempo, rawDataClima) → dados
 *     rawDataClimatempo: item EBHTML de D_CLIMA_CLIMATEMPO (pode ser null)
 *     rawDataClima:      item EBHTML de D_CLIMA (pode ser null)
 */

var ModuloClima = (function () {

    /* -------------------------------------------------------------------
       Códigos com variante noturna disponível ({codigo}n.svg)
       Demais códigos (ex: 11) usam somente a versão diurna.
    ------------------------------------------------------------------- */
    var COM_VARIANTE_NOITE = {
        '1': true, '2': true, '3': true, '4': true, '5': true,
        '6': true, '7': true, '8': true, '9': true
    };

    function iconeArquivo(codigo, isNoite) {
        if (!codigo) codigo = '3';
        codigo = String(codigo);
        if (isNoite && COM_VARIANTE_NOITE[codigo]) {
            return codigo + 'n.svg';
        }
        return codigo + '.svg';
    }

    function parseJsonArray(valor) {
        if (!valor) return [];
        if (typeof valor === 'string') {
            try {
                var p = JSON.parse(valor);
                return (p && typeof p.length !== 'undefined') ? p : [];
            } catch (e) { return []; }
        }
        return (typeof valor.length !== 'undefined') ? valor : [];
    }

    /* --- Lê campo flat de um item EBHTML --- */
    function lerCampo(rawData, campo) {
        if (!rawData) return '';
        if (typeof rawData.value === 'function') {
            var v = rawData.value(campo);
            return (v && typeof v.value !== 'undefined') ? (v.value || '') : '';
        }
        return '';
    }

    /* -------------------------------------------------------------------
       parseEbhtml(rawDataClimatempo, rawDataClima)

       Estratégia:
         1. Tenta D_CLIMA_CLIMATEMPO (arrays JSON horários):
            - temperatura atual (nr_value_wea)
            - ícone (nr_icon_wea)
            - descrição (mm_textpt_wea)
            - cidade/UF (city.ds_name_cit / ds_state_cit)
            - min/max do dia (nr_min_wea / nr_max_wea) — dentro do array

         2. Se min/max vier vazio dos arrays (ou D_CLIMA_CLIMATEMPO não disponível),
            usa D_CLIMA como fallback:
            - C1_D1_MIN → tempMin
            - C1_D1_MAX → tempMax
            - C1_D1_ICO → iconeCodigo (se campos principais estiver vazio)
            - C1_D1_CIDADE → cidade (se campos principais estiver vazio)
            - C1_D1_TEXTPT → descrição (se vazia)
    ------------------------------------------------------------------- */
    function parseEbhtml(rawDataClimatempo, rawDataClima) {
        var resultado = {
            cidade:      '',
            estado:      '',
            temp:        '',
            tempMin:     '',
            tempMax:     '',
            descricao:   '',
            iconeCodigo: '3'
        };

        /* ---- FONTE PRIMÁRIA: D_CLIMA_CLIMATEMPO ---- */
        if (rawDataClimatempo) {
            var arr = parseJsonArray(lerCampo(rawDataClimatempo, 'C1_D1_DATAARRAY'));
            if (arr.length === 0) arr = parseJsonArray(lerCampo(rawDataClimatempo, 'C1_D2_DATAARRAY'));
            if (arr.length === 0) arr = parseJsonArray(lerCampo(rawDataClimatempo, 'C1_D3_DATAARRAY'));

            if (arr.length > 0) {
                // Pega o registro do período atual (1=manhã, 2=tarde, 3=noite)
                var agora = new Date();
                var hora = agora.getHours();
                var periodoAlvo = hora < 12 ? '1' : (hora < 18 ? '2' : '3');
                var reg = null;

                for (var i = 0; i < arr.length; i++) {
                    if (String(arr[i].nr_period_wea) === periodoAlvo) {
                        reg = arr[i];
                        break;
                    }
                }
                if (!reg) reg = arr[0];

                if (reg) {
                    resultado.temp        = reg.nr_value_wea  || '';
                    resultado.tempMin     = reg.nr_min_wea    || '';
                    resultado.tempMax     = reg.nr_max_wea    || '';
                    resultado.descricao   = reg.mm_textpt_wea || '';
                    resultado.iconeCodigo = String(reg.nr_icon_wea || '3');
                    resultado.isNoite     = (String(reg.nr_period_wea) === '3');

                    if (reg.city) {
                        resultado.cidade = reg.city.ds_name_cit  || '';
                        resultado.estado = reg.city.ds_state_cit || '';
                    }
                }
            }
        }

        /* ---- FONTE SECUNDÁRIA: D_CLIMA (campos flat) ---- */
        if (rawDataClima) {
            // Min/Max: usa D_CLIMA se vieram vazios do D_CLIMA_CLIMATEMPO
            if (resultado.tempMin === '') {
                resultado.tempMin = lerCampo(rawDataClima, 'C1_D1_MIN');
            }
            if (resultado.tempMax === '') {
                resultado.tempMax = lerCampo(rawDataClima, 'C1_D1_MAX');
            }
            // Ícone, cidade e descrição: só usa D_CLIMA se D_CLIMA_CLIMATEMPO não deu nada
            if (resultado.iconeCodigo === '3' && lerCampo(rawDataClima, 'C1_D1_ICO')) {
                resultado.iconeCodigo = lerCampo(rawDataClima, 'C1_D1_ICO') || '3';
            }
            if (resultado.cidade === '') {
                resultado.cidade = (lerCampo(rawDataClima, 'C1_D1_CIDADE') || '').trim();
            }
            if (resultado.descricao === '') {
                resultado.descricao = lerCampo(rawDataClima, 'C1_D1_TEXTPT') || '';
            }
        }

        // Retorna null se não tiver nada útil
        var temDados = resultado.temp !== '' || resultado.tempMin !== '' ||
                       resultado.tempMax !== '' || resultado.cidade !== '';
        return temDados ? resultado : null;
    }

    /* --- Render --- */
    function render(inner, dados, config, onDone) {
        var timer = null;

        // Limpa inner e insere conteúdo
        inner.innerHTML = '';
        inner.style.opacity = '0';

        var wrap = document.createElement('div');
        wrap.className = 'modulo-clima-wrap';

        // Ícone SVG animado (day/night auto-detectado)
        var iconeEl = document.createElement('img');
        iconeEl.className = 'modulo-clima-icone';
        iconeEl.src = 'img/clima/' + iconeArquivo(dados.iconeCodigo, dados.isNoite);
        iconeEl.alt = dados.descricao || 'clima';
        wrap.appendChild(iconeEl);

        // Temperatura atual
        if (dados.temp !== '') {
            var tempEl = document.createElement('span');
            tempEl.className = 'modulo-clima-temp';
            tempEl.textContent = dados.temp + '°';
            wrap.appendChild(tempEl);
        }

        // Min / Max
        if (dados.tempMin !== '' && dados.tempMax !== '') {
            var minmax = document.createElement('span');
            minmax.className = 'modulo-clima-minmax';
            minmax.textContent = dados.tempMin + '° / ' + dados.tempMax + '°';
            wrap.appendChild(minmax);
        }

        // Separador
        var sep = document.createElement('span');
        sep.className = 'modulo-sep';
        sep.textContent = '•';
        wrap.appendChild(sep);

        // Descrição
        if (dados.descricao) {
            var descEl = document.createElement('span');
            descEl.className = 'modulo-clima-desc';
            descEl.textContent = dados.descricao;
            wrap.appendChild(descEl);
        }

        // Cidade / Estado
        if (dados.cidade) {
            var sep2 = document.createElement('span');
            sep2.className = 'modulo-sep';
            sep2.textContent = '•';
            wrap.appendChild(sep2);

            var cidEl = document.createElement('span');
            cidEl.className = 'modulo-clima-cidade';
            cidEl.textContent = dados.cidade + (dados.estado ? ' - ' + dados.estado : '');
            wrap.appendChild(cidEl);
        }

        inner.appendChild(wrap);

        // Fade in
        var fadeDuracao = (config && config.fadeDuracao) || 400;
        setTimeout(function () {
            inner.style.transition = 'opacity ' + fadeDuracao + 'ms';
            inner.style.opacity = '1';
        }, 20);

        // Duração do item
        var duracao = (config && config.itemDuracao) || 6000;
        timer = setTimeout(function () {
            timer = null;
            if (onDone) onDone();
        }, duracao + fadeDuracao);

        return function cancel() {
            if (timer) { clearTimeout(timer); timer = null; }
        };
    }

    return {
        tipo:       'clima',
        label:      'Clima',
        parseEbhtml: parseEbhtml,
        render:     render
    };

}());
