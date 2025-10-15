// Dashboard Events Module - Sistema de eventos e interações
window.DashboardEvents = window.DashboardEvents || {};

// Função para inicializar todos os eventos
window.DashboardEvents.initEvents = function () {
  try {
    window.DashboardEvents.initPeriodButtons();
    window.DashboardEvents.initRefreshButton();
    window.DashboardEvents.initDashboardTabs();
  } catch (error) {
    console.error(
      `❌ [DashboardEvents] Erro ao inicializar eventos básicos:`,
      error
    );
  }
};

// Função para inicializar botões de período
window.DashboardEvents.initPeriodButtons = function () {
  const periodButtons = document.querySelectorAll(".period-btn");
  periodButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remover classe active de todos os botões
      periodButtons.forEach((b) => b.classList.remove("active"));

      // Adicionar classe active ao botão clicado
      this.classList.add("active");

      // Carregar dados para o período selecionado
      if (window.DashboardData) {
        window.DashboardData.loadDashboardData(this.dataset.period);
      }
    });
  });
};

// Função para inicializar botão de atualização
window.DashboardEvents.initRefreshButton = function () {
  const refreshButton = document.querySelector(".dashboard-refresh");
  if (refreshButton) {
    refreshButton.addEventListener("click", function () {
      // Obter período ativo
      const activePeriodButton = document.querySelector(".period-btn.active");
      const period = activePeriodButton
        ? activePeriodButton.dataset.period
        : "week";

      // Carregar dados
      if (window.DashboardData) {
        window.DashboardData.loadDashboardData(period);
      }

      // Efeito de rotação no ícone
      const icon = this.querySelector("i");
      if (icon) {
        icon.style.transition = "transform 0.5s ease";
        icon.style.transform = "rotate(360deg)";

        setTimeout(() => {
          icon.style.transition = "none";
          icon.style.transform = "rotate(0deg)";
        }, 500);
      }
    });
  } else {
    console.warn("⚠️ Botão de atualização não encontrado");
  }
};

// Função para inicializar abas do dashboard
window.DashboardEvents.initDashboardTabs = function () {
  const dashboardTabs = document.querySelectorAll(".dashboard-tab");
  dashboardTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabId = this.dataset.tab;

      // Ativar aba
      dashboardTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      // Mostrar conteúdo da aba
      const tabContents = document.querySelectorAll(".dashboard-tab-content");
      tabContents.forEach((content) => {
        content.classList.remove("active");
        if (content.id === tabId) {
          content.classList.add("active");
        }
      });
    });
  });
};

// Função para inicializar eventos de cards
window.DashboardEvents.initCardEvents = function () {
  const cardActionButtons = document.querySelectorAll(".card-action-button");
  cardActionButtons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();

      // Aqui você pode adicionar lógica específica para cada card
      const card = this.closest(".dashboard-card");
      if (card) {
        const cardId = card.id;

        // Exemplo: mostrar modal ou detalhes
        window.DashboardEvents.showCardDetails(cardId);
      }
    });
  });
};

// Função para mostrar detalhes do card
window.DashboardEvents.showCardDetails = function (cardId) {
  // Aqui você pode implementar a lógica para mostrar detalhes
  // Por exemplo, abrir um modal ou navegar para uma página específica

  // Exemplo básico - apenas log
  switch (cardId) {
    case "totalEntregas":
      break;
    case "entregasNoPrazo":
      break;
    case "entregasAtrasadas":
      break;
    default:
  }
};

// Função para inicializar eventos de hover nos cards
window.DashboardEvents.initCardHoverEvents = function () {
  const cards = document.querySelectorAll(".dashboard-card");
  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-2px)";
      this.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.15)";
      this.style.transition = "all 0.3s ease";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
    });
  });
};

// Função para inicializar eventos de teclado
window.DashboardEvents.initKeyboardEvents = function () {
  document.addEventListener("keydown", function (e) {
    // Atalhos de teclado para o dashboard
    switch (e.key) {
      case "1":
        if (e.ctrlKey) {
          e.preventDefault();
          window.DashboardEvents.selectPeriod("week");
        }
        break;
      case "2":
        if (e.ctrlKey) {
          e.preventDefault();
          window.DashboardEvents.selectPeriod("month");
        }
        break;
      case "3":
        if (e.ctrlKey) {
          e.preventDefault();

          window.DashboardEvents.selectPeriod("year");
        }
        break;
      case "r":
        if (e.ctrlKey) {
          e.preventDefault();

          window.DashboardEvents.refreshData();
        }
        break;
    }
  });
};

// Função para selecionar período programaticamente
window.DashboardEvents.selectPeriod = function (period) {
  const periodButton = document.querySelector(
    `.period-btn[data-period="${period}"]`
  );
  if (periodButton) {
    periodButton.click();
  } else {
    console.error(`❌ Botão de período não encontrado: ${period}`);
  }
};

// Função para atualizar dados programaticamente
window.DashboardEvents.refreshData = function () {
  const refreshButton = document.querySelector(".dashboard-refresh");
  if (refreshButton) {
    refreshButton.click();
  } else {
    console.error("❌ Botão de atualização não encontrado");
  }
};

// Função para inicializar todos os eventos avançados
window.DashboardEvents.initAdvancedEvents = function () {
  window.DashboardEvents.initCardEvents();
  window.DashboardEvents.initCardHoverEvents();
  window.DashboardEvents.initKeyboardEvents();
};

// Versão: 2025-10-15-21:00 - Remoção completa do botão de rastreamento
