/**
 * provider-cptec.js — ES5, compatível com Android 7+ (WebKit legado)
 *
 * ADAPTADOR DE FONTE DE DADOS: CPTEC/INPE -> vocabulário Meteocons.
 *
 * ARQUITETURA (leia antes de mexer):
 * Este template separa 3 camadas para poder trocar de fonte de dados
 * (CPTEC, Climatempo, OpenWeather, etc.) sem alterar layout nem o motor
 * de ícones:
 *
 *   1. js/meteocons-helpers.js  — motor 100% genérico e universal.
 *      Carrega/injeta SVGs Meteocons, converte UV/vento/direção do vento
 *      em nomes de ícone. NUNCA deve conter código específico de uma
 *      fonte de dados (nenhum "CPTEC", "Climatempo" etc. aqui dentro).
 *
 *   2. js/provider-<fonte>.js  — ESTE arquivo. Só ele conhece o formato
 *      de códigos/siglas da fonte de dados. Traduz o código bruto da
 *      fonte para o vocabulário Meteocons (que já é o "idioma global").
 *      É o ÚNICO lugar que muda ao trocar de fonte de dados.
 *
 *   3. js/master.js — não conhece CPTEC nem nenhuma outra fonte. Só
 *      chama a interface genérica abaixo (codigoParaMeteocon /
 *      codigoParaDescricao / codigoParaIcone).
 *
 * CONTRATO que todo provider-<fonte>.js deve implementar (mesmos nomes
 * de função em todos, isso é o que torna master.js reaproveitável):
 *
 *   codigoParaIcone(codigoBruto)
 *     -> { meteocon: 'clear-day', descricao: 'Céu claro' }
 *
 *   codigoParaMeteocon(codigoBruto)
 *     -> 'clear-day'   (nome de arquivo SVG em img/meteocons/<estilo>/)
 *
 *   codigoParaDescricao(codigoBruto)
 *     -> 'Céu claro'   (texto curto exibido no card)
 *
 * PARA ADICIONAR UMA NOVA FONTE (ex: OpenWeather):
 *   1. Copie este arquivo para js/provider-openweather.js.
 *   2. Troque o mapa interno (OWM usa "id" de condição e/ou código de
 *      ícone tipo "10d") para apontar para nomes válidos em
 *      img/meteocons/<estilo>/*.svg.
 *   3. Implemente as mesmas 3 funções do contrato acima.
 *   4. No index.html, troque o <script src="js/provider-cptec.js">
 *      pelo novo arquivo. Nada mais precisa mudar (master.js, CSS,
 *      layout continuam iguais).
 */

/* ---------- SIGLAS OFICIAIS CPTEC -> METEOCON + DESCRICAO ---------- */
var CPTEC_SIGLAS = {
  'ec': { meteocon: 'overcast-rain', descricao: 'Encoberto com chuvas isoladas' },
  'ci': { meteocon: 'rain', descricao: 'Chuvas isoladas' },
  'c': { meteocon: 'rain', descricao: 'Chuva' },
  'in': { meteocon: 'thunderstorms-rain', descricao: 'Instável' },
  'pp': { meteocon: 'overcast-rain', descricao: 'Possibilidade de pancadas de chuva' },
  'cm': { meteocon: 'overcast-day-rain', descricao: 'Chuva pela manhã' },
  'cn': { meteocon: 'overcast-night-rain', descricao: 'Chuva à noite' },
  'pt': { meteocon: 'thunderstorms-day-rain', descricao: 'Pancadas de chuva à tarde' },
  'pm': { meteocon: 'thunderstorms-day-rain', descricao: 'Pancadas de chuva pela manhã' },
  'np': { meteocon: 'overcast-rain', descricao: 'Nublado e pancadas de chuva' },
  'pc': { meteocon: 'rain', descricao: 'Pancadas de chuva' },
  'pn': { meteocon: 'partly-cloudy-day', descricao: 'Parcialmente nublado' },
  'cv': { meteocon: 'drizzle', descricao: 'Chuvisco' },
  'ch': { meteocon: 'extreme-rain', descricao: 'Chuvoso' },
  't': { meteocon: 'thunderstorms', descricao: 'Tempestade' },
  'ps': { meteocon: 'clear-day', descricao: 'Predomínio de sol' },
  'e': { meteocon: 'overcast', descricao: 'Encoberto' },
  'n': { meteocon: 'cloudy', descricao: 'Nublado' },
  'cl': { meteocon: 'clear-day', descricao: 'Céu claro' },
  'nv': { meteocon: 'fog', descricao: 'Nevoeiro' },
  'g': { meteocon: 'wind-snow', descricao: 'Geada' },
  'ne': { meteocon: 'snow', descricao: 'Neve' },
  'nd': { meteocon: 'not-available', descricao: 'Não definido' },
  'pnt': { meteocon: 'thunderstorms-night-rain', descricao: 'Pancadas de chuva à noite' },
  'psc': { meteocon: 'overcast-rain', descricao: 'Possibilidade de chuva' },
  'pcm': { meteocon: 'overcast-day-rain', descricao: 'Possibilidade de chuva pela manhã' },
  'pct': { meteocon: 'overcast-day-rain', descricao: 'Possibilidade de chuva à tarde' },
  'pcn': { meteocon: 'overcast-night-rain', descricao: 'Possibilidade de chuva à noite' },
  'npt': { meteocon: 'thunderstorms-rain', descricao: 'Nublado com pancadas à tarde' },
  'npn': { meteocon: 'thunderstorms-night-rain', descricao: 'Nublado com pancadas à noite' },
  'ncn': { meteocon: 'overcast-night-rain', descricao: 'Nublado com possibilidade de chuva à noite' },
  'nct': { meteocon: 'overcast-day-rain', descricao: 'Nublado com possibilidade de chuva à tarde' },
  'ncm': { meteocon: 'overcast-day-rain', descricao: 'Nublado com possibilidade de chuva pela manhã' },
  'npm': { meteocon: 'thunderstorms-day-rain', descricao: 'Nublado com pancadas pela manhã' },
  'npp': { meteocon: 'overcast-rain', descricao: 'Nublado com possibilidade de chuva' },
  'vn': { meteocon: 'partly-cloudy-day', descricao: 'Variação de nebulosidade' },
  'ct': { meteocon: 'overcast-day-rain', descricao: 'Chuva à tarde' },
  'ppn': { meteocon: 'overcast-night-rain', descricao: 'Possibilidade de pancadas de chuva à noite' },
  'ppt': { meteocon: 'overcast-day-rain', descricao: 'Possibilidade de pancadas de chuva à tarde' },
  'ppm': { meteocon: 'overcast-day-rain', descricao: 'Possibilidade de pancadas de chuva pela manhã' }
};

/* Tabela padrão (fallback) por código NUMÉRICO inteiro do campo ICO.
 * Usada apenas quando o campo TEXTPT vem vazio no canal D_CLIMA — nesse
 * caso o CPTEC manda só o código inteiro abaixo em vez da sigla oficial.
 * '99' é o código de default/indefinido. */
var CPTEC_CODIGO_NUMERICO = {
  '1':  { meteocon: 'clear-day', descricao: 'Sol' },
  '2':  { meteocon: 'rain', descricao: 'Chuva' },
  '3':  { meteocon: 'thunderstorms', descricao: 'Trovoadas' },
  '4':  { meteocon: 'cloudy', descricao: 'Nublado' },
  '5':  { meteocon: 'mostly-clear-day-rain', descricao: 'Sol e chuva' },
  '6':  { meteocon: 'overcast-day', descricao: 'Sol e nuvens (encoberto)' },
  '7':  { meteocon: 'snow', descricao: 'Neve' },
  '8':  { meteocon: 'extreme-rain', descricao: 'Chuva rápida' },
  '9':  { meteocon: 'wind-snow', descricao: 'Geada' },
  '10': { meteocon: 'drizzle', descricao: 'Chuvisco' },
  '11': { meteocon: 'overcast-rain', descricao: 'Nuvem e chuvas' },
  '99': { meteocon: 'not-available', descricao: 'Condição de tempo variável.' }
};

function normalizarIconCptec(valor) {
  var v = (valor || '').toString();
  v = v.replace(/^\s+|\s+$/g, '').toLowerCase();
  v = v.replace(/_/g, '-').replace(/\s+/g, '-');
  v = v.replace(/[áàâãä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòôõö]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/ç/g, 'c');
  return v;
}

function resolverCondicaoCptec(iconRaw) {
  var chave = normalizarIconCptec(iconRaw);

  // Código puramente numérico = veio do fallback do campo ICO
  // (TEXTPT vazio); usa a tabela de default, nunca as siglas de texto.
  if (/^[0-9]+$/.test(chave)) {
    return CPTEC_CODIGO_NUMERICO[chave] || CPTEC_CODIGO_NUMERICO['99'];
  }

  var cond = CPTEC_SIGLAS[chave];
  if (cond) return cond;

  // Se vier diretamente nome de arquivo Meteocon, usa como está.
  if (chave) {
    return {
      meteocon: chave,
      descricao: 'Condição de tempo variável.'
    };
  }

  return CPTEC_CODIGO_NUMERICO['99'];
}

/* ---------- INTERFACE GENERICA (contrato do provider) ---------- */
/* master.js só deve chamar as 3 funções abaixo. */

function codigoParaIcone(codigoBruto) {
  return resolverCondicaoCptec(codigoBruto);
}

function codigoParaMeteocon(codigoBruto) {
  return resolverCondicaoCptec(codigoBruto).meteocon;
}

function codigoParaDescricao(codigoBruto) {
  return resolverCondicaoCptec(codigoBruto).descricao;
}
