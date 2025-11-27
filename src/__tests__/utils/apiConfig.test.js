const apiConfigPath = require.resolve(
  "../../../public/javascripts/utils/apiConfig.js"
);

beforeAll(() => {
  require(apiConfigPath);
});

describe("API_CONFIG", () => {
  beforeEach(() => {
    delete window.APP_CONFIG;
  });

  describe("getBaseUrl", () => {
    test("deve retornar URL do APP_CONFIG quando disponível", () => {
      window.APP_CONFIG = {
        API_BASE_URL: "https://api.example.com",
      };

      const url = window.API_CONFIG.getBaseUrl();

      expect(url).toBe("https://api.example.com");
    });

    test("deve retornar URL padrão quando APP_CONFIG não está disponível", () => {
      delete window.APP_CONFIG;

      const url = window.API_CONFIG.getBaseUrl();

      expect(url).toBe("http://localhost:4010");
    });

    test("deve retornar URL padrão quando APP_CONFIG não tem API_BASE_URL", () => {
      window.APP_CONFIG = {};

      const url = window.API_CONFIG.getBaseUrl();

      expect(url).toBe("http://localhost:4010");
    });
  });

  describe("getApiBaseUrl", () => {
    test("deve retornar URL do APP_CONFIG quando disponível", () => {
      window.APP_CONFIG = {
        API_BASE_URL: "https://api.example.com",
      };

      const url = window.getApiBaseUrl();

      expect(url).toBe("https://api.example.com");
    });

    test("deve retornar URL padrão quando APP_CONFIG não está disponível", () => {
      delete window.APP_CONFIG;

      const url = window.getApiBaseUrl();

      expect(url).toBe("http://localhost:4010");
    });
  });
});
