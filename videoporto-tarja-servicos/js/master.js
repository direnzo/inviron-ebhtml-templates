/**
 * VIDEOPORTO - Tarja de Serviços (312x100px)
 * Slideshow com 6 slides: Hora → Clima → Ondas → UV → Cotações → Mensagem
 * 5 segundos por slide, rotação contínua
 */

window.onload = function() {
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
    var data = new Date();
    var dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    var meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    
    var hora = String(data.getHours()).padStart(2, '0');
    var minuto = String(data.getMinutes()).padStart(2, '0');
    var dia = dias[data.getDay()];
    var dataDia = data.getDate();
    var dataMes = meses[data.getMonth()];
    var dataAno = data.getFullYear();
    
    document.getElementById('hora-value').innerText = hora + ':' + minuto;
    document.getElementById('hora-date').innerText = dataDia + ' de ' + dataMes + ' de ' + dataAno;
    
    // Injetar ícone de relógio
    injetarIcone('hora-icon', 'img/clock_5279650.png');
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
    document.getElementById('clima-temp').innerText = dados.temperatura;
    document.getElementById('clima-min').innerText = dados.minima;
    document.getElementById('clima-max').innerText = dados.maxima;
    
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
    document.getElementById('uv-msg').innerText = dados.descricao + ' UV';
    
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
        
        return {
            moeda: obterCampo(item, 'MOEDA', 'USD'),
            cotacao: obterCampo(item, 'COTACAO', '5.45'),
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
    document.getElementById('cambio-moeda').innerText = dados.moeda;
    document.getElementById('cambio-valor').innerText = dados.cotacao;
    
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
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
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
        
        // Após exibir todos os slides, terminar
        if (totalExibins >= slides.length) {
            console.log('[VIDEOPORTO] Ciclo completo, expondo 1 ciclo adicional');
        }
        
        // Após 2 ciclos completos, terminar
        if (totalExibins >= slides.length * 2) {
            clearInterval(interval);
            console.log('[VIDEOPORTO] Finalizando slideshow');
            
            // Fade out último slide
            setTimeout(function() {
                slides[current].classList.remove('active');
                loader.finished();
            }, SLIDE_DURATION);
            
            return;
        }
    }, SLIDE_DURATION);
}

/**
 * String pad helper para ES5 compatibility
 */
if (!String.prototype.padStart) {
    String.prototype.padStart = function(targetLength, padString) {
        targetLength = targetLength >> 0;
        padString = String((typeof padString !== 'undefined') ? padString : ' ');
        if (this.length > targetLength) {
            return String(this);
        } else {
            targetLength = targetLength - this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length);
            }
            return padString.slice(0, targetLength) + String(this);
        }
    };
}
