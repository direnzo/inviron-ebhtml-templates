// Mapeamento "código bruto da fonte de dados -> ícone Meteocon" foi
// extraído para js/provider-cptec.js (troque esse arquivo para plugar
// outra fonte de dados, ex: OpenWeather — ver contrato documentado lá).
// Este master.js só chama a interface genérica: codigoParaMeteocon()
// e codigoParaDescricao().

// ============================================================
// DETECCAO DE HARDWARE FRACO
// Usa APIs de hardware reais (deviceMemory, hardwareConcurrency).
// Para testar no DevTools: adicione ?hwfraco=1 na URL.
// ============================================================
var HARDWARE_FRACO = false;

(function detectarHardwareFraco() {
  // Override para testes: ?hwfraco=1 na URL
  if (window.location.search.indexOf('hwfraco=1') !== -1) {
    HARDWARE_FRACO = true;
    return;
  }
  // Android via User-Agent: sempre fraco (WebKit legado, CPU/GPU limitados)
  if (navigator.userAgent.indexOf('Android') !== -1) {
    HARDWARE_FRACO = true;
    return;
  }
  // RAM <= 1GB = Android de entrada (Chrome 63+, funciona no Chrome 78)
  if (navigator.deviceMemory && navigator.deviceMemory <= 1) {
    HARDWARE_FRACO = true;
    return;
  }
  // <= 2 nucleos logicos = definitivamente fraco
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
    HARDWARE_FRACO = true;
  }
})();

// ============================================================
// ASPECT RATIO DETECTION
// ============================================================
var ALL_RATIO_CLASSES = [
  'ratio-landscape',
  'ratio-ultrawide',
  'ratio-superbanner',
  'ratio-footer',
  'ratio-portrait',
  'ratio-square',
  'ratio-empena'
];

function definirClasseAspectRatio() {
  var ar = window.innerWidth / window.innerHeight;
  var cls;
  // Alinhado com tailwind.config.js — ordem de precedencia identica
  if (ar < (1 / 3))           { cls = 'ratio-empena'; }
  else if (ar < (3 / 4))      { cls = 'ratio-portrait'; }
  else if (ar < (4 / 3))      { cls = 'ratio-square'; }
  else if (ar < 2)            { cls = 'ratio-landscape'; }
  else if (ar < 5)            { cls = 'ratio-ultrawide'; }
  else if (ar < 15)           { cls = 'ratio-superbanner'; }
  else                        { cls = 'ratio-footer'; }
  return cls;
}

function aplicarClasseAspectRatio() {
  var i;
  var ratioClass = definirClasseAspectRatio();
  for (i = 0; i < ALL_RATIO_CLASSES.length; i++) {
    document.body.classList.remove(ALL_RATIO_CLASSES[i]);
  }
  document.body.classList.add(ratioClass);
}

var resizeTimeout = null;
function onResize() {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  resizeTimeout = setTimeout(function() {
    aplicarClasseAspectRatio();
    redesenharCards();
  }, 200);
}

// Ultimos dados renderizados, guardados para permitir redesenho completo dos
// cards a cada resize sem precisar recarregar a pagina nem chamar o loader
// EBHTML de novo (ver redesenharCards mais abaixo).
var CARDS_DADOS_ATUAIS = null;

// ============================================================
// ESCALA POR CARD (--cvmin) — dimensionamento relativo ao proprio card,
// nao ao viewport inteiro. Resolve o problema de vmin global: com 3 cards
// lado a lado, cada card tem uma fracao da tela, entao fontes/icones
// dimensionados por vmin do viewport nao cabem no espaco real do card.
// --cvmin = min(largura, altura) do card / 100, em pixels (equivalente a um
// "vmin local" do card). Usado via calc(var(--cvmin) * N) no CSS.
// ============================================================
function aplicarEscalaCard(card) {
  if (!card) return 0;
  var base = Math.min(card.clientWidth, card.clientHeight) / 100;
  if (base > 0) {
    card.style.setProperty('--cvmin', base + 'px');
  }
  return base;
}

// Aspect-ratio AUXILIAR — captura o formato de CADA CARD individualmente
// (nao o aspect-ratio da tela inteira). Um card pode acabar largo/baixo mesmo
// em telas portrait (ex: 3 cards empilhados), entao a direcao do icone +
// temperaturas deve responder ao formato real do card, nao a classe global
// de aspect-ratio da tela (ratio-portrait/ratio-square/etc).
var CARD_RAZAO_HORIZONTAL = 1.15; // largura/altura >= isso -> icone e temp lado a lado

function aplicarOrientacaoCard(card) {
  if (!card) return;
  var w = card.clientWidth;
  var h = card.clientHeight;
  if (!w || !h) return;
  var ar = w / h;
  if (ar >= CARD_RAZAO_HORIZONTAL) {
    card.classList.add('card-horizontal');
    card.classList.remove('card-vertical');
  } else {
    card.classList.add('card-vertical');
    card.classList.remove('card-horizontal');
  }
}

function aplicarEscalaTodosCards() {
  var cards = document.querySelectorAll('.card');
  var i;
  for (i = 0; i < cards.length; i++) {
    aplicarEscalaCard(cards[i]);
    aplicarOrientacaoCard(cards[i]);
  }
}

// ============================================================
// DESCRICAO (ds_textmin_wea) — visibilidade por tamanho de tela + auto-fit
// ============================================================
var DESCRICAO_TELA_MINIMA = 500; // px — abaixo disso (largura OU altura), oculta a descricao
var DESCRICAO_FONTE_MAX_CVMIN = 11; // multiplicador de --cvmin (tamanho inicial da fonte)
var DESCRICAO_FONTE_MIN_CVMIN = 5; // multiplicador de --cvmin (piso minimo legivel)
var DESCRICAO_FONTE_PASSO_CVMIN = 0.3;
var DESCRICAO_ALTURA_MAX_CVMIN = 26; // multiplicador de --cvmin (espaco maximo reservado)

// Aplica a regra de exibicao por tamanho de tela em todas as descricoes.
// Retorna true se as descricoes devem ficar visiveis.
function aplicarVisibilidadeDescricao() {
  var visivel = window.innerWidth >= DESCRICAO_TELA_MINIMA && window.innerHeight >= DESCRICAO_TELA_MINIMA;
  var els = document.querySelectorAll('.descricao');
  var i;
  for (i = 0; i < els.length; i++) {
    if (visivel) {
      // Sempre mostra (mesmo sem texto) para preservar altura fixa nos 3 cards
      els[i].classList.remove('hidden');
    } else {
      els[i].classList.add('hidden');
    }
  }
  return visivel;
}
// Reduz progressivamente o font-size ate o texto caber na altura fixa reservada.
// Usa height (nao maxHeight) para que os 3 cards sempre reservem o mesmo espaco,
// evitando que o bloco de temperaturas varie de posicao entre cards.
function autofitDescricao(el) {
  if (!el || el.classList.contains('hidden')) return;

  var card = el.parentNode;
  var cvmin = aplicarEscalaCard(card);
  if (!cvmin) return;

  var alturaFixa = cvmin * DESCRICAO_ALTURA_MAX_CVMIN;
  el.style.height = alturaFixa + 'px';

  var textoVazio = !el.innerText || el.innerText.replace(/^\s+|\s+$/g, '') === '';
  if (textoVazio) return;

  var fonte = DESCRICAO_FONTE_MAX_CVMIN;
  el.style.fontSize = (cvmin * fonte) + 'px';

  var tentativas = 0;
  while (el.scrollHeight > el.clientHeight && fonte > DESCRICAO_FONTE_MIN_CVMIN && tentativas < 40) {
    fonte -= DESCRICAO_FONTE_PASSO_CVMIN;
    el.style.fontSize = (cvmin * fonte) + 'px';
    tentativas++;
  }
}

function autofitTodasDescricoes() {
  if (!aplicarVisibilidadeDescricao()) return;
  var els = document.querySelectorAll('.descricao');
  var i, fonteMinima;

  // Primeira passagem: calcula o font-size de cada card individualmente
  for (i = 0; i < els.length; i++) {
    autofitDescricao(els[i]);
  }

  // Segunda passagem: encontra o menor font-size entre os que têm texto
  fonteMinima = null;
  for (i = 0; i < els.length; i++) {
    if (els[i].classList.contains('hidden')) continue;
    if (!els[i].innerText || els[i].innerText.replace(/^\s+|\s+$/g, '') === '') continue;
    var fs = parseFloat(els[i].style.fontSize);
    if (!isNaN(fs) && (fonteMinima === null || fs < fonteMinima)) {
      fonteMinima = fs;
    }
  }

  // Terceira passagem: aplica o menor font-size em todos (uniformiza)
  if (fonteMinima !== null) {
    for (i = 0; i < els.length; i++) {
      if (!els[i].classList.contains('hidden')) {
        els[i].style.fontSize = fonteMinima + 'px';
      }
    }
  }
}

// ============================================================
// SELECAO DE CIDADE (D_CLIMA tem 1 ITEM com ate 3 slots C1/C2/C3)
// ============================================================
var CIDADE_SLOTS = ["C1", "C2", "C3"];
var CIDADE_DIAS = ["D1", "D2", "D3"];
// Rede de seguranca: so dispara se o canal D_CLIMA realmente travar
// (XHR pendurado). NAO deve competir com a latencia normal da rede —
// 300ms estourava a cada jitter e fazia o template exibir "sem dados"
// mesmo com o canal online. 12s da folga para round-trip + parsing.
var CANAL_TIMEOUT_MS = 12000;

// Retorna a lista de slots (ex: ["C1","C3"]) que tem cidade configurada no D1.
function detectarSlotsDeCidade(item) {
  var slotsValidos = [];
  var s, campo, valor;
  for (s = 0; s < CIDADE_SLOTS.length; s++) {
    campo = CIDADE_SLOTS[s] + "_D1_CIDADE";
    valor = "";
    try { valor = item.value(campo).value || ""; } catch (e) { valor = ""; }
    valor = valor.replace(/^\s+|\s+$/g, "");
    if (valor !== "") slotsValidos.push(CIDADE_SLOTS[s]);
  }
  if (slotsValidos.length === 0) slotsValidos.push("C1");
  return slotsValidos;
}

// Escolhe um slot por rotacao deterministica de relogio (sem localStorage):
// slot = floor(agora / duracao) % total. Com 1 unica cidade configurada,
// sempre cai no mesmo slot (comportamento identico ao atual).
function escolherSlotDeCidade(slotsValidos, duracaoMs) {
  var intervalo = duracaoMs || 10000;
  var indice = Math.floor(Date.now() / intervalo) % slotsValidos.length;
  return slotsValidos[indice];
}

window.onload = function () {
  // Aplica classe de aspect ratio e hardware fraco
  aplicarClasseAspectRatio();
  if (HARDWARE_FRACO) {
    document.body.classList.add('hardware-fraco');
    // Desativa animacoes CSS dos icones SVG (Meteocons sao pesados em Android)
    var s = document.createElement('style');
    s.innerHTML = '.hardware-fraco .icon svg *, .hardware-fraco .icon svg { animation: none !important; transition: none !important; }';
    document.head.appendChild(s);
  }
  aplicarVisibilidadeDescricao();
  window.addEventListener('resize', onResize);

  if (typeof MOCK_DATA !== "undefined" && MOCK_DATA.enabled) {
    var mockLoader = {
      loaded: function () {},
      finished: function () {},
    };
    iniciarTemplate(MOCK_DATA.dados, MOCK_DATA.config, mockLoader);
  } else {
    ebhtml.create2({}, function (loader) {
      var playlistEncerrada = false;
      var loadTimeoutId = null;

      function limparTimeoutCanal() {
        if (loadTimeoutId) {
          clearTimeout(loadTimeoutId);
          loadTimeoutId = null;
        }
      }

      function encerrarSemDados(motivo) {
        if (playlistEncerrada) return;
        playlistEncerrada = true;
        limparTimeoutCanal();
        console.warn('[CPTEC][DATA] Encerrando item sem renderizar: ' + motivo);
        loader.finished();
      }

      loader.addData("D_CLIMA", false);
      loader.autoloaded = false;
      loader.nodataiserror = false;
      loadTimeoutId = setTimeout(function () {
        encerrarSemDados('Timeout ao aguardar resposta do canal D_CLIMA');
      }, CANAL_TIMEOUT_MS);

      loader.load(function () {
        limparTimeoutCanal();
        var dados = [];
        var duracaoConfig = (typeof CONFIG_CLIMA !== "undefined" && CONFIG_CLIMA.duration) || 10000;
        var config = { duration: duracaoConfig };
        var item = loader.data("D_CLIMA");
        var DIAS_SEMANA = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"];

        // Sem item = XML ausente ou vazio
        if (!item || typeof item.value !== "function") {
          encerrarSemDados('Canal D_CLIMA sem item valido');
          return;
        }

        function getVal(key) {
          try { return (item.value(key).value || "").replace(/^\s+|\s+$/g, ""); }
          catch (e) { return ""; }
        }

        // Detecta slots de cidade validos e escolhe um por rotacao de relogio
        var slotsValidos = detectarSlotsDeCidade(item);
        var slotEscolhido = escolherSlotDeCidade(slotsValidos, duracaoConfig);

        // DATE1/DATE2/DATE3 vêm como "2026-04-09" no XML
        var dateStrs = [getVal("DATE1"), getVal("DATE2"), getVal("DATE3")];
        var cidadeNome = getVal(slotEscolhido + "_D1_CIDADE");

        // Cidade vazia = item existe mas não tem dados reais
        if (!cidadeNome) {
          encerrarSemDados('Cidade vazia no slot selecionado');
          return;
        }

        var ultimoDiaRenderizado = '';
        var validos = 0;
        for (var d = 0; d < CIDADE_DIAS.length; d++) {
          var prefix = slotEscolhido + "_" + CIDADE_DIAS[d] + "_";
          var dateStr = dateStrs[d];
          // Usa T12:00:00 para evitar deslocamento de fuso ao parsear a data
          var dataObj = dateStr ? new Date(dateStr + "T12:00:00") : null;
          var diaSemana = dataObj ? DIAS_SEMANA[dataObj.getDay()] : "";
          var dataFormatada = dataObj ? (("0" + dataObj.getDate()).slice(-2) + "/" + ("0" + (dataObj.getMonth() + 1)).slice(-2)) : "";
          var max = getVal(prefix + "MAX");
          var min = getVal(prefix + "MIN");
          // A sigla/ícone do CPTEC vem no campo TEXTPT do canal D_CLIMA
          // (ex: C1_D1_TEXTPT). Quando TEXTPT vem vazio, cai para o
          // código numérico inteiro do campo ICO (ex: '1'..'11', '99'
          // como default) — provider-cptec.js resolve os dois formatos.
          var iconeCodigo = getVal(prefix + "TEXTPT") || getVal(prefix + "ICO");

          // Card sem temperaturas = dado corrompido ou incompleto, oculta posição
          if (!max && !min) {
            console.warn('[CPTEC][DATA] Card ' + (d + 1) + ' sem temperaturas - renderizando oculto');
            dados.push({
              CIDADE: cidadeNome,
              HIDDEN: true
            });
            continue;
          }

          // Evita mostrar dia repetido em sequência (D2 = D1, D3 = D2, etc).
          if (dataFormatada && dataFormatada === ultimoDiaRenderizado) {
            console.warn('[CPTEC][DATA] Card ' + (d + 1) + ' com dia duplicado - renderizando oculto');
            dados.push({
              CIDADE: cidadeNome,
              HIDDEN: true
            });
            continue;
          }

          dados.push({
            CIDADE: cidadeNome,
            DIA: diaSemana,
            DATA: dataFormatada,
            HORA: "",
            MAX: max,
            MIN: min,
            ICON: iconeCodigo,
            QTDE_CHUVA: getVal(prefix + "PRECIPITATION"),
            PROB_CHUVA: "",
            VENTO_DIR: getVal(prefix + "WINDDIRECTION"),
            VENTO_VEL: getVal(prefix + "WINDAVGVELOCITY"),
            UV: getVal(prefix + "UV"),
            UVLEVEL: getVal(prefix + "UVLEVEL"),
            DESCRICAO: codigoParaDescricao(iconeCodigo)
          });
          ultimoDiaRenderizado = dataFormatada || ultimoDiaRenderizado;
          validos++;
        }

        if (validos === 0) {
          encerrarSemDados('Nenhum card valido apos processamento');
          return;
        }
        iniciarTemplate(dados, config, loader);
      }, function () {
        limparTimeoutCanal();
        encerrarSemDados('Falha no loader.load() para D_CLIMA');
      });
    });
  }
};

// Cor principal dos icones (CONFIG_CLIMA.iconColor e o contrato oficial;
// corClimaPrincipal e alias temporario mantido para compatibilidade).
// Extraida em funcao propria para ser reaproveitada tanto no render inicial
// (iniciarTemplate) quanto no redesenho por resize (redesenharCards).
function resolverCorClima() {
  var corClima = "#ffffff"; // padrao
  if (typeof CONFIG_CLIMA !== "undefined") {
    if (CONFIG_CLIMA.iconColor) {
      corClima = CONFIG_CLIMA.iconColor;
    } else if (CONFIG_CLIMA.corClimaPrincipal) {
      corClima = CONFIG_CLIMA.corClimaPrincipal;
    }
  }
  return corClima;
}

// Reconstroi os cards no DOM a partir dos dados ja carregados em memoria
// (CARDS_DADOS_ATUAIS), sem recarregar a pagina nem chamar o loader EBHTML
// de novo. Chamada a cada resize (com debounce, ver onResize) para garantir
// que o layout sempre "redesenhe" do zero e nao acumule estados intermediarios
// de um redimensionamento anterior.
function redesenharCards() {
  if (!CARDS_DADOS_ATUAIS || !CARDS_DADOS_ATUAIS.length) return;

  var cardsContainer = document.getElementById("cards");
  var template = document.getElementById("card-template");
  if (!cardsContainer || !template) return;

  var corClima = resolverCorClima();

  // Remove os cards atuais
  while (cardsContainer.firstChild) {
    cardsContainer.removeChild(cardsContainer.firstChild);
  }

  var cardsElements = [];
  var i;
  for (i = 0; i < CARDS_DADOS_ATUAIS.length; i++) {
    var cardClone = template.content.cloneNode(true);
    var card = cardClone.querySelector(".card");
    preencherCardClima(card, CARDS_DADOS_ATUAIS[i], corClima);
    // Redesenho por resize: cards aparecem direto no lugar, sem repetir o
    // slide-in de entrada (isso e so para o primeiro carregamento).
    card.classList.remove("-translate-x-[120%]", "opacity-0");
    card.classList.add("translate-x-0", "opacity-100");
    card.style.transitionDelay = "0ms";
    cardsContainer.appendChild(card);
    cardsElements.push(card);
  }

  aplicarEscalaTodosCards();
  autofitTodasDescricoes();
}

var LOADED_DISPARADO = false;
function sinalizarLoaded(loader) {
  if (!loader || LOADED_DISPARADO) return;
  LOADED_DISPARADO = true;

  var overlay = document.getElementById('preload-black');
  if (overlay) {
    overlay.style.transition = 'opacity 0.35s';
    overlay.style.opacity = '0';
    setTimeout(function () {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 400);
  }

  loader.loaded();
}

function revelarCardQuandoIconePronto(card, callback) {
  if (!card) {
    if (callback) callback();
    return;
  }
  if (card.getAttribute('data-hidden-card') === '1') {
    if (callback) callback();
    return;
  }

  var timeoutMs = HARDWARE_FRACO ? 520 : 360;
  var limite = Date.now() + timeoutMs;

  card.style.opacity = '0';

  function concluir() {
    if (HARDWARE_FRACO) {
      // Sem animacao em hardware fraco: mostra direto.
      card.classList.remove('-translate-x-[120%]', 'transition-all', 'duration-1000', 'ease-out');
      card.classList.add('translate-x-0');
      card.style.opacity = '1';
    } else {
      // Hardware normal: inicia o slide-in quando o icone principal estiver pronto.
      card.classList.remove('-translate-x-[120%]');
      card.classList.add('translate-x-0');
      card.style.opacity = '1';
    }
    if (callback) callback();
  }

  function verificar() {
    if (card.querySelector('.icon svg') || Date.now() >= limite) {
      concluir();
    } else {
      setTimeout(verificar, 35);
    }
  }

  setTimeout(verificar, 0);
}

function revelarCardsQuandoProntos(cards, callbackFinal) {
  if (!cards || !cards.length) {
    if (callbackFinal) callbackFinal();
    return;
  }

  var pendentes = cards.length;
  function onCardDone() {
    pendentes--;
    if (pendentes <= 0 && callbackFinal) {
      callbackFinal();
    }
  }

  for (var i = 0; i < cards.length; i++) {
    revelarCardQuandoIconePronto(cards[i], onCardDone);
  }
}

function iniciarTemplate(dados, config, loader) {
  CARDS_DADOS_ATUAIS = dados;

  // Header: cidade
  var cidadeEl = document.getElementById("cidade");
  if (cidadeEl && dados[0] && dados[0].CIDADE) {
    cidadeEl.innerText = dados[0].CIDADE;
  }

  // Aplica cor principal dos ícones via variável CSS
  var corClima = resolverCorClima();
  document.body.style.setProperty("--clima-principal", corClima);

  // Aplica cor do texto via CONFIG_CLIMA (fallback: branco)
  var corTexto = (typeof CONFIG_CLIMA !== "undefined" && CONFIG_CLIMA.textColor) ? CONFIG_CLIMA.textColor : "#ffffff";
  document.body.style.color = corTexto;

  // Criar cards dinamicamente a partir do template
  var cardsContainer = document.getElementById("cards");
  var template = document.getElementById("card-template");
  var cardsElements = [];

  for (var i = 0; i < dados.length; i++) {
    // Clona o template
    var cardClone = template.content.cloneNode(true);
    var card = cardClone.querySelector(".card");

    // Preenche o card com dados
    preencherCardClima(card, dados[i], corClima);

    // Adiciona no container
    cardsContainer.appendChild(card);
    cardsElements.push(card);
  }

  // Reflow antes de animar
  void cardsContainer.offsetHeight;

  // Aplica layout, anima entrada e revela cada card junto com seu ícone.
  setTimeout(function() {
    aplicarEscalaTodosCards();
    animarCards(cardsElements, dados.length);
    autofitTodasDescricoes();
    revelarCardsQuandoProntos(cardsElements, function () {
      sinalizarLoaded(loader);
    });
  }, HARDWARE_FRACO ? 40 : 20);

  var duracaoFinal = (typeof CONFIG_CLIMA !== "undefined" && CONFIG_CLIMA.duration) || (config && config.duration) || 10000;

  setTimeout(function () {
    // document.body.classList.remove('opacity-100');
    // document.body.classList.add('opacity-0');
    setTimeout(function () {
      if (loader) loader.finished();
    }, 1000);
  }, duracaoFinal);
}

// Configura delays e estrategia de entrada. A execucao do slide-in no
// hardware normal acontece em revelarCardQuandoIconePronto().
function animarCards(cards, qtd) {
  var delays = [0, 400, 800];
  for (var i = 0; i < cards.length && i < qtd; i++) {
    if (HARDWARE_FRACO) {
      // Hardware fraco: sem delay e sem animacao de entrada.
      cards[i].style.transitionDelay = '0ms';
    } else {
      // Hardware normal: delay por card, slide-in sera disparado no reveal.
      cards[i].style.transitionDelay = delays[i] + 'ms';
    }
  }
}

// Preenche um card estático com dados e injeta SVG inline
function preencherCardClima(card, d, corClima) {
  // Fallback de dia ausente/duplicado: mantém o card no layout, mas oculto.
  if (d && d.HIDDEN) {
    card.setAttribute('data-hidden-card', '1');
    card.style.opacity = '0';
    card.style.pointerEvents = 'none';
    card.setAttribute('aria-hidden', 'true');
    return;
  }
  card.setAttribute('data-hidden-card', '0');

  // Data
  var dataDiv = card.querySelector(".data");
  var dateHourDiv = card.querySelector(".date-hour");
  if (dataDiv) {
    var horaStr = d.HORA ? (" - " + d.HORA) : "";
    dataDiv.innerText = d.DIA || "";
  }
  if (dateHourDiv) {
    // dateHourDiv.innerText = d.DATA + " " + (d.HORA || "--");
    dateHourDiv.innerText = d.DATA;

  }
  // Descrição curta do tempo (ds_textmin_wea) — fallback vazio evita espaço morto
  var descricaoDiv = card.querySelector(".descricao");
  if (descricaoDiv) {
    var textoDescricaoBruto = d.DESCRICAO || codigoParaDescricao(d.ICON) || "";
    var textoDescricao = textoDescricaoBruto.toString().replace(/^\s+|\s+$/g, "");
    if (textoDescricao) {
      descricaoDiv.innerText = textoDescricao;
      descricaoDiv.setAttribute("data-tem-texto", "1");
    } else {
      descricaoDiv.innerText = "";
      descricaoDiv.setAttribute("data-tem-texto", "0");
      // Sem hidden: o espaco fixo e reservado pelo autofitDescricao para alinhar os 3 cards
    }
  }
  // Ícone principal (Meteocon SVG via XHR)
  var iconDiv = card.querySelector(".icon");
  if (iconDiv) {
    var nomeIcone = codigoParaMeteocon(d.ICON);
    injetarMeteocon(iconDiv, nomeIcone, corClima);
  }
  // Temperaturas
  var maxSpan = card.querySelector(".max");
  if (maxSpan) {
    maxSpan.innerText = d.MAX ? d.MAX + "°" : "--";
  }
  var minSpan = card.querySelector(".min");
  if (minSpan) {
    minSpan.innerText = d.MIN ? d.MIN + "°" : "--";
  }

  // Setas SVG inline — usa cache para nao recarregar a cada card
  var arrowUpEl = card.querySelector(".arrow-up-svg");
  if (arrowUpEl) {
    carregarSvgCached('img/arrow-up.svg', function(err, svgText) {
      if (err || !svgText) return;
      arrowUpEl.innerHTML = svgText;
      var svg = arrowUpEl.querySelector('svg');
      if (svg) {
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.style.color = '#f9b71e';
      }
    });
  }
  var arrowDownEl = card.querySelector(".arrow-down-svg");
  if (arrowDownEl) {
    carregarSvgCached('img/arrow-down.svg', function(err, svgText) {
      if (err || !svgText) return;
      arrowDownEl.innerHTML = svgText;
      var svg = arrowDownEl.querySelector('svg');
      if (svg) {
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.style.color = '#80ace3';
      }
    });
  }

  // A linha extra (chuva / vento / UV) esta oculta no template
  // (extra-info-row com classe "hidden"). Injetar esses ~5 SVGs por card
  // — cada um com XHR + parse + getBBox — e puro desperdicio no load,
  // especialmente em hardware fraco. So processa se a linha estiver visivel.
  var extraInfoRow = card.querySelector(".extra-info-row");
  var extraInfoVisivel = extraInfoRow && !extraInfoRow.classList.contains("hidden");

  if (extraInfoVisivel) {
  // Chuva
  var quantChuva = card.querySelector(".quant_chuva");
  if (quantChuva) {
    quantChuva.innerText = (d.QTDE_CHUVA || "--") + "mm";
  }
  var probChuva = card.querySelector(".prob_chuva");
  if (probChuva) {
    probChuva.innerText = (d.PROB_CHUVA || "--") + "%";
  }
  var chuvaIcon = card.querySelector(".chuva-icon");
  if (chuvaIcon) {
    var prob = parseInt(String(d.PROB_CHUVA).replace(/[^0-9]/g, ''), 10);
    if (isNaN(prob)) prob = 0;
    // Opacidade proporcional a probabilidade (0% = 0.15, 100% = 1)
    var opacidade = 0.15 + (prob / 100) * 0.85;
    chuvaIcon.style.opacity = opacidade;
    injetarMeteocon(chuvaIcon, 'raindrops', corClima);
  }

  // Vento
  var quantVento = card.querySelector(".quant_vento");
  if (quantVento) {
    quantVento.innerText = (d.VENTO_VEL || "--") + "km/h";
  }
  var ventoIcon = card.querySelector(".vento-icon");
  if (ventoIcon) {
    var nomeIconeVento = ventoVelocidadeParaIcone(d.VENTO_VEL);
    injetarMeteocon(ventoIcon, nomeIconeVento, corClima);
  }
  var dirVentoSvg = card.querySelector(".dir-vento-svg");
  if (dirVentoSvg && d.VENTO_DIR) {
    carregarSvgCached('img/compass.svg', function(err, svgText) {
      if (err || !svgText) return;
      dirVentoSvg.innerHTML = svgText;
      var svg = dirVentoSvg.querySelector('svg');
      if (svg) {
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        var ang = direcaoCardinalParaAngulo(d.VENTO_DIR);
        // Rotaciona o path inteiro no centro do viewBox (12 12)
        var path = svg.querySelector('path');
        if (path) {
          path.setAttribute('transform', 'rotate(' + ang + ' 12 12)');
        }
      }
    });
  }

  // UV
  var indiceUV = card.querySelector(".indice_uv");
  if (indiceUV) {
    indiceUV.innerText = "UV " + (d.UV || "--");
  }
  var riscoUV = card.querySelector(".risco_uv");
  if (riscoUV) {
    riscoUV.innerText = "- " + (d.UVLEVEL || "--");
  }
  var uvIcon = card.querySelector(".uv-icon");
  if (uvIcon && d.UV) {
    var nomeUv = uvToMeteocon(d.UV);
    injetarMeteocon(uvIcon, nomeUv, '#facc15');
  } else if (uvIcon) {
    injetarMeteocon(uvIcon, 'uv-index', '#facc15');
  }
  } // fim if (extraInfoVisivel)
}

// Função carregarSvgInline removida — usar injetarMeteocon() do meteocons-helpers.js
