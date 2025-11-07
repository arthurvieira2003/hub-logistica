// Delete Confirm Modal - Modal de confirmação de exclusão
window.Administration = window.Administration || {};

let deleteConfirmCallback = null;

/**
 * Abre o modal de confirmação de exclusão
 */
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
    // Fallback para confirm nativo
    if (confirm(message)) {
      onConfirm();
    }
    return;
  }

  // Armazenar callback
  deleteConfirmCallback = onConfirm;

  // Atualizar título e mensagem
  titleEl.textContent = title;
  messageEl.textContent = message;

  // Construir detalhes
  // Verificar se é desativação (quando há preços mas não há cidades/rotas, ou quando a mensagem menciona "desativar")
  const isDeactivation =
    message.toLowerCase().includes("desativar") ||
    (counts.precosFaixas !== undefined &&
      counts.cidades === undefined &&
      counts.rotas === undefined);

  const actionVerb = isDeactivation ? "desativar" : "remover";
  const actionNoun = isDeactivation ? "desativação" : "remoção";

  let detailsHTML = `<h4><i class="fas fa-exclamation-triangle"></i> Esta ação irá ${actionVerb} os registros associados:</h4>`;
  detailsHTML += "<ul>";

  let hasRecords = false;

  // Normalizar valores para garantir que são números
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

  // Estados: cidades -> rotas -> preços
  if (cidadesCount > 0) {
    detailsHTML += `<li><strong>${cidadesCount}</strong> cidade(s)</li>`;
    hasRecords = true;
  }
  if (rotasCount > 0) {
    const verb = isDeactivation ? "desativadas" : "removidas";
    detailsHTML += `<li><strong>${rotasCount}</strong> rota(s) (serão ${verb})</li>`;
    hasRecords = true;
    // Se houver rotas, SEMPRE mostrar os preços (mesmo que seja 0, pois serão afetados)
    if (precosCount > 0) {
      const verbPrecos = isDeactivation ? "desativados" : "removidos";
      detailsHTML += `<li><strong>${precosCount}</strong> preço(s) de faixa(s) (serão ${verbPrecos} automaticamente, pois estão associados às rotas)</li>`;
      hasRecords = true;
    } else {
      // Mesmo sem preços contados, informar que serão afetados se houver nas rotas
      const verbPrecos = isDeactivation ? "desativados" : "removidos";
      detailsHTML += `<li>Preços de faixas associados às rotas (serão ${verbPrecos} automaticamente)</li>`;
    }
  }

  // Se não houver rotas mas houver preços (caso de transportadora ou faixa de peso)
  // IMPORTANTE: Esta verificação deve ser separada do bloco de rotas
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

  // Adicionar nota explicativa se houver rotas
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

  // Mostrar modal
  modal.classList.add("active");
};

/**
 * Fecha o modal de confirmação de exclusão
 */
window.Administration.closeDeleteConfirmModal = function () {
  const modal = document.getElementById("deleteConfirmModal");
  if (modal) {
    modal.classList.remove("active");
  }
  deleteConfirmCallback = null;
};

/**
 * Confirma a exclusão
 */
window.Administration.confirmDelete = function () {
  if (deleteConfirmCallback) {
    deleteConfirmCallback();
  }
  window.Administration.closeDeleteConfirmModal();
};

/**
 * Inicializa os event listeners do modal
 */
window.Administration.initDeleteConfirmModal = function () {
  const modal = document.getElementById("deleteConfirmModal");
  const closeBtn = document.getElementById("closeDeleteConfirmModal");
  const cancelBtn = document.getElementById("cancelDeleteBtn");
  const confirmBtn = document.getElementById("confirmDeleteBtn");

  // Fechar modal
  const closeModal = () => {
    window.Administration.closeDeleteConfirmModal();
  };

  closeBtn?.addEventListener("click", closeModal);
  cancelBtn?.addEventListener("click", closeModal);

  // Confirmar exclusão
  confirmBtn?.addEventListener("click", () => {
    window.Administration.confirmDelete();
  });

  // Fechar ao clicar fora
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
};
