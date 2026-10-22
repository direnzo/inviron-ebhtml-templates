# Dmidia - Rodape

- Cliente: DMIDIA. Branch: `feat/dmidia-rodape`. Novo template com EBHTML 2.0.7 canonico.
- Escopo explicito: somente `1080x40` (27:1); snapshot do catalogo: 2026-10-20, sem expansao.
- Fundo preto, logo branco a esquerda; temperatura atual e hora local `HH:mm` a direita.
- Logo fornecido pelo cliente em JPEG; PNG derivado com recorte das margens pretas, sem redesenho.
- Canal: `D_CLIMA_HGBRASIL`, `amount=1`, primeira cidade (`C1_D1_DATAARRAY`), igual ao hora_certa.
- Campo de temperatura: `nr_value_wea` em `C1_D1_DATAARRAY`; atualizacao lida de `<DT_UPDATE>` no registro EBHTML (`YYYY-MM-DD HH:MM:SS`, horario local). Clima consultado a cada 5 minutos, independente do tempo total de exibicao.
- Sem clima, JSON invalido, falha, timeout ou registro com mais de 70 minutos: ocultar somente temperatura.
- Duracao total: 10 minutos (`CONFIG.timing.duration = 600000` ms); depois chama `finished`, com `loaded` chamado antes e ambos uma unica vez.
- Ajustes de canal, slot, tempos, logo, margens, fonte e cores: `js/config.js`.
- Sem intro/outro, truncamento, mocks, preview/extranet, localStorage, SVG ou animacoes.
- Modo de hardware fraco dispensado: layout estatico com uma consulta de clima por vez.
- Runtime alvo: ES5 / Chromium 78 / Android 7+; Roboto Bold local aplicada ao template todo.
- Desenvolvimento: `npm run dev` nesta pasta, usando Tailwind global; sem dependencias locais.
- Teste visual exclusivo: http://localhost:12099/FILES/1/index.html (slot deve apontar a esta pasta).
- Validacao automatizada `1080x40` aprovada em Chromium 156; ciclo acelerado somente no perfil temporario e revisao visual concluida. Homologacao no runtime legado/produção pendente.
- Pacote `_EH5/dmidia_rodape.eh5` gerado e reaberto: sete arquivos runtime, hashes conferidos, sem arquivos de desenvolvimento.