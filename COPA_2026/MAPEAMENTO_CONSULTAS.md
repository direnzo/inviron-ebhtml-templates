# Mapeamento de Consultas aos Canais - Templates COPA 2026

Documento de referência para entender como cada template consulta os canais de dados do EdgeContents.

---

## 1. PLACAR_FUTEBOL (Placar Ao Vivo)

### Consultas realizadas:

#### 1.1. D_SPD
- **Método**: `loader.addData('D_SPD', false, 'amount=0')`
- **Filtro**: `amount=0` (busca TODOS os registros)
- **Separação por CONFIG/TYPE**:
  - `CONFIG='1'` → Dados do patrocinador (intro/sponsor)
  - `TYPE='10'` → Dados dos jogos ao vivo
- **Campos utilizados (TYPE=10)**:
  - `TITLE` = ID da partida (usado para filtrar D_FOOTBALL)
  - `TEXT1` = Nome time casa
  - `TEXT2` = Nome time visitante
  - `TEXT4` = Status (1H, 2H, FT, etc)
  - `TEXT5` = Gols casa
  - `TEXT6` = Gols visitante
  - `TEXT9` = Tempo decorrido
- **Campos utilizados (CONFIG=1)**:
  - `COLOR1`, `COLOR2`, `COLOR3` = Cores do projeto
  - `TEXT1` = Título/frase sponsor
  - `TEXT2` = Duração em segundos
  - `FILE_IMAGE1` = Vídeo/imagem de intro
  - `IMAGE_LOGO` = Logo do sponsor

#### 1.2. D_FOOTBALL_TEAMS
- **Método**: XMLHttpRequest
- **URL**: `/content/data/D_FOOTBALL_TEAMS?amount=0`
- **Filtro**: `amount=0` (busca TODOS os times)
- **Objetivo**: Mapear ID do time → nome PT-BR + bandeira
- **Campos utilizados**:
  - `TITULO` = ID do time (API-Football)
  - `TEXTO2` = Nome em PT-BR
  - `FOTO1` = URL da bandeira
  - `TEXTO3` = Código do time (ex: BRA)

#### 1.3. D_FOOTBALL
- **Método**: `loader.addData('D_FOOTBALL', false, 'F_TITULO=' + partidaId)`
- **Filtro**: `F_TITULO={partidaId}` (jogo específico)
- **Valor do filtro**: Obtido de `D_SPD.TITLE` (TYPE=10)
- **Campos utilizados**:
  - `TITULO` = Fixture ID
  - `TEXTO2` = JSON completo da API-Football
  - `SUBTITULO` = Estádio
  - `SUBTITULO2` = Rodada
  - `CATEGORY` = Nome do torneio
  - `DATE` = Data/hora da partida

---

## 2. TABELA_FUTEBOL (Classificação de Grupos)

### Consultas realizadas:

#### 2.1. D_SPD
- **Método**: `loader.addData('D_SPD', false, 'amount=0')`
- **Filtro**: `amount=0` (busca TODOS os registros)
- **Separação por CONFIG**:
  - `CONFIG='1'` → Dados do patrocinador (intro/sponsor)
- **Campos utilizados (CONFIG=1)**: Mesmos do placar_futebol

#### 2.2. D_FOOTBALL_STANDINGS
- **Método**: XMLHttpRequest
- **URL**: `/content/data/D_FOOTBALL_STANDINGS?amount=0`
- **Filtro**: `amount=0` (busca TODOS os registros)
- **Objetivo**: Obter classificação de todos os grupos
- **Campos utilizados**:
  - `TEXTO2` = JSON array com classificação completa
  - Estrutura JSON:
    ```json
    [
      {
        "rank": 1,
        "team": { "id": 6, "name": "Brazil", "logo": "..." },
        "points": 9,
        "goalsDiff": 5,
        "group": "Group A",
        "all": { "played": 3, "win": 3, "draw": 0, "lose": 0 }
      }
    ]
    ```
- **Observação**: Filtra grupos que contenham "Ranking" (remove tabelas auxiliares)

#### 2.3. D_FOOTBALL_TEAMS
- **Método**: XMLHttpRequest
- **URL**: `/content/data/D_FOOTBALL_TEAMS?amount=0`
- **Filtro**: `amount=0` (busca TODOS os times)
- **Objetivo**: Mapear ID do time → nome PT-BR + bandeira
- **Campos utilizados**: Mesmos do placar_futebol

#### 2.4. D_FOOTBALL
- **Método**: XMLHttpRequest
- **URL**: `/content/data/D_FOOTBALL?amount=0`
- **Filtro**: `amount=0` (busca TODOS os jogos)
- **Objetivo**: Exibir próximos jogos do grupo
- **Campos utilizados**:
  - `TITULO` = Fixture ID
  - `TEXTO2` = JSON da partida
  - `DATE` = Data/hora
  - `SUBTITULO2` = Rodada

---

## 3. CAMINHOS_FUTEBOL (Chaveamento Eliminatório Completo)

### Consultas realizadas:

#### 3.1. D_FOOTBALL
- **Método**: `loader.addData('D_FOOTBALL', false)`
- **Filtro**: Nenhum (busca primeiro registro)
- **Campo crítico**: `TEXTO3` = JSON array com TODAS as partidas do bracket
- **Estrutura do JSON**:
  ```json
  [
    {
      "CATEGORY": "R32",
      "SUBTITULO": "1",
      "TITULO": "6",          // ID do time casa
      "TITULO2": "10",        // ID do time visitante
      "FOTO": "",             // Vazio (usar D_FOOTBALL_TEAMS)
      "FOTO2": "",            // Vazio (usar D_FOOTBALL_TEAMS)
      "TEXTO": "2",           // Gols casa
      "TEXTO2": "1",          // Gols visitante
      "SUBTITULO3": "FT",     // Status
      "SUBTITULO2": "2026-06-28 16:00:00" // Data/hora
    }
  ]
  ```

#### 3.2. D_SPD
- **Método**: `loader.addData('D_SPD', false, 'amount=0')`
- **Filtro**: `amount=0` (busca TODOS os registros)
- **Separação por CONFIG**:
  - `CONFIG='1'` → Dados do patrocinador
- **Campos utilizados**: Mesmos do placar_futebol

#### 3.3. D_FOOTBALL_TEAMS
- **Método**: XMLHttpRequest
- **URL**: `/content/data/D_FOOTBALL_TEAMS?amount=0`
- **Filtro**: `amount=0` (busca TODOS os times)
- **Objetivo**: **OBRIGATÓRIO** - Traduzir IDs dos times (TITULO/TITULO2) para nomes PT-BR + bandeiras
- **Campos utilizados**: Mesmos do placar_futebol

---

## 4. SEGUNDAFASE_FUTEBOL (Chaveamento por Blocos)

### Consultas realizadas:

#### 4.1. D_FOOTBALL
- **Método**: `loader.addData('D_FOOTBALL', false)`
- **Filtro**: Nenhum (busca primeiro registro)
- **Campo crítico**: `TEXTO3` = JSON array com TODAS as partidas
- **Estrutura do JSON**: Mesma do caminhos_futebol

#### 4.2. D_SPD
- **Método**: `loader.addData('D_SPD', false, 'amount=0')`
- **Filtro**: `amount=0` (busca TODOS os registros)
- **Separação por CONFIG**:
  - `CONFIG='1'` → Dados do patrocinador
- **Campos utilizados**: Mesmos do placar_futebol

#### 4.3. D_FOOTBALL_TEAMS
- **Método**: XMLHttpRequest
- **URL**: `/content/data/D_FOOTBALL_TEAMS?amount=0`
- **Filtro**: `amount=0` (busca TODOS os times)
- **Objetivo**: **OBRIGATÓRIO** - Traduzir IDs dos times para nomes PT-BR + bandeiras
- **Campos utilizados**: Mesmos do placar_futebol

---

## Observações Importantes

### Sobre o campo TITLE do D_SPD:

1. **Quando TITLE contém um número** (ex: "1234567"):
   - É um ID de partida (fixture ID)
   - Deve ser usado para filtrar `D_FOOTBALL` com `F_TITULO={ID}`
   - Exemplo: `placar_futebol`

2. **Quando TITLE = "standings"**:
   - Indica que deve consultar dados de classificação
   - Deve buscar `D_FOOTBALL_STANDINGS`
   - **IMPORTANTE**: Este caso ainda não está implementado nos templates atuais

### Sobre o uso de XMLHttpRequest:

Todos os templates usam XMLHttpRequest para buscar canais secundários porque:
- `loader.addData()` é limitado a 1 registro por padrão
- XMLHttpRequest permite usar `amount=0` diretamente na URL
- Necessário para carregar TODOS os times, jogos e classificações

### Problema identificado:

**CRITICAL**: Nenhum template atualmente verifica se `D_SPD.TITLE === "standings"` para decidir entre `D_FOOTBALL` ou `D_FOOTBALL_STANDINGS`. Esta lógica precisa ser implementada.

---

## Resumo Rápido

| Template | D_SPD | D_FOOTBALL | D_FOOTBALL_TEAMS | D_FOOTBALL_STANDINGS |
|----------|-------|------------|------------------|----------------------|
| **placar_futebol** | amount=0<br>CONFIG=1 + TYPE=10 | Filtrado<br>F_TITULO={ID} | XMLHttpRequest<br>amount=0 | ❌ Não usa |
| **tabela_futebol** | amount=0<br>CONFIG=1 | XMLHttpRequest<br>amount=0 | XMLHttpRequest<br>amount=0 | XMLHttpRequest<br>amount=0 |
| **caminhos_futebol** | amount=0<br>CONFIG=1 | Sem filtro<br>TEXTO3 (JSON) | XMLHttpRequest<br>amount=0 | ❌ Não usa |
| **segundafase_futebol** | amount=0<br>CONFIG=1 | Sem filtro<br>TEXTO3 (JSON) | XMLHttpRequest<br>amount=0 | ❌ Não usa |
