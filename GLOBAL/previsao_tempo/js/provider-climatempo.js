/**
 * provider-climatempo.js — ES5, compatível com Android 7+ (WebKit legado)
 *
 * ADAPTADOR DE FONTE DE DADOS: Climatempo -> vocabulário Meteocons.
 *
 * Implementa o mesmo contrato de js/provider-cptec.js (leia o cabeçalho
 * daquele arquivo para a explicação completa da arquitetura). Este
 * arquivo NÃO está plugado no index.html por padrão — o provider ativo
 * hoje é o CPTEC. Para usar dados da Climatempo neste template, troque
 * no index.html:
 *
 *   <script src="js/provider-cptec.js"></script>
 *   -> <script src="js/provider-climatempo.js"></script>
 *
 * e ajuste em master.js de onde vem o código bruto (ex: campo do canal
 * D_CLIMA equivalente ao "TEXTPT" do CPTEC), sem tocar em mais nada
 * (meteocons-helpers.js, layout e CSS continuam iguais).
 *
 * CONTRATO (mesmos nomes de função em todo provider-<fonte>.js):
 *   codigoParaIcone(codigoBruto)      -> { meteocon, descricao }
 *   codigoParaMeteocon(codigoBruto)   -> 'clear-day'
 *   codigoParaDescricao(codigoBruto)  -> 'Sol'
 */

/* ---------- CODIGOS CLIMATEMPO -> METEOCON + DESCRICAO ---------- */
var CLIMATEMPO_CODIGOS = {
  '1':   { meteocon: 'clear-day', descricao: 'Sol' },
  '1n':  { meteocon: 'clear-night', descricao: 'Noite sem nuvens' },
  '2':   { meteocon: 'mostly-clear-day', descricao: 'Sol com algumas nuvens' },
  '2r':  { meteocon: 'overcast-day', descricao: 'Sol com muitas nuvens' },
  '2n':  { meteocon: 'mostly-clear-night', descricao: 'Noite com algumas nuvens' },
  '2rn': { meteocon: 'overcast-night', descricao: 'Noite com muitas nuvens' },
  '3':   { meteocon: 'overcast-drizzle', descricao: 'Nublado' },
  '3n':  { meteocon: 'overcast-drizzle', descricao: 'Nublado' },
  '3tm': { meteocon: 'cloudy', descricao: 'Nublado' },
  '4':   { meteocon: 'mostly-clear-day-rain', descricao: 'Sol e chuva' },
  '4r':  { meteocon: 'extreme-day-rain', descricao: 'Sol com muitas nuvens e chuva' },
  '4n':  { meteocon: 'mostly-clear-night-rain', descricao: 'Noite chuvosa' },
  '4rn': { meteocon: 'extreme-night-rain', descricao: 'Noite nublada e chuvosa' },
  '4t':  { meteocon: 'thunderstorms-day-rain', descricao: 'Sol entre nuvens e pancadas de chuva, com trovoadas' },
  '4tn': { meteocon: 'thunderstorms-night-rain', descricao: 'Pancadas de chuva durante a noite' },
  '5':   { meteocon: 'extreme-rain', descricao: 'Chuvoso' },
  '5n':  { meteocon: 'extreme-rain', descricao: 'Chuvoso' },
  '6':   { meteocon: 'extreme-thunderstorms-rain', descricao: 'Chuva e trovoadas' },
  '6n':  { meteocon: 'extreme-thunderstorms-rain', descricao: 'Chuva e trovoadas' },
  '7':   { meteocon: 'wind-snow', descricao: 'Geada' },
  '7n':  { meteocon: 'wind-snow', descricao: 'Geada' },
  '8':   { meteocon: 'snow', descricao: 'Neve' },
  '8n':  { meteocon: 'mostly-clear-night-snow', descricao: 'Neve' },
  '9':   { meteocon: 'mostly-clear-day-fog', descricao: 'Nevoeiro' },
  '9n':  { meteocon: 'mostly-clear-night-fog', descricao: 'Nevoeiro' },
  '10':  { meteocon: 'drizzle', descricao: 'Chuva intensa durante o dia' },
  '11':  { meteocon: 'overcast-rain', descricao: 'Nuvens e chuva' }
};

function resolverCondicaoClimatempo(codigoBruto) {
  var chave = (codigoBruto || '').toString().replace(/^\s+|\s+$/g, '');
  var cond = CLIMATEMPO_CODIGOS[chave];
  if (cond) return cond;

  return {
    meteocon: 'cloudy',
    descricao: 'Condição de tempo variável.'
  };
}

/* ---------- INTERFACE GENERICA (contrato do provider) ---------- */
/* master.js só deve chamar as 3 funções abaixo. */

function codigoParaIcone(codigoBruto) {
  return resolverCondicaoClimatempo(codigoBruto);
}

function codigoParaMeteocon(codigoBruto) {
  return resolverCondicaoClimatempo(codigoBruto).meteocon;
}

function codigoParaDescricao(codigoBruto) {
  return resolverCondicaoClimatempo(codigoBruto).descricao;
}
