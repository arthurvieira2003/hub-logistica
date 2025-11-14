// Tab Manager Module - Gerenciamento de abas
window.TabManager = window.TabManager || {};

// Estado das abas
window.TabManager.state = {
  tabs: new Map(),
  activeTab: null,
  tabCounter: 0,
};

// Função para criar uma nova aba
window.TabManager.createTab = function (tool, name, icon) {
  const tab = document.createElement("div");
  tab.className = "tab";
  tab.dataset.tool = tool;
  tab.dataset.tabId = `tab-${++window.TabManager.state.tabCounter}`;

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
    window.TabManager.closeTab(tab);
  });

  tab.appendChild(closeButton);

  tab.addEventListener("click", () => {
    window.TabManager.activateTab(tab);
  });

  // Armazenar informações da aba
  window.TabManager.state.tabs.set(tab.dataset.tabId, {
    element: tab,
    tool: tool,
    name: name,
    icon: icon,
  });

  return tab;
};

// Função para ativar uma aba
window.TabManager.activateTab = function (tab) {
  const tool = tab.dataset.tool;
  const content = document.querySelector(`.tool-content[data-tool="${tool}"]`);

  // Obter conteúdo ativo atual
  const currentActiveContent = document.querySelector(".tool-content.active");

  // Se já estamos na mesma aba, não fazer nada
  if (
    tab.classList.contains("active") &&
    content &&
    content.classList.contains("active")
  ) {
    return;
  }

  // IMPORTANTE: Esconder conteúdo ativo atual ANTES de remover active de todas as abas
  if (currentActiveContent && currentActiveContent !== content) {
    currentActiveContent.style.transition = "none";
    currentActiveContent.classList.remove("active");

    // Restaurar transição após um pequeno delay
    setTimeout(() => {
      currentActiveContent.style.transition = "";
    }, 10);
  }

  // Desativar todas as abas DEPOIS de esconder o conteúdo
  const allTabs = document.querySelectorAll(".tab");

  allTabs.forEach((t) => {
    t.classList.remove("active");
  });

  // Ativar a aba selecionada
  tab.classList.add("active");

  // Ativar o conteúdo da nova aba
  if (content) {
    // Garantir que a transição esteja habilitada
    content.style.transition = "";
    content.classList.add("active");
  }

  // Desativar outros conteúdos que possam estar visíveis (sem transição)
  const allContents = document.querySelectorAll(".tool-content");
  allContents.forEach((c) => {
    if (c !== content && c.classList.contains("active")) {
      c.style.transition = "none";
      c.classList.remove("active");
      setTimeout(() => {
        c.style.transition = "";
      }, 10);
    }
  });

  // Esconder tela de boas-vindas quando uma aba é ativada
  const welcomeScreen = document.getElementById("welcomeScreen");
  if (welcomeScreen) {
    welcomeScreen.style.display = "none";
  }

  // Atualizar botões da barra lateral
  document.querySelectorAll(".tool-button").forEach((button) => {
    button.classList.remove("active");
    if (button.dataset.tool === tool) {
      button.classList.add("active");
    }
  });

  window.TabManager.state.activeTab = tab;
};

// Função para fechar uma aba
window.TabManager.closeTab = function (tab) {
  const tool = tab.dataset.tool;
  const content = document.querySelector(`.tool-content[data-tool="${tool}"]`);

  // Se esta é a aba ativa, ativar outra aba
  if (tab.classList.contains("active")) {
    const nextTab = tab.nextElementSibling || tab.previousElementSibling;
    if (nextTab) {
      window.TabManager.activateTab(nextTab);
    } else {
      // Se não houver mais abas, mostrar a tela de boas-vindas
      const welcomeScreen = document.getElementById("welcomeScreen");
      if (welcomeScreen) {
        welcomeScreen.style.display = "flex";
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

  // Remover do estado
  window.TabManager.state.tabs.delete(tab.dataset.tabId);
};

// Função para criar conteúdo de ferramenta
window.TabManager.createToolContent = function (tool) {
  const content = document.createElement("div");
  content.className = "tool-content";
  content.dataset.tool = tool;

  // Adicionar um loader
  const loader = document.createElement("div");
  loader.className = "loader";
  loader.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
  content.appendChild(loader);

  return content;
};

// Função para obter informações de uma aba
window.TabManager.getTabInfo = function (tabId) {
  return window.TabManager.state.tabs.get(tabId);
};

// Função para obter todas as abas
window.TabManager.getAllTabs = function () {
  return Array.from(window.TabManager.state.tabs.values());
};

// Função para obter aba ativa
window.TabManager.getActiveTab = function () {
  return window.TabManager.state.activeTab;
};
