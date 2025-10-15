// Função para adicionar a opção de painel administrativo à barra lateral
function addAdminPanelOption() {
  // Verificar se a opção já existe para evitar duplicação
  if (document.querySelector('.tool-button[data-tool="admin"]')) {
    return;
  }

  // Obter a referência para a lista de ferramentas
  const toolsList = document.querySelector(".sidebar-nav");

  if (!toolsList) return;

  // Criar o elemento do botão do painel administrativo
  const adminButton = document.createElement("div");
  adminButton.className = "tool-button admin-button";
  adminButton.dataset.tool = "admin";
  adminButton.innerHTML = `
    <i class="fas fa-user-shield"></i>
    <span>Painel Administrativo</span>
  `;

  // Adicionar o botão à lista de ferramentas
  toolsList.appendChild(adminButton);

  // Adicionar evento de clique para redirecionar para a página de administração
  adminButton.addEventListener("click", () => {
    window.location.href = "/administration";
  });
}

// Exportar a função para uso em outros arquivos
export { addAdminPanelOption };
