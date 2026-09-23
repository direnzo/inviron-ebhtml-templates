# ASSAI-FARMA — Varejo (Projeto Especial)

Derivado de `CLIENTES/MUFFATO/muffato_varejo`. Mesma estrutura de dados e das 14 condições de preço; identidade visual (cores/logo) ainda é placeholder do Muffato até o tenant enviar assets oficiais.

## Briefing
- **Tenant/template**: ASSAI-FARMA / `assaifarma_varejo`.
- **Origem**: derivado do Muffato — mesmo dataset `D_SPD`, mesmos campos (`SPECIALPROJECT`, `FILE_BACKGROUND`, `FILE_IMAGE1`, `TITLE`, `TEXT1..TEXT7`, `IMAGE_LOGO`).
- **Condições de preço**: as 14 do Muffato, mesma lógica (`renderCondition`/`applyPrice`), templates `#cond-1..#cond-14` em [index.html](index.html).
- **Identidade visual**: placeholder do Muffato (cores, fontes, layout). Trocar quando o tenant enviar logo/paleta oficiais.
- **Formato prioritário**: 16:9 landscape. Breakpoints por `orientation`/aspect-ratio mantidos (portrait, empena, superbanner, ultrawide) para eventual uso futuro em outros formatos.
- **EBHTML**: 2.0.7 (copiado de `_template-base/js/ebhtml.js` — o Muffato ainda usa 2.0.3, não migrado nesta derivação).
- **Compatibilidade**: Chromium 78+ / Android 7+ WebKit legado.

## Diferenças em relação ao muffato_varejo
- `js/ebhtml.js` atualizado para 2.0.7 (canônico).
- `loader.load()` em todos os pontos (`playerView`, `readDataXML`, `readData2XML`) agora recebe o 2º argumento (callback de erro) e o parsing do callback de sucesso está envolto em `try/catch` que garante `finished()`.
- Chaves de `localStorage` renomeadas para o tenant (`*_assaifarma`) para não colidir com o Muffato.

## Pendências
- Substituir cores/fontes/logo pelo material oficial do ASSAI-FARMA.
- Confirmar filtros reais do canal `D_SPD` (ou equivalente) para o tenant.
- `MOCK_DATA.enabled = false` antes de gerar o `.eh5` de produção.

## Teste
`http://localhost:12099/FILES/1/index.html` — nunca `file:///`.
