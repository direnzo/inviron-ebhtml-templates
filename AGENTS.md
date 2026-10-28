# EdgeContents: Entrada Para Agentes

- Ler [.github/copilot-instructions.md](.github/copilot-instructions.md) e [docs/00-governanca-e-arquitetura.md](docs/00-governanca-e-arquitetura.md) como regras do projeto, independentemente da ferramenta usada.
- Antes de editar, conferir Git e seguir [.github/BRANCHING.md](.github/BRANCHING.md). Preservar alteracoes do usuario; nao commitar ou mesclar sem autorizacao.
- Criacao/manutencao: carregar [.github/skills/edgecontents-template-workflow/SKILL.md](.github/skills/edgecontents-template-workflow/SKILL.md), que encaminha API, layout e formatos.
- Formatos: seguir o escopo exato e as evidencias definidos nas instrucoes e no workflow; nao expandir uma lista explicita.
- Ferramentas que nao descobrem `.github/skills` devem ler os arquivos referenciados explicitamente; nao manter copias divergentes em outras pastas de skills.
- Validar apenas em `http://localhost:12099/FILES/1/index.html` via ebcliente4. Nunca presumir que o slot aponta ao template editado.
- Runtime ES5 por padrao, com excecoes de tenant documentadas; `loaded()` antes de `finished()`, exatamente uma vez. Demais contratos ficam nas instrucoes e skills responsaveis.
- Correcao/teste e entrega sao etapas distintas: `.eh5`, commit, merge e publicacao somente quando explicitamente autorizados, sem repetir pedidos ja respondidos.
- Tooling compartilhado e documentacao: [docs/07-formatos-e-validacao.md](docs/07-formatos-e-validacao.md). Testes na raiz: `npm test`. Ferramentas de desenvolvimento nao entram no `.eh5`.
- Configuracoes globais/gerenciadas ficam fora desta entrega sem aprovacao especifica. Nao alterar autenticacao, MCP, plugins ou agentes arquivados.