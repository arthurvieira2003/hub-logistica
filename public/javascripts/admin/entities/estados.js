// Administration Estados - Gerenciamento de estados
window.Administration = window.Administration || {};

window.Administration.loadEstados = async function () {
  try {
    const estados = await window.Administration.apiRequest("/estados");
    if (estados) {
      window.Administration.state.estados = estados;
      // Limpar dados filtrados ao recarregar
      window.Administration.state.filteredData.estados = null;
      window.Administration.resetPagination("estados");
      window.Administration.renderEstados(estados);
    }
  } catch (error) {
    console.error("❌ Erro ao carregar estados:", error);
    window.Administration.showError("Erro ao carregar estados");
  }
};

window.Administration.renderEstados = function (estados) {
  const tbody = document.querySelector("#estadosTable tbody");
  if (!tbody) return;

  // Se estados não foi passado, usar dados do state (pode ser filtrado)
  const dataToRender = estados || window.Administration.state.filteredData.estados || window.Administration.state.estados;

  // Aplicar paginação
  const { items, pagination } = window.Administration.getPaginatedData(dataToRender, "estados");

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="loading-data">Nenhum estado encontrado</td>
      </tr>
    `;
    window.Administration.renderPagination("estadosPagination", "estados", () => {
      window.Administration.renderEstados(window.Administration.state.estados);
    });
    return;
  }

  tbody.innerHTML = items
    .map(
      (estado) => `
    <tr>
      <td>${estado.id_estado}</td>
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

  // Renderizar controles de paginação
  window.Administration.renderPagination("estadosPagination", "estados", () => {
    const dataToRender = window.Administration.state.filteredData.estados || window.Administration.state.estados;
    window.Administration.renderEstados(dataToRender);
  });
};

window.Administration.openEstadoModal = function (id = null) {
  const modal = document.getElementById("estadoModal");
  if (!modal) {
    window.Administration.showError("Modal de estado não encontrado");
    return;
  }

  if (id) {
    const estado = window.Administration.state.estados.find(
      (e) => e.id_estado == id
    );
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
    window.Administration.loadEstados();
  } catch (error) {
    console.error("❌ Erro ao salvar estado:", error);
    window.Administration.showError("Erro ao salvar estado");
  }
};

window.Administration.deleteEstado = async function (id) {
  try {
    // Buscar contagem de registros relacionados
    const counts = await window.Administration.apiRequest(`/estados/${id}/count-related`);
    
    // Buscar nome do estado para exibir na mensagem
    const estado = window.Administration.state.estados.find(e => e.id_estado == id);
    const estadoNome = estado ? `${estado.uf} - ${estado.nome_estado}` : "este estado";
    
    const title = "Confirmar Exclusão de Estado";
    const message = `Tem certeza que deseja excluir ${estadoNome}? Esta ação não pode ser desfeita!`;
    
    // Abrir modal de confirmação
    window.Administration.openDeleteConfirmModal(title, message, counts, async () => {
      try {
        await window.Administration.apiRequest(`/estados/${id}`, {
          method: "DELETE",
        });
        window.Administration.showSuccess("Estado excluído com sucesso");
        window.Administration.loadEstados();
      } catch (error) {
        console.error("❌ Erro ao excluir estado:", error);
        window.Administration.showError("Erro ao excluir estado");
      }
    });
  } catch (error) {
    console.error("❌ Erro ao buscar informações de exclusão:", error);
    window.Administration.showError("Erro ao buscar informações de exclusão");
  }
};

