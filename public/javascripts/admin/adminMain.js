// Admin Main Module - Módulo principal para administração
window.AdminMain = window.AdminMain || {};

/**
 * Inicializa o sistema de administração
 */
window.AdminMain.initAdmin = async function () {
  try {
    // Aguardar ModuleLoader estar disponível e carregar admin
    if (window.ModuleLoader) {
      await window.ModuleLoader.loadAdminPage();
    }

    // Inicializar funcionalidades específicas de admin
    if (!window.AdminAuthMain) {
      throw new Error("AdminAuthMain não encontrado");
    }
  } catch (error) {
    console.error("❌ Erro ao inicializar sistema de administração:", error);
  }
};

/**
 * Inicializa quando o DOM estiver pronto
 */
window.AdminMain.init = function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", window.AdminMain.initAdmin);
  } else {
    window.AdminMain.initAdmin();
  }
};

// Executar automaticamente quando o script for carregado
window.AdminMain.init();
