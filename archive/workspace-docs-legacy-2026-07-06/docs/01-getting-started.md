# 🎓 Guia de Introdução - Templates EdgeContents

Tutorial completo para desenvolvedores iniciantes criarem templates para Digital Signage.

---

## 📖 O que Você Vai Aprender

- O que é EdgeContents e Digital Signage
- Como a arquitetura funciona
- Setup completo do ambiente de desenvolvimento
- Criar e personalizar seu primeiro template
- Entender o ciclo de vida de um template
- Workflow de desenvolvimento e produção

**Tempo estimado:** 30-45 minutos

---

## 🎯 O que é EdgeContents?

**EdgeContents** é um sistema de gerenciamento de conteúdo (CMS) especializado em **Digital Signage** - exibição de conteúdo dinâmico em displays públicos como TVs, totens e monitores.

### Como Funciona

```
┌─────────────────┐      XML/HTTP      ┌──────────────┐
│ EdgeContents    │ ───────────────→   │  Template    │
│ CMS (Backend)   │                    │  HTML (TV)   │
│                 │                    │              │
│ - Dados (XML)   │                    │ - ebhtml.js  │
│ - Imagens       │                    │ - master.js  │
│ - Configuração  │                    │ - CSS        │
└─────────────────┘                    └──────────────┘
```

**Você desenvolve:** Templates HTML que exibem conteúdo  
**EdgeContents fornece:** Dados via XML e gerencia playlist

---

## 🏗️ Arquitetura do Sistema

### Componentes Principais

1. **EdgeContents CMS (Servidor)**
   - Armazena dados em formato XML
   - Fornece datasets via HTTP (`/content/data/{DATASET}`)
   - Gerencia playlist e timing dos templates

2. **EBHTML (Biblioteca JavaScript)**
   - Conecta template ao CMS
   - Carrega dados do servidor
   - Controla ciclo de vida (loaded/finished)
   - **Arquivo:** `js/ebhtml.js` (nunca editar)

3. **Template HTML (Você desenvolve)**
   - Renderiza dados visualmente
   - Controla animações e transições
   - Compatível com Android 7+ (ES5 apenas)
   - **Arquivos:** `index.html`, `js/master.js`, `css/input.css`

4. **TailwindCSS (Global)**
   - Framework CSS utilitário
   - Instalado globalmente (não precisa npm install)
   - Compila `css/input.css` → `css/master.css`

### Fluxo de Dados

```
1. Template inicia → ebhtml.create2()
2. Registra datasets → loader.addData('D_DATASET')
3. Carrega dados → loader.load()
4. EdgeContents retorna XML → parsing automático
5. Template renderiza → HTML/CSS/JS
6. Notifica sucesso → loader.loaded()
7. Aguarda duração → setTimeout(...)
8. Notifica término → loader.finished()
9. Playlist avança → próximo template
```

---

## ⚙️ Setup do Ambiente

### Pré-requisitos

- **Node.js** (versão 14+)
- **TailwindCSS** instalado globalmente
- **EdgeContents Server** (ebcliente4.exe)
- **Editor de código** (VS Code recomendado)

### Verificar Instalação

```powershell
# Node.js
node --version  # Deve mostrar v14.0.0 ou superior

# TailwindCSS
npx tailwindcss --help  # Deve mostrar comandos disponíveis
```

---

## 🚀 Criando Seu Primeiro Template

### Passo 1: Copiar Template Base

```powershell
# Clone o template base
cp -r _template-base meu-template
cd meu-template
```

**Estrutura criada:**
```
meu-template/
├── index.html              # Estrutura HTML
├── package.json            # Scripts NPM
├── tailwind.config.js      # Config Tailwind
├── css/
│   ├── input.css          # CSS fonte (editar)
│   ├── master.css         # CSS compilado (gerado)
│   └── fonts/             # Fontes customizadas
├── img/                   # Imagens e assets
└── js/
    ├── ebhtml.js          # Biblioteca EdgeContents
    ├── master.js          # Lógica do template
    └── mock-data.js       # Dados de teste
```

### Passo 2: Iniciar Servidor EdgeContents

```powershell
# Execute o servidor local
ebcliente4.exe
```

**Console deve mostrar:**
```
EdgeContents Server iniciado
URL: http://localhost:12099
```

### Passo 3: Ativar TailwindCSS Watch Mode

```powershell
npm run dev
```

**Console deve mostrar:**
```
Rebuilding...
Done in 234ms
```

**O que acontece:**
- TailwindCSS monitora `css/input.css`
- Ao salvar, gera automaticamente `css/master.css`
- Recarregue o navegador para ver mudanças

### Passo 4: Habilitar Mock Data (Desenvolvimento)

Abra `index.html` e **descomente**:

```html
<!-- Mock data (desenvolvimento) -->
<script src="js/mock-data.js"></script>  <!-- DESCOMENTAR -->
```

**Por que usar Mock Data?**
- Desenvolver sem servidor EdgeContents ativo
- Testar rapidamente sem configurar datasets
- Controlar dados de teste facilmente

### Passo 5: Abrir no Navegador

**URL:** http://localhost:12099/FILES/1/index.html

✅ **Sucesso:** Você deve ver o template rodando com dados de teste

---

## 📝 Entendendo o Código

### index.html (Estrutura)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meu Template</title>
    
    <!-- TailwindCSS compilado -->
    <link rel="stylesheet" href="css/master.css">
</head>
<body class="w-full h-full bg-black overflow-hidden">
    <!-- Container principal -->
    <div id="container" class="w-full h-full flex items-center justify-center">
        <!-- Conteúdo será injetado via JavaScript -->
    </div>

    <!-- Scripts -->
    <script src="js/ebhtml.js"></script>
    <script src="js/mock-data.js"></script>  <!-- Mock apenas em dev -->
    <script src="js/master.js"></script>
</body>
</html>
```

### js/master.js (Lógica)

```javascript
// Aguarda carregamento completo do DOM
window.onload = function() {
    // Verifica se está em modo Mock (desenvolvimento)
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        iniciarModoMock();
    } else {
        iniciarModoProducao();
    }
};

// Modo de desenvolvimento (dados locais)
function iniciarModoMock() {
    var mockLoader = {
        loaded: function() { console.log('[Mock] Template carregado'); },
        finished: function() { console.log('[Mock] Template finalizado'); }
    };
    
    renderizarTemplate(MOCK_DATA.dados, MOCK_DATA.config, mockLoader);
}

// Modo de produção (EdgeContents)
function iniciarModoProducao() {
    ebhtml.create2({}, function(loader) {
        // Registra dataset necessário
        loader.addData('D_NOTICIAS', false);
        loader.autoloaded = false;
        loader.nodataiserror = false;
        
        // Carrega dados do servidor
        loader.load(function() {
            // Verifica se recebeu dados
            if (loader.data('D_NOTICIAS') === undefined) {
                console.error('ERRO: Dataset vazio');
                loader.finished();  // NÃO chame loaded() em erro
                return;
            }
            
            // Processa dados
            var dados = processarDados(loader);
            renderizarTemplate(dados, {duration: 5000}, loader);
        });
    });
}

// Processa dados do EdgeContents
function processarDados(loader) {
    var lista = [];
    var dataset = loader.datalist('D_NOTICIAS');
    
    for (var i = 0; i < dataset.count(); i++) {
        var item = dataset.get(i);
        lista.push({
            TITULO: item.value('TITULO').value,
            TEXTO: item.value('TEXTO').value,
            FOTO1: item.value('FOTO1').value
        });
    }
    
    return lista;
}

// Renderiza template na tela
function renderizarTemplate(dados, config, loader) {
    var container = document.getElementById('container');
    
    // Cria HTML dinamicamente
    var html = '<div class="text-white text-center p-8">';
    html += '<h1 class="text-6xl font-bold mb-4">' + dados[0].TITULO + '</h1>';
    html += '<p class="text-2xl">' + dados[0].TEXTO + '</p>';
    html += '</div>';
    
    container.innerHTML = html;
    
    // Notifica carregamento bem-sucedido
    loader.loaded();
    
    // Aguarda duração e finaliza
    setTimeout(function() {
        loader.finished();
    }, config.duration);
}
```

### css/input.css (Estilos)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Fontes customizadas */
@font-face {
    font-family: 'Roboto Bold';
    src: url('fonts/Roboto-Bold.ttf');
}

/* Classes utilitárias customizadas */
.titulo-principal {
    font-family: 'Roboto Bold', sans-serif;
    font-size: clamp(2rem, 5vw, 8rem);
    line-height: 1.2;
}

.fade-in {
    animation: fadeIn 1s ease-in;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
```

---

## 🎨 Personalizando o Template

### Modificar Dados de Teste

Edite `js/mock-data.js`:

```javascript
var MOCK_DATA = {
    enabled: true,
    config: {
        duration: 8000  // 8 segundos
    },
    dados: [
        {
            TITULO: "BEM-VINDO",
            TEXTO: "Sistema de Digital Signage",
            FOTO1: "img/logo.png",
            COR: "#3b82f6"
        }
    ]
};
```

### Adicionar Estilos

Edite `css/input.css`:

```css
.meu-card {
    @apply bg-gradient-to-r from-blue-600 to-purple-600;
    @apply rounded-xl shadow-2xl p-12;
    @apply text-white;
}
```

### Modificar Renderização

Edite `js/master.js` → função `renderizarTemplate()`:

```javascript
function renderizarTemplate(dados, config, loader) {
    var container = document.getElementById('container');
    
    // HTML com classes customizadas
    var html = '<div class="meu-card fade-in">';
    html += '<h1 class="titulo-principal">' + dados[0].TITULO + '</h1>';
    html += '<img src="' + dados[0].FOTO1 + '" class="w-64 h-64 rounded-full mx-auto">';
    html += '</div>';
    
    container.innerHTML = html;
    
    loader.loaded();
    setTimeout(function() {
        loader.finished();
    }, config.duration);
}
```

---

## 🔄 Ciclo de Vida do Template

### 1. Inicialização
```javascript
ebhtml.create2({}, function(loader) { /* ... */ });
```

### 2. Registro de Datasets
```javascript
loader.addData('D_NOTICIAS', false);  // false = não é obrigatório
loader.addData('D_ALERTAS', true);    // true = obrigatório (erro se vazio)
```

### 3. Carregamento
```javascript
loader.load(function() { /* dados carregados */ });
```

### 4. Renderização
```javascript
// Crie HTML, aplique CSS, inicie animações
```

### 5. Notificação de Sucesso
```javascript
loader.loaded();  // ⚠️ APENAS se tudo deu certo
```

### 6. Aguardar Duração
```javascript
setTimeout(function() { /* ... */ }, 5000);
```

### 7. Finalização
```javascript
loader.finished();  // ⚠️ SEMPRE chame (sucesso OU erro)
```

---

## ⚠️ Regras Críticas

### 1. JavaScript ES5 Apenas

**Android 7+ usa WebKit legado - ES6+ NÃO funciona!**

```javascript
// ❌ PROIBIDO (ES6+)
const nome = 'João';
let idade = 30;
const somar = (a, b) => a + b;
const texto = `Olá, ${nome}!`;
const arr = [1, 2, 3];
arr.find(x => x > 2);

// ✅ PERMITIDO (ES5)
var nome = 'João';
var idade = 30;
var somar = function(a, b) { return a + b; };
var texto = 'Olá, ' + nome + '!';
var arr = [1, 2, 3];
for (var i = 0; i < arr.length; i++) {
    if (arr[i] > 2) { /* ... */ }
}
```

### 2. Controle de Playlist

**A playlist trava se não chamar corretamente:**

```javascript
// ✅ CORRETO
loader.load(function() {
    if (loader.data('D_DATASET') === undefined) {
        console.error('Sem dados');
        loader.finished();  // Apenas finished
        return;
    }
    
    renderizar();
    loader.loaded();    // Sucesso!
    loader.finished();  // Sempre
});

// ❌ ERRADO - Playlist trava!
loader.load(function() {
    renderizar();
    loader.loaded();
    // Esqueceu de chamar finished() - PLAYLIST TRAVA
});

// ❌ ERRADO - Notifica sucesso em erro
loader.load(function() {
    if (erro) {
        loader.loaded();   // NÃO faça isso!
        loader.finished();
    }
});
```

**Regra de ouro:**
- `loaded()` → apenas sucesso
- `finished()` → sempre (sucesso OU erro)

---

## 🔧 Workflow de Desenvolvimento

### Desenvolvimento Local (com Mock)

1. Ative mock data no `index.html`
2. Execute `npm run dev` (TailwindCSS watch)
3. Edite `js/master.js`, `css/input.css`, `js/mock-data.js`
4. Recarregue navegador (F5) para ver mudanças
5. Itere até satisfeito

### Teste com EdgeContents (dados reais)

1. Desative mock (`MOCK_DATA.enabled = false`)
2. Inicie servidor EdgeContents (ebcliente4.exe)
3. Configure dataset no loader (`D_NOTICIAS`)
4. Abra `http://localhost:12099/FILES/1/`
5. Verifique console (F12) para erros

### Build para Produção

1. Comente script mock no HTML:
```html
<!-- <script src="js/mock-data.js"></script> -->
```

2. Compile CSS minificado:
```powershell
npm run build
```

3. Compile com ebhtmlbuilder4:
```powershell
ebhtmlbuilder4 index.html output.html
```

4. Deploy no EdgeContents CMS

---

## 📚 Próximos Passos

Agora que você entende os fundamentos:

1. **[docs/02-xml-format.md](02-xml-format.md)** - Estrutura XML EdgeContents (EBDATA)
2. **[docs/03-advanced.md](03-advanced.md)** - Animações, múltiplos datasets, performance
3. **[docs/04-troubleshooting.md](04-troubleshooting.md)** - Problemas comuns e soluções
4. **[docs/05-api-reference.md](05-api-reference.md)** - Referência completa da API EBHTML
- **[GLOSSARY.md](GLOSSARY.md)** - Glossário de termos técnicos

---

## 💡 Dicas Úteis

### Console DevTools (F12)
- Sempre abra o console para ver erros/logs
- `console.log()` é seu melhor amigo
- Erros do EBHTML aparecem aqui

### Hot Reload
- Mudanças no CSS (input.css) requerem F5
- Mudanças no JS (master.js) requerem F5
- TailwindCSS recompila automaticamente

### Debugging
```javascript
// Adicione logs estratégicos
console.log('Dados recebidos:', dados);
console.log('Quantidade de itens:', lista.length);
console.log('Loader state:', loader);
```

### Performance
- Evite animações pesadas (muitos elementos)
- Use `transform` e `opacity` (GPU-accelerated)
- Limite resolução de imagens (1920x1080 max)

---

**Tempo investido:** ~30 minutos  
**Nível alcançado:** Desenvolvedor EdgeContents Iniciante ✅

**Próximo:** [docs/02-xml-format.md](02-xml-format.md) para conectar com dados reais do CMS
