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
    localStorage.setItem("auth_error", message);
    window.location.replace("/home");
  }

  // Mostrar carregamento
  showLoading();

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

  try {
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

    // Quando o DOM estiver pronto, atualizar informações do usuário
    document.addEventListener("DOMContentLoaded", () => {
      updateAdminUserInfo(userData);
    });
  } catch (error) {
    console.error("Erro ao validar acesso administrativo:", error);
    redirectToHome("Erro ao verificar suas permissões. Tente novamente.");
  }
})();

// Função para atualizar as informações do usuário na página de administração
function updateAdminUserInfo(userData) {
  const userNameElement = document.getElementById("adminUserName");
  if (userNameElement) {
    userNameElement.textContent = userData.name;
  }

  // Atualizar avatar do usuário
  const userAvatarElement = document.getElementById("adminUserAvatar");
  if (userAvatarElement) {
    if (userData.profile_picture && userData.profile_picture !== null) {
      userAvatarElement.innerHTML = `<img src="${userData.profile_picture}" alt="${userData.name}" />`;
    } else {
      // Gerar avatar com as iniciais do nome do usuário
      userAvatarElement.innerHTML = getInitials(userData.name);
    }
  }
}

// Função para obter as iniciais do nome
function getInitials(name) {
  if (!name) return "";

  const nameParts = name.split(" ");
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }

  // Pegar a primeira letra do primeiro e último nome
  const firstInitial = nameParts[0].charAt(0);
  const lastInitial = nameParts[nameParts.length - 1].charAt(0);

  return (firstInitial + lastInitial).toUpperCase();
}
