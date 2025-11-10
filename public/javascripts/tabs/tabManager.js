// Tab Manager Module - Gerenciamento de abas
window.TabManager = window.TabManager || {};

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
  const tool = tab.dataset.tool;
  const content = document.querySelector(`.tool-content[data-tool="${tool}"]`);

  // Obter conteúdo ativo atual
  const currentActiveContent = document.querySelector(".tool-content.active");

  // Se já estamos na mesma aba, não fazer nada
  if (
    tab.classList.contains("active") &&
    content &&
    content.classList.contains("active")
  ) {
    return;
  }

  // IMPORTANTE: Esconder conteúdo ativo atual ANTES de remover active de todas as abas
  // Isso evita que o dashboard apareça brevemente durante a transição
  if (currentActiveContent && currentActiveContent !== content) {
    currentActiveContent.style.transition = "none";

    // Se for o dashboard, usar display: none imediatamente para evitar flash visual
    if (currentActiveContent.dataset.tool === "dashboard") {
      currentActiveContent.style.display = "none";
      currentActiveContent.style.opacity = "0";
      currentActiveContent.style.visibility = "hidden";
    }

    currentActiveContent.classList.remove("active");

    // Restaurar transição após um pequeno delay
    setTimeout(() => {
      currentActiveContent.style.transition = "";
      // NÃO restaurar display para dashboard - manter escondido
    }, 10);
  }

  // Desativar todas as abas DEPOIS de esconder o conteúdo
  const allTabs = document.querySelectorAll(".tab");

  allTabs.forEach((t) => {
    t.classList.remove("active");
  });

  // Ativar a aba selecionada
  tab.classList.add("active");

  // Ativar o conteúdo da nova aba
  if (content) {
    // Se for o dashboard, garantir que display não seja none
    if (content.dataset.tool === "dashboard") {
      content.style.display = "";
      content.style.opacity = "";
      content.style.visibility = "";
    }

    // Garantir que a transição esteja habilitada
    content.style.transition = "";
    content.classList.add("active");
  }

  // Desativar outros conteúdos que possam estar visíveis (sem transição)
  const allContents = document.querySelectorAll(".tool-content");
  allContents.forEach((c) => {
    if (c !== content && c.classList.contains("active")) {
      c.style.transition = "none";
      c.classList.remove("active");
      setTimeout(() => {
        c.style.transition = "";
      }, 10);
    }
    // Garantir que o dashboard seja explicitamente escondido se não for o conteúdo ativo
    if (c.dataset.tool === "dashboard" && c !== content) {
      c.style.transition = "none";
      c.style.display = "none";
      c.style.opacity = "0";
      c.style.visibility = "hidden";
      c.classList.remove("active");
      setTimeout(() => {
        c.style.transition = "";
        // Manter display: none para dashboard
      }, 10);
    }
  });

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
  const cssLink =
    document.querySelector('link[href="../styles/dashboard.css"]') ||
    document.querySelector('link[href*="dashboard.css"]');
  if (!cssLink) {
    window.ScriptLoader.loadCSS("/styles/dashboard.css");
  }

  const dashboardView = document.getElementById("dashboardView");

  if (dashboardView) {
    const isInitialized = dashboardView.dataset.initialized === "true";
    if (!isInitialized) {
      // Aguardar um pouco para o CSS ser aplicado
      setTimeout(() => {
        if (window.DashboardMain && window.DashboardMain.initDashboard) {
          window.DashboardMain.initDashboard();
          dashboardView.dataset.initialized = "true";
        } else {
          console.error("❌ [TabManager] DashboardMain não está disponível", {
            DashboardMainExists: !!window.DashboardMain,
            initDashboardExists: !!(
              window.DashboardMain && window.DashboardMain.initDashboard
            ),
          });
        }
      }, 100);
    }
  } else {
    console.error(
      "❌ [TabManager] dashboardView não encontrado durante ativação"
    );
    console.error("❌ [TabManager] Elementos disponíveis:", {
      dashboardView: !!document.getElementById("dashboardView"),
      dashboardContainer: !!document.querySelector(".dashboard-container"),
      allToolContents: Array.from(
        document.querySelectorAll(".tool-content")
      ).map((c) => ({
        tool: c.dataset.tool,
        hasActive: c.classList.contains("active"),
        innerHTML: c.innerHTML.substring(0, 100),
      })),
    });
  }
};

// Função para criar aba do dashboard
window.TabManager.createDashboardTab = function () {
  let tabList = document.getElementById("tabList");

  if (!tabList) {
    // Criar o elemento tabList se não existir
    const tabBar = document.querySelector(".tab-bar");
    if (tabBar) {
      tabList = document.createElement("div");
      tabList.className = "tab-list";
      tabList.id = "tabList";
      tabBar.appendChild(tabList);
    } else {
      return;
    }
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
    window.ScriptLoader.loadCSS("/styles/dashboard.css");
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
    window.ScriptLoader.loadScript("https://cdn.jsdelivr.net/npm/chart.js")
      .then(() => {
        // Agora carregar dashboard loader
        return window.ScriptLoader.loadScript(
          "/javascripts/dashboard/dashboardMain.js"
        );
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
    window.ScriptLoader.loadScript("/javascripts/dashboard/dashboardMain.js")
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
    console.error(
      "❌ [TabManager] tabList não encontrado em renderDashboardTab"
    );
    return;
  }

  // Verificar se já existe uma aba dashboard
  const existingDashboardTab = document.querySelector(
    '.tab[data-tool="dashboard"]'
  );
  if (existingDashboardTab) {
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
  // Verificar se já existe conteúdo do dashboard
  const existingContent = document.querySelector(
    '.tool-content[data-tool="dashboard"]'
  );
  if (existingContent) {
    return;
  }

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
      if (!dashboardGrid) {
        console.error("❌ [TabManager] dashboard-grid não encontrado");
      }
    } else {
      console.error("❌ [TabManager] dashboardView não encontrado no DOM");
    }
  } else {
    console.error("❌ [TabManager] contentArea não encontrado");
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
              <button class="period-btn" data-period="custom" id="customDateBtn">
                <i class="fas fa-calendar-alt"></i>
                Dias específicos
              </button>
            </div>

            <div class="dashboard-date" id="dashboardDateDisplay">
              <i class="fas fa-calendar-alt"></i>
              <span id="dateRangeText">Últimos 7 dias</span>
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
