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

    const obsLimitado = obs.substring(0, 200);
    const cidadePorPadrao = extrairCidadePorPadroes(obsLimitado);
    if (cidadePorPadrao) {
      return cidadePorPadrao;
    }

    return extrairCidadePorHifen(obsLimitado);
  };

  const removerSufixosCidade = (cidade) => {
    const sufixos = [" DO", " DA", " DOS", " DAS"];
    for (const suf of sufixos) {
      if (cidade.toUpperCase().endsWith(suf.toUpperCase())) {
        return cidade.substring(0, cidade.length - suf.length).trim();
      }
    }
    return cidade;
  };

  const removerUFDoFinal = (cidade) => {
    const idxHifenFinal = cidade.lastIndexOf(" - ");
    if (idxHifenFinal === -1) {
      return cidade;
    }

    const depoisHifen = cidade.substring(idxHifenFinal + 3).trim();
    if (depoisHifen.length === 2 && depoisHifen === depoisHifen.toUpperCase()) {
      return cidade.substring(0, idxHifenFinal).trim();
    }
    return cidade;
  };

  const validarCidade = (cidade) => {
    if (!cidade || cidade.length === 0 || cidade.length > 50) {
      return false;
    }

    const primeiraLetra = cidade.charAt(0);
    return (
      primeiraLetra === primeiraLetra.toUpperCase() &&
      primeiraLetra !== primeiraLetra.toLowerCase()
    );
  };

  const extrairCidadeSegura = (texto, prefixo, sufixo) => {
    const prefixoLower = prefixo.toLowerCase();
    const textoLower = texto.toLowerCase();
    const idxInicio = textoLower.indexOf(prefixoLower);

    if (idxInicio === -1) return null;

    const inicioCidade = idxInicio + prefixoLower.length;
    const idxFim = sufixo
      ? textoLower.indexOf(sufixo.toLowerCase(), inicioCidade)
      : textoLower.indexOf(" - ", inicioCidade);

    if (idxFim === -1 && sufixo) return null;

    const fimCidade =
      idxFim !== -1 ? idxFim : Math.min(inicioCidade + 50, texto.length);
    let cidade = texto.substring(inicioCidade, fimCidade).trim();

    cidade = removerSufixosCidade(cidade);
    cidade = removerUFDoFinal(cidade);

    return validarCidade(cidade) ? cidade : null;
  };

  const extrairCidadePorPadroes = (obsLimitado) => {
    const padroes = [
      { prefixo: "Saida de ", sufixo: " em" },
      { prefixo: "chegada na base ", sufixo: " em" },
      { prefixo: "base ", sufixo: " em" },
    ];

    for (const padrao of padroes) {
      try {
        const cidade = extrairCidadeSegura(
          obsLimitado,
          padrao.prefixo,
          padrao.sufixo
        );
        if (cidade) {
          return cidade;
        }
      } catch (error) {
        console.warn("Erro ao processar padrão:", error);
        continue;
      }
    }

    return null;
  };

  const isUF = (texto) => {
    if (texto.length < 2) return false;
    const duasPrimeiras = texto.substring(0, 2);
    return (
      duasPrimeiras === duasPrimeiras.toUpperCase() &&
      duasPrimeiras !== duasPrimeiras.toLowerCase() &&
      duasPrimeiras.length === 2
    );
  };

  const extrairCidadeDePalavras = (palavras) => {
    let cidade = "";

    for (let i = Math.max(0, palavras.length - 4); i < palavras.length; i++) {
      const palavra = palavras[i];
      if (palavra.length === 0) continue;

      const primeiraLetra = palavra.charAt(0);
      if (
        primeiraLetra === primeiraLetra.toUpperCase() &&
        primeiraLetra !== primeiraLetra.toLowerCase()
      ) {
        if (cidade) cidade += " ";
        cidade += palavra;
        if (cidade.length > 50) break;
      }
    }

    if (!validarCidade(cidade)) {
      return null;
    }

    return removerSufixosCidade(cidade);
  };

  const extrairCidadePorHifen = (obsLimitado) => {
    try {
      const idxHifen = obsLimitado.indexOf(" - ");
      if (idxHifen === -1) {
        return null;
      }

      const antesHifen = obsLimitado.substring(0, idxHifen).trim();
      const depoisHifen = obsLimitado.substring(idxHifen + 3).trim();

      if (depoisHifen.length < 2 || !isUF(depoisHifen)) {
        return null;
      }

      const palavras = antesHifen.split(" ").filter((p) => p.length > 0);
      return extrairCidadeDePalavras(palavras);
    } catch (error) {
      console.warn("Erro ao processar padrão Cidade - UF:", error);
      return null;
    }
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
            const getStatusFromDescricao = (descricao) => {
              const descLower = descricao.toLowerCase();
              if (
                descLower.includes("entrega") &&
                descLower.includes("realizada")
              ) {
                return { statusColor: "#4caf50", icon: "fas fa-check-circle" };
              }
              if (descLower.includes("manifestado")) {
                return { statusColor: "#ff9800", icon: "fas fa-truck" };
              }
              if (
                descLower.includes("transferencia") &&
                descLower.includes("iniciada")
              ) {
                return { statusColor: "#2196f3", icon: "fas fa-arrow-right" };
              }
              if (
                descLower.includes("transferencia") &&
                descLower.includes("finalizada")
              ) {
                return { statusColor: "#03a9f4", icon: "fas fa-exchange-alt" };
              }
              if (descLower.includes("emissao")) {
                return { statusColor: "#8bc34a", icon: "fas fa-file-alt" };
              }
              return { statusColor: "#757575", icon: "fas fa-clock" };
            };

            const isEntregaRealizada = (ocorrencia) => {
              return (
                (ocorrencia.DESCOCORRENCIA &&
                  ocorrencia.DESCOCORRENCIA.includes("ENTREGA REALIZADA")) ||
                ocorrencia.CODOCORRENCIA === "108" ||
                ocorrencia.CODOCORRENCIA === "001" ||
                ocorrencia.codigo_ocorrencia === "01" ||
                (ocorrencia.ocorrencia &&
                  ocorrencia.ocorrencia.includes("MERCADORIA ENTREGUE"))
              );
            };

            const getStatusFromCodigo = (codigoOcorrencia) => {
              switch (codigoOcorrencia) {
                case "101":
                case "71":
                case "80":
                case "74":
                  return {
                    statusColor: "#9c27b0",
                    icon: "fas fa-file-invoice",
                  };
                case "000":
                  return {
                    statusColor: "#ff9800",
                    icon: "fas fa-truck-loading",
                  };
                case "104":
                case "105":
                case "83":
                case "77":
                case "84":
                  return { statusColor: "#03a9f4", icon: "fas fa-warehouse" };
                case "106":
                case "82":
                case "76":
                case "85":
                  return { statusColor: "#00bcd4", icon: "fas fa-truck" };
                case "108":
                case "001":
                case "01":
                  return {
                    statusColor: "#4caf50",
                    icon: "fas fa-check-circle",
                  };
                default:
                  return { statusColor: "#757575", icon: "fas fa-clock" };
              }
            };

            const determineStatusAndIcon = (ocorrencia) => {
              if (ocorrencia.descricao) {
                return getStatusFromDescricao(ocorrencia.descricao);
              }

              if (isEntregaRealizada(ocorrencia)) {
                if (ocorrencia.isPrevisao) {
                  return { statusColor: "#bdbdbd", icon: "fas fa-clock" };
                }
                return { statusColor: "#4caf50", icon: "fas fa-check-circle" };
              }

              const codigoOcorrencia =
                ocorrencia.CODOCORRENCIA || ocorrencia.codigo_ocorrencia;
              return getStatusFromCodigo(codigoOcorrencia);
            };

            const { statusColor, icon } = determineStatusAndIcon(ocorrencia);

            const formatTimelineData = (ocorrencia) => {
              if (ocorrencia.DATAOCORRENCIA) {
                return window.RastreamentoUtils.formatarData(
                  ocorrencia.DATAOCORRENCIA
                );
              }
              if (ocorrencia.data_hora) {
                return window.RastreamentoUtils.formatarData(
                  ocorrencia.data_hora.split("T")[0]
                );
              }
              if (ocorrencia.data) {
                return window.RastreamentoUtils.formatarData(
                  ocorrencia.data.split(" ")[0]
                );
              }
              return "-";
            };

            const formatTimelineHora = (ocorrencia) => {
              if (ocorrencia.isPrevisao) {
                return "Previsão";
              }
              if (ocorrencia.HORAOCORRENCIA) {
                return ocorrencia.HORAOCORRENCIA;
              }
              if (ocorrencia.data_hora) {
                return (
                  ocorrencia.data_hora.split("T")[1]?.substring(0, 5) || "-"
                );
              }
              if (ocorrencia.data) {
                return ocorrencia.data.split(" ")[1]?.substring(0, 5) || "-";
              }
              return "-";
            };

            const formatTimelineTitulo = (ocorrencia) => {
              if (ocorrencia.isPrevisao) {
                return "Previsão de Entrega";
              }
              return (
                ocorrencia.DESCOCORRENCIA ||
                ocorrencia.ocorrencia ||
                ocorrencia.descricao ||
                "Evento de Rastreamento"
              );
            };

            const formatTimelineLocation = (ocorrencia, nota) => {
              let cidade =
                ocorrencia.CIDADE ||
                ocorrencia.cidade ||
                extrairCidadeDaObs(ocorrencia.obs) ||
                nota.destino?.split(", ")[0] ||
                "-";

              let estado = ocorrencia.UF || nota.destino?.split(", ")[1] || "-";

              if (cidade.includes(" / ")) {
                const partes = cidade.split(" / ");
                cidade = partes[0];
                if (estado === "-" && partes[1]) {
                  estado = partes[1];
                }
              }

              return `${cidade}, ${estado}`;
            };

            const renderTimelineConnector = (index, statusColor) => {
              if (index >= historicoOrdenado.length - 1) {
                return "";
              }

              const proximaOcorrencia = historicoOrdenado[index + 1];
              const isDashed =
                proximaOcorrencia?.isPrevisao &&
                !ocorrencia.DESCOCORRENCIA?.includes(
                  "EM TRANSITO PARA ENTREGA"
                );

              const connectorStyle = isDashed
                ? `border-top: 2px dashed ${statusColor}; background: none;`
                : `background: linear-gradient(90deg, ${statusColor}, ${statusColor}80);`;

              return `
                <div class="timeline-connector" style="position: absolute; top: 25px; left: 50%; width: calc(100% + 15px); height: 2px; z-index: 1; ${connectorStyle}"></div>
              `;
            };

            return `
              <div class="timeline-step" style="position: relative; display: flex; flex-direction: column; align-items: center; min-width: 180px; max-width: 200px; flex-shrink: 0;">
                ${renderTimelineConnector(index, statusColor)}
                
                <div class="timeline-circle" style="position: relative; width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, ${statusColor}, ${statusColor}dd); display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px ${statusColor}40; z-index: 2; margin-bottom: 12px;">
                  <i class="${icon}" style="color: white; font-size: 18px;"></i>
                </div>
                
                <div class="timeline-content" style="text-align: center; background: white; padding: 12px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 2px solid ${statusColor}20; height: 120px; display: flex; flex-direction: column; justify-content: center; width: 100%; box-sizing: border-box;">
                  <h5 style="margin: 0 0 6px 0; color: ${
                    ocorrencia.isPrevisao ? "#999" : "#333"
                  }; font-size: 13px; font-weight: 600; line-height: 1.2;">${formatTimelineTitulo(
              ocorrencia
            )}</h5>
                  <p style="margin: 0 0 4px 0; color: ${
                    ocorrencia.isPrevisao ? "#999" : "#666"
                  }; font-size: 11px; font-weight: 500;">${formatTimelineData(
              ocorrencia
            )}</p>
                  <p style="margin: 0 0 6px 0; color: ${
                    ocorrencia.isPrevisao ? "#ccc" : "#888"
                  }; font-size: 10px;">${formatTimelineHora(ocorrencia)}</p>
                  <div class="timeline-location" style="display: flex; align-items: center; justify-content: center; gap: 3px; font-size: 10px; color: ${
                    ocorrencia.isPrevisao ? "#999" : "#666"
                  }; margin-top: auto;">
                    <i class="fas fa-map-marker-alt" style="color: ${statusColor}; font-size: 9px;"></i>
                    <span style="text-align: center; line-height: 1.1;">${formatTimelineLocation(
                      ocorrencia,
                      nota
                    )}</span>
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
  const getStatusColor = (status, atrasada) => {
    if (atrasada) return "#f44336";
    if (status === "Aguardando coleta") return "#ff9800";
    if (status === "Em trânsito") return "#03a9f4";
    if (status === "Entregue") return "#4caf50";
    if (status === "Em processamento") return "#9c27b0";
    if (status === "Em rota de entrega") return "#00bcd4";
    return "#757575";
  };

  const renderInfoItem = (label, value, options = {}) => {
    const {
      isHighlighted = false,
      isAtrasado = false,
      customStyle = "",
    } = options;
    const valueStyle = isHighlighted
      ? "color: #247675; font-weight: 600;"
      : isAtrasado
      ? "color: #dc3545; font-weight: 600;"
      : "color: #333;";
    const valueClass = isAtrasado ? "atrasado" : "";

    return `
        <div class="info-item-rastreamento" style="display: flex; margin-bottom: 12px;">
          <div class="info-label-rastreamento" style="font-weight: 600; color: #555; min-width: 120px;">${label}:</div>
          <div class="info-value-rastreamento ${valueClass}" style="${valueStyle} ${customStyle}">${value}</div>
        </div>
    `;
  };

  const renderStatusBadge = (status, atrasada) => {
    const statusColor = getStatusColor(status, atrasada);
    return `
            <span style="display: inline-block; padding: 4px 8px; border-radius: 50px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: white; background: ${statusColor};">
              ${status}
            </span>
    `;
  };

  const renderNotaInfoSection = (nota) => {
    return `
      <div class="info-card-rastreamento" style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: all 0.2s ease;">
        <h4 style="margin: 0 0 16px 0; color: #333; font-size: 18px; font-weight: 600; padding-bottom: 8px; border-bottom: 2px solid #247675;">Informações da Nota</h4>
        ${renderInfoItem("Número", nota.numero, {
          customStyle: "font-weight: 600;",
        })}
        ${renderInfoItem(
          "Status",
          renderStatusBadge(nota.status, nota.atrasada)
        )}
        ${renderInfoItem("Cliente", nota.cliente || "-")}
        ${renderInfoItem("CT-e", nota.cte || "-")}
        ${renderInfoItem("Transportadora", nota.transportadora.nome, {
          isHighlighted: true,
        })}
      </div>
    `;
  };

  const renderTransporteInfoSection = (nota) => {
    return `
      <div class="info-card-rastreamento" style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: all 0.2s ease;">
        <h4 style="margin: 0 0 16px 0; color: #333; font-size: 18px; font-weight: 600; padding-bottom: 8px; border-bottom: 2px solid #247675;">Informações de Transporte</h4>
        ${renderInfoItem("Origem", nota.origem)}
        ${renderInfoItem("Destino", nota.destino)}
        ${renderInfoItem(
          "Data de Faturamento",
          window.RastreamentoUtils.formatarData(nota.docDate)
        )}
        ${renderInfoItem(
          "Data de Envio",
          window.RastreamentoUtils.formatarData(nota.dataEnvio)
        )}
        ${renderInfoItem(
          "Previsão",
          window.RastreamentoUtils.formatarData(nota.previsaoEntrega),
          { isAtrasado: nota.atrasada }
        )}
        ${renderInfoItem("Última Atualização", nota.ultimaAtualizacao)}
      </div>
    `;
  };

  const timelineHTML = window.RastreamentoModalRenderers.renderizarTimeline(
    nota.historico,
    nota
  );

  return `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
      ${renderNotaInfoSection(nota)}
      ${renderTransporteInfoSection(nota)}
    </div>
    ${timelineHTML}
  `;
};
