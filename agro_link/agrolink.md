# Documentacao Front-end - API para tabela DSContent (ImportAgrolink)

Arquivo de referencia: protected/components/ImportAgrolink.php
Classe: ImportAgrolink
Destino: tabela/modelo DSContent

## Objetivo desta documentacao

Esta pagina mostra de forma direta qual campo vindo da API entra em qual coluna da tabela DSContent.

Os dados sao importados em 4 categorias:

- dolar
- cotacoes
- tempo
- noticias

## Colunas base gravadas em todos os tipos

Estas colunas sempre sao preenchidas, independente da categoria:

| Coluna DSContent | Valor gravado |
|---|---|
| cd_contentlist_cls | 3 |
| fl_deleted_cnt | 0 no save normal |
| fl_screenall_cnt | 1 apenas em registro novo |
| ds_category_cnt | tipo do conteudo: dolar, cotacoes, tempo ou noticias |
| ds_source_cnt | estado em minusculo (exemplo: go) |
| mm_text2_cnt | cidade (exemplo: Goiania) |
| mm_text3_cnt | UF em maiusculo (exemplo: GO) |
| ds_cnthash_cnt | hash unico do item |
| dt_date_cnt | data do feed convertida para timestamp |
| dt_begin_cnt | igual a dt_date_cnt |
| dt_end_cnt | dt_date_cnt + 24 horas |
| nr_order_cnt | ordem do item no tipo |
| mm_text4_cnt | JSON com o objeto completo original da API |

## Mapeamento API para tabela por categoria

### 1) dolar

Origem do feed: root.row

| Campo da API | Coluna DSContent | Regra |
|---|---|---|
| descricao + tipo | ds_title_cnt | concatena descricao e tipo, com limite de 120 caracteres |
| valor | mm_text_cnt | valor textual da cotacao |
| Variacao | nr_price_cnt | variacao do dolar |
| data | dt_date_cnt | parse de data; se falhar, usa horario da importacao |
| objeto inteiro da linha | mm_text4_cnt | JSON original da API |

Campos que ficam vazios neste tipo:

- nr_price2_cnt
- mm_text5_cnt

### 2) cotacoes

Origem do feed: array na raiz

| Campo da API | Coluna DSContent | Regra |
|---|---|---|
| produto_detalhe | ds_title_cnt | se vier vazio, usa NomeProduto; se nao existir, usa Cotacao |
| Valor | mm_text_cnt | valor da cotacao |
| variacao | nr_price_cnt | variacao do produto |
| UnidadeNegociacao | mm_text5_cnt | unidade de negociacao |
| Data | dt_date_cnt | parse de data; se falhar, usa horario da importacao |
| objeto inteiro da linha | mm_text4_cnt | JSON original da API |

Campos que ficam vazios neste tipo:

- nr_price2_cnt

### 3) tempo

Origem do feed: array na raiz

| Campo da API | Coluna DSContent | Regra |
|---|---|---|
| descricaoCondicaoTempo | ds_title_cnt | se nao vier, usa Previsao do tempo |
| descricaoCondicaoTempo | mm_text_cnt | descricao textual da condicao |
| tempMin | nr_price_cnt | temperatura minima |
| tempMax | nr_price2_cnt | temperatura maxima |
| Data | dt_date_cnt | parse de data; se falhar, usa horario da importacao |
| objeto inteiro da linha | mm_text4_cnt | JSON original da API |

Campos que ficam vazios neste tipo:

- mm_text5_cnt

### 4) noticias

Origem do feed: root.row

| Campo da API | Coluna DSContent | Regra |
|---|---|---|
| titulo | ds_title_cnt | se nao vier, usa Noticia |
| resumo | mm_text_cnt | se vier vazio, usa noticia sem tags HTML |
| data | dt_date_cnt | parse de data; se falhar, usa horario da importacao |
| objeto inteiro da linha | mm_text4_cnt | JSON original da API |

Campos que ficam vazios neste tipo:

- nr_price_cnt
- nr_price2_cnt
- mm_text5_cnt

## Campos auxiliares importantes para o Front

- ds_category_cnt: use para filtrar qual card/lista montar (dolar, cotacoes, tempo, noticias).
- mm_text2_cnt: cidade do item.
- mm_text3_cnt: UF do item.
- mm_text4_cnt: payload original completo da API em JSON (campo util para debug ou necessidade de dados extras no front).
- nr_order_cnt: ordem de exibicao dentro da categoria.
- fl_deleted_cnt: quando estiver 1, o item foi removido logicamente e nao deve ser exibido.

## Regras de consistencia

- Cada item recebe um hash unico em ds_cnthash_cnt para evitar duplicidade.
- Se o hash ja existir, o registro e atualizado.
- Se um item antigo nao aparecer na importacao atual, ele recebe fl_deleted_cnt = 1.

## Cidades atualmente configuradas

- Goiania/GO
- Rio Verde/GO
- Anapolis/GO
