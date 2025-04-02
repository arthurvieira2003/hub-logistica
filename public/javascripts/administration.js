document.addEventListener("DOMContentLoaded", () => {
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
}

// Função para carregar a lista de usuários
async function loadUsersList() {
  try {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) throw new Error("Token não encontrado");

    const response = await fetch("http://localhost:4010/admin/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error("Falha ao carregar usuários");
    }

    const users = await response.json();

    // Atualizar tabela de usuários
    const usersTable = document.querySelector("#usersTable tbody");
    if (!usersTable) return;

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
    showNotification("Erro ao carregar lista de usuários", "error");
  }
}

// Função para carregar a lista de sessões ativas
async function loadSessionsList() {
  try {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) throw new Error("Token não encontrado");

    const response = await fetch("http://localhost:4010/admin/sessions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error("Falha ao carregar sessões");
    }

    const sessions = await response.json();

    // Atualizar tabela de sessões
    const sessionsTable = document.querySelector("#sessionsTable tbody");
    if (!sessionsTable) return;

    if (sessions.length === 0) {
      sessionsTable.innerHTML = `
        <tr>
          <td colspan="6" class="no-data">Nenhuma sessão ativa encontrada</td>
        </tr>
      `;
      return;
    }

    sessionsTable.innerHTML = sessions
      .map((session) => {
        const createdAt = new Date(session.created_at * 1000).toLocaleString();
        const expiresAt = new Date(session.exp * 1000).toLocaleString();

        return `
        <tr data-session-id="${session.id}">
          <td>${session.id}</td>
          <td>${session.user_name}</td>
          <td>${session.user_email}</td>
          <td>${createdAt}</td>
          <td>${expiresAt}</td>
          <td class="actions-cell">
            <button class="action-btn terminate-session-btn" title="Encerrar Sessão">
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
    showNotification("Erro ao carregar lista de sessões", "error");
  }
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
      const sessionId = e.target.closest("tr").dataset.sessionId;
      terminateSession(sessionId);
    });
  });
}

// Função para editar um usuário
async function editUser(userId) {
  try {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) throw new Error("Token não encontrado");

    // Buscar dados do usuário
    const response = await fetch(
      `http://localhost:4010/admin/users/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Falha ao carregar dados do usuário");
    }

    const user = await response.json();

    // Criar modal de edição
    const modalHTML = `
      <div class="admin-modal" id="userModal">
        <div class="admin-modal-content">
          <div class="admin-modal-header">
            <h3>Editar Usuário</h3>
            <button class="admin-modal-close">&times;</button>
          </div>
          <div class="admin-modal-body">
            <form id="userForm">
              <input type="hidden" id="userId" value="${user.id}">
              
              <div class="form-group">
                <label for="userName">Nome</label>
                <input type="text" class="form-control" id="userName" value="${
                  user.name
                }" required>
              </div>
              
              <div class="form-group">
                <label for="userEmail">Email</label>
                <input type="email" class="form-control" id="userEmail" value="${
                  user.email
                }" required>
              </div>
              
              <div class="form-group">
                <label for="userStatus">Status</label>
                <select class="form-control" id="userStatus">
                  <option value="active" ${
                    user.status === "active" ? "selected" : ""
                  }>Ativo</option>
                  <option value="inactive" ${
                    user.status === "inactive" ? "selected" : ""
                  }>Inativo</option>
                </select>
              </div>
              
              <div class="form-group">
                <div class="checkbox-group">
                  <input type="checkbox" id="userIsAdmin" ${
                    user.isAdmin ? "checked" : ""
                  }>
                  <label for="userIsAdmin">Administrador</label>
                </div>
              </div>
            </form>
          </div>
          <div class="admin-modal-footer">
            <button class="btn btn-secondary cancel-user-btn">Cancelar</button>
            <button class="btn btn-primary save-user-btn">Salvar</button>
          </div>
        </div>
      </div>
    `;

    // Adicionar modal ao documento
    const modalContainer = document.createElement("div");
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstChild);

    const modal = document.getElementById("userModal");

    // Exibir o modal
    setTimeout(() => {
      modal.classList.add("active");
    }, 10);

    // Configurar eventos do modal
    const closeBtn = modal.querySelector(".admin-modal-close");
    const cancelBtn = modal.querySelector(".cancel-user-btn");
    const saveBtn = modal.querySelector(".save-user-btn");

    closeBtn.addEventListener("click", () => closeUserModal());
    cancelBtn.addEventListener("click", () => closeUserModal());

    saveBtn.addEventListener("click", async () => {
      const userData = {
        id: document.getElementById("userId").value,
        name: document.getElementById("userName").value,
        email: document.getElementById("userEmail").value,
        status: document.getElementById("userStatus").value,
        isAdmin: document.getElementById("userIsAdmin").checked,
      };

      await saveUserData(userData);
      closeUserModal();
      loadUsersList();
    });
  } catch (error) {
    console.error("Erro ao editar usuário:", error);
    showNotification("Erro ao carregar dados do usuário", "error");
  }
}

// Função para criar um novo usuário
function showUserModal() {
  // Criar modal de criação de usuário
  const modalHTML = `
    <div class="admin-modal" id="userModal">
      <div class="admin-modal-content">
        <div class="admin-modal-header">
          <h3>Novo Usuário</h3>
          <button class="admin-modal-close">&times;</button>
        </div>
        <div class="admin-modal-body">
          <form id="userForm">
            <div class="form-group">
              <label for="userName">Nome</label>
              <input type="text" class="form-control" id="userName" required>
            </div>
            
            <div class="form-group">
              <label for="userEmail">Email</label>
              <input type="email" class="form-control" id="userEmail" required>
            </div>
            
            <div class="form-group">
              <label for="userPassword">Senha</label>
              <input type="password" class="form-control" id="userPassword" required>
            </div>
            
            <div class="form-group">
              <label for="userStatus">Status</label>
              <select class="form-control" id="userStatus">
                <option value="active" selected>Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
            
            <div class="form-group">
              <div class="checkbox-group">
                <input type="checkbox" id="userIsAdmin">
                <label for="userIsAdmin">Administrador</label>
              </div>
            </div>
          </form>
        </div>
        <div class="admin-modal-footer">
          <button class="btn btn-secondary cancel-user-btn">Cancelar</button>
          <button class="btn btn-primary create-user-btn">Criar</button>
        </div>
      </div>
    </div>
  `;

  // Adicionar modal ao documento
  const modalContainer = document.createElement("div");
  modalContainer.innerHTML = modalHTML;
  document.body.appendChild(modalContainer.firstChild);

  const modal = document.getElementById("userModal");

  // Exibir o modal
  setTimeout(() => {
    modal.classList.add("active");
  }, 10);

  // Configurar eventos do modal
  const closeBtn = modal.querySelector(".admin-modal-close");
  const cancelBtn = modal.querySelector(".cancel-user-btn");
  const createBtn = modal.querySelector(".create-user-btn");

  closeBtn.addEventListener("click", () => closeUserModal());
  cancelBtn.addEventListener("click", () => closeUserModal());

  createBtn.addEventListener("click", async () => {
    const userData = {
      name: document.getElementById("userName").value,
      email: document.getElementById("userEmail").value,
      password: document.getElementById("userPassword").value,
      status: document.getElementById("userStatus").value,
      isAdmin: document.getElementById("userIsAdmin").checked,
    };

    await createNewUser(userData);
    closeUserModal();
    loadUsersList();
  });
}

// Função para fechar o modal de usuário
function closeUserModal() {
  const modal = document.getElementById("userModal");
  if (!modal) return;

  modal.classList.remove("active");

  // Remover o modal após a animação
  setTimeout(() => {
    modal.remove();
  }, 300);
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
      `http://localhost:4010/admin/users/${userData.id}`,
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

    const response = await fetch("http://localhost:4010/admin/users", {
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
      `http://localhost:4010/admin/users/${userId}/${action}`,
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
      `http://localhost:4010/admin/users/${userId}/reset-password`,
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

    const response = await fetch(
      `http://localhost:4010/admin/sessions/${sessionId}/terminate`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
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

// Função para mostrar notificações
function showNotification(message, type = "info") {
  // Verificar se já existe uma notificação e removê-la
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // Criar elemento de notificação
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${
        type === "success"
          ? "fa-check-circle"
          : type === "error"
          ? "fa-exclamation-circle"
          : "fa-info-circle"
      }"></i>
      <span>${message}</span>
    </div>
    <button class="notification-close">&times;</button>
  `;

  // Adicionar ao corpo do documento
  document.body.appendChild(notification);

  // Adicionar evento para fechar a notificação
  const closeButton = notification.querySelector(".notification-close");
  closeButton.addEventListener("click", () => {
    notification.classList.add("notification-hiding");
    setTimeout(() => {
      notification.remove();
    }, 300);
  });

  // Remover automaticamente após 5 segundos
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.classList.add("notification-hiding");
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);

  // Animar entrada
  setTimeout(() => {
    notification.classList.add("notification-visible");
  }, 10);
}
