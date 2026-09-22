# Checklist de Migração/Unificação – Caminhos + Segunda Fase Futebol

## 1. Estrutura HTML e Grid Fixo
- [ ] Copiar a estrutura de colunas e IDs do index.html do caminhos_futebol para o index.html do template unificado
- [ ] Garantir que todos os cards tenham IDs fixos conforme SLOT_MAP
- [ ] Incluir o elemento <svg id="bracket-svg"> para as linhas

## 2. Scripts e Ordem de Carregamento
- [ ] Incluir bracket-draw.js no template unificado (copiar do caminhos_futebol)
- [ ] Garantir ordem: utils.js → bracket-draw.js → brackets.js → cards.js → master.js

## 3. Renderização dos Dados (Modo Brackets)
- [ ] Adaptar brackets.js para:
    - [ ] Preencher todos os slots do grid fixo (SLOT_MAP) com os dados recebidos
    - [ ] Não criar cards dinamicamente, apenas preencher os existentes
    - [ ] Chamar BracketDraw.init() após renderizar os cards

## 4. SVG e Linhas de Ligação
- [ ] Garantir que BracketDraw.init() desenhe as linhas corretamente após os cards estarem preenchidos
- [ ] Testar resize e responsividade do SVG

## 5. Animações e Destaques
- [ ] Replicar animações de entrada dos cards e linhas (animarEntradaBracket, BracketDraw.animarLinhas)
- [ ] Garantir destaques para Brasil, campeão, partida recente, caminho do vencedor

## 6. Utilitários e Cores
- [ ] Usar Utils para aplicar cor de fundo, cor de texto e patrocinador em ambos os modos
- [ ] Validar aplicação de cor e patrocinador no grid e footer

## 7. Alternância de Modos
- [ ] Alternar corretamente entre modo brackets (chaveamento visual) e cards (cards grandes) via flag em D_SPD
- [ ] Testar alternância em mock e dados reais

## 8. Ocultamento de Fases Anteriores
- [ ] Implementar ocultamento de colunas de fases anteriores quando fase seguinte estiver completa

## 9. Testes Finais
- [ ] Validar visual e funcionalmente em todos os formatos de tela
- [ ] Validar responsividade e zoom
- [ ] Validar README.md com instruções e exemplos de configuração de D_SPD

---

**Observação:**
- Não alterar a lógica de cards.js (modo cards grandes) sem necessidade
- Garantir que o modo brackets seja fiel ao visual do caminhos_futebol
- Manter código ES5 e compatibilidade Android 7+
