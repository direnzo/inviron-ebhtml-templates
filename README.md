# EdgeContents Templates - Guia Atualizado

Este workspace agora usa um modelo de documentacao consolidado com base no playbook oficial:
- features-list.md

Objetivo:
- reduzir retrabalho
- padronizar criacao/refatoracao de templates
- garantir compatibilidade (ES5 + Chromium 78)
- manter paridade entre runtime e preview

## Fonte de verdade

Documento principal:
- features-list.md

Documentacao operacional:
- docs/README.md

Documentacao legada arquivada:
- archive/workspace-docs-legacy-2026-07-06/

## Regras criticas (resumo)

1. ES5 obrigatorio.
2. Baseline minimo: Chromium 78.
3. loader.loaded() apenas em sucesso.
4. loader.finished() sempre no runtime.
5. preview.js obrigatorio com mesma logica funcional do runtime.
6. Diferenca entre preview e runtime: apenas origem dos dados.
7. Evitar localStorage para logica principal (dataset-first).
8. Priorizar Tailwind raiz e HTML semantico.
9. JS para dados/comportamento, nao para montar HTML inteiro por string.
10. Micro funcoes reutilizaveis como base da arquitetura.

## Estrutura de docs (nova)

- docs/01-playbook-referencia.md
- docs/02-dados-ebhtml-rotacao.md
- docs/03-ui-markup-tailwind.md
- docs/04-preview-paridade.md
- docs/05-performance-animacao-video.md
- docs/06-microfuncoes-reutilizaveis.md

## Inicio rapido

Ver:
- QUICKSTART.md

## Contribuicao

Ver:
- CONTRIBUTING.md
