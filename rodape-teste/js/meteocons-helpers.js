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
  '9':   'fog',
  '11':  'rain'

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

      // monochrome: aplica cor em todos os elementos (icone monocromatico)
      if (METEOCONS_STYLE === 'monochrome') {
        aplicarCorSvg(svg, cor);
      } else {
        // fill/flat/line: preserva cores originais, afeta apenas currentColor
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
 * Converte sigla cardinal para o nome por extenso em portugues.
 * @param {string} dir - Sigla da direcao (ex: 'N', 'SE', 'W')
 * @returns {string} Nome completo (ex: 'Norte', 'Sudeste', 'Oeste')
 */
function direcaoCardinalPorExtenso(dir) {
  var mapa = {
    'N': 'Norte',
    'NNE': 'Norte-Nordeste',
    'NE': 'Nordeste',
    'ENE': 'Leste-Nordeste',
    'E': 'Leste',
    'ESE': 'Leste-Sudeste',
    'SE': 'Sudeste',
    'SSE': 'Sul-Sudeste',
    'S': 'Sul',
    'SSW': 'Sul-Sudoeste',
    'SW': 'Sudoeste',
    'WSW': 'Oeste-Sudoeste',
    'W': 'Oeste',
    'WNW': 'Oeste-Noroeste',
    'NW': 'Noroeste',
    'NNW': 'Norte-Noroeste'
  };
  if (!dir) return '--';
  var sigla = String(dir).toUpperCase().replace(/[^A-Z]/g, '');
  return mapa[sigla] || sigla;
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
 * Converte velocidade do vento (km/h) para o icone correspondente.
 *   < 50 km/h -> wind
 *   >= 50 km/h -> wind-alert
 * @param {string|number} velocidade - Velocidade do vento em km/h
 * @returns {string} Nome do arquivo SVG (ex: 'wind', 'wind-alert')
 */
function ventoVelocidadeParaIcone(velocidade) {
  if (!velocidade) return 'wind';
  var num = parseInt(String(velocidade).replace(/[^0-9]/g, ''), 10);
  if (isNaN(num)) return 'wind';
  if (num < 50) return 'wind';
  return 'wind-alert';
}

/* ---------- MAPEAMENTO CLIMATEMPO -> BACKGROUND ---------- */
var CLIMA_BG_MAP = {
  '1':   'bg-sunny',
  '1n':  'bg-night',
  '2':   'bg-sunny-cloudy',
  '2r':  'bg-rainy',
  '2n':  'bg-night',
  '2rn': 'bg-rainy',
  '3':   'bg-cloudy',
  '3n':  'bg-night',
  '4':   'bg-rainy',
  '4r':  'bg-rainy',
  '4n':  'bg-rainy',
  '4rn': 'bg-rainy',
  '4t':  'bg-storm',
  '4tn': 'bg-storm',
  '5':   'bg-rainy-dark',
  '5n':  'bg-rainy-dark',
  '6':   'bg-storm',
  '6n':  'bg-storm',
  '7':   'bg-snow',
  '7n':  'bg-snow',
  '8':   'bg-snow',
  '9':   'bg-fog',
  '11':  'bg-rainy'

};

/**
 * Retorna a classe de background com base no codigo do icone Climatempo.
 * @param {string|number} codigo - Codigo do icone (ex: '1', '4t', '21')
 * @returns {string} Nome da classe CSS (ex: 'bg-sunny', 'bg-night')
 */
function climaBackgroundClass(codigo) {
  var chave = codigo.toString();
  return CLIMA_BG_MAP[chave] || 'bg-sunny';
}

/**
 * Aplica uma cor a um SVG monochrome sem deformar.
 * Substitui fill/stroke "black" por currentColor,
 * preservando fill-rule, transparências e estilos do SVG original.
 * @param {SVGSVGElement} svg - Elemento SVG raiz
 * @param {string} cor - Cor a aplicar (ex: '#ff00cc')
 */
function aplicarCorSvg(svg, cor) {
  if (!svg || !cor) return;

  svg.style.color = cor;

  /* Substitui apenas fill/stroke "black" por currentColor.
     Mantém "white" para negativos internos e preserva "none". */
  var els = svg.querySelectorAll('path, circle, rect, ellipse, line, polyline, polygon, g');
  for (var i = 0; i < els.length; i++) {
    var el = els[i];

    var fill = el.getAttribute('fill');
    if (fill === 'black' || fill === '#000' || fill === '#000000') {
      el.setAttribute('fill', 'currentColor');
    }

    var stroke = el.getAttribute('stroke');
    if (stroke === 'black' || stroke === '#000' || stroke === '#000000') {
      el.setAttribute('stroke', 'currentColor');
    }
  }
}