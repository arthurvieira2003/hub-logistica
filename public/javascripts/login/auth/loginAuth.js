// Namespace para autenticação de login
window.LoginAuth = window.LoginAuth || {};

/**
 * Processa resposta de erro do servidor
 */
window.LoginAuth.processServerError = function (error) {
  let errorTitle = "Erro no login";
  let errorMessage = "Ocorreu um erro inesperado. Tente novamente.";

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

  window.LoginUI.showNotification(errorTitle, errorMessage, 6000);
};

/**
 * Processa erro de conexão
 */
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

/**
 * Processa resposta de sucesso do login
 */
window.LoginAuth.processLoginSuccess = function (data) {
  if (data.token) {
    window.LoginUI.showNotification(
      "success",
      "Login realizado!",
      "Redirecionando para o painel...",
      2000
    );

    // Usar AuthCore para definir token
    if (window.AuthCore && window.AuthCore.setToken) {
      window.AuthCore.setToken(data.token);
    } else {
      // Fallback para método antigo
      document.cookie = `token=${data.token}; path=/`;
    }

    setTimeout(() => {
      window.location.href = "/home";
    }, 1500);
  } else {
    window.LoginAuth.processServerError(data);
  }
};

/**
 * Autentica usuário
 */
window.LoginAuth.authenticateUser = function (email, password) {
  console.log("🔵 [LoginAuth.authenticateUser] Iniciando autenticação...");
  console.log("   - Email:", email ? email.substring(0, 5) + "..." : "vazio");
  console.log("   - Password:", password ? "***" : "vazio");
  
  // Validar dados antes de enviar
  console.log("🔵 [LoginAuth.authenticateUser] Verificando LoginValidation...");
  console.log("   - LoginValidation disponível:", !!window.LoginValidation);
  console.log("   - validateLoginData disponível:", !!(window.LoginValidation && window.LoginValidation.validateLoginData));
  
  if (!window.LoginValidation || !window.LoginValidation.validateLoginData) {
    console.error("❌ [LoginAuth.authenticateUser] LoginValidation não disponível");
    return;
  }
  
  if (!window.LoginValidation.validateLoginData(email, password)) {
    console.warn("⚠️ [LoginAuth.authenticateUser] Validação falhou");
    return;
  }
  
  console.log("✅ [LoginAuth.authenticateUser] Validação passou, fazendo requisição...");
  console.log("   - URL: http://localhost:4010/user/authenticate");

  fetch("http://localhost:4010/user/authenticate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => {
      console.log("🔵 [LoginAuth.authenticateUser] Resposta recebida");
      console.log("   - Status:", response.status);
      console.log("   - OK:", response.ok);
      
      // Sempre tenta ler o JSON, mesmo em caso de erro
      return response.json().then((data) => {
        console.log("   - Data recebida:", data ? (data.token ? "Token presente" : "Sem token") : "null");
        if (!response.ok) {
          // Se não há token, trata como erro
          console.warn("⚠️ [LoginAuth.authenticateUser] Resposta não OK, lançando erro");
          throw { status: response.status, data: data };
        }
        return data;
      });
    })
    .then((data) => {
      console.log("✅ [LoginAuth.authenticateUser] Login bem-sucedido, processando...");
      window.LoginAuth.processLoginSuccess(data);
    })
    .catch((error) => {
      console.error("❌ [LoginAuth.authenticateUser] Erro na autenticação:", error);
      console.error("   - Error.data:", error.data);
      console.error("   - Error.status:", error.status);
      
      // Se o erro tem dados do servidor (erro estruturado)
      if (error.data) {
        console.log("🔵 [LoginAuth.authenticateUser] Processando erro do servidor...");
        window.LoginAuth.processServerError(error);
      } else {
        // Erro de conexão ou outros erros
        console.log("🔵 [LoginAuth.authenticateUser] Processando erro de conexão...");
        window.LoginAuth.processConnectionError(error);
      }
    });
};

/**
 * Registra novo usuário
 */
window.LoginAuth.registerUser = function (email, password, confirmPassword) {
  // Validar dados antes de enviar
  if (
    !window.LoginValidation.validateRegisterData(
      email,
      password,
      confirmPassword
    )
  ) {
    return;
  }

  fetch("http://localhost:4010/user/register", {
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

      // Definir token se fornecido
      if (data.token) {
        if (window.AuthCore && window.AuthCore.setToken) {
          window.AuthCore.setToken(data.token);
        } else {
          document.cookie = `token=${data.token}; path=/`;
        }
      }

      setTimeout(() => {
        window.location.href = "/home";
      }, 1500);
    })
    .catch((error) => {
      console.error("❌ Erro no registro:", error);

      if (error.data) {
        window.LoginAuth.processServerError(error);
      } else {
        window.LoginAuth.processConnectionError(error);
      }
    });
};
