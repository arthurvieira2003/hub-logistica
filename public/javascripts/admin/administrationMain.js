window.Administration = window.Administration || {};

// Dispara evento quando o módulo Administration é carregado
if (window.ModuleLoader && window.ModuleLoader.state && window.ModuleLoader.state.eventTarget) {
  window.ModuleLoader.state.eventTarget.dispatchEvent(
    new CustomEvent('administrationModuleReady', { detail: { module: window.Administration } })
  );
}

window.Administration.init = async function () {
  window.Administration.initTabs();
  window.Administration.initUserModal();
  window.Administration.initSearch();
  window.Administration.initEntityEvents();
  window.Administration.initDeleteConfirmModal();

  await window.Administration.loadUsers();
};
