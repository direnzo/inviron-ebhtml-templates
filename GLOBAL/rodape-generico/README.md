# rodape-generico

Template global reutilizavel de rodape EdgeContents para Android 7+ e Chromium 78.

## Briefing
- Formato de teste: 1080x60 px, proporcao aproximada 18:1.
- Layout: placeholder/logo configuravel a esquerda, conteudo intercalado ao centro e relogio a direita.
- Ciclo: 60 segundos; duracao padrao calculada em 8 segundos por item.
- Canais: financeiro (`D_CAMBIO`/`D_AWESOMEAPI`), clima e temperatura (`D_CLIMA_CLIMATEMPO_MOMENTO` com fallback `D_CLIMA`) e frases (`D_MENSAGERIA.TEXTO`).
- Canal vazio ou invalido: e pulado; sem nenhum canal valido, a playlist e liberada com logo e relogio.
- Logo: configure `logoPath`, `logoAlt` e `logoPlaceholder` em `js/config.js`; SVG deve ser injetado via XHR.

## Arquivos-chave
- `index.html`, `js/config.js`, `js/master.js`
- `js/modules/modulo-clima.js`, `js/modules/modulo-financeiro.js`, `js/modules/modulo-mensageria.js`
- `js/mock-data.js` para desenvolvimento local; mantenha desativado em producao

## Regras
- ES5 puro; `ebhtml.js` deve ser identico a `_template-base/js/ebhtml.js` (2.0.7).
- Todo `loader.load()` tem callback de erro, watchdog e `try/catch` no parsing.
- `loaded()` ocorre apos renderizacao; `finished()` ocorre exatamente uma vez em sucesso, erro, vazio, timeout ou excecao.
- Body usa `vmin`; filhos usam `em`/%; sem `clamp()` ou `gap` em flex.

## Teste
- URL obrigatoria: `http://localhost:12099/FILES/1/index.html`
- Testar tambem com `?hwfraco=1` e reloads repetidos.
- Nunca usar `file://` ou outro servidor local.
