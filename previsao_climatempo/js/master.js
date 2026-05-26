// Mapeamento Climatempo para Meteocons — agora em meteocons-helpers.js (METEOCONS_MAP)
window.onload = function () {
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
        var dias = ["C1_D1_DATAARRAY", "C1_D2_DATAARRAY", "C1_D3_DATAARRAY"];
        var agora = Math.floor(new Date().getTime() / 1000);
        var agoraDate = new Date();
        var horaAlvo = agoraDate.getHours();
        var minAlvo = agoraDate.getMinutes();
        for (var d = 0; d < dias.length; d++) {
          var arr = [];
          if (item && typeof item.value === "function") {
            var arrStr = "";
            try {
              arrStr = item.value(dias[d]).value;
              if (arrStr) {
                arr = JSON.parse(arrStr);
              }
            } catch (e) { arr = []; }
          }
          // Cidade (pega do primeiro registro válido)
          if (cidade === "" && arr.length > 0 && arr[0].city && arr[0].city.ds_name_cit) {
            cidade = arr[0].city.ds_name_cit;
          }
          // Busca o registro mais próximo do horário alvo (hora/minuto do momento)
          var idxEscolhido = -1;
          var menorDiff = 999999999;
          var alvoSeg = horaAlvo * 3600 + minAlvo * 60;
          for (var i = 0; i < arr.length; i++) {
            var dataObj = new Date(arr[i].dt_date_wea * 1000);
            var seg = dataObj.getHours() * 3600 + dataObj.getMinutes() * 60;
            var diff = Math.abs(seg - alvoSeg);
            if (diff < menorDiff) {
              menorDiff = diff;
              idxEscolhido = i;
            }
          }
          if (idxEscolhido >= 0) {
            var reg = arr[idxEscolhido];
            var dataObj = new Date(reg.dt_date_wea * 1000);
            var diaSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"][dataObj.getDay()];
            var dia = dataObj.getDate();
            if (dia < 10) dia = "0" + dia;
            var mes = dataObj.getMonth() + 1;
            if (mes < 10) mes = "0" + mes;
            var dataStr = dia + "/" + mes;
            dados.push({
              CIDADE: cidade,
              DIA: diaSemana,
              DATA: dataStr,
              HORA: ("0" + dataObj.getHours()).slice(-2) + ":" + ("0" + dataObj.getMinutes()).slice(-2),
              MAX: reg.nr_max_wea,
              MIN: reg.nr_min_wea,
              ICON: reg.nr_icon_wea,
              QTDE_CHUVA: reg.nr_precipitation_wea,
              PROB_CHUVA: reg.nr_probrain_wea,
              VENTO_DIR: reg.ds_winddirection_wea,
              VENTO_VEL: reg.nr_windavgvelocity_wea,
              UV: reg.nr_uv_wea,
              UVLEVEL: reg.ds_uvlevel_wea
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

  // Preencher cards estáticos
  var cards = document.querySelectorAll(".card");
  for (var i = 0; i < cards.length && i < dados.length; i++) {
    preencherCardClima(cards[i], dados[i], corClima);
  }

  // Fade in do body
  document.body.classList.remove("opacity-0");
  document.body.classList.add("opacity-100");

  // Só anima depois de preencher os dados
  animarCards(cards, dados.length);

  if (loader) loader.loaded();
  setTimeout(function () {
    // document.body.classList.remove('opacity-100');
    // document.body.classList.add('opacity-0');
    setTimeout(function () {
      if (loader) loader.finished();
    }, 1000);
  }, config.duration || 10000);
}

// Função para animar os cards (remover classes iniciais)
function animarCards(cards, qtd) {
  for (var i = 0; i < cards.length && i < qtd; i++) {
    cards[i].classList.remove("-translate-x-[500%]", "opacity-0");
     cards[i].classList.add("translate-x-0", "opacity-100");
  }
}

// Preenche um card estático com dados e injeta SVG inline
function preencherCardClima(card, d, corClima) {
  // Data
  var dataDiv = card.querySelector(".data");
  if (dataDiv) {
    var horaStr = d.HORA ? (" - " + d.HORA) : "";
    dataDiv.innerText = (d.DIA || "") + " - " + (d.DATA || "");
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
  // Chuva
  var quantChuva = card.querySelector(".quant_chuva");
  if (quantChuva) {
    quantChuva.innerText = "Chuva: " + (d.QTDE_CHUVA || "--") + " mm";
  }
  var probChuva = card.querySelector(".prob_chuva");
  if (probChuva) {
    probChuva.innerText = "Prob: " + (d.PROB_CHUVA || "--") + "%";
  }
  var chuvaIcon = card.querySelector(".chuva-icon");
  if (chuvaIcon) {
    injetarMeteocon(chuvaIcon, 'raindrops');
  }

  // Vento
  var quantVento = card.querySelector(".quant_vento");
  if (quantVento) {
    quantVento.innerText = "Vento: " + (d.VENTO_VEL || "--") + " km/h";
  }
  var dirVento = card.querySelector(".dir_vento");
  if (dirVento) {
    dirVento.innerText = d.VENTO_DIR || "--";
  }
  var ventoIcon = card.querySelector(".vento-icon");
  if (ventoIcon) {
    injetarMeteocon(ventoIcon, 'wind');
  }
  var dirVentoSvg = card.querySelector(".dir-vento-svg");
  if (dirVentoSvg && d.VENTO_DIR) {
    var nomeDir = ventoToMeteocon(d.VENTO_DIR);
    injetarMeteocon(dirVentoSvg, nomeDir);
  }

  // UV
  var indiceUV = card.querySelector(".indice_uv");
  if (indiceUV) {
    indiceUV.innerText = "UV: " + (d.UV || "--");
  }
  var riscoUV = card.querySelector(".risco_uv");
  if (riscoUV) {
    riscoUV.innerText = "Risco: " + (d.UVLEVEL || "--");
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
