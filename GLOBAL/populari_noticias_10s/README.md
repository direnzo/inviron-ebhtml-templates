# Populari Noticias 10s

Derivado de `GLOBAL/populari_intro_legacy`, preservado. Branch `feat/populari-noticias-10s`; EBHTML 2.0.7 canonico.
Alvo: EBHTMLBuilder 3.0.5 / Qt 4.8.5 / QtWebKit ~534; ES5, sem video ou GIF.
Dataset: `D_POPULARI`; prioriza `TEXTOCOMPLETO`, depois `TEXTO`; foto `FOTO`/`IMAGEM`.
Foto, moldura e fonte da referencia; icone de canto mantido. Encerramento com SVG nominal local inline; sem tela de abertura.
SVG oficial: https://populari.com.br/wp-content/themes/populari/assets/img/logo-dark.svg (205x41; largura de tela 76%).

## Briefing e configuracao
- Total apresentado: 10000ms desde `loaded()`, apos preparo dos assets.
- Noticia inicia em 0ms com fade-in unico; 8800ms inicia saida do texto.
- 9200-10000ms encerramento com logo; fade final de 9650 a 10000ms.
- Texto nao tem entrada separada; saida por translate preservada.
- Ajustes em `js/config.js`: timing, dataset, area segura, fontes e cores.
- Texto via textContent/innerText preserva reticencias da fonte; o layout nao acrescenta cortes ou ellipsis.
- Autofit limitado a nove medicoes, minimo 1.05em; excesso extremo sinaliza `data-fit=failed`.
- Dado ausente/invalido/timeout libera playlist sem noticia ficticia; foto falha usa fundo da marca.
- Guardas de dados/imagem/fonte/SVG; loaded antes de finished, exatamente uma vez.
- Sem mock de producao, preview ou localStorage; efeitos leves dispensam modo de hardware fraco.
- Excecao dimensional legacy: body em pixels calculados de min(largura,altura)*0.032; filhos em em/%.
- Fonte pre-carregada; aguarda FontFaceSet quando disponivel; watchdog usa fallback estavel.

## Matriz explicita
Exatamente: **864x432, 1152x576, 384x682, 768x960, 576x1026** (origem `explicit`).
Layouts por proporcao: horizontal 2:1, vertical 4:5 e vertical alto; nunca por largura isolada.
Snapshot: 2026-10-20; consolidado SHA256 `89949bae828c4875a33c40e47f4d6992a76b35b1c6876adf051e610889e3e331`.
Matriz e quatro hashes completos nos relatorios `.validation/`, fora do runtime.

## Comandos na raiz
- `node --test scripts/populari-noticias-10s.test.js`
- `npm test`
- `node scripts/validate-populari-noticias-10s.js .validation/populari-novo-ensaio --record=87150`
- `node scripts/validate-populari-noticias-10s.js .validation/populari-reloads --reload-only --record=87150`
- `node scripts/validate-populari-noticias-10s.js .validation/populari-reticencias-fonte --ellipsis-only`
Somente `http://localhost:12099/FILES/1/index.html` via ebcliente4; exige slot apontado a esta pasta.
Validador reutiliza checks compartilhados; `--record` fixa ID integro vigente so no teste, nunca em producao.
## Evidencias e limites
2026-11-03: matriz visual anterior do SVG 15/15 (registro 87150, 403 caracteres e imagem quebrada); layout mantido.
Revisao anterior (2026-11-03): reticencias da fonte aceitas; 5/5 formatos passaram com dados reais aleatorios, 10001-10011ms.
Capturas do logo revisadas nos cinco formatos; evidencias em `.validation/populari-10s-20261103-logo-nominal/`.
Reloads: tres recargas rapidas por formato; evidencia `.validation/populari-10s-20261103-origem-restaurada/`.
Gate raiz `npm test`: contrato PowerShell e 161 testes Node passaram (34 especificos Populari).
Bloqueio anterior causava paginas vazias em refresh; usuario revogou a regra: preservar o texto recebido, sem filtrar.
Regressao fonte: medir antes da fonte real altera quebras; prevenir com preload/espera antes de loaded.
Regressao glifos: largura/altura nao bastam; conferir quatro bordas Range com margem, sem ellipsis de CSS.
Perfil do runner exige minFontPx positivo inclusive em regioes de imagem; schema coberto por teste.
Pendente homologacao no QtWebKit/EBHTMLBuilder real; Chromium nao certifica legado.
Textos extremos podem perder legibilidade em 10s mesmo completos; revisar conteudo editorial.
Pacote: `_EH5/populari_noticias_10s.eh5`, 95085 bytes, 8 arquivos; ZIP reaberto, hashes conferidos, sem tooling.
2026-11-11: removida abertura de 800ms; noticia/fade inicia em 0ms, saida e encerramento preservados. Testes: 34/34 e raiz 161/161; validacao visual atual `not_run` (ebcliente4 indisponivel). PowerShell 5.1: carregar assemblies System.IO.Compression e FileSystem; validar cabecalho unido (-join), nao array.