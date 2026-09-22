# Andorinha Cartaz - Supermercado

Template de preços para Digital Signage do Supermercado Andorinha.

## Condições de Preço

- **REGULAR**: preço padrão
- **DEPOR**: preço promocional (mostra preço antigo riscado)
- **FIDELIDADE**: preço com cartão fidelidade (badge azul)
- **APARTIRDE**: "a partir de" com dois preços

## Desenvolvimento Local

```bash
npm run dev     # Watch CSS
```

Abrir: `http://localhost:12099/FILES/1/index.html`

**Mock ativo** com rotação automática a cada refresh.

## Build

```bash
npm run build   # CSS minificado
```

Comentar `<script src="js/mock-data.js">` no HTML antes de compilar no ebhtmlbuilder4.

## Assets

- Fonte: `KOMTITP_.ttf` (Komika Title)
- Backgrounds: `img/backgrounds/*.jpg` (regular, depor, fidelidade, apartirde)

## Resolução

**Template otimizado para:** 1080x1533 pixels (portrait, ratio ~0.7:1)

⚠️ **IMPORTANTE:** Este template foi projetado especificamente para este formato. Outros formatos (landscape, square, ultrawide) não renderizarão corretamente.

## Dataset EdgeContents

- Dataset: `D_MENUBOARD_PRICES`
- Campos: `TITULO`, `FOTO` (URL opcional da imagem), `PRICE`, `PRICE2`, `TEXTO3` (condição), `TEXTO4` (unidade), `TEXTO5` (legal)

