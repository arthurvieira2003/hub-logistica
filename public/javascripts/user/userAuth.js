// User Auth Module - Autenticação e validação de usuário
window.UserAuth = window.UserAuth || {};

// Função para validar expiração do token
window.UserAuth.validateTokenExpiration = async function () {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  try {
    const response = await fetch("http://localhost:4010/session/validate", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error("Falha na validação do token");
    }

    const userData = await response.json();
    const expToken = userData.exp;
    const currentTime = Math.floor(Date.now() / 1000);

    if (currentTime > expToken) {
      window.location.replace("/");
      return null;
    }

    return userData;
  } catch (error) {
    console.error("❌ Erro ao validar token:", error);
    window.location.replace("/");
    return null;
  }
};

// Função para fazer logout
window.UserAuth.logout = function () {
  // Remover o token do cookie
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  // Redirecionar para a página de login
  window.location.replace("/");
};

// Função para obter token do cookie
window.UserAuth.getToken = function () {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
};

// Função para verificar se o usuário está autenticado
window.UserAuth.isAuthenticated = function () {
  const token = window.UserAuth.getToken();
  return token && token !== "";
};

// Função para fazer requisições autenticadas
window.UserAuth.authenticatedFetch = async function (url, options = {}) {
  const token = window.UserAuth.getToken();

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
