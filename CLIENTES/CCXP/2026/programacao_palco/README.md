# CCXP26 - Programação por Palco (Totem TV 1080x1920)

Um código, seis pacotes: troque só `CONFIG.palco` em `js/config.js`.
Plano e decisões: `../docs/PLANO-EXECUCAO.md`. Contexto: `../README.md`.

## Estado (2026-10-13)

- Pronto: motor, ciclo do player, steps 0-4, relógio, mock; layout com medidas reais do
  .ai (baseline medida por pixel: erro < 1 px), fonte GothamCond-Ultra, cores por palco.
- Vídeos: só Thunder em `videos/`; copiar `{slug}_intro.mp4`/`{slug}_outro.mp4` dos demais.
- Arte: PNGs 1081x1921 (borda em alpha 25%) compensados por `ARTE_X` em `master.js`.

## Arquivos

| Arquivo | Função |
|---|---|
| `js/config.js` | Palco, tempos, posições e cores (único lugar de ajuste) |
| `js/programacao.js` | Lógica pura: datas com fuso, atual/próximo/lista, steps |
| `js/master.js` | Player: loader, mídia, painéis, vídeos, encerramento |
| `js/mock-data.js` | Mock EBHTML com cenários; desligar para produção |
| `js/ebhtml.js` | 2.0.7 canônico (não editar) |

## Regras de dados

- Atual: `início <= agora < fim`. Próximo: primeiro futuro **do mesmo dia**. Lista: 5 seguintes.
- Datas sem fuso são lidas em -03:00; formatos `YYYY-MM-DD HH:MM[:SS]` e `MM-DD-YYYY HH:MM[:SS]`.
- Descartados: sem título, data inválida, duplicado, outro palco. Fim ausente = início + 60 min.
- Sem conteúdo, erro ou timeout: `loaded()` + `finished()` em ~100 ms, sem desenhar.

## Teste

- Lógica: `node --test CLIENTES/CCXP/2026/tests/programacao.test.js` (14 casos).
- Player: `http://localhost:12099/FILES/1/index.html` (ebcliente4).
- Preview em navegador, com mock ativo: `?cenario=cheio|tres|dois|um|semAtual|vazio|
  encerrado|amanha|longo|semImagem|invalido|erro`, `&palco=blast`, `&agora=ISO-8601`.
- `window.__calls` lista `loaded`/`finished` do mock.

## CSS e pacote

- `npm run build` (Tailwind global) gera `css/master.css`.
- Antes do `.eh5`: `MOCK_DATA.enabled = false`, remover o `<script>` do mock,
  `CONFIG.debug = false`, incluir só os vídeos/imagens do palco, reabrir e conferir.

## Pendências

- Caminho do dataset (2025 usou `http://localhost:13199/CONTENT/DATA`) e campos em 2026.
- Regra para cancelado/remarcado/sem imagem; teste no `ebcliente4` real (H.264, autoplay).
- Arte: barra inferior mede 85,6 px em Rolando/Daqui e 79,6 px em Ainda hoje (5 de 6
  palcos); usamos 85,6 em todos. Universe: hora #391B8C (rolando) x #39178A (lista); usamos #391B8C.
