window.Administration = window.Administration || {};

// Função para atualizar contador de selecionadas
function updateSelectedCount() {
  const countElement = document.getElementById("countSelected");
  if (!countElement) return;

  const checkboxes = document.querySelectorAll(
    '#transportadorasExcluidasList input[type="checkbox"]:checked:not(:disabled)'
  );
  const count = checkboxes.length;

  countElement.textContent = count;

  const countContainer = document.getElementById(
    "transportadorasSelecionadasCount"
  );
  if (countContainer) {
    if (count === 0) {
      countContainer.style.background = "#f1f5f9";
      countContainer.style.color = "#64748b";
    } else {
      countContainer.style.background = "rgba(36, 118, 117, 0.1)";
      countContainer.style.color = "#247675";
    }
  }

  // Atualizar texto do botão de salvar
  const saveBtn = document.getElementById("saveTransportadoraExcluidaBtn");
  if (saveBtn) {
    if (count === 0) {
      saveBtn.disabled = true;
      saveBtn.style.opacity = "0.6";
      saveBtn.style.cursor = "not-allowed";
    } else {
      saveBtn.disabled = false;
      saveBtn.style.opacity = "1";
      saveBtn.style.cursor = "pointer";
      saveBtn.innerHTML = `<i class="fas fa-save"></i> Salvar ${count} Transportadora(s) sem Rastreamento`;
    }
  }
}

// Função para renderizar a lista de transportadoras com filtro
function renderTransportadorasList() {
  console.log("🔄 [Render] Iniciando renderização da lista");

  const transportadorasList = document.getElementById(
    "transportadorasExcluidasList"
  );
  const searchInput = document.getElementById(
    "transportadoraExcluidaModalSearchInput"
  );

  console.log("🔄 [Render] Elementos encontrados:", {
    transportadorasList: !!transportadorasList,
    searchInput: !!searchInput,
    searchInputValue: searchInput?.value || "não encontrado",
  });

  // Preservar seleções antes de re-renderizar
  const selectedCardCodes = new Set();
  if (transportadorasList) {
    const existingCheckboxes = transportadorasList.querySelectorAll(
      'input[type="checkbox"]:checked:not(:disabled)'
    );
    existingCheckboxes.forEach((checkbox) => {
      const cardCode = checkbox.value || checkbox.dataset.cardCode;
      if (cardCode) {
        selectedCardCodes.add(cardCode);
      }
    });
  }
  console.log(
    "🔄 [Render] Seleções preservadas:",
    Array.from(selectedCardCodes)
  );

  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
  console.log("🔄 [Render] Termo de busca:", searchTerm);

  const allTransportadoras =
    window.Administration.state.allTransportadorasForExclusao || [];
  console.log(
    "🔄 [Render] Total de transportadoras disponíveis:",
    allTransportadoras.length
  );

  // Filtrar transportadoras
  const filteredTransportadoras = allTransportadoras.filter((transp) => {
    if (!searchTerm) return true;
    const matches =
      transp.cardCode.toLowerCase().includes(searchTerm) ||
      transp.nome.toLowerCase().includes(searchTerm);
    return matches;
  });

  console.log(
    "🔄 [Render] Transportadoras após filtro:",
    filteredTransportadoras.length
  );

  transportadorasList.innerHTML = "";

  if (filteredTransportadoras.length === 0) {
    transportadorasList.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #64748b;">
        <i class="fas fa-search" style="font-size: 32px; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
        <div style="font-weight: 600; margin-bottom: 5px; color: #1e293b;">Nenhuma transportadora encontrada</div>
        <div style="font-size: 0.9em;">Tente ajustar o termo de busca</div>
      </div>
    `;
    updateSelectedCount();
    return;
  }

  filteredTransportadoras.forEach((transp) => {
    const checkboxDiv = document.createElement("div");
    checkboxDiv.className = "transportadora-excluida-item";
    checkboxDiv.style.cssText = `
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      transition: background-color 0.2s;
      ${transp.jaExcluida ? "background-color: #f1f5f9; opacity: 0.7;" : ""}
    `;

    checkboxDiv.addEventListener("mouseenter", function () {
      if (!transp.jaExcluida) {
        this.style.backgroundColor = "rgba(36, 118, 117, 0.05)";
      }
    });

    checkboxDiv.addEventListener("mouseleave", function () {
      if (!transp.jaExcluida) {
        this.style.backgroundColor = "";
      }
    });

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `transportadora_${transp.cardCode}`;
    checkbox.value = transp.cardCode;
    checkbox.dataset.cardCode = transp.cardCode;
    checkbox.dataset.nome = transp.nome;
    checkbox.disabled = transp.jaExcluida;

    // Restaurar seleção se estava marcada antes
    if (selectedCardCodes.has(transp.cardCode)) {
      checkbox.checked = true;
    }

    checkbox.style.cssText = `
      margin-right: 12px;
      cursor: ${transp.jaExcluida ? "not-allowed" : "pointer"};
      width: 18px;
      height: 18px;
      accent-color: #247675;
    `;

    checkbox.addEventListener("change", updateSelectedCount);

    const label = document.createElement("label");
    label.htmlFor = `transportadora_${transp.cardCode}`;
    label.style.cssText = `
      flex: 1;
      cursor: ${transp.jaExcluida ? "not-allowed" : "pointer"};
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    label.innerHTML = `
      <span style="font-weight: 600; color: #247675; min-width: 80px;">${
        transp.cardCode
      }</span>
      <span style="flex: 1; color: ${
        transp.jaExcluida ? "#64748b" : "#1e293b"
      };">
        ${transp.nome}
      </span>
      ${
        transp.jaExcluida
          ? '<span style="color: #f59e0b; font-size: 0.85em; font-weight: 600;"><i class="fas fa-ban"></i> Já sem rastreamento</span>'
          : ""
      }
    `;

    checkboxDiv.appendChild(checkbox);
    checkboxDiv.appendChild(label);
    transportadorasList.appendChild(checkboxDiv);
  });

  updateSelectedCount();
}

// Exportar funções para uso externo
window.Administration.renderTransportadorasList = renderTransportadorasList;
window.Administration.updateSelectedCount = updateSelectedCount;

function cancelPreviousTransportadorasExcluidasRequest() {
  if (window.Administration.state.requestControllers.transportadorasExcluidas) {
    window.Administration.state.requestControllers.transportadorasExcluidas.abort();
  }
}

function createNewTransportadorasExcluidasRequestController() {
  const controller = new AbortController();
  window.Administration.state.requestControllers.transportadorasExcluidas =
    controller;
  return controller;
}

function incrementTransportadorasExcluidasRequestSequence() {
  if (!window.Administration.state.requestSequence.transportadorasExcluidas) {
    window.Administration.state.requestSequence.transportadorasExcluidas = 0;
  }
  window.Administration.state.requestSequence.transportadorasExcluidas += 1;
  return window.Administration.state.requestSequence.transportadorasExcluidas;
}

function normalizeTransportadorasExcluidasSearchTerm(search) {
  return search && search.trim() !== "" ? search.trim() : null;
}

function buildTransportadorasExcluidasUrl(page, limit, searchTerm) {
  let url = `/transportadorasExcluidas?page=${page}&limit=${limit}`;
  if (searchTerm) {
    url += `&search=${encodeURIComponent(searchTerm)}`;
  }
  return url;
}

function isTransportadorasExcluidasRequestStillValid(currentSequence) {
  return (
    window.Administration.state.requestSequence.transportadorasExcluidas ===
    currentSequence
  );
}

function updateTransportadorasExcluidasPaginationFromResponse(response) {
  const pagination =
    window.Administration.state.pagination["transportadorasExcluidas"];
  if (pagination && response.pagination) {
    pagination.currentPage = response.pagination.page;
    pagination.totalItems = response.pagination.total;
    pagination.totalPages = response.pagination.totalPages;
    pagination.itemsPerPage = response.pagination.limit;
  }
}

function handleTransportadorasExcluidasResponseData(response, searchTerm) {
  updateTransportadorasExcluidasPaginationFromResponse(response);
  window.Administration.state.transportadorasExcluidas = response.data;

  if (!searchTerm) {
    window.Administration.state.filteredData.transportadorasExcluidas = null;
  }

  window.Administration.renderTransportadorasExcluidas(response.data);
}

function isTransportadorasExcluidasAbortError(error, controller) {
  return error.name === "AbortError" && controller.signal.aborted;
}

function handleLoadTransportadorasExcluidasError(
  error,
  controller,
  currentSequence
) {
  if (
    isTransportadorasExcluidasAbortError(error, controller) ||
    !isTransportadorasExcluidasRequestStillValid(currentSequence)
  ) {
    return;
  }
  console.error("❌ Erro ao carregar transportadoras sem rastreamento:", error);
  window.Administration.showError(
    "Erro ao carregar transportadoras sem rastreamento"
  );
}

window.Administration.loadTransportadorasExcluidas = async function (
  page = 1,
  limit = 50,
  search = null
) {
  cancelPreviousTransportadorasExcluidasRequest();
  const controller = createNewTransportadorasExcluidasRequestController();
  const currentSequence = incrementTransportadorasExcluidasRequestSequence();

  try {
    window.Administration.initPagination("transportadorasExcluidas", limit);

    const searchTerm = normalizeTransportadorasExcluidasSearchTerm(search);
    window.Administration.state.currentSearchTransportadorasExcluidas =
      searchTerm;

    const url = buildTransportadorasExcluidasUrl(page, limit, searchTerm);

    const response = await window.Administration.apiRequest(url, {
      signal: controller.signal,
    });

    if (
      !isTransportadorasExcluidasRequestStillValid(currentSequence) ||
      controller.signal.aborted
    ) {
      return;
    }

    handleTransportadorasExcluidasResponseData(response, searchTerm);
  } catch (error) {
    handleLoadTransportadorasExcluidasError(error, controller, currentSequence);
  } finally {
    if (isTransportadorasExcluidasRequestStillValid(currentSequence)) {
      window.Administration.state.requestControllers.transportadorasExcluidas =
        null;
    }
  }
};

window.Administration.renderTransportadorasExcluidas = function (
  transportadorasExcluidas
) {
  const tbody = document.querySelector("#transportadorasExcluidasTable tbody");
  if (!tbody) return;

  const dataToRender =
    window.Administration.state.filteredData.transportadorasExcluidas;

  if (!transportadorasExcluidas || transportadorasExcluidas.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="loading-data">Nenhuma transportadora sem rastreamento encontrada</td>
      </tr>
    `;
    window.Administration.renderPagination(
      "transportadorasExcluidasPagination",
      "transportadorasExcluidas",
      () => {
        window.Administration.renderTransportadorasExcluidas();
      }
    );
    return;
  }

  tbody.innerHTML = transportadorasExcluidas
    .map((exclusao) => {
      const transportadora = exclusao.Transportadora || {};
      const nomeTransportadora =
        transportadora.CardName ||
        transportadora.CardFName ||
        exclusao.card_code ||
        "N/A";
      const motivo = exclusao.motivo || "Não especificado";

      return `
        <tr>
          <td>${nomeTransportadora}</td>
          <td>${exclusao.card_code}</td>
          <td>${motivo}</td>
          <td>
            <button class="btn-icon delete-entity" data-entity-type="transportadoraExcluida" data-id="${exclusao.id_exclusao}" title="Remover">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  // Adicionar event listeners
  document
    .querySelectorAll(
      ".delete-entity[data-entity-type='transportadoraExcluida']"
    )
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        window.Administration.deleteTransportadoraExcluida(id);
      });
    });

  window.Administration.renderPagination(
    "transportadorasExcluidasPagination",
    "transportadorasExcluidas",
    () => {
      const pagination =
        window.Administration.state.pagination["transportadorasExcluidas"];
      if (pagination) {
        const searchTerm =
          window.Administration.state.currentSearchTransportadorasExcluidas ||
          null;
        window.Administration.loadTransportadorasExcluidas(
          pagination.currentPage,
          pagination.itemsPerPage,
          searchTerm
        );
      }
    }
  );
};

window.Administration.openTransportadoraExcluidaModal = async function () {
  const modal = document.getElementById("transportadoraExcluidaModal");
  if (!modal) {
    window.Administration.showError("Modal não encontrado");
    return;
  }

  const form = document.getElementById("transportadoraExcluidaForm");
  const transportadorasList = document.getElementById(
    "transportadorasExcluidasList"
  );
  const motivoInput = document.getElementById("transportadoraExcluidaMotivo");

  // Limpar formulário
  form.reset();

  // Limpar campo de busca do modal
  const searchInput = document.getElementById(
    "transportadoraExcluidaModalSearchInput"
  );
  if (searchInput) {
    searchInput.value = "";
  }

  // Atualizar contador
  updateSelectedCount();

  // Carregar transportadoras do SAP B1
  transportadorasList.innerHTML = `
    <div style="text-align: center; padding: 40px 20px; color: #64748b">
      <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px; display: block; color: #247675;"></i>
      <span>Carregando transportadoras...</span>
    </div>
  `;

  try {
    // Buscar todas as transportadoras
    const response = await window.Administration.apiRequest(
      `/transportadoras?page=1&limit=10000`
    );
    const carriers = response.data || [];

    // Buscar transportadoras já sem rastreamento
    const exclusoesResponse = await window.Administration.apiRequest(
      `/transportadorasExcluidas?page=1&limit=10000`
    );
    const exclusoes = exclusoesResponse.data || [];
    const cardCodesExcluidos = exclusoes.map((e) => e.card_code);

    // Armazenar todas as transportadoras para filtro
    window.Administration.state.allTransportadorasForExclusao = carriers.map(
      (carrier) => {
        const cardCode = carrier.CardCode || carrier.card_code;
        const nome =
          carrier.CardName ||
          carrier.CardFName ||
          carrier.nome_transportadora ||
          cardCode;
        return {
          cardCode,
          nome,
          jaExcluida: cardCodesExcluidos.includes(cardCode),
        };
      }
    );

    // Renderizar lista
    renderTransportadorasList();

    document.getElementById("transportadoraExcluidaModalTitle").innerHTML =
      '<i class="fas fa-ban"></i> Nova Transportadora sem Rastreamento';
  } catch (error) {
    console.error("❌ Erro ao carregar transportadoras:", error);
    transportadorasList.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #ef4444;">
        <i class="fas fa-exclamation-triangle" style="font-size: 32px; margin-bottom: 10px; display: block;"></i>
        <div style="font-weight: 600; margin-bottom: 5px; color: #1e293b;">Erro ao carregar transportadoras</div>
        <div style="font-size: 0.9em; color: #64748b;">${
          error.message || "Tente novamente mais tarde"
        }</div>
      </div>
    `;
    window.Administration.showError("Erro ao carregar transportadoras");
    return;
  }

  // Adicionar event listener para busca (após o modal estar aberto e dados carregados)
  const searchInputModal = document.getElementById(
    "transportadoraExcluidaModalSearchInput"
  );
  console.log(
    "🔍 [Busca] Procurando campo de busca do modal:",
    searchInputModal
  );

  if (searchInputModal) {
    console.log("✅ [Busca] Campo de busca encontrado, adicionando listener");

    // Remover listeners antigos clonando o elemento
    const newSearchInput = searchInputModal.cloneNode(true);
    searchInputModal.parentNode.replaceChild(newSearchInput, searchInputModal);

    // Adicionar novo listener
    let searchTimeout = null;
    newSearchInput.addEventListener("input", (e) => {
      const searchValue = e.target.value;
      console.log("🔍 [Busca] Input detectado, valor:", searchValue);

      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      searchTimeout = setTimeout(() => {
        console.log("🔍 [Busca] Executando filtro após debounce");
        console.log(
          "🔍 [Busca] Dados disponíveis:",
          window.Administration.state.allTransportadorasForExclusao?.length || 0
        );
        renderTransportadorasList();
      }, 300);
    });

    console.log("✅ [Busca] Listener adicionado com sucesso");
  } else {
    console.error("❌ [Busca] Campo de busca do modal não encontrado!");
  }

  modal.classList.add("active");
};

window.Administration.saveTransportadoraExcluida = async function () {
  const form = document.getElementById("transportadoraExcluidaForm");
  const motivo = document.getElementById("transportadoraExcluidaMotivo").value;

  // Buscar checkboxes selecionados
  const checkboxes = document.querySelectorAll(
    '#transportadorasExcluidasList input[type="checkbox"]:checked:not(:disabled)'
  );

  if (checkboxes.length === 0) {
    window.Administration.showError("Selecione pelo menos uma transportadora");
    return;
  }

  const cardCodes = Array.from(checkboxes).map((cb) => cb.value);

  try {
    // Criar múltiplas exclusões
    const promises = cardCodes.map((cardCode) => {
      const data = {
        card_code: cardCode,
        motivo: motivo || null,
      };
      return window.Administration.apiRequest("/transportadorasExcluidas", {
        method: "POST",
        body: JSON.stringify(data),
      });
    });

    await Promise.all(promises);

    window.Administration.showSuccess(
      `${cardCodes.length} transportadora(s) marcada(s) como sem rastreamento com sucesso`
    );

    document
      .getElementById("transportadoraExcluidaModal")
      .classList.remove("active");
    form.reset();

    // Recarregar lista
    await window.Administration.loadTransportadorasExcluidas();
  } catch (error) {
    console.error("❌ Erro ao salvar:", error);
    const errorMessage = error.message || "Erro ao salvar exclusões";
    window.Administration.showError(errorMessage);
  }
};

window.Administration.deleteTransportadoraExcluida = async function (id) {
  try {
    // Buscar dados para exibir no modal de confirmação
    const exclusao = await window.Administration.apiRequest(
      `/transportadorasExcluidas/${id}`
    );

    const transportadora = exclusao.Transportadora || {};
    const nomeTransportadora =
      transportadora.CardName ||
      transportadora.CardFName ||
      exclusao.card_code ||
      "N/A";

    const title = "Confirmar Remoção";
    const message = `Tem certeza que deseja remover a transportadora "${nomeTransportadora}" (${exclusao.card_code}) da lista de sem rastreamento? Esta transportadora voltará a ser processada no rastreamento.`;

    window.Administration.openDeleteConfirmModal(
      title,
      message,
      {},
      async () => {
        try {
          await window.Administration.apiRequest(
            `/transportadorasExcluidas/${id}`,
            {
              method: "DELETE",
            }
          );
          window.Administration.showSuccess("Exclusão removida com sucesso");

          // Recarregar lista
          await window.Administration.loadTransportadorasExcluidas();
        } catch (error) {
          console.error("❌ Erro ao remover:", error);
          window.Administration.showError("Erro ao remover exclusão");
        }
      }
    );
  } catch (error) {
    console.error("❌ Erro ao buscar informações:", error);
    window.Administration.showError("Erro ao buscar informações");
  }
};
