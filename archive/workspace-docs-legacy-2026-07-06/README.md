# EdgeContents Templates

Sistema de templates HTML para Digital Signage compatível com EdgeContents CMS e navegadores Android 7+.

> � **Documentação completa:** [docs/](docs/)

---

## 🚀 Início Rápido

```bash
# 1. Copie o template base
cp -r _template-base meu-template
cd meu-template

# 2. Inicie TailwindCSS (watch mode)
npm run dev

# 3. Abra no navegador
# http://localhost:12099/FILES/1/index.html
```

**5 minutos para primeiro template:** [QUICKSTART.md](QUICKSTART.md)

---

## 📚 Documentação

### Para Iniciantes
- **[QUICKSTART.md](QUICKSTART.md)** - Primeiro template em 5 minutos
- **[docs/01-getting-started.md](docs/01-getting-started.md)** - Tutorial completo
- **[docs/GLOSSARY.md](docs/GLOSSARY.md)** - Termos técnicos explicados

### Para Desenvolvedores
- **[docs/02-xml-format.md](docs/02-xml-format.md)** - Estrutura XML EdgeContents (EBDATA)
- **[docs/03-advanced.md](docs/03-advanced.md)** - Animações, performance, múltiplos datasets
- **[docs/04-troubleshooting.md](docs/04-troubleshooting.md)** - Problemas comuns e soluções
- **[docs/05-api-reference.md](docs/05-api-reference.md)** - API completa EBHTML

---

## ⚙️ Regras Essenciais

### JavaScript ES5 Apenas (Android 7+)
```javascript
// ❌ PROIBIDO
const nome = 'teste';
const funcao = () => {};

// ✅ PERMITIDO
var nome = 'teste';
var funcao = function() {};
```

### Controle de Playlist
```javascript
// ✅ SEMPRE
if (sucesso) {
    loader.loaded();   // Apenas em sucesso
    loader.finished(); // Sempre
} else {
    loader.finished(); // Apenas finished em erro
}
```

---

## 📁 Estrutura

```
_template-base/
├── index.html              # Estrutura HTML
├── package.json            # Scripts NPM (sem dependencies)
├── tailwind.config.js      # Config TailwindCSS
├── css/
│   ├── input.css          # CSS fonte (editar)
│   └── master.css         # CSS compilado (gerado)
├── img/                   # Imagens e assets
└── js/
    ├── ebhtml.js          # Biblioteca EdgeContents (não editar)
    ├── master.js          # Lógica do template (editar)
    └── mock-data.js       # Dados de teste local
```

---

## 🛠️ Build

```bash
# Desenvolvimento (watch mode)
npm run dev

# Produção (minificado)
npm run build
```

---

## 🤝 Contribuindo

Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para diretrizes de contribuição.

---

**Versão:** 1.0.0  
**Licença:** Proprietária  
**EdgeContents CMS:** [edgecontents.com.br](https://edgecontents.com.br)
