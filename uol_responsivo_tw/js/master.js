window.onload = function () {

    var image = document.querySelector('#image');
    var image2 = document.querySelector('#image2');
    var title = document.querySelector('#title');
    var titleContainer = document.querySelector('#titleContainer');
    var text = document.querySelector('#description');
    var textContent = document.querySelector('#descriptionContainer');
    var credit = document.querySelector('#credit');
    var body = document.querySelector('body');

    function isWebkit() {
        return 'WebkitAppearance' in document.documentElement.style;
    }

    function isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }

    if (isWebkit() || isAndroid()) {
        document.body.classList.add('no-expand');
    }

    function renderizarTemplate(dados) {
        title.innerHTML = dados.TITULO.toUpperCase();
        text.innerHTML = dados.TEXTO;
        credit.innerHTML = dados.IMAGECREDIT;

        if (title && titleContainer) {
            fitDescriptionFont(title, titleContainer, 6);
        }
        if (text && textContent) {
            fitDescriptionFont(text, textContent, 6);
        }

        mudaCor(dados.EDITORIA);

        body.classList.remove('opacity-0');
        body.classList.add('opacity-100');

        var aspectRatio = window.innerWidth / window.innerHeight;
        var isEmpena = aspectRatio <= (1 / 2);
        var isPortrait = aspectRatio <= (3 / 4);

        if (isEmpena || isPortrait) {
            image.classList.remove('empena:object-left', 'portrait:object-left', 'scale-110');
            image.classList.add('object-right');
        } else {
            image.classList.add('scale-110');
        }
    }

    function carregarImagem(imageUrl, loader) {
        image.src = imageUrl;
        image2.src = imageUrl;

        image.onload = function () {
            loader.loaded();
            setTimeout(function () {
                loader.finished();
            }, 15000);
        };

        image.onerror = function () {
            console.error('Erro ao carregar imagem: ' + imageUrl);
            loader.finished();
        };
    }

    // --- Modo mock (desenvolvimento local) ---
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = {
            loaded: function () { console.log('[Mock] loaded'); },
            finished: function () { console.log('[Mock] finished'); }
        };
        renderizarTemplate(MOCK_DATA.dados);
        carregarImagem(MOCK_DATA.dados.FOTO, mockLoader);
        return;
    }

    // --- Modo EdgeContents ---
    ebhtml.create2({}, function (loader) {
        loader.addData('D_UOL');
        loader.nodataiserror = false;
        loader.autoloaded = false;

        loader.load(function () {
            if (loader.data('D_UOL') == undefined) {
                console.error('D_UOL: sem dados');
                loader.finished();
                return;
            }

            var dados = {
                TITULO:      loader.data('D_UOL').value('TITULO').value,
                TEXTO:       loader.data('D_UOL').value('TEXTO').value,
                IMAGECREDIT: loader.data('D_UOL').value('IMAGECREDIT').value,
                FOTO:        loader.data('D_UOL').value('FOTO').value,
                EDITORIA:    loader.data('D_UOL').value('EDITORIA').value
            };

            renderizarTemplate(dados);
            carregarImagem(dados.FOTO, loader);
        });
    });
};

function mudaCor(editoria) {
    var cor = 'rgba(252, 201, 8, 0.7)';
    switch (editoria) {
        case 'ESPORTE':
        case 'FUTEBOL':
            cor = 'rgba(50, 168, 82, 0.7)';
            break;
        case 'POLÍTICA':
        case 'INTERNACIONAL':
            cor = 'rgba(171, 2, 2, 0.7)';
            break;
        case 'ECONOMIA':
            cor = 'rgba(13, 25, 186, 0.7)';
            break;
        case 'EDUCAÇÃO':
            cor = 'rgba(13, 123, 186, 0.7)';
            break;
        case 'TECNOLOGIA':
            cor = 'rgba(172, 186, 13, 0.7)';
            break;
        case 'COTIDIANO':
            cor = 'rgba(154, 13, 186, 0.7)';
            break;
        case 'ENTRETENIMENTO':
        case 'TELEVISÃO':
            cor = 'rgba(186, 74, 13, 0.7)';
            break;
        case 'MÚSICA':
            cor = 'rgba(245, 239, 0, 0.7)';
            break;
        case 'CELEBRIDADES':
            cor = 'rgba(186, 13, 172, 0.7)';
            break;
        default:
            cor = 'rgba(252, 201, 8, 0.7)';
            break;
    }
    var fundoTitulo = document.querySelector('#titleContainer');
    fundoTitulo.style.backgroundColor = cor;
}

// Ajusta o tamanho da fonte até o conteúdo caber no container
function fitDescriptionFont(descriptionDiv, containerDiv, minFontSize) {
    minFontSize = minFontSize || 12;
    var fontSize = parseInt(window.getComputedStyle(descriptionDiv).fontSize);
    var containerMaxHeight = parseInt(window.getComputedStyle(containerDiv).maxHeight) || containerDiv.offsetHeight;
    while (
        (containerDiv.scrollHeight > containerMaxHeight || descriptionDiv.scrollHeight > containerMaxHeight) &&
        fontSize > minFontSize
    ) {
        fontSize -= 1;
        descriptionDiv.style.fontSize = fontSize + 'px';
    }
}

// Recarrega ao redimensionar para reaplicar breakpoints Tailwind por aspect-ratio
window.addEventListener('resize', function () {
    location.reload();
});