# Política de Branches

Este repositório é a fonte oficial de criação e manutenção de templates EdgeContents. Toda mudança — global ou de tenant — nasce em uma branch temática exclusiva.

## Regra de ouro

Uma branch trata **um único tema**. Nunca misturar mudança global (núcleo, docs, skills) com personalização de tenant/template na mesma branch.

## Padrão de nome

```
tipo/escopo-assunto
```

| Tipo | Uso |
|---|---|
| `feat` | novo template ou nova capacidade |
| `fix` | correção de bug (travamento, tela preta, dado quebrado) |
| `perf` | performance / hardware fraco |
| `refactor` | reestruturação sem mudança de comportamento |
| `docs` | documentação, governança, customizações do Copilot |
| `chore` | dependências, versão do EBHTML, tooling |
| `test` | template de validação em `sandbox/` — não é entrega de tenant |

`escopo` é `core` para mudança global, `tenant-template` para mudança específica de um cliente/template, ou `sandbox` para cenário de validação do fluxo.

Exemplos: `feat/populari-intro-video`, `fix/andorinha-menuboard-loader`, `chore/core-ebhtml-2.0.7`, `docs/core-repositorio-oficial`, `perf/previsao-tempo-hardware-fraco`, `test/sandbox-dados-basicos`.

## Regras obrigatórias

1. Nunca commitar diretamente na branch principal.
2. Branch nasce da principal atualizada.
3. Criar a branch **antes** da primeira edição de arquivo.
4. Não reutilizar branch já mesclada/encerrada para um tema novo.
5. Commits pequenos e semanticamente coerentes com o tema da branch.
6. Commit e merge exigem autorização explícita — nunca automáticos.
7. Alterações locais pendentes de outro tema não são descartadas; ficam de fora do commit desta branch e são sinalizadas para uma branch própria.
8. Cada entrega relevante registra: tenant, template, branch, tipo de mudança, versão do EBHTML, perfil de compatibilidade, canais, formatos e `.eh5` gerado (ver checklist de PR).
