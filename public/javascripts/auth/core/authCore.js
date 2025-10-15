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
