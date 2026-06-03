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

#### 1.3. D_FOOTBALL_TEAMS (Dados dos times - OBRIGATÓRIO)
- **Método**: `loader.addData('D_FOOTBALL_TEAMS', false, 'f_titulo=' + teamId)`
- **Filtro**: `f_titulo={teamId}` (time específico por ID)
- **Objetivo**: Obter dados corretos do time (bandeira, nome traduzido, abreviação)
- **Exemplo**: `D_FOOTBALL_TEAMS?f_titulo=6` (Brasil)
- **Importante**: **NÃO usar `amount=0`** - consultar cada time individualmente com seu ID
- **Campos utilizados**:
  - `FOTO` = Bandeira do time (PNG/SVG)
  - `TEXTO2` = Nome traduzido em PT-BR
  - `TEXTO3` = Nome abreviado (3 letras, ex: BRA)
  - `TITULO` = ID do time (mesmo do filtro)
- **Fluxo**: Após obter IDs dos times do `D_FOOTBALL.TEXTO2` (JSON), consultar `D_FOOTBALL_TEAMS` para cada time (casa e visitante)

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

#### 2.3. D_FOOTBALL_TEAMS (OBRIGATÓRIO)
- **Método**: `loader.addData('D_FOOTBALL_TEAMS', false, 'f_titulo=' + teamId)`
- **Filtro**: `f_titulo={teamId}` (time específico por ID)
- **Objetivo**: Obter bandeira, nome traduzido e abreviação corretos
- **Exemplo**: `D_FOOTBALL_TEAMS?f_titulo=6`
- **Campos utilizados**:
  - `FOTO` = Bandeira do time
  - `TEXTO2` = Nome traduzido PT-BR
  - `TEXTO3` = Nome abreviado (3 letras)

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

#### 3.3. D_FOOTBALL_TEAMS (OBRIGATÓRIO)
- **Método**: `loader.addData('D_FOOTBALL_TEAMS', false, 'f_titulo=' + teamId)`
- **Filtro**: `f_titulo={teamId}` (time específico por ID)
- **Objetivo**: Traduzir IDs dos times (TITULO/TITULO2) do bracket para dados corretos
- **Exemplo**: `D_FOOTBALL_TEAMS?f_titulo=6`
- **Campos utilizados**:
  - `FOTO` = Bandeira do time
  - `TEXTO2` = Nome traduzido PT-BR
  - `TEXTO3` = Nome abreviado (3 letras)

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

#### 4.3. D_FOOTBALL_TEAMS (OBRIGATÓRIO)
- **Método**: `loader.addData('D_FOOTBALL_TEAMS', false, 'f_titulo=' + teamId)`
- **Filtro**: `f_titulo={teamId}` (time específico por ID)
- **Objetivo**: Traduzir IDs dos times para dados corretos (bandeira, nome, abreviação)
- **Exemplo**: `D_FOOTBALL_TEAMS?f_titulo=6`
- **Campos utilizados**:
  - `FOTO` = Bandeira do time
  - `TEXTO2` = Nome traduzido PT-BR
  - `TEXTO3` = Nome abreviado (3 letras)

---

## Regras e Padrões Críticos

### 1. Padrão de Consulta (EBHTML)

**SEMPRE use `loader.addData()`** - nunca XMLHttpRequest direto:
```javascript
// ✅ CORRETO
loader.addData('D_SPD', false, 'f_config=1');
loader.addData('D_FOOTBALL', false, 'f_titulo=1489371');
loader.addData('D_FOOTBALL_TEAMS', false, 'f_titulo=6'); // ID do time

// ❌ ERRADO
var xhr = new XMLHttpRequest();
xhr.open('GET', '/content/data/D_FOOTBALL_TEAMS?amount=0', true);
```

### 2. Uso de Filtros

#### Filtros específicos (preferencial):
- `f_config=1` → Busca apenas projeto especial (CONFIG=1)
- `f_config=0` → Busca apenas confrontos (CONFIG=0)
- `f_titulo={ID}` → Busca registro específico por ID
  - Para `D_FOOTBALL`: ID da partida (ex: `f_titulo=1489371`)
  - Para `D_FOOTBALL_TEAMS`: ID do time (ex: `f_titulo=6`)
- `f_tipo=10` → Busca apenas TYPE=10 (se necessário)

#### `amount=0` (usar apenas quando necessário):
- ❌ **D_FOOTBALL_TEAMS** → **NUNCA usar** - sempre filtrar por ID (`f_titulo={teamId}`)
- ⚠️ `D_FOOTBALL_STANDINGS` → evitar; sem filtro já rotaciona grupos automaticamente
- ⚠️ `D_FOOTBALL` → evitar; usar filtros específicos (`f_titulo={ID}`)
- ⚠️ `D_SPD` → evitar; usar `f_config=1` ou `f_config=0` (rotação automática)

**Resumo**: `amount=0` raramente é necessário. Priorize filtros específicos.

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
3. **Condicional**:
   - Se `TITLE = "STANDINGS"` → **D_FOOTBALL_STANDINGS**
   - Se `TITLE = ID` → **D_FOOTBALL** (`f_titulo={ID}`)
4. **D_FOOTBALL_TEAMS** (`f_titulo={teamId}`) → **OBRIGATÓRIO** para cada time do confronto

**Exemplo de processamento completo:**
```javascript
// 1. Carregar D_FOOTBALL
var footballData = loader.data('D_FOOTBALL');
var jsonStr = obterValor(footballData, 'TEXTO2');
var apiData = JSON.parse(jsonStr);
var fixture = apiData.response[0];

// 2. Extrair IDs dos times
var homeTeamId = fixture.teams.home.id;    // ex: 6 (Brasil)
var awayTeamId = fixture.teams.away.id;    // ex: 31 (Marrocos)

// 3. Consultar D_FOOTBALL_TEAMS para time da casa
ebhtml.create2({}, function(loaderHome) {
    loaderHome.addData('D_FOOTBALL_TEAMS', false, 'f_titulo=' + homeTeamId);
    loaderHome.load(function() {
        var homeTeamData = loaderHome.data('D_FOOTBALL_TEAMS');
        var homeBandeira = obterValor(homeTeamData, 'FOTO');
        var homeNome = obterValor(homeTeamData, 'TEXTO2');
        var homeAbrev = obterValor(homeTeamData, 'TEXTO3');
        
        // 4. Consultar D_FOOTBALL_TEAMS para time visitante
        ebhtml.create2({}, function(loaderAway) {
            loaderAway.addData('D_FOOTBALL_TEAMS', false, 'f_titulo=' + awayTeamId);
            loaderAway.load(function() {
                var awayTeamData = loaderAway.data('D_FOOTBALL_TEAMS');
                var awayBandeira = obterValor(awayTeamData, 'FOTO');
                var awayNome = obterValor(awayTeamData, 'TEXTO2');
                var awayAbrev = obterValor(awayTeamData, 'TEXTO3');
                
                // 5. Renderizar com dados completos
                renderizarPlacar({
                    casa: { nome: homeNome, bandeira: homeBandeira, abrev: homeAbrev },
                    visitante: { nome: awayNome, bandeira: awayBandeira, abrev: awayAbrev },
                    gols: { casa: fixture.goals.home, visitante: fixture.goals.away },
                    status: fixture.fixture.status.short
                });
            });
        });
    });
});
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
| **placar_futebol** | `f_config=1`<br>Sponsor | `f_config=0`<br>Confronto atual | Condicional<br>`f_titulo={ID}`<br>JSON em TEXTO2 | **OBRIGATÓRIO**<br>`f_titulo={teamId}`<br>Por time | Condicional<br>se TITLE="STANDINGS" |
| **tabela_futebol** | `f_config=1`<br>Sponsor | ❌ | Sem filtro<br>Próximos jogos | **OBRIGATÓRIO**<br>`f_titulo={teamId}`<br>Por time | Sem filtro<br>Grupo atual |
| **caminhos_futebol** | `f_config=1`<br>Sponsor | ❌ | Sem filtro<br>TEXTO3 (JSON) | **OBRIGATÓRIO**<br>`f_titulo={teamId}`<br>Por time | ❌ |
| **segundafase_futebol** | `f_config=1`<br>Sponsor | ❌ | Sem filtro<br>TEXTO3 (JSON) | **OBRIGATÓRIO**<br>`f_titulo={teamId}`<br>Por time | ❌ |

---

## Status de Implementação

| Template | Consultas Corretas | Observações |
|----------|-------------------|-------------|
| **placar_futebol** | ⚠️ Parcial | Precisa trocar XMLHttpRequest por loader.addData |
| **tabela_futebol** | ⚠️ Parcial | Precisa trocar XMLHttpRequest por loader.addData |
| **caminhos_futebol** | ⚠️ Parcial | Precisa trocar XMLHttpRequest por loader.addData |
| **segundafase_futebol** | ⚠️ Parcial | Precisa trocar XMLHttpRequest por loader.addData |
