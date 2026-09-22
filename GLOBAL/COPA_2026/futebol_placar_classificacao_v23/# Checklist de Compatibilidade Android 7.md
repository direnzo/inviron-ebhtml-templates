# Checklist de Compatibilidade Android 7 (Chrome 51–64)

Template: futebol_placar_classificacao_v23  
Data: 2026-06-15  
Status: Em produção — falhou em Android 7

---

## 1. JavaScript ES5 (Obrigatório)

| Item | Status | Ação |
|------|--------|------|
| `const` / `let` | ✅ Não encontrado | — |
| Arrow functions `=>` | ✅ Não encontrado | — |
| Template strings `` `${var}` `` | ✅ Não encontrado | — |
| `.map()`, `.filter()`, `.find()`, `.includes()`, `.forEach()` | ✅ Não encontrado | — |
| `Promise`, `async/await`, `fetch()` | ✅ Não encontrado | — |
| `class` | ✅ Não encontrado | — |
| `Object.keys().sort()` (linha 308) | ⚠️ Usado | Testar em Chrome 51-64 |
| `localStorage` sem `try/catch` | 🔴 Falha | **Adicionar try/catch em todos os acessos** |

**Ação prioritária:** Envolver **todos** os `localStorage.getItem`/`setItem` em `try/catch`.

---

## 2. CSS — Fallbacks HEX para Cores com Opacidade (CRÍTICO)

Tailwind v3 gera `rgb(r g b / alpha)` — não funciona em Chrome < 65.

| Classe / Elemento | Fallback HEX | Status |
|-------------------|--------------|--------|
| `body` (`bg-green-950`) | `#052e16` | ✅ OK |
| `header` / `footer` borders | `#eab308` | ✅ OK |
| `.text-white` | `#ffffff` | ✅ OK |
| `.text-white/30`, `.text-white/50` | `rgba(...)` | ✅ OK |
| `.text-white/55`, `.text-white/60` | — | 🔴 Faltando |
| `bg-white/5`, `border-white/20`, `border-white/10` | — | 🔴 Faltando |
| `.standings-linha`, `.standings-linha--classificado` | — | 🔴 Faltando |
| `.standings-jogo-linha--ao-vivo` | — | 🔴 Faltando |
| `opacity-0`, `opacity-50`, `opacity-100` | — | 🟡 Parcial |

**Ação prioritária:** Adicionar todos os fallbacks hex/rgba no `input.css` (após `@tailwind utilities`).

---

## 3. Controle de Playlist (`loader.loaded()` / `loader.finished()`)

| Caminho | `loaded()` | `finished()` | Status |
|---------|------------|--------------|--------|
| D_SPD vazio | — | ✅ | OK |
| TITLE vazio | — | ✅ | OK |
| D_FOOTBALL sem dados | — | ✅ | OK |
| Erro no parse de JSON (TEXTO2) | — | ❓ | Verificar |
| Standings vazio / erro XHR | — | ❓ | Verificar |
| Sucesso (placar ou standings) | ✅ | ✅ (timeout) | OK |

**Ação prioritária:** Garantir `loader.finished()` em **todos** os caminhos de erro do modo Standings (`iniciarStandings`).

---

## 4. Vídeo e Intro (WebKit Antigo)

| Item | Status | Ação |
|------|--------|------|
| `vid.play()` sem Promise | ✅ Tem fallback | OK |
| Múltiplas tentativas (200ms / 800ms) | ✅ Presente | OK |
| Watchdog para `vid.ended` | ✅ Presente | OK |
| `playsinline + muted + autoplay` | ✅ Presente | OK |
| Teste real em Android 7 | ❓ | **Testar** |

---

## 5. Múltiplos Datasets e XHRs

Fluxo atual: