# uol_responsivo_tw

Template de notícias UOL para Digital Signage. Suporta todos os formatos de tela via breakpoints por aspect ratio.

## Executar localmente

```bash
# 1. Servidor EdgeContents
ebcliente4.exe  # localhost:12099

# 2. Watch Tailwind
npm run dev

# 3. Teste mock (descomentar linha no index.html)
# <script src="js/mock-data.js"></script>

# 4. Navegador
# http://localhost:12099/FILES/1/index.html
```

## Dataset: D_UOL

| Campo       | Tipo   | Descrição               |
|-------------|--------|-------------------------|
| TITULO      | string | Título da notícia       |
| TEXTO       | string | Subtítulo / descrição   |
| FOTO        | url    | URL da imagem principal |
| IMAGECREDIT | string | Crédito da foto         |
| EDITORIA    | string | Categoria (ver cores)   |

## Cores por editoria

`ESPORTE/FUTEBOL` verde · `POLÍTICA/INTERNACIONAL` vermelho · `ECONOMIA` azul · `TECNOLOGIA` amarelo · `ENTRETENIMENTO/TELEVISÃO` laranja · padrão amarelo UOL

## Formatos suportados

portrait · landscape · square · ultrawide · superbanner · footer · empena

## Checklist produção

- [ ] `MOCK_DATA.enabled = false` (ou remover script mock do HTML)
- [ ] `npm run build` executado
- [ ] Validar nos 7 formatos de aspect ratio
- [ ] Sem `const` / `let` / arrow functions no JS

## Histórico de revisão

| Data       | Revisão                                      |
|------------|----------------------------------------------|
| 2026-03-27 | Auditoria ES5 + bugs funcionais identificados |
