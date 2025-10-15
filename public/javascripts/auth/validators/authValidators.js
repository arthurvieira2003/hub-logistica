// Namespace para validadores de autenticação
window.AuthValidators = window.AuthValidators || {};

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
    window.AuthCore.redirectToHome();
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

/**
 * Validador administrativo - verifica token e permissões de admin
 * Usado pelo admin-check.js (já refatorado, mas pode ser consolidado)
 */
window.AuthValidators.adminCheck = async function () {
  const token = window.AuthCore.getToken();

  if (!token) {
    window.AuthCore.redirectToHome(
      "Você precisa estar logado para acessar o painel administrativo."
    );
    return false;
  }

  window.AuthUI.showLoading("Verificando permissões...");

  try {
    const userData = await window.AuthCore.validateToken(token);

    if (!userData) {
      window.AuthUI.hideLoading();
      window.AuthCore.redirectToHome("Sessão inválida. Faça login novamente.");
      return false;
    }

    if (window.AuthCore.isTokenExpired(userData)) {
      window.AuthUI.hideLoading();
      window.AuthCore.redirectToHome(
        "Sua sessão expirou. Faça login novamente."
      );
      return false;
    }

    if (!userData.isAdmin) {
      window.AuthUI.hideLoading();
      window.AuthCore.redirectToHome(
        "Você não tem permissão para acessar o painel administrativo."
      );
      return false;
    }

    window.AuthUI.hideLoading();
    return true;
  } catch (error) {
    console.error("❌ Erro ao validar acesso administrativo:", error);
    window.AuthUI.hideLoading();
    window.AuthCore.redirectToHome(
      "Erro ao verificar suas permissões. Tente novamente."
    );
    return false;
  }
};
