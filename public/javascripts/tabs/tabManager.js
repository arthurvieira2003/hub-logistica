window.TabManager = window.TabManager || {};

window.TabManager.state = {
  tabs: new Map(),
  activeTab: null,
  tabCounter: 0,
};

window.TabManager.createTab = function (tool, name, icon) {
  const tab = document.createElement("div");
  tab.className = "tab";
  tab.dataset.tool = tool;
  tab.dataset.tabId = `tab-${++window.TabManager.state.tabCounter}`;

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

  window.TabManager.state.tabs.set(tab.dataset.tabId, {
    element: tab,
    tool: tool,
    name: name,
    icon: icon,
  });

  return tab;
};

window.TabManager.activateTab = function (tab) {
  const tool = tab.dataset.tool;
  const content = document.querySelector(`.tool-content[data-tool="${tool}"]`);

  const currentActiveContent = document.querySelector(".tool-content.active");

  if (
    tab.classList.contains("active") &&
    content &&
    content.classList.contains("active")
  ) {
    return;
  }

  if (currentActiveContent && currentActiveContent !== content) {
    currentActiveContent.style.transition = "none";
    currentActiveContent.classList.remove("active");

    setTimeout(() => {
      currentActiveContent.style.transition = "";
    }, 10);
  }

  const allTabs = document.querySelectorAll(".tab");

  allTabs.forEach((t) => {
    t.classList.remove("active");
  });

  tab.classList.add("active");

  if (content) {
    content.style.transition = "";
    content.classList.add("active");
  }

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

  const welcomeScreen = document.getElementById("welcomeScreen");
  if (welcomeScreen) {
    welcomeScreen.style.display = "none";
  }

  document.querySelectorAll(".tool-button").forEach((button) => {
    button.classList.remove("active");
    if (button.dataset.tool === tool) {
      button.classList.add("active");
    }
  });

  window.TabManager.state.activeTab = tab;
};

window.TabManager.closeTab = function (tab) {
  const tool = tab.dataset.tool;
  const content = document.querySelector(`.tool-content[data-tool="${tool}"]`);

  if (tab.classList.contains("active")) {
    const nextTab = tab.nextElementSibling || tab.previousElementSibling;
    if (nextTab) {
      window.TabManager.activateTab(nextTab);
    } else {
      const welcomeScreen = document.getElementById("welcomeScreen");
      if (welcomeScreen) {
        welcomeScreen.style.display = "flex";
      }
      document.querySelectorAll(".tool-button").forEach((button) => {
        button.classList.remove("active");
      });
    }
  }

  tab.remove();
  if (content) {
    content.remove();
  }

  window.TabManager.state.tabs.delete(tab.dataset.tabId);
};

window.TabManager.createToolContent = function (tool) {
  const content = document.createElement("div");
  content.className = "tool-content";
  content.dataset.tool = tool;

  const loader = document.createElement("div");
  loader.className = "loader";
  loader.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
  content.appendChild(loader);

  return content;
};

window.TabManager.getTabInfo = function (tabId) {
  return window.TabManager.state.tabs.get(tabId);
};

window.TabManager.getAllTabs = function () {
  return Array.from(window.TabManager.state.tabs.values());
};

window.TabManager.getActiveTab = function () {
  return window.TabManager.state.activeTab;
};
