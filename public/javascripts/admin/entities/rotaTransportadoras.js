window.Administration = window.Administration || {};

// Função para converter array de dias em string formatada
function formatarDiasSemana(diasString) {
  if (!diasString) return "Não especificado";
  
  const dias = diasString.split(",").map(d => parseInt(d.trim()));
  const nomesDias = {
    1: "Dom",
    2: "Seg",
    3: "Ter",
    4: "Qua",
    5: "Qui",
    6: "Sex",
    7: "Sáb"
  };
  
  return dias.map(d => nomesDias[d] || d).join(", ");
}

// Função para converter string de dias em array de checkboxes
function preencherDiasSemana(diasString) {
  // Limpar todos os checkboxes primeiro
  document.querySelectorAll('input[type="checkbox"][id^="dia"]').forEach(cb => {
    cb.checked = false;
  });
  
  if (!diasString) return;
  
  const dias = diasString.split(",").map(d => parseInt(d.trim()));
  dias.forEach(dia => {
    const checkbox = document.querySelector(`input[type="checkbox"][value="${dia}"]`);
    if (checkbox) {
      checkbox.checked = true;
    }
  });
}

// Função para obter dias selecionados como string
function obterDiasSelecionados() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"][id^="dia"]:checked');
  if (checkboxes.length === 0) return null;
  
  const dias = Array.from(checkboxes)
    .map(cb => parseInt(cb.value))
    .sort((a, b) => a - b);
  
  return dias.join(",");
}

window.Administration.openRotaTransportadorasModal = async function (idRota) {
  const modal = document.getElementById("rotaTransportadorasModal");
  if (!modal) {
    window.Administration.showError("Modal de transportadoras da rota não encontrado");
    return;
  }

  // Buscar dados da rota
  let rota = window.Administration.state.rotas.find((r) => r.id_rota == idRota);
  
  if (!rota) {
    try {
      rota = await window.Administration.apiRequest(`/rotas/${idRota}`);
    } catch (error) {
      console.error("❌ Erro ao buscar rota:", error);
      window.Administration.showError("Erro ao carregar dados da rota");
      return;
    }
  }

  if (!rota) {
    window.Administration.showError("Rota não encontrada");
    return;
  }

  // Preencher informações da rota
  const origem = rota.Cidade || rota.CidadeOrigem;
  const destino = rota.CidadeDestino;
  const origemNome = origem
    ? `${origem.nome_cidade}${origem.Estado ? ` (${origem.Estado.uf})` : ""}`
    : "N/A";
  const destinoNome = destino
    ? `${destino.nome_cidade}${destino.Estado ? ` (${destino.Estado.uf})` : ""}`
    : "N/A";
  
  document.getElementById("rotaTransportadorasRotaNome").textContent = 
    `Rota: ${origemNome} → ${destinoNome}`;
  
  // Armazenar ID da rota para uso posterior
  window.Administration.state.currentRotaId = idRota;

  // Carregar transportadoras da rota
  await window.Administration.loadRotaTransportadoras(idRota);

  modal.classList.add("active");
};

window.Administration.loadRotaTransportadoras = async function (idRota) {
  const tbody = document.querySelector("#rotaTransportadorasTable tbody");
  if (!tbody) return;

  try {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="loading-data">
          <i class="fas fa-spinner fa-spin"></i> Carregando transportadoras...
        </td>
      </tr>
    `;

    const rotaTransportadoras = await window.Administration.apiRequest(
      `/rotaTransportadoras/rota/${idRota}`
    );

    if (!rotaTransportadoras || rotaTransportadoras.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="loading-data">
            Nenhuma transportadora cadastrada para esta rota
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = rotaTransportadoras
      .map((rt) => {
        const transportadora = rt.Transportadora || {};
        const nomeTransportadora = transportadora.CardName || transportadora.CardFName || "N/A";
        const prazo = rt.prazo_entrega ? `${rt.prazo_entrega} dias` : "Não especificado";
        const dias = formatarDiasSemana(rt.dias_semana);

        return `
          <tr>
            <td>${nomeTransportadora}</td>
            <td>${prazo}</td>
            <td>${dias}</td>
            <td>
              <span class="status-badge ${rt.ativa ? "active" : "inactive"}">
                ${rt.ativa ? "Ativa" : "Inativa"}
              </span>
            </td>
            <td>
              <button class="btn-icon edit-rota-transportadora" 
                      data-id="${rt.id_rota_transportadora}" 
                      title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon delete-rota-transportadora" 
                      data-id="${rt.id_rota_transportadora}" 
                      title="Remover">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `;
      })
      .join("");

    // Adicionar event listeners
    document
      .querySelectorAll(".edit-rota-transportadora")
      .forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const id = e.currentTarget.dataset.id;
          await window.Administration.openAddTransportadoraToRotaModal(
            window.Administration.state.currentRotaId,
            id
          );
        });
      });

    document
      .querySelectorAll(".delete-rota-transportadora")
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = e.currentTarget.dataset.id;
          window.Administration.deleteRotaTransportadora(id);
        });
      });
  } catch (error) {
    console.error("❌ Erro ao carregar transportadoras da rota:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="loading-data" style="color: red;">
          Erro ao carregar transportadoras
        </td>
      </tr>
    `;
    window.Administration.showError("Erro ao carregar transportadoras da rota");
  }
};

window.Administration.openAddTransportadoraToRotaModal = async function (
  idRota,
  idRotaTransportadora = null
) {
  const modal = document.getElementById("addTransportadoraToRotaModal");
  if (!modal) {
    window.Administration.showError("Modal não encontrado");
    return;
  }

  const transportadoraSelect = document.getElementById(
    "rotaTransportadoraTransportadora"
  );
  transportadoraSelect.innerHTML =
    '<option value="">Carregando transportadoras...</option>';

  // Buscar transportadoras do SAP B1 via carrier service
  let carriers = [];
  try {
    // Buscar via rota de transportadoras (que deve retornar dados do SAP B1)
    const response = await window.Administration.apiRequest(
      `/transportadoras?page=1&limit=1000`
    );
    carriers = response.data || [];
  } catch (error) {
    console.error("Erro ao buscar transportadoras:", error);
    transportadoraSelect.innerHTML =
      '<option value="">Erro ao carregar transportadoras</option>';
    window.Administration.showError("Erro ao carregar transportadoras");
    return;
  }

  // Buscar transportadoras já associadas à rota para filtrar
  let transportadorasAssociadas = [];
  try {
    const rotaTransportadoras = await window.Administration.apiRequest(
      `/rotaTransportadoras/rota/${idRota}`
    );
    transportadorasAssociadas = rotaTransportadoras.map(
      (rt) => rt.Transportadora?.CardCode || rt.card_code
    );
  } catch (error) {
    console.error("Erro ao buscar transportadoras associadas:", error);
  }

  // Preencher select com transportadoras disponíveis
  transportadoraSelect.innerHTML =
    '<option value="">Selecione uma transportadora</option>';
  
  carriers.forEach((carrier) => {
    const cardCode = carrier.CardCode || carrier.card_code;
    const nome = carrier.CardName || carrier.CardFName || carrier.nome_transportadora || "N/A";
    
    // Se estiver editando, mostrar a transportadora atual
    // Se estiver criando, não mostrar transportadoras já associadas
    if (
      idRotaTransportadora ||
      !transportadorasAssociadas.includes(cardCode)
    ) {
      const option = document.createElement("option");
      option.value = cardCode;
      option.textContent = nome;
      transportadoraSelect.appendChild(option);
    }
  });

  // Preencher dados se estiver editando
  if (idRotaTransportadora) {
    try {
      const rt = await window.Administration.apiRequest(
        `/rotaTransportadoras/${idRotaTransportadora}`
      );
      
      document.getElementById("rotaTransportadoraId").value = rt.id_rota_transportadora;
      document.getElementById("rotaTransportadoraRotaId").value = rt.id_rota;
      document.getElementById("rotaTransportadoraTransportadora").value = 
        rt.Transportadora?.CardCode || rt.card_code || "";
      document.getElementById("rotaTransportadoraPrazo").value = rt.prazo_entrega || "";
      
      preencherDiasSemana(rt.dias_semana);
      
      document.getElementById("addTransportadoraToRotaModalTitle").textContent =
        "Editar Transportadora da Rota";
    } catch (error) {
      console.error("❌ Erro ao buscar dados:", error);
      window.Administration.showError("Erro ao carregar dados");
      return;
    }
  } else {
    // Limpar formulário para novo registro
    document.getElementById("addTransportadoraToRotaForm").reset();
    document.getElementById("rotaTransportadoraId").value = "";
    document.getElementById("rotaTransportadoraRotaId").value = idRota;
    document.getElementById("addTransportadoraToRotaModalTitle").textContent =
      "Adicionar Transportadora à Rota";
  }

  modal.classList.add("active");
};

window.Administration.saveTransportadoraToRota = async function () {
  const form = document.getElementById("addTransportadoraToRotaForm");
  const id = document.getElementById("rotaTransportadoraId").value;
  const idRota = document.getElementById("rotaTransportadoraRotaId").value;
  const cardCode = document.getElementById("rotaTransportadoraTransportadora").value;
  const prazo = document.getElementById("rotaTransportadoraPrazo").value;
  const diasSemana = obterDiasSelecionados();

  if (!cardCode) {
    window.Administration.showError("Selecione uma transportadora");
    return;
  }

  const data = {
    id_rota: parseInt(idRota),
    card_code: cardCode,
    prazo_entrega: prazo ? parseInt(prazo) : null,
    dias_semana: diasSemana,
    ativa: true, // Sempre ativa ao criar/editar
  };

  try {
    if (id) {
      // Atualizar
      await window.Administration.apiRequest(`/rotaTransportadoras/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      window.Administration.showSuccess(
        "Transportadora da rota atualizada com sucesso"
      );
    } else {
      // Criar
      await window.Administration.apiRequest("/rotaTransportadoras", {
        method: "POST",
        body: JSON.stringify(data),
      });
      window.Administration.showSuccess(
        "Transportadora adicionada à rota com sucesso"
      );
    }

    document.getElementById("addTransportadoraToRotaModal").classList.remove("active");
    form.reset();

    // Recarregar lista de transportadoras da rota
    await window.Administration.loadRotaTransportadoras(idRota);
  } catch (error) {
    console.error("❌ Erro ao salvar:", error);
    const errorMessage =
      error.message || "Erro ao salvar transportadora da rota";
    window.Administration.showError(errorMessage);
  }
};

window.Administration.deleteRotaTransportadora = async function (id) {
  try {
    // Buscar dados para exibir no modal de confirmação
    const rt = await window.Administration.apiRequest(
      `/rotaTransportadoras/${id}`
    );

    const transportadora = rt.Transportadora || {};
    const rota = rt.Rota || {};
    const origem = rota.CidadeOrigem || {};
    const destino = rota.CidadeDestino || {};

    const rotaNome = `${origem.nome_cidade || "N/A"} → ${
      destino.nome_cidade || "N/A"
    }`;
    const transportadoraNome =
      transportadora.CardName || transportadora.CardFName || "N/A";

    const title = "Confirmar Remoção";
    const message = `Tem certeza que deseja remover a transportadora "${transportadoraNome}" da rota "${rotaNome}"?`;

    window.Administration.openDeleteConfirmModal(
      title,
      message,
      {},
      async () => {
        try {
          // Inativar em vez de deletar (soft delete)
          await window.Administration.apiRequest(`/rotaTransportadoras/${id}`, {
            method: "PUT",
            body: JSON.stringify({ ativa: false }),
          });
          window.Administration.showSuccess(
            "Transportadora removida da rota com sucesso"
          );

          // Recarregar lista de transportadoras da rota
          const idRota = window.Administration.state.currentRotaId;
          if (idRota) {
            await window.Administration.loadRotaTransportadoras(idRota);
          }
        } catch (error) {
          console.error("❌ Erro ao remover:", error);
          window.Administration.showError("Erro ao remover transportadora da rota");
        }
      }
    );
  } catch (error) {
    console.error("❌ Erro ao buscar informações:", error);
    window.Administration.showError("Erro ao buscar informações");
  }
};

// Nota: Os event listeners dos modais foram movidos para administrationEvents.js
// para seguir o padrão do sistema e garantir que sejam inicializados corretamente

