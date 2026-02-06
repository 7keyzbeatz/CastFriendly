let brands = [];

fetch("data/brands.json")
    .then(r => r.json())
    .then(data => {
        brands = data.brands;
        populateLicenses();
        render();
    });

function populateLicenses() {
    const select = document.getElementById("licenseFilter");
    const licenses = new Set();

    brands.forEach(b => b.licenses.forEach(l => licenses.add(l)));
    licenses.forEach(l => {
        const opt = document.createElement("option");
        opt.value = l;
        opt.textContent = l;
        select.appendChild(opt);
    });
}

function render() {
    const grid = document.getElementById("brandsGrid");
    grid.innerHTML = "";

    const q = document.getElementById("searchInput").value.toLowerCase();
    const vpn = document.getElementById("vpnFilter").value;
    const lic = document.getElementById("licenseFilter").value;
    const lang = document.getElementById("languageFilter").value;

    brands
        .filter(b => {
            if (q && !b.name.toLowerCase().includes(q)) return false;
            if (vpn !== "all" && String(b.features.vpnFriendly) !== vpn) return false;
            if (lic !== "all" && !b.licenses.includes(lic)) return false;
            if (lang !== "all" && !b.features.languages.includes(lang)) return false;
            return true;
        })
        .forEach(b => {
            const card = document.createElement("div");
            card.className = "brand-card";

            card.innerHTML = `
                <div class="rank-badge">${b.rank}</div>

                <div class="brand-logo">
                    <img src="${b.media.logo || ''}">
                </div>

                <div class="brand-name">${b.name}</div>
                <div class="meta">${b.company.owner} • ${b.company.established}</div>

                <div class="stats">
                    <div><strong>${b.bonus.percentage}%</strong> Bonus</div>
                    <div><strong>€${b.bonus.maxAmount}</strong> Max</div>
                    <div><strong>${b.bonus.freeSpins ?? "—"}</strong> FS</div>
                    <div><strong>x${b.bonus.wager ?? "—"}</strong> Wager</div>
                </div>

                <div class="tags">
                    ${b.features.vpnFriendly ? `<div class="tag vpn">VPN</div>` : ""}
                    ${b.features.languages.includes("Greek") ? `<div class="tag lang">Greek</div>` : ""}
                </div>

                <a class="cta" href="${b.links.claimOffer}" target="_blank" rel="nofollow">
                    Claim Offer
                </a>
            `;
            grid.appendChild(card);
        });
}

["searchInput", "vpnFilter", "licenseFilter", "languageFilter"]
    .forEach(id => document.getElementById(id).addEventListener("input", render));