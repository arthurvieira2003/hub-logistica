window.Administration = window.Administration || {};

function cancelPreviousRequest() {
  if (window.Administration.state.requestControllers.cidades) {
    window.Administration.state.requestControllers.cidades.abort();
  }
}

function createNewRequestController() {
  const controller = new AbortController();
  window.Administration.state.requestControllers.cidades = controller;
  return controller;
}

function incrementRequestSequence() {
  if (!window.Administration.state.requestSequence.cidades) {
    window.Administration.state.requestSequence.cidades = 0;
  }
  window.Administration.state.requestSequence.cidades += 1;
  return window.Administration.state.requestSequence.cidades;
}

function normalizeSearchTerm(search) {
  return search && search.trim() !== "" ? search.trim() : null;
}

function buildCidadesUrl(page, limit, searchTerm) {
  let url = `/cidades?page=${page}&limit=${limit}`;
  if (searchTerm) {
    url += `&search=${encodeURIComponent(searchTerm)}`;
  }
  return url;
}

function isRequestStillValid(currentSequence) {
  return (
    window.Administration.state.requestSequence.cidades === currentSequence
  );
}

function updatePaginationFromResponse(response) {
  const pagination = window.Administration.state.pagination["cidades"];
  if (pagination && response.pagination) {
    pagination.currentPage = response.pagination.page;
    pagination.totalItems = response.pagination.total;
    pagination.totalPages = response.pagination.totalPages;
    pagination.itemsPerPage = response.pagination.limit;
  }
}

function handleResponseData(response, searchTerm) {
  if (!response?.data) {
    return;
  }

  updatePaginationFromResponse(response);
  window.Administration.state.cidades = response.data;

  if (!searchTerm) {
    window.Administration.state.filteredData.cidades = null;
  }

  window.Administration.renderCidades(response.data);
}

function isAbortError(error, controller) {
  return error.name === "AbortError" || controller.signal.aborted;
}

function handleLoadCidadesError(error, controller, currentSequence) {
  if (
    isAbortError(error, controller) ||
    !isRequestStillValid(currentSequence)
  ) {
    return;
  }

  console.error("❌ Erro ao carregar cidades:", error);
  window.Administration.showError("Erro ao carregar cidades");
}

window.Administration.loadCidades = async function (
  page = 1,
  limit = 50,
  search = null
) {
  cancelPreviousRequest();
  const controller = createNewRequestController();
  const currentSequence = incrementRequestSequence();

  try {
    window.Administration.initPagination("cidades", limit);

    const searchTerm = normalizeSearchTerm(search);
    window.Administration.state.currentSearchCidades = searchTerm;

    const url = buildCidadesUrl(page, limit, searchTerm);
    const response = await window.Administration.apiRequest(url, {
      signal: controller.signal,
    });

    if (!isRequestStillValid(currentSequence) || controller.signal.aborted) {
      return;
    }

    handleResponseData(response, searchTerm);
  } catch (error) {
    handleLoadCidadesError(error, controller, currentSequence);
  } finally {
    if (isRequestStillValid(currentSequence)) {
      window.Administration.state.requestControllers.cidades = null;
    }
  }
};

window.Administration.renderCidades = function (cidades) {
  const tbody = document.querySelector("#cidadesTable tbody");
  if (!tbody) return;

  const dataToRender = window.Administration.state.filteredData.cidades;

  if (dataToRender) {
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
            const searchTerm =
              window.Administration.state.currentSearchCidades || null;
            window.Administration.loadCidades(
              pagination.currentPage,
              pagination.itemsPerPage,
              searchTerm
            );
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

    window.Administration.renderPagination(
      "cidadesPagination",
      "cidades",
      () => {
        const pagination = window.Administration.state.pagination["cidades"];
        if (pagination) {
          const searchTerm =
            window.Administration.state.currentSearchCidades || null;
          window.Administration.loadCidades(
            pagination.currentPage,
            pagination.itemsPerPage,
            searchTerm
          );
        }
      }
    );
  }

  document
    .querySelectorAll(".edit-entity[data-entity-type='cidade']")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        window.Administration.openCidadeModal(id);
      });
    });

  document
    .querySelectorAll(".delete-entity[data-entity-type='cidade']")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
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

window.Administration.buscarEstadosIBGE = async function () {
  try {
    const url = `https://servicodados.ibge.gov.br/api/v1/localidades/estados`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro ao buscar estados: ${response.statusText}`);
    }

    const estados = await response.json();
    return estados
      .map((estado) => ({
        id: estado.id,
        sigla: estado.sigla,
        nome: estado.nome,
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  } catch (error) {
    console.error("❌ Erro ao buscar estados do IBGE:", error);
    window.Administration.showError("Erro ao buscar estados");
    return [];
  }
};

window.Administration.buscarMunicipiosIBGE = async function (uf) {
  try {
    if (!uf || uf.trim() === "") {
      return [];
    }

    const url = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro ao buscar municípios: ${response.statusText}`);
    }

    const municipios = await response.json();
    return municipios.map((municipio) => ({
      id: municipio.id,
      nome: municipio.nome,
    }));
  } catch (error) {
    console.error("❌ Erro ao buscar municípios do IBGE:", error);
    window.Administration.showError("Erro ao buscar municípios");
    return [];
  }
};

window.Administration.openCidadeModal = async function (id = null) {
  const modal = document.getElementById("cidadeModal");
  if (!modal) {
    window.Administration.showError("Modal de cidade não encontrado");
    return;
  }

  const estadoSelect = document.getElementById("cidadeEstado");
  estadoSelect.innerHTML = '<option value="">Carregando estados...</option>';
  estadoSelect.disabled = true;

  let estadosParaUsar = [];

  if (id) {
    // Para edição, usar estados do banco de dados
    if (window.Administration.state.estados.length === 0) {
      await window.Administration.loadEstados();
    }
    estadosParaUsar = window.Administration.state.estados.map((estado) => ({
      id: estado.id_estado,
      sigla: estado.uf,
      nome: estado.nome_estado,
    }));
  } else {
    // Para nova cidade, buscar todos os estados do IBGE
    estadosParaUsar = await window.Administration.buscarEstadosIBGE();
  }

  estadoSelect.innerHTML = '<option value="">Selecione um estado</option>';
  estadosParaUsar.forEach((estado) => {
    const option = document.createElement("option");
    option.value = estado.id;
    option.textContent = `${estado.sigla} - ${estado.nome}`;
    option.dataset.uf = estado.sigla;
    estadoSelect.appendChild(option);
  });
  estadoSelect.disabled = false;

  let nomeInicial = "";
  let estadoInicial = "";
  let ibgeInicial = "";

  if (id) {
    let cidade = window.Administration.state.cidades.find(
      (c) => c.id_cidade == id
    );

    if (!cidade) {
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

  const estadoSelectClone = estadoSelect.cloneNode(true);
  estadoSelect.parentNode.replaceChild(estadoSelectClone, estadoSelect);

  const municipioSelect = document.getElementById("cidadeMunicipio");
  const municipioSelectClone = municipioSelect.cloneNode(true);
  municipioSelect.parentNode.replaceChild(
    municipioSelectClone,
    municipioSelect
  );

  const municipioGroup = document.getElementById("municipioGroup");
  const ibgeInput = document.getElementById("cidadeIbge");

  if (id) {
    const cidadeId = document.getElementById("cidadeId").value;
    const cidadeEstado = document.getElementById("cidadeEstado").value;
    const cidadeIbge = document.getElementById("cidadeIbge").value;

    if (cidadeId) document.getElementById("cidadeId").value = cidadeId;
    if (cidadeEstado) estadoSelectClone.value = cidadeEstado;
    if (cidadeIbge) ibgeInput.value = cidadeIbge;
  }

  municipioSelectClone.innerHTML =
    '<option value="">Selecione um município</option>';
  municipioGroup.style.display = "none";

  const carregarMunicipios = async () => {
    const idEstado = estadoSelectClone.value;

    if (!idEstado) {
      municipioGroup.style.display = "none";
      municipioSelectClone.innerHTML =
        '<option value="">Selecione um município</option>';
      ibgeInput.value = "";
      return;
    }

    // Obter a UF do estado selecionado
    const selectedEstadoOption =
      estadoSelectClone.options[estadoSelectClone.selectedIndex];
    let uf = null;

    if (selectedEstadoOption && selectedEstadoOption.dataset.uf) {
      // Estado do IBGE (nova cidade)
      uf = selectedEstadoOption.dataset.uf;
    } else {
      // Estado do banco de dados (edição)
      const estado = window.Administration.state.estados.find(
        (e) => e.id_estado == idEstado
      );
      if (!estado) {
        return;
      }
      uf = estado.uf;
    }

    municipioGroup.style.display = "block";
    municipioSelectClone.innerHTML =
      '<option value="">Carregando municípios...</option>';
    municipioSelectClone.disabled = true;

    if (!uf) {
      return;
    }

    try {
      const municipios = await window.Administration.buscarMunicipiosIBGE(uf);

      municipioSelectClone.innerHTML =
        '<option value="">Selecione um município</option>';

      municipios.forEach((municipio) => {
        const option = document.createElement("option");
        option.value = municipio.id;
        option.textContent = municipio.nome;
        option.dataset.codigoIbge = municipio.id;
        municipioSelectClone.appendChild(option);
      });

      municipioSelectClone.disabled = false;

      if (id && ibgeInicial) {
        const municipioCorrespondente = municipios.find(
          (m) => m.id.toString() === ibgeInicial.toString()
        );
        if (municipioCorrespondente) {
          municipioSelectClone.value = municipioCorrespondente.id;
        }
      }
    } catch (error) {
      console.error("❌ Erro ao carregar municípios:", error);
      municipioSelectClone.innerHTML =
        '<option value="">Erro ao carregar municípios</option>';
    }
  };

  estadoSelectClone.addEventListener("change", carregarMunicipios);

  municipioSelectClone.addEventListener("change", () => {
    const selectedOption =
      municipioSelectClone.options[municipioSelectClone.selectedIndex];

    if (selectedOption && selectedOption.value) {
      const codigoIbge =
        selectedOption.dataset.codigoIbge || selectedOption.value;

      ibgeInput.value = codigoIbge;
    } else {
      ibgeInput.value = "";
    }
  });

  if (id && estadoInicial && estadoSelectClone.value) {
    await carregarMunicipios();
  }

  modal.classList.add("active");
};

window.Administration.saveCidade = async function () {
  const form = document.getElementById("cidadeForm");
  const id = document.getElementById("cidadeId").value;
  const municipioGroup = document.getElementById("municipioGroup");
  const municipioSelect = document.getElementById("cidadeMunicipio");

  // Validar se o município foi selecionado quando o campo está visível
  if (municipioGroup.style.display !== "none" && !municipioSelect.value) {
    window.Administration.showError("Por favor, selecione um município");
    return;
  }

  // Obter o nome do município selecionado
  let nomeCidade = "";
  if (municipioSelect.value) {
    const selectedOption =
      municipioSelect.options[municipioSelect.selectedIndex];
    if (selectedOption) {
      nomeCidade = selectedOption.textContent;
    }
  }

  // Obter o id_estado do banco de dados
  const estadoSelect = document.getElementById("cidadeEstado");
  const selectedEstadoOption = estadoSelect.options[estadoSelect.selectedIndex];
  let idEstadoBanco = null;

  if (selectedEstadoOption && selectedEstadoOption.dataset.uf) {
    // Estado do IBGE (nova cidade) - precisa buscar no banco usando a UF
    const uf = selectedEstadoOption.dataset.uf;
    if (window.Administration.state.estados.length === 0) {
      await window.Administration.loadEstados();
    }
    const estadoBanco = window.Administration.state.estados.find(
      (e) => e.uf === uf
    );
    if (estadoBanco) {
      idEstadoBanco = estadoBanco.id_estado;
    } else {
      window.Administration.showError(
        "Estado não encontrado no banco de dados"
      );
      return;
    }
  } else {
    // Estado do banco de dados (edição)
    idEstadoBanco = parseInt(estadoSelect.value);
  }

  const cidadeData = {
    nome_cidade: nomeCidade,
    id_estado: idEstadoBanco,
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

    const pagination = window.Administration.state.pagination["cidades"];
    const searchTerm = window.Administration.state.currentSearchCidades || null;
    if (pagination) {
      window.Administration.loadCidades(
        pagination.currentPage,
        pagination.itemsPerPage,
        searchTerm
      );
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

    let cidade = window.Administration.state.cidades.find(
      (c) => c.id_cidade == id
    );

    if (!cidade) {
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

          const pagination = window.Administration.state.pagination["cidades"];
          const searchTerm =
            window.Administration.state.currentSearchCidades || null;
          if (pagination) {
            window.Administration.loadCidades(
              pagination.currentPage,
              pagination.itemsPerPage,
              searchTerm
            );
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
