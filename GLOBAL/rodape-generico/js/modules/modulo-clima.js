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
    function codigoClimaComPeriodo(codigo, isNoite) {
        var base = String(codigo || '3');
        if (isNoite && typeof METEOCONS_MAP !== 'undefined' && METEOCONS_MAP[base + 'n']) {
            return base + 'n';
        }
        return base;
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
            var valor = (v && typeof v.value !== 'undefined') ? (v.value || '') : '';
            if (valor && valor.charAt(0) === '[' && valor.charAt(valor.length - 1) === ']') {
                return '';
            }
            return valor;
        }
        return '';
    }

    function textoClimaParaMeteocon(texto, isNoite) {
        if (!texto) return '';
        var t = String(texto).toLowerCase();

        if (t.indexOf('trovo') >= 0 || t.indexOf('tempest') >= 0 || t.indexOf('raio') >= 0) {
            return isNoite ? 'thunderstorms-night' : 'thunderstorms';
        }
        if (t.indexOf('garoa') >= 0 || t.indexOf('chuva') >= 0 || t.indexOf('pancada') >= 0 || t.indexOf('chuv') >= 0) {
            return isNoite ? 'extreme-night-rain' : 'extreme-rain';
        }
        if (t.indexOf('nebl') >= 0 || t.indexOf('névo') >= 0 || t.indexOf('nuvem baixa') >= 0) {
            return 'fog';
        }
        if (t.indexOf('nublado') >= 0 || t.indexOf('encoberto') >= 0 || t.indexOf('muitas nuvens') >= 0) {
            return 'cloudy';
        }
        if (t.indexOf('parcial') >= 0 || t.indexOf('algumas nuvens') >= 0 || t.indexOf('sol entre nuvens') >= 0) {
            return isNoite ? 'partly-cloudy-night' : 'partly-cloudy-day';
        }
        if (t.indexOf('limpo') >= 0 || t.indexOf('aberto') >= 0 || t.indexOf('ensolar') >= 0 || t.indexOf('sol') >= 0) {
            return isNoite ? 'clear-night' : 'clear-day';
        }

        return '';
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
            temp:        '',
            tempMin:     '',
            tempMax:     '',
            descricao:   '',
            cidade:      '',
            umidade:     '',
            vento:       '',
            condicaoIcone: '',
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
                    resultado.temp        = reg.nr_value_wea      || '';
                    resultado.tempMin     = reg.nr_min_wea        || '';
                    resultado.tempMax     = reg.nr_max_wea        || '';
                    resultado.descricao   = reg.mm_textpt_wea     || '';
                    resultado.condicaoIcone = reg.mm_textpt_wea   || '';
                    resultado.umidade     = reg.nr_humidity_wea   || '';
                    resultado.vento       = reg.nr_wind_vel_wea   || '';
                    resultado.iconeCodigo = String(reg.nr_icon_wea || '3');
                    resultado.isNoite     = (String(reg.nr_period_wea) === '3');

                    if (reg.city && reg.city.ds_name_cit) {
                        resultado.cidade = reg.city.ds_name_cit;
                    }
                }
            } else {
                // Fallback: D_CLIMA_CLIMATEMPO_MOMENTO (campos flat — sem arrays JSON)
                // min/max do dia virão do dataset secundário D_CLIMA (C1_D1_MIN / C1_D1_MAX)
                var tempFlat = lerCampo(rawDataClimatempo, 'C1_MIN');
                if (tempFlat) {
                    var horaAtual = new Date().getHours();
                    resultado.temp        = tempFlat;
                    resultado.iconeCodigo = lerCampo(rawDataClimatempo, 'C1_ICO')             || '3';
                    resultado.descricao   = lerCampo(rawDataClimatempo, 'C1_TEXTMIN')         || '';
                    resultado.condicaoIcone = lerCampo(rawDataClimatempo, 'C1_TEXTMIN')       || '';
                    resultado.umidade     = lerCampo(rawDataClimatempo, 'C1_HUMIDITYMIN')     || '';
                    resultado.vento       = lerCampo(rawDataClimatempo, 'C1_WINDAVGVELOCITY') || '';
                    resultado.cidade      = lerCampo(rawDataClimatempo, 'C1_CITY')            || '';
                    resultado.isNoite     = horaAtual >= 18 || horaAtual < 6;
                }
            }
        }

        /* ---- FONTE SECUNDÁRIA: D_CLIMA (campos flat) ---- */
        if (rawDataClima) {
            if (resultado.tempMin === '') {
                resultado.tempMin = lerCampo(rawDataClima, 'C1_D1_MIN');
            }
            if (resultado.tempMax === '') {
                resultado.tempMax = lerCampo(rawDataClima, 'C1_D1_MAX');
            }
            if (resultado.iconeCodigo === '3' && lerCampo(rawDataClima, 'C1_D1_ICO')) {
                resultado.iconeCodigo = lerCampo(rawDataClima, 'C1_D1_ICO') || '3';
            }
            if (resultado.descricao === '') {
                resultado.descricao = lerCampo(rawDataClima, 'C1_D1_TEXTPT') || '';
            }
            if (resultado.condicaoIcone === '') {
                resultado.condicaoIcone = lerCampo(rawDataClima, 'C1_D1_TEXTPT') || '';
            }
            if (resultado.cidade === '') {
                resultado.cidade = lerCampo(rawDataClima, 'C1_D1_CIDADE') || '';
            }
        }

        // Retorna null se não tiver nada útil
        var temDados = resultado.temp !== '' || resultado.tempMin !== '' || resultado.tempMax !== '';
        return temDados ? resultado : null;
    }

    /* --- Render --- */
    function render(inner, dados, config, onDone) {
        var timer = null;
        var cancelado = false;

        // Limpa inner e insere conteúdo
        inner.innerHTML = '';

        var wrap = document.createElement('div');
        wrap.className = 'modulo-clima-wrap';

        // Container do ícone — SVG será injetado inline via XHR
        var iconeContainer = document.createElement('span');
        iconeContainer.className = 'modulo-clima-icone';
        wrap.appendChild(iconeContainer);

        if (typeof injetarMeteocon === 'function') {
            var codigoPeriodo = codigoClimaComPeriodo(dados.iconeCodigo, dados.isNoite);
            var nomeIcone = textoClimaParaMeteocon(dados.condicaoIcone, dados.isNoite);
            if (!nomeIcone) {
                nomeIcone = climaToMeteocon(codigoPeriodo);
            }
            var corIcone = (typeof CONFIG_CLIMA !== 'undefined' && CONFIG_CLIMA.iconColor)
                ? CONFIG_CLIMA.iconColor
                : ((config && config.corTexto) || '#ffffff');
            injetarMeteocon(iconeContainer, nomeIcone, corIcone);
        }

        // Temperatura atual
        if (dados.temp !== '') {
            var tempEl = document.createElement('span');
            tempEl.className = 'modulo-clima-temp';
            tempEl.textContent = dados.temp + '°';
            wrap.appendChild(tempEl);
        }

        // Cidade em linha
        if (dados.cidade) {
            var sepCidade = document.createElement('span');
            sepCidade.className = 'modulo-sep';
            sepCidade.textContent = '•';
            wrap.appendChild(sepCidade);

            var cidadeEl = document.createElement('span');
            cidadeEl.className = 'modulo-clima-cidade';
            cidadeEl.textContent = dados.cidade;
            wrap.appendChild(cidadeEl);
        }

        // Condição textual (ex.: Parcialmente nublado) recebida em C1_TEXTMIN/C1_D1_TEXTPT
        if (dados.condicaoIcone) {
            var sepCond = document.createElement('span');
            sepCond.className = 'modulo-sep';
            sepCond.textContent = '•';
            wrap.appendChild(sepCond);

            var condEl = document.createElement('span');
            condEl.className = 'modulo-clima-condicao';
            condEl.textContent = dados.condicaoIcone;
            wrap.appendChild(condEl);
        }

        // Regra de negócio atual: exibir somente temperatura, umidade e vento.

        // Umidade
        if (dados.umidade) {
            var sep2 = document.createElement('span');
            sep2.className = 'modulo-sep';
            sep2.textContent = '•';
            wrap.appendChild(sep2);

            if (config && config.clima && config.clima.usarIconesAuxiliares && typeof injetarMeteocon === 'function') {
                var umidIcone = document.createElement('span');
                umidIcone.className = 'modulo-clima-icone-info';
                wrap.appendChild(umidIcone);
                var corAux = (typeof CONFIG_CLIMA !== 'undefined' && CONFIG_CLIMA.iconColor)
                    ? CONFIG_CLIMA.iconColor
                    : ((config && config.corTexto) || '#ffffff');
                injetarMeteocon(umidIcone, (config.clima.iconeUmidade || 'humidity'), corAux);
            }

            var umidEl = document.createElement('span');
            umidEl.className = 'modulo-clima-umidade';
            umidEl.textContent = dados.umidade + '%';
            wrap.appendChild(umidEl);
        }

        // Vento
        if (dados.vento) {
            var sep3 = document.createElement('span');
            sep3.className = 'modulo-sep';
            sep3.textContent = '•';
            wrap.appendChild(sep3);

            if (config && config.clima && config.clima.usarIconesAuxiliares && typeof injetarMeteocon === 'function') {
                var ventoIcone = document.createElement('span');
                ventoIcone.className = 'modulo-clima-icone-info';
                wrap.appendChild(ventoIcone);
                var nomeIconeVento = typeof ventoVelocidadeParaIcone === 'function'
                    ? ventoVelocidadeParaIcone(dados.vento)
                    : 'wind';
                var corAuxVento = (typeof CONFIG_CLIMA !== 'undefined' && CONFIG_CLIMA.iconColor)
                    ? CONFIG_CLIMA.iconColor
                    : ((config && config.corTexto) || '#ffffff');
                injetarMeteocon(ventoIcone, nomeIconeVento, corAuxVento);
            }

            var ventoEl = document.createElement('span');
            ventoEl.className = 'modulo-clima-vento';
            ventoEl.textContent = dados.vento + ' km/h';
            wrap.appendChild(ventoEl);
        }

        inner.appendChild(wrap);

        // Entrada: de baixo para o centro, com fade-in
        var transDuracao = (config && config.fadeDuracao) || 400;
        animarEntrada(inner, transDuracao);

        // Duração do item
        var duracao = (config && config.itemDuracao) || 6000;
        timer = setTimeout(function () {
            timer = null;
            if (cancelado) return;
            // Saída: do centro para cima, com fade-out
            animarSaida(inner, transDuracao, onDone);
        }, duracao);

        return function cancel() {
            cancelado = true;
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
