# Plan: Template "hojemais" UOL News Single-Story

Criar template "hojemais" para exibição de notícias UOL em formato 1536x768 (2:1 landscape) usando dataset `D_HOJEMAIS`. Layout single-story com foto grande, título, descrição e cores dinâmicas por categoria. Baseado em [uol_responsivo_tw](uol_responsivo_tw) mas com correções ES5, mock-data funcional, e breakpoints responsivos para uso futuro em múltiplos formatos.

**Principais decisões:**
- Dataset: `D_HOJEMAIS` (novo, específico do template)
- Layout: Single story (1 notícia por vez, 15 segundos de exibição)
- Campos: TITULO, TEXTO, FOTO, CATEGORIA, LOGO_CUSTOM
- Responsivo: 1536x768 primário, suporte futuro via aspect-ratio breakpoints

---

## Steps

**1. Criar estrutura de diretório `hojemais/`**
   - Copiar estrutura base de [_template-base](_template-base): `index.html`, `package.json`, `tailwind.config.js`
   - Criar subpastas: `css/`, `css/fonts/`, `js/`, `img/`

**2. Copiar arquivos essenciais (sem modificação)**
   - [js/ebhtml.js](_template-base/js/ebhtml.js) → `hojemais/js/ebhtml.js` (NUNCA editar)
   - [css/fonts/](uol_responsivo_tw/css/fonts) → `hojemais/css/fonts/` (Poppins-Medium.ttf, ExtraBold.ttf, Regular.ttf)
   - [package.json](_template-base/package.json) → `hojemais/package.json` (apenas scripts TailwindCSS, sem dependencies)

**3. Configurar Tailwind com aspect-ratio breakpoints**
   - Copiar [tailwind.config.js](uol_responsivo_tw/tailwind.config.js) → `hojemais/tailwind.config.js`
   - Manter screens com aspect-ratio: `portrait`, `landscape`, `ultrawide`, `superbanner`, `footer`, `empena`
   - Configurar content paths para `*.html` e `js/*.js`

**4. Criar CSS com fontes Poppins**
   - Copiar estrutura de [uol_responsivo_tw/css/input.css](uol_responsivo_tw/css/input.css)
   - Incluir `@tailwind` directives e `@font-face` para Poppins (3 variantes)
   - Adicionar classe custom `.titulo-principal` com `clamp()` para tipografia responsiva

**5. Criar mock-data.js para desenvolvimento**
   - Estrutura baseada em [_template-base/js/mock-data.js](_template-base/js/mock-data.js)
   - Campos: `TITULO` (string), `TEXTO` (string), `FOTO` (URL/path), `CATEGORIA` (string: "ESPORTE", "POLÍTICA", "ECONOMIA", "TECNOLOGIA", "ENTRETENIMENTO"), `LOGO_CUSTOM` (URL/path opcional)
   - Array com 3-5 notícias exemplo
   - `enabled: true` para dev, `false` para produção
   - Config: `{ duration: 15000 }` (15 segundos)

**6. Adaptar master.js (correções ES5 críticas)**
   - Base: [uol_responsivo_tw/js/master.js](uol_responsivo_tw/js/master.js)
   - **Corrigir violações ES6→ES5:**
     - Trocar `const` por `var` (linhas 33, 74-76, 104)
     - Manter `function() {}` (sem arrow functions)
     - Usar `'concat ' + var` ao invés de template strings
   - **Alterações de dataset:**
     - `loader.addData('D_HOJEMAIS')` (não D_UOL)
     - Campos: `.value('TITULO')`, `.value('TEXTO')`, `.value('FOTO')`, `.value('CATEGORIA')`, `.value('LOGO_CUSTOM')`
   - **Manter padrões:**
     - `window.onload` com detecção de `MOCK_DATA`
     - `image.onload` → `loader.loaded()` + timeout 15s
     - `image.onerror` → apenas `loader.finished()` (SEM loaded)
     - Função `mudaCor(categoria)` para cores dinâmicas
     - Função `fitDescriptionFont(div, container, minSize)` para ajuste tipográfico
     - Runtime aspect ratio detection para ajustes de `object-position`
   - **Corrigir typo:** linha 72 `'no-expande'` → `'no-expand'`

**7. Criar index.html (single story layout 1536x768)**
   - Base: [uol_responsivo_tw/index.html](uol_responsivo_tw/index.html)
   - **Estrutura principal:**
     - `<body>` com classes: `opacity-0 transition-opacity duration-1000`, tipografia viewport-based (`portrait:text-[3.8vh] landscape:text-[3vw] ultrawide:text-[10vh]`)
     - `<main>` com flex adaptativo: `flex flex-col ultrawide:flex-row`
     - `#photoContainer` com `ultrawide:w-2/3`: imagem principal + duplicada para side-by-side
     - `#textContainer` com gradient: `bg-gradient-to-t from-black portrait:from-10% ultrawide:bg-gradient-to-l ultrawide:from-50%`
     - `#titleContainer` e `#descriptionContainer` para texto
     - `<footer>` para crédito de imagem (rotacionado)
   - **Scripts:**
     - `<script src="js/ebhtml.js"></script>`
     - `<script src="js/master.js"></script>`
     - `<!-- <script src="js/mock-data.js"></script> -->` (comentado, habilitar em dev)
   - **Ref:** `<link rel="stylesheet" href="css/master.css">`

**8. Adicionar logo placeholder**
   - Criar `img/logo.png` (placeholder ou logo HojeMais se disponível)
   - Referenciar no HTML se necessário

**9. Criar README.md conciso (máx 50 linhas)**
   - Título + descrição 1 linha
   - Comandos dev: `npm run dev`, abrir `http://localhost:12099/FILES/1/index.html`
   - Mock-data: descomentar linha no HTML, ajustar `enabled: true/false`
   - Build produção: `npm run build`, comentar mock-data
   - Dataset: `D_HOJEMAIS` com campos TITULO, TEXTO, FOTO, CATEGORIA, LOGO_CUSTOM
   - Formato alvo: 1536x768 (2:1), responsivo para outros via breakpoints
   - Duração: 15 segundos por notícia

**10. Inicializar NPM e gerar CSS**
   - Executar `npm install` em `hojemais/` (instala TailwindCSS devDependencies)
   - Executar `npm run dev` para gerar `css/master.css` inicial

---

## Verification

**Desenvolvimento (Mock):**
1. Descomentar `<script src="js/mock-data.js"></script>` no HTML
2. Configurar `MOCK_DATA.enabled = true`
3. Abrir `hojemais/index.html` em navegador (local ou via servidor)
4. Verificar: notícia carrega, título/texto exibem, cor de fundo muda por categoria, transições suaves

**Produção (EdgeContents):**
1. Comentar mock-data no HTML, `npm run build`
2. Criar dataset `D_HOJEMAIS` no EdgeContents CMS com campos: TITULO, TEXTO, FOTO, CATEGORIA, LOGO_CUSTOM
3. Configurar ebcliente4.exe, acessar `http://localhost:12099/FILES/1/hojemais/index.html`
4. Verificar console: `[ebloaded]`, `[ebfinished]` sem erros
5. Testar playlist: aguardar 15s, transição para próximo item

**ES5 Compliance:**
1. Buscar no código: `const`, `let`, `=>`, `` ` ``, `.find`, `.includes`, `async`
2. Resultado esperado: **zero ocorrências**

**Responsividade (Futuro):**
1. Ajustar viewport do navegador para 768x1536 (portrait), 3840x1280 (ultrawide)
2. Verificar breakpoints aplicam classes corretas (`portrait:`, `ultrawide:`)
3. Confirmar gradientes e tipografia adaptam

---

## Decisions

**Dataset `D_HOJEMAIS` vs `D_UOL`:**
- Escolhido `D_HOJEMAIS` para isolar dados específicos do template, facilita manutenção e evita conflitos com outros templates UOL

**Single story vs Carousel:**
- Single story mantém foco na notícia, animações mais impactantes (Ken Burns effect), menor complexidade ES5

**Correções ES5 no código referência:**
- [uol_responsivo_tw/js/master.js](uol_responsivo_tw/js/master.js) tem 4 violações `const` (linhas 33, 74-76, 104) - todas serão corrigidas para `var` no novo template

**15 segundos de exibição:**
- Balança tempo para leitura (título + texto) + animação Ken Burns completa (scale-110 com `duration-[15000ms]`)

**Campo `LOGO_CUSTOM` adicional:**
- Permite branding dinâmico por notícia (além dos campos padrão UOL), opcional no mock/XML
