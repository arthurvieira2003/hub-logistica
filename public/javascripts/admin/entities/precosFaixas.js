window.Administration = window.Administration || {};

window.Administration.loadPrecosFaixas = async function () {
  try {
    const precos = await window.Administration.apiRequest("/precos-faixas");
    if (precos) {
      window.Administration.state.precosFaixas = precos;
      window.Administration.state.filteredData.precosFaixas = null;
      window.Administration.resetPagination("precosFaixas");
      window.Administration.renderPrecosFaixas(precos);
    }
  } catch (error) {
    console.error("❌ Erro ao carregar preços de faixas:", error);
    window.Administration.showError("Erro ao carregar preços de faixas");
  }
};

window.Administration.renderPrecosFaixas = function (precos) {
  const tbody = document.querySelector("#precosFaixasTable tbody");
  if (!tbody) return;

  const dataToRender =
    precos ||
    window.Administration.state.filteredData.precosFaixas ||
    window.Administration.state.precosFaixas;

  const { items, pagination } = window.Administration.getPaginatedData(
    dataToRender,
    "precosFaixas"
  );

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="loading-data">Nenhum preço encontrado</td>
      </tr>
    `;
    window.Administration.renderPagination(
      "precosFaixasPagination",
      "precosFaixas",
      () => {
        window.Administration.renderPrecosFaixas(
          window.Administration.state.precosFaixas
        );
      }
    );
    return;
  }

  tbody.innerHTML = items
    .map((preco) => {
      const rota = preco.Rota;
      const faixa = preco.FaixasPeso;
      const transp = preco.Transportadora;
      const origem = rota?.Cidade || rota?.CidadeOrigem;
      const destino = rota?.CidadeDestino;
      const rotaNome =
        origem && destino
          ? `${origem.nome_cidade} → ${destino.nome_cidade}`
          : "N/A";

      const vigenciaInicio = preco.data_vigencia_inicio
        ? new Date(preco.data_vigencia_inicio).toLocaleDateString("pt-BR")
        : "N/A";

      return `
    <tr>
      <td>${preco.id_preco}</td>
      <td>${rotaNome}</td>
      <td>${faixa ? faixa.descricao : "N/A"}</td>
      <td>${transp ? transp.nome_transportadora : "N/A"}</td>
      <td>R$ ${parseFloat(preco.preco || 0).toFixed(2)}</td>
      <td>${vigenciaInicio}</td>
      <td><span class="status-badge ${preco.ativo ? "active" : "inactive"}">${
        preco.ativo ? "Ativo" : "Inativo"
      }</span></td>
      <td>
        <button class="btn-icon edit-entity" data-entity-type="preco-faixa" data-id="${
          preco.id_preco
        }" title="Editar">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon delete-entity" data-entity-type="preco-faixa" data-id="${
          preco.id_preco
        }" title="Excluir">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `;
    })
    .join("");

  document
    .querySelectorAll(".edit-entity[data-entity-type='preco-faixa']")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        window.Administration.openPrecoFaixaModal(id);
      });
    });

  document
    .querySelectorAll(".delete-entity[data-entity-type='preco-faixa']")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        window.Administration.deletePrecoFaixa(id);
      });
    });

  window.Administration.renderPagination(
    "precosFaixasPagination",
    "precosFaixas",
    () => {
      const dataToRender =
        window.Administration.state.filteredData.precosFaixas ||
        window.Administration.state.precosFaixas;
      window.Administration.renderPrecosFaixas(dataToRender);
    }
  );
};

window.Administration.openPrecoFaixaModal = async function (id = null) {
  const modal = document.getElementById("precoFaixaModal");
  if (!modal) {
    window.Administration.showError("Modal de preço de faixa não encontrado");
    return;
  }

  if (window.Administration.state.rotas.length === 0) {
    await window.Administration.loadRotas();
  }
  if (window.Administration.state.faixasPeso.length === 0) {
    await window.Administration.loadFaixasPeso();
  }
  if (window.Administration.state.transportadoras.length === 0) {
    await window.Administration.loadTransportadoras();
  }

  const rotaSelect = document.getElementById("precoFaixaRota");
  const faixaSelect = document.getElementById("precoFaixaFaixa");
  const transpSelect = document.getElementById("precoFaixaTransportadora");

  rotaSelect.innerHTML = '<option value="">Selecione uma rota</option>';
  window.Administration.state.rotas.forEach((rota) => {
    const origem = rota.Cidade || rota.CidadeOrigem;
    const destino = rota.CidadeDestino;
    const rotaNome =
      origem && destino
        ? `${origem.nome_cidade} → ${destino.nome_cidade}`
        : `Rota ${rota.id_rota}`;
    const option = document.createElement("option");
    option.value = rota.id_rota;
    option.textContent = rotaNome;
    rotaSelect.appendChild(option);
  });

  faixaSelect.innerHTML = '<option value="">Selecione uma faixa</option>';
  window.Administration.state.faixasPeso.forEach((faixa) => {
    const option = document.createElement("option");
    option.value = faixa.id_faixa;
    option.textContent = faixa.descricao;
    faixaSelect.appendChild(option);
  });

  transpSelect.innerHTML =
    '<option value="">Selecione uma transportadora</option>';
  window.Administration.state.transportadoras.forEach((transp) => {
    const option = document.createElement("option");
    option.value = transp.id_transportadora;
    option.textContent = transp.nome_transportadora;
    transpSelect.appendChild(option);
  });

  if (id) {
    const preco = window.Administration.state.precosFaixas.find(
      (p) => p.id_preco == id
    );
    if (preco) {
      document.getElementById("precoFaixaId").value = preco.id_preco;
      document.getElementById("precoFaixaRota").value = preco.id_rota;
      document.getElementById("precoFaixaFaixa").value = preco.id_faixa;
      document.getElementById("precoFaixaTransportadora").value =
        preco.id_transportadora;
      document.getElementById("precoFaixaPreco").value = preco.preco;
      document.getElementById("precoFaixaTxEmbarque").value =
        preco.tx_embarque || "";
      document.getElementById("precoFaixaFretePeso").value =
        preco.frete_peso || "";
      document.getElementById("precoFaixaTxAdm").value = preco.tx_adm || "";
      document.getElementById("precoFaixaGris").value = preco.gris || "";
      document.getElementById("precoFaixaTde").value = preco.tde || "";
      document.getElementById("precoFaixaTaxaQuimico").value =
        preco.taxa_quimico || "";
      document.getElementById("precoFaixaPedagio").value = preco.pedagio || "";
      document.getElementById("precoFaixaVigenciaInicio").value =
        preco.data_vigencia_inicio || "";
      document.getElementById("precoFaixaVigenciaFim").value =
        preco.data_vigencia_fim || "";
      document.getElementById("precoFaixaModalTitle").textContent =
        "Editar Preço de Faixa";
    }
  } else {
    document.getElementById("precoFaixaForm").reset();
    document.getElementById("precoFaixaId").value = "";
    const hoje = new Date().toISOString().split("T")[0];
    document.getElementById("precoFaixaVigenciaInicio").value = hoje;
    document.getElementById("precoFaixaModalTitle").textContent =
      "Novo Preço de Faixa";
  }

  modal.classList.add("active");
};

window.Administration.savePrecoFaixa = async function () {
  const form = document.getElementById("precoFaixaForm");
  const id = document.getElementById("precoFaixaId").value;
  const precoData = {
    id_rota: parseInt(document.getElementById("precoFaixaRota").value),
    id_faixa: parseInt(document.getElementById("precoFaixaFaixa").value),
    id_transportadora: parseInt(
      document.getElementById("precoFaixaTransportadora").value
    ),
    preco: parseFloat(document.getElementById("precoFaixaPreco").value),
    tx_embarque: document.getElementById("precoFaixaTxEmbarque").value || null,
    frete_peso: document.getElementById("precoFaixaFretePeso").value || null,
    tx_adm: document.getElementById("precoFaixaTxAdm").value || null,
    gris: document.getElementById("precoFaixaGris").value || null,
    tde: document.getElementById("precoFaixaTde").value || null,
    taxa_quimico:
      document.getElementById("precoFaixaTaxaQuimico").value || null,
    pedagio: document.getElementById("precoFaixaPedagio").value || null,
    data_vigencia_inicio: document.getElementById("precoFaixaVigenciaInicio")
      .value,
    data_vigencia_fim:
      document.getElementById("precoFaixaVigenciaFim").value || null,
    ativo: true,
  };

  Object.keys(precoData).forEach((key) => {
    if (
      precoData[key] === "" ||
      (typeof precoData[key] === "number" && isNaN(precoData[key]))
    ) {
      if (
        key !== "preco" &&
        key !== "id_rota" &&
        key !== "id_faixa" &&
        key !== "id_transportadora"
      ) {
        precoData[key] = null;
      }
    }
  });

  try {
    if (id) {
      await window.Administration.apiRequest(`/precos-faixas/${id}`, {
        method: "PUT",
        body: JSON.stringify(precoData),
      });
    } else {
      await window.Administration.apiRequest("/precos-faixas", {
        method: "POST",
        body: JSON.stringify(precoData),
      });
    }

    window.Administration.showSuccess(
      id
        ? "Preço de faixa atualizado com sucesso"
        : "Preço de faixa criado com sucesso"
    );
    document.getElementById("precoFaixaModal").classList.remove("active");
    form.reset();
    window.Administration.loadPrecosFaixas();
  } catch (error) {
    console.error("❌ Erro ao salvar preço de faixa:", error);
    window.Administration.showError("Erro ao salvar preço de faixa");
  }
};

window.Administration.deletePrecoFaixa = async function (id) {
  try {
    const counts = {};

    const preco = window.Administration.state.precosFaixas.find(
      (p) => p.id_preco == id
    );
    let precoNome = "este preço de faixa";
    if (preco) {
      const rota = preco.Rota;
      const faixa = preco.FaixasPeso;
      const transp = preco.Transportadora;
      if (rota && faixa && transp) {
        const origem = rota.Cidade || rota.CidadeOrigem;
        const destino = rota.CidadeDestino;
        const origemNome = origem ? origem.nome_cidade : "N/A";
        const destinoNome = destino ? destino.nome_cidade : "N/A";
        precoNome = `preço da rota ${origemNome} → ${destinoNome} (${
          faixa.descricao || `${faixa.peso_minimo}-${faixa.peso_maximo}kg`
        }, ${transp.nome_transportadora})`;
      }
    }

    const title = "Confirmar Desativação";
    const message = `Tem certeza que deseja desativar ${precoNome}? O registro será desativado e não aparecerá mais nas listagens.`;

    window.Administration.openDeleteConfirmModal(
      title,
      message,
      counts,
      async () => {
        try {
          await window.Administration.apiRequest(`/precos-faixas/${id}`, {
            method: "DELETE",
          });
          window.Administration.showSuccess(
            "Preço de faixa desativado com sucesso"
          );
          window.Administration.loadPrecosFaixas();
        } catch (error) {
          console.error("❌ Erro ao excluir preço de faixa:", error);
          window.Administration.showError("Erro ao excluir preço de faixa");
        }
      }
    );
  } catch (error) {
    console.error("❌ Erro ao buscar informações de exclusão:", error);
    window.Administration.showError("Erro ao buscar informações de exclusão");
  }
};
