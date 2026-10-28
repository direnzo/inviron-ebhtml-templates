# WEOOH - Placar Vasco x Flamengo
Prototipo patrocinado continuo, com dados MOCK; nao homologado para producao.
Branch: `feat/weooh-placar-flamengo-vasco`. Base: EBHTML 2.0.7 canonico.

## Execucao
- Abrir somente `http://localhost:12099/FILES/1/index.html` via ebcliente4.
- Watcher: `npm run dev`, com Tailwind global; nao instalar dependencias locais.
- CONFIG em `js/config.js`: tempos, cores, regioes, equipes e mapa dos videos.
- Formatos EXATOS (origem explicit): `1920x1080`, `1080x1920`, `2048x128`; nenhum outro homologado.
- Videos otimizados (x264 Main CRF 18, sem perda perceptivel); originais fora do template em `CLIENTES/_BACKUP_WEOOH_placar_Flamengo_Vasco_videos_originais`; audio preservado, desativado ate definicao do player.
- Base em loop; alertas usam a duracao real e retornam ao placar atualizado.
- `loaded()` uma vez na primeira apresentacao; `finished()` somente na saida/falha fatal.
- `WEOOH_PLAYER.stop()` permite encerramento controlado; ao fim do jogo mantem o placar.

## Simulacao
- Padrao `demo`: um novo evento a cada 14s, incluindo gols e os quatro cartoes.
- URL `?scenario=score` exibe 6x6; `?scenario=double-digit` testa 12x10.
- Cenarios: `pregame`, `halftime`, `finished`, `cancelled`, `empty`, `invalid`, `stale`, `network-error`.
- Partida/eventos sao ficticios e nao usam nomes de jogadores; primeira carga nao repete historico.
- Sem persistencia: reload ignora historico; alertas durante reinicio podem nao aparecer.
- Snapshot completo de eventos: IDs estaveis, cancelamento explicito e updatedAt crescente.
- Nao inferir vermelho por dois amarelos; o adaptador deve normalizar o evento confirmado.

## Regioes E Midias
- Regioes exatas dos SVGs atualizados (rects vetoriais); fonte local Poppins ExtraBold (familia `Placar`), peso 900, texto preto.
- Sem lista, paginacao ou nomes de jogadores; somente disparos de gols/cartoes por equipe.
- Vertical 1080x1920 (`portrait`, proporcao < 1): mesmas regioes de 1080p, regioes do SVG `img/modelos-placar-1080X1920.svg`; videos originais 101 base, 103 gol, 105 amarelo, 107 vermelho.
- 1080p: nomes nas capsulas, gols grandes nas laterais, periodo/intervalo e cronometro ao centro.
- Faixa: somente gols e cronometro central; sem nomes de equipes ou rotulo de periodo.
- Base 102/110; gol 104/111; amarelo 106/112; vermelho 108/113, por equipe.
- 21 MP4 H.264 Main/yuv420p; bases 24fps, alertas 30fps; alguns contem AAC.
- Gols 1080p duram 8.033s; demais aproximadamente 10s; bitrate ate 50.12Mbps.
- Player/codecs/hardware pendentes: Chromium puro pode nao decodificar H.264.
- `videos/`: 21 MP4 com nomes ASCII (`<full|portrait|strip>-<base|goal|yellow|red>-<time>.mp4`), cerca de 55MB no total; nomes originais retornaram HTTP 200 vazio no player.

## Integracao E Entrega
- Canal real ainda indisponivel; nenhum dataset ou fixture ID de producao presumido.
- Adaptador futuro: `WEOOH_DATA_SOURCE(callback)` retorna o contrato de `match-state.js`.
- Ativar `CONFIG.dataset.mode='channel'` e `MOCK_DATA.enabled=false`; sem fallback mock.
- Snapshot vazio inicial/falha fatal encerra; dado valido e conservado por ate 120s.
- Alertas novos de ate 90s; repetidos/cancelados nao disparam; fila cronologica.
- Cronometro mm:ss: avanca em 1H/2H e para em HT/FT; second opcional, sem reiniciar a cada poll sem segundos.
- `npm test` na raiz roda so `scripts/weooh-match-state.test.js` (10 testes, sem servidor).
- Suite de player: `node --test scripts/weooh-player.test.js`; exige ebcliente4 em `localhost:12099`, Chrome e Playwright.
- Validacao visual/runtime e geracao de `.eh5` dependem de homologacao.
- Pacote final deve excluir mocks ativos, fontes de build, testes e modelos nao usados.
- Para outras partidas, substituir tambem os videos: escudos/patrocinio estao incorporados.

## Verificado Em 2026-10-27
- `weooh-match-state.test.js`: 10 testes; suite de player: 11 testes, ambos os formatos, cronometro e 12 alertas reais.
- Chrome instalado + ebcliente4; hashes servidos/EBHTML conferidos, sem overflow ou erros JS nos cenarios executados.
- Matriz snapshot 2026-10-20 e hashes das fontes: `.validation/weooh-initial/formats.json`; midias/capturas na mesma pasta.