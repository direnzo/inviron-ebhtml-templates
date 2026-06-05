# Menuboard - Lista de Produtos

Template de exibição de lista de produtos para supermercados em displays digitais.

## Estrutura

```
_menuboard_modelo/
├── index.html
├── package.json
├── tailwind.config.js
├── css/
│   ├── input.css
│   ├── master.css
│   └── fonts/
├── img/
│   ├── clube.png
│   └── fundo.png
└── js/
    ├── ebhtml.js
    ├── master.js
    └── mock-data.js
```

## Desenvolvimento Local

1. **Habilitar mock-data**: Descomentar linha no `index.html`
```html
<script src="js/mock-data.js" defer></script>
```

2. **Watch CSS**:
```bash
npm run dev
```

3. **Testar**: Abrir no navegador (requer ebcliente4.exe rodando)
```
http://localhost:12099/FILES/1/index.html
```

## Produção

1. Comentar mock-data.js no HTML
2. Minificar CSS: `npm run build`
3. Compilar: ebhtmlbuilder4

## Campos EBDATA

- `TITULO`: Nome do produto
- `PRICE`: Preço normal
- `PRICE2`: Preço clube/promocional
- `TEXTO2`: CustomerID (local)
- `TEXTO6`: Data início promoção (YYYY-MM-DD HH:MM:SS)
- `TEXTO7`: Data fim promoção (YYYY-MM-DD HH:MM:SS)
