/**
 * Módulo de comunicação com APIs
 * Contém funções para carregar dados das transportadoras
 */

// Namespace para API
window.RastreamentoAPI = window.RastreamentoAPI || {};

/**
 * Carrega dados do endpoint genérico (outras transportadoras)
 * @returns {Promise<boolean>} True se carregou com sucesso
 */
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

    // Verificar se a resposta é um array direto ou tem formato {data: []}
    let data;
    if (Array.isArray(responseData)) {
      // Resposta é um array direto
      data = responseData;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      // Resposta tem formato {data: []}
      data = responseData.data;
    } else {
      return true; // Retorna true pois não é um erro, apenas não há dados
    }

    // Verificar se há dados para processar
    if (data.length === 0) {
      return true;
    }

    // Processar os dados recebidos e adicionar às transportadoras
    const transportadoras = window.RastreamentoConfig.transportadoras;
    data.forEach((item) => {
      // Determinar o status com base nos dados recebidos
      let status = "Aguardando coleta";
      let ultimaAtualizacao = "";

      try {
        ultimaAtualizacao = window.RastreamentoUtils.formatarDataHora(
          item.docDate
        );
      } catch (error) {
        ultimaAtualizacao = item.docDate;
      }

      // Verificar se há informações de rastreamento válidas
      if (
        item.rastreamento &&
        item.rastreamento.success &&
        item.rastreamento.tracking &&
        item.rastreamento.tracking.length > 0
      ) {
        // Ordenar ocorrências por data e hora (mais recente primeiro)
        const ocorrencias = [...item.rastreamento.tracking].sort((a, b) => {
          const dataA = new Date(a.data_hora);
          const dataB = new Date(b.data_hora);
          return dataB - dataA;
        });

        // Pegar a ocorrência mais recente para determinar o status
        const ultimaOcorrencia = ocorrencias[0];

        // Determinar o status com base no código de ocorrência
        switch (ultimaOcorrencia.codigo_ocorrencia) {
          case "71": // DOCUMENTO DE TRANSPORTE EMITIDO
          case "80": // DOCUMENTO DE TRANSPORTE EMITIDO
          case "74": // DOCUMENTO DE TRANSPORTE EMITIDO
            status = "Em processamento";
            break;
          case "82": // SAIDA DE UNIDADE
          case "76": // SAIDA DE UNIDADE
            status = "Em trânsito";
            break;
          case "83": // CHEGADA EM UNIDADE DE TRANSBORDO
          case "77": // CHEGADA EM UNIDADE DE TRANSBORDO
          case "84": // CHEGADA EM UNIDADE
            status = "Em trânsito";
            break;
          case "85": // SAIDA PARA ENTREGA
            status = "Em rota de entrega";
            break;
          case "01": // MERCADORIA ENTREGUE
            status = "Entregue";
            break;
          default:
            status = "Em trânsito";
        }

        // Atualizar última atualização
        try {
          ultimaAtualizacao = window.RastreamentoUtils.formatarDataHora(
            ultimaOcorrencia.data_hora
          );
        } catch (error) {
          ultimaAtualizacao = ultimaOcorrencia.data_hora;
        }
      }

      // Criar objeto de nota
      const nota = {
        numero: item.serial.toString(),
        status: status,
        origem: `${item.cidadeOrigem}, ${item.estadoOrigem}`,
        destino: `${item.cidadeDestino}, ${item.estadoDestino}`,
        docDate: item.docDate.split(" ")[0],
        dataEnvio: item.docDate.split(" ")[0],
        previsaoEntrega: item.docDate.split(" ")[0], // Será atualizado se houver previsão no rastreamento
        ultimaAtualizacao: ultimaAtualizacao,
        cliente: item.cardName,
        cte: "", // Não disponível no endpoint genérico
        historico:
          item.rastreamento && item.rastreamento.tracking
            ? item.rastreamento.tracking
            : [],
        transportadoraNome: item.carrierName,
      };

      // Encontrar ou criar transportadora
      let transportadoraIndex = transportadoras.findIndex(
        (t) => t.nome === item.carrierName
      );

      if (transportadoraIndex === -1) {
        // Criar nova transportadora com cores específicas
        let cor = "52, 152, 219"; // Cor padrão azul

        // Definir cores específicas para cada transportadora
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
            cor = "52, 152, 219"; // Azul padrão
        }

        const novaTransportadora = {
          id: transportadoras.length + 1,
          nome: item.carrierName,
          cor: cor,
          logo: "fas fa-truck", // Logo genérico
          notas: [],
        };
        transportadoras.push(novaTransportadora);
        transportadoraIndex = transportadoras.length - 1;
      }

      // Adicionar a nota ao array de notas da transportadora
      transportadoras[transportadoraIndex].notas.push(nota);
    });

    return true;
  } catch (error) {
    console.error("Erro ao carregar dados genéricos:", error);
    return false;
  }
};

/**
 * Carrega dados reais de rastreamento da Ouro Negro
 * @returns {Promise<boolean>} True se carregou com sucesso
 */
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

    // Verificar se há dados para processar
    if (!Array.isArray(data) || data.length === 0) {
      return true;
    }

    // Encontrar a transportadora Ouro Negro no array
    const transportadoras = window.RastreamentoConfig.transportadoras;
    const ouroNegroIndex = transportadoras.findIndex(
      (t) => t.nome === "Ouro Negro"
    );
    if (ouroNegroIndex === -1) {
      console.error("Transportadora Ouro Negro não encontrada no array!");
      return false;
    }

    // Limpar notas existentes
    transportadoras[ouroNegroIndex].notas = [];

    // Processar os dados recebidos
    data.forEach((item) => {
      // Determinar o status com base nos dados recebidos
      let status = "Aguardando coleta";
      let ultimaAtualizacao = "";

      try {
        ultimaAtualizacao = window.RastreamentoUtils.formatarDataHora(
          item.docDate
        );
      } catch (error) {
        ultimaAtualizacao = item.docDate;
      }

      let ultimaCidade = item.bplName.split(" - ")[0]; // Extrair cidade da origem
      let ultimaUF = ""; // Será preenchido se houver rastreamento

      // Verificar se há informações de rastreamento válidas
      if (item.rastreamento && item.rastreamento.code === "400") {
        // Caso onde não há informações de rastreamento
        status = "Aguardando coleta";
        ultimaCidade = item.cidadeOrigem;
        ultimaUF = item.estadoOrigem;
      } else if (
        Array.isArray(item.rastreamento) &&
        item.rastreamento.length > 0
      ) {
        // Ordenar ocorrências por data e hora (mais recente primeiro)
        const ocorrencias = [...item.rastreamento].sort((a, b) => {
          const dataA = new Date(`${a.DATAOCORRENCIA} ${a.HORAOCORRENCIA}`);
          const dataB = new Date(`${b.DATAOCORRENCIA} ${b.HORAOCORRENCIA}`);
          return dataB - dataA;
        });

        // Pegar a ocorrência mais recente para determinar o status
        const ultimaOcorrencia = ocorrencias[0];

        // Determinar o status com base no código de ocorrência
        switch (ultimaOcorrencia.CODOCORRENCIA) {
          case "101": // INICIO DO PROCESSO - EMISSAO DO CTE
          case "000": // PROCESSO TRANSPORTE INICIADO
            status = "Em processamento";
            break;
          case "104": // CHEGADA NO DEPOSITO DE TRANSBORDO
          case "105": // CHEGADA NO DEPOSITO DE DESTINO
            status = "Em trânsito";
            break;
          case "106": // EM TRANSITO PARA ENTREGA
            status = "Em rota de entrega";
            break;
          case "108": // ENTREGA REALIZADA (código padrão)
          case "001": // ENTREGA REALIZADA (código alternativo usado pela API)
            status = "Entregue";
            break;
          default:
            status = "Em trânsito";
        }

        // Atualizar última atualização
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

      // Criar objeto de nota
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

      // Adicionar a nota ao array de notas da transportadora
      transportadoras[ouroNegroIndex].notas.push(nota);
    });

    return true;
  } catch (error) {
    console.error("Erro ao carregar dados da Ouro Negro:", error);
    return false;
  }
};

/**
 * Recarrega dados com nova data
 * @param {string} novaData - Nova data no formato YYYY-MM-DD
 * @returns {Promise<boolean>} True se recarregou com sucesso
 */
window.RastreamentoAPI.recarregarDadosComNovaData = async function (novaData) {
  try {
    // Atualizar a variável global
    window.RastreamentoConfig.atualizarDataRastreamento(novaData);

    // Limpar dados existentes de todas as transportadoras
    const transportadoras = window.RastreamentoConfig.transportadoras;
    let totalNotasAntes = 0;

    transportadoras.forEach((transportadora) => {
      totalNotasAntes += transportadora.notas.length;
      transportadora.notas = [];
    });

    // Carregar novos dados de ambas as fontes
    const sucessoOuroNegro =
      await window.RastreamentoAPI.carregarDadosOuroNegro();

    const sucessoGenericos =
      await window.RastreamentoAPI.carregarDadosGenericos();

    // Verificar total de notas carregadas
    let totalNotasDepois = 0;
    transportadoras.forEach((transportadora) => {
      totalNotasDepois += transportadora.notas.length;
    });

    // Re-renderizar a tabela com os novos dados
    if (totalNotasDepois > 0) {
      await window.RastreamentoMain.reRenderizarTabela();
    } else {
      await window.RastreamentoMain.reRenderizarTabela();
    }

    return sucessoOuroNegro || sucessoGenericos;
  } catch (error) {
    console.error("❌ Erro ao recarregar dados:", error);
    return false;
  }
};
