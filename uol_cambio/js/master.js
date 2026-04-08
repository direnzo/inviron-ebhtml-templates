window.onload = function () {

    var body     = document.querySelector('body');
    var dataHora = document.getElementById('data-hora');

    // ── Formata número para 2 decimais com vírgula ────────────────────────────
    function toNumber(value) {
        return Number(value).toFixed(2).toString().replace('.', ',');
    }

    // ── Cor por direção de variação ───────────────────────────────────────────
    function corVariacao(val) {
        return val >= 0 ? '#4ade80' : '#f87171'; // green-400 / red-400
    }

    // ── Renderiza seta (▲▼) com cor ──────────────────────────────────────────
    function setSeta(id, val) {
        var el = document.getElementById(id);
        if (!el) { return; }
        el.textContent = val >= 0 ? '▲' : '▼';
        el.style.color = corVariacao(val);
    }

    // ── Renderiza percentual com sinal e cor ──────────────────────────────────
    function setPerc(id, val) {
        var el = document.getElementById(id);
        if (!el) { return; }
        el.textContent = (val >= 0 ? '+' : '') + toNumber(val) + '%';
        el.style.color = corVariacao(val);
    }

    // ── Renderiza valor monetário ─────────────────────────────────────────────
    function setVal(id, val) {
        var el = document.getElementById(id);
        if (!el) { return; }
        el.textContent = 'R$ ' + toNumber(val);
    }

    // ── Data e hora atual ─────────────────────────────────────────────────────
    function renderizarDataHora() {
        if (!dataHora) { return; }
        var d   = new Date();
        var dia = d.getDate() < 10 ? '0' + d.getDate() : '' + d.getDate();
        var mes = (d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : '' + (d.getMonth() + 1);
        var h   = d.getHours()   < 10 ? '0' + d.getHours()   : '' + d.getHours();
        var m   = d.getMinutes() < 10 ? '0' + d.getMinutes() : '' + d.getMinutes();
        dataHora.textContent = dia + '/' + mes + '/' + d.getFullYear() + '  ' + h + ':' + m;
    }

    // ── Renderiza todos os dados na tela ──────────────────────────────────────
    function renderizarTemplate(dados, loader) {
        renderizarDataHora();

        setSeta('seta-bovespa',  dados.m1_var);
        setPerc('perc-bovespa',  dados.m1_var);

        setSeta('seta-nasdaq',   dados.m2_var);
        setPerc('perc-nasdaq',   dados.m2_var);

        setSeta('seta-londres',  dados.m3_var);
        setPerc('perc-londres',  dados.m3_var);

        setSeta('seta-japao',    dados.m4_var);
        setPerc('perc-japao',    dados.m4_var);

        setSeta('seta-dolar-com', dados.m5_var);
        setVal ('val-dolar-com',  dados.m5_valor);
        setPerc('perc-dolar-com', dados.m5_var);

        setSeta('seta-dolar-tur', dados.m6_var);
        setVal ('val-dolar-tur',  dados.m6_valor);
        setPerc('perc-dolar-tur', dados.m6_var);

        setSeta('seta-euro',  dados.m7_var);
        setVal ('val-euro',   dados.m7_valor);
        setPerc('perc-euro',  dados.m7_var);

        body.classList.remove('opacity-0');
        body.classList.add('opacity-100');
        loader.loaded();

        setTimeout(function () {
            loader.finished();
        }, 10000);
    }

    // ── MOCK ──────────────────────────────────────────────────────────────────
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = {
            loaded:   function () { console.log('[Mock] loaded'); },
            finished: function () { console.log('[Mock] finished'); }
        };
        renderizarTemplate(MOCK_DATA.dados, mockLoader);
        return;
    }

    // ── EBHTML ────────────────────────────────────────────────────────────────
    ebhtml.create2({}, function (loader) {
        loader.addData('D_CAMBIO', false);
        loader.autoloaded    = false;
        loader.nodataiserror = false;

        loader.load(function () {
            if (loader.data('D_CAMBIO') == undefined) {
                console.error('[uol_cambio] sem dados');
                loader.finished();
                return;
            }

            var d = loader.data('D_CAMBIO');

            function ler(campo) {
                try {
                    var node = d.value(campo);
                    if (node && node.value !== undefined && node.value !== null) {
                        return parseFloat(node.value) || 0;
                    }
                } catch (e) {}
                return 0;
            }

            var dados = {
                m1_var:   ler('m1_var'),
                m2_var:   ler('m2_var'),
                m3_var:   ler('m3_var'),
                m4_var:   ler('m4_var'),
                m5_valor: ler('m5_valor'),
                m5_var:   ler('m5_var'),
                m6_valor: ler('m6_valor'),
                m6_var:   ler('m6_var'),
                m7_valor: ler('m7_valor'),
                m7_var:   ler('m7_var')
            };

            renderizarTemplate(dados, loader);
        });
    });
};
