window.Administration = window.Administration || {};

let deleteConfirmCallback = null;

function getModalElements() {
  return {
    modal: document.getElementById("deleteConfirmModal"),
    titleEl: document.getElementById("deleteConfirmTitle"),
    messageEl: document.getElementById("deleteConfirmMessage"),
    detailsEl: document.getElementById("deleteConfirmDetails"),
  };
}

function validateModalElements(elements) {
  if (!elements.modal || !elements.titleEl || !elements.messageEl || !elements.detailsEl) {
    console.error("❌ Elementos do modal de confirmação não encontrados");
    return false;
  }
  return true;
}

function determineIsDeactivation(message, counts) {
  return (
    message.toLowerCase().includes("desativar") ||
    (counts.precosFaixas !== undefined &&
      counts.cidades === undefined &&
      counts.rotas === undefined)
  );
}

function extractCounts(counts) {
  return {
    cidades: counts.cidades !== undefined && counts.cidades !== null
      ? parseInt(counts.cidades)
      : 0,
    rotas: counts.rotas !== undefined && counts.rotas !== null
      ? parseInt(counts.rotas)
      : 0,
    precos: counts.precosFaixas !== undefined && counts.precosFaixas !== null
      ? parseInt(counts.precosFaixas)
      : 0,
  };
}

function getVerb(isDeactivation, type) {
  const verbs = {
    action: isDeactivation ? "desativar" : "remover",
    pastPlural: isDeactivation ? "desativados" : "removidos",
    pastFemininePlural: isDeactivation ? "desativadas" : "removidas",
    pastSingular: isDeactivation ? "desativado" : "excluído",
  };
  return verbs[type] || verbs.action;
}

function buildCidadesListItem(cidadesCount) {
  if (cidadesCount <= 0) return "";
  return `<li><strong>${cidadesCount}</strong> cidade(s)</li>`;
}

function buildRotasListItem(rotasCount, isDeactivation) {
  if (rotasCount <= 0) return "";
  const verb = getVerb(isDeactivation, "pastFemininePlural");
  return `<li><strong>${rotasCount}</strong> rota(s) (serão ${verb})</li>`;
}

function buildPrecosListItem(precosCount, isDeactivation, hasRotas) {
  if (precosCount <= 0 && !hasRotas) return "";
  
  const verbPrecos = getVerb(isDeactivation, "pastPlural");
  if (hasRotas) {
    if (precosCount > 0) {
      return `<li><strong>${precosCount}</strong> preço(s) de faixa(s) (serão ${verbPrecos} automaticamente, pois estão associados às rotas)</li>`;
    }
    return `<li>Preços de faixas associados às rotas (serão ${verbPrecos} automaticamente)</li>`;
  }
  return `<li><strong>${precosCount}</strong> preço(s) de faixa(s) (serão ${verbPrecos})</li>`;
}

function buildDetailsList(cidadesCount, rotasCount, precosCount, isDeactivation) {
  let html = "";
  let hasRecords = false;

  const cidadesItem = buildCidadesListItem(cidadesCount);
  if (cidadesItem) {
    html += cidadesItem;
    hasRecords = true;
  }

  const rotasItem = buildRotasListItem(rotasCount, isDeactivation);
  if (rotasItem) {
    html += rotasItem;
    hasRecords = true;
  }

  const precosItem = buildPrecosListItem(precosCount, isDeactivation, rotasCount > 0);
  if (precosItem) {
    html += precosItem;
    hasRecords = true;
  }

  if (!hasRecords) {
    html += '<li class="no-records">Nenhum registro relacionado será afetado.</li>';
  }

  return html;
}

function buildInfoNote(rotasCount, precosCount, isDeactivation) {
  if (rotasCount <= 0) return "";

  const verbPrecos = getVerb(isDeactivation, "pastPlural");
  const verbRotas = getVerb(isDeactivation, "pastFemininePlural");
  const verbSingular = getVerb(isDeactivation, "pastSingular");

  if (precosCount > 0) {
    return `<p class="delete-confirm-note"><i class="fas fa-info-circle"></i> Os preços de faixas serão ${verbPrecos} automaticamente, pois estão associados às rotas que serão ${verbRotas}.</p>`;
  }
  return `<p class="delete-confirm-note"><i class="fas fa-info-circle"></i> Qualquer preço de faixa associado às rotas que serão ${verbRotas} também será ${verbSingular} automaticamente.</p>`;
}

function buildDetailsHTML(counts, isDeactivation) {
  const { cidades, rotas, precos } = extractCounts(counts);
  const actionVerb = getVerb(isDeactivation, "action");

  let html = `<h4><i class="fas fa-exclamation-triangle"></i> Esta ação irá ${actionVerb} os registros associados:</h4>`;
  html += "<ul>";
  html += buildDetailsList(cidades, rotas, precos, isDeactivation);
  html += "</ul>";
  html += buildInfoNote(rotas, precos, isDeactivation);

  return html;
}

window.Administration.openDeleteConfirmModal = function (
  title,
  message,
  counts,
  onConfirm
) {
  const elements = getModalElements();

  if (!validateModalElements(elements)) {
    if (confirm(message)) {
      onConfirm();
    }
    return;
  }

  deleteConfirmCallback = onConfirm;
  elements.titleEl.textContent = title;
  elements.messageEl.textContent = message;

  const isDeactivation = determineIsDeactivation(message, counts);
  elements.detailsEl.innerHTML = buildDetailsHTML(counts, isDeactivation);
  elements.modal.classList.add("active");
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
