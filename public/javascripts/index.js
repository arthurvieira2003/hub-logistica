document.addEventListener("DOMContentLoaded", async () => {
  // Forçar a sidebar a ficar aberta imediatamente
  forceOpenSidebar();

  await loadUserData();
  await getUserAvatar();

  initializeToolButtons();
  initializeTabSystem();
  initializeUserDropdown();
  initializePhotoModal();
  initializeCropperModal();
  initializeSidebarToggle();

  // Forçar novamente após a inicialização
  forceOpenSidebar();
});

// Função para forçar a sidebar a ficar aberta
function forceOpenSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const toggleButton = document.getElementById("toggleSidebar");
  const body = document.body;

  if (!sidebar || !mainContent || !toggleButton) return;

  // Forçar a sidebar a ficar aberta
  sidebar.classList.remove("collapsed");
  mainContent.classList.remove("expanded");
  body.classList.remove("sidebar-collapsed");
  toggleButton.innerHTML = '<i class="fas fa-times"></i>';
  toggleButton.setAttribute("title", "Ocultar menu lateral");
}

// Adicionar múltiplos eventos para garantir que a sidebar permaneça aberta
window.addEventListener("load", forceOpenSidebar);
window.addEventListener("resize", forceOpenSidebar);
// Tentar várias vezes com diferentes atrasos
setTimeout(forceOpenSidebar, 100);
setTimeout(forceOpenSidebar, 500);
setTimeout(forceOpenSidebar, 1000);
setTimeout(forceOpenSidebar, 2000);

async function loadUserData() {
  try {
    const userData = await validateTokenExpiration();
    if (userData) {
      updateUserProfile(userData);
    }
  } catch (error) {
    console.error("Erro ao carregar dados do usuário:", error);
    window.location.replace("/");
  }
}

function initializeToolButtons() {
  const toolButtons = document.querySelectorAll(".tool-button");
  const tabList = document.getElementById("tabList");
  const contentArea = document.getElementById("contentArea");
  const welcomeScreen = document.getElementById("welcomeScreen");

  // URLs das ferramentas externas
  const externalTools = {
    os: "https://auvo.com.br",
    armazem: "https://wms.xclog.com.br",
    sesuite: "https://sesuite.com.br",
  };

  toolButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tool = button.dataset.tool;

      // Se for uma ferramenta externa, abrir em nova guia
      if (externalTools[tool]) {
        window.open(externalTools[tool], "_blank");
        return;
      }

      // Verificar se a ferramenta já está aberta
      const existingTab = document.querySelector(`.tab[data-tool="${tool}"]`);
      if (existingTab) {
        activateTab(existingTab);
        return;
      }

      // Criar nova aba apenas para ferramentas internas
      const toolName = button.querySelector("span").textContent;
      const toolIcon = button.querySelector("i").cloneNode(true);

      const tab = createTab(tool, toolName, toolIcon);
      tabList.appendChild(tab);

      // Criar conteúdo da ferramenta
      const toolContent = createToolContent(tool);
      contentArea.appendChild(toolContent);

      // Esconder tela de boas-vindas
      welcomeScreen.style.display = "none";

      // Ativar a nova aba
      activateTab(tab);

      // Carregar o conteúdo da ferramenta
      loadToolContent(tool, toolContent);
    });
  });
}

function createTab(tool, name, icon) {
  const tab = document.createElement("div");
  tab.className = "tab";
  tab.dataset.tool = tool;

  // Clonar o ícone e ajustar suas classes
  const iconClone = icon.cloneNode(true);
  if (iconClone.tagName === "IMG") {
    iconClone.className = "tool-icon";
  }

  tab.appendChild(iconClone);
  tab.appendChild(document.createTextNode(name));

  const closeButton = document.createElement("div");
  closeButton.className = "close-tab";
  closeButton.innerHTML = "&times;";
  closeButton.addEventListener("click", (e) => {
    e.stopPropagation();
    closeTab(tab);
  });

  tab.appendChild(closeButton);

  tab.addEventListener("click", () => {
    activateTab(tab);
  });

  return tab;
}

function createToolContent(tool) {
  const content = document.createElement("div");
  content.className = "tool-content";
  content.dataset.tool = tool;

  // Adicionar um loader
  const loader = document.createElement("div");
  loader.className = "loader";
  loader.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
  content.appendChild(loader);

  return content;
}

function activateTab(tab) {
  // Desativar todas as abas e conteúdos
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".tool-content")
    .forEach((c) => c.classList.remove("active"));

  // Ativar a aba selecionada e seu conteúdo
  tab.classList.add("active");
  const tool = tab.dataset.tool;
  const content = document.querySelector(`.tool-content[data-tool="${tool}"]`);
  if (content) {
    content.classList.add("active");
  }

  // Atualizar botões da barra lateral
  document.querySelectorAll(".tool-button").forEach((button) => {
    button.classList.remove("active");
    if (button.dataset.tool === tool) {
      button.classList.add("active");
    }
  });
}

function closeTab(tab) {
  const tool = tab.dataset.tool;
  const content = document.querySelector(`.tool-content[data-tool="${tool}"]`);

  // Se esta é a aba ativa, ativar outra aba
  if (tab.classList.contains("active")) {
    const nextTab = tab.nextElementSibling || tab.previousElementSibling;
    if (nextTab) {
      activateTab(nextTab);
    } else {
      // Se não houver mais abas, mostrar a tela de boas-vindas
      document.getElementById("welcomeScreen").style.display = "flex";
      document.querySelectorAll(".tool-button").forEach((button) => {
        button.classList.remove("active");
      });
    }
  }

  // Remover a aba e seu conteúdo
  tab.remove();
  if (content) {
    content.remove();
  }
}

function initializeTabSystem() {
  const tabList = document.getElementById("tabList");
  let isDragging = false;
  let dragTab = null;
  let dragStartX = 0;
  let mouseOffsetX = 0;
  let hasMovedEnough = false;

  // Habilitar drag and drop para as abas
  tabList.addEventListener("mousedown", (e) => {
    if (
      e.target.classList.contains("tab") &&
      !e.target.classList.contains("close-tab")
    ) {
      const tab = e.target;

      // Calcular o offset do mouse em relação à aba
      const rect = tab.getBoundingClientRect();
      mouseOffsetX = e.clientX - rect.left;
      dragStartX = e.clientX;

      // Iniciar o processo de drag após um pequeno movimento
      const onMouseMove = (moveEvent) => {
        if (!isDragging && Math.abs(moveEvent.clientX - dragStartX) > 5) {
          isDragging = true;
          dragTab = tab;
          hasMovedEnough = true;

          // Configurar a aba para arrastar
          dragTab.classList.add("dragging");
          dragTab.style.position = "absolute";
          dragTab.style.zIndex = "1000";

          // Atualizar posição inicial
          updateTabPosition(moveEvent);
        }

        if (isDragging) {
          moveEvent.preventDefault();
          updateTabPosition(moveEvent);
        }
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);

        if (isDragging && dragTab) {
          isDragging = false;
          hasMovedEnough = false;
          dragTab.classList.remove("dragging");
          dragTab.style.position = "";
          dragTab.style.left = "";
          dragTab.style.top = "";
          dragTab.style.zIndex = "";
          dragTab = null;
        }
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
  });

  function updateTabPosition(e) {
    if (!dragTab || !isDragging) return;

    const tabListRect = tabList.getBoundingClientRect();
    const tabRect = dragTab.getBoundingClientRect();
    const dragTabWidth = tabRect.width;

    // Calcular nova posição mantendo a aba dentro dos limites do tabList
    let newX = e.clientX - tabListRect.left - mouseOffsetX;
    newX = Math.max(0, Math.min(newX, tabListRect.width - dragTabWidth));

    dragTab.style.left = `${newX}px`;
    dragTab.style.top = "0";

    // Encontrar a posição mais próxima para soltar
    const tabs = [...tabList.querySelectorAll(".tab:not(.dragging)")];

    let closestTab = null;
    let closestDistance = Infinity;
    let shouldInsertBefore = true;

    tabs.forEach((tab) => {
      const rect = tab.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const distance = Math.abs(e.clientX - center);

      // Só considerar tabs que estão próximas o suficiente
      if (distance < dragTabWidth && distance < closestDistance) {
        closestDistance = distance;
        closestTab = tab;
        shouldInsertBefore = e.clientX < center;
      }
    });

    // Reposicionar apenas se estivermos próximos o suficiente de outra aba
    if (closestTab && hasMovedEnough && closestDistance < dragTabWidth / 2) {
      const currentIndex = Array.from(tabList.children).indexOf(dragTab);
      const targetIndex = Array.from(tabList.children).indexOf(closestTab);

      // Evitar reposicionamento desnecessário
      if (
        currentIndex !== targetIndex &&
        currentIndex !== targetIndex + (shouldInsertBefore ? 0 : 1)
      ) {
        if (shouldInsertBefore) {
          tabList.insertBefore(dragTab, closestTab);
        } else {
          tabList.insertBefore(dragTab, closestTab.nextSibling);
        }
      }
    }
  }
}

async function loadToolContent(tool, contentElement) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    contentElement.querySelector(".loader").remove();

    switch (tool) {
      case "fretes":
        contentElement.innerHTML = `
          <div class="tool-header">
            <h2>Fretes</h2>
            <p>Esta ferramenta está em desenvolvimento.</p>
          </div>
        `;
        break;
      case "rastreamento":
        contentElement.innerHTML = `
          <div class="tool-header">
            <h2>Rastreamento</h2>
            <p>Sistema de rastreamento de cargas.</p>
          </div>
        `;
        break;
      case "contratos":
        contentElement.innerHTML = `
          <div class="tool-header">
            <h2>Copasign</h2>
            <p>Esta ferramenta está em desenvolvimento.</p>
          </div>
        `;
        break;
      default:
        contentElement.innerHTML = `
          <div class="tool-header">
            <h2>Ferramenta não encontrada</h2>
            <p>A ferramenta solicitada não está disponível.</p>
          </div>
        `;
    }
  } catch (error) {
    console.error("Erro ao carregar conteúdo da ferramenta:", error);
    contentElement.innerHTML = `
      <div class="tool-header error">
        <h2>Erro ao carregar</h2>
        <p>Não foi possível carregar o conteúdo da ferramenta.</p>
      </div>
    `;
  }
}

async function validateTokenExpiration() {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  try {
    const response = await fetch("http://localhost:4010/session/validate", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error("Falha na validação do token");
    }

    const userData = await response.json();
    const expToken = userData.exp;
    const currentTime = Math.floor(Date.now() / 1000);

    if (currentTime > expToken) {
      window.location.replace("/");
      return null;
    }

    return userData;
  } catch (error) {
    console.error("Erro ao validar token:", error);
    window.location.replace("/");
    return null;
  }
}

function initializeUserDropdown() {
  const userProfileButton = document.getElementById("userProfileButton");
  const template = document.getElementById("userDropdownTemplate");

  // Inicializar o Tippy
  const tippyInstance = tippy(userProfileButton, {
    content: template.content.cloneNode(true),
    placement: "top-end",
    trigger: "click",
    interactive: true,
    theme: "user-dropdown",
    arrow: false,
    offset: [0, 8],
    animation: "fade",
    appendTo: () => document.body,
    onShow(instance) {
      // Atualizar os dados do usuário no dropdown
      const content = instance.popper.querySelector(".user-dropdown");
      const userNamePreview = content.querySelector("#userNamePreview");
      const userStatusDot = content.querySelector("#userStatusDot");
      const userStatusText = content.querySelector("#userStatusText");
      const userPhotoPreview = content.querySelector("#userPhotoPreview");

      // Copiar dados do perfil principal para o dropdown
      const userName = document.getElementById("userName").textContent;
      const userStatus = document
        .getElementById("userStatus")
        .classList.contains("active");
      const userAvatar = document.getElementById("userAvatar").innerHTML;

      if (userNamePreview) userNamePreview.textContent = userName;
      if (userStatusDot) userStatusDot.classList.toggle("active", userStatus);
      if (userStatusText)
        userStatusText.textContent = userStatus ? "Ativo" : "Inativo";
      if (userPhotoPreview) userPhotoPreview.innerHTML = userAvatar;
    },
    onMount(instance) {
      // Atualizar os IDs dos elementos clonados
      const content = instance.popper.querySelector(".user-dropdown");
      const updatePhotoBtn = content.querySelector("[id='updatePhotoButton']");
      const logoutBtn = content.querySelector("[id='logoutButton']");

      // Adicionar eventos aos botões
      if (updatePhotoBtn) {
        updatePhotoBtn.addEventListener("click", () => {
          const photoModal = document.getElementById("photoModal");
          if (photoModal) {
            photoModal.classList.add("active");
            instance.hide(); // Fechar o dropdown
          }
        });
      }

      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          document.cookie =
            "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          window.location.replace("/");
        });
      }
    },
  });
}

function initializePhotoModal() {
  const photoModal = document.getElementById("photoModal");
  const closeModal = document.getElementById("closeModal");
  const cancelButton = document.getElementById("cancelPhotoUpdate");
  const saveButton = document.getElementById("savePhoto");
  const photoUpload = document.getElementById("photoUpload");
  const removePhotoButton = document.getElementById("removePhoto");
  const avatarPreview = document.getElementById("avatarPreview");

  if (
    !photoModal ||
    !closeModal ||
    !cancelButton ||
    !saveButton ||
    !photoUpload ||
    !removePhotoButton ||
    !avatarPreview
  ) {
    console.warn("Alguns elementos do modal de foto não foram encontrados");
    return;
  }

  // Variável para armazenar a foto selecionada
  let selectedPhoto = null;

  // Fechar o modal
  function closePhotoModal() {
    photoModal.classList.remove("active");
    selectedPhoto = null;
  }

  closeModal.addEventListener("click", closePhotoModal);
  cancelButton.addEventListener("click", closePhotoModal);

  // Quando o usuário seleciona uma foto
  photoUpload.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      // Em vez de mostrar a imagem diretamente, abrimos o modal de recorte
      const reader = new FileReader();
      reader.onload = (e) => {
        // Abrir o modal de recorte com a imagem selecionada
        openCropperModal(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  });

  // Remover a foto
  removePhotoButton.addEventListener("click", () => {
    selectedPhoto = null;
    avatarPreview.innerHTML = `<i class="fas fa-user"></i>`;
  });

  // Função para atualizar a preview após o recorte
  window.updateAvatarPreview = function (croppedImage) {
    selectedPhoto = croppedImage;
    avatarPreview.innerHTML = `<img src="${croppedImage}" alt="Preview" />`;
  };

  // Salvar a foto
  saveButton.addEventListener("click", async () => {
    // Mostrar indicador de carregamento
    const saveButtonText = saveButton.innerHTML;
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    saveButton.disabled = true;

    try {
      const userAvatar = document.getElementById("userAvatar");
      const userPhotoPreview = document.getElementById("userPhotoPreview");

      if (selectedPhoto) {
        // Se uma nova foto foi selecionada, enviá-la para o servidor
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        if (!token) {
          throw new Error("Token não encontrado");
        }

        const userData = await validateTokenExpiration();
        const email = userData.email;

        const response = await fetch(
          "http://localhost:4010/user/update-picture",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email,
              image: selectedPhoto,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Falha ao atualizar a foto de perfil");
        }

        // Atualizar a interface com a nova foto em ambos os lugares
        const photoContent = `<img src="${selectedPhoto}" alt="Avatar" />`;
        userAvatar.innerHTML = photoContent;
        if (userPhotoPreview) {
          userPhotoPreview.innerHTML = photoContent;
        }

        // Mostrar mensagem de sucesso
        showNotification("Foto de perfil atualizada com sucesso!", "success");

        closePhotoModal();
      } else if (avatarPreview.querySelector("i")) {
        // Se a foto foi removida, enviar requisição para remover a foto
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        if (!token) {
          throw new Error("Token não encontrado");
        }

        const userData = await validateTokenExpiration();
        const email = userData.email;

        // Enviar requisição para remover a foto
        const response = await fetch(
          "http://localhost:4010/user/update-picture",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email,
              image: null,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Falha ao remover a foto de perfil");
        }

        // Atualizar a interface em ambos os lugares
        const initialsContent = `<i class="fas fa-user"></i>`;
        userAvatar.innerHTML = initialsContent;
        if (userPhotoPreview) {
          userPhotoPreview.innerHTML = initialsContent;
        }

        // Mostrar mensagem de sucesso
        showNotification("Foto de perfil removida com sucesso!", "success");

        closePhotoModal();
      } else {
        closePhotoModal();
      }
    } catch (error) {
      console.error("Erro ao atualizar foto de perfil:", error);
      showNotification(
        "Erro ao atualizar foto de perfil. Tente novamente.",
        "error"
      );
    } finally {
      // Restaurar o botão
      saveButton.innerHTML = saveButtonText;
      saveButton.disabled = false;
    }
  });
}

function initializeCropperModal() {
  const cropperModal = document.getElementById("cropperModal");
  const closeCropperModal = document.getElementById("closeCropperModal");
  const cancelCrop = document.getElementById("cancelCrop");
  const applyCrop = document.getElementById("applyCrop");
  const cropperImage = document.getElementById("cropperImage");

  // Botões de controle
  const rotateLeft = document.getElementById("rotateLeft");
  const rotateRight = document.getElementById("rotateRight");
  const zoomIn = document.getElementById("zoomIn");
  const zoomOut = document.getElementById("zoomOut");
  const resetCropper = document.getElementById("resetCropper");

  let cropper = null;

  // Função para abrir o modal de recorte
  window.openCropperModal = function (imageUrl) {
    // Definir a imagem no elemento
    cropperImage.src = imageUrl;

    // Mostrar o modal
    cropperModal.classList.add("active");

    // Inicializar o Cropper.js após um pequeno delay para garantir que o modal esteja visível
    setTimeout(() => {
      cropper = new Cropper(cropperImage, {
        aspectRatio: 1, // Proporção 1:1 para avatar circular
        viewMode: 1, // Restringir a área de recorte à imagem
        dragMode: "move", // Permitir mover a imagem dentro da área de recorte
        autoCropArea: 0.8, // Tamanho da área de recorte (80% da imagem)
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
      });
    }, 300);
  };

  // Função para fechar o modal de recorte
  const handleCloseCropperModal = () => {
    cropperModal.classList.remove("active");
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
  };

  closeCropperModal.addEventListener("click", handleCloseCropperModal);
  cancelCrop.addEventListener("click", handleCloseCropperModal);

  // Aplicar o recorte
  applyCrop.addEventListener("click", () => {
    if (cropper) {
      // Obter a imagem recortada como data URL
      const croppedCanvas = cropper.getCroppedCanvas({
        width: 200, // Tamanho final da imagem
        height: 200,
        fillColor: "#fff",
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
      });

      const croppedImage = croppedCanvas.toDataURL("image/jpeg", 0.9);

      // Atualizar a preview no modal principal
      window.updateAvatarPreview(croppedImage);

      // Fechar o modal de recorte
      handleCloseCropperModal();
    }
  });

  // Controles do Cropper
  rotateLeft.addEventListener("click", () => {
    if (cropper) cropper.rotate(-90);
  });

  rotateRight.addEventListener("click", () => {
    if (cropper) cropper.rotate(90);
  });

  zoomIn.addEventListener("click", () => {
    if (cropper) cropper.zoom(0.1);
  });

  zoomOut.addEventListener("click", () => {
    if (cropper) cropper.zoom(-0.1);
  });

  resetCropper.addEventListener("click", () => {
    if (cropper) cropper.reset();
  });
}

function updateUserProfile(userData) {
  // Atualizar nome do usuário
  const userNameElement = document.getElementById("userName");
  if (userNameElement) {
    userNameElement.textContent = userData.name;
  }

  // Atualizar nome do usuário no dropdown
  const userNamePreviewElement = document.getElementById("userNamePreview");
  if (userNamePreviewElement) {
    userNamePreviewElement.textContent = userData.name;
  }

  // Atualizar email do usuário
  const userEmailElement = document.getElementById("userEmail");
  if (userEmailElement) {
    userEmailElement.textContent = userData.email;
  }

  // Atualizar status do usuário
  const userStatusElement = document.getElementById("userStatus");
  const userStatusDotElement = document.getElementById("userStatusDot");
  const userStatusTextElement = document.getElementById("userStatusText");

  const isActive = userData.status === "active";

  if (userStatusElement) {
    if (isActive) {
      userStatusElement.classList.add("active");
    } else {
      userStatusElement.classList.add("inactive");
    }
  }

  if (userStatusDotElement) {
    if (isActive) {
      userStatusDotElement.classList.add("active");
    }
  }

  if (userStatusTextElement) {
    userStatusTextElement.textContent = isActive ? "Ativo" : "Inativo";
  }

  // Atualizar avatar do usuário
  const userAvatarElement = document.getElementById("userAvatar");
  const userPhotoPreviewElement = document.getElementById("userPhotoPreview");

  // Função para atualizar a foto em ambos os lugares
  const updatePhotoDisplay = (content) => {
    if (userAvatarElement) {
      userAvatarElement.innerHTML = content;
    }

    if (userPhotoPreviewElement) {
      userPhotoPreviewElement.innerHTML = content;
    }
  };

  // Verificar se há uma foto no banco de dados
  if (userData.picture && userData.picture.trim() !== "") {
    // Se houver uma foto no banco de dados, usá-la
    updatePhotoDisplay(
      `<img src="${userData.picture}" alt="${userData.name}" />`
    );
  } else {
    // Caso não haja foto, gerar avatar com as iniciais do nome do usuário
    const initials = getInitials(userData.name);
    updatePhotoDisplay(initials);
  }
}

function getInitials(name) {
  if (!name) return "";

  const nameParts = name.split(" ");
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }

  // Pegar a primeira letra do primeiro e último nome
  const firstInitial = nameParts[0].charAt(0);
  const lastInitial = nameParts[nameParts.length - 1].charAt(0);

  return (firstInitial + lastInitial).toUpperCase();
}

function initializeLogout() {
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      // Remover o token do cookie
      document.cookie =
        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Redirecionar para a página de login
      window.location.replace("/");
    });
  }
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

async function getUserAvatar() {
  try {
    const userData = await validateTokenExpiration();
    const userEmail = userData.email;

    const response = await fetch(
      `http://localhost:4010/user/get-picture/${userEmail}`
    );
    const userAvatar = await response.json();

    const userAvatarElement = document.getElementById("userAvatar");
    const userPhotoPreviewElement = document.getElementById("userPhotoPreview");

    // Função para atualizar a foto em ambos os lugares
    const updatePhotoDisplay = (content) => {
      if (userAvatarElement) {
        userAvatarElement.innerHTML = content;
      }

      if (userPhotoPreviewElement) {
        userPhotoPreviewElement.innerHTML = content;
      }
    };

    if (userAvatar.image) {
      // Criar elemento de imagem com o base64 retornado
      const photoContent = `<img src="${userAvatar.image}" alt="Avatar" />`;
      updatePhotoDisplay(photoContent);
    } else {
      const initials = getInitials(userData.name);
      updatePhotoDisplay(initials);
    }
  } catch (error) {
    console.error("Erro ao carregar avatar do usuário:", error);
    showNotification("Erro ao carregar foto de perfil", "error");
  }
}

function initializeSidebarToggle() {
  const toggleButton = document.getElementById("toggleSidebar");
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const body = document.body;

  // Forçar a sidebar a ficar aberta no início
  forceOpenSidebar();

  toggleButton.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("expanded");
    body.classList.toggle(
      "sidebar-collapsed",
      sidebar.classList.contains("collapsed")
    );

    // Atualizar ícone do botão
    const isCollapsed = sidebar.classList.contains("collapsed");
    if (isCollapsed) {
      toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
      toggleButton.setAttribute("title", "Mostrar menu lateral");
    } else {
      toggleButton.innerHTML = '<i class="fas fa-times"></i>';
      toggleButton.setAttribute("title", "Ocultar menu lateral");
    }
  });
}
