// Mapeamento Climatempo para Meteocons — agora em meteocons-helpers.js (METEOCONS_MAP)
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
  console.log('[ASPECT] ar=' + ar.toFixed(4) + ' w=' + window.innerWidth + ' h=' + window.innerHeight + ' -> ' + cls);
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
  }, 200);
}

window.onload = function () {
  // Aplica classe de aspect ratio
  aplicarClasseAspectRatio();
  window.addEventListener('resize', onResize);

  if (typeof MOCK_DATA !== "undefined" && MOCK_DATA.enabled) {
    var mockLoader = {
      loaded: function () {
        console.log("[Mock] Carregado");
      },
      finished: function () {
        console.log("[Mock] Finalizado");
      },
    };
    iniciarTemplate(MOCK_DATA.dados, MOCK_DATA.config, mockLoader);
  } else {
    ebhtml.create2({}, function (loader) {
      loader.addData("D_CLIMA_CLIMATEMPO", false);
      loader.autoloaded = false;
      loader.nodataiserror = false;
      loader.load(function () {
        var dados = [];
        var config = { duration: 10000 };
        var item = loader.data("D_CLIMA_CLIMATEMPO");
        var cidade = "";
        // Busca em todos os arrays disponiveis (C1, C2, C3 com D1, D2, D3)
        var todosArrays = [
          "C1_D1_DATAARRAY", "C1_D2_DATAARRAY", "C1_D3_DATAARRAY",
          "C2_D1_DATAARRAY", "C2_D2_DATAARRAY", "C2_D3_DATAARRAY",
          "C3_D1_DATAARRAY", "C3_D2_DATAARRAY", "C3_D3_DATAARRAY"
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
        
        console.log('[CLIMA] Total de registros futuros coletados: ' + todosFuturos.length);
        
        // Log detalhado: todos os timestamps agrupados por dia - USA LOCAL TIME (São Paulo)
        var diasDebug = {};
        for (var i = 0; i < todosFuturos.length; i++) {
          var reg = todosFuturos[i];
          var dt = new Date(reg.dt_date_wea * 1000);
          var diaKey = dt.getFullYear() + "-" + ("0" + (dt.getMonth() + 1)).slice(-2) + "-" + ("0" + dt.getDate()).slice(-2);
          if (!diasDebug[diaKey]) diasDebug[diaKey] = [];
          diasDebug[diaKey].push(dt.getHours() + 'h');
        }
        console.log('[CLIMA] Detalhamento por dia:');
        for (var dk in diasDebug) {
          if (diasDebug.hasOwnProperty(dk)) {
            console.log('  ' + dk + ': ' + diasDebug[dk].length + ' registros - horários: ' + diasDebug[dk].join(', '));
          }
        }
        
        // Log de todos os timestamps (primeiros e ultimos de cada array)
        console.log('[CLIMA] Timestamps por array:');
        for (var a = 0; a < todosArrays.length; a++) {
          var arrNome = todosArrays[a];
          var registrosArray = [];
          for (var i = 0; i < todosFuturos.length; i++) {
            if (todosFuturos[i]._sourceArray === arrNome) {
              registrosArray.push(todosFuturos[i]);
            }
          }
          if (registrosArray.length > 0) {
            var primeiro = registrosArray[0];
            var ultimo = registrosArray[registrosArray.length - 1];
            var dtPrimeiro = new Date(primeiro.dt_date_wea * 1000);
            var dtUltimo = new Date(ultimo.dt_date_wea * 1000);
            console.log('  ' + arrNome + ': ' + registrosArray.length + ' registros | ' +
              dtPrimeiro.toLocaleString('pt-BR') + ' até ' +
              dtUltimo.toLocaleString('pt-BR'));
          }
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
        
        console.log('[CLIMA] Dias esperados: ' + diasEsperados.join(', '));
        console.log('[CLIMA] Dias disponiveis no XML: ' + Object.keys(diasMap).sort().join(', '));
        
        // Busca registro para cada dia esperado
        for (var d = 0; d < diasEsperados.length; d++) {
          var diaKey = diasEsperados[d];
          var registrosDia = diasMap[diaKey];
          
          if (!registrosDia || registrosDia.length === 0) {
            console.warn('[CLIMA] ALERTA: Sem dados para o dia ' + diaKey + ' (Card ' + (d + 1) + ')');
            continue;
          }
          
          var melhorReg = buscarMelhorHorario(registrosDia, horaAlvo, minAlvo);
          if (melhorReg) {
            var dataObj = new Date(melhorReg.dt_date_wea * 1000);
            var diaSemana = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"][dataObj.getDay()];
            var dia = dataObj.getDate();
            if (dia < 10) dia = "0" + dia;
            var mes = dataObj.getMonth() + 1;
            if (mes < 10) mes = "0" + mes;
            var dataStr = dia + "/" + mes;
            // Log do registro selecionado
            console.log('[CLIMA] Card ' + (d + 1) + ' | array=' + (melhorReg._sourceArray || 'N/A') + ' | data=' + dataStr + ' ' + ("0" + dataObj.getHours()).slice(-2) + ":" + ("0" + dataObj.getMinutes()).slice(-2) + ' | ts=' + melhorReg.dt_date_wea + ' | icon=' + melhorReg.nr_icon_wea + ' | max=' + melhorReg.nr_max_wea + ' min=' + melhorReg.nr_min_wea + ' | prob_chuva=' + melhorReg.nr_probrain_wea + ' | vento=' + melhorReg.ds_winddirection_wea + ' ' + melhorReg.nr_windavgvelocity_wea + 'km/h | uv=' + melhorReg.nr_uv_wea);
            dados.push({
              CIDADE: cidade,
              DIA: diaSemana,
              DATA: dataStr,
              HORA: ("0" + dataObj.getHours()).slice(-2) + ":" + ("0" + dataObj.getMinutes()).slice(-2),
              MAX: melhorReg.nr_max_wea,
              MIN: melhorReg.nr_min_wea,
              ICON: melhorReg.nr_icon_wea,
              QTDE_CHUVA: melhorReg.nr_precipitation_wea,
              PROB_CHUVA: melhorReg.nr_probrain_wea,
              VENTO_DIR: melhorReg.ds_winddirection_wea,
              VENTO_VEL: melhorReg.nr_windavgvelocity_wea,
              UV: melhorReg.nr_uv_wea,
              UVLEVEL: melhorReg.ds_uvlevel_wea
            });
          }
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

function iniciarTemplate(dados, config, loader) {
  // Header: cidade
  var cidadeEl = document.getElementById("cidade");
  if (cidadeEl && dados[0] && dados[0].CIDADE) {
    cidadeEl.innerText = dados[0].CIDADE;
  }

  // Aplica cor principal dos ícones via variável CSS
  var corClima = "#fff"; // padrão
  if (typeof CONFIG_CLIMA !== "undefined" && CONFIG_CLIMA.corClimaPrincipal) {
    corClima = CONFIG_CLIMA.corClimaPrincipal;
  }
  document.body.style.setProperty("--clima-principal", corClima);

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

  console.log('[CLIMA] Cards renderizados: ' + cardsElements.length);

  // Fade in do body
  document.body.classList.remove("opacity-0");
  document.body.classList.add("opacity-100");

  // Força reflow antes de animar (para garantir que animação funcione)
  void cardsContainer.offsetHeight;
  
  // Aguarda próximo frame para aplicar animação
  setTimeout(function() {
    animarCards(cardsElements, dados.length);
  }, 50);

  if (loader) loader.loaded();
  setTimeout(function () {
    // document.body.classList.remove('opacity-100');
    // document.body.classList.add('opacity-0');
    setTimeout(function () {
      if (loader) loader.finished();
    }, 1000);
  }, config.duration || 10000);
}

// Função para animar os cards com translate-X + opacity
function animarCards(cards, qtd) {
  var delays = [0, 400, 800];
  for (var i = 0; i < cards.length && i < qtd; i++) {
    cards[i].style.transitionDelay = delays[i] + "ms";
    cards[i].classList.remove("-translate-x-[120%]", "opacity-0");
    cards[i].classList.add("translate-x-0", "opacity-100");
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
    dateHourDiv.innerText = d.DATA + " " + (d.HORA || "--");
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

  // Setas SVG inline (arrow-up e arrow-down)
  var arrowUpEl = card.querySelector(".arrow-up-svg");
  if (arrowUpEl) {
    var xhrUp = new XMLHttpRequest();
    xhrUp.open('GET', 'img/arrow-up.svg', true);
    xhrUp.onreadystatechange = function() {
      if (xhrUp.readyState !== 4) return;
      if (xhrUp.status === 200 || xhrUp.status === 0) {
        arrowUpEl.innerHTML = xhrUp.responseText;
        var svg = arrowUpEl.querySelector('svg');
        if (svg) {
          svg.style.width = '100%';
          svg.style.height = '100%';
          svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          svg.style.color = '#fb923c';
        }
      }
    };
    xhrUp.send();
  }
  var arrowDownEl = card.querySelector(".arrow-down-svg");
  if (arrowDownEl) {
    var xhrDown = new XMLHttpRequest();
    xhrDown.open('GET', 'img/arrow-down.svg', true);
    xhrDown.onreadystatechange = function() {
      if (xhrDown.readyState !== 4) return;
      if (xhrDown.status === 200 || xhrDown.status === 0) {
        arrowDownEl.innerHTML = xhrDown.responseText;
        var svg = arrowDownEl.querySelector('svg');
        if (svg) {
          svg.style.width = '100%';
          svg.style.height = '100%';
          svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          svg.style.color = '#60a5fa';
        }
      }
    };
    xhrDown.send();
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
    injetarMeteocon(ventoIcon, nomeIconeVento);
  }
  var dirVentoSvg = card.querySelector(".dir-vento-svg");
  if (dirVentoSvg && d.VENTO_DIR) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'img/compass.svg', true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4) return;
      if (xhr.status === 200 || xhr.status === 0) {
        dirVentoSvg.innerHTML = xhr.responseText;
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
      }
    };
    xhr.send();
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
