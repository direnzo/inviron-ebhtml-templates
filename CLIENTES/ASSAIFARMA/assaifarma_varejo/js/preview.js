function extranetView() {
    window.onload = function () {

        var image = new Image();
        var title = this.document.querySelector('#titulo p');
        var text = this.document.querySelector('#texto p');

        ebhtml.create2({}, function (loader) {

            loader.addData('D_SPD');
            loader.nodataiserror = false;
            loader.autoloaded = false;
            loader.load(function () {
                data = loader.data('D_SPD')
                var logo = document.getElementById('logo')

                midia_fundo = data.value('FILE_BACKGROUND').value;
                console.log(midia_fundo);
                midia_extensao = midia_fundo.split('.')[3]
                if (midia_extensao == 'png' || midia_extensao == 'jpg' || midia_extensao == 'jpeg' || midia_extensao == 'gif') {
                    var imagem = document.getElementById('imagem');
                    imagem.src = midia_fundo;
                    document.getElementById("imagem").style.opacity = "1";
                } else if (midia_extensao == 'mp4' || midia_extensao == 'mov' || midia_extensao == 'avi' || midia_extensao == 'webm') {
                    var video = document.getElementById('video');
                    video.src = midia_fundo;
                    video.play();
                }
                document.getElementsByTagName('body')[0].style.color = data.value('COLOR1').value;
                logo.src = data.value('IMAGE_LOGO').value

                var produtoImg = document.getElementById('produto_img');
                produtoImg.src = data.value('FILE_IMAGE1').value;
                produtoImg.style.opacity = 1

                document.getElementById('titulo').innerText = data.value('TITLE').value;

                document.getElementById('texto_legal').innerText = data.value('TEXT4').value;

                var preco = document.getElementById('preco');
                var texto2 = document.getElementById('texto2');
                preco.innerText = data.value('TEXT1').value;
                var aTipo = data.value('TEXT5').value
                var body = document.body,
                    html = document.documentElement;
                var height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
                var width = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);

                if (height > width) {
                    var titulo_container = document.getElementById('titulo_container');
        var img_container = document.getElementById('img_container');
        var logo_container = document.getElementById('logo_container');

        logo_container.style.justifyContent = 'center';

        logo.style.width = '25%'

        img_container.style.width = '90%';
        img_container.style.height = '40%';

        titulo.style.fontSize = '6.5vw';
        titulo.style.fontWeight = 'bold';

        titulo_container.style.width = '90%';

        preco.style.top = '67%';
        preco.style.fontSize = '15vw';
        preco.style.width = '90%';
        preco.style.textAlign = 'center';

        texto_legal.style.fontSize = '4vw'

        texto2.style.top = '77%';
        texto2.style.fontSize = '7vw';
        texto2.style.textAlign = 'center';
        texto2.style.width = '90%';

        document.getElementById('por').style.top = '78%';
        document.getElementById('por').style.fontSize = '6vw';

        if (aTipo == 2) {
            preco.style.top = '74%'
            preco.style.left = '5%'
            texto2.style.top = '68%'
            preco.innerHTML = '<sup>Por&nbsp;</sup>' + data.value('TEXT1').value;
            texto2.innerHTML = '<sup>&nbsp;&nbsp;De&nbsp;</sup>' + data.value('TEXT2').value;
            texto2.classList.add("price--line-through");
            texto2.style.width = 'unset'
            texto2.style.fontWeight = 'unset';
            texto2.style.textAlign = 'left';
            texto2.style.opacity = '0.8';
            preco.style.textAlign = 'left';
        }
        if (aTipo == 3) {
            texto2.innerText = 'Desconto de ' + data.value('TEXT2').value + '%';
        }
        if (aTipo == 4) {
            texto2.innerText = 'Pague ' + data.value('TEXT2').value + ' Leve ' + data.value('TEXT3').value;
        }
    } else {
        if (aTipo == 2) {
            preco.style.top = '50%'
            preco.style.left = '11%'
            preco.innerHTML = '<sup>Por&nbsp;</sup>' + data.value('TEXT1').value;
            texto2.innerHTML = '<sup>&nbsp;&nbsp;De&nbsp;</sup>' + data.value('TEXT2').value;
            texto2.classList.add("price--line-through");
            texto2.style.width = 'unset'
            texto2.style.fontWeight = 'unset';
            texto2.style.textAlign = 'left';
            texto2.style.opacity = '0.8';
            preco.style.textAlign = 'left';
        }
        if (aTipo == 3) {
            preco.style.top = '39%'
            texto2.innerText = 'Desconto de ' + data.value('TEXT2').value + '%';
            texto2.style.top = '55%'
        }
        if (aTipo == 4) {
            preco.style.top = '39%'
            texto2.innerText = 'Pague ' + data.value('TEXT2').value + ' Leve ' + data.value('TEXT3').value;
            texto2.style.top = '55%'
        }
                }
            });
        });
    };
}