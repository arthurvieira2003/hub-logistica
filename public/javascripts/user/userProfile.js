window.UserProfile = window.UserProfile || {};

window.UserProfile.state = {
  userData: null,
  isLoaded: false,
};

window.UserProfile.loadUserData = async function () {
  // Funções auxiliares
  const isAuthModuleAvailable = () => {
    return !!(window.AuthCore || window.UserAuth);
  };

  const waitForAuthModule = async () => {
    if (isAuthModuleAvailable()) return true;
    await new Promise((resolve) => setTimeout(resolve, 500));
    return isAuthModuleAvailable();
  };

  const showAuthModuleError = () => {
    const userNameElement = document.getElementById("userName");
    const userEmailElement = document.getElementById("userEmail");
    if (userNameElement) userNameElement.textContent = "Erro ao carregar";
    if (userEmailElement) {
      userEmailElement.textContent = "Módulo de autenticação não disponível";
    }
  };

  const showUserNotFoundError = () => {
    const userNameElement = document.getElementById("userName");
    const userEmailElement = document.getElementById("userEmail");
    if (userNameElement) {
      userNameElement.textContent = "Usuário não encontrado";
    }
    if (userEmailElement) {
      userEmailElement.textContent = "Faça login novamente";
    }
  };

  const getErrorMessage = (error) => {
    const errorMessage = error.message || "Erro desconhecido";
    if (
      errorMessage.includes("Timeout") ||
      errorMessage.includes("timeout")
    ) {
      return "Timeout - tente novamente";
    }
    if (
      errorMessage.includes("Failed to fetch") ||
      errorMessage.includes("NetworkError")
    ) {
      return "Sem conexão com servidor";
    }
    return "Erro ao carregar dados";
  };

  const showLoadError = (error) => {
    const userNameElement = document.getElementById("userName");
    const userEmailElement = document.getElementById("userEmail");
    if (userNameElement) {
      userNameElement.textContent = "Erro ao carregar";
    }
    if (userEmailElement) {
      userEmailElement.textContent = getErrorMessage(error);
    }
  };

  const handleSuccessfulLoad = (userData) => {
    window.UserProfile.state.userData = userData;
    window.UserProfile.state.isLoaded = true;
    window.UserProfile.updateUserProfile(userData);
    return userData;
  };

  // Função principal
  try {
    const authModuleAvailable = await waitForAuthModule();
    if (!authModuleAvailable) {
      showAuthModuleError();
      return null;
    }

    const authModule = window.AuthCore || window.UserAuth;
    const userData = await authModule.validateTokenExpiration();

    if (userData) {
      return handleSuccessfulLoad(userData);
    }

    showUserNotFoundError();
    window.UserProfile.state.isLoaded = true;
  } catch (error) {
    console.error("Erro ao carregar dados do usuário:", error);
    showLoadError(error);
    window.UserProfile.state.isLoaded = true;
  }
};

window.UserProfile.updateUserProfile = function (userData) {
  const userNameElement = document.getElementById("userName");
  if (userNameElement) {
    userNameElement.textContent = userData.name;
  }

  const userNamePreviewElement = document.getElementById("userNamePreview");
  if (userNamePreviewElement) {
    userNamePreviewElement.textContent = userData.name;
  }

  const userEmailElement = document.getElementById("userEmail");
  if (userEmailElement) {
    userEmailElement.textContent = userData.email;
  }

  window.UserProfile.updateUserStatus(userData);

  window.UserProfile.updateUserAvatar(userData);

  if (userData.isAdmin) {
    window.UserProfile.addAdminPanelOption();
  }
};

window.UserProfile.updateUserStatus = function (userData) {
  const userStatusElement = document.getElementById("userStatus");
  const userStatusDotElement = document.getElementById("userStatusDot");
  const userStatusTextElement = document.getElementById("userStatusText");

  const isActive = userData.status === "active";

  if (userStatusElement) {
    if (isActive) {
      userStatusElement.classList.add("active");
    } else {
      userStatusElement.classList.add("inactive");
    }
  }

  if (userStatusDotElement) {
    if (isActive) {
      userStatusDotElement.classList.add("active");
    }
  }

  if (userStatusTextElement) {
    userStatusTextElement.textContent = isActive ? "Ativo" : "Inativo";
  }
};

window.UserProfile.updateUserAvatar = function (userData) {
  const userAvatarElement = document.getElementById("userAvatar");
  const userPhotoPreviewElement = document.getElementById("userPhotoPreview");

  const updatePhotoDisplay = (content) => {
    if (userAvatarElement) {
      userAvatarElement.innerHTML = content;
    }

    if (userPhotoPreviewElement) {
      userPhotoPreviewElement.innerHTML = content;
    }
  };

  if (userData.profile_picture && userData.profile_picture !== null) {
    updatePhotoDisplay(
      `<img src="${userData.profile_picture}" alt="${userData.name}" />`
    );
  } else {
    const initials = window.UserProfile.getInitials(userData.name);
    updatePhotoDisplay(initials);
  }
};

window.UserProfile.getInitials = function (name) {
  if (!name) return "";

  const nameParts = name.split(" ");
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }

  const firstInitial = nameParts[0].charAt(0);
  const lastInitial = nameParts[nameParts.length - 1].charAt(0);

  return (firstInitial + lastInitial).toUpperCase();
};

window.UserProfile.addAdminPanelOption = function () {
  const existingAdminButton = document.querySelector(
    '.tool-button[data-tool="admin"]'
  );
  if (existingAdminButton) {
    return;
  }

  const sidebarNav = document.querySelector(".sidebar-nav");
  if (!sidebarNav) {
    console.error("Sidebar nav não encontrada");
    return;
  }

  const adminButton = document.createElement("div");
  adminButton.className = "tool-button admin-button";
  adminButton.dataset.tool = "admin";
  adminButton.innerHTML = `
    <i class="fas fa-cog"></i>
    <span>Configurações</span>
    <i class="fas fa-external-link-alt"></i>
  `;

  sidebarNav.appendChild(adminButton);

  if (window.ToolManager && window.ToolManager.initToolButtons) {
    window.ToolManager.initToolButtons();
  }
};

window.UserProfile.getUserData = function () {
  return window.UserProfile.state.userData;
};

window.UserProfile.isLoaded = function () {
  return window.UserProfile.state.isLoaded;
};

window.UserProfile.setUserData = function (userData) {
  window.UserProfile.state.userData = userData;
  window.UserProfile.updateUserProfile(userData);
};
