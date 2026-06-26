# Template Previsão Climatempo

Template EdgeContents para previsão do tempo, compatível com Android 7+ (WebKit legado).

## Como funciona
- **Base:** Estrutura 100% baseada em `_template-base` (HTML limpo, Tailwind moderno, ES5).
- **Responsivo:** Fontes centralizadas no `<body>` via `vmin`, breakpoints por aspect-ratio.
- **Playlist EBHTML:** Controle correto de `loader.loaded()` e `loader.finished()`.
- **Mock:** Ative/desative `js/mock-data.js` para testes locais.
- **Compatibilidade:** Sem ES6+, sem `clamp()`, com fallbacks hex para cores no CSS.

## Estrutura
- `index.html` — Estrutura mínima, fundo animado, container dinâmico.
- `css/input.css` — Tailwind + fallbacks hex.
- `js/master.js` — Lógica ES5, renderização dinâmica, seguro para EBHTML.
- `js/mock-data.js` — Dados de teste (descomente no HTML para usar).
- `tailwind.config.js` — Breakpoints por aspect-ratio.
- `img/` — Ícones e fundos.

## Desenvolvimento
1. Rode `npm run dev` para compilar o CSS.
2. Teste em `http://localhost:12099/FILES/1/index.html`.
3. Comente `<script src="js/mock-data.js"></script>` para produção.
4. Rode `npm run build` antes do deploy.

## Checklist
- [x] Só ES5 (var, function, sem arrow/let/const)
- [x] loader.loaded()/finished() conforme regra
- [x] Fallbacks hex no CSS
- [x] Fontes via vmin no body
- [x] Sem clamp(), sem ES6+
- [x] Responsivo para TVs, totens, superbanner, empena
