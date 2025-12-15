window.RastreamentoConfig = window.RastreamentoConfig || {};

window.RastreamentoConfig.transportadoras = [
  {
    id: 1,
    nome: "Ouro Negro",
    cor: "255, 204, 0",
    logo: "../assets/images/transportadoras/ouro-negro.svg",
    notas: [],
  },
  {
    id: 2,
    nome: "Expresso Leomar LTDA",
    cor: "0, 52, 150",
    logo: "../assets/images/transportadoras/leomar.png",
    notas: [],
  },
  {
    id: 3,
    nome: "Schreiber Logística LTDA",
    cor: "21, 50, 127",
    logo: "../assets/images/transportadoras/schreiber.svg",
    notas: [],
  },
  {
    id: 4,
    nome: "Mengue Express transportes LTDA",
    cor: "255, 101, 38",
    logo: "../assets/images/transportadoras/mengue.png",
    notas: [],
  },
  {
    id: 5,
    nome: "Transportes Expresso Santa Catarina LTDA",
    cor: "2, 118, 116",
    logo: "fas fa-truck",
    notas: [],
  },
  {
    id: 6,
    nome: "Expresso Princesa Dos Campos S/A",
    cor: "2, 118, 116",
    logo: "../assets/images/transportadoras/princesa.png",
    notas: [],
  },
  {
    id: 7,
    nome: "Transvapt Vupt transportes de cargas LTDA",
    cor: "2, 118, 116",
    logo: "../assets/images/transportadoras/transvapt.png",
    notas: [],
  },
  {
    id: 8,
    nome: "A+ Transportes e Logistica Eireli",
    cor: "2, 118, 116",
    logo: "../assets/images/transportadoras/a+.png",
    notas: [],
  },
];

window.RastreamentoConfig.coresTransportadoras = {
  "Ouro Negro": "rgba(255, 204, 0, 0.3)",
  "Expresso Leomar LTDA": "rgba(0, 52, 150, 0.3)",
  "Schreiber Logística LTDA": "rgba(21, 50, 127, 0.3)",
  "Mengue Express transportes LTDA": "rgba(255, 101, 38, 0.3)",
  "Transportes Expresso Santa Catarina LTDA": "rgba(2, 118, 116, 0.3)",
  "Expresso Princesa Dos Campos S/A": "rgba(14, 88, 46, 0.3)",
};

window.RastreamentoConfig.coresGenericas = {
  "Expresso Leomar LTDA": "52, 152, 219",
  "Schreiber Logística LTDA": "76, 175, 80",
  "Mengue Express transportes LTDA": "156, 39, 176",
  "Transportes Expresso Santa Catarina LTDA": "255, 87, 34",
};

window.RastreamentoConfig.dataRastreamento = new Date()
  .toISOString()
  .split("T")[0];

window.RastreamentoConfig.ultimaAtualizacao = null;

window.RastreamentoConfig.atualizarDataRastreamento = function (novaData) {
  window.RastreamentoConfig.dataRastreamento = novaData;
};

window.RastreamentoConfig.obterDataRastreamento = function () {
  return window.RastreamentoConfig.dataRastreamento;
};
