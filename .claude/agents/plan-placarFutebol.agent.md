# Plan: Template Placar de Futebol (`placar_futebol/`)

## TL;DR
Criar template `placar_futebol/` do zero copiando a base de `_template-base/`. Layout de placar com dois escudos (FOTO/FOTO2), dados vindos de D_FOOTBALL (info do jogo) + D_SPD opcional (placar ao vivo, matching por TYPE=10 e TITLE=D_FOOTBALL.TEXTO). Duração: 10s. ES5 obrigatório.

---

## Fases

### Fase 1 — Estrutura de Arquivos
1. Criar pasta `placar_futebol/` copiando estrutura de `_template-base/`
2. Copiar `_template-base/js/ebhtml.js` → `placar_futebol/js/ebhtml.js` (nunca editar)
3. Criar `placar_futebol/package.json` baseado em `_template-base/package.json`
4. Criar `placar_futebol/tailwind.config.js` com breakpoints aspect-ratio (portrait, landscape, ultrawide, superbanner, empena)
5. Criar `placar_futebol/css/input.css` com @tailwind directives + fontes

### Fase 2 — Mock Data (`js/mock-data.js`)
6. Criar mock com 4 cenários via variável `cenario`:
   - `'pre_jogo'` — D_FOOTBALL com SUBTITULO3='NS', sem D_SPD
   - `'ao_vivo'` — D_FOOTBALL com SUBTITULO3='1H', D_SPD com TYPE=10, gols, TEXT9=tempo
   - `'encerrado'` — SUBTITULO3='FT', D_SPD com resultado final
   - `'penalties'` — SUBTITULO3='PEN', D_SPD com TEXT7/TEXT8 preenchidos
7. Mock loader seguindo padrão c2r_busdoor (datalist + data + get(i))
8. Todos os campos em UPPERCASE compatíveis com D_FOOTBALL XML

### Fase 3 — JavaScript principal (`js/master.js`)
9. `window.onload`: detectar MOCK vs EdgeContents
10. `loader.addData('D_FOOTBALL', false)` — obrigatório
11. `loader.addData('D_SPD', false)` — opcional (nodataiserror=false)
12. Função `buscarSPD(loader, partidaId)` — itera D_SPD com datalist, filtra TYPE='10' + TITLE===partidaId
13. Função `determinarEstado(footballData, spdData)` — retorna 'pre_jogo'|'ao_vivo'|'encerrado'|'penalties'
    - Prioritiza spdData.TEXT4 se disponível, fallback para SUBTITULO3
14. Função `formatarDataHora(dateStr)` — split de '2025-07-08 12:00:00' → {hora:'12:00', data:'08/07/2025'}
15. Função `renderizarTemplate(dados, loader)`:
    - Preenche nomes dos times, torneio, rodada, estádio, data/hora
    - Mostra/esconde seção de placar conforme estado
    - Placar format: "2 x 1"
    - Penalties: mostra "(pen X x Y)" em subtext
    - Escudo fallback: svg inline genérico se FOTO/FOTO2 vazio
16. Carregamento de imagens com contador (2 shields):
    - Incrementa `loadedCount` em onload/onerror de cada escudo
    - Quando `loadedCount >= 2` → `loader.loaded()`
    - `setTimeout(loader.finished, 10000)` após loaded
17. Fade-in body após imagens carregadas

### Fase 4 — HTML (`index.html`)
18. Layout 3 colunas com flexbox:
    ```
    [Header: Torneio · Rodada]
    [Col Esq | Col Centro | Col Dir]
      Nome T1    Hora         Nome T2
      Escudo1    Data         Escudo2
                [2 x 1]*   
                 [45']* Jogador X marcou!
    [Footer: Estádio]
    ```
    (* visível só quando ao_vivo/encerrado)
19. Background: escuro (dark), gradiente sutil
20. Elemento `#scoreSection` com `hidden`/`block` controlado por JS
21. Elemento `#penaltySection` só visível em estado 'penalties'
22. Escudos: `<img id="logo1">` e `<img id="logo2">` com fallback SVG
23. Breakpoints aspect-ratio no HTML (portrait: stacking vertical, ultrawide: ajuste de proporções)

### Fase 5 — CSS TailwindCSS
24. Compilar com `npm run build` após implementação
25. Classes customizadas para placar (fonte grande, negrito)

---

## Arquivos a Criar
- `placar_futebol/index.html`
- `placar_futebol/js/master.js`
- `placar_futebol/js/mock-data.js`
- `placar_futebol/js/ebhtml.js` (copiado)
- `placar_futebol/package.json`
- `placar_futebol/tailwind.config.js`
- `placar_futebol/css/input.css`
- `placar_futebol/css/master.css` (gerado)

## Referência
- `_template-base/` — base para copiar
- `c2r_busdoor/js/master.js` linhas 95-172 — padrão de dois datasets + matching
- `c2r_busdoor/js/mock-data.js` — padrão de mock multi-dataset
- `hojemais/js/master.js` — padrão de mock simples + image onload
- `uol_responsivo_tw/tailwind.config.js` — breakpoints aspect-ratio

## Verificação
1. Abrir no navegador com mock `cenario = 'pre_jogo'` → deve mostrar hora/data SEM placar
2. Trocar para `cenario = 'ao_vivo'` → placar "2 x 1", timer "45'", gols sob cada escudo
3. Trocar para `cenario = 'encerrado'` → placar final + "FT"
4. Trocar para `cenario = 'penalties'` → placar + seção de pênaltis "(pen X x Y)"
5. Console não deve ter erros ES6 (testável no Chrome com modo legacy devtools)
6. `loader.loaded()` chamado apenas em sucesso; `loader.finished()` sempre chamado

## Decisões
- Duração: 10000ms
- Formato placar: "2 x 1"
- Fallback escudo: ícone SVG genérico de escudo
- Pasta: `placar_futebol/`
- 4 cenários de mock habilitados
- D_SPD é opcional — sem match não quebra o template
