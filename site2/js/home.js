// 1. LIQUID CARDS LOGIC
document.querySelectorAll(".liquid-card").forEach(card => {
    const level = card.dataset.level;
    const liquid = card.querySelector(".liquid");
    if (liquid) liquid.style.setProperty("--fill", level + "%");
});

// 2. MUSIC LOGIC (Safe version)
document.addEventListener('DOMContentLoaded', function() {
    const music = document.getElementById('bgMusic');
    const btn = document.getElementById('musicToggle');
    const icon = document.getElementById('musicIcon');

    if (music && btn) { // Ελέγχουμε αν υπάρχουν για να μην κρασάρει
        music.volume = 0.3;
        btn.addEventListener('click', function() {
            if (music.paused) {
                music.play();
                if (icon) icon.innerText = '⏸️';
                btn.classList.add('playing');
            } else {
                music.pause();
                if (icon) icon.innerText = '🎵';
                btn.classList.remove('playing');
            }
        });
    }
});

// 3. MENU TOGGLE
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('open');
    });
}

// 4. LIVE DETECTION
const YOUTUBE_CHANNEL_ID = "@7heGodFamilia";
const liveSection = document.getElementById("liveSection");
const liveEmbed = document.getElementById("liveEmbed");

if (liveSection && liveEmbed) {
    liveEmbed.src = `https://www.youtube.com/embed/live_stream?channel=${YOUTUBE_CHANNEL_ID}&autoplay=1&mute=1`;
    liveSection.style.display = "flex";
}

// 5. SLOT MACHINE LOGIC
// --- CONFIGURATION ---
// --- CONFIGURATION ---
const symbolImages = [
    'img/logo-home-page-1024x912.png',
    'img/slot1.png', 'img/slot2.png', 'img/slot3.png',
    'img/slot4.png', 'img/slot5.png', 'img/slot6.png', 'img/slot7.png'
];

const winSoundsList = ['sounds/eee ante geia.mp3', 'sounds/espase.mp3', 'sounds/taaack.mp3'];
const lossSoundsList = ['sounds/visisson.mp3', 'sounds/lose_alternative.mp3'];
const spinSoundsList = ['sounds/kick.wav'];

// --- ELEMENTS ---
const spinBtn = document.getElementById('spinBtn');
const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
const msgElement = document.getElementById('slotMsg');

const audioWin = new Audio();
const audioSpin = new Audio();
const audioLoss = new Audio();

// --- PITY STATE ---
let spinCounter = 0; // Μετράει τα σερί spins χωρίς νίκη

if (spinBtn) {
    spinBtn.addEventListener('click', () => {
        spinBtn.disabled = true;
        spinCounter++; // Αυξάνουμε το μετρητή σε κάθε πάτημα

        if (msgElement) msgElement.innerText = "Γυρνάει η τύχη...";

        // 1. Ήχος Spin
        audioSpin.src = spinSoundsList[0];
        audioSpin.currentTime = 0;
        audioSpin.play();

        // 2. Υπολογισμός αν θα έχουμε Guaranteed Win βάσει των ποσοστών σου
        const isForcedWin = shouldForceWin(spinCounter);
        const forcedSymbol = symbolImages[Math.floor(Math.random() * symbolImages.length)];

        reels.forEach((reel, index) => {
            const inner = reel.querySelector('.reel-inner');
            reel.classList.remove('win-flash');

            // Strip κίνησης
            let strip = '';
            for (let i = 0; i < 15; i++) {
                const img = symbolImages[Math.floor(Math.random() * symbolImages.length)];
                strip += `<img src="${img}" style="height:120px; object-fit:contain;">`;
            }
            inner.innerHTML = strip;
            inner.classList.remove('bounce-stop');
            inner.classList.add('spinning-fast');

            setTimeout(() => {
                inner.classList.remove('spinning-fast');

                // Επιλογή τελικού συμβόλου (τυχαίο ή κλειδωμένο win)
                const final = isForcedWin ? forcedSymbol : symbolImages[Math.floor(Math.random() * symbolImages.length)];

                inner.innerHTML = `<img src="${final}" style="height:120px; object-fit:contain;">`;
                inner.dataset.result = final;
                inner.classList.add('bounce-stop');

                if (index === reels.length - 1) {
                    audioSpin.pause();
                    checkWinner();
                }
            }, 1000 + (index * 600));
        });
    });
}

/**
 * Υλοποίηση των ποσοστών πιθανότητας για εγγυημένο win
 */
function shouldForceWin(counter) {
    const roll = Math.random() * 100; // Τυχαίος αριθμός από 0 έως 100

    if (counter === 5) return roll <= 30;       // 30% στα 5
    if (counter === 10) return roll <= 35;      // 25% στα 10
    if (counter === 7) return roll <= 305;      // 25% στα 15
    if (counter === 20) return roll <= 5;    // 17.5% στα 20
    if (counter >= 25) return true;             // 100% στα 25 (το υπόλοιπο)

    return false; // Σε όλα τα άλλα spins η τύχη είναι τυχαία
}

function checkWinner() {
    const res = reels.map(r => r.querySelector('.reel-inner').dataset.result);
    spinBtn.disabled = false;

    if (res[0] === res[1] && res[1] === res[2]) {
        msgElement.innerHTML = `<span style="color:#f5a524; font-weight:900;">🔥 ΣΕΒΟΥΛΑΑΑΑ!</span>`;

        spinCounter = 0; // Μηδενισμός του pity counter μετά από win

        audioWin.src = winSoundsList[Math.floor(Math.random() * winSoundsList.length)];
        audioWin.play();
        reels.forEach(r => r.classList.add('win-flash'));
    } else {
        msgElement.innerText = "Δεν πειράζει, η Φαμίλια δεν χάνει!";
        audioLoss.src = lossSoundsList[Math.floor(Math.random() * lossSoundsList.length)];
        audioLoss.play();
    }

}
