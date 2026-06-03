# Mock Data - Placar Futebol

Mock atualizado com estrutura **idêntica** aos dados reais do EdgeContents.

## 🎯 Como usar

### 1. Ativar Mock
No `index.html`, descomente a linha:
```html
<script src="js/mock-data.js"></script>
```

### 2. Renomear arquivo
```bash
mv js/mock-data-new.js js/mock-data.js
```

### 3. Desativar Mock (Produção)
No `index.html`, comente a linha:
```html
<!-- <script src="js/mock-data.js"></script> -->
```

---

## 📋 Estrutura de dados

O mock simula **exatamente** o mesmo fluxo do código de produção:

```
1. D_SPD (CONFIG='1') → Patrocinador
2. D_SPD (CONFIG='0', TYPE='10') → Jogo atual
3. D_FOOTBALL → Detalhes da partida
4. D_FOOTBALL_TEAMS → Dados dos times (consulta individual)
```

### Campos importantes:

**D_SPD CONFIG=1 (Patrocinador):**
- `SPECIALPROJECT`: ID do projeto (ex: "17")
- `TEXT1`: Frase do sponsor
- `TEXT2`: Duração do vídeo em segundos (corte)
- `IMAGE_LOGO`: URL do logo
- `FILE_IMAGE1`: URL do vídeo/imagem
- `COLOR1/2/3`: Cores (hex sem #)

**D_FOOTBALL_TEAMS:**
- `TITULO`: ID do time (ex: "6")
- `TEXTO2`: Nome PT-BR (ex: "Brasil")
- `TEXTO3`: Código 3 letras (ex: "BRA")
- `FOTO`: URL PNG fallback

---

## 🎬 Cenários disponíveis

Editável em `mock-data.js` linha ~59:
```javascript
var cenario = 'copa2026_grupo_br_pre'; // Fixar cenário
// OU
var cenario = CENARIOS_LISTA[Math.floor(Math.random() * CENARIOS_LISTA.length)]; // Aleatório
```

**Cenários:**
1. `copa2026_grupo_br_pre` - Brasil x Marrocos | NS (pré-jogo)
2. `copa2026_grupo_br_1h` - Brasil x Marrocos | 1H 23' (1-0)
3. `copa2026_grupo_br_ft` - Brasil x Marrocos | FT (3-0)
4. `copa2026_final_pen` - Brasil x Argentina | FT (2-2, pen 4-2)

---

## ✅ Checklist de validação

Para garantir coerência mock ↔ produção:

- [ ] Bandeiras SVG funcionam (injection via XHR)
- [ ] Fallback PNG funciona se SVG não existir
- [ ] Patrocinador exibe intro + logo + frase
- [ ] Cores customizadas aplicadas
- [ ] SPECIALPROJECT extraído corretamente
- [ ] Nomes dos times em PT-BR
- [ ] Status traduzido (NS, 1H, FT, etc.)
- [ ] Placar exibido corretamente
- [ ] Pênaltis exibidos apenas em FT

---

## 🔧 Adicionar novo time

Editar `MOCK_TEAMS` em `mock-data.js`:
```javascript
var MOCK_TEAMS = {
    '6': {
        TITULO: '6',
        TEXTO2: 'Brasil',
        TEXTO3: 'BRA',
        FOTO: 'http://127.0.0.1:13199/FILES/127729'
    },
    // Adicionar aqui:
    '10': {
        TITULO: '10',
        TEXTO2: 'França',
        TEXTO3: 'FRA',
        FOTO: 'http://127.0.0.1:13199/FILES/127XXX'
    }
};
```

---

## 🐛 Debug

Console deve mostrar:
```
[placar_futebol] ========= MODO MOCK ATIVADO =========
[placar_futebol] Cenário: copa2026_grupo_br_pre
[mock] addData: D_SPD | filtro: f_config=1&f_specialproject=17
[mock] addData: D_SPD | filtro: f_config=0&f_type=10
[placar_futebol] ✅ SVG injetado: img/flags/br.svg
[placar_futebol] ✅ SVG injetado: img/flags/ma.svg
[mock] loaded()
[mock] finished()
```

Se algo falhar, compare com logs de produção (sem mock).
