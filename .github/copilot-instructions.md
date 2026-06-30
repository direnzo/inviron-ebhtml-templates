# EdgeContents Digital Signage — Instruções do Copilot

Sistema de templates HTML para Digital Signage via EdgeContents CMS. Android 7+ (WebKit legado).

## 🚫 REGRAS ABSOLUTAS

- **NUNCA** `git commit` sem permissão explícita
- **NUNCA** `npm run build` — use `npm run dev` (watch mode, compila automático)
- **ES5 OBRIGATÓRIO** — zero tolerância para ES6+ (WebKit legado)

## ⚡ ES5 — Proibido vs Permitido

| ❌ Proibido (ES6+) | ✅ Use (ES5) |
|---|---|
| `const` / `let` | `var` |
| Arrow `() => {}` | `function() {}` |
| `` `template ${var}` `` | `'concat ' + var` |
| `async/await`, `Promise` | Callbacks |
| `class` | Function constructors |
| `...spread`, destructuring | Acesso direto |
| `.find()` / `.includes()` / `.map()` | `for (var i=0; i<len; i++)` |
| `for...of` | `for (var i=0; i<len; i++)` |
| `fetch()` | `XMLHttpRequest` |

---
## ⛔ REGRAS DE OURO

### ⛔ DOCUMENTAÇÃO MÍNIMA
- **NÃO criar múltiplos arquivos** de documentação (STATUS.md, CONFIG.md, RESUMO.md, etc)
- **UM ÚNICO README.md** por template - máximo 50 linhas, direto ao ponto
- **MENOS É MAIS** - use mínimo de linhas possível
- **SEM FIRULAS** - sem emojis excessivos, sem formatação desnecessária, sem seções longas
- Consolide TUDO em README.md único e conciso

### 📚 Docs de referência

- `/docs/README.md` — índice geral
- `/docs/02-xml-format.md` — estrutura XML/EBDATA
- `/docs/05-api-reference.md` — API EBHTML
- `/docs/04-troubleshooting.md` — debug
- `.github/skills/ebhtml-api/SKILL.md` — skill completo da API EBHTML
- `.github/skills/frontend-tailwind-golden-ratio/SKILL.md` — skill de layout/fontes

---

## ⚠️ REGRAS CRÍTICAS (NUNCA VIOLAR)

### 1. Controle de Playlist EBHTML
```javascript
loader.loaded();   // ✅ SEMPRE (sucesso OU erro)
loader.finished(); // ✅ SEMPRE (sucesso OU erro)
```

### 2. CSS Compatível (Chromium 78)
| ❌ Proibido | Requer | ✅ Alternativa |
|---|---|---|
| `clamp()` | Chrome 79+ | `vmin`/`vw`/`vh` simples |
| `gap-*` em flex | Chrome 84+ | `space-x-*`/`space-y-*` (margin) |
| `aspect-*` isolado | Chrome 88+ | Fallback `@supports not` c/ padding |
| `rgb(r g b / alpha)` | Chrome 65+ | Fallbacks hex em `input.css` |

### 3. Sistema de Fontes (vmin)
- **Body**: `font-size` em `vmin` (ex: `text-[3.2vmin]`)
- **Filhos**: SOMENTE `em` ou `%` — NUNCA `vw`/`vh`/`vmin` em filhos
- **NUNCA** `portrait:text-[X]` em filhos — ajuste o body

```html
<body class="text-[3.2vmin] superbanner:text-[5vmin] empena:text-[11vmin]">
  <span class="text-[1.3em]">Título</span>
```

### 4. Breakpoints Aspect Ratio
```javascript
screens: { // tailwind.config.js
    'portrait': { 'raw': '(max-aspect-ratio: 3/4)' },
    'empena': { 'raw': '(max-aspect-ratio: 1/3)' },
    'superbanner': { 'raw': '(min-aspect-ratio: 5/1) and (max-aspect-ratio: 15/1)' },
    'ultrawide': { 'raw': '(min-aspect-ratio: 3/1)' },
}
```

---

## 📋 Checklist

- [ ] ES5 — sem `let/const/arrow/template strings`
- [ ] `loader.loaded()` após sucesso, `loader.finished()` sempre
- [ ] `MOCK_DATA.enabled = false` em produção
- [ ] Sem `clamp()` / sem `gap-*` em flex / fallbacks hex
- [ ] `font-size` body em `vmin`, filhos em `em`/`%`

---

**Arquivos-chave:** `_template-base/`, `js/ebhtml.js`, `/docs/`, `.github/skills/`, `uol_responsivo_tw/` (referência)
