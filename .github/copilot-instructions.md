# EdgeContents Digital Signage - AI Agent Instructions

Sistema de templates HTML para Digital Signage usando EdgeContents CMS. Compatível com Android 7+ (WebKit legado).
---

## ⚡ REGRA PRIORITÁRIA #1: JAVASCRIPT CLÁSSICO (ES5) OBRIGATÓRIO

**NUNCA use ES6+. SEMPRE use JavaScript clássico.**

Hardware antigo roda WebKit legado. **Zero tolerância para ES6+.**

❌ **PROIBIDO:**
- `const`, `let` → Use `var`
- Arrow functions `() => {}` → Use `function() {}`
- Template strings `` `${var}` `` → Use `'concat ' + var`
- `async/await`, `Promise` → Use callbacks
- `class` → Use function constructors
- Spread operator `...`
- Methods: `.find()`, `.includes()`, `.map()` → Use `for` loops
- `for...of` → Use `for (var i = 0; i < length; i++)`
- `fetch()` → Use `XMLHttpRequest`

✅ **OBRIGATÓRIO:**
```javascript
var x = 5;
function() { }
'text ' + variable
XMLHttpRequest
for (var i = 0; i < arr.length; i++) { }
```

---
## � REGRAS DE OURO

### ⛔ DOCUMENTAÇÃO MÍNIMA
- **NÃO criar múltiplos arquivos** de documentação (STATUS.md, CONFIG.md, RESUMO.md, etc)
- **UM ÚNICO README.md** por template - máximo 50 linhas, direto ao ponto
- **MENOS É MAIS** - use mínimo de linhas possível
- **SEM FIRULAS** - sem emojis excessivos, sem formatação desnecessária, sem seções longas
- Consolide TUDO em README.md único e conciso

### 📚 Documentação Existente
**Usuário pediu ajuda? Consulte:**
- [/docs/README.md](../docs/README.md) - Índice completo
- [/docs/02-xml-format.md](../docs/02-xml-format.md) - Estrutura XML/EBDATA
- [/docs/04-troubleshooting.md](../docs/04-troubleshooting.md) - Debug
- [/docs/05-api-reference.md](../docs/05-api-reference.md) - API EBHTML
- [/examples/](../examples/) - XMLs exemplo

---

## 🎯 Arquitetura

**Componentes principais:**
- **EBHTML (ebhtml.js)**: Biblioteca que controla playlist e comunicação com EdgeContents CMS
- **Templates HTML**: Exibem conteúdo em displays digitais (TVs, totens, monitores)
- **EdgeContents Server**: CMS backend que fornece dados via XML
- **TailwindCSS**: Framework CSS global (pré-instalado)

**Fluxo de dados:**
```
EdgeContents CMS → XML (/content/data/{DATASET}) → EBHTML parse → Template renderiza
```

**Ambientes:**
- **Dev**: `http://localhost:12099/FILES/1/index.html` (URL orquestrada pelo ebhtmlbuilder; servidor: ebcliente4.exe)
- **Build**: ebhtmlbuilder4 (compilador)
- **Mock**: js/mock-data.js (dados locais para testes)

**Regra de URL no navegador:** sempre validar em `http://localhost:12099/FILES/1/index.html`. Nao usar URL com subpasta de template (`.../FILES/1/{template}/index.html`) quando o caminho ja estiver configurado no ebhtmlbuilder.

---

## TERMINAL E EFICIENCIA (PROJETO)

### Protocolo Obrigatorio de Execucao
- Objetivo: reduzir tentativa e erro e poupar tokens.
- Sempre validar disponibilidade com 1 comando curto antes de rodar comandos longos.
- Limite maximo: 2 tentativas por shell. Se falhar, trocar shell imediatamente.
- Nao repetir o mesmo comando mais de 2 vezes sem mudar estrategia.

### Ordem de Fallback de Shell (Windows)
1. PowerShell (padrao)
2. cmd
3. Git Bash (`C:/Program Files/Git/bin/bash.exe`)

### Handshake Minimo (antes de qualquer comando de trabalho)
Executar nesta ordem e so continuar se houver output:
```bash
echo __COPILOT_OK__
pwd
```

Se nao houver output no handshake:
- Trocar para o proximo shell da lista.
- Se os 3 shells falharem, parar tentativas e reportar bloqueio de terminal ao usuario.

### Regras de Git (para evitar loops)
- Antes de `git status`, verificar existencia de `.git/HEAD`.
- Se `.git/HEAD` nao existir, assumir repositorio nao inicializado e orientar `git init`.
- Evitar sequencias longas de comandos Git quando o terminal nao estiver validado.

### Politica de Branch por Template
- A cada novo desenvolvimento de template, criar branch dedicada antes de editar arquivos.
- Padrao de nome: `feat/template-{nome}` para novo template e `fix/template-{nome}-{tema}` para correcoes.
- Nunca desenvolver direto na branch principal.
- So fazer merge apos validacao funcional (preview local + build) e revisao basica.

### Regras de Economia de Tokens
- Priorizar ferramentas de leitura (`read_file`, `file_search`, `fetch_webpage`) antes de terminal.
- Agrupar leituras em paralelo quando possivel.
- Em caso de falha repetida de terminal, nao insistir: retornar diagnostico curto + proximo passo unico.

---

## ⚠️ REGRAS CRÍTICAS (NUNCA VIOLAR)

### 1. JavaScript ES5 OBRIGATÓRIO (Android 7+)
Hardware antigo roda WebKit legado. **Zero tolerância para ES6+.**

❌ **PROIBIDO:**
```javascript
const/let, () => {}, `${template}`, async/await, class, ...spread, 
Array.find/includes/map, for...of, Promise, fetch()
```

✅ **USE:**
```javascript
var, function() {}, 'concat ' + var, callbacks, 
for (var i = 0; i < arr.length; i++), XMLHttpRequest
```

### 2. Controle de Playlist EBHTML
**Playlist trava se não chamar corretamente:**

```javascript
// ✅ SUCESSO
loader.loaded();     // Avisa que carregou
loader.finished();   // Avisa que terminou

// ❌ ERRO - NUNCA chame loaded() em erro
if (erro) {
    loader.finished(); // Apenas finished
}
```

**Regra de ouro:**
- `loaded()` = apenas após sucesso
- `finished()` = sempre (sucesso OU erro)

### 3. TailwindCSS (Global - Não Instalar)
```bash
npm run dev    # Watch mode (desenvolvimento)
npm run build  # Minified (produção)
```

Editar `css/input.css` → gera `css/master.css`

---

### 4. CSS Compatível com Android 7 (Chrome 51–64)

Dois problemas reais com Tailwind v3 + browsers antigos:

#### ❌ `clamp()` requer Chrome 79+ — NUNCA usar
```html
❌ text-[clamp(14px,3.8vmin,4vh)]  → font-size ignorado no Android 7
✅ text-[3.8vmin]                   → vmin funciona desde Chrome 26
```

#### ❌ Tailwind gera `rgb(r g b / alpha)` — não funciona em Chrome < 65
Todo utilitário de cor do Tailwind v3 (`text-white`, `bg-black`, `text-[#hex]`, etc.) compila para:
```css
color: rgb(255 255 255 / var(--tw-text-opacity)); /* Chrome 65+ apenas */
```
**Solução:** adicionar fallbacks hex no `input.css` de cada template, **fora de `@layer`** (para ter prioridade sobre os utilitários do Tailwind):
```css
/* Após @tailwind utilities — fora de @layer — Android 7 / Chrome < 65 */
.text-white          { color: #ffffff }
.text-black          { color: #000000 }
.bg-white            { background-color: #ffffff }
.bg-black            { background-color: #000000 }
/* Para cores arbitrárias: */
.text-\[\#abc123\]   { color: #abc123 }
.bg-\[\#abc123\]     { background-color: #abc123 }
```

#### ✅ Prefixos `-webkit-` NÃO são necessários para Android 7
Chrome 51+ suporta nativamente (sem prefixo): flexbox, transitions, animations, object-fit, CSS vars, vmin/vw/vh.

---

## 📁 Estrutura de Template

```
template/
├── index.html
├── package.json (apenas scripts, SEM dependencies)
├── tailwind.config.js
├── css/
│   ├── input.css → fonte (@tailwind directives)
│   ├── master.css → compilado (referenciado no HTML)
│   └── fonts/
├── img/
└── js/
    ├── ebhtml.js → NUNCA editar (copiar de _template-base)
    ├── master.js → lógica do template
    └── mock-data.js → dados de teste
```

---

## 💻 Padrão de Código (master.js)

**Template mínimo:**
```javascript
window.onload = function() {
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        // Mock loader
        var mockLoader = {
            loaded: function() { console.log('[Mock] Carregado'); },
            finished: function() { console.log('[Mock] Finalizado'); }
        };
        iniciarTemplate(MOCK_DATA.dados, MOCK_DATA.config, mockLoader);
    } else {
        // EdgeContents
        ebhtml.create2({}, function(loader) {
            loader.addData('D_DATASET', false);
            loader.autoloaded = false;
            loader.nodataiserror = false;
            
            loader.load(function() {
                if (loader.data('D_DATASET') == undefined) {
                    console.error('ERRO: Sem dados');
                    loader.finished(); // ❌ NÃO chame loaded()
                    return;
                }
                
                var dados = processarDados(loader);
                iniciarTemplate(dados, config, loader);
            });
        });
    }
};

function iniciarTemplate(dados, config, loader) {
    // Renderiza
    loader.loaded();  // ✅ Sucesso
    setTimeout(function() {
        loader.finished();  // ✅ Terminou
    }, config.duration);
}
```

### Carregamento de Imagens com Controle
Aguardar imagem carregar antes de chamar `loaded()`:

```javascript
var image = document.querySelector('#image');
var image2 = document.querySelector('#image2'); // fallback

var imageUrl = loader.data('D_DATASET').value('FOTO').value;
image.src = imageUrl;
image2.src = imageUrl; // cópia para layouts side-by-side

image.onload = function() {
    loader.loaded();  // ✅ Imagem carregou com sucesso
    
    // Aplicar animações
    body.classList.remove('opacity-0');
    body.classList.add('opacity-100');
    
    setTimeout(function() {
        loader.finished();
    }, 15000);
};

image.onerror = function() {
    console.error('Erro ao carregar imagem');
    loader.finished();  // ❌ Apenas finished, sem loaded()
};
```

### Detecção de Aspect Ratio em Runtime
Para ajustar layout dinamicamente:

```javascript
var aspectRatio = window.innerWidth / window.innerHeight;

var isEmpena = aspectRatio <= (1 / 2);      // < 1:2 (muito estreito)
var isPortrait = aspectRatio <= (3 / 4);    // < 3:4 (vertical)
var isLandscape = aspectRatio > (4 / 3);    // > 4:3 (horizontal)
var isUltrawide = aspectRatio >= 3;         // 3:1+ (muito largo)

if (isEmpena || isPortrait) {
    image.classList.remove('empena:object-left', 'portrait:object-left', 'scale-110');
    image.classList.add('object-right');
} else {
    image.classList.add('scale-110');
}
```

**Acessando dados EdgeContents:**
```javascript
// Primeiro registro
var item = loader.data('D_DATASET');
var valor = item.value('campo').value;

// Lista completa
var lista = loader.datalist('D_DATASET');
for (var i = 0; i < lista.count(); i++) {
    var registro = lista.get(i);
}
```

**HTML dinâmico (Tailwind):**
```javascript
var div = document.createElement('div');
div.className = 'flex items-center w-full p-6 bg-blue-600 text-white';
div.innerHTML = '<h1>' + titulo + '</h1>';
```

---

## 🔧 Workflows Críticos

### Desenvolvimento Local
```bash
# 1. Inicie servidor EdgeContents
ebcliente4.exe  # localhost:12099

# 2. Watch TailwindCSS
npm run dev

# 3. Teste no navegador
# http://localhost:12099/FILES/1/index.html
```

### Mock Data (Testes Sem Backend)
**Habilitar:** Descomente `<script src="js/mock-data.js"></script>` no HTML

**js/mock-data.js:**
```javascript
var MOCK_DATA = {
    enabled: true,
    config: { duration: 5000 },
    dados: [
        { 
            TITULO: "Item 1",
            TEXTO: "Descrição do item",
            FOTO1: "img/foto.jpg",
            COR: "#FF0000"
        }
    ]
};
```

**IMPORTANTE:** Campos em MAIÚSCULAS (TITULO, TEXTO, FOTO1-5, COR, DATA) seguem padrão XML do EdgeContents. Ver `/docs/02-xml-format.md` para lista completa.

### Build Produção
```bash
npm run build          # CSS minificado
# Comentar mock-data no HTML
# ebhtmlbuilder4 (compilar)
```

---

## 🎨 Convenções Específicas

### Classes Tailwind Frequentes
```
flex items-center justify-center w-full h-full
bg-blue-600 text-white opacity-0 transition-opacity duration-1000
rounded-xl shadow-lg p-6
```

### Animações Tailwind
```javascript
// Fade in
el.classList.remove('opacity-0');
el.classList.add('opacity-100');

// Animação longa (baseada em uol_responsivo_tw)
var img = document.querySelector('#image');
img.classList.add('transition-all ease-linear duration-[15000ms]');

// Aplicar classes dinâmicas
el.classList.add('scale-110', 'opacity-50');
el.classList.remove('opacity-0');
```

### Breakpoints Aspect Ratio (Digital Signage)
Para layouts responsivos de TVs/displays, usar aspect-ratio no tailwind.config.js:

```javascript
screens: {
    'portrait': { 'raw': '(max-aspect-ratio: 3/4)' },     // 9:16, 1:2
    'square': { 'raw': '(aspect-ratio: 1/1)' },          // 1:1
    'landscape': { 'raw': '(min-aspect-ratio: 4/3) and (max-aspect-ratio: 2/1)' }, // 16:9
    'ultrawide': { 'raw': '(min-aspect-ratio: 3/1)' },   // 3:1+
    'superbanner': { 'raw': '(min-aspect-ratio: 5/1) and (max-aspect-ratio: 15/1)' }, // 4:1-15:1
    'footer': { 'raw': '(min-aspect-ratio: 15/1)' },     // >15:1 (muito largo)
    'empena': { 'raw': '(max-aspect-ratio: 1/3)' }       // <1:3 (muito estreito)
}
```

**Uso no HTML:**
```html
<!-- ✅ CORRETO: font-size base centralizado no body via vmin (ver regra abaixo) -->
<body class="text-[3.2vmin] superbanner:text-[5vmin] empena:text-[11vmin]">
    <div class="ultrawide:w-2/3 portrait:h-2/3 empena:hidden">
```

### ⚡ Sistema de Fontes Centralizado (vmin) — REGRA PRIMORDIAL

`vmin` = `min(vw, vh)` → na prática: `vw` em portrait (largura é menor), `vh` em landscape (altura é menor).
Isso significa que **um único valor vmin no body escala proporcionalmente em TODOS os formatos** sem breakpoints nos filhos.

**Regra:**
- `<body>`: define o tamanho base em `vmin`. Apenas formatos extremos (superbanner, empena) precisam de override.
- **Filhos**: SOMENTE `em` ou `%`. Nunca `vw`, `vh`, `vmin` em elementos filhos.
- **NUNCA** colocar `portrait:text-[Xem]`, `landscape:text-[Xem]` em elementos filhos — ajuste o body.

```html
<!-- ✅ CORRETO -->
<body class="text-[3.2vmin] superbanner:text-[5vmin] empena:text-[11vmin]">
  <span class="text-[1.3em]">Título</span>    <!-- não precisa portrait: override -->
  <div  class="text-[5.2em]">20:00</div>      <!-- não precisa portrait: override -->

<!-- ❌ ERRADO: spreads de vmin/vw/vh nos filhos -->
<body class="portrait:text-[2.8vh] landscape:text-[1.8vw] ultrawide:text-[1.2vw]">
  <span class="text-[1.3em] portrait:text-[1.1em]">...
  <div  class="text-[5.2em] portrait:text-[3.5em]">...
```

**Referência de valores por breakpoint:**
| Breakpoint | Resolução | vmin | Valor sugerido | px resultante |
|---|---|---|---|---|
| portrait + landscape + ultrawide | — | = altura ou largura menor | `3.2vmin` | escala natural |
| superbanner (5:1–15:1) | ex. 3840×576 | 576 | `5vmin` | ≈ 28px |
| empena (<1:3) | ex. 360×1920 | 360 | `11vmin` | ≈ 39px |

---

### Detecção de Device (WebKit/Android)
```javascript
function isWebkit() {
    return 'WebkitAppearance' in document.documentElement.style;
}

function isAndroid() {
    return /Android/i.test(navigator.userAgent);
}

if (isWebkit() || isAndroid()) {
    document.body.classList.add('no-expand');
}
```

### CSS Customizado (input.css)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@font-face {
    font-family: 'Poppins Medium';
    src: url('fonts/Poppins-Medium.ttf');
}

.titulo-principal {
    font-size: 3.8vmin; /* ✅ Use vmin/vw/vh simples — clamp() requer Chrome 79+ */
}

/* Fallbacks hex (após @tailwind utilities, fora de @layer) */
.text-white { color: #ffffff }
.bg-black   { background-color: #000000 }
/* ... adicionar para cada cor usada no template */
```

### Ajuste Dinâmico de Fontes (Responsive Typography)
Útil para títulos/descrições que precisam caber em espaço limitado (padrão UOL):

```javascript
// maxHeight: limite máximo permitido, minFontSize: tamanho mínimo
function fitDescriptionFont(descriptionDiv, containerDiv, minFontSize) {
    minFontSize = minFontSize || 12;
    var fontSize = parseInt(window.getComputedStyle(descriptionDiv).fontSize);
    var containerMaxHeight = parseInt(window.getComputedStyle(containerDiv).maxHeight) 
        || containerDiv.offsetHeight;
    
    while ((containerDiv.scrollHeight > containerMaxHeight || 
            descriptionDiv.scrollHeight > containerMaxHeight) && 
           fontSize > minFontSize) {
        fontSize -= 1;
        descriptionDiv.style.fontSize = fontSize + 'px';
    }
}

// Uso:
var title = document.querySelector('#title');
var titleContainer = document.querySelector('#titleContainer');
fitDescriptionFont(title, titleContainer, 6); // min 6px
```

### Sistema de Cores por Categoria
Para layouts de notícias, variar cores de background conforme categoria:

```javascript
function mudaCor(categoria) {
    var corMap = {
        'ESPORTE': 'rgba(50, 168, 82, 0.7)',
        'FUTEBOL': 'rgba(50, 168, 82, 0.7)',
        'POLÍTICA': 'rgba(171, 2, 2, 0.7)',
        'ECONOMIA': 'rgba(13, 25, 186, 0.7)',
        'TECNOLOGIA': 'rgba(172, 186, 13, 0.7)',
        'ENTRETENIMENTO': 'rgba(186, 74, 13, 0.7)',
        'MÚSICA': 'rgba(245, 239, 0, 0.7)',
    };
    
    var cor = corMap[categoria] || 'rgba(252, 201, 8, 0.7)'; // default
    var fundoTitulo = document.querySelector('#titleContainer');
    fundoTitulo.style.backgroundColor = cor;
}

// Chamar no load:
mudaCor(loader.data('D_DATASET').value('CATEGORIA').value);
```

### Gradient Backgrounds (Black Fade)
Padrão para melhorar legibilidade de texto sobre imagens:

```html
<!-- Gradient vertical (portrait/normal) -->
<div class="bg-gradient-to-t from-black from-10% to-transparent">

<!-- Gradient horizontal (ultrawide) -->
<div class="bg-gradient-to-l from-50%">

<!-- Gradient diagonal (superbanner - muito largo) -->
<div class="bg-[linear-gradient(90deg,_transparent_0%,_black_30%,_black_70%,_transparent_100%)]">
```

---

## 🚨 Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| Playlist trava | Faltou `loaded()`/`finished()` | Adicionar ambos |
| `[ebloaded]` com erro | Chamou `loaded()` em erro | Remove `loaded()` |
| CSS não carrega | TailwindCSS não compilou | `npm run dev` |
| Arrow function error | ES6 em Android 7 | Use `function() {}` |
| `clamp()` não funciona | Requer Chrome 79+ | Use `vmin/vw/vh` simples |
| Cores invisíveis | Tailwind gera `rgb(r g b / alpha)` (Chrome 65+) | Fallbacks hex em `input.css` |
| Texto diferente em portrait/landscape | `portrait:text-[X]` espalhados nos filhos | `vmin` no body, `em` nos filhos |
---

## 📋 Checklist Código

- [ ] Sem `let/const/arrow functions/template strings`
- [ ] `loader.loaded()` após sucesso
- [ ] `loader.finished()` sempre
- [ ] `MOCK_DATA.enabled = false` em produção
- [ ] `npm run build` executado
- [ ] Classes Tailwind válidas
- [ ] Sem `clamp()` em CSS (não suportado Chrome < 79)
- [ ] Fallbacks hex em `input.css` para todas as cores usadas (`text-white`, `bg-black`, `text-[#hex]`, etc.)
- [ ] `font-size` no body via `vmin` — filhos usam apenas `em` ou `%`, sem `portrait:text-[X]` nos filhos

---

**Arquivos-chave:**
- `_template-base/` - Template inicial para copiar
- `js/ebhtml.js` - Biblioteca EBHTML (v2.0.3)
- `/docs/` - Documentação técnica completa
- `/docs/02-xml-format.md` - Estrutura de dados XML/EBDATA
- `/docs/05-api-reference.md` - API Reference EBHTML
- `.github/copilot-instructions.md` - Este arquivo
- `uol_responsivo_tw/` - Projeto referência com animações avançadas e breakpoints por aspect-ratio

---

## 📚 Projeto de Referência: UOL Responsivo

**Localização:** `uol_responsivo_tw/`

Este projeto é um template automatizado para exibição de notícias com técnicas avançadas de:
- **Breakpoints por Aspect Ratio**: Layouts responsivos para múltiplos formatos de tela (portrait, landscape, ultrawide, superbanner, footer, empena)
- **Animações com Tailwind**: Transições suaves com durações customizadas
- **Ajuste Dinâmico de Fontes**: Função `fitDescriptionFont()` para caber conteúdo em espaço limitado
- **Sistema de Cores**: Mapeamento automático de cores por categoria
- **Gradientes**: Técnicas para legibilidade sobre imagens

**Use como referência para:**
1. Implementar layouts responsivos
2. Entender padrões de animação
3. Criar templates com múltiplos formatos de tela
4. Aplicar cores dinâmicas baseadas em dados

**Tabela de Aspect Ratio (uol_responsivo_tw):**
| Formato | Aspect Ratio | Uso |
|---------|-------------|-----|
| **Portrait** | ≤ 3:4 | 9:16, 1:2 (vertical, empena vertical) |
| **Square** | 1:1 | Telas quadradas |
| **Landscape** | 4:3 a 2:1 | 16:9, 2:1 (horizontal padrão) |
| **Ultrawide** | ≥ 3:1 | 3:1 ou mais largo (monitores muito largos) |
| **Superbanner** | 5:1 a 15:1 | 4:1 a 15:1 (comercial/superbanner) |
| **Footer** | ≥ 15:1 | Muito largo (tickers, rodapés) |
| **Empena** | ≤ 1:3 | Muito estreito (displays de parede) |
