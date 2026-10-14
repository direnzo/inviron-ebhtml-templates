# CCXP26 - Fotos e Autógrafos (painel LED 1280x512)

Plano: `../docs/PLANO-FOTOS-AUTOGRAFOS.md`. Base de código: `../destaque_dia` e `../programacao_palco`.
Dataset de 2025: `D_CCXP_FEA` (a confirmar em 2026).

## Estado (fase 0: esqueleto)

- Pasta montada a partir do `destaque_dia`; tela fixa 1280x512 (sem rodapé, sem relógio),
  preview escala por 1280x512; fundo `img/fundo_FA.png` e vídeos `fa_intro|fa_outro.mp4`.
- `js/fea.js` (lógica) e as páginas de artista entram nas fases 1 e 2; o mock completo na fase 3.
- Vídeos (`videos/*.mp4`) ficam fora do Git: copiar de `Materiais/03_Template-F&A/Animados`
  (`F&A_intro.mp4` -> `fa_intro.mp4`, `F&A_outro.mp4` -> `fa_outro.mp4`).

## CSS

Tailwind não está instalado nesta máquina: as regras novas vão em `css/input.css` e são
replicadas à mão em `css/master.css` (`npm run build` as regeneraria).
