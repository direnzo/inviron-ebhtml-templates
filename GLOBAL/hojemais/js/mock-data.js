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
        duration: 15000       // Duração total em milissegundos (15 segundos)
    },
    
    // Dados principais (estrutura compatível com XML EdgeContents D_HOJEMAIS)
    // ⚠️ Campos em UPPERCASE para refletir estrutura real do XML
    dados: [
        {
            TITULO: "ATENDIMENTO ODONTOLÓGICO PELO SUS EM MS: ONDE PROCURAR E COMO ACESSAR OS SERVIÇOS",
            TEXTO: "O Sistema Único de Saúde oferece atendimento odontológico especializado em diversos municípios de Mato Grosso do Sul. Conheça as unidades disponíveis e como agendar sua consulta.",
            FOTO: "img/ref_01.png",
            CATEGORIA: "SAÚDE",
            LOGO_CUSTOM: "img/logo.png"
        },
        {
            TITULO: "CELULOSE CONSOLIDA FORÇA ECONÔMICA EM 2025 E AMPLIA PROTAGONISMO DE MS PARA 2026",
            TEXTO: "A indústria de celulose em Mato Grosso do Sul cresce exponencialmente. A Vale Celulose anuncia investimentos de R$ 5 bilhões para expansão da cadeia produtiva e geração de empregos.",
            FOTO: "img/ref_02.png",
            CATEGORIA: "ECONOMIA",
            LOGO_CUSTOM: "img/logo.png"
        },
        {
            TITULO: "BRASIL ANUNCIA NOVOS INVESTIMENTOS EM TECNOLOGIA",
            TEXTO: "O governo federal anunciou um pacote de investimentos de R$ 10 bilhões para o setor de tecnologia e inovação. O objetivo é impulsionar o desenvolvimento de startups brasileiras.",
            FOTO: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80",
            CATEGORIA: "TECNOLOGIA",
            LOGO_CUSTOM: "img/logo.png"
        },
        {
            TITULO: "SELEÇÃO BRASILEIRA GARANTE VAGA NA FINAL DA COPA",
            TEXTO: "Em jogo emocionante realizado no Maracanã, a seleção brasileira conquistou a vaga para a final após vitória de 3 a 1. Milhares de torcedores celebraram nas ruas.",
            FOTO: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1920&q=80",
            CATEGORIA: "ESPORTE",
            LOGO_CUSTOM: "img/logo.png"
        },
        {
            TITULO: "FESTIVAL DE CINEMA BRASILEIRO BATE RECORDE DE PÚBLICO",
            TEXTO: "O maior festival de cinema brasileiro encerrou sua 45ª edição com recorde de público. Mais de 200 mil pessoas compareceram aos cinemas durante os 10 dias de evento.",
            FOTO: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&q=80",
            CATEGORIA: "ENTRETENIMENTO",
            LOGO_CUSTOM: "img/logo.png"
        }
    ]
};
