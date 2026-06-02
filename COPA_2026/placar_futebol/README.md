# placar_futebol

Template de placar ao vivo para EdgeContents Digital Signage — Copa do Mundo 2026.

- Um jogo por exibição (pré-jogo, ao vivo, intervalo, pênaltis, encerrado)
- Dados ao vivo via `D_SPD` TYPE=10; dados estáticos via `D_FOOTBALL`
- **Nomes PT-BR via D_FOOTBALL_TEAMS** (integração automática)
- Layout responsivo (Tailwind, ES5)

## Tempo de exibição

| Cenário | Intro (`D_SPD.FILE_IMAGE1`) | Conteúdo (placar) | Total |
|---------|----------------------------|-------------------|-------|
| Com intro | **TEXT2** segundos (D_SPD CONFIG=1) | **5 s fixos** | intro + 5s |
| Sem intro | — | **10 s** | 10 s |

**Controle de duração de vídeo/imagem (TEXT2):**
- Se TEXT2 tem valor (ex: `5`): vídeo é **cortado** após 5 segundos
- Se TEXT2 vazio: vídeo roda **até o fim** (evento `ended`)
- Imagens: TEXT2 ou **5 s padrão** (DURACAO_IMAGEM_PADRAO_MS)

**IMPORTANTE:** Campo DURACAO foi DEPRECIADO. Use TEXT2.

## Datasets

| Dataset | Uso | Campos principais | Consulta |
|---------|-----|-------------------|----------|
| **D_SPD** TYPE=10 | Placar dinâmico | `TITLE` = ID da partida (fixture ID) | `amount=0` |
| **D_FOOTBALL** | Dados estáticos | `TITULO` = fixture ID, `TEXTO2` = JSON da API-Football | `f_titulo={fixtureId}` |
| **D_FOOTBALL_TEAMS** | Times traduzidos | `TITULO` = team ID, `TEXTO2` = nome PT-BR, `FOTO1` = bandeira HTTP | `amount=0` |
| **D_SPD** CONFIG=1 | Patrocinador global | `FILE_IMAGE1`, `TEXT2` (duração), `IMAGE_LOGO`, `TEXT1` (título), cores `COLOR1-3` | Incluído em D_SPD |

**Cores do Patrocinador (D_SPD CONFIG=1):**
- `COLOR1` = Cor de destaque (ex: `#FBBF24` ou `FBBF24`)
- `COLOR2` = Cor escura (ex: `#006400`)
- `COLOR3` = Cor clara (ex: `#FFFFFF`)
- Se não informadas, usa as cores padrão do CONFIG

**Modo Preview (Extranet):**
- Extrai COLOR1/2/3, FILE_IMAGE1, IMAGE_LOGO, TEXT1, TEXT2 do formulário
- Aplica cores dinâmicas via `mergeColorsFromSpd()`
- Suporta intro de vídeo/imagem com controle de duração

**IMPORTANTE:** O template busca automaticamente D_FOOTBALL_TEAMS para nomes PT-BR dos times. Os nomes em inglês do JSON são ignorados.

## Troubleshooting

**⚠️ REGRA CRÍTICA: Nomes SEMPRE em PT-BR**
- NUNCA exibe nome em inglês (mesmo que venha no JSON da API-Football)
- SEMPRE usa `TEXTO2` do D_FOOTBALL_TEAMS
- Se time não cadastrado: exibe `[Time ID]` como placeholder

**Times aparecendo como `[Time 123]`:**
- **Causa:** Time não existe no D_FOOTBALL_TEAMS
- **Log:** `ERRO CRITICO: Time ID=123 NAO encontrado no D_FOOTBALL_TEAMS!`
- **Solução:** Adicionar registro no D_FOOTBALL_TEAMS:
  ```xml
  <ITEM>
    <TITULO>123</TITULO>              <!-- ID exato da API-Football -->
    <TEXTO2>Nome em Português</TEXTO2>
    <TEXTO3>CÓD</TEXTO3>               <!-- Ex: BRA, ARG -->
    <FOTO1>http://...bandeira</FOTO1>
  </ITEM>
  ```

**Patrocinador não aparece:**
- Verificar se existe item `CONFIG='1'` no D_SPD
- Patrocinador é **global** (aparece em todos os jogos)
- Campos: `TEXT1` (frase), `IMAGE_LOGO` (logo), `FILE_IMAGE1` (intro)

## Uso local

1. `npm run dev`
2. Habilitar `js/mock-data.js` no HTML
3. Abrir `http://localhost:12099/FILES/1/index.html`

Cenários de teste em `js/mock-data.js` (variável `cenario` ou rotação aleatória).

## Produção

- Comentar `<script src="js/mock-data.js">` no HTML
- `npm run build`
- Configurar playlists `D_SPD`, `D_FOOTBALL` e `D_FOOTBALL_TEAMS` no EdgeContents
