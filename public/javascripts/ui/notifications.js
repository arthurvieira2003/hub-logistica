window.Notifications = window.Notifications || {};

window.Notifications.state = {
  activeNotifications: new Set(),
  notificationCounter: 0,
  defaultDuration: 5000,
};

window.Notifications.showNotification = function (
  message,
  type = "info",
  duration = null
) {
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

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

  document.body.appendChild(notification);

  const closeButton = notification.querySelector(".notification-close");
  closeButton.addEventListener("click", () => {
    window.Notifications.hideNotification(notification.dataset.notificationId);
  });

  window.Notifications.state.activeNotifications.add(
    notification.dataset.notificationId
  );

  const autoHideDuration =
    duration || window.Notifications.state.defaultDuration;
  setTimeout(() => {
    if (document.body.contains(notification)) {
      window.Notifications.hideNotification(
        notification.dataset.notificationId
      );
    }
  }, autoHideDuration);

  setTimeout(() => {
    notification.classList.add("notification-visible");
  }, 10);
};

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

window.Notifications.getNotificationIcon = function (type) {
  const icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
  };

  return icons[type] || icons.info;
};

window.Notifications.showSuccess = function (message, duration = null) {
  window.Notifications.showNotification(message, "success", duration);
};

window.Notifications.showError = function (message, duration = null) {
  window.Notifications.showNotification(message, "error", duration);
};

window.Notifications.showWarning = function (message, duration = null) {
  window.Notifications.showNotification(message, "warning", duration);
};

window.Notifications.showInfo = function (message, duration = null) {
  window.Notifications.showNotification(message, "info", duration);
};

window.Notifications.closeAll = function () {
  window.Notifications.state.activeNotifications.forEach((notificationId) => {
    window.Notifications.hideNotification(notificationId);
  });
};

window.Notifications.hasActiveNotifications = function () {
  return window.Notifications.state.activeNotifications.size > 0;
};

window.Notifications.getActiveNotifications = function () {
  return Array.from(window.Notifications.state.activeNotifications);
};

window.Notifications.setDefaultDuration = function (duration) {
  window.Notifications.state.defaultDuration = duration;
};

window.Notifications.getDefaultDuration = function () {
  return window.Notifications.state.defaultDuration;
};
