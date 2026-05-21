---
name: frontend-tailwind-golden-ratio
description: "Use when: frontend design, TailwindCSS layouts, responsive UI for signage, visual hierarchy, spacing scale, typography scale, or golden ratio proportion (1.618). Builds structured UI with anti-overlap rules, adaptive price blocks, and aspect-ratio-safe composition."
---

# Frontend Tailwind Golden Ratio

## Purpose
Apply a consistent visual system for digital signage and web layouts using:
- Tailwind utility patterns
- Golden ratio proportional scale
- Anti-overflow and anti-overlap constraints
- Aspect-ratio-aware composition

## Trigger Keywords
Use this skill when user asks for:
- Tailwind design improvements
- Typography hierarchy
- Image and price block alignment
- Golden ratio scaling
- Responsive composition across portrait, landscape, ultrawide
- Prevent text overlap and broken layouts

## Core Rules
1. Use a proportional scale based on phi = 1.618 for spacing and typography.
2. Avoid absolute stacking for core content blocks unless container constraints are explicit.
3. Every price layout must have:
- symbol slot
- integer slot
- decimal slot
- unit slot
4. Enforce anti-overlap:
- max width for text regions
- controlled line-height
- min and max font size clamps
- fallback truncation or fit loop
5. For product images:
- fixed visual frame size by aspect family
- object-fit policy explicit: contain or cover
- no uncontrolled natural-size rendering
6. Keep styles in Tailwind utility classes and tokenized config, not random inline styling.
7. Preserve ES5 compatibility in JS for legacy WebKit devices.
8. **Sistema de fontes centralizado (vmin):** definir `font-size` base no `<body>` usando `vmin` (ex: `text-[3.2vmin]`). Overrides de breakpoint apenas em superbanner e empena. **Todos os filhos usam somente `em` ou `%`** — nunca `portrait:text-[X]` ou `landscape:text-[X]` em elementos individuais. Para ajustar tamanho em um formato: alterar o valor do body, não dos filhos.

## Golden Ratio Tokens
Reference tokens file:
- tokens.phi.base = 1.618
- typography steps and spacing steps follow geometric progression

## Layout Strategy
1. Build page as vertical flow:
- logo
- image frame
- title
- price
- legal text
2. Keep price in normal flow when possible.
3. Use aspect-ratio breakpoints:
- portrait
- square
- landscape
- ultrawide

## Output Checklist
- No overlap in title/price/image/legal text
- Symbol alignment visually anchored to number baseline
- Large values supported, e.g. R$ 999.999,99
- Decimals and unit remain readable
- Product images appear uniform across items
- No ES6+ syntax in runtime JS

## Suggested Assistant Behavior
When this skill is active:
1. Audit current layout constraints before editing.
2. Propose token-based updates first.
3. Apply minimal, reversible changes.
4. Validate with at least one long-title and one large-price sample.
5. Report residual risks (extreme aspect ratios or missing assets).
