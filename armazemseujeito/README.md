# armazemseujeito

Template de cartazes de preco para PDV no EdgeContents CMS.

## Objetivo
Exibir produto, titulo, preco atual e unidade, com variacao de layout para REGULAR e DE-POR.

## Dataset
Nome: D_MENUBOARD_PRICES

Campos usados:
- TITULO
- FOTO
- PRICE
- PRICE2
- TEXTO3 (REGULAR, OFERTA, DE-POR)
- TEXTO4 (unidade)
- TEXTO5 (texto legal)

## Regras tecnicas
- JavaScript ES5 apenas
- loader.loaded() somente em sucesso
- loader.finished() sempre
- Sem Promise, async/await ou fetch

## Desenvolvimento
- Para mock: descomente js/mock-data.js no index.html e use enabled: true
- Rodar: npm run dev
- Abrir: http://localhost:12099/FILES/1/armazemseujeito/index.html

## Preview (extranet)
- O arquivo js/preview.js e obrigatorio para pre-visualizacao em producao
- Prioriza dados enviados pela interface pai (window.parent)
- Se nao houver dados da interface, usa D_MENUBOARD_PRICES como fallback
- Formas aceitas no parent: getTemplatePreviewData(), templatePreviewData ou TEMPLATE_PREVIEW_DATA

Exemplo de payload:
```javascript
window.templatePreviewData = {
	TITULO: 'ARROZ BRANCO TIPO 1 5KG',
	FOTO: 'img/produtos/arroz.jpeg',
	PRICE: '4.99',
	PRICE2: '6.99',
	TEXTO3: 'OFERTA',
	TEXTO4: 'kg',
	TEXTO5: 'Ofertas validas enquanto durarem os estoques'
};
```

## Producao
- Comente js/mock-data.js no index.html
- Valide dataset D_MENUBOARD_PRICES no CMS
- Rodar: npm run build

## Checklist
- Sem let, const, arrow function e template string
- Sem loaded() em fluxo de erro
- finished() garantido em todos os caminhos
- Imagem validada com onload/onerror
