# Mapeamento de Consultas aos Canais - Templates COPA 2026

Documento de referência para entender como cada template consulta os canais de dados do EdgeContents.

**IMPORTANTE**: Todos os templates devem usar `loader.addData()` (padrão EBHTML). Filtros server-side sempre que possível.

---

## 1. PLACAR_FUTEBOL (Placar Ao Vivo)

### Ordem de consultas:

#### 1.1. D_SPD (Patrocinador)
- **Método**: `loader.addData('D_SPD', false, 'f_config=1')`
- **Filtro**: `f_config=1` (busca APENAS dados do projeto especial)
- **Objetivo**: Obter configurações de intro/sponsor
- **Campos utilizados**:
  - `COLOR1`, `COLOR2`, `COLOR3` = Cores do projeto
  - `TEXT1` = Título/frase sponsor
  - `TEXT2` = Duração em segundos
  - `FILE_IMAGE1` = Vídeo/imagem de intro
  - `IMAGE_LOGO` = Logo do sponsor

#### 1.2. D_SPD (Confrontos)
- **Método**: `loader.addData('D_SPD', false, 'f_config=0')`
- **Filtro**: `f_config=0` (busca dados dos confrontos)
- **Objetivo**: Obter dados do confronto/classificação atual
- **Rotação**: Automática pelo loader (a cada reload busca próximo item)
- **Campo crítico**: `TITLE` determina qual canal consultar:
  - Se `TITLE = "STANDINGS"` (CDATA, maiúsculo) → consultar `D_FOOTBALL_STANDINGS`
  - Se `TITLE = ID numérico` → consultar `D_FOOTBALL` com filtro
- **Campos utilizados (confrontos)**:
  - `TITLE` = "STANDINGS" ou ID da partida
  - `TEXT1` = Nome time casa (opcional, pode vir de D_FOOTBALL)
  - `TEXT2` = Nome time visitante (opcional)
  - `TEXT4` = Status (1H, 2H, FT, etc)
  - `TEXT5` = Gols casa
  - `TEXT6` = Gols visitante
  - `TEXT9` = Tempo decorrido

#### 1.3. D_FOOTBALL_TEAMS (Todos os times - OPCIONAL)
- **Método**: `loader.addData('D_FOOTBALL_TEAMS', false, 'amount=0')`
- **Filtro**: `amount=0` (busca TODOS os times - necessário para lookup)
- **Objetivo**: Mapear ID do time → nome PT-BR + bandeira
- **Observação**: **OPCIONAL para placar_futebol** - o JSON do `D_FOOTBALL.TEXTO2` já contém nomes e logos dos times. Usar apenas se preferir nomes traduzidos em PT-BR do canal.
- **Campos utilizados**:
  - `TITULO` = ID do time (API-Football)
  - `TEXTO2` = Nome em PT-BR
  - `FOTO1` = URL da bandeira
  - `TEXTO3` = Código do time (ex: BRA)

#### 1.4. D_FOOTBALL (condicional - quando TITLE ≠ "STANDINGS")
- **Método**: `loader.addData('D_FOOTBALL', false, 'f_titulo=' + partidaId)`
- **Filtro**: `f_titulo={partidaId}` (jogo específico)
- **Valor do filtro**: Obtido de `D_SPD.TITLE` (f_config=0)
- **Condição**: Usado quando `D_SPD.TITLE` contém um ID numérico
- **Exemplo de consulta**: `D_FOOTBALL?f_titulo=1489371`
- **Campo crítico**: `TEXTO2` = JSON completo da API-Football com todos os dados do confronto
- **Estrutura do JSON** (campo `TEXTO2`):
  ```json
  {
    "response": [
      {
        "fixture": {
          "id": 1489371,
          "date": "2026-06-13T19:00:00-03:00",
          "venue": {
            "id": null,
            "city": null,
            "name": "MetLife Stadium"
          },
          "status": {
            "long": "Not Started",
            "short": "NS",
            "elapsed": null
          },
          "timezone": "America/Sao_Paulo"
        },
        "league": {
          "id": 1,
          "name": "World Cup",
          "country": "World",
          "round": "Group Stage - 1",
          "season": 2026
        },
        "teams": {
          "home": {
            "id": 6,
            "name": "Brazil",
            "logo": "https://media.api-sports.io/football/teams/6.png",
            "winner": null
          },
          "away": {
            "id": 31,
            "name": "Morocco",
            "logo": "https://media.api-sports.io/football/teams/31.png",
            "winner": null
          }
        },
        "goals": {
          "home": null,
          "away": null
        },
        "score": {
          "halftime": { "home": null, "away": null },
          "fulltime": { "home": null, "away": null },
          "extratime": { "home": null, "away": null },
          "penalty": { "home": null, "away": null }
        }
      }
    ]
  }
  ```
- **Outros campos utilizados**:
  - `TITULO` = Fixture ID (mesmo valor do filtro)
  - `SUBTITULO` = Estádio (redundante, já está no JSON)
  - `SUBTITULO2` = Rodada (redundante, já está no JSON)
  - `CATEGORY` = Nome do torneio (redundante, já está no JSON)
  - `DATE` = Data/hora da partida (redundante, já está no JSON)

#### 1.5. D_FOOTBALL_STANDINGS (condicional - quando TITLE = "STANDINGS")
- **Método**: `loader.addData('D_FOOTBALL_STANDINGS', false)`
- **Filtro**: Nenhum (rotação automática de grupos)
- **Condição**: Usado quando `D_SPD.TITLE = "STANDINGS"` (CDATA, maiúsculo)
- **Objetivo**: Obter classificação do grupo atual
- **Rotação**: Automática pelo loader (a cada reload busca próximo grupo)
- **Campos utilizados**:
  - `TEXTO2` = JSON array com classificação
- **Status**: ⚠️ Pendente implementação

---

## 2. TABELA_FUTEBOL (Classificação de Grupos)

### Ordem de consultas:

#### 2.1. D_SPD (Patrocinador)
- **Método**: `loader.addData('D_SPD', false, 'f_config=1')`
- **Filtro**: `f_config=1` (busca APENAS dados do projeto especial)
- **Objetivo**: Obter configurações de intro/sponsor
- **Campos utilizados**: Mesmos do placar_futebol (COLOR1/2/3, TEXT1/2, FILE_IMAGE1, IMAGE_LOGO)

#### 2.2. D_FOOTBALL_STANDINGS
- **Método**: `loader.addData('D_FOOTBALL_STANDINGS', false)`
- **Filtro**: Nenhum (busca próximo grupo automaticamente)
- **Objetivo**: Obter classificação do grupo atual
- **Rotação**: Automática pelo loader (a cada reload busca próximo grupo)
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

#### 2.3. D_FOOTBALL_TEAMS
- **Método**: `loader.addData('D_FOOTBALL_TEAMS', false, 'amount=0')`
- **Filtro**: `amount=0` (busca TODOS os times - necessário para lookup)
- **Objetivo**: Mapear ID do time → nome PT-BR + bandeira
- **Campos utilizados**: Mesmos do placar_futebol

#### 2.4. D_FOOTBALL (Próximos jogos)
- **Método**: `loader.addData('D_FOOTBALL', false)` ou com filtro específico
- **Filtro**: Sem filtro (rotação automática) ou filtrado por grupo/rodada
- **Objetivo**: Exibir próximos jogos relacionados ao grupo atual
- **Observação**: Pode usar filtros como `f_category={grupo}` se disponível
- **Campos utilizados**:
  - `TITULO` = Fixture ID
  - `TEXTO2` = JSON da partida
  - `DATE` = Data/hora
  - `SUBTITULO2` = Rodada

---

## 3. CAMINHOS_FUTEBOL (Chaveamento Eliminatório Completo)

### Ordem de consultas:

#### 3.1. D_FOOTBALL (Dados do bracket)
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

#### 3.2. D_SPD (Patrocinador)
- **Método**: `loader.addData('D_SPD', false, 'f_config=1')`
- **Filtro**: `f_config=1` (busca APENAS dados do projeto especial)
- **Objetivo**: Obter configurações de intro/sponsor
- **Campos utilizados**: Mesmos do placar_futebol

#### 3.3. D_FOOTBALL_TEAMS
- **Método**: `loader.addData('D_FOOTBALL_TEAMS', false, 'amount=0')`
- **Filtro**: `amount=0` (busca TODOS os times - necessário para lookup)
- **Objetivo**: **OBRIGATÓRIO** - Traduzir IDs dos times (TITULO/TITULO2) para nomes PT-BR + bandeiras
- **Campos utilizados**: Mesmos do placar_futebol

---

## 4. SEGUNDAFASE_FUTEBOL (Chaveamento por Blocos)

### Ordem de consultas:

#### 4.1. D_FOOTBALL (Dados das chaves)
- **Método**: `loader.addData('D_FOOTBALL', false)`
- **Filtro**: Nenhum (busca primeiro registro)
- **Campo crítico**: `TEXTO3` = JSON array com TODAS as partidas
- **Estrutura do JSON**: Mesma do caminhos_futebol
- **Observação**: Rotação de chaves feita por lógica interna do template

#### 4.2. D_SPD (Patrocinador)
- **Método**: `loader.addData('D_SPD', false, 'f_config=1')`
- **Filtro**: `f_config=1` (busca APENAS dados do projeto especial)
- **Objetivo**: Obter configurações de intro/sponsor
- **Campos utilizados**: Mesmos do placar_futebol

#### 4.3. D_FOOTBALL_TEAMS
- **Método**: `loader.addData('D_FOOTBALL_TEAMS', false, 'amount=0')`
- **Filtro**: `amount=0` (busca TODOS os times - necessário para lookup)
- **Objetivo**: **OBRIGATÓRIO** - Traduzir IDs dos times para nomes PT-BR + bandeiras
- **Campos utilizados**: Mesmos do placar_futebol

---

## Regras e Padrões Críticos

### 1. Padrão de Consulta (EBHTML)

**SEMPRE use `loader.addData()`** - nunca XMLHttpRequest direto:
```javascript
// ✅ CORRETO
loader.addData('D_SPD', false, 'f_config=1');
loader.addData('D_FOOTBALL', false, 'f_titulo=1234567');
loader.addData('D_FOOTBALL_TEAMS', false, 'amount=0');

// ❌ ERRADO
var xhr = new XMLHttpRequest();
xhr.open('GET', '/content/data/D_FOOTBALL_TEAMS?amount=0', true);
```

### 2. Uso de Filtros

#### Filtros específicos (preferencial):
- `f_config=1` → Busca apenas projeto especial (CONFIG=1)
- `f_config=0` → Busca apenas confrontos (CONFIG=0)
- `f_titulo={ID}` → Busca jogo específico por ID
- `f_tipo=10` → Busca apenas TYPE=10 (se necessário)

#### `amount=0` (usar apenas quando necessário):
- ✅ `D_FOOTBALL_TEAMS` → necessário para lookup completo de todos os times
- ⚠️ `D_FOOTBALL_STANDINGS` → evitar; sem filtro já rotaciona grupos automaticamente
- ⚠️ `D_FOOTBALL` → evitar; usar filtros específicos (`f_titulo={ID}`)
- ⚠️ `D_SPD` → evitar; usar `f_config=1` ou `f_config=0` (rotação automática)

### 3. Campo TITLE do D_SPD (f_config=0)

**Formato no XML:**
```xml
<!-- Exemplo 1: ID de confronto -->
<TITLE>
<![CDATA[ 1489371 ]]>
</TITLE>

<!-- Exemplo 2: Classificação -->
<TITLE>
<![CDATA[ STANDINGS ]]>
</TITLE>
```

**Lógica de verificação:**
```javascript
var partidaId = obterValor(spdData, 'TITLE').trim();

if (partidaId.toUpperCase() === 'STANDINGS') {
    // Consultar D_FOOTBALL_STANDINGS (rotação automática)
    loader.addData('D_FOOTBALL_STANDINGS', false);
} else {
    // Consultar D_FOOTBALL com filtro usando o ID do TITLE
    // Exemplo: D_FOOTBALL?f_titulo=1489371
    loader.addData('D_FOOTBALL', false, 'f_titulo=' + partidaId);
}
```

**Valores possíveis:**
- `"STANDINGS"` (CDATA, qualquer case) → Consultar classificação
- `"1489371"` (ID numérico do confronto) → Consultar jogo específico via `f_titulo={ID}`

**Importante**: O ID retornado no `D_SPD.TITLE` é usado como parâmetro de filtro (`f_titulo`) para trazer o resultado exato do confronto desejado no `D_FOOTBALL`.

### 4. Ordem de Consultas Recomendada

Para templates que exibem confrontos/classificação:

1. **D_SPD** (`f_config=1`) → Patrocinador/cores
2. **D_SPD** (`f_config=0`) → Confronto/classificação atual (rotação automática)
3. **D_FOOTBALL_TEAMS** (`amount=0`) → Lookup de times (opcional, se precisar nomes PT-BR)
4. **Condicional**:
   - Se `TITLE = "STANDINGS"` → **D_FOOTBALL_STANDINGS**
   - Se `TITLE = ID` → **D_FOOTBALL** (`f_titulo={ID}`)

**Exemplo de processamento do JSON:**
```javascript
// Após carregar D_FOOTBALL
var footballData = loader.data('D_FOOTBALL');
var jsonStr = obterValor(footballData, 'TEXTO2');
var apiData = JSON.parse(jsonStr);

// Acessar dados do confronto
var fixture = apiData.response[0];
var homeTeam = fixture.teams.home;    // { id: 6, name: "Brazil", logo: "..." }
var awayTeam = fixture.teams.away;    // { id: 31, name: "Morocco", logo: "..." }
var goalsHome = fixture.goals.home;    // null (jogo não iniciado) ou número
var goalsAway = fixture.goals.away;
var status = fixture.fixture.status.short; // "NS", "1H", "HT", "2H", "FT", etc
var venue = fixture.fixture.venue.name;    // "MetLife Stadium"
var round = fixture.league.round;          // "Group Stage - 1"
```

### 5. Rotação Automática pelo Loader

**IMPORTANTE**: A rotação é gerenciada automaticamente pelo loader do EdgeContents.

- **Não usar localStorage** para controle de rotação
- A cada `loader.load()`, o sistema retorna automaticamente o próximo item da sequência
- Filtros server-side garantem que apenas dados relevantes sejam carregados
- Template deve apenas processar o dado retornado, sem gerenciar índices

```javascript
// ✅ CORRETO - loader gerencia rotação
loader.addData('D_SPD', false, 'f_config=0');
loader.load(function() {
    var confronto = loader.data('D_SPD'); // Próximo item automaticamente
    processarConfonto(confronto);
});

// ❌ ERRADO - não gerenciar rotação manualmente
var idx = parseInt(localStorage.getItem('idx'), 10);
localStorage.setItem('idx', idx + 1);
```

---

## Resumo Rápido

| Template | D_SPD Config=1 | D_SPD Config=0 | D_FOOTBALL | D_FOOTBALL_TEAMS | D_FOOTBALL_STANDINGS |
|----------|----------------|----------------|------------|------------------|----------------------|
| **placar_futebol** | `f_config=1`<br>Sponsor | `f_config=0`<br>Confronto atual | Condicional<br>`f_titulo={ID}`<br>JSON em TEXTO2 | Opcional<br>`amount=0`<br>Nomes PT-BR | Condicional<br>se TITLE="STANDINGS" |
| **tabela_futebol** | `f_config=1`<br>Sponsor | ❌ | Sem filtro<br>Próximos jogos | `amount=0`<br>Lookup obrigatório | Sem filtro<br>Grupo atual |
| **caminhos_futebol** | `f_config=1`<br>Sponsor | ❌ | Sem filtro<br>TEXTO3 (JSON) | `amount=0`<br>Lookup obrigatório | ❌ |
| **segundafase_futebol** | `f_config=1`<br>Sponsor | ❌ | Sem filtro<br>TEXTO3 (JSON) | `amount=0`<br>Lookup obrigatório | ❌ |

---

## Status de Implementação

| Template | Consultas Corretas | Observações |
|----------|-------------------|-------------|
| **placar_futebol** | ⚠️ Parcial | Precisa trocar XMLHttpRequest por loader.addData |
| **tabela_futebol** | ⚠️ Parcial | Precisa trocar XMLHttpRequest por loader.addData |
| **caminhos_futebol** | ⚠️ Parcial | Precisa trocar XMLHttpRequest por loader.addData |
| **segundafase_futebol** | ⚠️ Parcial | Precisa trocar XMLHttpRequest por loader.addData |
