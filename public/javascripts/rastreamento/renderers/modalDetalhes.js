window.RastreamentoModalRenderers = window.RastreamentoModalRenderers || {};

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

  const extrairCidadeDaObs = (obs) => {
    if (!obs) return null;

    const padroes = [
      /Saida de ([A-ZÁÊÇÕ][a-záêçõ\s]+(?:DO|DA|DOS|DAS)?)\s+em/i,
      /chegada na base ([A-ZÁÊÇÕ][a-záêçõ\s]+(?:DO|DA|DOS|DAS)?)\s+em/i,
      /base ([A-ZÁÊÇÕ][a-záêçõ\s]+(?:DO|DA|DOS|DAS)?)\s+em/i,
      /([A-ZÁÊÇÕ][a-záêçõ\s]+(?:DO|DA|DOS|DAS)?)\s*-\s*[A-Z]{2}/i,
    ];

    for (const padrao of padroes) {
      const match = obs.match(padrao);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  };

  const removerDuplicados = (historico) => {
    const eventosUnicos = [];
    const toleranciaMinutos = 2;

    historico.forEach((evento) => {
      const eventoData = evento.data
        ? new Date(evento.data)
        : evento.data_hora
        ? new Date(evento.data_hora)
        : new Date(`${evento.DATAOCORRENCIA} ${evento.HORAOCORRENCIA}`);

      const descricao =
        evento.descricao || evento.DESCOCORRENCIA || evento.ocorrencia || "";

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

  const historicoSemDuplicados = removerDuplicados(historico);

  const historicoOrdenado = [...historicoSemDuplicados].sort((a, b) => {
    let dataA, dataB;

    if (a.DATAOCORRENCIA) {
      dataA = new Date(`${a.DATAOCORRENCIA} ${a.HORAOCORRENCIA}`);
    } else if (a.data_hora) {
      dataA = new Date(a.data_hora);
    } else if (a.data) {
      dataA = new Date(a.data);
    } else {
      dataA = new Date(0);
    }

    if (b.DATAOCORRENCIA) {
      dataB = new Date(`${b.DATAOCORRENCIA} ${b.HORAOCORRENCIA}`);
    } else if (b.data_hora) {
      dataB = new Date(b.data_hora);
    } else if (b.data) {
      dataB = new Date(b.data);
    } else {
      dataB = new Date(0);
    }

    return dataA - dataB;
  });

  const foiEntregue = historicoOrdenado.some(
    (oc) =>
      (oc.DESCOCORRENCIA && oc.DESCOCORRENCIA.includes("ENTREGA REALIZADA")) ||
      (oc.descricao && oc.descricao.includes("ENTREGA REALIZADA")) ||
      oc.CODOCORRENCIA === "108" ||
      oc.CODOCORRENCIA === "001" ||
      oc.codigo_ocorrencia === "01" ||
      (oc.ocorrencia && oc.ocorrencia.includes("MERCADORIA ENTREGUE"))
  );

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
      isPrevisao: true,
    });
  }

  return `
    <h4 style="margin-top: 30px; margin-bottom: 20px; color: #333; font-size: 20px; font-weight: 600; border-bottom: 2px solid #247675; padding-bottom: 10px; text-align: center;">Histórico de Rastreamento</h4>
    <div class="timeline-container" style="position: relative; margin-top: 20px;">
      <div class="timeline-controls" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <button class="timeline-nav-btn timeline-nav-left" style="background: #247675; color: white; border: none; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px; transition: all 0.3s ease; opacity: 0.7;" disabled>
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="timeline-info" style="text-align: center; color: #666; font-size: 14px;">
          <span class="timeline-current">1</span> de <span class="timeline-total">${
            historicoOrdenado.length
          }</span> ocorrências
        </div>
        <button class="timeline-nav-btn timeline-nav-right" style="background: #247675; color: white; border: none; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px; transition: all 0.3s ease;">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <div class="timeline-scroll-container" style="position: relative; overflow: hidden; border-radius: 8px; background: #f8f9fa; padding: 10px;">
        <div class="timeline-horizontal" style="position: relative; padding: 25px 0; overflow-x: auto; display: flex; scroll-behavior: smooth; scrollbar-width: thin; scrollbar-color: #247675 #f1f1f1;">
          <div class="timeline-track" style="position: relative; display: flex; min-width: max-content; gap: 15px; padding: 0 15px; justify-content: flex-start; align-items: center;">
        ${historicoOrdenado
          .map((ocorrencia, index) => {
            let statusColor = "#757575";
            let icon = "fas fa-clock";

            if (ocorrencia.descricao) {
              const descricao = ocorrencia.descricao.toLowerCase();

              if (
                descricao.includes("entrega") &&
                descricao.includes("realizada")
              ) {
                statusColor = "#4caf50";
                icon = "fas fa-check-circle";
              } else if (descricao.includes("manifestado")) {
                statusColor = "#ff9800";
                icon = "fas fa-truck";
              } else if (
                descricao.includes("transferencia") &&
                descricao.includes("iniciada")
              ) {
                statusColor = "#2196f3";
                icon = "fas fa-arrow-right";
              } else if (
                descricao.includes("transferencia") &&
                descricao.includes("finalizada")
              ) {
                statusColor = "#03a9f4";
                icon = "fas fa-exchange-alt";
              } else if (descricao.includes("emissao")) {
                statusColor = "#8bc34a";
                icon = "fas fa-file-alt";
              } else {
                statusColor = "#757575";
                icon = "fas fa-clock";
              }
            } else if (
              (ocorrencia.DESCOCORRENCIA &&
                ocorrencia.DESCOCORRENCIA.includes("ENTREGA REALIZADA")) ||
              ocorrencia.CODOCORRENCIA === "108" ||
              ocorrencia.CODOCORRENCIA === "001" ||
              ocorrencia.codigo_ocorrencia === "01" ||
              (ocorrencia.ocorrencia &&
                ocorrencia.ocorrencia.includes("MERCADORIA ENTREGUE"))
            ) {
              if (ocorrencia.isPrevisao) {
                statusColor = "#bdbdbd";
                icon = "fas fa-clock";
              } else {
                statusColor = "#4caf50";
                icon = "fas fa-check-circle";
              }
            } else {
              const codigoOcorrencia =
                ocorrencia.CODOCORRENCIA || ocorrencia.codigo_ocorrencia;

              switch (codigoOcorrencia) {
                case "101":
                case "71":
                case "80":
                case "74":
                  statusColor = "#9c27b0";
                  icon = "fas fa-file-invoice";
                  break;
                case "000":
                  statusColor = "#ff9800";
                  icon = "fas fa-truck-loading";
                  break;
                case "104":
                case "105":
                case "83":
                case "77":
                case "84":
                  statusColor = "#03a9f4";
                  icon = "fas fa-warehouse";
                  break;
                case "106":
                case "82":
                case "76":
                  statusColor = "#00bcd4";
                  icon = "fas fa-truck";
                  break;
                case "85":
                  statusColor = "#00bcd4";
                  icon = "fas fa-truck";
                  break;
                case "108":
                case "001":
                case "01":
                  statusColor = "#4caf50";
                  icon = "fas fa-check-circle";
                  break;
              }
            }

            return `
              <div class="timeline-step" style="position: relative; display: flex; flex-direction: column; align-items: center; min-width: 180px; max-width: 200px; flex-shrink: 0;">
                ${
                  index < historicoOrdenado.length - 1
                    ? `
                  <div class="timeline-connector" style="position: absolute; top: 25px; left: 50%; width: calc(100% + 15px); height: 2px; z-index: 1; ${
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
                
                <div class="timeline-circle" style="position: relative; width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, ${statusColor}, ${statusColor}dd); display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px ${statusColor}40; z-index: 2; margin-bottom: 12px;">
                  <i class="${icon}" style="color: white; font-size: 18px;"></i>
                </div>
                
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
                    <span style="text-align: center; line-height: 1.1;">${(() => {
                      let cidade =
                        ocorrencia.CIDADE ||
                        ocorrencia.cidade ||
                        extrairCidadeDaObs(ocorrencia.obs) ||
                        nota.destino?.split(", ")[0] ||
                        "-";

                      let estado =
                        ocorrencia.UF || nota.destino?.split(", ")[1] || "-";

                      if (cidade.includes(" / ")) {
                        const partes = cidade.split(" / ");
                        cidade = partes[0];
                        if (estado === "-" && partes[1]) {
                          estado = partes[1];
                        }
                      }

                      return `${cidade}, ${estado}`;
                    })()}</span>
                  </div>
                </div>
              </div>
            `;
          })
          .join("")}
          </div>
        </div>
      </div>
    </div>
  `;
};

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
