/**
 * Utilitários para formatação e validação
 * Contém funções auxiliares para formatação de dados, validações e cálculos
 */

// Namespace para utilitários
window.RastreamentoUtils = window.RastreamentoUtils || {};

/**
 * Formata data no formato DD/MM/YYYY
 * @param {string} dataString - Data em formato YYYY-MM-DD ou DD/MM/YYYY
 * @returns {string} Data formatada ou "-" se inválida
 */
window.RastreamentoUtils.formatarData = function (dataString) {
  if (!dataString) return "-";

  // Se já estiver no formato DD/MM/YYYY, retornar como está
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataString)) {
    return dataString;
  }

  // Converter de YYYY-MM-DD para DD/MM/YYYY
  try {
    // Remover a parte da hora se existir
    const dataParte = dataString.split(" ")[0];
    const [ano, mes, dia] = dataParte.split("-");

    if (!ano || !mes || !dia) return dataString;

    return `${dia}/${mes}/${ano}`;
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return dataString;
  }
};

/**
 * Formata data e hora
 * @param {string} dataString - Data e hora em formato ISO
 * @returns {string} Data e hora formatadas
 */
window.RastreamentoUtils.formatarDataHora = function (dataString) {
  if (!dataString) return "";

  const partes = dataString.split(" ");
  if (partes.length < 2)
    return window.RastreamentoUtils.formatarData(dataString);

  return `${window.RastreamentoUtils.formatarData(
    partes[0]
  )} ${partes[1].substring(0, 5)}`;
};

/**
 * Obtém o token de autenticação dos cookies
 * @returns {string|null} Token de autenticação ou null se não encontrado
 */
window.RastreamentoUtils.obterToken = function () {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
};

/**
 * Verifica se uma nota está atrasada
 * @param {Object} nota - Objeto da nota com previsaoEntrega
 * @returns {boolean} True se a nota está atrasada
 */
window.RastreamentoUtils.verificarNotaAtrasada = function (nota) {
  if (nota.status === "Entregue") return false;

  const hoje = new Date();
  let previsao;

  // Tentar criar a data de previsão, tratando diferentes formatos
  try {
    // Se a data já está no formato DD/MM/YYYY, converter para Date
    if (nota.previsaoEntrega && nota.previsaoEntrega.includes("/")) {
      const [dia, mes, ano] = nota.previsaoEntrega.split("/");
      previsao = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    } else if (nota.previsaoEntrega && nota.previsaoEntrega.includes("-")) {
      // Se está no formato YYYY-MM-DD, usar diretamente (evita problemas de timezone)
      const [ano, mes, dia] = nota.previsaoEntrega.split("-");
      previsao = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    } else {
      // Tentar criar a data diretamente
      previsao = new Date(nota.previsaoEntrega);
    }

    // Verificar se a data é válida
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

  // Resetar as horas para comparar apenas as datas
  hoje.setHours(0, 0, 0, 0);
  previsao.setHours(0, 0, 0, 0);

  // Uma nota só está atrasada se a data de hoje for posterior à data de previsão
  const isAtrasada = hoje > previsao;

  return isAtrasada;
};

/**
 * Calcula dias de atraso de uma nota
 * @param {string} dataPrevisao - Data de previsão da entrega
 * @returns {number} Número de dias de atraso (0 se não está atrasada)
 */
window.RastreamentoUtils.calcularDiasAtraso = function (dataPrevisao) {
  const hoje = new Date();
  let previsao;

  // Tentar criar a data de previsão, tratando diferentes formatos
  try {
    // Se a data já está no formato DD/MM/YYYY, converter para Date
    if (dataPrevisao && dataPrevisao.includes("/")) {
      const [dia, mes, ano] = dataPrevisao.split("/");
      previsao = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    } else if (dataPrevisao && dataPrevisao.includes("-")) {
      // Se está no formato YYYY-MM-DD, usar diretamente (evita problemas de timezone)
      const [ano, mes, dia] = dataPrevisao.split("-");
      previsao = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    } else {
      // Tentar criar a data diretamente
      previsao = new Date(dataPrevisao);
    }

    // Verificar se a data é válida
    if (isNaN(previsao.getTime())) {
      console.warn(`Data de previsão inválida: ${dataPrevisao}`);
      return 0;
    }
  } catch (error) {
    console.warn(`Erro ao processar data de previsão: ${dataPrevisao}`, error);
    return 0;
  }

  // Resetar as horas para comparar apenas as datas
  hoje.setHours(0, 0, 0, 0);
  previsao.setHours(0, 0, 0, 0);

  // Calcular a diferença em dias (apenas se a data já passou)
  if (hoje > previsao) {
    const diffTime = hoje - previsao;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  return 0; // Se não está atrasada, retorna 0 dias
};

/**
 * Renderiza o logo da transportadora (imagem ou ícone FontAwesome)
 * @param {Object} transportadora - Objeto da transportadora com logo
 * @returns {string} HTML do logo
 */
window.RastreamentoUtils.renderizarLogoTransportadora = function (
  transportadora
) {
  if (
    transportadora.logo.startsWith("fas ") ||
    transportadora.logo.startsWith("far ") ||
    transportadora.logo.startsWith("fab ")
  ) {
    // É um ícone FontAwesome
    return `<i class="${transportadora.logo}" style="font-size: 20px; color: #247675;"></i>`;
  } else {
    // É uma imagem
    return `<img src="${transportadora.logo}" alt="${transportadora.nome}">`;
  }
};

/**
 * Obtém a cor da borda da transportadora
 * @param {string} nomeTransportadora - Nome da transportadora
 * @returns {string} Cor da borda em formato rgba
 */
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

  return coresTransportadoras[nomeTransportadora] || "rgba(2, 118, 116, 0.3)"; // Cor padrão
};
