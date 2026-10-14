# Instrução: sem "piscada" antes do vídeo de abertura

Aplicada em `fotos_autografos` (2026-10-14). Aplicar depois em `destaque_dia` e conferir em
`programacao_palco`.

## Problema

Ao carregar, o fundo (PNG) ficava visível por uma fração de segundo antes do vídeo de abertura
aparecer, e só então o vídeo tocava por cima. Causas:

1. O fundo é criado e exibido junto com o `#stage` (no `loaded()`), antes do vídeo ter um quadro.
2. `video.style.opacity = '1'` é aplicado logo após `play()`, mas o primeiro quadro só está
   decodificado depois; nesse intervalo o que está por baixo (fundo) aparece.
3. O vídeo entra com fade (`transition-opacity`), revelando o fundo durante a transição.

## Regra

Antes da abertura terminar, a tela é **preta** (bg do `body`/`#stage`). Nada do slide, fundo ou
conteúdo é visível por baixo do vídeo. O fundo só aparece quando o vídeo some.

## Como aplicar

1. **Fundo oculto na criação:** `fundo.style.opacity = '0'` (o `<img>`/`#bg` já carregado, só sem
   exibir). Se o fundo for `background-image` de cada slide, manter o slide com `opacity-0` até o
   `mostrar()` do 1º slide.
2. **Revelar no `mostrar()` do 1º slide:** `fundo.style.opacity = '1'` imediatamente antes de
   `videoIntro.style.opacity = '0'` (o vídeo faz o fade por cima do fundo já pronto). Fundo
   ausente: aplicar a cor lisa de fallback também aí, nunca na preparação.
3. **Vídeo de abertura só com quadro pronto:** em `tocarVideo`, trocar o `opacity = '1'` imediato
   por um listener `playing` (`{ once: true }`). Na abertura, entrar **sem fade**
   (`transitionProperty = 'none'`, aplicar a opacidade, forçar reflow, restaurar). O encerramento
   mantém o fade (`fadeEncerramento`).
4. **Itens fixos acima do vídeo** (rodapé, logo, relógio em `destaque_dia`/`programacao_palco`):
   se não fizerem parte do vídeo, decidir se devem aparecer antes do 1º quadro. Para não piscar,
   também ficam ocultos até o evento `playing` (ou o 1º `mostrar()` se o vídeo falhar).
5. **Vídeo com falha** (`error`, `autoplay-negado`, watchdog): o `mostrar()` do 1º slide já revela
   o fundo, então a sequência segue sem tela preta travada.

## Verificação

- Captura precoce (`--virtual-time-budget=1200`) com o `.mp4` servido: deve mostrar o 1º quadro do
  vídeo ou preto, nunca o fundo do template.
- Com o `.mp4` em 404: o fundo aparece só quando a 1ª página entra.
- `loaded()` continua antes de `finished()` e uma única vez.

## Observações por template

- `fotos_autografos`: feito (`revelarFundo()` e `tocarVideo(..., instantaneo)` em `js/master.js`).
- `destaque_dia`: feito (2026-10-14). `tocarVideo(video, ms, { instantaneo, aoTocar })` e `revelarRodape()`
  em `js/master.js`; o rodapé (`#barra`) nasce oculto e entra no `playing` da abertura ou no 1º slide.
- `programacao_palco`: feito (2026-10-14), itens 1 a 4. `#bg`, `#topo` e `#barra` nascem ocultos;
  `revelarFundo()` no 1º painel (cor de fallback só aí) e `revelarRodape()` no `playing`.
- Verificado em Chromium headless: captura a 1,2 s com o .mp4 mostra só o vídeo (+ rodapé), sem o fundo;
  com o .mp4 em 404 o fundo entra no 1º painel; `loaded()` antes de `finished()` uma vez, também no vazio.
  Não verificado no `ebcliente4` nem a transição quadro a quadro.
- Fora do escopo, mas visto: em `programacao_palco` o ramo `outro` faz `$('topo').style` sem guarda;
  se o PNG do ornamento faltar (`topo.remove()`), lança e cai em `semConteudo`.
