---
name: edgecontents-display-formats
description: "Use when: criar ou validar templates EdgeContents, escolher formatos/resolucoes de tela, interpretar proporcoes, faixas, rodapes, LED, paineis pequenos, arrays de formatos ou consultar o levantamento de producao por tenant. Respeita restricoes explicitas e gera matriz auditavel."
---

# Formatos e Validacao EdgeContents

## Fonte unica
Ler [docs/07-formatos-e-validacao.md](../../../docs/07-formatos-e-validacao.md). Os quatro CSVs sao snapshots preservados; o consolidado define resolucoes e as outras tabelas enriquecem/auditam, nao ampliam uma lista explicita.

## Antes de implementar
1. Seguir briefing/branch de [edgecontents-template-workflow](../edgecontents-template-workflow/SKILL.md).
2. Procurar o pedido mais recente de escopo: um formato ou array/lista de resolucoes informado pelo usuario prevalece sobre qualquer catalogo, tenant, frequencia ou familia.
3. Lista valida: testar EXATAMENTE seus formatos. Sem restricao: todas as resolucoes unicas do consolidado. Aceitar formatos ineditos e remover apenas duplicatas exatas, preservando ordem.
4. Lista vazia/invalida: pedir correcao, nunca ampliar silenciosamente. Apenas proporcao (`16:9`): confirmar dimensoes antes de congelar a matriz.
5. Registrar origem (`explicit`/`catalog`), lista normalizada e snapshot no README unico do template. Reconciliar alteracoes de escopo com evidencias anteriores.

## Classificar sem presumir
- Distinguir razao exata, familia aproximada, capacidade em pixels e funcao declarada. Geometria nao prova que uma faixa e rodape nem que um dispositivo e fraco.
- Nao presumir legibilidade igual para resolucoes com a mesma proporcao; nao excluir `1x1` ou extremos do padrao integral.
- Usar layout base para intervalos e precedencia explicita em fronteiras de breakpoints. Recomendar testes adicionais fora da lista apenas como opcionais sujeitos a aprovacao.
- Carregar [frontend-tailwind-golden-ratio](../frontend-tailwind-golden-ratio/SKILL.md) para composicao e [ebhtml-api](../ebhtml-api/SKILL.md) para ciclo de playlist; preservar ES5 e loaded antes de finished em todos os caminhos.

## Executar
Na raiz Windows/PowerShell:
```powershell
./scripts/display-formats.ps1 -Mode Audit
./scripts/display-formats.ps1 -Mode Matrix -Formats '1920x1080','1080x1920'
./scripts/display-formats.ps1 -Mode Matrix
npm test
```
Primeiro exemplo de matriz e explicito; segundo e integral. Auditoria nao valida visual nem reproduz defeito de um template.

Para validacao visual, preparar perfil JSON com seletores, minimos e cenarios segundo a referencia. Usar runner Node com `--template`, `--profile`, `--output` e `--formats` opcional. So testar a URL fixa do ebcliente4; confirmar arquivo servido e viewport real. Nao instalar ferramentas, mudar slot ou expor dados sem autorizacao.

## Gate e entrega
- Comparar esperados/executados: nenhuma omissao silenciosa. Amostra nao satisfaz matriz integral.
- Separar `not_run`, sucesso automatizado, revisao visual e homologacao no runtime. `exit 0` do runner nao e aprovacao final.
- Reportar falhou/bloqueado e evidencias por formato/cenario; excecao/aprovacao final exige decisao humana identificada. Dados extremos nao sao aprovados por ausencia de overflow.
- Chromium moderno nao certifica runtime legado; ausencia do player/build alvo permanece pendencia.
- Nao incluir catalogo, scripts, relatorios, screenshots, fixtures ou node_modules no `.eh5`. Nao modificar templates de outros tenants nem snapshots como efeito colateral.