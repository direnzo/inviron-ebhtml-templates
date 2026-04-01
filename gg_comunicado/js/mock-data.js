// Mock data para desenvolvimento - gg_comunicado
// Campos: CATEGORY, TITULO, TEXTO1/2/3 (HTML editavel), IMAGEM1/2/3
// Em producao: comentar <script src="js/mock-data.js"> no index.html
//
// CENARIOS DE SLIDES:
//   idx 0  → só título                      → 1 slide full-text
//   idx 1  → 1 texto, 0 imagens             → 1 slide full-text
//   idx 2  → 2 textos, 0 imagens            → 2 slides full-text
//   idx 3  → 3 textos, 0 imagens            → 3 slides full-text
//   idx 4  → 0 textos, 1 imagem             → 1 slide full-image
//   idx 5  → 0 textos, 2 imagens            → 2 slides full-image
//   idx 6  → 0 textos, 3 imagens            → 3 slides full-image
//   idx 7  → 1 texto, 1 imagem              → 1 slide split
//   idx 8  → 2 textos, 1 imagem             → slide[0]=split, slide[1]=full-text
//   idx 9  → 1 texto, 2 imagens             → slide[0]=split, slide[1]=full-image
//   idx 10 → 2 textos, 2 imagens            → 2 slides split
//   idx 11 → 3 textos, 2 imagens            → split, split, full-text
//   idx 12 → 2 textos, 3 imagens            → split, split, full-image
//   idx 13 → só vídeo                       → 1 slide full-image (vídeo)
//   idx 14 → 1 texto + 1 vídeo              → 1 slide split (duração pelo vídeo)
//   idx 15 → CATEGORY vazia                 → fundo generico (fallback)
//   idx 16 → CATEGORY desconhecida          → fundo generico (fallback)

var MOCK_DATA = {
    enabled: true,
    dados: [

        // [0] só título — full-text, 1 slide
        {
            CATEGORY: 'selbgames',
            TITULO:   'SelbGames — Ranking Fevereiro 2025',
            TEXTO1:   '',
            TEXTO2:   '',
            TEXTO3:   '',
            IMAGEM1:  '',
            IMAGEM2:  '',
            IMAGEM3:  ''
        },

        // [1] 1 texto, 0 imagens — full-text, 1 slide
        {
            CATEGORY: 'comunicados',
            TITULO:   'Manutencao do sistema agendada para sabado a noite',
            TEXTO1:   '<p>Possivel indisponibilidade entre <strong>22h e 04h</strong>. Salve seus trabalhos antes desse horario.</p>',
            TEXTO2:   '',
            TEXTO3:   '',
            IMAGEM1:  '',
            IMAGEM2:  '',
            IMAGEM3:  ''
        },

        // [2] 2 textos, 0 imagens — full-text, 2 slides
        {
            CATEGORY: 'comunicados',
            TITULO:   'Novo fluxo de aprovacao de despesas a partir de abril',
            TEXTO1:   '<p>Todas as despesas acima de <strong>R$ 500</strong> precisam de aprovacao do gestor direto antes do lancamento no sistema.</p>',
            TEXTO2:   '<p>Acesse o formulario em: <strong>intranet/despesas</strong> usando seu login corporativo.</p>',
            TEXTO3:   '',
            IMAGEM1:  '',
            IMAGEM2:  '',
            IMAGEM3:  ''
        },

        // [3] 3 textos, 0 imagens — full-text, 3 slides
        {
            CATEGORY: 'noticias_internas',
            TITULO:   'Programa de bem-estar corporativo: academia, pilates e meditacao',
            TEXTO1:   '<p>A partir de abril, todos os colaboradores terao acesso ao <strong>Clube de Beneficios Selbetti</strong>.</p>',
            TEXTO2:   '<p>Modalidades disponíveis: academia, pilates, yoga, meditacao guiada e corrida de rua.</p>',
            TEXTO3:   '<p>Inscricoes abertas ate <strong>15 de abril</strong> pelo portal de RH.</p>',
            IMAGEM1:  '',
            IMAGEM2:  '',
            IMAGEM3:  ''
        },

        // [4] 0 textos, 1 imagem — full-image, 1 slide
        {
            CATEGORY: 'datas_comemorativas',
            TITULO:   'Feliz Dia do Trabalho!',
            TEXTO1:   '',
            TEXTO2:   '',
            TEXTO3:   '',
            IMAGEM1:  'https://picsum.photos/1280/720?random=10',
            IMAGEM2:  '',
            IMAGEM3:  ''
        },

        // [5] 0 textos, 2 imagens — full-image, 2 slides
        {
            CATEGORY: 'meetup',
            TITULO:   'Fotos do Meetup Março',
            TEXTO1:   '',
            TEXTO2:   '',
            TEXTO3:   '',
            IMAGEM1:  'https://picsum.photos/1280/720?random=20',
            IMAGEM2:  'https://picsum.photos/1280/720?random=21',
            IMAGEM3:  ''
        },

        // [6] 0 textos, 3 imagens — full-image, 3 slides
        {
            CATEGORY: 'meetup',
            TITULO:   'Galeria: Confraternizacao de Equipe',
            TEXTO1:   '',
            TEXTO2:   '',
            TEXTO3:   '',
            IMAGEM1:  'https://picsum.photos/1280/720?random=30',
            IMAGEM2:  'https://picsum.photos/1280/720?random=31',
            IMAGEM3:  'https://picsum.photos/1280/720?random=32'
        },

        // [7] 1 texto, 1 imagem — split, 1 slide
        {
            CATEGORY: 'cliente_no_centro',
            TITULO:   'Cliente no Centro: caso de sucesso',
            TEXTO1:   '<p>A equipe de Customer Success reduziu o tempo de resposta em <strong>40%</strong> com o novo processo de atendimento digital.</p>',
            TEXTO2:   '',
            TEXTO3:   '',
            IMAGEM1:  'https://picsum.photos/800/600?random=40',
            IMAGEM2:  '',
            IMAGEM3:  ''
        },

        // [8] 2 textos, 1 imagem — slide[0]=split(t1,i1), slide[1]=full-text(t2)
        {
            CATEGORY: 'historias_que_inspiram',
            TITULO:   'Historia de Sucesso: Fernanda Lima',
            TEXTO1:   '<p>Fernanda entrou como estagiaria em 2019 e hoje lidera o time de produto de uma das squads mais inovadoras da empresa.</p>',
            TEXTO2:   '<p>Seu segredo? <strong>"Curiosidade constante e colegas incriveis."</strong> Parabens, Fernanda! Voce e inspiracao para toda a equipe.</p>',
            TEXTO3:   '',
            IMAGEM1:  'https://picsum.photos/800/600?random=50',
            IMAGEM2:  '',
            IMAGEM3:  ''
        },

        // [9] 1 texto, 2 imagens — slide[0]=split(t1,i1), slide[1]=full-image(i2)
        {
            CATEGORY: 'noticias_internas',
            TITULO:   'Nova sede: primeiras imagens!',
            TEXTO1:   '<p>O novo escritorio fica pronto em maio. Espacos colaborativos, salas de descanso e cafe premium para todos os andares.</p>',
            TEXTO2:   '',
            TEXTO3:   '',
            IMAGEM1:  'https://picsum.photos/800/600?random=60',
            IMAGEM2:  'https://picsum.photos/800/600?random=61',
            IMAGEM3:  ''
        },

        // [10] 2 textos, 2 imagens — 2 slides split
        {
            CATEGORY: 'beneficios_selbetti',
            TITULO:   'Novidades no Pacote de Beneficios',
            TEXTO1:   '<p><strong>Gympass Premium</strong> disponivel a partir de maio para todos os colaboradores CLT sem custo adicional.</p>',
            TEXTO2:   '<p><strong>Plano Odontologico</strong> ampliado inclui ortodontia e procedimentos esteticos. Cadastro pelo portal RH.</p>',
            TEXTO3:   '',
            IMAGEM1:  'https://picsum.photos/800/600?random=70',
            IMAGEM2:  'https://picsum.photos/800/600?random=71',
            IMAGEM3:  ''
        },

        // [11] 3 textos, 2 imagens — split, split, full-text
        {
            CATEGORY: 'comunicados',
            TITULO:   'Novidades da Semana',
            TEXTO1:   '<p>Deploy da versao 3.2 do app realizado com sucesso. <strong>Zero downtime</strong> e feedback positivo dos clientes.</p>',
            TEXTO2:   '<p>Hackathon interno marcado para <strong>2 de maio</strong>. Formaçao de times ate o dia 25 de abril.</p>',
            TEXTO3:   '<p>Lembrete: pesquisa de clima encerra <strong>sexta-feira</strong>. Sua opiniao e fundamental!</p>',
            IMAGEM1:  'https://picsum.photos/800/600?random=80',
            IMAGEM2:  'https://picsum.photos/800/600?random=81',
            IMAGEM3:  ''
        },

        // [12] 2 textos, 3 imagens — split, split, full-image
        {
            CATEGORY: 'meetup',
            TITULO:   'Meetup Tecnologia — Cobertura Completa',
            TEXTO1:   '<p>Mais de 120 pessoas reunidas para o maior meetup interno de tecnologia do ano. Palestras, paineis e workshops sobre IA.</p>',
            TEXTO2:   '<p>Confira o resumo das principais palestras em <strong>intranet/meetup-tech-2025</strong>.</p>',
            TEXTO3:   '',
            IMAGEM1:  'https://picsum.photos/800/600?random=90',
            IMAGEM2:  'https://picsum.photos/800/600?random=91',
            IMAGEM3:  'https://picsum.photos/800/600?random=92'
        },

        // [13] só vídeo — full-image (vídeo), 1 slide
        {
            CATEGORY: 'comunicados',
            TITULO:   'Video institucional',
            TEXTO1:   '',
            TEXTO2:   '',
            TEXTO3:   '',
            IMAGEM1:  'img/853889-hd_1920_1080_25fps.mp4',
            IMAGEM2:  '',
            IMAGEM3:  ''
        },

        // [14] 1 texto + 1 vídeo — split, 1 slide (duração controlada pelo vídeo)
        {
            CATEGORY: 'historias_que_inspiram',
            TITULO:   'Depoimento: Jornada de crescimento',
            TEXTO1:   '<p>Confira o depoimento de quem viveu de perto a transformacao da nossa cultura organizacional nos ultimos dois anos.</p>',
            TEXTO2:   '',
            TEXTO3:   '',
            IMAGEM1:  'img/15086530_1920_1080_24fps.mp4',
            IMAGEM2:  '',
            IMAGEM3:  ''
        },

        // [15] CATEGORY vazia — deve usar fundo generico (comunicados.png)
        {
            CATEGORY: '',
            TITULO:   'Aviso geral sem categoria definida',
            TEXTO1:   '<p>Este comunicado nao possui categoria configurada. O fundo generico deve ser exibido automaticamente.</p>',
            TEXTO2:   '',
            TEXTO3:   '',
            IMAGEM1:  '',
            IMAGEM2:  '',
            IMAGEM3:  ''
        },

        // [16] CATEGORY desconhecida — deve usar fundo generico (comunicados.png)
        {
            CATEGORY: 'categoria_inexistente',
            TITULO:   'Comunicado com categoria nao mapeada',
            TEXTO1:   '<p>A categoria <strong>categoria_inexistente</strong> nao tem fundo proprio. O template deve exibir o fundo generico como fallback.</p>',
            TEXTO2:   '',
            TEXTO3:   '',
            IMAGEM1:  'https://picsum.photos/800/600?random=99',
            IMAGEM2:  '',
            IMAGEM3:  ''
        },

        // [17] TEXTO LONGO REAL (XML producao) — full-text, 1 slide; stress test do auto-fit
        {
            CATEGORY: 'comunicados',
            TITULO:   'Cafe',
            TEXTO1:   '<p>Informamos que não havera abastecimento de cafés e chás na Matriz ate o dia <strong>26/01/2026</strong>.</p><p><strong>Traga sua garrafa termica pessoal com café</strong> para repor sua energia durante o dia!</p><p>As máquinas de café estarao a disposicao. Se quiser, traga a cápsula de sua preferencia.</p><p>Por questoes de seguranca, <strong>nao e permitido o uso de chaleiras eletricas, cafeteiras ou garrafas termicas da Selbetti.</strong></p><p>Agradecemos sua compreensao.</p>',
            TEXTO2:   '',
            TEXTO3:   '',
            IMAGEM1:  '',
            IMAGEM2:  '',
            IMAGEM3:  ''
        }

    ]
};
