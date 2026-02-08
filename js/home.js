document.querySelectorAll(".liquid-card").forEach(card => {
    const level = card.dataset.level;
    const liquid = card.querySelector(".liquid");
    liquid.style.setProperty("--fill", level + "%");
});