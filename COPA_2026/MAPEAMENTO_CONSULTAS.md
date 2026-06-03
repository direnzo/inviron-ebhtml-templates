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
- **Objetivo**: Obter lista de jogos/classificações a exibir
- **Rotação**: Client-side via localStorage (sequencial)
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

#### 1.3. D_FOOTBALL_TEAMS (Todos os times)
- **Método**: `loader.addData('D_FOOTBALL_TEAMS', false, 'amount=0')`
- **Filtro**: `amount=0` (busca TODOS os times - necessário para lookup)
- **Objetivo**: Mapear ID do time → nome PT-BR + bandeira
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
- **Campos utilizados**:
  - `TITULO` = Fixture ID
  - `TEXTO2` = JSON completo da API-Football
  - `SUBTITULO` = Estádio
  - `SUBTITULO2` = Rodada
  - `CATEGORY` = Nome do torneio
  - `DATE` = Data/hora da partida

#### 1.5. D_FOOTBALL_STANDINGS (condicional - quando TITLE = "STANDINGS")
- **Método**: `loader.addData('D_FOOTBALL_STANDINGS', false, 'amount=0')`
- **Filtro**: `amount=0` (busca TODOS os grupos)
- **Condição**: Usado quando `D_SPD.TITLE = "STANDINGS"` (CDATA, maiúsculo)
- **Objetivo**: Obter classificação dos grupos
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
- **Método**: `loader.addData('D_FOOTBALL_STANDINGS', false, 'amount=0')`
- **Filtro**: `amount=0` (busca TODOS os grupos - necessário para rotação)
- **Objetivo**: Obter classificação de todos os grupos
- **Rotação**: Client-side via localStorage (sequencial por grupo)
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
- **Método**: `loader.addData('D_FOOTBALL_TEAMS', false, 'amount=0')`
- **Filtro**: `amount=0` (busca TODOS os times - necessário para lookup)
- **Objetivo**: Mapear ID do time → nome PT-BR + bandeira
- **Campos utilizados**: Mesmos do placar_futebol

#### 2.4. D_FOOTBALL (Próximos jogos)
- **Método**: `loader.addData('D_FOOTBALL', false, 'amount=0')`
- **Filtro**: `amount=0` (busca TODOS os jogos do torneio)
- **Objetivo**: Exibir próximos jogos do grupo selecionado
- **Filtragem**: Client-side por grupo após carregar todos os jogos
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
- **Rotação**: Client-side via localStorage (sequencial por chave)

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
- ✅ `D_FOOTBALL_TEAMS` → necessário para lookup de todos os times
- ✅ `D_FOOTBALL_STANDINGS` → necessário para carregar todos os grupos
- ⚠️ `D_FOOTBALL` → evitar; usar filtros específicos quando possível
- ⚠️ `D_SPD` → evitar; usar `f_config=1` ou `f_config=0`

### 3. Campo TITLE do D_SPD (f_config=0)

**Formato no XML:**
```xml
<TITLE>
<![CDATA[ STANDINGS ]]>
</TITLE>
```

**Lógica de verificação:**
```javascript
var partidaId = obterValor(spdData, 'TITLE').trim();

if (partidaId.toUpperCase() === 'STANDINGS') {
    // Consultar D_FOOTBALL_STANDINGS
    loader.addData('D_FOOTBALL_STANDINGS', false, 'amount=0');
} else {
    // Consultar D_FOOTBALL com filtro
    loader.addData('D_FOOTBALL', false, 'f_titulo=' + partidaId);
}
```

**Valores possíveis:**
- `"STANDINGS"` (CDATA, qualquer case) → Consultar classificação
- `"1234567"` (ID numérico) → Consultar jogo específico

### 4. Ordem de Consultas Recomendada

Para templates que exibem confrontos/classificação:

1. **D_SPD** (`f_config=1`) → Patrocinador/cores
2. **D_SPD** (`f_config=0`) → Lista de confrontos (rotação client-side)
3. **D_FOOTBALL_TEAMS** (`amount=0`) → Lookup de times
4. **Condicional**:
   - Se `TITLE = "STANDINGS"` → **D_FOOTBALL_STANDINGS** (`amount=0`)
   - Se `TITLE = ID` → **D_FOOTBALL** (`f_titulo={ID}`)

### 5. Rotação Client-Side

Templates que exibem múltiplos itens devem usar localStorage:

```javascript
// Exemplo: rotação de jogos
var idx = parseInt(localStorage.getItem('placar_futebol_idx'), 10);
if (isNaN(idx) || idx >= total) { idx = 0; }
var itemAtual = lista[idx];
localStorage.setItem('placar_futebol_idx', idx + 1);
```

**Quando usar:**
- `placar_futebol` → rotação entre jogos (D_SPD f_config=0)
- `tabela_futebol` → rotação entre grupos (D_FOOTBALL_STANDINGS)
- `segundafase_futebol` → rotação entre chaves (D_FOOTBALL.TEXTO3)

---

## Resumo Rápido

| Template | D_SPD Config=1 | D_SPD Config=0 | D_FOOTBALL | D_FOOTBALL_TEAMS | D_FOOTBALL_STANDINGS |
|----------|----------------|----------------|------------|------------------|----------------------|
| **placar_futebol** | `f_config=1`<br>Sponsor | `f_config=0`<br>Confrontos | Condicional<br>`f_titulo={ID}` | `amount=0`<br>Lookup | Condicional<br>se TITLE="STANDINGS" |
| **tabela_futebol** | `f_config=1`<br>Sponsor | ❌ | `amount=0`<br>Próximos jogos | `amount=0`<br>Lookup | `amount=0`<br>Todos os grupos |
| **caminhos_futebol** | `f_config=1`<br>Sponsor | ❌ | Sem filtro<br>TEXTO3 (JSON) | `amount=0`<br>Lookup | ❌ |
| **segundafase_futebol** | `f_config=1`<br>Sponsor | ❌ | Sem filtro<br>TEXTO3 (JSON) | `amount=0`<br>Lookup | ❌ |

---

## Status de Implementação

| Template | Consultas Corretas | Observações |
|----------|-------------------|-------------|
| **placar_futebol** | ⚠️ Parcial | Precisa trocar XMLHttpRequest por loader.addData |
| **tabela_futebol** | ⚠️ Parcial | Precisa trocar XMLHttpRequest por loader.addData |
| **caminhos_futebol** | ⚠️ Parcial | Precisa trocar XMLHttpRequest por loader.addData |
| **segundafase_futebol** | ⚠️ Parcial | Precisa trocar XMLHttpRequest por loader.addData |
