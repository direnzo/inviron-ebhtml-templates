# EdgeContents: Entrada Para Agentes

- Ler [.github/copilot-instructions.md](.github/copilot-instructions.md) e [docs/00-governanca-e-arquitetura.md](docs/00-governanca-e-arquitetura.md) como regras do projeto, independentemente da ferramenta usada.
- Antes de editar, conferir Git e seguir [.github/BRANCHING.md](.github/BRANCHING.md). Preservar alteracoes do usuario; nao commitar ou mesclar sem autorizacao.
- Criacao/manutencao: carregar [.github/skills/edgecontents-template-workflow/SKILL.md](.github/skills/edgecontents-template-workflow/SKILL.md), que encaminha API, layout e formatos.
- Formatos: carregar [.github/skills/edgecontents-display-formats/SKILL.md](.github/skills/edgecontents-display-formats/SKILL.md). Um formato ou array/lista explicitamente solicitado define EXATAMENTE o escopo. Sem restricao, todas as resolucoes do catalogo. Formato inedito e valido; entrada vazia/invalida nao autoriza ampliar a lista.
- Ferramentas que nao descobrem `.github/skills` devem ler os arquivos referenciados explicitamente; nao manter copias divergentes em outras pastas de skills.
- Validar apenas em `http://localhost:12099/FILES/1/index.html` via ebcliente4. Nunca presumir que o slot aponta ao template editado.
- Runtime ES5; `loaded()` antes de `finished()`, exatamente uma vez. Nunca editar ebhtml.js, executar npm run build ou instalar dependencias em templates.
- Tooling compartilhado e documentacao: [docs/07-formatos-e-validacao.md](docs/07-formatos-e-validacao.md). Testes na raiz: `npm test`. Ferramentas de desenvolvimento nao entram no `.eh5`.
- Configuracoes globais/gerenciadas ficam fora desta entrega sem aprovacao especifica. Nao alterar autenticacao, MCP, plugins ou agentes arquivados.