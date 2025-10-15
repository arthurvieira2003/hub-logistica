// Dashboard Navigation Module - Sistema de navegação entre dashboard e rastreamento
window.DashboardNavigation = window.DashboardNavigation || {};

// Função para mostrar dashboard
window.DashboardNavigation.showDashboard = function () {
  const dashboardView = document.getElementById("dashboardView");
  const trackingView = document.getElementById("trackingView");

  if (dashboardView && trackingView) {
    // Garantir que o dashboard seja exibido
    dashboardView.classList.add("active");
    dashboardView.style.display = "block";

    // Garantir que o rastreamento seja ocultado
    trackingView.classList.remove("active");
    trackingView.style.display = "none";
  } else {
    console.error("❌ Elementos do dashboard não encontrados");
  }
};

// Função para mostrar rastreamento
window.DashboardNavigation.showTracking = function () {
  const dashboardView = document.getElementById("dashboardView");
  const trackingView = document.getElementById("trackingView");

  if (dashboardView && trackingView) {
    dashboardView.classList.remove("active");
    dashboardView.style.display = "none";
    trackingView.classList.add("active");
    trackingView.style.display = "block";

    // Remover o botão de voltar ao dashboard que está no topo da página (fora do header)
    const topButtonContainer = trackingView.querySelector(
      ".dashboard-access-simple:not(.rastreamento-header .dashboard-access-simple)"
    );
    if (topButtonContainer) {
      topButtonContainer.remove();
    }

    // Configurar header do rastreamento
    window.DashboardNavigation.setupTrackingHeader(trackingView);

    // Configurar visualizações
    window.DashboardNavigation.setupTrackingViews(trackingView);
  } else {
    console.error("❌ Elementos de visualização não encontrados");
    window.DashboardNavigation.createMissingElements();
  }
};

// Função para configurar header do rastreamento
window.DashboardNavigation.setupTrackingHeader = function (trackingView) {
  // Verificar se já existe um header de rastreamento
  const trackingHeader = trackingView.querySelector(".rastreamento-header");

  if (trackingHeader) {
    let titleRow = trackingHeader.querySelector(".dashboard-title-row");

    if (titleRow) {
      window.DashboardNavigation.setupTitleRow(titleRow);
    } else {
      titleRow = window.DashboardNavigation.createTitleRow();
      trackingHeader.insertBefore(titleRow, trackingHeader.firstChild);
    }
  } else {
    console.error("❌ Header do rastreamento não encontrado, criando um novo");
    const header = window.DashboardNavigation.createTrackingHeader();
    trackingView.insertBefore(header, trackingView.firstChild);
  }
};

// Função para configurar linha de título
window.DashboardNavigation.setupTitleRow = function (titleRow) {
  let buttonContainer = titleRow.querySelector(".dashboard-access-simple");
  let voltarButton = titleRow.querySelector("#voltarDashboardButton");

  if (!buttonContainer) {
    buttonContainer = document.createElement("div");
    buttonContainer.id = "voltarDashboardContainer";
    buttonContainer.className = "dashboard-access-simple";
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "flex-end";
    buttonContainer.style.visibility = "visible";
    buttonContainer.style.opacity = "1";
    buttonContainer.style.marginLeft = "auto";
    titleRow.appendChild(buttonContainer);
  }

  if (!voltarButton) {
    voltarButton = window.DashboardNavigation.createVoltarButton();
    buttonContainer.appendChild(voltarButton);
  } else {
    voltarButton.style.display = "flex";
    voltarButton.style.visibility = "visible";
    voltarButton.style.opacity = "1";

    // Garantir que o evento de clique esteja configurado
    voltarButton.addEventListener("click", function () {
      window.DashboardNavigation.showDashboard();
    });
  }
};

// Função para criar linha de título
window.DashboardNavigation.createTitleRow = function () {
  const titleRow = document.createElement("div");
  titleRow.className = "dashboard-title-row";
  titleRow.style.display = "flex";
  titleRow.style.justifyContent = "space-between";
  titleRow.style.alignItems = "center";
  titleRow.style.width = "100%";

  // Verificar se já existe um título h2 no header
  const existingTitle = document.querySelector(".rastreamento-header h2");

  if (existingTitle) {
    // Mover o título existente para o titleRow
    existingTitle.className = "dashboard-title";
    existingTitle.style.fontSize = "1.75rem";
    existingTitle.style.fontWeight = "600";
    existingTitle.style.margin = "0";

    // Clonar o título para evitar problemas de referência
    const titleClone = existingTitle.cloneNode(true);
    existingTitle.remove();
    titleRow.appendChild(titleClone);
  } else {
    const title = document.createElement("h2");
    title.className = "dashboard-title";
    title.textContent = "Rastreamento de Notas";
    title.style.fontSize = "1.75rem";
    title.style.fontWeight = "600";
    title.style.margin = "0";
    titleRow.appendChild(title);
  }

  // Criar o container do botão
  const buttonContainer = document.createElement("div");
  buttonContainer.id = "voltarDashboardContainer";
  buttonContainer.className = "dashboard-access-simple";
  buttonContainer.style.display = "flex";
  buttonContainer.style.justifyContent = "flex-end";
  buttonContainer.style.visibility = "visible";
  buttonContainer.style.opacity = "1";
  buttonContainer.style.marginLeft = "auto";

  // Criar o botão
  const voltarButton = window.DashboardNavigation.createVoltarButton();
  buttonContainer.appendChild(voltarButton);
  titleRow.appendChild(buttonContainer);

  return titleRow;
};

// Função para criar botão voltar
window.DashboardNavigation.createVoltarButton = function () {
  const voltarButton = document.createElement("button");
  voltarButton.id = "voltarDashboardButton";
  voltarButton.className = "voltar-dashboard-button";
  voltarButton.style.display = "flex";
  voltarButton.style.alignItems = "center";
  voltarButton.style.justifyContent = "center";
  voltarButton.style.gap = "0.5rem";
  voltarButton.style.padding = "0.6rem 1.2rem";
  voltarButton.style.backgroundColor = "#247675";
  voltarButton.style.color = "white";
  voltarButton.style.border = "none";
  voltarButton.style.borderRadius = "0.5rem";
  voltarButton.style.fontSize = "0.95rem";
  voltarButton.style.fontWeight = "600";
  voltarButton.style.cursor = "pointer";
  voltarButton.style.visibility = "visible";
  voltarButton.style.opacity = "1";
  voltarButton.style.zIndex = "9999";
  voltarButton.innerHTML = `
    <i class="fas fa-chart-line"></i>
    <span>Voltar ao Dashboard</span>
  `;

  // Adicionar evento de clique
  voltarButton.addEventListener("click", function () {
    window.DashboardNavigation.showDashboard();
  });

  return voltarButton;
};

// Função para criar header do rastreamento
window.DashboardNavigation.createTrackingHeader = function () {
  const header = document.createElement("div");
  header.className = "rastreamento-header";
  header.style.display = "flex";
  header.style.flexDirection = "column";
  header.style.gap = "1rem";
  header.style.marginBottom = "1.5rem";

  const titleRow = window.DashboardNavigation.createTitleRow();
  header.appendChild(titleRow);

  return header;
};

// Função para configurar visualizações do rastreamento
window.DashboardNavigation.setupTrackingViews = function (trackingView) {
  // Selecionar os botões de alternância de visualização
  const viewToggleButtons = trackingView.querySelectorAll(".view-toggle-btn");
  const tableViewButton = trackingView.querySelector(
    '.view-toggle-btn[data-view="table"]'
  );
  const cardsViewButton = trackingView.querySelector(
    '.view-toggle-btn[data-view="cards"]'
  );

  // Selecionar os containers de visualização
  const tableView = document.getElementById("tableView");
  const cardsView = document.getElementById("cardsView");

  if (
    viewToggleButtons &&
    tableViewButton &&
    cardsViewButton &&
    tableView &&
    cardsView
  ) {
    // Remover a classe ativa de todos os botões
    viewToggleButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    // Adicionar a classe ativa ao botão de tabela
    tableViewButton.classList.add("active");

    // Remover a classe active de todas as visualizações
    cardsView.classList.remove("active");
    tableView.classList.remove("active");

    // Adicionar a classe active à visualização de tabela
    tableView.classList.add("active");

    // Garantir que os dados da tabela sejam carregados
    if (typeof window.initRastreamento === "function") {
      window.initRastreamento(trackingView);
    } else {
      console.error("❌ Função initRastreamento não encontrada");
    }

    // Adicionar eventos de clique aos botões de alternância de visualização
    viewToggleButtons.forEach((btn) => {
      // Remover eventos existentes para evitar duplicação
      btn.removeEventListener(
        "click",
        window.DashboardNavigation.handleViewToggle
      );

      // Adicionar novo evento de clique
      btn.addEventListener(
        "click",
        window.DashboardNavigation.handleViewToggle
      );
    });
  } else {
    console.error("❌ Elementos de visualização não encontrados");
  }
};

// Função para lidar com a alternância de visualização
window.DashboardNavigation.handleViewToggle = function (event) {
  const viewType = event.currentTarget.dataset.view;
  const viewToggleButtons = document.querySelectorAll(".view-toggle-btn");
  const cardsView = document.getElementById("cardsView");
  const tableView = document.getElementById("tableView");

  // Remover classe active de todos os botões
  viewToggleButtons.forEach((btn) => {
    btn.classList.remove("active");
  });

  // Adicionar classe active ao botão clicado
  event.currentTarget.classList.add("active");

  // Remover classe active de todas as visualizações
  cardsView.classList.remove("active");
  tableView.classList.remove("active");

  // Adicionar classe active à visualização selecionada
  if (viewType === "cards") {
    cardsView.classList.add("active");

    // Garantir que os dados dos cards sejam carregados
    if (typeof window.initRastreamento === "function") {
      const trackingView = document.getElementById("trackingView");
      window.initRastreamento(trackingView);

      // Animar os cards após um pequeno atraso
      setTimeout(() => {
        if (typeof window.animateCards === "function") {
          window.animateCards();
        } else {
          const cards = document.querySelectorAll(".transportadora-card");
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.add("animate-in");
            }, 100 * index);
          });
        }
      }, 100);
    }
  } else if (viewType === "table") {
    tableView.classList.add("active");
  }
};

// Função para criar elementos ausentes
window.DashboardNavigation.createMissingElements = function () {
  // Verificar se o rastreamentoContent existe
  const rastreamentoContent = document.getElementById("rastreamentoContent");

  if (rastreamentoContent) {
    const dashboardView = document.getElementById("dashboardView");
    const trackingView = document.getElementById("trackingView");

    // Se não existe dashboardView, criar um
    if (!dashboardView) {
      const newDashboardView = document.createElement("div");
      newDashboardView.id = "dashboardView";
      newDashboardView.className = "dashboard-container";
      rastreamentoContent.appendChild(newDashboardView);
    }

    // Se não existe trackingView, criar um
    if (!trackingView) {
      const newTrackingView = document.createElement("div");
      newTrackingView.id = "trackingView";
      newTrackingView.className = "rastreamento-container active";
      newTrackingView.style.display = "block";

      // Criar a estrutura básica do trackingView
      newTrackingView.innerHTML = `
        <div class="rastreamento-header">
          <div class="dashboard-title-row">
            <h2>Rastreamento de Notas</h2>
          </div>
        </div>
        <div class="view-container">
          <div id="tableView" class="view-content active">
            <div class="tabela-container"></div>
          </div>
          <div id="cardsView" class="view-content"></div>
        </div>
      `;

      rastreamentoContent.appendChild(newTrackingView);

      // Inicializar o rastreamento
      if (window.initRastreamento) {
        window.initRastreamento(newTrackingView);
      }
    }

    // Tentar novamente
    setTimeout(() => {
      window.DashboardNavigation.showTracking();
    }, 100);
  } else {
    console.error("❌ Elemento rastreamentoContent não encontrado");
    window.DashboardNavigation.createRastreamentoContent();
  }
};

// Função para criar conteúdo de rastreamento
window.DashboardNavigation.createRastreamentoContent = function () {
  // Se o rastreamentoContent não existe, tentar encontrar o elemento main
  const mainElement = document.querySelector("main") || document.body;

  if (mainElement) {
    // Criar o rastreamentoContent
    const newRastreamentoContent = document.createElement("div");
    newRastreamentoContent.id = "rastreamentoContent";
    newRastreamentoContent.className = "tool-content active";

    // Criar o trackingView dentro do rastreamentoContent
    const newTrackingView = document.createElement("div");
    newTrackingView.id = "trackingView";
    newTrackingView.className = "rastreamento-container active";
    newTrackingView.style.display = "block";

    // Criar a estrutura básica do trackingView
    newTrackingView.innerHTML = `
      <div class="rastreamento-header">
        <div class="dashboard-title-row">
          <h2>Rastreamento de Notas</h2>
        </div>
      </div>
      <div class="view-container">
        <div id="tableView" class="view-content active">
          <div class="tabela-container"></div>
        </div>
        <div id="cardsView" class="view-content"></div>
      </div>
    `;

    newRastreamentoContent.appendChild(newTrackingView);
    mainElement.appendChild(newRastreamentoContent);

    // Inicializar o rastreamento
    if (window.initRastreamento) {
      window.initRastreamento(newTrackingView);
    }
  } else {
    console.error(
      "❌ Não foi possível encontrar um elemento para adicionar o conteúdo de rastreamento"
    );
  }
};

// Função para garantir que o botão de voltar ao dashboard esteja configurado
window.DashboardNavigation.setupVoltarDashboardButton = function () {
  // Verificar se o botão já existe
  let voltarButton = document.getElementById("voltarDashboardButton");

  // Se não existir, verificar se o trackingView existe
  if (!voltarButton) {
    const trackingView = document.getElementById("trackingView");

    // Se não há trackingView, não há necessidade de configurar o botão
    if (!trackingView) {
      return;
    }

    if (trackingView) {
      // Verificar se o container do botão existe
      const headerContainer = trackingView.querySelector(
        ".rastreamento-header"
      );

      if (headerContainer) {
        // Verificar se o container do botão existe
        let buttonContainer = headerContainer.querySelector(
          ".dashboard-access-simple"
        );

        // Se não existir, criar o container
        if (!buttonContainer) {
          const titleRow = headerContainer.querySelector(
            ".dashboard-title-row"
          );

          if (titleRow) {
            buttonContainer = document.createElement("div");
            buttonContainer.className = "dashboard-access-simple";
            buttonContainer.style.display = "flex";
            buttonContainer.style.justifyContent = "flex-end";
            buttonContainer.style.visibility = "visible";
            buttonContainer.style.opacity = "1";
            buttonContainer.style.marginLeft = "auto";
            titleRow.appendChild(buttonContainer);
          }
        }

        // Se o container existir, verificar se o botão existe
        if (buttonContainer) {
          voltarButton = buttonContainer.querySelector(
            ".voltar-dashboard-button"
          );
          // Se não existir, criar o botão
          if (!voltarButton) {
            voltarButton = window.DashboardNavigation.createVoltarButton();
            buttonContainer.appendChild(voltarButton);
          } else {
            // Garantir que o botão esteja visível
            voltarButton.style.display = "flex";
            voltarButton.style.visibility = "visible";
          }

          // Adicionar evento de clique ao botão
          voltarButton.addEventListener("click", () => {
            window.DashboardNavigation.showDashboard();
          });
        } else {
          console.error(
            "❌ Não foi possível encontrar ou criar o container do botão"
          );
        }
      } else {
        console.error("❌ Não foi possível encontrar o headerContainer");
      }
    } else {
      console.error("❌ Não foi possível encontrar o trackingView");
    }
  } else {
    // Garantir que o botão esteja visível
    voltarButton.style.display = "flex";
    voltarButton.style.visibility = "visible";
  }
};
