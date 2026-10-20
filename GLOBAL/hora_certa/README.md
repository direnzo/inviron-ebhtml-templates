# Hora Certa — Relógio Digital com Ondas Perlin

Template de relógio digital para EdgeContents CMS com flip-card animation e background animado com ondas Perlin Noise.

## Dados

- Canal meteorológico: `D_CLIMA_HGBRASIL`, habilitado em `CLOCK_CONFIG.climateEnabled`.
- Registro atual em `C1_D1_DATAARRAY`: temperatura (`nr_value_wea`), ícone (`nr_icon_wea`), cidade (`city.ds_name_cit`), umidade min/max e vento (`nr_windavgvelocity_wea`).
- Clima só é exibido com temperatura válida e atualização (`dt_upd_wea`) de até 24 horas; dados ausentes, inválidos, antigos ou com falha no carregamento ocultam a linha sem impedir o relógio ou antecipar o fim da playlist.
- `js/provider-hgbrasil.js` converte códigos HG Brasil para ícones Meteocon; a fonte exibida é HG Brasil.

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
