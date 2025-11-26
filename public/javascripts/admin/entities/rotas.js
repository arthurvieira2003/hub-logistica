window.Administration = window.Administration || {};

window.Administration.loadRotas = async function (page = 1, limit = 50, search = null) {
  // Cancela requisição anterior se existir
  if (window.Administration.state.requestControllers.rotas) {
    window.Administration.state.requestControllers.rotas.abort();
  }

  // Cria novo AbortController para esta requisição
  const controller = new AbortController();
  window.Administration.state.requestControllers.rotas = controller;

  // Incrementa o contador de sequência para esta requisição
  if (!window.Administration.state.requestSequence.rotas) {
    window.Administration.state.requestSequence.rotas = 0;
  }
  window.Administration.state.requestSequence.rotas += 1;
  const currentSequence = window.Administration.state.requestSequence.rotas;

  try {
    window.Administration.initPagination("rotas", limit);
    
    // Armazena o termo de busca atual
    const searchTerm = search && search.trim() !== "" ? search.trim() : null;
    window.Administration.state.currentSearch = searchTerm;
    
    let url = `/rotas?page=${page}&limit=${limit}`;
    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }
    
    const response = await window.Administration.apiRequest(url, {
      signal: controller.signal,
    });
    
    // Verifica se esta ainda é a requisição mais recente
    if (window.Administration.state.requestSequence.rotas !== currentSequence) {
      // Esta requisição foi substituída por uma mais recente, ignora o resultado
      return;
    }

    // Verifica se a requisição foi cancelada
    if (controller.signal.aborted) {
      return;
    }
    
    if (response && response.data) {
      // Atualiza o estado de paginação com os dados do servidor
      const pagination = window.Administration.state.pagination["rotas"];
      if (pagination) {
        pagination.currentPage = response.pagination.page;
        pagination.totalItems = response.pagination.total;
        pagination.totalPages = response.pagination.totalPages;
        pagination.itemsPerPage = response.pagination.limit;
      }
      
      // Armazena apenas os dados da página atual
      window.Administration.state.rotas = response.data;
      // Se há busca, não usa filteredData (a busca já vem do servidor)
      if (!window.Administration.state.currentSearch) {
        window.Administration.state.filteredData.rotas = null;
      }
      
      window.Administration.renderRotas(response.data);
    }
  } catch (error) {
    // Ignora erros de requisições canceladas
    if (error.name === 'AbortError' || controller.signal.aborted) {
      return;
    }
    
    // Verifica se esta ainda é a requisição mais recente antes de mostrar erro
    if (window.Administration.state.requestSequence.rotas !== currentSequence) {
      return;
    }
    
    console.error("❌ Erro ao carregar rotas:", error);
    window.Administration.showError("Erro ao carregar rotas");
  } finally {
    // Limpa o controller se esta ainda for a requisição atual
    if (window.Administration.state.requestSequence.rotas === currentSequence) {
      window.Administration.state.requestControllers.rotas = null;
    }
  }
};

window.Administration.renderRotas = function (rotas) {
  const tbody = document.querySelector("#rotasTable tbody");
  if (!tbody) return;

  // Se há dados filtrados, usa paginação client-side
  const dataToRender = window.Administration.state.filteredData.rotas;
  
  if (dataToRender) {
    // Paginação client-side para dados filtrados
    const { items, pagination } = window.Administration.getPaginatedData(
      dataToRender,
      "rotas"
    );

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="loading-data">Nenhuma rota encontrada</td>
        </tr>
      `;
      window.Administration.renderPagination("rotasPagination", "rotas", () => {
        window.Administration.renderRotas();
      });
      return;
    }

    tbody.innerHTML = items
      .map((rota) => {
        const origem = rota.Cidade || rota.CidadeOrigem;
        const destino = rota.CidadeDestino;
        const origemNome = origem
          ? `${origem.nome_cidade}${
              origem.Estado ? ` (${origem.Estado.uf})` : ""
            }`
          : "N/A";
        const destinoNome = destino
          ? `${destino.nome_cidade}${
              destino.Estado ? ` (${destino.Estado.uf})` : ""
            }`
          : "N/A";

        return `
      <tr>
        <td>${origemNome}</td>
        <td>${destinoNome}</td>
        <td><span class="status-badge ${rota.ativa ? "active" : "inactive"}">${
          rota.ativa ? "Ativa" : "Inativa"
        }</span></td>
        <td>
          <button class="btn-icon edit-entity" data-entity-type="rota" data-id="${
            rota.id_rota
          }" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete-entity" data-entity-type="rota" data-id="${
            rota.id_rota
          }" title="Excluir">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
      })
      .join("");

    window.Administration.renderPagination("rotasPagination", "rotas", () => {
      window.Administration.renderRotas();
    });
  } else {
    // Renderização direta para dados paginados do servidor
    const data = rotas || window.Administration.state.rotas || [];

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="loading-data">Nenhuma rota encontrada</td>
        </tr>
      `;
      window.Administration.renderPagination("rotasPagination", "rotas", () => {
        const pagination = window.Administration.state.pagination["rotas"];
        if (pagination) {
          window.Administration.loadRotas(pagination.currentPage, pagination.itemsPerPage);
        }
      });
      return;
    }

    tbody.innerHTML = data
      .map((rota) => {
        const origem = rota.Cidade || rota.CidadeOrigem;
        const destino = rota.CidadeDestino;
        const origemNome = origem
          ? `${origem.nome_cidade}${
              origem.Estado ? ` (${origem.Estado.uf})` : ""
            }`
          : "N/A";
        const destinoNome = destino
          ? `${destino.nome_cidade}${
              destino.Estado ? ` (${destino.Estado.uf})` : ""
            }`
          : "N/A";

        return `
      <tr>
        <td>${origemNome}</td>
        <td>${destinoNome}</td>
        <td><span class="status-badge ${rota.ativa ? "active" : "inactive"}">${
          rota.ativa ? "Ativa" : "Inativa"
        }</span></td>
        <td>
          <button class="btn-icon edit-entity" data-entity-type="rota" data-id="${
            rota.id_rota
          }" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete-entity" data-entity-type="rota" data-id="${
            rota.id_rota
          }" title="Excluir">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
      })
      .join("");

    window.Administration.renderPagination("rotasPagination", "rotas", () => {
      const pagination = window.Administration.state.pagination["rotas"];
      if (pagination) {
        const searchTerm = window.Administration.state.currentSearch || null;
        window.Administration.loadRotas(pagination.currentPage, pagination.itemsPerPage, searchTerm);
      }
    });
  }

  // Adiciona event listeners aos botões
  document
    .querySelectorAll(".edit-entity[data-entity-type='rota']")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        window.Administration.openRotaModal(id);
      });
    });

  document
    .querySelectorAll(".delete-entity[data-entity-type='rota']")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        window.Administration.deleteRota(id);
      });
    });
};

window.Administration.openRotaModal = async function (id = null) {
  const modal = document.getElementById("rotaModal");
  if (!modal) {
    window.Administration.showError("Modal de rota não encontrado");
    return;
  }

  if (window.Administration.state.cidades.length === 0) {
    await window.Administration.loadCidades();
  }

  const origemSelect = document.getElementById("rotaOrigem");
  const destinoSelect = document.getElementById("rotaDestino");

  origemSelect.innerHTML =
    '<option value="">Selecione a cidade de origem</option>';
  destinoSelect.innerHTML =
    '<option value="">Selecione a cidade de destino</option>';

  window.Administration.state.cidades.forEach((cidade) => {
    const estadoInfo = cidade.Estado ? ` (${cidade.Estado.uf})` : "";
    const optionOrigem = document.createElement("option");
    optionOrigem.value = cidade.id_cidade;
    optionOrigem.textContent = `${cidade.nome_cidade}${estadoInfo}`;
    origemSelect.appendChild(optionOrigem.cloneNode(true));
    destinoSelect.appendChild(optionOrigem);
  });

  if (id) {
    // Busca a rota no estado atual ou faz uma requisição se não estiver disponível
    let rota = window.Administration.state.rotas.find((r) => r.id_rota == id);
    
    if (!rota) {
      // Se a rota não estiver na página atual, busca do servidor
      try {
        rota = await window.Administration.apiRequest(`/rotas/${id}`);
      } catch (error) {
        console.error("❌ Erro ao buscar rota:", error);
        window.Administration.showError("Erro ao carregar dados da rota");
        return;
      }
    }
    
    if (rota) {
      document.getElementById("rotaId").value = rota.id_rota;
      document.getElementById("rotaOrigem").value = rota.id_cidade_origem;
      document.getElementById("rotaDestino").value = rota.id_cidade_destino;
      document.getElementById("rotaObservacoes").value = rota.observacoes || "";
      document.getElementById("rotaModalTitle").textContent = "Editar Rota";
    }
  } else {
    document.getElementById("rotaForm").reset();
    document.getElementById("rotaId").value = "";
    document.getElementById("rotaModalTitle").textContent = "Nova Rota";
  }

  modal.classList.add("active");
};

window.Administration.saveRota = async function () {
  const form = document.getElementById("rotaForm");
  const id = document.getElementById("rotaId").value;
  const origem = parseInt(document.getElementById("rotaOrigem").value);
  const destino = parseInt(document.getElementById("rotaDestino").value);

  if (origem === destino) {
    window.Administration.showError(
      "A cidade de origem e destino não podem ser iguais"
    );
    return;
  }

  const rotaData = {
    id_cidade_origem: origem,
    id_cidade_destino: destino,
    observacoes: document.getElementById("rotaObservacoes").value || null,
    ativa: true,
  };

  try {
    if (id) {
      await window.Administration.apiRequest(`/rotas/${id}`, {
        method: "PUT",
        body: JSON.stringify(rotaData),
      });
    } else {
      await window.Administration.apiRequest("/rotas", {
        method: "POST",
        body: JSON.stringify(rotaData),
      });
    }

    window.Administration.showSuccess(
      id ? "Rota atualizada com sucesso" : "Rota criada com sucesso"
    );
    document.getElementById("rotaModal").classList.remove("active");
    form.reset();
    
    // Recarrega a página atual mantendo a busca se houver
    const pagination = window.Administration.state.pagination["rotas"];
    const searchTerm = window.Administration.state.currentSearch || null;
    if (pagination) {
      window.Administration.loadRotas(pagination.currentPage, pagination.itemsPerPage, searchTerm);
    } else {
      window.Administration.loadRotas(1, 50, searchTerm);
    }
  } catch (error) {
    console.error("❌ Erro ao salvar rota:", error);
    window.Administration.showError("Erro ao salvar rota");
  }
};

window.Administration.deleteRota = async function (id) {
  try {
    const counts = await window.Administration.apiRequest(
      `/rotas/${id}/count-related`
    );

    // Busca a rota no estado atual ou faz uma requisição se não estiver disponível
    let rota = window.Administration.state.rotas.find((r) => r.id_rota == id);
    
    if (!rota) {
      // Se a rota não estiver na página atual, busca do servidor
      try {
        rota = await window.Administration.apiRequest(`/rotas/${id}`);
      } catch (error) {
        console.error("❌ Erro ao buscar rota:", error);
        window.Administration.showError("Erro ao carregar dados da rota");
        return;
      }
    }
    
    let rotaNome = "esta rota";
    if (rota) {
      const origem = rota.Cidade || rota.CidadeOrigem;
      const destino = rota.CidadeDestino;
      const origemNome = origem ? origem.nome_cidade : "N/A";
      const destinoNome = destino ? destino.nome_cidade : "N/A";
      rotaNome = `${origemNome} → ${destinoNome}`;
    }

    const title = "Confirmar Desativação";
    const message = `Tem certeza que deseja desativar a rota ${rotaNome}? O registro será desativado e não aparecerá mais nas listagens.`;

    window.Administration.openDeleteConfirmModal(
      title,
      message,
      counts,
      async () => {
        try {
          await window.Administration.apiRequest(`/rotas/${id}`, {
            method: "DELETE",
          });
          window.Administration.showSuccess("Rota desativada com sucesso");
          
          // Recarrega a página atual
          const pagination = window.Administration.state.pagination["rotas"];
          if (pagination) {
            window.Administration.loadRotas(pagination.currentPage, pagination.itemsPerPage);
          } else {
            window.Administration.loadRotas();
          }
        } catch (error) {
          console.error("❌ Erro ao excluir rota:", error);
          window.Administration.showError("Erro ao excluir rota");
        }
      }
    );
  } catch (error) {
    console.error("❌ Erro ao buscar informações de exclusão:", error);
    window.Administration.showError("Erro ao buscar informações de exclusão");
  }
};
