window.AdminAuthMain = window.AdminAuthMain || {};

window.AdminAuthMain.initAdminAuth = async function () {
  if (window.AdminAuthUI && window.AdminAuthUI.showLoading) {
    window.AdminAuthUI.showLoading();
  }

  try {
    const hasAccess = await window.AdminAuthValidator.validateAdminAccess();

    if (hasAccess) {
      if (window.AdminAuthUI && window.AdminAuthUI.hideLoading) {
        window.AdminAuthUI.hideLoading();
      }

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
