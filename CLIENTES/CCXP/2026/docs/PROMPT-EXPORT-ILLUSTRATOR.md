# Prompt: medidas do layout (Claude Desktop + Adobe/Illustrator)

Objetivo: obter só o que falta para montar os slides no template. Fundos e ornamentos
do topo **já estão** em `programacao_palco/img/` (`{palco}.png` e `topo_{palco}.png`,
1081x1921 e 1081x85). Falta: posições exatas, fontes, cores e o logo CCXP26.

Uso: colar o bloco abaixo no Claude Desktop com o conector Adobe/Illustrator habilitado.
Se ele não conseguir operar o Illustrator instalado, deve parar e entregar o passo a
passo manual (fim deste arquivo).

---

## Prompt

Você vai extrair medidas de um arquivo do Illustrator para montar slides de sinalização
digital (CCXP26, programação por palco, tela 1080x1920 vertical). Entregue números
exatos, não estimativas. Se não conseguir medir algo, diga "não medido" e por quê.

**Arquivo original (não alterar):**
`C:\Users\direnzo\Documents\CLIENTES\CCXP\2026\Materiais\01_Template-Programacao-Dia\ABERTO\CCXP26_DS_programação_1080x1920.ai`

### Passo 1 - Criar o modelo de referência
1. Abra o original e use **Salvar como** (não sobrescreva):
   `...\01_Template-Programacao-Dia\ABERTO\CCXP26_DS_programação_modelo.ai`
2. No modelo mantenha **somente um palco** (Thunder) e só os 3 frames de conteúdo:
   ROLANDO AGORA, DAQUI A POUCO e AINDA HOJE. Remova os demais palcos e os frames de
   abertura/encerramento.
3. Garanta que as pranchetas tenham exatamente **1080 x 1920 px**, com posição inteira
   (os PNGs atuais saíram 1081x1921 com meio pixel de deslocamento). Informe o tamanho e
   a posição reais das pranchetas antes e depois.

### Passo 2 - Medir (no modelo; px na prancheta 1080x1920, origem no canto superior esquerdo)
Para cada elemento: `x, y, largura, altura` (limites geométricos, sem traço/sombra).
Para texto: caixa de texto + posição da **linha de base da 1ª linha** + fonte (nome
PostScript e estilo), tamanho (px), entrelinha (px), tracking, cor (hex), alinhamento,
caixa alta sim/não, número máximo de linhas e largura máxima.

**Frames ROLANDO AGORA e DAQUI A POUCO**
1. Título do frame ("ROLANDO AGORA" / "DAQUI A POUCO").
2. Área da foto (quadrado azul): caixa, raio de canto, borda.
3. Texto do horário (ex.: "13h30").
4. Texto da descrição (nome do painel): **máximo 3 linhas**; informe a caixa que comporta
   3 linhas e a largura máxima.

**Frame AINDA HOJE**
5. Título do frame ("AINDA HOJE").
6. As 5 linhas da lista. Para cada linha: quadrado branco da foto (caixa, borda), texto
   do horário (caixa) e texto da descrição (caixa; máx. de linhas). Informe também o
   passo vertical entre linhas e se é constante.

**Comum aos 3 frames**
7. Barra inferior: caixa e cor; logo CCXP26: caixa; relógio ("9:41"): caixa, fonte,
   tamanho, cor, alinhamento.
8. Ornamento do topo: caixa e altura útil (os PNGs `topo_*` já existem; confirmar que
   a posição é a mesma em todos os palcos).
9. Logo do palco: caixa (já está no fundo; só para referência).

### Passo 3 - Cores por palco (ler do ORIGINAL, sem alterá-lo)
Para cada um dos 6 palcos (Thunder, Blast!, Universe, Omni, Magic Market, Omelete):
cor de fundo, cor do título do frame, cor do horário, cor da descrição, cor do relógio
(hex). Se algum palco usar fonte, tamanho ou posição diferente do modelo, liste a
diferença.

### Passo 4 - Fontes
Liste cada fonte usada nos textos dinâmicos (título do frame, horário, descrição,
relógio): nome da família, estilo, nome PostScript e arquivo, e se o texto está em
contorno. Compare com a pasta `Materiais\00_Assets\Font` e diga qual arquivo corresponde.

### Passo 5 - Exports (pasta `...\01_Template-Programacao-Dia\Exports`)
- `layout-programacao.json` com a estrutura abaixo.
- `logo_ccxp26.svg` (e `.png` 2x) com fundo transparente, a partir da barra inferior.
- `modelo_anotado.png` 1080x1920: o frame AINDA HOJE com as caixas medidas desenhadas e
  numeradas, para conferência visual.
- **Não** exportar fundos nem ornamentos (já entregues).

```json
{
  "prancheta": { "w": 1080, "h": 1920 },
  "frames": {
    "rolando": {
      "titulo":    { "x": 0, "y": 0, "w": 0, "h": 0, "baselineY": 0, "fonte": "", "tamanho": 0, "entrelinha": 0, "tracking": 0, "alinhamento": "", "caixaAlta": true, "cor": "#000000" },
      "foto":      { "x": 0, "y": 0, "w": 0, "h": 0, "raio": 0 },
      "hora":      { "x": 0, "y": 0, "w": 0, "h": 0, "baselineY": 0, "fonte": "", "tamanho": 0, "cor": "#000000" },
      "descricao": { "x": 0, "y": 0, "w": 0, "h": 0, "maxLinhas": 3, "fonte": "", "tamanho": 0, "entrelinha": 0, "cor": "#000000" }
    },
    "daqui": { "...": "mesma estrutura de rolando" },
    "ainda": {
      "titulo": { "...": "como acima" },
      "passoY": 0,
      "linhas": [ { "foto": {}, "hora": {}, "descricao": {} } ]
    }
  },
  "comum": {
    "barra":   { "x": 0, "y": 0, "w": 0, "h": 0, "cor": "#000000" },
    "logo":    { "x": 0, "y": 0, "w": 0, "h": 0 },
    "relogio": { "x": 0, "y": 0, "w": 0, "h": 0, "fonte": "", "tamanho": 0, "alinhamento": "", "cor": "#FFFFFF" },
    "topo":    { "x": 0, "y": 0, "w": 0, "h": 0 }
  },
  "palcos": {
    "thunder": { "fundo": "#000000", "titulo": "#000000", "hora": "#000000", "descricao": "#000000", "relogio": "#000000" }
  },
  "fontes": [ { "uso": "", "familia": "", "estilo": "", "postscript": "", "arquivo": "" } ],
  "diferencasEntrePalcos": []
}
```

### Entrega final
Resumo curto: o que foi medido, o que ficou "não medido", diferenças entre palcos e
qualquer dúvida. Não invente valores.

---

## Fallback manual (Illustrator)

1. Abrir o original; **Salvar como** `CCXP26_DS_programação_modelo.ai`.
2. Apagar os palcos extras e os frames de abertura/encerramento.
3. Para cada elemento: selecionar, painel **Transformar** (X, Y, L, A; referência no
   canto superior esquerdo) e painel **Caractere** (fonte, tamanho, entrelinha, tracking).
4. Cores: conta-gotas e painel **Cor** (HEX).
5. Colar os valores no JSON acima e enviar.
