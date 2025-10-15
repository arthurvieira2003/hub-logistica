/**
 * Configuração das transportadoras
 * Contém dados estáticos das transportadoras e suas configurações
 */

// Namespace para configurações de transportadoras
window.RastreamentoConfig = window.RastreamentoConfig || {};

window.RastreamentoConfig.transportadoras = [
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
  {
    id: 7,
    nome: "Transvapt Vupt transportes de cargas LTDA",
    cor: "2, 118, 116", // RGB para transportadora sem logo
    logo: "../assets/images/transportadoras/transvapt.png",
    notas: [], // Será preenchido com dados reais da API
  },
  {
    id: 8,
    nome: "A+ Transportes e Logistica Eireli",
    cor: "2, 118, 116", // RGB para transportadora sem logo
    logo: "../assets/images/transportadoras/a+.png",
    notas: [], // Será preenchido com dados reais da API
  },
];

/**
 * Configuração de cores das bordas das transportadoras
 */
window.RastreamentoConfig.coresTransportadoras = {
  "Ouro Negro": "rgba(255, 204, 0, 0.3)",
  "Expresso Leomar LTDA": "rgba(0, 52, 150, 0.3)",
  "Schreiber Logística LTDA": "rgba(21, 50, 127, 0.3)",
  "Mengue Express transportes LTDA": "rgba(255, 101, 38, 0.3)",
  "Transportes Expresso Santa Catarina LTDA": "rgba(2, 118, 116, 0.3)",
  "Expresso Princesa Dos Campos S/A": "rgba(14, 88, 46, 0.3)",
};

/**
 * Configuração de cores específicas para transportadoras genéricas
 */
window.RastreamentoConfig.coresGenericas = {
  "Expresso Leomar LTDA": "52, 152, 219", // Azul
  "Schreiber Logística LTDA": "76, 175, 80", // Verde
  "Mengue Express transportes LTDA": "156, 39, 176", // Roxo
  "Transportes Expresso Santa Catarina LTDA": "255, 87, 34", // Laranja
};

/**
 * Configuração de data de rastreamento
 */
window.RastreamentoConfig.dataRastreamento = new Date()
  .toISOString()
  .split("T")[0]; // YYYY-MM-DD

/**
 * Atualiza a data de rastreamento
 * @param {string} novaData - Nova data no formato YYYY-MM-DD
 */
window.RastreamentoConfig.atualizarDataRastreamento = function (novaData) {
  window.RastreamentoConfig.dataRastreamento = novaData;
};

/**
 * Obtém a data atual de rastreamento
 * @returns {string} Data atual no formato YYYY-MM-DD
 */
window.RastreamentoConfig.obterDataRastreamento = function () {
  return window.RastreamentoConfig.dataRastreamento;
};
