# EdgeContents Templates — Repositorio Oficial

Repositorio oficial de criacao, correcao e manutencao de templates para o EdgeContents CMS. Todo trabalho aqui existe para produzir um `.eh5` homologado, sem travamentos, interrupcoes, telas pretas ou dados desatualizados no sistema de playlists.

Objetivo:
- padronizar criacao/correcao de templates via briefing obrigatorio
- separar claramente o que e global (nucleo reutilizavel) do que e especifico de tenant/cliente
- garantir compatibilidade (ES5 + perfil de browser declarado por template)
- manter o EBHTML sempre na versao canonica aprovada

## Comece aqui

1. docs/00-governanca-e-arquitetura.md — global vs tenant, fontes de verdade
2. .github/BRANCHING.md — toda mudanca nasce em branch tematica
3. .github/skills/edgecontents-template-workflow/SKILL.md — briefing e fluxo completo ate o `.eh5`

## Fonte de verdade

- Regras universais: .github/copilot-instructions.md
- API/ciclo de playlist EBHTML: .github/skills/ebhtml-api/SKILL.md
- Layout/tipografia responsiva: .github/skills/frontend-tailwind-golden-ratio/SKILL.md
- Playbook operacional: docs/README.md

Os resumos legados ficam em `archive/`; em caso de conflito, os documentos acima prevalecem.

## Regras criticas (resumo)

1. ES5 obrigatorio.
2. `ebhtml.js` sempre copiado integralmente de `_template-base/js/ebhtml.js` (EBHTML 2.0.7 para templates novos) — nunca editado manualmente.
3. `loader.loaded()` apenas em sucesso; `loader.finished()` sempre, exatamente uma vez por ciclo.
4. Teste sempre em http://localhost:12099/FILES/1/index.html — nunca file:///.
5. Branch tematica obrigatoria antes de qualquer edicao.
6. Preview, `localStorage` e hardware fraco sao decisoes de briefing por template, nao regras universais (ver docs/00).
7. Tipografia com autofit dentro de containers, limites definidos e sem loop sem limite.

## Contribuicao

Ver CONTRIBUTING.md.
