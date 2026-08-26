# Template Previsão Climatempo

Template EdgeContents para previsão do tempo, compatível com Android 7+ (WebKit legado).

## Como funciona
- **Base:** Estrutura 100% baseada em `_template-base` (HTML limpo, Tailwind moderno, ES5).
- **Responsivo:** Fontes centralizadas no `<body>` via `vmin`, breakpoints por aspect-ratio.
- **Playlist EBHTML:** Controle correto de `loader.loaded()` e `loader.finished()`.
- **Mock:** Ative/desative `js/mock-data.js` para testes locais.
- **Compatibilidade:** Sem ES6+, sem `clamp()`, com fallbacks hex/gap/inset/min() no CSS para Chromium 78 / WebKit legado.
- **CONFIG_CLIMA:** Contrato de configuração definido no `<head>` do `index.html` (antes dos demais scripts) — `iconStyle`, `iconColor`, `textColor`, `duration`. O alias `corClimaPrincipal` é mantido temporariamente como fallback de `iconColor`.
- **Cidades (D_CLIMA_CLIMATEMPO):** a fonte de dados retorna 1 único item com até 3 slots de cidade configuráveis (`C1`/`C2`/`C3`, cada um com 3 dias `D1`/`D2`/`D3`). O template detecta quais slots têm dados e, se houver mais de uma cidade configurada, alterna entre elas por rotação determinística de relógio (`Math.floor(Date.now() / duration) % totalCidades`), sem usar `localStorage` — garante comportamento consistente mesmo com múltiplas telas exibindo o mesmo conteúdo.
- **Sempre 3 cards:** se um dos 3 dias (hoje/amanhã/depois) não tiver dados na cidade escolhida, o card reaproveita a previsão do dia mais próximo já resolvido (pode ficar "desatualizado", mas nunca falta card).
- **Descrição do tempo:** exibe `ds_textmin_wea` (campo `DESCRICAO`) no lugar da antiga `extra-info-row` (oculta temporariamente). Auto-ajusta o tamanho da fonte via JS e some quando `window.innerHeight < 200`.

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
