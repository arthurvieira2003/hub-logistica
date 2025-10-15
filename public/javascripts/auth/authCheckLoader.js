// AuthCheckLoader - Carregador de módulos de verificação de autenticação
// Versão: 2025-10-15-20:35 - Correção de conflito de funções

// Função para carregar scripts dinamicamente
async function loadScript(src) {
  return new Promise((resolve, reject) => {
    // Verificar se o script já foi carregado
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve();
    };
    script.onerror = (error) => {
      console.error(`❌ Erro ao carregar script: ${src}`, error);
      console.error(`🔍 Detalhes do erro:`, {
        src: src,
        error: error,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        currentURL: window.location.href,
      });
      reject(new Error(`Failed to load script: ${src}`));
    };
    document.head.appendChild(script);
  });
}

// Função para obter o caminho base dos scripts de autenticação
function getAuthCheckBasePath() {
  // Tentar obter o caminho do script atual
  const currentScript = document.currentScript;

  if (currentScript && currentScript.src) {
    const scriptSrc = currentScript.src;
    const scriptPath = scriptSrc.substring(0, scriptSrc.lastIndexOf("/"));
    return scriptPath;
  }

  // Fallback: usar caminho fixo para auth
  const fallbackPath = window.location.origin + "/javascripts/auth";
  return fallbackPath;
}

// Carregar módulos para verificação básica de autenticação
async function loadAuthCheckModules() {
  try {
    const basePath = getAuthCheckBasePath();

    // Lista dos scripts que serão carregados
    const scriptsToLoad = [
      `${basePath}/core/authCore.js`,
      `${basePath}/utils/authUtils.js`,
      `${basePath}/validators/authValidators.js`,
      `${basePath}/core/authCheckMain.js`,
    ];

    for (const scriptPath of scriptsToLoad) {
      await loadScript(scriptPath);
    }
  } catch (error) {
    console.error("❌ Erro ao carregar módulos de verificação básica:", error);
    console.error(`🔍 Detalhes do erro de carregamento:`, {
      error: error,
      timestamp: new Date().toISOString(),
      currentURL: window.location.href,
      userAgent: navigator.userAgent,
    });
  }
}

// Carregar módulos quando o DOM estiver pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    loadAuthCheckModules();
  });
} else {
  // DOM já está pronto
  loadAuthCheckModules();
}
