/**
 * MOCK DATA - Dados de teste para desenvolvimento
 * 
 * IMPORTANTE: 
 * 1. Descomente <script src="js/mock-data.js"></script> no HTML para usar
 * 2. Altere enabled para false em produção
 * 3. Campos em UPPERCASE para compatibilidade com XML EdgeContents
 */

var MOCK_DATA = {
    // Ativar/desativar modo de desenvolvimento
    enabled: true,  // Alterar para false em produção
    
    // Configurações gerais do template
    config: {
        duration: 5000,       // Duração total em milissegundos (5 segundos)
        slideTime: 3000,      // Tempo de cada slide (3 segundos)
        maxItems: 10,         // Máximo de itens a exibir
        showLogo: true,       // Exibir logo final
        autoplay: true        // Iniciar automaticamente
    },
    
    // Dados principais (estrutura compatível com XML EdgeContents)
    // ⚠️ Campos em UPPERCASE para refletir estrutura real do XML
    dados: [
        {
            TITULO: "Primeira Notícia de Teste",
            TEXTO: "Esta é a descrição completa do primeiro item de exemplo para desenvolvimento e testes.",
            FOTO1: "img/exemplo1.jpg",
            FOTO2: "img/exemplo1-thumb.jpg",
            COR: "#3b82f6",
            CATEGORIA: "Tecnologia",
            DATA: "2026-02-06",
            AUTOR: "Sistema",
            ATIVO: "true"
        },
        {
            TITULO: "Segunda Notícia de Teste",
            TEXTO: "Esta é a descrição completa do segundo item de exemplo para desenvolvimento e testes.",
            FOTO1: "img/exemplo2.jpg",
            FOTO2: "img/exemplo2-thumb.jpg",
            COR: "#9333ea",
            CATEGORIA: "Geral",
            DATA: "2026-02-05",
            AUTOR: "Sistema",
            ATIVO: "true"
        },
        {
            TITULO: "Terceira Notícia de Teste",
            TEXTO: "Esta é a descrição completa do terceiro item de exemplo para desenvolvimento e testes.",
            FOTO1: "img/exemplo3.jpg",
            FOTO2: "img/exemplo3-thumb.jpg",
            COR: "#f97316",
            CATEGORIA: "Esportes",
            DATA: "2026-02-04",
            AUTOR: "Sistema",
            ATIVO: "true"
        }
    ],
    
    // Alertas (array simples de strings)
    alertas: [
        {
            TITULO: "ALERTA URGENTE",
            TEXTO: "Primeiro alerta de teste do sistema",
            COR: "#dc2626",
            PRIORIDADE: "1"
        },
        {
            TITULO: "AVISO IMPORTANTE",
            TEXTO: "Segundo alerta de teste do sistema",
            COR: "#f59e0b",
            PRIORIDADE: "2"
        },
        {
            TITULO: "INFORMAÇÃO",
            TEXTO: "Terceiro alerta de teste do sistema",
            COR: "#3b82f6",
            PRIORIDADE: "3"
        }
    ],
    
    // Clima
    clima: [
        {
            TITULO: "São Paulo",
            TEXTO: "Parcialmente nublado",
            NUMERO: "25",  // Temperatura
            FOTO1: "img/clima-nublado.png",
            DATA: "2026-02-06"
        }
    ],
    
    // Agenda/Eventos
    agenda: [
        {
            TITULO: "Reunião de Equipe",
            TEXTO: "Discussão sobre novos projetos",
            DATAHORA: "2026-02-06 14:00:00",
            LOCAL: "Sala de Conferências A"
        },
        {
            TITULO: "Apresentação de Resultados",
            TEXTO: "Apresentação trimestral",
            DATAHORA: "2026-02-07 10:00:00",
            LOCAL: "Auditório Principal"
        }
    ]
};
