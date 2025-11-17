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

  window.LoginUI.showNotification(errorTitle, errorMessage, 6000);
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
      window.location.href = "/home";
    }, 1500);
  } else {
    window.LoginAuth.processServerError(data);
  }
};

window.LoginAuth.authenticateUser = function (email, password) {
  if (!window.LoginValidation || !window.LoginValidation.validateLoginData) {
    return;
  }

  if (!window.LoginValidation.validateLoginData(email, password)) {
    return;
  }

  fetch("http://localhost:4010/user/authenticate", {
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
      window.LoginAuth.processLoginSuccess(data);
    })
    .catch((error) => {
      if (error.data) {
        window.LoginAuth.processServerError(error);
      } else {
        window.LoginAuth.processConnectionError(error);
      }
    });
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
      if (error.data) {
        window.LoginAuth.processServerError(error);
      } else {
        window.LoginAuth.processConnectionError(error);
      }
    });
};
