# Template agro_link

Template de notícias/cotações para EdgeContents (Digital Signage), responsivo para 9:16 (portrait) e 16:9 (landscape).

## Estrutura
- Layout dividido em dois blocos: conteúdo e foto
- Portrait: conteúdo em cima, foto embaixo
- Landscape: conteúdo à esquerda, foto à direita
- Badge cidade/UF no topo, texto principal ao centro, rodapé com assinatura
- Fonte: MMC (adicione MMC.ttf em css/fonts/)

## Dados
- Canal: D_AGROLINK (filtrar por categoria)
- Campos: mm_text2_cnt (cidade), mm_text3_cnt (UF), ds_title_cnt (título), mm_text4_cnt (JSON/foto)

## Desenvolvimento
1. `npm run dev` para compilar CSS
2. Teste em `http://localhost:12099/FILES/1/index.html`
3. Use mock-data.js para simular dados
4. Em produção, comente `<script src="js/mock-data.js"></script>`

## Build
- `npm run build` para minificar CSS
- Garantir compatibilidade Android 7+ (ES5, sem clamp, fallbacks hex)

## Referências
- Consulte `/docs/02-xml-format.md` para estrutura de dados
- Veja exemplos em `uol_responsivo_tw/` para responsividade
