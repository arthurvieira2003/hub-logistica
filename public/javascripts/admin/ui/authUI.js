// Namespace para interface de autenticação administrativa
window.AdminAuthUI = window.AdminAuthUI || {};

/**
 * Mostra indicador de carregamento durante validação
 */
window.AdminAuthUI.showLoading = function () {
  if (!document.body) {
    document.addEventListener(
      "DOMContentLoaded",
      window.AdminAuthUI.showLoading
    );
    return;
  }

  // Verificar se já existe um overlay
  if (document.getElementById("auth-loading-overlay")) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "auth-loading-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;

  overlay.innerHTML = `
    <div style="
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #2d665f;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    "></div>
  `;

  // Adicionar CSS da animação se não existir
  if (!document.querySelector("#auth-loading-styles")) {
    const style = document.createElement("style");
    style.id = "auth-loading-styles";
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(overlay);

  // Timeout de segurança para garantir que o overlay será removido depois de 10 segundos
  setTimeout(window.AdminAuthUI.hideLoading, 10000);
};

/**
 * Remove o indicador de carregamento
 */
window.AdminAuthUI.hideLoading = function () {
  if (!document.body) {
    document.addEventListener(
      "DOMContentLoaded",
      window.AdminAuthUI.hideLoading
    );
    return;
  }

  const overlay = document.getElementById("auth-loading-overlay");
  if (overlay) {
    overlay.remove();
  }
};

/**
 * Remove overlay de carregamento se existir (usado pelo administration.js)
 */
window.AdminAuthUI.removeExistingOverlay = function () {
  const authLoadingOverlay = document.getElementById("auth-loading-overlay");
  if (authLoadingOverlay) {
    authLoadingOverlay.remove();
  }
};
