window.Administration = window.Administration || {};

function cancelPreviousFaixasPesoRequest() {
  if (window.Administration.state.requestControllers.faixasPeso) {
    window.Administration.state.requestControllers.faixasPeso.abort();
  }
}

function createNewFaixasPesoRequestController() {
  const controller = new AbortController();
  window.Administration.state.requestControllers.faixasPeso = controller;
  return controller;
}

function incrementFaixasPesoRequestSequence() {
  if (!window.Administration.state.requestSequence.faixasPeso) {
    window.Administration.state.requestSequence.faixasPeso = 0;
  }
  window.Administration.state.requestSequence.faixasPeso += 1;
  return window.Administration.state.requestSequence.faixasPeso;
}

function normalizeFaixasPesoSearchTerm(search) {
  return search && search.trim() !== "" ? search.trim() : null;
}

function buildFaixasPesoUrl(page, limit, searchTerm) {
  let url = `/faixas-peso?page=${page}&limit=${limit}`;
  if (searchTerm) {
    url += `&search=${encodeURIComponent(searchTerm)}`;
  }
  return url;
}

function isFaixasPesoRequestStillValid(currentSequence) {
  return (
    window.Administration.state.requestSequence.faixasPeso === currentSequence
  );
}

function updateFaixasPesoPaginationFromResponse(response) {
  const pagination = window.Administration.state.pagination["faixasPeso"];
  if (pagination && response.pagination) {
    pagination.currentPage = response.pagination.page;
    pagination.totalItems = response.pagination.total;
    pagination.totalPages = response.pagination.totalPages;
    pagination.itemsPerPage = response.pagination.limit;
  }
}

function handleFaixasPesoResponseData(response, searchTerm) {
  if (!response?.data) {
    return;
  }

  updateFaixasPesoPaginationFromResponse(response);
  window.Administration.state.faixasPeso = response.data;

  if (!searchTerm) {
    window.Administration.state.filteredData.faixasPeso = null;
  }

  window.Administration.renderFaixasPeso(response.data);
}

function isFaixasPesoAbortError(error, controller) {
  return error.name === "AbortError" || controller.signal.aborted;
}

function handleLoadFaixasPesoError(error, controller, currentSequence) {
  if (
    isFaixasPesoAbortError(error, controller) ||
    !isFaixasPesoRequestStillValid(currentSequence)
  ) {
    return;
  }

  console.error("❌ Erro ao carregar faixas de peso:", error);
  window.Administration.showError("Erro ao carregar faixas de peso");
}

window.Administration.loadFaixasPeso = async function (
  page = 1,
  limit = 50,
  search = null
) {
  cancelPreviousFaixasPesoRequest();
  const controller = createNewFaixasPesoRequestController();
  const currentSequence = incrementFaixasPesoRequestSequence();

  try {
    window.Administration.initPagination("faixasPeso", limit);

    const searchTerm = normalizeFaixasPesoSearchTerm(search);
    window.Administration.state.currentSearchFaixasPeso = searchTerm;

    const url = buildFaixasPesoUrl(page, limit, searchTerm);
    const response = await window.Administration.apiRequest(url, {
      signal: controller.signal,
    });

    if (!isFaixasPesoRequestStillValid(currentSequence) || controller.signal.aborted) {
      return;
    }

    handleFaixasPesoResponseData(response, searchTerm);
  } catch (error) {
    handleLoadFaixasPesoError(error, controller, currentSequence);
  } finally {
    if (isFaixasPesoRequestStillValid(currentSequence)) {
      window.Administration.state.requestControllers.faixasPeso = null;
    }
  }
};

window.Administration.renderFaixasPeso = function (faixas) {
  const tbody = document.querySelector("#faixasPesoTable tbody");
  if (!tbody) return;

  // Se há dados filtrados, usa paginação client-side
  const dataToRender = window.Administration.state.filteredData.faixasPeso;
  
  if (dataToRender) {
    // Paginação client-side para dados filtrados
    const { items, pagination } = window.Administration.getPaginatedData(
      dataToRender,
      "faixasPeso"
    );

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="loading-data">Nenhuma faixa encontrada</td>
        </tr>
      `;
      window.Administration.renderPagination(
        "faixasPesoPagination",
        "faixasPeso",
        () => {
          window.Administration.renderFaixasPeso();
        }
      );
      return;
    }

    tbody.innerHTML = items
      .map(
        (faixa) => `
      <tr>
        <td>${faixa.peso_minimo}</td>
        <td>${faixa.peso_maximo}</td>
        <td>${faixa.descricao}</td>
        <td>${faixa.ordem_faixa}</td>
        <td><span class="status-badge ${faixa.ativa ? "active" : "inactive"}">${
          faixa.ativa ? "Ativa" : "Inativa"
        }</span></td>
        <td>
          <button class="btn-icon edit-entity" data-entity-type="faixa-peso" data-id="${
            faixa.id_faixa
          }" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete-entity" data-entity-type="faixa-peso" data-id="${
            faixa.id_faixa
          }" title="Excluir">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `
      )
      .join("");

    window.Administration.renderPagination(
      "faixasPesoPagination",
      "faixasPeso",
      () => {
        window.Administration.renderFaixasPeso();
      }
    );
  } else {
    // Renderização direta para dados paginados do servidor
    const data = faixas || window.Administration.state.faixasPeso || [];

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="loading-data">Nenhuma faixa encontrada</td>
        </tr>
      `;
      window.Administration.renderPagination(
        "faixasPesoPagination",
        "faixasPeso",
        () => {
          const pagination = window.Administration.state.pagination["faixasPeso"];
          if (pagination) {
            const searchTerm = window.Administration.state.currentSearchFaixasPeso || null;
            window.Administration.loadFaixasPeso(pagination.currentPage, pagination.itemsPerPage, searchTerm);
          }
        }
      );
      return;
    }

    tbody.innerHTML = data
      .map(
        (faixa) => `
      <tr>
        <td>${faixa.peso_minimo}</td>
        <td>${faixa.peso_maximo}</td>
        <td>${faixa.descricao}</td>
        <td>${faixa.ordem_faixa}</td>
        <td><span class="status-badge ${faixa.ativa ? "active" : "inactive"}">${
          faixa.ativa ? "Ativa" : "Inativa"
        }</span></td>
        <td>
          <button class="btn-icon edit-entity" data-entity-type="faixa-peso" data-id="${
            faixa.id_faixa
          }" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete-entity" data-entity-type="faixa-peso" data-id="${
            faixa.id_faixa
          }" title="Excluir">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `
      )
      .join("");

    window.Administration.renderPagination(
      "faixasPesoPagination",
      "faixasPeso",
      () => {
        const pagination = window.Administration.state.pagination["faixasPeso"];
        if (pagination) {
          const searchTerm = window.Administration.state.currentSearchFaixasPeso || null;
          window.Administration.loadFaixasPeso(pagination.currentPage, pagination.itemsPerPage, searchTerm);
        }
      }
    );
  }

  // Adiciona event listeners aos botões
  document
    .querySelectorAll(".edit-entity[data-entity-type='faixa-peso']")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        window.Administration.openFaixaPesoModal(id);
      });
    });

  document
    .querySelectorAll(".delete-entity[data-entity-type='faixa-peso']")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        window.Administration.deleteFaixaPeso(id);
      });
    });
};

window.Administration.openFaixaPesoModal = async function (id = null) {
  const modal = document.getElementById("faixaPesoModal");
  if (!modal) {
    window.Administration.showError("Modal de faixa de peso não encontrado");
    return;
  }

  if (id) {
    // Busca a faixa no estado atual ou faz uma requisição se não estiver disponível
    let faixa = window.Administration.state.faixasPeso.find(
      (f) => f.id_faixa == id
    );
    
    if (!faixa) {
      // Se a faixa não estiver na página atual, busca do servidor
      try {
        faixa = await window.Administration.apiRequest(`/faixas-peso/${id}`);
      } catch (error) {
        console.error("❌ Erro ao buscar faixa de peso:", error);
        window.Administration.showError("Erro ao carregar dados da faixa de peso");
        return;
      }
    }
    
    if (faixa) {
      document.getElementById("faixaPesoId").value = faixa.id_faixa;
      document.getElementById("faixaPesoMinimo").value = faixa.peso_minimo;
      document.getElementById("faixaPesoMaximo").value = faixa.peso_maximo;
      document.getElementById("faixaPesoDescricao").value = faixa.descricao;
      document.getElementById("faixaPesoOrdem").value = faixa.ordem_faixa;
      document.getElementById("faixaPesoModalTitle").textContent =
        "Editar Faixa de Peso";
    }
  } else {
    document.getElementById("faixaPesoForm").reset();
    document.getElementById("faixaPesoId").value = "";
    document.getElementById("faixaPesoModalTitle").textContent =
      "Nova Faixa de Peso";
  }

  modal.classList.add("active");
};

window.Administration.saveFaixaPeso = async function () {
  const form = document.getElementById("faixaPesoForm");
  const id = document.getElementById("faixaPesoId").value;
  const faixaData = {
    peso_minimo: parseFloat(document.getElementById("faixaPesoMinimo").value),
    peso_maximo: parseFloat(document.getElementById("faixaPesoMaximo").value),
    descricao: document.getElementById("faixaPesoDescricao").value,
    ordem_faixa: parseInt(document.getElementById("faixaPesoOrdem").value),
    ativa: true,
  };

  try {
    if (id) {
      await window.Administration.apiRequest(`/faixas-peso/${id}`, {
        method: "PUT",
        body: JSON.stringify(faixaData),
      });
    } else {
      await window.Administration.apiRequest("/faixas-peso", {
        method: "POST",
        body: JSON.stringify(faixaData),
      });
    }

    window.Administration.showSuccess(
      id
        ? "Faixa de peso atualizada com sucesso"
        : "Faixa de peso criada com sucesso"
    );
    document.getElementById("faixaPesoModal").classList.remove("active");
    form.reset();
    
    // Recarrega a página atual mantendo a busca se houver
    const pagination = window.Administration.state.pagination["faixasPeso"];
    const searchTerm = window.Administration.state.currentSearchFaixasPeso || null;
    if (pagination) {
      window.Administration.loadFaixasPeso(pagination.currentPage, pagination.itemsPerPage, searchTerm);
    } else {
      window.Administration.loadFaixasPeso(1, 50, searchTerm);
    }
  } catch (error) {
    console.error("❌ Erro ao salvar faixa de peso:", error);
    window.Administration.showError("Erro ao salvar faixa de peso");
  }
};

window.Administration.deleteFaixaPeso = async function (id) {
  try {
    const counts = await window.Administration.apiRequest(
      `/faixas-peso/${id}/count-related`
    );

    // Busca a faixa no estado atual ou faz uma requisição se não estiver disponível
    let faixa = window.Administration.state.faixasPeso.find(
      (f) => f.id_faixa == id
    );
    
    if (!faixa) {
      // Se a faixa não estiver na página atual, busca do servidor
      try {
        faixa = await window.Administration.apiRequest(`/faixas-peso/${id}`);
      } catch (error) {
        console.error("❌ Erro ao buscar faixa de peso:", error);
        window.Administration.showError("Erro ao carregar dados da faixa de peso");
        return;
      }
    }
    
    const faixaNome = faixa
      ? faixa.descricao || `Faixa ${faixa.peso_minimo} - ${faixa.peso_maximo}kg`
      : "esta faixa de peso";

    const title = "Confirmar Desativação";
    const message = `Tem certeza que deseja desativar ${faixaNome}? O registro será desativado e não aparecerá mais nas listagens.`;

    window.Administration.openDeleteConfirmModal(
      title,
      message,
      counts,
      async () => {
        try {
          await window.Administration.apiRequest(`/faixas-peso/${id}`, {
            method: "DELETE",
          });
          window.Administration.showSuccess(
            "Faixa de peso desativada com sucesso"
          );
          
          // Recarrega a página atual mantendo a busca se houver
          const pagination = window.Administration.state.pagination["faixasPeso"];
          const searchTerm = window.Administration.state.currentSearchFaixasPeso || null;
          if (pagination) {
            window.Administration.loadFaixasPeso(pagination.currentPage, pagination.itemsPerPage, searchTerm);
          } else {
            window.Administration.loadFaixasPeso(1, 50, searchTerm);
          }
        } catch (error) {
          console.error("❌ Erro ao excluir faixa de peso:", error);
          window.Administration.showError("Erro ao excluir faixa de peso");
        }
      }
    );
  } catch (error) {
    console.error("❌ Erro ao buscar informações de exclusão:", error);
    window.Administration.showError("Erro ao buscar informações de exclusão");
  }
};
