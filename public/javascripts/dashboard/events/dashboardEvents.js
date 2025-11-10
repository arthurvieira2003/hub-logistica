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
      const period = this.dataset.period;

      // Se for período customizado, abrir seletor de datas
      if (period === "custom") {
        window.DashboardEvents.openDatePicker();
        return;
      }

      // Remover classe active de todos os botões
      periodButtons.forEach((b) => b.classList.remove("active"));

      // Adicionar classe active ao botão clicado
      this.classList.add("active");

      // Atualizar display de datas para semana
      if (period === "week") {
        const today = new Date();
        const lastWeek = new Date();
        lastWeek.setDate(today.getDate() - 7);
        window.DashboardEvents.updateDateDisplay(
          lastWeek.toISOString().split("T")[0],
          today.toISOString().split("T")[0]
        );
      }

      // Carregar dados para o período selecionado
      if (window.DashboardData) {
        window.DashboardData.loadDashboardData(period);
      }
    });
  });
};

// Função para abrir seletor de datas
window.DashboardEvents.openDatePicker = function () {
  // Criar modal de seleção de datas
  const modal = document.createElement("div");
  modal.className = "dashboard-date-picker-modal";
  modal.innerHTML = `
    <div class="dashboard-date-picker-content">
      <div class="dashboard-date-picker-header">
        <h3>Selecionar Período</h3>
        <button class="dashboard-date-picker-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="dashboard-date-picker-body">
        <div class="date-picker-tabs">
          <button class="date-picker-tab active" data-tab="week">
            <i class="fas fa-calendar-week"></i>
            Semana
          </button>
          <button class="date-picker-tab" data-tab="day">
            <i class="fas fa-calendar-day"></i>
            Dia Específico
          </button>
        </div>
        
        <div class="date-picker-tab-content active" id="weekTab">
          <div class="date-input-group">
            <label>Selecione uma semana</label>
            <input type="week" id="weekPicker" class="date-input" />
            <small class="date-input-hint">Selecione a semana desejada no calendário</small>
          </div>
        </div>
        
        <div class="date-picker-tab-content" id="dayTab">
          <div class="date-input-group">
            <label>Selecione um dia</label>
            <input type="date" id="dayPicker" class="date-input" />
            <small class="date-input-hint">Selecione o dia desejado</small>
          </div>
        </div>
        
        <div class="date-picker-actions">
          <button class="date-picker-btn date-picker-cancel">Cancelar</button>
          <button class="date-picker-btn date-picker-apply">Aplicar</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Gerenciar tabs
  const tabs = modal.querySelectorAll(".date-picker-tab");
  const tabContents = modal.querySelectorAll(".date-picker-tab-content");
  
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.tab;
      
      // Atualizar tabs
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      
      // Atualizar conteúdo
      tabContents.forEach((content) => {
        content.classList.remove("active");
        if (content.id === `${tabName}Tab`) {
          content.classList.add("active");
        }
      });
    });
  });

  // Fechar modal ao clicar no X ou cancelar
  const closeBtn = modal.querySelector(".dashboard-date-picker-close");
  const cancelBtn = modal.querySelector(".date-picker-cancel");
  const applyBtn = modal.querySelector(".date-picker-apply");

  const closeModal = () => {
    modal.remove();
  };

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  // Aplicar seleção
  applyBtn.addEventListener("click", () => {
    const activeTab = modal.querySelector(".date-picker-tab.active");
    const tabType = activeTab.dataset.tab;

    if (tabType === "week") {
      const weekValue = document.getElementById("weekPicker").value;
      if (!weekValue) {
        alert("Por favor, selecione uma semana.");
        return;
      }

      // Converter semana para data inicial e final
      const [year, week] = weekValue.split("-W");
      const startDate = window.DashboardEvents.getDateFromWeek(year, week);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      // Atualizar display de datas
      window.DashboardEvents.updateDateDisplay(
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      );

      // Carregar dados para a semana selecionada
      if (window.DashboardData) {
        window.DashboardData.loadDashboardData(
          "custom",
          startDate.toISOString().split("T")[0],
          endDate.toISOString().split("T")[0]
        );
      }
    } else if (tabType === "day") {
      const dayValue = document.getElementById("dayPicker").value;
      if (!dayValue) {
        alert("Por favor, selecione um dia.");
        return;
      }

      // Atualizar display de datas (mostrar apenas o dia)
      const selectedDate = new Date(dayValue);
      const formatDate = (date) => {
        return date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      };

      const dateDisplay = document.getElementById("dateRangeText");
      if (dateDisplay) {
        dateDisplay.textContent = formatDate(selectedDate);
      }

      // Carregar dados para o dia selecionado
      if (window.DashboardData) {
        window.DashboardData.loadDashboardData(
          "custom",
          dayValue,
          dayValue
        );
      }
    }

    // Ativar botão de período customizado
    const customBtn = document.getElementById("customDateBtn");
    if (customBtn) {
      document.querySelectorAll(".period-btn").forEach((b) => b.classList.remove("active"));
      customBtn.classList.add("active");
    }

    closeModal();
  });

  // Fechar ao clicar fora do modal
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Definir valores padrão
  const today = new Date();
  const weekValue = window.DashboardEvents.getWeekFromDate(today);
  document.getElementById("weekPicker").value = weekValue;
  document.getElementById("dayPicker").value = today.toISOString().split("T")[0];
};

// Função para obter semana no formato YYYY-Www a partir de uma data
window.DashboardEvents.getWeekFromDate = function (date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
};

// Função para obter data inicial de uma semana (formato YYYY-Www)
window.DashboardEvents.getDateFromWeek = function (year, week) {
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dow = simple.getUTCDay();
  const ISOweekStart = simple;
  if (dow <= 4) {
    ISOweekStart.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
  } else {
    ISOweekStart.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
  }
  return ISOweekStart;
};

// Função para atualizar display de datas
window.DashboardEvents.updateDateDisplay = function (startDate, endDate) {
  const dateDisplay = document.getElementById("dateRangeText");
  if (!dateDisplay) return;

  const start = new Date(startDate);
  const end = new Date(endDate);

  const formatDate = (date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Se for o mesmo dia, mostrar apenas uma data
  if (startDate === endDate) {
    dateDisplay.textContent = formatDate(start);
  } else {
    dateDisplay.textContent = `${formatDate(start)} - ${formatDate(end)}`;
  }
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

      // Se for período customizado, obter datas do display
      let startDate = null;
      let endDate = null;
      if (period === "custom") {
        const dateText = document.getElementById("dateRangeText")?.textContent;
        if (dateText) {
          // Converter formato DD/MM/YYYY para YYYY-MM-DD
          const convertDate = (dateStr) => {
            const [day, month, year] = dateStr.split("/");
            return `${year}-${month}-${day}`;
          };

          if (dateText.includes(" - ")) {
            // Período (semana)
            const dates = dateText.split(" - ");
            startDate = convertDate(dates[0].trim());
            endDate = convertDate(dates[1].trim());
          } else {
            // Dia único
            startDate = convertDate(dateText.trim());
            endDate = startDate;
          }
        }
      }

      // Carregar dados
      if (window.DashboardData) {
        window.DashboardData.loadDashboardData(period, startDate, endDate);
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
  }
  // Removido o warning desnecessário - o sistema funciona sem o botão
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
          window.DashboardEvents.openDatePicker();
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
