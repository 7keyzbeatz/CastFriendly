const detailContainer = document.getElementById('brandDetail');
const urlParams = new URLSearchParams(window.location.search);
const brandId = urlParams.get('id');

if (!detailContainer) {
    throw new Error('Missing #brandDetail container');
}

if (!brandId) {
    detailContainer.innerHTML = "<h1 style='text-align:center; padding-top:50px;'>Brand not found</h1>";
    throw new Error('Missing brand id');
}

fetch("data/brands.json")
    .then(res => res.json())
    .then(data => {
        const brand = data.brands.find(b =>
            String(b.id) === String(brandId) ||
            (b.name && b.name.toLowerCase().replace(/\s+/g, '-') === brandId)
        );

        if (!brand) {
            detailContainer.innerHTML =
                "<h1 style='text-align:center; padding-top:50px;'>Brand not found</h1>";
            return;
        }

        renderDetails(brand);
    })
    .catch(err => {
        console.error(err);
        detailContainer.innerHTML =
            "<h1 style='text-align:center; padding-top:50px;'>Error loading brand</h1>";
    });

function buildBonusLine(bonus) {
    const parts = [];

    if (bonus.percentage) {
        parts.push(
            bonus.percentageUpTo
                ? `Up to <strong>${bonus.percentage}% Bonus</strong>`
                : `<strong>${bonus.percentage}% Bonus</strong>`
        );
    }

    if (bonus.maxAmount) {
        parts.push(
            bonus.maxAmountUpTo
                ? `up to <strong>€${bonus.maxAmount.toLocaleString('el-GR')}</strong>`
                : `<strong>€${bonus.maxAmount.toLocaleString('el-GR')}</strong>`
        );
    }

    if (bonus.freeSpins) {
        parts.push(
            bonus.freeSpinsUpTo
                ? `up to <strong>${bonus.freeSpins} Free Spins</strong>`
                : `<strong>${bonus.freeSpins} Free Spins</strong>`
        );
    }

    return parts.join(' + ');
}

function renderExclusiveBonus(bonus) {
    const ex = bonus?.exclusive;
    if (!ex || (!ex.text && !ex.promoCode)) return '';

    return `
        <div class="exclusive-box">
            <span class="exclusive-badge">Exclusive</span>

            ${ex.text
            ? `<div class="exclusive-text">${ex.text}</div>`
            : ''}

            ${ex.promoCode
            ? `<div class="exclusive-code">
                       🎟 Code: <strong>${ex.promoCode}</strong>
                   </div>`
            : ''}
        </div>
    `;
}

function renderBonusBlock(bonus) {
    if (!bonus) return '';

    return `
        <div class="bonus-pro">

            <div class="bonus-header">
                <span class="bonus-title">Welcome Bonus</span>
            </div>

            <div class="bonus-values">

                ${bonus.percentage ? `
                <div class="bonus-percentage">
                    <span class="big">${bonus.percentage}%</span>
                    <span class="label">
                        ${bonus.percentageUpTo ? 'Up to Deposit Bonus' : 'Deposit Bonus'}
                    </span>
                </div>
                ` : ''}

                ${bonus.maxAmount ? `
                <div class="bonus-plus">+</div>
                <div class="bonus-amount">
                    <span class="big">€${bonus.maxAmount}</span>
                    <span class="label">
                        ${bonus.maxAmountUpTo ? 'Max Bonus' : 'Bonus Amount'}
                    </span>
                </div>
                ` : ''}

                ${bonus.freeSpins ? `
                <div class="bonus-plus">+</div>
                <div class="bonus-fs">
                    <span class="big">${bonus.freeSpins}</span>
                    <span class="label">
                        ${bonus.freeSpinsUpTo ? 'Up to Free Spins' : 'Free Spins'}
                    </span>
                </div>
                ` : ''}

            </div>

            <div class="bonus-conditions">
                ${bonus.wager ? `<span>Wager <strong>x${bonus.wager}</strong></span>` : ''}
                ${(bonus.percentageUpTo || bonus.maxAmountUpTo || bonus.freeSpinsUpTo)
            ? `<span>* Based on deposit amount</span>`
            : ''}
            </div>

        </div>
    `;
}

function renderDetails(brand) {
    document.title = `${brand.name} | Details`;

    const media = brand.media || {};
    const company = brand.company || {};
    const bonus = brand.bonus || {};
    const features = brand.features || {};
    const withdrawals = brand.withdrawals || {};

    // --- ΒΗΜΑ Α: ΔΙΑΧΕΙΡΙΣΗ BACKGROUND (ΕΞΩ ΑΠΟ ΤΟΝ CONTAINER) ---
    // Αφαιρούμε τυχόν παλιό bg αν ο χρήστης αλλάξει σελίδα χωρίς refresh
    const existingBg = document.querySelector('.brand-hero-bg');
    if (existingBg) existingBg.remove();

    if (media.background) {
        const bgDiv = document.createElement('div');
        bgDiv.className = 'brand-hero-bg';
        bgDiv.style.backgroundImage = `url('${media.background}')`;
        // Το βάζουμε πρώτο-πρώτο μέσα στο <body>
        document.body.prepend(bgDiv);
    }

    // --- ΒΗΜΑ Β: UI ΣΤΟΙΧΕΙΑ (ΜΕΣΑ ΣΤΟΝ CONTAINER) ---
    detailContainer.innerHTML = `
        <div class="detail-header">
            <div class="detail-logo">
                <img src="${media.logo || ''}" alt="${escapeHtml(brand.name)}">
            </div>
            <div>
                <h1 style="margin:0;">${escapeHtml(brand.name)}</h1>
                <p style="color:#f5a524; font-weight:700;">
                    ${(brand.licenses && brand.licenses.length)
            ? brand.licenses.join(" • ")
            : "—"}
                </p>
                <small>
                    Est. ${company.established || "—"}
                    ${company.owner ? " by " + escapeHtml(company.owner) : ""}
                </small>
            </div>
        </div>

        <div class="review-content">
            <h2>📝 Περιγραφή</h2>
            <p>
                ${brand.description
            ? nl2br(escapeHtml(brand.description))
            : "Δεν υπάρχει διαθέσιμη περιγραφή για αυτό το καζίνο ακόμα."}
            </p>

            <h2 style="margin-top:30px;">🎁 Bonus Πληροφορίες</h2>

            ${renderExclusiveBonus(bonus)}
            ${renderBonusBlock(bonus)}

            <h2 style="margin-top:30px;">💳 Όρια Αναλήψεων</h2>
            <div class="withdrawals-grid">
                <div class="info-card">
                    <span>Daily</span>
                    <strong>${withdrawals.perDay ? withdrawals.perDay.amount.toLocaleString('el-GR') + " " + withdrawals.perDay.currency : "N/A"}</strong>
                </div>
                <div class="info-card">
                    <span>Weekly</span>
                    <strong>${withdrawals.perWeek ? withdrawals.perWeek.amount.toLocaleString('el-GR') + " " + withdrawals.perWeek.currency : "N/A"}</strong>
                </div>
                <div class="info-card">
                    <span>Monthly</span>
                    <strong>${withdrawals.perMonth ? withdrawals.perMonth.amount.toLocaleString('el-GR') + " " + withdrawals.perMonth.currency : "N/A"}</strong>
                </div>
            </div>

            <h2 style="margin-top:30px;">🛠 Χαρακτηριστικά</h2>
            <p><strong>VPN Friendly:</strong> ${features.vpnFriendly ? "✅ Ναι" : "❌ Όχι"}</p>
            <p><strong>Γλώσσες:</strong> ${(features.languages || []).join(", ") || "—"}</p>
            <p><strong>Live Chat:</strong> ${(features.liveChat || []).join(", ") || "—"}</p>
        </div>

        <div class="cta-box">
            <a href="${brand.links?.claimOffer || "#"}" target="_blank" class="big-btn">ΠΑΙΞΕ ΤΩΡΑ</a>
        </div>
    `;
}

/* ================= HELPERS ================= */

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[m]);
}

function nl2br(str) {
    return str.replace(/\n/g, "<br>");
}