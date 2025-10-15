/**
 * Componente Modal
 * Gerencia a criação e controle do modal de detalhes
 */

// Namespace para componentes
window.RastreamentoComponents = window.RastreamentoComponents || {};

/**
 * Cria CSS do modal (executada apenas uma vez)
 */
function criarCSSModal() {
  // Verificar se o CSS já foi adicionado
  if (document.getElementById("modalCSS")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "modalCSS";
  style.textContent = `
    /* Estilos para o modal independente */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(5px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }
    
    .modal-overlay.active {
      opacity: 1;
      visibility: visible;
    }
    
    .modal-container {
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 85%;
      width: 85%;
      max-height: 95vh;
      height: auto;
      overflow-y: auto;
      transform: scale(0.9);
      transition: transform 0.3s ease;
    }
    
    .modal-overlay.active .modal-container {
      transform: scale(1);
    }
    
    .modal-header {
      background-color: #247675;
      color: #ffffff;
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 12px 12px 0 0;
    }
    
    .modal-header h3 {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
    }
    
    .modal-close {
      background: transparent;
      border: none;
      color: #ffffff;
      font-size: 24px;
      cursor: pointer;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s ease;
    }
    
    .modal-close:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .modal-body {
      padding: 24px;
    }
    
    /* Bloquear scroll do body quando modal estiver aberto */
    body.modal-open {
      overflow: hidden;
    }
    
    /* Estilos para timeline horizontal */
    .timeline-horizontal {
      scrollbar-width: thin;
      scrollbar-color: #247675 #f1f1f1;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .timeline-track {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap;
    }
    
    .timeline-horizontal::-webkit-scrollbar {
      height: 8px;
    }
    
    .timeline-horizontal::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }
    
    .timeline-horizontal::-webkit-scrollbar-thumb {
      background: #247675;
      border-radius: 4px;
    }
    
    .timeline-horizontal::-webkit-scrollbar-thumb:hover {
      background: #1a5a5a;
    }
    
    .timeline-step:hover .timeline-circle {
      transform: scale(1.1);
      transition: transform 0.3s ease;
    }
    
    .timeline-step:hover .timeline-content {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
    }

    /* Responsivo */
    @media (max-width: 768px) {
      .modal-container {
        width: 90%;
        max-height: 98vh;
        height: auto;
      }
      .modal-header {
        padding: 15px 20px;
      }
      .modal-body {
        padding: 20px;
      }
      
      .timeline-step {
        min-width: 160px !important;
        max-width: 180px !important;
      }
      
      .timeline-circle {
        width: 45px !important;
        height: 45px !important;
      }
      
      .timeline-circle i {
        font-size: 16px !important;
      }
      
      .timeline-content {
        padding: 10px !important;
        height: 100px !important;
      }
      
      .timeline-content h5 {
        font-size: 12px !important;
      }
      
      .timeline-content p {
        font-size: 10px !important;
      }
      
      .timeline-horizontal {
        justify-content: flex-start !important;
      }
      
      .timeline-track {
        justify-content: flex-start !important;
      }
    }
    
    @media (max-width: 480px) {
      .timeline-step {
        min-width: 140px !important;
        max-width: 160px !important;
      }
      
      .timeline-circle {
        width: 40px !important;
        height: 40px !important;
      }
      
      .timeline-circle i {
        font-size: 14px !important;
      }
      
      .timeline-content {
        padding: 8px !important;
        height: 90px !important;
      }
      
      .timeline-content h5 {
        font-size: 11px !important;
      }
      
      .timeline-content p {
        font-size: 9px !important;
      }
    }
  `;

  document.head.appendChild(style);
}

/**
 * Cria modal independente
 */
function criarModalIndependente() {
  // Criar CSS do modal primeiro
  criarCSSModal();

  // Verificar se o modal já existe
  if (document.getElementById("modalOverlay")) {
    return;
  }

  // Criar o overlay do modal
  const modalOverlay = document.createElement("div");
  modalOverlay.id = "modalOverlay";
  modalOverlay.className = "modal-overlay";

  // Criar o container do modal
  const modalContainer = document.createElement("div");
  modalContainer.className = "modal-container";

  // Criar o cabeçalho
  const modalHeader = document.createElement("div");
  modalHeader.className = "modal-header";
  modalHeader.innerHTML = `
    <h3 id="modalNotaNumero">Detalhes da Nota</h3>
    <button id="modalCloseBtn" class="modal-close">&times;</button>
  `;

  // Criar o corpo
  const modalBody = document.createElement("div");
  modalBody.className = "modal-body";
  modalBody.id = "modalBody";

  // Montar a estrutura
  modalContainer.appendChild(modalHeader);
  modalContainer.appendChild(modalBody);
  modalOverlay.appendChild(modalContainer);

  // Adicionar ao body
  document.body.appendChild(modalOverlay);

  // Adicionar eventos
  const closeBtn = document.getElementById("modalCloseBtn");
  closeBtn.addEventListener("click", window.RastreamentoComponents.fecharModal);

  modalOverlay.addEventListener("click", function (e) {
    if (e.target === modalOverlay) {
      window.RastreamentoComponents.fecharModal();
    }
  });

  // Fechar com ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
      window.RastreamentoComponents.fecharModal();
    }
  });
}

/**
 * Abre o modal
 * @param {string} conteudo - Conteúdo HTML do modal
 * @param {string} titulo - Título do modal
 */
window.RastreamentoComponents.abrirModal = function (
  conteudo,
  titulo = "Detalhes da Nota"
) {
  // Garantir que o modal existe
  window.RastreamentoComponents.inicializarModal();

  const modalOverlay = document.getElementById("modalOverlay");
  const modalNotaNumero = document.getElementById("modalNotaNumero");
  const modalBody = document.getElementById("modalBody");

  if (!modalOverlay || !modalNotaNumero || !modalBody) {
    console.error("Modal não foi criado corretamente");
    return;
  }

  // Bloquear scroll do body
  document.body.classList.add("modal-open");

  // Definir conteúdo
  modalNotaNumero.textContent = titulo;
  modalBody.innerHTML = conteudo;

  // Mostrar modal
  modalOverlay.classList.add("active");
};

/**
 * Fecha o modal
 */
window.RastreamentoComponents.fecharModal = function () {
  const modalOverlay = document.getElementById("modalOverlay");
  if (modalOverlay) {
    modalOverlay.classList.remove("active");
    // Remover bloqueio de scroll
    document.body.classList.remove("modal-open");
  }
};

/**
 * Inicializa o modal globalmente
 */
window.RastreamentoComponents.inicializarModal = function () {
  criarCSSModal();
  criarModalIndependente();
};

// Inicializar modal quando o script carregar
document.addEventListener(
  "DOMContentLoaded",
  window.RastreamentoComponents.inicializarModal
);
