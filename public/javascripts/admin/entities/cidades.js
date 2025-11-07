// Administration Cidades - Gerenciamento de cidades
window.Administration = window.Administration || {};

window.Administration.loadCidades = async function () {
  try {
    const cidades = await window.Administration.apiRequest("/cidades");
    if (cidades) {
      window.Administration.state.cidades = cidades;
      // Limpar dados filtrados ao recarregar
      window.Administration.state.filteredData.cidades = null;
      window.Administration.resetPagination("cidades");
      window.Administration.renderCidades(cidades);
    }
  } catch (error) {
    console.error("❌ Erro ao carregar cidades:", error);
    window.Administration.showError("Erro ao carregar cidades");
  }
};

window.Administration.renderCidades = function (cidades) {
  const tbody = document.querySelector("#cidadesTable tbody");
  if (!tbody) return;

  // Se cidades não foi passado, usar dados do state (pode ser filtrado)
  const dataToRender =
    cidades ||
    window.Administration.state.filteredData.cidades ||
    window.Administration.state.cidades;

  // Aplicar paginação
  const { items, pagination } = window.Administration.getPaginatedData(
    dataToRender,
    "cidades"
  );

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="loading-data">Nenhuma cidade encontrada</td>
      </tr>
    `;
    window.Administration.renderPagination(
      "cidadesPagination",
      "cidades",
      () => {
        window.Administration.renderCidades(
          window.Administration.state.cidades
        );
      }
    );
    return;
  }

  tbody.innerHTML = items
    .map(
      (cidade) => `
    <tr>
      <td>${cidade.id_cidade}</td>
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

  // Renderizar controles de paginação
  window.Administration.renderPagination("cidadesPagination", "cidades", () => {
    const dataToRender =
      window.Administration.state.filteredData.cidades ||
      window.Administration.state.cidades;
    window.Administration.renderCidades(dataToRender);
  });
};

window.Administration.buscarCodigoIBGE = async function (nomeCidade, idEstado) {
  try {
    // Buscar UF do estado selecionado
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

  // Carregar estados para o select
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

  // Armazenar valores iniciais para comparação
  let nomeInicial = "";
  let estadoInicial = "";
  let ibgeInicial = "";

  // Preencher valores iniciais antes de adicionar event listeners
  if (id) {
    const cidade = window.Administration.state.cidades.find(
      (c) => c.id_cidade == id
    );
    if (cidade) {
      document.getElementById("cidadeId").value = cidade.id_cidade;
      document.getElementById("cidadeNome").value = cidade.nome_cidade;
      document.getElementById("cidadeEstado").value = cidade.id_estado;
      document.getElementById("cidadeIbge").value = cidade.codigo_ibge || "";
      document.getElementById("cidadeModalTitle").textContent = "Editar Cidade";

      // Armazenar valores iniciais
      nomeInicial = cidade.nome_cidade;
      estadoInicial = cidade.id_estado.toString();
      ibgeInicial = cidade.codigo_ibge || "";
    }
  } else {
    document.getElementById("cidadeForm").reset();
    document.getElementById("cidadeId").value = "";
    document.getElementById("cidadeModalTitle").textContent = "Nova Cidade";

    // Valores iniciais vazios para nova cidade
    nomeInicial = "";
    estadoInicial = "";
    ibgeInicial = "";
  }

  // Remover event listeners anteriores se existirem (clonando elementos)
  const nomeInput = document.getElementById("cidadeNome");
  const nomeInputClone = nomeInput.cloneNode(true);
  nomeInput.parentNode.replaceChild(nomeInputClone, nomeInput);

  const estadoSelectClone = estadoSelect.cloneNode(true);
  estadoSelect.parentNode.replaceChild(estadoSelectClone, estadoSelect);

  // Função para buscar IBGE quando nome ou estado mudarem
  let buscaTimeout = null;
  const buscarIBGEAutomatico = async () => {
    const nomeCidade = document.getElementById("cidadeNome").value;
    const idEstado = document.getElementById("cidadeEstado").value;
    const ibgeInput = document.getElementById("cidadeIbge");

    // Só buscar se o código IBGE estiver vazio ou se o nome/estado mudaram
    const nomeMudou = nomeCidade !== nomeInicial;
    const estadoMudou = idEstado !== estadoInicial;
    const ibgeVazio = !ibgeInput.value || ibgeInput.value.trim() === "";

    if (
      nomeCidade &&
      nomeCidade.trim() !== "" &&
      idEstado &&
      (ibgeVazio || nomeMudou || estadoMudou)
    ) {
      // Limpar timeout anterior
      if (buscaTimeout) {
        clearTimeout(buscaTimeout);
      }

      // Adicionar indicador de carregamento
      ibgeInput.placeholder = "Buscando código IBGE...";
      ibgeInput.disabled = true;

      // Aguardar 500ms antes de buscar (debounce)
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
          // Só limpar o valor se estiver buscando automaticamente (não se o usuário digitou)
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

  // Adicionar event listeners
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
    window.Administration.loadCidades();
  } catch (error) {
    console.error("❌ Erro ao salvar cidade:", error);
    window.Administration.showError("Erro ao salvar cidade");
  }
};

window.Administration.deleteCidade = async function (id) {
  try {
    // Buscar contagem de registros relacionados
    const counts = await window.Administration.apiRequest(
      `/cidades/${id}/count-related`
    );

    // Buscar nome da cidade para exibir na mensagem
    const cidade = window.Administration.state.cidades.find(
      (c) => c.id_cidade == id
    );
    const cidadeNome = cidade ? cidade.nome_cidade : "esta cidade";

    const title = "Confirmar Exclusão de Cidade";
    const message = `Tem certeza que deseja excluir ${cidadeNome}? Esta ação não pode ser desfeita!`;

    // Abrir modal de confirmação
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
          window.Administration.loadCidades();
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
