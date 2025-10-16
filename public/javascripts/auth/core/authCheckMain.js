// Namespace unificado para verificação de autenticação
window.AuthCheckMain = window.AuthCheckMain || {};

/**
 * Função principal que executa a verificação básica de token
 * Substitui o auth-check.js original
 */
window.AuthCheckMain.initBasicAuthCheck = function () {
  // Executar verificação básica
  if (window.AuthValidators && window.AuthValidators.basicTokenCheck) {
    window.AuthValidators.basicTokenCheck();
  } else {
    console.warn("⚠️ AuthValidators.basicTokenCheck não está disponível");
  }
};

/**
 * Função principal que executa a verificação avançada de token
 * Substitui o login-check.js original
 */
window.AuthCheckMain.initAdvancedAuthCheck = async function () {
  // Executar verificação avançada
  if (window.AuthValidators && window.AuthValidators.advancedTokenCheck) {
    await window.AuthValidators.advancedTokenCheck();
  } else {
    console.warn("⚠️ AuthValidators.advancedTokenCheck não está disponível");
  }
};

/**
 * Função unificada que detecta o contexto e executa a verificação apropriada
 */
window.AuthCheckMain.initAuthCheck = function () {
  // Detectar contexto baseado na URL ou elementos da página
  const currentPath = window.location.pathname;

  if (currentPath === "/" || currentPath.includes("login")) {
    // Contexto de login - NÃO executar verificação de token
    return;
  } else {
    // Contexto geral - usar verificação básica
    window.AuthCheckMain.initBasicAuthCheck();
  }
};

// ============================================================================
// COMPATIBILIDADE COM CÓDIGO EXISTENTE
// ============================================================================

// Manter compatibilidade com LoginCheckMain (alias para AuthCheckMain)
window.LoginCheckMain = window.AuthCheckMain;

// Executar automaticamente apenas se não estivermos na página de login
if (
  !window.location.pathname.includes("login") &&
  window.location.pathname !== "/"
) {
  window.AuthCheckMain.initAuthCheck();
}
