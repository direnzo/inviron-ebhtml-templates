/**
 * RODAPE TESTE - EdgeContents Digital Signage
 * 
 * ATENÇÃO: Use apenas JavaScript ES5 (compatibilidade Android 7+)
 * - Não use arrow functions: () => {}
 * - Não use let/const, apenas var
 * - Não use template strings: `texto ${var}`
 */

window.onload = function() {
    // Remover opacity-0 do body imediatamente
    document.body.classList.remove('opacity-0');
    document.body.classList.add('opacity-100');
    document.body.style.opacity = '1';
    document.body.style.visibility = 'visible';
    
    var clockInterval = null;
    var finishTimeout = null;

    function iniciarTemplate(dados, config, loader) {
        var container = document.getElementById('content');
        
        if (!container) {
            if (loader) loader.finished();
            return;
        }
        
        container.innerHTML = '';

        var bar = document.createElement('div');
        bar.className = 'footer-bar';

        var logoWrap = document.createElement('div');
        logoWrap.className = 'footer-block footer-logo-block';
        var logoImg = document.createElement('img');
        logoImg.className = 'footer-logo';
        logoImg.src = dados.logoPath;
        logoImg.alt = dados.logoAlt;
        logoWrap.appendChild(logoImg);

        var climaWrap = document.createElement('div');
        climaWrap.className = 'footer-block footer-clima-block';
        var climaTexto = document.createElement('div');
        climaTexto.className = 'footer-clima-text';
        climaTexto.textContent = dados.climaTexto;
        climaWrap.appendChild(climaTexto);

        var clockWrap = document.createElement('div');
        clockWrap.className = 'footer-block footer-clock-block';
        var clockText = document.createElement('div');
        clockText.className = 'footer-clock';
        clockText.setAttribute('id', 'clock');
        clockWrap.appendChild(clockText);

        bar.appendChild(logoWrap);
        bar.appendChild(criarDivider());
        bar.appendChild(climaWrap);
        bar.appendChild(criarDivider());
        bar.appendChild(clockWrap);

        container.appendChild(bar);
        document.body.classList.add('opacity-100');

        if (loader) {
            loader.loaded();
        }

        atualizarRelogio(clockText);
        clockInterval = setInterval(function() {
            atualizarRelogio(clockText);
        }, 1000);

        finishTimeout = setTimeout(function() {
            finalizarTemplate(loader);
        }, config.duration);
    }

    function finalizarTemplate(loader) {
        if (clockInterval) {
            clearInterval(clockInterval);
            clockInterval = null;
        }

        if (finishTimeout) {
            clearTimeout(finishTimeout);
            finishTimeout = null;
        }

        document.body.classList.remove('opacity-100');
        document.body.classList.add('opacity-0');

        setTimeout(function() {
            if (loader) {
                loader.finished();
            }
        }, 1000);
    }

    function criarDivider() {
        var div = document.createElement('div');
        div.className = 'footer-divider';
        return div;
    }

    function atualizarRelogio(el) {
        if (!el) return;
        var agora = new Date();
        var horas = agora.getHours();
        var minutos = agora.getMinutes();

        if (horas < 10) horas = '0' + horas;
        if (minutos < 10) minutos = '0' + minutos;

        el.textContent = horas + ':' + minutos;
    }

    function formatarTemperatura(valor) {
        if (valor === undefined || valor === null || valor === '') {
            return '--';
        }
        return valor + '°';
    }

    function montarClimaTexto(clima) {
        var partes = [];
        var cidade = clima.cidade;
        if (cidade) {
            if (clima.estado) {
                cidade = cidade + ' - ' + clima.estado;
            }
            partes.push(cidade);
        }

        if (clima.temp !== '') {
            partes.push(formatarTemperatura(clima.temp));
        }

        if (clima.descricao) {
            partes.push(clima.descricao);
        }

        if (partes.length === 0) {
            return 'Sem dados de clima';
        }

        return partes.join(' • ');
    }

    function obterCampo(item, campo) {
        if (!item) return '';

        if (typeof item.value === 'function') {
            var valorObj = item.value(campo);
            if (valorObj && typeof valorObj.value !== 'undefined') {
                return valorObj.value;
            }
        }

        if (typeof item[campo] !== 'undefined') {
            return item[campo];
        }

        return '';
    }

    function parseJsonArray(valor) {
        if (!valor) return [];

        if (typeof valor === 'string') {
            try {
                var parsed = JSON.parse(valor);
                if (parsed && typeof parsed.length !== 'undefined') {
                    return parsed;
                }
            } catch (e) {
                return [];
            }
        }

        if (typeof valor.length !== 'undefined') {
            return valor;
        }

        return [];
    }

    function extrairClima(item) {
        var clima = {
            cidade: '',
            estado: '',
            descricao: '',
            temp: '',
            tempMin: '',
            tempMax: ''
        };

        var dataArray = obterCampo(item, 'C1_D1_DATAARRAY');
        var lista = parseJsonArray(dataArray);

        if (lista.length === 0) {
            dataArray = obterCampo(item, 'C1_D2_DATAARRAY');
            lista = parseJsonArray(dataArray);
        }

        if (lista.length === 0) {
            dataArray = obterCampo(item, 'C1_D3_DATAARRAY');
            lista = parseJsonArray(dataArray);
        }

        var registro = lista.length > 0 ? lista[0] : null;

        if (registro) {
            clima.descricao = registro.mm_textpt_wea || '';
            clima.temp = registro.nr_value_wea || '';
            clima.tempMin = registro.nr_min_wea || '';
            clima.tempMax = registro.nr_max_wea || '';

            if (registro.city) {
                clima.cidade = registro.city.ds_name_cit || '';
                clima.estado = registro.city.ds_state_cit || '';
            }
        }

        if (!clima.cidade) {
            var destino = obterCampo(item, 'DEST_CIDID');
            clima.cidade = destino || '';
        }

        return clima;
    }

    function prepararDadosBase(clima, config) {
        return {
            climaTexto: montarClimaTexto(clima),
            logoPath: config.logoPath || 'img/logo.png',
            logoAlt: config.logoAlt || 'Logo'
        };
    }

    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        console.log('=== MODO DESENVOLVIMENTO ===');

        var mockConfig = {
            duration: MOCK_DATA.config.duration || 15000,
            logoPath: MOCK_DATA.config.logoPath || 'img/logo.png',
            logoAlt: MOCK_DATA.config.logoAlt || 'Logo'
        };

        var mockLoader = {
            loaded: function() {
                // Mock loader loaded
            },
            finished: function() {
                // Mock loader finished
            }
        };

        var mockClima = extrairClima(MOCK_DATA.clima || {});
        var dadosMock = prepararDadosBase(mockClima, mockConfig);

        iniciarTemplate(dadosMock, mockConfig, mockLoader);

    } else {
        ebhtml.create2({}, function(loader) {
            loader.addData('D_CLIMA_CLIMATEMPO', false);
            loader.autoloaded = false;
            loader.nodataiserror = false;

            loader.load(function() {
                var climaItem = loader.data('D_CLIMA_CLIMATEMPO');
                
                var clima = extrairClima(climaItem || {});

                var config = {
                    duration: 15000,
                    logoPath: 'img/logo.png',
                    logoAlt: 'Logo'
                };

                try {
                    var durationData = obterCampo(climaItem, 'DURATION');
                    if (durationData) {
                        config.duration = parseInt(durationData, 10);
                    }
                } catch (e) {
                    // Usar duration padrão
                }

                var dados = prepararDadosBase(clima, config);
                iniciarTemplate(dados, config, loader);
            }, function(erro) {
                // Render com dados vazios mesmo em erro
                var clima = {
                    cidade: 'Dados indisponíveis',
                    estado: '',
                    descricao: 'Erro ao carregar clima',
                    temp: '',
                    tempMin: '',
                    tempMax: ''
                };
                
                var config = {
                    duration: 15000,
                    logoPath: 'img/logo.png',
                    logoAlt: 'Logo'
                };
                
                var dados = prepararDadosBase(clima, config);
                iniciarTemplate(dados, config, loader);
            });
        });
    }
};
