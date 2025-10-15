// Namespace para validação de login
window.LoginValidation = window.LoginValidation || {};

/**
 * Valida se os campos obrigatórios estão preenchidos
 */
window.LoginValidation.validateRequiredFields = function (email, password) {
  if (!email || !password) {
    window.LoginUI.showNotification(
      "warning",
      "Campos obrigatórios",
      "Por favor, preencha todos os campos.",
      4000
    );
    return false;
  }

  return true;
};

/**
 * Valida formato do email
 */
window.LoginValidation.validateEmail = function (email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    window.LoginUI.showNotification(
      "warning",
      "Email inválido",
      "Por favor, insira um email válido.",
      4000
    );
    return false;
  }

  return true;
};

/**
 * Valida dados do formulário de login
 */
window.LoginValidation.validateLoginData = function (email, password) {
  // Validar campos obrigatórios
  if (!window.LoginValidation.validateRequiredFields(email, password)) {
    return false;
  }

  // Validar formato do email
  if (!window.LoginValidation.validateEmail(email)) {
    return false;
  }

  return true;
};

/**
 * Valida dados do formulário de registro
 */
window.LoginValidation.validateRegisterData = function (
  email,
  password,
  confirmPassword
) {
  // Validar campos obrigatórios
  if (!email || !password || !confirmPassword) {
    window.LoginUI.showNotification(
      "warning",
      "Campos obrigatórios",
      "Por favor, preencha todos os campos.",
      4000
    );
    return false;
  }

  // Validar formato do email
  if (!window.LoginValidation.validateEmail(email)) {
    return false;
  }

  // Validar senhas
  if (password !== confirmPassword) {
    window.LoginUI.showNotification(
      "warning",
      "Senhas não coincidem",
      "As senhas informadas não são iguais.",
      4000
    );
    return false;
  }

  // Validar força da senha
  if (password.length < 6) {
    window.LoginUI.showNotification(
      "warning",
      "Senha muito curta",
      "A senha deve ter pelo menos 6 caracteres.",
      4000
    );
    return false;
  }

  return true;
};
