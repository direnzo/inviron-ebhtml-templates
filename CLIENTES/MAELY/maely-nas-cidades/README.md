# MAELY Painel News

- Template EdgeContents em `CLIENTES/MAELY/maely-nas-cidades`.
- Dataset: `D_NOTICIAS_MAELY`, filtro `CATEGORY=painel news`, quantidade 1.
- Campos: `TITULO`, fallback `TEXTO`/`TEXTOCOMPLETO`, imagem `FOTO`.
- Cada consulta retorna uma noticia; a ordenacao aleatoria e definida pelo canal.
- Duracao: 10 s. Sem dados ou imagem valida, libera a playlist sem desenhar conteudo.
- Formatos prioritarios: 1080x1800, 1152x384 e 1200x800; blocos e cores medidos nos SVGs em `_refs/`.
- Cores vetoriais: azul `#2F6AFD`, laranja `#FB5B00`; SVGs/PNGs em `_refs/` sao referencias, nao assets de runtime.
- Compatibilidade: ES5, Android 7+ / WebKit legado e hardware fraco.
- Mock disponivel com `?mock=1`; por padrao consulta o EBHTML real.
- EBHTML 2.0.7 copiado integralmente de `_template-base/js/ebhtml.js`.
- Fontes Montserrat incluidas com licenca OFL em `css/fonts/OFL.txt`.
- Desenvolvimento: `npm run dev` com Tailwind global; nao executar `npm run build`.
- Teste no player: `http://localhost:12099/FILES/1/index.html`.
- Antes da producao, remover `js/mock-data.js` do HTML e definir `CONFIG.debug = false`.