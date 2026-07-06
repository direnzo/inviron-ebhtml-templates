# Microfuncoes Reutilizaveis (ES5)

Guia oficial para criar templates organizados, componiveis e de facil refatoracao.

Objetivo:
- padronizar microfuncoes genericas
- reduzir duplicacao entre templates
- manter JS focado em dados/comportamento
- acelerar criacao de novos templates

---

## 1. Principios

1. Uma responsabilidade por funcao.
2. Assinatura simples: entrada clara, retorno claro.
3. Fallback obrigatorio para entradas invalidas.
4. Sem efeito colateral oculto.
5. Sem dependencia de layout especifico quando puder ser generica.
6. ES5 puro (compatibilidade Android 7+ / Chromium 78).

---

## 2. Convencao de assinatura

Padrao recomendado:

```javascript
function nomeDaFuncao(arg1, arg2, options) {
    // ...
    return {
        ok: true,
        reason: '',
        data: null
    };
}
```

Padrao de retorno:
- ok: boolean
- reason: motivo de fallback/erro (quando existir)
- data: payload util para composicao

---

## 3. Catalogo base (nucleo)

## 3.1 Dados e validacao

### getField(item, fieldName, fallback)
Uso: obter campo de item EBHTML com fallback seguro.

```javascript
function getField(item, fieldName, fallback) {
    var value = fallback;
    if (!item || !fieldName || typeof item.value !== 'function') {
        return value;
    }

    try {
        var node = item.value(fieldName);
        if (node && typeof node.value !== 'undefined' && node.value !== null && node.value !== '') {
            return (node.value + '').trim();
        }
    } catch (e1) {}

    try {
        var nodeLower = item.value((fieldName + '').toLowerCase());
        if (nodeLower && typeof nodeLower.value !== 'undefined' && nodeLower.value !== null && nodeLower.value !== '') {
            return (nodeLower.value + '').trim();
        }
    } catch (e2) {}

    return value;
}
```

### parseNumber(value, fallback)
Uso: converter texto em numero com seguranca.

```javascript
function parseNumber(value, fallback) {
    var n = parseFloat((value + '').replace(',', '.'));
    return isNaN(n) ? fallback : n;
}
```

### parseMoney(value, fallback)
Uso: normalizar preco para formato decimal padrao.

```javascript
function parseMoney(value, fallback) {
    var raw = (value == null ? '' : value + '').replace(/\s+/g, '');
    if (!raw) { return fallback; }
    raw = raw.replace(/\./g, '').replace(',', '.');
    var n = parseFloat(raw);
    if (isNaN(n)) { return fallback; }
    return n.toFixed(2);
}
```

### normalizeUrl(url, basePath)
Uso: montar URL final consistente.

```javascript
function normalizeUrl(url, basePath) {
    var u = (url || '') + '';
    if (!u) { return ''; }
    if (/^https?:\/\//i.test(u)) { return u; }
    if (u.indexOf('/') === 0) { return u; }
    return (basePath || '') + u;
}
```

### isVideoFile(url)
Uso: detectar midia de video por extensao.

```javascript
function isVideoFile(url) {
    return /\.(mp4|webm|mov|m4v|avi|ogv)(\?|#|$)/i.test((url || '') + '');
}
```

---

## 3.2 Midia e visual

### applyBackground(targetEl, mediaUrl, options)
Uso: aplicar background de imagem/video com fallback.

```javascript
function applyBackground(targetEl, mediaUrl, options) {
    var opts = options || {};
    var fallbackImage = opts.fallbackImage || '';
    var result = { ok: false, reason: '', data: { mediaType: 'none', appliedUrl: '' } };

    if (!targetEl) {
        result.reason = 'target-missing';
        return result;
    }

    var url = mediaUrl || fallbackImage;
    if (!url) {
        result.reason = 'media-missing';
        return result;
    }

    if (isVideoFile(url)) {
        result.ok = true;
        result.data.mediaType = 'video';
        result.data.appliedUrl = url;
        result.reason = 'video-requires-applyVideo';
        return result;
    }

    targetEl.style.backgroundImage = 'url("' + url + '")';
    targetEl.style.backgroundPosition = 'center center';
    targetEl.style.backgroundSize = opts.objectFit || 'cover';
    targetEl.style.backgroundRepeat = 'no-repeat';

    result.ok = true;
    result.data.mediaType = 'image';
    result.data.appliedUrl = url;
    return result;
}
```

### applyImage(imgEl, imageUrl, fallbackUrl)
Uso: preencher img de forma segura.

```javascript
function applyImage(imgEl, imageUrl, fallbackUrl) {
    if (!imgEl) { return { ok: false, reason: 'img-missing', data: null }; }

    var url = imageUrl || fallbackUrl || '';
    if (!url) { return { ok: false, reason: 'url-missing', data: null }; }

    imgEl.src = url;
    return { ok: true, reason: '', data: { appliedUrl: url } };
}
```

### applyVideo(videoEl, videoUrl, options)
Uso: aplicar video com fallback e eventos de seguranca.

```javascript
function applyVideo(videoEl, videoUrl, options) {
    var opts = options || {};
    var fallbackImageEl = opts.fallbackImageEl || null;
    var fallbackImageUrl = opts.fallbackImageUrl || '';

    if (!videoEl || !videoUrl) {
        return { ok: false, reason: 'video-missing', data: null };
    }

    var canPlay = false;
    try {
        canPlay = !!(videoEl.canPlayType && videoEl.canPlayType('video/mp4') !== '');
    } catch (e) {
        canPlay = false;
    }

    if (!canPlay) {
        if (fallbackImageEl && fallbackImageUrl) {
            applyImage(fallbackImageEl, fallbackImageUrl, fallbackImageUrl);
        }
        return { ok: false, reason: 'video-unsupported', data: null };
    }

    videoEl.muted = true;
    videoEl.setAttribute('muted', 'muted');
    videoEl.setAttribute('playsinline', 'playsinline');
    videoEl.setAttribute('autoplay', 'autoplay');

    videoEl.onended = opts.onEnded || null;
    videoEl.onerror = opts.onError || null;
    videoEl.onabort = opts.onAbort || null;
    videoEl.onstalled = opts.onStalled || null;

    videoEl.src = videoUrl;
    videoEl.load();
    try { videoEl.play(); } catch (e2) {}

    return { ok: true, reason: '', data: { appliedUrl: videoUrl } };
}
```

---

## 3.3 Conteudo e formato

### applyText(targetEl, value, fallback)
Uso: preencher texto com fallback.

```javascript
function applyText(targetEl, value, fallback) {
    if (!targetEl) { return { ok: false, reason: 'target-missing', data: null }; }
    var finalValue = (value == null || value === '') ? (fallback || '') : (value + '');
    targetEl.textContent = finalValue;
    return { ok: true, reason: '', data: { value: finalValue } };
}
```

### applyPrice(targetEl, priceValue, options)
Uso: montar valor monetario em layout especifico.

```javascript
function applyPrice(targetEl, priceValue, options) {
    var opts = options || {};
    var currency = opts.currency || 'R$';
    var fallback = opts.fallback || '0.00';

    if (!targetEl) { return { ok: false, reason: 'target-missing', data: null }; }

    var normalized = parseMoney(priceValue, fallback);
    var parts = normalized.split('.');
    var inteiro = parts[0] || '0';
    var decimal = parts[1] || '00';

    // Estrutura semantica deve existir no HTML:
    // .price-currency, .price-int, .price-dec
    var elCurrency = targetEl.querySelector('.price-currency');
    var elInt = targetEl.querySelector('.price-int');
    var elDec = targetEl.querySelector('.price-dec');

    if (elCurrency) { elCurrency.textContent = currency; }
    if (elInt) { elInt.textContent = inteiro; }
    if (elDec) { elDec.textContent = decimal; }

    return { ok: true, reason: '', data: { valueNormalized: normalized } };
}
```

### applyDate(targetEl, dateValue, options)
Uso: formatar data para exibicao.

```javascript
function applyDate(targetEl, dateValue, options) {
    var opts = options || {};
    var fallback = opts.fallback || '';
    if (!targetEl) { return { ok: false, reason: 'target-missing', data: null }; }
    if (!dateValue) {
        targetEl.textContent = fallback;
        return { ok: false, reason: 'date-missing', data: { value: fallback } };
    }
    targetEl.textContent = dateValue + '';
    return { ok: true, reason: '', data: { value: dateValue + '' } };
}
```

---

## 3.4 Fluxo e robustez

### scheduleFinish(loader, durationMs)

```javascript
function scheduleFinish(loader, durationMs) {
    var ms = durationMs > 0 ? durationMs : 10000;
    return setTimeout(function() {
        if (loader && typeof loader.finished === 'function') {
            loader.finished();
        }
    }, ms);
}
```

### finishWithError(loader, reason)

```javascript
function finishWithError(loader, reason) {
    if (typeof console !== 'undefined' && console && console.error) {
        console.error('[Template] Erro:', reason || 'unknown');
    }
    if (loader && typeof loader.finished === 'function') {
        loader.finished();
    }
}
```

### runSafely(fn, onError)

```javascript
function runSafely(fn, onError) {
    try {
        fn();
        return { ok: true, reason: '', data: null };
    } catch (e) {
        if (onError) { onError(e); }
        return { ok: false, reason: 'exception', data: e };
    }
}
```

### createWatchdog(timeoutMs, onTimeout)

```javascript
function createWatchdog(timeoutMs, onTimeout) {
    var ms = timeoutMs > 0 ? timeoutMs : 30000;
    var id = setTimeout(function() {
        if (onTimeout) { onTimeout(); }
    }, ms);

    return {
        stop: function() {
            clearTimeout(id);
        }
    };
}
```

---

## 3.5 Performance e animacao

### createDeviceProfile()

```javascript
function createDeviceProfile() {
    var ua = (navigator.userAgent || '').toLowerCase();
    var isAndroid = ua.indexOf('android') !== -1;
    var androidVersion = 999;
    var m = ua.match(/android\s([0-9]+)/);
    if (m && m[1]) {
        androidVersion = parseInt(m[1], 10);
        if (isNaN(androidVersion)) { androidVersion = 999; }
    }

    var lowCpu = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4;
    var lowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory > 0 && navigator.deviceMemory <= 2;

    return {
        isAndroid: isAndroid,
        androidVersion: androidVersion,
        isOldAndroid: isAndroid && androidVersion <= 8,
        lowCpu: lowCpu,
        lowMemory: lowMemory,
        reduced: (isAndroid && androidVersion <= 8) || lowCpu || lowMemory
    };
}
```

### applyAnimationProfile(profile, rootEl)

```javascript
function applyAnimationProfile(profile, rootEl) {
    var el = rootEl || document.documentElement;
    if (!el) { return; }

    var current = el.className || '';
    current = current.replace(/\banim-full\b/g, '').replace(/\banim-lite\b/g, '').replace(/\banim-off\b/g, '');

    if (profile === 'off') {
        el.className = (current + ' anim-off').replace(/^\s+|\s+$/g, '');
    } else if (profile === 'lite') {
        el.className = (current + ' anim-lite').replace(/^\s+|\s+$/g, '');
    } else {
        el.className = (current + ' anim-full').replace(/^\s+|\s+$/g, '');
    }
}
```

---

## 3.6 Preview e paridade de comportamento

Objetivo:
- usar a mesma pipeline de render do runtime no preview
- mudar apenas a origem dos dados (formulario/browser)

Regra obrigatoria:
- todo template deve ter preview.js
- preview.js nao deve duplicar regra de negocio do master.js

### getPreviewLoader(realLoader)
Uso: suprimir finished no modo preview, mantendo loaded quando aplicavel.

```javascript
function getPreviewLoader(realLoader) {
    return {
        loaded: function() {
            if (realLoader && typeof realLoader.loaded === 'function') {
                realLoader.loaded();
            }
        },
        finished: function() {
            // No preview nao encerramos automaticamente.
        }
    };
}
```

### extractParentPreviewData()
Uso: ler dados enviados pelo formulario no browser (frame pai).

```javascript
function extractParentPreviewData() {
    var parentRef = null;
    var data = null;

    try { parentRef = window.parent; } catch (e0) { parentRef = null; }
    if (!parentRef) { return null; }

    try {
        if (typeof parentRef.getTemplatePreviewData === 'function') {
            data = parentRef.getTemplatePreviewData();
        }
    } catch (e1) {}

    if (!data) {
        try { if (parentRef.templatePreviewData) { data = parentRef.templatePreviewData; } } catch (e2) {}
    }

    if (!data) {
        try { if (parentRef.TEMPLATE_PREVIEW_DATA) { data = parentRef.TEMPLATE_PREVIEW_DATA; } } catch (e3) {}
    }

    return data || null;
}
```

### adaptPreviewToRuntimeContract(previewData)
Uso: converter dados do formulario para o mesmo contrato usado pelo runtime.

```javascript
function adaptPreviewToRuntimeContract(previewData) {
    // Cada template define seu mapeamento minimo aqui,
    // sempre retornando o mesmo formato esperado pelo render principal.
    if (!previewData) { return null; }

    return {
        TITULO: previewData.TITULO || previewData.titulo || '',
        TEXTO: previewData.TEXTO || previewData.texto || '',
        FOTO1: previewData.FOTO1 || previewData.foto1 || '',
        PRECO: previewData.PRECO || previewData.preco || ''
    };
}
```

Fluxo recomendado de preview:
1. extrair dados do frame pai
2. adaptar para o contrato de runtime
3. chamar a mesma funcao de render/populacao usada no master
4. usar getPreviewLoader para manter visualizacao ativa
5. fallback para mock/dataset apenas se nao houver dados do formulario

---

## 4. Exemplo de composicao (sem montar HTML por string)

HTML semantico base:

```html
<main id="templateRoot" class="w-full h-full">
    <section aria-label="Destaque" class="p-6">
        <h1 id="titleEl" class="text-[1.4em] font-bold"></h1>
        <p id="descEl" class="text-[1em]"></p>
    </section>
    <section aria-label="Preco" id="priceEl">
        <span class="price-currency"></span>
        <span class="price-int"></span>
        <span class="price-dec"></span>
    </section>
</main>
```

Popular dados com microfuncoes:

```javascript
var titleEl = document.getElementById('titleEl');
var descEl = document.getElementById('descEl');
var priceEl = document.getElementById('priceEl');

applyText(titleEl, getField(item, 'TITULO', ''), 'Sem titulo');
applyText(descEl, getField(item, 'TEXTO', ''), '');
applyPrice(priceEl, getField(item, 'PRECO', ''), { currency: 'R$', fallback: '0.00' });
```

---

## 5. Lista de adocao para template novo

1. Criar HTML semantico completo primeiro.
2. Selecionar microfuncoes do nucleo.
3. Implementar apenas o que faltar como microfuncao nova realmente generica.
4. Manter JS focado em dados e ciclo EBHTML.
5. Validar fallback em dados vazios e modo reduzido.

Checklist minimo:
- getField
- applyText
- applyBackground
- scheduleFinish
- finishWithError
- runSafely
- applyPrice (quando houver preco)

---

## 6. Critérios para criar nova microfuncao

Criar nova microfuncao apenas se:
- sera usada em 2+ templates, ou
- remove duplicacao relevante, ou
- encapsula regra critica (compatibilidade, fallback, fluxo)

Nao criar microfuncao quando:
- regra e unica de um template especifico
- nome fica generico demais e sem clareza
- aumenta indirecao sem ganho real

---

## 7. Integracao com agentes

Todo agent deve:
- listar microfuncoes reutilizadas
- explicar microfuncoes novas propostas
- justificar por que sao genericas
- evitar montagem integral de HTML via JS
- entregar preview.js com paridade funcional ao runtime

Esse documento complementa o playbook principal em features-list.md.
