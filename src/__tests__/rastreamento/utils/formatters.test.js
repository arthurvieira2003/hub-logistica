const formattersPath = require.resolve(
  "../../../../public/javascripts/rastreamento/utils/formatters.js"
);

beforeAll(() => {
  require(formattersPath);
});

describe("RastreamentoUtils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.cookie = "";
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-15"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("formatarData", () => {
    test("deve formatar data de YYYY-MM-DD para DD/MM/YYYY", () => {
      expect(window.RastreamentoUtils.formatarData("2024-01-15")).toBe(
        "15/01/2024"
      );
      expect(window.RastreamentoUtils.formatarData("2024-12-31")).toBe(
        "31/12/2024"
      );
      expect(window.RastreamentoUtils.formatarData("2024-03-05")).toBe(
        "05/03/2024"
      );
    });

    test("deve retornar data já formatada como está", () => {
      expect(window.RastreamentoUtils.formatarData("15/01/2024")).toBe(
        "15/01/2024"
      );
      expect(window.RastreamentoUtils.formatarData("31/12/2024")).toBe(
        "31/12/2024"
      );
    });

    test("deve remover parte da hora se existir", () => {
      expect(window.RastreamentoUtils.formatarData("2024-01-15 10:30:00")).toBe(
        "15/01/2024"
      );
      expect(window.RastreamentoUtils.formatarData("2024-12-31 23:59:59")).toBe(
        "31/12/2024"
      );
    });

    test('deve retornar "-" para data vazia ou inválida', () => {
      expect(window.RastreamentoUtils.formatarData("")).toBe("-");
      expect(window.RastreamentoUtils.formatarData(null)).toBe("-");
      expect(window.RastreamentoUtils.formatarData(undefined)).toBe("-");
    });

    test("deve retornar data original se não conseguir formatar", () => {
      const invalidDate = "data-invalida";
      const result = window.RastreamentoUtils.formatarData(invalidDate);
      expect(result).toBe(invalidDate);
    });
  });

  describe("formatarDataHora", () => {
    test("deve formatar data e hora corretamente", () => {
      const result = window.RastreamentoUtils.formatarDataHora(
        "2024-01-15 10:30:00"
      );
      expect(result).toContain("15/01/2024");
      expect(result).toContain("10:30");
    });

    test("deve retornar apenas data formatada se não houver hora", () => {
      const result = window.RastreamentoUtils.formatarDataHora("2024-01-15");
      expect(result).toBe("15/01/2024");
    });

    test("deve retornar string vazia para data vazia", () => {
      expect(window.RastreamentoUtils.formatarDataHora("")).toBe("");
      expect(window.RastreamentoUtils.formatarDataHora(null)).toBe("");
      expect(window.RastreamentoUtils.formatarDataHora(undefined)).toBe("");
    });
  });

  describe("obterToken", () => {
    test("deve extrair token dos cookies", () => {
      document.cookie = "token=test-token-123; other=value";
      const token = window.RastreamentoUtils.obterToken();
      expect(token).toBe("test-token-123");
    });

    test("deve retornar null quando token não existe", () => {
      document.cookie = "";
      document.cookie = "other=value";
      const token = window.RastreamentoUtils.obterToken();
      expect(token).toBeFalsy();
    });
  });

  describe("verificarNotaAtrasada", () => {
    test("deve retornar false para nota entregue", () => {
      const nota = {
        numero: "123",
        status: "Entregue",
        previsaoEntrega: "2024-01-10",
      };
      expect(window.RastreamentoUtils.verificarNotaAtrasada(nota)).toBe(false);
    });

    test("deve retornar true para nota atrasada (formato YYYY-MM-DD)", () => {
      const nota = {
        numero: "123",
        status: "Em trânsito",
        previsaoEntrega: "2024-01-10",
      };
      expect(window.RastreamentoUtils.verificarNotaAtrasada(nota)).toBe(true);
    });

    test("deve retornar true para nota atrasada (formato DD/MM/YYYY)", () => {
      const nota = {
        numero: "123",
        status: "Em trânsito",
        previsaoEntrega: "10/01/2024",
      };
      expect(window.RastreamentoUtils.verificarNotaAtrasada(nota)).toBe(true);
    });

    test("deve retornar false para nota não atrasada", () => {
      const nota = {
        numero: "123",
        status: "Em trânsito",
        previsaoEntrega: "2024-01-20",
      };
      expect(window.RastreamentoUtils.verificarNotaAtrasada(nota)).toBe(false);
    });

    test("deve retornar false para nota com previsão hoje", () => {
      const nota = {
        numero: "123",
        status: "Em trânsito",
        previsaoEntrega: "2024-01-15",
      };
      expect(window.RastreamentoUtils.verificarNotaAtrasada(nota)).toBe(false);
    });

    test("deve retornar false para data inválida", () => {
      const nota = {
        numero: "123",
        status: "Em trânsito",
        previsaoEntrega: "data-invalida",
      };
      expect(window.RastreamentoUtils.verificarNotaAtrasada(nota)).toBe(false);
    });
  });

  describe("calcularDiasAtraso", () => {
    test("deve calcular dias de atraso corretamente (formato YYYY-MM-DD)", () => {
      const hoje = new Date();
      const previsao = new Date(hoje);
      previsao.setDate(previsao.getDate() - 5);
      const dataPrevisao = previsao.toISOString().split("T")[0];

      const diasAtraso =
        window.RastreamentoUtils.calcularDiasAtraso(dataPrevisao);
      expect(diasAtraso).toBeGreaterThanOrEqual(4);
      expect(diasAtraso).toBeLessThanOrEqual(5);
    });

    test("deve calcular dias de atraso corretamente (formato DD/MM/YYYY)", () => {
      const hoje = new Date();
      const previsao = new Date(hoje);
      previsao.setDate(previsao.getDate() - 5);
      const dia = String(previsao.getDate()).padStart(2, "0");
      const mes = String(previsao.getMonth() + 1).padStart(2, "0");
      const ano = previsao.getFullYear();
      const dataPrevisao = `${dia}/${mes}/${ano}`;

      const diasAtraso =
        window.RastreamentoUtils.calcularDiasAtraso(dataPrevisao);
      expect(diasAtraso).toBeGreaterThanOrEqual(4);
      expect(diasAtraso).toBeLessThanOrEqual(5);
    });

    test("deve retornar 0 para nota não atrasada", () => {
      const diasAtraso =
        window.RastreamentoUtils.calcularDiasAtraso("2024-01-20");
      expect(diasAtraso).toBe(0);
    });

    test("deve retornar 0 para data de hoje", () => {
      const diasAtraso =
        window.RastreamentoUtils.calcularDiasAtraso("2024-01-15");
      expect(diasAtraso).toBe(0);
    });

    test("deve retornar 0 para data inválida", () => {
      const diasAtraso =
        window.RastreamentoUtils.calcularDiasAtraso("data-invalida");
      expect(diasAtraso).toBe(0);
    });

    test("deve calcular corretamente para 1 dia de atraso", () => {
      const hoje = new Date();
      const previsao = new Date(hoje);
      previsao.setDate(previsao.getDate() - 1);
      const dataPrevisao = previsao.toISOString().split("T")[0];

      const diasAtraso =
        window.RastreamentoUtils.calcularDiasAtraso(dataPrevisao);
      expect(diasAtraso).toBeGreaterThanOrEqual(0);
      expect(diasAtraso).toBeLessThanOrEqual(1);
    });

    test("deve calcular corretamente para 30 dias de atraso", () => {
      const hoje = new Date();
      const previsao = new Date(hoje);
      previsao.setDate(previsao.getDate() - 30);
      const dataPrevisao = previsao.toISOString().split("T")[0];

      const diasAtraso =
        window.RastreamentoUtils.calcularDiasAtraso(dataPrevisao);
      expect(diasAtraso).toBeGreaterThanOrEqual(29);
      expect(diasAtraso).toBeLessThanOrEqual(30);
    });
  });

  describe("renderizarLogoTransportadora", () => {
    test("deve renderizar ícone FontAwesome", () => {
      const transportadora = {
        nome: "Test",
        logo: "fas fa-truck",
      };
      const html =
        window.RastreamentoUtils.renderizarLogoTransportadora(transportadora);
      expect(html).toContain('<i class="fas fa-truck"');
      expect(html).toContain("font-size: 20px");
    });

    test("deve renderizar imagem quando não é FontAwesome", () => {
      const transportadora = {
        nome: "Test",
        logo: "../assets/images/transportadoras/test.png",
      };
      const html =
        window.RastreamentoUtils.renderizarLogoTransportadora(transportadora);
      expect(html).toContain('<img src="');
      expect(html).toContain(transportadora.logo);
      expect(html).toContain(`alt="${transportadora.nome}"`);
    });

    test("deve reconhecer diferentes prefixos FontAwesome", () => {
      const prefixes = ["fas ", "far ", "fab "];

      prefixes.forEach((prefix) => {
        const transportadora = {
          nome: "Test",
          logo: `${prefix}fa-icon`,
        };
        const html =
          window.RastreamentoUtils.renderizarLogoTransportadora(transportadora);
        expect(html).toContain('<i class="');
      });
    });
  });

  describe("obterCorBordaTransportadora", () => {
    test("deve retornar cor específica para transportadora conhecida", () => {
      expect(
        window.RastreamentoUtils.obterCorBordaTransportadora("Ouro Negro")
      ).toBe("rgba(255, 204, 0, 0.3)");
      expect(
        window.RastreamentoUtils.obterCorBordaTransportadora(
          "Expresso Leomar LTDA"
        )
      ).toBe("rgba(0, 52, 150, 0.3)");
    });

    test("deve retornar cor padrão para transportadora desconhecida", () => {
      const cor = window.RastreamentoUtils.obterCorBordaTransportadora(
        "Transportadora Desconhecida"
      );
      expect(cor).toBe("rgba(2, 118, 116, 0.3)");
    });

    test("deve retornar todas as cores conhecidas corretamente", () => {
      const transportadoras = [
        { nome: "Ouro Negro", cor: "rgba(255, 204, 0, 0.3)" },
        { nome: "Expresso Leomar LTDA", cor: "rgba(0, 52, 150, 0.3)" },
        { nome: "Schreiber Logística LTDA", cor: "rgba(21, 50, 127, 0.3)" },
        {
          nome: "Mengue Express transportes LTDA",
          cor: "rgba(255, 101, 38, 0.3)",
        },
        {
          nome: "Transportes Expresso Santa Catarina LTDA",
          cor: "rgba(2, 118, 116, 0.3)",
        },
        {
          nome: "Expresso Princesa Dos Campos S/A",
          cor: "rgba(14, 88, 46, 0.3)",
        },
      ];

      transportadoras.forEach(({ nome, cor }) => {
        expect(window.RastreamentoUtils.obterCorBordaTransportadora(nome)).toBe(
          cor
        );
      });
    });
  });
});
