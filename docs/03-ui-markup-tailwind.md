# 03 - UI, Markup Semantico e Tailwind

## Padrao de markup

- declarar estrutura principal no HTML
- usar tags semanticas: header, main, section, article, aside, footer
- evitar arvore HTML montada por string em JS

## Padrao de CSS

- priorizar utilitarios Tailwind raiz
- criar classe custom apenas com justificativa tecnica
- manter compatibilidade com Chromium 78

## Compatibilidade visual minima

- sem clamp sem fallback
- sem gap flex sem alternativa
- sem aspect-ratio sem fallback
- sem rgb moderno sem fallback legivel

## JS na camada visual

JS deve:
- preencher conteudo
- alternar classes de estado
- controlar comportamento

JS nao deve:
- reconstruir layout inteiro quando estrutura pode estar no HTML
