document.addEventListener("DOMContentLoaded", async () => {
  // Forçar a sidebar a ficar aberta imediatamente
  forceOpenSidebar();

  await loadUserData();
  await getUserAvatar();

  // Carregar dashboard na tela inicial
  await loadWelcomeDashboard();

  initializeToolButtons();
  initializeTabSystem();
  initializeUserDropdown();
  initializePhotoModal();
  initializeCropperModal();
  initializeSidebarToggle();

  // Forçar novamente após a inicialização
  forceOpenSidebar();
});

// Importar função de administração
import { addAdminPanelOption } from "./admin.js";

// Função para carregar a tela inicial (sem dashboard)
async function loadWelcomeDashboard() {
  try {
    const welcomeScreen = document.getElementById("welcomeScreen");
    if (welcomeScreen) {
      // Esconder a tela de boas-vindas inicialmente
      welcomeScreen.style.display = "none";
      console.log("✅ [DEBUG] Welcome screen escondido inicialmente");
    }
  } catch (error) {
    console.error("Erro ao carregar tela inicial:", error);
  }
}

// Função para forçar a sidebar a ficar aberta
function forceOpenSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const toggleButton = document.getElementById("toggleSidebar");
  const body = document.body;

  if (!sidebar || !mainContent || !toggleButton) return;

  // Forçar a sidebar a ficar aberta
  sidebar.classList.remove("collapsed");
  mainContent.classList.remove("expanded");
  body.classList.remove("sidebar-collapsed");
  toggleButton.innerHTML = '<i class="fas fa-times"></i>';
  toggleButton.setAttribute("title", "Ocultar menu lateral");
}

// Adicionar múltiplos eventos para garantir que a sidebar permaneça aberta
window.addEventListener("load", forceOpenSidebar);
window.addEventListener("resize", forceOpenSidebar);
// Tentar várias vezes com diferentes atrasos
setTimeout(forceOpenSidebar, 100);
setTimeout(forceOpenSidebar, 500);
setTimeout(forceOpenSidebar, 1000);
setTimeout(forceOpenSidebar, 2000);

async function loadUserData() {
  try {
    const userData = await validateTokenExpiration();
    if (userData) {
      updateUserProfile(userData);
    }
  } catch (error) {
    console.error("Erro ao carregar dados do usuário:", error);
    window.location.replace("/");
  }
}

function initializeToolButtons() {
  const toolButtons = document.querySelectorAll(".tool-button");
  const tabList = document.getElementById("tabList");
  const contentArea = document.getElementById("contentArea");
  const welcomeScreen = document.getElementById("welcomeScreen");

  // URLs das ferramentas externas
  const externalTools = {
    os: "https://auvo.com.br",
    armazem: "https://wms.xclog.com.br",
    sesuite: "https://sesuite.com.br",
  };

  toolButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tool = button.dataset.tool;

      // Se for uma ferramenta externa, abrir em nova guia
      if (externalTools[tool]) {
        window.open(externalTools[tool], "_blank");
        return;
      }

      // Verificar se a ferramenta já está aberta
      const existingTab = document.querySelector(`.tab[data-tool="${tool}"]`);
      if (existingTab) {
        activateTab(existingTab);
        return;
      }

      // Criar nova aba apenas para ferramentas internas
      const toolName = button.querySelector("span").textContent;
      const toolIcon = button.querySelector("i").cloneNode(true);

      const tab = createTab(tool, toolName, toolIcon);
      tabList.appendChild(tab);

      // Criar conteúdo da ferramenta
      const toolContent = createToolContent(tool);
      contentArea.appendChild(toolContent);

      // Esconder tela de boas-vindas
      welcomeScreen.style.display = "none";

      // Ativar a nova aba
      activateTab(tab);

      // Carregar o conteúdo da ferramenta
      loadToolContent(tool, toolContent);
    });
  });
}

function createTab(tool, name, icon) {
  const tab = document.createElement("div");
  tab.className = "tab";
  tab.dataset.tool = tool;

  // Clonar o ícone e ajustar suas classes
  const iconClone = icon.cloneNode(true);
  if (iconClone.tagName === "IMG") {
    iconClone.className = "tool-icon";
  }

  tab.appendChild(iconClone);
  tab.appendChild(document.createTextNode(name));

  const closeButton = document.createElement("div");
  closeButton.className = "close-tab";
  closeButton.innerHTML = "&times;";
  closeButton.addEventListener("click", (e) => {
    e.stopPropagation();
    closeTab(tab);
  });

  tab.appendChild(closeButton);

  tab.addEventListener("click", () => {
    activateTab(tab);
  });

  return tab;
}

function createToolContent(tool) {
  const content = document.createElement("div");
  content.className = "tool-content";
  content.dataset.tool = tool;

  // Adicionar um loader
  const loader = document.createElement("div");
  loader.className = "loader";
  loader.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
  content.appendChild(loader);

  return content;
}

function activateTab(tab) {
  console.log("🔄 [DEBUG] Ativando aba:", tab.dataset.tool);

  // Desativar todas as abas e conteúdos
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".tool-content")
    .forEach((c) => c.classList.remove("active"));

  // Ativar a aba selecionada e seu conteúdo
  tab.classList.add("active");
  const tool = tab.dataset.tool;
  console.log("🔍 [DEBUG] Procurando conteúdo para tool:", tool);
  const content = document.querySelector(`.tool-content[data-tool="${tool}"]`);
  if (content) {
    console.log("✅ [DEBUG] Conteúdo encontrado:", content);
    content.classList.add("active");
    console.log("✅ [DEBUG] Conteúdo ativado");
  } else {
    console.error("❌ [DEBUG] Conteúdo NÃO encontrado para tool:", tool);
  }

  // Inicializar dashboard se for a aba do dashboard
  if (tool === "dashboard") {
    console.log("🎯 [DEBUG] Inicializando dashboard");

    // Carregar CSS do dashboard se ainda não estiver carregado
    if (!document.querySelector('link[href="../styles/dashboard.css"]')) {
      console.log("📄 [DEBUG] Carregando CSS do dashboard na ativação");
      loadCSS("/styles/dashboard.css");
      console.log("✅ [DEBUG] CSS do dashboard carregado na ativação da aba");
    } else {
      console.log("✅ [DEBUG] CSS do dashboard já estava carregado");
    }

    const dashboardView = document.getElementById("dashboardView");
    console.log("🔍 [DEBUG] Procurando dashboardView:", dashboardView);
    if (dashboardView) {
      console.log("✅ [DEBUG] dashboardView encontrado");
      console.log(
        "🔍 [DEBUG] dashboardView já inicializado?",
        dashboardView.dataset.initialized
      );
      if (!dashboardView.dataset.initialized) {
        console.log("⏳ [DEBUG] Aguardando 100ms para inicializar dashboard");
        // Aguardar um pouco para o CSS ser aplicado
        setTimeout(() => {
          console.log("🚀 [DEBUG] Inicializando dashboard com initDashboard");
          if (window.initDashboard) {
            window.initDashboard();
            dashboardView.dataset.initialized = "true";
            console.log("✅ [DEBUG] Dashboard inicializado com sucesso");
          } else {
            console.error("❌ [DEBUG] initDashboard não está disponível");
          }
        }, 100);
      } else {
        console.log("✅ [DEBUG] Dashboard já estava inicializado");
      }
    } else {
      console.error("❌ [DEBUG] dashboardView NÃO encontrado durante ativação");
    }
  }

  // Esconder tela de boas-vindas quando uma aba é ativada
  const welcomeScreen = document.getElementById("welcomeScreen");
  if (welcomeScreen) {
    welcomeScreen.style.display = "none";
    console.log("✅ [DEBUG] Welcome screen escondido na ativação da aba");
  }

  // Atualizar botões da barra lateral
  document.querySelectorAll(".tool-button").forEach((button) => {
    button.classList.remove("active");
    if (button.dataset.tool === tool) {
      button.classList.add("active");
    }
  });
}

function closeTab(tab) {
  const tool = tab.dataset.tool;

  // Não permitir fechar a aba do dashboard
  if (tool === "dashboard") {
    return;
  }

  const content = document.querySelector(`.tool-content[data-tool="${tool}"]`);

  // Se esta é a aba ativa, ativar outra aba
  if (tab.classList.contains("active")) {
    const nextTab = tab.nextElementSibling || tab.previousElementSibling;
    if (nextTab) {
      activateTab(nextTab);
    } else {
      // Se não houver mais abas, mostrar a tela de boas-vindas
      const welcomeScreen = document.getElementById("welcomeScreen");
      if (welcomeScreen) {
        welcomeScreen.style.display = "flex";
        console.log("✅ [DEBUG] Welcome screen exibido - nenhuma aba ativa");
      }
      document.querySelectorAll(".tool-button").forEach((button) => {
        button.classList.remove("active");
      });
    }
  }

  // Remover a aba e seu conteúdo
  tab.remove();
  if (content) {
    content.remove();
  }
}

function initializeTabSystem() {
  const tabList = document.getElementById("tabList");
  let isDragging = false;
  let dragTab = null;
  let dragStartX = 0;
  let mouseOffsetX = 0;
  let hasMovedEnough = false;

  // Habilitar drag and drop para as abas
  tabList.addEventListener("mousedown", (e) => {
    if (
      e.target.classList.contains("tab") &&
      !e.target.classList.contains("close-tab")
    ) {
      const tab = e.target;

      // Calcular o offset do mouse em relação à aba
      const rect = tab.getBoundingClientRect();
      mouseOffsetX = e.clientX - rect.left;
      dragStartX = e.clientX;

      // Iniciar o processo de drag após um pequeno movimento
      const onMouseMove = (moveEvent) => {
        if (!isDragging && Math.abs(moveEvent.clientX - dragStartX) > 5) {
          isDragging = true;
          dragTab = tab;
          hasMovedEnough = true;

          // Configurar a aba para arrastar
          dragTab.classList.add("dragging");
          dragTab.style.position = "absolute";
          dragTab.style.zIndex = "1000";

          // Atualizar posição inicial
          updateTabPosition(moveEvent);
        }

        if (isDragging) {
          moveEvent.preventDefault();
          updateTabPosition(moveEvent);
        }
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);

        if (isDragging && dragTab) {
          isDragging = false;
          hasMovedEnough = false;
          dragTab.classList.remove("dragging");
          dragTab.style.position = "";
          dragTab.style.left = "";
          dragTab.style.top = "";
          dragTab.style.zIndex = "";
          dragTab = null;
        }
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
  });

  function updateTabPosition(e) {
    if (!dragTab || !isDragging) return;

    const tabListRect = tabList.getBoundingClientRect();
    const tabRect = dragTab.getBoundingClientRect();
    const dragTabWidth = tabRect.width;

    // Calcular nova posição mantendo a aba dentro dos limites do tabList
    let newX = e.clientX - tabListRect.left - mouseOffsetX;
    newX = Math.max(0, Math.min(newX, tabListRect.width - dragTabWidth));

    dragTab.style.left = `${newX}px`;
    dragTab.style.top = "0";

    // Encontrar a posição mais próxima para soltar
    const tabs = [...tabList.querySelectorAll(".tab:not(.dragging)")];

    let closestTab = null;
    let closestDistance = Infinity;
    let shouldInsertBefore = true;

    tabs.forEach((tab) => {
      const rect = tab.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const distance = Math.abs(e.clientX - center);

      // Só considerar tabs que estão próximas o suficiente
      if (distance < dragTabWidth && distance < closestDistance) {
        closestDistance = distance;
        closestTab = tab;
        shouldInsertBefore = e.clientX < center;
      }
    });

    // Reposicionar apenas se estivermos próximos o suficiente de outra aba
    if (closestTab && hasMovedEnough && closestDistance < dragTabWidth / 2) {
      const currentIndex = Array.from(tabList.children).indexOf(dragTab);
      const targetIndex = Array.from(tabList.children).indexOf(closestTab);

      // Evitar reposicionamento desnecessário
      if (
        currentIndex !== targetIndex &&
        currentIndex !== targetIndex + (shouldInsertBefore ? 0 : 1)
      ) {
        if (shouldInsertBefore) {
          tabList.insertBefore(dragTab, closestTab);
        } else {
          tabList.insertBefore(dragTab, closestTab.nextSibling);
        }
      }
    }
  }

  // Adicionar aba Dashboard sempre disponível
  console.log("🚀 [DEBUG] Inicializando sistema de abas");
  addDashboardTab();
  console.log("✅ [DEBUG] Sistema de abas inicializado");
}

function addDashboardTab() {
  console.log("🚀 [DEBUG] Iniciando addDashboardTab");

  const tabList = document.getElementById("tabList");
  if (!tabList) {
    console.error("❌ [DEBUG] tabList não encontrado");
    return;
  }
  console.log("✅ [DEBUG] tabList encontrado:", tabList);

  // Verificar se a aba dashboard já existe
  const existingDashboardTab = document.querySelector(
    '.tab[data-tool="dashboard"]'
  );
  if (existingDashboardTab) {
    console.log("⚠️ [DEBUG] Aba dashboard já existe, saindo");
    return;
  }
  console.log("✅ [DEBUG] Aba dashboard não existe, continuando");

  // Carregar CSS do dashboard se ainda não estiver carregado
  if (!document.querySelector('link[href="../styles/dashboard.css"]')) {
    console.log("📄 [DEBUG] Carregando CSS do dashboard");
    loadCSS("/styles/dashboard.css");
    console.log("✅ [DEBUG] CSS do dashboard carregado");
  } else {
    console.log("✅ [DEBUG] CSS do dashboard já estava carregado");
  }

  // Carregar script do dashboard se ainda não estiver carregado
  if (!window.initDashboard) {
    console.log("📄 [DEBUG] Carregando script dashboard.js");

    // Carregar Chart.js primeiro
    if (typeof Chart === "undefined") {
      console.log("📊 [DEBUG] Carregando Chart.js");
      loadScript("https://cdn.jsdelivr.net/npm/chart.js")
        .then(() => {
          console.log("✅ [DEBUG] Chart.js carregado");
          // Agora carregar dashboard.js
          return loadScript("/javascripts/dashboard.js");
        })
        .then(() => {
          console.log("✅ [DEBUG] Script dashboard.js carregado");
          // Recriar a aba após o script ser carregado
          createDashboardTab();
        })
        .catch((error) => {
          console.error("❌ [DEBUG] Erro ao carregar scripts:", error);
        });
    } else {
      // Chart.js já está carregado, carregar apenas dashboard.js
      loadScript("/javascripts/dashboard.js")
        .then(() => {
          console.log("✅ [DEBUG] Script dashboard.js carregado");
          // Recriar a aba após o script ser carregado
          createDashboardTab();
        })
        .catch((error) => {
          console.error("❌ [DEBUG] Erro ao carregar dashboard.js:", error);
        });
    }
    return; // Sair da função para evitar criar a aba antes do script
  }

  // Se chegou até aqui, o script já está carregado
  createDashboardTab();
}

function createDashboardTab() {
  console.log("🔧 [DEBUG] Criando aba do dashboard");
  const tabList = document.getElementById("tabList");
  if (!tabList) {
    console.error("❌ [DEBUG] tabList não encontrado em createDashboardTab");
    return;
  }

  const dashboardTab = document.createElement("div");
  dashboardTab.className = "tab active";
  dashboardTab.dataset.tool = "dashboard";
  dashboardTab.innerHTML = `
    <i class="fas fa-chart-line"></i>
    <span>Dashboard</span>
    <div class="close-tab" style="display: none;">
      <i class="fas fa-times"></i>
    </div>
  `;
  console.log("✅ [DEBUG] Aba criada:", dashboardTab);

  // Adicionar evento de clique
  dashboardTab.addEventListener("click", () => {
    console.log("🖱️ [DEBUG] Clique na aba dashboard");
    activateTab(dashboardTab);
    showDashboard();
  });

  // Adicionar como primeira aba
  tabList.insertBefore(dashboardTab, tabList.firstChild);
  console.log("✅ [DEBUG] Aba adicionada à tabList");

  // Verificar se a aba está visível e ativa
  console.log(
    "🔍 [DEBUG] Aba dashboard visível?",
    dashboardTab.offsetParent !== null
  );
  console.log(
    "🔍 [DEBUG] Aba dashboard tem classe active?",
    dashboardTab.classList.contains("active")
  );
  console.log(
    "🔍 [DEBUG] Aba dashboard display:",
    window.getComputedStyle(dashboardTab).display
  );
  console.log(
    "🔍 [DEBUG] Aba dashboard visibility:",
    window.getComputedStyle(dashboardTab).visibility
  );

  // Ativar a aba automaticamente após um pequeno delay
  setTimeout(() => {
    console.log("🔄 [DEBUG] Ativando aba dashboard automaticamente");

    // Garantir que a tela de boas-vindas esteja escondida
    const welcomeScreen = document.getElementById("welcomeScreen");
    if (welcomeScreen) {
      welcomeScreen.style.display = "none";
      console.log("✅ [DEBUG] Welcome screen escondido durante ativação");
    }

    activateTab(dashboardTab);
  }, 200);

  // Criar conteúdo do dashboard
  console.log("🔧 [DEBUG] Criando conteúdo do dashboard");
  const dashboardContent = document.createElement("div");
  dashboardContent.className = "tool-content active";
  dashboardContent.dataset.tool = "dashboard";
  console.log("✅ [DEBUG] Container do dashboard criado:", dashboardContent);

  // Adicionar estilos inline temporários para debug
  console.log("🎨 [DEBUG] Aplicando estilos inline");
  dashboardContent.style.cssText = `
    position: absolute;
    top: 1rem;
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    background-color: var(--surface-color);
    border: 1px solid var(--border-color);
    border-radius: 0.75rem;
    margin: 0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    transition: opacity 0.3s ease, visibility 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    display: flex;
    flex-direction: column;
    overflow: auto;
  `;
  console.log("✅ [DEBUG] Estilos aplicados");
  dashboardContent.innerHTML = `
    <!-- Dashboard View -->
    <div id="dashboardView" class="dashboard-container active">
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
    </div>
  `;

  console.log(
    "📝 [DEBUG] HTML do dashboard definido, tamanho:",
    dashboardContent.innerHTML.length,
    "caracteres"
  );
  console.log(
    "🔍 [DEBUG] Primeiros 200 caracteres do HTML:",
    dashboardContent.innerHTML.substring(0, 200)
  );

  // Adicionar conteúdo à área de conteúdo
  console.log("🔍 [DEBUG] Procurando contentArea");
  const contentArea = document.getElementById("contentArea");
  if (contentArea) {
    console.log("✅ [DEBUG] contentArea encontrado:", contentArea);
    contentArea.appendChild(dashboardContent);
    console.log("✅ [DEBUG] Dashboard content adicionado ao DOM");
    console.log(
      "📊 [DEBUG] Tamanho final do HTML:",
      dashboardContent.innerHTML.length,
      "caracteres"
    );

    // Verificar se o dashboardView foi criado
    const dashboardView = document.getElementById("dashboardView");
    if (dashboardView) {
      console.log("✅ [DEBUG] dashboardView encontrado no DOM:", dashboardView);
      console.log(
        "🔍 [DEBUG] Classes do dashboardView:",
        dashboardView.className
      );
      console.log(
        "🔍 [DEBUG] Estilos computados do dashboardView:",
        window.getComputedStyle(dashboardView)
      );

      // Verificar se o dashboardView está visível
      const computedStyle = window.getComputedStyle(dashboardView);
      console.log("🔍 [DEBUG] dashboardView display:", computedStyle.display);
      console.log(
        "🔍 [DEBUG] dashboardView visibility:",
        computedStyle.visibility
      );
      console.log("🔍 [DEBUG] dashboardView opacity:", computedStyle.opacity);
      console.log("🔍 [DEBUG] dashboardView height:", computedStyle.height);
      console.log("🔍 [DEBUG] dashboardView width:", computedStyle.width);

      // Verificar se há conteúdo dentro do dashboardView
      const dashboardGrid = dashboardView.querySelector(".dashboard-grid");
      if (dashboardGrid) {
        console.log("✅ [DEBUG] dashboard-grid encontrado:", dashboardGrid);
        console.log(
          "🔍 [DEBUG] Número de cards no grid:",
          dashboardGrid.children.length
        );
      } else {
        console.error("❌ [DEBUG] dashboard-grid NÃO encontrado");
      }
    } else {
      console.error("❌ [DEBUG] dashboardView NÃO encontrado no DOM");
    }
  } else {
    console.error("❌ [DEBUG] contentArea NÃO encontrado");
  }
}

function showDashboard() {
  console.log("🎯 [DEBUG] showDashboard chamado");

  // Esconder tela de boas-vindas
  const welcomeScreen = document.getElementById("welcomeScreen");
  if (welcomeScreen) {
    console.log("✅ [DEBUG] Escondendo welcomeScreen");
    welcomeScreen.style.display = "none";
  } else {
    console.error("❌ [DEBUG] welcomeScreen não encontrado");
  }

  // Ativar aba do dashboard
  console.log("🔍 [DEBUG] Procurando aba do dashboard");
  const dashboardTab = document.querySelector('.tab[data-tool="dashboard"]');
  if (dashboardTab) {
    console.log("✅ [DEBUG] Aba do dashboard encontrada:", dashboardTab);
    activateTab(dashboardTab);
  } else {
    console.error("❌ [DEBUG] Aba do dashboard NÃO encontrada");
  }
}

async function loadToolContent(tool, contentElement) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    contentElement.querySelector(".loader").remove();

    // Caso especial para o painel administrativo
    if (tool === "admin") {
      window.location.href = "/administration";
      return;
    }

    switch (tool) {
      case "fretes":
        contentElement.innerHTML = `
          <div class="tool-header">
            <h2>Conhecimentos de Transporte Eletrônicos (CT-e)</h2>
            <p>Gerenciamento de fretes e conhecimentos de transporte.</p>
          </div>
          <div class="fretes-container">
            <div class="fretes-actions">
              <div class="fretes-search">
                <input type="text" id="fretesSearch" placeholder="Buscar por número ou cliente...">
                <button><i class="fas fa-search"></i></button>
              </div>
            </div>
            <div class="fretes-list" id="fretesList">
              <div class="loader">
                <i class="fas fa-spinner fa-spin"></i> Carregando conhecimentos de transporte...
              </div>
            </div>
            <div class="pagination" id="fretesPagination">
              <!-- Paginação será adicionada dinamicamente -->
            </div>
          </div>
        `;

        // Função para carregar os dados de fretes (CT-e)
        const loadCteData = async () => {
          try {
            const response = await fetch("http://localhost:4010/cte");
            if (!response.ok) {
              throw new Error("Erro ao buscar dados de CT-e");
            }
            const data = await response.json();
            return data;
          } catch (error) {
            console.error("Erro ao carregar dados de CT-e:", error);
            document.getElementById("fretesList").innerHTML = `
              <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar os dados. Verifique se o servidor está online.</p>
              </div>
            `;
            return [];
          }
        };

        // Função para renderizar os itens de CT-e
        const renderCteItems = (items) => {
          const fretesListElement = document.getElementById("fretesList");

          if (items.length === 0) {
            fretesListElement.innerHTML = `
              <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Nenhum conhecimento de transporte encontrado.</p>
              </div>
            `;
            return;
          }

          let html = `
            <div class="fretes-table-container">
              <table class="fretes-table">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Cliente</th>
                    <th>Data</th>
                    <th>Valor</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
          `;

          items.forEach((item) => {
            // Extrair a data e formatá-la
            const dateObj = new Date(item.DateAdd);
            const formattedDate = dateObj.toLocaleDateString("pt-BR");

            // Formatar o valor
            const formattedValue = new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(item.DocTotal);

            html += `
              <tr data-serial="${item.Serial}">
                <td class="frete-serial">
                  <i class="fas fa-file-invoice"></i>
                  <span>${item.Serial}</span>
                </td>
                <td class="frete-customer">${item.CardName}</td>
                <td class="frete-date">${formattedDate}</td>
                <td class="frete-value">${formattedValue}</td>
                <td class="frete-actions">
                  <button class="btn-view-frete" data-serial="${item.Serial}" title="Visualizar">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn-download-xml" data-serial="${item.Serial}" title="Baixar XML">
                    <i class="fas fa-download"></i>
                  </button>
                </td>
              </tr>
            `;
          });

          html += `
                </tbody>
              </table>
            </div>
          `;

          fretesListElement.innerHTML = html;

          // Adicionar eventos aos botões
          setupCteButtons();
        };

        // Configurar os botões
        const setupCteButtons = () => {
          // Botões para visualizar detalhes
          document.querySelectorAll(".btn-view-frete").forEach((button) => {
            button.addEventListener("click", (e) => {
              const serial = e.currentTarget.dataset.serial;
              showNotification(`Visualizando CT-e ${serial}`, "info");
              // Aqui você pode implementar a lógica para mostrar detalhes do CT-e
            });
          });

          // Botões para download do XML
          document.querySelectorAll(".btn-download-xml").forEach((button) => {
            button.addEventListener("click", (e) => {
              const serial = e.currentTarget.dataset.serial;
              showNotification(
                `Iniciando download do XML do CT-e ${serial}`,
                "success"
              );
              // Aqui você pode implementar a lógica para download do XML
            });
          });
        };

        // Configuração de busca
        const setupCteSearch = () => {
          const searchInput = document.getElementById("fretesSearch");
          let searchTimeout;

          searchInput.addEventListener("input", (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
              const searchTerm = e.target.value.toLowerCase();
              filterCteItems(searchTerm);
            }, 300);
          });
        };

        // Função para filtrar os itens de CT-e
        const filterCteItems = (searchTerm) => {
          const filteredItems = allCteItems.filter((item) => {
            return (
              item.Serial.toLowerCase().includes(searchTerm) ||
              item.CardName.toLowerCase().includes(searchTerm)
            );
          });

          renderCteItems(filteredItems);
        };

        // Carregar e renderizar os dados
        let allCteItems = [];

        (async () => {
          allCteItems = await loadCteData();
          renderCteItems(allCteItems);
          setupCteSearch();
        })();

        break;
      case "frota":
        contentElement.innerHTML = `
          <div class="tool-header">
            <h2>Gerenciamento de Frota</h2>
            <p>Sistema de gerenciamento de veículos da frota.</p>
          </div>
          <div class="frota-tabs">
            <button class="frota-tab-button active" data-tab="veiculos">
              <i class="fas fa-car"></i> Veículos
            </button>
            <button class="frota-tab-button" data-tab="manutencoes">
              <i class="fas fa-tools"></i> Manutenções
            </button>
          </div>
          <div class="frota-container">
            <!-- Aba de Veículos -->
            <div class="frota-tab-content active" id="veiculosTab">
              <div class="frota-actions">
                <button class="btn-primary frota-add-btn">
                  <i class="fas fa-plus"></i> Adicionar Veículo
                </button>
                <div class="frota-search">
                  <input type="text" id="frotaSearch" placeholder="Buscar veículo por placa ou modelo...">
                  <button><i class="fas fa-search"></i></button>
                </div>
                <div class="frota-filter">
                  <select id="frotaFilter">
                    <option value="todos">Todos os veículos</option>
                    <option value="Disponível">Disponíveis</option>
                    <option value="Em uso">Em uso</option>
                    <option value="Manutenção">Em manutenção</option>
                  </select>
                </div>
              </div>
              <div class="frota-list" id="frotaList">
                <div class="loader">
                  <i class="fas fa-spinner fa-spin"></i> Carregando veículos...
                </div>
              </div>
              <div class="pagination" id="frotaPagination">
                <!-- Paginação será adicionada dinamicamente -->
              </div>
            </div>
            
            <!-- Aba de Manutenções -->
            <div class="frota-tab-content" id="manutencoesTab">
              <div class="frota-actions">
                <button class="btn-primary frota-add-manutencao-btn">
                  <i class="fas fa-plus"></i> Registrar Manutenção
                </button>
                <div class="frota-search">
                  <input type="text" id="manutencaoSearch" placeholder="Buscar por placa ou serviço...">
                  <button><i class="fas fa-search"></i></button>
                </div>
                <div class="frota-filter">
                  <select id="manutencaoFilter">
                    <option value="todos">Todos os veículos</option>
                  </select>
                </div>
              </div>
              <div class="manutencao-list" id="manutencaoList">
                <div class="loader">
                  <i class="fas fa-spinner fa-spin"></i> Carregando manutenções...
                </div>
              </div>
              <div class="pagination" id="manutencaoPagination">
                <!-- Paginação será adicionada dinamicamente -->
              </div>
            </div>
          </div>
        `;

        // Configurar as abas
        const tabButtons = document.querySelectorAll(".frota-tab-button");
        const tabContents = document.querySelectorAll(".frota-tab-content");

        tabButtons.forEach((button) => {
          button.addEventListener("click", () => {
            const tabName = button.dataset.tab;

            // Desativar todas as abas
            tabButtons.forEach((btn) => btn.classList.remove("active"));
            tabContents.forEach((content) =>
              content.classList.remove("active")
            );

            // Ativar a aba selecionada
            button.classList.add("active");
            document.getElementById(`${tabName}Tab`).classList.add("active");
          });
        });

        // Configuração de paginação
        const ITEMS_PER_PAGE = 6;
        let currentFrotaPage = 1;
        let currentManutencaoPage = 1;
        let veiculosAtivos = [];
        let manutencoesAgrupadas = [];

        // Função para criar paginação
        const createPagination = (
          totalItems,
          currentPage,
          itemsPerPage,
          containerId,
          onPageChange
        ) => {
          const totalPages = Math.ceil(totalItems / itemsPerPage);
          const container = document.getElementById(containerId);
          container.innerHTML = "";

          if (totalPages <= 1) {
            return;
          }

          // Criar o controlador de paginação
          const pagination = document.createElement("div");
          pagination.className = "pagination-controls";

          // Botão anterior
          const prevButton = document.createElement("button");
          prevButton.className = "pagination-btn prev-btn";
          prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
          prevButton.disabled = currentPage === 1;
          prevButton.addEventListener("click", () => {
            if (currentPage > 1) {
              onPageChange(currentPage - 1);
            }
          });
          pagination.appendChild(prevButton);

          // Números das páginas
          const maxPagesToShow = 5;
          const startPage = Math.max(
            1,
            currentPage - Math.floor(maxPagesToShow / 2)
          );
          const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

          // Primeira página, se não estiver no início
          if (startPage > 1) {
            const firstPageBtn = document.createElement("button");
            firstPageBtn.className = "pagination-btn page-num";
            firstPageBtn.textContent = "1";
            firstPageBtn.addEventListener("click", () => onPageChange(1));
            pagination.appendChild(firstPageBtn);

            if (startPage > 2) {
              const ellipsis = document.createElement("span");
              ellipsis.className = "pagination-ellipsis";
              ellipsis.textContent = "...";
              pagination.appendChild(ellipsis);
            }
          }

          // Páginas numéricas
          for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement("button");
            pageButton.className = `pagination-btn page-num ${
              i === currentPage ? "active" : ""
            }`;
            pageButton.textContent = i.toString();
            pageButton.addEventListener("click", () => onPageChange(i));
            pagination.appendChild(pageButton);
          }

          // Última página, se não estiver no final
          if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
              const ellipsis = document.createElement("span");
              ellipsis.className = "pagination-ellipsis";
              ellipsis.textContent = "...";
              pagination.appendChild(ellipsis);
            }

            const lastPageBtn = document.createElement("button");
            lastPageBtn.className = "pagination-btn page-num";
            lastPageBtn.textContent = totalPages.toString();
            lastPageBtn.addEventListener("click", () =>
              onPageChange(totalPages)
            );
            pagination.appendChild(lastPageBtn);
          }

          // Botão próximo
          const nextButton = document.createElement("button");
          nextButton.className = "pagination-btn next-btn";
          nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
          nextButton.disabled = currentPage === totalPages;
          nextButton.addEventListener("click", () => {
            if (currentPage < totalPages) {
              onPageChange(currentPage + 1);
            }
          });
          pagination.appendChild(nextButton);

          container.appendChild(pagination);

          // Adicionar informação de paginação
          const paginationInfo = document.createElement("div");
          paginationInfo.className = "pagination-info";
          const startItemNum = (currentPage - 1) * itemsPerPage + 1;
          const endItemNum = Math.min(currentPage * itemsPerPage, totalItems);
          paginationInfo.textContent = `Mostrando ${startItemNum} a ${endItemNum} de ${totalItems} itens`;
          container.appendChild(paginationInfo);
        };

        // Carregar dados da frota
        const loadFrotaData = async () => {
          try {
            const response = await fetch("http://localhost:4010/frota");
            if (!response.ok) {
              throw new Error("Falha ao carregar dados da frota");
            }

            const veiculos = await response.json();
            const frotaList = document.getElementById("frotaList");
            frotaList.innerHTML = "";

            // Filtrar veículos para remover os desativados
            veiculosAtivos = veiculos.filter(
              (veiculo) => veiculo.situacaoativo !== "Desativado"
            );

            if (veiculosAtivos.length === 0) {
              frotaList.innerHTML =
                '<div class="empty-state">Nenhum veículo ativo encontrado.</div>';
              return;
            }

            // Renderizar os veículos paginados
            renderFrotaPage(currentFrotaPage);

            // Preencher o filtro de manutenções com as placas
            const manutencaoFilter =
              document.getElementById("manutencaoFilter");

            // Limpar opções existentes, exceto a primeira (todos)
            while (manutencaoFilter.options.length > 1) {
              manutencaoFilter.remove(1);
            }

            // Adicionar as placas como opções no filtro
            veiculosAtivos.forEach((veiculo) => {
              const option = document.createElement("option");
              option.value = veiculo.idobject;
              option.textContent = `${veiculo.idobject} - ${veiculo.nmobject}`;
              manutencaoFilter.appendChild(option);
            });

            // Configurar funcionalidade de filtro
            const frotaFilter = document.getElementById("frotaFilter");
            frotaFilter.addEventListener("change", () => {
              const selectedStatus = frotaFilter.value;
              filterAndPaginateFrota(
                selectedStatus,
                document.getElementById("frotaSearch").value
              );
            });

            // Configurar funcionalidade de busca
            const frotaSearch = document.getElementById("frotaSearch");
            frotaSearch.addEventListener("input", () => {
              const searchTerm = frotaSearch.value.toLowerCase();
              filterAndPaginateFrota(
                document.getElementById("frotaFilter").value,
                searchTerm
              );
            });
          } catch (error) {
            console.error("Erro ao carregar dados da frota:", error);
            const frotaList = document.getElementById("frotaList");
            frotaList.innerHTML = `
              <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Falha ao carregar dados da frota. Tente novamente mais tarde.</p>
                <button class="retry-button" id="retryLoadFrota">Tentar novamente</button>
              </div>
            `;

            document
              .getElementById("retryLoadFrota")
              .addEventListener("click", loadFrotaData);
          }
        };

        // Função para filtrar e paginar veículos
        const filterAndPaginateFrota = (statusFilter, searchTerm) => {
          // Aplicar filtros
          const filteredVeiculos = veiculosAtivos.filter((veiculo) => {
            // Filtro de status
            const matchStatus =
              statusFilter === "todos" ||
              veiculo.situacaoativo === statusFilter;

            // Filtro de busca
            const placa = veiculo.idobject.toLowerCase();
            const modelo = veiculo.nmobject.toLowerCase();
            const matchSearch =
              searchTerm === "" ||
              placa.includes(searchTerm) ||
              modelo.includes(searchTerm);

            return matchStatus && matchSearch;
          });

          // Verificar se há resultados
          const frotaList = document.getElementById("frotaList");
          if (filteredVeiculos.length === 0) {
            frotaList.innerHTML =
              '<div class="empty-state">Nenhum veículo encontrado com os filtros aplicados.</div>';
            document.getElementById("frotaPagination").innerHTML = "";
            return;
          }

          // Resetar para primeira página ao aplicar filtros
          currentFrotaPage = 1;

          // Renderizar resultados paginados
          renderFrotaItems(filteredVeiculos);
        };

        // Função para renderizar os veículos paginados
        const renderFrotaPage = (page) => {
          currentFrotaPage = page;
          renderFrotaItems(veiculosAtivos);
        };

        // Função para renderizar itens de frota com base nos filtros atuais
        const renderFrotaItems = (items) => {
          const frotaList = document.getElementById("frotaList");
          frotaList.innerHTML = "";

          // Calcular índices para paginação
          const startIndex = (currentFrotaPage - 1) * ITEMS_PER_PAGE;
          const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, items.length);
          const paginatedItems = items.slice(startIndex, endIndex);

          // Criar os cards para os itens paginados
          paginatedItems.forEach((veiculo) => {
            const card = document.createElement("div");
            card.className = "frota-card";
            card.dataset.placa = veiculo.idobject;
            card.dataset.situacao = veiculo.situacaoativo;

            let statusClass = "disponivel";
            if (veiculo.situacaoativo === "Em uso") {
              statusClass = "em_uso";
            } else if (veiculo.situacaoativo === "Manutenção") {
              statusClass = "manutencao";
            }

            card.innerHTML = `
              <div class="frota-card-header">
                <h3>${veiculo.idobject}</h3>
                <span class="status-badge ${statusClass}">${
              veiculo.situacaoativo
            }</span>
              </div>
              <div class="frota-card-body">
                <div class="vehicle-info">
                  <p><strong>Modelo:</strong> ${veiculo.nmobject}</p>
                  <p><strong>Tipo:</strong> ${veiculo.nmobjecttype}</p>
                  <p><strong>Fabricante:</strong> ${
                    veiculo.nmcompany || "Não informado"
                  }</p>
                  <p><strong>Local:</strong> ${veiculo.nmsite}</p>
                </div>
              </div>
              <div class="frota-card-footer">
                <button class="btn-outline btn-edit" data-placa="${
                  veiculo.idobject
                }"><i class="fas fa-edit"></i> Editar</button>
                <button class="btn-outline btn-history" data-placa="${
                  veiculo.idobject
                }"><i class="fas fa-history"></i> Histórico</button>
                ${
                  veiculo.situacaoativo === "Manutenção"
                    ? `<button class="btn-outline btn-maintenance-complete" data-placa="${veiculo.idobject}"><i class="fas fa-check"></i> Finalizar manutenção</button>`
                    : `<button class="btn-outline btn-maintenance" data-placa="${veiculo.idobject}"><i class="fas fa-tools"></i> Manutenção</button>`
                }
              </div>
            `;

            frotaList.appendChild(card);
          });

          // Configurar os botões de ação
          setupFrotaButtons();

          // Atualizar a paginação
          createPagination(
            items.length,
            currentFrotaPage,
            ITEMS_PER_PAGE,
            "frotaPagination",
            renderFrotaPage
          );
        };

        // Configurar botões de ação para os cards de veículos
        const setupFrotaButtons = () => {
          // Configurar os botões de ação dos cartões
          document.querySelectorAll(".btn-edit").forEach((btn) => {
            btn.addEventListener("click", () => {
              showNotification(`Editando veículo ${btn.dataset.placa}`, "info");
            });
          });

          document.querySelectorAll(".btn-history").forEach((btn) => {
            btn.addEventListener("click", () => {
              // Alternar para a aba de manutenções e filtrar pelo veículo
              document
                .querySelector('.frota-tab-button[data-tab="manutencoes"]')
                .click();
              document.getElementById("manutencaoFilter").value =
                btn.dataset.placa;
              document
                .getElementById("manutencaoFilter")
                .dispatchEvent(new Event("change"));
            });
          });

          document.querySelectorAll(".btn-maintenance").forEach((btn) => {
            btn.addEventListener("click", () => {
              showNotification(
                `Registrando manutenção para o veículo ${btn.dataset.placa}`,
                "info"
              );
            });
          });

          document
            .querySelectorAll(".btn-maintenance-complete")
            .forEach((btn) => {
              btn.addEventListener("click", () => {
                showNotification(
                  `Finalizando manutenção do veículo ${btn.dataset.placa}`,
                  "info"
                );
              });
            });
        };

        // Carregar dados de manutenções
        const loadManutencoesData = async () => {
          try {
            const response = await fetch(
              "http://localhost:4010/frota/manutencoes"
            );
            if (!response.ok) {
              throw new Error("Falha ao carregar dados de manutenções");
            }

            const manutencoes = await response.json();
            const manutencaoList = document.getElementById("manutencaoList");
            manutencaoList.innerHTML = "";

            if (manutencoes.length === 0) {
              manutencaoList.innerHTML =
                '<div class="empty-state">Nenhuma manutenção encontrada.</div>';
              return;
            }

            // Agrupar manutenções por veículo e data
            const grupamentoManutencoes = {};

            manutencoes.forEach((manutencao) => {
              const placa = manutencao.idobject;
              const data = manutencao.dtcheckin;

              // Criar chave combinada de placa e data
              const chave = `${placa}-${data}`;

              if (!grupamentoManutencoes[chave]) {
                grupamentoManutencoes[chave] = {
                  placa,
                  modelo: manutencao.nmobject,
                  local: manutencao.nmsite,
                  data,
                  status: manutencao.situacaoativo,
                  responsavel: manutencao.idcommercial,
                  observacao: manutencao.dsobservation,
                  servicos: [],
                };
              }

              // Adicionar o serviço ao grupo
              grupamentoManutencoes[chave].servicos.push({
                descricao: manutencao.nmcostvariable,
                origem: manutencao.origemcusto,
                valor: manutencao.vlrealcost,
              });
            });

            // Agrupar por veículo para exibição
            const manutencoesVeiculos = {};

            // Converter grupos para array de manutenções
            Object.values(grupamentoManutencoes).forEach((manutencao) => {
              const placa = manutencao.placa;

              if (!manutencoesVeiculos[placa]) {
                manutencoesVeiculos[placa] = {
                  placa,
                  modelo: manutencao.modelo,
                  status: manutencao.status,
                  local: manutencao.local,
                  manutencoes: [],
                };
              }

              manutencoesVeiculos[placa].manutencoes.push(manutencao);
            });

            // Converter para array para paginação
            manutencoesAgrupadas = Object.values(manutencoesVeiculos);

            // Renderizar primeira página
            renderManutencaoPage(1);

            // Configurar funcionalidade de filtro para manutenções
            const manutencaoFilter =
              document.getElementById("manutencaoFilter");
            manutencaoFilter.addEventListener("change", () => {
              const selectedPlaca = manutencaoFilter.value;
              filterAndPaginateManutencoes(
                selectedPlaca,
                document.getElementById("manutencaoSearch").value
              );
            });

            // Configurar funcionalidade de busca para manutenções
            const manutencaoSearch =
              document.getElementById("manutencaoSearch");
            manutencaoSearch.addEventListener("input", () => {
              const searchTerm = manutencaoSearch.value.toLowerCase();
              filterAndPaginateManutencoes(
                document.getElementById("manutencaoFilter").value,
                searchTerm
              );
            });
          } catch (error) {
            console.error("Erro ao carregar dados de manutenções:", error);
            const manutencaoList = document.getElementById("manutencaoList");
            manutencaoList.innerHTML = `
              <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Falha ao carregar dados de manutenções. Tente novamente mais tarde.</p>
                <button class="retry-button" id="retryLoadManutencoes">Tentar novamente</button>
              </div>
            `;

            document
              .getElementById("retryLoadManutencoes")
              .addEventListener("click", loadManutencoesData);
          }
        };

        // Função para filtrar e paginar manutenções
        const filterAndPaginateManutencoes = (placaFilter, searchTerm) => {
          // Aplicar filtros
          const filteredManutencoes = manutencoesAgrupadas.filter((veiculo) => {
            // Filtro de placa
            const matchPlaca =
              placaFilter === "todos" || veiculo.placa === placaFilter;

            // Filtro de busca
            const placa = veiculo.placa.toLowerCase();
            const modelo = veiculo.modelo.toLowerCase();

            // Verificar se o termo de busca está nos serviços
            const servicosMatch = veiculo.manutencoes.some((manutencao) => {
              return manutencao.servicos.some((servico) =>
                servico.descricao.toLowerCase().includes(searchTerm)
              );
            });

            const matchSearch =
              searchTerm === "" ||
              placa.includes(searchTerm) ||
              modelo.includes(searchTerm) ||
              servicosMatch;

            return matchPlaca && matchSearch;
          });

          // Verificar se há resultados
          const manutencaoList = document.getElementById("manutencaoList");
          if (filteredManutencoes.length === 0) {
            manutencaoList.innerHTML =
              '<div class="empty-state">Nenhuma manutenção encontrada com os filtros aplicados.</div>';
            document.getElementById("manutencaoPagination").innerHTML = "";
            return;
          }

          // Resetar para primeira página ao aplicar filtros
          currentManutencaoPage = 1;

          // Renderizar resultados paginados
          renderManutencaoItems(filteredManutencoes);
        };

        // Função para renderizar a página de manutenções
        const renderManutencaoPage = (page) => {
          currentManutencaoPage = page;
          renderManutencaoItems(manutencoesAgrupadas);
        };

        // Função para renderizar itens de manutenção com base nos filtros atuais
        const renderManutencaoItems = (items) => {
          const manutencaoList = document.getElementById("manutencaoList");
          manutencaoList.innerHTML = "";

          // Calcular índices para paginação
          const startIndex = (currentManutencaoPage - 1) * ITEMS_PER_PAGE;
          const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, items.length);
          const paginatedItems = items.slice(startIndex, endIndex);

          // Criar os cards para os itens paginados
          paginatedItems.forEach((veiculo) => {
            const card = document.createElement("div");
            card.className = "manutencao-veiculo-card";
            card.dataset.placa = veiculo.placa;

            let statusClass = "disponivel";
            if (veiculo.status === "Em uso") {
              statusClass = "em_uso";
            } else if (veiculo.status === "Manutenção") {
              statusClass = "manutencao";
            }

            // Ordenar manutenções por data - mais recentes primeiro
            const manutencoes = veiculo.manutencoes.sort((a, b) => {
              return new Date(b.data) - new Date(a.data);
            });

            // Contar total de serviços em todas as manutenções
            const totalServicos = manutencoes.reduce((total, manutencao) => {
              return total + manutencao.servicos.length;
            }, 0);

            // Obter a data da última manutenção
            const ultimaManutencao = manutencoes[0];
            const dataUltimaManutencao = new Date(
              ultimaManutencao.data
            ).toLocaleDateString("pt-BR");

            // Obter serviços da última manutenção para preview
            const servicosPreview = ultimaManutencao.servicos
              .map((s) => s.descricao)
              .slice(0, 2);
            const temMaisServicos = ultimaManutencao.servicos.length > 2;

            // Obter valor total se disponível na observação
            let valorUltimaManutencao = "";
            if (
              ultimaManutencao.observacao &&
              ultimaManutencao.observacao.includes("R$")
            ) {
              const match =
                ultimaManutencao.observacao.match(/R\$\s*([\d.]+,\d+)/);
              if (match) {
                valorUltimaManutencao = match[0];
              }
            }

            card.innerHTML = `
              <div class="manutencao-veiculo-header">
                <div class="manutencao-veiculo-info">
                  <h3>${veiculo.placa}</h3>
                  <p class="veiculo-modelo">${veiculo.modelo}</p>
                </div>
                <span class="status-badge ${statusClass}">${
              veiculo.status
            }</span>
              </div>
              <div class="manutencao-veiculo-body">
                <div class="manutencao-veiculo-stats">
                  <div class="manutencao-stat">
                    <span class="stat-value">${manutencoes.length}</span>
                    <span class="stat-label">Manutenções</span>
                  </div>
                  <div class="manutencao-stat">
                    <span class="stat-value">${totalServicos}</span>
                    <span class="stat-label">Serviços</span>
                  </div>
                  <div class="manutencao-stat">
                    <span class="stat-value">${dataUltimaManutencao}</span>
                    <span class="stat-label">Última manutenção</span>
                  </div>
                </div>
                <div class="manutencao-veiculo-preview">
                  <h4>Últimos serviços:</h4>
                  <ul class="servicos-preview">
                    ${servicosPreview
                      .map((servico) => `<li>${servico}</li>`)
                      .join("")}
                    ${
                      temMaisServicos
                        ? `<li class="mais-servicos">+ ${
                            ultimaManutencao.servicos.length - 2
                          } mais</li>`
                        : ""
                    }
                  </ul>
                  ${
                    valorUltimaManutencao
                      ? `<p class="ultimo-valor">Valor: ${valorUltimaManutencao}</p>`
                      : ""
                  }
                </div>
              </div>
              <div class="manutencao-veiculo-footer">
                <button class="btn-outline btn-expandir" data-placa="${
                  veiculo.placa
                }">
                  <i class="fas fa-chevron-down"></i> Ver histórico de manutenções
                </button>
              </div>
              <div class="manutencao-veiculo-detalhes" style="display: none;">
                <div class="manutencao-timeline">
                  ${manutencoes
                    .map((manutencao, index) => {
                      const dataFormatada = new Date(
                        manutencao.data
                      ).toLocaleDateString("pt-BR");

                      // Extrair valor total se disponível na observação
                      let valorTotal = "";
                      if (
                        manutencao.observacao &&
                        manutencao.observacao.includes("R$")
                      ) {
                        const match =
                          manutencao.observacao.match(/R\$\s*([\d.]+,\d+)/);
                        if (match) {
                          valorTotal = match[0];
                        }
                      }

                      // Criar lista de serviços
                      const servicosHtml = manutencao.servicos
                        .map(
                          (servico) => `
                        <li class="servico-item">
                          <div class="servico-descricao">${servico.descricao}</div>
                          <div class="servico-origem">${servico.origem}</div>
                        </li>
                      `
                        )
                        .join("");

                      return `
                      <div class="manutencao-evento ${
                        index === 0 ? "primeiro-evento" : ""
                      }">
                        <div class="evento-data">
                          <div class="evento-data-ponto"></div>
                          <div class="evento-data-valor">${dataFormatada}</div>
                        </div>
                        <div class="evento-conteudo">
                          <div class="evento-info">
                            <p>${
                              manutencao.responsavel
                                ? `<strong>Responsável:</strong> ${manutencao.responsavel}`
                                : ""
                            }</p>
                            ${
                              valorTotal
                                ? `<p><strong>Valor:</strong> ${valorTotal}</p>`
                                : ""
                            }
                            ${
                              manutencao.observacao
                                ? `<p><strong>Observação:</strong> ${manutencao.observacao}</p>`
                                : ""
                            }
                          </div>
                          <div class="evento-servicos">
                            <h5>Serviços realizados:</h5>
                            <ul class="servicos-lista">
                              ${servicosHtml}
                            </ul>
                          </div>
                        </div>
                      </div>
                    `;
                    })
                    .join("")}
                </div>
              </div>
            `;

            manutencaoList.appendChild(card);
          });

          // Configurar os botões e comportamentos
          setupManutencaoButtons();

          // Atualizar a paginação
          createPagination(
            items.length,
            currentManutencaoPage,
            ITEMS_PER_PAGE,
            "manutencaoPagination",
            renderManutencaoPage
          );
        };

        // Configurar botões de ação para os cards de manutenção
        const setupManutencaoButtons = () => {
          // Configurar os botões de expandir/colapsar
          document.querySelectorAll(".btn-expandir").forEach((btn) => {
            btn.addEventListener("click", (e) => {
              const card = btn.closest(".manutencao-veiculo-card");
              const detalhes = card.querySelector(
                ".manutencao-veiculo-detalhes"
              );
              const icone = btn.querySelector("i");

              if (detalhes.style.display === "none") {
                // Expandir
                detalhes.style.display = "block";
                btn.innerHTML =
                  '<i class="fas fa-chevron-up"></i> Ocultar histórico de manutenções';

                // Animar a abertura
                detalhes.style.maxHeight = "0";
                setTimeout(() => {
                  detalhes.style.maxHeight = detalhes.scrollHeight + "px";
                }, 10);
              } else {
                // Colapsar
                detalhes.style.maxHeight = "0";

                // Aguardar o término da animação para esconder
                setTimeout(() => {
                  detalhes.style.display = "none";
                  btn.innerHTML =
                    '<i class="fas fa-chevron-down"></i> Ver histórico de manutenções';
                }, 300);
              }
            });
          });
        };

        // Iniciar o carregamento dos dados
        loadFrotaData();
        loadManutencoesData();

        // Configurar o botão de adicionar veículo
        document
          .querySelector(".frota-add-btn")
          .addEventListener("click", () => {
            showNotification(
              "Funcionalidade de adicionar veículo em desenvolvimento",
              "info"
            );
          });

        // Configurar o botão de registrar manutenção
        document
          .querySelector(".frota-add-manutencao-btn")
          .addEventListener("click", () => {
            showNotification(
              "Funcionalidade de registrar manutenção em desenvolvimento",
              "info"
            );
          });

        break;
      case "rastreamento":
        // Carregar o script de rastreamento se ainda não estiver carregado
        if (!window.initRastreamento) {
          await loadScript("../javascripts/rastreamento.js");
        }

        // Carregar a biblioteca Chart.js se ainda não estiver carregada
        if (typeof Chart === "undefined") {
          await loadScript("https://cdn.jsdelivr.net/npm/chart.js");
        }

        // Carregar o script do dashboard se ainda não estiver carregado
        if (!window.initDashboard) {
          await loadScript("../javascripts/dashboard.js");
        }

        // Carregar o CSS de rastreamento se ainda não estiver carregado
        if (
          !document.querySelector('link[href="../styles/rastreamento.css"]')
        ) {
          loadCSS("../styles/rastreamento.css");
        }

        // Carregar o CSS do dashboard se ainda não estiver carregado
        if (!document.querySelector('link[href="../styles/dashboard.css"]')) {
          loadCSS("../styles/dashboard.css");
        }

        // Criar a estrutura HTML para o rastreamento (apenas tabela)
        contentElement.innerHTML = `
            <!-- Tracking View -->
          <div id="trackingView" class="tracking-container">
              <div class="rastreamento-header" style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
                <div class="dashboard-title-row" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <h2 class="dashboard-title" style="font-size: 1.75rem; font-weight: 600; margin: 0;">Rastreamento de Notas</h2>
                </div>
              </div>
              <div id="rastreamentoContainer"></div>
          </div>
        `;

        // Inicializar o rastreamento
        if (window.initRastreamento) {
          window.initRastreamento();
        }

        // Inicializar o rastreamento
        if (window.initRastreamento) {
          window.initRastreamento();
        }

        // Adicionar eventos para todos os botões "Ver Rastreamento"
        setTimeout(() => {
          // Selecionar todos os botões com onclick="showTracking()"
          document
            .querySelectorAll('[onclick="showTracking()"]')
            .forEach((button) => {
              // Remover o atributo onclick para evitar duplicação
              button.removeAttribute("onclick");

              // Adicionar evento de clique
              button.addEventListener("click", () => {
                if (window.showTracking) {
                  window.showTracking();
                }
              });
            });

          // Selecionar todos os botões com a classe view-tracking-button
          document
            .querySelectorAll(".view-tracking-button")
            .forEach((button) => {
              if (!button.getAttribute("data-event-attached")) {
                // Marcar o botão como tendo um evento já anexado
                button.setAttribute("data-event-attached", "true");

                // Adicionar evento de clique
                button.addEventListener("click", () => {
                  if (window.showTracking) {
                    window.showTracking();
                  }
                });
              }
            });
        }, 300);

        // NÃO forçar nenhuma visualização por padrão, deixar que o usuário escolha
        // ou manter a visualização atual

        break;
      case "contratos":
        contentElement.innerHTML = `
          <div class="tool-header">
            <h2>Copasign</h2>
            <p>Esta ferramenta está em desenvolvimento.</p>
          </div>
        `;
        break;
      default:
        contentElement.innerHTML = `
          <div class="tool-header">
            <h2>Ferramenta não encontrada</h2>
            <p>A ferramenta solicitada não está disponível.</p>
          </div>
        `;
    }
  } catch (error) {
    console.error("Erro ao carregar conteúdo da ferramenta:", error);
    contentElement.innerHTML = `
      <div class="tool-header error">
        <h2>Erro ao carregar</h2>
        <p>Não foi possível carregar o conteúdo da ferramenta.</p>
      </div>
    `;
  }
}

// Função para carregar scripts dinamicamente
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Função para carregar CSS dinamicamente
function loadCSS(href) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

async function validateTokenExpiration() {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  try {
    const response = await fetch("http://localhost:4010/session/validate", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error("Falha na validação do token");
    }

    const userData = await response.json();
    const expToken = userData.exp;
    const currentTime = Math.floor(Date.now() / 1000);

    if (currentTime > expToken) {
      window.location.replace("/");
      return null;
    }

    return userData;
  } catch (error) {
    console.error("Erro ao validar token:", error);
    window.location.replace("/");
    return null;
  }
}

function initializeUserDropdown() {
  const userProfileButton = document.getElementById("userProfileButton");
  const template = document.getElementById("userDropdownTemplate");

  // Inicializar o Tippy
  const tippyInstance = tippy(userProfileButton, {
    content: template.content.cloneNode(true),
    placement: "top-end",
    trigger: "click",
    interactive: true,
    theme: "user-dropdown",
    arrow: false,
    offset: [0, 8],
    animation: "fade",
    appendTo: () => document.body,
    onShow(instance) {
      // Atualizar os dados do usuário no dropdown
      const content = instance.popper.querySelector(".user-dropdown");
      const userNamePreview = content.querySelector("#userNamePreview");
      const userStatusDot = content.querySelector("#userStatusDot");
      const userStatusText = content.querySelector("#userStatusText");
      const userPhotoPreview = content.querySelector("#userPhotoPreview");

      // Copiar dados do perfil principal para o dropdown
      const userName = document.getElementById("userName").textContent;
      const userStatus = document
        .getElementById("userStatus")
        .classList.contains("active");
      const userAvatar = document.getElementById("userAvatar").innerHTML;

      if (userNamePreview) userNamePreview.textContent = userName;
      if (userStatusDot) userStatusDot.classList.toggle("active", userStatus);
      if (userStatusText)
        userStatusText.textContent = userStatus ? "Ativo" : "Inativo";
      if (userPhotoPreview) userPhotoPreview.innerHTML = userAvatar;
    },
    onMount(instance) {
      // Atualizar os IDs dos elementos clonados
      const content = instance.popper.querySelector(".user-dropdown");
      const updatePhotoBtn = content.querySelector("[id='updatePhotoButton']");
      const logoutBtn = content.querySelector("[id='logoutButton']");

      // Adicionar eventos aos botões
      if (updatePhotoBtn) {
        updatePhotoBtn.addEventListener("click", () => {
          const photoModal = document.getElementById("photoModal");
          if (photoModal) {
            photoModal.classList.add("active");
            instance.hide(); // Fechar o dropdown
          }
        });
      }

      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          document.cookie =
            "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          window.location.replace("/");
        });
      }
    },
  });
}

function initializePhotoModal() {
  const photoModal = document.getElementById("photoModal");
  const closeModal = document.getElementById("closeModal");
  const cancelButton = document.getElementById("cancelPhotoUpdate");
  const saveButton = document.getElementById("savePhoto");
  const photoUpload = document.getElementById("photoUpload");
  const removePhotoButton = document.getElementById("removePhoto");
  const avatarPreview = document.getElementById("avatarPreview");

  if (
    !photoModal ||
    !closeModal ||
    !cancelButton ||
    !saveButton ||
    !photoUpload ||
    !removePhotoButton ||
    !avatarPreview
  ) {
    console.warn("Alguns elementos do modal de foto não foram encontrados");
    return;
  }

  // Variável para armazenar a foto selecionada
  let selectedPhoto = null;

  // Fechar o modal
  function closePhotoModal() {
    photoModal.classList.remove("active");
    selectedPhoto = null;
  }

  closeModal.addEventListener("click", closePhotoModal);
  cancelButton.addEventListener("click", closePhotoModal);

  // Quando o usuário seleciona uma foto
  photoUpload.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      // Em vez de mostrar a imagem diretamente, abrimos o modal de recorte
      const reader = new FileReader();
      reader.onload = (e) => {
        // Abrir o modal de recorte com a imagem selecionada
        openCropperModal(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  });

  // Remover a foto
  removePhotoButton.addEventListener("click", () => {
    selectedPhoto = null;
    avatarPreview.innerHTML = `<i class="fas fa-user"></i>`;
  });

  // Função para atualizar a preview após o recorte
  window.updateAvatarPreview = function (croppedImage) {
    selectedPhoto = croppedImage;
    avatarPreview.innerHTML = `<img src="${croppedImage}" alt="Preview" />`;
  };

  // Salvar a foto
  saveButton.addEventListener("click", async () => {
    // Mostrar indicador de carregamento
    const saveButtonText = saveButton.innerHTML;
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    saveButton.disabled = true;

    try {
      const userAvatar = document.getElementById("userAvatar");
      const userPhotoPreview = document.getElementById("userPhotoPreview");

      if (selectedPhoto) {
        // Se uma nova foto foi selecionada, enviá-la para o servidor
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        if (!token) {
          throw new Error("Token não encontrado");
        }

        const userData = await validateTokenExpiration();
        const email = userData.email;

        const response = await fetch(
          "http://localhost:4010/user/update-picture",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email,
              image: selectedPhoto,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Falha ao atualizar a foto de perfil");
        }

        // Atualizar a interface com a nova foto em ambos os lugares
        const photoContent = `<img src="${selectedPhoto}" alt="Avatar" />`;
        userAvatar.innerHTML = photoContent;
        if (userPhotoPreview) {
          userPhotoPreview.innerHTML = photoContent;
        }

        // Mostrar mensagem de sucesso
        showNotification("Foto de perfil atualizada com sucesso!", "success");

        closePhotoModal();
      } else if (avatarPreview.querySelector("i")) {
        // Se a foto foi removida, enviar requisição para remover a foto
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        if (!token) {
          throw new Error("Token não encontrado");
        }

        const userData = await validateTokenExpiration();
        const email = userData.email;

        // Enviar requisição para remover a foto
        const response = await fetch(
          "http://localhost:4010/user/update-picture",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email,
              image: null,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Falha ao remover a foto de perfil");
        }

        // Atualizar a interface em ambos os lugares
        const initialsContent = `<i class="fas fa-user"></i>`;
        userAvatar.innerHTML = initialsContent;
        if (userPhotoPreview) {
          userPhotoPreview.innerHTML = initialsContent;
        }

        // Mostrar mensagem de sucesso
        showNotification("Foto de perfil removida com sucesso!", "success");

        closePhotoModal();
      } else {
        closePhotoModal();
      }
    } catch (error) {
      console.error("Erro ao atualizar foto de perfil:", error);
      showNotification(
        "Erro ao atualizar foto de perfil. Tente novamente.",
        "error"
      );
    } finally {
      // Restaurar o botão
      saveButton.innerHTML = saveButtonText;
      saveButton.disabled = false;
    }
  });
}

function initializeCropperModal() {
  const cropperModal = document.getElementById("cropperModal");
  const closeCropperModal = document.getElementById("closeCropperModal");
  const cancelCrop = document.getElementById("cancelCrop");
  const applyCrop = document.getElementById("applyCrop");
  const cropperImage = document.getElementById("cropperImage");

  // Botões de controle
  const rotateLeft = document.getElementById("rotateLeft");
  const rotateRight = document.getElementById("rotateRight");
  const zoomIn = document.getElementById("zoomIn");
  const zoomOut = document.getElementById("zoomOut");
  const resetCropper = document.getElementById("resetCropper");

  let cropper = null;

  // Função para abrir o modal de recorte
  window.openCropperModal = function (imageUrl) {
    // Definir a imagem no elemento
    cropperImage.src = imageUrl;

    // Mostrar o modal
    cropperModal.classList.add("active");

    // Inicializar o Cropper.js após um pequeno delay para garantir que o modal esteja visível
    setTimeout(() => {
      cropper = new Cropper(cropperImage, {
        aspectRatio: 1, // Proporção 1:1 para avatar circular
        viewMode: 1, // Restringir a área de recorte à imagem
        dragMode: "move", // Permitir mover a imagem dentro da área de recorte
        autoCropArea: 0.8, // Tamanho da área de recorte (80% da imagem)
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
      });
    }, 300);
  };

  // Função para fechar o modal de recorte
  const handleCloseCropperModal = () => {
    cropperModal.classList.remove("active");
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
  };

  closeCropperModal.addEventListener("click", handleCloseCropperModal);
  cancelCrop.addEventListener("click", handleCloseCropperModal);

  // Aplicar o recorte
  applyCrop.addEventListener("click", () => {
    if (cropper) {
      // Obter a imagem recortada como data URL
      const croppedCanvas = cropper.getCroppedCanvas({
        width: 200, // Tamanho final da imagem
        height: 200,
        fillColor: "#fff",
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
      });

      const croppedImage = croppedCanvas.toDataURL("image/jpeg", 0.9);

      // Atualizar a preview no modal principal
      window.updateAvatarPreview(croppedImage);

      // Fechar o modal de recorte
      handleCloseCropperModal();
    }
  });

  // Controles do Cropper
  rotateLeft.addEventListener("click", () => {
    if (cropper) cropper.rotate(-90);
  });

  rotateRight.addEventListener("click", () => {
    if (cropper) cropper.rotate(90);
  });

  zoomIn.addEventListener("click", () => {
    if (cropper) cropper.zoom(0.1);
  });

  zoomOut.addEventListener("click", () => {
    if (cropper) cropper.zoom(-0.1);
  });

  resetCropper.addEventListener("click", () => {
    if (cropper) cropper.reset();
  });
}

function updateUserProfile(userData) {
  // Atualizar nome do usuário
  const userNameElement = document.getElementById("userName");
  if (userNameElement) {
    userNameElement.textContent = userData.name;
  }

  // Atualizar nome do usuário no dropdown
  const userNamePreviewElement = document.getElementById("userNamePreview");
  if (userNamePreviewElement) {
    userNamePreviewElement.textContent = userData.name;
  }

  // Atualizar email do usuário
  const userEmailElement = document.getElementById("userEmail");
  if (userEmailElement) {
    userEmailElement.textContent = userData.email;
  }

  // Atualizar status do usuário
  const userStatusElement = document.getElementById("userStatus");
  const userStatusDotElement = document.getElementById("userStatusDot");
  const userStatusTextElement = document.getElementById("userStatusText");

  const isActive = userData.status === "active";

  if (userStatusElement) {
    if (isActive) {
      userStatusElement.classList.add("active");
    } else {
      userStatusElement.classList.add("inactive");
    }
  }

  if (userStatusDotElement) {
    if (isActive) {
      userStatusDotElement.classList.add("active");
    }
  }

  if (userStatusTextElement) {
    userStatusTextElement.textContent = isActive ? "Ativo" : "Inativo";
  }

  // Atualizar avatar do usuário
  const userAvatarElement = document.getElementById("userAvatar");
  const userPhotoPreviewElement = document.getElementById("userPhotoPreview");

  // Função para atualizar a foto em ambos os lugares
  const updatePhotoDisplay = (content) => {
    if (userAvatarElement) {
      userAvatarElement.innerHTML = content;
    }

    if (userPhotoPreviewElement) {
      userPhotoPreviewElement.innerHTML = content;
    }
  };

  // Verificar se há uma foto no banco de dados
  if (userData.profile_picture && userData.profile_picture !== null) {
    // Se houver uma foto no banco de dados, usá-la
    updatePhotoDisplay(
      `<img src="${userData.profile_picture}" alt="${userData.name}" />`
    );
  } else {
    // Caso não haja foto, gerar avatar com as iniciais do nome do usuário
    const initials = getInitials(userData.name);
    updatePhotoDisplay(initials);
  }

  // Verificar se o usuário é administrador
  if (userData.isAdmin) {
    // Adicionar opção de painel administrativo
    addAdminPanelOption();
  }
}

function getInitials(name) {
  if (!name) return "";

  const nameParts = name.split(" ");
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }

  // Pegar a primeira letra do primeiro e último nome
  const firstInitial = nameParts[0].charAt(0);
  const lastInitial = nameParts[nameParts.length - 1].charAt(0);

  return (firstInitial + lastInitial).toUpperCase();
}

function initializeLogout() {
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      // Remover o token do cookie
      document.cookie =
        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Redirecionar para a página de login
      window.location.replace("/");
    });
  }
}

// Função para mostrar notificações
function showNotification(message, type = "info") {
  // Verificar se já existe uma notificação e removê-la
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // Criar elemento de notificação
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${
        type === "success"
          ? "fa-check-circle"
          : type === "error"
          ? "fa-exclamation-circle"
          : "fa-info-circle"
      }"></i>
      <span>${message}</span>
    </div>
    <button class="notification-close">&times;</button>
  `;

  // Adicionar ao corpo do documento
  document.body.appendChild(notification);

  // Adicionar evento para fechar a notificação
  const closeButton = notification.querySelector(".notification-close");
  closeButton.addEventListener("click", () => {
    notification.classList.add("notification-hiding");
    setTimeout(() => {
      notification.remove();
    }, 300);
  });

  // Remover automaticamente após 5 segundos
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.classList.add("notification-hiding");
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);

  // Animar entrada
  setTimeout(() => {
    notification.classList.add("notification-visible");
  }, 10);
}

async function getUserAvatar() {
  try {
    const userData = await validateTokenExpiration();
    const userEmail = userData.email;

    const response = await fetch(
      `http://localhost:4010/user/get-picture/${userEmail}`
    );
    const userAvatar = await response.json();

    const userAvatarElement = document.getElementById("userAvatar");
    const userPhotoPreviewElement = document.getElementById("userPhotoPreview");

    // Função para atualizar a foto em ambos os lugares
    const updatePhotoDisplay = (content) => {
      if (userAvatarElement) {
        userAvatarElement.innerHTML = content;
      }

      if (userPhotoPreviewElement) {
        userPhotoPreviewElement.innerHTML = content;
      }
    };

    if (userAvatar.image) {
      // Criar elemento de imagem com o base64 retornado
      const photoContent = `<img src="${userAvatar.image}" alt="Avatar" />`;
      updatePhotoDisplay(photoContent);
    } else {
      const initials = getInitials(userData.name);
      updatePhotoDisplay(initials);
    }
  } catch (error) {
    console.error("Erro ao carregar avatar do usuário:", error);
    showNotification("Erro ao carregar foto de perfil", "error");
  }
}

function initializeSidebarToggle() {
  const toggleButton = document.getElementById("toggleSidebar");
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const body = document.body;

  // Forçar a sidebar a ficar aberta no início
  forceOpenSidebar();

  toggleButton.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("expanded");
    body.classList.toggle(
      "sidebar-collapsed",
      sidebar.classList.contains("collapsed")
    );

    // Atualizar ícone do botão
    const isCollapsed = sidebar.classList.contains("collapsed");
    if (isCollapsed) {
      toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
      toggleButton.setAttribute("title", "Mostrar menu lateral");
    } else {
      toggleButton.innerHTML = '<i class="fas fa-times"></i>';
      toggleButton.setAttribute("title", "Ocultar menu lateral");
    }
  });
}
