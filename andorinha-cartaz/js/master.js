/**
 * master.js - Andorinha Cartaz (Template Simplificado)
 * 
 * Exibe preços de supermercado em 4 condições:
 * - REGULAR: preço comum
 * - DEPOR: preço promocional (mostra preço antigo riscado)
 * - FIDELIDADE: preço para clientes fidelidade (badge azul)
 * - APARTIRDE: "a partir de" com dois preços (principal + secundário)
 */

// ─── CONFIGURAÇÃO ───────────────────────────────────────────────────────────
var DURATION = 15000;  // 15 segundos
var DATASET = 'D_MENUBOARD_PRICES';

// ─── CARREGAMENTO ──────────────────────────────────────────────────────────
window.onload = function() {
    // Mock ou EdgeContents?
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        console.log('[Mock] Modo de teste ativado');
        var mockLoader = {
            loaded: function() { console.log('[Mock] Carregado'); },
            finished: function() { console.log('[Mock] Finalizado'); }
        };
        renderizar(MOCK_DATA.produto, mockLoader);
    } else {
        // EdgeContents CMS
        ebhtml.create2({}, function(loader) {
            loader.addData(DATASET, false);
            loader.autoloaded = false;
            loader.nodataiserror = false;
            
            loader.load(function() {
                if (loader.data(DATASET) == undefined) {
                    console.error('[ERRO] Sem dados no dataset ' + DATASET);
                    loader.finished();
                    return;
                }
                
                var item = loader.data(DATASET);
                var dados = {
                    titulo: getField(item, 'TITULO'),
                    price: getField(item, 'PRICE'),
                    price2: getField(item, 'PRICE2'),      // preço antigo (DEPOR) ou preço secundário (APARTIRDE)
                    condicao: getField(item, 'TEXTO3'),    // REGULAR/DEPOR/FIDELIDADE/APARTIRDE
                    unit: getField(item, 'TEXTO4'),        // kg/L/un
                    legal: getField(item, 'TEXTO5')        // texto legal (rodapé)
                };
                
                renderizar(dados, loader);
            });
        });
    }
};

// ─── HELPERS ────────────────────────────────────────────────────────────────
function getField(item, fieldName) {
    if (!item) return '';
    var field = item.value(fieldName);
    return field && field.value ? field.value : '';
}

function formatarPreco(valor) {
    var num = parseFloat(valor);
    if (isNaN(num)) num = 0;
    
    var fixed = num.toFixed(2);
    var parts = fixed.split('.');
    var inteiro = parts[0];
    var centavos = parts[1] || '00';
    
    // Separador de milhar
    var inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return {
        inteiro: inteiroFormatado,
        centavos: centavos,
        completo: inteiroFormatado + ',' + centavos
    };
}

function normalizarCondicao(condicao) {
    if (!condicao) return 'regular';
    var c = condicao.toLowerCase().replace(/[_\s-]/g, '');
    
    if (c === 'depor' || c === 'de' || c === 'por' || c === 'promocao') return 'depor';
    if (c === 'fidelidade' || c === 'club' || c === 'clube') return 'fidelidade';
    if (c === 'apartirde' || c === 'apartir' || c === 'a partir') return 'apartirde';
    
    return 'regular';
}

function aplicarBackground(condicao) {
    var bgMap = {
        'regular': 'img/backgrounds/regular.jpg',
        'depor': 'img/backgrounds/depor.jpg',
        'fidelidade': 'img/backgrounds/fidelidade.jpg',
        'apartirde': 'img/backgrounds/apartirde.jpg'
    };
    
    var bgPath = bgMap[condicao] || bgMap['regular'];
    var bgContainer = document.getElementById('background_container');
    
    if (bgContainer) {
        var img = document.createElement('img');
        img.src = bgPath;
        img.className = 'absolute inset-0 w-full h-full object-cover';
        bgContainer.appendChild(img);
    }
}

// ─── RENDERIZAÇÃO PRINCIPAL ────────────────────────────────────────────────
function renderizar(dados, loader) {
    console.log('[Renderizar]', dados);
    
    // 1. Título
    var tituloEl = document.getElementById('titulo');
    if (tituloEl) {
        tituloEl.textContent = dados.titulo || 'PRODUTO';
    }
    
    // 2. Condição
    var condicao = normalizarCondicao(dados.condicao);
    console.log('[Condição]', condicao);
    
    // 3. Background
    aplicarBackground(condicao);
    
    // 4. Preço (de acordo com condição)
    var preco = formatarPreco(dados.price);
    var preco2 = dados.price2 ? formatarPreco(dados.price2) : null;
    
    if (condicao === 'depor') {
        renderizarDepor(preco, preco2, dados.unit);
    } else if (condicao === 'fidelidade') {
        renderizarFidelidade(preco, dados.unit);
    } else if (condicao === 'apartirde') {
        renderizarAPartirDe(preco, preco2, dados.unit);
    } else {
        renderizarRegular(preco, dados.unit);
    }
    
    // 5. Texto legal (rodapé)
    var legalEl = document.getElementById('legal_text');
    if (legalEl && dados.legal) {
        legalEl.textContent = dados.legal;
    }
    
    // 6. Animação de entrada
    var body = document.body;
    var fullContent = document.getElementById('fullContent');
    
    setTimeout(function() {
        body.classList.remove('opacity-0');
        body.classList.add('opacity-100');
        
        if (fullContent) {
            fullContent.classList.remove('opacity-0');
            fullContent.classList.add('opacity-100');
        }
        
        loader.loaded();  // ✅ Sucesso
        
        // Finalizar após duração
        setTimeout(function() {
            loader.finished();
        }, DURATION);
    }, 100);
}

// ─── RENDERIZADORES POR CONDIÇÃO ───────────────────────────────────────────

/**
 * REGULAR: Preço comum sem extras
 */
function renderizarRegular(preco, unit) {
    var priceDisplay = document.getElementById('price_display');
    if (!priceDisplay) return;
    
    priceDisplay.innerHTML = '';
    
    // Container principal
    var container = document.createElement('div');
    container.className = 'flex flex-col items-center justify-center w-full';
    
    // Linha do preço
    var priceRow = document.createElement('div');
    priceRow.className = 'flex items-start justify-center';
    
    // R$
    var simbolo = document.createElement('div');
    simbolo.className = 'text-[#FF0000] text-[12vmin] font-bold mt-[2vmin]';
    simbolo.textContent = 'R$';
    
    // Parte inteira
    var inteiro = document.createElement('div');
    inteiro.className = 'text-[#FF0000] text-[32vmin] font-bold leading-none';
    inteiro.textContent = preco.inteiro;
    
    // Parte decimal
    var centavos = document.createElement('div');
    centavos.className = 'text-[#FF0000] text-[12vmin] font-bold mt-[2vmin]';
    centavos.textContent = ',' + preco.centavos;
    
    priceRow.appendChild(simbolo);
    priceRow.appendChild(inteiro);
    priceRow.appendChild(centavos);
    
    // Unidade (kg, L, un)
    if (unit) {
        var unitEl = document.createElement('div');
        unitEl.className = 'text-[#FF0000] text-[8vmin] font-bold mt-[1vmin]';
        unitEl.textContent = unit;
        container.appendChild(priceRow);
        container.appendChild(unitEl);
    } else {
        container.appendChild(priceRow);
    }
    
    priceDisplay.appendChild(container);
}

/**
 * DEPOR: Preço promocional com preço antigo riscado acima
 */
function renderizarDepor(preco, precoAntigo, unit) {
    var priceDisplay = document.getElementById('price_display');
    if (!priceDisplay) return;
    
    priceDisplay.innerHTML = '';
    
    // Container principal
    var container = document.createElement('div');
    container.className = 'flex flex-col items-center justify-center w-full';
    
    // Preço antigo (riscado) - ACIMA
    if (precoAntigo) {
        var oldPriceRow = document.createElement('div');
        oldPriceRow.className = 'flex items-center justify-center mb-[1vmin]';
        
        var oldPrice = document.createElement('div');
        oldPrice.className = 'text-[#000000] text-[6vmin] font-bold line-through opacity-70';
        oldPrice.textContent = 'R$ ' + precoAntigo.completo;
        
        oldPriceRow.appendChild(oldPrice);
        container.appendChild(oldPriceRow);
    }
    
    // Preço novo (grande)
    var priceRow = document.createElement('div');
    priceRow.className = 'flex items-start justify-center';
    
    // R$
    var simbolo = document.createElement('div');
    simbolo.className = 'text-[#FF0000] text-[12vmin] font-bold mt-[2vmin]';
    simbolo.textContent = 'R$';
    
    // Parte inteira
    var inteiro = document.createElement('div');
    inteiro.className = 'text-[#FF0000] text-[32vmin] font-bold leading-none';
    inteiro.textContent = preco.inteiro;
    
    // Parte decimal
    var centavos = document.createElement('div');
    centavos.className = 'text-[#FF0000] text-[12vmin] font-bold mt-[2vmin]';
    centavos.textContent = ',' + preco.centavos;
    
    priceRow.appendChild(simbolo);
    priceRow.appendChild(inteiro);
    priceRow.appendChild(centavos);
    
    container.appendChild(priceRow);
    
    // Unidade
    if (unit) {
        var unitEl = document.createElement('div');
        unitEl.className = 'text-[#FF0000] text-[8vmin] font-bold mt-[1vmin]';
        unitEl.textContent = unit;
        container.appendChild(unitEl);
    }
    
    priceDisplay.appendChild(container);
}

/**
 * FIDELIDADE: Preço com badge azul "FIDELIDADE"
 */
function renderizarFidelidade(preco, unit) {
    var priceDisplay = document.getElementById('price_display');
    if (!priceDisplay) return;
    
    priceDisplay.innerHTML = '';
    
    // Container principal
    var container = document.createElement('div');
    container.className = 'flex flex-col items-center justify-center w-full';
    
    // Badge "FIDELIDADE"
    var badge = document.createElement('div');
    badge.className = 'bg-[#0000FF] text-white text-[5vmin] font-bold px-[4vmin] py-[1vmin] rounded-lg mb-[2vmin]';
    badge.textContent = 'FIDELIDADE';
    container.appendChild(badge);
    
    // Linha do preço
    var priceRow = document.createElement('div');
    priceRow.className = 'flex items-start justify-center';
    
    // R$
    var simbolo = document.createElement('div');
    simbolo.className = 'text-[#0000FF] text-[12vmin] font-bold mt-[2vmin]';
    simbolo.textContent = 'R$';
    
    // Parte inteira
    var inteiro = document.createElement('div');
    inteiro.className = 'text-[#0000FF] text-[32vmin] font-bold leading-none';
    inteiro.textContent = preco.inteiro;
    
    // Parte decimal
    var centavos = document.createElement('div');
    centavos.className = 'text-[#0000FF] text-[12vmin] font-bold mt-[2vmin]';
    centavos.textContent = ',' + preco.centavos;
    
    priceRow.appendChild(simbolo);
    priceRow.appendChild(inteiro);
    priceRow.appendChild(centavos);
    
    container.appendChild(priceRow);
    
    // Unidade
    if (unit) {
        var unitEl = document.createElement('div');
        unitEl.className = 'text-[#0000FF] text-[8vmin] font-bold mt-[1vmin]';
        unitEl.textContent = unit;
        container.appendChild(unitEl);
    }
    
    priceDisplay.appendChild(container);
}

/**
 * APARTIRDE: "a partir de" com dois preços
 */
function renderizarAPartirDe(preco, preco2, unit) {
    var priceDisplay = document.getElementById('price_display');
    if (!priceDisplay) return;
    
    priceDisplay.innerHTML = '';
    
    // Container principal
    var container = document.createElement('div');
    container.className = 'flex flex-col items-center justify-center w-full';
    
    // Label "A PARTIR DE"
    var label = document.createElement('div');
    label.className = 'text-[#FF6B9D] text-[5vmin] font-bold mb-[1vmin]';
    label.textContent = 'A PARTIR DE';
    container.appendChild(label);
    
    // Preço principal (grande)
    var priceRow = document.createElement('div');
    priceRow.className = 'flex items-start justify-center';
    
    // R$
    var simbolo = document.createElement('div');
    simbolo.className = 'text-[#FF6B9D] text-[12vmin] font-bold mt-[2vmin]';
    simbolo.textContent = 'R$';
    
    // Parte inteira
    var inteiro = document.createElement('div');
    inteiro.className = 'text-[#FF6B9D] text-[32vmin] font-bold leading-none';
    inteiro.textContent = preco.inteiro;
    
    // Parte decimal
    var centavos = document.createElement('div');
    centavos.className = 'text-[#FF6B9D] text-[12vmin] font-bold mt-[2vmin]';
    centavos.textContent = ',' + preco.centavos;
    
    priceRow.appendChild(simbolo);
    priceRow.appendChild(inteiro);
    priceRow.appendChild(centavos);
    
    container.appendChild(priceRow);
    
    // Unidade
    if (unit) {
        var unitEl = document.createElement('div');
        unitEl.className = 'text-[#FF6B9D] text-[8vmin] font-bold mt-[1vmin]';
        unitEl.textContent = unit;
        container.appendChild(unitEl);
    }
    
    // Preço secundário (se houver) - menor, abaixo
    if (preco2) {
        var price2Row = document.createElement('div');
        price2Row.className = 'flex items-center justify-center mt-[2vmin]';
        
        var price2 = document.createElement('div');
        price2.className = 'text-[#FF6B9D] text-[6vmin] font-bold';
        price2.textContent = 'ou R$ ' + preco2.completo;
        if (unit) price2.textContent += ' ' + unit;
        
        price2Row.appendChild(price2);
        container.appendChild(price2Row);
    }
    
    priceDisplay.appendChild(container);
}
