document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const inputs = document.querySelectorAll("input");
  const togglePassword = document.getElementById("togglePassword");
  const password = document.getElementById("password");
  const notificationContainer = document.getElementById(
    "notification-container"
  );
  let isLogin = true;

  // Sistema de notificações
  function showNotification(type, title, message, duration = 5000) {
    const notification = document.createElement("div");
    notification.className = `notification ${type} progress`;

    const icons = {
      error: "fas fa-exclamation-circle",
      success: "fas fa-check-circle",
      warning: "fas fa-exclamation-triangle",
      info: "fas fa-info-circle",
    };

    notification.innerHTML = `
      <div class="notification-icon">
        <i class="${icons[type]}"></i>
      </div>
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close" onclick="removeNotification(this)">
        <i class="fas fa-times"></i>
      </button>
    `;

    notificationContainer.appendChild(notification);

    // Auto remove após o tempo especificado
    setTimeout(() => {
      if (notification.parentNode) {
        removeNotification(notification.querySelector(".notification-close"));
      }
    }, duration);
  }

  // Função global para remover notificações
  window.removeNotification = function (button) {
    const notification = button.closest(".notification");
    notification.style.animation = "fadeOut 0.3s ease forwards";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  };

  inputs.forEach((input) => {
    input.addEventListener("focus", function () {
      this.parentElement.classList.add("focused");
    });

    input.addEventListener("blur", function () {
      if (this.value === "") {
        this.parentElement.classList.remove("focused");
      }
    });
  });

  togglePassword.addEventListener("click", function () {
    const type =
      password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);
    this.querySelector("i").classList.toggle("fa-eye");
    this.querySelector("i").classList.toggle("fa-eye-slash");
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (isLogin) {
      loginUser(email, password);
    } else {
      registerUser(email, password);
    }
  });

  function loginUser(email, password) {
    // Validação básica dos campos
    if (!email || !password) {
      showNotification(
        "warning",
        "Campos obrigatórios",
        "Por favor, preencha todos os campos.",
        4000
      );
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification(
        "warning",
        "Email inválido",
        "Por favor, insira um email válido.",
        4000
      );
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
        // Sempre tenta ler o JSON, mesmo em caso de erro
        return response.json().then((data) => {
          if (!response.ok) {
            // Se não há token, trata como erro
            throw { status: response.status, data: data };
          }
          return data;
        });
      })
      .then((data) => {
        if (data.token) {
          showNotification(
            "success",
            "Login realizado!",
            "Redirecionando para o painel...",
            2000
          );
          document.cookie = `token=${data.token}; path=/`;
          setTimeout(() => {
            window.location.href = "/home";
          }, 1500);
        } else {
          // Tratar diferentes tipos de erro do servidor
          let errorTitle = "Erro no login";
          let errorMessage = "Ocorreu um erro inesperado. Tente novamente.";

          if (data.error) {
            switch (data.error) {
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
                errorMessage = data.error;
            }
          } else if (data.message) {
            errorMessage = data.message;
          }

          showNotification("error", errorTitle, errorMessage, 6000);
        }
      })
      .catch((error) => {
        console.error("Erro:", error);

        // Se o erro tem dados do servidor (erro estruturado)
        if (error.data) {
          let errorTitle = "Erro no login";
          let errorMessage = "Ocorreu um erro inesperado. Tente novamente.";

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

          showNotification("error", errorTitle, errorMessage, 6000);
        } else {
          // Erro de conexão ou outros erros
          let errorTitle = "Erro de conexão";
          let errorMessage =
            "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";

          if (error.message && error.message.includes("500")) {
            errorTitle = "Erro do servidor";
            errorMessage =
              "O servidor está temporariamente indisponível. Tente novamente em alguns minutos.";
          } else if (error.message && error.message.includes("404")) {
            errorTitle = "Serviço não encontrado";
            errorMessage = "O serviço de autenticação não está disponível.";
          } else if (error.message && error.message.includes("401")) {
            errorTitle = "Não autorizado";
            errorMessage = "Suas credenciais são inválidas.";
          }

          showNotification("error", errorTitle, errorMessage, 6000);
        }
      });
  }
});
