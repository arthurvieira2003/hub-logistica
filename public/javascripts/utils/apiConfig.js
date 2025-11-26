window.API_CONFIG = window.API_CONFIG || {
  getBaseUrl: function () {
    if (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) {
      return window.APP_CONFIG.API_BASE_URL;
    }
    return "http://localhost:4010";
  },
};

window.getApiBaseUrl = function () {
  return window.API_CONFIG.getBaseUrl();
};
