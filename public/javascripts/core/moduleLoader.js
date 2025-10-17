// Module Loader - Sistema de carregamento unificado
// Versão: 2025-10-16 - Unificação de todos os loaders

window.ModuleLoader = window.ModuleLoader || {};

// Estado do carregador
window.ModuleLoader.state = {
  loadedModules: new Set(),
  isLoading: false,
  moduleConfigs: new Map(),
};

// Configurações dos módulos (centralizadas)
window.ModuleLoader.configs = {
  // Configuração para módulos core (base)
  core: {
    basePath: "/javascripts",
    dependencies: [],
    modules: [
      { name: "scriptLoader", path: "/utils/scriptLoader.js", priority: 1 },
      { name: "helpers", path: "/utils/helpers.js", priority: 2 },
      { name: "notifications", path: "/ui/notifications.js", priority: 3 },
      { name: "sidebar", path: "/ui/sidebar.js", priority: 4 },
      { name: "modals", path: "/ui/modals.js", priority: 5 },
      { name: "userProfile", path: "/user/userProfile.js", priority: 6 },
      { name: "userAvatar", path: "/user/userAvatar.js", priority: 7 },
      { name: "tabManager", path: "/tabs/tabManager.js", priority: 8 },
      { name: "tabDragDrop", path: "/tabs/tabDragDrop.js", priority: 9 },
      { name: "toolManager", path: "/tools/toolManager.js", priority: 10 },
      { name: "appInitializer", path: "/core/appInitializer.js", priority: 11 },
    ],
  },

  // Configuração para módulos de autenticação
  auth: {
    basePath: "/javascripts/auth",
    dependencies: [],
    modules: [
      { name: "authCore", path: "/core/authCore.js", priority: 1 },
      { name: "authUI", path: "/ui/authUI.js", priority: 2 },
      {
        name: "authValidators",
        path: "/validators/authValidators.js",
        priority: 3,
      },
      { name: "authCheckMain", path: "/core/authCheckMain.js", priority: 4 },
    ],
  },

  // Configuração para módulos de login
  login: {
    basePath: "/javascripts/login",
    dependencies: ["auth"],
    modules: [
      { name: "loginUI", path: "/../auth/ui/loginUI.js", priority: 1 },
      { name: "loginAuth", path: "/auth/loginAuth.js", priority: 2 },
      { name: "loginMain", path: "/loginMain.js", priority: 3 },
    ],
  },

  // Configuração para módulos do dashboard
  dashboard: {
    basePath: "/javascripts/dashboard",
    dependencies: ["core"],
    modules: [
      { name: "dashboardUI", path: "/ui/dashboardUI.js", priority: 1 },
      { name: "dashboardData", path: "/data/dashboardData.js", priority: 2 },
      {
        name: "dashboardCharts",
        path: "/charts/dashboardCharts.js",
        priority: 3,
      },
      {
        name: "dashboardNavigation",
        path: "/navigation/dashboardNavigation.js",
        priority: 4,
      },
      {
        name: "dashboardEvents",
        path: "/events/dashboardEvents.js",
        priority: 5,
      },
      { name: "dashboardMain", path: "/dashboardMain.js", priority: 6 },
    ],
  },

  // Configuração para módulos de rastreamento
  rastreamento: {
    basePath: "/javascripts/rastreamento",
    dependencies: ["core"],
    modules: [
      {
        name: "transportadoras",
        path: "/config/transportadoras.js",
        priority: 1,
      },
      { name: "formatters", path: "/utils/formatters.js", priority: 2 },
      { name: "dataLoader", path: "/api/dataLoader.js", priority: 3 },
      { name: "modal", path: "/components/modal.js", priority: 4 },
      { name: "tabela", path: "/renderers/tabela.js", priority: 5 },
      {
        name: "dataTablesRenderer",
        path: "/renderers/dataTablesRenderer.js",
        priority: 5.5,
      },
      {
        name: "modalDetalhes",
        path: "/renderers/modalDetalhes.js",
        priority: 6,
      },
      { name: "eventManager", path: "/events/eventManager.js", priority: 7 },
      { name: "rastreamento", path: "/rastreamento.js", priority: 8 },
    ],
  },

  // Configuração para módulos administrativos
  admin: {
    basePath: "/javascripts/admin",
    dependencies: ["auth"],
    modules: [
      { name: "adminAuth", path: "/auth/authMain.js", priority: 1 },
      { name: "adminUI", path: "/../auth/ui/authUI.js", priority: 2 },
      { name: "adminMain", path: "/adminMain.js", priority: 3 },
    ],
  },
};

/**
 * Carrega um script dinamicamente com verificação de duplicação
 */
window.ModuleLoader.loadScript = function (src) {
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
      window.ModuleLoader.state.loadedModules.add(src);
      resolve();
    };
    script.onerror = (error) => {
      console.error(`❌ [ModuleLoader] Erro ao carregar script: ${src}`, error);
      reject(new Error(`Failed to load script: ${src}`));
    };
    document.head.appendChild(script);
  });
};

/**
 * Carrega múltiplos scripts em sequência respeitando prioridades
 */
window.ModuleLoader.loadScripts = async function (scripts) {
  // Ordenar por prioridade
  const sortedScripts = scripts.sort((a, b) => a.priority - b.priority);

  for (const script of sortedScripts) {
    try {
      await window.ModuleLoader.loadScript(script.path);
    } catch (error) {
      console.error(
        `❌ [ModuleLoader] Erro ao carregar módulo ${script.name}:`,
        error
      );
      // Continuar carregando outros módulos mesmo se um falhar
      console.warn(`⚠️ [ModuleLoader] Continuando sem o módulo ${script.name}`);
    }
  }
};

/**
 * Carrega um grupo de módulos com suas dependências
 */
window.ModuleLoader.loadModuleGroup = async function (groupName) {
  try {
    const config = window.ModuleLoader.configs[groupName];
    if (!config) {
      throw new Error(`Configuração não encontrada para o grupo: ${groupName}`);
    }

    // Carregar dependências primeiro
    if (config.dependencies && config.dependencies.length > 0) {
      for (const dependency of config.dependencies) {
        await window.ModuleLoader.loadModuleGroup(dependency);
      }
    }

    // Construir caminhos completos
    const basePath = window.location.origin + config.basePath;
    const scripts = config.modules.map((module) => ({
      ...module,
      path: basePath + module.path,
    }));

    // Carregar módulos do grupo
    await window.ModuleLoader.loadScripts(scripts);
  } catch (error) {
    console.error(
      `❌ [ModuleLoader] Erro ao carregar grupo ${groupName}:`,
      error
    );
    // Não fazer throw para evitar loops - continuar com outros grupos
    console.warn(`⚠️ [ModuleLoader] Continuando sem o grupo ${groupName}`);
  }
};

/**
 * Carrega módulos específicos para a página de login
 */
window.ModuleLoader.loadLoginPage = async function () {
  try {
    window.ModuleLoader.state.isLoading = true;

    // Carregar módulos de autenticação primeiro
    await window.ModuleLoader.loadModuleGroup("auth");

    // Carregar módulos de login
    await window.ModuleLoader.loadModuleGroup("login");

    window.ModuleLoader.state.isLoading = false;
  } catch (error) {
    window.ModuleLoader.state.isLoading = false;
    console.error("❌ [ModuleLoader] Erro ao carregar página de login:", error);
    throw error;
  }
};

/**
 * Verifica autenticação na página raiz e redireciona apropriadamente
 */
window.ModuleLoader.checkAuthAndRedirect = async function () {
  try {
    // Carregar módulos de autenticação primeiro
    await window.ModuleLoader.loadModuleGroup("auth");

    // Verificar se há token nos cookies
    const token = window.AuthCore.getToken();
    if (!token) {
      window.ModuleLoader.loadLoginPage();
      return;
    }

    // Verificar se o token é válido
    if (window.AuthCore && window.AuthCore.validateToken) {
      const userData = await window.AuthCore.validateToken(token);
      if (userData && !window.AuthCore.isTokenExpired(userData)) {
        window.location.href = "/home";
        return;
      }
    }

    // Token inválido ou expirado, carregar página de login
    window.AuthCore.removeToken();
    window.ModuleLoader.loadLoginPage();
  } catch (error) {
    console.error("❌ [ModuleLoader] Erro ao verificar autenticação:", error);

    window.ModuleLoader.loadLoginPage();
  }
};

/**
 * Carrega módulos específicos para o dashboard
 */
window.ModuleLoader.loadDashboardPage = async function () {
  try {
    window.ModuleLoader.state.isLoading = true;

    // Carregar módulos de autenticação primeiro (necessário para UserAuth)
    await window.ModuleLoader.loadModuleGroup("auth");

    // Carregar módulos do dashboard
    await window.ModuleLoader.loadModuleGroup("dashboard");

    // Inicializar dashboard se disponível
    if (window.DashboardMain && window.DashboardMain.initDashboard) {
      window.DashboardMain.initDashboard();
    }

    window.ModuleLoader.state.isLoading = false;
  } catch (error) {
    window.ModuleLoader.state.isLoading = false;
    console.error("❌ [ModuleLoader] Erro ao carregar dashboard:", error);
    // Não fazer throw para evitar loops
    console.warn(
      "⚠️ [ModuleLoader] Continuando sem alguns módulos do dashboard"
    );
  }
};

/**
 * Carrega módulos específicos para rastreamento
 */
window.ModuleLoader.loadRastreamentoPage = async function () {
  try {
    window.ModuleLoader.state.isLoading = true;

    // Carregar módulos de rastreamento
    await window.ModuleLoader.loadModuleGroup("rastreamento");

    window.ModuleLoader.state.isLoading = false;
  } catch (error) {
    window.ModuleLoader.state.isLoading = false;
    console.error("❌ [ModuleLoader] Erro ao carregar rastreamento:", error);
    throw error;
  }
};

/**
 * Carrega módulos específicos para administração
 */
window.ModuleLoader.loadAdminPage = async function () {
  try {
    window.ModuleLoader.state.isLoading = true;

    // Carregar módulos administrativos
    await window.ModuleLoader.loadModuleGroup("admin");

    window.ModuleLoader.state.isLoading = false;
  } catch (error) {
    window.ModuleLoader.state.isLoading = false;
    console.error("❌ [ModuleLoader] Erro ao carregar administração:", error);
    throw error;
  }
};

/**
 * Verifica se um módulo está carregado
 */
window.ModuleLoader.isModuleLoaded = function (modulePath) {
  return window.ModuleLoader.state.loadedModules.has(modulePath);
};

/**
 * Obtém status do carregador
 */
window.ModuleLoader.getStatus = function () {
  return {
    isLoading: window.ModuleLoader.state.isLoading,
    loadedModules: Array.from(window.ModuleLoader.state.loadedModules),
    moduleCount: window.ModuleLoader.state.loadedModules.size,
  };
};

/**
 * Limpa o estado do carregador
 */
window.ModuleLoader.clearState = function () {
  window.ModuleLoader.state.loadedModules.clear();
  window.ModuleLoader.state.isLoading = false;
};

// Exportar para uso global
window.ModuleLoader.init = function () {
  // Detectar página atual e carregar módulos apropriados
  const currentPath = window.location.pathname;

  if (currentPath === "/") {
    window.ModuleLoader.checkAuthAndRedirect();
  } else if (currentPath.includes("login")) {
    window.ModuleLoader.loadLoginPage();
  } else if (currentPath.includes("administration")) {
    window.ModuleLoader.loadAdminPage();
  } else if (currentPath.includes("home") || currentPath.includes("index")) {
    window.ModuleLoader.loadDashboardPage();
  }
};

// Inicializar automaticamente quando o DOM estiver pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", window.ModuleLoader.init);
} else {
  window.ModuleLoader.init();
}
