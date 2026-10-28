---
name: edgecontents-template-workflow
description: "Use when: criar template EdgeContents do zero, derivar de um existente, corrigir/manter um template, ou preparar um .eh5 para homologação. Conduz o briefing obrigatório, respeita formatos/arrays explícitos, carrega ebhtml-api, frontend-tailwind-golden-ratio e edgecontents-display-formats, e aplica os gates até o pacote final."
---

# Workflow de Templates EdgeContents — Criação e Manutenção

## Propósito

Conduzir briefing -> branch temática -> implementação -> validação. Homologação e geração/substituição do `.eh5` são etapas de entrega condicionadas à autorização explícita. Esta skill encaminha API e layout às skills responsáveis, sem duplicar seus padrões.

Ver separação global/tenant em `docs/00-governanca-e-arquitetura.md` antes de classificar qualquer decisão.

## Estrutura manual dos templates

- `_template-base/` permanece canônico na raiz e é a única fonte para copiar a base executável.
- `GLOBAL/<template>/` recebe templates reutilizáveis ou sem tenant definido.
- `CLIENTES/<TENANT>/<template>/` recebe templates específicos de cliente.
- `sandbox/`, `_EH5/` e `archive/` permanecem em suas pastas atuais.

Classificar o template antes de implementar. Esta regra não exige mover templates existentes; qualquer migração de pasta deve ser uma tarefa explícita e independente.

## Toolchain local

- Templates não armazenam `node_modules/` nem `package-lock.json`.
- TailwindCSS é usado pela instalação global do workspace: os scripts devem chamar `tailwindcss` diretamente, sem `npx` e sem `devDependencies` locais.
- Antes de iniciar o watcher, confirmar `Get-Command tailwindcss` ou `tailwindcss --version`. Se o comando global não existir, sinalizar o bloqueio; não executar `npm install` dentro da pasta do template.
- O watcher permitido é `npm run dev`; não executar `npm run build` neste repositório.

## 0. Antes de qualquer edição

1. Confirmar branch atual e alterações pendentes. Se houver mudanças de outro tema no working tree, não descartar — sinalizar e manter fora do escopo desta branch.
2. Criar/confirmar a branch temática seguindo `.github/BRANCHING.md`. Nunca editar arquivos antes disso.
3. Classificar o pedido: criação nova, derivação de template existente, correção/manutenção, performance/hardware fraco, ou migração de versão do EBHTML.
4. Consultar aprendizados aplicáveis na skill responsável/README existente. Identificar comportamento a mudar, vizinhos a preservar e teste discriminante; não reler referências já disponíveis sem mudança nas dependências.

## 1. Briefing — perguntar só o que não dá para inferir

### Criação ou derivação (briefing completo)

1. Tenant/cliente e nome do template.
2. Criação do zero ou baseado em um template existente? Qual, e por quê (padrão comprovado, mesmo tipo de dado, mesmo layout)?
3. Canais/datasets: nomes, campos, aliases, filtros (`amount`, `f_*`, `order`), quantidade esperada.
4. Existe XML/JSON real de exemplo? Quais campos são obrigatórios e quais são opcionais?
5. Política para dado ausente, inválido, desatualizado ou malformado — o que renderizar, o que ocultar, o que aborta o item.
6. Quais players/builders/browsers precisam ser suportados (Chromium 78, Android+WebKit legado, QtWebKit legado tipo EBHTMLBuilder 3.0.5, outro)?
7. O template roda em hardware historicamente fraco? Precisa de modo reduzido?
8. O usuario restringiu a um formato ou array/lista de resolucoes? Respeitar EXATAMENTE a lista mais recente, inclusive formatos ineditos, sem expandir por tenant/proporcao. Sem restricao, usar todas as resolucoes do catalogo. Lista vazia/invalida requer correcao; proporcao sem dimensoes requer confirmacao. Registrar matriz e snapshot no README unico; prioridades so alteram ordem, nao cobertura.
9. Existem referências visuais, identidade, logo, fontes, imagens ou vídeos do tenant?
10. Estrutura de exibição: só conteúdo, ou intro/conteúdo/outro? Qual duração e regra de finalização?
11. Regra tipográfica: pode cortar/truncar texto ou precisa caber sempre? Há uniformização entre cards?
12. Precisa de preview/extranet e dados mock para desenvolvimento?
13. Nome/variantes esperadas do `.eh5` final.

### Correção ou manutenção (briefing reduzido)

1. Reproduzir o problema relatado no caminho real, com dado, fonte, CSS e assets efetivos. Se isso estiver bloqueado, declarar a limitação; simulação não comprova correção no player.
2. Inspecionar o template para identificar tenant, perfil de compatibilidade e versão do EBHTML já em uso — não perguntar o que o código já responde.
3. Perguntar apenas o delta: o que mudou, se há novo requisito de dado/layout, se a correção deve ser retroaplicada a outros templates com o mesmo padrão.

## 2. Selecionar base e carregar skills

- Formatos, arrays de resolucoes, faixas, LED e matriz de producao: carregar `edgecontents-display-formats` em toda criacao/manutencao. Fonte: `docs/07-formatos-e-validacao.md`; auditar CSVs e registrar escopo explicito ou integral antes de implementar.
- Ciclo de playlist, `addData`, filtros, `loaded/finished`, watchdog e o bug conhecido de zero itens: carregar `ebhtml-api`.
- Breakpoints por aspect-ratio, sistema de fontes, anti-overlap, price blocks: carregar `frontend-tailwind-golden-ratio`.
- Base executável: `_template-base/` (EBHTML 2.0.7). Não copiar de outra pasta de template sem antes comparar `ebhtml.js` com a fonte canônica.
- Template de referência (quando houver): extrair apenas o padrão comprovado citado no briefing, não a pasta inteira — nem toda decisão de um template antigo é válida hoje.

## 3. Implementação

- ES5 por padrão; aplicar exceção de tenant somente no perfil/escopo documentado, como CCXP 2026.
- `js/config.js` com um único objeto `CONFIG` (timing, dataset, layout/área segura, colors), carregado antes de mock/master e aplicado via `aplicarConfigVisual()` antes de revelar o conteúdo.
- `loader.load(sucesso, erro)` sempre com os dois argumentos.
- Todo o parsing/render do callback de sucesso dentro de `try/catch` que finaliza no `catch`.
- Em layouts com múltiplas categorias, manter polling e paginação independentes por coluna; paginação não pode bloquear o re-render da página visível quando o fingerprint dos dados mudar.
- Handlers de imagem/mídia antes do `src`.
- Watchdog de segurança para loader e para mídia assíncrona.
- Body nunca oculto por inteiro — só o container de dados dinâmicos.
- SVG sempre injetado inline via XHR.
- Tipografia: escala base em `vmin` no body, `em`/`%` nos filhos; autofit por busca binária limitada (7-10 medições), nunca loop decremental sem limite; medir com o elemento em `opacity:0`, nunca `display:none`; definir tamanho mínimo e política de overflow/truncamento explícita; recalcular no resize com debounce.
- Hardware fraco, preview e `localStorage`: aplicar somente quando o briefing indicou necessidade real (ver `docs/00-governanca-e-arquitetura.md`). Retry de loader não é universal: em conteúdo opcional ou ausente, erro/vazio/timeout deve chamar `finished()` e liberar o próximo item; retry limitado só cabe quando o briefing confirma que os dados deveriam existir e a falha transitória é recuperável.

### Configuração e assets

- `CONFIG.timing`: duração e fade; `dataset`: nome e filtros; `layout`: área segura; `colors`: ajustes do cliente via variáveis CSS com fallback em `input.css`. Não espalhar literais pela lógica/HTML. Referência: `CLIENTES/ASSAIFARMA/assaifarma_varejo/js/config.js`.
- Área segura do fundo: calcular cabeçalho/rodapé como `px / altura total * 100`, aplicar no container antes de revelar; não estimar por classes fixas. Definir fallback das cores e duração da transição.
- Legado Chromium 78: sem `clamp()`, gap em flex ou aspect-ratio sem fallback; usar margens, fallbacks hex e dimensões compatíveis. Body em `vmin`, filhos em `em`/`%`, salvo composição dimensional específica documentada.
- No perfil Android/baixo desempenho, detectar antes do onload (Android, `deviceMemory <= 1` ou `hardwareConcurrency <= 2`; override `?hwfraco=1`), desativar efeitos SVG e entrada somente nesse caminho. Preservar transições e animações no caminho normal e testar ambos. Não aplicar essa detecção em perfis que a dispensam.
- Não ocultar o body; manter fundo visível e medir dados com `opacity:0` até assets prontos. SVG sempre inline por XHR; cache por URL para assets repetidos entre cards/itens.
- Vídeo no legado: validar `canPlayType()` e reprodução no build alvo; Chromium sem codecs proprietários exige WebM/VP8 ou VP9, preferindo VP9 sem áudio. Não concluir compatibilidade pelo Chrome moderno.
- MP4 quando exigido pelo device: H.264 Constrained Baseline, largura múltipla de 16, `yuv420p`, zero B-frames, AAC-LC silencioso quando necessário ao Stagefright, `+faststart`/brand `isom`. Manter originais fora do runtime.
- Vídeo: `playsinline` e `webkit-playsinline`, tratar rejeição de `play()` com retry mudo, `ended` e fallback por `timeupdate` próximo da duração; erro/watchdog finalizam via guarda única `loaded()` -> `finished()`.

## 4. Gates — nada é "concluído" sem isto

### Lembrete recorrente: criacao e ajustes

- Em todo pedido de criacao ou manutencao, retomar `edgecontents-display-formats`, mesmo que o usuario nao mencione formatos/responsividade. Em manutencao, recuperar o escopo registrado e reconcilia-lo com a solicitacao atual; nunca ampliar uma restricao explicita sem aprovacao.
- Alteracoes de layout, fonte, conteudo dinamico, imagens, CSS ou autofit exigem rever responsividade nas resolucoes do escopo. Em ajustes sem impacto visual, registrar a justificativa dos checks nao aplicaveis, sem presumir nova homologacao.
- Antes de uma execucao extensa, apresentar quantidade de formatos/cenarios e custo local esperado. Preferir resumos e inspecao dirigida de evidencias; nao enviar centenas de capturas ao modelo. Uma checagem curta do runner nao satisfaz o gate integral.
- Na entrega, explicitar matriz usada, verificacoes executadas, resultado e pendencias de revisao visual/runtime. Se nao foi possivel executar, registrar o motivo e o proximo passo; nao marcar como aprovado.

### Verificacoes obrigatorias

1. Briefing fechado e registrado no README do template (único arquivo, sem docs concorrentes locais).
2. `ebhtml.js` conferido contra `_template-base` (mesma versão/hash).
3. `js/config.js` presente com `CONFIG` cobrindo timing/dataset/layout/colors, sem literais soltos equivalentes no HTML/master.js.
4. Sintaxe e recursos compatíveis com o perfil do tenant; ES5 no legado.
4. Todo caminho assíncrono finaliza exatamente uma vez: sucesso, erro, timeout, exceção de parsing, imagem em cache, imagem quebrada, mídia sem evento.
5. Reload agressivo (F5 repetido) não trava o item.
6. Todos os formatos do escopo validados: lista explicita EXATA ou catalogo integral quando nao houve restricao. Conferir esperados/executados, viewport real e arquivo servido. Sucesso automatizado nao substitui revisao visual e homologacao no runtime; registrar bloqueios/excecoes sem omissoes silenciosas.
7. Hardware fraco validado quando aplicável (`?hwfraco=1` + CPU throttle).
8. Mock/scripts de desenvolvimento desativados para produção.
9. Testado em `http://localhost:12099/FILES/1/index.html` — nunca `file:///`, nunca outro servidor.
10. Regressão integrada ao comando documentado e comportamentos adjacentes preservados. Quando prático, verificar que o teste falha com o comportamento anterior. Testes visuais exercitam a montagem real; unidade/simulação não substitui essa evidência.
11. Após corrigir erro, atualizar o registro existente com causa confirmada, prevenção e teste/comando; não criar documentação por incidente. Não registrar hipótese como causa.
12. Somente se autorizado gerar/substituir o `.eh5`: reabrir e conferir conforme seção 5. Commit, merge e publicação também exigem autorização específica, sem solicitar novamente a já vigente.

## 5. Empacotamento `.eh5`

- Executar somente quando o pedido autorizar esta etapa; corrigir/testar não a autoriza implicitamente. Se o usuário já gerou o pacote e pediu só commit/merge, conferir o arquivo existente sem regenerá-lo.
- O `.eh5` é um pacote ZIP renomeado. Deve conter só o necessário para o runtime.
- Excluir: mocks ativos, `node_modules`, `package.json`/`tailwind.config.js` de build, `css/input.css` fonte (manter apenas `master.css` compilado), fontes/assets de desenvolvimento não usados.
- Após gerar, reabrir o pacote e conferir: `index.html` presente, referências resolvíveis, assets/fontes presentes, versão do `ebhtml.js`, ausência de caminho absoluto local, nome do pacote identificando tenant/template/versão.
- Homologar o pacote no player/builder alvo, não só a pasta fonte.

## Checklist final (copiar para o PR)

- [ ] Branch temática única para este tema
- [ ] Briefing completo ou reduzido registrado
- [ ] EBHTML == `_template-base` (2.0.7 para templates novos)
- [ ] `js/config.js` com `CONFIG` (timing/dataset/layout/colors) aplicado via `aplicarConfigVisual()`
- [ ] Compatibilidade do perfil preservada; ES5 no legado
- [ ] `loaded()` sempre antes de `finished()` em todos os caminhos, incluindo vazio, erro e exceção (nunca `finished()` sozinho: reinício da máquina pelo `ebclient`)
- [ ] Watchdog presente; retry somente quando a recuperação de dados estiver justificada no briefing
- [ ] Body visível; só dados dinâmicos ocultos durante carregamento
- [ ] SVG inline via XHR
- [ ] Tipografia com autofit e limites definidos
- [ ] Matriz explicita exata ou catalogo integral, snapshot/hash e resultados por formato/cenario; nenhuma expansao ou omissao silenciosa
- [ ] Revisao visual e runtime alvo separados de testes sinteticos/Chromium moderno; pendencias e excecoes humanas identificadas
- [ ] Preview/hardware fraco/`localStorage` — decisão registrada, não assumida
- [ ] Testado em `http://localhost:12099/FILES/1/index.html`
- [ ] Regressão no gate documentado e comportamentos adjacentes preservados
- [ ] Se autorizado: `.eh5` gerado/reaproveitado, reaberto e validado; caso contrário, entrega pendente sem alterar o pacote
