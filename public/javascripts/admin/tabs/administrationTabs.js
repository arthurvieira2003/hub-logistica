window.Administration = window.Administration || {};

window.Administration.initTabs = function () {
  const tabs = document.querySelectorAll(".admin-tab");
  const contentTabs = document.querySelectorAll(".admin-content-tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.tab;

      tabs.forEach((t) => t.classList.remove("active"));
      contentTabs.forEach((ct) => ct.classList.remove("active"));

      tab.classList.add("active");
      const contentTab = document.getElementById(`${tabName}Tab`);
      if (contentTab) {
        contentTab.classList.add("active");
      }

      window.Administration.state.currentTab = tabName;

      if (tabName === "users") {
        window.Administration.loadUsers();
      } else if (tabName === "sessions") {
        window.Administration.loadSessions();
      } else if (tabName === "estados") {
        window.Administration.loadEstados();
      } else if (tabName === "cidades") {
        window.Administration.loadCidades();
      } else if (tabName === "faixas-peso") {
        window.Administration.loadFaixasPeso();
      } else if (tabName === "rotas") {
        window.Administration.loadRotas();
      } else if (tabName === "precos-faixas") {
        window.Administration.loadPrecosFaixas();
      } else if (tabName === "transportadoras-excluidas") {
        window.Administration.loadTransportadorasExcluidas();
      }
    });
  });
};
