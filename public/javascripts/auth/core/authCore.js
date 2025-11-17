window.AuthCore = window.AuthCore || {};

// Cache de validação de token para evitar requisições duplicadas
window.AuthCore.tokenCache = {
  data: null,
  timestamp: null,
  ttl: 5000, // 5 segundos de cache
  isValid: function() {
    if (!this.data || !this.timestamp) return false;
    const now = Date.now();
    return (now - this.timestamp) < this.ttl;
  },
  set: function(data) {
    this.data = data;
    this.timestamp = Date.now();
  },
  get: function() {
    return this.isValid() ? this.data : null;
  },
  clear: function() {
    this.data = null;
    this.timestamp = null;
  }
};

window.AuthCore.getToken = function () {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
};

window.AuthCore.setToken = function (token) {
  document.cookie = `token=${token}; path=/`;
};

window.AuthCore.removeToken = function () {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  // Limpar cache ao remover token
  window.AuthCore.tokenCache.clear();
};

window.AuthCore.isAuthenticated = function () {
  const token = window.AuthCore.getToken();
  return token && token !== "undefined" && token !== "null";
};

window.AuthCore.redirectToLogin = function () {
  if (!window.AuthCore.isAuthenticated()) {
    window.location.href = "/";
  }
};

window.AuthCore.checkAuth = function () {
  if (!window.AuthCore.isAuthenticated()) {
    window.AuthCore.redirectToLogin();
    return false;
  }
  return true;
};

window.AuthCore.validateToken = async function (token) {
  // Verificar cache primeiro
  const cachedData = window.AuthCore.tokenCache.get();
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const API_BASE_URL = (window.getApiBaseUrl && window.getApiBaseUrl()) || 
                           (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || 
                           "http://localhost:4010";
      const response = await fetch(`${API_BASE_URL}/session/validate`, {
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

      const data = await response.json();
      
      // Armazenar no cache
      window.AuthCore.tokenCache.set(data);
      
      return data;
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

window.AuthCore.isTokenExpired = function (userData) {
  if (!userData || !userData.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime > userData.exp;
};

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

window.AuthCore.logout = function () {
  window.AuthCore.removeToken();

  window.AuthCore.redirectToLogin("Logout realizado com sucesso.");
};

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

window.UserAuth = window.AuthCore;
window.AuthUtils = window.AuthCore;
