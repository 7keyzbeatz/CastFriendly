document.addEventListener('DOMContentLoaded', () => {

    fetch('data/giveaways.json')   // ⬅ σωστό path
        .then(r => r.json())
        .then(data => {

            const now = new Date();

            const active = data.giveaways.find(g =>
                g.status === 'active' &&
                g.endsAt &&
                new Date(g.endsAt) > now
            );

            const ended = data.giveaways.filter(g =>
                g.status === 'ended' ||
                (g.endsAt && new Date(g.endsAt) <= now)
            );

            if (active) {
                renderActive(active);
                showActiveSections();
            } else {
                hideActiveSections();
            }

            renderEnded(ended);
        });

});

/* ================= ACTIVE ================= */

function renderActive(g) {

    const section = document.getElementById('activeGiveaway');
    const inner = section.querySelector('.active-giveaway-inner');

    section.style.display = 'block';

    inner.innerHTML = `
        <div class="active-header">
            <span class="badge-live">LIVE</span>
            <div id="countdown" class="countdown"></div>
            <h2>${g.title}</h2>
        </div>

        ${renderPrizes(g.prizes)}
        ${renderEntries(g.entriesTable)}

        <button class="cta-btn"
            onclick="window.location.href='entry.html?giveaway=${g.id}'">
            Δήλωσε Συμμετοχή
        </button>
    `;

    startCountdown(g.endsAt);

    document.getElementById('rulesList').innerHTML =
        g.rules.map(r => `<li>${r}</li>`).join('');
}

/* CTA only if submission enabled */
function renderCTA(g) {

    if (g.submission && g.submission.enabled) {
        return `
            <button class="cta-btn" id="entryBtn">
                Δήλωσε Συμμετοχή
            </button>
        `;
    }

    return '';
}

document.addEventListener('click', (e) => {
    if (e.target.id === 'entryBtn') {
        const title = document.querySelector('.active-header h2');
        if (!title) return;

        const giveawayId = location.hash.replace('#', '') ||
            new URLSearchParams(window.location.search).get("giveaway");

        window.location.href = `entry.html?giveaway=${giveawayId || ''}`;
    }
});

/* ================= COUNTDOWN ================= */

function startCountdown(endDate) {

    const el = document.getElementById('countdown');

    function tick() {
        const diff = new Date(endDate) - Date.now();

        if (diff <= 0) {
            el.textContent = 'Ο διαγωνισμός έληξε';
            return;
        }

        const d = Math.floor(diff / 86400000);
        const h = Math.floor(diff / 3600000) % 24;
        const m = Math.floor(diff / 60000) % 60;
        const s = Math.floor(diff / 1000) % 60;

        el.textContent = `${d}d ${h}h ${m}m ${s}s`;
    }

    tick();
    setInterval(tick, 1000);
}

/* ================= RENDER HELPERS ================= */

function renderPrizes(prizes) {
    return `
        <div class="prizes">
            ${prizes.map(p => `
                <div class="prize-box">
                    ${p.amount}€
                    <span>${p.position}ος νικητής</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderEntries(entries) {
    return `
        <div class="entries-table">
            ${entries.map(e => `
                <div class="entry-box">
                    <strong>${e.deposit}€</strong>
                    <div>${e.entries} συμμετοχές</div>
                </div>
            `).join('')}
        </div>
    `;
}

/* ================= ENDED ================= */

function renderEnded(list) {
    document.getElementById('endedGrid').innerHTML =
        list.map(g => `
            <div class="giveaway-card">
                <h3>${g.title}</h3>
                <a href="giveaway-details.html?id=${g.id}" class="view-details-btn">
                    Δες Αποτελέσματα
                </a>
            </div>
        `).join('');
}

/* ================= VISIBILITY ================= */

function showActiveSections() {
    document.querySelector('.how-to-enter').style.display = 'block';
    document.querySelector('.rules-section').style.display = 'block';
}

function hideActiveSections() {
    document.getElementById('activeGiveaway')?.remove();
    document.querySelector('.how-to-enter')?.remove();
    document.querySelector('.rules-section')?.remove();
}

/* ================= MOBILE MENU ================= */

const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

menuToggle?.addEventListener('click', () => {
    mainNav.classList.toggle('open');
});

const revealElements = document.querySelectorAll(
    ".active-giveaway, .how-to-enter, .rules-section, .giveaway-card"
);

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, { threshold: .15 });

revealElements.forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(60px)";
    el.style.transition = "1s cubic-bezier(.16,1,.3,1)";
    observer.observe(el);
});

document.addEventListener("mousemove", e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    document.body.style.setProperty(
        "--bg-move",
        `translate3d(${x}px, ${y}px, 0) scale(1.15)`
    );
});