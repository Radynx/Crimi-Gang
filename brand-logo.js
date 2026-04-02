(function () {
  const logo = "assets/logo-crimi-square-safe-180.jpg?v=20260402";
  const background =
    'linear-gradient(rgba(3, 10, 14, 0.08), rgba(3, 10, 14, 0.08)), url("' +
    logo +
    '") center / cover no-repeat';

  const shouldSwap = function (image) {
    const source = image.getAttribute("src") || "";

    return (
      image.dataset.brandLogo === "true" ||
      source.indexOf("logo-crimi-square-web.jpg") !== -1 ||
      source.indexOf("logo-crimi-square-safe-180.jpg") !== -1 ||
      source.indexOf("logo-crimi-square.svg") !== -1 ||
      source.indexOf("logo-crimi.svg") !== -1
    );
  };

  const apply = function () {
    document.querySelectorAll(".brand-mark").forEach(function (mark) {
      mark.style.background = background;
    });

    document.querySelectorAll("img").forEach(function (image) {
      if (shouldSwap(image)) {
        image.src = logo;
      }
    });
  };

  const observe = function () {
    if (!document.body) {
      return;
    }

    const observer = new MutationObserver(function () {
      apply();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  };

  const start = function () {
    apply();
    observe();
    window.setTimeout(apply, 0);
    window.setTimeout(apply, 160);
    window.addEventListener("load", apply, { once: true });
  };

  window.CRIMI_BRAND_LOGO = logo;
  document.documentElement.style.setProperty("--brand-logo", 'url("' + logo + '")');

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
