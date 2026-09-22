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

  var selectedCategory = "menuboard_frango"; // Categoria padrão
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

    var container = contentRowsContainer;
    var linhasElem = container.querySelectorAll(':scope > div');
    if (linhasElem.length === 0) return;

    // Calcula com 10 slots fixos sobre a altura DISPONÍVEL do viewport
    // Garante fonte idêntica independente de quantos itens são exibidos
    var MAX_LINHAS = 10;
    var gap = 16; // gap-4 = 1rem = 16px
    var bodyStyle = window.getComputedStyle(body);
    var paddingTop = parseFloat(bodyStyle.paddingTop) || 0;
    var paddingBottom = parseFloat(bodyStyle.paddingBottom) || 0;
    var alturaDisponivel = body.offsetHeight - paddingTop - paddingBottom - 10; // -10 = mt do table-container
    var alturaLinha = (alturaDisponivel - gap * (MAX_LINHAS - 1)) / MAX_LINHAS;
    var fontSize = Math.floor(alturaLinha / 2.2);

    console.log("[INFO] Altura disponível:", alturaDisponivel + "px");
    console.log("[INFO] Altura calculada por linha:", alturaLinha + "px");
    console.log("[INFO] Font-size calculado:", fontSize + "px");

    // Aplica font-size em todas as linhas da coluna 1
    for (var i = 0; i < linhasElem.length; i++) {
      linhasElem[i].style.fontSize = fontSize + "px";
    }

    // Aplica também na coluna 2
    if (contentRowsContainer2) {
      var linhas2 = contentRowsContainer2.querySelectorAll(":scope > div");
      for (var j = 0; j < linhas2.length; j++) {
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
    blocoDescricao.style.minWidth = "0"; // evita cascata min-width do truncate

    // Classes alternadas; DE-POR usa amarelo fixo
    var texto3 = (item.value("TEXTO3").value || "").trim();
    if (texto3 === "DE-POR") {
      blocoDescricao.style.backgroundColor = "#e7de43";
      blocoPrecos.style.backgroundColor = "#e7de43";
      blocoDescricao.classList.add("text-blue-900");
      blocoPrecos.classList.add("text-blue-900");
    } else if (index % 2 === 0) {
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
    var labelPrice2 = row.querySelector(".label-price2");

    // Título com quebra de linha (sem truncar)
    titulo.textContent = (item.value("TITULO").value || "").toUpperCase();

    // Preço principal (UNID.)
    price.textContent = formatarPreco(item.value("PRICE").value);

    // Preço por caixa: calculado via TEXTO5 (bebidas) ou PRICE2 (demais)
    var valorPrice2 = "";
    var categoriasBebidas = ["menuboard_bebidas", "menuboard_leite", "menuboard_bebidas_269"];
    if (categoriasBebidas.indexOf(selectedCategory) !== -1) {
      var texto5 = (item.value("TEXTO5").value || "").trim();
      if (texto5) {
        try {
          var infoTec = JSON.parse(texto5).informacoesTecnicas;
          if (infoTec && infoTec.TipoEmbalagem === "CX" && infoTec.QuantidadeEmbalagem) {
            var qtdCx = parseFloat(infoTec.QuantidadeEmbalagem);
            var precoUnit = parseFloat(item.value("PRICE").value) || 0;
            valorPrice2 = (qtdCx * precoUnit).toFixed(2);
            if (labelPrice2) {
              labelPrice2.textContent = "CX/" + qtdCx;
            }
          }
        } catch (e) {
          console.warn("[AVISO] TEXTO5 invalido:", e);
        }
      }
    } else {
      valorPrice2 = item.value("PRICE2").value;
    }

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
    contentRowsContainer.style.minWidth = "0";
    if (contentRowsContainer2) {
      contentRowsContainer2.innerHTML = "";
      contentRowsContainer2.style.minWidth = "0";
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
