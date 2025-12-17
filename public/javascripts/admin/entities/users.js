window.Administration = window.Administration || {};

window.Administration.loadUsers = async function () {
  try {
    const users = await window.Administration.apiRequest("/user/users");
    if (users) {
      window.Administration.state.users = users;
      window.Administration.state.filteredData.users = null;
      window.Administration.resetPagination("users");
      window.Administration.renderUsers(users);
    }
  } catch (error) {
    console.error("❌ Erro ao carregar usuários:", error);
    window.Administration.showError("Erro ao carregar usuários");
  }
};

window.Administration.renderUsers = function (users) {
  const tbody = document.querySelector("#usersTable tbody");
  if (!tbody) return;

  const dataToRender =
    users ||
    window.Administration.state.filteredData.users ||
    window.Administration.state.users;

  const { items } = window.Administration.getPaginatedData(
    dataToRender,
    "users"
  );

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="loading-data">Nenhum usuário encontrado</td>
      </tr>
    `;
    window.Administration.renderPagination("usersPagination", "users", () => {
      window.Administration.renderUsers(window.Administration.state.users);
    });
    return;
  }

  tbody.innerHTML = items
    .map(
      (user) => `
    <tr>
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
        <span class="status-badge ${user.isAdmin ? "admin" : ""}">
          ${user.isAdmin ? "Sim" : "Não"}
        </span>
      </td>
      <td>
        ${user.status === "active"
          ? `
          <button class="btn-icon edit-user" data-user-id="${
            user.id
          }" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete-user" data-user-id="${
            user.id
          }" title="Excluir">
            <i class="fas fa-trash"></i>
          </button>
        `
          : `
          <button class="btn-icon reactivate-user" data-user-id="${
            user.id
          }" title="Reativar">
            <i class="fas fa-redo"></i>
          </button>
        `}
      </td>
    </tr>
  `
    )
    .join("");

  document.querySelectorAll(".edit-user").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const userId = e.currentTarget.dataset.userId;
      window.Administration.editUser(userId);
    });
  });

  document.querySelectorAll(".delete-user").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const userId = e.currentTarget.dataset.userId;
      window.Administration.deleteUser(userId);
    });
  });

  document.querySelectorAll(".reactivate-user").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const userId = e.currentTarget.dataset.userId;
      window.Administration.reactivateUser(userId);
    });
  });

  window.Administration.renderPagination("usersPagination", "users", () => {
    const dataToRender =
      window.Administration.state.filteredData.users ||
      window.Administration.state.users;
    window.Administration.renderUsers(dataToRender);
  });
};

window.Administration.editUser = function (userId) {
  const user = window.Administration.state.users.find((u) => u.id == userId);
  if (!user) return;

  // Validação: não permite editar usuário inativo
  if (user.status !== "active") {
    window.Administration.showError(
      "Não é possível editar um usuário inativo. Reative-o primeiro."
    );
    return;
  }

  window.Administration.state.editingUserId = userId;
  document.getElementById("userModalTitle").textContent = "Editar Usuário";
  document.getElementById("userId").value = user.id;
  document.getElementById("userName").value = user.name;
  document.getElementById("userEmail").value = user.email;
  document.getElementById("userPassword").value = "";
  document.getElementById("userIsAdmin").checked = user.isAdmin;
  document.getElementById("userIsActive").checked = user.status === "active";
  document.getElementById("passwordHelpText").style.display = "block";
  document.getElementById("emailHelpText").style.display = "none";
  document.getElementById("userPasswordGroup").style.display = "block";
  document.getElementById("userIsActiveGroup").style.display = "block";

  document.getElementById("userModal").classList.add("active");
};

window.Administration.deleteUser = async function (userId) {
  try {
    // Buscar informações do usuário para exibir no modal
    const user = window.Administration.state.users.find((u) => u.id == userId);
    if (!user) {
      window.Administration.showError("Usuário não encontrado");
      return;
    }

    const userName = user.name || user.email;
    const title = "Desativar Usuário";
    const message = `Tem certeza que deseja desativar o usuário "${userName}"?`;
    const counts = {}; // Não há registros relacionados para usuários

    window.Administration.openDeleteConfirmModal(
      title,
      message,
      counts,
      async () => {
        try {
          await window.Administration.apiRequest("/user/change-status", {
            method: "POST",
            body: JSON.stringify({
              id: userId,
              status: "inactive",
            }),
          });

          window.Administration.showSuccess("Usuário desativado com sucesso");
          window.Administration.loadUsers();
        } catch (error) {
          console.error("❌ Erro ao desativar usuário:", error);
          window.Administration.showError(
            error.message || "Erro ao desativar usuário"
          );
        }
      }
    );
  } catch (error) {
    console.error("❌ Erro ao buscar informações do usuário:", error);
    window.Administration.showError("Erro ao buscar informações do usuário");
  }
};

window.Administration.initUserModal = function () {
  const modal = document.getElementById("userModal");
  const closeBtn = document.getElementById("closeUserModal");
  const cancelBtn = document.getElementById("cancelUserBtn");
  const saveBtn = document.getElementById("saveUserBtn");
  const createBtn = document.getElementById("createUserBtn");

  const closeModal = () => {
    modal.classList.remove("active");
    window.Administration.state.editingUserId = null;
    document.getElementById("userForm").reset();
    document.getElementById("emailHelpText").style.display = "none";
    document.getElementById("userPasswordGroup").style.display = "none";
    document.getElementById("userIsActiveGroup").style.display = "none";
  };

  closeBtn?.addEventListener("click", closeModal);
  cancelBtn?.addEventListener("click", closeModal);

  createBtn?.addEventListener("click", () => {
    window.Administration.state.editingUserId = null;
    document.getElementById("userModalTitle").textContent = "Novo Usuário";
    document.getElementById("userId").value = "";
    document.getElementById("userForm").reset();
    document.getElementById("passwordHelpText").style.display = "none";
    document.getElementById("emailHelpText").style.display = "block";
    document.getElementById("userPasswordGroup").style.display = "none";
    document.getElementById("userIsActiveGroup").style.display = "none";
    modal.classList.add("active");
  });

  saveBtn?.addEventListener("click", async () => {
    await window.Administration.saveUser();
  });

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
};

window.Administration.saveUser = async function () {
  const form = document.getElementById("userForm");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const userId = document.getElementById("userId").value;
  const isNewUser = !userId;

  const userData = {
    name: document.getElementById("userName").value,
    email: document.getElementById("userEmail").value,
    isAdmin: document.getElementById("userIsAdmin").checked,
  };

  // Para novos usuários, não enviar senha nem status
  if (!isNewUser) {
    userData.status = document.getElementById("userIsActive").checked
      ? "active"
      : "inactive";
    const password = document.getElementById("userPassword").value;
    if (password) {
      userData.password = password;
    }
  }

  try {
    if (userId) {
      await window.Administration.apiRequest("/user/update-name-and-email", {
        method: "POST",
        body: JSON.stringify({
          id: userId,
          name: userData.name,
          email: userData.email,
        }),
      });

      if (password) {
        await window.Administration.apiRequest("/user/update-password", {
          method: "POST",
          body: JSON.stringify({
            id: userId,
            password: password,
          }),
        });
      }

      await window.Administration.apiRequest("/user/update-admin-status", {
        method: "POST",
        body: JSON.stringify({
          id: userId,
          isAdmin: userData.isAdmin,
        }),
      });

      await window.Administration.apiRequest("/user/change-status", {
        method: "POST",
        body: JSON.stringify({
          id: userId,
          status: userData.status,
        }),
      });
    } else {
      await window.Administration.apiRequest("/user/create", {
        method: "POST",
        body: JSON.stringify(userData),
      });
    }

    window.Administration.showSuccess(
      userId ? "Usuário atualizado com sucesso" : "Usuário criado com sucesso"
    );
    document.getElementById("userModal").classList.remove("active");
    form.reset();
    window.Administration.loadUsers();
  } catch (error) {
    console.error("❌ Erro ao salvar usuário:", error);
    window.Administration.showError("Erro ao salvar usuário");
  }
};

window.Administration.reactivateUser = async function (userId) {
  try {
    // Buscar informações do usuário para exibir no modal
    const user = window.Administration.state.users.find((u) => u.id == userId);
    if (!user) {
      window.Administration.showError("Usuário não encontrado");
      return;
    }

    const userName = user.name || user.email;
    const title = "Reativar Usuário";
    const message = `Tem certeza que deseja reativar o usuário "${userName}"?`;
    const counts = {};

    window.Administration.openDeleteConfirmModal(
      title,
      message,
      counts,
      async () => {
        try {
          await window.Administration.apiRequest("/user/change-status", {
            method: "POST",
            body: JSON.stringify({
              id: userId,
              status: "active",
            }),
          });

          window.Administration.showSuccess("Usuário reativado com sucesso");
          window.Administration.loadUsers();
        } catch (error) {
          console.error("❌ Erro ao reativar usuário:", error);
          window.Administration.showError(
            error.message || "Erro ao reativar usuário"
          );
        }
      }
    );
  } catch (error) {
    console.error("❌ Erro ao buscar informações do usuário:", error);
    window.Administration.showError("Erro ao buscar informações do usuário");
  }
};
