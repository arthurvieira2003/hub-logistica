/**
 * Gerenciador de Eventos
 * Contém funções para gerenciar eventos da interface de rastreamento
 */

// Namespace para eventos
window.RastreamentoEvents = window.RastreamentoEvents || {};

/**
 * Aplica filtros na tabela (compatível com DataTables)
 */
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

  // Se DataTables está disponível, usar filtros do DataTables
  if (window.RastreamentoDataTablesRenderer && window.dataTableInstance) {
    // Aplicar filtro de busca
    if (searchTerm) {
      window.RastreamentoDataTablesRenderer.aplicarFiltro("busca", searchTerm);
    }

    // Aplicar filtros de status
    if (statusFiltros.length > 0) {
      window.RastreamentoDataTablesRenderer.aplicarFiltro(
        "status",
        statusFiltros
      );
    }

    // Aplicar filtros de transportadora
    if (transportadorasFiltros.length > 0) {
      window.RastreamentoDataTablesRenderer.aplicarFiltro(
        "transportadora",
        transportadorasFiltros
      );
    }

    return;
  }

  // Fallback para sistema de cards (compatibilidade)
  const notaCards = document.querySelectorAll(".nota-card");
  const transportadoraCards = document.querySelectorAll(".transportadora-card");

  // Filtrar notas nos cards
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

  // Atualizar visibilidade dos cards de transportadoras
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

  // Filtrar linhas da tabela
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

/**
 * Anima os cards na entrada
 */
window.RastreamentoEvents.animateCards = function () {
  const cards = document.querySelectorAll(".transportadora-card");
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add("animate-in");
    }, 100 * index);
  });
};

/**
 * Configura eventos para os botões de detalhes
 * @param {Array} todasNotas - Array com todas as notas
 */
window.RastreamentoEvents.configurarEventosDetalhes = function (todasNotas) {
  setTimeout(() => {
    const botoesDetalhes = document.querySelectorAll(".detalhes-btn");

    botoesDetalhes.forEach((button, index) => {
      button.addEventListener("click", function () {
        const notaNumero = this.getAttribute("data-nota");

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
      });
    });
  }, 100);
};

/**
 * Configura eventos para o seletor de data
 */
window.RastreamentoEvents.configurarEventosData = function () {
  const dataInput = document.getElementById("dataRastreamento");
  const btnAtualizar = document.getElementById("btnAtualizarData");

  if (dataInput && btnAtualizar) {
    // Event listener para o botão Atualizar
    btnAtualizar.addEventListener("click", async function () {
      const novaData = dataInput.value;
      const dataAtual = window.RastreamentoConfig.obterDataRastreamento();

      if (novaData && novaData !== dataAtual) {
        // Mostrar loading no botão
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
        this.disabled = true;

        try {
          await window.RastreamentoAPI.recarregarDadosComNovaData(novaData);
        } catch (error) {
          console.error("❌ Erro no recarregamento:", error);
        } finally {
          // Restaurar botão
          this.innerHTML = originalText;
          this.disabled = false;
        }
      }
    });

    // Event listener para Enter no input de data
    dataInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        btnAtualizar.click();
      }
    });
  } else {
    console.error("❌ Elementos do datepicker não encontrados!");
  }
};

/**
 * Inicializa os eventos da interface de rastreamento
 */
window.RastreamentoEvents.initRastreamentoEvents = function () {
  // Eventos para os filtros
  const filterButton = document.getElementById("filterButton");
  const filterDropdown = document.getElementById("filterDropdown");

  if (filterButton && filterDropdown) {
    filterButton.addEventListener("click", function () {
      filterDropdown.classList.toggle("active");
    });

    // Fechar dropdown ao clicar fora
    document.addEventListener("click", function (event) {
      if (
        !event.target.closest(".filter-container") &&
        filterDropdown.classList.contains("active")
      ) {
        filterDropdown.classList.remove("active");
      }
    });

    // Aplicar filtros
    const applyFilters = document.getElementById("applyFilters");
    if (applyFilters) {
      applyFilters.addEventListener("click", function () {
        window.RastreamentoEvents.aplicarFiltros();
        filterDropdown.classList.remove("active");
      });
    }

    // Limpar filtros
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

  // Eventos para alternar entre visualizações
  const viewToggleButtons = document.querySelectorAll(".view-toggle-btn");
  const viewContents = document.querySelectorAll(".view-content");

  viewToggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const viewType = this.dataset.view;

      // Atualizar botões
      viewToggleButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      // Atualizar conteúdo
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

  // Eventos para busca
  const searchInput =
    document.getElementById("searchNota") ||
    document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      window.RastreamentoEvents.aplicarFiltros();
    });
  }

  // Eventos para botões de filtrar atrasados
  const btnFiltrarAtrasados = document.querySelector(".btn-filtrar-atrasados");
  if (btnFiltrarAtrasados) {
    btnFiltrarAtrasados.addEventListener("click", function () {
      // Se DataTables está disponível, usar filtro específico
      if (window.RastreamentoDataTablesRenderer && window.dataTableInstance) {
        window.RastreamentoDataTablesRenderer.aplicarFiltro("atrasadas", true);
        return;
      }

      // Fallback para sistema de cards
      const filtroAtrasado = document.getElementById("filtroAtrasado");
      if (filtroAtrasado) {
        filtroAtrasado.checked = true;
        window.RastreamentoEvents.aplicarFiltros();
      }
    });
  }

  // Eventos para botões de limpar filtros
  const btnLimparFiltros = document.querySelector(".btn-limpar-filtros");
  if (btnLimparFiltros) {
    btnLimparFiltros.addEventListener("click", function () {
      // Se DataTables está disponível, usar limpeza específica
      if (window.RastreamentoDataTablesRenderer && window.dataTableInstance) {
        window.RastreamentoDataTablesRenderer.limparFiltros();
        return;
      }

      // Fallback para sistema de cards
      document
        .querySelectorAll('.filter-options input[type="checkbox"]')
        .forEach((checkbox) => {
          checkbox.checked = false;
        });
      window.RastreamentoEvents.aplicarFiltros();
    });
  }

  // Configurar eventos do seletor de data
  window.RastreamentoEvents.configurarEventosData();
};
