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

## Checklist

- desempenho estavel em modo reduzido
- sem perda de conteudo essencial
- compatibilidade no baseline 78
