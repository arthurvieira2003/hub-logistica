window.LoginAuth = window.LoginAuth || {};

window.LoginAuth.processServerError = function (error) {
  let errorTitle = "Erro ao fazer login";
  let errorMessage = "Ocorreu um erro ao fazer login. Tente novamente.";

  if (error.data) {
    if (error.data.error) {
      switch (error.data.error) {
        case "Senha inválida":
          errorTitle = "Senha incorreta";
          errorMessage =
            "A senha informada está incorreta. Verifique e tente novamente.";
          break;
        case "Usuário não encontrado":
          errorTitle = "Usuário não encontrado";
          errorMessage =
            "Não encontramos uma conta com este email. Verifique o email informado.";
          break;
        default:
          errorMessage = error.data.error;
      }
    } else if (error.data.message) {
      errorMessage = error.data.message;
    }
  } else if (error.error) {
    switch (error.error) {
      case "Senha inválida":
        errorTitle = "Senha incorreta";
        errorMessage =
          "A senha informada está incorreta. Verifique e tente novamente.";
        break;
      case "Usuário não encontrado":
        errorTitle = "Usuário não encontrado";
        errorMessage =
          "Não encontramos uma conta com este email. Verifique o email informado.";
        break;
      default:
        errorMessage = error.error;
    }
  } else if (error.message) {
    errorMessage = error.message;
  }

  window.LoginUI.showNotification("error", errorTitle, errorMessage, 6000);
};

window.LoginAuth.processConnectionError = function (error) {
  let errorTitle = "Erro de conexão";
  let errorMessage =
    "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";

  if (error.message) {
    if (error.message.includes("500")) {
      errorTitle = "Erro do servidor";
      errorMessage =
        "O servidor está temporariamente indisponível. Tente novamente em alguns minutos.";
    } else if (error.message.includes("404")) {
      errorTitle = "Serviço não encontrado";
      errorMessage = "O serviço de autenticação não está disponível.";
    } else if (error.message.includes("401")) {
      errorTitle = "Não autorizado";
      errorMessage = "Suas credenciais são inválidas.";
    }
  }

  window.LoginUI.showNotification("error", errorTitle, errorMessage, 6000);
};

window.LoginAuth.processLoginSuccess = function (data) {
  if (data.token) {
    window.LoginUI.showNotification(
      "success",
      "Login realizado!",
      "Redirecionando para o painel...",
      2000
    );

    if (window.AuthCore && window.AuthCore.setToken) {
      window.AuthCore.setToken(data.token);
    } else {
      document.cookie = `token=${data.token}; path=/`;
    }

    setTimeout(() => {
      window.location.href = "/rastreamento";
    }, 1500);
  } else {
    window.LoginAuth.processServerError(data);
  }
};

window.LoginAuth.authenticateUser = async function (email, password) {
  // Login exclusivamente via Keycloak
  if (!window.KeycloakAuth) {
    window.LoginUI.showNotification(
      "error",
      "Erro de configuração",
      "Sistema de autenticação Keycloak não está disponível. Entre em contato com o administrador.",
      5000
    );
    if (window.LoginUI && window.LoginUI.setLoadingState) {
      window.LoginUI.setLoadingState(false);
    }
    return;
  }

  try {
    // Validar dados de entrada
    if (!window.LoginValidation || !window.LoginValidation.validateLoginData) {
      if (window.LoginUI && window.LoginUI.setLoadingState) {
        window.LoginUI.setLoadingState(false);
      }
      return;
    }

    if (!window.LoginValidation.validateLoginData(email, password)) {
      if (window.LoginUI && window.LoginUI.setLoadingState) {
        window.LoginUI.setLoadingState(false);
      }
      return;
    }

    // Inicializar Keycloak se não estiver inicializado
    if (!window.KeycloakAuth.state.isInitialized) {
      await window.KeycloakAuth.init();
    }

    // Tentar login direto com credenciais (Direct Access Grants)
    try {
      await window.KeycloakAuth.loginWithCredentials(email, password);
      
      // Sucesso - handleAuthSuccess já redireciona
      window.LoginUI.showNotification(
        "success",
        "Login realizado!",
        "Redirecionando...",
        2000
      );
      return;
    } catch (loginError) {
      // Se Direct Access Grants não estiver habilitado, usar redirecionamento
      if (
        loginError.message &&
        (loginError.message.includes("grant_type") ||
          loginError.message.includes("not allowed") ||
          loginError.message.includes("Direct Access Grants"))
      ) {
        console.log(
          "Direct Access Grants não disponível, usando redirecionamento para Keycloak"
        );
        // Redirecionar para página de login do Keycloak
        await window.KeycloakAuth.login({
          redirectUri: window.location.origin + "/rastreamento",
        });
        return;
      }
      throw loginError;
    }
  } catch (error) {
    console.error("Erro ao fazer login com Keycloak:", error);

    // Mensagens de erro mais específicas
    let errorTitle = "Erro de autenticação";
    let errorMessage = "Não foi possível fazer login. Tente novamente.";

    if (error.message) {
      if (
        error.message.includes("Invalid user credentials") ||
        error.message.includes("invalid_grant") ||
        error.message.includes("invalid_client")
      ) {
        errorTitle = "Credenciais inválidas";
        errorMessage =
          "Email ou senha incorretos. Verifique suas credenciais e tente novamente.";
      } else if (error.message.includes("User is disabled")) {
        errorTitle = "Usuário desabilitado";
        errorMessage =
          "Sua conta está desabilitada. Entre em contato com o administrador.";
      } else if (error.message.includes("Account is temporarily locked")) {
        errorTitle = "Conta bloqueada";
        errorMessage =
          "Sua conta está temporariamente bloqueada. Tente novamente mais tarde.";
      } else if (
        error.message.includes("Connection") ||
        error.message.includes("Network")
      ) {
        errorTitle = "Erro de conexão";
        errorMessage =
          "Não foi possível conectar ao servidor de autenticação. Verifique sua conexão.";
      }
    }

    window.LoginUI.showNotification("error", errorTitle, errorMessage, 5000);
    if (window.LoginUI && window.LoginUI.setLoadingState) {
      window.LoginUI.setLoadingState(false);
    }
    return;
  }
};

window.LoginAuth.registerUser = function (email, password, confirmPassword) {
  if (
    !window.LoginValidation.validateRegisterData(
      email,
      password,
      confirmPassword
    )
  ) {
    return;
  }

  const API_BASE_URL =
    (window.API_CONFIG && window.API_CONFIG.getBaseUrl()) ||
    (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ||
    "https://logistica.copapel.com.br/api";
  fetch(`${API_BASE_URL}/user/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => {
      return response.json().then((data) => {
        if (!response.ok) {
          throw { status: response.status, data: data };
        }
        return data;
      });
    })
    .then((data) => {
      window.LoginUI.showNotification(
        "success",
        "Conta criada!",
        "Redirecionando para o painel...",
        2000
      );

      if (data.token) {
        if (window.AuthCore && window.AuthCore.setToken) {
          window.AuthCore.setToken(data.token);
        } else {
          document.cookie = `token=${data.token}; path=/`;
        }
      }

      setTimeout(() => {
        window.location.href = "/rastreamento";
      }, 1500);
    })
    .catch((error) => {
      if (error.data) {
        window.LoginAuth.processServerError(error);
      } else {
        window.LoginAuth.processConnectionError(error);
      }
    });
};
