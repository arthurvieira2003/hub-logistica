window.ToolManager = window.ToolManager || {};

window.ToolManager.state = {
  tools: new Map(),
  activeTool: null,
};

window.ToolManager.initToolButtons = function () {
  const toolButtons = document.querySelectorAll(".tool-button");
  const tabList = document.getElementById("tabList");
  const contentArea = document.getElementById("contentArea");
  const welcomeScreen = document.getElementById("welcomeScreen");

  toolButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tool = button.dataset.tool;

      const existingTab = document.querySelector(`.tab[data-tool="${tool}"]`);
      if (existingTab) {
        window.TabManager.activateTab(existingTab);
        return;
      }

      const toolName = button.querySelector("span").textContent;
      const toolIcon = button.querySelector("i").cloneNode(true);

      const tab = window.TabManager.createTab(tool, toolName, toolIcon);
      tabList.appendChild(tab);

      const toolContent = window.TabManager.createToolContent(tool);
      contentArea.appendChild(toolContent);

      welcomeScreen.style.display = "none";

      window.TabManager.activateTab(tab);

      window.ToolManager.loadToolContent(tool, toolContent);
    });
  });
};

window.ToolManager.loadToolContent = async function (tool, contentElement) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    contentElement.querySelector(".loader").remove();

    if (tool === "admin") {
      window.location.href = "/administration";
      return;
    }

    switch (tool) {
      case "fretes":
        await window.ToolManager.loadFretesTool(contentElement);
        break;
      case "frota":
        await window.ToolManager.loadFrotaTool(contentElement);
        break;
      case "rastreamento":
        await window.ToolManager.loadRastreamentoTool(contentElement);
        break;
      default:
        contentElement.innerHTML = `
          <div class="tool-header">
            <h2>Ferramenta não encontrada</h2>
            <p>A ferramenta solicitada não está disponível.</p>
          </div>
        `;
    }
  } catch (error) {
    console.error("❌ Erro ao carregar conteúdo da ferramenta:", error);
    contentElement.innerHTML = `
      <div class="tool-header error">
        <h2>Erro ao carregar</h2>
        <p>Não foi possível carregar o conteúdo da ferramenta.</p>
      </div>
    `;
  }
};

window.ToolManager.loadFretesTool = async function (contentElement) {
  contentElement.innerHTML = `
    <div class="tool-header">
      <h2>Conhecimentos de Transporte Eletrônicos (CT-e)</h2>
      <p>Gerenciamento de fretes e conhecimentos de transporte.</p>
    </div>
    <div class="fretes-container">
      <div class="fretes-actions">
        <div class="fretes-search">
          <input type="text" id="fretesSearch" placeholder="Buscar por número ou cliente...">
          <button><i class="fas fa-search"></i></button>
        </div>
      </div>
      <div class="fretes-list" id="fretesList">
        <div class="loader">
          <i class="fas fa-spinner fa-spin"></i> Carregando conhecimentos de transporte...
        </div>
      </div>
      <div class="pagination" id="fretesPagination">
      </div>
    </div>
  `;

  await window.ToolManager.loadFretesData();
};

window.ToolManager.loadFretesData = async function () {
  try {
    const response = await fetch("http://localhost:4010/cte");
    if (!response.ok) {
      throw new Error("Erro ao buscar dados de CT-e");
    }
    const data = await response.json();

    window.ToolManager.renderFretesItems(data);
    window.ToolManager.setupFretesSearch();
  } catch (error) {
    console.error("❌ Erro ao carregar dados de fretes:", error);
    document.getElementById("fretesList").innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Erro ao carregar os dados. Verifique se o servidor está online.</p>
      </div>
    `;
  }
};

window.ToolManager.renderFretesItems = function (items) {
  const fretesListElement = document.getElementById("fretesList");

  if (items.length === 0) {
    fretesListElement.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>Nenhum conhecimento de transporte encontrado.</p>
      </div>
    `;
    return;
  }

  let html = `
    <div class="fretes-table-container">
      <table class="fretes-table">
        <thead>
          <tr>
            <th>Número</th>
            <th>Transportadora</th>
            <th>Remetente</th>
            <th>Destinatário</th>
            <th>Data</th>
            <th>Valor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
  `;

  items.forEach((item) => {
    const dateObj = new Date(item.DateAdd);
    const formattedDate = dateObj.toLocaleDateString("pt-BR");

    const formattedValue = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(item.DocTotal);

    html += `
      <tr data-serial="${item.Serial}">
        <td class="frete-serial">
          <i class="fas fa-file-invoice"></i>
          <span>${item.Serial}</span>
        </td>
        <td class="frete-customer">${item.CardName || "-"}</td>
        <td class="frete-remetente">${item.remetenteNome || "-"}</td>
        <td class="frete-destinatario">${item.destinatarioNome || "-"}</td>
        <td class="frete-date">${formattedDate}</td>
        <td class="frete-value">${formattedValue}</td>
        <td class="frete-actions">
          <button class="btn-view-frete" data-serial="${
            item.Serial
          }" title="Visualizar">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn-download-xml" data-serial="${
            item.Serial
          }" title="Baixar XML">
            <i class="fas fa-download"></i>
          </button>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  fretesListElement.innerHTML = html;
  window.ToolManager.setupFretesButtons();
};

window.ToolManager.setupFretesButtons = function () {
  document.querySelectorAll(".btn-view-frete").forEach((button) => {
    button.addEventListener("click", (e) => {
      const serial = e.currentTarget.dataset.serial;
      window.ToolManager.viewCTEDetails(serial);
    });
  });

  document.querySelectorAll(".btn-download-xml").forEach((button) => {
    button.addEventListener("click", (e) => {
      const serial = e.currentTarget.dataset.serial;
      window.ToolManager.downloadCTEXML(serial);
    });
  });
};

window.ToolManager.setupFretesSearch = function () {
  const searchInput = document.getElementById("fretesSearch");
  let searchTimeout;

  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const searchTerm = e.target.value.toLowerCase();
      window.ToolManager.filterFretesItems(searchTerm);
    }, 300);
  });
};

window.ToolManager.filterFretesItems = function (searchTerm) {
  const table = document.querySelector(".fretes-table tbody");
  if (!table) return;

  const rows = table.querySelectorAll("tr");
  rows.forEach((row) => {
    const serial = row.dataset.serial?.toLowerCase() || "";
    const transportadora =
      row.querySelector(".frete-customer")?.textContent?.toLowerCase() || "";
    const remetente =
      row.querySelector(".frete-remetente")?.textContent?.toLowerCase() || "";
    const destinatario =
      row.querySelector(".frete-destinatario")?.textContent?.toLowerCase() ||
      "";
    const match =
      serial.includes(searchTerm) ||
      transportadora.includes(searchTerm) ||
      remetente.includes(searchTerm) ||
      destinatario.includes(searchTerm);
    row.style.display = match ? "" : "none";
  });
};

window.ToolManager.viewCTEDetails = async function (serial) {
  let modalOverlay = document.getElementById("cteModalOverlay");
  if (!modalOverlay) {
    modalOverlay = document.createElement("div");
    modalOverlay.id = "cteModalOverlay";
    modalOverlay.className = "cte-modal-overlay";
    modalOverlay.innerHTML = `
      <div class="cte-modal-container">
        <div class="cte-modal-header">
          <h3>Detalhes do CT-E</h3>
          <button class="cte-modal-close">&times;</button>
        </div>
        <div class="cte-modal-body" id="cteModalBody">
          <div class="cte-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Carregando detalhes do CT-E...</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalOverlay);

    const closeBtn = modalOverlay.querySelector(".cte-modal-close");
    closeBtn.addEventListener("click", () => {
      window.ToolManager.closeCTEModal();
    });

    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        window.ToolManager.closeCTEModal();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
        window.ToolManager.closeCTEModal();
      }
    });
  }

  modalOverlay.classList.add("active");
  document.body.classList.add("cte-modal-open");

  const modalBody = document.getElementById("cteModalBody");
  try {
    const response = await fetch(`http://localhost:4010/cte/${serial}`);
    if (!response.ok) {
      throw new Error("Erro ao buscar detalhes do CT-E");
    }

    const cte = await response.json();
    window.ToolManager.renderCTEDetails(cte);
  } catch (error) {
    console.error("❌ Erro ao carregar detalhes do CT-E:", error);
    modalBody.innerHTML = `
      <div class="cte-error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Erro ao carregar os detalhes do CT-E.</p>
        <p style="font-size: 12px; color: var(--text-secondary);">${error.message}</p>
      </div>
    `;
  }
};

window.ToolManager.renderCTEDetails = function (cte) {
  const modalBody = document.getElementById("cteModalBody");
  const modalHeader = document.querySelector(
    "#cteModalOverlay .cte-modal-header h3"
  );

  if (modalHeader) {
    modalHeader.textContent = `CT-E ${cte.numero || cte.serial}`;
  }

  const formatCurrency = (value) => {
    if (!value) return "R$ 0,00";
    const num = parseFloat(value);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("pt-BR");
    } catch (e) {
      return dateString;
    }
  };

  const formatCNPJ = (cnpj) => {
    if (!cnpj) return "-";
    const cleaned = cnpj.replace(/\D/g, "");
    if (cleaned.length === 14) {
      return cleaned.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        "$1.$2.$3/$4-$5"
      );
    } else if (cleaned.length === 11) {
      return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
    }
    return cnpj;
  };

  const formatCEP = (cep) => {
    if (!cep) return "-";
    const cleaned = cep.replace(/\D/g, "");
    if (cleaned.length === 8) {
      return cleaned.replace(/^(\d{5})(\d{3})$/, "$1-$2");
    }
    return cep;
  };

  const renderAddress = (endereco, label) => {
    if (!endereco || !endereco.logradouro) return "";

    const partesEndereco = [];
    if (endereco.logradouro) {
      let logradouroCompleto = endereco.logradouro;
      if (endereco.numero) logradouroCompleto += `, ${endereco.numero}`;
      if (endereco.complemento)
        logradouroCompleto += ` ${endereco.complemento}`;
      partesEndereco.push(logradouroCompleto);
    }
    if (endereco.bairro) partesEndereco.push(endereco.bairro);
    if (endereco.municipio) {
      const cidadeUF = endereco.uf
        ? `${endereco.municipio} - ${endereco.uf}`
        : endereco.municipio;
      partesEndereco.push(cidadeUF);
    }
    if (endereco.cep) partesEndereco.push(`CEP: ${formatCEP(endereco.cep)}`);

    const enderecoCompleto = partesEndereco.filter((p) => p.trim()).join(" - ");

    return `
        <div class="cte-detail-item" style="grid-column: 1 / -1;">
          <span class="cte-detail-label">${label}</span>
          <span class="cte-detail-value cte-address-value">${enderecoCompleto}</span>
        </div>
    `;
  };

  modalBody.innerHTML = `
    <div class="cte-details-section">
      <h4><i class="fas fa-info-circle"></i> Informações Básicas</h4>
      <div class="cte-details-grid">
        <div class="cte-detail-item">
          <span class="cte-detail-label">Número</span>
          <span class="cte-detail-value">${cte.numero || "-"}</span>
        </div>
        <div class="cte-detail-item">
          <span class="cte-detail-label">Série</span>
          <span class="cte-detail-value">${cte.serie || "-"}</span>
        </div>
        <div class="cte-detail-item">
          <span class="cte-detail-label">Chave de Acesso</span>
          <span class="cte-detail-value" style="font-family: monospace; font-size: 12px;">${
            cte.chave || cte.serial || "-"
          }</span>
        </div>
        <div class="cte-detail-item">
          <span class="cte-detail-label">Data de Emissão</span>
          <span class="cte-detail-value">${formatDate(cte.dataEmissao)}</span>
        </div>
      </div>
    </div>

    <div class="cte-details-section">
      <h4><i class="fas fa-building"></i> Emitente</h4>
      <div class="cte-details-grid">
        <div class="cte-detail-item">
          <span class="cte-detail-label">CNPJ</span>
          <span class="cte-detail-value">${
            formatCNPJ(cte.emitente?.cnpj) || "-"
          }</span>
        </div>
        <div class="cte-detail-item">
          <span class="cte-detail-label">Nome</span>
          <span class="cte-detail-value">${cte.emitente?.nome || "-"}</span>
        </div>
        <div class="cte-detail-item">
          <span class="cte-detail-label">Inscrição Estadual</span>
          <span class="cte-detail-value">${cte.emitente?.ie || "-"}</span>
        </div>
        ${renderAddress(cte.emitente?.endereco, "Endereço")}
      </div>
    </div>

    <div class="cte-details-section">
      <h4><i class="fas fa-truck-loading"></i> Remetente</h4>
      <div class="cte-details-grid">
        <div class="cte-detail-item">
          <span class="cte-detail-label">CNPJ/CPF</span>
          <span class="cte-detail-value">${
            formatCNPJ(cte.remetente?.cnpj) || "-"
          }</span>
        </div>
        <div class="cte-detail-item">
          <span class="cte-detail-label">Nome</span>
          <span class="cte-detail-value">${cte.remetente?.nome || "-"}</span>
        </div>
        <div class="cte-detail-item">
          <span class="cte-detail-label">Inscrição Estadual</span>
          <span class="cte-detail-value">${cte.remetente?.ie || "-"}</span>
        </div>
        ${renderAddress(cte.remetente?.endereco, "Endereço")}
      </div>
    </div>

    <div class="cte-details-section">
      <h4><i class="fas fa-truck"></i> Destinatário</h4>
      <div class="cte-details-grid">
        <div class="cte-detail-item">
          <span class="cte-detail-label">CNPJ/CPF</span>
          <span class="cte-detail-value">${
            formatCNPJ(cte.destinatario?.cnpj) || "-"
          }</span>
        </div>
        <div class="cte-detail-item">
          <span class="cte-detail-label">Nome</span>
          <span class="cte-detail-value">${cte.destinatario?.nome || "-"}</span>
        </div>
        <div class="cte-detail-item">
          <span class="cte-detail-label">Inscrição Estadual</span>
          <span class="cte-detail-value">${cte.destinatario?.ie || "-"}</span>
        </div>
        ${renderAddress(cte.destinatario?.endereco, "Endereço")}
      </div>
    </div>

    <div class="cte-details-section">
      <h4><i class="fas fa-user-tag"></i> Tomador</h4>
      <div class="cte-details-grid">
        <div class="cte-detail-item">
          <span class="cte-detail-label">Tipo</span>
          <span class="cte-detail-value">${cte.tomador?.tipo || "-"}</span>
        </div>
        <div class="cte-detail-item">
          <span class="cte-detail-label">CNPJ/CPF</span>
          <span class="cte-detail-value">${
            formatCNPJ(cte.tomador?.cnpj) || "-"
          }</span>
        </div>
        <div class="cte-detail-item">
          <span class="cte-detail-label">Nome</span>
          <span class="cte-detail-value">${cte.tomador?.nome || "-"}</span>
        </div>
      </div>
    </div>

    <div class="cte-details-section">
      <h4><i class="fas fa-dollar-sign"></i> Valores</h4>
      <div class="cte-values-grid">
        <div class="cte-value-item">
          <span class="cte-detail-label">Valor do Serviço</span>
          <span class="cte-detail-value">${formatCurrency(
            cte.valores?.valorServico
          )}</span>
        </div>
        <div class="cte-value-item">
          <span class="cte-detail-label">Valor a Receber</span>
          <span class="cte-detail-value">${formatCurrency(
            cte.valores?.valorReceber
          )}</span>
        </div>
        <div class="cte-value-item">
          <span class="cte-detail-label">Valor Total</span>
          <span class="cte-detail-value">${formatCurrency(
            cte.valores?.valorTotal || cte.docTotal
          )}</span>
        </div>
        ${
          cte.valores?.icms?.valor
            ? `
        <div class="cte-value-item">
          <span class="cte-detail-label">ICMS</span>
          <span class="cte-detail-value">${formatCurrency(
            cte.valores.icms.valor
          )}</span>
        </div>
        `
            : ""
        }
      </div>
      
      ${
        cte.valores?.componentes && cte.valores.componentes.length > 0
          ? (() => {
              const componentesComValor = cte.valores.componentes.filter(
                (comp) => comp.valor && parseFloat(comp.valor) > 0
              );

              return componentesComValor.length > 0
                ? `
      <div style="margin-top: 24px;">
        <h5 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: var(--text-secondary);">Componentes da Prestação</h5>
        <div class="cte-components-list">
          ${componentesComValor
            .map(
              (comp) => `
            <div class="cte-component-item">
              <span class="cte-component-name">${comp.nome || "-"}</span>
              <span class="cte-component-value">${formatCurrency(
                comp.valor
              )}</span>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
      `
                : "";
            })()
          : ""
      }
      
      ${
        cte.valores?.icms?.baseCalculo ||
        cte.valores?.icms?.aliquota ||
        cte.valores?.icms?.cst
          ? `
      <div class="cte-values-grid" style="margin-top: 16px;">
        ${
          cte.valores.icms.baseCalculo
            ? `
        <div class="cte-value-item">
          <span class="cte-detail-label">Base de Cálculo ICMS</span>
          <span class="cte-detail-value">${formatCurrency(
            cte.valores.icms.baseCalculo
          )}</span>
        </div>
        `
            : ""
        }
        ${
          cte.valores.icms.aliquota
            ? `
        <div class="cte-value-item">
          <span class="cte-detail-label">Alíquota ICMS</span>
          <span class="cte-detail-value">${
            parseFloat(cte.valores.icms.aliquota).toFixed(2) + "%"
          }</span>
        </div>
        `
            : ""
        }
        ${
          cte.valores.icms.cst
            ? `
        <div class="cte-value-item">
          <span class="cte-detail-label">CST ICMS</span>
          <span class="cte-detail-value">${cte.valores.icms.cst}</span>
        </div>
        `
            : ""
        }
      </div>
      `
          : ""
      }
    </div>

    ${
      cte.carga?.quantidade || cte.carga?.valorCarga
        ? `
    <div class="cte-details-section">
      <h4><i class="fas fa-weight"></i> Informações de Carga</h4>
      <div class="cte-details-grid">
        ${
          cte.carga?.quantidade
            ? `
        <div class="cte-detail-item">
          <span class="cte-detail-label">Quantidade</span>
          <span class="cte-detail-value">${cte.carga.quantidade} ${
                cte.carga.especie || ""
              }</span>
        </div>
        `
            : ""
        }
        ${
          cte.carga?.valorCarga
            ? `
        <div class="cte-detail-item">
          <span class="cte-detail-label">Valor da Carga</span>
          <span class="cte-detail-value">${formatCurrency(
            cte.carga.valorCarga
          )}</span>
        </div>
        `
            : ""
        }
        ${
          cte.carga?.valorCargaAverb
            ? `
        <div class="cte-detail-item">
          <span class="cte-detail-label">Valor da Carga Averbado</span>
          <span class="cte-detail-value">${formatCurrency(
            cte.carga.valorCargaAverb
          )}</span>
        </div>
        `
            : ""
        }
        ${
          cte.carga?.lacres && cte.carga.lacres.length > 0
            ? `
        <div class="cte-detail-item">
          <span class="cte-detail-label">Lacres</span>
          <span class="cte-detail-value">${cte.carga.lacres.join(", ")}</span>
        </div>
        `
            : ""
        }
      </div>
    </div>
    `
        : ""
    }

    ${
      cte.informacoesComplementares
        ? `
    <div class="cte-details-section">
      <h4><i class="fas fa-sticky-note"></i> Informações Complementares</h4>
      <div class="cte-detail-item">
        <span class="cte-detail-value" style="white-space: pre-wrap;">${cte.informacoesComplementares}</span>
      </div>
    </div>
    `
        : ""
    }
  `;
};

window.ToolManager.closeCTEModal = function () {
  const modalOverlay = document.getElementById("cteModalOverlay");
  if (modalOverlay) {
    modalOverlay.classList.remove("active");
    document.body.classList.remove("cte-modal-open");
  }
};

window.ToolManager.downloadCTEXML = function (serial) {
  window.open(`http://localhost:4010/cte/${serial}/xml`, "_blank");
};

window.ToolManager.loadFrotaTool = async function (contentElement) {
  contentElement.innerHTML = `
    <div class="tool-header">
      <h2>Gerenciamento de Frota</h2>
      <p>Sistema de gerenciamento de veículos da frota.</p>
    </div>
    <div class="frota-tabs">
      <button class="frota-tab-button active" data-tab="veiculos">
        <i class="fas fa-car"></i> Veículos
      </button>
      <button class="frota-tab-button" data-tab="manutencoes">
        <i class="fas fa-tools"></i> Manutenções
      </button>
    </div>
    <div class="frota-container">
      <div class="frota-tab-content active" id="veiculosTab">
        <div class="frota-actions">
          <button class="btn-primary frota-add-btn">
            <i class="fas fa-plus"></i> Adicionar Veículo
          </button>
          <div class="frota-search">
            <input type="text" id="frotaSearch" placeholder="Buscar veículo por placa ou modelo...">
            <button><i class="fas fa-search"></i></button>
          </div>
          <div class="frota-filter">
            <select id="frotaFilter">
              <option value="todos">Todos os veículos</option>
              <option value="Disponível">Disponíveis</option>
              <option value="Em uso">Em uso</option>
              <option value="Manutenção">Em manutenção</option>
            </select>
          </div>
        </div>
        <div class="frota-list" id="frotaList">
          <div class="loader">
            <i class="fas fa-spinner fa-spin"></i> Carregando veículos...
          </div>
        </div>
        <div class="pagination" id="frotaPagination">
        </div>
      </div>
      
      <div class="frota-tab-content" id="manutencoesTab">
        <div class="frota-actions">
          <button class="btn-primary frota-add-manutencao-btn">
            <i class="fas fa-plus"></i> Registrar Manutenção
          </button>
          <div class="frota-search">
            <input type="text" id="manutencaoSearch" placeholder="Buscar por placa ou serviço...">
            <button><i class="fas fa-search"></i></button>
          </div>
          <div class="frota-filter">
            <select id="manutencaoFilter">
              <option value="todos">Todos os veículos</option>
            </select>
          </div>
        </div>
        <div class="manutencao-list" id="manutencaoList">
          <div class="loader">
            <i class="fas fa-spinner fa-spin"></i> Carregando manutenções...
          </div>
        </div>
        <div class="pagination" id="manutencaoPagination">
        </div>
      </div>
    </div>
  `;

  window.ToolManager.setupFrotaTabs();

  window.ToolManager.setupFrotaSearch();
  window.ToolManager.setupFrotaFilters();
  window.ToolManager.setupManutencoesSearch();
  window.ToolManager.setupManutencoesFilters();

  await window.ToolManager.loadFrotaData();
  await window.ToolManager.loadManutencoesData();
};

window.ToolManager.setupFrotaTabs = function () {
  const tabButtons = document.querySelectorAll(".frota-tab-button");
  const tabContents = document.querySelectorAll(".frota-tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.dataset.tab;

      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      button.classList.add("active");
      document.getElementById(`${tabName}Tab`).classList.add("active");
    });
  });
};

window.ToolManager.loadFrotaData = async function () {
  try {
    const response = await fetch("http://localhost:4010/frota");
    if (!response.ok) {
      throw new Error("Falha ao carregar dados da frota");
    }

    const veiculos = await response.json();
    window.ToolManager.renderFrotaItems(veiculos);
  } catch (error) {
    console.error("❌ Erro ao carregar dados da frota:", error);
  }
};

window.ToolManager.renderFrotaItems = function (veiculos) {
  const frotaList = document.getElementById("frotaList");
  if (!frotaList) {
    console.error("❌ Elemento frotaList não encontrado");
    return;
  }

  const veiculosAtivos = veiculos.filter(
    (veiculo) => veiculo.situacaoativo !== "Desativado"
  );

  if (veiculosAtivos.length === 0) {
    frotaList.innerHTML =
      '<div class="empty-state">Nenhum veículo ativo encontrado.</div>';
    return;
  }

  frotaList.innerHTML = "";

  veiculosAtivos.forEach((veiculo) => {
    const card = document.createElement("div");
    card.className = "frota-card";
    card.dataset.placa = veiculo.idobject;
    card.dataset.situacao = veiculo.situacaoativo;

    let statusClass = "disponivel";
    if (veiculo.situacaoativo === "Em uso") {
      statusClass = "em_uso";
    } else if (veiculo.situacaoativo === "Manutenção") {
      statusClass = "manutencao";
    }

    card.innerHTML = `
      <div class="frota-card-header">
        <h3>${veiculo.idobject}</h3>
        <span class="status-badge ${statusClass}">${
      veiculo.situacaoativo
    }</span>
      </div>
      <div class="frota-card-body">
        <div class="vehicle-info">
          <p><strong>Modelo:</strong> ${veiculo.nmobject}</p>
          <p><strong>Tipo:</strong> ${veiculo.nmobjecttype}</p>
          <p><strong>Fabricante:</strong> ${
            veiculo.nmcompany || "Não informado"
          }</p>
          <p><strong>Local:</strong> ${veiculo.nmsite}</p>
        </div>
      </div>
      <div class="frota-card-footer">
        <button class="btn-outline btn-edit" data-placa="${veiculo.idobject}">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button class="btn-outline btn-history" data-placa="${
          veiculo.idobject
        }">
          <i class="fas fa-history"></i> Histórico
        </button>
        ${
          veiculo.situacaoativo === "Manutenção"
            ? `<button class="btn-outline btn-maintenance-complete" data-placa="${veiculo.idobject}">
               <i class="fas fa-check"></i> Finalizar manutenção
             </button>`
            : `<button class="btn-outline btn-maintenance" data-placa="${veiculo.idobject}">
               <i class="fas fa-tools"></i> Manutenção
             </button>`
        }
      </div>
    `;

    frotaList.appendChild(card);
  });

  window.ToolManager.setupFrotaButtons();
};

window.ToolManager.loadManutencoesData = async function () {
  try {
    const response = await fetch("http://localhost:4010/frota/manutencoes");
    if (!response.ok) {
      throw new Error("Falha ao carregar dados de manutenções");
    }

    const manutencoes = await response.json();

    window.ToolManager.manutencoesData = manutencoes;

    window.ToolManager.processManutencoesData(manutencoes);
  } catch (error) {
    console.error("❌ Erro ao carregar dados de manutenções:", error);
    const manutencaoList = document.getElementById("manutencaoList");
    if (manutencaoList) {
      manutencaoList.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Falha ao carregar dados de manutenções. Tente novamente mais tarde.</p>
          <button class="retry-button" id="retryLoadManutencoes">Tentar novamente</button>
        </div>
      `;

      document
        .getElementById("retryLoadManutencoes")
        .addEventListener("click", () => {
          window.ToolManager.loadManutencoesData();
        });
    }
  }
};

window.ToolManager.processManutencoesData = function (manutencoes) {
  const manutencaoList = document.getElementById("manutencaoList");
  if (!manutencaoList) {
    console.error("❌ Elemento manutencaoList não encontrado");
    return;
  }

  if (manutencoes.length === 0) {
    manutencaoList.innerHTML =
      '<div class="empty-state">Nenhuma manutenção encontrada.</div>';
    return;
  }

  const grupamentoManutencoes = {};

  manutencoes.forEach((manutencao) => {
    const placa = manutencao.idobject;
    const data = manutencao.dtcheckin;

    const chave = `${placa}-${data}`;

    if (!grupamentoManutencoes[chave]) {
      grupamentoManutencoes[chave] = {
        placa,
        modelo: manutencao.nmobject,
        local: manutencao.nmsite,
        data,
        status: manutencao.situacaoativo,
        responsavel: manutencao.idcommercial,
        observacao: manutencao.dsobservation,
        servicos: [],
      };
    }

    grupamentoManutencoes[chave].servicos.push({
      descricao: manutencao.nmcostvariable,
      origem: manutencao.origemcusto,
      valor: manutencao.vlrealcost,
    });
  });

  const manutencoesVeiculos = {};

  Object.values(grupamentoManutencoes).forEach((manutencao) => {
    const placa = manutencao.placa;

    if (!manutencoesVeiculos[placa]) {
      manutencoesVeiculos[placa] = {
        placa,
        modelo: manutencao.modelo,
        local: manutencao.local,
        status: manutencao.status,
        manutencoes: [],
      };
    }

    manutencoesVeiculos[placa].manutencoes.push(manutencao);
  });

  window.ToolManager.manutencoesAgrupadas = Object.values(manutencoesVeiculos);

  window.ToolManager.renderManutencoesItems(
    window.ToolManager.manutencoesAgrupadas
  );

  window.ToolManager.updateManutencoesFilter();
};

window.ToolManager.renderManutencoesItems = function (items) {
  const manutencaoList = document.getElementById("manutencaoList");
  if (!manutencaoList) {
    console.error("❌ Elemento manutencaoList não encontrado");
    return;
  }

  if (items.length === 0) {
    manutencaoList.innerHTML =
      '<div class="empty-state">Nenhuma manutenção encontrada com os filtros aplicados.</div>';
    return;
  }

  manutencaoList.innerHTML = "";

  items.forEach((veiculo) => {
    const card = document.createElement("div");
    card.className = "manutencao-veiculo-card";
    card.dataset.placa = veiculo.placa;

    let statusClass = "disponivel";
    if (veiculo.status === "Em uso") {
      statusClass = "em_uso";
    } else if (veiculo.status === "Manutenção") {
      statusClass = "manutencao";
    }

    const manutencoes = veiculo.manutencoes.sort((a, b) => {
      return new Date(b.data) - new Date(a.data);
    });

    const totalServicos = manutencoes.reduce((total, manutencao) => {
      return total + manutencao.servicos.length;
    }, 0);

    const ultimaManutencao = manutencoes[0];
    const dataUltimaManutencao = new Date(
      ultimaManutencao.data
    ).toLocaleDateString("pt-BR");

    const servicosPreview = ultimaManutencao.servicos
      .map((s) => s.descricao)
      .slice(0, 2);
    const temMaisServicos = ultimaManutencao.servicos.length > 2;

    card.innerHTML = `
      <div class="manutencao-veiculo-header">
        <div class="manutencao-veiculo-info">
          <h3>${veiculo.placa}</h3>
          <p class="veiculo-modelo">${veiculo.modelo}</p>
        </div>
        <span class="status-badge ${statusClass}">${veiculo.status}</span>
      </div>
      <div class="manutencao-veiculo-body">
        <div class="manutencao-veiculo-stats">
          <div class="manutencao-stat">
            <span class="stat-value">${manutencoes.length}</span>
            <span class="stat-label">Manutenções</span>
          </div>
          <div class="manutencao-stat">
            <span class="stat-value">${totalServicos}</span>
            <span class="stat-label">Serviços</span>
          </div>
          <div class="manutencao-stat">
            <span class="stat-value">${dataUltimaManutencao}</span>
            <span class="stat-label">Última manutenção</span>
          </div>
        </div>
        <div class="manutencao-veiculo-preview">
          <h4>Últimos serviços:</h4>
          <ul class="servicos-preview">
            ${servicosPreview.map((servico) => `<li>${servico}</li>`).join("")}
            ${
              temMaisServicos
                ? `<li class="mais-servicos">+ ${
                    ultimaManutencao.servicos.length - 2
                  } mais</li>`
                : ""
            }
          </ul>
        </div>
      </div>
      <div class="manutencao-veiculo-footer">
        <button class="btn-outline btn-view-history" data-placa="${
          veiculo.placa
        }">
          <i class="fas fa-history"></i> Ver Histórico Completo
        </button>
      </div>
    `;

    manutencaoList.appendChild(card);
  });

  window.ToolManager.setupManutencoesButtons();
};

window.ToolManager.updateManutencoesFilter = function () {
  const filterSelect = document.getElementById("manutencaoFilter");
  if (!filterSelect || !window.ToolManager.manutencoesAgrupadas) return;

  filterSelect.innerHTML = '<option value="todos">Todos os veículos</option>';

  window.ToolManager.manutencoesAgrupadas.forEach((veiculo) => {
    const option = document.createElement("option");
    option.value = veiculo.placa;
    option.textContent = veiculo.placa;
    filterSelect.appendChild(option);
  });
};

window.ToolManager.setupFrotaSearch = function () {
  const searchInput = document.getElementById("frotaSearch");
  if (!searchInput) return;

  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const searchTerm = e.target.value.toLowerCase();
      window.ToolManager.filterFrotaItems(searchTerm);
    }, 300);
  });
};

window.ToolManager.setupFrotaFilters = function () {
  const filterSelect = document.getElementById("frotaFilter");
  if (!filterSelect) return;

  filterSelect.addEventListener("change", (e) => {
    const statusFilter = e.target.value;
    window.ToolManager.filterFrotaItems(null, statusFilter);
  });
};

window.ToolManager.filterFrotaItems = function (
  searchTerm = "",
  statusFilter = "todos"
) {
  const frotaList = document.getElementById("frotaList");
  if (!frotaList) return;

  const cards = frotaList.querySelectorAll(".frota-card");

  cards.forEach((card) => {
    const placa = card.dataset.placa.toLowerCase();
    const situacao = card.dataset.situacao;

    const matchSearch = !searchTerm || placa.includes(searchTerm);
    const matchStatus = statusFilter === "todos" || situacao === statusFilter;

    if (matchSearch && matchStatus) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
};

window.ToolManager.setupFrotaButtons = function () {
  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.Notifications.showNotification(
        `Editando veículo ${btn.dataset.placa}`,
        "info"
      );
    });
  });

  document.querySelectorAll(".btn-history").forEach((btn) => {
    btn.addEventListener("click", () => {
      const manutencoesTab = document.querySelector(
        '.frota-tab-button[data-tab="manutencoes"]'
      );
      if (manutencoesTab) {
        manutencoesTab.click();
        const manutencaoFilter = document.getElementById("manutencaoFilter");
        if (manutencaoFilter) {
          manutencaoFilter.value = btn.dataset.placa;
          manutencaoFilter.dispatchEvent(new Event("change"));
        }
      }
    });
  });

  document.querySelectorAll(".btn-maintenance").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.Notifications.showNotification(
        `Iniciando manutenção do veículo ${btn.dataset.placa}`,
        "info"
      );
    });
  });

  document.querySelectorAll(".btn-maintenance-complete").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.Notifications.showNotification(
        `Finalizando manutenção do veículo ${btn.dataset.placa}`,
        "success"
      );
    });
  });
};

window.ToolManager.setupManutencoesSearch = function () {
  const searchInput = document.getElementById("manutencaoSearch");
  if (!searchInput) return;

  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const searchTerm = e.target.value.toLowerCase();
      window.ToolManager.filterManutencoesItems(searchTerm);
    }, 300);
  });
};

window.ToolManager.setupManutencoesFilters = function () {
  const filterSelect = document.getElementById("manutencaoFilter");
  if (!filterSelect) return;

  filterSelect.addEventListener("change", (e) => {
    const placaFilter = e.target.value;
    window.ToolManager.filterManutencoesItems(null, placaFilter);
  });
};

window.ToolManager.filterManutencoesItems = function (
  searchTerm = "",
  placaFilter = "todos"
) {
  if (!window.ToolManager.manutencoesAgrupadas) return;

  const filteredManutencoes = window.ToolManager.manutencoesAgrupadas.filter(
    (veiculo) => {
      const matchPlaca =
        placaFilter === "todos" || veiculo.placa === placaFilter;

      const placa = veiculo.placa.toLowerCase();
      const modelo = veiculo.modelo.toLowerCase();

      const servicosMatch = veiculo.manutencoes.some((manutencao) => {
        return manutencao.servicos.some((servico) => {
          return servico.descricao.toLowerCase().includes(searchTerm);
        });
      });

      const matchSearch =
        searchTerm === "" ||
        placa.includes(searchTerm) ||
        modelo.includes(searchTerm) ||
        servicosMatch;

      return matchPlaca && matchSearch;
    }
  );

  window.ToolManager.renderManutencoesItems(filteredManutencoes);
};

window.ToolManager.setupManutencoesButtons = function () {
  document.querySelectorAll(".btn-view-history").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.Notifications.showNotification(
        `Visualizando histórico completo do veículo ${btn.dataset.placa}`,
        "info"
      );
    });
  });
};

window.ToolManager.loadRastreamentoTool = async function (contentElement) {
  if (!window.RastreamentoMain) {
    try {
      await window.ModuleLoader.loadRastreamentoPage();
    } catch (error) {
      console.error(
        "❌ [ToolManager] Erro ao carregar módulos de rastreamento:",
        error
      );
      return;
    }
  }

  contentElement.innerHTML = `
    <div id="trackingView" class="tracking-container">
      <div class="rastreamento-header" style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
        <div class="dashboard-title-row" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <h2 class="dashboard-title" style="font-size: 1.75rem; font-weight: 600; margin: 0;">Rastreamento de Notas</h2>
        </div>
      </div>
      <div id="rastreamentoContainer"></div>
    </div>
  `;

  if (window.RastreamentoMain && window.RastreamentoMain.initRastreamento) {
    try {
      const trackingView = document.getElementById("trackingView");
      await window.RastreamentoMain.initRastreamento(trackingView);
    } catch (error) {
      console.error(
        "❌ Erro ao executar RastreamentoMain.initRastreamento:",
        error
      );
    }
  } else {
    console.error(
      "❌ window.RastreamentoMain.initRastreamento não encontrado!"
    );
  }

  window.ToolManager.setupRastreamentoEvents();
};

window.ToolManager.setupRastreamentoEvents = function () {
  setTimeout(() => {
    document
      .querySelectorAll('[onclick="showTracking()"]')
      .forEach((button) => {
        button.removeAttribute("onclick");

        button.addEventListener("click", () => {
          if (
            window.DashboardNavigation &&
            window.DashboardNavigation.showTracking
          ) {
            window.DashboardNavigation.showTracking();
          } else if (window.showTracking) {
            window.showTracking();
          }
        });
      });

    document.querySelectorAll(".view-tracking-button").forEach((button) => {
      if (!button.getAttribute("data-event-attached")) {
        button.setAttribute("data-event-attached", "true");

        button.addEventListener("click", () => {
          if (
            window.DashboardNavigation &&
            window.DashboardNavigation.showTracking
          ) {
            window.DashboardNavigation.showTracking();
          } else if (window.showTracking) {
            window.showTracking();
          }
        });
      }
    });
  }, 300);
};
