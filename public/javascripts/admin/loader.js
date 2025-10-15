// Função para carregar scripts dinamicamente
async function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      console.error("❌ Erro ao carregar script:", src);
      reject(new Error(`Failed to load script: ${src}`));
    };
    document.head.appendChild(script);
  });
}

// Função para obter o caminho base dos scripts
function getBasePath() {
  const currentScript = document.currentScript;
  if (currentScript) {
    const scriptSrc = currentScript.src;
    const basePath = scriptSrc.substring(0, scriptSrc.lastIndexOf("/"));
    return basePath;
  }
  // Fallback para caminho relativo
  return window.location.origin + "/javascripts/admin";
}

// Carregar todos os módulos de autenticação administrativa na ordem correta
async function loadAdminAuthModules() {
  try {
    const basePath = getBasePath();

    // 1. UI primeiro (para mostrar loading)
    await loadScript(`${basePath}/ui/authUI.js`);

    // 2. Validador de autenticação
    await loadScript(`${basePath}/auth/authValidator.js`);

    // 3. Módulo principal por último (executa automaticamente)
    await loadScript(`${basePath}/auth/authMain.js`);
  } catch (error) {
    console.error(
      "❌ Erro ao carregar módulos de autenticação administrativa:",
      error
    );
  }
}

// Carregar módulos quando o DOM estiver pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadAdminAuthModules);
} else {
  loadAdminAuthModules();
}
