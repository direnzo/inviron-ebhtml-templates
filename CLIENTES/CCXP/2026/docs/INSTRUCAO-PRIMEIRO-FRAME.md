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
- `destaque_dia`: os slides já nascem com `opacity-0`; falta o item 3 e conferir o item 4 (rodapé).
- `programacao_palco`: `#bg` e `#topo` ficam visíveis desde o `loaded()`; precisam dos itens 1 a 4.
  (Não conferido visualmente neste momento.)
