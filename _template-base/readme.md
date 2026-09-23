# Template Base - EdgeContents Digital Signage

Base executavel para novos templates EdgeContents. Derive-a somente em branch tematica e adapte dataset, campos e layout ao briefing do tenant.

## 📋 Características

- **JavaScript ES5 obrigatório** - Compatível com Android 7+ (WebKit legado)
- **TailwindCSS v3** - Framework CSS pré-configurado com fallbacks para Chrome < 65
- **Breakpoints por Aspect Ratio** - Layout inteligente para portrait (≤3:4), landscape (4:3 a 2:1), ultrawide (≥3:1), superbanner (5:1 a 15:1), empena (≤1:3)
- **Mock compatível** - Desenvolvimento via EBHTML shim, desativado antes do empacotamento
- **`js/config.js`** - Variáveis globais (timing, dataset, área segura, cores) centralizadas, aplicadas via `aplicarConfigVisual()`
- **Detecção de hardware fraco** - Degradação para dispositivos fracos (`.reduced`)
- **Centralização de tipografia** - Font-size via `vmin` no body, filhos escalonam com `em`

## 🚀 Uso

### Desenvolvimento com Mock
1. Ajuste `MOCK_DATA.enabled = true` em `js/mock-data.js`.
2. Rode `npm run dev` nesta pasta para atualizar `css/master.css`.
3. Teste em `http://localhost:12099/FILES/1/index.html` pelo `ebcliente4.exe`.

### Produção com EdgeContents
1. Defina `MOCK_DATA.enabled = false` em `js/mock-data.js`.
2. Use o builder EdgeContents para gerar e validar o `.eh5`.

### Configuração Tailwind
```bash
npm run dev      # modo watch CSS
```

## ⚡ Regras Críticas

### JavaScript ES5 (NUNCA ES6+)
❌ **PROIBIDO**: `const`, `let`, `() => {}`, `` `texto ${var}` ``, `async/await`, `class`, `Promise`, `fetch`, `.find()`, `.includes()`
✅ **USE**: `var`, `function() {}`, `'texto ' + var`, `for (var i = 0; i < len; i++)`, `XMLHttpRequest`

### Tipografia Responsiva
```html
<!-- ✅ CORRETO -->
<body class="text-[3.2vmin] superbanner:text-[5vmin] empena:text-[11vmin]">
  <span class="text-[1.3em]">Título</span>

<!-- ❌ ERRADO -->
<span class="portrait:text-[1.1em] landscape:text-[1.3em]">
```

### Fallbacks CSS para Cores
```css
/* Adicionar após @tailwind utilities */
.text-white          { color: #ffffff }
.bg-black            { background-color: #000000 }
/* Para cores arbitrárias em classes utilitárias */
.text-\[\#FF0000\]   { color: #FF0000 }
```

## 🔧 Estrutura de Arquivos

```
_template-base/
├── index.html           # HTML principal com IDs fixos
├── README.md            # ESTE ARQUIVO
├── package.json         # Scripts Tailwind
├── tailwind.config.js   # Configuração + breakpoints aspect-ratio
├── css/
│   ├── input.css        # CSS com fallbacks + .reduced
│   └── master.css       # Compilado (não editar)
└── js/
    ├── ebhtml.js        # Biblioteca EBHTML v2.0.7 canônica
    ├── config.js        # CONFIG (timing, dataset, layout, colors) — editar aqui, não espalhar literais no master.js
    ├── master.js        # Lógica principal (ES5)
    └── mock-data.js     # Dados mock (descomentar)
```

## 📊 Campos de Dados (XML)

Os campos EdgeContents são MAIÚSCULAS:

| Campo | Uso |
|-------|-----|
| `TITULO` | Título principal |
| `TEXTO` | Descrição/Texto |
| `FOTO` | Imagem de fundo |
| `COR` | Cor hexadecimal para fundo |
| `FOOTER` | Texto de rodapé |
| `DURATION` | Duração total da exibição |
| `SLIDE_TIME` | Tempo por item em listas |

## 🎨 Layout

IDs HTML fixos para populaçãol:

- `#image` - Imagem de fundo (object-cover)
- `#title` - Título principal
- `#description` - Texto descritivo
- `#titleBox` - Container do título (com gradiente)
- `#descBox` - Container da descrição
- `#logoWrap` - Área de rodapé/logo
- `#footerText` - Texto do rodapé
- `#qrWrap` - Placeholder para QR Code
- `#photoLayer` - Gradiente para legibilidade
- `#tpl-item` - Template opcional para listas
- `#list` - Container opcional para itens múltiplos

## 🚨 Erros Comuns

1. **Playlist trava** - Verifique callbacks de erro, watchdogs e `finished()` em todos os caminhos.
2. **CSS não carrega** - Mantenha `npm run dev` ativo durante o desenvolvimento.
3. **Cores invisíveis** - Adicione fallbacks hex no `input.css`.
4. **Texto não escala** - Use `vmin` no body e `em`/`%` nos filhos.

## 📋 Checklist Pronto para Produção

- [ ] `MOCK_DATA.enabled = false`
- [ ] `css/master.css` atualizado pelo `npm run dev`
- [ ] Sem `const`/`let`/`arrow functions`/`template strings`
- [ ] Fallbacks hex no `input.css` para todas as cores usadas
- [ ] `font-size` no body via `vmin`
- [ ] `loader.loaded()` apenas após sucesso e revelação do conteúdo
- [ ] `loader.finished()` exatamente uma vez em sucesso, erro, vazio, timeout e exceção
- [ ] Watchdogs de loader e mídia presentes; handlers de mídia definidos antes de `src`
- [ ] Body visível; somente `#dynamicContent` oculto durante o carregamento

## 📚 Documentação Completa

Consulte `docs/00-governanca-e-arquitetura.md`, `.github/skills/ebhtml-api/SKILL.md` e `.github/skills/edgecontents-template-workflow/SKILL.md`.