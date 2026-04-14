window.onload = function () {

    var body     = document.querySelector('body');
    var dataHora = document.getElementById('data-hora');

    // ── Formata número com 4 casas decimais ──────────────────────────────────
    function toNumberAuto(value) {
        return Number(value).toFixed(4).replace('.', ',');
    }

    // ── Cor por direção de variação ───────────────────────────────────────────
    function corVariacao(val) {
        return val >= 0 ? '#4ade80' : '#f87171';
    }

    // ── Máximo de horas desde a atualização para o dado ser considerado válido ──
    var MAX_HORAS_VALIDO = 10;

    function dadoEhRecente(str) {
        if (!str) { return false; }
        var s = ('' + str).trim().replace('T', ' ');
        var partes = s.split(' ');
        if (partes.length < 2) { return false; }
        var d = partes[0].split('-');
        var h = partes[1].split(':');
        if (d.length < 3 || h.length < 2) { return false; }
        var dt = new Date(
            parseInt(d[0], 10),
            parseInt(d[1], 10) - 1,
            parseInt(d[2], 10),
            parseInt(h[0], 10),
            parseInt(h[1], 10),
            h[2] ? parseInt(h[2], 10) : 0
        );
        var diffMs = new Date() - dt;
        return diffMs >= 0 && diffMs <= MAX_HORAS_VALIDO * 3600000;
    }

    function setSeta(id, val) {
        var el = document.getElementById(id);
        if (!el) { return; }
        if (val === null) { el.textContent = ''; return; }
        el.textContent = val >= 0 ? '▲' : '▼';
        el.style.color = corVariacao(val);
    }

    function setPerc(id, val) {
        var el = document.getElementById(id);
        if (!el) { return; }
        if (val === null) { el.textContent = '—'; el.style.color = 'rgba(255,255,255,0.3)'; return; }
        el.textContent = (val >= 0 ? '+' : '') + Number(val).toFixed(3).replace('.', ',') + '%';
        el.style.color = corVariacao(val);
    }

    function setVal(id, val) {
        var el = document.getElementById(id);
        if (!el) { return; }
        el.textContent = 'R$ ' + toNumberAuto(val);
    }

    function setValCompra(id, val) {
        var el = document.getElementById(id);
        if (!el) { return; }
        if (val === null) { el.textContent = ''; return; }
        el.textContent = 'R$ ' + toNumberAuto(val);
    }

    function renderizarDataHora(valorDados) {
        if (!dataHora) { return; }
        if (!valorDados) { dataHora.textContent = ''; return; }
        var str = ('' + valorDados).trim();
        var partes = str.split(' ');
        var texto = str;
        if (partes.length >= 1 && partes[0].indexOf('-') !== -1) {
            var dateParts = partes[0].split('-');
            if (dateParts.length === 3) {
                texto = dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];
            }
            if (partes.length >= 2) {
                var hora = partes[1].substring(0, 5);
                texto = texto + ' às ' + hora;
            }
        }
        dataHora.textContent = 'Atualizado em: ' + texto;
    }

    var ICONES = {
        'm1': '<svg class="icon-indicador" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="7" fill="#14532d"/><text x="7" y="10.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="8.5" font-weight="bold" fill="#4ade80">$</text></svg>',
        'm2': '<svg class="icon-indicador" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="7" fill="#166534"/><text x="7" y="10.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="8.5" font-weight="bold" fill="#86efac">$</text></svg>',
        'm3': '<svg class="icon-indicador" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="7" fill="#1e3a8a"/><text x="7" y="10.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" font-weight="bold" fill="#93c5fd">&#x20AC;</text></svg>',
        'm4': '<svg class="icon-indicador" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="7" fill="#4c1d95"/><text x="7" y="10.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="8.5" font-weight="bold" fill="#c4b5fd">&#xA5;</text></svg>',
        'm5': '<svg class="icon-indicador" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="7" fill="#7c2d12"/><text x="7" y="10.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="8.5" font-weight="bold" fill="#fdba74">$</text></svg>',
        'm6': '<svg class="icon-indicador" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="7" fill="#78350f"/><text x="7" y="10.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" font-weight="bold" fill="#fcd34d">&#x00A3;</text></svg>'
    };

    function criarLinhaMoeda(id, nome, ultimo) {
        var row = document.createElement('div');
        row.id = 'row-' + id;
        row.className = 'flex items-center gap-4 justify-between py-[0.9vh]' + (ultimo ? '' : ' border-b-4 border-dotted border-white/10');

        var spanNome = document.createElement('span');
        spanNome.className = 'flex items-center gap-[0.4em] text-white/75 w-[35%]';
        spanNome.innerHTML = (ICONES[id] ? '<span class="empena:hidden flex-shrink-0">' + ICONES[id] + '</span>' : '') + nome;

        var spanSeta = document.createElement('span');
        spanSeta.id = 'seta-' + id;
        spanSeta.className = 'font-montserrat-bold w-[3%] text-center text-[1.4em] empena:hidden';

        var spanValCompra = document.createElement('span');
        spanValCompra.id = 'valcompra-' + id;
        spanValCompra.className = 'text-white/50 w-[22%] text-center text-nowrap text-[0.85em] portrait:hidden';

        var spanVal = document.createElement('span');
        spanVal.id = 'val-' + id;
        spanVal.className = 'font-montserrat-bold w-[22%] text-center text-nowrap';

        var spanPerc = document.createElement('span');
        spanPerc.id = 'perc-' + id;
        spanPerc.className = 'font-montserrat-bold w-[18%] text-right';

        row.appendChild(spanNome);
        row.appendChild(spanValCompra);
        row.appendChild(spanVal);
        row.appendChild(spanPerc);
        row.appendChild(spanSeta);
        return row;
    }

    function renderizarTemplate(dados, loader) {
        renderizarDataHora(dados.datahora);

        var cMoedas = document.getElementById('container-moedas');
        cMoedas.innerHTML = '';

        var moedas = [
            { id: 'm1', nome: dados.m1_nome, valor: dados.m1_valor, valorCompra: dados.m1_valor_compra, varVal: dados.m1_var, atu: dados.m1_atualiza },
            { id: 'm2', nome: dados.m2_nome, valor: dados.m2_valor, valorCompra: dados.m2_valor_compra, varVal: dados.m2_var, atu: dados.m2_atualiza },
            { id: 'm3', nome: dados.m3_nome, valor: dados.m3_valor, valorCompra: dados.m3_valor_compra, varVal: dados.m3_var, atu: dados.m3_atualiza },
            { id: 'm4', nome: dados.m4_nome, valor: dados.m4_valor, valorCompra: dados.m4_valor_compra, varVal: dados.m4_var, atu: dados.m4_atualiza },
            { id: 'm5', nome: dados.m5_nome, valor: dados.m5_valor, valorCompra: dados.m5_valor_compra, varVal: dados.m5_var, atu: dados.m5_atualiza },
            { id: 'm6', nome: dados.m6_nome, valor: dados.m6_valor, valorCompra: dados.m6_valor_compra, varVal: dados.m6_var, atu: dados.m6_atualiza }
        ];

        var algumVisivel = false;

        for (var i = 0; i < moedas.length; i++) {
            var m   = moedas[i];
            var okM = dadoEhRecente(m.atu) && m.valor > 0;
            if (!okM) { continue; }
            var ultimo = (i === moedas.length - 1);
            cMoedas.appendChild(criarLinhaMoeda(m.id, m.nome || m.id, ultimo));
            setSeta      ('seta-'      + m.id, m.varVal);
            setVal       ('val-'       + m.id, m.valor);
            setValCompra ('valcompra-' + m.id, m.valorCompra);
            setPerc      ('perc-'      + m.id, m.varVal);
            algumVisivel = true;
        }

        if (!algumVisivel) {
            console.warn('[mercado_financeiro] todos os indices ocultos — sem dados validos hoje');
            loader.finished();
            return;
        }

        body.classList.remove('opacity-0');
        body.classList.add('opacity-100');
        loader.loaded();

        setTimeout(function () {
            loader.finished();
        }, 10000);
    }

    // ── MOCK ─────────────────────────────────────────────────────────────────
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = {
            loaded:   function () { console.log('[Mock] loaded'); },
            finished: function () { console.log('[Mock] finished'); }
        };
        renderizarTemplate(MOCK_DATA.dados, mockLoader);
        return;
    }

    // ── EBHTML ───────────────────────────────────────────────────────────────
    ebhtml.create2({}, function (loader) {
        loader.addData('D_AWESOMEAPI', false);
        loader.autoloaded    = false;
        loader.nodataiserror = false;

        loader.load(function () {
            if (loader.data('D_AWESOMEAPI') == undefined) {
                console.error('[mercado_financeiro] sem dados');
                loader.finished();
                return;
            }

            var d = loader.data('D_AWESOMEAPI');

            function ler(campo) {
                try {
                    var node = d.value(campo);
                    if (node && node.value !== undefined && node.value !== null) {
                        return parseFloat(node.value) || 0;
                    }
                } catch (e) {}
                return 0;
            }

            function lerStr(campo) {
                try {
                    var node = d.value(campo);
                    if (node && node.value !== undefined && node.value !== null && node.value !== '') {
                        return '' + node.value;
                    }
                } catch (e) {}
                return '';
            }

            function lerNullable(campo) {
                try {
                    var node = d.value(campo);
                    if (node && node.value !== undefined && node.value !== null) {
                        var str = ('' + node.value).trim();
                        if (str === '') { return null; }
                        return parseFloat(str);
                    }
                } catch (e) {}
                return null;
            }

            var dados = {
                m1_nome:         lerStr('M1_NOME'),
                m1_valor:        ler('M1_VALOR'),
                m1_valor_compra: lerNullable('M1_VALOR_COMPRA'),
                m1_var:          lerNullable('M1_VAR'),
                m1_atualiza:     lerStr('M1_ATUALIZA'),

                m2_nome:         lerStr('M2_NOME'),
                m2_valor:        ler('M2_VALOR'),
                m2_valor_compra: lerNullable('M2_VALOR_COMPRA'),
                m2_var:          lerNullable('M2_VAR'),
                m2_atualiza:     lerStr('M2_ATUALIZA'),

                m3_nome:         lerStr('M3_NOME'),
                m3_valor:        ler('M3_VALOR'),
                m3_valor_compra: lerNullable('M3_VALOR_COMPRA'),
                m3_var:          lerNullable('M3_VAR'),
                m3_atualiza:     lerStr('M3_ATUALIZA'),

                m4_nome:         lerStr('M4_NOME'),
                m4_valor:        ler('M4_VALOR'),
                m4_valor_compra: lerNullable('M4_VALOR_COMPRA'),
                m4_var:          lerNullable('M4_VAR'),
                m4_atualiza:     lerStr('M4_ATUALIZA'),

                m5_nome:         lerStr('M5_NOME'),
                m5_valor:        ler('M5_VALOR'),
                m5_valor_compra: lerNullable('M5_VALOR_COMPRA'),
                m5_var:          lerNullable('M5_VAR'),
                m5_atualiza:     lerStr('M5_ATUALIZA'),

                m6_nome:         lerStr('M6_NOME'),
                m6_valor:        ler('M6_VALOR'),
                m6_valor_compra: lerNullable('M6_VALOR_COMPRA'),
                m6_var:          lerNullable('M6_VAR'),
                m6_atualiza:     lerStr('M6_ATUALIZA'),

                datahora:        lerStr('DT_UPDATE')
            };

            renderizarTemplate(dados, loader);
        });
    });
};
