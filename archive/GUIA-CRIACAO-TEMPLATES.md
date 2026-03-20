# ⚠️ DOCUMENTO OBSOLETO

> **ATENÇÃO:** Este documento foi substituído por documentação modular e organizada.
>
> **Nova documentação:**
> - **Início rápido:** [../QUICKSTART.md](../QUICKSTART.md)
> - **Tutorial completo:** [../docs/01-getting-started.md](../docs/01-getting-started.md)
> - **Índice completo:** [../docs/README.md](../docs/README.md)
>
> Este arquivo foi arquivado em 06/02/2026 para referência histórica.

---

# 🚀 GUIA RÁPIDO - Criação de Templates EdgeContents (VERSÃO ANTIGA)

## 📌 Visão Geral

Templates HTML para **Digital Signage** usando **EdgeContents CMS** com **TailwindCSS** para estilização moderna e compatibilidade com **navegadores antigos** (Android 7+).

---

## ⚙️ SETUP INICIAL (Apenas primeira vez)

### ✅ Pré-requisitos

- **TailwindCSS instalado GLOBALMENTE** (já configurado)
- **Node.js** instalado
- Editor de código (VS Code recomendado)

> ⚠️ **IMPORTANTE:** Não precisa instalar TailwindCSS localmente em cada projeto!

---

## 🏗️ CRIAR NOVO TEMPLATE

### **1. Crie a estrutura de pastas**

```
nome_template/
├── index.html
├── package.json
├── tailwind.config.js
├── css/
│   ├── input.css
│   ├── master.css (será gerado)
│   └── fonts/
├── img/
└── js/
    ├── ebhtml.js (copiar de outro template)
    ├── master.js
    └── mock-data.js (opcional)
```

### **2. Copie os arquivos base**

**De um template existente, copie:**
- `js/ebhtml.js` (nunca modificar)
- `tailwind.config.js` (ajustar se necessário)

---

## 📄 ARQUIVOS ESSENCIAIS

### **package.json**

```json
{
  "name": "nome-do-template",
  "version": "1.0.0",
  "description": "Template para EdgeContents",
  "scripts": {
    "dev": "tailwindcss -i css/input.css -o css/master.css --watch",
    "build": "tailwindcss -i css/input.css -o css/master.css --minify"
  },
  "author": "Seu Nome",
  "license": "ISC"
}
```

> **Nota:** Sem `dependencies` ou `devDependencies` - TailwindCSS é global!

---

### **tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./**/*.html",
    "./**/*.js",
    "./css/*.css"
  ],
  theme: {
    extend: {
      fontFamily: {
        'roboto-regular': ['Roboto Regular', 'sans-serif'],
        'roboto-bold': ['Roboto Bold', 'sans-serif'],
        'roboto-black': ['Roboto Black', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in-out',
        'slide-in': 'slideIn 0.5s ease-out'
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' }
        },
        slideIn: {
          'from': { transform: 'translateX(-100%)' },
          'to': { transform: 'translateX(0)' }
        }
      }
    }
  },
  plugins: []
}
```

---

### **css/input.css** (Arquivo FONTE)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Fontes customizadas */
@font-face {
    font-family: 'Roboto Regular';
    src: url('fonts/Roboto-Regular.ttf');
}

@font-face {
    font-family: 'Roboto Bold';
    src: url('fonts/Roboto-Bold.ttf');
}

/* Classes customizadas responsivas */
.titulo-principal {
    font-size: clamp(2rem, 5vw, 8rem);
    line-height: 1.2;
    font-weight: 700;
}

.texto-responsivo {
    font-size: clamp(1rem, 2vw, 3rem);
}

/* Gradientes */
.text-gradient {
    background: linear-gradient(90deg, #fddb4a, #f09a24);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* Sombras */
.text-shadow {
    text-shadow: 3px 3px 8px rgba(0, 0, 0, 0.8);
}
```

---

### **index.html**

```html
<!DOCTYPE html>
<html lang="pt-br" class="h-full w-full overflow-hidden">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/master.css">
    
    <!-- Mock data (comentar em produção) -->
    <!-- <script src="js/mock-data.js"></script> -->
    
    <script src="js/ebhtml.js"></script>
    <script src="js/master.js"></script>
    <title>Nome do Template</title>
</head>
<body class="relative h-screen w-full overflow-hidden bg-gray-900 opacity-0 transition-opacity duration-1000">
    
    <div id="content" class="flex items-center justify-center w-full h-full">
        <!-- Conteúdo será gerado dinamicamente -->
    </div>

</body>
</html>
```

---

### **js/mock-data.js** (Desenvolvimento)

```javascript
var MOCK_DATA = {
    enabled: true,  // Alterar para false em produção
    
    config: {
        duration: 5000,      // Duração em ms
        maxItems: 10,
        showLogo: true
    },
    
    dados: [
        { titulo: "Item 1", descricao: "Descrição do item 1" },
        { titulo: "Item 2", descricao: "Descrição do item 2" },
        { titulo: "Item 3", descricao: "Descrição do item 3" }
    ]
};
```

---

### **js/master.js** (Template Base)

```javascript
window.onload = function() {
    
    // Função principal
    function iniciarTemplate(dados, config, loader) {
        var container = document.getElementById('content');
        container.innerHTML = '';
        
        // Criar elementos dinamicamente
        for (var i = 0; i < dados.length; i++) {
            var item = criarItem(dados[i]);
            container.appendChild(item);
        }
        
        // Fade in
        document.body.classList.add('opacity-100');
        
        // ✅ OBRIGATÓRIO - Avisa que carregou
        if (loader) loader.loaded();
        
        // ✅ OBRIGATÓRIO - Avisa que terminou
        setTimeout(function() {
            if (loader) loader.finished();
        }, config.duration);
    }
    
    // Criar elemento individual
    function criarItem(data) {
        var div = document.createElement('div');
        div.className = 'p-6 bg-white rounded-xl shadow-lg m-4';
        
        div.innerHTML = 
            '<h2 class="text-3xl font-roboto-bold text-gray-900 mb-2">' + 
                data.titulo + 
            '</h2>' +
            '<p class="text-lg font-roboto-regular text-gray-700">' + 
                data.descricao + 
            '</p>';
        
        return div;
    }
    
    // Detecta modo desenvolvimento ou produção
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        // MODO DESENVOLVIMENTO
        console.log('Usando dados mockados');
        
        var mockLoader = {
            loaded: function() { console.log('[Mock] Carregado'); },
            finished: function() { console.log('[Mock] Finalizado'); }
        };
        
        iniciarTemplate(MOCK_DATA.dados, MOCK_DATA.config, mockLoader);
        
    } else {
        // MODO PRODUÇÃO
        console.log('Carregando dados do EdgeContents');
        
        ebhtml.create2({}, function(loader) {
            loader.addData('D_NOME_DATASET', false);
            loader.autoloaded = false;
            loader.nodataiserror = false;
            
            loader.load(function() {
                if (loader.data('D_NOME_DATASET') == undefined) {
                    console.warn('Sem dados disponíveis');
                    loader.loaded();
                    loader.finished();
                    return;
                }
                
                // Processar dados do EdgeContents
                var dadosReais = [];
                var lista = loader.datalist('D_NOME_DATASET');
                
                for (var i = 0; i < lista.count(); i++) {
                    var registro = lista.get(i);
                    dadosReais.push({
                        titulo: registro.value('titulo').value,
                        descricao: registro.value('descricao').value
                    });
                }
                
                var config = {
                    duration: 30000,
                    maxItems: 10,
                    showLogo: true
                };
                
                iniciarTemplate(dadosReais, config, loader);
            });
        });
    }
};
```

---

## 🔧 WORKFLOW DE DESENVOLVIMENTO

### **Ambiente EdgeContents**

**Ferramentas necessárias:**
- `ebcliente4.exe` - Servidor local EdgeContents
- `ebhtmlbuilder4` - Compilador de templates
- **URL de teste**: `http://localhost:12099/FILES/1/index.html`

### **1. Desenvolvimento Local**

**a) Inicie o servidor EdgeContents:**
```bash
# Execute ebcliente4.exe para levantar o servidor
# Acesse: http://localhost:12099/FILES/1/index.html
```

**b) Inicie o TailwindCSS em watch mode:**
```bash
npm run dev
```

**c) Desenvolvimento:**
- Edite HTML/JS/CSS conforme necessário
- TailwindCSS recompila automaticamente
- Mock data habilitado para testes
- Recarregue `http://localhost:12099/FILES/1/index.html` para ver mudanças

### **2. Build para Produção**

```bash
npm run build
```

- Gera `css/master.css` minificado
- Comenta `<script src="js/mock-data.js"></script>` no HTML
- Testa em `http://localhost:12099/FILES/1/index.html` com dados reais

### **3. Compilação e Deploy**

**a) Compilar com ebhtmlbuilder4:**
- Use ebhtmlbuilder4 para compilar o template
- Valida compatibilidade com EdgeContents

**b) Testar no servidor:**
- Teste em `http://localhost:12099/FILES/1/index.html`
- Verifique `loader.loaded()` e `loader.finished()`

**c) Deploy para EdgeContents:**
- ✅ Toda a pasta do template compilado
- ❌ Não enviar: `node_modules`, `package.json`, `tailwind.config.js`
- ❌ Não enviar: `css/input.css` (apenas `master.css`)

---

## ⚠️ REGRAS DE COMPATIBILIDADE

### **JavaScript - APENAS ES5**

❌ **NUNCA use:**
```javascript
const, let
() => {}
`template ${string}`
async/await
class MyClass {}
array.find()
array.includes()
for...of
```

✅ **SEMPRE use:**
```javascript
var
function() {}
'string ' + concatenation
Callbacks
function MyClass() {}
Loop manual
for (var i = 0; i < array.length; i++)
```

---

## 🎨 CLASSES TAILWIND ESSENCIAIS

### Layout
```
flex items-center justify-center
w-full h-full h-screen
absolute relative fixed
top-0 left-0 right-0 bottom-0
```

### Spacing
```
p-4 p-6 p-8 px-[5%] py-[2%]
m-4 mb-8 space-y-4
```

### Typography
```
text-xl text-2xl text-4xl
font-bold font-roboto-bold
text-center leading-tight
uppercase
```

### Colors
```
bg-blue-600 bg-white text-white
bg-opacity-80
```

### Effects
```
opacity-0 opacity-100
transition-opacity duration-1000
rounded-xl shadow-lg
```

---

## ✅ CHECKLIST PRÉ-DEPLOY

- [ ] `npm run build` executado
- [ ] Mock data comentado no HTML
- [ ] `loader.loaded()` implementado
- [ ] `loader.finished()` implementado
- [ ] Nenhuma arrow function
- [ ] Nenhum let/const
- [ ] Testado em navegador antigo
- [ ] CSS minificado (`master.css`)
- [ ] Imagens otimizadas

---

## 📚 REFERÊNCIAS RÁPIDAS

### Acessar Dados EdgeContents
```javascript
var item = loader.data('DATASET');
var valor = item.value('campo').value;
var lista = loader.datalist('DATASET');
var total = lista.count();
```

### Criar HTML Dinâmico
```javascript
var div = document.createElement('div');
div.className = 'flex items-center justify-center';
div.innerHTML = '<h1>' + titulo + '</h1>';
container.appendChild(div);
```

### Animações
```javascript
// Fade In
elemento.classList.add('opacity-100');
elemento.classList.remove('opacity-0');
```

---

## 🎯 PRÓXIMOS PASSOS

1. **Copie esta estrutura** para novo template
2. **Execute `npm run dev`** para desenvolvimento
3. **Customize** HTML/CSS/JS conforme necessidade
4. **Teste** com mock data
5. **Build** final com `npm run build`
6. **Deploy** para EdgeContents

---

**🎨 TailwindCSS está global - sem instalação local necessária!**
