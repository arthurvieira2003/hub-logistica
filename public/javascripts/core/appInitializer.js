window.AppInitializer = window.AppInitializer || {};

window.AppInitializer.state = {
  isInitialized: false,
  initializationSteps: [],
};

window.AppInitializer.init = async function () {
  try {
    if (window.AppInitializer.state.isInitialized) {
      return;
    }

    await window.AppInitializer.ensureModulesLoaded();

    await window.AppInitializer.executeInitializationSteps();

    window.AppInitializer.state.isInitialized = true;
  } catch (error) {
    console.error("Erro ao inicializar aplicação:", error);
    throw error;
  }
};

function isModuleLoaderAvailable() {
  return !!(window.ModuleLoader && window.ModuleLoader.loadModuleGroup);
}

function isAuthModuleLoaded() {
  return !!(window.AuthCore && window.UserAuth);
}

function isCoreModuleLoaded() {
  return !!(window.UserProfile && window.UserAvatar);
}

async function loadModuleGroupSafely(groupName, errorMessage) {
  try {
    await window.ModuleLoader.loadModuleGroup(groupName);
  } catch (error) {
    console.error(errorMessage, error);
  }
}

window.AppInitializer.ensureModulesLoaded = async function () {
  if (!isModuleLoaderAvailable()) {
    return;
  }

  if (!isAuthModuleLoaded()) {
    await loadModuleGroupSafely("auth", "Erro ao carregar módulos de autenticação:");
  }

  if (!isCoreModuleLoaded()) {
    await loadModuleGroupSafely("core", "Erro ao carregar módulos core:");
  }
};

function createTimeoutPromise(stepName, timeoutMs = 15000) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout em ${stepName}`)), timeoutMs);
  });
}

function recordStepSuccess(stepName) {
  window.AppInitializer.state.initializationSteps.push({
    name: stepName,
    status: "success",
    timestamp: new Date(),
  });
}

function recordStepError(stepName, error) {
  window.AppInitializer.state.initializationSteps.push({
    name: stepName,
    status: "error",
    error: error.message,
    timestamp: new Date(),
  });
}

function handleUserDataLoadError(error) {
  const userNameElement = document.getElementById("userName");
  const userEmailElement = document.getElementById("userEmail");

  if (userNameElement && userNameElement.textContent === "Carregando...") {
    userNameElement.textContent = "Erro ao carregar";
  }

  if (userEmailElement && userEmailElement.textContent === "Carregando...") {
    userEmailElement.textContent = error.message?.includes("Timeout")
      ? "Timeout - tente recarregar"
      : "Erro ao carregar dados";
  }
}

async function executeStepWithTimeout(step) {
  const timeoutPromise = createTimeoutPromise(step.name);
  await Promise.race([step.func(), timeoutPromise]);
}

function handleStepError(step, error) {
  console.error(`Erro em ${step.name}:`, error);
  recordStepError(step.name, error);

  if (step.name === "Carregar dados do usuário") {
    handleUserDataLoadError(error);
  }
}

window.AppInitializer.executeInitializationSteps = async function () {
  const steps = [
    {
      name: "Forçar sidebar aberta",
      func: window.AppInitializer.forceOpenSidebar,
    },
    {
      name: "Carregar dados do usuário",
      func: window.AppInitializer.loadUserData,
    },
    {
      name: "Carregar avatar do usuário",
      func: window.AppInitializer.loadUserAvatar,
    },
    {
      name: "Carregar tela inicial",
      func: window.AppInitializer.loadWelcomeScreen,
    },
    {
      name: "Inicializar botões de ferramentas",
      func: window.AppInitializer.initToolButtons,
    },
    {
      name: "Inicializar sistema de abas",
      func: window.AppInitializer.initTabSystem,
    },
    {
      name: "Inicializar dropdown do usuário",
      func: window.AppInitializer.initUserDropdown,
    },
    { name: "Inicializar modais", func: window.AppInitializer.initModals },
    { name: "Inicializar sidebar", func: window.AppInitializer.initSidebar },
    {
      name: "Forçar sidebar aberta novamente",
      func: window.AppInitializer.forceOpenSidebar,
    },
  ];

  for (const step of steps) {
    try {
      await executeStepWithTimeout(step);
      recordStepSuccess(step.name);
    } catch (error) {
      handleStepError(step, error);
    }
  }
};

window.AppInitializer.forceOpenSidebar = function () {
  if (window.Sidebar && window.Sidebar.forceOpen) {
    window.Sidebar.forceOpen();
  }
};

window.AppInitializer.loadUserData = async function () {
  const fallbackTimeout = setTimeout(() => {
    const userNameElement = document.getElementById("userName");
    const userEmailElement = document.getElementById("userEmail");
    if (userNameElement && userNameElement.textContent === "Carregando...") {
      userNameElement.textContent = "Erro ao carregar";
    }
    if (userEmailElement && userEmailElement.textContent === "Carregando...") {
      userEmailElement.textContent = "Timeout - tente recarregar";
    }
  }, 12000);

  if (window.UserProfile && window.UserProfile.loadUserData) {
    try {
      const result = await window.UserProfile.loadUserData();
      clearTimeout(fallbackTimeout);
      return result;
    } catch (error) {
      clearTimeout(fallbackTimeout);
      const userNameElement = document.getElementById("userName");
      const userEmailElement = document.getElementById("userEmail");
      if (userNameElement && userNameElement.textContent === "Carregando...") {
        userNameElement.textContent = "Erro ao carregar";
      }
      if (
        userEmailElement &&
        userEmailElement.textContent === "Carregando..."
      ) {
        userEmailElement.textContent = error.message?.includes("Timeout")
          ? "Timeout - tente recarregar"
          : "Erro ao carregar dados";
      }
      throw error;
    }
  } else {
    clearTimeout(fallbackTimeout);
    const userNameElement = document.getElementById("userName");
    const userEmailElement = document.getElementById("userEmail");
    if (userNameElement && userNameElement.textContent === "Carregando...") {
      userNameElement.textContent = "Módulo não disponível";
    }
    if (userEmailElement && userEmailElement.textContent === "Carregando...") {
      userEmailElement.textContent = "Recarregue a página";
    }
  }
};

window.AppInitializer.loadUserAvatar = async function () {
  if (window.UserAvatar && window.UserAvatar.getUserAvatar) {
    await window.UserAvatar.getUserAvatar();
  }
};

window.AppInitializer.loadWelcomeScreen = async function () {
  try {
    const welcomeScreen = document.getElementById("welcomeScreen");
    if (!welcomeScreen) return;

    welcomeScreen.style.display = "flex";
  } catch (error) {
    console.error("Erro ao carregar tela inicial:", error);
  }
};

window.AppInitializer.initToolButtons = function () {
  if (window.ToolManager && window.ToolManager.initToolButtons) {
    window.ToolManager.initToolButtons();
  }
};

window.AppInitializer.initTabSystem = function () {
  if (window.TabManager && window.TabDragDrop) {
    if (window.TabDragDrop.init) {
      window.TabDragDrop.init();
    }
  }
};

window.AppInitializer.initUserDropdown = function () {
  const userProfileButton = document.getElementById("userProfileButton");
  const template = document.getElementById("userDropdownTemplate");

  if (!userProfileButton || !template) {
    return;
  }
};

window.AppInitializer.initModals = function () {
  if (window.Modals && window.Modals.init) {
    window.Modals.init();
  }
};

window.AppInitializer.initSidebar = function () {
  if (window.Sidebar && window.Sidebar.init) {
    window.Sidebar.init();
    window.Sidebar.addPersistentEvents();
  }
};

window.AppInitializer.getInitializationStatus = function () {
  return {
    isInitialized: window.AppInitializer.state.isInitialized,
    steps: window.AppInitializer.state.initializationSteps,
    successCount: window.AppInitializer.state.initializationSteps.filter(
      (step) => step.status === "success"
    ).length,
    errorCount: window.AppInitializer.state.initializationSteps.filter(
      (step) => step.status === "error"
    ).length,
  };
};

window.AppInitializer.reinitialize = async function () {
  window.AppInitializer.state.isInitialized = false;
  window.AppInitializer.state.initializationSteps = [];

  await window.AppInitializer.init();
};

const isManagedByModuleLoader =
  window.location.pathname === "/home" ||
  window.location.pathname.includes("home");

if (
  !window.location.pathname.includes("login") &&
  window.location.pathname !== "/" &&
  !isManagedByModuleLoader
) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.AppInitializer.init();
    });
  } else {
    window.AppInitializer.init();
  }
}
