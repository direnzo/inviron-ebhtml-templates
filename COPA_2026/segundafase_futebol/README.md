# segundafase_futebol

Template de Digital Signage para a **fase eliminatória** da Copa FIFA 2026, em **uma chave por reload** — pensado para painéis LED, telas pequenas e baixa resolução.

Alternativa visual ao [`caminhos_futebol`](../caminhos_futebol/) (chaveamento com cards e SVG): mesmos dados, exibição em blocos didáticos.

## O que exibe

- **Uma chave por reload** (rotação automática via `localStorage`):
  - **R32 — Segundas de Final**: 4 chaves de 4 jogos
  - **R16 — Oitavas de Final**: 2 chaves de 4 jogos
  - **QF — Quartas de Final**: 1 chave de 4 jogos
  - **SF — Semifinais**: 1 chave de 2 jogos
  - **Final** e **3º Lugar**: card único em destaque
- Texto explicativo no topo: *"Os vencedores destes jogos avançam para as Oitavas de Final"* (e variações por fase)
- Cada confronto exibe **data · hora · local**, bandeiras, placar e status
- Para times **a definir**, placeholders didáticos:
  - `Vencedor: Brasil × Costa do Marfim` (quando os dois times do jogo anterior já são conhecidos)
  - `Vencedor do Jogo 4 (Oitavas)` (quando o jogo anterior também depende)
  - `Vencedor / Perdedor da 1ª (ou 2ª) Semifinal` (para Final e 3º Lugar)
  - `1º do Grupo E`, `3º entre Grupos A/B/C/D/F` (para R32, expandindo `1ºE` / `3ºABCDF` do XML)

## Dados (EdgeContents)

| Dataset | Campo | Descrição |
|---------|-------|-----------|
| `D_FOOTBALL` | `TEXTO3` | JSON array de partidas (igual `caminhos_futebol`) |
| `D_FOOTBALL_TEAMS` | `TITULO`, `TEXTO2`, `TEXTO3`, `FOTO1` | **OBRIGATÓRIO** — Tradução de IDs → nomes PT-BR, códigos e bandeiras (`amount=0`) |
| `D_SPD` `CONFIG='1'` | `FILE_IMAGE1`, `IMAGE_LOGO`, `TEXT1`, `TEXT2`, `COLOR1`, `COLOR2`, `COLOR3` | Intro, patrocinador, cores |

### Campos D_SPD (Sponsor)
- `CONFIG='1'`: Identificador do patrocinador
- `TEXT1`: Label do patrocinador (ex: "Apoio:")
- `TEXT2`: Duração vídeo/imagem intro em **segundos** (ex: "8") — se vazio, vídeo toca até `ended`
- `FILE_IMAGE1`: URL do vídeo/imagem de intro
- `IMAGE_LOGO`: Logo do patrocinador
- `COLOR1`: Cor destaque (#hex)
- `COLOR2`: Cor escura (#hex)
- `COLOR3`: Cor clara (#hex)

### Campos por partida (D_FOOTBALL.TEXTO3)
`CATEGORY` (fase), `SUBTITULO` (posição), `TITULO`/`TITULO2` (IDs dos times), `FOTO`/`FOTO2`, `TEXTO`/`TEXTO2`, `SUBTITULO3` (status), **`SUBTITULO2`** (`DD/MM · HH:MM · Cidade` — local opcional, separado por `·`).

**IMPORTANTE:** `TITULO`/`TITULO2` são IDs numéricos dos times. O template busca automaticamente `D_FOOTBALL_TEAMS` para traduzir para nomes em PT-BR.

## Funções Auxiliares

- **`traduzirFase(texto)`**: Traduz nomes de fase EN → PT-BR (ex: "Quarter-Finals" → "Quartas de Final")
- **`sanitizarNomeTorneio(texto)`**: Remove "FIFA", "World Cup" → "O Mundo em Campo"
- **`buscarTodosOsTimesDeUmaVez(callback)`**: XMLHttpRequest para `/content/data/D_FOOTBALL_TEAMS?amount=0`, retorna `teamsMap` com `{ teamId: { nome, codigo, bandeira } }`
- **`processarDadosMock(partidas, teamsMap)`**: Traduz IDs dos times para nomes PT-BR usando teamsMap

## Tempo de exibição

- **Conteúdo**: 10s por chave (padrão)
- **Intro** (opcional): `D_SPD.DURACAO` segundos, ou até `ended` para vídeo (5s fallback para imagem)

Rotação: `localStorage` chave `segundafase_futebol_chave_idx` — incrementa a cada reload, gera 10 ciclos completos (4 R32 + 2 R16 + 1 QF + 1 SF + 1 Final + 1 Bronze).

## Desenvolvimento local

```bash
npm run dev   # tailwind --watch (CSS)
# http://localhost:12099/FILES/1/index.html
```

Mock: `js/mock-data.js` habilitado no `index.html`. Para produção, comentar o `<script>` do mock.

## Produção

- [ ] Comentar `<script src="js/mock-data.js">` no HTML
- [ ] `npm run build`
- [ ] Mesmo `D_FOOTBALL` / `D_SPD` do template `caminhos_futebol`
- [ ] **D_FOOTBALL_TEAMS obrigatório** para tradução de nomes PT-BR
- [ ] D_SPD deve ter `amount=0` no loader (busca CONFIG='1')
- [ ] Campos do sponsor: `COLOR1/2/3` (cores), `TEXT1` (label), `TEXT2` (duração)
- [ ] `SUBTITULO2` deve seguir o formato `DD/MM · HH:MM · Cidade` (local opcional)
- [ ] Fontes Roboto em `css/fonts/` (se usadas no deploy)

## Estrutura

```
segundafase_futebol/
├── index.html
├── js/master.js, preview.js, mock-data.js, ebhtml.js
├── css/input.css, master.css
└── package.json
```
