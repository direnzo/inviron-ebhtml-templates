var HGBRASIL_MOMENTO_CONDICOES = {
  '1': { meteocon: 'clear-day', video: '1', descricao: 'Sol' },
  '2': { meteocon: 'rain', video: '4', descricao: 'Chuva' },
  '3': { meteocon: 'thunderstorms', video: '6', descricao: 'Trovoadas' },
  '4': { meteocon: 'cloudy', video: '7', descricao: 'Tempo nublado' },
  '5': { meteocon: 'mostly-clear-day-rain', video: '2r', descricao: 'Sol e chuva' },
  '6': { meteocon: 'overcast-day', video: '2', descricao: 'Sol e nuvens' },
  '7': { meteocon: 'snow', video: '8', descricao: 'Neve' },
  '8': { meteocon: 'extreme-rain', video: '5', descricao: 'Chuva forte' },
  '9': { meteocon: 'wind-snow', video: '8', descricao: 'Geada' },
  '10': { meteocon: 'drizzle', video: '2r', descricao: 'Chuvisco' },
  '11': { meteocon: 'overcast-rain', video: '4', descricao: 'Chuvas esparsas' },
  '99': { meteocon: 'not-available', video: '3', descricao: 'Condicao indisponivel' }
};

var HGBRASIL_MOMENTO_SLUGS = {
  storm: { meteocon: 'thunderstorms-rain', video: '6', descricao: 'Trovoadas' },
  snow: { meteocon: 'snow', video: '8', descricao: 'Neve' },
  rain: { meteocon: 'rain', video: '4', descricao: 'Chuva' },
  fog: { meteocon: 'fog', video: '9', descricao: 'Nevoeiro' },
  hail: { meteocon: 'hail', video: '5', descricao: 'Granizo' },
  cloud: { meteocon: 'cloudy', video: '7', descricao: 'Tempo nublado' },
  clear_night: { meteocon: 'clear-night', video: '1', descricao: 'Céu limpo', night: true },
  cloudly_day: { meteocon: 'partly-cloudy-day', video: '2', descricao: 'Sol e nuvens' },
  cloudly_night: { meteocon: 'partly-cloudy-night', video: '2', descricao: 'Sol e nuvens', night: true },
  clear_day: { meteocon: 'clear-day', video: '1', descricao: 'Sol' }
};

function normalizarCodigoHgBrasilMomento(valor) {
  return (valor === null || typeof valor === 'undefined' ? '' : String(valor))
    .replace(/^\s+|\s+$/g, '')
    .toLowerCase();
}

function resolverCondicaoHgBrasilMomento(valor) {
  var codigo = normalizarCodigoHgBrasilMomento(valor);
  return HGBRASIL_MOMENTO_CONDICOES[codigo] || HGBRASIL_MOMENTO_SLUGS[codigo] || HGBRASIL_MOMENTO_CONDICOES['99'];
}

function hgBrasilMomentoParaMeteocon(valor) {
  return resolverCondicaoHgBrasilMomento(valor).meteocon;
}

function hgBrasilMomentoParaVideo(valor, nascerDoSol, porDoSol) {
  var condicao = resolverCondicaoHgBrasilMomento(valor);
  var codigoVideo = condicao.video;
  var nascer = parseInt(nascerDoSol, 10);
  var por = parseInt(porDoSol, 10);
  var agora = Math.floor(Date.now() / 1000);
  if (condicao.night || (!isNaN(nascer) && !isNaN(por) && (agora < nascer || agora >= por))) {
    codigoVideo += 'n';
  }
  return codigoVideo;
}
