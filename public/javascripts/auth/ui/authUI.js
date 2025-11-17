window.AuthUI = window.AuthUI || {};

window.AuthUI.showLoading = function (message = "Carregando...") {
  if (!document.body) {
    document.addEventListener("DOMContentLoaded", () =>
      window.AuthUI.showLoading(message)
    );
    return;
  }

  if (document.getElementById("auth-loading-overlay")) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "auth-loading-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;

  overlay.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    ">
      <div style="
        width: 40px;
        height: 40px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #2d665f;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      "></div>
      <div style="
        color: #2d665f;
        font-size: 14px;
        font-weight: 500;
      ">${message}</div>
    </div>
  `;

  if (!document.querySelector("#auth-loading-styles")) {
    const style = document.createElement("style");
    style.id = "auth-loading-styles";
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(overlay);

  setTimeout(window.AuthUI.hideLoading, 10000);
};

window.AuthUI.hideLoading = function () {
  if (!document.body) {
    document.addEventListener("DOMContentLoaded", window.AuthUI.hideLoading);
    return;
  }

  const overlay = document.getElementById("auth-loading-overlay");
  if (overlay) {
    overlay.remove();
  }
};

window.AuthUI.removeExistingOverlay = function () {
  const authLoadingOverlay = document.getElementById("auth-loading-overlay");
  if (authLoadingOverlay) {
    authLoadingOverlay.remove();
  }
};

window.AuthUI.showAuthError = function (message) {
  const existingNotification = document.querySelector(".auth-notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement("div");
  notification.className = "auth-notification auth-notification-error";
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #dc3545;
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    max-width: 400px;
    font-size: 14px;
    line-height: 1.4;
  `;

  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <i class="fas fa-exclamation-circle"></i>
      <span>${message}</span>
    </div>
    <button style="
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">&times;</button>
  `;

  document.body.appendChild(notification);

  const closeButton = notification.querySelector("button");
  closeButton.addEventListener("click", () => {
    notification.style.opacity = "0";
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.remove();
      }
    }, 300);
  });

  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);

  setTimeout(() => {
    notification.style.opacity = "1";
    notification.style.transform = "translateX(0)";
  }, 10);
};

window.AdminAuthUI = window.AuthUI;
