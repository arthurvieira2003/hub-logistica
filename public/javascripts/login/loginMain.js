window.LoginMain = window.LoginMain || {};

window.LoginMain.initLogin = async function () {
  try {
    if (window.ModuleLoader) {
      await window.ModuleLoader.loadLoginPage();
    }

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

if (
  window.location.pathname.includes("login") ||
  window.location.pathname === "/"
) {
  window.LoginMain.init();
}
