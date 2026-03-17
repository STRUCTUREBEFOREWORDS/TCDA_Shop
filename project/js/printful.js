/**
 * TCDA — Printful API Frontend Integration
 *
 * This module communicates with the /api/printful/ Cloudflare Pages Function,
 * which securely proxies requests to api.printful.com.
 *
 * Features:
 * - Auto-populate product pages with live Printful size charts
 * - Auto-populate shop grid from synced Printful store products
 * - Name-based product matching (no manual ID mapping required)
 * - Static data fallback when API is unavailable
 * - Full multi-language + multi-currency support
 *
 * Public API (window.TCDAPrintful):
 *   getProducts()           → Promise<SyncProduct[]>
 *   getProduct(id)          → Promise<SyncProduct|null>
 *   getSizeChart(catalogId) → Promise<SizeData|null>
 *   initProductPage()       → auto-load size chart for current product page
 *   populateShopGrid(el)    → auto-fill shop grid from Printful products
 */

(function (global) {
  "use strict";

  /* ── 1. Config ────────────────────────────────────────────── */
  const BASE_PATH = detectBasePath();
  const API_BASE = `${BASE_PATH}/api/printful`;
  const STATIC_PRODUCTS_URL = `${BASE_PATH}/data/printful-products.json`;

  function detectBasePath() {
    const isGithubPages = global.location.hostname.endsWith("github.io");
    if (!isGithubPages) return "";

    const parts = global.location.pathname.split("/").filter(Boolean);
    if (!parts.length) return "";
    return `/${parts[0]}`;
  }

  /* ── 2. Low-level fetch ───────────────────────────────────── */
  async function pfFetch(path) {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json;
    } catch (err) {
      console.warn("[TCDAPrintful] fetch failed for", path, "—", err.message);
      return null;
    }
  }

  /* ── 3. API helpers ───────────────────────────────────────── */

  /** List all synced store products. */
  async function getProducts() {
    const data = await pfFetch("/store/products?limit=100");
    if (data && Array.isArray(data.result)) {
      return data.result;
    }

    const fallback = await fetchStaticProducts();
    return fallback;
  }

  /** Get full detail (variants, sizes) for one synced product. */
  async function getProduct(id) {
    const data = await pfFetch(`/store/products/${id}`);
    return data?.result ?? null;
  }

  /** Static fallback for hosts without server functions (e.g. GitHub Pages). */
  async function fetchStaticProducts() {
    try {
      const res = await fetch(STATIC_PRODUCTS_URL, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (Array.isArray(json?.result)) return json.result;
      if (Array.isArray(json?.products)) return json.products;
      return [];
    } catch (err) {
      console.warn("[TCDAPrintful] static fallback fetch failed —", err.message);
      return [];
    }
  }

  /**
   * Get size chart for a Printful catalog product.
   * catalogId = the numeric Printful catalog product ID (from variant.product.product_id).
   */
  async function getSizeChart(catalogId) {
    if (!catalogId) return null;
    const data = await pfFetch(`/products/${catalogId}/sizes`);
    return data?.result ?? null;
  }

  /* ── 4. Render size chart ─────────────────────────────────── */

  /**
   * Overwrite the static <table class="size-chart"> with live Printful data.
   * @param {HTMLTableElement} tableEl  - The existing .size-chart element
   * @param {object}           sizeData - Result from getSizeChart()
   * @param {string}           lang     - Current language code (for unit preference)
   * @returns {boolean} true if rendered successfully
   */
  function renderSizeChart(tableEl, sizeData, lang) {
    if (!tableEl || !sizeData || !Array.isArray(sizeData.size_tables) || !sizeData.size_tables.length) {
      return false;
    }

    // Prefer centimetre table for ja/zh/ar, inches for en/es
    const useCm = ["ja", "zh", "ar"].includes(lang);
    const table = sizeData.size_tables.find((t) =>
      useCm ? t.unit === "cm" : t.unit === "inches"
    ) ?? sizeData.size_tables[0];

    if (!table || !Array.isArray(table.measurements) || !Array.isArray(table.sizes)) return false;

    const thead = tableEl.querySelector("thead tr");
    const tbody = tableEl.querySelector("tbody");
    if (!thead || !tbody) return false;

    const unit = table.unit === "cm" ? " cm" : '"';

    // Header row: Size + each measurement type label
    thead.innerHTML =
      `<th>Size</th>` +
      table.measurements.map((m) => `<th>${esc(m.type_label)}</th>`).join("");

    // Data rows
    tbody.innerHTML = table.sizes
      .map((size) => {
        const cells = table.measurements.map((m) => {
          const val = Array.isArray(size.values)
            ? size.values.find((v) => v.ref === m.ref)
            : null;
          return val ? `<td>${esc(val.value)}${unit}</td>` : "<td>—</td>";
        });
        return `<tr><td>${esc(size.size_label ?? size.name)}</td>${cells.join("")}</tr>`;
      })
      .join("");

    // Mark as live data for CSS targeting
    tableEl.dataset.source = "printful";

    return true;
  }

  /* ── 5. Product page auto-init ────────────────────────────── */

  /**
   * Detect the current product page's Printful catalog product ID,
   * fetch the live size chart, and inject it into .size-chart.
   *
   * ID resolution order:
   *  1. [data-printful-catalog-id] attribute on the article/.product-layout
   *  2. Match current page product name against Printful store products
   */
  async function initProductPage() {
    const tableEl = document.querySelector(".size-chart");
    if (!tableEl) return;

    const lang = document.documentElement.lang || "en";

    // --- Try explicit catalog ID first ---
    let catalogId = tableEl.dataset.printfulCatalogId
      || document.querySelector("[data-printful-catalog-id]")?.dataset.printfulCatalogId;

    // --- Auto-match by product name ---
    if (!catalogId) {
      const heading = document.querySelector("h1");
      const productName = heading?.textContent?.trim() ?? "";
      if (productName) {
        const products = await getProducts();
        const match = products.find(
          (p) => p.name?.toLowerCase().includes(productName.toLowerCase().slice(0, 12))
        );
        if (match) {
          // Get the first variant's catalog product ID
          const detail = await getProduct(match.id);
          const variant = detail?.sync_variants?.[0] ?? detail?.variants?.[0];
          catalogId = variant?.product?.product_id ?? variant?.catalog_product_id;

          // Optionally store sync ID for cart/checkout
          const article = document.querySelector("[data-product-id]");
          if (article && match.id) {
            article.dataset.printfulSyncId = match.id;
          }
        }
      }
    }

    if (!catalogId) {
      console.info("[TCDAPrintful] Could not resolve catalog ID — static size chart retained.");
      return;
    }

    const sizeData = await getSizeChart(catalogId);
    if (sizeData) {
      const rendered = renderSizeChart(tableEl, sizeData, lang);
      if (rendered) {
        console.info("[TCDAPrintful] Live size chart loaded (catalog ID:", catalogId, ")");
      }
    }
  }

  /* ── 6. Shop grid auto-populate ──────────────────────────── */

  /**
   * Fetch synced Printful store products and inject product cards
   * into the provided container element.
   * @param {HTMLElement} container - The products grid container
   */
  async function populateShopGrid(container) {
    if (!container) return;

    const products = await getProducts();
    if (!products.length) {
      console.info("[TCDAPrintful] No Printful products found — static grid retained.");
      return;
    }

    const currency = window.TCDACurrency?.getCurrentCurrency?.() ?? "JPY";
    const fragment = document.createDocumentFragment();

    for (const p of products) {
      const card = document.createElement("article");
      card.className = "card";
      card.setAttribute("data-reveal", "");

      const img = p.thumbnail_url
        ? `<img src="${esc(p.thumbnail_url)}" alt="${esc(p.name)}" loading="lazy" decoding="async" />`
        : `<div class="media-placeholder"></div>`;

      // Retail price from first variant (Printful stores it as a string like "74.00")
      const retailPrice = parseFloat(p.sync_variants?.[0]?.retail_price ?? "0");
      // Printful returns prices in the store's default currency; convert to display
      const priceJpy = Math.round(retailPrice);
      const priceDisplay = window.TCDACurrency?.formatPrice?.(priceJpy, currency)
        ?? `${currency} ${priceJpy.toLocaleString()}`;

      card.innerHTML =
        `<a href="products/${esc(String(p.id))}.html" class="card-link" aria-label="${esc(p.name)}">` +
        `<div class="media">${img}</div>` +
        `</a>` +
        `<div class="card-body">` +
        `<h3>${esc(p.name)}</h3>` +
        `<p class="price" data-price-display data-price-jpy="${priceJpy}">${esc(priceDisplay)}</p>` +
        `</div>`;

      fragment.appendChild(card);
    }

    container.innerHTML = "";
    container.appendChild(fragment);

    // Re-apply prices in current currency
    window.TCDACurrency?.applyPrices?.(currency);
  }

  /* ── 7. Escape helper ─────────────────────────────────────── */
  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* ── 8. Public API ────────────────────────────────────────── */
  global.TCDAPrintful = {
    getProducts,
    getProduct,
    getSizeChart,
    renderSizeChart,
    initProductPage,
    populateShopGrid,
  };
})(window);
