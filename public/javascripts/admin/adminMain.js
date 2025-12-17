window.AdminMain = window.AdminMain || {};

window.AdminMain.initAdmin = async function () {
  try {
    if (window.ModuleLoader) {
      const adminPageLoadedPromise = new Promise((resolve) => {
        window.ModuleLoader.state.eventTarget.addEventListener(
          "adminPageLoaded",
          resolve,
          { once: true }
        );
      });

      await window.ModuleLoader.loadAdminPage();
      await adminPageLoadedPromise;
    }

    if (!window.Administration) {
      console.error("❌ Módulo Administration não foi carregado");
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
      return;
    }

    const administrationLoadedPromise = new Promise((resolve) => {
      const handleAdministrationReady = () => {
        window.ModuleLoader.state.eventTarget.removeEventListener(
          "administrationModuleReady",
          handleAdministrationReady
        );
        resolve();
      };

      window.ModuleLoader.state.eventTarget.addEventListener(
        "administrationModuleReady",
        handleAdministrationReady,
        { once: true }
      );

      if (window.Administration && window.Administration.init) {
        handleAdministrationReady();
      }
    });

    await administrationLoadedPromise;

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
