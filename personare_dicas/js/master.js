function renderDica(titleEl, textEl, imageEl, item) {
    titleEl.textContent = item.value('TITULO').value.toUpperCase();
    textEl.textContent  = item.value('TEXTO').value;
    imageEl.src         = item.value('FOTO').value;
        
}

function renderDicaMock(titleEl, textEl, imageEl, dado) {
    titleEl.textContent = dado.TITULO.toUpperCase();
    textEl.textContent  = dado.TEXTO;
    imageEl.src         = dado.FOTO;


}
var autoSizeText;

autoSizeText = function() {
  var el, elements, _i, _len, _results;
  elements = document.getElementsByClassName('resize');
  console.log(elements);
  if (elements.length < 0) {
    return;
  }
  _results = [];
  for (_i = 0, _len = elements.length; _i < _len; _i++) {
    el = elements[_i];
    _results.push((function(el) {
      var resizeText, _results1;
      resizeText = function() {
        var elNewFontSize;
        elNewFontSize = (parseInt(window.getComputedStyle(el).fontSize.slice(0, -2)) - 1) + 'px';
        el.style.fontSize = elNewFontSize;
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


function iniciarTemplate(config, imageEl, loader) {
    var body = document.querySelector('body');

    imageEl.onload = function () {
        body.classList.remove('opacity-0');
        body.classList.add('opacity-100');

        loader.loaded();

        setTimeout(function () {
            loader.finished();
        }, config.duration);
    };

    imageEl.onerror = function () {
        console.error('[dicas] Erro ao carregar imagem.');
        loader.finished();
    };
}


window.onload = function () {
    var titleEl = document.querySelector('#titulo p');
    var textEl  = document.querySelector('#texto');
    var imageEl = document.getElementById('imagem');

    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = {
            loaded:   function () { console.log('[Mock] loaded()'); },
            finished: function () { console.log('[Mock] finished()'); }
        };
        renderDicaMock(titleEl, textEl, imageEl, MOCK_DATA.dados[0]);
        iniciarTemplate(MOCK_DATA.config, imageEl, mockLoader);
        return;
    }

    ebhtml.create2({}, function (loader) {
        loader.addData('D_PERSONARE', false);
        loader.autoloaded = false;
        loader.nodataiserror = false;

        loader.load(function () {
            var item = loader.data('D_PERSONARE');

            if (item == undefined) {
                console.error('[dicas] Sem dados.');
                loader.finished();
                return;
            }

            renderDica(titleEl, textEl, imageEl, item);
            iniciarTemplate({ duration: 10000 }, imageEl, loader);

             return autoSizeText();
       


        });
    });
};