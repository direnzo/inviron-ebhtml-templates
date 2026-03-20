# c2r_busdoor

Template EdgeContents: número gigante em quadro preto + fundo branco + rodapé Disque Denúncia 181.

## ⚙️ Config (js/master.js)

```javascript
var CONFIG = {
    duration: 5000,           // Tempo exibição (ms)
    fadeInDuration: 500,      // Fade-in (ms)
    fadeOutDuration: 500,     // Fade-out (ms)
    debug: true,              // Logs console
    numeroFallback: '----',   // Número padrão
    autoMatching: true        // Auto-correspondência
};
```

## 🚀 Dev

```bash
npm run dev    # TailwindCSS watch
# http://localhost:12099/FILES/1/c2r_busdoor/
```

Mock ativo: ID=304 → TEXTO=8677-10

## 📦 Produção

```bash
# Comente mock-data.js em index.html
npm run build
```

## 🔧 Datasets

**D_LOCAL**: ID, SCREEN_CUSTOMERID  
**D_OLHOVIVO**: LOCAL, TITULO, TEXTO (número)

Match: D_LOCAL.ID ↔ D_OLHOVIVO.LOCAL

## 📋 Ciclo

1. Extrai D_LOCAL + D_OLHOVIVO
2. Match automático (ID/SCREEN_CUSTOMERID)
3. Renderiza número gigante
4. loader.loaded() → exibe CONFIG.duration ms
5. loader.finished()
