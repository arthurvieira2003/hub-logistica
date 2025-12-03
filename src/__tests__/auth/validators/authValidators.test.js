const helpersPath = require.resolve(
  "../../../../public/javascripts/utils/helpers.js"
);
const authValidatorsPath = require.resolve(
  "../../../../public/javascripts/auth/validators/authValidators.js"
);
beforeAll(() => {
  require(helpersPath);

  window.LoginUI = {
    showNotification: jest.fn(),
  };

  window.AuthCore = {
    getToken: jest.fn(() => "mock-token"),
    redirectToLogin: jest.fn(),
    validateToken: jest.fn(() =>
      Promise.resolve({ exp: Math.floor(Date.now() / 1000) + 3600 })
    ),
    isTokenExpired: jest.fn(() => false),
  };

  window.AuthUI = {
    showLoading: jest.fn(),
    hideLoading: jest.fn(),
  };

  require(authValidatorsPath);
});

describe("AuthValidators", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.cookie = "";
  });

  describe("validateRequiredFields", () => {
    test("deve retornar true quando email e senha estão preenchidos", () => {
      const result = window.AuthValidators.validateRequiredFields(
        "test@example.com",
        "password123"
      );
      expect(result).toBe(true);
      expect(window.LoginUI.showNotification).not.toHaveBeenCalled();
    });

    test("deve retornar false quando email está vazio", () => {
      const result = window.AuthValidators.validateRequiredFields(
        "",
        "password123"
      );
      expect(result).toBe(false);
      expect(window.LoginUI.showNotification).toHaveBeenCalledWith(
        "warning",
        "Campos obrigatórios",
        "Por favor, preencha todos os campos.",
        4000
      );
    });

    test("deve retornar false quando senha está vazia", () => {
      const result = window.AuthValidators.validateRequiredFields(
        "test@example.com",
        ""
      );
      expect(result).toBe(false);
      expect(window.LoginUI.showNotification).toHaveBeenCalled();
    });

    test("deve retornar false quando ambos estão vazios", () => {
      const result = window.AuthValidators.validateRequiredFields("", "");
      expect(result).toBe(false);
      expect(window.LoginUI.showNotification).toHaveBeenCalled();
    });
  });

  describe("validateEmail", () => {
    test("deve retornar true para email válido", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.com",
        "test123@test-domain.com",
      ];

      validEmails.forEach((email) => {
        const result = window.AuthValidators.validateEmail(email);
        expect(result).toBe(true);
      });
    });

    test("deve retornar false para email inválido", () => {
      const invalidEmails = [
        "invalid-email",
        "@example.com",
        "test@",
        "test @example.com",
        "test@example",
        "",
      ];

      invalidEmails.forEach((email) => {
        const result = window.AuthValidators.validateEmail(email);
        expect(result).toBe(false);
        expect(window.LoginUI.showNotification).toHaveBeenCalledWith(
          "warning",
          "Email inválido",
          "Por favor, insira um email válido.",
          4000
        );
      });
    });
  });

  describe("validateLoginData", () => {
    test("deve retornar true para dados válidos", () => {
      const result = window.AuthValidators.validateLoginData(
        "test@example.com",
        "password123"
      );
      expect(result).toBe(true);
    });

    test("deve retornar false quando campos obrigatórios estão vazios", () => {
      const result = window.AuthValidators.validateLoginData("", "password123");
      expect(result).toBe(false);
    });

    test("deve retornar false quando email é inválido", () => {
      const result = window.AuthValidators.validateLoginData(
        "invalid-email",
        "password123"
      );
      expect(result).toBe(false);
    });
  });

  describe("validateRegisterData", () => {
    test("deve retornar true para dados válidos", () => {
      const result = window.AuthValidators.validateRegisterData(
        "test@example.com",
        "password123",
        "password123"
      );
      expect(result).toBe(true);
    });

    test("deve retornar false quando campos obrigatórios estão vazios", () => {
      const result = window.AuthValidators.validateRegisterData(
        "",
        "password123",
        "password123"
      );
      expect(result).toBe(false);
    });

    test("deve retornar false quando senhas não coincidem", () => {
      const result = window.AuthValidators.validateRegisterData(
        "test@example.com",
        "password123",
        "password456"
      );
      expect(result).toBe(false);
      expect(window.LoginUI.showNotification).toHaveBeenCalledWith(
        "warning",
        "Senhas não coincidem",
        "As senhas informadas não são iguais.",
        4000
      );
    });

    test("deve retornar false quando senha é muito curta", () => {
      const result = window.AuthValidators.validateRegisterData(
        "test@example.com",
        "12345",
        "12345"
      );
      expect(result).toBe(false);
      expect(window.LoginUI.showNotification).toHaveBeenCalledWith(
        "warning",
        "Senha muito curta",
        "A senha deve ter pelo menos 6 caracteres.",
        4000
      );
    });

    test("deve retornar false quando email é inválido", () => {
      const result = window.AuthValidators.validateRegisterData(
        "invalid-email",
        "password123",
        "password123"
      );
      expect(result).toBe(false);
    });
  });

  describe("basicTokenCheck", () => {
    test("deve retornar true quando token existe", () => {
      window.AuthCore.getToken.mockReturnValue("valid-token");
      const result = window.AuthValidators.basicTokenCheck();
      expect(result).toBe(true);
      expect(window.AuthCore.redirectToLogin).not.toHaveBeenCalled();
    });

    test("deve retornar false quando token não existe", () => {
      window.AuthCore.getToken.mockReturnValue(null);
      const result = window.AuthValidators.basicTokenCheck();
      expect(result).toBe(false);
      expect(window.AuthCore.redirectToLogin).toHaveBeenCalledWith(
        "Você precisa estar logado para acessar esta página."
      );
    });
  });

  describe("getToken", () => {
    test("deve extrair token dos cookies", () => {
      document.cookie = "token=test-token-123; other=value";
      const token = window.AuthValidators.getToken();
      expect(token).toBe("test-token-123");
    });

    test("deve retornar undefined quando token não existe", () => {
      document.cookie = "";
      document.cookie = "other=value";
      const token = window.AuthValidators.getToken();
      expect(token).toBeUndefined();
    });
  });

  describe("isTokenExpired", () => {
    test("deve retornar true quando token está expirado", () => {
      const expiredTime = Math.floor(Date.now() / 1000) - 3600;
      const userData = { exp: expiredTime };
      const result = window.AuthValidators.isTokenExpired(userData);
      expect(result).toBe(true);
    });

    test("deve retornar false quando token não está expirado", () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600;
      const userData = { exp: futureTime };
      const result = window.AuthValidators.isTokenExpired(userData);
      expect(result).toBe(false);
    });
  });

  describe("advancedTokenCheck", () => {
    beforeEach(() => {
      delete window.location;
      window.location = { href: "" };
      jest.clearAllMocks();
    });

    test("deve retornar false quando token não existe", async () => {
      window.AuthCore.getToken.mockReturnValue(null);
      const result = await window.AuthValidators.advancedTokenCheck();
      expect(result).toBe(false);
      expect(window.AuthUI.showLoading).not.toHaveBeenCalled();
    });

    test("deve retornar true quando token é válido e não expirado", async () => {
      window.AuthCore.getToken.mockReturnValue("valid-token");
      window.AuthCore.validateToken.mockResolvedValue({
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      window.AuthCore.isTokenExpired.mockReturnValue(false);

      const result = await window.AuthValidators.advancedTokenCheck();

      expect(result).toBe(true);
      expect(window.AuthUI.showLoading).toHaveBeenCalledWith(
        "Verificando sessão..."
      );
      expect(window.AuthUI.hideLoading).toHaveBeenCalled();
      expect(window.location.href).toBe("/home");
    });

    test("deve retornar false quando userData é null", async () => {
      window.AuthCore.getToken.mockReturnValue("token");
      window.AuthCore.validateToken.mockResolvedValue(null);

      const result = await window.AuthValidators.advancedTokenCheck();

      expect(result).toBe(false);
      expect(window.AuthUI.hideLoading).toHaveBeenCalled();
    });

    test("deve retornar false quando token está expirado", async () => {
      window.AuthCore.getToken.mockReturnValue("token");
      window.AuthCore.validateToken.mockResolvedValue({
        exp: Math.floor(Date.now() / 1000) - 3600,
      });
      window.AuthCore.isTokenExpired.mockReturnValue(true);

      const result = await window.AuthValidators.advancedTokenCheck();

      expect(result).toBe(false);
      expect(window.AuthUI.hideLoading).toHaveBeenCalled();
    });

    test("deve retornar false em caso de erro", async () => {
      window.AuthCore.getToken.mockReturnValue("token");
      window.AuthCore.validateToken.mockRejectedValue(
        new Error("Erro de rede")
      );

      const result = await window.AuthValidators.advancedTokenCheck();

      expect(result).toBe(false);
      expect(window.AuthUI.hideLoading).toHaveBeenCalled();
    });
  });

  describe("protectedPageCheck", () => {
    test("deve retornar null quando token não existe", async () => {
      window.AuthCore.getToken.mockReturnValue(null);
      const result = await window.AuthValidators.protectedPageCheck();
      expect(result).toBeNull();
    });

    test("deve retornar userData quando token é válido", async () => {
      const mockUserData = {
        exp: Math.floor(Date.now() / 1000) + 3600,
        user: "test",
      };
      window.AuthCore.getToken.mockReturnValue("token");
      window.AuthCore.validateToken.mockResolvedValue(mockUserData);
      window.AuthCore.isTokenExpired.mockReturnValue(false);

      const result = await window.AuthValidators.protectedPageCheck();

      expect(result).toEqual(mockUserData);
    });

    test("deve retornar null quando userData é null", async () => {
      window.AuthCore.getToken.mockReturnValue("token");
      window.AuthCore.validateToken.mockResolvedValue(null);

      const result = await window.AuthValidators.protectedPageCheck();

      expect(result).toBeNull();
    });

    test("deve retornar null quando token está expirado", async () => {
      window.AuthCore.getToken.mockReturnValue("token");
      window.AuthCore.validateToken.mockResolvedValue({
        exp: Math.floor(Date.now() / 1000) - 3600,
      });
      window.AuthCore.isTokenExpired.mockReturnValue(true);

      const result = await window.AuthValidators.protectedPageCheck();

      expect(result).toBeNull();
    });
  });

  describe("adminCheck", () => {
    beforeEach(() => {
      delete window.location;
      window.location = { href: "" };
      jest.clearAllMocks();
    });

    test("deve redirecionar quando token não existe", async () => {
      window.AuthCore.getToken.mockReturnValue(null);
      const result = await window.AuthValidators.adminCheck();

      expect(result).toBe(false);
      expect(window.location.href).toBe("/home");
    });

    test("deve retornar true quando usuário é admin", async () => {
      const mockUserData = {
        exp: Math.floor(Date.now() / 1000) + 3600,
        isAdmin: true,
      };
      window.AuthCore.getToken.mockReturnValue("token");
      window.AuthCore.validateToken.mockResolvedValue(mockUserData);
      window.AuthCore.isTokenExpired.mockReturnValue(false);

      const result = await window.AuthValidators.adminCheck();

      expect(result).toBe(true);
      expect(window.AuthUI.showLoading).toHaveBeenCalledWith(
        "Verificando permissões..."
      );
      expect(window.AuthUI.hideLoading).toHaveBeenCalled();
    });

    test("deve redirecionar quando usuário não é admin", async () => {
      const mockUserData = {
        exp: Math.floor(Date.now() / 1000) + 3600,
        isAdmin: false,
      };
      window.AuthCore.getToken.mockReturnValue("token");
      window.AuthCore.validateToken.mockResolvedValue(mockUserData);
      window.AuthCore.isTokenExpired.mockReturnValue(false);

      const result = await window.AuthValidators.adminCheck();

      expect(result).toBe(false);
      expect(window.location.href).toBe("/home");
    });

    test("deve redirecionar quando userData é null", async () => {
      window.AuthCore.getToken.mockReturnValue("token");
      window.AuthCore.validateToken.mockResolvedValue(null);

      const result = await window.AuthValidators.adminCheck();

      expect(result).toBe(false);
      expect(window.location.href).toBe("/home");
    });

    test("deve redirecionar quando token está expirado", async () => {
      window.AuthCore.getToken.mockReturnValue("token");
      window.AuthCore.validateToken.mockResolvedValue({
        exp: Math.floor(Date.now() / 1000) - 3600,
      });
      window.AuthCore.isTokenExpired.mockReturnValue(true);

      const result = await window.AuthValidators.adminCheck();

      expect(result).toBe(false);
      expect(window.location.href).toBe("/home");
    });

    test("deve redirecionar em caso de erro", async () => {
      window.AuthCore.getToken.mockReturnValue("token");
      window.AuthCore.validateToken.mockRejectedValue(new Error("Erro"));

      const result = await window.AuthValidators.adminCheck();

      expect(result).toBe(false);
      expect(window.location.href).toBe("/home");
    });
  });

  describe("validateToken", () => {
    beforeEach(() => {
      delete window.getApiBaseUrl;
      delete window.APP_CONFIG;
    });

    test("deve retornar userData quando token é válido", async () => {
      const mockUserData = {
        user: "test",
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserData,
      });

      const result = await window.AuthValidators.validateToken("test-token");

      expect(result).toEqual(mockUserData);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://logistica.copapel.com.br/api/session/validate",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "test-token",
          },
        }
      );
    });

    test("deve usar getApiBaseUrl quando disponível", async () => {
      window.getApiBaseUrl = jest.fn(() => "https://custom-api.com");
      const mockUserData = { user: "test" };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserData,
      });

      await window.AuthValidators.validateToken("test-token");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://custom-api.com/session/validate",
        expect.any(Object)
      );
    });

    test("deve usar APP_CONFIG.API_BASE_URL quando getApiBaseUrl não está disponível", async () => {
      window.APP_CONFIG = { API_BASE_URL: "https://app-config-api.com" };
      const mockUserData = { user: "test" };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserData,
      });

      await window.AuthValidators.validateToken("test-token");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://app-config-api.com/session/validate",
        expect.any(Object)
      );
    });

    test("deve retornar null quando resposta não é ok", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await window.AuthValidators.validateToken("test-token");

      expect(result).toBeNull();
    });
  });

  describe("redirectToHome", () => {
    beforeEach(() => {
      delete window.location;
      window.location = { href: "" };
      localStorage.clear();
      jest.clearAllMocks();
    });

    test("deve redirecionar para home com mensagem", () => {
      window.AuthValidators.redirectToHome("Mensagem de erro");

      expect(window.location.href).toBe("/home");
      expect(localStorage.getItem("auth_error")).toBe("Mensagem de erro");
    });

    test("deve esconder loading do AuthUI", () => {
      window.AuthValidators.redirectToHome("Erro");

      expect(window.AuthUI.hideLoading).toHaveBeenCalled();
    });

    test("deve esconder loading do AdminAuthUI quando disponível", () => {
      window.AdminAuthUI = {
        hideLoading: jest.fn(),
      };

      window.AuthValidators.redirectToHome("Erro");

      expect(window.AdminAuthUI.hideLoading).toHaveBeenCalled();
    });

    test("deve funcionar quando AdminAuthUI não está disponível", () => {
      delete window.AdminAuthUI;

      expect(() => {
        window.AuthValidators.redirectToHome("Erro");
      }).not.toThrow();
    });
  });
});
