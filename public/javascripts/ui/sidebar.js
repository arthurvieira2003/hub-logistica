// Sidebar Module - Gerenciamento da sidebar
window.Sidebar = window.Sidebar || {};

// Estado da sidebar
window.Sidebar.state = {
  isOpen: true,
  isInitialized: false,
};

// Função para inicializar sidebar
window.Sidebar.init = function () {
  window.Sidebar.initToggle();
  window.Sidebar.forceOpen();
};

// Função para inicializar toggle da sidebar
window.Sidebar.initToggle = function () {
  const toggleButton = document.getElementById("toggleSidebar");
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const body = document.body;

  if (!toggleButton || !sidebar || !mainContent) {
    console.error("❌ Elementos da sidebar não encontrados");
    return;
  }

  // Forçar a sidebar a ficar aberta no início
  window.Sidebar.forceOpen();

  toggleButton.addEventListener("click", () => {
    window.Sidebar.toggle();
  });

  window.Sidebar.state.isInitialized = true;
};

// Função para forçar a sidebar a ficar aberta
window.Sidebar.forceOpen = function () {
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

  window.Sidebar.state.isOpen = true;
};

// Função para alternar estado da sidebar
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

  // Atualizar ícone do botão
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

// Função para abrir sidebar
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

// Função para fechar sidebar
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

// Função para verificar se sidebar está aberta
window.Sidebar.isOpen = function () {
  return window.Sidebar.state.isOpen;
};

// Função para verificar se sidebar está inicializada
window.Sidebar.isInitialized = function () {
  return window.Sidebar.state.isInitialized;
};

// Função para garantir que a sidebar esteja aberta (movida do HTML inline)
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

// Função para adicionar múltiplos eventos para garantir que a sidebar permaneça aberta
window.Sidebar.addPersistentEvents = function () {
  window.addEventListener("load", window.Sidebar.forceOpen);
  window.addEventListener("resize", window.Sidebar.forceOpen);

  // Tentar várias vezes com diferentes atrasos
  setTimeout(window.Sidebar.forceOpen, 100);
  setTimeout(window.Sidebar.forceOpen, 500);
  setTimeout(window.Sidebar.forceOpen, 1000);
  setTimeout(window.Sidebar.forceOpen, 2000);
};

// Executar garantia de sidebar aberta quando o DOM estiver pronto
document.addEventListener(
  "DOMContentLoaded",
  window.Sidebar.garantirSidebarAberta
);
// Executar após um pequeno atraso
setTimeout(window.Sidebar.garantirSidebarAberta, 0);
setTimeout(window.Sidebar.garantirSidebarAberta, 100);
