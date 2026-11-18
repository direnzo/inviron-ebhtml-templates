# CCXP26 - Fotos e Autógrafos (1280x512)

Plano: `../docs/PLANO-FOTOS-AUTOGRAFOS.md`. LED horizontal, sem rodapé/relógio; duas pessoas por página.
Escopo herdado: somente 1280x512 (`explicit`; snapshot 2026-10-20). Base visual: `layout-fotos-autografos.json` e `img/fundo_FA.png`.

## Dados e seleção

- Dataset `D_CCXP_FEA`: `TITULO` artista, `CATEGORY` modalidade, `FOTO`, `TEXTO` data `DD/MM`, `TEXTO2` horário e `TEXTO3` esgotado.
- `CONFIG.anoEvento` define o ano (2026); fuso `-03:00`. `DT_BEGIN`/`DT_END` são validade do cadastro, não horário da sessão.
- Sessões futuras ou em andamento, de qualquer dia, são exibidas; sessões encerradas são removidas. Em `TEXTO2`, o primeiro horário inicia a sessão e o último encerra; hora única usa duração padrão de 60 min.
- Artista é `TITULO` normalizado; modalidades são agrupadas e ordenadas por horário. Desconhecidas mantêm o próprio rótulo; acima de 5 modalidades, exibe as 5 primeiras.
- Horários exibem literalmente `TEXTO2`, sem padronizar, completar ou remover observações; cálculos de início/fim continuam independentes. `TEXTO3 = 'sim'` marca esgotado.

## Exibição

- Fluxo: intro 5 s, páginas de 2 artistas por 10 s cada, encerramento 11 s. Página única centraliza o bloco.
- Até 3 modalidades usa variante grande; de 4 a 5, compacta. Título ocupa até 2 linhas, com autofit e reticências limitadas.
- Duas colunas: margens externas equilibradas; rótulo e horário compartilham limite de 240 px.
- Rótulo e horário inteiros em uma linha, sem corte nem reticências: medição fracionária e autofit (10 passos), com margem de 1 px nos 240 px disponíveis; no mínimo de 1 px, comprime horizontalmente se necessário. Textos extremos exigem revisão de legibilidade.
- Selo esgotado: contornos vetoriais da arte original em SVG inline, carregado uma vez; PNG original como fallback, com aviso no console.
- Sem dados, erro ou timeout: chamar `loaded()` e depois `finished()` uma vez, sem desenhar conteúdo.
- Arquivos principais: `js/config.js`, `js/fea.js` (lógica pura), `js/master.js` (player), `js/programacao.js` (data/fuso), `js/ebhtml.js` 2.0.7.
- Vídeos `videos/fa_intro.mp4` e `videos/fa_outro.mp4` são assets fora do Git; fontes de produção em `Materiais/03_Template-F&A/Animados`.

## Validação

- Testes: `node --test CLIENTES/CCXP/2026/tests/fea.test.js CLIENTES/CCXP/2026/tests/fea-texto.test.js`.
- Ajuste de colunas: posições originais deixavam cerca de 70 px à esquerda e 34 px após a área dos horários à direita; regressão verifica margens e limites nas variantes grande/compacta. Chromium no slot real, 1280x512 com Billy Boyd e Christopher Lloyd: fonte/fotos carregadas e horários inteiros; revisão no LED e runtime alvo pendentes.
- Correção dos rótulos: o ajuste anterior usava overflow com reticências; aplicar o mesmo autofit integral dos horários evita o corte. Regressão no teste acima cobre as duas variantes; Chromium no slot real exibiu "Foto com até 2 pessoas" integral em 1280x512.
- Selo: PNG de 103x22 ampliado e rotacionado perdia definição; SVG preserva posição/rotação. Em 1280x512, Chromium no slot real exibiu o vetor; falha HTTP simulada usou PNG. LED e runtime alvo pendentes.
- Entrega de 2026-11-18: 42 testes focados passaram; `.eh5` autorizado reaberto e conferido (13 arquivos, hashes iguais às fontes, EBHTML canônico, sem mock/tooling).
- `npm test`: regressão CCXP passou; gate geral falhou em 6 testes de `populari-noticias-10s`, fora deste ajuste.
- Em 2026-10-28, o ajuste anterior falhou em teste real (reticências). Correção: 12 casos simulados de largura/escala passaram; seis casos no Chromium em 1280x512, nas duas variantes, preservaram o texto e couberam sem ocultação, com fonte carregada e script novo servido.
- Entrega em 2026-10-28: 35 testes focados passaram; `_EH5/ccxp26_fotos_autografos.eh5` gerado com autorização, reaberto e conferido (12 arquivos, hashes iguais às fontes, EBHTML canônico, sem mocks/tooling).
- Em 2026-10-27, endpoint real retornou 11 registros; a seleção nova produziu 11 sessões, 6 artistas e 0 descartes.
- Slot EBHTML conferido em `http://localhost:12099/FILES/1/index.html`; a cópia servida contém o mapeamento `TEXTO`.
- Ainda não homologado no LED nem no player quadro a quadro; testar renderização, vídeos e pacote `.eh5` antes da entrega final.
- Não gerar nem atualizar o `.eh5` sem confirmação explícita do responsável.
