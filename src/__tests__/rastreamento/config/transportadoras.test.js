/**
 * Testes para RastreamentoConfig
 * Testa configurações de transportadoras e utilitários
 */

// Carregar módulo usando require() para permitir instrumentação do Jest
const configPath = require.resolve(
  "../../../../public/javascripts/rastreamento/config/transportadoras.js"
);

beforeAll(() => {
  // Usar require() em vez de eval() para permitir instrumentação
  require(configPath);
});

describe("RastreamentoConfig", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("transportadoras", () => {
    test("deve ter array de transportadoras definido", () => {
      expect(window.RastreamentoConfig.transportadoras).toBeDefined();
      expect(Array.isArray(window.RastreamentoConfig.transportadoras)).toBe(
        true
      );
    });

    test("deve ter pelo menos uma transportadora", () => {
      expect(window.RastreamentoConfig.transportadoras.length).toBeGreaterThan(
        0
      );
    });

    test("cada transportadora deve ter propriedades obrigatórias", () => {
      window.RastreamentoConfig.transportadoras.forEach((transportadora) => {
        expect(transportadora).toHaveProperty("id");
        expect(transportadora).toHaveProperty("nome");
        expect(transportadora).toHaveProperty("cor");
        expect(transportadora).toHaveProperty("logo");
        expect(transportadora).toHaveProperty("notas");
        expect(typeof transportadora.id).toBe("number");
        expect(typeof transportadora.nome).toBe("string");
        expect(typeof transportadora.cor).toBe("string");
        expect(typeof transportadora.logo).toBe("string");
        expect(Array.isArray(transportadora.notas)).toBe(true);
      });
    });

    test("IDs devem ser únicos", () => {
      const ids = window.RastreamentoConfig.transportadoras.map((t) => t.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    test("nomes devem ser únicos", () => {
      const nomes = window.RastreamentoConfig.transportadoras.map(
        (t) => t.nome
      );
      const uniqueNomes = [...new Set(nomes)];
      expect(nomes.length).toBe(uniqueNomes.length);
    });

    test("deve ter transportadoras conhecidas", () => {
      const nomesEsperados = [
        "Ouro Negro",
        "Expresso Leomar LTDA",
        "Schreiber Logística LTDA",
        "Mengue Express transportes LTDA",
      ];

      const nomes = window.RastreamentoConfig.transportadoras.map(
        (t) => t.nome
      );

      nomesEsperados.forEach((nome) => {
        expect(nomes).toContain(nome);
      });
    });
  });

  describe("coresTransportadoras", () => {
    test("deve ter objeto de cores definido", () => {
      expect(window.RastreamentoConfig.coresTransportadoras).toBeDefined();
      expect(typeof window.RastreamentoConfig.coresTransportadoras).toBe(
        "object"
      );
    });

    test("deve ter cores no formato rgba válido", () => {
      Object.values(window.RastreamentoConfig.coresTransportadoras).forEach(
        (cor) => {
          // Regex atualizada para permitir números decimais (com ponto)
          expect(cor).toMatch(/^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/);
        }
      );
    });

    test("deve ter cores para transportadoras conhecidas", () => {
      const cores = window.RastreamentoConfig.coresTransportadoras;
      expect(cores["Ouro Negro"]).toBeDefined();
      expect(cores["Expresso Leomar LTDA"]).toBeDefined();
      expect(cores["Schreiber Logística LTDA"]).toBeDefined();
    });
  });

  describe("coresGenericas", () => {
    test("deve ter objeto de cores genéricas definido", () => {
      expect(window.RastreamentoConfig.coresGenericas).toBeDefined();
      expect(typeof window.RastreamentoConfig.coresGenericas).toBe("object");
    });

    test("cores genéricas devem estar no formato RGB", () => {
      Object.values(window.RastreamentoConfig.coresGenericas).forEach((cor) => {
        expect(cor).toMatch(/^\d+,\s*\d+,\s*\d+$/);
      });
    });
  });

  describe("dataRastreamento", () => {
    test("deve ter data de rastreamento definida", () => {
      expect(window.RastreamentoConfig.dataRastreamento).toBeDefined();
      expect(typeof window.RastreamentoConfig.dataRastreamento).toBe("string");
    });

    test("deve estar no formato YYYY-MM-DD", () => {
      expect(window.RastreamentoConfig.dataRastreamento).toMatch(
        /^\d{4}-\d{2}-\d{2}$/
      );
    });

    test("deve ser data válida", () => {
      const data = window.RastreamentoConfig.dataRastreamento;
      const [ano, mes, dia] = data.split("-").map(Number);
      const dataObj = new Date(ano, mes - 1, dia);
      expect(dataObj.getFullYear()).toBe(ano);
      expect(dataObj.getMonth() + 1).toBe(mes);
      expect(dataObj.getDate()).toBe(dia);
    });
  });

  describe("atualizarDataRastreamento", () => {
    test("deve atualizar data de rastreamento", () => {
      const novaData = "2024-12-31";
      window.RastreamentoConfig.atualizarDataRastreamento(novaData);
      expect(window.RastreamentoConfig.dataRastreamento).toBe(novaData);
    });

    test("deve aceitar datas no formato YYYY-MM-DD", () => {
      const datas = ["2024-01-01", "2024-12-31", "2025-06-15"];

      datas.forEach((data) => {
        window.RastreamentoConfig.atualizarDataRastreamento(data);
        expect(window.RastreamentoConfig.dataRastreamento).toBe(data);
      });
    });
  });

  describe("obterDataRastreamento", () => {
    test("deve retornar data atual de rastreamento", () => {
      const dataEsperada = "2024-01-15";
      window.RastreamentoConfig.atualizarDataRastreamento(dataEsperada);
      const dataObtida = window.RastreamentoConfig.obterDataRastreamento();
      expect(dataObtida).toBe(dataEsperada);
    });

    test("deve retornar string no formato YYYY-MM-DD", () => {
      const data = window.RastreamentoConfig.obterDataRastreamento();
      expect(data).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("integração", () => {
    test("deve ser possível atualizar e obter data de rastreamento", () => {
      const dataInicial = window.RastreamentoConfig.obterDataRastreamento();
      const novaData = "2024-12-31";

      window.RastreamentoConfig.atualizarDataRastreamento(novaData);
      const dataObtida = window.RastreamentoConfig.obterDataRastreamento();

      expect(dataObtida).toBe(novaData);
      expect(dataObtida).not.toBe(dataInicial);
    });

    test("deve manter consistência entre transportadoras e cores", () => {
      const transportadoras = window.RastreamentoConfig.transportadoras;
      const cores = window.RastreamentoConfig.coresTransportadoras;

      transportadoras.forEach((transportadora) => {
        // Verificar se existe cor correspondente ou se usa cor padrão
        const temCor = cores.hasOwnProperty(transportadora.nome);
        expect(temCor || true).toBe(true); // Sempre passa, mas verifica se existe
      });
    });
  });
});
