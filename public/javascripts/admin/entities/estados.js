window.Administration = window.Administration || {};

window.Administration.loadEstados = async function (page = 1, limit = 50, search = null) {
  // Cancela requisição anterior se existir
  if (window.Administration.state.requestControllers.estados) {
    window.Administration.state.requestControllers.estados.abort();
  }

  // Cria novo AbortController para esta requisição
  const controller = new AbortController();
  window.Administration.state.requestControllers.estados = controller;

  // Incrementa o contador de sequência para esta requisição
  if (!window.Administration.state.requestSequence.estados) {
    window.Administration.state.requestSequence.estados = 0;
  }
  window.Administration.state.requestSequence.estados += 1;
  const currentSequence = window.Administration.state.requestSequence.estados;

  try {
    window.Administration.initPagination("estados", limit);
    
    // Armazena o termo de busca atual
    const searchTerm = search && search.trim() !== "" ? search.trim() : null;
    window.Administration.state.currentSearchEstados = searchTerm;
    
    let url = `/estados?page=${page}&limit=${limit}`;
    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }
    
    const response = await window.Administration.apiRequest(url, {
      signal: controller.signal,
    });
    
    // Verifica se esta ainda é a requisição mais recente
    if (window.Administration.state.requestSequence.estados !== currentSequence) {
      // Esta requisição foi substituída por uma mais recente, ignora o resultado
      return;
    }

    // Verifica se a requisição foi cancelada
    if (controller.signal.aborted) {
      return;
    }
    
    if (response && response.data) {
      // Atualiza o estado de paginação com os dados do servidor
      const pagination = window.Administration.state.pagination["estados"];
      if (pagination) {
        pagination.currentPage = response.pagination.page;
        pagination.totalItems = response.pagination.total;
        pagination.totalPages = response.pagination.totalPages;
        pagination.itemsPerPage = response.pagination.limit;
      }
      
      // Armazena apenas os dados da página atual
      window.Administration.state.estados = response.data;
      // Se há busca, não usa filteredData (a busca já vem do servidor)
      if (!searchTerm) {
        window.Administration.state.filteredData.estados = null;
      }
      
      window.Administration.renderEstados(response.data);
    }
  } catch (error) {
    // Ignora erros de requisições canceladas
    if (error.name === 'AbortError' || controller.signal.aborted) {
      return;
    }
    
    // Verifica se esta ainda é a requisição mais recente antes de mostrar erro
    if (window.Administration.state.requestSequence.estados !== currentSequence) {
      return;
    }
    
    console.error("❌ Erro ao carregar estados:", error);
    window.Administration.showError("Erro ao carregar estados");
  } finally {
    // Limpa o controller se esta ainda for a requisição atual
    if (window.Administration.state.requestSequence.estados === currentSequence) {
      window.Administration.state.requestControllers.estados = null;
    }
  }
};

window.Administration.renderEstados = function (estados) {
  const tbody = document.querySelector("#estadosTable tbody");
  if (!tbody) return;

  // Se há dados filtrados, usa paginação client-side
  const dataToRender = window.Administration.state.filteredData.estados;
  
  if (dataToRender) {
    // Paginação client-side para dados filtrados
    const { items, pagination } = window.Administration.getPaginatedData(
      dataToRender,
      "estados"
    );

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="loading-data">Nenhum estado encontrado</td>
        </tr>
      `;
      window.Administration.renderPagination(
        "estadosPagination",
        "estados",
        () => {
          window.Administration.renderEstados();
        }
      );
      return;
    }

      tbody.innerHTML = items
        .map(
          (estado) => `
      <tr>
        <td>${estado.uf}</td>
        <td>${estado.nome_estado}</td>
        <td>
          <button class="btn-icon edit-entity" data-entity-type="estado" data-id="${estado.id_estado}" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete-entity" data-entity-type="estado" data-id="${estado.id_estado}" title="Excluir">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `
        )
        .join("");

    window.Administration.renderPagination(
      "estadosPagination",
      "estados",
      () => {
        window.Administration.renderEstados();
      }
    );
  } else {
    // Renderização direta para dados paginados do servidor
    const data = estados || window.Administration.state.estados || [];

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="loading-data">Nenhum estado encontrado</td>
        </tr>
      `;
      window.Administration.renderPagination(
        "estadosPagination",
        "estados",
        () => {
          const pagination = window.Administration.state.pagination["estados"];
          if (pagination) {
            const searchTerm = window.Administration.state.currentSearchEstados || null;
            window.Administration.loadEstados(pagination.currentPage, pagination.itemsPerPage, searchTerm);
          }
        }
      );
      return;
    }

    tbody.innerHTML = data
      .map(
        (estado) => `
      <tr>
        <td>${estado.uf}</td>
        <td>${estado.nome_estado}</td>
        <td>
          <button class="btn-icon edit-entity" data-entity-type="estado" data-id="${estado.id_estado}" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete-entity" data-entity-type="estado" data-id="${estado.id_estado}" title="Excluir">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `
      )
      .join("");

    window.Administration.renderPagination("estadosPagination", "estados", () => {
      const pagination = window.Administration.state.pagination["estados"];
      if (pagination) {
        const searchTerm = window.Administration.state.currentSearchEstados || null;
        window.Administration.loadEstados(pagination.currentPage, pagination.itemsPerPage, searchTerm);
      }
    });
  }

  // Adiciona event listeners aos botões
  document
    .querySelectorAll(".edit-entity[data-entity-type='estado']")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        window.Administration.openEstadoModal(id);
      });
    });

  document
    .querySelectorAll(".delete-entity[data-entity-type='estado']")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        window.Administration.deleteEstado(id);
      });
    });
};

window.Administration.openEstadoModal = async function (id = null) {
  const modal = document.getElementById("estadoModal");
  if (!modal) {
    window.Administration.showError("Modal de estado não encontrado");
    return;
  }

  if (id) {
    // Busca o estado no estado atual ou faz uma requisição se não estiver disponível
    let estado = window.Administration.state.estados.find(
      (e) => e.id_estado == id
    );
    
    if (!estado) {
      // Se o estado não estiver na página atual, busca do servidor
      try {
        estado = await window.Administration.apiRequest(`/estados/${id}`);
      } catch (error) {
        console.error("❌ Erro ao buscar estado:", error);
        window.Administration.showError("Erro ao carregar dados do estado");
        return;
      }
    }
    
    if (estado) {
      document.getElementById("estadoId").value = estado.id_estado;
      document.getElementById("estadoUf").value = estado.uf;
      document.getElementById("estadoNome").value = estado.nome_estado;
      document.getElementById("estadoModalTitle").textContent = "Editar Estado";
    }
  } else {
    document.getElementById("estadoForm").reset();
    document.getElementById("estadoId").value = "";
    document.getElementById("estadoModalTitle").textContent = "Novo Estado";
  }

  modal.classList.add("active");
};

window.Administration.saveEstado = async function () {
  const form = document.getElementById("estadoForm");
  const id = document.getElementById("estadoId").value;
  const estadoData = {
    uf: document.getElementById("estadoUf").value.toUpperCase(),
    nome_estado: document.getElementById("estadoNome").value,
  };

  try {
    if (id) {
      await window.Administration.apiRequest(`/estados/${id}`, {
        method: "PUT",
        body: JSON.stringify(estadoData),
      });
    } else {
      await window.Administration.apiRequest("/estados", {
        method: "POST",
        body: JSON.stringify(estadoData),
      });
    }

    window.Administration.showSuccess(
      id ? "Estado atualizado com sucesso" : "Estado criado com sucesso"
    );
    document.getElementById("estadoModal").classList.remove("active");
    form.reset();
    
    // Recarrega a página atual mantendo a busca se houver
    const pagination = window.Administration.state.pagination["estados"];
    const searchTerm = window.Administration.state.currentSearchEstados || null;
    if (pagination) {
      window.Administration.loadEstados(pagination.currentPage, pagination.itemsPerPage, searchTerm);
    } else {
      window.Administration.loadEstados(1, 50, searchTerm);
    }
  } catch (error) {
    console.error("❌ Erro ao salvar estado:", error);
    window.Administration.showError("Erro ao salvar estado");
  }
};

window.Administration.deleteEstado = async function (id) {
  try {
    const counts = await window.Administration.apiRequest(
      `/estados/${id}/count-related`
    );

    // Busca o estado no estado atual ou faz uma requisição se não estiver disponível
    let estado = window.Administration.state.estados.find(
      (e) => e.id_estado == id
    );
    
    if (!estado) {
      // Se o estado não estiver na página atual, busca do servidor
      try {
        estado = await window.Administration.apiRequest(`/estados/${id}`);
      } catch (error) {
        console.error("❌ Erro ao buscar estado:", error);
        window.Administration.showError("Erro ao carregar dados do estado");
        return;
      }
    }
    
    const estadoNome = estado
      ? `${estado.uf} - ${estado.nome_estado}`
      : "este estado";

    const title = "Confirmar Exclusão de Estado";
    const message = `Tem certeza que deseja excluir ${estadoNome}? Esta ação não pode ser desfeita!`;

    window.Administration.openDeleteConfirmModal(
      title,
      message,
      counts,
      async () => {
        try {
          await window.Administration.apiRequest(`/estados/${id}`, {
            method: "DELETE",
          });
          window.Administration.showSuccess("Estado excluído com sucesso");
          
          // Recarrega a página atual mantendo a busca se houver
          const pagination = window.Administration.state.pagination["estados"];
          const searchTerm = window.Administration.state.currentSearchEstados || null;
          if (pagination) {
            window.Administration.loadEstados(pagination.currentPage, pagination.itemsPerPage, searchTerm);
          } else {
            window.Administration.loadEstados(1, 50, searchTerm);
          }
        } catch (error) {
          console.error("❌ Erro ao excluir estado:", error);
          window.Administration.showError("Erro ao excluir estado");
        }
      }
    );
  } catch (error) {
    console.error("❌ Erro ao buscar informações de exclusão:", error);
    window.Administration.showError("Erro ao buscar informações de exclusão");
  }
};
