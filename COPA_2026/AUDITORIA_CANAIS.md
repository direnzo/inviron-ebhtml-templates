# Auditoria dos Canais de Dados - COPA 2026

**Data**: 3 de junho de 2026  
**Servidor**: http://127.0.0.1:13199  
**Objetivo**: Validar estrutura XML e filtros antes de implementar correções no código

---

## 🎯 Resumo Executivo

### ✅ Validações Bem-Sucedidas

1. **D_SPD**: Estrutura confirmada, filtros funcionando corretamente
2. **D_FOOTBALL**: Campos TEXTO2/4/5 validados, JSON conforme especificado
3. **D_FOOTBALL_TEAMS**: Campo FOTO confirmado (replicado em SELO1/FOTO1)
4. **D_FOOTBALL_STANDINGS**: Filtro correto identificado (f_texto3, não f_titulo)

### ⚠️ Correções Necessárias

- Documentação anterior usava `f_titulo` para D_FOOTBALL_STANDINGS (incorreto)
- Filtro correto: `f_texto3={NomeGrupo}` (ex: `f_texto3=Group A`)

---

## 📋 Detalhamento por Canal

### 1. D_SPD ✅

#### Teste 1: Configurações (f_config=1)
**URL**: `http://127.0.0.1:13199/CONTENT/DATA/D_SPD?f_config=1`

**Campos validados**:
- `COLOR1` = fbff00 ✅
- `COLOR2` = 006b12 ✅
- `COLOR3` = ffffff ✅
- `CONFIG` = 1 ✅
- `SPECIALPROJECT` = 17 ✅
- `FILE_IMAGE1` = (presente) ✅
- `IMAGE_LOGO` = (presente) ✅
- `TEXT1` = (presente) ✅
- `TEXT2` = (presente) ✅

#### Teste 2: Jogos/Classificações (f_config=0&f_type=10)
**URL**: `http://127.0.0.1:13199/CONTENT/DATA/D_SPD?f_config=0&f_type=10`

**Campos validados**:
- `CONFIG` = 0 ✅
- `SPECIALPROJECT` = 17 ✅
- `TYPE` = (presente) ✅
- `TITLE` = (presente - pode ser "STANDINGS" ou ID numérico) ✅
- `TEXT3` = (presente - nome do grupo quando TITLE="STANDINGS") ✅

**Conclusão**: Estrutura correta conforme especificação oficial.

---

### 2. D_FOOTBALL ✅

#### Teste: Partida específica
**URL**: `http://127.0.0.1:13199/CONTENT/DATA/D_FOOTBALL?f_titulo=1489371`

**Campos validados**:
- `CATEGORY` = "Copa do Mundo" ✅
- `DATE` = "2026-06-13 16:00:00" ✅
- `TITULO` = "1489371" (ID da partida) ✅
- `TEXTO4` = "Group Stage - 1" (rodada) ✅
- `TEXTO5` = "NS" (status) ✅
- `TEXTO2` = JSON completo da API-Football ✅

**Estrutura JSON (TEXTO2)**:
```json
{
  "response": [{
    "fixture": {
      "id": 1489371,
      "date": "2026-06-13T19:00:00-03:00",
      "venue": { "name": "MetLife Stadium" },
      "status": { "short": "NS", "elapsed": null }
    },
    "teams": {
      "home": { "id": 6, "name": "Brazil" },
      "away": { "id": 31, "name": "Morocco" }
    },
    "goals": { "home": null, "away": null },
    "score": {
      "halftime": { "home": null, "away": null },
      "penalty": { "home": null, "away": null }
    }
  }]
}
```

**Conclusão**: Todos os campos necessários presentes e com estrutura correta.

---

### 3. D_FOOTBALL_TEAMS ✅

#### Teste: Time específico (Brasil)
**URL**: `http://127.0.0.1:13199/CONTENT/DATA/D_FOOTBALL_TEAMS?f_titulo=6`

**Campos validados**:
- `FOTO` = (presente) ✅
- `SELO1` = http://127.0.0.1:13199/FILES/127729 ✅
- `FOTO1` = (presente - mesmo conteúdo) ✅
- `TEXTO2` = (nome traduzido - presente) ✅
- `TEXTO3` = (abreviação - presente) ✅
- `TITULO` = "6" (ID do time) ✅

**Descoberta importante**: O campo da bandeira vem replicado em três lugares:
1. `FOTO` ← Campo documentado (correto)
2. `SELO1` ← Também contém a URL
3. `FOTO1` ← Também contém a URL

**Conclusão**: Documentação estava correta. FOTO é o campo padrão, mas também está disponível em SELO1/FOTO1.

---

### 4. D_FOOTBALL_STANDINGS ⚠️ → ✅

#### ❌ Teste 1: Filtro incorreto (f_titulo)
**URL**: `http://127.0.0.1:13199/CONTENT/DATA/D_FOOTBALL_STANDINGS?f_titulo=12`
**Resultado**: `<EBDATA AMOUNT="0">` (vazio)

**Motivo**: Todos os registros têm `TITULO=1`, então `f_titulo` não funciona para filtrar grupos.

---

#### ✅ Teste 2: Filtro correto (f_texto3 - nome do grupo)
**URLs testadas**:
- `http://127.0.0.1:13199/CONTENT/DATA/D_FOOTBALL_STANDINGS?f_texto3=Group A` → Group A ✅
- `http://127.0.0.1:13199/CONTENT/DATA/D_FOOTBALL_STANDINGS?f_texto3=Group B` → Group B ✅
- `http://127.0.0.1:13199/CONTENT/DATA/D_FOOTBALL_STANDINGS?f_texto3=Group J` → Group J ✅

**Campos validados**:
- `CATEGORY` = "Copa do Mundo" ✅
- `TEXTO3` = "Group A" / "Group B" / "Group J" (nome do grupo) ✅
- `TITULO` = "1" (sempre 1 - não usar para filtros) ✅
- `TEXTO2` = JSON array com classificação ✅

**Estrutura JSON (TEXTO2)**:
```json
[
  {
    "rank": 1,
    "team": {
      "id": 26,
      "name": "Argentina",
      "code": "ARG",
      "logo": "https://..."
    },
    "points": 0,
    "goalsDiff": 0,
    "group": "Group J",
    "all": { "played": 0, "win": 0, "draw": 0, "lose": 0 }
  }
]
```

**Conclusão**: Filtro correto é `f_texto3={NomeGrupo}`, não `f_titulo`.

---

## 📝 Correções Aplicadas na Documentação

### Antes (incorreto):
```javascript
// ❌ ERRADO
loader.addData('D_FOOTBALL_STANDINGS', false, 'f_titulo=' + spdataText3);
// Exemplo: D_FOOTBALL_STANDINGS?f_titulo=12
```

### Depois (correto):
```javascript
// ✅ CORRETO
loader.addData('D_FOOTBALL_STANDINGS', false, 'f_texto3=' + spdataText3);
// Exemplo: D_FOOTBALL_STANDINGS?f_texto3=Group A
```

### Implicação:
- `D_SPD.TEXT3` deve conter o **nome do grupo** (ex: "Group A"), não um ID numérico
- Todos os templates que usam classificação precisam ajustar:
  - Fluxo STANDINGS: usar `f_texto3={D_SPD.TEXT3}`
  - Backend deve preencher TEXT3 com "Group A", "Group B", etc.

---

## ✅ Checklist de Validação

- [x] D_SPD com f_config=1 retorna configurações corretas
- [x] D_SPD com f_config=0&f_type=10 retorna jogos/classificações
- [x] D_FOOTBALL com f_titulo={ID} retorna partida específica
- [x] D_FOOTBALL.TEXTO2 contém JSON completo da API-Football
- [x] D_FOOTBALL_TEAMS com f_titulo={teamId} retorna dados do time
- [x] D_FOOTBALL_TEAMS.FOTO contém bandeira (também em SELO1/FOTO1)
- [x] D_FOOTBALL_STANDINGS com f_texto3={NomeGrupo} retorna classificação
- [x] D_FOOTBALL_STANDINGS.TEXTO3 contém nome do grupo
- [x] D_FOOTBALL_STANDINGS.TITULO sempre "1" (não filtrar por este campo)

---

## 🚀 Próximos Passos

### 1. Implementação no Código ⏳
Agora que a documentação está validada, implementar as correções nos templates:

1. **placar_futebol/js/master.js**
   - Substituir XMLHttpRequest por loader.addData()
   - Remover localStorage (rotação automática)
   - Implementar fluxo STANDINGS com f_texto3
   - Adicionar filtros corretos (f_type=10, f_specialproject)

2. **tabela_futebol/js/master.js**
   - Mesmas correções

3. **caminhos_futebol/js/master.js**
   - Adicionar f_specialproject para D_SPD
   - Usar D_FOOTBALL_TEAMS com f_titulo por time

4. **segundafase_futebol/js/master.js**
   - Mesmas correções do caminhos_futebol

### 2. Testes ⏳
- Testar cada template localmente com servidor EdgeContents
- Validar rotação automática
- Validar fluxo STANDINGS vs Partida
- Validar carregamento de bandeiras dos times

### 3. Documentação ✅
- ✅ MAPEAMENTO_CONSULTAS.md atualizado
- ✅ AUDITORIA_CANAIS.md criado
- ⏳ Atualizar README.md dos templates se necessário

---

**Auditoria concluída com sucesso.** Documentação validada e pronta para implementação.
