# segundafase_futebol

Template de Digital Signage para a **fase eliminatória** da Copa 2026, em **uma chave por reload** — pensado para painéis LED, telas pequenas e baixa resolução.

Alternativa visual ao [`caminhos_futebol`](../caminhos_futebol/) (chaveamento com cards e SVG): mesmos dados, exibição em blocos didáticos.

## O que exibe

- **Uma chave por reload** (rotação automática via `localStorage`):
  - **R32 — Segundas de Final**: 4 chaves de 4 jogos
  - **R16 — Oitavas de Final**: 2 chaves de 4 jogos
  - **QF — Quartas de Final**: 1 chave de 4 jogos
  - **SF — Semifinais**: 1 chave de 2 jogos
  - **Final** e **3º Lugar**: card único em destaque
- Cada confronto exibe **data · hora · local**, bandeiras, placar e status
- Para times **a definir**, placeholders didáticos com referência aos jogos de origem

## Dados (EdgeContents)

| Dataset | Parâmetro | Descrição |
|---------|-----------|-----------|
| `D_FOOTBALL` | `amount=0` | Todas as partidas — JSON em `TEXTO2` (API-Football) |
| `D_FOOTBALL_TEAMS` | `amount=0` | Todos os times — nomes PT-BR, códigos, bandeiras |
| `D_SPD` | `f_config=1` | Intro, patrocinador, cores |

### Campos D_SPD (Sponsor)

| Campo | Descrição |
|-------|-----------|
| `FILE_IMAGE1` | Vídeo/imagem de intro |
| `IMAGE_LOGO` | Logo do patrocinador |
| `TEXT1` | Frase do patrocinador |
| `TEXT2` | Duração da intro (segundos). Vazio = vídeo até o fim |
| `COLOR1` | **Cor escura** (fundo dos painéis) |
| `COLOR2` | **Cor de destaque** |
| `COLOR3` | **Cor clara** (texto) |

### Mapeamento de cores (D_SPD)

```
COLOR1 → corEscura (--cor-fundo-painel, --cor-fundo-area)
COLOR2 → corDestaque (--cor-destaque, --cor-destaque-glow)
COLOR3 → corClara (--cor-texto, --cor-texto-sec, --cor-borda)
```

7 variáveis CSS aplicadas via `aplicarCores()`: `--cor-destaque`, `--cor-destaque-glow`, `--cor-fundo-painel`, `--cor-fundo-area`, `--cor-borda`, `--cor-texto`, `--cor-texto-sec`.

### Campos por partida (D_FOOTBALL.TEXTO2)

`CATEGORY` (fase), `SUBTITULO` (posição), `TITULO`/`TITULO2` (IDs dos times), `FOTO`/`FOTO2`, `TEXTO`/`TEXTO2`, `SUBTITULO3` (status), **`SUBTITULO2`** (`DD/MM · HH:MM · Cidade`).

**IMPORTANTE:** `TITULO`/`TITULO2` são IDs numéricos. O template busca em `D_FOOTBALL_TEAMS` para traduzir para nomes PT-BR.

### Bandeiras

**Prioridade:** `FOTO` (URL absoluta do EdgeContents) > SVG local (`img/flags/`).

48+ bandeiras SVG disponíveis em `img/flags/`. Mapeamento via `mapearCodigoParaSVG()` com ~70 códigos (inclui JAP, RSA, BOS, NOR, SWI, etc.).

## Fluxo do playerView

```javascript
ebhtml.create2()
  ├─ D_FOOTBALL       amount=0      → todas as partidas
  ├─ D_FOOTBALL_TEAMS amount=0      → todos os times
  └─ D_SPD            f_config=1    → patrocinador
```

1. Carrega 3 datasets simultâneos via EBHTML nativo
2. Lê `TEXTO2` do primeiro registro `D_FOOTBALL` (JSON)
3. Monta `teamsMap` de `D_FOOTBALL_TEAMS`
4. Aplica cores via `D_SPD.COLOR1/2/3` → CSS variables
5. Chama `loader.loaded()` → renderiza chave → `loader.finished()` após 10s

**Guarantees:**
- `_playerViewExecutando` evita execução duplicada do loader
- `preview.js` não sobrescreve `playerView()` (stub removido)

## Controle de Playlist

| Método | Quando |
|--------|--------|
| `loader.loaded()` | ✅ Após carregar dados e aplicar cores |
| `loader.finished()` | ✅ Após 10s de exibição (ou intro + 5s) |

## Tempo de exibição

| Cenário | Intro | Conteúdo | Total |
|---------|-------|----------|-------|
| Com intro | `D_SPD.TEXT2` segundos | 5s | `TEXT2` + 5s |
| Sem intro | — | 10s | 10s |

Rotação: `localStorage` chave `segundafase_futebol_chave_idx` — incrementa a cada reload.

## Histórico de Correções (jun/2026)

| Data | Problema | Solução |
|------|----------|---------|
| 26/jun | `TEXTO3` usado em vez de `TEXTO2` | Migrado para `TEXTO2` (API-Football JSON) |
| 26/jun | `D_FOOTBALL` sem `amount=0` | Adicionado `amount=0` para todas as partidas |
| 26/jun | `playerView` sobrescrito pelo `preview.js` | Removido stub vazio do `preview.js` |
| 26/jun | Loader podia executar 2x | Guard `_playerViewExecutando` |
| 26/jun | `COLOR1`/`COLOR2` invertidos | `COLOR1`=corEscura, `COLOR2`=corDestaque |
| 26/jun | Apenas 4 variáveis CSS | Expandido para 7 variáveis |
| 26/jun | Bandeira SVG local preferida à URL | `FOTO` (URL) primeiro, SVG fallback |
| 26/jun | Códigos faltantes no mapa SVGs | Adicionados JAP, RSA, BOS, NOR, SWI, etc. |

## Desenvolvimento local

```bash
npm run dev   # tailwind --watch (CSS)
# http://localhost:12099/FILES/1/index.html
```

Mock: `js/mock-data.js` habilitado no `index.html`.

## Produção

- [ ] Comentar `<script src="js/mock-data.js">` no HTML
- [ ] `npm run build`
- [ ] `D_FOOTBALL_TEAMS` configurado com todos os times (nomes PT-BR)
- [ ] `D_SPD` com `CONFIG='1'` e campos `COLOR1/2/3`, `TEXT1`, `TEXT2`, `FILE_IMAGE1`

## Estrutura

```
segundafase_futebol/
├── index.html
├── package.json              Scripts npm (dev / build)
├── css/
│   ├── input.css
│   └── master.css
├── img/
│   └── flags/                Bandeiras SVG (48+ países)
└── js/
    ├── ebhtml.js             Biblioteca EBHTML (não editar)
    ├── master.js             Lógica principal do template
    ├── preview.js            Preview Extranet (EdgeContents)
    └── mock-data.js          Dados fictícios (dev local)
```
