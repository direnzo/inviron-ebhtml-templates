/**
 * TEMPLATE BASE - EdgeContents Digital Signage
 * 
 * ATENÇÃO: Use apenas JavaScript ES5 (compatibilidade Android 7+)
 * - Não use arrow functions: () => {}
 * - Não use let/const, apenas var
 * - Não use template strings: `texto ${var}`
 * - Use concatenação: 'texto ' + variavel
 * - Evite o uso de bibliotecas externas
 * - Evite o uso excessivo de funções modernas
 * - Evite o uso excessivo de console.log
 */

window.onload = function() {
    
    /**
     * Função principal do template
     * @param {Array} dados - Array de dados a serem exibidos
     * @param {Object} config - Configurações do template
     * @param {Object} loader - Objeto EBHTML loader
     */
    function iniciarTemplate(dados, config, loader) {
        console.log('Iniciando template com ' + dados.length + ' itens');
        
        var container = document.getElementById('content');
        container.innerHTML = '';
        
        // Cria elementos dinamicamente
        for (var i = 0; i < dados.length; i++) {
            var elemento = criarElemento(dados[i], i);
            container.appendChild(elemento);
        }
        
        // Fade in do body
        document.body.classList.add('opacity-100');
        
        // ✅ OBRIGATÓRIO - Informa que o template carregou com sucesso
        if (loader) loader.loaded();
        
        // ✅ OBRIGATÓRIO - Finaliza após o tempo configurado
        setTimeout(function() {
            // Fade out antes de finalizar
            document.body.classList.remove('opacity-100');
            document.body.classList.add('opacity-0');
            
            setTimeout(function() {
                if (loader) loader.finished();
            }, 1000);
        }, config.duration);
    }
    
    /**
     * Cria um elemento visual
     * @param {Object} data - Dados do item
     * @param {Number} index - Índice do item
     * @returns {HTMLElement} Elemento criado
     */
    function criarElemento(data, index) {
        var div = document.createElement('div');
        
        // Classes Tailwind para estilização
        div.className = 'flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-xl m-4 max-w-2xl';
        
        // Conteúdo HTML (usar concatenação, não template strings)
        div.innerHTML = 
            '<div class="text-center">' +
                '<h2 class="titulo-secundario text-gray-900 mb-4">' + 
                    data.titulo + 
                '</h2>' +
                '<p class="texto-medio text-gray-700 leading-relaxed">' + 
                    data.descricao + 
                '</p>' +
            '</div>';
        
        return div;
    }
    
    /**
     * Cria slide de alerta (exemplo alternativo)
     */
    function criarSlideAlerta(texto, index) {
        var slide = document.createElement('div');
        slide.className = 'absolute top-0 left-0 w-full h-full flex items-center justify-center transition-opacity duration-1000 opacity-0 z-0';
        slide.setAttribute('data-slide', index + 1);
        
        slide.innerHTML = 
            '<div class="w-full h-full flex items-center justify-center px-[5%]">' +
                '<div class="titulo-principal text-white text-center text-shadow">' +
                    texto +
                '</div>' +
            '</div>';
        
        return slide;
    }
    
    /**
     * Animação de slideshow
     */
    function iniciarSlideshow(slides, config, loader) {
        if (slides.length === 0) {
            if (loader) loader.finished();
            return;
        }
        
        document.body.classList.add('opacity-100');
        if (loader) loader.loaded();
        
        // Mostra primeiro slide
        slides[0].classList.add('opacity-100', 'z-10');
        slides[0].classList.remove('opacity-0');
        
        if (slides.length === 1) {
            setTimeout(function() {
                if (loader) loader.finished();
            }, config.slideTime);
            return;
        }
        
        var current = 0;
        var slideCount = 1;
        
        var interval = setInterval(function() {
            // Esconde slide atual
            slides[current].classList.remove('opacity-100', 'z-10');
            slides[current].classList.add('opacity-0', 'z-0');
            
            // Próximo slide
            current = (current + 1) % slides.length;
            slideCount++;
            
            // Mostra novo slide
            slides[current].classList.remove('opacity-0', 'z-0');
            slides[current].classList.add('opacity-100', 'z-10');
            
            // Para após exibir todos
            if (slideCount >= slides.length) {
                clearInterval(interval);
                
                setTimeout(function() {
                    slides[current].classList.remove('opacity-100');
                    slides[current].classList.add('opacity-0');
                    if (loader) loader.finished();
                }, config.slideTime);
            }
        }, config.slideTime);
    }
    
    // ========================================
    // DETECÇÃO DE MODO: DESENVOLVIMENTO OU PRODUÇÃO
    // ========================================
    
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        // ============================================
        // MODO DESENVOLVIMENTO - Usando Mock Data
        // ============================================
        console.log('=== MODO DESENVOLVIMENTO ===');
        console.log('Usando dados mockados para testes');
        
        var config = {
            duration: MOCK_DATA.config.duration || 30000,
            slideTime: MOCK_DATA.config.slideTime || 5000,
            maxItems: MOCK_DATA.config.maxItems || 10,
            showLogo: MOCK_DATA.config.showLogo !== false
        };
        
        // Limita quantidade de itens
        var dados = MOCK_DATA.dados.slice(0, config.maxItems);
        
        if (dados.length === 0) {
            console.warn('Nenhum dado mockado disponível');
            return;
        }
        
        // Loader mockado para simular EBHTML
        var mockLoader = {
            loaded: function() {
                console.log('[Mock] Template carregado');
            },
            finished: function() {
                console.log('[Mock] Template finalizado');
            }
        };
        
        // Inicia template com dados mockados
        iniciarTemplate(dados, config, mockLoader);
        
    } else {
        // ============================================
        // MODO PRODUÇÃO - Dados do EdgeContents
        // ============================================
        console.log('=== MODO PRODUÇÃO ===');
        console.log('Carregando dados do EdgeContents');
        
        ebhtml.create2({}, function(loader) {
            // Registra dataset do EdgeContents
            loader.addData('D_INSTITUCIONAL', false);  // false = não obrigatório
            loader.autoloaded = false;  // Controle manual
            loader.nodataiserror = false;  // Sem dados não é erro
            
            loader.load(function() {
                // Verifica se há dados disponíveis
                if (loader.data('D_INSTITUCIONAL') == undefined) {
                    console.error('ERRO: Nenhum dado disponível do EdgeContents');
                    // ❌ NÃO chama loader.loaded() em caso de erro
                    // ✅ Apenas finaliza
                    loader.finished();
                    return;
                }
                
                // Processa dados do EdgeContents
                var dadosReais = [];
                var config = {
                    duration: 30000,
                    slideTime: 5000,
                    maxItems: 10,
                    showLogo: true
                };
                
                // Tenta carregar configurações personalizadas
                try {
                    var durationData = loader.data('D_INSTITUCIONAL').value('DURATION').value;
                    if (durationData) config.duration = parseInt(durationData);
                } catch (e) {
                    console.log('Usando duration padrão');
                }
                
                try {
                    var slideTimeData = loader.data('D_INSTITUCIONAL').value('SLIDE_TIME').value;
                    if (slideTimeData) config.slideTime = parseInt(slideTimeData);
                } catch (e) {
                    console.log('Usando slideTime padrão');
                }
                
                // Carrega lista de itens
                var lista = loader.datalist('D_INSTITUCIONAL');
                var total = lista.count();
                
                for (var i = 0; i < total && i < config.maxItems; i++) {
                    try {
                        var registro = lista.get(i);
                        dadosReais.push({
                            titulo: registro.value('titulo').value,
                            descricao: registro.value('descricao').value
                        });
                    } catch (e) {
                        console.warn('Erro ao processar item ' + i + ': ' + e);
                    }
                }
                
                if (dadosReais.length === 0) {
                    console.warn('Nenhum item processado');
                    loader.loaded();
                    loader.finished();
                    return;
                }
                
                console.log('Total de itens carregados: ' + dadosReais.length);
                
                // Inicia template com dados reais
                iniciarTemplate(dadosReais, config, loader);
            });
        });
    }
};
