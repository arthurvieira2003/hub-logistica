// Administration State - Estado da aplicação
window.Administration = window.Administration || {};

// Estado da aplicação
window.Administration.state = {
  users: [],
  sessions: [],
  estados: [],
  cidades: [],
  transportadoras: [],
  faixasPeso: [],
  rotas: [],
  precosFaixas: [],
  // Dados filtrados para busca
  filteredData: {},
  currentTab: "users",
  editingUserId: null,
  editingEntity: null,
  editingEntityType: null,
  pagination: {},
};

