# populari_intro_legacy

Versao **retrocompativel** do `populari_intro`, para rodar no player antigo
do EdgeContents.

> O `populari_intro` "normal" continua valido para engines modernos
> (Chromium 78+). Esta pasta e um fork so para o alvo legado abaixo.

## Alvo

| Componente | Versao detectada em `C:\Program Files (x86)\EBHTMLBuilder3` |
|------------|-------------------------------------------------------------|
| App        | EBHTMLBuilder **3.0.5** (mai/2014)                          |
| Framework  | Qt **4.8.5** (Digia)                                        |
| Engine     | QtWebKit 2.2 -> **WebKit ~534.34** (≈ Safari 5.1 / Chrome 13, 2011) |
| Video      | Phonon -> **DirectShow** (`phonon_ds94.dll`)                |

Ou seja: um engine de **2011**, nao "Chromium antigo". Tudo que e de 2015+
tem que sair.

## O que muda em relacao ao `populari_intro`

### Abertura em GIF (sem `<video>`)
Testamos WebM, H.264 `.mp4` e `.wmv` no EBHTMLBuilder 3.0.5: **nenhum tocou**
(tela preta, mesmo removendo o elemento do DOM). Este QtWebKit 4.8 nao tem
`<video>` HTML5 utilizavel. Mas **anima GIF nativamente** (`qgif4.dll`).

Abertura = **GIF animado da vinheta** em tela cheia (`#intro > img`), exibido
por `INTRO_MS` (5s), depois entra a noticia:

- `img/INTRO_1366X768.gif` (landscape, 1366x768, ~814 KB)
- `img/INTRO_1080x1920.gif` (portrait, 1080x1920, ~897 KB)
- **30 fps** (frame-rate nativo do source atual: `ffprobe` confirma
  `r_frame_rate=30/1`, 150 frames em 5s), 128 cores, `-loop -1` (toca 1x e
  para no ultimo frame)
- pula os **7 primeiros frames** do source (indices 0-6), que sao uma tela
  preta identica pixel-a-pixel (confirmado por `cmp`) antes da animacao
  comecar — o GIF ja abre com o movimento, sem hold preto
- `<img id="intro-img">` (nao `background-image` — mais confiavel p/ animar no engine)
- `onerror` -> cai para o `.jpg` estatico (`INTRO_FRAME_*.jpg`, ultimo frame)

> Historico: fonte anterior era 24fps (nao 30) e o GIF tinha sido feito a
> 12fps por engano — ficava visivelmente mais "cortado". Fonte atual
> (`_source/OUTRO_VINHETA_POPULARI_1366X768_1.mp4` e `..._1080x1920.mp4`) e
> nativamente 30fps, 150 frames / 5s; o GIF usa o fps nativo (30 e o teto —
> o source nao tem mais frames que isso pra ganhar).

Regerar os GIFs (ffmpeg, a partir do source atual, 30fps, pulando os 7
primeiros frames pretos):
```
ffmpeg -i _source/OUTRO_VINHETA_POPULARI_1366X768_1.mp4 \
  -vf "select='gte(n\,7)',setpts=PTS-STARTPTS,fps=30,scale=1366:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4" \
  -loop -1 INTRO_1366X768.gif
```
Portrait: trocar `OUTRO_VINHETA_POPULARI_1366X768_1.mp4` por
`OUTRO_VINHETA_POPULARI_1080x1920.mp4` e `scale=1366` por `scale=1080`.

Regerar o `.jpg` de fallback (ultimo frame):
```
ffmpeg -sseof -0.1 -i _source/OUTRO_VINHETA_POPULARI_1366X768_1.mp4 \
  -update 1 -q:v 2 INTRO_FRAME_1366X768.jpg
```

> `<video>` esta descartado neste alvo. A pasta `populari_intro_legacy_video`
> (tentativa com `.mp4`/`.wmv` + `removeChild`) so serve de registro do teste.

### Sem fade em nenhum ponto (corte seco)
Removidas as 3 `-webkit-transition: opacity ...` do CSS: `.populari-body`
(fade no carregamento da pagina), as camadas da noticia (fade ao entrar
`.news-in`) e `#intro` (fade ao mostrar/esconder o GIF). Toda troca de estado
agora e instantanea — GIF termina, no mesmo frame a noticia aparece, sem
transicao e sem quadro preto no meio.

### CSS (`css/master.css`) — features removidas
| Feature moderna | Substituto legacy |
|-----------------|-------------------|
| `var()` / Custom Properties | valores fixos no CSS |
| `calc()` | tudo pre-calculado |
| `vw` / `vh` / `vmin` | **px** e **%** (formatos sao fixos) |
| `object-fit: cover` | `#foto` recebe `background-image` (JS) + `background-size: cover` |
| `border-image: linear-gradient()` | 2 divs: `#moldura` (laranja) + `#moldura-base` (branco na metade de baixo) |
| `linear-gradient()` sem prefixo | `-webkit-gradient(linear, ...)` |
| `transition` / `transform` / `animation` sem prefixo | so `-webkit-` |
| portrait via `@media (max-aspect-ratio: 3/4)` | `@media (orientation: portrait), (max-width: 1200px)` |
| auto-ajuste de fonte no JS (`ajustarTexto`) | **removido** — `#texto` com `font-size` fixo em px |

Formatos suportados: **1366x768 / 16:9** (base) e **1080x1920 / 9:16** (bloco
`@media` portrait). Sem bloco ultrawide.

Fontes travadas: `#texto` = **34px** landscape / **52px** portrait. Texto longo
demais e cortado por `overflow:hidden` no `#texto-wrap` (nao rearranja o layout).

Ajuste rapido (px, no `#texto` e no bloco portrait): tamanho da fonte, `border`
da moldura, `top/right` do `#logo`, `left/right/bottom` do `#texto-wrap`.

### JS (`js/master.js`)
- ES5 puro. Sem `Promise`, sem `classList` (`body.className += ' ...'`).
- Sem `ajustarTexto` / `window.onresize` — fontes fixas no CSS.
- `#foto` pintada por `fotoEl.style.backgroundImage` no `onload` do `<img>` oculto.
- Abertura: `introImg.src` = GIF do formato (`onerror` -> `.jpg`); `#intro` fica
  `is-playing` por `INTRO_MS` (5s) e some (`display:none`); entao entra a noticia.
- Sem `<video>`.
- `revelarNoticia()` e `mostrarAbertura()` chamam `loader.log(...)` — log
  **nativo do EBHTML** (`interface.eblog` -> host), fallback `console.log` no mock.

## Dataset: D_POPULARI

| Campo | Tipo   | Descricao            |
|-------|--------|----------------------|
| TEXTO | string | Texto da noticia     |
| FOTO  | url    | URL da imagem (fundo) |

Aceita minusculo (`texto`/`foto`) e `IMAGEM` como alias de `FOTO`.

## Ciclo de playlist

1. Foto carrega (ou watchdog 6s) -> `#foto` pintada, body `is-ready`,
   `loader.loaded()`. Noticia ainda oculta.
2. Entra o **GIF de abertura** em tela cheia (`#intro > img`), escolhido pelo
   formato (portrait se `largura/altura < 1`).
3. Passados `INTRO_MS` (5s) -> body recebe `.news-in`: a abertura some
   (`display:none`) e a noticia entra (foto + zoom + degrade + texto).
4. Passados `DURATION_MS` (10s) com a noticia no ar -> `loader.finished()`.

Sem dados / foto nao carrega: `loaded()` + `finished()` direto.

## Pendencias antes de homologar

- [ ] `PlusJakartaSans-VariableFont_wght.ttf` em `css/fonts/` (QtWebKit usa a
      instancia default da fonte variavel)
- [ ] `img/logo_populari.png` oficial (fundo transparente)
- [ ] `<script src="js/mock-data.js">` comentado no `index.html`
- [ ] Testar no **EBHTMLBuilder 3.0.5** real em 1366x768 e 1080x1920
- [ ] Confirmar que o **GIF anima** (nao so o 1o frame) 5s e a noticia entra depois
- [ ] Sem `const`/`let`/arrow/template string/`calc()`/`vw`/`vh`/`vmin` (grep)
