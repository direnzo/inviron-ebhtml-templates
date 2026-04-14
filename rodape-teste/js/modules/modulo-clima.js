/**
 * MÓDULO CLIMA — Rodapé Digital Signage
 * Dataset: D_CLIMA_CLIMATEMPO
 * ES5 puro — Android 7+
 *
 * Interface:
 *   ModuloClima.tipo        = 'clima'
 *   ModuloClima.label       = 'Clima'
 *   ModuloClima.render(inner, dados, config, onDone) → cancelFn
 *   ModuloClima.parseEbhtml(rawData) → dados
 */

var ModuloClima = (function () {

    /* --- Mapa de ícones: nr_icon_wea → arquivo PNG em img/clima/ --- */
    var ICONE_MAP = {
        '1':  'icon-1.png',   // Céu limpo (dia)
        '2':  'icon-2.png',   // Poucas nuvens
        '3':  'icon-3.png',   // Parcialmente nublado
        '4':  'icon-4.png',   // Nublado
        '5':  'icon-5.png',   // Nublado com chuva leve
        '6':  'icon-6.png',   // Chuva
        '7':  'icon-7.png',   // Chuva forte
        '8':  'icon-8.png',   // Chuva com raios
        '9':  'icon-9.png',   // Neve
        '10': 'icon-10.png',  // Neblina
        '11': 'icon-11.png',  // Céu limpo (noite)
        '12': 'icon-12.png',  // Nuvens (noite)
        '13': 'icon-13.png',  // Nublado (noite)
        '14': 'icon-14.png',  // Chuva leve (noite)
        '15': 'icon-15.png'   // Chuva (noite)
    };

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

    /* --- Extrai dados de clima a partir do item EBHTML --- */
    function parseEbhtml(rawData) {
        if (!rawData) return null;

        function ler(campo) {
            if (typeof rawData.value === 'function') {
                var v = rawData.value(campo);
                return (v && typeof v.value !== 'undefined') ? v.value : '';
            }
            return '';
        }

        var arr = parseJsonArray(ler('C1_D1_DATAARRAY'));
        if (arr.length === 0) arr = parseJsonArray(ler('C1_D2_DATAARRAY'));
        if (arr.length === 0) arr = parseJsonArray(ler('C1_D3_DATAARRAY'));

        // Prefere o registro do período atual (period_wea: 1=manhã, 2=tarde, 3=noite)
        // Usa o primeiro disponível se não houver correspondência
        var reg = null;
        var agora = new Date();
        var hora = agora.getHours();
        var periodoAlvo = hora < 12 ? '1' : (hora < 18 ? '2' : '3');

        for (var i = 0; i < arr.length; i++) {
            if (String(arr[i].nr_period_wea) === periodoAlvo) {
                reg = arr[i];
                break;
            }
        }
        if (!reg && arr.length > 0) reg = arr[0];
        if (!reg) return null;

        return {
            cidade:    (reg.city && reg.city.ds_name_cit) ? reg.city.ds_name_cit : '',
            estado:    (reg.city && reg.city.ds_state_cit) ? reg.city.ds_state_cit : '',
            temp:      reg.nr_value_wea || '',
            tempMin:   reg.nr_min_wea   || '',
            tempMax:   reg.nr_max_wea   || '',
            descricao: reg.mm_textpt_wea || '',
            iconeCodigo: String(reg.nr_icon_wea || '3')
        };
    }

    /* --- Render --- */
    function render(inner, dados, config, onDone) {
        var timer = null;

        // Limpa inner e insere conteúdo
        inner.innerHTML = '';
        inner.style.opacity = '0';

        var wrap = document.createElement('div');
        wrap.className = 'modulo-clima-wrap';

        // Ícone
        var iconeFile = ICONE_MAP[dados.iconeCodigo] || ICONE_MAP['3'];
        var iconeEl = document.createElement('img');
        iconeEl.className = 'modulo-clima-icone';
        iconeEl.src = 'img/clima/' + iconeFile;
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
