// Namespace principal para autenticação administrativa
window.AdminAuthMain = window.AdminAuthMain || {};

/**
 * Função principal que executa a validação de acesso administrativo
 */
window.AdminAuthMain.initAdminAuth = async function () {
  // Mostrar carregamento
  window.AdminAuthUI.showLoading();

  try {
    // Validar acesso administrativo
    const hasAccess = await window.AdminAuthValidator.validateAdminAccess();

    if (hasAccess) {
      // Se chegou até aqui, o usuário está autenticado e é admin
      window.AdminAuthUI.hideLoading();
    }
  } catch (error) {
    console.error("❌ Erro crítico na autenticação administrativa:", error);
    window.AdminAuthUI.hideLoading();
    window.AdminAuthValidator.redirectToHome(
      "Erro ao verificar suas permissões. Tente novamente."
    );
  }
};

// Executar automaticamente quando o script for carregado
window.AdminAuthMain.initAdminAuth();
