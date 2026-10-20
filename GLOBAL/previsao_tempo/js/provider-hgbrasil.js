/* Adaptador HG Brasil: nr_icon_wea legado -> vocabulario Meteocon. */
var HGBRASIL_ICONES_NUMERICOS = {
  '1': { meteocon: 'clear-day', descricao: 'Sol' },
  '2': { meteocon: 'rain', descricao: 'Chuva' },
  '3': { meteocon: 'thunderstorms', descricao: 'Trovoadas' },
  '4': { meteocon: 'cloudy', descricao: 'Tempo nublado' },
  '5': { meteocon: 'mostly-clear-day-rain', descricao: 'Sol e chuva' },
  '6': { meteocon: 'overcast-day', descricao: 'Sol e nuvens' },
  '7': { meteocon: 'snow', descricao: 'Neve' },
  '8': { meteocon: 'extreme-rain', descricao: 'Chuva rapida' },
  '9': { meteocon: 'wind-snow', descricao: 'Geada' },
  '10': { meteocon: 'drizzle', descricao: 'Chuvisco' },
  '11': { meteocon: 'overcast-rain', descricao: 'Chuvas esparsas' },
  '99': { meteocon: 'not-available', descricao: 'Servico nao disponivel' }
};

var HGBRASIL_ICONES_SLUG = {
  storm: 'thunderstorms-rain',
  snow: 'snow',
  rain: 'rain',
  fog: 'fog',
  hail: 'hail',
  cloud: 'cloudy',
  clear_night: 'clear-night',
  cloudly_day: 'partly-cloudy-day',
  cloudly_night: 'partly-cloudy-night',
  clear_day: 'clear-day'
};

function normalizarCodigoHgBrasil(valor) {
  return (valor === null || typeof valor === 'undefined' ? '' : String(valor))
    .replace(/^\s+|\s+$/g, '')
    .toLowerCase();
}

function resolverCondicaoHgBrasil(codigoBruto) {
  var codigo = normalizarCodigoHgBrasil(codigoBruto);
  var slugMeteocon;
  if (HGBRASIL_ICONES_NUMERICOS[codigo]) return HGBRASIL_ICONES_NUMERICOS[codigo];
  slugMeteocon = HGBRASIL_ICONES_SLUG[codigo];
  if (slugMeteocon) return { meteocon: slugMeteocon, descricao: 'Condicao de tempo' };
  return HGBRASIL_ICONES_NUMERICOS['99'];
}

function codigoParaIcone(codigoBruto) {
  return resolverCondicaoHgBrasil(codigoBruto);
}

function codigoParaMeteocon(codigoBruto) {
  return resolverCondicaoHgBrasil(codigoBruto).meteocon;
}

function codigoParaDescricao(codigoBruto) {
  return resolverCondicaoHgBrasil(codigoBruto).descricao;
}