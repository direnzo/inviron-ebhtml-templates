# caminhos_futebol

Template de Digital Signage para exibição do chaveamento eliminatório da **Copa do Mundo 2026**.
Exibe o bracket completo (2ª Rodada → Final), com conectores SVG, animações de entrada,
zoom nos confrontos e destaque do caminho do vencedor.

---

## Estrutura de arquivos

```
caminhos_futebol/
├── index.html                HTML principal
├── package.json              Scripts npm (dev / build)
├── tailwind.config.js        Breakpoints e tema
├── css/
│   ├── input.css             Fonte dos estilos (Tailwind)
│   └── master.css            Compilado (não editar)
├── img/
│   ├── flags/                Bandeiras SVG (48 países)
│   └── pre.mp4               Vídeo de fundo (pré-jogo)
└── js/
    ├── ebhtml.js             Biblioteca EBHTML (não editar)
    ├── bracket-draw.js       Conectores SVG entre fases
    ├── master.js             Lógica principal do template
    ├── preview.js            Preview Extranet (EdgeContents)
    └── mock-data.js          Dados fictícios (dev local)
```

---

## Desenvolvimento local

```bash
npm run dev          # Watch TailwindCSS
# Abrir no navegador:
# http://localhost:12099/FILES/1/index.html
```

Mock habilitado: descomentar `<script src="js/mock-data.js">` no `<head>` do `index.html`.
Produção: comentar a linha, executar `npm run build`.

---

## Fluxo de Dados (Produção)

Um único `ebhtml.create2()` carrega 3 datasets simultâneos:

```
ebhtml.create2()
  ├─ D_FOOTBALL       amount=0  → todas as partidas (16 registros: 12 grupos + 4 R32)
  ├─ D_FOOTBALL_TEAMS  amount=0  → 50 times (IDs, nomes PT-BR, bandeiras)
  └─ D_SPD             f_config=1  → patrocinador (intro, logo, cores)
```

**D_FOOTBALL — campos:**
| Campo XML | Conteúdo |
|-----------|----------|
| `TITULO`  | fixtureId (ex: `1561329`) |
| `TEXTO2`  | JSON `{"response":[{...}]}` da API-Football |
| `TEXTO4`  | Round (ex: `"Round of 32"`, `"Group Stage - 3"`) |
| `TEXTO5`  | Status (`NS`, `FT`, `1H`, `2H`, etc.) |
| `DATE`    | Data/hora `"YYYY-MM-DD HH:MM:SS"` (horário Brasil) |

Função `parseItemFootball()` extrai do JSON de `TEXTO2`: fixtureId, round, status, data, homeId, awayId, homeName, awayName, homeLogo, awayLogo, goalsHome, goalsAway, penHome, penAway, venue, elapsed, extra.

---

## Mapeamento R32 — fixtureId → Slot

**CRÍTICO**: O bracket da Copa 2026 tem 16 slots na R32. Cada fixtureId da API-Football
deve ser mapeado para o slot correto conforme a estrutura oficial do torneio.

O mapa fica em `master.js` na variável `FIXTURE_SLOT_MAP`:

```javascript
var FIXTURE_SLOT_MAP = {
    // Lado esquerdo (L1-L8)
    '1561329': { CATEGORY: 'R32', SUBTITULO: '3' },  // M73  RSA×CAN
    '1562345': { CATEGORY: 'R32', SUBTITULO: '4' },  // M75  NED×MAR
    '1562586': { CATEGORY: 'R32', SUBTITULO: '7' },  // M81  USA×BIH
    // Lado direito (R1-R8)
    '1562344': { CATEGORY: 'R32', SUBTITULO: '9' },  // M76  BRA×JPN
};
```

### Tabela dos 16 slots R32

| Slot | ID DOM | Partida FIFA | Confronto |
|------|--------|-------------|-----------|
| R32_1 | `m-r32-l1` | M74 | 1ºE × 3ºABCDF |
| R32_2 | `m-r32-l2` | M77 | 1ºI × 3ºCDFGH |
| **R32_3** | `m-r32-l3` | **M73** | **África do Sul × Canadá** |
| **R32_4** | `m-r32-l4` | **M75** | **Holanda × Marrocos** |
| R32_5 | `m-r32-l5` | M83 | 2ºK × 2ºL |
| R32_6 | `m-r32-l6` | M84 | 1ºH × 2ºJ |
| **R32_7** | `m-r32-l7` | **M81** | **EUA × Bósnia** |
| R32_8 | `m-r32-l8` | M82 | 1ºG × 3ºAEHIJ |
| **R32_9** | `m-r32-r1` | **M76** | **Brasil × Japão** |
| R32_10 | `m-r32-r2` | M78 | 2ºE × 2ºI |
| R32_11 | `m-r32-r3` | M79 | 1ºA × 3ºCEFHI |
| R32_12 | `m-r32-r4` | M80 | 1ºL × 3ºEHIJK |
| R32_13 | `m-r32-r5` | M86 | 1ºJ × 2ºH |
| R32_14 | `m-r32-r6` | M88 | 2ºD × 2ºG |
| R32_15 | `m-r32-r7` | M85 | 1ºB × 3ºEFGIJ |
| R32_16 | `m-r32-r8` | M87 | 1ºK × 3ºDEIJL |

### Mapeamento automático — 2 camadas (sem intervenção manual)

O template identifica o slot correto automaticamente em **3 níveis**:

**Camada 1 — `FIXTURE_SLOT_MAP` (fixtureId → slot)**
Lookup direto pelo `TITULO` do XML. Mais confiável. Confirmados conforme chegam na API.

**Camada 2 — `TEAMS_SLOT_MAP` (teamId → slot)**
Fallback automático por combinação de teamIds (`homeId|awayId`).
Cobre casos onde a partida chega na API antes do fixtureId estar no mapa.
Verifica: `homeId|awayId`, `awayId|homeId`, `homeId` isolado, `awayId` isolado.

**Camada 3 — Fallback por data**
Para partidas que não se encaixam em nenhum mapa (R16, QF, SF, FINAL, BRONZE),
ordena por data e atribui os próximos slots livres sequencialmente.

```
nova partida R32 chega na API
  ├─ FIXTURE_SLOT_MAP[fixtureId]?  → usa slot fixo          ✅ mais preciso
  ├─ TEAMS_SLOT_MAP[homeId|awayId]? → usa slot por times     ✅ auto
  └─ nenhum mapa encontrado        → próximo slot livre      ⚠️ menos preciso
```

Para confirmar um novo fixtureId (opcional, melhora precisão):
1. Ver o `fixtureId` nos logs do console: `camada2 teams=X|Y → R32_N`
2. Adicionar em `FIXTURE_SLOT_MAP`: `'XXXXXXX': { CATEGORY: 'R32', SUBTITULO: 'N' }`

Para R16, QF, SF, FINAL e BRONZE: fallback por data (ordenar e atribuir 1..N).

---

## Controle de Playlist

| Método | Quando chamar |
|--------|---------------|
| `loader.loaded()` | ✅ Após renderizar o bracket (antes da intro) |
| `loader.finished()` | ✅ Após todo o tempo de exibição (entrada + zoom + foco) |

Tempo total sem intro: 10s | Com intro: (duração TEXT2) + 5s

---

## Animações

### Entrada (stagger)
32 cards + labels aparecem em sequência (fora → centro), R32 primeiro, Final por último.
Controlado por `animarEntradaBracket()` + `STAGGER_ORDER`.

### Zoom (4 cantos rotativos)
Após a entrada, o bracket escala 2x focado em um canto. A cada reload o canto alterna:
`top left → bottom left → top right → bottom right → ...`

O lado (left/right) é determinado por onde estão as partidas com times definidos.
O top/bottom alterna via `localStorage` (`bracket_zoom_tb_idx`).

### Destaques
- **Brasil**: card com glow amarelo (`match-brasil`, `brasil-row`)
- **Vencedor**: linha do vencedor com classe `winner`, perdedor `loser`
- **Caminho do vencedor**: cards encerrados recebem `winner-path`
- **Partida mais recente**: card com `match-highlight`

---

## Patrocinador (D_SPD)

| Campo | Descrição |
|-------|-----------|
| `FILE_IMAGE1` | Vídeo/imagem de intro |
| `IMAGE_LOGO` | Logo no rodapé |
| `TEXT1` | Frase do patrocinador |
| `TEXT2` | Duração da intro (segundos) |
| `COLOR1` | Cor de destaque |
| `COLOR2` | Cor de fundo |
| `COLOR3` | Cor de texto |

Se `TEXT2` vazio: vídeo roda até o fim. Se `TEXT2` preenchido: corta no tempo indicado.

---

## Histórico de Correções (jun/2026)

| Data | Problema | Solução |
|------|----------|---------|
| 26/jun | `playerView` sobrescrito pelo `preview.js` | Removido stub vazio do `preview.js` |
| 26/jun | Loader disparava 2x, duplicando animações | Guard `_playerViewExecutando` com reset em `finished()` |
| 26/jun | Zoom rotacional usava localStorage com duplo avanço | Alternância top/bottom com `localStorage` corrigida |
| 26/jun | Times posicionados lado errado (ordenados por data) | Mapa hardcoded `FIXTURE_SLOT_MAP` por fixtureId |
| 26/jun | XHR manual desnecessário | Substituído por `loader.addData()` + `loader.datalist()` nativo EBHTML |
| 26/jun | TEXTO3 usado em vez de TEXTO2 | Migrado para `TEXTO2` com JSON API-Football |

---

## Links úteis

- `MAPEAMENTO_CONSULTAS.md` — Documentação de referência das consultas EdgeContents
- `futebol_placar_classificacao_v23/` — Template referência (mesmo padrão EBHTML)
- `segundafase_futebol/` — Template similar para confrontos individuais (2ª fase)
- `.github/copilot-instructions.md` — Regras de código ES5 e EBHTML

**Exemplo prático:**

| Estado dos dados               | Resultado visual                        |
|--------------------------------|-----------------------------------------|
| R32: todos definidos, R16: parcial | R32 visível (R16 ainda incompleto) |
| R16: todos definidos, QF: parcial  | R32 some, R16 visível               |
| QF: todos definidos, SF: parcial   | R32 e R16 somem, QF visível         |

### Destaque de vencedor/perdedor

Quando `STATUS` é `FT`, `AET` ou `PEN`, a função `aplicarResultado()` adiciona:
- `.winner` na linha do time com mais gols → nome em amarelo dourado
- `.loser` na linha do time perdedor → opacidade reduzida

---

## Conectores SVG (`bracket-draw.js`)

Desenhados sobre um `<svg id="bracket-svg">` posicionado em `absolute` cobrindo toda a `.bracket-area` (z-index 0, atrás dos cards que ficam em z-index 1).

Cada conexão é definida no array `CONNECTIONS` com tipo `merge` (2 → 1) ou `single` (1 → 1):

- **merge**: 4 linhas — horizontal de cada source até o ponto médio, vertical ligando os dois, horizontal do ponto médio até o target
- **single**: 3 linhas — horizontal da source até coluna intermediária, vertical, horizontal até o target

Conectores do lado esquerdo saem pela borda direita dos cards (`side: 'right'`).
Conectores do lado direito saem pela borda esquerda (`side: 'left'`).

Redesenho automático no `window.resize` (debounce 150ms).

---

## Tempo de exibição

| Cenário | Intro (`D_SPD.FILE_IMAGE1`) | Conteúdo (bracket) | Total |
|---------|----------------------------|-------------------|-------|
| Com intro | `DURACAO` em segundos (`D_SPD`, `CONFIG='1'`) | **5 s fixos** | intro + 5s |
| Sem intro | — | **10 s** | 10 s |

**Fallback** (sem `DURACAO` válido): vídeo até `ended`; imagem **5 s**.

Produção: partidas em `D_FOOTBALL.TEXTO3` (JSON). Patrocinador e `DURACAO` em `D_SPD`.

---

## Configurações do mock (`mock-data.js`)

```javascript
var MOCK_DATA = {
    enabled: true,
    D_SPD: {
        CONFIG: '1',
        FILE_IMAGE1: 'img/sponsor.mp4',
        DURACAO: '8'   // segundos da intro
    },
    partidas: [ /* array de partidas */ ]
};
```

---

## Checklist de produção

- [ ] `MOCK_DATA.enabled = false` **ou** comentar `<script src="js/mock-data.js">` no HTML
- [ ] `npm run build` executado
- [ ] Dataset `D_COPA` configurado no EdgeContents com todos os campos
- [ ] Vídeo de background presente em `img/`
- [ ] Fontes Roboto presentes em `css/fonts/`
