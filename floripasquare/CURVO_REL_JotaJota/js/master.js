window.onload = function () {
  ebhtml.create2({}, function (loader) {


    loader.load(function () {
      
    //   loader.loaded();

      setTimeout(function () {
        loader.finished();
      }, 15000);
    });
  });
};

