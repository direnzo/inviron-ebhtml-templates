# CCXP 2026 - Digital Signage

Status (2026-10-13): template de programação por palco montado com medidas reais.
Plano: `docs/PLANO-EXECUCAO.md`. Prompt de export: `docs/PROMPT-EXPORT-ILLUSTRATOR.md`.

## Escopo

- Programação por palco (6 totens TV 55", 1080x1920): esta branch.
- Destaque do dia e Fotos & Autógrafos (1280x512): branches próprias.
- Uma implementação; palco muda só por `CONFIG.palco` (id, cores, assets, vídeos).

## Sequência por palco (~39 s, steps vazios são omitidos)

| Frame | Conteúdo | Tempo |
|---|---|---|
| 0 | Abertura: vídeo intro do palco | 3 s |
| 1 | ROLANDO AGORA (1 painel) | 6 s |
| 2 | DAQUI A POUCO (1 painel) | 6 s |
| 3 | AINDA HOJE (até 5 painéis) | 13 s |
| 4 | Encerramento: vídeo + Baixe o App | 11 s |

## Palcos e ids (2025; confirmar na API)

Thunder 23008, Blast! 23009 (confirmado no PDF 2026), Universe 23005,
Omni 24001, Magic Market 23010, Omelete 23007 (previsto em 2025, sem arte).

## Materiais (fora do repo)

`C:\Users\direnzo\Documents\CLIENTES\CCXP\2026\Materiais\01_Template-Programacao-Dia`:
`1080x1920` (JPG só de referência, com placeholders), `Animados` (intro/encerramento
H.264 1080x1920, 30 fps), `ABERTO` (.ai). Referência 2025: `...\CCXP\2025\Templates`.

## Contrato de dados (confirmar com staging)

`D_CCXP_PALCOS`: `CATEGORY` (id palco), `TITULO` (palco), `TEXTO` (título), `TEXTO2`,
`FOTO`, `DATE`, `DT_END`, `DT_UPDATE`. API: `cms.ccxp.com.br/api/pt/events/`.

## Decisões

- ES6 liberado (player novo Windows, sem Android); ver instruções do projeto.
- Painel sai quando `DT_END` passou (data completa e fuso -03:00, nunca só HH:MM).
- Título: fonte mín/máx e `...` ao exceder; relógio único; estado substituído a cada carga.
- Sem loader secundário, sem `browserData.f_items`, `finished()` uma única vez.

## Pendências

- Vídeos dos demais 5 palcos copiados para `programacao_palco/videos/`.
- Confirmar dataset em 2026, `stage.title` do Magic/Omelete e Chromium do player.
- Regra para cancelado, remarcado, sem imagem e fim do dia.
- Atenção: cronograma mistura datas 2025/2026; tratar como ordem, não como prazo.
