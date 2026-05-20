## Plano: Template “tabela_futebol” (Fase de Grupos Copa do Mundo)

Vamos criar um novo template chamado “tabela_futebol”, baseado no “placar_futebol”, para exibir a tabela de resultados dos jogos da fase de grupos da Copa do Mundo 2026. O template mostrará um grupo por vez, com dados mockados inspirados no exemplo do Google.

### TL;DR
- Novo template “tabela_futebol” (branch dedicada)
- Base: estrutura e lógica do “placar_futebol”
- Mock dos dados conforme tabela de grupos da Copa do Mundo
- Seguir regras críticas: ES5 puro, controle de playlist EBHTML, Tailwind compatível Android 7, README único e objetivo
> **REGRA DE FONTES:** `font-size` base no `<body>` via `vmin` (ex: `text-[3.2vmin]`). Overrides apenas para superbanner/empena. Filhos usam **somente `em` ou `%`** — nunca `portrait:text-[X]`, `landscape:text-[X]` em elementos filhos.
---

**Fases e Passos**

### 1. Preparação do Projeto
1. Criar branch: feat/template-tabela_futebol
2. Copiar pasta “placar_futebol” para nova pasta “tabela_futebol”
3. Renomear arquivos e ajustar referências internas (nome do template, README, package.json, etc.)

### 2. Mock de Dados
1. Analisar a tabela da URL fornecida para definir o formato dos dados mockados (grupos, times, jogos, pontos, vitórias, saldo, etc.)
2. Criar/ajustar js/mock-data.js para conter:
   - Estrutura de grupos (A, B, C…)
   - Lista de times por grupo
   - Jogos realizados, resultados, classificação (pontos, vitórias, saldo, gols pró/contra)
   - Exemplo fiel ao modelo do Google

### 3. Estrutura e Layout
1. Adaptar index.html para exibir um grupo por vez (com navegação ou rotação automática)
2. Layout responsivo usando Tailwind, com classes compatíveis Android 7 (sem clamp, com fallbacks hex)
3. Exibir:
   - Nome do grupo
   - Tabela de classificação (Time, Jogos, Vitórias, Empates, Derrotas, Gols Pró, Gols Contra, Saldo, Pontos)
   - Lista de jogos do grupo (opcional, se couber)
4. Garantir animações e transições suaves (fade-in, transição de grupo)

### 4. Lógica JS (master.js)
1. Carregar dados mockados ou do loader EBHTML
2. Implementar lógica para alternar grupos (timer ou navegação manual)
3. Garantir chamadas corretas de loader.loaded() e loader.finished()
4. Ajustar detecção de aspect-ratio para responsividade

### 5. CSS (input.css)
1. Garantir fallbacks hex para todas cores usadas
2. Ajustar fontes e espaçamentos para caber em todos formatos de tela

### 6. Documentação
1. README.md único, objetivo, até 50 linhas, explicando uso, estrutura dos dados e preview

---

**Arquivos Relevantes**
- tabela_futebol/index.html — layout principal
- tabela_futebol/js/master.js — lógica do template
- tabela_futebol/js/mock-data.js — mock dos dados de grupos/jogos
- tabela_futebol/css/input.css — ajustes de cor/fonte
- tabela_futebol/README.md — documentação única

---

**Verificação**
1. Validar branch criada e estrutura copiada
2. Conferir mock-data.js fiel ao modelo do Google
3. Testar navegação/rotação entre grupos
4. Validar responsividade (portrait, landscape, ultrawide)
5. Conferir loader.loaded()/finished() no fluxo
6. Garantir ausência de ES6+, clamp(), cores sem fallback
7. README único, conciso

---

**Decisões**
- Base: placar_futebol (garante compatibilidade e reaproveitamento)
- Dados mockados inspirados na tabela Google (URL fornecida)
- Um grupo por vez na tela (rotativo ou navegável)
- Seguir regras críticas do projeto (ES5, Tailwind, playlist EBHTML, README único)

---

**Considerações Finais**
1. Navegação entre grupos: Timer automático (ex: 10s) ou setas manuais? (Sugestão: timer, mas deixar função para ambos)
2. Exibir jogos do grupo junto da tabela ou só classificação? (Sugestão: só classificação, jogos como extra se couber)
3. Garantir que todos campos da tabela estejam no mock (Time, Jogos, Vitórias, Empates, Derrotas, Gols Pró, Gols Contra, Saldo, Pontos)

Se quiser ajustar algum detalhe (timer, layout, campos exibidos), só avisar!