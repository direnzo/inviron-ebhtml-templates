# Plano: Criar Template de Exibição c2r_busdoor para Portas de Ônibus

## 🎯 Visão Geral

Construir um novo template que exiba informações dinâmicas de portas de ônibus (através da correspondência de dados entre D_LOCAL e D_OLHOVIVO) com um número gigante em fundo preto e rodapé branco fixo. O template fará referência cruzada entre ID/SCREEN_CUSTOMERID nos datasets, extrairá o valor TEXTO correspondente e renderizará responsivamente em 520×208px.

> **REGRA DE FONTES:** `font-size` base no `<body>` via `vmin` (ex: `text-[3.2vmin]`). Overrides apenas para superbanner/empena. Filhos usam **somente `em` ou `%`** — nunca `portrait:text-[X]`, `landscape:text-[X]` em elementos filhos.

---

## 📋 Passos de Implementação

### 1. Criar estrutura de diretório do template
Copiar [_template-base/](file:///c:/Users/direnzo/Documents/CLIENTES/_TEMPLATES/_template-base/) para `c2r_busdoor/` com todos os arquivos padrão:
- `index.html`
- `package.json`
- `tailwind.config.js`
- `css/` (input.css, master.css, fonts/)
- `js/` (ebhtml.js, master.js, mock-data.js)

### 2. Configurar camada de dados
Implementar [js/mock-data.js](file:///c:/Users/direnzo/Documents/CLIENTES/_TEMPLATES/c2r_busdoor/js/mock-data.js) com registros mock:
- **D_LOCAL**: ID: 304, SCREEN_CUSTOMERID: 31783
- **D_OLHOVIVO**: LOCAL: 304, TITULO: 31783
- Lógica de correspondência mock para demonstrar comportamento de referência cruzada

### 3. Implementar lógica de correspondência de dados
Atualizar [js/master.js](file:///c:/Users/direnzo/Documents/CLIENTES/_TEMPLATES/c2r_busdoor/js/master.js) seguindo o padrão rodate-teste:
- Registrar ambos os datasets: `loader.addData('D_LOCAL', false)` e `loader.addData('D_OLHOVIVO', false)`
- Carregar com `loader.load(callback)`
- Extrair primeiro registro de D_LOCAL
- Iterar dataset D_OLHOVIVO para encontrar registro correspondente por:
  - D_LOCAL.ID (ou SCREEN_CUSTOMERID) correspondendo com D_OLHOVIVO.LOCAL (ou TITULO)
- Extrair valor TEXTO do registro correspondente (ex: "1177-10")
- Passar dados unificados para `iniciarTemplate(dados, config, loader)`

### 4. Projetar layout responsivo
Criar [index.html](file:///c:/Users/direnzo/Documents/CLIENTES/_TEMPLATES/c2r_busdoor/index.html) e [css/input.css](file:///c:/Users/direnzo/Documents/CLIENTES/_TEMPLATES/c2r_busdoor/css/input.css):
- **Área principal**: Número gigante centralizado (dinâmico do TEXTO), fundo preto (#000 ou equivalente)
- **Área rodapé**: Fundo branco fixo com conteúdo estático ou semi-estático
- **Resolução**: Otimizado para 520×208px (proporção ~2.5:1, formato horizontal de porta de ônibus)
- **Animações**: Fade-in ao carregar, fade-out antes de mudar

### 5. Implementar controle de ciclo de vida
Em [js/master.js](file:///c:/Users/direnzo/Documents/CLIENTES/_TEMPLATES/c2r_busdoor/js/master.js):
- Verificar MOCK_DATA (modo desenvolvimento)
- Se desabilitado: usar `ebhtml.create2()` para inicializar loader
- Definir `loader.autoloaded = false` e `loader.nodataiserror = false`
- Registrar datasets com `addData()`
- Chamar `loader.load(callback)` para buscar do EdgeContents
- No callback:
  - Extrair e corresponder dados
  - Chamar `iniciarTemplate(dados, config, loader)` para renderizar
  - Dentro de `iniciarTemplate()`:
    - Construir elementos DOM (sem loops innerHTML)
    - Chamar `loader.loaded()` após construção do DOM ✅
    - Definir `setTimeout(function() { loader.finished(); }, duration)` ✅

### 6. Verificar compatibilidade ES5
Garantir que todo código segue restrições ES5-only (Android 7+ WebKit legado):
- ✅ Usar `var` em vez de `const/let`
- ✅ Usar `function() {}` em vez de `() => {}`
- ✅ Usar concatenação de strings em vez de template strings: `'texto' + var + 'mais'`
- ✅ Usar loops `for` em vez de `for...of` ou `.map()`
- ✅ Sem async/await, sem Promise, usar XMLHttpRequest se necessário
- ✅ Sem sintaxe class, sem destructuring, sem spread operator

---

## 🔍 Considerações Adicionais / Perguntas

### 1. Estrutura de Dados D_OLHOVIVO
**Pergunta:** Qual é a estrutura XML real de D_OLHOVIVO?
- É como D_CLIMA_CLIMATEMPO (JSON embutido em CDATA)?
- Ou XML plano mais simples com campo TEXTO direto?
- Quais são os nomes exatos de campos para correspondência e extração?

**Ação:** Verificar estrutura real do D_OLHOVIVO.xml antes de finalizar lógica de extração de dados.

### 2. Conteúdo do Rodapé Fixo
**Pergunta:** O que o rodapé deve exibir?
- Texto estático (ex: "Olho Vivo - SPTrans")?
- Informações de localização do D_LOCAL (linha, cidade, rota)?
- Número da rota ou outros dados dinâmicos?
- Apenas branding/estilo estático?

**Ação:** Confirmar origem do conteúdo do rodapé e formato.

### 3. Tratamento de Erros e Comportamento de Fallback
**Pergunta:** Se os datasets estiverem vazios ou a correspondência falhar:
- Exibir número de espaço reservado (ex: "0000" ou "----")?
- Ocultar template completamente (tela em branco)?
- Mostrar mensagem de erro?
- Renderizar com dados mock?

**Ação:** Definir estratégia de fallback para dados faltantes/não correspondidos.

### 4. Chaves de Correspondência de Dados
**Pergunta:** Nomes exatos de campos para referência cruzada:
- D_LOCAL usa: `ID` + `SCREEN_CUSTOMERID` juntos?
- Ou apenas um campo como chave primária?
- D_OLHOVIVO usa: `LOCAL` + `TITULO` como chave composta?
- Ou estrutura de campo diferente?

**Ação:** Verificar nomes exatos de correspondência a partir de schemas XML reais.

### 5. Formatação de Exibição do Número
**Pergunta:** Formato do valor TEXTO "1177-10":
- Exibir exatamente como recebido: "1177-10"?
- Formatar diferentemente (ex: dividir em "1177" / "10")?
- Adicionar prefixos/sufixos?
- Tamanho de fonte diferente para número vs. sufixo?

**Ação:** Confirmar regras de formatação de número a partir do mockup visual.

### 6. Frequência de Atualização e Timeout
**Pergunta:** Quanto tempo cada exibição deve ficar na tela?
- Duração fixa (ex: 5s, 8s)?
- Baseado em campo de dados (DURACAO ou similar)?
- Contínuo até próxima atualização?

**Ação:** Definir duração de exibição e estratégia de atualização.

---

## 📦 Estrutura de Arquivos

```
c2r_busdoor/
├── index.html              ← Estrutura HTML (layout 520×208)
├── package.json            ← Scripts NPM (copiar de _template-base)
├── tailwind.config.js      ← Config Tailwind (copiar de _template-base)
├── css/
│   ├── input.css          ← Fonte CSS (personalizado para design de porta de ônibus)
│   ├── master.css         ← Compilado por TailwindCSS (auto-gerado)
│   └── fonts/             ← Arquivos de fonte
├── img/                   ← Imagens/ativos
└── js/
    ├── ebhtml.js          ← COPIAR de _template-base (nunca editar)
    ├── master.js          ← PERSONALIZAR (lógica de correspondência de dados + renderização)
    └── mock-data.js       ← PERSONALIZAR (dados de teste para D_LOCAL + D_OLHOVIVO)
```

---

## ✅ Critérios de Sucesso

- [ ] Template carrega sem erros no navegador (`localhost:12099/FILES/1/c2r_busdoor/index.html`)
- [ ] Dados mock exibem corretamente (número gigante "1177-10" em preto, rodapé branco)
- [ ] Lógica de correspondência de dados funciona (D_LOCAL.ID=304 ↔ D_OLHOVIVO.LOCAL=304)
- [ ] Design responsivo se adapta a viewport 520×208px
- [ ] Sintaxe ES5 apenas (sem erros de console para `const/let/arrow/template strings`)
- [ ] `loader.loaded()` chamado após renderização bem-sucedida
- [ ] `loader.finished()` chamado após timeout de exibição
- [ ] TailwindCSS compila com sucesso (`npm run dev` funciona)
- [ ] Playlist avança corretamente (sem travamentos)
- [ ] Funciona com datasets reais D_LOCAL e D_OLHOVIVO do EdgeContents CMS

---

## 🚀 Próxima Fase

1. **Pesquisar D_OLHOVIVO XML real** para finalizar extração de dados
2. **Criar diretório de template** e copiar estrutura base
3. **Implementar master.js** com lógica de correspondência de dados
4. **Projetar layout CSS** (número gigante + rodapé branco)
5. **Configurar mock-data.js** com dados de teste realistas
6. **Testar com EdgeContents** CMS (trocar mock por datasets reais)
7. **Fazer deploy** para servidor EdgeContents de produção
- Or different field structure?

**Action:** Verify exact matching logic from actual XML schemas.

### 5. Number Display Formatting
**Question:** TEXTO value "1177-10" format:
- Display exactly as received: "1177-10"?
- Format differently (e.g., split to "1177" / "10")?
- Add prefixes/suffixes?
- Different font size for number vs. suffix?

**Action:** Confirm number formatting rules from visual mockup.

### 6. Update Frequency & Timeout
**Question:** How long should each display stay on screen?
- Fixed duration (e.g., 5s, 8s)?
- Based on data field (DURACAO or similar)?
- Continuous until next update?

**Action:** Define display duration and refresh strategy.

---

## 📦 File Structure

```
c2r_busdoor/
├── index.html              ← HTML structure (520×208 layout)
├── package.json            ← NPM scripts (copy from _template-base)
├── tailwind.config.js      ← Tailwind config (copy from _template-base)
├── css/
│   ├── input.css          ← CSS source (custom for bus door design)
│   ├── master.css         ← Compiled by TailwindCSS (auto-generated)
│   └── fonts/             ← Font files
├── img/                   ← Images/assets
└── js/
    ├── ebhtml.js          ← COPY from _template-base (never edit)
    ├── master.js          ← CUSTOMIZE (data matching + render logic)
    └── mock-data.js       ← CUSTOMIZE (test data for D_LOCAL + D_OLHOVIVO)
```

---

## ✅ Success Criteria

- [ ] Template loads without errors in browser (`localhost:12099/FILES/1/c2r_busdoor/index.html`)
- [ ] Mock data displays correctly (giant number "1177-10" on black, white footer)
- [ ] Data matching logic works (D_LOCAL.ID=304 ↔ D_OLHOVIVO.LOCAL=304)
- [ ] Responsive design adapts to 520×208px viewport
- [ ] ES5 syntax only (no console errors for `const/let/arrow/template strings`)
- [ ] `loader.loaded()` called after successful render
- [ ] `loader.finished()` called after display timeout
- [ ] TailwindCSS compiles successfully (`npm run dev` works)
- [ ] Playlist advances correctly (no hangs)
- [ ] Works with real D_LOCAL and D_OLHOVIVO datasets from EdgeContents CMS

---

## 🚀 Next Phase

1. **Research actual D_OLHOVIVO XML** to finalize data extraction
2. **Create template directory** and copy base structure
3. **Implement master.js** with data matching logic
4. **Design CSS layout** (giant number + white footer)
5. **Set up mock-data.js** with realistic test data
6. **Test with EdgeContents** CMS (swap mock for real datasets)
7. **Deploy** to production EdgeContents server
