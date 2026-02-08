let brands = [];

const grid = document.getElementById("brandsGrid");
const searchInput = document.getElementById("searchInput");
const vpnFilter = document.getElementById("vpnFilter");
const licenseFilter = document.getElementById("licenseFilter");
const languageFilter = document.getElementById("languageFilter");

fetch("data/brands.json")
    .then(res => res.json())
    .then(data => {
        brands = data.brands;
        populateLicenses();
        renderBrands();
    })
    .catch(err => {
        console.error("Failed to load brands.json", err);
    });

function populateLicenses() {
    const licenses = new Set();

    brands.forEach(b => {
        (b.licenses || []).forEach(l => licenses.add(l));
    });

    licenses.forEach(l => {
        const opt = document.createElement("option");
        opt.value = l;
        opt.textContent = l;
        licenseFilter.appendChild(opt);
    });
}

function renderBrands() {
    grid.innerHTML = "";

    const q = searchInput.value.toLowerCase();
    const vpn = vpnFilter.value;
    const lic = licenseFilter.value;
    const lang = languageFilter.value;

    brands
        .filter(b => {
            if (q && !b.name.toLowerCase().includes(q)) return false;

            if (vpn !== "all" && String(b.features.vpnFriendly) !== vpn)
                return false;

            if (lic !== "all" && !b.licenses.includes(lic))
                return false;

            if (
                lang !== "all" &&
                !b.features.languages.includes(lang)
            )
                return false;

            return true;
        })
        .forEach(b => {
            const card = document.createElement("div");
            card.className = "brand-card";

            card.innerHTML = `
  <div class="rank-badge">${b.rank}</div>

    <div class="card-badges">
    ${
                (() => {
                    const langs = b.features.languages || [];
                    if (langs.includes("Greek") && langs.includes("English"))
                        return `<span class="badge badge-lang">Greek / English</span>`;
                    if (langs.includes("Greek"))
                        return `<span class="badge badge-lang">Greek</span>`;
                    if (langs.includes("English"))
                        return `<span class="badge badge-lang">English</span>`;
                    return "";
                })()
                }

    <span class="badge ${b.features.vpnFriendly ? "badge-vpn-yes" : "badge-vpn-no"}">
      VPN
    </span>
  </div>

  <div class="brand-header-row">
  <div class="brand-logo">
    <img src="${b.media.logo}" alt="${b.name}">
  </div>

  <div class="brand-name">${b.name}</div>
  <div class="meta">${b.company.owner} • Est. ${b.company.established}</div>
</div>

  <div class="bonus-box">
    <div class="bonus-main">
      <span>WELCOME BONUS</span>
      <strong>${b.bonus.percentage}%</strong>
    </div>

    <div class="bonus-sub">
      <div><span>Max Bonus</span><strong>€${b.bonus.maxAmount}</strong></div>
      <div><span>Free Spins</span><strong>${b.bonus.freeSpins ?? "—"}</strong></div>
      <div><span>Wager</span><strong>x${b.bonus.wager ?? "—"}</strong></div>
    </div>
  </div>



  <div class="card-actions">
    ${b.summary ? `<button class="btn ghost" data-desc>Description</button>` : ""}
    <a class="btn ghost" href="brand.html?id=${b.id}">More Info</a>
  </div>

  ${b.summary ? `<div class="description hidden">${b.summary}</div>` : ""}
`;
            card.querySelectorAll("[data-desc]").forEach(btn => {
                btn.addEventListener("click", () => {
                    const desc = card.querySelector(".description");
                    desc.classList.toggle("hidden");
                    btn.textContent = desc.classList.contains("hidden")
                        ? "Description"
                        : "Hide";
                });
            });

            grid.appendChild(card);
        });
}

/* EVENTS */
[
    searchInput,
    vpnFilter,
    licenseFilter,
    languageFilter
].forEach(el => {
    el.addEventListener("input", renderBrands);
});