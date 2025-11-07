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

    // Aguardar um pouco para garantir que todos os módulos foram inicializados
    // Verificar se o módulo Administration está disponível
    let attempts = 0;
    const maxAttempts = 50; // 5 segundos (50 * 100ms)
    
    while (!window.Administration && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.Administration) {
      console.error("❌ Módulo Administration não foi carregado após aguardar");
      return;
    }

    // Inicializar funcionalidades específicas de admin
    if (!window.AdminAuthMain) {
      throw new Error("AdminAuthMain não encontrado");
    }

    // Chamar initAdminAuth após garantir que todos os módulos foram carregados
    if (window.AdminAuthMain.initAdminAuth) {
      await window.AdminAuthMain.initAdminAuth();
    }
  } catch (error) {
    console.error("❌ Erro ao inicializar sistema de administração:", error);
  }
};

/**
 * Inicializa a página de administração após validação de autenticação
 * Esta função é chamada pelo AdminAuthMain após validar que o usuário é admin
 */
window.AdminMain.initAdministrationPage = async function () {
  try {
    // Inicializar a página de administração
    if (window.Administration && window.Administration.init) {
      await window.Administration.init();
    } else {
      console.warn("⚠️ Módulo Administration não encontrado");
    }
  } catch (error) {
    console.error("❌ Erro ao inicializar página de administração:", error);
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
