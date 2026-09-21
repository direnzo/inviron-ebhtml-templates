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
// menuboard_acougue_suinos - Horizontal ( 1920 x 1080 ) - exibida junto com menuboard_acougue_ouro (coluna direita)

//============================================================

  var selectedCategory = "menuboard_acougue_ouro"; // Categoria padrão
  var displayDuration = 20000; // 30 minutos por exibição
  var pollInterval = 20000;    // 20 segundos. Intervalo de polling e timeout entre páginas (ms)
  var TEST_RELOAD_MODE = false;  // true = reload em vez de finished() (simula ciclo de playlist no localhost)
  // BUG conhecido do ebhtml.js: com nodataiserror=false, se a categoria retornar 0 itens o loader
  // trava para sempre (nem sucesso nem erro disparam) — watchdog + retry abaixo garante loaded()/finished()
  var LOADER_WATCHDOG_MS = 4000;
  var MAX_TENTATIVAS_LOADER = 3; // tentativas extras além da 1ª, antes de desistir
  var RETRY_DELAY_MS = 500;
  // Categorias exibidas simultaneamente em landscape: primária na coluna 1, secundária na coluna 2
  var CATEGORIA_DUPLA_MAP = { "menuboard_acougue_ouro": "menuboard_acougue_suinos" };
  var categoriaSecundaria = CATEGORIA_DUPLA_MAP[selectedCategory] || null;
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
  var badgeSuinosEl = document.getElementById("badge-categoria-suinos");
  var textoBadgeSuinos = document.getElementById("texto-badge-suinos");
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
  if (badgeSuinosEl && textoBadgeSuinos && selectedCategory === "menuboard_acougue_ouro") {
    textoBadgeSuinos.textContent = "CARNE SUÍNA";
    badgeSuinosEl.classList.remove("hidden");
    badgeSuinosEl.classList.add("flex");
  }

  // ─── Café/Leite portrait: sem badge → reduz padding inferior para caber 10 itens
  if (selectedCategory === "menuboard_cafe" || selectedCategory === "menuboard_leite" || selectedCategory === "frios_teste") {
    body.style.paddingBottom = "2vh";
  }

  var loader2; // Loader EBHTML
  var pollingIntervalo; // Intervalo de polling para verificar novos dados
  var conteudoExibido = false; // Guard: evita reload em loop quando não há conteúdo
  var allItems = []; // Todos os itens em memória
  var currentPageIndex = 0; // Índice da próxima página a exibir
  var paginationTimer = null; // setInterval de rotação de páginas
  var finalizado = false; // Guard contra duplo finished()
  var modoDuplo = !!categoriaSecundaria && isLandscape(); // duas categorias independentes, uma por coluna
  var dualColumns = []; // estados independentes de cada coluna no modo duplo
  var conteudoRevelado = false; // Guard: revela o conteúdo (opacity) uma única vez no modo duplo

  // ─── Detecção de Aspect Ratio ────────────────────────────────────────────

  function isLandscape() {
    var aspectRatio = window.innerWidth / window.innerHeight;
    return aspectRatio > 1; // Landscape se largura > altura
  }

  function getMaxItems() {
    if (isLandscape()) return modoDuplo ? 18 : 20;
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
    var MAX_LINHAS = modoDuplo ? 9 : 10;
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

  function gerarFingerprint(items) {
    var fp = "";
    for (var i = 0; i < items.length; i++) {
      fp += items[i].value("TITULO").value + "|" +
            items[i].value("PRICE").value  + "|" +
            items[i].value("PRICE2").value + "|";
    }
    return fp;
  }

  // Atualiza apenas o texto das células sem reconstruir o DOM (evita piscar)
  function atualizarPrecos(items) {
    var linhas1 = contentRowsContainer.querySelectorAll(':scope > div');
    var linhas2 = contentRowsContainer2 ? contentRowsContainer2.querySelectorAll(':scope > div') : [];
    for (var i = 0; i < items.length; i++) {
      var linhaEl = (isLandscape() && i >= 10 && linhas2.length)
        ? linhas2[i - 10]
        : linhas1[i];
      if (!linhaEl) { continue; }
      var tituloEl = linhaEl.querySelector('.titulo');
      var priceEl  = linhaEl.querySelector('.price');
      var price2El = linhaEl.querySelector('.price2');
      if (tituloEl) { tituloEl.textContent = (items[i].value('TITULO').value || '').toUpperCase(); }
      if (priceEl)  { priceEl.textContent  = formatarPreco(items[i].value('PRICE').value); }
      if (price2El) {
        var v2 = items[i].value('PRICE2').value;
        if (v2) { price2El.textContent = formatarPreco(v2); }
      }
    }
  }

  // ─── Modo Duplo (2 categorias independentes, 1 por coluna) ──────────────

  function construirFiltro(category) {
    var filtro = "f_category=" + category + "&amount=500";
    var categoriasAlfabeticas = [
      "menuboard_acougue_ouro", "menuboard_acougue", "menuboard_acougue_suinos",
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
    } else {
      filtro += "&order=TITULO&orderkind=asc"; // fallback: garante ordem estável
    }
    return filtro;
  }

  // Renderiza uma página de itens em uma única coluna (sem split em 2 sub-colunas)
  function renderizarColuna(state, itemsToShow) {
    var container = state.container;
    container.innerHTML = "";
    container.style.minWidth = "0";
    for (var i = 0; i < itemsToShow.length; i++) {
      var row = criarLinha(itemsToShow[i], i);
      container.appendChild(row);
      var rowElement = container.lastElementChild;
      (function (el, delay) {
        setTimeout(function () {
          el.classList.remove("opacity-0", "translate-y-4");
        }, delay);
      })(rowElement, 1 * i);
    }
  }

  function exibirProximaPaginaColuna(state, maxItemsCol) {
    var offset = state.currentPageIndex * maxItemsCol;
    var pagina = state.allItems.slice(offset, offset + maxItemsCol);
    if (pagina.length === 0) {
      state.currentPageIndex = 0;
      pagina = state.allItems.slice(0, maxItemsCol);
    }
    var totalPaginas = Math.ceil(state.allItems.length / maxItemsCol) || 1;
    console.log("[PAGE][" + state.category + "] Página " + (state.currentPageIndex + 1) + "/" + totalPaginas + " (" + pagina.length + " itens)");
    renderizarColuna(state, pagina);
    state.currentPageIndex++;
    if (state.currentPageIndex >= totalPaginas) state.currentPageIndex = 0;
  }

  function atualizarPrecosColuna(state, items) {
    var linhas = state.container.querySelectorAll(':scope > div');
    for (var i = 0; i < items.length; i++) {
      var linhaEl = linhas[i];
      if (!linhaEl) { continue; }
      var tituloEl = linhaEl.querySelector('.titulo');
      var priceEl  = linhaEl.querySelector('.price');
      var price2El = linhaEl.querySelector('.price2');
      if (tituloEl) { tituloEl.textContent = (items[i].value('TITULO').value || '').toUpperCase(); }
      if (priceEl)  { priceEl.textContent  = formatarPreco(items[i].value('PRICE').value); }
      if (price2El) {
        var v2 = items[i].value('PRICE2').value;
        if (v2) { price2El.textContent = formatarPreco(v2); }
      }
    }
  }

  // Revela o conteúdo (body/table opacity) somente após as 2 colunas terem tentado carregar
  function verificarRevelacaoDual() {
    if (conteudoRevelado) { return; }
    for (var i = 0; i < dualColumns.length; i++) {
      if (!dualColumns[i].pronto) { return; }
    }
    conteudoRevelado = true;
    tableContainer.classList.remove("opacity-0");
    body.classList.remove("opacity-0");
    body.classList.add("opacity-100");
    setTimeout(function () { ajustarAlturaLinhas(); }, 100);
  }

  // Busca e mantém uma coluna independente (categoria própria, paginação e poll próprios)
  function iniciarColuna(category, container, controlaLoader, maxItemsCol) {
    var state = {
      category: category, container: container, allItems: [], currentPageIndex: 0,
      paginationTimer: null, pollingIntervalo: null, pronto: false
    };
    dualColumns.push(state);
    tentarCarregarColuna(state, category, controlaLoader, maxItemsCol, 0);
  }

  function desistirColuna(state, controlaLoader, motivo) {
    if (state.pronto) { return; }
    console.warn("[DESISTIR][" + state.category + "] " + motivo);
    state.pronto = true;
    verificarRevelacaoDual();
    if (controlaLoader) { finalizarLoader(); }
  }

  // Refaz a busca da coluna (0 itens, exceção ou timeout) até MAX_TENTATIVAS_LOADER antes de desistir.
  // Necessário porque o ebhtml.js tem um bug: com nodataiserror=false, se vier 0 itens o loader
  // nem chama sucesso nem erro (trava para sempre) — o watchdog abaixo cobre esse caso.
  function tentarCarregarColuna(state, category, controlaLoader, maxItemsCol, tentativa) {
    var resolvido = false; // evita agir 2x nesta tentativa (watchdog x callback tardio)

    function proximaTentativaOuDesistir(motivo) {
      if (resolvido) { return; }
      resolvido = true;
      if (tentativa < MAX_TENTATIVAS_LOADER) {
        console.warn("[RETRY][" + category + "] tentativa " + (tentativa + 1) + "/" + (MAX_TENTATIVAS_LOADER + 1) + " falhou (" + motivo + "), tentando novamente...");
        setTimeout(function () {
          tentarCarregarColuna(state, category, controlaLoader, maxItemsCol, tentativa + 1);
        }, RETRY_DELAY_MS);
      } else {
        desistirColuna(state, controlaLoader, motivo + " (esgotadas as tentativas)");
      }
    }

    ebhtml.create2({}, function (loaderInstance) {
      if (controlaLoader) { loader2 = loaderInstance; }
      var filtro = construirFiltro(category);
      loaderInstance.addData("D_MENUBOARD_PRICES", true, filtro);
      loaderInstance.nodataiserror = false;
      loaderInstance.autoloaded = false;

      setTimeout(function () {
        proximaTentativaOuDesistir("watchdog " + LOADER_WATCHDOG_MS + "ms sem resposta");
      }, LOADER_WATCHDOG_MS);

      loaderInstance.load(function () {
        try {
          var itensRecebidos = loaderInstance.datalist("D_MENUBOARD_PRICES").f_items;
          var totalItems = itensRecebidos ? itensRecebidos.length : 0;
          console.log("[INFO][" + category + "] Total de itens: " + totalItems);

          if (!itensRecebidos || totalItems === 0) {
            proximaTentativaOuDesistir("0 itens recebidos");
            return;
          }
          if (resolvido) { return; } // watchdog já desistiu desta tentativa; ignora resposta tardia
          resolvido = true;

          state.allItems = itensRecebidos;
          state.currentPageIndex = 0;
          exibirProximaPaginaColuna(state, maxItemsCol);
          state.pronto = true;
          verificarRevelacaoDual();
          if (controlaLoader) { loaderInstance.loaded(); } // Sinaliza conteúdo visível (chamado uma única vez)

          if (totalItems > maxItemsCol) {
            var totalPaginas = Math.ceil(totalItems / maxItemsCol);
            console.log("[INFO][" + category + "] " + totalPaginas + " páginas, rotação a cada " + (pollInterval / 1000) + "s");
            state.paginationTimer = setInterval(function () {
              exibirProximaPaginaColuna(state, maxItemsCol);
            }, pollInterval);
          }

          // Re-fetch periódico independente desta coluna
          state.pollingIntervalo = setInterval(function () {
            if (finalizado) { clearInterval(state.pollingIntervalo); return; }
            ebhtml.create2({}, function (pollLoader) {
              pollLoader.addData("D_MENUBOARD_PRICES", true, construirFiltro(category));
              pollLoader.nodataiserror = false;
              pollLoader.autoloaded = false;
              pollLoader.load(function () {
                try {
                  var novosItens = pollLoader.datalist("D_MENUBOARD_PRICES").f_items;
                  if (!novosItens || novosItens.length === 0) { return; }
                  var fpNovo = gerarFingerprint(novosItens);
                  var fpAtual = gerarFingerprint(state.allItems);
                  if (fpNovo === fpAtual) { console.log("[POLL][" + category + "] Sem alterações"); return; }
                  var countChanged = novosItens.length !== state.allItems.length;
                  state.allItems = novosItens;
                  console.log("[POLL][" + category + "] Dados alterados" + (countChanged ? " (qtd mudou, remontando)" : " (in-place)"));
                  if (!state.paginationTimer) {
                    if (countChanged) {
                      state.currentPageIndex = 0;
                      exibirProximaPaginaColuna(state, maxItemsCol);
                    } else {
                      atualizarPrecosColuna(state, novosItens.slice(0, maxItemsCol));
                    }
                  }
                } catch (e) {
                  console.warn("[POLL][" + category + "] Erro ao atualizar dados:", e);
                }
              });
            });
          }, pollInterval);

          if (controlaLoader) {
            setTimeout(function () { finalizarLoader(); }, displayDuration);
          }
        } catch (error) {
          proximaTentativaOuDesistir("exceção: " + (error && error.message ? error.message : error));
        }
      }, function () {
        proximaTentativaOuDesistir("falha no load()");
      });
    });
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
    if (modoDuplo) {
      for (var i = 0; i < dualColumns.length; i++) {
        if (dualColumns[i].paginationTimer) { clearInterval(dualColumns[i].paginationTimer); dualColumns[i].paginationTimer = null; }
        if (dualColumns[i].pollingIntervalo) { clearInterval(dualColumns[i].pollingIntervalo); dualColumns[i].pollingIntervalo = null; }
      }
    } else {
      if (pollingIntervalo) {
        clearInterval(pollingIntervalo);
        pollingIntervalo = null;
      }
      if (paginationTimer) {
        clearInterval(paginationTimer);
        paginationTimer = null;
      }
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
          if (modoDuplo) {
            console.log("[INFO] Modo duplo: " + selectedCategory + " (coluna 1) + " + categoriaSecundaria + " (coluna 2)");
            iniciarColuna(selectedCategory, contentRowsContainer, true, 9);
            iniciarColuna(categoriaSecundaria, contentRowsContainer2, false, 9);
            return;
          }

          var maxItems = getMaxItems();
          var filtro = construirFiltro(category);
          console.log("[INFO] Filtro enviado: " + filtro);
          tentarCarregarPrincipal(category, filtro, maxItems, 0);
        } catch (error) {
          console.error("[ERRO] Ao carregar dados do local:", error);
          finalizarLoader();
        }
      });
    });
  }

  // Mesmo mecanismo de retry/watchdog da coluna dupla, aplicado à busca de categoria única
  function tentarCarregarPrincipal(category, filtro, maxItems, tentativa) {
    var resolvido = false;

    function proximaTentativaOuDesistir(motivo) {
      if (resolvido) { return; }
      resolvido = true;
      if (tentativa < MAX_TENTATIVAS_LOADER) {
        console.warn("[RETRY] tentativa " + (tentativa + 1) + "/" + (MAX_TENTATIVAS_LOADER + 1) + " falhou (" + motivo + "), tentando novamente...");
        setTimeout(function () {
          tentarCarregarPrincipal(category, filtro, maxItems, tentativa + 1);
        }, RETRY_DELAY_MS);
      } else {
        console.warn("[DESISTIR] " + motivo + " (esgotadas as tentativas)");
        finalizarLoader();
      }
    }

    ebhtml.create2({}, function (loaderInstance) {
      loader2 = loaderInstance;
      loader2.addData("D_MENUBOARD_PRICES", true, filtro);
      loader2.nodataiserror = false;
      loader2.autoloaded = false;
      // loader2.loaded();

      setTimeout(function () {
        proximaTentativaOuDesistir("watchdog " + LOADER_WATCHDOG_MS + "ms sem resposta");
      }, LOADER_WATCHDOG_MS);

      loader2.load(function () {
        try {
          var itensRecebidos = loader2.datalist("D_MENUBOARD_PRICES").f_items;
          var totalItems = itensRecebidos ? itensRecebidos.length : 0;
          console.log("[INFO] Total de itens no canal: " + totalItems);

          if (!itensRecebidos || totalItems === 0) {
            proximaTentativaOuDesistir("0 itens recebidos");
            return;
          }
          if (resolvido) { return; } // watchdog já desistiu desta tentativa; ignora resposta tardia
          resolvido = true;

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

          // Re-fetch periódico: atualiza allItems com preços frescos do servidor
          pollingIntervalo = setInterval(function () {
            if (finalizado) { clearInterval(pollingIntervalo); return; }
            ebhtml.create2({}, function (pollLoader) {
              pollLoader.addData("D_MENUBOARD_PRICES", true, filtro);
              pollLoader.nodataiserror = false;
              pollLoader.autoloaded = false;
              pollLoader.load(function () {
                try {
                  var novosItens = pollLoader.datalist("D_MENUBOARD_PRICES").f_items;
                  if (!novosItens || novosItens.length === 0) { return; }
                  var fpNovo = gerarFingerprint(novosItens);
                  var fpAtual = gerarFingerprint(allItems);
                  if (fpNovo === fpAtual) {
                    console.log("[POLL] Sem alterações");
                    return;
                  }
                  var countChanged = novosItens.length !== allItems.length;
                  allItems = novosItens;
                  console.log("[POLL] Dados alterados" + (countChanged ? " (qtd mudou, remontando)" : " (in-place)"));
                  if (!paginationTimer) {
                    if (countChanged) {
                      // Quantidade de itens mudou: rebuild completo inevitável
                      currentPageIndex = 0;
                      exibirProximaPagina(maxItems);
                      currentPageIndex = 0;
                    } else {
                      // Só preços/títulos mudaram: atualiza células sem piscar
                      atualizarPrecos(novosItens.slice(0, maxItems));
                    }
                  }
                } catch (e) {
                  console.warn("[POLL] Erro ao atualizar dados:", e);
                }
              });
            });
          }, pollInterval);

          // finished() apenas após displayDuration — sem reload, sem flash
          setTimeout(function () { finalizarLoader(); }, displayDuration);

        } catch (error) {
          proximaTentativaOuDesistir("exceção: " + (error && error.message ? error.message : error));
        }
      }, function () {
        proximaTentativaOuDesistir("falha no load()");
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
