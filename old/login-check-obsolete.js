// Verificação de autenticação para a página de login
(async function () {
  // Função para mostrar um indicador de carregamento sutil
  function showLoading() {
    // Se o DOM ainda não estiver pronto, aguardamos
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", showLoading);
      return;
    }

    // Criamos um elemento de overlay para indicar carregamento
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

    // Adicionamos um spinner
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

    // Adicionamos uma regra de animação
    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(overlay);
  }

  function hideLoading() {
    // Se o DOM ainda não estiver pronto, aguardamos
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", hideLoading);
      return;
    }

    const overlay = document.getElementById("auth-loading-overlay");
    if (overlay) {
      overlay.remove();
    }
  }

  // Verifica se existe um token - isso pode ser feito imediatamente
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  // Se existir token, verifica se ele é válido
  if (token) {
    // Tentamos mostrar o indicador de carregamento imediatamente
    showLoading();

    try {
      // Iniciamos a verificação do token imediatamente
      const response = await fetch("http://localhost:4010/session/validate", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        const expToken = userData.exp;
        const currentTime = Math.floor(Date.now() / 1000);

        // Se o token não estiver expirado, redireciona para a página home
        if (currentTime < expToken) {
          window.location.replace("/home");
          return; // Importante para evitar que o código continue executando
        }
      }

      // Se chegou aqui, o token não é válido ou está expirado
      hideLoading();
    } catch (error) {
      console.error("Erro ao validar token:", error);
      hideLoading();
    }
  }
})();
