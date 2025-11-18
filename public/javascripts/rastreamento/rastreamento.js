window.RastreamentoMain = window.RastreamentoMain || {};
window.RastreamentoMain.initRastreamento = async function (contentElement) {
  if (!contentElement) {
    contentElement = document.getElementById("trackingView");
    if (!contentElement) {
      console.error(
        "trackingView não encontrado e contentElement não fornecido"
      );
      return;
    }
  }

  if (!document.querySelector('link[href*="font-awesome"]')) {
    const fontAwesome = document.createElement("link");
    fontAwesome.rel = "stylesheet";
    fontAwesome.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css";
    document.head.appendChild(fontAwesome);
  }

  if (!window.RastreamentoAPI) {
    console.error("❌ RastreamentoAPI não encontrado");
    return;
  }
  if (!window.RastreamentoConfig) {
    console.error("❌ RastreamentoConfig não encontrado");
    return;
  }
  if (!window.RastreamentoUtils) {
    console.error("❌ RastreamentoUtils não encontrado");
    return;
  }

  try {
    await window.RastreamentoAPI.carregarDadosOuroNegro();

    await window.RastreamentoAPI.carregarDadosPrincesa();

    await window.RastreamentoAPI.carregarDadosGenericos();
  } catch (error) {
    console.error("❌ Erro ao carregar dados:", error);
  }

  let totalNotasAtrasadas = 0;
  let todasNotas = [];

  const transportadoras = window.RastreamentoConfig.transportadoras;

  transportadoras.forEach((transportadora) => {
    let notasAtrasadas = 0;

    transportadora.notas.forEach((nota) => {
      if (window.RastreamentoUtils.verificarNotaAtrasada(nota)) {
        nota.atrasada = true;
        nota.statusExibicao = "Atrasado";
        notasAtrasadas++;
        totalNotasAtrasadas++;
      } else {
        nota.atrasada = false;
        nota.statusExibicao = nota.status;
      }

      nota.transportadora = {
        id: transportadora.id,
        nome: transportadora.nome,
        cor: transportadora.cor,
        logo: transportadora.logo,
      };

      todasNotas.push(nota);
    });

    transportadora.notasAtrasadas = notasAtrasadas;

    transportadora.notas.sort((a, b) => {
      if (a.atrasada && !b.atrasada) return -1;
      if (!a.atrasada && b.atrasada) return 1;

      const dataA = new Date(a.previsaoEntrega);
      const dataB = new Date(b.previsaoEntrega);
      return dataA - dataB;
    });
  });

  todasNotas.sort((a, b) => {
    if (a.atrasada && !b.atrasada) return -1;
    if (!a.atrasada && b.atrasada) return 1;

    const dataA = new Date(a.previsaoEntrega);
    const dataB = new Date(b.previsaoEntrega);
    return dataA - dataB;
  });

  const trackingView = document.getElementById("trackingView");

  if (trackingView) {
    contentElement.innerHTML = "";

    let todasNotas = [];
    transportadoras.forEach((transportadora) => {
      if (transportadora.notas && transportadora.notas.length > 0) {
        transportadora.notas.forEach((nota) => {
          nota.transportadora = {
            id: transportadora.id,
            nome: transportadora.nome,
            cor: transportadora.cor,
            logo: transportadora.logo,
          };
          todasNotas.push(nota);
        });
      }
    });

    if (todasNotas.length > 0) {
      todasNotas.sort((a, b) => {
        const dataA = a.docDate
          ? new Date(a.docDate.split(" ")[0])
          : new Date(0);
        const dataB = b.docDate
          ? new Date(b.docDate.split(" ")[0])
          : new Date(0);
        if (dataB - dataA !== 0) {
          return dataB - dataA;
        }
        return parseInt(b.numero) - parseInt(a.numero);
      });

      const tabelaSimples = document.createElement("div");
      tabelaSimples.style.transition = "all 0.3s ease";
      tabelaSimples.style.animation = "fadeIn 0.5s ease-out forwards";

      tabelaSimples.innerHTML =
        window.RastreamentoDataTablesRenderer.renderizarTabela(todasNotas);

      trackingView.appendChild(tabelaSimples);

      await window.RastreamentoDataTablesRenderer.inicializarDataTable(todasNotas);

      window.RastreamentoEvents.configurarEventosData();
    } else {
      const containerVazio = document.createElement("div");
      containerVazio.style.transition = "all 0.3s ease";
      containerVazio.style.animation = "fadeIn 0.5s ease-out forwards";

      containerVazio.innerHTML =
        window.RastreamentoDataTablesRenderer.renderizarMensagemVazia();

      contentElement.appendChild(containerVazio);

      window.RastreamentoEvents.configurarEventosData();
    }
  }

  setTimeout(() => {
    try {
      if (
        typeof window.RastreamentoEvents.initRastreamentoEvents === "function"
      ) {
        window.RastreamentoEvents.initRastreamentoEvents();
      }

      if (typeof window.RastreamentoEvents.animateCards === "function") {
        window.RastreamentoEvents.animateCards();
      }
    } catch (error) {
      console.error("❌ Erro ao inicializar eventos:", error);
    }
  }, 100);
};

window.RastreamentoMain.reRenderizarTabela = async function () {
  const trackingView = document.getElementById("trackingView");
  if (!trackingView) {
    console.error("❌ trackingView não encontrado para re-renderização");
    return;
  }

  trackingView.innerHTML = "";

  const transportadoras = window.RastreamentoConfig.transportadoras;
  let todasNotas = [];

  transportadoras.forEach((transportadora) => {
    if (transportadora.notas && transportadora.notas.length > 0) {
      transportadora.notas.forEach((nota) => {
        nota.transportadora = {
          id: transportadora.id,
          nome: transportadora.nome,
          cor: transportadora.cor,
          logo: transportadora.logo,
        };
        todasNotas.push(nota);
      });
    }
  });

  if (todasNotas.length > 0) {
    todasNotas.sort((a, b) => {
      const dataA = a.docDate ? new Date(a.docDate.split(" ")[0]) : new Date(0);
      const dataB = b.docDate ? new Date(b.docDate.split(" ")[0]) : new Date(0);
      if (dataB - dataA !== 0) {
        return dataB - dataA;
      }
      return parseInt(b.numero) - parseInt(a.numero);
    });

    const tabelaSimples = document.createElement("div");
    tabelaSimples.style.transition = "all 0.3s ease";
    tabelaSimples.style.animation = "fadeIn 0.5s ease-out forwards";

    tabelaSimples.innerHTML =
      window.RastreamentoDataTablesRenderer.renderizarTabela(todasNotas);

    trackingView.appendChild(tabelaSimples);

    await window.RastreamentoDataTablesRenderer.inicializarDataTable(todasNotas);

    window.RastreamentoEvents.configurarEventosData();
  } else {
    const containerVazio = document.createElement("div");
    containerVazio.style.transition = "all 0.3s ease";
    containerVazio.style.animation = "fadeIn 0.5s ease-out forwards";

    containerVazio.innerHTML =
      window.RastreamentoDataTablesRenderer.renderizarMensagemVazia();

    trackingView.appendChild(containerVazio);

    window.RastreamentoEvents.configurarEventosData();
  }
};

window.initRastreamento = window.RastreamentoMain.initRastreamento;
window.reRenderizarTabela = window.RastreamentoMain.reRenderizarTabela;
window.animateCards = window.RastreamentoEvents.animateCards;
window.initRastreamentoEvents =
  window.RastreamentoEvents.initRastreamentoEvents;
