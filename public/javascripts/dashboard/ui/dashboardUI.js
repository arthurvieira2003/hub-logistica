// Dashboard UI Module - Sistema de interface e animações
// Versão: 2025-10-15-21:15 - Adição de todos os indicadores do dashboard
window.DashboardUI = window.DashboardUI || {};

// Função para aplicar larguras das barras de progresso
window.DashboardUI.applyProgressBarWidths = function () {
  const progressBars = document.querySelectorAll(".progress-bar[data-width]");
  progressBars.forEach((bar) => {
    const width = bar.getAttribute("data-width");
    bar.style.setProperty("--progress-width", `${width}%`);
  });
};

// Função para inicializar UI do dashboard
window.DashboardUI.initUI = function () {
  // Carregar CSS primeiro
  window.DashboardUI.loadDashboardCSS();

  // Criar estrutura imediatamente após CSS ser carregado
  window.DashboardUI.createDashboardStructure();
  window.DashboardUI.applyProgressBarWidths();
};

// Função para carregar CSS do dashboard
window.DashboardUI.loadDashboardCSS = function () {
  // Verificar se o CSS já foi carregado
  if (document.querySelector('link[href*="dashboard.css"]')) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "../styles/dashboard.css";
  link.onerror = () => {
    console.error("❌ [DashboardUI] Erro ao carregar CSS do dashboard");
    console.error("❌ [DashboardUI] Tentando caminho alternativo...");

    // Tentar caminho alternativo
    const linkAlt = document.createElement("link");
    linkAlt.rel = "stylesheet";
    linkAlt.href = "/styles/dashboard.css";
    linkAlt.onerror = () => {
      console.error(
        "❌ [DashboardUI] Erro ao carregar CSS com caminho alternativo"
      );
    };
    document.head.appendChild(linkAlt);
  };
  document.head.appendChild(link);
};

// Função para criar estrutura do dashboard
window.DashboardUI.createDashboardStructure = function () {
  // Verificar se a estrutura do dashboard existe e está completa
  const dashboardGrid = document.querySelector(".dashboard-grid");
  const dashboardView =
    document.getElementById("dashboardView") ||
    document.querySelector(".main-content");

  if (!dashboardView) {
    console.error(
      "❌ [DashboardUI] dashboardView ou main-content não encontrado"
    );
    return;
  }

  // Verificar se o dashboard tem todos os cards necessários
  const expectedCards = [
    "totalEntregas",
    "entregasNoPrazo",
    "entregasAtrasadas",
    "taxaEntrega",
    "custoTotal",
    "custoMedio",
  ];
  const existingCards = Array.from(
    dashboardGrid?.querySelectorAll(".dashboard-card") || []
  ).map((card) => card.id);
  const hasAllCards = expectedCards.every((cardId) =>
    existingCards.includes(cardId)
  );

  if (!dashboardGrid || !hasAllCards) {
    dashboardView.innerHTML = window.DashboardUI.getDashboardHTML();

    // Disparar evento após inserir HTML usando requestAnimationFrame para garantir que o DOM esteja atualizado
    requestAnimationFrame(() => {
      const event = new CustomEvent("dashboardStructureReady", {
        detail: { dashboardView },
      });
      document.dispatchEvent(event);
    });
  } else {
    // Disparar evento usando requestAnimationFrame para garantir consistência
    requestAnimationFrame(() => {
      const event = new CustomEvent("dashboardStructureReady", {
        detail: { dashboardView },
      });
      document.dispatchEvent(event);
    });
  }
};

// Função para obter HTML do dashboard
window.DashboardUI.getDashboardHTML = function () {
  return `
    <div class="dashboard-header">
      <div class="dashboard-title-row">
        <h2 class="dashboard-title">Dashboard de Logística</h2>
      </div>
      <p class="dashboard-subtitle">
        Visão geral das operações de entrega e rastreamento
      </p>

      <div class="dashboard-actions">
        <div class="dashboard-filters">
          <div class="period-selector">
            <button class="period-btn active" data-period="week">Semana</button>
            <button class="period-btn" data-period="month">Mês</button>
            <button class="period-btn" data-period="year">Ano</button>
          </div>

          <div class="dashboard-date">
            <i class="fas fa-calendar-alt"></i>
            <span>01/06/2023 - 30/06/2023</span>
          </div>
        </div>

        <div class="dashboard-controls">
          <button class="dashboard-refresh">
            <i class="fas fa-sync-alt"></i>
            <span>Atualizar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Grid de cards do dashboard -->
    <div class="dashboard-grid">
      <!-- Card de total de entregas -->
      <div class="dashboard-card card-col-2" id="totalEntregas">
        <div class="dashboard-card-header">
          <h3 class="dashboard-card-title">
            <i class="fas fa-box"></i>
            Total de Entregas
          </h3>
          <div class="dashboard-card-actions">
            <button class="card-action-button">
              <i class="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>
        <div class="dashboard-card-content">
          <div class="stat-card-content">
            <div class="stat-value">247</div>
            <div class="stat-label">Entregas no período</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i>
              12% em relação ao período anterior
            </div>
          </div>
        </div>
      </div>

      <!-- Card de entregas no prazo -->
      <div class="dashboard-card card-col-2" id="entregasNoPrazo">
        <div class="dashboard-card-header">
          <h3 class="dashboard-card-title">
            <i class="fas fa-check-circle"></i>
            Entregas no Prazo
          </h3>
        </div>
        <div class="dashboard-card-content">
          <div class="stat-card-content">
            <div class="stat-value">218</div>
            <div class="stat-label">Entregas realizadas no prazo</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i>
              8% em relação ao período anterior
            </div>
          </div>
        </div>
      </div>

      <!-- Card de entregas atrasadas -->
      <div class="dashboard-card card-col-2" id="entregasAtrasadas">
        <div class="dashboard-card-header">
          <h3 class="dashboard-card-title">
            <i class="fas fa-exclamation-triangle"></i>
            Entregas Atrasadas
          </h3>
        </div>
        <div class="dashboard-card-content">
          <div class="stat-card-content">
            <div class="stat-value">29</div>
            <div class="stat-label">Entregas com atraso</div>
            <div class="stat-change negative">
              <i class="fas fa-arrow-up"></i>
              5% em relação ao período anterior
            </div>
          </div>
        </div>
      </div>

      <!-- Card de taxa de entrega -->
      <div class="dashboard-card card-col-2" id="taxaEntrega">
        <div class="dashboard-card-header">
          <h3 class="dashboard-card-title">
            <i class="fas fa-percentage"></i>
            Taxa de Entrega
          </h3>
        </div>
        <div class="dashboard-card-content">
          <div class="circular-progress">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle
                class="circular-progress-background"
                cx="50"
                cy="50"
                r="40"
              />
              <circle class="circular-progress-value" cx="50" cy="50" r="40" />
            </svg>
            <div class="circular-progress-text">88%</div>
          </div>
          <div class="stat-label stat-label-center">
            Taxa de entregas no prazo
          </div>
        </div>
      </div>
      
      <!-- Card de custo total -->
      <div class="dashboard-card card-col-2" id="custoTotal">
        <div class="dashboard-card-header">
          <h3 class="dashboard-card-title">
            <i class="fas fa-dollar-sign"></i>
            Custo Total
          </h3>
        </div>
        <div class="dashboard-card-content">
          <div class="stat-card-content">
            <div class="stat-value">R$ 28.450,75</div>
            <div class="stat-label">Custo total de fretes</div>
            <div class="stat-change neutral">
              <i class="fas fa-equals"></i>
              2% em relação ao período anterior
            </div>
          </div>
        </div>
      </div>
      
      <!-- Card de custo médio -->
      <div class="dashboard-card card-col-2" id="custoMedio">
        <div class="dashboard-card-header">
          <h3 class="dashboard-card-title">
            <i class="fas fa-tags"></i>
            Custo Médio
          </h3>
        </div>
        <div class="dashboard-card-content">
          <div class="stat-card-content">
            <div class="stat-value">R$ 115,18</div>
            <div class="stat-label">Custo médio por entrega</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-down"></i>
              3% em relação ao período anterior
            </div>
          </div>
        </div>
      </div>

      <!-- Card de status das entregas -->
      <div class="dashboard-card card-col-4">
        <div class="dashboard-card-header">
          <h3 class="dashboard-card-title">
            <i class="fas fa-chart-pie"></i>
            Status das Entregas
          </h3>
        </div>
        <div class="dashboard-card-content">
          <div class="chart-container">
            <canvas id="statusChart"></canvas>
          </div>
          <div class="chart-legend">
            <div class="legend-item">
              <div class="legend-color" style="background-color: #22c55e"></div>
              <span>Entregue</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #ef4444"></div>
              <span>Atrasado</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #3b82f6"></div>
              <span>Em Trânsito</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #f59e0b"></div>
              <span>Aguardando Coleta</span>
            </div>
          </div>

          <div class="status-indicator-container">
            <div class="status-indicator-item status-entregue">
              <div class="status-indicator-value">218</div>
              <div class="status-indicator-label">Entregue</div>
            </div>
            <div class="status-indicator-item status-atrasado">
              <div class="status-indicator-value">29</div>
              <div class="status-indicator-label">Atrasado</div>
            </div>
            <div class="status-indicator-item status-transito">
              <div class="status-indicator-value">124</div>
              <div class="status-indicator-label">Em Trânsito</div>
            </div>
            <div class="status-indicator-item status-aguardando">
              <div class="status-indicator-value">76</div>
              <div class="status-indicator-label">Aguardando</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card de entregas por transportadora -->
      <div class="dashboard-card card-col-4">
        <div class="dashboard-card-header">
          <h3 class="dashboard-card-title">
            <i class="fas fa-truck"></i>
            Entregas por Transportadora
          </h3>
        </div>
        <div class="dashboard-card-content">
          <div class="chart-container">
            <canvas id="transportadorasChart"></canvas>
          </div>
        </div>
      </div>
      
      <!-- Card de distribuição regional -->
      <div class="dashboard-card card-col-4">
        <div class="dashboard-card-header">
          <h3 class="dashboard-card-title">
            <i class="fas fa-map-marked-alt"></i>
            Distribuição Regional
          </h3>
        </div>
        <div class="dashboard-card-content">
          <div class="chart-container">
            <canvas id="regioesChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Card de tempo médio de entrega -->
      <div class="dashboard-card card-col-3" id="tempoMedio">
        <div class="dashboard-card-header">
          <h3 class="dashboard-card-title">
            <i class="fas fa-clock"></i>
            Tempo Médio
          </h3>
        </div>
        <div class="dashboard-card-content">
          <div class="stat-card-content">
            <div class="stat-value">3.2 dias</div>
            <div class="stat-label">Tempo médio de entrega</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-down"></i>
              0.3 dias em relação ao período anterior
            </div>
          </div>
        </div>
      </div>
      
      <!-- Card de volume total -->
      <div class="dashboard-card card-col-3" id="volumeTotal">
        <div class="dashboard-card-header">
          <h3 class="dashboard-card-title">
            <i class="fas fa-cube"></i>
            Volume Total
          </h3>
        </div>
        <div class="dashboard-card-content">
          <div class="stat-card-content">
            <div class="stat-value">1.850 m³</div>
            <div class="stat-label">Volume total transportado</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i>
              8% em relação ao período anterior
            </div>
          </div>
        </div>
      </div>
      
      <!-- Card de peso total -->
      <div class="dashboard-card card-col-3" id="pesoTotal">
        <div class="dashboard-card-header">
          <h3 class="dashboard-card-title">
            <i class="fas fa-weight-hanging"></i>
            Peso Total
          </h3>
        </div>
        <div class="dashboard-card-content">
          <div class="stat-card-content">
            <div class="stat-value">4.320 kg</div>
            <div class="stat-label">Peso total transportado</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i>
              10% em relação ao período anterior
            </div>
          </div>
        </div>
      </div>
      
      <!-- Card de crescimento -->
      <div class="dashboard-card card-col-3" id="crescimento">
        <div class="dashboard-card-header">
          <h3 class="dashboard-card-title">
            <i class="fas fa-chart-line"></i>
            Crescimento
          </h3>
        </div>
        <div class="dashboard-card-content">
          <div class="stat-card-content">
            <div class="stat-value">+12%</div>
            <div class="stat-label">Crescimento em entregas</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i>
              3% acima da meta
            </div>
          </div>
        </div>
      </div>

      <!-- Card de entregas diárias -->
      <div class="dashboard-card card-col-6">
        <div class="dashboard-card-header">
          <h3 class="dashboard-card-title">
            <i class="fas fa-chart-line"></i>
            Entregas Diárias
          </h3>
        </div>
        <div class="dashboard-card-content">
          <div class="chart-container">
            <canvas id="dailyDeliveriesChart"></canvas>
          </div>
        </div>
      </div>
      
      <!-- Card de desempenho de transportadoras -->
      <div class="dashboard-card card-col-6">
        <div class="dashboard-card-header">
          <h3 class="dashboard-card-title">
            <i class="fas fa-star"></i>
            Desempenho de Transportadoras
          </h3>
        </div>
        <div class="dashboard-card-content">
          <div class="chart-container">
            <canvas id="desempenhoChart"></canvas>
          </div>
        </div>
      </div>
      
      <!-- Card de ocorrências -->
      <div class="dashboard-card card-col-6">
        <div class="dashboard-card-header">
          <h3 class="dashboard-card-title">
            <i class="fas fa-exclamation-circle"></i>
            Ocorrências
          </h3>
        </div>
        <div class="dashboard-card-content">
          <div class="chart-container">
            <canvas id="ocorrenciasChart"></canvas>
          </div>
          <div class="table-container">
            <table class="summary-table" id="ocorrenciasTable">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Atraso</td>
                  <td>29</td>
                </tr>
                <tr>
                  <td>Avaria</td>
                  <td>11</td>
                </tr>
                <tr>
                  <td>Extravio</td>
                  <td>5</td>
                </tr>
                <tr>
                  <td>Endereço incorreto</td>
                  <td>8</td>
                </tr>
                <tr>
                  <td>Destinatário ausente</td>
                  <td>14</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Card de SLA das transportadoras -->
      <div class="dashboard-card card-col-6">
        <div class="dashboard-card-header">
          <h3 class="dashboard-card-title">
            <i class="fas fa-handshake"></i>
            SLA das Transportadoras
          </h3>
        </div>
        <div class="dashboard-card-content">
          <div class="table-container">
            <table class="summary-table" id="slaTable">
              <thead>
                <tr>
                  <th>Transportadora</th>
                  <th>Cumprimento do SLA</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Jadlog</td>
                  <td>
                    <div class="progress-bar-container">
                      <div class="progress-bar progress-bar-success" data-width="92"></div>
                      <span>92%</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Correios</td>
                  <td>
                    <div class="progress-bar-container">
                      <div class="progress-bar progress-bar-warning" data-width="85"></div>
                      <span>85%</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Braspress</td>
                  <td>
                    <div class="progress-bar-container">
                      <div class="progress-bar progress-bar-success" data-width="90"></div>
                      <span>90%</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Jamef</td>
                  <td>
                    <div class="progress-bar-container">
                      <div class="progress-bar progress-bar-warning" data-width="88"></div>
                      <span>88%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Função para animar cards
window.DashboardUI.animateCards = function () {
  const cards = document.querySelectorAll(".dashboard-card");

  cards.forEach((card, index) => {
    // Remover animação anterior se existir
    card.classList.remove("animate-in");

    // Adicionar animação com delay
    setTimeout(() => {
      card.classList.add("animate-in");
    }, 100 * index);
  });
};

// Função para mostrar loading
window.DashboardUI.showLoading = function (container) {
  const loadingSpinner = document.createElement("div");
  loadingSpinner.className = "loading-spinner";
  loadingSpinner.id = "dashboard-loading";

  if (container) {
    container.appendChild(loadingSpinner);
  } else {
    const dashboardContainer = document.querySelector(".dashboard-container");
    if (dashboardContainer) {
      dashboardContainer.appendChild(loadingSpinner);
    }
  }
};

// Função para esconder loading
window.DashboardUI.hideLoading = function () {
  const loadingSpinner = document.getElementById("dashboard-loading");
  if (loadingSpinner) {
    loadingSpinner.remove();
  }
};

// Função para criar notificação
window.DashboardUI.showNotification = function (
  message,
  type = "info",
  duration = 3000
) {
  // Remover notificação anterior se existir
  const existingNotification = document.getElementById(
    "dashboard-notification"
  );
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement("div");
  notification.id = "dashboard-notification";
  notification.className = `dashboard-notification notification-${type}`;

  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${
        type === "success"
          ? "check-circle"
          : type === "error"
          ? "exclamation-circle"
          : "info-circle"
      }"></i>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(notification);

  // Remover após o tempo especificado
  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.add("slide-out");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }
  }, duration);
};

// Função para criar modal
window.DashboardUI.createModal = function (title, content, options = {}) {
  const modal = document.createElement("div");
  modal.className = "dashboard-modal";

  const modalContent = document.createElement("div");
  modalContent.className = "dashboard-modal-content";

  modalContent.innerHTML = `
    <div class="modal-header">
      <h3>${title}</h3>
      <button class="modal-close">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body">
      ${content}
    </div>
  `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Adicionar evento de fechamento
  const closeButton = modalContent.querySelector(".modal-close");
  closeButton.addEventListener("click", () => {
    window.DashboardUI.closeModal(modal);
  });

  // Fechar ao clicar fora do modal
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      window.DashboardUI.closeModal(modal);
    }
  });

  return modal;
};

// Função para fechar modal
window.DashboardUI.closeModal = function (modal) {
  if (modal && modal.parentNode) {
    modal.classList.add("fade-out");
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
};

// Função para criar tooltip
window.DashboardUI.createTooltip = function (element, text, position = "top") {
  const tooltip = document.createElement("div");
  tooltip.className = "dashboard-tooltip";
  tooltip.textContent = text;

  document.body.appendChild(tooltip);

  // Posicionar tooltip usando classes CSS
  const rect = element.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  // Adicionar classe de posição
  tooltip.classList.add(`tooltip-${position}`);

  switch (position) {
    case "top":
      tooltip.style.top = `${rect.top - tooltipRect.height - 8}px`;
      tooltip.style.left = `${
        rect.left + rect.width / 2 - tooltipRect.width / 2
      }px`;
      break;
    case "bottom":
      tooltip.style.top = `${rect.bottom + 8}px`;
      tooltip.style.left = `${
        rect.left + rect.width / 2 - tooltipRect.width / 2
      }px`;
      break;
    case "left":
      tooltip.style.top = `${
        rect.top + rect.height / 2 - tooltipRect.height / 2
      }px`;
      tooltip.style.left = `${rect.left - tooltipRect.width - 8}px`;
      break;
    case "right":
      tooltip.style.top = `${
        rect.top + rect.height / 2 - tooltipRect.height / 2
      }px`;
      tooltip.style.left = `${rect.right + 8}px`;
      break;
  }

  // Mostrar tooltip
  setTimeout(() => {
    tooltip.classList.add("tooltip-visible");
  }, 100);

  // Remover tooltip após 3 segundos
  setTimeout(() => {
    tooltip.classList.remove("tooltip-visible");
    setTimeout(() => {
      tooltip.remove();
    }, 300);
  }, 3000);

  return tooltip;
};
