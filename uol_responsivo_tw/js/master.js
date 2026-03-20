window.onload = function () {

    var image = this.document.querySelector('#image');
    var image2 = this.document.querySelector('#image2');
    // var background = document.querySelector('#bgImage');
    var title = this.document.querySelector('#title');
    var titleContainer = this.document.querySelector('#titleContainer');
    var text = this.document.querySelector('#description');
    var textContent = this.document.querySelector('#descriptionContainer');

    var credit = this.document.querySelector('#credit');
    var body = document.querySelector('body')

    ebhtml.create2({}, function (loader) {

        loader.addData('D_UOL');
        loader.nodataiserror = false;
        loader.autoloaded = false;
        loader.load(function () {

            title.innerHTML = loader.data('D_UOL').value('TITULO').value.toUpperCase();

            text.innerHTML = loader.data('D_UOL').value('TEXTO').value;
            credit.innerHTML = loader.data('D_UOL').value('IMAGECREDIT').value;

            if (title && titleContainer) {
                fitDescriptionFont(title, titleContainer, 6);
            }
            if (text && textContent) {
                fitDescriptionFont(text, textContent, 6);
            }

            const imageUrl = loader.data('D_UOL').value('FOTO').value;
            image.src = imageUrl;
            image2.src = imageUrl;
            // image.style.backgroundImage = `url(${imageUrl})`;
            // background.src = imageUrl;

            image.onload = function () {

                loader.loaded();

                setTimeout(function () {
                    loader.finished();
                }, 15000);
            }

            image.onerror = function () {
                loader.finished();
            }

            mudaCor(title.innerHTML);
            // capturarTamanhoDoNavegador();
            body.classList.remove('opacity-0');
            body.classList.add('opacity-1');

            // background.classList.remove('opacity-0');
            // background.classList.add('opacity-50', 'blur-xl');

            const aspectRatio = window.innerWidth / window.innerHeight;

            const isEmpena = aspectRatio <= (1 / 2);
            const isPortrait = aspectRatio <= (3 / 4);

            
            if (isEmpena || isPortrait) {
                image.classList.remove('empena:object-left', 'portrait:object-left', 'scale-110');
                image.classList.add('object-right');
           
            } else {
                image.classList.add('scale-110');
            }


        });
    });



    function isWebkit() {
        return 'WebkitAppearance' in document.documentElement.style;
    }

    function isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }

    if (isWebkit() || isAndroid()) {
        document.body.classList.add('no-expande');
    }
};
function mudaCor(editoria) {
    //console.log(editoria)
    var cor = 'rgba(252, 201, 8, 0.7)'; // cor default com 10% de opacidade
    console.log(editoria);
    switch (editoria) {
        case "ESPORTE":
            cor = "rgba(50, 168, 82, 0.7)";
            break;
        case "FUTEBOL":
            cor = "rgba(50, 168, 82, 0.7)";
            break;
        case "POLÍTICA":
            cor = "rgba(171, 2, 2, 0.7)";
            break;
        case "INTERNACIONAL":
            cor = "rgba(171, 2, 2, 0.7)";
            break;
        case "ECONOMIA":
            cor = "rgba(13, 25, 186, 0.7)";
            break;
        case "EDUCAÇÃO":
            cor = "rgba(13, 123, 186, 0.7)";
            break;
        case "TECNOLOGIA":
            cor = "rgba(172, 186, 13, 0.7)";
            break;
        case "COTIDIANO":
            cor = "rgba(154, 13, 186, 0.7)";
            break;
        case "ENTRETENIMENTO":
            cor = "rgba(186, 74, 13, 0.7)";
            break;
        case "TELEVISÃO":
            cor = "rgba(186, 128, 13, 0.7)";
            break;
        case "MÚSICA":
            cor = "rgba(245, 239, 0, 0.7)";
            break;
        case "CELEBRIDADES":
            cor = "rgba(186, 13, 172, 0.7)";
            break;
        default:
            cor = "rgba(252, 201, 8, 0.7)";
            break;
    }
    var fundoTitulo = document.querySelector('#titleContainer');
    fundoTitulo.style.backgroundColor = cor;
}


// Função para ajustar a fonte da descrição até caber no container
function fitDescriptionFont(descriptionDiv, containerDiv, minFontSize = 12) {
    let fontSize = parseInt(window.getComputedStyle(descriptionDiv).fontSize);
    const containerMaxHeight = parseInt(window.getComputedStyle(containerDiv).maxHeight) || containerDiv.offsetHeight;
    // descriptionDiv.style.overflow = "auto";
    while (
        (containerDiv.scrollHeight > containerMaxHeight || descriptionDiv.scrollHeight > containerMaxHeight)
        && fontSize > minFontSize
    ) {
        fontSize -= 1;
        descriptionDiv.style.fontSize = fontSize + "px";
        console.log(`Ajustando fonte para ${fontSize}px`);
    }
}



// Função para capturar o tamanho do navegador e atualizar a div
function capturarTamanhoDoNavegador() {
    // Captura a largura e altura do navegador
    let largura = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    let altura = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    // Atualiza o texto da div com o tamanho do navegador
    document.getElementById('size').innerHTML = largura + ' X ' + altura;
}

// Chama a função uma vez para exibir o tamanho inicial
//capturarTamanhoDoNavegador();

// Adiciona um listener de redimensionamento para atualizar o tamanho quando o navegador for redimensionado
window.addEventListener('resize', function () {
    location.reload();
    capturarTamanhoDoNavegador();
    // document.body.classList.add('opacity-0');
    capturarTamanhoDoNavegador();
    updateAspectRatio();
});

window.addEventListener("load", updateAspectRatio);

function getAspectRatio() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(width, height);

    return `${width / divisor}:${height / divisor}`;
}

function updateAspectRatio() {
    const aspectRatio = getAspectRatio();
    console.log("Aspect Ratio:", aspectRatio);
    // document.getElementById("aspect-ratio").textContent = `Aspect Ratio: ${aspectRatio}`;
}