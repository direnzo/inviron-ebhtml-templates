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
var DURATION = 10000; // 10 segundos
var DATASET = "D_MENUBOARD_PRICES";

// ─── CARREGAMENTO ──────────────────────────────────────────────────────────
window.onload = function () {
  // Mock ou EdgeContents?
  if (typeof MOCK_DATA !== "undefined" && MOCK_DATA.enabled) {
    console.log("[Mock] Modo de teste ativado");
    ebhtml.create2({}, function (loader) {
      var mockLoader = {
        // Simular adição de dataset
        loaded: function () {
          loader.loaded();
          console.log("[Mock] Carregado");
          3;
        },
        finished: function () {
          loader.finished();
          console.log("[Mock] Finalizado");
        },
      };
      renderizar(MOCK_DATA.produto, mockLoader);
    });
  } else {
    // EdgeContents CMS
    ebhtml.create2({}, function (loader) {
      loader.addData(DATASET, false, "f_category=cartaz");
      loader.autoloaded = false;
      loader.nodataiserror = false;

      loader.load(function () {
        if (loader.data(DATASET) == undefined) {
          console.error("[ERRO] Sem dados no dataset " + DATASET);
          loader.finished();
          return;
        }

        var item = loader.data(DATASET);
        var dados = {
          titulo: getField(item, "TITULO"),
          price: getField(item, "PRICE"),
          price2: getField(item, "PRICE2"), // preço antigo (DEPOR/FIDELIDADE) ou preço secundário (APARTIRDE)
          price3: getField(item, "PRICE3"), // preço terciário (FIDELIDADE - preço sem condição)
          unidades: getField(item, "TEXTO6"), // número de unidades (APARTIRDE)
          condicao: getField(item, "TEXTO3"), // REGULAR/DEPOR/FIDELIDADE/APARTIRDE
          unit: getField(item, "TEXTO4"), // kg/L/un
          legal: getField(item, "TEXTO5"), // texto legal (rodapé)
        };

        renderizar(dados, loader);
      });
    });
  }
};

// ─── HELPERS ────────────────────────────────────────────────────────────────
function getField(item, fieldName) {
  if (!item) return "";
  var field = item.value(fieldName);
  return field && field.value ? field.value : "";
}

function formatarPreco(valor) {
  var num = parseFloat(valor);
  if (isNaN(num)) num = 0;

  var fixed = num.toFixed(2);
  var parts = fixed.split(".");
  var inteiro = parts[0];
  var centavos = parts[1] || "00";

  // Separador de milhar
  var inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return {
    inteiro: inteiroFormatado,
    centavos: "," + centavos, // ✅ Vírgula vem do JS
    completo: inteiroFormatado + "," + centavos,
  };
}

function normalizarCondicao(condicao) {
  if (!condicao) return "regular";
  var c = condicao.toLowerCase().replace(/[_\s-]/g, "");

  if (c === "depor" || c === "de" || c === "por" || c === "promocao")
    return "depor";
  if (c === "fidelidade" || c === "club" || c === "clube") return "fidelidade";
  if (c === "apartirde" || c === "apartir" || c === "a partir")
    return "apartirde";

  return "regular";
}

function aplicarBackground(condicao) {
  var bgMap = {
    regular: "img/backgrounds/regular.jpg",
    depor: "img/backgrounds/depor.jpg",
    fidelidade: "img/backgrounds/fidelidade.jpg",
    apartirde: "img/backgrounds/apartirde.jpg",
  };

  var bgPath = bgMap[condicao] || bgMap["regular"];
  var bgContainer = document.getElementById("background_container");

  if (!bgContainer) {
    throw new Error("Elemento background_container não encontrado");
  }

  var img = document.createElement("img");
  img.src = bgPath;
  img.className = "absolute inset-0 w-full h-full object-cover";
  bgContainer.appendChild(img);
}

// ─── RENDERIZAÇÃO PRINCIPAL ────────────────────────────────────────────────
function renderizar(dados, loader) {
  console.log("[Renderizar]", dados);

  try {
    // 1. Título
    var tituloEl = document.getElementById("titulo");
    if (tituloEl) {
      tituloEl.textContent = dados.titulo || "PRODUTO";
    }

    // 2. Condição
    var condicao = normalizarCondicao(dados.condicao);
    console.log("[Condição]", condicao);

    // 3. Background
    aplicarBackground(condicao);

    // 4. Preço (usando template HTML)
    renderizarPreco(dados, condicao);

    // 5. Texto legal (rodapé)
    var legalEl = document.getElementById("legal_text");
    if (legalEl && dados.legal) {
      legalEl.textContent = dados.legal;
    }

    // 6. Animação de entrada
    var body = document.body;
    var fullContent = document.getElementById("fullContent");

    setTimeout(function () {
      body.classList.remove("opacity-0");
      body.classList.add("opacity-100");

      if (fullContent) {
        fullContent.classList.remove("opacity-0");
        fullContent.classList.add("opacity-100");
      }

      loader.loaded(); // ✅ Sucesso no carregamento

      // Finalizar após duração
      setTimeout(function () {
        loader.finished(); // ✅ Fim da execução
      }, DURATION);
    }, 100);
  } catch (erro) {
    console.error("[ERRO] Falha na renderização:", erro);
    loader.finished(); // ✅ Erro durante renderização - apenas finished
  }
}

// ─── RENDERIZAR PREÇO (usando templates HTML) ──────────────────────────────
function renderizarPreco(dados, condicao) {
  var priceDisplay = document.getElementById("price_display");
  if (!priceDisplay) {
    throw new Error("Elemento price_display não encontrado");
  }

  // Limpar conteúdo anterior
  priceDisplay.innerHTML = "";

  // Selecionar template correto
  var templateId = "template_" + condicao;
  var template = document.getElementById(templateId);

  if (!template || !template.content) {
    throw new Error("Template não encontrado: " + templateId);
  }

  // Clonar template principal
  var clone = template.content.cloneNode(true);

  // Formatar preços
  var preco = formatarPreco(dados.price);
  var preco2 = dados.price2 ? formatarPreco(dados.price2) : null;
  var preco3 = dados.price3 ? formatarPreco(dados.price3) : null;

  console.log("[Preço]", preco, "| Preço2:", preco2, "| Preço3:", preco3);

  // ─── Preencher slot: price_full (preço grande) ───────────────────────────
  var slotPriceFull = clone.querySelector('[data-slot="price_full"]');
  if (slotPriceFull) {
    var priceFull = criarPriceFull(
      preco.inteiro,
      preco.centavos,
      dados.unit || "",
    );
    slotPriceFull.appendChild(priceFull);
  }

  // ─── Preencher slot: price_inline_old (preço antigo riscado) ─────────────
  var slotPriceOld = clone.querySelector('[data-slot="price_inline_old"]');
  if (slotPriceOld) {
    var precoParaRiscar = null;

    if (condicao === "depor" && preco2) {
      precoParaRiscar = preco2; // DEPOR usa price2
    } else if (condicao === "fidelidade" && preco2) {
      precoParaRiscar = preco2; // FIDELIDADE usa price2
    } else if (condicao === "apartirde" && preco3) {
      precoParaRiscar = preco3; // APARTIRDE usa price3
    }
    // aplica preço antigo riscado se disponível para DEPOR, FIDELIDADE ou APARTIRDE
    if (precoParaRiscar) {
      var priceInlineOld = criarPriceInline(precoParaRiscar.completo);
      slotPriceOld.appendChild(priceInlineOld);
    }
  }

  // ─── Preencher slots: unidades + price_full_secondary (APARTIRDE) ────────
  if (condicao === "apartirde") {
    // Número de unidades
    var slotUnidades = clone.querySelector('[data-slot="unidades"]');
    if (slotUnidades) {
      slotUnidades.textContent = dados.unidades || "2";
      slotUnidades.classList.add("animate-pulseScaleWithDelay");
    }

    // Preço secundário FULL (preço com condição - price2)
    var slotPriceSecondary = clone.querySelector(
      '[data-slot="price_inline_secondary"]',
    );
    if (slotPriceSecondary && preco2) {
      var slotFull = slotPriceSecondary.querySelector(
        '[data-slot-inline="price_full_secondary"]',
      );
      if (slotFull) {
        var priceFullSecondary = criarPriceFull(
          preco2.inteiro,
          preco2.centavos,
          dados.unit || "",
        );
        slotFull.appendChild(priceFullSecondary);
      }
    }
  }
  // ─── Preencher slot: price_full_secondary (FIDELIDADE - preço sem condição) ───────
  if (condicao === "fidelidade") {
    var slotPriceSecondary = clone.querySelector(
      '[data-slot="price_inline_secondary"]',
    );
    if (slotPriceSecondary && preco3) {
      var slotFull = slotPriceSecondary.querySelector(
        '[data-slot-inline="price_full_secondary"]',
      );
      if (slotFull) {
        var priceFullSecondary = criarPriceFull(
          preco3.inteiro,
          preco3.centavos,
          dados.unit || "",
        );
        slotFull.appendChild(priceFullSecondary);
      }
    }
  }
  // Adicionar ao DOM
  priceDisplay.appendChild(clone);
}

// ─── CRIAR PRICE_FULL (sub-template de preço grande) ───────────────────────
function criarPriceFull(inteiro, centavos, unit) {
  var template = document.getElementById("price_full");
  if (!template || !template.content) {
    console.error("[ERRO] Template price_full não encontrado");
    return document.createDocumentFragment();
  }

  var clone = template.content.cloneNode(true);

  preencherCampo(clone, "inteiro", inteiro);
  preencherCampo(clone, "centavos", centavos);
  preencherCampo(clone, "unit", unit);

  return clone;
}

// ─── CRIAR PRICE_INLINE (sub-template de preço pequeno) ────────────────────
function criarPriceInline(precoCompleto) {
  var template = document.getElementById("price_inline");
  if (!template || !template.content) {
    console.error("[ERRO] Template price_inline não encontrado");
    return document.createDocumentFragment();
  }

  var clone = template.content.cloneNode(true);

  preencherCampo(clone, "preco_completo", precoCompleto);

  return clone;
}

// ─── PREENCHER CAMPO (helper) ───────────────────────────────────────────────
function preencherCampo(clone, fieldName, valor) {
  if (!valor && valor !== 0) return; // Não preencher se vazio

  var elementos = clone.querySelectorAll('[data-field="' + fieldName + '"]');

  for (var i = 0; i < elementos.length; i++) {
    var el = elementos[i];

    // Se tem filhos <span>, preencher o primeiro span vazio
    var spans = el.querySelectorAll("span");
    if (spans.length > 0) {
      for (var j = 0; j < spans.length; j++) {
        if (!spans[j].textContent || spans[j].textContent.trim() === "") {
          spans[j].textContent = valor;
          break;
        }
      }
    } else {
      // Senão, preencher o próprio elemento
      el.textContent = valor;
    }
  }
}
