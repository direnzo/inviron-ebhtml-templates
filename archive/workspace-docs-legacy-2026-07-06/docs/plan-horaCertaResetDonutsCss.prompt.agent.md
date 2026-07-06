## Plan: Hora Certa Reset com Donuts CSS

Recomeçar do zero o template de relógio em hora_certa mantendo apenas o fundo Perlin e reconstruindo o relógio como 3 anéis donut em CSS (sem SVG), com layout responsivo estável: data à esquerda no landscape e abaixo no portrait, tipografia grossa e composição centralizada por viewport.

**Steps**
1. Fase 1 — Limpeza e baseline estrutural
1.1 Definir o baseline único do template em hora_certa: manter scripts de base EBHTML, perlin.js e wave-effect.js; remover do HTML toda estrutura legado de SVG, paths, textos duplicados e blocos repetidos de hora.
1.2 Consolidar um único container principal com duas áreas: bloco de data e bloco de relógio; garantir que só exista um elemento de hora no DOM para evitar artefatos como 00:00 extra.
1.3 Confirmar ponto de entrada único no JS (um window.onload com init do relógio e loader EBHTML).
2. Fase 2 — Arquitetura visual dos 3 donuts CSS
2.1 Implementar relógio com 3 anéis sobrepostos usando apenas DIV/CSS, com técnica única de progresso por anel (conic-gradient com máscara radial) e fallback visual aceitável para WebKit legado.
2.2 Definir escala e hierarquia dos anéis: segundos externo, minutos intermediário, horas interno, cada um com trilha de fundo + progresso + marcadores/dots opcionais discretos.
2.3 Definir tokens visuais no CSS (espessura, raio, cor, opacidade, glow) para controlar o look sem trocar técnica no meio do ciclo.
3. Fase 3 — Lógica temporal e animação suave (ES5)
3.1 Reescrever master.js em ES5 estrito para atualizar hora e data sem dependências de SVG.
3.2 Calcular progresso contínuo: segundos s/60, minutos (m+s/60)/60, horas (h%12+m/60)/12, evitando saltos visuais e inversões na virada de minuto.
3.3 Atualizar variáveis CSS custom properties (ou estilos inline equivalentes) de cada anel em um tick sincronizado por setTimeout alinhado ao próximo segundo.
4. Fase 4 — Layout responsivo e tipografia
4.1 Landscape: composição horizontal centralizada na tela, data à esquerda e relógio à direita com alinhamento vertical comum.
4.2 Portrait: composição vertical centralizada, relógio acima e data abaixo com espaçamento proporcional.
4.3 Aplicar fonte grossa na hora central e peso médio/alto na data, mantendo legibilidade em diferentes aspect ratios.
4.4 Validar regra do projeto: tamanho base no body por vmin e filhos em em/%.
5. Fase 5 — Integração EBHTML e estabilidade
5.1 Garantir sequência robusta de loader: iniciar relógio no callback de load, chamar loader.loaded() sempre no sucesso e loader.finished() no tempo de exibição configurado.
5.2 Preservar fundo Perlin atual sem regressão: init após load, camada de overlay e comportamento degradado em hardware fraco.
5.3 Evitar duplicidades de handlers e timers ao reiniciar a view.
6. Fase 6 — Verificação funcional e visual
6.1 verificar o dev run Tailwind e validar que não há erro de sintaxe CSS.
6.2 Validar exclusivamente na URL oficial: http://localhost:12099/FILES/1/index.html.
6.3 Checklist visual: três anéis sempre visíveis, progresso no sentido correto, sem espelhamento na troca de minuto, sem elemento fantasma 00:00.
6.4 Checklist responsivo: landscape com data à esquerda; portrait com data abaixo; tudo centralizado no viewport.

**Relevant files**
- c:/Users/direnzo/Documents/CLIENTES/_TEMPLATES/hora_certa/index.html — reset da estrutura visual para um único layout DOM sem SVG e sem nós duplicados.
- c:/Users/direnzo/Documents/CLIENTES/_TEMPLATES/hora_certa/css/input.css — implementação dos 3 donuts CSS, tipografia grossa, layout responsivo e tokens de estilo.
- c:/Users/direnzo/Documents/CLIENTES/_TEMPLATES/hora_certa/js/master.js — lógica ES5 de relógio/data, atualização dos anéis e integração EBHTML sem duplicidade de init.
- c:/Users/direnzo/Documents/CLIENTES/_TEMPLATES/hora_certa/js/wave-effect.js — reutilização do fundo Perlin existente, apenas ajuste se necessário para não conflitar com nova composição.
- c:/Users/direnzo/Documents/CLIENTES/_TEMPLATES/hora_certa/css/master.css — saída compilada do Tailwind após estabilização do input.css.

**Verification**
1. Rodar npm run dev dentro de hora_certa e confirmar compilação contínua sem erros.
2. Abrir http://localhost:12099/FILES/1/index.html e confirmar render inicial sem elementos duplicados.
3. Verificar por pelo menos 2 minutos a continuidade dos anéis na virada de segundos/minutos para garantir ausência de inversão.
4. Testar dois cenários de proporção: landscape e portrait, confirmando posição da data e centralização geral.
5. Confirmar regras EBHTML: loader.loaded() e loader.finished() disparados corretamente.

**Decisions**
- Incluído: reset completo da arquitetura visual para técnica única de donuts CSS.
- Incluído: manter fundo Perlin local já existente como camada de atmosfera.
- Excluído: qualquer retorno a SVG arcs, flip clock ou múltiplas técnicas concorrentes no mesmo template.
- Assunção adotada: data à esquerda em landscape e abaixo em portrait, conforme sua instrução.

**Further Considerations**
1. Recomendação de estabilidade: após o reset, congelar a técnica de anel (conic+mask) e iterar apenas em tokens visuais (cores, espessura, glow), sem trocar arquitetura novamente.
2. Se WebKit do dispositivo apresentar limitação com máscara, aplicar fallback de trilha estática + preenchimento simplificado antes de considerar outra abordagem.