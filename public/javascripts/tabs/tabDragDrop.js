// Tab Drag Drop Module - Sistema de drag and drop para abas
window.TabDragDrop = window.TabDragDrop || {};

// Estado do drag and drop
window.TabDragDrop.state = {
  isDragging: false,
  dragTab: null,
  dragStartX: 0,
  mouseOffsetX: 0,
  hasMovedEnough: false,
};

// Função para inicializar drag and drop
window.TabDragDrop.init = function () {
  const tabList = document.getElementById("tabList");
  if (!tabList) {
    return;
  }

  // Habilitar drag and drop para as abas
  tabList.addEventListener("mousedown", window.TabDragDrop.handleMouseDown);
};

// Função para lidar com mousedown
window.TabDragDrop.handleMouseDown = function (e) {
  if (
    e.target.classList.contains("tab") &&
    !e.target.classList.contains("close-tab")
  ) {
    const tab = e.target;

    // Calcular o offset do mouse em relação à aba
    const rect = tab.getBoundingClientRect();
    window.TabDragDrop.state.mouseOffsetX = e.clientX - rect.left;
    window.TabDragDrop.state.dragStartX = e.clientX;

    // Iniciar o processo de drag após um pequeno movimento
    const onMouseMove = (moveEvent) => {
      if (
        !window.TabDragDrop.state.isDragging &&
        Math.abs(moveEvent.clientX - window.TabDragDrop.state.dragStartX) > 5
      ) {
        window.TabDragDrop.state.isDragging = true;
        window.TabDragDrop.state.dragTab = tab;
        window.TabDragDrop.state.hasMovedEnough = true;

        // Configurar a aba para arrastar
        window.TabDragDrop.state.dragTab.classList.add("dragging");
        window.TabDragDrop.state.dragTab.style.position = "absolute";
        window.TabDragDrop.state.dragTab.style.zIndex = "1000";

        // Atualizar posição inicial
        window.TabDragDrop.updateTabPosition(moveEvent);
      }

      if (window.TabDragDrop.state.isDragging) {
        moveEvent.preventDefault();
        window.TabDragDrop.updateTabPosition(moveEvent);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      if (
        window.TabDragDrop.state.isDragging &&
        window.TabDragDrop.state.dragTab
      ) {
        window.TabDragDrop.state.isDragging = false;
        window.TabDragDrop.state.hasMovedEnough = false;
        window.TabDragDrop.state.dragTab.classList.remove("dragging");
        window.TabDragDrop.state.dragTab.style.position = "";
        window.TabDragDrop.state.dragTab.style.left = "";
        window.TabDragDrop.state.dragTab.style.top = "";
        window.TabDragDrop.state.dragTab.style.zIndex = "";
        window.TabDragDrop.state.dragTab = null;
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }
};

// Função para atualizar posição da aba durante o drag
window.TabDragDrop.updateTabPosition = function (e) {
  if (!window.TabDragDrop.state.dragTab || !window.TabDragDrop.state.isDragging)
    return;

  const tabList = document.getElementById("tabList");
  const tabListRect = tabList.getBoundingClientRect();
  const tabRect = window.TabDragDrop.state.dragTab.getBoundingClientRect();
  const dragTabWidth = tabRect.width;

  // Calcular nova posição mantendo a aba dentro dos limites do tabList
  let newX =
    e.clientX - tabListRect.left - window.TabDragDrop.state.mouseOffsetX;
  newX = Math.max(0, Math.min(newX, tabListRect.width - dragTabWidth));

  window.TabDragDrop.state.dragTab.style.left = `${newX}px`;
  window.TabDragDrop.state.dragTab.style.top = "0";

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
  if (
    closestTab &&
    window.TabDragDrop.state.hasMovedEnough &&
    closestDistance < dragTabWidth / 2
  ) {
    const currentIndex = Array.from(tabList.children).indexOf(
      window.TabDragDrop.state.dragTab
    );
    const targetIndex = Array.from(tabList.children).indexOf(closestTab);

    // Evitar reposicionamento desnecessário
    if (
      currentIndex !== targetIndex &&
      currentIndex !== targetIndex + (shouldInsertBefore ? 0 : 1)
    ) {
      if (shouldInsertBefore) {
        tabList.insertBefore(window.TabDragDrop.state.dragTab, closestTab);
      } else {
        tabList.insertBefore(
          window.TabDragDrop.state.dragTab,
          closestTab.nextSibling
        );
      }
    }
  }
};

// Função para destruir drag and drop
window.TabDragDrop.destroy = function () {
  const tabList = document.getElementById("tabList");
  if (tabList) {
    tabList.removeEventListener(
      "mousedown",
      window.TabDragDrop.handleMouseDown
    );
  }

  // Resetar estado
  window.TabDragDrop.state = {
    isDragging: false,
    dragTab: null,
    dragStartX: 0,
    mouseOffsetX: 0,
    hasMovedEnough: false,
  };
};
