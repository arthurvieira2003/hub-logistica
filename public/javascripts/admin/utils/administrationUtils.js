window.Administration = window.Administration || {};

window.Administration.showSuccess = function (message) {
  window.Administration.showNotification(message, "success");
};

window.Administration.showError = function (message) {
  window.Administration.showNotification(message, "error");
};

window.Administration.showNotification = function (message, type = "info") {
  const container = document.getElementById("notificationContainer");
  if (!container) return;

  const notification = document.createElement("div");
  notification.className = `admin-notification admin-notification-${type}`;

  const iconMap = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    info: "fa-info-circle",
  };

  notification.innerHTML = `
    <div class="admin-notification-content">
      <i class="fas ${iconMap[type] || iconMap.info}"></i>
      <span>${message}</span>
    </div>
    <button class="admin-notification-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;

  container.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("admin-notification-visible");
  }, 10);

  setTimeout(() => {
    notification.classList.remove("admin-notification-visible");
    notification.classList.add("admin-notification-hiding");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
};
