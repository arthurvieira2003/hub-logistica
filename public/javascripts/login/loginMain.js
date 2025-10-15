// Namespace principal para login
window.LoginMain = window.LoginMain || {};

/**
 * Inicializa o sistema de login
 */
window.LoginMain.initLogin = function () {
  // Aguardar DOM estar pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", window.LoginMain.initLogin);
    return;
  }

  try {
    // Inicializar interface de usuário
    if (window.LoginUI && window.LoginUI.initUI) {
      window.LoginUI.initUI();
    } else {
      console.error("❌ LoginUI não encontrado");
    }
  } catch (error) {
    console.error("❌ Erro ao inicializar sistema de login:", error);
  }
};

// Executar automaticamente quando o script for carregado

window.LoginMain.initLogin();
