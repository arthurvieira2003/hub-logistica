/**
 * Serviço de autenticação Keycloak
 * Integração com Keycloak para autenticação SSO
 */

window.KeycloakAuth = window.KeycloakAuth || {};

window.KeycloakAuth.state = {
  keycloak: null,
  isInitialized: false,
  isAuthenticated: false,
};

// Configuração do Keycloak
window.KeycloakAuth.config = {
  url: "https://auth.copapel.com.br",
  realm: "master", // Realm do Keycloak
  clientId: "hub-logistica", // Client ID configurado no Keycloak
};

window.KeycloakAuth.loadKeycloakScript = async function () {
  // Se já estiver carregado, retornar imediatamente
  if (window.Keycloak) {
    return window.Keycloak;
  }

  const KEYCLOAK_URL = window.KeycloakAuth.config.url;
  const KEYCLOAK_REALM = window.KeycloakAuth.config.realm;

  // Tentar diferentes URLs possíveis (na ordem de mais provável para menos provável)
  // Usar caminho absoluto baseado na origem atual
  const basePath = window.location.origin;
  const possibleUrls = [
    `${basePath}/javascripts/auth/keycloak/keycloak-wrapper.js`, // Wrapper ES6 (prioridade)
    `${basePath}/javascripts/auth/keycloak/keycloak.js`, // Arquivo local
    `${KEYCLOAK_URL}/js/keycloak.js`, // URL padrão do Keycloak
    `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/js/keycloak.js`, // URL específica do realm
    `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/js/keycloak.js`, // URL completa do protocolo
  ];

  // Primeiro, tentar carregar via script tag (método tradicional)
  for (const url of possibleUrls) {
    try {
      const loaded = await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = url;
        script.async = true;

        // Se for o wrapper, usar type="module"
        if (url.includes("keycloak-wrapper.js")) {
          script.type = "module";
        }

        // Aguardar evento de carregamento ou verificar diretamente
        const checkKeycloak = () => {
          if (window.Keycloak) {
            console.log(`Keycloak carregado com sucesso de: ${url}`);
            resolve(true);
            return true;
          }
          return false;
        };

        // Listener para evento de carregamento do wrapper
        const onKeycloakLoaded = () => {
          if (checkKeycloak()) {
            window.removeEventListener("keycloak-loaded", onKeycloakLoaded);
          }
        };
        window.addEventListener("keycloak-loaded", onKeycloakLoaded);

        script.onload = () => {
          // Aguardar um pouco para garantir que o objeto Keycloak está disponível
          let attempts = 0;
          const interval = setInterval(() => {
            if (checkKeycloak() || attempts++ > 50) {
              clearInterval(interval);
              if (!window.Keycloak) {
                resolve(false);
              }
            }
          }, 100);
        };

        script.onerror = () => {
          window.removeEventListener("keycloak-loaded", onKeycloakLoaded);
          resolve(false);
        };

        document.head.appendChild(script);
      });

      if (loaded && window.Keycloak) {
        return window.Keycloak;
      }
    } catch (error) {
      console.warn(`Falha ao carregar Keycloak de: ${url}`, error);
    }
  }

  // Se não funcionou via script tag, tentar via fetch (para contornar CORS se possível)
  for (const url of possibleUrls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const scriptContent = await response.text();
        // Executar o script
        const script = document.createElement("script");
        script.textContent = scriptContent;
        document.head.appendChild(script);

        // Aguardar o objeto Keycloak estar disponível
        let attempts = 0;
        while (!window.Keycloak && attempts < 50) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          attempts++;
        }

        if (window.Keycloak) {
          console.log(`Keycloak carregado via fetch de: ${url}`);
          return window.Keycloak;
        }
      }
    } catch (error) {
      console.warn(`Falha ao carregar Keycloak via fetch de: ${url}`, error);
    }
  }

  // Última tentativa: mostrar instruções detalhadas
  const errorMsg = `
    ❌ Não foi possível carregar o adapter JavaScript do Keycloak.
    
    📋 SOLUÇÕES:
    
    1. Baixe o arquivo keycloak.js manualmente:
       - Acesse: https://auth.copapel.com.br/
       - Vá em: Clients > hub-logistica > Settings > Endpoints
       - Procure por "JavaScript adapter" e copie a URL
       - Baixe o arquivo e coloque em: public/javascripts/auth/keycloak/keycloak.js
    
    2. Ou baixe do container Docker:
       docker cp <container>:/caminho/keycloak.js public/javascripts/auth/keycloak/keycloak.js
    
    3. Veja o arquivo DOWNLOAD_KEYCLOAK_JS.md para mais instruções.
    
    ⚠️ O Keycloak não está servindo o adapter JS nas URLs padrão.
    Você precisa baixá-lo manualmente do servidor Keycloak.
  `;

  console.error(errorMsg);
  alert("Erro ao carregar Keycloak. Veja o console para instruções.");

  throw new Error(
    "Não foi possível carregar o script do Keycloak. " +
      "Consulte DOWNLOAD_KEYCLOAK_JS.md para instruções de download manual."
  );
};

window.KeycloakAuth.init = async function () {
  try {
    if (window.KeycloakAuth.state.isInitialized) {
      return window.KeycloakAuth.state.keycloak;
    }

    // Tentar carregar o script se não estiver disponível
    if (!window.Keycloak) {
      console.log(
        "Keycloak não encontrado, tentando carregar dinamicamente..."
      );
      try {
        await window.KeycloakAuth.loadKeycloakScript();
      } catch (error) {
        console.error("Erro ao carregar Keycloak:", error);
        return null;
      }
    }

    if (!window.Keycloak) {
      console.error(
        "Biblioteca Keycloak não encontrada após tentativa de carregamento."
      );
      return null;
    }

    const keycloak = new Keycloak({
      url: window.KeycloakAuth.config.url,
      realm: window.KeycloakAuth.config.realm,
      clientId: window.KeycloakAuth.config.clientId,
    });

    window.KeycloakAuth.state.keycloak = keycloak;

    // Verificar se há callback do Keycloak na URL (código de autorização)
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const hasAuthCode = urlParams.has("code") || urlParams.has("state");

    // Configurar callbacks ANTES de inicializar (para capturar o callback)
    keycloak.onAuthSuccess = () => {
      console.log("Keycloak: Autenticação bem-sucedida");
      window.KeycloakAuth.state.isAuthenticated = true;
      window.KeycloakAuth.handleAuthSuccess();
    };

    // Inicializar Keycloak
    // O Keycloak processa automaticamente o código se houver na URL
    const initOptions = {
      onLoad: hasAuthCode ? "login-required" : "check-sso",
      silentCheckSsoRedirectUri:
        window.location.origin + "/silent-check-sso.html",
      pkceMethod: "S256",
      checkLoginIframe: false,
    };

    console.log("Inicializando Keycloak com opções:", initOptions);
    const authenticated = await keycloak.init(initOptions);
    console.log("Keycloak inicializado, autenticado:", authenticated);

    window.KeycloakAuth.state.isAuthenticated = authenticated;
    window.KeycloakAuth.state.isInitialized = true;

    keycloak.onAuthError = (error) => {
      console.error("Erro de autenticação Keycloak:", error);
      window.KeycloakAuth.state.isAuthenticated = false;
    };

    keycloak.onTokenExpired = () => {
      console.log("Token expirado, renovando...");
      keycloak
        .updateToken(30)
        .then((refreshed) => {
          if (refreshed) {
            window.KeycloakAuth.handleTokenRefresh();
          }
        })
        .catch(() => {
          window.KeycloakAuth.logout();
        });
    };

    // Se já estiver autenticado, processar
    if (authenticated) {
      await window.KeycloakAuth.handleAuthSuccess();
    } else if (hasAuthCode) {
      // Se há código na URL mas não está autenticado, aguardar um pouco
      // O Keycloak pode estar processando o callback assincronamente
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verificar novamente se está autenticado
      if (keycloak.authenticated) {
        console.log("Keycloak autenticado após processar callback");
        window.KeycloakAuth.state.isAuthenticated = true;
        await window.KeycloakAuth.handleAuthSuccess();
      } else {
        console.warn("Keycloak não autenticado após processar callback");
      }

      // Limpar parâmetros da URL após processar
      if (window.history && window.history.replaceState) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    }

    return keycloak;
  } catch (error) {
    console.error("Erro ao inicializar Keycloak:", error);
    window.KeycloakAuth.state.isInitialized = false;
    return null;
  }
};

window.KeycloakAuth.login = function (options) {
  const keycloak = window.KeycloakAuth.state.keycloak;
  if (!keycloak) {
    console.error("Keycloak não inicializado");
    return;
  }

  // Se opções de login direto foram fornecidas (email/senha), usar API
  if (options && options.username && options.password) {
    return window.KeycloakAuth.loginWithCredentials(
      options.username,
      options.password
    );
  }

  // Caso contrário, redirecionar para página de login do Keycloak
  keycloak.login({
    redirectUri: window.location.origin + "/rastreamento",
    ...options,
  });
};

// Login direto via API (Direct Access Grants)
window.KeycloakAuth.loginWithCredentials = async function (username, password) {
  try {
    const KEYCLOAK_URL = window.KeycloakAuth.config.url;
    const KEYCLOAK_REALM = window.KeycloakAuth.config.realm;
    const KEYCLOAK_CLIENT_ID = window.KeycloakAuth.config.clientId;

    // Endpoint de token do Keycloak
    const tokenUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;

    // Parâmetros para Direct Access Grant
    const params = new URLSearchParams({
      grant_type: "password",
      client_id: KEYCLOAK_CLIENT_ID,
      username: username,
      password: password,
    });

    // Fazer requisição para obter token
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error_description || errorData.error || "Erro ao fazer login"
      );
    }

    const tokenData = await response.json();

    // Inicializar Keycloak se não estiver inicializado
    if (!window.KeycloakAuth.state.isInitialized) {
      await window.KeycloakAuth.init();
    }

    const keycloak = window.KeycloakAuth.state.keycloak;
    if (!keycloak) {
      throw new Error("Keycloak não inicializado");
    }

    // Configurar tokens manualmente
    keycloak.token = tokenData.access_token;
    keycloak.refreshToken = tokenData.refresh_token;
    keycloak.idToken = tokenData.id_token;
    keycloak.authenticated = true;

    // Decodificar token para obter informações
    if (tokenData.access_token) {
      try {
        const payload = JSON.parse(atob(tokenData.access_token.split(".")[1]));
        keycloak.tokenParsed = payload;
        keycloak.subject = payload.sub;
        keycloak.realmAccess = payload.realm_access || {};
        keycloak.resourceAccess = payload.resource_access || {};
      } catch (e) {
        console.warn("Erro ao decodificar token:", e);
      }
    }

    // Atualizar estado
    window.KeycloakAuth.state.isAuthenticated = true;
    window.KeycloakAuth.state.keycloak = keycloak;

    // Processar sucesso
    await window.KeycloakAuth.handleAuthSuccess();

    return tokenData;
  } catch (error) {
    console.error("Erro ao fazer login com credenciais:", error);
    throw error;
  }
};

window.KeycloakAuth.logout = function () {
  const keycloak = window.KeycloakAuth.state.keycloak;
  if (!keycloak) {
    // Fallback: limpar token local e redirecionar
    window.AuthCore?.removeToken();
    window.location.href = "/";
    return;
  }

  keycloak.logout({
    redirectUri: window.location.origin + "/",
  });
};

window.KeycloakAuth.getToken = function () {
  const keycloak = window.KeycloakAuth.state.keycloak;
  if (!keycloak || !keycloak.token) {
    return null;
  }
  return keycloak.token;
};

window.KeycloakAuth.isAuthenticated = function () {
  return (
    window.KeycloakAuth.state.isAuthenticated &&
    window.KeycloakAuth.state.keycloak?.authenticated === true
  );
};

window.KeycloakAuth.getUserInfo = async function () {
  const keycloak = window.KeycloakAuth.state.keycloak;
  if (!keycloak || !keycloak.authenticated) {
    return null;
  }

  try {
    // Obter informações do usuário do token
    const tokenParsed = keycloak.tokenParsed;

    if (tokenParsed) {
      return {
        id: tokenParsed.sub,
        email: tokenParsed.email,
        name:
          tokenParsed.name ||
          tokenParsed.preferred_username ||
          tokenParsed.email,
        given_name: tokenParsed.given_name,
        family_name: tokenParsed.family_name,
        isAdmin:
          tokenParsed.realm_access?.roles?.includes("admin") ||
          tokenParsed.resource_access?.[
            window.KeycloakAuth.config.clientId
          ]?.roles?.includes("admin") ||
          false,
        roles: tokenParsed.realm_access?.roles || [],
        token: keycloak.token,
      };
    }

    // Fallback: tentar carregar do userInfo endpoint
    const userInfo = await keycloak.loadUserInfo();
    return {
      id: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name || userInfo.preferred_username || userInfo.email,
      given_name: userInfo.given_name,
      family_name: userInfo.family_name,
      token: keycloak.token,
    };
  } catch (error) {
    console.error("Erro ao obter informações do usuário:", error);
    return null;
  }
};

window.KeycloakAuth.handleAuthSuccess = function () {
  const keycloak = window.KeycloakAuth.state.keycloak;
  if (!keycloak || !keycloak.token) {
    return;
  }

  // Armazenar token no formato esperado pelo sistema
  if (window.AuthCore && window.AuthCore.setToken) {
    window.AuthCore.setToken(keycloak.token);
  } else {
    document.cookie = `token=${keycloak.token}; path=/`;
  }

  // Se estiver na página de login, redirecionar
  if (
    window.location.pathname === "/" ||
    window.location.pathname.includes("login")
  ) {
    window.location.href = "/rastreamento";
  }
};

window.KeycloakAuth.handleTokenRefresh = function () {
  const keycloak = window.KeycloakAuth.state.keycloak;
  if (!keycloak || !keycloak.token) {
    return;
  }

  // Atualizar token armazenado
  if (window.AuthCore && window.AuthCore.setToken) {
    window.AuthCore.setToken(keycloak.token);
  } else {
    document.cookie = `token=${keycloak.token}; path=/`;
  }
};

window.KeycloakAuth.updateToken = async function (minValidity = 30) {
  const keycloak = window.KeycloakAuth.state.keycloak;
  if (!keycloak) {
    return false;
  }

  try {
    const refreshed = await keycloak.updateToken(minValidity);
    if (refreshed) {
      window.KeycloakAuth.handleTokenRefresh();
    }
    return true;
  } catch (error) {
    console.error("Erro ao atualizar token:", error);
    window.KeycloakAuth.logout();
    return false;
  }
};

// Inicializar automaticamente quando o módulo for carregado
if (typeof window !== "undefined" && window.Keycloak) {
  window.KeycloakAuth.init().catch((error) => {
    console.error("Erro ao inicializar Keycloak automaticamente:", error);
  });
}
