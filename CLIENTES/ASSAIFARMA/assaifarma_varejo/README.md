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
- **`localStorage` removido da rotação real** (`readDataXML`/`readData2XML` sempre usam o 1º item do dataset — ordem/seleção é responsabilidade do canal de dados, não do template). O Muffato usava `localStorage` para rotacionar projeto/produto entre reloads; isso violava `docs/00-governanca-e-arquitetura.md`/`docs/02-dados-ebhtml-rotacao.md` por não ter sido registrado como decisão de briefing. `localStorage` continua presente só em `runMock()` (exceção documentada: telemetria/experimento de dev).
- Fundo real do tenant em `img/fundo_assai_farma.png`, referenciado pelo mock.
- **Área segura calibrada pelo design real do fundo**: cabeçalho fixo de 245px e rodapé de 120px num fundo de 1080px de altura (22.685vh / 11.111vh). `#fullContent` é posicionado com `absolute inset-x-0 top-[22.685vh] bottom-[11.111vh]` — todo conteúdo dinâmico (título, preço, imagem, texto legal) fica estritamente dentro dessa faixa, nunca sobre o cabeçalho/rodapé do fundo. `#logo_container` foi movido para fora dessa faixa seguindo o cabeçalho (fica sempre invisível — a marca já está no fundo).
- Containers de altura fixa (`title_container`, `price_container`, `img_container_landscape`) usam `shrink-0` para não encolherem de forma inconsistente dentro do flexbox; os templates de preço (tipos 5,6,8,9,10,12,13) tiveram `h-full`/`justify-around` removidos (causavam gap grande entre título e preço).
- **`js/config.js`** novo: único objeto `CONFIG` (timing, dataset, layout/área segura, colors) aplicado via `aplicarConfigVisual()` no início de `playerView()`. Cores do preço/título viraram CSS custom properties (`--cor-preco`, `--cor-texto`) referenciadas via `text-[color:var(--cor-preco)]` no lugar de `text-red-600`/`text-black` fixos. Padrão documentado em `.github/copilot-instructions.md` (seção 5) e `docs/01-playbook-referencia.md` para uso em templates futuros.

## Pendências
- Substituir cores/fontes/logo pelo material oficial do ASSAI-FARMA.
- Confirmar filtros reais do canal `D_SPD` (ou equivalente) para o tenant.
- `MOCK_DATA.enabled = false` antes de gerar o `.eh5` de produção.

## Teste
`http://localhost:12099/FILES/1/index.html` — nunca `file:///`.
