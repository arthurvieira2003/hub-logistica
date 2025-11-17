// Configuração centralizada da API
// Este arquivo é gerado automaticamente pelo app.js baseado na variável de ambiente API_BASE_URL
// Se window.APP_CONFIG não estiver disponível, usa o valor padrão
window.API_CONFIG = window.API_CONFIG || {
  getBaseUrl: function () {
    if (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) {
      return window.APP_CONFIG.API_BASE_URL;
    }
    return "http://localhost:4010";
  },
};

// Função helper global para obter a URL base da API
window.getApiBaseUrl = function () {
  return window.API_CONFIG.getBaseUrl();
};
