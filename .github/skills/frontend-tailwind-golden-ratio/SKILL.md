---
name: frontend-tailwind-golden-ratio
description: "Use when: frontend design, TailwindCSS layouts, responsive UI for signage, visual hierarchy, spacing scale, typography scale, or golden ratio proportion (1.618). Builds structured UI with anti-overlap rules, adaptive price blocks, and aspect-ratio-safe composition."
---

# Frontend — TailwindCSS para Digital Signage

## Propósito
Guia prático de TailwindCSS para templates de digital signage: breakpoints aspect-ratio, sistema de fontes vmin, layout responsivo, anti-overlap.

## Catalogo e escopo
Carregar [edgecontents-display-formats](../edgecontents-display-formats/SKILL.md) e consultar [formatos e validacao](../../../docs/07-formatos-e-validacao.md).
Um formato ou array/lista explicito define EXATAMENTE as resolucoes obrigatorias; sem restricao, testar o catalogo integral. Nao expandir por familia/tenant; pedir correcao para lista vazia/invalida e dimensoes para proporcao isolada. Formatos novos sao permitidos.
Separar geometria, capacidade em pixels e funcao declarada; `256x144` nao oferece a mesma legibilidade de `1920x1080`. Casos extremos nao podem ser excluidos/aprovados automaticamente.

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

Estes breakpoints sao modificadores sobre um layout base, nao uma particao exaustiva. O layout base cobre intervalos como 4:5 e 5:4. `empena` tambem corresponde a `portrait`; `superbanner` tambem a `ultrawide`; em 15:1 ha coincidencia com `footer`. Declarar precedencia no CSS e conferir fronteiras, sem mudar templates existentes em massa ou adicionar testes fora de uma lista explicita sem aprovacao.

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

- Reproduzir com a fonte carregada, CSS servido atualizado, dados reais e caminho de montagem do template. Medir com `opacity:0`, nunca `display:none`.
- Autofit por busca binária limitada (7-10 medições), preservando baseline e altura; não usar loop decremental sem limite. Recalcular no resize com debounce quando houver mudança de layout.
- `scrollWidth`/`clientWidth` arredondam pixels. Na borda da caixa, medir largura fracionária com `Range.getBoundingClientRect()` e descontar a escala do palco; reservar margem de segurança, não aprovar só por igualdade das métricas inteiras.
- Se truncamento for proibido, manter o texto intacto e não usar `ellipsis`/ocultação como fallback. Reduzir fonte e, no limite técnico, comprimir horizontalmente dentro da área; registrar risco de legibilidade ou pedir ajuste de composição, sem cortar silenciosamente.
- Testar largura fracionária, texto curto/longo, fonte mínima e palco escalado. Conferir texto, estilos de corte e limites visuais; ausência de overflow numa simulação não homologa o player.

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
- [ ] Matriz explicita exata ou catalogo integral, intervalos e precedencia dos breakpoints conferidos
- [ ] Evidencias de viewport real, revisao visual e runtime alvo; sem inferir aprovacao apenas por ausencia de overflow
