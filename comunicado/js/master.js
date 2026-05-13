var MEDIATYPE_URL_IMAGE = 0;
var MEDIATYPE_URL_VIDEO = 1;
var MEDIATYPE_VIDEO = 2;
var MEDIATYPE_IMAGE = 3;

function parseMediaType(data) {
    var dataType = data.split(':');

    if (dataType[0] == 'data') {
        var fileType = dataType[1].split(';');
        switch (fileType[0]) {
            case 'video/mp4':
                return MEDIATYPE_VIDEO;
            case 'image/png':
            case 'image/jpeg':
            case 'image/jpg':
                return MEDIATYPE_IMAGE;
        }
    } else if (dataType[0] === 'http' || dataType[0] === 'https') {
        return MEDIATYPE_URL_IMAGE;
    }
    return MEDIATYPE_URL_VIDEO;
}

window.onload = function () {
    var title = this.document.querySelector('#title');
    var body = this.document.querySelector('body');
    var text = this.document.querySelector('#content p');
    var contentDiv = document.getElementById("content");
    var loadingBar = document.getElementById("loading-bar");
    var logo = document.getElementById("logo");
    var qrcode = document.getElementById("code");
    var image = new Image();
    var imagem = document.querySelector('#imagem');
    var video = document.querySelector('#video');

    ebhtml.create2({}, function (loader) {

        const isPreview = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

        loader.addData('D_COMUNICADO',false);

        if (!isPreview)
            loader.addData('D_LOCAL', false);

        loader.autoloaded = false;
        loader.nodataiserror = true;
        loader.load(function () {
            if (loader.data('D_COMUNICADO') == undefined){
                loader.loaded();
                setTimeout(function () {
                    loader.finished();
                }, 300);
            } else {
                document.body.style.opacity = 1;
                title.innerText = loader.data('D_COMUNICADO').value('TITULO').value;
                var urlVideo = loader.data('D_COMUNICADO').value('FOTO').value;

                text.innerHTML = loader.data('D_COMUNICADO').value('TEXTO').value;

                var mediaType = parseMediaType(urlVideo);

                if (urlVideo != '') {
                    switch (mediaType) {
                        case MEDIATYPE_IMAGE:
                        case MEDIATYPE_URL_IMAGE:
                            image.src = loader.data('D_COMUNICADO').value('FOTO').value;
                            document.querySelector('#imagem').appendChild(image);
                            imagem.style.display = 'flex';
                            contentDiv.style.width = '68%';
                            video.style.display = 'none';
                                if(loader.data('D_COMUNICADO').value('TEXTO').value == ""){
                                    contentDiv.style.backgroundColor =  "rgba(10,23,55,0)";

                                    imagem.style.width = "95%"
                                    imagem.style.left = "50%"
                                    imagem.style.top = "50%"
                                }
                            break;
                        case MEDIATYPE_URL_VIDEO:
                            if(loader.data('D_COMUNICADO').value('TEXTO').value != ""){
                                urlVideo.split('f_')[1].split('.')[0];
                                video.src = 'http://localhost:13199/FILES/' + urlVideo.split('f_')[1].split('.')[0];
                                contentDiv.style.height = 'calc(32vh - 105px)';
                            }else{
                                contentDiv.style.display = 'none';
                                urlVideo.split('f_')[1].split('.')[0];
                                video.src = 'http://localhost:13199/FILES/' + urlVideo.split('f_')[1].split('.')[0];
                                video.style.top = '10%';
                            }
                            break;
                    }
                }
        
                loader.loaded();

                // Função para verificar se a animação é necessária
                function checkAnimation() {
                    var textHeight = text.offsetHeight;
                    var contentHeight = contentDiv.offsetHeight;

                    if (textHeight > contentHeight) {
                        text.classList.add("scrolling-text");
                    }
                }

                // Chama a função inicialmente
                checkAnimation();

                // Rechama a função sempre que a janela for redimensionada
                window.addEventListener('resize', checkAnimation);

                // Mostra a barra de carregamento
                loadingBar.style.display = "block";
                // Atualiza a barra de carregamento ao longo do tempo
                var progress = document.getElementById("progress");
                var totalTime = 30 * 1000; // 30 segundos em milissegundos
                var interval = 100; // Intervalo de atualização em milissegundos
                var increment = (interval / totalTime) * 100;

                var width = 0;
                var timer = setInterval(function () {
                    width += increment;
                    progress.style.width = width + "%";
                    if (width >= 100) {
                        clearInterval(timer);
                        loadingBar.style.display = "none";
                        loader.finished();
                        // Oculta a barra de carregamento após 30 segundos
                    }
                }, interval);


                // setTimeout(function () {
                //     loader.finished();
                // }, 30000);
            }
        });
    });
};
