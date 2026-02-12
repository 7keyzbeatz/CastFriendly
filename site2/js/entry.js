document.addEventListener('DOMContentLoaded', () => {

    console.log("ENTRY PAGE LOADED");

    const params = new URLSearchParams(window.location.search);
    const giveawayId = params.get('giveaway');

    console.log("Giveaway ID:", giveawayId);

    if (!giveawayId) {
        alert("Δεν βρέθηκε giveaway id.");
        return;
    }

    document.getElementById('giveawayId').value = giveawayId;

    fetch('data/giveaways.json')   // 🔥 ΣΩΣΤΟ PATH
        .then(r => {
            console.log("STATUS:", r.status);
            return r.json();
        })
        .then(data => {

            console.log("JSON LOADED:", data);

            const giveaway = data.giveaways.find(g => g.id === giveawayId);

            if (!giveaway) {
                alert("Giveaway not found.");
                return;
            }

            if (!giveaway.casinos || giveaway.casinos.length === 0) {
                console.warn("No casinos defined in JSON.");
                return;
            }

            const select = document.getElementById('casinoSelect');

            giveaway.casinos.forEach(casino => {
                const option = document.createElement('option');
                option.value = casino;
                option.textContent = casino;
                select.appendChild(option);
            });

        })
        .catch(e => console.error("FETCH ERROR:", e));

});