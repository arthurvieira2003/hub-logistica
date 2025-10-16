// Namespace para interface de login
window.LoginUI = window.LoginUI || {};

/**
 * Sistema de notificações para login
 */
window.LoginUI.showNotification = function (
  type,
  title,
  message,
  duration = 5000
) {
  const notificationContainer = document.getElementById(
    "notification-container"
  );

  if (!notificationContainer) {
    return;
  }

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
    <button class="notification-close" onclick="LoginUI.removeNotification(this)">
      <i class="fas fa-times"></i>
    </button>
  `;

  notificationContainer.appendChild(notification);

  // Auto remove após o tempo especificado
  setTimeout(() => {
    if (notification.parentNode) {
      window.LoginUI.removeNotification(
        notification.querySelector(".notification-close")
      );
    }
  }, duration);
};

/**
 * Remove notificação
 */
window.LoginUI.removeNotification = function (button) {
  const notification = button.closest(".notification");
  notification.style.animation = "fadeOut 0.3s ease forwards";
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
};

/**
 * Configura interações de UI dos inputs
 */
window.LoginUI.setupInputInteractions = function () {
  const inputs = document.querySelectorAll("input");

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
};

/**
 * Configura toggle de senha
 */
window.LoginUI.setupPasswordToggle = function () {
  const togglePassword = document.getElementById("togglePassword");
  const password = document.getElementById("password");

  if (!togglePassword || !password) {
    return;
  }

  togglePassword.addEventListener("click", function () {
    const type =
      password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);

    const icon = this.querySelector("i");
    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
  });
};

/**
 * Configura formulário de login
 */
window.LoginUI.setupLoginForm = function () {
  const form = document.querySelector("form");

  if (!form) {
    console.error("❌ [LoginUI] Formulário não encontrado");
    return;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Verificar se é login ou registro (por enquanto só login)
    if (window.LoginAuth && window.LoginAuth.authenticateUser) {
      window.LoginAuth.authenticateUser(email, password);
    } else {
      console.error("❌ [LoginUI] LoginAuth não está disponível");
    }
  });
};

/**
 * Inicializa todas as interações de UI
 */
window.LoginUI.initUI = function () {
  window.LoginUI.setupInputInteractions();

  window.LoginUI.setupPasswordToggle();

  window.LoginUI.setupLoginForm();
};
