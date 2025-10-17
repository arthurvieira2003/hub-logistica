/**
 * Módulo Principal de Rastreamento
 * Orquestra todos os módulos e inicializa a interface de rastreamento
 */

// Namespace principal
window.RastreamentoMain = window.RastreamentoMain || {};

/**
 * Inicializa a interface de rastreamento
 * @param {HTMLElement} contentElement - Elemento onde será renderizado o conteúdo
 */
window.RastreamentoMain.initRastreamento = async function (contentElement) {
  // Verificar se contentElement foi fornecido, se não, tentar encontrar o trackingView
  if (!contentElement) {
    contentElement = document.getElementById("trackingView");
    if (!contentElement) {
      console.error(
        "trackingView não encontrado e contentElement não fornecido"
      );
      return;
    }
  }

  // Carregar Font Awesome se não estiver disponível
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const fontAwesome = document.createElement("link");
    fontAwesome.rel = "stylesheet";
    fontAwesome.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css";
    document.head.appendChild(fontAwesome);
  }

  // Verificar se os módulos estão carregados
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

  // Carregar dados reais da Ouro Negro, Princesa e outras transportadoras antes de processar a interface
  try {
    await window.RastreamentoAPI.carregarDadosOuroNegro();

    await window.RastreamentoAPI.carregarDadosPrincesa();

    await window.RastreamentoAPI.carregarDadosGenericos();
  } catch (error) {
    console.error("❌ Erro ao carregar dados:", error);
  }

  // Processar as notas para identificar as atrasadas
  let totalNotasAtrasadas = 0;
  let todasNotas = [];

  const transportadoras = window.RastreamentoConfig.transportadoras;

  transportadoras.forEach((transportadora) => {
    let notasAtrasadas = 0;

    transportadora.notas.forEach((nota) => {
      if (window.RastreamentoUtils.verificarNotaAtrasada(nota)) {
        nota.atrasada = true;
        // Manter o status original para referência, mas exibir como "Atrasado"
        nota.statusExibicao = "Atrasado";
        notasAtrasadas++;
        totalNotasAtrasadas++;
      } else {
        nota.atrasada = false;
        nota.statusExibicao = nota.status;
      }

      // Adicionar referência à transportadora para uso na tabela
      nota.transportadora = {
        id: transportadora.id,
        nome: transportadora.nome,
        cor: transportadora.cor,
        logo: transportadora.logo,
      };

      // Adicionar à lista de todas as notas para a visualização em tabela
      todasNotas.push(nota);
    });

    // Adicionar contador de notas atrasadas à transportadora
    transportadora.notasAtrasadas = notasAtrasadas;

    // Ordenar as notas: primeiro as atrasadas, depois por data de previsão
    transportadora.notas.sort((a, b) => {
      if (a.atrasada && !b.atrasada) return -1;
      if (!a.atrasada && b.atrasada) return 1;

      // Se ambas têm o mesmo status de atraso, ordenar por data de previsão
      const dataA = new Date(a.previsaoEntrega);
      const dataB = new Date(b.previsaoEntrega);
      return dataA - dataB;
    });
  });

  // Ordenar todas as notas para a visualização em tabela
  todasNotas.sort((a, b) => {
    if (a.atrasada && !b.atrasada) return -1;
    if (!a.atrasada && b.atrasada) return 1;

    // Se ambas têm o mesmo status de atraso, ordenar por data de previsão
    const dataA = new Date(a.previsaoEntrega);
    const dataB = new Date(b.previsaoEntrega);
    return dataA - dataB;
  });

  // Verificar se estamos usando a nova estrutura HTML com dashboard
  const dashboardView = document.getElementById("dashboardView");
  const trackingView = document.getElementById("trackingView");

  if (dashboardView && trackingView) {
    // Limpar o conteúdo existente do trackingView para evitar duplicação
    contentElement.innerHTML = "";

    // Obter todas as notas de todas as transportadoras
    let todasNotas = [];
    transportadoras.forEach((transportadora) => {
      if (transportadora.notas && transportadora.notas.length > 0) {
        transportadora.notas.forEach((nota) => {
          // Adicionar referência à transportadora para uso na tabela
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
      // Ordenar notas por data de faturamento (decrescente) e número da nota (decrescente)
      todasNotas.sort((a, b) => {
        // Primeiro critério: data de faturamento (decrescente)
        const dataA = a.docDate
          ? new Date(a.docDate.split(" ")[0])
          : new Date(0);
        const dataB = b.docDate
          ? new Date(b.docDate.split(" ")[0])
          : new Date(0);
        if (dataB - dataA !== 0) {
          return dataB - dataA;
        }
        // Segundo critério: número da nota (decrescente)
        return parseInt(b.numero) - parseInt(a.numero);
      });

      // Criar uma tabela simples
      const tabelaSimples = document.createElement("div");
      tabelaSimples.style.transition = "all 0.3s ease";
      tabelaSimples.style.animation = "fadeIn 0.5s ease-out forwards";

      tabelaSimples.innerHTML =
        window.RastreamentoDataTablesRenderer.renderizarTabela(todasNotas);

      trackingView.appendChild(tabelaSimples);

      // Inicializar DataTable
      window.RastreamentoDataTablesRenderer.inicializarDataTable(todasNotas);

      // Configurar eventos do datepicker
      window.RastreamentoEvents.configurarEventosData();
    } else {
      // Exibir mensagem quando não há notas, mas incluir o datepicker
      const containerVazio = document.createElement("div");
      containerVazio.style.transition = "all 0.3s ease";
      containerVazio.style.animation = "fadeIn 0.5s ease-out forwards";

      containerVazio.innerHTML =
        window.RastreamentoDataTablesRenderer.renderizarMensagemVazia();

      contentElement.appendChild(containerVazio);

      // Configurar eventos do datepicker mesmo quando não há notas

      window.RastreamentoEvents.configurarEventosData();
    }
  }

  // Inicializar os eventos após o HTML ser inserido
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

/**
 * Re-renderiza a tabela com os dados atualizados
 */
window.RastreamentoMain.reRenderizarTabela = async function () {
  const trackingView = document.getElementById("trackingView");
  if (!trackingView) {
    console.error("❌ trackingView não encontrado para re-renderização");
    return;
  }

  // Limpar conteúdo existente
  trackingView.innerHTML = "";

  // Obter todas as notas atualizadas
  const transportadoras = window.RastreamentoConfig.transportadoras;
  let todasNotas = [];

  transportadoras.forEach((transportadora) => {
    if (transportadora.notas && transportadora.notas.length > 0) {
      transportadora.notas.forEach((nota) => {
        // Adicionar referência à transportadora para uso na tabela
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
    // Ordenar notas por data de faturamento (decrescente) e número da nota (decrescente)
    todasNotas.sort((a, b) => {
      const dataA = a.docDate ? new Date(a.docDate.split(" ")[0]) : new Date(0);
      const dataB = b.docDate ? new Date(b.docDate.split(" ")[0]) : new Date(0);
      if (dataB - dataA !== 0) {
        return dataB - dataA;
      }
      return parseInt(b.numero) - parseInt(a.numero);
    });

    // Criar nova tabela
    const tabelaSimples = document.createElement("div");
    tabelaSimples.style.transition = "all 0.3s ease";
    tabelaSimples.style.animation = "fadeIn 0.5s ease-out forwards";

    tabelaSimples.innerHTML =
      window.RastreamentoDataTablesRenderer.renderizarTabela(todasNotas);

    trackingView.appendChild(tabelaSimples);

    // Inicializar DataTable
    window.RastreamentoDataTablesRenderer.inicializarDataTable(todasNotas);

    // Configurar eventos do datepicker
    window.RastreamentoEvents.configurarEventosData();
  } else {
    // Exibir mensagem quando não há notas
    const containerVazio = document.createElement("div");
    containerVazio.style.transition = "all 0.3s ease";
    containerVazio.style.animation = "fadeIn 0.5s ease-out forwards";

    containerVazio.innerHTML =
      window.RastreamentoDataTablesRenderer.renderizarMensagemVazia();

    trackingView.appendChild(containerVazio);

    // Configurar eventos do datepicker mesmo quando não há notas

    window.RastreamentoEvents.configurarEventosData();
  }
};

// Exportar as funções para uso global
window.initRastreamento = window.RastreamentoMain.initRastreamento;
window.reRenderizarTabela = window.RastreamentoMain.reRenderizarTabela;
window.animateCards = window.RastreamentoEvents.animateCards;
window.initRastreamentoEvents =
  window.RastreamentoEvents.initRastreamentoEvents;
