window.ModuleLoader = window.ModuleLoader || {};

window.ModuleLoader.state = {
  loadedModules: new Set(),
  isLoading: false,
  moduleConfigs: new Map(),
};

window.ModuleLoader.configs = {
  core: {
    basePath: "/javascripts",
    dependencies: ["auth"],
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

  login: {
    basePath: "/javascripts/login",
    dependencies: ["auth"],
    modules: [
      { name: "loginUI", path: "/../auth/ui/loginUI.js", priority: 1 },
      { name: "loginAuth", path: "/auth/loginAuth.js", priority: 2 },
      { name: "loginMain", path: "/loginMain.js", priority: 3 },
    ],
  },

  rastreamento: {
    basePath: "/javascripts/rastreamento",
    dependencies: [], // Versão capada: sem dependências de core/auth
    modules: [
      {
        name: "transportadoras",
        path: "/config/transportadoras.js",
        priority: 1,
      },
      { name: "formatters", path: "/utils/formatters.js", priority: 2 },
      { name: "dataLoader", path: "/api/dataLoader.js", priority: 3 },
      { name: "buscaAPI", path: "/api/buscaAPI.js", priority: 3.5 },
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

  admin: {
    basePath: "/javascripts/admin",
    dependencies: ["auth"],
    modules: [
      { name: "adminAuth", path: "/auth/authMain.js", priority: 1 },
      { name: "adminUI", path: "/../auth/ui/authUI.js", priority: 2 },
      { name: "adminMain", path: "/adminMain.js", priority: 3 },
      {
        name: "administrationState",
        path: "/state/administrationState.js",
        priority: 4,
      },
      {
        name: "administrationApi",
        path: "/api/administrationApi.js",
        priority: 5,
      },
      {
        name: "administrationUtils",
        path: "/utils/administrationUtils.js",
        priority: 6,
      },
      {
        name: "administrationPagination",
        path: "/utils/pagination.js",
        priority: 6.5,
      },
      {
        name: "administrationDeleteConfirm",
        path: "/utils/deleteConfirmModal.js",
        priority: 6.6,
      },
      {
        name: "administrationTabs",
        path: "/tabs/administrationTabs.js",
        priority: 7,
      },
      { name: "administrationUsers", path: "/entities/users.js", priority: 8 },
      {
        name: "administrationSessions",
        path: "/entities/sessions.js",
        priority: 9,
      },
      {
        name: "administrationEstados",
        path: "/entities/estados.js",
        priority: 10,
      },
      {
        name: "administrationCidades",
        path: "/entities/cidades.js",
        priority: 11,
      },
      {
        name: "administrationTransportadoras",
        path: "/entities/transportadoras.js",
        priority: 12,
      },
      {
        name: "administrationFaixasPeso",
        path: "/entities/faixasPeso.js",
        priority: 13,
      },
      { name: "administrationRotas", path: "/entities/rotas.js", priority: 14 },
      {
        name: "administrationPrecosFaixas",
        path: "/entities/precosFaixas.js",
        priority: 15,
      },
      {
        name: "administrationEvents",
        path: "/events/administrationEvents.js",
        priority: 16,
      },
      {
        name: "administrationMain",
        path: "/administrationMain.js",
        priority: 17,
      },
    ],
  },
};

window.ModuleLoader.loadScript = function (src) {
  return new Promise((resolve, reject) => {
    // Adiciona timestamp para evitar cache do navegador
    const timestamp = new Date().getTime();
    const srcWithCacheBust = `${src}?v=${timestamp}`;

    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      // Remove script antigo para forçar recarregamento
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.src = srcWithCacheBust;
    script.onload = () => {
      window.ModuleLoader.state.loadedModules.add(src);
      resolve();
    };
    script.onerror = (error) => {
      console.error(`Erro ao carregar script: ${src}`, error);
      reject(new Error(`Failed to load script: ${src}`));
    };
    document.head.appendChild(script);
  });
};

window.ModuleLoader.loadScripts = async function (scripts) {
  const sortedScripts = scripts.sort((a, b) => a.priority - b.priority);

  for (const script of sortedScripts) {
    try {
      await window.ModuleLoader.loadScript(script.path);
    } catch (error) {
      console.error(`Erro ao carregar módulo ${script.name}:`, error);
    }
  }
};

window.ModuleLoader.loadModuleGroup = async function (groupName) {
  try {
    const config = window.ModuleLoader.configs[groupName];
    if (!config) {
      throw new Error(`Configuração não encontrada para o grupo: ${groupName}`);
    }

    if (config.dependencies && config.dependencies.length > 0) {
      for (const dependency of config.dependencies) {
        await window.ModuleLoader.loadModuleGroup(dependency);
      }
    }

    const basePath = window.location.origin + config.basePath;
    const scripts = config.modules.map((module) => ({
      ...module,
      path: basePath + module.path,
    }));

    await window.ModuleLoader.loadScripts(scripts);
  } catch (error) {
    console.error(`Erro ao carregar grupo ${groupName}:`, error);
  }
};

window.ModuleLoader.loadLoginPage = async function () {
  try {
    window.ModuleLoader.state.isLoading = true;

    await window.ModuleLoader.loadModuleGroup("auth");

    await window.ModuleLoader.loadModuleGroup("login");

    window.ModuleLoader.state.isLoading = false;
  } catch (error) {
    window.ModuleLoader.state.isLoading = false;
    console.error("❌ [ModuleLoader] Erro ao carregar página de login:", error);
    throw error;
  }
};

window.ModuleLoader.checkAuthAndRedirect = async function () {
  try {
    await window.ModuleLoader.loadModuleGroup("auth");

    const token = window.AuthCore.getToken();
    if (!token) {
      window.ModuleLoader.loadLoginPage();
      return;
    }

    if (window.AuthCore && window.AuthCore.validateToken) {
      const userData = await window.AuthCore.validateToken(token);
      if (userData && !window.AuthCore.isTokenExpired(userData)) {
        window.location.href = "/home";
        return;
      }
    }

    window.AuthCore.removeToken();
    window.ModuleLoader.loadLoginPage();
  } catch (error) {
    console.error("❌ [ModuleLoader] Erro ao verificar autenticação:", error);

    window.ModuleLoader.loadLoginPage();
  }
};

window.ModuleLoader.loadRastreamentoPage = async function () {
  try {
    window.ModuleLoader.state.isLoading = true;

    await window.ModuleLoader.loadModuleGroup("rastreamento");

    window.ModuleLoader.state.isLoading = false;
  } catch (error) {
    window.ModuleLoader.state.isLoading = false;
    console.error("❌ [ModuleLoader] Erro ao carregar rastreamento:", error);
    throw error;
  }
};

window.ModuleLoader.loadAdminPage = async function () {
  try {
    window.ModuleLoader.state.isLoading = true;

    await window.ModuleLoader.loadModuleGroup("admin");

    window.ModuleLoader.state.isLoading = false;
  } catch (error) {
    window.ModuleLoader.state.isLoading = false;
    console.error("❌ [ModuleLoader] Erro ao carregar administração:", error);
    throw error;
  }
};

window.ModuleLoader.loadHomePage = async function () {
  try {
    window.ModuleLoader.state.isLoading = true;

    await window.ModuleLoader.loadModuleGroup("core");

    await new Promise((resolve) => setTimeout(resolve, 100));

    if (window.AppInitializer && window.AppInitializer.init) {
      await window.AppInitializer.init();
    } else {
      console.error("AppInitializer não está disponível");
    }

    window.ModuleLoader.state.isLoading = false;
  } catch (error) {
    window.ModuleLoader.state.isLoading = false;
    console.error("Erro ao carregar página home:", error);
    throw error;
  }
};

window.ModuleLoader.isModuleLoaded = function (modulePath) {
  return window.ModuleLoader.state.loadedModules.has(modulePath);
};

window.ModuleLoader.getStatus = function () {
  return {
    isLoading: window.ModuleLoader.state.isLoading,
    loadedModules: Array.from(window.ModuleLoader.state.loadedModules),
    moduleCount: window.ModuleLoader.state.loadedModules.size,
  };
};

window.ModuleLoader.clearState = function () {
  window.ModuleLoader.state.loadedModules.clear();
  window.ModuleLoader.state.isLoading = false;
};

window.ModuleLoader.init = function () {
  const currentPath = window.location.pathname;

  if (currentPath === "/" || currentPath.includes("rastreamento")) {
    // Versão capada: carregar rastreamento sem autenticação
    window.ModuleLoader.loadRastreamentoPage();
  } else if (currentPath.includes("login")) {
    window.ModuleLoader.loadLoginPage();
  } else if (currentPath.includes("administration")) {
    window.ModuleLoader.loadAdminPage();
  } else if (currentPath === "/home" || currentPath.includes("home")) {
    window.ModuleLoader.loadHomePage();
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", window.ModuleLoader.init);
} else {
  window.ModuleLoader.init();
}
