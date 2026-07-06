# 📚 Referência da API - EBHTML

Documentação completa dos métodos e propriedades da biblioteca EBHTML v2.0.3.

---

## 📋 Índice

1. [ebhtml Object](#ebhtml-object)
2. [Loader (EBBrowser)](#loader-ebbrowser)
3. [Dataset (EBBrowserData)](#dataset-ebbrowserdata)
4. [Item (EBBrowserDataRow)](#item-ebbrowserdatarow)
5. [Configurações](#configurações)
6. [Exemplos Completos](#exemplos-completos)

---

## 🌐 ebhtml Object

### ebhtml.create2(config, callback)

Cria uma instância do loader para carregar dados do EdgeContents.

**Parâmetros:**
- `config` (Object, opcional) - Configurações do loader
- `callback` (Function) - Função chamada com o loader criado

**Configurações disponíveis:**
```javascript
{
    log: function(message) { console.log(message); }  // Função de log customizada
}
```

**Retorno:** Nenhum (usa callback)

**Exemplo:**
```javascript
ebhtml.create2({}, function(loader) {
    // Loader criado e disponível aqui
    loader.addData('D_DATASET', false);
    loader.load(function() {
        // Dados carregados
    });
});
```

---

## 🔄 Loader (EBBrowser)

Objeto principal que gerencia carregamento de datasets e controle de playlist.

### Propriedades

#### loader.autoloaded
**Tipo:** Boolean  
**Padrão:** `true`  
**Descrição:** Se `true`, chama automaticamente `loader.loaded()` após carregar dados com sucesso. Se `false`, você deve chamar manualmente.

```javascript
loader.autoloaded = false;  // Controle manual
loader.load(function() {
    // Processar dados
    loader.loaded();  // Chamar manualmente
});
```

#### loader.nodataiserror
**Tipo:** Boolean  
**Padrão:** `true`  
**Descrição:** Se `true`, dataset vazio é tratado como erro. Se `false`, permite datasets vazios sem erro.

```javascript
loader.nodataiserror = false;  // Permite datasets vazios
```

#### loader.isloaded
**Tipo:** Boolean (readonly)  
**Descrição:** `true` se todos os datasets foram carregados.

```javascript
if (loader.isloaded) {
    console.log('Todos os dados carregados');
}
```

#### loader.isstopped
**Tipo:** Boolean (readonly)  
**Descrição:** `true` se loader foi finalizado (chamou `finished()` ou `error()`).

```javascript
if (!loader.isstopped) {
    // Continuar processamento
}
```

---

### Métodos de Registro

#### loader.addData(dataName, required, parameters, alias, basePath)

Registra um dataset para ser carregado.

**Parâmetros:**
- `dataName` (String) - Nome do dataset no EdgeContents (ex: `'D_NOTICIAS'`)
- `required` (Boolean, opcional) - Se `true`, erro se dataset vazio. Padrão: `true`
- `parameters` (String, opcional) - Parâmetros adicionais na URL. Padrão: `""`
- `alias` (String, opcional) - Nome alternativo para acessar dataset. Padrão: mesmo que `dataName`
- `basePath` (String, opcional) - Caminho base customizado. Padrão: `""`

**Retorno:** Nenhum

**Exemplos:**
```javascript
// Dataset obrigatório
loader.addData('D_NOTICIAS', true);

// Dataset opcional
loader.addData('D_ALERTAS', false);

// Com parâmetros
loader.addData('D_PRODUTOS', false, '?categoria=eletronicos');

// Com alias
loader.addData('D_NEWS', false, '', 'noticias');
// Acessa: loader.data('noticias')

// Com basePath customizado
loader.addData('D_EXTERNAL', false, '', '', 'http://outro-servidor/api/');
```

---

### Métodos de Carregamento

#### loader.load(callback, errorCallback)

Inicia o carregamento de todos os datasets registrados.

**Parâmetros:**
- `callback` (Function) - Chamada quando dados carregam com sucesso
- `errorCallback` (Function, opcional) - Chamada em caso de erro

**Retorno:** Boolean (`true` se iniciou, `false` se já estava finalizado)

**Exemplos:**
```javascript
// Básico
loader.load(function() {
    console.log('Dados carregados');
});

// Com tratamento de erro
loader.load(
    function() {
        console.log('Sucesso');
    },
    function(erro) {
        console.error('Falha:', erro);
    }
);
```

---

### Métodos de Acesso a Dados

#### loader.data(dataName)

Retorna o **primeiro registro** de um dataset.

**Parâmetros:**
- `dataName` (String) - Nome ou alias do dataset

**Retorno:** EBBrowserDataRow (item) ou `undefined` se vazio

**Exemplo:**
```javascript
var primeiroItem = loader.data('D_NOTICIAS');

if (primeiroItem !== undefined) {
    var titulo = primeiroItem.value('TITULO').value;
    var texto = primeiroItem.value('TEXTO').value;
    console.log(titulo, texto);
}
```

#### loader.datalist(dataName)

Retorna o dataset completo (lista de registros).

**Parâmetros:**
- `dataName` (String) - Nome ou alias do dataset

**Retorno:** EBBrowserData (dataset com múltiplos registros)

**Exemplo:**
```javascript
var dataset = loader.datalist('D_NOTICIAS');
var total = dataset.count();

console.log('Total de itens:', total);

for (var i = 0; i < total; i++) {
    var item = dataset.get(i);
    console.log(item.value('TITULO').value);
}
```

---

### Métodos de Controle de Playlist

#### loader.loaded()

Notifica EdgeContents que template carregou com **sucesso**.

**⚠️ IMPORTANTE:** Chame APENAS se tudo deu certo. NÃO chame em caso de erro.

**Parâmetros:** Nenhum  
**Retorno:** Nenhum

**Exemplo:**
```javascript
loader.load(function() {
    if (loader.data('D_DATASET') === undefined) {
        console.error('Sem dados');
        loader.finished();  // NÃO chame loaded()
        return;
    }
    
    renderizar();
    loader.loaded();  // ✅ Sucesso
});
```

#### loader.finished()

Notifica EdgeContents que template terminou exibição.

**⚠️ IMPORTANTE:** SEMPRE chame ao final (sucesso OU erro).

**Parâmetros:** Nenhum  
**Retorno:** Nenhum

**Exemplo:**
```javascript
// Após sucesso
loader.loaded();
setTimeout(function() {
    loader.finished();  // Terminou
}, 5000);

// Em erro
if (erro) {
    console.error('Erro');
    loader.finished();  // Terminou (sem loaded)
}
```

#### loader.error(message)

Notifica erro crítico ao EdgeContents.

**Parâmetros:**
- `message` (String) - Mensagem de erro

**Retorno:** Nenhum

**Efeitos:**
- Define `loader.isstopped = true`
- Chama `errorCallback` se fornecido
- Template não exibe (playlist pula)

**Exemplo:**
```javascript
loader.load(
    function() {
        // Sucesso
    },
    function(erro) {
        loader.error('Falha ao carregar: ' + erro);
    }
);
```

#### loader.log(message)

Envia log para EdgeContents e console.

**Parâmetros:**
- `message` (String) - Mensagem de log

**Retorno:** Nenhum

**Exemplo:**
```javascript
loader.log('Template iniciado');
loader.log('Processando ' + dados.length + ' itens');
```

---

### Métodos Avançados

#### loader.interactive(name)

Marca template como interativo (pausa timeout).

**Parâmetros:**
- `name` (String, opcional) - Nome da interação

**Retorno:** Nenhum

**Exemplo:**
```javascript
// Template com interação de usuário
loader.interactive('menu-touch');
```

#### loader.resetTimeout(timeout)

Reseta timeout do template.

**Parâmetros:**
- `timeout` (Number, opcional) - Novo timeout em segundos

**Retorno:** Nenhum

**Exemplo:**
```javascript
// Estender tempo de exibição
loader.resetTimeout(10);  // +10 segundos
```

#### loader.queuechange()

Notifica mudança na fila de templates.

**Parâmetros:** Nenhum  
**Retorno:** Nenhum

**Uso:** Raro, apenas para templates que gerenciam playlist manualmente.

#### loader.getQueryParams(queryString)

Extrai parâmetros de query string.

**Parâmetros:**
- `queryString` (String) - Query string (ex: `"?id=123&cat=tech"`)

**Retorno:** Object com pares chave-valor

**Exemplo:**
```javascript
var params = loader.getQueryParams('?id=123&categoria=noticias');
console.log(params.id);         // "123"
console.log(params.categoria);  // "noticias"
```

---

## 📊 Dataset (EBBrowserData)

Representa uma coleção de registros de um dataset.

### dataset.count()

Retorna quantidade de registros no dataset.

**Parâmetros:** Nenhum  
**Retorno:** Number (0 se vazio)

**Exemplo:**
```javascript
var dataset = loader.datalist('D_NOTICIAS');
var total = dataset.count();

if (total === 0) {
    console.log('Dataset vazio');
} else {
    console.log('Total de itens:', total);
}
```

### dataset.get(index)

Retorna registro específico por índice.

**Parâmetros:**
- `index` (Number) - Índice do registro (0-based)

**Retorno:** EBBrowserDataRow (item) ou `undefined` se índice inválido

**Exemplo:**
```javascript
var dataset = loader.datalist('D_NOTICIAS');

// Primeiro item
var primeiro = dataset.get(0);

// Último item
var ultimo = dataset.get(dataset.count() - 1);

// Iterar todos
for (var i = 0; i < dataset.count(); i++) {
    var item = dataset.get(i);
    console.log(item.value('TITULO').value);
}
```

### dataset.first()

Retorna o primeiro registro do dataset.

**Parâmetros:** Nenhum  
**Retorno:** EBBrowserDataRow (item) ou `undefined` se vazio

**Exemplo:**
```javascript
var dataset = loader.datalist('D_NOTICIAS');
var primeiro = dataset.first();

// Equivalente a:
var primeiro = dataset.get(0);
// ou
var primeiro = loader.data('D_NOTICIAS');
```

### Propriedades

#### dataset.isloaded
**Tipo:** Boolean (readonly)  
**Descrição:** `true` se dataset foi carregado (sucesso ou erro).

#### dataset.iserror
**Tipo:** Boolean (readonly)  
**Descrição:** `true` se houve erro ao carregar dataset.

#### dataset.required
**Tipo:** Boolean (readonly)  
**Descrição:** `true` se dataset foi registrado como obrigatório.

**Exemplo:**
```javascript
var dataset = loader.datalist('D_NOTICIAS');

if (dataset.iserror) {
    console.error('Erro ao carregar dataset');
} else if (dataset.count() === 0) {
    console.warn('Dataset vazio');
} else {
    console.log('Dataset OK:', dataset.count(), 'itens');
}
```

---

## 📄 Item (EBBrowserDataRow)

Representa um único registro de um dataset.

### item.value(fieldName)

Retorna valor de um campo específico.

**Parâmetros:**
- `fieldName` (String) - Nome do campo (UPPERCASE)

**Retorno:** Object com propriedade `.value` contendo o valor, ou `undefined` se campo não existe

**Exemplo:**
```javascript
var item = loader.data('D_NOTICIAS');

// Acessar campo
var tituloObj = item.value('TITULO');
if (tituloObj) {
    var titulo = tituloObj.value;  // String
    console.log('Título:', titulo);
}

// Verificar se existe
if (item.value('FOTO1')) {
    var foto = item.value('FOTO1').value;
    console.log('Foto existe:', foto);
} else {
    console.log('Sem foto');
}
```

### Campos Comuns

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `TITULO` | String | Título principal |
| `TEXTO` | String | Descrição/conteúdo |
| `SUBTITULO` | String | Subtítulo |
| `FOTO1` - `FOTO5` | String (URL) | Imagens |
| `COR` | String (HEX) | Cor em hexadecimal |
| `DATA` | String (Date) | Data formatada |
| `CATEGORIA` | String | Categoria |
| `NUMERO` | String (Number) | Valor numérico |
| `ATIVO` | String (Boolean) | "true"/"false" |

**Ver mais:** [docs/02-xml-format.md](02-xml-format.md)

**Exemplo completo:**
```javascript
var item = loader.data('D_NOTICIAS');

var dados = {
    titulo: item.value('TITULO') ? item.value('TITULO').value : 'Sem título',
    texto: item.value('TEXTO') ? item.value('TEXTO').value : '',
    foto: item.value('FOTO1') ? item.value('FOTO1').value : 'img/placeholder.jpg',
    cor: item.value('COR') ? item.value('COR').value : '#3b82f6',
    categoria: item.value('CATEGORIA') ? item.value('CATEGORIA').value : 'Geral'
};

console.log(dados);
```

---

## ⚙️ Configurações

### Configuração Global

```javascript
ebhtml.create2({
    log: function(message) {
        console.log('[EBHTML]', message);
        // Ou enviar para servidor de logs
    }
}, function(loader) {
    // ...
});
```

### Configuração do Loader

```javascript
ebhtml.create2({}, function(loader) {
    // Controle manual de loaded()
    loader.autoloaded = false;
    
    // Permitir datasets vazios
    loader.nodataiserror = false;
    
    // Registrar datasets
    loader.addData('D_NOTICIAS', false);  // Opcional
    loader.addData('D_ALERTAS', true);    // Obrigatório
    
    loader.load(function() {
        // Processar
        loader.loaded();  // Manual
    });
});
```

---

## 💡 Exemplos Completos

### Exemplo 1: Template Básico

```javascript
window.onload = function() {
    ebhtml.create2({}, function(loader) {
        loader.addData('D_NOTICIAS', false);
        loader.autoloaded = false;
        loader.nodataiserror = false;
        
        loader.load(function() {
            // Verificar dados
            if (loader.data('D_NOTICIAS') === undefined) {
                console.error('Sem dados');
                loader.finished();
                return;
            }
            
            // Processar
            var item = loader.data('D_NOTICIAS');
            var titulo = item.value('TITULO').value;
            var texto = item.value('TEXTO').value;
            
            // Renderizar
            var container = document.getElementById('container');
            container.innerHTML = '<h1>' + titulo + '</h1><p>' + texto + '</p>';
            
            // Notificar sucesso
            loader.loaded();
            
            // Finalizar após 5s
            setTimeout(function() {
                loader.finished();
            }, 5000);
        });
    });
};
```

### Exemplo 2: Múltiplos Datasets

```javascript
window.onload = function() {
    ebhtml.create2({}, function(loader) {
        loader.addData('D_NOTICIAS', false);
        loader.addData('D_ALERTAS', false);
        loader.addData('D_CLIMA', false);
        loader.autoloaded = false;
        loader.nodataiserror = false;
        
        loader.load(function() {
            // Processar cada dataset
            var noticias = processarDataset(loader, 'D_NOTICIAS');
            var alertas = processarDataset(loader, 'D_ALERTAS');
            var clima = processarDataset(loader, 'D_CLIMA');
            
            // Renderizar layout completo
            renderizarTemplate({
                noticias: noticias,
                alertas: alertas,
                clima: clima
            }, loader);
        });
    });
};

function processarDataset(loader, nome) {
    var lista = [];
    var dataset = loader.datalist(nome);
    
    if (!dataset || dataset.count() === 0) {
        return lista;
    }
    
    for (var i = 0; i < dataset.count(); i++) {
        var item = dataset.get(i);
        lista.push({
            TITULO: item.value('TITULO') ? item.value('TITULO').value : '',
            TEXTO: item.value('TEXTO') ? item.value('TEXTO').value : ''
        });
    }
    
    return lista;
}

function renderizarTemplate(dados, loader) {
    var container = document.getElementById('container');
    var html = '';
    
    // Renderizar noticias
    if (dados.noticias.length > 0) {
        html += '<div class="noticias">';
        for (var i = 0; i < dados.noticias.length; i++) {
            html += '<h2>' + dados.noticias[i].TITULO + '</h2>';
        }
        html += '</div>';
    }
    
    container.innerHTML = html;
    
    loader.loaded();
    setTimeout(function() { loader.finished(); }, 8000);
}
```

### Exemplo 3: Tratamento de Erros

```javascript
window.onload = function() {
    ebhtml.create2({
        log: function(msg) {
            console.log('[EBHTML]', msg);
        }
    }, function(loader) {
        loader.addData('D_NOTICIAS', true);  // Obrigatório
        loader.autoloaded = false;
        
        loader.load(
            function() {
                try {
                    // Processar dados
                    var dados = processarDados(loader);
                    renderizar(dados);
                    
                    loader.loaded();
                    setTimeout(function() {
                        loader.finished();
                    }, 5000);
                    
                } catch (erro) {
                    console.error('Erro ao processar:', erro);
                    loader.finished();  // NÃO chame loaded()
                }
            },
            function(erro) {
                console.error('Erro ao carregar:', erro);
                loader.error('Falha no carregamento: ' + erro);
            }
        );
    });
};
```

---

## 📚 Recursos Adicionais

- **[docs/01-getting-started.md](01-getting-started.md)** - Tutorial completo
- **[docs/02-xml-format.md](02-xml-format.md)** - Estrutura de dados XML
- **[docs/04-troubleshooting.md](04-troubleshooting.md)** - Problemas comuns
- **[GLOSSARY.md](../GLOSSARY.md)** - Glossário de termos

---

**Versão:** EBHTML 2.0.3  
**Última atualização:** 06/02/2026
