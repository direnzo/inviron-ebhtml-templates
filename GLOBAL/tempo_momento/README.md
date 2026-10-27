# Tempo no Momento

Template global EdgeContents para exibir a leitura meteorologica atual com video de fundo e patrocinador opcional.

## Dados
- Canal: `D_CLIMA_HGBRASIL`; leitura atual em `C1_D1_DATAARRAY` (JSON).
- Campos: `city.ds_name_cit`, `city.sys_city_cit`, `nr_value_wea`, `mm_textpt_wea`, `nr_humiditymin_wea`/`nr_humiditymax_wea`, `nr_windavgvelocity_wea`, `ds_winddirection_wea`, `dt_sunrise_wea` e `dt_sunset_wea`.
- Icone, video e fallback da descricao usam o slug HG Brasil de `mm_textpt_wea` (ex.: `rain`, `clear_night`); a descricao publicada em `ds_textmin_wea` e preservada. `nr_icon_wea` pertence a previsao diaria.
- Umidade mostra um valor ou a faixa min-max. A sensacao termica nao e exibida porque nao consta no registro atual publicado.
- Velocidade e direcao do vento sao independentes; a direcao so aparece quando ha valor publicado.
- `D_SPD` continua opcional e usa o mesmo loader do canal de clima.

## Visualizacao
- Resolucao principal: landscape e portrait; tambem suporta quadrado, ultrawide e faixas.
- Faixas com ate 100 px de altura priorizam cidade, icone e temperatura; detalhes secundarios e rodape sao ocultados.
- Faixas laterais de ate 120 px de largura priorizam cidade, icone e temperatura; descricao, vento, umidade e rodape sao ocultados para evitar texto ilegivel ou cortes.

## Operacao
- `provider-hgbrasil.js` converte os codigos do HG Brasil para os icones Meteocon e os videos locais.
- `js/ebhtml.js` esta na versao 2.0.3; migracoes exigem branch individual.
- Mock de desenvolvimento fica desativado no HTML de producao.
- CSS: `npm run dev`. Teste EdgeContents: `http://localhost:12099/FILES/1/index.html`.

## Validacao do icone atual (2026-10-27)
- Regressao dos slugs, parser, SVGs e video noturno: `node --test scripts/hgbrasil-current-icons.test.js`. Validacao visual/runtime pendente: o slot local esta em previsao_tempo.
- Escopo: catalogo integral de 1.012 formatos, snapshot 2026-10-20; matriz/hash em `.validation/hgbrasil-current-icons-20261027/catalog-matrix-not-run.json`, ainda nao executada. Nenhum `.eh5` gerado nesta correcao.
