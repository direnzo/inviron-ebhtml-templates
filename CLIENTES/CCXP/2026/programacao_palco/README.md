# CCXP26 - Programação por Palco (Totem TV 1080x1920)

Seis pacotes independentes: cada `js/master.js` fixa o ID do palco em `PALCO_FIXO`.
Plano e decisões: `../docs/PLANO-EXECUCAO.md`. Contexto: `../README.md`.

## Estado (2026-10-19)

- Pronto: motor, ciclo do player, steps 0-4, relógio (hora real), 6 pacotes `.eh5`;
  layout com as
  medidas do .ai (baseline < 1 px), fonte GothamCond-Ultra, cores por palco.
- Camadas fixas (como 2025): fundo, ornamento e rodapé sobre os vídeos o tempo todo;
  só o ornamento some no encerramento (o vídeo traz o dele). Conteúdo entra pela direita
  e sai pela esquerda, 1 s ease-in-out.
- Cada pacote fixa seu ID em `js/master.js` e inclui somente seus próprios vídeos e artes.
  PNGs 1081x1921: `ARTE_X` em `master.js`.

## Arquivos (js/)

`config.js` ajustes (tempos, posições, cores) | `programacao.js` lógica pura |
`master.js` player e palco fixo por pacote | `ebhtml.js` 2.0.7 canônico.

## Regras de dados

- Atual: `início <= agora < fim`. Próximo: primeiro futuro **do mesmo dia**. Lista: 5 seguintes.
- Só eventos de **hoje**: "Ainda hoje" lista até 5. Painéis de outros dias nunca entram;
  sem nada em andamento nem a seguir hoje, o template não é exibido.
- Datas sem fuso são lidas em -03:00; formatos `YYYY-MM-DD HH:MM[:SS]` e `MM-DD-YYYY HH:MM[:SS]`.
- Descartados: sem título, data inválida, duplicado, outro palco. Fim ausente = início + 60 min.
- Sem conteúdo, erro ou timeout: `loaded()` + `finished()` em ~100 ms, sem desenhar.
- Descrição: 3 linhas em tamanho fixo (75 px nos frames grandes, 37,92 px na lista), sem
  encolher. Cabem ~85 car. (~90 na lista); acima disso corta com `...`.

## Teste

- Lógica: `node --test CLIENTES/CCXP/2026/tests/programacao.test.js` (18 casos).
- Player: `http://localhost:12099/FILES/1/index.html`; `?mock=0` usa o EBHTML real.
- Cenários de mock continuam disponíveis em `js/mock-data.js` para desenvolvimento,
  mas o script não é carregado nesta versão de produção.

## CSS e pacote

- Pacotes em `_EH5/ccxp26_programacao_{universe,omelete,thunder,blast,magic,omni}.eh5`;
  cada um inclui apenas
  fundo, ornamento e vídeos do palco correspondente, além da fonte e do logo.
- Para atualizar CSS durante desenvolvimento, usar `npm run dev` (Tailwind global).
- Os `.eh5` não incluem `mock/`, fontes de build ou arquivos-fonte do Tailwind.

## Pendências
- A consulta atual ao canal retornou vazia para os seis IDs; testar cada pacote no
  `ebcliente4` quando os respectivos eventos estiverem publicados.
- Confirmar em dados reais os IDs 23007 (Omelete) e 23010 (Magic Market).
- Regra para cancelado/remarcado/sem imagem; barra 85,6 x 79,6 px na arte (usamos 85,6).
- Cor: vermelho dos vídeos (Thunder #F5002E) difere dos PNGs (#E2313A).
