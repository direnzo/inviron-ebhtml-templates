/**
 * master.js — climatempo_momento
 * ES5, compativel com Android 7+ (WebKit legado)
 *
 * Canal de dados: D_CLIMATEMPO_MOMENTO
 *
 * Campos esperados do XML:
 *   C1_CIDADE, C1_TEXTPT, C1_MAX (temp atual),
 *   C1_HUMIDITYMIN, C1_WINDAVGVELOCITY,
 *   C1_WINDDIRECTION, C1_TEXTMIN
 */

/* CONFIG_CLIMA — configuracao global do template
 * Definido no index.html (deve vir antes de todos os scripts)
 *   iconStyle: 'fill' | 'flat' | 'line' | 'monochrome'
 *   iconColor: qualquer cor hex (ex: '#ffffff', '#ffcc00')
 *   duration:  tempo em ms que o template fica em tela (padrao: 10000)
 */

var SPD_MEDIA_ROTATION_KEY = "climatempo_momento_spd_media_idx";
var SPONSOR_TEST_STATE_KEY = "climatempo_momento_sponsor_test_last";

// Rede de seguranca: so dispara se o canal D_CLIMA_CLIMATEMPO_MOMENTO
// realmente travar (XHR pendurado). NAO deve competir com a latencia
// normal da rede — um timeout curto estoura a cada jitter e faz o
// template exibir "sem dados" mesmo com o canal online. 12s da folga
// para round-trip + parsing.
var CANAL_TIMEOUT_MS = 12000;

window.onload = function () {
  var sponsorEnabled = resolveSponsorEnabled(CONFIG_CLIMA);
  var mockEnabled = typeof MOCK_DATA !== "undefined" && MOCK_DATA.enabled;

  ebhtml.create2({}, function (loader) {
    if (mockEnabled) {
      var mockItem = MOCK_DATA.dados[0] || {};
      var mockTextptData = extrairIconeESensacaoDeTextpt(mockItem.C1_TEXTPT || "");
      var dadosMock = {
        CIDADE: mockItem.CIDADE || "",
        CIDADE_SYS: mockItem.CIDADE_SYS || "",
        ICON: mockTextptData.icon || mockItem.ICON || "",
        TEMP_ATUAL: mockItem.TEMP_ATUAL || "",
        TEMP_MAX: mockItem.TEMP_MAX || "",
        TEMP_MIN: mockItem.TEMP_MIN || "",
        UMIDADE: mockItem.UMIDADE || "",
        VENTO_VEL: mockItem.VENTO_VEL || "",
        VENTO_DIR: mockItem.VENTO_DIR || "",
        VENTO_MAX: mockItem.VENTO_MAX || "",
        VENTO_MIN: mockItem.VENTO_MIN || "",
        DESCRICAO: mockItem.DESCRICAO || "",
        SENSACAO: mockTextptData.sensation || mockItem.SENSACAO || mockItem.C1_PRECIPITATION || mockItem.PRECIPITATION || "",
      };

      var mockSponsor = sponsorEnabled ? parseMockSponsor(MOCK_DATA) : null;
      applySpdColors(mockSponsor, CONFIG_CLIMA);
      applySponsorFooter(mockSponsor);

      if (sponsorEnabled && CONFIG_CLIMA.sponsorPrerollEnabled) {
        showSpdPreroll(mockSponsor, function () {
          iniciarTemplate(dadosMock, CONFIG_CLIMA, loader);
        });
      } else {
        iniciarTemplate(dadosMock, CONFIG_CLIMA, loader);
      }

      return;
    }

    var playlistEncerrada = false;
    var loadTimeoutId = null;

    function limparTimeoutCanal() {
      if (loadTimeoutId) {
        clearTimeout(loadTimeoutId);
        loadTimeoutId = null;
      }
    }

    // Encerra o item SEM chamar loader.loaded(): quando o canal esta sem
    // dados para consulta, o item deve ser PULADO na playlist, e nao
    // renderizado vazio como se tivesse carregado (loaded()).
    function encerrarSemDados(motivo) {
      if (playlistEncerrada) return;
      playlistEncerrada = true;
      limparTimeoutCanal();
      console.warn("[CLIMA MOMENTO][DATA] Encerrando item sem renderizar: " + motivo);
      loader.finished(0);
    }

    loader.addData("D_CLIMA_CLIMATEMPO_MOMENTO", false, "", "");
    if (sponsorEnabled) {
      loader.addData("D_SPD", false, "f_CONFIG=1", "");
    }
    loader.autoloaded = false;
    loader.nodataiserror = false;

    loadTimeoutId = setTimeout(function () {
      encerrarSemDados("Timeout ao aguardar resposta do canal D_CLIMA_CLIMATEMPO_MOMENTO");
    }, CANAL_TIMEOUT_MS);

    loader.load(function () {
      limparTimeoutCanal();
      if (playlistEncerrada) return;

      var spd = sponsorEnabled ? parseSpdPayload(loader) : null;
      applySpdColors(spd, CONFIG_CLIMA);
      applySponsorFooter(spd);

      var item = loader.data("D_CLIMA_CLIMATEMPO_MOMENTO");

      // Sem item / item invalido = XML ausente ou canal sem resposta util.
      if (!item || typeof item.value !== "function") {
        encerrarSemDados("Canal D_CLIMA_CLIMATEMPO_MOMENTO sem item valido");
        return;
      }

      var cidade = getItemFieldValue(item, "C1_CIDADE");
      var tempAtual = getItemFieldValue(item, "C1_MAX");

      // Canal respondeu mas sem leitura real (sem cidade E sem temperatura):
      // pula o item em vez de exibir o template vazio com "--".
      if (!cidade && !tempAtual) {
        encerrarSemDados("Canal sem dados de leitura (C1_CIDADE e C1_MAX vazios)");
        return;
      }

      var textptRaw = getItemFieldValue(item, "C1_TEXTPT");
      var textptData = extrairIconeESensacaoDeTextpt(textptRaw);
      var sensacaoLegacy = getItemFieldValue(item, "C1_PRECIPITATION");

      var dados = {
        CIDADE: cidade,
        CIDADE_SYS: getItemFieldValue(item, "C1_CIDADE_SYS"),
        ICON: textptData.icon || "",
        TEMP_ATUAL: tempAtual,
        TEMP_MAX: tempAtual,
        TEMP_MIN: getItemFieldValue(item, "C1_MIN"),
        UMIDADE: getItemFieldValue(item, "C1_HUMIDITYMIN"),
        VENTO_VEL: getItemFieldValue(item, "C1_WINDAVGVELOCITY"),
        VENTO_DIR: getItemFieldValue(item, "C1_WINDDIRECTION"),
        VENTO_MAX: getItemFieldValue(item, "C1_WINDMAXVELOCITY"),
        VENTO_MIN: getItemFieldValue(item, "C1_WINDMINVELOCITY"),
        DESCRICAO: getItemFieldValue(item, "C1_TEXTMIN"),
        SENSACAO: textptData.sensation || sensacaoLegacy,
      };
      console.log("[CLIMA MOMENTO] Dados recebidos:", dados);

      // Dados validos: o ciclo de vida da playlist passa a ser
      // responsabilidade de iniciarTemplate (loaded() + finished()).
      playlistEncerrada = true;

      var config = CONFIG_CLIMA;

      if (sponsorEnabled && CONFIG_CLIMA.sponsorPrerollEnabled) {
        showSpdPreroll(spd, function () {
          iniciarTemplate(dados, config, loader);
        });
      } else {
        iniciarTemplate(dados, config, loader);
      }
    }, function () {
      limparTimeoutCanal();
      encerrarSemDados("Falha no loader.load() para D_CLIMA_CLIMATEMPO_MOMENTO");
    });
  });
};

function resolveSponsorEnabled(config) {
  var sponsorEnabled = !!(config && config.sponsorEnabled);
  if (!(config && config.sponsorRandomTest)) {
    return sponsorEnabled;
  }

  var sponsorNextState = Math.random() >= 0.5 ? "1" : "0";
  var sponsorLastState = "";

  try {
    sponsorLastState = localStorage.getItem(SPONSOR_TEST_STATE_KEY) || "";
  } catch (e0) {
    sponsorLastState = "";
  }

  if (sponsorLastState === sponsorNextState) {
    sponsorNextState = sponsorNextState === "1" ? "0" : "1";
  }

  try {
    localStorage.setItem(SPONSOR_TEST_STATE_KEY, sponsorNextState);
  } catch (e1) {}

  sponsorEnabled = sponsorNextState === "1";
  console.log("[Sponsor][Teste] sponsorRandomTest ativo -> sponsorEnabled=" + (sponsorEnabled ? "true" : "false"));
  return sponsorEnabled;
}

function extrairIconeESensacaoDeTextpt(rawTextpt) {
  var texto = rawTextpt === undefined || rawTextpt === null ? "" : String(rawTextpt);
  texto = texto.replace(/^\s+|\s+$/g, "");

  var resultado = {
    icon: "",
    sensation: "",
  };

  if (!texto) return resultado;

  // Novo formato: JSON em C1_TEXTPT, ex: {"sensation":14,"icon":"3"}
  if (texto.charAt(0) === "{") {
    try {
      var payload = JSON.parse(texto);
      if (payload && typeof payload === "object") {
        if (payload.icon !== undefined && payload.icon !== null) {
          resultado.icon = String(payload.icon);
        }
        if (payload.sensation !== undefined && payload.sensation !== null) {
          resultado.sensation = String(payload.sensation);
        }
      }
      return resultado;
    } catch (e) {
      console.warn("[CLIMA MOMENTO] C1_TEXTPT em JSON invalido:", texto);
    }
  }

  // Fallback legado: C1_TEXTPT era apenas o codigo do icone.
  resultado.icon = texto;
  return resultado;
}

function normalizeHexColor(value) {
  var raw = (value || "").toString().replace(/\s+/g, "");
  if (!raw) { return ""; }
  if (raw.charAt(0) !== "#") { raw = "#" + raw; }
  if (!/^#[0-9a-fA-F]{6}$/.test(raw)) { return ""; }
  return raw;
}

function getItemFieldValue(item, fieldName) {
  if (!item || !fieldName || typeof item.value !== "function") { return ""; }

  try {
    var node = item.value(fieldName);
    if (node && typeof node.value !== "undefined" && node.value !== null) {
      return (node.value + "").replace(/^\s+|\s+$/g, "");
    }
  } catch (e1) {}

  try {
    var nodeLower = item.value(fieldName.toLowerCase());
    if (nodeLower && typeof nodeLower.value !== "undefined" && nodeLower.value !== null) {
      return (nodeLower.value + "").replace(/^\s+|\s+$/g, "");
    }
  } catch (e2) {}

  return "";
}

function getListCount(list) {
  if (!list) { return 0; }
  if (typeof list.count === "function") { return list.count(); }
  if (typeof list.length === "number") { return list.length; }
  return 0;
}

function getListItem(list, index) {
  if (!list) { return null; }
  if (typeof list.get === "function") { return list.get(index); }
  if (typeof list[index] !== "undefined") { return list[index]; }
  return null;
}

function normalizeMediaUrl(url) {
  var src = (url || "").toString().replace(/^\s+|\s+$/g, "");
  if (!src) { return ""; }

  if (src.indexOf("file:///") === 0 || src.indexOf("file://") === 0) {
    var normalizedPath = src.replace(/\\/g, "/");
    var parts = normalizedPath.split("/");
    var fileName = parts[parts.length - 1] || "";
    var matchFileId = fileName.match(/^f_(\d+)\./i);

    if (matchFileId && matchFileId[1]) {
      return "http://127.0.0.1:13199/FILES/" + matchFileId[1];
    }

    if (fileName) {
      return "http://127.0.0.1:13199/FILES/" + fileName;
    }

    return "";
  }

  return src;
}

function isVideoFile(url) {
  return /\.(mp4|webm|mov|m4v|avi|ogv)(\?|#|$)/i.test((url || "").toString());
}

function isImageFile(url) {
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/i.test((url || "").toString());
}

function parseMockSponsor(mockData) {
  if (!mockData || !mockData.sponsor || typeof mockData.sponsor !== "object") { return null; }

  var s = mockData.sponsor;
  var list = [];
  var i = 0;

  if (s.mediaCandidates && s.mediaCandidates.length) {
    for (i = 0; i < s.mediaCandidates.length; i++) {
      var candidate = normalizeMediaUrl(s.mediaCandidates[i]);
      if (candidate) { list.push(candidate); }
    }
  }

  return {
    text1: s.text1 || "",
    imageLogo: normalizeMediaUrl(s.imageLogo || ""),
    mediaUrl: normalizeMediaUrl(s.mediaUrl || ""),
    mediaCandidates: list,
    color1: normalizeHexColor(s.color1 || ""),
    color2: normalizeHexColor(s.color2 || ""),
    color3: normalizeHexColor(s.color3 || ""),
    color4: normalizeHexColor(s.color4 || ""),
    color5: normalizeHexColor(s.color5 || ""),
    timeoutMs: s.timeoutMs && s.timeoutMs > 0 ? parseInt(s.timeoutMs, 10) : 5000
  };
}

function findSpdSponsor(loader) {
  if (!loader) { return null; }

  var list = null;
  if (typeof loader.datalist === "function") {
    list = loader.datalist("D_SPD");
  }

  var count = getListCount(list);
  var i = 0;
  var item = null;
  var cfg = "";

  for (i = 0; i < count; i++) {
    item = getListItem(list, i);
    if (!item) { continue; }

    cfg = getItemFieldValue(item, "CONFIG");
    if (!cfg) { cfg = getItemFieldValue(item, "config"); }
    if (cfg === "1") { return item; }
  }

  if (typeof loader.data === "function") {
    item = loader.data("D_SPD");
    if (item) {
      cfg = getItemFieldValue(item, "CONFIG");
      if (!cfg) { cfg = getItemFieldValue(item, "config"); }
      if (!cfg || cfg === "1") { return item; }
    }
  }

  return null;
}

function parseSpdPayload(loader) {
  var sponsor = findSpdSponsor(loader);
  if (!sponsor) { return null; }

  var timeoutText = getItemFieldValue(sponsor, "TEXT2");
  var timeoutSec = parseInt(timeoutText, 10);
  var mediaUrl = "";
  var mediaCandidates = [];
  var mediaFields = ["FILE_IMAGE1", "FILE_IMAGE2", "FILE_IMAGE3", "FILE_IMAGE4", "FILE_IMAGE5"];
  var i = 0;

  for (i = 0; i < mediaFields.length; i++) {
    var rawMedia = getItemFieldValue(sponsor, mediaFields[i]);
    if (!rawMedia) { continue; }

    var normalizedMedia = normalizeMediaUrl(rawMedia);
    if (!normalizedMedia) { continue; }

    mediaCandidates.push(normalizedMedia);
    if (!mediaUrl) { mediaUrl = normalizedMedia; }
  }

  return {
    text1: getItemFieldValue(sponsor, "TEXT1"),
    imageLogo: normalizeMediaUrl(getItemFieldValue(sponsor, "IMAGE_LOGO")),
    mediaUrl: mediaUrl,
    mediaCandidates: mediaCandidates,
    color1: normalizeHexColor(getItemFieldValue(sponsor, "COLOR1")),
    color2: normalizeHexColor(getItemFieldValue(sponsor, "COLOR2")),
    color3: normalizeHexColor(getItemFieldValue(sponsor, "COLOR3")),
    color4: normalizeHexColor(getItemFieldValue(sponsor, "COLOR4")),
    color5: normalizeHexColor(getItemFieldValue(sponsor, "COLOR5")),
    timeoutMs: (!isNaN(timeoutSec) && timeoutSec > 0) ? timeoutSec * 1000 : 5000
  };
}

function applySpdColors(spd, config) {
  if (!spd || !config) { return; }
  if (spd.color1) { config.textColor = spd.color1; }
  if (spd.color3) { config.iconColor = spd.color3; }
}

function getSpdMediaList(spd) {
  var list = [];
  var seen = {};
  var i = 0;

  if (spd && spd.mediaCandidates && spd.mediaCandidates.length) {
    for (i = 0; i < spd.mediaCandidates.length; i++) {
      var candidate = normalizeMediaUrl(spd.mediaCandidates[i]);
      if (!candidate || seen[candidate]) { continue; }
      seen[candidate] = true;
      list.push(candidate);
    }
  }

  if (!list.length && spd && spd.mediaUrl) {
    var fallback = normalizeMediaUrl(spd.mediaUrl);
    if (fallback && !seen[fallback]) {
      list.push(fallback);
    }
  }

  return list;
}

function pickSpdMediaByRotation(spd) {
  var list = getSpdMediaList(spd);
  var count = list.length;
  var index = 0;

  if (!count) {
    return { list: [], startIndex: 0, firstUrl: "" };
  }

  try {
    index = parseInt(localStorage.getItem(SPD_MEDIA_ROTATION_KEY), 10);
  } catch (e) {
    index = 0;
  }

  if (isNaN(index) || index < 0) { index = 0; }
  index = index % count;

  try {
    localStorage.setItem(SPD_MEDIA_ROTATION_KEY, (index + 1) % count);
  } catch (e2) {}

  return {
    list: list,
    startIndex: index,
    firstUrl: list[index]
  };
}

function showSpdPreroll(spd, onDone) {
  if (!spd || (!spd.mediaUrl && !(spd.mediaCandidates && spd.mediaCandidates.length))) {
    if (typeof onDone === "function") { onDone(); }
    return;
  }

  var wrapper = document.getElementById("spdPreroll");
  var imageEl = document.getElementById("spdPrerollImage");
  var videoEl = document.getElementById("spdPrerollVideo");
  if (!wrapper || !imageEl || !videoEl) {
    if (typeof onDone === "function") { onDone(); }
    return;
  }

  var timeoutMs = spd.timeoutMs || 5000;
  var done = false;
  var timeoutHandle = null;
  var watchdogHandle = null;
  var selection = pickSpdMediaByRotation(spd);
  var mediaList = selection.list || [];
  var currentIndex = typeof selection.startIndex === "number" ? selection.startIndex : 0;
  var attempts = 0;

  function finish() {
    if (done) { return; }
    done = true;

    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
      timeoutHandle = null;
    }

    if (watchdogHandle) {
      clearInterval(watchdogHandle);
      watchdogHandle = null;
    }

    wrapper.className = "hidden fixed inset-0 z-[9999] bg-black items-center justify-center";

    imageEl.onload = null;
    imageEl.onerror = null;
    imageEl.className = "hidden w-full h-full object-contain bg-black";
    imageEl.src = "";

    videoEl.onended = null;
    videoEl.onerror = null;
    videoEl.onabort = null;
    videoEl.onstalled = null;
    videoEl.pause();
    videoEl.className = "hidden w-full h-full object-contain bg-black";
    videoEl.removeAttribute("src");

    if (typeof onDone === "function") { onDone(); }
  }

  timeoutHandle = setTimeout(finish, timeoutMs);
  // Garante que o body seja visível (sai do opacity-0 inicial) para o overlay aparecer
  document.body.style.opacity = '1';
  wrapper.className = "fixed inset-0 z-[9999] bg-black flex items-center justify-center";

  function showImage(src) {
    videoEl.className = "hidden w-full h-full object-contain bg-black";
    videoEl.pause();
    videoEl.removeAttribute("src");
    imageEl.className = "w-full h-full object-contain bg-black";
    imageEl.src = src;
    imageEl.onerror = tryNextMedia;
    imageEl.onload = function () {};
  }

  function showVideo(src) {
    videoEl.className = "w-full h-full object-contain bg-black";
    videoEl.crossOrigin = "anonymous";
    videoEl.muted = true;
    videoEl.loop = false;
    videoEl.autoplay = true;
    videoEl.setAttribute("playsinline", "playsinline");
    videoEl.setAttribute("webkit-playsinline", "webkit-playsinline");
    videoEl.setAttribute("preload", "auto");
    videoEl.src = src;
    videoEl.onended = finish;
    videoEl.onerror = function () {
      showImage(src);
    };
    videoEl.onabort = tryNextMedia;
    videoEl.onstalled = function () {
      showImage(src);
    };

    function tryPlay() {
      try {
        var playResult = videoEl.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(function () {});
        }
      } catch (e) {}
    }

    if (watchdogHandle) {
      clearInterval(watchdogHandle);
      watchdogHandle = null;
    }

    watchdogHandle = setInterval(function () {
      if (done) {
        clearInterval(watchdogHandle);
        watchdogHandle = null;
        return;
      }
      if (videoEl.ended) {
        clearInterval(watchdogHandle);
        watchdogHandle = null;
        finish();
      }
    }, 500);

    try {
      videoEl.load();
      tryPlay();
      setTimeout(tryPlay, 200);
      setTimeout(tryPlay, 800);
    } catch (e2) {}
  }

  function playCurrentMedia() {
    if (!mediaList.length) {
      finish();
      return;
    }

    var src = mediaList[currentIndex];
    if (!src) {
      tryNextMedia();
      return;
    }

    attempts = attempts + 1;
    if (isImageFile(src)) {
      showImage(src);
    } else if (isVideoFile(src)) {
      showVideo(src);
    } else {
      showImage(src);
    }
  }

  function tryNextMedia() {
    if (done) { return; }
    if (!mediaList.length) {
      finish();
      return;
    }
    if (attempts >= mediaList.length) {
      finish();
      return;
    }

    currentIndex = (currentIndex + 1) % mediaList.length;
    playCurrentMedia();
  }

  playCurrentMedia();
}

function applySponsorFooter(spd) {
  var sponsorBox = document.getElementById("sponsorBox");
  var sponsorLogo = document.getElementById("sponsorLogo");
  var sponsorText = document.getElementById("sponsorText");
  var climatempoLogo = document.getElementById("climatempoLogo");

  if (!sponsorBox || !sponsorLogo || !sponsorText || !climatempoLogo) { return; }

  // #climatempoLogo agora e um texto ("Fonte: CPTEC / INPE"), nao mais <img>.
  var FONTE_TEXT_CLASS = "text-[80%] tracking-wide whitespace-nowrap drop-shadow-text";

  var hasLogo = !!(spd && spd.imageLogo);
  var hasText = !!(spd && spd.text1);

  if (!hasLogo && !hasText) {
    sponsorBox.className = "hidden flex items-center justify-end space-x-[1.2vmin] max-w-[70vw]";
    sponsorLogo.className = "h-[4vmin] max-w-[24vw] object-contain hidden";
    sponsorLogo.src = "";
    sponsorText.className = "text-[60%] whitespace-nowrap overflow-hidden text-ellipsis max-w-[36vw] hidden";
    sponsorText.innerText = "";
    climatempoLogo.className = FONTE_TEXT_CLASS;
    return;
  }

  sponsorBox.className = "flex items-center justify-end space-x-[1.2vmin] max-w-[70vw]";
  climatempoLogo.className = FONTE_TEXT_CLASS;

  if (hasLogo) {
    sponsorLogo.src = spd.imageLogo;
    sponsorLogo.className = "h-[4vmin] max-w-[24vw] object-contain";
  } else {
    sponsorLogo.src = "";
    sponsorLogo.className = "h-[4vmin] max-w-[24vw] object-contain hidden";
  }

  if (hasText) {
    sponsorText.innerText = spd.text1;
    sponsorText.className = "text-[60%] whitespace-nowrap overflow-hidden text-ellipsis max-w-[36vw]";
  } else {
    sponsorText.innerText = "";
    sponsorText.className = "text-[60%] whitespace-nowrap overflow-hidden text-ellipsis max-w-[36vw] hidden";
  }
}


function iniciarTemplate(dados, config, loader) {
  // Centraliza cor dos icones via CONFIG_CLIMA (fallback: branco)
  var corIcone =
    typeof CONFIG_CLIMA !== "undefined" && CONFIG_CLIMA.iconColor
      ? CONFIG_CLIMA.iconColor
      : "#ffffff";

  // Define o video de fundo com base no ICON recebido.
  if (window.WeatherVideo && typeof window.WeatherVideo.setIcon === "function") {
    window.WeatherVideo.setIcon(dados.ICON);
  } else {
    console.error("[CLIMA MOMENTO] WeatherVideo nao disponivel.");
  }

  // Aplica cor do texto via CONFIG_CLIMA (fallback: branco)
  var corTexto =
    typeof CONFIG_CLIMA !== "undefined" && CONFIG_CLIMA.textColor
      ? CONFIG_CLIMA.textColor
      : "#ffffff";
  document.body.style.color = corTexto;

  // Cidade
  var cidadeEl = document.getElementById("cidade");
  if (cidadeEl && dados.CIDADE) {
    cidadeEl.innerText = dados.CIDADE;
  }

  // Temperatura principal (C1_MAX = temperatura atual)
  var tempMain = document.getElementById("temp-main");
  if (tempMain) {
    var temp = dados.TEMP_ATUAL || "--";
    tempMain.innerText = temp + "°C";
  }

  // Descricao do tempo
  var descEl = document.getElementById("descricao");
  console.log("Descricao do tempo: " + dados.DESCRICAO);
  if (descEl) {
    descEl.innerText = dados.DESCRICAO || "--";
  }

  // Sensacao termica
  var sensacaoEl = document.getElementById("sensacao");
  if (sensacaoEl) {
    var sensacaoValor =
      dados.SENSACAO !== undefined && dados.SENSACAO !== null && dados.SENSACAO !== ""
        ? dados.SENSACAO
        : (dados.PRECIPITATION !== undefined && dados.PRECIPITATION !== null && dados.PRECIPITATION !== ""
            ? dados.PRECIPITATION
            : (dados.sensation !== undefined && dados.sensation !== null && dados.sensation !== ""
                ? dados.sensation
                : ""));

    if (sensacaoValor !== "") {
      sensacaoEl.classList.remove("hidden");
      sensacaoEl.classList.add("block");
      sensacaoEl.innerText = "Sensação térmica de " + sensacaoValor + "°C";
    } else {
      sensacaoEl.classList.remove("block");
      sensacaoEl.classList.add("hidden");
    }
  }

  // Umidade
  var humidityVal = document.getElementById("humidity-value");
  if (humidityVal) {
    humidityVal.innerText = (dados.UMIDADE || "--") + "%";
  }
  var humidityIcon = document.getElementById("humidity-icon");
  if (humidityIcon) {
    injetarMeteocon(humidityIcon, "humidity", corIcone);
  }

  // Vento — velocidade
  var windVal = document.getElementById("wind-value");
  if (windVal) {
    windVal.innerText = (dados.VENTO_VEL || "--") + "km/h";
  }
  var windIcon = document.getElementById("wind-icon");
  if (windIcon) {
    var nomeIconeVento = ventoVelocidadeParaIcone(dados.VENTO_VEL);
    injetarMeteocon(windIcon, nomeIconeVento, corIcone);
  }

  // Vento — direcao (compass SVG com rotacao)
  var windDirIcon = document.getElementById("wind-dir-icon");
  if (windDirIcon && dados.VENTO_DIR) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "img/compass.svg", true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status === 200 || xhr.status === 0) {
        windDirIcon.innerHTML = xhr.responseText;
        var svg = windDirIcon.querySelector("svg");
        if (svg) {
          svg.style.width = "100%";
          svg.style.height = "100%";
          svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
          var ang = direcaoCardinalParaAngulo(dados.VENTO_DIR);
          var path = svg.querySelector("path");
          if (path) {
            path.setAttribute("transform", "rotate(" + ang + " 12 12)");
            path.setAttribute("fill", corIcone);
          }
        }
      }
    };
    xhr.send();
  }
  var windDirText = document.getElementById("wind-dir-text");
  if (windDirText) {
    windDirText.innerText = direcaoCardinalPorExtenso(dados.VENTO_DIR) || "--";
  }

  // Icone principal (Meteocon grande)
  var mainIcon = document.getElementById("main-icon");
  if (mainIcon) {
    var codigo = (dados.ICON || "3").toString();
    var nomeIcone = climaToMeteocon(codigo);
    injetarMeteocon(mainIcon, nomeIcone, corIcone);
  }

  // Fade in
  document.body.classList.remove("opacity-0");
  document.body.classList.add("opacity-100");

  // Playlist control
  if (loader) loader.loaded();

  setTimeout(function () {
    if (loader) loader.finished(0);
  }, config.duration || 10000);

  console.log("[CLIMA MOMENTO] Video de fundo aplicado para ICON:", dados.ICON);
}
