// Tab Manager Module - Gerenciamento de abas
window.TabManager = window.TabManager || {};

// Estado das abas
window.TabManager.state = {
  tabs: new Map(),
  activeTab: null,
  tabCounter: 0,
};

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
      console.error(`❌ [TabManager] Erro ao carregar script: ${src}`, error);
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
    console.error(`❌ [TabManager] Erro ao carregar CSS: ${href}`, error);
  };
  document.head.appendChild(link);
}

// Estado das abas
window.TabManager.state = {
  tabs: new Map(),
  activeTab: null,
  tabCounter: 0,
};

// Função para criar uma nova aba
window.TabManager.createTab = function (tool, name, icon) {
  const tab = document.createElement("div");
  tab.className = "tab";
  tab.dataset.tool = tool;
  tab.dataset.tabId = `tab-${++window.TabManager.state.tabCounter}`;

  // Clonar o ícone e ajustar suas classes
  const iconClone = icon.cloneNode(true);
  if (iconClone.tagName === "IMG") {
    iconClone.className = "tool-icon";
  }

  tab.appendChild(iconClone);
  tab.appendChild(document.createTextNode(name));

  const closeButton = document.createElement("div");
  closeButton.className = "close-tab";
  closeButton.innerHTML = "&times;";
  closeButton.addEventListener("click", (e) => {
    e.stopPropagation();
    window.TabManager.closeTab(tab);
  });

  tab.appendChild(closeButton);

  tab.addEventListener("click", () => {
    window.TabManager.activateTab(tab);
  });

  // Armazenar informações da aba
  window.TabManager.state.tabs.set(tab.dataset.tabId, {
    element: tab,
    tool: tool,
    name: name,
    icon: icon,
  });

  return tab;
};

// Função para ativar uma aba
window.TabManager.activateTab = function (tab) {
  // Desativar todas as abas e conteúdos
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".tool-content")
    .forEach((c) => c.classList.remove("active"));

  // Ativar a aba selecionada e seu conteúdo
  tab.classList.add("active");
  const tool = tab.dataset.tool;
  const content = document.querySelector(`.tool-content[data-tool="${tool}"]`);

  if (content) {
    content.classList.add("active");
  } else {
    console.error("❌ Conteúdo não encontrado para tool:", tool);
  }

  // Inicializar dashboard se for a aba do dashboard
  if (tool === "dashboard") {
    window.TabManager.handleDashboardActivation();
  }

  // Esconder tela de boas-vindas quando uma aba é ativada
  const welcomeScreen = document.getElementById("welcomeScreen");
  if (welcomeScreen) {
    welcomeScreen.style.display = "none";
  }

  // Atualizar botões da barra lateral
  document.querySelectorAll(".tool-button").forEach((button) => {
    button.classList.remove("active");
    if (button.dataset.tool === tool) {
      button.classList.add("active");
    }
  });

  window.TabManager.state.activeTab = tab;
};

// Função para fechar uma aba
window.TabManager.closeTab = function (tab) {
  const tool = tab.dataset.tool;

  // Não permitir fechar a aba do dashboard
  if (tool === "dashboard") {
    return;
  }

  const content = document.querySelector(`.tool-content[data-tool="${tool}"]`);

  // Se esta é a aba ativa, ativar outra aba
  if (tab.classList.contains("active")) {
    const nextTab = tab.nextElementSibling || tab.previousElementSibling;
    if (nextTab) {
      window.TabManager.activateTab(nextTab);
    } else {
      // Se não houver mais abas, mostrar a tela de boas-vindas
      const welcomeScreen = document.getElementById("welcomeScreen");
      if (welcomeScreen) {
        welcomeScreen.style.display = "flex";
      }
      document.querySelectorAll(".tool-button").forEach((button) => {
        button.classList.remove("active");
      });
    }
  }

  // Remover a aba e seu conteúdo
  tab.remove();
  if (content) {
    content.remove();
  }

  // Remover do estado
  window.TabManager.state.tabs.delete(tab.dataset.tabId);
};

// Função para criar conteúdo de ferramenta
window.TabManager.createToolContent = function (tool) {
  const content = document.createElement("div");
  content.className = "tool-content";
  content.dataset.tool = tool;

  // Adicionar um loader
  const loader = document.createElement("div");
  loader.className = "loader";
  loader.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
  content.appendChild(loader);

  return content;
};

// Função para lidar com ativação do dashboard
window.TabManager.handleDashboardActivation = function () {
  // Carregar CSS do dashboard se ainda não estiver carregado
  if (!document.querySelector('link[href="../styles/dashboard.css"]')) {
    loadCSS("/styles/dashboard.css");
  }

  const dashboardView = document.getElementById("dashboardView");
  if (dashboardView) {
    if (!dashboardView.dataset.initialized) {
      // Aguardar um pouco para o CSS ser aplicado
      setTimeout(() => {
        if (window.DashboardMain && window.DashboardMain.initDashboard) {
          window.DashboardMain.initDashboard();
          dashboardView.dataset.initialized = "true";
        } else {
          console.error("❌ DashboardMain não está disponível");
        }
      }, 100);
    }
  } else {
    console.error("❌ dashboardView não encontrado durante ativação");
  }
};

// Função para criar aba do dashboard
window.TabManager.createDashboardTab = function () {
  const tabList = document.getElementById("tabList");
  if (!tabList) {
    console.error("❌ tabList não encontrado");
    return;
  }

  // Verificar se a aba dashboard já existe
  const existingDashboardTab = document.querySelector(
    '.tab[data-tool="dashboard"]'
  );
  if (existingDashboardTab) {
    return;
  }

  // Carregar CSS do dashboard se ainda não estiver carregado
  if (!document.querySelector('link[href="../styles/dashboard.css"]')) {
    loadCSS("/styles/dashboard.css");
  }

  // Carregar script do dashboard se ainda não estiver carregado
  if (!window.DashboardMain) {
    window.TabManager.loadDashboardScripts();
    return;
  }

  // Se chegou até aqui, o script já está carregado
  window.TabManager.renderDashboardTab();
};

// Função para carregar scripts do dashboard
window.TabManager.loadDashboardScripts = function () {
  // Carregar Chart.js primeiro
  if (typeof Chart === "undefined") {
    loadScript("https://cdn.jsdelivr.net/npm/chart.js")
      .then(() => {
        // Agora carregar dashboard loader
        return loadScript("/javascripts/dashboard/loader.js");
      })
      .then(() => {
        // Recriar a aba após o script ser carregado
        window.TabManager.renderDashboardTab();
      })
      .catch((error) => {
        console.error("❌ Erro ao carregar scripts:", error);
      });
  } else {
    // Chart.js já está carregado, carregar apenas dashboard loader
    loadScript("/javascripts/dashboard/loader.js")
      .then(() => {
        // Recriar a aba após o script ser carregado
        window.TabManager.renderDashboardTab();
      })
      .catch((error) => {
        console.error("❌ Erro ao carregar dashboard loader:", error);
      });
  }
};

// Função para renderizar aba do dashboard
window.TabManager.renderDashboardTab = function () {
  const tabList = document.getElementById("tabList");
  if (!tabList) {
    console.error("❌ tabList não encontrado em renderDashboardTab");
    return;
  }

  const dashboardTab = document.createElement("div");
  dashboardTab.className = "tab active";
  dashboardTab.dataset.tool = "dashboard";
  dashboardTab.innerHTML = `
    <i class="fas fa-chart-line"></i>
    <span>Dashboard</span>
    <div class="close-tab" style="display: none;">
      <i class="fas fa-times"></i>
    </div>
  `;

  // Adicionar evento de clique
  dashboardTab.addEventListener("click", () => {
    window.TabManager.activateTab(dashboardTab);
    if (
      window.DashboardNavigation &&
      window.DashboardNavigation.showDashboard
    ) {
      window.DashboardNavigation.showDashboard();
    }
  });

  // Adicionar como primeira aba
  tabList.insertBefore(dashboardTab, tabList.firstChild);

  // Ativar a aba automaticamente após um pequeno delay
  setTimeout(() => {
    // Garantir que a tela de boas-vindas esteja escondida
    const welcomeScreen = document.getElementById("welcomeScreen");
    if (welcomeScreen) {
      welcomeScreen.style.display = "none";
    }

    window.TabManager.activateTab(dashboardTab);
  }, 200);

  // Criar conteúdo do dashboard
  window.TabManager.createDashboardContent();
};

// Função para criar conteúdo do dashboard
window.TabManager.createDashboardContent = function () {
  const dashboardContent = document.createElement("div");
  dashboardContent.className = "tool-content active";
  dashboardContent.dataset.tool = "dashboard";

  // Adicionar estilos inline temporários para debug
  dashboardContent.style.cssText = `
    position: absolute;
    top: 1rem;
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    background-color: var(--surface-color);
    border: 1px solid var(--border-color);
    border-radius: 0.75rem;
    margin: 0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    transition: opacity 0.3s ease, visibility 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    display: flex;
    flex-direction: column;
    overflow: auto;
  `;

  dashboardContent.innerHTML = window.TabManager.getDashboardHTML();

  // Adicionar conteúdo à área de conteúdo
  const contentArea = document.getElementById("contentArea");
  if (contentArea) {
    contentArea.appendChild(dashboardContent);

    // Verificar se o dashboardView foi criado
    const dashboardView = document.getElementById("dashboardView");
    if (dashboardView) {
      // Verificar se há conteúdo dentro do dashboardView
      const dashboardGrid = dashboardView.querySelector(".dashboard-grid");
      if (dashboardGrid) {
      } else {
        console.error("❌ dashboard-grid não encontrado");
      }
    } else {
      console.error("❌ dashboardView não encontrado no DOM");
    }
  } else {
    console.error("❌ contentArea não encontrado");
  }
};

// Função para obter HTML do dashboard
window.TabManager.getDashboardHTML = function () {
  return `
    <!-- Dashboard View -->
    <div id="dashboardView" class="dashboard-container active">
      <div class="dashboard-header">
        <div class="dashboard-title-row">
          <h2 class="dashboard-title">Dashboard de Logística</h2>
        </div>
        <p class="dashboard-subtitle">
          Visão geral das operações de entrega e rastreamento
        </p>

        <div class="dashboard-actions">
          <div class="dashboard-filters">
            <div class="period-selector">
              <button class="period-btn active" data-period="week">Semana</button>
              <button class="period-btn" data-period="month">Mês</button>
              <button class="period-btn" data-period="year">Ano</button>
            </div>

            <div class="dashboard-date">
              <i class="fas fa-calendar-alt"></i>
              <span>01/06/2023 - 30/06/2023</span>
            </div>
          </div>

          <div class="dashboard-controls">
            <button class="dashboard-refresh">
              <i class="fas fa-sync-alt"></i>
              <span>Atualizar</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Grid de cards do dashboard -->
      <div class="dashboard-grid">
        <!-- Card de total de entregas -->
        <div class="dashboard-card card-col-2" id="totalEntregas">
          <div class="dashboard-card-header">
            <h3 class="dashboard-card-title">
              <i class="fas fa-box"></i>
              Total de Entregas
            </h3>
            <div class="dashboard-card-actions">
              <button class="card-action-button">
                <i class="fas fa-ellipsis-v"></i>
              </button>
            </div>
          </div>
          <div class="dashboard-card-content">
            <div class="stat-card-content">
              <div class="stat-value">247</div>
              <div class="stat-label">Entregas no período</div>
              <div class="stat-change positive">
                <i class="fas fa-arrow-up"></i>
                12% em relação ao período anterior
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Função para obter informações de uma aba
window.TabManager.getTabInfo = function (tabId) {
  return window.TabManager.state.tabs.get(tabId);
};

// Função para obter todas as abas
window.TabManager.getAllTabs = function () {
  return Array.from(window.TabManager.state.tabs.values());
};

// Função para obter aba ativa
window.TabManager.getActiveTab = function () {
  return window.TabManager.state.activeTab;
};
