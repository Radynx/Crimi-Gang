const CART_KEY = "crimi-gang-cart";
const PRODUCTS = Array.isArray(window.CRIMI_PRODUCTS) ? window.CRIMI_PRODUCTS : [];
const CATEGORIES = Array.isArray(window.CRIMI_CATEGORIES) ? window.CRIMI_CATEGORIES : [];
const OVERRIDES_STYLESHEET = "overrides.css";
const BRAND_LABEL = "Shop";
const BRAND_LOGO_FALLBACK_PATH = "assets/logo-crimi-square-web.jpg";
const BRAND_LOGO_PATH = "assets/logo-crimi-square.svg";
const LEGACY_LOGO_PATH = "logo-crimi-square.svg";

function ensureOverridesStylesheet() {
  if (document.querySelector(`link[href="${OVERRIDES_STYLESHEET}"]`)) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = OVERRIDES_STYLESHEET;
  document.head.appendChild(link);
}

function applyGlobalBranding() {
  document.querySelectorAll(".brand-mark").forEach((mark) => {
    mark.style.background = `linear-gradient(rgba(3, 10, 14, 0.08), rgba(3, 10, 14, 0.08)), url("${BRAND_LOGO_PATH}") center / cover no-repeat`;
  });

  if (document.title.includes("Ridewear Shop")) {
    document.title = document.title.replace("Ridewear Shop", BRAND_LABEL);
  }

  document.querySelectorAll(".brand-copy small").forEach((node) => {
    node.textContent = BRAND_LABEL;
  });

  document.querySelectorAll("img").forEach((image) => {
    const source = image.getAttribute("src") || "";

    if (
      source.includes(LEGACY_LOGO_PATH) ||
      source.includes(BRAND_LOGO_FALLBACK_PATH) ||
      image.dataset.brandLogo === "true"
    ) {
      image.setAttribute("src", BRAND_LOGO_PATH);
    }
  });

  if (document.body.dataset.page !== "home") {
    return;
  }

  document
    .querySelector('.hero-actions a[href="social.html"]')
    ?.remove();

  document.querySelector("#social-preview")?.remove();

  const heroText = document.querySelector(".hero-text");

  if (heroText && heroText.textContent.includes("social e carrello")) {
    heroText.textContent = heroText.textContent.replace("social e carrello", "shop e carrello");
  }
}

function initTicker() {
  const track = document.querySelector(".ticker-track");

  if (!track || track.dataset.ready === "true") {
    return;
  }

  let groups = Array.from(track.querySelectorAll(".ticker-group"));

  if (!groups.length) {
    const items = Array.from(track.children);

    if (!items.length) {
      return;
    }

    const group = document.createElement("div");
    group.className = "ticker-group";
    items.forEach((item) => group.appendChild(item));
    track.appendChild(group);
    groups = [group];
  }

  if (groups.length === 1) {
    const clone = groups[0].cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  }

  track.dataset.ready = "true";
}

function formatPrice(value) {
  return `${value}€`;
}

function labelize(value) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function colorSwatchValue(name) {
  const value = String(name || "").toLowerCase();

  if (value.includes("verde")) {
    return "linear-gradient(135deg, #69ff9b, #18b86d)";
  }

  if (value.includes("azzurro") || value.includes("sky")) {
    return "linear-gradient(135deg, #59d7ff, #1296be)";
  }

  if (value.includes("nero")) {
    return "linear-gradient(135deg, #071217, #29343a)";
  }

  if (value.includes("bianco")) {
    return "linear-gradient(135deg, #f6fffe, #bbd7d3)";
  }

  if (value.includes("grigio") || value.includes("fumo")) {
    return "linear-gradient(135deg, #758891, #c3d2cf)";
  }

  if (value.includes("mixed")) {
    return "linear-gradient(135deg, #69ff9b 0%, #59d7ff 52%, #f6fffe 100%)";
  }

  if (value.includes("petrolio")) {
    return "linear-gradient(135deg, #26a087, #0c3c47)";
  }

  return "linear-gradient(135deg, #69ff9b, #59d7ff)";
}

function renderProductGraphic(modifier = "") {
  return `
    <div class="product-graphic${modifier ? ` ${modifier}` : ""}" aria-hidden="true">
      <img src="assets/logo-crimi-square.svg" alt="" loading="lazy" decoding="async" />
    </div>
  `;
}

function renderColorOption(color, index) {
  return `
    <button
      class="option-chip option-chip-color${index === 0 ? " is-active" : ""}"
      type="button"
      data-option-group="color"
      data-option-value="${color}"
      style="--swatch: ${colorSwatchValue(color)}"
    >
      <span class="swatch-dot"></span>
      <span class="option-label">${color}</span>
    </button>
  `;
}

function renderSizeOption(size, index) {
  const badge = size === "One Size" ? "U" : size;
  const label = size === "One Size" ? "Taglia unica" : `Taglia ${size}`;

  return `
    <button
      class="option-chip option-chip-size${index === 0 ? " is-active" : ""}"
      type="button"
      data-option-group="size"
      data-option-value="${size}"
    >
      <span class="option-size-badge">${badge}</span>
      <span class="option-label">${label}</span>
    </button>
  `;
}

function productUrl(id) {
  return `product.html?id=${encodeURIComponent(id)}`;
}

function findProduct(id) {
  return PRODUCTS.find((product) => product.id === id);
}

function loadCart() {
  try {
    const stored = localStorage.getItem(CART_KEY);
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCartCount();
}

function cartCount(cart = loadCart()) {
  return cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
}

function cartSubtotal(cart = loadCart()) {
  return cart.reduce(
    (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );
}

function renderCartCount() {
  const count = cartCount();
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = String(count);
  });
}

function updateYear() {
  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }
}

function addProductToCart(product, color, size, quantity) {
  const cart = loadCart();
  const existing = cart.find(
    (item) => item.id === product.id && item.color === color && item.size === size,
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      color,
      size,
      quantity,
      mediaClass: product.mediaClass,
    });
  }

  saveCart(cart);
}

function renderShopCard(product) {
  const tags = product.tags
    .map((tag) => `<span>${tag}</span>`)
    .join("");

  return `
    <article class="mini-card">
      <a class="media-link" href="${productUrl(product.id)}" aria-label="Apri ${product.name}">
        <div class="product-media ${product.mediaClass}">
          ${renderProductGraphic()}
          <span>${product.cardLabel}</span>
        </div>
      </a>
      <div class="mini-body">
        <div class="mini-top">
          <div>
            <p class="eyebrow">${product.badge}</p>
            <a class="mini-title-link" href="${productUrl(product.id)}">
              <h4>${product.name}</h4>
            </a>
          </div>
          <span class="price-pill">${formatPrice(product.price)}</span>
        </div>
        <p>${product.shortDescription}</p>
        <div class="mini-tags">${tags}</div>
        <div class="mini-actions">
          <a class="button button-secondary mini-button" href="${productUrl(product.id)}">
            Dettagli
          </a>
          <button
            class="button button-primary mini-button"
            type="button"
            data-quick-add="${product.id}"
          >
            Aggiungi
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderShopCatalog() {
  const mount = document.querySelector("[data-shop-catalog]");

  if (!mount) {
    return;
  }

  mount.innerHTML = PRODUCTS.map(renderShopCard).join("");

  mount.querySelectorAll("[data-quick-add]").forEach((button) => {
    button.addEventListener("click", () => {
      const product = findProduct(button.dataset.quickAdd);

      if (!product) {
        return;
      }

      addProductToCart(product, product.colors[0], product.sizes[0], 1);
      const originalText = button.textContent;
      button.textContent = "Aggiunto";
      window.setTimeout(() => {
        button.textContent = originalText;
      }, 1200);
    });
  });
}

function renderMeasurementTable(product) {
  const rows = product.measurements || [];

  if (!rows.length) {
    return "";
  }

  const keys = Object.keys(rows[0]);
  const head = keys.map((key) => `<th>${labelize(key)}</th>`).join("");
  const body = rows
    .map((row) => {
      const columns = keys.map((key) => `<td>${row[key]}</td>`).join("");
      return `<tr>${columns}</tr>`;
    })
    .join("");

  return `
    <div class="detail-table-wrap">
      <table class="detail-table">
        <thead>
          <tr>${head}</tr>
        </thead>
        <tbody>
          ${body}
        </tbody>
      </table>
    </div>
  `;
}

function renderRelatedProducts(product) {
  const related = PRODUCTS.filter(
    (entry) => entry.category === product.category && entry.id !== product.id,
  ).slice(0, 3);

  if (!related.length) {
    return "";
  }

  return `
    <section class="section related-section">
      <div class="section-heading">
        <p class="eyebrow">Stessa categoria</p>
        <h2>Altri pezzi che stanno bene nello stesso drop.</h2>
      </div>
      <div class="mini-grid related-grid">
        ${related.map(renderShopCard).join("")}
      </div>
    </section>
  `;
}

function renderProductPage() {
  const mount = document.querySelector("[data-product-page]");

  if (!mount) {
    return;
  }

  const id = new URLSearchParams(window.location.search).get("id");
  const product = findProduct(id) || PRODUCTS[0];

  if (!product) {
    return;
  }

  document.title = `${product.name} | Crimi Gang`;

  const colorOptions = product.colors
    .map((color, index) => renderColorOption(color, index))
    .join("");

  const sizeOptions = product.sizes
    .map((size, index) => renderSizeOption(size, index))
    .join("");

  const tags = product.tags.map((tag) => `<span>${tag}</span>`).join("");

  mount.innerHTML = `
    <section class="detail-hero">
      <div class="detail-layout">
        <div class="detail-media-shell">
          <div class="detail-media ${product.mediaClass}">
            ${renderProductGraphic("product-graphic-detail")}
            <span>${product.cardLabel}</span>
          </div>
        </div>

        <div class="detail-copy">
          <p class="eyebrow">${product.badge}</p>
          <h1>${product.name}</h1>
          <p class="detail-price">${formatPrice(product.price)}</p>
          <p class="detail-text">${product.longDescription}</p>

          <div class="detail-tags">${tags}</div>

          <div class="selector-block">
            <span>Colore</span>
            <div class="option-row">${colorOptions}</div>
          </div>

          <div class="selector-block">
            <span>Taglia</span>
            <div class="option-row">${sizeOptions}</div>
          </div>

          <div class="selector-block">
            <label for="quantity">Quantita</label>
            <div class="quantity-stepper">
              <button type="button" data-quantity-action="decrease" aria-label="Diminuisci quantita">
                -
              </button>
              <input
                class="quantity-input"
                id="quantity"
                type="text"
                inputmode="numeric"
                value="1"
                readonly
                data-quantity-input
              />
              <button type="button" data-quantity-action="increase" aria-label="Aumenta quantita">
                +
              </button>
            </div>
          </div>

          <div class="detail-actions">
            <button class="button button-primary" type="button" data-add-to-cart>
              Aggiungi al carrello
            </button>
            <a class="button button-secondary" href="cart.html">
              Apri carrello
            </a>
          </div>

          <p class="notice-pill" data-product-notice>
            Seleziona colore, taglia e quantita per aggiungere il prodotto.
          </p>
        </div>
      </div>
    </section>

    <section class="section detail-info">
      <div class="detail-info-grid">
        <div class="detail-panel">
          <p class="eyebrow">Descrizione</p>
          <h2>Taglio, attitudine e dettagli pensati per Crimi Gang.</h2>
          <p>${product.shortDescription}</p>
          <ul class="detail-list">
            ${product.features.map((feature) => `<li>${feature}</li>`).join("")}
          </ul>
        </div>

        <div class="detail-panel">
          <p class="eyebrow">Misure</p>
          <h2>Taglie e misure pronte per la scheda prodotto.</h2>
          ${renderMeasurementTable(product)}
        </div>
      </div>
    </section>

    ${renderRelatedProducts(product)}
  `;

  let selectedColor = product.colors[0];
  let selectedSize = product.sizes[0];

  mount.querySelectorAll("[data-option-group='color']").forEach((button) => {
    button.addEventListener("click", () => {
      selectedColor = button.dataset.optionValue;
      mount.querySelectorAll("[data-option-group='color']").forEach((entry) => {
        entry.classList.toggle("is-active", entry === button);
      });
    });
  });

  mount.querySelectorAll("[data-option-group='size']").forEach((button) => {
    button.addEventListener("click", () => {
      selectedSize = button.dataset.optionValue;
      mount.querySelectorAll("[data-option-group='size']").forEach((entry) => {
        entry.classList.toggle("is-active", entry === button);
      });
    });
  });

  const quantityInput = mount.querySelector("[data-quantity-input]");
  const notice = mount.querySelector("[data-product-notice]");
  const addButton = mount.querySelector("[data-add-to-cart]");

  mount.querySelectorAll("[data-quantity-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const currentValue = Math.max(1, Number(quantityInput.value || 1));
      const nextValue =
        button.dataset.quantityAction === "increase"
          ? currentValue + 1
          : Math.max(1, currentValue - 1);

      quantityInput.value = String(nextValue);
    });
  });

  addButton.addEventListener("click", () => {
    const quantity = Math.max(1, Number(quantityInput.value || 1));
    addProductToCart(product, selectedColor, selectedSize, quantity);
    notice.textContent = `${product.name} aggiunto al carrello con ${selectedColor}, ${selectedSize}, quantita ${quantity}.`;
  });

  mount.querySelectorAll("[data-quick-add]").forEach((button) => {
    button.addEventListener("click", () => {
      const related = findProduct(button.dataset.quickAdd);

      if (!related) {
        return;
      }

      addProductToCart(related, related.colors[0], related.sizes[0], 1);
      notice.textContent = `${related.name} aggiunto al carrello.`;
    });
  });
}

function renderCartPage() {
  const mount = document.querySelector("[data-cart-page]");

  if (!mount) {
    return;
  }

  const cart = loadCart();

  if (!cart.length) {
    mount.innerHTML = `
      <section class="section cart-page">
        <div class="section-heading">
          <p class="eyebrow">Carrello</p>
          <h1>Il tuo carrello e vuoto.</h1>
          <p>
            Parti dallo shop, scegli un prodotto, seleziona colore, taglia e
            quantita, poi torna qui per rivedere il riepilogo.
          </p>
        </div>
        <div class="empty-cart-actions">
          <a class="button button-primary" href="shop.html">Vai allo shop</a>
          <a class="button button-secondary" href="index.html">Torna alla home</a>
        </div>
      </section>
    `;
    return;
  }

  mount.innerHTML = `
    <section class="section cart-page">
      <div class="section-heading">
        <p class="eyebrow">Carrello</p>
        <h1>Rivedi i prodotti scelti prima del checkout.</h1>
        <p>
          Il checkout vero non e ancora collegato, ma il riepilogo e gia pronto
          per taglie, colori, quantita e totale.
        </p>
      </div>

      <div class="cart-layout">
        <div class="cart-items">
          ${cart
            .map(
              (item, index) => `
                <article class="cart-item">
                  <div class="cart-thumb ${item.mediaClass}">
                    ${renderProductGraphic("product-graphic-cart")}
                    <span>${item.quantity}x</span>
                  </div>
                  <div class="cart-item-copy">
                    <h3>${item.name}</h3>
                    <p>Colore: ${item.color}</p>
                    <p>Taglia: ${item.size}</p>
                    <div class="cart-controls">
                      <button type="button" data-cart-action="decrease" data-cart-index="${index}">-</button>
                      <span>${item.quantity}</span>
                      <button type="button" data-cart-action="increase" data-cart-index="${index}">+</button>
                      <button type="button" data-cart-action="remove" data-cart-index="${index}">Rimuovi</button>
                    </div>
                  </div>
                  <strong class="cart-line-total">${formatPrice(item.price * item.quantity)}</strong>
                </article>
              `,
            )
            .join("")}
        </div>

        <aside class="cart-summary">
          <p class="eyebrow">Totale</p>
          <h2>${formatPrice(cartSubtotal(cart))}</h2>
          <p>Spedizione e pagamento verranno aggiunti quando collegheremo il backend.</p>
          <a class="button button-primary" href="shop.html">Continua lo shopping</a>
          <button class="button button-secondary" type="button" data-clear-cart>Svuota carrello</button>
        </aside>
      </div>
    </section>
  `;

  mount.querySelectorAll("[data-cart-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextCart = loadCart();
      const index = Number(button.dataset.cartIndex);
      const action = button.dataset.cartAction;
      const item = nextCart[index];

      if (!item) {
        return;
      }

      if (action === "increase") {
        item.quantity += 1;
      }

      if (action === "decrease") {
        item.quantity = Math.max(1, item.quantity - 1);
      }

      if (action === "remove") {
        nextCart.splice(index, 1);
      }

      saveCart(nextCart);
      renderCartPage();
    });
  });

  const clearButton = mount.querySelector("[data-clear-cart]");

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      saveCart([]);
      renderCartPage();
    });
  }
}

function bindAccountForms() {
  document.querySelectorAll("[data-account-form]").forEach((form) => {
    const notice = form.querySelector("[data-account-notice]");
    const action = form.dataset.accountForm;
    const button = form.querySelector("[data-account-button]");

    if (!notice || !button) {
      return;
    }

    button.addEventListener("click", () => {
      notice.textContent =
        action === "register"
          ? "Registrazione pronta lato frontend: quando vuoi colleghiamo account, ordini e preferiti."
          : "Accesso pronto lato frontend: quando vuoi colleghiamo login vero e area personale.";
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  ensureOverridesStylesheet();
  updateYear();
  renderCartCount();
  applyGlobalBranding();
  initTicker();
  renderShopCatalog();
  renderProductPage();
  renderCartPage();
  bindAccountForms();
  applyGlobalBranding();
  initTicker();
});
