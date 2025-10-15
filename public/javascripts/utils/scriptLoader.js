// Script Loader Module - Carregador de scripts e CSS
window.ScriptLoader = window.ScriptLoader || {};

// Função para carregar script dinamicamente
window.ScriptLoader.loadScript = function (src) {
  return new Promise((resolve, reject) => {
    // Verificar se o script já foi carregado
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = (error) => {
      console.error(`❌ Erro ao carregar script: ${src}`, error);
      reject(error);
    };
    document.head.appendChild(script);
  });
};

// Função para carregar CSS dinamicamente
window.ScriptLoader.loadCSS = function (href) {
  // Verificar se o CSS já foi carregado
  const existingCSS = document.querySelector(`link[href="${href}"]`);
  if (existingCSS) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.onerror = (error) => {
    console.error(`❌ Erro ao carregar CSS: ${href}`, error);
  };
  document.head.appendChild(link);
};

// Função para carregar múltiplos scripts em sequência
window.ScriptLoader.loadScripts = async function (scripts) {
  for (const script of scripts) {
    try {
      await window.ScriptLoader.loadScript(script);
    } catch (error) {
      console.error(`❌ Erro ao carregar script: ${script}`, error);
      throw error;
    }
  }
};

// Função para carregar múltiplos CSS
window.ScriptLoader.loadCSSFiles = function (cssFiles) {
  cssFiles.forEach((cssFile) => {
    window.ScriptLoader.loadCSS(cssFile);
  });
};

// Função para verificar se um script está carregado
window.ScriptLoader.isScriptLoaded = function (src) {
  return document.querySelector(`script[src="${src}"]`) !== null;
};

// Função para verificar se um CSS está carregado
window.ScriptLoader.isCSSLoaded = function (href) {
  return document.querySelector(`link[href="${href}"]`) !== null;
};
