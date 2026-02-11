document.addEventListener('DOMContentLoaded', () => {
    const id = new URLSearchParams(location.search).get('id');

    fetch('../data/giveaways.json')
        .then(r => r.json())
        .then(data => {
            const g = data.giveaways.find(x => x.id === id);

            if (!g || !g.winners || g.winners.length === 0) {
                document.getElementById('title').innerText =
                    'Δεν υπάρχουν αποτελέσματα για αυτόν τον διαγωνισμό.';
                document.querySelector('.others-title').style.display = 'none';
                return;
            }

            document.getElementById('title').innerText = g.title;

            renderTopWinners(g.winners);
            renderOtherWinners(g.winners);
        });

    /* BACKGROUND PARALLAX */
    document.addEventListener('mousemove', e => {
        const x = (e.clientX / window.innerWidth - 0.5) * 18;
        const y = (e.clientY / window.innerHeight - 0.5) * 18;
        document.documentElement.style.setProperty(
            '--bg-move',
            `translate3d(${x}px,${y}px,0) scale(1.15)`
        );
    });
});

function renderTopWinners(winners) {
    const top = winners.slice(0, 3);
    const classes = ['gold', 'silver', 'bronze'];
    const labels = ['1ο Βραβείο', '2ο Βραβείο', '3ο Βραβείο'];

    document.getElementById('topWinners').innerHTML = `
        <div class="top-winners">
            ${top.map((w, i) => `
                <div class="winner-card ${classes[i]}">
                    <div class="winner-rank">${labels[i]}</div>
                    <div class="winner-name">${w.winner}</div>
                    <div class="winner-amount">${w.amount ? w.amount + '€' : w.prize}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderOtherWinners(winners) {
    const rest = winners.slice(3);
    if (rest.length === 0) {
        document.querySelector('.others-title').style.display = 'none';
        return;
    }

    document.getElementById('otherWinners').innerHTML = `
        <div class="other-winners">
            ${rest.map(w => `
                <div class="other-winner">
                    <span class="ow-name">${w.winner}</span>
                    <span class="ow-amount">${w.amount ? w.amount + '€' : w.prize}</span>
                </div>
            `).join('')}
        </div>
    `;
}