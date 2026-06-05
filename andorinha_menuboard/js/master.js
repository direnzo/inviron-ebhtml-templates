document.addEventListener("DOMContentLoaded", () => {
  // Defina manualmente a categoria desejada aqui
  const selectedCategory = "Acougue-Aves";

  // Mapeamento de categorias
  const categoryMapping = {
    "Padaria": "Padaria",
    "Acougue-Bovino": "Açougue Bovino",
    "Acougue-Suino": "Açougue Suíno",
    "Acougue-Aves": "Açougue Aves",
    "Frios-Presuntaria": "Frios - Presuntaria",
    "Frios-Salsichas": "Frios - Salsichas"
  };

  const itemsPerPage = 9; // Limite de itens por página
  const displayDuration = 15000; // 15 segundos por página
  const contentRowsContainer = document.getElementById("content-rows");
  const rowTemplate = document.getElementById("row-template");
  const tableContainer = document.getElementById("table-container");
  const titleElement = document.getElementById("title");

  if (!contentRowsContainer || !rowTemplate || !tableContainer || !titleElement) {
    console.error("Erro: Elementos não encontrados no DOM.");
    return;
  }

  let loader2; // Definir loader2 no escopo superior

  const formatNumber = (number) => Number(number).toFixed(2).replace(".", ",");

  const createRow = (item, index) => {
    // console.log("Criando uma linha para o item:", item);
    // Clona o template
    const row = rowTemplate.content.cloneNode(true);
    const rowElement = row.querySelector("div"); // Seleciona o div principal do template

    // Adiciona classes de TailwindCSS alternadamente para cor de fundo
    if (index % 2 === 0) {
      rowElement.classList.add("bg-blue-800"); // Classe para linhas pares
    } else {
      rowElement.classList.add("bg-blue-700"); // Classe para linhas ímpares
    }

    // Popula os dados do item
    const description = row.querySelector(".descr");
    const price = row.querySelector(".price");
    const club = row.querySelector(".club");

    description.textContent = item.value("TITULO").value.substring(0, 35).toUpperCase();
    price.innerHTML = "R$ " + formatNumber(item.value("PRICE").value);

    const price2 = item.value("PRICE2").value;
    const startDate = item.value("TEXTO6").value;
    const endDate = item.value("TEXTO7").value;
    const now = new Date();

    const isPromotionActive = now >= new Date(startDate.replace(" ", "T")) &&
                              now <= new Date(endDate.replace(" 00:00:00", "T23:59:59"));

    club.innerHTML = isPromotionActive && price2 ? "R$ " + formatNumber(price2) : "";

    return row;
  };

  const showPage = (items, page) => {
    // console.log(`Exibindo página: ${page}`);
    // Limpa o container
    contentRowsContainer.innerHTML = "";

    // Calcula os índices da página
    const startIndex = page * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, items.length);
    const currentItems = items.slice(startIndex, endIndex);

    // Adiciona as linhas ao container
    currentItems.forEach((item, index) => {
      const row = createRow(item, index);
      contentRowsContainer.appendChild(row);

      // Adiciona animação com atraso
      const rowElement = contentRowsContainer.lastElementChild;
      setTimeout(() => {
        rowElement.classList.remove("opacity-0", "translate-y-4");
      }, 300 * index); // Delay incremental
    });
  };

  const startPagination = (items) => {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    let currentPage = 0;

    // Exibe as páginas em loop
    const interval = setInterval(() => {
      showPage(items, currentPage);
      currentPage++;

      if (currentPage >= totalPages) {
        clearInterval(interval);

        // Exibe a última página por mais 15 segundos antes de finalizar
        setTimeout(() => {
          // console.log("Exibição completa, finalizando loader.");
          finishLoader();
        }, displayDuration);
      }
    }, displayDuration);

    // Mostra a primeira página imediatamente
    showPage(items, currentPage);
    currentPage++;
  };

  const finishLoader = () => {
    if (loader2) {
      // console.log("Finalizando loader.");
      loader2.finished();
    } else {
      console.error("Erro: loader2 não está definido.");
    }
  };

  const loadData = (category) => {
    ebhtml.create2({}, function (loader) {
      loader.addData("D_LOCAL", true);

      loader.load(() => {
        try {
          // console.log("Dados do local carregados.");
          const local = loader.data("D_LOCAL").value("SITE_CUSTOMERID").value;
          const filtro = `f_category=${category}&f_TEXTO2=${local}&amount=0&order=ID&orderkind=id`;

          ebhtml.create2({}, function (loaderInstance) {
            loader2 = loaderInstance; // Definir loader2 aqui para ser acessível globalmente
            loader2.addData("D_MENUBOARD_PRICES", true, filtro);
            loader2.nodataiserror = false;
            loader2.autoloaded = false;
            loader2.loaded();

            loader2.load(() => {
              try {
                // console.log("Dados do menuboard carregados.");
                const items = loader2.datalist("D_MENUBOARD_PRICES").f_items;
                console.log(items);
                if (!items || items.length === 0) {
                  console.warn("Nenhum item encontrado para exibição.");
                  finishLoader(); // Finaliza imediatamente se não houver itens
                } else {
                  // Remover opacity-0 do table-container para exibir os dados
                  tableContainer.classList.remove("opacity-0");

                  if (items.length > itemsPerPage) {
                    startPagination(items); // Inicia a paginação se houver mais de 9 itens
                  } else {
                    showPage(items, 0); // Exibe todos os itens em uma única página
                    setTimeout(() => {
                      // console.log("Exibição completa, finalizando loader.");
                      finishLoader(); // Finaliza após exibir todos os itens por 15 segundos
                    }, displayDuration);
                  }
                }
              } catch (error) {
                console.error("Erro ao carregar os itens:", error);
                finishLoader(); // Finaliza em caso de erro durante a leitura dos dados
              }
            });
          });
        } catch (error) {
          console.error("Erro ao carregar os dados do local:", error);
          finishLoader(); // Finaliza em caso de erro durante o carregamento do local
        }
      });
    });
  };

  // Defina o título com base na categoria selecionada
  titleElement.textContent = categoryMapping[selectedCategory];

  // ═══ MOCK DATA FUNCTION ══════════════════════════════════════════════════
  // Função para usar dados fictícios durante desenvolvimento
  function usarMockData() {
    // Definir título
    titleElement.textContent = categoryMapping[selectedCategory];
    
    // Criar datalist mock usando os produtos do MOCK_DATA
    var mockDatalist = criarDatalistMock(MOCK_DATA.produtos);
    var items = mockDatalist.f_items;
    
    console.log('[MOCK] Total de produtos:', items.length);
    
    if (!items || items.length === 0) {
      console.warn('[MOCK] Nenhum item encontrado');
      return;
    }
    
    // Remover opacity-0 do table-container para exibir os dados
    tableContainer.classList.remove("opacity-0");
    
    if (items.length > itemsPerPage) {
      startPagination(items); // Inicia a paginação se houver mais de 9 itens
    } else {
      showPage(items, 0); // Exibe todos os itens em uma única página
    }
  }
  // ═════════════════════════════════════════════════════════════════════════

  // ═══ INICIALIZAÇÃO ═══════════════════════════════════════════════════════
  // Verifica se mock-data está habilitado
  if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
    console.log('[MOCK] Usando dados fictícios para desenvolvimento');
    usarMockData();
  } else {
    // Carregar os dados para a categoria selecionada (produção)
    loadData(selectedCategory);
  }
  // ═════════════════════════════════════════════════════════════════════════
});
