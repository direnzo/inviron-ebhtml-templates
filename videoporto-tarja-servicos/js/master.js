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
    LOCAL: 'DONA_LINDU',
    SLIDE_DURATION: 5000 // ms por slide
};

var FUNDOS = {
    'SANTANA':    'img/santana.png',
    'DONA_LINDU': 'img/dona_lindu.png',
    'JAQUEIRA':   'img/jaqueira.png',
    'APIPUCOS':   'img/apipucos.png',
    'GENERICO':   'img/fundo.png'
};

var LOCAIS_TEMA_BRANCO = ['SANTANA', 'DONA_LINDU', 'JAQUEIRA', 'APIPUCOS'];

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
    } else {
        container.classList.remove('tema-branco');
    }
}

window.onload = function() {
    aplicarTema();
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
            loader.addData('D_CLIMA_CLIMATEMPO', false);
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
 * Extrai dados de Clima do loader D_CLIMA_CLIMATEMPO
 */
function obterDadosClima(loader) {
    try {
        var item = loader.data('D_CLIMA_CLIMATEMPO');
        if (!item) return null;
        
        return {
            condicao:     obterCampo(item, 'CONDICAO',     'Nublado'),
            temperatura:  obterCampo(item, 'TEMPERATURA',  '30'),
            minima:       obterCampo(item, 'MINIMA',       '28'),
            maxima:       obterCampo(item, 'MAXIMA',       '34'),
            precipitacao: obterCampo(item, 'PRECIPITACAO', '0'),
            vento:        obterCampo(item, 'VENTO',        '0'),
        };
    } catch (e) {
        console.error('[VIDEOPORTO] Erro ao extrair clima:', e);
        return null;
    }
}

/**
 * Renderiza slide de Clima
 */
function renderizarSlideClima(dados) {
    document.getElementById('clima-condicao').innerText = dados.condicao;
    document.getElementById('clima-temp').innerText = dados.temperatura;
    document.getElementById('clima-min').innerText = dados.minima + '°C';
    document.getElementById('clima-max').innerText = dados.maxima + '°C';
    document.getElementById('clima-umidade').innerText = dados.precipitacao + '%';
    document.getElementById('clima-vento').innerText = dados.vento + 'km/h';
    
    // Injetar ícone de clima
    injetarIcone('clima-icon', 'img/clouds-sun_7587425.png');
}

/**
 * Extrai dados de Tábua de Marés do loader D_CLIMA_CLIMATEMPO
 */
function obterDadosMares(loader) {
    try {
        var item = loader.data('D_CLIMA_CLIMATEMPO');
        if (!item) return null;
        
        var v1 = obterCampo(item, 'MARE_V1', null);
        if (!v1) return null;
        
        return {
            entradas: [
                { valor: v1,                              hora: obterCampo(item, 'MARE_H1', '--:--'), dir: obterCampo(item, 'MARE_D1', 'alta') },
                { valor: obterCampo(item, 'MARE_V2', '--'), hora: obterCampo(item, 'MARE_H2', '--:--'), dir: obterCampo(item, 'MARE_D2', 'baixa') },
                { valor: obterCampo(item, 'MARE_V3', '--'), hora: obterCampo(item, 'MARE_H3', '--:--'), dir: obterCampo(item, 'MARE_D3', 'alta') },
                { valor: obterCampo(item, 'MARE_V4', '--'), hora: obterCampo(item, 'MARE_H4', '--:--'), dir: obterCampo(item, 'MARE_D4', 'baixa') }
            ]
        };
    } catch (e) {
        console.error('[VIDEOPORTO] Erro ao extrair marés:', e);
        return null;
    }
}

/**
 * Renderiza slide de Tábua de Marés (4 horários)
 */
function renderizarSlideMares(dados) {
    var e = dados.entradas;
    for (var i = 0; i < e.length; i++) {
        var n = i + 1;
        document.getElementById('mares-v' + n).innerText = e[i].valor;
        document.getElementById('mares-h' + n).innerText = e[i].hora;
        var seta = document.getElementById('mares-seta' + n);
        if (seta) {
            seta.src = (e[i].dir === 'alta') ? 'img/seta_verde.png' : 'img/seta_amarala.png';
        }
    }
    
    injetarIcone('mares-icon', 'img/sea-level_4978353.png');
}

/**
 * Extrai dados de UV (Raios Solar)
 */
function obterDadosUV(loader) {
    try {
        var item = loader.data('D_CLIMA_CLIMATEMPO');
        if (!item) return null;
        
        var indice = obterCampo(item, 'UV_INDICE', null);
        if (!indice) return null;
        
        return {
            indice: indice,
            descricao: obterCampo(item, 'UV_DESC', 'Máxima'),
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
 * Auxiliar: Injeta ícone em um container
 */
function injetarIcone(elementId, imagemSrc) {
    try {
        var container = document.getElementById(elementId);
        if (container) {
            container.innerHTML = '';
            var img = document.createElement('img');
            img.src = imagemSrc;
            img.className = 'w-full h-full object-contain';
            container.appendChild(img);
        }
    } catch (e) {
        console.warn('[VIDEOPORTO] Erro ao injetar ícone: ' + elementId);
    }
}

/**
 * Auxiliar: Extrai campo de um item EBHTML
 */
function obterCampo(item, nomeCampo, defaultValue) {
    try {
        if (!item) return defaultValue || null;
        
        // Tentar .value(campo)
        if (typeof item.value === 'function') {
            var val = item.value(nomeCampo);
            if (val && val.value !== undefined) {
                return val.value;
            }
        }
        
        // Tentar acesso direto
        if (item[nomeCampo]) {
            return typeof item[nomeCampo].value !== 'undefined' ? item[nomeCampo].value : item[nomeCampo];
        }
        
        return defaultValue || null;
    } catch (e) {
        console.warn('[VIDEOPORTO] Campo não encontrado: ' + nomeCampo);
        return defaultValue || null;
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
