// Verificação de acesso de administrador
(async function () {
  // Função para mostrar um indicador de carregamento sutil
  function showLoading() {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", showLoading);
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

    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(overlay);

    // Timeout de segurança para garantir que o overlay será removido depois de 10 segundos
    setTimeout(hideLoading, 10000);
  }

  function hideLoading() {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", hideLoading);
      return;
    }

    const overlay = document.getElementById("auth-loading-overlay");
    if (overlay) {
      overlay.remove();
    }
  }

  function redirectToHome(message) {
    hideLoading(); // Garantir que o overlay seja removido antes do redirecionamento
    localStorage.setItem("auth_error", message);
    window.location.replace("/home");
  }

  // Mostrar carregamento
  showLoading();

  try {
    // Verifica se existe um token
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      redirectToHome(
        "Você precisa estar logado para acessar o painel administrativo."
      );
      return;
    }

    // Verificar token e permissões de administrador
    const response = await fetch("http://localhost:4010/session/validate", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    if (!response.ok) {
      redirectToHome("Sessão inválida. Faça login novamente.");
      return;
    }

    const userData = await response.json();
    const expToken = userData.exp;
    const currentTime = Math.floor(Date.now() / 1000);

    // Verificar se o token está expirado
    if (currentTime >= expToken) {
      redirectToHome("Sua sessão expirou. Faça login novamente.");
      return;
    }

    // Verificar se o usuário é administrador
    if (!userData.isAdmin) {
      redirectToHome(
        "Você não tem permissão para acessar o painel administrativo."
      );
      return;
    }

    // Se chegou até aqui, o usuário está autenticado e é admin
    hideLoading();
  } catch (error) {
    console.error("Erro ao validar acesso administrativo:", error);
    hideLoading(); // Garantir que o overlay seja removido mesmo em caso de erro
    redirectToHome("Erro ao verificar suas permissões. Tente novamente.");
  }
})();
