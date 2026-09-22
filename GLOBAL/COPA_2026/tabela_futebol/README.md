# tabela_futebol

Template para exibição da tabela de grupos da Copa do Mundo 2026 (fase de grupos) para EdgeContents Digital Signage.

- Mostra um grupo por vez, alternando automaticamente
- Layout responsivo (Tailwind compatível Android 7)
- Integração com dados reais da API-Football
- Nomes traduzidos PT-BR e bandeiras HTTP

## Canais de dados (EdgeContents)

| Canal | Uso | Campos principais | Consulta |
|-------|-----|-------------------|----------|
| **D_FOOTBALL_STANDINGS** | Classificação | TEXTO2 (JSON com pontos/jogos/saldo) | Sem filtro |
| **D_FOOTBALL_TEAMS** | Times traduzidos | TITULO (ID), TEXTO2 (nome PT-BR), FOTO1 (bandeira HTTP), TEXTO3 (código) | **Filtrada**: `/D_FOOTBALL_TEAMS?F_TITULO={teamId}` |
| **D_SPD** | Patrocinador | CONFIG=1 (cores, logo, intro), SPECIALPROJECTS (associação) | Sem filtro |

**IMPORTANTE:** D_FOOTBALL_TEAMS requer consulta filtrada por cada ID. O template busca automaticamente via XMLHttpRequest.

## Tempo de exibição

| Cenário | Intro (`D_SPD.FILE_IMAGE1`) | Conteúdo (tabela) | Total |
|---------|----------------------------|-------------------|-------|
| Com intro | **TEXT2** segundos (D_SPD CONFIG=1) | **5 s fixos** | intro + 5s |
| Sem intro | — | **10 s** | 10 s |

**Controle de duração de vídeo/imagem (TEXT2):**
- Se TEXT2 tem valor (ex: `5`): vídeo é **cortado** após 5 segundos
- Se TEXT2 vazio: vídeo roda **até o fim** (evento `ended`)
- Imagens: TEXT2 ou **5 s padrão** (DURACAO_IMAGEM_PADRAO_MS)

**Modo Preview (Extranet):**
- Extrai COLOR1/2/3, FILE_IMAGE1, IMAGE_LOGO, TEXT1, TEXT2 do formulário
- Aplica cores dinâmicas via `mergeColorsFromSpd()`
- Suporta intro de vídeo/imagem com controle de duração

**IMPORTANTE:** Campo DURACAO foi DEPRECIADO. Use TEXT2.

## Uso local

1. `npm run dev` - compilar CSS (watch mode)
2. Habilitar mock-data no HTML: `<script src="js/mock-data.js"></script>`
3. Testar: `http://localhost:12099/FILES/1/index.html`

## Troubleshooting

**⚠️ REGRA CRÍTICA: Nomes SEMPRE em PT-BR**
- NUNCA exibe nome em inglês
- SEMPRE usa TEXTO2 do D_FOOTBALL_TEAMS
- Se time não cadastrado: exibe `[Time ID]` como placeholder

**Times aparecendo como `[Time 123]`:**
- **Causa:** Time não existe no D_FOOTBALL_TEAMS
- **Log:** `ERRO CRITICO: Time ID=123 NAO encontrado no D_FOOTBALL_TEAMS`
- **Solução:** Adicionar registro no D_FOOTBALL_TEAMS:
  ```xml
  <ITEM>
    <TITULO>123</TITULO>              <!-- ID exato do D_FOOTBALL_STANDINGS -->
    <TEXTO2>Nome em Português</TEXTO2>
    <TEXTO3>CÓD</TEXTO3>
    <FOTO1>http://...bandeira</FOTO1>
  </ITEM>
  ```

**Bandeiras não aparecem:**
- Verificar FOTO1 no D_FOOTBALL_TEAMS (deve ser URL HTTP válida)
- Fallback: usa SVG local de `img/flags/` se não encontrar
- Log: `sem FOTO1 no D_FOOTBALL_TEAMS - usando fallback SVG`

**Verificar logs no console:**
```
[tabela_futebol] D_FOOTBALL_TEAMS: 48 times mapeados
[tabela_futebol] D_FOOTBALL_TEAMS[107]: França (FRA) -> OK
[tabela_futebol] Grupos processados: 12
[tabela_futebol] Exibindo: Grupo A (idx 0/12)
```
