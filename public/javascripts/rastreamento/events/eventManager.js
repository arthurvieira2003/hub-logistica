window.RastreamentoEvents = window.RastreamentoEvents || {};

window.RastreamentoEvents.aplicarFiltros = function () {
  const searchTerm =
    document.getElementById("searchNota")?.value.toLowerCase() ||
    document.getElementById("searchInput")?.value.toLowerCase() ||
    "";

  const statusFiltros = Array.from(
    document.querySelectorAll(
      '.filter-options input[type="checkbox"][value^="Aguardando"], .filter-options input[type="checkbox"][value="Em trânsito"], .filter-options input[type="checkbox"][value="Entregue"], .filter-options input[type="checkbox"][value="Atrasado"]'
    )
  )
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  const transportadorasFiltros = Array.from(
    document.querySelectorAll('.transportadoras-filter input[type="checkbox"]')
  )
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  if (window.RastreamentoDataTablesRenderer && window.dataTableInstance) {
    if (searchTerm) {
      window.RastreamentoDataTablesRenderer.aplicarFiltro("busca", searchTerm);
    }

    if (statusFiltros.length > 0) {
      window.RastreamentoDataTablesRenderer.aplicarFiltro(
        "status",
        statusFiltros
      );
    }

    if (transportadorasFiltros.length > 0) {
      window.RastreamentoDataTablesRenderer.aplicarFiltro(
        "transportadora",
        transportadorasFiltros
      );
    }

    return;
  }

  const notaCards = document.querySelectorAll(".nota-card");
  const transportadoraCards = document.querySelectorAll(".transportadora-card");

  notaCards.forEach((notaCard) => {
    const notaNumero = notaCard.dataset.numero.toLowerCase();
    const notaStatus = notaCard.dataset.status;
    const transportadoraId = notaCard.closest(".transportadora-card").dataset
      .id;

    const matchesSearch = searchTerm === "" || notaNumero.includes(searchTerm);
    const matchesStatus =
      statusFiltros.length === 0 || statusFiltros.includes(notaStatus);
    const matchesTransportadora =
      transportadorasFiltros.length === 0 ||
      transportadorasFiltros.includes(transportadoraId);

    if (matchesSearch && matchesStatus && matchesTransportadora) {
      notaCard.style.display = "block";
    } else {
      notaCard.style.display = "none";
    }
  });

  transportadoraCards.forEach((card) => {
    const visibleNotas = card.querySelectorAll(
      '.nota-card[style="display: block"]'
    ).length;
    if (visibleNotas > 0) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });

  const notaRows = document.querySelectorAll(".tr-nota");

  notaRows.forEach((row) => {
    const notaNumero = row.dataset.numero.toLowerCase();
    const notaStatus = row.dataset.status;
    const transportadoraId = row.dataset.transportadora;

    const matchesSearch = searchTerm === "" || notaNumero.includes(searchTerm);
    const matchesStatus =
      statusFiltros.length === 0 || statusFiltros.includes(notaStatus);
    const matchesTransportadora =
      transportadorasFiltros.length === 0 ||
      transportadorasFiltros.includes(transportadoraId);

    if (matchesSearch && matchesStatus && matchesTransportadora) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
};

window.RastreamentoEvents.animateCards = function () {
  const cards = document.querySelectorAll(".transportadora-card");
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add("animate-in");
    }, 100 * index);
  });
};

window.RastreamentoEvents.configurarEventosDetalhes = function (todasNotas) {
  // Função auxiliar para criar handler de click
  const createDetalhesClickHandler = (notaNumero, todasNotas) => {
    return function () {
      const nota = todasNotas.find((n) => n.numero === notaNumero);
      if (nota) {
        const conteudoModal =
          window.RastreamentoModalRenderers.renderizarConteudoModal(nota);
        window.RastreamentoComponents.abrirModal(
          conteudoModal,
          `Detalhes da Nota ${notaNumero}`
        );
      } else {
        console.error("❌ Nota não encontrada:", notaNumero);
      }
    };
  };

  // Função auxiliar para configurar eventos dos botões
  const configurarBotoesDetalhes = () => {
    const botoesDetalhes = document.querySelectorAll(".detalhes-btn");
    botoesDetalhes.forEach((button) => {
      const notaNumero = button.dataset.nota;
      const clickHandler = createDetalhesClickHandler(notaNumero, todasNotas);
      button.addEventListener("click", clickHandler);
    });
  };

  setTimeout(configurarBotoesDetalhes, 100);
};

window.RastreamentoEvents.mostrarOverlayLoading = function () {
  const trackingView = document.getElementById("trackingView");
  if (!trackingView) return;

  // Remove overlay existente se houver
  const overlayExistente = document.querySelector(".rastreamento-loading-overlay");
  if (overlayExistente) {
    overlayExistente.remove();
  }

  // Garante que o trackingView tenha position relative
  if (getComputedStyle(trackingView).position === "static") {
    trackingView.style.position = "relative";
  }

  // Cria o overlay
  const overlay = document.createElement("div");
  overlay.className = "rastreamento-loading-overlay";
  overlay.innerHTML = `
    <div class="rastreamento-loading-content">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Carregando dados...</p>
    </div>
  `;

  trackingView.appendChild(overlay);
};

window.RastreamentoEvents.esconderOverlayLoading = function () {
  const overlay = document.querySelector(".rastreamento-loading-overlay");
  if (overlay) {
    overlay.remove();
  }
};

window.RastreamentoEvents.configurarEventosData = function () {
  const dataInput = document.getElementById("dataRastreamento");
  const btnAtualizar = document.getElementById("btnAtualizarData");

  if (dataInput && btnAtualizar) {
    // Verifica se o event listener já foi adicionado
    if (btnAtualizar.dataset.eventConfigured) {
      return;
    }
    btnAtualizar.dataset.eventConfigured = "true";

    btnAtualizar.addEventListener("click", async function () {
      const novaData = dataInput.value;
      const dataAtual = window.RastreamentoConfig.obterDataRastreamento();

      if (novaData && novaData !== dataAtual) {
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
        this.disabled = true;

        // Mostra o overlay de loading
        window.RastreamentoEvents.mostrarOverlayLoading();

        try {
          await window.RastreamentoAPI.recarregarDadosComNovaData(novaData);
          
          // Aguarda um pequeno delay para garantir que a renderização esteja completa
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error("❌ Erro no recarregamento:", error);
        } finally {
          // Esconde o overlay de loading
          window.RastreamentoEvents.esconderOverlayLoading();
          this.innerHTML = originalText;
          this.disabled = false;
        }
      }
    });

    dataInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        btnAtualizar.click();
      }
    });
  } else {
    console.error("❌ Elementos do datepicker não encontrados!");
  }
};

window.RastreamentoEvents.initRastreamentoEvents = function () {
  const filterButton = document.getElementById("filterButton");
  const filterDropdown = document.getElementById("filterDropdown");

  if (filterButton && filterDropdown) {
    filterButton.addEventListener("click", function () {
      filterDropdown.classList.toggle("active");
    });

    document.addEventListener("click", function (event) {
      if (
        !event.target.closest(".filter-container") &&
        filterDropdown.classList.contains("active")
      ) {
        filterDropdown.classList.remove("active");
      }
    });

    const applyFilters = document.getElementById("applyFilters");
    if (applyFilters) {
      applyFilters.addEventListener("click", function () {
        window.RastreamentoEvents.aplicarFiltros();
        filterDropdown.classList.remove("active");
      });
    }

    const clearFilters = document.getElementById("clearFilters");
    if (clearFilters) {
      clearFilters.addEventListener("click", function () {
        document
          .querySelectorAll('.filter-options input[type="checkbox"]')
          .forEach((checkbox) => {
            checkbox.checked = false;
          });
        window.RastreamentoEvents.aplicarFiltros();
        filterDropdown.classList.remove("active");
      });
    }
  }

  const viewToggleButtons = document.querySelectorAll(".view-toggle-btn");
  const viewContents = document.querySelectorAll(".view-content");

  viewToggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const viewType = this.dataset.view;

      viewToggleButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      viewContents.forEach((content) => {
        content.classList.remove("active");
        content.style.display = "none";
      });

      const activeContent = document.getElementById(`${viewType}View`);
      if (activeContent) {
        activeContent.classList.add("active");
        activeContent.style.display = "block";
      }
    });
  });

  const searchInput =
    document.getElementById("searchNota") ||
    document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      window.RastreamentoEvents.aplicarFiltros();
    });
  }

  const btnFiltrarAtrasados = document.querySelector(".btn-filtrar-atrasados");
  if (btnFiltrarAtrasados) {
    btnFiltrarAtrasados.addEventListener("click", function () {
      if (window.RastreamentoDataTablesRenderer && window.dataTableInstance) {
        window.RastreamentoDataTablesRenderer.aplicarFiltro("atrasadas", true);
        return;
      }

      const filtroAtrasado = document.getElementById("filtroAtrasado");
      if (filtroAtrasado) {
        filtroAtrasado.checked = true;
        window.RastreamentoEvents.aplicarFiltros();
      }
    });
  }

  const btnLimparFiltros = document.querySelector(".btn-limpar-filtros");
  if (btnLimparFiltros) {
    btnLimparFiltros.addEventListener("click", function () {
      if (window.RastreamentoDataTablesRenderer && window.dataTableInstance) {
        window.RastreamentoDataTablesRenderer.limparFiltros();
        return;
      }

      document
        .querySelectorAll('.filter-options input[type="checkbox"]')
        .forEach((checkbox) => {
          checkbox.checked = false;
        });
      window.RastreamentoEvents.aplicarFiltros();
    });
  }

  window.RastreamentoEvents.configurarEventosData();
};
