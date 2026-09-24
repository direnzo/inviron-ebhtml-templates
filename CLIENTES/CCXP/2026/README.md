# CCXP 2026 - Digital Signage

Status: preparação concluída; aguardando briefing, artes, vídeos e dados reais.

## Escopo previsto

- Programação por palco: rolando agora, daqui a pouco e ainda hoje.
- Destaques do dia, com ou sem ticker.
- Fotos e autógrafos, incluindo modalidades e status de esgotado.
- Ticker informativo e relógio/identidade por área.
- Variantes por configuração; não duplicar a lógica para cada palco.

## Materiais pendentes

- Mapa de telas: local, player, resolução, orientação e template associado.
- Versão do player, sistema, Chromium, codecs, autoplay e aceleração gráfica.
- Artes abertas empacotadas, PNG de referência e áreas seguras em pixels.
- Fontes licenciadas, logos, fundos, máscaras, imagens e vídeos finais.
- XML/JSON real de cada dataset, aliases, filtros e frequência de atualização.
- Timezone, relógio de referência e política para alterações durante o evento.
- Duração de intro, cards, listas, ticker, outro e item na playlist.
- Política para dado vazio, inválido, atrasado, cancelado ou sem imagem.

## Contratos preliminares

- `D_CCXP_PALCOS`: `CATEGORY`, `TITULO`, `TEXTO`, `TEXTO2`, `FOTO`, `DATE`, `DT_END`, `DT_UPDATE`.
- `D_CCXP_DESTAQUES`: base de palcos; confirmar marcador de destaque em `TEXTO2`.
- `D_CCXP_FEA`: participante, data, modalidade, horário, esgotado e foto.
- `D_CCXP_TICKER`: título e foto opcional.

## Regras de preparação

- Todo template nasce de `_template-base` com EBHTML 2.0.7 canônico.
- Um `CONFIG` concentra dataset, palco, identidade, timing, layout e fallbacks.
- Usar somente a API pública `loader.data()`/`loader.datalist()`.
- Todo caminho assíncrono chama `finished()` exatamente uma vez.
- Testar somente em `http://localhost:12099/FILES/1/index.html`.
- O pacote `.eh5` deve conter somente arquivos necessários ao runtime.

## Compatibilidade

O projeto não precisa suportar os players antigos. A sintaxe JavaScript e os codecs
serão definidos após registrar a versão mínima real do runtime. Até essa confirmação,
permanece a regra global ES5 do repositório; não presumir suporte por ser máquina nova.