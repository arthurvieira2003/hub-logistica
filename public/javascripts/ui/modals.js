// Modals Module - Gerenciamento de modais
window.Modals = window.Modals || {};

// Estado dos modais
window.Modals.state = {
  activeModals: new Set(),
  modalInstances: new Map(),
};

// Função para inicializar modais
window.Modals.init = function () {
  window.Modals.initPhotoModal();
  window.Modals.initCropperModal();
};

// Função para inicializar modal de foto
window.Modals.initPhotoModal = function () {
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
    console.warn("⚠️ Alguns elementos do modal de foto não foram encontrados");
    return;
  }

  // Variável para armazenar a foto selecionada
  let selectedPhoto = null;

  // Fechar o modal
  function closePhotoModal() {
    photoModal.classList.remove("active");
    selectedPhoto = null;
    window.Modals.state.activeModals.delete("photoModal");
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
        window.Modals.openCropperModal(e.target.result);
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
  window.UserAvatar.updateAvatarPreview = function (croppedImage) {
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
      if (selectedPhoto) {
        // Se uma nova foto foi selecionada, enviá-la para o servidor
        const success = await window.UserAvatar.updateProfilePicture(
          selectedPhoto
        );
        if (success) {
          closePhotoModal();
        }
      } else if (avatarPreview.querySelector("i")) {
        // Se a foto foi removida, enviar requisição para remover a foto
        const success = await window.UserAvatar.removeProfilePicture();
        if (success) {
          closePhotoModal();
        }
      } else {
        closePhotoModal();
      }
    } catch (error) {
      console.error("❌ Erro ao processar foto:", error);
    } finally {
      // Restaurar o botão
      saveButton.innerHTML = saveButtonText;
      saveButton.disabled = false;
    }
  });
};

// Função para inicializar modal de recorte
window.Modals.initCropperModal = function () {
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
  window.Modals.openCropperModal = function (imageUrl) {
    // Definir a imagem no elemento
    cropperImage.src = imageUrl;

    // Mostrar o modal
    cropperModal.classList.add("active");
    window.Modals.state.activeModals.add("cropperModal");

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
    window.Modals.state.activeModals.delete("cropperModal");
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
      window.UserAvatar.updateAvatarPreview(croppedImage);

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
};

// Função para mostrar modal
window.Modals.showModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
    window.Modals.state.activeModals.add(modalId);
  }
};

// Função para esconder modal
window.Modals.hideModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
    window.Modals.state.activeModals.delete(modalId);
  }
};

// Função para fechar todos os modais
window.Modals.closeAllModals = function () {
  window.Modals.state.activeModals.forEach((modalId) => {
    window.Modals.hideModal(modalId);
  });
};

// Função para verificar se há modais abertos
window.Modals.hasActiveModals = function () {
  return window.Modals.state.activeModals.size > 0;
};

// Função para obter modais ativos
window.Modals.getActiveModals = function () {
  return Array.from(window.Modals.state.activeModals);
};
