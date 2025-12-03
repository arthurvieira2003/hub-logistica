window.RastreamentoDataTablesRenderer =
  window.RastreamentoDataTablesRenderer || {};

window.dataTableInstance = null;

window.RastreamentoDataTablesRenderer.renderizarCabecalhoTabela = function (
  todasNotas
) {
  const dataRastreamento = window.RastreamentoConfig.obterDataRastreamento();

  return `
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
                n.status === "Em trânsito" || n.status === "Em rota de entrega"
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
  `;
};

window.RastreamentoDataTablesRenderer.converterDadosParaDataTables = function (
  todasNotas
) {
  return todasNotas.map((nota, index) => {
    let borderColor = window.RastreamentoUtils.obterCorBordaTransportadora(
      nota.transportadora.nome
    );

    const logoTransportadora =
      window.RastreamentoUtils.renderizarLogoTransportadora(
        nota.transportadora
      );

    const statusColor =
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
        : "#757575";

    return {
      numero: nota.numero,
      transportadora: `
        <div style="display: flex; align-items: center; gap: 8px;">
          ${logoTransportadora}
          <span>${nota.transportadora.nome}</span>
        </div>
      `,
      status: `
        <span style="display: inline-block; padding: 6px 12px; border-radius: 50px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: white; background: ${statusColor}; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          ${nota.status}
        </span>
      `,
      cliente: nota.cliente || "-",
      origem: nota.origem,
      destino: nota.destino,
      faturamento: window.RastreamentoUtils.formatarData(nota.docDate),
      dataEnvio:
        nota.status === "Aguardando coleta"
          ? "-"
          : window.RastreamentoUtils.formatarData(nota.dataEnvio),
      previsao:
        nota.status === "Aguardando coleta"
          ? "-"
          : window.RastreamentoUtils.formatarData(nota.previsaoEntrega),
      acoes: `
        <button class="btn-detalhes detalhes-btn" data-nota="${nota.numero}" style="background: #247675; color: white; border: none; border-radius: 6px; padding: 8px; font-size: 14px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(36, 118, 117, 0.2); display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; margin: 0 auto;">
          <i class="fas fa-eye"></i>
        </button>
      `,
      _numero: parseInt(nota.numero) || 0,
      _transportadora: nota.transportadora.nome,
      _status: nota.status,
      _cliente: nota.cliente || "",
      _origem: nota.origem,
      _destino: nota.destino,
      _faturamento: new Date(nota.docDate),
      _dataEnvio:
        nota.status === "Aguardando coleta"
          ? new Date(0)
          : new Date(nota.dataEnvio),
      _previsao:
        nota.status === "Aguardando coleta"
          ? new Date(0)
          : new Date(nota.previsaoEntrega),
      _atrasada: nota.atrasada,
      _borderColor: borderColor,
    };
  });
};

window.RastreamentoDataTablesRenderer.renderizarTabela = function (todasNotas) {
  const cabecalho =
    window.RastreamentoDataTablesRenderer.renderizarCabecalhoTabela(todasNotas);

  return `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
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
      
      .dataTables_wrapper {
        font-family: Arial, sans-serif;
      }
      
      .dataTables_wrapper .dataTables_length,
      .dataTables_wrapper .dataTables_filter,
      .dataTables_wrapper .dataTables_info,
      .dataTables_wrapper .dataTables_processing,
      .dataTables_wrapper .dataTables_paginate {
        color: #333;
        font-size: 14px;
      }
      
      .dataTables_wrapper .dataTables_length select,
      .dataTables_wrapper .dataTables_filter input {
        border: 2px solid #247675;
        border-radius: 6px;
        padding: 8px 12px;
        font-size: 14px;
        color: #333;
        background: white;
        transition: all 0.2s ease;
      }
      
      .dataTables_wrapper .dataTables_length select:focus,
      .dataTables_wrapper .dataTables_filter input:focus {
        outline: none;
        border-color: #1a5a5a;
        box-shadow: 0 0 0 3px rgba(36, 118, 117, 0.1);
      }
      
      .dataTables_wrapper .dataTables_paginate .paginate_button {
        border: 1px solid #247675;
        color: #247675 !important;
        background: white;
        border-radius: 6px;
        margin: 0 2px;
        padding: 8px 12px;
        transition: all 0.2s ease;
      }
      
      .dataTables_wrapper .dataTables_paginate .paginate_button:hover {
        background: #247675;
        color: white !important;
        border-color: #1a5a5a;
      }
      
      .dataTables_wrapper .dataTables_paginate .paginate_button.current {
        background: #247675;
        color: white !important;
        border-color: #1a5a5a;
      }
      
      .dataTables_wrapper .dataTables_paginate .paginate_button.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      #rastreamentoDataTable {
        width: 100% !important;
        border-collapse: collapse;
        font-family: Arial, sans-serif;
        margin-bottom: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border-radius: 8px;
        overflow: hidden;
      }
      
      #rastreamentoDataTable tbody td {
        padding: 12px 15px;
        border-bottom: 1px solid #eee;
        vertical-align: middle;
      }
      
      #rastreamentoDataTable tbody tr {
        transition: all 0.3s ease;
      }
      
      #rastreamentoDataTable tbody tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      
      #rastreamentoDataTable tbody tr:hover {
        background-color: #f0f8ff;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }
      
      .dataTables_wrapper .dataTables_sorting {
        cursor: pointer;
        position: relative;
      }
      
      .dataTables_wrapper .dataTables_sorting:after {
        content: "⇅";
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0.5;
        font-size: 12px;
      }
      
      .dataTables_wrapper .dataTables_sorting_asc:after {
        content: "↑";
        opacity: 1;
        color: #247675;
      }
      
      .dataTables_wrapper .dataTables_sorting_desc:after {
        content: "↓";
        opacity: 1;
        color: #247675;
      }
      
      @media (max-width: 768px) {
        .dataTables_wrapper .dataTables_length,
        .dataTables_wrapper .dataTables_filter {
          text-align: center;
          margin-bottom: 10px;
        }
        
        .dataTables_wrapper .dataTables_paginate {
          text-align: center;
          margin-top: 10px;
        }
        
        #rastreamentoDataTable {
          font-size: 12px;
        }
        
        #rastreamentoDataTable thead th,
        #rastreamentoDataTable tbody td {
          padding: 8px;
        }
      }
    </style>
    
    ${cabecalho}
    
    <div class="tabela-container" style="overflow-x: auto; width: 100%;">
      <table id="rastreamentoDataTable" class="display" style="width: 100%;">
        <thead>
          <tr>
            <th>Nota</th>
            <th>Transportadora</th>
            <th>Status</th>
            <th>Cliente</th>
            <th>Origem</th>
            <th>Destino</th>
            <th>Faturamento</th>
            <th>Data Envio</th>
            <th>Previsão</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
    </div>
  `;
};

window.RastreamentoDataTablesRenderer.aplicarFiltro = function (
  tipoFiltro,
  valor
) {
  if (!window.dataTableInstance) return;

  window.dataTableInstance.search("").columns().search("").draw();

  switch (tipoFiltro) {
    case "status":
      if (Array.isArray(valor) && valor.length > 0) {
        const regex = valor
          .map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
          .join("|");
        window.dataTableInstance.column(2).search(regex, true, false);
      } else if (valor) {
        window.dataTableInstance.column(2).search(valor, true, false);
      }
      break;

    case "transportadora":
      if (Array.isArray(valor) && valor.length > 0) {
        const regex = valor
          .map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
          .join("|");
        window.dataTableInstance.column(1).search(regex, true, false);
      } else if (valor) {
        window.dataTableInstance.column(1).search(valor, true, false);
      }
      break;

    case "atrasadas":
      if (valor) {
        window.dataTableInstance.column(2).search("Atrasado", true, false);
      }
      break;

    case "busca":
      if (valor) {
        window.dataTableInstance.search(valor);
      }
      break;
  }

  window.dataTableInstance.draw();
};

window.RastreamentoDataTablesRenderer.limparFiltros = function () {
  if (!window.dataTableInstance) return;

  window.dataTableInstance.search("").columns().search("").draw();
};

window.RastreamentoDataTablesRenderer.aguardarDataTables = function () {
  return new Promise((resolve, reject) => {
    if (
      typeof $ !== "undefined" &&
      typeof $.fn !== "undefined" &&
      $.fn.DataTable
    ) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(
      'script[src*="datatables.net"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://cdn.datatables.net/2.3.4/js/dataTables.min.js";
      script.onerror = () => {
        reject(new Error("Erro ao carregar DataTables"));
      };
      document.head.appendChild(script);
    }

    let attempts = 0;
    const maxAttempts = 50;
    const checkInterval = setInterval(() => {
      attempts++;
      if (
        typeof $ !== "undefined" &&
        typeof $.fn !== "undefined" &&
        $.fn.DataTable
      ) {
        clearInterval(checkInterval);
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        reject(
          new Error(
            "DataTables não foi carregado após 5 segundos de espera. Verifique se o script está incluído no HTML."
          )
        );
      }
    }, 100);
  });
};

window.RastreamentoDataTablesRenderer.inicializarDataTable = async function (
  todasNotas
) {
  if (typeof $ === "undefined") {
    console.error("❌ jQuery não está disponível");
    return Promise.resolve();
  }

  try {
    await window.RastreamentoDataTablesRenderer.aguardarDataTables();
  } catch (error) {
    console.error("❌ Erro ao aguardar DataTables:", error);
    return Promise.resolve();
  }

  if (typeof $.fn.DataTable === "undefined") {
    console.error(
      "❌ DataTables não está disponível. Verifique se o script foi carregado corretamente."
    );
    return Promise.resolve();
  }

  const tabelaElement = $("#rastreamentoDataTable");
  if (tabelaElement.length === 0) {
    console.error("❌ Tabela #rastreamentoDataTable não encontrada");
    return Promise.resolve();
  }

  if (!Array.isArray(todasNotas)) {
    console.error("❌ todasNotas não é um array válido:", todasNotas);
    return Promise.resolve();
  }

  if (window.dataTableInstance) {
    try {
      window.dataTableInstance.destroy();
    } catch (error) {
      console.warn("⚠️ Erro ao destruir DataTable anterior:", error);
    }
    window.dataTableInstance = null;
  }

  const dadosDataTables =
    window.RastreamentoDataTablesRenderer.converterDadosParaDataTables(
      todasNotas
    );

  if (dadosDataTables.length > 0) {
    const primeiroRegistro = dadosDataTables[0];
    const camposObrigatorios = [
      "numero",
      "transportadora",
      "status",
      "cliente",
      "origem",
      "destino",
      "faturamento",
      "dataEnvio",
      "previsao",
      "acoes",
    ];

    for (const campo of camposObrigatorios) {
      if (!(campo in primeiroRegistro)) {
        console.error(
          `❌ Campo obrigatório '${campo}' não encontrado no registro:`,
          primeiroRegistro
        );
        return Promise.resolve();
      }
    }
  }

  if (dadosDataTables.length === 0) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    try {
      window.dataTableInstance = $("#rastreamentoDataTable").DataTable({
        data: dadosDataTables,
        columns: [
          {
            data: "numero",
            title: "NF",
            className: "dt-type-numeric",
          },
          {
            data: "transportadora",
            title: "Transp.",
          },
          {
            data: "status",
            title: "Status",
          },
          {
            data: "cliente",
            title: "Cliente",
          },
          {
            data: "origem",
            title: "Origem",
          },
          {
            data: "destino",
            title: "Destino",
          },
          {
            data: "faturamento",
            title: "Faturamento",
            className: "dt-type-date",
          },
          {
            data: "dataEnvio",
            title: "Envio",
            className: "dt-type-date",
          },
          {
            data: "previsao",
            title: "Previsão",
            className: "dt-type-date",
          },
          {
            data: "acoes",
            title: "Detalhes",
            orderable: false,
            searchable: false,
            className: "dt-actions",
          },
        ],
        order: [[6, "desc"]],
        pageLength: 100,
        lengthMenu: [
          [10, 25, 50, 100],
          [10, 25, 50, 100],
        ],
        language: {
          sEmptyTable: "Nenhum registro encontrado",
          sInfo: "Mostrando de _START_ até _END_ de _TOTAL_ registros",
          sInfoEmpty: "Mostrando 0 até 0 de 0 registros",
          sInfoFiltered: "(Filtrados de _MAX_ registros)",
          sInfoPostFix: "",
          sInfoThousands: ".",
          sLengthMenu: "_MENU_ resultados por página",
          sLoadingRecords: "Carregando...",
          sProcessing: "Processando...",
          sZeroRecords: "Nenhum registro encontrado",
          sSearch: "Buscar:",
          oPaginate: {
            sNext: "Próximo",
            sPrevious: "Anterior",
            sFirst: "Primeiro",
            sLast: "Último",
          },
          oAria: {
            sSortAscending: ": Ordenar colunas de forma ascendente",
            sSortDescending: ": Ordenar colunas de forma descendente",
          },
        },
        responsive: true,
        dom: '<"top"lf>rt<"bottom"ip><"clear">',
        columnDefs: [
          {
            targets: [0, 6, 7, 8],
            type: "string",
          },
        ],
        initComplete: function () {
          if (
            window.RastreamentoEvents &&
            window.RastreamentoEvents.configurarEventosDetalhes
          ) {
            window.RastreamentoEvents.configurarEventosDetalhes(todasNotas);
          }

          window.RastreamentoDataTablesRenderer.adicionarFiltrosAvancados(
            $(this).DataTable()
          );

          resolve();
        },
      });
    } catch (error) {
      console.error("❌ Erro ao inicializar DataTable:", error);
      console.error("❌ Dados recebidos:", dadosDataTables);
      console.error("❌ Elemento da tabela:", tabelaElement);
      reject(error);
    }
  }).catch((error) => {
    console.error("❌ Erro ao inicializar DataTable:", error);
    console.error("❌ Dados recebidos:", dadosDataTables);
    console.error("❌ Elemento da tabela:", tabelaElement);

    return Promise.resolve();
  });
};

window.RastreamentoDataTablesRenderer.renderizarMensagemVazia = function () {
  const dataRastreamento = window.RastreamentoConfig.obterDataRastreamento();

  return `
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
        <p style="margin: 0 0 24px 0; color: #666; font-size: 16px;">Não foram encontradas notas de rastreamento para a data <strong>${window.RastreamentoUtils.formatarData(
          dataRastreamento
        )}</strong></p>
        <p style="margin: 0; color: #888; font-size: 14px;">Tente selecionar uma data diferente ou verifique se há envios programados para esta data.</p>
      </div>
    </div>
  `;
};

window.RastreamentoDataTablesRenderer.adicionarFiltrosAvancados = function (
  dataTableInstance
) {
  const instance = dataTableInstance || window.dataTableInstance;

  if (!instance) {
    console.error("❌ ERRO: Nenhuma instância do DataTable encontrada!");
    return;
  }

  const tabela = instance.table().node();

  const cabecalhos = tabela.querySelectorAll("thead th");

  cabecalhos.forEach((cabecalho, index) => {
    if (index === cabecalhos.length - 1) {
      return;
    }

    let container = cabecalho.querySelector(".dt-column-header");

    if (!container) {
      container = document.createElement("div");
      container.className = "dt-column-header";
      container.style.position = "relative";

      const conteudoExistente = cabecalho.innerHTML;
      container.innerHTML = conteudoExistente;

      cabecalho.innerHTML = "";
      cabecalho.appendChild(container);
    }

    const botoesExistentes = container.querySelector(".dtcc");

    if (botoesExistentes) {
      return;
    }

    let spanTitulo = container.querySelector(".dt-column-title");

    if (!spanTitulo) {
      spanTitulo = document.createElement("span");
      spanTitulo.className = "dt-column-title";

      const textoOriginal = cabecalho.textContent.trim();
      spanTitulo.textContent = textoOriginal;

      container.insertBefore(spanTitulo, container.firstChild);
    } else {
      const textoOriginal = cabecalho.textContent.trim();
      if (!spanTitulo.textContent.trim()) {
        spanTitulo.textContent = textoOriginal;
      }
    }

    const botoesContainer = document.createElement("span");
    botoesContainer.className = "dtcc";

    const botaoFiltro = document.createElement("span");
    botaoFiltro.className = "dt-column-filter";
    botaoFiltro.setAttribute("role", "button");
    botaoFiltro.setAttribute("aria-label", "Filtros avançados");
    botaoFiltro.setAttribute("aria-haspopup", "dialog");
    botaoFiltro.setAttribute("aria-expanded", "false");
    botaoFiltro.setAttribute("tabindex", "0");
    botaoFiltro.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="4" x2="20" y1="12" y2="12"></line>
        <line x1="4" x2="20" y1="6" y2="6"></line>
        <line x1="4" x2="20" y1="18" y2="18"></line>
      </svg>
    `;

    botaoFiltro.addEventListener("click", function (e) {
      e.stopPropagation();
      window.RastreamentoDataTablesRenderer.mostrarFiltroAvancado(
        index,
        botaoFiltro,
        instance
      );
    });

    botoesContainer.appendChild(botaoFiltro);
    container.appendChild(botoesContainer);

    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "flex-start";
    container.style.width = "100%";
    container.style.flexDirection = "row";

    if (spanTitulo) {
      spanTitulo.style.order = "1";
      spanTitulo.style.textAlign = "left";
      spanTitulo.style.marginRight = "8px";
      spanTitulo.style.flex = "0 0 auto";
    }

    if (botoesContainer) {
      botoesContainer.style.order = "2";
      botoesContainer.style.marginLeft = "auto";
    }

    const orderButton = container.querySelector(".dt-column-order");
    if (orderButton) {
      orderButton.style.order = "3";
      orderButton.style.marginLeft = "4px";
    }
  });

  const cabecalhosFinais = tabela.querySelectorAll("thead th");
  cabecalhosFinais.forEach((cabecalho, index) => {
    const container = cabecalho.querySelector(".dt-column-header");
    const titleElement = cabecalho.querySelector(".dt-column-title");
    const dtccElement = cabecalho.querySelector(".dtcc");

    if (container) {
      const computedStyle = window.getComputedStyle(container);
      let containerStyles = {
        display: computedStyle.display,
        justifyContent: computedStyle.justifyContent,
        alignItems: computedStyle.alignItems,
        flexDirection: computedStyle.flexDirection,
      };
    }

    if (titleElement) {
      const computedStyle = window.getComputedStyle(titleElement);
      let titleStyles = {
        order: computedStyle.order,
        textAlign: computedStyle.textAlign,
        marginRight: computedStyle.marginRight,
        flex: computedStyle.flex,
      };
    }

    if (dtccElement) {
      const computedStyle = window.getComputedStyle(dtccElement);
      let dtccStyles = {
        order: computedStyle.order,
        marginLeft: computedStyle.marginLeft,
        display: computedStyle.display,
      };
    }
  });
};

window.RastreamentoDataTablesRenderer.mostrarFiltroAvancado = function (
  indiceColuna,
  botao,
  dataTableInstance
) {
  const instance = dataTableInstance || window.dataTableInstance;
  document.querySelectorAll(".dtcc-dropdown").forEach((dropdown) => {
    dropdown.remove();
  });

  const dropdown = document.createElement("div");
  dropdown.className = "dtcc-dropdown";
  dropdown.setAttribute("role", "dialog");
  dropdown.setAttribute("aria-label", "More...");

  const rect = botao.getBoundingClientRect();
  dropdown.style.setProperty("--dropdown-top", rect.bottom + 5 + "px");
  dropdown.style.setProperty("--dropdown-left", rect.left + "px");

  dropdown.innerHTML = `
    <div class="dtcc-dropdown-liner">
      <div class="dtcc-content dtcc-search dtcc-searchText">
        <div class="dtcc-search-title">Filtros Avançados</div>
        <div>
          <select class="filtro-tipo">
            <option value="contains">Contém</option>
            <option value="notContains">Não contém</option>
            <option value="equal">Igual a</option>
            <option value="notEqual">Diferente de</option>
            <option value="starts">Começa com</option>
            <option value="ends">Termina com</option>
            <option value="empty">Vazio</option>
            <option value="notEmpty">Não vazio</option>
          </select>
          <div style="position: relative;">
            <input type="text" class="filtro-valor" placeholder="Digite o valor...">
            <span class="dtcc-search-clear">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </span>
          </div>
        </div>
      </div>
      <div class="dtcc-spacer" role="separator"></div>
      <button class="dtcc-button dtcc-button_orderAsc" type="button" aria-label="Sort Ascending">
        <span class="dtcc-button-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 8 4-4 4 4"></path>
            <path d="M7 4v16"></path>
            <path d="M11 12h4"></path>
            <path d="M11 16h7"></path>
            <path d="M11 20h10"></path>
          </svg>
        </span>
        <span class="dtcc-button-text">Ordenar Crescente</span>
        <span class="dtcc-button-state"></span>
        <span class="dtcc-button-extra"></span>
      </button>
      <button class="dtcc-button dtcc-button_orderDesc" type="button" aria-label="Sort Descending">
        <span class="dtcc-button-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 16 4 4 4-4"></path>
            <path d="M7 20V4"></path>
            <path d="M11 4h10"></path>
            <path d="M11 8h7"></path>
            <path d="M11 12h4"></path>
          </svg>
        </span>
        <span class="dtcc-button-text">Ordenar Decrescente</span>
        <span class="dtcc-button-state"></span>
        <span class="dtcc-button-extra"></span>
      </button>
      <button class="dtcc-button dtcc-button_orderClear" type="button" aria-label="Clear sort">
        <span class="dtcc-button-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21 21-8-8"></path>
            <path d="M3 4h12"></path>
            <path d="M3 8h9"></path>
            <path d="M3 12h6"></path>
            <path d="m13 21 8-8"></path>
          </svg>
        </span>
        <span class="dtcc-button-text">Limpar Ordenação</span>
        <span class="dtcc-button-state"></span>
        <span class="dtcc-button-extra"></span>
      </button>
    </div>
  `;

  const botaoAsc = dropdown.querySelector(".dtcc-button_orderAsc");
  const botaoDesc = dropdown.querySelector(".dtcc-button_orderDesc");
  const botaoClear = dropdown.querySelector(".dtcc-button_orderClear");
  const inputFiltro = dropdown.querySelector(".filtro-valor");
  const selectTipo = dropdown.querySelector(".filtro-tipo");
  const botaoClearFiltro = dropdown.querySelector(".dtcc-search-clear");

  botaoAsc.addEventListener("click", function () {
    instance.column(indiceColuna).order("asc").draw();
    dropdown.remove();
  });

  botaoDesc.addEventListener("click", function () {
    instance.column(indiceColuna).order("desc").draw();
    dropdown.remove();
  });

  botaoClear.addEventListener("click", function () {
    instance.column(indiceColuna).order("").draw();
    dropdown.remove();
  });

  botaoClearFiltro.addEventListener("click", function () {
    instance.column(indiceColuna).search("").draw();
    inputFiltro.value = "";
  });

  let timeoutId;
  inputFiltro.addEventListener("input", function () {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const valor = inputFiltro.value;
      const tipo = selectTipo.value;

      if (valor.trim() === "") {
        instance.column(indiceColuna).search("").draw();
        return;
      }

      let regex = "";
      switch (tipo) {
        case "contains":
          regex = valor;
          break;
        case "notContains":
          regex =
            "^(?!.*" + valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ").*$";
          break;
        case "equal":
          regex = "^" + valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$";
          break;
        case "notEqual":
          regex =
            "^(?!" + valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$).*$";
          break;
        case "starts":
          regex = "^" + valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          break;
        case "ends":
          regex = valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$";
          break;
        case "empty":
          regex = "^$";
          break;
        case "notEmpty":
          regex = "^(?!$).*$";
          break;
      }

      instance.column(indiceColuna).search(regex, true, false).draw();
    }, 300);
  });

  document.addEventListener("click", function fecharDropdown(e) {
    if (!dropdown.contains(e.target) && !botao.contains(e.target)) {
      dropdown.remove();
      document.removeEventListener("click", fecharDropdown);
    }
  });

  document.body.appendChild(dropdown);

  setTimeout(() => {
    inputFiltro.focus();
  }, 100);
};

window.RastreamentoDataTablesRenderer.atualizarDados = function (todasNotas) {
  if (window.dataTableInstance) {
    const dadosDataTables =
      window.RastreamentoDataTablesRenderer.converterDadosParaDataTables(
        todasNotas
      );
    window.dataTableInstance.clear();
    window.dataTableInstance.rows.add(dadosDataTables);
    window.dataTableInstance.draw();

    window.RastreamentoEvents.configurarEventosDetalhes(todasNotas);
  }
};
