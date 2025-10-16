/**
 * Renderizador de Modal de Detalhes
 * Contém funções para renderizar o conteúdo do modal de detalhes da nota
 */

// Namespace para renderizadores de modal
window.RastreamentoModalRenderers = window.RastreamentoModalRenderers || {};

/**
 * Renderiza o timeline de rastreamento
 * @param {Array} historico - Array com o histórico de ocorrências
 * @param {Object} nota - Objeto da nota
 * @returns {string} HTML do timeline
 */
window.RastreamentoModalRenderers.renderizarTimeline = function (
  historico,
  nota
) {
  if (!historico || historico.length === 0) {
    return `
      <div class="sem-dados-rastreamento" style="text-align: center; padding: 30px; color: #666; font-style: italic;">
        <p>Não há histórico de rastreamento disponível para esta nota.</p>
      </div>
    `;
  }

  // Função para extrair cidade do campo obs da Princesa
  const extrairCidadeDaObs = (obs) => {
    if (!obs) return null;

    // Padrões comuns na Princesa - mais específicos
    const padroes = [
      /Saida de ([A-ZÁÊÇÕ][a-záêçõ\s]+(?:DO|DA|DOS|DAS)?)\s+em/i, // "Saida de CURITIBA em"
      /chegada na base ([A-ZÁÊÇÕ][a-záêçõ\s]+(?:DO|DA|DOS|DAS)?)\s+em/i, // "chegada na base SAO MATEUS DO SUL em"
      /base ([A-ZÁÊÇÕ][a-záêçõ\s]+(?:DO|DA|DOS|DAS)?)\s+em/i, // "base UNIAO DA VITORIA em"
      /([A-ZÁÊÇÕ][a-záêçõ\s]+(?:DO|DA|DOS|DAS)?)\s*-\s*[A-Z]{2}/i, // "CIDADE - UF"
    ];

    for (const padrao of padroes) {
      const match = obs.match(padrao);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  };

  // Função para remover eventos duplicados (mesmo tipo e horário muito próximo)
  const removerDuplicados = (historico) => {
    const eventosUnicos = [];
    const toleranciaMinutos = 2; // 2 minutos de tolerância

    historico.forEach((evento) => {
      const eventoData = evento.data
        ? new Date(evento.data)
        : evento.data_hora
        ? new Date(evento.data_hora)
        : new Date(`${evento.DATAOCORRENCIA} ${evento.HORAOCORRENCIA}`);

      const descricao =
        evento.descricao || evento.DESCOCORRENCIA || evento.ocorrencia || "";

      // Verificar se já existe um evento similar
      const existeSimilar = eventosUnicos.some((existente) => {
        const existenteData = existente.data
          ? new Date(existente.data)
          : existente.data_hora
          ? new Date(existente.data_hora)
          : new Date(`${existente.DATAOCORRENCIA} ${existente.HORAOCORRENCIA}`);

        const existenteDescricao =
          existente.descricao ||
          existente.DESCOCORRENCIA ||
          existente.ocorrencia ||
          "";

        const diferencaMinutos =
          Math.abs(eventoData - existenteData) / (1000 * 60);

        return (
          diferencaMinutos <= toleranciaMinutos &&
          descricao.toLowerCase() === existenteDescricao.toLowerCase()
        );
      });

      if (!existeSimilar) {
        eventosUnicos.push(evento);
      }
    });

    return eventosUnicos;
  };

  // Remover eventos duplicados antes de ordenar
  const historicoSemDuplicados = removerDuplicados(historico);

  // Ordenar histórico por data e hora (mais antigo primeiro)
  const historicoOrdenado = [...historicoSemDuplicados].sort((a, b) => {
    // Verificar formato da Ouro Negro, genérico ou Princesa
    let dataA, dataB;

    if (a.DATAOCORRENCIA) {
      // Formato Ouro Negro
      dataA = new Date(`${a.DATAOCORRENCIA} ${a.HORAOCORRENCIA}`);
    } else if (a.data_hora) {
      // Formato genérico
      dataA = new Date(a.data_hora);
    } else if (a.data) {
      // Formato Princesa
      dataA = new Date(a.data);
    } else {
      dataA = new Date(0);
    }

    if (b.DATAOCORRENCIA) {
      // Formato Ouro Negro
      dataB = new Date(`${b.DATAOCORRENCIA} ${b.HORAOCORRENCIA}`);
    } else if (b.data_hora) {
      // Formato genérico
      dataB = new Date(b.data_hora);
    } else if (b.data) {
      // Formato Princesa
      dataB = new Date(b.data);
    } else {
      dataB = new Date(0);
    }

    return dataA - dataB;
  });

  // Verificar se a nota foi entregue
  const foiEntregue = historicoOrdenado.some(
    (oc) =>
      (oc.DESCOCORRENCIA && oc.DESCOCORRENCIA.includes("ENTREGA REALIZADA")) ||
      (oc.descricao && oc.descricao.includes("ENTREGA REALIZADA")) ||
      oc.CODOCORRENCIA === "108" ||
      oc.CODOCORRENCIA === "001" ||
      oc.codigo_ocorrencia === "01" ||
      (oc.ocorrencia && oc.ocorrencia.includes("MERCADORIA ENTREGUE"))
  );

  // Se não foi entregue, adicionar o status "Entregue" no final
  if (!foiEntregue) {
    historicoOrdenado.push({
      DESCOCORRENCIA: "ENTREGA REALIZADA",
      DATAOCORRENCIA: nota.previsaoEntrega,
      HORAOCORRENCIA: "00:00",
      CIDADE: nota.destino.split(", ")[0],
      UF: nota.destino.split(", ")[1],
      CODOCORRENCIA: "108",
      ocorrencia: "ENTREGA REALIZADA",
      data_hora: nota.previsaoEntrega + "T00:00:00",
      cidade: nota.destino.split(", ")[0],
      codigo_ocorrencia: "01",
      isPrevisao: true, // Flag para identificar que é previsão
    });
  }

  return `
    <h4 style="margin-top: 30px; margin-bottom: 20px; color: #333; font-size: 20px; font-weight: 600; border-bottom: 2px solid #247675; padding-bottom: 10px; text-align: center;">Histórico de Rastreamento</h4>
    <div class="timeline-horizontal" style="position: relative; padding: 25px 0; margin-top: 20px; overflow-x: auto; display: flex; justify-content: center;">
      <div class="timeline-track" style="position: relative; display: flex; min-width: max-content; gap: 15px; padding: 0 15px; justify-content: center; align-items: center;">
        ${historicoOrdenado
          .map((ocorrencia, index) => {
            // Determinar a cor e ícone baseado no código de ocorrência ou descrição
            let statusColor = "#757575"; // Cor padrão cinza
            let icon = "fas fa-clock";
            let isCompleted = true;

            // Lógica específica para dados da Princesa
            if (ocorrencia.descricao) {
              const descricao = ocorrencia.descricao.toLowerCase();

              if (
                descricao.includes("entrega") &&
                descricao.includes("realizada")
              ) {
                // Entrega realizada (verde)
                statusColor = "#4caf50";
                icon = "fas fa-check-circle";
              } else if (descricao.includes("manifestado")) {
                // Manifestado - em rota de entrega (laranja)
                statusColor = "#ff9800";
                icon = "fas fa-truck";
              } else if (
                descricao.includes("transferencia") &&
                descricao.includes("iniciada")
              ) {
                // Transferência iniciada - saída (azul)
                statusColor = "#2196f3";
                icon = "fas fa-arrow-right";
              } else if (
                descricao.includes("transferencia") &&
                descricao.includes("finalizada")
              ) {
                // Transferência finalizada - em trânsito (azul claro)
                statusColor = "#03a9f4";
                icon = "fas fa-exchange-alt";
              } else if (descricao.includes("emissao")) {
                // Emissão realizada - início do processo (verde claro)
                statusColor = "#8bc34a";
                icon = "fas fa-file-alt";
              } else {
                // Outros eventos (cinza)
                statusColor = "#757575";
                icon = "fas fa-clock";
              }
            }
            // Verificar primeiro se é entrega realizada pela descrição ou código
            else if (
              (ocorrencia.DESCOCORRENCIA &&
                ocorrencia.DESCOCORRENCIA.includes("ENTREGA REALIZADA")) ||
              ocorrencia.CODOCORRENCIA === "108" ||
              ocorrencia.CODOCORRENCIA === "001" ||
              ocorrencia.codigo_ocorrencia === "01" ||
              (ocorrencia.ocorrencia &&
                ocorrencia.ocorrencia.includes("MERCADORIA ENTREGUE"))
            ) {
              if (ocorrencia.isPrevisao) {
                // Entrega prevista (apagada)
                statusColor = "#bdbdbd"; // Cinza claro para previsão
                icon = "fas fa-clock";
              } else {
                // Entrega realizada (verde)
                statusColor = "#4caf50"; // Verde para entregue
                icon = "fas fa-check-circle";
              }
            } else {
              // Verificar código de ocorrência (formato Ouro Negro ou genérico)
              const codigoOcorrencia =
                ocorrencia.CODOCORRENCIA || ocorrencia.codigo_ocorrencia;

              switch (codigoOcorrencia) {
                case "101": // INICIO DO PROCESSO - EMISSAO DO CTE
                case "71": // DOCUMENTO DE TRANSPORTE EMITIDO
                case "80": // DOCUMENTO DE TRANSPORTE EMITIDO
                case "74": // DOCUMENTO DE TRANSPORTE EMITIDO
                  statusColor = "#9c27b0"; // Roxo para processamento
                  icon = "fas fa-file-invoice";
                  break;
                case "000": // PROCESSO TRANSPORTE INICIADO
                  statusColor = "#ff9800"; // Laranja para aguardando
                  icon = "fas fa-truck-loading";
                  break;
                case "104": // CHEGADA NO DEPOSITO DE TRANSBORDO
                case "105": // CHEGADA NO DEPOSITO DE DESTINO
                case "83": // CHEGADA EM UNIDADE DE TRANSBORDO
                case "77": // CHEGADA EM UNIDADE DE TRANSBORDO
                case "84": // CHEGADA EM UNIDADE
                  statusColor = "#03a9f4"; // Azul claro para em trânsito
                  icon = "fas fa-warehouse";
                  break;
                case "106": // EM TRANSITO PARA ENTREGA
                case "82": // SAIDA DE UNIDADE
                case "76": // SAIDA DE UNIDADE
                  statusColor = "#00bcd4"; // Ciano para rota de entrega
                  icon = "fas fa-truck";
                  break;
                case "85": // SAIDA PARA ENTREGA
                  statusColor = "#00bcd4"; // Ciano para rota de entrega
                  icon = "fas fa-truck";
                  break;
                case "108": // ENTREGA REALIZADA (código padrão)
                case "001": // ENTREGA REALIZADA (código alternativo)
                case "01": // MERCADORIA ENTREGUE
                  statusColor = "#4caf50"; // Verde para entregue
                  icon = "fas fa-check-circle";
                  break;
              }
            }

            return `
              <div class="timeline-step" style="position: relative; display: flex; flex-direction: column; align-items: center; min-width: 180px; max-width: 200px; flex-shrink: 0;">
                <!-- Linha conectora -->
                ${
                  index < historicoOrdenado.length - 1
                    ? `
                  <div class="timeline-connector" style="position: absolute; top: 25px; left: 50%; width: calc(100% + 15px); height: 2px; z-index: 1; ${
                    // Se o próximo status é previsão de entrega e o status atual não é "EM TRANSITO PARA ENTREGA"
                    historicoOrdenado[index + 1]?.isPrevisao &&
                    !ocorrencia.DESCOCORRENCIA?.includes(
                      "EM TRANSITO PARA ENTREGA"
                    )
                      ? `border-top: 2px dashed ${statusColor}; background: none;`
                      : `background: linear-gradient(90deg, ${statusColor}, ${statusColor}80);`
                  }"></div>
                `
                    : ""
                }
                
                <!-- Círculo do status -->
                <div class="timeline-circle" style="position: relative; width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, ${statusColor}, ${statusColor}dd); display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px ${statusColor}40; z-index: 2; margin-bottom: 12px;">
                  <i class="${icon}" style="color: white; font-size: 18px;"></i>
                </div>
                
                <!-- Conteúdo do status -->
                <div class="timeline-content" style="text-align: center; background: white; padding: 12px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 2px solid ${statusColor}20; height: 120px; display: flex; flex-direction: column; justify-content: center; width: 100%; box-sizing: border-box;">
                  <h5 style="margin: 0 0 6px 0; color: ${
                    ocorrencia.isPrevisao ? "#999" : "#333"
                  }; font-size: 13px; font-weight: 600; line-height: 1.2;">${
              ocorrencia.isPrevisao
                ? "Previsão de Entrega"
                : ocorrencia.DESCOCORRENCIA ||
                  ocorrencia.ocorrencia ||
                  ocorrencia.descricao ||
                  "Evento de Rastreamento"
            }</h5>
                  <p style="margin: 0 0 4px 0; color: ${
                    ocorrencia.isPrevisao ? "#999" : "#666"
                  }; font-size: 11px; font-weight: 500;">${window.RastreamentoUtils.formatarData(
              ocorrencia.DATAOCORRENCIA ||
                (ocorrencia.data_hora
                  ? ocorrencia.data_hora.split("T")[0]
                  : null) ||
                (ocorrencia.data ? ocorrencia.data.split(" ")[0] : null)
            )}</p>
                  <p style="margin: 0 0 6px 0; color: ${
                    ocorrencia.isPrevisao ? "#ccc" : "#888"
                  }; font-size: 10px;">${
              ocorrencia.isPrevisao
                ? "Previsão"
                : ocorrencia.HORAOCORRENCIA ||
                  (ocorrencia.data_hora
                    ? ocorrencia.data_hora.split("T")[1]?.substring(0, 5)
                    : null) ||
                  (ocorrencia.data
                    ? ocorrencia.data.split(" ")[1]?.substring(0, 5)
                    : null)
            }</p>
                  <div class="timeline-location" style="display: flex; align-items: center; justify-content: center; gap: 3px; font-size: 10px; color: ${
                    ocorrencia.isPrevisao ? "#999" : "#666"
                  }; margin-top: auto;">
                    <i class="fas fa-map-marker-alt" style="color: ${statusColor}; font-size: 9px;"></i>
                    <span style="text-align: center; line-height: 1.1;">${
                      ocorrencia.CIDADE ||
                      ocorrencia.cidade ||
                      extrairCidadeDaObs(ocorrencia.obs) ||
                      nota.destino?.split(", ")[0] ||
                      "-"
                    }, ${
              ocorrencia.UF ||
              ocorrencia.cidade?.split(" / ")[1] ||
              nota.destino?.split(", ")[1] ||
              "-"
            }</span>
                  </div>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
};

/**
 * Renderiza o conteúdo completo do modal de detalhes
 * @param {Object} nota - Objeto da nota
 * @returns {string} HTML completo do modal
 */
window.RastreamentoModalRenderers.renderizarConteudoModal = function (nota) {
  const timelineHTML = window.RastreamentoModalRenderers.renderizarTimeline(
    nota.historico,
    nota
  );

  return `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
      <div class="info-card-rastreamento" style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: all 0.2s ease;">
        <h4 style="margin: 0 0 16px 0; color: #333; font-size: 18px; font-weight: 600; padding-bottom: 8px; border-bottom: 2px solid #247675;">Informações da Nota</h4>
        <div class="info-item-rastreamento" style="display: flex; margin-bottom: 12px;">
          <div class="info-label-rastreamento" style="font-weight: 600; color: #555; min-width: 120px;">Número:</div>
          <div class="info-value-rastreamento" style="color: #333; font-weight: 600;">${
            nota.numero
          }</div>
        </div>
        <div class="info-item-rastreamento" style="display: flex; margin-bottom: 12px;">
          <div class="info-label-rastreamento" style="font-weight: 600; color: #555; min-width: 120px;">Status:</div>
          <div class="info-value-rastreamento" style="color: #333;">
            <span style="display: inline-block; padding: 4px 8px; border-radius: 50px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: white; background: ${
              nota.status === "Aguardando coleta"
                ? "#ff9800"
                : nota.status === "Em trânsito"
                ? "#03a9f4"
                : nota.status === "Entregue"
                ? "#4caf50"
                : nota.status === "Em processamento"
                ? "#9c27b0"
                : nota.status === "Em rota de entrega"
                ? "#00bcd4"
                : nota.atrasada
                ? "#f44336"
                : "#757575"
            };">
              ${nota.status}
            </span>
          </div>
        </div>
        <div class="info-item-rastreamento" style="display: flex; margin-bottom: 12px;">
          <div class="info-label-rastreamento" style="font-weight: 600; color: #555; min-width: 120px;">Cliente:</div>
          <div class="info-value-rastreamento" style="color: #333;">${
            nota.cliente || "-"
          }</div>
        </div>
        <div class="info-item-rastreamento" style="display: flex; margin-bottom: 12px;">
          <div class="info-label-rastreamento" style="font-weight: 600; color: #555; min-width: 120px;">CT-e:</div>
          <div class="info-value-rastreamento" style="color: #333;">${
            nota.cte || "-"
          }</div>
        </div>
        <div class="info-item-rastreamento" style="display: flex; margin-bottom: 12px;">
          <div class="info-label-rastreamento" style="font-weight: 600; color: #555; min-width: 120px;">Transportadora:</div>
          <div class="info-value-rastreamento destaque" style="color: #247675; font-weight: 600;">${
            nota.transportadora.nome
          }</div>
        </div>
      </div>
      <div class="info-card-rastreamento" style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: all 0.2s ease;">
        <h4 style="margin: 0 0 16px 0; color: #333; font-size: 18px; font-weight: 600; padding-bottom: 8px; border-bottom: 2px solid #247675;">Informações de Transporte</h4>
        <div class="info-item-rastreamento" style="display: flex; margin-bottom: 12px;">
          <div class="info-label-rastreamento" style="font-weight: 600; color: #555; min-width: 120px;">Origem:</div>
          <div class="info-value-rastreamento" style="color: #333;">${
            nota.origem
          }</div>
        </div>
        <div class="info-item-rastreamento" style="display: flex; margin-bottom: 12px;">
          <div class="info-label-rastreamento" style="font-weight: 600; color: #555; min-width: 120px;">Destino:</div>
          <div class="info-value-rastreamento" style="color: #333;">${
            nota.destino
          }</div>
        </div>
        <div class="info-item-rastreamento" style="display: flex; margin-bottom: 12px;">
          <div class="info-label-rastreamento" style="font-weight: 600; color: #555; min-width: 120px;">Data de Faturamento:</div>
          <div class="info-value-rastreamento" style="color: #333;">${window.RastreamentoUtils.formatarData(
            nota.docDate
          )}</div>
        </div>
        <div class="info-item-rastreamento" style="display: flex; margin-bottom: 12px;">
          <div class="info-label-rastreamento" style="font-weight: 600; color: #555; min-width: 120px;">Data de Envio:</div>
          <div class="info-value-rastreamento" style="color: #333;">${window.RastreamentoUtils.formatarData(
            nota.dataEnvio
          )}</div>
        </div>
        <div class="info-item-rastreamento" style="display: flex; margin-bottom: 12px;">
          <div class="info-label-rastreamento" style="font-weight: 600; color: #555; min-width: 120px;">Previsão:</div>
          <div class="info-value-rastreamento ${
            nota.atrasada ? "atrasado" : ""
          }" style="color: ${nota.atrasada ? "#dc3545" : "#333"}; ${
    nota.atrasada ? "font-weight: 600;" : ""
  }">${window.RastreamentoUtils.formatarData(nota.previsaoEntrega)}</div>
        </div>
        <div class="info-item-rastreamento" style="display: flex; margin-bottom: 12px;">
          <div class="info-label-rastreamento" style="font-weight: 600; color: #555; min-width: 120px;">Última Atualização:</div>
          <div class="info-value-rastreamento" style="color: #333;">${
            nota.ultimaAtualizacao
          }</div>
        </div>
      </div>
    </div>
    ${timelineHTML}
  `;
};
