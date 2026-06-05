// ═══════════════════════════════════════════════════════════════════════════
// ANDORINHA MENUBOARD - Master JS
// ═══════════════════════════════════════════════════════════════════════════
// Template simplificado de lista de produtos - SEM paginação
// Backend já controla os itens exibidos via amount= na URL

document.addEventListener("DOMContentLoaded", function() {
    // ─── Configuração ────────────────────────────────────────────────────────
    var selectedCategory = "Acougue-Bovino";  // Categoria padrão
    var displayDuration = 15000;  // 15 segundos por exibição
    
    // ─── Elementos DOM ───────────────────────────────────────────────────────
    var contentRowsContainer = document.getElementById("content-rows");
    var contentRowsContainer2 = document.getElementById("content-rows-2");
    var rowTemplate = document.getElementById("row-template");
    var tableContainer = document.getElementById("table-container");
    var body = document.body;
    
    if (!contentRowsContainer || !rowTemplate || !tableContainer) {
        console.error("[ERRO] Elementos não encontrados no DOM");
        return;
    }
    
    var loader2;  // Loader EBHTML
    
    // ─── Detecção de Aspect Ratio ────────────────────────────────────────────
    
    function isLandscape() {
        var aspectRatio = window.innerWidth / window.innerHeight;
        return aspectRatio > 1;  // Landscape se largura > altura
    }
    
    function getMaxItems() {
        return isLandscape() ? 20 : 10;  // 20 em landscape, 10 em portrait
    }
    
    // ─── Funções Auxiliares ──────────────────────────────────────────────────
    
    function formatarPreco(valor) {
        var num = parseFloat(valor);
        if (isNaN(num)) num = 0;
        
        var fixed = num.toFixed(2);
        var parts = fixed.split('.');
        var inteiro = parts[0];
        var centavos = parts[1] || '00';
        
        return inteiro + ',' + centavos;
    }
    
    function criarLinha(item, index) {
        // Clona o template
        var row = rowTemplate.content.cloneNode(true);
        var rowElement = row.querySelector("div");
        
        // Classes alternadas para cor de fundo
        if (index % 2 === 0) {
            rowElement.classList.add("bg-blue-800");
        } else {
            rowElement.classList.add("bg-blue-700");
        }
        
        // Popula os dados
        var description = row.querySelector(".descr");
        var subtitle = row.querySelector(".subtitle");
        var price = row.querySelector(".price");
        var price2 = row.querySelector(".price2");
        var priceLabel = row.querySelector(".price-label");
        
        description.textContent = item.value("TITULO").value.toUpperCase();
        
        // Subtítulo (opcional - ex: "Lata 269ml")
        var texto1 = item.value("TEXTO1").value;
        if (texto1 && subtitle) {
            subtitle.textContent = texto1;
            subtitle.style.display = 'block';
        }
        
        // Preço principal
        price.textContent = formatarPreco(item.value("PRICE").value);
        
        // Preço secundário (opcional - ex: "CX/12")
        var valorPrice2 = item.value("PRICE2").value;
        var textoLabel = item.value("TEXTO3").value;
        
        if (valorPrice2 && price2 && priceLabel) {
            price2.textContent = formatarPreco(valorPrice2);
            priceLabel.textContent = textoLabel || 'CX/12';
            price2.style.display = 'block';
            priceLabel.style.display = 'block';
        }
        
        return row;
    }
    
    function exibirProdutos(items) {
        // Limita quantidade baseado em aspect ratio
        var maxItems = getMaxItems();
        var itemsToShow = items.slice(0, maxItems);
        
        console.log('[INFO] Aspect Ratio: ' + (isLandscape() ? 'LANDSCAPE' : 'PORTRAIT'));
        console.log('[INFO] Exibindo ' + itemsToShow.length + ' de ' + items.length + ' produtos');
        
        if (!itemsToShow || itemsToShow.length === 0) {
            console.warn("[AVISO] Nenhum item para exibir");
            return;
        }
        
        // Limpa containers
        contentRowsContainer.innerHTML = "";
        if (contentRowsContainer2) {
            contentRowsContainer2.innerHTML = "";
        }
        
        // Em LANDSCAPE: divide em 2 colunas (10 itens cada)
        if (isLandscape() && contentRowsContainer2) {
            var coluna1 = itemsToShow.slice(0, 10);  // Primeiros 10
            var coluna2 = itemsToShow.slice(10, 20); // Próximos 10
            
            // Preenche coluna 1
            for (var i = 0; i < coluna1.length; i++) {
                var row = criarLinha(coluna1[i], i);
                contentRowsContainer.appendChild(row);
                
                var rowElement = contentRowsContainer.lastElementChild;
                (function(el, delay) {
                    setTimeout(function() {
                        el.classList.remove("opacity-0", "translate-y-4");
                    }, delay);
                })(rowElement, 300 * i);
            }
            
            // Preenche coluna 2
            for (var j = 0; j < coluna2.length; j++) {
                var row2 = criarLinha(coluna2[j], j);
                contentRowsContainer2.appendChild(row2);
                
                var rowElement2 = contentRowsContainer2.lastElementChild;
                (function(el, delay) {
                    setTimeout(function() {
                        el.classList.remove("opacity-0", "translate-y-4");
                    }, delay);
                })(rowElement2, 300 * (10 + j));  // Delay continua após coluna 1
            }
        } 
        // Em PORTRAIT: apenas 1 coluna (10 itens)
        else {
            for (var k = 0; k < itemsToShow.length; k++) {
                var rowP = criarLinha(itemsToShow[k], k);
                contentRowsContainer.appendChild(rowP);
                
                var rowElementP = contentRowsContainer.lastElementChild;
                (function(el, delay) {
                    setTimeout(function() {
                        el.classList.remove("opacity-0", "translate-y-4");
                    }, delay);
                })(rowElementP, 300 * k);
            }
        }
        
        // Exibe container
        tableContainer.classList.remove("opacity-0");
        body.classList.remove("opacity-0");
        body.classList.add("opacity-100");
    }
    
    function finalizarLoader() {
        if (loader2) {
            loader2.finished();
        }
    }
    
    // ─── Carregamento de Dados (EdgeContents CMS) ────────────────────────────
    
    function carregarDados(category) {
        ebhtml.create2({}, function(loader) {
            loader.addData("D_LOCAL", true);
            
            loader.load(function() {
                try {
                    var local = loader.data("D_LOCAL").value("SITE_CUSTOMERID").value;
                    var maxItems = getMaxItems();
                    var filtro = 'f_category=' + category + '&f_TEXTO2=' + local + '&amount=' + maxItems + '&order=ID&orderkind=id';
                    
                    console.log('[INFO] Filtro: ' + filtro);
                    
                    ebhtml.create2({}, function(loaderInstance) {
                        loader2 = loaderInstance;
                        loader2.addData("D_MENUBOARD_PRICES", true, filtro);
                        loader2.nodataiserror = false;
                        loader2.autoloaded = false;
                        loader2.loaded();
                        
                        loader2.load(function() {
                            try {
                                var items = loader2.datalist("D_MENUBOARD_PRICES").f_items;
                                
                                if (!items || items.length === 0) {
                                    console.warn("[AVISO] Nenhum item encontrado");
                                    finalizarLoader();
                                    return;
                                }
                                
                                exibirProdutos(items);
                                
                                // Finaliza após duração configurada
                                setTimeout(function() {
                                    finalizarLoader();
                                }, displayDuration);
                                
                            } catch (error) {
                                console.error("[ERRO] Ao carregar itens:", error);
                                finalizarLoader();
                            }
                        });
                    });
                } catch (error) {
                    console.error("[ERRO] Ao carregar dados do local:", error);
                    finalizarLoader();
                }
            });
        });
    }
    
    // ─── Modo MOCK (Desenvolvimento) ──────────────────────────────────────────
    
    function usarMockData() {
        console.log('[MOCK] Usando dados fictícios');
        console.log('[MOCK] Tipo: ' + MOCK_DATA.tipo);
        
        var mockDatalist = criarDatalistMock(MOCK_DATA.produtos);
        var items = mockDatalist.f_items;
        
        console.log('[MOCK] Total de produtos disponíveis: ' + items.length);
        
        exibirProdutos(items);
    }
    
    // ─── INICIALIZAÇÃO ────────────────────────────────────────────────────────
    
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        usarMockData();
    } else {
        carregarDados(selectedCategory);
    }
});
