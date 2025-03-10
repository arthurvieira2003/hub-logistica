document.addEventListener("DOMContentLoaded", async () => {
  await loadUserData();

  initializeToolCards();

  initializeLogout();

  initializePhotoModal();

  initializeCropperModal();
});

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

function initializeToolCards() {
  const cards = document.querySelectorAll(".tool-card");

  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;

    card.addEventListener("click", () => {
      const tool = card.dataset.tool;
      console.log(`Redirecionando para a ferramenta: ${tool}`);
    });
  });
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

function initializePhotoModal() {
  const updatePhotoButton = document.getElementById("updatePhotoButton");
  const photoModal = document.getElementById("photoModal");
  const closeModal = document.getElementById("closeModal");
  const cancelButton = document.getElementById("cancelPhotoUpdate");
  const saveButton = document.getElementById("savePhoto");
  const photoUpload = document.getElementById("photoUpload");
  const removePhotoButton = document.getElementById("removePhoto");
  const avatarPreview = document.getElementById("avatarPreview");

  // Variável para armazenar a foto selecionada
  let selectedPhoto = null;

  // Abrir o modal
  updatePhotoButton.addEventListener("click", () => {
    photoModal.classList.add("active");

    // Copiar a foto atual para o preview
    const currentAvatar = document.getElementById("userAvatar");
    avatarPreview.innerHTML = currentAvatar.innerHTML;
  });

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

        // Armazenar temporariamente no localStorage para caso o usuário recarregue a página
        // antes que os dados sejam atualizados do servidor
        localStorage.setItem("userAvatar", selectedPhoto);

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
        localStorage.removeItem("userAvatar");

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

    // Atualizar também o localStorage para manter consistência
    localStorage.setItem("userAvatar", userData.picture);
  } else {
    // Verificar se há uma foto salva no localStorage (caso tenha sido atualizada recentemente)
    const savedAvatar = localStorage.getItem("userAvatar");

    if (savedAvatar) {
      // Se houver uma foto salva, usá-la
      updatePhotoDisplay(`<img src="${savedAvatar}" alt="${userData.name}" />`);
    } else {
      // Caso contrário, gerar avatar com as iniciais do nome do usuário
      const initials = getInitials(userData.name);
      updatePhotoDisplay(initials);
    }
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
