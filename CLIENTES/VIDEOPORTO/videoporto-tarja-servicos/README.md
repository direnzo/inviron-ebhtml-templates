# VIDEOPORTO - Tarja de Serviços

**Dimensions:** 312×100px fixo  
**Framework:** TailwindCSS 3.x  
**Rendering:** 6 slides de 5 segundos cada  
**Datasets:** D_CLIMA_CLIMATEMPO, D_CAMBIO, D_COMUNICADO  
**Font:** Carbona-MonoBoldSlanted  

## Slides

| # | Tipo | Descrição | Fonte |
|----|------|-----------|-------|
| 1 | **Hora** | Quarta-feira, HH:MM, DD de mês | System |
| 2 | **Clima** | Temperatura, Mín/Máx, Umidade | D_CLIMA_CLIMATEMPO |
| 3 | **Ondas** | Altura em metros | D_CLIMA_CLIMATEMPO |
| 4 | **UV** | Índice de raios solares | D_CLIMA_CLIMATEMPO |
| 5 | **Câmbio** | Cotação USD | D_CAMBIO |
| 6 | **Comunicado** | Mensagem de aviso | D_COMUNICADO |

## Desenvolvimento

```bash
npm run dev      # Watch TailwindCSS
npm run build    # Build minificado
```

## Mock Data

Ativar em `js/mock-data.js`: `MOCK_DATA.enabled = true`  
Desativar em produção: `MOCK_DATA.enabled = false`

## Assets Necessários

- `img/background.jpg` — Fundo fixo (312×100)
- `img/icon-*.svg` — Ícones por tipo de slide
- `css/fonts/Carbona-MonoBoldSlanted.ttf` — Fonte

## Estrutura

```
videoporto-tarja-servicos/
├── index.html          # 6 slides definitivos
├── css/
│   ├── input.css      # Tailwind directives + custom CSS
│   ├── master.css     # Output compilado
│   └── fonts/
├── js/
│   ├── ebhtml.js      # Biblioteca EBHTML (não editar)
│   ├── master.js      # Lógica slideshow
│   └── mock-data.js   # Dados de teste
└── img/
```

## Padrão Slideshow

- 6 slides, 5s cada (~30s total, menos se pular vazios)
- Transição: fade 300ms
- Missing data: slide pulado automaticamente
- EBHTML: `loader.loaded()` após render, `loader.finished()` ao terminar
