// Namespace principal para auth-check.js refatorado
window.AuthCheckMain = window.AuthCheckMain || {};

/**
 * Função principal que executa a verificação básica de token
 * Substitui o auth-check.js original
 */
window.AuthCheckMain.initBasicAuthCheck = function () {
  // Executar verificação básica
  window.AuthValidators.basicTokenCheck();
};

// Executar automaticamente quando o script for carregado
window.AuthCheckMain.initBasicAuthCheck();
