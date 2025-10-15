// Dashboard Charts Module - Sistema de gráficos Chart.js
window.DashboardCharts = window.DashboardCharts || {};

// Instâncias dos gráficos para controle
window.DashboardCharts.chartInstances = {};

// Função para inicializar todos os gráficos
window.DashboardCharts.initCharts = function () {
  // Verificar se Chart.js está disponível
  if (typeof Chart === "undefined") {
    console.warn(
      "Chart.js não está disponível. Os gráficos não serão renderizados."
    );
    return;
  }

  // Inicializar cada gráfico
  window.DashboardCharts.initStatusChart();
  window.DashboardCharts.initTransportadorasChart();
  window.DashboardCharts.initDailyDeliveriesChart();
  window.DashboardCharts.initRegioesChart();
  window.DashboardCharts.initDesempenhoChart();
  window.DashboardCharts.initOcorrenciasChart();
};

// Gráfico de distribuição de status
window.DashboardCharts.initStatusChart = function () {
  const ctx = document.getElementById("statusChart");
  if (!ctx) return;

  window.DashboardCharts.chartInstances.statusChart = new Chart(ctx, {
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
};

// Gráfico de entregas por transportadora
window.DashboardCharts.initTransportadorasChart = function () {
  const ctx = document.getElementById("transportadorasChart");
  if (!ctx) return;

  window.DashboardCharts.chartInstances.transportadorasChart = new Chart(ctx, {
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
};

// Gráfico de entregas diárias
window.DashboardCharts.initDailyDeliveriesChart = function () {
  const ctx = document.getElementById("dailyDeliveriesChart");
  if (!ctx) return;

  window.DashboardCharts.chartInstances.dailyDeliveriesChart = new Chart(ctx, {
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
};

// Gráfico de distribuição regional
window.DashboardCharts.initRegioesChart = function () {
  const ctx = document.getElementById("regioesChart");
  if (!ctx) return;

  window.DashboardCharts.chartInstances.regioesChart = new Chart(ctx, {
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
};

// Gráfico de desempenho de transportadoras
window.DashboardCharts.initDesempenhoChart = function () {
  const ctx = document.getElementById("desempenhoChart");
  if (!ctx) return;

  window.DashboardCharts.chartInstances.desempenhoChart = new Chart(ctx, {
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
};

// Gráfico de tipos de ocorrências
window.DashboardCharts.initOcorrenciasChart = function () {
  const ctx = document.getElementById("ocorrenciasChart");
  if (!ctx) return;

  window.DashboardCharts.chartInstances.ocorrenciasChart = new Chart(ctx, {
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
};

// Função para atualizar todos os gráficos
window.DashboardCharts.updateCharts = function (data) {
  // Destruir gráficos existentes
  Object.values(window.DashboardCharts.chartInstances).forEach((instance) => {
    if (instance) {
      instance.destroy();
    }
  });

  // Reinicializar gráficos com novos dados
  window.DashboardCharts.initCharts();

  // Atualizar dados específicos para cada gráfico
  window.DashboardCharts.updateTransportadorasChart(data.transportadoras);
  window.DashboardCharts.updateRegioesChart(data.regioes);
  window.DashboardCharts.updateOcorrenciasChartData(data.ocorrencias);
};

// Função para atualizar gráfico de transportadoras
window.DashboardCharts.updateTransportadorasChart = function (data) {
  const chart = window.DashboardCharts.chartInstances.transportadorasChart;
  if (!chart) return;

  const labels = Object.keys(data);
  const values = Object.values(data);

  chart.data.labels = labels;
  chart.data.datasets[0].data = values;
  chart.update();
};

// Função para atualizar gráfico de regiões
window.DashboardCharts.updateRegioesChart = function (data) {
  const chart = window.DashboardCharts.chartInstances.regioesChart;
  if (!chart) return;

  const labels = Object.keys(data);
  const values = Object.values(data);

  chart.data.labels = labels;
  chart.data.datasets[0].data = values;
  chart.update();
};

// Função para atualizar gráfico de ocorrências
window.DashboardCharts.updateOcorrenciasChartData = function (data) {
  const chart = window.DashboardCharts.chartInstances.ocorrenciasChart;
  if (!chart) return;

  const labels = data.map((item) => item.tipo);
  const values = data.map((item) => item.quantidade);

  chart.data.labels = labels;
  chart.data.datasets[0].data = values;
  chart.update();
};
