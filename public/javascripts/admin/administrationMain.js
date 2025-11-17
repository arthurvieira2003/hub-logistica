window.Administration = window.Administration || {};

window.Administration.init = async function () {
  window.Administration.initTabs();
  window.Administration.initUserModal();
  window.Administration.initSearch();
  window.Administration.initEntityEvents();
  window.Administration.initDeleteConfirmModal();

  await window.Administration.loadUsers();
};
