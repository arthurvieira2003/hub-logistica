window.Administration = window.Administration || {};

function cancelPreviousPrecosFaixasRequest() {
  if (window.Administration.state.requestControllers.precosFaixas) {
    window.Administration.state.requestControllers.precosFaixas.abort();
  }
}

function createNewPrecosFaixasRequestController() {
  const controller = new AbortController();
  window.Administration.state.requestControllers.precosFaixas = controller;
  return controller;
}

function incrementPrecosFaixasRequestSequence() {
  if (!window.Administration.state.requestSequence.precosFaixas) {
    window.Administration.state.requestSequence.precosFaixas = 0;
  }
  window.Administration.state.requestSequence.precosFaixas += 1;
  return window.Administration.state.requestSequence.precosFaixas;
}

function normalizePrecosFaixasSearchTerm(search) {
  return search && search.trim() !== "" ? search.trim() : null;
}

function buildPrecosFaixasUrl(page, limit, searchTerm) {
  let url = `/precosFaixas?page=${page}&limit=${limit}`;
  if (searchTerm) {
    url += `&search=${encodeURIComponent(searchTerm)}`;
  }
  return url;
}

function isPrecosFaixasRequestStillValid(currentSequence) {
  return (
    window.Administration.state.requestSequence.precosFaixas === currentSequence
  );
}

function updatePrecosFaixasPaginationFromResponse(response) {
  const pagination = window.Administration.state.pagination["precosFaixas"];
  if (pagination && response.pagination) {
    pagination.currentPage = response.pagination.page;
    pagination.totalItems = response.pagination.total;
    pagination.totalPages = response.pagination.totalPages;
    pagination.itemsPerPage = response.pagination.limit;
  }
}

function handlePrecosFaixasResponseData(response, searchTerm) {
  if (!response?.data) {
    return;
  }

  updatePrecosFaixasPaginationFromResponse(response);
  window.Administration.state.precosFaixas = response.data;

  if (!searchTerm) {
    window.Administration.state.filteredData.precosFaixas = null;
  }

  window.Administration.renderPrecosFaixas(response.data);
}

function isPrecosFaixasAbortError(error, controller) {
  return error.name === "AbortError" || controller.signal.aborted;
}

function handleLoadPrecosFaixasError(error, controller, currentSequence) {
  if (
    isPrecosFaixasAbortError(error, controller) ||
    !isPrecosFaixasRequestStillValid(currentSequence)
  ) {
    return;
  }

  console.error("❌ Erro ao carregar preços de faixas:", error);
  window.Administration.showError("Erro ao carregar preços de faixas");
}

window.Administration.loadPrecosFaixas = async function (
  page = 1,
  limit = 50,
  search = null
) {
  cancelPreviousPrecosFaixasRequest();
  const controller = createNewPrecosFaixasRequestController();
  const currentSequence = incrementPrecosFaixasRequestSequence();

  try {
    window.Administration.initPagination("precosFaixas", limit);

    const searchTerm = normalizePrecosFaixasSearchTerm(search);
    window.Administration.state.currentSearchPrecosFaixas = searchTerm;

    const url = buildPrecosFaixasUrl(page, limit, searchTerm);
    const response = await window.Administration.apiRequest(url, {
      signal: controller.signal,
    });

    if (
      !isPrecosFaixasRequestStillValid(currentSequence) ||
      controller.signal.aborted
    ) {
      return;
    }

    handlePrecosFaixasResponseData(response, searchTerm);
  } catch (error) {
    handleLoadPrecosFaixasError(error, controller, currentSequence);
  } finally {
    if (isPrecosFaixasRequestStillValid(currentSequence)) {
      window.Administration.state.requestControllers.precosFaixas = null;
    }
  }
};

window.Administration.renderPrecosFaixas = function (precos) {
  const tbody = document.querySelector("#precosFaixasTable tbody");
  if (!tbody) return;

  // Se há dados filtrados, usa paginação client-side
  const dataToRender = window.Administration.state.filteredData.precosFaixas;

  if (dataToRender) {
    // Paginação client-side para dados filtrados
    const { items, pagination } = window.Administration.getPaginatedData(
      dataToRender,
      "precosFaixas"
    );

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="loading-data">Nenhum preço encontrado</td>
        </tr>
      `;
      window.Administration.renderPagination(
        "precosFaixasPagination",
        "precosFaixas",
        () => {
          window.Administration.renderPrecosFaixas();
        }
      );
      return;
    }

    tbody.innerHTML = items
      .map((preco) => {
        // Acessar através da nova estrutura RotaTransportadora
        const rotaTransportadora = preco.RotaTransportadora;
        const rota = rotaTransportadora?.Rota || preco.Rota; // Fallback para compatibilidade
        const faixa = preco.FaixasPeso;
        const transp =
          rotaTransportadora?.Transportadora || preco.Transportadora; // Fallback para compatibilidade
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
        <td>${rotaNome}</td>
        <td>${faixa ? faixa.descricao : "N/A"}</td>
        <td>${transp ? transp.nome_transportadora : "N/A"}</td>
        <td>R$ ${parseFloat(preco.preco || 0).toFixed(2)}</td>
        <td>${vigenciaInicio}</td>
        <td><span class="status-badge ${preco.ativo ? "active" : "inactive"}">${
          preco.ativo ? "Ativo" : "Inativo"
        }</span></td>
        <td>
          ${
            preco.ativo
              ? `
            <button class="btn-icon edit-entity" data-entity-type="preco-faixa" data-id="${preco.id_preco}" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon delete-entity" data-entity-type="preco-faixa" data-id="${preco.id_preco}" title="Excluir">
              <i class="fas fa-trash"></i>
            </button>
          `
              : `
            <button class="btn-icon reactivate-entity" data-entity-type="preco-faixa" data-id="${preco.id_preco}" title="Reativar">
              <i class="fas fa-redo"></i>
            </button>
          `
          }
        </td>
      </tr>
    `;
      })
      .join("");

    window.Administration.renderPagination(
      "precosFaixasPagination",
      "precosFaixas",
      () => {
        window.Administration.renderPrecosFaixas();
      }
    );
  } else {
    // Renderização direta para dados paginados do servidor
    const data = precos || window.Administration.state.precosFaixas || [];

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="loading-data">Nenhum preço encontrado</td>
        </tr>
      `;
      window.Administration.renderPagination(
        "precosFaixasPagination",
        "precosFaixas",
        () => {
          const pagination =
            window.Administration.state.pagination["precosFaixas"];
          if (pagination) {
            const searchTerm =
              window.Administration.state.currentSearchPrecosFaixas || null;
            window.Administration.loadPrecosFaixas(
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
      .map((preco) => {
        // Acessar através da nova estrutura RotaTransportadora
        const rotaTransportadora = preco.RotaTransportadora;
        const rota = rotaTransportadora?.Rota || preco.Rota; // Fallback para compatibilidade
        const faixa = preco.FaixasPeso;
        const transp =
          rotaTransportadora?.Transportadora || preco.Transportadora; // Fallback para compatibilidade
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
        <td>${rotaNome}</td>
        <td>${faixa ? faixa.descricao : "N/A"}</td>
        <td>${transp ? transp.nome_transportadora : "N/A"}</td>
        <td>R$ ${parseFloat(preco.preco || 0).toFixed(2)}</td>
        <td>${vigenciaInicio}</td>
        <td><span class="status-badge ${preco.ativo ? "active" : "inactive"}">${
          preco.ativo ? "Ativo" : "Inativo"
        }</span></td>
        <td>
          ${
            preco.ativo
              ? `
            <button class="btn-icon edit-entity" data-entity-type="preco-faixa" data-id="${preco.id_preco}" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon delete-entity" data-entity-type="preco-faixa" data-id="${preco.id_preco}" title="Excluir">
              <i class="fas fa-trash"></i>
            </button>
          `
              : `
            <button class="btn-icon reactivate-entity" data-entity-type="preco-faixa" data-id="${preco.id_preco}" title="Reativar">
              <i class="fas fa-redo"></i>
            </button>
          `
          }
        </td>
      </tr>
    `;
      })
      .join("");

    window.Administration.renderPagination(
      "precosFaixasPagination",
      "precosFaixas",
      () => {
        const pagination =
          window.Administration.state.pagination["precosFaixas"];
        if (pagination) {
          const searchTerm =
            window.Administration.state.currentSearchPrecosFaixas || null;
          window.Administration.loadPrecosFaixas(
            pagination.currentPage,
            pagination.itemsPerPage,
            searchTerm
          );
        }
      }
    );
  }

  // Adiciona event listeners aos botões
  document
    .querySelectorAll(".edit-entity[data-entity-type='preco-faixa']")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        window.Administration.openPrecoFaixaModal(id);
      });
    });

  document
    .querySelectorAll(".delete-entity[data-entity-type='preco-faixa']")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        window.Administration.deletePrecoFaixa(id);
      });
    });

  document
    .querySelectorAll(".reactivate-entity[data-entity-type='preco-faixa']")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        window.Administration.reactivatePrecoFaixa(id);
      });
    });
};

window.Administration.openPrecoFaixaModal = async function (id = null) {
  const modal = document.getElementById("precoFaixaModal");
  if (!modal) {
    window.Administration.showError("Modal de preço de faixa não encontrado");
    return;
  }

  // Carrega rotas se necessário (apenas primeira página para o select)
  if (window.Administration.state.rotas.length === 0) {
    await window.Administration.loadRotas(1, 100); // Carrega mais rotas para o select
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
    // Busca o preço no estado atual ou faz uma requisição se não estiver disponível
    let preco = window.Administration.state.precosFaixas.find(
      (p) => p.id_preco == id
    );

    if (!preco) {
      // Se o preço não estiver na página atual, busca do servidor
      try {
        preco = await window.Administration.apiRequest(`/precosFaixas/${id}`);
      } catch (error) {
        console.error("❌ Erro ao buscar preço de faixa:", error);
        window.Administration.showError(
          "Erro ao carregar dados do preço de faixa"
        );
        return;
      }
    }

    // Validação: não permite editar preço inativo
    if (preco && !preco.ativo) {
      window.Administration.showError(
        "Não é possível editar um preço de faixa inativo. Reative-o primeiro."
      );
      return;
    }

    if (preco) {
      document.getElementById("precoFaixaId").value = preco.id_preco;
      // Acessar rota e transportadora através de RotaTransportadora
      const rotaTransportadora = preco.RotaTransportadora;
      if (rotaTransportadora) {
        document.getElementById("precoFaixaRota").value =
          rotaTransportadora.Rota?.id_rota || preco.id_rota;
        document.getElementById("precoFaixaTransportadora").value =
          rotaTransportadora.Transportadora?.id_transportadora ||
          preco.id_transportadora;
      } else {
        // Fallback para compatibilidade
        document.getElementById("precoFaixaRota").value = preco.id_rota || "";
        document.getElementById("precoFaixaTransportadora").value =
          preco.id_transportadora || "";
      }
      document.getElementById("precoFaixaFaixa").value = preco.id_faixa;
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

  // Buscar ou criar rota_transportadora primeiro
  const idRota = parseInt(document.getElementById("precoFaixaRota").value);
  const idTransportadora = parseInt(
    document.getElementById("precoFaixaTransportadora").value
  );

  let idRotaTransportadora = null;

  if (idRota && idTransportadora) {
    try {
      // Buscar todas as rota_transportadoras da rota e filtrar no frontend
      const rotaTransportadorasRota = await window.Administration.apiRequest(
        `/rotaTransportadoras/rota/${idRota}`
      );

      // Encontrar a que corresponde à transportadora
      const rotaTransportadora = Array.isArray(rotaTransportadorasRota)
        ? rotaTransportadorasRota.find(
            (rt) =>
              rt.Transportadora?.id_transportadora === idTransportadora ||
              rt.id_transportadora === idTransportadora
          )
        : null;

      if (rotaTransportadora) {
        idRotaTransportadora = rotaTransportadora.id_rota_transportadora;
      } else {
        // Criar nova rota_transportadora se não existir
        try {
          const novaRotaTransportadora = await window.Administration.apiRequest(
            "/rotaTransportadoras",
            {
              method: "POST",
              body: JSON.stringify({
                id_rota: idRota,
                id_transportadora: idTransportadora,
                prazo_entrega: null,
                dias_semana: null,
                ativa: true,
              }),
            }
          );
          idRotaTransportadora = novaRotaTransportadora.id_rota_transportadora;
        } catch (createError) {
          // Se já existe, buscar novamente
          if (
            createError.message &&
            createError.message.includes("já existe")
          ) {
            const rotaTransportadorasRetry =
              await window.Administration.apiRequest(
                `/rotaTransportadoras/rota/${idRota}`
              );
            const found = Array.isArray(rotaTransportadorasRetry)
              ? rotaTransportadorasRetry.find(
                  (rt) =>
                    rt.Transportadora?.id_transportadora === idTransportadora ||
                    rt.id_transportadora === idTransportadora
                )
              : null;
            if (found) {
              idRotaTransportadora = found.id_rota_transportadora;
            }
          } else {
            throw createError;
          }
        }
      }
    } catch (error) {
      console.error("❌ Erro ao buscar/criar rota_transportadora:", error);
      window.Administration.showError(
        "Erro ao processar rota e transportadora: " +
          (error.message || "Erro desconhecido")
      );
      return;
    }
  }

  if (!idRotaTransportadora) {
    window.Administration.showError(
      "Erro: Não foi possível obter a relação rota-transportadora"
    );
    return;
  }

  const precoData = {
    id_rota_transportadora: idRotaTransportadora,
    id_faixa: parseInt(document.getElementById("precoFaixaFaixa").value),
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
        key !== "id_rota_transportadora" &&
        key !== "id_faixa"
      ) {
        precoData[key] = null;
      }
    }
  });

  try {
    if (id) {
      await window.Administration.apiRequest(`/precosFaixas/${id}`, {
        method: "PUT",
        body: JSON.stringify(precoData),
      });
    } else {
      await window.Administration.apiRequest("/precosFaixas", {
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

    // Recarrega a página atual mantendo a busca se houver
    const pagination = window.Administration.state.pagination["precosFaixas"];
    const searchTerm =
      window.Administration.state.currentSearchPrecosFaixas || null;
    if (pagination) {
      window.Administration.loadPrecosFaixas(
        pagination.currentPage,
        pagination.itemsPerPage,
        searchTerm
      );
    } else {
      window.Administration.loadPrecosFaixas(1, 50, searchTerm);
    }
  } catch (error) {
    console.error("❌ Erro ao salvar preço de faixa:", error);
    window.Administration.showError("Erro ao salvar preço de faixa");
  }
};

window.Administration.deletePrecoFaixa = async function (id) {
  try {
    const counts = {};

    // Busca o preço no estado atual ou faz uma requisição se não estiver disponível
    let preco = window.Administration.state.precosFaixas.find(
      (p) => p.id_preco == id
    );

    if (!preco) {
      // Se o preço não estiver na página atual, busca do servidor
      try {
        preco = await window.Administration.apiRequest(`/precosFaixas/${id}`);
      } catch (error) {
        console.error("❌ Erro ao buscar preço de faixa:", error);
        window.Administration.showError(
          "Erro ao carregar dados do preço de faixa"
        );
        return;
      }
    }

    let precoNome = "este preço de faixa";
    if (preco) {
      // Acessar através da nova estrutura RotaTransportadora
      const rotaTransportadora = preco.RotaTransportadora;
      const rota = rotaTransportadora?.Rota || preco.Rota;
      const faixa = preco.FaixasPeso;
      const transp = rotaTransportadora?.Transportadora || preco.Transportadora;
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
          await window.Administration.apiRequest(`/precosFaixas/${id}`, {
            method: "DELETE",
          });
          window.Administration.showSuccess(
            "Preço de faixa desativado com sucesso"
          );

          // Recarrega a página atual mantendo a busca se houver
          const pagination =
            window.Administration.state.pagination["precosFaixas"];
          const searchTerm =
            window.Administration.state.currentSearchPrecosFaixas || null;
          if (pagination) {
            window.Administration.loadPrecosFaixas(
              pagination.currentPage,
              pagination.itemsPerPage,
              searchTerm
            );
          } else {
            window.Administration.loadPrecosFaixas(1, 50, searchTerm);
          }
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

window.Administration.reactivatePrecoFaixa = async function (id) {
  try {
    // Buscar informações do preço para exibir no modal
    let preco = window.Administration.state.precosFaixas.find(
      (p) => p.id_preco == id
    );

    if (!preco) {
      try {
        preco = await window.Administration.apiRequest(`/precosFaixas/${id}`);
      } catch (error) {
        console.error("❌ Erro ao buscar preço de faixa:", error);
        window.Administration.showError(
          "Erro ao buscar dados do preço de faixa"
        );
        return;
      }
    }

    let precoNome = "este preço de faixa";
    if (preco) {
      const rotaTransportadora = preco.RotaTransportadora;
      const rota = rotaTransportadora?.Rota || preco.Rota;
      const faixa = preco.FaixasPeso;
      const transp = rotaTransportadora?.Transportadora || preco.Transportadora;
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

    const title = "Reativar Preço de Faixa";
    const message = `Tem certeza que deseja reativar ${precoNome}?`;
    const counts = {};

    window.Administration.openDeleteConfirmModal(
      title,
      message,
      counts,
      async () => {
        try {
          await window.Administration.apiRequest(`/precosFaixas/${id}`, {
            method: "PUT",
            body: JSON.stringify({ ativo: true }),
          });
          window.Administration.showSuccess(
            "Preço de faixa reativado com sucesso"
          );

          // Recarrega a página atual mantendo a busca se houver
          const pagination =
            window.Administration.state.pagination["precosFaixas"];
          const searchTerm =
            window.Administration.state.currentSearchPrecosFaixas || null;
          if (pagination) {
            window.Administration.loadPrecosFaixas(
              pagination.currentPage,
              pagination.itemsPerPage,
              searchTerm
            );
          } else {
            window.Administration.loadPrecosFaixas(1, 50, searchTerm);
          }
        } catch (error) {
          console.error("❌ Erro ao reativar preço de faixa:", error);
          window.Administration.showError(
            error.message || "Erro ao reativar preço de faixa"
          );
        }
      }
    );
  } catch (error) {
    console.error("❌ Erro ao buscar informações:", error);
    window.Administration.showError("Erro ao buscar informações");
  }
};
