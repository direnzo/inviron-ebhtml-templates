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

/* ---------- MAPEAMENTO CLIMATEMPO -> METEOCONS ---------- */
var METEOCONS_MAP = {
  '1':   'clear-day',
  '1n':  'clear-night',
  '2':   'partly-cloudy-day',
  '2r':  'partly-cloudy-day-rain',
  '2n':  'partly-cloudy-night',
  '2rn': 'partly-cloudy-night-rain',
  '3':   'cloudy',
  '3n':  'cloudy',
  '4':   'overcast-day-rain',
  '4r':  'extreme-day-rain',
  '4n':  'overcast-night-rain',
  '4rn': 'extreme-rain',
  '4t':  'thunderstorms-day-rain',
  '4tn': 'thunderstorms-night-rain',
  '5':   'extreme-rain',
  '5n':  'extreme-night-rain',
  '6':   'thunderstorms',
  '6n':  'thunderstorms-night',
  '7':   'partly-cloudy-day-snow',
  '7n':  'partly-cloudy-night-snow',
  '8':   'snow',
  '9':   'fog'
};

/* ---------- MAPEAMENTO DIRECAO VENTO -> METEOCONS ---------- */
var METEOCONS_WIND_MAP = {
  'N':  'wind-direction-n',
  'NE': 'wind-direction-ne',
  'E':  'wind-direction-e',
  'SE': 'wind-direction-se',
  'S':  'wind-direction-s',
  'SW': 'wind-direction-sw',
  'W':  'wind-direction-w',
  'NW': 'wind-direction-nw'
};

/* ---------- FUNCOES ---------- */

/**
 * Carrega um SVG Meteocon via XHR e chama callback com o conteudo.
 * @param {string} nomeArquivo - Nome do SVG (sem extensao)
 * @param {function} callback - function(err, svgContent)
 */
function carregarMeteocon(nomeArquivo, callback) {
  var url = METEOCONS_PATH + '/' + METEOCONS_STYLE + '/' + nomeArquivo + '.svg';
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;
    if (xhr.status === 200 || xhr.status === 0) {
      callback(null, xhr.responseText);
    } else {
      callback('Erro ao carregar SVG: ' + url + ' (status: ' + xhr.status + ')', null);
    }
  };
  xhr.send();
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
 * Converte direcao do vento (N, NE, E, etc.) para nome do arquivo Meteocon.
 * @param {string} direcao - Sigla da direcao (ex: 'N', 'NE', 'SSW')
 * @param {boolean} inverter - Se true, inverte a direcao (oposto)
 * @returns {string} Nome do arquivo SVG (sem extensao), ou 'wind' se nao encontrar
 */
function ventoToMeteocon(direcao, inverter) {
  if (!direcao) return 'wind';
  var dir = direcao.toString().toUpperCase().trim();
  // Remove direcoes intermediarias (ex: 'NNE' vira 'N', 'WSW' vira 'W')
  // Mantem apenas as 8 cardinales
  if (dir.length > 2) {
    if (dir.indexOf('N') === 0 && dir.indexOf('NE') !== 0) dir = 'N';
    else if (dir.indexOf('S') === 0 && dir.indexOf('SE') !== 0 && dir.indexOf('SW') !== 0) dir = 'S';
    else if (dir.indexOf('E') === 0 && dir.indexOf('NE') !== 0 && dir.indexOf('SE') !== 0) dir = 'E';
    else if (dir.indexOf('W') === 0 && dir.indexOf('NW') !== 0 && dir.indexOf('SW') !== 0) dir = 'W';
    else dir = dir.slice(0, 2);
  }
  // Se inverter, pega a direcao oposta
  if (inverter) {
    var opostos = { 'N': 'S', 'S': 'N', 'E': 'W', 'W': 'E', 'NE': 'SW', 'SW': 'NE', 'NW': 'SE', 'SE': 'NW' };
    dir = opostos[dir] || dir;
  }
  return METEOCONS_WIND_MAP[dir] || 'wind';
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