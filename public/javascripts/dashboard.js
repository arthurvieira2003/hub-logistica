// Dashboard de Logística - Funcionalidades

document.addEventListener("DOMContentLoaded", function () {
  initDashboard();
});

function initDashboard() {
  // Verificar se a estrutura do dashboard existe
  const dashboardGrid = document.querySelector(".dashboard-grid");

  if (!dashboardGrid) {
    console.error(
      "Estrutura do dashboard não encontrada. Criando estrutura básica..."
    );

    // Criar estrutura básica do dashboard se não existir
    const dashboardView = document.getElementById("dashboardView");
    if (dashboardView) {
      // Verificar se o dashboardView já tem conteúdo
      if (dashboardView.children.length === 0) {
        dashboardView.innerHTML = `
          <div class="dashboard-header">
            <div class="dashboard-title-row">
              <h2 class="dashboard-title">Dashboard de Logística</h2>
              <div class="rastreamento-access-simple">
                <button class="rastreamento-access-button" id="rastreamentoButton">
                  <i class="fas fa-truck"></i>
                  <span>Acessar Rastreamento</span>
                </button>
              </div>
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
          </div>
        `;
      }
    }
  }

  // Inicializar animações dos cards
  animateCards();

  // Inicializar gráficos
  initCharts();

  // Inicializar eventos
  initEvents();

  // Inicializar dados
  loadDashboardData();
}

function animateCards() {
  const cards = document.querySelectorAll(".dashboard-card");

  cards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add("animate-in");
    }, 100 * index);
  });
}

function initEvents() {
  // Botões de período
  const periodButtons = document.querySelectorAll(".period-btn");
  periodButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      periodButtons.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      loadDashboardData(this.dataset.period);
    });
  });

  // Botão de atualizar
  const refreshButton = document.querySelector(".dashboard-refresh");
  if (refreshButton) {
    refreshButton.addEventListener("click", function () {
      loadDashboardData();

      // Efeito de rotação no ícone
      const icon = this.querySelector("i");
      icon.style.transition = "transform 0.5s ease";
      icon.style.transform = "rotate(360deg)";

      setTimeout(() => {
        icon.style.transition = "none";
        icon.style.transform = "rotate(0deg)";
      }, 500);
    });
  }

  // Abas do dashboard
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
}

function loadDashboardData(period = "week") {
  // Simular carregamento
  const loadingSpinner = document.createElement("div");
  loadingSpinner.className = "loading-spinner";

  const dashboardContainer = document.querySelector(".dashboard-container");
  if (dashboardContainer) {
    dashboardContainer.appendChild(loadingSpinner);

    // Simular tempo de carregamento
    setTimeout(() => {
      dashboardContainer.removeChild(loadingSpinner);
      updateDashboardData(period);
    }, 800);
  }
}

function updateDashboardData(period) {
  // Dados simulados para diferentes períodos
  const data = {
    week: {
      totalEntregas: 247,
      entregasNoPrazo: 218,
      entregasAtrasadas: 29,
      taxaEntrega: 88,
      crescimento: 12,
      custoTotal: 28450.75,
      custoMedio: 115.18,
      tempoMedioEntrega: 3.2,
      volumeTotal: 1850,
      pesoTotal: 4320,
      transportadoras: {
        Jadlog: 87,
        Correios: 65,
        Braspress: 52,
        Jamef: 43,
      },
      desempenhoTransportadoras: [
        { nome: "Jadlog", pontualidade: 92, avarias: 2, extravio: 1 },
        { nome: "Correios", pontualidade: 85, avarias: 5, extravio: 3 },
        { nome: "Braspress", pontualidade: 90, avarias: 1, extravio: 0 },
        { nome: "Jamef", pontualidade: 88, avarias: 3, extravio: 1 },
      ],
      regioes: {
        Sudeste: 120,
        Sul: 45,
        Nordeste: 38,
        "Centro-Oeste": 28,
        Norte: 16,
      },
      statusDistribution: [218, 29, 124, 76],
      dailyDeliveries: [32, 38, 41, 35, 37, 42, 22],
      ocorrencias: [
        { tipo: "Atraso", quantidade: 29 },
        { tipo: "Avaria", quantidade: 11 },
        { tipo: "Extravio", quantidade: 5 },
        { tipo: "Endereço incorreto", quantidade: 8 },
        { tipo: "Destinatário ausente", quantidade: 14 },
      ],
      slaTransportadoras: [
        { nome: "Jadlog", cumprimento: 92 },
        { nome: "Correios", cumprimento: 85 },
        { nome: "Braspress", cumprimento: 90 },
        { nome: "Jamef", cumprimento: 88 },
      ],
    },
    month: {
      totalEntregas: 1023,
      entregasNoPrazo: 912,
      entregasAtrasadas: 111,
      taxaEntrega: 89,
      crescimento: 8,
      custoTotal: 118450.5,
      custoMedio: 115.79,
      tempoMedioEntrega: 3.4,
      volumeTotal: 7650,
      pesoTotal: 18250,
      transportadoras: {
        Jadlog: 342,
        Correios: 287,
        Braspress: 214,
        Jamef: 180,
      },
      desempenhoTransportadoras: [
        { nome: "Jadlog", pontualidade: 91, avarias: 8, extravio: 4 },
        { nome: "Correios", pontualidade: 84, avarias: 18, extravio: 12 },
        { nome: "Braspress", pontualidade: 89, avarias: 6, extravio: 2 },
        { nome: "Jamef", pontualidade: 87, avarias: 10, extravio: 5 },
      ],
      regioes: {
        Sudeste: 495,
        Sul: 186,
        Nordeste: 157,
        "Centro-Oeste": 116,
        Norte: 69,
      },
      statusDistribution: [912, 111, 487, 425],
      dailyDeliveries: [
        32, 38, 41, 35, 37, 42, 22, 36, 39, 41, 38, 35, 32, 30, 33, 36, 39, 42,
        45, 40, 38, 35, 33, 30, 28, 32, 35, 38, 40, 42,
      ],
      ocorrencias: [
        { tipo: "Atraso", quantidade: 111 },
        { tipo: "Avaria", quantidade: 42 },
        { tipo: "Extravio", quantidade: 23 },
        { tipo: "Endereço incorreto", quantidade: 35 },
        { tipo: "Destinatário ausente", quantidade: 58 },
      ],
      slaTransportadoras: [
        { nome: "Jadlog", cumprimento: 91 },
        { nome: "Correios", cumprimento: 84 },
        { nome: "Braspress", cumprimento: 89 },
        { nome: "Jamef", cumprimento: 87 },
      ],
    },
    year: {
      totalEntregas: 12458,
      entregasNoPrazo: 11234,
      entregasAtrasadas: 1224,
      taxaEntrega: 90,
      crescimento: 15,
      custoTotal: 1425680.25,
      custoMedio: 114.44,
      tempoMedioEntrega: 3.3,
      volumeTotal: 92450,
      pesoTotal: 215680,
      transportadoras: {
        Jadlog: 4235,
        Correios: 3542,
        Braspress: 2687,
        Jamef: 1994,
      },
      desempenhoTransportadoras: [
        { nome: "Jadlog", pontualidade: 92, avarias: 85, extravio: 42 },
        { nome: "Correios", pontualidade: 86, avarias: 120, extravio: 95 },
        { nome: "Braspress", pontualidade: 91, avarias: 65, extravio: 28 },
        { nome: "Jamef", pontualidade: 89, avarias: 72, extravio: 35 },
      ],
      regioes: {
        Sudeste: 6025,
        Sul: 2268,
        Nordeste: 1912,
        "Centro-Oeste": 1412,
        Norte: 841,
      },
      statusDistribution: [11234, 1224, 5876, 5358],
      dailyDeliveries: [
        980, 1050, 1120, 1080, 1150, 1200, 1180, 1100, 1050, 1020, 1080, 1150,
      ],
      ocorrencias: [
        { tipo: "Atraso", quantidade: 1224 },
        { tipo: "Avaria", quantidade: 342 },
        { tipo: "Extravio", quantidade: 200 },
        { tipo: "Endereço incorreto", quantidade: 425 },
        { tipo: "Destinatário ausente", quantidade: 685 },
      ],
      slaTransportadoras: [
        { nome: "Jadlog", cumprimento: 92 },
        { nome: "Correios", cumprimento: 86 },
        { nome: "Braspress", cumprimento: 91 },
        { nome: "Jamef", cumprimento: 89 },
      ],
    },
  };

  // Atualizar estatísticas
  updateStatistics(data[period]);

  // Atualizar gráficos
  updateCharts(data[period]);
}

function updateStatistics(data) {
  // Total de entregas
  const totalEntregasElement = document.querySelector(
    "#totalEntregas .stat-value"
  );
  if (totalEntregasElement) {
    totalEntregasElement.textContent = data.totalEntregas;
  }

  // Entregas no prazo
  const entregasNoPrazoElement = document.querySelector(
    "#entregasNoPrazo .stat-value"
  );
  if (entregasNoPrazoElement) {
    entregasNoPrazoElement.textContent = data.entregasNoPrazo;
  }

  // Entregas atrasadas
  const entregasAtrasadasElement = document.querySelector(
    "#entregasAtrasadas .stat-value"
  );
  if (entregasAtrasadasElement) {
    entregasAtrasadasElement.textContent = data.entregasAtrasadas;
  }

  // Taxa de entrega
  const taxaEntregaElement = document.querySelector(".circular-progress-text");
  if (taxaEntregaElement) {
    taxaEntregaElement.textContent = data.taxaEntrega + "%";
  }

  // Custo total
  const custoTotalElement = document.querySelector("#custoTotal .stat-value");
  if (custoTotalElement) {
    custoTotalElement.textContent =
      "R$ " +
      data.custoTotal.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  }

  // Custo médio
  const custoMedioElement = document.querySelector("#custoMedio .stat-value");
  if (custoMedioElement) {
    custoMedioElement.textContent =
      "R$ " +
      data.custoMedio.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  }

  // Tempo médio de entrega
  const tempoMedioElement = document.querySelector("#tempoMedio .stat-value");
  if (tempoMedioElement) {
    tempoMedioElement.textContent = data.tempoMedioEntrega.toFixed(1) + " dias";
  }

  // Volume total
  const volumeTotalElement = document.querySelector("#volumeTotal .stat-value");
  if (volumeTotalElement) {
    volumeTotalElement.textContent =
      data.volumeTotal.toLocaleString("pt-BR") + " m³";
  }

  // Peso total
  const pesoTotalElement = document.querySelector("#pesoTotal .stat-value");
  if (pesoTotalElement) {
    pesoTotalElement.textContent =
      data.pesoTotal.toLocaleString("pt-BR") + " kg";
  }

  // Crescimento
  const crescimentoElement = document.querySelector("#crescimento .stat-value");
  if (crescimentoElement) {
    crescimentoElement.textContent = "+" + data.crescimento + "%";
  }

  // Atualizar progresso circular
  updateCircularProgress(data.taxaEntrega);

  // Atualizar indicadores de status
  updateStatusIndicators(data.statusDistribution);

  // Atualizar tabela de ocorrências
  updateOcorrenciasTable(data.ocorrencias);

  // Atualizar tabela de SLA das transportadoras
  updateSLATable(data.slaTransportadoras);
}

function updateCircularProgress(percentage) {
  const circle = document.querySelector(".circular-progress-value");
  const text = document.querySelector(".circular-progress-text");

  if (circle && text) {
    // Calcular o valor do traço
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;

    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset =
      circumference - (percentage / 100) * circumference;

    text.textContent = percentage + "%";
  }
}

function updateStatusIndicators(statusData) {
  const [entregue, atrasado, transito, aguardando] = statusData;

  const entregueElement = document.querySelector(
    ".status-entregue .status-indicator-value"
  );
  const atrasadoElement = document.querySelector(
    ".status-atrasado .status-indicator-value"
  );
  const transitoElement = document.querySelector(
    ".status-transito .status-indicator-value"
  );
  const aguardandoElement = document.querySelector(
    ".status-aguardando .status-indicator-value"
  );

  if (entregueElement) entregueElement.textContent = entregue;
  if (atrasadoElement) atrasadoElement.textContent = atrasado;
  if (transitoElement) transitoElement.textContent = transito;
  if (aguardandoElement) aguardandoElement.textContent = aguardando;
}

function initCharts() {
  // Verificar se Chart.js está disponível
  if (typeof Chart === "undefined") {
    console.warn(
      "Chart.js não está disponível. Os gráficos não serão renderizados."
    );
    return;
  }

  // Gráfico de distribuição de status
  initStatusChart();

  // Gráfico de entregas por transportadora
  initTransportadorasChart();

  // Gráfico de entregas diárias
  initDailyDeliveriesChart();

  // Gráfico de distribuição regional
  initRegioesChart();

  // Gráfico de desempenho de transportadoras
  initDesempenhoChart();

  // Gráfico de tipos de ocorrências
  initOcorrenciasChart();
}

function initStatusChart() {
  const ctx = document.getElementById("statusChart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Entregue", "Atrasado", "Em Trânsito", "Aguardando Coleta"],
      datasets: [
        {
          data: [218, 29, 124, 76],
          backgroundColor: ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

function initTransportadorasChart() {
  const ctx = document.getElementById("transportadorasChart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Jadlog", "Correios", "Braspress", "Jamef"],
      datasets: [
        {
          label: "Entregas",
          data: [87, 65, 52, 43],
          backgroundColor: "#247675",
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            drawBorder: false,
          },
        },
        x: {
          grid: {
            display: false,
            drawBorder: false,
          },
        },
      },
    },
  });
}

function initDailyDeliveriesChart() {
  const ctx = document.getElementById("dailyDeliveriesChart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
      datasets: [
        {
          label: "Entregas",
          data: [32, 38, 41, 35, 37, 42, 22],
          borderColor: "#247675",
          backgroundColor: "rgba(36, 118, 117, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#247675",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            drawBorder: false,
          },
        },
        x: {
          grid: {
            display: false,
            drawBorder: false,
          },
        },
      },
    },
  });
}

function initRegioesChart() {
  const ctx = document.getElementById("regioesChart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Sudeste", "Sul", "Nordeste", "Centro-Oeste", "Norte"],
      datasets: [
        {
          data: [120, 45, 38, 28, 16],
          backgroundColor: [
            "#3b82f6",
            "#22c55e",
            "#f59e0b",
            "#8b5cf6",
            "#ec4899",
          ],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            boxWidth: 15,
            padding: 15,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

function initDesempenhoChart() {
  const ctx = document.getElementById("desempenhoChart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "radar",
    data: {
      labels: [
        "Pontualidade",
        "Integridade",
        "Rastreabilidade",
        "Atendimento",
        "Custo-benefício",
      ],
      datasets: [
        {
          label: "Jadlog",
          data: [92, 90, 85, 88, 82],
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          borderColor: "rgba(59, 130, 246, 1)",
          pointBackgroundColor: "rgba(59, 130, 246, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(59, 130, 246, 1)",
        },
        {
          label: "Correios",
          data: [85, 82, 90, 80, 88],
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          borderColor: "rgba(34, 197, 94, 1)",
          pointBackgroundColor: "rgba(34, 197, 94, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(34, 197, 94, 1)",
        },
        {
          label: "Braspress",
          data: [90, 92, 82, 85, 78],
          backgroundColor: "rgba(245, 158, 11, 0.2)",
          borderColor: "rgba(245, 158, 11, 1)",
          pointBackgroundColor: "rgba(245, 158, 11, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(245, 158, 11, 1)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: {
            display: true,
          },
          suggestedMin: 50,
          suggestedMax: 100,
        },
      },
    },
  });
}

function initOcorrenciasChart() {
  const ctx = document.getElementById("ocorrenciasChart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: [
        "Atraso",
        "Avaria",
        "Extravio",
        "Endereço incorreto",
        "Destinatário ausente",
      ],
      datasets: [
        {
          label: "Ocorrências",
          data: [29, 11, 5, 8, 14],
          backgroundColor: [
            "rgba(239, 68, 68, 0.7)",
            "rgba(245, 158, 11, 0.7)",
            "rgba(139, 92, 246, 0.7)",
            "rgba(59, 130, 246, 0.7)",
            "rgba(236, 72, 153, 0.7)",
          ],
          borderWidth: 0,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            drawBorder: false,
          },
        },
        x: {
          grid: {
            display: false,
            drawBorder: false,
          },
        },
      },
    },
  });
}

function updateCharts(data) {
  // Atualizar gráficos com novos dados
  // Na implementação real, você armazenaria as instâncias dos gráficos
  // e usaria o método .update() para atualizar os dados

  // Como alternativa, podemos recriar os gráficos
  // Isso é uma simplificação para este exemplo

  // Destruir gráficos existentes
  Chart.helpers.each(Chart.instances, function (instance) {
    instance.destroy();
  });

  // Reinicializar gráficos com novos dados
  initCharts();

  // Atualizar dados específicos para cada gráfico
  updateTransportadorasChart(data.transportadoras);
  updateRegioesChart(data.regioes);
  updateOcorrenciasChartData(data.ocorrencias);
}

function updateTransportadorasChart(data) {
  const chart = Chart.getChart("transportadorasChart");
  if (!chart) return;

  const labels = Object.keys(data);
  const values = Object.values(data);

  chart.data.labels = labels;
  chart.data.datasets[0].data = values;
  chart.update();
}

function updateRegioesChart(data) {
  const chart = Chart.getChart("regioesChart");
  if (!chart) return;

  const labels = Object.keys(data);
  const values = Object.values(data);

  chart.data.labels = labels;
  chart.data.datasets[0].data = values;
  chart.update();
}

function updateOcorrenciasChartData(data) {
  const chart = Chart.getChart("ocorrenciasChart");
  if (!chart) return;

  const labels = data.map((item) => item.tipo);
  const values = data.map((item) => item.quantidade);

  chart.data.labels = labels;
  chart.data.datasets[0].data = values;
  chart.update();
}

// Função para alternar entre dashboard e rastreamento
function showDashboard() {
  const dashboardView = document.getElementById("dashboardView");
  const trackingView = document.getElementById("trackingView");

  if (dashboardView && trackingView) {
    dashboardView.classList.add("active");
    dashboardView.style.display = "block";
    trackingView.classList.remove("active");
    trackingView.style.display = "none";

    console.log("Dashboard ativado com sucesso");
  } else {
    console.error("Elementos do dashboard não encontrados");
    console.log("dashboardView:", dashboardView);
    console.log("trackingView:", trackingView);
  }
}

function showTracking() {
  const dashboardView = document.getElementById("dashboardView");
  const trackingView = document.getElementById("trackingView");

  if (dashboardView && trackingView) {
    dashboardView.classList.remove("active");
    dashboardView.style.display = "none";
    trackingView.classList.add("active");
    trackingView.style.display = "block";

    // Garantir que o botão "Voltar ao Dashboard" esteja visível
    const voltarButton = document.querySelector(".voltar-dashboard-button");
    const voltarButtonContainer = document.querySelector(
      ".dashboard-access-simple"
    );

    if (voltarButton) {
      voltarButton.style.display = "flex";
      voltarButton.style.visibility = "visible";
      console.log("Botão 'Voltar ao Dashboard' configurado para ser visível");
    } else {
      console.error("Botão 'Voltar ao Dashboard' não encontrado");
    }

    if (voltarButtonContainer) {
      voltarButtonContainer.style.display = "flex";
      voltarButtonContainer.style.visibility = "visible";
    }

    console.log("Rastreamento ativado com sucesso");
  } else {
    console.error("Elementos do rastreamento não encontrados");
  }
}

// Função para alternar entre dashboard e rastreamento
function toggleView() {
  const dashboardView = document.getElementById("dashboardView");
  const trackingView = document.getElementById("trackingView");
  const tooltip = document.querySelector(".toggle-view-tooltip");
  const icon = document.querySelector(".toggle-view-button i");

  if (dashboardView && trackingView) {
    // Verificar qual visualização está ativa atualmente
    const isDashboardActive = dashboardView.classList.contains("active");

    if (isDashboardActive) {
      // Mudar para visualização de rastreamento
      showTracking();

      // Garantir que o botão "Voltar ao Dashboard" esteja visível
      const voltarButton = document.querySelector(".voltar-dashboard-button");
      const voltarButtonContainer = document.querySelector(
        ".dashboard-access-simple"
      );

      if (voltarButton) {
        voltarButton.style.display = "flex";
        voltarButton.style.visibility = "visible";
        console.log(
          "Botão 'Voltar ao Dashboard' configurado para ser visível pelo toggleView"
        );
      }

      if (voltarButtonContainer) {
        voltarButtonContainer.style.display = "flex";
        voltarButtonContainer.style.visibility = "visible";
      }

      // Atualizar o botão flutuante para mostrar "Voltar ao Dashboard"
      if (tooltip) {
        tooltip.textContent = "Voltar ao Dashboard";
      }

      if (icon) {
        icon.className = "fas fa-tachometer-alt";
      }
    } else {
      // Mudar para visualização de dashboard
      showDashboard();

      // Atualizar o botão flutuante para mostrar "Ver Rastreamento"
      if (tooltip) {
        tooltip.textContent = "Ver Rastreamento";
      }

      if (icon) {
        icon.className = "fas fa-truck";
      }
    }
  } else {
    console.error("Elementos de visualização não encontrados");
  }
}

function updateOcorrenciasTable(ocorrencias) {
  const ocorrenciasTableBody = document.querySelector(
    "#ocorrenciasTable tbody"
  );
  if (ocorrenciasTableBody) {
    ocorrenciasTableBody.innerHTML = ocorrencias
      .map(
        (ocorrencia) => `
      <tr>
        <td>${ocorrencia.tipo}</td>
        <td>${ocorrencia.quantidade}</td>
      </tr>
    `
      )
      .join("");
  }
}

function updateSLATable(slaData) {
  const slaTableBody = document.querySelector("#slaTable tbody");
  if (slaTableBody) {
    slaTableBody.innerHTML = slaData
      .map(
        (item) => `
      <tr>
        <td>${item.nome}</td>
        <td>
          <div class="progress-bar-container">
            <div class="progress-bar ${getProgressBarClass(
              item.cumprimento
            )}" style="width: ${item.cumprimento}%"></div>
            <span>${item.cumprimento}%</span>
          </div>
        </td>
      </tr>
    `
      )
      .join("");
  }
}

function getProgressBarClass(value) {
  if (value >= 90) return "progress-bar-success";
  if (value >= 80) return "progress-bar-warning";
  return "progress-bar-danger";
}

// Exportar funções para uso global
window.initDashboard = initDashboard;
window.showDashboard = showDashboard;
window.showTracking = showTracking;
window.toggleView = toggleView;
