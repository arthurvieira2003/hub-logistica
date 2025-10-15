// Namespace para validação de autenticação administrativa
window.AdminAuthValidator = window.AdminAuthValidator || {};

/**
 * Valida se o usuário tem acesso administrativo
 */
window.AdminAuthValidator.validateAdminAccess = async function () {
  try {
    // Verifica se existe um token
    const token = window.AdminAuthValidator.getToken();

    if (!token) {
      window.AdminAuthValidator.redirectToHome(
        "Você precisa estar logado para acessar o painel administrativo."
      );
      return false;
    }

    // Verificar token e permissões de administrador
    const userData = await window.AdminAuthValidator.validateToken(token);

    if (!userData) {
      window.AdminAuthValidator.redirectToHome(
        "Sessão inválida. Faça login novamente."
      );
      return false;
    }

    // Verificar se o token está expirado
    if (window.AdminAuthValidator.isTokenExpired(userData)) {
      window.AdminAuthValidator.redirectToHome(
        "Sua sessão expirou. Faça login novamente."
      );
      return false;
    }

    // Verificar se o usuário é administrador
    if (!userData.isAdmin) {
      window.AdminAuthValidator.redirectToHome(
        "Você não tem permissão para acessar o painel administrativo."
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Erro ao validar acesso administrativo:", error);
    window.AdminAuthValidator.redirectToHome(
      "Erro ao verificar suas permissões. Tente novamente."
    );
    return false;
  }
};

/**
 * Extrai o token dos cookies
 */
window.AdminAuthValidator.getToken = function () {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
};

/**
 * Valida o token com o servidor
 */
window.AdminAuthValidator.validateToken = async function (token) {
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
 * Verifica se o token está expirado
 */
window.AdminAuthValidator.isTokenExpired = function (userData) {
  const expToken = userData.exp;
  const currentTime = Math.floor(Date.now() / 1000);

  return currentTime >= expToken;
};

/**
 * Redireciona para home com mensagem de erro
 */
window.AdminAuthValidator.redirectToHome = function (message) {
  // Garantir que o overlay seja removido antes do redirecionamento
  window.AdminAuthUI.hideLoading();

  localStorage.setItem("auth_error", message);
  window.location.replace("/home");
};
