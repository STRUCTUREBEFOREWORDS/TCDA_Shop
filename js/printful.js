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

  /** Get Printful catalog product metadata (material description, etc). */
  async function getCatalogProduct(catalogId) {
    if (!catalogId) return null;
    const data = await pfFetch(`/products/${catalogId}`);
    return data?.result?.product ?? data?.result ?? null;
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
    const params = new URLSearchParams(global.location.search);
    const syncProductId = params.get("printfulId") || params.get("productId");
    let detail = null;
    let firstVariant = null;

    // --- Try explicit catalog ID first ---
    let catalogId =
      tableEl.dataset.printfulCatalogId ||
      document.querySelector("[data-printful-catalog-id]")?.dataset
        .printfulCatalogId;

    // --- Resolve by explicit synced product ID in URL ---
    if (syncProductId) {
      detail = await getProduct(syncProductId);
      firstVariant =
        detail?.sync_variants?.[0] ?? detail?.variants?.[0] ?? null;
      if (!catalogId) {
        catalogId =
          firstVariant?.product?.product_id ?? firstVariant?.catalog_product_id;
      }
    }

    // --- Auto-match by product name ---
    if (!catalogId && !detail) {
      const heading = document.querySelector("h1");
      const productName = heading?.textContent?.trim() ?? "";
      if (productName) {
        const products = await getProducts();
        const match = products.find((p) =>
          p.name
            ?.toLowerCase()
            .includes(productName.toLowerCase().slice(0, 12)),
        );
        if (match) {
          // Get the first variant's catalog product ID
          detail = await getProduct(match.id);
          firstVariant =
            detail?.sync_variants?.[0] ?? detail?.variants?.[0] ?? null;
          catalogId =
            firstVariant?.product?.product_id ??
            firstVariant?.catalog_product_id;

          // Optionally store sync ID for cart/checkout
          const article = document.querySelector("[data-product-id]");
          if (article && match.id) {
            article.dataset.printfulSyncId = match.id;
          }
        }
      }
    }

    // Enrich product page content when detail data is available.
    if (detail?.sync_product) {
      const syncProduct = detail.sync_product;
      const heroImg = document.querySelector(".product-hero img");
      const heading = document.querySelector("h1");
      const article = document.querySelector("[data-product-id]");
      const addBtn = document.querySelector("[data-add-to-cart]");
      const priceEl = document.querySelector("[data-price-display]");

      if (heading && syncProduct.name) heading.textContent = syncProduct.name;
      if (heroImg && syncProduct.thumbnail_url) {
        heroImg.src = syncProduct.thumbnail_url;
        heroImg.alt = `${syncProduct.name || "Printful product"} hero image`;
      }

      const retailPrice = parseFloat(
        detail?.sync_variants?.[0]?.retail_price ?? "0",
      );
      const priceJpy = Math.round(retailPrice);
      const currency = window.TCDACurrency?.getCurrentCurrency?.() ?? "JPY";
      if (priceEl) {
        priceEl.setAttribute("data-price-jpy", String(priceJpy));
        const formatted =
          window.TCDACurrency?.formatPrice?.(priceJpy, currency) ??
          `${currency} ${priceJpy.toLocaleString()}`;
        priceEl.textContent = formatted;
      }

      if (article) {
        article.dataset.productId = `printful-${syncProduct.id}`;
        article.dataset.productName = syncProduct.name || "Printful Product";
        article.dataset.printfulSyncId = String(syncProduct.id);
      }

      if (addBtn) {
        addBtn.setAttribute("data-product-id", `printful-${syncProduct.id}`);
        addBtn.setAttribute(
          "data-product-name",
          syncProduct.name || "Printful Product",
        );
        addBtn.setAttribute("data-product-price", String(priceJpy));
      }

      // Rebuild size buttons from synced variants when possible.
      const sizeRow = document.querySelector(".size-row");
      if (
        sizeRow &&
        Array.isArray(detail.sync_variants) &&
        detail.sync_variants.length
      ) {
        const sizes = [
          ...new Set(
            detail.sync_variants
              .map((v) =>
                String(v?.name ?? "")
                  .split("/")
                  .pop()
                  ?.trim(),
              )
              .filter(Boolean),
          ),
        ];
        if (sizes.length) {
          sizeRow.innerHTML = sizes
            .map(
              (s, i) =>
                `<button class="size-btn" type="button" aria-pressed="${i === 0 ? "true" : "false"}">${esc(s)}</button>`,
            )
            .join("");
        }
      }
    }

    // Replace material info with Printful catalog description bullets.
    const materialList = document.querySelector(".detail-list");
    if (materialList && catalogId) {
      const catalog = await getCatalogProduct(catalogId);
      const description = String(catalog?.description ?? "");
      let lines = description
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("- "))
        .map((line) => line.replace(/^-\s*/, ""));

      if (!lines.length && description) {
        lines = description
          .split(".")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 4);
      }

      if (!lines.length) {
        lines = ["Made to order by Printful", `Catalog ID: ${catalogId}`];
      }

      materialList.innerHTML = lines
        .slice(0, 8)
        .map((line) => `<li>${esc(line)}</li>`)
        .join("");
    }

    if (!catalogId) {
      console.info(
        "[TCDAPrintful] Could not resolve catalog ID — static size chart retained.",
      );
      return;
    }

    const sizeData = await getSizeChart(catalogId);
    if (sizeData) {
      const rendered = renderSizeChart(tableEl, sizeData, lang);
      if (rendered) {
        console.info(
          "[TCDAPrintful] Live size chart loaded (catalog ID:",
          catalogId,
          ")",
        );
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
      card.classList.add("in-view");

      const categoryLabel = [p.category, p.segment].filter(Boolean).join(" / ");

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
        `<a href="products/chroma-noise-jacket.html?printfulId=${encodeURIComponent(String(p.id))}" class="card-link" aria-label="${esc(p.name)}">` +
        `<div class="media">${img}</div>` +
        `</a>` +
        `<div class="card-body">` +
        `<p class="meta">${esc(categoryLabel || "PRODUCT")}</p>` +
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
    getCatalogProduct,
    getSizeChart,
    renderSizeChart,
    initProductPage,
    populateShopGrid,
  };
})(window);
