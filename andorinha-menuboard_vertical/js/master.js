// ═══════════════════════════════════════════════════════════════════════════
// ANDORINHA MENUBOARD - Master JS
// ═══════════════════════════════════════════════════════════════════════════
// Template simplificado de lista de produtos - SEM paginação
// Backend já controla os itens exibidos via amount= na URL

document.addEventListener("DOMContentLoaded", function () {
  // ─── Configuração ────────────────────────────────────────────────────────
// Menuboard Açougue	menuboard_acougue	
// Menuboard Bebidas	menuboard_bebidas	
// Menuboard Café	menuboard_cafe	
// Menuboard Frango	menuboard_frango	
// Menuboard Frios	menuboard_frios	
// Menuboard Leite	menuboard_leite	
// Menuboard Peixaria	menuboard_peixaria	
// Menuboard Salgados	menuboard_salgados

  var selectedCategory = "menuboard_bebidas"; // Categoria padrão
  var displayDuration = 30000; // 30 segundos por exibição
  var CONFIG = {
    // Limite de caracteres do TITULO (0 ou negativo = sem limite)
    maxTitleCharsLandscape: 37,
    maxTitleCharsPortrait: 30,
    titleTruncateSuffix: "",
  };

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

  var loader2; // Loader EBHTML

  // ─── Detecção de Aspect Ratio ────────────────────────────────────────────

  function isLandscape() {
    var aspectRatio = window.innerWidth / window.innerHeight;
    return aspectRatio > 1; // Landscape se largura > altura
  }

  function getMaxItems() {
    return 10;
  }

  // ─── Ajuste Dinâmico de Altura (Landscape) ───────────────────────────────

  function ajustarAlturaLinhas() {
    if (!isLandscape()) {
      return; // Portrait usa flex-1 no CSS, não precisa calcular
    }

    // Em landscape: calcular altura de cada linha para caber exatamente
    var container = contentRowsContainer;
    var containerHeight = container.offsetHeight; // Altura disponível

    var numLinhas = 10;
    var gap = 16; // gap-4 = 1rem = 16px
    var totalGaps = gap * (numLinhas - 1); // 9 gaps entre 10 linhas

    var alturaLinha = (containerHeight - totalGaps) / numLinhas;

    // Calcula font-size proporcional à altura da linha
    // Base: altura linha / 3.5 (ajuste para caber título + preço confortavelmente)
    var fontSize = Math.floor(alturaLinha / 2.2);

    console.log("[INFO] Container height:", containerHeight + "px");
    console.log("[INFO] Altura calculada por linha:", alturaLinha + "px");
    console.log("[INFO] Font-size calculado:", fontSize + "px");

    // Aplica altura e font-size em todas as linhas da coluna 1
    var linhas = container.querySelectorAll(":scope > div");
    for (var i = 0; i < linhas.length; i++) {
      // linhas[i].style.height = alturaLinha + "px";
      linhas[i].style.fontSize = fontSize + "px";
    }

    // Aplica também na coluna 2
    if (contentRowsContainer2) {
      var linhas2 = contentRowsContainer2.querySelectorAll(":scope > div");
      for (var j = 0; j < linhas2.length; j++) {
        // linhas2[j].style.height = alturaLinha + "px";
        linhas2[j].style.fontSize = fontSize + "px";
      }
    }
  }

  // ─── Funções Auxiliares ──────────────────────────────────────────────────

  function formatarPreco(valor) {
    var num = parseFloat(valor);
    if (isNaN(num)) num = 0;

    var fixed = num.toFixed(2);
    var parts = fixed.split(".");
    var inteiro = parts[0];
    var centavos = parts[1] || "00";

    return inteiro + "," + centavos;
  }

  function getMaxTitleChars() {
    return isLandscape()
      ? CONFIG.maxTitleCharsLandscape
      : CONFIG.maxTitleCharsPortrait;
  }

  function limitarTitulo(texto) {
    var titulo = (texto || "").toUpperCase();
    var maxChars = getMaxTitleChars();
    var suffix = CONFIG.titleTruncateSuffix || "";

    if (maxChars <= 0 || titulo.length <= maxChars) {
      return titulo;
    }

    if (suffix.length >= maxChars) {
      return titulo.substring(0, maxChars);
    }

    return titulo.substring(0, maxChars - suffix.length) + suffix;
  }

  function criarLinha(item, index) {
    // Clona o template
    var row = rowTemplate.content.cloneNode(true);

    // Seleciona os blocos
    var blocoDescricao = row.querySelector(".bloco-descricao");
    var blocoPrecos = row.querySelector(".bloco-precos");

    // Classes alternadas para cor de fundo do bloco de descrição
    if (index % 2 === 0) {
      blocoDescricao.classList.add("bg-blue-600", "text-white");
      blocoPrecos.classList.add("bg-blue-600", "text-white");
    } else {
      blocoDescricao.classList.add("bg-white", "text-blue-700");
      blocoPrecos.classList.add("bg-white", "text-blue-700");
    }

    // Popula os dados
    var titulo = row.querySelector(".titulo");
    var price = row.querySelector(".price");
    var price2 = row.querySelector(".price2");
    var linhaPrice2 = row.querySelector(".linha-price2");

    // Título com quebra de linha (sem truncar)
    titulo.textContent = (item.value("TITULO").value || "").toUpperCase();

    // Preço principal (UNID.)
    price.textContent = formatarPreco(item.value("PRICE").value);

    // Preço secundário (CX/12) - exibido apenas quando disponível
    var valorPrice2 = item.value("PRICE2").value;
    if (valorPrice2) {
      price2.textContent = formatarPreco(valorPrice2);
      linhaPrice2.classList.remove("hidden");
    }

    return row;
  }

  function exibirProdutos(items) {
    // Limita quantidade baseado em aspect ratio
    var maxItems = getMaxItems();
    var itemsToShow = items.slice(0, maxItems);

    console.log(
      "[INFO] Aspect Ratio: " + (isLandscape() ? "LANDSCAPE" : "PORTRAIT"),
    );
    console.log(
      "[INFO] Exibindo " +
        itemsToShow.length +
        " de " +
        items.length +
        " produtos",
    );

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
      var coluna1 = itemsToShow.slice(0, 10); // Primeiros 10
      var coluna2 = itemsToShow.slice(10, 20); // Próximos 10

      // Preenche coluna 1
      for (var i = 0; i < coluna1.length; i++) {
        var row = criarLinha(coluna1[i], i);
        contentRowsContainer.appendChild(row);

        var rowElement = contentRowsContainer.lastElementChild;
        (function (el, delay) {
          setTimeout(function () {
            el.classList.remove("opacity-0", "translate-y-4");
          }, delay);
        })(rowElement, 1 * i);
      }

      // Preenche coluna 2
      for (var j = 0; j < coluna2.length; j++) {
        var row2 = criarLinha(coluna2[j], j);
        contentRowsContainer2.appendChild(row2);

        var rowElement2 = contentRowsContainer2.lastElementChild;
        (function (el, delay) {
          setTimeout(function () {
            el.classList.remove("opacity-0", "translate-y-4");
          }, delay);
        })(rowElement2, 1 * (1 + j)); // Delay continua após coluna 1
      }
    }
    // Em PORTRAIT: apenas 1 coluna (10 itens)
    else {
      for (var k = 0; k < itemsToShow.length; k++) {
        var rowP = criarLinha(itemsToShow[k], k);
        contentRowsContainer.appendChild(rowP);

        var rowElementP = contentRowsContainer.lastElementChild;
        (function (el, delay) {
          setTimeout(function () {
            el.classList.remove("opacity-0", "translate-y-4");
          }, delay);
        })(rowElementP, 1 * k);
      }
    }

    // Exibe container
    tableContainer.classList.remove("opacity-0");
    body.classList.remove("opacity-0");
    body.classList.add("opacity-100");

    // Ajusta altura das linhas em landscape após renderização
    setTimeout(function () {
      ajustarAlturaLinhas();
    }, 100); // Pequeno delay para garantir que DOM está pronto
  }

  function finalizarLoader() {
    if (loader2) {
      loader2.finished();
    }
  }

  // ─── Carregamento de Dados (EdgeContents CMS) ────────────────────────────

  function carregarDados(category) {
    ebhtml.create2({}, function (loader) {
      loader.addData("D_LOCAL", true);

      loader.load(function () {
        try {
          var local = loader.data("D_LOCAL").value("SITE_CUSTOMERID").value;
          var maxItems = getMaxItems();
          var filtro =
            "f_category=" +
            category +
            "&amount=" +
            maxItems +
            "&order=ID&orderkind=id";

          console.log("[INFO] Filtro: " + filtro);

          ebhtml.create2({}, function (loaderInstance) {
            loader2 = loaderInstance;
            loader2.addData("D_MENUBOARD_PRICES", true, filtro);
            loader2.nodataiserror = false;
            loader2.autoloaded = false;
            // loader2.loaded();

            loader2.load(function () {
              try {
                var items = loader2.datalist("D_MENUBOARD_PRICES").f_items;

                if (!items || items.length === 0) {
                  console.warn("[AVISO] Nenhum item encontrado");
                  finalizarLoader();
                  return;
                }

                exibirProdutos(items);

                // Finaliza após duração configurada
                setTimeout(function () {
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

  function usarMockData(selectedCategory) {
    ebhtml.create2({}, function (loader) {
        loader = loader; // Referência para o loader mock
      console.log("[MOCK] Usando dados fictícios");
      console.log("[MOCK] Tipo: " + MOCK_DATA.tipo);

      var mockDatalist = criarDatalistMock(MOCK_DATA[selectedCategory]);
      var items = mockDatalist.f_items;

      console.log("[MOCK] Total de produtos disponíveis: " + items.length);

      exibirProdutos(items);

      // Mock loader

      var mockLoader = {
        loaded: function () {
          console.log("[Mock] Carregado");
          loader.loaded();
        },
        finished: function () {
          console.log("[Mock] Finalizado");
          loader.finished();
        },
      };
      loader2 = mockLoader;
      loader2.loaded();

      setTimeout(function () {
        finalizarLoader();
      }, displayDuration);
    });
  }

  // ─── INICIALIZAÇÃO ────────────────────────────────────────────────────────

  if (typeof MOCK_DATA !== "undefined" && MOCK_DATA.enabled) {
    usarMockData(selectedCategory);
  } else {
    carregarDados(selectedCategory);
  }
});
