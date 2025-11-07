// Administration Transportadoras - Gerenciamento de transportadoras
window.Administration = window.Administration || {};

window.Administration.loadTransportadoras = async function () {
  try {
    const transportadoras = await window.Administration.apiRequest(
      "/transportadoras"
    );
    if (transportadoras) {
      window.Administration.state.transportadoras = transportadoras;
      // Limpar dados filtrados ao recarregar
      window.Administration.state.filteredData.transportadoras = null;
      window.Administration.resetPagination("transportadoras");
      window.Administration.renderTransportadoras(transportadoras);
    }
  } catch (error) {
    console.error("❌ Erro ao carregar transportadoras:", error);
    window.Administration.showError("Erro ao carregar transportadoras");
  }
};

window.Administration.renderTransportadoras = function (transportadoras) {
  const tbody = document.querySelector("#transportadorasTable tbody");
  if (!tbody) return;

  // Se transportadoras não foi passado, usar dados do state (pode ser filtrado)
  const dataToRender =
    transportadoras ||
    window.Administration.state.filteredData.transportadoras ||
    window.Administration.state.transportadoras;

  // Aplicar paginação
  const { items, pagination } = window.Administration.getPaginatedData(
    dataToRender,
    "transportadoras"
  );

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="loading-data">Nenhuma transportadora encontrada</td>
      </tr>
    `;
    window.Administration.renderPagination(
      "transportadorasPagination",
      "transportadoras",
      () => {
        window.Administration.renderTransportadoras(
          window.Administration.state.transportadoras
        );
      }
    );
    return;
  }

  tbody.innerHTML = items
    .map(
      (transp) => `
    <tr>
      <td>${transp.id_transportadora}</td>
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

  // Renderizar controles de paginação
  window.Administration.renderPagination(
    "transportadorasPagination",
    "transportadoras",
    () => {
      const dataToRender =
        window.Administration.state.filteredData.transportadoras ||
        window.Administration.state.transportadoras;
      window.Administration.renderTransportadoras(dataToRender);
    }
  );
};

window.Administration.openTransportadoraModal = function (id = null) {
  const modal = document.getElementById("transportadoraModal");
  if (!modal) {
    window.Administration.showError("Modal de transportadora não encontrado");
    return;
  }

  if (id) {
    const transp = window.Administration.state.transportadoras.find(
      (t) => t.id_transportadora == id
    );
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
    // ativa não é mais editável - será sempre true ao criar/editar
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
    window.Administration.loadTransportadoras();
  } catch (error) {
    console.error("❌ Erro ao salvar transportadora:", error);
    window.Administration.showError("Erro ao salvar transportadora");
  }
};

window.Administration.deleteTransportadora = async function (id) {
  try {
    // Buscar contagem de registros relacionados
    const counts = await window.Administration.apiRequest(
      `/transportadoras/${id}/count-related`
    );

    // Buscar nome da transportadora para exibir na mensagem
    const transportadora = window.Administration.state.transportadoras.find(
      (t) => t.id_transportadora == id
    );
    const transportadoraNome = transportadora
      ? transportadora.nome_transportadora
      : "esta transportadora";

    const title = "Confirmar Desativação";
    const message = `Tem certeza que deseja desativar ${transportadoraNome}?`;

    // Abrir modal de confirmação
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
          window.Administration.loadTransportadoras();
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
