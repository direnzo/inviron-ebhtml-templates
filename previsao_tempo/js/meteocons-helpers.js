/**
 * meteocons-helpers.js — ES5, compatível com Android 7+ (WebKit legado)
 *
 * Biblioteca compartilhável para carregar SVGs Meteocons via XHR.
 * Copie este arquivo + a pasta img/meteocons/ para qualquer template.
 *
 * CONFIG (podem ser sobrescritas antes do window.onload):
 *   METEOCONS_PATH   = 'img/meteocons'   (caminho base dos SVGs)
 *   METEOCONS_STYLE  = 'fill'             (fill | flat | line | monochrome)
 *   METEOCONS_COLOR  = 'currentColor'     (cor dos ícones monochrome)
 *
 * USO:
 *   injetarMeteocon(el, 'clear-day');
 *   injetarMeteocon(el, 'extreme-rain', '#ff0000');
 *   var nome = climaToMeteocon('1'); // retorna 'clear-day'
 */

/* ---------- CONFIGURACOES GLOBAIS ---------- */
var METEOCONS_PATH = 'img/meteocons';
var METEOCONS_STYLE = 'fill';
var METEOCONS_COLOR = 'currentColor';

/* Aplica CONFIG_CLIMA se existir (sobrescreve estilo e cor) */
if (typeof CONFIG_CLIMA !== 'undefined') {
    if (CONFIG_CLIMA.iconStyle) { METEOCONS_STYLE = CONFIG_CLIMA.iconStyle; }
    if (CONFIG_CLIMA.iconColor) { METEOCONS_COLOR = CONFIG_CLIMA.iconColor; }
}

/* ---------- MAPEAMENTO CLIMATEMPO -> METEOCONS ---------- */
var METEOCONS_MAP = {
  '1':   'clear-day', //Sol
  '1n':  'clear-night', //Noite sem nuvens.
  '2':   'mostly-clear-day', //Sol com algumas nuvens
  '2r':  'overcast-day', //Sol com muitas nuvens
  '2n':  'mostly-clear-night', //Noite com algumas nuvens.
  '2rn': 'overcast-night', //Noite com muitas nuvens
  '3':   'overcast-drizzle', //Nublado.
  '3n':  'overcast-drizzle', //Nublado.
  '3tm': 'cloudy', //Nublado.
  '4':   'mostly-clear-day-rain', //Sol e chuva
  '4r':  'extreme-day-rain', //Sol com muitas nuvens e chuva
  '4n':  'mostly-clear-night-rain', //Noite chuvosa
  '4rn': 'extreme-night-rain', //Noite nublada e chuvosa.
  '4t':  'thunderstorms-day-rain', //Sol entre nuvens e pancadas de chuva, com trovoadas
  '4tn': 'thunderstorms-night-rain', //Pancadas de chuva durante a noite
  '5':   'extreme-rain', //Chuvoso.
  '5n':  'extreme-rain', //Chuvoso.
  '6':   'extreme-thunderstorms-rain', //Chuva e trovoadas
  '6n':  'extreme-thunderstorms-rain', //Chuva e trovoadas
  '7':   'wind-snow', //Geada.
  '7n':  'wind-snow', //Geada.
  '8':   'snow', //Neve.
  '8n':  'mostly-clear-night-snow', //Neve.
  '9':   'mostly-clear-day-fog', //Nevoeiro
  '9n':  'mostly-clear-night-fog', //Nevoeiro
  '10':  'drizzle', //Chuva intensa durante o dia
  '11':  'overcast-rain', //Nuvens e Chuva
};

/* ---------- FUNCOES ---------- */

// Cache em memoria — elimina XHRs duplicados para o mesmo arquivo SVG
var METEOCONS_CACHE = {};

// Funcao base com cache: carrega qualquer SVG por URL completa
function carregarSvgCached(url, callback) {
  if (METEOCONS_CACHE[url]) {
    callback(null, METEOCONS_CACHE[url]);
    return;
  }
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;
    if (xhr.status === 200 || xhr.status === 0) {
      METEOCONS_CACHE[url] = xhr.responseText;
      callback(null, xhr.responseText);
    } else {
      callback('Erro ao carregar SVG: ' + url + ' (status: ' + xhr.status + ')', null);
    }
  };
  xhr.send();
}

/**
 * Carrega um SVG Meteocon via XHR e chama callback com o conteudo.
 * @param {string} nomeArquivo - Nome do SVG (sem extensao)
 * @param {function} callback - function(err, svgContent)
 */
function carregarMeteocon(nomeArquivo, callback) {
  var url = METEOCONS_PATH + '/' + METEOCONS_STYLE + '/' + nomeArquivo + '.svg';
  carregarSvgCached(url, callback);
}

/**
 * Injeta um SVG Meteocon inline em um container.
 * @param {HTMLElement} el - Elemento container
 * @param {string} nomeArquivo - Nome do SVG (sem extensao)
 * @param {string} cor - Cor opcional (padrao: METEOCONS_COLOR)
 */
function injetarMeteocon(el, nomeArquivo, cor) {
  if (!el) return;
  cor = cor || METEOCONS_COLOR;

  carregarMeteocon(nomeArquivo, function (err, svgContent) {
    if (err) {
      console.error(err);
      return;
    }

    // Remove SVG anterior se houver
    var svgExistente = el.querySelector('svg');
    if (svgExistente) {
      svgExistente.parentNode.removeChild(svgExistente);
    }

    el.innerHTML = svgContent;

    var svg = el.querySelector('svg');
    if (svg) {
      // Ajusta viewBox para remover espaçamento extra (tight fit)
      try {
        var bbox = svg.getBBox();
        if (bbox && bbox.width > 0 && bbox.height > 0) {
          // Adiciona pequena margem (5% do tamanho) para não cortar bordas
          var padding = Math.max(bbox.width, bbox.height) * 0.05;
          var newX = bbox.x - padding;
          var newY = bbox.y - padding;
          var newW = bbox.width + (padding * 2);
          var newH = bbox.height + (padding * 2);
          svg.setAttribute('viewBox', newX + ' ' + newY + ' ' + newW + ' ' + newH);
        }
      } catch (e) {
        // Se getBBox falhar (Firefox em alguns casos), mantém viewBox original
        console.warn('Não foi possível ajustar viewBox:', e);
      }
      
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      if (METEOCONS_STYLE === 'monochrome') {
        svg.setAttribute('fill', cor);
      } else {
        svg.style.color = cor;
      }
    }
  });
}

/**
 * Converte codigo numerico Climatempo para nome do arquivo Meteocon.
 * @param {string|number} codigo - Codigo do icone (ex: '1', '2r', '4tn')
 * @returns {string} Nome do arquivo SVG (sem extensao)
 */
function climaToMeteocon(codigo) {
  var chave = codigo.toString();
  return METEOCONS_MAP[chave] || 'cloudy';
}

/**
 * Converte indice UV (0-11+) para nome do arquivo Meteocon.
 * @param {string|number} valor - Indice UV (ex: '5', '11', '11+')
 * @returns {string} Nome do arquivo SVG (ex: 'uv-index-5', 'uv-index-11-plus')
 */
function uvToMeteocon(valor) {
  if (!valor) return 'uv-index';
  var num = parseInt(valor.toString(), 10);
  if (isNaN(num)) return 'uv-index';
  if (num < 1) return 'uv-index-1';
  if (num >= 11) return 'uv-index-11-plus';
  return 'uv-index-' + num;
}

/**
 * Converte direcao cardinal (N, NNE, NE, ..., NNW) para angulo em graus.
 * Usado para rotacionar o ponteiro do compass.svg.
 * @param {string} dir - Sigla da direcao (ex: 'N', 'SSE', 'WNW')
 * @returns {number} Angulo em graus (0 a 360)
 */
function direcaoCardinalParaAngulo(dir) {
  var mapa = {
    'N': 0,
    'NNE': 22.5,
    'NE': 45,
    'ENE': 67.5,
    'E': 90,
    'ESE': 112.5,
    'SE': 135,
    'SSE': 157.5,
    'S': 180,
    'SSW': 202.5,
    'SW': 225,
    'WSW': 247.5,
    'W': 270,
    'WNW': 292.5,
    'NW': 315,
    'NNW': 337.5
  };
  if (!dir) return 0;
  dir = String(dir).toUpperCase().replace(/[^A-Z]/g, '');
  if (mapa[dir] !== undefined) return mapa[dir];
  // Fallback para nomes por extenso
  if (dir === 'NORTE') return 0;
  if (dir === 'LESTE') return 90;
  if (dir === 'SUL') return 180;
  if (dir === 'OESTE') return 270;
  return 0;
}

/**
 * Converte velocidade do vento (km/h) para o icone Beaufort correspondente.
 * Segue a Escala Beaufort internacional (WMO):
 *   0:  < 1     -> wind-beaufort-0
 *   1:  1-5     -> wind-beaufort-1
 *   2:  6-11    -> wind-beaufort-2
 *   3:  12-19   -> wind-beaufort-3
 *   4:  20-28   -> wind-beaufort-4
 *   5:  29-38   -> wind-beaufort-5
 *   6:  39-49   -> wind-beaufort-6
 *   7:  50-61   -> wind-beaufort-7
 *   8:  62-74   -> wind-beaufort-8
 *   9:  75-88   -> wind-beaufort-9
 *   10: 89-102  -> wind-beaufort-10
 *   11: 103-117 -> wind-beaufort-11
 *   12: >= 118  -> wind-beaufort-12
 * @param {string|number} velocidade - Velocidade do vento em km/h
 * @returns {string} Nome do arquivo SVG (ex: 'wind-beaufort-3')
 */
function ventoVelocidadeParaIcone(velocidade) {
  if (!velocidade) return 'wind-beaufort-0';
  var num = parseInt(String(velocidade).replace(/[^0-9]/g, ''), 10);
  if (isNaN(num)) return 'wind-beaufort-0';
  if (num < 1)   return 'wind-beaufort-0';
  if (num <= 5)  return 'wind-beaufort-1';
  if (num <= 11) return 'wind-beaufort-2';
  if (num <= 19) return 'wind-beaufort-3';
  if (num <= 28) return 'wind-beaufort-4';
  if (num <= 38) return 'wind-beaufort-5';
  if (num <= 49) return 'wind-beaufort-6';
  if (num <= 61) return 'wind-beaufort-7';
  if (num <= 74) return 'wind-beaufort-8';
  if (num <= 88) return 'wind-beaufort-9';
  if (num <= 102) return 'wind-beaufort-10';
  if (num <= 117) return 'wind-beaufort-11';
  return 'wind-beaufort-12';
}