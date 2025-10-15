// Dashboard Main Module - Módulo principal do dashboard
window.DashboardMain = window.DashboardMain || {};

// Função principal para inicializar o dashboard
window.DashboardMain.initDashboard = function () {
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

    // Inicializar animações dos cards
    if (window.DashboardUI) {
      window.DashboardUI.animateCards();
    }

    // Inicializar gráficos
    if (window.DashboardCharts) {
      window.DashboardCharts.initCharts();
    } else {
      console.error("❌ DashboardCharts não está disponível");
    }

    // Inicializar eventos com delay para garantir que o DOM esteja renderizado
    if (window.DashboardEvents) {
      // Aguardar um pouco para garantir que o DOM esteja completamente renderizado
      setTimeout(() => {
        window.DashboardEvents.initEvents();
        window.DashboardEvents.initAdvancedEvents();
      }, 100);
    } else {
      console.error("❌ DashboardEvents não está disponível");
    }

    // Inicializar dados
    if (window.DashboardData) {
      window.DashboardData.loadDashboardData();
    } else {
      console.error("❌ DashboardData não está disponível");
    }
  } catch (error) {
    console.error("❌ Erro ao inicializar Dashboard Principal:", error);
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
    dataLoaded: window.DashboardData && window.DashboardData.mockData,
    eventsInitialized:
      window.DashboardEvents &&
      document.querySelectorAll(".period-btn").length > 0,
    uiInitialized:
      window.DashboardUI && document.querySelector(".dashboard-grid") !== null,
  };

  return status;
};
