// Dashboard Loader - Carregador de módulos do dashboard
window.DashboardLoader = window.DashboardLoader || {};

// Função para obter o caminho base dos scripts
function getBasePath() {
  const currentScript = document.currentScript;
  if (currentScript) {
    const scriptSrc = currentScript.src;
    const scriptPath = scriptSrc.substring(0, scriptSrc.lastIndexOf("/"));
    return scriptPath;
  }

  // Fallback: assumir que estamos em /javascripts/dashboard/
  return window.location.origin + "/javascripts/dashboard";
}

// Função para carregar um script
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
    script.onload = () => {
      resolve();
    };
    script.onerror = (error) => {
      console.error(`❌ Erro ao carregar script: ${src}`, error);
      reject(error);
    };
    document.head.appendChild(script);
  });
}

// Função para carregar módulos do dashboard
async function loadDashboardModules() {
  try {
    const basePath = getBasePath();

    // Carregar módulos na ordem correta
    await loadScript(`${basePath}/ui/dashboardUI.js`);

    await loadScript(`${basePath}/data/dashboardData.js`);

    await loadScript(`${basePath}/charts/dashboardCharts.js`);

    await loadScript(`${basePath}/navigation/dashboardNavigation.js`);

    await loadScript(`${basePath}/events/dashboardEvents.js`);

    await loadScript(`${basePath}/dashboardMain.js`);

    // Inicializar dashboard após carregar todos os módulos
    if (window.DashboardMain && window.DashboardMain.initDashboard) {
      window.DashboardMain.initDashboard();
    } else {
      console.error("❌ DashboardMain não está disponível após carregamento");
    }
  } catch (error) {
    console.error("❌ Erro ao carregar módulos do dashboard:", error);
  }
}

// Função para verificar se Chart.js está disponível
async function checkChartJS() {
  if (typeof Chart === "undefined") {
    try {
      await loadScript("https://cdn.jsdelivr.net/npm/chart.js");
    } catch (error) {
      console.error("❌ Erro ao carregar Chart.js:", error);
      throw error;
    }
  }
}

// Função principal do loader
async function initDashboardLoader() {
  try {
    // Verificar se Chart.js está disponível
    await checkChartJS();

    // Carregar módulos do dashboard
    await loadDashboardModules();
  } catch (error) {
    console.error("💥 Erro crítico no Dashboard Loader:", error);

    // Mostrar notificação de erro se possível
    if (window.DashboardUI && window.DashboardUI.showNotification) {
      window.DashboardUI.showNotification(
        "Erro ao carregar dashboard. Recarregue a página.",
        "error",
        5000
      );
    }
  }
}

// Função para recarregar módulos
window.DashboardLoader.reloadModules = async function () {
  try {
    // Destruir dashboard atual
    if (window.DashboardMain && window.DashboardMain.destroyDashboard) {
      window.DashboardMain.destroyDashboard();
    }

    // Recarregar módulos
    await loadDashboardModules();
  } catch (error) {
    console.error("❌ Erro ao recarregar módulos:", error);
  }
};

// Função para verificar status dos módulos
window.DashboardLoader.checkStatus = function () {
  const status = {
    chartJS: typeof Chart !== "undefined",
    dashboardUI: typeof window.DashboardUI !== "undefined",
    dashboardData: typeof window.DashboardData !== "undefined",
    dashboardCharts: typeof window.DashboardCharts !== "undefined",
    dashboardNavigation: typeof window.DashboardNavigation !== "undefined",
    dashboardEvents: typeof window.DashboardEvents !== "undefined",
    dashboardMain: typeof window.DashboardMain !== "undefined",
  };

  return status;
};

// Inicializar loader quando o DOM estiver pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDashboardLoader);
} else {
  // DOM já está pronto
  initDashboardLoader();
}
