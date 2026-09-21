## Resumo

<!-- 1-2 linhas: o que muda e por quê -->

## Rastreabilidade

- Tenant/cliente:
- Template:
- Branch:
- Tipo de mudança: feat / fix / perf / refactor / docs / chore
- Escopo: core (global) / tenant-template (específico)

## EBHTML e compatibilidade

- Versão do `ebhtml.js`:
- Perfil de compatibilidade alvo (Chromium 78 / Android+WebKit legado / QtWebKit legado / outro):
- Canais/datasets usados:
- Formatos/resoluções validados:

## Checklist técnico (marcar apenas o aplicável ao escopo)

- [ ] ES5 sem regressão (sem `const/let/arrow/template string/class/Promise/fetch`)
- [ ] `loader.load(sucesso, erro)` com os dois argumentos
- [ ] Parsing/render do callback de sucesso protegido por `try/catch`
- [ ] `loader.loaded()` só em sucesso; `loader.finished()` sempre, exatamente uma vez por ciclo
- [ ] Watchdog/retry presentes quando o loader ou mídia podem falhar silenciosamente
- [ ] Handlers de imagem/mídia atribuídos antes do `src`
- [ ] Body nunca oculto por inteiro; só o container de dados dinâmicos
- [ ] SVG sempre injetado inline via XHR, nunca `<img src="*.svg">`
- [ ] `MOCK_DATA.enabled = false` em produção
- [ ] Preview/extranet — aplicável? Se sim, mesma pipeline de render do runtime
- [ ] Hardware fraco — aplicável? Se sim, modo reduzido validado
- [ ] Testado em `http://localhost:12099/FILES/1/index.html` (nunca `file:///`)

## `.eh5`

- [ ] Pacote gerado e reaberto para conferência de conteúdo
- [ ] Sem mocks ativos, sem `node_modules`, sem fontes de desenvolvimento desnecessárias
- [ ] Nome/versão do pacote: `

## Riscos residuais

<!-- o que não foi coberto e por quê -->
