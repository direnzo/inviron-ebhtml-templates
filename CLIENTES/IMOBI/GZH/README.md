# IMOBI GZH — Notícias

- **Derivação:** `_template-base/`; padrões de dois/um card e dados reaproveitados de `CLIENTES/IMOBI/Atlantida`.
- **Dados:** `D_GZH`, `amount=2`; `TITULO` (fallback `TEXTO`), `CATEGORY`, `FOTO`, `IMAGECREDIT` e `FOOTER`.
- **Exibição:** duas notícias simultâneas; uma notícia ocupa o primeiro card sem duplicação. Ciclo de 10 s.
- **Visual:** fundo preto, logo GZH extraído do vídeo de referência, editoria `#D15138` com texto preto; CTA conforme o vídeo.
- **Animação:** entrada escalonada; editorias coladas às fotos deslizam da esquerda para a direita por trás delas; CTA após 5 s. Efeitos reduzidos em Android/dispositivo fraco.
- **Compatibilidade:** ES5, EBHTML 2.0.7, WebKit/Android legado; inclusão do mock comentada no HTML para aguardar o canal real.
- **Formatos explícitos:** `1536x768`, `768x1152` (somente os dois formatos dos vídeos).
- **Matriz:** 2 formatos; mock conferido no Builder em ambos; matriz de homologação no player `not_run`; snapshot `2026-10-20`.
  SHA-256: consolidado `89949bae828c4875a33c40e47f4d6992a76b35b1c6876adf051e610889e3e331`;
  tenant `48e40e5db69d138dca78f6e027b92a4fea35c1e9337045affa9fc7c0c9478e4b`;
  faixas `278af2e643c01cfb0a65f6cc47c216f9b73c723ebd03834cb88ef17eed4fb198`;
  proporções `51e28f878d29618b6ae90bc1f35335a1f185590253582c1846bc1ecbe8030281`.
- **Desenvolvimento:** `npm run dev` (Tailwind global); regressão: `npm test`.
- **Mock:** `js/mock-data.js` tem `enabled: true`, mas não é carregado no HTML. Para desenvolvimento, descomentar sua inclusão; em produção manter desativado.
- **Regressão do mock:** script incluído com `enabled: false` não ativa o shim e consulta o canal; testes executam mock + config + master, com uma/duas notícias e ciclo `loaded` → `finished`.
- **Evidência visual:** vídeos GZH 10,01 s; 40 instantes por vídeo amostrados a cada 0,25 s.
- **Endpoint local:** `/FILES/1` serve os arquivos GZH idênticos ao disco; processo identificado como `ebhtmlbuilder4.exe`, não `ebcliente4.exe`.
- **Validação do mock (2026-11-11):** Builder autorizado pelo usuário; viewports `1536x768` e `768x1152`, fontes/logo/imagens carregadas, textos visíveis e `loaded` → `finished` uma vez (~10 s), sem consulta ao canal. Capturas `gzh-mock-1536x768.png` e `gzh-mock-768x1152.png` nos artefatos locais da sessão.
- **Editorias (2026-11-11):** padding horizontal causava 33 px de afastamento e `scaleX` não deslizava o bloco; margem compensada, `translateX(-100%)`, recorte lateral e foto à frente corrigem a entrada sem mover os títulos. Nos dois formatos, distância final 0 px e trajetória negativa → 0; capturas `gzh-editorias-1536x768.png` e `gzh-editorias-768x1152.png` na sessão.
- **Testes:** `node --test scripts/imobi-gzh.test.js` passou 11/11; `npm.cmd test` passou 160/160, incluindo geometria e entrada das editorias nos dois formatos. Única falha HTTP observada no mock: favicon automático fora do template (500), sem erro JS.
- **Validação no player:** homologação pendente no ebcliente4; conferência no Chrome/Builder não certifica o runtime legado.
- **Checkpoint para commit:** canal `D_GZH` indisponível; mock desativado no HTML por decisão do usuário. Teste visual sintético ativa sua inclusão somente na resposta interceptada, sem alterar o HTML salvo; teste conclusivo com dados reais pendente.
- **Entrega:** nenhum `.eh5` gerado; revisão visual e homologação no player-alvo pendentes.
