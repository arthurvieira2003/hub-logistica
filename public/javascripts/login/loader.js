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
  return window.location.origin + "/javascripts/login";
}

// Carregar todos os módulos de login na ordem correta
async function loadLoginModules() {
  try {
    const basePath = getBasePath();

    // 1. UI primeiro (interface e notificações)
    await loadScript(`${basePath}/ui/loginUI.js`);

    // 2. Validação
    await loadScript(`${basePath}/validation/loginValidation.js`);

    // 3. Autenticação
    await loadScript(`${basePath}/auth/loginAuth.js`);

    // 4. Módulo principal por último (executa automaticamente)
    await loadScript(`${basePath}/loginMain.js`);
  } catch (error) {
    console.error("❌ Erro ao carregar módulos de login:", error);
  }
}

// Carregar módulos quando o DOM estiver pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadLoginModules);
} else {
  loadLoginModules();
}
