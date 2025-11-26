window.Administration = window.Administration || {};

window.Administration.loadCidades = async function (page = 1, limit = 50, search = null) {
  // Cancela requisição anterior se existir
  if (window.Administration.state.requestControllers.cidades) {
    window.Administration.state.requestControllers.cidades.abort();
  }

  // Cria novo AbortController para esta requisição
  const controller = new AbortController();
  window.Administration.state.requestControllers.cidades = controller;

  // Incrementa o contador de sequência para esta requisição
  if (!window.Administration.state.requestSequence.cidades) {
    window.Administration.state.requestSequence.cidades = 0;
  }
  window.Administration.state.requestSequence.cidades += 1;
  const currentSequence = window.Administration.state.requestSequence.cidades;

  try {
    window.Administration.initPagination("cidades", limit);
    
    // Armazena o termo de busca atual
    const searchTerm = search && search.trim() !== "" ? search.trim() : null;
    window.Administration.state.currentSearchCidades = searchTerm;
    
    let url = `/cidades?page=${page}&limit=${limit}`;
    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }
    
    const response = await window.Administration.apiRequest(url, {
      signal: controller.signal,
    });
    
    // Verifica se esta ainda é a requisição mais recente
    if (window.Administration.state.requestSequence.cidades !== currentSequence) {
      // Esta requisição foi substituída por uma mais recente, ignora o resultado
      return;
    }

    // Verifica se a requisição foi cancelada
    if (controller.signal.aborted) {
      return;
    }
    
    if (response && response.data) {
      // Atualiza o estado de paginação com os dados do servidor
      const pagination = window.Administration.state.pagination["cidades"];
      if (pagination) {
        pagination.currentPage = response.pagination.page;
        pagination.totalItems = response.pagination.total;
        pagination.totalPages = response.pagination.totalPages;
        pagination.itemsPerPage = response.pagination.limit;
      }
      
      // Armazena apenas os dados da página atual
      window.Administration.state.cidades = response.data;
      // Se há busca, não usa filteredData (a busca já vem do servidor)
      if (!searchTerm) {
        window.Administration.state.filteredData.cidades = null;
      }
      
      window.Administration.renderCidades(response.data);
    }
  } catch (error) {
    // Ignora erros de requisições canceladas
    if (error.name === 'AbortError' || controller.signal.aborted) {
      return;
    }
    
    // Verifica se esta ainda é a requisição mais recente antes de mostrar erro
    if (window.Administration.state.requestSequence.cidades !== currentSequence) {
      return;
    }
    
    console.error("❌ Erro ao carregar cidades:", error);
    window.Administration.showError("Erro ao carregar cidades");
  } finally {
    // Limpa o controller se esta ainda for a requisição atual
    if (window.Administration.state.requestSequence.cidades === currentSequence) {
      window.Administration.state.requestControllers.cidades = null;
    }
  }
};

window.Administration.renderCidades = function (cidades) {
  const tbody = document.querySelector("#cidadesTable tbody");
  if (!tbody) return;

  // Se há dados filtrados, usa paginação client-side
  const dataToRender = window.Administration.state.filteredData.cidades;
  
  if (dataToRender) {
    // Paginação client-side para dados filtrados
    const { items, pagination } = window.Administration.getPaginatedData(
      dataToRender,
      "cidades"
    );

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="loading-data">Nenhuma cidade encontrada</td>
        </tr>
      `;
      window.Administration.renderPagination(
        "cidadesPagination",
        "cidades",
        () => {
          window.Administration.renderCidades();
        }
      );
      return;
    }

    tbody.innerHTML = items
      .map(
        (cidade) => `
      <tr>
        <td>${cidade.nome_cidade}</td>
        <td>${
          cidade.Estado
            ? `${cidade.Estado.uf} - ${cidade.Estado.nome_estado}`
            : "N/A"
        }</td>
        <td>${cidade.codigo_ibge || "N/A"}</td>
        <td>
          <button class="btn-icon edit-entity" data-entity-type="cidade" data-id="${
            cidade.id_cidade
          }" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete-entity" data-entity-type="cidade" data-id="${
            cidade.id_cidade
          }" title="Excluir">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `
      )
      .join("");

    window.Administration.renderPagination(
      "cidadesPagination",
      "cidades",
      () => {
        window.Administration.renderCidades();
      }
    );
  } else {
    // Renderização direta para dados paginados do servidor
    const data = cidades || window.Administration.state.cidades || [];

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="loading-data">Nenhuma cidade encontrada</td>
        </tr>
      `;
      window.Administration.renderPagination(
        "cidadesPagination",
        "cidades",
        () => {
          const pagination = window.Administration.state.pagination["cidades"];
          if (pagination) {
            const searchTerm = window.Administration.state.currentSearchCidades || null;
            window.Administration.loadCidades(pagination.currentPage, pagination.itemsPerPage, searchTerm);
          }
        }
      );
      return;
    }

    tbody.innerHTML = data
      .map(
        (cidade) => `
      <tr>
        <td>${cidade.nome_cidade}</td>
        <td>${
          cidade.Estado
            ? `${cidade.Estado.uf} - ${cidade.Estado.nome_estado}`
            : "N/A"
        }</td>
        <td>${cidade.codigo_ibge || "N/A"}</td>
        <td>
          <button class="btn-icon edit-entity" data-entity-type="cidade" data-id="${
            cidade.id_cidade
          }" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete-entity" data-entity-type="cidade" data-id="${
            cidade.id_cidade
          }" title="Excluir">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `
      )
      .join("");

    window.Administration.renderPagination("cidadesPagination", "cidades", () => {
      const pagination = window.Administration.state.pagination["cidades"];
      if (pagination) {
        const searchTerm = window.Administration.state.currentSearchCidades || null;
        window.Administration.loadCidades(pagination.currentPage, pagination.itemsPerPage, searchTerm);
      }
    });
  }

  // Adiciona event listeners aos botões
  document
    .querySelectorAll(".edit-entity[data-entity-type='cidade']")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        window.Administration.openCidadeModal(id);
      });
    });

  document
    .querySelectorAll(".delete-entity[data-entity-type='cidade']")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        window.Administration.deleteCidade(id);
      });
    });
};

window.Administration.buscarCodigoIBGE = async function (nomeCidade, idEstado) {
  try {
    const estado = window.Administration.state.estados.find(
      (e) => e.id_estado == idEstado
    );

    if (!estado || !nomeCidade || nomeCidade.trim() === "") {
      return null;
    }

    const result = await window.Administration.apiRequest(
      `/cidades/buscar-ibge?nome=${encodeURIComponent(nomeCidade.trim())}&uf=${
        estado.uf
      }`
    );

    if (result && result.codigo_ibge) {
      return result.codigo_ibge;
    }

    return null;
  } catch (error) {
    console.error("❌ Erro ao buscar código IBGE:", error);
    return null;
  }
};

window.Administration.openCidadeModal = async function (id = null) {
  const modal = document.getElementById("cidadeModal");
  if (!modal) {
    window.Administration.showError("Modal de cidade não encontrado");
    return;
  }

  if (window.Administration.state.estados.length === 0) {
    await window.Administration.loadEstados();
  }

  const estadoSelect = document.getElementById("cidadeEstado");
  estadoSelect.innerHTML = '<option value="">Selecione um estado</option>';
  window.Administration.state.estados.forEach((estado) => {
    const option = document.createElement("option");
    option.value = estado.id_estado;
    option.textContent = `${estado.uf} - ${estado.nome_estado}`;
    estadoSelect.appendChild(option);
  });

  let nomeInicial = "";
  let estadoInicial = "";
  let ibgeInicial = "";

  if (id) {
    // Busca a cidade no estado atual ou faz uma requisição se não estiver disponível
    let cidade = window.Administration.state.cidades.find(
      (c) => c.id_cidade == id
    );
    
    if (!cidade) {
      // Se a cidade não estiver na página atual, busca do servidor
      try {
        cidade = await window.Administration.apiRequest(`/cidades/${id}`);
      } catch (error) {
        console.error("❌ Erro ao buscar cidade:", error);
        window.Administration.showError("Erro ao carregar dados da cidade");
        return;
      }
    }
    
    if (cidade) {
      document.getElementById("cidadeId").value = cidade.id_cidade;
      document.getElementById("cidadeNome").value = cidade.nome_cidade;
      document.getElementById("cidadeEstado").value = cidade.id_estado;
      document.getElementById("cidadeIbge").value = cidade.codigo_ibge || "";
      document.getElementById("cidadeModalTitle").textContent = "Editar Cidade";

      nomeInicial = cidade.nome_cidade;
      estadoInicial = cidade.id_estado.toString();
      ibgeInicial = cidade.codigo_ibge || "";
    }
  } else {
    document.getElementById("cidadeForm").reset();
    document.getElementById("cidadeId").value = "";
    document.getElementById("cidadeModalTitle").textContent = "Nova Cidade";

    nomeInicial = "";
    estadoInicial = "";
    ibgeInicial = "";
  }

  const nomeInput = document.getElementById("cidadeNome");
  const nomeInputClone = nomeInput.cloneNode(true);
  nomeInput.parentNode.replaceChild(nomeInputClone, nomeInput);

  const estadoSelectClone = estadoSelect.cloneNode(true);
  estadoSelect.parentNode.replaceChild(estadoSelectClone, estadoSelect);

  let buscaTimeout = null;
  const buscarIBGEAutomatico = async () => {
    const nomeCidade = document.getElementById("cidadeNome").value;
    const idEstado = document.getElementById("cidadeEstado").value;
    const ibgeInput = document.getElementById("cidadeIbge");

    const nomeMudou = nomeCidade !== nomeInicial;
    const estadoMudou = idEstado !== estadoInicial;
    const ibgeVazio = !ibgeInput.value || ibgeInput.value.trim() === "";

    if (
      nomeCidade &&
      nomeCidade.trim() !== "" &&
      idEstado &&
      (ibgeVazio || nomeMudou || estadoMudou)
    ) {
      if (buscaTimeout) {
        clearTimeout(buscaTimeout);
      }

      ibgeInput.placeholder = "Buscando código IBGE...";
      ibgeInput.disabled = true;

      buscaTimeout = setTimeout(async () => {
        const codigoIBGE = await window.Administration.buscarCodigoIBGE(
          nomeCidade,
          idEstado
        );
        ibgeInput.disabled = false;

        if (codigoIBGE) {
          ibgeInput.value = codigoIBGE;
          ibgeInput.placeholder = "";
        } else {
          ibgeInput.placeholder = "Código IBGE não encontrado";
          if (ibgeVazio) {
            ibgeInput.value = "";
          }
        }
      }, 500);
    } else {
      ibgeInput.placeholder = "";
      ibgeInput.disabled = false;
    }
  };

  document
    .getElementById("cidadeNome")
    .addEventListener("input", buscarIBGEAutomatico);
  document
    .getElementById("cidadeEstado")
    .addEventListener("change", buscarIBGEAutomatico);

  modal.classList.add("active");
};

window.Administration.saveCidade = async function () {
  const form = document.getElementById("cidadeForm");
  const id = document.getElementById("cidadeId").value;
  const cidadeData = {
    nome_cidade: document.getElementById("cidadeNome").value,
    id_estado: parseInt(document.getElementById("cidadeEstado").value),
    codigo_ibge: document.getElementById("cidadeIbge").value || null,
  };

  try {
    if (id) {
      await window.Administration.apiRequest(`/cidades/${id}`, {
        method: "PUT",
        body: JSON.stringify(cidadeData),
      });
    } else {
      await window.Administration.apiRequest("/cidades", {
        method: "POST",
        body: JSON.stringify(cidadeData),
      });
    }

    window.Administration.showSuccess(
      id ? "Cidade atualizada com sucesso" : "Cidade criada com sucesso"
    );
    document.getElementById("cidadeModal").classList.remove("active");
    form.reset();
    
    // Recarrega a página atual mantendo a busca se houver
    const pagination = window.Administration.state.pagination["cidades"];
    const searchTerm = window.Administration.state.currentSearchCidades || null;
    if (pagination) {
      window.Administration.loadCidades(pagination.currentPage, pagination.itemsPerPage, searchTerm);
    } else {
      window.Administration.loadCidades(1, 50, searchTerm);
    }
  } catch (error) {
    console.error("❌ Erro ao salvar cidade:", error);
    window.Administration.showError("Erro ao salvar cidade");
  }
};

window.Administration.deleteCidade = async function (id) {
  try {
    const counts = await window.Administration.apiRequest(
      `/cidades/${id}/count-related`
    );

    // Busca a cidade no estado atual ou faz uma requisição se não estiver disponível
    let cidade = window.Administration.state.cidades.find(
      (c) => c.id_cidade == id
    );
    
    if (!cidade) {
      // Se a cidade não estiver na página atual, busca do servidor
      try {
        cidade = await window.Administration.apiRequest(`/cidades/${id}`);
      } catch (error) {
        console.error("❌ Erro ao buscar cidade:", error);
        window.Administration.showError("Erro ao carregar dados da cidade");
        return;
      }
    }
    
    const cidadeNome = cidade ? cidade.nome_cidade : "esta cidade";

    const title = "Confirmar Exclusão de Cidade";
    const message = `Tem certeza que deseja excluir ${cidadeNome}? Esta ação não pode ser desfeita!`;

    window.Administration.openDeleteConfirmModal(
      title,
      message,
      counts,
      async () => {
        try {
          await window.Administration.apiRequest(`/cidades/${id}`, {
            method: "DELETE",
          });
          window.Administration.showSuccess("Cidade excluída com sucesso");
          
          // Recarrega a página atual mantendo a busca se houver
          const pagination = window.Administration.state.pagination["cidades"];
          const searchTerm = window.Administration.state.currentSearchCidades || null;
          if (pagination) {
            window.Administration.loadCidades(pagination.currentPage, pagination.itemsPerPage, searchTerm);
          } else {
            window.Administration.loadCidades(1, 50, searchTerm);
          }
        } catch (error) {
          console.error("❌ Erro ao excluir cidade:", error);
          window.Administration.showError("Erro ao excluir cidade");
        }
      }
    );
  } catch (error) {
    console.error("❌ Erro ao buscar informações de exclusão:", error);
    window.Administration.showError("Erro ao buscar informações de exclusão");
  }
};
