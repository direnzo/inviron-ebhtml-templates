# rodape-teste

Template de rodape para EdgeContents (Android 7+, ES5).

## Escopo atual
- Clima: D_CLIMA_CLIMATEMPO_MOMENTO (com fallback D_CLIMA)
- Financeiro: D_CAMBIO com fallback D_AWESOMEAPI
- Fora do ciclo: noticias, mensageria, placar, horoscopo

## Icones de clima
- Biblioteca: Meteocons (monochrome)
- Helper: js/meteocons-helpers.js
- Assets: img/meteocons/monochrome/
- Config: CONFIG_CLIMA em js/config.js

## Arquivos-chave
- index.html
- js/config.js
- js/master.js
- js/modules/modulo-clima.js
- js/modules/modulo-financeiro.js
- css/input.css

## Regras obrigatorias
- ES5 puro (sem let/const/arrow/async)
- Sempre finalizar playlist com loaded() e finished()
- Body em vmin; descendentes em em/%
- Sem gap em flex (usar margem entre irmaos)

## Teste
- URL: http://localhost:12099/FILES/1/index.html
- Nao usar file://

## Observacoes
- Icones legados foram arquivados em img/archive-clima-old/
- Watch CSS ja em execucao no ambiente local
