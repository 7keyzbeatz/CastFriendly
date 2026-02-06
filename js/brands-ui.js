document.addEventListener("DOMContentLoaded", () => {

    fetch("data/casinos.json")
        .then(r => r.json())
        .then(data => renderBrands(data.casinos));

    function renderBrands(casinos) {
        const list = document.getElementById("brandsList");

        casinos.forEach((c, index) => {

            const rankLabel = index === 0
                ? "A"
                : index === 1
                    ? "B"
                    : `#${index + 1}`;

            const card = document.createElement("div");
            card.className = "brand-card";

            card.innerHTML = `
        <div class="rank">${rankLabel}</div>

        <div class="brand-logo">
          <img src="${c.brand?.logo || ''}" alt="${c.name}">
        </div>

        <div class="brand-info">
          <div><span>Owner</span><br><strong>${c.company.owner}</strong></div>
          <div><span>Established</span><br><strong>${c.company.established}</strong></div>
          <div><span>License</span><br><strong>${c.licenses.join(", ")}</strong></div>
          <div><span>Languages</span><br><strong>${c.features.languages.join(" / ")}</strong></div>
          <div><span>Live Chat</span><br><strong>${c.features.liveChat.join(" / ")}</strong></div>
          <div><span>VPN Friendly</span><br><strong>${c.features.vpnFriendly ? "Yes" : "No"}</strong></div>
        </div>

        <div class="brand-cta">
          <a href="${c.links?.affiliate || '#'}" target="_blank" rel="nofollow">
            Claim Offer
          </a>
          ${c.features.vpnFriendly ? `<div class="tag vpn">VPN Friendly</div>` : ``}
          ${c.bonus?.exclusive ? `<div class="tag exclusive">Exclusive</div>` : ``}
        </div>
      `;

            list.appendChild(card);
        });
    }
});