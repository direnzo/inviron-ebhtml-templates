window.onload = function () {

    var image = document.querySelector('#image');
    var title = document.querySelector('#title');
    var titleContainer = document.querySelector('#titleContainer');
    var description = document.querySelector('#description');
    var descriptionContainer = document.querySelector('#descriptionContainer');
    var body = document.querySelector('body');
    var categoryText = document.querySelector('#categoryText');
    var categoryTag = document.querySelector('#categoryTag');
    var clientLogo = document.querySelector('#clientLogo');
    
    // Elementos geométricos
    var mainShape = document.querySelector('#mainShape');
    var secondaryShape = document.querySelector('#secondaryShape');
    var tertiaryShape = document.querySelector('#tertiaryShape');

    // Detectar modo mock ou EdgeContents
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        // Modo mock para desenvolvimento
        console.log('[MOCK] Modo de desenvolvimento ativado');
        
        var mockLoader = {
            loaded: function() { console.log('[MOCK] Carregado'); },
            finished: function() { console.log('[MOCK] Finalizado'); }
        };
        
        // Usar primeiro item do mock-data
        var dados = MOCK_DATA.dados[0];
        iniciarTemplate(dados, MOCK_DATA.config, mockLoader);
        
    } else {
        // Modo EdgeContents produção
        ebhtml.create2({}, function (loader) {

            loader.addData('D_HOJEMAIS');
            loader.nodataiserror = false;
            loader.autoloaded = false;
            
            loader.load(function () {
                
                if (loader.data('D_HOJEMAIS') == undefined) {
                    console.error('ERRO: Sem dados no dataset D_HOJEMAIS');
                    loader.finished();
                    return;
                }
                
                var dados = {
                    TITULO: loader.data('D_HOJEMAIS').value('TITULO').value,
                    TEXTO: loader.data('D_HOJEMAIS').value('TEXTO').value,
                    FOTO: loader.data('D_HOJEMAIS').value('FOTO').value,
                    CATEGORIA: loader.data('D_HOJEMAIS').value('CATEGORIA').value,
                    LOGO_CUSTOM: loader.data('D_HOJEMAIS').value('LOGO_CUSTOM').value || 'img/logo.png'
                };
                
                var config = { duration: 15000 };
                
                iniciarTemplate(dados, config, loader);
            });
        });
    }

    function iniciarTemplate(dados, config, loader) {
        
        title.innerHTML = dados.TITULO.toUpperCase();
        description.innerHTML = dados.TEXTO;
        categoryText.innerHTML = dados.CATEGORIA.toUpperCase();
        
        // Atualizar logo do cliente se disponível
        if (dados.LOGO_CUSTOM) {
            clientLogo.src = dados.LOGO_CUSTOM;
        }
        
        // Ajustar fontes para caber no container
        if (title && titleContainer) {
            fitDescriptionFont(title, titleContainer, 24);
        }
        if (description && descriptionContainer) {
            fitDescriptionFont(description, descriptionContainer, 14);
        }

        var imageUrl = dados.FOTO;
        image.src = imageUrl;

        image.onload = function () {
            
            loader.loaded();

            setTimeout(function () {
                loader.finished();
            }, config.duration);
        };

        image.onerror = function () {
            console.error('Erro ao carregar imagem');
            loader.finished();
        };

        // Aplicar cores dinâmicas baseadas na categoria
        aplicarCoresPorCategoria(dados.CATEGORIA);
        
        body.classList.remove('opacity-0');
        body.classList.add('opacity-100');

        // Animação Ken Burns na imagem
        image.classList.add('scale-110');
    }

    function isWebkit() {
        return 'WebkitAppearance' in document.documentElement.style;
    }

    function isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }

    if (isWebkit() || isAndroid()) {
        document.body.classList.add('no-expand');
    }
};

function aplicarCoresPorCategoria(categoria) {
    var mainShape = document.querySelector('#mainShape');
    var secondaryShape = document.querySelector('#secondaryShape');
    var tertiaryShape = document.querySelector('#tertiaryShape');
    var categoryTag = document.querySelector('#categoryTag');
    
    var corPrincipal = '#8B0000'; // vermelho escuro (default)
    var corSecundaria = '#A52A2A'; // vermelho médio
    var corTerciaria = '#CD5C5C'; // vermelho claro
    var corTag = '#6A0DAD'; // roxo
    
    switch (categoria.toUpperCase()) {
        case "SAÚDE":
        case "SAUDE":
            corPrincipal = '#8B0000';
            corSecundaria = '#A52A2A';
            corTerciaria = '#CD5C5C';
            corTag = '#6A0DAD'; // roxo
            break;
        case "ESPORTE":
        case "FUTEBOL":
            corPrincipal = '#1B5E20';
            corSecundaria = '#2E7D32';
            corTerciaria = '#43A047';
            corTag = '#0D47A1'; // azul escuro
            break;
        case "POLÍTICA":
        case "POLITICA":
        case "INTERNACIONAL":
            corPrincipal = '#B71C1C';
            corSecundaria = '#D32F2F';
            corTerciaria = '#E57373';
            corTag = '#1565C0'; // azul
            break;
        case "ECONOMIA":
        case "CADEIA PRODUTIVA":
            corPrincipal = '#0D5257';
            corSecundaria = '#00695C';
            corTerciaria = '#26A69A';
            corTag = '#F57C00'; // laranja
            break;
        case "EDUCAÇÃO":
        case "EDUCACAO":
            corPrincipal = '#0D47A1';
            corSecundaria = '#1565C0';
            corTerciaria = '#42A5F5';
            corTag = '#6A1B9A'; // roxo escuro
            break;
        case "TECNOLOGIA":
            corPrincipal = '#6A7C14';
            corSecundaria = '#827717';
            corTerciaria = '#AFB42B';
            corTag = '#01579B'; // azul petróleo
            break;
        case "COTIDIANO":
            corPrincipal = '#4A148C';
            corSecundaria = '#6A1B9A';
            corTerciaria = '#9C27B0';
            corTag = '#E65100'; // laranja escuro
            break;
        case "ENTRETENIMENTO":
            corPrincipal = '#BF360C';
            corSecundaria = '#D84315';
            corTerciaria = '#FF5722';
            corTag = '#F57F17'; // amarelo escuro
            break;
        case "TELEVISÃO":
        case "TELEVISAO":
            corPrincipal = '#E65100';
            corSecundaria = '#F57C00';
            corTerciaria = '#FF9800';
            corTag = '#1B5E20'; // verde escuro
            break;
        case "MÚSICA":
        case "MUSICA":
            corPrincipal = '#F9A825';
            corSecundaria = '#FBC02D';
            corTerciaria = '#FDD835';
            corTag = '#C62828'; // vermelho
            break;
        case "CELEBRIDADES":
            corPrincipal = '#AD1457';
            corSecundaria = '#C2185B';
            corTerciaria = '#E91E63';
            corTag = '#4A148C'; // roxo profundo
            break;
        default:
            corPrincipal = '#8B0000';
            corSecundaria = '#A52A2A';
            corTerciaria = '#CD5C5C';
            corTag = '#6A0DAD';
            break;
    }
    
    mainShape.style.backgroundColor = corPrincipal;
    secondaryShape.style.backgroundColor = corSecundaria;
    tertiaryShape.style.backgroundColor = corTerciaria;
    categoryTag.style.backgroundColor = corTag;
}

// Função para ajustar a fonte da descrição até caber no container
function fitDescriptionFont(descriptionDiv, containerDiv, minFontSize) {
    minFontSize = minFontSize || 12;
    var fontSize = parseInt(window.getComputedStyle(descriptionDiv).fontSize);
    var containerMaxHeight = parseInt(window.getComputedStyle(containerDiv).maxHeight) || containerDiv.offsetHeight;
    
    while ((containerDiv.scrollHeight > containerMaxHeight || descriptionDiv.scrollHeight > containerMaxHeight) && fontSize > minFontSize) {
        fontSize -= 1;
        descriptionDiv.style.fontSize = fontSize + 'px';
    }
}

// Função para capturar o tamanho do navegador
function capturarTamanhoDoNavegador() {
    var largura = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var altura = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    
    console.log('Tamanho: ' + largura + ' X ' + altura);
}

// Adiciona um listener de redimensionamento
window.addEventListener('resize', function () {
    location.reload();
});

window.addEventListener('load', updateAspectRatio);

function getAspectRatio() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var gcd = function(a, b) {
        return (b === 0 ? a : gcd(b, a % b));
    };
    var divisor = gcd(width, height);

    return (width / divisor) + ':' + (height / divisor);
}

function updateAspectRatio() {
    var aspectRatio = getAspectRatio();
    console.log('Aspect Ratio:', aspectRatio);
}
