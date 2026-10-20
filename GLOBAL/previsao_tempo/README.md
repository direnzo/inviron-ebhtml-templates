# Previsao do Tempo (global)

Template EdgeContents para previsao do tempo, compativel com Chromium 78 e WebKit legado.

## Dados
- Canal ativo: `D_CLIMA_HGBRASIL`, com um item e ate tres slots (`C1`/`C2`/`C3`).
- Cada previsao vem em `C{n}_D{n}_DATAARRAY` como JSON em CDATA; `DATE1` a `DATE3` continuam planos.
- Cidade: `city.ds_name_cit`; minima/maxima: `nr_min_wea`/`nr_max_wea`; atual: `nr_value_wea` (D1, se informado).
- Descricao oficial: `ds_textmin_wea`. A temperatura atual aparece junto ao nome da cidade quando disponivel.
- Chuva, vento e UV: `nr_probrain_wea`, `nr_precipitation_wea`, `nr_windavgvelocity_wea`, `ds_winddirection_wea`, `nr_uv_wea`, `ds_uvlevel_wea`.

## Icones
- `meteocons-helpers.js` injeta SVGs locais; `provider-hgbrasil.js` traduz `nr_icon_wea` para o vocabulario Meteocon.
- XML publicado confirma `4` = Tempo nublado e `11` = Chuvas esparsas. Esses valores nao sao o `condition_code` 0-48 da documentacao HG; esse campo nao aparece no XML atual.
- Codigos numericos nao observados preservam a equivalencia legada 1-11; codigo desconhecido usa `not-available`. Descricao oficial continua vindo de `ds_textmin_wea`.
- Para outra fonte, adaptar o parser e trocar o provider; layout e motor de SVG permanecem independentes.

## Operacao
- `js/master.js` trata JSON, rotacao de cidades, renderizacao e ciclo da playlist com watchdog.
- Viewport com largura ou altura abaixo de 300 px exibe um dia por vez, dividindo entre dias validos a duracao total configurada; em 300x300 ou maior, mantem os tres cards.
- No modo de um dia, o icone principal cresce; em faixas, rodapes e layouts compactos, descricao e informacoes secundarias sao ocultadas para priorizar a previsao.
- `js/mock-data.js` representa os codigos confirmados no canal e seu script fica comentado no HTML de producao.
- Providers CPTEC, Climatempo e OpenWeather continuam disponiveis, mas nao estao ativos.
- `js/ebhtml.js` existente: versao 2.0.3. Migracoes de EBHTML exigem branch separada.
- CSS: `npm run dev`. Teste EdgeContents: `http://localhost:12099/FILES/1/index.html`.
