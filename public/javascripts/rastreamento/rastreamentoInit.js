/**
 * Script de inicialização da página de rastreamento
 * Gerencia o carregamento dos módulos e a exibição do botão administrativo
 */

window.RastreamentoInit = window.RastreamentoInit || {};

window.RastreamentoInit.init = async function () {
  try {
    await window.ModuleLoader.loadRastreamentoPage();

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Verificar se o usuário é administrador e mostrar botão
    if (window.AuthCore && window.AuthCore.getToken) {
      const token = window.AuthCore.getToken();
      if (token) {
        try {
          const userData = await window.AuthCore.validateToken(token);
          if (
            userData &&
            (userData.isAdmin === 1 || userData.isAdmin === true)
          ) {
            const adminButton = document.getElementById("adminButton");
            if (adminButton) {
              adminButton.classList.add("show");
            }
          }
        } catch (error) {
          console.error("Erro ao verificar permissões de admin:", error);
        }
      }
    }

    // Inicializar o rastreamento
    if (
      window.RastreamentoMain &&
      window.RastreamentoMain.initRastreamento
    ) {
      const trackingView = document.getElementById("trackingView");
      if (trackingView) {
        await window.RastreamentoMain.initRastreamento(trackingView);

        const overlay = trackingView.querySelector(
          ".rastreamento-loading-overlay"
        );
        if (overlay) {
          overlay.remove();
        }
      }
    }
  } catch (error) {
    console.error("Erro ao carregar rastreamento:", error);
    window.RastreamentoInit.showError();
  }
};

window.RastreamentoInit.showError = function () {
  const trackingView = document.getElementById("trackingView");
  if (trackingView) {
    trackingView.innerHTML = `
      <div class="rastreamento-error-container">
        <i class="fas fa-exclamation-triangle rastreamento-error-icon"></i>
        <p class="rastreamento-error-message">Erro ao carregar dados de rastreamento.</p>
      </div>
    `;
  }
};

// Inicializar quando o DOM estiver pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.RastreamentoInit.init();
  });
} else {
  window.RastreamentoInit.init();
}

