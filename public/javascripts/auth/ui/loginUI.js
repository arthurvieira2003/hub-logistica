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
  console.log("🔵 [LoginUI.setupLoginForm] Configurando formulário de login...");
  
  const form = document.querySelector("form");
  console.log("   - Form encontrado:", !!form);
  console.log("   - Form:", form);

  if (!form) {
    console.error("❌ [LoginUI.setupLoginForm] Formulário não encontrado");
    console.error("   - Todos os forms na página:", document.querySelectorAll("form").length);
    return;
  }

  console.log("🔵 [LoginUI.setupLoginForm] Adicionando event listener de submit...");
  form.addEventListener("submit", function (e) {
    console.log("🔵 [LoginUI.setupLoginForm] Evento submit disparado!");
    e.preventDefault();
    console.log("   - PreventDefault executado");

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    console.log("   - Email input encontrado:", !!emailInput);
    console.log("   - Password input encontrado:", !!passwordInput);
    
    const email = emailInput ? emailInput.value : "";
    const password = passwordInput ? passwordInput.value : "";
    console.log("   - Email:", email ? email.substring(0, 5) + "..." : "vazio");
    console.log("   - Password:", password ? "***" : "vazio");

    // Verificar se é login ou registro (por enquanto só login)
    console.log("   - LoginAuth disponível:", !!window.LoginAuth);
    console.log("   - authenticateUser disponível:", !!(window.LoginAuth && window.LoginAuth.authenticateUser));
    
    if (window.LoginAuth && window.LoginAuth.authenticateUser) {
      console.log("🔵 [LoginUI.setupLoginForm] Chamando authenticateUser()...");
      window.LoginAuth.authenticateUser(email, password);
    } else {
      console.error("❌ [LoginUI.setupLoginForm] LoginAuth não está disponível");
    }
  });
  
  console.log("✅ [LoginUI.setupLoginForm] Event listener de submit adicionado");
};

/**
 * Inicializa todas as interações de UI
 */
window.LoginUI.initUI = function () {
  console.log("🔵 [LoginUI.initUI] Inicializando UI...");
  
  console.log("🔵 [LoginUI.initUI] Configurando interações de inputs...");
  window.LoginUI.setupInputInteractions();
  console.log("✅ [LoginUI.initUI] Interações de inputs configuradas");

  console.log("🔵 [LoginUI.initUI] Configurando toggle de senha...");
  window.LoginUI.setupPasswordToggle();
  console.log("✅ [LoginUI.initUI] Toggle de senha configurado");

  console.log("🔵 [LoginUI.initUI] Configurando formulário de login...");
  window.LoginUI.setupLoginForm();
  console.log("✅ [LoginUI.initUI] Formulário de login configurado");
  
  console.log("✅ [LoginUI.initUI] UI inicializada com sucesso");
};
