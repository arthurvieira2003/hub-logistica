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

    // Executar passos de inicialização
    await window.AppInitializer.executeInitializationSteps();

    // Marcar como inicializado
    window.AppInitializer.state.isInitialized = true;
  } catch (error) {
    console.error("❌ Erro ao inicializar aplicação principal:", error);
    throw error;
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
      name: "Carregar dashboard inicial",
      func: window.AppInitializer.loadWelcomeDashboard,
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
      await step.func();
      window.AppInitializer.state.initializationSteps.push({
        name: step.name,
        status: "success",
        timestamp: new Date(),
      });
    } catch (error) {
      console.error(`❌ Erro em ${step.name}:`, error);
      window.AppInitializer.state.initializationSteps.push({
        name: step.name,
        status: "error",
        error: error.message,
        timestamp: new Date(),
      });
      // Continuar com os próximos passos mesmo se um falhar
    }
  }
};

// Função para forçar sidebar aberta
window.AppInitializer.forceOpenSidebar = function () {
  if (window.Sidebar && window.Sidebar.forceOpen) {
    window.Sidebar.forceOpen();
  } else {
    console.warn("⚠️ Sidebar module não está disponível");
  }
};

// Função para carregar dados do usuário
window.AppInitializer.loadUserData = async function () {
  if (window.UserProfile && window.UserProfile.loadUserData) {
    await window.UserProfile.loadUserData();
  } else {
    console.warn("⚠️ UserProfile module não está disponível");
  }
};

// Função para carregar avatar do usuário
window.AppInitializer.loadUserAvatar = async function () {
  if (window.UserAvatar && window.UserAvatar.getUserAvatar) {
    await window.UserAvatar.getUserAvatar();
  } else {
    console.warn("⚠️ UserAvatar module não está disponível");
  }
};

// Função para carregar dashboard inicial
window.AppInitializer.loadWelcomeDashboard = async function () {
  try {
    const welcomeScreen = document.getElementById("welcomeScreen");
    if (welcomeScreen) {
      // Esconder a tela de boas-vindas inicialmente
      welcomeScreen.style.display = "none";
    }
  } catch (error) {
    console.error("❌ Erro ao carregar tela inicial:", error);
  }
};

// Função para inicializar botões de ferramentas
window.AppInitializer.initToolButtons = function () {
  if (window.ToolManager && window.ToolManager.initToolButtons) {
    window.ToolManager.initToolButtons();
  } else {
    console.warn("⚠️ ToolManager module não está disponível");
  }
};

// Função para inicializar sistema de abas
window.AppInitializer.initTabSystem = function () {
  if (window.TabManager && window.TabDragDrop) {
    // Inicializar drag and drop
    if (window.TabDragDrop.init) {
      window.TabDragDrop.init();
    }

    // Adicionar aba do dashboard
    if (window.TabManager.createDashboardTab) {
      window.TabManager.createDashboardTab();
    }
  } else {
    console.warn("⚠️ TabManager ou TabDragDrop modules não estão disponíveis");
  }
};

// Função para inicializar dropdown do usuário
window.AppInitializer.initUserDropdown = function () {
  const userProfileButton = document.getElementById("userProfileButton");
  const template = document.getElementById("userDropdownTemplate");

  if (!userProfileButton || !template) {
    console.warn("⚠️ Elementos do dropdown do usuário não encontrados");
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
  } else {
    console.warn("⚠️ Modals module não está disponível");
  }
};

// Função para inicializar sidebar
window.AppInitializer.initSidebar = function () {
  if (window.Sidebar && window.Sidebar.init) {
    window.Sidebar.init();
    window.Sidebar.addPersistentEvents();
  } else {
    console.warn("⚠️ Sidebar module não está disponível");
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
