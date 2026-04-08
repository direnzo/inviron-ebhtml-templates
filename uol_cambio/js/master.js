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

    // ── Máximo de horas desde a atualização para o dado ser considerado válido ────
    // Cobre todos os fechamentos em BRT: Bovespa 18h, NASDAQ 21h, Londres 13:30h, Japão 03:30h
    var MAX_HORAS_VALIDO = 10;

    // ── Verifica se "YYYY-MM-DD HH:MM:SS" foi atualizado nas últimas MAX_HORAS_VALIDO ──
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

    // ── Mostra ou oculta uma linha pelo id ───────────────────────────────────────
    function visivel(rowId, mostrar) {
        var el = document.getElementById(rowId);
        if (!el) { return; }
        el.style.display = mostrar ? '' : 'none';
    }

    // ── Renderiza seta (▲▼) com cor — null = sem dado ────────────────────────
    function setSeta(id, val) {
        var el = document.getElementById(id);
        if (!el) { return; }
        if (val === null) { el.textContent = ''; return; }
        el.textContent = val >= 0 ? '▲' : '▼';
        el.style.color = corVariacao(val);
    }

    // ── Renderiza percentual com sinal e cor — null = exibe tracço ──────────────────
    function setPerc(id, val) {
        var el = document.getElementById(id);
        if (!el) { return; }
        if (val === null) { el.textContent = '—'; el.style.color = 'rgba(255,255,255,0.3)'; return; }
        el.textContent = (val >= 0 ? '+' : '') + toNumber(val) + '%';
        el.style.color = corVariacao(val);
    }

    // ── Renderiza valor monetário ─────────────────────────────────────────────
    function setVal(id, val) {
        var el = document.getElementById(id);
        if (!el) { return; }
        el.textContent = 'R$ ' + toNumber(val);
    }

    // ── Data e hora da atualização dos dados ─────────────────────────────────
    function renderizarDataHora(valorDados) {
        if (!dataHora) { return; }
        if (!valorDados) { dataHora.textContent = ''; return; }

        // Converte "YYYY-MM-DD HH:MM:SS" → "DD/MM/YYYY às HH:MM"
        var str = ('' + valorDados).trim();
        var partes = str.split(' ');
        var texto = str;

        if (partes.length >= 1 && partes[0].indexOf('-') !== -1) {
            var dateParts = partes[0].split('-');
            if (dateParts.length === 3) {
                texto = dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];
            }
            if (partes.length >= 2) {
                var hora = partes[1].substring(0, 5); // HH:MM
                texto = texto + ' às ' + hora;
            }
        }

        dataHora.textContent = 'Atualizado em: ' + texto;
    }

    // ── Ícones SVG por índice ────────────────────────────────────────────────
    // Bolsas: flags dos países; Moedas: badge com símbolo da moeda
    var ICONES = {
        // Brasil (Bovespa)
        'm1': '<svg class="icon-indicador" viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="14" fill="#009c3b"/><polygon points="10,1.5 18.5,7 10,12.5 1.5,7" fill="#ffdf00"/><circle cx="10" cy="7" r="3" fill="#002776"/></svg>',
        // EUA (NASDAQ)
        'm2': '<svg class="icon-indicador" viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="14" fill="#fff"/><rect y="2" width="20" height="2" fill="#B22234"/><rect y="6" width="20" height="2" fill="#B22234"/><rect y="10" width="20" height="2" fill="#B22234"/><rect width="8" height="8" fill="#3C3B6E"/></svg>',
        // Reino Unido (Londres)
        'm3': '<svg class="icon-indicador" viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="14" fill="#012169"/><line x1="0" y1="0" x2="20" y2="14" stroke="#fff" stroke-width="4"/><line x1="20" y1="0" x2="0" y2="14" stroke="#fff" stroke-width="4"/><line x1="0" y1="0" x2="20" y2="14" stroke="#C8102E" stroke-width="2.2"/><line x1="20" y1="0" x2="0" y2="14" stroke="#C8102E" stroke-width="2.2"/><rect x="8.5" width="3" height="14" fill="#fff"/><rect y="5.5" width="20" height="3" fill="#fff"/><rect x="9.25" width="1.5" height="14" fill="#C8102E"/><rect y="6.25" width="20" height="1.5" fill="#C8102E"/></svg>',
        // Japão (Nikkei)
        'm4': '<svg class="icon-indicador" viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="14" fill="#fff"/><circle cx="10" cy="7" r="4.2" fill="#BC002D"/></svg>',
        // Dólar (USD)
        'm5': '<svg class="icon-indicador" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="7" fill="#14532d"/><text x="7" y="10.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="8.5" font-weight="bold" fill="#4ade80">$</text></svg>',
        'm6': '<svg class="icon-indicador" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="7" fill="#14532d"/><text x="7" y="10.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="8.5" font-weight="bold" fill="#4ade80">$</text></svg>',
        // Euro (EUR)
        'm7': '<svg class="icon-indicador" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="7" fill="#1e3a8a"/><text x="7" y="10.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" font-weight="bold" fill="#93c5fd">&#x20AC;</text></svg>'
    };

    // ── Cria linha de bolsa com createElement (ES5, sem <template>) ──────────
    function criarLinhaBolsa(id, nome, ultimo) {
        var row = document.createElement('div');
        row.id = 'row-' + id;
        row.className = 'flex items-center justify-between py-[0.9vh]' + (ultimo ? '' : ' border-b-4 border-dotted border-white/10');

        var spanNome = document.createElement('span');
        spanNome.className = 'flex items-center gap-[0.4em] text-white/75 w-[50%]';
        spanNome.innerHTML = (ICONES[id] || '') + nome;

        var spanSeta = document.createElement('span');
        spanSeta.id = 'seta-' + id;
        spanSeta.className = 'font-montserrat-bold w-[10%] text-center text-[1.4em]';

        var spanPerc = document.createElement('span');
        spanPerc.id = 'perc-' + id;
        spanPerc.className = 'font-montserrat-bold w-[35%] text-right';

        row.appendChild(spanNome);
        row.appendChild(spanSeta);
        row.appendChild(spanPerc);
        return row;
    }

    // ── Cria linha de moeda com createElement (ES5, sem <template>) ──────────
    function criarLinhaMoeda(id, nome, ultimo) {
        var row = document.createElement('div');
        row.id = 'row-' + id;
        row.className = 'flex items-center gap-4 justify-between py-[0.9vh]' + (ultimo ? '' : ' border-b-4 border-dotted border-white/10');

        var spanNome = document.createElement('span');
        spanNome.className = 'flex items-center gap-[0.4em] text-white/75 w-[38%]';
        spanNome.innerHTML = (ICONES[id] || '') + nome;

        var spanSeta = document.createElement('span');
        spanSeta.id = 'seta-' + id;
        spanSeta.className = 'font-montserrat-bold w-[8%] text-center text-[1.4em]';

        var spanVal = document.createElement('span');
        spanVal.id = 'val-' + id;
        spanVal.className = 'font-montserrat-bold w-[27%] text-center text-nowrap';

        var spanPerc = document.createElement('span');
        spanPerc.id = 'perc-' + id;
        spanPerc.className = 'font-montserrat-bold w-[22%] text-right';

        row.appendChild(spanNome);
        row.appendChild(spanSeta);
        row.appendChild(spanVal);
        row.appendChild(spanPerc);
        return row;
    }

    // ── Renderiza todos os dados na tela ──────────────────────────────────────
    function renderizarTemplate(dados, loader) {
        renderizarDataHora(dados.datahora);

        var cBolsas = document.getElementById('container-bolsas');
        var cMoedas = document.getElementById('container-moedas');
        cBolsas.innerHTML = '';
        cMoedas.innerHTML = '';

        var bolsas = [
            { id: 'm1', nome: dados.m1_nome, varVal: dados.m1_var, atu: dados.m1_atualiza },
            { id: 'm2', nome: dados.m2_nome, varVal: dados.m2_var, atu: dados.m2_atualiza },
            { id: 'm3', nome: dados.m3_nome, varVal: dados.m3_var, atu: dados.m3_atualiza },
            { id: 'm4', nome: dados.m4_nome, varVal: dados.m4_var, atu: dados.m4_atualiza }
        ];

        var moedas = [
            { id: 'm5', nome: dados.m5_nome, varVal: dados.m5_var, valor: dados.m5_valor, atu: dados.m5_atualiza },
            { id: 'm6', nome: dados.m6_nome, varVal: dados.m6_var, valor: dados.m6_valor, atu: dados.m6_atualiza },
            { id: 'm7', nome: dados.m7_nome, varVal: dados.m7_var, valor: dados.m7_valor, atu: dados.m7_atualiza }
        ];

        var algumVisivel = false;

        for (var i = 0; i < bolsas.length; i++) {
            var b  = bolsas[i];
            var ok = dadoEhRecente(b.atu) && b.varVal !== null && b.varVal !== 0;
            if (!ok) { continue; }
            cBolsas.appendChild(criarLinhaBolsa(b.id, b.nome || b.id, false));
            setSeta('seta-' + b.id, b.varVal);
            setPerc('perc-' + b.id, b.varVal);
            algumVisivel = true;
        }

        for (var j = 0; j < moedas.length; j++) {
            var m   = moedas[j];
            var okM = dadoEhRecente(m.atu) && m.valor > 0 && m.varVal !== null;
            if (!okM) { continue; }
            cMoedas.appendChild(criarLinhaMoeda(m.id, m.nome || m.id, false));
            setSeta('seta-' + m.id, m.varVal);
            setVal ('val-'  + m.id, m.valor);
            setPerc('perc-' + m.id, m.varVal);
            algumVisivel = true;
        }

        // Se nenhum índice passou na validação, pula o template
        if (!algumVisivel) {
            console.warn('[uol_cambio] todos os indices ocultos — sem dados validos hoje');
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
                // Retorna float se campo vier preenchido, null se vazio/ausente
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
                m1_nome:     lerStr('M1_NOME'),
                m1_var:      lerNullable('M1_VAR'),
                m1_atualiza: lerStr('M1_ATUALIZA'),
                m2_nome:     lerStr('M2_NOME'),
                m2_var:      lerNullable('M2_VAR'),
                m2_atualiza: lerStr('M2_ATUALIZA'),
                m3_nome:     lerStr('M3_NOME'),
                m3_var:      lerNullable('M3_VAR'),
                m3_atualiza: lerStr('M3_ATUALIZA'),
                m4_nome:     lerStr('M4_NOME'),
                m4_var:      lerNullable('M4_VAR'),
                m4_atualiza: lerStr('M4_ATUALIZA'),
                m5_nome:     lerStr('M5_NOME'),
                m5_valor:    ler('M5_VALOR'),
                m5_var:      lerNullable('M5_VAR'),
                m5_atualiza: lerStr('M5_ATUALIZA'),
                m6_nome:     lerStr('M6_NOME'),
                m6_valor:    ler('M6_VALOR'),
                m6_var:      lerNullable('M6_VAR'),
                m6_atualiza: lerStr('M6_ATUALIZA'),
                m7_nome:     lerStr('M7_NOME'),
                m7_valor:    ler('M7_VALOR'),
                m7_var:      lerNullable('M7_VAR'),
                m7_atualiza: lerStr('M7_ATUALIZA'),
                datahora:    lerStr('DT_UPDATE')
            };

            renderizarTemplate(dados, loader);
        });
    });
};
