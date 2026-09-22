/**
 * preview.js - Futebol v25
 * Modo preview (extranet EdgeContents).
 *
 * ES5 obrigatorio (Android 7+ WebKit)
 */

function extranetView() {
    aplicarCores(CONFIG);

    function getPreviewLoader(realLoader) {
        return {
            loaded: function() {
                if (realLoader && typeof realLoader.loaded === 'function') {
                    realLoader.loaded();
                }
            },
            finished: function() {
                // Preview nao deve encerrar na extranet
            }
        };
    }

    function extractParentData() {
        var parentRef = null;
        var data = null;
        try { parentRef = window.parent; } catch (e) { parentRef = null; }
        if (!parentRef) { return null; }
        try { if (typeof parentRef.getTemplatePreviewData === 'function') { data = parentRef.getTemplatePreviewData(); } } catch (e1) {}
        if (!data) { try { if (parentRef.templatePreviewData) { data = parentRef.templatePreviewData; } } catch (e2) {} }
        if (!data) { try { if (parentRef.TEMPLATE_PREVIEW_DATA) { data = parentRef.TEMPLATE_PREVIEW_DATA; } } catch (e3) {} }
        return data || null;
    }

    function loadMockScript(callback) {
        if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) { callback(); return; }
        var s = document.createElement('script');
        s.src = 'js/mock-data.js';
        s.onload = function() { console.log('[v25][preview] mock-data.js carregado'); callback(); };
        s.onerror = function() { callback(); };
        document.head.appendChild(s);
    }

    // ── Fallback: carrega D_SPD (sem parâmetro) para config + mock aleatório ──
    function startPreviewWithSpdAndMock() {
        loadMockScript(function() {
            ebhtml.create2({}, function(loader) {
                loader.addData('D_SPD', false);
                loader.nodataiserror = false;
                loader.autoloaded    = false;
                loader.load(function() {
                    // Extrai sponsor (CONFIG=1) do D_SPD
                    var spdSponsor = null;
                    var lista = loader.datalist('D_SPD');
                    if (lista && lista.count() > 0) {
                        for (var i = 0; i < lista.count(); i++) {
                            var item = lista.get(i);
                            if (obterValor(item, 'CONFIG') === '1') {
                                spdSponsor = item;
                                break;
                            }
                        }
                    }

                    // Usa mock-data aleatório para o placar
                    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
                        // Sorteia novo cenário a cada chamada
                        var idx = Math.floor(Math.random() * CENARIOS_LISTA.length);
                        MOCK_DATA.cenario = CENARIOS_LISTA[idx];
                        var mockLoader = MOCK_DATA.getMockLoader();
                        var footballData = mockLoader.data('D_FOOTBALL');
                        if (!footballData) {
                            console.log('[placar_futebol][preview] mock sem D_FOOTBALL');
                            loader.finished();
                            return;
                        }

                        // Adapta campos do mock para o formato que processarDados espera
                        var spdItem = null;
                        var spdList = mockLoader.datalist('D_SPD');
                        if (spdList && spdList.count() > 0) {
                            for (var j = 0; j < spdList.count(); j++) {
                                var spdI = spdList.get(j);
                                if (spdI.CONFIG === '0' && spdI.TYPE === '10') {
                                    spdItem = spdI;
                                    break;
                                }
                            }
                        }

                        // Injeta TEXTO5 (status), TEXTO4 (rodada) e TEXTO2 (JSON mínimo) no footballData
                        if (!footballData.TEXTO5) { footballData.TEXTO5 = footballData.SUBTITULO3 || ''; }
                        if (!footballData.TEXTO4) { footballData.TEXTO4 = footballData.SUBTITULO2 || ''; }
                        if (!footballData.TEXTO2 && spdItem) {
                            var goalsH = spdItem.TEXT5 !== '' ? parseInt(spdItem.TEXT5, 10) : null;
                            var goalsA = spdItem.TEXT6 !== '' ? parseInt(spdItem.TEXT6, 10) : null;
                            var elapsed = spdItem.TEXT9 !== '' ? parseInt(spdItem.TEXT9, 10) : null;
                            var extra = spdItem.TEXT10 !== '' ? parseInt(spdItem.TEXT10, 10) : null;
                            footballData.TEXTO2 = JSON.stringify({
                                response: [{
                                    teams: {
                                        home: { id: 1, name: footballData.TITULO || '', logo: footballData.FOTO || '' },
                                        away: { id: 2, name: footballData.TITULO2 || '', logo: footballData.FOTO2 || '' }
                                    },
                                    fixture: {
                                        venue: { name: footballData.SUBTITULO || '' },
                                        status: { elapsed: elapsed, extra: extra, short: footballData.SUBTITULO3 || '' }
                                    },
                                    goals: { home: goalsH, away: goalsA },
                                    score: { penalty: { home: null, away: null } }
                                }]
                            });
                        }

                        console.log('[v25][preview] D_SPD config carregado');
                        processarDados(null, spdSponsor, footballData, null, null, getPreviewLoader(loader), 'preview');
                    } else {
                        console.log('[v25][preview] D_SPD config carregado, sem mock');
                        loader.finished();
                    }
                });
            });
        });
    }

    // ── Entry point ───────────────────────────────────────────────────────────
    var parentData = extractParentData();
    if (parentData) {
        console.log('[v25][preview] usando dados do frame pai');
        processarDados(null, null, parentData, null, null, getPreviewLoader(null), 'preview');
        return;
    }

    console.log('[v25][preview] carregando D_SPD + mock');
    startPreviewWithSpdAndMock();
}
