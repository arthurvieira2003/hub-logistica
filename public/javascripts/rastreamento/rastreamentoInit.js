/**
 * Script de inicialização da página de rastreamento
 * Gerencia o carregamento dos módulos e a exibição do botão administrativo
 */

window.RastreamentoInit = window.RastreamentoInit || {};

window.RastreamentoInit.init = async function () {
  try {
    await window.ModuleLoader.loadRastreamentoPage();

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Inicializar Keycloak se disponível
    if (window.KeycloakAuth && window.KeycloakAuth.init) {
      try {
        // Verificar se há parâmetros de callback do Keycloak na URL
        const urlParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const hasKeycloakCallback =
          urlParams.has("code") || urlParams.has("state");

        // Inicializar Keycloak (isso processará o callback se houver)
        await window.KeycloakAuth.init();

        // Aguardar um pouco para o Keycloak processar o callback
        if (hasKeycloakCallback) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // Verificar autenticação após processar callback
        const isAuthenticated = window.KeycloakAuth.isAuthenticated();
        const token = window.AuthCore?.getToken();

        // Se não estiver autenticado e não houver token, redirecionar para login
        if (
          !isAuthenticated &&
          (!token || token === "undefined" || token === "null")
        ) {
          // Limpar parâmetros da URL antes de redirecionar
          if (hasKeycloakCallback) {
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          }
          window.location.href = "/";
          return;
        }
      } catch (error) {
        console.error("Erro ao inicializar Keycloak:", error);
        // Continua mesmo se Keycloak falhar (fallback para autenticação tradicional)
      }
    }

    // Configurar botão de logout
    const logoutButton = document.getElementById("logoutButtonRastreamento");
    if (logoutButton) {
      logoutButton.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (window.AuthCore && window.AuthCore.logout) {
          await window.AuthCore.logout();
        } else {
          // Fallback caso o módulo de autenticação não esteja disponível
          window.location.href = "/";
        }
      });
    }

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
    if (window.RastreamentoMain && window.RastreamentoMain.initRastreamento) {
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
