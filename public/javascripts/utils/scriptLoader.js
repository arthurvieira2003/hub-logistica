window.ScriptLoader = window.ScriptLoader || {};

window.ScriptLoader.loadScript = function (src) {
  return new Promise((resolve, reject) => {
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
      reject(error);
    };
    document.head.appendChild(script);
  });
};

window.ScriptLoader.loadCSS = function (href) {
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

window.ScriptLoader.loadCSSFiles = function (cssFiles) {
  cssFiles.forEach((cssFile) => {
    window.ScriptLoader.loadCSS(cssFile);
  });
};

window.ScriptLoader.isScriptLoaded = function (src) {
  return document.querySelector(`script[src="${src}"]`) !== null;
};

window.ScriptLoader.isCSSLoaded = function (href) {
  return document.querySelector(`link[href="${href}"]`) !== null;
};
