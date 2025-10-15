/**
 * Carregador de Módulos de Rastreamento
 * Carrega todos os módulos na ordem correta para evitar dependências
 */

// Função para carregar scripts sequencialmente
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Detectar o caminho base automaticamente
function getBasePath() {
  const currentScript = document.currentScript;
  if (currentScript) {
    const scriptSrc = currentScript.src;
    const basePath = scriptSrc.substring(0, scriptSrc.lastIndexOf("/"));
    return basePath;
  }
  // Fallback para caminho relativo
  return "../javascripts/rastreamento";
}

// Carregar todos os módulos na ordem correta
async function loadRastreamentoModules() {
  try {
    const basePath = getBasePath();

    // 1. Configurações primeiro

    await loadScript(`${basePath}/config/transportadoras.js`);

    // 2. Utilitários

    await loadScript(`${basePath}/utils/formatters.js`);

    // 3. API

    await loadScript(`${basePath}/api/dataLoader.js`);

    // 4. Componentes

    await loadScript(`${basePath}/components/modal.js`);

    // 5. Renderizadores

    await loadScript(`${basePath}/renderers/tabela.js`);

    await loadScript(`${basePath}/renderers/modalDetalhes.js`);

    // 6. Eventos

    await loadScript(`${basePath}/events/eventManager.js`);

    // 7. Módulo principal por último

    await loadScript(`${basePath}/rastreamento.js`);
  } catch (error) {
    console.error("❌ Erro ao carregar módulos de rastreamento:", error);
  }
}

// Carregar módulos quando o DOM estiver pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadRastreamentoModules);
} else {
  loadRastreamentoModules();
}
