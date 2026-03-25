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

  /* ── Printful: live size chart + product data ─────────────── */
  if (window.TCDAPrintful) {
    TCDAPrintful.initProductPage();

    /* Shop grid: populate from Printful if [data-printful-shop-grid] exists */
    const shopGrid = document.querySelector("[data-printful-shop-grid]");
    if (shopGrid) {
      TCDAPrintful.populateShopGrid(shopGrid);
    }
  }

  /* ── Locale panel toggle ──────────────────────────────────── */
  const localeToggle = document.querySelector("[data-locale-toggle]");
  const localePanel = document.querySelector("[data-locale-panel]");

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
        // カート・ショップグリッドの価格も更新するためカスタムイベントを発火
        document.dispatchEvent(new CustomEvent("tcda:currency:changed", { detail: { currency: code } }));
      });
    });
  }

  /* ── モバイル: サイドバーフィルタートグル ──────────────────────── */
  const mobileFilterBtn = document.getElementById("mobile-filter-btn");
  const shopSidebar     = document.getElementById("shop-sidebar");

  if (mobileFilterBtn && shopSidebar) {
    mobileFilterBtn.addEventListener("click", () => {
      const isOpen = shopSidebar.classList.toggle("is-open");
      mobileFilterBtn.setAttribute("aria-expanded", String(isOpen));
      mobileFilterBtn.textContent = isOpen ? "✕ Close" : "☰ Filter";
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
      { threshold: 0.12, rootMargin: "0px 0px -8%" },
    );
    revealNodes.forEach((node) => observer.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("in-view"));
  }

  /* ── Luxury Shop: Filter Toggles ──────────────────────────── */
  document.querySelectorAll("[data-filter-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const groupId = button.getAttribute("data-filter-toggle");
      const optionsEl = document.querySelector(
        `[data-filter-options="${groupId}"]`,
      );
      if (optionsEl) {
        const isExpanded = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!isExpanded));
        optionsEl.toggleAttribute("hidden", isExpanded);
      }
    });
  });

  /* ── Luxury Shop: Search + Sort + Filter ──────────────────── */
  const searchInput = document.querySelector("[data-search-input]");
  const sortSelect = document.querySelector("[data-sort-select]");
  const filterCheckboxes = document.querySelectorAll("[data-filter]");
  const filterReset = document.querySelector(".filter-reset");
  const shopGrid = document.querySelector("[data-printful-shop-grid]");

  function filterAndSortCards() {
    if (!shopGrid) return;

    const cards = Array.from(shopGrid.querySelectorAll(".card, .luxury-card"));
    const searchTerm = (searchInput?.value || "").toLowerCase();
    const sortValue = sortSelect?.value || "featured";
    const activeFilters = {
      category: [],
      price: [],
      segment: [],
    };

    // Collect active filter values
    filterCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        const filterType = checkbox.getAttribute("data-filter");
        const value = checkbox.value;
        if (filterType && !activeFilters[filterType].includes(value)) {
          activeFilters[filterType].push(value);
        }
      }
    });

    // Filter cards
    cards.forEach((card) => {
      let visible = true;

      // Search filter
      if (searchTerm) {
        const cardText = card.textContent.toLowerCase();
        visible = visible && cardText.includes(searchTerm);
      }

      // Category filter
      if (activeFilters.category.length > 0 && visible) {
        const cardMeta = card.querySelector(".meta")?.textContent || "";
        const hasCategory = activeFilters.category.some((cat) =>
          cardMeta.toUpperCase().includes(cat),
        );
        visible = visible && hasCategory;
      }

      // Segment filter (Men's, Women's, Unisex)
      if (activeFilters.segment.length > 0 && visible) {
        const cardMeta = card.querySelector(".meta")?.textContent || "";
        const hasSegment = activeFilters.segment.some((seg) =>
          cardMeta.toUpperCase().includes(seg),
        );
        visible = visible && hasSegment;
      }

      // Price filter (simplified: based on JPY prices in data-price-jpy attributes)
      if (activeFilters.price.length > 0 && visible) {
        const priceEl = card.querySelector("[data-price-jpy]");
        const price = priceEl
          ? parseInt(priceEl.getAttribute("data-price-jpy"), 10)
          : 0;
        const priceInRange = activeFilters.price.some((range) => {
          if (range === "0-5000") return price <= 5000;
          if (range === "5000-15000") return price > 5000 && price <= 15000;
          if (range === "15000-50000") return price > 15000 && price <= 50000;
          if (range === "50000+") return price > 50000;
          return false;
        });
        visible = visible && priceInRange;
      }

      card.style.display = visible ? "" : "none";
      card.style.opacity = visible ? "1" : "0";
      card.style.pointerEvents = visible ? "" : "none";
    });
  }

  // Event listeners
  if (searchInput) {
    searchInput.addEventListener("input", filterAndSortCards);
  }

  filterCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", filterAndSortCards);
  });

  if (filterReset) {
    filterReset.addEventListener("click", () => {
      filterCheckboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });
      if (searchInput) searchInput.value = "";
      filterAndSortCards();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      if (!shopGrid) return;
      const cards = Array.from(
        shopGrid.querySelectorAll(".card, .luxury-card"),
      );
      const visibleCards = cards.filter(
        (card) => card.style.display !== "none",
      );
      const sortValue = sortSelect.value;

      visibleCards.sort((a, b) => {
        if (sortValue === "price-low" || sortValue === "price-high") {
          const priceA = parseInt(
            a
              .querySelector("[data-price-jpy]")
              ?.getAttribute("data-price-jpy") || 0,
            10,
          );
          const priceB = parseInt(
            b
              .querySelector("[data-price-jpy]")
              ?.getAttribute("data-price-jpy") || 0,
            10,
          );
          return sortValue === "price-low" ? priceA - priceB : priceB - priceA;
        }
        return 0;
      });

      shopGrid.innerHTML = "";
      visibleCards.forEach((card) => shopGrid.appendChild(card));

      // Reapply prices in current currency if available
      if (window.TCDACurrency?.applyPrices) {
        window.TCDACurrency.applyPrices(
          window.TCDACurrency.getCurrentCurrency?.() || "JPY",
        );
      }
    });
  }

  /* ── Newsletter Signup ────────────────────────────────────── */
  const newsletterForm = document.querySelector("[data-newsletter-form]");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector("[type='email']");
      const email = emailInput?.value?.trim();
      const submitBtn = newsletterForm.querySelector("button[type='submit']");

      if (email) {
        // Store email in localStorage (simple solution; in production use backend API)
        const emails = JSON.parse(
          localStorage.getItem("tcda_newsletter") || "[]",
        );
        if (!emails.includes(email)) {
          emails.push(email);
          localStorage.setItem("tcda_newsletter", JSON.stringify(emails));
        }

        // Show success feedback
        const origText = submitBtn?.textContent;
        if (submitBtn) {
          submitBtn.textContent = "✓ Subscribed!";
          submitBtn.disabled = true;
          setTimeout(() => {
            submitBtn.textContent = origText;
            submitBtn.disabled = false;
            emailInput.value = "";
          }, 2000);
        }
      }
    });
  }

  /* ── Anchor Links (Smooth Scroll) ────────────────────────── */
  document.querySelectorAll("a[href^='#']").forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (targetId && targetId !== "#") {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          window.history.replaceState({}, "", targetId);
        }
      }
    });
  });
});


