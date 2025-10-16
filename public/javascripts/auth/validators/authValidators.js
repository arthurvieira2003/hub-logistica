// Namespace consolidado para todos os validadores de autenticação
window.AuthValidators = window.AuthValidators || {};

// ============================================================================
// VALIDAÇÃO DE FORMULÁRIOS (do loginValidation.js)
// ============================================================================

/**
 * Valida se os campos obrigatórios estão preenchidos
 */
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

/**
 * Valida formato do email
 */
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

/**
 * Valida dados do formulário de login
 */
window.AuthValidators.validateLoginData = function (email, password) {
  // Validar campos obrigatórios
  if (!window.AuthValidators.validateRequiredFields(email, password)) {
    return false;
  }

  // Validar formato do email
  if (!window.AuthValidators.validateEmail(email)) {
    return false;
  }

  return true;
};

/**
 * Valida dados do formulário de registro
 */
window.AuthValidators.validateRegisterData = function (
  email,
  password,
  confirmPassword
) {
  // Validar campos obrigatórios
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

  // Validar formato do email
  if (!window.AuthValidators.validateEmail(email)) {
    return false;
  }

  // Validar senhas
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

  // Validar força da senha
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

// ============================================================================
// VALIDAÇÃO DE TOKENS E SESSÕES (do authValidators.js original)
// ============================================================================

/**
 * Validador básico - apenas verifica se existe token
 * Usado pelo auth-check.js original
 */
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

/**
 * Validador avançado - verifica token e valida com servidor
 * Usado pelo login-check.js original
 */
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

/**
 * Validador para páginas protegidas - verifica token válido
 * Usado pelo index.js para validateTokenExpiration
 */
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

// ============================================================================
// VALIDAÇÃO ADMINISTRATIVA (consolidado do authValidator.js)
// ============================================================================

/**
 * Validador administrativo - verifica token e permissões de admin
 * Consolidado do authValidator.js e authValidators.js
 */
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

/**
 * Valida se o usuário tem acesso administrativo (alias para adminCheck)
 * Mantido para compatibilidade com código existente
 */
window.AuthValidators.validateAdminAccess = window.AuthValidators.adminCheck;

// ============================================================================
// MÉTODOS AUXILIARES (consolidados)
// ============================================================================

/**
 * Extrai o token dos cookies (método auxiliar)
 */
window.AuthValidators.getToken = function () {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
};

/**
 * Valida o token com o servidor (método auxiliar)
 */
window.AuthValidators.validateToken = async function (token) {
  const response = await fetch("http://localhost:4010/session/validate", {
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

/**
 * Verifica se o token está expirado (método auxiliar)
 */
window.AuthValidators.isTokenExpired = function (userData) {
  const expToken = userData.exp;
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime >= expToken;
};

/**
 * Redireciona para home com mensagem de erro (método auxiliar)
 */
window.AuthValidators.redirectToHome = function (message) {
  // Garantir que o overlay seja removido antes do redirecionamento
  if (window.AuthUI && window.AuthUI.hideLoading) {
    window.AuthUI.hideLoading();
  }
  if (window.AdminAuthUI && window.AdminAuthUI.hideLoading) {
    window.AdminAuthUI.hideLoading();
  }

  localStorage.setItem("auth_error", message);
  window.location.href = "/home";
};

// ============================================================================
// COMPATIBILIDADE COM CÓDIGO EXISTENTE
// ============================================================================

// Manter compatibilidade com namespaces antigos
window.LoginValidation = window.AuthValidators;
window.AdminAuthValidator = window.AuthValidators;
