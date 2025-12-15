window.RastreamentoBuscaAPI = window.RastreamentoBuscaAPI || {};

/**
 * Busca notas no backend por termo de busca
 */
window.RastreamentoBuscaAPI.buscarNotas = async function (termo, limiteDias = 30) {
  try {
    const API_BASE_URL =
      (window.API_CONFIG && window.API_CONFIG.getBaseUrl()) ||
      (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ||
      "https://logistica.copapel.com.br/api";

    const response = await fetch(
      `${API_BASE_URL}/busca?termo=${encodeURIComponent(termo)}&dias=${limiteDias}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar notas: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data;
  } catch (error) {
    console.error("Erro ao buscar notas:", error);
    return [];
  }
};

/**
 * Processa os resultados da busca e retorna no formato esperado
 */
window.RastreamentoBuscaAPI.processarResultadosBusca = function (resultados) {
  const transportadoras = window.RastreamentoConfig.transportadoras;
  const notasProcessadas = [];

  resultados.forEach((item) => {
    // Processa conforme o tipo de transportadora
    const carrierName = item.carrierName?.toLowerCase() || "";

    if (carrierName.includes("ouro negro")) {
      // Processa como Ouro Negro
      const nota = window.RastreamentoAPI.processarNotaOuroNegro(item);
      if (nota) notasProcessadas.push(nota);
    } else if (carrierName.includes("princesa")) {
      // Processa como Princesa
      const nota = window.RastreamentoAPI.processarNotaPrincesa(item);
      if (nota) notasProcessadas.push(nota);
    } else if (carrierName.includes("alfa")) {
      // Processa como Alfa
      const nota = window.RastreamentoAPI.processarNotaAlfa(item);
      if (nota) notasProcessadas.push(nota);
    } else {
      // Processa como Generic
      const nota = window.RastreamentoAPI.processarNotaGeneric(item);
      if (nota) notasProcessadas.push(nota);
    }
  });

  return notasProcessadas;
};

/**
 * Funções auxiliares para processar notas de cada transportadora
 * Reutiliza a lógica existente do dataLoader.js
 */
window.RastreamentoAPI.processarNotaOuroNegro = function (item) {
  const formatOuroNegroDateTime = (dateTime) => {
    try {
      return window.RastreamentoUtils.formatarDataHora(dateTime);
    } catch (error) {
      return dateTime;
    }
  };

  const formatOuroNegroDataHora = (dataOcorrencia, horaOcorrencia) => {
    try {
      return `${window.RastreamentoUtils.formatarData(dataOcorrencia)} ${horaOcorrencia}`;
    } catch (error) {
      return `${dataOcorrencia} ${horaOcorrencia}`;
    }
  };

  const determineOuroNegroStatus = (codigoOcorrencia) => {
    switch (codigoOcorrencia) {
      case "101":
      case "000":
        return "Em processamento";
      case "104":
      case "105":
        return "Em trânsito";
      case "106":
        return "Em rota de entrega";
      case "108":
      case "001":
        return "Entregue";
      default:
        return "Em trânsito";
    }
  };

  const sortOuroNegroOcorrencias = (ocorrencias) => {
    return [...ocorrencias].sort((a, b) => {
      const dataA = new Date(`${a.DATAOCORRENCIA} ${a.HORAOCORRENCIA}`);
      const dataB = new Date(`${b.DATAOCORRENCIA} ${b.HORAOCORRENCIA}`);
      return dataB - dataA;
    });
  };

  const processOuroNegroRastreamento = (item) => {
    if (item.rastreamento && item.rastreamento.code === "400") {
      return {
        status: "Aguardando coleta",
        ultimaAtualizacao: formatOuroNegroDateTime(item.docDate),
        ultimaCidade: item.cidadeOrigem,
        ultimaUF: item.estadoOrigem,
      };
    }

    if (!Array.isArray(item.rastreamento) || item.rastreamento.length === 0) {
      return {
        status: "Aguardando coleta",
        ultimaAtualizacao: formatOuroNegroDateTime(item.docDate),
        ultimaCidade: item.bplName?.split(" - ")[0] || item.cidadeOrigem,
        ultimaUF: "",
      };
    }

    const ocorrencias = sortOuroNegroOcorrencias(item.rastreamento);
    const ultimaOcorrencia = ocorrencias[0];
    const status = determineOuroNegroStatus(ultimaOcorrencia.CODOCORRENCIA);
    const ultimaAtualizacao = formatOuroNegroDataHora(
      ultimaOcorrencia.DATAOCORRENCIA,
      ultimaOcorrencia.HORAOCORRENCIA
    );

    return {
      status,
      ultimaAtualizacao,
      ultimaCidade: ultimaOcorrencia.CIDADE,
      ultimaUF: ultimaOcorrencia.UF,
    };
  };

  const buildOuroNegroNota = (item, rastreamentoData) => {
    const hasRastreamento =
      Array.isArray(item.rastreamento) && item.rastreamento.length > 0;
    return {
      numero: item.serial.toString(),
      status: rastreamentoData.status,
      origem: `${item.cidadeOrigem}, ${item.estadoOrigem}`,
      destino: `${item.cidadeDestino}, ${item.estadoDestino}`,
      docDate: item.docDate.split(" ")[0],
      dataEnvio: hasRastreamento
        ? item.rastreamento[0].EMISSAO
        : item.docDate.split(" ")[0],
      previsaoEntrega: hasRastreamento
        ? item.rastreamento[0].PREVISAO
        : item.docDate.split(" ")[0],
      ultimaAtualizacao: rastreamentoData.ultimaAtualizacao,
      cliente: item.cardName,
      cte: hasRastreamento ? item.rastreamento[0].CTE : "",
      historico: Array.isArray(item.rastreamento) ? item.rastreamento : [],
      transportadoraNome: item.carrierName,
      rastreamento: item.rastreamento,
    };
  };

  const rastreamentoData = processOuroNegroRastreamento(item);
  return buildOuroNegroNota(item, rastreamentoData);
};

window.RastreamentoAPI.processarNotaPrincesa = function (item) {
  const formatPrincesaDateTime = (dateTime) => {
    try {
      return window.RastreamentoUtils.formatarDataHora(dateTime);
    } catch (error) {
      return dateTime;
    }
  };

  const determinePrincesaStatus = (descricao) => {
    if (!descricao) return "Em trânsito";

    const descLower = descricao.toLowerCase();
    if (descLower.includes("entrega") || descLower.includes("entregue")) {
      return "Entregue";
    }
    if (
      descLower.includes("transito") ||
      descLower.includes("transferencia")
    ) {
      return "Em trânsito";
    }
    if (descLower.includes("coleta") || descLower.includes("emissao")) {
      return "Coletado";
    }
    return "Em trânsito";
  };

  const processPrincesaRastreamento = (item) => {
    const defaultStatus = "Aguardando coleta";
    let status = defaultStatus;
    let ultimaAtualizacao = formatPrincesaDateTime(item.docDate);

    if (
      item.rastreamento &&
      item.rastreamento.data &&
      item.rastreamento.data.length > 0
    ) {
      const rastreamentoData = item.rastreamento.data[0];
      if (rastreamentoData.dados && rastreamentoData.dados.length > 0) {
        const ultimoEvento = rastreamentoData.dados[0];
        status = determinePrincesaStatus(ultimoEvento.descricao);
        ultimaAtualizacao = formatPrincesaDateTime(ultimoEvento.data);
      }
    }

    return { status, ultimaAtualizacao };
  };

  const buildPrincesaNota = (item, rastreamentoData) => {
    const previsaoEntrega = item.rastreamento?.data?.[0]?.prev_entrega
      ? item.rastreamento.data[0].prev_entrega.split(" ")[0]
      : item.docDate.split(" ")[0];

    return {
      numero: item.serial.toString(),
      status: rastreamentoData.status,
      origem: `${item.cidadeOrigem}, ${item.estadoOrigem}`,
      destino: `${item.cidadeDestino}, ${item.estadoDestino}`,
      docDate: item.docDate.split(" ")[0],
      dataEnvio: item.docDate.split(" ")[0],
      previsaoEntrega: previsaoEntrega,
      ultimaAtualizacao: rastreamentoData.ultimaAtualizacao,
      cliente: item.cardName,
      cte: "",
      historico: item.rastreamento?.data?.[0]?.dados || [],
      transportadoraNome: item.carrierName,
      rastreamento: item.rastreamento,
      prevEntrega: item.rastreamento?.data?.[0]?.prev_entrega || null,
      diasEntrega: item.rastreamento?.data?.[0]?.dias_entrega || null,
    };
  };

  const rastreamentoData = processPrincesaRastreamento(item);
  return buildPrincesaNota(item, rastreamentoData);
};

window.RastreamentoAPI.processarNotaAlfa = function (item) {
  // Alfa não tem processamento específico ainda
  return {
    numero: item.serial.toString(),
    status: item.rastreamento ? "Em trânsito" : "Aguardando coleta",
    origem: `${item.cidadeOrigem}, ${item.estadoOrigem}`,
    destino: `${item.cidadeDestino}, ${item.estadoDestino}`,
    docDate: item.docDate.split(" ")[0],
    dataEnvio: item.docDate.split(" ")[0],
    previsaoEntrega: item.docDate.split(" ")[0],
    ultimaAtualizacao: item.lastUpdated
      ? window.RastreamentoUtils.formatarDataHora(item.lastUpdated)
      : item.docDate,
    cliente: item.cardName,
    cte: "",
    historico: [],
    transportadoraNome: item.carrierName,
    rastreamento: item.rastreamento,
  };
};

window.RastreamentoAPI.processarNotaGeneric = function (item) {
  // Ajusta o formato do rastreamento se vier do banco
  let rastreamento = item.rastreamento;
  if (
    rastreamento &&
    rastreamento.tracking &&
    Array.isArray(rastreamento.tracking)
  ) {
    rastreamento = {
      success: true,
      tracking: rastreamento.tracking,
    };
  }

  // Usa a mesma lógica do processItem do dataLoader.js
  function hasValidTracking(rastreamento) {
    return (
      rastreamento &&
      rastreamento.success &&
      rastreamento.tracking &&
      rastreamento.tracking.length > 0
    );
  }

  function sortOcorrenciasByDate(ocorrencias) {
    return [...ocorrencias].sort((a, b) => {
      const dataA = new Date(a.data_hora);
      const dataB = new Date(b.data_hora);
      return dataB - dataA;
    });
  }

  function determineStatusFromCodigo(codigoOcorrencia) {
    switch (codigoOcorrencia) {
      case "71":
      case "80":
      case "74":
        return "Em processamento";
      case "82":
      case "76":
      case "83":
      case "77":
      case "84":
        return "Em trânsito";
      case "85":
        return "Em rota de entrega";
      case "01":
        return "Entregue";
      default:
        return "Em trânsito";
    }
  }

  function processTrackingData(item, rastreamento) {
    if (!hasValidTracking(rastreamento)) {
      return {
        status: "Aguardando coleta",
        ultimaAtualizacao: window.RastreamentoUtils.formatarDataHora(
          item.docDate
        ),
        ultimaOcorrencia: null,
      };
    }

    const ocorrencias = sortOcorrenciasByDate(rastreamento.tracking);
    const ultimaOcorrencia = ocorrencias[0];
    const status = determineStatusFromCodigo(ultimaOcorrencia.codigo_ocorrencia);
    const ultimaAtualizacao = window.RastreamentoUtils.formatarDataHora(
      ultimaOcorrencia.data_hora
    );

    return {
      status,
      ultimaAtualizacao,
      ultimaOcorrencia,
    };
  }

  function calculatePrevisaoEntrega(item, ultimaOcorrencia, rastreamento) {
    let previsaoEntrega = item.docDate.split(" ")[0];

    if (!hasValidTracking(rastreamento)) {
      return previsaoEntrega;
    }

    const foiEntregue = rastreamento.tracking.some(
      (oc) =>
        oc.codigo_ocorrencia === "01" ||
        (oc.descricao && oc.descricao.toLowerCase().includes("entregue"))
    );

    if (!foiEntregue) {
      const dataEnvio = new Date(item.docDate.split(" ")[0]);
      const prazoMedio = 3;
      dataEnvio.setDate(dataEnvio.getDate() + prazoMedio);
      previsaoEntrega = dataEnvio.toISOString().split("T")[0];
    } else if (ultimaOcorrencia) {
      const dataEntrega = new Date(ultimaOcorrencia.data_hora);
      previsaoEntrega = dataEntrega.toISOString().split("T")[0];
    }

    return previsaoEntrega;
  }

  function buildHistorico(rastreamento) {
    if (!rastreamento || !rastreamento.tracking) {
      return [];
    }
    return rastreamento.tracking.map((oc) => ({
      ...oc,
      descricao: oc.descricao?.replace(/\s*\(\d+\)\s*$/, "").trim() || oc.descricao,
      ocorrencia: oc.ocorrencia?.replace(/\s*\(\d+\)\s*$/, "").trim() || oc.ocorrencia,
    }));
  }

  const trackingData = processTrackingData(item, rastreamento);
  const previsaoEntrega = calculatePrevisaoEntrega(
    item,
    trackingData.ultimaOcorrencia,
    rastreamento
  );

  return {
    numero: item.serial.toString(),
    status: trackingData.status,
    origem: `${item.cidadeOrigem}, ${item.estadoOrigem}`,
    destino: `${item.cidadeDestino}, ${item.estadoDestino}`,
    docDate: item.docDate.split(" ")[0],
    dataEnvio: item.docDate.split(" ")[0],
    previsaoEntrega: previsaoEntrega,
    ultimaAtualizacao: trackingData.ultimaAtualizacao,
    cliente: item.cardName,
    cte: "",
    historico: buildHistorico(rastreamento),
    transportadoraNome: item.carrierName,
    rastreamento: rastreamento,
  };
};

