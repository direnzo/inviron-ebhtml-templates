# 📚 Documentação EdgeContents Templates

Índice completo de toda documentação técnica.

> 💡 **Primeiro acesso?** Comece pelo [QUICKSTART.md](../QUICKSTART.md) (5 minutos)

---

## 🚀 Começando

### Novos Usuários (Nível Iniciante)

1. **[../QUICKSTART.md](../QUICKSTART.md)** ⚡ (5 min)
   - Crie seu primeiro template em 5 minutos
   - Comandos essenciais
   - Primeiro contato com o sistema

2. **[GLOSSARY.md](GLOSSARY.md)** 📖 (10 min)
   - Entenda os termos técnicos
   - EBHTML, Dataset, Loader, Digital Signage
   - Referência rápida de vocabulário

3. **[01-getting-started.md](01-getting-started.md)** 🎓 (30-45 min)
   - Tutorial completo passo-a-passo
   - Arquitetura do sistema
   - Setup do ambiente
   - Criar e personalizar templates
   - Workflow de desenvolvimento

**Tempo total:** ~45-60 minutos para dominar o básico

---

## 📖 Documentação Core

### Para Todos os Desenvolvedores

4. **[02-xml-format.md](02-xml-format.md)** 📋 (CRÍTICO - 20 min)
   - Estrutura XML EdgeContents (EBDATA)
   - Campos padrão (TITULO, TEXTO, FOTO1-5, COR, DATA)
   - Como acessar dados no template
   - Mock Data ↔ XML Real
   - Exemplos práticos completos

5. **[04-troubleshooting.md](04-troubleshooting.md)** 🚨 (Referência)
   - Playlist trava
   - CSS não carrega
   - Dados não aparecem
   - Erros de JavaScript ES5
   - Imagens não carregam
   - Ferramentas de debugging

---

## 🎓 Documentação Avançada

### Para Desenvolvedores Experientes

6. **[03-advanced.md](03-advanced.md)** 🚀 (30 min)
   - Múltiplos datasets
   - Animações avançadas (fade, slide, keyframes)
   - Performance e otimização
   - Layouts responsivos
   - Transições entre slides
   - Manipulação avançada de dados

7. **[05-api-reference.md](05-api-reference.md)** 📚 (Referência Completa)
   - API EBHTML v2.0.3
   - `ebhtml.create2()`
   - Loader (EBBrowser)
   - Dataset (EBBrowserData)
   - Item (EBBrowserDataRow)
   - Todos os métodos e propriedades

8. **[06-microfuncoes-reutilizaveis.md](06-microfuncoes-reutilizaveis.md)** 🧩 (Arquitetura Reutilizável)
   - Catálogo de microfunções ES5
   - Contratos de assinatura/retorno
   - Funções genéricas (applyBackground, applyPrice, etc.)
   - Exemplo de composição sem montar HTML por string
   - Padrão de preview.js com paridade runtime/extranet
   - Checklist de adoção para novos templates

---

## 🔧 Contribuindo

### Para Colaboradores

9. **[../CONTRIBUTING.md](../CONTRIBUTING.md)** 🤝
   - Padrões de código (ES5, CSS, HTML)
   - Mensagens de commit
   - Checklist de testes
   - Template de Pull Request
   - Como reportar bugs

---

## 📂 Organização

```
docs/
├── README.md              ← Este arquivo
├── GLOSSARY.md            ← Termos técnicos
├── 01-getting-started.md  ← Tutorial completo
├── 02-xml-format.md       ← Estrutura XML/EBDATA
├── 03-advanced.md         ← Conceitos avançados
├── 04-troubleshooting.md  ← Debug e soluções
├── 05-api-reference.md    ← API EBHTML
├── 06-microfuncoes-reutilizaveis.md ← Catálogo de microfunções
└── images/                ← Screenshots
```

**Exemplos XML (fora de docs):**
- `/examples/` contém XMLs reais de datasets (ex.: `D_CLIMA_CLIMATEMPO.xml` com JSON em CDATA)

---

## 🗺️ Fluxo de Aprendizado Recomendado

### Jornada do Desenvolvedor

```
┌─────────────────┐
│  QUICKSTART.md  │ ← 5 min - Primeiro template
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   GLOSSARY.md   │ ← 10 min - Entender termos
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│ 01-getting-started   │ ← 45 min - Tutorial completo
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 02-xml-format        │ ← 20 min - Estrutura de dados (CRÍTICO)
└──────────┬───────────┘
           │
           ├─────────────────────┐
           ▼                     ▼
┌──────────────────┐   ┌──────────────────┐
│ 03-advanced      │   │ 04-troubleshoot  │ ← Conforme necessário
└──────────────────┘   └──────────────────┘
           │
           ▼
┌──────────────────────┐
│ 05-api-reference     │ ← Referência contínua
└──────────────────────┘

           │
           ▼
┌───────────────────────────────┐
│ 06-microfuncoes-reutilizaveis │ ← Padrão de composição
└───────────────────────────────┘
```

**Tempo total para proficiência:** ~2-3 horas

---

## 🎯 Guia Rápido por Objetivo

### "Quero criar meu primeiro template"
→ [QUICKSTART.md](../QUICKSTART.md) → [01-getting-started.md](01-getting-started.md)

### "Preciso entender o formato XML do EdgeContents"
→ [02-xml-format.md](02-xml-format.md)

### "Meu template não funciona / está com erro"
→ [04-troubleshooting.md](04-troubleshooting.md)

### "Quero adicionar animações avançadas"
→ [03-advanced.md](03-advanced.md)

### "Preciso sabtodos os métodos do EBHTML"
→ [05-api-reference.md](05-api-reference.md)

### "Quero ver exemplos reais de XML"
→ [/examples/](../examples/)

### "Quero padronizar micro funções reutilizáveis"
→ [06-microfuncoes-reutilizaveis.md](06-microfuncoes-reutilizaveis.md)

### "Não entendo um termo técnico"
→ [GLOSSARY.md](../GLOSSARY.md)

### "Quero contribuir com código"
→ [CONTRIBUTING.md](../CONTRIBUTING.md)

---

## 📊 Status da Documentação

| Documento | Status | Última Atualização | Cobertura |
|-----------|--------|-------------------|-----------|
| QUICKSTART.md | ✅ Completo | 06/02/2026 | 100% |
| GLOSSARY.md | ✅ Completo | 06/02/2026 | 100% |
| 01-getting-started.md | ✅ Completo | 06/02/2026 | 100% |
| 02-xml-format.md | ✅ Completo | 06/02/2026 | 100% |
| 03-advanced.md | ✅ Completo | 06/02/2026 | 100% |
| 04-troubleshooting.md | ✅ Completo | 06/02/2026 | 100% |
| 05-api-reference.md | ✅ Completo | 06/02/2026 | 100% |
| 06-microfuncoes-reutilizaveis.md | ✅ Completo | 06/07/2026 | 100% |
| CONTRIBUTING.md | ✅ Completo | 06/02/2026 | 100% |

---

## 🔍 Busca Rápida

### Por Conceito

- **EBHTML** → [05-api-reference.md](05-api-reference.md) + [GLOSSARY.md](../GLOSSARY.md)
- **XML/EBDATA** → [02-xml-format.md](02-xml-format.md)
- **Loader** → [05-api-reference.md](05-api-reference.md#loader-ebbrowser)
- **Dataset** → [02-xml-format.md](02-xml-format.md) + [05-api-reference.md](05-api-reference.md#dataset-ebbrowserdata)
- **Playlist** → [01-getting-started.md](01-getting-started.md#ciclo-de-vida) + [GLOSSARY.md](../GLOSSARY.md#p)
- **ES5** → [01-getting-started.md](01-getting-started.md#regras-críticas) + [GLOSSARY.md](../GLOSSARY.md#e)
- **TailwindCSS** → [01-getting-started.md](01-getting-started.md#personalizando-o-template)
- **Mock Data** → [02-xml-format.md](02-xml-format.md#mock-data--xml-real)
- **Animações** → [03-advanced.md](03-advanced.md#animações-avançadas)
- **Performance** → [03-advanced.md](03-advanced.md#performance-e-otimização)
- **Microfunções** → [06-microfuncoes-reutilizaveis.md](06-microfuncoes-reutilizaveis.md)
- **Preview.js** → [06-microfuncoes-reutilizaveis.md](06-microfuncoes-reutilizaveis.md#36-preview-e-paridade-de-comportamento)

### Por Problema

- **Playlist trava** → [04-troubleshooting.md](04-troubleshooting.md#playlist-trava)
- **CSS não aparece** → [04-troubleshooting.md](04-troubleshooting.md#css-não-carrega)
- **Dados vazios** → [04-troubleshooting.md](04-troubleshooting.md#dados-não-aparecem)
- **Erro de sintaxe** → [04-troubleshooting.md](04-troubleshooting.md#erros-de-javascript)
- **Imagem quebrada** → [04-troubleshooting.md](04-troubleshooting.md#imagens-não-carregam)

---

## 📞 Suporte

- **Documentação:** Você está aqui!
- **Issues:** [GitHub Issues](../../issues)
- **Email:** suporte@edgecontents.com.br

---

**Última atualização do índice:** 06/02/2026  
**Versão EBHTML:** 2.0.3  
**Versão Docs:** 1.0.0
