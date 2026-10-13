# Plano de execução - CCXP 2026 Programação por Palco

Branch: `feat/ccxp-2026-programacao-palco`. Atualizado em 2026-10-13.
Escopo: 6 totens TV 1080x1920, uma base de código, seis pacotes `.eh5`.
Fora do escopo: Destaque do dia, F&A, quadriédros e carregadores (branches próprias).

## Decisões fechadas

- ES6 liberado; sem Android nem players antigos (player novo, Windows).
- Frames: 0 abertura (vídeo 3 s), 1 rolando agora (6 s), 2 daqui a pouco (6 s),
  3 ainda hoje (13 s, até 5 painéis), 4 encerramento (vídeo 11 s).
- JPGs de `1080x1920` são só referência; fundos reais virão do `.ai` sem dados.
- Vídeos finais já entregues em `Animados` (H.264 1080x1920, 30 fps).

## Fases

| # | Fase | Entrega | Depende de | Status |
|---|---|---|---|---|
| 0 | Documentação e gate | README, instruções, este plano | - | feita |
| 1 | Export dos fundos e medidas | PNG de `img/` + `layout-programacao.json` + logo | prompt do Illustrator | feita |
| 2 | Esqueleto | pasta `programacao_palco`, `config.js` | 0 | feita |
| 3 | Motor de programação | seleção atual/próximo/restante, estado, ciclo do player | 2 | feita, 14 testes |
| 4 | Interface | frames 1-3, vídeos, relógio, autofit, transições | 1, 3 | feita (medidas reais) |
| 5 | Testes locais | mock, cenários de dado, reload, finalização única | 4 | mock + Chrome feitos; falta ebcliente4 |
| 6 | Seis palcos | 6 `.eh5`, reabertos e conferidos | 5 | pendente |
| 7 | Homologação | staging, validação CCXP, troca para produção | 6 | pendente |

## Detalhe por fase

**2 Esqueleto.** Copiar `_template-base` (EBHTML 2.0.7 sem alterações). `CONFIG` com
dataset `D_CCXP_PALCOS`, `palco`, identidade (cores, fundos, vídeos), tempos por frame,
timezone `-03:00`, limites de título e fallbacks. Variante de palco = trocar `CONFIG.palco`.

**3 Motor.** Uma função de parsing temporal (data completa + fuso). Estado substituído
a cada carga (sem `push` acumulado). Atual = `início <= agora < fim`; próximo = primeiro
futuro; restante = próximos 5. Evento encerrado sai por `DT_END`. Sem eventos: liberar a
playlist. `loaded()` antes de `finished()`; guarda idempotente; watchdog global.

**4 Interface.** Fundos PNG por frame; foto, horário e título posicionados pelo JSON de
layout. Autofit com mín/máx e `...`. Vídeos com `ended`, `error`, fallback de autoplay e
handlers antes de `src`/`play()`. Um único relógio (sem preenchimento: `9:41`, como na arte).
Steps vazios são omitidos; se só resta 1 painel, sem "Ainda hoje".

**5 Testes** (em `http://localhost:12099/FILES/1/index.html`):
dia cheio; 3 painéis; 2 painéis; 1; 0; painel mudando durante execução; sem imagem;
título muito longo; JSON malformado; vídeo ausente; virada de dia; reload agressivo;
`finished()` chamado uma única vez em todos os caminhos.

**6 Pacotes.** Um `.eh5` por palco contendo só os assets daquele palco (os vídeos são os
maiores itens). Reabrir cada pacote e conferir assets, referências e versão do EBHTML.

## Marcos do cronograma (ordem, datas a confirmar)

| Data | Marco |
|---|---|
| 15/10 | Entrega do primeiro template para validação |
| 19-22/10 | Vídeos inseridos, ajustes, aprovação final |
| 23/10-03/11 | Replicação para os demais palcos |
| 04-17/11 | Validação, ajustes e aprovação final |
| 18-19/11 | Troca da API para produção e revalidação |
| 24/11-02/12 | Configuração das máquinas, testes finais, montagem |

Risco: hoje é 13/10 e a entrega de 15/10 depende da fase 1 (fundos limpos).

## Perguntas em aberto

1. `D_CCXP_PALCOS` segue válido em 2026 e com os mesmos campos?
2. `stage.title`/id exatos de Omelete e Magic Market na API.
3. Regra para cancelado, remarcado, sem imagem e após o último painel.
4. Fonte e medidas finais (saem do JSON da fase 1).
5. Codecs: confirmar H.264 com `canPlayType()` no player real.
