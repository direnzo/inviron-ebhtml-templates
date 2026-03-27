/**
 * VIDEOPORTO - Tarja de Serviços (312x100px)
 * Slideshow com 6 slides: Hora → Clima → Ondas → UV → Cotações → Mensagem
 * 5 segundos por slide, rotação contínua
 */

/* ========================================
   CONFIGURAÇÃO DE LOCAL
   Altere LOCAL para: SANTANA | DONA_LINDU | JAQUEIRA | APIPUCOS | GENERICO
   ======================================== */
var CONFIG = {
    LOCAL: 'GENERICO'
};

var FUNDOS = {
    'SANTANA':    'img/Tarja Parque Santana.png',
    'DONA_LINDU': 'img/Tarja Parque Dona Lindu.png',
    'JAQUEIRA':   'img/Tarja Parque da Jaqueira.png',
    'APIPUCOS':   'img/Tarja Parque Apipucos.png',
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
            loader.addData('D_CAMBIO', false);
            loader.addData('D_COMUNICADO', false);
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
    var dadosOndas = obterDadosOndas(loader);
    var dadosUV = obterDadosUV(loader);
    var dadosCambio = obterDadosCambio(loader);
    var dadosComunicado = obterDadosComunicado(loader);
    
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
    
    // 3. Ondas (se houver dados)
    if (dadosOndas) {
        renderizarSlideOndas(dadosOndas);
        slides.push(document.querySelector('[data-type="ondas"]'));
    }
    
    // 4. UV (se houver dados)
    if (dadosUV) {
        renderizarSlideUV(dadosUV);
        slides.push(document.querySelector('[data-type="uv"]'));
    }
    
    // 5. Câmbio (se houver dados)
    if (dadosCambio) {
        renderizarSlideCambio(dadosCambio);
        slides.push(document.querySelector('[data-type="cambio"]'));
    }
    
    // 6. Comunicado (se houver dados)
    if (dadosComunicado) {
        renderizarSlideComunicado(dadosComunicado);
        slides.push(document.querySelector('[data-type="comunicado"]'));
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
            condicao: obterCampo(item, 'CONDICAO', 'Nublado'),
            temperatura: obterCampo(item, 'TEMPERATURA', '30'),
            minima: obterCampo(item, 'MINIMA', '28'),
            maxima: obterCampo(item, 'MAXIMA', '34'),
            umidade: obterCampo(item, 'UMIDADE', '78'),
            vento: obterCampo(item, 'VENTO', '26'),
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
    document.getElementById('clima-min').innerText = dados.minima;
    document.getElementById('clima-max').innerText = dados.maxima;
    document.getElementById('clima-umidade').innerText = dados.umidade;
    document.getElementById('clima-vento').innerText = dados.vento;
    
    // Injetar ícone de clima
    injetarIcone('clima-icon', 'img/clouds-sun_7587425.png');
}

/**
 * Extrai dados de Ondas
 */
function obterDadosOndas(loader) {
    try {
        var item = loader.data('D_CLIMA_CLIMATEMPO');
        if (!item) return null;
        
        // Tenta carregar de um campo de ondas (se existir)
        var altura = obterCampo(item, 'ONDAS_ALTURA', null);
        if (!altura) return null;
        
        return {
            altura: altura,
            horario: obterCampo(item, 'ONDAS_HORARIO', '04:02'),
        };
    } catch (e) {
        console.error('[VIDEOPORTO] Erro ao extrair ondas:', e);
        return null;
    }
}

/**
 * Renderiza slide de Ondas
 */
function renderizarSlideOndas(dados) {
    document.getElementById('ondas-altura').innerText = dados.altura;
    document.getElementById('ondas-horario').innerText = dados.horario;
    
    // Injetar ícone de ondas
    injetarIcone('ondas-icon', 'img/sea-level_4978353.png');
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
    var textoUv = 'O nível de UV agora pela manhã está altíssimo.';
    if (dados.indice) {
        textoUv = 'Índice UV ' + dados.indice + '. Proteja-se do sol.';
    }
    document.getElementById('uv-msg').innerText = textoUv;
    
    // Injetar ícone de raios solares
    injetarIcone('uv-icon', 'img/sun_2354809.png');
}

/**
 * Extrai dados de Câmbio do loader D_CAMBIO
 */
function obterDadosCambio(loader) {
    try {
        var item = loader.data('D_CAMBIO');
        if (!item) return null;
        
        var lista = [];
        var v1 = obterCampo(item, 'V1', null);
        if (v1) {
            lista.push({ valor: v1, hora: obterCampo(item, 'H1', '--:--') });
            lista.push({ valor: obterCampo(item, 'V2', '--'), hora: obterCampo(item, 'H2', '--:--') });
            lista.push({ valor: obterCampo(item, 'V3', '--'), hora: obterCampo(item, 'H3', '--:--') });
            lista.push({ valor: obterCampo(item, 'V4', '--'), hora: obterCampo(item, 'H4', '--:--') });
        }

        return {
            moeda: obterCampo(item, 'MOEDA', 'USD'),
            cotacao: obterCampo(item, 'COTACAO', '5.45'),
            lista: lista
        };
    } catch (e) {
        console.error('[VIDEOPORTO] Erro ao extrair câmbio:', e);
        return null;
    }
}

/**
 * Renderiza slide de Câmbio
 */
function renderizarSlideCambio(dados) {
    var valores = dados.lista;
    if (!valores || valores.length < 4) {
        valores = [
            { valor: '2.46m', hora: '04:02' },
            { valor: '0.11m', hora: '10:08' },
            { valor: '2.10m', hora: '16:17' },
            { valor: '0.32m', hora: '22:14' }
        ];
    }

    document.getElementById('cambio-v1').innerText = extrairNumeroValor(valores[0].valor);
    document.getElementById('cambio-h1').innerText = valores[0].hora;
    document.getElementById('cambio-v2').innerText = extrairNumeroValor(valores[1].valor);
    document.getElementById('cambio-h2').innerText = valores[1].hora;
    document.getElementById('cambio-v3').innerText = extrairNumeroValor(valores[2].valor);
    document.getElementById('cambio-h3').innerText = valores[2].hora;
    document.getElementById('cambio-v4').innerText = extrairNumeroValor(valores[3].valor);
    document.getElementById('cambio-h4').innerText = valores[3].hora;
    
    // Injetar ícone de câmbio
    injetarIcone('cambio-icon', 'img/drink_10885667.png');
}

/**
 * Extrai dados de Comunicado do loader D_COMUNICADO
 */
function obterDadosComunicado(loader) {
    try {
        var item = loader.data('D_COMUNICADO');
        if (!item) return null;
        
        return {
            mensagem: obterCampo(item, 'MENSAGEM', 'Mensagem padrão'),
        };
    } catch (e) {
        console.error('[VIDEOPORTO] Erro ao extrair comunicado:', e);
        return null;
    }
}

/**
 * Renderiza slide de Comunicado
 */
function renderizarSlideComunicado(dados) {
    document.getElementById('comunicado-msg').innerText = dados.mensagem;
    injetarIcone('comunicado-icon', 'img/sun_2354809.png');
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
        }, 5000);
        return;
    }
    
    var current = 0;
    var totalExibins = 0;
    var SLIDE_DURATION = 5000; // 5 segundos
    
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
