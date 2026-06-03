# Guia Rápido de Teste - Mock Data

## 🎯 Cenários Disponíveis

O arquivo `js/mock-data.js` contém 5 cenários baseados nos cartazes reais:

### 1. REGULAR - Coca Cola Zero 2L
```javascript
dados: MOCK_SCENARIOS.regular,
```
**Resultado:** R$ 11,80 (preço simples grande)

### 2. DE-POR - Creme de Leite Piracanjuba
```javascript
dados: MOCK_SCENARIOS.depor_creme,
```
**Resultado:** ~~2,79~~ → R$ 2,39

### 3. DE-POR - Amaciante Comfort 1L
```javascript
dados: MOCK_SCENARIOS.depor_amaciante,
```
**Resultado:** ~~23,99~~ → R$ 19,99

### 4. FIDELIDADE (exemplo genérico)
```javascript
dados: MOCK_SCENARIOS.fidelidade,
```
**Resultado:** R$ 19,99 + badge azul "NO CARTÃO ANDORINHA..."

### 5. A PARTIR DE - Azeite Andorinha
```javascript
dados: MOCK_SCENARIOS.apartirde,
```
**Resultado:** 
- R$ 35,99 UNIDADE
- Badge azul: "NO CARTÃO ANDORINHA OU A PARTIR DE 2 UNIDADES"
- R$ 26,99 UNIDADE

## 🔧 Como Trocar o Cenário

1. Abrir `js/mock-data.js`
2. Na linha 7-11, descomentar o cenário desejado
3. Comentar os outros
4. Salvar e recarregar o navegador

## ✅ Teste Rápido

Com o servidor rodando (`npm run dev`):
1. Abrir: `http://localhost:12099/FILES/1/index.html`
2. Ver o cartaz renderizado
3. Trocar cenário em mock-data.js
4. Recarregar página
