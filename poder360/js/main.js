var months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
var dat = new Date();

window.onload = function (){

    this.document.querySelector('footer p:nth-child(2)').innerText = dat.getDate() + ' de ' + months[dat.getMonth()] + ' ' + dat.getFullYear();

    var image = new Image();
    var title = this.document.querySelector('#title p');
    var text = this.document.querySelector('#text p');

    ebhtml.create2({}, function (loader) {
        
        loader.addData('D_PODER360');
        loader.nodataiserror = false;
        loader.autoloaded = false;
        loader.load( function () {

            title.innerText = loader.data('D_PODER360').value('titulo').value.toUpperCase();
            text.innerText = loader.data('D_PODER360').value('texto').value.toUpperCase();
            autoSizeText();

            image.src = loader.data('D_PODER360').value('foto').value;
            document.querySelector('#image').appendChild(image);
            image.onload = function () {
                loader.loaded();

                setTimeout(function(){
                    loader.finished();
                }, 15000);
            }

            image.onerror = function () {
                loader.finished();
            }

        });
    });
};

var autoSizeText = function () {
    var el, elements, _i, _len, _results;
    elements = document.getElementsByClassName('resize');
    console.log(elements);
    if (elements.length < 0) {
        return;
    }
    _results = [];
    for (_i = 0, _len = elements.length; _i < _len; _i++) {
        el = elements[_i];
        _results.push((function (el) {
            var resizeText, _results1;
            resizeText = function () {
                var elNewFontSize;
                console.log('fonte size: ' + window.getComputedStyle(el).fontSize);
                elNewFontSize = (parseInt(window.getComputedStyle(el).fontSize.slice(0, -2)) - 1) + 'px';
                return el.style.fontSize = elNewFontSize;
            };
            _results1 = [];

            while (el.scrollHeight > el.offsetHeight) {
                _results1.push(resizeText());
            }
            return _results1;
        })(el));
    }
    return _results;
};
