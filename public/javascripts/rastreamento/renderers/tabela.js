/**
 * Renderizador de Tabela
 * Contém funções para renderizar a tabela de rastreamento
 */

// Namespace para renderizadores
window.RastreamentoRenderers = window.RastreamentoRenderers || {};

/**
 * Renderiza o cabeçalho da tabela com estatísticas
 * @param {Array} todasNotas - Array com todas as notas
 * @returns {string} HTML do cabeçalho
 */
window.RastreamentoRenderers.renderizarCabecalhoTabela = function (todasNotas) {
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
 * Renderiza uma linha da tabela
 * @param {Object} nota - Objeto da nota
 * @param {number} index - Índice da linha
 * @returns {string} HTML da linha
 */
window.RastreamentoRenderers.renderizarLinhaTabela = function (nota, index) {
  let borderColor = window.RastreamentoUtils.obterCorBordaTransportadora(
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
          ${window.RastreamentoUtils.renderizarLogoTransportadora(
            nota.transportadora
          )}
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
      <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee;">
        ${nota.origem}
      </td>
      <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee;">
        ${nota.destino}
      </td>
      <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; font-family: 'Courier New', monospace; font-weight: 600; color: #555;">${window.RastreamentoUtils.formatarData(
        nota.docDate
      )}</td>
      <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; font-family: 'Courier New', monospace; font-weight: 600; color: #555;">${window.RastreamentoUtils.formatarData(
        nota.dataEnvio
      )}</td>
      <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; font-family: 'Courier New', monospace; font-weight: 600; color: ${
        nota.atrasada ? "#dc3545" : "#555"
      };">${
    nota.status === "Aguardando coleta"
      ? "-"
      : window.RastreamentoUtils.formatarData(nota.previsaoEntrega)
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
};

/**
 * Renderiza a tabela completa
 * @param {Array} todasNotas - Array com todas as notas
 * @returns {string} HTML da tabela
 */
window.RastreamentoRenderers.renderizarTabela = function (todasNotas) {
  const cabecalho =
    window.RastreamentoRenderers.renderizarCabecalhoTabela(todasNotas);
  const linhas = todasNotas
    .map((nota, index) =>
      window.RastreamentoRenderers.renderizarLinhaTabela(nota, index)
    )
    .join("");

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
      
      /* Estilos para garantir alinhamento correto da tabela */
      .tabela-container {
        width: 100%;
        overflow-x: auto;
        margin-bottom: 20px;
      }
    </style>
    
    ${cabecalho}
    
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
          ${linhas}
        </tbody>
      </table>
    </div>
  `;
};

/**
 * Renderiza mensagem quando não há notas
 * @returns {string} HTML da mensagem
 */
window.RastreamentoRenderers.renderizarMensagemVazia = function () {
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
