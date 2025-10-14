document.addEventListener("DOMContentLoaded", () => {
  // Verificar se existe um overlay de carregamento e removê-lo
  const authLoadingOverlay = document.getElementById("auth-loading-overlay");
  if (authLoadingOverlay) {
    authLoadingOverlay.remove();
  }

  initializeAdminPanel();
  checkAuthError();
});

// Verificar se há mensagens de erro de autenticação
function checkAuthError() {
  const authError = localStorage.getItem("auth_error");
  if (authError) {
    showNotification(authError, "error");
    localStorage.removeItem("auth_error");
  }
}

// Função para inicializar o painel administrativo
function initializeAdminPanel() {
  // Gerenciar abas do painel
  const adminTabs = document.querySelectorAll(".admin-tab");
  const adminContentTabs = document.querySelectorAll(".admin-content-tab");

  adminTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remover classe ativa de todas as abas
      adminTabs.forEach((t) => t.classList.remove("active"));
      adminContentTabs.forEach((c) => c.classList.remove("active"));

      // Adicionar classe ativa à aba selecionada
      tab.classList.add("active");

      // Mostrar conteúdo correspondente
      const tabName = tab.dataset.tab;
      const contentTab = document.querySelector(`#${tabName}Tab`);
      if (contentTab) {
        contentTab.classList.add("active");
      }

      // Carregar dados correspondentes à aba
      if (tabName === "users") {
        loadUsersList();
      } else if (tabName === "sessions") {
        loadSessionsList();
      }
    });
  });

  // Carregar lista de usuários por padrão
  loadUsersList();

  // Inicializar botão de criação de usuário
  const createUserBtn = document.querySelector("#createUserBtn");
  if (createUserBtn) {
    createUserBtn.addEventListener("click", () => {
      showUserModal();
    });
  }

  // Inicializar botão de atualização de sessões
  const refreshSessionsBtn = document.querySelector("#refreshSessionsBtn");
  if (refreshSessionsBtn) {
    refreshSessionsBtn.addEventListener("click", () => {
      loadSessionsList();
    });
  }

  // Inicializar campo de busca de usuários
  const userSearchInput = document.querySelector("#userSearchInput");
  if (userSearchInput) {
    userSearchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      filterUsers(searchTerm);
    });
  }

  // Inicializar campo de busca de sessões
  const sessionSearchInput = document.querySelector("#sessionSearchInput");
  if (sessionSearchInput) {
    sessionSearchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      filterSessions(searchTerm);
    });
  }

  // Inicializar botões do modal de usuário
  const closeUserModalBtn = document.getElementById("closeUserModal");
  const cancelUserBtn = document.getElementById("cancelUserBtn");

  if (closeUserModalBtn) {
    closeUserModalBtn.addEventListener("click", () => {
      closeUserModal();
    });
  }

  if (cancelUserBtn) {
    cancelUserBtn.addEventListener("click", () => {
      closeUserModal();
    });
  }
}

// Função para carregar a lista de usuários
async function loadUsersList() {
  try {
    const usersTable = document.querySelector("#usersTable tbody");
    if (!usersTable) return;

    // Mostrar indicador de carregamento
    usersTable.innerHTML = `
      <tr>
        <td colspan="6" class="loading-data">
          <i class="fas fa-spinner fa-spin"></i> Carregando usuários...
        </td>
      </tr>
    `;

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) throw new Error("Token não encontrado");

    const response = await fetch("http://localhost:4010/user/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Falha ao carregar usuários: ${response.status} ${response.statusText}`
      );
    }

    const users = await response.json();

    if (users.length === 0) {
      usersTable.innerHTML = `
        <tr>
          <td colspan="6" class="no-data">Nenhum usuário encontrado</td>
        </tr>
      `;
      return;
    }

    usersTable.innerHTML = users
      .map(
        (user) => `
      <tr data-user-id="${user.id}">
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>
          <span class="status-badge ${
            user.status === "active" ? "active" : "inactive"
          }">
            ${user.status === "active" ? "Ativo" : "Inativo"}
          </span>
        </td>
        <td>
          <span class="admin-badge ${user.isAdmin ? "is-admin" : "not-admin"}">
            ${user.isAdmin ? "Sim" : "Não"}
          </span>
        </td>
        <td class="actions-cell">
          <button class="action-btn edit-user-btn" title="Editar Usuário">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn ${
            user.status === "active"
              ? "deactivate-user-btn"
              : "activate-user-btn"
          }" 
            title="${
              user.status === "active" ? "Desativar Usuário" : "Ativar Usuário"
            }">
            <i class="fas ${
              user.status === "active" ? "fa-user-slash" : "fa-user-check"
            }"></i>
          </button>
          <button class="action-btn reset-password-btn" title="Redefinir Senha">
            <i class="fas fa-key"></i>
          </button>
        </td>
      </tr>
    `
      )
      .join("");

    // Adicionar eventos aos botões de ação
    attachUserActionEvents();
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);

    // Mostrar mensagem de erro na tabela
    const usersTable = document.querySelector("#usersTable tbody");
    if (usersTable) {
      usersTable.innerHTML = `
        <tr>
          <td colspan="6" class="no-data">
            <i class="fas fa-exclamation-circle"></i> Erro ao carregar usuários: ${error.message}
          </td>
        </tr>
      `;
    }

    showNotification(
      "Erro ao carregar lista de usuários: " + error.message,
      "error"
    );
  }
}

// Função para carregar a lista de sessões ativas
async function loadSessionsList() {
  try {
    const sessionsTable = document.querySelector("#sessionsTable tbody");
    if (!sessionsTable) return;

    // Mostrar indicador de carregamento
    sessionsTable.innerHTML = `
      <tr>
        <td colspan="7" class="loading-data">
          <i class="fas fa-spinner fa-spin"></i> Carregando sessões...
        </td>
      </tr>
    `;

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) throw new Error("Token não encontrado");

    // Obter dados do usuário atual para identificar sua sessão
    let currentUserId = null;
    try {
      const userResponse = await fetch(
        "http://localhost:4010/session/validate",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );

      if (userResponse.ok) {
        const userData = await userResponse.json();
        currentUserId = userData.id;
      }
    } catch (error) {
      console.warn("Não foi possível obter dados do usuário atual:", error);
    }

    const response = await fetch("http://localhost:4010/session/active", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Falha ao carregar sessões: ${response.status} ${response.statusText}`
      );
    }

    const sessions = await response.json();

    if (sessions.length === 0) {
      sessionsTable.innerHTML = `
        <tr>
          <td colspan="7" class="no-data">Nenhuma sessão ativa encontrada</td>
        </tr>
      `;
      return;
    }

    // Encontrar a sessão mais recente do usuário atual
    let currentUserSessionId = null;
    if (currentUserId) {
      const userSessions = sessions.filter(
        (session) => session.userId === currentUserId
      );
      if (userSessions.length > 0) {
        // Ordenar por data de criação (mais recente primeiro) e pegar a primeira
        const mostRecentSession = userSessions.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        currentUserSessionId = mostRecentSession.id;
      }
    }

    sessionsTable.innerHTML = sessions
      .map((session) => {
        // Converter as datas de string para objetos Date
        const createdAt = new Date(session.createdAt).toLocaleString();
        const expiresAt = new Date(session.expiresAt).toLocaleString();

        // Extrair informações do navegador/dispositivo
        const userAgentInfo = formatUserAgent(session.userAgent);

        // Verificar se é a sessão mais recente do usuário atual
        const isCurrentUserSession = session.id === currentUserSessionId;
        const rowClass = isCurrentUserSession ? "current-user-session" : "";

        return `
        <tr data-session-id="${session.id}" class="${rowClass}">
          <td>
            ${session.id}
            ${
              isCurrentUserSession
                ? '<span class="current-session-badge">Você</span>'
                : ""
            }
          </td>
          <td>${session.User ? session.User.name : "N/A"}</td>
          <td>${session.User ? session.User.email : "N/A"}</td>
          <td>${createdAt}</td>
          <td>${expiresAt}</td>
          <td class="user-agent-cell" title="${
            session.userAgent || "Desconhecido"
          }">
            <span class="device-info">
              <i class="${getUserAgentIcon(session.userAgent)}"></i>
              ${userAgentInfo}
            </span>
          </td>
          <td class="actions-cell">
            <button class="action-btn terminate-session-btn" title="Encerrar Sessão" data-user-id="${
              session.userId
            }">
              <i class="fas fa-times-circle"></i>
            </button>
          </td>
        </tr>
      `;
      })
      .join("");

    // Adicionar eventos aos botões de ação
    attachSessionActionEvents();
  } catch (error) {
    console.error("Erro ao carregar sessões:", error);

    // Mostrar mensagem de erro na tabela
    const sessionsTable = document.querySelector("#sessionsTable tbody");
    if (sessionsTable) {
      sessionsTable.innerHTML = `
        <tr>
          <td colspan="7" class="no-data">
            <i class="fas fa-exclamation-circle"></i> Erro ao carregar sessões: ${error.message}
          </td>
        </tr>
      `;
    }

    showNotification(
      "Erro ao carregar lista de sessões: " + error.message,
      "error"
    );
  }
}

// Função para formatar informações do userAgent
function formatUserAgent(userAgent) {
  if (!userAgent) return "Desconhecido";

  // Extrair informações básicas do navegador
  let browser = "Navegador";
  let os = "Sistema";

  // Detectar navegador
  if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
    browser = "Chrome";
  } else if (userAgent.includes("Firefox")) {
    browser = "Firefox";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    browser = "Safari";
  } else if (userAgent.includes("Edg")) {
    browser = "Edge";
  } else if (userAgent.includes("MSIE") || userAgent.includes("Trident/")) {
    browser = "IE";
  }

  // Detectar sistema operacional
  if (userAgent.includes("Windows")) {
    os = "Windows";
  } else if (userAgent.includes("Mac")) {
    os = "macOS";
  } else if (userAgent.includes("Linux")) {
    os = "Linux";
  } else if (userAgent.includes("Android")) {
    os = "Android";
  } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    os = "iOS";
  }

  return `${browser} / ${os}`;
}

// Função para determinar o ícone do userAgent
function getUserAgentIcon(userAgent) {
  if (!userAgent) return "fas fa-question-circle";

  // Ícones para diferentes navegadores e dispositivos
  if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
    return "fab fa-chrome";
  } else if (userAgent.includes("Firefox")) {
    return "fab fa-firefox";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    return "fab fa-safari";
  } else if (userAgent.includes("Edg")) {
    return "fab fa-edge";
  } else if (userAgent.includes("MSIE") || userAgent.includes("Trident/")) {
    return "fab fa-internet-explorer";
  } else if (userAgent.includes("Android")) {
    return "fab fa-android";
  } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    return "fab fa-apple";
  } else if (userAgent.includes("Windows")) {
    return "fab fa-windows";
  } else if (userAgent.includes("Mac")) {
    return "fab fa-apple";
  } else if (userAgent.includes("Linux")) {
    return "fab fa-linux";
  }

  return "fas fa-globe"; // Ícone padrão
}

// Função para anexar eventos aos botões de ação de usuários
function attachUserActionEvents() {
  // Botões de edição
  const editButtons = document.querySelectorAll(".edit-user-btn");
  editButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const userId = e.target.closest("tr").dataset.userId;
      editUser(userId);
    });
  });

  // Botões de ativação/desativação
  const statusButtons = document.querySelectorAll(
    ".deactivate-user-btn, .activate-user-btn"
  );
  statusButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const userId = e.target.closest("tr").dataset.userId;
      const isDeactivate = button.classList.contains("deactivate-user-btn");
      toggleUserStatus(userId, isDeactivate);
    });
  });

  // Botões de redefinição de senha
  const resetButtons = document.querySelectorAll(".reset-password-btn");
  resetButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const userId = e.target.closest("tr").dataset.userId;
      resetUserPassword(userId);
    });
  });
}

// Função para anexar eventos aos botões de ação de sessões
function attachSessionActionEvents() {
  // Botões de encerramento de sessão
  const terminateButtons = document.querySelectorAll(".terminate-session-btn");
  terminateButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      if (!row) return;

      const sessionId = row.dataset.sessionId;
      if (sessionId) {
        terminateSession(sessionId);
      }
    });
  });
}

// Função para editar usuário existente
async function editUser(userId) {
  try {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) throw new Error("Token não encontrado");

    const response = await fetch(`http://localhost:4010/user/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error(`Falha ao carregar dados do usuário: ${response.status}`);
    }

    const user = await response.json();

    // Preencher o formulário com os dados do usuário
    const userModal = document.getElementById("userModal");
    const userForm = document.getElementById("userForm");

    if (!userModal || !userForm) {
      throw new Error("Modal de usuário não encontrado no documento");
    }

    // Atualizar título do modal
    document.getElementById("userModalTitle").textContent = "Editar Usuário";

    // Preencher campos do formulário
    document.getElementById("userId").value = user.id;
    document.getElementById("userName").value = user.name;
    document.getElementById("userEmail").value = user.email;
    document.getElementById("userPassword").value = ""; // Limpar campo de senha
    document.getElementById("userIsAdmin").checked = user.isAdmin;
    document.getElementById("userIsActive").checked = user.status === "active";

    // Mostrar o texto de ajuda da senha
    const passwordHelpText = document.getElementById("passwordHelpText");
    if (passwordHelpText) {
      passwordHelpText.style.display = "block";
    }

    // Exibir o modal
    userModal.classList.add("active");

    // Configurar evento do botão de salvar
    const saveUserBtn = document.getElementById("saveUserBtn");
    if (saveUserBtn) {
      // Remover event listeners antigos
      const newSaveBtn = saveUserBtn.cloneNode(true);
      saveUserBtn.parentNode.replaceChild(newSaveBtn, saveUserBtn);

      // Adicionar novo event listener
      newSaveBtn.addEventListener("click", async () => {
        const userData = {
          id: document.getElementById("userId").value,
          name: document.getElementById("userName").value,
          email: document.getElementById("userEmail").value,
          password: document.getElementById("userPassword").value,
          status: document.getElementById("userIsActive").checked
            ? "active"
            : "inactive",
          isAdmin: document.getElementById("userIsAdmin").checked,
        };

        await saveUserData(userData);
        closeUserModal();
        loadUsersList();
      });
    }
  } catch (error) {
    console.error("Erro ao editar usuário:", error);
    showNotification(`Erro ao editar usuário: ${error.message}`, "error");
  }
}

// Função para mostrar modal de novo usuário
function showUserModal() {
  // Obter referência ao modal
  const userModal = document.getElementById("userModal");
  const userForm = document.getElementById("userForm");

  if (!userModal || !userForm) {
    console.error("Modal de usuário não encontrado");
    return;
  }

  // Atualizar título do modal
  document.getElementById("userModalTitle").textContent = "Novo Usuário";

  // Limpar formulário
  userForm.reset();
  document.getElementById("userId").value = "";

  // Ocultar texto de ajuda da senha
  const passwordHelpText = document.getElementById("passwordHelpText");
  if (passwordHelpText) {
    passwordHelpText.style.display = "none";
  }

  // Exibir modal
  userModal.classList.add("active");

  // Configurar evento do botão de salvar
  const saveUserBtn = document.getElementById("saveUserBtn");
  if (saveUserBtn) {
    // Remover event listeners antigos
    const newSaveBtn = saveUserBtn.cloneNode(true);
    saveUserBtn.parentNode.replaceChild(newSaveBtn, saveUserBtn);

    // Adicionar novo event listener
    newSaveBtn.addEventListener("click", async () => {
      const userData = {
        name: document.getElementById("userName").value,
        email: document.getElementById("userEmail").value,
        password: document.getElementById("userPassword").value,
        status: document.getElementById("userIsActive").checked
          ? "active"
          : "inactive",
        isAdmin: document.getElementById("userIsAdmin").checked,
      };

      await createNewUser(userData);
      closeUserModal();
      loadUsersList();
    });
  }
}

// Função para fechar o modal de usuário
function closeUserModal() {
  const userModal = document.getElementById("userModal");
  if (userModal) {
    userModal.classList.remove("active");
  }
}

// Função para salvar os dados do usuário
async function saveUserData(userData) {
  try {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) throw new Error("Token não encontrado");

    const response = await fetch(
      `http://localhost:4010/user/users/${userData.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(userData),
      }
    );

    if (!response.ok) {
      throw new Error("Falha ao atualizar usuário");
    }

    showNotification("Usuário atualizado com sucesso", "success");
  } catch (error) {
    console.error("Erro ao salvar usuário:", error);
    showNotification("Erro ao atualizar usuário", "error");
  }
}

// Função para criar um novo usuário
async function createNewUser(userData) {
  try {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) throw new Error("Token não encontrado");

    const response = await fetch("http://localhost:4010/user/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Falha ao criar usuário");
    }

    showNotification("Usuário criado com sucesso", "success");
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    showNotification("Erro ao criar usuário", "error");
  }
}

// Função para alternar o status do usuário (ativar/desativar)
async function toggleUserStatus(userId, isDeactivate) {
  try {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) throw new Error("Token não encontrado");

    const action = isDeactivate ? "deactivate" : "activate";

    const response = await fetch(
      `http://localhost:4010/user/users/${userId}/${action}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Falha ao ${isDeactivate ? "desativar" : "ativar"} usuário`
      );
    }

    showNotification(
      `Usuário ${isDeactivate ? "desativado" : "ativado"} com sucesso`,
      "success"
    );

    // Recarregar lista de usuários
    loadUsersList();
  } catch (error) {
    console.error(
      `Erro ao ${isDeactivate ? "desativar" : "ativar"} usuário:`,
      error
    );
    showNotification(
      `Erro ao ${isDeactivate ? "desativar" : "ativar"} usuário`,
      "error"
    );
  }
}

// Função para redefinir a senha de um usuário
async function resetUserPassword(userId) {
  try {
    // Pedir confirmação
    if (
      !confirm(
        "Tem certeza que deseja redefinir a senha deste usuário? Uma nova senha aleatória será gerada."
      )
    ) {
      return;
    }

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) throw new Error("Token não encontrado");

    const response = await fetch(
      `http://localhost:4010/user/users/${userId}/reset-password`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Falha ao redefinir senha");
    }

    const result = await response.json();

    // Mostrar a nova senha
    alert(
      `Nova senha: ${result.newPassword}\n\nGuarde esta senha em um local seguro ou informe ao usuário.`
    );
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    showNotification("Erro ao redefinir senha", "error");
  }
}

// Função para encerrar uma sessão
async function terminateSession(sessionId) {
  try {
    // Pedir confirmação
    if (!confirm("Tem certeza que deseja encerrar esta sessão?")) {
      return;
    }

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) throw new Error("Token não encontrado");

    const userId = document
      .querySelector(`[data-session-id="${sessionId}"] .terminate-session-btn`)
      .getAttribute("data-user-id");

    const response = await fetch(
      `http://localhost:4010/session/${sessionId}/terminate`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ userId }),
      }
    );

    if (!response.ok) {
      throw new Error("Falha ao encerrar sessão");
    }

    showNotification("Sessão encerrada com sucesso", "success");

    // Recarregar lista de sessões
    loadSessionsList();
  } catch (error) {
    console.error("Erro ao encerrar sessão:", error);
    showNotification("Erro ao encerrar sessão", "error");
  }
}

// Função para filtrar usuários
function filterUsers(searchTerm) {
  const rows = document.querySelectorAll("#usersTable tbody tr");

  rows.forEach((row) => {
    if (row.querySelector(".no-data") || row.querySelector(".loading-data")) {
      return;
    }

    const name = row.querySelector("td:nth-child(2)").textContent.toLowerCase();
    const email = row
      .querySelector("td:nth-child(3)")
      .textContent.toLowerCase();

    if (name.includes(searchTerm) || email.includes(searchTerm)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

// Função para filtrar sessões
function filterSessions(searchTerm) {
  const rows = document.querySelectorAll("#sessionsTable tbody tr");

  rows.forEach((row) => {
    if (row.querySelector(".no-data") || row.querySelector(".loading-data")) {
      return;
    }

    const userName = row
      .querySelector("td:nth-child(2)")
      .textContent.toLowerCase();
    const userEmail = row
      .querySelector("td:nth-child(3)")
      .textContent.toLowerCase();
    const deviceInfo =
      row.querySelector(".user-agent-cell")?.textContent.toLowerCase() || "";

    if (
      userName.includes(searchTerm) ||
      userEmail.includes(searchTerm) ||
      deviceInfo.includes(searchTerm)
    ) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

// Função para mostrar notificações
function showNotification(message, type = "info") {
  // Verificar se já existe uma notificação e removê-la
  const existingNotification = document.querySelector(".admin-notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // Criar elemento de notificação
  const notification = document.createElement("div");
  notification.className = `admin-notification admin-notification-${type}`;
  notification.innerHTML = `
    <div class="admin-notification-content">
      <i class="fas ${
        type === "success"
          ? "fa-check-circle"
          : type === "error"
          ? "fa-exclamation-circle"
          : "fa-info-circle"
      }"></i>
      <span>${message}</span>
    </div>
    <button class="admin-notification-close">&times;</button>
  `;

  // Adicionar ao corpo do documento
  document.body.appendChild(notification);

  // Adicionar evento para fechar a notificação
  const closeButton = notification.querySelector(".admin-notification-close");
  closeButton.addEventListener("click", () => {
    notification.classList.add("admin-notification-hiding");
    setTimeout(() => {
      notification.remove();
    }, 300);
  });

  // Remover automaticamente após 5 segundos
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.classList.add("admin-notification-hiding");
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);

  // Animar entrada
  setTimeout(() => {
    notification.classList.add("admin-notification-visible");
  }, 10);
}
