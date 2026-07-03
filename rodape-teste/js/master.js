/**
 * RODAPE MASTER — Orquestrador do template de rodapé
 * EdgeContents Digital Signage — ES5 puro (Android 7+)
 *
 * Fluxo:
 *  1. Aplica CONFIG (cores, posição, visibilidade)
 *  2. Carrega logo, inicia relógio
 *  3. Registra módulos disponíveis
 *  4. No modo EdgeContents: carrega datasets dos canais ativos
 *  5. Inicia engine de slideshow: canal → sub-itens → próximo canal → loop
 */

window.onload = function () {

    /* =====================================================
       MÓDULOS REGISTRADOS
       Cada módulo exporta um objeto com .tipo e .render()
       ===================================================== */
    var MODULOS = [
        typeof ModuloClima      !== 'undefined' ? ModuloClima      : null,
        typeof ModuloFinanceiro !== 'undefined' ? ModuloFinanceiro  : null,
        typeof ModuloNoticias   !== 'undefined' ? ModuloNoticias    : null,
        typeof ModuloMensageria !== 'undefined' ? ModuloMensageria  : null,
        typeof ModuloPlacar     !== 'undefined' ? ModuloPlacar      : null,
        typeof ModuloHoroscopo  !== 'undefined' ? ModuloHoroscopo   : null
    ];

    /* =====================================================
       ESTADO GLOBAL
       ===================================================== */
    var clockInterval = null;
    var slideshowCancelFn = null;
    var bootVisual = {
        logoPronto: false,
        relogioIconePronto: false,
        relogioHoraPronta: false,
        bodyLiberado: false
    };

    function liberarBodyQuandoPronto() {
        if (bootVisual.bodyLiberado) return;
        if (!bootVisual.logoPronto || !bootVisual.relogioIconePronto || !bootVisual.relogioHoraPronta) return;

        var body = document.body;
        if (!body) return;

        body.classList.remove('opacity-0');
        body.classList.add('opacity-100');
        body.style.opacity = '1';
        bootVisual.bodyLiberado = true;
    }

    function marcarLogoPronto() {
        bootVisual.logoPronto = true;
        liberarBodyQuandoPronto();
    }

    function marcarIconeRelogioPronto() {
        bootVisual.relogioIconePronto = true;
        liberarBodyQuandoPronto();
    }

    function marcarHoraRelogioPronta() {
        bootVisual.relogioHoraPronta = true;
        liberarBodyQuandoPronto();
    }

    function isSvgPath(path) {
        if (!path) return false;
        return /\.svg([?#].*)?$/i.test(String(path));
    }

    function aplicarLogo() {
        var logoBox = document.getElementById('logo-box');
        var logoImg = document.getElementById('logo-img');
        if (!logoBox || !logoImg) {
            marcarLogoPronto();
            return;
        }

        var path = CONFIG && CONFIG.logoPath ? CONFIG.logoPath : '';
        var alt = CONFIG && CONFIG.logoAlt ? CONFIG.logoAlt : 'Logo';

        logoImg.style.display = 'none';
        logoImg.src = '';
        logoImg.alt = alt;
        logoBox.innerHTML = '';
        logoBox.setAttribute('aria-label', alt);

        if (!path) {
            marcarLogoPronto();
            return;
        }

        if (!isSvgPath(path)) {
            logoImg.style.display = 'block';
            logoImg.src = path;
            logoImg.alt = alt;
            logoBox.appendChild(logoImg);
            marcarLogoPronto();
            return;
        }

        // Primeiro frame imediato: exibe o arquivo SVG como imagem normal,
        // depois substitui por SVG inline para manter consistência.
        logoImg.style.display = 'block';
        logoImg.src = path;
        logoImg.alt = alt;
        logoBox.appendChild(logoImg);
        marcarLogoPronto();

        var xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;

            if (xhr.status === 200 || xhr.status === 0) {
                logoBox.innerHTML = xhr.responseText;

                var svg = logoBox.querySelector('svg');
                if (!svg) {
                    logoImg.style.display = 'block';
                    logoImg.src = path;
                    logoImg.alt = alt;
                    logoBox.innerHTML = '';
                    logoBox.appendChild(logoImg);
                    return;
                }

                svg.style.width = '100%';
                svg.style.height = '100%';
                svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                svg.setAttribute('role', 'img');
                svg.setAttribute('aria-label', alt);
            } else {
                logoImg.style.display = 'block';
                logoImg.src = path;
                logoImg.alt = alt;
                logoBox.innerHTML = '';
                logoBox.appendChild(logoImg);
            }
        };
        xhr.send();
    }

    /* =====================================================
       APLICAR CONFIGURAÇÃO VISUAL
       ===================================================== */
    function aplicarConfig() {
        var bar = document.getElementById('rodape-bar');
        if (!bar) return;

        bar.style.backgroundColor = CONFIG.corFundo;
        bar.style.color = CONFIG.corTexto;

        var dividers = document.querySelectorAll('.rodape-divider');
        for (var i = 0; i < dividers.length; i++) {
            dividers[i].style.backgroundColor = CONFIG.corDivisor;
        }

        var colLogo  = document.getElementById('col-logo');
        var div1     = document.getElementById('divider-1');
        var colClock = document.getElementById('col-clock');
        var div2     = document.getElementById('divider-2');
        var colContent = document.getElementById('col-content');

        // Posição logo
        if (CONFIG.logoPosicao === 'oculto') {
            colLogo.style.display = 'none';
            div1.style.display = 'none';
        } else if (CONFIG.logoPosicao === 'direita') {
            colLogo.style.order   = '5';
            div1.style.order      = '4';
            colContent.style.order = '3';
            div2.style.order      = '2';
            colClock.style.order  = '1';
        } else {
            // esquerda (padrão)
            colLogo.style.order   = '1';
            div1.style.order      = '2';
            colContent.style.order = '3';
            div2.style.order      = '4';
            colClock.style.order  = '5';
        }

        // Posição relógio (só ajusta quando lógica de logo já definiu content/clock)
        if (CONFIG.relogioPosicao === 'oculto') {
            colClock.style.display = 'none';
            div2.style.display = 'none';
        } else if (CONFIG.relogioPosicao === 'esquerda' &&
                   CONFIG.logoPosicao !== 'direita') {
            colClock.style.order   = '1';
            div2.style.order       = '2';
            colContent.style.order = '3';
            div1.style.order       = '4';
            colLogo.style.order    = '5';
        }

        // Conteúdo
        if (!CONFIG.conteudoVisivel) {
            colContent.style.display = 'none';
        }

        // Logo src/alt (suporta SVG inline e fallback para imagem padrão)
        aplicarLogo();
    }

    /* =====================================================
       RELÓGIO
       ===================================================== */
    var DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    var MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    function aplicarCorSvgMonocromatico(svg, cor) {
        if (!svg || !cor) return;

        svg.style.color = cor;

        var els = svg.querySelectorAll('path, circle, rect, ellipse, line, polyline, polygon, g');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            var fill = el.getAttribute('fill');
            if (fill === 'black' || fill === '#000' || fill === '#000000') {
                el.setAttribute('fill', 'currentColor');
            }
            var stroke = el.getAttribute('stroke');
            if (stroke === 'black' || stroke === '#000' || stroke === '#000000') {
                el.setAttribute('stroke', 'currentColor');
            }
        }
    }

    function injetarIconeRelogio() {
        var iconEl = document.getElementById('clock-time-icon');
        if (!iconEl) {
            marcarIconeRelogioPronto();
            return;
        }

        // Primeiro frame imediato: fallback com <img>, depois troca para inline.
        iconEl.innerHTML = '<img src="img/clock.svg" alt="Relógio" />';
        marcarIconeRelogioPronto();

        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'img/clock.svg', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;
            if (xhr.status === 200 || xhr.status === 0) {
                iconEl.innerHTML = xhr.responseText;
                var svg = iconEl.querySelector('svg');
                if (svg) {
                    svg.style.width = '100%';
                    svg.style.height = '100%';
                    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

                    var cor = (CONFIG && CONFIG.corDestaque) ? CONFIG.corDestaque : ((CONFIG && CONFIG.corTexto) ? CONFIG.corTexto : '#ffffff');
                    aplicarCorSvgMonocromatico(svg, cor);
                }
            }
        };
        xhr.send();
    }

    function atualizarRelogio() {
        var el_time = document.getElementById('clock-time-text') || document.getElementById('clock-time');
        var el_date = document.getElementById('clock-date');
        if (!el_time || !el_date) return;

        var agora = new Date();
        var h = agora.getHours();
        var m = agora.getMinutes();
        if (h < 10) h = '0' + h;
        if (m < 10) m = '0' + m;
        el_time.textContent = h + ':' + m;

        var dia_semana = DIAS_SEMANA[agora.getDay()];
        var dia = agora.getDate();
        var mes = MESES[agora.getMonth()];
        if (dia < 10) dia = '0' + dia;
        el_date.textContent = dia_semana + ' ' + dia + '/' + mes;

        marcarHoraRelogioPronta();
    }

    function iniciarRelogio() {
        injetarIconeRelogio();
        atualizarRelogio();
        clockInterval = setInterval(atualizarRelogio, 1000);
    }

    /* =====================================================
       ENGINE DE SLIDESHOW
       ===================================================== */

    function encontrarModulo(tipo) {
        for (var i = 0; i < MODULOS.length; i++) {
            if (MODULOS[i] && MODULOS[i].tipo === tipo) {
                return MODULOS[i];
            }
        }
        return null;
    }

    function montarListaDatasets(canal) {
        var lista = [];
        if (!canal) return lista;

        if (canal.dataset) {
            lista.push(canal.dataset);
        }

        if (canal.datasets && canal.datasets.length) {
            for (var i = 0; i < canal.datasets.length; i++) {
                if (canal.datasets[i]) {
                    lista.push(canal.datasets[i]);
                }
            }
        }

        if (canal.datasetSecundario) {
            lista.push(canal.datasetSecundario);
        }

        return lista;
    }

    function addDataSemDuplicar(loader, datasetName, cache) {
        if (!datasetName) return;
        if (!cache[datasetName]) {
            loader.addData(datasetName, false);
            cache[datasetName] = true;
        }
    }

    function emitirLoaded(loader) {
        if (!loader || !loader.loaded || loader._rodapeLoaded) return;
        loader._rodapeLoaded = true;
        loader.loaded();
    }

    function emitirFinished(loader) {
        if (!loader || !loader.finished || loader._rodapeFinished) return;
        loader._rodapeFinished = true;
        loader.finished();
    }

    function finalizarPlaylist(loader) {
        emitirLoaded(loader);
        emitirFinished(loader);
    }

    /**
     * Transition: fade out inner → swap content → fade in
     */
    function fadeTrocarConteudo(inner, fn, duracao) {
        inner.style.transition = 'opacity ' + duracao + 'ms';
        inner.style.opacity = '0';
        setTimeout(function () {
            fn();
            inner.style.opacity = '1';
        }, duracao);
    }

    function normalizarNumeroPositivo(valor, fallback) {
        var n = parseInt(valor, 10);
        if (isNaN(n) || n <= 0) return fallback;
        return n;
    }

    function contarItensCanal(modulo, dadosCanal) {
        if (!dadosCanal) return 0;

        if (modulo && typeof modulo.contarItens === 'function') {
            var n = modulo.contarItens(dadosCanal);
            return normalizarNumeroPositivo(n, 1);
        }

        if (typeof dadosCanal.length !== 'undefined') {
            return normalizarNumeroPositivo(dadosCanal.length, 1);
        }

        return 1;
    }

    function montarConfigRuntime(canaisAtivos, dados, configBase) {
        var cfg = configBase || {};
        var tempoTotal = normalizarNumeroPositivo(cfg.tempoTotalExibicao, 0);

        if (tempoTotal <= 0) {
            return cfg;
        }

        var totalItens = 0;
        for (var i = 0; i < canaisAtivos.length; i++) {
            var canal = canaisAtivos[i];
            var dadosCanal = dados[canal.tipo];
            if (!dadosCanal) continue;

            var modulo = encontrarModulo(canal.tipo);
            totalItens += contarItensCanal(modulo, dadosCanal);
        }

        totalItens = normalizarNumeroPositivo(totalItens, 1);

        var itemDuracaoCalculada = Math.round(tempoTotal / totalItens);
        var itemDuracaoMinima = 1000;

        if (itemDuracaoCalculada < itemDuracaoMinima) {
            itemDuracaoCalculada = itemDuracaoMinima;
        }

        var configRuntime = {};
        for (var k in cfg) {
            if (cfg.hasOwnProperty(k)) {
                configRuntime[k] = cfg[k];
            }
        }

        configRuntime.itemDuracao = itemDuracaoCalculada;

        console.log('[Rodape] tempoTotalExibicao=' + tempoTotal + 'ms, totalItens=' + totalItens + ', itemDuracao=' + itemDuracaoCalculada + 'ms');

        return configRuntime;
    }

    /**
     * Roda o canal de índice idx dentro de canaisAtivos.
     * onCicloCompleto() é chamado quando todos os canais terminam.
     */
    function rodarSlideshow(canaisAtivos, dados, loader, onCicloCompleto, configRuntime) {
        var cancelaAtual = null;

        function rodarCanal(idx) {
            if (idx >= canaisAtivos.length) {
                if (onCicloCompleto) onCicloCompleto();
                return;
            }

            var canal = canaisAtivos[idx];
            var modulo = encontrarModulo(canal.tipo);

            if (!modulo) {
                rodarCanal(idx + 1);
                return;
            }

            var dadosCanal = dados[canal.tipo];
            if (!dadosCanal) {
                rodarCanal(idx + 1);
                return;
            }

            var inner = document.getElementById('channel-inner');
            if (!inner) {
                rodarCanal(idx + 1);
                return;
            }

            cancelaAtual = modulo.render(inner, dadosCanal, configRuntime || CONFIG, function () {
                cancelaAtual = null;
                rodarCanal(idx + 1);
            });

            // loaded() na primeira renderização real
            if (idx === 0) emitirLoaded(loader);
        }

        rodarCanal(0);

        slideshowCancelFn = function () {
            if (cancelaAtual) {
                cancelaAtual();
                cancelaAtual = null;
            }
        };
    }

    /* =====================================================
       INICIAR TEMPLATE
       ===================================================== */
    function iniciarTemplate(dados, loader) {
        var canaisAtivos = [];
        for (var i = 0; i < CONFIG.canais.length; i++) {
            var c = CONFIG.canais[i];
            if (c.ativo && dados[c.tipo]) {
                canaisAtivos.push(c);
            }
        }

        if (canaisAtivos.length === 0) {
            console.error('[Rodape] Nenhum canal ativo com dados disponíveis.');
            finalizarPlaylist(loader);
            return;
        }

        var configRuntime = montarConfigRuntime(canaisAtivos, dados, CONFIG);

        rodarSlideshow(canaisAtivos, dados, loader, function () {
            if (clockInterval) {
                clearInterval(clockInterval);
                clockInterval = null;
            }
            emitirFinished(loader);
        }, configRuntime);
    }

    /* =====================================================
       MODO MOCK
       ===================================================== */
    // Primeira pintura da tela: estrutura visual antes de carregar conteúdos.
    aplicarConfig();
    iniciarRelogio();

    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = {
            loaded:   function () { console.log('[RodapeMock] loaded()'); },
            finished: function () { console.log('[RodapeMock] finished()'); }
        };
        iniciarTemplate(MOCK_DATA.canais, mockLoader);
        return;
    }

    /* =====================================================
       MODO EDGECONTENTS
       ===================================================== */
    ebhtml.create2({}, function (loader) {

        var datasetsRegistrados = {};

        for (var i = 0; i < CONFIG.canais.length; i++) {
            var canal = CONFIG.canais[i];
            if (canal.ativo) {
                var datasetsCanal = montarListaDatasets(canal);
                for (var j = 0; j < datasetsCanal.length; j++) {
                    addDataSemDuplicar(loader, datasetsCanal[j], datasetsRegistrados);
                }
            }
        }

        loader.autoloaded = false;
        loader.nodataiserror = false;

        loader.load(function () {

            var dadosCarregados = {};

            for (var i = 0; i < CONFIG.canais.length; i++) {
                var canal = CONFIG.canais[i];
                if (!canal.ativo) continue;

                var rawData = canal.dataset ? loader.data(canal.dataset) : null;
                var rawDataSecundario = canal.datasetSecundario
                    ? loader.data(canal.datasetSecundario)
                    : null;

                var modulo = encontrarModulo(canal.tipo);
                if (!modulo || !modulo.parseEbhtml) continue;

                var parsed = null;

                if (canal.datasets && canal.datasets.length) {
                    for (var d = 0; d < canal.datasets.length; d++) {
                        var datasetNome = canal.datasets[d];
                        var rawDataAtual = loader.data(datasetNome);
                        if (!rawDataAtual) continue;

                        parsed = modulo.parseEbhtml(rawDataAtual, rawDataSecundario);
                        if (parsed) {
                            console.log('[Rodape] Canal ' + canal.tipo + ' usando dataset ' + datasetNome);
                            break;
                        }
                    }
                }

                // Aceita canal mesmo sem dataset primário, se tiver secundário
                if (!parsed) {
                    if (!rawData && !rawDataSecundario) continue;
                    parsed = modulo.parseEbhtml(rawData, rawDataSecundario);
                }

                if (parsed) {
                    dadosCarregados[canal.tipo] = parsed;
                }
            }

            var temDados = false;
            for (var chave in dadosCarregados) {
                if (dadosCarregados.hasOwnProperty(chave)) {
                    temDados = true;
                    break;
                }
            }

            if (!temDados) {
                console.error('[Rodape] Sem dados em nenhum canal ativo.');
                finalizarPlaylist(loader);
                return;
            }

            iniciarTemplate(dadosCarregados, loader);
        }, function (erro) {
            console.error('[Rodape] Erro no loader.load():', erro);
            finalizarPlaylist(loader);
        });
    });
};
