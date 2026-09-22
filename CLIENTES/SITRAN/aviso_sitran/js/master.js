window.onload = function () {
  var autoSizeText;

  autoSizeText = function () {
    var el, elements, _i, _len, low, high, mid, iter;
    elements = document.getElementsByClassName("resize");
    if (elements.length === 0) {
      return;
    }
    for (_i = 0, _len = elements.length; _i < _len; _i++) {
      el = elements[_i];

      // Busca binaria: encontra o maior font-size que cabe sem estourar
      // No maximo 20 iteracoes (cobre range 1px ~ 1.048.576px)
      low = 1;
      high = 200;

      for (iter = 0; iter < 20; iter++) {
        if (low >= high) break;
        mid = Math.round((low + high) / 2);
        el.style.fontSize = mid + "px";
        if (el.scrollHeight > el.offsetHeight) {
          high = mid - 1; // Estourou, testa menor
        } else {
          low = mid; // Coube, tenta maior
        }
      }

      el.style.fontSize = low + "px";
    }
  };

  // Funcao principal para inicializar o slideshow de alertas
  function initAlertSlideshow(alertas, config, loader) {
    console.log("Alertas carregados:", alertas);
    console.log("Configuracao:", config);

    var slideshow = document.getElementById("slideshow");
    slideshow.innerHTML = ""; // Limpa o container

    // Cria slides de alerta
    for (var i = 0; i < alertas.length; i++) {
      var slide = createAlertSlide(alertas[i], i);
      slideshow.appendChild(slide);
    }

    // Adiciona slide final com logo SITRAN (se habilitado)
    if (config.showLogoSlide) {
      var logoSlide = createLogoSlide(alertas.length);
      slideshow.appendChild(logoSlide);
    }

    // Seleciona todos os slides criados
    var slides = slideshow.querySelectorAll(".alert-slide");
    var totalSlides = slides.length;

    if (totalSlides === 0) {
      console.warn("Nenhum slide para exibir");
      return;
    }

    // Mostra o body com fade in
    document.body.classList.add("opacity-100");
    if (loader) loader.loaded();

    console.log("[Slideshow] Iniciando - Total de slides: " + totalSlides);

    // Mostra o primeiro slide
    slides[0].classList.add("opacity-100", "z-10");
    slides[0].classList.remove("opacity-0", "z-0");
    console.log("[Slideshow] Exibindo slide 1/" + totalSlides);

    // Ajusta o texto do primeiro slide apos renderizar
    setTimeout(function () {
      autoSizeText();
    }, 50);

    // Se houver apenas 1 slide, nao inicia slideshow
    if (totalSlides === 1) {
      console.log("[Slideshow] Apenas 1 slide - slideshow desativado");
      // Finaliza apos o tempo do slide
      setTimeout(function () {
        if (loader) loader.finished();
        console.log("[Slideshow] Finalizado");
      }, config.slideTime);
      return;
    }

    // Inicia slideshow automatico
    var current = 0;
    var slideCount = 1; // Comeca em 1 porque ja exibimos o primeiro slide

    var interval = setInterval(function () {
      // Esconde o slide atual
      slides[current].classList.remove("opacity-100", "z-10");
      slides[current].classList.add("opacity-0", "z-0");

      // Avanca para o proximo slide
      current = (current + 1) % totalSlides;
      slideCount++;

      console.log(
        "[Slideshow] Exibindo slide " +
          slideCount +
          "/" +
          totalSlides +
          " (index: " +
          current +
          ")",
      );

      // Mostra o novo slide
      slides[current].classList.remove("opacity-0", "z-0");
      slides[current].classList.add("opacity-100", "z-10");

      // Ajusta o texto do slide atual
      setTimeout(function () {
        autoSizeText();
      }, 50);

      // Para apos exibir todos os slides uma vez (incluindo o logo)
      if (slideCount >= totalSlides) {
        console.log("[Slideshow] Todos os slides exibidos - parando slideshow");
        clearInterval(interval);

        // Fade out final apos o tempo do ultimo slide
        setTimeout(function () {
          slides[current].classList.remove("opacity-100");
          slides[current].classList.add("opacity-0");
          console.log("[Slideshow] Finalizado");
        }, 4000);
      }
    }, config.slideTime);
  }

  // Cria um slide de alerta
  function createAlertSlide(texto, index) {
    var slide = document.createElement("div");
    slide.className =
      "alert-slide absolute top-0 left-0 w-full h-full flex items-center justify-center transition-opacity duration-1000 opacity-0 z-0 px-[5%] py-[2%]";
    slide.setAttribute("data-slide", index + 1);

    slide.innerHTML =
      '<div class="w-full h-full flex flex-col gap-[2%]">' +
      '<div class="flex-1 flex items-center justify-center">' +
      '<div class="resize alert-text text-white text-center h-[78%] leading-[1.1]">' +
      texto +
      "</div>" +
      "</div>" +
      '<div class="flex justify-center items-end h-[20%]">' +
      '<img src="img/logo_sitran_peq.png" alt="SITRAN" class="w-[25%] object-contain" />' +
      "</div>" +
      "</div>";

    return slide;
  }

  // Cria o slide final com logo SITRAN
  function createLogoSlide(index) {
    var slide = document.createElement("div");
    slide.className =
      "alert-slide logo-slide absolute top-0 left-0 w-full h-full flex items-center justify-center transition-opacity duration-1000 opacity-0 z-0";
    slide.setAttribute("data-slide", "logo");

    slide.innerHTML =
      '<div class="flex items-center justify-center h-1/2 w-full">' +
      '<img src="img/logo_final_sitran.png" alt="SITRAN" class="size-full max-h-[90%] max-w-[95%] object-contain" />' +
      "</div>";

    return slide;
  }

  // Verifica se deve usar dados mockados ou carregar do sistema
  if (typeof MOCK_DATA !== "undefined" && MOCK_DATA.enabled) {
    // Usa dados mockados
    console.log("Usando dados mockados para desenvolvimento");

    var config = {
      slideTime: MOCK_DATA.config.slideTime || 5000,
      showLogoSlide: MOCK_DATA.config.showLogoSlide !== false,
      maxSlides: MOCK_DATA.config.maxSlides || 10,
    };

    // Limita a quantidade de alertas conforme maxSlides
    var alertas = MOCK_DATA.alertas.slice(0, config.maxSlides);

    if (alertas.length === 0) {
      console.warn("Nenhum alerta para exibir");
      return;
    }

    // Cria um loader mockado para simular o comportamento do ebhtml
    var mockLoader = {
      loaded: function () {
        console.log("[Mock] Slideshow carregado");
      },
      finished: function () {
        console.log("[Mock] Slideshow finalizado");
      },
    };

    initAlertSlideshow(alertas, config, mockLoader);
  } else {
    // Carrega dados do sistema real
    console.log("Carregando dados do sistema");
    ebhtml.create2({}, function (loader) {
      loader.addData("D_COMUNICADOS", false);
      loader.autoloaded = false;
      loader.nodataiserror = true;
      loader.load(function () {
        if (loader.data("D_COMUNICADOS") == undefined) {
          loader.finished();
        } else {
          var config = {
            slideTime: 5000, // Tempo padrao de 5 segundos por slide
            showLogoSlide: true,
          };

          var texto = loader.data("D_COMUNICADOS").value("TEXTO").value;

          setTimeout(function () {
            loader.finished();
          }, 10000);

          var alertas = [texto];
          initAlertSlideshow(alertas, config, loader);

          autoSizeText();
        }
      });
    });
  }
};
