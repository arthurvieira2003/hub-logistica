window.Administration = window.Administration || {};

function cancelPreviousTransportadorasRequest() {
  if (window.Administration.state.requestControllers.transportadoras) {
    window.Administration.state.requestControllers.transportadoras.abort();
  }
}

function createNewTransportadorasRequestController() {
  const controller = new AbortController();
  window.Administration.state.requestControllers.transportadoras = controller;
  return controller;
}

function incrementTransportadorasRequestSequence() {
  if (!window.Administration.state.requestSequence.transportadoras) {
    window.Administration.state.requestSequence.transportadoras = 0;
  }
  window.Administration.state.requestSequence.transportadoras += 1;
  return window.Administration.state.requestSequence.transportadoras;
}

function normalizeTransportadorasSearchTerm(search) {
  return search && search.trim() !== "" ? search.trim() : null;
}

function buildTransportadorasUrl(page, limit, searchTerm) {
  let url = `/transportadoras?page=${page}&limit=${limit}`;
  if (searchTerm) {
    url += `&search=${encodeURIComponent(searchTerm)}`;
  }
  return url;
}

function isTransportadorasRequestStillValid(currentSequence) {
  return (
    window.Administration.state.requestSequence.transportadoras ===
    currentSequence
  );
}

function updateTransportadorasPaginationFromResponse(response) {
  const pagination =
    window.Administration.state.pagination["transportadoras"];
  if (pagination && response.pagination) {
    pagination.currentPage = response.pagination.page;
    pagination.totalItems = response.pagination.total;
    pagination.totalPages = response.pagination.totalPages;
    pagination.itemsPerPage = response.pagination.limit;
  }
}

function handleTransportadorasResponseData(response, searchTerm) {
  if (!response?.data) {
    return;
  }

  updateTransportadorasPaginationFromResponse(response);
  window.Administration.state.transportadoras = response.data;

  if (!searchTerm) {
    window.Administration.state.filteredData.transportadoras = null;
  }

  window.Administration.renderTransportadoras(response.data);
}

function isTransportadorasAbortError(error, controller) {
  return error.name === "AbortError" || controller.signal.aborted;
}

function handleLoadTransportadorasError(error, controller, currentSequence) {
  if (
    isTransportadorasAbortError(error, controller) ||
    !isTransportadorasRequestStillValid(currentSequence)
  ) {
    return;
  }

  console.error("❌ Erro ao carregar transportadoras:", error);
  window.Administration.showError("Erro ao carregar transportadoras");
}

window.Administration.loadTransportadoras = async function (
  page = 1,
  limit = 50,
  search = null
) {
  cancelPreviousTransportadorasRequest();
  const controller = createNewTransportadorasRequestController();
  const currentSequence = incrementTransportadorasRequestSequence();

  try {
    window.Administration.initPagination("transportadoras", limit);

    const searchTerm = normalizeTransportadorasSearchTerm(search);
    window.Administration.state.currentSearchTransportadoras = searchTerm;

    const url = buildTransportadorasUrl(page, limit, searchTerm);
    const response = await window.Administration.apiRequest(url, {
      signal: controller.signal,
    });

    if (
      !isTransportadorasRequestStillValid(currentSequence) ||
      controller.signal.aborted
    ) {
      return;
    }

    handleTransportadorasResponseData(response, searchTerm);
  } catch (error) {
    handleLoadTransportadorasError(error, controller, currentSequence);
  } finally {
    if (isTransportadorasRequestStillValid(currentSequence)) {
      window.Administration.state.requestControllers.transportadoras = null;
    }
  }
};

window.Administration.renderTransportadoras = function (transportadoras) {
  const tbody = document.querySelector("#transportadorasTable tbody");
  if (!tbody) return;

  // Se há dados filtrados, usa paginação client-side
  const dataToRender = window.Administration.state.filteredData.transportadoras;
  
  if (dataToRender) {
    // Paginação client-side para dados filtrados
    const { items, pagination } = window.Administration.getPaginatedData(
      dataToRender,
      "transportadoras"
    );

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="loading-data">Nenhuma transportadora encontrada</td>
        </tr>
      `;
      window.Administration.renderPagination(
        "transportadorasPagination",
        "transportadoras",
        () => {
          window.Administration.renderTransportadoras();
        }
      );
      return;
    }

    tbody.innerHTML = items
      .map(
        (transp) => `
      <tr>
        <td>${transp.nome_transportadora}</td>
        <td>${transp.razao_social || "N/A"}</td>
        <td>${transp.cnpj || "N/A"}</td>
        <td><span class="status-badge ${transp.ativa ? "active" : "inactive"}">${
          transp.ativa ? "Ativa" : "Inativa"
        }</span></td>
        <td>
          ${transp.ativa
            ? `
            <button class="btn-icon edit-entity" data-entity-type="transportadora" data-id="${
              transp.id_transportadora
            }" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon delete-entity" data-entity-type="transportadora" data-id="${
              transp.id_transportadora
            }" title="Excluir">
              <i class="fas fa-trash"></i>
            </button>
          `
            : `
            <button class="btn-icon reactivate-entity" data-entity-type="transportadora" data-id="${
              transp.id_transportadora
            }" title="Reativar">
              <i class="fas fa-redo"></i>
            </button>
          `}
        </td>
      </tr>
    `
      )
      .join("");

    window.Administration.renderPagination(
      "transportadorasPagination",
      "transportadoras",
      () => {
        window.Administration.renderTransportadoras();
      }
    );
  } else {
    // Renderização direta para dados paginados do servidor
    const data = transportadoras || window.Administration.state.transportadoras || [];

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="loading-data">Nenhuma transportadora encontrada</td>
        </tr>
      `;
      window.Administration.renderPagination(
        "transportadorasPagination",
        "transportadoras",
        () => {
          const pagination = window.Administration.state.pagination["transportadoras"];
          if (pagination) {
            const searchTerm = window.Administration.state.currentSearchTransportadoras || null;
            window.Administration.loadTransportadoras(pagination.currentPage, pagination.itemsPerPage, searchTerm);
          }
        }
      );
      return;
    }

    tbody.innerHTML = data
      .map(
        (transp) => `
      <tr>
        <td>${transp.nome_transportadora}</td>
        <td>${transp.razao_social || "N/A"}</td>
        <td>${transp.cnpj || "N/A"}</td>
        <td><span class="status-badge ${transp.ativa ? "active" : "inactive"}">${
          transp.ativa ? "Ativa" : "Inativa"
        }</span></td>
        <td>
          ${transp.ativa
            ? `
            <button class="btn-icon edit-entity" data-entity-type="transportadora" data-id="${
              transp.id_transportadora
            }" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon delete-entity" data-entity-type="transportadora" data-id="${
              transp.id_transportadora
            }" title="Excluir">
              <i class="fas fa-trash"></i>
            </button>
          `
            : `
            <button class="btn-icon reactivate-entity" data-entity-type="transportadora" data-id="${
              transp.id_transportadora
            }" title="Reativar">
              <i class="fas fa-redo"></i>
            </button>
          `}
        </td>
      </tr>
    `
      )
      .join("");

    window.Administration.renderPagination(
      "transportadorasPagination",
      "transportadoras",
      () => {
        const pagination = window.Administration.state.pagination["transportadoras"];
        if (pagination) {
          const searchTerm = window.Administration.state.currentSearchTransportadoras || null;
          window.Administration.loadTransportadoras(pagination.currentPage, pagination.itemsPerPage, searchTerm);
        }
      }
    );
  }

  // Adiciona event listeners aos botões
  document
    .querySelectorAll(".edit-entity[data-entity-type='transportadora']")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        window.Administration.openTransportadoraModal(id);
      });
    });

  document
    .querySelectorAll(".delete-entity[data-entity-type='transportadora']")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        window.Administration.deleteTransportadora(id);
      });
    });

  document
    .querySelectorAll(".reactivate-entity[data-entity-type='transportadora']")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        window.Administration.reactivateTransportadora(id);
      });
    });
};

window.Administration.openTransportadoraModal = async function (id = null) {
  const modal = document.getElementById("transportadoraModal");
  if (!modal) {
    window.Administration.showError("Modal de transportadora não encontrado");
    return;
  }

  if (id) {
    // Busca a transportadora no estado atual ou faz uma requisição se não estiver disponível
    let transp = window.Administration.state.transportadoras.find(
      (t) => t.id_transportadora == id
    );
    
    if (!transp) {
      // Se a transportadora não estiver na página atual, busca do servidor
      try {
        transp = await window.Administration.apiRequest(`/transportadoras/${id}`);
      } catch (error) {
        console.error("❌ Erro ao buscar transportadora:", error);
        window.Administration.showError("Erro ao carregar dados da transportadora");
        return;
      }
    }

    // Validação: não permite editar transportadora inativa
    if (transp && !transp.ativa) {
      window.Administration.showError(
        "Não é possível editar uma transportadora inativa. Reative-a primeiro."
      );
      return;
    }
    
    if (transp) {
      document.getElementById("transportadoraId").value =
        transp.id_transportadora;
      document.getElementById("transportadoraNome").value =
        transp.nome_transportadora;
      document.getElementById("transportadoraRazao").value =
        transp.razao_social || "";
      document.getElementById("transportadoraCnpj").value = transp.cnpj || "";
      document.getElementById("transportadoraTelefone").value =
        transp.telefone || "";
      document.getElementById("transportadoraEmail").value = transp.email || "";
      document.getElementById("transportadoraModalTitle").textContent =
        "Editar Transportadora";
    }
  } else {
    document.getElementById("transportadoraForm").reset();
    document.getElementById("transportadoraId").value = "";
    document.getElementById("transportadoraModalTitle").textContent =
      "Nova Transportadora";
  }

  modal.classList.add("active");
};

window.Administration.saveTransportadora = async function () {
  const form = document.getElementById("transportadoraForm");
  const id = document.getElementById("transportadoraId").value;
  const transportadoraData = {
    nome_transportadora: document.getElementById("transportadoraNome").value,
    razao_social: document.getElementById("transportadoraRazao").value || null,
    cnpj: document.getElementById("transportadoraCnpj").value || null,
    telefone: document.getElementById("transportadoraTelefone").value || null,
    email: document.getElementById("transportadoraEmail").value || null,
    ativa: true,
  };

  try {
    if (id) {
      await window.Administration.apiRequest(`/transportadoras/${id}`, {
        method: "PUT",
        body: JSON.stringify(transportadoraData),
      });
    } else {
      await window.Administration.apiRequest("/transportadoras", {
        method: "POST",
        body: JSON.stringify(transportadoraData),
      });
    }

    window.Administration.showSuccess(
      id
        ? "Transportadora atualizada com sucesso"
        : "Transportadora criada com sucesso"
    );
    document.getElementById("transportadoraModal").classList.remove("active");
    form.reset();
    
    // Recarrega a página atual mantendo a busca se houver
    const pagination = window.Administration.state.pagination["transportadoras"];
    const searchTerm = window.Administration.state.currentSearchTransportadoras || null;
    if (pagination) {
      window.Administration.loadTransportadoras(pagination.currentPage, pagination.itemsPerPage, searchTerm);
    } else {
      window.Administration.loadTransportadoras(1, 50, searchTerm);
    }
  } catch (error) {
    console.error("❌ Erro ao salvar transportadora:", error);
    window.Administration.showError("Erro ao salvar transportadora");
  }
};

window.Administration.deleteTransportadora = async function (id) {
  try {
    const counts = await window.Administration.apiRequest(
      `/transportadoras/${id}/count-related`
    );

    // Busca a transportadora no estado atual ou faz uma requisição se não estiver disponível
    let transportadora = window.Administration.state.transportadoras.find(
      (t) => t.id_transportadora == id
    );
    
    if (!transportadora) {
      // Se a transportadora não estiver na página atual, busca do servidor
      try {
        transportadora = await window.Administration.apiRequest(`/transportadoras/${id}`);
      } catch (error) {
        console.error("❌ Erro ao buscar transportadora:", error);
        window.Administration.showError("Erro ao carregar dados da transportadora");
        return;
      }
    }
    
    const transportadoraNome = transportadora
      ? transportadora.nome_transportadora
      : "esta transportadora";

    const title = "Confirmar Desativação";
    const message = `Tem certeza que deseja desativar ${transportadoraNome}?`;

    window.Administration.openDeleteConfirmModal(
      title,
      message,
      counts,
      async () => {
        try {
          await window.Administration.apiRequest(`/transportadoras/${id}`, {
            method: "DELETE",
          });
          window.Administration.showSuccess(
            "Transportadora desativada com sucesso"
          );
          
          // Recarrega a página atual mantendo a busca se houver
          const pagination = window.Administration.state.pagination["transportadoras"];
          const searchTerm = window.Administration.state.currentSearchTransportadoras || null;
          if (pagination) {
            window.Administration.loadTransportadoras(pagination.currentPage, pagination.itemsPerPage, searchTerm);
          } else {
            window.Administration.loadTransportadoras(1, 50, searchTerm);
          }
        } catch (error) {
          console.error("❌ Erro ao excluir transportadora:", error);
          window.Administration.showError("Erro ao excluir transportadora");
        }
      }
    );
  } catch (error) {
    console.error("❌ Erro ao buscar informações de exclusão:", error);
    window.Administration.showError("Erro ao buscar informações de exclusão");
  }
};

window.Administration.reactivateTransportadora = async function (id) {
  try {
    // Buscar informações da transportadora para exibir no modal
    let transportadora = window.Administration.state.transportadoras.find(
      (t) => t.id_transportadora == id
    );

    if (!transportadora) {
      try {
        transportadora = await window.Administration.apiRequest(
          `/transportadoras/${id}`
        );
      } catch (error) {
        console.error("❌ Erro ao buscar transportadora:", error);
        window.Administration.showError("Erro ao buscar dados da transportadora");
        return;
      }
    }

    const transportadoraNome = transportadora
      ? transportadora.nome_transportadora
      : "esta transportadora";
    const title = "Reativar Transportadora";
    const message = `Tem certeza que deseja reativar "${transportadoraNome}"?`;
    const counts = {};

    window.Administration.openDeleteConfirmModal(
      title,
      message,
      counts,
      async () => {
        try {
          await window.Administration.apiRequest(`/transportadoras/${id}`, {
            method: "PUT",
            body: JSON.stringify({ ativa: true }),
          });
          window.Administration.showSuccess(
            "Transportadora reativada com sucesso"
          );

          // Recarrega a página atual mantendo a busca se houver
          const pagination =
            window.Administration.state.pagination["transportadoras"];
          const searchTerm =
            window.Administration.state.currentSearchTransportadoras || null;
          if (pagination) {
            window.Administration.loadTransportadoras(
              pagination.currentPage,
              pagination.itemsPerPage,
              searchTerm
            );
          } else {
            window.Administration.loadTransportadoras(1, 50, searchTerm);
          }
        } catch (error) {
          console.error("❌ Erro ao reativar transportadora:", error);
          window.Administration.showError(
            error.message || "Erro ao reativar transportadora"
          );
        }
      }
    );
  } catch (error) {
    console.error("❌ Erro ao buscar informações:", error);
    window.Administration.showError("Erro ao buscar informações");
  }
};
