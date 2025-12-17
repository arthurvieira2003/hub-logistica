window.Administration = window.Administration || {};

window.Administration.initSearch = function () {
  const userSearch = document.getElementById("userSearchInput");
  const sessionSearch = document.getElementById("sessionSearchInput");
  const refreshSessionsBtn = document.getElementById("refreshSessionsBtn");

  userSearch?.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    if (!searchTerm) {
      window.Administration.state.filteredData.users = null;
      window.Administration.resetPagination("users");
      window.Administration.renderUsers(window.Administration.state.users);
      return;
    }
    const filtered = window.Administration.state.users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    );
    window.Administration.state.filteredData.users = filtered;
    window.Administration.resetPagination("users");
    window.Administration.renderUsers(filtered);
  });

  sessionSearch?.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    if (!searchTerm) {
      window.Administration.state.filteredData.sessions = null;
      window.Administration.resetPagination("sessions");
      window.Administration.renderSessions(
        window.Administration.state.sessions
      );
      return;
    }
    const filtered = window.Administration.state.sessions.filter((session) => {
      const user = session.User || session.user;
      return (
        user?.name?.toLowerCase().includes(searchTerm) ||
        user?.email?.toLowerCase().includes(searchTerm)
      );
    });
    window.Administration.state.filteredData.sessions = filtered;
    window.Administration.resetPagination("sessions");
    window.Administration.renderSessions(filtered);
  });

  refreshSessionsBtn?.addEventListener("click", () => {
    window.Administration.loadSessions();
  });

  // Debounce para evitar muitas requisições enquanto o usuário digita
  let estadoSearchTimeout = null;

  document
    .getElementById("estadoSearchInput")
    ?.addEventListener("input", (e) => {
      const searchTerm = e.target.value.trim();

      // Limpa o timeout anterior
      if (estadoSearchTimeout) {
        clearTimeout(estadoSearchTimeout);
      }

      // Aguarda 500ms após o usuário parar de digitar antes de fazer a busca
      estadoSearchTimeout = setTimeout(async () => {
        if (!searchTerm) {
          window.Administration.state.filteredData.estados = null;
          window.Administration.state.currentSearchEstados = null;
          window.Administration.resetPagination("estados");
          // Recarrega a primeira página quando limpa a busca
          await window.Administration.loadEstados(1, 50, null);
          return;
        }

        // Busca no servidor
        window.Administration.resetPagination("estados");
        await window.Administration.loadEstados(1, 50, searchTerm);
      }, 500);
    });

  // Debounce para evitar muitas requisições enquanto o usuário digita
  let cidadeSearchTimeout = null;

  document
    .getElementById("cidadeSearchInput")
    ?.addEventListener("input", (e) => {
      const searchTerm = e.target.value.trim();

      // Limpa o timeout anterior
      if (cidadeSearchTimeout) {
        clearTimeout(cidadeSearchTimeout);
      }

      // Aguarda 500ms após o usuário parar de digitar antes de fazer a busca
      cidadeSearchTimeout = setTimeout(async () => {
        if (!searchTerm) {
          window.Administration.state.filteredData.cidades = null;
          window.Administration.state.currentSearchCidades = null;
          window.Administration.resetPagination("cidades");
          // Recarrega a primeira página quando limpa a busca
          await window.Administration.loadCidades(1, 50, null);
          return;
        }

        // Busca no servidor
        window.Administration.resetPagination("cidades");
        await window.Administration.loadCidades(1, 50, searchTerm);
      }, 500);
    });

  // Debounce para evitar muitas requisições enquanto o usuário digita
  let transportadoraSearchTimeout = null;

  document
    .getElementById("transportadoraSearchInput")
    ?.addEventListener("input", (e) => {
      const searchTerm = e.target.value.trim();

      // Limpa o timeout anterior
      if (transportadoraSearchTimeout) {
        clearTimeout(transportadoraSearchTimeout);
      }

      // Aguarda 500ms após o usuário parar de digitar antes de fazer a busca
      transportadoraSearchTimeout = setTimeout(async () => {
        if (!searchTerm) {
          window.Administration.state.filteredData.transportadoras = null;
          window.Administration.state.currentSearchTransportadoras = null;
          window.Administration.resetPagination("transportadoras");
          // Recarrega a primeira página quando limpa a busca
          await window.Administration.loadTransportadoras(1, 50, null);
          return;
        }

        // Busca no servidor
        window.Administration.resetPagination("transportadoras");
        await window.Administration.loadTransportadoras(1, 50, searchTerm);
      }, 500);
    });

  // Debounce para evitar muitas requisições enquanto o usuário digita
  let faixaPesoSearchTimeout = null;

  document
    .getElementById("faixaPesoSearchInput")
    ?.addEventListener("input", (e) => {
      const searchTerm = e.target.value.trim();

      // Limpa o timeout anterior
      if (faixaPesoSearchTimeout) {
        clearTimeout(faixaPesoSearchTimeout);
      }

      // Aguarda 500ms após o usuário parar de digitar antes de fazer a busca
      faixaPesoSearchTimeout = setTimeout(async () => {
        if (!searchTerm) {
          window.Administration.state.filteredData.faixasPeso = null;
          window.Administration.state.currentSearchFaixasPeso = null;
          window.Administration.resetPagination("faixasPeso");
          // Recarrega a primeira página quando limpa a busca
          await window.Administration.loadFaixasPeso(1, 50, null);
          return;
        }

        // Busca no servidor
        window.Administration.resetPagination("faixasPeso");
        await window.Administration.loadFaixasPeso(1, 50, searchTerm);
      }, 500);
    });

  // Debounce para evitar muitas requisições enquanto o usuário digita
  let rotaSearchTimeout = null;

  document.getElementById("rotaSearchInput")?.addEventListener("input", (e) => {
    const searchTerm = e.target.value.trim();

    // Limpa o timeout anterior
    if (rotaSearchTimeout) {
      clearTimeout(rotaSearchTimeout);
    }

    // Aguarda 500ms após o usuário parar de digitar antes de fazer a busca
    rotaSearchTimeout = setTimeout(async () => {
      if (!searchTerm) {
        window.Administration.state.filteredData.rotas = null;
        window.Administration.state.currentSearch = null;
        window.Administration.resetPagination("rotas");
        // Recarrega a primeira página quando limpa a busca
        await window.Administration.loadRotas(1, 50, null);
        return;
      }

      // Busca no servidor
      window.Administration.resetPagination("rotas");
      await window.Administration.loadRotas(1, 50, searchTerm);
    }, 500);
  });

  // Debounce para evitar muitas requisições enquanto o usuário digita
  let precoFaixaSearchTimeout = null;

  document
    .getElementById("precoFaixaSearchInput")
    ?.addEventListener("input", (e) => {
      const searchTerm = e.target.value.trim();

      // Limpa o timeout anterior
      if (precoFaixaSearchTimeout) {
        clearTimeout(precoFaixaSearchTimeout);
      }

      // Aguarda 500ms após o usuário parar de digitar antes de fazer a busca
      precoFaixaSearchTimeout = setTimeout(async () => {
        if (!searchTerm) {
          window.Administration.state.filteredData.precosFaixas = null;
          window.Administration.state.currentSearchPrecosFaixas = null;
          window.Administration.resetPagination("precosFaixas");
          // Recarrega a primeira página quando limpa a busca
          await window.Administration.loadPrecosFaixas(1, 50, null);
          return;
        }

        // Busca no servidor
        window.Administration.resetPagination("precosFaixas");
        await window.Administration.loadPrecosFaixas(1, 50, searchTerm);
      }, 500);
    });
};

window.Administration.initEntityEvents = function () {
  document.getElementById("createEstadoBtn")?.addEventListener("click", () => {
    window.Administration.openEstadoModal();
  });

  document.getElementById("createCidadeBtn")?.addEventListener("click", () => {
    window.Administration.openCidadeModal();
  });

  document
    .getElementById("createTransportadoraBtn")
    ?.addEventListener("click", () => {
      window.Administration.openTransportadoraModal();
    });

  document
    .getElementById("createFaixaPesoBtn")
    ?.addEventListener("click", () => {
      window.Administration.openFaixaPesoModal();
    });

  document.getElementById("createRotaBtn")?.addEventListener("click", () => {
    window.Administration.openRotaModal();
  });

  document
    .getElementById("createPrecoFaixaBtn")
    ?.addEventListener("click", () => {
      window.Administration.openPrecoFaixaModal();
    });

  document.getElementById("estadoForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    window.Administration.saveEstado();
  });
  document.getElementById("closeEstadoModal")?.addEventListener("click", () => {
    document.getElementById("estadoModal")?.classList.remove("active");
  });
  document.getElementById("cancelEstadoBtn")?.addEventListener("click", () => {
    document.getElementById("estadoModal")?.classList.remove("active");
  });

  document.getElementById("cidadeForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    window.Administration.saveCidade();
  });
  document.getElementById("closeCidadeModal")?.addEventListener("click", () => {
    document.getElementById("cidadeModal")?.classList.remove("active");
  });
  document.getElementById("cancelCidadeBtn")?.addEventListener("click", () => {
    document.getElementById("cidadeModal")?.classList.remove("active");
  });

  document
    .getElementById("transportadoraForm")
    ?.addEventListener("submit", (e) => {
      e.preventDefault();
      window.Administration.saveTransportadora();
    });
  document
    .getElementById("closeTransportadoraModal")
    ?.addEventListener("click", () => {
      document
        .getElementById("transportadoraModal")
        ?.classList.remove("active");
    });
  document
    .getElementById("cancelTransportadoraBtn")
    ?.addEventListener("click", () => {
      document
        .getElementById("transportadoraModal")
        ?.classList.remove("active");
    });

  document.getElementById("faixaPesoForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    window.Administration.saveFaixaPeso();
  });
  document
    .getElementById("closeFaixaPesoModal")
    ?.addEventListener("click", () => {
      document.getElementById("faixaPesoModal")?.classList.remove("active");
    });
  document
    .getElementById("cancelFaixaPesoBtn")
    ?.addEventListener("click", () => {
      document.getElementById("faixaPesoModal")?.classList.remove("active");
    });

  document.getElementById("rotaForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    window.Administration.saveRota();
  });
  document.getElementById("closeRotaModal")?.addEventListener("click", () => {
    document.getElementById("rotaModal")?.classList.remove("active");
  });
  document.getElementById("cancelRotaBtn")?.addEventListener("click", () => {
    document.getElementById("rotaModal")?.classList.remove("active");
  });

  document.getElementById("precoFaixaForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    window.Administration.savePrecoFaixa();
  });
  document
    .getElementById("closePrecoFaixaModal")
    ?.addEventListener("click", () => {
      document.getElementById("precoFaixaModal")?.classList.remove("active");
    });
  document
    .getElementById("cancelPrecoFaixaBtn")
    ?.addEventListener("click", () => {
      document.getElementById("precoFaixaModal")?.classList.remove("active");
    });

  // Event listeners para modais de rota-transportadora
  document
    .getElementById("closeRotaTransportadorasModal")
    ?.addEventListener("click", () => {
      document
        .getElementById("rotaTransportadorasModal")
        ?.classList.remove("active");
    });
  document
    .getElementById("closeRotaTransportadorasModalBtn")
    ?.addEventListener("click", () => {
      document
        .getElementById("rotaTransportadorasModal")
        ?.classList.remove("active");
    });

  document
    .getElementById("closeAddTransportadoraToRotaModal")
    ?.addEventListener("click", () => {
      document
        .getElementById("addTransportadoraToRotaModal")
        ?.classList.remove("active");
    });
  document
    .getElementById("cancelAddTransportadoraToRotaBtn")
    ?.addEventListener("click", () => {
      document
        .getElementById("addTransportadoraToRotaModal")
        ?.classList.remove("active");
    });

  document
    .getElementById("saveTransportadoraToRotaBtn")
    ?.addEventListener("click", () => {
      window.Administration.saveTransportadoraToRota();
    });

  document
    .getElementById("addTransportadoraToRotaBtn")
    ?.addEventListener("click", () => {
      const idRota = window.Administration.state.currentRotaId;
      if (idRota) {
        window.Administration.openAddTransportadoraToRotaModal(idRota);
      }
    });

  // Fechar modais ao clicar fora (backdrop)
  const rotaTransportadorasModal = document.getElementById(
    "rotaTransportadorasModal"
  );
  if (rotaTransportadorasModal) {
    rotaTransportadorasModal.addEventListener("click", (e) => {
      if (e.target === rotaTransportadorasModal) {
        rotaTransportadorasModal.classList.remove("active");
      }
    });
  }

  const addTransportadoraToRotaModal = document.getElementById(
    "addTransportadoraToRotaModal"
  );
  if (addTransportadoraToRotaModal) {
    addTransportadoraToRotaModal.addEventListener("click", (e) => {
      if (e.target === addTransportadoraToRotaModal) {
        addTransportadoraToRotaModal.classList.remove("active");
      }
    });
  }
};
