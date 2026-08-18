const SUPABASE_URL = "https://khglefqussfkwmayfzqt.supabase.co";
const SUPABASE_KEY = "sb_publishable_vLxoVA_v7VvnbQpSPzWfIw_ZoaiXrFz";

let data = [];

const products = document.querySelector("#products");
const table = document.querySelector("#table");
const count = document.querySelector("#count");

function waLink(name) {
  const msg = encodeURIComponent(
    `Hi NGU, I'm interested in the ${name}. Please send me availability, price and gaming configuration details.`
  );
  return `https://wa.me/923700821811?text=${msg}`;
}

async function loadProducts() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`);
    }

    const rows = await response.json();

    data = rows
      .filter(x => x.active !== false)
      .map(x => ({
        name: x.name || "Unknown router",
        wifi: x.wifi || "",
        cls: x.wifi_class || "",
        bands: x.bands || "",
        best: x.best_for || "",
        image: x.image_url || "",
        note: x.description || "",
        price: x.price,
        priceOnRequest: x.price_on_request,
        stock: x.stock,
        specifications: x.specifications || {}
      }));

    render();

  } catch (error) {
    console.error("NGU Supabase error:", error);

    products.innerHTML = `
      <div class="empty">
        <strong>Unable to load router catalog.</strong>
        <p>Please try refreshing the page.</p>
      </div>
    `;

    count.textContent = "Catalog unavailable";
  }
}

function render(filter = "all") {
  const d =
    filter === "all"
      ? data
      : data.filter(x => x.wifi === filter);

  count.textContent = d.length + " systems";

  products.innerHTML = d.map(x => {

    let priceText = "Price on request";

    if (
      x.priceOnRequest === false &&
      x.price !== null &&
      x.price !== undefined
    ) {
      priceText = `PKR ${Number(x.price).toLocaleString()}`;
    }

    return `
      <article class="product">

        <div class="product-image">
          ${
            x.image
              ? `
                <img
                  src="${x.image}"
                  alt="${x.name}"
                  loading="lazy"
                  style="
                    width:100%;
                    height:100%;
                    object-fit:contain;
                    object-position:center;
                    display:block;
                  "
                  onerror="
                    this.style.display='none';
                    this.parentElement.classList.add('fallback');
                  "
                >
              `
              : ""
          }

          <div class="mini">NGU</div>
        </div>

        <div class="body">

          <span class="badge">NGU CATALOG</span>

          <h3>${x.name}</h3>

          <p>${x.note}</p>

          <div class="specs">
            ${x.wifi ? `<span>${x.wifi}</span>` : ""}
            ${x.cls ? `<span>${x.cls}</span>` : ""}
            ${x.bands ? `<span>${x.bands}</span>` : ""}
          </div>

          <div class="bottom">
            <strong>${priceText}</strong>

            <a
              href="${waLink(x.name)}"
              target="_blank"
              rel="noopener"
            >
              Ask about it →
            </a>
          </div>

        </div>

      </article>
    `;
  }).join("");

  table.innerHTML = d.map(x => `
    <tr>
      <td>${x.name}</td>
      <td>${x.wifi}</td>
      <td>${x.cls}</td>
      <td>${x.bands}</td>
      <td>${x.best}</td>
    </tr>
  `).join("");
}


/* Wi-Fi filters */

document.querySelectorAll(".filters button").forEach(button => {

  button.onclick = () => {

    document
      .querySelectorAll(".filters button")
      .forEach(x => x.classList.remove("active"));

    button.classList.add("active");

    render(button.dataset.f);
  };

});


/* Mobile menu */

const mobile = document.querySelector("#mobile");

if (document.querySelector("#open")) {
  document.querySelector("#open").onclick = () =>
    mobile.classList.add("open");
}

if (document.querySelector("#close")) {
  document.querySelector("#close").onclick = () =>
    mobile.classList.remove("open");
}

document
  .querySelectorAll(".mobile a")
  .forEach(a => {
    a.onclick = () =>
      mobile.classList.remove("open");
  });


/* NGU Router Finder */

      document.querySelector("#find").onclick = () => {
  const speed = +document.querySelector("#speed").value;
  const use = document.querySelector("#use").value;
  const budget = document.querySelector("#budget").value;

  let preferredNames = [];

  if (use === "gaming") {

    if (speed <= 20) {
      preferredNames = [
        "Linksys EA6350",
        "Linksys MR6350",
        "Linksys EA8100"
      ];

    } else if (speed <= 30) {
      preferredNames = [
        "Linksys EA8100",
        "Linksys MX2000",
        "ASUS RT-AX56U"
      ];

    } else if (speed <= 50) {
      preferredNames = [
        "Linksys MX5500",
        "Linksys WRT1900ACS",
        "ASUS RT-AX56U"
      ];

    } else if (speed <= 100) {
      preferredNames = [
        "Linksys WRT3200ACM",
        "Linksys WRT32X",
        "Linksys MX5300"
      ];

    } else if (speed <= 300) {
      preferredNames = [
        "ASUS RT-AX82U",
        "Linksys MX5300",
        "ASUS RT-AX88U"
      ];

    } else if (speed <= 500) {
      preferredNames = [
        "ASUS RT-AX88U",
        "ASUS ROG Rapture GT-AC5300",
        "NETGEAR R8500"
      ];

    } else if (speed <= 1000) {
      preferredNames = [
        "ASUS ROG Rapture GT-AX11000",
        "TP-Link EB810v",
        "ASUS RT-AX88U"
      ];

    } else {
      preferredNames = [
        "TP-Link EB810v",
        "ASUS ROG Rapture GT-AX11000",
        "ASUS RT-AX88U"
      ];
    }

  } else if (use === "pc") {

    if (speed <= 50) {
      preferredNames = [
        "Linksys EA8100",
        "Linksys WRT1900ACS",
        "ASUS RT-AX56U"
      ];

    } else if (speed <= 100) {
      preferredNames = [
        "Linksys WRT3200ACM",
        "Linksys WRT32X",
        "ASUS RT-AX82U"
      ];

    } else if (speed <= 300) {
      preferredNames = [
        "Linksys WRT3200ACM",
        "Linksys WRT32X",
        "ASUS RT-AX88U"
      ];

    } else if (speed <= 500) {
      preferredNames = [
        "ASUS RT-AX88U",
        "NETGEAR R8500",
        "ASUS ROG Rapture GT-AC5300"
      ];

    } else {
      preferredNames = [
        "TP-Link EB810v",
        "ASUS ROG Rapture GT-AX11000",
        "ASUS RT-AX88U"
      ];
    }

  } else {

    if (speed <= 50) {
      preferredNames = [
        "Linksys MR6350",
        "Linksys MX2000",
        "Linksys MR9000X"
      ];

    } else if (speed <= 100) {
      preferredNames = [
        "Linksys MX5500",
        "Linksys MX4200",
        "NETGEAR R8000P"
      ];

    } else if (speed <= 300) {
      preferredNames = [
        "Linksys MX4200",
        "Linksys MX5300",
        "NETGEAR R8000P"
      ];

    } else if (speed <= 500) {
      preferredNames = [
        "Linksys MX5300",
        "NETGEAR R8500",
        "ASUS RT-AX88U"
      ];

    } else {
      preferredNames = [
        "TP-Link EB810v",
        "ASUS ROG Rapture GT-AX11000",
        "ASUS RT-AX88U"
      ];
    }
  }

  if (budget === "low" && speed <= 30) {
    preferredNames = [
      "Linksys EA6350",
      "Linksys MR6350",
      "Linksys EA8100"
    ];
  }

  if (budget === "high") {
    preferredNames = [
      ...preferredNames,
      "ASUS ROG Rapture GT-AX11000",
      "TP-Link EB810v",
      "ASUS RT-AX88U"
    ];
  }

  preferredNames = [...new Set(preferredNames)];

  let item = null;

  for (const name of preferredNames) {
    item = data.find(
      x => x.name.toLowerCase() === name.toLowerCase()
    );

    if (item) break;
  }

  if (!item && data.length) {
    item = data[0];
  }

  const r = document.querySelector("#result");

  r.style.display = "block";

  if (!item) {
    r.innerHTML = `
      <span>NGU MATCH</span>
      <strong>No router found</strong>
      <p>
        The router catalog is still loading.
        Please try again.
      </p>
    `;
    return;
  }

  let speedLabel;

  if (speed <= 20) {
    speedLabel = "10-20 Mbps";
  } else if (speed <= 30) {
    speedLabel = "20-30 Mbps";
  } else if (speed <= 50) {
    speedLabel = "30-50 Mbps";
  } else if (speed <= 100) {
    speedLabel = "50-100 Mbps";
  } else if (speed <= 300) {
    speedLabel = "100-300 Mbps";
  } else if (speed <= 500) {
    speedLabel = "300-500 Mbps";
  } else if (speed <= 1000) {
    speedLabel = "500 Mbps-1 Gbps";
  } else {
    speedLabel = "1 Gbps+";
  }

  r.innerHTML = `
    <span>NGU MATCH</span>
    <strong>${item.name}</strong>
    <p>
      Recommended for ${speedLabel}
      ${use === "gaming"
        ? "competitive gaming and PUBG over Wi-Fi."
        : "home and general networking."}

      ${item.note || ""}

      Final choice should also consider firmware,
      ISP speed, Wi-Fi environment and actual stock.
    </p>

    <a
      href="${waLink(item.name)}"
      target="_blank"
      rel="noopener"
    >
      Ask NGU about this router →
    </a>
  `;
};


/* Start */

loadProducts();
