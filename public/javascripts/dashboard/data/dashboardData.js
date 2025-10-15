// Dashboard Data Module - Sistema de dados e estatísticas
window.DashboardData = window.DashboardData || {};

// Dados simulados para diferentes períodos
window.DashboardData.mockData = {
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

// Função para carregar dados do dashboard
window.DashboardData.loadDashboardData = function (period = "week") {
  // Simular carregamento
  const loadingSpinner = document.createElement("div");
  loadingSpinner.className = "loading-spinner";

  const dashboardContainer = document.querySelector(".dashboard-container");
  if (dashboardContainer) {
    dashboardContainer.appendChild(loadingSpinner);

    // Simular tempo de carregamento
    setTimeout(() => {
      dashboardContainer.removeChild(loadingSpinner);
      window.DashboardData.updateDashboardData(period);
    }, 800);
  }
};

// Função para atualizar dados do dashboard
window.DashboardData.updateDashboardData = function (period) {
  const data = window.DashboardData.mockData[period];
  if (!data) {
    console.error(`❌ Dados não encontrados para período: ${period}`);
    return;
  }

  // Atualizar estatísticas
  window.DashboardData.updateStatistics(data);

  // Atualizar gráficos
  if (window.DashboardCharts) {
    window.DashboardCharts.updateCharts(data);
  }
};

// Função para atualizar estatísticas
window.DashboardData.updateStatistics = function (data) {
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
  window.DashboardData.updateCircularProgress(data.taxaEntrega);

  // Atualizar indicadores de status
  window.DashboardData.updateStatusIndicators(data.statusDistribution);

  // Atualizar tabela de ocorrências
  window.DashboardData.updateOcorrenciasTable(data.ocorrencias);

  // Atualizar tabela de SLA das transportadoras
  window.DashboardData.updateSLATable(data.slaTransportadoras);
};

// Função para atualizar progresso circular
window.DashboardData.updateCircularProgress = function (percentage) {
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
};

// Função para atualizar indicadores de status
window.DashboardData.updateStatusIndicators = function (statusData) {
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
};

// Função para atualizar tabela de ocorrências
window.DashboardData.updateOcorrenciasTable = function (ocorrencias) {
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
};

// Função para atualizar tabela de SLA das transportadoras
window.DashboardData.updateSLATable = function (slaData) {
  const slaTableBody = document.querySelector("#slaTable tbody");
  if (slaTableBody) {
    slaTableBody.innerHTML = slaData
      .map(
        (item) => `
      <tr>
        <td>${item.nome}</td>
        <td>
          <div class="progress-bar-container">
            <div class="progress-bar ${window.DashboardData.getProgressBarClass(
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
};

// Função para obter classe da barra de progresso
window.DashboardData.getProgressBarClass = function (value) {
  if (value >= 90) return "progress-bar-success";
  if (value >= 80) return "progress-bar-warning";
  return "progress-bar-danger";
};
