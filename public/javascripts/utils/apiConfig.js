window.API_CONFIG = window.API_CONFIG || {
  getBaseUrl: function () {
    if (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) {
      return window.APP_CONFIG.API_BASE_URL;
    }
    return "https://logistica.copapel.com.br/api";
  },
};

window.getApiBaseUrl = function () {
  return window.API_CONFIG.getBaseUrl();
};
