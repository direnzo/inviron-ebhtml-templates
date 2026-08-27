# 05 - Performance, Animacao e Video

## Hardware legado

- detectar perfil fraco cedo
- aplicar modo reduced
- degradacao progressiva: full -> lite -> minimo executavel

## Animacao

Perfis recomendados:
- full
- lite
- off

Regras:
- animar apenas quando agrega leitura
- garantir caminho funcional sem animacao
- desativar efeitos pesados em modo reduzido

## Video

- validar suporte antes de tocar
- usar muted + playsinline + autoplay quando fundo
- sempre ter fallback de imagem
- tratar onended/onerror/onabort/onstalled
- nunca travar ciclo do template por falha de video

### Encoding e container (ver `.github/copilot-instructions.md` regra 10)

- servir como `.webm` / VP9: builds Chromium puros nao tem codec H.264/AAC; webm tambem e ~5x mais leve
- `.mp4` so como fallback opcional e sempre: H.264 Constrained Baseline, largura multiplo de 16, faixa AAC silenciosa (Stagefright nao toca mp4 sem audio), yuv420p, 0 B-frames, `+faststart`
- `play()` com retry mudo quando a Promise rejeitar (autoplay policy); watchdog + onended/timeupdate garantindo `finished()`
- guardar os originais fora do runtime (`img/_source/`)

## Checklist

- desempenho estavel em modo reduzido
- sem perda de conteudo essencial
- compatibilidade no baseline 78
