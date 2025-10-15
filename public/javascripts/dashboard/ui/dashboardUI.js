// Dashboard UI Module - Sistema de interface e animações
// Versão: 2025-10-15-21:15 - Adição de todos os indicadores do dashboard
window.DashboardUI = window.DashboardUI || {};

// Função para inicializar UI do dashboard
window.DashboardUI.initUI = function () {
  window.DashboardUI.addGlobalStyles();
  window.DashboardUI.createDashboardStructure();
  window.DashboardUI.animateCards();
};

// Função para adicionar estilos globais
window.DashboardUI.addGlobalStyles = function () {
  // Verificar se os estilos já foram adicionados
  if (document.getElementById("dashboard-global-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "dashboard-global-styles";
  style.textContent = `
    .dashboard-access-simple {
      display: flex !important;
      visibility: visible !important;
      opacity: 1 !important;
      justify-content: flex-end !important;
      margin-left: auto !important;
    }
    .voltar-dashboard-button, #voltarDashboardButton {
      display: flex !important;
      visibility: visible !important;
      opacity: 1 !important;
      background-color: #247675;
      color: white;
      padding: 0.6rem 1.2rem;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-weight: 600;
      font-size: 0.95rem;
      margin: 0;
      z-index: 9999;
    }
    .dashboard-title-row {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      width: 100% !important;
    }
    .rastreamento-header {
      margin-bottom: 1.5rem !important;
    }
    .dashboard-card {
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .dashboard-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    .animate-in {
      animation: fadeInUp 0.6s ease-out forwards;
    }
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #247675;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
};

// Função para criar estrutura do dashboard
window.DashboardUI.createDashboardStructure = function () {
  // Verificar se a estrutura do dashboard existe
  const dashboardGrid = document.querySelector(".dashboard-grid");

  if (!dashboardGrid) {
    // Criar estrutura básica do dashboard se não existir
    const dashboardView = document.getElementById("dashboardView");

    if (dashboardView) {
      // Verificar se o dashboardView já tem conteúdo

      if (dashboardView.children.length === 0) {
        dashboardView.innerHTML = window.DashboardUI.getDashboardHTML();
      }
    } else {
      console.error("❌ [DashboardUI] dashboardView não encontrado");
    }
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
          <div class="stat-label" style="text-align: center; margin-top: 1rem">
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
                      <div class="progress-bar progress-bar-success" style="width: 92%"></div>
                      <span>92%</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Correios</td>
                  <td>
                    <div class="progress-bar-container">
                      <div class="progress-bar progress-bar-warning" style="width: 85%"></div>
                      <span>85%</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Braspress</td>
                  <td>
                    <div class="progress-bar-container">
                      <div class="progress-bar progress-bar-success" style="width: 90%"></div>
                      <span>90%</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Jamef</td>
                  <td>
                    <div class="progress-bar-container">
                      <div class="progress-bar progress-bar-warning" style="width: 88%"></div>
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
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${
      type === "success" ? "#22c55e" : type === "error" ? "#ef4444" : "#3b82f6"
    };
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
    max-width: 300px;
    word-wrap: break-word;
  `;

  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem;">
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
      notification.style.animation = "slideOutRight 0.3s ease-out";
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
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease-out;
  `;

  const modalContent = document.createElement("div");
  modalContent.className = "dashboard-modal-content";
  modalContent.style.cssText = `
    background: white;
    border-radius: 0.5rem;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    animation: scaleIn 0.3s ease-out;
  `;

  modalContent.innerHTML = `
    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h3 style="margin: 0; color: #1f2937;">${title}</h3>
      <button class="modal-close" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280;">
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
    modal.style.animation = "fadeOut 0.3s ease-out";
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
  tooltip.style.cssText = `
    position: absolute;
    background: #1f2937;
    color: white;
    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    white-space: nowrap;
  `;

  document.body.appendChild(tooltip);

  // Posicionar tooltip
  const rect = element.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

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
    tooltip.style.opacity = "1";
  }, 100);

  // Remover tooltip após 3 segundos
  setTimeout(() => {
    tooltip.style.opacity = "0";
    setTimeout(() => {
      tooltip.remove();
    }, 300);
  }, 3000);

  return tooltip;
};

// Função para atualizar tema
window.DashboardUI.updateTheme = function (theme = "light") {
  const root = document.documentElement;

  if (theme === "dark") {
    root.style.setProperty("--bg-primary", "#1f2937");
    root.style.setProperty("--bg-secondary", "#374151");
    root.style.setProperty("--text-primary", "#f9fafb");
    root.style.setProperty("--text-secondary", "#d1d5db");
  } else {
    root.style.setProperty("--bg-primary", "#ffffff");
    root.style.setProperty("--bg-secondary", "#f9fafb");
    root.style.setProperty("--text-primary", "#1f2937");
    root.style.setProperty("--text-secondary", "#6b7280");
  }
};
