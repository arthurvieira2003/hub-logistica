/**
 * Testes para Helpers
 * Testa funções utilitárias gerais
 */

// Carregar módulo usando require() para permitir instrumentação do Jest
// O Jest precisa que o arquivo seja carregado via require() para rastrear cobertura
const helpersPath = require.resolve(
  "../../../public/javascripts/utils/helpers.js"
);

// Carregar o módulo - o Jest irá instrumentar automaticamente
beforeAll(() => {
  // Usar require() em vez de eval() para permitir instrumentação
  // O Jest transformer customizado irá processar o arquivo antes de executá-lo
  require(helpersPath);
});

describe("Helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getInitials", () => {
    test("deve retornar iniciais de nome completo", () => {
      expect(window.Helpers.getInitials("João Silva")).toBe("JS");
      expect(window.Helpers.getInitials("Maria Santos Oliveira")).toBe("MO");
    });

    test("deve retornar primeira letra quando há apenas um nome", () => {
      expect(window.Helpers.getInitials("João")).toBe("J");
    });

    test("deve retornar string vazia quando nome está vazio", () => {
      expect(window.Helpers.getInitials("")).toBe("");
      expect(window.Helpers.getInitials(null)).toBe("");
      expect(window.Helpers.getInitials(undefined)).toBe("");
    });

    test("deve converter para maiúsculas", () => {
      expect(window.Helpers.getInitials("joão silva")).toBe("JS");
    });
  });

  describe("formatDate", () => {
    test("deve formatar data corretamente", () => {
      const date = new Date("2024-01-15");
      const formatted = window.Helpers.formatDate(date);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe("string");
    });

    test("deve retornar string vazia para data inválida", () => {
      expect(window.Helpers.formatDate(null)).toBe("");
      expect(window.Helpers.formatDate(undefined)).toBe("");
      expect(window.Helpers.formatDate("")).toBe("");
    });

    test("deve usar locale pt-BR por padrão", () => {
      const date = new Date("2024-01-15");
      const formatted = window.Helpers.formatDate(date);
      // Formato brasileiro geralmente é DD/MM/YYYY
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe("formatCurrency", () => {
    test("deve formatar moeda corretamente", () => {
      const formatted = window.Helpers.formatCurrency(1234.56);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe("string");
      expect(formatted).toContain("1.234");
    });

    test("deve retornar string vazia para valor inválido", () => {
      expect(window.Helpers.formatCurrency(null)).toBe("");
      expect(window.Helpers.formatCurrency(undefined)).toBe("");
      expect(window.Helpers.formatCurrency(0)).toBe("");
    });

    test("deve formatar valores grandes corretamente", () => {
      const formatted = window.Helpers.formatCurrency(1000000);
      expect(formatted).toBeTruthy();
    });
  });

  describe("debounce", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test("deve executar função apenas uma vez após delay", () => {
      const mockFn = jest.fn();
      const debouncedFn = window.Helpers.debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test("deve passar argumentos corretamente", () => {
      const mockFn = jest.fn();
      const debouncedFn = window.Helpers.debounce(mockFn, 100);

      debouncedFn("arg1", "arg2");

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
    });
  });

  describe("throttle", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test("deve executar função apenas uma vez no período", () => {
      const mockFn = jest.fn();
      const throttledFn = window.Helpers.throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("generateId", () => {
    test("deve gerar ID único", () => {
      const id1 = window.Helpers.generateId();
      const id2 = window.Helpers.generateId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    test("deve usar prefixo padrão", () => {
      const id = window.Helpers.generateId();
      expect(id).toContain("id-");
    });

    test("deve usar prefixo customizado", () => {
      const id = window.Helpers.generateId("custom");
      expect(id).toContain("custom-");
    });
  });

  describe("elementExists", () => {
    test("deve retornar true quando elemento existe", () => {
      const mockElement = { tagName: "DIV" };
      document.querySelector = jest.fn(() => mockElement);

      const result = window.Helpers.elementExists("#test");
      expect(result).toBe(true);
      expect(document.querySelector).toHaveBeenCalledWith("#test");
    });

    test("deve retornar false quando elemento não existe", () => {
      document.querySelector = jest.fn(() => null);

      const result = window.Helpers.elementExists("#test");
      expect(result).toBe(false);
    });
  });

  describe("isValidEmail", () => {
    test("deve retornar true para emails válidos", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.com",
        "test123@test-domain.com",
      ];

      validEmails.forEach((email) => {
        expect(window.Helpers.isValidEmail(email)).toBe(true);
      });
    });

    test("deve retornar false para emails inválidos", () => {
      const invalidEmails = [
        "invalid-email",
        "@example.com",
        "test@",
        "test @example.com",
        "test@example",
        "",
      ];

      invalidEmails.forEach((email) => {
        expect(window.Helpers.isValidEmail(email)).toBe(false);
      });
    });
  });

  describe("sanitizeHTML", () => {
    test("deve sanitizar HTML removendo tags", () => {
      const html = '<script>alert("xss")</script>';
      const sanitized = window.Helpers.sanitizeHTML(html);
      expect(sanitized).not.toContain("<script>");
      expect(sanitized).toContain('alert("xss")');
    });

    test("deve preservar texto simples", () => {
      const text = "Texto simples";
      const sanitized = window.Helpers.sanitizeHTML(text);
      expect(sanitized).toBe("Texto simples");
    });
  });

  describe("getUrlParams", () => {
    beforeEach(() => {
      // Resetar window.location
      delete window.location;
      window.location = {
        search: "",
        href: "http://localhost:3060",
        pathname: "/",
        origin: "http://localhost:3060",
      };
    });

    test("deve retornar objeto vazio quando não há parâmetros", () => {
      window.location.search = "";
      // Mock URLSearchParams para retornar objeto vazio
      const originalUrlSearchParams = global.URLSearchParams;
      global.URLSearchParams = jest.fn(() => ({
        [Symbol.iterator]: function* () {},
      }));

      const params = window.Helpers.getUrlParams();
      expect(params).toEqual({});

      global.URLSearchParams = originalUrlSearchParams;
    });

    test("deve extrair parâmetros da URL", () => {
      // Mock URLSearchParams com parâmetros
      const originalUrlSearchParams = global.URLSearchParams;
      global.URLSearchParams = jest.fn(() => ({
        [Symbol.iterator]: function* () {
          yield ["key1", "value1"];
          yield ["key2", "value2"];
        },
      }));

      const params = window.Helpers.getUrlParams();
      expect(params).toEqual({ key1: "value1", key2: "value2" });

      global.URLSearchParams = originalUrlSearchParams;
    });
  });

  describe("copyToClipboard", () => {
    beforeEach(() => {
      // Resetar o mock do clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText.mockClear();
        navigator.clipboard.writeText.mockResolvedValue(undefined);
      }
    });

    test("deve copiar texto para clipboard", async () => {
      const text = "Texto para copiar";
      // Garantir que navigator.clipboard existe
      if (!navigator.clipboard) {
        navigator.clipboard = {
          writeText: jest.fn(() => Promise.resolve()),
        };
      }
      const result = await window.Helpers.copyToClipboard(text);
      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
    });

    test("deve retornar false em caso de erro", async () => {
      // Garantir que navigator.clipboard existe
      if (!navigator.clipboard) {
        navigator.clipboard = {
          writeText: jest.fn(() => Promise.reject(new Error("Erro"))),
        };
      } else {
        navigator.clipboard.writeText.mockRejectedValueOnce(new Error("Erro"));
      }
      const result = await window.Helpers.copyToClipboard("texto");
      expect(result).toBe(false);
    });
  });
});
