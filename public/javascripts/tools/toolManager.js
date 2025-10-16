// Tool Manager Module - Gerenciador de ferramentas
window.ToolManager = window.ToolManager || {};

// Estado das ferramentas
window.ToolManager.state = {
  tools: new Map(),
  activeTool: null,
};

// Função para inicializar botões de ferramentas
window.ToolManager.initToolButtons = function () {
  const toolButtons = document.querySelectorAll(".tool-button");
  const tabList = document.getElementById("tabList");
  const contentArea = document.getElementById("contentArea");
  const welcomeScreen = document.getElementById("welcomeScreen");

  toolButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tool = button.dataset.tool;

      // Verificar se a ferramenta já está aberta
      const existingTab = document.querySelector(`.tab[data-tool="${tool}"]`);
      if (existingTab) {
        window.TabManager.activateTab(existingTab);
        return;
      }

      // Criar nova aba apenas para ferramentas internas
      const toolName = button.querySelector("span").textContent;
      const toolIcon = button.querySelector("i").cloneNode(true);

      const tab = window.TabManager.createTab(tool, toolName, toolIcon);
      tabList.appendChild(tab);

      // Criar conteúdo da ferramenta
      const toolContent = window.TabManager.createToolContent(tool);
      contentArea.appendChild(toolContent);

      // Esconder tela de boas-vindas
      welcomeScreen.style.display = "none";

      // Ativar a nova aba
      window.TabManager.activateTab(tab);

      // Carregar o conteúdo da ferramenta
      window.ToolManager.loadToolContent(tool, toolContent);
    });
  });
};

// Função para carregar conteúdo da ferramenta
window.ToolManager.loadToolContent = async function (tool, contentElement) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    contentElement.querySelector(".loader").remove();

    // Caso especial para o painel administrativo
    if (tool === "admin") {
      window.location.href = "/administration";
      return;
    }

    switch (tool) {
      case "fretes":
        await window.ToolManager.loadFretesTool(contentElement);
        break;
      case "frota":
        await window.ToolManager.loadFrotaTool(contentElement);
        break;
      case "rastreamento":
        await window.ToolManager.loadRastreamentoTool(contentElement);
        break;
      default:
        contentElement.innerHTML = `
          <div class="tool-header">
            <h2>Ferramenta não encontrada</h2>
            <p>A ferramenta solicitada não está disponível.</p>
          </div>
        `;
    }
  } catch (error) {
    console.error("❌ Erro ao carregar conteúdo da ferramenta:", error);
    contentElement.innerHTML = `
      <div class="tool-header error">
        <h2>Erro ao carregar</h2>
        <p>Não foi possível carregar o conteúdo da ferramenta.</p>
      </div>
    `;
  }
};

// Função para carregar ferramenta de fretes
window.ToolManager.loadFretesTool = async function (contentElement) {
  contentElement.innerHTML = `
    <div class="tool-header">
      <h2>Conhecimentos de Transporte Eletrônicos (CT-e)</h2>
      <p>Gerenciamento de fretes e conhecimentos de transporte.</p>
    </div>
    <div class="fretes-container">
      <div class="fretes-actions">
        <div class="fretes-search">
          <input type="text" id="fretesSearch" placeholder="Buscar por número ou cliente...">
          <button><i class="fas fa-search"></i></button>
        </div>
      </div>
      <div class="fretes-list" id="fretesList">
        <div class="loader">
          <i class="fas fa-spinner fa-spin"></i> Carregando conhecimentos de transporte...
        </div>
      </div>
      <div class="pagination" id="fretesPagination">
        <!-- Paginação será adicionada dinamicamente -->
      </div>
    </div>
  `;

  // Carregar dados de fretes
  await window.ToolManager.loadFretesData();
};

// Função para carregar dados de fretes
window.ToolManager.loadFretesData = async function () {
  try {
    const response = await fetch("http://localhost:4010/cte");
    if (!response.ok) {
      throw new Error("Erro ao buscar dados de CT-e");
    }
    const data = await response.json();

    window.ToolManager.renderFretesItems(data);
    window.ToolManager.setupFretesSearch();
  } catch (error) {
    console.error("❌ Erro ao carregar dados de fretes:", error);
    document.getElementById("fretesList").innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Erro ao carregar os dados. Verifique se o servidor está online.</p>
      </div>
    `;
  }
};

// Função para renderizar itens de fretes
window.ToolManager.renderFretesItems = function (items) {
  const fretesListElement = document.getElementById("fretesList");

  if (items.length === 0) {
    fretesListElement.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>Nenhum conhecimento de transporte encontrado.</p>
      </div>
    `;
    return;
  }

  let html = `
    <div class="fretes-table-container">
      <table class="fretes-table">
        <thead>
          <tr>
            <th>Número</th>
            <th>Cliente</th>
            <th>Data</th>
            <th>Valor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
  `;

  items.forEach((item) => {
    // Extrair a data e formatá-la
    const dateObj = new Date(item.DateAdd);
    const formattedDate = dateObj.toLocaleDateString("pt-BR");

    // Formatar o valor
    const formattedValue = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(item.DocTotal);

    html += `
      <tr data-serial="${item.Serial}">
        <td class="frete-serial">
          <i class="fas fa-file-invoice"></i>
          <span>${item.Serial}</span>
        </td>
        <td class="frete-customer">${item.CardName}</td>
        <td class="frete-date">${formattedDate}</td>
        <td class="frete-value">${formattedValue}</td>
        <td class="frete-actions">
          <button class="btn-view-frete" data-serial="${item.Serial}" title="Visualizar">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn-download-xml" data-serial="${item.Serial}" title="Baixar XML">
            <i class="fas fa-download"></i>
          </button>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  fretesListElement.innerHTML = html;
  window.ToolManager.setupFretesButtons();
};

// Função para configurar botões de fretes
window.ToolManager.setupFretesButtons = function () {
  // Botões para visualizar detalhes
  document.querySelectorAll(".btn-view-frete").forEach((button) => {
    button.addEventListener("click", (e) => {
      const serial = e.currentTarget.dataset.serial;
      window.Notifications.showNotification(
        `Visualizando CT-e ${serial}`,
        "info"
      );
    });
  });

  // Botões para download do XML
  document.querySelectorAll(".btn-download-xml").forEach((button) => {
    button.addEventListener("click", (e) => {
      const serial = e.currentTarget.dataset.serial;
      window.Notifications.showNotification(
        `Iniciando download do XML do CT-e ${serial}`,
        "success"
      );
    });
  });
};

// Função para configurar busca de fretes
window.ToolManager.setupFretesSearch = function () {
  const searchInput = document.getElementById("fretesSearch");
  let searchTimeout;

  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const searchTerm = e.target.value.toLowerCase();
      window.ToolManager.filterFretesItems(searchTerm);
    }, 300);
  });
};

// Função para filtrar itens de fretes
window.ToolManager.filterFretesItems = function (searchTerm) {
  // Esta função seria implementada com os dados carregados
  // Por enquanto, apenas um placeholder
};

// Função para carregar ferramenta de frota
window.ToolManager.loadFrotaTool = async function (contentElement) {
  contentElement.innerHTML = `
    <div class="tool-header">
      <h2>Gerenciamento de Frota</h2>
      <p>Sistema de gerenciamento de veículos da frota.</p>
    </div>
    <div class="frota-tabs">
      <button class="frota-tab-button active" data-tab="veiculos">
        <i class="fas fa-car"></i> Veículos
      </button>
      <button class="frota-tab-button" data-tab="manutencoes">
        <i class="fas fa-tools"></i> Manutenções
      </button>
    </div>
    <div class="frota-container">
      <!-- Aba de Veículos -->
      <div class="frota-tab-content active" id="veiculosTab">
        <div class="frota-actions">
          <button class="btn-primary frota-add-btn">
            <i class="fas fa-plus"></i> Adicionar Veículo
          </button>
          <div class="frota-search">
            <input type="text" id="frotaSearch" placeholder="Buscar veículo por placa ou modelo...">
            <button><i class="fas fa-search"></i></button>
          </div>
          <div class="frota-filter">
            <select id="frotaFilter">
              <option value="todos">Todos os veículos</option>
              <option value="Disponível">Disponíveis</option>
              <option value="Em uso">Em uso</option>
              <option value="Manutenção">Em manutenção</option>
            </select>
          </div>
        </div>
        <div class="frota-list" id="frotaList">
          <div class="loader">
            <i class="fas fa-spinner fa-spin"></i> Carregando veículos...
          </div>
        </div>
        <div class="pagination" id="frotaPagination">
          <!-- Paginação será adicionada dinamicamente -->
        </div>
      </div>
      
      <!-- Aba de Manutenções -->
      <div class="frota-tab-content" id="manutencoesTab">
        <div class="frota-actions">
          <button class="btn-primary frota-add-manutencao-btn">
            <i class="fas fa-plus"></i> Registrar Manutenção
          </button>
          <div class="frota-search">
            <input type="text" id="manutencaoSearch" placeholder="Buscar por placa ou serviço...">
            <button><i class="fas fa-search"></i></button>
          </div>
          <div class="frota-filter">
            <select id="manutencaoFilter">
              <option value="todos">Todos os veículos</option>
            </select>
          </div>
        </div>
        <div class="manutencao-list" id="manutencaoList">
          <div class="loader">
            <i class="fas fa-spinner fa-spin"></i> Carregando manutenções...
          </div>
        </div>
        <div class="pagination" id="manutencaoPagination">
          <!-- Paginação será adicionada dinamicamente -->
        </div>
      </div>
    </div>
  `;

  // Configurar abas da frota
  window.ToolManager.setupFrotaTabs();

  // Configurar busca e filtros
  window.ToolManager.setupFrotaSearch();
  window.ToolManager.setupFrotaFilters();
  window.ToolManager.setupManutencoesSearch();
  window.ToolManager.setupManutencoesFilters();

  // Carregar dados da frota e manutenções
  await window.ToolManager.loadFrotaData();
  await window.ToolManager.loadManutencoesData();
};

// Função para configurar abas da frota
window.ToolManager.setupFrotaTabs = function () {
  const tabButtons = document.querySelectorAll(".frota-tab-button");
  const tabContents = document.querySelectorAll(".frota-tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.dataset.tab;

      // Desativar todas as abas
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Ativar a aba selecionada
      button.classList.add("active");
      document.getElementById(`${tabName}Tab`).classList.add("active");
    });
  });
};

// Função para carregar dados da frota
window.ToolManager.loadFrotaData = async function () {
  try {
    const response = await fetch("http://localhost:4010/frota");
    if (!response.ok) {
      throw new Error("Falha ao carregar dados da frota");
    }

    const veiculos = await response.json();
    window.ToolManager.renderFrotaItems(veiculos);
  } catch (error) {
    console.error("❌ Erro ao carregar dados da frota:", error);
    // Implementar tratamento de erro
  }
};

// Função para renderizar itens da frota
window.ToolManager.renderFrotaItems = function (veiculos) {
  const frotaList = document.getElementById("frotaList");
  if (!frotaList) {
    console.error("❌ Elemento frotaList não encontrado");
    return;
  }

  // Filtrar veículos para remover os desativados
  const veiculosAtivos = veiculos.filter(
    (veiculo) => veiculo.situacaoativo !== "Desativado"
  );

  if (veiculosAtivos.length === 0) {
    frotaList.innerHTML =
      '<div class="empty-state">Nenhum veículo ativo encontrado.</div>';
    return;
  }

  // Limpar lista atual
  frotaList.innerHTML = "";

  // Criar os cards para cada veículo
  veiculosAtivos.forEach((veiculo) => {
    const card = document.createElement("div");
    card.className = "frota-card";
    card.dataset.placa = veiculo.idobject;
    card.dataset.situacao = veiculo.situacaoativo;

    let statusClass = "disponivel";
    if (veiculo.situacaoativo === "Em uso") {
      statusClass = "em_uso";
    } else if (veiculo.situacaoativo === "Manutenção") {
      statusClass = "manutencao";
    }

    card.innerHTML = `
      <div class="frota-card-header">
        <h3>${veiculo.idobject}</h3>
        <span class="status-badge ${statusClass}">${
      veiculo.situacaoativo
    }</span>
      </div>
      <div class="frota-card-body">
        <div class="vehicle-info">
          <p><strong>Modelo:</strong> ${veiculo.nmobject}</p>
          <p><strong>Tipo:</strong> ${veiculo.nmobjecttype}</p>
          <p><strong>Fabricante:</strong> ${
            veiculo.nmcompany || "Não informado"
          }</p>
          <p><strong>Local:</strong> ${veiculo.nmsite}</p>
        </div>
      </div>
      <div class="frota-card-footer">
        <button class="btn-outline btn-edit" data-placa="${veiculo.idobject}">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button class="btn-outline btn-history" data-placa="${
          veiculo.idobject
        }">
          <i class="fas fa-history"></i> Histórico
        </button>
        ${
          veiculo.situacaoativo === "Manutenção"
            ? `<button class="btn-outline btn-maintenance-complete" data-placa="${veiculo.idobject}">
               <i class="fas fa-check"></i> Finalizar manutenção
             </button>`
            : `<button class="btn-outline btn-maintenance" data-placa="${veiculo.idobject}">
               <i class="fas fa-tools"></i> Manutenção
             </button>`
        }
      </div>
    `;

    frotaList.appendChild(card);
  });

  // Configurar os botões de ação
  window.ToolManager.setupFrotaButtons();
};

// Função para carregar dados de manutenções
window.ToolManager.loadManutencoesData = async function () {
  try {
    const response = await fetch("http://localhost:4010/frota/manutencoes");
    if (!response.ok) {
      throw new Error("Falha ao carregar dados de manutenções");
    }

    const manutencoes = await response.json();

    // Armazenar dados globalmente para uso em filtros
    window.ToolManager.manutencoesData = manutencoes;

    // Processar e renderizar manutenções
    window.ToolManager.processManutencoesData(manutencoes);
  } catch (error) {
    console.error("❌ Erro ao carregar dados de manutenções:", error);
    const manutencaoList = document.getElementById("manutencaoList");
    if (manutencaoList) {
      manutencaoList.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Falha ao carregar dados de manutenções. Tente novamente mais tarde.</p>
          <button class="retry-button" id="retryLoadManutencoes">Tentar novamente</button>
        </div>
      `;

      document
        .getElementById("retryLoadManutencoes")
        .addEventListener("click", () => {
          window.ToolManager.loadManutencoesData();
        });
    }
  }
};

// Função para processar dados de manutenções
window.ToolManager.processManutencoesData = function (manutencoes) {
  const manutencaoList = document.getElementById("manutencaoList");
  if (!manutencaoList) {
    console.error("❌ Elemento manutencaoList não encontrado");
    return;
  }

  if (manutencoes.length === 0) {
    manutencaoList.innerHTML =
      '<div class="empty-state">Nenhuma manutenção encontrada.</div>';
    return;
  }

  // Agrupar manutenções por veículo e data
  const grupamentoManutencoes = {};

  manutencoes.forEach((manutencao) => {
    const placa = manutencao.idobject;
    const data = manutencao.dtcheckin;

    // Criar chave combinada de placa e data
    const chave = `${placa}-${data}`;

    if (!grupamentoManutencoes[chave]) {
      grupamentoManutencoes[chave] = {
        placa,
        modelo: manutencao.nmobject,
        local: manutencao.nmsite,
        data,
        status: manutencao.situacaoativo,
        responsavel: manutencao.idcommercial,
        observacao: manutencao.dsobservation,
        servicos: [],
      };
    }

    // Adicionar o serviço ao grupo
    grupamentoManutencoes[chave].servicos.push({
      descricao: manutencao.nmcostvariable,
      origem: manutencao.origemcusto,
      valor: manutencao.vlrealcost,
    });
  });

  // Agrupar por veículo para exibição
  const manutencoesVeiculos = {};

  // Converter grupos para array de manutenções
  Object.values(grupamentoManutencoes).forEach((manutencao) => {
    const placa = manutencao.placa;

    if (!manutencoesVeiculos[placa]) {
      manutencoesVeiculos[placa] = {
        placa,
        modelo: manutencao.modelo,
        local: manutencao.local,
        status: manutencao.status,
        manutencoes: [],
      };
    }

    manutencoesVeiculos[placa].manutencoes.push(manutencao);
  });

  // Armazenar dados processados
  window.ToolManager.manutencoesAgrupadas = Object.values(manutencoesVeiculos);

  // Renderizar manutenções
  window.ToolManager.renderManutencoesItems(
    window.ToolManager.manutencoesAgrupadas
  );

  // Atualizar filtro de placas
  window.ToolManager.updateManutencoesFilter();
};

// Função para renderizar itens de manutenções
window.ToolManager.renderManutencoesItems = function (items) {
  const manutencaoList = document.getElementById("manutencaoList");
  if (!manutencaoList) {
    console.error("❌ Elemento manutencaoList não encontrado");
    return;
  }

  if (items.length === 0) {
    manutencaoList.innerHTML =
      '<div class="empty-state">Nenhuma manutenção encontrada com os filtros aplicados.</div>';
    return;
  }

  // Limpar lista atual
  manutencaoList.innerHTML = "";

  // Criar os cards para cada veículo
  items.forEach((veiculo) => {
    const card = document.createElement("div");
    card.className = "manutencao-veiculo-card";
    card.dataset.placa = veiculo.placa;

    let statusClass = "disponivel";
    if (veiculo.status === "Em uso") {
      statusClass = "em_uso";
    } else if (veiculo.status === "Manutenção") {
      statusClass = "manutencao";
    }

    // Ordenar manutenções por data - mais recentes primeiro
    const manutencoes = veiculo.manutencoes.sort((a, b) => {
      return new Date(b.data) - new Date(a.data);
    });

    // Contar total de serviços em todas as manutenções
    const totalServicos = manutencoes.reduce((total, manutencao) => {
      return total + manutencao.servicos.length;
    }, 0);

    // Obter a data da última manutenção
    const ultimaManutencao = manutencoes[0];
    const dataUltimaManutencao = new Date(
      ultimaManutencao.data
    ).toLocaleDateString("pt-BR");

    // Obter serviços da última manutenção para preview
    const servicosPreview = ultimaManutencao.servicos
      .map((s) => s.descricao)
      .slice(0, 2);
    const temMaisServicos = ultimaManutencao.servicos.length > 2;

    card.innerHTML = `
      <div class="manutencao-veiculo-header">
        <div class="manutencao-veiculo-info">
          <h3>${veiculo.placa}</h3>
          <p class="veiculo-modelo">${veiculo.modelo}</p>
        </div>
        <span class="status-badge ${statusClass}">${veiculo.status}</span>
      </div>
      <div class="manutencao-veiculo-body">
        <div class="manutencao-veiculo-stats">
          <div class="manutencao-stat">
            <span class="stat-value">${manutencoes.length}</span>
            <span class="stat-label">Manutenções</span>
          </div>
          <div class="manutencao-stat">
            <span class="stat-value">${totalServicos}</span>
            <span class="stat-label">Serviços</span>
          </div>
          <div class="manutencao-stat">
            <span class="stat-value">${dataUltimaManutencao}</span>
            <span class="stat-label">Última manutenção</span>
          </div>
        </div>
        <div class="manutencao-veiculo-preview">
          <h4>Últimos serviços:</h4>
          <ul class="servicos-preview">
            ${servicosPreview.map((servico) => `<li>${servico}</li>`).join("")}
            ${
              temMaisServicos
                ? `<li class="mais-servicos">+ ${
                    ultimaManutencao.servicos.length - 2
                  } mais</li>`
                : ""
            }
          </ul>
        </div>
      </div>
      <div class="manutencao-veiculo-footer">
        <button class="btn-outline btn-view-history" data-placa="${
          veiculo.placa
        }">
          <i class="fas fa-history"></i> Ver Histórico Completo
        </button>
      </div>
    `;

    manutencaoList.appendChild(card);
  });

  // Configurar botões de ação
  window.ToolManager.setupManutencoesButtons();
};

// Função para atualizar filtro de placas
window.ToolManager.updateManutencoesFilter = function () {
  const filterSelect = document.getElementById("manutencaoFilter");
  if (!filterSelect || !window.ToolManager.manutencoesAgrupadas) return;

  // Limpar opções existentes (exceto "Todos os veículos")
  filterSelect.innerHTML = '<option value="todos">Todos os veículos</option>';

  // Adicionar opções para cada veículo
  window.ToolManager.manutencoesAgrupadas.forEach((veiculo) => {
    const option = document.createElement("option");
    option.value = veiculo.placa;
    option.textContent = veiculo.placa;
    filterSelect.appendChild(option);
  });
};

// Função para configurar busca da frota
window.ToolManager.setupFrotaSearch = function () {
  const searchInput = document.getElementById("frotaSearch");
  if (!searchInput) return;

  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const searchTerm = e.target.value.toLowerCase();
      window.ToolManager.filterFrotaItems(searchTerm);
    }, 300);
  });
};

// Função para configurar filtros da frota
window.ToolManager.setupFrotaFilters = function () {
  const filterSelect = document.getElementById("frotaFilter");
  if (!filterSelect) return;

  filterSelect.addEventListener("change", (e) => {
    const statusFilter = e.target.value;
    window.ToolManager.filterFrotaItems(null, statusFilter);
  });
};

// Função para filtrar itens da frota
window.ToolManager.filterFrotaItems = function (
  searchTerm = "",
  statusFilter = "todos"
) {
  const frotaList = document.getElementById("frotaList");
  if (!frotaList) return;

  const cards = frotaList.querySelectorAll(".frota-card");

  cards.forEach((card) => {
    const placa = card.dataset.placa.toLowerCase();
    const situacao = card.dataset.situacao;

    const matchSearch = !searchTerm || placa.includes(searchTerm);
    const matchStatus = statusFilter === "todos" || situacao === statusFilter;

    if (matchSearch && matchStatus) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
};

// Função para configurar botões de ação da frota
window.ToolManager.setupFrotaButtons = function () {
  // Botões de editar
  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.Notifications.showNotification(
        `Editando veículo ${btn.dataset.placa}`,
        "info"
      );
    });
  });

  // Botões de histórico
  document.querySelectorAll(".btn-history").forEach((btn) => {
    btn.addEventListener("click", () => {
      // Alternar para a aba de manutenções e filtrar pelo veículo
      const manutencoesTab = document.querySelector(
        '.frota-tab-button[data-tab="manutencoes"]'
      );
      if (manutencoesTab) {
        manutencoesTab.click();
        const manutencaoFilter = document.getElementById("manutencaoFilter");
        if (manutencaoFilter) {
          manutencaoFilter.value = btn.dataset.placa;
          manutencaoFilter.dispatchEvent(new Event("change"));
        }
      }
    });
  });

  // Botões de manutenção
  document.querySelectorAll(".btn-maintenance").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.Notifications.showNotification(
        `Iniciando manutenção do veículo ${btn.dataset.placa}`,
        "info"
      );
    });
  });

  // Botões de finalizar manutenção
  document.querySelectorAll(".btn-maintenance-complete").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.Notifications.showNotification(
        `Finalizando manutenção do veículo ${btn.dataset.placa}`,
        "success"
      );
    });
  });
};

// Função para configurar busca de manutenções
window.ToolManager.setupManutencoesSearch = function () {
  const searchInput = document.getElementById("manutencaoSearch");
  if (!searchInput) return;

  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const searchTerm = e.target.value.toLowerCase();
      window.ToolManager.filterManutencoesItems(searchTerm);
    }, 300);
  });
};

// Função para configurar filtros de manutenções
window.ToolManager.setupManutencoesFilters = function () {
  const filterSelect = document.getElementById("manutencaoFilter");
  if (!filterSelect) return;

  filterSelect.addEventListener("change", (e) => {
    const placaFilter = e.target.value;
    window.ToolManager.filterManutencoesItems(null, placaFilter);
  });
};

// Função para filtrar itens de manutenções
window.ToolManager.filterManutencoesItems = function (
  searchTerm = "",
  placaFilter = "todos"
) {
  if (!window.ToolManager.manutencoesAgrupadas) return;

  // Aplicar filtros
  const filteredManutencoes = window.ToolManager.manutencoesAgrupadas.filter(
    (veiculo) => {
      // Filtro de placa
      const matchPlaca =
        placaFilter === "todos" || veiculo.placa === placaFilter;

      // Filtro de busca
      const placa = veiculo.placa.toLowerCase();
      const modelo = veiculo.modelo.toLowerCase();

      // Verificar se algum serviço corresponde à busca
      const servicosMatch = veiculo.manutencoes.some((manutencao) => {
        return manutencao.servicos.some((servico) => {
          return servico.descricao.toLowerCase().includes(searchTerm);
        });
      });

      const matchSearch =
        searchTerm === "" ||
        placa.includes(searchTerm) ||
        modelo.includes(searchTerm) ||
        servicosMatch;

      return matchPlaca && matchSearch;
    }
  );

  // Renderizar resultados filtrados
  window.ToolManager.renderManutencoesItems(filteredManutencoes);
};

// Função para configurar botões de manutenções
window.ToolManager.setupManutencoesButtons = function () {
  // Botões de ver histórico
  document.querySelectorAll(".btn-view-history").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.Notifications.showNotification(
        `Visualizando histórico completo do veículo ${btn.dataset.placa}`,
        "info"
      );
    });
  });
};

// Função para carregar ferramenta de rastreamento
window.ToolManager.loadRastreamentoTool = async function (contentElement) {
  // Carregar módulos de rastreamento usando o ModuleLoader
  if (!window.RastreamentoMain) {
    try {
      await window.ModuleLoader.loadRastreamentoPage();
    } catch (error) {
      console.error(
        "❌ [ToolManager] Erro ao carregar módulos de rastreamento:",
        error
      );
      return;
    }
  }

  // Chart.js já está carregado globalmente no index.html
  // CSSs são carregados pelo ModuleLoader quando necessário

  // Criar a estrutura HTML para o rastreamento
  contentElement.innerHTML = `
    <!-- Tracking View -->
    <div id="trackingView" class="tracking-container">
      <div class="rastreamento-header" style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
        <div class="dashboard-title-row" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <h2 class="dashboard-title" style="font-size: 1.75rem; font-weight: 600; margin: 0;">Rastreamento de Notas</h2>
        </div>
      </div>
      <div id="rastreamentoContainer"></div>
    </div>
  `;

  // Inicializar o rastreamento
  if (window.RastreamentoMain && window.RastreamentoMain.initRastreamento) {
    try {
      const trackingView = document.getElementById("trackingView");
      await window.RastreamentoMain.initRastreamento(trackingView);
    } catch (error) {
      console.error(
        "❌ Erro ao executar RastreamentoMain.initRastreamento:",
        error
      );
    }
  } else {
    console.error(
      "❌ window.RastreamentoMain.initRastreamento não encontrado!"
    );
  }

  // Configurar eventos de rastreamento
  window.ToolManager.setupRastreamentoEvents();
};

// Função para configurar eventos de rastreamento
window.ToolManager.setupRastreamentoEvents = function () {
  setTimeout(() => {
    // Selecionar todos os botões com onclick="showTracking()"
    document
      .querySelectorAll('[onclick="showTracking()"]')
      .forEach((button) => {
        // Remover o atributo onclick para evitar duplicação
        button.removeAttribute("onclick");

        // Adicionar evento de clique
        button.addEventListener("click", () => {
          if (
            window.DashboardNavigation &&
            window.DashboardNavigation.showTracking
          ) {
            window.DashboardNavigation.showTracking();
          } else if (window.showTracking) {
            window.showTracking();
          }
        });
      });

    // Selecionar todos os botões com a classe view-tracking-button
    document.querySelectorAll(".view-tracking-button").forEach((button) => {
      if (!button.getAttribute("data-event-attached")) {
        // Marcar o botão como tendo um evento já anexado
        button.setAttribute("data-event-attached", "true");

        // Adicionar evento de clique
        button.addEventListener("click", () => {
          if (
            window.DashboardNavigation &&
            window.DashboardNavigation.showTracking
          ) {
            window.DashboardNavigation.showTracking();
          } else if (window.showTracking) {
            window.showTracking();
          }
        });
      }
    });
  }, 300);
};
