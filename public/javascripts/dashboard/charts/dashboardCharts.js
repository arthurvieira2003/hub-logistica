// Dashboard Charts Module - Sistema de gráficos Chart.js
window.DashboardCharts = window.DashboardCharts || {};

// Instâncias dos gráficos para controle
window.DashboardCharts.chartInstances = {};

// Função para aguardar elementos estarem disponíveis usando MutationObserver
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

  // Verificar elementos já existentes
  elementIds.forEach((id) => {
    if (document.getElementById(id)) {
      foundElements.add(id);
    }
  });

  // Se todos já existem, executar callback imediatamente
  if (checkElements()) {
    return;
  }

  // Usar MutationObserver para detectar quando elementos são adicionados
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

    // Verificar se todos os elementos foram encontrados
    if (checkElements()) {
      observer.disconnect();
    }
  });

  // Observar mudanças no documento
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Fallback com polling para casos onde MutationObserver não funciona
  const pollInterval = setInterval(() => {
    if (checkElements()) {
      clearInterval(pollInterval);
      observer.disconnect();
    }
  }, 100);
};

// Função para inicializar todos os gráficos
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
    "ocorrenciasChart",
  ];

  // Aguardar elementos estarem disponíveis antes de inicializar
  window.DashboardCharts.waitForElements(chartElementIds, () => {
    // Inicializar cada gráfico
    window.DashboardCharts.initStatusChart();
    window.DashboardCharts.initTransportadorasChart();
    window.DashboardCharts.initDailyDeliveriesChart();
    window.DashboardCharts.initRegioesChart();
    window.DashboardCharts.initDesempenhoChart();
    window.DashboardCharts.initOcorrenciasChart();
  });
};

// Gráfico de distribuição de status
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
  if (!ctx) {
    console.warn(
      "❌ [DashboardCharts] Elemento transportadorasChart não encontrado"
    );
    return;
  }

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
  if (!ctx) {
    console.warn(
      "❌ [DashboardCharts] Elemento dailyDeliveriesChart não encontrado"
    );
    return;
  }

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
  if (!ctx) {
    console.warn("❌ [DashboardCharts] Elemento regioesChart não encontrado");
    return;
  }

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
  if (!ctx) {
    console.warn(
      "❌ [DashboardCharts] Elemento desempenhoChart não encontrado"
    );
    return;
  }

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
  if (!ctx) {
    console.warn(
      "❌ [DashboardCharts] Elemento ocorrenciasChart não encontrado"
    );
    return;
  }

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
  window.DashboardCharts.updateDailyDeliveriesChart(data.dailyDeliveries);
  window.DashboardCharts.updateOcorrenciasChartData(data.ocorrencias);
  window.DashboardCharts.updateDesempenhoChart(data.desempenhoTransportadoras);
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

// Função para atualizar gráfico de entregas diárias
window.DashboardCharts.updateDailyDeliveriesChart = function (data) {
  const chart = window.DashboardCharts.chartInstances.dailyDeliveriesChart;
  if (!chart || !data || !Array.isArray(data)) return;

  // Gerar labels baseado no tamanho do array
  let labels = [];
  if (data.length === 7) {
    // Semana
    labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  } else if (data.length === 30) {
    // Mês - usar números dos dias
    labels = data.map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (data.length - 1 - index));
      return date.getDate();
    });
  } else if (data.length === 12) {
    // Ano - usar meses
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
    // Fallback - usar índices
    labels = data.map((_, index) => index + 1);
  }

  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
};

// Função para atualizar gráfico de desempenho de transportadoras
window.DashboardCharts.updateDesempenhoChart = function (data) {
  const chart = window.DashboardCharts.chartInstances.desempenhoChart;
  if (!chart || !data || !Array.isArray(data)) return;

  const labels = data.map((item) => item.nome);
  const pontualidade = data.map((item) => item.pontualidade || 0);

  chart.data.labels = labels;
  chart.data.datasets[0].data = pontualidade;
  chart.update();
};

// Função para atualizar gráfico de ocorrências
window.DashboardCharts.updateOcorrenciasChartData = function (data) {
  const chart = window.DashboardCharts.chartInstances.ocorrenciasChart;
  if (!chart || !data || !Array.isArray(data)) return;

  const labels = data.map((item) => item.tipo);
  const values = data.map((item) => item.quantidade);

  chart.data.labels = labels;
  chart.data.datasets[0].data = values;
  chart.update();
};
