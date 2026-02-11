let brands = [];

const grid = document.getElementById("brandsGrid");
const searchInput = document.getElementById("searchInput");
const vpnFilter = document.getElementById("vpnFilter");
const languageFilter = document.getElementById("languageFilter");
const sortOrder = document.getElementById("sortOrder");
const resetBtn = document.getElementById("resetFilters");
const resultsCount = document.getElementById("resultsCount");
const noResults = document.getElementById("noResults");

/* ================= HELPERS ================= */

function safe(val, fallback = "—") {
    return val !== null && val !== undefined && val !== "" ? val : fallback;
}

function formatMoney(node) {
    if (!node || typeof node !== "object") return "N/A";

    const amount = node.amount;
    const currency = node.currency === "EUR" ? "€" : node.currency;

    if (amount === null || amount === undefined || amount === "") {
        return "N/A";
    }

    const num = Number(amount);
    if (Number.isNaN(num)) return "N/A";

    return `${num.toLocaleString("el-GR")} ${currency}`;
}

function formatBonusValue(val, suffix = "") {
    if (val === null || val === undefined || val === "") return "—";
    return `${val}${suffix}`;
}

/* ================= LOAD ================= */

fetch("../data/brands.json")
    .then(res => res.json())
    .then(data => {
        brands = (data.brands || []).map((brand, index) => ({
            ...brand,
            originalOrder: index
        }));
        renderBrands();
    })
    .catch(err => console.error("Error loading JSON:", err));

/* ================= RENDER ================= */

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
        if (filters.q && !b.name?.toLowerCase().includes(filters.q)) return false;

        if (filters.vpn !== "all" &&
            String(!!b.features?.vpnFriendly) !== filters.vpn) return false;

        if (filters.lang !== "all") {
            const langs = b.features?.languages || [];
            const hasGr = langs.includes("Greek");
            const hasEn = langs.includes("English");

            if (filters.lang === "English" && (!hasEn || hasGr)) return false;
            if (filters.lang === "both" && !(hasGr && hasEn)) return false;
        }

        return true;
    });

    /* ===== COUNT ===== */
    if (resultsCount) {
        resultsCount.textContent =
            `Εμφανίζονται ${filtered.length} από ${brands.length} καζίνο`;
    }

    if (noResults) {
        noResults.classList.toggle("hidden", filtered.length !== 0);
    }

    /* ===== SORT ===== */
    filtered.sort((a, b) => {
        const s = filters.sort;
        switch (s) {
            case "alpha-asc": return a.name.localeCompare(b.name);
            case "alpha-desc": return b.name.localeCompare(a.name);
            case "date-desc": return (b.company?.established || 0) - (a.company?.established || 0);
            case "date-asc": return (a.company?.established || 0) - (b.company?.established || 0);
            case "bonus-desc": return (b.bonus?.maxAmount || 0) - (a.bonus?.maxAmount || 0);
            case "bonus-asc": return (a.bonus?.maxAmount || 0) - (b.bonus?.maxAmount || 0);
            case "spins-desc": return (b.bonus?.freeSpins || 0) - (a.bonus?.freeSpins || 0);
            case "spins-asc": return (a.bonus?.freeSpins || 0) - (b.bonus?.freeSpins || 0);
            case "wager-asc": return (a.bonus?.wager || 999) - (b.bonus?.wager || 999);
            case "wager-desc": return (b.bonus?.wager || 0) - (a.bonus?.wager || 0);
            default: return a.originalOrder - b.originalOrder;
        }
    });

    /* ===== CARDS ===== */
    filtered.forEach(b => {
        const langs = b.features?.languages || [];
        const langText =
            langs.includes("Greek") && langs.includes("English")
                ? "GREEK & ENGLISH"
                : "ENGLISH ONLY";

        const currency =
            b.withdrawals?.perDay?.currency ||
            b.withdrawals?.perWeek?.currency ||
            b.withdrawals?.perMonth?.currency ||
            "EUR";

        const card = document.createElement("div");
        card.className = "brand-card";

        card.innerHTML = `
            <div class="rank-badge">${safe(b.id)}</div>

            <div class="card-badges">
                <span class="badge badge-lang">${langText}</span>
                <span class="badge ${b.features?.vpnFriendly ? "badge-vpn-yes" : "badge-vpn-no"}">VPN</span>
            </div>

            <div class="brand-header-row">
                <div class="brand-logo">
                    <img src="${b.media?.logo || '/img/placeholder.png'}" alt="${b.name}">
                </div>
                <div class="brand-info">
                    <div class="brand-name">${b.name}</div>
                    <div class="brand-meta">
                        Est. ${safe(b.company?.established)} •
                        <span class="license-text">${safe(b.company?.owner)}</span>
                    </div>
                </div>
            </div>

            <div class="bonus-box">
                <div class="bonus-main">
                    <span>WELCOME BONUS</span>
                    <strong>${formatBonusValue(b.bonus?.percentage, "%")}</strong>
                </div>
                <div class="bonus-sub">
                    <div><span>Max Bonus</span><strong>${formatBonusValue(b.bonus?.maxAmount, " €")}</strong></div>
                    <div><span>Free Spins</span><strong>${safe(b.bonus?.freeSpins)}</strong></div>
                    <div><span>Wager</span><strong>${formatBonusValue(b.bonus?.wager, "x")}</strong></div>
                </div>
            </div>

            <div class="withdrawals-box">
            <div class="withdrawals-title">Withdrawals</div>
            <div class="withdrawals-sub">
                <div>
                    <span>Daily</span>
                    <strong>${formatMoney(b.withdrawals?.perDay)}</strong>
                </div>
                <div>
                    <span>Weekly</span>
                    <strong>${formatMoney(b.withdrawals?.perWeek)}</strong>
                </div>
                <div>
                    <span>Monthly</span>
                    <strong>${formatMoney(b.withdrawals?.perMonth)}</strong>
                </div>
            </div>
            </div>
            <div class="card-actions">
                <a class="btn ghost btn-info"
                   href="brand-details.html?id=${encodeURIComponent(b.id)}">
                   More Info
                </a>
                <a class="btn ghost"
                   href="${b.links?.claimOffer}"
                   target="_blank" rel="noopener">
                   ΕΓΓΡΑΦΗ ΕΔΩ
                </a>
            </div>
        `;

        grid.appendChild(card);
    });
}

/* ================= EVENTS ================= */

[searchInput, vpnFilter, languageFilter, sortOrder].forEach(el => {
    if (el) el.addEventListener("input", renderBrands);
});

resetBtn?.addEventListener("click", () => {
    searchInput.value = "";
    vpnFilter.value = "all";
    languageFilter.value = "all";
    sortOrder.value = "default";
    renderBrands();
});