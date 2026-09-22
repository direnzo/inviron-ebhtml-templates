# 04 - Preview.js com Paridade de Runtime

## Decisão por briefing

`preview.js` só é necessário quando o CMS ou tenant exige pré-visualização configurável pela extranet. Quando aplicável, deve manter paridade com o runtime.

## Objetivo

Preview deve se comportar igual ao runtime. A unica diferenca permitida é a origem dos dados e a supressão de `finished()` para manter a visualização ativa.

## Ordem de origem de dados no preview

1. window.parent.getTemplatePreviewData()
2. window.parent.templatePreviewData
3. window.parent.TEMPLATE_PREVIEW_DATA
4. fallback controlado (mock/dataset)

## Pipeline recomendada

- extrair dados do frame pai
- adaptar para o mesmo contrato do runtime
- chamar a mesma funcao de render/populacao do master
- suprimir finished no preview para manter visualizacao

## Erro comum

Duplicar regra de negocio no preview e no runtime.

## Correcao

Criar uma unica pipeline compartilhada e apenas adaptadores de origem.
