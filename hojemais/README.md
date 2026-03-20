# Template HojeMais - Notícias UOL

Template single-story para exibição de notícias UOL em Digital Signage com layout geométrico poligonal. Composição visual dinâmica com cores por categoria, foto ao fundo e elementos geométricos em primeiro plano.

## Formato

**Primário:** 1536x768 (2:1 landscape)  
**Responsivo:** Suporta múltiplos formatos via breakpoints aspect-ratio (portrait, ultrawide, superbanner, etc)  
**Duração:** 15 segundos por notícia

## Layout

**Estrutura visual:**
- **Fundo:** Imagem da notícia (posicionada à direita, com escala 1.1)
- **Elementos geométricos:** 3 shapes poligonais diagonais com cores dinâmicas por categoria
- **Logo cliente:** Posicionado no topo esquerdo
- **Logo Agitta:** Fixo canto superior direito
- **Tag de categoria:** Badge colorida com fundo dinâmico
- **Título:** Montserrat Bold, texto branco em uppercase
- **Descrição:** GothamNarrow Bold, texto branco com ajuste automático de fonte

**Cores por categoria:**
- **SAÚDE:** Vermelho profundo
- **ESPORTE:** Verde escuro
- **POLÍTICA:** Vermelho brilhante
- **ECONOMIA:** Verde azulado
- **EDUCAÇÃO:** Azul profundo
- **TECNOLOGIA:** Amarelo-verde
- **ENTRETENIMENTO:** Laranja
- **MÚSICA:** Amarelo-ouro
- **E mais...** (veja master.js)

## Dataset

**Nome:** `D_HOJEMAIS`

**Campos:**
- `TITULO` - Título da notícia (exibido em uppercase)
- `TEXTO` - Descrição/corpo da notícia
- `FOTO` - URL da imagem principal (alinhada à direita, 55% da largura)
- `CATEGORIA` - Categoria para cor dinâmica (determina cores dos shapes)
- `LOGO_CUSTOM` - URL do logo personalizado (opcional)

## Desenvolvimento

```bash
# Mock data já habilitado por padrão
# Editar js/mock-data.js para testar com seus dados

# Watch mode (já compilado, apenas para edições CSS)
npm run dev

# Abrir no navegador
http://localhost:12099/FILES/1/hojemais/index.html
```

## Build Produção

```bash
# Compilar CSS minificado (se necessário)
npm run build

# Comentar mock-data.js no index.html
# Configurar dataset D_HOJEMAIS no EdgeContents CMS
```

## Tecnologias

- **EBHTML** (v2.0.3) - Integração EdgeContents
- **TailwindCSS** - Estilização responsiva
- **JavaScript ES5** - Compatibilidade Android 7+
- **Fontes** - Montserrat-Bold (títulos/categorias), GothamNarrow-Bold (textos)
- **CSS Clipping** - `clip-path` poligonal para shapes

## Animações

- **Ken Burns Effect:** Imagem com scale 1.1 e transição 15 segundos
- **Fade in/out:** Corpo com opacity 0→1 em 1 segundo
- **Responsive:** Elementos adaptam a múltiplos formatos de tela

