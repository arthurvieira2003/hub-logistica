// Namespace principal para autenticação administrativa
window.AdminAuthMain = window.AdminAuthMain || {};

/**
 * Função principal que executa a validação de acesso administrativo
 */
window.AdminAuthMain.initAdminAuth = async function () {
  // Mostrar carregamento
  if (window.AdminAuthUI && window.AdminAuthUI.showLoading) {
    window.AdminAuthUI.showLoading();
  }

  try {
    // Validar acesso administrativo
    const hasAccess = await window.AdminAuthValidator.validateAdminAccess();

    if (hasAccess) {
      // Se chegou até aqui, o usuário está autenticado e é admin
      if (window.AdminAuthUI && window.AdminAuthUI.hideLoading) {
        window.AdminAuthUI.hideLoading();
      }

      // Inicializar a página de administração após validação bem-sucedida
      if (window.AdminMain && window.AdminMain.initAdministrationPage) {
        await window.AdminMain.initAdministrationPage();
      }
    }
  } catch (error) {
    console.error("❌ Erro crítico na autenticação administrativa:", error);
    if (window.AdminAuthUI && window.AdminAuthUI.hideLoading) {
      window.AdminAuthUI.hideLoading();
    }
    if (window.AdminAuthValidator && window.AdminAuthValidator.redirectToHome) {
      window.AdminAuthValidator.redirectToHome(
        "Erro ao verificar suas permissões. Tente novamente."
      );
    }
  }
};

// Não executar automaticamente - será chamado pelo adminMain.js após carregar todos os módulos
