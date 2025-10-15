// Namespace principal para login-check.js refatorado
window.LoginCheckMain = window.LoginCheckMain || {};

/**
 * Função principal que executa a verificação avançada de token
 * Substitui o login-check.js original
 */
window.LoginCheckMain.initAdvancedAuthCheck = async function () {
  // Executar verificação avançada
  await window.AuthValidators.advancedTokenCheck();
};

// Executar automaticamente quando o script for carregado
window.LoginCheckMain.initAdvancedAuthCheck();
