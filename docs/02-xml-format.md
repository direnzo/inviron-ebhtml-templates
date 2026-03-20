# 📋 Formato XML EdgeContents - Estrutura EBDATA

Documentação completa do formato XML usado pelo EdgeContents CMS para fornecer dados aos templates.

---

## 📖 O que é EBDATA?

**EBDATA** é a estrutura XML padrão do EdgeContents para armazenar e transmitir conteúdo. Cada dataset retorna um ou mais registros no formato EBDATA contendo campos predefinidos.

**URL do dataset:** `http://servidor/content/data/{NOME_DATASET}`

---

## 🏗️ Estrutura Básica

### XML Simples (1 registro)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<EBDATA>
    <TITULO>Título do Conteúdo</TITULO>
    <TEXTO>Descrição completa do item</TEXTO>
    <FOTO1>uploads/imagem123.jpg</FOTO1>
    <FOTO2>uploads/imagem456.jpg</FOTO2>
    <COR>#3b82f6</COR>
    <DATA>2026-02-06</DATA>
</EBDATA>
```

### XML com Múltiplos Registros

```xml
<?xml version="1.0" encoding="UTF-8"?>
<EBDATALIST>
    <EBDATA>
        <TITULO>Primeiro Item</TITULO>
        <TEXTO>Descrição do primeiro item</TEXTO>
        <FOTO1>uploads/item1.jpg</FOTO1>
    </EBDATA>
    <EBDATA>
        <TITULO>Segundo Item</TITULO>
        <TEXTO>Descrição do segundo item</TEXTO>
        <FOTO1>uploads/item2.jpg</FOTO1>
    </EBDATA>
    <EBDATA>
        <TITULO>Terceiro Item</TITULO>
        <TEXTO>Descrição do terceiro item</TEXTO>
        <FOTO1>uploads/item3.jpg</FOTO1>
    </EBDATA>
</EBDATALIST>
```

---

## 📋 Campos Padrão

### Campos de Texto

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `TITULO` | String | Título principal do conteúdo | `"Notícia Importante"` |
| `TEXTO` | String | Descrição/corpo do texto | `"Descrição completa..."` |
| `SUBTITULO` | String | Subtítulo secundário | `"Mais informações"` |
| `CATEGORIA` | String | Categoria/tag do conteúdo | `"Tecnologia"`, `"Esportes"` |
| `AUTOR` | String | Nome do autor | `"João Silva"` |
| `LOCAL` | String | Local do evento/notícia | `"São Paulo - SP"` |

### Campos de Imagem

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `FOTO1` | URL | Imagem principal | `"uploads/imagem1.jpg"` |
| `FOTO2` | URL | Imagem secundária | `"uploads/imagem2.jpg"` |
| `FOTO3` | URL | Imagem terciária | `"uploads/imagem3.jpg"` |
| `FOTO4` | URL | Quarta imagem | `"uploads/imagem4.jpg"` |
| `FOTO5` | URL | Quinta imagem | `"uploads/imagem5.jpg"` |
| `LOGO` | URL | Logo/ícone | `"uploads/logo.png"` |

**⚠️ Importante:** URLs são relativas ao servidor EdgeContents  
**URL completa:** `http://servidor:12099/FILES/1/uploads/imagem1.jpg`

### Campos de Data/Hora

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `DATA` | Date | Data do conteúdo | `"2026-02-06"` |
| `DATAHORA` | DateTime | Data e hora completa | `"2026-02-06 14:30:00"` |
| `HORA` | Time | Hora específica | `"14:30"` |
| `VALIDADE` | Date | Data de validade/expiração | `"2026-12-31"` |

**Formato de data:** `YYYY-MM-DD` ou `DD/MM/YYYY`  
**Formato de hora:** `HH:MM` ou `HH:MM:SS`

### Campos de Estilo

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `COR` | Color | Cor em hexadecimal | `"#3b82f6"`, `"#ff0000"` |
| `CORFUNDO` | Color | Cor de fundo | `"#1e293b"` |
| `CORTEXTO` | Color | Cor do texto | `"#ffffff"` |
| `TAMANHO` | String | Tamanho/dimensão | `"grande"`, `"médio"`, `"pequeno"` |

### Campos Numéricos

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `NUMERO` | Number | Número genérico | `"42"` |
| `ORDEM` | Number | Ordem de exibição | `"1"`, `"2"`, `"3"` |
| `PRIORIDADE` | Number | Nível de prioridade | `"1"` (alta), `"5"` (baixa) |
| `DURACAO` | Number | Duração em segundos | `"5"`, `"10"` |

**⚠️ Importante:** Valores vêm como **strings**, converter com `parseInt()` ou `parseFloat()`:

```javascript
var numero = parseInt(item.value('NUMERO').value, 10);
var preco = parseFloat(item.value('PRECO').value);
```

### Campos Booleanos

| Campo | Tipo | Descrição | Valores |
|-------|------|-----------|---------|
| `ATIVO` | Boolean | Item ativo/inativo | `"true"`, `"false"`, `"1"`, `"0"` |
| `DESTAQUE` | Boolean | Item destacado | `"true"`, `"false"` |
| `PUBLICADO` | Boolean | Item publicado | `"true"`, `"false"` |

**Conversão:**
```javascript
var ativo = item.value('ATIVO').value === 'true' || item.value('ATIVO').value === '1';
```

### Campos Personalizados

EdgeContents permite criar campos customizados. Consulte a documentação do CMS para campos específicos do seu projeto.

---

## 🔌 Acessando Dados no Template

### Primeiro Registro (loader.data)

```javascript
ebhtml.create2({}, function(loader) {
    loader.addData('D_NOTICIAS', false);
    
    loader.load(function() {
        var item = loader.data('D_NOTICIAS');  // Primeiro registro
        
        if (item === undefined) {
            console.error('Dataset vazio');
            loader.finished();
            return;
        }
        
        // Acessar campos
        var titulo = item.value('TITULO').value;
        var texto = item.value('TEXTO').value;
        var foto = item.value('FOTO1').value;
        var cor = item.value('COR').value;
        
        console.log('Título:', titulo);
        console.log('Foto:', foto);
    });
});
```

### Lista Completa (loader.datalist)

```javascript
ebhtml.create2({}, function(loader) {
    loader.addData('D_NOTICIAS', false);
    
    loader.load(function() {
        var lista = loader.datalist('D_NOTICIAS');
        var quantidade = lista.count();
        
        console.log('Total de itens:', quantidade);
        
        var dados = [];
        for (var i = 0; i < quantidade; i++) {
            var item = lista.get(i);
            dados.push({
                TITULO: item.value('TITULO').value,
                TEXTO: item.value('TEXTO').value,
                FOTO1: item.value('FOTO1').value
            });
        }
        
        renderizar(dados);
    });
});
```

### Verificar Campo Existe

```javascript
var item = loader.data('D_DATASET');

// Verificar se campo existe e tem valor
if (item.value('FOTO1') && item.value('FOTO1').value) {
    var foto = item.value('FOTO1').value;
    console.log('Foto existe:', foto);
} else {
    console.log('Sem foto');
}
```

### Campos com Valores Padrão

```javascript
function obterValor(item, campo, padrao) {
    if (item.value(campo) && item.value(campo).value) {
        return item.value(campo).value;
    }
    return padrao;
}

// Uso
var titulo = obterValor(item, 'TITULO', 'Sem título');
var cor = obterValor(item, 'COR', '#3b82f6');
var duracao = parseInt(obterValor(item, 'DURACAO', '5'), 10);
```

---

## 🔄 Mock Data ↔ XML Real

### Mock Data (desenvolvimento)

```javascript
// js/mock-data.js
var MOCK_DATA = {
    enabled: true,
    config: { duration: 5000 },
    dados: [
        {
            TITULO: "Título Mock",
            TEXTO: "Descrição de teste",
            FOTO1: "img/exemplo.jpg",
            COR: "#3b82f6"
        }
    ]
};
```

### XML Real (produção)

```xml
<!-- http://servidor/content/data/D_NOTICIAS -->
<EBDATA>
    <TITULO>Título Real</TITULO>
    <TEXTO>Descrição real do servidor</TEXTO>
    <FOTO1>uploads/noticia123.jpg</FOTO1>
    <COR>#3b82f6</COR>
</EBDATA>
```

### Código Compatível (ambos)

```javascript
function processarDados(loader) {
    var lista = [];
    var dataset = loader.datalist('D_NOTICIAS');
    
    for (var i = 0; i < dataset.count(); i++) {
        var item = dataset.get(i);
        lista.push({
            TITULO: item.value('TITULO').value,
            TEXTO: item.value('TEXTO').value,
            FOTO1: item.value('FOTO1').value,
            COR: item.value('COR').value || '#3b82f6'  // Fallback
        });
    }
    
    return lista;
}

// Funciona com Mock E EdgeContents!
```

**Dica:** Mantenha estrutura idêntica entre Mock e XML para facilitar transição dev → produção.

---

## 🎯 Exemplos Práticos

### Dataset D_CLIMA_CLIMATEMPO (ClimaTempo)

**Arquivo de exemplo:** `/examples/D_CLIMA_CLIMATEMPO.xml`

Esse dataset retorna um `<EBDATA>` com campos que **contêm JSON dentro de CDATA**, por exemplo:

- `C1_D1_DATAARRAY`, `C1_D2_DATAARRAY`, `C1_D3_DATAARRAY`
- `DATE1`, `DATE2`, `DATE3`
- `DEST_CIDID`

O conteúdo de `C1_D1_DATAARRAY` é uma **string JSON** contendo uma lista de registros climáticos. Cada registro traz campos como:

- `mm_textpt_wea` (descrição em português)
- `nr_value_wea`, `nr_min_wea`, `nr_max_wea` (temperaturas)
- `nr_icon_wea`, `nr_probrain_wea` (ícone e probabilidade de chuva)
- `city` (objeto com `ds_name_cit`, `ds_state_cit`, `ds_country_cit`)

**Exemplo ES5 (parse do JSON em CDATA):**

```javascript
function obterCampo(item, campo) {
    if (item.value && item.value(campo)) {
        return item.value(campo).value;
    }
    return item[campo] || '';
}

function parseJsonArray(valor) {
    if (!valor) return [];
    try { return JSON.parse(valor); } catch (e) { return []; }
}

var item = loader.data('D_CLIMA_CLIMATEMPO');
var jsonStr = obterCampo(item, 'C1_D1_DATAARRAY');
var lista = parseJsonArray(jsonStr);

if (lista.length > 0) {
    var clima = lista[0];
    var cidade = clima.city ? clima.city.ds_name_cit : '';
    var desc = clima.mm_textpt_wea || '';
    var temp = clima.nr_value_wea || '';
    console.log(cidade + ' • ' + temp + '° • ' + desc);
}
```

**Observações importantes:**
- Os campos `C1_*` podem vir vazios; valide antes de usar.
- O JSON é uma string; sempre faça `JSON.parse()`.
- Alguns valores podem ser `null` (ex.: dados marítimos).

### Exemplo 1: Notícias

**XML:**
```xml
<EBDATALIST>
    <EBDATA>
        <TITULO>Nova Tecnologia Lançada</TITULO>
        <TEXTO>Empresa anuncia inovação no setor...</TEXTO>
        <FOTO1>uploads/tech.jpg</FOTO1>
        <CATEGORIA>Tecnologia</CATEGORIA>
        <DATA>2026-02-06</DATA>
        <AUTOR>João Silva</AUTOR>
    </EBDATA>
</EBDATALIST>
```

**Template JS:**
```javascript
function renderizarNoticia(dados) {
    var html = '<div class="noticia bg-white rounded-xl p-8">';
    html += '<img src="' + dados.FOTO1 + '" class="w-full h-64 object-cover rounded-lg">';
    html += '<h1 class="text-4xl font-bold mt-4">' + dados.TITULO + '</h1>';
    html += '<p class="text-gray-600 mt-2">' + dados.CATEGORIA + ' • ' + dados.DATA + '</p>';
    html += '<p class="text-xl mt-4">' + dados.TEXTO + '</p>';
    html += '<p class="text-sm text-gray-500 mt-4">Por ' + dados.AUTOR + '</p>';
    html += '</div>';
    
    return html;
}
```

### Exemplo 2: Slideshow de Produtos

**XML:**
```xml
<EBDATALIST>
    <EBDATA>
        <TITULO>Produto A</TITULO>
        <TEXTO>Descrição do produto A</TEXTO>
        <FOTO1>uploads/produto-a.jpg</FOTO1>
        <COR>#3b82f6</COR>
        <PRECO>R$ 99,90</PRECO>
    </EBDATA>
    <EBDATA>
        <TITULO>Produto B</TITULO>
        <TEXTO>Descrição do produto B</TEXTO>
        <FOTO1>uploads/produto-b.jpg</FOTO1>
        <COR>#9333ea</COR>
        <PRECO>R$ 149,90</PRECO>
    </EBDATA>
</EBDATALIST>
```

**Template JS:**
```javascript
function criarSlideshow(produtos) {
    var indice = 0;
    var container = document.getElementById('container');
    
    function mostrarProximo() {
        var produto = produtos[indice];
        
        var html = '<div class="produto text-center transition-opacity duration-1000">';
        html += '<div class="w-96 h-96 mx-auto mb-8">';
        html += '<img src="' + produto.FOTO1 + '" class="w-full h-full object-cover rounded-full">';
        html += '</div>';
        html += '<h1 class="text-6xl font-bold" style="color: ' + produto.COR + '">' + produto.TITULO + '</h1>';
        html += '<p class="text-3xl mt-4 text-gray-700">' + produto.TEXTO + '</p>';
        html += '<p class="text-5xl font-bold mt-8 text-green-600">' + produto.PRECO + '</p>';
        html += '</div>';
        
        container.innerHTML = html;
        
        indice = (indice + 1) % produtos.length;
        setTimeout(mostrarProximo, 3000);  // Troca a cada 3s
    }
    
    mostrarProximo();
}
```

### Exemplo 3: Alertas/Avisos

**XML:**
```xml
<EBDATALIST>
    <EBDATA>
        <TITULO>ALERTA URGENTE</TITULO>
        <TEXTO>Evacuação imediata do prédio</TEXTO>
        <COR>#dc2626</COR>
        <PRIORIDADE>1</PRIORIDADE>
    </EBDATA>
    <EBDATA>
        <TITULO>Aviso Importante</TITULO>
        <TEXTO>Manutenção programada às 14h</TEXTO>
        <COR>#f59e0b</COR>
        <PRIORIDADE>3</PRIORIDADE>
    </EBDATA>
</EBDATALIST>
```

**Template JS:**
```javascript
function renderizarAlertas(alertas) {
    // Ordenar por prioridade
    alertas.sort(function(a, b) {
        var prioA = parseInt(a.PRIORIDADE, 10);
        var prioB = parseInt(b.PRIORIDADE, 10);
        return prioA - prioB;
    });
    
    var container = document.getElementById('container');
    var html = '<div class="w-full space-y-4 p-8">';
    
    for (var i = 0; i < alertas.length; i++) {
        var alerta = alertas[i];
        html += '<div class="alerta p-6 rounded-xl text-white" style="background-color: ' + alerta.COR + '">';
        html += '<h2 class="text-4xl font-bold">' + alerta.TITULO + '</h2>';
        html += '<p class="text-2xl mt-2">' + alerta.TEXTO + '</p>';
        html += '</div>';
    }
    
    html += '</div>';
    container.innerHTML = html;
}
```

---

## ⚠️ Boas Práticas

### 1. Sempre Valide Dados

```javascript
// ❌ RUIM - Assume que dados existem
var titulo = item.value('TITULO').value;

// ✅ BOM - Valida antes de usar
var titulo = (item.value('TITULO') && item.value('TITULO').value) 
    ? item.value('TITULO').value 
    : 'Sem título';
```

### 2. Conversão de Tipos

```javascript
// Números
var numero = parseInt(item.value('ORDEM').value, 10) || 0;
var preco = parseFloat(item.value('PRECO').value) || 0.0;

// Booleanos
var ativo = item.value('ATIVO').value === 'true' || item.value('ATIVO').value === '1';

// Datas (conversão manual - sem Date() devido ES5)
var dataStr = item.value('DATA').value;  // "2026-02-06"
var partes = dataStr.split('-');
var ano = parseInt(partes[0], 10);
var mes = parseInt(partes[1], 10);
var dia = parseInt(partes[2], 10);
```

### 3. Tratamento de Imagens

```javascript
// Verificar se imagem existe
function obterImagem(item, campo) {
    if (item.value(campo) && item.value(campo).value) {
        var url = item.value(campo).value;
        // Adicionar domínio se necessário
        if (url.indexOf('http') !== 0) {
            return 'http://servidor:12099/FILES/1/' + url;
        }
        return url;
    }
    return 'img/placeholder.png';  // Imagem padrão
}

var foto = obterImagem(item, 'FOTO1');
```

### 4. Sanitização de Texto

```javascript
// Escapar HTML para evitar XSS
function escaparHTML(texto) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(texto));
    return div.innerHTML;
}

var tituloSeguro = escaparHTML(item.value('TITULO').value);
```

### 5. Limite de Registros

```javascript
// Limitar quantidade de itens
var lista = loader.datalist('D_NOTICIAS');
var maxItens = 10;
var quantidade = Math.min(lista.count(), maxItens);

for (var i = 0; i < quantidade; i++) {
    var item = lista.get(i);
    // processar
}
```

---

## 🔍 Debugging XML

### Console Logs Úteis

```javascript
// Ver estrutura completa
console.log('Dataset:', loader.data('D_NOTICIAS'));

// Ver quantidade de registros
console.log('Total:', loader.datalist('D_NOTICIAS').count());

// Ver campos de um registro
var item = loader.data('D_NOTICIAS');
console.log('TITULO:', item.value('TITULO'));
console.log('TEXTO:', item.value('TEXTO'));
console.log('FOTO1:', item.value('FOTO1'));

// Iterar todos os campos (se souber os nomes)
var campos = ['TITULO', 'TEXTO', 'FOTO1', 'COR', 'DATA'];
for (var i = 0; i < campos.length; i++) {
    var campo = campos[i];
    var valor = item.value(campo) ? item.value(campo).value : null;
    console.log(campo + ':', valor);
}
```

### Verificar XML Bruto

Acesse diretamente no navegador:
```
http://localhost:12099/content/data/D_NOTICIAS
```

Deve retornar o XML bruto. Verifique:
- Encoding correto (`<?xml version="1.0" encoding="UTF-8"?>`)
- Tags fechadas corretamente
- Nomes de campos em UPPERCASE
- Valores sem caracteres especiais problemáticos

---

## 📚 Próximos Passos

- **[docs/03-advanced.md](03-advanced.md)** - Múltiplos datasets, animações avançadas
- **[docs/04-troubleshooting.md](04-troubleshooting.md)** - Problemas comuns com XML/dados
- **[docs/05-api-reference.md](05-api-reference.md)** - Métodos completos do EBHTML
- **[GLOSSARY.md](GLOSSARY.md)** - Termos técnicos (Dataset, EBDATA, etc.)

---

**Documentação atualizada:** 06/02/2026  
**Versão EBHTML:** 2.0.3
