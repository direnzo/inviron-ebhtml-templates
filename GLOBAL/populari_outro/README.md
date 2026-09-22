# populari

Template de noticias **Populari** para EdgeContents Digital Signage.
Foto em tela cheia + degrade preto atras do texto + moldura sobre a foto + logo no canto superior direito.

Formatos validados: **1366x768** (landscape) e **1080x1920** (portrait).
CSS escrito a mao (sem build Tailwind), JS ES5 / baseline Chromium 78.

## Dataset: D_POPULARI

| Campo | Tipo   | Descricao                 |
|-------|--------|---------------------------|
| TEXTO | string | Texto da noticia          |
| FOTO  | url    | URL da imagem (fundo)     |

O `master.js` tambem aceita os campos em minusculo (`texto` / `foto`) e `IMAGEM` como alias de `FOTO`.

## Estrutura

```
populari/
├── index.html
├── css/
│   ├── master.css
│   └── fonts/
│       └── PlusJakartaSans-VariableFont_wght.ttf   <-- ADICIONAR (nao versionado)
├── img/
│   ├── logo_populari.png                        <-- logo (canto superior direito)
│   ├── OUTRO_VINHETA_POPULARI_1366X768.webm     <-- vinheta landscape (VP9)
│   ├── OUTRO_VINHETA_POPULARI_1080x1920.webm    <-- vinheta portrait  (VP9)
│   ├── _source/                                 <-- mp4 originais (nao usados em runtime)
│   └── mock-foto.jpg                            <-- adicionar so para teste local
└── js/
    ├── ebhtml.js
    ├── master.js
    └── mock-data.js    <-- so desenvolvimento (comentado no HTML)
```

## Pendencias antes de homologar

- [ ] Colocar `PlusJakartaSans-VariableFont_wght.ttf` em `css/fonts/`
- [ ] Confirmar `img/logo_populari.png` (logo oficial, fundo transparente)
- [ ] `<script src="js/mock-data.js">` comentado no `index.html`
- [ ] Validar em 1366x768 e 1080x1920 em `http://localhost:12099/FILES/1/index.html`
- [ ] Sem `const` / `let` / arrow / template string no JS

## Ajustes rapidos (css/master.css)

Variaveis em `:root` (e sobrescritas em `@media` portrait):

| Variavel             | Efeito                                  |
|----------------------|-----------------------------------------|
| `--moldura-cor-topo` | cor da metade de cima da moldura        |
| `--moldura-cor-base` | cor da metade de baixo da moldura       |
| `--moldura-esp`      | espessura da moldura                    |
| `--safe`             | respiro interno (texto / logo)          |
| `--logo-tam`         | largura do logo                         |

A moldura usa `border-image` com gradient em 2 faixas solidas (50% / 50%).

Degrade do texto: seletor `#gradiente` (mesma abordagem do `uol_responsivo_tw`).

## Ciclo de playlist

1. Imagem carrega -> `loader.loaded()`.
2. Passados `DURATION_MS`, entra a **vinheta final** (video) em tela cheia
   (`#vinheta`), escolhida pelo formato:
   - landscape (ar >= 1) -> `OUTRO_VINHETA_POPULARI_1366X768.webm`
   - portrait  (ar < 1)  -> `OUTRO_VINHETA_POPULARI_1080x1920.webm`
   O video e pre-carregado no `window.onload` para nao haver corte.
3. `loader.finished()` so e chamado quando o video termina (`ended`, ou
   `timeupdate` chegando ao fim em engines que nao disparam `ended`).

### Por que WEBM/VP9 (e nao MP4)

Builds "Chromium" puros (ex.: `78.0.3899 versao do desenvolvedor`) NAO trazem os
codecs proprietarios H.264/AAC — so tocam VP8/VP9 em WebM. O MP4 nao rodava no
Chromium 78 e rodava so no Chrome atualizado. **VP9 roda em todo build Chromium**
e o arquivo fica ~5x menor, entao a vinheta e servida so em `.webm`.

`reproduzirVinheta()`:

1. `play()` com audio.
2. Se a politica de autoplay bloquear -> retry **mudo** (`silenciarVinheta`,
   flag `VIDEO_MUTED_FALLBACK`).
3. `onerror` / watchdog `VIDEO_TIMEOUT_MS` -> `loader.finished()` garantido,
   a playlist nunca trava.

`index.html` traz `playsinline webkit-playsinline x5-playsinline preload="auto"`
no `<video>`; o resto e aplicado por JS.

### Encoding das vinhetas

| Item      | .webm                          |
|-----------|--------------------------------|
| codec     | VP9, sem audio                 |
| resolucao | 1280x720 (landscape) / 1088x1920 (portrait), mod-16 |
| pix_fmt   | yuv420p                        |

Originais em `img/_source/`. Comando (ffmpeg):

```
ffmpeg -i _source/SRC.mp4 -an -c:v libvpx-vp9 -b:v 0 -crf 30 -pix_fmt yuv420p \
  -vf "scale=1280:720:flags=lanczos,setsar=1" -r 24 -g 48 -row-mt 1 \
  -deadline good -cpu-used 2 OUT.webm
```

> Emergencia: se algum device de producao so tiver decoder H.264 (sem VP9),
> gerar tambem um `.mp4` (H.264 Constrained Baseline + **faixa AAC silenciosa** —
> Stagefright nao toca mp4 sem audio, largura **mod-16**, `+faststart`) e voltar
> `master.js` para escolher `.webm`/`.mp4` via `canPlayType`.
> Trecho de referencia (nao usar agora):
>
> ```
> ffmpeg -i _source/SRC.mp4 -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 \
>   -map 0:v:0 -map 1:a:0 -shortest \
>   -c:v libx264 -profile:v baseline -pix_fmt yuv420p \
>   -vf "scale=1280:720:flags=lanczos,setsar=1" -r 24 -bf 0 -g 48 -refs 1 \
>   -b:v 2500k -maxrate 2500k -bufsize 5000k \
>   -c:a aac -b:a 96k -ar 48000 -fps_mode cfr -movflags +faststart OUT.mp4
> ```

- Sem dados / imagem nao carrega: `loaded()` + `finished()` sem vinheta.
- Modo mock: `loaded/finished` sao no-op, mas a vinheta ainda toca (teste visual).

> Para forcar a vinheta **sempre muda** (ex.: painel sem audio), deixar
> `VIDEO_MUTED_FALLBACK = true` e adicionar `muted` direto no `<video>` do HTML.
