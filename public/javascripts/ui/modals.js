window.Modals = window.Modals || {};

window.Modals.state = {
  activeModals: new Set(),
  modalInstances: new Map(),
};

window.Modals.init = function () {
  window.Modals.initPhotoModal();
  window.Modals.initCropperModal();
};

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

  let selectedPhoto = null;

  function closePhotoModal() {
    photoModal.classList.remove("active");
    selectedPhoto = null;
    window.Modals.state.activeModals.delete("photoModal");
  }

  closeModal.addEventListener("click", closePhotoModal);
  cancelButton.addEventListener("click", closePhotoModal);

  photoUpload.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        window.Modals.openCropperModal(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  });

  removePhotoButton.addEventListener("click", () => {
    selectedPhoto = null;
    avatarPreview.innerHTML = `<i class="fas fa-user"></i>`;
  });

  window.UserAvatar.updateAvatarPreview = function (croppedImage) {
    selectedPhoto = croppedImage;
    avatarPreview.innerHTML = `<img src="${croppedImage}" alt="Preview" />`;
  };

  saveButton.addEventListener("click", async () => {
    const saveButtonText = saveButton.innerHTML;
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    saveButton.disabled = true;

    try {
      if (selectedPhoto) {
        const success = await window.UserAvatar.updateProfilePicture(
          selectedPhoto
        );
        if (success) {
          closePhotoModal();
        }
      } else if (avatarPreview.querySelector("i")) {
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
      saveButton.innerHTML = saveButtonText;
      saveButton.disabled = false;
    }
  });
};

window.Modals.initCropperModal = function () {
  const cropperModal = document.getElementById("cropperModal");
  const closeCropperModal = document.getElementById("closeCropperModal");
  const cancelCrop = document.getElementById("cancelCrop");
  const applyCrop = document.getElementById("applyCrop");
  const cropperImage = document.getElementById("cropperImage");
  const rotateLeft = document.getElementById("rotateLeft");
  const rotateRight = document.getElementById("rotateRight");
  const zoomIn = document.getElementById("zoomIn");
  const zoomOut = document.getElementById("zoomOut");
  const resetCropper = document.getElementById("resetCropper");

  let cropper = null;

  window.Modals.openCropperModal = function (imageUrl) {
    cropperImage.src = imageUrl;

    cropperModal.classList.add("active");
    window.Modals.state.activeModals.add("cropperModal");

    setTimeout(() => {
      cropper = new Cropper(cropperImage, {
        aspectRatio: 1,
        viewMode: 1,
        dragMode: "move",
        autoCropArea: 0.8,
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

  applyCrop.addEventListener("click", () => {
    if (cropper) {
      const croppedCanvas = cropper.getCroppedCanvas({
        width: 200,
        height: 200,
        fillColor: "#fff",
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
      });

      const croppedImage = croppedCanvas.toDataURL("image/jpeg", 0.9);

      window.UserAvatar.updateAvatarPreview(croppedImage);

      handleCloseCropperModal();
    }
  });

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

window.Modals.showModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
    window.Modals.state.activeModals.add(modalId);
  }
};

window.Modals.hideModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
    window.Modals.state.activeModals.delete(modalId);
  }
};

window.Modals.closeAllModals = function () {
  window.Modals.state.activeModals.forEach((modalId) => {
    window.Modals.hideModal(modalId);
  });
};

window.Modals.hasActiveModals = function () {
  return window.Modals.state.activeModals.size > 0;
};

window.Modals.getActiveModals = function () {
  return Array.from(window.Modals.state.activeModals);
};
