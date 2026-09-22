# 00 - Governança e Arquitetura do Repositório Oficial

Este documento é a porta de entrada da documentação. Define o propósito do repositório e a separação entre o que é **global** (núcleo técnico reutilizável) e o que é **de tenant** (personalização de cliente).

## Propósito

Este workspace é o repositório oficial de criação, correção e manutenção de templates EdgeContents. O objetivo final de qualquer trabalho aqui é um arquivo `.eh5` homologado, executável sem travamentos, interrupções, telas pretas ou dados desatualizados no sistema de playlists.

## Global vs Tenant — como classificar

| Nível | O que é | Onde vive |
|---|---|---|
| **Global** | `ebhtml.js` aprovado, ciclo de playlist seguro, compatibilidade ES5, responsividade/tipografia, detecção de hardware fraco, briefing, auditoria, empacotamento | `_template-base/`, `docs/`, `.github/skills/`, scripts de validação |
| **Tenant** | Canais/campos específicos, identidade visual, fontes licenciadas, assets, regras comerciais/editoriais, formatos contratados, exceções de compatibilidade | pasta do template do cliente |
| **Template** | Duração, layout, truncamento, intro/outro, rotação, fallback específico | pasta do próprio template |
| **Perfil de runtime** | Chromium 78, Android/WebKit legado, QtWebKit legado (ex.: EBHTMLBuilder 3.0.5) — cada um pode ter exceções próprias | registrado no README do template |

Regra prática: uma decisão só entra no núcleo global quando for estrutural ao EdgeContents ou comprovadamente reaplicável em mais de um tenant/template. Uma correção pontual nasce no tenant e só é promovida depois de validada em outro contexto.

Nunca usar dados, assets ou contratos privados de um cliente como exemplo em documentação global.

## Estrutura manual do workspace

```text
_template-base/                         # base canonica na raiz
GLOBAL/<template>/                      # reutilizavel ou sem tenant definido
CLIENTES/<TENANT>/<template>/           # especifico de cliente
sandbox/                                # validacao local
_EH5/                                   # pacotes homologados
archive/                                # legado arquivado
```

`_template-base/` permanece como a única base canônica na raiz. `GLOBAL/` recebe templates reutilizáveis ou ainda sem tenant definido; templates específicos devem ficar em `CLIENTES/<TENANT>/<template>/`. `sandbox/`, `_EH5/` e `archive/` não mudam de lugar. A classificação é manual e não autoriza mover templates existentes sem uma tarefa própria.

## Fontes de verdade

- Regras universais inegociáveis: [`.github/copilot-instructions.md`](../.github/copilot-instructions.md)
- API e ciclo de playlist EBHTML: [`.github/skills/ebhtml-api/SKILL.md`](../.github/skills/ebhtml-api/SKILL.md)
- Layout, responsividade e tipografia: [`.github/skills/frontend-tailwind-golden-ratio/SKILL.md`](../.github/skills/frontend-tailwind-golden-ratio/SKILL.md)
- Briefing e workflow de criação/manutenção: [`.github/skills/edgecontents-template-workflow/SKILL.md`](../.github/skills/edgecontents-template-workflow/SKILL.md)
- Estratégia de branches: [`.github/BRANCHING.md`](../.github/BRANCHING.md)
- Playbook operacional detalhado: `docs/01` a `docs/06` (ver [`docs/README.md`](README.md))
- Templates de validação do fluxo (não são entrega de tenant): [`sandbox/README.md`](../sandbox/README.md)

Os resumos legados foram arquivados em `archive/`; em caso de conflito, este documento e as skills acima prevalecem.

## Regras não negociáveis (resumo)

1. ES5 obrigatório em todo template.
2. `ebhtml.js` sempre copiado integralmente de `_template-base/js/ebhtml.js` — nunca editado manualmente, nunca reaproveitado de pasta antiga sem conferência.
3. `loader.loaded()` só em sucesso; `loader.finished()` sempre, exatamente uma vez por ciclo, incluindo erro, vazio e exceção de parsing.
4. Teste sempre por `http://localhost:12099/FILES/1/index.html`, nunca `file:///`.
5. Branch temática obrigatória antes de qualquer edição (ver `.github/BRANCHING.md`).
6. Preview/extranet, `localStorage` e modo de hardware fraco são decisões de briefing por template — não são universais nem proibições universais. Ver seção seguinte.

## Preview, `localStorage` e hardware fraco — decisão por briefing, não regra universal

- **Preview/extranet**: obrigatório apenas quando o CMS/tenant exige pré-visualização configurável pela extranet. Quando existir, runtime e preview compartilham a mesma normalização/render; a única diferença é a origem dos dados, e `finished()` é suprimido no preview.
- **`localStorage`**: proibido como autoridade de regra de negócio quando o dataset já define ordem/seleção. Permitido quando a rotação precisa persistir entre reloads do player e não há equivalente no canal de dados (ex.: alternância determinística sem servidor de estado).
- **Hardware fraco**: obrigatório apenas em templates com animações pesadas, SVGs animados ou múltiplos XHRs simultâneos. Templates simples e estáticos podem dispensar essa camada, desde que registrado no briefing.

## Versão do EBHTML

Novos templates usam **EBHTML 2.0.7** a partir de `_template-base/js/ebhtml.js`. Templates existentes na 2.0.3 migram individualmente, por branch própria, com testes de regressão — nunca em substituição em massa. Detalhe completo na skill `ebhtml-api`.
