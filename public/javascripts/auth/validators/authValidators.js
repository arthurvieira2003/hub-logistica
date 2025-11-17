window.AuthValidators = window.AuthValidators || {};

window.AuthValidators.validateRequiredFields = function (email, password) {
  if (!email || !password) {
    if (window.LoginUI && window.LoginUI.showNotification) {
      window.LoginUI.showNotification(
        "warning",
        "Campos obrigatórios",
        "Por favor, preencha todos os campos.",
        4000
      );
    }
    return false;
  }
  return true;
};

window.AuthValidators.validateEmail = function (email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    if (window.LoginUI && window.LoginUI.showNotification) {
      window.LoginUI.showNotification(
        "warning",
        "Email inválido",
        "Por favor, insira um email válido.",
        4000
      );
    }
    return false;
  }
  return true;
};

window.AuthValidators.validateLoginData = function (email, password) {
  if (!window.AuthValidators.validateRequiredFields(email, password)) {
    return false;
  }

  if (!window.AuthValidators.validateEmail(email)) {
    return false;
  }

  return true;
};

window.AuthValidators.validateRegisterData = function (
  email,
  password,
  confirmPassword
) {
  if (!email || !password || !confirmPassword) {
    if (window.LoginUI && window.LoginUI.showNotification) {
      window.LoginUI.showNotification(
        "warning",
        "Campos obrigatórios",
        "Por favor, preencha todos os campos.",
        4000
      );
    }
    return false;
  }

  if (!window.AuthValidators.validateEmail(email)) {
    return false;
  }

  if (password !== confirmPassword) {
    if (window.LoginUI && window.LoginUI.showNotification) {
      window.LoginUI.showNotification(
        "warning",
        "Senhas não coincidem",
        "As senhas informadas não são iguais.",
        4000
      );
    }
    return false;
  }

  if (password.length < 6) {
    if (window.LoginUI && window.LoginUI.showNotification) {
      window.LoginUI.showNotification(
        "warning",
        "Senha muito curta",
        "A senha deve ter pelo menos 6 caracteres.",
        4000
      );
    }
    return false;
  }

  return true;
};

window.AuthValidators.basicTokenCheck = function () {
  const token = window.AuthCore.getToken();

  if (!token) {
    window.AuthCore.redirectToLogin(
      "Você precisa estar logado para acessar esta página."
    );
    return false;
  }

  return true;
};

window.AuthValidators.advancedTokenCheck = async function () {
  const token = window.AuthCore.getToken();

  if (!token) {
    return false;
  }

  window.AuthUI.showLoading("Verificando sessão...");

  try {
    const userData = await window.AuthCore.validateToken(token);

    if (!userData) {
      window.AuthUI.hideLoading();
      return false;
    }

    if (window.AuthCore.isTokenExpired(userData)) {
      window.AuthUI.hideLoading();
      return false;
    }

    window.AuthUI.hideLoading();
    window.location.href = "/home";
    return true;
  } catch (error) {
    console.error("❌ Erro ao validar token:", error);
    window.AuthUI.hideLoading();
    return false;
  }
};

window.AuthValidators.protectedPageCheck = async function () {
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

window.AuthValidators.adminCheck = async function () {
  const token = window.AuthCore.getToken();

  if (!token) {
    window.location.href = "/home";
    return false;
  }

  window.AuthUI.showLoading("Verificando permissões...");

  try {
    const userData = await window.AuthCore.validateToken(token);

    if (!userData) {
      window.AuthUI.hideLoading();
      window.location.href = "/home";
      return false;
    }

    if (window.AuthCore.isTokenExpired(userData)) {
      window.AuthUI.hideLoading();
      window.location.href = "/home";
      return false;
    }

    if (!userData.isAdmin) {
      window.AuthUI.hideLoading();
      window.location.href = "/home";
      return false;
    }

    window.AuthUI.hideLoading();
    return true;
  } catch (error) {
    console.error("❌ Erro ao validar acesso administrativo:", error);
    window.AuthUI.hideLoading();
    window.location.href = "/home";
    return false;
  }
};

window.AuthValidators.validateAdminAccess = window.AuthValidators.adminCheck;

window.AuthValidators.getToken = function () {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
};

window.AuthValidators.validateToken = async function (token) {
  const API_BASE_URL = (window.getApiBaseUrl && window.getApiBaseUrl()) || 
                       (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || 
                       "http://localhost:4010";
  const response = await fetch(`${API_BASE_URL}/session/validate`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  });

  if (!response.ok) {
    return null;
  }

  const userData = await response.json();
  return userData;
};

window.AuthValidators.isTokenExpired = function (userData) {
  const expToken = userData.exp;
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime >= expToken;
};

window.AuthValidators.redirectToHome = function (message) {
  if (window.AuthUI && window.AuthUI.hideLoading) {
    window.AuthUI.hideLoading();
  }
  if (window.AdminAuthUI && window.AdminAuthUI.hideLoading) {
    window.AdminAuthUI.hideLoading();
  }

  localStorage.setItem("auth_error", message);
  window.location.href = "/home";
};

window.LoginValidation = window.AuthValidators;
window.AdminAuthValidator = window.AuthValidators;
