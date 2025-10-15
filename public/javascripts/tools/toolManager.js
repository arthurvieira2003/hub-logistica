// Tool Manager Module - Gerenciador de ferramentas
window.ToolManager = window.ToolManager || {};

// Função de fallback para carregar scripts
function loadScript(src) {
  return new Promise((resolve, reject) => {
    // Verificar se o script já foi carregado
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = (error) => {
      console.error(`❌ [ToolManager] Erro ao carregar script: ${src}`, error);
      reject(error);
    };
    document.head.appendChild(script);
  });
}

// Função de fallback para carregar CSS
function loadCSS(href) {
  // Verificar se o CSS já foi carregado
  const existingCSS = document.querySelector(`link[href="${href}"]`);
  if (existingCSS) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.onerror = (error) => {
    console.error(`❌ [ToolManager] Erro ao carregar CSS: ${href}`, error);
  };
  document.head.appendChild(link);
}

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
      <!-- Conteúdo será carregado dinamicamente -->
    </div>
  `;

  // Configurar abas da frota
  window.ToolManager.setupFrotaTabs();

  // Carregar dados da frota
  await window.ToolManager.loadFrotaData();
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
  // Implementar renderização dos veículos
  // Por enquanto, apenas um placeholder
};

// Função para carregar ferramenta de rastreamento
window.ToolManager.loadRastreamentoTool = async function (contentElement) {
  // Carregar o script de rastreamento se ainda não estiver carregado
  if (!window.initRastreamento) {
    await loadScript("../javascripts/rastreamento/loader.js");

    // Aguardar um pouco para garantir que os módulos foram carregados
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Aguardar até que initRastreamento esteja disponível
    let attempts = 0;
    while (!window.initRastreamento && attempts < 50) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      attempts++;
    }

    if (!window.initRastreamento) {
      console.error(
        "❌ Timeout: initRastreamento não foi carregado após 2.5 segundos"
      );
      return;
    }
  }

  // Carregar a biblioteca Chart.js se ainda não estiver carregada
  if (typeof Chart === "undefined") {
    await loadScript("https://cdn.jsdelivr.net/npm/chart.js");
  }

  // Carregar o script do dashboard se ainda não estiver carregado
  if (!window.DashboardMain) {
    await loadScript("../javascripts/dashboard/loader.js");
  }

  // Carregar CSSs necessários
  if (!document.querySelector('link[href="../styles/rastreamento.css"]')) {
    loadCSS("../styles/rastreamento.css");
  }

  if (!document.querySelector('link[href="../styles/dashboard.css"]')) {
    loadCSS("../styles/dashboard.css");
  }

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
  if (window.initRastreamento) {
    try {
      const trackingView = document.getElementById("trackingView");
      await window.initRastreamento(trackingView);
    } catch (error) {
      console.error("❌ Erro ao executar initRastreamento:", error);
    }
  } else {
    console.error("❌ window.initRastreamento não encontrado!");
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
