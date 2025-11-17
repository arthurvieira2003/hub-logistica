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

      if (tool === "admin") {
        window.open("/administration", "_blank");
        return;
      }

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
      window.open("/administration", "_blank");
      return;
    }

    switch (tool) {
      case "fretes":
        await window.ToolManager.loadFretesTool(contentElement);
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
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  const dataAtual = `${ano}-${mes}-${dia}`;

  contentElement.innerHTML = `
    <div class="tool-header">
      <h2>Conhecimentos de Transporte Eletrônicos (CT-e)</h2>
      <p>Gerenciamento de fretes e conhecimentos de transporte.</p>
    </div>
    <div class="fretes-container">
      <div class="fretes-actions">
        <div class="fretes-date-selector" style="display: flex; align-items: center; gap: 12px;">
          <label for="fretesData" style="font-size: 14px; font-weight: 600; color: #333;">Data:</label>
          <input type="date" id="fretesData" value="${dataAtual}" style="padding: 8px 12px; border: 2px solid var(--primary-color); border-radius: 6px; font-size: 14px; color: #333; background: white; cursor: pointer; transition: all 0.2s ease;">
          <button id="btnAtualizarFretesData" style="background: var(--primary-color); color: white; border: none; border-radius: 6px; padding: 8px 16px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 6px;">
            <i class="fas fa-sync-alt"></i> Atualizar
          </button>
        </div>
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

  window.ToolManager.setupFretesDateSelector();
  await window.ToolManager.loadFretesData();
};

window.ToolManager.loadFretesData = async function (dataFiltro = null) {
  try {
    if (!dataFiltro) {
      const dataInput = document.getElementById("fretesData");
      dataFiltro = dataInput ? dataInput.value : null;
    }

    const API_BASE_URL = (window.getApiBaseUrl && window.getApiBaseUrl()) || 
                         (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || 
                         "http://localhost:4010";
    let url = `${API_BASE_URL}/cte`;
    if (dataFiltro) {
      url += `?data=${dataFiltro}`;
    }

    const response = await fetch(url);
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

window.ToolManager.setupFretesDateSelector = function () {
  const dataInput = document.getElementById("fretesData");
  const btnAtualizar = document.getElementById("btnAtualizarFretesData");

  if (dataInput && btnAtualizar) {
    btnAtualizar.addEventListener("click", async function () {
      const novaData = dataInput.value;

      if (novaData) {
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
        this.disabled = true;

        try {
          await window.ToolManager.loadFretesData(novaData);
        } catch (error) {
          console.error("❌ Erro ao recarregar fretes:", error);
        } finally {
          this.innerHTML = originalText;
          this.disabled = false;
        }
      }
    });

    dataInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        btnAtualizar.click();
      }
    });
  } else {
    console.error("❌ Elementos do datepicker de fretes não encontrados!");
  }
};

window.ToolManager.renderFretesItems = async function (items) {
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
            <th>Valor CT-e</th>
            <th>Validação</th>
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
        <td class="frete-validation" data-serial="${item.Serial}">
          <div class="validation-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Validando...</span>
          </div>
        </td>
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

  await window.ToolManager.validarPrecosFretes(items);
};

window.ToolManager.validarPrecosFretes = async function (items) {
  const validacoes = await Promise.allSettled(
    items.map(async (item) => {
      try {
        const API_BASE_URL = (window.getApiBaseUrl && window.getApiBaseUrl()) || 
                             (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || 
                             "http://localhost:4010";
        const response = await fetch(
          `${API_BASE_URL}/cte/${item.Serial}/validar-preco`
        );

        let validacao;
        if (response.ok) {
          validacao = await response.json();
        } else {
          try {
            validacao = await response.json();
          } catch {
            validacao = {
              valido: false,
              motivo: `Erro ${response.status}: ${response.statusText}`,
              precoTabela: null,
              precoCTE: item.DocTotal,
            };
          }
        }

        return { serial: item.Serial, validacao };
      } catch (error) {
        return {
          serial: item.Serial,
          validacao: {
            valido: false,
            motivo: "Erro ao validar",
            precoTabela: null,
            precoCTE: item.DocTotal,
          },
        };
      }
    })
  );

  validacoes.forEach((result) => {
    if (result.status === "fulfilled") {
      const { serial, validacao } = result.value;
      window.ToolManager.renderValidacaoPreco(serial, validacao);
    }
  });
};

window.ToolManager.renderValidacaoPreco = function (serial, validacao) {
  const validationCell = document.querySelector(
    `.frete-validation[data-serial="${serial}"]`
  );
  if (!validationCell) return;

  const existingErrorIcon = validationCell.querySelector(
    "i[data-tooltip-error]"
  );
  if (
    existingErrorIcon &&
    typeof tippy !== "undefined" &&
    existingErrorIcon._tippy
  ) {
    existingErrorIcon._tippy.destroy();
  }

  const existingValidationIcon = validationCell.querySelector(
    "i[data-tooltip-validation]"
  );
  if (
    existingValidationIcon &&
    typeof tippy !== "undefined" &&
    existingValidationIcon._tippy
  ) {
    existingValidationIcon._tippy.destroy();
  }

  const tableRow = validationCell.closest("tr");

  const {
    valido,
    status,
    motivo,
    precoTabela,
    diferenca,
    percentualDiferenca,
  } = validacao;

  if (tableRow) {
    tableRow.classList.remove(
      "validation-row-ok",
      "validation-row-acima",
      "validation-row-abaixo",
      "validation-row-error",
      "validation-row-error-cidade",
      "validation-row-error-transportadora",
      "validation-row-error-rota",
      "validation-row-error-faixa",
      "validation-row-error-preco",
      "validation-row-error-dados"
    );
  }

  if (!valido) {
    if (motivo && motivo.includes("não é um CT-e")) {
      if (tableRow) {
        tableRow.remove();
      }
      return;
    }

    let errorType = "error";
    let errorIcon = "fa-exclamation-circle";

    if (motivo) {
      if (
        motivo.includes("Cidade de origem") ||
        motivo.includes("Cidade de destino")
      ) {
        errorType = "error-cidade";
        errorIcon = "fa-map-marker-alt";
      } else if (motivo.includes("Transportadora")) {
        errorType = "error-transportadora";
        errorIcon = "fa-truck";
      } else if (motivo.includes("Rota")) {
        errorType = "error-rota";
        errorIcon = "fa-route";
      } else if (motivo.includes("Faixa de peso") || motivo.includes("peso")) {
        errorType = "error-faixa";
        errorIcon = "fa-weight";
      } else if (
        motivo.includes("Preço não encontrado") ||
        motivo.includes("tabela")
      ) {
        errorType = "error-preco";
        errorIcon = "fa-dollar-sign";
      } else if (motivo.includes("Dados insuficientes")) {
        errorType = "error-dados";
        errorIcon = "fa-info-circle";
      }
    }

    if (tableRow) {
      tableRow.classList.add(`validation-row-${errorType}`);
    }

    const mensagemErro = motivo || "Não foi possível validar";

    validationCell.innerHTML = `
      <div class="validation-error ${errorType}">
        <i class="fas ${errorIcon}" data-tooltip-error="${mensagemErro}"></i>
      </div>
    `;

    const iconElement = validationCell.querySelector("i[data-tooltip-error]");
    if (iconElement && typeof tippy !== "undefined") {
      tippy(iconElement, {
        content: mensagemErro,
        placement: "top",
        delay: [0, 0],
        theme: "error-tooltip",
        arrow: true,
        allowHTML: false,
      });
    }

    return;
  }

  const precoTabelaFormatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(precoTabela || 0);

  const diferencaFormatada = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Math.abs(diferenca || 0));

  let statusClass = "validation-ok";
  let rowClass = "validation-row-ok";
  let statusIcon = "fa-check-circle";
  let statusText = "OK";

  if (status === "acima") {
    statusClass = "validation-acima";
    rowClass = "validation-row-acima";
    statusIcon = "fa-exclamation-triangle";
    statusText = "Acima";
  } else if (status === "abaixo") {
    statusClass = "validation-abaixo";
    rowClass = "validation-row-abaixo";
    statusIcon = "fa-info-circle";
    statusText = "Abaixo";
  }

  if (tableRow) {
    tableRow.classList.remove(
      "validation-row-ok",
      "validation-row-acima",
      "validation-row-abaixo"
    );
    tableRow.classList.add(rowClass);
  }

  const temDiferenca =
    diferenca !== null && diferenca !== 0 && Math.abs(diferenca) > 0.01;

  let tooltipContent = `Preço da tabela: ${precoTabelaFormatado}`;
  if (temDiferenca) {
    const sinal = diferenca > 0 ? "+" : "-";
    tooltipContent += `<br>Diferença: ${sinal}${diferencaFormatada} (${sinal}${percentualDiferenca.toFixed(
      2
    )}%)`;
  } else {
    tooltipContent += "<br>Preço está de acordo com a tabela";
  }

  validationCell.innerHTML = `
    <div class="validation-result ${statusClass}">
      <i class="fas ${statusIcon}" data-tooltip-validation="${tooltipContent}"></i>
    </div>
  `;

  const iconElement = validationCell.querySelector(
    "i[data-tooltip-validation]"
  );
  if (iconElement && typeof tippy !== "undefined") {
    tippy(iconElement, {
      content: tooltipContent,
      placement: "top",
      delay: [0, 0],
      theme: "validation-tooltip",
      arrow: true,
      allowHTML: true,
    });
  }
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
    const API_BASE_URL = (window.getApiBaseUrl && window.getApiBaseUrl()) || 
                         (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || 
                         "http://localhost:4010";
    const response = await fetch(`${API_BASE_URL}/cte/${serial}`);
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
  const API_BASE_URL = (window.getApiBaseUrl && window.getApiBaseUrl()) || 
                       (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || 
                       "http://localhost:4010";
  window.open(`${API_BASE_URL}/cte/${serial}/xml`, "_blank");
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
        <div class="rastreamento-title-row" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <h2 style="font-size: 1.75rem; font-weight: 600; margin: 0;">Rastreamento de Notas</h2>
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
          if (window.showTracking) {
            window.showTracking();
          }
        });
      });

    document.querySelectorAll(".view-tracking-button").forEach((button) => {
      if (!button.getAttribute("data-event-attached")) {
        button.setAttribute("data-event-attached", "true");

        button.addEventListener("click", () => {
          if (window.showTracking) {
            window.showTracking();
          }
        });
      }
    });
  }, 300);
};
