document.querySelectorAll(".liquid-card").forEach(card => {
    const level = card.dataset.level;
    const liquid = card.querySelector(".liquid");
    liquid.style.setProperty("--fill", level + "%");
});

document.addEventListener('DOMContentLoaded', function() {
    const music = document.getElementById('bgMusic');
    const btn = document.getElementById('musicToggle');
    const icon = document.getElementById('musicIcon');

    // Ρύθμιση έντασης στο 30% για να μην "κουφαίνουμε" τον κόσμο
    music.volume = 0.3;

    btn.addEventListener('click', function() {
        if (music.paused) {
            music.play();
            icon.innerText = '⏸️'; // Αλλαγή σε pause icon
            btn.classList.add('playing');
        } else {
            music.pause();
            icon.innerText = '🎵'; // Επαναφορά σε νότα
            btn.classList.remove('playing');
        }
    });

});