// Namespace principal para login
window.LoginMain = window.LoginMain || {};

/**
 * Inicializa o sistema de login
 */
window.LoginMain.initLogin = async function () {
  console.log("🔵 [LoginMain.initLogin] Iniciando sistema de login...");

  try {
    // Aguardar ModuleLoader estar disponível e carregar login
    console.log("🔵 [LoginMain.initLogin] Verificando ModuleLoader...");
    console.log("   - ModuleLoader disponível:", !!window.ModuleLoader);

    if (window.ModuleLoader) {
      console.log("🔵 [LoginMain.initLogin] Carregando página de login...");
      await window.ModuleLoader.loadLoginPage();
      console.log("✅ [LoginMain.initLogin] Página de login carregada");
    } else {
      console.warn("⚠️ [LoginMain.initLogin] ModuleLoader não encontrado");
    }

    // Inicializar interface de usuário
    console.log("🔵 [LoginMain.initLogin] Verificando LoginUI...");
    console.log("   - LoginUI disponível:", !!window.LoginUI);
    console.log(
      "   - initUI disponível:",
      !!(window.LoginUI && window.LoginUI.initUI)
    );

    if (window.LoginUI && window.LoginUI.initUI) {
      console.log("🔵 [LoginMain.initLogin] Inicializando UI...");
      window.LoginUI.initUI();
      console.log("✅ [LoginMain.initLogin] UI inicializada");
    } else {
      console.error("❌ [LoginMain.initLogin] LoginUI não encontrado");
    }

    // Verificar se LoginAuth está disponível
    console.log("🔵 [LoginMain.initLogin] Verificando LoginAuth...");
    console.log("   - LoginAuth disponível:", !!window.LoginAuth);
    console.log(
      "   - authenticateUser disponível:",
      !!(window.LoginAuth && window.LoginAuth.authenticateUser)
    );

    if (!window.LoginAuth || !window.LoginAuth.authenticateUser) {
      console.error("❌ [LoginMain.initLogin] LoginAuth não encontrado");
    } else {
      console.log("✅ [LoginMain.initLogin] LoginAuth disponível");
    }

    console.log(
      "✅ [LoginMain.initLogin] Sistema de login inicializado com sucesso"
    );
  } catch (error) {
    console.error(
      "❌ [LoginMain.initLogin] Erro ao inicializar sistema de login:",
      error
    );
    console.error("   - Stack:", error.stack);
  }
};

/**
 * Inicializa quando o DOM estiver pronto
 */
window.LoginMain.init = function () {
  console.log("🔵 [LoginMain.init] Iniciando...");
  console.log("   - Pathname:", window.location.pathname);
  console.log("   - Document readyState:", document.readyState);

  if (document.readyState === "loading") {
    console.log(
      "🔵 [LoginMain.init] DOM ainda carregando, aguardando DOMContentLoaded..."
    );
    document.addEventListener("DOMContentLoaded", () => {
      console.log(
        "🔵 [LoginMain.init] DOMContentLoaded disparado, chamando initLogin()..."
      );
      window.LoginMain.initLogin();
    });
  } else {
    console.log(
      "🔵 [LoginMain.init] DOM já pronto, chamando initLogin() imediatamente..."
    );
    window.LoginMain.initLogin();
  }
};

// Executar automaticamente apenas na página de login
console.log("🔵 [LoginMain] Script carregado");
console.log("   - Pathname:", window.location.pathname);
console.log(
  "   - É página de login:",
  window.location.pathname.includes("login") || window.location.pathname === "/"
);

if (
  window.location.pathname.includes("login") ||
  window.location.pathname === "/"
) {
  console.log("🔵 [LoginMain] Chamando init()...");
  window.LoginMain.init();
} else {
  console.log("⚠️ [LoginMain] Não é página de login, não inicializando");
}
