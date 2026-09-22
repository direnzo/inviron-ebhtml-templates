# Contribuindo com o Repositorio Oficial

Este repositorio usa a governanca em docs/00-governanca-e-arquitetura.md e o fluxo em .github/skills/edgecontents-template-workflow/SKILL.md.

## Antes de editar

1. Confirmar/criar branch tematica conforme .github/BRANCHING.md — nunca editar direto na principal.
2. Classificar a mudanca como global (core) ou de tenant/template.
3. Rodar o briefing (completo para criacao/derivacao, reduzido para correcao) descrito na skill de workflow.

## Escopo desta contribuicao

Preservar, conforme aplicavel ao escopo declarado no briefing:
- ES5
- compatibilidade com o perfil de browser declarado (Chromium 78 / Android+WebKit legado / QtWebKit legado)
- ciclo de playlist seguro (loaded/finished, watchdog, try/catch)
- paridade runtime/preview, somente quando o template exige preview
- dataset-first para regras de exibicao, exceto quando `localStorage` for a excecao documentada

## Fluxo recomendado

1. Ler docs/00-governanca-e-arquitetura.md.
2. Seguir o briefing da skill edgecontents-template-workflow.
3. Implementar em branch tematica unica.
4. Rodar os gates da skill (tecnico, visual, dados, performance, `.eh5`).
5. Atualizar docs/skills somente quando o aprendizado for generalizavel (ver regra de promocao em docs/00).

## Regras de documentacao

- Documentacao ativa: docs/00-06 + skills em .github/skills/.
- Conteudo antigo permanece em archive/workspace-docs-legacy-2026-07-06/ ou e sinalizado como historico.
- Nao manter dois documentos concorrentes para a mesma regra.

## Checklist de aceite de PR

Usar o checklist completo em .github/pull_request_template.md. Resumo:

- [ ] Branch tematica unica para o tema do PR
- [ ] ES5 sem regressao
- [ ] Compatibilidade do perfil declarado contemplada com fallbacks
- [ ] loaded/finished corretos em todos os caminhos, incluindo erro e excecao
- [ ] Watchdog/retry presentes quando aplicavel
- [ ] preview.js com mesma logica do runtime, se o template exige preview
- [ ] `.eh5` gerado, reaberto e validado

## Fonte de verdade

- docs/00-governanca-e-arquitetura.md
- docs/README.md
