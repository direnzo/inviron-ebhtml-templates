# 🔴 MODO OFFLINE - Guia de Uso (ATUALIZADO)

## ✅ Sistema Atualizado com Formato Real da API!

O sistema agora está **100% compatível** com o formato real da API.

---

## 📋 Formato da API

### ✅ **Resposta de Sucesso**
```json
{
  "codSap": "000001234567",
  "descricao": "PILHA AA ALCALINA PACK 4",
  "ean": "7892840800239",
  "image": "https://pricefy-cdrom-fotos.s3.amazonaws.com/7892840800239/7892840800239-7a397.png",
  "loja": "123",
  "preco": "19.90",
  "preco_promoc": "15.90"
}
```

### ❌ **Resposta de Erro**
```json
{
  "errorCode": "500 INTERNAL_SERVER_ERROR",
  "httpStatusCode": 500,
  "message": "Houve um erro na busca pelo produto"
}
```

---

## 🎮 Como Usar

### 1️⃣ **Ativar/Desativar Modo Offline**

Abra o arquivo `js/mock.js` e altere a linha 3:

```javascript
// MODO OFFLINE ATIVO
var OFFLINE_MODE = true;

// MODO ONLINE ATIVO
var OFFLINE_MODE = false;
```

### 2️⃣ **Simular Erro 500**

Abra o arquivo `js/mock.js` e altere a linha 8:

```javascript
// SIMULA ERRO
var SIMULATE_ERROR = true;

// MODO NORMAL (sem erro)
var SIMULATE_ERROR = false;
```

**Ou use o atalho:** Pressione **E** durante a execução

---

### 3️⃣ **Indicador Visual**

Quando o modo offline está ativo, você verá no **canto inferior esquerdo**:

```
🔴 MODO OFFLINE
Produto: 1 de 10
⌨️ Atalhos:
ESPAÇO = Próximo (reload)
N = Próximo (suave)
R = Resetar
E = Simular Erro
```

---

### 4️⃣ **Atalhos de Teclado**

| Tecla | Ação |
|-------|------|
| **ESPAÇO** | Próximo produto (com reload da página) |
| **N** | Próximo produto (troca suave sem reload) |
| **R** | Resetar para o primeiro produto |
| **E** | Ativar simulação de erro 500 (com reload) |

---

### 5️⃣ **Produtos Disponíveis no Mock**

10 produtos configurados com **formato real da API**:

1. Água São Lourenço natural 510ml - R$ 3,55 (promo: R$ 2,99)
2. Guaraná Antarctica 100% Natural 260ml - R$ 3,49 (promo: R$ 2,79)
3. Refrigerante Coca-Cola Lata 350ml - R$ 4,19 (promo: R$ 3,49)
4. Salgadinho Pringles Galinha Caipira 100g - R$ 16,49 (promo: R$ 14,99)
5. Leite Condensado Moça Lata 395g - R$ 8,19 (promo: R$ 7,49)
6. Amido de Milho Maizena 500g - R$ 18,29 (promo: R$ 16,99)
7. Chocolate em Pó NESTLÉ Dois Frades 200g - R$ 28,99 (promo: R$ 25,99)
8. Filtro de Papel Melitta 103 - 30un - R$ 5,19 (promo: R$ 4,49)
9. Cereal Sucrilhos Kelloggs 690g - R$ 30,99 (promo: R$ 27,99)
10. Chá MATTE LEÃO Natural 250g - R$ 14,49 (promo: R$ 12,99)

---

### 6️⃣ **Como Adicionar Mais Produtos**

Edite o arquivo `js/mock.js` e adicione no array `MOCK`:

```javascript
var MOCK = [
    // ... produtos existentes ...
    {
        codSap: '000001234999',
        descricao: 'Nome do Seu Produto',
        ean: '1234567890123',
        image: 'img/seu-produto.webp',
        loja: '123',
        preco: '99.90',
        preco_promoc: '89.90'
    },
];
```

**Importante:** Coloque a imagem na pasta `img/`

---

### 7️⃣ **Console do Navegador**

Abra o DevTools (F12) e veja os logs:

**Modo Normal:**
```
🔴 MODO OFFLINE ATIVO - Usando MOCK
🎨 Aplicando textFit...
📐 Orientação: LANDSCAPE
📝 Título conteúdo: Água São Lourenço natural 510ml
✅ Título ajustado
```

**Simulando Erro:**
```
🔴 MODO OFFLINE ATIVO - Usando MOCK
❌ Simulando erro 500...
```

---

## 🔧 O Que Foi Atualizado

1. ✅ **Formato de dados atualizado** para corresponder à API real
2. ✅ **Tratamento de erro 500** implementado
3. ✅ **Simulação de erro** via variável `SIMULATE_ERROR`
4. ✅ **Atalho 'E'** para simular erro rapidamente
5. ✅ **Campos da API** agora usam: `descricao`, `preco`, `image`, `ean`, `codSap`, `loja`, `preco_promoc`
6. ✅ **Compatibilidade total** com resposta da API

---

## 🚀 Para Testar

### **Teste 1: Modo Normal**
1. Configure: `OFFLINE_MODE = true` e `SIMULATE_ERROR = false`
2. Abra `index.html` no navegador
3. Deve mostrar produtos normalmente

### **Teste 2: Simular Erro**
1. Configure: `OFFLINE_MODE = true` e `SIMULATE_ERROR = true`
2. Ou pressione **E** durante a execução
3. Deve mostrar tela de erro com a mensagem:
   ```
   PRODUTO NÃO
   ENCONTRADO
   500
   ```

### **Teste 3: Modo Online**
1. Configure: `OFFLINE_MODE = false`
2. O sistema conectará ao endpoint real:
   ```
   http://localhost:13199/INFO/PRICESCAN_BARCODE
   ```

---

## 📊 Estrutura de Dados

### **Mock Antigo (DESCONTINUADO):**
```javascript
{
    barcode: '...',
    image: '...',
    title: '...',
    price: '...'
}
```

### **Mock Novo (FORMATO DA API):**
```javascript
{
    codSap: '000001234567',
    descricao: 'PILHA AA ALCALINA PACK 4',
    ean: '7892840800239',
    image: 'https://...',
    loja: '123',
    preco: '19.90',
    preco_promoc: '15.90'
}
```

---

## ⚙️ Configurações Disponíveis

### No arquivo `js/mock.js`:

```javascript
// Linha 3: Modo Offline/Online
var OFFLINE_MODE = true;  // true = offline, false = online

// Linha 8: Simular Erro
var SIMULATE_ERROR = false;  // true = simula erro 500, false = normal
```

### No arquivo `js/master.js`:

```javascript
// Linha 71: Tempo de exibição de cada produto (em milissegundos)
}, 10000); // 10000ms = 10 segundos
```

---

✅ **Sistema 100% funcional e compatível com a API!**
