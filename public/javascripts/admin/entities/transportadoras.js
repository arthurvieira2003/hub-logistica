window.Administration = window.Administration || {};

window.Administration.loadTransportadoras = async function (page = 1, limit = 50, search = null) {
  // Cancela requisição anterior se existir
  if (window.Administration.state.requestControllers.transportadoras) {
    window.Administration.state.requestControllers.transportadoras.abort();
  }

  // Cria novo AbortController para esta requisição
  const controller = new AbortController();
  window.Administration.state.requestControllers.transportadoras = controller;

  // Incrementa o contador de sequência para esta requisição
  if (!window.Administration.state.requestSequence.transportadoras) {
    window.Administration.state.requestSequence.transportadoras = 0;
  }
  window.Administration.state.requestSequence.transportadoras += 1;
  const currentSequence = window.Administration.state.requestSequence.transportadoras;

  try {
    window.Administration.initPagination("transportadoras", limit);
    
    // Armazena o termo de busca atual
    const searchTerm = search && search.trim() !== "" ? search.trim() : null;
    window.Administration.state.currentSearchTransportadoras = searchTerm;
    
    let url = `/transportadoras?page=${page}&limit=${limit}`;
    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }
    
    const response = await window.Administration.apiRequest(url, {
      signal: controller.signal,
    });
    
    // Verifica se esta ainda é a requisição mais recente
    if (window.Administration.state.requestSequence.transportadoras !== currentSequence) {
      // Esta requisição foi substituída por uma mais recente, ignora o resultado
      return;
    }

    // Verifica se a requisição foi cancelada
    if (controller.signal.aborted) {
      return;
    }
    
    if (response && response.data) {
      // Atualiza o estado de paginação com os dados do servidor
      const pagination = window.Administration.state.pagination["transportadoras"];
      if (pagination) {
        pagination.currentPage = response.pagination.page;
        pagination.totalItems = response.pagination.total;
        pagination.totalPages = response.pagination.totalPages;
        pagination.itemsPerPage = response.pagination.limit;
      }
      
      // Armazena apenas os dados da página atual
      window.Administration.state.transportadoras = response.data;
      // Se há busca, não usa filteredData (a busca já vem do servidor)
      if (!searchTerm) {
        window.Administration.state.filteredData.transportadoras = null;
      }
      
      window.Administration.renderTransportadoras(response.data);
    }
  } catch (error) {
    // Ignora erros de requisições canceladas
    if (error.name === 'AbortError' || controller.signal.aborted) {
      return;
    }
    
    // Verifica se esta ainda é a requisição mais recente antes de mostrar erro
    if (window.Administration.state.requestSequence.transportadoras !== currentSequence) {
      return;
    }
    
    console.error("❌ Erro ao carregar transportadoras:", error);
    window.Administration.showError("Erro ao carregar transportadoras");
  } finally {
    // Limpa o controller se esta ainda for a requisição atual
    if (window.Administration.state.requestSequence.transportadoras === currentSequence) {
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
        const id = e.currentTarget.getAttribute("data-id");
        window.Administration.openTransportadoraModal(id);
      });
    });

  document
    .querySelectorAll(".delete-entity[data-entity-type='transportadora']")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        window.Administration.deleteTransportadora(id);
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
