/**
 * meteocons-helpers.js — ES5, compatível com Android 7+ (WebKit legado)
 *
 * MOTOR UNIVERSAL de ícones Meteocons — 100% agnóstico de fonte de dados.
 *
 * Este arquivo NUNCA deve conter mapeamentos ou lógica específica de uma
 * fonte de dados (CPTEC, Climatempo, OpenWeather etc.). Ele só sabe
 * carregar/injetar SVGs Meteocons e converter valores genéricos (índice
 * UV, velocidade do vento, direção cardinal) em nomes de ícone — coisas
 * que são iguais não importa de onde vêm os dados.
 *
 * A tradução "código bruto da fonte -> nome de ícone Meteocon" fica em
 * js/provider-<fonte>.js (veja js/provider-cptec.js para o contrato
 * completo e instruções de como plugar uma nova fonte de dados).
 *
 * Por ser genérico, este arquivo pode ser copiado sem alteração para
 * qualquer outro template + a pasta img/meteocons/.
 *
 * CONFIG (podem ser sobrescritas antes do window.onload):
 *   METEOCONS_PATH   = 'img/meteocons'   (caminho base dos SVGs)
 *   METEOCONS_STYLE  = 'fill'             (fill | flat | line | monochrome)
 *   METEOCONS_COLOR  = 'currentColor'     (cor dos ícones monochrome)
 *
 * USO:
 *   injetarMeteocon(el, 'clear-day');
 *   injetarMeteocon(el, 'extreme-rain', '#ff0000');
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

/* ---------- FUNCOES ---------- */

// Cache em memoria — elimina XHRs duplicados para o mesmo arquivo SVG
var METEOCONS_CACHE = {};

// Detecta hardware fraco (flag global definida em master.js). Em hardware
// fraco as animacoes SMIL (<animate*>) sao removidas do markup do SVG antes
// da injecao: CSS "animation: none" NAO para SMIL, entao cada icone visivel
// ficaria rodando 1-9 animacoes continuas forcando repaint eterno.
function _hardwareFraco() {
  return typeof HARDWARE_FRACO !== 'undefined' && HARDWARE_FRACO;
}

// Remove elementos <animate>, <animateTransform>, <animateMotion> (auto-
// fechados ou com tag de fechamento) da string do SVG.
//
// Cuidado extra com precipitacao: nos Meteocons, pingos de chuva, flocos de
// neve e granizo tem opacity="0" FIXO no <path> — eles so ficam visiveis
// durante a animacao de opacidade. Sem esse tratamento, um icone de chuva/
// neve/tempestade-com-chuva mostraria so 1 particula (parece garoa). Por
// isso, apos remover as animacoes, forcamos opacity="0" -> opacity="1".
// (o flood-opacity="0" dos filtros de bussola NAO casa: exige espaco/aspas
// antes de "opacity", e ali o caractere anterior e "-".)
function removerAnimacoesSvg(svgText) {
  if (!svgText) return svgText;
  return svgText
    .replace(/<animate[A-Za-z]*\b[^>]*\/>/gi, '')
    .replace(/<animate[A-Za-z]*\b[^>]*>[\s\S]*?<\/animate[A-Za-z]*>/gi, '')
    .replace(/([\s"'])opacity=(["'])0\2/gi, '$1opacity=$2' + '1' + '$2');
}

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

    // Hardware fraco: tira as animacoes SMIL antes de o parser tocar no markup
    if (_hardwareFraco()) {
      svgContent = removerAnimacoesSvg(svgContent);
    }

    el.innerHTML = svgContent;

    var svg = el.querySelector('svg');
    if (svg) {
      // Ajusta viewBox para remover espaçamento extra (tight fit).
      // getBBox() forca reflow sincrono — pulado em hardware fraco, onde o
      // viewBox nativo dos Meteocons (0 0 128 128) ja e apertado o bastante.
      if (!_hardwareFraco()) {
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