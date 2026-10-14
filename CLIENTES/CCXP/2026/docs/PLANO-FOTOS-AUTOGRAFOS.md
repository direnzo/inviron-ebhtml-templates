# Plano de criação - Fotos & Autógrafos (painel LED 1280x512)

Branch: `feat/ccxp-2026-fotos-autografos`. Pasta do template: `CLIENTES/CCXP/2026/fotos_autografos/`.
Escopo oficial: "Template Programação F&A" (`ccxp26_sinalizacao-digital_escopo templates.pdf`).
Referências: `programacao_palco` (2026, base do player) e `ccxp25_ds_fotos_autografos_v` (2025).

## 1. Materiais recebidos (`Materiais/03_Template-F&A`)

| Item | Arquivo | Observação |
|---|---|---|
| Medidas | `Exports/layout-fotos-autografos.json` | sRGB; uma tela com **2 blocos de artista** lado a lado |
| Fundo | `ABERTO/fundo_FA.png` | 1281x513; **já com** logos F&A + Heineken 0.0 e CCXP26 e formas decorativas |
| Vídeos | `Animados/F&A INTRO.mp4` (5 s), `F&A ENCERRAMENTO.mp4` (11 s) | H.264 **1280x512** |
| Referência visual | `1280x512/f&a ... _A|B|C.jpg`, `Exports/fotos-autografos_anotado.png` | só conferência |

Tela **horizontal** (LED P3.9, módulos 128x128): sem rodapé preto e **sem relógio**. Outra proporção que a
programação por palco: a escala do preview passa a usar 1280x512.

## 2. O que 2025 faz (referência) e o que muda

| Tema | 2025 (`master.js`) | 2026 |
|---|---|---|
| Dataset | `D_CCXP_FEA`, `amount=0` | mesmo nome (existe no player, hoje vazio); confirmar |
| Campos | `TITULO` (artista), `TEXTO` (data), `CATEGORY` (modalidade), `TEXTO2` (horário em texto), `TEXTO3` (`sim` = esgotado), `FOTO`, `DT_BEGIN`, `DT_END` | escopo: título, imagem, tipo, período (texto), início/término da sessão, esgotado |
| Agrupamento | por `TITULO` + `TEXTO`; 1 slide por artista com até 6 modalidades | por artista (id estável, não título concatenado); até 5 modalidades |
| Ordem | alfabética por título | alfabética por título (escopo) |
| Paginação | 2 artistas por página, 10 s, entrada/saída escalonada (200/100 ms) | igual: 2 blocos por tela |
| Esgotado | opacidade 50% + imagem "esgotado" | selo vermelho `#F60000` rotacionado -7,84° sobre o horário |
| Filtro de tempo | **nenhum** (lia `DT_END` e não usava) | sessão encerrada some; artista some quando não resta sessão |
| Sem dados | tocava a abertura e o encerramento inteiros | sem dados: `loaded()` + `finished()` em ~100 ms |

Modalidades 2025 (`CATEGORY`): Autógrafos, Fotos, Selfie, Foto em grupo, Foto em dupla, Foto individual.
Rótulos 2026 no modelo: Autógrafo, Foto individual, Foto em dupla, Foto em grupo, Selfie, **Meet&Greet**.

**Não copiar de 2025:** `ebhtml.create2` aninhado (carrega duas vezes); `innerHTML` com texto do CMS;
`data.browserData.f_items`; timer de 6 h; `location.reload` no resize; corte fixo em 80 caracteres.

## 3. Regras de exibição

1. Agrupar por artista (`TITULO`) e dia; cada modalidade é uma linha com rótulo e horário.
2. Só sessões de hoje (fuso -03:00). Sessão cujo término passou deixa de aparecer; artista sem
   sessões restantes sai da lista.
3. Ordem alfabética por título (sem acento/caixa). Páginas de 2 artistas, `CONFIG.tempos.pagina`.
4. Variante do bloco por quantidade de modalidades: **até 3** usa o bloco grande (rótulo 38,6 px,
   horário 46,3 px, passo 88,4); **4 a 5** usa o compacto (25,0 / 30,0 px, passo ~57,3).
5. Esgotado: selo sobre o horário da linha. Horário como "11h25 - 12h00" (início - término).
6. Título do artista até 2 linhas (43,5 px, entrelinha 38,1); acima disso corta com `...`.
7. Última página com 1 artista: mostrar o bloco da esquerda e deixar a direita vazia (ver pergunta 3).

## 4. Layout (de `layout-fotos-autografos.json`, px em 1280x512)

| Elemento | Bloco esquerdo | Bloco direito |
|---|---|---|
| Título | x=70,1; baselines 83,3 e 121,4; `#ADDA09` | x=686,1 (= esquerdo + 615,95) |
| Foto | 70,997 / 132,98; 307,33x307,33; borda 1 px preta | 686,95 / 132,98 |
| Rótulo | x=391,3; `#00DFF8` | x=1007,8 |
| Horário | x=390,2; `#FFFFFF`; baseline = rótulo + 28,8 (compacto) / + 44,4 (grande) | x=1006,2 |
| Fundo | `#004BC9`, formas `#17269D` a 50% (já no PNG) | |

Baselines da lista compacta: 164,3 / 221,6 / 278,8 / 337,6 / 394,8 (rótulo). Grande: 186,7 / 275,0 / 363,4.
Selo: retângulo 102,7x21 centrado em (453,9; 413,9) com rotação -7,84°, texto "esgotado" branco —
**sem fonte identificada** (texto em contorno): usar o recorte como imagem.

## 5. Estrutura técnica

- Copiar de `programacao_palco`: `ebhtml.js`, `config.js`, `mock-data.js`, estrutura do player
  (loaded/finished único, watchdogs, vídeos, fonte), CSS e testes. Escala-base 1280x512.
- Novo `js/fea.js` (lógica pura, testada em Node): normalizar, agrupar, filtrar sessões vivas,
  ordenar, paginar de 2 em 2, escolher a variante do bloco.
- `config.js`: `tempos.pagina` (10000), `tempos.intro` (5000), `tempos.outro` (11000), blocos
  (`x`, baselines, tamanhos), cores, `maxModalidades` (5), `itensPorPagina` (2).
- Assets: `fundo_FA.png`, selo "esgotado", vídeos 1280x512, `GothamCond-Ultra.ttf`.

## 6. Fases

| # | Fase | Entrega | Verificação |
|---|---|---|---|
| 0 | Branch e esqueleto | pasta a partir de `programacao_palco`, escala 1280x512 | roda com mock |
| 1 | Lógica pura | `fea.js` + testes (agrupar, filtrar, ordenar, paginar) | `node --test` |
| 2 | Interface | 2 blocos, variantes grande/compacta, selo, animação | captura 1280x512 |
| 3 | Mock | dia com 8 a 12 artistas, 1 a 5 modalidades, esgotados, textos longos | cenários |
| 4 | Player real | `?mock=0`, EBDATA simulado, depois dataset real | `ebcliente4` / LED |
| 5 | Pacote | `.eh5` só com assets usados | reabrir e conferir |

## 7. Testes mínimos

Sem dados; 1 artista; 2; 3 (página parcial); 5 modalidades; 3 modalidades; esgotado; sessão
encerrada some; artista sem sessões some; ordem alfabética com acento; título de 2+ linhas;
foto quebrada; troca de dia; modalidade desconhecida; `finished()` uma única vez.

## 8. Perguntas em aberto

1. Variante do bloco: a regra "até 3 grande / 4-5 compacta" é a intenção? (o modelo só mostra um
   exemplo de cada; a escolha por quantidade foi **deduzida**.)
2. "Meet&Greet" é uma 6ª modalidade? O escopo lista 5 e o modelo tem 6 rótulos.
3. Página com 1 artista: bloco à esquerda, centralizado, ou repete o último?
4. Horário: usar `DT_BEGIN`-`DT_END` da sessão ou o texto do período do CMS ("das 14h às 18h")?
5. Tempo por página: 10 s (2025) ou outro valor?
6. Campo e valor de "esgotado" em 2026 (2025: `TEXTO3 = 'sim'`).
7. Nomes de `CATEGORY` em 2026 (singular "Autógrafo" vs plural "Autógrafos" de 2025).
8. Arte do selo "esgotado": precisamos do arquivo (texto em contorno no Illustrator).
