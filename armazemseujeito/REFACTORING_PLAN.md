# PLANO DE REFATORAÇÃO - armazemseujeito
## Digital Signage Retail - Template Genérico

Objetivo: Transformar em template reutilizável, totalmente configurável, responsivo para múltiplos formatos de tela, com suporte a diversas condições de preço dinâmicas.

---

## 📋 FASE 1: Refatoração de Responsividade e Breakpoints (Semana 1)

### Objetivo
Implementar verdadeiro suporte responsivo para formatos comuns de digital signage sem CSS inline.

### O que fazer

#### 1.1 Expandir tailwind.config.js com breakpoints por aspect-ratio
- Adicionar screens para: portrait (≤3:4), square (1:1), landscape (4:3 a 2:1), ultrawide (≥3:1)
- Remover hardcodes tipo `text-[4.5vh]` e `landscape:text-[2vw]`
- Usar classes Tailwind responsivas: `portrait:text-lg landscape:text-xl ultrawide:text-2xl`

#### 1.2 Refatorar HTML com grid layout fluido
- Substituir fixed heights (`h-[38vh]`, `h-[14vh]`) por valores responsivos
- Usar `space-y-` e `gap-` do Tailwind para espaçamento
- Remover ids de debug tipo `size` do HTML final

#### 1.3 Criar arquivo CSS custom (input.css) com animações genéricas
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Animações reutilizáveis */
@layer components {
  .price-pulse { @apply animate-pulseScaleWithDelay; }
  .fade-in { @apply opacity-100 transition-opacity duration-500; }
  .slide-left { @apply translate-x-0 transition-transform duration-1000; }
}
```

#### 1.4 Adicionar suporte a fundos videografados
- Manter vídeo como background, mas deixar configurável em js
- Adicionar fallback de imagem estática

---

## 📋 FASE 2: Sistema de Configuração Centralizado (Semana 1-2)

### Objetivo
Criar arquivo `config.js` que centralize todas as regras de comportamento e estilo do template.

### O que fazer

#### 2.1 Criar `js/config.js`
```javascript
var TEMPLATE_CONFIG = {
  // Duração e timing
  timing: {
    displayDuration: 15000,      // ms
    fadeInDuration: 500,
    fadeOutDuration: 500,
    imageLoadTimeout: 10000
  },
  
  // Fonte e tipografia
  typography: {
    fontFamily: 'gotham-ultra',
    titleMaxSize: 48,
    priceMaxSize: 64,
    unitMaxSize: 24,
    minFontSize: 12
  },
  
  // Cores e estilos
  styles: {
    backgroundColor: '#ffffff',
    titleColor: '#000000',
    priceColor: '#dc2626',     // red-600
    unitColor: '#6b7280',      // gray-500
    legacyTextColor: '#666666'
  },
  
  // Condições de preço suportadas
  priceConditions: {
    REGULAR: 'template_regular',
    'DE-POR': 'template_depor',
    'LEVE3PAGUE1': 'template_leve3',
    'CLUBE': 'template_clube',
    'OFERTA': 'template_oferta'
  },
  
  // Texto customizável
  labels: {
    from: 'DE',
    for: 'POR',
    each: 'Cada',
    unit: 'Un.'
  },
  
  // Animações
  animations: {
    priceAnimation: 'price-pulse',
    enterAnimation: 'fade-in-slide-left',
    exitAnimation: 'fade-out'
  }
};
```

#### 2.2 Criar `js/defaults.js` com valores fallback para cada aspecto
- Cores adaptáveis por tema (light, dark, premium, economy)
- Durações por tipo de loop
- Breakpoints por aspecto

#### 2.3 Adicionar sistema de override via dados
- Servidor pode enviar `CONFIG_OVERRIDE` no dataset para customizar tudo
- Fallback seguro para valores default

---

## 📋 FASE 3: Sistema de Templates Dinâmicos (Semana 2)

### Objetivo
Implementar engine robusto de seleção de template baseado em condição de preço, sem lógica duplicada.

### O que fazer

#### 3.1 Definir estrutura de template HTML modular
```html
<!-- TEMPLATES DINÂMICOS - um para cada condição de preço -->
<template id="tpl_regular">
  <!-- Preço simples: R$ 9,99 cada -->
</template>

<template id="tpl_depor">
  <!-- Preço "de-por": DE R$ 19,99 | POR R$ 9,99 -->
</template>

<template id="tpl_leve3">
  <!-- Promoção "Leve 3 pague 1": COM 3 ITENS = R$ 9,99 CADA -->
</template>

<template id="tpl_clube">
  <!-- Preço clube: CLUBE: R$ 7,99 (vs regular R$ 9,99) -->
</template>

<template id="tpl_oferta">
  <!-- Oferta relâmpago: OFERTA! R$ 5,99 (duração limitada) -->
</template>
```

#### 3.2 Criar engine de seleção de template em master.js
```javascript
function selectTemplateID(priceConditionType) {
  var conditionType = String(priceConditionType || '').toUpperCase();
  var templateId = TEMPLATE_CONFIG.priceConditions[conditionType];
  if (!templateId) {
    templateId = TEMPLATE_CONFIG.priceConditions.REGULAR; // fallback
  }
  return templateId;
}

function renderPriceTemplate(dataSource, selectedTemplateId) {
  // Clonar template
  // Preencher campos dinamicamente
  // Aplicar valores do config
}
```

#### 3.3 Suportar campos dinâmicos por template
Cada template pode ter diferentes campos esperados:
- REGULAR: PRICE, TEXTO4 (unidade)
- DE-POR: PRICE, PRICE2, TEXTO4
- LEVE3PAGUE1: PRICE, TEXTO_PROMO (mensagem customizada)
- CLUBE: PRICE, PRICE_REGULAR (preço não-memberso), TEXTO_CLUB (label customizado)

---

## 📋 FASE 4: Auto-Fit de Texto Avançado (Semana 2-3)

### Objetivo
Implementar algoritmo robusto e configurável de ajuste de texto para múltiplas linhas, truncagem e reflow.

### O que fazer

#### 4.1 Melhorar função `fitDescriptionFont` em master.js
```javascript
function fitTextToContainer(textDiv, containerDiv, options) {
  var opts = options || {};
  var minFontSize = opts.minFontSize || 12;
  var maxFontSize = opts.maxFontSize || 48;
  var maxLines = opts.maxLines || 3;
  var truncate = opts.truncate || false;
  
  // Lógica:
  // 1. Se cabe em 1 linha com maxFontSize: OK
  // 2. Se não cabe, reduzir fontSize até minFontSize
  // 3. Se ainda não cabe: truncar com "..." ou quebrar linhas
  // 4. Validar scrollHeight vs offsetHeight
}
```

#### 4.2 Suportar truncagem inteligente
- Se texto não couber mesmo em minFontSize: adicionar "..."
- Preservar palavras inteiras (não cortar no meio)

#### 4.3 Testar em múltiplos aspect-ratios
- portrait: 9:16, 1:2
- landscape: 16:9, 2:1
- ultrawide: 3:1, 4:1, 5:1

---

## 📋 FASE 5: Biblioteca de Animações Expandida (Semana 3)

### Objetivo
Criar suite de animações reutilizáveis via Tailwind, configuráveis por condição de preço.

### O que fazer

#### 5.1 Expandir keyframes em tailwind.config.js
```javascript
keyframes: {
  pulseScaleWithDelay: { /* existente */ },
  wiggle: { /* existente */ },
  
  // Novas animações
  slideInLeft: { /* from translateX(-100%) to 0 */ },
  slideOutRight: { /* from 0 to translateX(100%) */ },
  popIn: { /* from scale(0) to scale(1) */ },
  fadeInUp: { /* from opacity-0 translateY(10px) to opacity-100 */ },
  marquee: { /* scroll contínuo */ },
  heartbeat: { /* pulse cardíaco */ },
  pulse3x: { /* pulse 3 vezes e para */ }
}
```

#### 5.2 Mapear animações a condições de preço
- REGULAR: pulseScale calmo
- OFERTA: heartbeat rápido (urgência)
- LEVE3PAGUE1: slideIn + popIn (destaque)
- CLUBE: fadeInUp (elegância)

#### 5.3 Fazer animações configuráveis via config.js
Permitir override de keyframes por cliente.

---

## 📋 FASE 6: Validação de Dados e Tratamento de Erros (Semana 3)

### Objetivo
Implementar validação robusta de payload e tratamento gracioso de erros.

### O que fazer

#### 6.1 Criar validador em js/validator.js
```javascript
function validatePricePayload(dataSource) {
  // Validar campos obrigatórios: TITULO, FOTO, PRICE
  // Validar tipos: PRICE deve ser número, TEXTO3 deve estar em lista conhecida
  // Retornar { valid: true/false, errors: [] }
}
```

#### 6.2 Implementar fallbacks
- Se FOTO falhar: mostrar gradiente estático
- Se PRICE vazio: mostrar "CONTATE"
- Se TITULO vazio: mostrar "PRODUTO"

#### 6.3 Logs estruturados
- Sem console.log tóxico, apenas warnings importantes
- Debug mode ativável via config

---

## 📋 FASE 7: Documentação Completa (Semana 3-4)

### Objetivo
Documentação técnica, exemplos de payload e guia de uso para múltiplos clients.

### O que fazer

#### 7.1 README.md expandido
- Objetivo e casos de uso
- Formatos de tela suportados com diagrama
- Condições de preço suportadas
- Configuração básica vs avançada

#### 7.2 CONFIGURATION.md
- Todos os campos de TEMPLATE_CONFIG explicados
- Exemplos de customização por cliente
- Como fazer override via dataset

#### 7.3 PRICE_CONDITIONS.md
- Explicar cada tipo de condição
- Campos esperados para cada tipo
- Exemplos de payload JSON

#### 7.4 EXAMPLES.md
- 5-10 payloads reais de diferentes tipos
- Screenshots esperadas para cada
- Como testar com mock

---

## 🎯 Estrutura de Arquivos Proposta

```
armazemseujeito/
├── index.html              # HTML limpo, 100% Tailwind
├── package.json
├── tailwind.config.js      # Novo: breakpoints, animações expandidas
├── css/
│   ├── input.css           # Novo: custom classes, animações reutilizáveis
│   ├── master.css          # Compilado (gerado)
│   └── fonts/
├── js/
│   ├── ebhtml.js           # (sem mudança)
│   ├── config.js           # NOVO: configuração centralizada
│   ├── defaults.js         # NOVO: valores padrão por tema
│   ├── validator.js        # NOVO: validação de dados
│   ├── templates.js        # NOVO: engine de templates dinâmicos
│   ├── animations.js       # NOVO: engine de animações
│   ├── master.js           # Refatorado: mais limpo, usar config.js
│   ├── preview.js          # (sem mudança significativa)
│   └── mock-data.js        # Atualizado: exemplos de múltiplas condições
├── img/
│   └── products/
├── README.md               # Expandido
├── CONFIGURATION.md        # NOVO
├── PRICE_CONDITIONS.md     # NOVO
├── EXAMPLES.md             # NOVO
└── EXAMPLES.json           # NOVO: exemplo de payload v1-v5
```

---

## 📊 Timeline e Dependências

| Fase | Semana | Esforço | Bloqueadores |
|------|--------|---------|--------------|
| 1: Responsividade | 1 | M | Nenhum |
| 2: Config | 1-2 | M | Fase 1 |
| 3: Templates | 2 | M | Fase 2 |
| 4: Auto-fit | 2-3 | M | Fase 3 |
| 5: Animações | 3 | L | Fase 4 |
| 6: Validação | 3 | L | Fase 5 |
| 7: Docs | 3-4 | M | Todas |

---

## ✅ Critérios de Sucesso Finais

- [ ] Template funciona em 9:16, 1:1, 16:9, 2:1, 3:1 sem ajustes de código
- [ ] Suporta ≥5 tipos de condição de preço dinamicamente
- [ ] Texto auto-fit sem overflow em nenhum formato
- [ ] Zero CSS inline, 100% Tailwind + custom CSS classes
- [ ] Configuração total via config.js (cores, durações, labels, animações)
- [ ] Validação robusto de payload com mensagens de erro claras
- [ ] ≥10 exemplos de payload funcionando com mock
- [ ] Documentação pronta para onboarding de novo cliente em <5 min
- [ ] Sem ES6+ (ES5 puro para Android 7+)
- [ ] Carrega mock em <2s, produção em <3s
- [ ] Sem console errors nem warnings em dev tools

---

## 🚀 Próximos Passos

1. Você aprova o plano?
2. Começamos pela Fase 1 (Responsividade) ou prefere outra ordem?
3. Quer fazer tudo em paralelo ou sequencial?
