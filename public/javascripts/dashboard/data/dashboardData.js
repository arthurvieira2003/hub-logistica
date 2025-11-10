// Dashboard Data Module - Sistema de dados e estatísticas
window.DashboardData = window.DashboardData || {};

// Função para mostrar overlay de loading
window.DashboardData.showLoadingOverlay = function () {
  // Remover overlay existente se houver
  const existingOverlay = document.getElementById("dashboard-loading-overlay");
  if (existingOverlay) {
    existingOverlay.remove();
  }

  const overlay = document.createElement("div");
  overlay.id = "dashboard-loading-overlay";
  overlay.className = "dashboard-loading-overlay";
  overlay.innerHTML = `
    <div class="dashboard-loading-content">
      <div class="dashboard-loading-spinner"></div>
      <div class="dashboard-loading-text">Carregando dados do dashboard...</div>
    </div>
  `;

  const dashboardContainer = document.querySelector(".dashboard-container");
  if (dashboardContainer) {
    dashboardContainer.appendChild(overlay);
  } else {
    document.body.appendChild(overlay);
  }
};

// Função para remover overlay de loading
window.DashboardData.hideLoadingOverlay = function () {
  const overlay = document.getElementById("dashboard-loading-overlay");
  if (overlay) {
    overlay.remove();
  }
};

// Função para mostrar erro no dashboard
window.DashboardData.showError = function (message) {
  const dashboardContainer = document.querySelector(".dashboard-container");
  if (!dashboardContainer) return;

  // Remover overlay de loading se existir
  window.DashboardData.hideLoadingOverlay();

  // Remover erro existente se houver
  const existingError = document.getElementById("dashboard-error");
  if (existingError) {
    existingError.remove();
  }

  const errorDiv = document.createElement("div");
  errorDiv.id = "dashboard-error";
  errorDiv.className = "dashboard-error";
  errorDiv.innerHTML = `
    <div class="dashboard-error-content">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Erro ao carregar dados</h3>
      <p>${message}</p>
      <button class="dashboard-error-retry" onclick="window.DashboardData.loadDashboardData()">
        <i class="fas fa-redo"></i> Tentar novamente
      </button>
    </div>
  `;

  dashboardContainer.appendChild(errorDiv);
};

// Função para validar dados recebidos
window.DashboardData.validateData = function (data) {
  if (!data) {
    return { valid: false, missing: ["Todos os dados"] };
  }

  const required = [
    "totalEntregas",
    "entregasNoPrazo",
    "entregasAtrasadas",
    "taxaEntrega",
    "custoTotal",
    "custoMedio",
    "statusDistribution",
  ];

  const missing = [];
  required.forEach((field) => {
    if (data[field] === undefined || data[field] === null) {
      missing.push(field);
    }
  });

  return {
    valid: missing.length === 0,
    missing: missing,
  };
};

// Função para carregar dados do dashboard
window.DashboardData.loadDashboardData = async function (
  period = "week",
  startDate = null,
  endDate = null
) {
  // Mostrar overlay de loading
  window.DashboardData.showLoadingOverlay();

  try {
    // Buscar dados reais da API
    const token =
      window.AuthCore?.getToken?.() ||
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

    if (!token) {
      throw new Error("Token de autenticação não encontrado");
    }

    // Construir URL com parâmetros
    let url = `http://localhost:4010/dashboard/stats?period=${period}`;
    if (period === "custom" && startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Erro ao buscar dados: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Validar dados
    const validation = window.DashboardData.validateData(data);
    if (!validation.valid) {
      throw new Error(
        `Dados incompletos. Campos faltando: ${validation.missing.join(", ")}`
      );
    }

    // Remover overlay de loading
    window.DashboardData.hideLoadingOverlay();

    // Remover erro se existir
    const existingError = document.getElementById("dashboard-error");
    if (existingError) {
      existingError.remove();
    }

    // Atualizar dados do dashboard
    window.DashboardData.updateDashboardData(data, period);
  } catch (error) {
    console.error("❌ Erro ao carregar dados do dashboard:", error);

    // Remover overlay de loading
    window.DashboardData.hideLoadingOverlay();

    // Mostrar erro
    window.DashboardData.showError(
      error.message || "Não foi possível carregar os dados do dashboard."
    );
  }
};

// Função para atualizar dados do dashboard
window.DashboardData.updateDashboardData = function (data, period) {
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

// Função para mostrar erro em um card específico
window.DashboardData.showCardError = function (cardId, message) {
  const card = document.getElementById(cardId);
  if (!card) return;

  const content = card.querySelector(".dashboard-card-content");
  if (!content) return;

  content.innerHTML = `
    <div class="dashboard-card-error">
      <i class="fas fa-exclamation-circle"></i>
      <p>${message || "Dados não disponíveis"}</p>
    </div>
  `;
};

// Função para atualizar estatísticas
window.DashboardData.updateStatistics = function (data) {
  // Total de entregas
  const totalEntregasElement = document.querySelector(
    "#totalEntregas .stat-value"
  );
  if (totalEntregasElement) {
    if (data.totalEntregas !== undefined && data.totalEntregas !== null) {
      totalEntregasElement.textContent = data.totalEntregas;
    } else {
      window.DashboardData.showCardError(
        "totalEntregas",
        "Dados não disponíveis"
      );
    }
  }

  // Entregas no prazo
  const entregasNoPrazoElement = document.querySelector(
    "#entregasNoPrazo .stat-value"
  );
  if (entregasNoPrazoElement) {
    if (data.entregasNoPrazo !== undefined && data.entregasNoPrazo !== null) {
      entregasNoPrazoElement.textContent = data.entregasNoPrazo;
    } else {
      window.DashboardData.showCardError(
        "entregasNoPrazo",
        "Dados não disponíveis"
      );
    }
  }

  // Entregas atrasadas
  const entregasAtrasadasElement = document.querySelector(
    "#entregasAtrasadas .stat-value"
  );
  if (entregasAtrasadasElement) {
    if (
      data.entregasAtrasadas !== undefined &&
      data.entregasAtrasadas !== null
    ) {
      entregasAtrasadasElement.textContent = data.entregasAtrasadas;
    } else {
      window.DashboardData.showCardError(
        "entregasAtrasadas",
        "Dados não disponíveis"
      );
    }
  }

  // Taxa de entrega
  const taxaEntregaElement = document.querySelector(".circular-progress-text");
  if (taxaEntregaElement) {
    if (data.taxaEntrega !== undefined && data.taxaEntrega !== null) {
      taxaEntregaElement.textContent = data.taxaEntrega + "%";
      window.DashboardData.updateCircularProgress(data.taxaEntrega);
    } else {
      window.DashboardData.showCardError(
        "taxaEntrega",
        "Dados não disponíveis"
      );
    }
  }

  // Custo total
  const custoTotalElement = document.querySelector("#custoTotal .stat-value");
  if (custoTotalElement) {
    if (data.custoTotal !== undefined && data.custoTotal !== null) {
      custoTotalElement.textContent =
        "R$ " +
        data.custoTotal.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
    } else {
      window.DashboardData.showCardError("custoTotal", "Dados não disponíveis");
    }
  }

  // Custo médio
  const custoMedioElement = document.querySelector("#custoMedio .stat-value");
  if (custoMedioElement) {
    if (data.custoMedio !== undefined && data.custoMedio !== null) {
      custoMedioElement.textContent =
        "R$ " +
        data.custoMedio.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
    } else {
      window.DashboardData.showCardError("custoMedio", "Dados não disponíveis");
    }
  }

  // Tempo médio de entrega
  const tempoMedioElement = document.querySelector("#tempoMedio .stat-value");
  if (tempoMedioElement) {
    if (
      data.tempoMedioEntrega !== undefined &&
      data.tempoMedioEntrega !== null
    ) {
      tempoMedioElement.textContent =
        data.tempoMedioEntrega.toFixed(1) + " dias";
    } else {
      window.DashboardData.showCardError("tempoMedio", "Dados não disponíveis");
    }
  }

  // Volume total
  const volumeTotalElement = document.querySelector("#volumeTotal .stat-value");
  if (volumeTotalElement) {
    if (
      data.volumeTotal !== undefined &&
      data.volumeTotal !== null &&
      data.volumeTotal > 0
    ) {
      volumeTotalElement.textContent =
        data.volumeTotal.toLocaleString("pt-BR") + " m³";
    } else {
      window.DashboardData.showCardError(
        "volumeTotal",
        "Dados não disponíveis"
      );
    }
  }

  // Peso total
  const pesoTotalElement = document.querySelector("#pesoTotal .stat-value");
  if (pesoTotalElement) {
    if (
      data.pesoTotal !== undefined &&
      data.pesoTotal !== null &&
      data.pesoTotal > 0
    ) {
      pesoTotalElement.textContent =
        data.pesoTotal.toLocaleString("pt-BR") + " kg";
    } else {
      window.DashboardData.showCardError("pesoTotal", "Dados não disponíveis");
    }
  }

  // Crescimento
  const crescimentoElement = document.querySelector("#crescimento .stat-value");
  if (crescimentoElement) {
    if (data.crescimento !== undefined && data.crescimento !== null) {
      crescimentoElement.textContent = "+" + data.crescimento + "%";
    } else {
      window.DashboardData.showCardError(
        "crescimento",
        "Dados não disponíveis"
      );
    }
  }

  // Atualizar indicadores de status
  if (data.statusDistribution && Array.isArray(data.statusDistribution)) {
    window.DashboardData.updateStatusIndicators(data.statusDistribution);
  }
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

// Função para obter classe da barra de progresso
window.DashboardData.getProgressBarClass = function (value) {
  if (value >= 90) return "progress-bar-success";
  if (value >= 80) return "progress-bar-warning";
  return "progress-bar-danger";
};
