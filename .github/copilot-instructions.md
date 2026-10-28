# EdgeContents Digital Signage

Templates HTML para EdgeContents CMS. Responder em pt-BR, de forma curta, clara e direta: resultado, evidência e pendência relevante. Sem dramatização, elogios, repetição ou narração de cada comando.

## Escopo e fontes

- Seguir [governança](../docs/00-governanca-e-arquitetura.md) e [branches](BRANCHING.md). Antes de editar, conferir Git, criar/confirmar branch temática e preservar alterações do usuário.
- ES5 e WebKit legado/Android 7+ são o padrão do runtime. Exceções de tenant prevalecem apenas no escopo documentado, como [CCXP 2026](instructions/ccxp-2026.instructions.md), que permite ES6+ no player Windows.
- Em criação/manutenção, seguir [workflow](skills/edgecontents-template-workflow/SKILL.md). Carregar somente referências aplicáveis ainda ausentes do contexto; não redescobrir fatos verificados sem mudança nos arquivos/dependências.
- Após erro corrigido, atualizar a skill responsável ou o README existente com causa confirmada, prevenção e teste de regressão. Consultar esse aprendizado antes de alterar o mesmo comportamento; não criar documentação por incidente nem generalizar regras de cliente.

## Autorizações

- Corrigir/testar não autoriza gerar ou substituir `.eh5`, commitar, mesclar ou publicar. Executar somente as etapas explicitamente autorizadas, sem pedir novamente uma autorização vigente para o mesmo escopo.
- Nunca incluir coautoria/atribuição de IA em commits ou PRs.
- Configurações globais/gerenciadas exigem autorização específica; autenticação, MCP, plugins e agentes arquivados ficam fora do escopo de templates.

## Formatos e validação

- Em toda criação/manutenção/validação, consultar [formatos](skills/edgecontents-display-formats/SKILL.md) e [contrato de validação](../docs/07-formatos-e-validacao.md).
- Lista/formato explícito define EXATAMENTE o escopo, inclusive inédito. Sem restrição, usar todas as resoluções únicas do catálogo. Lista vazia/inválida exige correção; proporção sem dimensões exige confirmação. Nunca ampliar silenciosamente.
- Registrar matriz/snapshot e evidências no README; antes de execução extensa, informar quantidade de formatos/cenários e impacto local. Não tratar amostra, matriz gerada ou Chromium moderno como homologação integral no runtime alvo.
- Testar apenas em `http://localhost:12099/FILES/1/index.html`, servido por `ebcliente4.exe`. Nunca `file://`, Live Server ou outro servidor. Confirmar conexão, slot e identidade dos arquivos servidos antes de validar.
- Primeiro reproduzir o defeito e identificar o que deve permanecer igual. Validar o caso discriminante no caminho real, com dados, fonte, CSS e assets efetivos; testes sintéticos são complementares.
- Incluir regressões no comando de testes documentado. Gate da raiz: `npm test`; testes do player continuam separados quando exigem serviço/hardware.

## Runtime e dados

- `js/ebhtml.js`: fonte canônica `_template-base/js/ebhtml.js` (2.0.7 para novos); conferir versão/hash antes de codificar. Nunca editar a biblioteca manualmente. Migrações de templates existentes na 2.0.3 são individuais, em branch própria e com regressão, nunca substituição em massa.
- Em todo encerramento: `loaded()` antes de `finished()`, exatamente uma vez, inclusive vazio/erro/timeout/exceção. Nunca `loader.error()`, `finished()` isolado ou `nodataiserror = true` com dataset obrigatório. Conteúdo ausente libera a playlist sem desenhar dados.
- `loader.load(sucesso, erro)` com os dois callbacks; parsing/render do sucesso protegido por `try/catch`; watchdog para dados e mídia. Handlers antes de `src`; em conteúdo válido, revelar dados/assets antes de `loaded()`.
- Não criar loader extra para campo/asset opcional: a interface nativa é global por página e pode finalizar o item prematuramente. Ler do registro já carregado. Dataset obrigatório vazio tem bug conhecido em `browserdata_checkloaded`; usar a mitigação da [API EBHTML](skills/ebhtml-api/SKILL.md), sem alterar a biblioteca.
- Polling/paginação independentes por categoria; alteração dos dados atualiza imediatamente a página visível, mesmo com timer de rotação ativo. Detalhes e padrões na API EBHTML.

## Layout, assets e ferramentas

- Novos/derivados têm `js/config.js` com `CONFIG` de timing, dataset/filtros, layout/área segura e cores, antes de mock/master; aplicar configuração visual antes de revelar dados. Não espalhar esses ajustes na lógica.
- Seguir [layout e tipografia](skills/frontend-tailwind-golden-ratio/SKILL.md): escala base em `vmin`, filhos em `em`/`%`, breakpoints por proporção e regra explícita de truncamento. Exceções dimensionais precisam do perfil de tela documentado.
- No legado: sem `clamp()`, gap em flex ou aspect-ratio sem fallback; manter cores compatíveis. Assets, cache, hardware fraco e codecs seguem o perfil e as regras do workflow, sem remover animações do caminho normal.
- Body visível; ocultar somente dados dinâmicos até assets prontos. SVG inline via XHR, nunca `<img src="*.svg">`; cache para assets repetidos por item.
- Tailwind global: comandos chamam `tailwindcss` diretamente. Nunca `npm run build`, `npx` ou dependências/lockfile locais em templates; usar `npm run dev`. Conferir watcher existente antes de iniciar outro e CSS servido após mudar classes.
- Um único README por template, máximo 50 linhas, com briefing, escopo, comandos, evidências e pendências. Tooling, fixtures e relatórios não entram no `.eh5`; mock desativado em produção.

Referências: `_template-base/`, `docs/`, `uol_responsivo_tw/`. Detalhes de implementação e entrega ficam nas skills acima, não em cópias destas instruções.