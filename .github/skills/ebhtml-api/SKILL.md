---
name: ebhtml-api
description: "Use when: coding EBHTML templates for EdgeContents CMS digital signage, including data loading with addData/parameters, playlist control (loaded/finished/error), XML data access via loader.data/datalist, parameter filtering (amount, f_ filters, order), and ES5-compatible patterns for legacy WebKit on Android 7+."
---

# EBHTML API v2.0.3 — Skill de Uso

## Purpose
Guia completo para usar a biblioteca `ebhtml.js` em templates de Digital Signage do EdgeContents CMS. Cobre desde o carregamento de dados XML até o controle de playlist e passagem de parâmetros/filtros.

## 🚨 Verificar a versão do `ebhtml.js` ANTES de mexer no template

Incidente real (poder360_responsivo, 2026-08-14): um layout novo foi criado em cima de uma pasta já existente cujo `js/ebhtml.js` era uma versão antiga (9620 bytes, sem cabeçalho de versão) em vez da v2.0.3 (24750 bytes). Isso causou travamento/timeout em produção — comportamento silencioso, sem erro visível durante o desenvolvimento.

**Sempre, ao abrir/criar qualquer template:**
```bash
head -3 js/ebhtml.js
# Correto: linha 2 = "// EBHTML version 2.0.3"
```
Se a linha não bater (ou o arquivo tiver bem menos de ~24KB), o `ebhtml.js` está desatualizado. Substituir pelo arquivo inteiro de `_template-base/js/ebhtml.js` (fonte canônica) — nunca editar manualmente, sempre cópia integral do arquivo.

Isso é especialmente crítico ao **reaproveitar uma pasta de template já existente** para um layout novo — a pasta antiga pode ter um `ebhtml.js` de uma versão anterior do CMS.

## Trigger Keywords
Use esta skill quando o usuário pedir:
- EBHTML, ebhtml.js, loader, criar template EdgeContents
- addData, parameters, parâmetros de filtro, amount, ordenação
- loaded(), finished(), error() — controle de playlist
- loader.data(), loader.datalist() — acesso a dados XML
- Criar template do zero com EBHTML
- Dúvidas sobre XML EBDATA/EBDATALIST
- ES5 compatível com Android 7 / WebKit legado

---

## 1. Inicialização — `ebhtml.create2()`

**SEMPRE** usar `create2` (não `create`) para compatibilidade com WebKit e WebEngine:

```javascript
ebhtml.create2({}, function(loader) {
    // loader pronto para uso
});
```

Config opcional: `{ log: function(msg) { console.log(msg); } }`

---

## 2. Registro de Dataset — `loader.addData()`

```javascript
loader.addData(dataName, required, parameters, alias, basePath)
```

| Argumento | Tipo | Padrão | Descrição |
|---|---|---|---|
| `dataName` | String | — | Nome do dataset (ex: `"D_CLIMA"`) |
| `required` | Boolean | `true` | `false` = dataset vazio não causa erro |
| `parameters` | String | `""` | Query string anexada à URL |
| `alias` | String | = dataName | Nome alternativo p/ `loader.data('alias')` |
| `basePath` | String | `""` | URL base customizada (troca `/content/data/`) |

**Exemplos:**
```javascript
// Mínimo
loader.addData('D_NOTICIAS');

// Opcional
loader.addData('D_ALERTAS', false);

// Com parâmetros de filtro
loader.addData('D_NOTICIAS', false, 'amount=1&f_category=esportes');

// Com alias e basePath customizado
loader.addData('D_API', false, '', 'meusDados', 'http://outro-servidor/api/');
// Acessa: loader.data('meusDados')
```

---

## 3. Sistema de Parâmetros (Filtros)

O parâmetro `parameters` é anexado como query string na URL:
```
/content/data/{dataName}?{parameters}&time={timestamp}
```

### 3.1 Quantidade — `amount`

```javascript
'amount=1'     // 1 registro
'amount=0'     // Todos (ilimitado)
'amount=5'     // Últimos 5 registros
```

### 3.2 Filtro por campo — `f_NOMEDOCAMPO=valor`

Filtra registros onde um campo XML contém o valor. Prefixo `f_` + nome do campo:

```javascript
'f_category=noticias'         // Campo CATEGORY
'f_texto2=' + cidade           // Campo TEXTO2 (geralmente cidade)
'f_titulo=urgente'             // Campo TITULO
'f_id=5'                       // Campo ID
```

**Sempre usar `encodeURIComponent()` para valores com acentos/espaços:**
```javascript
var cidade = encodeURIComponent('São Paulo');
var filtro = 'amount=1&f_texto2=' + cidade + '&f_category=noticias';
```

### 3.3 Ordenação — `order` + `orderkind`

```javascript
'order=id&orderkind=A'        // ID ascendente
'order=dt_update&orderkind=D' // Data descendente
```

### 3.4 Combinando parâmetros

```javascript
// Montar array e joinar
var params = [
    'amount=5',
    'f_category=noticias',
    'order=dt_update',
    'orderkind=D'
];
loader.addData('D_NOTICIAS', false, params.join('&'));
```

---

## 4. Carregamento — `loader.load()`

```javascript
loader.autoloaded = false;      // Controle manual do loaded()
loader.nodataiserror = false;   // Dataset vazio NÃO é erro

loader.load(function() {
    // Sucesso: dados disponíveis aqui
}, function(erro) {
    // Opcional: callback de erro
});
```

**Propriedades importantes:**
| Propriedade | Padrão | Descrição |
|---|---|---|
| `autoloaded` | `true` | Se `true`, chama `loaded()` automático após sucesso |
| `nodataiserror` | `true` | Se `true`, dataset vazio dispara erro. `false` = finaliza sem erro |

---

## 5. Acesso a Dados

### Primeiro registro
```javascript
var item = loader.data('D_NOTICIAS');
if (item) {
    var titulo = item.value('TITULO').value;
    var texto  = item.value('TEXTO').value;
    var foto   = item.value('FOTO1').value;
}
```

### Lista completa
```javascript
var lista = loader.datalist('D_NOTICIAS');
var total = lista.count();

for (var i = 0; i < total; i++) {
    var item = lista.get(i);
    var titulo = item.value('TITULO').value;
}
```

### Verificar se campo existe
```javascript
var item = loader.data('D_DATASET');
if (item.value('CAMPO') && item.value('CAMPO').value) {
    // Campo existe e tem valor
}
```

---

## 6. Controle de Playlist — REGRA DE OURO

| Método | Quando chamar |
|---|---|
| `loader.loaded()` | ✅ APÓS renderizar com sucesso |
| `loader.finished()` | ✅ SEMPRE ao final (sucesso OU erro) |
| `loader.error(msg)` | 🛑 Em erro crítico (não chame loaded()) |

```javascript
loader.load(function() {
    if (!loader.data('D_DATASET')) {
        loader.finished();   // ❌ NÃO chame loaded()
        return;
    }
    renderizar();
    loader.loaded();         // ✅ Sucesso
    
    setTimeout(function() {
        loader.finished();   // ✅ Terminou
    }, 10000);
});
```

### 🚨 Como `finished()` deixa de ser chamado — causa real de travamento em produção

Incidente real (poder360_responsivo, 2026-08-14): erro de timeout intermitente em produção travava o item na playlist até o device reiniciar sozinho. Causa: `finished()` nunca era chamado em dois caminhos que a maioria dos templates esquece.

**a) `loader.load()` sem 2º argumento (callback de erro).** Internamente, se a XML falhar (rede instável, timeout, status != 200), `ebhtml.js` dispara `error()` — que chama `interface.eberror()` mas **NUNCA `finished()`**. Se você não passar um callback de erro, o item trava esperando `finished()` para sempre.
```javascript
function liberar() {
    loader.loaded();
    loader.finished();
}
loader.load(function () {
    // sucesso
}, liberar); // ⚠️ 2º argumento é OBRIGATÓRIO — sem ele, falha de XML = device travado
```

**b) `image.onload`/`onerror` atribuídos depois de `image.src`.** Se a imagem já estiver em cache do browser (comum em playlists que repetem itens), WebKit legado (Android 7+, comum nos players) pode disparar o evento de load/error **antes** do handler ser atribuído — o evento simplesmente se perde e `loaded()/finished()` nunca rodam.
```javascript
// ❌ ERRADO — risco de race condition com cache
image.src = dados.foto;
image.onload = function () { ldr.loaded(); ldr.finished(); };

// ✅ CORRETO — handlers sempre antes do src
image.onload = function () { ldr.loaded(); ldr.finished(); };
image.onerror = function () { ldr.loaded(); ldr.finished(); };
image.src = dados.foto;
```

**c) Watchdog de segurança — obrigatório em qualquer mídia assíncrona.** Mesmo com (a) e (b) corretos, sempre existe borda não prevista (src vazio, engine exótico). Todo template que depende de `image.onload`/`onerror` (ou qualquer evento assíncrono) para chamar `finished()` deve ter um `setTimeout` de fallback:
```javascript
var settled = false;
function concluir() {
    if (settled) { return; }
    settled = true;
    ldr.loaded();
    setTimeout(function () { ldr.finished(); }, timeFinished);
}

var watchdog = setTimeout(concluir, timeFinished); // dispara se nenhum evento vier

image.onload = function () { clearTimeout(watchdog); concluir(); };
image.onerror = function () { clearTimeout(watchdog); concluir(); };

document.querySelector('#image').appendChild(image);
image.src = dados.foto; // src por último, depois de handlers e watchdog
```

**Checklist ao revisar qualquer template:**
- [ ] `loader.load(sucesso, erro)` — 2º argumento sempre presente e também chamando `finished()`
- [ ] Handlers de imagem/mídia atribuídos ANTES de setar `src`
- [ ] Watchdog (`setTimeout`) garantindo `finished()` mesmo sem eventos

### Outros métodos de comunicação:
```javascript
loader.log('mensagem');           // Log para console + EdgeContents
loader.interactive('menu-touch'); // Marca template como interativo
loader.resetTimeout(10);          // Estende timeout em segundos
loader.queuechange();             // Notifica mudança na fila
```

---

## 7. Campos XML Padrão (EBDATA)

| Categoria | Campos | Exemplo |
|---|---|---|
| Texto | `TITULO`, `TEXTO`, `SUBTITULO`, `CATEGORIA`, `AUTOR`, `LOCAL` | Notícias |
| Imagem | `FOTO1` a `FOTO5`, `LOGO` | URLs relativas |
| Data/Hora | `DATA`, `DATAHORA`, `HORA`, `VALIDADE` | `"2026-02-06"` |
| Estilo | `COR`, `CORFUNDO`, `CORTEXTO`, `TAMANHO` | `"#3b82f6"` |
| Número | `NUMERO`, `ORDEM`, `PRIORIDADE`, `DURACAO` | Vêm como string |
| Booleano | `ATIVO`, `DESTAQUE`, `PUBLICADO` | `"true"` / `"false"` |

**Importante:** valores numéricos vêm como string. Converter com `parseInt()` / `parseFloat()`.

---

## 8. Estruturas XML Suportadas

### Registro único
```xml
<EBDATA>
    <TITULO>Título</TITULO>
    <TEXTO>Descrição</TEXTO>
    <FOTO1>img.jpg</FOTO1>
</EBDATA>
```

### Múltiplos registros
```xml
<EBDATALIST>
    <EBDATA>
        <TITULO>Item 1</TITULO>
    </EBDATA>
    <EBDATA>
        <TITULO>Item 2</TITULO>
    </EBDATA>
</EBDATALIST>
```

---

## 9. Preview via URL (CMS)

Quando a URL do navegador contém `?ebpreview_url=...`, o EBHTML automaticamente substitui o `basePath` pelos parâmetros de preview — **não requer código manual**:
```
?ebpreview_url=http://cms/&ebpreview_cd=123&ebpreview_id=456
```

---

## 10. Padrão Completo de Template

```javascript
window.onload = function() {
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        // --- MODO MOCK (teste local) ---
        var mockLoader = {
            loaded:   function() { console.log('[Mock] Carregado'); },
            finished: function() { console.log('[Mock] Finalizado'); }
        };
        iniciarTemplate(MOCK_DATA.dados[0], mockLoader);
    } else {
        // --- MODO PRODUÇÃO (EdgeContents) ---
        ebhtml.create2({}, function(loader) {
            loader.addData('D_DATASET', false, 'amount=1');
            loader.autoloaded = false;
            loader.nodataiserror = false;

            function liberarSemDados() {
                loader.loaded();
                loader.finished();
            }

            loader.load(function() {
                var item = loader.data('D_DATASET');
                if (!item) {
                    liberarSemDados();
                    return;
                }
                iniciarTemplate(item, loader);
            }, liberarSemDados); // ⚠️ callback de erro obrigatório — ver seção 6
        });
    }
};

function iniciarTemplate(item, loader) {
    var titulo = item.value('TITULO').value;
    var texto  = item.value('TEXTO').value;

    document.getElementById('title').innerText = titulo;
    document.getElementById('desc').innerText  = texto;

    loader.loaded();  // ✅ Sucesso

    setTimeout(function() {
        loader.finished();  // ✅ Terminou
    }, 10000);
}
```

---

## 11. ES5 Compatibility (Android 7+ / WebKit Legado)

**REGRAS ABSOLUTAS ao escrever código com EBHTML:**
- `var` no lugar de `const`/`let`
- `function() {}` no lugar de arrow functions `() => {}`
- Concatenação com `+` no lugar de template strings `` `${var}` ``
- `XMLHttpRequest` no lugar de `fetch()`
- `for (var i = 0; i < n; i++)` no lugar de `for...of` / `.forEach()`

---

## Referências
- Código fonte: `js/ebhtml.js` (em cada template)
- Documentação completa: `/docs/05-api-reference.md`
- Formato XML: `/docs/02-xml-format.md`
- Exemplos XML: `/examples/D_*.xml`
- Templates reais: `agro_link/`, `preco_prismaturismo/`, `climatempo_momento/`