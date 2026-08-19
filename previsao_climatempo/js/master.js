// Mapeamento Climatempo para Meteocons — agora em meteocons-helpers.js (METEOCONS_MAP)

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
// SELECAO DE CIDADE (D_CLIMA_CLIMATEMPO tem 1 ITEM com ate 3 slots C1/C2/C3)
// ============================================================
var CIDADE_SLOTS = ["C1", "C2", "C3"];
var CIDADE_DIAS = ["D1", "D2", "D3"];

// Retorna a lista de slots (ex: ["C1","C3"]) que tem pelo menos um dia com dados.
function detectarSlotsDeCidade(item) {
  var slotsValidos = [];
  var s, d, campo, arrStr, parsed;
  for (s = 0; s < CIDADE_SLOTS.length; s++) {
    var temDados = false;
    for (d = 0; d < CIDADE_DIAS.length; d++) {
      campo = CIDADE_SLOTS[s] + "_" + CIDADE_DIAS[d] + "_DATAARRAY";
      arrStr = "";
      try {
        if (item && typeof item.value === "function") {
          arrStr = item.value(campo).value;
        }
      } catch (e) { arrStr = ""; }
      if (arrStr) {
        try {
          parsed = JSON.parse(arrStr);
          if (parsed && parsed.length > 0) {
            temDados = true;
            break;
          }
        } catch (e2) { /* ignora array invalido */ }
      }
    }
    if (temDados) slotsValidos.push(CIDADE_SLOTS[s]);
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
      loader.addData("D_CLIMA_CLIMATEMPO", false);
      loader.autoloaded = false;
      loader.nodataiserror = false;
      loader.load(function () {
        var dados = [];
        var duracaoConfig = (typeof CONFIG_CLIMA !== "undefined" && CONFIG_CLIMA.duration) || 10000;
        var config = { duration: duracaoConfig };
        var item = loader.data("D_CLIMA_CLIMATEMPO");
        var cidade = "";

        // O XML tem 1 unico ITEM com ate 3 slots de cidade configuraveis (C1/C2/C3),
        // cada slot com 3 dias (D1/D2/D3). Detecta quais slots tem dados validos e
        // escolhe UM slot por vez (rotacao por relogio, sem localStorage) para nunca
        // misturar dados de cidades diferentes no mesmo conjunto de 3 cards.
        var slotsValidos = detectarSlotsDeCidade(item);
        var slotEscolhido = escolherSlotDeCidade(slotsValidos, duracaoConfig);

        var todosArrays = [
          slotEscolhido + "_D1_DATAARRAY",
          slotEscolhido + "_D2_DATAARRAY",
          slotEscolhido + "_D3_DATAARRAY"
        ];
        var agoraTimestamp = Math.floor(new Date().getTime() / 1000);
        var agoraDate = new Date();
        // Data de hoje (sem hora) para comparacao
        var hojeDia = agoraDate.getFullYear() + "-" + ("0" + (agoraDate.getMonth() + 1)).slice(-2) + "-" + ("0" + agoraDate.getDate()).slice(-2);
        var horaAlvo = agoraDate.getHours();
        var minAlvo = agoraDate.getMinutes();
        
        // Coleta TODOS os registros de todos os arrays
        var todosFuturos = [];
        for (var a = 0; a < todosArrays.length; a++) {
          var arr = [];
          if (item && typeof item.value === "function") {
            var arrStr = "";
            try {
              arrStr = item.value(todosArrays[a]).value;
              if (arrStr) {
                arr = JSON.parse(arrStr);
              }
            } catch (e) { arr = []; }
          }
          // Cidade (pega do primeiro registro valido)
          if (cidade === "" && arr.length > 0 && arr[0].city && arr[0].city.ds_name_cit) {
            cidade = arr[0].city.ds_name_cit;
          }
          // Adiciona registros cujo DIA seja >= hoje (ignora hora) - USA LOCAL TIME
          for (var i = 0; i < arr.length; i++) {
            var dt = new Date(arr[i].dt_date_wea * 1000);
            var diaReg = dt.getFullYear() + "-" + ("0" + (dt.getMonth() + 1)).slice(-2) + "-" + ("0" + dt.getDate()).slice(-2);
            if (diaReg >= hojeDia) {
              arr[i]._sourceArray = todosArrays[a]; // debug
              todosFuturos.push(arr[i]);
            }
          }
        }
        
        // Agrupa registros futuros por DIA (ignorando hora) - USA LOCAL TIME
        var diasMap = {}; // { "2026-06-01": [reg1, reg2, ...], "2026-06-02": [...] }
        for (var i = 0; i < todosFuturos.length; i++) {
          var reg = todosFuturos[i];
          var dt = new Date(reg.dt_date_wea * 1000);
          var diaKey = dt.getFullYear() + "-" + ("0" + (dt.getMonth() + 1)).slice(-2) + "-" + ("0" + dt.getDate()).slice(-2);
          if (!diasMap[diaKey]) diasMap[diaKey] = [];
          diasMap[diaKey].push(reg);
        }
        
        // Funcao auxiliar: busca registro mais proximo do horario alvo - USA LOCAL TIME
        function buscarMelhorHorario(registrosDia, horaAlvo, minAlvo) {
          var melhorReg = null;
          var menorDiff = 999999999;
          var alvoSeg = horaAlvo * 3600 + minAlvo * 60;
          for (var i = 0; i < registrosDia.length; i++) {
            var dataObj = new Date(registrosDia[i].dt_date_wea * 1000);
            var seg = dataObj.getHours() * 3600 + dataObj.getMinutes() * 60;
            var diff = Math.abs(seg - alvoSeg);
            if (diff < menorDiff) {
              menorDiff = diff;
              melhorReg = registrosDia[i];
            }
          }
          return melhorReg;
        }
        
        // Gera os 3 dias esperados: hoje, amanha, depois de amanha
        var diasEsperados = [];
        for (var offset = 0; offset < 3; offset++) {
          var dataEsperada = new Date(agoraDate.getTime());
          dataEsperada.setDate(dataEsperada.getDate() + offset);
          var diaKey = dataEsperada.getFullYear() + "-" + ("0" + (dataEsperada.getMonth() + 1)).slice(-2) + "-" + ("0" + dataEsperada.getDate()).slice(-2);
          diasEsperados.push(diaKey);
        }
        
        console.log('[CLIMA][DATA] Dias esperados (hoje/amanha/depois): ' + diasEsperados.join(', '));
        console.log('[CLIMA][DATA] Dias disponiveis no XML: ' + Object.keys(diasMap).sort().join(', '));
        
        // Monta o objeto de dados de um card a partir do registro escolhido
        function montarCardData(melhorReg, indiceCard) {
          var dataObj = new Date(melhorReg.dt_date_wea * 1000);
          var diaSemana = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"][dataObj.getDay()];
          var dia = dataObj.getDate();
          if (dia < 10) dia = "0" + dia;
          var mes = dataObj.getMonth() + 1;
          if (mes < 10) mes = "0" + mes;
          var dataStr = dia + "/" + mes;
          // Log da data/hora real do registro escolhido para este card (o que efetivamente vai pra tela)
          console.log('[CLIMA][DATA] Card ' + (indiceCard + 1) + ' -> ' + dataStr + ' ' + ("0" + dataObj.getHours()).slice(-2) + ":" + ("0" + dataObj.getMinutes()).slice(-2) + ' | timestamp=' + melhorReg.dt_date_wea + ' | array=' + (melhorReg._sourceArray || 'N/A'));
          return {
            CIDADE: cidade,
            DIA: diaSemana,
            DATA: dataStr,
            HORA: ("0" + dataObj.getHours()).slice(-2) + ":" + ("0" + dataObj.getMinutes()).slice(-2),
            MAX: melhorReg.nr_max_wea,
            MIN: melhorReg.nr_min_wea,
            ICON: (melhorReg.ds_moonphase_wea || melhorReg.nr_icon_wea),
            QTDE_CHUVA: melhorReg.nr_precipitation_wea,
            PROB_CHUVA: melhorReg.nr_probrain_wea,
            VENTO_DIR: melhorReg.ds_winddirection_wea,
            VENTO_VEL: melhorReg.nr_windavgvelocity_wea,
            UV: melhorReg.nr_uv_wea,
            UVLEVEL: melhorReg.ds_uvlevel_wea,
            DESCRICAO: melhorReg.ds_textmin_wea || ""
          };
        }

        // Busca registro para cada dia esperado (hoje, amanha, depois de amanha)
        var diaResultados = [null, null, null];
        for (var d = 0; d < diasEsperados.length; d++) {
          var diaKey = diasEsperados[d];
          var registrosDia = diasMap[diaKey];

          if (!registrosDia || registrosDia.length === 0) {
            console.warn('[CLIMA][DATA] ALERTA: Sem dados para o dia ' + diaKey + ' (Card ' + (d + 1) + ')');
            continue;
          }

          var melhorReg = buscarMelhorHorario(registrosDia, horaAlvo, minAlvo);
          if (melhorReg) {
            diaResultados[d] = montarCardData(melhorReg, d);
          }
        }

        // Garante sempre 3 cards: reaproveita a previsao mais proxima ja resolvida
        // (pode ficar "desatualizada" no card preenchido, mas nunca falta card).
        var g;
        for (g = 1; g < diaResultados.length; g++) {
          if (!diaResultados[g] && diaResultados[g - 1]) {
            console.warn('[CLIMA][DATA] Card ' + (g + 1) + ' sem dados - reaproveitando previsao do card ' + g);
            diaResultados[g] = diaResultados[g - 1];
          }
        }
        for (g = diaResultados.length - 2; g >= 0; g--) {
          if (!diaResultados[g] && diaResultados[g + 1]) {
            console.warn('[CLIMA][DATA] Card ' + (g + 1) + ' sem dados - reaproveitando previsao do card ' + (g + 2));
            diaResultados[g] = diaResultados[g + 1];
          }
        }
        for (g = 0; g < diaResultados.length; g++) {
          if (diaResultados[g]) dados.push(diaResultados[g]);
        }

        if (dados.length === 0) {
          loader.finished();
          return;
        }
        iniciarTemplate(dados, config, loader);
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

  if (HARDWARE_FRACO) {
    // Esconde o container inteiro: icones carregam no escuro, sem "montar" em tela
    cardsContainer.style.opacity = '0';
  }
  
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

  // Aguarda próximo frame para aplicar animação
  // Em hardware fraco: loader.loaded() só após renderização completa dos cards
  setTimeout(function() {
    aplicarEscalaTodosCards();
    animarCards(cardsElements, dados.length);
    autofitTodasDescricoes();
    if (HARDWARE_FRACO && loader) {
      // Aguarda icones e revela tudo de uma vez com fade rapido
      aguardarIconesCards(function() {
        cardsContainer.style.transition = 'opacity 0.4s';
        cardsContainer.style.opacity = '1';
        loader.loaded();
      }, 5000);
    }
  }, HARDWARE_FRACO ? 0 : 50);

  var duracaoFinal = (typeof CONFIG_CLIMA !== "undefined" && CONFIG_CLIMA.duration) || (config && config.duration) || 10000;

  if (!HARDWARE_FRACO && loader) loader.loaded();
  setTimeout(function () {
    // document.body.classList.remove('opacity-100');
    // document.body.classList.add('opacity-0');
    setTimeout(function () {
      if (loader) loader.finished();
    }, 1000);
  }, duracaoFinal);
}

// Polling: aguarda todos os icones principais (.icon) terem SVG injetado
function aguardarIconesCards(callback, timeoutMs) {
  var limite = Date.now() + (timeoutMs || 4000);
  function verificar() {
    var icones = document.querySelectorAll('.card .icon');
    var todos = icones.length > 0;
    for (var i = 0; i < icones.length; i++) {
      if (!icones[i].querySelector('svg')) { todos = false; break; }
    }
    if (todos || Date.now() >= limite) {
      callback();
    } else {
      setTimeout(verificar, 100);
    }
  }
  setTimeout(verificar, 0);
}

// Função para animar os cards com translate-X + opacity
function animarCards(cards, qtd) {
  var delays = [0, 400, 800];
  for (var i = 0; i < cards.length && i < qtd; i++) {
    if (HARDWARE_FRACO) {
      // Hardware fraco: elimina a transição CSS e mostra direto
      cards[i].style.transition = 'none';
      cards[i].classList.remove('-translate-x-[120%]', 'opacity-0', 'transition-all', 'duration-1000', 'ease-out');
    } else {
      // Hardware normal: mantém transition-all/duration/ease-out para o slide-in funcionar
      cards[i].style.transitionDelay = delays[i] + 'ms';
      cards[i].classList.remove('-translate-x-[120%]', 'opacity-0');
    }
    cards[i].classList.add('translate-x-0', 'opacity-100');
  }
}

// Preenche um card estático com dados e injeta SVG inline
function preencherCardClima(card, d, corClima) {
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
    var textoDescricao = (d.DESCRICAO || "").toString().replace(/^\s+|\s+$/g, "");
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
    var codigo = (d.ICON || "3").toString();
    var nomeIcone = climaToMeteocon(codigo);
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
}

// Função carregarSvgInline removida — usar injetarMeteocon() do meteocons-helpers.js
