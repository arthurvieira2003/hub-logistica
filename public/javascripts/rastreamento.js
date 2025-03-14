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
  {
    id: 6,
    nome: "Ouro Negro",
    cor: "255, 204, 0", // RGB para amarelo e preto
    logo: "../assets/images/transportadoras/ouro-negro.svg", // Corrigido para usar o logo existente
    notas: [], // Será preenchido com dados reais da API
  },
];

// Função para formatar data no formato DD/MM/YYYY
function formatarData(dataString) {
  if (!dataString) return "-";

  // Se já estiver no formato DD/MM/YYYY, retornar como está
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataString)) {
    return dataString;
  }

  // Converter de YYYY-MM-DD para DD/MM/YYYY
  try {
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return dataString; // Se não for uma data válida, retorna o original

    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();

    return `${dia}/${mes}/${ano}`;
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return dataString;
  }
}

// Função para carregar dados reais de rastreamento da Ouro Negro
async function carregarDadosOuroNegro() {
  try {
    console.log("Iniciando carregamento de dados da Ouro Negro...");
    const response = await fetch("http://localhost:4010/ouroNegro/track");
    if (!response.ok) {
      throw new Error(`Erro ao carregar dados: ${response.status}`);
    }

    const data = await response.json();
    console.log("Dados recebidos da API:", data);

    // Encontrar a transportadora Ouro Negro no array
    const ouroNegroIndex = transportadoras.findIndex(
      (t) => t.nome === "Ouro Negro"
    );
    if (ouroNegroIndex === -1) {
      console.error("Transportadora Ouro Negro não encontrada no array!");
      return;
    }
    console.log("Índice da Ouro Negro no array:", ouroNegroIndex);

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
        console.log(
          "Erro ao formatar data/hora, usando valor original:",
          error
        );
        ultimaAtualizacao = item.docDate;
      }

      let ultimaCidade = item.bplName.split(" - ")[0]; // Extrair cidade da origem
      let ultimaUF = ""; // Será preenchido se houver rastreamento

      // Verificar se há informações de rastreamento
      if (Array.isArray(item.rastreamento)) {
        console.log(
          `Processando nota ${item.serial} com rastreamento:`,
          item.rastreamento
        );
        // Ordenar ocorrências por data e hora (mais recente primeiro)
        const ocorrencias = [...item.rastreamento].sort((a, b) => {
          const dataA = new Date(`${a.DATAOCORRENCIA} ${a.HORAOCORRENCIA}`);
          const dataB = new Date(`${b.DATAOCORRENCIA} ${b.HORAOCORRENCIA}`);
          return dataB - dataA;
        });

        // Pegar a ocorrência mais recente para determinar o status
        const ultimaOcorrencia = ocorrencias[0];
        console.log("Última ocorrência:", ultimaOcorrencia);

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
          case "108": // ENTREGA REALIZADA
            status = "Entregue";
            break;
          default:
            status = "Em trânsito";
        }
        console.log(`Status determinado para nota ${item.serial}: ${status}`);

        // Atualizar última atualização e localização
        try {
          ultimaAtualizacao = `${formatarData(
            ultimaOcorrencia.DATAOCORRENCIA
          )} ${ultimaOcorrencia.HORAOCORRENCIA}`;
        } catch (error) {
          console.log(
            "Erro ao formatar data, usando valores originais:",
            error
          );
          ultimaAtualizacao = `${ultimaOcorrencia.DATAOCORRENCIA} ${ultimaOcorrencia.HORAOCORRENCIA}`;
        }

        ultimaCidade = ultimaOcorrencia.CIDADE;
        ultimaUF = ultimaOcorrencia.UF;
      } else {
        console.log(`Nota ${item.serial} sem rastreamento:`, item.rastreamento);
      }

      // Criar objeto de nota
      const nota = {
        numero: item.serial.toString(),
        status: status,
        origem:
          item.bplName.split(" - ")[0] +
          ", " +
          (item.bplName.includes("SC") ? "SC" : ""),
        destino: ultimaCidade + (ultimaUF ? ", " + ultimaUF : ""),
        dataEnvio: item.docDate.split(" ")[0],
        previsaoEntrega: Array.isArray(item.rastreamento)
          ? item.rastreamento[0].PREVISAO
          : item.docDate.split(" ")[0],
        ultimaAtualizacao: ultimaAtualizacao,
        cliente: item.cardName,
        cte: Array.isArray(item.rastreamento) ? item.rastreamento[0].CTE : "",
        historico: Array.isArray(item.rastreamento) ? item.rastreamento : [],
      };
      console.log("Objeto de nota criado:", nota);

      // Adicionar a nota ao array de notas da transportadora
      transportadoras[ouroNegroIndex].notas.push(nota);
    });

    console.log(
      "Dados da Ouro Negro carregados com sucesso. Total de notas:",
      transportadoras[ouroNegroIndex].notas.length
    );
    console.log("Notas da Ouro Negro:", transportadoras[ouroNegroIndex].notas);

    // Verificar se o logo está correto
    console.log("Logo da Ouro Negro:", transportadoras[ouroNegroIndex].logo);

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
  const previsao = new Date(nota.previsaoEntrega);

  // Resetar as horas para comparar apenas as datas
  hoje.setHours(0, 0, 0, 0);
  previsao.setHours(0, 0, 0, 0);

  return hoje > previsao;
}

// Função para inicializar a interface de rastreamento
async function initRastreamento(contentElement) {
  console.log("Iniciando função initRastreamento...");

  // Carregar Font Awesome se não estiver disponível
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const fontAwesome = document.createElement("link");
    fontAwesome.rel = "stylesheet";
    fontAwesome.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css";
    document.head.appendChild(fontAwesome);
    console.log("Font Awesome carregado dinamicamente");
  }

  console.log(
    "Estado inicial das transportadoras:",
    JSON.parse(JSON.stringify(transportadoras))
  );

  // Carregar dados reais da Ouro Negro antes de processar a interface
  try {
    console.log("Tentando carregar dados da Ouro Negro...");
    await carregarDadosOuroNegro();
    console.log(
      "Após carregamento, transportadoras:",
      JSON.parse(JSON.stringify(transportadoras))
    );
  } catch (error) {
    console.error("Erro ao carregar dados da Ouro Negro:", error);
  }

  // Processar as notas para identificar as atrasadas
  console.log("Processando notas para identificar atrasadas...");
  let totalNotasAtrasadas = 0;
  let todasNotas = [];

  transportadoras.forEach((transportadora) => {
    console.log(
      `Processando transportadora: ${transportadora.nome}, notas: ${transportadora.notas.length}`
    );
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

  console.log("Total de notas processadas:", todasNotas.length);
  console.log("Total de notas atrasadas:", totalNotasAtrasadas);

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
  console.log("Elementos de visualização:", { dashboardView, trackingView });

  if (dashboardView && trackingView) {
    // MODIFICAÇÃO: Garantir que a visualização de rastreamento esteja ativa
    console.log("Ativando a visualização de rastreamento...");
    dashboardView.classList.remove("active");
    trackingView.classList.add("active");

    // MODIFICAÇÃO: Garantir que o trackingView esteja visível e o dashboardView esteja oculto
    dashboardView.style.display = "none";
    trackingView.style.display = "block";
    trackingView.style.visibility = "visible";
    trackingView.style.opacity = "1";

    // Forçar a visibilidade do trackingView
    setTimeout(() => {
      console.log("Forçando a visibilidade do trackingView...");
      trackingView.style.display = "block !important";
      trackingView.setAttribute(
        "style",
        "display: block !important; visibility: visible !important; opacity: 1 !important;"
      );

      // Verificar se o trackingView está visível
      const trackingViewStyle = window.getComputedStyle(trackingView);
      console.log("trackingView display:", trackingViewStyle.display);
      console.log("trackingView visibility:", trackingViewStyle.visibility);
      console.log("trackingView opacity:", trackingViewStyle.opacity);
    }, 100);

    // NOVA ABORDAGEM: Criar uma tabela simples diretamente no trackingView
    console.log("Criando tabela simples diretamente no trackingView");

    // Obter as notas da Ouro Negro
    const ouroNegroIndex = transportadoras.findIndex(
      (t) => t.nome === "Ouro Negro"
    );
    if (ouroNegroIndex !== -1) {
      const notasOuroNegro = transportadoras[ouroNegroIndex].notas;
      console.log(`Encontradas ${notasOuroNegro.length} notas da Ouro Negro`);

      // Criar uma tabela simples
      const tabelaSimples = document.createElement("div");
      tabelaSimples.style.padding = "20px";
      tabelaSimples.style.backgroundColor = "#fff";
      tabelaSimples.style.borderRadius = "12px";
      tabelaSimples.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
      tabelaSimples.style.margin = "20px";
      tabelaSimples.style.width = "calc(100% - 40px)";
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
          
          /* Verificar se o Font Awesome está carregado, se não, usar ícones Unicode */
          .fa-info-circle:before { content: "ℹ️"; }
          .fa-map-marker-alt:before { content: "📍"; }
          .fa-exclamation-triangle:before { content: "⚠️"; }
          
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
            background: linear-gradient(135deg, #5cb85c, #449d44);
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
          
          .btn-detalhes:hover i {
            animation: rotate 1s ease-in-out;
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
        
        <div class="header-ouro-negro">
          <h2>Rastreamento Ouro Negro</h2>
          <div class="stats">
            <div class="stat-item">
              <div class="stat-value">${notasOuroNegro.length}</div>
              <div class="stat-label">Notas</div>
                          </div>
            <div class="stat-item">
              <div class="stat-value">${
                notasOuroNegro.filter(
                  (n) =>
                    n.status === "Em trânsito" ||
                    n.status === "Em rota de entrega"
                ).length
              }</div>
              <div class="stat-label">Em Trânsito</div>
                        </div>
            <div class="stat-item">
              <div class="stat-value">${
                notasOuroNegro.filter((n) => n.status === "Entregue").length
              }</div>
              <div class="stat-label">Entregues</div>
                        </div>
            <div class="stat-item">
              <div class="stat-value">${
                notasOuroNegro.filter((n) => n.atrasada).length
              }</div>
              <div class="stat-label">Atrasadas</div>
                      </div>
                      </div>
          </div>
          
        <div style="overflow-x: auto; width: 100%;" class="tabela-container">
          <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
              <thead>
              <tr style="background-color: #3a3a3a;">
                <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid #4a90e2;">Nota</th>
                <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid #4a90e2;">Transportadora</th>
                <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid #4a90e2;">Status</th>
                <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid #4a90e2;">Cliente</th>
                <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid #4a90e2;">Origem</th>
                <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid #4a90e2;">Destino</th>
                <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid #4a90e2;">Data Envio</th>
                <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid #4a90e2;">Previsão</th>
                <th style="padding: 15px; text-align: left; color: #ffffff; font-weight: bold; border-bottom: 2px solid #4a90e2;">Ações</th>
                </tr>
              </thead>
              <tbody>
              ${notasOuroNegro
                .map(
                  (nota, index) => `
                <tr style="background-color: ${
                  index % 2 === 0 ? "#f9f9f9" : "#fff"
                }; transition: all 0.3s ease; ${
                    nota.transportadora.nome === "Ouro Negro"
                      ? "border-left: 4px solid #ffc107;"
                      : ""
                  }">
                  <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd;"><strong>${
                    nota.numero
                  }</strong></td>
                  <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <img src="${nota.transportadora.logo}" alt="${
                    nota.transportadora.nome
                  }" style="height: 20px; width: auto;">
                      <span>${nota.transportadora.nome}</span>
                    </div>
                  </td>
                  <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd;">
                    <span style="display: inline-block; padding: 6px 12px; border-radius: 50px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: white; background: ${
                      nota.status === "Aguardando coleta"
                        ? "linear-gradient(135deg, #f0ad4e, #ec971f)"
                        : nota.status === "Em trânsito"
                        ? "linear-gradient(135deg, #5bc0de, #31b0d5)"
                        : nota.status === "Entregue"
                        ? "linear-gradient(135deg, #5cb85c, #449d44)"
                        : nota.status === "Em processamento"
                        ? "linear-gradient(135deg, #337ab7, #2e6da4)"
                        : nota.status === "Em rota de entrega"
                        ? "linear-gradient(135deg, #5bc0de, #2aabd2)"
                        : nota.atrasada
                        ? "linear-gradient(135deg, #d9534f, #c9302c)"
                        : "linear-gradient(135deg, #777, #555)"
                    };">
                      ${nota.status}
                      </span>
                    </td>
                  <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${
                    nota.cliente || "-"
                  }">${nota.cliente || "-"}</td>
                  <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd;">
                    ${nota.origem}
                  </td>
                  <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd;">${
                    nota.destino
                  }</td>
                  <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd; font-family: 'Courier New', monospace; font-weight: 600; color: #555;">${formatarData(
                    nota.dataEnvio
                  )}</td>
                  <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd; font-family: 'Courier New', monospace; font-weight: 600; color: ${
                    nota.atrasada ? "#d9534f" : "#555"
                  };">${formatarData(nota.previsaoEntrega)}</td>
                  <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd;">
                    <button class="btn-detalhes detalhes-btn" data-nota="${
                      nota.numero
                    }" style="background: linear-gradient(135deg, #3a3a3a, #555); color: white; border: none; border-radius: 50px; padding: 8px 16px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 5px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; gap: 6px;">
                      <i class="fas fa-info-circle"></i> Detalhes
                      </button>
                    </td>
                  </tr>
                `
                )
                .join("")}
              </tbody>
            </table>
        </div>
        
        <div id="detalhesModal" class="modal-ouro-negro">
          <div class="modal-content-ouro-negro">
            <div class="modal-header-ouro-negro">
              <h3 id="modalNotaNumero">Detalhes da Nota</h3>
              <button id="closeDetalhesModal" class="modal-close-ouro-negro">&times;</button>
            </div>
            <div class="modal-body-ouro-negro">
              <div id="detalhesContainer">
                <!-- Preenchido dinamicamente -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

      trackingView.appendChild(tabelaSimples);
      console.log("Tabela moderna criada e adicionada ao trackingView");

      // Adicionar eventos aos botões de detalhes
      setTimeout(() => {
        console.log("Adicionando eventos aos botões de detalhes");
        document.querySelectorAll(".detalhes-btn").forEach((button) => {
          button.addEventListener("click", function () {
            const notaNumero = this.getAttribute("data-nota");
            console.log("Botão de detalhes clicado para nota:", notaNumero);

            // Encontrar a nota
            const nota = notasOuroNegro.find((n) => n.numero === notaNumero);
            if (nota) {
              // Mostrar o modal
              const modal = document.getElementById("detalhesModal");
              const detalhesContainer =
                document.getElementById("detalhesContainer");
              const modalNotaNumero =
                document.getElementById("modalNotaNumero");

              if (modal && detalhesContainer && modalNotaNumero) {
                modalNotaNumero.textContent = `Detalhes da Nota ${notaNumero}`;

                // Criar conteúdo do modal
                let timelineHTML = "";

                if (nota.historico && nota.historico.length > 0) {
                  // Ordenar histórico por data e hora (mais antigo primeiro)
                  const historicoOrdenado = [...nota.historico].sort((a, b) => {
                    const dataA = new Date(
                      `${a.DATAOCORRENCIA} ${a.HORAOCORRENCIA}`
                    );
                    const dataB = new Date(
                      `${b.DATAOCORRENCIA} ${b.HORAOCORRENCIA}`
                    );
                    return dataA - dataB;
                  });

                  timelineHTML = `
                    <h4 style="margin-top: 30px; margin-bottom: 20px; color: #333; font-size: 20px; font-weight: 600; border-bottom: 2px solid #4a90e2; padding-bottom: 10px;">Histórico de Rastreamento</h4>
                    <div class="timeline-ouro-negro">
                      ${historicoOrdenado
                        .map(
                          (ocorrencia, index) => `
                        <div class="timeline-item-ouro-negro completed" style="--index: ${index}">
                          <div class="timeline-content-ouro-negro">
                            <h5>${ocorrencia.DESCOCORRENCIA}</h5>
                            <p>${formatarData(ocorrencia.DATAOCORRENCIA)} - ${
                            ocorrencia.HORAOCORRENCIA
                          }</p>
                            <div class="timeline-location-ouro-negro">
                              <i class="fas fa-map-marker-alt"></i>
                              <span>${ocorrencia.CIDADE}, ${
                            ocorrencia.UF
                          }</span>
                            </div>
                          </div>
                        </div>
                      `
                        )
                        .join("")}
                    </div>
                  `;
                } else {
                  timelineHTML = `
                    <div class="sem-dados-ouro-negro">
                      <p>Não há histórico de rastreamento disponível para esta nota.</p>
                    </div>
                  `;
                }

                detalhesContainer.innerHTML = `
                  <div class="info-grid-ouro-negro">
                    <div class="info-card-ouro-negro">
                      <h4>Informações da Nota</h4>
                      <div class="info-item-ouro-negro">
                        <div class="info-label-ouro-negro">Status:</div>
                        <div class="info-value-ouro-negro destaque">${
                          nota.status
                        }</div>
                      </div>
                      <div class="info-item-ouro-negro">
                        <div class="info-label-ouro-negro">Cliente:</div>
                        <div class="info-value-ouro-negro">${
                          nota.cliente || "-"
                        }</div>
                      </div>
                      <div class="info-item-ouro-negro">
                        <div class="info-label-ouro-negro">CT-e:</div>
                        <div class="info-value-ouro-negro">${
                          nota.cte || "-"
                        }</div>
                      </div>
                      <div class="info-item-ouro-negro">
                        <div class="info-label-ouro-negro">Transportadora:</div>
                        <div class="info-value-ouro-negro destaque">Ouro Negro</div>
                      </div>
                      <div class="info-item-ouro-negro">
                        <div class="info-label-ouro-negro">Status:</div>
                        <div class="info-value-ouro-negro destaque">${
                          nota.status
                        }</div>
                      </div>
                    </div>
                    <div class="info-card-ouro-negro">
                      <h4>Informações de Transporte</h4>
                      <div class="info-item-ouro-negro">
                        <div class="info-label-ouro-negro">Origem:</div>
                        <div class="info-value-ouro-negro">${nota.origem}</div>
                      </div>
                      <div class="info-item-ouro-negro">
                        <div class="info-label-ouro-negro">Destino:</div>
                        <div class="info-value-ouro-negro">${nota.destino}</div>
                      </div>
                      <div class="info-item-ouro-negro">
                        <div class="info-label-ouro-negro">Data de Envio:</div>
                        <div class="info-value-ouro-negro">${formatarData(
                          nota.dataEnvio
                        )}</div>
                      </div>
                      <div class="info-item-ouro-negro">
                        <div class="info-label-ouro-negro">Previsão:</div>
                        <div class="info-value-ouro-negro ${
                          nota.atrasada ? "atrasado" : ""
                        }">${formatarData(nota.previsaoEntrega)}</div>
                      </div>
                      <div class="info-item-ouro-negro">
                        <div class="info-label-ouro-negro">Última Atualização:</div>
                        <div class="info-value-ouro-negro">${
                          nota.ultimaAtualizacao
                        }</div>
                      </div>
                    </div>
                  </div>
                  ${timelineHTML}
                `;

                modal.style.display = "block";
                setTimeout(() => {
                  modal.classList.add("active");
                }, 10);

                // Adicionar evento para fechar o modal
                document
                  .getElementById("closeDetalhesModal")
                  .addEventListener("click", function () {
                    modal.classList.remove("active");
                    setTimeout(() => {
                      modal.style.display = "none";
                    }, 300);
                  });

                // Fechar o modal ao clicar fora dele
                window.addEventListener("click", function (event) {
                  if (event.target === modal) {
                    modal.classList.remove("active");
                    setTimeout(() => {
                      modal.style.display = "none";
                    }, 300);
                  }
                });
              }
            }
          });
        });
        console.log("Eventos adicionados aos botões de detalhes");
      }, 500);
    }

    // MODIFICAÇÃO: Adicionar um atraso antes de tentar preencher a tabela
    // para garantir que o DOM foi atualizado
    setTimeout(() => {
      // ... existing code ...
    }, 500);
  } else {
    console.log("Usando estrutura HTML antiga");
    // Código original para estrutura antiga...
    // ... existing code ...
  }

  // Inicializar os eventos após o HTML ser inserido
  console.log("Inicializando eventos...");
  setTimeout(() => {
    try {
      if (typeof initRastreamentoEvents === "function") {
        initRastreamentoEvents();
        console.log("Eventos inicializados com sucesso");
      } else {
        console.log(
          "Função initRastreamentoEvents não encontrada, pulando inicialização de eventos"
        );
      }

      if (typeof animateCards === "function") {
        animateCards();
        console.log("Cards animados com sucesso");
      } else {
        console.log(
          "Função animateCards não encontrada, pulando animação de cards"
        );
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
  let timelineHTML = "";

  // Se for Ouro Negro e tiver histórico, mostrar o histórico real
  if (
    transportadoraEncontrada.nome === "Ouro Negro" &&
    notaEncontrada.historico &&
    notaEncontrada.historico.length > 0
  ) {
    // Ordenar histórico por data e hora (mais antigo primeiro)
    const historicoOrdenado = [...notaEncontrada.historico].sort((a, b) => {
      const dataA = new Date(`${a.DATAOCORRENCIA} ${a.HORAOCORRENCIA}`);
      const dataB = new Date(`${b.DATAOCORRENCIA} ${b.HORAOCORRENCIA}`);
      return dataA - dataB;
    });

    timelineHTML = historicoOrdenado
      .map(
        (ocorrencia) => `
      <div class="timeline-item completed">
        <div class="timeline-icon">
          ${getIconeOcorrencia(ocorrencia.CODOCORRENCIA)}
          </div>
        <div class="timeline-content">
          <h5>${ocorrencia.DESCOCORRENCIA}</h5>
          <p>${formatarData(ocorrencia.DATAOCORRENCIA)} - ${
          ocorrencia.HORAOCORRENCIA
        }</p>
          <p class="timeline-location">${ocorrencia.CIDADE}, ${
          ocorrencia.UF
        }</p>
          </div>
          </div>
          `
      )
      .join("");
  } else {
    // Timeline padrão para outras transportadoras
    timelineHTML = `
          <div class="timeline-item ${
            notaEncontrada.status === "Aguardando coleta" ||
            notaEncontrada.status === "Em trânsito" ||
            notaEncontrada.status === "Entregue" ||
            notaEncontrada.status === "Em processamento" ||
            notaEncontrada.status === "Em rota de entrega"
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
            notaEncontrada.status === "Entregue" ||
            notaEncontrada.status === "Em processamento" ||
            notaEncontrada.status === "Em rota de entrega"
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
            notaEncontrada.status === "Entregue" ||
            notaEncontrada.status === "Em rota de entrega"
              ? "completed"
              : ""
          }">
            <div class="timeline-icon">
              <i class="fas fa-truck"></i>
            </div>
            <div class="timeline-content">
              <h5>Em trânsito</h5>
          <p>${formatarData(notaEncontrada.dataEnvio)} - 09:15</p>
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
    `;
  }

  // Informações adicionais para notas da Ouro Negro
  const infoAdicionalHTML =
    transportadoraEncontrada.nome === "Ouro Negro" && notaEncontrada.cte
      ? `
    <div class="detalhes-section">
      <h4>Informações Adicionais</h4>
      <div class="detalhes-grid">
        <div class="detalhes-item">
          <span class="detalhes-label">Cliente:</span>
          <span class="detalhes-value">${notaEncontrada.cliente || "-"}</span>
        </div>
        <div class="detalhes-item">
          <span class="detalhes-label">CT-e:</span>
          <span class="detalhes-value">${notaEncontrada.cte || "-"}</span>
        </div>
      </div>
    </div>
  `
      : "";

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
        </div>
      </div>
      
      ${infoAdicionalHTML}
      
      <div class="detalhes-section">
        <h4>Histórico de Rastreamento</h4>
        <div class="timeline">
          ${timelineHTML}
        </div>
      </div>
    </div>
  `;

  // Mostrar o modal
  detalhesModal.classList.add("active");
}

// Função para obter o ícone adequado para cada tipo de ocorrência
function getIconeOcorrencia(codOcorrencia) {
  switch (codOcorrencia) {
    case "101": // INICIO DO PROCESSO - EMISSAO DO CTE
      return '<i class="fas fa-file-invoice"></i>';
    case "000": // PROCESSO TRANSPORTE INICIADO
      return '<i class="fas fa-truck-loading"></i>';
    case "104": // CHEGADA NO DEPOSITO DE TRANSBORDO
    case "105": // CHEGADA NO DEPOSITO DE DESTINO
      return '<i class="fas fa-warehouse"></i>';
    case "106": // EM TRANSITO PARA ENTREGA
      return '<i class="fas fa-truck"></i>';
    case "108": // ENTREGA REALIZADA
      return '<i class="fas fa-check-circle"></i>';
    default:
      return '<i class="fas fa-info-circle"></i>';
  }
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

// Função para inicializar os eventos da interface de rastreamento
function initRastreamentoEvents() {
  console.log("Inicializando eventos de rastreamento...");

  // Eventos para os botões de detalhes
  document.querySelectorAll(".detalhes-button").forEach((button) => {
    button.addEventListener("click", function () {
      const notaElement =
        this.closest(".tr-nota") || this.closest(".nota-card");
      if (notaElement) {
        const notaNumero = notaElement.dataset.numero;
        abrirDetalhesNota(notaNumero);
      }
    });
  });

  // Evento para fechar o modal de detalhes
  const closeDetalhesModal = document.getElementById("closeDetalhesModal");
  const detalhesModal = document.getElementById("detalhesModal");

  if (closeDetalhesModal && detalhesModal) {
    closeDetalhesModal.addEventListener("click", function () {
      detalhesModal.classList.remove("active");
    });

    // Fechar o modal ao clicar fora dele
    window.addEventListener("click", function (event) {
      if (event.target === detalhesModal) {
        detalhesModal.classList.remove("active");
      }
    });
  }

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

  console.log("Eventos de rastreamento inicializados com sucesso");
}

// Exportar as funções para uso global
window.initRastreamento = initRastreamento;
window.animateCards = animateCards;
window.initRastreamentoEvents = initRastreamentoEvents;
