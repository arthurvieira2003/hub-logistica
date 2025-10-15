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
  return window.location.origin + "/javascripts/auth";
}

// Carregar módulos para verificação avançada de autenticação
async function loadLoginCheckModules() {
  try {
    const basePath = getBasePath();

    // 1. Core primeiro
    await loadScript(`${basePath}/core/authCore.js`);

    // 2. UI (para mostrar loading)
    await loadScript(`${basePath}/ui/authUI.js`);

    // 3. Validadores
    await loadScript(`${basePath}/validators/authValidators.js`);

    // 4. Módulo principal por último (executa automaticamente)
    await loadScript(`${basePath}/core/loginCheckMain.js`);
  } catch (error) {
    console.error(
      "❌ Erro ao carregar módulos de verificação avançada:",
      error
    );
  }
}

// Carregar módulos quando o DOM estiver pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadLoginCheckModules);
} else {
  loadLoginCheckModules();
}
