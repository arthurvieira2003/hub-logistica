// Dados das transportadoras (em produção, esses dados viriam de uma API)
const transportadoras = [
  {
    id: 1,
    nome: "Jadlog",
    cor: "255, 87, 34", // RGB para #FF5722
    logo: "../assets/images/transportadoras/jadlog.svg",
    notas: [
      {
        numero: "NF123456",
        status: "Em trânsito",
        origem: "São Paulo, SP",
        destino: "Rio de Janeiro, RJ",
        dataEnvio: "2023-03-10",
        previsaoEntrega: "2023-03-15",
        ultimaAtualizacao: "2023-03-12 14:30",
      },
      {
        numero: "NF123457",
        status: "Entregue",
        origem: "São Paulo, SP",
        destino: "Belo Horizonte, MG",
        dataEnvio: "2023-03-05",
        previsaoEntrega: "2023-03-10",
        ultimaAtualizacao: "2023-03-10 09:15",
      },
      {
        numero: "NF123458",
        status: "Em trânsito",
        origem: "São Paulo, SP",
        destino: "Campinas, SP",
        dataEnvio: "2023-03-01",
        previsaoEntrega: "2023-03-05",
        ultimaAtualizacao: "2023-03-12 16:45",
      },
    ],
  },
  {
    id: 2,
    nome: "Correios",
    cor: "255, 193, 7", // RGB para #FFC107
    logo: "../assets/images/transportadoras/correios.svg",
    notas: [
      {
        numero: "NF789012",
        status: "Aguardando coleta",
        origem: "São Paulo, SP",
        destino: "Curitiba, PR",
        dataEnvio: "2023-03-12",
        previsaoEntrega: "2023-03-17",
        ultimaAtualizacao: "2023-03-12 10:45",
      },
      {
        numero: "NF789013",
        status: "Em trânsito",
        origem: "São Paulo, SP",
        destino: "Florianópolis, SC",
        dataEnvio: "2023-03-11",
        previsaoEntrega: "2023-03-16",
        ultimaAtualizacao: "2023-03-13 08:20",
      },
      {
        numero: "NF789014",
        status: "Em trânsito",
        origem: "São Paulo, SP",
        destino: "Porto Alegre, RS",
        dataEnvio: "2023-03-02",
        previsaoEntrega: "2023-03-08",
        ultimaAtualizacao: "2023-03-13 11:10",
      },
    ],
  },
  {
    id: 3,
    nome: "Braspress",
    cor: "76, 175, 80", // RGB para #4CAF50
    logo: "../assets/images/transportadoras/braspress.svg",
    notas: [
      {
        numero: "NF345678",
        status: "Em trânsito",
        origem: "São Paulo, SP",
        destino: "Goiânia, GO",
        dataEnvio: "2023-03-09",
        previsaoEntrega: "2023-03-16",
        ultimaAtualizacao: "2023-03-13 11:30",
      },
      {
        numero: "NF345679",
        status: "Em trânsito",
        origem: "São Paulo, SP",
        destino: "Brasília, DF",
        dataEnvio: "2023-03-01",
        previsaoEntrega: "2023-03-07",
        ultimaAtualizacao: "2023-03-13 09:45",
      },
    ],
  },
  {
    id: 4,
    nome: "Azul Cargo",
    cor: "33, 150, 243", // RGB para #2196F3
    logo: "../assets/images/transportadoras/azul.svg",
    notas: [
      {
        numero: "NF901234",
        status: "Entregue",
        origem: "São Paulo, SP",
        destino: "Recife, PE",
        dataEnvio: "2023-03-01",
        previsaoEntrega: "2023-03-08",
        ultimaAtualizacao: "2023-03-07 16:45",
      },
      {
        numero: "NF901235",
        status: "Em trânsito",
        origem: "São Paulo, SP",
        destino: "Salvador, BA",
        dataEnvio: "2023-03-08",
        previsaoEntrega: "2023-03-15",
        ultimaAtualizacao: "2023-03-13 09:10",
      },
      {
        numero: "NF901236",
        status: "Em trânsito",
        origem: "São Paulo, SP",
        destino: "Fortaleza, CE",
        dataEnvio: "2023-02-28",
        previsaoEntrega: "2023-03-10",
        ultimaAtualizacao: "2023-03-13 10:30",
      },
    ],
  },
  {
    id: 5,
    nome: "Jamef",
    cor: "156, 39, 176", // RGB para #9C27B0
    logo: "../assets/images/transportadoras/jamef.svg",
    notas: [
      {
        numero: "NF567890",
        status: "Aguardando coleta",
        origem: "São Paulo, SP",
        destino: "Manaus, AM",
        dataEnvio: "2023-03-13",
        previsaoEntrega: "2023-03-22",
        ultimaAtualizacao: "2023-03-13 13:15",
      },
      {
        numero: "NF567891",
        status: "Em trânsito",
        origem: "São Paulo, SP",
        destino: "Belém, PA",
        dataEnvio: "2023-03-03",
        previsaoEntrega: "2023-03-12",
        ultimaAtualizacao: "2023-03-13 14:20",
      },
    ],
  },
];

// Função para verificar se uma nota está atrasada
function verificarNotaAtrasada(nota) {
  if (nota.status === "Entregue") return false;

  const hoje = new Date();
  const previsao = new Date(nota.previsaoEntrega);

  // Resetar as horas para comparar apenas as datas
  hoje.setHours(0, 0, 0, 0);
  previsao.setHours(0, 0, 0, 0);

  return hoje > previsao;
}

// Função para inicializar a interface de rastreamento
function initRastreamento(contentElement) {
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
    // Estamos usando a nova estrutura com dashboard
    console.log("Usando a nova estrutura com dashboard");

    // Preencher a tabela de notas
    const tabelaNotas = document.getElementById("tabelaNotas");
    if (tabelaNotas) {
      tabelaNotas.innerHTML = todasNotas
        .map(
          (nota) => `
        <tr class="tr-nota ${
          nota.atrasada ? "tr-atrasada" : ""
        }" data-numero="${nota.numero}" data-status="${
            nota.statusExibicao
          }" data-transportadora="${nota.transportadora.id}">
          <td class="td-transportadora">
            <div class="td-transportadora-content" style="--transportadora-cor: ${
              nota.transportadora.cor
            }">
              <div class="td-transportadora-logo">
                <img src="${nota.transportadora.logo}" alt="${
            nota.transportadora.nome
          }">
              </div>
              <span>${nota.transportadora.nome}</span>
            </div>
          </td>
          <td class="td-nota">${nota.numero}</td>
          <td class="td-status">
            <span class="status-badge ${nota.statusExibicao
              .toLowerCase()
              .replace(/\s+/g, "-")}">
              ${nota.statusExibicao}
            </span>
          </td>
          <td class="td-origem">${nota.origem}</td>
          <td class="td-destino">${nota.destino}</td>
          <td class="td-data-envio">${formatarData(nota.dataEnvio)}</td>
          <td class="td-previsao ${nota.atrasada ? "td-atrasada" : ""}">
            ${formatarData(nota.previsaoEntrega)}
            ${
              nota.atrasada
                ? `<i class="fas fa-exclamation-triangle icone-atraso" title="Entrega atrasada em ${calcularDiasAtraso(
                    nota.previsaoEntrega
                  )} dias"></i>`
                : ""
            }
          </td>
          <td class="td-atualizacao">${nota.ultimaAtualizacao}</td>
          <td class="td-acoes">
            <button class="tabela-action-button detalhes-button" title="Ver detalhes">
              <i class="fas fa-info-circle"></i>
            </button>
          </td>
        </tr>
      `
        )
        .join("");
    } else {
      // Se a tabela não existir, criar a estrutura HTML necessária
      const tableView = document.querySelector("#trackingView");
      if (tableView) {
        tableView.innerHTML = `
          <div class="rastreamento-header">
            <h2>Rastreamento de Notas</h2>
            <div class="rastreamento-search">
              <div class="search-input-container">
                <i class="fas fa-search"></i>
                <input
                  type="text"
                  id="searchInput"
                  placeholder="Buscar por número da nota, transportadora, origem ou destino..."
                />
              </div>
              <div class="filter-container">
                <button class="filter-button">
                  <i class="fas fa-filter"></i>
                  Filtros
                </button>
                <div class="filter-dropdown">
                  <div class="filter-group">
                    <h4>Status</h4>
                    <div class="filter-options">
                      <label>
                        <input type="checkbox" value="aguardando-coleta" /> Aguardando Coleta
                      </label>
                      <label>
                        <input type="checkbox" value="em-trânsito" /> Em Trânsito
                      </label>
                      <label>
                        <input type="checkbox" value="entregue" /> Entregue
                      </label>
                      <label>
                        <input type="checkbox" value="atrasado" /> Atrasado
                      </label>
                    </div>
                  </div>
                  <div class="filter-group">
                    <h4>Transportadora</h4>
                    <div class="filter-options" id="transportadoraFilters">
                      <!-- Preenchido dinamicamente -->
                    </div>
                  </div>
                  <div class="filter-actions">
                    <button class="clear-filters">Limpar</button>
                    <button class="apply-filters">Aplicar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div id="resumoAtrasos" class="resumo-atrasos" style="display: none">
            <div class="resumo-atrasos-info">
              <div class="resumo-atrasos-icon">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <div class="resumo-atrasos-texto">
                <h4>Notas Atrasadas</h4>
                <p>
                  Existem <span id="totalAtrasadas">0</span> notas com entregas
                  atrasadas.
                </p>
              </div>
            </div>
            <div class="resumo-atrasos-acao">
              <button class="btn-filtrar-atrasados">Filtrar Atrasados</button>
              <button class="btn-limpar-filtros">Limpar Filtros</button>
            </div>
          </div>
          <div class="rastreamento-actions">
            <div class="view-toggle">
              <button class="view-toggle-btn" data-view="table">
                <i class="fas fa-table"></i>
                Tabela
              </button>
              <button class="view-toggle-btn" data-view="cards">
                <i class="fas fa-th-large"></i>
                Cards
              </button>
            </div>
          </div>
          <div class="view-container">
            <div id="tableView" class="view-content">
              <div class="tabela-container">
                <table class="tabela-rastreamento">
                  <thead>
                    <tr>
                      <th>Transportadora</th>
                      <th>Nota</th>
                      <th>Status</th>
                      <th>Origem</th>
                      <th>Destino</th>
                      <th>Data Envio</th>
                      <th>Data Prevista</th>
                      <th>Última Atualização</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody id="tabelaNotas">
                    <!-- Preenchido dinamicamente -->
                  </tbody>
                </table>
              </div>
            </div>
            <div id="cardsView" class="view-content">
              <!-- Preenchido dinamicamente -->
            </div>
          </div>
        `;

        // Agora que criamos a tabela, preencher com os dados
        const tabelaNotas = document.getElementById("tabelaNotas");
        if (tabelaNotas) {
          tabelaNotas.innerHTML = todasNotas
            .map(
              (nota) => `
            <tr class="tr-nota ${
              nota.atrasada ? "tr-atrasada" : ""
            }" data-numero="${nota.numero}" data-status="${
                nota.statusExibicao
              }" data-transportadora="${nota.transportadora.id}">
              <td class="td-transportadora">
                <div class="td-transportadora-content" style="--transportadora-cor: ${
                  nota.transportadora.cor
                }">
                  <div class="td-transportadora-logo">
                    <img src="${nota.transportadora.logo}" alt="${
                nota.transportadora.nome
              }">
                  </div>
                  <span>${nota.transportadora.nome}</span>
                </div>
              </td>
              <td class="td-nota">${nota.numero}</td>
              <td class="td-status">
                <span class="status-badge ${nota.statusExibicao
                  .toLowerCase()
                  .replace(/\s+/g, "-")}">
                  ${nota.statusExibicao}
                </span>
              </td>
              <td class="td-origem">${nota.origem}</td>
              <td class="td-destino">${nota.destino}</td>
              <td class="td-data-envio">${formatarData(nota.dataEnvio)}</td>
              <td class="td-previsao ${nota.atrasada ? "td-atrasada" : ""}">
                ${formatarData(nota.previsaoEntrega)}
                ${
                  nota.atrasada
                    ? `<i class="fas fa-exclamation-triangle icone-atraso" title="Entrega atrasada em ${calcularDiasAtraso(
                        nota.previsaoEntrega
                      )} dias"></i>`
                    : ""
                }
              </td>
              <td class="td-atualizacao">${nota.ultimaAtualizacao}</td>
              <td class="td-acoes">
                <button class="tabela-action-button detalhes-button" title="Ver detalhes">
                  <i class="fas fa-info-circle"></i>
                </button>
              </td>
            </tr>
          `
            )
            .join("");
        }
      }
    }

    // Preencher a visualização de cards
    const cardsView = document.getElementById("cardsView");
    if (cardsView) {
      cardsView.innerHTML = transportadoras
        .map(
          (transportadora) => `
        <div class="transportadora-card" data-id="${
          transportadora.id
        }" data-atrasadas="${
            transportadora.notasAtrasadas
          }" style="--transportadora-cor: ${transportadora.cor}">
          <div class="transportadora-header">
            <div class="transportadora-logo-container">
              <img src="${transportadora.logo}" alt="${
            transportadora.nome
          }" class="transportadora-logo">
            </div>
            <h3>${transportadora.nome}</h3>
            <div class="transportadora-counters">
              <span class="nota-count">${transportadora.notas.length} nota${
            transportadora.notas.length !== 1 ? "s" : ""
          }</span>
              ${
                transportadora.notasAtrasadas > 0
                  ? `<span class="atrasadas-count" title="${
                      transportadora.notasAtrasadas
                    } nota${
                      transportadora.notasAtrasadas !== 1 ? "s" : ""
                    } atrasada${
                      transportadora.notasAtrasadas !== 1 ? "s" : ""
                    }">
                  <i class="fas fa-exclamation-triangle"></i> ${
                    transportadora.notasAtrasadas
                  }
                </span>`
                  : ""
              }
            </div>
          </div>
          <div class="notas-container">
            ${transportadora.notas
              .map(
                (nota) => `
              <div class="nota-card ${
                nota.atrasada ? "nota-atrasada" : ""
              }" data-numero="${nota.numero}" data-status="${
                  nota.statusExibicao
                }">
                <div class="nota-header">
                  <div class="nota-numero">${nota.numero}</div>
                  <div class="nota-status ${nota.statusExibicao
                    .toLowerCase()
                    .replace(/\s+/g, "-")}">${nota.statusExibicao}</div>
                </div>
                <div class="nota-info">
                  <div class="nota-rota">
                    <div class="nota-origem">
                      <i class="fas fa-map-marker-alt"></i>
                      <span>${nota.origem}</span>
                    </div>
                    <div class="nota-rota-linha">
                      <div class="rota-linha-progress" style="width: ${
                        nota.status === "Entregue"
                          ? "100%"
                          : nota.status === "Em trânsito"
                          ? "50%"
                          : "0%"
                      }"></div>
                    </div>
                    <div class="nota-destino">
                      <i class="fas fa-flag-checkered"></i>
                      <span>${nota.destino}</span>
                    </div>
                  </div>
                  <div class="nota-datas">
                    <div class="nota-data">
                      <i class="fas fa-calendar-alt"></i>
                      <span>Envio: ${formatarData(nota.dataEnvio)}</span>
                    </div>
                    <div class="nota-data ${
                      nota.atrasada ? "data-atrasada" : ""
                    }">
                      <i class="fas fa-clock"></i>
                      <span>Previsão: ${formatarData(
                        nota.previsaoEntrega
                      )}</span>
                      ${
                        nota.atrasada
                          ? `<i class="fas fa-exclamation-triangle icone-atraso" title="Entrega atrasada em ${calcularDiasAtraso(
                              nota.previsaoEntrega
                            )} dias"></i>`
                          : ""
                      }
                    </div>
                  </div>
                  <div class="nota-atualizacao">
                    <i class="fas fa-sync-alt"></i>
                    <span>Última atualização: ${nota.ultimaAtualizacao}</span>
                  </div>
                </div>
                <div class="nota-actions">
                  <button class="nota-action-button detalhes-button">
                    <i class="fas fa-info-circle"></i>
                    <span>Detalhes</span>
                  </button>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `
        )
        .join("");
    }

    // Atualizar o resumo de atrasos
    const resumoAtrasos = document.getElementById("resumoAtrasos");
    const totalAtrasadas = document.getElementById("totalAtrasadas");

    if (resumoAtrasos && totalAtrasadas) {
      if (totalNotasAtrasadas > 0) {
        resumoAtrasos.style.display = "flex";
        totalAtrasadas.textContent = totalNotasAtrasadas;
      } else {
        resumoAtrasos.style.display = "none";
      }
    }

    // Garantir que o dashboard seja exibido por padrão
    dashboardView.classList.add("active");
    trackingView.classList.remove("active");

    // Atualizar o texto do botão flutuante
    const tooltip = document.querySelector(".toggle-view-tooltip");
    if (tooltip) {
      tooltip.textContent = "Ver Rastreamento";
    }

    // Atualizar ícone do botão flutuante
    const icon = document.querySelector(".toggle-view-button i");
    if (icon) {
      icon.className = "fas fa-truck";
    }
  } else {
    // Estamos usando a estrutura antiga sem dashboard
    console.log("Usando a estrutura antiga sem dashboard");

    // Criar a estrutura básica (código original)
    const rastreamentoHTML = `
      <div class="rastreamento-container">
        <div class="rastreamento-header">
          <h2>Rastreamento de Notas Fiscais</h2>
          ${
            totalNotasAtrasadas > 0
              ? `
          <div class="resumo-atrasos">
            <div class="resumo-atrasos-info">
              <div class="resumo-atrasos-icon">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <div class="resumo-atrasos-texto">
                <h4>Atenção: ${totalNotasAtrasadas} nota${
                  totalNotasAtrasadas !== 1 ? "s" : ""
                } com entrega atrasada</h4>
                <p>Existem entregas que já passaram do prazo previsto e ainda não foram concluídas.</p>
              </div>
            </div>
            <div class="resumo-atrasos-acao">
              <button class="btn-filtrar-atrasados" id="filtrarAtrasados">
                <i class="fas fa-filter"></i> Filtrar atrasados
              </button>
              <button class="btn-limpar-filtros" id="limparFiltros">
                <i class="fas fa-times"></i> Limpar
              </button>
            </div>
          </div>
          `
              : ""
          }
          
          <div class="rastreamento-actions">
            <div class="rastreamento-search">
              <div class="search-input-container">
                <i class="fas fa-search"></i>
                <input type="text" id="searchNota" placeholder="Buscar por número de nota fiscal...">
              </div>
              <div class="filter-container">
                <button id="filterButton" class="filter-button">
                  <i class="fas fa-filter"></i>
                  <span>Filtros</span>
                </button>
                <div class="filter-dropdown" id="filterDropdown">
                  <div class="filter-group">
                    <h4>Status</h4>
                    <div class="filter-options">
                      <label><input type="checkbox" value="Atrasado" id="filtroAtrasado"> Atrasado</label>
                      <label><input type="checkbox" value="Aguardando coleta"> Aguardando coleta</label>
                      <label><input type="checkbox" value="Em trânsito"> Em trânsito</label>
                      <label><input type="checkbox" value="Entregue"> Entregue</label>
                    </div>
                  </div>
                  <div class="filter-group">
                    <h4>Transportadora</h4>
                    <div class="filter-options transportadoras-filter">
                      ${transportadoras
                        .map(
                          (t) => `
                        <label><input type="checkbox" value="${t.id}"> ${t.nome}</label>
                      `
                        )
                        .join("")}
                    </div>
                  </div>
                  <div class="filter-actions">
                    <button id="clearFilters" class="clear-filters">Limpar filtros</button>
                    <button id="applyFilters" class="apply-filters">Aplicar</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="view-toggle">
              <button class="view-toggle-btn" data-view="cards" id="viewCards">
                <i class="fas fa-th-large"></i> Cards
              </button>
              <button class="view-toggle-btn active" data-view="table" id="viewTable">
                <i class="fas fa-table"></i> Tabela
              </button>
            </div>
          </div>
        </div>
        
        <div class="view-container">
          <!-- Visualização em Cards -->
          <div class="transportadoras-grid view-content" id="cardsView">
            ${transportadoras
              .map(
                (transportadora) => `
              <div class="transportadora-card" data-id="${
                transportadora.id
              }" data-atrasadas="${
                  transportadora.notasAtrasadas
                }" style="--transportadora-cor: ${transportadora.cor}">
                <div class="transportadora-header">
                  <div class="transportadora-logo-container">
                    <img src="${transportadora.logo}" alt="${
                  transportadora.nome
                }" class="transportadora-logo">
                  </div>
                  <h3>${transportadora.nome}</h3>
                  <div class="transportadora-counters">
                    <span class="nota-count">${
                      transportadora.notas.length
                    } nota${transportadora.notas.length !== 1 ? "s" : ""}</span>
                    ${
                      transportadora.notasAtrasadas > 0
                        ? `<span class="atrasadas-count" title="${
                            transportadora.notasAtrasadas
                          } nota${
                            transportadora.notasAtrasadas !== 1 ? "s" : ""
                          } atrasada${
                            transportadora.notasAtrasadas !== 1 ? "s" : ""
                          }">
                        <i class="fas fa-exclamation-triangle"></i> ${
                          transportadora.notasAtrasadas
                        }
                      </span>`
                        : ""
                    }
                  </div>
                </div>
                <div class="notas-container">
                  ${transportadora.notas
                    .map(
                      (nota) => `
                    <div class="nota-card ${
                      nota.atrasada ? "nota-atrasada" : ""
                    }" data-numero="${nota.numero}" data-status="${
                        nota.statusExibicao
                      }">
                      <div class="nota-header">
                        <div class="nota-numero">${nota.numero}</div>
                        <div class="nota-status ${nota.statusExibicao
                          .toLowerCase()
                          .replace(/\s+/g, "-")}">${nota.statusExibicao}</div>
                      </div>
                      <div class="nota-info">
                        <div class="nota-rota">
                          <div class="nota-origem">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${nota.origem}</span>
                          </div>
                          <div class="nota-rota-linha">
                            <div class="rota-linha-progress" style="width: ${
                              nota.status === "Entregue"
                                ? "100%"
                                : nota.status === "Em trânsito"
                                ? "50%"
                                : "0%"
                            }"></div>
                          </div>
                          <div class="nota-destino">
                            <i class="fas fa-flag-checkered"></i>
                            <span>${nota.destino}</span>
                          </div>
                        </div>
                        <div class="nota-datas">
                          <div class="nota-data">
                            <i class="fas fa-calendar-alt"></i>
                            <span>Envio: ${formatarData(nota.dataEnvio)}</span>
                          </div>
                          <div class="nota-data ${
                            nota.atrasada ? "data-atrasada" : ""
                          }">
                            <i class="fas fa-clock"></i>
                            <span>Previsão: ${formatarData(
                              nota.previsaoEntrega
                            )}</span>
                            ${
                              nota.atrasada
                                ? `<i class="fas fa-exclamation-triangle icone-atraso" title="Entrega atrasada em ${calcularDiasAtraso(
                                    nota.previsaoEntrega
                                  )} dias"></i>`
                                : ""
                            }
                          </div>
                        </div>
                        <div class="nota-atualizacao">
                          <i class="fas fa-sync-alt"></i>
                          <span>Última atualização: ${
                            nota.ultimaAtualizacao
                          }</span>
                        </div>
                      </div>
                      <div class="nota-actions">
                        <button class="nota-action-button detalhes-button">
                          <i class="fas fa-info-circle"></i>
                          <span>Detalhes</span>
                        </button>
                      </div>
                    </div>
                  `
                    )
                    .join("")}
                </div>
              </div>
            `
              )
              .join("")}
          </div>
          
          <!-- Visualização em Tabela -->
          <div class="tabela-container view-content active" id="tableView">
            <table class="tabela-rastreamento">
              <thead>
                <tr>
                  <th class="th-transportadora">Transportadora</th>
                  <th class="th-nota">Nota Fiscal</th>
                  <th class="th-status">Status</th>
                  <th class="th-origem">Origem</th>
                  <th class="th-destino">Destino</th>
                  <th class="th-data-envio">Data Envio</th>
                  <th class="th-previsao">Previsão</th>
                  <th class="th-atualizacao">Última Atualização</th>
                  <th class="th-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                ${todasNotas
                  .map(
                    (nota) => `
                  <tr class="tr-nota ${
                    nota.atrasada ? "tr-atrasada" : ""
                  }" data-numero="${nota.numero}" data-status="${
                      nota.statusExibicao
                    }" data-transportadora="${nota.transportadora.id}">
                    <td class="td-transportadora">
                      <div class="td-transportadora-content" style="--transportadora-cor: ${
                        nota.transportadora.cor
                      }">
                        <div class="td-transportadora-logo">
                          <img src="${nota.transportadora.logo}" alt="${
                      nota.transportadora.nome
                    }">
                        </div>
                        <span>${nota.transportadora.nome}</span>
                      </div>
                    </td>
                    <td class="td-nota">${nota.numero}</td>
                    <td class="td-status">
                      <span class="status-badge ${nota.statusExibicao
                        .toLowerCase()
                        .replace(/\s+/g, "-")}">
                        ${nota.statusExibicao}
                      </span>
                    </td>
                    <td class="td-origem">${nota.origem}</td>
                    <td class="td-destino">${nota.destino}</td>
                    <td class="td-data-envio">${formatarData(
                      nota.dataEnvio
                    )}</td>
                    <td class="td-previsao ${
                      nota.atrasada ? "td-atrasada" : ""
                    }">
                      ${formatarData(nota.previsaoEntrega)}
                      ${
                        nota.atrasada
                          ? `<i class="fas fa-exclamation-triangle icone-atraso" title="Entrega atrasada em ${calcularDiasAtraso(
                              nota.previsaoEntrega
                            )} dias"></i>`
                          : ""
                      }
                    </td>
                    <td class="td-atualizacao">${nota.ultimaAtualizacao}</td>
                    <td class="td-acoes">
                      <button class="tabela-action-button detalhes-button" title="Ver detalhes">
                        <i class="fas fa-info-circle"></i>
                      </button>
                    </td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="modal" id="detalhesModal">
          <div class="modal-content detalhes-modal-content">
            <div class="modal-header">
              <h3>Detalhes da Nota Fiscal <span id="modalNotaNumero"></span></h3>
              <button class="close-button" id="closeDetalhesModal">&times;</button>
            </div>
            <div class="modal-body">
              <div class="detalhes-container" id="detalhesContainer">
                <!-- Conteúdo será preenchido dinamicamente -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Inserir o HTML no elemento de conteúdo
    contentElement.innerHTML = rastreamentoHTML;
  }

  // Inicializar os eventos após o HTML ser inserido
  setTimeout(() => {
    initRastreamentoEvents();
    animateCards();
  }, 100);
}

// Função para formatar datas
function formatarData(dataString) {
  const data = new Date(dataString);
  return data.toLocaleDateString("pt-BR");
}

// Função para inicializar os eventos da interface
function initRastreamentoEvents() {
  // Botão de filtro
  const filterButton = document.getElementById("filterButton");
  const filterDropdown = document.getElementById("filterDropdown");

  if (filterButton) {
    filterButton.addEventListener("click", () => {
      filterDropdown.classList.toggle("active");
    });
  }

  // Fechar dropdown ao clicar fora
  document.addEventListener("click", (e) => {
    if (
      filterDropdown &&
      filterDropdown.classList.contains("active") &&
      !e.target.closest(".filter-container")
    ) {
      filterDropdown.classList.remove("active");
    }
  });

  // Botões de limpar e aplicar filtros
  const clearFiltersButton = document.getElementById("clearFilters");
  const applyFiltersButton = document.getElementById("applyFilters");

  if (clearFiltersButton) {
    clearFiltersButton.addEventListener("click", () => {
      const checkboxes = document.querySelectorAll(
        '.filter-options input[type="checkbox"]'
      );
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });
    });
  }

  if (applyFiltersButton) {
    applyFiltersButton.addEventListener("click", () => {
      filterDropdown.classList.remove("active");
      aplicarFiltros();
    });
  }

  // Campo de busca
  const searchInput = document.getElementById("searchNota");
  if (searchInput) {
    searchInput.addEventListener("input", aplicarFiltros);
  }

  // Botões de detalhes das notas (para cards e tabela)
  const detalhesButtons = document.querySelectorAll(".detalhes-button");
  detalhesButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      // Verificar se estamos em um card ou em uma linha de tabela
      const notaElement =
        e.currentTarget.closest(".nota-card") ||
        e.currentTarget.closest(".tr-nota");
      const notaNumero = notaElement.dataset.numero;
      abrirDetalhesNota(notaNumero);
    });
  });

  // Fechar modal de detalhes
  const closeDetalhesModal = document.getElementById("closeDetalhesModal");
  const detalhesModal = document.getElementById("detalhesModal");

  if (closeDetalhesModal && detalhesModal) {
    closeDetalhesModal.addEventListener("click", () => {
      detalhesModal.classList.remove("active");
    });

    // Fechar modal ao clicar fora
    detalhesModal.addEventListener("click", (e) => {
      if (e.target === detalhesModal) {
        detalhesModal.classList.remove("active");
      }
    });
  }

  // Botão para filtrar apenas notas atrasadas
  const filtrarAtrasadosBtn = document.getElementById("filtrarAtrasados");
  if (filtrarAtrasadosBtn) {
    filtrarAtrasadosBtn.addEventListener("click", () => {
      // Marcar apenas o checkbox de atrasados
      const checkboxes = document.querySelectorAll(
        '.filter-options input[type="checkbox"]'
      );
      checkboxes.forEach((checkbox) => {
        checkbox.checked = checkbox.value === "Atrasado";
      });

      // Aplicar filtros
      aplicarFiltros();
    });
  }

  // Botão para limpar filtros no resumo de atrasos
  const limparFiltrosBtn = document.getElementById("limparFiltros");
  if (limparFiltrosBtn) {
    limparFiltrosBtn.addEventListener("click", () => {
      // Desmarcar todos os checkboxes
      const checkboxes = document.querySelectorAll(
        '.filter-options input[type="checkbox"]'
      );
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });

      // Limpar campo de busca
      const searchInput = document.getElementById("searchNota");
      if (searchInput) {
        searchInput.value = "";
      }

      // Aplicar filtros
      aplicarFiltros();
    });
  }

  // Alternar entre visualizações (cards e tabela)
  const viewToggleButtons = document.querySelectorAll(".view-toggle-btn");
  const cardsView = document.getElementById("cardsView");
  const tableView = document.getElementById("tableView");

  if (viewToggleButtons.length > 0) {
    viewToggleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        console.log("Botão de visualização clicado:", button.dataset.view);

        // Remover classe active de todos os botões
        viewToggleButtons.forEach((btn) => btn.classList.remove("active"));

        // Adicionar classe active ao botão clicado
        button.classList.add("active");

        // Obter o tipo de visualização
        const viewType = button.dataset.view;

        // Esconder todas as visualizações
        if (cardsView) cardsView.classList.remove("active");
        if (tableView) tableView.classList.remove("active");

        // Mostrar a visualização selecionada
        if (viewType === "cards" && cardsView) {
          cardsView.classList.add("active");
          // Garantir que os cards sejam exibidos corretamente
          setTimeout(() => {
            animateCards();
          }, 100);
          console.log("Ativando visualização de cards");
        } else if (viewType === "table" && tableView) {
          tableView.classList.add("active");
          console.log("Ativando visualização de tabela");
        }
      });
    });
  } else {
    console.error("Botões de alternância de visualização não encontrados");
  }
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

// Função para abrir o modal de detalhes da nota
function abrirDetalhesNota(notaNumero) {
  // Encontrar a nota nos dados
  let notaEncontrada = null;
  let transportadoraEncontrada = null;

  for (const transportadora of transportadoras) {
    const nota = transportadora.notas.find((n) => n.numero === notaNumero);
    if (nota) {
      notaEncontrada = nota;
      transportadoraEncontrada = transportadora;
      break;
    }
  }

  if (!notaEncontrada) return;

  // Preencher o modal com os detalhes
  const modalNotaNumero = document.getElementById("modalNotaNumero");
  const detalhesContainer = document.getElementById("detalhesContainer");
  const detalhesModal = document.getElementById("detalhesModal");

  modalNotaNumero.textContent = notaNumero;

  // Determinar o status a ser exibido
  const statusExibicao = notaEncontrada.atrasada
    ? "Atrasado"
    : notaEncontrada.status;
  const statusClass = statusExibicao.toLowerCase().replace(/\s+/g, "-");

  // Criar o conteúdo do modal
  detalhesContainer.innerHTML = `
    <div class="detalhes-header" style="--transportadora-cor: ${
      transportadoraEncontrada.cor
    }">
      <div class="detalhes-transportadora">
        <img src="${transportadoraEncontrada.logo}" alt="${
    transportadoraEncontrada.nome
  }" class="detalhes-transportadora-logo">
        <h4>${transportadoraEncontrada.nome}</h4>
      </div>
      <div class="detalhes-status ${statusClass}">
        ${statusExibicao}
      </div>
    </div>
    
    <div class="detalhes-info">
      <div class="detalhes-section">
        <h4>Informações da Remessa</h4>
        <div class="detalhes-grid">
          <div class="detalhes-item">
            <span class="detalhes-label">Origem:</span>
            <span class="detalhes-value">${notaEncontrada.origem}</span>
          </div>
          <div class="detalhes-item">
            <span class="detalhes-label">Destino:</span>
            <span class="detalhes-value">${notaEncontrada.destino}</span>
          </div>
          <div class="detalhes-item">
            <span class="detalhes-label">Data de Envio:</span>
            <span class="detalhes-value">${formatarData(
              notaEncontrada.dataEnvio
            )}</span>
          </div>
          <div class="detalhes-item ${
            notaEncontrada.atrasada ? "detalhes-atrasado" : ""
          }">
            <span class="detalhes-label">Previsão de Entrega:</span>
            <span class="detalhes-value">
              ${formatarData(notaEncontrada.previsaoEntrega)}
              ${
                notaEncontrada.atrasada
                  ? '<i class="fas fa-exclamation-triangle icone-atraso" title="Entrega atrasada"></i>'
                  : ""
              }
            </span>
          </div>
          <div class="detalhes-item">
            <span class="detalhes-label">Última Atualização:</span>
            <span class="detalhes-value">${
              notaEncontrada.ultimaAtualizacao
            }</span>
          </div>
          ${
            notaEncontrada.atrasada
              ? `
          <div class="detalhes-item detalhes-atraso">
            <span class="detalhes-label">Dias de Atraso:</span>
            <span class="detalhes-value">${calcularDiasAtraso(
              notaEncontrada.previsaoEntrega
            )} dias</span>
          </div>
          `
              : ""
          }
        </div>
      </div>
      
      <div class="detalhes-section">
        <h4>Histórico de Rastreamento</h4>
        <div class="timeline">
          <div class="timeline-item ${
            notaEncontrada.status === "Aguardando coleta" ||
            notaEncontrada.status === "Em trânsito" ||
            notaEncontrada.status === "Entregue"
              ? "completed"
              : ""
          }">
            <div class="timeline-icon">
              <i class="fas fa-box"></i>
            </div>
            <div class="timeline-content">
              <h5>Nota fiscal emitida</h5>
              <p>${formatarData(notaEncontrada.dataEnvio)} - 08:30</p>
            </div>
          </div>
          
          <div class="timeline-item ${
            notaEncontrada.status === "Em trânsito" ||
            notaEncontrada.status === "Entregue"
              ? "completed"
              : ""
          }">
            <div class="timeline-icon">
              <i class="fas fa-truck-loading"></i>
            </div>
            <div class="timeline-content">
              <h5>Mercadoria coletada</h5>
              <p>${formatarData(notaEncontrada.dataEnvio)} - 14:45</p>
            </div>
          </div>
          
          <div class="timeline-item ${
            notaEncontrada.status === "Em trânsito" ||
            notaEncontrada.status === "Entregue"
              ? "completed"
              : ""
          }">
            <div class="timeline-icon">
              <i class="fas fa-truck"></i>
            </div>
            <div class="timeline-content">
              <h5>Em trânsito</h5>
              <p>${formatarData(notaEncontrada.dataEnvio, 1)} - 09:15</p>
            </div>
          </div>
          
          <div class="timeline-item ${
            notaEncontrada.status === "Entregue" ? "completed" : ""
          }">
            <div class="timeline-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="timeline-content">
              <h5>Entregue</h5>
              <p>${
                notaEncontrada.status === "Entregue"
                  ? formatarData(notaEncontrada.previsaoEntrega) + " - 11:20"
                  : "Pendente"
              }</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Mostrar o modal
  detalhesModal.classList.add("active");
}

// Função para calcular dias de atraso
function calcularDiasAtraso(dataPrevisao) {
  const hoje = new Date();
  const previsao = new Date(dataPrevisao);

  // Resetar as horas para comparar apenas as datas
  hoje.setHours(0, 0, 0, 0);
  previsao.setHours(0, 0, 0, 0);

  // Calcular a diferença em dias
  const diffTime = Math.abs(hoje - previsao);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
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

// Exportar a função de inicialização
window.initRastreamento = initRastreamento;
