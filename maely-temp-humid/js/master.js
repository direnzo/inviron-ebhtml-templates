/**
 * maely-temp-humid - master.js
 * Template para exibicao de temperatura e umidade do ar.
 *
 * Fonte de dados: GET /INFO/WEATHER (JSON)
 * {"humidity":31,"temperature":15,"updateTime":"..."}
 * {"error":"Temperatura fora do intervalo","updateTime":"..."}
 *
 * ATENCAO: ES5 obrigatorio (Android 7+ / WebKit legado)
 */

window.onload = function() {

    var slideTemp  = document.getElementById('slide-temp');
    var slideHumid = document.getElementById('slide-humid');
    var errorState = document.getElementById('error-state');

    /**
     * Formata temperatura para exibicao com 1 decimal.
     */
    function formatarTemp(val) {
        var num = parseFloat(val);
        if (isNaN(num)) return '--.-';
        return num.toFixed(1);
    }

    /**
     * Preenche os valores nos elementos do DOM.
     * Retorna false se dados contem erro.
     */
    function preencherDados(dados) {
        if (dados && dados.error) {
            return false;
        }
        document.getElementById('temp-value').innerHTML  = formatarTemp(dados.temperature);
        document.getElementById('humid-value').innerHTML = String(parseInt(dados.humidity, 10));
        return true;
    }

    /**
     * Exibe estado de erro (sem chamar loader.loaded).
     */
    function mostrarErro(loader, config) {
        errorState.style.display = 'flex';
        document.body.classList.remove('opacity-0');
        document.body.classList.add('opacity-100');

        setTimeout(function() {
            document.body.classList.remove('opacity-100');
            document.body.classList.add('opacity-0');
            setTimeout(function() {
                if (loader) loader.finished();
            }, 700);
        }, config.duration);
    }

    /**
     * Sequencia de slides:
     *   1. Fade in corpo
     *   2. Slide Temperatura visivel por slideTime
     *   3. Cross-fade para Slide Umidade por slideTime
     *   4. Fade out corpo -> loader.finished()
     */
    function exibirSlides(config, loader) {
        // Fade in do corpo
        document.body.classList.remove('opacity-0');
        document.body.classList.add('opacity-100');

        // Mostra slide de temperatura
        slideTemp.classList.remove('opacity-0');
        slideTemp.classList.add('opacity-100');

        if (loader) loader.loaded();

        // Apos slideTime, troca para umidade
        setTimeout(function() {
            slideTemp.classList.remove('opacity-100');
            slideTemp.classList.add('opacity-0');

            setTimeout(function() {
                slideHumid.classList.remove('opacity-0');
                slideHumid.classList.add('opacity-100');

                // Apos slideTime, fade out geral e finaliza
                setTimeout(function() {
                    document.body.classList.remove('opacity-100');
                    document.body.classList.add('opacity-0');

                    setTimeout(function() {
                        if (loader) loader.finished();
                    }, 700);
                }, config.slideTime);

            }, 500); // aguarda fade out do slide temp

        }, config.slideTime);
    }

    /**
     * Busca dados de temperatura e umidade via XHR.
     * Callback: function(err, dados)
     */
    function buscarWeather(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/INFO/WEATHER', true);
        xhr.timeout = 8000;

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        var dados = JSON.parse(xhr.responseText);
                        callback(null, dados);
                    } catch (e) {
                        callback(new Error('JSON invalido'), null);
                    }
                } else {
                    callback(new Error('HTTP ' + xhr.status), null);
                }
            }
        };

        xhr.ontimeout = function() {
            callback(new Error('Timeout ao buscar /INFO/WEATHER'), null);
        };

        xhr.send();
    }

    /**
     * Inicializa o template com os dados recebidos.
     */
    function iniciarTemplate(dados, config, loader) {
        var sucesso = preencherDados(dados);

        if (!sucesso) {
            console.warn('[maely-temp-humid] Erro nos dados: ' + (dados ? dados.error : 'null'));
            mostrarErro(loader, config);
            return;
        }

        exibirSlides(config, loader);
    }

    // ========================================
    // DETECCAO DE MODO: MOCK vs PRODUCAO
    // ========================================

    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        console.log('[maely-temp-humid] Modo desenvolvimento - mock ativo');

        var mockLoader = {
            loaded:   function() { console.log('[Mock] loaded'); },
            finished: function() { console.log('[Mock] finished'); }
        };

        var mockConfig = {
            duration:  MOCK_DATA.config.duration  || 12000,
            slideTime: MOCK_DATA.config.slideTime || 5000
        };

        iniciarTemplate(MOCK_DATA.weather, mockConfig, mockLoader);

    } else {
        ebhtml.create2({}, function(loader) {
            loader.autoloaded    = false;
            loader.nodataiserror = false;

            loader.load(function() {
                var prodConfig = { duration: 12000, slideTime: 5000 };

                buscarWeather(function(err, dados) {
                    if (err || !dados) {
                        console.error('[maely-temp-humid] Falha ao buscar dados: ' + (err ? err.message : 'sem dados'));
                        loader.finished();
                        return;
                    }
                    iniciarTemplate(dados, prodConfig, loader);
                });
            });
        });
    }

};
