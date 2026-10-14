# Plano de criação - Destaque do Dia (Totem TV 1080x1920)

Branch: `feat/ccxp-2026-destaque-dia`. Pasta do template: `CLIENTES/CCXP/2026/destaque_dia/`.
Escopo oficial: "Template Destaque do Dia" (`ccxp26_sinalizacao-digital_escopo templates.pdf`).
Referências: `programacao_palco` (2026, base do player) e `ccxp25_ds_destaques_v` (2025, lógica).

## 1. Materiais recebidos (`Materiais/02_Template-Destaque-Dia`)

| Item | Arquivo | Observação |
|---|---|---|
| Medidas | `Exports/layout-destaques.json` | sRGB; 6 palcos; origem fracionária das pranchetas |
| Fundos | `ABERTO/destaque_{palco}.png` | 1081x1921; **já com** ornamento do topo e logo do palco |
| Vídeos | `Animados/DESTAQUES INTRO.mp4` (3 s), `DESTAQUES ENCERRAMENTO.mp4` (11 s) | H.264 1080x1920, um par para todos os palcos |
| Referência visual | `1080x1920/DESTAQUE_*.jpg`, `Exports/destaques_anotado.png` | só conferência |

Fica de fora do fundo (texto vivo): título "DESTAQUE DE HOJE" (estático), foto, horário, descrição, relógio.

## 2. O que 2025 faz (referência) e o que muda

| Tema | 2025 (`destaques.js`) | 2026 |
|---|---|---|
| Dataset | `D_CCXP_DESTAQUES`, `order=date`, `amount=0` | mesmo nome (existe no player, hoje vazio); confirmar |
| Marcador | `TEXTO2 === '1'` filtrado no cliente | `highlight=true` do site; manter `TEXTO2 === '1'` até confirmar |
| Campos | `CATEGORY` (id palco), `TITULO`, `TEXTO`, `FOTO`, `DATE`, `DT_END` | iguais aos de `D_CCXP_PALCOS` |
| Visual por palco | mapa `stages` (fundo + cor do horário) por `CATEGORY` | `CONFIG.palcos` (já existe no template de programação) |
| Sequência | intro 3,5 s → 1 slide por destaque (5 s) → vídeo final → `finished()` | intro 3 s → 1 slide por destaque (até 6 s) → final 11 s |
| Animação | camadas: fundo faz fade (1 s); conteúdo entra pela direita após 300 ms; sai pela esquerda | manter as camadas e os tempos em `CONFIG.tempos` |
| Filtro | `DT_END` só por HH:MM; sem filtro de dia | data completa + fuso; só o dia de hoje |
| Texto | corta em 80 caracteres e `fitDescriptionFont` | tamanhos fixos da arte; corta com `...` acima de 3 linhas |

**Não copiar de 2025:** `data.browserData.f_items`; timer de 6 h; `loader.finished()` sem
`loaded()`; `createSlide` de todos de uma vez; detecção de Android; `location.reload` no resize.

## 3. Regras de exibição

1. Entram só registros do dataset com o marcador de destaque **e** do dia de hoje (fuso -03:00).
2. Saem quando `DT_END` passou (comparação por data completa). Ordem cronológica por início.
3. Um slide por destaque, com fundo, ornamento, logo e cor do palco do próprio evento.
4. Sem destaques válidos: `loaded()` + `finished()` em ~100 ms, sem desenhar (não exibe).
5. Duplicados (mesmo título + início) e sem título/foto inválida seguem as regras do template
   de programação (descarte; foto ausente = bloco na cor do palco).
6. Limite de slides: `CONFIG.maxDestaques` (padrão 6, igual ao nº de palcos; ver pergunta 2).

## 4. Layout (de `layout-destaques.json`, px em 1080x1920)

| Elemento | Posição / estilo |
|---|---|
| Título "DESTAQUE DE HOJE" | centralizado, baseline y=385,6; GothamCond-Ultra 144,2 px; branco (Omelete preto) |
| Foto | x=102, y=445,7, 876x876, borda 2 px `#080E13`, `object-fit: cover` |
| Horário | x=102, baseline y=1501,7; 185,97 px; **tracking 20** (0,02 em = ~3,7 px); cor por palco |
| Descrição | x=102, w=882, 1ª baseline y=1599,4; 75 px / 74 px de entrelinha; 3 linhas |
| Rodapé | barra y=1833,3 (altura 85,8), logo CCXP26 e relógio como em `programacao_palco` |

Cores por palco (fundo, horário): Thunder `#F6002F`/preto, Blast `#9D0034`/`#FFA500`, Universe
`#F235C3`/`#3E1490`, Omni `#FF7900`/preto, Magic `#3E1490`/`#00DFF8`, Omelete `#FFAD00`/preto.
Diferenças da programação: horário do Omni e do Omelete é **preto** aqui; descrição do Omelete é
**branca** aqui (preta na programação). O "26" do logo é `#FFC800`.

## 5. Estrutura técnica

- Copiar de `programacao_palco`: `ebhtml.js` (2.0.7), `programacao.js` (datas/fuso), `master.js`
  (ciclo, mídia, vídeos, rodapé, relógio), `mock-data.js`, `config.js`, CSS e testes.
- Novo `js/destaques.js` (lógica pura, testada em Node): `select(eventos, agora, opts)` →
  lista ordenada; `buildSteps` → `intro`, N × `destaque`, `outro`.
- Fundos `destaque_{palco}.png` e logos em `img/`; vídeos em `videos/` (ignorados pelo Git).
- `config.js`: `tempos.destaque` (6000), `tempos.intro`/`outro`, `maxDestaques`, `palcos` (cores).

## 6. Fases

| # | Fase | Entrega | Verificação |
|---|---|---|---|
| 0 | Branch e esqueleto | pasta a partir de `programacao_palco` | roda com mock |
| 1 | Lógica pura | `destaques.js` + testes | `node --test` |
| 2 | Interface | slide único, fundo por palco, animação em camadas | captura por palco |
| 3 | Mock | 5 dias, destaques de vários palcos, textos curtos/longos | cenários |
| 4 | Player real | `?mock=0`, EBDATA simulado, depois dataset real | `ebcliente4` |
| 5 | Pacote | `.eh5` só com assets usados; mock excluído | reabrir e conferir |

## 7. Testes mínimos

Sem destaque; 1; 6 (um por palco); destaque encerrado some; marcador `0`; outro dia;
palco desconhecido (fundo padrão); título longo; foto quebrada; ordem cronológica; troca de dia;
`finished()` uma única vez; vídeo ausente.

## 8. Perguntas em aberto

1. Dataset e marcador de 2026: `D_CCXP_DESTAQUES` + `TEXTO2 = '1'` ou eventos com `highlight`?
2. Quantos por dia? O escopo diz "até 2 painéis por dia" e também "até 6 s por palco (6-36 s)".
3. Duração do slide: 6 s (escopo) ou 5 s (2025)?
4. O título "DESTAQUE DE HOJE" também vale para destaques de amanhã? (hoje só mostra hoje)
5. Há ticker/variante "com ticker" em 2026? (2025 teve `destaques_ticker`; o escopo 2026 não cita)
