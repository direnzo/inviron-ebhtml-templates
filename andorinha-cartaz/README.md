# andorinha-cartaz - Template Cartaz Supermercado

Template de cartazes de preço para PDV (Andorinha Supermercados) com background dinâmico e 4 condições de preço.

## Dataset

**Nome:** `D_MENUBOARD_PRICES`

**Campos:**
- `TITULO` - Nome do produto
- `PRICE` - Preço atual
- `PRICE2` - Preço antigo (DE-POR) ou com condição (A PARTIR DE)
- `TEXTO3` - Condição: REGULAR, DE-POR, FIDELIDADE, A-PARTIR-DE
- `TEXTO4` - Unidade (kg, l, un, UNIDADE)
- `TEXTO5` - Texto legal rodapé

## Condições de Preço

1. **REGULAR** - Refrigerante Coca Cola Zero 2L → R$ 11,80
2. **DE-POR** - Creme de Leite Piracanjuba (~~2,79~~ → R$ 2,39) ou Amaciante Comfort (~~23,99~~ → R$ 19,99)
3. **FIDELIDADE** - Preço + badge azul "NO CARTÃO ANDORINHA..."
4. **A-PARTIR-DE** - Azeite Andorinha (R$ 35,99 UNIDADE → R$ 26,99 UNIDADE com condição)

## Background Dinâmico

Cada condição usa imagem de fundo específica em `img/backgrounds/`:
- `regular.jpg`, `depor.jpg`, `fidelidade.jpg`, `apartirde.jpg`

**Template não usa fotos de produtos**, apenas backgrounds.

## Desenvolvimento

```bash
# 1. Descomentar em index.html:
<script src="js/mock-data.js"></script>

# 2. Watch CSS:
npm run dev

# 3. Navegador:
http://localhost:12099/FILES/1/index.html
```

## Produção

```bash
npm run build
# Comentar mock-data.js
# ebhtmlbuilder4
```

## Fonte

**KOMIKA TITLE** - Adicionar arquivos em `css/fonts/`:
- `KOMTIT__.ttf` (regular)
- `KOMTITB_.ttf` (bold)
