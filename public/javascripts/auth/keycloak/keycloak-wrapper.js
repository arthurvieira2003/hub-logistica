/**
 * Wrapper para o Keycloak JS adapter
 * Carrega o módulo ES6 e expõe globalmente
 */

(async function() {
  try {
    // Importar o módulo Keycloak
    const { default: Keycloak } = await import('./keycloak.js');
    
    // Expor globalmente
    window.Keycloak = Keycloak;
    
    // Disparar evento para indicar que está pronto
    window.dispatchEvent(new Event('keycloak-loaded'));
    
    console.log('Keycloak carregado com sucesso do módulo ES6');
  } catch (error) {
    console.error('Erro ao carregar Keycloak:', error);
    // Tentar carregar como script tradicional (fallback)
    const script = document.createElement('script');
    script.src = './keycloak.js';
    script.type = 'module';
    document.head.appendChild(script);
  }
})();

