---
name: frontend-tailwind-golden-ratio
description: "Use when: frontend design, TailwindCSS layouts, responsive UI for signage, visual hierarchy, spacing scale, typography scale, or golden ratio proportion (1.618). Builds structured UI with anti-overlap rules, adaptive price blocks, and aspect-ratio-safe composition."
---

# Frontend — TailwindCSS para Digital Signage

## Propósito
Guia prático de TailwindCSS para templates de digital signage: breakpoints aspect-ratio, sistema de fontes vmin, layout responsivo, anti-overlap.

## Breakpoints (tailwind.config.js)
```javascript
screens: {
    'portrait':    { 'raw': '(max-aspect-ratio: 3/4)' },
    'square':      { 'raw': '(aspect-ratio: 1/1)' },
    'landscape':   { 'raw': '(min-aspect-ratio: 4/3) and (max-aspect-ratio: 2/1)' },
    'ultrawide':   { 'raw': '(min-aspect-ratio: 3/1)' },
    'superbanner': { 'raw': '(min-aspect-ratio: 5/1) and (max-aspect-ratio: 15/1)' },
    'footer':      { 'raw': '(min-aspect-ratio: 15/1)' },
    'empena':      { 'raw': '(max-aspect-ratio: 1/3)' },
}
```

## Sistema de Fontes (vmin)
- **Body**: `text-[3.2vmin]` — escala em qqr formato. Só override em superbanner/empena.
- **Filhos**: SOMENTE `em` ou `%` — NUNCA `vw/vh/vmin` em filhos.
- **NUNCA** `portrait:text-[X]` em filhos — ajuste o body.

```html
<!-- ✅ -->
<body class="text-[3.2vmin] superbanner:text-[5vmin] empena:text-[11vmin]">
  <h1 class="text-[2.5em]">Título</h1>
  <p class="text-[1.2em]">Subtítulo</p>
```

## Anti-Overlap (Prevenir Texto Sobreposto)
```javascript
function fitFont(element, maxWidthPercent) {
    var maxW = window.innerWidth * maxWidthPercent;
    var currentSize = parseInt(window.getComputedStyle(element).fontSize);
    while (element.scrollWidth > maxW && currentSize > 6) {
        currentSize -= 1;
        element.style.fontSize = currentSize + 'px';
    }
}
// Uso: fitFont(document.getElementById('titulo'), 0.85);
```

## Price Blocks (4 Slots)
```html
<div class="flex items-baseline space-x-[0.1em]">
  <span class="text-[0.5em]">R$</span>        <!-- símbolo -->
  <span class="text-[1em] font-bold">1.234</span>  <!-- inteiro -->
  <span class="text-[0.4em]">,56</span>        <!-- decimal -->
  <span class="text-[0.3em]">kg</span>          <!-- unidade -->
</div>
```

## Layout Vertical (prevenir overlap)
```html
<body class="flex flex-col items-center justify-center w-full h-full p-[2vmin]">
  <div id="logo" class="h-[15%]"></div>
  <div id="imagem" class="h-[40%] w-full portrait:h-[30%]">
    <img class="w-full h-full object-contain">
  </div>
  <div id="titulo" class="h-[10%] flex items-center"></div>
  <div id="preco" class="h-[20%] flex items-center"></div>
  <div id="legal" class="h-[10%] text-[0.6em] opacity-70"></div>
</body>
```

## CSS Fallbacks (input.css)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Fallback hex para Chrome < 65 */
.text-white { color: #ffffff }
.text-black { color: #000000 }
.bg-white   { background-color: #ffffff }
.bg-black   { background-color: #000000 }

/* Fallback aspect-ratio para Chrome < 88 */
@supports not (aspect-ratio: 1 / 1) {
  .aspect-square { position: relative; overflow: hidden; }
  .aspect-square::before { content: ''; display: block; padding-bottom: 100%; }
  .aspect-square > * { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
}
```

## Checklist
- [ ] font-size body em vmin, filhos em em/%
- [ ] Sem `portrait:text-[X]` espalhado nos filhos
- [ ] Sem `gap-*` em flex (usar `space-x-*`/`space-y-*`)
- [ ] Fallback hex p/ cada cor usada no template
- [ ] Imagens com `object-fit` (contain/cover) explícito
- [ ] Testar com título longo + preço grande
