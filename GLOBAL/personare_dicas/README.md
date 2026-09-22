# Personare Dicas

Status: **TESTE / em reavaliacao**

Refatoracao em `refactor/personare-dicas-modernizacao`.

## Validado

- EBHTML 2.0.7 igual a `_template-base/js/ebhtml.js`.
- Dataset `D_PERSONARE` sem dados libera o proximo item com `finished()` imediato.
- Erro, timeout e dados invalidos tambem liberam a playlist sem retry.
- Mock permanece comentado no `index.html` para o fluxo de runtime.
- CSS recompilado com `npm run dev` dentro desta pasta.

## Retomar depois

- Reavaliar layout em portrait, landscape, ultrawide e empena.
- Testar novamente com dados reais do canal `D_PERSONARE`.
- Decidir se a refatoracao visual deve ser mantida antes de gerar `.eh5`.
