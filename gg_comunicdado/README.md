# G&G Comunicado - Template Digital Signage

Template dinâmico e altamente customizável para exibição de comunicados institucionais. Desenvolvido para máxima performance e compatibilidade com **Android 7+ (WebKit)** em players de Digital Signage.

## 🎨 Templates de Fundo (via `TEXTO6`)

O fundo é alterado dinamicamente através do campo **TEXTO6**. Não é necessário editar o código HTML para trocar de categoria.

| ID (`TEXTO6`) | Localização | Template | Uso Sugerido |
| :--- | :--- | :--- | :--- |
| **1** | `img/Fundo_comunicado.png` | **Comunicado** | Comunicados gerais e institucionais |
| **2** | `img/Fundo_Meetup.png` | **Meetup** | Eventos, reuniões e workshops |
| **3** | `img/Fundo_Selbnews.png` | **Selbnews** | Notícias internas e atualizações |

---

## 🎭 Máscaras SVG para Fotos (via `TEXTO8`)

A foto do comunicado pode assumir diversas formas geométricas através do sistema de máscaras SVG externas.

**Regras de Aplicação:**
1. Se **TEXTO8** contiver um ID (ex: `mask-hexagon`), essa máscara será aplicada.
2. Se **TEXTO8** estiver vazio, o sistema aplicará uma máscara **aleatória** da lista.
3. Se o ID não for encontrado, o fallback é o círculo (`mask-circle`).

**Lista de IDs Disponíveis:**
- `mask-circle`, `mask-hexagon`, `mask-diamond`, `mask-star-5`, `mask-blob-1`, `mask-blob-2`
- `mask-wave`, `mask-triangle`, `mask-diagonal`, `mask-chevron`, `mask-corner-cut`
- `mask-bubble-left`, `mask-bubble-right` (Ideal para Meetups)
- `mask-heart`, `mask-pentagon`, `mask-octagon`, `mask-ticket`

---

## 📐 Modos de Layout (via `TEXTO7` e Detecção)

O layout se adapta automaticamente ao conteúdo e às configurações:

- **Padrão (Texto Esq | Foto Dir):** Comportamento padrão quando há uma URL em `FOTO`.
- **Invertido (Foto Esq | Texto Dir):** Ativado quando **TEXTO7** é `true`.
- **Full-Width (Apenas Texto):** Ativado automaticamente se o campo `FOTO` estiver vazio ou nulo. O texto centraliza e ocupa 100% da largura.

---

## 🎨 Customização de Estilos (via `TEXTO1-5`)

Personalize as cores e a editoria diretamente pelo CMS:

| Campo | Função | Exemplo |
| :--- | :--- | :--- |
| **TEXTO1** | Editoria/Chapéu (Texto curto no topo do box) | "NOTÍCIA", "AVISO" |
| **TEXTO2** | Cor de fundo do box de texto (RGBA/Hex) | `rgba(0,0,0,0.6)` |
| **TEXTO3** | Cor da fonte do Título principal | `#FFFFFF` |
| **TEXTO4** | Cor de fundo da Editoria (Chapéu) | `#1E88E5` |
| **TEXTO5** | Cor da fonte da Editoria | `#FFFFFF` |

---

## 📋 Mapeamento de Campos (EdgeContents)

| Canal | Campo | Descrição |
| :--- | :--- | :--- |
| `D_COMUNICADO` | `TITULO` | Texto principal do comunicado (auto-fit automático) |
| `D_COMUNICADO` | `FOTO` | URL da imagem (JPG/PNG) |
| `D_COMUNICADO` | `TEXTO1` | Texto da Editoria (flutuante) |
| `D_COMUNICADO` | `TEXTO2` | Background do Box de Texto |
| `D_COMUNICADO` | `TEXTO3` | Cor do Título |
| `D_COMUNICADO` | `TEXTO4` | Background da Editoria |
| `D_COMUNICADO` | `TEXTO5` | Cor da Editoria |
| `D_COMUNICADO` | `TEXTO6` | ID do Template de Fundo (1, 2 ou 3) |
| `D_COMUNICADO` | `TEXTO7` | Inverter Layout (true/false) |
| `D_COMUNICADO` | `TEXTO8` | ID da Máscara SVG específica |

---

## ⚙️ Configuração Global (`js/master.js`)

Ajustes técnicos fixos:
```javascript
var CONFIG = {
    duration: 10000,       // Tempo de exibição em ms
    temFoto: true,         // Permite forçar desativação global de fotos
    fotoEsquerda: false    // Permite inverter globalmente o layout
};
```

---

## 🚀 Desenvolvimento e Produção

### Mock Data (Ambiente de Teste)
Para testar localmente sem conexão com o CMS, habilite o `mock-data.js` no `index.html`. 
O arquivo `js/mock-data.js` contém diversos registros com variações de cores, layouts e máscaras.

### Build
1. Desative o mock: `MOCK_DATA.enabled = false`.
2. Verifique se o `index.html` não referencia o script de mock.
3. Compile o CSS final (Tailwind): `npm run build`.
4. Publique a pasta no servidor de arquivos do Digital Signage.

### Tech Stack
- **EBHTML v2** (EdgeContents Communication)
- **TailwindCSS** (Styling Engine)
- **JavaScript ES5 Pure** (Compatibilidade Android 7)
- **SVG Masks** (clipPath dinâmico via XHR)
- **FitFontSize** (Algoritmo para garantir que o texto nunca transborde o box)
