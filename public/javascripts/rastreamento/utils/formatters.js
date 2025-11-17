window.RastreamentoUtils = window.RastreamentoUtils || {};

window.RastreamentoUtils.formatarData = function (dataString) {
  if (!dataString) return "-";

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataString)) {
    return dataString;
  }

  try {
    const dataParte = dataString.split(" ")[0];
    const [ano, mes, dia] = dataParte.split("-");

    if (!ano || !mes || !dia) return dataString;

    return `${dia}/${mes}/${ano}`;
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return dataString;
  }
};

window.RastreamentoUtils.formatarDataHora = function (dataString) {
  if (!dataString) return "";

  const partes = dataString.split(" ");
  if (partes.length < 2)
    return window.RastreamentoUtils.formatarData(dataString);

  return `${window.RastreamentoUtils.formatarData(
    partes[0]
  )} ${partes[1].substring(0, 5)}`;
};

window.RastreamentoUtils.obterToken = function () {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
};

window.RastreamentoUtils.verificarNotaAtrasada = function (nota) {
  if (nota.status === "Entregue") return false;

  const hoje = new Date();
  let previsao;

  try {
    if (nota.previsaoEntrega && nota.previsaoEntrega.includes("/")) {
      const [dia, mes, ano] = nota.previsaoEntrega.split("/");
      previsao = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    } else if (nota.previsaoEntrega && nota.previsaoEntrega.includes("-")) {
      const [ano, mes, dia] = nota.previsaoEntrega.split("-");
      previsao = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    } else {
      previsao = new Date(nota.previsaoEntrega);
    }

    if (isNaN(previsao.getTime())) {
      console.warn(
        `Data de previsão inválida para nota ${nota.numero}: ${nota.previsaoEntrega}`
      );
      return false;
    }
  } catch (error) {
    console.warn(
      `Erro ao processar data de previsão para nota ${nota.numero}: ${nota.previsaoEntrega}`,
      error
    );
    return false;
  }

  hoje.setHours(0, 0, 0, 0);
  previsao.setHours(0, 0, 0, 0);

  const isAtrasada = hoje > previsao;

  return isAtrasada;
};

window.RastreamentoUtils.calcularDiasAtraso = function (dataPrevisao) {
  const hoje = new Date();
  let previsao;

  try {
    if (dataPrevisao && dataPrevisao.includes("/")) {
      const [dia, mes, ano] = dataPrevisao.split("/");
      previsao = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    } else if (dataPrevisao && dataPrevisao.includes("-")) {
      const [ano, mes, dia] = dataPrevisao.split("-");
      previsao = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    } else {
      previsao = new Date(dataPrevisao);
    }

    if (isNaN(previsao.getTime())) {
      console.warn(`Data de previsão inválida: ${dataPrevisao}`);
      return 0;
    }
  } catch (error) {
    console.warn(`Erro ao processar data de previsão: ${dataPrevisao}`, error);
    return 0;
  }

  hoje.setHours(0, 0, 0, 0);
  previsao.setHours(0, 0, 0, 0);

  if (hoje > previsao) {
    const diffTime = hoje - previsao;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  return 0;
};

window.RastreamentoUtils.renderizarLogoTransportadora = function (
  transportadora
) {
  if (
    transportadora.logo.startsWith("fas ") ||
    transportadora.logo.startsWith("far ") ||
    transportadora.logo.startsWith("fab ")
  ) {
    return `<i class="${transportadora.logo}" style="font-size: 20px; color: #247675;"></i>`;
  } else {
    return `<img src="${transportadora.logo}" alt="${transportadora.nome}">`;
  }
};

window.RastreamentoUtils.obterCorBordaTransportadora = function (
  nomeTransportadora
) {
  const coresTransportadoras = {
    "Ouro Negro": "rgba(255, 204, 0, 0.3)",
    "Expresso Leomar LTDA": "rgba(0, 52, 150, 0.3)",
    "Schreiber Logística LTDA": "rgba(21, 50, 127, 0.3)",
    "Mengue Express transportes LTDA": "rgba(255, 101, 38, 0.3)",
    "Transportes Expresso Santa Catarina LTDA": "rgba(2, 118, 116, 0.3)",
    "Expresso Princesa Dos Campos S/A": "rgba(14, 88, 46, 0.3)",
  };

  return coresTransportadoras[nomeTransportadora] || "rgba(2, 118, 116, 0.3)";
};
