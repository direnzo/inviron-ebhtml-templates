// ═══════════════════════════════════════════════════════════════════════════
// ANDORINHA MENUBOARD - Master JS
// ═══════════════════════════════════════════════════════════════════════════
// Template simplificado de lista de produtos - SEM paginação
// Backend já controla os itens exibidos via amount= na URL

document.addEventListener("DOMContentLoaded", function () {
  // ─── Configuração ────────────────────────────────────────────────────────
// =============Com pack=====================================
// menuboard_bebidas - Vertical (1080x 1920 ) - com pack	
// menuboard_bebidas_269 - Vertical (1080x 1920 ) - com pack	
// menuboard_leite - Vertical (1080x 1920 )	- com pack
// ==============Simples=====================================
// menuboard_cafe - Vertical (1080x 1920 )	
// menuboard_acougue_ouro - Horizontal ( 1920 x 1080 )	
// menuboard_acougue - (menuboard_acougue_prata) Horizontal ( 1920 x 1080 )	
// menuboard_frios_carnes - Horizontal ( 1920 x 1080 )	
// menuboard_frios - (menuboard_frios_queijos) Horizontal ( 1920 x 1080 )	
// menuboard_salgados - Horizontal ( 1920 x 1080 )	
// menuboard_peixaria - Horizontal ( 1920 x 1080 )	
// menuboard_frango - Horizontal ( 1920 x 1080 )
// menuboard_frango_outros - Horizontal ( 1920 x 1080 )

//============================================================

  var selectedCategory = "menuboard_leite"; // Categoria padrão
  var displayDuration = 1800000; // 30 minutos por exibição
  var pollInterval = 20000;    // 20 segundos. Intervalo de polling e timeout entre páginas (ms)
  var TEST_RELOAD_MODE = false;  // true = reload em vez de finished() (simula ciclo de playlist no localhost)
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

  // ─── Card ml no rodápe (portrait, somente bebidas) ─────────────────────────
  var cardMl = document.getElementById("card-ml");
  var textoMl = document.getElementById("texto-ml");
  if (cardMl && textoMl) {
    if (selectedCategory === "menuboard_bebidas") {
      textoMl.textContent = "350ml.";
      cardMl.classList.remove("hidden");
      cardMl.classList.add("flex");
    } else if (selectedCategory === "menuboard_bebidas_269") {
      textoMl.textContent = "269ml.";
      cardMl.classList.remove("hidden");
      cardMl.classList.add("flex");
    }
  }

  // ─── Badge de categoria (landscape: acougue_ouro / acougue) ─────────────────
  var badgeEl = document.getElementById("badge-categoria");
  var badgeInner = document.getElementById("badge-inner");
  var textoBadge = document.getElementById("texto-badge");
  if (badgeEl && badgeInner && textoBadge) {
    if (selectedCategory === "menuboard_acougue_ouro") {
      textoBadge.textContent = "OURO";
      badgeInner.style.backgroundColor = "#D4AF37";
      textoBadge.style.color = "#1a1a2e";
      badgeEl.classList.remove("hidden");
      badgeEl.classList.add("flex");
    } else if (selectedCategory === "menuboard_acougue") {
      textoBadge.textContent = "PRATA";
      badgeInner.style.backgroundColor = "#B8B8C0";
      textoBadge.style.color = "#1a1a2e";
      badgeEl.classList.remove("hidden");
      badgeEl.classList.add("flex");
    }
  }

  // ─── Café/Leite portrait: sem badge → reduz padding inferior para caber 10 itens
  if (selectedCategory === "menuboard_cafe" || selectedCategory === "menuboard_leite") {
    body.style.paddingBottom = "2vh";
  }

  var loader2; // Loader EBHTML
  var pollingIntervalo; // Intervalo de polling para verificar novos dados
  var conteudoExibido = false; // Guard: evita reload em loop quando não há conteúdo
  var allItems = []; // Todos os itens em memória
  var currentPageIndex = 0; // Índice da próxima página a exibir
  var paginationTimer = null; // setInterval de rotação de páginas
  var finalizado = false; // Guard contra duplo finished()

  // ─── Detecção de Aspect Ratio ────────────────────────────────────────────

  function isLandscape() {
    var aspectRatio = window.innerWidth / window.innerHeight;
    return aspectRatio > 1; // Landscape se largura > altura
  }

  function getMaxItems() {
    if (isLandscape()) return 20;
    // row h-[140px] + gap-4(16px) + mb-3(12px) entre linhas = 168px/linha
    var bodyStyle = window.getComputedStyle(body);
    var pt = parseFloat(bodyStyle.paddingTop) || 0;
    var pb = parseFloat(bodyStyle.paddingBottom) || 0;
    var alturaDisponivel = body.offsetHeight - pt - pb - 10; // -10 = mt-[10px]
    if (alturaDisponivel <= 0) return 8;
    var n = Math.floor((alturaDisponivel + 28) / 168);
    console.log("[PORTRAIT] disp=" + Math.round(alturaDisponivel) + "px → " + n + " itens");
    return Math.max(1, n);
  }

  // ─── Ajuste Dinâmico de Altura (Landscape) ───────────────────────────────

  function ajustarAlturaLinhas() {
    if (!isLandscape()) {
      // Portrait: remove itens que transbordarem (safety net)
      var container = contentRowsContainer;
      var filhos = container.querySelectorAll(':scope > div');
      while (container.scrollHeight > container.clientHeight && filhos.length > 1) {
        container.removeChild(filhos[filhos.length - 1]);
        filhos = container.querySelectorAll(':scope > div');
      }
      if (filhos.length !== container.querySelectorAll(':scope > div').length) {
        console.log("[PORTRAIT] Overflow corrigido: " + filhos.length + " itens");
      }
      return;
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
    var row = rowTemplate.content.cloneNode(true);

    // Seleciona os blocos
    var blocoDescricao = row.querySelector(".bloco-descricao");
    var blocoPrecos = row.querySelector(".bloco-precos");
    blocoDescricao.style.minWidth = "0"; // evita cascata min-width do truncate

    // Classes alternadas; DE-POR usa amarelo fixo
    var texto3Val = (item.value("TEXTO3").value || "").trim();
    if (texto3Val === "DE-POR") {
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

    var titulo = row.querySelector(".titulo");
    var price = row.querySelector(".price");
    var price2 = row.querySelector(".price2");
    var linhaPrice2 = row.querySelector(".linha-price2");
    var labelPrice2 = row.querySelector(".label-price2");
    var labelUnid = row.querySelector(".label-unid");

    titulo.textContent = (item.value("TITULO").value || "").toUpperCase();
    price.textContent = formatarPreco(item.value("PRICE").value);

    // Preço por caixa: TEXTO5 para bebidas (portrait only), PRICE2 para demais
    var valorPrice2 = "";
    var categoriasBebidas = ["menuboard_bebidas", "menuboard_leite", "menuboard_bebidas_269"];
    var esBebidas = categoriasBebidas.indexOf(selectedCategory) !== -1;

    if (esBebidas) {
      var texto5 = (item.value("TEXTO5").value || "").trim();
      if (texto5) {
        try {
          var infoTec = JSON.parse(texto5).informacoesTecnicas;
          if (infoTec && infoTec.TipoEmbalagem === "CX" && infoTec.QuantidadeEmbalagem) {
            var qtdCx = parseInt(infoTec.QuantidadeEmbalagem, 10);
            var precoUnit = parseFloat(item.value("PRICE").value) || 0;
            valorPrice2 = (qtdCx * precoUnit).toFixed(2);
            if (labelPrice2) labelPrice2.textContent = "CX/" + qtdCx;
          }
        } catch (e) {
          console.warn("[AVISO] TEXTO5 invalido:", e);
        }
      }
    } else {
      valorPrice2 = item.value("PRICE2").value;
    }

    // UNID. sempre visível em portrait; pack só para bebidas
    if (!isLandscape()) {
      if (labelUnid) labelUnid.classList.remove("hidden");
      if (esBebidas && valorPrice2) {
        price2.textContent = formatarPreco(valorPrice2);
        linhaPrice2.classList.remove("hidden");
      }
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
    if (finalizado) return;
    finalizado = true;
    if (pollingIntervalo) {
      clearInterval(pollingIntervalo);
      pollingIntervalo = null;
    }
    if (paginationTimer) {
      clearInterval(paginationTimer);
      paginationTimer = null;
    }
    if (TEST_RELOAD_MODE) {
      location.reload();
      return;
    }
    if (loader2) {
      loader2.finished();
    }
  }

  // Exibe a fatia de allItems correspondente a currentPageIndex e avança o índice
  function exibirProximaPagina(maxItems) {
    var offset = currentPageIndex * maxItems;
    var pagina = allItems.slice(offset, offset + maxItems);
    if (pagina.length === 0) {
      currentPageIndex = 0;
      pagina = allItems.slice(0, maxItems);
    }
    var totalPaginas = Math.ceil(allItems.length / maxItems);
    console.log("[PAGE] Página " + (currentPageIndex + 1) + "/" + totalPaginas + " (offset=" + offset + ", " + pagina.length + " itens)");
    exibirProdutos(pagina);
    currentPageIndex++;
    if (currentPageIndex >= totalPaginas) currentPageIndex = 0;
  }

  // ─── Carregamento de Dados (EdgeContents CMS) ────────────────────────────

  function carregarDados(category) {
    ebhtml.create2({}, function (loader) {
      loader.addData("D_LOCAL", true);
      loader.autoloaded = false;

      loader.load(function () {
        try {
          var local = loader.data("D_LOCAL").value("SITE_CUSTOMERID").value;
          var maxItems = getMaxItems();
          var filtro = "f_category=" + category + "&amount=500";
          var categoriasAlfabeticas = [
            "menuboard_acougue_ouro", "menuboard_acougue",
            "menuboard_frios_carnes", "menuboard_frios",
            "menuboard_salgados", "menuboard_peixaria", "menuboard_frango"
          ];
          var categoriasPreco = [
            "menuboard_bebidas", "menuboard_bebidas_269",
            "menuboard_leite", "menuboard_cafe"
          ];
          if (categoriasAlfabeticas.indexOf(category) !== -1) {
            filtro += "&order=TITULO&orderkind=asc";
          } else if (categoriasPreco.indexOf(category) !== -1) {
            filtro += "&order=PRICE&orderkind=asc";
          }

          console.log("[INFO] Filtro enviado: " + filtro);

          ebhtml.create2({}, function (loaderInstance) {
            loader2 = loaderInstance;
            loader2.addData("D_MENUBOARD_PRICES", true, filtro);
            loader2.nodataiserror = false;
            loader2.autoloaded = false;
            // loader2.loaded();

            loader2.load(function () {
              try {
                var itensRecebidos = loader2.datalist("D_MENUBOARD_PRICES").f_items;
                var totalItems = itensRecebidos ? itensRecebidos.length : 0;
                console.log("[INFO] Total de itens no canal: " + totalItems);

                if (!itensRecebidos || totalItems === 0) {
                  console.warn("[AVISO] Nenhum item encontrado");
                  finalizarLoader();
                  return;
                }

                // Carrega todos em memória e exibe primeira página
                allItems = itensRecebidos;
                currentPageIndex = 0;
                exibirProximaPagina(maxItems);
                conteudoExibido = true;
                loader2.loaded(); // Sinaliza conteúdo visível (chamado uma única vez)

                if (totalItems > maxItems) {
                  // Múltiplas páginas — cicla em memória a cada pollInterval
                  var totalPaginas = Math.ceil(totalItems / maxItems);
                  console.log("[INFO] " + totalPaginas + " páginas, rotação a cada " + (pollInterval / 1000) + "s");
                  paginationTimer = setInterval(function () {
                    exibirProximaPagina(maxItems);
                  }, pollInterval);
                } else {
                  console.log("[INFO] Página única (" + totalItems + " itens), exibindo por " + (displayDuration / 60000) + "min");
                }

                // finished() apenas após displayDuration — sem reload, sem flash
                setTimeout(function () { finalizarLoader(); }, displayDuration);

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
      console.log("[MOCK] Usando dados fictícios");
      console.log("[MOCK] Tipo: " + MOCK_DATA.tipo);

      var mockDatalist = criarDatalistMock(MOCK_DATA[selectedCategory]);
      var maxItems = getMaxItems();

      allItems = mockDatalist.f_items;
      currentPageIndex = 0;
      console.log("[MOCK] Total de produtos: " + allItems.length + " / maxItems: " + maxItems);

      var mockLoader = {
        loaded:   function () { console.log("[Mock] loaded()");   loader.loaded(); },
        finished: function () { console.log("[Mock] finished()"); loader.finished(); },
      };
      loader2 = mockLoader;

      exibirProximaPagina(maxItems);
      loader2.loaded();

      if (allItems.length > maxItems) {
        var totalPaginas = Math.ceil(allItems.length / maxItems);
        console.log("[MOCK] " + totalPaginas + " páginas, rotação a cada " + (pollInterval / 1000) + "s");
        paginationTimer = setInterval(function () {
          exibirProximaPagina(maxItems);
        }, pollInterval);
      }

      setTimeout(function () { finalizarLoader(); }, displayDuration);
    });
  }

  // ─── INICIALIZAÇÃO ────────────────────────────────────────────────────────

  if (typeof MOCK_DATA !== "undefined" && MOCK_DATA.enabled) {
    usarMockData(selectedCategory);
  } else {
    carregarDados(selectedCategory);
  }
});
