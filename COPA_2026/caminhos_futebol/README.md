# caminhos_futebol

Template de Digital Signage para exibição do chaveamento eliminatório da **Copa FIFA 2026**.
Exibe o bracket completo (2ª Rodada → Final), com conectores SVG, animações de entrada e destaque do caminho do vencedor.

---

## Estrutura de arquivos

```
caminhos_futebol/
├── index.html              HTML principal
├── package.json            Scripts npm (dev / build)
├── tailwind.config.js      Breakpoints e tema
├── css/
│   ├── input.css           Fonte dos estilos (editar aqui)
│   └── master.css          Compilado pelo Tailwind (não editar)
├── img/
│   └── soccer-background-loop-*.mp4   Vídeo de fundo
└── js/
    ├── ebhtml.js           Biblioteca EBHTML (não editar)
    ├── bracket-draw.js     Desenho de conectores SVG
    ├── master.js           Lógica principal do template
    └── mock-data.js        Dados fictícios para desenvolvimento
```

---

## Desenvolvimento local

```bash
# 1. Watch CSS (recompila ao salvar input.css)
npm run dev

# 2. Abrir no navegador via servidor EdgeContents
# http://localhost:12099/FILES/1/index.html
```

Para habilitar dados fictícios (sem backend), garanta que o script `mock-data.js` esteja **descomentado** no `<head>` do `index.html`:

```html
<script src="js/mock-data.js"></script>  <!-- habilitado = modo dev -->
```

Para produção, **comentar** essa linha e executar:

```bash
npm run build
```

---

## Dados do Patrocinador (D_SPD)

O template suporta dados de patrocinador via `D_SPD` (CONFIG='1'):

| Campo | Descrição |
|-------|-----------|
| `FILE_IMAGE1` | Vídeo ou imagem de intro do patrocinador |
| `IMAGE_LOGO` | Logo do patrocinador (exibido no rodapé) |
| `TEXT1` | Texto/título do patrocinador |
| `TEXT2` | **Duração do vídeo/imagem** (em segundos) |
| `COLOR1` | Cor de destaque (ex: `#FBBF24` ou `FBBF24`) |
| `COLOR2` | Cor escura/fundo (ex: `#006400`) |
| `COLOR3` | Cor clara/texto (ex: `#FFFFFF`) |

**Controle de duração de vídeo/imagem (TEXT2):**
- Se TEXT2 tem valor (ex: `5`): vídeo é **cortado** após 5 segundos
- Se TEXT2 vazio: vídeo roda **até o fim** (evento `ended`)
- Imagens: TEXT2 ou **5 s padrão** (DURACAO_IMAGEM_PADRAO_MS)

**Modo Preview (Extranet):**
- Extrai partidas do **D_FOOTBALL.TEXTO3** (JSON stringificado)
- Extrai sponsor: COLOR1/2/3, FILE_IMAGE1, IMAGE_LOGO, TEXT1, TEXT2
- Aplica cores dinâmicas via `mergeColorsFromSpd()`
- Suporta intro de vídeo/imagem com controle de duração
- **teamsMap vazio**: preview não acessa D_FOOTBALL_TEAMS (nomes vêm direto do TEXTO3)

**IMPORTANTE:** Campo DURACAO foi DEPRECIADO. Use TEXT2.

---

## Funções de Tradução e Sanitização

O template inclui funções para processar nomes de torneios e fases que venham dos dados:

### traduzirFase(texto)
Traduz nomes de fases/rodadas do inglês para PT-BR:
- **Lookup direto**: "quarter-finals" → "Quartas de Final"
- **Padrões dinâmicos**: "Matchday 12" → "Rodada 12", "Round 15" → "Rodada 15"
- Se não encontrar tradução, retorna o texto original sem modificação

```javascript
traduzirFase('quarter-finals')  // → "Quartas de Final"
traduzirFase('Matchday 5')      // → "Rodada 5"
traduzirFase('Round of 16')     // → "Oitavas de Final"
```

### sanitizarNomeTorneio(texto)
Remove termos proibidos de direitos autorais e substitui por equivalentes:
- "Copa do Mundo" → "O Mundo em Campo"
- "World Cup" → "O Mundo em Campo"
- "FIFA 2026" → "O Mundo em Campo 2026"
- "FIFA" → (removido)

```javascript
sanitizarNomeTorneio('Copa do Mundo FIFA 2026')  // → "O Mundo em Campo 2026"
sanitizarNomeTorneio('FIFA World Cup')           // → "O Mundo em Campo"
```

**Nota:** Estas funções estão disponíveis mas não são aplicadas automaticamente. Use-as ao processar dados externos que possam conter termos protegidos ou nomes em inglês.

---

## Formato dos dados (EdgeContents / Mock)

O template consome um dataset chamado **`D_COPA`** com uma linha por partida.
No mock, equivale ao array `MOCK_DATA.partidas`. Cada registro tem os campos:

| Campo            | Tipo   | Descrição                                      |
|------------------|--------|------------------------------------------------|
| `FASE`           | string | `R32`, `R16`, `QF`, `SF`, `FINAL`, `BRONZE`   |
| `POSICAO`        | number | Número do slot dentro da fase (ver tabela abaixo) |
| `TIME_CASA`      | string | Sigla do time mandante (ex: `BRA`)             |
| `TIME_VISITANTE` | string | Sigla do time visitante (ex: `ARG`)            |
| `FLAG_CASA`      | string | URL da bandeira mandante                       |
| `FLAG_VISITANTE` | string | URL da bandeira visitante                      |
| `GOLS_CASA`      | string | Placar mandante (vazio se não jogou)           |
| `GOLS_VISITANTE` | string | Placar visitante (vazio se não jogou)          |
| `STATUS`         | string | Ver tabela de status abaixo                    |

### Tabela de posições (FASE + POSICAO → slot DOM)

| FASE   | POSICAO | Lado    | ID no DOM    |
|--------|---------|---------|--------------|
| R32    | 1–8     | Esquerda| `m-r32-l1` … `m-r32-l8` |
| R32    | 9–16    | Direita | `m-r32-r1` … `m-r32-r8` |
| R16    | 1–4     | Esquerda| `m-r16-l1` … `m-r16-l4` |
| R16    | 5–8     | Direita | `m-r16-r1` … `m-r16-r4` |
| QF     | 1–2     | Esquerda| `m-qf-l1`, `m-qf-l2`   |
| QF     | 3–4     | Direita | `m-qf-r1`, `m-qf-r2`   |
| SF     | 1       | Esquerda| `m-sf-l`                |
| SF     | 2       | Direita | `m-sf-r`                |
| FINAL  | 1       | Centro  | `m-final`               |
| BRONZE | 1       | Centro  | `m-bronze`              |

### Status válidos

| STATUS | Significado                          |
|--------|--------------------------------------|
| `NS`   | Não iniciado (a definir)             |
| `TBD`  | Time ainda não classificado          |
| `1H`   | Primeiro tempo em andamento          |
| `HT`   | Intervalo                            |
| `2H`   | Segundo tempo em andamento           |
| `ET`   | Prorrogação                          |
| `BT`   | Intervalo da prorrogação             |
| `P`    | Pênaltis                             |
| `FT`   | Encerrado (tempo normal)             |
| `AET`  | Encerrado na prorrogação             |
| `PEN`  | Encerrado nos pênaltis               |

Times com `STATUS` = `NS` ou `TBD`, ou com `TIME_CASA` vazio/`TBD`, exibem **"a definir"** em itálico discreto no lugar do nome.

---

## Lógica de renderização (`master.js`)

### Fluxo de inicialização

```
window.onload
  └─ mock ativo? → processarDadosMock()
                → iniciarTemplate()
     senão      → ebhtml.create2() → loader.load()
                → processarDados()
                → iniciarTemplate()

iniciarTemplate()
  ├─ renderizarBracket()        preenche todos os 32 slots
  ├─ BracketDraw.init()         desenha conectores SVG
  ├─ ocultarFasesAnteriores()   oculta colunas de fases já superadas
  ├─ atualizarFaseAtual()       atualiza label no header
  ├─ aplicarSponsor()           preenche nome/logo do patrocinador
  ├─ animarEntradaBracket()     stagger de fade-in nos cards
  ├─ destacarPartidaRecente()   brilho dourado no último jogo
  ├─ animarCaminhoVencedor()    highlight do caminho do líder
  ├─ wrapper.opacity = 1        fade-in geral da tela
  ├─ loader.loaded()            ✅ sinaliza sucesso ao EBHTML
  └─ loader.finished()          ✅ sinaliza fim da exibição (após duration ms)
```

### Ocultamento automático de fases anteriores

Quando **todos os times** de uma fase estão definidos (nenhum vazio ou `TBD`), as colunas da fase imediatamente anterior são ocultadas com `display: none`. Isso libera espaço na tela para as fases mais recentes.

**Funções responsáveis:**

- `isFaseCompleta(dados, fase, total)` — retorna `true` se todos os `total` slots da fase têm time válido
- `ocultarFasesAnteriores(dados)` — percorre `FASES_COLS` em ordem (`R32 → R16 → QF → SF`) e oculta tudo antes da fase mais avançada completa. Após ocultar, chama `BracketDraw.init()` para redesenhar os conectores SVG sem as colunas ocultas.

**Exemplo prático:**

| Estado dos dados               | Resultado visual                        |
|--------------------------------|-----------------------------------------|
| R32: todos definidos, R16: parcial | R32 visível (R16 ainda incompleto) |
| R16: todos definidos, QF: parcial  | R32 some, R16 visível               |
| QF: todos definidos, SF: parcial   | R32 e R16 somem, QF visível         |

### Destaque de vencedor/perdedor

Quando `STATUS` é `FT`, `AET` ou `PEN`, a função `aplicarResultado()` adiciona:
- `.winner` na linha do time com mais gols → nome em amarelo dourado
- `.loser` na linha do time perdedor → opacidade reduzida

---

## Conectores SVG (`bracket-draw.js`)

Desenhados sobre um `<svg id="bracket-svg">` posicionado em `absolute` cobrindo toda a `.bracket-area` (z-index 0, atrás dos cards que ficam em z-index 1).

Cada conexão é definida no array `CONNECTIONS` com tipo `merge` (2 → 1) ou `single` (1 → 1):

- **merge**: 4 linhas — horizontal de cada source até o ponto médio, vertical ligando os dois, horizontal do ponto médio até o target
- **single**: 3 linhas — horizontal da source até coluna intermediária, vertical, horizontal até o target

Conectores do lado esquerdo saem pela borda direita dos cards (`side: 'right'`).
Conectores do lado direito saem pela borda esquerda (`side: 'left'`).

Redesenho automático no `window.resize` (debounce 150ms).

---

## Tempo de exibição

| Cenário | Intro (`D_SPD.FILE_IMAGE1`) | Conteúdo (bracket) | Total |
|---------|----------------------------|-------------------|-------|
| Com intro | `DURACAO` em segundos (`D_SPD`, `CONFIG='1'`) | **5 s fixos** | intro + 5s |
| Sem intro | — | **10 s** | 10 s |

**Fallback** (sem `DURACAO` válido): vídeo até `ended`; imagem **5 s**.

Produção: partidas em `D_FOOTBALL.TEXTO3` (JSON). Patrocinador e `DURACAO` em `D_SPD`.

---

## Configurações do mock (`mock-data.js`)

```javascript
var MOCK_DATA = {
    enabled: true,
    D_SPD: {
        CONFIG: '1',
        FILE_IMAGE1: 'img/sponsor.mp4',
        DURACAO: '8'   // segundos da intro
    },
    partidas: [ /* array de partidas */ ]
};
```

---

## Checklist de produção

- [ ] `MOCK_DATA.enabled = false` **ou** comentar `<script src="js/mock-data.js">` no HTML
- [ ] `npm run build` executado
- [ ] Dataset `D_COPA` configurado no EdgeContents com todos os campos
- [ ] Vídeo de background presente em `img/`
- [ ] Fontes Roboto presentes em `css/fonts/`
