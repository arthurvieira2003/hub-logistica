// Namespace principal para funcionalidades de autenticação
window.AuthCore = window.AuthCore || {};

/**
 * Extrai o token dos cookies
 */
window.AuthCore.getToken = function () {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
};

/**
 * Define o token nos cookies
 */
window.AuthCore.setToken = function (token) {
  document.cookie = `token=${token}; path=/`;
};

/**
 * Remove o token dos cookies
 */
window.AuthCore.removeToken = function () {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

/**
 * Verifica se o usuário está autenticado
 */
window.AuthCore.isAuthenticated = function () {
  const token = window.AuthCore.getToken();
  return token && token !== "undefined" && token !== "null";
};

/**
 * Redireciona para a página de login se não autenticado
 */
window.AuthCore.redirectToLogin = function () {
  if (!window.AuthCore.isAuthenticated()) {
    window.location.href = "/";
  }
};

/**
 * Verifica autenticação e redireciona se necessário
 */
window.AuthCore.checkAuth = function () {
  if (!window.AuthCore.isAuthenticated()) {
    window.AuthCore.redirectToLogin();
    return false;
  }
  return true;
};

/**
 * Valida token no servidor
 */
window.AuthCore.validateToken = async function (token) {
  try {
    // Criar um AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout

    try {
      const response = await fetch("http://localhost:4010/session/validate", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Falha na validação do token: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        throw new Error("Timeout ao validar token");
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("Erro ao validar token:", error);
    return null;
  }
};

/**
 * Verifica se o token está expirado
 */
window.AuthCore.isTokenExpired = function (userData) {
  if (!userData || !userData.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime > userData.exp;
};

/**
 * Valida expiração do token
 */
window.AuthCore.validateTokenExpiration = async function () {
  const token = window.AuthCore.getToken();

  if (!token) {
    return null;
  }

  const userData = await window.AuthCore.validateToken(token);

  if (!userData) {
    return null;
  }

  const isExpired = window.AuthCore.isTokenExpired(userData);

  if (isExpired) {
    return null;
  }

  return userData;
};

/**
 * Faz logout do usuário
 */
window.AuthCore.logout = function () {
  // Remover o token do cookie
  window.AuthCore.removeToken();

  // Redirecionar para login
  window.AuthCore.redirectToLogin("Logout realizado com sucesso.");
};

/**
 * Faz requisições autenticadas
 */
window.AuthCore.authenticatedFetch = async function (url, options = {}) {
  const token = window.AuthCore.getToken();

  if (!token) {
    throw new Error("Token não encontrado");
  }

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      ...options.headers,
    },
  };

  return fetch(url, { ...options, ...defaultOptions });
};

// ============================================================================
// COMPATIBILIDADE COM CÓDIGO EXISTENTE
// ============================================================================

// Manter compatibilidade com UserAuth (alias para AuthCore)
window.UserAuth = window.AuthCore;

// Manter compatibilidade com AuthUtils (alias para AuthCore)
window.AuthUtils = window.AuthCore;
