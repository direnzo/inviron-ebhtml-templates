Plano para Unificação Modular dos Templates “caminhos_futebol” e “segundafase_futebol”

---

## 1. Objetivo
Unificar os dois templates em um só, com uma flag em D_SPD para alternar entre os modos de exibição (brackets/cards), mantendo suporte a cor e patrocinador para ambos.

---

## 2. Estrutura de Arquivos

COPA_2026/segundafase_futebol/
│
├── js/
│   ├── utils.js         // Funções utilitárias (parse, cor, patrocinador, helpers DOM)
│   ├── brackets.js      // Lógica do modo chaveamento (brackets)
│   ├── cards.js         // Lógica do modo cards grandes
│   └── master.js        // Carregamento, controle de modo, integração
│
├── index.html           // Ordem dos scripts: utils → brackets → cards → master
├── css/
├── img/
└── README.md            // Documentação do template unificado

---

## 3. Padrão de Campos em D_SPD

- MODO: 'brackets' ou 'cards'
- COR_FUNDO: cor de fundo principal
- COR_TEXTO: cor do texto principal
- PATROCINADOR_NOME: nome do patrocinador
- PATROCINADOR_LOGO: URL da imagem do patrocinador
- TEMA: (opcional) nome do tema visual
- FASE_ATUAL: (opcional) nome da fase exibida

---

## 4. Utilitários (utils.js)

window.Utils = {
    getCorFundo: function(d_spd) { ... },
    getCorTexto: function(d_spd) { ... },
    getPatrocinadorNome: function(d_spd) { ... },
    getPatrocinadorLogo: function(d_spd) { ... },
    aplicaCor: function(element, cor) { ... },
    aplicaCorTexto: function(element, cor) { ... },
    aplicaPatrocinador: function(element, nome, logo) { ... }
    // ...outros helpers
};

---

## 5. Organização dos Objetos Globais

- Brackets: Brackets.render(loader, config)
- Cards: Cards.render(loader, config)
- Utils: centraliza acesso a D_SPD e manipulação visual padrão

---

## 6. Padrão de Uso nos Modos

var d_spd = loader.data('D_SPD');
var corFundo = Utils.getCorFundo(d_spd);
var corTexto = Utils.getCorTexto(d_spd);
var patrocinadorNome = Utils.getPatrocinadorNome(d_spd);
var patrocinadorLogo = Utils.getPatrocinadorLogo(d_spd);

Utils.aplicaCor(document.body, corFundo);
Utils.aplicaCorTexto(document.body, corTexto);
Utils.aplicaPatrocinador(document.getElementById('patrocinador'), patrocinadorNome, patrocinadorLogo);

---

## 7. Fluxo de Execução (master.js)

window.onload = function() {
    ebhtml.create2({}, function(loader) {
        loader.addData('D_SPD', false);
        loader.load(function() {
            var d_spd = loader.data('D_SPD');
            var modo = d_spd.value('MODO') ? d_spd.value('MODO').value : 'cards';
            var config = {};
            if (modo === 'brackets') {
                Brackets.render(loader, config);
            } else {
                Cards.render(loader, config);
            }
        });
    });
};

---

## 8. Checklist de Verificação

- Alternar a flag MODO em D_SPD alterna corretamente entre os modos
- Cor e patrocinador são aplicados em ambos os modos, sempre via utilitários
- Não há duplicidade de funções
- Testes em todos os dispositivos e formatos de tela
- README.md atualizado com exemplos de configuração de D_SPD

---

## 9. Padronizações Gerais

- Campos D_SPD sempre em maiúsculas, sem acento
- Funções globais encapsuladas em objetos
- Acesso a dados e manipulação visual sempre via utilitários
- Comentários breves e diretos
- Exemplos de configuração no README
