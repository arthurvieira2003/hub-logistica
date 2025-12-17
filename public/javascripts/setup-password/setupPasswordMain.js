window.SetupPassword = window.SetupPassword || {};

// Obter token da URL
window.SetupPassword.token = (function () {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("token");
})();

// Função para mostrar alertas
window.SetupPassword.showAlert = function (message, type = "info") {
  const container = document.getElementById("alertContainer");
  if (!container) return;

  container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => {
    container.innerHTML = "";
  }, 5000);
};

// Toggle password visibility
window.SetupPassword.initPasswordToggles = function () {
  const togglePassword = document.getElementById("togglePassword");
  const toggleConfirmPassword = document.getElementById(
    "toggleConfirmPassword"
  );

  if (togglePassword) {
    togglePassword.addEventListener("click", function () {
      const passwordInput = document.getElementById("password");
      const icon = this.querySelector("i");
      if (!passwordInput || !icon) return;

      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        passwordInput.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  }

  if (toggleConfirmPassword) {
    toggleConfirmPassword.addEventListener("click", function () {
      const confirmPasswordInput = document.getElementById("confirmPassword");
      const icon = this.querySelector("i");
      if (!confirmPasswordInput || !icon) return;

      if (confirmPasswordInput.type === "password") {
        confirmPasswordInput.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        confirmPasswordInput.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  }
};

// Verificar força da senha
window.SetupPassword.checkPasswordStrength = function (password) {
  const strengthDiv = document.getElementById("passwordStrength");
  if (!strengthDiv) return;

  if (!password) {
    strengthDiv.textContent = "";
    return;
  }

  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;

  strengthDiv.className = "password-strength";
  if (strength <= 2) {
    strengthDiv.textContent = "Senha fraca";
    strengthDiv.classList.add("weak");
  } else if (strength <= 3) {
    strengthDiv.textContent = "Senha média";
    strengthDiv.classList.add("medium");
  } else {
    strengthDiv.textContent = "Senha forte";
    strengthDiv.classList.add("strong");
  }
};

// Validar confirmação de senha
window.SetupPassword.validatePasswords = function () {
  const password = document.getElementById("password")?.value || "";
  const confirmPassword =
    document.getElementById("confirmPassword")?.value || "";

  if (password !== confirmPassword) {
    window.SetupPassword.showAlert("As senhas não coincidem", "error");
    return false;
  }

  if (password.length < 6) {
    window.SetupPassword.showAlert(
      "A senha deve ter no mínimo 6 caracteres",
      "error"
    );
    return false;
  }

  return true;
};

// Submeter formulário
window.SetupPassword.submitForm = async function () {
  const token = window.SetupPassword.token;

  if (!token) {
    window.SetupPassword.showAlert("Token inválido", "error");
    return;
  }

  if (!window.SetupPassword.validatePasswords()) {
    return;
  }

  const password = document.getElementById("password")?.value;
  const submitBtn = document.getElementById("submitBtn");
  const loading = document.getElementById("loading");
  const form = document.getElementById("setupPasswordForm");

  if (!password || !submitBtn || !loading || !form) {
    window.SetupPassword.showAlert("Erro ao processar formulário", "error");
    return;
  }

  submitBtn.disabled = true;
  form.classList.add("form-hidden");
  loading.classList.remove("loading-hidden");

  try {
    const API_BASE_URL =
      (window.getApiBaseUrl && window.getApiBaseUrl()) ||
      (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL);
    const response = await fetch(`${API_BASE_URL}/user/setup-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao criar senha");
    }

    window.SetupPassword.showAlert(
      "Senha criada com sucesso! Redirecionando para o login...",
      "success"
    );

    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  } catch (error) {
    console.error("Erro:", error);
    window.SetupPassword.showAlert(
      error.message || "Erro ao criar senha",
      "error"
    );
    submitBtn.disabled = false;
    form.classList.remove("form-hidden");
    loading.classList.add("loading-hidden");
  }
};

// Inicialização
window.SetupPassword.init = function () {
  // Verificar token
  if (!window.SetupPassword.token) {
    window.SetupPassword.showAlert(
      "Token não encontrado. Verifique o link enviado por e-mail.",
      "error"
    );
    const form = document.getElementById("setupPasswordForm");
    if (form) {
      form.classList.add("form-hidden");
    }
    return;
  }

  // Inicializar toggles de senha
  window.SetupPassword.initPasswordToggles();

  // Event listener para verificar força da senha
  const passwordInput = document.getElementById("password");
  if (passwordInput) {
    passwordInput.addEventListener("input", (e) => {
      window.SetupPassword.checkPasswordStrength(e.target.value);
    });
  }

  // Event listener para validar confirmação
  const confirmPasswordInput = document.getElementById("confirmPassword");
  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("blur", () => {
      window.SetupPassword.validatePasswords();
    });
  }

  // Event listener para submeter formulário
  const form = document.getElementById("setupPasswordForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await window.SetupPassword.submitForm();
    });
  }
};

// Inicializar quando o DOM estiver pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", window.SetupPassword.init);
} else {
  window.SetupPassword.init();
}
