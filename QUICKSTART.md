# Quickstart - Novo Padrao

## 1) Base do template

1. Copie _template-base para uma nova pasta de template.
2. Mantenha estrutura semantica no HTML.
3. Crie preview.js desde o inicio.

## 2) Regras tecnicas minimas

- ES5 apenas.
- Baseline Chromium 78.
- Tailwind utilitario (evitar classe custom sem necessidade real).
- Dataset-first para filtros/rotacao/ordenacao.

## 3) Fluxo de dados

1. Runtime: EBHTML loader + dataset.
2. Preview: dados de formulario via frame pai.
3. Mesma pipeline de render nos dois modos.

## 4) Ciclo de playlist

- Sucesso: loaded + finished.
- Erro: finished.
- Preview: suprimir finished para manter visualizacao.

## 5) Checklist minimo antes de homologar

- Paridade runtime/preview validada.
- Modo reduzido validado (hardware antigo).
- FallBacks de dados e video validos.
- Sem erro critico no console.

## 6) Referencias

- features-list.md
- docs/README.md
