window.ModuleLoader = window.ModuleLoader || {};

window.ModuleLoader.state = {
  loadedModules: new Set(),
  isLoading: false,
  moduleConfigs: new Map(),
  eventTarget: document.createElement("div"),
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
      { name: "keycloakWrapper", path: "/keycloak/keycloak-wrapper.js", priority: -1 },
      { name: "keycloakAuth", path: "/keycloak/keycloakAuth.js", priority: 0 },
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
        name: "administrationFaixasPeso",
        path: "/entities/faixasPeso.js",
        priority: 13,
      },
      { name: "administrationRotas", path: "/entities/rotas.js", priority: 14 },
      {
        name: "administrationRotaTransportadoras",
        path: "/entities/rotaTransportadoras.js",
        priority: 15,
      },
      {
        name: "administrationPrecosFaixas",
        path: "/entities/precosFaixas.js",
        priority: 16,
      },
      {
        name: "administrationTransportadorasExcluidas",
        path: "/entities/transportadorasExcluidas.js",
        priority: 16.5,
      },
      {
        name: "administrationEvents",
        path: "/events/administrationEvents.js",
        priority: 17,
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
    if (window.ModuleLoader.state.loadedModules.has(src)) {
      resolve();
      return;
    }

    const baseSrc = src.split("?")[0];
    const existingScripts = document.querySelectorAll(
      `script[src^="${baseSrc}"]`
    );
    if (existingScripts.length > 0) {
      window.ModuleLoader.state.loadedModules.add(src);
      resolve();
      return;
    }

    const timestamp = new Date().getTime();
    const srcWithCacheBust = `${src}?v=${timestamp}`;

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
      window.ModuleLoader.state.eventTarget.dispatchEvent(
        new CustomEvent("moduleLoaded", {
          detail: { name: script.name, path: script.path },
        })
      );
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

    window.ModuleLoader.state.eventTarget.dispatchEvent(
      new CustomEvent("moduleGroupLoaded", { detail: { groupName } })
    );
  } catch (error) {
    console.error(`Erro ao carregar grupo ${groupName}:`, error);
  }
};

window.ModuleLoader.loadLoginPage = async function () {
  try {
    window.ModuleLoader.state.isLoading = true;

    await window.ModuleLoader.loadModuleGroup("auth");

    if (window.AuthCore && window.AuthCore.getToken) {
      const token = window.AuthCore.getToken();
      if (token && token !== "undefined" && token !== "null") {
        try {
          const userData = await window.AuthCore.validateToken(token);
          if (userData && !window.AuthCore.isTokenExpired(userData)) {
            window.ModuleLoader.state.isLoading = false;
            window.location.href = "/rastreamento";
            return;
          }
        } catch (error) {
          // Token inválido ou expirado, continua com o login
          console.error("Token inválido ou expirado, mostrando tela de login");
        }
      }
    }

    await window.ModuleLoader.loadModuleGroup("login");

    if (window.LoginMain && window.LoginMain.initLogin) {
      await window.LoginMain.initLogin();
    }

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
        window.location.href = "/rastreamento";
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

    // Carrega módulos de autenticação primeiro
    await window.ModuleLoader.loadModuleGroup("auth");

    // Verifica se o usuário está autenticado
    if (window.AuthCore && window.AuthCore.getToken) {
      const token = window.AuthCore.getToken();
      if (!token || token === "undefined" || token === "null") {
        // Não há token, redireciona para login
        window.ModuleLoader.state.isLoading = false;
        window.location.href = "/";
        return;
      }

      // Valida o token no servidor
      try {
        const userData = await window.AuthCore.validateToken(token);
        if (!userData || window.AuthCore.isTokenExpired(userData)) {
          // Token inválido ou expirado, redireciona para login
          window.AuthCore.removeToken();
          window.ModuleLoader.state.isLoading = false;
          window.location.href = "/";
          return;
        }
      } catch (error) {
        // Erro ao validar token, redireciona para login
        window.AuthCore.removeToken();
        window.ModuleLoader.state.isLoading = false;
        window.location.href = "/";
        return;
      }
    } else {
      // AuthCore não disponível, redireciona para login
      window.ModuleLoader.state.isLoading = false;
      window.location.href = "/";
      return;
    }

    // Usuário autenticado, carrega módulos de rastreamento
    await window.ModuleLoader.loadModuleGroup("rastreamento");

    window.ModuleLoader.state.isLoading = false;
  } catch (error) {
    window.ModuleLoader.state.isLoading = false;
    console.error("❌ [ModuleLoader] Erro ao carregar rastreamento:", error);
    // Em caso de erro, redireciona para login
    window.location.href = "/";
    throw error;
  }
};

window.ModuleLoader.loadAdminPage = async function () {
  try {
    window.ModuleLoader.state.isLoading = true;

    // Carrega módulos de autenticação primeiro
    await window.ModuleLoader.loadModuleGroup("auth");

    // Verifica se o usuário está autenticado
    if (window.AuthCore && window.AuthCore.getToken) {
      const token = window.AuthCore.getToken();
      if (!token || token === "undefined" || token === "null") {
        // Não há token, redireciona para login
        window.ModuleLoader.state.isLoading = false;
        window.location.href = "/";
        return;
      }

      // Valida o token no servidor
      try {
        const userData = await window.AuthCore.validateToken(token);
        if (!userData || window.AuthCore.isTokenExpired(userData)) {
          // Token inválido ou expirado, redireciona para login
          window.AuthCore.removeToken();
          window.ModuleLoader.state.isLoading = false;
          window.location.href = "/";
          return;
        }

        // Verifica se o usuário é administrador
        if (userData.isAdmin !== 1 && userData.isAdmin !== true) {
          // Usuário não é administrador, redireciona para rastreamento
          window.ModuleLoader.state.isLoading = false;
          window.location.href = "/rastreamento";
          return;
        }
      } catch (error) {
        // Erro ao validar token, redireciona para login
        window.AuthCore.removeToken();
        window.ModuleLoader.state.isLoading = false;
        window.location.href = "/";
        return;
      }
    } else {
      // AuthCore não disponível, redireciona para login
      window.ModuleLoader.state.isLoading = false;
      window.location.href = "/";
      return;
    }

    // Usuário autenticado e é administrador, carrega módulos de admin
    await window.ModuleLoader.loadModuleGroup("admin");

    // Dispara evento quando a página admin é completamente carregada
    window.ModuleLoader.state.eventTarget.dispatchEvent(
      new CustomEvent("adminPageLoaded")
    );

    window.ModuleLoader.state.isLoading = false;
  } catch (error) {
    window.ModuleLoader.state.isLoading = false;
    console.error("❌ [ModuleLoader] Erro ao carregar administração:", error);
    // Em caso de erro, redireciona para login
    window.location.href = "/";
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
  // Evita múltiplas inicializações
  if (window.ModuleLoader._initialized) {
    return;
  }
  window.ModuleLoader._initialized = true;

  const currentPath = window.location.pathname;

  if (currentPath === "/" || currentPath.includes("login")) {
    // Página de login - verifica se já está autenticado
    window.ModuleLoader.loadLoginPage();
  } else if (currentPath.includes("rastreamento")) {
    // Carregar rastreamento com verificação de autenticação
    window.ModuleLoader.loadRastreamentoPage();
  } else if (currentPath.includes("administration")) {
    window.ModuleLoader.loadAdminPage();
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", window.ModuleLoader.init);
} else {
  window.ModuleLoader.init();
}
