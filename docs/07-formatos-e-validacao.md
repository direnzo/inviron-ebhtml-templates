# Formatos de Producao e Validacao

## Autoridade e escopo
- Pedido explicito mais recente do usuario de um formato ou array/lista de resolucoes substitui a matriz geral. Testar EXATAMENTE a lista, sem expandir por tenant, proporcao ou frequencia.
- Sem restricao explicita, testar TODAS as resolucoes unicas do consolidado. Amostragem serve ao desenvolvimento, nao a homologacao integral.
- Formato inedito e permitido. Lista vazia, item invalido ou dimensao nao inteira/positiva requer correcao; nunca voltar silenciosamente ao catalogo completo.
- Normalizar `1920 X 1080` para `1920x1080`; remover duplicatas preservando ordem. `16:9` nao define resolucao: confirmar dimensoes. Mudanca de escopo invalida evidencias incompativeis.
- Registrar o escopo no README unico do template, sem criar dependencia de runtime. Lista explicita nao muda com snapshot novo; matriz geral precisa ser regenerada.

## Fontes preservadas
Snapshot de 2026-10-20, sem corrigir arquivos originais silenciosamente:
- [Consolidado](layouts_formatos_consolidado_PRODUCAO_2026-10-20.csv): resolucoes e metadados agregados.
- [Por tenant](layouts_formatos_por_tenant_PRODUCAO_2026-10-20.csv): associacoes e ocorrencias por cliente/formato.
- [Proporcoes](layouts_proporcoes_PRODUCAO_2026-10-20.csv): familias aproximadas; fracao exata preservada por resolucao.
- [Faixas e pequenos](layouts_faixas_e_pequenos_PRODUCAO_2026-10-20.csv): categorias do levantamento, nao prova da funcao fisica do painel.
- Auditoria executada: 1.012 resolucoes, 2.117 associacoes tenant/formato, 4.648 areas; quatro tabelas consistentes. `areas_ativas` e a contagem fornecida pelo levantamento, nao telemetria de dispositivos ligados.
- Auditor verifica cabecalhos, dimensoes, duplicatas, tenants, totais, pixels e proporcoes com precisao de duas casas (empates de arredondamento tolerados); os arquivos nao sao tabelas independentes para somar entre si.

## Classificacao e composicao
- Separar geometria (L/A exata e orientacao), capacidade em pixels e funcao declarada no briefing. Nao deduzir densidade fisica, distancia de leitura ou hardware a partir da resolucao.
- `1366x768` nao e exatamente `16:9`; `256x144` e `1920x1080` nao tem a mesma capacidade de leitura apesar da mesma proporcao.
- Definir composicao completa, compacta, faixa ou outra variante pelo conteudo e espaco disponivel; nao gerar um breakpoint por resolucao.
- Cobrir intervalos entre breakpoints por layout base; declarar precedencia nos limites sobrepostos. Testar em torno dos limites sem adicionar resolucoes ao escopo explicito sem aprovacao.
- Casos `1x1`, `3x2`, `10x10` e faixas extremas continuam na matriz geral. Nao excluir nem aprovar por ausencia de overflow; inviabilidade visual exige excecao humana registrada.

## Ferramentas (Windows / PowerShell 5.1 + Node)
Na raiz, sem instalar nada em pastas de template:
```powershell
./scripts/display-formats.ps1 -Mode Audit
./scripts/display-formats.ps1 -Mode Catalog
./scripts/display-formats.ps1 -Mode Matrix -Formats '1920x1080','1080x1920'
./scripts/display-formats.ps1 -Mode Matrix -FormatsJson '["1234x567"]'
./scripts/display-formats.ps1 -Mode Matrix
npm test
```
`Audit`, `Catalog` e `Matrix` emitem JSON com snapshot/hash das fontes. Matriz nao significa teste executado (`not_run`). Saidas: 0 consistente, 1 divergencias, 2 entrada/falha operacional. `-Snapshot AAAA-MM-DD` seleciona explicitamente outro conjunto completo.

## Perfil de validacao visual
Manter perfil JSON e fixtures de teste fora da pasta entregue no `.eh5`. Exemplo:
```json
{
  "readySelector": "#conteudo",
  "timeoutMs": 25000,
  "regions": [{ "selector": "#titulo", "minFontPx": 12 }, { "selector": "#preco", "minFontPx": 16 }],
  "overlapPairs": [["#titulo", "#preco"]],
  "scenarios": [{ "name": "normal" }, { "name": "texto-longo", "initScript": "texto-longo.js" }]
}
```
Minimos sao decisoes do projeto, nao garantia de legibilidade fisica. Seletores de regioes devem apontar conteudo obrigatorio visivel; pares indicam apenas sobreposicoes proibidas, nao overlays intencionais. `initScript` e codigo local confiavel executado antes da pagina; fixtures alteram somente dados/mock, nunca a matriz nem a instrumentacao.
Perfil inicial para `_template-base`: [scripts/display-formats.profile.example.json](../scripts/display-formats.profile.example.json). Adaptar seletores, minimos e cenarios ao template antes de homologar.
```powershell
node scripts/validate-display-formats.js --template 'CAMINHO_TEMPLATE' --profile 'PERFIL.json' --output '.validation/ensaio-01' --formats '1920x1080,1080x1920'
```
`--formats` aceita lista textual ou array JSON; preferir lista textual no PowerShell 5.1, que remove aspas JSON ao chamar executaveis nativos. Sem `--formats`, executa o catalogo completo. Omitir restricao nao significa inferir formatos pelo tenant. Saida deve ser pasta nova fora do runtime; execucao sequencial e relatorio incremental preservam evidencias parciais, sem retomada automatica.

## Evidencias e limites
- URL fixa: `http://localhost:12099/FILES/1/index.html`, somente ebcliente4. Nunca `file:///` ou outro servidor. Confirmar o slot servindo o template antes de iniciar; runner nao copia arquivos nem troca slot.
- Runner compara index/scripts/styles servidos com disco, confirma viewport real, aguarda fontes/conteudo, captura imagem e verifica regioes, imagens, HTTP, erros JS e ordem unica `loaded,finished` observada nos loaders `create2`.
- Requisicoes externas sao bloqueadas; fontes/assets devem estar locais. Timeout ou viewport alterado ficam bloqueados. Loader nao instrumentavel ou finalizacao por interface nativa exigem inspecao especifica, nao sucesso presumido.
- Relatorio inclui matriz, hashes, versao do navegador, contagem esperada/executada e resultado por formato/cenario. Exit 0 indica apenas sucesso automatizado completo; NAO homologacao final.
- Resultado final: aprovado, falhou, bloqueado ou excecao aprovada. Runner gera `failed`/`blocked`; sucesso automatizado fica bloqueado para aprovacao ate revisao visual e homologacao no runtime alvo. Nunca editar evidencias para transformar falha em sucesso.
- Verificar titulos/precos extensos, imagens em cache/quebradas, dados ausentes, reload agressivo e modo fraco conforme briefing. Um perfil nao certifica caminhos nao exercitados.
- Chromium moderno nao substitui Android/WebKit/QtWebKit. Revisao visual, finalidade dos cadastros extremos e comportamento no hardware continuam gates humanos.
- Testes sinteticos interceptam a URL fixa sem servidor adicional: validam a ferramenta, nunca o template servido de producao.

## Retomada em criacoes e ajustes
- Toda criacao ou manutencao retoma a skill de formatos e o escopo registrado, mesmo sem pedido explicito de responsividade. Reconciliar o pedido atual com o historico; nao ampliar uma lista restrita automaticamente.
- Mudancas visuais ou de conteudo dinamico requerem rever layout, legibilidade e overflow. Checks dispensados por ausencia de impacto precisam de justificativa; nao geram homologacao nova.
- Antes de matrizes extensas, informar quantidade de formatos/cenarios e impacto local. Usar resumos e poucas capturas dirigidas para economizar tokens; custo local de execucao e consumo do modelo sao distintos.
- Entrega sempre identifica escopo, verificacoes realmente executadas e pendencias. Amostra ou teste do runner nao aprova o catalogo integral.

## Checagem inicial do runner: 2026-10-21
- Player real acessivel em HTTP 200; template servido identificado como `GLOBAL/hora_certa`, com index/scripts/styles conferidos pelo runner.
- Apenas `1280x720`, um cenario: viewport real correto e playlist `loaded,finished` observada.
- Resultado automatizado `failed`: alertas de overflow em `#dateWeekday` e `#dateDayMonth`, sem revisao visual conclusiva e sem alteracao do template. Nao classificar automaticamente esses alertas como defeitos confirmados.
- Evidencias locais na pasta ignorada `.validation/hora-certa-smoke-20261021/`; nao integram a entrega versionada. A matriz de 1.012 formatos nao foi executada; homologacao no runtime legado permanece pendente.

## Atualizacao e agentes
- Preservar snapshots anteriores, adicionar os quatro CSVs da nova data, auditar e comparar resolucoes adicionadas/removidas. Nao escolher silenciosamente o arquivo de data mais recente.
- Skills e agentes consultam esta referencia e [a skill de formatos](../.github/skills/edgecontents-display-formats/SKILL.md); nao copiam CSVs para instrucoes globais ou servicos externos.
- Tooling Node/Playwright e exclusivo de desenvolvimento, fora do `.eh5`; runtime dos templates permanece ES5. Dependencias autorizadas ficam somente na raiz.
- Adaptadores locais: [AGENTS.md](../AGENTS.md) e [CLAUDE.md](../CLAUDE.md). Descoberta real deve ser conferida por ferramenta/sessao; nao presumir que toda ferramenta descobre `.github/skills` automaticamente.
- Configuracoes globais/gerenciadas exigem inventario da fonte oficial, aprovacao especifica e rollback antes de escrita; nao tocar autenticacao, MCP ou plugins.
- Inventario inicial: entradas globais Claude Code e Codex estao marcadas como gerenciadas; Codex ja respeita AGENTS.md do projeto. Nenhuma alterada. Confirmacao em sessoes novas de cada ferramenta e homologacao no ebcliente4 continuam verificacoes independentes.