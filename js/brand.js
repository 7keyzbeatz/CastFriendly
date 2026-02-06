const params = new URLSearchParams(window.location.search);
const brandId = params.get("id");

const container = document.getElementById("brandDetails");

if (!brandId) {
    container.innerHTML = "<p>Brand not found.</p>";
} else {
    fetch("data/brands.json")
        .then(res => res.json())
        .then(data => {
            const brand = data.brands.find(b => b.id === brandId);
            if (!brand) {
                container.innerHTML = "<p>Brand not found.</p>";
                return;
            }
            renderBrand(brand);
        })
        .catch(() => {
            container.innerHTML = "<p>Error loading brand.</p>";
        });
}

function renderBrand(b) {
    container.innerHTML = `
    <div class="brand-header">
      <img class="brand-logo-lg" src="${b.media.logo || ""}" alt="${b.name}">
      <div>
        <h1>${b.name}</h1>
        <div class="brand-sub">
          Rank ${b.rank} • ${b.company.owner} • Est. ${b.company.established}
        </div>
      </div>
    </div>

    ${b.summary ? `<p class="brand-summary">${b.summary}</p>` : ""}

    <section class="brand-section">
      <h2>Welcome Bonus</h2>
      <ul class="list">
        <li>${b.bonus.percentage}% Bonus</li>
        <li>Max Bonus: €${b.bonus.maxAmount}</li>
        <li>Free Spins: ${b.bonus.freeSpins ?? "N/A"}</li>
        <li>Wager: x${b.bonus.wager ?? "N/A"}</li>
        ${b.bonus.code ? `<li>Code: <strong>${b.bonus.code}</strong></li>` : ""}
      </ul>
    </section>

    <section class="brand-section">
      <h2>General Info</h2>
      <ul class="list">
        <li><strong>Licenses:</strong> ${b.licenses.join(", ")}</li>
        <li><strong>Languages:</strong> ${b.features.languages.join(" / ")}</li>
        <li><strong>Live Chat:</strong> ${b.features.liveChat.join(" / ")}</li>
        <li><strong>VPN Friendly:</strong> ${b.features.vpnFriendly ? "Yes" : "No"}</li>
      </ul>
    </section>

    <section class="brand-section">
      <h2>Withdrawal Limits</h2>
      ${renderWithdrawals(b.withdrawals)}
    </section>

    <a class="cta primary"
       href="${b.links.claimOffer || "#"}"
       target="_blank"
       rel="nofollow">
       Claim Offer
    </a>
  `;
}

function renderWithdrawals(w) {
    if (!w) return "<p>No withdrawal info available.</p>";

    let html = "<ul class='list'>";
    if (w.unlimitedEur) html += "<li>No limit for EUR</li>";
    if (w.perDay) html += `<li>Per Day: €${w.perDay.amount}</li>`;
    if (w.perWeek) html += `<li>Per Week: €${w.perWeek.amount}</li>`;
    if (w.perMonth) html += `<li>Per Month: €${w.perMonth.amount}</li>`;
    html += "</ul>";
    return html;
}