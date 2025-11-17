window.Administration = window.Administration || {};

const ITEMS_PER_PAGE = 10;

window.Administration.initPagination = function (
  entityType,
  itemsPerPage = ITEMS_PER_PAGE
) {
  if (!window.Administration.state.pagination) {
    window.Administration.state.pagination = {};
  }

  if (!window.Administration.state.pagination[entityType]) {
    window.Administration.state.pagination[entityType] = {
      currentPage: 1,
      itemsPerPage: itemsPerPage,
      totalItems: 0,
      totalPages: 0,
    };
  }
};

window.Administration.getPaginatedData = function (data, entityType) {
  if (!data || data.length === 0) {
    return { items: [], pagination: null };
  }

  window.Administration.initPagination(entityType);

  const pagination = window.Administration.state.pagination[entityType];
  pagination.totalItems = data.length;
  pagination.totalPages = Math.ceil(data.length / pagination.itemsPerPage);

  if (
    pagination.currentPage > pagination.totalPages &&
    pagination.totalPages > 0
  ) {
    pagination.currentPage = pagination.totalPages;
  }

  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
  const endIndex = startIndex + pagination.itemsPerPage;
  const items = data.slice(startIndex, endIndex);

  return { items, pagination };
};

window.Administration.renderPagination = function (
  containerId,
  entityType,
  onPageChange
) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const pagination = window.Administration.state.pagination?.[entityType];
  if (!pagination || pagination.totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  const { currentPage, totalPages, totalItems, itemsPerPage } = pagination;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  let paginationHTML = `
    <div class="admin-pagination">
      <div class="pagination-info">
        Mostrando ${startItem} - ${endItem} de ${totalItems} registros
      </div>
      <div class="pagination-controls">
        <button 
          class="pagination-btn" 
          data-action="first"
          ${currentPage === 1 ? "disabled" : ""}
          title="Primeira página">
          <i class="fas fa-angle-double-left"></i>
        </button>
        <button 
          class="pagination-btn" 
          data-action="prev"
          ${currentPage === 1 ? "disabled" : ""}
          title="Página anterior">
          <i class="fas fa-angle-left"></i>
        </button>
        <div class="pagination-pages">
  `;

  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    paginationHTML += `
      <button class="pagination-page" data-page="1">1</button>
      ${startPage > 2 ? '<span class="pagination-ellipsis">...</span>' : ""}
    `;
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button 
        class="pagination-page ${i === currentPage ? "active" : ""}" 
        data-page="${i}">
        ${i}
      </button>
    `;
  }

  if (endPage < totalPages) {
    paginationHTML += `
      ${
        endPage < totalPages - 1
          ? '<span class="pagination-ellipsis">...</span>'
          : ""
      }
      <button class="pagination-page" data-page="${totalPages}">${totalPages}</button>
    `;
  }

  paginationHTML += `
        </div>
        <button 
          class="pagination-btn" 
          data-action="next"
          ${currentPage === totalPages ? "disabled" : ""}
          title="Próxima página">
          <i class="fas fa-angle-right"></i>
        </button>
        <button 
          class="pagination-btn" 
          data-action="last"
          ${currentPage === totalPages ? "disabled" : ""}
          title="Última página">
          <i class="fas fa-angle-double-right"></i>
        </button>
      </div>
    </div>
  `;

  container.innerHTML = paginationHTML;

  container
    .querySelectorAll(".pagination-btn, .pagination-page")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const action = btn.getAttribute("data-action");
        const page = btn.getAttribute("data-page");

        if (btn.disabled) return;

        if (action === "first") {
          window.Administration.goToPage(entityType, 1, onPageChange);
        } else if (action === "prev") {
          window.Administration.goToPage(
            entityType,
            currentPage - 1,
            onPageChange
          );
        } else if (action === "next") {
          window.Administration.goToPage(
            entityType,
            currentPage + 1,
            onPageChange
          );
        } else if (action === "last") {
          window.Administration.goToPage(entityType, totalPages, onPageChange);
        } else if (page) {
          window.Administration.goToPage(
            entityType,
            parseInt(page),
            onPageChange
          );
        }
      });
    });
};

window.Administration.goToPage = function (entityType, page, onPageChange) {
  const pagination = window.Administration.state.pagination?.[entityType];
  if (!pagination) return;

  pagination.currentPage = page;

  if (onPageChange && typeof onPageChange === "function") {
    onPageChange();
  }
};

window.Administration.resetPagination = function (entityType) {
  if (window.Administration.state.pagination?.[entityType]) {
    window.Administration.state.pagination[entityType].currentPage = 1;
  }
};
