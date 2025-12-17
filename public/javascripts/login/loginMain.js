window.LoginMain = window.LoginMain || {};

window.LoginMain.initLogin = async function () {
  try {
    // Aguarda um pouco para garantir que todos os módulos foram carregados
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (window.LoginUI && window.LoginUI.initUI) {
      window.LoginUI.initUI();
    } else {
      console.error("LoginUI não encontrado");
    }
  } catch (error) {
    console.error("Erro ao inicializar sistema de login:", error);
  }
};

window.LoginMain.init = function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.LoginMain.initLogin();
    });
  } else {
    window.LoginMain.initLogin();
  }
};

// Inicialização automática como fallback caso o ModuleLoader não seja usado
// O ModuleLoader normalmente inicializa o login através de loadLoginPage()
if (
  (window.location.pathname.includes("login") ||
    window.location.pathname === "/") &&
  !window.ModuleLoader?.state?.isLoading
) {
  // Aguarda um pouco para ver se o ModuleLoader vai inicializar
  setTimeout(() => {
    if (!window.LoginUI?.initUI) {
      window.LoginMain.init();
    }
  }, 500);
}
