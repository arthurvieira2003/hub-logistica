document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".tool-card");

  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;

    card.addEventListener("click", () => {
      const tool = card.dataset.tool;
      // Aqui você pode adicionar a lógica de redirecionamento para cada ferramenta
      console.log(`Redirecionando para a ferramenta: ${tool}`);
    });
  });
});
