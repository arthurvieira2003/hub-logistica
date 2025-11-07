// Administration Events - Gerenciamento de eventos e busca
window.Administration = window.Administration || {};

window.Administration.initSearch = function () {
  const userSearch = document.getElementById("userSearchInput");
  const sessionSearch = document.getElementById("sessionSearchInput");
  const refreshSessionsBtn = document.getElementById("refreshSessionsBtn");

  userSearch?.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    if (!searchTerm) {
      // Se busca vazia, limpar filtro e mostrar todos
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
      window.Administration.renderSessions(window.Administration.state.sessions);
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

  // Busca para outras entidades
  document
    .getElementById("estadoSearchInput")
    ?.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      if (!searchTerm) {
        window.Administration.state.filteredData.estados = null;
        window.Administration.resetPagination("estados");
        window.Administration.renderEstados(window.Administration.state.estados);
        return;
      }
      const filtered = window.Administration.state.estados.filter(
        (estado) =>
          estado.uf.toLowerCase().includes(searchTerm) ||
          estado.nome_estado.toLowerCase().includes(searchTerm)
      );
      window.Administration.state.filteredData.estados = filtered;
      window.Administration.resetPagination("estados");
      window.Administration.renderEstados(filtered);
    });

  document
    .getElementById("cidadeSearchInput")
    ?.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      if (!searchTerm) {
        window.Administration.state.filteredData.cidades = null;
        window.Administration.resetPagination("cidades");
        window.Administration.renderCidades(window.Administration.state.cidades);
        return;
      }
      const filtered = window.Administration.state.cidades.filter(
        (cidade) =>
          cidade.nome_cidade.toLowerCase().includes(searchTerm) ||
          (cidade.Estado &&
            cidade.Estado.nome_estado.toLowerCase().includes(searchTerm))
      );
      window.Administration.state.filteredData.cidades = filtered;
      window.Administration.resetPagination("cidades");
      window.Administration.renderCidades(filtered);
    });

  document
    .getElementById("transportadoraSearchInput")
    ?.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      if (!searchTerm) {
        window.Administration.state.filteredData.transportadoras = null;
        window.Administration.resetPagination("transportadoras");
        window.Administration.renderTransportadoras(window.Administration.state.transportadoras);
        return;
      }
      const filtered = window.Administration.state.transportadoras.filter(
        (transp) =>
          transp.nome_transportadora.toLowerCase().includes(searchTerm) ||
          (transp.razao_social &&
            transp.razao_social.toLowerCase().includes(searchTerm))
      );
      window.Administration.state.filteredData.transportadoras = filtered;
      window.Administration.resetPagination("transportadoras");
      window.Administration.renderTransportadoras(filtered);
    });

  document
    .getElementById("faixaPesoSearchInput")
    ?.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      if (!searchTerm) {
        window.Administration.state.filteredData.faixasPeso = null;
        window.Administration.resetPagination("faixasPeso");
        window.Administration.renderFaixasPeso(window.Administration.state.faixasPeso);
        return;
      }
      const filtered = window.Administration.state.faixasPeso.filter(
        (faixa) =>
          faixa.descricao.toLowerCase().includes(searchTerm) ||
          faixa.peso_minimo.toString().includes(searchTerm) ||
          faixa.peso_maximo.toString().includes(searchTerm)
      );
      window.Administration.state.filteredData.faixasPeso = filtered;
      window.Administration.resetPagination("faixasPeso");
      window.Administration.renderFaixasPeso(filtered);
    });

  document.getElementById("rotaSearchInput")?.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    if (!searchTerm) {
      window.Administration.state.filteredData.rotas = null;
      window.Administration.resetPagination("rotas");
      window.Administration.renderRotas(window.Administration.state.rotas);
      return;
    }
    const filtered = window.Administration.state.rotas.filter((rota) => {
      const origem = rota.Cidade || rota.CidadeOrigem;
      const destino = rota.CidadeDestino;
      return (
        (origem && origem.nome_cidade.toLowerCase().includes(searchTerm)) ||
        (destino && destino.nome_cidade.toLowerCase().includes(searchTerm))
      );
    });
    window.Administration.state.filteredData.rotas = filtered;
    window.Administration.resetPagination("rotas");
    window.Administration.renderRotas(filtered);
  });

  document
    .getElementById("precoFaixaSearchInput")
    ?.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      if (!searchTerm) {
        window.Administration.state.filteredData.precosFaixas = null;
        window.Administration.resetPagination("precosFaixas");
        window.Administration.renderPrecosFaixas(window.Administration.state.precosFaixas);
        return;
      }
      const filtered = window.Administration.state.precosFaixas.filter(
        (preco) => {
          const rota = preco.Rota;
          const faixa = preco.FaixasPeso;
          const transp = preco.Transportadora;
          return (
            (rota &&
              rota.Cidade &&
              rota.Cidade.nome_cidade.toLowerCase().includes(searchTerm)) ||
            (faixa && faixa.descricao.toLowerCase().includes(searchTerm)) ||
            (transp &&
              transp.nome_transportadora.toLowerCase().includes(searchTerm))
          );
        }
      );
      window.Administration.state.filteredData.precosFaixas = filtered;
      window.Administration.resetPagination("precosFaixas");
      window.Administration.renderPrecosFaixas(filtered);
    });
};

window.Administration.initEntityEvents = function () {
  // Event listeners para botões de criar
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

  // Event listeners para modais de estados
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

  // Event listeners para modais de cidades
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

  // Event listeners para modais de transportadoras
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

  // Event listeners para modais de faixas de peso
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

  // Event listeners para modais de rotas
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

  // Event listeners para modais de preços de faixas
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
};

