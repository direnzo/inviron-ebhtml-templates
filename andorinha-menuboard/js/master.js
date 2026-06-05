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
    var rowTemplate = document.getElementById("row-template");
    var tableContainer = document.getElementById("table-container");
    var body = document.body;
    
    if (!contentRowsContainer || !rowTemplate || !tableContainer) {
        console.error("[ERRO] Elementos não encontrados no DOM");
        return;
    }
    
    var loader2;  // Loader EBHTML
    
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
        // Limpa container
        contentRowsContainer.innerHTML = "";
        
        if (!items || items.length === 0) {
            console.warn("[AVISO] Nenhum item para exibir");
            return;
        }
        
        console.log('[INFO] Exibindo ' + items.length + ' produtos');
        
        // Adiciona as linhas ao container
        for (var i = 0; i < items.length; i++) {
            var row = criarLinha(items[i], i);
            contentRowsContainer.appendChild(row);
            
            // Animação com delay escalonado
            var rowElement = contentRowsContainer.lastElementChild;
            (function(el, delay) {
                setTimeout(function() {
                    el.classList.remove("opacity-0", "translate-y-4");
                }, delay);
            })(rowElement, 300 * i);
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
                    var filtro = 'f_category=' + category + '&f_TEXTO2=' + local + '&amount=10&order=ID&orderkind=id';
                    
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
        
        // Determina background baseado no tipo
        var bgImage = 'img/bg_menuboard_horizontal.jpg';
        body.style.backgroundImage = 'url(' + bgImage + ')';
        
        var mockDatalist = criarDatalistMock(MOCK_DATA.produtos);
        var items = mockDatalist.f_items;
        
        console.log('[MOCK] Total de produtos: ' + items.length);
        
        exibirProdutos(items);
    }
    
    // ─── INICIALIZAÇÃO ────────────────────────────────────────────────────────
    
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        usarMockData();
    } else {
        carregarDados(selectedCategory);
    }
});
