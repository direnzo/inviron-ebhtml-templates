# Andorinha Menuboard - Lista de Produtos

Template de lista de produtos para Supermercado Andorinha em displays digitais (TVs, menuboards, totens).

## ✨ Características

- **Layout 2 colunas** (Descrição | Preço)
- **SEM paginação** - Backend controla via `amount=` na URL
- **Background dinâmico** (horizontal/vertical)
- **Suporte a 2 preços** (UNID. + CX/12 para bebidas)
- **Mock-data** para testes sem backend

## 📁 Estrutura

```
andorinha_menuboard/
├── index.html
├── package.json
├── tailwind.config.js
├── css/
│   ├── input.css
│   ├── master.css
│   └── fonts/
├── img/
│   ├── bg_menuboard_horizontal.jpg
│   └── bg_menuboard_vertical.jpg
└── js/
    ├── ebhtml.js
    ├── master.js
    └── mock-data.js
```

## 🧪 Desenvolvimento Local

1. **Mock-data já está habilitado** no `index.html`
2. **Watch CSS**:
```bash
npm run dev
```
3. **Testar**: `http://localhost:12099/FILES/1/index.html`

## 🎨 Campos EBDATA

- `TITULO`: Nome do produto
- `TEXTO1`: Subtítulo/unidade (ex: "Lata 269ml")
- `PRICE`: Preço principal
- `PRICE2`: Preço secundário (opcional)
- `TEXTO3`: Label do preço 2 (ex: "CX/12")

## 🚀 Produção

1. Comentar `mock-data.js` no HTML
2. `npm run build`
3. ebhtmlbuilder4
- `PRICE`: Preço normal
- `PRICE2`: Preço clube/promocional
- `TEXTO2`: CustomerID (local)
- `TEXTO6`: Data início promoção (YYYY-MM-DD HH:MM:SS)
- `TEXTO7`: Data fim promoção (YYYY-MM-DD HH:MM:SS)
