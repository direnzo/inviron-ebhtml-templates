## Plan v2: Digital Signage First — previsao_climatempo

### 🧠 Filosofia

Este template roda em **painéis de digital signage vistos a distância** (2-20m). Não é uma interface web.

| Web (abordagem anterior ❌) | Digital Signage (correto ✅) |
|---|---|
| `em` relativo a font-size do body | `vmin` relativo à **tela inteira** |
| Elementos pequenos (proporção web) | Elementos GRANDES (legível a distância) |
| `font-size` centralizado | Cada elemento define seu próprio `vmin` |
| Ícone como detalhe | **Ícone como protagonista** — maior que o texto |
| Body com padding complexo | Layout usa % da viewport diretamente |

### 📐 Unidade: `vmin` = `min(vw, vh)`

Um único `vmin` escala proporcionalmente em QUALQUER formato, de LED 150×150 a 4K ultrawide.

Exemplos reais de tamanhos `vmin`:
| Tela | 1vmin | 12vmin (ícone) | 4vmin (temp) | 2vmin (extra) |
|---|---|---|---|---|
| 150×150 | 1.5px | 18px | 6px | 3px |
| 1080×1920 | 10.8px | 130px | 43px | 22px |
| 1920×1080 | 10.8px | 130px | 43px | 22px |
| 3840×2160 | 21.6px | 259px | 86px | 43px |
| 540×1920 | 5.4px | 65px | 22px | 11px |

---

### 🎨 ASCII Mockups

#### Horizontal (landscape 16:9, ultrawide 3:1+)

```
┌──────────────────────────────────────────────────────────────┐
│                         SÃO PAULO                            │  4vmin
│                                                              │
├──────────────┬─────────────────────┬────────────────────────┤
│   QUARTA     │      QUINTA         │       SEXTA            │  2.5vmin
│              │                     │                         │
│      ☁️      │        ☁️           │         ☁️              │ 12-15vmin
│              │                     │                         │
│   ↑24° ↓15° │    ↑20° ↓12°        │     ↑20° ↓12°          │  4vmin
│              │                     │                         │
│ 💧4% / 81mm  │   💧1% / 82mm      │    💧0% / 0mm          │  2vmin
│ 🌬️5km/h NW   │  🌬️7km/h SE        │   🌬️8km/h SE           │  (extra-info)
│ ☀️UV 11 Ext.  │  ☀️UV 10 Ext.      │   ☀️UV 9 Muito Alto    │
├──────────────┴─────────────────────┴────────────────────────┤
│                                              [logo]         │  4vmin
└──────────────────────────────────────────────────────────────┘
    ← 28vw →      ← 28vw →            ← 28vw →
```

#### Vertical (portrait 9:16, square 1:1)

```
┌──────────────────────────┐
│    SÃO PAULO             │
├──────────────────────────┤
│┌──────┐   QUARTA         │
││  ☁️  │  ↑24° ↓15°       │  
│|      |  💧4% / 81mm     │ icone fica full a esquerda e os dados todos a direita empilhados.
│|      |   🌬️5km/h NW     │
│└──────┘ ☀️UV 11 Extremo  │  
├───────────────────────────┤
│┌──────┐   QUARTA         │
││  ☁️  │  ↑24° ↓15°       │  
│|      |  💧4% / 81mm     │
│|      |   🌬️5km/h NW     │
│└──────┘ ☀️UV 11 Extremo  │  
├───────────────────────────┤
│┌──────┐   QUARTA         │
││  ☁️  │  ↑24° ↓15°       │  
│|      |  💧4% / 81mm     │
│|      |   🌬️5km/h NW     │
│└──────┘ ☀️UV 11 Extremo  │  
├───────────────────────────┤
│                 [logo]   │
└──────────────────────────┘
   ← 90% →
```

#### Empena/Footer (formatos extremos, sem extra-info)

```
┌───────┐    ┌──────────────────────┐
│ QUARTA │    │  SEXTA    ☁️  ↑24°↓15°│  3 cards lado a lado
│   ☁️   │    └──────────────────────┘  super compacto
│↑24°↓15°│
└───────┘
```

---

### 📦 Tabela de Medidas (TODAS em vmin)

#### Landscape / Ultrawide (cards lado a lado)

| Elemento | Medida | CSS |
|---|---|---|
| Container cards | `h-[78vh]` | main.h-[78vh] |
| Cabeçalho cidade | `4vmin` + `h-[9vh]` | header.h-[9vh] |
| Dia da semana | `2.5vmin` | .data.text-[2.5vmin] |
| **Ícone principal** | **`12vmin`** | .icon.w-[12vmin].h-[12vmin] |
| Seta max/min | `2vmin altura` | img.h-[2vmin] |
| Temperatura max/min | `4vmin` | .max/.min.text-[4vmin] |
| Ícone extra (chuva/vento/UV) | `2.5vmin` | .w-[2.5vmin].h-[2.5vmin] |
| Texto extra-info | `1.8vmin` | .extra-info-row.text-[1.8vmin] |
| Padding do card | `1.5vmin` | .card.p-[1.5vmin] |
| Gap entre cards | `2vw` | #cards.gap-[2vw] |
| Largura do card | `28vw` | .card.w-[28vw] |
| Logo footer | `h-[4vmin]` | footer img.h-[4vmin] |
| Footer padding | `1.5vmin` | footer.p-[1.5vmin] |

#### Portrait / Square (cards empilhados)

| Elemento | Medida | CSS |
|---|---|---|
| Container cards | `h-[82vh]` | overflow-y:auto |
| Cabeçalho cidade | `3.5vmin` | text-[3.5vmin] |
| Dia da semana | `2.5vmin` | text-[2.5vmin] |
| **Ícone principal** | **`15vmin`** (maior que horizontal!) | w-[15vmin].h-[15vmin] |
| Temperatura max/min | `4.5vmin` | text-[4.5vmin] |
| Ícone extra | `2.5vmin` | w-[2.5vmin].h-[2.5vmin] |
| Texto extra-info | `1.8vmin` | text-[1.8vmin] |
| Largura do card | `80%` | max-w none |

#### Empena (extra-info oculto)

| Elemento | Medida |
|---|---|
| Ícone | `10vmin` |
| Temperatura | `3.5vmin` |
| Dia da semana | `2.5vmin` |
| extra-info | `display: none` |

#### Footer / Altura < 300px (extra-info oculto)

| Elemento | Medida |
|---|---|
| Ícone | `8vmin` |
| Temperatura | `3vmin` |
| Dia + temp em linha horizontal | flex-row |
| extra-info | `display: none` |

> **Nota importante:** `em` NÃO será usado como medida de escala (cada elemento declara seu próprio `vmin`). O `font-size` do body servirá apenas como fallback genérico.

---

### 📁 Arquivos a modificar

1. **`index.html`**
   - Medidas `vmin` em todos os elementos
   - Remover `em` como unidade de escala
   - Dia da semana + temp lado a lado no portrait (ícone abaixo)
   - Estrutura limpa, sem margens negativas

2. **`css/input.css`**
   - Fallbacks hex (já feitos)
   - Overrides por aspect ratio: portrait/square/empena/footer com medidas reduzidas
   - Media query max-height 300px

3. **`js/master.js`**
   - Aspect ratio detection (já feita)
   - Ajustar textos do extra-info (já feitos parcialmente)
   - Animações com delay JS (já feito)

---

### ✅ O que mantemos do trabalho anterior

| Item | Status |
|---|---|
| Fallbacks hex Android 7 | ✅ Mantido |
| Aspect ratio detection JS | ✅ Mantido |
| Animações com delay JS | ✅ Mantido |
| Extra-info hide (empena/footer/<300px) | ✅ Mantido |
| Textos compactos no master.js | ✅ Mantido |

### ❌ O que descartamos/substituímos

| Abordagem anterior | Nova abordagem |
|---|---|
| `em` nos filhos | `vmin` direto em cada elemento |
| Body font-size como referência | Body font-size é irrelevante (cada elemento usa `vmin`) |
| Ícone `w-[7em]` (148px) | Ícone `w-[12vmin]` (escala com a tela) |
| Padding `p-[0.6em]` | Padding `p-[1.5vmin]` |
| `card-body flex-1` com gap | Layout direto, sem wrapper extra |

---

### 🎯 Ordem de Implementação

```
1. index.html ── reescrever HTML com vmin (o grosso do trabalho)
2. input.css ── ajustar overrides por ratio
3. master.js ── revisar se algo quebrou com novo HTML
4. Validar no navegador em múltiplos formatos
```