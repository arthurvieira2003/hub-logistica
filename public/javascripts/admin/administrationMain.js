// Administration Main - Arquivo principal de inicialização
window.Administration = window.Administration || {};

window.Administration.init = async function () {
  // Inicializar componentes
  window.Administration.initTabs();
  window.Administration.initUserModal();
  window.Administration.initSearch();
  window.Administration.initEntityEvents();
  window.Administration.initDeleteConfirmModal();

  // Carregar dados iniciais
  await window.Administration.loadUsers();
};
