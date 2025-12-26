window.AuthCore = window.AuthCore || {};

window.AuthCore.tokenCache = {
  data: null,
  timestamp: null,
  ttl: 5000,
  isValid: function () {
    if (!this.data || !this.timestamp) return false;
    const now = Date.now();
    return now - this.timestamp < this.ttl;
  },
  set: function (data) {
    this.data = data;
    this.timestamp = Date.now();
  },
  get: function () {
    return this.isValid() ? this.data : null;
  },
  clear: function () {
    this.data = null;
    this.timestamp = null;
  },
};

window.AuthCore.getToken = function () {
  // Se Keycloak estiver disponível, obter token do Keycloak
  if (window.KeycloakAuth && window.KeycloakAuth.getToken) {
    const keycloakToken = window.KeycloakAuth.getToken();
    if (keycloakToken) {
      return keycloakToken;
    }
  }

  // Fallback para token do cookie
  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  return cookieToken;
};

window.AuthCore.setToken = function (token) {
  if (!token || token === "undefined" || token === "null") {
    console.warn("Tentativa de armazenar token inválido:", token);
    return;
  }

  // Armazenar token no cookie com path=/ para estar disponível em todas as páginas
  document.cookie = `token=${token}; path=/; max-age=86400`; // 24 horas
  console.log("Token armazenado no cookie:", {
    tokenLength: token.length,
    cookieSet: document.cookie.includes("token="),
  });
};

window.AuthCore.removeToken = function () {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.AuthCore.tokenCache.clear();
};

window.AuthCore.isAuthenticated = function () {
  // Verificar primeiro se Keycloak está autenticado
  if (window.KeycloakAuth && window.KeycloakAuth.isAuthenticated()) {
    return true;
  }

  // Fallback para verificação tradicional
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
  console.log("validateToken chamado com token:", {
    hasToken: !!token,
    tokenLength: token?.length,
    tokenPreview: token ? token.substring(0, 50) + "..." : "null",
  });

  if (!token || token === "undefined" || token === "null") {
    console.warn("Token inválido ou ausente");
    return null;
  }

  // Se Keycloak estiver disponível e autenticado, usar dados do Keycloak
  if (window.KeycloakAuth && window.KeycloakAuth.isAuthenticated()) {
    try {
      const userInfo = await window.KeycloakAuth.getUserInfo();
      if (userInfo) {
        window.AuthCore.tokenCache.set(userInfo);
        return userInfo;
      }
    } catch (error) {
      console.error("Erro ao obter informações do Keycloak:", error);
    }
  }

  // Fallback para validação tradicional (cache)
  const cachedData = window.AuthCore.tokenCache.get();
  if (cachedData) {
    console.log("Usando dados do cache");
    return cachedData;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      // Usar endpoint de introspect do Keycloak
      const introspectUrl =
        window.KeycloakAuth?.config?.introspectEndpoint ||
        window.KeycloakAuth?.config?.tokenEndpoint?.replace(
          "/token",
          "/token/introspect"
        ) ||
        "https://auth.copapel.com.br/realms/Operacao/protocol/openid-connect/token/introspect";

      const clientId = window.KeycloakAuth?.config?.clientId || "hublogistica";
      const clientSecret =
        window.KeycloakAuth?.config?.clientSecret ||
        "bUCDRQOHfyNQWzU1Tn33718D0P0jDeMX";

      console.log(
        "Fazendo requisição para validar token via Keycloak introspect:",
        {
          url: introspectUrl,
          clientId: clientId,
          hasToken: !!token,
        }
      );

      // Preparar body em formato x-www-form-urlencoded
      const params = new URLSearchParams({
        token: token,
        client_id: clientId,
        client_secret: clientSecret,
      });

      const response = await fetch(introspectUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("Resposta da validação (introspect):", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na validação:", errorText);
        throw new Error(
          `Falha na validação do token: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const introspectData = await response.json();
      console.log("Dados do introspect:", introspectData);

      // Verificar se o token está ativo
      if (!introspectData.active) {
        console.warn("Token não está ativo");
        return null;
      }

      // Converter dados do introspect para o formato esperado pelo sistema
      const userData = {
        id: introspectData.sub,
        email: introspectData.email,
        name:
          introspectData.name ||
          introspectData.preferred_username ||
          introspectData.email,
        given_name: introspectData.given_name,
        family_name: introspectData.family_name,
        preferred_username: introspectData.preferred_username,
        email_verified: introspectData.email_verified,
        isAdmin:
          introspectData.realm_access?.roles?.includes("admin") ||
          introspectData.resource_access?.[clientId]?.roles?.includes(
            "admin"
          ) ||
          false,
        roles: introspectData.realm_access?.roles || [],
        exp: introspectData.exp,
        iat: introspectData.iat,
        token: token,
      };

      console.log("Dados validados e convertidos:", userData);

      window.AuthCore.tokenCache.set(userData);

      return userData;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Erro na requisição de validação:", fetchError);
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

window.AuthCore.logout = async function () {
  // Se Keycloak estiver disponível, usar logout do Keycloak
  if (window.KeycloakAuth && window.KeycloakAuth.state.isInitialized) {
    window.KeycloakAuth.logout();
    return;
  }

  // Fallback para logout tradicional
  try {
    const token = window.AuthCore.getToken();

    if (token) {
      const API_BASE_URL =
        (window.getApiBaseUrl && window.getApiBaseUrl()) ||
        (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ||
        "https://logistica.copapel.com.br/api";

      try {
        await fetch(`${API_BASE_URL}/session/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });
      } catch (error) {
        console.error("Erro ao encerrar sessão no servidor:", error);
        // Continua com o logout mesmo se houver erro na chamada
      }
    }
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  } finally {
    // Sempre remove o token e redireciona, mesmo se houver erro
    window.AuthCore.removeToken();
    window.location.href = "/";
  }
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
