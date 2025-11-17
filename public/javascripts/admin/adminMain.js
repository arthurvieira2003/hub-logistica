window.AdminMain = window.AdminMain || {};

window.AdminMain.initAdmin = async function () {
  try {
    if (window.ModuleLoader) {
      await window.ModuleLoader.loadAdminPage();
    }

    let attempts = 0;
    const maxAttempts = 50;

    while (!window.Administration && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.Administration) {
      console.error("❌ Módulo Administration não foi carregado após aguardar");
      return;
    }

    if (!window.AdminAuthMain) {
      throw new Error("AdminAuthMain não encontrado");
    }

    if (window.AdminAuthMain.initAdminAuth) {
      await window.AdminAuthMain.initAdminAuth();
    }
  } catch (error) {
    console.error("❌ Erro ao inicializar sistema de administração:", error);
  }
};

window.AdminMain.initAdministrationPage = async function () {
  try {
    if (window.Administration && window.Administration.init) {
      await window.Administration.init();
    } else {
      console.warn("⚠️ Módulo Administration não encontrado");
    }
  } catch (error) {
    console.error("❌ Erro ao inicializar página de administração:", error);
  }
};

window.AdminMain.init = function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", window.AdminMain.initAdmin);
  } else {
    window.AdminMain.initAdmin();
  }
};

window.AdminMain.init();
