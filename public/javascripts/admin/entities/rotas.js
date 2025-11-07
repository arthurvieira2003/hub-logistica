// Administration Rotas - Gerenciamento de rotas
window.Administration = window.Administration || {};

window.Administration.loadRotas = async function () {
  try {
    const rotas = await window.Administration.apiRequest("/rotas");
    if (rotas) {
      window.Administration.state.rotas = rotas;
      // Limpar dados filtrados ao recarregar
      window.Administration.state.filteredData.rotas = null;
      window.Administration.resetPagination("rotas");
      window.Administration.renderRotas(rotas);
    }
  } catch (error) {
    console.error("❌ Erro ao carregar rotas:", error);
    window.Administration.showError("Erro ao carregar rotas");
  }
};

window.Administration.renderRotas = function (rotas) {
  const tbody = document.querySelector("#rotasTable tbody");
  if (!tbody) return;

  // Se rotas não foi passado, usar dados do state (pode ser filtrado)
  const dataToRender =
    rotas ||
    window.Administration.state.filteredData.rotas ||
    window.Administration.state.rotas;

  // Aplicar paginação
  const { items, pagination } = window.Administration.getPaginatedData(
    dataToRender,
    "rotas"
  );

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="loading-data">Nenhuma rota encontrada</td>
      </tr>
    `;
    window.Administration.renderPagination("rotasPagination", "rotas", () => {
      window.Administration.renderRotas(window.Administration.state.rotas);
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
      <td>${rota.id_rota}</td>
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

  // Renderizar controles de paginação
  window.Administration.renderPagination("rotasPagination", "rotas", () => {
    const dataToRender =
      window.Administration.state.filteredData.rotas ||
      window.Administration.state.rotas;
    window.Administration.renderRotas(dataToRender);
  });
};

window.Administration.openRotaModal = async function (id = null) {
  const modal = document.getElementById("rotaModal");
  if (!modal) {
    window.Administration.showError("Modal de rota não encontrado");
    return;
  }

  // Carregar cidades para os selects
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
    const rota = window.Administration.state.rotas.find((r) => r.id_rota == id);
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
    // ativa não é mais editável - será sempre true ao criar/editar
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
    window.Administration.loadRotas();
  } catch (error) {
    console.error("❌ Erro ao salvar rota:", error);
    window.Administration.showError("Erro ao salvar rota");
  }
};

window.Administration.deleteRota = async function (id) {
  try {
    // Buscar contagem de registros relacionados
    const counts = await window.Administration.apiRequest(
      `/rotas/${id}/count-related`
    );

    // Buscar informações da rota para exibir na mensagem
    const rota = window.Administration.state.rotas.find((r) => r.id_rota == id);
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

    // Abrir modal de confirmação
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
          window.Administration.loadRotas();
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
