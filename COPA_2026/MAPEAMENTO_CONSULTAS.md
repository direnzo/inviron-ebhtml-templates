# Mapeamento de Consultas aos Canais - Templates COPA 2026

Documento de referência para entender como cada template consulta os canais de dados do EdgeContents.

**IMPORTANTE**: Todos os templates devem usar `loader.addData()` (padrão EBHTML). Filtros server-side sempre que possível.

---

## ⚠️ ESPECIFICAÇÃO OFICIAL (Backend)

### Origem dos dados principais:

1. **Dados dos jogos**: `D_SPD?f_config=0&f_type=10`
2. **Configurações visuais**: `D_SPD?f_config=1&f_specialproject=spdata<SPECIALPROJECT>`

### Fluxo de decisão principal:

```javascript
// Verificar campo TITLE do D_SPD
if (spdata.TITLE === 'STANDINGS') {
    // Fluxo de classificação
} else {
    // Fluxo de partida (TITLE contém ID da partida)
}
```

### Mapeamento de campos (Config):

| Campo Backend | Canal/Campo | Descrição |
|---------------|-------------|-----------|
| `corPrimaria` | `config<COLOR1>` | Cor primária do projeto |
| `corSecundaria` | `config<COLOR2>` | Cor secundária |
| `corTexto` | `config<COLOR3>` | Cor do texto |
| `texto` | `config<TEXT1>` | Título/frase do sponsor |
| `logo` | `config<IMAGE_LOGO>` | Logo do sponsor |
| `vinheta` | `config<FILE_IMAGE1>` | Vídeo/imagem de intro |
| `duracaoVinheta` | `config<TEXT2>` | Duração em segundos |

---

## 1. PLACAR_FUTEBOL (Placar Ao Vivo)

### Ordem de consultas:

#### 1.1. D_SPD (Patrocinador)
- **Método**: `loader.addData('D_SPD', false, 'f_config=1&f_specialproject=spdata' + specialProjectId)`
- **Filtro**: `f_config=1&f_specialproject=spdata{SPECIALPROJECT}` (projeto especial específico)
- **Objetivo**: Obter configurações de intro/sponsor
- **Campos utilizados**:
  - `COLOR1` = Cor primária do projeto
  - `COLOR2` = Cor secundária
  - `COLOR3` = Cor do texto
  - `TEXT1` = Título/frase sponsor
  - `TEXT2` = Duração da vinheta (segundos)
  - `FILE_IMAGE1` = Vídeo/imagem de intro (vinheta)
  - `IMAGE_LOGO` = Logo do sponsor

#### 1.2. D_SPD (Confrontos)
- **Método**: `loader.addData('D_SPD', false, 'f_config=0&f_type=10')`
- **Filtro**: `f_config=0&f_type=10` (busca jogos TYPE=10)
- **Objetivo**: Obter dados do confronto/classificação atual
- **Rotação**: Automática pelo loader (a cada reload busca próximo item)
- **Campo crítico**: `TITLE` determina qual canal consultar:
  - Se `TITLE = "STANDINGS"` → consultar `D_FOOTBALL_STANDINGS`
  - Se `TITLE = ID numérico` → consultar `D_FOOTBALL`
- **Campos utilizados**:
  - `TITLE` = "STANDINGS" ou ID da partida
  - `TEXT3` = ID ou identificador (campo não confiável - ignorar no fluxo STANDINGS)

#### 1.3. D_FOOTBALL_TEAMS (Dados dos times - OBRIGATÓRIO)
- **Método**: `loader.addData('D_FOOTBALL_TEAMS', false, 'f_titulo=' + teamId)`
- **Filtro**: `f_titulo={teamId}` (time específico por ID)
- **Objetivo**: Obter dados corretos do time (bandeira, nome traduzido, abreviação)
- **Exemplo**: `D_FOOTBALL_TEAMS?f_titulo=6` (Brasil)
- **Importante**: **NÃO usar `amount=0`** - consultar cada time individualmente com seu ID
- **Campos utilizados**:
  - `FOTO` = Bandeira do time (PNG/SVG) - também disponível em SELO1 e FOTO1
  - `TEXTO2` = Nome traduzido em PT-BR
  - `TEXTO3` = Nome abreviado (3 letras, ex: BRA)
  - `TITULO` = ID do time (mesmo do filtro)
- **Fluxo**: Após obter IDs dos times do `D_FOOTBALL.TEXTO2` (JSON), consultar `D_FOOTBALL_TEAMS` para cada time (casa e visitante)

#### 1.4. D_FOOTBALL (condicional - quando TITLE ≠ "STANDINGS")
- **Método**: `loader.addData('D_FOOTBALL', false, 'f_titulo=' + partidaId)`
- **Filtro**: `f_titulo={partidaId}` (jogo específico)
- **Valor do filtro**: Obtido de `D_SPD.TITLE`
- **Condição**: Usado quando `D_SPD.TITLE` contém um ID numérico
- **Exemplo de consulta**: `D_FOOTBALL?f_titulo=1489371`
- **Campos utilizados** (especificação oficial):
  - `DATE` = Data/hora da partida
  - `CATEGORY` = Nome da liga
  - `TEXTO4` = Rodada
  - `TEXTO5` = Status da partida
  - `TEXTO2` = JSON completo da API-Football (campo crítico)
- **Estrutura do JSON** (campo `TEXTO2`):
  ```json
  {
    "response": [
      {
        "fixture": {
          "id": 1489371,
          "date": "2026-06-13T19:00:00-03:00",
          "venue": {
            "name": "MetLife Stadium"
          },
          "status": {
            "short": "NS",
            "elapsed": null,
            "extra": null
          }
        },
        "league": {
          "name": "World Cup",
          "round": "Group Stage - 1"
        },
        "teams": {
          "home": { "id": 6, "name": "Brazil", "logo": "..." },
          "away": { "id": 31, "name": "Morocco", "logo": "..." }
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
- **Campos extraídos do JSON** (especificação oficial):
  - `partidaJson->teams->home->id` = ID time casa (usar para consultar D_FOOTBALL_TEAMS)
  - `partidaJson->teams->away->id` = ID time visitante (usar para consultar D_FOOTBALL_TEAMS)
  - `partidaJson->goals->home` = Gols time casa
  - `partidaJson->goals->away` = Gols time visitante
  - `partidaJson->score->penalties->home` = Pênaltis time casa
  - `partidaJson->score->penalties->away` = Pênaltis time visitante
  - `partidaJson->fixture->status->elapsed` = Tempo decorrido
  - `partidaJson->fixture->status->extra` = Tempo extra
  - `partidaJson->fixture->venue->name` = Nome do estádio

#### 1.5. D_FOOTBALL_STANDINGS (condicional - quando TITLE = "STANDINGS")
- **Método**: `loader.addData('D_FOOTBALL_STANDINGS', false, 'amount=0')`
- **Filtro**: `amount=0` (busca todos os grupos de uma vez)
- **Condição**: Usado quando `D_SPD.TITLE = "STANDINGS"`
- **Objetivo**: Obter todos os grupos e usar rotação automática do loader
- **Exemplo**: `D_FOOTBALL_STANDINGS?amount=0` (retorna 12-13 grupos)
- **IMPORTANTE**: ✅ Usar `amount=0` + rotação automática. ❌ Campo TEXT3 do D_SPD não é confiável para filtro direto.
- **Campos utilizados** (especificação oficial):
  - `CATEGORY` = Nome da liga
  - `TEXTO3` = Nome do grupo (ex: "Group A", "Group B", etc.)
  - `TITULO` = Sempre "1" em todos os grupos (não usar para filtro)
  - `TEXTO2` = JSON array com classificação completa
- **Rotação**: Loader retorna próximo grupo automaticamente a cada reload
  - Estrutura do JSON:
    ```json
    [
      {
        "rank": 1,
        "team": { 
          "id": 6, 
          "name": "Brazil", 
          "logo": "..." 
        },
        "points": 9,
        "goalsDiff": 5,
        "group": "Group A",
        "all": { 
          "played": 3, 
          "win": 3, 
          "draw": 0, 
          "lose": 0 
        }
      }
    ]
    ```
- **Fluxo**: Para cada time no JSON (`grupoJson->team->id`), consultar `D_FOOTBALL_TEAMS`

---

## 2. TABELA_FUTEBOL (Classificação de Grupos)

### Ordem de consultas:

#### 2.1. D_SPD (Patrocinador)
- **Método**: `loader.addData('D_SPD', false, 'f_config=1&f_specialproject=spdata' + specialProjectId)`
- **Filtro**: `f_config=1&f_specialproject=spdata{SPECIALPROJECT}`
- **Objetivo**: Obter configurações de intro/sponsor
- **Campos utilizados**: Mesmos do placar_futebol (COLOR1/2/3, TEXT1/2, FILE_IMAGE1, IMAGE_LOGO)

#### 2.2. D_FOOTBALL_STANDINGS
- **Método**: `loader.addData('D_FOOTBALL_STANDINGS', false, 'amount=0')`
- **Filtro**: `amount=0` (busca todos os grupos)
- **Objetivo**: Obter todos os grupos e usar rotação automática do loader
- **Rotação**: Automática pelo loader (a cada reload busca próximo grupo da lista)
- **Campos utilizados**:
  - `CATEGORY` = Nome da liga
  - `TEXTO3` = Nome do grupo (ex: "Group A", "Group B", "Ranking of third-placed teams")
  - `TEXTO2` = JSON array com classificação completa
  - `TITULO` = Sempre "1" em todos os grupos (não usar para filtros)

#### 2.3. D_FOOTBALL_TEAMS (OBRIGATÓRIO)
- **Método**: `loader.addData('D_FOOTBALL_TEAMS', false, 'f_titulo=' + teamId)`
- **Filtro**: `f_titulo={teamId}` (time específico por ID)
- **Objetivo**: Obter bandeira, nome traduzido e abreviação corretos
- **Exemplo**: `D_FOOTBALL_TEAMS?f_titulo=6`
- **Campos utilizados**:
  - `FOTO` = Bandeira do time (também em SELO1/FOTO1)
  - `TEXTO2` = Nome traduzido PT-BR
  - `TEXTO3` = Nome abreviado (3 letras)
  - `TITULO` = ID do time

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
- **Método**: `loader.addData('D_SPD', false, 'f_config=1&f_specialproject=spdata' + specialProjectId)`
- **Filtro**: `f_config=1&f_specialproject=spdata{SPECIALPROJECT}`
- **Objetivo**: Obter configurações de intro/sponsor
- **Campos utilizados**: Mesmos do placar_futebol (COLOR1/2/3, TEXT1/2, FILE_IMAGE1, IMAGE_LOGO)

#### 3.3. D_FOOTBALL_TEAMS (OBRIGATÓRIO)
- **Método**: `loader.addData('D_FOOTBALL_TEAMS', false, 'f_titulo=' + teamId)`
- **Filtro**: `f_titulo={teamId}` (time específico por ID)
- **Objetivo**: Traduzir IDs dos times (TITULO/TITULO2) do bracket para dados corretos
- **Exemplo**: `D_FOOTBALL_TEAMS?f_titulo=6`
- **Campos utilizados**:
  - `FOTO` = Bandeira do time (também em SELO1/FOTO1)
  - `TEXTO2` = Nome traduzido PT-BR
  - `TEXTO3` = Nome abreviado (3 letras)
  - `TITULO` = ID do time

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
- **Método**: `loader.addData('D_SPD', false, 'f_config=1&f_specialproject=spdata' + specialProjectId)`
- **Filtro**: `f_config=1&f_specialproject=spdata{SPECIALPROJECT}`
- **Objetivo**: Obter configurações de intro/sponsor
- **Campos utilizados**: Mesmos do placar_futebol (COLOR1/2/3, TEXT1/2, FILE_IMAGE1, IMAGE_LOGO)

#### 4.3. D_FOOTBALL_TEAMS (OBRIGATÓRIO)
- **Método**: `loader.addData('D_FOOTBALL_TEAMS', false, 'f_titulo=' + teamId)`
- **Filtro**: `f_titulo={teamId}` (time específico por ID)
- **Objetivo**: Traduzir IDs dos times para dados corretos (bandeira, nome, abreviação)
- **Exemplo**: `D_FOOTBALL_TEAMS?f_titulo=6`
- **Campos utilizados**:
  - `FOTO` = Bandeira do time (também em SELO1/FOTO1)
  - `TEXTO2` = Nome traduzido PT-BR
  - `TEXTO3` = Nome abreviado (3 letras)
  - `TITULO` = ID do time

---

## Regras e Padrões Críticos

### 1. Padrão de Consulta (EBHTML)

**SEMPRE use `loader.addData()`** - nunca XMLHttpRequest direto:
```javascript
// ✅ CORRETO - Especificação oficial
loader.addData('D_SPD', false, 'f_config=1&f_specialproject=spdataXXX');
loader.addData('D_SPD', false, 'f_config=0&f_type=10');
loader.addData('D_FOOTBALL', false, 'f_titulo=1489371');
loader.addData('D_FOOTBALL_TEAMS', false, 'f_titulo=6');
loader.addData('D_FOOTBALL_STANDINGS', false, 'amount=0'); // Rotação automática

// ❌ ERRADO - Não usar XMLHttpRequest
var xhr = new XMLHttpRequest();
xhr.open('GET', '/content/data/D_FOOTBALL_TEAMS?amount=0', true);

// ❌ ERRADO - Filtros incorretos
loader.addData('D_SPD', false, 'f_config=1'); // falta f_specialproject
loader.addData('D_SPD', false, 'f_config=0'); // falta f_type=10
```

### 2. Uso de Filtros

#### Filtros específicos (preferencial):
- `f_config=1&f_specialproject=spdata{ID}` → Busca projeto especial específico
- `f_config=0&f_type=10` → Busca apenas confrontos (TYPE=10)
- `f_titulo={ID}` → Busca registro específico por ID
  - Para `D_FOOTBALL`: ID da partida (ex: `f_titulo=1489371`)
  - Para `D_FOOTBALL_TEAMS`: ID do time (ex: `f_titulo=6`)
- `f_tipo=10` → Busca apenas TYPE=10 (obsoleto, usar `f_type`)

#### `amount=0` (casos específicos):
- ✅ **D_FOOTBALL_STANDINGS** → **RECOMENDADO** - busca todos os grupos para rotação automática
- ❌ **D_FOOTBALL_TEAMS** → **NUNCA usar** - sempre filtrar por ID (`f_titulo={teamId}`)
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

### 4. Ordem de Consultas Recomendada (Especificação Oficial)

#### Fluxo completo:

1. **D_SPD** (`f_config=1&f_specialproject=spdata{ID}`) → Configurações visuais
2. **D_SPD** (`f_config=0&f_type=10`) → Dados do jogo/classificação
3. **Decisão condicional** baseada em `D_SPD.TITLE`:

**Se `TITLE === "STANDINGS"` (Fluxo de Classificação):**
```javascript
// 3a. Consultar todos os grupos com amount=0 (rotação automática)
var standings = loader.data('D_FOOTBALL_STANDINGS');
// Nota: amount=0 já configurado no addData(), loader retorna próximo grupo automaticamente

// 3b. Extrair dados
var liga = standings.CATEGORY;
var nomeGrupo = standings.TEXTO3; // Ex: "Group A", "Group B", etc.
var grupoJson = JSON.parse(standings.TEXTO2);

// 3c. Para cada time no grupo
for (var i = 0; i < grupoJson.length; i++) {
    var teamId = grupoJson[i].team.id;
    
    // 4. Consultar D_FOOTBALL_TEAMS
    var time = loader.data('D_FOOTBALL_TEAMS', false, 'f_titulo=' + teamId);
    var timeNome = time.TEXTO2;
    var timeAbreviacao = time.TEXTO3;
    var timeEscudo = time.FOTO;
}
```

**Se `TITLE !== "STANDINGS"` (Fluxo de Partida):**
```javascript
// 3a. Consultar partida usando D_SPD.TITLE
var partida = loader.data('D_FOOTBALL', false, 'f_titulo=' + spdata.TITLE);

// 3b. Extrair campos gerais
var data = partida.DATE;
var liga = partida.CATEGORY;
var rodada = partida.TEXTO4;
var status = partida.TEXTO5;
var partidaJson = JSON.parse(partida.TEXTO2);

// 3c. Extrair IDs dos times
var homeTeamId = partidaJson.response[0].teams.home.id;
var awayTeamId = partidaJson.response[0].teams.away.id;

// 4a. Consultar time da casa
var time1 = loader.data('D_FOOTBALL_TEAMS', false, 'f_titulo=' + homeTeamId);
var time1Nome = time1.TEXTO2;
var time1Abreviacao = time1.TEXTO3;
var time1Escudo = time1.FOTO;

// 4b. Consultar time visitante
var time2 = loader.data('D_FOOTBALL_TEAMS', false, 'f_titulo=' + awayTeamId);
var time2Nome = time2.TEXTO2;
var time2Abreviacao = time2.TEXTO3;
var time2Escudo = time2.FOTO;

// 5. Extrair placar e status avançado
var gols1 = partidaJson.response[0].goals.home;
var gols2 = partidaJson.response[0].goals.away;
var penaltis1 = partidaJson.response[0].score.penalties.home;
var penaltis2 = partidaJson.response[0].score.penalties.away;
var tempoPartida = partidaJson.response[0].fixture.status.elapsed;
var tempoExtra = partidaJson.response[0].fixture.status.extra;
var estadio = partidaJson.response[0].fixture.venue.name;
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
| **placar_futebol** | `f_config=1&`<br>`f_specialproject` | `f_config=0&`<br>`f_type=10` | Condicional<br>`f_titulo={ID}`<br>Campos: TEXTO2, TEXTO4, TEXTO5 | **OBRIGATÓRIO**<br>`f_titulo={teamId}`<br>Por time | Condicional<br>se TITLE="STANDINGS"<br>`amount=0` (rotação) |
| **tabela_futebol** | `f_config=1&`<br>`f_specialproject` | ❌ | Sem filtro<br>Próximos jogos | **OBRIGATÓRIO**<br>`f_titulo={teamId}`<br>Por time | `amount=0`<br>Rotação automática |
| **caminhos_futebol** | `f_config=1&`<br>`f_specialproject` | ❌ | Sem filtro<br>TEXTO3 (JSON) | **OBRIGATÓRIO**<br>`f_titulo={teamId}`<br>Por time | ❌ |
| **segundafase_futebol** | `f_config=1&`<br>`f_specialproject` | ❌ | Sem filtro<br>TEXTO3 (JSON) | **OBRIGATÓRIO**<br>`f_titulo={teamId}`<br>Por time | ❌ |

---

## Status de Implementação

| Template | Consultas Corretas | Observações |
|----------|-------------------|-------------|
| **placar_futebol** | ❌ Desatualizado | Precisa implementar especificação oficial (filtros, f_type=10, TEXT3 para STANDINGS) |
| **tabela_futebol** | ❌ Desatualizado | Precisa implementar especificação oficial (f_specialproject, campos corretos) |
| **caminhos_futebol** | ❌ Desatualizado | Precisa implementar especificação oficial (f_specialproject) |
| **segundafase_futebol** | ❌ Desatualizado | Precisa implementar especificação oficial (f_specialproject) |

### Próximos passos:

1. ✅ Documentação atualizada com especificação oficial do backend
2. ⚠️ Implementar nos templates:
   - Trocar XMLHttpRequest por `loader.addData()`
   - Usar `f_config=0&f_type=10` para jogos
   - Usar `f_config=1&f_specialproject=spdata{ID}` para config
   - Implementar fluxo de STANDINGS com `TEXT3`
   - Usar campos oficiais: TEXTO4 (rodada), TEXTO5 (status)
   - Extrair dados corretos do JSON: penalties, elapsed, extra, venue
