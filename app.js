const SUPABASE_URL = "https://khglefqussfkwmayfzqt.supabase.co";
const SUPABASE_KEY = "sb_publishable_vLxoVA_v7VvnbQpSPzWfIw_ZoaiXrFz";

let data = [];
let routerReturnScrollY = 0;

const products = document.querySelector("#products");
const table = document.querySelector("#table");
const count = document.querySelector("#count");


/* =========================
   HELPERS
========================= */

function escapeHTML(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function waLink(name) {

  const msg = encodeURIComponent(
    `Hi NGU, I'm interested in the ${name}. Please send me availability, price and gaming configuration details.`
  );

  return `https://wa.me/923364351134?text=${msg}`;
}


function getPrice(router) {

  if (
    router.priceOnRequest === false &&
    router.price !== null &&
    router.price !== undefined &&
    router.price !== ""
  ) {

    return `PKR ${Number(
      router.price
    ).toLocaleString()}`;

  }

  return "Price on request";
}


function getStock(router) {

  const stock =
    Number(router.stock || 0);

  if (stock > 0) {

    return `
      <span class="stock-status in-stock">
        ● IN STOCK
      </span>
    `;

  }

  return `
    <span class="stock-status out-stock">
      ● CURRENTLY UNAVAILABLE
    </span>
  `;
}


/* =========================
   IMAGE FALLBACK
========================= */

function imageFallback(img) {

  if (!img.dataset.fallbackTried) {

    img.dataset.fallbackTried = "1";

    const original =
      img.src;

    img.src =
      "https://wsrv.nl/?url=" +
      encodeURIComponent(original);

    return;
  }

  img.style.display = "none";

  const parent =
    img.parentElement;

  if (parent) {

    parent.classList.add(
      "image-broken"
    );

  }
}


/* =========================
   OPEN ROUTER
   REMEMBERS SCROLL
========================= */

function goToRouter(id) {

  if (!id) return;


  const router =
    data.find(
      x =>
        String(x.id) ===
        String(id)
    );


  if (!router) return;


  /*
    Remember exactly where the
    visitor was in the catalog.
  */

  routerReturnScrollY =
    window.scrollY ||
    window.pageYOffset ||
    0;


  /*
    Create a real browser history
    entry.

    This makes the Android/iPhone
    Back button work correctly.
  */

  history.pushState(
    {
      routerId:
        String(id),

      scrollY:
        routerReturnScrollY
    },
    "",
    `#router/${encodeURIComponent(id)}`
  );


  /*
    Open the detail page.
  */

  openRouter(router);

}


/* =========================
   LOAD PRODUCTS + IMAGES
========================= */

async function loadProducts() {

  try {

    const productResponse =
      await fetch(
        `${SUPABASE_URL}/rest/v1/products?select=*`,
        {
          headers: {
            apikey:
              SUPABASE_KEY,

            Authorization:
              `Bearer ${SUPABASE_KEY}`
          }
        }
      );


    if (!productResponse.ok) {

      throw new Error(
        `Products error: ${productResponse.status}`
      );

    }


    const rows =
      await productResponse.json();


    /* =========================
       LOAD ADDITIONAL IMAGES
    ========================= */

    const imageResponse =
      await fetch(
        `${SUPABASE_URL}/rest/v1/product_images?select=product_id,image_url,alt_text,sort_order&order=sort_order.asc`,
        {
          headers: {
            apikey:
              SUPABASE_KEY,

            Authorization:
              `Bearer ${SUPABASE_KEY}`
          }
        }
      );


    if (!imageResponse.ok) {

      throw new Error(
        `Product images error: ${imageResponse.status}`
      );

    }


    const imageRows =
      await imageResponse.json();


    /* =========================
       GROUP IMAGES BY PRODUCT
    ========================= */

    const imageMap = {};


    imageRows.forEach(image => {

      if (
        !imageMap[
          image.product_id
        ]
      ) {

        imageMap[
          image.product_id
        ] = [];

      }


      if (image.image_url) {

        imageMap[
          image.product_id
        ].push({

          url:
            image.image_url,

          alt:
            image.alt_text || "",

          order:
            image.sort_order || 0

        });

      }

    });


    /* =========================
       BUILD CATALOG
    ========================= */

    data =
      rows

        .filter(
          x =>
            x.active !== false
        )

        .map(x => {

          const extraImages =
            imageMap[x.id] || [];


          const allImages = [];


          /*
            MAIN IMAGE
          */

          if (x.image_url) {

            allImages.push({

              url:
                x.image_url,

              alt:
                x.name ||
                "NGU router"

            });

          }


          /*
            ADDITIONAL IMAGES
          */

          extraImages
            .sort(
              (a, b) =>
                a.order - b.order
            )
            .forEach(image => {

              /*
                Prevent duplicate URLs.
              */

              if (
                !allImages.some(
                  existing =>
                    existing.url ===
                    image.url
                )
              ) {

                allImages.push({

                  url:
                    image.url,

                  alt:
                    image.alt ||
                    `${x.name} NGU router`

                });

              }

            });


          return {

            id:
              x.id,

            name:
              x.name ||
              "Unknown router",

            wifi:
              x.wifi ||
              "",

            cls:
              x.wifi_class ||
              "",

            bands:
              x.bands ||
              "",

            best:
              x.best_for ||
              "",

            image:
              x.image_url ||
              "",

            /*
              Maximum 3 images.
            */

            images:
              allImages.slice(
                0,
                3
              ),

            note:
              x.description ||
              "NGU custom gaming configuration.",

            price:
              x.price,

            priceOnRequest:
              x.price_on_request,

            stock:
              x.stock,

            specifications:
              x.specifications ||
              {}

          };

        });


    /*
      Render catalog.
    */

    render();


    /*
      Open router if URL already
      contains #router/ID.
    */

    handleRoute();


  } catch (error) {

    console.error(
      "NGU Supabase error:",
      error
    );


    products.innerHTML = `

      <div class="empty">

        <strong>
          Unable to load router catalog.
        </strong>

        <p>
          Please try refreshing the page.
        </p>

      </div>

    `;


    count.textContent =
      "Catalog unavailable";

  }

}


/* =========================
   IMAGE GALLERY
========================= */

function renderGallery(router) {

  const images =
    router.images &&
    router.images.length

      ? router.images

      : router.image

        ? [
            {
              url:
                router.image,

              alt:
                router.name
            }
          ]

        : [];


  /*
    No image fallback.
  */

  if (!images.length) {

    return `

      <div
        class="product-image fallback"
      >

        <div class="mini">
          NGU
        </div>

      </div>

    `;

  }


  return `

    <div
      class="product-gallery"
    >

      <div
        class="gallery-track"
      >

        ${images.map(
          (image, index) => `

            <div
              class="gallery-slide"
            >

              <img
                src="${escapeHTML(
                  image.url
                )}"

                alt="${escapeHTML(
                  image.alt ||
                  router.name
                )}"

                loading="lazy"

                onerror="imageFallback(this)"
              >


              ${
                index === 0

                  ? `

                    <span
                      class="ngu-photo-tag"
                    >
                      NGU ROUTER
                    </span>

                  `

                  : ""
              }

            </div>

          `
        ).join("")}

      </div>


      ${
        images.length > 1

          ? `

            <div
              class="gallery-hint"
            >
              SWIPE →
            </div>

          `

          : ""
      }

    </div>

  `;

}


/* =========================
   RENDER PRODUCTS
========================= */

function render(
  filter = "all"
) {

  const d =
    filter === "all"

      ? data

      : data.filter(
          x =>
            x.wifi ===
            filter
        );


  count.textContent =
    d.length +
    " systems";


  products.innerHTML =

    d.map(x => {

      const routerHash =
        `#router/${encodeURIComponent(
          x.id
        )}`;


      return `

        <article
          class="product"
          data-router-id="${escapeHTML(
            x.id
          )}"
        >


          <!-- ROUTER IMAGE -->

          <a
            href="${routerHash}"
            class="router-card-link router-image-link"
            data-router-id="${escapeHTML(
              x.id
            )}"
            aria-label="View details for ${escapeHTML(
              x.name
            )}"
          >

            ${renderGallery(x)}

          </a>


          <div class="body">


            <span class="badge">
              NGU CATALOG
            </span>


            <!-- ROUTER NAME -->

            <h3>

              <a
                href="${routerHash}"
                class="router-card-link router-name-link"
                data-router-id="${escapeHTML(
                  x.id
                )}"
              >

                ${escapeHTML(
                  x.name
                )}

              </a>

            </h3>


            <p>
              ${escapeHTML(
                x.note
              )}
            </p>


            <div class="specs">


              ${
                x.wifi

                  ? `

                    <span>
                      ${escapeHTML(
                        x.wifi
                      )}
                    </span>

                  `

                  : ""
              }


              ${
                x.cls

                  ? `

                    <span>
                      ${escapeHTML(
                        x.cls
                      )}
                    </span>

                  `

                  : ""
              }


              ${
                x.bands

                  ? `

                    <span>
                      ${escapeHTML(
                        x.bands
                      )}
                    </span>

                  `

                  : ""
              }


            </div>


            <div class="bottom">


              <strong>
                ${escapeHTML(
                  getPrice(x)
                )}
              </strong>


              <!-- VIEW DETAILS -->

              <a
                href="${routerHash}"
                class="router-details-link"
                data-router-id="${escapeHTML(
                  x.id
                )}"
              >

                View details →

              </a>


            </div>


          </div>


        </article>

      `;

    }).join("");


  /* =========================
     COMPARISON TABLE
  ========================= */

  table.innerHTML =

    d.map(x => `

      <tr>

        <td>
          ${escapeHTML(
            x.name
          )}
        </td>

        <td>
          ${escapeHTML(
            x.wifi
          )}
        </td>

        <td>
          ${escapeHTML(
            x.cls
          )}
        </td>

        <td>
          ${escapeHTML(
            x.bands
          )}
        </td>

        <td>
          ${escapeHTML(
            x.best
          )}
        </td>

      </tr>

    `).join("");

}


/* =========================
   ROUTER DETAIL PAGE
========================= */

function openRouter(router) {

  if (!router) return;


  let detail =
    document.querySelector(
      "#router-detail"
    );


  /*
    Create detail container
    the first time it opens.
  */

  if (!detail) {

    detail =
      document.createElement(
        "section"
      );

    detail.id =
      "router-detail";

    detail.className =
      "router-detail";

    document.body.appendChild(
      detail
    );

  }


  const images =
    router.images &&
    router.images.length

      ? router.images

      : router.image

        ? [
            {
              url:
                router.image,

              alt:
                router.name
            }
          ]

        : [];


  const specifications =
    router.specifications ||
    {};


  detail.innerHTML = `

    <div
      class="router-detail-inner"
    >


      <!-- BACK BUTTON -->

      <button
        class="router-back"
        id="router-back"
      >
        ← BACK TO ROUTERS
      </button>


      <div
        class="router-detail-grid"
      >


        <!-- =====================
             DETAIL GALLERY
        ====================== -->

        <div
          class="detail-gallery"
        >

          <div
            class="detail-gallery-track"
            id="detail-gallery-track"
          >

            ${
              images.length

                ? images.map(
                    (image, index) => `

                      <div
                        class="detail-gallery-slide"
                      >

                        <img
                          src="${escapeHTML(
                            image.url
                          )}"

                          alt="${escapeHTML(
                            image.alt ||
                            router.name
                          )}"

                          onerror="imageFallback(this)"
                        >


                        ${
                          index === 0

                            ? `

                              <span
                                class="detail-photo-tag"
                              >
                                NGU ROUTER
                              </span>

                            `

                            : ""
                        }

                      </div>

                    `
                  ).join("")

                : `

                  <div
                    class="detail-no-image"
                  >
                    NGU
                  </div>

                `
            }

          </div>


          ${
            images.length > 1

              ? `

                <div
                  class="detail-gallery-hint"
                >
                  SWIPE FOR MORE →
                </div>

              `

              : ""
          }

        </div>


        <!-- =====================
             ROUTER INFORMATION
        ====================== -->

        <div
          class="router-detail-info"
        >


          <span
            class="detail-badge"
          >
            NGU GAMING ROUTER
          </span>


          <h1>
            ${escapeHTML(
              router.name
            )}
          </h1>


          <p
            class="detail-description"
          >
            ${escapeHTML(
              router.note
            )}
          </p>


          <div
            class="detail-spec-grid"
          >


            <div>

              <small>
                WI-FI
              </small>

              <strong>
                ${escapeHTML(
                  router.wifi ||
                  "—"
                )}
              </strong>

            </div>


            <div>

              <small>
                CLASS
              </small>

              <strong>
                ${escapeHTML(
                  router.cls ||
                  "—"
                )}
              </strong>

            </div>


            <div>

              <small>
                BANDS
              </small>

              <strong>
                ${escapeHTML(
                  router.bands ||
                  "—"
                )}
              </strong>

            </div>


            <div>

              <small>
                BEST FOR
              </small>

              <strong>
                ${escapeHTML(
                  router.best ||
                  "—"
                )}
              </strong>

            </div>


          </div>


          <!-- =====================
               PRICE + STOCK
          ====================== -->

          <div
            class="detail-price-box"
          >

            <div>

              <small>
                NGU PRICE
              </small>

              <strong>
                ${escapeHTML(
                  getPrice(router)
                )}
              </strong>

            </div>


            <div>
              ${getStock(router)}
            </div>

          </div>


          <!-- =====================
               WHATSAPP
          ====================== -->

          <div
            class="detail-actions"
          >

            <a
              class="detail-whatsapp"
              href="${waLink(
                router.name
              )}"
              target="_blank"
              rel="noopener"
            >
              ASK NGU ABOUT THIS ROUTER ↗
            </a>

          </div>


        </div>


      </div>


      <!-- =====================
           FULL SPECIFICATIONS
      ====================== -->

      <section
        class="detail-specifications"
      >


        <div
          class="detail-section-heading"
        >

          <span>
            TECHNICAL DATA
          </span>


          <h2>
            Full
            <span>
              Specifications.
            </span>
          </h2>

        </div>


        <div
          class="specification-list"
        >


          ${
            Object.keys(
              specifications
            ).length

              ? Object.entries(
                  specifications
                )

                .map(
                  ([key, value]) => `

                    <div
                      class="specification-row"
                    >

                      <span>

                        ${escapeHTML(
                          String(key)
                            .replace(
                              /_/g,
                              " "
                            )
                            .replace(
                              /\b\w/g,
                              c =>
                                c.toUpperCase()
                            )
                        )}

                      </span>


                      <strong>

                        ${
                          typeof value ===
                          "boolean"

                            ? value
                              ? "Yes"
                              : "No"

                            : escapeHTML(
                                value
                              )
                        }

                      </strong>

                    </div>

                  `
                )

                .join("")

              : `

                <div
                  class="specification-row"
                >

                  <span>
                    Specifications
                  </span>

                  <strong>
                    Available on request
                  </strong>

                </div>

              `
          }


        </div>


      </section>


      <!-- =====================
           NGU FEATURES
      ====================== -->

      <section
        class="ngu-detail-features"
      >


        <div>

          <span>
            NGU CONFIGURATION
          </span>


          <h2>
            Tuned for
            <span>
              gaming.
            </span>
          </h2>

        </div>


        <div
          class="ngu-feature-list"
        >


          <div>

            <b>
              01
            </b>

            <strong>
              Advanced Traffic Control
            </strong>

            <p>
              Gaming-focused traffic management
              designed to keep important traffic
              responsive.
            </p>

          </div>


          <div>

            <b>
              02
            </b>

            <strong>
              Latency-Focused Tuning
            </strong>

            <p>
              Configuration focused on responsive
              gaming and consistent network behavior.
            </p>

          </div>


          <div>

            <b>
              03
            </b>

            <strong>
              Wi-Fi Optimization
            </strong>

            <p>
              Wireless configuration tuned for
              everyday use and gaming workloads.
            </p>

          </div>


          <div>

            <b>
              04
            </b>

            <strong>
              Performance Enhancements
            </strong>

            <p>
              NGU configuration designed around
              the hardware's capabilities.
            </p>

          </div>


        </div>


      </section>


      <!-- =====================
           BOTTOM BACK
      ====================== -->

      <div
        class="detail-bottom"
      >

        <button
          class="router-back"
          id="router-back-bottom"
        >
          ← BACK TO ROUTERS
        </button>

      </div>


    </div>

  `;


  detail.classList.add(
    "active"
  );


  document.body.classList.add(
    "router-detail-open"
  );


  /*
    Start the detail page at the top.
  */

  window.scrollTo({

    top: 0,

    left: 0,

    behavior: "instant"

  });


  /*
    Back buttons.
  */

  const backTop =
    document.querySelector(
      "#router-back"
    );


  if (backTop) {

    backTop.onclick =
      closeRouter;

  }


  const backBottom =
    document.querySelector(
      "#router-back-bottom"
    );


  if (backBottom) {

    backBottom.onclick =
      closeRouter;

  }

}


/* =========================
   CLOSE ROUTER
   BROWSER BACK SAFE
========================= */

function closeRouter() {

  const detail =
    document.querySelector(
      "#router-detail"
    );


  /*
    Do not manually remove the hash
    here.

    Instead use browser history.
    This is important because Android's
    Back button needs the same history.
  */

  if (
    window.location.hash.startsWith(
      "#router/"
    )
  ) {

    history.back();

    return;

  }


  /*
    Fallback.
  */

  if (detail) {

    detail.classList.remove(
      "active"
    );

  }


  document.body.classList.remove(
    "router-detail-open"
  );


  requestAnimationFrame(() => {

    window.scrollTo({

      top:
        routerReturnScrollY,

      left:
        0,

      behavior:
        "instant"

    });

  });

}


/* =========================
   ROUTER ROUTING
========================= */

function handleRoute() {

  const hash =
    window.location.hash;


  /*
    No router hash:
    show catalog.
  */

  if (
    !hash.startsWith(
      "#router/"
    )
  ) {

    const detail =
      document.querySelector(
        "#router-detail"
      );


    if (detail) {

      detail.classList.remove(
        "active"
      );

    }


    document.body.classList.remove(
      "router-detail-open"
    );


    /*
      Return to exact catalog position.
    */

    requestAnimationFrame(() => {

      window.scrollTo({

        top:
          routerReturnScrollY,

        left:
          0,

        behavior:
          "instant"

      });

    });


    return;

  }


  /*
    Get router ID.
  */

  const id =
    decodeURIComponent(
      hash.replace(
        "#router/",
        ""
      )
    );


  const router =
    data.find(
      x =>
        String(x.id) ===
        String(id)
    );


  if (router) {

    openRouter(
      router
    );

  }

}


/* =========================
   BROWSER HISTORY
========================= */

/*
  Android/iPhone Back button.
*/

window.addEventListener(
  "popstate",
  () => {

    handleRoute();

  }
);


/*
  Also support manually changing
  the URL hash.
*/

window.addEventListener(
  "hashchange",
  () => {

    handleRoute();

  }
);


/* =========================
   PRODUCT CLICK SYSTEM
========================= */

products.addEventListener(
  "click",
  event => {

    /*
      Find router link.

      This covers:

      - Picture
      - Router name
      - View details
    */

    const link =
      event.target.closest(
        ".router-card-link, .router-details-link"
      );


    if (!link) {
      return;
    }


    /*
      Prevent the normal anchor
      from changing the URL itself.
    */

    event.preventDefault();


    const routerId =
      link.dataset.routerId;


    if (!routerId) {
      return;
    }


    goToRouter(
      routerId
    );

  }
);


/* =========================
   WI-FI FILTERS
========================= */

document
  .querySelectorAll(
    ".filters button"
  )
  .forEach(button => {

    button.onclick = () => {

      document
        .querySelectorAll(
          ".filters button"
        )
        .forEach(x =>
          x.classList.remove(
            "active"
          )
        );


      button.classList.add(
        "active"
      );


      render(
        button.dataset.f
      );

    };

  });


/* =========================
   MOBILE MENU
========================= */

const mobile =
  document.querySelector(
    "#mobile"
  );


if (
  document.querySelector(
    "#open"
  )
) {

  document.querySelector(
    "#open"
  ).onclick = () => {

    mobile.classList.add(
      "open"
    );

  };

}


if (
  document.querySelector(
    "#close"
  )
) {

  document.querySelector(
    "#close"
  ).onclick = () => {

    mobile.classList.remove(
      "open"
    );

  };

}


document
  .querySelectorAll(
    ".mobile a"
  )
  .forEach(a => {

    a.onclick = () => {

      mobile.classList.remove(
        "open"
      );

    };

  });


/* =========================
   START
========================= */

loadProducts();
