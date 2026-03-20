# 🎓 Conceitos Avançados - Templates EdgeContents

Técnicas avançadas para otimizar performance, criar animações complexas e gerenciar múltiplos datasets.

---

## 📋 Índice

1. [Múltiplos Datasets](#múltiplos-datasets)
2. [Animações Avançadas](#animações-avançadas)
3. [Performance e Otimização](#performance-e-otimização)
4. [Layouts Responsivos](#layouts-responsivos)
5. [Transições Entre Slides](#transições-entre-slides)
6. [Manipulação Avançada de Dados](#manipulação-avançada-de-dados)

---

## 📊 Múltiplos Datasets

### Carregar Vários Datasets

```javascript
ebhtml.create2({}, function(loader) {
    // Registrar múltiplos datasets
    loader.addData('D_NOTICIAS', false);    // Não obrigatório
    loader.addData('D_ALERTAS', true);      // Obrigatório
    loader.addData('D_CLIMA', false);
    loader.addData('D_AGENDA', false);
    
    loader.load(function() {
        // Processar cada dataset
        var noticias = processarDataset(loader, 'D_NOTICIAS');
        var alertas = processarDataset(loader, 'D_ALERTAS');
        var clima = processarDataset(loader, 'D_CLIMA');
        var agenda = processarDataset(loader, 'D_AGENDA');
        
        // Combinar dados
        renderizarTemplate({
            noticias: noticias,
            alertas: alertas,
            clima: clima,
            agenda: agenda
        }, loader);
    });
});

function processarDataset(loader, nome) {
    var lista = [];
    var dataset = loader.datalist(nome);
    
    if (!dataset || dataset.count() === 0) {
        return lista;  // Retorna vazio se não houver dados
    }
    
    for (var i = 0; i < dataset.count(); i++) {
        var item = dataset.get(i);
        lista.push({
            TITULO: item.value('TITULO').value,
            TEXTO: item.value('TEXTO').value
        });
    }
    
    return lista;
}
```

### Priorizar Datasets

```javascript
function renderizarComPrioridade(dados, loader) {
    var container = document.getElementById('container');
    
    // Prioridade: Alertas > Notícias > Clima
    if (dados.alertas && dados.alertas.length > 0) {
        renderizarAlertas(dados.alertas, container);
    } else if (dados.noticias && dados.noticias.length > 0) {
        renderizarNoticias(dados.noticias, container);
    } else if (dados.clima && dados.clima.length > 0) {
        renderizarClima(dados.clima, container);
    } else {
        renderizarFallback(container);
    }
    
    loader.loaded();
    setTimeout(function() { loader.finished(); }, 8000);
}
```

### Combinar Datasets em Layout

```javascript
function renderizarLayoutCompleto(dados, loader) {
    var html = '<div class="grid grid-cols-3 gap-4 w-full h-full p-8">';
    
    // Coluna 1: Notícias
    html += '<div class="col-span-2 space-y-4">';
    for (var i = 0; i < dados.noticias.length; i++) {
        html += renderizarNoticia(dados.noticias[i]);
    }
    html += '</div>';
    
    // Coluna 2: Alertas + Clima
    html += '<div class="space-y-4">';
    if (dados.alertas.length > 0) {
        html += renderizarAlertasSidebar(dados.alertas);
    }
    if (dados.clima.length > 0) {
        html += renderizarClimaSidebar(dados.clima[0]);
    }
    html += '</div>';
    
    html += '</div>';
    
    document.getElementById('container').innerHTML = html;
    loader.loaded();
}
```

---

## 🎬 Animações Avançadas

### Fade In/Out com Callback

```javascript
function fadeIn(elemento, duracao, callback) {
    elemento.style.opacity = '0';
    elemento.style.display = 'block';
    
    var inicio = Date.now();
    var timer = setInterval(function() {
        var tempo = Date.now() - inicio;
        var progresso = Math.min(tempo / duracao, 1);
        
        elemento.style.opacity = progresso;
        
        if (progresso >= 1) {
            clearInterval(timer);
            if (callback) callback();
        }
    }, 16);  // ~60fps
}

function fadeOut(elemento, duracao, callback) {
    var inicio = Date.now();
    var timer = setInterval(function() {
        var tempo = Date.now() - inicio;
        var progresso = Math.min(tempo / duracao, 1);
        
        elemento.style.opacity = 1 - progresso;
        
        if (progresso >= 1) {
            clearInterval(timer);
            elemento.style.display = 'none';
            if (callback) callback();
        }
    }, 16);
}

// Uso
var div = document.getElementById('conteudo');
fadeIn(div, 1000, function() {
    console.log('Fade in completo');
    
    setTimeout(function() {
        fadeOut(div, 1000, function() {
            console.log('Fade out completo');
        });
    }, 3000);
});
```

### Slideshow com Transições

```javascript
function criarSlideshowAvancado(dados, config, loader) {
    var container = document.getElementById('container');
    var indiceAtual = 0;
    var slideAtual = null;
    var proximoSlide = null;
    
    function criarSlide(item) {
        var div = document.createElement('div');
        div.className = 'absolute w-full h-full flex items-center justify-center opacity-0 transition-opacity duration-1000';
        div.style.backgroundColor = item.COR || '#1e293b';
        
        div.innerHTML = '<div class="text-center text-white p-12">' +
            '<h1 class="text-8xl font-bold mb-8">' + item.TITULO + '</h1>' +
            '<p class="text-4xl">' + item.TEXTO + '</p>' +
            '</div>';
        
        return div;
    }
    
    function mostrarProximo() {
        var item = dados[indiceAtual];
        proximoSlide = criarSlide(item);
        container.appendChild(proximoSlide);
        
        // Delay para permitir transição
        setTimeout(function() {
            proximoSlide.classList.remove('opacity-0');
            proximoSlide.classList.add('opacity-100');
            
            // Remove slide anterior
            if (slideAtual) {
                slideAtual.classList.remove('opacity-100');
                slideAtual.classList.add('opacity-0');
                
                setTimeout(function() {
                    if (slideAtual && slideAtual.parentNode) {
                        container.removeChild(slideAtual);
                    }
                }, 1000);  // Aguarda transição
            }
            
            slideAtual = proximoSlide;
        }, 50);
        
        indiceAtual = (indiceAtual + 1) % dados.length;
        
        if (indiceAtual > 0) {
            setTimeout(mostrarProximo, config.slideTime);
        } else {
            // Último slide - finalizar
            setTimeout(function() {
                loader.finished();
            }, config.slideTime);
        }
    }
    
    loader.loaded();
    mostrarProximo();
}
```

### Animações Keyframe Customizadas

```css
/* Adicione em css/input.css */

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutLeft {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(-100%);
        opacity: 0;
    }
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.slide-in-right {
    animation: slideInRight 1s ease-out;
}

.slide-out-left {
    animation: slideOutLeft 1s ease-in;
}

.pulse {
    animation: pulse 2s ease-in-out infinite;
}

.rotate {
    animation: rotate 3s linear infinite;
}
```

```javascript
// Uso em JavaScript
var titulo = document.getElementById('titulo');
titulo.classList.add('slide-in-right');

setTimeout(function() {
    titulo.classList.remove('slide-in-right');
    titulo.classList.add('slide-out-left');
}, 4000);
```

---

## ⚡ Performance e Otimização

### 1. Limitar Resolução de Imagens

```javascript
// Redimensionar imagens grandes
function otimizarImagem(url, maxWidth, maxHeight) {
    // Para EdgeContents, usar parâmetros de redimensionamento
    if (url.indexOf('uploads/') === 0) {
        return url + '?w=' + maxWidth + '&h=' + maxHeight;
    }
    return url;
}

var foto = item.value('FOTO1').value;
var fotoOtimizada = otimizarImagem(foto, 1920, 1080);
```

### 2. Lazy Loading de Imagens

```javascript
function carregarImagemLazy(elemento, url) {
    var img = new Image();
    img.onload = function() {
        elemento.src = url;
        elemento.classList.add('fade-in');
    };
    img.src = url;
}

// Uso
var imgElement = document.getElementById('foto');
carregarImagemLazy(imgElement, 'uploads/imagem.jpg');
```

### 3. Reutilizar Elementos DOM

```javascript
// ❌ RUIM - Cria novo HTML toda vez
function renderizarIneficiente(dados) {
    var html = '';
    for (var i = 0; i < dados.length; i++) {
        html += '<div>' + dados[i].TITULO + '</div>';
    }
    container.innerHTML = html;  // Recria todo DOM
}

// ✅ BOM - Reutiliza elementos
function renderizarEficiente(dados) {
    var divs = container.querySelectorAll('.item');
    
    for (var i = 0; i < dados.length; i++) {
        if (divs[i]) {
            // Atualiza elemento existente
            divs[i].textContent = dados[i].TITULO;
        } else {
            // Cria novo apenas se necessário
            var div = document.createElement('div');
            div.className = 'item';
            div.textContent = dados[i].TITULO;
            container.appendChild(div);
        }
    }
}
```

### 4. Debounce de Eventos

```javascript
function debounce(funcao, delay) {
    var timer;
    return function() {
        var contexto = this;
        var args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function() {
            funcao.apply(contexto, args);
        }, delay);
    };
}

// Uso
var atualizarTela = debounce(function() {
    console.log('Atualização executada');
}, 300);

// Chama múltiplas vezes mas executa apenas uma vez após 300ms
atualizarTela();
atualizarTela();
atualizarTela();
```

### 5. GPU Acceleration

```css
/* Use transform e opacity para animações (aceleradas por GPU) */
.animado {
    transform: translateZ(0);  /* Force GPU */
    will-change: transform, opacity;
}

/* ❌ EVITE (CPU-bound) */
.lento {
    animation: mover 2s;
}
@keyframes mover {
    from { left: 0; }
    to { left: 100px; }
}

/* ✅ PREFIRA (GPU-accelerated) */
.rapido {
    animation: moverGPU 2s;
}
@keyframes moverGPU {
    from { transform: translateX(0); }
    to { transform: translateX(100px); }
}
```

---

## 📱 Layouts Responsivos

### Media Queries para Diferentes Telas

```css
/* css/input.css */

/* Full HD 1920x1080 (padrão) */
.titulo-responsivo {
    font-size: 6rem;
}

/* 4K 3840x2160 */
@media (min-width: 2560px) {
    .titulo-responsivo {
        font-size: 12rem;
    }
}

/* HD 1280x720 */
@media (max-width: 1366px) {
    .titulo-responsivo {
        font-size: 4rem;
    }
}

/* Portrait (totens verticais) */
@media (orientation: portrait) {
    .layout-horizontal {
        flex-direction: column;
    }
    
    .titulo-responsivo {
        font-size: 5rem;
    }
}
```

### Detecção de Orientação em JS

```javascript
function detectarOrientacao() {
    var largura = window.innerWidth;
    var altura = window.innerHeight;
    
    if (largura > altura) {
        return 'landscape';  // Horizontal
    } else {
        return 'portrait';   // Vertical
    }
}

function ajustarLayout() {
    var orientacao = detectarOrientacao();
    var container = document.getElementById('container');
    
    if (orientacao === 'portrait') {
        container.classList.add('layout-vertical');
        container.classList.remove('layout-horizontal');
    } else {
        container.classList.add('layout-horizontal');
        container.classList.remove('layout-vertical');
    }
}

// Chamar ao carregar
window.onload = function() {
    ajustarLayout();
};
```

### Tamanhos Fluidos com clamp()

```css
.texto-fluido {
    /* min, preferencial, max */
    font-size: clamp(2rem, 5vw, 8rem);
    line-height: clamp(2.5rem, 6vw, 10rem);
}

.container-fluido {
    width: clamp(300px, 80%, 1200px);
    padding: clamp(1rem, 3vw, 4rem);
}
```

---

## 🔄 Transições Entre Slides

### Efeito Crossfade

```javascript
function crossfade(slideAnterior, proximoSlide, duracao) {
    proximoSlide.style.opacity = '0';
    proximoSlide.style.display = 'block';
    
    var inicio = Date.now();
    var timer = setInterval(function() {
        var tempo = Date.now() - inicio;
        var progresso = Math.min(tempo / duracao, 1);
        
        slideAnterior.style.opacity = 1 - progresso;
        proximoSlide.style.opacity = progresso;
        
        if (progresso >= 1) {
            clearInterval(timer);
            slideAnterior.style.display = 'none';
        }
    }, 16);
}
```

### Efeito Slide (Horizontal)

```javascript
function slideHorizontal(slideAnterior, proximoSlide, direcao, duracao) {
    var container = slideAnterior.parentNode;
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    
    proximoSlide.style.position = 'absolute';
    proximoSlide.style.top = '0';
    proximoSlide.style.left = (direcao === 'left' ? '100%' : '-100%');
    proximoSlide.style.display = 'block';
    
    var inicio = Date.now();
    var timer = setInterval(function() {
        var tempo = Date.now() - inicio;
        var progresso = Math.min(tempo / duracao, 1);
        
        var deslocamento = progresso * 100;
        
        if (direcao === 'left') {
            slideAnterior.style.left = '-' + deslocamento + '%';
            proximoSlide.style.left = (100 - deslocamento) + '%';
        } else {
            slideAnterior.style.left = deslocamento + '%';
            proximoSlide.style.left = '-' + (100 - deslocamento) + '%';
        }
        
        if (progresso >= 1) {
            clearInterval(timer);
            slideAnterior.style.display = 'none';
        }
    }, 16);
}
```

---

## 🔧 Manipulação Avançada de Dados

### Filtrar e Ordenar

```javascript
function processarDadosAvancado(loader) {
    var lista = [];
    var dataset = loader.datalist('D_NOTICIAS');
    
    // Carregar todos
    for (var i = 0; i < dataset.count(); i++) {
        var item = dataset.get(i);
        lista.push({
            TITULO: item.value('TITULO').value,
            PRIORIDADE: parseInt(item.value('PRIORIDADE').value, 10) || 5,
            DATA: item.value('DATA').value,
            ATIVO: item.value('ATIVO').value === 'true'
        });
    }
    
    // Filtrar apenas ativos
    var ativos = [];
    for (var j = 0; j < lista.length; j++) {
        if (lista[j].ATIVO) {
            ativos.push(lista[j]);
        }
    }
    
    // Ordenar por prioridade (menor = maior prioridade)
    ativos.sort(function(a, b) {
        return a.PRIORIDADE - b.PRIORIDADE;
    });
    
    // Limitar a 10 itens
    return ativos.slice(0, 10);
}
```

### Agrupar por Categoria

```javascript
function agruparPorCategoria(dados) {
    var grupos = {};
    
    for (var i = 0; i < dados.length; i++) {
        var item = dados[i];
        var categoria = item.CATEGORIA || 'Sem Categoria';
        
        if (!grupos[categoria]) {
            grupos[categoria] = [];
        }
        
        grupos[categoria].push(item);
    }
    
    return grupos;
}

// Uso
var dados = processarDados(loader);
var agrupados = agruparPorCategoria(dados);

// Renderizar por categoria
for (var cat in agrupados) {
    if (agrupados.hasOwnProperty(cat)) {
        console.log('Categoria:', cat);
        console.log('Itens:', agrupados[cat].length);
    }
}
```

### Cache de Dados

```javascript
var cache = {};

function carregarComCache(loader, datasetNome) {
    // Verificar cache
    if (cache[datasetNome]) {
        console.log('Usando cache para', datasetNome);
        return cache[datasetNome];
    }
    
    // Carregar e cachear
    var dados = processarDataset(loader, datasetNome);
    cache[datasetNome] = dados;
    
    return dados;
}
```

---

## 📚 Próximos Passos

- **[docs/04-troubleshooting.md](04-troubleshooting.md)** - Resolver problemas de performance
- **[docs/05-api-reference.md](05-api-reference.md)** - Referência completa da API
- **[GLOSSARY.md](GLOSSARY.md)** - Glossário de termos

---

**Última atualização:** 06/02/2026
