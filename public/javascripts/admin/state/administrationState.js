window.Administration = window.Administration || {};

window.Administration.state = {
  users: [],
  sessions: [],
  estados: [],
  cidades: [],
  faixasPeso: [],
  rotas: [],
  precosFaixas: [],
  transportadorasExcluidas: [],
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
  currentSearchTransportadorasExcluidas: null,
  // Controle de requisições para evitar race conditions
  requestControllers: {},
  requestSequence: {},
};
