window.Administration = window.Administration || {};

window.Administration.state = {
  users: [],
  sessions: [],
  estados: [],
  cidades: [],
  transportadoras: [],
  faixasPeso: [],
  rotas: [],
  precosFaixas: [],
  filteredData: {},
  currentTab: "users",
  editingUserId: null,
  editingEntity: null,
  editingEntityType: null,
  pagination: {},
  currentSearch: null,
  currentSearchCidades: null,
  currentSearchFaixasPeso: null,
  currentSearchEstados: null,
  currentSearchTransportadoras: null,
  // Controle de requisições para evitar race conditions
  requestControllers: {},
  requestSequence: {},
};
