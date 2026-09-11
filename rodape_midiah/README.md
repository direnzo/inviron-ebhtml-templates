# rodape_midiah

Template de rodape para EdgeContents com logo Midiah, cotações financeiras no centro e telefone fixo à direita.

## Dados

Canais usados:
- `D_AWESOMEAPI`
- `D_CAMBIO`

Campos esperados por indicador: `M1_NOME`, `M1_QUOTE`, `M1_VALOR`, `M1_VALOR_COMPRA`, `M1_VAR`, `M1_ATUALIZA` até o limite configurado em `js/config.js`.

## Configuracao

Editar `js/config.js` para frase, telefone, tempo de exibicao e quotes permitidos.

## Desenvolvimento

Para usar mock local, descomente `js/mock-data.js` no `index.html`.

Gerar CSS em modo watch:
`npm run dev`

## Teste

Usar somente o servidor EdgeContents:
`http://localhost:12099/FILES/1/index.html`

Nunca testar por `file:///`.