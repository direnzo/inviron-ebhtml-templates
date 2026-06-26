---
name: ebhtml-api
description: "Use when: coding EBHTML templates for EdgeContents CMS digital signage, including data loading with addData/parameters, playlist control (loaded/finished/error), XML data access via loader.data/datalist, parameter filtering (amount, f_ filters, order), and ES5-compatible patterns for legacy WebKit on Android 7+."
---

# EBHTML API v2.0.3 — Skill de Uso

## Purpose
Guia completo para usar a biblioteca `ebhtml.js` em templates de Digital Signage do EdgeContents CMS. Cobre desde o carregamento de dados XML até o controle de playlist e passagem de parâmetros/filtros.

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

            loader.load(function() {
                var item = loader.data('D_DATASET');
                if (!item) {
                    loader.finished();
                    return;
                }
                iniciarTemplate(item, loader);
            });
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