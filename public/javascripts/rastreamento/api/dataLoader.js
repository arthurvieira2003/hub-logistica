window.RastreamentoAPI = window.RastreamentoAPI || {};

function shouldSkipItem(carrierName) {
  return carrierName === "Expresso Princesa Dos Campos S/A";
}

function formatDateTimeSafely(dateTime) {
  try {
    return window.RastreamentoUtils.formatarDataHora(dateTime);
  } catch (error) {
    return dateTime;
  }
}

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

function processTrackingData(item) {
  if (!hasValidTracking(item.rastreamento)) {
    return {
      status: "Aguardando coleta",
      ultimaAtualizacao: formatDateTimeSafely(item.docDate),
      ultimaOcorrencia: null,
    };
  }

  const ocorrencias = sortOcorrenciasByDate(item.rastreamento.tracking);
  const ultimaOcorrencia = ocorrencias[0];
  const status = determineStatusFromCodigo(ultimaOcorrencia.codigo_ocorrencia);
  const ultimaAtualizacao = formatDateTimeSafely(ultimaOcorrencia.data_hora);

  return {
    status,
    ultimaAtualizacao,
    ultimaOcorrencia,
  };
}

function calculatePrevisaoEntrega(item, ultimaOcorrencia) {
  let previsaoEntrega = item.docDate.split(" ")[0];

  if (!hasValidTracking(item.rastreamento)) {
    return previsaoEntrega;
  }

  const foiEntregue = item.rastreamento.tracking.some(
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

function cleanOcorrencia(ocorrencia) {
  const ocorrenciaLimpa = { ...ocorrencia };

  if (ocorrenciaLimpa.descricao) {
    ocorrenciaLimpa.descricao = ocorrenciaLimpa.descricao
      .replace(/\s*\(\d+\)\s*$/, "")
      .trim();
  }

  if (ocorrenciaLimpa.ocorrencia) {
    ocorrenciaLimpa.ocorrencia = ocorrenciaLimpa.ocorrencia
      .replace(/\s*\(\d+\)\s*$/, "")
      .trim();
  }

  return ocorrenciaLimpa;
}

function buildHistorico(rastreamento) {
  if (!rastreamento || !rastreamento.tracking) {
    return [];
  }
  return rastreamento.tracking.map(cleanOcorrencia);
}

function getTransportadoraColor(carrierName) {
  const coresGenericas = window.RastreamentoConfig.coresGenericas;
  const colorMap = {
    "Expresso Leomar LTDA": coresGenericas["Expresso Leomar LTDA"],
    "Schreiber Logística LTDA": coresGenericas["Schreiber Logística LTDA"],
    "Mengue Express transportes LTDA":
      coresGenericas["Mengue Express transportes LTDA"],
    "Transportes Expresso Santa Catarina LTDA":
      coresGenericas["Transportes Expresso Santa Catarina LTDA"],
  };

  return colorMap[carrierName] || "52, 152, 219";
}

function findOrCreateTransportadora(transportadoras, carrierName) {
  let transportadoraIndex = transportadoras.findIndex(
    (t) => t.nome === carrierName
  );

  if (transportadoraIndex === -1) {
    const novaTransportadora = {
      id: transportadoras.length + 1,
      nome: carrierName,
      cor: getTransportadoraColor(carrierName),
      logo: "fas fa-truck",
      notas: [],
    };
    transportadoras.push(novaTransportadora);
    transportadoraIndex = transportadoras.length - 1;
  }

  return transportadoraIndex;
}

function buildNotaObject(item, status, ultimaAtualizacao, previsaoEntrega) {
  return {
    numero: item.serial.toString(),
    status: status,
    origem: `${item.cidadeOrigem}, ${item.estadoOrigem}`,
    destino: `${item.cidadeDestino}, ${item.estadoDestino}`,
    docDate: item.docDate.split(" ")[0],
    dataEnvio: item.docDate.split(" ")[0],
    previsaoEntrega: previsaoEntrega,
    ultimaAtualizacao: ultimaAtualizacao,
    cliente: item.cardName,
    cte: "",
    historico: buildHistorico(item.rastreamento),
    transportadoraNome: item.carrierName,
  };
}

function processItem(item, transportadoras) {
  if (shouldSkipItem(item.carrierName)) {
    return;
  }

  const trackingData = processTrackingData(item);
  const previsaoEntrega = calculatePrevisaoEntrega(
    item,
    trackingData.ultimaOcorrencia
  );
  const nota = buildNotaObject(
    item,
    trackingData.status,
    trackingData.ultimaAtualizacao,
    previsaoEntrega
  );

  const transportadoraIndex = findOrCreateTransportadora(
    transportadoras,
    item.carrierName
  );
  transportadoras[transportadoraIndex].notas.push(nota);
}

window.RastreamentoAPI.carregarDadosGenericos = async function () {
  try {
    const token = window.RastreamentoUtils.obterToken();
    const dataRastreamento = window.RastreamentoConfig.obterDataRastreamento();

    const API_BASE_URL =
      (window.API_CONFIG && window.API_CONFIG.getBaseUrl()) ||
      (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ||
      "https://logistica.copapel.com.br/api";
    const response = await fetch(
      `${API_BASE_URL}/generic/track/${dataRastreamento}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Erro ao carregar dados genéricos: ${response.status}`);
    }

    const responseData = await response.json();

    let data;
    if (Array.isArray(responseData)) {
      data = responseData;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      data = responseData.data;
    } else {
      return true;
    }

    if (data.length === 0) {
      return true;
    }

    const transportadoras = window.RastreamentoConfig.transportadoras;
    data.forEach((item) => {
      processItem(item, transportadoras);
    });

    return true;
  } catch (error) {
    console.error("Erro ao carregar dados genéricos:", error);
    return false;
  }
};

window.RastreamentoAPI.carregarDadosOuroNegro = async function () {
  try {
    const token = window.RastreamentoUtils.obterToken();
    const dataRastreamento = window.RastreamentoConfig.obterDataRastreamento();

    const API_BASE_URL =
      (window.getApiBaseUrl && window.getApiBaseUrl()) ||
      (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ||
      "https://logistica.copapel.com.br/api";
    const response = await fetch(
      `${API_BASE_URL}/ouroNegro/track/${dataRastreamento}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Erro ao carregar dados: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return true;
    }

    const transportadoras = window.RastreamentoConfig.transportadoras;
    const ouroNegroIndex = transportadoras.findIndex(
      (t) => t.nome === "Ouro Negro"
    );
    if (ouroNegroIndex === -1) {
      console.error("Transportadora Ouro Negro não encontrada no array!");
      return false;
    }

    transportadoras[ouroNegroIndex].notas = [];

    // Funções auxiliares para processar dados Ouro Negro
    const formatOuroNegroDateTime = (dateTime) => {
      try {
        return window.RastreamentoUtils.formatarDataHora(dateTime);
      } catch (error) {
        return dateTime;
      }
    };

    const formatOuroNegroDataHora = (dataOcorrencia, horaOcorrencia) => {
      try {
        return `${window.RastreamentoUtils.formatarData(
          dataOcorrencia
        )} ${horaOcorrencia}`;
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
          ultimaCidade: item.bplName.split(" - ")[0],
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
      };
    };

    data.forEach((item) => {
      const rastreamentoData = processOuroNegroRastreamento(item);
      const nota = buildOuroNegroNota(item, rastreamentoData);
      transportadoras[ouroNegroIndex].notas.push(nota);
    });

    return true;
  } catch (error) {
    console.error("Erro ao carregar dados da Ouro Negro:", error);
    return false;
  }
};

window.RastreamentoAPI.carregarDadosPrincesa = async function () {
  try {
    const token = window.RastreamentoUtils.obterToken();
    const dataRastreamento = window.RastreamentoConfig.obterDataRastreamento();

    const API_BASE_URL =
      (window.getApiBaseUrl && window.getApiBaseUrl()) ||
      (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ||
      "https://logistica.copapel.com.br/api";
    const response = await fetch(
      `${API_BASE_URL}/princesa/track/${dataRastreamento}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Erro ao carregar dados da Princesa: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return true;
    }

    const transportadoras = window.RastreamentoConfig.transportadoras;
    const princesaIndex = transportadoras.findIndex(
      (t) => t.nome === "Expresso Princesa Dos Campos S/A"
    );
    if (princesaIndex === -1) {
      console.error("Transportadora Princesa não encontrada no array!");
      return false;
    }

    transportadoras[princesaIndex].notas = [];

    data.forEach((item) => {
      let status = "Aguardando coleta";
      let ultimaAtualizacao = "";

      try {
        ultimaAtualizacao = window.RastreamentoUtils.formatarDataHora(
          item.docDate
        );
      } catch (error) {
        ultimaAtualizacao = item.docDate;
      }

      if (
        item.rastreamento &&
        item.rastreamento.data &&
        item.rastreamento.data.length > 0
      ) {
        const rastreamentoData = item.rastreamento.data[0];
        if (rastreamentoData.dados && rastreamentoData.dados.length > 0) {
          const ultimoEvento = rastreamentoData.dados[0];

          const descricao = ultimoEvento.descricao.toLowerCase();
          if (descricao.includes("entrega") || descricao.includes("entregue")) {
            status = "Entregue";
          } else if (
            descricao.includes("transito") ||
            descricao.includes("transferencia")
          ) {
            status = "Em trânsito";
          } else if (
            descricao.includes("coleta") ||
            descricao.includes("emissao")
          ) {
            status = "Coletado";
          } else {
            status = "Em trânsito";
          }

          try {
            ultimaAtualizacao = window.RastreamentoUtils.formatarDataHora(
              ultimoEvento.data
            );
          } catch (error) {
            ultimaAtualizacao = ultimoEvento.data;
          }
        }
      }

      const nota = {
        numero: item.serial.toString(),
        status: status,
        origem: `${item.cidadeOrigem}, ${item.estadoOrigem}`,
        destino: `${item.cidadeDestino}, ${item.estadoDestino}`,
        docDate: item.docDate.split(" ")[0],
        dataEnvio: item.docDate.split(" ")[0],
        previsaoEntrega: item.rastreamento?.data?.[0]?.prev_entrega
          ? item.rastreamento.data[0].prev_entrega.split(" ")[0]
          : item.docDate.split(" ")[0],
        ultimaAtualizacao: ultimaAtualizacao,
        cliente: item.cardName,
        cte: "",
        historico: item.rastreamento?.data?.[0]?.dados || [],
        transportadoraNome: item.carrierName,
        rastreamento: item.rastreamento,
        prevEntrega: item.rastreamento?.data?.[0]?.prev_entrega || null,
        diasEntrega: item.rastreamento?.data?.[0]?.dias_entrega || null,
      };

      transportadoras[princesaIndex].notas.push(nota);
    });

    return true;
  } catch (error) {
    console.error("Erro ao carregar dados da Princesa:", error);
    return false;
  }
};

window.RastreamentoAPI.recarregarDadosComNovaData = async function (novaData) {
  try {
    window.RastreamentoConfig.atualizarDataRastreamento(novaData);

    const transportadoras = window.RastreamentoConfig.transportadoras;
    let totalNotasAntes = 0;

    transportadoras.forEach((transportadora) => {
      totalNotasAntes += transportadora.notas.length;
      transportadora.notas = [];
    });

    const sucessoOuroNegro =
      await window.RastreamentoAPI.carregarDadosOuroNegro();

    const sucessoPrincesa =
      await window.RastreamentoAPI.carregarDadosPrincesa();

    const sucessoGenericos =
      await window.RastreamentoAPI.carregarDadosGenericos();

    let totalNotasDepois = 0;
    transportadoras.forEach((transportadora) => {
      totalNotasDepois += transportadora.notas.length;
    });

    if (totalNotasDepois > 0) {
      await window.RastreamentoMain.reRenderizarTabela();
    } else {
      await window.RastreamentoMain.reRenderizarTabela();
    }

    return sucessoOuroNegro || sucessoPrincesa || sucessoGenericos;
  } catch (error) {
    console.error("❌ Erro ao recarregar dados:", error);
    return false;
  }
};
