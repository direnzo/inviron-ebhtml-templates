# CCXP26 - Fotos e Autógrafos (1280x512)

Plano: `../docs/PLANO-FOTOS-AUTOGRAFOS.md`. LED horizontal, sem rodapé/relógio; duas pessoas por página.
Escopo herdado: somente 1280x512. Base visual: `layout-fotos-autografos.json` e `img/fundo_FA.png`.

## Dados e seleção

- Dataset `D_CCXP_FEA`: `TITULO` artista, `CATEGORY` modalidade, `FOTO`, `TEXTO` data `DD/MM`, `TEXTO2` horário e `TEXTO3` esgotado.
- `CONFIG.anoEvento` define o ano (2026); fuso `-03:00`. `DT_BEGIN`/`DT_END` são validade do cadastro, não horário da sessão.
- Sessões futuras ou em andamento, de qualquer dia, são exibidas; sessões encerradas são removidas. Em `TEXTO2`, o primeiro horário inicia a sessão e o último encerra; hora única usa duração padrão de 60 min.
- Artista é `TITULO` normalizado; modalidades são agrupadas e ordenadas por horário. Desconhecidas mantêm o próprio rótulo; acima de 5 modalidades, exibe as 5 primeiras.
- Horários são sempre exibidos como `HHhMM - HHhMM`, com zero à esquerda, `h` minúsculo e hífen; uma hora isolada usa a duração padrão. Valores que já chegam nesse formato permanecem iguais. `TEXTO3 = 'sim'` marca esgotado.

## Exibição

- Fluxo: intro 5 s, páginas de 2 artistas por 10 s cada, encerramento 11 s. Página única centraliza o bloco.
- Até 3 modalidades usa variante grande; de 4 a 5, compacta. Título ocupa até 2 linhas, com autofit e reticências limitadas.
- Sem dados, erro ou timeout: chamar `loaded()` e depois `finished()` uma vez, sem desenhar conteúdo.
- Arquivos principais: `js/config.js`, `js/fea.js` (lógica pura), `js/master.js` (player), `js/programacao.js` (data/fuso), `js/ebhtml.js` 2.0.7.
- Vídeos `videos/fa_intro.mp4` e `videos/fa_outro.mp4` são assets fora do Git; fontes de produção em `Materiais/03_Template-F&A/Animados`.

## Validação

- Lógica: `node --test CLIENTES/CCXP/2026/tests/fea.test.js`.
- Em 2026-10-27, endpoint real retornou 11 registros; a seleção nova produziu 11 sessões, 6 artistas e 0 descartes.
- Slot EBHTML conferido em `http://localhost:12099/FILES/1/index.html`; a cópia servida contém o mapeamento `TEXTO`.
- Ainda não homologado no LED nem no player quadro a quadro; testar renderização, vídeos e pacote `.eh5` antes da entrega final.
