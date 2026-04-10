/**
 * VIDEOPORTO - Tarja de Serviços (312x100px)
 * Slideshow com 4 slides: Hora → Clima → Tábua de Marés → UV
 * Todos os dados via D_CLIMA_CLIMATEMPO
 */

/* ========================================
   CONFIGURAÇÃO DE LOCAL
   Altere LOCAL para: SANTANA | DONA_LINDU | JAQUEIRA | APIPUCOS | GENERICO
   ======================================== */
var CONFIG = {
    LOCAL: 'GENERICO',
    SLIDE_DURATION: 5000 // ms por slide
};

/* Filtro de cor aplicado em TODOS os ícones (img e svg inline).
 * Definido dinamicamente por aplicarTema() conforme CONFIG.LOCAL:
 *   Parques (tema branco): 'brightness(0) invert(1)'  → branco puro
 *   GENERICO:              filtro verde (#134123)
 * O CSS .tema-branco .slide-icon { filter: !important } também cobre via classe. */
var ICONE_FILTER_ATUAL = 'brightness(0) invert(1)';

var FUNDOS = {
    'SANTANA':    'img/santana.png',
    'DONA_LINDU': 'img/dona_lindu.png',
    'JAQUEIRA':   'img/jaqueira.png',
    'APIPUCOS':   'img/apipucos.png',
    'GENERICO':   'img/fundo.png'
};

var LOCAIS_TEMA_BRANCO = ['SANTANA', 'DONA_LINDU', 'JAQUEIRA', 'APIPUCOS'];

/**
 * Percorre todos os img.metric-icon com src SVG e os substitui
 * por SVG inline (via XHR), garantindo que animações e <use href="#"> funcionem.
 * O filtro de cor usa ICONE_FILTER_ATUAL capturado no momento da chamada.
 */
function inlinarMetricIcons() {
    var imgs = document.querySelectorAll('img.metric-icon');
    for (var i = 0; i < imgs.length; i++) {
        (function(img) {
            var src = img.src;
            if (!src || src.indexOf('.svg') === -1) return;
            var filtroCaptura = ICONE_FILTER_ATUAL;
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState !== 4) return;
                if (xhr.status === 200) {
                    var span = document.createElement('span');
                    span.className = 'metric-icon-inline';
                    span.style.display = 'inline-flex';
                    span.style.width = '14px';
                    span.style.height = '14px';
                    span.style.flexShrink = '0';
                    span.style.filter = filtroCaptura;
                    span.innerHTML = xhr.responseText;
                    var svg = span.querySelector('svg');
                    if (svg) {
                        svg.removeAttribute('width');
                        svg.removeAttribute('height');
                        svg.style.width = '100%';
                        svg.style.height = '100%';
                        svg.style.display = 'block';
                    }
                    if (img.parentNode) {
                        img.parentNode.replaceChild(span, img);
                    }
                } else {
                    console.warn('[VIDEOPORTO] Falha ao inlinar metric SVG: ' + src);
                }
            };
            xhr.open('GET', src, true);
            xhr.send();
        }(imgs[i]));
    }
}

function aplicarTema() {
    var local = CONFIG.LOCAL;
    var container = document.getElementById('container');
    var fundo = FUNDOS[local] || FUNDOS['GENERICO'];
    container.style.backgroundImage = "url('" + fundo + "')";

    var temaBranco = false;
    for (var i = 0; i < LOCAIS_TEMA_BRANCO.length; i++) {
        if (LOCAIS_TEMA_BRANCO[i] === local) {
            temaBranco = true;
            break;
        }
    }
    if (temaBranco) {
        container.classList.add('tema-branco');
        ICONE_FILTER_ATUAL = 'brightness(0) invert(1)';
    } else {
        container.classList.remove('tema-branco');
        ICONE_FILTER_ATUAL = 'invert(18%) sepia(49%) saturate(659%) hue-rotate(101deg) brightness(89%) contrast(96%)';
    }
}

window.onload = function() {
    aplicarTema();
    inlinarMetricIcons();
    // Debug
    console.log('[VIDEOPORTO] Iniciando...');
    
    // Modo Mock ou EBHTML
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        console.log('[VIDEOPORTO] Modo MOCK ativado');
        var mockLoader = {
            data: function(key) {
                return MOCK_DATA.datasets[key] || null;
            },
            datalist: function(key) {
                return MOCK_DATA.datasets[key] || null;
            },
            loaded: function() {
                console.log('[VIDEOPORTO] Mock loaded');
            },
            finished: function() {
                console.log('[VIDEOPORTO] Mock finished');
            }
        };
        inicializarTemplate(mockLoader);
    } else {
        console.log('[VIDEOPORTO] Modo EBHTML');
        ebhtml.create2({}, function(loader) {
            loader.addData('D_CLIMA', false);
            loader.addData('D_CLIMA_CLIMATEMPO_MOMENTO', false);
            loader.autoloaded = false;
            loader.nodataiserror = false;
            
            loader.load(function() {
                console.log('[VIDEOPORTO] EBHTML dados carregados');
                inicializarTemplate(loader);
            });
        });
    }
};

var horaTimerId = null;

/**
 * Inicializa o template e renderiza slides
 */
function inicializarTemplate(loader) {
    console.log('[VIDEOPORTO] Renderizando slides...');
    
    // Extrair dados dos datasets
    var dadosClima = obterDadosClima(loader);
    var dadosMares = obterDadosMares(loader);
    var dadosUV = obterDadosUV(loader);
    
    // Renderizar slides disponíveis
    var slides = [];
    
    // 1. Hora (sempre disponível)
    renderizarSlideHora();
    slides.push(document.querySelector('[data-type="hora"]'));
    
    // 2. Clima (se houver dados)
    if (dadosClima) {
        renderizarSlideClima(dadosClima);
        slides.push(document.querySelector('[data-type="clima"]'));
    }
    
    // 3. Tábua de Marés (se houver dados)
    if (dadosMares) {
        renderizarSlideMares(dadosMares);
        slides.push(document.querySelector('[data-type="mares"]'));
    }
    
    // 4. UV (se houver dados)
    if (dadosUV) {
        renderizarSlideUV(dadosUV);
        slides.push(document.querySelector('[data-type="uv"]'));
    }
    
    console.log('[VIDEOPORTO] Total de slides: ' + slides.length);
    
    // Iniciar slideshow
    if (slides.length > 0) {
        iniciarSlideshow(slides, loader);
    } else {
        console.error('[VIDEOPORTO] Nenhum slide disponível');
        loader.finished();
    }
}

/**
 * Verifica se um DT_UPDATE está dentro do limite de horas aceitável.
 * @param {string} dtUpdate - Formato "YYYY-MM-DD HH:MM:SS"
 * @param {number} maxHoras - Horas máximas de tolerância
 * @returns {boolean}
 */
function verificarAtualidade(dtUpdate, maxHoras) {
    if (!dtUpdate) return false;
    try {
        var s = ('' + dtUpdate).trim();
        var partes = s.split(' ');
        if (partes.length < 2) return false;
        var d = partes[0].split('-');
        var h = partes[1].split(':');
        var dataObj = new Date(
            parseInt(d[0], 10),
            parseInt(d[1], 10) - 1,
            parseInt(d[2], 10),
            parseInt(h[0], 10),
            parseInt(h[1], 10),
            parseInt(h[2], 10)
        );
        var diffHoras = (new Date() - dataObj) / 3600000;
        return diffHoras >= 0 && diffHoras <= maxHoras;
    } catch (e) {
        return false;
    }
}

/**
 * Renderiza slide de Hora (Quarta-feira, HH:MM, DD de mês de YYYY)
 */
function renderizarSlideHora() {
    atualizarSlideHoraLocal();

    if (horaTimerId) {
        clearInterval(horaTimerId);
    }

    horaTimerId = setInterval(function() {
        atualizarSlideHoraLocal();
    }, 1000);

    // Injetar ícone de relógio
    injetarIcone('hora-icon', 'img/clock_5279650.png');
}

function atualizarSlideHoraLocal() {
    var data = new Date();
    var dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    var meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    
    var hora = formatarDoisDigitos(data.getHours());
    var minuto = formatarDoisDigitos(data.getMinutes());
    var dia = dias[data.getDay()];
    var dataDia = data.getDate();
    var dataMes = meses[data.getMonth()];
    var dataAno = data.getFullYear();
    
    document.getElementById('hora-weekday').innerText = dia;
    document.getElementById('hora-value').innerText = hora + ':' + minuto;
    document.getElementById('hora-date').innerText = dataDia + ' de ' + dataMes + ' de ' + dataAno;
}

/**
 * Extrai dados de Clima dos datasets D_CLIMA e D_CLIMA_CLIMATEMPO_MOMENTO.
 * Dados do MOMENTO só são usados se DT_UPDATE for recente (≤ 3 horas).
 */
function obterDadosClima(loader) {
    try {
        var momento = loader.data('D_CLIMA_CLIMATEMPO_MOMENTO');
        var clima = loader.data('D_CLIMA');

        if (!momento && !clima) return null;

        var momentoAtual = false;
        if (momento) {
            var dtUpdate = obterCampo(momento, 'DT_UPDATE', null);
            momentoAtual = verificarAtualidade(dtUpdate, 3);
            if (!momentoAtual) {
                console.warn('[VIDEOPORTO] D_CLIMA_CLIMATEMPO_MOMENTO desatualizado ou sem DT_UPDATE');
            }
        }

        var result = {
            temperatura:  null,
            condicao:     null,
            ico:          null,
            umidade:      null,
            vento:        null,
            ventoDirecao: null,
            minima:       null,
            maxima:       null
        };

        if (momento && momentoAtual) {
            result.temperatura  = obterCampoBruto(momento, 'C1_MAX');
            result.condicao     = obterCampoBruto(momento, 'C1_TEXTMIN');
            result.ico          = obterCampoBruto(momento, 'C1_ICO');
            result.umidade      = obterCampoBruto(momento, 'C1_HUMIDITYMIN');
            result.vento        = obterCampoBruto(momento, 'C1_WINDAVGVELOCITY');
            result.ventoDirecao = obterCampoBruto(momento, 'C1_WINDDIRECTION');
        }

        if (clima) {
            result.minima = obterCampoBruto(clima, 'C1_D1_MIN');
            result.maxima = obterCampoBruto(clima, 'C1_D1_MAX');
        }

        // Se nenhum dado útil, retornar null
        if (!result.temperatura && !result.minima && !result.maxima) return null;

        return result;
    } catch (e) {
        console.error('[VIDEOPORTO] Erro ao extrair clima:', e);
        return null;
    }
}

/**
 * Resolve o caminho do SVG de condição climática baseado no código C1_ICO
 * e no horário (dia = hora 6-19, noite = resto).
 * Ícones sem versão noturna: 11, 3tm.
 */
function resolverIconeClima(ico) {
    if (!ico) return null;
    var code = ('' + ico).trim();
    if (!code) return null;

    var hora = new Date().getHours();
    var noite = hora < 6 || hora >= 20;

    if (code === '11' || code === '3tm') {
        return 'img/' + code + '.svg';
    }

    if (noite) {
        return 'img/' + code + 'n.svg';
    }
    return 'img/' + code + '.svg';
}

/**
 * Renderiza slide de Clima — oculta campos sem dados.
 */
function renderizarSlideClima(dados) {
    var elCondicao    = document.getElementById('clima-condicao');
    var elTemp        = document.getElementById('clima-temp');
    var elTempLine    = elTemp ? elTemp.parentNode : null; // .clima-temp-line
    var elMin         = document.getElementById('clima-min');
    var elMax         = document.getElementById('clima-max');
    var elUmidade     = document.getElementById('clima-umidade');
    var elVento       = document.getElementById('clima-vento');

    mostrarOuOcultar(elCondicao, dados.condicao ? dados.condicao.trim() : null);

    if (elTempLine) {
        if (dados.temperatura && ('' + dados.temperatura).trim() !== '') {
            elTemp.innerText = ('' + dados.temperatura).trim();
            elTempLine.style.display = '';
        } else {
            elTempLine.style.display = 'none';
        }
    }

    if (elMin) mostrarOuOcultarMetric(elMin, dados.minima, '°C');
    if (elMax) mostrarOuOcultarMetric(elMax, dados.maxima, '°C');
    if (elUmidade) mostrarOuOcultarMetric(elUmidade, dados.umidade, '%');

    if (elVento) {
        var metricLineVento = obterMetricLine(elVento);
        if (dados.vento && ('' + dados.vento).trim() !== '') {
            var ventoStr = ('' + dados.vento).trim() + ' km/h';
            // if (dados.ventoDirecao && ('' + dados.ventoDirecao).trim() !== '') {
            //     ventoStr += '' + ('' + dados.ventoDirecao).trim();
            // }
            elVento.innerText = ventoStr;
            if (metricLineVento) metricLineVento.style.display = '';
        } else {
            if (metricLineVento) metricLineVento.style.display = 'none';
        }
    }

    var icoSrc = resolverIconeClima(dados.ico);
    if (icoSrc) {
        injetarIcone('clima-icon', icoSrc);
    } else {
        // Sem dado de ícone (MOMENTO indisponível) — deixar área vazia
        var climaIconEl = document.getElementById('clima-icon');
        if (climaIconEl) climaIconEl.innerHTML = '';
    }
}

/**
 * Mostra ou oculta um elemento de texto simples.
 */
function mostrarOuOcultar(el, texto) {
    if (!el) return;
    if (texto && texto !== '') {
        el.innerText = texto;
        el.style.display = '';
    } else {
        el.style.display = 'none';
    }
}

/**
 * Sobe na árvore DOM até encontrar o ancestral .metric-line.
 */
function obterMetricLine(el) {
    var node = el ? el.parentNode : null;
    while (node) {
        if (node.className && ('' + node.className).indexOf('metric-line') !== -1) return node;
        node = node.parentNode;
    }
    return el ? el.parentNode : null;
}

/**
 * Mostra ou oculta um .metric-line (<span> dentro de <div>), adicionando sufixo.
 */
function mostrarOuOcultarMetric(el, valor, sufixo) {
    if (!el) return;
    var raw = valor ? ('' + valor).trim() : '';
    var metricLine = obterMetricLine(el);
    if (raw !== '') {
        el.innerText = raw + sufixo;
        if (metricLine) metricLine.style.display = '';
    } else {
        if (metricLine) metricLine.style.display = 'none';
    }
}

/**
 * Extrai dados de Tábua de Marés do D_CLIMA_CLIMATEMPO_MOMENTO.
 * O XML fornece apenas 2 entradas (TIDE_A e TIDE_B).
 * Direção inferida pela comparação de alturas: maior = alta.
 */
function obterDadosMares(loader) {
    try {
        var momento = loader.data('D_CLIMA_CLIMATEMPO_MOMENTO');
        if (!momento) return null;

        var horaA   = obterCampoBruto(momento, 'C1_MARINE_TIDE_A');
        var altaA   = obterCampoBruto(momento, 'C1_MARINE_TIDE_A_HEIGHT');
        var horaB   = obterCampoBruto(momento, 'C1_MARINE_TIDE_B');
        var altaB   = obterCampoBruto(momento, 'C1_MARINE_TIDE_B_HEIGHT');

        if (!horaA && !horaB) return null;

        var numA = parseFloat(altaA || '0');
        var numB = parseFloat(altaB || '0');
        var dirA = numA >= numB ? 'alta' : 'baixa';
        var dirB = numA >= numB ? 'baixa' : 'alta';

        var entradas = [];
        if (horaA && horaA.trim() !== '') {
            entradas.push({
                valor: altaA ? parseFloat(altaA).toFixed(2) : '--',
                hora:  horaA.trim(),
                dir:   dirA
            });
        }
        if (horaB && horaB.trim() !== '') {
            entradas.push({
                valor: altaB ? parseFloat(altaB).toFixed(2) : '--',
                hora:  horaB.trim(),
                dir:   dirB
            });
        }

        if (entradas.length === 0) return null;
        return { entradas: entradas };
    } catch (e) {
        console.error('[VIDEOPORTO] Erro ao extrair marés:', e);
        return null;
    }
}

/**
 * Renderiza slide de Tábua de Marés.
 * Popula entradas disponíveis e oculta as restantes (até 4 slots).
 */
function renderizarSlideMares(dados) {
    var e = dados.entradas;
    for (var i = 1; i <= 4; i++) {
        var elValor = document.getElementById('mares-v' + i);
        if (!elValor) continue;
        // Sobe: span.quote-value → div.quote-value-line → div.quote-item
        var quoteItem = elValor.parentNode && elValor.parentNode.parentNode;
        if (i <= e.length) {
            var entrada = e[i - 1];
            elValor.innerText = entrada.valor;
            document.getElementById('mares-h' + i).innerText = entrada.hora;
            var seta = document.getElementById('mares-seta' + i);
            if (seta) {
                seta.src = (entrada.dir === 'alta') ? 'img/seta_verde.png' : 'img/seta_amarala.png';
            }
            if (quoteItem) quoteItem.style.display = '';
        } else {
            if (quoteItem) quoteItem.style.display = 'none';
        }
    }
    injetarIcone('mares-icon', 'img/sea-level_4978353.png');
}

/**
 * Extrai dados de UV do D_CLIMA_CLIMATEMPO_MOMENTO.
 * Só retorna dados se o DT_UPDATE for recente (≤ 3 horas) e C1_UV não estiver vazio.
 */
function obterDadosUV(loader) {
    try {
        var momento = loader.data('D_CLIMA_CLIMATEMPO_MOMENTO');
        if (!momento) return null;

        var dtUpdate = obterCampoBruto(momento, 'DT_UPDATE');
        if (!verificarAtualidade(dtUpdate, 3)) return null;

        var indice = obterCampoBruto(momento, 'C1_UV');
        if (!indice || indice.trim() === '') return null;

        return {
            indice:    indice.trim(),
            descricao: obterCampoBruto(momento, 'C1_UVLEVEL') || 'Alto'
        };
    } catch (e) {
        console.error('[VIDEOPORTO] Erro ao extrair UV:', e);
        return null;
    }
}

/**
 * Renderiza slide de UV
 */
function renderizarSlideUV(dados) {
    var textoUv = 'Protégete do sol! Índice UV ' + dados.indice + ' (' + dados.descricao + '). Use protetor solar.';
    document.getElementById('uv-msg').innerText = textoUv;
    
    // Injetar ícone de raios solares
    injetarIcone('uv-icon', 'img/sun_2354809.png');
}

/**
 * Auxiliar: Injeta ícone em um container.
 * SVGs são inlinados via XHR (para garantir animações e <use href="#"> em WebKit).
 * PNGs e demais formatos usam <img>.
 * O filtro de cor é sempre ICONE_FILTER_ATUAL (definido por aplicarTema).
 */
function injetarIcone(elementId, imagemSrc) {
    try {
        var container = document.getElementById(elementId);
        if (!container) return;
        container.innerHTML = '';

        var ehSvg = imagemSrc.indexOf('.svg') !== -1;

        if (ehSvg) {
            var filtroCaptura = ICONE_FILTER_ATUAL;
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState !== 4) return;
                if (xhr.status === 200) {
                    container.innerHTML = xhr.responseText;
                    var svg = container.querySelector('svg');
                    if (svg) {
                        svg.removeAttribute('width');
                        svg.removeAttribute('height');
                        svg.style.width  = '100%';
                        svg.style.height = '100%';
                        svg.style.display = 'block';
                    }
                    container.style.filter = filtroCaptura;
                } else {
                    console.warn('[VIDEOPORTO] Falha ao carregar SVG: ' + imagemSrc);
                }
            };
            xhr.open('GET', imagemSrc, true);
            xhr.send();
            return;
        }

        // PNG ou outro formato
        var img = document.createElement('img');
        img.src = imagemSrc;
        img.className = 'w-full h-full object-contain';
        container.style.filter = ICONE_FILTER_ATUAL;
        container.appendChild(img);
    } catch (e) {
        console.warn('[VIDEOPORTO] Erro ao injetar ícone: ' + elementId);
    }
}

/**
 * Auxiliar: Extrai campo de um item EBHTML (com fallback).
 */
function obterCampo(item, nomeCampo, defaultValue) {
    var val = obterCampoBruto(item, nomeCampo);
    if (val !== null && val !== undefined) return val;
    return (defaultValue !== undefined) ? defaultValue : null;
}

/**
 * Auxiliar: Extrai campo bruto (sem fallback). Retorna null se ausente ou vazio.
 */
function obterCampoBruto(item, nomeCampo) {
    try {
        if (!item) return null;
        if (typeof item.value === 'function') {
            var r = item.value(nomeCampo);
            if (r && r.value !== undefined) {
                var v = ('' + r.value).trim();
                return v !== '' ? v : null;
            }
        }
        if (item[nomeCampo] !== undefined) {
            var v2 = typeof item[nomeCampo].value !== 'undefined' ? item[nomeCampo].value : item[nomeCampo];
            var s = ('' + v2).trim();
            return s !== '' ? s : null;
        }
        return null;
    } catch (e) {
        return null;
    }
}

/**
 * Inicia slideshow rotacionando slides
 * @param {Array} slides - Array de elementos DOM
 * @param {Object} loader - Loader EBHTML
 */
function iniciarSlideshow(slides, loader) {
    if (slides.length === 0) {
        loader.finished();
        return;
    }
    
    console.log('[VIDEOPORTO] Iniciando slideshow com ' + slides.length + ' slides');
    
    // Mostrar primeiro slide
    slides[0].classList.add('active');
    loader.loaded();
    
    if (slides.length === 1) {
        // Se apenas 1 slide, mostrar por 5s e terminar
        setTimeout(function() {
            loader.finished();
        }, CONFIG.SLIDE_DURATION);
        return;
    }
    
    var current = 0;
    var totalExibins = 0;
    var SLIDE_DURATION = CONFIG.SLIDE_DURATION;
    
    var interval = setInterval(function() {
        // Ocultar slide atual
        slides[current].classList.remove('active');
        
        // Próximo slide
        current = (current + 1) % slides.length;
        totalExibins++;
        
        // Mostrar novo slide
        slides[current].classList.add('active');
        
        console.log('[VIDEOPORTO] Slide ' + current + ' (' + totalExibins + ' total)');
        
        // Finaliza após um ciclo completo
        if (totalExibins >= slides.length - 1) {
            clearInterval(interval);
            console.log('[VIDEOPORTO] Finalizando slideshow');
            
            setTimeout(function() {
                loader.finished();
            }, SLIDE_DURATION);
            
            return;
        }
    }, SLIDE_DURATION);
}

function formatarDoisDigitos(numero) {
    if (numero < 10) {
        return '0' + numero;
    }
    return '' + numero;
}

function extrairNumeroValor(valor) {
    if (!valor) {
        return '--';
    }

    return ('' + valor).replace('m', '').replace('M', '');
}
