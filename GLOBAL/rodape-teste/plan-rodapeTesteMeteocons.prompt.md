## Plan: Retomar rodape-teste com Meteocons

Atualizar o template rodape-teste para aderir às orientações atuais de legado (Android 7+/WebKit antigo), corrigindo lacunas de fluxo EBHTML/CSS e migrando o módulo de clima para a biblioteca Meteocons usada no climatempo_momento, no estilo monochrome, com migração total (sem fallback img/clima) e inclusão de ícones de umidade/vento.

Neste ciclo, incluir análise dedicada dos módulos de dados carregados e restringir o escopo ativo para: clima_climatempo_momento (dataset `D_CLIMA_CLIMATEMPO_MOMENTO`, com apoio de `D_CLIMA` quando necessário), `D_CAMBIO` e `D_AWESOMEAPI`. Os demais módulos (notícias, mensageria, placar e horóscopo) ficam desconsiderados por enquanto.

**Steps**
1. Fase 1 — Baseline técnico e alinhamento de assets (bloqueia as demais)
1.1. Confirmar fonte de verdade da biblioteca em `c:\Users\direnzo\Documents\CLIENTES\_TEMPLATES\climatempo_momento\js\meteocons-helpers.js` e em `c:\Users\direnzo\Documents\CLIENTES\_TEMPLATES\_template-base\js\meteocons-helpers.js`, preservando compatibilidade ES5 e mapeamentos de códigos clima.
1.2. Planejar a estrutura destino em `rodape-teste`: adicionar helper Meteocons em `rodape-teste/js/` e biblioteca SVG em `rodape-teste/img/meteocons/monochrome/` (migração total).
1.3. Definir, em `rodape-teste/js/config.js`, novas chaves de configuração para Meteocons (estilo `monochrome`, cor do ícone, path base) e toggles para ícones auxiliares (umidade/vento).
1.4. Mapear e validar os módulos de dados que serão carregados no ciclo atual: clima (principal), financeiro com `D_CAMBIO` e financeiro com `D_AWESOMEAPI`; documentar diferenças de campos entre os dois datasets de câmbio para evitar regressão no parser.

2. Fase 2 — Análise dos módulos de dados carregados (depende da Fase 1)
2.1. Revisar em `rodape-teste/js/config.js` a lista `canais` para manter ativos apenas os módulos necessários no ciclo atual.
2.2. Garantir que o carregamento EBHTML em `rodape-teste/js/master.js` use apenas datasets ativos deste ciclo: `D_CLIMA_CLIMATEMPO_MOMENTO`, `D_CLIMA` (secundário do clima), `D_CAMBIO` e `D_AWESOMEAPI` (alternativo de financeiro).
2.3. Definir estratégia de alternância do módulo financeiro entre `D_CAMBIO` e `D_AWESOMEAPI` (configurável por dataset), mantendo parser defensivo para campos ausentes.
2.4. Confirmar que os demais módulos ficam fora do escopo de execução neste ciclo, sem remover código, apenas desativando no fluxo/configuração.

3. Fase 3 — Design técnico da migração de clima (depende da Fase 2)
3.1. Substituir no `rodape-teste/js/modules/modulo-clima.js` o resolvedor atual `iconeArquivo(codigo, isNoite)` por integração via helper Meteocons (mapa Climatempo -> nome Meteocons).
3.2. Migrar o carregamento de SVG para o padrão Meteocons, mantendo XHR inline compatível com WebKit legado e cancelamento/abort em transições.
3.3. Incluir renderização de ícones de umidade e vento no layout do módulo clima, com fallback visual quando dados vierem sem valor.
3.4. Padronizar fallback de ícone principal para `cloudy` (via helper), removendo dependência de `img/clima/*.svg`.

4. Fase 4 — Compatibilidade legado e regras EBHTML (paralelo parcial com Fase 3)
4.1. Ajustar `rodape-teste/js/master.js` para garantir sequência robusta de playlist: `loaded()` e `finished()` em todos os finais de ciclo (inclusive sem dados), mais callback explícito de erro no `loader.load`.
4.2. Refatorar `rodape-teste/css/input.css` para remover `gap` em containers flex e trocar por spacing via margem entre irmãos, evitando incompatibilidade em engines antigas.
4.3. Migrar escala tipográfica para padrão atual: body em `vmin` e filhos em `em/%`, preservando proporção do rodapé em diferentes aspect-ratios.
4.4. Regerar `rodape-teste/css/master.css` via `npm run dev` no template (sem `npm run build`), mantendo os fallbacks hex já previstos no CSS fonte.

5. Fase 5 — Limpeza, documentação e risco de regressão (depende das fases 3 e 4)
5.1. Remover/arquivar assets antigos não usados de `rodape-teste/img/clima/` após confirmar que nenhuma referência sobrou em JS/CSS.
5.2. Criar README curto em `rodape-teste/README.md` (máx. ~50 linhas) com: configuração Meteocons monochrome, datasets esperados, modo mock, checklist legado e URL de teste obrigatória.
5.3. Validar ordem de carregamento de scripts no `rodape-teste/index.html` para garantir helper Meteocons disponível antes do módulo clima.

6. Fase 6 — Verificação funcional (depende de todas as fases)
6.1. Validar localmente com mock e com EBHTML real no endpoint obrigatório `http://localhost:12099/FILES/1/index.html`.
6.2. Testar cenários de dados: com clima completo, sem min/max, sem ícone válido, sem dados em canal clima, e erro de carregamento XML.
6.3. Testar o módulo financeiro com os dois datasets de escopo (`D_CAMBIO` e `D_AWESOMEAPI`), incluindo ausência parcial de campos.
6.4. Testar layout nos aspect-ratios críticos do projeto (portrait, landscape, ultrawide, superbanner, empena), confirmando não sobreposição no rodapé.
6.5. Testar cancelamento de timers/XHR durante transição de itens para evitar vazamento e conteúdo residual.

**Relevant files**
- `c:\Users\direnzo\Documents\CLIENTES\_TEMPLATES\rodape-teste\js\config.js` — adicionar configuração de Meteocons monochrome e ícones auxiliares.
- `c:\Users\direnzo\Documents\CLIENTES\_TEMPLATES\rodape-teste\js\modules\modulo-clima.js` — migrar parser/render para helper Meteocons e novos ícones.
- `c:\Users\direnzo\Documents\CLIENTES\_TEMPLATES\rodape-teste\js\master.js` — reforçar fluxo `loaded/finished/error` e finalização segura.
- `c:\Users\direnzo\Documents\CLIENTES\_TEMPLATES\rodape-teste\index.html` — ajustar ordem de scripts (helper antes do módulo clima).
- `c:\Users\direnzo\Documents\CLIENTES\_TEMPLATES\rodape-teste\css\input.css` — remover `gap` flex e migrar tipografia para `vmin` + `em/%`.
- `c:\Users\direnzo\Documents\CLIENTES\_TEMPLATES\rodape-teste\css\master.css` — saída compilada revisada para legado.
- `c:\Users\direnzo\Documents\CLIENTES\_TEMPLATES\rodape-teste\img\meteocons\monochrome\` — biblioteca de ícones alvo.
- `c:\Users\direnzo\Documents\CLIENTES\_TEMPLATES\climatempo_momento\js\meteocons-helpers.js` — referência de implementação.
- `c:\Users\direnzo\Documents\CLIENTES\_TEMPLATES\climatempo_momento\img\meteocons\monochrome\` — referência de assets.

**Verification**
1. Executar watcher de CSS no template: `npm run dev` dentro de `rodape-teste`.
2. Validar ausência de sintaxe JS moderna (`let/const/=>/Promise/fetch`) nos arquivos alterados.
3. Validar que não restaram referências a `img/clima/` no `rodape-teste` após migração.
4. Confirmar que `loaded()` e `finished()` são disparados em todos os caminhos de término (sucesso, sem dados e erro).
5. Testar render de ícones Meteocons monochrome (principal + umidade + vento) em dados de mock e dados EBHTML.
6. Teste manual obrigatório em ambiente real: `http://localhost:12099/FILES/1/index.html`.

**Decisions**
- Estilo da biblioteca Meteocons: `monochrome`.
- Estratégia de migração: 100% Meteocons, sem fallback para `img/clima/`.
- Escopo de UI no clima: incluir ícones de umidade e vento.
- Escopo de dados do ciclo atual: clima_climatempo_momento + financeiro com `D_CAMBIO` e `D_AWESOMEAPI`.
- Incluído no escopo: ajustes de compatibilidade legado já identificados (EBHTML flow + CSS flex gap + escala tipográfica).
- Excluído do escopo por enquanto: notícias, mensageria, placar e horóscopo (análise/ajustes desses módulos ficam para próximo ciclo).

**Further Considerations**
1. Se houver diferença visual relevante no SVG monochrome (espessura/legibilidade), priorizar ajuste por cor/tamanho em config antes de alterar SVGs originais.
2. Caso o helper da base e o do climatempo_momento divirjam, usar a versão mais recente da base e aplicar apenas mapeamentos comprovados no climatempo_momento.