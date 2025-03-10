// Verificação de autenticação imediata
(function () {
  // Verifica se existe um token
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  // Se não existir token, redireciona imediatamente para a página de login
  if (!token) {
    window.location.replace("/");
  }

  // Não fazemos a validação completa do token aqui para garantir o redirecionamento rápido
  // A validação completa (verificação de expiração) será feita após o carregamento da página
})();
