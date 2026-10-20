var HORA_CERTA_HG_BRASIL_ICONES = {
    '1': 'clear-day',
    '2': 'rain',
    '3': 'thunderstorms',
    '4': 'cloudy',
    '5': 'mostly-clear-day-rain',
    '6': 'overcast-day',
    '7': 'snow',
    '8': 'extreme-rain',
    '9': 'wind-snow',
    '10': 'drizzle',
    '11': 'overcast-rain',
    '99': 'not-available',
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

function horaCertaHgBrasilParaMeteocon(codigo) {
    var chave = codigo === null || typeof codigo === 'undefined'
        ? ''
        : String(codigo).replace(/^\s+|\s+$/g, '').toLowerCase();
    return HORA_CERTA_HG_BRASIL_ICONES[chave] || HORA_CERTA_HG_BRASIL_ICONES['99'];
}
