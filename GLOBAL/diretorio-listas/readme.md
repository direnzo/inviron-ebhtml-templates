# Diretório Listas - Template para Condomínios

Template para exibição de diretório comercial em displays digitais. Mostra lista de empresas/moradores com logo, nome, andar e conjunto/sala.

## Funcionalidades

- **Lista em colunas**: 1, 2 ou 3 colunas configuráveis
- **Scroll automático**: Rolagem suave via `transform: translateY()` para listas longas
- **Cores dinâmicas**: Background, cards, destaque, texto e título configuráveis via XML (TEXTO4)
- **Background image**: Imagem de fundo opcional (TEXTO6)
- **Logo do condomínio**: Logo opcional no cabeçalho (TEXTO7)
- **Fade-in sequencial**: Itens aparecem um a um com delay de 60ms
- **Layout responsivo**: Adapta-se a diferentes aspect ratios (portrait, landscape, ultrawide, superbanner, empena)
- **Degradação para hardware fraco**: Detecta Android com DPR ≤ 1 ou largura ≤ 1280px e desliga animações/sombras
- **Compatível Android 7+**: ES5, fallbacks hex no CSS, sem `clamp()`

## Estrutura de Dados (XML)

Dataset: `D_CONDOMINIO`

### Item 0 — Configuração Global (obrigatório, primeiro ITEM)

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| `TITULO` | Nome do condomínio/edifício | `Torre Norte Business Center` |
| `SUBTITULO` | Subtítulo exibido no rodapé | `Edifício Comercial Torre Norte` |
| `TEXTO4` | Cores (5 valores separados por vírgula): `fundo,card,destaque,texto,titulo` | `#0b0b15,#a5a5d8,#5554d5,#ebebf2,#2c2b83` |
| `TEXTO5` | Número de colunas (1-3) | `2` |
| `TEXTO6` | URL da imagem de background (opcional) | `img/bg.jpg` |
| `TEXTO7` | URL da logo do condomínio (opcional) | `img/logo.png` |
| `TEXTO8` | Duração em segundos (mín. 5s) | `15` |

### Itens 1+ — Empresas / Moradores

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| `TITULO` | Nome da empresa (obrigatório) | `TechVision Solutions` |
| `FOTO` | URL da logo (opcional) | `img/logo_1.png` |
| `TEXTO` | Informação extra / ramo (opcional) | `Tecnologia & Inovação` |
| `TEXTO2` | Andar (opcional) | `20º` |
| `TEXTO3` | Conjunto/sala (opcional) | `A-F` |

## Exemplo XML

```xml
<EBDATA AMOUNT="0" QI_ORDER="RANDOM">
  <!-- Config global -->
  <ITEM>
    <TITULO><![CDATA[Torre Norte Business Center]]></TITULO>
    <SUBTITULO><![CDATA[Edifício Comercial Torre Norte]]></SUBTITULO>
    <TEXTO4><![CDATA[#0b0b15,#a5a5d8,#5554d5,#ebebf2,#2c2b83]]></TEXTO4>
    <TEXTO5><![CDATA[2]]></TEXTO5>
    <TEXTO6><![CDATA[img/bg.jpg]]></TEXTO6>
    <TEXTO7><![CDATA[img/logo.png]]></TEXTO7>
    <TEXTO8><![CDATA[15]]></TEXTO8>
  </ITEM>
  <!-- Empresa -->
  <ITEM>
    <TITULO><![CDATA[TechVision Solutions]]></TITULO>
    <FOTO><![CDATA[img/logo_1.png]]></FOTO>
    <TEXTO><![CDATA[Tecnologia & Inovação]]></TEXTO>
    <TEXTO2><![CDATA[20º]]></TEXTO2>
    <TEXTO3><![CDATA[A-F]]></TEXTO3>
  </ITEM>
</EBDATA>
```

## Desenvolvimento Local

### 1. Servidor EdgeContents
```bash
ebcliente4.exe  # localhost:12099
```

### 2. Dados de desenvolvimento

Há **duas formas** de mock:

**A) Mock XML (shim XHR — padrão):**
- `js/D_CONDOMINIO.xml.js` intercepta XHR e redireciona para `js/D_CONDOMINIO.xml`
- Script já incluso no `index.html` — funciona com servidor local rodando

**B) Mock data (standalone — sem servidor):**
- Descomente `<script src="js/mock-data.js"></script>` no `index.html`
- `js/mock-data.js` contém 15 empresas + config com dados de exemplo
- Funciona abrindo direto no navegador (`file:///`)

### 3. CSS (Tailwind)
```bash
npm run dev     # Watch mode
npm run build   # Minificado (produção)
```

### 4. Preview na extranet
O template detecta automaticamente se está em preview (extranet) via `window.parent.document.getElementById('template_check')`:
- **Preview** → `extranetView()` (suprime `finished()` para não avançar playlist)
- **Player** → `playerView()` (EBHTML normal com `loaded()`/`finished()`)

## Produção

1. Comente `js/D_CONDOMINIO.xml.js` e `js/mock-data.js` no `index.html`
2. EBHTML carregará dados do CMS via `http://127.0.0.1:13199/CONTENT/DATA/D_CONDOMINIO`
3. Execute `npm run build` para CSS minificado

## Arquivos

| Arquivo | Função |
|---------|--------|
| `index.html` | Estrutura principal do template |
| `js/master.js` | Lógica do template (playerView, iniciarTemplate, scroll, cores, listas) |
| `js/preview.js` | Modo preview/extranet (extranetView) |
| `js/ebhtml.js` | Biblioteca EdgeContents (não editar) |
| `js/D_CONDOMINIO.xml.js` | Shim XHR para mock XML (dev) |
| `js/D_CONDOMINIO.xml` | Dados XML de exemplo |
| `css/input.css` | CSS fonte (Tailwind directives + fallbacks hex) |
| `css/master.css` | CSS compilado |
| `package.json` | Scripts npm |
| `tailwind.config.js` | Configuração Tailwind + breakpoints aspect ratio |

## JavaScript ES5

Compatível com Android 7+ (WebKit legado):

| ❌ Proibido | ✅ Use |
|-------------|--------|
| `let` / `const` | `var` |
| `() => {}` | `function() {}` |
| `` `texto ${var}` `` | `'texto ' + var` |
| `fetch()` | `XMLHttpRequest` |
| `for...of` | `for (var i = 0; i < n; i++)` |

## Breakpoints Aspect Ratio

Definidos no `tailwind.config.js`:

| Breakpoint | Aspect Ratio | Uso típico |
|------------|-------------|------------|
| `portrait` | ≤ 3:4 | 9:16 vertical |
| `square` | 1:1 | Telas quadradas |
| `landscape` | 4:3 a 2:1 | 16:9 horizontal |
| `ultrawide` | ≥ 3:1 | Monitores muito largos |
| `superbanner` | 5:1 a 15:1 | Faixas comerciais |
| `empena` | ≤ 1:3 | Displays muito estreitos |

## Notas Técnicas

- Fallbacks hex no `input.css` para compatibilidade com Chrome < 65 (Tailwind gera `rgb(r g b / alpha)` não suportado)
- `font-size` no body via `vmin` — filhos usam apenas `em`
- Sem `clamp()` (requer Chrome 79+)
- Scroll automático usa `setInterval(16ms)` + `transform: translateY()`
- Degradação para hardware fraco via classe `.reduced` (desliga sombras, animações e transforms)

## Checklist Produção

- [ ] Comentar `D_CONDOMINIO.xml.js` e `mock-data.js` no `index.html`
- [ ] `npm run build` executado
- [ ] Fallbacks hex no `input.css` para todas as cores usadas
- [ ] `loader.finished()` sempre (com ou sem erro)

## 📚 Documentação Completa

Veja `/docs/` para:
- `02-xml-format.md` - Estrutura XML completa
- `05-api-reference.md` - API EBHTML
- `04-troubleshooting.md` - Debug avançado