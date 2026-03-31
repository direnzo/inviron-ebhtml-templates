// Mock data para desenvolvimento - gg_comunicdado
// Campos: TITULO, FOTO, TEXTO1(editoria), TEXTO2(cor fundo), TEXTO3(cor texto),
//         TEXTO4(cor fundo editoria), TEXTO5(cor texto editoria),
//         TEXTO6(id fundo), TEXTO7(foto esquerda), TEXTO8(mascara SVG)
// Em producao: comentar <script src="js/mock-data.js"> no index.html

var MOCK_DATA = {
    enabled: true,
    dados: [
        // Noticia 1: Seguranca do Trabalho
        {
            TITULO: 'Atenção: Inspeção de Segurança do Trabalho acontece esta semana. Todos os colaboradores devem estar com EPI em dia!',
            FOTO: 'https://picsum.photos/800/600?random=1',
            TEXTO1: 'NOTÍCIA',
            TEXTO2: '',                      
            TEXTO3: '#FFFFFF',                      
            TEXTO4: '#1E88E5',                      
            TEXTO5: '#FFFFFF',                       da editoria
            TEXTO6: '1',                            
            TEXTO7: false,                          
            TEXTO8: ''                              
        },
        // Notícia 2: Novo Processo de RH
        {
            TITULO: 'Novo processo de avaliação de desempenho começa em março. Reunião informativa para todos os gerentes acontece na próxima semana!',
            FOTO: 'https://picsum.photos/800/600?random=101',
            TEXTO1: 'NOTÍCIA',
            TEXTO2: '',
            TEXTO3: '#FFFFFF',
            TEXTO4: '#1E88E5',
            TEXTO5: '#FFFFFF',
            TEXTO6: '1',
            TEXTO7: true
            
        },
        // Notícia 3: Sistema Administrativo
        {
            TITULO: 'Manutenção do sistema administrativo está agendada para sábado à noite. Possível indisponibilidade entre 22h e 04h.',
            FOTO: 'https://picsum.photos/800/600?random=102',
            TEXTO1: 'NOTÍCIA',
            TEXTO2: '',
            TEXTO3: '#FFFFFF',
            TEXTO4: '#1E88E5',
            TEXTO5: '#FFFFFF',
            TEXTO6: '1',
            TEXTO7: false
            
        },
        // Notícia 4: Programa de Bem-estar
        {
            TITULO: 'Novo programa de bem-estar com academia, pilates e meditação já está disponível! Inscrições abertas para todos os colaboradores.',
            FOTO: 'https://picsum.photos/800/600?random=103',
            TEXTO1: 'NOTÍCIA',
            TEXTO2: '',
            TEXTO3: '#FFFFFF',
            TEXTO4: '#1E88E5',
            TEXTO5: '#FFFFFF',
            TEXTO6: '1',
            TEXTO7: true
            
        },

        
        // Comunicado 1: Happy Hour
        {
            TITULO: 'HOJE! Happy Hour de Confraternização às 18h na Área de Lazer - Atualize sua comunicação no Slack!',
            FOTO: '',
            TEXTO1: 'COMUNICADO',
            TEXTO2: '',                      
            TEXTO3: '#FFFFFF',                      
            TEXTO4: '#EF4444',                      
            TEXTO5: '#FFFFFF',                      
            TEXTO6: '2',                            
            TEXTO7: false
            
        },
        // Comunicado 2: Greve de Transportes
        {
            TITULO: 'ATENÇÃO: Previsão de greve nos transportes amanhã. Trabalhe de home office se possível. Más condições de circulação esperadas.',
            FOTO: '',
            TEXTO1: 'COMUNICADO',
            TEXTO2: '',
            TEXTO3: '#FFFFFF',
            TEXTO4: '#EF4444',
            TEXTO5: '#FFFFFF',
            TEXTO6: '2',
            TEXTO7: false
            
        },
        // Comunicado 3: Fechamento Antecipado
        {
            TITULO: 'Comunicado Importante: A empresa fechará antecipadamente no próximo feriado (quinta-feira). Todos devem sair até as 14h.',
            FOTO: '',
            TEXTO1: 'COMUNICADO',
            TEXTO2: '',
            TEXTO3: '#FFFFFF',
            TEXTO4: '#EF4444',
            TEXTO5: '#FFFFFF',
            TEXTO6: '2',
            TEXTO7: false
            
        },

        // DATAS COMEMORATIVAS (3 registros - 7 a 9)
        // Data Comemorativa 1: Dia da Mulher
        {
            TITULO: 'Dia Internacional da Mulher - Celebramos a força, coragem e dedicação de todas as mulheres que fazem a Selbetti ser grande!',
            FOTO: 'https://picsum.photos/800/600?random=201',
            TEXTO1: 'DATA COMEMORATIVA',
            TEXTO2: '',                      // Rosa quente
            TEXTO3: '#FFFFFF',
            TEXTO4: '#F472B6',                      // Rosa claro
            TEXTO5: '#FFFFFF',
            TEXTO6: '3',
            TEXTO7: false
            
        },
        // Data Comemorativa 2: Dia da Segurança
        {
            TITULO: 'Dia da Segurança do Trabalho - Proteção e cuidado com você é nossa prioridade! Todos com EPI, todos seguros!',
            FOTO: 'https://picsum.photos/800/600?random=202',
            TEXTO1: 'DATA COMEMORATIVA',
            TEXTO2: '',                      // Vermelho vibrante
            TEXTO3: '#FFFFFF',
            TEXTO4: '#F87171',                      
            TEXTO5: '#FFFFFF',
            TEXTO6: '3',
            TEXTO7: true,
            TEXTO8: 'mask-chevron'                  // Máscara SVG
        },
        // Data Comemorativa 3: Dia do Amigo
        {
            TITULO: 'Dia Internacional da Amizade - Obrigado por ser mais que colega, você é amigo! Vamos celebrar isso juntos hoje!',
            FOTO: 'https://picsum.photos/800/600?random=203',
            TEXTO1: 'DATA COMEMORATIVA',
            TEXTO2: '',                      // Cyan
            TEXTO3: '#FFFFFF',
            TEXTO4: '#22D3EE',                      // Cyan claro
            TEXTO5: '#FFFFFF',
            TEXTO6: '3',
            TEXTO7: false
            
        },

        // MEETUPS (5 registros - 10 a 14)
        // Meetup 1: Convite Dezembro
        {
            TITULO: 'Meetup Dezembro - Convite: "Compulsão: quando o desejo ultrapassa a razão" com psicóloga Ellen Zimmermann. Próxima quinta-feira às 08h30.',
            FOTO: 'https://picsum.photos/800/600?random=301',
            TEXTO1: 'MEETUP',
            TEXTO2: '',                      // Laranja meetup
            TEXTO3: '#FFFBEB',
            TEXTO4: '#FB923C',                      // Laranja claro
            TEXTO5: '#FFFFFF',
            TEXTO6: '2',
            TEXTO7: false
            
        },
        // Meetup 2: Resumo Novembro
        {
            TITULO: 'Meetup Novembro - Resumo do encontro sobre "Compulsão": Participaram 47 colaboradores online. Confira a gravação no Uniselbetti!',
            FOTO: 'https://picsum.photos/800/600?random=302',
            TEXTO1: 'MEETUP',
            TEXTO2: '',
            TEXTO3: '#FFFBEB',
            TEXTO4: '#FB923C',
            TEXTO5: '#FFFFFF',
            TEXTO6: '2',
            TEXTO7: true
            
        },
        // Meetup 3: Convite Outubro
        {
            TITULO: 'Próximo Meetup: "Inovação e Transformação Digital na Indústria 4.0" - Palestrante: Fernando Costa (especialista em tecnologia). 15 de outubro.',
            FOTO: 'https://picsum.photos/800/600?random=303',
            TEXTO1: 'MEETUP',
            TEXTO2: '',
            TEXTO3: '#FFFBEB',
            TEXTO4: '#FB923C',
            TEXTO5: '#FFFFFF',
            TEXTO6: '2',
            TEXTO7: false
            
        },
        // Meetup 4: Resumo setembro
        {
            TITULO: 'Meetup Setembro - Retrospectiva: "Liderança Inspiradora" teve 52 participantes. Obrigado pela participação! Próximo em outubro.',
            FOTO: 'https://picsum.photos/800/600?random=304',
            TEXTO1: 'MEETUP',
            TEXTO2: '',
            TEXTO3: '#FFFBEB',
            TEXTO4: '#FB923C',
            TEXTO5: '#FFFFFF',
            TEXTO6: '2',
            TEXTO7: true
            
        },
        // Meetup 5: Convite Agosto
        {
            TITULO: 'Convite Especial: Meetup Agosto com tema "Burnout e Qualidade de Vida" - Convidado: Dr. Marcelo Silva (Psiquiatra). 20 de agosto às 13h.',
            FOTO: 'https://picsum.photos/800/600?random=305',
            TEXTO1: 'MEETUP',
            TEXTO2: '',
            TEXTO3: '#FFFBEB',
            TEXTO4: '#FB923C',
            TEXTO5: '#FFFFFF',
            TEXTO6: '2',
            TEXTO7: false
            
        },

        
        
        

        // HISTÓRIAS QUE INSPIRAM SELBETTI (2 registros - 15 a 16)
        // Histórias 1: Profissional Destaque
        {
            TITULO: 'Histórias que Inspiram: Maria Silva começou como estagiária há 5 anos e hoje é Gerente de Projetos. "Acreditei no meu potencial e a Selbetti acreditou junto comigo"',
            FOTO: 'https://picsum.photos/800/600?random=401',
            TEXTO1: 'HISTÓRIAS QUE INSPIRAM',
            TEXTO2: '',                      // Verde Selbetti
            TEXTO3: '#E8F5E9',
            TEXTO4: '#22C55E',
            TEXTO5: '#0D3D1F',
            TEXTO6: '1',
            TEXTO7: false
            
        },
        // Histórias 2: Superação
        {
            TITULO: 'Histórias que Inspiram: João retornou de licença médica e foi reinserido com sucesso no time de TI. "Senti o suporte e a inclusão da empresa em cada passo"',
            FOTO: 'https://picsum.photos/800/600?random=402',
            TEXTO1: 'HISTÓRIAS QUE INSPIRAM',
            TEXTO2: '',
            TEXTO3: '#E8F5E9',
            TEXTO4: '#22C55E',
            TEXTO5: '#0D3D1F',
            TEXTO6: '1',
            TEXTO7: true
            
        },

        // SOU EMBAIXADOR DA CULTURA (2 registros - 17 a 18)
        // Embaixador 1: Inovação
        {
            TITULO: 'Sou Embaixador da Cultura: Ana Paula promove inovação diária através de workshops "Pensar Fora da Caixa" toda semana. Valor: Cliente no Centro!',
            FOTO: 'https://picsum.photos/800/600?random=501',
            TEXTO1: 'EMBAIXADOR DA CULTURA',
            TEXTO2: '',                      // Teal
            TEXTO3: '#CCFBF1',
            TEXTO4: '#14B8A6',
            TEXTO5: '#0F766E',
            TEXTO6: '3',
            TEXTO7: false
            
        },
        // Embaixador 2: Integridade
        {
            TITULO: 'Sou Embaixador da Cultura: Roberto é exemplo de Integridade com suas ações éticas. Construiu confiança com fornecedores e clientes há 10 anos!',
            FOTO: 'https://picsum.photos/800/600?random=502',
            TEXTO1: 'EMBAIXADOR DA CULTURA',
            TEXTO2: '',
            TEXTO3: '#CCFBF1',
            TEXTO4: '#14B8A6',
            TEXTO5: '#0F766E',
            TEXTO6: '3',
            TEXTO7: true
            
        },

        // CLIENTE NO CENTRO (2 registros - 19 a 20)
        // Cliente no Centro 1: Case Sucesso
        {
            TITULO: 'Cliente no Centro: Implementação da solução Selbetti para Cia. ABC resultou em aumento de 40% na produtividade e redução de 25% em custos operacionais!',
            FOTO: 'https://picsum.photos/800/600?random=601',
            TEXTO1: 'CLIENTE NO CENTRO',
            TEXTO2: '',                      // Azul caso de sucesso
            TEXTO3: '#E0F2FE',
            TEXTO4: '#38BDF8',
            TEXTO5: '#0C4A6E',
            TEXTO6: '3',
            TEXTO7: false
            
        },
        // Cliente no Centro 2: Case 2
        {
            TITULO: 'Cliente no Centro: Empresa XYZ conseguiu reduzir tempo de setup em 60% com sistema integrado Selbetti. Satisfação do cliente: 98%!',
            FOTO: 'https://picsum.photos/800/600?random=602',
            TEXTO1: 'CLIENTE NO CENTRO',
            TEXTO2: '',
            TEXTO3: '#E0F2FE',
            TEXTO4: '#38BDF8',
            TEXTO5: '#0C4A6E',
            TEXTO6: '3',
            TEXTO7: true
            
        },

        // BENEFÍCIOS SELBETTI (2 registros - 21 a 22)
        // Benefícios 1: Plano Saúde
        {
            TITULO: 'Benefícios Selbetti: "O plano de saúde completo da Selbetti foi essencial quando meu pai precisou de atendimento urgente. Fui muito bem atendido!"',
            FOTO: 'https://picsum.photos/800/600?random=701',
            TEXTO1: 'BENEFÍCIOS SELBETTI',
            TEXTO2: '',                      // Roxo
            TEXTO3: '#F3E8FF',
            TEXTO4: '#A855F7',
            TEXTO5: '#FFFFFF',
            TEXTO6: '1',
            TEXTO7: false
            
        },
        // Benefícios 2: Vale Alimentação
        {
            TITULO: 'Benefícios Selbetti: Vale alimentação e refeição me permite alimentar minha família com qualidade. Estou grato pela generosidade da empresa!',
            FOTO: 'https://picsum.photos/800/600?random=702',
            TEXTO1: 'BENEFÍCIOS SELBETTI',
            TEXTO2: '',
            TEXTO3: '#F3E8FF',
            TEXTO4: '#A855F7',
            TEXTO5: '#FFFFFF',
            TEXTO6: '1',
            TEXTO7: true
            
        },

        // SELBGAMES | DESAFIO DO ENGAJAMENTO (2 registros - 23 a 24)
        // SelbGames Engajamento 1: Ranking Fevereiro
        {
            TITULO: 'SelbGames | Desafio do Engajamento - Fevereiro: 🥇 Carlos (TI) | 🥈 Beatriz (Vendas) | 🥉 Lucas (Administrativo) | Parabéns aos campeões!',
            FOTO: '',
            TEXTO1: 'SELBGAMES ENGAJAMENTO',
            TEXTO2: '',                      // Dourado
            TEXTO3: '#FFFBEB',
            TEXTO4: '#FBBF24',
            TEXTO5: '#FFFFFF',
            TEXTO6: '3',
            TEXTO7: false
            
        },
        // SelbGames Engajamento 2: Ranking Janeiro
        {
            TITULO: 'SelbGames | Desafio do Engajamento - Janeiro: 🥇 Patricia (RH) | 🥈 Fernando (Logística) | 🥉 Sofia (Financeiro) | Próximo ranking em março!',
            FOTO: '',
            TEXTO1: 'SELBGAMES ENGAJAMENTO',
            TEXTO2: '',
            TEXTO3: '#FFFBEB',
            TEXTO4: '#FBBF24',
            TEXTO5: '#FFFFFF',
            TEXTO6: '3',
            TEXTO7: false
            
        },

        // SELBGAMES | DESAFIO LÍDERES ESTRATÉGICOS (2 registros - 25 a 26)
        // SelbGames Líderes 1: Ranking Líderes Fevereiro
        {
            TITULO: 'SelbGames | Líderes Estratégicos - Fevereiro: 🥇 Diretor Executivo (90 pontos) | 🥈 Gerente de Operações (85 pontos) | 🥉 Supervisor de TI (78 pontos)',
            FOTO: '',
            TEXTO1: 'SELBGAMES LÍDERES',
            TEXTO2: '',                      // Roxo Games
            TEXTO3: '#F3E8FF',
            TEXTO4: '#A78BFA',
            TEXTO5: '#FFFFFF',
            TEXTO6: '1',
            TEXTO7: false
            
        },
        // SelbGames Líderes 2: Ranking Líderes Janeiro
        {
            TITULO: 'SelbGames | Líderes Estratégicos - Janeiro: 🥇 Gerente de Projetos (88 pontos) | 🥈 Diretor Executivo (86 pontos) | 🥉 Gerente de RH (80 pontos)',
            FOTO: '',
            TEXTO1: 'SELBGAMES LÍDERES',
            TEXTO2: '',
            TEXTO3: '#F3E8FF',
            TEXTO4: '#A78BFA',
            TEXTO5: '#FFFFFF',
            TEXTO6: '1',
            TEXTO7: false
            
        },

        // SELBGAMES | DESAFIO DO CONHECIMENTO (1 registro - 27)
        // SelbGames Conhecimento: Ranking Trimestral
        {
            TITULO: 'SelbGames | Desafio do Conhecimento - Trimestral (Jan-Mar): 🥇 Marina - 28 treinamentos | 🥈 Ricardo - 24 treinamentos | 🥉 Juliana - 21 treinamentos',
            FOTO: '',
            TEXTO1: 'SELBGAMES CONHECIMENTO',
            TEXTO2: '',                      // Azul escuro Games
            TEXTO3: '#DBEAFE',
            TEXTO4: '#3B82F6',
            TEXTO5: '#FFFFFF',
            TEXTO6: '1',
            TEXTO7: false
            
        },

        // COMPLEMENTO: MAIS 2 QUADROS ESPECIAIS (28 a 29)
        // Promoção Interna
        {
            TITULO: 'Conhece alguém que merecia uma chance? Inscreve no Programa de Promoção Interna até próxima sexta!',
            FOTO: 'https://picsum.photos/800/600?random=801',
            TEXTO1: 'OPORTUNIDADE',
            TEXTO2: '',
            TEXTO3: '#E8F5E9',
            TEXTO4: '#22C55E',
            TEXTO5: '#0D3D1F',
            TEXTO6: '3',
            TEXTO7: true
            
        },
        // Resultado de Projeto
        {
            TITULO: 'Projeto INOVAÇÃO 2026 superou meta em 150%! Parabéns a todos os envolvidos - vem confraternização!',
            FOTO: 'https://picsum.photos/800/600?random=802',
            TEXTO1: 'RESULTADO',
            TEXTO2: '',
            TEXTO3: '#DBEAFE',
            TEXTO4: '#16A34A',
            TEXTO5: '#FFFFFF',
            TEXTO6: '1',
            TEXTO7: false
            
        },
        
        
        
        {
            TITULO: 'Teste de Máscara SVG: Estrela aplicada via TEXTO8.',
            FOTO: 'https://picsum.photos/800/600?random=901',
            TEXTO1: 'TESTE MÁSCARA',
            TEXTO6: '1',
            TEXTO8: 'mask-star-5'
        },
        {
            TITULO: 'Teste de Máscara SVG: Hexágono aplicado via TEXTO8.',
            FOTO: 'https://picsum.photos/800/600?random=902',
            TEXTO1: 'TESTE MÁSCARA',
            TEXTO6: '1',
            TEXTO8: 'mask-hexagon'
        },
        {
            TITULO: 'Teste de Máscara SVG: Chevron aplicado via TEXTO8.',
            FOTO: 'https://picsum.photos/800/600?random=903',
            TEXTO1: 'TESTE MÁSCARA',
            TEXTO6: '1',
            TEXTO8: 'mask-chevron'
        },
        {
            TITULO: 'Meetup Mensal: Vamos conversar sobre Inovação? Participe do nosso encontro na próxima sexta!',
            FOTO: 'https://picsum.photos/800/600?random=904',
            TEXTO1: 'MEETUP',
            TEXTO6: '2',
            TEXTO8: 'mask-bubble-right'
        }
    ]
};

