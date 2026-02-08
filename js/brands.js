let brands = [];

const grid = document.getElementById("brandsGrid");
const searchInput = document.getElementById("searchInput");
const vpnFilter = document.getElementById("vpnFilter");
const languageFilter = document.getElementById("languageFilter");
const sortOrder = document.getElementById("sortOrder");
const resetBtn = document.getElementById("resetFilters");
const resultsCount = document.getElementById("resultsCount");
const noResults = document.getElementById("noResults");

function formatMoney(amount, unlimited) {
    if (unlimited) return "∞";
    return amount ? amount.toLocaleString('el-GR') + " €" : "N/A";
}

fetch("../data/brands.json")
    .then(res => res.json())
    .then(data => {
        brands = data.brands.map((brand, index) => ({ ...brand, originalOrder: index }));
        renderBrands();
    })
    .catch(err => console.error("Error loading JSON:", err));

function renderBrands() {
    if (!grid) return;
    grid.innerHTML = "";

    const filters = {
        q: searchInput.value.toLowerCase(),
        vpn: vpnFilter.value,
        lang: languageFilter.value,
        sort: sortOrder.value
    };

    let filtered = brands.filter(b => {
        if (filters.q && !b.name.toLowerCase().includes(filters.q)) return false;
        if (filters.vpn !== "all" && String(b.features.vpnFriendly) !== filters.vpn) return false;

        if (filters.lang !== "all") {
            const hasGr = b.features.languages.includes("Greek");
            const hasEn = b.features.languages.includes("English");
            if (filters.lang === "English" && (hasGr || !hasEn)) return false;
            if (filters.lang === "both" && !(hasGr && hasEn)) return false;
        }
        return true;
    });

    // Update Results Count & No Results Message
    if (resultsCount) {
        resultsCount.textContent = `Εμφανίζονται ${filtered.length} από ${brands.length} καζίνο`;
    }

    if (noResults) {
        if (filtered.length === 0) {
            noResults.classList.remove("hidden");
        } else {
            noResults.classList.add("hidden");
        }
    }

    // Sorting Logic
    filtered.sort((a, b) => {
        const s = filters.sort;
        switch (s) {
            case "alpha-asc": return a.name.localeCompare(b.name);
            case "alpha-desc": return b.name.localeCompare(a.name);
            case "date-desc": return (b.company.established || 0) - (a.company.established || 0);
            case "date-asc": return (a.company.established || 0) - (b.company.established || 0);
            case "bonus-desc": return (b.bonus.maxAmount || 0) - (a.bonus.maxAmount || 0);
            case "bonus-asc": return (a.bonus.maxAmount || 0) - (b.bonus.maxAmount || 0);
            case "spins-desc": return (b.bonus.freeSpins || 0) - (a.bonus.freeSpins || 0);
            case "spins-asc": return (a.bonus.freeSpins || 0) - (b.bonus.freeSpins || 0);
            case "wager-asc": return (a.bonus.wager || 999) - (b.bonus.wager || 999);
            case "wager-desc": return (b.bonus.wager || 0) - (a.bonus.wager || 0);
            default: return a.originalOrder - b.originalOrder;
        }
    });

    filtered.forEach(b => {
        const card = document.createElement("div");
        card.className = "brand-card";
        const langText = b.features.languages.includes("Greek") && b.features.languages.includes("English") ? "GREEK & ENGLISH" : "ENGLISH ONLY";

        card.innerHTML = `
            <div class="rank-badge">${b.rank}</div>
            <div class="card-badges">
                <span class="badge badge-lang">${langText}</span>
                <span class="badge ${b.features.vpnFriendly ? "badge-vpn-yes" : "badge-vpn-no"}">VPN</span>
            </div>
            <div class="brand-header-row">
                <div class="brand-logo">
                    <img src="${b.media.logo}" alt="${b.name}">
                    ${b.features.liveChat ? '<span class="online-dot"></span>' : ''}
                </div>
                <div class="brand-info">
                    <div class="brand-name">${b.name}</div>
                    <div class="brand-meta">Est. ${b.company.established} • <span class="license-text">${b.licenses.join(", ")}</span></div>
                </div>
            </div>
            <div class="bonus-box">
                <div class="bonus-main"><span>WELCOME BONUS</span><strong>${b.bonus.percentage}%</strong></div>
                <div class="bonus-sub">
                    <div><span>Max Bonus</span><strong>${b.bonus.maxAmount.toLocaleString('el-GR')} €</strong></div>
                    <div><span>Free Spins</span><strong>${b.bonus.freeSpins ?? "—"}</strong></div>
                    <div><span>Wager</span><strong>x${b.bonus.wager ?? "—"}</strong></div>
                </div>
            </div>
            <div class="withdrawals-box">
                <div class="withdrawals-title">Withdrawals</div>
                <div class="withdrawals-sub">
                    <div><span>Daily</span><strong>${formatMoney(b.withdrawals?.perDay?.amount, b.withdrawals?.unlimitedEur)}</strong></div>
                    <div><span>Weekly</span><strong>${formatMoney(b.withdrawals?.perWeek?.amount)}</strong></div>
                    <div><span>Monthly</span><strong>${formatMoney(b.withdrawals?.perMonth?.amount)}</strong></div>
                </div>
            </div>
            <div class="card-actions">
                <a class="btn ghost btn-info"
                   href="brand-details.html?id=${b.name.toLowerCase().replace(/\s+/g, '-')}" 
                   style="margin-right: 10px;">
                   More Info
                </a>
    
                <a class="btn ghost" href="${b.links.claimOffer}" target="_blank">
                   ΕΓΓΡΑΦΗ ΕΔΩ
                </a>
            </div>
        `;
        grid.appendChild(card);
    });
}

[searchInput, vpnFilter, languageFilter, sortOrder].forEach(el => {
    if (el) el.addEventListener("input", renderBrands);
});

resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    vpnFilter.value = "all";
    languageFilter.value = "all";
    sortOrder.value = "default";
    renderBrands();
});