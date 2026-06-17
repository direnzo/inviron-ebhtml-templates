# TEMPLATE BASE - EdgeContents Digital Signage

Template HTML base simplificado para displays digitais usando EdgeContents CMS.

## 📋 Características

- **JavaScript ES5 obrigatório** - Compatível com Android 7+ (WebKit legado)
- **TailwindCSS v3** - Framework CSS pré-configurado com fallbacks para Chrome < 65
- **Breakpoints por Aspect Ratio** - Layout inteligente para portrait (≤3:4), landscape (4:3 a 2:1), ultrawide (≥3:1), superbanner (5:1 a 15:1), empena (≤1:3)
- **Mock compatível** - Desenvolvimento sem backend via EBHTML shim
- **Detecção automática de hardware** - Degradação para dispositivos fracos (`.reduced`)
- **Centralização de tipografia** - Font-size via `vmin` no body, filhos escalonam com `em`

## 🚀 Uso

### Desenvolvimento com Mock
1. Ative `MOCK_DATA.enabled = true` em `js/mock-data.js`
2. Abra `index.html` diretamente no navegador

### Produção com EdgeContents
1. Comente `<script src="js/mock-data.js"></script>` no HTML
2. Use `ebhtmlbuilder4` para compilar com EdgeContents CMS

### Configuração Tailwind
```bash
npm run dev      # modo watch CSS
npm run build    # CSS minificado produção
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
    ├── ebhtml.js        # Biblioteca EBHTML v2.0.3
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

1. **Playlist trava** - Faltou chamar `loader.loaded()` após sucesso OU chamou `loader.loaded()` em erro
2. **CSS não carrega** - Tailwind não compilou, execute `npm run dev`
3. **Cores invisíveis** - Fallbacks hex faltando no `input.css`
4. **Texto não escala** - `portrait:`/`landscape:` espalhados nos filhos em vez de `vmin` no body

## 📋 Checklist Pronto para Produção

- [ ] `MOCK_DATA.enabled = false` (comentar script no HTML)
- [ ] `npm run build` executado (CSS minificado)
- [ ] Sem `const`/`let`/`arrow functions`/`template strings`
- [ ] Fallbacks hex no `input.css` para todas as cores usadas
- [ ] `font-size` no body via `vmin`
- [ ] `loader.loaded()` apenas após sucesso
- [ ] `loader.finished()` sempre (com ou sem erro)

## 📚 Documentação Completa

Veja `/docs/` para:
- `02-xml-format.md` - Estrutura XML completa
- `05-api-reference.md` - API EBHTML
- `04-troubleshooting.md` - Debug avançado