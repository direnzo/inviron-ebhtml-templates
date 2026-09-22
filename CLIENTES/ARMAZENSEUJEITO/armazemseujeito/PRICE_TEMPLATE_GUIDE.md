# Guia de Customização: Templates de Preço

## 📋 Objetivo

Permitir **total controle visual** sobre como os preços são exibidos, suportando:
- Preços simples (R$ 99,99)
- Preços grandes (R$ 999.999,99)
- Símbolo, inteiro, decimais, unidade em **tamanhos diferentes**
- Múltiplos layouts (regular, de/por, leve3pague1, clube, oferta)
- Customização **100%** via HTML + config.js

---

## 🏗️ Estrutura de Preço

### Partes de um Preço

```
R$ 1.234,56 kg
│  │         │
│  │         └── UNIT (unidade: kg, l, un, etc)
│  └─────────── INTEGER (inteiro com separador de milhares: 1.234)
└────────────── SYMBOL (símbolo: R$)

Decimais aparecem em tamanho menor acima da unidade:
    ,56
    kg
```

### Data-Attributes (Sistema de Slots)

Cada template usa `data-price-part` para identificar elementos:

```html
<div data-price-part="symbol">R$</div>        <!-- Símbolo -->
<div data-price-part="integer"></div>         <!-- Inteiro com separador (ex: 1.234) -->
<div data-price-part="decimal"></div>         <!-- Decimais (ex: ,56) -->
<div data-price-part="unit"></div>            <!-- Unidade (ex: kg) -->
<div data-price-part="old-price"></div>       <!-- Preço antigo (apenas de/por) -->
```

---

## 💡 Exemplos de Customização

### Exemplo 1: Layout Simples (Padrão)

```html
<template id="template_regular">
    <div class="w-full flex flex-row items-end justify-center gap-2">
        <!-- Símbolo pequeno -->
        <div data-price-part="symbol" class="text-[80%]">R$</div>
        
        <!-- Inteiro grande -->
        <div data-price-part="integer" class="text-[240%] font-bold"></div>
        
        <!-- Decimais pequenos acima da unidade -->
        <div class="flex flex-col">
            <div data-price-part="decimal" class="text-[100%]">
                <span>,</span><span></span>
            </div>
            <div data-price-part="unit" class="text-[50%]"></div>
        </div>
    </div>
</template>
```

**Resultado:**
```
      R$  1.234       <- classe text-[80%] e text-[240%]
               ,56 kg  <- classes text-[100%] e text-[50%]
```

---

### Exemplo 2: Layout Com Ênfase em Decimais

```html
<template id="template_premium">
    <div class="flex flex-col items-center">
        <div class="flex flex-row items-baseline gap-2">
            <div data-price-part="symbol" class="text-[60%] font-light">R$</div>
            <div data-price-part="integer" class="text-[300%] font-black"></div>
            <div data-price-part="decimal" class="text-[180%] font-bold flex flex-col">
                <span class="text-[50%]">,</span>
                <span></span>
            </div>
        </div>
        <div data-price-part="unit" class="text-[40%] uppercase tracking-widest"></div>
    </div>
</template>
```

**Resultado:**
```
        R$ 1.234
             ,
             56
            KG
```

---

### Exemplo 3: Layout Horizontal (Ultra-Wide)

```html
<template id="template_ultrawide">
    <div class="flex flex-row items-center gap-8 justify-center">
        <div class="flex flex-row items-baseline">
            <div data-price-part="symbol" class="text-[100%]">R$</div>
            <div data-price-part="integer" class="text-[350%] font-black ml-4"></div>
            <div data-price-part="decimal" class="text-[120%] ml-2">
                <span class="text-[60%]">,</span>
                <span></span>
            </div>
        </div>
        <div data-price-part="unit" class="text-[80%] font-bold italic"></div>
    </div>
</template>
```

**Resultado:**
```
    R$  1.234 ,56  KG          <- tudo em uma linha
```

---

### Exemplo 4: Layout De/Por (Promocional)

```html
<template id="template_depor_custom">
    <div class="flex flex-col gap-4">
        <!-- PREÇO ANTIGO -->
        <div class="flex flex-row items-center gap-2">
            <span class="text-[50%]">DE</span>
            <span class="text-[40%]">R$</span>
            <div data-price-part="old-price" class="line-through text-[80%] text-gray">
                <span></span>
            </div>
        </div>
        
        <!-- PREÇO NOVO - DESTAQUE -->
        <div class="bg-yellow-300 p-4 rounded-lg">
            <div class="flex flex-row items-center gap-3">
                <span class="text-[70%] font-bold">POR APENAS</span>
                <span class="text-[60%] font-bold">R$</span>
                <div data-price-part="integer" class="text-[280%] font-black"></div>
                <div data-price-part="decimal" class="text-[120%]">
                    <span class="text-[70%]">,</span>
                    <span></span>
                </div>
            </div>
            <div data-price-part="unit" class="text-[50%] text-right mt-2"></div>
        </div>
    </div>
</template>
```

**Resultado:**
```
    DE  R$  999,99
    
    ╭────────────────╮
    │ POR APENAS     │
    │     R$ 1.234   │
    │           ,56  │
    │           KG   │
    ╰────────────────╯
```

---

## 🔧 Como Adicionar Novo Template

### Passo 1: Criar HTML Template

Adicionar novo `<template>` em `index.html`:

```html
<template id="template_leve3pague2">
    <div class="w-full flex flex-col items-center gap-2 bg-green-500 p-4 rounded">
        <span class="text-white text-[60%]">LEVE 3 E PAGUE 2</span>
        
        <div class="flex flex-row items-baseline gap-2">
            <div data-price-part="symbol" class="text-[70%] text-white">R$</div>
            <div data-price-part="integer" class="text-[280%] font-bold text-white"></div>
            <div data-price-part="decimal" class="text-[100%] text-white">
                <span>,</span><span></span>
            </div>
        </div>
        
        <div data-price-part="unit" class="text-[50%] text-white uppercase"></div>
    </div>
</template>
```

### Passo 2: Registrar no Seletor (master.js)

Modificar `setupPriceTemplate()` para detectar a condição:

```javascript
function setupPriceTemplate(dataSource) {
    var texto3 = getField(dataSource, 'TEXTO3').toUpperCase();
    
    // Selecionar template por texto3
    var templateMap = {
        'REGULAR': 'template_regular',
        'DEPOR': 'template_depor',
        'LEVE3PAGUE2': 'template_leve3pague2',
        'CLUBE': 'template_clube',
        'OFERTA': 'template_oferta'
    };
    
    var templateId = templateMap[texto3] || 'template_regular';
    // ... resto do código
}
```

### Passo 3: Fornecer Dados via CMS

```xml
<!-- D_MENUBOARD_PRICES dataset -->
<item>
    <TITULO>Maçã Gala</TITULO>
    <FOTO>img/maca.jpg</FOTO>
    <PRICE>12.50</PRICE>
    <PRICE2></PRICE2>
    <TEXTO3>LEVE3PAGUE2</TEXTO3>
    <TEXTO4>kg</TEXTO4>
    <TEXTO5>Promoção válida...</TEXTO5>
</item>
```

---

## 📏 Classes Tailwind Frequentes para Sizing

| Classe | Usar para |
|--------|-----------|
| `text-[50%]` | Unidade, rótulos pequenos |
| `text-[70%]` | Símbolo, labels medianos |
| `text-[100%]` | Decimais, tamanho base |
| `text-[180%]` | Decimais com ênfase |
| `text-[240%]` | Inteiro padrão |
| `text-[280%]` | Inteiro grande |
| `text-[300%]` ou + | Preço em destaque destaque |

---

## 🎯 Renderização em JS (Automática)

A função `formatPrice()` faz automaticamente:

```javascript
// Input: "1234.50"
// Output:
{
    integer: "1.234",      // Com separador de milhares
    decimal: "50",         // Sempre 2 dígitos
    full: "1.234,50"       // Completo
}
```

A função `setupPriceTemplate()` coloca cada parte no lugar certo usando `data-price-part`.

---

## ✅ Checklist de Customização

- [ ] Template define `data-price-part` para cada elemento
- [ ] Classes Tailwind aplicadas para tamanho/cor/posição
- [ ] Decimais estão dentro de elemento com `<span>` para inserção separada
- [ ] Template registrado em `templateMap` ou auto-selecionado
- [ ] Dados (TEXTO3 = tipo de preço) informados pelo CMS
- [ ] Testado em múltiplos preços (99, 1.234,50, 10.000,99)
- [ ] Design validado no layout (portrait, landscape, ultrawide)

---

## 🚀 Próximos Passos

1. **Phase 1**: Adaptar templates para múltiplos aspect ratios (portrait, landscape, ultrawide)
2. **Phase 2**: Mover tamanhos/cores para `config.js`
3. **Phase 3**: Adicionar 5+ templates de preço (leve3pague2, clube, oferta, etc)
