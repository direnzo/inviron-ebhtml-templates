# ⚡ Quick Start - 5 Minutos para Primeiro Template

Crie seu primeiro template EdgeContents em **5 minutos**.

---

## 1️⃣ Copie o Template Base (30 segundos)

```powershell
# Copie a pasta base
cp -r _template-base meu-primeiro-template
cd meu-primeiro-template
```

---

## 2️⃣ Inicie o Ambiente (1 minuto)

### Inicie o servidor EdgeContents
```powershell
# Execute: ebcliente4.exe
# Aguarde mensagem: "Servidor iniciado em localhost:12099"
```

### Inicie o TailwindCSS (watch mode)
```powershell
npm run dev
```

**Console deve mostrar:**
```
Rebuilding...
Done in 234ms
```

---

## 3️⃣ Ative o Mock Data (30 segundos)

Abra `index.html` e **descomente** a linha:

```html
<!-- Mock data (desenvolvimento) -->
<script src="js/mock-data.js"></script>  <!-- Descomente esta linha -->
```

---

## 4️⃣ Abra no Navegador (30 segundos)

Acesse: **http://localhost:12099/FILES/1/index.html**

✅ **Você deve ver:** Template rodando com dados de teste do mock-data.js

---

## 5️⃣ Personalize o Template (2 minutos)

### Edite os dados de teste
Abra `js/mock-data.js` e modifique:

```javascript
dados: [
    {
        TITULO: "MEU PRIMEIRO TEMPLATE",  // ← Altere aqui
        TEXTO: "Estou criando meu template!",
        FOTO1: "img/minha-imagem.jpg"
    }
]
```

### Edite os estilos
Abra `css/input.css` e adicione:

```css
.meu-titulo {
    font-size: 4rem;
    color: #f97316;  /* Cor laranja */
}
```

### Edite a lógica
Abra `js/master.js` e modifique a função `renderizarConteudo()`:

```javascript
function renderizarConteudo(dados) {
    var container = document.getElementById('container');
    container.innerHTML = '<h1 class="meu-titulo">' + dados[0].TITULO + '</h1>';
}
```

---

## 6️⃣ Recarregue e Veja as Mudanças (10 segundos)

Pressione **F5** no navegador → mudanças aparecem automaticamente!

---

## ✅ Pronto! Você criou seu primeiro template

### 📚 Próximos Passos

- **[docs/01-getting-started.md](docs/01-getting-started.md)** - Tutorial completo para iniciantes
- **[docs/02-xml-format.md](docs/02-xml-format.md)** - Como conectar ao EdgeContents CMS (dados reais)
- **[docs/GLOSSARY.md](docs/GLOSSARY.md)** - Entenda os termos técnicos
- **[docs/04-troubleshooting.md](docs/04-troubleshooting.md)** - Problemas comuns e soluções

---

## 🚨 Regras Importantes

### JavaScript ES5 Apenas
```javascript
// ❌ NUNCA use (não funciona em Android 7+)
const nome = 'teste';
let idade = 25;
const funcao = () => {};
const texto = `Olá ${nome}`;

// ✅ USE (ES5 compatível)
var nome = 'teste';
var idade = 25;
var funcao = function() {};
var texto = 'Olá ' + nome;
```

### Controle de Playlist
```javascript
// ✅ SEMPRE faça assim
if (sucesso) {
    loader.loaded();   // Apenas se deu certo
    loader.finished(); // Sempre
} else {
    // ❌ NÃO chame loaded() em erro!
    loader.finished(); // Apenas finished
}
```

---

## 🆘 Precisa de Ajuda?

- **Console não mostra erros?** Abra DevTools (F12) → aba Console
- **CSS não atualiza?** Verifique se `npm run dev` está rodando
- **Playlist trava?** Verifique se chamou `loader.loaded()` e `loader.finished()`
- **Mais problemas?** Consulte [docs/04-troubleshooting.md](docs/04-troubleshooting.md)

---

**Tempo total:** ~5 minutos  
**Próximo:** [docs/01-getting-started.md](docs/01-getting-started.md) para aprender conceitos fundamentais
