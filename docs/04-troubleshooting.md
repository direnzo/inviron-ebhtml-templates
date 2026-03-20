# 🚨 Troubleshooting - Problemas Comuns

Soluções para os problemas mais frequentes no desenvolvimento de templates EdgeContents.

---

## 📋 Índice de Problemas

1. [Playlist Trava](#playlist-trava)
2. [CSS Não Carrega](#css-não-carrega)
3. [Dados Não Aparecem](#dados-não-aparecem)
4. [Erros de JavaScript](#erros-de-javascript)
5. [Imagens Não Carregam](#imagens-não-carregam)
6. [Template Não Inicia](#template-não-inicia)
7. [Animações Não Funcionam](#animações-não-funcionam)
8. [Servidor EdgeContents](#servidor-edgecontents)

---

## 🔄 Playlist Trava

### Sintoma
Template carrega mas playlist não avança para próximo item.

### Causas Comuns

#### 1. Não chamou `loader.finished()`

```javascript
// ❌ ERRADO - Esqueceu finished()
loader.loaded();
// Playlist trava aqui

// ✅ CORRETO
loader.loaded();
setTimeout(function() {
    loader.finished();  // Sempre chame!
}, 5000);
```

#### 2. Chamou `loaded()` em erro

```javascript
// ❌ ERRADO - Notifica sucesso em erro
if (loader.data('D_DATASET') === undefined) {
    loader.loaded();   // NÃO faça isso!
    loader.finished();
}

// ✅ CORRETO - Apenas finished em erro
if (loader.data('D_DATASET') === undefined) {
    console.error('Sem dados');
    loader.finished();  // Só finished
    return;
}
```

#### 3. Erro de JavaScript não tratado

```javascript
// ❌ ERRADO - Erro quebra execução
var titulo = dados.item[0].titulo;  // Typo: dados.item em vez de dados[0]

// ✅ CORRETO - Try/catch protege
try {
    var titulo = dados[0].TITULO;
    renderizar(titulo);
    loader.loaded();
} catch (erro) {
    console.error('Erro ao renderizar:', erro);
    loader.finished();  // Garante que finaliza
}
```

### Solução

**Checklist:**
- [ ] `loader.loaded()` apenas em sucesso
- [ ] `loader.finished()` sempre (sucesso OU erro)
- [ ] Try/catch em código crítico
- [ ] Console (F12) sem erros vermelhos

---

## 🎨 CSS Não Carrega

### Sintoma
Template aparece sem estilos, apenas HTML bruto.

### Causas Comuns

#### 1. TailwindCSS não compilou

```powershell
# Verifique se npm run dev está rodando
npm run dev

# Console deve mostrar:
# Rebuilding...
# Done in 234ms
```

**Solução:**
- Inicie `npm run dev` em terminal separado
- Salve `css/input.css` para forçar recompilação
- Verifique se `css/master.css` foi atualizado (data/hora modificação)

#### 2. Caminho do CSS incorreto

```html
<!-- ❌ ERRADO - Caminho relativo errado -->
<link rel="stylesheet" href="../css/master.css">

<!-- ✅ CORRETO - Caminho relativo à raiz -->
<link rel="stylesheet" href="css/master.css">
```

#### 3. Cache do navegador

**Solução:**
- Pressione `Ctrl + F5` (hard reload)
- Abra DevTools (F12) → aba Network → marque "Disable cache"
- Feche e reabra o navegador

#### 4. Erro de sintaxe no input.css

```css
/* ❌ ERRADO - Faltou fechar chave */
.minha-classe {
    color: red;
    font-size: 2rem
/* Esqueceu } aqui */

/* ✅ CORRETO */
.minha-classe {
    color: red;
    font-size: 2rem;
}
```

**Verificar:**
- Console do `npm run dev` mostra erros?
- Abra `css/input.css` e procure por sintaxe inválida

---

## 📊 Dados Não Aparecem

### Sintoma
Template carrega mas não exibe conteúdo/texto/imagens.

### Causas Comuns

#### 1. Mock data desabilitado

```javascript
// Verifique js/mock-data.js
var MOCK_DATA = {
    enabled: false,  // ← Está false?
    // ...
};
```

**Solução:**
- Altere para `enabled: true` em desenvolvimento
- OU conecte ao servidor EdgeContents (ebcliente4.exe)

#### 2. Dataset vazio no servidor

```javascript
// Console mostra "Dataset vazio"?
if (loader.data('D_NOTICIAS') === undefined) {
    console.error('Dataset vazio');  // ← Veja isso?
}
```

**Solução:**
- Verifique se dataset existe no CMS EdgeContents
- Acesse `http://localhost:12099/content/data/D_NOTICIAS` diretamente
- Confirme que XML retorna `<EBDATA>` com campos

#### 3. Nome do campo incorreto

```javascript
// ❌ ERRADO - Campo não existe no XML
var titulo = item.value('titulo').value;  // Lowercase

// ✅ CORRETO - EdgeContents usa UPPERCASE
var titulo = item.value('TITULO').value;  // UPPERCASE
```

**Verificar:**
- Console (F12) mostra erros de `undefined`?
- Confirme nomes de campos no XML (sempre UPPERCASE)

#### 4. Estrutura Mock diferente do código

```javascript
// Mock
dados: [{ titulo: "Teste" }]  // Lowercase

// Código acessa
var t = dados[0].TITULO;  // UPPERCASE - undefined!
```

**Solução:** Alinhe Mock com estrutura XML (sempre UPPERCASE)

---

## ⚠️ Erros de JavaScript

### Sintoma
Console (F12) mostra erros vermelhos.

### Erros Comuns ES5

#### 1. Uso de `const/let`

```javascript
// ❌ ERRO: const is not defined
const nome = 'João';

// ✅ CORRETO
var nome = 'João';
```

#### 2. Arrow functions

```javascript
// ❌ ERRO: Unexpected token =>
var somar = (a, b) => a + b;

// ✅ CORRETO
var somar = function(a, b) { return a + b; };
```

#### 3. Template strings

```javascript
// ❌ ERRO: Unexpected token `
var texto = `Olá, ${nome}!`;

// ✅ CORRETO
var texto = 'Olá, ' + nome + '!';
```

#### 4. Array methods ES6

```javascript
// ❌ ERRO: find is not a function
var item = arr.find(function(x) { return x > 5; });

// ✅ CORRETO
var item;
for (var i = 0; i < arr.length; i++) {
    if (arr[i] > 5) {
        item = arr[i];
        break;
    }
}
```

### Debugging

```javascript
// Adicione logs estratégicos
console.log('1. Loader criado');
console.log('2. Dados carregados:', dados);
console.log('3. Quantidade:', dados.length);
console.log('4. Renderizando...');
```

---

## 🖼️ Imagens Não Carregam

### Sintoma
Imagens não aparecem (ícone de imagem quebrada).

### Causas Comuns

#### 1. Caminho incorreto

```javascript
// ❌ ERRADO - Caminho relativo errado
<img src="../img/logo.png">

// ✅ CORRETO - Relativo à raiz
<img src="img/logo.png">

// ✅ CORRETO - Absoluto do servidor
<img src="http://localhost:12099/FILES/1/img/logo.png">
```

#### 2. Arquivo não existe

**Verificar:**
- Arquivo existe em `img/` ?
- Nome está correto (case-sensitive no servidor)?
- Extensão correta (.jpg, .png, .gif)?

#### 3. EdgeContents URL incompleta

```javascript
// ❌ ERRADO - URL relativa do XML
var foto = item.value('FOTO1').value;  // "uploads/foto.jpg"
html += '<img src="' + foto + '">';    // Não encontra

// ✅ CORRETO - Adiciona base URL
var fotoURL = 'http://localhost:12099/FILES/1/' + foto;
html += '<img src="' + fotoURL + '">';
```

#### 4. CORS (produção)

**Solução:** Configure servidor EdgeContents para permitir CORS nas imagens.

---

## 🚀 Template Não Inicia

### Sintoma
Página em branco, nada aparece.

### Causas Comuns

#### 1. `window.onload` não executou

```javascript
// Verifique se está envolvido em window.onload
window.onload = function() {
    // Código aqui
};
```

#### 2. Erro antes de carregar

```javascript
// Erro de sintaxe impede execução
var teste = function() {  // Faltou fechar
    console.log('teste');
// };  ← Faltou isso
```

**Verificar:**
- Console (F12) mostra erro de sintaxe?
- Arquivo `js/master.js` está correto?

#### 3. Script não carregado

```html
<!-- Verifique ordem dos scripts -->
<script src="js/ebhtml.js"></script>
<script src="js/mock-data.js"></script>  <!-- Mock primeiro -->
<script src="js/master.js"></script>     <!-- Master por último -->
```

#### 4. ebhtml.js ausente

**Verificar:**
- Arquivo `js/ebhtml.js` existe?
- Console mostra erro "ebhtml is not defined"?

**Solução:** Copie `ebhtml.js` de `_template-base/js/`

---

## 🎬 Animações Não Funcionam

### Sintoma
Classes de animação não têm efeito.

### Causas Comuns

#### 1. Tailwind não compilou animação

```css
/* Adicione em css/input.css */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.fade-in {
    animation: fadeIn 1s ease-in;
}
```

Execute `npm run dev` para compilar.

#### 2. Transição sem delay

```javascript
// ❌ ERRADO - Troca classe imediatamente
el.classList.add('opacity-100');
el.classList.remove('opacity-0');
// Navegador não anima (não houve mudança de estado)

// ✅ CORRETO - Delay permite transição
el.classList.remove('opacity-100');
el.classList.add('opacity-0');
setTimeout(function() {
    el.classList.remove('opacity-0');
    el.classList.add('opacity-100');
}, 50);  // 50ms de delay
```

#### 3. Classe Tailwind de transição faltando

```html
<!-- ❌ ERRADO - Sem transition -->
<div class="opacity-0">

<!-- ✅ CORRETO - Com transition -->
<div class="opacity-0 transition-opacity duration-1000">
```

---

## 🖥️ Servidor EdgeContents

### ebcliente4.exe não inicia

**Verificar:**
- Porta 12099 está disponível?
- Antivírus bloqueando?
- Executar como administrador

### Erro 404 ao acessar localhost:12099

**Verificar:**
- Servidor está rodando?
- URL correta: `http://localhost:12099/FILES/1/index.html`
- Caminho do arquivo está em `FILES/1/` ?

### Dataset retorna vazio

**Verificar:**
- Dataset configurado no CMS?
- Acesse diretamente: `http://localhost:12099/content/data/NOME_DATASET`
- XML retorna `<EBDATA>` ou erro?

---

## 🛠️ Ferramentas de Debugging

### Console DevTools (F12)

```javascript
// Logs informativos
console.log('Variável:', variavel);
console.log('Tipo:', typeof variavel);
console.log('Array length:', arr.length);

// Tabela (visualização melhor)
console.table(dados);

// Alertas visuais
console.warn('Aviso: campo vazio');
console.error('ERRO: falha crítica');
```

### Network Tab (DevTools)

1. Abra DevTools (F12)
2. Aba "Network"
3. Recarregue página (F5)
4. Veja requisições:
   - `master.css` → Status 200?
   - `ebhtml.js` → Status 200?
   - `/content/data/D_DATASET` → Status 200? Qual resposta?

### Testar Código Isolado

```javascript
// No console do navegador (F12 → Console)
var teste = ebhtml;
console.log(teste);  // undefined = ebhtml não carregou

var loader;
ebhtml.create2({}, function(l) {
    loader = l;
    console.log('Loader criado:', loader);
});
```

---

## 📋 Checklist de Debug

Quando algo não funcionar, siga esta ordem:

- [ ] **Console (F12) sem erros?**
- [ ] **`npm run dev` rodando?**
- [ ] **Servidor EdgeContents ativo? (ebcliente4.exe)**
- [ ] **Mock data habilitado (`enabled: true`)?**
- [ ] **Campos em UPPERCASE (XML)?**
- [ ] **`loader.loaded()` e `loader.finished()` corretos?**
- [ ] **Sintaxe ES5 (sem `let/const/arrow`)?**
- [ ] **Caminhos de arquivos corretos (CSS, JS, img)?**
- [ ] **Hard reload (Ctrl + F5)?**

---

## 🆘 Ainda com Problemas?

### Resetar Template

1. Delete `css/master.css`
2. Execute `npm run dev`
3. Aguarde gerar novo `master.css`
4. Hard reload (Ctrl + F5)

### Comparar com Template Base

1. Copie `_template-base` novamente
2. Compare arquivos (index.html, master.js)
3. Identifique diferença que causa problema

### Isolar o Problema

```javascript
// Teste mínimo em master.js
window.onload = function() {
    console.log('1. Window loaded');
    
    var container = document.getElementById('container');
    console.log('2. Container:', container);
    
    container.innerHTML = '<h1 class="text-white text-6xl">TESTE</h1>';
    console.log('3. HTML injetado');
};
```

Se isso funcionar, problema está no código de dados/renderização.

---

## 📚 Recursos Adicionais

- **[docs/01-getting-started.md](01-getting-started.md)** - Revisar fundamentos
- **[docs/02-xml-format.md](02-xml-format.md)** - Estrutura de dados
- **[docs/05-api-reference.md](05-api-reference.md)** - API completa EBHTML
- **[GLOSSARY.md](GLOSSARY.md)** - Termos técnicos

---

**Última atualização:** 06/02/2026
