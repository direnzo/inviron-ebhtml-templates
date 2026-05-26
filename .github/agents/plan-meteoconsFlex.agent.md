Plano de Execução — Meteocons Flexível (Estilo & Cor) + Modal de Teste

1. Estrutura e Variáveis Globais
- Defina variáveis globais para estilo e cor:
  var METEOCONS_STYLE = 'fill'; // fill, flat, line, monochrome
  var METEOCONS_COLOR = '#1e90ff'; // só afeta monochrome

2. Mapeamento Climatempo → Nome do SVG Meteocons
- Use o mapeamento conforme sua lista, exemplo:
  var iconMap = {
    "1":   "clear-day",
    "1n":  "clear-night",
    "2":   "partly-cloudy-day",
    "2r":  "partly-cloudy-day-fog",
    "2n":  "partly-cloudy-night",
    "2rn": "partly-cloudy-night-fog",
    "3":   "overcast-haze",
    "3n":  "overcast-haze",
    "3tm": "extreme",
    "4":   "mostly-clear-day-drizzle",
    "4r":  "extreme-day-rain",
    "4n":  "partly-cloudy-night-rain",
    "4rn": "extreme-rain",
    "4t":  "extreme-thunderstorms-day-rain",
    "4tn": "extreme-night-rain",
    "5":   "extreme-rain",
    "5n":  "extreme-night-rain",
    "6":   "extreme-thunderstorms-day-rain",
    "6n":  "extreme-thunderstorms-night-rain",
    "7":   "partly-cloudy-day-snow",
    "7n":  "partly-cloudy-night-snow",
    "8":   "overcast-snow",
    "8n":  "mostly-clear-night-snow",
    "9":   "smoke",
    "9n":  "mostly-clear-night-smoke",
    // Extras:
    "uv-index-alert": "uv-index-alert",
    "uv-index-1": "uv-index-1",
    "uv-index-2": "uv-index-2",
    "uv-index-3": "uv-index-3",
    "uv-index-4": "uv-index-4",
    "uv-index-5": "uv-index-5",
    "uv-index-6": "uv-index-6",
    "uv-index-7": "uv-index-7",
    "uv-index-8": "uv-index-8",
    "uv-index-9": "uv-index-9",
    "uv-index-10": "uv-index-10",
    "uv-index-11": "uv-index-11",
    "uv-index-11-plus": "uv-index-11-plus",
    "wind-direction-n": "wind-direction-n",
    "wind-direction-ne": "wind-direction-ne",
    "wind-direction-e": "wind-direction-e",
    "wind-direction-se": "wind-direction-se",
    "wind-direction-s": "wind-direction-s",
    "wind-direction-sw": "wind-direction-sw",
    "wind-direction-w": "wind-direction-w",
    "wind-direction-nw": "wind-direction-nw",
    "humidity": "humidity",
    "raindrop-measure": "raindrop-measure",
    "raindrops": "raindrops"
  };

3. Função para Caminho do SVG
function getMeteoconsPath(iconName) {
  return 'img/meteocons/' + METEOCONS_STYLE + '/' + iconName + '.svg';
}

4. Modal de Teste de Ícones
Cole o seguinte JS em um arquivo (ex: js/meteocons-tester.js):

window.addEventListener('load', function(){
  if (window.__METEOCONS_TESTER__) return;
  window.__METEOCONS_TESTER__ = true;

  var modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '24px';
  modal.style.left = '24px';
  modal.style.zIndex = 9999;
  modal.style.background = 'rgba(30,30,40,0.98)';
  modal.style.border = '2px solid #fff';
  modal.style.borderRadius = '12px';
  modal.style.padding = '24px 18px 18px 18px';
  modal.style.boxShadow = '0 8px 32px #0008';
  modal.style.maxWidth = '90vw';
  modal.style.overflow = 'auto';
  modal.style.width = '900px';
  modal.style.height = '80vh';
  modal.style.fontSize = '18px';
  modal.style.fontFamily = 'sans-serif';
  modal.style.color = '#fff';
  modal.innerHTML = '<div style="font-size:22px;font-weight:bold;margin-bottom:12px;">Teste Meteocons — Estilo: <b>' + METEOCONS_STYLE + '</b> ' + (METEOCONS_STYLE==='monochrome' ? 'Cor: <span style="color:'+METEOCONS_COLOR+'">'+METEOCONS_COLOR+'</span>' : '') + '</div>';

  for (var cod in iconMap) {
    var icone = iconMap[cod];
    var label = cod + ': ' + icone;
    var row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.marginBottom = '10px';

    // SVG inline para cor customizada (monochrome)
    if (METEOCONS_STYLE === 'monochrome') {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', getMeteoconsPath(icone), false);
      xhr.send();
      var svg = xhr.status === 200 ? xhr.responseText : '<svg width="64" height="64"></svg>';
      // Força currentColor
      svg = svg.replace(/fill="[^"]*"/g, 'fill="currentColor"');
      var svgWrap = document.createElement('span');
      svgWrap.innerHTML = svg;
      svgWrap.style.color = METEOCONS_COLOR;
      svgWrap.style.width = '64px';
      svgWrap.style.height = '64px';
      svgWrap.style.display = 'inline-block';
      svgWrap.style.marginRight = '12px';
      row.appendChild(svgWrap);
    } else {
      var img = document.createElement('img');
      img.src = getMeteoconsPath(icone);
      img.width = 64;
      img.height = 64;
      img.style.marginRight = '12px';
      row.appendChild(img);
    }
    var span = document.createElement('span');
    span.textContent = label;
    row.appendChild(span);
    modal.appendChild(row);
  }

  var close = document.createElement('button');
  close.innerText = 'Fechar';
  close.style.marginTop = '10px';
  close.style.padding = '6px 18px';
  close.style.background = '#222';
  close.style.color = '#fff';
  close.style.border = '1px solid #fff';
  close.style.borderRadius = '6px';
  close.style.cursor = 'pointer';
  close.onclick = function(){ modal.remove(); window.__METEOCONS_TESTER__ = false; };
  modal.appendChild(close);
  document.body.appendChild(modal);
});

5. Como usar
- Defina METEOCONS_STYLE e METEOCONS_COLOR antes de carregar o modal.
- Inclua o script do modal no HTML.
- O modal exibirá todos os ícones do mapeamento, já com o estilo e cor escolhidos.
