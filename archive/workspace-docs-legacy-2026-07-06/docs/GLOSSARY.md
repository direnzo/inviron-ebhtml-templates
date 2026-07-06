# 📚 Glossário de Termos

Termos técnicos usados no desenvolvimento de templates EdgeContents.

---

## A

### Android 7+
Sistema operacional usado em displays de Digital Signage. Versões antigas usam navegador WebKit legado que **não suporta ES6+**, exigindo código JavaScript **ES5 apenas**.

---

## B

### Build
Processo de compilação do template para produção. Minifica CSS, remove código de desenvolvimento (mock data), e prepara arquivos para deploy no EdgeContents CMS.

---

## D

### Dataset
Conjunto de dados fornecido pelo EdgeContents CMS via XML. Cada dataset contém registros com campos específicos (TITULO, TEXTO, FOTO1, etc.).

**Exemplo:**
```javascript
loader.addData('D_NOTICIAS', false); // Registra dataset
var dados = loader.data('D_NOTICIAS'); // Acessa primeiro registro
```

### Digital Signage
Sistema de sinalização digital que exibe conteúdo dinâmico em displays públicos (TVs, totens, monitores). Templates HTML controlam a apresentação visual.

---

## E

### EBDATA
Estrutura XML usada pelo EdgeContents para armazenar dados de conteúdo. Contém campos predefinidos (TITULO, TEXTO, FOTO1-5, etc.) que templates HTML acessam via biblioteca EBHTML.

**Estrutura básica:**
```xml
<EBDATA>
    <TITULO>Título do conteúdo</TITULO>
    <TEXTO>Descrição completa</TEXTO>
    <FOTO1>caminho/imagem.jpg</FOTO1>
</EBDATA>
```

### EBHTML
Biblioteca JavaScript (ebhtml.js) que conecta templates HTML ao EdgeContents CMS. Fornece métodos para carregar dados, controlar playlist, e gerenciar ciclo de vida do template.

**Métodos principais:**
- `ebhtml.create2()` - Inicializa loader
- `loader.addData()` - Registra dataset
- `loader.load()` - Carrega dados do servidor
- `loader.loaded()` - Notifica carregamento bem-sucedido
- `loader.finished()` - Notifica término da exibição

### EdgeContents CMS
Sistema de gerenciamento de conteúdo para Digital Signage. Backend que armazena dados (XML) e serve templates HTML para displays remotos.

**Servidor local:** `http://localhost:12099/FILES/1/`

### ES5
Versão do JavaScript compatível com navegadores antigos (Android 7+). **Única versão suportada** em templates EdgeContents.

**Permitido:** `var`, `function() {}`, `'concat ' + var`  
**PROIBIDO:** `let/const`, `() => {}`, `` `${template}` ``, `async/await`, `class`

---

## L

### Loader
Objeto criado por `ebhtml.create2()` que gerencia carregamento de dados e controle de playlist. Responsável por notificar sucesso/erro ao sistema.

**Ciclo de vida:**
1. `loader.addData()` - Registra datasets necessários
2. `loader.load()` - Inicia carregamento
3. `loader.loaded()` - Notifica sucesso (APENAS em sucesso)
4. `loader.finished()` - Notifica término (SEMPRE)

---

## M

### Mock Data
Dados de teste locais (mock-data.js) usados durante desenvolvimento para simular resposta do EdgeContents CMS sem necessidade de servidor ativo.

**Ativação:** Descomentar `<script src="js/mock-data.js"></script>` no HTML

**Estrutura:**
```javascript
var MOCK_DATA = {
    enabled: true,
    config: { duration: 5000 },
    dados: [ /* dados de teste */ ]
};
```

---

## P

### Playlist
Sequência automática de templates exibidos em loop no display. EdgeContents controla quando cada template inicia/termina baseado nas chamadas `loader.loaded()` e `loader.finished()`.

**⚠️ CRÍTICO:** Playlist trava se não chamar corretamente:
- `loaded()` - apenas após sucesso
- `finished()` - sempre (sucesso OU erro)

---

## T

### TailwindCSS
Framework CSS utilitário usado para estilização de templates. **Instalado globalmente** no sistema (não precisa instalar localmente).

**Workflow:**
1. Editar `css/input.css` (código fonte)
2. Executar `npm run dev` (watch mode)
3. TailwindCSS gera `css/master.css` (arquivo compilado)

**Classes comuns:**
- `flex items-center justify-center` - Layout centralizado
- `w-full h-full` - Tamanho 100%
- `bg-blue-600 text-white` - Cor de fundo e texto
- `opacity-0 transition-opacity duration-1000` - Animações fade

### Template
Arquivo HTML que define a apresentação visual de conteúdo em displays de Digital Signage. Combina HTML, CSS (TailwindCSS), e JavaScript (ES5) para renderizar dados do EdgeContents.

**Estrutura mínima:**
- `index.html` - Estrutura HTML
- `css/master.css` - Estilos compilados
- `js/ebhtml.js` - Biblioteca EdgeContents (nunca editar)
- `js/master.js` - Lógica do template (editar aqui)

---

## W

### WebKit
Motor de renderização usado em navegadores Android antigos. Versão legada **não suporta ES6+**, limitando código JavaScript a ES5.

### Workflow
Sequência de etapas no desenvolvimento de templates:

**Desenvolvimento:**
1. Iniciar servidor EdgeContents (`ebcliente4.exe`)
2. Executar `npm run dev` (TailwindCSS watch mode)
3. Testar no navegador (`localhost:12099`)
4. Iterar código (master.js, input.css)

**Build Produção:**
1. Desativar mock data (`MOCK_DATA.enabled = false`)
2. Executar `npm run build` (CSS minificado)
3. Comentar script mock no HTML
4. Compilar com `ebhtmlbuilder4`
5. Deploy no EdgeContents CMS

---

## X

### XML
Formato de dados usado pelo EdgeContents para transmitir conteúdo aos templates. Cada dataset é um arquivo XML com estrutura `<EBDATA>` contendo campos predefinidos.

**URL do dataset:** `http://servidor/content/data/{NOME_DATASET}`

**Exemplo de resposta:**
```xml
<?xml version="1.0"?>
<EBDATA>
    <TITULO>Notícia Importante</TITULO>
    <TEXTO>Descrição completa da notícia...</TEXTO>
    <FOTO1>uploads/imagem123.jpg</FOTO1>
    <COR>#3b82f6</COR>
</EBDATA>
```

---

**Ver também:**
- [01-getting-started.md](docs/01-getting-started.md) - Tutorial para iniciantes
- [02-xml-format.md](docs/02-xml-format.md) - Estrutura completa do XML
- [05-api-reference.md](docs/05-api-reference.md) - Referência da API EBHTML
