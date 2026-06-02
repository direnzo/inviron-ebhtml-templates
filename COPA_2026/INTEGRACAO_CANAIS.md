# Integração de Canais EdgeContents - Copa 2026

Resumo de como cada template utiliza os canais de dados do EdgeContents CMS.

---

## 📊 **Tabela Comparativa de Uso de Canais**

| Template | D_SPD | D_FOOTBALL | D_FOOTBALL_TEAMS | D_FOOTBALL_STANDINGS |
|----------|-------|------------|------------------|----------------------|
| **placar_futebol** | ✅ `amount=0`<br>Separa TYPE=10 e CONFIG=1 | ✅ `f_titulo={fixtureId}`<br>Filtrado por partida | ✅ `amount=0`<br>XMLHttpRequest | ❌ Não usa |
| **tabela_futebol** | ✅ `amount=0`<br>Busca CONFIG=1 | ✅ `amount=0`<br>XMLHttpRequest | ✅ `amount=0`<br>XMLHttpRequest | ✅ `amount=0`<br>XMLHttpRequest |
| **caminhos_futebol** | ✅ `amount=0`<br>Busca CONFIG=1 | ✅ Sem filtro<br>TEXTO3 contém JSON array | ✅ `amount=0`<br>XMLHttpRequest<br>**OBRIGATÓRIO** para PT-BR | ❌ Não usa |

---

## 🎯 **1. placar_futebol (Placar Ao Vivo)**

### **Fluxo de Dados:**
```
1. D_SPD (amount=0)
   ├─ Separa TYPE=10 (jogos dinâmicos)
   └─ Separa CONFIG=1 (patrocinador)
   
2. D_FOOTBALL_TEAMS (amount=0 via XMLHttpRequest)
   └─ Mapeia TODOS os times (ID → nome PT-BR + bandeira)
   
3. D_FOOTBALL (f_titulo={fixtureId})
   └─ Dados detalhados da partida específica (JSON no TEXTO2)
```

### **Campos Utilizados:**

#### **D_SPD (TYPE=10 - Jogos)**
- `TITLE` = fixture ID (usado para buscar D_FOOTBALL)
- `TEXT1` = nome time casa
- `TEXT2` = nome time visitante
- `TEXT4` = status (1H, 2H, FT, etc)
- `TEXT5` = gols casa
- `TEXT6` = gols visitante
- `TEXT9` = tempo decorrido

#### **D_SPD (CONFIG=1 - Patrocinador)**
- `COLOR1` = cor de destaque
- `COLOR2` = cor escura
- `COLOR3` = cor clara
- `TEXT1` = título/frase sponsor
- `TEXT2` = duração vídeo/imagem (segundos)
- `FILE_IMAGE1` = vídeo/imagem de intro
- `IMAGE_LOGO` = logo do sponsor

#### **D_FOOTBALL_TEAMS**
- `TITULO` = team ID (da API-Football)
- `TEXTO2` = nome do time em PT-BR
- `FOTO1` = URL da bandeira (HTTP)
- `TEXTO3` = código do time (ex: BRA)

#### **D_FOOTBALL**
- `TITULO` = fixture ID (mesmo do D_SPD.TITLE)
- `TEXTO2` = JSON completo da API-Football
- `SUBTITULO` = estádio
- `SUBTITULO2` = rodada
- `SUBTITULO3` = status (fallback)
- `CATEGORY` = nome do torneio
- `DATE` = data/hora da partida

---

## 📋 **2. tabela_futebol (Tabela de Grupos)**

### **Fluxo de Dados:**
```
1. D_SPD (amount=0)
   └─ Busca CONFIG=1 (patrocinador)
   
2. D_FOOTBALL_STANDINGS (amount=0 via XMLHttpRequest)
   └─ TEXTO2 contém JSON array com classificação de grupos
   
3. D_FOOTBALL_TEAMS (amount=0 via XMLHttpRequest)
   └─ Mapeia TODOS os times (ID → nome PT-BR + bandeira)
   
4. D_FOOTBALL (amount=0 via XMLHttpRequest)
   └─ Lista de jogos para exibir próximas partidas
```

### **Campos Utilizados:**

#### **D_SPD (CONFIG=1 - Patrocinador)**
- Mesmos campos do placar_futebol

#### **D_FOOTBALL_STANDINGS**
- `TEXTO2` = JSON array com classificação
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

#### **D_FOOTBALL_TEAMS**
- Mesmos campos do placar_futebol

#### **D_FOOTBALL (para jogos)**
- `TITULO` = fixture ID
- `TEXTO2` = JSON da partida
- `DATE` = data/hora
- `SUBTITULO2` = rodada

---

## 🏆 **3. caminhos_futebol (Chaveamento Eliminatório)**

### **Fluxo de Dados:**
```
1. D_FOOTBALL
   └─ TEXTO3 contém JSON array com TODAS as partidas eliminatórias
   
2. D_SPD (amount=0)
   └─ Busca CONFIG=1 (patrocinador)
   
3. D_FOOTBALL_TEAMS (amount=0 via XMLHttpRequest)
   └─ **OBRIGATÓRIO**: Mapeia IDs → nomes PT-BR + bandeiras
```

### **Campos Utilizados:**

#### **D_FOOTBALL**
- `TEXTO3` = JSON array com todas as partidas do bracket
  ```json
  [
    {
      "CATEGORY": "R32",
      "SUBTITULO": "1",
      "TITULO": "6",          // ← ID do time (ex: 6 = Brasil)
      "TITULO2": "10",        // ← ID do time (ex: 10 = Argentina)
      "FOTO": "",             // Vazio (usar D_FOOTBALL_TEAMS)
      "FOTO2": "",            // Vazio (usar D_FOOTBALL_TEAMS)
      "TEXTO": "2",
      "TEXTO2": "1",
      "SUBTITULO3": "FT",
      "SUBTITULO2": "2026-06-28 16:00:00"
    }
  ]
  ```

#### **D_FOOTBALL_TEAMS**
- `TITULO` = team ID (da API-Football)
- `TEXTO2` = nome do time em PT-BR
- `FOTO1` = URL da bandeira (HTTP)
- `TEXTO3` = código do time (ex: BRA)

**⚠️ CRÍTICO:** D_FOOTBALL_TEAMS é **OBRIGATÓRIO** para traduzir os IDs dos times em PT-BR e obter as bandeiras corretas.

#### **D_SPD (CONFIG=1 - Patrocinador)**
- Mesmos campos do placar_futebol

---

## ⚠️ **Regras Críticas**

### **1. D_SPD sempre com `amount=0`**
```javascript
loader.addData('D_SPD', false, 'amount=0');
```
**Por quê?** Para garantir que carrega TODOS os registros, incluindo CONFIG=1 (patrocinador).

### **2. Separação de Registros no D_SPD**
```javascript
// placar_futebol
for (var i = 0; i < lista.count(); i++) {
    var item = lista.get(i);
    var cfg = obterValor(item, 'CONFIG');
    var tipo = obterValor(item, 'TYPE');
    
    if (cfg === '1') {
        spdSponsor = item;  // Patrocinador
    } else if (tipo === '10') {
        jogos.push(item);   // Jogos
    }
}
```

### **3. Campos de Cores do Patrocinador**
**SEMPRE usar:** `COLOR1`, `COLOR2`, `COLOR3`  
**NUNCA usar:** ~~`TEXTO7`~~, ~~`TEXTO8`~~, ~~`TEXTO9`~~ (deprecated)

### **4. Campo de Duração**
**SEMPRE usar:** `TEXT2` (segundos)  
**NUNCA usar:** ~~`DURACAO`~~ (deprecated)

### **5. `loader.loaded()` - Chamada Crítica**
```javascript
// ✅ CORRETO - chamar IMEDIATAMENTE após validar dados
function renderizar(dados, loader) {
    loader.loaded();  // ← PRIMEIRA linha da função
    console.log('Template registrado na playlist');
    
    // ... resto da renderização ...
}

// ❌ ERRADO - chamar após animações/intro
function renderizar(dados, loader) {
    mostrarIntro(url, function() {
        loader.loaded();  // ← MUITO TARDE!
    });
}
```

---

## 📝 **Checklist de Integração**

- [ ] `loader.addData('D_SPD', false, 'amount=0')` ✅
- [ ] Separar CONFIG=1 (sponsor) de outros registros ✅
- [ ] Usar `COLOR1/2/3` para cores (não TEXTO7/8/9) ✅
- [ ] Usar `TEXT2` para duração (não DURACAO) ✅
- [ ] Chamar `loader.loaded()` IMEDIATAMENTE ✅
- [ ] Aplicar cores via `mergeColorsFromSpd()` ✅
- [ ] Console logs para debug ✅

---

## 🚀 **Status Atual**

| Template | Integração | Observações |
|----------|------------|-------------|
| **placar_futebol** | ✅ 100% | Completo e testado |
| **tabela_futebol** | ✅ 100% | Completo e testado |
| **caminhos_futebol** | ✅ 100% | Corrigido: D_SPD agora usa `amount=0` |

**Todos os templates estão sincronizados e prontos para produção!** 🎉
