/**
 * Renderizador de Tabela com DataTables
 * Contém funções para renderizar a tabela de rastreamento usando DataTables
 */

// Namespace para renderizadores DataTables
window.RastreamentoDataTablesRenderer =
  window.RastreamentoDataTablesRenderer || {};

// Variável global para armazenar a instância do DataTable
window.dataTableInstance = null;

/**
 * Renderiza o cabeçalho da tabela com estatísticas
 * @param {Array} todasNotas - Array com todas as notas
 * @returns {string} HTML do cabeçalho
 */
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

/**
 * Converte dados das notas para formato DataTables
 * @param {Array} todasNotas - Array com todas as notas
 * @returns {Array} Array formatado para DataTables
 */
window.RastreamentoDataTablesRenderer.converterDadosParaDataTables = function (
  todasNotas
) {
  return todasNotas.map((nota, index) => {
    // Determinar cor da borda da transportadora
    let borderColor = window.RastreamentoUtils.obterCorBordaTransportadora(
      nota.transportadora.nome
    );

    // Renderizar logo da transportadora
    const logoTransportadora =
      window.RastreamentoUtils.renderizarLogoTransportadora(
        nota.transportadora
      );

    // Determinar cor do status
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
      // Dados para exibição
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
      // Dados para ordenação e filtros
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

/**
 * Renderiza a tabela completa com DataTables
 * @param {Array} todasNotas - Array com todas as notas
 * @returns {string} HTML da tabela
 */
window.RastreamentoDataTablesRenderer.renderizarTabela = function (todasNotas) {
  const cabecalho =
    window.RastreamentoDataTablesRenderer.renderizarCabecalhoTabela(todasNotas);

  return `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
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
      
      /* Estilos para DataTables */
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
      
      /* Estilos para a tabela */
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
      
      /* Estilos para ordenação */
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
      
      /* Responsivo */
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
          <!-- Dados serão inseridos via DataTables -->
        </tbody>
      </table>
    </div>
  `;
};

/**
 * Aplica filtros personalizados no DataTable
 * @param {string} tipoFiltro - Tipo do filtro ('status', 'transportadora', 'atrasadas')
 * @param {string|Array} valor - Valor do filtro
 */
window.RastreamentoDataTablesRenderer.aplicarFiltro = function (
  tipoFiltro,
  valor
) {
  if (!window.dataTableInstance) return;

  // Limpar filtros anteriores
  window.dataTableInstance.search("").columns().search("").draw();

  switch (tipoFiltro) {
    case "status":
      if (Array.isArray(valor) && valor.length > 0) {
        // Filtro múltiplo de status
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
        // Filtrar apenas notas atrasadas
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

/**
 * Limpa todos os filtros do DataTable
 */
window.RastreamentoDataTablesRenderer.limparFiltros = function () {
  if (!window.dataTableInstance) return;

  window.dataTableInstance.search("").columns().search("").draw();
};

/**
 * Inicializa o DataTable com os dados
 * @param {Array} todasNotas - Array com todas as notas
 */
window.RastreamentoDataTablesRenderer.inicializarDataTable = function (
  todasNotas
) {
  // Verificar se jQuery está disponível
  if (typeof $ === "undefined") {
    console.error("❌ jQuery não está disponível");
    return;
  }

  // Verificar se a tabela existe
  const tabelaElement = $("#rastreamentoDataTable");
  if (tabelaElement.length === 0) {
    console.error("❌ Tabela #rastreamentoDataTable não encontrada");
    return;
  }

  // Verificar se todasNotas é um array válido
  if (!Array.isArray(todasNotas)) {
    console.error("❌ todasNotas não é um array válido:", todasNotas);
    return;
  }

  // Destruir instância anterior se existir
  if (window.dataTableInstance) {
    try {
      window.dataTableInstance.destroy();
    } catch (error) {
      console.warn("⚠️ Erro ao destruir DataTable anterior:", error);
    }
    window.dataTableInstance = null;
  }

  // Converter dados para formato DataTables
  const dadosDataTables =
    window.RastreamentoDataTablesRenderer.converterDadosParaDataTables(
      todasNotas
    );

  // Verificar se os dados estão no formato correto
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
        return;
      }
    }
  }

  try {
    // Inicializar DataTable com configuração avançada incluindo filtros por coluna
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
      order: [[6, "desc"]], // Ordenar por faturamento (decrescente)
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
      // Configurações para filtros avançados por coluna
      columnDefs: [
        {
          targets: [0, 6, 7, 8], // Colunas numéricas e de data
          type: "string", // Forçar tipo string para evitar problemas de ordenação
        },
      ],
      initComplete: function () {
        // Configurar eventos dos botões de detalhes após inicialização
        if (
          window.RastreamentoEvents &&
          window.RastreamentoEvents.configurarEventosDetalhes
        ) {
          window.RastreamentoEvents.configurarEventosDetalhes(todasNotas);
        }

        // Adicionar filtros avançados por coluna
        // Dentro do initComplete, 'this' é o elemento jQuery, então usamos $(this).DataTable()
        window.RastreamentoDataTablesRenderer.adicionarFiltrosAvancados(
          $(this).DataTable()
        );
      },
    });
  } catch (error) {
    console.error("❌ Erro ao inicializar DataTable:", error);
    console.error("❌ Dados recebidos:", dadosDataTables);
    console.error("❌ Elemento da tabela:", tabelaElement);
  }
};

/**
 * Renderiza mensagem quando não há notas
 * @returns {string} HTML da mensagem
 */
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

/**
 * Adiciona filtros avançados por coluna (similar ao site de demonstração do DataTables)
 * @param {DataTable} dataTableInstance - Instância do DataTable
 */
window.RastreamentoDataTablesRenderer.adicionarFiltrosAvancados = function (
  dataTableInstance
) {
  // Usar a instância passada como parâmetro ou a global
  const instance = dataTableInstance || window.dataTableInstance;

  if (!instance) {
    console.error("❌ ERRO: Nenhuma instância do DataTable encontrada!");
    return;
  }

  // Adicionar botões de filtro avançado em cada cabeçalho de coluna
  const tabela = instance.table().node();

  const cabecalhos = tabela.querySelectorAll("thead th");

  cabecalhos.forEach((cabecalho, index) => {
    // Pular a coluna de ações (última coluna)
    if (index === cabecalhos.length - 1) {
      return;
    }

    // Verificar se já existe o container dt-column-header
    let container = cabecalho.querySelector(".dt-column-header");

    if (!container) {
      // Criar container para os controles
      container = document.createElement("div");
      container.className = "dt-column-header";
      container.style.position = "relative";

      // Mover o conteúdo existente para dentro do container
      const conteudoExistente = cabecalho.innerHTML;
      container.innerHTML = conteudoExistente;

      // Substituir o conteúdo do cabeçalho
      cabecalho.innerHTML = "";
      cabecalho.appendChild(container);
    }

    // Verificar se já existem os botões para evitar duplicação
    const botoesExistentes = container.querySelector(".dtcc");

    if (botoesExistentes) {
      return;
    }

    // Encontrar o span com o título da coluna
    let spanTitulo = container.querySelector(".dt-column-title");

    if (!spanTitulo) {
      // Se não existe, criar um
      spanTitulo = document.createElement("span");
      spanTitulo.className = "dt-column-title";

      // Pegar o texto do cabeçalho (removendo elementos de ordenação existentes)
      const textoOriginal = cabecalho.textContent.trim();
      spanTitulo.textContent = textoOriginal;

      // Adicionar o título no início do container
      container.insertBefore(spanTitulo, container.firstChild);
    } else {
      // Se já existe, garantir que tenha o texto correto
      const textoOriginal = cabecalho.textContent.trim();
      if (!spanTitulo.textContent.trim()) {
        spanTitulo.textContent = textoOriginal;
      }
    }

    // Criar container para os botões
    const botoesContainer = document.createElement("span");
    botoesContainer.className = "dtcc";

    // Botão de filtro avançado (apenas ícone)
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

    // Adicionar evento ao botão de filtro
    botaoFiltro.addEventListener("click", function (e) {
      e.stopPropagation();
      window.RastreamentoDataTablesRenderer.mostrarFiltroAvancado(
        index,
        botaoFiltro,
        instance
      );
    });

    // Adicionar o botão ao container
    botoesContainer.appendChild(botaoFiltro);
    container.appendChild(botoesContainer);

    // Forçar alinhamento via JavaScript
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "flex-start";
    container.style.width = "100%";
    container.style.flexDirection = "row"; // Forçar direção da linha

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

  // Log final para verificar o estado dos cabeçalhos
  const cabecalhosFinais = tabela.querySelectorAll("thead th");
  cabecalhosFinais.forEach((cabecalho, index) => {
    const $cabecalho = $(cabecalho);
    const title = $cabecalho.find(".dt-column-title").text().trim();
    const hasOrder = $cabecalho.find(".dt-column-order").length > 0;
    const hasFilter = $cabecalho.find(".dt-column-filter").length > 0;
    const hasContainer = $cabecalho.find(".dt-column-header").length > 0;

    // Verificar estilos CSS computados
    const container = cabecalho.querySelector(".dt-column-header");
    const titleElement = cabecalho.querySelector(".dt-column-title");
    const dtccElement = cabecalho.querySelector(".dtcc");

    let containerStyles = {};
    let titleStyles = {};
    let dtccStyles = {};

    if (container) {
      const computedStyle = window.getComputedStyle(container);
      containerStyles = {
        display: computedStyle.display,
        justifyContent: computedStyle.justifyContent,
        alignItems: computedStyle.alignItems,
        flexDirection: computedStyle.flexDirection,
      };
    }

    if (titleElement) {
      const computedStyle = window.getComputedStyle(titleElement);
      titleStyles = {
        order: computedStyle.order,
        textAlign: computedStyle.textAlign,
        marginRight: computedStyle.marginRight,
        flex: computedStyle.flex,
      };
    }

    if (dtccElement) {
      const computedStyle = window.getComputedStyle(dtccElement);
      dtccStyles = {
        order: computedStyle.order,
        marginLeft: computedStyle.marginLeft,
        display: computedStyle.display,
      };
    }
  });
};

/**
 * Mostra o dropdown de filtro avançado para uma coluna específica
 * @param {number} indiceColuna - Índice da coluna
 * @param {HTMLElement} botao - Botão que acionou o filtro
 * @param {DataTable} dataTableInstance - Instância do DataTable
 */
window.RastreamentoDataTablesRenderer.mostrarFiltroAvancado = function (
  indiceColuna,
  botao,
  dataTableInstance
) {
  // Usar a instância passada como parâmetro ou a global
  const instance = dataTableInstance || window.dataTableInstance;
  // Remover dropdowns existentes
  document.querySelectorAll(".dtcc-dropdown").forEach((dropdown) => {
    dropdown.remove();
  });

  // Criar dropdown
  const dropdown = document.createElement("div");
  dropdown.className = "dtcc-dropdown";
  dropdown.setAttribute("role", "dialog");
  dropdown.setAttribute("aria-label", "More...");

  // Posicionar o dropdown usando CSS custom properties
  const rect = botao.getBoundingClientRect();
  dropdown.style.setProperty("--dropdown-top", rect.bottom + 5 + "px");
  dropdown.style.setProperty("--dropdown-left", rect.left + "px");

  // Conteúdo do dropdown
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

  // Adicionar eventos aos botões do dropdown
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

  // Aplicar filtro quando o usuário digitar
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

      // Aplicar filtro baseado no tipo
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

  // Fechar dropdown ao clicar fora
  document.addEventListener("click", function fecharDropdown(e) {
    if (!dropdown.contains(e.target) && !botao.contains(e.target)) {
      dropdown.remove();
      document.removeEventListener("click", fecharDropdown);
    }
  });

  // Adicionar dropdown ao DOM
  document.body.appendChild(dropdown);

  // Focar no input
  setTimeout(() => {
    inputFiltro.focus();
  }, 100);
};

/**
 * Atualiza os dados do DataTable
 * @param {Array} todasNotas - Array com todas as notas atualizadas
 */
window.RastreamentoDataTablesRenderer.atualizarDados = function (todasNotas) {
  if (window.dataTableInstance) {
    const dadosDataTables =
      window.RastreamentoDataTablesRenderer.converterDadosParaDataTables(
        todasNotas
      );
    window.dataTableInstance.clear();
    window.dataTableInstance.rows.add(dadosDataTables);
    window.dataTableInstance.draw();

    // Reconfigurar eventos dos botões de detalhes
    window.RastreamentoEvents.configurarEventosDetalhes(todasNotas);
  }
};
