// Administration Sessions - Gerenciamento de sessões
window.Administration = window.Administration || {};

window.Administration.loadSessions = async function () {
  try {
    const sessions = await window.Administration.apiRequest("/session/active");
    if (sessions) {
      window.Administration.state.sessions = sessions;
      // Limpar dados filtrados ao recarregar
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

  // Se sessions não foi passado, usar dados do state (pode ser filtrado)
  const dataToRender =
    sessions ||
    window.Administration.state.filteredData.sessions ||
    window.Administration.state.sessions;

  // Aplicar paginação
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
      // Tentar diferentes formatos de data (createdAt, created_at)
      const createdAt = session.createdAt || session.created_at;
      const expiresAt = session.expiresAt || session.expires_at;

      // Formatar datas
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

      // Tentar diferentes formatos de relacionamento com usuário
      const user = session.User || session.user;
      const userName = user?.name || "N/A";
      const userEmail = user?.email || "N/A";

      // Tentar diferentes formatos de dispositivo (userAgent, device_info)
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

  // Adicionar event listeners
  document.querySelectorAll(".terminate-session").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const sessionId = e.currentTarget.getAttribute("data-session-id");
      window.Administration.terminateSession(sessionId);
    });
  });

  // Renderizar controles de paginação
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
  if (!confirm("Tem certeza que deseja encerrar esta sessão?")) return;

  try {
    await window.Administration.apiRequest(`/session/${sessionId}/terminate`, {
      method: "DELETE",
    });
    window.Administration.showSuccess("Sessão encerrada com sucesso");
    window.Administration.loadSessions();
  } catch (error) {
    console.error("❌ Erro ao encerrar sessão:", error);
    window.Administration.showError("Erro ao encerrar sessão");
  }
};
