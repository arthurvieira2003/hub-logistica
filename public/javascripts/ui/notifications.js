// Notifications Module - Sistema de notificações
window.Notifications = window.Notifications || {};

// Estado das notificações
window.Notifications.state = {
  activeNotifications: new Set(),
  notificationCounter: 0,
  defaultDuration: 5000,
};

// Função para mostrar notificação
window.Notifications.showNotification = function (
  message,
  type = "info",
  duration = null
) {
  // Verificar se já existe uma notificação e removê-la
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // Criar elemento de notificação
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.dataset.notificationId = `notification-${++window.Notifications
    .state.notificationCounter}`;

  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${window.Notifications.getNotificationIcon(type)}"></i>
      <span>${message}</span>
    </div>
    <button class="notification-close">&times;</button>
  `;

  // Adicionar ao corpo do documento
  document.body.appendChild(notification);

  // Adicionar evento para fechar a notificação
  const closeButton = notification.querySelector(".notification-close");
  closeButton.addEventListener("click", () => {
    window.Notifications.hideNotification(notification.dataset.notificationId);
  });

  // Adicionar ao estado
  window.Notifications.state.activeNotifications.add(
    notification.dataset.notificationId
  );

  // Remover automaticamente após o tempo especificado
  const autoHideDuration =
    duration || window.Notifications.state.defaultDuration;
  setTimeout(() => {
    if (document.body.contains(notification)) {
      window.Notifications.hideNotification(
        notification.dataset.notificationId
      );
    }
  }, autoHideDuration);

  // Animar entrada
  setTimeout(() => {
    notification.classList.add("notification-visible");
  }, 10);
};

// Função para esconder notificação
window.Notifications.hideNotification = function (notificationId) {
  const notification = document.querySelector(
    `[data-notification-id="${notificationId}"]`
  );
  if (notification) {
    notification.classList.add("notification-hiding");
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.remove();
        window.Notifications.state.activeNotifications.delete(notificationId);
      }
    }, 300);
  }
};

// Função para obter ícone da notificação
window.Notifications.getNotificationIcon = function (type) {
  const icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
  };

  return icons[type] || icons.info;
};

// Função para mostrar notificação de sucesso
window.Notifications.showSuccess = function (message, duration = null) {
  window.Notifications.showNotification(message, "success", duration);
};

// Função para mostrar notificação de erro
window.Notifications.showError = function (message, duration = null) {
  window.Notifications.showNotification(message, "error", duration);
};

// Função para mostrar notificação de aviso
window.Notifications.showWarning = function (message, duration = null) {
  window.Notifications.showNotification(message, "warning", duration);
};

// Função para mostrar notificação de informação
window.Notifications.showInfo = function (message, duration = null) {
  window.Notifications.showNotification(message, "info", duration);
};

// Função para fechar todas as notificações
window.Notifications.closeAll = function () {
  window.Notifications.state.activeNotifications.forEach((notificationId) => {
    window.Notifications.hideNotification(notificationId);
  });
};

// Função para verificar se há notificações ativas
window.Notifications.hasActiveNotifications = function () {
  return window.Notifications.state.activeNotifications.size > 0;
};

// Função para obter notificações ativas
window.Notifications.getActiveNotifications = function () {
  return Array.from(window.Notifications.state.activeNotifications);
};

// Função para definir duração padrão
window.Notifications.setDefaultDuration = function (duration) {
  window.Notifications.state.defaultDuration = duration;
};

// Função para obter duração padrão
window.Notifications.getDefaultDuration = function () {
  return window.Notifications.state.defaultDuration;
};
