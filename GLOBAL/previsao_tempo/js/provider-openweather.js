/**
 * provider-openweather.js — ES5, compatível com Android 7+ (WebKit legado)
 *
 * ADAPTADOR DE FONTE DE DADOS: OpenWeather -> vocabulário Meteocons.
 *
 * Implementa o mesmo contrato de js/provider-cptec.js (leia o cabeçalho
 * daquele arquivo para a explicação completa da arquitetura). Este
 * arquivo NÃO está plugado no index.html por padrão — o provider ativo
 * hoje é o CPTEC. Para usar dados da OpenWeather neste template, troque
 * no index.html:
 *
 *   <script src="js/provider-cptec.js"></script>
 *   -> <script src="js/provider-openweather.js"></script>
 *
 * e ajuste em master.js de onde vem o código bruto (o campo do canal
 * equivalente ao "icon" da API OpenWeather, ex: "10d"), sem tocar em
 * mais nada (meteocons-helpers.js, layout e CSS continuam iguais).
 *
 * A OpenWeather identifica a condição pelo campo "icon" da resposta
 * (weather[0].icon), sempre um código de 2 dígitos + sufixo de período
 * do dia: "d" (dia) ou "n" (noite). Ex: "01d" = céu limpo de dia,
 * "01n" = céu limpo de noite. Tabela oficial de códigos:
 *
 *   01d/01n  clear sky          -> clear-day / clear-night
 *   02d/02n  few clouds         -> partly-cloudy-day / partly-cloudy-night
 *   03d/03n  scattered clouds   -> cloudy
 *   04d/04n  broken clouds      -> overcast-day / overcast-night
 *   09d/09n  shower rain        -> overcast-rain
 *   10d/10n  rain               -> overcast-day-rain / overcast-night-rain
 *   11d/11n  thunderstorm       -> thunderstorms-day-rain / thunderstorms-night-rain
 *   13d/13n  snow               -> snow
 *   50d/50n  mist               -> fog
 *
 * CONTRATO (mesmos nomes de função em todo provider-<fonte>.js):
 *   codigoParaIcone(codigoBruto)      -> { meteocon, descricao }
 *   codigoParaMeteocon(codigoBruto)   -> 'clear-day'
 *   codigoParaDescricao(codigoBruto)  -> 'Céu limpo'
 */

/* ---------- CODIGOS OPENWEATHER (icon) -> METEOCON + DESCRICAO ---------- */
var OPENWEATHER_CODIGOS = {
  '01d': { meteocon: 'clear-day', descricao: 'Céu limpo' },
  '01n': { meteocon: 'clear-night', descricao: 'Céu limpo' },
  '02d': { meteocon: 'partly-cloudy-day', descricao: 'Poucas nuvens' },
  '02n': { meteocon: 'partly-cloudy-night', descricao: 'Poucas nuvens' },
  '03d': { meteocon: 'cloudy', descricao: 'Nuvens dispersas' },
  '03n': { meteocon: 'cloudy', descricao: 'Nuvens dispersas' },
  '04d': { meteocon: 'overcast-day', descricao: 'Nublado' },
  '04n': { meteocon: 'overcast-night', descricao: 'Nublado' },
  '09d': { meteocon: 'overcast-rain', descricao: 'Pancadas de chuva' },
  '09n': { meteocon: 'overcast-rain', descricao: 'Pancadas de chuva' },
  '10d': { meteocon: 'overcast-day-rain', descricao: 'Chuva' },
  '10n': { meteocon: 'overcast-night-rain', descricao: 'Chuva' },
  '11d': { meteocon: 'thunderstorms-day-rain', descricao: 'Trovoada' },
  '11n': { meteocon: 'thunderstorms-night-rain', descricao: 'Trovoada' },
  '13d': { meteocon: 'snow', descricao: 'Neve' },
  '13n': { meteocon: 'snow', descricao: 'Neve' },
  '50d': { meteocon: 'fog', descricao: 'Névoa' },
  '50n': { meteocon: 'fog', descricao: 'Névoa' }
};

function resolverCondicaoOpenWeather(codigoBruto) {
  var chave = (codigoBruto || '').toString().replace(/^\s+|\s+$/g, '').toLowerCase();
  var cond = OPENWEATHER_CODIGOS[chave];
  if (cond) return cond;

  // Aceita vir só o código de 2 dígitos sem sufixo d/n (assume dia).
  if (chave && !/[dn]$/.test(chave)) {
    cond = OPENWEATHER_CODIGOS[chave + 'd'];
    if (cond) return cond;
  }

  return {
    meteocon: 'cloudy',
    descricao: 'Condição de tempo variável.'
  };
}

/* ---------- INTERFACE GENERICA (contrato do provider) ---------- */
/* master.js só deve chamar as 3 funções abaixo. */

function codigoParaIcone(codigoBruto) {
  return resolverCondicaoOpenWeather(codigoBruto);
}

function codigoParaMeteocon(codigoBruto) {
  return resolverCondicaoOpenWeather(codigoBruto).meteocon;
}

function codigoParaDescricao(codigoBruto) {
  return resolverCondicaoOpenWeather(codigoBruto).descricao;
}
