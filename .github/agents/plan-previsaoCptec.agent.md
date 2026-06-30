# Plano: Refatoração previsao_cptec — Layout Simplificado

**TL;DR**: Usar `vmin` como unidade universal de tipografia e `%` para tamanhos — eliminando completamente breakpoints de fonte. O template inteiro precisa de apenas **2 breakpoints**: `portrait` (muda direção dos cards) e `superbanner` (colapsa tudo em 1 linha). Nada mais.

---

## Por que vmin elimina os breakpoints de fonte

`vmin` = 1% da menor dimensão da tela. Funciona desde Chrome 26.

| Tela | vmin | 5vmin (cidade) | 6vmin (temp) |
|---|---|---|---|
| 1920×1080 landscape | 10.8px | **54px** | 65px |
| 1080×1920 portrait  | 10.8px | **54px** | 65px |
| 800×800 square      | 8px    | **40px** | 48px |
| 2040×720 ultrawide  | 7.2px  | **36px** | 43px |
| 1920×300 superbanner| 3px    | **15px** | 18px |

→ A fonte **escala automaticamente** — nunca gigante no ultrawide, nunca minúscula no portrait. **Zero necessidade de `wide:`, `ultrawide:`, `empena:` para tipografia.**

> ⚠️ `clamp()` é proibido (requer Chrome 79+). `vmin` faz a mesma coisa sem polyfill.

---

## Breakpoints: de 6 para 2

**Antes (atual):**
```
portrait / landscape / wide / ultrawide / superbanner / empena
```

**Depois (proposto):**
```
portrait    → muda direção dos cards (row ↔ col)
superbanner → colapsa tudo em 1 linha (layout completamente diferente)
```

`landscape`, `wide`, `ultrawide`, `empena` → **removidos**. Fontes e tamanhos em `vmin`/`%` cuidam de tudo.

---

## Diagramas ASCII

**PADRÃO — landscape 16:9, 4:3, square, ultrawide (tudo igual)**
```
┌─────────────────────────────────────────┐  100vw
│              Cidade CPTEC               │  12%
├─────────────────────────────────────────┤
│                                         │
│   ┌───────┐   ┌───────┐   ┌───────┐   │
│   │   ☀   │   │   ⛅   │   │   🌧   │   │  flex: 1
│   │Domingo│   │Segunda│   │ Terça │   │
│   │06/Abr │   │07/Abr │   │08/Abr │   │
│   │▲32 ▼18│   │▲30 ▼16│   │▲27 ▼14│   │
│   └───────┘   └───────┘   └───────┘   │
│                                         │
├─────────────────────────────────────────┤
│                        [ logo CPTEC ]   │  10%
└─────────────────────────────────────────┘

  body:    flex-col
  main:    flex-row, gap 2%, padding 2%
  card:    flex-col, width: 30%, padding 4%
  ícone:   width: 70% do card
  fontes:  vmin (escala automática em qualquer AR)
```

**PORTRAIT — max-aspect-ratio: 3/4 (único breakpoint estrutural)**
```
┌────────────────────┐  100vw
│   Cidade CPTEC     │  12%
├────────────────────┤
│  ┌────────────────┐│
│  │ [☀] Domingo    ││  ← card 1: flex-ROW
│  │     06/Abr     ││    ícone esquerda 30%
│  │     ▲32° ▼18°  ││    textos flex-1
│  └────────────────┘│
│  ┌────────────────┐│
│  │ [⛅] Segunda    ││  ← card 2
│  └────────────────┘│
│  ┌────────────────┐│
│  │ [🌧] Terça     ││  ← card 3
│  └────────────────┘│
├────────────────────┤  flex: 1
│      [ logo ]      │  10%
└────────────────────┘

  main:  flex-col (portrait:flex-col)
  card:  flex-row, width: 88% (portrait:w-[88%])
         flex-col → flex-row (portrait:flex-row)
  ícone: width: 28% do card (portrait:w-[28%])
```

**SUPERBANNER — min-aspect-ratio: 5/1 (único breakpoint de colapso)**
```
┌──────────┬──────────────┬──────────────┬──────────────┬──────┐
│  Cidade  │ ☀ Dom ▲32▼18 │ ⛅ Seg ▲30▼16 │ 🌧 Ter ▲27▼14 │ logo │
└──────────┴──────────────┴──────────────┴──────────────┴──────┘

  body:  grid grid-cols-[auto_1fr_1fr_1fr_auto] (superbanner:grid)
  tudo numa linha — header, 3 cards, footer viram colunas
  card:  flex-row compacto, ícone pequeno à esquerda
  fontes: vmin ainda funciona (300px alto → ~3px/vmin = compacto)
```

---

## Estrutura de camadas (responsabilidade única)

| Camada | Responsabilidade |
|---|---|
| `tailwind.config.js` | Definir 2 screens: `portrait`, `superbanner` + animações |
| `index.html` | Estrutura HTML + classes Tailwind estáticas (header/main/footer). Zero classes de breakpoints de fonte |
| `master.js` | Gerar HTML dos cards + preencher dados. Zero lógica de layout |
| `css/input.css` | `@font-face` + fallbacks hex Chrome < 65 + delays de animação |

---

## Tabela de classes por elemento

| Elemento | Classes base | `portrait:` | `superbanner:` |
|---|---|---|---|
| `body` | `flex flex-col` | — | `grid superbanner:grid-cols-[auto_1fr_1fr_1fr_auto]` |
| `header` | `h-[12%] flex items-center justify-center` | — | `h-full superbanner:items-center` |
| `main` | `flex-1 flex flex-row items-center justify-center gap-[2%] px-[2%]` | `portrait:flex-col` | — |
| `footer` | `h-[10%] flex items-center justify-end pr-[2%]` | — | `h-full` |
| `#cidade` | `text-[5vmin]` | — | — |
| `.previsao-card` | `flex flex-col items-center w-[30%] p-[4%] gap-[6%] bg-black/80 rounded-2xl` | `portrait:flex-row portrait:w-[88%]` | — |
| `.icone` | `w-[70%] h-auto object-contain` | `portrait:w-[28%]` | `superbanner:w-[20%]` |
| `.dia` | `text-[4vmin]` | — | — |
| `.dia-mes` | `text-[3.5vmin]` | — | — |
| `.grau-max/min` | `text-[6vmin]` | — | — |
| `.logo` | `h-full w-auto object-contain max-w-[15vw]` | — | `superbanner:max-w-[8vw]` |

---

## Steps de execução

1. **`tailwind.config.js`** — apenas `portrait` + `superbanner` nas screens
2. **`index.html`** — estrutura limpa, sem breakpoints de fonte, sem `<style>` inline
3. **`master.js`** — `criarCardHTML()` com classes mínimas; remover `ajustarLayout()` completamente
4. **`css/input.css`** — fallbacks hex + delays animação
5. **`npm run build`** + verificar
6. **Commit**

