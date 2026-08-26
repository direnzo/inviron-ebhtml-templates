# Template Previsão do Tempo (universal)

Template EdgeContents de previsão do tempo, compatível com Android 7+
(WebKit legado). Layout e motor de ícones são **agnósticos de fonte de
dados** — hoje consome o canal CPTEC/INPE, mas foi desenhado para servir
de base a qualquer outra fonte (Climatempo, OpenWeather, etc.) trocando
apenas um arquivo.

## Arquitetura de ícones (a parte importante)

O template separa 3 camadas para poder trocar de fonte de dados sem
alterar layout nem lógica de renderização:

1. **`js/meteocons-helpers.js`** — motor 100% genérico. Carrega/injeta
   os SVGs Meteocons via XHR (com cache) e converte índice UV,
   velocidade do vento e direção cardinal em nomes de ícone. Nunca deve
   conter código específico de uma fonte de dados — pode ser copiado
   sem alteração para outro template (junto com `img/meteocons/`).

2. **`js/provider-<fonte>.js`** — adaptador da fonte de dados ativa.
   Só ele conhece o formato de códigos/siglas da fonte e traduz para o
   vocabulário Meteocons (que já funciona como "idioma global" de
   ícones). Todo provider implementa o mesmo contrato:
   - `codigoParaIcone(codigoBruto)` → `{ meteocon: 'clear-day', descricao: 'Céu claro' }`
   - `codigoParaMeteocon(codigoBruto)` → `'clear-day'` (nome do SVG em `img/meteocons/<estilo>/`)
   - `codigoParaDescricao(codigoBruto)` → `'Céu claro'`

   Providers disponíveis neste template:
   - `provider-cptec.js` — **ativo por padrão.** Resolve siglas oficiais
     do CPTEC (`ec`, `pn`, `ch`, ...) vindas do campo `TEXTPT`, e cai
     para uma tabela numérica de default (`1`–`11`, `99`) vinda do
     campo `ICO` quando `TEXTPT` vem vazio.
   - `provider-climatempo.js` — pronto, mas não plugado no `index.html`.
   - `provider-openweather.js` — pronto, mas não plugado no `index.html`.

3. **`js/master.js`** — não conhece nenhuma fonte de dados específica.
   Só chama a interface genérica acima (`codigoParaMeteocon` /
   `codigoParaDescricao`). É por isso que master.js não muda ao trocar
   de fonte.

### Como plugar uma fonte de dados diferente
1. Se não existir ainda, crie `js/provider-<fonte>.js` implementando o
   contrato acima (use `provider-cptec.js` como referência/comentário).
2. No `index.html`, troque a tag `<script src="js/provider-cptec.js">`
   pela do novo provider.
3. Em `master.js`, ajuste apenas de onde vem o **código bruto** do
   ícone no canal de dados (hoje: `getVal(prefix + "TEXTPT")`).
4. Nada mais muda — `meteocons-helpers.js`, CSS e layout continuam
   iguais.

## Como funciona (geral)
- **Base:** Estrutura 100% baseada em `_template-base` (HTML limpo, Tailwind moderno, ES5).
- **Responsivo:** Fontes centralizadas no `<body>` via `vmin`, breakpoints por aspect-ratio.
- **Playlist EBHTML:** Controle correto de `loader.loaded()` e `loader.finished()`.
- **Mock:** Ative/desative `js/mock-data.js` para testes locais.
- **Compatibilidade:** Sem ES6+, sem `clamp()`, com fallbacks hex/gap/inset/min() no CSS para Chromium 78 / WebKit legado.
- **CONFIG_CLIMA:** Contrato de configuração definido no `<head>` do `index.html` (antes dos demais scripts) — `iconStyle`, `iconColor`, `textColor`, `duration`.
- **Cidades (canal D_CLIMA):** a fonte de dados retorna 1 único item com até 3 slots de cidade configuráveis (`C1`/`C2`/`C3`, cada um com 3 dias `D1`/`D2`/`D3`). O template detecta quais slots têm dados e, se houver mais de uma cidade configurada, alterna entre elas por rotação determinística de relógio (`Math.floor(Date.now() / duration) % totalCidades`), sem usar `localStorage` — garante comportamento consistente mesmo com múltiplas telas exibindo o mesmo conteúdo.
- **Sempre 3 cards:** se um card não tiver temperaturas ou repetir o dia anterior, ele é ocultado (nunca exibe dado inválido).
- **Descrição do tempo:** exibe o campo `DESCRICAO` (derivado de `codigoParaDescricao`) no lugar da antiga `extra-info-row` (oculta temporariamente).

## Estrutura
- `index.html` — Estrutura mínima, fundo animado, container dinâmico, seleção do provider ativo.
- `css/input.css` — Tailwind + fallbacks hex.
- `js/master.js` — Lógica ES5, renderização dinâmica, seguro para EBHTML. Agnóstico de fonte de dados.
- `js/meteocons-helpers.js` — Motor universal de ícones Meteocons.
- `js/provider-cptec.js` / `provider-climatempo.js` / `provider-openweather.js` — Adaptadores por fonte de dados.
- `js/mock-data.js` — Dados de teste (descomente no HTML para usar).
- `tailwind.config.js` — Breakpoints por aspect-ratio.
- `img/` — Ícones Meteocons e fundos.

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
- [x] master.js e meteocons-helpers.js agnósticos de fonte de dados
