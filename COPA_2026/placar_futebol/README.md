# placar_futebol

Template de placar ao vivo para EdgeContents Digital Signage — Copa do Mundo 2026.

- Um jogo por exibição (pré-jogo, ao vivo, intervalo, pênaltis, encerrado)
- Dados ao vivo via `D_SPD` TYPE=10; dados estáticos via `D_FOOTBALL`
- Layout responsivo (Tailwind, ES5)

## Tempo de exibição

| Cenário | Intro (`D_SPD.FILE_IMAGE1`) | Conteúdo (placar) | Total |
|---------|----------------------------|-------------------|-------|
| Com intro | `DURACAO` segundos (`D_SPD`, `CONFIG='1'`) | **5 s fixos** | intro + 5s |
| Sem intro | — | **10 s** | 10 s |

**Fallback** (sem `DURACAO` válido): vídeo até `ended`; imagem **5 s**.

## Datasets

| Dataset | Uso |
|---------|-----|
| `D_SPD` TYPE=10 | Placar dinâmico; `TITLE` = ID da partida |
| `D_FOOTBALL` | Times, escudos, estádio, fase — `TEXTO` = ID da partida |
| `D_SPD` CONFIG=1 | Patrocinador: `FILE_IMAGE1`, `DURACAO`, `IMAGE_LOGO`, cores `TEXTO7-9` |

## Uso local

1. `npm run dev`
2. Habilitar `js/mock-data.js` no HTML
3. Abrir `http://localhost:12099/FILES/1/index.html`

Cenários de teste em `js/mock-data.js` (variável `cenario` ou rotação aleatória).

## Produção

- Comentar `<script src="js/mock-data.js">` no HTML
- `npm run build`
- Configurar playlists `D_SPD` e `D_FOOTBALL` no EdgeContents
