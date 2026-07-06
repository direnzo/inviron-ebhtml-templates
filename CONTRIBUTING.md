# Contribuindo com o Novo Padrao

Este repositorio usa o playbook consolidado em features-list.md.

## Escopo desta contribuicao

Ao alterar template, voce deve preservar:
- ES5
- compatibilidade Chromium 78
- paridade runtime/preview
- dataset-first para regras de exibicao
- arquitetura com micro funcoes reutilizaveis

## Fluxo recomendado

1. Ler features-list.md.
2. Atualizar/implementar template.
3. Garantir preview.js funcional.
4. Rodar validacoes de checklist (tecnico, visual, dados, performance).
5. Atualizar docs somente se houver novo aprendizado geral.

## Regras de documentacao

- Documentacao ativa: raiz + docs atuais.
- Conteudo antigo deve ser movido para archive/workspace-docs-legacy-2026-07-06/.
- Nao manter dois documentos concorrentes para a mesma regra.

## Checklist de aceite de PR

- [ ] ES5 sem regressao
- [ ] Chromium 78 contemplado com fallbacks
- [ ] preview.js com mesma logica do runtime
- [ ] loaded/finished corretos
- [ ] sem dependencia de localStorage para regra principal
- [ ] Tailwind raiz predominante
- [ ] HTML semantico e JS focado em dados
- [ ] micro funcoes reutilizaveis aplicadas

## Fonte de verdade

- features-list.md
- docs/README.md
