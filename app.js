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


/* =========================
   LOAD PRODUCTS + IMAGES
========================= */

async function loadProducts() {

  try {

    const productResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );


    if (!productResponse.ok) {
      throw new Error(
        `Products error: ${productResponse.status}`
      );
    }


    const rows = await productResponse.json();


    /*
      Load all additional product images.
      The product_images table contains:

      product_id
      image_url
      alt_text
      sort_order
    */

    const imageResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/product_images?select=product_id,image_url,alt_text,sort_order&order=sort_order.asc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );


    if (!imageResponse.ok) {
      throw new Error(
        `Product images error: ${imageResponse.status}`
      );
    }


    const imageRows = await imageResponse.json();


    /*
      Group additional images by product ID.
    */

    const imageMap = {};


    imageRows.forEach(image => {

      if (!imageMap[image.product_id]) {
        imageMap[image.product_id] = [];
      }


      if (image.image_url) {

        imageMap[image.product_id].push({
          url: image.image_url,
          alt: image.alt_text || "",
          order: image.sort_order || 0
        });

      }

    });


    /*
      Build the final catalog.
    */

    data = rows

      .filter(x => x.active !== false)

      .map(x => {

        const extraImages =
          imageMap[x.id] || [];


        /*
          Main image from products.image_url
          + additional images from product_images.
        */

        const allImages = [];


        if (x.image_url) {

          allImages.push({
            url: x.image_url,
            alt: x.name || "NGU router"
          });

        }


        extraImages.forEach(image => {

          /*
            Prevent duplicate image URLs.
          */

          if (
            !allImages.some(
              existing => existing.url === image.url
            )
          ) {

            allImages.push({
              url: image.url,
              alt:
                image.alt ||
                `${x.name} NGU router`
            });

          }

        });


        return {

          id: x.id,

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

          images:
            allImages.slice(0, 3),

          note:
            x.description ||
            "",

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


    render();


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
        ? [{
            url: router.image,
            alt: router.name
          }]
        : [];


  if (!images.length) {

    return `
      <div class="product-image fallback">

        <div class="mini">
          NGU
        </div>

      </div>
    `;

  }


  return `
    <div class="product-gallery">

      <div class="gallery-track">

        ${images.map((image, index) => `

          <div class="gallery-slide">

            <img
              src="${image.url}"
              alt="${image.alt || router.name}"
              loading="lazy"
              onerror="
                this.style.opacity='0';
              "
            >

            ${
              index === 0
                ? `
                  <span class="ngu-photo-tag">
                    NGU ROUTER
                  </span>
                `
                : ""
            }

          </div>

        `).join("")}

      </div>


      ${
        images.length > 1
          ? `
            <div class="gallery-hint">
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

function render(filter = "all") {

  const d =
    filter === "all"
      ? data
      : data.filter(
          x => x.wifi === filter
        );


  count.textContent =
    d.length + " systems";


  products.innerHTML =
    d.map(x => {

      let priceText =
        "Price on request";


      if (
        x.priceOnRequest === false &&
        x.price !== null &&
        x.price !== undefined
      ) {

        priceText =
          `PKR ${Number(
            x.price
          ).toLocaleString()}`;

      }


      return `

        <article class="product">


          ${renderGallery(x)}


          <div class="body">


            <span class="badge">
              NGU CATALOG
            </span>


            <h3>
              ${x.name}
            </h3>


            <p>
              ${x.note}
            </p>


            <div class="specs">

              ${
                x.wifi
                  ? `<span>${x.wifi}</span>`
                  : ""
              }

              ${
                x.cls
                  ? `<span>${x.cls}</span>`
                  : ""
              }

              ${
                x.bands
                  ? `<span>${x.bands}</span>`
                  : ""
              }

            </div>


            <div class="bottom">


              <strong>
                ${priceText}
              </strong>


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


  table.innerHTML =
    d.map(x => `

      <tr>

        <td>
          ${x.name}
        </td>

        <td>
          ${x.wifi}
        </td>

        <td>
          ${x.cls}
        </td>

        <td>
          ${x.bands}
        </td>

        <td>
          ${x.best}
        </td>

      </tr>

    `).join("");

}


/* =========================
   WI-FI FILTERS
========================= */

document
  .querySelectorAll(".filters button")
  .forEach(button => {

    button.onclick = () => {

      document
        .querySelectorAll(".filters button")
        .forEach(x =>
          x.classList.remove("active")
        );


      button.classList.add("active");


      render(
        button.dataset.f
      );

    };

  });


/* =========================
   MOBILE MENU
========================= */

const mobile =
  document.querySelector("#mobile");


if (
  document.querySelector("#open")
) {

  document.querySelector("#open").onclick =
    () => {

      mobile.classList.add(
        "open"
      );

    };

}


if (
  document.querySelector("#close")
) {

  document.querySelector("#close").onclick =
    () => {

      mobile.classList.remove(
        "open"
      );

    };

}


document
  .querySelectorAll(".mobile a")
  .forEach(a => {

    a.onclick =
      () => {

        mobile.classList.remove(
          "open"
        );

      };

  });


/* =========================
   START
========================= */

loadProducts();
