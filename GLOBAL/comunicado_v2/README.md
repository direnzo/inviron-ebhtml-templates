# comunicado_v2

Template global de comunicados para elevadores/telas de circulação. Um único canal (`D_COMUNICADO`) alimenta **conteúdo** (`TITULO`, `TEXTO`, `FOTO`) e **aparência** (fundo, cores, caixas, filete, duração), esta última consolidada como JSON no campo `TEXTO10`. Tudo é preenchido pela extranet EdgeContents.

- Classificação: `GLOBAL` (sem tenant). Criação nova; substitui visualmente o `GLOBAL/comunicado` (que permanece intacto).
- EBHTML 2.0.7 (cópia integral de `_template-base/js/ebhtml.js`), ES5 puro, perfil Chromium 78.
- Formatos: qualquer proporção (retrato, quadrado, paisagem, ultrawide). Tipografia em `vmin` no body e `em` nos filhos.
- Ciclo: um item por execução; `loaded()` após renderizar, `finished()` uma vez após `DURACAO` do `TEXTO10` (segundos, convertidos para ms; padrão em `CONFIG.timing.duration`, hoje 30 s). Sem dados válidos (canal vazio, erro, timeout) o template não desenha nada e pula a playlist em ~200 ms — ver seção 1.1.

## 1. Como o layout é escolhido

O template decide sozinho pelo que existir no registro (texto vazio, só espaços ou só tags HTML conta como ausente):

| Título | Descrição | Foto | Resultado |
|:-:|:-:|:-:|---|
| ✔ | – | – | Título grande centralizado, com filete |
| – | ✔ | – | Descrição grande centralizada |
| – | – | ✔ | Foto em tela cheia. Se a proporção da foto diferir da tela em mais de 12 %, aparece inteira sobre fundo desfocado (sem cortar) |
| ✔ | ✔ | – | Editorial: título + filete + descrição, alinhados à esquerda |
| ✔ | – | ✔ | Foto ocupa tudo, título sobre degradê escuro na base |
| – | ✔ | ✔ | Foto lateral (topo em telas retrato/quadradas) + descrição |
| ✔ | ✔ | ✔ | Foto lateral (topo em retrato) + título + descrição |
| – | – | – | Nada a mostrar: não desenha nada e pula a playlist em ~200 ms (seção 1.1) |

Se a foto falhar ao carregar (URL inválida, timeout de 8 s), o layout recalcula sem foto. Se sobrar nada, vale o comportamento de canal vazio (seção 1.1).
Texto longo: a fonte do bloco reduz automaticamente (mínimo 30 % do tamanho) até caber.

### 1.1 Canal vazio, erro e timeout — pulo invisível e proteção contra reinício

Sem dados válidos, o template **não desenha nada** (`html`/`body` transparentes e `#stage` com opacidade 0, sem fade; o que aparece é o fundo da própria janela do player) e pula o item: chama `loaded()` e, `CONFIG.empty.delay` ms depois (200 ms), `finished()`.

Por que `loaded()` antes de `finished()`: o `ebclient` conta "play errors" consecutivos (`Play error N of 15`) e **reinicia a máquina** ao passar de 15 (`Maximum play errors in sequence reached (16 / 15), rebooting machine`). Um template que encerra sem ter avisado `loaded()` aparece no log como `PLAY EVENT: ERROR` (hipótese consistente com o log de produção; **validar no ebclient**, ver abaixo).

| Situação | Comportamento |
|---|---|
| Canal sem item (`D_COMUNICADO` vazio) | pula (`loaded()` + `finished()` em ~200 ms), sem desenhar |
| Item sem título, descrição e foto válidos | idem |
| Foto indisponível e sem texto | idem |
| Falha de rede/HTTP no canal, timeout do loader (8 s), exceção no parse/render | idem |
| Item válido | `loaded()` após renderizar, `finished()` após `DURACAO` |

Regras que não podem ser quebradas ao manter o template:
- Nunca chamar `loader.error()` nem usar `nodataiserror = true` com dataset obrigatório (o `ebhtml.js` chamaria `error()` = "play error"). O dataset é registrado como **não obrigatório** e o vazio é tratado em `master.js`.
- Nunca chamar `loader.finished()` direto; usar `finish()`/`complete()`/`completeEmpty()` (garantem `loaded()` antes e uma única chamada).

**Como validar/monitorar:** no ECLog (aba `ebclient.browser.playcontroller-*`), com o canal vazio, o nome do template **não** deve gerar `Play error N of 15`. Se gerar mesmo com `loaded()` antes de `finished()`, aumentar `CONFIG.empty.delay` (o client pode exigir uma permanência mínima) e reportar o log.

**Limite conhecido:** se todos os itens da playlist estiverem vazios ao mesmo tempo, os pulos de ~200 ms entram em laço rápido. Evitar manter o template na playlist sem comunicado ativo (vigência `DT_BEGIN`/`DT_END` na extranet).

## 2. Contrato do canal D_COMUNICADO

| Campo do canal | Conteúdo | Observação |
|---|---|---|
| `TITULO` | Título | Texto puro (padrão do comunicado antigo) |
| `TEXTO` | Descrição | HTML simples do editor rico (padrão do comunicado antigo) |
| `FOTO` | Foto | URL/caminho da imagem, jpg/png (padrão do comunicado antigo). Vídeo **não** é suportado nesta versão |
| `TEXTO10` | **Configuração visual** | **JSON consolidado** plano (seção 2.1). Opcional: ausente, vazio ou inválido = visual padrão. `TEXT10` é aceito como alias |

Os demais campos do item (`ID`, `DT_BEGIN`, `DT_END`, `CATEGORY`, `FOTO2`…) são ignorados pelo template.

### 2.1 JSON de `TEXTO10`

Objeto **plano** (sem aninhamento), uma linha, chaves em maiúsculas, valores em **string**. Todas as chaves são opcionais: chave omitida = padrão (definido em `js/config.js`). Exemplo completo com os padrões:

```json
{"BG_TIPO":"gradiente","BG_COR":"#0d1b2a","BG_COR_DE":"#0d1b2a","BG_COR_PARA":"#1d2f4d","BG_ANGULO":"135","BG_BRILHO":"true","COR_DESTAQUE":"#f58220","FILETE":"true","TITULO_COR":"#ffffff","TITULO_CAIXA":"false","TITULO_CAIXA_COR":"#f58220","TITULO_CAIXA_OPACIDADE":"100","TITULO_CAIXA_RAIO":"27","DESC_COR":"#ffffff","DESC_CAIXA":"false","DESC_CAIXA_COR":"#000000","DESC_CAIXA_OPACIDADE":"35","DESC_CAIXA_RAIO":"27","DURACAO":"30"}
```

| Chave | Rótulo sugerido (extranet) | Controle | Valores | Padrão |
|---|---|---|---|---|
| `DURACAO` | Tempo de exibição (s) | Número | 3–300 (fora da faixa é ajustado ao limite; 0/ausente = padrão) | 30 |
| `BG_TIPO` | Tipo de fundo | Lista | `gradiente` \| `chapado` (aceita também `gradient`/`solid`) | `gradiente` |
| `BG_COR` | Cor do fundo (chapado) | Seletor de cor | `#RRGGBB` | `#0d1b2a` |
| `BG_COR_DE` | Cor inicial (gradiente) | Seletor de cor | `#RRGGBB` | `#0d1b2a` |
| `BG_COR_PARA` | Cor final (gradiente) | Seletor de cor | `#RRGGBB` | `#1d2f4d` |
| `BG_ANGULO` | Ângulo do gradiente | Slider | 0–360 (graus) | 135 |
| `BG_BRILHO` | Brilho suave no canto | Liga/desliga | `true` \| `false` | `true` |
| `COR_DESTAQUE` | Cor do filete/barras | Seletor de cor | `#RRGGBB` | `#f58220` |
| `FILETE` | Mostrar filete | Liga/desliga | `true` \| `false` | `true` |
| `TITULO_COR` | Título: cor do texto | Seletor de cor | `#RRGGBB` | `#ffffff` |
| `TITULO_CAIXA` | Título em caixa | Liga/desliga | `true` \| `false` | `false` |
| `TITULO_CAIXA_COR` | Título: cor da caixa | Seletor de cor | `#RRGGBB` | `#f58220` |
| `TITULO_CAIXA_OPACIDADE` | Título: opacidade da caixa | Slider | 0–100 (%) | 100 |
| `TITULO_CAIXA_RAIO` | Título: cantos arredondados | Slider | 0–100 (0 = reto; 100 = máximo, 1,5 em) | 27 |
| `DESC_COR` | Descrição: cor do texto | Seletor de cor | `#RRGGBB` | `#ffffff` |
| `DESC_CAIXA` | Descrição em caixa | Liga/desliga | `true` \| `false` | `false` |
| `DESC_CAIXA_COR` | Descrição: cor da caixa | Seletor de cor | `#RRGGBB` | `#000000` |
| `DESC_CAIXA_OPACIDADE` | Descrição: opacidade da caixa | Slider | 0–100 (%) | 35 |
| `DESC_CAIXA_RAIO` | Descrição: cantos arredondados | Slider | 0–100 | 27 |

`FILETE=false` remove todos os detalhes de destaque (traço sob o título, traço entre título e descrição, barra lateral, barra na borda da foto). Com a caixa ligada, o traço sob o título e o traço entre título e descrição já são omitidos automaticamente.

### 2.2 Regras de leitura e validação (o que o template aceita)

- **JSON:** `TEXTO10` inválido (JSON quebrado, vazio, array, texto solto) → visual 100 % padrão, sem erro. Aspas escapadas como `&quot;` e aspas tipográficas (“ ”) são normalizadas antes do parse. Chaves desconhecidas são ignoradas.
- **Por chave:** uma chave inválida cai no padrão **só ela**; as demais valem.
- **Cores:** somente hexadecimal `#RGB` ou `#RRGGBB`. Nomes (`red`), `rgb()` ou lixo → padrão.
- **Booleanos:** `"true"`/`"false"` (também JSON boolean, `1/0`, `sim/nao`, `s/n`, `on/off`). Outro valor → padrão.
- **Números:** string numérica ou JSON number (vírgula ou ponto); fora da faixa é limitado ao mínimo/máximo; não numérico → padrão.
- **`TITULO`:** texto puro (HTML aparece como texto literal).
- **`TEXTO`:** permitido `p br strong b em i u s span ul ol li h1 h2 h3 blockquote sub sup` e atributos `class`/`style` (inclui `ql-align-*` do Quill). Todo o resto é removido: `script`, `style`, `iframe`, `img`, `svg`, `on*`, `href`… Tags desconhecidas são "abertas" (o texto interno é preservado).
- **`FOTO`:** o template não redimensiona nem converte. Recomendado JPG/PNG ≥ 1920 px no lado maior.
- **Contraste:** o template não valida contraste entre `TITULO_COR`/`DESC_COR` e o fundo. Recomenda-se pré-visualização na extranet.

## 3. Recomendações para a interface da extranet

Agrupar em blocos na ordem: **Conteúdo (`TITULO`, `TEXTO`, `FOTO`) → Tempo → Fundo → Destaque → Título → Descrição**. Cada controle do formulário grava a chave de mesmo nome no objeto; a extranet grava `JSON.stringify(obj)` (uma linha) em `TEXTO10`.

Visibilidade condicional (esconder o que não se aplica):

| Mostrar… | …somente quando |
|---|---|
| `BG_COR` | `BG_TIPO = chapado` |
| `BG_COR_DE`, `BG_COR_PARA`, `BG_ANGULO` | `BG_TIPO = gradiente` |
| `COR_DESTAQUE` | `FILETE = true` |
| `TITULO_CAIXA_COR`, `_OPACIDADE`, `_RAIO` | `TITULO_CAIXA = true` |
| `DESC_CAIXA_COR`, `_OPACIDADE`, `_RAIO` | `DESC_CAIXA = true` |

Sugestões:
- **Gravar o objeto completo** (todas as chaves) é o mais simples de editar depois; enviar só o que difere do padrão também é aceito.
- **Pré-visualização ao vivo:** `docs/mockups/index.html` (seção 5.2) é uma implementação de referência de formulário + preview usando exatamente este contrato.
- **Campo "Tema" (opcional, NÃO é do canal):** lista que preenche o formulário de uma vez; o usuário ajusta depois. Só as chaves listadas mudam.

| Tema | Chaves preenchidas |
|---|---|
| Azul noturno (padrão) | *(nenhuma — `TEXTO10` vazio ou `{}`)* |
| Preto chapado | `{"BG_TIPO":"chapado","BG_COR":"#000000","BG_BRILHO":"false","DESC_COR":"#d9d9d9"}` |
| Branco limpo | `{"BG_TIPO":"chapado","BG_COR":"#f4f5f7","BG_BRILHO":"false","COR_DESTAQUE":"#e0651a","TITULO_COR":"#14213d","DESC_COR":"#333b4d"}` |
| Laranja → vinho | `{"BG_COR_DE":"#f58220","BG_COR_PARA":"#7a1f3d","BG_ANGULO":"160","COR_DESTAQUE":"#ffffff"}` |
| Verde + caixas | `{"BG_COR_DE":"#0b3d33","BG_COR_PARA":"#127a5f","BG_ANGULO":"120","COR_DESTAQUE":"#ffd166","TITULO_COR":"#0b3d33","TITULO_CAIXA":"true","TITULO_CAIXA_COR":"#ffd166","TITULO_CAIXA_RAIO":"33","DESC_CAIXA":"true","DESC_CAIXA_OPACIDADE":"30","DESC_CAIXA_RAIO":"33"}` |
| Roxo vidro | `{"BG_COR_DE":"#2b1055","BG_COR_PARA":"#7597de","BG_ANGULO":"145","COR_DESTAQUE":"#ff8fb1","TITULO_CAIXA":"true","TITULO_CAIXA_COR":"#ffffff","TITULO_CAIXA_OPACIDADE":"16","TITULO_CAIXA_RAIO":"60","DESC_CAIXA":"true","DESC_CAIXA_COR":"#ffffff","DESC_CAIXA_OPACIDADE":"12","DESC_CAIXA_RAIO":"60"}` |
| Corporativo claro | `{"BG_TIPO":"chapado","BG_COR":"#e9eef7","BG_BRILHO":"false","COR_DESTAQUE":"#0a5cff","TITULO_COR":"#ffffff","TITULO_CAIXA":"true","TITULO_CAIXA_COR":"#0a2a66","TITULO_CAIXA_RAIO":"13","DESC_COR":"#1b2438","DESC_CAIXA":"true","DESC_CAIXA_COR":"#ffffff","DESC_CAIXA_OPACIDADE":"100","DESC_CAIXA_RAIO":"13"}` |

## 4. Exemplo de registro no canal (validado)

Este é o XML enviado pelo time de dev; renderiza corretamente e equivale ao cenário `?mock=8`.

```xml
<EBDATA>
  <ITEM>
    <ID>123</ID>
    <DT_BEGIN>2026-09-30T10:34:00-03:00</DT_BEGIN>
    <DT_END>2026-10-05T18:00:00-03:00</DT_END>
    <TITULO><![CDATA[Manutenção preventiva dos elevadores]]></TITULO>
    <TEXTO><![CDATA[<p>Os elevadores da <strong>Torre B</strong> passarão por manutenção preventiva no <strong>sábado, dia 04/10</strong>, das 8h às 12h.</p><p>Utilize os demais elevadores ou a escada de emergência.</p>]]></TEXTO>
    <FOTO><![CDATA[/content/files/manutencao.jpg]]></FOTO>
    <TEXTO10><![CDATA[{"BG_TIPO":"gradiente","BG_COR_DE":"#0b3d33","BG_COR_PARA":"#127a5f","BG_ANGULO":"120","BG_BRILHO":"true","COR_DESTAQUE":"#ffd166","FILETE":"true","TITULO_COR":"#0b3d33","TITULO_CAIXA":"true","TITULO_CAIXA_COR":"#ffd166","TITULO_CAIXA_OPACIDADE":"100","TITULO_CAIXA_RAIO":"33","DESC_COR":"#ffffff","DESC_CAIXA":"true","DESC_CAIXA_COR":"#000000","DESC_CAIXA_OPACIDADE":"30","DESC_CAIXA_RAIO":"33","DURACAO":"20"}]]></TEXTO10>
  </ITEM>
</EBDATA>
```

O template lê **o primeiro item** entregue pelo player (sem `amount`/filtros fixos); a seleção/rotação entre comunicados é do canal (`QI_ORDER`).

## 5. Desenvolvimento e teste

### 5.1 Mock (dados de exemplo)

`js/mock-data.js` traz 25 cenários no formato real do canal: `TITULO`, `TEXTO`, `FOTO` e `TEXTO10` com o JSON. Para usá-lo, descomente a tag `<script src="js/mock-data.js">` em `index.html` (deixada comentada por padrão, como no pacote de produção). Só age com `?mock` na URL (`?mock=N` fixo, `?mock` aleatório). **Para desativar o mock basta não usar `?mock` na URL** (o player real entrega o canal); mesmo esquecido no pacote ele não faz nada, mas deve ser removido do `.eh5`. Quando o canal estiver populado, o teste com dados reais é `http://localhost:12099/FILES/1/index.html` sem parâmetros.

**Modo aleatório (simula a chegada de um novo comunicado a cada F5):** use `?mock` (sem número) ou `?mock=random`. Cada carregamento sorteia conteúdo (título/descrição/foto presentes ou não, textos curtos e longos, 3 fotos de proporções diferentes) e um `TEXTO10` completo (paleta, gradiente/chapado, ângulo, filete, caixas, opacidade, cantos e duração de 8–20 s; ~8 % dos sorteios trazem uma chave inválida de propósito). O registro sorteado e o `seed` aparecem no console (`[Mock] registro: …`); para repetir exatamente o mesmo sorteio (por exemplo, ao reportar um bug) use `?mock=random&seed=<N>`. `?mock=N` continua fixando o cenário da tabela.

Teste sempre pelo player: `http://localhost:12099/FILES/1/index.html?mock` (aleatório) ou `?mock=N` (fixo) — nunca `file:///` para homologação.

| N | Cenário |
|:-:|---|
| 0 | Completo (título + descrição + foto), visual padrão |
| 1 / 2 / 3 | Só título / só descrição / só foto |
| 4 / 5 / 6 | Título+descrição / título+foto / descrição+foto |
| 7 | Laranja → vinho |
| 8 | Verde com caixas (idêntico ao XML do dev, `DURACAO` 20) |
| 9 | Roxo, caixas translúcidas, cantos bem arredondados |
| 10 | Corporativo claro, fundo chapado |
| 11 | Preto chapado, sem filete |
| 12 | Texto longo (autofit), sem `TEXTO10` |
| 13 | Valores inválidos no JSON (cada chave cai no padrão) |
| 14 | Foto quebrada (deve cair para só título) |
| 15 | HTML malicioso em `TEXTO` (deve ser neutralizado) |
| 16 | `TEXTO10` com JSON quebrado (visual 100 % padrão) |
| 17 | `TEXTO10` com aspas escapadas `&quot;` (deve ser lido normalmente) |
| 18 | Sem `TEXTO10` (canal antigo, visual padrão) |
| `empty` | `?mock=empty`: canal vazio (`loader.data()` indefinido); deve chamar `loaded()`, não desenhar nada e chamar `finished()` em ~200 ms |
| 19 / 20 | Só foto retrato / só foto quadrada (tela cheia: foto inteira sobre fundo desfocado) |
| 21 | Título + foto retrato, caixa escura no título |
| 22 | Descrição + foto quadrada, tema verde com caixas |
| 23 | Completo com foto retrato, laranja → vinho |
| 24 | Título + foto paisagem, caixa vidro, sem filete |

### 5.2 Laboratório visual

`docs/mockups/index.html` na raiz do repositório (só desenvolvimento; exige a tag de `js/mock-data.js` descomentada em `index.html`): painel com todos os controles e telas em várias proporções. Cada tela é o `index.html` real em `iframe` com `?lab=1`; o painel envia o registro do canal por `postMessage` (`{type:'comunicado-lab', record:{TITULO, TEXTO, FOTO, TEXTO10}}`) e o template re-renderiza via `window.comunicadoRender(record)`. O botão **Ver / copiar TEXTO10** mostra o JSON gerado pelos controles — é exatamente o que a extranet deve gravar em `TEXTO10`.

### 5.3 Pacote `.eh5`

Incluir: `index.html`, `css/master.css`, `js/ebhtml.js`, `js/config.js`, `js/master.js`.
Excluir: `js/mock-data.js` (e sua tag `<script>` no `index.html`), `img/sample*.svg`, este README.

## 6. Decisões de briefing

- **CSS puro** (sem Tailwind/build): o CSS é pequeno, tem tokens dinâmicos por custom properties e não exige toolchain.
- **Custom properties** (`--accent`, `--rt`, `--rd`) exigem Chromium ≥ 49; adequado ao perfil Chromium 78. Não validado em QtWebKit legado.
- **Hardware fraco / preview / `localStorage`:** não aplicados (template estático, um XHR, sem animação pesada; preview via `ebpreview_url` já é tratado pelo `ebhtml.js`).
- **Vídeo em `FOTO`** (existia no template antigo) e o dataset `D_LOCAL` (carregado e não usado) foram removidos.
- **Fontes:** pilha do sistema (Segoe UI, Roboto, Arial). Nenhuma fonte embarcada.
- **Arquivos:** `ebhtml.js` idêntico a `_template-base` (2.0.7).

## 7. Pendências de homologação

- Testar em `http://localhost:12099/FILES/1/index.html` no player real (ainda só validado em Edge headless com `file://` e mock).
- Reload agressivo (F5 repetido) e cenário de canal vazio/falha de rede no player real.
- Gerar e reabrir o `.eh5`.
