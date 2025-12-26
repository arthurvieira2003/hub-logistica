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
  realm: "Operacao", // Realm do Keycloak
  clientId: "hublogistica", // Client ID configurado no Keycloak
  clientSecret: "bUCDRQOHfyNQWzU1Tn33718D0P0jDeMX", // Client Secret
  scopes: "openid profile email", // Scopes solicitados
  authorizationEndpoint:
    "https://auth.copapel.com.br/realms/Operacao/protocol/openid-connect/auth",
  tokenEndpoint:
    "https://auth.copapel.com.br/realms/Operacao/protocol/openid-connect/token",
  userInfoEndpoint:
    "https://auth.copapel.com.br/realms/Operacao/protocol/openid-connect/userinfo",
  introspectEndpoint:
    "https://auth.copapel.com.br/realms/Operacao/protocol/openid-connect/token/introspect",
};

window.KeycloakAuth.loadKeycloakScript = async function () {
  // Se já estiver carregado, retornar imediatamente
  if (window.Keycloak) {
    return window.Keycloak;
  }

  // Verificar se já existe um script sendo carregado
  const existingScript = document.querySelector('script[src*="keycloak"]');
  if (existingScript) {
    // Aguardar o script existente carregar
    await new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (window.Keycloak) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout de 5 segundos
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 5000);
    });

    if (window.Keycloak) {
      return window.Keycloak;
    }
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
      // Se já está inicializado, verificar se tem token e restaurar se necessário
      const keycloak = window.KeycloakAuth.state.keycloak;
      if (keycloak && !keycloak.token) {
        // Tentar restaurar token do cookie se não estiver no Keycloak
        const storedToken = window.AuthCore?.getToken();
        if (storedToken) {
          console.log("Restaurando token do cookie para Keycloak");
          keycloak.token = storedToken;
          keycloak.authenticated = true;
          window.KeycloakAuth.state.isAuthenticated = true;
          // Tentar decodificar token
          try {
            const payload = JSON.parse(atob(storedToken.split(".")[1]));
            keycloak.tokenParsed = payload;
            keycloak.subject = payload.sub;
            keycloak.realmAccess = payload.realm_access || {};
            keycloak.resourceAccess = payload.resource_access || {};
          } catch (e) {
            console.warn("Erro ao decodificar token restaurado:", e);
          }
        }
      }
      return window.KeycloakAuth.state.keycloak;
    }

    // Aguardar um pouco caso o wrapper esteja carregando
    if (!window.Keycloak) {
      // Aguardar evento do wrapper se ele estiver sendo carregado
      let keycloakLoaded = false;
      const checkKeycloak = () => {
        if (window.Keycloak) {
          keycloakLoaded = true;
          return true;
        }
        return false;
      };

      // Se não estiver disponível imediatamente, aguardar evento ou tentar carregar
      if (!checkKeycloak()) {
        await new Promise((resolve) => {
          const timeout = setTimeout(() => {
            window.removeEventListener("keycloak-loaded", onKeycloakLoaded);
            resolve();
          }, 2000);

          const onKeycloakLoaded = () => {
            if (checkKeycloak()) {
              clearTimeout(timeout);
              window.removeEventListener("keycloak-loaded", onKeycloakLoaded);
              resolve();
            }
          };

          window.addEventListener("keycloak-loaded", onKeycloakLoaded);
        });

        // Se ainda não estiver disponível, tentar carregar
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
      }
    }

    if (!window.Keycloak) {
      console.error(
        "Biblioteca Keycloak não encontrada após tentativa de carregamento."
      );
      return null;
    }

    // Configurar Keycloak com OIDC provider para usar endpoints customizados
    const keycloak = new Keycloak({
      url: window.KeycloakAuth.config.url,
      realm: window.KeycloakAuth.config.realm,
      clientId: window.KeycloakAuth.config.clientId,
      scope: window.KeycloakAuth.config.scopes,
    });

    window.KeycloakAuth.state.keycloak = keycloak;

    // Verificar se há callback do Keycloak na URL (código de autorização)
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const hasAuthCode = urlParams.has("code") || urlParams.has("state");
    const hasError = urlParams.has("error");
    const errorType = urlParams.get("error");

    // Se houver erro de login_required, limpar a URL e redirecionar para página de login HTML
    if (hasError && errorType === "login_required") {
      console.log(
        "Login necessário detectado - limpando URL e redirecionando para página de login"
      );
      // Limpar parâmetros da URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Redirecionar para página de login HTML do site (não fazer login automático do Keycloak)
      if (
        window.location.pathname !== "/" &&
        !window.location.pathname.includes("login")
      ) {
        window.location.href = "/";
      }
      return keycloak;
    }

    // Configurar callbacks ANTES de inicializar (para capturar o callback)
    keycloak.onAuthSuccess = () => {
      console.log("Keycloak: Autenticação bem-sucedida");
      window.KeycloakAuth.state.isAuthenticated = true;
      window.KeycloakAuth.handleAuthSuccess();
    };

    // Inicializar Keycloak
    // O Keycloak processa automaticamente o código se houver na URL
    // Determinar redirect URI baseado na página atual
    let redirectUri = window.location.origin + window.location.pathname;
    // Se estiver na raiz, usar rastreamento como destino padrão
    if (
      window.location.pathname === "/" ||
      window.location.pathname.includes("login")
    ) {
      redirectUri = window.location.origin + "/rastreamento";
    }

    // Determinar estratégia de inicialização baseada na página
    let onLoadOption;
    if (hasAuthCode) {
      // Se há código na URL, processar o callback
      onLoadOption = "login-required";
    } else if (
      window.location.pathname === "/" ||
      window.location.pathname.includes("login")
    ) {
      // Na página de login/raiz, NÃO fazer check-sso automático
      // Isso evita loops quando não há sessão ativa
      // O usuário fará login manualmente através do formulário HTML
      onLoadOption = undefined; // Não passar onLoad - apenas inicializar sem verificação
    } else {
      // Em outras páginas (como /rastreamento), fazer check-sso para verificar se há sessão
      // Mas só se não estiver já autenticado
      if (
        window.KeycloakAuth.state.isAuthenticated &&
        window.KeycloakAuth.state.keycloak?.token
      ) {
        // Já está autenticado, não precisa fazer check-sso
        onLoadOption = undefined;
        console.log("Já autenticado, pulando check-sso");
      } else {
        // Fazer check-sso para verificar se há sessão ativa
        onLoadOption = "check-sso";
      }
    }

    const initOptions = {
      redirectUri: redirectUri,
      // Desabilitar silent check SSO para evitar problemas de CSP
      // silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
      pkceMethod: "S256",
      checkLoginIframe: false, // Desabilitar iframe de verificação de login
      scope: window.KeycloakAuth.config.scopes,
    };

    // Só adicionar onLoad se não for undefined (página de login)
    if (onLoadOption !== undefined) {
      initOptions.onLoad = onLoadOption;
    }

    console.log("Inicializando Keycloak com opções:", initOptions);
    const authenticated = await keycloak.init(initOptions);
    console.log("Keycloak inicializado, autenticado:", authenticated);

    // Se não estiver autenticado após init, tentar restaurar token do cookie
    if (!authenticated && !keycloak.token) {
      const storedToken = window.AuthCore?.getToken();
      if (
        storedToken &&
        storedToken !== "undefined" &&
        storedToken !== "null"
      ) {
        console.log("Restaurando token do cookie após init do Keycloak");
        keycloak.token = storedToken;
        keycloak.authenticated = true;
        window.KeycloakAuth.state.isAuthenticated = true;
        // Tentar decodificar token
        try {
          const payload = JSON.parse(atob(storedToken.split(".")[1]));
          keycloak.tokenParsed = payload;
          keycloak.subject = payload.sub;
          keycloak.realmAccess = payload.realm_access || {};
          keycloak.resourceAccess = payload.resource_access || {};
          console.log("Token restaurado com sucesso");
        } catch (e) {
          console.warn("Erro ao decodificar token restaurado:", e);
        }
      }
    }

    window.KeycloakAuth.state.isAuthenticated =
      authenticated || !!keycloak.token;
    window.KeycloakAuth.state.isInitialized = true;

    keycloak.onAuthError = (error) => {
      console.error("Erro de autenticação Keycloak:", error);
      window.KeycloakAuth.state.isAuthenticated = false;

      // Se o erro for login_required e não estiver na página de login, redirecionar
      if (
        error?.error === "login_required" &&
        !window.location.pathname.includes("login") &&
        window.location.pathname !== "/"
      ) {
        // Não redirecionar automaticamente aqui para evitar loops
        // O usuário será redirecionado quando tentar acessar uma página protegida
        console.log("Login necessário - aguardando redirecionamento manual");
      }
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

    // Se houver erro na URL após inicialização, limpar e não processar
    const urlParamsAfterInit = new URLSearchParams(
      window.location.hash.substring(1)
    );
    if (
      urlParamsAfterInit.has("error") &&
      urlParamsAfterInit.get("error") === "login_required"
    ) {
      console.log("Erro login_required detectado após init - limpando URL");
      // Limpar parâmetros da URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Se não estiver na página de login, redirecionar
      if (
        window.location.pathname !== "/" &&
        !window.location.pathname.includes("login")
      ) {
        window.location.href = "/";
      }
      return keycloak;
    }

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

  // Determinar redirect URI baseado na página atual
  // Se estiver na raiz ou login, redirecionar para rastreamento após login
  // Caso contrário, manter na página atual
  let redirectUri = options?.redirectUri;
  if (!redirectUri) {
    if (
      window.location.pathname === "/" ||
      window.location.pathname.includes("login")
    ) {
      redirectUri = window.location.origin + "/rastreamento";
    } else {
      redirectUri = window.location.origin + window.location.pathname;
    }
  }

  // Caso contrário, redirecionar para página de login do Keycloak
  keycloak.login({
    redirectUri: redirectUri,
    ...options,
  });
};

// Login direto via API (Direct Access Grants)
window.KeycloakAuth.loginWithCredentials = async function (username, password) {
  try {
    const KEYCLOAK_URL = window.KeycloakAuth.config.url;
    const KEYCLOAK_REALM = window.KeycloakAuth.config.realm;
    const KEYCLOAK_CLIENT_ID = window.KeycloakAuth.config.clientId;
    const KEYCLOAK_CLIENT_SECRET = window.KeycloakAuth.config.clientSecret;

    // Endpoint de token do Keycloak (usar endpoint configurado)
    const tokenUrl =
      window.KeycloakAuth.config.tokenEndpoint ||
      `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;

    // Parâmetros para Direct Access Grant com client secret
    const params = new URLSearchParams({
      grant_type: "password",
      client_id: KEYCLOAK_CLIENT_ID,
      client_secret: KEYCLOAK_CLIENT_SECRET,
      username: username,
      password: password,
      scope: window.KeycloakAuth.config.scopes,
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
    console.log(
      "Login com credenciais bem-sucedido, processando autenticação..."
    );
    await window.KeycloakAuth.handleAuthSuccess();

    // Verificar se realmente está autenticado após processar
    const isAuthenticated = window.KeycloakAuth.isAuthenticated();
    console.log("Status após handleAuthSuccess:", {
      isAuthenticated,
      hasToken: !!keycloak.token,
      tokenLength: keycloak.token?.length,
    });

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
  const stateAuthenticated = window.KeycloakAuth.state.isAuthenticated;
  const keycloakAuthenticated =
    window.KeycloakAuth.state.keycloak?.authenticated === true;
  const hasToken = !!window.KeycloakAuth.getToken();

  // Se tem token, considerar autenticado mesmo se o Keycloak não tiver sessão ativa
  // Isso é necessário porque login via Direct Access Grants não cria sessão no Keycloak
  // O token é válido mesmo sem sessão ativa
  const result = (stateAuthenticated && keycloakAuthenticated) || hasToken;

  console.log("KeycloakAuth.isAuthenticated resultado:", {
    stateAuthenticated,
    keycloakAuthenticated,
    hasToken,
    result,
  });

  return result;
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

    // Fallback: tentar carregar do userInfo endpoint usando o endpoint configurado
    try {
      const userInfoUrl =
        window.KeycloakAuth.config.userInfoEndpoint ||
        keycloak.endpoints.userinfo();
      const response = await fetch(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userInfo = await response.json();
        return {
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name || userInfo.preferred_username || userInfo.email,
          given_name: userInfo.given_name,
          family_name: userInfo.family_name,
          preferred_username: userInfo.preferred_username,
          email_verified: userInfo.email_verified,
          token: keycloak.token,
        };
      }
    } catch (error) {
      console.error("Erro ao buscar userInfo:", error);
    }

    // Se não conseguir obter do endpoint, retornar null
    return null;
  } catch (error) {
    console.error("Erro ao obter informações do usuário:", error);
    return null;
  }
};

window.KeycloakAuth.handleAuthSuccess = function () {
  const keycloak = window.KeycloakAuth.state.keycloak;
  if (!keycloak || !keycloak.token) {
    console.warn("handleAuthSuccess: Keycloak ou token não disponível", {
      keycloak: !!keycloak,
      token: !!keycloak?.token,
    });
    return;
  }

  console.log("handleAuthSuccess: Processando autenticação bem-sucedida");

  // Verificar se há erro na URL antes de processar (evitar loops)
  const urlParams = new URLSearchParams(window.location.hash.substring(1));
  if (urlParams.has("error")) {
    console.log(
      "Erro detectado na URL - não processar autenticação para evitar loops"
    );
    // Limpar parâmetros da URL
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }

  // Armazenar token no formato esperado pelo sistema
  try {
    if (window.AuthCore && window.AuthCore.setToken) {
      window.AuthCore.setToken(keycloak.token);
      console.log("Token armazenado via AuthCore");
    } else {
      document.cookie = `token=${keycloak.token}; path=/`;
      console.log("Token armazenado via cookie");
    }
  } catch (error) {
    console.error("Erro ao armazenar token:", error);
    return;
  }

  // Verificar se realmente está autenticado antes de redirecionar
  const isAuthenticated = window.KeycloakAuth.isAuthenticated();
  console.log("Verificação de autenticação:", {
    isAuthenticated,
    hasToken: !!keycloak.token,
    pathname: window.location.pathname,
  });

  // Se estiver na página de login ou raiz, redirecionar para rastreamento
  // Mas só se realmente estiver autenticado
  if (
    isAuthenticated &&
    (window.location.pathname === "/" ||
      window.location.pathname.includes("login"))
  ) {
    console.log("Redirecionando para /rastreamento");
    // Adicionar pequeno delay para garantir que o token foi processado
    setTimeout(() => {
      window.location.href = "/rastreamento";
    }, 100);
  } else if (!isAuthenticated) {
    console.warn("handleAuthSuccess: Não autenticado, não redirecionando");
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

// Não inicializar automaticamente - será inicializado pelos módulos que precisam (loginMain, appInitializer, etc.)
// Isso evita inicializações duplicadas e problemas de timing
