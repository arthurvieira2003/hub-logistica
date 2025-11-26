window.Administration = window.Administration || {};

window.Administration.loadPrecosFaixas = async function (page = 1, limit = 50, search = null) {
  // Cancela requisição anterior se existir
  if (window.Administration.state.requestControllers.precosFaixas) {
    window.Administration.state.requestControllers.precosFaixas.abort();
  }

  // Cria novo AbortController para esta requisição
  const controller = new AbortController();
  window.Administration.state.requestControllers.precosFaixas = controller;

  // Incrementa o contador de sequência para esta requisição
  if (!window.Administration.state.requestSequence.precosFaixas) {
    window.Administration.state.requestSequence.precosFaixas = 0;
  }
  window.Administration.state.requestSequence.precosFaixas += 1;
  const currentSequence = window.Administration.state.requestSequence.precosFaixas;

  try {
    window.Administration.initPagination("precosFaixas", limit);
    
    // Armazena o termo de busca atual
    const searchTerm = search && search.trim() !== "" ? search.trim() : null;
    window.Administration.state.currentSearchPrecosFaixas = searchTerm;
    
    let url = `/precos-faixas?page=${page}&limit=${limit}`;
    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }
    
    const response = await window.Administration.apiRequest(url, {
      signal: controller.signal,
    });
    
    // Verifica se esta ainda é a requisição mais recente
    if (window.Administration.state.requestSequence.precosFaixas !== currentSequence) {
      // Esta requisição foi substituída por uma mais recente, ignora o resultado
      return;
    }

    // Verifica se a requisição foi cancelada
    if (controller.signal.aborted) {
      return;
    }
    
    if (response && response.data) {
      // Atualiza o estado de paginação com os dados do servidor
      const pagination = window.Administration.state.pagination["precosFaixas"];
      if (pagination) {
        pagination.currentPage = response.pagination.page;
        pagination.totalItems = response.pagination.total;
        pagination.totalPages = response.pagination.totalPages;
        pagination.itemsPerPage = response.pagination.limit;
      }
      
      // Armazena apenas os dados da página atual
      window.Administration.state.precosFaixas = response.data;
      // Se há busca, não usa filteredData (a busca já vem do servidor)
      if (!searchTerm) {
        window.Administration.state.filteredData.precosFaixas = null;
      }
      
      window.Administration.renderPrecosFaixas(response.data);
    }
  } catch (error) {
    // Ignora erros de requisições canceladas
    if (error.name === 'AbortError' || controller.signal.aborted) {
      return;
    }
    
    // Verifica se esta ainda é a requisição mais recente antes de mostrar erro
    if (window.Administration.state.requestSequence.precosFaixas !== currentSequence) {
      return;
    }
    
    console.error("❌ Erro ao carregar preços de faixas:", error);
    window.Administration.showError("Erro ao carregar preços de faixas");
  } finally {
    // Limpa o controller se esta ainda for a requisição atual
    if (window.Administration.state.requestSequence.precosFaixas === currentSequence) {
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
          const pagination = window.Administration.state.pagination["precosFaixas"];
          if (pagination) {
            const searchTerm = window.Administration.state.currentSearchPrecosFaixas || null;
            window.Administration.loadPrecosFaixas(pagination.currentPage, pagination.itemsPerPage, searchTerm);
          }
        }
      );
      return;
    }

    tbody.innerHTML = data
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

    window.Administration.renderPagination(
      "precosFaixasPagination",
      "precosFaixas",
      () => {
        const pagination = window.Administration.state.pagination["precosFaixas"];
        if (pagination) {
          const searchTerm = window.Administration.state.currentSearchPrecosFaixas || null;
          window.Administration.loadPrecosFaixas(pagination.currentPage, pagination.itemsPerPage, searchTerm);
        }
      }
    );
  }

  // Adiciona event listeners aos botões
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
        preco = await window.Administration.apiRequest(`/precos-faixas/${id}`);
      } catch (error) {
        console.error("❌ Erro ao buscar preço de faixa:", error);
        window.Administration.showError("Erro ao carregar dados do preço de faixa");
        return;
      }
    }
    
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
    
    // Recarrega a página atual mantendo a busca se houver
    const pagination = window.Administration.state.pagination["precosFaixas"];
    const searchTerm = window.Administration.state.currentSearchPrecosFaixas || null;
    if (pagination) {
      window.Administration.loadPrecosFaixas(pagination.currentPage, pagination.itemsPerPage, searchTerm);
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
        preco = await window.Administration.apiRequest(`/precos-faixas/${id}`);
      } catch (error) {
        console.error("❌ Erro ao buscar preço de faixa:", error);
        window.Administration.showError("Erro ao carregar dados do preço de faixa");
        return;
      }
    }
    
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
          
          // Recarrega a página atual mantendo a busca se houver
          const pagination = window.Administration.state.pagination["precosFaixas"];
          const searchTerm = window.Administration.state.currentSearchPrecosFaixas || null;
          if (pagination) {
            window.Administration.loadPrecosFaixas(pagination.currentPage, pagination.itemsPerPage, searchTerm);
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
