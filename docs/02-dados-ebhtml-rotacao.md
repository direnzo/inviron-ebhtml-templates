# 02 - Dados EBHTML e Rotacao por Dataset

## Principio central

A fonte de verdade para selecao e ordem de conteudo e o dataset.

## Praticas obrigatorias

- usar addData com parametros quando necessario
- usar filtros do dataset para recortes
- usar ordenacao no dataset para sequencia oficial
- usar modo item unico quando houver destaque unico

## Evitar

- localStorage como base da regra de negocio
- logica de rotacao local que conflite com o canal de dados

## Fallback permitido

- localStorage apenas para telemetria ou experimento de dev
- nunca para definir fluxo principal em producao

## Checklist rapido

- filtros corretos
- ordenacao aplicada
- lote/item unico validado
- fallback para vazio definido
