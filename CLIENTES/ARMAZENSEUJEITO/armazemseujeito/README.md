# armazemseujeito - Template de Preços PDV

Template de cartazes de preço para PDV no EdgeContents CMS com **arquitetura flexível de preço** (data-attributes).

## 📋 O Que É

Exibe produto, título, preço atual e unidade, com suporte a múltiplas variações de layout (REGULAR, DE-POR, LEVE3PAGUE2, CLUBE, OFERTA) via HTML responsivo.

## 📦 Dataset

**Nome:** `D_MENUBOARD_PRICES`

**Campos usados:**
- `TITULO` - Nome do produto
- `FOTO` - URL da imagem
- `PRICE` - Preço atual
- `PRICE2` - Preço antigo (opcional, para DE-POR)
- `TEXTO3` - Tipo de preço: REGULAR, OFERTA, DEPOR, LEVE3PAGUE2, CLUBE, etc
- `TEXTO4` - Unidade (kg, l, un, etc)
- `TEXTO5` - Texto legal rodapé

## 🎨 Arquitetura de Preço

O template coloca cada **parte do preço** em slots HTML de-nomeados (`data-price-part`):

```
R$ 1.234,56 kg
└──────────────────────── data-price-part="integer"
└──────────────────────── data-price-part="decimal"
└──────────────────────── data-price-part="unit"
```

Cada parte pode ter **tamanho, cor e posição independentes** sem alterar JavaScript.

👉 **Customize preços:** Veja [PRICE_TEMPLATE_GUIDE.md](./PRICE_TEMPLATE_GUIDE.md)

## 🔧 Regras Técnicas

- ✅ JavaScript ES5 apenas (sem const/let/arrow/async/Promise)
- ✅ `loader.loaded()` somente em sucesso (imagem carregada)
- ✅ `loader.finished()` sempre (em qualquer cenário)
- ✅ Separador de milhares automático (123456.50 → 123.456,50)
- ✅ Decimais sempre 2 dígitos

## 🚀 Desenvolvimento

### Mock (Local sem API)
```bash
# 1. Descomentar em index.html:
<script src="js/mock-data.js"></script>

# 2. Terminal:
npm run dev

# 3. Navegador:
http://localhost:12099/FILES/1/index.html
```

### Preview (Extranet)
O arquivo `js/preview.js` é obrigatório para pré-visualização. 

Prioriza dados enviados pela interface pai (window.parent):
1. `window.parent.getTemplatePreviewData()`
2. `window.parent.templatePreviewData`
3. `window.TEMPLATE_PREVIEW_DATA`
4. Fallback: `D_MENUBOARD_PRICES`

Exemplo de payload para integração:
```javascript
window.templatePreviewData = {
	TITULO: 'ARROZ BRANCO TIPO 1 5KG',
	FOTO: 'img/produtos/arroz.jpeg',
	PRICE: '4.99',
	PRICE2: '6.99',
	TEXTO3: 'OFERTA',
	TEXTO4: 'kg',
	TEXTO5: 'Ofertas válidas enquanto durarem os estoques'
};
```

### Produção
```bash
npm run build
# Descomente mock-data.js em index.html
# Usar ebhtmlbuilder4 para compilar
```

## 📁 Arquivos Principais

- `index.html` - Templates com `data-price-part` (personalizável por cliente)
- `js/master.js` - `formatPrice()`, `setupPriceTemplate()` (renderização)
- `js/preview.js` - Integração extranet
- `js/mock-data.js` - Dados de teste
- `PRICE_TEMPLATE_GUIDE.md` - Guia completo de customização de layouts
- Comente js/mock-data.js no index.html
- Valide dataset D_MENUBOARD_PRICES no CMS
- Rodar: npm run build

## Checklist
- Sem let, const, arrow function e template string
- Sem loaded() em fluxo de erro
- finished() garantido em todos os caminhos
- Imagem validada com onload/onerror
