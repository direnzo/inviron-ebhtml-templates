# G&G Comunicado

Template de comunicados institucionais com sistema de slides automático.
Canal: `D_COMUNICADO` | Android 7+ (WebKit ES5)

## Campos do CMS

| Campo | Descrição |
| :--- | :--- |
| `CATEGORY` | Define o fundo estático (ver tabela abaixo) |
| `TITULO` | Título do comunicado — sempre exibido |
| `TEXTO` | Bloco de texto 1 |
| `TEXTO2` | Bloco de texto 2 |
| `TEXTO3` | Bloco de texto 3 |
| `FOTO` | Imagem ou vídeo 1 (JPG/PNG/MP4) |
| `FOTO2` | Imagem ou vídeo 2 |
| `FOTO3` | Imagem ou vídeo 3 |

## Fundos por Categoria (`img/`)

| `CATEGORY` | Arquivo |
| :--- | :--- |
| `comunicados` | `comunicados.png` |
| `noticias_internas` | `noticias_internas.png` |
| `meetup` | `meetup.png` |
| `historias_que_inspiram` | `historias_que_inspiram.png` |
| `sou_embaixador_da_cultura` | `sou_embaixador_da_cultura.png` |
| `cliente_no_centro` | `cliente_no_centro.png` |
| `datas_comemorativas` | `datas_comemorativas.png` |
| `beneficios_selbetti` | `beneficios_selbetti.png` |
| `selbgames` | `selbgames.png` |
| _(vazio ou desconhecido)_ | `generico.png` |

## Lógica de Slides

O template monta slides automaticamente com base no conteúdo recebido:

| Textos | Mídias | Resultado |
| :--- | :--- | :--- |
| 0 | 0 | 1 slide full-text (só título) |
| N | 0 | N slides full-text |
| 0 | N | N slides full-image |
| N | M | zip: pares → split; sobras → full-text ou full-image |

**Layouts:**
- **full-text** — caixa de texto ocupa a tela toda
- **full-image** — mídia ocupa a tela toda (título em overlay)
- **split** — texto à esquerda, mídia à direita (portrait: empilhado)

**Tempo:** `max(7500ms, totalDuration / nSlides)` por slide.
Para vídeos o avanço ocorre no evento `ended` (safety timeout: 5 min).

## Configuração (`js/master.js`)

```javascript
var CONFIG = {
    duration:         15000,  // tempo total do template (ms)
    minTempoPorSlide:  7500,  // mínimo por slide (ms)
    transicaoDuracao:   800   // duração da transição CSS (ms)
};
```

## Desenvolvimento

```bash
npm run dev    # watch TailwindCSS
npm run build  # CSS minificado para produção
```

Mock: descomentar `<script src="js/mock-data.js"></script>` no `index.html`.
Sorteio aleatório entre os cenários do mock — editar `_forceIndex` para fixar um.

Preview extranet: `js/preview.js` detecta `window.parent.template_check` e substitui o EBHTML.
