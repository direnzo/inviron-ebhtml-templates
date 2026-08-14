# EdgeContents Digital Signage — Instruções do Copilot

Sistema de templates HTML para Digital Signage via EdgeContents CMS. Android 7+ (WebKit legado).

## 🚫 REGRAS ABSOLUTAS

- **NUNCA** `git commit` sem permissão explícita
- **NUNCA** `npm run build` — use `npm run dev` (watch mode, compila automático)
- **ES5 OBRIGATÓRIO** — zero tolerância para ES6+ (WebKit legado)

### 🔴 TESTE — URL OBRIGATÓRIA (NUNCA USAR file:///)

A URL de teste **SEMPRE** é:
```
http://localhost:12099/FILES/1/index.html
```
- **NUNCA** abrir com `file:///c:/...` — o servidor EdgeContents (ebcliente4) resolve assets, fontes e dados
- **NUNCA** usar Live Server, http-server, ou qualquer outro servidor local — só o `ebcliente4.exe`
- `MOCK_DATA.enabled = true` funciona em ambas, mas `file://` não carrega `ebhtml.js` corretamente
- Se o servidor não estiver rodando, iniciar: `ebcliente4.exe`

## ⚡ ES5 — Proibido vs Permitido

| ❌ Proibido (ES6+) | ✅ Use (ES5) |
|---|---|
| `const` / `let` | `var` |
| Arrow `() => {}` | `function() {}` |
| `` `template ${var}` `` | `'concat ' + var` |
| `async/await`, `Promise` | Callbacks |
| `class` | Function constructors |
| `...spread`, destructuring | Acesso direto |
| `.find()` / `.includes()` / `.map()` | `for (var i=0; i<len; i++)` |
| `for...of` | `for (var i=0; i<len; i++)` |
| `fetch()` | `XMLHttpRequest` |

---
## ⛔ REGRAS DE OURO

### ⛔ DOCUMENTAÇÃO MÍNIMA
- **NÃO criar múltiplos arquivos** de documentação (STATUS.md, CONFIG.md, RESUMO.md, etc)
- **UM ÚNICO README.md** por template - máximo 50 linhas, direto ao ponto
- **MENOS É MAIS** - use mínimo de linhas possível
- **SEM FIRULAS** - sem emojis excessivos, sem formatação desnecessária, sem seções longas
- Consolide TUDO em README.md único e conciso

### 📚 Docs de referência

- `/docs/README.md` — índice geral
- `/docs/02-xml-format.md` — estrutura XML/EBDATA
- `/docs/05-api-reference.md` — API EBHTML
- `/docs/04-troubleshooting.md` — debug
- `.github/skills/ebhtml-api/SKILL.md` — skill completo da API EBHTML
- `.github/skills/frontend-tailwind-golden-ratio/SKILL.md` — skill de layout/fontes

---

## ⚠️ REGRAS CRÍTICAS (NUNCA VIOLAR)

### 0. `ebhtml.js` — SEMPRE a versão 2.0.3, NUNCA reaproveitar de pasta antiga

Incidente real (poder360_responsivo, 2026-08-14): layout novo foi criado em cima de uma pasta já existente que tinha um `ebhtml.js` antigo (9620 bytes, sem marcação de versão) em vez do canônico (24750 bytes, `// EBHTML version 2.0.3` no topo). Isso causou timeout/travamento em produção.

**Antes de codar QUALQUER template, novo ou em cima de pasta existente:**
1. Abrir `js/ebhtml.js` do template e conferir a 2ª linha: precisa ser `// EBHTML version 2.0.3`. Se não tiver essa linha, ou o arquivo tiver menos de ~20KB, é versão antiga/errada.
2. Se estiver errado, copiar o arquivo correto de `_template-base/js/ebhtml.js` (fonte canônica) — NUNCA editar/atualizar manualmente o `ebhtml.js`, ele é sempre substituído por cópia integral.
3. Nunca criar um template novo reaproveitando a pasta de um template antigo sem antes checar essa versão — é a causa raiz mais provável desse tipo de erro.

```bash
head -3 js/ebhtml.js   # deve mostrar "// EBHTML version 2.0.3" na linha 2
```

### 1. Controle de Playlist EBHTML — `finished()` SEMPRE, sem exceção

`loader.finished()` nunca chamado = item trava a playlist = device fica preso até o watchdog reiniciar o hardware. Isso já aconteceu em produção (poder360_responsivo, 2026-08-14). Duas causas raiz recorrentes:

**a) `loader.load()` sem callback de erro.** Se a XML falhar (timeout de rede, status != 200), o `ebhtml.js` chama `error()` internamente mas **nunca** `finished()`. Sem um 2º callback em `loader.load()`, o item trava para sempre.
```javascript
function liberar() { loader.loaded(); loader.finished(); }
loader.load(function () { /* sucesso: renderizar + loaded() + finished() */ }, liberar); // ❌ NUNCA omitir o 2º argumento
```

**b) `image.onload`/`onerror` atribuídos DEPOIS de `image.src`.** Se a imagem já está em cache (comum em playlists repetidas), alguns WebKit legados (Android 7+) disparam o evento antes do handler existir — `loaded()`/`finished()` nunca são chamados.
```javascript
image.onload = function () { /* ... */ };   // ✅ handlers ANTES do src
image.onerror = function () { /* ... */ };
image.src = dados.foto;                     // src por último
```

**c) Watchdog obrigatório.** Todo template com imagem/mídia assíncrona deve ter um `setTimeout` de segurança que força `loaded()+finished()` caso nenhum evento dispare — rede instável ou edge cases sempre existem.
```javascript
var settled = false;
function concluir() { if (settled) return; settled = true; loader.loaded(); setTimeout(loader.finished, timeFinished); }
var watchdog = setTimeout(concluir, timeFinished); // fallback se onload/onerror nunca disparar
image.onload = function () { clearTimeout(watchdog); concluir(); };
image.onerror = function () { clearTimeout(watchdog); concluir(); };
```

Checklist ao revisar qualquer template: `loader.load(sucesso, erro)` sempre com 2º argumento • handlers de imagem antes do `src` • watchdog de timeout presente. Ver `.github/skills/ebhtml-api/SKILL.md` seção 6 para o padrão completo.

### 2. CSS Compatível (Chromium 78)
| ❌ Proibido | Requer | ✅ Alternativa |
|---|---|---|
| `clamp()` | Chrome 79+ | `vmin`/`vw`/`vh` simples |
| `gap-*` em flex | Chrome 84+ | `space-x-*`/`space-y-*` (margin) |
| `aspect-*` isolado | Chrome 88+ | Fallback `@supports not` c/ padding |
| `rgb(r g b / alpha)` | Chrome 65+ | Fallbacks hex em `input.css` |

### 3. Sistema de Fontes (vmin)
- **Body**: `font-size` em `vmin` (ex: `text-[3.2vmin]`)
- **Filhos**: SOMENTE `em` ou `%` — NUNCA `vw`/`vh`/`vmin` em filhos
- **NUNCA** `portrait:text-[X]` em filhos — ajuste o body

```html
<body class="text-[3.2vmin] superbanner:text-[5vmin] empena:text-[11vmin]">
  <span class="text-[1.3em]">Título</span>
```

### 4. Breakpoints Aspect Ratio
```javascript
screens: { // tailwind.config.js
    'portrait': { 'raw': '(max-aspect-ratio: 3/4)' },
    'empena': { 'raw': '(max-aspect-ratio: 1/3)' },
    'superbanner': { 'raw': '(min-aspect-ratio: 5/1) and (max-aspect-ratio: 15/1)' },
    'ultrawide': { 'raw': '(min-aspect-ratio: 3/1)' },
}
```

---

## ⚠️ PERFORMANCE EM ANDROID (lições aprendidas — previsao_climatempo, 2026-08-14)

### 5. Detectar hardware fraco obrigatoriamente em templates com assets dinâmicos

Android de entrada (Rockchip, Allwinner, etc.) trava com animações CSS, SVGs animados e múltiplos XHRs simultâneos. Detectar no início do script, antes do `window.onload`:

```javascript
var HARDWARE_FRACO = false;
(function() {
  if (window.location.search.indexOf('hwfraco=1') !== -1) { HARDWARE_FRACO = true; return; } // teste via URL
  if (navigator.userAgent.indexOf('Android') !== -1) { HARDWARE_FRACO = true; return; }
  if (navigator.deviceMemory && navigator.deviceMemory <= 1) { HARDWARE_FRACO = true; return; }
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) { HARDWARE_FRACO = true; }
})();
```

No `window.onload`, aplicar classe e desativar animações SVG:
```javascript
if (HARDWARE_FRACO) {
  document.body.classList.add('hardware-fraco');
  var s = document.createElement('style');
  s.innerHTML = '.hardware-fraco .icon svg *, .hardware-fraco .icon svg { animation: none !important; transition: none !important; }';
  document.head.appendChild(s);
}
```

Para testar no DevTools: `?hwfraco=1` na URL + CPU throttle Low-tier mobile 10.5x.

### 6. Nunca revelar conteúdo antes de assets assíncronos estarem prontos

**`opacity-0` no body inteiro é proibido** — esconde o fundo/gradiente e causa flash de `background-color`.  
Em vez disso: body sempre visível, `opacity: 0` apenas no **container dos dados dinâmicos**.

```javascript
// NUNCA: <body class="opacity-0">
// CERTO: esconder só o container de dados
container.style.opacity = '0';          // antes de montar
// ... assets carregam no escuro (opacity:0 mantém layout para getBBox) ...
container.style.transition = 'opacity 0.4s';
container.style.opacity = '1';          // revela tudo de uma vez
loader.loaded();                         // loader.loaded() SÓ após revelação
```

### 7. SVG sempre inline via XHR — NUNCA `<img src="arquivo.svg">`

Incidente real (poder360_responsivo, 2026-08-14): logo trocado de PNG para SVG usando `<img id="logo" src="img/logo.svg">` — não renderizou em produção. O WebView do EdgeContents (WebKit legado, Android 7+) não é confiável para carregar SVG via `<img src>`; o único jeito garantido é buscar o arquivo via XHR e injetar o markup inline no DOM (`el.innerHTML = xhr.responseText`).

Vale para **qualquer** SVG — logo estático, ícone único, ícone dinâmico por item. Não existe exceção "é só um logo simples".

```javascript
// ❌ NUNCA
<img id="logo" src="img/logo.svg" alt="Logo" />

// ✅ SEMPRE — container vazio + injeção via XHR
// HTML: <div id="logo" role="img" aria-label="Logo"></div>
function injetarSvg(el, url) {
    if (!el) { return; }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) { return; }
        if (xhr.status === 200 || xhr.status === 0) {
            el.innerHTML = xhr.responseText;
        }
    };
    xhr.send();
}
injetarSvg(document.querySelector('#logo'), 'img/logo.svg');
```

Para SVGs carregados repetidamente por item/card (não estáticos como um logo), ver a regra de cache abaixo.

### 8. Cache obrigatório para XHR de assets carregados por item/card

Sem cache, N cards × M assets = N×M requisições. Com cache: M requisições únicas.

```javascript
var SVG_CACHE = {};
function carregarSvgCached(url, callback) {
  if (SVG_CACHE[url]) { callback(null, SVG_CACHE[url]); return; }
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return;
    if (xhr.status === 200 || xhr.status === 0) { SVG_CACHE[url] = xhr.responseText; callback(null, xhr.responseText); }
    else { callback('Erro ' + url, null); }
  };
  xhr.send();
}
```

### 9. Animações de entrada condicionais ao hardware

```javascript
if (HARDWARE_FRACO) {
  card.style.transition = 'none';
  card.classList.remove('transition-all', 'duration-1000', 'ease-out', '-translate-x-[120%]', 'opacity-0');
} else {
  card.style.transitionDelay = delay + 'ms'; // slide-in normal com delays escalonados
  card.classList.remove('-translate-x-[120%]', 'opacity-0');
  // NUNCA remover transition-all/duration/ease-out no path normal — mata a animação
}
card.classList.add('translate-x-0', 'opacity-100');
```

---

## 📋 Checklist

- [ ] `js/ebhtml.js` é a versão 2.0.3 (checar linha 2: `// EBHTML version 2.0.3`; se faltar ou arquivo <20KB, copiar de `_template-base/js/ebhtml.js`)
- [ ] ES5 — sem `let/const/arrow/template strings`
- [ ] `loader.loaded()` após sucesso, `loader.finished()` sempre
- [ ] `loader.load()` com 2º argumento (callback de erro) que também chama `finished()`
- [ ] `image.onload`/`onerror` atribuídos ANTES de `image.src`
- [ ] Watchdog (`setTimeout`) garantindo `finished()` mesmo sem eventos de imagem/mídia
- [ ] `MOCK_DATA.enabled = false` em produção
- [ ] Sem `clamp()` / sem `gap-*` em flex / fallbacks hex
- [ ] `font-size` body em `vmin`, filhos em `em`/`%`
- [ ] Nenhum `<img src="*.svg">` — todo SVG (logo, ícone) injetado inline via XHR
- [ ] Templates com assets XHR por item: cache `SVG_CACHE` ou equivalente implementado
- [ ] Body sem `opacity-0` — esconder só o container de dados dinâmicos
- [ ] Detecção de `HARDWARE_FRACO` presente se template tiver animações ou SVGs dinâmicos
- [ ] Animações de entrada condicionais a `!HARDWARE_FRACO`
- [ ] `loader.loaded()` chamado após revelação do conteúdo (não antes)

---

**Arquivos-chave:** `_template-base/`, `js/ebhtml.js`, `/docs/`, `.github/skills/`, `uol_responsivo_tw/` (referência)
