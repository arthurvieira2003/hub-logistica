// Namespace para utilitários de autenticação
window.AuthUtils = window.AuthUtils || {};

/**
 * Função para validar expiração do token (substitui validateTokenExpiration do index.js)
 */
window.AuthUtils.validateTokenExpiration = async function () {
  const token = window.AuthCore.getToken();

  if (!token) {
    return null;
  }

  const userData = await window.AuthCore.validateToken(token);

  if (!userData) {
    return null;
  }

  if (window.AuthCore.isTokenExpired(userData)) {
    return null;
  }

  return userData;
};

/**
 * Função para fazer logout (substitui a lógica do index.js)
 */
window.AuthUtils.logout = function () {
  // Remover o token do cookie
  window.AuthCore.removeToken();

  // Redirecionar para login
  window.AuthCore.redirectToLogin("Logout realizado com sucesso.");
};

/**
 * Função para obter avatar do usuário (substitui getUserAvatar do index.js)
 */
window.AuthUtils.getUserAvatar = async function () {
  try {
    const userData = await window.AuthUtils.validateTokenExpiration();

    if (!userData) {
      return null;
    }

    const userEmail = userData.email;
    const token = window.AuthCore.getToken();

    const response = await fetch(
      `http://localhost:4010/user/avatar/${encodeURIComponent(userEmail)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );

    if (response.ok) {
      const avatarData = await response.json();

      return avatarData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("❌ Erro ao obter avatar:", error);
    return null;
  }
};

/**
 * Função para atualizar perfil do usuário (substitui lógica do index.js)
 */
window.AuthUtils.updateUserProfile = function (userData) {
  // Atualizar elementos do DOM com dados do usuário
  const userNameElement = document.getElementById("userName");
  const userEmailElement = document.getElementById("userEmail");
  const userInitialsElement = document.getElementById("userInitials");

  if (userNameElement) {
    userNameElement.textContent = userData.name || "Usuário";
  }

  if (userEmailElement) {
    userEmailElement.textContent = userData.email || "";
  }

  if (userInitialsElement) {
    userInitialsElement.textContent = window.AuthUtils.getInitials(
      userData.name
    );
  }
};

/**
 * Função para obter iniciais do nome (substitui getInitials do index.js)
 */
window.AuthUtils.getInitials = function (name) {
  if (!name) return "";

  const words = name.trim().split(" ");
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

/**
 * Função para carregar dados do usuário (substitui loadUserData do index.js)
 */
window.AuthUtils.loadUserData = async function () {
  try {
    const userData = await window.AuthUtils.validateTokenExpiration();

    if (userData) {
      window.AuthUtils.updateUserProfile(userData);
      return userData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("❌ Erro ao carregar dados do usuário:", error);
    return null;
  }
};
