// App Initializer Module - Inicializador principal da aplicação
window.AppInitializer = window.AppInitializer || {};

// Estado do inicializador
window.AppInitializer.state = {
  isInitialized: false,
  initializationSteps: [],
};

// Função principal para inicializar a aplicação
window.AppInitializer.init = async function () {
  try {
    // Verificar se já foi inicializado
    if (window.AppInitializer.state.isInitialized) {
      return;
    }

    // Garantir que os módulos necessários estejam carregados
    await window.AppInitializer.ensureModulesLoaded();

    // Executar passos de inicialização
    await window.AppInitializer.executeInitializationSteps();

    // Marcar como inicializado
    window.AppInitializer.state.isInitialized = true;
  } catch (error) {
    console.error("Erro ao inicializar aplicação:", error);
    throw error;
  }
};

// Função para garantir que os módulos necessários estejam carregados
window.AppInitializer.ensureModulesLoaded = async function () {
  // Verificar se os módulos já estão disponíveis antes de tentar carregar
  const authAlreadyLoaded = !!(window.AuthCore && window.UserAuth);
  const coreAlreadyLoaded = !!(window.UserProfile && window.UserAvatar);

  // Carregar módulos de autenticação primeiro (necessário para UserProfile)
  if (window.ModuleLoader && window.ModuleLoader.loadModuleGroup) {
    if (!authAlreadyLoaded) {
      try {
        await window.ModuleLoader.loadModuleGroup("auth");
      } catch (error) {
        console.error("Erro ao carregar módulos de autenticação:", error);
      }
    }
  }

  // Carregar módulos core (inclui UserProfile, UserAvatar, etc)
  if (window.ModuleLoader && window.ModuleLoader.loadModuleGroup) {
    if (!coreAlreadyLoaded) {
      try {
        await window.ModuleLoader.loadModuleGroup("core");
      } catch (error) {
        console.error("Erro ao carregar módulos core:", error);
      }
    }
  }
};

// Função para executar passos de inicialização
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
      // Adicionar timeout para cada passo para evitar travamento
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Timeout em ${step.name}`)), 15000);
      });

      await Promise.race([step.func(), timeoutPromise]);
      window.AppInitializer.state.initializationSteps.push({
        name: step.name,
        status: "success",
        timestamp: new Date(),
      });
    } catch (error) {
      console.error(`Erro em ${step.name}:`, error);
      window.AppInitializer.state.initializationSteps.push({
        name: step.name,
        status: "error",
        error: error.message,
        timestamp: new Date(),
      });
      // Continuar com os próximos passos mesmo se um falhar
      // Se for erro de carregamento de dados do usuário, atualizar interface
      if (step.name === "Carregar dados do usuário") {
        const userNameElement = document.getElementById("userName");
        const userEmailElement = document.getElementById("userEmail");
        if (
          userNameElement &&
          userNameElement.textContent === "Carregando..."
        ) {
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
      }
    }
  }
};

// Função para forçar sidebar aberta
window.AppInitializer.forceOpenSidebar = function () {
  if (window.Sidebar && window.Sidebar.forceOpen) {
    window.Sidebar.forceOpen();
  }
};

// Função para carregar dados do usuário
window.AppInitializer.loadUserData = async function () {
  // Fallback: se após 12 segundos ainda estiver "Carregando...", atualizar para erro
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
      // Garantir que a interface não fique travada
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
    // Atualizar interface mesmo se o módulo não estiver disponível
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

// Função para carregar avatar do usuário
window.AppInitializer.loadUserAvatar = async function () {
  if (window.UserAvatar && window.UserAvatar.getUserAvatar) {
    await window.UserAvatar.getUserAvatar();
  }
};

// Função para carregar tela inicial
window.AppInitializer.loadWelcomeScreen = async function () {
  try {
    const welcomeScreen = document.getElementById("welcomeScreen");
    if (!welcomeScreen) return;

    welcomeScreen.style.display = "flex";
  } catch (error) {
    console.error("Erro ao carregar tela inicial:", error);
  }
};

// Função para inicializar botões de ferramentas
window.AppInitializer.initToolButtons = function () {
  if (window.ToolManager && window.ToolManager.initToolButtons) {
    window.ToolManager.initToolButtons();
  }
};

// Função para inicializar sistema de abas
window.AppInitializer.initTabSystem = function () {
  if (window.TabManager && window.TabDragDrop) {
    // Inicializar drag and drop
    if (window.TabDragDrop.init) {
      window.TabDragDrop.init();
    }
  }
};

// Função para inicializar dropdown do usuário
window.AppInitializer.initUserDropdown = function () {
  const userProfileButton = document.getElementById("userProfileButton");
  const template = document.getElementById("userDropdownTemplate");

  if (!userProfileButton || !template) {
    return;
  }

  // Inicializar o Tippy
  const tippyInstance = tippy(userProfileButton, {
    content: template.content.cloneNode(true),
    placement: "top-end",
    trigger: "click",
    interactive: true,
    theme: "user-dropdown",
    arrow: false,
    offset: [0, 8],
    animation: "fade",
    appendTo: () => document.body,
    onShow(instance) {
      // Atualizar os dados do usuário no dropdown
      const content = instance.popper.querySelector(".user-dropdown");
      const userNamePreview = content.querySelector("#userNamePreview");
      const userStatusDot = content.querySelector("#userStatusDot");
      const userStatusText = content.querySelector("#userStatusText");
      const userPhotoPreview = content.querySelector("#userPhotoPreview");

      // Copiar dados do perfil principal para o dropdown
      const userNameElement = document.getElementById("userName");
      const userName = userNameElement ? userNameElement.textContent : "";
      const userStatusElement = document.getElementById("userStatus");
      const userStatus = userStatusElement
        ? userStatusElement.classList.contains("active")
        : false;
      const userAvatarElement = document.getElementById("userAvatar");
      const userAvatar = userAvatarElement ? userAvatarElement.innerHTML : "";

      if (userNamePreview) userNamePreview.textContent = userName;
      if (userStatusDot) userStatusDot.classList.toggle("active", userStatus);
      if (userStatusText)
        userStatusText.textContent = userStatus ? "Ativo" : "Inativo";
      if (userPhotoPreview) userPhotoPreview.innerHTML = userAvatar;
    },
    onMount(instance) {
      // Atualizar os IDs dos elementos clonados
      const content = instance.popper.querySelector(".user-dropdown");
      const updatePhotoBtn = content.querySelector("[id='updatePhotoButton']");
      const logoutBtn = content.querySelector("[id='logoutButton']");

      // Adicionar eventos aos botões
      if (updatePhotoBtn) {
        updatePhotoBtn.addEventListener("click", () => {
          const photoModal = document.getElementById("photoModal");
          if (photoModal) {
            window.Modals.showModal("photoModal");
            instance.hide(); // Fechar o dropdown
          }
        });
      }

      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          if (window.UserAuth && window.UserAuth.logout) {
            window.UserAuth.logout();
          } else {
            // Fallback para logout manual
            document.cookie =
              "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.replace("/");
          }
        });
      }
    },
  });
};

// Função para inicializar modais
window.AppInitializer.initModals = function () {
  if (window.Modals && window.Modals.init) {
    window.Modals.init();
  }
};

// Função para inicializar sidebar
window.AppInitializer.initSidebar = function () {
  if (window.Sidebar && window.Sidebar.init) {
    window.Sidebar.init();
    window.Sidebar.addPersistentEvents();
  }
};

// Função para obter status da inicialização
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

// Função para reinicializar aplicação
window.AppInitializer.reinitialize = async function () {
  window.AppInitializer.state.isInitialized = false;
  window.AppInitializer.state.initializationSteps = [];

  await window.AppInitializer.init();
};

// Inicialização automática apenas em páginas protegidas
// Verificar se o ModuleLoader está gerenciando a inicialização
// Se estiver na página /home, o ModuleLoader.loadHomePage() já vai chamar init()
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
