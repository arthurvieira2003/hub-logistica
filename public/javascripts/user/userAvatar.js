window.UserAvatar = window.UserAvatar || {};

window.UserAvatar.getUserAvatar = async function () {
  try {
    let userData = window.UserProfile?.state?.userData;
    if (!userData) {
      userData = await window.UserAuth.validateTokenExpiration();
    }
    const userEmail = userData.email;

    const API_BASE_URL =
      (window.getApiBaseUrl && window.getApiBaseUrl()) ||
      (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ||
      "https://logistica.copapel.com.br";
    const response = await fetch(
      `${API_BASE_URL}/user/get-picture/${userEmail}`
    );
    const userAvatar = await response.json();

    const userAvatarElement = document.getElementById("userAvatar");
    const userPhotoPreviewElement = document.getElementById("userPhotoPreview");

    const updatePhotoDisplay = (content) => {
      if (userAvatarElement) {
        userAvatarElement.innerHTML = content;
      }

      if (userPhotoPreviewElement) {
        userPhotoPreviewElement.innerHTML = content;
      }
    };

    if (userAvatar.image) {
      const photoContent = `<img src="${userAvatar.image}" alt="Avatar" />`;
      updatePhotoDisplay(photoContent);
    } else {
      const initials = window.UserProfile.getInitials(userData.name);
      updatePhotoDisplay(initials);
    }
  } catch (error) {
    console.error("❌ Erro ao carregar avatar do usuário:", error);
    window.Notifications.showNotification(
      "Erro ao carregar foto de perfil",
      "error"
    );
  }
};

window.UserAvatar.updateProfilePicture = async function (imageData) {
  try {
    const userData = await window.UserAuth.validateTokenExpiration();
    const email = userData.email;

    const API_BASE_URL =
      (window.getApiBaseUrl && window.getApiBaseUrl()) ||
      (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ||
      "https://logistica.copapel.com.br";
    const response = await window.UserAuth.authenticatedFetch(
      `${API_BASE_URL}/user/update-picture`,
      {
        method: "POST",
        body: JSON.stringify({
          email: email,
          image: imageData,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Falha ao atualizar a foto de perfil");
    }

    const photoContent = `<img src="${imageData}" alt="Avatar" />`;
    window.UserAvatar.updatePhotoDisplay(photoContent);

    window.Notifications.showNotification(
      "Foto de perfil atualizada com sucesso!",
      "success"
    );

    return true;
  } catch (error) {
    console.error("❌ Erro ao atualizar foto de perfil:", error);
    window.Notifications.showNotification(
      "Erro ao atualizar foto de perfil. Tente novamente.",
      "error"
    );
    return false;
  }
};

window.UserAvatar.removeProfilePicture = async function () {
  try {
    const userData = await window.UserAuth.validateTokenExpiration();
    const email = userData.email;

    const API_BASE_URL =
      (window.getApiBaseUrl && window.getApiBaseUrl()) ||
      (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ||
      "https://logistica.copapel.com.br";
    const response = await window.UserAuth.authenticatedFetch(
      `${API_BASE_URL}/user/update-picture`,
      {
        method: "POST",
        body: JSON.stringify({
          email: email,
          image: null,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Falha ao remover a foto de perfil");
    }

    const initialsContent = `<i class="fas fa-user"></i>`;
    window.UserAvatar.updatePhotoDisplay(initialsContent);

    window.Notifications.showNotification(
      "Foto de perfil removida com sucesso!",
      "success"
    );

    return true;
  } catch (error) {
    console.error("❌ Erro ao remover foto de perfil:", error);
    window.Notifications.showNotification(
      "Erro ao remover foto de perfil. Tente novamente.",
      "error"
    );
    return false;
  }
};

window.UserAvatar.updatePhotoDisplay = function (content) {
  const userAvatarElement = document.getElementById("userAvatar");
  const userPhotoPreviewElement = document.getElementById("userPhotoPreview");

  if (userAvatarElement) {
    userAvatarElement.innerHTML = content;
  }

  if (userPhotoPreviewElement) {
    userPhotoPreviewElement.innerHTML = content;
  }
};

window.UserAvatar.updateAvatarPreview = function (croppedImage) {
  const avatarPreview = document.getElementById("avatarPreview");
  if (avatarPreview) {
    avatarPreview.innerHTML = `<img src="${croppedImage}" alt="Preview" />`;
  }
};
