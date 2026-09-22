/**
 * Master Script - c2r_busdoor
 * Template para exibição dinâmica de portas de ônibus
 * Faz correspondência entre D_LOCAL e D_OLHOVIVO
 */

/**
 * ⚙️ CONFIGURAÇÕES GLOBAIS - EDITE AQUI!
 */
var CONFIG = {
    // Duração total de exibição (em milissegundos)
    duration: 10000,           // 10 segundos
    
    // Tempo de animação fade-in ao carregar
    fadeInDuration: 200,      // 0.5 segundos
    
    // Tempo de animação fade-out ao sair
    fadeOutDuration: 200,     // 0.5 segundos
    
    // Debug: ativar logs detalhados no console
    debug: false,
    
    // Número padrão se não conseguir extrair dados
    numeroFallback: '----',
    
    // Ativar correspondência automática (true) ou usar primeiro registro (false)
    autoMatching: true
};

window.onload = function() {
    // Verificar se está em modo mock (desenvolvimento)
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = MOCK_DATA.getMockLoader();
        iniciarTemplate(mockLoader);
    } else {
        iniciarComEdgeContents();
    }
};

/**
 * Inicializar com EdgeContents (produção)
 */
function iniciarComEdgeContents() {
    ebhtml.create2({}, function(loader) {
        // Registrar datasets
        loader.addData('D_LOCAL', false);       // Opcional: informações do local
        loader.addData('D_OLHOVIVO', false);    // Opcional: dados de ônibus/linha
        
        loader.autoloaded = false;
        loader.nodataiserror = false;
        
        // Carregar dados
        loader.load(function() {
            // Verificar se D_OLHOVIVO tem dados
            if (loader.data('D_OLHOVIVO') === undefined) {
                console.error('[c2r_busdoor] ERRO: D_OLHOVIVO vazio');
                loader.finished();
                return;
            }
            
            iniciarTemplate(loader);
        });
    });
}

/**
 * Iniciar template: extração de dados, correspondência e renderização
 */
function iniciarTemplate(loader) {
    try {
        // Extrair dados dos datasets
        var dados = extrairDados(loader);
        
        if (!dados) {
            console.error('[c2r_busdoor] Falha na extração de dados');
            loader.finished();
            return;
        }
        
        if (CONFIG.debug) console.log('[c2r_busdoor] Dados extraídos:', dados);
        
        // Renderizar na tela
        renderizarTemplate(dados);
        
        // Notificar carregamento bem-sucedido
        if (loader.loaded) {
            loader.loaded();
        }
        
        // Scheduler para finalização
        setTimeout(function() {
            finalizarTemplate(loader);
        }, CONFIG.duration);
        
    } catch (erro) {
        console.error('[c2r_busdoor] Erro ao iniciar template:', erro);
        if (loader.finished) {
            loader.finished();
        }
    }
}

/**
 * Extrair e corresponder dados entre D_LOCAL e D_OLHOVIVO
 */
function extrairDados(loader) {
    try {
        // Obter primeiro registro de D_LOCAL
        var localData = loader.data('D_LOCAL');
        if (!localData) {
            console.warn('[c2r_busdoor] D_LOCAL sem dados, usando fallback');
            localData = {};
        }
        
        // Extrair IDs para correspondência
        var localId = obterCampo(localData, 'ID');
        var screenCustomerId = obterCampo(localData, 'SCREEN_CUSTOMERID');
        
        if (CONFIG.debug) console.log('[c2r_busdoor] Procurando correspondência: ID=' + localId + ', SCREEN_CUSTOMERID=' + screenCustomerId);
        
        // Buscar correspondência em D_OLHOVIVO
        var olhovivoData = buscarCorrespondencia(loader, localId, screenCustomerId);
        if (!olhovivoData) {
            console.warn('[c2r_busdoor] Sem correspondência encontrada, usando primeiro registro de D_OLHOVIVO');
            olhovivoData = loader.data('D_OLHOVIVO');
        }
        
        // Montar objeto unificado
        var resultado = {
            // De D_LOCAL
            localId: localId,
            screen: obterCampo(localData, 'SCREEN'),
            site: obterCampo(localData, 'SITE'),
            city: obterCampo(localData, 'SITE_CITY'),
            state: obterCampo(localData, 'SITE_STATE'),
            screenCustomerId: screenCustomerId,
            
            // De D_OLHOVIVO
            olhovivoId: obterCampo(olhovivoData, 'ID'),
            texto: obterCampo(olhovivoData, 'TEXTO'),          // NÚMERO GIGANTE!
            texto1: obterCampo(olhovivoData, 'TEXTO1'),
            texto2: obterCampo(olhovivoData, 'TEXTO2'),
            titulo: obterCampo(olhovivoData, 'TITULO'),
            local: obterCampo(olhovivoData, 'LOCAL')
        };
        
        return resultado;
        
    } catch (erro) {
        console.error('[c2r_busdoor] Erro ao extrair dados:', erro);
        return null;
    }
}

/**
 * Buscar registro correspondente em D_OLHOVIVO
 * Faz match entre:
 * - D_LOCAL.ID com D_OLHOVIVO.LOCAL
 * - D_LOCAL.SCREEN_CUSTOMERID com D_OLHOVIVO.TITULO
 */
function buscarCorrespondencia(loader, localId, screenCustomerId) {
    try {
        var lista = loader.datalist('D_OLHOVIVO');
        if (!lista || lista.count() === 0) {
            return null;
        }
        
        // Iterar registros procurando correspondência
        for (var i = 0; i < lista.count(); i++) {
            var item = lista.get(i);
            
            var local = obterCampo(item, 'LOCAL');
            var titulo = obterCampo(item, 'TITULO');
            
            // Verificar correspondência (pode usar um ou ambos os campos)
            if ((localId && local === localId) || (screenCustomerId && titulo === screenCustomerId)) {
                return item;
            }
        }
        
        return null;
        
    } catch (erro) {
        console.error('[c2r_busdoor] Erro ao buscar correspondência:', erro);
        return null;
    }
}

/**
 * Obter valor de campo com fallback
 * Suporta tanto loader.data() quanto objetos diretos
 */
function obterCampo(item, campo) {
    if (!item) {
        return '';
    }
    
    // Se item tem método value() (EBHTML API)
    if (typeof item.value === 'function') {
        var valorObj = item.value(campo);
        if (valorObj && valorObj.value) {
            return String(valorObj.value).trim();
        }
    }
    
    // Se item é objeto direto (mock data)
    if (item[campo]) {
        return String(item[campo]).trim();
    }
    
    return '';
}

/**
 * Renderizar template na tela
 */
function renderizarTemplate(dados) {
    try {
        var container = document.getElementById('content');
        
        if (!container) {
            console.error('[c2r_busdoor] Container #content não encontrado');
            return;
        }
        
        // Limpar container
        container.innerHTML = '';
        
        // Criar elemento do número gigante
        var numeroDiv = document.createElement('div');
        numeroDiv.className = 'numero-linha font-roboto-black text-white leading-none text-center';
        numeroDiv.textContent = dados.texto || CONFIG.numeroFallback;
        
        container.appendChild(numeroDiv);
        
        // Animar body (fade-in)
        document.body.classList.remove('opacity-0');
        document.body.classList.add('opacity-100');
        
        if (CONFIG.debug) console.log('[c2r_busdoor] Template renderizado com número: ' + (dados.texto || CONFIG.numeroFallback));
        
    } catch (erro) {
        console.error('[c2r_busdoor] Erro ao renderizar template:', erro);
    }
}

/**
 * Finalizar template: fade out e notificar conclusão
 */
function finalizarTemplate(loader) {
    try {
        if (CONFIG.debug) console.log('[c2r_busdoor] Finalizando template...');
        
        // Fade out
        document.body.classList.remove('opacity-100');
        document.body.classList.add('opacity-0');
        
        // Pequeno delay para animar
        setTimeout(function() {
            if (loader && loader.finished) {
                loader.finished();
            }
        }, CONFIG.fadeOutDuration);
        
    } catch (erro) {
        console.error('[c2r_busdoor] Erro ao finalizar template:', erro);
        if (loader && loader.finished) {
            loader.finished();
        }
    }
}

// Fallback: method polyfill para Array.prototype.padStart (ES5 compatibility)
if (!String.prototype.padStart) {
    String.prototype.padStart = function(targetLength, padString) {
        targetLength = targetLength >> 0;
        padString = String(padString || ' ');
        if (this.length >= targetLength) {
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
