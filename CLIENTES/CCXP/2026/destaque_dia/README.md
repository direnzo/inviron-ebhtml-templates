# CCXP26 - Destaque do Dia (Totem TV 1080x1920)

Um pacote para os 6 palcos: cada slide usa o fundo e as cores do palco do próprio destaque
(`CATEGORY`). Plano: `../docs/PLANO-DESTAQUE-DIA.md`. Base de código: `../programacao_palco`.

## Estado (2026-10-14)

- Pronto: lógica pura + 16 testes, player (intro → 1 slide por destaque → encerramento),
  animação em camadas, mock com 15 cenários, layout com as medidas de `layout-destaques.json`.
- Conferido no Chromium headless com o mock (vídeos tocam; o layout foi capturado sem vídeo):
  layout em 5 dos 6 palcos (Omni não capturado), descrição cortada com `...`, foto ausente, palco desconhecido, limite de 6 slides,
  ordem `loaded()` → `finished()` nos cenários vazio, sem marcador, erro e normal.
- **Não** conferido: dataset real (`D_CCXP_DESTAQUES` em 2026) e `ebcliente4`; a animação de
  transição quadro a quadro (o headless captura só estados estáticos).

## Arquivos

`js/config.js` ajustes (tempos, posições, cores por palco, marcador, limite) |
`js/programacao.js` datas/fuso (cópia da programação) | `js/destaques.js` lógica pura |
`js/master.js` player | `js/mock-data.js` mock (desligar em produção) | `js/ebhtml.js` 2.0.7.
Vídeos (`videos/destaques_intro|outro.mp4`) ficam fora do Git (`*.mp4`): copiar de
`Materiais/02_Template-Destaque-Dia/Animados`.

## Regras

- Entram só registros com `TEXTO2 === CONFIG.marcador` ('1') que **começam hoje** (dia civil em
  -03:00) e ainda não terminaram (`DT_END > agora`, data completa). Todos os palcos juntos.
- Ordem cronológica; até `CONFIG.maxDestaques` (6) slides; duplicado (título + início), sem
  título e data inválida são descartados. Foto ausente = bloco na cor do palco.
- Palco desconhecido: fundo liso `#1A1A1A`, horário `#FFC800` (sem arte, para não mostrar logo de outro palco).
- Sem destaque, erro ou timeout: `loaded()` + `finished()` em ~100 ms, sem desenhar.
- Sequência: intro 3 s → N × 6 s → encerramento 11 s (2 destaques = 26 s; 6 = 50 s).
- Descrição: 3 linhas, 75 px / 74,025 px, sem encolher; acima disso corta com `...`.

## Decisões provisórias (perguntas em aberto do plano)

| # | Pergunta | Adotado (em `config.js`) |
|---|---|---|
| 1 | Dataset e marcador | `D_CCXP_DESTAQUES` + `TEXTO2 = '1'` (`marcador`) |
| 2 | Quantos por dia | 6 (`maxDestaques`; 0 = sem limite) |
| 3 | Duração do slide | 6000 ms (`tempos.destaque`) |

## Teste

- Lógica: `node --test CLIENTES/CCXP/2026/tests/destaques.test.js` (Node 22 não aceita a pasta).
- Player: servir esta pasta e abrir `index.html`; `?mock=0` usa o EBHTML real.
- Mock (padrão `hoje`: 1 destaque por palco, o 1º em andamento): `?cenario=evento|um|tres|seis|
  muitos|textos|vazio|semMarcado|encerrado|amanha|semImagem|invalido|palcoDesconhecido|erro`,
  `&len=N`, `&hora=14:40`, `&agora=ISO-8601`, `&palco=blast` (todos no mesmo palco).
  `window.__textos` mostra o ajuste de cada texto; `window.__calls`, `loaded()`/`finished()`.

## CSS e pacote

- `npm run build` (Tailwind global) gera `css/master.css`. As regras novas (borda da foto,
  foto ausente) estão em `css/input.css` e foram replicadas à mão em `css/master.css`
  porque o Tailwind não está instalado nesta máquina.
- Antes do `.eh5`: `MOCK_DATA.enabled = false`, remover o `<script>` do mock,
  `CONFIG.debug = false`, excluir `mock/`, incluir só os 6 fundos, os 2 vídeos e o logo.

## Pendências

- Confirmar dataset/marcador/limite/duração (acima) e o id do Palco Omelete (`23007`).
- O vídeo de abertura diz "DESTAQUES DE HOJE" (plural); o layout do slide, "DESTAQUE DE HOJE".
- Teste no `ebcliente4` real e reabrir o `.eh5`.
