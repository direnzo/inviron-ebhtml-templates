# Checklist de Compatibilidade — WebEngine Qt + Android 7

Template: futebol_placar_classificacao_v23  
Data: 2026-06-15  
Status: Em produção — correções de compatibilidade aplicadas

---

## 1. Diagnóstico WebEngine Qt (Concluído)

- **Ambiente:** Chromium/Blink (Windows NT 6.2), não WebKit antigo.
- **Resultados:**
  - ✅ **Flexbox:** SIM
  - ✅ **vmin:** SIM
  - ✅ **localStorage:** SIM
  - 🔴 **VIDEO mp4:** NÃO

**Conclusão:** O único problema real no WebEngine é a falta de suporte a vídeo MP4. Não são necessários fallbacks para flexbox ou vmin.

---

## 2. Correções Aplicadas (2026-06-15)

| Item | Status | Detalhes |
|------|--------|----------|
| **Fallbacks HEX/rgba** | ✅ Concluído | Adicionadas todas as cores com opacidade no `input.css` para compatibilidade com Chrome < 65. |
| **`localStorage`** | ✅ Concluído | Todos os acessos (`getItem`/`setItem`) envoltos em `try/catch` no `master.js`. |
| **Controle de Playlist** | ✅ Verificado | `loader.finished()` já era chamado em todos os caminhos de erro. Nenhuma alteração necessária. |
| **Fallback de Vídeo** | ✅ Concluído | Implementada lógica no `master.js` que detecta se MP4 não é suportado (`canPlayType`) e aplica fallback:<ul><li>**Vídeo de fundo:** usa `img/bg.png`</li><li>**Intro de patrocinador:** usa a mesma URL como `<img>`</li></ul> |

---

## 3. Itens Pendentes

| Prioridade | Item | Ação Sugerida |
|------------|------|---------------|
| 🟡 Média | Teste em Android 7 real | Validar se as correções de CSS (fallbacks hex) e JS (localStorage) são suficientes para o ambiente Android 7 (Chrome 51-64). |
| 🟢 Baixa | Revisar `Object.keys().sort()` | Confirmar se `sort()` em `Object.keys()` é 100% compatível com Chrome 51. |
| 🟢 Baixa | Testar fluxo de 4+ datasets | Validar se o carregamento em cadeia não causa timeout da playlist em hardware mais lento. |

---

## 4. Resumo de Prioridades (Atualizado)

| Prioridade | Item | Arquivo | Impacto | Status |
|------------|------|---------|---------|--------|
| ✅ Alta | Fallbacks HEX completos | `css/input.css` | Cores invisíveis | **Concluído** |
| ✅ Alta | `try/catch` em `localStorage` | `js/master.js` | Travamento | **Concluído** |
| ✅ Alta | Garantir `loader.finished()` | `js/master.js` | Playlist trava | **Verificado** |
| ✅ Média | Fallback de vídeo (WebEngine) | `js/master.js` | Vídeo não toca | **Concluído** |
| 🟡 Média | Teste em Android 7 real | — | Validar correções | **Pendente** |
| 🟢 Baixa | Revisar `Object.keys().sort()` | `js/master.js` | Compatibilidade | **Pendente** |

---

## Próximos Passos

1. **Testar no WebEngine Qt** para confirmar que o fallback de vídeo (`img/bg.png`) funciona em todos os estados (pré-jogo, ao vivo, pós-jogo, standings).
2. **Testar em Android 7 real** (se disponível) para validar as correções de CSS e `localStorage`.
3. **Remover o script de diagnóstico** (`js/diagnostico-webengine-visual.js`) do `index.html` após a validação final.
4. **Criar/atualizar o `README.md`** do template com as lições aprendidas e instruções de compatibilidade.

