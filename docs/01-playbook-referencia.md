# 01 - Playbook de Referencia

Este documento resume as diretrizes obrigatorias do workspace.

## Regras nao negociaveis

- ES5 obrigatorio.
- Baseline minimo: Chromium 78.
- Runtime: loaded apenas em sucesso e finished sempre.
  - "sempre" inclui o caminho de erro: `loader.load(sucesso, erro)` precisa do 2o argumento, senao falha de XML trava o item pra sempre (ebhtml.js chama error() mas nunca finished() sozinho).
  - handlers de imagem/midia (`onload`/`onerror`) sempre ANTES de setar `src` — WebKit legado pode disparar o evento antes do handler existir se a imagem estiver em cache.
  - todo template com midia assincrona precisa de um watchdog (`setTimeout`) que force `finished()` mesmo sem eventos.
  - detalhe completo e codigo de referencia: `.github/skills/ebhtml-api/SKILL.md` secao 6.
- Preview: mesma logica do runtime, mudando so a origem dos dados.
- Evitar localStorage em regra principal (dataset-first).

## Arquitetura recomendada

1. Config
2. Data access (EBHTML)
3. Normalizacao
4. Micro funcoes reutilizaveis
5. Render/populacao
6. Orquestracao
7. Tratamento de erro

## UI e implementacao

- Priorizar Tailwind raiz.
- Evitar classes custom desnecessarias.
- HTML semantico.
- JS para dados/comportamento, nao para montar HTML inteiro por string.

## Validacao minima

- tecnico
- visual
- dados
- performance
- paridade preview/runtime

## Fonte completa

- ../features-list.md
