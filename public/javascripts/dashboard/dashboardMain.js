// Dashboard Main Module - Módulo principal do dashboard
window.DashboardMain = window.DashboardMain || {};

// Estado para evitar execução duplicada
window.DashboardMain.state = {
  isInitialized: false,
  isInitializing: false,
};

// Função principal para inicializar o dashboard
window.DashboardMain.initDashboard = async function () {
  // Evitar execução duplicada
  if (
    window.DashboardMain.state.isInitialized ||
    window.DashboardMain.state.isInitializing
  ) {
    return;
  }

  window.DashboardMain.state.isInitializing = true;

  try {
    // Inicializar UI
    if (window.DashboardUI) {
      window.DashboardUI.initUI();
    } else {
      console.error("❌ DashboardUI não está disponível");
    }

    // Garantir que o botão de voltar ao dashboard esteja configurado
    if (window.DashboardNavigation) {
      window.DashboardNavigation.setupVoltarDashboardButton();
    } else {
      console.error("❌ DashboardNavigation não está disponível");
    }

    // Função para inicializar componentes do dashboard
    const initializeDashboardComponents = () => {
      // Inicializar animações dos cards
      if (window.DashboardUI) {
        window.DashboardUI.animateCards();
      }

      // Inicializar gráficos após a estrutura estar pronta
      if (window.DashboardCharts) {
        window.DashboardCharts.initCharts();
      } else {
        console.error("❌ DashboardCharts não está disponível");
      }

      // Inicializar eventos após estrutura estar pronta
      if (window.DashboardEvents) {
        window.DashboardEvents.initEvents();
        window.DashboardEvents.initAdvancedEvents();
      } else {
        console.error("❌ DashboardEvents não está disponível");
      }
    };

    // Verificar se a estrutura já está pronta
    const dashboardGrid = document.querySelector(".dashboard-grid");
    const expectedCards = [
      "totalEntregas",
      "entregasNoPrazo",
      "entregasAtrasadas",
      "taxaEntrega",
      "custoTotal",
      "custoMedio",
    ];
    const existingCards = Array.from(
      dashboardGrid?.querySelectorAll(".dashboard-card") || []
    ).map((card) => card.id);
    const hasAllCards = expectedCards.every((cardId) =>
      existingCards.includes(cardId)
    );

    if (dashboardGrid && hasAllCards) {
      initializeDashboardComponents();
    } else {
      // Escutar evento de estrutura pronta
      const handleDashboardReady = (event) => {
        initializeDashboardComponents();

        // Remover o listener após usar
        document.removeEventListener(
          "dashboardStructureReady",
          handleDashboardReady
        );
      };

      document.addEventListener(
        "dashboardStructureReady",
        handleDashboardReady
      );
    }

    // Inicializar display de datas para semana
    if (window.DashboardEvents && window.DashboardEvents.updateDateDisplay) {
      const today = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      window.DashboardEvents.updateDateDisplay(
        lastWeek.toISOString().split("T")[0],
        today.toISOString().split("T")[0]
      );
    }

    // Inicializar dados
    if (window.DashboardData) {
      window.DashboardData.loadDashboardData();
    } else {
      console.error("❌ DashboardData não está disponível");
    }

    window.DashboardMain.state.isInitialized = true;
    window.DashboardMain.state.isInitializing = false;
  } catch (error) {
    console.error("❌ Erro ao inicializar Dashboard Principal:", error);
    window.DashboardMain.state.isInitializing = false;
  }
};

// Função para recarregar dashboard
window.DashboardMain.reloadDashboard = function () {
  try {
    // Recarregar dados
    if (window.DashboardData) {
      const activePeriodButton = document.querySelector(".period-btn.active");
      const period = activePeriodButton
        ? activePeriodButton.dataset.period
        : "week";
      window.DashboardData.loadDashboardData(period);
    }

    // Re-animar cards
    if (window.DashboardUI) {
      window.DashboardUI.animateCards();
    }
  } catch (error) {
    console.error("❌ Erro ao recarregar dashboard:", error);
  }
};

// Função para destruir dashboard
window.DashboardMain.destroyDashboard = function () {
  try {
    // Destruir gráficos
    if (window.DashboardCharts && window.DashboardCharts.chartInstances) {
      Object.values(window.DashboardCharts.chartInstances).forEach(
        (instance) => {
          if (instance) {
            instance.destroy();
          }
        }
      );
      window.DashboardCharts.chartInstances = {};
    }

    // Remover estilos globais
    const globalStyles = document.getElementById("dashboard-global-styles");
    if (globalStyles) {
      globalStyles.remove();
    }

    // Remover notificações
    const notifications = document.querySelectorAll(".dashboard-notification");
    notifications.forEach((notification) => notification.remove());

    // Remover modais
    const modals = document.querySelectorAll(".dashboard-modal");
    modals.forEach((modal) => modal.remove());
  } catch (error) {
    console.error("❌ Erro ao destruir dashboard:", error);
  }
};

// Função para verificar se todos os módulos estão carregados
window.DashboardMain.checkModules = function () {
  const modules = [
    { name: "DashboardUI", instance: window.DashboardUI },
    { name: "DashboardData", instance: window.DashboardData },
    { name: "DashboardCharts", instance: window.DashboardCharts },
    { name: "DashboardNavigation", instance: window.DashboardNavigation },
    { name: "DashboardEvents", instance: window.DashboardEvents },
  ];

  const loadedModules = [];
  const missingModules = [];

  modules.forEach((module) => {
    if (module.instance) {
      loadedModules.push(module.name);
    } else {
      missingModules.push(module.name);
    }
  });

  if (missingModules.length > 0) {
    console.error(`❌ Módulos ausentes: ${missingModules.join(", ")}`);
    return false;
  }

  return true;
};

// Função para obter status do dashboard
window.DashboardMain.getStatus = function () {
  const status = {
    initialized: window.DashboardMain.checkModules(),
    chartsLoaded:
      window.DashboardCharts &&
      Object.keys(window.DashboardCharts.chartInstances).length > 0,
    dataLoaded: window.DashboardData && window.DashboardData.validateData,
    eventsInitialized:
      window.DashboardEvents &&
      document.querySelectorAll(".period-btn").length > 0,
    uiInitialized:
      window.DashboardUI && document.querySelector(".dashboard-grid") !== null,
  };

  return status;
};
