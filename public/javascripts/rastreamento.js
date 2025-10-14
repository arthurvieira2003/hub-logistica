// Dados das transportadoras (em produção, esses dados viriam de uma API)
const transportadoras = [
  {
    id: 1,
    nome: "Ouro Negro",
    cor: "255, 204, 0", // RGB para amarelo e preto
    logo: "../assets/images/transportadoras/ouro-negro.svg",
    notas: [], // Será preenchido com dados reais da API
  },
  {
    id: 2,
    nome: "Expresso Leomar LTDA",
    cor: "0, 52, 150", // RGB para azul Leomar
    logo: "../assets/images/transportadoras/leomar.png",
    notas: [], // Será preenchido com dados reais da API
  },
  {
    id: 3,
    nome: "Schreiber Logística LTDA",
    cor: "21, 50, 127", // RGB para azul Schreiber
    logo: "../assets/images/transportadoras/schreiber.svg",
    notas: [], // Será preenchido com dados reais da API
  },
  {
    id: 4,
    nome: "Mengue Express transportes LTDA",
    cor: "255, 101, 38", // RGB para laranja Mengue
    logo: "../assets/images/transportadoras/mengue.png",
    notas: [], // Será preenchido com dados reais da API
  },
  {
    id: 5,
    nome: "Transportes Expresso Santa Catarina LTDA",
    cor: "2, 118, 116", // RGB para transportadora sem logo
    logo: "fas fa-truck",
    notas: [], // Será preenchido com dados reais da API
  },
  {
    id: 6,
    nome: "Expresso Princesa Dos Campos S/A",
    cor: "2, 118, 116", // RGB para transportadora sem logo
    logo: "../assets/images/transportadoras/princesa.png",
    notas: [], // Será preenchido com dados reais da API
  },
];

// Configuração para data de rastreamento da Ouro Negro (hoje)
let dataRastreamento = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

// Inicializar modal globalmente
function inicializarModal() {
  criarCSSModal();
  criarModalIndependente();
}

// Inicializar modal quando o script carregar
document.addEventListener("DOMContentLoaded", inicializarModal);

// Função para renderizar o logo da transportadora (imagem ou ícone FontAwesome)
function renderizarLogoTransportadora(transportadora) {
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
}

// Função para obter a cor da borda da transportadora
function obterCorBordaTransportadora(nomeTransportadora) {
  const coresTransportadoras = {
    "Ouro Negro": "rgba(255, 204, 0, 0.3)",
    "Expresso Leomar LTDA": "rgba(0, 52, 150, 0.3)",
    "Schreiber Logística LTDA": "rgba(21, 50, 127, 0.3)",
    "Mengue Express transportes LTDA": "rgba(255, 101, 38, 0.3)",
    "Transportes Expresso Santa Catarina LTDA": "rgba(2, 118, 116, 0.3)",
    "Expresso Princesa Dos Campos S/A": "rgba(14, 88, 46, 0.3)",
  };

  return coresTransportadoras[nomeTransportadora] || "rgba(2, 118, 116, 0.3)"; // Cor padrão
}

// Função para formatar data no formato DD/MM/YYYY
function formatarData(dataString) {
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
}

// Função para recarregar dados com nova data
async function recarregarDadosComNovaData(novaData) {
  try {
    console.log(`🔄 Recarregando dados para a data: ${novaData}`);

    // Atualizar a variável global
    dataRastreamento = novaData;

    // Limpar dados existentes de todas as transportadoras
    transportadoras.forEach((transportadora) => {
      transportadora.notas = [];
    });

    // Carregar novos dados de ambas as fontes
    const sucessoOuroNegro = await carregarDadosOuroNegro();
    const sucessoGenericos = await carregarDadosGenericos();

    if (sucessoOuroNegro || sucessoGenericos) {
      // Re-renderizar apenas a tabela sem recarregar dados
      const trackingView = document.getElementById("trackingView");
      if (trackingView) {
        // Limpar conteúdo existente
        trackingView.innerHTML = "";

        // Processar as notas para identificar as atrasadas
        let totalNotasAtrasadas = 0;
        let todasNotas = [];

        transportadoras.forEach((transportadora) => {
          let notasAtrasadas = 0;

          transportadora.notas.forEach((nota) => {
            if (verificarNotaAtrasada(nota)) {
              nota.atrasada = true;
              nota.statusExibicao = "Atrasado";
              notasAtrasadas++;
              totalNotasAtrasadas++;
            } else {
              nota.atrasada = false;
              nota.statusExibicao = nota.status;
            }

            // Adicionar referência à transportadora para uso na tabela
            nota.transportadora = {
              id: transportadora.id,
              nome: transportadora.nome,
              cor: transportadora.cor,
              logo: transportadora.logo,
            };

            todasNotas.push(nota);
          });

          transportadora.notasAtrasadas = notasAtrasadas;
        });

        // Ordenar todas as notas
        todasNotas.sort((a, b) => {
          if (a.atrasada && !b.atrasada) return -1;
          if (!a.atrasada && b.atrasada) return 1;
          const dataA = a.docDate
            ? new Date(a.docDate.split(" ")[0])
            : new Date(0);
          const dataB = b.docDate
            ? new Date(b.docDate.split(" ")[0])
            : new Date(0);
          if (dataB - dataA !== 0) {
            return dataB - dataA;
          }
          return parseInt(b.numero) - parseInt(a.numero);
        });

        // Renderizar tabela com os dados já carregados
        if (todasNotas.length > 0) {
          const tabelaSimples = document.createElement("div");
          tabelaSimples.style.transition = "all 0.3s ease";
          tabelaSimples.style.animation = "fadeIn 0.5s ease-out forwards";
          tabelaSimples.innerHTML = `
            <div class="header-rastreamento" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #247675;">
              <div class="stats" style="display: flex; gap: 16px;">
                <div class="stat-item" style="background-color: #f8f9fa; border-radius: 8px; padding: 10px 16px; display: flex; flex-direction: column; align-items: center; min-width: 100px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: all 0.2s ease;">
                  <div class="stat-value" style="font-size: 24px; font-weight: 700; color: #247675;">${
                    todasNotas.length
                  }</div>
                  <div class="stat-label" style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Notas</div>
                </div>
                <div class="stat-item" style="background-color: #f8f9fa; border-radius: 8px; padding: 10px 16px; display: flex; flex-direction: column; align-items: center; min-width: 100px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: all 0.2s ease;">
                  <div class="stat-value" style="font-size: 24px; font-weight: 700; color: #247675;">${
                    todasNotas.filter(
                      (n) =>
                        n.status === "Em trânsito" ||
                        n.status === "Em rota de entrega"
                    ).length
                  }</div>
                  <div class="stat-label" style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Em Trânsito</div>
                </div>
                <div class="stat-item" style="background-color: #f8f9fa; border-radius: 8px; padding: 10px 16px; display: flex; flex-direction: column; align-items: center; min-width: 100px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: all 0.2s ease;">
                  <div class="stat-value" style="font-size: 24px; font-weight: 700; color: #247675;">${
                    todasNotas.filter((n) => n.status === "Entregue").length
                  }</div>
                  <div class="stat-label" style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Entregues</div>
                </div>
                <div class="stat-item" style="background-color: #f8f9fa; border-radius: 8px; padding: 10px 16px; display: flex; flex-direction: column; align-items: center; min-width: 100px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: all 0.2s ease;">
                  <div class="stat-value" style="font-size: 24px; font-weight: 700; color: #247675;">${
                    todasNotas.filter((n) => n.atrasada).length
                  }</div>
                  <div class="stat-label" style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Atrasadas</div>
                </div>
              </div>
              
              <div class="date-selector" style="display: flex; align-items: center; gap: 12px;">
                <label for="dataRastreamento" style="font-size: 14px; font-weight: 600; color: #333;">Data:</label>
                <input type="date" id="dataRastreamento" value="${dataRastreamento}" style="padding: 8px 12px; border: 2px solid #247675; border-radius: 6px; font-size: 14px; color: #333; background: white; cursor: pointer; transition: all 0.2s ease;">
                <button id="btnAtualizarData" style="background: #247675; color: white; border: none; border-radius: 6px; padding: 8px 16px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 6px;">
                  <i class="fas fa-sync-alt"></i> Atualizar
                </button>
              </div>
            </div>
            
            <div style="overflow-x: auto; width: 100%;" class="tabela-container">
              <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #247675;">
                    <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid rgba(255,255,255,0.1);">Nota</th>
                    <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid rgba(255,255,255,0.1);">Transportadora</th>
                    <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid rgba(255,255,255,0.1);">Status</th>
                    <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid rgba(255,255,255,0.1);">Cliente</th>
                    <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid rgba(255,255,255,0.1);">Origem</th>
                    <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid rgba(255,255,255,0.1);">Destino</th>
                    <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid rgba(255,255,255,0.1);">Faturamento</th>
                    <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid rgba(255,255,255,0.1);">Data Envio</th>
                    <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid rgba(255,255,255,0.1);">Previsão</th>
                    <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid rgba(255,255,255,0.1);">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  ${todasNotas
                    .map((nota, index) => {
                      let borderColor = obterCorBordaTransportadora(
                        nota.transportadora.nome
                      );

                      return `
                      <tr style="background-color: ${
                        index % 2 === 0 ? "#f9f9f9" : "#fff"
                      }; transition: all 0.3s ease; border-left: 4px solid ${borderColor};">
                        <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee;"><strong>${
                          nota.numero
                        }</strong></td>
                        <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee;">
                          <div style="display: flex; align-items: center; gap: 8px;">
                            ${renderizarLogoTransportadora(nota.transportadora)}
                            <span>${nota.transportadora.nome}</span>
                          </div>
                        </td>
                        <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee;">
                          <span style="display: inline-block; padding: 6px 12px; border-radius: 50px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: white; background: ${
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
                          }; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            ${nota.status}
                          </span>
                        </td>
                        <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${
                          nota.cliente || "-"
                        }">${nota.cliente || "-"}</td>
                        <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee;">${
                          nota.origem
                        }</td>
                        <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee;">${
                          nota.destino
                        }</td>
                        <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; font-family: 'Courier New', monospace; font-weight: 600; color: #555;">${formatarData(
                          nota.docDate
                        )}</td>
                        <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; font-family: 'Courier New', monospace; font-weight: 600; color: #555;">${formatarData(
                          nota.dataEnvio
                        )}</td>
                        <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; font-family: 'Courier New', monospace; font-weight: 600; color: ${
                          nota.atrasada ? "#dc3545" : "#555"
                        };">${
                        nota.status === "Aguardando coleta"
                          ? "-"
                          : formatarData(nota.previsaoEntrega)
                      }</td>
                        <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee;">
                          <button class="btn-detalhes detalhes-btn" data-nota="${
                            nota.numero
                          }" style="background: #247675; color: white; border: none; border-radius: 50px; padding: 8px 16px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 5px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <i class="fas fa-eye"></i> Detalhes
                          </button>
                        </td>
                      </tr>
                    `;
                    })
                    .join("")}
                </tbody>
              </table>
            </div>
          `;

          trackingView.appendChild(tabelaSimples);

          // Adicionar eventos aos botões de detalhes
          setTimeout(() => {
            document.querySelectorAll(".detalhes-btn").forEach((button) => {
              button.addEventListener("click", function () {
                const notaNumero = this.getAttribute("data-nota");
                const nota = todasNotas.find((n) => n.numero === notaNumero);
                if (nota) {
                  // Criar conteúdo do modal com detalhes da nota
                  let timelineHTML = "";

                  if (nota.historico && nota.historico.length > 0) {
                    // Ordenar histórico por data
                    const historicoOrdenado = [...nota.historico].sort(
                      (a, b) => {
                        const dataA = a.DATAOCORRENCIA
                          ? new Date(`${a.DATAOCORRENCIA} ${a.HORAOCORRENCIA}`)
                          : new Date(a.data_hora);
                        const dataB = b.DATAOCORRENCIA
                          ? new Date(`${b.DATAOCORRENCIA} ${b.HORAOCORRENCIA}`)
                          : new Date(b.data_hora);
                        return dataA - dataB;
                      }
                    );

                    // Verificar se foi entregue
                    const foiEntregue = historicoOrdenado.some(
                      (oc) =>
                        (oc.DESCOCORRENCIA &&
                          oc.DESCOCORRENCIA.includes("ENTREGA REALIZADA")) ||
                        oc.CODOCORRENCIA === "108" ||
                        oc.CODOCORRENCIA === "001" ||
                        oc.codigo_ocorrencia === "01" ||
                        (oc.ocorrencia &&
                          oc.ocorrencia.includes("MERCADORIA ENTREGUE"))
                    );

                    // Se não foi entregue, adicionar previsão de entrega
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

                    timelineHTML = `
                      <h4 style="margin-top: 30px; margin-bottom: 20px; color: #333; font-size: 20px; font-weight: 600; border-bottom: 2px solid #247675; padding-bottom: 10px; text-align: center;">Histórico de Rastreamento</h4>
                      <div class="timeline-horizontal" style="position: relative; padding: 25px 0; margin-top: 20px; overflow-x: auto; display: flex; justify-content: center;">
                        <div class="timeline-track" style="position: relative; display: flex; min-width: max-content; gap: 15px; padding: 0 15px; justify-content: center; align-items: center;">
                          ${historicoOrdenado
                            .map((ocorrencia, index) => {
                              const codigoOcorrencia =
                                ocorrencia.CODOCORRENCIA ||
                                ocorrencia.codigo_ocorrencia;
                              let statusColor = "#03a9f4";
                              let icon = "fas fa-truck";

                              switch (codigoOcorrencia) {
                                case "001":
                                case "108":
                                  statusColor = "#4caf50";
                                  icon = "fas fa-check-circle";
                                  break;
                                case "106":
                                  statusColor = "#00bcd4";
                                  icon = "fas fa-shipping-fast";
                                  break;
                                case "105":
                                case "84":
                                  statusColor = "#03a9f4";
                                  icon = "fas fa-warehouse";
                                  break;
                                case "104":
                                case "83":
                                  statusColor = "#9c27b0";
                                  icon = "fas fa-exchange-alt";
                                  break;
                                case "82":
                                  statusColor = "#ff9800";
                                  icon = "fas fa-road";
                                  break;
                                case "71":
                                case "80":
                                case "74":
                                  statusColor = "#607d8b";
                                  icon = "fas fa-file-alt";
                                  break;
                                default:
                                  statusColor = "#757575";
                                  icon = "fas fa-info-circle";
                              }

                              if (ocorrencia.isPrevisao) {
                                statusColor = "#ffc107";
                                icon = "fas fa-clock";
                              }

                              return `
                                <div class="timeline-step" style="position: relative; display: flex; flex-direction: column; align-items: center; min-width: 180px; max-width: 200px; flex-shrink: 0;">
                                  <!-- Linha conectora -->
                                  ${
                                    index < historicoOrdenado.length - 1
                                      ? `
                                        <div class="timeline-connector" style="position: absolute; top: 25px; left: 50%; width: calc(100% + 15px); height: 2px; z-index: 1; ${
                                          historicoOrdenado[index + 1]
                                            ?.isPrevisao &&
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
                                    ocorrencia.ocorrencia
                              }</h5>
                                    <p style="margin: 0 0 4px 0; color: ${
                                      ocorrencia.isPrevisao ? "#999" : "#666"
                                    }; font-size: 11px; font-weight: 500;">${formatarData(
                                ocorrencia.DATAOCORRENCIA ||
                                  ocorrencia.data_hora.split("T")[0]
                              )}</p>
                                    <p style="margin: 0 0 6px 0; color: ${
                                      ocorrencia.isPrevisao ? "#ccc" : "#888"
                                    }; font-size: 10px;">${
                                ocorrencia.isPrevisao
                                  ? "Previsão"
                                  : ocorrencia.HORAOCORRENCIA ||
                                    ocorrencia.data_hora
                                      .split("T")[1]
                                      ?.substring(0, 5) ||
                                    "00:00"
                              }</p>
                                    <div class="timeline-location" style="display: flex; align-items: center; justify-content: center; gap: 3px; font-size: 10px; color: ${
                                      ocorrencia.isPrevisao ? "#999" : "#666"
                                    }; margin-top: auto;">
                                      <i class="fas fa-map-marker-alt" style="color: ${statusColor}; font-size: 9px;"></i>
                                      <span style="text-align: center; line-height: 1.1;">${
                                        ocorrencia.CIDADE ||
                                        ocorrencia.cidade ||
                                        "-"
                                      }, ${
                                ocorrencia.UF ||
                                ocorrencia.cidade?.split(" / ")[1] ||
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
                  }

                  const conteudoModal = `
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
                          <div class="info-value-rastreamento" style="color: #333;">${formatarData(
                            nota.docDate
                          )}</div>
                        </div>
                        <div class="info-item-rastreamento" style="display: flex; margin-bottom: 12px;">
                          <div class="info-label-rastreamento" style="font-weight: 600; color: #555; min-width: 120px;">Data de Envio:</div>
                          <div class="info-value-rastreamento" style="color: #333;">${formatarData(
                            nota.dataEnvio
                          )}</div>
                        </div>
                        <div class="info-item-rastreamento" style="display: flex; margin-bottom: 12px;">
                          <div class="info-label-rastreamento" style="font-weight: 600; color: #555; min-width: 120px;">Previsão:</div>
                          <div class="info-value-rastreamento ${
                            nota.atrasada ? "atrasado" : ""
                          }" style="color: ${
                    nota.atrasada ? "#dc3545" : "#333"
                  }; ${
                    nota.atrasada ? "font-weight: 600;" : ""
                  }">${formatarData(nota.previsaoEntrega)}</div>
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

                  // Abrir modal com detalhes da nota
                  abrirModal(conteudoModal, `Detalhes da Nota ${notaNumero}`);
                }
              });
            });
          }, 100);
        } else {
          // Exibir mensagem quando não há notas, mas incluir o datepicker
          const containerVazio = document.createElement("div");
          containerVazio.style.transition = "all 0.3s ease";
          containerVazio.style.animation = "fadeIn 0.5s ease-out forwards";
          containerVazio.innerHTML = `
            <div class="header-rastreamento" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #247675;">
              <div class="stats" style="display: flex; gap: 16px;">
                <div class="stat-item" style="background-color: #f8f9fa; border-radius: 8px; padding: 10px 16px; display: flex; flex-direction: column; align-items: center; min-width: 100px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: all 0.2s ease;">
                  <div class="stat-value" style="font-size: 24px; font-weight: 700; color: #247675;">0</div>
                  <div class="stat-label" style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Notas</div>
                </div>
                <div class="stat-item" style="background-color: #f8f9fa; border-radius: 8px; padding: 10px 16px; display: flex; flex-direction: column; align-items: center; min-width: 100px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: all 0.2s ease;">
                  <div class="stat-value" style="font-size: 24px; font-weight: 700; color: #247675;">0</div>
                  <div class="stat-label" style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Em Trânsito</div>
                </div>
                <div class="stat-item" style="background-color: #f8f9fa; border-radius: 8px; padding: 10px 16px; display: flex; flex-direction: column; align-items: center; min-width: 100px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: all 0.2s ease;">
                  <div class="stat-value" style="font-size: 24px; font-weight: 700; color: #247675;">0</div>
                  <div class="stat-label" style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Entregues</div>
                </div>
                <div class="stat-item" style="background-color: #f8f9fa; border-radius: 8px; padding: 10px 16px; display: flex; flex-direction: column; align-items: center; min-width: 100px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: all 0.2s ease;">
                  <div class="stat-value" style="font-size: 24px; font-weight: 700; color: #247675;">0</div>
                  <div class="stat-label" style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Atrasadas</div>
                </div>
              </div>
              
              <div class="date-selector" style="display: flex; align-items: center; gap: 12px;">
                <label for="dataRastreamento" style="font-size: 14px; font-weight: 600; color: #333;">Data:</label>
                <input type="date" id="dataRastreamento" value="${dataRastreamento}" style="padding: 8px 12px; border: 2px solid #247675; border-radius: 6px; font-size: 14px; color: #333; background: white; cursor: pointer; transition: all 0.2s ease;">
                <button id="btnAtualizarData" style="background: #247675; color: white; border: none; border-radius: 6px; padding: 8px 16px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 6px;">
                  <i class="fas fa-sync-alt"></i> Atualizar
                </button>
              </div>
            </div>
            
            <div style="text-align: center; padding: 60px 20px; color: #666;">
              <div style="background-color: #f8f9fa; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <i class="fas fa-search" style="font-size: 48px; color: #247675; margin-bottom: 20px;"></i>
                <h3 style="margin: 0 0 16px 0; color: #333; font-size: 24px; font-weight: 600;">Nenhuma nota encontrada</h3>
                <p style="margin: 0 0 24px 0; color: #666; font-size: 16px;">Não foram encontradas notas de rastreamento para a data <strong>${formatarData(
                  dataRastreamento
                )}</strong></p>
                <p style="margin: 0; color: #888; font-size: 14px;">Tente selecionar uma data diferente ou verifique se há envios programados para esta data.</p>
              </div>
            </div>
          `;

          trackingView.appendChild(containerVazio);

          // Adicionar eventos ao datepicker mesmo quando não há notas
          setTimeout(() => {
            const dataInput = document.getElementById("dataRastreamento");
            const btnAtualizar = document.getElementById("btnAtualizarData");

            if (dataInput && btnAtualizar) {
              btnAtualizar.addEventListener("click", async function () {
                const novaData = dataInput.value;
                if (novaData && novaData !== dataRastreamento) {
                  // Mostrar loading no botão
                  const originalText = this.innerHTML;
                  this.innerHTML =
                    '<i class="fas fa-spinner fa-spin"></i> Carregando...';
                  this.disabled = true;

                  try {
                    await recarregarDadosComNovaData(novaData);
                  } finally {
                    // Restaurar botão
                    this.innerHTML = originalText;
                    this.disabled = false;
                  }
                }
              });
            }
          }, 100);
        }
      }
      console.log(`✅ Dados recarregados com sucesso para ${novaData}`);
    } else {
      console.error(`❌ Erro ao recarregar dados para ${novaData}`);
    }

    return sucessoOuroNegro || sucessoGenericos;
  } catch (error) {
    console.error("Erro ao recarregar dados:", error);
    return false;
  }
}

// Função utilitária para obter o token de autenticação
function obterToken() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
}

// Função para carregar dados do endpoint genérico (outras transportadoras)
async function carregarDadosGenericos() {
  try {
    const token = obterToken();

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
      console.log(
        `ℹ️ Nenhum dado genérico encontrado para a data ${dataRastreamento}: ${
          responseData.message || "Resposta vazia"
        }`
      );
      return true; // Retorna true pois não é um erro, apenas não há dados
    }

    // Verificar se há dados para processar
    if (data.length === 0) {
      console.log(
        `ℹ️ Nenhum dado genérico encontrado para a data ${dataRastreamento}`
      );
      return true;
    }

    // Processar os dados recebidos e adicionar às transportadoras
    data.forEach((item) => {
      // Determinar o status com base nos dados recebidos
      let status = "Aguardando coleta";
      let ultimaAtualizacao = "";

      try {
        ultimaAtualizacao = formatarDataHora(item.docDate);
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
          ultimaAtualizacao = formatarDataHora(ultimaOcorrencia.data_hora);
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
            cor = "52, 152, 219"; // Azul
            break;
          case "Schreiber Logística LTDA":
            cor = "76, 175, 80"; // Verde
            break;
          case "Mengue Express transportes LTDA":
            cor = "156, 39, 176"; // Roxo
            break;
          case "Transportes Expresso Santa Catarina LTDA":
            cor = "255, 87, 34"; // Laranja
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

    console.log(
      `✅ Carregados dados genéricos para a data ${dataRastreamento}`
    );
    return true;
  } catch (error) {
    console.error("Erro ao carregar dados genéricos:", error);
    return false;
  }
}

// Função para carregar dados reais de rastreamento da Ouro Negro
async function carregarDadosOuroNegro() {
  try {
    const token = obterToken();

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
      console.log(
        `ℹ️ Nenhum dado da Ouro Negro encontrado para a data ${dataRastreamento}`
      );
      return true; // Retorna true pois não é um erro, apenas não há dados
    }

    // Encontrar a transportadora Ouro Negro no array
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
        ultimaAtualizacao = formatarDataHora(item.docDate);
      } catch (error) {
        ultimaAtualizacao = item.docDate;
      }

      let ultimaCidade = item.bplName.split(" - ")[0]; // Extrair cidade da origem
      let ultimaUF = ""; // Será preenchido se houver rastreamento

      // Verificar se há informações de rastreamento válidas
      if (item.rastreamento && item.rastreamento.code === "400") {
        // Caso onde não há informações de rastreamento
        console.log(
          `⚠️ Sem rastreamento para nota ${item.serial}: ${item.rastreamento.message}`
        );
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

        // Log estratégico para debug do status (apenas para casos especiais)
        if (
          status === "Entregue" &&
          !item.rastreamento.some(
            (r) => r.CODOCORRENCIA === "108" || r.CODOCORRENCIA === "001"
          )
        ) {
          console.log(
            `⚠️ Inconsistência detectada na nota ${item.serial}: Status entregue mas sem código de entrega`
          );
        }

        // Atualizar última atualização
        try {
          ultimaAtualizacao = `${formatarData(
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

    console.log(
      `✅ Carregadas ${transportadoras[ouroNegroIndex].notas.length} notas da Ouro Negro para a data ${dataRastreamento}`
    );
    return true;
  } catch (error) {
    console.error("Erro ao carregar dados da Ouro Negro:", error);
    return false;
  }
}

// Função auxiliar para formatar data e hora
function formatarDataHora(dataString) {
  if (!dataString) return "";

  const partes = dataString.split(" ");
  if (partes.length < 2) return formatarData(dataString);

  return `${formatarData(partes[0])} ${partes[1].substring(0, 5)}`;
}

// Função para verificar se uma nota está atrasada
function verificarNotaAtrasada(nota) {
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
  // Ou seja, se já passou do prazo (hoje > previsao)
  // Notas com previsão para hoje ou futuro não são consideradas atrasadas
  const isAtrasada = hoje > previsao;

  return isAtrasada;
}

// Função para criar CSS do modal (executada apenas uma vez)
function criarCSSModal() {
  // Verificar se o CSS já foi adicionado
  if (document.getElementById("modalCSS")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "modalCSS";
  style.textContent = `
    /* Estilos para o modal independente */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(5px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }
    
    .modal-overlay.active {
      opacity: 1;
      visibility: visible;
    }
    
    .modal-container {
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 85%;
      width: 85%;
      max-height: 95vh;
      height: auto;
      overflow-y: auto;
      transform: scale(0.9);
      transition: transform 0.3s ease;
    }
    
    .modal-overlay.active .modal-container {
      transform: scale(1);
    }
    
    .modal-header {
      background-color: #247675;
      color: #ffffff;
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 12px 12px 0 0;
    }
    
    .modal-header h3 {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
    }
    
    .modal-close {
      background: transparent;
      border: none;
      color: #ffffff;
      font-size: 24px;
      cursor: pointer;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s ease;
    }
    
    .modal-close:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .modal-body {
      padding: 24px;
    }
    
    /* Bloquear scroll do body quando modal estiver aberto */
    body.modal-open {
      overflow: hidden;
    }
    
    /* Estilos para timeline horizontal */
    .timeline-horizontal {
      scrollbar-width: thin;
      scrollbar-color: #247675 #f1f1f1;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .timeline-track {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap;
    }
    
    .timeline-horizontal::-webkit-scrollbar {
      height: 8px;
    }
    
    .timeline-horizontal::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }
    
    .timeline-horizontal::-webkit-scrollbar-thumb {
      background: #247675;
      border-radius: 4px;
    }
    
    .timeline-horizontal::-webkit-scrollbar-thumb:hover {
      background: #1a5a5a;
    }
    
    .timeline-step:hover .timeline-circle {
      transform: scale(1.1);
      transition: transform 0.3s ease;
    }
    
    .timeline-step:hover .timeline-content {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
    }

    /* Responsivo */
    @media (max-width: 768px) {
      .modal-container {
        width: 90%;
        max-height: 98vh;
        height: auto;
      }
      .modal-header {
        padding: 15px 20px;
      }
      .modal-body {
        padding: 20px;
      }
      
      .timeline-step {
        min-width: 160px !important;
        max-width: 180px !important;
      }
      
      .timeline-circle {
        width: 45px !important;
        height: 45px !important;
      }
      
      .timeline-circle i {
        font-size: 16px !important;
      }
      
      .timeline-content {
        padding: 10px !important;
        height: 100px !important;
      }
      
      .timeline-content h5 {
        font-size: 12px !important;
      }
      
      .timeline-content p {
        font-size: 10px !important;
      }
      
      .timeline-horizontal {
        justify-content: flex-start !important;
      }
      
      .timeline-track {
        justify-content: flex-start !important;
      }
    }
    
    @media (max-width: 480px) {
      .timeline-step {
        min-width: 140px !important;
        max-width: 160px !important;
      }
      
      .timeline-circle {
        width: 40px !important;
        height: 40px !important;
      }
      
      .timeline-circle i {
        font-size: 14px !important;
      }
      
      .timeline-content {
        padding: 8px !important;
        height: 90px !important;
      }
      
      .timeline-content h5 {
        font-size: 11px !important;
      }
      
      .timeline-content p {
        font-size: 9px !important;
      }
    }
  `;

  document.head.appendChild(style);
}

// Função para criar modal independente
function criarModalIndependente() {
  // Criar CSS do modal primeiro
  criarCSSModal();

  // Verificar se o modal já existe
  if (document.getElementById("modalOverlay")) {
    return;
  }

  // Criar o overlay do modal
  const modalOverlay = document.createElement("div");
  modalOverlay.id = "modalOverlay";
  modalOverlay.className = "modal-overlay";

  // Criar o container do modal
  const modalContainer = document.createElement("div");
  modalContainer.className = "modal-container";

  // Criar o cabeçalho
  const modalHeader = document.createElement("div");
  modalHeader.className = "modal-header";
  modalHeader.innerHTML = `
    <h3 id="modalNotaNumero">Detalhes da Nota</h3>
    <button id="modalCloseBtn" class="modal-close">&times;</button>
  `;

  // Criar o corpo
  const modalBody = document.createElement("div");
  modalBody.className = "modal-body";
  modalBody.id = "modalBody";

  // Montar a estrutura
  modalContainer.appendChild(modalHeader);
  modalContainer.appendChild(modalBody);
  modalOverlay.appendChild(modalContainer);

  // Adicionar ao body
  document.body.appendChild(modalOverlay);

  // Adicionar eventos
  const closeBtn = document.getElementById("modalCloseBtn");
  closeBtn.addEventListener("click", fecharModal);

  modalOverlay.addEventListener("click", function (e) {
    if (e.target === modalOverlay) {
      fecharModal();
    }
  });

  // Fechar com ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
      fecharModal();
    }
  });
}

// Função para abrir o modal
function abrirModal(conteudo, titulo = "Detalhes da Nota") {
  // Garantir que o modal existe
  inicializarModal();

  const modalOverlay = document.getElementById("modalOverlay");
  const modalNotaNumero = document.getElementById("modalNotaNumero");
  const modalBody = document.getElementById("modalBody");

  if (!modalOverlay || !modalNotaNumero || !modalBody) {
    console.error("Modal não foi criado corretamente");
    return;
  }

  // Bloquear scroll do body
  document.body.classList.add("modal-open");

  // Definir conteúdo
  modalNotaNumero.textContent = titulo;
  modalBody.innerHTML = conteudo;

  // Mostrar modal
  modalOverlay.classList.add("active");
}

// Função para fechar o modal
function fecharModal() {
  const modalOverlay = document.getElementById("modalOverlay");
  if (modalOverlay) {
    modalOverlay.classList.remove("active");
    // Remover bloqueio de scroll
    document.body.classList.remove("modal-open");
  }
}

// Função para inicializar a interface de rastreamento
async function initRastreamento(contentElement) {
  // Verificar se contentElement foi fornecido, se não, tentar encontrar o trackingView
  if (!contentElement) {
    contentElement = document.getElementById("trackingView");
    if (!contentElement) {
      console.error(
        "trackingView não encontrado e contentElement não fornecido"
      );
      return;
    }
  }

  // Carregar Font Awesome se não estiver disponível
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const fontAwesome = document.createElement("link");
    fontAwesome.rel = "stylesheet";
    fontAwesome.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css";
    document.head.appendChild(fontAwesome);
  }

  // Carregar dados reais da Ouro Negro e outras transportadoras antes de processar a interface
  try {
    await carregarDadosOuroNegro();
    await carregarDadosGenericos();
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  }

  // Processar as notas para identificar as atrasadas
  let totalNotasAtrasadas = 0;
  let todasNotas = [];

  transportadoras.forEach((transportadora) => {
    let notasAtrasadas = 0;

    transportadora.notas.forEach((nota) => {
      if (verificarNotaAtrasada(nota)) {
        nota.atrasada = true;
        // Manter o status original para referência, mas exibir como "Atrasado"
        nota.statusExibicao = "Atrasado";
        notasAtrasadas++;
        totalNotasAtrasadas++;
      } else {
        nota.atrasada = false;
        nota.statusExibicao = nota.status;
      }

      // Adicionar referência à transportadora para uso na tabela
      nota.transportadora = {
        id: transportadora.id,
        nome: transportadora.nome,
        cor: transportadora.cor,
        logo: transportadora.logo,
      };

      // Adicionar à lista de todas as notas para a visualização em tabela
      todasNotas.push(nota);
    });

    // Adicionar contador de notas atrasadas à transportadora
    transportadora.notasAtrasadas = notasAtrasadas;

    // Ordenar as notas: primeiro as atrasadas, depois por data de previsão
    transportadora.notas.sort((a, b) => {
      if (a.atrasada && !b.atrasada) return -1;
      if (!a.atrasada && b.atrasada) return 1;

      // Se ambas têm o mesmo status de atraso, ordenar por data de previsão
      const dataA = new Date(a.previsaoEntrega);
      const dataB = new Date(b.previsaoEntrega);
      return dataA - dataB;
    });
  });

  // Ordenar todas as notas para a visualização em tabela
  todasNotas.sort((a, b) => {
    if (a.atrasada && !b.atrasada) return -1;
    if (!a.atrasada && b.atrasada) return 1;

    // Se ambas têm o mesmo status de atraso, ordenar por data de previsão
    const dataA = new Date(a.previsaoEntrega);
    const dataB = new Date(b.previsaoEntrega);
    return dataA - dataB;
  });

  // Verificar se estamos usando a nova estrutura HTML com dashboard
  const dashboardView = document.getElementById("dashboardView");
  const trackingView = document.getElementById("trackingView");

  if (dashboardView && trackingView) {
    // Não modifica o estado inicial das views
    // Apenas verificar se o trackingView está presente

    // Verificar se o trackingView está visível
    const trackingViewStyle = window.getComputedStyle(trackingView);

    // NOVA ABORDAGEM: Criar uma tabela simples diretamente no trackingView

    // Limpar o conteúdo existente do trackingView para evitar duplicação
    contentElement.innerHTML = "";

    // Obter todas as notas de todas as transportadoras
    let todasNotas = [];
    transportadoras.forEach((transportadora) => {
      if (transportadora.notas && transportadora.notas.length > 0) {
        transportadora.notas.forEach((nota) => {
          // Adicionar referência à transportadora para uso na tabela
          nota.transportadora = {
            id: transportadora.id,
            nome: transportadora.nome,
            cor: transportadora.cor,
            logo: transportadora.logo,
          };
          todasNotas.push(nota);
        });
      }
    });

    if (todasNotas.length > 0) {
      // Ordenar notas por data de faturamento (decrescente) e número da nota (decrescente)
      todasNotas.sort((a, b) => {
        // Primeiro critério: data de faturamento (decrescente)
        const dataA = a.docDate
          ? new Date(a.docDate.split(" ")[0])
          : new Date(0);
        const dataB = b.docDate
          ? new Date(b.docDate.split(" ")[0])
          : new Date(0);
        if (dataB - dataA !== 0) {
          return dataB - dataA;
        }
        // Segundo critério: número da nota (decrescente)
        return parseInt(b.numero) - parseInt(a.numero);
      });

      // Criar uma tabela simples
      const tabelaSimples = document.createElement("div");
      tabelaSimples.style.transition = "all 0.3s ease";
      tabelaSimples.style.animation = "fadeIn 0.5s ease-out forwards";
      tabelaSimples.innerHTML = `
        <style>
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
          
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          /* Font Awesome ícones - removidas as substituições por emojis para maior profissionalismo */
          

          
          /* Estilos para o seletor de data */
          .date-selector input[type="date"]:focus {
            outline: none;
            border-color: #1a5a5a;
            box-shadow: 0 0 0 3px rgba(36, 118, 117, 0.1);
          }
          
          .date-selector button:hover {
            background: #1a5a5a;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          }
          
          .date-selector button:active {
            transform: translateY(0);
          }
          
          .date-selector button i {
            transition: transform 0.3s ease;
          }
          
          .date-selector button:hover i {
            transform: rotate(180deg);
          }
          
          /* Responsivo para o seletor de data */
          @media (max-width: 768px) {
            .header-rastreamento {
              flex-direction: column !important;
              gap: 20px !important;
            }
            
            .date-selector {
              width: 100%;
              justify-content: center;
            }
            
            .date-selector input[type="date"] {
              flex: 1;
              max-width: 200px;
            }
          }
          
          /* Estilos para garantir alinhamento correto da tabela */
          .tabela-container {
            width: 100%;
            overflow-x: auto;
            margin-bottom: 20px;
          }
          
          /* Redefinir estilos da tabela para garantir alinhamento correto */
          .tabela-ouro-negro {
            width: 100%;
            border-collapse: collapse !important;
            border-spacing: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            border-radius: 8px;
            overflow: hidden;
            animation: fadeIn 0.5s ease-out forwards;
            table-layout: fixed !important;
          }
          
          /* Garantir que as células da tabela não se expandam além do necessário */
          .tabela-ouro-negro th, 
          .tabela-ouro-negro td {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            box-sizing: border-box;
          }
          
          .tabela-ouro-negro thead th {
            background-color: #222;
            color: #ffc107;
            padding: 16px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #ffc107;
            position: relative;
            overflow: hidden;
          }
          
          .tabela-ouro-negro thead th::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, #ffc107, #ff9800);
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          
          .tabela-ouro-negro:hover thead th::after {
            transform: translateX(0);
            transition-delay: calc(var(--index) * 0.05s);
          }
          
          .tabela-ouro-negro tbody tr {
            transition: all 0.3s ease;
            animation: slideIn 0.3s ease-out forwards;
            animation-delay: calc(var(--index) * 0.05s);
            opacity: 0;
            position: relative;
          }
          
          .tabela-ouro-negro tbody tr::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: 3px;
            background: linear-gradient(to bottom, #ffc107, #ff9800);
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          .tabela-ouro-negro tbody tr:hover::before {
            opacity: 1;
          }
          
          .tabela-ouro-negro tbody tr:nth-child(odd) {
            background-color: #f9f9f9;
          }
          
          .tabela-ouro-negro tbody tr:hover {
            background-color: #fff9e6;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          .tabela-ouro-negro td {
            padding: 14px 16px;
            border-bottom: 1px solid #eee;
            font-size: 14px;
            vertical-align: middle;
          }
          
          .tabela-ouro-negro .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: all 0.2s ease;
            position: relative;
            overflow: hidden;
          }
          
          .tabela-ouro-negro .status-badge::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
            animation: shimmer 2s infinite;
            pointer-events: none;
          }
          
          .tabela-ouro-negro .status-badge:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          }
          
          .tabela-ouro-negro .status-aguardando {
            background: linear-gradient(135deg, #f0ad4e, #ec971f);
          }
          
          .tabela-ouro-negro .status-transito {
            background: linear-gradient(135deg, #5bc0de, #31b0d5);
          }
          
          .tabela-ouro-negro .status-entregue {
            background: linear-gradient(135deg, #4caf50, #388e3c);
          }
          
          .tabela-ouro-negro .status-processamento {
            background: linear-gradient(135deg, #337ab7, #2e6da4);
          }
          
          .tabela-ouro-negro .status-rota {
            background: linear-gradient(135deg, #5bc0de, #2aabd2);
          }
          
          .tabela-ouro-negro .status-atrasado {
            background: linear-gradient(135deg, #d9534f, #c9302c);
          }
          
          .tabela-ouro-negro .cliente-cell {
            max-width: 200px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .tabela-ouro-negro .data-cell {
            text-align: center;
            font-family: 'Courier New', monospace;
            font-weight: 600;
            color: #555;
          }
          
          .tabela-ouro-negro .atrasado {
            color: #d9534f;
            font-weight: bold;
          }
          
          .btn-detalhes {
            background: linear-gradient(135deg, #222, #444);
            color: #ffc107;
            border: none;
            border-radius: 50px;
            padding: 8px 16px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }
          
          .btn-detalhes:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            background: linear-gradient(135deg, #333, #555);
          }
          
          .btn-detalhes:active {
            transform: translateY(0);
          }
          
          .btn-detalhes i {
            font-size: 14px;
            transition: all 0.3s ease;
          }
          
          
          .header-ouro-negro {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid #ffc107;
          }
          
          .header-ouro-negro h2 {
            margin: 0;
            color: #222;
            font-size: 28px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .header-ouro-negro h2::before {
            content: '';
            display: inline-block;
            width: 24px;
            height: 24px;
            background-color: #ffc107;
            border-radius: 50%;
            animation: pulse 2s infinite ease-in-out;
          }
          
          .header-ouro-negro .stats {
            display: flex;
            gap: 16px;
          }
          
          .header-ouro-negro .stat-item {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 10px 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 100px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            transition: all 0.2s ease;
          }
          
          .header-ouro-negro .stat-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            animation: bounce 1s ease;
          }
          
          .header-ouro-negro .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #222;
            transition: all 0.3s ease;
          }
          
          .header-ouro-negro .stat-item:hover .stat-value {
            color: #ffc107;
            transform: scale(1.1);
          }
          
          .header-ouro-negro .stat-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          /* Modal estilizado */
          .modal-ouro-negro {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.5);
            backdrop-filter: blur(5px);
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          .modal-ouro-negro.active {
            opacity: 1;
          }
          
          .modal-content-ouro-negro {
            background-color: #fff;
            margin: 5% auto;
            width: 80%;
            max-width: 900px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
            transform: scale(0.9);
            opacity: 0;
            transition: all 0.3s ease;
          }
          
          .modal-ouro-negro.active .modal-content-ouro-negro {
            transform: scale(1);
            opacity: 1;
          }
          
          .modal-header-ouro-negro {
            background-color: #3a3a3a;
            color: #ffffff;
            padding: 20px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #4a90e2;
          }
          
          .modal-header-ouro-negro h3 {
            margin: 0;
            font-size: 22px;
            font-weight: 600;
          }
          
          .modal-close-ouro-negro {
            background: transparent;
            border: none;
            color: #ffffff;
            font-size: 24px;
            cursor: pointer;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s ease;
          }
          
          .modal-close-ouro-negro:hover {
            background-color: rgba(255,255,255,0.2);
          }
          
          .modal-body-ouro-negro {
            padding: 24px;
          }
          
          /* Timeline estilizada */
          .timeline-ouro-negro {
            position: relative;
            padding: 20px 0;
            margin-top: 20px;
          }
          
          .timeline-ouro-negro::before {
            content: '';
            position: absolute;
            top: 0;
            left: 20px;
            height: 100%;
            width: 4px;
            background: linear-gradient(to bottom, #4a90e2, #5c6bc0);
            border-radius: 2px;
          }
          
          .timeline-item-ouro-negro {
            position: relative;
            margin-bottom: 25px;
            animation: fadeInUp 0.5s ease forwards;
            animation-delay: calc(var(--index) * 0.1s);
            opacity: 0;
          }
          
          .timeline-item-ouro-negro::before {
            content: '';
            position: absolute;
            left: -36px;
            top: 0;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background-color: #4a90e2;
            border: 3px solid #3a3a3a;
            box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.3);
          }
          
          .timeline-item-ouro-negro.completed::before {
            background-color: #ffc107;
          }
          
          .timeline-content-ouro-negro {
            background-color: #fff;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-left: 3px solid #4a90e2;
          }
          
          .timeline-item-ouro-negro:hover .timeline-content-ouro-negro {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          .timeline-content-ouro-negro h5 {
            margin: 0 0 8px 0;
            color: #333;
            font-size: 16px;
            font-weight: 600;
          }
          
          .timeline-content-ouro-negro p {
            margin: 0;
            color: #666;
            font-size: 14px;
          }
          
          .timeline-location-ouro-negro {
            display: flex;
            align-items: center;
            gap: 5px;
            margin-top: 8px;
            font-size: 14px;
            color: #666;
          }
          
          .timeline-location-ouro-negro i {
            color: #4a90e2;
          }
          
          .info-grid-ouro-negro {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .info-card-ouro-negro {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            transition: all 0.2s ease;
          }
          
          .info-card-ouro-negro:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          .info-card-ouro-negro h4 {
            margin: 0 0 16px 0;
            color: #222;
            font-size: 18px;
            font-weight: 600;
            padding-bottom: 8px;
            border-bottom: 2px solid #4a90e2;
          }
          
          .info-item-ouro-negro {
            display: flex;
            margin-bottom: 12px;
          }
          
          .info-label-ouro-negro {
            font-weight: 600;
            color: #555;
            min-width: 120px;
          }
          
          .info-value-ouro-negro {
            color: #333;
          }
          
          .info-value-ouro-negro.destaque {
            color: #4a90e2;
            font-weight: 600;
          }
          
          .info-value-ouro-negro.atrasado {
            color: #d9534f;
            font-weight: 600;
          }
          
          .sem-dados-ouro-negro {
            text-align: center;
            padding: 30px;
            color: #666;
            font-style: italic;
          }
        </style>
        
        <div class="header-rastreamento" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #247675;">
          <div class="stats" style="display: flex; gap: 16px;">
            <div class="stat-item" style="background-color: #f8f9fa; border-radius: 8px; padding: 10px 16px; display: flex; flex-direction: column; align-items: center; min-width: 100px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: all 0.2s ease;">
              <div class="stat-value" style="font-size: 24px; font-weight: 700; color: #247675;">${
                todasNotas.length
              }</div>
              <div class="stat-label" style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Notas</div>
            </div>
            <div class="stat-item" style="background-color: #f8f9fa; border-radius: 8px; padding: 10px 16px; display: flex; flex-direction: column; align-items: center; min-width: 100px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: all 0.2s ease;">
              <div class="stat-value" style="font-size: 24px; font-weight: 700; color: #247675;">${
                todasNotas.filter(
                  (n) =>
                    n.status === "Em trânsito" ||
                    n.status === "Em rota de entrega"
                ).length
              }</div>
              <div class="stat-label" style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Em Trânsito</div>
            </div>
            <div class="stat-item" style="background-color: #f8f9fa; border-radius: 8px; padding: 10px 16px; display: flex; flex-direction: column; align-items: center; min-width: 100px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: all 0.2s ease;">
              <div class="stat-value" style="font-size: 24px; font-weight: 700; color: #247675;">${
                todasNotas.filter((n) => n.status === "Entregue").length
              }</div>
              <div class="stat-label" style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Entregues</div>
            </div>
            <div class="stat-item" style="background-color: #f8f9fa; border-radius: 8px; padding: 10px 16px; display: flex; flex-direction: column; align-items: center; min-width: 100px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: all 0.2s ease;">
              <div class="stat-value" style="font-size: 24px; font-weight: 700; color: #247675;">${
                todasNotas.filter((n) => n.atrasada).length
              }</div>
              <div class="stat-label" style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Atrasadas</div>
            </div>
          </div>
          
          <div class="date-selector" style="display: flex; align-items: center; gap: 12px;">
            <label for="dataRastreamento" style="font-size: 14px; font-weight: 600; color: #333;">Data:</label>
            <input type="date" id="dataRastreamento" value="${dataRastreamento}" style="padding: 8px 12px; border: 2px solid #247675; border-radius: 6px; font-size: 14px; color: #333; background: white; cursor: pointer; transition: all 0.2s ease;">
            <button id="btnAtualizarData" style="background: #247675; color: white; border: none; border-radius: 6px; padding: 8px 16px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 6px;">
              <i class="fas fa-sync-alt"></i> Atualizar
            </button>
          </div>
        </div>
          
        <div style="overflow-x: auto; width: 100%;" class="tabela-container">
          <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
              <thead>
              <tr style="background-color: #247675;">
                <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid rgba(255,255,255,0.1);">Nota</th>
                <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid rgba(255,255,255,0.1);">Transportadora</th>
                <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid rgba(255,255,255,0.1);">Status</th>
                <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid rgba(255,255,255,0.1);">Cliente</th>
                <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid rgba(255,255,255,0.1);">Origem</th>
                <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid rgba(255,255,255,0.1);">Destino</th>
                <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid rgba(255,255,255,0.1);">Faturamento</th>
                <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid rgba(255,255,255,0.1);">Data Envio</th>
                <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid rgba(255,255,255,0.1);">Previsão</th>
                <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid rgba(255,255,255,0.1);">Ações</th>
                </tr>
              </thead>
              <tbody>
              ${todasNotas
                .map((nota, index) => {
                  let borderColor = obterCorBordaTransportadora(
                    nota.transportadora.nome
                  );

                  return `
                <tr style="background-color: ${
                  index % 2 === 0 ? "#f9f9f9" : "#fff"
                }; transition: all 0.3s ease; border-left: 4px solid ${borderColor};">
                  <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee;"><strong>${
                    nota.numero
                  }</strong></td>
                  <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      ${renderizarLogoTransportadora(nota.transportadora)}
                      <span>${nota.transportadora.nome}</span>
                    </div>
                  </td>
                  <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee;">
                    <span style="display: inline-block; padding: 6px 12px; border-radius: 50px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: white; background: ${
                      nota.status === "Aguardando coleta"
                        ? "#ff9800" // Laranja para aguardando
                        : nota.status === "Em trânsito"
                        ? "#03a9f4" // Azul claro para em trânsito
                        : nota.status === "Entregue"
                        ? "#4caf50" // Verde para entregue
                        : nota.status === "Em processamento"
                        ? "#9c27b0" // Roxo para processamento
                        : nota.status === "Em rota de entrega"
                        ? "#00bcd4" // Ciano para rota de entrega
                        : nota.atrasada
                        ? "#f44336" // Vermelho para atrasado
                        : "#757575" // Cinza para outros status
                    }; box-shadow: 0 2px 4px ${
                    nota.status === "Aguardando coleta"
                      ? "rgba(255, 152, 0, 0.3)"
                      : nota.status === "Em trânsito"
                      ? "rgba(3, 169, 244, 0.3)"
                      : nota.status === "Entregue"
                      ? "rgba(76, 175, 80, 0.3)"
                      : nota.status === "Em processamento"
                      ? "rgba(156, 39, 176, 0.3)"
                      : nota.status === "Em rota de entrega"
                      ? "rgba(0, 188, 212, 0.3)"
                      : nota.atrasada
                      ? "rgba(244, 67, 54, 0.3)"
                      : "rgba(117, 117, 117, 0.3)"
                  };">
                      ${nota.status}
                      ${nota.atrasada ? "" : ""}
                      </span>
                    </td>
                  <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${
                    nota.cliente || "-"
                  }">${nota.cliente || "-"}</td>
                  <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee;">
                    ${nota.origem}
                  </td>
                  <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee;">${
                    nota.destino
                  }</td>
                  <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; font-family: 'Courier New', monospace; font-weight: 600; color: #555;">${formatarData(
                    nota.docDate
                  )}</td>
                  <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; font-family: 'Courier New', monospace; font-weight: 600; color: #555;">${formatarData(
                    nota.dataEnvio
                  )}</td>
                  <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; font-family: 'Courier New', monospace; font-weight: 600; color: ${
                    nota.atrasada ? "#dc3545" : "#555"
                  };">${
                    nota.status === "Aguardando coleta"
                      ? "-"
                      : formatarData(nota.previsaoEntrega)
                  }</td>
                  <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee;">
                    <button class="btn-detalhes detalhes-btn" data-nota="${
                      nota.numero
                    }" style="background: #247675; color: white; border: none; border-radius: 50px; padding: 8px 16px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 5px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; gap: 6px;">
                      <i class="fas fa-eye"></i> Detalhes
                      </button>
                    </td>
                  </tr>
                `;
                })
                .join("")}
              </tbody>
            </table>
        </div>
        
      </div>
    `;

      trackingView.appendChild(tabelaSimples);
    } else {
      // Exibir mensagem quando não há notas, mas incluir o datepicker
      const containerVazio = document.createElement("div");
      containerVazio.style.transition = "all 0.3s ease";
      containerVazio.style.animation = "fadeIn 0.5s ease-out forwards";
      containerVazio.innerHTML = `
        <div class="header-rastreamento" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #247675;">
          <div class="stats" style="display: flex; gap: 16px;">
            <div class="stat-item" style="background-color: #f8f9fa; border-radius: 8px; padding: 10px 16px; display: flex; flex-direction: column; align-items: center; min-width: 100px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: all 0.2s ease;">
              <div class="stat-value" style="font-size: 24px; font-weight: 700; color: #247675;">0</div>
              <div class="stat-label" style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Notas</div>
            </div>
            <div class="stat-item" style="background-color: #f8f9fa; border-radius: 8px; padding: 10px 16px; display: flex; flex-direction: column; align-items: center; min-width: 100px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: all 0.2s ease;">
              <div class="stat-value" style="font-size: 24px; font-weight: 700; color: #247675;">0</div>
              <div class="stat-label" style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Em Trânsito</div>
            </div>
            <div class="stat-item" style="background-color: #f8f9fa; border-radius: 8px; padding: 10px 16px; display: flex; flex-direction: column; align-items: center; min-width: 100px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: all 0.2s ease;">
              <div class="stat-value" style="font-size: 24px; font-weight: 700; color: #247675;">0</div>
              <div class="stat-label" style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Entregues</div>
            </div>
            <div class="stat-item" style="background-color: #f8f9fa; border-radius: 8px; padding: 10px 16px; display: flex; flex-direction: column; align-items: center; min-width: 100px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: all 0.2s ease;">
              <div class="stat-value" style="font-size: 24px; font-weight: 700; color: #247675;">0</div>
              <div class="stat-label" style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Atrasadas</div>
            </div>
          </div>
          
          <div class="date-selector" style="display: flex; align-items: center; gap: 12px;">
            <label for="dataRastreamento" style="font-size: 14px; font-weight: 600; color: #333;">Data:</label>
            <input type="date" id="dataRastreamento" value="${dataRastreamento}" style="padding: 8px 12px; border: 2px solid #247675; border-radius: 6px; font-size: 14px; color: #333; background: white; cursor: pointer; transition: all 0.2s ease;">
            <button id="btnAtualizarData" style="background: #247675; color: white; border: none; border-radius: 6px; padding: 8px 16px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 6px;">
              <i class="fas fa-sync-alt"></i> Atualizar
            </button>
          </div>
        </div>
        
        <div style="text-align: center; padding: 60px 20px; color: #666;">
          <div style="background-color: #f8f9fa; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <i class="fas fa-search" style="font-size: 48px; color: #247675; margin-bottom: 20px;"></i>
            <h3 style="margin: 0 0 16px 0; color: #333; font-size: 24px; font-weight: 600;">Nenhuma nota encontrada</h3>
            <p style="margin: 0 0 24px 0; color: #666; font-size: 16px;">Não foram encontradas notas de rastreamento para a data <strong>${formatarData(
              dataRastreamento
            )}</strong></p>
            <p style="margin: 0; color: #888; font-size: 14px;">Tente selecionar uma data diferente ou verifique se há envios programados para esta data.</p>
          </div>
        </div>
      `;

      contentElement.appendChild(containerVazio);

      // Adicionar eventos ao datepicker mesmo quando não há notas
      setTimeout(() => {
        const dataInput = document.getElementById("dataRastreamento");
        const btnAtualizar = document.getElementById("btnAtualizarData");

        if (dataInput && btnAtualizar) {
          btnAtualizar.addEventListener("click", async function () {
            const novaData = dataInput.value;
            if (novaData && novaData !== dataRastreamento) {
              // Mostrar loading no botão
              const originalText = this.innerHTML;
              this.innerHTML =
                '<i class="fas fa-spinner fa-spin"></i> Carregando...';
              this.disabled = true;

              try {
                await recarregarDadosComNovaData(novaData);
              } finally {
                // Restaurar botão
                this.innerHTML = originalText;
                this.disabled = false;
              }
            }
          });
        }
      }, 100);
    }

    // Modal já foi inicializado globalmente

    // Adicionar eventos aos botões de detalhes apenas se houver notas
    if (todasNotas.length > 0) {
      setTimeout(() => {
        document.querySelectorAll(".detalhes-btn").forEach((button) => {
          button.addEventListener("click", function () {
            const notaNumero = this.getAttribute("data-nota");

            // Encontrar a nota
            const nota = todasNotas.find((n) => n.numero === notaNumero);
            if (nota) {
              // Criar conteúdo do modal
              let timelineHTML = "";

              if (nota.historico && nota.historico.length > 0) {
                // Ordenar histórico por data e hora (mais antigo primeiro)
                const historicoOrdenado = [...nota.historico].sort((a, b) => {
                  // Verificar se é formato da Ouro Negro ou formato genérico
                  const dataA = a.DATAOCORRENCIA
                    ? new Date(`${a.DATAOCORRENCIA} ${a.HORAOCORRENCIA}`)
                    : new Date(a.data_hora);
                  const dataB = b.DATAOCORRENCIA
                    ? new Date(`${b.DATAOCORRENCIA} ${b.HORAOCORRENCIA}`)
                    : new Date(b.data_hora);
                  return dataA - dataB;
                });

                // Verificar se a nota foi entregue
                const foiEntregue = historicoOrdenado.some(
                  (oc) =>
                    (oc.DESCOCORRENCIA &&
                      oc.DESCOCORRENCIA.includes("ENTREGA REALIZADA")) ||
                    oc.CODOCORRENCIA === "108" ||
                    oc.CODOCORRENCIA === "001" ||
                    oc.codigo_ocorrencia === "01" ||
                    (oc.ocorrencia &&
                      oc.ocorrencia.includes("MERCADORIA ENTREGUE"))
                );

                // Log estratégico para debug (apenas inconsistências)
                if (
                  (nota.status === "Entregue" && !foiEntregue) ||
                  (nota.status !== "Entregue" && foiEntregue)
                ) {
                  console.log(
                    `⚠️ Inconsistência na nota ${notaNumero}: Status=${nota.status}, Entregue=${foiEntregue}`
                  );
                }

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

                timelineHTML = `
                  <h4 style="margin-top: 30px; margin-bottom: 20px; color: #333; font-size: 20px; font-weight: 600; border-bottom: 2px solid #247675; padding-bottom: 10px; text-align: center;">Histórico de Rastreamento</h4>
                  <div class="timeline-horizontal" style="position: relative; padding: 25px 0; margin-top: 20px; overflow-x: auto; display: flex; justify-content: center;">
                    <div class="timeline-track" style="position: relative; display: flex; min-width: max-content; gap: 15px; padding: 0 15px; justify-content: center; align-items: center;">
                      ${historicoOrdenado
                        .map((ocorrencia, index) => {
                          // Determinar a cor e ícone baseado no código de ocorrência
                          let statusColor = "#757575"; // Cor padrão cinza
                          let icon = "fas fa-clock";
                          let isCompleted = true;

                          // Verificar primeiro se é entrega realizada pela descrição ou código
                          if (
                            (ocorrencia.DESCOCORRENCIA &&
                              ocorrencia.DESCOCORRENCIA.includes(
                                "ENTREGA REALIZADA"
                              )) ||
                            ocorrencia.CODOCORRENCIA === "108" ||
                            ocorrencia.CODOCORRENCIA === "001" ||
                            ocorrencia.codigo_ocorrencia === "01" ||
                            (ocorrencia.ocorrencia &&
                              ocorrencia.ocorrencia.includes(
                                "MERCADORIA ENTREGUE"
                              ))
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
                              ocorrencia.CODOCORRENCIA ||
                              ocorrencia.codigo_ocorrencia;

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
                                ocorrencia.ocorrencia
                          }</h5>
                            <p style="margin: 0 0 4px 0; color: ${
                              ocorrencia.isPrevisao ? "#999" : "#666"
                            }; font-size: 11px; font-weight: 500;">${formatarData(
                            ocorrencia.DATAOCORRENCIA ||
                              ocorrencia.data_hora.split("T")[0]
                          )}</p>
                            <p style="margin: 0 0 6px 0; color: ${
                              ocorrencia.isPrevisao ? "#ccc" : "#888"
                            }; font-size: 10px;">${
                            ocorrencia.isPrevisao
                              ? "Previsão"
                              : ocorrencia.HORAOCORRENCIA ||
                                ocorrencia.data_hora
                                  .split("T")[1]
                                  ?.substring(0, 5)
                          }</p>
                            <div class="timeline-location" style="display: flex; align-items: center; justify-content: center; gap: 3px; font-size: 10px; color: ${
                              ocorrencia.isPrevisao ? "#999" : "#666"
                            }; margin-top: auto;">
                              <i class="fas fa-map-marker-alt" style="color: ${statusColor}; font-size: 9px;"></i>
                              <span style="text-align: center; line-height: 1.1;">${
                                ocorrencia.CIDADE || ocorrencia.cidade
                              }, ${
                            ocorrencia.UF || ocorrencia.cidade?.split(" / ")[1]
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
              } else {
                timelineHTML = `
                    <div class="sem-dados-rastreamento" style="text-align: center; padding: 30px; color: #666; font-style: italic;">
                      <p>Não há histórico de rastreamento disponível para esta nota.</p>
                    </div>
                  `;
              }

              const conteudoModal = `
                  <div class="info-grid-rastreamento" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <div class="info-card-rastreamento" style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: all 0.2s ease;">
                      <h4 style="margin: 0 0 16px 0; color: #333; font-size: 18px; font-weight: 600; padding-bottom: 8px; border-bottom: 2px solid #247675;">Informações da Nota</h4>
                      <div class="info-item-rastreamento" style="display: flex; margin-bottom: 12px;">
                        <div class="info-label-rastreamento" style="font-weight: 600; color: #555; min-width: 120px;">Status:</div>
                        <div class="info-value-rastreamento destaque" style="color: #247675; font-weight: 600;">${
                          nota.status
                        }</div>
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
                        <div class="info-value-rastreamento" style="color: #333;">${formatarData(
                          nota.docDate
                        )}</div>
                      </div>
                      <div class="info-item-rastreamento" style="display: flex; margin-bottom: 12px;">
                        <div class="info-label-rastreamento" style="font-weight: 600; color: #555; min-width: 120px;">Data de Envio:</div>
                        <div class="info-value-rastreamento" style="color: #333;">${formatarData(
                          nota.dataEnvio
                        )}</div>
                      </div>
                      <div class="info-item-rastreamento" style="display: flex; margin-bottom: 12px;">
                        <div class="info-label-rastreamento" style="font-weight: 600; color: #555; min-width: 120px;">Previsão:</div>
                        <div class="info-value-rastreamento ${
                          nota.atrasada ? "atrasado" : ""
                        }" style="color: ${
                nota.atrasada ? "#dc3545" : "#333"
              }; ${nota.atrasada ? "font-weight: 600;" : ""}">${formatarData(
                nota.previsaoEntrega
              )}</div>
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

              // Abrir o modal usando a nova função
              abrirModal(conteudoModal, `Detalhes da Nota ${notaNumero}`);
            }
          });
        });
      }, 500);
    }

    // MODIFICAÇÃO: Adicionar um atraso antes de tentar preencher a tabela
    // para garantir que o DOM foi atualizado
    setTimeout(() => {}, 500);
  }

  // Inicializar os eventos após o HTML ser inserido
  setTimeout(() => {
    try {
      if (typeof initRastreamentoEvents === "function") {
        initRastreamentoEvents();
      }

      if (typeof animateCards === "function") {
        animateCards();
      }
    } catch (error) {
      console.error("Erro ao inicializar eventos:", error);
    }
  }, 100);
}

// Função para aplicar filtros
function aplicarFiltros() {
  const searchTerm = document.getElementById("searchNota").value.toLowerCase();
  const statusFiltros = Array.from(
    document.querySelectorAll(
      '.filter-options input[type="checkbox"][value^="Aguardando"], .filter-options input[type="checkbox"][value="Em trânsito"], .filter-options input[type="checkbox"][value="Entregue"], .filter-options input[type="checkbox"][value="Atrasado"]'
    )
  )
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  const transportadorasFiltros = Array.from(
    document.querySelectorAll('.transportadoras-filter input[type="checkbox"]')
  )
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  // Filtrar cards
  const notaCards = document.querySelectorAll(".nota-card");
  const transportadoraCards = document.querySelectorAll(".transportadora-card");

  // Filtrar notas nos cards
  notaCards.forEach((notaCard) => {
    const notaNumero = notaCard.dataset.numero.toLowerCase();
    const notaStatus = notaCard.dataset.status;
    const transportadoraId = notaCard.closest(".transportadora-card").dataset
      .id;

    const matchesSearch = searchTerm === "" || notaNumero.includes(searchTerm);
    const matchesStatus =
      statusFiltros.length === 0 || statusFiltros.includes(notaStatus);
    const matchesTransportadora =
      transportadorasFiltros.length === 0 ||
      transportadorasFiltros.includes(transportadoraId);

    if (matchesSearch && matchesStatus && matchesTransportadora) {
      notaCard.style.display = "block";
    } else {
      notaCard.style.display = "none";
    }
  });

  // Atualizar visibilidade dos cards de transportadoras
  transportadoraCards.forEach((card) => {
    const visibleNotas = card.querySelectorAll(
      '.nota-card[style="display: block"]'
    ).length;
    if (visibleNotas > 0) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });

  // Filtrar linhas da tabela
  const notaRows = document.querySelectorAll(".tr-nota");

  notaRows.forEach((row) => {
    const notaNumero = row.dataset.numero.toLowerCase();
    const notaStatus = row.dataset.status;
    const transportadoraId = row.dataset.transportadora;

    const matchesSearch = searchTerm === "" || notaNumero.includes(searchTerm);
    const matchesStatus =
      statusFiltros.length === 0 || statusFiltros.includes(notaStatus);
    const matchesTransportadora =
      transportadorasFiltros.length === 0 ||
      transportadorasFiltros.includes(transportadoraId);

    if (matchesSearch && matchesStatus && matchesTransportadora) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

// Função para calcular dias de atraso
function calcularDiasAtraso(dataPrevisao) {
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
}

// Função para animar os cards na entrada
function animateCards() {
  const cards = document.querySelectorAll(".transportadora-card");
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add("animate-in");
    }, 100 * index);
  });
}

// Função para inicializar os eventos da interface de rastreamento
function initRastreamentoEvents() {
  // Eventos para os filtros
  const filterButton = document.getElementById("filterButton");
  const filterDropdown = document.getElementById("filterDropdown");

  if (filterButton && filterDropdown) {
    filterButton.addEventListener("click", function () {
      filterDropdown.classList.toggle("active");
    });

    // Fechar dropdown ao clicar fora
    document.addEventListener("click", function (event) {
      if (
        !event.target.closest(".filter-container") &&
        filterDropdown.classList.contains("active")
      ) {
        filterDropdown.classList.remove("active");
      }
    });

    // Aplicar filtros
    const applyFilters = document.getElementById("applyFilters");
    if (applyFilters) {
      applyFilters.addEventListener("click", function () {
        aplicarFiltros();
        filterDropdown.classList.remove("active");
      });
    }

    // Limpar filtros
    const clearFilters = document.getElementById("clearFilters");
    if (clearFilters) {
      clearFilters.addEventListener("click", function () {
        document
          .querySelectorAll('.filter-options input[type="checkbox"]')
          .forEach((checkbox) => {
            checkbox.checked = false;
          });
        aplicarFiltros();
        filterDropdown.classList.remove("active");
      });
    }
  }

  // Eventos para alternar entre visualizações
  const viewToggleButtons = document.querySelectorAll(".view-toggle-btn");
  const viewContents = document.querySelectorAll(".view-content");

  viewToggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const viewType = this.dataset.view;

      // Atualizar botões
      viewToggleButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      // Atualizar conteúdo
      viewContents.forEach((content) => {
        content.classList.remove("active");
        content.style.display = "none";
      });

      const activeContent = document.getElementById(`${viewType}View`);
      if (activeContent) {
        activeContent.classList.add("active");
        activeContent.style.display = "block";
      }
    });
  });

  // Eventos para busca
  const searchInput =
    document.getElementById("searchNota") ||
    document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      aplicarFiltros();
    });
  }

  // Eventos para botões de filtrar atrasados
  const btnFiltrarAtrasados = document.querySelector(".btn-filtrar-atrasados");
  if (btnFiltrarAtrasados) {
    btnFiltrarAtrasados.addEventListener("click", function () {
      const filtroAtrasado = document.getElementById("filtroAtrasado");
      if (filtroAtrasado) {
        filtroAtrasado.checked = true;
        aplicarFiltros();
      }
    });
  }

  // Eventos para botões de limpar filtros
  const btnLimparFiltros = document.querySelector(".btn-limpar-filtros");
  if (btnLimparFiltros) {
    btnLimparFiltros.addEventListener("click", function () {
      document
        .querySelectorAll('.filter-options input[type="checkbox"]')
        .forEach((checkbox) => {
          checkbox.checked = false;
        });
      aplicarFiltros();
    });
  }

  // Event listeners para o seletor de data
  const dataInput = document.getElementById("dataRastreamento");
  const btnAtualizar = document.getElementById("btnAtualizarData");

  if (dataInput && btnAtualizar) {
    // Event listener para o botão Atualizar
    btnAtualizar.addEventListener("click", async function () {
      const novaData = dataInput.value;
      if (novaData && novaData !== dataRastreamento) {
        // Mostrar loading no botão
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
        this.disabled = true;

        try {
          await recarregarDadosComNovaData(novaData);
        } finally {
          // Restaurar botão
          this.innerHTML = originalText;
          this.disabled = false;
        }
      }
    });

    // Event listener para Enter no input de data
    dataInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        btnAtualizar.click();
      }
    });
  }
}

// Exportar as funções para uso global
window.initRastreamento = initRastreamento;
window.animateCards = animateCards;
window.initRastreamentoEvents = initRastreamentoEvents;
