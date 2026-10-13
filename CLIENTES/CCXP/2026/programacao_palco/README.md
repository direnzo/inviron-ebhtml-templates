# CCXP26 - Programação por Palco (Totem TV 1080x1920)

Um código, seis pacotes: troque só `CONFIG.palco` em `js/config.js`.
Plano e decisões: `../docs/PLANO-EXECUCAO.md`. Contexto: `../README.md`.

## Estado (2026-10-13)

- Pronto: motor, ciclo do player, steps 0-4, relógio (hora real), mock; layout com as
  medidas do .ai (baseline < 1 px), fonte GothamCond-Ultra, cores por palco.
- Camadas fixas (como 2025): fundo, ornamento e rodapé sobre os vídeos o tempo todo;
  só o ornamento some no encerramento (o vídeo traz o dele). Conteúdo entra pela direita
  e sai pela esquerda, 1 s ease-in-out.
- Vídeos: só Thunder em `videos/`. PNGs 1081x1921: `ARTE_X` em `master.js`.

## Arquivos (js/)

`config.js` ajustes (palco, tempos, posições, cores) | `programacao.js` lógica pura |
`master.js` player | `mock-data.js` mock (desligar em produção) | `ebhtml.js` 2.0.7 canônico.

## Regras de dados

- Atual: `início <= agora < fim`. Próximo: primeiro futuro **do mesmo dia**. Lista: 5 seguintes.
- Slides: "Ainda hoje" (até 5 de hoje) e, separado, "Amanhã" (até 5 do dia seguinte, quando
  houver; também aparece se nada restar hoje). Sem nada hoje nem amanhã, não é exibido.
- Datas sem fuso são lidas em -03:00; formatos `YYYY-MM-DD HH:MM[:SS]` e `MM-DD-YYYY HH:MM[:SS]`.
- Descartados: sem título, data inválida, duplicado, outro palco. Fim ausente = início + 60 min.
- Sem conteúdo, erro ou timeout: `loaded()` + `finished()` em ~100 ms, sem desenhar.
- Descrição: 3 linhas em tamanho fixo (75 px nos frames grandes, 37,92 px na lista), sem
  encolher. Cabem ~85 car. (~90 na lista); acima disso corta com `...`.

## Teste

- Lógica: `node --test CLIENTES/CCXP/2026/tests/programacao.test.js` (20 casos).
- Player: `http://localhost:12099/FILES/1/index.html`; `?mock=0` usa o EBHTML real.
- Mock (padrão `evento`: 5 dias, hora real, títulos de ~89 car. e palco sorteado): `?cenario=textos|hojeEAmanha|cheio|tres|dois|
  um|semAtual|vazio|encerrado|amanha|semImagem|invalido|erro`, `&len=N`, `&hora=14:40`,
  `&agora=ISO-8601`, `&palco=blast` (sem ele, o mock sorteia o palco). `window.__textos` mostra o ajuste de cada texto.

## CSS e pacote

- `npm run build` (Tailwind global) gera `css/master.css`.
- Antes do `.eh5`: `MOCK_DATA.enabled = false`, remover o `<script>` do mock,
  `CONFIG.debug = false`, excluir `mock/`, incluir só vídeos/imagens do palco, reabrir e conferir.

## Pendências
- Caminho do dataset (2025: `http://localhost:13199/CONTENT/DATA`) e teste no `ebcliente4` real.
- Regra para cancelado/remarcado/sem imagem; barra 85,6 x 79,6 px na arte (usamos 85,6).
- Cor: vermelho dos vídeos (Thunder #F5002E) difere dos PNGs (#E2313A).
