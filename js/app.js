let casinos = [];

fetch("data/brands.json")
    .then(r => r.json())
    .then(data => {
        casinos = data.casinos;
        renderBrands();
        renderCasinos();
    });

function renderBrands() {
    const grid = document.getElementById("brandGrid");
    casinos.forEach(c => {
        const el = document.createElement("div");
        el.className = "brand";
        el.style.borderColor = c.brand.color;
        el.innerHTML = `<img src="${c.brand.logo}" alt="${c.name}">`;
        grid.appendChild(el);
    });
}

function renderCasinos() {
    const list = document.getElementById("casinoList");
    list.innerHTML = "";

    const vpn = document.getElementById("vpnFilter").value;
    const lic = document.getElementById("licenseFilter").value;

    casinos.filter(c => {
        if (vpn !== "all" && String(c.features.vpnFriendly) !== vpn) return false;
        if (lic !== "all" && !c.licenses.includes(lic)) return false;
        return true;
    }).forEach(c => {
        const card = document.createElement("div");
        card.className = "casino-card";
        card.style.borderLeftColor = c.brand.color;

        card.innerHTML = `
      <h3>${c.name}</h3>
      <p><b>${c.bonus.percentage}%</b> up to €${c.bonus.maxAmount}</p>
      <p>🎰 ${c.bonus.freeSpins ?? "No"} FS • x${c.bonus.wager}</p>
      <p>License: ${c.licenses.join(", ")} • VPN: ${c.features.vpnFriendly ? "Yes" : "No"}</p>
      <a href="${c.links.affiliate}" target="_blank" rel="nofollow">Claim Offer</a>
    `;

        list.appendChild(card);
    });
}

document.querySelectorAll("select")
    .forEach(s => s.addEventListener("change", renderCasinos));