/**
 * Carregador do Keycloak JS via fetch
 * Carrega o código do adapter JS do Keycloak e executa
 */

window.KeycloakLoader = window.KeycloakLoader || {};

window.KeycloakLoader.loadFromServer = async function (keycloakUrl, realm) {
  const possibleUrls = [
    `${keycloakUrl}/js/keycloak.js`,
    `${keycloakUrl}/realms/${realm}/js/keycloak.js`,
    `${keycloakUrl}/realms/${realm}/protocol/openid-connect/js/keycloak.js`,
  ];

  for (const url of possibleUrls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const scriptContent = await response.text();
        // Executar o script
        const script = document.createElement("script");
        script.textContent = scriptContent;
        document.head.appendChild(script);
        
        // Aguardar o objeto Keycloak estar disponível
        let attempts = 0;
        while (!window.Keycloak && attempts < 50) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (window.Keycloak) {
          console.log(`Keycloak carregado com sucesso de: ${url}`);
          return window.Keycloak;
        }
      }
    } catch (error) {
      console.warn(`Falha ao carregar de ${url}:`, error);
    }
  }
  
  throw new Error("Não foi possível carregar o Keycloak de nenhuma fonte");
};

