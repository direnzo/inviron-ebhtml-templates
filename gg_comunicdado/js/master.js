// G&G Comunicado - master.js
// Template de comunicados institucionais - EdgeContents Digital Signage
// ES5 obrigatorio (Android 7+ WebKit)

window.onload = function() {

    var config = {
        duration: 10000,
        temFoto: true,
        fotoEsquerda: false
    };

    // ============================================================
    // DETECCAO DE MODO
    // ============================================================

    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var indice = Math.floor(Math.random() * MOCK_DATA.dados.length);
        var itemSelecionado = MOCK_DATA.dados[indice];
        console.log('[Mock] Indice: ' + indice + ' | Editoria: ' + itemSelecionado.TEXTO1);

        var mockLoader = {
            loaded:   function() { console.log('[Mock] loaded'); },
            finished: function() { console.log('[Mock] finished'); }
        };

        iniciarTemplate(itemSelecionado, config, mockLoader);

    } else {
        ebhtml.create2({}, function(loader) {
            loader.addData('D_COMUNICADO', false);
            loader.autoloaded    = false;
            loader.nodataiserror = false;

            loader.load(function() {
                if (loader.data('D_COMUNICADO') == undefined) {
                    console.error('[gg_comunicdado] Sem dados no canal D_COMUNICADO');
                    loader.finished();
                    return;
                }
                var dados = processarDados(loader);
                iniciarTemplate(dados, config, loader);
            });
        });
    }

    // ============================================================
    // FUNCOES
    // ============================================================

    function processarDados(loader) {
        var item = loader.data('D_COMUNICADO');
        return {
            TITULO: item.value('TITULO').value,
            FOTO:   item.value('FOTO').value,
            TEXTO1: item.value('TEXTO1').value,
            TEXTO2: item.value('TEXTO2').value,
            TEXTO3: item.value('TEXTO3').value,
            TEXTO4: item.value('TEXTO4').value,
            TEXTO5: item.value('TEXTO5').value,
            TEXTO6: item.value('TEXTO6').value,
            TEXTO7: item.value('TEXTO7').value,
            TEXTO8: item.value('TEXTO8').value
        };
    }

    function aplicarFundo(templateId) {
        var fundoImg = document.getElementById('fundo');
        if (!fundoImg) return;

        var id = String(templateId || '1');
        var fundosMap = {
            '1': 'Fundo_comunicado.png',
            '2': 'Fundo_Meetup.png',
            '3': 'Fundo_Selbnews.png'
        };

        fundoImg.src = 'img/' + (fundosMap[id] || fundosMap['1']);
    }

    function aplicarEstilos(dados) {
        var textoBox = document.getElementById('texto-box');
        var titulo   = document.getElementById('titulo');
        var editoria = document.getElementById('editoria');

        textoBox.style.backgroundColor = dados.TEXTO2 || 'rgba(0,0,0,0.40)';
        titulo.style.color             = dados.TEXTO3 || '#FFFFFF';

        if (dados.TEXTO1 && dados.TEXTO1 !== '') {
            editoria.textContent           = dados.TEXTO1;
            editoria.style.backgroundColor = dados.TEXTO4 || 'rgba(0,0,0,0.60)';
            editoria.style.color           = dados.TEXTO5 || '#FFFFFF';
            editoria.style.opacity         = '1';
            editoria.style.padding         = '6px 16px';
            editoria.style.display         = 'block';
        } else {
            editoria.style.display = 'none';
        }
    }

    function aplicarLayout(temFoto, fotoEsquerda) {
        var textoContainer  = document.getElementById('texto-container');
        var fotoContainer   = document.getElementById('foto-container');
        var layoutContainer = textoContainer.parentElement;

        if (!temFoto) {
            fotoContainer.style.display = 'none';
            textoContainer.classList.remove('w-1/2', 'ps-12');
            textoContainer.classList.add('w-full', 'px-24');
            textoContainer.classList.remove('-translate-x-full');
            textoContainer.classList.add('translate-y-8');
        } else if (fotoEsquerda) {
            layoutContainer.classList.add('flex-row-reverse');
            textoContainer.classList.remove('-translate-x-full');
            textoContainer.classList.add('translate-x-full');
            fotoContainer.classList.remove('translate-x-full');
            fotoContainer.classList.add('-translate-x-full');
        }
    }

    function carregarMascaras(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'js/masks.svg', true);

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var container = document.createElement('div');
                    container.id             = 'svg-masks-container';
                    container.style.position = 'absolute';
                    container.style.width    = '0';
                    container.style.height   = '0';
                    container.style.overflow = 'hidden';
                    container.innerHTML      = xhr.responseText;
                    document.body.appendChild(container);
                } else {
                    console.warn('[Masks] Falha ao carregar masks.svg (status ' + xhr.status + ')');
                }
                if (callback) callback();
            }
        };

        xhr.onerror = function() {
            console.error('[Masks] Erro de rede ao carregar masks.svg');
            if (callback) callback();
        };

        xhr.send();
    }

    function selecionarMascara(dados) {
        if (dados.TEXTO8 && dados.TEXTO8 !== '' && dados.TEXTO8 !== 'null') {
            return dados.TEXTO8;
        }
        return null;
    }

    function aplicarMascaraSVG(elemento, maskId) {
        if (!maskId) return;

        if (!document.getElementById(maskId)) {
            console.warn('[Masks] ID nao encontrado: ' + maskId + '. Fallback: mask-circle');
            maskId = 'mask-circle';
        }

        elemento.style.setProperty('clip-path', 'url(#' + maskId + ')');
        elemento.style.setProperty('-webkit-clip-path', 'url(#' + maskId + ')');
    }

    function fitFontSize(tituloElement, containerElement, minFontSize, padding) {
        minFontSize = minFontSize || 12;
        padding     = padding     || 50;

        var fontSize     = parseInt(window.getComputedStyle(tituloElement).fontSize);
        var targetHeight = containerElement.offsetHeight - padding;
        var iteracoes    = 0;

        while (iteracoes < 300) {
            if (tituloElement.scrollHeight <= targetHeight || fontSize <= minFontSize) break;
            fontSize -= 1;
            tituloElement.style.fontSize = fontSize + 'px';
            iteracoes++;
        }
    }

    function iniciarTemplate(dados, cfg, loader) {
        var body           = document.body;
        var titulo         = document.getElementById('titulo');
        var foto           = document.getElementById('foto');
        var textoContainer = document.getElementById('texto-container');
        var textoBox       = document.getElementById('texto-box');
        var fotoContainer  = document.getElementById('foto-container');

        var temFoto      = !!(dados.FOTO && dados.FOTO !== '');
        var fotoEsquerda = dados.TEXTO7 === true || dados.TEXTO7 === 'true' || cfg.fotoEsquerda === true;

        if (cfg.temFoto === false) temFoto = false;

        titulo.textContent = dados.TITULO;

        aplicarFundo(dados.TEXTO6);
        aplicarEstilos(dados);
        aplicarLayout(temFoto, fotoEsquerda);

        setTimeout(function() {
            fitFontSize(titulo, textoBox, 12, 50);
        }, 200);

        if (!temFoto) {
            body.classList.remove('opacity-0');
            body.classList.add('opacity-100');

            setTimeout(function() {
                textoContainer.classList.remove('opacity-0', 'translate-y-8');
                textoContainer.classList.add('opacity-100', 'translate-y-0');
            }, 300);

            loader.loaded();

            setTimeout(function() {
                loader.finished();
            }, cfg.duration);

        } else {
            carregarMascaras(function() {
                var maskId = selecionarMascara(dados);
                if (maskId) aplicarMascaraSVG(foto, maskId);
                foto.src = dados.FOTO;
            });

            foto.onload = function() {
                body.classList.remove('opacity-0');
                body.classList.add('opacity-100');

                setTimeout(function() {
                    textoContainer.classList.remove(
                        'opacity-0',
                        fotoEsquerda ? 'translate-x-full' : '-translate-x-full'
                    );
                    textoContainer.classList.add('opacity-100', 'translate-x-0');
                }, 300);

                setTimeout(function() {
                    fotoContainer.classList.remove(
                        'opacity-0',
                        fotoEsquerda ? '-translate-x-full' : 'translate-x-full'
                    );
                    fotoContainer.classList.add('opacity-100', 'translate-x-0');
                }, 500);

                loader.loaded();

                setTimeout(function() {
                    loader.finished();
                }, cfg.duration);
            };

            foto.onerror = function() {
                console.error('[gg_comunicdado] Erro ao carregar foto: ' + dados.FOTO);
                loader.finished();
            };
        }
    }

};
