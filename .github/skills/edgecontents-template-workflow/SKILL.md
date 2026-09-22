---
name: edgecontents-template-workflow
description: "Use when: criar template EdgeContents do zero, derivar de um existente, corrigir/manter um template, ou preparar um .eh5 para homologação. Conduz o briefing obrigatório (tenant, canais, compatibilidade, hardware, formatos, referências visuais, tipografia), carrega ebhtml-api e frontend-tailwind-golden-ratio, e aplica os gates até o pacote final."
---

# Workflow de Templates EdgeContents — Criação e Manutenção

## Propósito

Orquestrar o ciclo completo de um template EdgeContents: briefing -> branch temática -> implementação -> validação -> homologação -> `.eh5`. Esta skill não substitui `ebhtml-api` (API/ciclo de playlist) nem `frontend-tailwind-golden-ratio` (layout/tipografia) — ela decide quando carregá-las e garante que nenhuma etapa seja pulada.

Ver separação global/tenant em `docs/00-governanca-e-arquitetura.md` antes de classificar qualquer decisão.

## Estrutura manual dos templates

- `_template-base/` permanece canônico na raiz e é a única fonte para copiar a base executável.
- `GLOBAL/<template>/` recebe templates reutilizáveis ou sem tenant definido.
- `CLIENTES/<TENANT>/<template>/` recebe templates específicos de cliente.
- `sandbox/`, `_EH5/` e `archive/` permanecem em suas pastas atuais.

Classificar o template antes de implementar. Esta regra não exige mover templates existentes; qualquer migração de pasta deve ser uma tarefa explícita e independente.

## 0. Antes de qualquer edição

1. Confirmar branch atual e alterações pendentes. Se houver mudanças de outro tema no working tree, não descartar — sinalizar e manter fora do escopo desta branch.
2. Criar/confirmar a branch temática seguindo `.github/BRANCHING.md`. Nunca editar arquivos antes disso.
3. Classificar o pedido: criação nova, derivação de template existente, correção/manutenção, performance/hardware fraco, ou migração de versão do EBHTML.

## 1. Briefing — perguntar só o que não dá para inferir

### Criação ou derivação (briefing completo)

1. Tenant/cliente e nome do template.
2. Criação do zero ou baseado em um template existente? Qual, e por quê (padrão comprovado, mesmo tipo de dado, mesmo layout)?
3. Canais/datasets: nomes, campos, aliases, filtros (`amount`, `f_*`, `order`), quantidade esperada.
4. Existe XML/JSON real de exemplo? Quais campos são obrigatórios e quais são opcionais?
5. Política para dado ausente, inválido, desatualizado ou malformado — o que renderizar, o que ocultar, o que aborta o item.
6. Quais players/builders/browsers precisam ser suportados (Chromium 78, Android+WebKit legado, QtWebKit legado tipo EBHTMLBuilder 3.0.5, outro)?
7. O template roda em hardware historicamente fraco? Precisa de modo reduzido?
8. Quais formatos/proporções são prioritários (portrait, landscape, square, ultrawide, superbanner, empena)?
9. Existem referências visuais, identidade, logo, fontes, imagens ou vídeos do tenant?
10. Estrutura de exibição: só conteúdo, ou intro/conteúdo/outro? Qual duração e regra de finalização?
11. Regra tipográfica: pode cortar/truncar texto ou precisa caber sempre? Há uniformização entre cards?
12. Precisa de preview/extranet e dados mock para desenvolvimento?
13. Nome/variantes esperadas do `.eh5` final.

### Correção ou manutenção (briefing reduzido)

1. Reproduzir o problema relatado (travamento, tela preta, dado quebrado, corte visual).
2. Inspecionar o template para identificar tenant, perfil de compatibilidade e versão do EBHTML já em uso — não perguntar o que o código já responde.
3. Perguntar apenas o delta: o que mudou, se há novo requisito de dado/layout, se a correção deve ser retroaplicada a outros templates com o mesmo padrão.

## 2. Selecionar base e carregar skills

- Ciclo de playlist, `addData`, filtros, `loaded/finished`, watchdog e o bug conhecido de zero itens: carregar `ebhtml-api`.
- Breakpoints por aspect-ratio, sistema de fontes, anti-overlap, price blocks: carregar `frontend-tailwind-golden-ratio`.
- Base executável: `_template-base/` (EBHTML 2.0.7). Não copiar de outra pasta de template sem antes comparar `ebhtml.js` com a fonte canônica.
- Template de referência (quando houver): extrair apenas o padrão comprovado citado no briefing, não a pasta inteira — nem toda decisão de um template antigo é válida hoje.

## 3. Implementação — regras que não têm exceção

- ES5 puro.
- `loader.load(sucesso, erro)` sempre com os dois argumentos.
- Todo o parsing/render do callback de sucesso dentro de `try/catch` que finaliza no `catch`.
- Em layouts com múltiplas categorias, manter polling e paginação independentes por coluna; paginação não pode bloquear o re-render da página visível quando o fingerprint dos dados mudar.
- Handlers de imagem/mídia antes do `src`.
- Watchdog de segurança para loader e para mídia assíncrona.
- Body nunca oculto por inteiro — só o container de dados dinâmicos.
- SVG sempre injetado inline via XHR.
- Tipografia: escala base em `vmin` no body, `em`/`%` nos filhos; autofit por busca binária limitada (7-10 medições), nunca loop decremental sem limite; medir com o elemento em `opacity:0`, nunca `display:none`; definir tamanho mínimo e política de overflow/truncamento explícita; recalcular no resize com debounce.
- Hardware fraco, preview e `localStorage`: aplicar somente quando o briefing indicou necessidade real (ver `docs/00-governanca-e-arquitetura.md`). Retry de loader não é universal: em conteúdo opcional ou ausente, erro/vazio/timeout deve chamar `finished()` e liberar o próximo item; retry limitado só cabe quando o briefing confirma que os dados deveriam existir e a falha transitória é recuperável.

## 4. Gates — nada é "concluído" sem isto

1. Briefing fechado e registrado no README do template (único arquivo, sem docs concorrentes locais).
2. `ebhtml.js` conferido contra `_template-base` (mesma versão/hash).
3. ES5 e padrões proibidos ausentes.
4. Todo caminho assíncrono finaliza exatamente uma vez: sucesso, erro, timeout, exceção de parsing, imagem em cache, imagem quebrada, mídia sem evento.
5. Reload agressivo (F5 repetido) não trava o item.
6. Formatos prioritários do briefing validados visualmente.
7. Hardware fraco validado quando aplicável (`?hwfraco=1` + CPU throttle).
8. Mock/scripts de desenvolvimento desativados para produção.
9. Testado em `http://localhost:12099/FILES/1/index.html` — nunca `file:///`, nunca outro servidor.
10. `.eh5` gerado, reaberto e conferido (ver seção 5).

## 5. Empacotamento `.eh5`

- O `.eh5` é um pacote ZIP renomeado. Deve conter só o necessário para o runtime.
- Excluir: mocks ativos, `node_modules`, `package.json`/`tailwind.config.js` de build, `css/input.css` fonte (manter apenas `master.css` compilado), fontes/assets de desenvolvimento não usados.
- Após gerar, reabrir o pacote e conferir: `index.html` presente, referências resolvíveis, assets/fontes presentes, versão do `ebhtml.js`, ausência de caminho absoluto local, nome do pacote identificando tenant/template/versão.
- Homologar o pacote no player/builder alvo, não só a pasta fonte.

## Checklist final (copiar para o PR)

- [ ] Branch temática única para este tema
- [ ] Briefing completo ou reduzido registrado
- [ ] EBHTML == `_template-base` (2.0.7 para templates novos)
- [ ] ES5 sem regressão
- [ ] `loaded()/finished()` corretos em todos os caminhos, incluindo erro e exceção
- [ ] Watchdog presente; retry somente quando a recuperação de dados estiver justificada no briefing
- [ ] Body visível; só dados dinâmicos ocultos durante carregamento
- [ ] SVG inline via XHR
- [ ] Tipografia com autofit e limites definidos
- [ ] Preview/hardware fraco/`localStorage` — decisão registrada, não assumida
- [ ] Testado em `http://localhost:12099/FILES/1/index.html`
- [ ] `.eh5` gerado, reaberto e validado
