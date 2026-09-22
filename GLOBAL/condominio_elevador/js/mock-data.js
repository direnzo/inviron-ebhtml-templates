/**
 * Mock de desenvolvimento — condominio_elevador
 * Simula dados de comunicados de síndico para condôminos.
 * Desabilitar (enabled: false) em produção.
 */

var MOCK_DATA = {
    enabled: true,
    datasets: {
        'D_CONFIG': [
            {
                NOME_CONDOMINIO: 'CORPORATE CENTER',
                VIDEO_LOOPS: '1',
                VIDEO1: 'img/anuncio10s.mp4',
                // VIDEO2: 'img/anuncio12s.mp4',
                VIDEO3: 'img/anuncio15s.mp4'
            }
        ],
        'D_COMUNICADOS': [
            {
                EDITORIA: 'SEGURANÇA',
                TITULO: 'Novo Protocolo de Acesso para Visitantes e Prestadores',
                TEXTO: 'A partir de 18 de agosto, todos os visitantes e prestadores de serviço deverão realizar o pré-cadastro pelo portal do condomínio com mínimo de 2 horas de antecedência. O acesso será liberado mediante apresentação de documento com foto na recepção. Crachás provisórios são obrigatórios em todas as áreas comuns.',
                DATA: '14 de agosto de 2026'
            },
            {
                EDITORIA: 'MANUTENÇÃO',
                TITULO: 'Paralisação Programada dos Elevadores na Torre B',
                TEXTO: 'Informamos que os elevadores sociais da Torre B passarão por manutenção preventiva obrigatória no dia 19 de agosto, das 08h às 17h. Durante o período, os elevadores de serviço estarão disponíveis para uso compartilhado. Planeje suas atividades com antecedência e conte com a compreensão de todos.',
                DATA: '12 de agosto de 2026'
            },
            {
                EDITORIA: 'COMPLIANCE',
                TITULO: 'Política de Uso das Salas de Reunião',
                TEXTO: 'O sistema de reserva de salas de reunião foi atualizado. Cancelamentos devem ser feitos com no mínimo 1 hora de antecedência para não gerar bloqueio de agenda. Salas não ocupadas 15 minutos após o horário reservado serão liberadas automaticamente para outros locatários. Respeite o tempo do próximo.',
                DATA: '10 de agosto de 2026'
            },
            {
                EDITORIA: 'LIMPEZA',
                TITULO: 'Higienização Profunda dos Lobbies e Áreas de Convivência',
                TEXTO: 'Toda semana, nas quartas-feiras das 19h às 23h, será realizada a higienização profunda dos lobbies, halls de elevador e áreas de convivência. Solicitamos que ambientes sejam deixados organizados ao final do expediente. A colaboração das empresas é fundamental para manter o padrão do edifício.',
                DATA: '8 de agosto de 2026'
            },
            {
                EDITORIA: 'AVISOS',
                TITULO: 'Simulado de Evacuação pela Brigada de Incêndio 2026',
                TEXTO: 'O simulado obrigatório de evacuação do edifício ocorrerá no dia 22 de agosto às 10h. Ao sinal do alarme, todos devem seguir imediatamente as rotas de saída sinalizadas e se dirigir ao ponto de encontro no estacionamento externo. A participação é compulsória por exigência do Corpo de Bombeiros e do seguro predial.',
                DATA: '5 de agosto de 2026'
            }
        ]
    }
};

/* ──────────────────────────────────────────────────────────────
   Shim EBHTML — intercepta ebhtml.create2 para injetar dados mock
   mantendo loader.loaded() e loader.finished() REAIS do ebhtml.js.
   Requer que ebhtml.js seja carregado ANTES deste script.
   ────────────────────────────────────────────────────────────── */
(function () {
    if (typeof MOCK_DATA === 'undefined' || !MOCK_DATA.enabled) { return; }
    if (typeof window.ebhtml === 'undefined' || typeof window.ebhtml.create2 !== 'function') {
        console.warn('[Mock] ebhtml.js nao encontrado — shim ignorado');
        return;
    }

    console.log('[Mock] condominio_elevador — interceptando create2 (loaded/finished reais)');

    var _realCreate2 = window.ebhtml.create2;

    window.ebhtml.create2 = function (opts, cb) {
        _realCreate2.call(window.ebhtml, opts, function (loader) {

            /* Substitui apenas load/data/datalist; loaded() e finished() permanecem reais */
            loader.load = function (done, error) {
                loader.data = function (name) {
                    var ds = MOCK_DATA.datasets && MOCK_DATA.datasets[name];
                    if (!ds) { return undefined; }
                    var rec = Object.prototype.toString.call(ds) === '[object Array]' ? ds[0] : ds;
                    if (!rec) { return undefined; }
                    return {
                        value: function (field) {
                            return { value: rec[field] != null ? String(rec[field]) : '' };
                        }
                    };
                };

                loader.datalist = function (name) {
                    var ds = MOCK_DATA.datasets && MOCK_DATA.datasets[name];
                    var list = Object.prototype.toString.call(ds) === '[object Array]' ? ds : [];
                    return {
                        count: function () { return list.length; },
                        get: function (i) {
                            var rec = list[i] || {};
                            return {
                                value: function (field) {
                                    return { value: rec[field] != null ? String(rec[field]) : '' };
                                }
                            };
                        }
                    };
                };

                if (typeof done === 'function') { done(); }
            };

            cb(loader);
        });
    };
}());
