const detailContainer = document.getElementById('brandDetail');
const urlParams = new URLSearchParams(window.location.search);
const brandId = urlParams.get('id');

fetch("data/brands.json")
    .then(res => res.json())
    .then(data => {
        // Matching με το ID του JSON
        const brand = data.brands.find(b => b.id === brandId || b.name.toLowerCase().replace(/\s+/g, '-') === brandId);

        if (!brand) {
            detailContainer.innerHTML = "<h1 style='text-align:center; padding-top:50px;'>Brand not found</h1>";
            return;
        }

        renderDetails(brand);
    });

function renderDetails(brand) {
    document.title = `${brand.name} | Details`;

    const bgImg = brand.media?.background || '';

    detailContainer.innerHTML = `
        <div class="brand-hero-bg" style="background-image: url('${bgImg}');"></div>

        <div class="detail-header">
            <div class="detail-logo">
                <img src="${brand.media.logo}" alt="${brand.name}">
            </div>
            <div>
                <h1 style="margin:0;">${brand.name}</h1>
                <p style="color: #f5a524; font-weight: 700;">${brand.licenses.join(" • ")}</p>
                <small>Est. ${brand.company.established} by ${brand.company.owner}</small>
            </div>
        </div>

        <div class="review-content">
            <h2>📝 Περιγραφή</h2>
            <p>${brand.description || "Δεν υπάρχει διαθέσιμη περιγραφή για αυτό το καζίνο ακόμα."}</p>

            <h2 style="margin-top:30px;">🎁 Bonus Πληροφορίες</h2>
            <ul>
                <li><strong>Ποσοστό:</strong> ${brand.bonus.percentage}%</li>
                <li><strong>Μέγιστο Ποσό:</strong> ${brand.bonus.maxAmount.toLocaleString('el-GR')}€</li>
                <li><strong>Free Spins:</strong> ${brand.bonus.freeSpins}</li>
                <li><strong>Wager:</strong> x${brand.bonus.wager}</li>
            </ul>

            <h2 style="margin-top:30px;">💳 Όρια Αναλήψεων</h2>
            <div class="withdrawals-grid">
                <div class="info-card">
                    <span>Daily</span>
                    <strong>${brand.withdrawals.perDay ? brand.withdrawals.perDay.amount.toLocaleString('el-GR') + ' €' : 'N/A'}</strong>
                </div>
                <div class="info-card">
                    <span>Monthly</span>
                    <strong>${brand.withdrawals.perMonth ? brand.withdrawals.perMonth.amount.toLocaleString('el-GR') + ' €' : 'N/A'}</strong>
                </div>
            </div>

            <h2 style="margin-top:30px;">🛠 Χαρακτηριστικά</h2>
            <p><strong>VPN Friendly:</strong> ${brand.features.vpnFriendly ? "✅ Ναι" : "❌ Όχι"}</p>
            <p><strong>Γλώσσες:</strong> ${brand.features.languages.join(", ")}</p>
            <p><strong>Live Chat:</strong> ${brand.features.liveChat.join(", ")}</p>
        </div>

        <div class="cta-box">
            <a href="${brand.links.claimOffer}" target="_blank" class="big-btn">ΠΑΙΞΕ ΤΩΡΑ</a>
        </div>
    `;
}