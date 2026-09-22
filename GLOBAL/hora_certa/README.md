# Hora Certa — Relógio Digital com Ondas Perlin

Template de relógio digital para EdgeContents CMS com flip-card animation e background animado com ondas Perlin Noise.

## Configuração

Edite `CLOCK_CONFIG` em `js/master.js` e `WAVE_CONFIG` em `js/wave-effect.js` para ajustar cores, fontes, velocidades.

## Desenvolvimento

```bash
npm run dev    # TailwindCSS watch mode
```

Ative `MOCK_DATA.enabled = true` em `js/mock-data.js` para testar sem servidor.

## Produção

1. Comente `<script src="js/mock-data.js">` no HTML
2. Use `ebhtmlbuilder4` para compilar com EdgeContents CMS

## Regras

- **ES5 obrigatório**: sem `const`/`let`/arrow/`template strings`
- **Fontes**: body em `vmin`, filhos em `em` — nunca `vw`/`vh`
- **Sempre**: `loader.loaded()` + `loader.finished()`

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | Layout principal |
| `css/input.css` | Tailwind + animações flip |
| `js/master.js` | Relógio + EBHTML loader |
| `js/wave-effect.js` | Motor de ondas Perlin |
| `js/perlin.js` | Algorítmo de ruído Perlin |
| `js/ebhtml.js` | Biblioteca EBHTML |
| `js/mock-data.js` | Dados de teste |
