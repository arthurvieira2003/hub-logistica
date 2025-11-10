window.DashboardCharts = window.DashboardCharts || {};

window.DashboardCharts.chartInstances = {};

window.DashboardCharts.waitForElements = function (
  elementIds,
  callback,
  timeout = 5000
) {
  const startTime = Date.now();
  const foundElements = new Set();

  function checkElements() {
    const missing = elementIds.filter(
      (id) => !foundElements.has(id) && !document.getElementById(id)
    );

    if (missing.length === 0) {
      callback();
      return true;
    }

    if (Date.now() - startTime >= timeout) {
      console.error("❌ [DashboardCharts] Timeout aguardando elementos canvas");
      console.error(
        `❌ [DashboardCharts] Elementos não encontrados: ${missing.join(", ")}`
      );
      return true;
    }

    return false;
  }

  elementIds.forEach((id) => {
    if (document.getElementById(id)) {
      foundElements.add(id);
    }
  });

  if (checkElements()) {
    return;
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          elementIds.forEach((id) => {
            if (!foundElements.has(id)) {
              const element =
                node.id === id ? node : node.querySelector(`#${id}`);
              if (element) {
                foundElements.add(id);
              }
            }
          });
        }
      });
    });

    if (checkElements()) {
      observer.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  const pollInterval = setInterval(() => {
    if (checkElements()) {
      clearInterval(pollInterval);
      observer.disconnect();
    }
  }, 100);
};

window.DashboardCharts.initCharts = function () {
  // Verificar se Chart.js está disponível
  if (typeof Chart === "undefined") {
    console.warn(
      "Chart.js não está disponível. Os gráficos não serão renderizados."
    );
    return;
  }

  // Lista de IDs dos elementos canvas
  const chartElementIds = [
    "statusChart",
    "transportadorasChart",
    "dailyDeliveriesChart",
    "regioesChart",
    "desempenhoChart",
  ];

  window.DashboardCharts.waitForElements(chartElementIds, () => {
    window.DashboardCharts.initStatusChart();
    window.DashboardCharts.initTransportadorasChart();
    window.DashboardCharts.initDailyDeliveriesChart();
    window.DashboardCharts.initRegioesChart();
    window.DashboardCharts.initDesempenhoChart();
  });
};

window.DashboardCharts.initStatusChart = function () {
  const ctx = document.getElementById("statusChart");
  if (!ctx) {
    console.warn("❌ [DashboardCharts] Elemento statusChart não encontrado");
    return;
  }

  window.DashboardCharts.chartInstances.statusChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Entregue", "Atrasado", "Em Trânsito", "Aguardando Coleta"],
      datasets: [
        {
          data: [0, 0, 0, 0],
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

window.DashboardCharts.initTransportadorasChart = function () {
  const ctx = document.getElementById("transportadorasChart");
  if (!ctx) {
    console.warn(
      "❌ [DashboardCharts] Elemento transportadorasChart não encontrado"
    );
    return;
  }

  window.DashboardCharts.chartInstances.transportadorasChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Entregas",
          data: [],
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

window.DashboardCharts.initDailyDeliveriesChart = function () {
  const ctx = document.getElementById("dailyDeliveriesChart");
  if (!ctx) {
    console.warn(
      "❌ [DashboardCharts] Elemento dailyDeliveriesChart não encontrado"
    );
    return;
  }

  window.DashboardCharts.chartInstances.dailyDeliveriesChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Entregas",
          data: [],
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

window.DashboardCharts.initRegioesChart = function () {
  const ctx = document.getElementById("regioesChart");
  if (!ctx) {
    console.warn("❌ [DashboardCharts] Elemento regioesChart não encontrado");
    return;
  }

  window.DashboardCharts.chartInstances.regioesChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: [],
      datasets: [
        {
          data: [],
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

window.DashboardCharts.initDesempenhoChart = function () {
  const ctx = document.getElementById("desempenhoChart");
  if (!ctx) {
    console.warn(
      "❌ [DashboardCharts] Elemento desempenhoChart não encontrado"
    );
    return;
  }

  window.DashboardCharts.chartInstances.desempenhoChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Prazo Esperado (5 dias)",
          data: [],
          backgroundColor: "rgba(156, 163, 175, 0.3)",
          borderColor: "rgba(156, 163, 175, 1)",
          borderWidth: 2,
          borderDash: [5, 5],
          type: "line",
          fill: false,
          pointRadius: 0,
          order: 2,
        },
        {
          label: "Dia Real de Entrega",
          data: [],
          backgroundColor: "rgba(36, 118, 117, 0.7)",
          borderColor: "rgba(36, 118, 117, 1)",
          borderWidth: 2,
          borderRadius: 4,
          order: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || "";
              const value = context.raw || 0;
              if (context.datasetIndex === 0) {
                return `${label}: ${value} dias (referência)`;
              }
              return `${label}: ${value.toFixed(1)} dias`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Dias",
            font: {
              size: 12,
              weight: "bold",
            },
          },
          grid: {
            display: true,
            drawBorder: false,
          },
        },
        x: {
          title: {
            display: true,
            text: "Transportadoras",
            font: {
              size: 12,
              weight: "bold",
            },
          },
          grid: {
            display: false,
            drawBorder: false,
          },
        },
      },
    },
  });
};

window.DashboardCharts.updateCharts = function (data) {
  if (!data) {
    console.warn(
      "⚠️ [DashboardCharts] Dados não fornecidos para atualizar gráficos"
    );
    return;
  }

  Object.values(window.DashboardCharts.chartInstances).forEach((instance) => {
    if (instance) {
      instance.destroy();
    }
  });

  window.DashboardCharts.initCharts();

  if (data.transportadoras && Object.keys(data.transportadoras).length > 0) {
    window.DashboardCharts.updateTransportadorasChart(data.transportadoras);
  }

  if (data.regioes && Object.keys(data.regioes).length > 0) {
    window.DashboardCharts.updateRegioesChart(data.regioes);
  }

  if (
    data.dailyDeliveries &&
    Array.isArray(data.dailyDeliveries) &&
    data.dailyDeliveries.length > 0
  ) {
    window.DashboardCharts.updateDailyDeliveriesChart(data.dailyDeliveries);
  }

  if (
    data.desempenhoTransportadoras &&
    Array.isArray(data.desempenhoTransportadoras) &&
    data.desempenhoTransportadoras.length > 0
  ) {
    window.DashboardCharts.updateDesempenhoChart(
      data.desempenhoTransportadoras
    );
  }

  if (
    data.statusDistribution &&
    Array.isArray(data.statusDistribution) &&
    data.statusDistribution.length === 4
  ) {
    window.DashboardCharts.updateStatusChart(data.statusDistribution);
  }
};

window.DashboardCharts.updateStatusChart = function (data) {
  const chart = window.DashboardCharts.chartInstances.statusChart;
  if (!chart || !data || !Array.isArray(data) || data.length !== 4) return;

  chart.data.datasets[0].data = data;
  chart.update();
};

window.DashboardCharts.updateTransportadorasChart = function (data) {
  const chart = window.DashboardCharts.chartInstances.transportadorasChart;
  if (!chart || !data || typeof data !== "object") return;

  const labels = Object.keys(data);
  const values = Object.values(data);

  chart.data.labels = labels;
  chart.data.datasets[0].data = values;
  chart.update();
};

window.DashboardCharts.updateRegioesChart = function (data) {
  const chart = window.DashboardCharts.chartInstances.regioesChart;
  if (
    !chart ||
    !data ||
    typeof data !== "object" ||
    Object.keys(data).length === 0
  )
    return;

  const labels = Object.keys(data);
  const values = Object.values(data);

  chart.data.labels = labels;
  chart.data.datasets[0].data = values;
  chart.update();
};

window.DashboardCharts.updateDailyDeliveriesChart = function (data) {
  const chart = window.DashboardCharts.chartInstances.dailyDeliveriesChart;
  if (!chart || !data || !Array.isArray(data)) return;

  let labels = [];
  if (data.length === 7) {
    labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  } else if (data.length === 30) {
    labels = data.map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (data.length - 1 - index));
      return date.getDate();
    });
  } else if (data.length === 12) {
    labels = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
  } else {
    labels = data.map((_, index) => index + 1);
  }

  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
};

window.DashboardCharts.updateDesempenhoChart = function (data) {
  const chart = window.DashboardCharts.chartInstances.desempenhoChart;
  if (!chart || !data || !Array.isArray(data) || data.length === 0) return;

  // Os dados já vêm ordenados do backend (por pontualidade e tempo médio)
  // Mas vamos garantir a ordenação aqui também
  const sortedData = [...data].sort((a, b) => {
    // Primeiro por pontualidade (maior primeiro)
    if (b.pontualidade !== a.pontualidade) {
      return b.pontualidade - a.pontualidade;
    }
    // Depois por tempo médio (menor primeiro)
    return (a.tempoMedioEntrega || 0) - (b.tempoMedioEntrega || 0);
  });

  // Extrair labels (nomes das transportadoras)
  const labels = sortedData.map((item) => item.nome);

  // Extrair tempos médios de entrega
  const temposMedios = sortedData.map((item) => item.tempoMedioEntrega || 0);

  // Prazo esperado (5 dias) para todas as transportadoras
  const prazoEsperado = sortedData.map(() => 5);

  // Atualizar gráfico
  chart.data.labels = labels;
  chart.data.datasets[0].data = prazoEsperado; // Linha de referência
  chart.data.datasets[1].data = temposMedios; // Barras de tempo real

  // Colorir barras baseado no desempenho
  const backgroundColors = sortedData.map((item) => {
    const tempoMedio = item.tempoMedioEntrega || 0;
    const pontualidade = item.pontualidade || 0;

    // Verde se está no prazo (<= 5 dias) e pontualidade alta (>= 80%)
    if (tempoMedio <= 5 && pontualidade >= 80) {
      return "rgba(34, 197, 94, 0.7)"; // Verde
    }
    // Amarelo se está próximo do prazo (5-7 dias) ou pontualidade média (60-80%)
    if (
      (tempoMedio > 5 && tempoMedio <= 7) ||
      (pontualidade >= 60 && pontualidade < 80)
    ) {
      return "rgba(245, 158, 11, 0.7)"; // Amarelo
    }
    // Vermelho se está atrasado (> 7 dias) ou pontualidade baixa (< 60%)
    return "rgba(239, 68, 68, 0.7)"; // Vermelho
  });

  chart.data.datasets[1].backgroundColor = backgroundColors;
  chart.data.datasets[1].borderColor = backgroundColors.map((color) =>
    color.replace("0.7", "1")
  );

  chart.update();
};
