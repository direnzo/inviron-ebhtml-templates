# Tempo no Momento

Template global EdgeContents para exibir a leitura meteorologica atual com video de fundo e patrocinador opcional.

## Dados
- Canal: `D_CLIMA_HGBRASIL`; leitura atual em `C1_D1_DATAARRAY` (JSON).
- Campos: `city.ds_name_cit`, `city.sys_city_cit`, `nr_value_wea`, `nr_icon_wea`, `ds_textmin_wea`, `nr_humiditymin_wea`/`nr_humiditymax_wea`, `nr_windavgvelocity_wea`, `ds_winddirection_wea`, `dt_sunrise_wea` e `dt_sunset_wea`.
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
