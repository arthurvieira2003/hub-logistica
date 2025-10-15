// User Profile Module - Gerenciamento de perfil do usuário
window.UserProfile = window.UserProfile || {};

// Estado do usuário
window.UserProfile.state = {
  userData: null,
  isLoaded: false,
};

// Função para carregar dados do usuário
window.UserProfile.loadUserData = async function () {
  try {
    const userData = await window.UserAuth.validateTokenExpiration();
    if (userData) {
      window.UserProfile.state.userData = userData;
      window.UserProfile.state.isLoaded = true;
      window.UserProfile.updateUserProfile(userData);
      return userData;
    }
  } catch (error) {
    console.error("❌ Erro ao carregar dados do usuário:", error);
    window.location.replace("/");
  }
};

// Função para atualizar perfil do usuário na interface
window.UserProfile.updateUserProfile = function (userData) {
  // Atualizar nome do usuário
  const userNameElement = document.getElementById("userName");
  if (userNameElement) {
    userNameElement.textContent = userData.name;
  }

  // Atualizar nome do usuário no dropdown
  const userNamePreviewElement = document.getElementById("userNamePreview");
  if (userNamePreviewElement) {
    userNamePreviewElement.textContent = userData.name;
  }

  // Atualizar email do usuário
  const userEmailElement = document.getElementById("userEmail");
  if (userEmailElement) {
    userEmailElement.textContent = userData.email;
  }

  // Atualizar status do usuário
  window.UserProfile.updateUserStatus(userData);

  // Atualizar avatar do usuário
  window.UserProfile.updateUserAvatar(userData);

  // Verificar se o usuário é administrador
  if (userData.isAdmin) {
    window.UserProfile.addAdminPanelOption();
  }
};

// Função para atualizar status do usuário
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

// Função para atualizar avatar do usuário
window.UserProfile.updateUserAvatar = function (userData) {
  const userAvatarElement = document.getElementById("userAvatar");
  const userPhotoPreviewElement = document.getElementById("userPhotoPreview");

  // Função para atualizar a foto em ambos os lugares
  const updatePhotoDisplay = (content) => {
    if (userAvatarElement) {
      userAvatarElement.innerHTML = content;
    }

    if (userPhotoPreviewElement) {
      userPhotoPreviewElement.innerHTML = content;
    }
  };

  // Verificar se há uma foto no banco de dados
  if (userData.profile_picture && userData.profile_picture !== null) {
    // Se houver uma foto no banco de dados, usá-la
    updatePhotoDisplay(
      `<img src="${userData.profile_picture}" alt="${userData.name}" />`
    );
  } else {
    // Caso não haja foto, gerar avatar com as iniciais do nome do usuário
    const initials = window.UserProfile.getInitials(userData.name);
    updatePhotoDisplay(initials);
  }
};

// Função para obter iniciais do nome
window.UserProfile.getInitials = function (name) {
  if (!name) return "";

  const nameParts = name.split(" ");
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }

  // Pegar a primeira letra do primeiro e último nome
  const firstInitial = nameParts[0].charAt(0);
  const lastInitial = nameParts[nameParts.length - 1].charAt(0);

  return (firstInitial + lastInitial).toUpperCase();
};

// Função para adicionar opção de painel administrativo
window.UserProfile.addAdminPanelOption = function () {
  // Verificar se já existe
  const existingAdminButton = document.querySelector(
    '.tool-button[data-tool="admin"]'
  );
  if (existingAdminButton) {
    return;
  }

  // Importar função de administração
  try {
    // Verificar se a função está disponível
    if (typeof addAdminPanelOption === "function") {
      addAdminPanelOption();
    } else {
      console.warn("⚠️ Função addAdminPanelOption não está disponível");
    }
  } catch (error) {
    console.error("❌ Erro ao adicionar painel administrativo:", error);
  }
};

// Função para obter dados do usuário
window.UserProfile.getUserData = function () {
  return window.UserProfile.state.userData;
};

// Função para verificar se os dados foram carregados
window.UserProfile.isLoaded = function () {
  return window.UserProfile.state.isLoaded;
};

// Função para atualizar dados do usuário
window.UserProfile.setUserData = function (userData) {
  window.UserProfile.state.userData = userData;
  window.UserProfile.updateUserProfile(userData);
};
