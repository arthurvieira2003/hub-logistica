/**
 * Configuração global para os testes
 * Simula o ambiente do navegador e configura mocks necessários
 */

// Simular window e document globalmente
global.window = global;
global.document = {
  cookie: "",
  createElement: jest.fn(() => ({
    textContent: "",
    innerHTML: "",
    setAttribute: jest.fn(),
    getAttribute: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(() => []),
    appendChild: jest.fn(),
    removeChild: jest.fn(),
  })),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(() => []),
  getElementById: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn(),
  },
  readyState: "complete",
};

// Simular localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

global.localStorage = localStorageMock;

// Simular sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

global.sessionStorage = sessionStorageMock;

// Simular fetch global
global.fetch = jest.fn();

// Simular URLSearchParams
if (typeof global.URLSearchParams === "undefined") {
  global.URLSearchParams = class URLSearchParams {
    constructor(search = "") {
      this.params = new Map();
      if (search && typeof search === "string") {
        search.split("&").forEach((param) => {
          const [key, value] = param.split("=");
          if (key) this.params.set(key, value || "");
        });
      } else if (search && typeof search === "object") {
        // Suportar objeto ou Map
        const entries =
          search instanceof Map ? search.entries() : Object.entries(search);
        for (const [key, value] of entries) {
          this.params.set(key, value);
        }
      }
    }

    get(key) {
      return this.params.get(key) || null;
    }

    set(key, value) {
      this.params.set(key, value);
    }

    delete(key) {
      this.params.delete(key);
    }

    has(key) {
      return this.params.has(key);
    }

    *[Symbol.iterator]() {
      yield* this.params;
    }
  };
}

// Simular URL
global.URL = class URL {
  constructor(url, base) {
    // Se url é um objeto (como window.location), usar href
    let urlString;
    if (url && typeof url === "object") {
      urlString = url.href || String(url);
    } else {
      urlString = String(url || "");
    }

    this.href = urlString;
    this.searchParams = new global.URLSearchParams();
    this.pathname = urlString.split("?")[0];
    this.search = urlString.includes("?") ? urlString.split("?")[1] : "";
  }
};

// Simular navigator.clipboard
global.navigator = {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve("")),
  },
};

// Mock para console methods para evitar logs nos testes
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Limpar mocks antes de cada teste
beforeEach(() => {
  // Resetar cookies - precisa limpar todos os cookies primeiro
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  }
  document.cookie = "";

  // Limpar localStorage e sessionStorage
  localStorage.clear();
  sessionStorage.clear();

  // Limpar fetch mocks
  fetch.mockClear();

  // Limpar console mocks
  jest.clearAllMocks();

  // Resetar namespaces globais
  global.window = { ...global };
  global.window.location = {
    href: "http://localhost:3060",
    pathname: "/",
    search: "",
    origin: "http://localhost:3060",
  };

  global.window.history = {
    replaceState: jest.fn(),
    pushState: jest.fn(),
  };

  // Resetar navigator.clipboard
  if (global.navigator && global.navigator.clipboard) {
    global.navigator.clipboard.writeText.mockClear();
    global.navigator.clipboard.writeText.mockResolvedValue(undefined);
  }
});

// Helper para carregar módulos JavaScript
global.loadModule = (modulePath) => {
  const fs = require("fs");
  const path = require("path");
  const fullPath = path.join(
    __dirname,
    "..",
    "public",
    "javascripts",
    modulePath
  );
  const code = fs.readFileSync(fullPath, "utf8");
  eval(code);
};
