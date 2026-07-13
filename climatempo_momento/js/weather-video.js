(function (global) {
  var VIDEO_MAP = {
    "1": "img/CLEAR_DAY.webm",
    "1n": "img/CLEAR_NIGHT.webm",
    "2": "img/PARTLY_CLOUDY_DAY.webm",
    "2n": "img/PARTLY_CLOUDY_NIGHT.webm",
    "3": "img/PARTLY_CLOUDY_DAY.webm",
    "3n": "img/PARTLY_CLOUDY_NIGHT.webm",
    "2r": "img/LIGHT_RAIN_DAY.webm",
    "2rn": "img/LIGHT_RAIN_NIGHT.webm",
    "4": "img/RAIN_DAY.webm",
    "4n": "img/RAIN_NIGHT.webm",
    "4r": "img/HEAVY_RAIN_DAY.webm",
    "4rn": "img/HEAVY_RAIN_NIGHT.webm",
    "5": "img/HEAVY_RAIN_DAY.webm",
    "5n": "img/HEAVY_RAIN_NIGHT.webm",
    "4t": "img/THUNDERSTORM_DAY.webm",
    "4tn": "img/THUNDERSTORM_NIGHT.webm",
    "6": "img/THUNDERSTORM_DAY.webm",
    "6n": "img/THUNDERSTORM_NIGHT.webm",
    "7": "img/OVERCAST_DAY.webm",
    "7n": "img/OVERCAST_NIGHT.webm",
    "8": "img/SNOW.webm",
    "9": "img/FOG_DAY.webm",
    "9n": "img/FOG_NIGHT.webm"
  };

  var FALLBACK_DAY = "img/OVERCAST_DAY.webm";
  var FALLBACK_NIGHT = "img/OVERCAST_NIGHT.webm";
  var currentSrc = "";
  var currentObjectUrl = "";

  function toWebm(path) {
    if (!path) return "";
    return String(path).replace(/\.mp4$/i, ".webm");
  }

  function toMp4(path) {
    if (!path) return "";
    return String(path).replace(/\.webm$/i, ".mp4");
  }

  function getMimeFromPath(path) {
    var src = String(path || "").toLowerCase();
    if (/\.webm($|\?)/.test(src)) return "video/webm";
    if (/\.ogv($|\?)/.test(src) || /\.ogg($|\?)/.test(src)) return "video/ogg";
    return "video/mp4";
  }

  function clearObjectUrl() {
    if (currentObjectUrl && window.URL && typeof window.URL.revokeObjectURL === "function") {
      try {
        window.URL.revokeObjectURL(currentObjectUrl);
      } catch (e) {
      }
    }
    currentObjectUrl = "";
  }

  function loadSourceAsBlob(video, src, cb) {
    if (!video || !src) {
      cb(false, "invalid");
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("GET", src, true);
    xhr.responseType = "blob";

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;

      if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
        var blob = xhr.response;
        var mime = getMimeFromPath(src);
        var finalBlob = blob;

        // Forca MIME correto para runtimes que nao confiam no content-type do servidor.
        try {
          finalBlob = new Blob([blob], { type: mime });
        } catch (e) {
        }

        if (window.URL && typeof window.URL.createObjectURL === "function") {
          clearObjectUrl();
          currentObjectUrl = window.URL.createObjectURL(finalBlob);
          video.src = currentObjectUrl;
        } else {
          video.src = src;
        }

        video.load();
        cb(true, "blob");
        return;
      }

      cb(false, "http-" + xhr.status);
    };

    xhr.onerror = function () {
      cb(false, "network");
    };

    try {
      xhr.send();
    } catch (e) {
      cb(false, "send");
    }
  }

  function canPlay(video, mime) {
    if (!video || typeof video.canPlayType !== "function") return false;
    try {
      var result = video.canPlayType(mime);
      return result === "probably" || result === "maybe";
    } catch (e) {
      return false;
    }
  }

  function getMediaErrorLabel(video) {
    if (!video || !video.error) return "UNKNOWN";
    if (video.error.code === 1) return "MEDIA_ERR_ABORTED";
    if (video.error.code === 2) return "MEDIA_ERR_NETWORK";
    if (video.error.code === 3) return "MEDIA_ERR_DECODE";
    if (video.error.code === 4) return "MEDIA_ERR_SRC_NOT_SUPPORTED";
    return "UNKNOWN";
  }

  function getFallbackGradient(iconCode) {
    var icon = normalizeIcon(iconCode);

    // Ceu limpo diurno (azulado vivo)
    if (icon === "1") return "linear-gradient(180deg, #4fc3f7 0%, #1e88e5 55%, #1565c0 100%)";

    // Ceu limpo noturno
    if (icon === "1n") return "linear-gradient(180deg, #0b1b3a 0%, #132a4f 55%, #1f3a68 100%)";

    // Parcialmente nublado (dia/noite)
    if (icon === "2" || icon === "3") return "linear-gradient(180deg, #7ec8f8 0%, #5ba2d8 55%, #3c7aa7 100%)";
    if (icon === "2n" || icon === "3n") return "linear-gradient(180deg, #16233d 0%, #213a5c 55%, #2b4d73 100%)";

    // Nublado / geada / neve
    if (icon === "7" || icon === "8") return "linear-gradient(180deg, #cfd8dc 0%, #b0bec5 55%, #90a4ae 100%)";
    if (icon === "7n") return "linear-gradient(180deg, #34495e 0%, #455a64 55%, #546e7a 100%)";

    // Neblina
    if (icon === "9") return "linear-gradient(180deg, #c9d6df 0%, #b7c7d1 55%, #9fb3bf 100%)";
    if (icon === "9n") return "linear-gradient(180deg, #3b4b57 0%, #4b5d69 55%, #5a6f7b 100%)";

    // Chuva leve
    if (icon === "2r") return "linear-gradient(180deg, #4f7fa4 0%, #3c6787 55%, #2c536b 100%)";
    if (icon === "2rn") return "linear-gradient(180deg, #26384a 0%, #1f3040 55%, #172634 100%)";

    // Chuva moderada/forte
    if (icon === "4" || icon === "4r" || icon === "5") return "linear-gradient(180deg, #455a64 0%, #37474f 55%, #263238 100%)";
    if (icon === "4n" || icon === "4rn" || icon === "5n") return "linear-gradient(180deg, #1b2730 0%, #152029 55%, #101820 100%)";

    // Tempestade
    if (icon === "4t" || icon === "6") return "linear-gradient(180deg, #3b3f53 0%, #2b2f43 55%, #1f2233 100%)";
    if (icon === "4tn" || icon === "6n") return "linear-gradient(180deg, #121522 0%, #1a1e2e 55%, #22273a 100%)";

    // Fallback generico por periodo
    if (isNightIcon(icon)) return "linear-gradient(180deg, #0f172a 0%, #1e293b 55%, #334155 100%)";
    return "linear-gradient(180deg, #6fb7e9 0%, #4b93cb 55%, #2f6fa4 100%)";
  }

  function applyVisualFallback(iconCode) {
    var bg = document.getElementById("weather-background");
    if (!bg) return;

    // Fallback visual tematico para evitar tela sem fundo quando nenhum video decodifica.
    bg.style.background = getFallbackGradient(iconCode);
  }

  function buildCandidates(targetMp4, fallbackMp4, video) {
    var targetWebm = /\.webm($|\?)/i.test(String(targetMp4 || "")) ? targetMp4 : toWebm(targetMp4);
    var fallbackWebm = /\.webm($|\?)/i.test(String(fallbackMp4 || "")) ? fallbackMp4 : toWebm(fallbackMp4);
    var targetH264 = /\.mp4($|\?)/i.test(String(targetMp4 || "")) ? targetMp4 : toMp4(targetMp4);
    var fallbackH264 = /\.mp4($|\?)/i.test(String(fallbackMp4 || "")) ? fallbackMp4 : toMp4(fallbackMp4);
    var hasH264 =
      canPlay(video, "video/mp4; codecs=\"avc1.42E01E\"") ||
      canPlay(video, "video/mp4; codecs=\"avc1.4D401E\"");
    var hasGenericMp4 = canPlay(video, "video/mp4");
    var hasWebm =
      canPlay(video, "video/webm") ||
      canPlay(video, "video/webm; codecs=\"vp8\"") ||
      canPlay(video, "video/webm; codecs=\"vp9\"");

    // Neste template, WEBM deve ter prioridade para runtime legado.
    if (hasWebm) {
      return uniqueCandidates([targetWebm, fallbackWebm, targetH264, fallbackH264]);
    }

    if (hasH264 || hasGenericMp4) {
      return uniqueCandidates([targetH264, fallbackH264, targetWebm, fallbackWebm]);
    }

    console.warn("[WEATHER VIDEO] Browser/player sem suporte declarado para MP4/H.264 e WEBM.");
    return uniqueCandidates([targetWebm, fallbackWebm, targetH264, fallbackH264]);
  }

  function uniqueCandidates(list) {
    var result = [];
    var seen = {};
    var i;
    var src;
    for (i = 0; i < list.length; i++) {
      src = list[i];
      if (!src || seen[src]) continue;
      seen[src] = true;
      result.push(src);
    }
    return result;
  }

  function normalizeIcon(iconCode) {
    if (iconCode === undefined || iconCode === null) return "";
    return String(iconCode).toLowerCase();
  }

  function isNightIcon(iconCode) {
    return normalizeIcon(iconCode).indexOf("n") !== -1;
  }

  function resolveVideo(iconCode) {
    var icon = normalizeIcon(iconCode);
    if (VIDEO_MAP[icon]) return VIDEO_MAP[icon];
    return isNightIcon(iconCode) ? FALLBACK_NIGHT : FALLBACK_DAY;
  }

  function ensureVideoElement() {
    var video = document.getElementById("weather-video");
    if (!video) return null;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;
    video.setAttribute("muted", "muted");
    video.setAttribute("playsinline", "playsinline");
    video.setAttribute("webkit-playsinline", "webkit-playsinline");
    video.setAttribute("x5-playsinline", "x5-playsinline");
    video.setAttribute("autoplay", "autoplay");
    return video;
  }

  function safePlay(video) {
    if (!video || typeof video.play !== "function") return;
    try {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function (err) {
          console.warn("[WEATHER VIDEO] play bloqueado/erro:", err);
        });
      }
    } catch (e) {
      console.warn("[WEATHER VIDEO] play falhou:", e);
    }
  }

  function setIcon(iconCode) {
    var video = ensureVideoElement();
    var targetMp4 = resolveVideo(iconCode);
    var fallbackMp4 = isNightIcon(iconCode) ? FALLBACK_NIGHT : FALLBACK_DAY;
    var candidates;
    var index = 0;

    function tryCurrent() {
      var src = candidates[index];
      if (!src) {
        console.error("[WEATHER VIDEO] Nenhuma fonte de video valida para o icone:", iconCode);
        return { ok: false, reason: "no-candidate" };
      }

      if (currentSrc === src && video.getAttribute("data-weather-src") === src) {
        return { ok: true, video: src, reason: "unchanged" };
      }

      currentSrc = src;
      video.setAttribute("data-weather-src", src);

      loadSourceAsBlob(video, src, function (ok, mode) {
        if (!ok) {
          console.warn("[WEATHER VIDEO] Falha ao carregar fonte", src, "|", mode);
          index += 1;
          if (index < candidates.length) {
            tryCurrent();
          } else {
            console.error("[WEATHER VIDEO] Falha ao reproduzir todas as fontes:", candidates);
            applyVisualFallback(iconCode);
          }
          return;
        }

        safePlay(video);
      });

      return { ok: true, video: src, reason: "updated" };
    }

    if (!video) {
      console.error("[WEATHER VIDEO] #weather-video nao encontrado");
      return { ok: false, video: targetMp4, reason: "missing-video-element" };
    }

    candidates = buildCandidates(targetMp4, fallbackMp4, video);

    video.onerror = function () {
      var label = getMediaErrorLabel(video);
      console.warn("[WEATHER VIDEO] erro em", candidates[index], "|", label, "| readyState=", video.readyState, "| networkState=", video.networkState);

      index += 1;
      if (index < candidates.length) {
        tryCurrent();
      } else {
        console.error("[WEATHER VIDEO] Falha ao reproduzir todas as fontes:", candidates);
        applyVisualFallback(iconCode);
      }
    };

    return tryCurrent();
  }

  global.WeatherVideo = {
    setIcon: setIcon,
    resolveVideo: resolveVideo
  };
})(window);
