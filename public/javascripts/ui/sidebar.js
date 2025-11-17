window.Sidebar = window.Sidebar || {};

window.Sidebar.state = {
  isOpen: true,
  isInitialized: false,
};

window.Sidebar.init = function () {
  window.Sidebar.initToggle();
  window.Sidebar.forceOpen();
};

window.Sidebar.initToggle = function () {
  const toggleButton = document.getElementById("toggleSidebar");
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");

  if (!toggleButton || !sidebar || !mainContent) {
    console.error("❌ Elementos da sidebar não encontrados");
    return;
  }

  window.Sidebar.forceOpen();

  toggleButton.addEventListener("click", () => {
    window.Sidebar.toggle();
  });

  window.Sidebar.state.isInitialized = true;
};

window.Sidebar.forceOpen = function () {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const toggleButton = document.getElementById("toggleSidebar");
  const body = document.body;

  if (!sidebar || !mainContent || !toggleButton) return;

  sidebar.classList.remove("collapsed");
  mainContent.classList.remove("expanded");
  body.classList.remove("sidebar-collapsed");
  toggleButton.innerHTML = '<i class="fas fa-times"></i>';
  toggleButton.setAttribute("title", "Ocultar menu lateral");

  window.Sidebar.state.isOpen = true;
};

window.Sidebar.toggle = function () {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const toggleButton = document.getElementById("toggleSidebar");
  const body = document.body;

  if (!sidebar || !mainContent || !toggleButton) return;

  sidebar.classList.toggle("collapsed");
  mainContent.classList.toggle("expanded");
  body.classList.toggle(
    "sidebar-collapsed",
    sidebar.classList.contains("collapsed")
  );

  const isCollapsed = sidebar.classList.contains("collapsed");
  window.Sidebar.state.isOpen = !isCollapsed;

  if (isCollapsed) {
    toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
    toggleButton.setAttribute("title", "Mostrar menu lateral");
  } else {
    toggleButton.innerHTML = '<i class="fas fa-times"></i>';
    toggleButton.setAttribute("title", "Ocultar menu lateral");
  }
};

window.Sidebar.open = function () {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const toggleButton = document.getElementById("toggleSidebar");
  const body = document.body;

  if (!sidebar || !mainContent || !toggleButton) return;

  sidebar.classList.remove("collapsed");
  mainContent.classList.remove("expanded");
  body.classList.remove("sidebar-collapsed");
  toggleButton.innerHTML = '<i class="fas fa-times"></i>';
  toggleButton.setAttribute("title", "Ocultar menu lateral");

  window.Sidebar.state.isOpen = true;
};

window.Sidebar.close = function () {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const toggleButton = document.getElementById("toggleSidebar");
  const body = document.body;

  if (!sidebar || !mainContent || !toggleButton) return;

  sidebar.classList.add("collapsed");
  mainContent.classList.add("expanded");
  body.classList.add("sidebar-collapsed");
  toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
  toggleButton.setAttribute("title", "Mostrar menu lateral");

  window.Sidebar.state.isOpen = false;
};

window.Sidebar.isOpen = function () {
  return window.Sidebar.state.isOpen;
};

window.Sidebar.isInitialized = function () {
  return window.Sidebar.state.isInitialized;
};

window.Sidebar.garantirSidebarAberta = function () {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const toggleButton = document.getElementById("toggleSidebar");
  const body = document.body;

  if (sidebar) {
    sidebar.classList.remove("collapsed");
  }

  if (mainContent) {
    mainContent.classList.remove("expanded");
  }

  if (body) {
    body.classList.remove("sidebar-collapsed");
  }

  if (toggleButton) {
    toggleButton.innerHTML = '<i class="fas fa-times"></i>';
    toggleButton.setAttribute("title", "Ocultar menu lateral");
  }
};

window.Sidebar.addPersistentEvents = function () {
  window.addEventListener("load", window.Sidebar.forceOpen);
  window.addEventListener("resize", window.Sidebar.forceOpen);

  setTimeout(window.Sidebar.forceOpen, 100);
  setTimeout(window.Sidebar.forceOpen, 500);
  setTimeout(window.Sidebar.forceOpen, 1000);
  setTimeout(window.Sidebar.forceOpen, 2000);
};

document.addEventListener(
  "DOMContentLoaded",
  window.Sidebar.garantirSidebarAberta
);

setTimeout(window.Sidebar.garantirSidebarAberta, 0);
setTimeout(window.Sidebar.garantirSidebarAberta, 100);
