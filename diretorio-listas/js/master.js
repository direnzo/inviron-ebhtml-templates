/**
 * DIRETÓRIO DE CONDOMÍNIO - Template para condomínios
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

// Dataset principal (altere conforme necessário)
var DATASET = 'D_CONDOMINIO';

// Configurações
// duration e debug: valores fallback usados se TEXTO8 não for enviado
var config = {
    duration: 20000,           // tempo total (ms) - sobrescrito por TEXTO8
    debug: false               // exibir logs no console
};

// Variáveis globais
var scrollInterval = null;
var allItems = [];

// Função para ajustar fonte até caber no container
function fitDescriptionFont(el, container, minFont, maxFont) {
    if (!el || !container) { return; }
    if (!minFont) { minFont = 10; }
    if (!maxFont) { maxFont = 100; }
    if (!el.innerHTML || el.innerHTML.replace(/\s/g, '') === '') { return; }

    try {
        el.style.fontSize = maxFont + 'px';
        var fontSize = maxFont;
        var cw = container.clientWidth;
        var ch = container.clientHeight;
        if (cw <= 0 || ch <= 0) { return; }

        while (fontSize > minFont) {
            if (el.scrollWidth <= cw && el.scrollHeight <= ch) { break; }
            fontSize -= 1;
            el.style.fontSize = fontSize + 'px';
        }
    } catch (e) {
        el.style.fontSize = '16px';
    }
}

// Detecção de plataforma
function isAndroid() {
    return /Android/i.test(navigator.userAgent);
}

function isWeakDevice() {
    var dpr = window.devicePixelRatio || 1;
    var w = window.innerWidth || 0;
    return isAndroid() && (dpr <= 1 || w <= 1280);
}

// Aplica cores dinâmicas via CSS custom properties
function aplicarCores(corFundo, corCard, corDestaque, corTexto, corTitulo) {
    var root = document.documentElement;
    root.style.setProperty('--cor-fundo', corFundo);
    root.style.setProperty('--cor-card', corCard);
    root.style.setProperty('--cor-destaque', corDestaque);
    root.style.setProperty('--cor-texto', corTexto);
    root.style.setProperty('--cor-titulo', corTitulo || corTexto);
    
    // Aplicar diretamente no body
    document.body.style.backgroundColor = corFundo;
    document.body.style.color = corTexto;
}

// Mostra/oculta colunas conforme necessário
function toggleColumns(numCols) {
    var col2 = document.getElementById('col2');
    var col3 = document.getElementById('col3');
    
    if (col2) {
        if (numCols >= 2) { col2.classList.remove('hidden'); }
        else { col2.classList.add('hidden'); }
    }
    if (col3) {
        if (numCols >= 3) { col3.classList.remove('hidden'); }
        else { col3.classList.add('hidden'); }
    }
}

// Função para criar item da lista simplificada
function createListItem(itemData, index) {
    var template = document.getElementById('tpl-list-item');
    var clone = document.importNode(template.content, true);
    var item = clone.querySelector('.list-item');
    
    // Preencher dados
    var nomeEl = clone.getElementById('nome');
    var logoContainer = clone.getElementById('logoContainer');
    var logoEl = clone.getElementById('logo');
    var andarContainer = clone.getElementById('andarContainer');
    var andarEl = clone.getElementById('andar');
    var conjuntoContainer = clone.getElementById('conjuntoContainer');
    var conjuntoEl = clone.getElementById('conjunto');
    var extraText = clone.getElementById('extraText');
    
    // Nome (obrigatório)
    if (nomeEl && itemData.TITULO && itemData.TITULO.value) {
        nomeEl.textContent = itemData.TITULO.value;
    }
    
    // Logo (opcional) - campo FOTO no XML
    if (logoContainer && logoEl && itemData.FOTO && itemData.FOTO.value) {
        logoContainer.classList.remove('hidden');
        logoEl.src = itemData.FOTO.value;
        logoEl.alt = 'Logo ' + (itemData.TITULO ? itemData.TITULO.value : '');
    }
    
    // Andar (opcional) - campo TEXTO2
    if (andarContainer && andarEl && itemData.TEXTO2 && itemData.TEXTO2.value) {
        andarContainer.classList.remove('hidden');
        andarEl.textContent = itemData.TEXTO2.value + ' andar';
    }
    
    // Conjunto (opcional) - campo TEXTO3
    if (conjuntoContainer && conjuntoEl && itemData.TEXTO3 && itemData.TEXTO3.value) {
        conjuntoContainer.classList.remove('hidden');
        conjuntoEl.textContent = 'Conjunto: ' + itemData.TEXTO3.value;
    }
    
    // Informação extra (opcional) - campo TEXTO
    if (extraText && itemData.TEXTO && itemData.TEXTO.value) {
        extraText.classList.remove('hidden');
        extraText.textContent = itemData.TEXTO.value;
    }
    
    // Invisível durante montagem
    item.classList.add('opacity-0');
    item.classList.add('transition-all');
    item.classList.add('duration-500');
    
    return item;
}

// Dispara fade-in sequencial nos itens
function triggerFadeIn() {
    var items = document.querySelectorAll('.list-item');
    for (var i = 0; i < items.length; i++) {
        (function(idx, el) {
            setTimeout(function() {
                el.classList.remove('opacity-0');
                el.classList.add('opacity-100');
            }, idx * 60);
        })(i, items[i]);
    }
}

// Função para distribuir itens em colunas
function distributeItems(items, columns) {
    var columnsArray = [];
    for (var i = 0; i < columns; i++) {
        columnsArray.push([]);
    }
    
    for (var i = 0; i < items.length; i++) {
        var colIndex = i % columns;
        columnsArray[colIndex].push(items[i]);
    }
    
    return columnsArray;
}

// Função para renderizar colunas
function renderColumns(columnsArray, corCard) {
    var col1 = document.getElementById('listCol1');
    var col2 = document.getElementById('listCol2');
    var col3 = document.getElementById('listCol3');
    
    // Limpar colunas
    col1.innerHTML = '';
    if (col2) col2.innerHTML = '';
    if (col3) col3.innerHTML = '';
    
    // Renderizar cada coluna
    for (var i = 0; i < columnsArray.length; i++) {
        var column = columnsArray[i];
        var targetCol = i === 0 ? col1 : (i === 1 ? col2 : col3);
        
        if (!targetCol) continue;
        
        for (var j = 0; j < column.length; j++) {
            var item = createListItem(column[j], j);
            targetCol.appendChild(item);
        }
    }
}

// Função para iniciar rolagem automática suave no columnsWrapper
// scrollDuration = tempo total disponivel para completar o scroll (ms)
function startAutoScroll(scrollDuration) {
    var wrapper = document.getElementById('columnsWrapper');
    var container = document.getElementById('listContainer');
    if (!wrapper || !container) return;
    
    clearInterval(scrollInterval);
    scrollInterval = null;
    
    // Delay de 1s antes de iniciar o scroll
    setTimeout(function() {
        var scrollH = wrapper.scrollHeight;
        var clientH = container.clientHeight;
        
        // Só inicia scroll se o conteúdo ultrapassar o container
        if (scrollH <= clientH + 5) { return; }
        
        var maxScroll = scrollH - clientH;
        var startTime = Date.now();
        
        wrapper.style.transition = 'none';
        
        scrollInterval = setInterval(function() {
            var elapsed = Date.now() - startTime;
            var progress = elapsed / scrollDuration;
            
            if (progress >= 1) {
                // Fim do scroll - mantém no final
                wrapper.style.transition = 'none';
                wrapper.style.transform = 'translateY(-' + maxScroll + 'px)';
                clearInterval(scrollInterval);
                scrollInterval = null;
                return;
            }
            
            var pos = progress * maxScroll;
            wrapper.style.transform = 'translateY(-' + pos + 'px)';
        }, 16); // ~60fps
    }, 1000); // 1s de delay inicial
}


// Função principal para iniciar template
function iniciarTemplate(dados, config, loader) {
    var titleEl = document.getElementById('title');
    var subtitleEl = document.getElementById('subtitle');
    
    // Helper: ler campo do dataset (via dados.value() do EBHTML)
    function lerCampo(nome) {
        try {
            var v = dados.value(nome);
            return (v && v.value) ? v.value : '';
        } catch (e) {
            return '';
        }
    }
    
    // ─── TÍTULO E SUBTÍTULO ───
    var titulo = lerCampo('TITULO') || 'Diretório';
    var sub = lerCampo('SUBTITULO') || '';
    if (titleEl) titleEl.textContent = titulo;
    if (subtitleEl) subtitleEl.textContent = sub;
    
    // ─── CORES (TEXTO4) ───
    var corFundo = '#1a202c';
    var corCard = '#2d3748';
    var corDestaque = '#4299e1';
    var corTexto = '#ffffff';
    var corTitulo = '#ffffff';
    
    var coresStr = lerCampo('TEXTO4');
    if (coresStr) {
        var cores = coresStr.split(',');
        if (cores.length >= 1 && cores[0]) { corFundo = cores[0]; }
        if (cores.length >= 2 && cores[1]) { corCard = cores[1]; }
        if (cores.length >= 3 && cores[2]) { corDestaque = cores[2]; }
        if (cores.length >= 4 && cores[3]) { corTexto = cores[3]; }
        if (cores.length >= 5 && cores[4]) { corTitulo = cores[4]; }
    }
    aplicarCores(corFundo, corCard, corDestaque, corTexto, corTitulo);
    
    // Aplicar cor do título no elemento h1
    if (titleEl && corTitulo) {
        titleEl.style.color = corTitulo;
    }
     // Aplicar cor do subtítulo no elemento h2
    if (subtitleEl && corTitulo) {
        subtitleEl.style.color = corTitulo;
    }

    
    // ─── COLUNAS (TEXTO5) ───
    var columns = 3;
    var colStr = lerCampo('TEXTO5');
    if (colStr) {
        var c = parseInt(colStr, 10);
        if (!isNaN(c) && c >= 1 && c <= 3) { columns = c; }
    }
    
    // ─── BACKGROUND (TEXTO6) ───
    var bgSrc = lerCampo('TEXTO6');
    if (bgSrc) {
        var bgEl = document.getElementById('bgImage');
        if (bgEl) {
            bgEl.src = bgSrc;
            bgEl.classList.remove('hidden');
        }
    }
    
    // ─── LOGO CONDOMÍNIO (TEXTO7) ───
    var logoSrc = lerCampo('TEXTO7');
    if (logoSrc) {
        var logoEl = document.getElementById('condoLogo');
        if (logoEl) {
            logoEl.src = logoSrc;
            logoEl.classList.remove('hidden');
        }
    }
    
    // ─── DURAÇÃO (TEXTO8) ───
    var duration = config.duration;
    var durStr = lerCampo('TEXTO8');
    if (durStr) {
        var d = parseInt(durStr, 10) * 1000;
        if (!isNaN(d) && d >= 5000) { duration = d; }
    }
    
    // ─── LISTA DE ITENS (PULAR PRIMEIRO = CONFIG) ───
    var lista = loader.datalist(DATASET);
    if (!lista || lista.count() === 0) {
        console.warn('[Diretório] Nenhum item');
        var col1 = document.getElementById('listCol1');
        if (col1) {
            col1.innerHTML = '<div class="text-center py-8">Nenhum registro</div>';
        }
        loader.loaded();
        setTimeout(function() { loader.finished(); }, duration);
        return;
    }
    
    allItems = [];
    // Pula o primeiro item (index 0 = config global)
    var startIdx = (lista.count() > 1) ? 1 : 0;
    for (var i = startIdx; i < lista.count(); i++) {
        var reg = lista.get(i);
        allItems.push({
            TITULO: reg.value('TITULO'),
            FOTO: reg.value('FOTO'),
            TEXTO2: reg.value('TEXTO2'),
            TEXTO3: reg.value('TEXTO3'),
            TEXTO: reg.value('TEXTO')
        });
    }
    
    // Se não houver itens após pular config
    if (allItems.length === 0) {
        allItems = [{
            TITULO: { value: '' },
            FOTO: { value: '' },
            TEXTO2: { value: '' },
            TEXTO3: { value: '' },
            TEXTO: { value: 'Nenhuma empresa cadastrada' }
        }];
    }
    
    // Ajustar colunas se houver poucos itens
    if (allItems.length <= 5 && columns > 2) { columns = 2; }
    if (allItems.length <= 3 && columns > 1) { columns = 1; }
    
    toggleColumns(columns);
    var colsArray = distributeItems(allItems, columns);
    renderColumns(colsArray, corCard);
    

    
    // Auto scroll — leva (duration - 3s) para completar o trajeto
    startAutoScroll(duration - 3000);
    
    // Tudo montado: fade-in do body + itens
    setTimeout(function() {
        document.body.classList.remove('opacity-0');
        document.body.classList.add('opacity-100');
        triggerFadeIn();
       
    }, 500);
    
    // Finished após duração
    setTimeout(function() {
        loader.finished();
    }, duration);
}

// ─── MODO PLAYER (Digital Signage normal) ────────────────────────────────────

function playerView() {
    var body = document.body;

    // Degradação para hardware fraco
    if (isWeakDevice()) {
        body.classList.add('reduced');
        if (config.debug) console.log('[Diretório] Hardware fraco detectado; aplicando .reduced');
    }

    // Se MOCK ativo, usar modo simulado
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        console.log('[Mock] Usando MOCK_DATA');

        var mockConfig = MOCK_DATA.dados[0] || {};
        var mockItems = MOCK_DATA.dados.slice(1) || [];

        var mockLoader = {
            loaded: function() { console.log('[Mock] loaded'); },
            finished: function() { console.log('[Mock] finished'); },
            data: function(name) {
                return {
                    value: function(field) {
                        var val = (mockConfig[field] !== undefined && mockConfig[field] !== null)
                            ? String(mockConfig[field])
                            : '';
                        return { value: val };
                    }
                };
            },
            datalist: function(name) {
                var count = mockItems.length;
                var items = mockItems;
                return {
                    count: function() { return count; },
                    get: function(i) {
                        var item = items[i];
                        return {
                            value: function(field) {
                                var val = (item[field] !== undefined && item[field] !== null)
                                    ? String(item[field])
                                    : '';
                                return { value: val };
                            }
                        };
                    }
                };
            }
        };

        mockLoader.loaded();
        iniciarTemplate(mockLoader.data(DATASET), config, mockLoader);
        return;
    }

    // ════════════════════════════════════════════════════════════════════
    // FLUXO PRINCIPAL EBHTML
    // ════════════════════════════════════════════════════════════════════
    ebhtml.create2({}, function(loader) {
        loader.addData(DATASET, false, 'amount=0'); // false = não obrigatório, amount=0 = todos os itens
        loader.nodataiserror = false;   // sem dados não é erro
        loader.autoloaded = false;      // controle manual

        loader.load(function() {
            var data = loader.data(DATASET);
            if (data == undefined) {
                console.error('[Diretório] ERRO: dataset indefinido');
                loader.finished(); // apenas finished(), sem loaded()
                return;
            }

            // Chamar função principal do template
            loader.loaded();
            iniciarTemplate(data, config, loader);
        });
    });
}

// ─── WINDOW ONLOAD ──────────────────────────────────────────────────────────
// Nota: Mock agora é feito via D_CONDOMINIO.xml.js (descomentar no index.html para DEV)
// Em DEV: carrega http://localhost:12099/FILES/1/js/D_CONDOMINIO.xml
// Em PROD: ebhtml carrega automaticamente D_CONDOMINIO do CMS
// O dispatch entre extranetView() e playerView() é feito pelo inline script no index.html



