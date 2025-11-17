window.Administration = window.Administration || {};

window.Administration.loadFaixasPeso = async function () {
  try {
    const faixas = await window.Administration.apiRequest("/faixas-peso");
    if (faixas) {
      window.Administration.state.faixasPeso = faixas;
      window.Administration.state.filteredData.faixasPeso = null;
      window.Administration.resetPagination("faixasPeso");
      window.Administration.renderFaixasPeso(faixas);
    }
  } catch (error) {
    console.error("❌ Erro ao carregar faixas de peso:", error);
    window.Administration.showError("Erro ao carregar faixas de peso");
  }
};

window.Administration.renderFaixasPeso = function (faixas) {
  const tbody = document.querySelector("#faixasPesoTable tbody");
  if (!tbody) return;

  const dataToRender =
    faixas ||
    window.Administration.state.filteredData.faixasPeso ||
    window.Administration.state.faixasPeso;

  const { items, pagination } = window.Administration.getPaginatedData(
    dataToRender,
    "faixasPeso"
  );

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="loading-data">Nenhuma faixa encontrada</td>
      </tr>
    `;
    window.Administration.renderPagination(
      "faixasPesoPagination",
      "faixasPeso",
      () => {
        window.Administration.renderFaixasPeso(
          window.Administration.state.faixasPeso
        );
      }
    );
    return;
  }

  tbody.innerHTML = items
    .map(
      (faixa) => `
    <tr>
      <td>${faixa.id_faixa}</td>
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

  document
    .querySelectorAll(".edit-entity[data-entity-type='faixa-peso']")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        window.Administration.openFaixaPesoModal(id);
      });
    });

  document
    .querySelectorAll(".delete-entity[data-entity-type='faixa-peso']")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        window.Administration.deleteFaixaPeso(id);
      });
    });

  window.Administration.renderPagination(
    "faixasPesoPagination",
    "faixasPeso",
    () => {
      const dataToRender =
        window.Administration.state.filteredData.faixasPeso ||
        window.Administration.state.faixasPeso;
      window.Administration.renderFaixasPeso(dataToRender);
    }
  );
};

window.Administration.openFaixaPesoModal = function (id = null) {
  const modal = document.getElementById("faixaPesoModal");
  if (!modal) {
    window.Administration.showError("Modal de faixa de peso não encontrado");
    return;
  }

  if (id) {
    const faixa = window.Administration.state.faixasPeso.find(
      (f) => f.id_faixa == id
    );
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
    window.Administration.loadFaixasPeso();
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

    const faixa = window.Administration.state.faixasPeso.find(
      (f) => f.id_faixa == id
    );
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
          window.Administration.loadFaixasPeso();
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
