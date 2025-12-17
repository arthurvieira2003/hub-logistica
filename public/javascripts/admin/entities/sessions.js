window.Administration = window.Administration || {};

window.Administration.loadSessions = async function () {
  try {
    const sessions = await window.Administration.apiRequest("/session/active");
    if (sessions) {
      window.Administration.state.sessions = sessions;
      window.Administration.state.filteredData.sessions = null;
      window.Administration.resetPagination("sessions");
      window.Administration.renderSessions(sessions);
    }
  } catch (error) {
    console.error("❌ Erro ao carregar sessões:", error);
    window.Administration.showError("Erro ao carregar sessões");
  }
};

window.Administration.renderSessions = function (sessions) {
  const tbody = document.querySelector("#sessionsTable tbody");
  if (!tbody) return;

  const dataToRender =
    sessions ||
    window.Administration.state.filteredData.sessions ||
    window.Administration.state.sessions;

  const { items, pagination } = window.Administration.getPaginatedData(
    dataToRender,
    "sessions"
  );

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="loading-data">Nenhuma sessão ativa</td>
      </tr>
    `;
    window.Administration.renderPagination(
      "sessionsPagination",
      "sessions",
      () => {
        window.Administration.renderSessions(
          window.Administration.state.sessions
        );
      }
    );
    return;
  }

  tbody.innerHTML = items
    .map((session) => {
      const createdAt = session.createdAt || session.created_at;
      const expiresAt = session.expiresAt || session.expires_at;

      let createdAtFormatted = "N/A";
      let expiresAtFormatted = "N/A";

      if (createdAt) {
        try {
          const date = new Date(createdAt);
          if (!isNaN(date.getTime())) {
            createdAtFormatted = date.toLocaleString("pt-BR");
          }
        } catch (e) {
          console.error("Erro ao formatar data de criação:", e);
        }
      }

      if (expiresAt) {
        try {
          const date = new Date(expiresAt);
          if (!isNaN(date.getTime())) {
            expiresAtFormatted = date.toLocaleString("pt-BR");
          }
        } catch (e) {
          console.error("Erro ao formatar data de expiração:", e);
        }
      }

      const user = session.User || session.user;
      const userName = user?.name || "N/A";
      const userEmail = user?.email || "N/A";

      const device = session.userAgent || session.device_info || "N/A";

      return `
    <tr>
      <td>${session.id}</td>
      <td>${userName}</td>
      <td>${userEmail}</td>
      <td>${createdAtFormatted}</td>
      <td>${expiresAtFormatted}</td>
      <td>${device}</td>
      <td>
        <button class="btn-icon terminate-session" data-session-id="${session.id}" title="Encerrar">
          <i class="fas fa-ban"></i>
        </button>
      </td>
    </tr>
  `;
    })
    .join("");

  document.querySelectorAll(".terminate-session").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const sessionId = e.currentTarget.dataset.sessionId;
      window.Administration.terminateSession(sessionId);
    });
  });

  window.Administration.renderPagination(
    "sessionsPagination",
    "sessions",
    () => {
      const dataToRender =
        window.Administration.state.filteredData.sessions ||
        window.Administration.state.sessions;
      window.Administration.renderSessions(dataToRender);
    }
  );
};

window.Administration.terminateSession = async function (sessionId) {
  try {
    // Buscar informações da sessão para exibir no modal
    const sessions = window.Administration.state.sessions || [];
    const session = sessions.find((s) => s.id == sessionId);

    const user = session?.User || session?.user;
    const userName = user?.name || user?.email || "usuário desconhecido";
    const title = "Encerrar Sessão";
    const message = `Tem certeza que deseja encerrar a sessão do usuário "${userName}"?`;
    const counts = {}; // Não há registros relacionados para sessões

    window.Administration.openDeleteConfirmModal(
      title,
      message,
      counts,
      async () => {
        try {
          await window.Administration.apiRequest(`/session/${sessionId}/terminate`, {
            method: "DELETE",
          });
          window.Administration.showSuccess("Sessão encerrada com sucesso");
          window.Administration.loadSessions();
        } catch (error) {
          console.error("❌ Erro ao encerrar sessão:", error);
          window.Administration.showError(
            error.message || "Erro ao encerrar sessão"
          );
        }
      }
    );
  } catch (error) {
    console.error("❌ Erro ao buscar informações da sessão:", error);
    window.Administration.showError("Erro ao buscar informações da sessão");
  }
};
