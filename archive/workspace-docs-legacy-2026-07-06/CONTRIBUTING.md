# Contribuindo com EdgeContents Templates

Obrigado por contribuir! Este guia ajuda a manter o código consistente e de alta qualidade.

---

## 📋 Antes de Começar

1. Leia toda a documentação em [docs/](docs/)
2. Entenda as [regras ES5](README.md#regras-essenciais)
3. Familiarize-se com o [GLOSSARY.md](GLOSSARY.md)

---

## 🔧 Setup do Ambiente

```bash
# Clone o repositório
git clone <repo-url>
cd _TEMPLATES

# Teste o template base
cd _template-base
npm run dev

# Abra http://localhost:12099/FILES/1/
```

---

## ✅ Padrões de Código

### JavaScript

- **ES5 obrigatório** - Sem `let`, `const`, arrow functions, template strings
- **4 espaços** para indentação
- **Comentários descritivos** em funções complexas
- **Nomes descritivos** para variáveis e funções

```javascript
// ✅ BOM
function processarDadosDoDataset(loader, nomeDataset) {
    var lista = [];
    var dataset = loader.datalist(nomeDataset);
    
    for (var i = 0; i < dataset.count(); i++) {
        var item = dataset.get(i);
        lista.push({
            TITULO: item.value('TITULO').value
        });
    }
    
    return lista;
}

// ❌ RUIM
const procDados = (l, n) => l.datalist(n).get(0);
```

### CSS (TailwindCSS)

- Prefira **classes utilitárias** do Tailwind
- Use **@apply** apenas para componentes reutilizáveis
- **clamp()** para tamanhos responsivos
- **Comentários** para explicar custom classes

```css
/* ✅ BOM */
.card-noticia {
    @apply bg-white rounded-xl shadow-lg p-6;
}

.titulo-responsivo {
    font-size: clamp(2rem, 5vw, 8rem);
}

/* ❌ RUIM - Prefira classes Tailwind inline */
.texto {
    color: #333;
    font-size: 16px;
    margin: 10px;
}
```

### HTML

- **Estrutura semântica** quando possível
- **Classes Tailwind** para estilização
- **IDs únicos** para elementos JavaScript

```html
<!-- ✅ BOM -->
<div id="container" class="w-full h-full flex items-center justify-center bg-black">
    <main class="max-w-screen-xl">
        <h1 class="text-6xl font-bold text-white">Título</h1>
    </main>
</div>

<!-- ❌ RUIM -->
<div id="div1" class="d1">
    <div class="d2">Título</div>
</div>
```

---

## 📝 Commits

### Mensagens

Use o formato: `tipo(escopo): descrição`

**Tipos:**
- `feat` - Nova funcionalidade
- `fix` - Correção de bug
- `docs` - Documentação
- `style` - Formatação (não afeta código)
- `refactor` - Refatoração
- `test` - Testes
- `chore` - Manutenção

**Exemplos:**
```
feat(template): adiciona slideshow com fade transition
fix(ebhtml): corrige loader.finished() não chamado em erro
docs(quickstart): atualiza comandos de instalação
style(css): formata input.css com prettier
```

---

## 🧪 Testes

### Antes de Commit

- [ ] **Testar em modo Mock** (`MOCK_DATA.enabled = true`)
- [ ] **Testar com EdgeContents Server** (localhost:12099)
- [ ] **Validar ES5** - Sem erros em console (F12)
- [ ] **CSS compilado** - `npm run build` sem erros
- [ ] **Playlist funciona** - `loader.loaded()` e `loader.finished()` corretos
- [ ] **Sem console.log desnecessários**

### Navegadores de Teste

Mínimo:
- Chrome/Edge (WebKit moderno)
- Android 7 WebView (se possível)

---

## 📂 Estrutura de Pull Request

### Template

```markdown
## Descrição
[Descreva o que foi alterado e por quê]

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Documentação
- [ ] Refatoração

## Checklist
- [ ] Código ES5 compatível
- [ ] CSS compilado com `npm run build`
- [ ] Testado em modo Mock
- [ ] Testado com EdgeContents
- [ ] Playlist funciona corretamente
- [ ] Documentação atualizada (se necessário)

## Screenshots (se aplicável)
[Adicione capturas de tela]
```

---

## 🐛 Reportando Bugs

Use as [Issues](../../issues) do GitHub com o template:

```markdown
**Descrição:**
[Descreva o bug]

**Para Reproduzir:**
1. [Passo 1]
2. [Passo 2]
3. [...]

**Comportamento Esperado:**
[O que deveria acontecer]

**Screenshots:**
[Se aplicável]

**Ambiente:**
- OS: [Windows/Android]
- Navegador: [Chrome/WebView]
- Versão EBHTML: [2.0.3]
- Modo: [Mock/EdgeContents]

**Console Logs:**
```
[Cole erros do console (F12)]
```
```

---

## 💡 Sugestões de Melhorias

1. Abra uma [Issue](../../issues) com tag `enhancement`
2. Descreva o problema que resolve
3. Proponha solução (se possível)
4. Aguarde feedback antes de implementar

---

## 📁 Adicionando Templates de Exemplo

Se deseja contribuir com um template para `examples/`:

1. Crie pasta em `examples/nome-template/`
2. Copie estrutura de `_template-base/`
3. Implemente funcionalidade
4. Documente em `examples/nome-template/README.md`
5. Adicione screenshots em `examples/nome-template/screenshots/`

**Estrutura:**
```
examples/
└── slideshow-produtos/
    ├── index.html
    ├── package.json
    ├── README.md          # Documentação do exemplo
    ├── screenshots/
    │   └── preview.png
    ├── css/
    ├── img/
    └── js/
```

---

## 🚫 O Que NÃO Fazer

- ❌ **ES6+ syntax** (let, const, arrow, async/await)
- ❌ **Dependencies no package.json** (TailwindCSS é global)
- ❌ **Modificar `ebhtml.js`** (copie de `_template-base/`)
- ❌ **Commits sem testar**
- ❌ **PRs sem descrição**
- ❌ **Quebrar estrutura de pastas**

---

## 🏆 Boas Práticas

- ✅ **Comentários úteis** - Explique o "por quê", não o "o quê"
- ✅ **Funções pequenas** - Máximo 50 linhas quando possível
- ✅ **DRY** (Don't Repeat Yourself) - Reutilize código
- ✅ **Performance** - Use GPU-accelerated animations (transform, opacity)
- ✅ **Acessibilidade** - Tamanhos de fonte legíveis, contraste adequado
- ✅ **Documentação** - Atualize docs se mudar comportamento

---

## 📞 Contato

- **Issues:** [GitHub Issues](../../issues)
- **Email:** suporte@edgecontents.com.br
- **Docs:** [docs/](docs/)

---

**Obrigado por contribuir! 🎉**
