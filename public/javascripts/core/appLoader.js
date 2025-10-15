// App Loader Module - Carregador principal da aplicação
// Versão: 2025-10-15-20:35 - Correção de conflito de funções

window.AppLoader = window.AppLoader || {};

// Estado do carregador
window.AppLoader.state = {
  loadedModules: new Set(),
  isLoading: false,
  isInitialized: false,
};

// Função para obter caminho base do AppLoader
function getAppLoaderBasePath() {
  // Tentar obter o caminho do script atual
  const currentScript = document.currentScript;

  if (currentScript && currentScript.src) {
    const scriptSrc = currentScript.src;
    const scriptPath = scriptSrc.substring(0, scriptSrc.lastIndexOf("/"));

    // Verificar se o caminho é correto para o appLoader
    if (scriptPath.includes("/javascripts/core")) {
      return scriptPath;
    }
  }

  // Fallback: usar caminho fixo para /javascripts
  const fallbackPath = window.location.origin + "/javascripts";
  return fallbackPath;
}

// Função básica para carregar script (usada antes do ScriptLoader estar disponível)
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
      console.error(`❌ [AppLoader] Erro ao carregar script: ${src}`, error);
      console.error(`🔍 [AppLoader] Detalhes do erro:`, {
        src: src,
        error: error,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        currentURL: window.location.href,
        documentReadyState: document.readyState,
      });
      reject(error);
    };
    document.head.appendChild(script);
  });
}

// Função para carregar módulos principais
async function loadCoreModules() {
  try {
    const basePath = getAppLoaderBasePath();

    // Lista dos scripts que serão carregados
    const scriptsToLoad = [
      `${basePath}/utils/scriptLoader.js`,
      `${basePath}/utils/helpers.js`,
      `${basePath}/ui/notifications.js`,
      `${basePath}/ui/sidebar.js`,
      `${basePath}/ui/modals.js`,
      `${basePath}/user/userAuth.js`,
      `${basePath}/user/userProfile.js`,
      `${basePath}/user/userAvatar.js`,
      `${basePath}/tabs/tabManager.js`,
      `${basePath}/tabs/tabDragDrop.js`,
      `${basePath}/tools/toolManager.js`,
      `${basePath}/core/appInitializer.js`,
    ];

    // Carregar todos os módulos
    for (const scriptPath of scriptsToLoad) {
      await loadScript(scriptPath);
    }
  } catch (error) {
    console.error("❌ [AppLoader] Erro ao carregar módulos principais:", error);
    console.error(`🔍 [AppLoader] Detalhes do erro de carregamento:`, {
      error: error,
      timestamp: new Date().toISOString(),
      currentURL: window.location.href,
      userAgent: navigator.userAgent,
      documentReadyState: document.readyState,
    });
    throw error;
  }
}

// Função para inicializar aplicação
async function initApp() {
  try {
    window.AppLoader.state.isLoading = true;
    await loadCoreModules();

    if (window.AppInitializer && window.AppInitializer.init) {
      await window.AppInitializer.init();
    } else {
      console.warn(
        `⚠️ [AppLoader] AppInitializer não encontrado ou método init não disponível`
      );
    }

    window.AppLoader.state.isInitialized = true;
    window.AppLoader.state.isLoading = false;
  } catch (error) {
    console.error(
      "💥 [AppLoader] Erro crítico ao inicializar aplicação:",
      error
    );
    console.error(`🔍 [AppLoader] Detalhes do erro crítico:`, {
      error: error,
      timestamp: new Date().toISOString(),
      currentURL: window.location.href,
      userAgent: navigator.userAgent,
      documentReadyState: document.readyState,
      stack: error.stack,
    });
    window.AppLoader.state.isLoading = false;
    throw error;
  }
}

// Função para verificar status dos módulos
window.AppLoader.checkModuleStatus = function () {
  const modules = [
    { name: "ScriptLoader", instance: window.ScriptLoader },
    { name: "Helpers", instance: window.Helpers },
    { name: "Notifications", instance: window.Notifications },
    { name: "Sidebar", instance: window.Sidebar },
    { name: "Modals", instance: window.Modals },
    { name: "UserAuth", instance: window.UserAuth },
    { name: "UserProfile", instance: window.UserProfile },
    { name: "UserAvatar", instance: window.UserAvatar },
    { name: "TabManager", instance: window.TabManager },
    { name: "TabDragDrop", instance: window.TabDragDrop },
    { name: "ToolManager", instance: window.ToolManager },
    { name: "AppInitializer", instance: window.AppInitializer },
  ];

  const loadedModules = [];
  const missingModules = [];

  modules.forEach((module) => {
    if (module.instance) {
      loadedModules.push(module.name);
      window.AppLoader.state.loadedModules.add(module.name);
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

// Função para recarregar módulos
window.AppLoader.reloadModules = async function () {
  try {
    // Limpar estado
    window.AppLoader.state.loadedModules.clear();
    window.AppLoader.state.isInitialized = false;

    // Recarregar módulos
    await loadCoreModules();

    // Reinicializar aplicação
    if (window.AppInitializer && window.AppInitializer.init) {
      await window.AppInitializer.init();
    }

    window.AppLoader.state.isInitialized = true;
  } catch (error) {
    console.error("❌ Erro ao recarregar módulos:", error);
    throw error;
  }
};

// Função para obter status da aplicação
window.AppLoader.getStatus = function () {
  return {
    isLoading: window.AppLoader.state.isLoading,
    isInitialized: window.AppLoader.state.isInitialized,
    loadedModules: Array.from(window.AppLoader.state.loadedModules),
    moduleCount: window.AppLoader.state.loadedModules.size,
  };
};

// Inicializar aplicação quando o DOM estiver pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initApp();
  });
} else {
  // DOM já está pronto

  initApp();
}
