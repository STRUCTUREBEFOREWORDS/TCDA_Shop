document.addEventListener("DOMContentLoaded", () => {
  /* ── i18n + currency init ─────────────────────────────────── */
  if (window.TCDAi18n) {
    const lang = TCDAi18n.detectLang();
    TCDAi18n.apply(lang);

    /* Update toggle label */
    const langLabel = document.querySelector("[data-current-lang-label]");
    if (langLabel) langLabel.textContent = lang.toUpperCase();
  }

  if (window.TCDACurrency) {
    TCDACurrency.init();

    /* Update toggle label */
    const currLabel = document.querySelector("[data-current-currency-label]");
    if (currLabel) currLabel.textContent = TCDACurrency.getCurrentCurrency();
  }

  /* ── Locale panel toggle ──────────────────────────────────── */
  const localeToggle = document.querySelector("[data-locale-toggle]");
  const localePanel  = document.querySelector("[data-locale-panel]");

  if (localeToggle && localePanel) {
    localeToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = localePanel.hasAttribute("hidden");
      localePanel.toggleAttribute("hidden", !open);
      localeToggle.setAttribute("aria-expanded", String(open));
    });

    /* Close on outside click */
    document.addEventListener("click", (e) => {
      if (!localeToggle.contains(e.target) && !localePanel.contains(e.target)) {
        localePanel.setAttribute("hidden", "");
        localeToggle.setAttribute("aria-expanded", "false");
      }
    });

    /* Close on Escape */
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !localePanel.hasAttribute("hidden")) {
        localePanel.setAttribute("hidden", "");
        localeToggle.setAttribute("aria-expanded", "false");
        localeToggle.focus();
      }
    });

    /* Language buttons */
    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.getAttribute("data-lang-btn");
        if (window.TCDAi18n) {
          TCDAi18n.apply(lang);
          const langLabel = document.querySelector("[data-current-lang-label]");
          if (langLabel) langLabel.textContent = lang.toUpperCase();
        }
      });
    });

    /* Currency buttons */
    document.querySelectorAll("[data-currency-btn]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const code = btn.getAttribute("data-currency-btn");
        if (window.TCDACurrency) {
          TCDACurrency.applyPrices(code);
          const currLabel = document.querySelector("[data-current-currency-label]");
          if (currLabel) currLabel.textContent = code;
        }
      });
    });
  }

  /* ── Header scroll ────────────────────────────────────────── */
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navLinks = document.querySelector(".nav-links");

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 14);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ── Scroll reveal ────────────────────────────────────────── */
  const revealNodes = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8%" }
    );
    revealNodes.forEach((node) => observer.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("in-view"));
  }

  /* ── Cart ─────────────────────────────────────────────────── */
  const STORAGE_KEY = "tcda-project-cart-v1";
  const parseJSON = (value, fallback) => {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const getCart = () => parseJSON(localStorage.getItem(STORAGE_KEY), []);
  const setCart = (cart) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
  };

  const updateCartCount = () => {
    const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll("[data-cart-count]").forEach((node) => {
      node.textContent = String(count);
    });
  };

  updateCartCount();

  document.querySelectorAll(".size-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.closest(".size-row");
      if (!group) return;
      group.querySelectorAll(".size-btn").forEach((b) => b.setAttribute("aria-pressed", "false"));
      button.setAttribute("aria-pressed", "true");
    });
  });

  document.querySelectorAll("[data-add-to-cart]").forEach((button) => {
    button.addEventListener("click", () => {
      const cart = getCart();
      const id = button.getAttribute("data-product-id") || "product";
      const name = button.getAttribute("data-product-name") || "TCDA Product";
      const price = Number(button.getAttribute("data-product-price") || 0);
      const size = document.querySelector(".size-btn[aria-pressed='true']")?.textContent?.trim() || "M";

      const i = cart.findIndex((item) => item.id === id && item.size === size);
      if (i > -1) {
        cart[i].quantity += 1;
      } else {
        cart.push({ id, name, price, size, quantity: 1 });
      }

      setCart(cart);

      const addedLabel = window.TCDAi18n
        ? TCDAi18n.t("cart_added", TCDAi18n.getCurrentLang())
        : "Added";
      const addLabel = window.TCDAi18n
        ? TCDAi18n.t("cart_add", TCDAi18n.getCurrentLang())
        : "Add to Cart";

      button.textContent = addedLabel;
      button.disabled = true;
      setTimeout(() => {
        button.textContent = addLabel;
        button.disabled = false;
      }, 1200);
    });
  });

  document.querySelectorAll("[data-checkout-placeholder]").forEach((button) => {
    button.addEventListener("click", () => {
      const status = document.querySelector("[data-checkout-status]");
      if (status) {
        status.textContent = window.TCDAi18n
          ? TCDAi18n.t("shop_checkout_status", TCDAi18n.getCurrentLang())
          : "Secure checkout placeholder: Stripe/Printful integration prepared for future backend connection.";
      }
    });
  });
});

