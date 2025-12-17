window.LoginUI = window.LoginUI || {};

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

  setTimeout(() => {
    if (notification.parentNode) {
      window.LoginUI.removeNotification(
        notification.querySelector(".notification-close")
      );
    }
  }, duration);
};

window.LoginUI.removeNotification = function (button) {
  const notification = button.closest(".notification");
  notification.style.animation = "fadeOut 0.3s ease forwards";
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
};

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

window.LoginUI.setLoadingState = function (isLoading) {
  const submitButton = document.querySelector('button[type="submit"]');
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (submitButton) {
    if (isLoading) {
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Entrando...';
    } else {
      submitButton.disabled = false;
      submitButton.innerHTML = "Entrar";
    }
  }

  if (emailInput) {
    emailInput.disabled = isLoading;
  }

  if (passwordInput) {
    passwordInput.disabled = isLoading;
  }
};

window.LoginUI.setupLoginForm = function () {
  const form = document.querySelector("form");

  if (!form) {
    return;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const email = emailInput ? emailInput.value : "";
    const password = passwordInput ? passwordInput.value : "";

    if (window.LoginAuth && window.LoginAuth.authenticateUser) {
      window.LoginUI.setLoadingState(true);
      window.LoginAuth.authenticateUser(email, password);
    }
  });
};

window.LoginUI.initUI = function () {
  window.LoginUI.setupInputInteractions();
  window.LoginUI.setupPasswordToggle();
  window.LoginUI.setupLoginForm();
};
