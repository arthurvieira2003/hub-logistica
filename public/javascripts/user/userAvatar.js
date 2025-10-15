// User Avatar Module - Gerenciamento de avatar e foto do usuário
window.UserAvatar = window.UserAvatar || {};

// Função para carregar avatar do usuário
window.UserAvatar.getUserAvatar = async function () {
  try {
    const userData = await window.UserAuth.validateTokenExpiration();
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

// Função para atualizar foto de perfil
window.UserAvatar.updateProfilePicture = async function (imageData) {
  try {
    const userData = await window.UserAuth.validateTokenExpiration();
    const email = userData.email;

    const response = await window.UserAuth.authenticatedFetch(
      "http://localhost:4010/user/update-picture",
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

    // Atualizar a interface com a nova foto em ambos os lugares
    const photoContent = `<img src="${imageData}" alt="Avatar" />`;
    window.UserAvatar.updatePhotoDisplay(photoContent);

    // Mostrar mensagem de sucesso
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

// Função para remover foto de perfil
window.UserAvatar.removeProfilePicture = async function () {
  try {
    const userData = await window.UserAuth.validateTokenExpiration();
    const email = userData.email;

    const response = await window.UserAuth.authenticatedFetch(
      "http://localhost:4010/user/update-picture",
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

    // Atualizar a interface em ambos os lugares
    const initialsContent = `<i class="fas fa-user"></i>`;
    window.UserAvatar.updatePhotoDisplay(initialsContent);

    // Mostrar mensagem de sucesso
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

// Função para atualizar exibição da foto
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

// Função para atualizar preview do avatar após recorte
window.UserAvatar.updateAvatarPreview = function (croppedImage) {
  const avatarPreview = document.getElementById("avatarPreview");
  if (avatarPreview) {
    avatarPreview.innerHTML = `<img src="${croppedImage}" alt="Preview" />`;
  }
};
