const CART_KEY = "crimi-gang-cart";
const PRODUCTS = Array.isArray(window.CRIMI_PRODUCTS) ? window.CRIMI_PRODUCTS : [];
const CATEGORIES = Array.isArray(window.CRIMI_CATEGORIES) ? window.CRIMI_CATEGORIES : [];
const OVERRIDES_STYLESHEET = "overrides.css";
const BRAND_LABEL = "Shop";
const BRAND_LOGO_FALLBACK_PATH = "assets/logo-crimi-square-web.jpg";
const BRAND_LOGO_PATH = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QF8RXhpZgAATU0AKgAAAAgABgESAAMAAAABAAEAAAEaAAUAAAABAAAAVgEbAAUAAAABAAAAXgEoAAMAAAABAAIAAAEyAAIAAAAUAAAAZodpAAQAAAABAAAAegAAAAAAAABIAAAAAQAAAEgAAAABMjAyNjowMzozMSAxNDoxMDoxMAAAD5AAAAcAAAAEMDIyMZADAAIAAAAUAAABNJAEAAIAAAAUAAABSJAQAAIAAAAHAAABXJARAAIAAAAHAAABZJASAAIAAAAHAAABbJEBAAcAAAAEAQIDAJKQAAIAAAAEMDAwAJKRAAIAAAAEMDAwAJKSAAIAAAAEMDAwAKAAAAcAAAAEMDEwMKABAAMAAAABAAEAAKACAAQAAAABAAAAtKADAAQAAAABAAAAtKQGAAMAAAABAAAAAAAAAAAyMDI2OjAzOjMxIDE0OjEwOjEwADIwMjY6MDM6MzEgMTQ6MTA6MTAAKzAyOjAwAAArMDI6MDAAACswMjowMAAA/+EK0mh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6SXB0YzR4bXBFeHQ9Imh0dHA6Ly9pcHRjLm9yZy9zdGQvSXB0YzR4bXBFeHQvMjAwOC0wMi0yOS8iIHhtcDpDcmVhdGVEYXRlPSIyMDI2LTAzLTMxVDE0OjEwOjEwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNi0wMy0zMVQxNDoxMDoxMCIgcGhvdG9zaG9wOkNyZWRpdD0iQXBwbGUgUGhvdG9zIENsZWFuIFVwIiBwaG90b3A6RGF0ZUNyZWF0ZWQ9IjIwMjYtMDMtMzFUMTQ6MTA6MTAiIElwdGM0eG1wRXh0OkRpZ2l0YWxTb3VyY2VUeXBlPSJodHRwOi8vY3YuaXB0Yy5vcmcvbmV3c2NvZGVzL2RpZ2l0YWxzb3VyY2V0eXBlL2NvbXBvc2l0ZVdpdGhUcmFpbmVkQWxnb3JpdGhtaWNNZWRpYSIvPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDw/eHBhY2tldCBlbmQ9InciPz4A/+0AklBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAABZHAFaAAMbJUccAgAAAgACHAI/AAYxNDEwMTAcAj4ACDIwMjYwMzMxHAJuABVBcHBsZSBQaG90b3MgQ2xlYW4gVXAcAjcACDIw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~oYeQ/8JxfWssgHOJUntPPx2KM2OxFdmHp4SUWsVBy7LS3zT0PyzXD4mqoxouNuvMr39P+GZ5N/nvrx607QLnxL430nwprelx2Npe202poml6hqn2yRoo4rOK3kEkzs6Pj5ACo3EgEV2utXXipwp7BKCl0aWmiAooooAXNTQTGCVJFAypB56H61BRTTHc/SL9mDxH8Mvibb+BfhZqWsN4I8aeF72//srUrhozYahbakVaS0mZxiKZGGY94KSZKkqxFfpZ+038EfB/hf4V32s/Ej4radb+HrYCK7SwgtFurlTtH2eBIUWR5HAwEDY7kqMkfzZhsVI880n+sdn78knn15rT2hNj3X9ob4p+Ffiv8TNU8WeCtFl0HQ5YrOzsbOeQSyQ2dhAlvCrMvG5ggLAZA6AnqfBKUnNJUOVxoKKKKkAopcGlxxTsA2ilwaXbRYBtGc07aaUCjlHYZRTttG2iwj//0vwHooorQ0HEDbUXepj92oe9QyZD6Q9KWkPSiQpDKdtApB1p9IQ0gYpp6089KaetACUUUUAFFFFAD8cU0daeOlNXrQA6iiirRaCiilpgw7UlL2pKAQUUUUDP/9k=";
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
      <img src="assets/logo-crimi-square-web.jpg" alt="" loading="lazy" decoding="async" />
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
