window.RastreamentoAPI = window.RastreamentoAPI || {};

window.RastreamentoAPI.carregarDadosGenericos = async function () {
  try {
    const token = window.RastreamentoUtils.obterToken();
    const dataRastreamento = window.RastreamentoConfig.obterDataRastreamento();

    const response = await fetch(
      `http://localhost:4010/generic/track/${dataRastreamento}`,
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
      if (item.carrierName === "Expresso Princesa Dos Campos S/A") {
        return;
      }
      let status = "Aguardando coleta";
      let ultimaAtualizacao = "";
      let ultimaOcorrencia = null;

      try {
        ultimaAtualizacao = window.RastreamentoUtils.formatarDataHora(
          item.docDate
        );
      } catch (error) {
        ultimaAtualizacao = item.docDate;
      }

      if (
        item.rastreamento &&
        item.rastreamento.success &&
        item.rastreamento.tracking &&
        item.rastreamento.tracking.length > 0
      ) {
        const ocorrencias = [...item.rastreamento.tracking].sort((a, b) => {
          const dataA = new Date(a.data_hora);
          const dataB = new Date(b.data_hora);
          return dataB - dataA;
        });

        ultimaOcorrencia = ocorrencias[0];

        switch (ultimaOcorrencia.codigo_ocorrencia) {
          case "71":
          case "80":
          case "74":
            status = "Em processamento";
            break;
          case "82":
          case "76":
            status = "Em trânsito";
            break;
          case "83":
          case "77":
          case "84":
            status = "Em trânsito";
            break;
          case "85":
            status = "Em rota de entrega";
            break;
          case "01":
            status = "Entregue";
            break;
          default:
            status = "Em trânsito";
        }

        try {
          ultimaAtualizacao = window.RastreamentoUtils.formatarDataHora(
            ultimaOcorrencia.data_hora
          );
        } catch (error) {
          ultimaAtualizacao = ultimaOcorrencia.data_hora;
        }
      }

      let previsaoEntrega = item.docDate.split(" ")[0];

      if (
        item.rastreamento &&
        item.rastreamento.tracking &&
        item.rastreamento.tracking.length > 0
      ) {
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
        } else {
          const dataEntrega = new Date(ultimaOcorrencia.data_hora);
          previsaoEntrega = dataEntrega.toISOString().split("T")[0];
        }
      }

      const nota = {
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
        historico:
          item.rastreamento && item.rastreamento.tracking
            ? item.rastreamento.tracking.map((ocorrencia) => {
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
              })
            : [],
        transportadoraNome: item.carrierName,
      };

      let transportadoraIndex = transportadoras.findIndex(
        (t) => t.nome === item.carrierName
      );

      if (transportadoraIndex === -1) {
        let cor = "52, 152, 219";

        switch (item.carrierName) {
          case "Expresso Leomar LTDA":
            cor =
              window.RastreamentoConfig.coresGenericas["Expresso Leomar LTDA"];
            break;
          case "Schreiber Logística LTDA":
            cor =
              window.RastreamentoConfig.coresGenericas[
                "Schreiber Logística LTDA"
              ];
            break;
          case "Mengue Express transportes LTDA":
            cor =
              window.RastreamentoConfig.coresGenericas[
                "Mengue Express transportes LTDA"
              ];
            break;
          case "Transportes Expresso Santa Catarina LTDA":
            cor =
              window.RastreamentoConfig.coresGenericas[
                "Transportes Expresso Santa Catarina LTDA"
              ];
            break;
          default:
            cor = "52, 152, 219";
        }

        const novaTransportadora = {
          id: transportadoras.length + 1,
          nome: item.carrierName,
          cor: cor,
          logo: "fas fa-truck",
          notas: [],
        };
        transportadoras.push(novaTransportadora);
        transportadoraIndex = transportadoras.length - 1;
      }

      transportadoras[transportadoraIndex].notas.push(nota);
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

    const response = await fetch(
      `http://localhost:4010/ouroNegro/track/${dataRastreamento}`,
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

      let ultimaCidade = item.bplName.split(" - ")[0];
      let ultimaUF = "";

      if (item.rastreamento && item.rastreamento.code === "400") {
        status = "Aguardando coleta";
        ultimaCidade = item.cidadeOrigem;
        ultimaUF = item.estadoOrigem;
      } else if (
        Array.isArray(item.rastreamento) &&
        item.rastreamento.length > 0
      ) {
        const ocorrencias = [...item.rastreamento].sort((a, b) => {
          const dataA = new Date(`${a.DATAOCORRENCIA} ${a.HORAOCORRENCIA}`);
          const dataB = new Date(`${b.DATAOCORRENCIA} ${b.HORAOCORRENCIA}`);
          return dataB - dataA;
        });

        const ultimaOcorrencia = ocorrencias[0];

        switch (ultimaOcorrencia.CODOCORRENCIA) {
          case "101":
          case "000":
            status = "Em processamento";
            break;
          case "104":
          case "105":
            status = "Em trânsito";
            break;
          case "106":
            status = "Em rota de entrega";
            break;
          case "108":
          case "001":
            status = "Entregue";
            break;
          default:
            status = "Em trânsito";
        }

        try {
          ultimaAtualizacao = `${window.RastreamentoUtils.formatarData(
            ultimaOcorrencia.DATAOCORRENCIA
          )} ${ultimaOcorrencia.HORAOCORRENCIA}`;
        } catch (error) {
          ultimaAtualizacao = `${ultimaOcorrencia.DATAOCORRENCIA} ${ultimaOcorrencia.HORAOCORRENCIA}`;
        }

        ultimaCidade = ultimaOcorrencia.CIDADE;
        ultimaUF = ultimaOcorrencia.UF;
      }

      const nota = {
        numero: item.serial.toString(),
        status: status,
        origem: `${item.cidadeOrigem}, ${item.estadoOrigem}`,
        destino: `${item.cidadeDestino}, ${item.estadoDestino}`,
        docDate: item.docDate.split(" ")[0],
        dataEnvio:
          Array.isArray(item.rastreamento) && item.rastreamento.length > 0
            ? item.rastreamento[0].EMISSAO
            : item.docDate.split(" ")[0],
        previsaoEntrega:
          Array.isArray(item.rastreamento) && item.rastreamento.length > 0
            ? item.rastreamento[0].PREVISAO
            : item.docDate.split(" ")[0],
        ultimaAtualizacao: ultimaAtualizacao,
        cliente: item.cardName,
        cte:
          Array.isArray(item.rastreamento) && item.rastreamento.length > 0
            ? item.rastreamento[0].CTE
            : "",
        historico: Array.isArray(item.rastreamento) ? item.rastreamento : [],
      };

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

    const response = await fetch(
      `http://localhost:4010/princesa/track/${dataRastreamento}`,
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
