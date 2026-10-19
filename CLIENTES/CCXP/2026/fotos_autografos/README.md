# CCXP26 - Fotos e Autógrafos (painel LED 1280x512)

Plano: `../docs/PLANO-FOTOS-AUTOGRAFOS.md`. Base de código: `../destaque_dia` e `../programacao_palco`.
Tela horizontal (LED P3.9): sem rodapé e sem relógio; 2 blocos de artista por página.

## Estado (2026-10-14)

- Pronto: lógica pura + 19 testes, player (intro → páginas de 2 artistas → encerramento), animação
  em camadas com bloco esquerdo e direito escalonados, variantes grande/compacta, selo "esgotado"
  (placeholder), mock com 19 cenários, layout com as medidas de `layout-fotos-autografos.json`.
- Conferido no Chromium headless com o mock (vídeos fora do ar para capturar o layout): 1 a 5
  modalidades, esgotado, título de 1 e 2 linhas, título cortado com `...`, palavra longa, rótulo
  longo (encolhe até 60% e corta), foto ausente/quebrada, modalidade desconhecida; `loaded()` antes
  de `finished()` (uma vez) em vazio, erro, só encerrado, só amanhã, inválido, um artista e dia cheio.
- **Não** conferido: dataset real (`D_CCXP_FEA` em 2026), `ebcliente4`/LED, a animação quadro a quadro
  (o headless captura estados estáticos; use `?rapido=1`) e a reprodução dos vídeos (neste Chromium os
  vídeos terminam pelo watchdog, então só a rota de proteção foi exercitada).

## Arquivos

`js/config.js` ajustes (tempos, posições, cores, campos, rótulos) | `js/programacao.js` datas/fuso
(cópia da programação) | `js/fea.js` lógica pura | `js/master.js` player | `js/mock-data.js` cenários
locais (script desativado no HTML) | `js/ebhtml.js` 2.0.7 | `img/fundo_FA.png` fundo fixo (já com logos F&A +
Heineken 0.0, CCXP26 e formas).
Vídeos (`videos/fa_intro|fa_outro.mp4`, 1280x512, 5 s e 11 s) ficam fora do Git (`*.mp4`): copiar de
`Materiais/03_Template-F&A/Animados` (`F&A_intro.mp4`, `F&A_outro.mp4`).

## Regras

- Cada registro do dataset é uma **sessão** (artista + modalidade + `DT_BEGIN`/`DT_END`). Entram só
  as que **começam hoje** (dia civil em -03:00) e ainda não terminaram (`DT_END > agora`).
- Artista = `TITULO` sem acento/caixa/espaços extras (não há id no dataset). Artista sem sessão
  restante sai. Ordem alfabética sem acento; sessões do artista por horário.
- 2 artistas por página, 10 s por página (`tempos.pagina`). Página com 1 artista: bloco **centralizado**
  na tela (`centralizarUnico`), medido pelo conteúdo real (foto, título e horários).
- Variante por quantidade de modalidades: até 3 grande (38,6 / 46,3 px); 4 a 5 compacta (25,0 / 30,0 px).
  Mais de 5: as 5 primeiras (por horário).
- Título: caixa alta, até 2 linhas (43,5 px, entrelinha 38,1) e `...` acima disso; 1 linha fica na
  linha de base de baixo (junto da foto).
- Horário como 2025 (`horarioFonte: 'texto'`): `TEXTO2` com `:` → `h` ("12:00 às 13:00" → `12h00 às 13h00`);
  vazio cai em `DT_BEGIN - DT_END` (`11h25 - 12h00`; sem `DT_END` válido só o início, duração padrão de
  60 min para o filtro). `horarioFonte: 'periodo'` usa sempre `DT_BEGIN - DT_END`.
- Modalidade desconhecida (ou vazia) nunca descarta: usa o próprio texto de `CATEGORY` como rótulo.
- Esgotado: `TEXTO3 = 'sim'`; selo vermelho `#F60000` a -7,84° sobre o horário da linha.
- Sem dados, erro ou timeout: `loaded()` + `finished()` em ~100 ms, sem desenhar.
- Sequência: intro 5 s → N páginas × 10 s → encerramento 11 s (1 página = 26 s; 5 = 66 s).

## Decisões provisórias (perguntas em aberto do plano, seção 8)

| # | Pergunta | Adotado (em `config.js`) |
|---|---|---|
| 1 | Variante grande vs compacta | **confirmado**: `limiteGrande: 3` (até 3 grande, 4-5 compacta) |
| 2 | Meet&Greet como 6ª modalidade | **confirmado**: modalidade à parte (rótulo mapeado); o layout comporta 5 linhas por artista (`maxModalidades`) |
| 3 | Página com 1 artista | **confirmado**: centralizado (`centralizarUnico`) |
| 4 | Horário | **como 2025**: texto de `TEXTO2` (`horarioFonte`), fallback no período; ainda a confirmar |
| 5 | Tempo por página | **confirmado** 10 000 ms, ajustável em `tempos.pagina` |
| 6 | Campo de esgotado | **confirmado**: `TEXTO3 === 'sim'` (`campos.esgotado`, `esgotadoValor`) |
| 7 | Nomes de `CATEGORY` | **confirmado**: tabela `modalidades` (singular/plural); desconhecido = texto |
| 8 | Arte do selo | `img/selo.png` (103x22), rotação -7,8° anti-horária por CSS |

## Escolhas de layout a confirmar

- **Fundo (offset):** `fundo_FA.png` tem 1281x513 (prancheta fracionária): coluna 0 com alfa 25% e
  linha 0 com 50%. Posicionado em `-1, -1` (`fundoX/fundoY`), como o destaque do dia; o resíduo é
  menor que 1 px. Conferir contra o vídeo de abertura no LED.
- **Posições dos blocos:** bloco direito = esquerdo + 615,953 px. Os rótulos usam o x medido de cada
  variante (391,3 compacta / 391,9 grande); horários 390,2.
- Na variante grande com 1 ou 2 linhas a lista fica no alto (primeiras linhas de base do modelo).
- Horário em texto ("12h00 às 13h00") é mais largo que o período; rótulos e horários encolhem até 60%
  dentro de 270 px.
- Largura máxima do título 540 px e de rótulo/horário 270 px (provisórias; o modelo só mostra um exemplo).

## Teste

- Lógica: `node --test CLIENTES/CCXP/2026/tests/fea.test.js` (Node 22 não aceita a pasta).
- Player: servir esta pasta e abrir `index.html`; o EBHTML real carrega os dados do canal.
  Para voltar aos cenários locais, reative o script `js/mock-data.js`.
- Mock (padrão `dia`: 10 artistas): `?horario=periodo`, `?cenario=um|dois|tres|quatro|muitos|modalidades|cinco|tres3|
  esgotado|textos|semFoto|invalido|desconhecida|encerrado|amanha|vazio|erro|evento`, `&pular=N`
  (descarta os N primeiros artistas, para ver páginas seguintes), `&rapido=1` (deslize sem espera:
  capturas determinísticas), `&hora=14:40`, `&agora=ISO-8601`. `window.__textos` mostra o ajuste de
  cada título; `window.__calls`, `loaded()`/`finished()`.
- Captura: Chromium headless com `--window-size=1280,512 --screenshot` e um servidor estático fora
  desta pasta; para ver só o layout, servir com 404 nos `.mp4`.

## CSS e pacote

- `npm run build` (Tailwind global) gera `css/master.css`. Tailwind não está instalado nesta máquina:
  as regras novas (fonte do texto, borda da foto, foto ausente) estão em `css/input.css` e foram
  replicadas à mão em `css/master.css`; `.w-[1280px]` e `.h-[512px]` substituem 1080/1920.
- Antes do `.eh5`: remover o script do mock, `CONFIG.debug = false`,
  excluir `mock/`, incluir só `fundo_FA.png`, os 2 vídeos e a fonte.

## Pendências

- Confirmar o dataset `D_CCXP_FEA` (hoje vazio no player), os campos e a pergunta 4 (horário).
- Teste no `ebcliente4` real, no LED, e reabrir o `.eh5` (fase 5 do plano).
