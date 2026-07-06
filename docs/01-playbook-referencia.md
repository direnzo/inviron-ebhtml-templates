# 01 - Playbook de Referencia

Este documento resume as diretrizes obrigatorias do workspace.

## Regras nao negociaveis

- ES5 obrigatorio.
- Baseline minimo: Chromium 78.
- Runtime: loaded apenas em sucesso e finished sempre.
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
