window.AdminAuthMain = window.AdminAuthMain || {};

function showLoadingIfAvailable() {
  if (window.AdminAuthUI?.showLoading) {
    window.AdminAuthUI.showLoading();
  }
}

function hideLoadingIfAvailable() {
  if (window.AdminAuthUI?.hideLoading) {
    window.AdminAuthUI.hideLoading();
  }
}

function handleAuthError(error) {
  console.error("❌ Erro crítico na autenticação administrativa:", error);
  hideLoadingIfAvailable();
  if (window.AdminAuthValidator?.redirectToHome) {
    window.AdminAuthValidator.redirectToHome(
      "Erro ao verificar suas permissões. Tente novamente."
    );
  }
}

window.AdminAuthMain.initAdminAuth = async function () {
  showLoadingIfAvailable();

  try {
    const hasAccess = await window.AdminAuthValidator.validateAdminAccess();

    if (!hasAccess) {
      return;
    }

    hideLoadingIfAvailable();

    if (window.AdminMain?.initAdministrationPage) {
      await window.AdminMain.initAdministrationPage();
    }
  } catch (error) {
    handleAuthError(error);
  }
};
