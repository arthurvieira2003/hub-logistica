// Namespace principal para login
window.LoginMain = window.LoginMain || {};

/**
 * Inicializa o sistema de login
 */
window.LoginMain.initLogin = async function () {
  try {
    // Aguardar ModuleLoader estar disponível e carregar login
    if (window.ModuleLoader) {
      await window.ModuleLoader.loadLoginPage();
    } else {
      console.warn("⚠️ [LoginMain] ModuleLoader não encontrado");
    }

    // Inicializar interface de usuário
    if (window.LoginUI && window.LoginUI.initUI) {
      window.LoginUI.initUI();
    } else {
      console.error("❌ LoginUI não encontrado");
    }

    // Verificar se LoginAuth está disponível
    if (!window.LoginAuth || !window.LoginAuth.authenticateUser) {
      console.error("❌ LoginAuth não encontrado");
    }
  } catch (error) {
    console.error("❌ Erro ao inicializar sistema de login:", error);
  }
};

/**
 * Inicializa quando o DOM estiver pronto
 */
window.LoginMain.init = function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", window.LoginMain.initLogin);
  } else {
    window.LoginMain.initLogin();
  }
};

// Executar automaticamente apenas na página de login
if (
  window.location.pathname.includes("login") ||
  window.location.pathname === "/"
) {
  window.LoginMain.init();
}
