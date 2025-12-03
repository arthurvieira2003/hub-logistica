window.Helpers = window.Helpers || {};

window.Helpers.getInitials = function (name) {
  if (!name) return "";

  const nameParts = name.split(" ");
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }

  const firstInitial = nameParts[0].charAt(0);
  const lastInitial = nameParts[nameParts.length - 1].charAt(0);

  return (firstInitial + lastInitial).toUpperCase();
};

window.Helpers.formatDate = function (date, locale = "pt-BR") {
  if (!date) return "";

  const dateObj = new Date(date);
  return dateObj.toLocaleDateString(locale);
};

window.Helpers.formatCurrency = function (
  value,
  currency = "BRL",
  locale = "pt-BR"
) {
  if (!value) return "";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

window.Helpers.debounce = function (func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

window.Helpers.throttle = function (func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

window.Helpers.generateId = function (prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

window.Helpers.elementExists = function (selector) {
  return document.querySelector(selector) !== null;
};

window.Helpers.waitForElement = function (selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(
        new Error(`Elemento ${selector} não encontrado após ${timeout}ms`)
      );
    }, timeout);
  });
};

window.Helpers.copyToClipboard = async function (text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("❌ Erro ao copiar para clipboard:", error);
    return false;
  }
};

window.Helpers.isValidEmail = function (email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

window.Helpers.sanitizeHTML = function (html) {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
};

window.Helpers.getUrlParams = function () {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

window.Helpers.setUrlParams = function (params) {
  const url = new URL(window.location);
  Object.keys(params).forEach((key) => {
    if (params[key] !== null && params[key] !== undefined) {
      url.searchParams.set(key, params[key]);
    } else {
      url.searchParams.delete(key);
    }
  });
  window.history.replaceState({}, "", url);
};
