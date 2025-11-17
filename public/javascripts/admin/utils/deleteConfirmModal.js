window.Administration = window.Administration || {};

let deleteConfirmCallback = null;

window.Administration.openDeleteConfirmModal = function (
  title,
  message,
  counts,
  onConfirm
) {
  const modal = document.getElementById("deleteConfirmModal");
  const titleEl = document.getElementById("deleteConfirmTitle");
  const messageEl = document.getElementById("deleteConfirmMessage");
  const detailsEl = document.getElementById("deleteConfirmDetails");

  if (!modal || !titleEl || !messageEl || !detailsEl) {
    console.error("❌ Elementos do modal de confirmação não encontrados");
    if (confirm(message)) {
      onConfirm();
    }
    return;
  }

  deleteConfirmCallback = onConfirm;

  titleEl.textContent = title;
  messageEl.textContent = message;

  const isDeactivation =
    message.toLowerCase().includes("desativar") ||
    (counts.precosFaixas !== undefined &&
      counts.cidades === undefined &&
      counts.rotas === undefined);

  const actionVerb = isDeactivation ? "desativar" : "remover";

  let detailsHTML = `<h4><i class="fas fa-exclamation-triangle"></i> Esta ação irá ${actionVerb} os registros associados:</h4>`;
  detailsHTML += "<ul>";

  let hasRecords = false;

  const cidadesCount =
    counts.cidades !== undefined && counts.cidades !== null
      ? parseInt(counts.cidades)
      : 0;
  const rotasCount =
    counts.rotas !== undefined && counts.rotas !== null
      ? parseInt(counts.rotas)
      : 0;
  const precosCount =
    counts.precosFaixas !== undefined && counts.precosFaixas !== null
      ? parseInt(counts.precosFaixas)
      : 0;

  if (cidadesCount > 0) {
    detailsHTML += `<li><strong>${cidadesCount}</strong> cidade(s)</li>`;
    hasRecords = true;
  }
  if (rotasCount > 0) {
    const verb = isDeactivation ? "desativadas" : "removidas";
    detailsHTML += `<li><strong>${rotasCount}</strong> rota(s) (serão ${verb})</li>`;
    hasRecords = true;
    if (precosCount > 0) {
      const verbPrecos = isDeactivation ? "desativados" : "removidos";
      detailsHTML += `<li><strong>${precosCount}</strong> preço(s) de faixa(s) (serão ${verbPrecos} automaticamente, pois estão associados às rotas)</li>`;
      hasRecords = true;
    } else {
      const verbPrecos = isDeactivation ? "desativados" : "removidos";
      detailsHTML += `<li>Preços de faixas associados às rotas (serão ${verbPrecos} automaticamente)</li>`;
    }
  }

  if (rotasCount === 0 && precosCount > 0) {
    const verb = isDeactivation ? "desativados" : "removidos";
    detailsHTML += `<li><strong>${precosCount}</strong> preço(s) de faixa(s) (serão ${verb})</li>`;
    hasRecords = true;
  }

  if (!hasRecords) {
    detailsHTML +=
      '<li class="no-records">Nenhum registro relacionado será afetado.</li>';
  }

  detailsHTML += "</ul>";

  if (rotasCount > 0) {
    if (precosCount > 0) {
      const verb = isDeactivation ? "desativados" : "removidos";
      detailsHTML += `<p class="delete-confirm-note"><i class="fas fa-info-circle"></i> Os preços de faixas serão ${verb} automaticamente, pois estão associados às rotas que serão ${
        isDeactivation ? "desativadas" : "excluídas"
      }.</p>`;
    } else {
      const verb = isDeactivation ? "desativado" : "excluído";
      detailsHTML += `<p class="delete-confirm-note"><i class="fas fa-info-circle"></i> Qualquer preço de faixa associado às rotas que serão ${
        isDeactivation ? "desativadas" : "removidas"
      } também será ${verb} automaticamente.</p>`;
    }
  }

  detailsEl.innerHTML = detailsHTML;

  modal.classList.add("active");
};

window.Administration.closeDeleteConfirmModal = function () {
  const modal = document.getElementById("deleteConfirmModal");
  if (modal) {
    modal.classList.remove("active");
  }
  deleteConfirmCallback = null;
};

window.Administration.confirmDelete = function () {
  if (deleteConfirmCallback) {
    deleteConfirmCallback();
  }
  window.Administration.closeDeleteConfirmModal();
};

window.Administration.initDeleteConfirmModal = function () {
  const modal = document.getElementById("deleteConfirmModal");
  const closeBtn = document.getElementById("closeDeleteConfirmModal");
  const cancelBtn = document.getElementById("cancelDeleteBtn");
  const confirmBtn = document.getElementById("confirmDeleteBtn");

  const closeModal = () => {
    window.Administration.closeDeleteConfirmModal();
  };

  closeBtn?.addEventListener("click", closeModal);
  cancelBtn?.addEventListener("click", closeModal);

  confirmBtn?.addEventListener("click", () => {
    window.Administration.confirmDelete();
  });

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
};
