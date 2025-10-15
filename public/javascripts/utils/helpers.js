// Helpers Module - Funções auxiliares
window.Helpers = window.Helpers || {};

// Função para obter iniciais do nome
window.Helpers.getInitials = function (name) {
  if (!name) return "";

  const nameParts = name.split(" ");
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }

  // Pegar a primeira letra do primeiro e último nome
  const firstInitial = nameParts[0].charAt(0);
  const lastInitial = nameParts[nameParts.length - 1].charAt(0);

  return (firstInitial + lastInitial).toUpperCase();
};

// Função para formatar data
window.Helpers.formatDate = function (date, locale = "pt-BR") {
  if (!date) return "";

  const dateObj = new Date(date);
  return dateObj.toLocaleDateString(locale);
};

// Função para formatar moeda
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

// Função para debounce
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

// Função para throttle
window.Helpers.throttle = function (func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Função para gerar ID único
window.Helpers.generateId = function (prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Função para verificar se elemento existe
window.Helpers.elementExists = function (selector) {
  return document.querySelector(selector) !== null;
};

// Função para aguardar elemento aparecer
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

// Função para copiar texto para clipboard
window.Helpers.copyToClipboard = async function (text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("❌ Erro ao copiar para clipboard:", error);
    return false;
  }
};

// Função para validar email
window.Helpers.isValidEmail = function (email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Função para sanitizar HTML
window.Helpers.sanitizeHTML = function (html) {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
};

// Função para obter parâmetros da URL
window.Helpers.getUrlParams = function () {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

// Função para definir parâmetros da URL
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
