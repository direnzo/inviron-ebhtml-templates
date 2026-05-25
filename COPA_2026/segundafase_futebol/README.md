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
| `D_SPD` `CONFIG='1'` | `FILE_IMAGE1`, `DURACAO`, `TEXT1`, `IMAGE_LOGO`, `TEXTO7-9` | Intro, patrocinador, cores |

Campos por partida: `CATEGORY` (fase), `SUBTITULO` (posição), `TITULO`/`TITULO2`, `FOTO`/`FOTO2`, `TEXTO`/`TEXTO2`, `SUBTITULO3` (status), **`SUBTITULO2`** (`DD/MM · HH:MM · Cidade` — local opcional, separado por `·`).

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
- [ ] `SUBTITULO2` deve seguir o formato `DD/MM · HH:MM · Cidade` (local opcional)
- [ ] Fontes Roboto em `css/fonts/` (se usadas no deploy)
- [ ] `DURACAO` no item patrocinador

## Estrutura

```
segundafase_futebol/
├── index.html
├── js/master.js, preview.js, mock-data.js, ebhtml.js
├── css/input.css, master.css
└── package.json
```
